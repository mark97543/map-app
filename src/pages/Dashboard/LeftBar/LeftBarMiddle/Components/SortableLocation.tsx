import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

function SortableLocation({location, onDelete}:{location:any, onDelete: (id: string) => void}){
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

  return(
    <div
      ref={setNodeRef}
      style={style}
      className='LEFTBAR_LOCATION_DIV'>
        {/* LISTENERS go on the drag handle so only the dots trigger the move */}
        <p {...attributes} {...listeners} className="DRAG_HANDLE">⠿</p>
        <p>{location.name}</p>
        <p>{location.coord.lat}, {location.coord.lng}</p>
        <button onClick={() => onDelete(location.id)} className='LEFTBAR_DELETE'>🗑</button>
    </div>
  )
}

export default SortableLocation