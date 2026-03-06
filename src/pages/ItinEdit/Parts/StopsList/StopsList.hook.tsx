import { useState, useEffect } from "react";
import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMyState, type Stop } from "../../../../context/StatesContext";
import { useTripEdit } from "../../../../context/TripEditContext";
import { createStopInDB, deleteStopFromDB, updateStopsBatch, updateStopInDB } from '../../../../services/api'; 
import { fetchBatchDriveData, addMinutes } from "../Resources/RouteEngine";

export const useStopsListLogic = () => {
  const { handleAutoSave } = useTripEdit();
  const { tripDetails, tempSegments, setTempSegments } = useMyState();

  const [calculatedStops, setCalculatedStops] = useState<any[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);

  // --- THE TIME RIPPLE ENGINE ---
  useEffect(() => {
    const runTimeRipple = async () => {
      if (tempSegments.length === 0) {
        setCalculatedStops([]);
        return;
      }

      setIsCalculating(true);
      // Deep clone to avoid mutating state directly during calculation
      const newCalculatedStops = JSON.parse(JSON.stringify(tempSegments)); 
      
      const validCoords = newCalculatedStops
        .filter((s: any) => s.lat && s.lng && s.lat !== 0 && s.lng !== 0)
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

    const timer = setTimeout(runTimeRipple, 500);
    return () => clearTimeout(timer);
  }, [tempSegments]);

  // --- CRUD ACTIONS ---
  const handleAddStop = async () => {
    if (!tripDetails?.id) return;
    const blankStop = {
      trip_id: tripDetails.id, 
      sort: tempSegments.length + 1,
      name: "New Stop",
      type: "origin", 
      stay_time: 0,
      morning_depart: "08:00",
      lat: 0, lng: 0
    };

    try {
      const newStopFromDB = await createStopInDB(blankStop);
      setTempSegments((prev) => [...prev, newStopFromDB]);
    } catch (error) {
      console.error("❌ Failed to add stop", error);
    }
  };

  const handleDeleteStop = async (stopId: string | number) => {
    if (!window.confirm("Delete this stop?")) return;
    try {
      await deleteStopFromDB(stopId);
      setTempSegments((prev) => prev.filter((s) => s.id !== stopId));
      handleAutoSave(); 
    } catch (error) {
      console.error("Failed to delete stop:", error);
    }
  };

  const handleUpdateStopData = async (id: UniqueIdentifier, updates: Partial<Stop>) => {
    setTempSegments((prev) => prev.map((s) => (s.id === id ? { ...s, ...updates } : s)));
    try {
      await updateStopInDB(id, updates); 
      handleAutoSave(); 
    } catch (error) {
      console.error("❌ Failed to save stop:", error);
    }
  };

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
      }
    }
  };

  return {
    calculatedStops,
    isCalculating,
    tempSegments,
    handleAddStop,
    handleDeleteStop,
    handleUpdateStopData,
    handleDragEnd
  };
};