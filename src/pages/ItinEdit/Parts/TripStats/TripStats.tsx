/* ==========================================================================
   COMPONENT: TripStats
   DESCRIPTION: Top-level dashboard for the Trip Editor showing totals.
========================================================================== */

import { useDashboard } from '../../../../context/DashboardContext';
import { useMyState } from '../../../../context/StatesContext';
import { useTripEdit } from '../../../../context/TripEditContext';
import './TripStats.css'

const TripStats = () => {
  // Use the pre-formatted variables from our Context math
  const {  } = useTripEdit();
  const {} = useMyState();
  const {totalBudget, totalMiles, totalTimeFormatted} = useDashboard();

  return (
    <div className="TripStats_wrapper">
      
      {/* User Editable Inputs */}
      <div className="TripStat_box">
        <label className="TripStat_label">Start Date</label>
        <input type="date" className="TripStat_input" />
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Start Time</label>
        <input type="time" className="TripStat_input" />
      </div>

      {/* Grand Totals */}
      <div className="TripStat_box">
        <label className="TripStat_label">Total Budget</label>
        <span className="TripStat_value success">
          ${Number(totalBudget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Total Miles</label>
        <span className="TripStat_value">{totalMiles.toFixed(1)} mi</span>
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Total Time</label>
        {/* Displays formatted "1h 12m" string */}
        <span className="TripStat_value">{totalTimeFormatted}</span>
      </div>

    </div>
  );
};

export default TripStats;