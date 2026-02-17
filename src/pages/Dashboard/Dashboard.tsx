import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Dashboard.css';


mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;


function Dashboard() {

  return (
    <div className='DASH_WRAPPER'>

    </div>
  );
}

export default Dashboard;