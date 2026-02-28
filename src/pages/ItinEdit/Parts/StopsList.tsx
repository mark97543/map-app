import { useState } from "react";
import { DndContext, closestCenter, type DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { StopItem } from "./StopItem";
import { type Stop } from "../ItinEdit";
import {updateStopsBatch} from '../../../services/api'

interface StopsListProps {
  stops: Stop[]; 
  setStops: React.Dispatch<React.SetStateAction<Stop[]>>;
  handleAutoSave:() => Promise<void>;
}

const StopsList: React.FC<StopsListProps> =({stops, setStops})=>{
  //Testing Variables


  //console.log(stops)

  const triggerSortSave = async (updatedStops: Stop[]) => {
    try {
      // We only need to send the ID and the new Sort index to Directus
      const payload = updatedStops.map(s => ({
        id: s.id,
        sort: s.sort
      }));

      // Example API call (Adjust based on your specific 'updateTrip' or 'updateStops' service)
      await updateStopsBatch(payload); 
      
      console.log("✅ New route order saved to database.");
    } catch (err) {
      console.error("❌ Failed to save new order:", err);
      // Optional: Add a toast notification here to warn the user
    }
  };

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setStops((currentStops) => {
        const oldIndex = currentStops.findIndex((s) => s.id === active.id);
        const newIndex = currentStops.findIndex((s) => s.id === over.id);

        const reordered = arrayMove(currentStops, oldIndex, newIndex);

        // 1. Create the updated array with new sort values
        const updatedWithSort = reordered.map((stop, index) => ({
          ...stop,
          sort: index + 1,
        }));

        // 2. TRIGGER AUTOSAVE HERE
        triggerSortSave(updatedWithSort);

        return updatedWithSort;
      });
    }
  }
  
  return(
    <div >
      <h2>Route Order</h2>
      
      {/* 1. The Provider: Catches the drag events */}
      <DndContext 
        collisionDetection={closestCenter} 
        onDragEnd={handleDragEnd}
      >
        {/* 2. The Strategy: Tells the list how to behave (vertical) */}
        <SortableContext items={stops.map(s => s.id)} strategy={verticalListSortingStrategy}>
          {stops.map((stop) => (
            <StopItem key={stop.id} id={stop.id} label={stop.name} />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default StopsList