import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
// 1. Import the type explicitly
import { type ReactNode } from 'react';

// 2. Use ReactNode instead of JSX.Element
export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ backgroundColor: '#040D12', color: '#5C8374', height: '100vh' }}>
        Initializing System...
      </div>
    ); 
  }
  
  // Cast to JSX.Element here or just return as is
  return user ? <>{children}</> : <Navigate to="/" replace />;
};