import { useEffect, useRef, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import './Dashboard.css';
import Sidebar, { type Waypoint } from './Sidebar/Sidebar';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Dashboard() {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  
  const [waypoints, setWaypoints] = useState<Waypoint[]>([]);
  const [menuPos, setMenuPos] = useState<{ x: number, y: number, lng: number, lat: number } | null>(null);

  useEffect(() => {
    if (mapRef.current || !mapContainerRef.current) return;

    // Initialize Map
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-113.57, 37.10],
      zoom: 9,
      trackResize: true // Vital for React
    });

    const map = mapRef.current;

    // Force a resize when the map finishes loading to fix "blank" tiles
    map.on('load', () => {
      map.resize();
    });

    map.on('contextmenu', (e) => {
      e.preventDefault();
      setMenuPos({
        x: e.originalEvent.clientX,
        y: e.originalEvent.clientY,
        lng: e.lngLat.lng,
        lat: e.lngLat.lat
      });
    });

    map.on('click', () => setMenuPos(null));

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  const addWaypointFromMenu = () => {
    if (!menuPos || !mapRef.current) return;

    const id = Date.now().toString();
    const newPoint: Waypoint = {
      id,
      name: `Stop ${waypoints.length + 1}`,
      coords: `${menuPos.lng.toFixed(5)}, ${menuPos.lat.toFixed(5)}`
    };

    const marker = new mapboxgl.Marker({ color: '#93b1a6' })
      .setLngLat([menuPos.lng, menuPos.lat])
      .addTo(mapRef.current);

    markersRef.current[id] = marker;
    setWaypoints(prev => [...prev, newPoint]);
    setMenuPos(null);
  };

  return (
    <div className='DASH_WRAPPER'>
      {menuPos && (
        <div className="custom-context-menu" style={{ top: menuPos.y, left: menuPos.x }}>
          <button onClick={addWaypointFromMenu}>📍 Add Waypoint</button>
          <button onClick={() => setMenuPos(null)}>Cancel</button>
        </div>
      )}

      <div className='DASH_ui'>
        <Sidebar 
          mapRef={mapRef} 
          waypoints={waypoints} 
          setWaypoints={setWaypoints}
          markersRef={markersRef}
        />
      </div>

      <div className='DASH_map' ref={mapContainerRef} />
    </div>
  );
}

export default Dashboard;