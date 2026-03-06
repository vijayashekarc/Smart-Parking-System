import { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CCTV() {
  const navigate = useNavigate();
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);

  // --- CONFIGURATION ---
  // Replace this with your actual YouTube Live Video ID
  const YOUTUBE_VIDEO_ID = "YOUR_LIVE_VIDEO_ID_HERE"; 

  // --- CUSTOM CONTROLS LOGIC ---
  const handlePlay = () => {
    if (iframeRef.current) {
      // Send play command to YouTube iframe
      iframeRef.current.contentWindow.postMessage('{"event":"command","func":"playVideo","args":""}', '*');
      setIsPlaying(true);
    }
  };

  const handlePause = () => {
    if (iframeRef.current) {
      // Send pause command to YouTube iframe
      iframeRef.current.contentWindow.postMessage('{"event":"command","func":"pauseVideo","args":""}', '*');
      setIsPlaying(false);
    }
  };

  return (
    <div style={styles.page}>
      
      <nav style={styles.navbar}>
        <button onClick={() => navigate('/dashboard')} style={styles.backBtn}>
           ← Back
        </button>
        <h2 style={{color: 'white', margin: 0}}>🎥 Live Security Feed</h2>
      </nav>

      {/* --- CCTV SCREEN --- */}
      <div style={styles.feedContainer}>
        
        {/* We use a wrapper with pointerEvents: 'none' so users CANNOT click the YouTube video to open it or see overlays */}
        <div style={styles.videoWrapper}>
          <iframe
            ref={iframeRef}
            style={styles.iframe}
            src={`https://www.youtube.com/embed/${YOUTUBE_VIDEO_ID}?enablejsapi=1&autoplay=1&mute=1&controls=0&modestbranding=1&rel=0&showinfo=0&disablekb=1&iv_load_policy=3`}
            title="CCTV Feed"
            frameBorder="0"
            allow="autoplay; encrypted-media"
            allowFullScreen
          ></iframe>
        </div>

      </div>

      {/* --- CUSTOM CONTROLS --- */}
      <div style={styles.controlsContainer}>
        <div style={styles.statusDot}></div>
        <span style={styles.statusText}>{isPlaying ? "LIVE STREAMING" : "PAUSED"}</span>
        
        <div style={styles.buttonGroup}>
          <button 
            style={{...styles.controlBtn, opacity: isPlaying ? 0.5 : 1}} 
            onClick={handlePlay}
            disabled={isPlaying}
          >
            ▶ PLAY
          </button>
          <button 
            style={{...styles.controlBtn, opacity: !isPlaying ? 0.5 : 1}} 
            onClick={handlePause}
            disabled={!isPlaying}
          >
            ⏸ PAUSE
          </button>
        </div>
      </div>
      
      <div style={styles.info}>
        <p>Resolution: 480p HQ | Location: Main Gate</p>
      </div>

    </div>
  );
}

const styles = {
  page: { minHeight: '100vh', background: '#1e272e', display: 'flex', flexDirection: 'column', alignItems: 'center', fontFamily: 'Segoe UI, sans-serif' },
  navbar: { width: '100%', padding: '20px', background: '#2f3640', display: 'flex', alignItems: 'center', gap: '20px', boxSizing: 'border-box' },
  backBtn: { background: 'transparent', border: '1px solid white', color: 'white', padding: '8px 15px', borderRadius: '5px', cursor: 'pointer', fontWeight: 'bold' },
  
  // Outer Container representing the TV/Monitor
  feedContainer: { 
    marginTop: '40px', 
    border: '8px solid #353b48', 
    borderRadius: '10px', 
    background: 'black', 
    width: '90%', 
    maxWidth: '720px', 
    aspectRatio: '16/9', // Keeps the perfect video ratio
    display:'flex', 
    justifyContent:'center', 
    alignItems:'center',
    boxShadow: '0 10px 30px rgba(0,0,0,0.8)',
    position: 'relative'
  },
  
  // The trick to block YouTube clicks
  videoWrapper: {
    width: '100%',
    height: '100%',
    pointerEvents: 'none', // BLOCKS ALL CLICKS TO YOUTUBE
    overflow: 'hidden'
  },
  
  iframe: { 
    width: '100%', 
    height: '100%',
    // Zoom in slightly to hide YouTube watermarks that sometimes appear on the edges
    transform: 'scale(1.05)' 
  },
  
  // Custom Controls UI
  controlsContainer: {
    marginTop: '20px',
    background: '#2f3640',
    padding: '15px 30px',
    borderRadius: '30px',
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    boxShadow: '0 5px 15px rgba(0,0,0,0.3)'
  },
  statusDot: { width: '12px', height: '12px', borderRadius: '50%', background: '#e84118', animation: 'blink 1.5s infinite' },
  statusText: { color: 'white', fontWeight: 'bold', letterSpacing: '2px', width: '150px' },
  
  buttonGroup: { display: 'flex', gap: '10px' },
  controlBtn: { 
    background: '#718093', 
    color: 'white', 
    border: 'none', 
    padding: '10px 20px', 
    borderRadius: '5px', 
    cursor: 'pointer', 
    fontWeight: 'bold',
    transition: '0.2s'
  },

  info: { marginTop: '20px', color: '#7f8fa6', textAlign: 'center', fontSize: '0.9rem' }
};

// Add blinking animation for the red live dot
const styleSheet = document.createElement("style");
styleSheet.innerText = `
  @keyframes blink {
    0% { opacity: 1; }
    50% { opacity: 0.3; }
    100% { opacity: 1; }
  }
`;
document.head.appendChild(styleSheet);

export default CCTV;