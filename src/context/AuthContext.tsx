// 1. Fix: Use 'type' for ReactNode
import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import client from '../lib/directus';
import { readMe } from '@directus/sdk';

// Pro-tip: Define what a Directus User looks like (simplified)
interface DirectusUser {
  id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  // ... add more if needed
}

interface AuthContextType {
  user: DirectusUser | null; // Fix: Use the interface here
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // 2. Fix: Tell useState it can hold a User OR null
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      try {
        // Directus SDK usually returns the object directly
        const userData = await client.request(readMe());
        setUser(userData as DirectusUser); // Type assertion
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      await client.login(email, pass);
      const userData = await client.request(readMe());
      setUser(userData as DirectusUser);
    } catch (error) {
      console.error("Login failed:", error);
      throw error; // Re-throw so your UI can show an error message
    }
  };

  const logout = async () => {
    await client.logout();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};