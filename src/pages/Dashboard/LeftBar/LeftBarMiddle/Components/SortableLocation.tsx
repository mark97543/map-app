import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';
import { DashboardProvider, useDashboard } from '../../../../../context/DashboardContext';

function SortableLocation({location, onDelete,index}:{location:any, onDelete: (id: string) => void, index:number}){
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition
  } = useSortable({ id: location.id });

  const style={
    transform:CSS.Transform.toString(transform),
    transition
  }

  const {map} = useDashboard();

  const handleLocationClick=(loc:any)=>{
    map?.flyTo({
      center:[loc.coord.lng, loc.coord.lat],
      zoom:16,
      essential:true
    })
  }

  return(
    <div
      ref={setNodeRef}
      style={style}
      className='LEFTBAR_LOCATION_DIV' onClick={()=>handleLocationClick(location)} >
        {/* LISTENERS go on the drag handle so only the dots trigger the move */}
        {/* <p {...attributes} {...listeners} className="DRAG_HANDLE">⠿</p> */}
        <span {...attributes} {...listeners} className="INDEX_NUMBER DRAG_HANDLE">{index + 1}</span>
        <p>{location.name}</p>
        <p>{location.coord.lat.toFixed(4)}, {location.coord.lng.toFixed(4)}</p>
        <button onClick={(e) =>{
          e.stopPropagation();
          onDelete(location.id)}} className='LEFTBAR_DELETE'>🗑</button>
    </div>
  )
}

export default SortableLocation