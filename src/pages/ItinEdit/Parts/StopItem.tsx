import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { type UniqueIdentifier } from "@dnd-kit/core"; 

interface ItemProps{
  id:UniqueIdentifier;
  label:string;
}

export function StopItem({id, label}:ItemProps){
  //The Hook
  const {
    attributes,   // Accessibility (ARIA)
    listeners,    // Mouse/Touch events
    setNodeRef,   // Connects the HTML element to the logic
    transform,    // The "Ghost" movement coordinates
    transition,   // Smooth snapping back
    isDragging
  }=useSortable({id:id});

  // ⚡ ONLY the dynamic movement stays inline
  const dynamicStyle = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return(
    <div 
      ref={setNodeRef} 
      className={`StopItems_wrapper ${isDragging ? 'StopItems_dragging' : ''}`} 
      style={dynamicStyle} 
      {...attributes} 
      {...listeners}
      >
      <div className="StopItem_grabber_div">
        <span className="StopItem_grabber" >⠿</span>
      </div>
      <strong>{label}</strong>
    </div>
  )
}