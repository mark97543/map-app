//Functions only

import React, { createContext, useContext, useState } from 'react';

import { useMyState } from './StatesContext';

interface DashboardContextType {
  
 
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const {} = useMyState();

  // const fetchInitialData = async () => {
  //   setLoading(true);
  //   try {
  //     const data = await getAllTrips();
  //     //console.log("Fetched All Trips:", data);
  //     setAllTrips(data);
  //   } catch (error) {
  //     console.error("Error loading gallery:", error);
  //   } finally {
  //     setLoading(false);
  //   }
  // };


  // Fix: We must return the Provider and pass the values here!
  return (
    <DashboardContext.Provider value={{ }}>
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