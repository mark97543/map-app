//Functions only

import React, { createContext, useContext, useState, useMemo } from 'react';
import { useMyState } from './StatesContext';
import {createStopInDB, updateStopsBatch } from '../services/api';

interface DashboardContextType {
  totalBudget: number;
  totalMiles: number;
  totalTimeFormatted: string; // String for the UI ("4h 30m")
  totalTimeDecimal: number;   // Float for the DB (4.5)
  addWaypoint: (insertIndex: number) => Promise<void>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  
  const {tempSegments, tripDetails,setTempSegments} = useMyState();

  const totalBudget = useMemo(() => {
    return (tempSegments ?? []).reduce((runningTotal: number, currentStop: any) => {
      return runningTotal + (Number(currentStop.budget) || 0);
    }, 0);
  }, [tempSegments]);

    const totalMiles = useMemo(() => {
      return (tempSegments ?? []).reduce((sum, stop) => sum + (Number(stop.drive_to_next_miles) || 0), 0);
    }, [tempSegments]);
  
  // Intermediate Calculation: Total Minutes
  const totalMinutes = useMemo(() => {
    return (tempSegments ?? []).reduce((sum, stop) => {
      const stay = Number(stop.stay_time) || 0;
      const drive = Number(stop.drive_to_next_minutes) || 0;
      return sum + stay + drive;
    }, 0);
  }, [tempSegments]);

  // STAT 1: For the UI Dashboard (String)
  const totalTimeFormatted = useMemo(() => {
    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }, [totalMinutes]);

  // STAT 2: For the Database (Float)
  const totalTimeDecimal = useMemo(() => {
    return Number((totalMinutes / 60).toFixed(2));
  }, [totalMinutes]);

  const addWaypoint = async (insertIndex: number) => {
    if (!tripDetails?.id) return;
    const blankStop = {
      trip_id: tripDetails.id,
      sort: insertIndex + 2,
      name: 'New Waypoint',
      lat: null, lng: null,
      stay_time: 0, 
      type: 'stop', 
      note: '', budget: 0, morning_depart: null,
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
      totalBudget,
      totalMiles, 
      addWaypoint,
      totalTimeDecimal, 
      totalTimeFormatted,
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