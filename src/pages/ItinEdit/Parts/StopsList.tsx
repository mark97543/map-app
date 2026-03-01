/* ==========================================================================
   COMPONENT: StopsList
   DESCRIPTION: Handles the drag-and-drop reordering logic and batch updates 
                for all stop-related data.
   ========================================================================== */

import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { StopItem } from "./StopItem";
import { type Stop } from "../ItinEdit";
import { updateStopsBatch } from '../../../services/api';
import { type UniqueIdentifier } from "@dnd-kit/core";

// 🎯 The "Brain" for the List
interface StopsListProps {
  stops: Stop[]; 
  setStops: React.Dispatch<React.SetStateAction<Stop[]>>;
  handleAutoSave: () => Promise<void>;
}

export const StopsList: React.FC<StopsListProps> = ({ stops, setStops }) => {

  // #region --- UPDATE HANDLER ---
  /**
   * Receives a partial update object from StopItem and merges it into state.
   */
  const handleUpdateStopData = (id: UniqueIdentifier, updates: Partial<Stop>) => {
    setStops((prevStops) => {
      const updated = prevStops.map((stop) => 
        stop.id === id ? { ...stop, ...updates } : stop
      );

      // Persist the changes to the DB
      triggerSortSave(updated); 
      return updated;
    });
  };
  // #endregion

  // #region --- API SYNC ---
  const triggerSortSave = async (updatedStops: Stop[]) => {
    try {
      const payload = updatedStops.map(s => ({
        id: s.id,
        sort: s.sort,
        name: s.name,
        type: s.type,
        note: s.note,
        stay_time: s.stay_time,
        morning_depart: s.morning_depart,
        budget: s.budget,
        lat: s.lat, 
        lng: s.lng  
      }));

      await updateStopsBatch(payload); 
      console.log("✅ Stops batch update successful.");
    } catch (err) {
      console.error("❌ Sync Error in StopsList:", err);
    }
  };
  // #endregion

  // #region --- DRAG & DROP HANDLER ---
  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStops((currentStops) => {
        const oldIndex = currentStops.findIndex((s) => s.id === active.id);
        const newIndex = currentStops.findIndex((s) => s.id === over.id);

        const reordered = arrayMove(currentStops, oldIndex, newIndex);

        const updatedWithSort = reordered.map((stop, index) => ({
          ...stop,
          sort: index + 1,
        }));

        triggerSortSave(updatedWithSort);
        return updatedWithSort;
      });
    }
  }
  // #endregion
  
  return (
    <div className="StopsList_wrapper">
      <h2>Route Order</h2>
      
      <DndContext 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={stops.map(s => s.id)} 
          strategy={verticalListSortingStrategy}
        >
          {stops.map((stop) => (
            <StopItem 
              key={stop.id} 
              id={stop.id} 
              label={stop.name} 
              type={stop.type} 
              note={stop.note ?? ''} 
              stay={stop.stay_time} 
              morning_depart={stop.morning_depart}
              budget={stop.budget}
              lat={stop.lat} 
              lng={stop.lng} 
              onSave={handleUpdateStopData} 
              arrivalTime="--:--" 
              departureTime="--:--"
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  );
};

/* ==========================================================================
   FUTURE UPDATES & ROADMAP
   ========================================================================== */
// #region --- TODOS ---
/**
 * TODO: Integrate "Time Ripple" values into the arrivalTime/departureTime props.
 * TODO: Add a "Delete Stop" confirmation modal.
 * TODO: Implement a "Quick Search" for adding new locations by name.
 */
// #endregion