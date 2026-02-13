const mongoose = require('mongoose');

const ParkingLogSchema = new mongoose.Schema({
  slot_id: String,
  // --- NEW FIELD: LINK TO USER ---
  user_phone: String, 
  
  entry_time: { type: Date, default: Date.now },
  exit_time: Date,
  duration_minutes: { type: Number, default: 0 },
  cost: { type: Number, default: 0 },
  status: { type: String, enum: ['Parked', 'Completed', 'Cancelled'], default: 'Parked' },
  payment_status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' }
});

module.exports = mongoose.model('ParkingLog', ParkingLogSchema);