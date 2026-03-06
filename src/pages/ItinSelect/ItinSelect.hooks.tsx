import { createTrip, deleteTripFromDB } from '../../services/api';

export const handleCreateTrip = async (isCreating:any, navigate:any, setIsCreating:any) => {
  if (isCreating) return;
  setIsCreating(true);
  try {
    const randomSlug = Math.random().toString(36).substring(2, 8).toUpperCase();
    const blankTrip = {
      title: "New Trip",
      trip_id: randomSlug,
      trip_summary: "Start planning your adventure...",
      status: "draft"
    };
    const newTrip = await createTrip(blankTrip);
    if (!newTrip) throw new Error("Creation failed.");
    const destinationId = newTrip.trip_id || randomSlug;
    setTimeout(() => navigate(`/edit/${destinationId}`), 300);
  } catch (error) {
    console.error("Failed to create trip:", error);
    alert("Could not create a new trip.");
  } finally {
    setIsCreating(false);
  }
};

export const handleDeleteTrip = async (e: React.MouseEvent, tripId: number, tripTitle: string, fetchInitialData:any) => {
  e.stopPropagation();
  if (window.confirm(`Delete "${tripTitle}"?`)) {
    try {
      await deleteTripFromDB(tripId);
      fetchInitialData();
    } catch (error) {
      alert("Failed to delete.");
    }
  }
};

export const statusPill=(status:string, rating:number)=>{
  if(status==='draft') return <div className='draft_pill'>Draft</div>;
  if(status==='planned') return <div className='planned_pill'>Planned</div>;
  if(status==='completed') return <div className='complete_pill'>{'★'.repeat(rating).padEnd(5,'☆')}</div>;
  if(status==='archived') return <div className='archived_pill'>Archived</div>;
}

export const timeConverter = (decimalHours: any) => {
  const hoursVal = Number(decimalHours) || 0;
  if (hoursVal === 0) return "0h 0m";

  const totalMinutes = Math.round(hoursVal * 60);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;

  return (
    <span style={{ whiteSpace: 'nowrap', display: 'inline-block' }}>
      {h}<b>h</b>&nbsp;{m}<b>m</b>
    </span>
  );
};