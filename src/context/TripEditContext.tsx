/* ==========================================================================
  CONTEXT: TripEditContext
  DESCRIPTION: The "Brain" for the Itinerary Editor. 
                Handles Fetching, Global State, Math, and Directus Sync.
========================================================================== */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { type UniqueIdentifier } from '@dnd-kit/core';
import { updateTrip, getTripById, createStopInDB, updateStopsBatch } from '../services/api';
import { useDashboard } from './DashboardContext';

// #region ----- Interfaces -----
export interface Stop {
  id: UniqueIdentifier;
  sort: number;         
  name: string;         
  lat: number | null;   
  lng: number | null;
  stay_time: number | null;
  type: string;         
  note: string | null;
  budget: number | null;
  trip_id: number;
  morning_depart: string | null;
  // GUI Calculated Fields
  arrival_time?: string;
  departure_time?: string;
  drive_to_next_minutes?: number | null;
  drive_to_next_miles?: number | null;
}

export interface Trip {
  id: number;
  title: string;
  trip_id: string;
  trip_summary: string;
  trip_notes: string;
  total_budget?: number;
  total_miles?: number; // NEW: Added to DB Interface
  total_time?: string;  // NEW: Added to DB Interface
  stops?: Stop[];
}

interface TripEdit {
  loading: boolean;
  setLoading: (loading: boolean) => void;
  tripDetails: Trip | null; 
  setTripDetails: React.Dispatch<React.SetStateAction<Trip | null>>;
  loadTrip: (slug: string) => Promise<void>;
  
  titleEdit: boolean;
  setTitleEdit: (edit: boolean) => void;
  summaryEdit: boolean;
  setSummaryEdit: (val: boolean) => void;
  noteEdit: boolean;
  setNoteEdit: (val: boolean) => void;
  
  tempId: string;
  setTempId: (val: string) => void;
  tempTitle: string;
  setTempTitle: (val: string) => void;
  tempSummary: string;
  setTempSummary: (val: string) => void;
  tempNote: string;
  setTempNote: (val: string) => void;
  tempSegments: Stop[];
  setTempSegments: React.Dispatch<React.SetStateAction<Stop[]>>;
  
  handleAutoSave: () => Promise<void>;
  
  // Stats & Actions
  totalBudget: number;
  totalMiles: number;
  totalTimeFormatted: string;
  addWaypoint: (insertIndex: number) => Promise<void>;
}
// #endregion

const TripEditContext = createContext<TripEdit | undefined>(undefined);

