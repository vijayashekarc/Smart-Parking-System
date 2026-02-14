import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Dashboard() {
  const [slots, setSlots] = useState([]);
  const [reservedSlot, setReservedSlot] = useState(null); 
  const [mySession, setMySession] = useState(null); // Stores just the slot name now
  
  // --- FAKE TIMER STATE ---
  const [seconds, setSeconds] = useState(0); // Simple counter

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    if (!user) { navigate('/login'); return; }

    const fetchData = () => {
      // 1. Fetch Layout
      axios.get('http://localhost:5000/api/parking-layout')
        .then(res => {
          setSlots(res.data);
          if (reservedSlot) {
            const target = res.data.find(s => s.name === reservedSlot);
            if (target && target.occupied) {
              setReservedSlot(null); 
            }
          }
        })
        .catch(err => console.error(err));

      // 2. Fetch My Active Session (To trigger Timer)
      axios.get(`http://localhost:5000/api/history?phone=${user.phone_number}`)
        .then(res => {
          // Find the FIRST log that is 'Parked'
          const activeLog = res.data.find(log => log.status === 'Parked');
          
          if (activeLog) {
            // Only update session if it wasn't already set (prevents timer reset on every poll)
            setMySession(prev => {
                if (!prev) return { slot: activeLog.slot_id }; 
                return prev;
            });
          } else {
            setMySession(null);
            setSeconds(0); // Reset timer if no session found
          }
        })
        .catch(err => console.error(err));
    };

    fetchData(); 
    const interval = setInterval(fetchData, 2000); 
    return () => clearInterval(interval);
  }, [reservedSlot, navigate, user]); 


  // --- FAKE TIMER LOGIC (Just counts up) ---
  useEffect(() => {
    let interval = null;
    
    if (mySession) {
      interval = setInterval(() => {
        setSeconds(prev => prev + 1); // Just add 1 second
      }, 1000);
    } else {
      setSeconds(0);
    }

    return () => clearInterval(interval);
  }, [mySession]);

  // Helper to Format MM:SS
  const formatTime = (totalSeconds) => {
    const m = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
    const s = (totalSeconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };


  // Helper
  const getSlot = (index) => slots[index] || { name: 'Loading...', occupied: false, type: 'fake' };

  const handleLogout = () => { localStorage.removeItem('user'); navigate('/login'); };

  const handleParkNow = () => {
    const freeSlot = slots.find(s => s.type === 'real' && !s.occupied);
    if (freeSlot) {
      setReservedSlot(freeSlot.name); 
      axios.post('http://localhost:5000/api/reserve', { slot: freeSlot.name, phone: user.phone_number });
    } else {
      alert("❌ All Real Slots are Full!");
    }
  };

  const handleCancel = () => {
    axios.post('http://localhost:5000/api/cancel-reserve', { slot: reservedSlot });
    setReservedSlot(null); 
    alert("❌ Parking Request Canceled.");
  };

  return (
    <div style={styles.page}>
      
      {/* Mobile Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          .navbar { flex-direction: column !important; gap: 15px !important; padding: 15px !important; }
          .nav-buttons { flex-wrap: wrap; justify-content: center; width: 100%; }
          .lot-container { padding: 20px !important; gap: 10px !important; }
          .slot { width: 90px !important; height: 70px !important; }
          .slot h3 { font-size: 1rem !important; }
          .road { width: 80px !important; }
          .road-label { font-size: 1.5rem !important; }
        }
      `}</style>

      <nav style={styles.navbar} className="navbar">
        <div style={{display:'flex', flexDirection:'column'}}>
            <h2 style={{ margin: 0 }}>🅿️ Park Sync</h2>
        </div>
        <div style={{display:'flex', flexDirection:'column'}}>
          <h2 style={{fontSize:'1.1rem', color:'#000000', textTransform:'uppercase'}}>
              Welcome, {user?.name}
          </h2>
        </div>
        

        
        
        <div style={styles.navButtons} className="nav-buttons">
          <button style={styles.navBtn} onClick={() => navigate('/logs')}>Logs</button>
          <button style={styles.cctvBtn} onClick={() => navigate('/cctv')}>CCTV</button>
          <button style={styles.profileBtn} onClick={() => navigate('/profile')}>Profile</button>
          <button style={styles.logoutBtn} onClick={handleLogout}>Logout</button>
        </div>
      </nav>

      {/* --- DYNAMIC CENTER SECTION --- */}
        <div style={{ textAlign: 'center', flex: 1, minWidth: '200px' }}>
          
          {/* CASE 1: RESERVATION MODE */}
          {reservedSlot ? (
            <div style={styles.navBox}>
              <span style={{color: 'yellow', fontSize: '1rem'}}>Go to <strong>{reservedSlot}</strong></span>
              <button style={styles.cancelBtn} onClick={handleCancel}>✕</button>
            </div>
          ) 
          
          /* CASE 2: ACTIVE SESSION (SHOW FAKE TIMER) */
          : mySession ? (
            <div style={styles.timerBox}>
              <span style={{fontSize:'0.8rem', color:'#bdc3c7'}}>PARKED AT {mySession.slot}</span>
              <div style={{fontSize:'1.5rem', fontWeight:'bold', color:'#2ecc71'}}>
                ⏱️ {formatTime(seconds)}
              </div>
            </div>
          )

          /* CASE 3: DEFAULT (SHOW BUTTON) */
          : (
            <button style={styles.parkNowBtn} onClick={handleParkNow}>
              🚗 PARK NOW
            </button>
          )}

        </div>
        <h1></h1>

      {/* LOT CONTAINER */}
      <div style={styles.lotContainer} className="lot-container">
        
        <div style={styles.column}>
          <Slot data={getSlot(0)} highlight={reservedSlot === 'A1'} myCar={mySession?.slot === 'A1'} /> 
          <Slot data={getSlot(2)} /> 
          <Slot data={getSlot(4)} /> 
          <Slot data={getSlot(6)} /> 
        </div>

        <div style={styles.road} className="road">
          <div style={styles.dashedLine}></div>
          <span style={styles.roadLabel} className="road-label">DRIVE WAY</span>
        </div>

        <div style={styles.column}>
          <Slot data={getSlot(1)} highlight={reservedSlot === 'A2'} myCar={mySession?.slot === 'A2'} /> 
          <Slot data={getSlot(3)} /> 
          <Slot data={getSlot(5)} /> 
          <Slot data={getSlot(7)} /> 
        </div>

      </div>

      <div style={styles.legend}>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
          <div style={{width:20, height:20, background:'#ff7675', border:'2px solid #d63031', borderRadius:4}}></div><span>Occupied</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
           <div style={{width:20, height:20, background:'#55efc4', border:'2px solid #00b894', borderRadius:4}}></div><span>Available</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
           <div style={{width:20, height:20, background:'#f1c40f', border:'2px solid #f39c12', borderRadius:4}}></div><span>Reserved</span>
        </div>
        <div style={{display:'flex', alignItems:'center', gap:'5px'}}>
           <div style={{width:20, height:20, background:'#3498db', border:'2px solid #2980b9', borderRadius:4}}></div><span>My Car</span>
        </div>
      </div>
    </div>
  );
}

