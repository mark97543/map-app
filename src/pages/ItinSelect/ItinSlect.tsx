import './ItinSelect.css'
import { DashboardProvider, useDashboard } from '../../context/DashboardContext'
import KickAssLoader from '../KickAssLoader';
import { useEffect, useState } from 'react';
import Button from '../../assets/componets/Button/Button';
import Input from '../../assets/componets/Input/Input';
import Toggle from '../../assets/componets/Toggle/Toggle';
import { useNavigate } from 'react-router-dom';



function ItinSelect(){
  const {loading, allTrips, fetchInitialData, refresh} = useDashboard();
  const [searchTerm, setSearchTerm]=useState('');
  const [showArchived, setShowArchived]=useState(false)
  const navigate = useNavigate();
  

  useEffect(() => {
    // If we have a refresh trigger > 0, we ALWAYS fetch fresh data
    // Otherwise, only fetch if the list is empty (initial load)
    if (refresh > 0 || !allTrips) {
      fetchInitialData();
    }
  }, [refresh]);


  const displayTrips = allTrips?.filter(trip=>{
    const searchLower = searchTerm.toLowerCase();

    const matchesTitle = trip.title.toLowerCase().includes(searchLower);
    const matchesId = trip.trip_id?.toLowerCase().includes(searchLower);

    const isArchived = trip.status ==='archived';

    //If showArchived is false, exclude 'archived' status
    if (!showArchived && isArchived) return false;
    return matchesTitle || matchesId;
  })

  if (loading && !allTrips) {
    return <KickAssLoader />;
  }

  //TODO: DEBUG CONSOLE LOG TO DELETE
  //console.log("This is all the Trips: ", allTrips)

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
        <Button>+ Creat New Trip</Button>
      </div>

      <div className='ItinSelect_Grid'>
        {displayTrips && displayTrips.length>0?(
          displayTrips.map((trip)=>(
            <div key={trip.id} className='ItinSelect_TripCard' onClick={()=>navigate(`/edit/${trip.trip_id}`)} style={{ cursor: 'pointer' }}>
              <h2>{trip.trip_id}:{trip.title}</h2>
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
          <p >No trips found. Time to hit the road!</p>
        )}
      </div>

    </div>
  )
}

export default ItinSelect

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
  // If time is 0 or null, return a fallback
  if (!time) return "0h 0m";

  const hours = Math.floor(time / 60);
  const minutes = time % 60; // Using the "Modulo" (%) operator is a cleaner way to get the remainder!

  return (
    <>
      {hours} <b>h</b> {minutes} <b>m</b>
    </>
  );
};


/* -------------------------------------------------------------------------- */
/*                               FUTURE UPDATES                               */
/* -------------------------------------------------------------------------- */
//TODO: Add a sloder bar to filter trips by length
//TODO: Add similar slider for trips less than a time 
//TODO: Add a filter to organize trips by Planned Date 
//TODO: Filter show only completed 
