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
  setUser:React.Dispatch<React.SetStateAction<DirectusUser | null>>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<DirectusUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // Prevents state updates on unmounted components

    async function checkSession() {
      const authData = window.localStorage.getItem("directus_auth_data");
      
      // 1. If no token, we are done
      if (!authData) {
        //console.log("Empty storage. Forcing user to null.");
        if (isMounted) {
          setUser(null);
          setLoading(false);
        }
        return;
      }

      // 2. If we HAVE a token, we must ask the server who this is
      try {
        const userData = await client.request(readMe({
          fields: ['id', 'email', 'first_name', 'status']
        }));

        if (isMounted) {
          setUser(userData as DirectusUser);
          //console.log("Session verified for:", userData.first_name);
        }
      } catch (err) {
        console.warn("Token exists but is invalid/expired. Clearing...");
        if (isMounted) {
          setUser(null);
          window.localStorage.removeItem("directus_auth_data");
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    checkSession();

    return () => {
      isMounted = false; // Cleanup function
    };
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
    //console.log("1. Logout Initiated...");
    try {
      await client.logout();
      //console.log("2. Server Logout Success");
    } catch (error) {
      console.warn("2. Server Logout failed, clearing local data anyway.");
    } finally {
      // Kill React State
      setUser(null);

      // Clear Storage
      window.localStorage.clear();
      window.sessionStorage.clear();

      // KILL COOKIES: This tries to expire common Directus cookies
      document.cookie = "directus_session=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      document.cookie = "directus_refresh_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";

      //console.log("3. Nuclear Cleanup Complete.");
      
      // HARD REDIRECT
      
      //window.location.replace('/');
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login: handleLogin, 
      logout: handleLogout,
      register: handleRegister, // Added to provider value
      setUser
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