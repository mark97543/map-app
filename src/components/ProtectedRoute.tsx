import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { type ReactNode } from 'react';

export const ProtectedRoute = ({ children }: { children: ReactNode }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ backgroundColor: '#040D12', color: '#5C8374', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Verifying Account Status...
      </div>
    ); 
  }

  // Gate 1: Not logged in at all
  if (!user) {
    return <Navigate to="/" replace />;
  }

  // Gate 2: Logged in, but still in 'draft' status
  if (user.status === 'unverified') {
    return <Navigate to="/pending" replace />;
  }

  // Gate 3: Logged in and 'active'
  return <>{children}</>;
};