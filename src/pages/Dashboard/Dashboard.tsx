import { useEffect, useRef, useState } from 'react';
import './Dashboard.css';
import Map from './Map/Map';
import Leftbar from './LeftBar/Leftbar';


function Dashboard() {


  return (
    <div className='DASH_WRAPPER'>
      <Map />
      <Leftbar/>
    </div>
  );
}

export default Dashboard;