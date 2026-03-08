/* ==========================================================================
   COMPONENT: ItinEdit
   DESCRIPTION: Main layout "Shell" for Trip Editing. 
                Now acts as a Smart Switcher between Desktop and Mobile Views.
   ========================================================================== */

import './ItinEdit.css'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useMediaQuery } from 'react-responsive'; // 👈 The magic sensor
import { useTripEdit } from '../../context/TripEditContext'
import { useMyState } from '../../context/StatesContext';

// --- DESKTOP COMPONENTS ---
import SlugTitle from './Parts/TitleBlock/TitleBlock'
import TripSummary from './Parts/TripSummary/TripSummary'
import TripNote from './Parts/TripNote/TripNote'
import TripStats from './Parts/TripStats/TripStats'
import { StopsList } from './Parts/StopsList/StopsList'
import KickAssLoader from '../KickAssLoader';

// --- MOBILE COMPONENT ---
// (Adjust this import path if your Mobile folder is somewhere else!)
import { MobileCoPilot } from '../../pages/Mobile/MobileCoPilot'; 

const ItinEdit = () => {
  const { loading, tripDetails } = useMyState();
  const { loadTrip } = useTripEdit();
  const { slug } = useParams<{ slug: string }>();

  // 📱 DEVICE DETECTION
  // If the screen is 767px or smaller, it's considered mobile
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

  // 💻 DEFAULT: Serve the full Desktop Builder
  return (
    <div className='EDIT_wrapper'>

      <SlugTitle />

      <TripSummary />

      <TripNote />

      {/* --- THE STATS DASHBOARD --- */}
      <TripStats />

      <p className='ITIN_EDIT_note'><i>Double Click An Item To Edit</i></p>

      <StopsList />

    </div>
  )
}

export default ItinEdit;