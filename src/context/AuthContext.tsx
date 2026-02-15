import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import client from '../lib/directus';
import { readMe, createUser } from '@directus/sdk'; // Added createUser

interface DirectusUser {
  id: string;
  email: string;
  status:string;
  first_name?: string;
  last_name?: string;
}

interface AuthContextType {
  user: DirectusUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (email: string, pass: string, firstName: string) => Promise<void>; // Added to interface
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSession() {
      const authData = window.localStorage.getItem("directus_auth_data");
      if (!authData) {
        setUser(null);
        setLoading(false);
        return;
      }

      try {
        const userData = await client.request(readMe());
        setUser(userData as DirectusUser);
      } catch (err) {
        window.localStorage.removeItem("directus_auth_data");
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    checkSession();
  }, []);

  const handleLogin = async (email: string, pass: string) => {
    try {
      await client.login(email, pass);
      const userData = await client.request(readMe({
        fields:['id', 'email', 'status', 'first_name']
      }));
      setUser(userData as DirectusUser);
    } catch (err:any) {
      console.error("Login failed:", err);
      const errorCode = err.errors?.[0]?.extensions?.code;
      console.error("Login Signal Received:", errorCode);

      if (err.response?.status === 401 || errorCode === 'INVALID_CREDENTIALS') {
        throw new Error("UNAUTHORIZED_OR_INACTIVE");
      }
      throw err;
    }
  };

  // NEW: Registration Handler
  const handleRegister = async (email: string, pass: string, firstName: string) => {
    try {
      // 1. Create the user in Directus
      await client.request(
        createUser({
          email,
          password: pass,
          first_name: firstName,
          role: 'd0bca9cd-3360-4624-a2dd-7a7556655f10', // Use the UUID of the 'Member' role
          status: 'unverified', 
        })
      );
      
      // 2. Automatically log them in so they don't have to type it again
      await handleLogin(email, pass);
    } catch (error:any) {
      console.error("Registration failed:", error);
      const errorCode = error.errors?.[0]?.extensions?.code;
      
      if (errorCode === 'RECORD_NOT_UNIQUE') {
        throw new Error("EMAIL_TAKEN");
      }

      if (error.message === "UNAUTHORIZED_OR_INACTIVE") {
        throw error;
      }

      throw new Error("REGISTRATION_FAILED");    
    }
  };

  const handleLogout = async () => {
    try {
      await client.logout();
    } catch (error) {
      console.warn("Logout request failed, proceeding with local purge.");
    } finally {
      setUser(null);
      window.localStorage.removeItem("directus_auth_data");
      window.localStorage.clear(); 
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login: handleLogin, 
      logout: handleLogout,
      register: handleRegister // Added to provider value
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};