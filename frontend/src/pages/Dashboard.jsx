import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [slots, setSlots] = useState([]);
  // --- TRACK RESERVATION STATE ---
  const [reservedSlot, setReservedSlot] = useState(null); 
  const navigate = useNavigate();

  // --- GET LOGGED IN USER ---
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    // 1. Redirect to login if no user found
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchData = () => {
      axios.get('http://localhost:5000/api/parking-layout')
        .then(res => {
          setSlots(res.data);

          // --- AUTO-DETECT PARKING LOGIC ---
          if (reservedSlot) {
            const target = res.data.find(s => s.name === reservedSlot);
            // If that slot is now occupied (Sensor detected car)
            if (target && target.occupied) {
              alert(`🚗 Welcome ${user.name}! Car Detected in ${reservedSlot}. Timer Started.`);
              setReservedSlot(null); // Clear reservation
            }
          }
        })
        .catch(err => console.error(err));
    };

    fetchData(); // Initial fetch
    const interval = setInterval(fetchData, 2000); // Poll every 2s

    return () => clearInterval(interval);
  }, [reservedSlot, navigate, user]); // Added user and navigate to dependencies

  // Helper to safely get slot data
  const getSlot = (index) => slots[index] || { name: 'Loading...', occupied: false, type: 'fake' };

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem('user'); // Clear session
    navigate('/login'); // Go to login
  };

  // --- HANDLE PARK NOW (UPDATED) ---
  const handleParkNow = () => {
    // Find the first REAL slot that is FREE
    const freeSlot = slots.find(s => s.type === 'real' && !s.occupied);

    if (freeSlot) {
      setReservedSlot(freeSlot.name); // Enter "Navigation Mode"
      
      // TELL BACKEND TO RESERVE THIS SLOT FOR ME
      axios.post('http://localhost:5000/api/reserve', {
        slot: freeSlot.name,
        phone: user.phone_number
      });

    } else {
      alert("❌ All Real Slots are Full!\nPlease wait for a car to leave.");
    }
  };

  // --- HANDLE CANCEL (UPDATED) ---
  const handleCancel = () => {
    // TELL BACKEND TO CANCEL
    axios.post('http://localhost:5000/api/cancel-reserve', { slot: reservedSlot });
    
    setReservedSlot(null); // Reset UI
    alert("❌ Parking Request Canceled.");
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={{display:'flex', alignItems:'center', gap:'10px'}}>
            <h2 style={{ margin: 0 }}>🅿️ Smart Park</h2>
            {/* Show User Name */}
            <span style={{fontSize:'0.9rem', color:'#7f8c8d'}}>Welcome, {user?.name}</span>
        </div>

        {/* --- DYNAMIC CENTER SECTION --- */}
        <div style={{ textAlign: 'center' }}>
          {!reservedSlot ? (
            // SHOW PARK NOW BUTTON
            <button style={styles.parkNowBtn} onClick={handleParkNow}>
              🚗 PARK NOW
            </button>
          ) : (
            // SHOW NAVIGATION BOX WITH CANCEL BUTTON
            <div style={styles.navBox}>
              <span style={{color: 'yellow', fontSize: '1.1rem'}}>
                Go to Slot <strong>{reservedSlot}</strong>
              </span>
              <button style={styles.cancelBtn} onClick={handleCancel}>
                ✕ Cancel
              </button>
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '15px' }}>
          <button style={styles.navBtn} onClick={() => navigate('/logs')}>
            📜 Logs
          </button>
          <button style={styles.cctvBtn} onClick={() => navigate('/cctv')}>
            🎥 CCTV
          </button>
          <button style={styles.profileBtn} onClick={() => navigate('/profile')}>
            My Profile
          </button>
          {/* --- NEW LOGOUT BUTTON --- */}
          <button style={styles.logoutBtn} onClick={handleLogout}>
            🚪 Logout
          </button>
        </div>
      </nav>

      <div style={styles.lotContainer}>
        
        {/* --- LEFT SIDE (Lane 1) --- */}
        <div style={styles.column}>
          {/* Pass 'highlight' prop if this slot is reserved */}
          <Slot data={getSlot(0)} highlight={reservedSlot === 'A1'} /> 
          <Slot data={getSlot(2)} /> 
          <Slot data={getSlot(4)} /> 
          <Slot data={getSlot(6)} /> 
        </div>

        {/* --- ROAD --- */}
        <div style={styles.road}>
          <div style={styles.dashedLine}></div>
          <span style={styles.roadLabel}>DRIVE WAY</span>
        </div>

        {/* --- RIGHT SIDE (Lane 2) --- */}
        <div style={styles.column}>
          <Slot data={getSlot(1)} highlight={reservedSlot === 'A2'} /> 
          <Slot data={getSlot(3)} /> 
          <Slot data={getSlot(5)} /> 
          <Slot data={getSlot(7)} /> 
        </div>

      </div>

      <div style={styles.legend}>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
          <div style={{width:20, height:20, background:'#ff7675', border:'2px solid #d63031', borderRadius:4}}></div>
          <span>Occupied</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
           <div style={{width:20, height:20, background:'#55efc4', border:'2px solid #00b894', borderRadius:4}}></div>
          <span>Available</span>
        </div>
        {/* Added Legend for Reserved */}
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
           <div style={{width:20, height:20, background:'#f1c40f', border:'2px solid #f39c12', borderRadius:4}}></div>
          <span>Reserved</span>
        </div>
      </div>
    </div>
  );
}