// Slot Component (Unchanged)
const Slot = ({ data, highlight, myCar }) => {
  let bg = '#55efc4';
  let border = '#00b894';
  let statusText = 'FREE';

  if (myCar) {
    bg = '#3498db'; border = '#2980b9'; statusText = 'MY CAR';
  } else if (data.occupied) {
    bg = '#ff7675'; border = '#d63031'; statusText = 'BUSY';
  } else if (highlight) {
    bg = '#f1c40f'; border = '#f39c12'; statusText = 'RESERVED';
  }

  return (
    <div className="slot" style={{
      ...styles.slot,
      backgroundColor: bg, 
      borderColor: border,
      animation: highlight ? 'pulse 1s infinite' : 'none'
    }}>
      <h3 style={{ margin: '0', fontSize: '1.4rem' }}>{data.name}</h3>
      <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>{statusText}</span>
      {data.type === 'real' && <span style={styles.sensorTag}>📡 Live</span>}
      <style>{`@keyframes pulse { 0% { transform: scale(1); } 50% { transform: scale(1.05); } 100% { transform: scale(1); } }`}</style>
    </div>
  );
};

const styles = {
  page: { padding: '20px', minHeight: '100vh', background: '#ecf0f1', fontFamily: 'Segoe UI, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px', background: 'white', padding: '15px 30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', flexWrap: 'wrap' },
  navButtons: { display: 'flex', gap: '10px' },
  profileBtn: { background: '#2c3e50', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  cctvBtn: { background: '#e74c3c', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  navBtn: { background: '#3498db', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  logoutBtn: { background: '#c0392b', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.3s' },
  lotContainer: { display: 'flex', justifyContent: 'center', gap: '40px', background: '#34495e', padding: '40px', borderRadius: '15px', maxWidth: '800px', margin: '0 auto', border: '5px solid #2c3e50' },
  column: { display: 'flex', flexDirection: 'column', gap: '20px' },
  road: { width: '140px', display: 'flex', justifyContent: 'center', alignItems: 'center', borderLeft: '4px dashed #f1c40f', borderRight: '4px dashed #f1c40f', background: '#3a5369', position: 'relative' },
  dashedLine: { height: '100%', width: '0px', borderLeft: '4px dashed rgba(255,255,255,0.3)' },
  roadLabel: { position: 'absolute', transform: 'rotate(-90deg)', color: 'rgba(255,255,255,0.15)', fontSize: '2.5rem', fontWeight: '900', letterSpacing: '8px' },
  slot: { width: '130px', height: '110px', borderRadius: '10px', border: '3px solid', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.2)', color: '#2d3436', transition: 'all 0.3s ease' },
  sensorTag: { fontSize: '0.6rem', background: 'white', padding: '2px 6px', borderRadius: '4px', marginTop: '5px' },
  legend: { display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '30px', fontWeight: 'bold', color: '#555', flexWrap: 'wrap' },
  parkNowBtn: { background: '#27ae60', color: 'white', border: 'none', padding: '12px 30px', borderRadius: '30px', fontSize: '1.2rem', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 15px rgba(39, 174, 96, 0.4)' },
  navBox: { background: '#2c3e50', padding: '10px 20px', borderRadius: '30px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '15px', border: '2px solid #f1c40f' },
  cancelBtn: { background: '#e74c3c', color: 'white', border: 'none', padding: '5px 12px', borderRadius: '50%', cursor: 'pointer', fontWeight: 'bold' },
  timerBox: { background: '#2c3e50', padding: '10px 25px', borderRadius: '10px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '2px solid #2ecc71', boxShadow: '0 0 15px rgba(46, 204, 113, 0.3)' }
};

export default Dashboard;