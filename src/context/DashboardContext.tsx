import React, { createContext, useContext, useEffect, useState } from 'react';
import { getAllTrips } from '../services/api';

interface DashboardContextType {
  allTrips: any[] | null;
  loading: boolean;
  fetchInitialData: () => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [allTrips, setAllTrip] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

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
    <DashboardContext.Provider value={{ allTrips, loading, fetchInitialData }}>
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