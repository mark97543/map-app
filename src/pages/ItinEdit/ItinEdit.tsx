import './ItinEdit.css'
import { useParams } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { useEffect, useState } from 'react'
import { getTripById, updateTrip } from '../../services/api'
import SlugTitle from './Parts/1_TitleBlock'
import TripSummary from './Parts/TripSummary'
import TripNote from './Parts/TripNote'
import StopsList from './Parts/StopsList'
import { type UniqueIdentifier } from '@dnd-kit/core';

export interface Stop {
  id: UniqueIdentifier;
  sort: number;         // Note: Directus uses 'sort', not 'sort_order'
  name: string;         // Note: Directus uses 'name', not 'location_name'
  lat: string | null;   // Comes as "32.77670"
  lng: string | null;
  stay_time: number;
  type: string;         // e.g., "origin"
  note: string | null;
  budget: string;
  trip_id: number;
  
  // GUI Calculated Fields
  arrival_time?: string;
  departure_time?: string;
}

export interface Trip{
  id:number;
  title:string;
  trip_id:string;
  trip_summary:string;
  trip_notes:string;
}

const ItinEdit = () =>{
  const {slug}=useParams<{slug:string}>(); //Grab the slug
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const {triggerRefresh}=useDashboard();
  const [segments, setSegments] = useState<Stop[]>([]);
  const [loading, setLoading] = useState(true);
  const [titleEdit, setTitleEdit]=useState(false);
  const [summaryEdit, setSummaryEdit]=useState(false);
  const [noteEdit, setNoteEdit]=useState(false);

  const [tempId, setTempId] = useState(tripDetails?.trip_id || '');
  const [tempTitle, setTempTitle] = useState(tripDetails?.title || '');
  const [tempSummary, setTempSummary]=useState(tripDetails?.trip_summary || '');
  const [tempNote, setTempNote] = useState<string>(tripDetails?.trip_notes || '');
  const [tempSegments, setTempSegments]=useState<Stop[]>([]);

  useEffect(()=>{
    const fetchFullTrip = async () =>{
      if(!slug) return;

      setLoading(true)
      try{
        const data = await  getTripById(slug);

        if(data){
          setTripDetails(data);
          setSegments(data.stops || []);

          // 🚀 Set temp states here!
          setTempId(data.trip_id);
          setTempTitle(data.title);
          setTempSummary(data.trip_summary);
          setTempNote(data.trip_notes)
          setTempSegments(data.stops)
        }
      } catch (err) {
        console.error("Failed to load full trip details:", err);
      } finally {
        setLoading(false);
      }  
    }
    fetchFullTrip();
  },[slug])

  const handleAutoSave = async () => {
    setTitleEdit(false);
    setSummaryEdit(false);
    setNoteEdit(false);
    if (!tripDetails?.id) return;

    if (tempId !== tripDetails.trip_id || tempTitle !== tripDetails.title || tempSummary !== tripDetails.trip_summary || tempNote !== tripDetails.trip_notes || tempSegments!==segments) {
      try {
        // 1. Send the update to Directus
        const updated = await updateTrip(tripDetails.id, { 
          trip_id: tempId, 
          title: tempTitle,
          trip_summary:tempSummary,
          trip_notes:tempNote,
          stops: tempSegments
        });

        if (updated) {
          // 2. IMPORTANT: Update the source of truth with server data
          setTripDetails(updated); 
          
          // 3. IMPORTANT: Immediately sync temp states to match the new truth
          // This prevents the next edit from using stale local values
          setTempId(updated.trip_id);
          setTempTitle(updated.title);
          setTempSummary(updated.trip_summary)
          setTempNote(updated.trip_notes)
          console.log("✅ Sync successful with server data.");
          triggerRefresh();
        }
      } catch (err) {
        // Rollback local display on error
        setTempId(tripDetails.trip_id);
        setTempTitle(tripDetails.title);
        console.error("Save failed:", err);
      }
    }
  };


  if (loading) return <div>Loading Trip Details...</div>;
  if (!tripDetails) return <div>Trip not found.</div>

  console.log('Trip Details: ', tripDetails);
  //console.log('Trip Segments: ', segments);

  return(
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

      <p className='ITIN_EDIT_note'><i>Double Click A Item To Edit</i></p>

      <StopsList
        stops={tempSegments}
        setStops={setTempSegments}
        handleAutoSave={handleAutoSave}
      />

    </div>
  )
}

export default ItinEdit


/* -------------------------------------------------------------------------- */
/*                               FUTURE UPDATES                               */
/* -------------------------------------------------------------------------- */
//TODO: On completed allow to add pictures and have carosel 
//TODO: On Page Exit need to save the editor 