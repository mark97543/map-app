/* ==========================================================================
   COMPONENT: ItinEdit
   DESCRIPTION: Main layout "Shell" for Trip Editing. 
                All data logic, syncing, and state lives in TripEditContext.
   ========================================================================== */

import './ItinEdit.css'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useTripEdit } from '../../context/TripEditContext'
import SlugTitle from './Parts/1_TitleBlock'
import TripSummary from './Parts/TripSummary'
import TripNote from './Parts/TripNote'
import TripStats from './Parts/TripStats' // <-- IMPORT THE NEW ROW
import { StopsList } from './Parts/StopsList'
import KickAssLoader from '../KickAssLoader';
import { useMyState } from '../../context/StatesContext';

const ItinEdit = () => {
  const {loading, tripDetails} = useMyState();
  const { loadTrip } = useTripEdit();
  const { slug } = useParams<{ slug: string }>();

  useEffect(() => {
    if (slug) {
      loadTrip(slug);
    }
  }, [slug, loadTrip]);

  if (loading) return <div className="loading-screen"><KickAssLoader/></div>;
  if (!tripDetails) return <div className="error-screen">Trip not found.</div>;

  return (
    <div className='EDIT_wrapper'>

      <SlugTitle />

      <TripSummary />

      <TripNote />

      {/* --- THE NEW STATS DASHBOARD --- */}
      <TripStats />

      <p className='ITIN_EDIT_note'><i>Double Click An Item To Edit</i></p>

      <StopsList />

    </div>
  )
}

export default ItinEdit;