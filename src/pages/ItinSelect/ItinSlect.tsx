import './ItinSelect.css'
import { DashboardProvider, useDashboard } from '../../context/DashboardContext'
import KickAssLoader from '../KickAssLoader';
import { useEffect } from 'react';
import Button from '../../assets/componets/Button/Button';



function ItinSelect(){
  const {loading, allTrips, fetchInitialData} = useDashboard();

  useEffect(() => {
    // Only fetch if we don't have trips yet to avoid infinite loops
    if (!allTrips) {
      fetchInitialData();
    }
  }, []);

  // Move the loader check BELOW the useEffect
  if (loading && !allTrips) {
    return <KickAssLoader />;
  }

  //TODO: DEBUG CONSOLE LOG TO DELETE
  console.log("This is all the Trips: ", allTrips)

  return(
    <div className='ItinSelect_Wrapper'>
      
      <div className='ItinSelect_TopRow'>
        <div>        
          <h1>My Trips</h1>
          <h3>Trip Selection Gallery</h3>
        </div>
        <Button>+ Creat New Trip</Button>
      </div>

      <div className='ItinSelect_Grid'>
        {allTrips && allTrips.length>0?(
          allTrips.map((trip)=>(
            <div key={trip.id} className='ItinSelect_TripCard'>
              <h2>{trip.trip_id}:{trip.title}</h2>
              {statusPill(trip.status, trip.trip_rating)}
              <div className='ItinSelect_Metrics'>
                <p>{trip.total_distance? trip.total_distance:"0"} <b>mi</b></p>
                <p className='ItinSelect_Met_Divider'>{timeConverter(trip.total_time)}</p>
                <p><b>$</b> {trip.total_budget? Number(trip.total_budget).toFixed(2):"0.00"}</p>
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