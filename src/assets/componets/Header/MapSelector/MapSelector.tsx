import './MapSelector.css'
import Dropdown from '../../DropDown/DropDown'
import { useDashboard } from '../../../../context/DashboardContext';
import { useState } from 'react';


function MapSelector(){
  const {map} =useDashboard();
  const [selection, setSelection]=useState('High Contrast')

  const mapStyles = [
    { 
      id: 'dark', 
      label: selection === 'Tactical Dark' ? '● Tactical Dark' : 'Tactical Dark', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/dark-v11');
        setSelection('Tactical Dark');
      }
    },
    {
      id:'light',
      label: selection === 'Light'? '● Light' : 'Light',
      action:()=>{
        map?.setStyle('mapbox://styles/mapbox/light-v11');
        setSelection('Light');
      }
    },
    { 
      id: 'sat', 
      label: selection === 'Satellite Streets'? '● Satellite Streets':'Satellite Streets', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/satellite-streets-v12');
        setSelection('Satellite Streets');
      }
    },
    {
      id:'sat2',
      label: selection === 'Satellite Clean'? '● Satellite Clean':'Satellite Clean', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/satellite-v9');
        setSelection('Satellite Clean');
      }
    },
    {
      id:'high',
      label: selection === 'High Contrast'? '● High Contrast':'High Contrast', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/navigation-night-v1');
        setSelection('High Contrast');
      }
    },
    {
      id:'out',
      label: selection === 'Outdoors'? '● Outdoors':'Outdoors', 
      action: () => {
        map?.setStyle('mapbox://styles/mapbox/outdoors-v12');
        setSelection('Outdoors');
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