import React from 'react';
import { useTripEdit } from '../../../context/TripEditContext';
import { Car } from 'lucide-react';

interface TravelSegmentProps {
  index: number;
  miles: number | null;
  minutes: number | null;
}

const TravelSegment: React.FC<TravelSegmentProps> = ({ index, miles, minutes }) => {
  const { addWaypoint } = useTripEdit();

  // Format the time nicely
  const hrs = minutes ? Math.floor(minutes / 60) : 0;
  const mins = minutes ? minutes % 60 : 0;
  const timeString = hrs > 0 ? `${hrs}h ${mins}m` : `${mins}m`;

  return (
    <div className="TravelSegment_wrapper">
      
      {/* The wide, inset pill matching the professional design */}
      <div className="TravelSegment_pill">
        <Car size={18} color="#9ca3af" style={{ marginRight: '8px' }} />
        <span>Car Travel Time: {timeString}</span>
        <span className="pill_dot">•</span>
        <span>Car Travel Distance: {miles?.toFixed(1) || 0} mi</span>
      </div>

      {/* Hover action to add a stop exactly here */}
      <button 
        className="TravelSegment_addBtn" 
        onClick={() => addWaypoint(index)}
        title="Add Waypoint Here"
      >
        +
      </button>
      
    </div>
  );
};

export default TravelSegment;