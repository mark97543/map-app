import React from "react";
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors } from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from "@dnd-kit/sortable";

import { StopItem } from "../StopItem/StopItem";
import TravelSegment from "./TravelSegment/TravelSegment"; 
import { useStopsListLogic } from "./StopsList.hook";
import './StopsList.css';

export const StopsList: React.FC = () => {
  // 1. Grab our logic engine
  const {
    calculatedStops,
    isCalculating,
    tempSegments,
    handleAddStop,
    handleDeleteStop,
    handleUpdateStopData,
    handleDragEnd
  } = useStopsListLogic();

  // 2. Setup Drag & Drop Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  // 3. Initialize Day Counter
  let currentDay = 1;

  return (
    <div className="StopsList_wrapper">
      <div className="StopsList_Header">
        <h2>
          Itinerary Stops 
          {isCalculating && (
            <span className="calculating-indicator"> (Updating Route...)</span>
          )}
        </h2>
      </div>
      
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={tempSegments.map((s) => s.id)} strategy={verticalListSortingStrategy}>
          
          {calculatedStops.map((stop, index) => {
            // LOGIC: Determine if we show a "New Day" header
            const isFirst = index === 0;
            const prevWasHotel = index > 0 && calculatedStops[index - 1].type === 'hotel';
            const showDivider = isFirst || prevWasHotel;

            // Increment the counter if we just passed a hotel
            if (index > 0 && calculatedStops[index - 1].type === 'hotel') {
              currentDay++;
            }

            return (
              <React.Fragment key={stop.id}>
                
                {/* 📅 SECTION A: DAY DIVIDER (Starts the Day) */}
                {showDivider && (
                  <div className="DayDivider">
                    <div className="DayDivider_Line" />
                    <span className="DayDivider_Text">DAY {currentDay}</span>
                    <div className="DayDivider_Line" />
                  </div>
                )}

                {/* 📍 SECTION B: THE STOP (The Core Content) */}
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

                {/* 🚗 SECTION C: TRAVEL SEGMENT (The Bridge to Next Stop) */}
                {index < calculatedStops.length - 1 && stop.drive_to_next_miles != null && (
                  <TravelSegment 
                    index={index}
                    miles={stop.drive_to_next_miles}
                    minutes={stop.drive_to_next_minutes}
                  />
                )}

              </React.Fragment>
            );
          })}

        </SortableContext>
      </DndContext>

      <div className="StopsList_Footer">
        <button className="StopsList_AddButton" onClick={handleAddStop}>
          + Add New Stop
        </button>
      </div>
    </div>
  );
};