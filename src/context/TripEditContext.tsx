/* ==========================================================================
  CONTEXT: TripEditContext
  DESCRIPTION: API Calls Only
                
========================================================================== */

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { getAllTrips } from '../services/api';

import { type UniqueIdentifier } from '@dnd-kit/core';
import { updateTrip, getTripById, createStopInDB, updateStopsBatch } from '../services/api';
import { useDashboard } from './DashboardContext';
import { useMyState } from './StatesContext';

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
  total_distance?: number; 
  total_time?: number;     // OPTION 1: Stored as Float (decimal hours)
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
  totalTimeFormatted: string; // String for the UI ("4h 30m")
  totalTimeDecimal: number;   // Float for the DB (4.5)
  addWaypoint: (insertIndex: number) => Promise<void>;

  //New Items
  fetchInitialData: () => Promise<void>;
}
// #endregion

const TripEditContext = createContext<TripEdit | undefined>(undefined);

export const TripEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {

  const {loading, setLoading, setAllTrips} = useMyState();


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
          trip_notes: tempNote,
          total_time:totalTimeDecimal
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

  // #region --- MATH & ACTIONS ---
  
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
  // #endregion

  // #region --- MASTER STATS WATCHER ---
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
  // #endregion


  //================================Stuff To Keep 

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
      totalTimeDecimal,
      addWaypoint,
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