// Slot Component (Unchanged)
const Slot = ({ data, highlight }) => (
  <div style={{
    ...styles.slot,
    backgroundColor: data.occupied ? '#ff7675' : (highlight ? '#f1c40f' : '#55efc4'), 
    borderColor: data.occupied ? '#d63031' : (highlight ? '#f39c12' : '#00b894'),
    animation: highlight ? 'pulse 1s infinite' : 'none'
  }}>
    <h3 style={{ margin: '0', fontSize: '1.4rem' }}>{data.name}</h3>
    <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
      {data.occupied ? 'OCCUPIED' : (highlight ? 'RESERVED' : 'FREE')}
    </span>
    {data.type === 'real' && (
      <span style={styles.sensorTag}>📡 Live Sensor</span>
    )}
    
    <style>{`
      @keyframes pulse {
        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(241, 196, 15, 0.7); }
        70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(241, 196, 15, 0); }
        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(241, 196, 15, 0); }
      }
    `}</style>
  </div>
);

// CSS Styles
const styles = {
  page: { 
    padding: '20px', 
    minHeight: '100vh', 
    background: '#ecf0f1',
    fontFamily: 'Segoe UI, sans-serif'
  },
  navbar: { 
    display: 'flex', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: '30px', 
    background: 'white', 
    padding: '15px 30px', 
    borderRadius: '10px', 
    boxShadow: '0 4px 15px rgba(0,0,0,0.05)' 
  },
  profileBtn: { 
    background: '#2c3e50', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '5px', 
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  cctvBtn: { 
    background: '#e74c3c', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold'
  },
  
  lotContainer: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '40px', 
    background: '#34495e', 
    padding: '40px', 
    borderRadius: '15px', 
    maxWidth: '800px', 
    margin: '0 auto',
    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
    border: '5px solid #2c3e50'
  },
  column: { 
    display: 'flex', 
    flexDirection: 'column', 
    gap: '20px' 
  },
  
  road: { 
    width: '140px', 
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    borderLeft: '4px dashed #f1c40f', 
    borderRight: '4px dashed #f1c40f', 
    position: 'relative',
    background: '#3a5369' 
  },
  dashedLine: { 
    height: '100%', 
    width: '0px', 
    borderLeft: '4px dashed rgba(255,255,255,0.3)' 
  },
  roadLabel: { 
    position: 'absolute', 
    transform: 'rotate(-90deg)', 
    color: 'rgba(255,255,255,0.15)', 
    fontSize: '2.5rem', 
    fontWeight: '900', 
    letterSpacing: '8px',
    whiteSpace: 'nowrap'
  },
  
  slot: {
    width: '130px', 
    height: '110px', 
    borderRadius: '10px', 
    border: '3px solid',
    display: 'flex', 
    flexDirection: 'column', 
    justifyContent: 'center', 
    alignItems: 'center',
    boxShadow: '0 4px 6px rgba(0,0,0,0.2)', 
    color: '#2d3436',
    transition: 'all 0.3s ease'
  },
  sensorTag: { 
    fontSize: '0.6rem', 
    background: 'white', 
    color: '#333', 
    padding: '2px 6px', 
    borderRadius: '4px', 
    marginTop: '5px',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  legend: { 
    display: 'flex', 
    justifyContent: 'center', 
    gap: '30px', 
    marginTop: '30px', 
    fontWeight: 'bold',
    color: '#555'
  },

  // --- STYLES FOR FEATURES ---
  parkNowBtn: {
    background: '#27ae60', 
    color: 'white',
    border: 'none',
    padding: '12px 30px',
    borderRadius: '30px',
    fontSize: '1.2rem',
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)',
    transition: 'transform 0.2s'
  },
  navBtn: {
    background: '#34495e',
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold'
  },
  
  // --- NAVIGATION BOX STYLES ---
  navBox: { 
    background: '#2c3e50', 
    padding: '10px 25px', 
    borderRadius: '30px', 
    display: 'flex', 
    alignItems: 'center', 
    gap: '20px', 
    border: '2px solid #f1c40f', 
    boxShadow: '0 0 15px rgba(241, 196, 15, 0.5)' 
  },
  cancelBtn: { 
    background: '#e74c3c', // Red
    color: 'white', 
    border: 'none', 
    padding: '8px 15px', 
    borderRadius: '20px', 
    cursor: 'pointer', 
    fontWeight: 'bold', 
    fontSize: '0.9rem',
    transition: '0.3s'
  },
  
  // --- NEW: LOGOUT BUTTON STYLE ---
  logoutBtn: {
    background: '#c0392b', // Dark Red
    color: 'white',
    border: 'none',
    padding: '10px 20px',
    borderRadius: '5px',
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: '0.3s'
  }
};

export default Dashboard;