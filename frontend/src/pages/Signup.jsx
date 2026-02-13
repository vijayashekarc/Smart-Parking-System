import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';

function Signup() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '', phone_number: '', vehicle_no: '', vehicle_type: '4-wheeler', user_type: 'guest'
  });

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/signup', formData);
      alert('Signup Successful!');
      navigate('/login');
    } catch (err) {
      alert('Error signing up');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={{color: '#2c3e50'}}>Create Account</h2>
        <form onSubmit={handleSubmit}>
          <input name="name" placeholder="Full Name" onChange={handleChange} required />
          <input name="phone_number" placeholder="Phone Number" onChange={handleChange} required />
          <input name="vehicle_no" placeholder="Vehicle No (TN-01-AB-1234)" onChange={handleChange} required />
          
          <div style={{display: 'flex', gap: '10px'}}>
            <select name="vehicle_type" onChange={handleChange} style={{flex: 1}}>
              <option value="4-wheeler">4-Wheeler</option>
              <option value="2-wheeler">2-Wheeler</option>
            </select>
            <select name="user_type" onChange={handleChange} style={{flex: 1}}>
              <option value="guest">Guest</option>
              <option value="employee">Employee</option>
            </select>
          </div>

          <button type="submit" style={styles.button}>Register</button>
        </form>
        <p style={{marginTop: '15px', fontSize: '0.9rem', textAlign: 'center'}}>
          Already have an account? <Link to="/login">Login</Link>
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
    boxShadow: '0 10px 25px rgba(0,0,0,0.1)', width: '100%', maxWidth: '400px'
  },
  button: {
    width: '100%', padding: '12px', backgroundColor: '#27ae60', color: 'white',
    border: 'none', borderRadius: '5px', fontSize: '1rem', fontWeight: 'bold', marginTop: '10px'
  }
};

export default Signup;