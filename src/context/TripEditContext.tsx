/* ==========================================================================
  CONTEXT: TripEditContext
  DESCRIPTION: API Calls Only
========================================================================== */

import React, { createContext, useContext, useCallback } from 'react';
// 1. 👇 Added updateStopInDB to your API imports
import { getAllTrips, updateTrip, getTripById, updateStopInDB } from '../services/api';
import { useDashboard } from './DashboardContext';
import { useMyState } from './StatesContext';

interface TripEdit {
  loadTrip: (slug: string) => Promise<void>;
  handleAutoSave: () => Promise<void>;
  syncTripStats: (miles: number, minutes: number, budget: number) => Promise<void>;
  fetchInitialData: () => Promise<void>;
  // 2. 👇 Added the missing function to the interface
  updateStop: (stopId: string | number, updates: any) => Promise<void>;
}

const TripEditContext = createContext<TripEdit | undefined>(undefined);

export const TripEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const {
    setLoading, setAllTrips, tripDetails, setTripDetails,
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
  }, [setLoading, setTripDetails, setTempId, setTempTitle, setTempSummary, setTempNote, setTempSegments, setTempStartDate, setTempStartTime, setTempStatus, setTempRating]); 

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
          start_date: tempStartDate,
          start_time: tempStartTime,
          status: tempStatus,
          trip_rating: tempRating,
          total_budget: totalBudget,
          total_distance: totalMiles,
          total_time: totalMinutes
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
      const updated = await updateTrip(tripDetails.id, payload);
      if (updated) setTripDetails(updated); 
    } catch (err) {
      console.error("❌ Special Sync failed:", err);
    }
  };

  // 3. 👇 ADDED: The missing function to update an individual stop
  const updateStop = async (stopId: string | number, updates: any) => {
    try {
      // Update local state instantly (triggers the ripple calculation)
      setTempSegments((prev: any[]) => prev.map(s => s.id === stopId ? { ...s, ...updates } : s));

      // Push to the database
      await updateStopInDB(stopId, updates);
      console.log(`✅ Stop ${stopId} updated in DB.`);
    } catch (err) {
      console.error("❌ Failed to update stop:", err);
    }
  };

  return (
    <TripEditContext.Provider value={{ 
      loadTrip,
      handleAutoSave,
      fetchInitialData,
      syncTripStats,
      updateStop // 4. 👇 Exported here
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