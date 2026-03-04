/* ==========================================================================
   COMPONENT: ItinSelect
   DESCRIPTION: Dashboard view for selecting, filtering, creating, and deleting
                trips. Acts as the main entry point to the itinerary editor.
   ========================================================================== */

import './ItinSelect.css'
import { DashboardProvider, useDashboard } from '../../context/DashboardContext'
import KickAssLoader from '../KickAssLoader';
import { useEffect, useState } from 'react';
import Button from '../../assets/componets/Button/Button';
import Input from '../../assets/componets/Input/Input';
import Toggle from '../../assets/componets/Toggle/Toggle';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; 
import { createTrip, deleteTripFromDB } from '../../services/api'; 
import { useTripEdit } from '../../context/TripEditContext';

function ItinSelect(){
  const {loading, allTrips, fetchInitialData, refresh} = useDashboard();
  const [searchTerm, setSearchTerm]=useState('');
  const [showArchived, setShowArchived]=useState(false)
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  
  
  // #region --- DATA FETCHING ---
  useEffect(() => {
    // If we have a refresh trigger > 0, we ALWAYS fetch fresh data
    // Otherwise, only fetch if the list is empty (initial load)
    if (refresh > 0 || !allTrips) {
      fetchInitialData();
    }
  }, [refresh]);
  // #endregion

  // #region --- CREATE TRIP HANDLER ---
  const handleCreateTrip = async () => {
    if (isCreating) return;
    setIsCreating(true);
    try {
      // 1. Generate the ID
      const randomSlug = Math.random().toString(36).substring(2, 8).toUpperCase();
      
      const blankTrip = {
        title: "New Trip",
        trip_id: randomSlug,
        trip_summary: "Start planning your adventure...",
        status: "draft"
      };

      // 2. Send to DB
      const newTrip = await createTrip(blankTrip);

      // 3. HARD CHECK: Did the database actually create it?
      if (!newTrip) {
        throw new Error("Directus blocked the creation (Check permissions/payload).");
      }

      // 4. Fallback ID: Use the API response if it exists, otherwise use our generated slug
      const destinationId = newTrip.trip_id || randomSlug;

      // 5. Anti-Race Condition: Give the database 300ms to breathe before querying it
      setTimeout(() => {
        navigate(`/edit/${destinationId}`); 
      }, 300);

    } catch (error) {
      console.error("Failed to create trip:", error);
      alert("Could not create a new trip. Check the console for details.");
    } finally {
      setIsCreating(false);
    }
  };
  // #endregion

  // #region --- DELETE TRIP HANDLER ---
  const handleDeleteTrip = async (e: React.MouseEvent, tripId: number, tripTitle: string) => {
    e.stopPropagation(); // CRITICAL: Stops the card from navigating when clicking the trash can

    const confirm = window.confirm(`Are you absolutely sure you want to delete "${tripTitle}"? This will also delete all associated stops.`);
    
    if (confirm) {
      try {
        await deleteTripFromDB(tripId);
        fetchInitialData(); // Refresh the dashboard to remove the card
        console.log(`🗑️ Trip ${tripId} deleted.`);
      } catch (error) {
        alert("Failed to delete the trip.");
      }
    }
  };
  // #endregion

  // #region --- FILTERING LOGIC ---
  const displayTrips = allTrips?.filter(trip=>{
    const searchLower = searchTerm.toLowerCase();

    const matchesTitle = trip.title.toLowerCase().includes(searchLower);
    const matchesId = trip.trip_id?.toLowerCase().includes(searchLower);

    const isArchived = trip.status ==='archived';

    //If showArchived is false, exclude 'archived' status
    if (!showArchived && isArchived) return false;
    return matchesTitle || matchesId;
  })
  // #endregion

  if (loading && !allTrips) {
    return <KickAssLoader />;
  }

  return(
    <div className='ItinSelect_Wrapper'>
      
      <div className='ItinSelect_TopRow'>
        <div>        
          <h1>My Trips</h1>
          <h3>Trip Selection Gallery</h3>
        </div>
        <div className='Search_Container'>
          <Input 
            placeholder='Search Trips Here'
            value={searchTerm}
            change={(e) => setSearchTerm(e.target.value)}
            classer='ItinSelect_Search'
          />
          <Toggle 
            label="Show Archived" 
            checked={showArchived} 
            onChange={() => setShowArchived(!showArchived)} 
          />
        </div>
        <Button onClick={handleCreateTrip}>
          {isCreating ? 'Creating...' : '+ Create New Trip'}
        </Button>
      </div>

      <div className='ItinSelect_Grid'>
        {displayTrips && displayTrips.length>0?(
          displayTrips.map((trip)=>(
            <div key={trip.id} className='ItinSelect_TripCard' onClick={()=>navigate(`/edit/${trip.trip_id}`)} style={{ cursor: 'pointer' }}>
              
              {/* HEADER WITH DELETE BUTTON */}
              <div className="ItinSelect_CardHeader">
                <h2>{trip.trip_id}: {trip.title}</h2>
                <button 
                  className="ItinSelect_DeleteTripBtn"
                  onClick={(e) => handleDeleteTrip(e, trip.id, trip.title)}
                  title="Delete Trip"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {statusPill(trip.status, trip.trip_rating)}
              
              <div className='ItinSelect_Metrics'>
                <p>{trip.total_distance? trip.total_distance:"0"} <b>mi</b></p>
                <p className='ItinSelect_Met_Divider'>{timeConverter(trip.total_time)}</p>
                <p><b>$</b> {trip.total_budget? Number(trip.total_budget).toFixed(2):"0.00"}</p>
              </div>
              <div className='ItinSelect_Start_Date'>
                {trip.start_date? 
                <p>Planned Date: {trip.start_date}</p>
                : <p>No Start Date</p>}
              </div>
              <p className='ItinSelect_TripSummary'>{trip.trip_summary}</p>
            </div>
          ))
        ):(
          <p>No trips found. Time to hit the road!</p>
        )}
      </div>

    </div>
  )
}

export default ItinSelect

// #region --- HELPER COMPONENTS ---
const statusPill=(status:string, rating:number)=>{
  if(status==='draft'){
    return(<div className='draft_pill'>Draft</div>)
  }
  if(status==='planned'){
    return(<div className='planned_pill'>Planned</div>)
  }
  if(status==='completed'){
    const totalStars=5;
    return(<div className='complete_pill'>{'★'.repeat(rating).padEnd(totalStars,'☆')}</div>)
  }
  if(status==='archived'){
    return(<div className='archived_pill'>Archived</div>)
  }
}



const timeConverter = (time: number) => {
  if (!time) return "0h 0m";

  const hours = Math.floor(time / 60);
  const minutes = time % 60;

  return (
    <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
      {hours}<b>h</b>&nbsp;{minutes}<b>m</b>
    </span>
  );
};
// #endregion

/* -------------------------------------------------------------------------- */
/* FUTURE UPDATES                               */
/* -------------------------------------------------------------------------- */
//TODO: Add a slider bar to filter trips by length
//TODO: Add similar slider for trips less than a time 
//TODO: Add a filter to organize trips by Planned Date 
//TODO: Filter show only completed