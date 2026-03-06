//**
// This will be used for States Only */

import React, { createContext, useContext, useState } from 'react';

// 1. Define the "Shape" of the data
interface StateInterface {
  loading: boolean;
  setLoading:React.Dispatch<React.SetStateAction<boolean>>;
  allTrips: any[] | null;
  setAllTrips: React.Dispatch<React.SetStateAction<any[] | null>>;
}

// 2. Create the Context with an undefined default
const MyStateContext = createContext<StateInterface | undefined>(undefined);

// 3. The Provider Component
export const MyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false); ///Setting the Loading State for Each Page 
  const [allTrips, setAllTrips] = useState<any[] | null>(null);




  const value = {
    loading, setLoading,
    allTrips, setAllTrips
  };

  return (
    <MyStateContext.Provider value={value}>
      {children}
    </MyStateContext.Provider>
  );
};

// 4. The Custom Hook (This makes use in components clean)
export const useMyState = () => {
  const context = useContext(MyStateContext);
  if (context === undefined) {
    throw new Error('useMyState must be used within a MyStateProvider');
  }
  return context;
};