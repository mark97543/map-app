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
              <h1>Hello</h1>
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


