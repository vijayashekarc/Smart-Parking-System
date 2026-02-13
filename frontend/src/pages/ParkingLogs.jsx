import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function ParkingLogs() {
  const [logs, setLogs] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedLog, setSelectedLog] = useState(null);
  const navigate = useNavigate();

  // Fetch History
  const fetchLogs = () => {
    axios.get('http://localhost:5000/api/history')
      .then(res => setLogs(res.data))
      .catch(err => console.error(err));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  // Open Payment Popup
  const handlePayClick = (log) => {
    setSelectedLog(log);
    setShowModal(true);
  };

  // Confirm Payment
  const processPayment = (method) => {
    // Call Backend to update status
    axios.post('http://localhost:5000/api/pay', { log_id: selectedLog._id })
      .then(() => {
        alert(`Payment successful via ${method}!`);
        setShowModal(false);
        fetchLogs(); // Refresh the table
      })
      .catch(() => alert("Payment Failed"));
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
      </nav>

      <div style={styles.tableContainer}>
        <table style={styles.table}>
          <thead>
            <tr style={styles.headerRow}>
              <th style={styles.th}>Date</th> {/* NEW DATE FIELD */}
              <th style={styles.th}>Slot</th>
              <th style={styles.th}>Entry Time</th>
              <th style={styles.th}>Exit Time</th>
              <th style={styles.th}>Total Time</th>
              <th style={styles.th}>Cost</th>
              <th style={styles.th}>Status</th> {/* NEW ACTION FIELD */}
            </tr>
          </thead>
          <tbody>
            {logs.length === 0 ? (
              <tr><td colSpan="7" style={styles.td}>No records found</td></tr>
            ) : (
              logs.map((log, index) => (
                <tr key={index} style={index % 2 === 0 ? styles.rowEven : styles.rowOdd}>
                  {/* Date Column */}
                  <td style={styles.td}>{new Date(log.entry_time).toLocaleDateString()}</td>
                  <td style={{...styles.td, fontWeight:'bold'}}>{log.slot_id}</td>
                  <td style={styles.td}>{new Date(log.entry_time).toLocaleTimeString()}</td>
                  <td style={styles.td}>{new Date(log.exit_time).toLocaleTimeString()}</td>
                  <td style={styles.td}>{log.duration_minutes} min</td>
                  <td style={{...styles.td, fontWeight:'bold'}}>₹{log.cost}</td>
                  
                  {/* Payment Button or Status */}
                  <td style={styles.td}>
                {log.status === 'Cancelled' ? (
                    <span style={{color: 'red', fontWeight: 'bold'}}>❌ CANCELLED</span>
                ) : log.payment_status === 'Paid' ? (
                    <span style={styles.paidBadge}>✅ PAID</span>
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
            <h3>Choose Payment Method</h3>
            <p>Total Amount: <strong style={{color:'green'}}>₹{selectedLog?.cost}</strong></p>
            
            <div style={styles.optionContainer}>
              <button style={styles.optionBtn} onClick={() => processPayment('UPI')}>
                📱 UPI (GPay/PhonePe)
              </button>
              <button style={styles.optionBtn} onClick={() => processPayment('Credit Card')}>
                💳 Credit/Debit Card
              </button>
              <button style={styles.optionBtn} onClick={() => processPayment('NetBanking')}>
                🏦 NetBanking
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
  navbar: { display: 'flex', alignItems: 'center', marginBottom: '20px', background: 'white', padding: '15px 30px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' },
  backBtn: { background: 'transparent', border: '1px solid #7f8c8d', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer', marginRight: '15px' },
  
  tableContainer: { maxWidth: '900px', margin: '0 auto', background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)' },
  table: { width: '100%', borderCollapse: 'collapse' },
  headerRow: { background: '#2c3e50', color: 'white' },
  th: { padding: '15px', textAlign: 'left', borderBottom: '2px solid #ddd' },
  td: { padding: '12px 15px', borderBottom: '1px solid #eee', color: '#333', verticalAlign: 'middle' },
  rowEven: { background: '#f9f9f9' },
  rowOdd: { background: 'white' },

  // Button Styles
  payBtn: { background: '#e67e22', color: 'white', border: 'none', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  paidBadge: { color: '#27ae60', fontWeight: 'bold', background: '#d5f5e3', padding: '5px 10px', borderRadius: '5px' },

  // Modal Styles
  modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modal: { background: 'white', padding: '30px', borderRadius: '10px', width: '300px', textAlign: 'center', boxShadow: '0 5px 15px rgba(0,0,0,0.3)' },
  optionContainer: { display: 'flex', flexDirection: 'column', gap: '10px', margin: '20px 0' },
  optionBtn: { padding: '10px', background: '#3498db', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  cancelBtn: { background: 'transparent', color: '#7f8c8d', border: 'none', cursor: 'pointer', textDecoration: 'underline' }
};

export default ParkingLogs;