//**
// This will be used for States Only */

import React, { createContext, useContext, useState } from 'react';
import { type UniqueIdentifier } from '@dnd-kit/core';

// 1. Define the "Shape" of the data
interface StateInterface {
  loading: boolean;
  setLoading:React.Dispatch<React.SetStateAction<boolean>>;
  allTrips: any[] | null;
  setAllTrips: React.Dispatch<React.SetStateAction<any[] | null>>;
  tripDetails: Trip | null; 
  setTripDetails: React.Dispatch<React.SetStateAction<Trip | null>>;
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

// 2. Create the Context with an undefined default
const MyStateContext = createContext<StateInterface | undefined>(undefined);

// 3. The Provider Component
export const MyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false); ///Setting the Loading State for Each Page 
  const [allTrips, setAllTrips] = useState<any[] | null>(null);
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const [titleEdit, setTitleEdit] = useState(false);
  const [summaryEdit, setSummaryEdit] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const [tempId, setTempId] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempSummary, setTempSummary] = useState('');
  const [tempNote, setTempNote] = useState<string>('');
  const [tempSegments, setTempSegments] = useState<Stop[]>([]);


  const value = {
    loading, setLoading,
    allTrips, setAllTrips,
    tripDetails, setTripDetails,
    titleEdit, setTitleEdit,
    summaryEdit, setSummaryEdit,
    noteEdit, setNoteEdit,
    tempId, setTempId, 
    tempTitle, setTempTitle,
    tempSummary, setTempSummary,
    tempNote, setTempNote,
    tempSegments, setTempSegments
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