import './LeftBarMiddle.css'
import { useDashboard } from '../../../../context/DashboardContext'
import { DndContext, closestCenter,type DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import SortableLocation from './Components/SortableLocation';
import React from 'react';

function LeftBarMiddle(){
  const {locations, setLocations, routeData} = useDashboard();

  const DeleteItem = (id:string) =>{
    setLocations((prevLocations)=>prevLocations.filter(location=>location.id!== id));
    //TODO: When working with DB this should trigger a save
  }

  const insertMidpoint = (index:number)=>{
    const newId = `mid-${Date.now()}`;
    const newWaypoint = {
      id: newId,
      name: '',
      coord: {lat: 0, lng: 0},
      isEditing: true
    }

    setLocations((prev)=>{
      const updated = [...prev];
      updated.splice(index + 1, 0, newWaypoint);
      return updated;
    })
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

  const formatDuration = (totalSeconds: number): string => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.round((totalSeconds % 3600) / 60);
    if (minutes === 60) return `${hours + 1}h 00m`;
    const paddedMins = minutes.toString().padStart(2, '0');
    return hours > 0 ? `${hours}h ${paddedMins}m` : `${minutes}m`;
  };

  return(
    <div className='LEFTBAR_MIDDLE_WRAPPER'>
      {locations && locations.length > 0 ? (
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={locations} strategy={verticalListSortingStrategy}>
            {locations.map((location, index) => (
              <React.Fragment key={location.id}>
                <SortableLocation 
                  location={location} 
                  onDelete={DeleteItem}
                  index={index} 
                />
                {index < locations.length - 1 && (
                  <div className='TRAVEL_CONNECTOR'>
                    <div className='CONNECTOR_LINE'/>
                    <div className='INTERIM_ASSESMENT'>
                      <div className='STATS_ROW'>
                        {routeData?.legs && routeData.legs[index] && !locations[index].isEditing && !locations[index+1].isEditing ? (
                          <span>
                            {formatDuration(routeData.legs[index].duration)} / {(routeData.legs[index].distance / 1609.34).toFixed(1)}mi
                          </span>
                        ) : (
                          <span className="STATS_LOADING">---</span>
                        )}
                        <button 
                          className='ADD_INTERIM_BTN'
                          title="Add Interim Assessment Point"
                          onClick={() => insertMidpoint(index)} 
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <div className="CONNECTOR_LINE" />
                  </div>
                )}
              </React.Fragment>
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
//TODO: Need to figure where to add notes (Maybe seperate screen)
//TODO: Right Click to go to google maps. 
//TODO: Need to make markers Draggable so we could move on fly