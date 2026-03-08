/* ==========================================================================
   COMPONENT: ItinSelect
   DESCRIPTION: Dashboard view for selecting, filtering, creating, and deleting
                trips. Acts as the main entry point to the itinerary editor.
   ========================================================================== */

import './ItinSelect.css'
import { useDashboard } from '../../context/DashboardContext'
import KickAssLoader from '../KickAssLoader';
import { useEffect, useState } from 'react';
import Button from '../../assets/componets/Button/Button';
import Input from '../../assets/componets/Input/Input';
import Toggle from '../../assets/componets/Toggle/Toggle';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react'; 
import { useMyState } from '../../context/StatesContext';
import {handleCreateTrip, handleDeleteTrip, statusPill, timeConverter} from './ItinSelect.hooks'
import { useTripEdit } from '../../context/TripEditContext';
import { minToHHMM } from '../ItinEdit/Parts/Resources/TimeFunc';


function ItinSelect(){

  const {loading, allTrips}=useMyState(); //States
  const {} = useDashboard(); //Functions
  const {fetchInitialData} = useTripEdit(); //API Calls 
  
  const [searchTerm, setSearchTerm]=useState(''); //Used in this File only
  const [showArchived, setShowArchived]=useState(false);//Used in this file only
  const [isCreating, setIsCreating] = useState(false);//Used only in this file?
  const navigate = useNavigate();
  
  const displayTrips = allTrips?.filter(trip=>{
    const searchLower = searchTerm.toLowerCase();
    const matchesTitle = trip.title.toLowerCase().includes(searchLower);
    const matchesId = trip.trip_id?.toLowerCase().includes(searchLower);
    const isArchived = trip.status ==='archived';
    if (!showArchived && isArchived) return false;
    return matchesTitle || matchesId;
  })

  useEffect(()=>{
    fetchInitialData();
  },[isCreating])

  if (loading && !allTrips) return <KickAssLoader />;

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
        <Button onClick={()=>handleCreateTrip(isCreating, navigate, setIsCreating)}>
          {isCreating ? 'Creating...' : '+ Create New Trip'}
        </Button>
      </div>

      <div className='ItinSelect_Grid'>
        {displayTrips && displayTrips.length > 0 ? (
          displayTrips.map((trip)=>(
            <div key={trip.id} className='ItinSelect_TripCard' onClick={() => navigate(`/edit/${trip.trip_id}`)}>
              <div className="ItinSelect_CardHeader">
                <h2>{trip.trip_id}: {trip.title}</h2>
                <button className="ItinSelect_DeleteTripBtn" onClick={(e) => handleDeleteTrip(e, trip.id, trip.title, fetchInitialData)}>
                  <Trash2 size={18} />
                </button>
              </div>
              {statusPill(trip.status, trip.trip_rating)}
              <div className='ItinSelect_Metrics'>
                <p>{trip.total_distance ? Number(trip.total_distance).toFixed(0) : "0"} <b>mi</b></p>
                <p className='ItinSelect_Met_Divider'>{minToHHMM(trip.total_time)}</p>
                <p><b>$</b> {trip.total_budget ? Number(trip.total_budget).toFixed(2) : "0.00"}</p>
              </div>
              <div className='ItinSelect_Start_Date'>
                {trip.start_date ? <p>Planned Date: {trip.start_date}</p> : <p>No Start Date</p>}
              </div>
              <p className='ItinSelect_TripSummary'>{trip.trip_summary}</p>
            </div>
          ))
        ) : (
          <p>No trips found.</p>
        )}
      </div>
    </div>
  )
}

export default ItinSelect
