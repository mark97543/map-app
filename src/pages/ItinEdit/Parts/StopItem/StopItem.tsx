import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Copy, Check, Trash2 } from "lucide-react"; 
import { useStopItemLogic } from "./StopItem.hook";
import { STOP_TYPES } from "../Resources/stopTypes";
import { minToHHMM } from "../Resources/TimeFunc";
import Button from "../../../../assets/componets/Button/Button";
import './StopItem.css';

// Props matching your UI requirements
interface ItemProps {
  id: any; label: string; type: string; note: string;
  stay: number | null; morning_depart: string | null;
  budget: number | null; lat: number | null; lng: number | null;
  arrivalTime?: string; departureTime?: string; 
  onSave: any; onDelete: any;
}

export function StopItem(props: ItemProps) {
  // 1. Hook into the Logic
  const {
    editItem, setEditItem, draft, setDraft,
    copied, typeConfig, Icon, handleSave, handleCancel, copyCoords
  } = useStopItemLogic(props);

  // 2. Hook into the Drag-and-Drop
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.id });
  const dynamicStyle = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={dynamicStyle} className={`StopItems_wrapper ${isDragging ? "StopItems_dragging" : ""}`}>
      
      {/* AREA 1: GRABBER */}
      <div {...attributes} {...listeners} className="StopItem_grabber_div">
        <span className="StopItem_grabber">⠿</span>
      </div>

      {/* AREA 2: HEADER */}
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
              <button className="StopItem_DeleteBtn" onClick={() => props.onDelete(props.id)}>
                  <Trash2 size={18} />
              </button>
              <Button onClick={handleSave}>Save</Button>
              <Button type="caution" onClick={handleCancel}>Cancel</Button>
            </>
          ) : (
            <Button onClick={() => setEditItem(true)}>Edit</Button>
          )}
        </div>
      </div>

      {/* AREA 3: ICON SIDEBAR */}
      <div className="StopItem_Icon">
        {editItem ? (
          <div className="StopItem_EditLocation">
            <span className="Edit_Prefix">Type</span>
            <select value={draft.type} onChange={(e) => setDraft({...draft, type: e.target.value})} className="StopItem_TypeSelect">
              {Object.entries(STOP_TYPES).map(([key, value]: any) => (
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

      {/* AREA 4: LOGISTICS (Stay, Budget, Coords) */}
      <div className="StopItem_StayBudget">
          <div className="StayBudget_Group">
            {editItem ? (
                draft.type === "hotel" ? (
                   <><span className="Edit_Prefix">Dep:</span><input type="time" value={draft.morning_depart || ""} onChange={(e) => setDraft({...draft, morning_depart: e.target.value})} /></>
                ) : (
                   <><span className="Edit_Prefix">Stay:</span><input type="number" value={draft.stay ?? ""} onChange={(e) => setDraft({...draft, stay: Number(e.target.value)})} /></>
                )
            ) : (
                <span>{draft.type === "hotel" ? `Start: ${draft.morning_depart}` : `Stay: ${minToHHMM(draft.stay ?? 0)}`}</span>
            )}
          </div>

          <div className="StayBudget_Group">
             {editItem ? (
                 <><span className="Edit_Prefix">$</span><input type="text" value={draft.budget} onChange={(e) => setDraft({...draft, budget: e.target.value})} /></>
             ) : (
                 <span>${parseFloat(draft.budget || "0").toFixed(2)}</span>
             )}
          </div>

          <div className="StayBudget_Group">
             {editItem ? (
                <div className="StopItem_CoordInputs_Inline">
                  <span className="Edit_Prefix">Lat,Lng:</span>
                  <input 
                    type="text" 
                    value={`${draft.lat}${draft.lng ? `, ${draft.lng}` : ""}`}
                    onChange={(e) => {
                      const [lat, lng] = e.target.value.split(",");
                      setDraft({ ...draft, lat: lat.trim(), lng: lng ? lng.trim() : "" });
                    }}
                  />
                </div>
             ) : (
                draft.lat && draft.lng && (
                  <div className="StopItem_Coords" onClick={copyCoords}>
                    {copied ? <Check size={10} color="#00ffaa" /> : <Copy size={10} />}
                    <span>{Number(draft.lat).toFixed(4)}, {Number(draft.lng).toFixed(4)}</span>
                  </div>
                )
             )}
          </div>
      </div>

      {/* AREA 5: NOTE */}
      <div className="StopItem_note">
        {editItem ? (
          <input value={draft.note} onChange={(e) => setDraft({...draft, note: e.target.value})} className="StopItem_noteInput" />
        ) : (
          <p><i><b>Note: </b></i> {draft.note || "No notes."}</p>
        )}
      </div>

      {/* AREA 6: TIMES */}
      {!editItem && (
        <div className="StopItem_TimeStack">
          <span className="TimeStack_Arr">Arr: {props.arrivalTime || "--:--"}</span>
          <span className="TimeStack_Dep">Dep: {props.departureTime || "--:--"}</span>
        </div>
      )}
    </div>
  );
}