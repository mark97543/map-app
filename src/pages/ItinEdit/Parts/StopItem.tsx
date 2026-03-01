/* ==========================================================================
   COMPONENT: StopItem
   DESCRIPTION: Individual stop card with drag handle, precise grid alignment, 
                inline-labeled edit mode, and right-aligned no-wrap times.
   ========================================================================== */

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type UniqueIdentifier } from "@dnd-kit/core";
import { useEffect, useState } from "react";
import { Copy, Check } from "lucide-react"; 

import Button from "../../../assets/componets/Button/Button";
import { STOP_TYPES } from "./Resources/stopTypes";
import { minToHHMM } from "./Resources/TimeFunc";
import { type Stop } from "../ItinEdit";

// 🎯 The "Brain" for a single Row
interface ItemProps {
  id: UniqueIdentifier;
  label: string;
  type: string;
  note: string;
  stay: number | null;
  morning_depart: string | null;
  budget: number | null;
  lat: number | null;
  lng: number | null;
  arrivalTime?: string;   
  departureTime?: string; 
  onSave: (id: UniqueIdentifier, updates: Partial<Stop>) => void; 
}

export function StopItem({ 
  id, label, onSave, type, note, stay, morning_depart, budget, 
  lat, lng, arrivalTime, departureTime 
}: ItemProps) {
  
  // #region --- STATE ---
  const [editItem, setEditItem] = useState(false);
  const [draft, setDraft] = useState({
    label,
    type,
    note,
    stay,
    morning_depart,
    budget: budget?.toString() || "",
    lat,
    lng
  });
  const [copied, setCopied] = useState(false);

  const typeConfig = STOP_TYPES[draft.type] || STOP_TYPES.origin;
  const Icon = typeConfig.icon;
  // #endregion

  // #region --- DND-KIT SETUP ---
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const dynamicStyle = { transform: CSS.Transform.toString(transform), transition };
  // #endregion

  // #region --- SYNC ---
  useEffect(() => {
    setDraft({
      label, type, note, stay, morning_depart,
      budget: budget?.toString() || "", lat, lng
    });
  }, [label, type, note, stay, morning_depart, budget, lat, lng]);
  // #endregion

  // #region --- ACTIONS ---
  const handleSave = () => {
    const isHotel = draft.type === "hotel";
    
    const finalUpdates: Partial<Stop> = {
      name: draft.label,
      type: draft.type,
      note: draft.note,
      stay_time: isHotel ? 0 : draft.stay,
      morning_depart: isHotel ? draft.morning_depart : null,
      budget: draft.budget === "" ? null : parseFloat(draft.budget),
      lat: draft.lat !== null ? Number(draft.lat) : null,
      lng: draft.lng !== null ? Number(draft.lng) : null,
    };

    onSave(id, finalUpdates);
    setEditItem(false);
  };

  const handleCancel = () => {
    setDraft({
      label, type, note, stay, morning_depart,
      budget: budget?.toString() || "", lat, lng
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
  // #endregion

  return (
    <div ref={setNodeRef} style={dynamicStyle} className={`StopItems_wrapper ${isDragging ? "StopItems_dragging" : ""}`}>
      
      {/* 1. GRABBER */}
      <div {...attributes} {...listeners} className="StopItem_grabber_div">
        <span className="StopItem_grabber">⠿</span>
      </div>

      {/* 2. HEADER (Title & Actions spanning the top) */}
      <div className="StopItem_titleRow">
        {editItem ? (
          <input 
            value={draft.label} 
            onChange={(e) => setDraft({...draft, label: e.target.value})} 
            className="StopItem_input" 
          />
        ) : (
          <strong className="StopItem_LabelText">{draft.label}</strong>
        )}

        <div className="StopItem_ActionButtons">
          {editItem ? (
            <>
              <Button addClass="StopItem_EditButton" onClick={handleSave}>Save</Button>
              <Button type="caution" addClass="StopItem_Cancel" onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button addClass="StopItem_EditButton" onClick={() => setEditItem(true)}>Edit</Button>
          )}
        </div>
      </div>

      {/* 3. ICON SIDEBAR */}
      <div className="StopItem_Icon">
        {editItem ? (
          <div className="StopItem_EditLocation">
            <span className="Edit_Prefix">Type</span>
            <select value={draft.type} onChange={(e) => setDraft({...draft, type: e.target.value})} className="StopItem_TypeSelect">
              {Object.entries(STOP_TYPES).map(([key, value]) => (
                <option key={key} value={key}>{value.label}</option>
              ))}
            </select>
          </div>
        ) : (
          <>
            <Icon size={32} color={typeConfig.color} strokeWidth={2.5} />
            <p className="Icon_LabelText">{typeConfig.label}</p>
          </>
        )}
      </div>

      {/* 4. LOGISTICS ROW (Strict Vertical Columns) */}
      <div className="StopItem_StayBudget">
          
          {/* Stay */}
          <div className="StayBudget_Group">
            {editItem ? (
                draft.type === "hotel" ? (
                   <><span className="Edit_Prefix">Dep:</span><input type="time" value={draft.morning_depart || ""} onChange={(e) => setDraft({...draft, morning_depart: e.target.value})} /></>
                ) : (
                   <><span className="Edit_Prefix">Stay:</span><input type="number" value={draft.stay ?? ""} onChange={(e) => setDraft({...draft, stay: Number(e.target.value)})} placeholder="min" /></>
                )
            ) : (
                <span>{draft.type === "hotel" ? `Start: ${draft.morning_depart}` : `Stay: ${minToHHMM(draft.stay ?? 0)}`}</span>
            )}
          </div>

          {/* Budget */}
          <div className="StayBudget_Group">
             {editItem ? (
                 <><span className="Edit_Prefix">$</span><input type="text" value={draft.budget} onChange={(e) => setDraft({...draft, budget: e.target.value})} placeholder="0.00" /></>
             ) : (
                 <span>${parseFloat(draft.budget || "0").toFixed(2)}</span>
             )}
          </div>

          {/* Coordinates */}
          <div className="StayBudget_Group">
             {editItem ? (
                <div className="StopItem_CoordInputs_Inline">
                  <span className="Edit_Prefix">Lat:</span>
                  <input type="number" value={draft.lat ?? ""} onChange={(e) => setDraft({...draft, lat: Number(e.target.value)})} placeholder="0.0" />
                  <span className="Edit_Prefix">Lng:</span>
                  <input type="number" value={draft.lng ?? ""} onChange={(e) => setDraft({...draft, lng: Number(e.target.value)})} placeholder="0.0" />
                </div>
             ) : (
                draft.lat && draft.lng && (
                  <div className="StopItem_Coords" onClick={copyCoords} title="Copy Coordinates">
                    {copied ? <Check size={10} color="#00ffaa" /> : <Copy size={10} />}
                    <span>{Number(draft.lat).toFixed(5)}, {Number(draft.lng).toFixed(5)}</span>
                  </div>
                )
             )}
          </div>
      </div>

      {/* 5. NOTES */}
      <div className="StopItem_note">
        {editItem ? (
          <input value={draft.note} onChange={(e) => setDraft({...draft, note: e.target.value})} placeholder="Add a note..." className="StopItem_noteInput" />
        ) : (
          <p><i><b>Note: </b></i> {draft.note || "No notes."}</p>
        )}
      </div>

      {/* 6. TIME STACK (Right-Aligned Column) */}
      {!editItem && (
        <div className="StopItem_TimeStack">
          <span className="TimeStack_Arr">Arr: {arrivalTime || "--:--"}</span>
          <span className="TimeStack_Dep">Dep: {departureTime || "--:--"}</span>
        </div>
      )}

    </div>
  );
}

/* ==========================================================================
   FUTURE UPDATES & ROADMAP
   ========================================================================== */
// #region --- TODOS ---
/**
 * TODO: Add a "Locate on Map" button that centers the main map on this stop's coords.
 * TODO: Implement auto-reverse geocoding to suggest a label based on Lat/Lng.
 */
// #endregion