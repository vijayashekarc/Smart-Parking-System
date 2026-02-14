import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { phone_number: phone });
      
      if (res.data) {
        localStorage.setItem('user', JSON.stringify(res.data));
        navigate('/dashboard');
      }
    } catch (err) {
      alert("User not found! Please sign up.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        
        {/* --- SQUARE LOGO IMAGE --- */}
        <img 
          src="https://cdn-icons-png.flaticon.com/512/3063/3063823.png" // Parking Icon
          alt="Smart Parking" 
          style={styles.image} 
        />

        <h2 style={styles.title}>Park Sync</h2>
        <p style={styles.subtitle}>
          Enter your phone number to access your parking dashboard.
        </p>
        
        <input 
          type="text" 
          placeholder="Phone Number" 
          value={phone}
          onChange={(e) => setPhone(e.target.value)} 
          style={styles.input} 
        />
        
        <button onClick={handleLogin} style={styles.button}>Login</button>
        
        <div style={styles.footer}>
          Don't have an account? <Link to="/signup" style={styles.link}>Sign up</Link>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', 
    justifyContent: 'center', 
    alignItems: 'center', 
    height: '100vh',
    background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)',
    fontFamily: 'Segoe UI, sans-serif'
  },
  card: {
    background: 'white', 
    padding: '40px', 
    borderRadius: '15px',
    boxShadow: '0 15px 35px rgba(0,0,0,0.2)', 
    width: '90%', 
    maxWidth: '350px', 
    textAlign: 'center'
  },
  
  // --- UPDATED IMAGE STYLE (Perfect Square) ---
  image: {
    width: '100px',
    height: '100px',
    objectFit: 'cover',
    marginBottom: '20px',
    // borderRadius: '50%', // Uncomment this if you want a Circle instead of Square
  },
  
  title: { color: '#2c3e50', marginTop: '0', marginBottom: '10px' },
  subtitle: { color: '#7f8c8d', marginBottom: '25px', fontSize: '0.9rem' },
  
  input: {
    width: '100%',
    padding: '12px 15px',
    marginBottom: '20px',
    borderRadius: '8px',
    border: '1px solid #ddd',
    fontSize: '1rem',
    boxSizing: 'border-box', // Ensures padding doesn't break width
    outline: 'none',
    backgroundColor: '#f8f9fa'
  },
  button: {
    width: '100%', 
    padding: '14px', 
    backgroundColor: '#2c3e50', 
    color: 'white',
    border: 'none', 
    borderRadius: '8px', 
    fontSize: '1rem', 
    fontWeight: 'bold',
    cursor: 'pointer',
    transition: 'background 0.3s'
  },
  footer: { marginTop: '20px', fontSize: '0.9rem', color: '#7f8c8d' },
  link: { color: '#3498db', fontWeight: 'bold', textDecoration: 'none' }
};

export default Login;