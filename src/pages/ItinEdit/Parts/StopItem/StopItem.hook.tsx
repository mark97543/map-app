import { useState, useEffect } from "react";
import { type UniqueIdentifier } from "@dnd-kit/core";
import { STOP_TYPES } from "../Resources/stopTypes";
import { type Stop } from "../../../../context/StatesContext";

interface UseStopItemProps {
  id: UniqueIdentifier;
  label: string;
  type: string;
  note: string;
  stay: number | null;
  morning_depart: string | null;
  budget: number | null;
  lat: number | null;
  lng: number | null;
  onSave: (id: UniqueIdentifier, updates: Partial<Stop>) => void;
}

export const useStopItemLogic = (props: UseStopItemProps) => {
  const [editItem, setEditItem] = useState(false);
  const [copied, setCopied] = useState(false);
  
  // Local Draft State: This is what the user types into
  const [draft, setDraft] = useState({
    label: props.label,
    type: props.type,
    note: props.note,
    stay: props.stay,
    morning_depart: props.morning_depart,
    budget: props.budget?.toString() || "",
    lat: props.lat !== null ? props.lat.toString() : "", 
    lng: props.lng !== null ? props.lng.toString() : ""
  });

  // Keep the draft in sync if the Parent/Context data changes (e.g., from Mapbox results)
  useEffect(() => {
    setDraft({
      label: props.label,
      type: props.type,
      note: props.note,
      stay: props.stay,
      morning_depart: props.morning_depart,
      budget: props.budget?.toString() || "", 
      lat: props.lat !== null ? props.lat.toString() : "", 
      lng: props.lng !== null ? props.lng.toString() : ""
    });
  }, [props.label, props.type, props.note, props.stay, props.morning_depart, props.budget, props.lat, props.lng]);

  const typeConfig = STOP_TYPES[draft.type] || STOP_TYPES.origin;
  const Icon = typeConfig.icon;

  const handleSave = () => {
    const isHotel = draft.type === "hotel";
    
    // Parse strings back to numbers for the DB
    const parsedLat = draft.lat !== "" ? parseFloat(draft.lat) : null;
    const parsedLng = draft.lng !== "" ? parseFloat(draft.lng) : null;

    const finalUpdates: Partial<Stop> = {
      name: draft.label,
      type: draft.type,
      note: draft.note,
      stay_time: isHotel ? 0 : draft.stay,
      morning_depart: isHotel ? draft.morning_depart : null,
      budget: draft.budget === "" ? null : parseFloat(draft.budget),
      lat: isNaN(parsedLat as number) ? null : parsedLat,
      lng: isNaN(parsedLng as number) ? null : parsedLng,
    };

    props.onSave(props.id, finalUpdates);
    setEditItem(false);
  };

  const handleCancel = () => {
    // Reset draft to current props
    setDraft({
      label: props.label,
      type: props.type,
      note: props.note,
      stay: props.stay,
      morning_depart: props.morning_depart,
      budget: props.budget?.toString() || "",
      lat: props.lat !== null ? props.lat.toString() : "", 
      lng: props.lng !== null ? props.lng.toString() : ""
    });
    setEditItem(false);
  };

  const copyCoords = () => {
    if (draft.lat && draft.lng) {
      navigator.clipboard.writeText(`${draft.lat}, ${draft.lng}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return {
    editItem, setEditItem,
    draft, setDraft,
    copied,
    typeConfig,
    Icon,
    handleSave,
    handleCancel,
    copyCoords
  };
};