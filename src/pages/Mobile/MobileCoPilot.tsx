import React, { useMemo } from 'react';
import { useMyState } from '../../context/StatesContext';
import { useTripEdit } from '../../context/TripEditContext';
import { Navigation, CheckCircle, MapPin, ChevronRight, RotateCcw } from 'lucide-react';
import { STOP_TYPES } from '../ItinEdit/Parts/Resources/stopTypes';
import './MobileCoPilot.css';
import { useStopsListLogic } from '../ItinEdit/Parts/StopsList/StopsList.hook';

export const MobileCoPilot = () => {
  const { calculatedStops, tripDetails, tempSegments, setTempSegments } = useMyState();
  const { updateStop } = useTripEdit();

  // 🧠 Keep the Time Ripple engine running in the background!
  useStopsListLogic();

  // 🎯 WAYPOINT & ORIGIN AWARE LOGIC
  const uncompletedStops = useMemo(() => 
    calculatedStops.filter(s => !s.is_completed), 
    [calculatedStops]
  );

  // 1. Find the first stop that is NOT a waypoint AND NOT the origin!
  const activeDestIndex = uncompletedStops.findIndex(s => s.type !== 'waypoint' && s.type !== 'origin');
  
  // 2. The actual destination we are driving to
  const activeStop = activeDestIndex !== -1 ? uncompletedStops[activeDestIndex] : null;
  
  // 3. Any stops before this destination (This catches the Origin AND any Waypoints)
  const passedStops = activeDestIndex > 0 ? uncompletedStops.slice(0, activeDestIndex) : [];
  
  // 4. Extract ONLY the waypoints for Google Maps (we don't pass the origin to Google)
  const mapWaypoints = passedStops.filter(s => s.type === 'waypoint');
  
  // 5. The rest of the list for the UI
  const upcomingStops = activeStop ? uncompletedStops.slice(activeDestIndex + 1) : [];

  // 🗺️ ACTIONS
  const handleNavigate = () => {
    if (!activeStop) return;

    // 1. The Destination (The "Real" Stop)
    const destination = encodeURIComponent(`${activeStop.lat},${activeStop.lng}`);
    
    // 2. The Base URL using the Directions API format you found
    // Action 'dir' forces the app into Directions mode immediately
    let url = `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`;
    
    // 3. The Waypoints (The "Via" points)
    if (mapWaypoints.length > 0) {
      // ✅ We prefix with 'via:' to make them pass-through
      // We join them with '%7C' (the encoded pipe '|')
      const waypointsStr = mapWaypoints
        .map(wp => `via:${wp.lat},${wp.lng}`)
        .join('|');
        
      url += `&waypoints=${encodeURIComponent(waypointsStr)}`;
    }
    
    window.open(url, '_blank');
  };

  const markReached = async () => {
    if (!activeStop) return;

    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const updates = { is_completed: true, actual_arrival: now };
    
    // 1. Mark the actual destination as reached
    await updateStop(activeStop.id, updates);

    // 2. Auto-complete the Origin AND any Waypoints we passed to get here!
    for (const stop of passedStops) {
      await updateStop(stop.id, updates);
    }
  };

  // 🔄 RESET BUTTON LOGIC
  const resetTrip = async () => {
    const confirmReset = window.confirm("Start over? This will wipe all arrival times for this trip.");
    if (!confirmReset) return;

    // Reset local state instantly for a snappy UI
    const wipedSegments = tempSegments.map(s => ({
      ...s,
      is_completed: false,
      actual_arrival: null
    }));
    setTempSegments(wipedSegments);

    // Push the reset to the database
    for (const stop of tempSegments) {
      if (stop.is_completed) {
        await updateStop(stop.id, { is_completed: false, actual_arrival: null });
      }
    }
  };

  // 🏁 TRIP COMPLETED STATE
  if (!activeStop) return (
    <div className="Mobile_Done">
      <CheckCircle size={64} color="#1dd1a1" />
      <h1>Trip Complete!</h1>
      <p>You've reached your final destination.</p>
      <button onClick={resetTrip} className="Btn_Check" style={{marginTop: '20px'}}>
        <RotateCcw size={20} /> RESET TRIP
      </button>
    </div>
  );

  const stopConfig = STOP_TYPES[activeStop.type] || STOP_TYPES.origin;

  // 🚀 MAIN RENDER
  return (
    <div className="CoPilot_Container">
      <header className="CoPilot_Header" style={{ position: 'relative' }}>
        <div className="Header_Badge">DAY {Math.ceil((calculatedStops.findIndex(s => s.id === activeStop.id) + 1) / 3)}</div>
        <h2>{tripDetails?.title}</h2>
        
        {/* 🔄 THE RESET BUTTON */}
        <button 
          onClick={resetTrip}
          style={{
            position: 'absolute', right: '0', top: '0', 
            background: 'transparent', border: 'none', 
            color: '#ef4444', display: 'flex', flexDirection: 'column', 
            alignItems: 'center', fontSize: '0.65rem', fontWeight: 'bold', cursor: 'pointer'
          }}
        >
          <RotateCcw size={18} style={{marginBottom: '4px'}}/>
          RESET
        </button>
      </header>

      <section className="ActiveCard">
        <div className="ActiveCard_Indicator">
          NEXT STOP {mapWaypoints.length > 0 && <span style={{color: '#f59e0b'}}> (Via {mapWaypoints.length} waypoints)</span>}
        </div>
        
        <div className="ActiveCard_Main">
          <div className="TypeIcon" style={{ backgroundColor: stopConfig.bgColor || '#333', color: stopConfig.color || '#fff' }}>
            {stopConfig.icon ? <stopConfig.icon size={28} /> : <MapPin size={28} />}
          </div>
          <div className="Main_Text">
            <h1>{activeStop.name}</h1>
            <p><MapPin size={14} /> {activeStop.note || "No notes for this stop"}</p>
          </div>
        </div>

        {/* Show a tiny list of waypoints so the user knows they are taking the scenic route */}
        {mapWaypoints.length > 0 && (
          <div style={{fontSize: '0.8rem', color: '#94a3b8', margin: '0 0 16px 0', background: 'rgba(0,0,0,0.2)', padding: '8px', borderRadius: '8px'}}>
            <strong>Routing via: </strong> {mapWaypoints.map(w => w.name).join(' ➔ ')}
          </div>
        )}

        <div className="ActiveCard_Stats">
          <div className="StatGroup">
            <span className="Stat_Label">PLANNED</span>
            <span className="Stat_Value">{activeStop.arrival_time}</span>
          </div>
          <div className="StatDivider" />
          <div className="StatGroup">
            <span className="Stat_Label">STAY</span>
            <span className="Stat_Value">{activeStop.stay_time || 0}m</span>
          </div>
        </div>

        <div className="ActiveCard_Actions">
          <button className="Btn_Nav" onClick={handleNavigate}>
            <Navigation size={20} /> START NAVIGATION
          </button>
          <button className="Btn_Check" onClick={markReached}>
            <CheckCircle size={20} /> I'VE ARRIVED
          </button>
        </div>
      </section>

      <section className="Upcoming_Section">
        <h3>Upcoming Stops</h3>
        <div className="Upcoming_List">
          {upcomingStops.length > 0 ? upcomingStops.filter(s => s.type !== 'waypoint').map((stop) => (
            <div key={stop.id} className="MiniStop">
              <span className="Mini_Time">{stop.arrival_time}</span>
              <div className="Mini_Dot" style={{ backgroundColor: STOP_TYPES[stop.type]?.color || '#fff' }} />
              <span className="Mini_Name">{stop.name}</span>
              <ChevronRight size={16} className="Mini_Arrow" />
            </div>
          )) : (
            <p className="Empty_Upcoming">This is your final destination!</p>
          )}
        </div>
      </section>
    </div>
  );
};