import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState, useEffect } from 'react';
import { useDashboard } from '../../../../../context/DashboardContext';

function SortableLocation({location, onDelete, index}: {location: any, onDelete: (id: string) => void, index: number}){
  const { setLocations, map } = useDashboard();
  const [searchValue, setSearchValue] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ 
    id: location.id,
    disabled: location.isEditing 
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: location.isEditing ? 100 : 10 // Lift above others when searching
  };

  // --- Search Logic (Debounced) ---
  useEffect(() => {
    if (!searchValue || !location.isEditing) {
      setSuggestions([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
      try {
        const res = await fetch(
          `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(searchValue)}.json?access_token=${token}&autocomplete=true&limit=5`
        );
        const data = await res.json();
        setSuggestions(data.features || []);
      } catch (err) {
        console.error("Suggestions fetch failed", err);
      }
    }, 300); // Wait 300ms after last keystroke

    return () => clearTimeout(delayDebounceFn);
  }, [searchValue, location.isEditing]);

  const selectLocation = (feature: any) => {
    const [lng, lat] = feature.center;
    setLocations((prev) => prev.map(loc => 
      loc.id === location.id 
        ? { ...loc, name: feature.text, coord: { lat, lng }, isEditing: false } 
        : loc
    ));
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();

      // 1. Check if it's a raw Coordinate pair (Lat, Lng)
      const coordRegex = /^(-?\d+(\.\d+)?),\s*(-?\d+(\.\d+)?)$/;
      const match = searchValue.match(coordRegex);

      if (match) {
        const lat = parseFloat(match[1]);
        const lng = parseFloat(match[3]);
        
        setLocations((prev) => prev.map(loc => 
          loc.id === location.id 
            ? { ...loc, name: `Coords: ${lat.toFixed(3)}, ${lng.toFixed(3)}`, coord: { lat, lng }, isEditing: false } 
            : loc
        ));
        return; // Exit early
      }

      // 2. Otherwise, use suggestions as normal
      if (suggestions.length > 0) {
        selectLocation(suggestions[0]);
      }
    }

    if (e.key === 'Escape') {
      onDelete(location.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`LEFTBAR_LOCATION_DIV ${location.isEditing ? 'EDITING' : ''}`} 
    >
      {location.isEditing ? (
        <div className="INLINE_SEARCH_CONTAINER">
          <div className="INLINE_SEARCH">
            <input 
              autoFocus
              placeholder="Search destination..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleKeyDown}
            />
          </div>
          
          {suggestions.length > 0 && (
            <ul className="SEARCH_SUGGESTIONS">
              {suggestions.map((s) => (
                <li key={s.id} onClick={() => selectLocation(s)}>
                  <span className="SUGGEST_MAIN">{s.text}</span>
                  <span className="SUGGEST_SUB">{s.place_name.split(',').slice(1).join(',')}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      ) : (
        /* ... Keep your existing display code (Index, Name, Coords, Delete) ... */
        <>
          <span {...attributes} {...listeners} className="INDEX_NUMBER DRAG_HANDLE">{index + 1}</span>
          <div className="LOCATION_INFO" onClick={() => map?.flyTo({ center: [location.coord.lng, location.coord.lat], zoom: 14 })}>
            <p className="LOCATION_NAME">{location.name}</p>
            <p className="COORDS_TEXT">{location.coord.lat.toFixed(4)}, {location.coord.lng.toFixed(4)}</p>
          </div>
          <button onClick={(e) => { e.stopPropagation(); onDelete(location.id); }} className='LEFTBAR_DELETE'>🗑</button>
        </>
      )}
    </div>
  );
}

export default SortableLocation;