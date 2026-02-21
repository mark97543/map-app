import './Map.css'
import { useEffect, useRef } from 'react';
import mapboxgl, { Popup } from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDashboard } from '../../../context/DashboardContext';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const {locations, setMap, setMapCoords, setLocations } = useDashboard();
  const activePopup = useRef<mapboxgl.Popup | null>(null);

  useEffect(() => {
    // Guard Clause: Prevent double-initialization
    if (map.current || !mapContainer.current) return;

    // Initialize Map Instance
    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-98.5795, 39.8283], // Center of USA
      zoom: 3,
      pitch: 0,      // Standard tactical tilt
      antialias: true // Smoother edges for 3D extrusions
    });

    map.current = m;

    //Listem for map Movement
    m.on('move',()=>{
      const center = m.getCenter();
      setMapCoords({
        lng:center.lng,
        lat:center.lat
      })
    })

    // Persistent 3D Buildings Logic
    // This listener ensures buildings are re-added even if the base style changes
    m.on('style.load', () => {
      const layers = m.getStyle().layers;
      
      // Find the label layer so we can put buildings UNDER text
      const labelLayerId = layers?.find(
        (layer) => layer.type === 'symbol' && layer.layout?.['text-field']
      )?.id;

      if (!m.getLayer('add-3d-buildings')) {
        m.addLayer({
          'id': 'add-3d-buildings',
          'source': 'composite',
          'source-layer': 'building',
          'filter': ['==', 'extrude', 'true'],
          'type': 'fill-extrusion',
          'minzoom': 15,
          'paint': {
            'fill-extrusion-color': '#5C8374', // Your Sage Green
            'fill-extrusion-height': ['get', 'height'],
            'fill-extrusion-base': ['get', 'min_height'],
            'fill-extrusion-opacity': 0.6
          }
        }, labelLayerId);
      }
    });

    // Global State & Controls
    m.on('load', () => {
      setMap(m); // Share ready instance with DashboardContext
    });
    
    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    //  User Geolocation
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { longitude, latitude } = position.coords;
          m.flyTo({
            center: [longitude, latitude],
            zoom: 14,
            essential: true
          });
        },
        (error) => { console.error("Error Getting Location: ", error.message) }
      )
    }

    //Context menu
    m.on('contextmenu', (e)=>{
      //Remove if there is active popup
      if (activePopup.current) {
          activePopup.current.remove();
      }

      //save coord
      const {lng, lat}=e.lngLat;

      //Temp Button Element
      const btn = document.createElement('button');
      btn.innerText = 'Add Waypoint';
      btn.className = 'TACTICAL_POPUP_BTN'

      //Define what will happen when they click the button
      btn.onclick=()=>{
        //add new waypoint
        setLocations((prev)=>[
          ...prev, {
            id:`manual-${Date.now()}`,
            name: `Waypoint ${prev.length + 1}`,
            coord:{lat,lng}
          }
        ])
        popup.remove();
        activePopup.current = null;
      }

      //Create and add popup menu
      const popup = new mapboxgl.Popup({closeButton:false})
        .setLngLat([lng,lat])
        .setDOMContent(btn)
        .addTo(m);
      //Store Popup in the ref so we can kill it with next right click
      activePopup.current = popup;

      //Clear popup when user clicles elsewhere
      popup.on('close',()=>{
        activePopup.current = null;
      })
    })

    //  Cleanup
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMap(null);
      }
    }
  }, [setMap]);

  //Set Markers on map
  useEffect(()=>{
    if(!map || !locations) return;

    //Create Cleanup array to store markers so can remove later
    const currentMarkers:mapboxgl.Marker[]=[];
    //Clear existing markers

    locations.forEach((loc,index)=>{
      //Custom HTML element for marker
      const el = document.createElement('div');
      el.className='MAP_MARKER';
      el.innerText = (index+1).toString();

      //Add marker to map
      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.coord.lng, loc.coord.lat])
        .addTo(map.current!);
      currentMarkers.push(marker);
    });

    //Cleanup function
    return () =>{
      currentMarkers.forEach(m=>m.remove());
    }
  },[locations])

  return (
    <div ref={mapContainer} className='MAP_CONTAINER' />
  )
}

export default Map;