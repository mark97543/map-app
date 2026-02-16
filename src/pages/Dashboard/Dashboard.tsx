import { useEffect, useRef } from 'react';
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css';
import './Dashboard.css'

import Sidebar from './Sidebar/Sidebar';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Dashboard(){
  // mapContainerRef: Points to the physical <div> in the DOM where the map will live
  const mapContainerRef = useRef<HTMLDivElement>(null);

  // mapRef: Stores the actual Mapbox instance so we can move it or add markers later
  const mapRef = useRef<mapboxgl.Map | null>(null)

  useEffect(()=>{
    //Guard Clause: Prevents React from creating the map twice (common in Strict Mode)
    if(mapRef.current) return;

    //initialize the map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current!, //Tell Mapbox which div to use
      style: 'mapbox://styles/mapbox/navigation-night-v1', // The premium dark road theme
      center: [-98.5795, 39.8283], // Starting coordinates [Longitude, Latitude]
      zoom: 3, // Initial zoom level (higher is closer)
    })

    //Cleanup Function
    //This rund when the user logs out or leaves dashboard
    //It kills the map instance to prevent memory leaks 
    return ()=>{
      if(mapRef.current){
        mapRef.current.remove();
        mapRef.current = null;
      }
    }
  },[]) //Empty to run only on mount this will prevent looping through api calls. 

  return (
    <div className='DASH_WRAPPER'>
      {/* Floating UI Layer: Header and other buttons go here.z-index: 10 ensures they stay "above" the map.*/}
      <div className='DASH_ui'>
        <Sidebar mapRef={mapRef}/>
      </div>

      {/* The Map Layer: This div is invisible until Mapbox injects the map into it.*/}
      <div className='DASH_map' ref={mapContainerRef}>

      </div>

    </div>
  );
}

export default Dashboard