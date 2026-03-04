import React from 'react';
import { useTripEdit } from '../../../context/TripEditContext';

const TripStats = () => {
  // Grab the new math variables!
  const { totalBudget, totalMiles, totalTimeFormatted } = useTripEdit();

  return (
    <div className="TripStats_wrapper">
      
      {/* --- THE ANCHORS (Editable) --- */}
      <div className="TripStat_box">
        <label className="TripStat_label">Start Date</label>
        <input type="date" className="TripStat_input" />
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Start Time</label>
        <input type="time" className="TripStat_input" />
      </div>

      {/* --- THE RESULTS (Read-Only) --- */}
      <div className="TripStat_box">
        <label className="TripStat_label">Total Budget</label>
        <span className="TripStat_value success">${totalBudget}</span>
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Total Miles</label>
        {/* Format to 1 decimal place */}
        <span className="TripStat_value">{totalMiles.toFixed(1)} mi</span>
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Total Time</label>
        {/* Display the formatted string (e.g., 4h 30m) */}
        <span className="TripStat_value">{totalTimeFormatted}</span>
      </div>

    </div>
  );
};

export default TripStats;