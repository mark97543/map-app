/* ==========================================================================
  CONTEXT: TripEditContext
  DESCRIPTION: API Calls Only
                
========================================================================== */

import React, { createContext, useContext, useEffect, useCallback } from 'react';
import { getAllTrips } from '../services/api';


import { updateTrip, getTripById } from '../services/api';
import { useDashboard } from './DashboardContext';
import { useMyState } from './StatesContext';


interface TripEdit {
  loadTrip: (slug: string) => Promise<void>;
  handleAutoSave: () => Promise<void>;
  syncTripStats : (miles: number, minutes:number, budget:number)=>Promise<void>;
  fetchInitialData: () => Promise<void>;
}

const TripEditContext = createContext<TripEdit | undefined>(undefined);

export const TripEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const {setLoading, setAllTrips, tripDetails, setTripDetails,
    setTitleEdit, setSummaryEdit, setNoteEdit, tempId, tempTitle,
    tempSummary, tempNote, setTempSegments, setTempId,
    setTempTitle, setTempSummary, setTempNote, tempStartDate, tempStartTime, tempStatus, tempRating,
    setTempStartDate, setTempStartTime, setTempStatus, setTempRating, totalMiles, totalBudget, totalMinutes
  } = useMyState();

  const {} = useDashboard();

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const data = await getAllTrips();
      //console.log("Fetched All Trips:", data);
      setAllTrips(data);
    } catch (error) {
      console.error("Error loading gallery:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadTrip = useCallback(async (currentSlug: string) => {
    if (!currentSlug) return;
    setLoading(true);
    try {
      const data = await getTripById(currentSlug);
      if (data) {
        setTripDetails(data);
        setTempId(data.trip_id || '');
        setTempTitle(data.title || '');
        setTempSummary(data.trip_summary || '');
        setTempNote(data.trip_notes || '');
        setTempSegments(data.stops || []);
        setTempStartDate(data.start_date || '');
        setTempStartTime(data.start_time || '');
        setTempStatus(data.status || 'draft')
        setTempRating(data.trip_rating || 0);

      }
    } catch (err) {
      console.error("Failed to load trip:", err);
    } finally {
      setLoading(false);
    }
  }, []); 

  const handleAutoSave = async () => {
    setTitleEdit(false);
    setSummaryEdit(false);
    setNoteEdit(false);
    if (!tripDetails?.id) return;

    const hasChanges = 
      tempId !== tripDetails.trip_id || 
      tempTitle !== tripDetails.title || 
      tempSummary !== tripDetails.trip_summary || 
      tempNote !== tripDetails.trip_notes ||
      tempStartDate !== tripDetails.start_date ||
      tempStartTime !== tripDetails.start_time || 
      tempStatus !== tripDetails.status ||
      tempRating !== tripDetails.trip_rating ||
      totalBudget !== tripDetails.total_budget ||
      totalMiles !== tripDetails.total_distance ||
      totalMinutes !== tripDetails.total_time;


    if (hasChanges) {
      try {
        const payload = { 
          trip_id: tempId, 
          title: tempTitle,
          trip_summary: tempSummary,
          trip_notes: tempNote,
          start_date:tempStartDate,
          start_time:tempStartTime,
          status:tempStatus,
          trip_rating:tempRating,
          total_budget:totalBudget,
          total_distance: totalMiles,
          total_time:totalMinutes
        };
        const updated = await updateTrip(tripDetails.id, payload);
        if (updated) {
          setTripDetails(updated); 
        }
      } catch (err) {
        console.error("Save failed:", err);
      }
    }
  };

  const syncTripStats = async (miles: number, minutes: number, budget: number) => {
    if (!tripDetails?.id) return;

    try {
      const payload = {
        total_distance: miles,
        total_time: minutes,
        total_budget: budget
      };

      console.log("⚡ Special Sync: Pushing Stats...", payload);
      
      const updated = await updateTrip(tripDetails.id, payload);
      
      if (updated) {
        setTripDetails(updated); // Keep the local trip details in sync
        console.log("✅ Stats specialized save complete.");
      }
    } catch (err) {
      console.error("❌ Special Sync failed:", err);
    }
  };


  return (
    <TripEditContext.Provider value={{ 
      loadTrip,
      handleAutoSave,
      fetchInitialData,
      syncTripStats
    }}>
      {children}
    </TripEditContext.Provider>
  );
};

export const useTripEdit = () => {
  const context = useContext(TripEditContext);
  if (context === undefined) {
    throw new Error('useTripEdit must be used within a TripEditProvider');
  }
  return context;
};