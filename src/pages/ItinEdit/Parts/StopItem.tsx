import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type UniqueIdentifier } from "@dnd-kit/core"; 
import Button from "../../../assets/componets/Button/Button";
import { useEffect,useState } from "react";
import { STOP_TYPES } from "./Resources/stopTypes";



interface ItemProps{
  id:UniqueIdentifier;
  label:string;
  onSave:(id:UniqueIdentifier, newLabel:string, newType:string, note:string)=>void;
  type:string;
  note:string;
}

export function StopItem({id, label, onSave, type, note}:ItemProps){
  const [editItem, setEditItem]=useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
  const [draftType, setDraftType]=useState(type);
  const typeConfig = STOP_TYPES[type] || STOP_TYPES.origin;
  const Icon = typeConfig.icon;
  const [draftNote, setDraftNote]= useState(note)
  //The Hook
  const {
    attributes,   // Accessibility (ARIA)
    listeners,    // Mouse/Touch events
    setNodeRef,   // Connects the HTML element to the logic
    transform,    // The "Ghost" movement coordinates
    transition,   // Smooth snapping back
    isDragging
  }=useSortable({id:id});

  //Keep draft in sync if the label changes from outside (e.g. database refresh)
  useEffect(() => {
    setDraftLabel(label);
    setDraftType(type)
    setDraftNote(note)
  }, [label, type, note]);

  // ⚡ ONLY the dynamic movement stays inline
  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () =>{
    onSave(id, draftLabel, draftType, draftNote)
    setEditItem(false)
  }

  const cancelEdit = ()=>{
    setDraftLabel(label);
    setDraftType(type);
    setDraftNote(note)
    setEditItem(!editItem)
  }

  return(
    <div 
      ref={setNodeRef} 
      className={`StopItems_wrapper ${isDragging ? 'StopItems_dragging' : ''}`} 
      style={dynamicStyle} 
      >
      
      {/* ------------------------------- Grabber Bar ------------------------------ */}
      <div {...attributes} {...listeners}className="StopItem_grabber_div">
        <span className="StopItem_grabber" >⠿</span>
      </div>

      {/* --------------------------------- Top Row -------------------------------- */}
      <div className="StopItem_titleRow">
        {editItem ? (
          <input
            value={draftLabel}
            onChange={(e) => setDraftLabel(e.target.value)}
            className="StopItem_input"
          />
        ):(
          <strong>{draftLabel}</strong>
        )}
        {editItem ? (
            <>
              <Button addClass="StopItem_EditButton" onClick={handleSave}>Save</Button>
              <Button type='caution' addClass="StopItem_Cancel" onClick={cancelEdit}>Cancel</Button>
            </>
          ) : (
            <Button addClass="StopItem_EditButton" onClick={() => setEditItem(true)}>Edit</Button>
          )}

      </div>

      {/*--------------Stop Type Area------------------------- */}
      <div className="StopItem_Icon">
        {editItem ? (
          <select 
            value={draftType} 
            onChange={(e) => setDraftType(e.target.value)}
            className="StopItem_TypeSelect"
          >
            {Object.entries(STOP_TYPES).map(([key, value]) => (
              <option key={key} value={key}>
                {value.label}
              </option>
            ))}
          </select>
        ):(
          <>
            <Icon
              size={40}
              color={typeConfig.color}
              strokeWidth={2.5}
            />
            <p>{typeConfig.label}</p>
          </>
        )}
      </div>


      {/*-----------Note --------------- */}
      <div className="StopItem_note">
        {editItem ? (
          <div className="StopItem_noteInput_div">
            <input 
              value={draftNote}
              className="StopItem_noteInput"
              onChange={(e)=>setDraftNote(e.target.value)}
            />
          </div>
        ):(
          <>
            
            <p><i><b>Note: </b></i> {draftNote}</p>
          </>
        )}

      </div>








    </div>
  )
}

