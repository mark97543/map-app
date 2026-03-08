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
  tempStartDate: string;
  setTempStartDate: (val: string) => void;
  tempStartTime: string;
  setTempStartTime: (val: string) => void;
  tempStatus: string;
  setTempStatus: (val: string) => void;
  tempSegments: Stop[];
  setTempSegments: React.Dispatch<React.SetStateAction<Stop[]>>;
  calculatedStops: any[];
  setCalculatedStops: React.Dispatch<React.SetStateAction<any[]>>;
  tempRating: number;
  setTempRating: (val: number) => void;
  totalMiles:number;
  setTotalMiles:(val:number)=>void;
  totalMinutes:number;
  setTotalMinutes:(val:number)=>void;
  totalBudget:number;
  setTotalBudget:(val:number)=>void;
}

export interface Trip {
  id: number;
  title: string;
  trip_id: string;
  trip_summary: string;
  trip_notes: string;
  // ✅ ADDED: Database columns for Date, Time, and Status
  start_date?: string | null;
  start_time?: string | null;
  status?: string;
  total_budget?: number;
  total_distance?: number; 
  total_time?: number;    
  stops?: Stop[];
  trip_rating?:number;
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
  is_completed?: boolean;
  actual_arrival?: string | null;
  actual_departure?: string | null;
  actual_budget?: number | null;
}

// 2. Create the Context with an undefined default
const MyStateContext = createContext<StateInterface | undefined>(undefined);

// 3. The Provider Component
export const MyStateProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [loading, setLoading] = useState(false); 
  const [allTrips, setAllTrips] = useState<any[] | null>(null);
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const [titleEdit, setTitleEdit] = useState(false);
  const [summaryEdit, setSummaryEdit] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);
  const [tempId, setTempId] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempSummary, setTempSummary] = useState('');
  const [tempNote, setTempNote] = useState<string>('');
  const [tempStartDate, setTempStartDate] = useState('');
  const [tempStartTime, setTempStartTime] = useState('');
  const [tempStatus, setTempStatus] = useState('draft');
  const [tempSegments, setTempSegments] = useState<Stop[]>([]);
  const [calculatedStops, setCalculatedStops] = useState<any[]>([]);
  const [tempRating, setTempRating] = useState<number>(0);
  const [totalMiles, setTotalMiles]=useState<number>(0);
  const [totalMinutes, setTotalMinutes]=useState<number>(0);
  const [totalBudget, setTotalBudget]=useState<number>(0);

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
    tempStartDate, setTempStartDate,
    tempStartTime, setTempStartTime,
    tempStatus, setTempStatus,
    tempSegments, setTempSegments,
    calculatedStops, setCalculatedStops,
    tempRating, setTempRating,
    totalMiles, setTotalMiles,
    totalMinutes, setTotalMinutes,
    totalBudget, setTotalBudget
  };

  return (
    <MyStateContext.Provider value={value}>
      {children}
    </MyStateContext.Provider>
  );
};

// 4. The Custom Hook
export const useMyState = () => {
  const context = useContext(MyStateContext);
  if (context === undefined) {
    throw new Error('useMyState must be used within a MyStateProvider');
  }
  return context;
};