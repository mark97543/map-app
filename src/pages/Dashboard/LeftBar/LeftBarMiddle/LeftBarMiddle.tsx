import './LeftBarMiddle.css'
import { DashboardProvider, useDashboard } from '../../../../context/DashboardContext'
import { DndContext, closestCenter,type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableLocation from './Components/SortableLocation';

function LeftBarMiddle(){
  const {locations, setLocations} =useDashboard();

  const DeleteItem = (id:string) =>{
    setLocations((prevLocations)=>prevLocations.filter(location=>location.id!== id));
    //TODO: When working with DB this should trigger a save
  }

  const handleDragEnd = (event:DragEndEvent)=>{
    const {active, over}=event;

    if(over && active.id !== over.id){
      setLocations((items)=>{
        const oldIndex = items.findIndex((i)=> i.id === active.id);
        const newIndex = items.findIndex((i)=> i.id === over.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }

    //TODO: Need to have a function to save to DB once drag event is completed. 
  };

  return(
    <div className='LEFTBAR_MIDDLE_WRAPPER'>
      {locations && locations.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={locations} strategy={verticalListSortingStrategy}>
            {locations.map((location, index) => ( 
              <SortableLocation 
                key={location.id} 
                location={location} 
                onDelete={DeleteItem}
                index={index} 
              />
            ))}
          </SortableContext>
        </DndContext>
      ):(
        <div className="EMPTY_STATE">
          <p>No waypoints marked</p>
        </div>
      )} 

    </div>
  )
}

export default LeftBarMiddle

//TODO: Make gui for the Items
//TODO: Add Break TIme
//TODO: Add Budget
//TODO: Add Arrival TIme
//TODO: Add Depart Time
//TODO: Add distance, time between stops 
//TODO: Draggable Elements
//TODO: Add more Data
//TODO: Need to figure where to add notes (Maybe seperate screen)