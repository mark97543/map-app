import { useEffect, useRef, useState } from 'react';
import './Dashboard.css';
import Map from './Map/Map';


function Dashboard() {


  return (
    <div className='DASH_WRAPPER'>
      <Map />
    </div>
  );
}

export default Dashboard;