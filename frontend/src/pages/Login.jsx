import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Login() {
  const [phone, setPhone] = useState('');
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post('http://localhost:5000/api/login', { phone_number: phone });
      localStorage.setItem('user', JSON.stringify(res.data));
      navigate('/dashboard');
    } catch (err) {
      alert("User not found! Please sign up.");
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{color: '#2c3e50'}}>Welcome Back</h2>
        <p style={{color: '#7f8c8d', marginBottom: '20px'}}>Enter your phone number to access your parking dashboard.</p>
        
        <input 
          type="text" 
          placeholder="Phone Number" 
          onChange={(e) => setPhone(e.target.value)} 
        />
        
        <button onClick={handleLogin} style={styles.button}>Login</button>
        
        <p style={{marginTop: '15px', fontSize: '0.9rem'}}>
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh',
    background: 'linear-gradient(135deg, #2c3e50 0%, #3498db 100%)'
  },
  card: {
    background: 'white', padding: '40px', borderRadius: '10px',
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '350px', textAlign: 'center'
  },
  button: {
    width: '100%', padding: '12px', backgroundColor: '#2c3e50', color: 'white',
    border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold'
  }
};

export default Login;