export const TripEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { triggerRefresh } = useDashboard();

  const [loading, setLoading] = useState(false);
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const [titleEdit, setTitleEdit] = useState(false);
  const [summaryEdit, setSummaryEdit] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const [tempId, setTempId] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempSummary, setTempSummary] = useState('');
  const [tempNote, setTempNote] = useState<string>('');
  const [tempSegments, setTempSegments] = useState<Stop[]>([]);

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
          trip_notes: tempNote
        };

        const updated = await updateTrip(tripDetails.id, payload);

        if (updated) {
          setTripDetails(updated); 
          triggerRefresh();
          console.log("✅ Trip metadata synced with server.");
        }
      } catch (err) {
        setTempId(tripDetails.trip_id);
        setTempTitle(tripDetails.title);
        setTempSummary(tripDetails.trip_summary);
        setTempNote(tripDetails.trip_notes);
        console.error("Save failed:", err);
      }
    }
  };

  // #region --- MATH & ACTIONS ---
  
  const totalBudget = useMemo(() => {
    return (tempSegments ?? []).reduce((runningTotal: number, currentStop: any) => {
      const stopBudget = Number(currentStop.budget) || 0;
      return runningTotal + stopBudget;
    }, 0);
  }, [tempSegments]);

  const totalMiles = useMemo(() => {
    return (tempSegments ?? []).reduce((sum, stop) => sum + (Number(stop.drive_to_next_miles) || 0), 0);
  }, [tempSegments]);

  const totalTimeFormatted = useMemo(() => {
    const totalMinutes = (tempSegments ?? []).reduce((sum, stop) => {
      const stay = Number(stop.stay_time) || 0;
      const drive = Number(stop.drive_to_next_minutes) || 0;
      return sum + stay + drive;
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const mins = totalMinutes % 60;
    return `${hours}h ${mins}m`;
  }, [tempSegments]);

  const addWaypoint = async (insertIndex: number) => {
    if (!tripDetails?.id) return;
    
    // 1. Build the blank stop data
    const blankStop = {
      trip_id: tripDetails.id,
      sort: insertIndex + 2, // Will be normalized below
      name: 'New Waypoint',
      lat: null, lng: null,
      stay_time: 0, 
      type: 'stop', 
      note: '', budget: 0, morning_depart: null,
    };

    try {
      // 2. Create the real stop in Directus FIRST to get a valid DB ID
      const newStopFromDB = await createStopInDB(blankStop);

      // 3. Insert the real stop into our local array at the exact right spot
      const updatedSegments = [...tempSegments];
      updatedSegments.splice(insertIndex + 1, 0, newStopFromDB);

      // 4. Re-normalize the sort orders so DND-kit and Directus are perfectly synced
      const reSortedSegments = updatedSegments.map((stop, i) => ({ ...stop, sort: i + 1 }));
      
      // 5. Update the UI instantly
      setTempSegments(reSortedSegments);

      // 6. Quietly update the sort order in the database for all the stops that shifted down
      await updateStopsBatch(reSortedSegments);
      
      console.log("📍 Waypoint inserted with real DB ID!");
      
    } catch (error) {
      console.error("❌ Failed to create waypoint in DB:", error);
      alert("Could not insert waypoint. Check your connection.");
    }
  };

  // #endregion

  // #region --- MASTER STATS WATCHER ---
  useEffect(() => {
    if (!tripDetails?.id) return;

    // Grab the current values from the database
    const dbBudget = Number(tripDetails.total_budget) || 0;
    const dbMiles = Number(tripDetails.total_miles) || 0;
    const dbTime = tripDetails.total_time || "";

    // Check if ANY of our local calculations differ from the database
    const statsChanged = 
      totalBudget !== dbBudget || 
      totalMiles !== dbMiles || 
      totalTimeFormatted !== dbTime;

    if (statsChanged) {
      // Debounce the save so it doesn't spam the database while typing or calculating
      const syncTimer = setTimeout(async () => {
        try {
          const payload = { 
            total_budget: totalBudget,
            total_miles: totalMiles,
            total_time: totalTimeFormatted
          };

          const updated = await updateTrip(tripDetails.id, payload);
          if (updated) {
            setTripDetails(updated); 
            triggerRefresh(); 
            console.log(`📊 Stats auto-synced! Budget: $${totalBudget} | Miles: ${totalMiles} | Time: ${totalTimeFormatted}`);
          }
        } catch (error) {
          console.error("Failed to auto-sync trip stats:", error);
        }
      }, 1000); 

      return () => clearTimeout(syncTimer); 
    }
  }, [totalBudget, totalMiles, totalTimeFormatted, tripDetails, triggerRefresh]);
  // #endregion

  return (
    <TripEditContext.Provider value={{ 
      loading, setLoading,
      tripDetails, setTripDetails,
      loadTrip,
      titleEdit, setTitleEdit,
      summaryEdit, setSummaryEdit,
      noteEdit, setNoteEdit,
      tempId, setTempId,
      tempTitle, setTempTitle,
      tempSummary, setTempSummary,
      tempNote, setTempNote,
      tempSegments, setTempSegments,
      handleAutoSave,
      totalBudget,
      totalMiles,
      totalTimeFormatted,
      addWaypoint 
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