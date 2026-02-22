import './Map.css';
import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useDashboard, type StopType } from '../../../context/DashboardContext';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  
  const { 
    locations, 
    setMap, 
    setMapCoords, 
    setLocations, 
    setRouteData, 
    mapSelection 
  } = useDashboard();
  
  const activePopup = useRef<mapboxgl.Popup | null>(null);
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});
  const [isLoaded, setIsLoaded] = useState(false);

  const locationsRef = useRef(locations);
  useEffect(() => { locationsRef.current = locations; }, [locations]);

  const cachedGeometryRef = useRef<any>(null);
  const lastRoutedHash = useRef<string>('');
  const lastZoomedCount = useRef<number>(0);

  const iconMap: Record<StopType, string> = {
    stop: '📍', gas: '⛽', hotel: '🏨', food: '🍔', shaping: '🔹'
  };

  // =====================================================================
  // 1. HELPER: SETUP ROUTE LAYERS
  // =====================================================================
  const setupRouteLayers = useCallback((m: mapboxgl.Map) => {
    if (!m || m.getSource('route')) return;

    m.addSource('route', { 
      type: 'geojson', 
      data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } 
    });

    m.addLayer({ 
      id: 'route-line', 
      type: 'line', 
      source: 'route', 
      layout: { 'line-join': 'round', 'line-cap': 'round' }, 
      paint: { 'line-color': '#00ff88', 'line-width': 6, 'line-opacity': 0.8 } 
    });
  }, []);

  // =====================================================================
  // 2. ROUTE DRAWING LOGIC
  // =====================================================================
  const drawRoute = useCallback(async (m: mapboxgl.Map, reason: 'style-switch' | 'coords-change') => {
    const source = m.getSource('route') as mapboxgl.GeoJSONSource;
    if (!source) return;

    const validPoints = locationsRef.current.filter(l => l.coord.lng !== 0 && l.coord.lat !== 0 && !l.isEditing);
    
    if (validPoints.length < 2) {
      source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      setRouteData(null);
      cachedGeometryRef.current = null;
      return;
    }

    if (reason === 'style-switch' && cachedGeometryRef.current) {
      source.setData({ type: 'Feature', properties: {}, geometry: cachedGeometryRef.current });
      return;
    }

    try {
      const query = validPoints.map(l => `${l.coord.lng},${l.coord.lat}`).join(';');
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${query}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`;
      
      const response = await fetch(url);
      const res = await response.json();
      
      if (res.code === 'Ok' && res.routes?.[0]) {
        cachedGeometryRef.current = res.routes[0].geometry; 
        
        const currentSource = m.getSource('route') as mapboxgl.GeoJSONSource;
        if (currentSource) {
          currentSource.setData({ type: 'Feature', properties: {}, geometry: res.routes[0].geometry });
          setRouteData({ legs: res.routes[0].legs });
        }
      }
    } catch (e) { 
      console.error("Route calculation error:", e); 
    }
  }, [setRouteData]);

  // =====================================================================
  // 3. MAP INITIALIZATION 
  // =====================================================================
  useEffect(() => {
    if (mapContainer.current === null || map.current !== null) return;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-98.57, 39.82],
      zoom: 3,
      antialias: true 
    });

    m.on('style.load', () => {
      setupRouteLayers(m);
      drawRoute(m, 'style-switch');
    });

    m.on('load', () => {
      map.current = m;
      setMap(m);
      setIsLoaded(true); 
    });

    m.on('move', () => setMapCoords({ lng: m.getCenter().lng, lat: m.getCenter().lat }));

    // 🔥 THE NEW MAP RIGHT-CLICK MENU
    m.on('contextmenu', (e) => {
      if (activePopup.current) activePopup.current.remove();
      const { lng, lat } = e.lngLat;
      
      const container = document.createElement('div');
      container.className = 'POPUP_MENU_CONTAINER';
      
      // Button 1: Add Waypoint
      const addBtn = document.createElement('button');
      addBtn.className = 'TACTICAL_POPUP_BTN';
      addBtn.innerText = 'Add Waypoint';
      addBtn.onclick = () => {
        setLocations(prev => [...prev, { 
          id: `manual-${Date.now()}`, 
          name: `Waypoint ${prev.length + 1}`, 
          coord: { lat, lng }, 
          type: 'stop', 
          duration: 15, 
          dbreak: 0, 
          isEditing: false 
        }]);
        popup.remove();
      };

      // Button 2: Google Maps Link
      const gMapsBtn = document.createElement('button');
      gMapsBtn.className = 'TACTICAL_POPUP_BTN';
      gMapsBtn.style.color = '#4285F4'; // Google Blue to stand out
      gMapsBtn.style.borderColor = '#4285F4';
      gMapsBtn.innerText = 'Open in Google Maps';
      gMapsBtn.onclick = () => {
        // Opens Google Maps in a new tab exactly at these coordinates
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, '_blank');
        popup.remove();
      };

      container.appendChild(addBtn);
      container.appendChild(gMapsBtn);

      const popup = new mapboxgl.Popup({ closeButton: false })
        .setLngLat([lng, lat])
        .setDOMContent(container)
        .addTo(m);
        
      activePopup.current = popup;
    });

    return () => {
      if (map.current) {
        Object.values(markersRef.current).forEach(marker => marker.remove());
        markersRef.current = {};
        map.current.remove();
        map.current = null;
        setMap(null);
        setIsLoaded(false);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); 

  // =====================================================================
  // 4. STYLE SWITCHER
  // =====================================================================
  useEffect(() => {
    if (!map.current || !isLoaded) return;
    
    const wantsSatellite = mapSelection === 'Satellite';
    const isCurrentlySatellite = map.current.getStyle()?.sprite?.includes('satellite') || false;
    
    if (wantsSatellite === isCurrentlySatellite) return;

    const styleUrl = wantsSatellite 
      ? 'mapbox://styles/mapbox/satellite-streets-v12' 
      : 'mapbox://styles/mapbox/navigation-night-v1';

    map.current.setStyle(styleUrl);
  }, [mapSelection, isLoaded]);

  // =====================================================================
  // 5. AUTO-FIT CAMERA 
  // =====================================================================
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    const validLocs = locations.filter(l => l.coord.lat !== 0 && l.coord.lng !== 0 && !l.isEditing);
    
    if (validLocs.length === 0 || validLocs.length === lastZoomedCount.current) return;

    const bounds = new mapboxgl.LngLatBounds();
    validLocs.forEach((loc) => bounds.extend([loc.coord.lng, loc.coord.lat]));

    map.current.fitBounds(bounds, {
      padding: 50,
      maxZoom: 13,
      duration: 1500,
      essential: true
    });

    lastZoomedCount.current = validLocs.length;
  }, [locations.length, isLoaded]);

  // =====================================================================
  // 6. ROUTE SYNC 
  // =====================================================================
  useEffect(() => { 
    if (!map.current || !isLoaded) return;

    const validLocs = locations.filter(l => l.coord.lat !== 0 && l.coord.lng !== 0 && !l.isEditing);
    const currentHash = validLocs.map(l => `${l.coord.lng},${l.coord.lat}`).join('|');

    if (currentHash !== lastRoutedHash.current) {
      drawRoute(map.current, 'coords-change');
      lastRoutedHash.current = currentHash;
    }
  }, [locations, isLoaded, drawRoute]);

  // =====================================================================
  // 7. MARKER ENGINE
  // =====================================================================
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    Object.keys(markersRef.current).forEach(id => {
      if (!locations.find(l => l.id === id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    });

    locations.forEach((loc, index) => {
      const displayIndex = (index + 1).toString();

      if (markersRef.current[loc.id]) {
        const marker = markersRef.current[loc.id];
        marker.setLngLat([loc.coord.lng, loc.coord.lat]);
        const el = marker.getElement();
        el.className = `MAP_MARKER type-${loc.type}`;
        el.querySelector('.MARKER_NUMBER')!.textContent = displayIndex;
        el.querySelector('.MARKER_ICON')!.textContent = iconMap[loc.type];
      } else {
        const el = document.createElement('div');
        el.className = `MAP_MARKER type-${loc.type}`;
        el.innerHTML = `<span class="MARKER_ICON">${iconMap[loc.type]}</span><span class="MARKER_NUMBER">${displayIndex}</span>`;

        const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: 'bottom' })
          .setLngLat([loc.coord.lng, loc.coord.lat])
          .addTo(map.current!);

        marker.on('dragend', () => {
          const { lng, lat } = marker.getLngLat();
          setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, coord: { lat, lng } } : l));
        });

        // 🔥 THE CLEANED UP MARKER RIGHT-CLICK MENU (Delete Only)
        el.addEventListener('contextmenu', (e) => {
          e.preventDefault(); e.stopPropagation();
          if (activePopup.current) activePopup.current.remove();
          
          const hud = document.createElement('div');
          // Kept the same class to preserve your tactical padding/background
          hud.className = 'MARKER_HUD_EDITOR'; 
          hud.innerHTML = `<button class="HUD_DELETE">DELETE STOP</button>`;

          hud.addEventListener('click', (ev) => {
            const btn = (ev.target as HTMLElement).closest('button');
            if (btn && btn.classList.contains('HUD_DELETE')) {
              setLocations(prev => prev.filter(l => l.id !== loc.id));
              popup.remove();
            }
          });

          const popup = new mapboxgl.Popup({ offset: 25, closeButton: false })
            .setLngLat([loc.coord.lng, loc.coord.lat])
            .setDOMContent(hud)
            .addTo(map.current!);
            
          activePopup.current = popup;
        });

        markersRef.current[loc.id] = marker;
      }
    });
  }, [locations, isLoaded, setLocations]);

  return <div ref={mapContainer} className='MAP_CONTAINER' />;
}

export default Map;