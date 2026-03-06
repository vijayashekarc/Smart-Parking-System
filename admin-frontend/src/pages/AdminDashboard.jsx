import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { FaVideo, FaChartLine, FaSignOutAlt, FaTable } from 'react-icons/fa';

function AdminDashboard() {
  const [stats, setStats] = useState({ users: 3 , revenue: 135, total_parkings: 11, active: 1 });
  const [detailedLogs, setDetailedLogs] = useState([]);
  const [activeTab, setActiveTab] = useState('database'); 
  const navigate = useNavigate();

  useEffect(() => {
    // 1. Kick them out if not logged in
    if (!localStorage.getItem('admin_token')) {
      navigate('/');
      return;
    }

    const fetchData = () => {
      // Fetch Dashboard Stats
      axios.get('http://localhost:5000/api/admin/stats')
        .then(res => setStats(res.data))
        .catch(err => console.error("Admin Backend Offline"));

      // Fetch the Detailed Master Logs
      axios.get('http://localhost:5000/api/admin/detailed-logs')
        .then(res => setDetailedLogs(res.data))
        .catch(err => console.error(err));
    };

    fetchData();
    const interval = setInterval(fetchData, 5000); 
    return () => clearInterval(interval);
  }, [navigate]);

  // Helper to format dates nicely
  const formatDate = (dateString) => {
    if (!dateString) return '--';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <div style={styles.page}>
      
      {/* SIDEBAR */}
      <div style={styles.sidebar}>
        <h3 style={{color: 'white', marginBottom: '40px', textAlign:'center', letterSpacing: '2px'}}>🛡️ Park Sync Admin</h3>
        
        <button style={activeTab === 'overview' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('overview')}>
          <FaChartLine /> Dashboard
        </button>
        <button style={activeTab === 'cctv' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('cctv')}>
          <FaVideo /> Live CCTV
        </button>
        <button style={activeTab === 'database' ? styles.activeBtn : styles.btn} onClick={() => setActiveTab('database')}>
          <FaTable /> Parking Database
        </button>
        
        <button style={styles.logoutBtn} onClick={() => { localStorage.removeItem('admin_token'); navigate('/'); }}>
          <FaSignOutAlt /> Logout
        </button>
      </div>

      {/* CONTENT AREA */}
      <div style={styles.content}>
        
        {/* TAB 1: OVERVIEW */}
        {activeTab === 'overview' && (
           <div>
             <h2 style={{color: '#2c3e50', borderBottom:'2px solid #ecf0f1', paddingBottom:'10px'}}>📊 System Analytics</h2>
             <div style={{display: 'flex', gap: '20px', marginTop: '20px'}}>
               <div style={styles.statCard}><h3>Total Revenue</h3><h1>₹{stats.revenue}</h1></div>
               <div style={styles.statCard}><h3>Active -Users</h3><h1>{stats.users}</h1></div>
               <div style={styles.statCard}><h3>Current-Parked</h3><h1>{stats.active}</h1></div>
             </div>
           </div>
        )}

        {/* TAB 2: CCTV */}
        {activeTab === 'cctv' && (
           <div>
             <h2 style={{color: '#2c3e50', borderBottom:'2px solid #ecf0f1', paddingBottom:'10px'}}>🎥 Live Surveillance</h2>
             {/* You can drop the YouTube iframe code here from the previous step! */}
             <div style={{background: 'black', height: '400px', borderRadius: '10px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', marginTop: '20px'}}>
               CCTV Feed Container
             </div>
           </div>
        )}

        {/* TAB 3: PARKING DATABASE (The Main Request) */}
        {activeTab === 'database' && (
          <div>
            <h2 style={{color: '#2c3e50', borderBottom:'2px solid #ecf0f1', paddingBottom:'10px'}}>
              🗄️ Master Parking Database
            </h2>
            
            <div style={styles.tableCard}>
              <div style={{overflowX: 'auto'}}> 
                <table style={styles.table}>
                  <thead>
                    <tr style={{background:'#f8f9fa', color:'#2c3e50', textAlign:'left'}}>
                      <th style={styles.th}>Customer Info</th>
                      <th style={styles.th}>Vehicle No</th>
                      <th style={styles.th}>Slot</th>
                      <th style={styles.th}>Entry Time</th>
                      <th style={styles.th}>Exit Time</th>
                      <th style={styles.th}>Payment Method</th>
                      <th style={styles.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {detailedLogs.map(log => (
                      <tr key={log._id} style={{borderBottom:'1px solid #eee'}}>
                        <td style={styles.td}>
                          <div style={{fontWeight: 'bold', color: '#2c3e50'}}>{log.name}</div>
                          <div style={{fontSize: '0.8rem', color: '#7f8c8d'}}>{log.phone_number}</div>
                        </td>
                        <td style={styles.td}><span style={styles.plateTag}>{log.vehicle_no}</span></td>
                        <td style={styles.td}><b>{log.slot_id}</b></td>
                        <td style={styles.td}>{formatDate(log.entry_time)}</td>
                        <td style={styles.td}>{formatDate(log.exit_time)}</td>
                        <td style={styles.td}>{log.payment_method}</td>
                        <td style={styles.td}>
                          {log.status === 'Parked' ? (
                            <span style={styles.statusActive}>🚗 Active</span>
                          ) : log.payment_status === 'Paid' ? (
                            <span style={styles.statusPaid}>✅ Paid</span>
                          ) : (
                            <span style={styles.statusPending}>⏳ Pending</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

const styles = {
  page: { display: 'flex', minHeight: '100vh', fontFamily: 'Segoe UI, sans-serif', background: '#ecf0f1' },
  sidebar: { width: '260px', background: '#2c3e50', padding: '30px 20px', display: 'flex', flexDirection: 'column', gap: '15px', boxShadow:'4px 0 10px rgba(0,0,0,0.1)', zIndex: 10 },
  content: { flex: 1, padding: '40px', overflowY: 'auto' },
  
  btn: { padding: '15px', background: 'transparent', color: '#bdc3c7', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', display: 'flex', alignItems: 'center', gap: '15px', transition:'0.2s', borderRadius: '8px' },
  activeBtn: { padding: '15px', background: '#34495e', color: 'white', border: 'none', textAlign: 'left', cursor: 'pointer', fontSize: '1rem', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight:'bold', boxShadow:'0 4px 6px rgba(0,0,0,0.1)' },
  logoutBtn: { marginTop: 'auto', padding: '15px', background: '#c0392b', color: 'white', border: 'none', cursor: 'pointer', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '15px', fontWeight:'bold' },

  statCard: { flex: 1, background: 'white', padding: '20px', borderRadius: '10px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', borderLeft: '5px solid #3498db' },

  tableCard: { background:'white', padding:'20px', borderRadius:'10px', boxShadow:'0 4px 15px rgba(0,0,0,0.05)', marginTop:'20px' },
  table: { width: '100%', borderCollapse: 'collapse', minWidth: '800px' },
  th: { padding: '15px', borderBottom:'2px solid #ecf0f1', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' },
  td: { padding: '15px', color: '#555', verticalAlign: 'middle' },
  
  plateTag: { background:'#f1c40f', color:'black', padding:'4px 8px', borderRadius:'4px', fontWeight:'bold', border: '1px solid #d4ac0d', letterSpacing: '1px' },
  
  statusActive: { background: '#d0ebff', color: '#1971c2', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
  statusPaid: { background: '#d3f9d8', color: '#2b8a3e', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' },
  statusPending: { background: '#ffe3e3', color: '#e03131', padding: '5px 10px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: 'bold', whiteSpace: 'nowrap' }
};

export default AdminDashboard;