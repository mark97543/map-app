import './MapSelector.css'
import Dropdown from '../../DropDown/DropDown'
import { useDashboard } from '../../../../context/DashboardContext';
import { useState } from 'react';


function MapSelector(){
  const {map, mapSelection, setMapSelection} =useDashboard();
  //const [selection, setSelection]=useState('High Contrast')

  const mapStyles = [
    { 
      id: 'dark', 
      label: mapSelection === 'Tactical Dark' ? '● Tactical Dark' : 'Tactical Dark', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/dark-v11');
        map?.easeTo({
          pitch:0,
          bearing:0,
          duration:1000,
        })
        setMapSelection('Tactical Dark');
      }
    },
    {
      id:'light',
      label: mapSelection === 'Light'? '● Light' : 'Light',
      action:()=>{
        map?.setStyle('mapbox://styles/mapbox/light-v11');
        map?.easeTo({
          pitch:0,
          bearing:0,
          duration:1000,
        })
        setMapSelection('Light');
      }
    },
    { 
      id: 'sat', 
      label: mapSelection === 'Satellite Streets'? '● Satellite Streets':'Satellite Streets', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
        map?.easeTo({
          pitch:0,
          bearing:0,
          duration:1000,
        })
        setMapSelection('Satellite Streets');
      }
    },
    {
      id:'sat2',
      label: mapSelection === 'Satellite Clean'? '● Satellite Clean':'Satellite Clean', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/satellite-v9');
        map?.easeTo({
          pitch:0,
          bearing:0,
          duration:1000,
        })
        setMapSelection('Satellite Clean');
      }
    },
    {
      id:'high',
      label: mapSelection === 'High Contrast'? '● High Contrast':'High Contrast', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/navigation-night-v1');
        map?.easeTo({
          pitch:0,
          bearing:0,
          duration:1000,
        })
        setMapSelection('High Contrast');
      }
    },
    {
      id:'out',
      label: mapSelection === 'Outdoors'? '● Outdoors':'Outdoors', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/outdoors-v12');
        map?.easeTo({
          pitch:45,
          bearing:0,
          duration:1000,
        })
        setMapSelection('Outdoors');
      }
    }
  ];


  return(
    <div>
      <Dropdown title="Map Layers" items={mapStyles} />
    </div>
  )
}

export default MapSelector