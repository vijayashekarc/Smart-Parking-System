import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function AdminLogin() {
  const [creds, setCreds] = useState({ username: '', password: '' });
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      // Pointing to your Admin Backend
      const res = await axios.post('http://localhost:5000/api/admin/login', creds);
      if (res.data.success) {
        localStorage.setItem('admin_token', res.data.token);
        navigate('/dashboard');
      }
    } catch (err) {
      alert("❌ Invalid Admin Credentials");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{color: '#c0392b', margin: '0 0 20px 0'}}>🛡️ Admin Portal</h2>
        
        <input 
          style={styles.input} 
          type="text" 
          placeholder="Admin Username" 
          onChange={e => setCreds({...creds, username: e.target.value})} 
        />
        <input 
          style={styles.input} 
          type="password" 
          placeholder="Password" 
          onChange={e => setCreds({...creds, password: e.target.value})} 
        />
        
        <button style={styles.btn} onClick={handleLogin}>Secure Login</button>
      </div>
    </div>
  );
}

const styles = {
  container: { height: '100vh', background: '#2c3e50', display: 'flex', justifyContent: 'center', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif' },
  card: { background: 'white', padding: '40px', borderRadius: '10px', width: '100%', maxWidth: '320px', textAlign: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' },
  input: { width: '100%', padding: '12px 15px', marginBottom: '15px', borderRadius: '5px', border: '1px solid #ccc', boxSizing: 'border-box', outline: 'none' },
  btn: { width: '100%', padding: '12px', background: '#c0392b', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight:'bold', fontSize: '1rem', transition: '0.3s' }
};

export default AdminLogin;