/* ==========================================================================
   COMPONENT: StopsList
   DESCRIPTION: Renders the draggable, sortable list of itinerary stops.
                Manages the Time Ripple engine to calculate arrival/departure
                times dynamically via the Mapbox Directions API batching.
   ========================================================================== */

import React, { useState, useEffect } from "react";
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  type DragEndEvent ,
  type UniqueIdentifier
} from "@dnd-kit/core";
import { 
  arrayMove, 
  SortableContext, 
  sortableKeyboardCoordinates, 
  verticalListSortingStrategy 
} from "@dnd-kit/sortable";

import { StopItem } from "./StopItem";
import TravelSegment from "./TravelSegment"; 
import { type Stop } from "../../../context/TripEditContext";
import { createStopInDB, deleteStopFromDB, updateStopsBatch, updateStopInDB } from '../../../services/api'; 
import { fetchBatchDriveData, addMinutes } from "./Resources/RouteEngine";
import { useTripEdit } from "../../../context/TripEditContext";

export const StopsList: React.FC = () => {
  const {
    tripDetails,
    handleAutoSave,
    tempSegments,
    setTempSegments,
    addWaypoint 
  } = useTripEdit();

  const [calculatedStops, setCalculatedStops] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // #region --- DRAG & DROP SENSORS ---
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, 
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );
  // #endregion

  // #region --- TIME RIPPLE ENGINE ---
  useEffect(() => {
    const runTimeRipple = async () => {
      if (tempSegments.length === 0) {
        setCalculatedStops([]);
        return;
      }

      setIsCalculating(true);
      const newCalculatedStops = JSON.parse(JSON.stringify(tempSegments)); 
      
      const validCoords = newCalculatedStops
        .filter((s: any) => 
          s.lat !== null && 
          s.lng !== null && 
          s.lat !== 0 && 
          s.lng !== 0 
        )
        .map((s: any) => ({ lat: s.lat, lng: s.lng }));

      let driveLegs: any[] = [];
      if (validCoords.length >= 2) {
        driveLegs = await fetchBatchDriveData(validCoords);
      }

      let currentDepartureTime = newCalculatedStops[0].morning_depart || "08:00";
      let validCoordIndex = 0; 

      for (let i = 0; i < newCalculatedStops.length; i++) {
        const stop = newCalculatedStops[i];

        stop.arrival_time = i === 0 ? "--:--" : currentDepartureTime;

        if (stop.type === "hotel" && stop.morning_depart) {
          stop.departure_time = stop.morning_depart;
        } else {
          stop.departure_time = addMinutes(stop.arrival_time, stop.stay_time || 0);
        }
        currentDepartureTime = stop.departure_time;

        if (i < newCalculatedStops.length - 1) {
          const nextStop = newCalculatedStops[i + 1];
          
          if (stop.lat && stop.lng && nextStop.lat && nextStop.lng) {
            const leg = driveLegs[validCoordIndex];
            if (leg) {
              stop.drive_to_next_miles = leg.miles;
              stop.drive_to_next_minutes = leg.minutes;
              
              currentDepartureTime = addMinutes(currentDepartureTime, leg.minutes);
              validCoordIndex++; 
            }
          } else {
            stop.drive_to_next_miles = null;
            stop.drive_to_next_minutes = null;
          }
        }
      }

      setCalculatedStops(newCalculatedStops);
      setIsCalculating(false);
    };

    const timer = setTimeout(() => {
      runTimeRipple();
    }, 500);

    return () => clearTimeout(timer);
  }, [tempSegments]); 
  // #endregion

  // #region --- CRUD HANDLERS ---
  const handleAddStop = async () => {
    const blankStop = {
      trip_id: tripDetails?.id, 
      sort: tempSegments.length + 1,
      name: "New Stop",
      type: "origin", 
      note: "",
      stay_time: 0,
      morning_depart: "08:00",
      budget: 0,
      lat: 0,
      lng: 0
    };

    try {
      const newStopFromDB = await createStopInDB(blankStop);
      setTempSegments((prev) => [...prev, newStopFromDB]);
    } catch (error) {
      console.error("❌ Failed to add new stop", error);
    }
  };

  const handleDeleteStop = async (stopId: string | number) => {
    const confirm = window.confirm("Are you sure you want to delete this stop?");
    if (!confirm) return;

    try {
      await deleteStopFromDB(stopId);
      setTempSegments((prev) => prev.filter((s) => s.id !== stopId));
      handleAutoSave(); 
    } catch (error) {
      console.error("Failed to delete stop:", error);
    }
  };

  const handleUpdateStopData = async (id: UniqueIdentifier, updates: Partial<Stop>) => {
    setTempSegments((prev) => 
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
    );

    try {
      await updateStopInDB(id, updates); 
      handleAutoSave(); 
    } catch (error) {
      console.error("❌ Failed to save stop:", error);
    }
  };
  // #endregion

  // #region --- DRAG & DROP HANDLER ---
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = tempSegments.findIndex((stop) => stop.id === active.id);
      const newIndex = tempSegments.findIndex((stop) => stop.id === over.id);

      const reorderedStops = arrayMove(tempSegments, oldIndex, newIndex).map((stop, index) => ({
        ...stop,
        sort: index + 1, 
      }));

      setTempSegments(reorderedStops);

      try {
        await updateStopsBatch(reorderedStops);
      } catch (error) {
        console.error("Failed to save sort order:", error);
        setTempSegments(tempSegments); 
      }
    }
  };
  // #endregion

  return (
    <div className="StopsList_wrapper">
      <h2>
        Itinerary Stops 
        {isCalculating && <span style={{fontSize: '0.8em', color: 'var(--success-teal)', marginLeft: '10px'}}>(Calculating Route...)</span>}
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

              {/* THE CLEAN, STANDALONE TRAVEL SEGMENT COMPONENT */}
              {index < calculatedStops.length - 1 && stop.drive_to_next_miles !== null && stop.drive_to_next_miles !== undefined && (
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