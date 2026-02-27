import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAllTrips } from '../services/api';

interface DashboardContextType {
  allTrips: any[] | null;
  loading: boolean;
  fetchInitialData: () => Promise<void>;
  refresh:number;
  triggerRefresh:() => void;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTrips, setAllTrip] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh]=useState(0);

  const triggerRefresh = () => setRefresh(prev => prev + 1);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const data = await getAllTrips();
      console.log("Fetched All Trips:", data);
      setAllTrip(data);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };


  // Fix: We must return the Provider and pass the values here!
  return (
    <DashboardContext.Provider value={{ allTrips, loading, fetchInitialData, refresh, triggerRefresh }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};