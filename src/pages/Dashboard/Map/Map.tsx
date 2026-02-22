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

  // ---------------------------------------------------------
  // 1. ROUTE DRAWING LOGIC (Extracted for re-use)
  // ---------------------------------------------------------
  const drawRoute = useCallback(async () => {
    if (!map.current) return;

    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    
    // Reset line if not enough points
    if (locations.length < 2) {
      if (source) {
        source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      }
      setRouteData(null);
      return;
    }

    if (!source) return;

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

  // ---------------------------------------------------------
  // 2. INITIALIZATION & STYLE SWAP SAFETY
  // ---------------------------------------------------------
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

    m.on('move', () => {
      const center = m.getCenter();
      setMapCoords({ lng: center.lng, lat: center.lat });
    });

    m.on('style.load', () => {
      // Re-add Route Source
      if (!m.getSource('route')) {
        m.addSource('route', {
          type: 'geojson',
          data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
        });
      }

      // Re-add Route Layer (Neon Green)
      if (!m.getLayer('route-line')) {
        m.addLayer({
          id: 'route-line',
          type: 'line',
          source: 'route',
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': '#00ff88',
            'line-width': 8,
            'line-opacity': 1,
            'line-blur': 0.3
          }
        });
      }
      
      // Re-trigger the drawing of the existing route onto the new style
      drawRoute();
    });

    m.on('load', () => setMap(m));
    m.addControl(new mapboxgl.NavigationControl(), 'top-right');

    // Context Menu: Right-Click to add Waypoints
    m.on('contextmenu', (e) => {
      if (activePopup.current) activePopup.current.remove();
      const { lng, lat } = e.lngLat;
      const btn = document.createElement('button');
      btn.innerText = 'Add Waypoint';
      btn.className = 'TACTICAL_POPUP_BTN';
      btn.onclick = () => {
        setLocations((prev) => [
          ...prev, 
          { id: `manual-${Date.now()}`, name: `Waypoint ${prev.length + 1}`, coord: { lat, lng } }
        ]);
        popup.remove();
      };

      const popup = new mapboxgl.Popup({ closeButton: false })
        .setLngLat([lng, lat])
        .setDOMContent(btn)
        .addTo(m);
      activePopup.current = popup;
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
        setMap(null);
      }
    };
  }, [drawRoute, setMap, setMapCoords, setLocations]);

  // ---------------------------------------------------------
  // 3. AUTO-FIT CAMERA (Refined for smoothness)
  // ---------------------------------------------------------
  useEffect(() => {
    // 1. Guard: Don't move the camera if we have 0 or only 1 point 
    // (unless you want it to zoom into that single point)
    if (!map.current || !locations || locations.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    locations.forEach((loc) => bounds.extend([loc.coord.lng, loc.coord.lat]));

    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 450, right: 100 },
      maxZoom: 14,
      duration: 2000,    // Increased duration for a slower, "satellite glide" feel
      essential: true,
      curve: 1.42,       // Controls the curvature of the flight path
      speed: 0.8,        // Slower speed makes it less "jarring" when points are removed
      linear: false      // Use an exponential zoom curve for a more natural feel
    });
  }, [locations]);

  // ---------------------------------------------------------
  // 4. MARKERS & ROUTE UPDATER
  // ---------------------------------------------------------
  useEffect(() => {
    if (!map.current || !locations) return;
    const currentMarkers: mapboxgl.Marker[] = [];

    locations.forEach((loc, index) => {
      const el = document.createElement('div');
      el.className = 'MAP_MARKER';
      el.innerText = (index + 1).toString();

      const marker = new mapboxgl.Marker(el)
        .setLngLat([loc.coord.lng, loc.coord.lat])
        .addTo(map.current!);
      currentMarkers.push(marker);
    });

    return () => currentMarkers.forEach(m => m.remove());
  }, [locations]);

  useEffect(() => {
    drawRoute();
  }, [locations, drawRoute, mapSelection]);

  return <div ref={mapContainer} className='MAP_CONTAINER' />;
}

export default Map;