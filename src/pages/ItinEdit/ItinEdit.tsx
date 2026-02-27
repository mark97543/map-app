import './ItinEdit.css'
import { useParams } from 'react-router-dom'
import { useDashboard } from '../../context/DashboardContext'
import { useEffect, useState } from 'react'
import { getTripById, updateTrip } from '../../services/api'
import SlugTitle from './Parts/1_TitleBlock'
import TripSummary from './Parts/TripSummary'

export interface Trip{
  id:number;
  title:string;
  trip_id:string;
  trip_summary:string;
}

const ItinEdit = () =>{
  const {slug}=useParams<{slug:string}>(); //Grab the slug
  const [tripDetails, setTripDetails] = useState<Trip | null>(null);
  const {triggerRefresh}=useDashboard();
  const [segments, setSegments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [titleEdit, setTitleEdit]=useState(false);
  const [summaryEdit, setSummaryEdit]=useState(false);

  const [tempId, setTempId] = useState(tripDetails?.trip_id || '');
  const [tempTitle, setTempTitle] = useState(tripDetails?.title || '');
  const [tempSummary, setTempSummary]=useState(tripDetails?.trip_summary || '');


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
    if (!tripDetails?.id) return;

    if (tempId !== tripDetails.trip_id || tempTitle !== tripDetails.title || tempSummary !== tripDetails.trip_summary) {
      try {
        // 1. Send the update to Directus
        const updated = await updateTrip(tripDetails.id, { 
          trip_id: tempId, 
          title: tempTitle,
          trip_summary:tempSummary
        });

        if (updated) {
          // 2. IMPORTANT: Update the source of truth with server data
          setTripDetails(updated); 
          
          // 3. IMPORTANT: Immediately sync temp states to match the new truth
          // This prevents the next edit from using stale local values
          setTempId(updated.trip_id);
          setTempTitle(updated.title);
          setTempSummary(updated.trip_summary)
          
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



    </div>
  )
}

export default ItinEdit


/* -------------------------------------------------------------------------- */
/*                               FUTURE UPDATES                               */
/* -------------------------------------------------------------------------- */
//TODO: On completed allow to add pictures and have carosel 