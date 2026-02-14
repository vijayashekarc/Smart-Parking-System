import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ParkingLogs() {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const navigate = useNavigate();

  // Get logged in user
  const user = JSON.parse(localStorage.getItem('user'));

  // Fetch History
  const fetchLogs = () => {
    if (!user) return;

    // We removed the "status=Completed" filter so we get ALL logs (Active & Completed)
    axios.get(`http://localhost:5000/api/history?phone=${user.phone_number}`)
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLogs();
    // Poll every 3 seconds to see live updates (e.g. if status changes from Active to Completed)
    const interval = setInterval(fetchLogs, 3000);
    return () => clearInterval(interval);
  }, []);

  // Open Payment Popup
  const handlePayClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // Confirm Payment
  const processPayment = (method) => {
    axios.post('http://localhost:5000/api/pay', { log_id: selectedLog._id })
      .then(() => {
        alert(`Payment successful via ${method}!`);
        setShowModal(false);
        fetchLogs(); 
      })
      .catch(() => alert("Payment Failed"));
  };

  // --- HELPER: GET BADGE COLOR ---
  const getStatusBadge = (status) => {
    switch (status) {
      case 'Parked':   return <span style={styles.badgeActive}>🚗 Active</span>;
      case 'Completed': return <span style={styles.badgeCompleted}>✅ Completed</span>;
      case 'Cancelled': return <span style={styles.badgeCancelled}>❌ Cancelled</span>;
      default: return status;
    }
  };

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>📜 Parking History</h2>
        </div>
        <span style={{color: '#7f8c8d', fontSize: '0.9rem'}}>User: {user?.name}</span>
      </nav>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Date</th>
              <th style={styles.th}>Slot</th>
              <th style={styles.th}>Status</th> {/* NEW COLUMN */}
              <th style={styles.th}>Entry Time</th>
              <th style={styles.th}>Exit Time</th>
              <th style={styles.th}>Duration</th>
              <th style={styles.th}>Cost</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="8" style={styles.td}>No records found</td></tr>
            ) : (
              logs.map((log, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  {/* Date */}
                  <td style={styles.td}>{new Date(log.entry_time).toLocaleDateString()}</td>
                  
                  {/* Slot */}
                  <td style={{...styles.td, fontWeight:'bold'}}>{log.slot_id}</td>

                  {/* Status Badge */}
                  <td style={styles.td}>{getStatusBadge(log.status)}</td>
                  
                  {/* Entry Time */}
                  <td style={styles.td}>{new Date(log.entry_time).toLocaleTimeString()}</td>
                  
                  {/* Exit Time (Show '--' if Active) */}
                  <td style={styles.td}>
                    {log.exit_time ? new Date(log.exit_time).toLocaleTimeString() : '--'}
                  </td>
                  
                  {/* Duration Column */}
                  <td style={styles.td}>
                    {log.status === 'Cancelled' ? (
                      <span style={{color: '#999'}}>NA</span>
                    ) : log.status === 'Parked' ? (
                      <span style={{color: '#3498db', fontWeight: 'bold'}}>Ongoing...</span>
                    ) : (
                      `${log.duration_minutes} min`
                    )}
                  </td>
                  
                  {/* Cost */}
                  <td style={{...styles.td, fontWeight:'bold', color: '#27ae60'}}>
                    {log.status === 'Parked' ? 'Calculating...' : `₹${log.cost}`}
                  </td>
                  
                  {/* Payment Action */}
                  <td style={styles.td}>
                    {log.status === 'Parked' ? (
                       <span style={{color: '#f39c12', fontSize:'0.8rem'}}>Pay on Exit</span>
                    ) : log.status === 'Cancelled' ? (
                       <span>--</span>
                    ) : log.payment_status === 'Paid' ? (
                      <span style={styles.paidText}>✅ PAID</span>
                    ) : (
                      <button style={styles.payBtn} onClick={() => handlePayClick(log)}>
                        💳 Pay Now
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* --- PAYMENT POPUP MODAL --- */}
      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modal}>
            <h3>Confirm Payment</h3>
            <p>Total Amount: <strong style={{color:'green', fontSize:'1.5rem'}}>₹{selectedLog?.cost}</strong></p>
            <p style={{color:'#7f8c8d', fontSize:'0.9rem'}}>For {selectedLog?.duration_minutes} mins at {selectedLog?.slot_id}</p>
            
            <div style={styles.optionContainer}>
              <button style={{...styles.optionBtn, background: '#2ecc71'}} onClick={() => processPayment('UPI')}>
                📱 UPI (GPay/PhonePe)
              </button>
              <button style={{...styles.optionBtn, background: '#3498db'}} onClick={() => processPayment('Credit Card')}>
                💳 Credit/Debit Card
              </button>
            </div>

            <button style={styles.cancelBtn} onClick={() => setShowModal(false)}>Cancel</button>
          </div>
        </div>
      )}

    </div>
  );
}

const styles = {
  page: { padding: '20px', minHeight: '100vh', background: '#ecf0f1', fontFamily: 'Segoe UI, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  backBtn: { background: 'transparent', border: '1px solid #7f8c8d', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '15px' },
  
  tableContainer: { maxWidth: '1000px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', overflowX: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  headerRow: { background: '#2c3e50', color: 'white' },
  th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '0.5px' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee', color: '#333', verticalAlign: 'middle', fontSize: '0.95rem' },
  rowEven: { background: '#f9f9f9' },
  rowOdd: { background: 'white' },

  // BADGES
  badgeActive: { background: '#3498db', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeCompleted: { background: '#2ecc71', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  badgeCancelled: { background: '#e74c3c', color: 'white', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' },
  paidText: { color: '#27ae60', fontWeight: 'bold', background: '#d5f5e3', padding: '5px 10px', borderRadius: '5px' },

  // BUTTONS
  payBtn: { background: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', transition: '0.2s', boxShadow: '0 2px 5px rgba(230, 126, 34, 0.4)' },
  
  // MODAL
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  modal: { background: 'white', padding: '30px', borderRadius: '10px', width: '320px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  optionContainer: { display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' },
  optionBtn: { padding: '12px', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem' },
  cancelBtn: { background: 'transparent', color: '#7f8c8d', border: 'none', cursor: 'pointer', textDecoration: 'underline', marginTop: '10px' }
};

export default ParkingLogs;