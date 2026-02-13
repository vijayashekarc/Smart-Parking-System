require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const axios = require('axios');
const User = require('./models/User');
const ParkingLog = require('./models/ParkingLog');

const app = express();
app.use(express.json());
app.use(cors());

// --- Configuration ---
const PORT = process.env.PORT || 5000;
// Note: Ensure your .env file has MONGO_URI=mongodb://127.0.0.1:27017/smart_parking
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_parking';

// --- MongoDB Connection ---
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB Error:", err));

// --- State Tracking Memory ---
let lastState = { slot1: false, slot2: false };
let reservations = {}; // Stores { "A1": "9876543210" }

// --- CORE LOGIC: Handle Entry/Exit ---
const updateParkingLog = async (slotName, isOccupied) => {
  
  // SCENARIO 1: Car Arrived (Free -> Occupied)
  if (isOccupied) {
    console.log(`🚗 Car parked in ${slotName}.`);
    
    // Check if a user reserved this slot, otherwise "Guest"
    const userPhone = reservations[slotName] || "Guest"; 
    
    const newLog = new ParkingLog({ 
      slot_id: slotName, 
      status: 'Parked',
      user_phone: userPhone 
    });
    
    await newLog.save();
    
    // Clear the reservation now that they are parked
    if (reservations[slotName]) {
        console.log(`✅ Reservation fulfilled for User ${userPhone}`);
        delete reservations[slotName];
    }
    
  } 
  // SCENARIO 2: Car Left (Occupied -> Free)
  else {
    console.log(`👋 Car left ${slotName}. Calculating Bill...`);
    
    // Find the active 'Parked' session for this slot
    const activeSession = await ParkingLog.findOne({ 
        slot_id: slotName, 
        status: 'Parked' 
    }).sort({ entry_time: -1 });

    if (activeSession) {
      // Close the session
      activeSession.exit_time = new Date();
      activeSession.status = 'Completed';

      // Calculate Duration (Minutes) & Cost
      const diffMs = activeSession.exit_time - activeSession.entry_time;
      const minutes = Math.ceil(diffMs / (1000 * 60)); // Round up to nearest minute
      
      activeSession.duration_minutes = minutes;
      activeSession.cost = minutes * 15; // ₹15 per minute

      await activeSession.save();
      console.log(`💰 Bill for ${slotName}: ₹${activeSession.cost} (${minutes} mins)`);
    } else {
        console.log("⚠️ No active session found to close.");
    }
  }
};

// --- API: RESERVE SLOT ---
app.post('/api/reserve', (req, res) => {
  const { slot, phone } = req.body;
  reservations[slot] = phone; 
  console.log(`🔒 Slot ${slot} reserved for User ${phone}`);
  res.json({ success: true });
});

// --- API: CANCEL RESERVATION ---
app.post('/api/cancel-reserve', (req, res) => {
  const { slot } = req.body;
  delete reservations[slot];
  console.log(`🔓 Reservation cancelled for Slot ${slot}`);
  res.json({ success: true });
});

// --- API: PARKING STATUS (Main Loop) ---
app.get('/api/parking-layout', async (req, res) => {
  
  // 1. Initialize Default State (Free)
  let s1_status = false;
  let s2_status = false;

  try {
    const esp_url = process.env.ESP_IP || "http://192.168.1.105"; 
    // Timeout is important so backend doesn't hang if ESP is off
    const response = await axios.get(`${esp_url}/api/status`, { timeout: 2000 });

    const raw = response.data;
    // console.log("📡 FROM ESP:", raw); 

    // 2. FORCE BOOLEAN CONVERSION (Crucial Step)
    s1_status = (String(raw.slot1_occupied) === "true" || raw.slot1_occupied === true || raw.slot1_occupied === 1);
    s2_status = (String(raw.slot2_occupied) === "true" || raw.slot2_occupied === true || raw.slot2_occupied === 1);
    
    // 3. CHECK FOR STATE CHANGES (The "Edge Detection")
    
    // Slot 1 Logic
    if (s1_status !== lastState.slot1) {
      await updateParkingLog("A1", s1_status);
      lastState.slot1 = s1_status;
    }

    // Slot 2 Logic
    if (s2_status !== lastState.slot2) {
      await updateParkingLog("A2", s2_status);
      lastState.slot2 = s2_status;
    }
    
  } catch (error) {
    // If ESP is off, we assume sensors are "Free" to avoid stuck "Occupied" states
    // console.log("⚠️ ESP Disconnected");
  }

  // 4. Construct Layout for Frontend
  const parkingLot = [
    { id: 1, name: "A1", occupied: s1_status, type: "real" },
    { id: 2, name: "A2", occupied: s2_status, type: "real" },
    // Fake Slots
    { id: 3, name: "B1", occupied: false, type: "fake" },
    { id: 4, name: "B2", occupied: true,  type: "fake" },
    { id: 5, name: "C1", occupied: false, type: "fake" },
    { id: 6, name: "C2", occupied: false, type: "fake" },
    { id: 7, name: "D1", occupied: true,  type: "fake" },
    { id: 8, name: "D2", occupied: false, type: "fake" },
  ];

  res.json(parkingLot);
});


// --- API: HISTORY (Filter by User) ---
app.get('/api/history', async (req, res) => {
  const { phone } = req.query; 
  
  const query = { status: 'Completed' };
  if (phone) query.user_phone = phone; // Filter only my logs
  
  const history = await ParkingLog.find(query).sort({ exit_time: -1 });
  res.json(history);
});

// --- API: PROCESS PAYMENT ---
app.post('/api/pay', async (req, res) => {
  const { log_id } = req.body;
  try {
    await ParkingLog.findByIdAndUpdate(log_id, { payment_status: 'Paid' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false });
  }
});


// --- API: SIGNUP ---
app.post('/api/signup', async (req, res) => {
  const { name, phone_number, vehicle_no, vehicle_type, user_type } = req.body;
  try {
    const newUser = new User({
        name, phone_number, vehicle_no, vehicle_type, user_type,
        qr_code_data: `${vehicle_no}_${Date.now()}`
    });
    await newUser.save();
    res.json({ message: "User Created", user: newUser });
  } catch(err) {
    res.status(400).json({ error: "Error creating user" });
  }
});

// --- API: LOGIN ---
app.post('/api/login', async (req, res) => {
  const user = await User.findOne({ phone_number: req.body.phone_number });
  if(user) res.json(user);
  else res.status(404).json({ message: "User not found" });
});

app.listen(PORT, () => console.log(`🚀 Backend running on port ${PORT}`));