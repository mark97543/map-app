/* ==========================================================================
  CONTEXT: TripEditContext
  DESCRIPTION: The "Brain" for the Itinerary Editor. 
                Handles Mapbox Batching, Time Ripples, and Directus Sync.
========================================================================== */

import React, { createContext, useContext, useState } from 'react';
import { type UniqueIdentifier } from '@dnd-kit/core';
import { updateTrip } from '../services/api';
import { useDashboard } from './DashboardContext';


// #region -----Interfaces
interface TripEdit{
  loading:boolean;
  setLoading:(loading:boolean)=>void;
  tripDetails: Trip | null; 
  setTripDetails: (trip: Trip | null) => void;
  titleEdit:boolean;
  setTitleEdit:(edit:boolean)=>void;
  tempId:string;
  setTempId:(val:string)=>void;
  tempTitle:string;
  setTempTitle:(val:string)=>void;
  handleAutoSave: () => Promise<void>;
  summaryEdit:boolean;
  setSummaryEdit:(val:boolean)=>void;
  noteEdit:boolean;
  setNoteEdit:(val:boolean)=>void;
  tempSummary:string;
  setTempSummary:(val:string)=>void;
  tempNote:string;
  setTempNote:(val:string)=>void;
  tempSegments:Stop[];
  setTempSegments:React.Dispatch<React.SetStateAction<Stop[]>>;
}

export interface Trip {
  id: number;
  title: string;
  trip_id: string;
  trip_summary: string;
  trip_notes: string;
  total_budget?: number; // Ensures Directus total_budget syncs properly
  stops?: Stop[];
}

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

// #endregion


const TripEditContext = createContext<TripEdit | undefined>(undefined);

export const TripEditProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading]=useState(false)
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const [titleEdit, setTitleEdit] = useState(false);
  const [tempId, setTempId] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [summaryEdit, setSummaryEdit] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const [tempSummary, setTempSummary] = useState('');
  const [tempNote, setTempNote] = useState<string>('');
  const [tempSegments, setTempSegments] = useState<Stop[]>([]);


  const { triggerRefresh } = useDashboard();

  const handleAutoSave = async () => {
    setTitleEdit(false);
    setSummaryEdit(false);
    setNoteEdit(false);

    if (!tripDetails?.id) return;

    // Change Detection for text fields (Budget is handled by the Watcher above)
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
        // Error Recovery (Rollback UI to match DB)
        setTempId(tripDetails.trip_id);
        setTempTitle(tripDetails.title);
        setTempSummary(tripDetails.trip_summary);
        setTempNote(tripDetails.trip_notes);
        console.error("Save failed:", err);
      }
    }
  };

  return (
    <TripEditContext.Provider value={{ 
      loading,
      setLoading,
      tripDetails,
      setTripDetails,
      titleEdit,
      setTitleEdit,
      tempId,
      setTempId,
      tempTitle,
      setTempTitle,
      handleAutoSave,
      summaryEdit,
      setSummaryEdit,
      noteEdit,
      setNoteEdit,
      tempSummary,
      setTempSummary,
      tempNote,
      setTempNote,
      tempSegments,
      setTempSegments
    }}>
      {children}
    </TripEditContext.Provider>
  );

}

// THE CUSTOM HOOK: The "Easy Button" to get the data out.
export const useTripEdit = () => {
  const context = useContext(TripEditContext);
  if (context === undefined) {
    throw new Error('useTripEdit must be used within a TripEditProvider');
  }
  return context;
};