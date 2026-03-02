/* ==========================================================================
   COMPONENT: ItinEdit
   DESCRIPTION: Main "Source of Truth" for Trip Editing. Manages state for 
                metadata, rich text notes, and the draggable route order.
                Includes auto-syncing logic for derived data (like budgets).
   ========================================================================== */

import './ItinEdit.css'
import { useParams } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { useEffect } from 'react'
import { getTripById, updateTrip } from '../../services/api'
import SlugTitle from './Parts/1_TitleBlock'
import TripSummary from './Parts/TripSummary'
import TripNote from './Parts/TripNote'
import { StopsList } from './Parts/StopsList'
import { type UniqueIdentifier } from '@dnd-kit/core';
import { useTripEdit } from '../../context/TripEditContext'

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
  drive_to_next_minutes?: number | null;
  drive_to_next_miles?: number | null;
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
// #endregion

const ItinEdit = () => {
  const {
    loading, 
    setLoading,
    tripDetails,
    setTripDetails,
    setTempId,
    setTempTitle,
    setTempSummary,
    setTempNote,
    tempSegments,
    setTempSegments
  } = useTripEdit();

  const { slug } = useParams<{ slug: string }>();
  const { triggerRefresh } = useDashboard();

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

  // #region --- BUDGET MATH & WATCHER ---
  // 1. Calculate the real-time total from the visible UI segments
  const totalBudget = (tempSegments ?? []).reduce((runningTotal: number, currentStop: any) => {
    const stopBudget = Number(currentStop.budget) || 0;
    return runningTotal + stopBudget;
  }, 0);

  // 2. Watcher: If the UI total ever drifts from the DB total, sync it automatically!
  useEffect(() => {
    if (!tripDetails?.id) return;

    const dbBudget = Number(tripDetails.total_budget) || 0;

    if (totalBudget !== dbBudget) {
      const syncBudget = async () => {
        try {
          const updated = await updateTrip(tripDetails.id, { total_budget: totalBudget });
          if (updated) {
            setTripDetails(updated); // Update local state so it stops watching
            triggerRefresh(); // Tell the dashboard to fetch the new number
            console.log(`💸 Budget auto-synced with server: $${totalBudget}`);
          }
        } catch (error) {
          console.error("Failed to auto-sync budget:", error);
        }
      };
      syncBudget();
    }
  }, [totalBudget, tripDetails?.id, tripDetails?.total_budget, triggerRefresh]);
  // #endregion

  if (loading) return <div className="loading-screen">Loading Trip Details...</div>;
  if (!tripDetails) return <div className="error-screen">Trip not found.</div>;

  return (
    <div className='EDIT_wrapper'>
   
      <SlugTitle />

      <TripSummary/>

      <TripNote />

      <p className='ITIN_EDIT_note'><i>Double Click An Item To Edit</i></p>

      <StopsList/>

    </div>
  )
}

export default ItinEdit;

/* -------------------------------------------------------------------------- */
/* Helper Functions                                                           */
/* -------------------------------------------------------------------------- */



/* ==========================================================================
   FUTURE UPDATES & ROADMAP
   ========================================================================== */
// #region --- TODOS ---
/**
 * TODO: On completed, allow to add pictures and have carousel
 * TODO: Implement "Time Ripple" calculation logic for Stop arrival/departure
 */
// #endregion