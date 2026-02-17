import './Sidebar.css'
import React, { useState, useEffect, useRef } from 'react'
import { DragDropContext, Droppable, Draggable, type DropResult } from '@hello-pangea/dnd'
import { teleportTo, isCoordString, manualGeocode } from './SidbarHelper'
import Input from '../../../assets/componets/Input/Input.tsx' 
import mapboxgl from 'mapbox-gl';

export interface Waypoint {
  id: string;
  name: string;
  coords: string;
}

interface SidebarProps {
  mapRef: React.MutableRefObject<mapboxgl.Map | null>;
  waypoints: Waypoint[];
  setWaypoints: React.Dispatch<React.SetStateAction<Waypoint[]>>;
  markersRef: React.MutableRefObject<{ [key: string]: mapboxgl.Marker }>;
}

function Sidebar({ mapRef, waypoints, setWaypoints, markersRef }: SidebarProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [searchVal, setSearchVal] = useState('');
  const [currentCoords, setCurrentCoords] = useState({ lng: 0, lat: 0 });
  const [editingId, setEditingId] = useState<string | null>(null);

  // Search marker (different from waypoints)
  const searchMarkerRef = useRef<mapboxgl.Marker | null>(null);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const updateCoords = () => {
      const center = map.getCenter();
      setCurrentCoords({ lng: center.lng, lat: center.lat });
    };
    map.on('move', updateCoords);
    updateCoords();
    return () => { map.off('move', updateCoords); };
  }, [mapRef]);

  const handleSearch = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      const trimmedVal = searchVal.trim();
      if (!trimmedVal) return;
      if (isCoordString(trimmedVal)) {
        const [n1, n2] = trimmedVal.split(',').map(n => parseFloat(n.trim()));
        teleportTo(n1, n2, mapRef.current, currentCoords, searchMarkerRef);
      } else {
        const coords = await manualGeocode(trimmedVal);
        if (coords) teleportTo(coords[0], coords[1], mapRef.current, currentCoords, searchMarkerRef);
      }
      setSearchVal(''); 
    }
  };

  const handleOnDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    const items = [...waypoints];
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    setWaypoints(items);
  };

  const handleWaypointClick = (coordString: string) => {
    const [lng, lat] = coordString.split(',').map(n => parseFloat(n.trim()));
    mapRef.current?.flyTo({ center: [lng, lat], zoom: 15, essential: true, duration: 1500 });
  };

  const removeWaypoint = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    // 1. Remove marker from Map
    if (markersRef.current[id]) {
      markersRef.current[id].remove();
      delete markersRef.current[id];
    }
    // 2. Remove from State
    setWaypoints(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className={`DASH_SIDE_wrapper ${isOpen ? 'open' : 'closed'}`}>
      <div className="DASH_SIDE_Row1">
        {isOpen && <h1>Iter Viae</h1>}
        <button onClick={() => setIsOpen(!isOpen)} className='DASH_SIDE_collapse'>
          <span className={`arrow-icon ${isOpen ? 'open' : 'closed'}`}>{'\u00AB'}</span>
        </button>
      </div>

      {isOpen && (
        <div className='DASH_SIDE_SearchArea'>
          <Input
            placeholder='Search Road or Lat, Lng...'
            value={searchVal}
            change={(e: any) => setSearchVal(e.target.value)}            
            onKeyDown={handleSearch}
          />
        </div>
      )}

      {isOpen && (
        <div className="DASH_SIDE_WaypointSection">
          <h3>Route Plan</h3>
          <DragDropContext onDragEnd={handleOnDragEnd}>
            <Droppable droppableId="waypoints">
              {(provided) => (
                <ul className="waypoint-list" {...provided.droppableProps} ref={provided.innerRef}>
                  {waypoints.map((point, index) => (
                    <Draggable key={point.id} draggableId={point.id} index={index}>
                      {(provided, snapshot) => (
                        <li
                          className={`waypoint-item ${snapshot.isDragging ? 'dragging' : ''}`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          onClick={() => handleWaypointClick(point.coords)}
                        >
                          <div className="drag-handle" {...provided.dragHandleProps}>☰</div>
                          <div className="waypoint-info">
                            {editingId === point.id ? (
                                <input 
                                    className="waypoint-rename-input"
                                    autoFocus
                                    value={point.name}
                                    onClick={(e) => e.stopPropagation()}
                                    onChange={(e) => {
                                      const val = e.target.value;
                                      setWaypoints(prev => prev.map(p => p.id === point.id ? {...p, name: val} : p));
                                    }}
                                    onBlur={() => setEditingId(null)}
                                    onKeyDown={(e) => e.key === 'Enter' && setEditingId(null)}
                                />
                            ) : (
                                <strong onDoubleClick={(e) => { e.stopPropagation(); setEditingId(point.id); }}>
                                    {point.name}
                                </strong>
                            )}
                            <code>{point.coords}</code>
                          </div>
                          <button className="waypoint-remove" onClick={(e) => removeWaypoint(e, point.id)}>✕</button>
                        </li>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </ul>
              )}
            </Droppable>
          </DragDropContext>
        </div>
      )}

      {isOpen && (
        <div className="DASH_SIDE_Footer">
          <p className='footer-label'>Current Viewport:</p>
          <code>{currentCoords.lat.toFixed(5)}, {currentCoords.lng.toFixed(5)}</code>
        </div>
      )}
    </div>
  );
}

export default Sidebar;