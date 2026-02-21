import './Map.css'
import { useEffect, useRef, useCallback } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDashboard } from '../../../context/DashboardContext';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { locations, setMap, setMapCoords, setLocations, setRouteData, mapSelection } = useDashboard();
  const activePopup = useRef<mapboxgl.Popup | null>(null);

  // --- 1. EXTRACT ROUTE LOGIC ---
  // We move the "drawing" logic into a function so both the Effect AND the Style Listener can call it.
  const drawRoute = useCallback(async () => {
    if (!map.current || locations.length < 2) return;

    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    if (!source) return; // Still not ready

    const chunks = [];
    const chunkSize = 25;
    for (let i = 0; i < locations.length; i += (chunkSize - 1)) {
      const chunk = locations.slice(i, i + chunkSize);
      if (chunk.length > 1) chunks.push(chunk);
    }

    try {
      const results = await Promise.all(chunks.map(async (chunk) => {
        const query = chunk.map(l => `${l.coord.lng},${l.coord.lat}`).join(';');
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${query}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
        );
        return response.json();
      }));

      let combinedCoordinates: number[][] = [];
      let combinedLegs: any[] = [];

      results.forEach((res, index) => {
        if (res.code === 'Ok' && res.routes?.[0]) {
          const coords = res.routes[0].geometry.coordinates;
          combinedCoordinates = combinedCoordinates.concat(index === 0 ? coords : coords.slice(1));
          combinedLegs = combinedLegs.concat(res.routes[0].legs);
        }
      });

      source.setData({
        type: 'Feature',
        properties: {},
        geometry: { type: 'LineString', coordinates: combinedCoordinates }
      });
      setRouteData({ legs: combinedLegs });
    } catch (e) {
      console.error("Routing error:", e);
    }
  }, [locations, setRouteData]);

  // --- 2. INITIALIZATION & STYLE LISTENERS ---
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-98.5795, 39.8283],
      zoom: 3,
      pitch: 0,
      antialias: true 
    });

    map.current = m;

    m.on('style.load', () => {
      // Re-add Source
      if (!m.getSource('route')) {
        m.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
        });
      }

      // Re-add Layer
      if (!m.getLayer('route-line')) {
        m.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#ff0000',
            'line-width': 6,
            'line-opacity': 1,
            'line-blur': 0.5,
            'line-dasharray':[.5,2]
          }
        });
      }

      // TACTICAL FIX: Immediately try to draw the route as soon as the style loads
      drawRoute();
    });

    m.on('load', () => setMap(m));

    // cleanup... (rest of your existing init code)
    return () => { if (map.current) { map.current.remove(); map.current = null; setMap(null); } };
  }, [drawRoute, setMap]); // Added drawRoute to deps

  // --- 3. DIRECTIONS EFFECT ---
  useEffect(() => {
    drawRoute();
  }, [locations, drawRoute, mapSelection]);

  // --- 4. MARKERS EFFECT --- (Your existing marker code)
  useEffect(() => {
    if (!map.current || !locations) return;
    const currentMarkers: mapboxgl.Marker[] = [];
    locations.forEach((loc, index) => {
      const el = document.createElement('div'); el.className = 'MAP_MARKER'; el.innerText = (index + 1).toString();
      const marker = new mapboxgl.Marker(el).setLngLat([loc.coord.lng, loc.coord.lat]).addTo(map.current!);
      currentMarkers.push(marker);
    });
    return () => currentMarkers.forEach(m => m.remove());
  }, [locations]);

  return <div ref={mapContainer} className='MAP_CONTAINER' />;
}

export default Map;