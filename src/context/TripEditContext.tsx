/* ==========================================================================
  CONTEXT: TripEditContext
  DESCRIPTION: API Calls Only
                
========================================================================== */

import React, { createContext, useContext, useEffect, useMemo, useCallback } from 'react';
import { getAllTrips } from '../services/api';


import { updateTrip, getTripById, createStopInDB, updateStopsBatch } from '../services/api';
import { useDashboard } from './DashboardContext';
import { useMyState } from './StatesContext';


interface TripEdit {
  loadTrip: (slug: string) => Promise<void>;
  handleAutoSave: () => Promise<void>;
 
  fetchInitialData: () => Promise<void>;
}
// #endregion

const TripEditContext = createContext<TripEdit | undefined>(undefined);

export const TripEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const {setLoading, setAllTrips, tripDetails, setTripDetails,
    setTitleEdit, setSummaryEdit, setNoteEdit, tempId, tempTitle,
    tempSummary, tempNote, setTempSegments, setTempId,
    setTempTitle, setTempSummary, setTempNote
  } = useMyState();

  const {totalBudget, totalMiles, totalTimeDecimal} = useDashboard();

  //MASTER STATS WATCHER ---
  useEffect(() => {
    if (!tripDetails?.id) return;

    const dbBudget = Number(tripDetails.total_budget) || 0;
    const dbDistance = Number(tripDetails.total_distance) || 0; 
    const dbTime = Number(tripDetails.total_time) || 0; // Float from DB

    const statsChanged = 
      totalBudget !== dbBudget || 
      totalMiles !== dbDistance || 
      totalTimeDecimal !== dbTime;

    if (statsChanged) {
      const syncTimer = setTimeout(async () => {
        try {
          const payload = { 
            total_budget: totalBudget,
            total_distance: totalMiles, 
            total_time: totalTimeDecimal // Sending the Float!
          };

          const updated = await updateTrip(tripDetails.id, payload);
          if (updated) {
            setTripDetails(updated); 
            console.log(`📊 Stats Synced: $${totalBudget} | ${totalMiles}mi | ${totalTimeDecimal}hrs`);
          }
        } catch (error) {
          console.error("Failed to auto-sync trip stats:", error);
        }
      }, 1000); 

      return () => clearTimeout(syncTimer); 
    }
  }, [totalBudget, totalMiles, totalTimeDecimal, tripDetails]);

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
      tempNote !== tripDetails.trip_notes;

    if (hasChanges) {
      try {
        const payload = { 
          trip_id: tempId, 
          title: tempTitle,
          trip_summary: tempSummary,
          trip_notes: tempNote,
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


  return (
    <TripEditContext.Provider value={{ 
      loadTrip,
      handleAutoSave,
      fetchInitialData
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