import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Webcam from 'react-webcam';

function CCTV() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div style={styles.page}>
      <nav style={styles.navbar}>
        <div style={{display:'flex', alignItems:'center', gap:'15px'}}>
          <button style={styles.backBtn} onClick={() => navigate('/dashboard')}>
            ← Back
          </button>
          <h2 style={{ margin: 0 }}>🎥 Security Center</h2>
        </div>
        <div style={styles.statusBadge}>
          <span style={styles.dot}>●</span> LIVE
        </div>
      </nav>

      <div style={styles.container}>
        <div style={styles.videoFrame}>
          
          <div style={styles.camHeader}>
             <span>CAM-01 (Laptop Webcam)</span>
             <span>{currentTime}</span>
          </div>

          <div style={styles.streamWrapper}>
            <Webcam
              audio={false}
              screenshotFormat="image/jpeg"
              width="100%"
              videoConstraints={{ facingMode: "user" }}
              style={styles.video}
            />
            <div style={styles.overlayText}>REC ●</div>
          </div>

          <div style={styles.controls}>
            <button style={styles.controlBtn}>📸 Snap</button>
            <button style={styles.controlBtn}>🔊 Mute</button>
            <button style={{...styles.controlBtn, color: 'red'}}>🚨 Alarm</button>
          </div>

        </div>
      </div>
    </div>
  );
}

const styles = {
  page: { padding: '20px', minHeight: '100vh', background: '#1e272e', color: 'white', fontFamily: 'Segoe UI, sans-serif' },
  navbar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', background: '#2d3436', padding: '10px 20px', borderRadius: '10px', borderBottom: '3px solid #e74c3c' },
  backBtn: { background: 'transparent', color: '#bdc3c7', border: '1px solid #7f8c8d', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer' },
  statusBadge: { display: 'flex', alignItems: 'center', gap: '8px', color: '#e74c3c', fontWeight: 'bold', background: 'rgba(231, 76, 60, 0.1)', padding: '5px 10px', borderRadius: '5px' },
  dot: { animation: 'pulse 1s infinite' },
  
  // --- CENTER CONTAINER ---
  container: { display: 'flex', justifyContent: 'center', alignItems: 'flex-start', paddingTop: '40px' },
  
  // --- RESIZED VIDEO FRAME (Changed 900px -> 600px) ---
  videoFrame: { width: '100%', maxWidth: '600px', background: 'black', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 20px 50px rgba(0,0,0,0.5)', border: '1px solid #444' },
  
  camHeader: { padding: '10px', background: '#333', display: 'flex', justifyContent: 'space-between', fontFamily: 'monospace', fontSize: '0.9rem', borderBottom: '1px solid #555' },
  
  streamWrapper: { position: 'relative', width: '100%', background: '#000' },
  video: { width: '100%', height: 'auto', display: 'block' },
  overlayText: { position: 'absolute', top: '10px', right: '10px', color: 'red', fontWeight: 'bold', fontFamily: 'monospace', background: 'rgba(0,0,0,0.5)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem' },

  controls: { padding: '10px', background: '#222', display: 'flex', gap: '10px', justifyContent: 'center', borderTop: '1px solid #444' },
  controlBtn: { padding: '8px 15px', background: '#444', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem' }
};

export default CCTV;