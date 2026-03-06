import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { StopItem } from "../StopItem/StopItem";
import TravelSegment from "./TravelSegment/TravelSegment"; 
import { useStopsListLogic } from "./StopsList.hook";
import './StopsList.css';

export const StopsList: React.FC = () => {
  // Use our custom hook to grab all the logic
  const {
    calculatedStops,
    isCalculating,
    tempSegments,
    handleAddStop,
    handleDeleteStop,
    handleUpdateStopData,
    handleDragEnd
  } = useStopsListLogic();

  // DRAG & DROP SENSORS
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  return (
    <div className="StopsList_wrapper">
      <h2>
        Itinerary Stops 
        {isCalculating && (
          <span className="calculating-indicator">(Calculating Route...)</span>
        )}
      </h2>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tempSegments.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          
          {calculatedStops.map((stop, index) => (
            <React.Fragment key={stop.id}>
              
              <StopItem 
                id={stop.id} 
                label={stop.name} 
                type={stop.type} 
                note={stop.note || ""} 
                stay={stop.stay_time} 
                morning_depart={stop.morning_depart}
                budget={stop.budget} 
                lat={stop.lat} 
                lng={stop.lng} 
                arrivalTime={stop.arrival_time} 
                departureTime={stop.departure_time} 
                onSave={handleUpdateStopData} 
                onDelete={handleDeleteStop}
              />

              {/* The Travel Segment Pill (Math results from the Hook) */}
              {index < calculatedStops.length - 1 && stop.drive_to_next_miles != null && (
                <TravelSegment 
                  index={index}
                  miles={stop.drive_to_next_miles}
                  minutes={stop.drive_to_next_minutes}
                />
              )}

            </React.Fragment>
          ))}

        </SortableContext>
      </DndContext>

      <button className="StopsList_AddButton" onClick={handleAddStop}>
        + Add New Stop
      </button>
    </div>
  );
};