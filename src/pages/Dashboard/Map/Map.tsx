import './Map.css'
import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDashboard } from '../../../context/DashboardContext';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { locations, setMap, setMapCoords, setLocations, setRouteData, mapSelection } = useDashboard();
  const activePopup = useRef<mapboxgl.Popup | null>(null);
  
  // Track if map is fully ready for markers
  const [isLoaded, setIsLoaded] = useState(false);
  // Ref to track marker instances to prevent re-rendering flicker
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // ---------------------------------------------------------
  // 1. ROUTE DRAWING LOGIC
  // ---------------------------------------------------------
  const drawRoute = useCallback(async () => {
    if (!map.current || !isLoaded) return;

    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    
    // Filter out points currently being edited or at 0,0
    const validPoints = locations.filter(l => l.coord.lng !== 0 && l.coord.lat !== 0 && !l.isEditing);
    
    if (validPoints.length < 2) {
      if (source) {
        source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      }
      setRouteData(null);
      return;
    }

    try {
      const query = validPoints.map(l => `${l.coord.lng},${l.coord.lat}`).join(';');
      const response = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/driving/${query}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`
      );
      const res = await response.json();

      if (res.code === 'Ok' && res.routes?.[0]) {
        source.setData({
          type: 'Feature',
          properties: {},
          geometry: res.routes[0].geometry
        });
        setRouteData({ legs: res.routes[0].legs });
      }
    } catch (e) {
      console.error("Routing error:", e);
    }
  }, [locations, setRouteData, isLoaded]);

  // ---------------------------------------------------------
  // 2. INITIALIZATION
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

    m.on('load', () => {
      map.current = m;
      setMap(m);
      
      // Add Route Source/Layer once
      m.addSource('route', {
        type: 'geojson',
        data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } }
      });

      m.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#00ff88',
          'line-width': 6,
          'line-opacity': 0.8
        }
      });

      setIsLoaded(true);
    });

    m.on('move', () => {
      const center = m.getCenter();
      setMapCoords({ lng: center.lng, lat: center.lat });
    });

    m.on('contextmenu', (e) => {
      if (activePopup.current) activePopup.current.remove();
      const { lng, lat } = e.lngLat;
      const btn = document.createElement('button');
      btn.innerText = 'Add Waypoint';
      btn.className = 'TACTICAL_POPUP_BTN';
      btn.onclick = () => {
        setLocations((prev) => [
          ...prev, 
          { id: `manual-${Date.now()}`, name: `Waypoint ${prev.length + 1}`, coord: { lat, lng }, isEditing: false }
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
  }, [setMap, setMapCoords, setLocations]);

  // ---------------------------------------------------------
  // 3. AUTO-FIT CAMERA
  // ---------------------------------------------------------
  useEffect(() => {
    const validLocs = locations.filter(l => l.coord.lat !== 0 && l.coord.lng !== 0 && !l.isEditing);
    if (!map.current || !isLoaded || validLocs.length === 0) return;

    const bounds = new mapboxgl.LngLatBounds();
    validLocs.forEach((loc) => bounds.extend([loc.coord.lng, loc.coord.lat]));

    map.current.fitBounds(bounds, {
      padding: { top: 100, bottom: 100, left: 450, right: 100 },
      maxZoom: 14,
      duration: 2000,
      essential: true
    });
  }, [locations, isLoaded]);

  // ---------------------------------------------------------
  // 4. PERSISTENT DRAGGABLE MARKERS
  // ---------------------------------------------------------
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // A. Remove markers no longer in state or currently being edited
    Object.keys(markersRef.current).forEach(id => {
      const loc = locations.find(l => l.id === id);
      if (!loc || loc.isEditing || (loc.coord.lat === 0 && loc.coord.lng === 0)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    // B. Add or Update
    locations.forEach((loc, index) => {
      if (loc.isEditing || (loc.coord.lat === 0 && loc.coord.lng === 0)) return;

      const displayIndex = (index + 1).toString();

      if (markersRef.current[loc.id]) {
        // Update Existing
        const marker = markersRef.current[loc.id];
        marker.setLngLat([loc.coord.lng, loc.coord.lat]);
        const el = marker.getElement();
        if (el) el.innerText = displayIndex;
      } else {
        // Create New
        const el = document.createElement('div');
        el.className = 'MAP_MARKER';
        el.innerText = displayIndex;

        const marker = new mapboxgl.Marker({ 
          element: el, 
          draggable: true 
        })
          .setLngLat([loc.coord.lng, loc.coord.lat])
          .addTo(map.current!);

        marker.on('dragend', () => {
          const { lng, lat } = marker.getLngLat();
          setLocations(prev => prev.map(l => 
            l.id === loc.id ? { ...l, coord: { lat, lng } } : l
          ));
        });

        markersRef.current[loc.id] = marker;
      }
    });
  }, [locations, isLoaded, setLocations]);

  // ---------------------------------------------------------
  // 5. ROUTE UPDATER
  // ---------------------------------------------------------
  useEffect(() => {
    drawRoute();
  }, [locations, drawRoute, mapSelection]);

  return <div ref={mapContainer} className='MAP_CONTAINER' />;
}

export default Map;