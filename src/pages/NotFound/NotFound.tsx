import { useNavigate } from 'react-router-dom';
import Button from '../../assets/componets/Button/Button';

function NotFound() {
  const navigate = useNavigate();

  return (
    <div style={{
      height: '100vh',
      backgroundColor: '#040D12', // Your background-dark
      color: '#93B1A6',       // Your primary-light
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center',
      padding: '20px'
    }}>
      <h1 style={{ fontSize: '8rem', margin: 0, color: '#5C8374' }}>404</h1>
      <h2 style={{ fontSize: '2rem', marginBottom: '1rem' }}>You've Gone Off-Road</h2>
      
      <p style={{ maxWidth: '500px', lineHeight: '1.6', marginBottom: '2rem' }}>
        Even the best GPS fails sometimes. You've reached a dead end at a place 
        that doesn't exist on our maps. No asphalt, no service, just tumbleweeds.
      </p>

      <div style={{ fontSize: '4rem', marginBottom: '2rem' }}>
        🌵 🚗 💨
      </div>

      <Button onClick={() => navigate('/dashboard')}>
        Recalculating... (Back to Safety)
      </Button>
    </div>
  );
}

export default NotFound;