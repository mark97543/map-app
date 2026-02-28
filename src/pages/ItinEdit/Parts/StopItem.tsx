import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type UniqueIdentifier } from "@dnd-kit/core"; 
import Button from "../../../assets/componets/Button/Button";
import { useEffect,useState } from "react";


interface ItemProps{
  id:UniqueIdentifier;
  label:string;
  onSave:(id:UniqueIdentifier, newLabel:string)=>void;
}

export function StopItem({id, label, onSave}:ItemProps){
  const [editItem, setEditItem]=useState(false);
  const [draftLabel, setDraftLabel] = useState(label);
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
  }, [label]);

  // ⚡ ONLY the dynamic movement stays inline
  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleSave = () =>{
    onSave(id, draftLabel)
    setEditItem(false)
  }

  const editClick = (selection:UniqueIdentifier) =>{
    setEditItem(!editItem)
  }

  const cancelEdit = ()=>{
    setDraftLabel(label);
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
          <strong>{label}</strong>
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














    </div>
  )
}

