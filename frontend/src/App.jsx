import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import CCTV from './pages/CCTV';
import ParkingLogs from './pages/ParkingLogs';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Default redirect to Login */}
          <Route path="/" element={<Navigate to="/login" />} />
          
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected Routes (You would normally add auth checks here) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cctv" element={<CCTV />} />
          <Route path="/logs" element={<ParkingLogs />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;