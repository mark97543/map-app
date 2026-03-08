import { useState, useEffect } from "react";
import { type DragEndEvent, type UniqueIdentifier } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useMyState, type Stop } from "../../../../context/StatesContext";
import { useTripEdit } from "../../../../context/TripEditContext";
import { createStopInDB, deleteStopFromDB, updateStopsBatch, updateStopInDB } from '../../../../services/api'; 
import { fetchBatchDriveData, addMinutes } from "../Resources/RouteEngine";

export const useStopsListLogic = () => {
  const { handleAutoSave, syncTripStats } = useTripEdit();
  const { 
    tripDetails, 
    tempSegments, 
    setTempSegments, 
    calculatedStops, 
    setCalculatedStops,
    setTotalMiles, 
    setTotalBudget, 
    setTotalMinutes, 
    tempStartTime 
  } = useMyState();

  const [isCalculating, setIsCalculating] = useState(false);

  // --- THE TIME RIPPLE ENGINE ---
  useEffect(() => {
    const runTimeRipple = async () => {
      if (tempSegments.length === 0) {
        setCalculatedStops([]);
        return;
      }

      setIsCalculating(true);

      // 1. Deep clone to avoid mutating state directly during calculation
      const newCalculatedStops = JSON.parse(JSON.stringify(tempSegments)); 
      
      const validCoords = newCalculatedStops
        .filter((s: any) => s.lat && s.lng && s.lat !== 0 && s.lng !== 0)
        .map((s: any) => ({ lat: s.lat, lng: s.lng }));

      // 2. FETCH DRIVE DATA (Scoped correctly so it's accessible below)
      let driveLegs: any[] = [];
      if (validCoords.length >= 2) {
        try {
          driveLegs = await fetchBatchDriveData(validCoords);
        } catch (error) {
          console.error("Mapbox Fetch Error:", error);
        }
      }

      // 3. ESTABLISH THE MASTER CLOCK
      // Fallback priority: First Stop Depart -> Trip Global Start -> Default 08:00
      let currentClock = newCalculatedStops[0].morning_depart || tempStartTime || "08:00";
      let validCoordIndex = 0; 

      for (let i = 0; i < newCalculatedStops.length; i++) {
        const stop = newCalculatedStops[i];

        // --- STEP A: ARRIVAL TIME ---
        // First stop is the origin, so it has no arrival time.
        stop.arrival_time = i === 0 ? "--:--" : currentClock;

        // --- STEP B: DEPARTURE TIME ---
        if (i === 0) {
          // The Trip Origin always anchors to the established start time
          stop.departure_time = stop.morning_depart || tempStartTime || "08:00";
        } else if (stop.type === "hotel") {
          // Hotels reset the clock for a fresh morning departure
          stop.departure_time = stop.morning_depart || "08:00";
        } else {
          // Standard stops: Departure = Arrival + Stay Time
          stop.departure_time = addMinutes(stop.arrival_time, stop.stay_time || 0);
        }

        // Advance the clock to the moment we leave this stop
        currentClock = stop.departure_time;

        // --- STEP C: DRIVE TIME TO NEXT ---
        if (i < newCalculatedStops.length - 1) {
          const nextStop = newCalculatedStops[i + 1];
          // Only calculate drive if both current and next stop have coordinates
          if (stop.lat && stop.lng && nextStop.lat && nextStop.lng) {
            const leg = driveLegs[validCoordIndex];
            if (leg) {
              stop.drive_to_next_miles = leg.miles;
              stop.drive_to_next_minutes = leg.minutes;
              
              // Ripple the drive minutes into the next stop's arrival clock
              currentClock = addMinutes(currentClock, leg.minutes);
              validCoordIndex++; 
            }
          } else {
            stop.drive_to_next_miles = null;
            stop.drive_to_next_minutes = null;
          }
        }
      }

      // 4. CALCULATE GRAND TOTALS
      const totalMiles = newCalculatedStops.reduce((acc: number, stop: any) => 
        acc + (Number(stop.drive_to_next_miles) || 0), 0);
      
      const totalMin = newCalculatedStops.reduce((acc: number, stop: any) => 
        acc + (Number(stop.drive_to_next_minutes) || 0), 0);
      
      const totalBudget = newCalculatedStops.reduce((acc: number, stop: any) => 
        acc + (Number(stop.budget) || 0), 0);

      // 5. UPDATE STATE AND SYNC TO DATABASE
      setCalculatedStops(newCalculatedStops);
      setTotalMiles(totalMiles);
      setTotalMinutes(totalMin);
      setTotalBudget(totalBudget);

      // Specialized save function to update the Trip record in Directus
      syncTripStats(totalMiles, totalMin, totalBudget);
      
      setIsCalculating(false);
    };

    // Debounce the calculation by 500ms to allow for rapid user input/dragging
    const timer = setTimeout(runTimeRipple, 500);
    return () => clearTimeout(timer);
    
    // Watch tempSegments for reorders/edits and tempStartTime for dashboard shifts
  }, [tempSegments, tempStartTime]);

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