
import Button from "../../assets/componets/Button/Button"
import { useNavigate } from 'react-router-dom';
import { useAuth } from "../../context/AuthContext";


function Dashboard(){

  const navigate = useNavigate();
  const {user,logout}=useAuth();

  const handleLogout = async () => {
    try {
      // This tells the Directus API to invalidate the Refresh Token
      await logout();
    } catch (error) {
      console.error("Logout error (likely already expired):", error);
    } finally {
      // Always redirect the user even if the server-side logout fails
      navigate('/');
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'var(--bg-dark)', 
      minHeight: '100vh', 
      padding: 'var(--space-md)', 
      color: 'white' 
    }}>
      <header style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        borderBottom: '1px solid var(--primary)' 
      }}>
        <h1 style={{ fontSize: 'var(--text-xl)' }}>Dashboard</h1>
        
        <div style={{ textAlign: 'right' }}>
          <p style={{ margin: 0, fontSize: 'var(--text-md)', color: 'var(--primary)' }}>
            {user?.email}
          </p>
          <Button 
            addClass="logout_button" 
            onClick={handleLogout}
          >
            Logout
          </Button>
        </div>
      </header>

      <main style={{ marginTop: 'var(--space-md)' }}>
        {/* Phase 12 Map Integration goes here */}
        <div style={{ 
          height: '400px', 
          background: '#0a1a21', 
          borderRadius: 'var(--radius-lg)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: '1px dashed var(--primary)'
        }}>
          <p>Mapbox Container Placeholder (Phase 12)</p>
        </div>
      </main>
    </div>
  );
}

export default Dashboard