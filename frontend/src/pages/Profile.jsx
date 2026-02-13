import { QRCodeSVG } from 'qrcode.react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Profile() {
  const user = JSON.parse(localStorage.getItem('user')) || {};
  const [minutes, setMinutes] = useState(0);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('user');
    navigate('/login');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h2>User Profile</h2>
          <button onClick={handleLogout} style={styles.logoutBtn}>Logout</button>
        </div>

        <div style={styles.infoSection}>
          <div style={styles.detailRow}><strong>Name:</strong> {user.name}</div>
          <div style={styles.detailRow}><strong>Vehicle:</strong> {user.vehicle_no}</div>
          <div style={styles.detailRow}><strong>Type:</strong> <span style={styles.badge}>{user.user_type}</span></div>
        </div>

        <div style={styles.qrSection}>
          <p style={{marginBottom: '10px', color: '#7f8c8d'}}>Scan at Entry Gate</p>
          <div style={styles.qrBorder}>
            <QRCodeSVG value={user.qr_code_data || "no-data"} size={140} />
          </div>
        </div>

        <div style={styles.paymentSection}>
          <h3>💳 Payment Simulator</h3>
          <div style={{display: 'flex', gap: '10px'}}>
            <input 
              type="number" 
              placeholder="Minutes" 
              onChange={(e) => setMinutes(e.target.value)} 
              style={{flex: 1, marginBottom: 0}}
            />
            <button 
              onClick={() => alert(`Paid ₹${minutes * 15}`)} 
              style={styles.payBtn}
            >
              Pay ₹{minutes * 15}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: { padding: '40px 20px', minHeight: '100vh', background: '#ecf0f1', display: 'flex', justifyContent: 'center' },
  card: { background: 'white', width: '100%', maxWidth: '500px', borderRadius: '15px', boxShadow: '0 5px 20px rgba(0,0,0,0.1)', overflow: 'hidden' },
  header: { background: '#2c3e50', color: 'white', padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  logoutBtn: { background: '#c0392b', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '4px', fontSize: '0.8rem' },
  
  infoSection: { padding: '20px', borderBottom: '1px solid #eee' },
  detailRow: { marginBottom: '10px', fontSize: '1.1rem' },
  badge: { background: '#3498db', color: 'white', padding: '2px 8px', borderRadius: '10px', fontSize: '0.9rem' },
  
  qrSection: { padding: '30px', textAlign: 'center', background: '#f9f9f9' },
  qrBorder: { display: 'inline-block', padding: '15px', background: 'white', border: '1px solid #ddd', borderRadius: '10px' },
  
  paymentSection: { padding: '20px', background: '#fff' },
  payBtn: { background: '#27ae60', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '5px', fontWeight: 'bold' }
};

export default Profile;