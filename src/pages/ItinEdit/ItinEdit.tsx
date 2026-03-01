/* ==========================================================================
   COMPONENT: ItinEdit
   DESCRIPTION: Main "Source of Truth" for Trip Editing. Manages state for 
                metadata, rich text notes, and the draggable route order.
   ========================================================================== */

import './ItinEdit.css'
import { useParams } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { useEffect, useState } from 'react'
import { getTripById, updateTrip } from '../../services/api'
import SlugTitle from './Parts/1_TitleBlock'
import TripSummary from './Parts/TripSummary'
import TripNote from './Parts/TripNote'
import {StopsList} from './Parts/StopsList'
import { type UniqueIdentifier } from '@dnd-kit/core';

// #region --- INTERFACES ---
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
}

export interface Trip {
  id: number;
  title: string;
  trip_id: string;
  trip_summary: string;
  trip_notes: string;
  stops?: Stop[];
}
// #endregion

const ItinEdit = () => {
  const { slug } = useParams<{ slug: string }>();
  const { triggerRefresh } = useDashboard();

  // --- Core Data ---
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);

  // --- UI Toggle States ---
  const [titleEdit, setTitleEdit] = useState(false);
  const [summaryEdit, setSummaryEdit] = useState(false);
  const [noteEdit, setNoteEdit] = useState(false);

  // --- Draft/Temp States (User Interactions) ---
  const [tempId, setTempId] = useState('');
  const [tempTitle, setTempTitle] = useState('');
  const [tempSummary, setTempSummary] = useState('');
  const [tempNote, setTempNote] = useState<string>('');
  const [tempSegments, setTempSegments] = useState<Stop[]>([]);

  // #region --- FETCH LOGIC ---
  useEffect(() => {
    const fetchFullTrip = async () => {
      if (!slug) return;
      setLoading(true);
      try {
        const data = await getTripById(slug);
        if (data) {
          setTripDetails(data);
          // Sync Draft States
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
    };
    fetchFullTrip();
  }, [slug]);
  // #endregion

  // #region --- AUTO-SAVE LOGIC ---
  const handleAutoSave = async () => {
    setTitleEdit(false);
    setSummaryEdit(false);
    setNoteEdit(false);

    if (!tripDetails?.id) return;

    // Change Detection
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
        // Error Recovery (Rollback)
        setTempId(tripDetails.trip_id);
        setTempTitle(tripDetails.title);
        setTempSummary(tripDetails.trip_summary);
        setTempNote(tripDetails.trip_notes);
        console.error("Save failed:", err);
      }
    }
  };
  // #endregion

  if (loading) return <div className="loading-screen">Loading Trip Details...</div>;
  if (!tripDetails) return <div className="error-screen">Trip not found.</div>;

  return (
    <div className='EDIT_wrapper'>
      <SlugTitle 
        titleEdit={titleEdit}
        tripDetails={tripDetails}
        setTempId={setTempId}
        setTempTitle={setTempTitle}
        tempId={tempId}
        tempTitle={tempTitle}
        handleAutoSave={handleAutoSave}
        setTitleEdit={setTitleEdit}
      />

      <TripSummary
        tripDetails={tripDetails}
        summaryEdit={summaryEdit}
        setSummaryEdit={setSummaryEdit}
        handleAutoSave={handleAutoSave}
        tempSummary={tempSummary}
        setTempSummary={setTempSummary}
      />

      <TripNote 
        noteEdit={noteEdit}
        setNoteEdit={setNoteEdit}
        tempNote={tempNote}
        setTempNote={setTempNote}
        handleAutoSave={handleAutoSave}
      />

      <p className='ITIN_EDIT_note'><i>Double Click An Item To Edit</i></p>

      <StopsList
        stops={tempSegments}
        setStops={setTempSegments}
        handleAutoSave={handleAutoSave} 
      />

    </div>
  )
}

export default ItinEdit;

/* ==========================================================================
   FUTURE UPDATES & ROADMAP
   ========================================================================== */
// #region --- TODOS ---
/**
 * TODO: On completed, allow to add pictures and have carousel
 * TODO: On Page Exit, implement prompt/logic to save the editor (dirty check)
 * TODO: Implement "Time Ripple" calculation logic for Stop arrival/departure
 */
// #endregion