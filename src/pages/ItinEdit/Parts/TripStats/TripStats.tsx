/* ==========================================================================
   COMPONENT: TripStats
   DESCRIPTION: Top-level dashboard for the Trip Editor showing totals.
                Includes double-click to edit for Date, Time, Status, and Rating.
========================================================================== */

import { useState, useEffect } from 'react';
import { useDashboard } from '../../../../context/DashboardContext';
import { useMyState } from '../../../../context/StatesContext';
import { useTripEdit } from '../../../../context/TripEditContext';
import './TripStats.css';
import { minToHHMM } from '../Resources/TimeFunc';

const TripStats = () => {
  // Local state to track which field is actively being typed into
  const [editingField, setEditingField] = useState<'date' | 'time' | 'status' | null>(null);

  // Bring in the Contexts
  const { handleAutoSave } = useTripEdit();
  const { 
    tempStartDate, setTempStartDate, 
    tempStartTime, setTempStartTime,
    tempStatus, setTempStatus,
    tempRating, setTempRating,
    tripDetails, totalMiles,
    totalMinutes
  } = useMyState();
  const { totalBudget } = useDashboard();

  // The universal save trigger
  const handleBlur = () => {
    setEditingField(null); // Close the input
    handleAutoSave();      // Tell the Librarian to save to Directus
  };

  // Helper for the star rating click
  const handleStarClick = (rating: number) => {
    setTempRating(rating);
  };

  useEffect(() => {
    if (tempRating !== tripDetails?.trip_rating) {
      handleAutoSave();
    }
  }, [tempRating]);

  return (
    <div className="TripStats_wrapper">
      
      {/* 1. START DATE */}
      <div className="TripStat_box">
        <label className="TripStat_label">Start Date</label>
        {editingField === 'date' ? (
          <input 
            type="date" 
            className="TripStat_input" 
            autoFocus 
            value={tempStartDate || ""}
            onChange={(e) => setTempStartDate(e.target.value)}
            onBlur={handleBlur}
          />
        ) : (
          <span 
            className="TripStat_value" 
            onDoubleClick={() => setEditingField('date')}
            style={{ cursor: 'pointer' }}
            title="Double click to edit"
          >
            {tempStartDate || "Set Date..."}
          </span>
        )}
      </div>

      {/* 2. START TIME */}
      <div className="TripStat_box">
        <label className="TripStat_label">Start Time</label>
        {editingField === 'time' ? (
          <input 
            type="time" 
            className="TripStat_input" 
            autoFocus
            value={tempStartTime || ""}
            onChange={(e) => setTempStartTime(e.target.value)}
            onBlur={handleBlur}
          />
        ) : (
          <span 
            className="TripStat_value" 
            onDoubleClick={() => setEditingField('time')}
            style={{ cursor: 'pointer' }}
            title="Double click to edit"
          >
            {tempStartTime || "Set Time..."}
          </span>
        )}
      </div>

      {/* 3. TRIP STATUS */}
      <div className="TripStat_box">
        <label className="TripStat_label">Status</label>
        {editingField === 'status' ? (
          <select 
            className="TripStat_input" 
            autoFocus
            value={tempStatus || "draft"}
            onChange={(e) => setTempStatus(e.target.value)}
            onBlur={handleBlur}
          >
            <option value="draft">Draft</option>
            <option value="planned">Planned</option>
            <option value="completed">Completed</option>
            <option value="archived">Archived</option>
          </select>
        ) : (
          <span 
            className="TripStat_value" 
            onDoubleClick={() => setEditingField('status')}
            style={{ cursor: 'pointer', textTransform: 'capitalize' }}
            title="Double click to edit"
          >
            {tempStatus || "Draft"}
          </span>
        )}
      </div>

      {/* 3.5 TRIP RATING (Only shows if Status is 'completed') */}
      {tempStatus === 'completed' && (
        <div className="TripStat_box">
          <label className="TripStat_label">Rating</label>
          <div style={{ display: 'flex', gap: '4px', marginTop: '4px' }}>
            {[1, 2, 3, 4, 5].map((star) => (
              <span
                key={star}
                onClick={() => handleStarClick(star)}
                style={{
                  cursor: 'pointer',
                  fontSize: '1.4rem',
                  lineHeight: '1',
                  color: star <= (tempRating || 0) ? 'var(--warning-gold, #fbbf24)' : 'var(--text-dim)'
                }}
                title={`Rate ${star} stars`}
              >
                {star <= (tempRating || 0) ? '★' : '☆'}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* 4. GRAND TOTALS */}
      <div className="TripStat_box">
        <label className="TripStat_label">Total Budget</label>
        <span className="TripStat_value success">
          ${Number(totalBudget).toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </span>
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Total Miles</label>
        <span className="TripStat_value">{Number(totalMiles).toFixed(0)} mi</span>
      </div>

      <div className="TripStat_box">
        <label className="TripStat_label">Total Time</label>
        <span className="TripStat_value">{minToHHMM(totalMinutes)}</span>
      </div>

    </div>
  );
};

export default TripStats;