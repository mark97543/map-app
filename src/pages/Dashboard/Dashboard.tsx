import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Dashboard.css';


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;


function Dashboard() {

  return (
    <div className='DASH_WRAPPER'>
      <h1>Place map here</h1>
    </div>
  );
}

export default Dashboard;