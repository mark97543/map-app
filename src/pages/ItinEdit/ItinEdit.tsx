/* ==========================================================================
   COMPONENT: ItinEdit
   DESCRIPTION: Main layout "Shell" for Trip Editing. 
                Now acts as a Smart Switcher between Desktop and Mobile Views.
   ========================================================================== */

import './ItinEdit.css'

import { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'; 
import { useTripEdit } from '../../context/TripEditContext'
import { useMyState } from '../../context/StatesContext';
import { Printer } from 'lucide-react'; // 👈 Added Printer icon

// --- DESKTOP COMPONENTS ---
import SlugTitle from './Parts/TitleBlock/TitleBlock'
import TripSummary from './Parts/TripSummary/TripSummary'
import TripNote from './Parts/TripNote/TripNote'
import TripStats from './Parts/TripStats/TripStats'
import { StopsList } from './Parts/StopsList/StopsList'
import KickAssLoader from '../KickAssLoader';

// --- MOBILE COMPONENT ---
import { MobileCoPilot } from '../../pages/Mobile/MobileCoPilot'; 

const ItinEdit = () => {
  // 👈 Grab calculatedStops for the print table
  const { loading, tripDetails, calculatedStops, totalMiles, totalMinutes, totalBudget } = useMyState(); 
  const { loadTrip } = useTripEdit();
  const { slug } = useParams<{ slug: string }>();

  // 📱 DEVICE DETECTION
  const isMobile = useMediaQuery({ query: '(max-width: 767px)' });

  useEffect(() => {
    if (slug) {
      loadTrip(slug);
    }
  }, [slug, loadTrip]);

  if (loading) return <div className="loading-screen"><KickAssLoader/></div>;
  if (!tripDetails) return <div className="error-screen">Trip not found.</div>;

  // 🚀 THE SWITCH: Serve Co-Pilot if on a phone
  if (isMobile) {
    return <MobileCoPilot />;
  }

  // 🖨️ PRINT FUNCTION
  const handlePrint = () => {
    window.print();
  };

  // 💻 DEFAULT: Serve the full Desktop Builder
  return (
    <>
      {/* --- DESKTOP UI (HIDDEN ON PRINT) --- */}
      {/* 👈 Added 'no-print' class so this entire block vanishes on paper */}
      <div className='EDIT_wrapper no-print'>
        
        {/* The Print Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <button 
            onClick={handlePrint} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 16px', cursor: 'pointer', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 'bold' }}
          >
            <Printer size={18} /> Print Field Notes
          </button>
        </div>

        <SlugTitle />
        <TripSummary />
        <TripNote />
        <TripStats />
        <p className='ITIN_EDIT_note'><i>Double Click An Item To Edit</i></p>
        <StopsList />

      </div>

 {/* --- 🖨️ FIELD NOTES UI (HIDDEN ON SCREEN, VISIBLE ON PRINT) --- */}
      <div className="FieldNotes_Print">
        {/* 👇 The new Cut Guide wrapper */}
        <div className="Cut_Guide">
          
          <div className="FieldNotes_Header">
            {tripDetails?.trip_id}:{tripDetails?.title || "Field Itinerary"}
          </div>

          {/* --- UPGRADED SPREADSHEET META BOX --- */}
          <table className="FieldNotes_MetaTable">
            <tbody>
              {/* Row 1: Start Info */}
              <tr>
                <td className="Meta_Label">START DATE:</td>
                <td className="Meta_Value">{tripDetails?.start_date || "TBD"}</td>
                <td className="Meta_Label">START TIME:</td>
                <td className="Meta_Value">{tripDetails?.start_time || "TBD"}</td>
              </tr>
              
              {/* Row 2: Trip Stats */}
              <tr>
                <td className="Meta_Label">DISTANCE:</td>
                {/* 👇 Added .toFixed(1) to clean up those long decimals! */}
                <td className="Meta_Value">{totalMiles ? Number(totalMiles).toFixed(1) : 0} mi</td>
                <td className="Meta_Label">DURATION:</td>
                <td className="Meta_Value">{totalMinutes ? `${Math.floor(totalMinutes / 60)}h ${totalMinutes % 60}m` : "0h"}</td>
              </tr>
              
              {/* Row 3: Budget & Extras */}
              <tr>
                <td className="Meta_Label">BUDGET:</td>
                <td className="Meta_Value" colSpan={3}>${totalBudget || 0}</td>
              </tr>
              
              {/* Row 4: Summary */}
              <tr>
                <td className="Meta_Label">SUMMARY:</td>
                <td className="Meta_Value" colSpan={3}>
                  {/* 👇 Safely parse the HTML so it formats as actual text instead of code */}
                  {tripDetails?.trip_summary ? (
                    <div dangerouslySetInnerHTML={{ __html: tripDetails.trip_summary }} />
                  ) : "N/A"}
                </td>
              </tr>
              
              {/* Row 5: Notes */}
              <tr>
                <td className="Meta_Label">NOTES:</td>
                <td className="Meta_Value" colSpan={3}>
                  {/* 👇 Parse the HTML for Trip Notes as well */}
                  {tripDetails?.trip_notes ? (
                    <div dangerouslySetInnerHTML={{ __html: tripDetails.trip_notes }} />
                  ) : "N/A"}
                </td>
              </tr>
            </tbody>
          </table>

          {/* --- MAIN ITINERARY GRID --- */}
          <table className="FieldNotes_Table">
            <thead>
              <tr>
                <th className="Col_Time">TIME</th>
                <th className="Col_Name">STOP / GPS</th>
                <th className="Col_Note">NOTES</th>
              </tr>
            </thead>
            <tbody>
              {calculatedStops.map((stop) => (
                <tr key={stop.id}>
                  <td className="Col_Time">
                    {stop.arrival_time}
                    {stop.stay_time ? <><br/><span className="Stay_Text">({stop.stay_time}m)</span></> : null}
                  </td>
                  <td className="Col_Name">
                    <strong>{stop.name}</strong>
                    <br/>
                    <span className="GPS_Text">{stop.lat}, {stop.lng}</span>
                  </td>
                  <td className="Col_Note">{stop.note || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>

        </div>
      </div>
    </>
  )
}

export default ItinEdit;