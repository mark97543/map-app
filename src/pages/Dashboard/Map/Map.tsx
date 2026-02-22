import './Map.css'
import { useEffect, useRef, useCallback, useState } from 'react';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
// Note: using 'type' for StopType to satisfy TypeScript's strict verbatimModuleSyntax
import { useDashboard, type StopType } from '../../../context/DashboardContext';

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function Map() {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<mapboxgl.Map | null>(null);
  const { locations, setMap, setMapCoords, setLocations, setRouteData, mapSelection } = useDashboard();
  const activePopup = useRef<mapboxgl.Popup | null>(null);
  
  // Track if the map style has fully loaded before we add layers/markers
  const [isLoaded, setIsLoaded] = useState(false);
  // Keep track of marker instances so we update them instead of re-creating them
  const markersRef = useRef<{ [key: string]: mapboxgl.Marker }>({});

  // Icon configuration for the different stop categories
  const iconMap: Record<StopType, string> = {
    stop: '📍', gas: '⛽', hotel: '🏨', food: '🍔', shaping: '🔹'
  };

  // ---------------------------------------------------------
  // 1. ROUTE DRAWING LOGIC
  // ---------------------------------------------------------
  const drawRoute = useCallback(async () => {
    if (!map.current || !isLoaded) return;
    const source = map.current.getSource('route') as mapboxgl.GeoJSONSource;
    
    // Only route points that have valid coordinates and aren't being edited
    const validPoints = locations.filter(l => l.coord.lng !== 0 && l.coord.lat !== 0 && !l.isEditing);
    
    if (validPoints.length < 2) {
      if (source) source.setData({ type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } });
      setRouteData(null);
      return;
    }

    try {
      const query = validPoints.map(l => `${l.coord.lng},${l.coord.lat}`).join(';');
      const response = await fetch(`https://api.mapbox.com/directions/v5/mapbox/driving/${query}?geometries=geojson&overview=full&access_token=${mapboxgl.accessToken}`);
      const res = await response.json();
      if (res.code === 'Ok' && res.routes?.[0]) {
        source.setData({ type: 'Feature', properties: {}, geometry: res.routes[0].geometry });
        setRouteData({ legs: res.routes[0].legs });
      }
    } catch (e) { console.error("Routing failed:", e); }
  }, [locations, setRouteData, isLoaded]);

  // ---------------------------------------------------------
  // 2. INITIALIZATION (Run once)
  // ---------------------------------------------------------
  useEffect(() => {
    if (map.current || !mapContainer.current) return;

    const m = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/navigation-night-v1',
      center: [-98.57, 39.82],
      zoom: 3,
      antialias: true 
    });

    m.on('load', () => {
      map.current = m;
      setMap(m);
      // Setup the route line source and visual layer
      m.addSource('route', { type: 'geojson', data: { type: 'Feature', properties: {}, geometry: { type: 'LineString', coordinates: [] } } });
      m.addLayer({ 
        id: 'route-line', 
        type: 'line', 
        source: 'route', 
        layout: { 'line-join': 'round', 'line-cap': 'round' }, 
        paint: { 'line-color': '#00ff88', 'line-width': 6, 'line-opacity': 0.8 } 
      });
      setIsLoaded(true);
    });

    // Update global coordinates whenever the user moves the map
    m.on('move', () => setMapCoords({ lng: m.getCenter().lng, lat: m.getCenter().lat }));

    // Right-click on map to add a new waypoint
    m.on('contextmenu', (e) => {
      if (activePopup.current) activePopup.current.remove();
      const { lng, lat } = e.lngLat;
      const container = document.createElement('div');
      container.className = 'POPUP_MENU_CONTAINER';
      
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
          isEditing: false 
        }]);
        popup.remove();
      };
      
      container.appendChild(addBtn);
      const popup = new mapboxgl.Popup({ closeButton: false }).setLngLat([lng, lat]).setDOMContent(container).addTo(m);
      activePopup.current = popup;
    });

    return () => m.remove();
  }, [setMap, setMapCoords, setLocations]);

  // ---------------------------------------------------------
  // 3. AUTO-FIT CAMERA (Keeps all points in view)
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
  // 4. MARKER ENGINE (Syncing state to Mapbox markers)
  // ---------------------------------------------------------
  useEffect(() => {
    if (!map.current || !isLoaded) return;

    // Clean up markers that were deleted from state
    Object.keys(markersRef.current).forEach(id => {
      if (!locations.find(l => l.id === id)) { 
        markersRef.current[id].remove(); 
        delete markersRef.current[id]; 
      }
    });

    locations.forEach((loc, index) => {
      const displayIndex = (index + 1).toString();
      
      if (markersRef.current[loc.id]) {
        // UPDATE EXISTING MARKER
        const marker = markersRef.current[loc.id];
        marker.setLngLat([loc.coord.lng, loc.coord.lat]);
        const el = marker.getElement();
        el.className = `MAP_MARKER type-${loc.type}`;
        el.querySelector('.MARKER_NUMBER')!.textContent = displayIndex;
        el.querySelector('.MARKER_ICON')!.textContent = iconMap[loc.type];
      } else {
        // CREATE NEW MARKER
        const el = document.createElement('div');
        el.className = `MAP_MARKER type-${loc.type}`;
        el.innerHTML = `<span class="MARKER_ICON">${iconMap[loc.type]}</span><span class="MARKER_NUMBER">${displayIndex}</span>`;

        // 'anchor: center' is vital to prevent markers from "floating" away on zoom
        const marker = new mapboxgl.Marker({ element: el, draggable: true, anchor: 'center' })
          .setLngLat([loc.coord.lng, loc.coord.lat])
          .addTo(map.current!);

        // Sync drag movements to state
        marker.on('dragend', () => {
          const { lng, lat } = marker.getLngLat();
          setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, coord: { lat, lng } } : l));
        });

        // Right-click on Marker to open the HUD Editor
        el.addEventListener('contextmenu', (e) => {
          e.preventDefault(); e.stopPropagation();
          if (activePopup.current) activePopup.current.remove();
          
          const hud = document.createElement('div');
          hud.className = 'MARKER_HUD_EDITOR';
          hud.innerHTML = `
            <div class="HUD_SECTION">
              <label>TYPE</label>
              <div class="TYPE_PICKER">
                ${(['stop', 'gas', 'hotel', 'food', 'shaping'] as StopType[]).map(t => 
                  `<button class="${loc.type === t ? 'active' : ''}" data-type="${t}">${iconMap[t]}</button>`
                ).join('')}
              </div>
            </div>
            <div class="HUD_SECTION">
              <label>STAY (MIN)</label>
              <input type="number" value="${loc.duration}" class="HUD_INPUT" />
            </div>
            <button class="HUD_DELETE">DELETE STOP</button>
          `;

          hud.addEventListener('click', (ev) => {
            const btn = (ev.target as HTMLElement).closest('button');
            if (!btn) return;
            if (btn.classList.contains('HUD_DELETE')) {
              setLocations(prev => prev.filter(l => l.id !== loc.id));
            } else if (btn.dataset.type) {
              const newType = btn.dataset.type as StopType;
              setLocations(prev => prev.map(l => l.id === loc.id ? { ...l, type: newType } : l));
            }
            popup.remove();
          });

          const popup = new mapboxgl.Popup({ offset: 15, closeButton: false })
            .setLngLat([loc.coord.lng, loc.coord.lat])
            .setDOMContent(hud)
            .addTo(map.current!);
          activePopup.current = popup;
        });

        markersRef.current[loc.id] = marker;
      }
    });
  }, [locations, isLoaded, setLocations]);

  useEffect(() => { drawRoute(); }, [locations, drawRoute]);

  return <div ref={mapContainer} className='MAP_CONTAINER' />;
}

export default Map;