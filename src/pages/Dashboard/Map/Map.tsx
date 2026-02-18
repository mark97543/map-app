import './Map.css'
import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map(){

  //Need to reference the physical div the mapbox will live in
  const mapContainer = useRef<HTMLDivElement>(null);
  //Store the map object in the ref sso ite persists
  const map = useRef<mapboxgl.Map | null >(null);

  useEffect(()=>{
    //Optimize: Do not initialize if map already exists
    if(map.current || !mapContainer.current) return; 

    //Creat the map instance 
    map.current = new mapboxgl.Map({
      container:mapContainer.current,
      style:'mapbox://styles/mapbox/dark-v11',
      center:[-98.5795, 39.8283], // Center of USA [lng, lat]
      zoom:3,
      //pitch:45,
    });

    //Request Users Location
    if('geolocation' in navigator){
      navigator.geolocation.getCurrentPosition(
        (position)=>{
          const {longitude, latitude}=position.coords;
          //smoothly fly to users location
          map.current?.flyTo({
            center:[longitude, latitude],
            zoom:12,
            essential:true
          });
        },(error)=>{console.error("Error Getting Location: ", error.message)}
      )
    }
    //Add UI Controls
    map.current.addControl(new mapboxgl.NavigationControl(), 'top-right');

    //Clean/Destroy maps when the user logs out or leaves dashboard
    return () =>{
      if(map.current){
        map.current.remove();
        map.current = null;
      }
    }
  },[])

  return(
    <div ref={mapContainer} className='MAP_CONTAINER'/>
  )
}

export default Map