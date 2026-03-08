// Functions only

import React, { createContext, useContext, useMemo, useEffect } from 'react';
import { useMyState } from './StatesContext';
import { createStopInDB, updateStopsBatch, updateTrip } from '../services/api';



interface DashboardContextType {
  addWaypoint: (insertIndex: number) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const { tempSegments, setTempSegments, tripDetails, calculatedStops, setTotalMiles, setTotalMinutes, setTotalBudget, setTripDetails } = useMyState();

  // ADD WAYPOINT CRUD
  const addWaypoint = async (insertIndex: number) => {
    if (!tripDetails?.id) return;
    
    const blankStop = {
      trip_id: tripDetails.id,
      sort: insertIndex + 2,
      name: 'New Waypoint',
      lat: null, lng: null,
      stay_time: 0, 
      type: 'stop', 
      note: '', 
      budget: 0, 
      morning_depart: null,
    };

    try {
      const newStopFromDB = await createStopInDB(blankStop);
      const updatedSegments = [...tempSegments];
      updatedSegments.splice(insertIndex + 1, 0, newStopFromDB);
      
      const reSortedSegments = updatedSegments.map((stop, i) => ({ ...stop, sort: i + 1 }));
      setTempSegments(reSortedSegments);
      
      await updateStopsBatch(reSortedSegments);
    } catch (error) {
      console.error("❌ Failed to create waypoint:", error);
    }
  };


  return (
    <DashboardContext.Provider value={{
      addWaypoint
    }}>
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