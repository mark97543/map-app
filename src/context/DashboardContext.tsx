import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Map } from 'mapbox-gl';
//Define what datas lives in here 

export interface Locations {
  id:string;
  name:string;
  coord:{ lng: number; lat: number };
  isEditing?:boolean;
  isNew?:boolean;
}

interface DashboardContextType{
  map:Map | null;
  setMap:(map:Map | null)=>void;
  mapSelection:string;
  setMapSelection:(n:string)=>void;
  mapCoords: { lng: number; lat: number };
  setMapCoords: (coords: { lng: number; lat: number }) => void;
  search:string;
  setSearch:(n:string)=>void;
  locations:Locations[];
  setLocations:React.Dispatch<React.SetStateAction<Locations[]>>;
  routeData:any;
  setRouteData: React.Dispatch<React.SetStateAction<any>>;
}



//Create the actual context object
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({children}:{children:ReactNode})=>{
  const [map, setMap] = useState<Map | null>(null); //Map Item
  const [mapSelection, setMapSelection]=useState('High Contrast'); //Selection on which map to use
  const [mapCoords, setMapCoords] = useState({ lng: -98.57, lat: 39.82 }); //For the center of screen coord
  const [search, setSearch]=useState(''); //Search for the sidebar
  const [routeData, setRouteData]=useState<any>(null);
  //const [locations, setLocations] = useState<Locations[]>([]); //Locations we record

  //Dummy Locations
  const [locations, setLocations] = useState<Locations[]>([
    {
      id: '1',
      name: 'Sector Alpha - Command',
      coord: { lng: -73.935242, lat: 40.730610 }
    },
    {
      id: '2',
      name: 'Supply Depot Echo',
      coord: { lng: -74.0060, lat: 40.7128 }
    },
    {
      id: '3',
      name: 'Observation Post 4',
      coord: { lng: -73.9857, lat: 40.7484 }
    },
    {
      id: '4',
      name: 'LZ - Central Park',
      coord: { lng: -73.9654, lat: 40.7829 }
    },
    {
      id: '5',
      name: 'Checkpoint Hotel',
      coord: { lng: -73.9772, lat: 40.7527 }
    }
  ]);

  return(
    <DashboardContext.Provider value={{
      map,
      setMap,
      mapSelection,
      setMapSelection,
      mapCoords,
      setMapCoords,
      search,
      setSearch,
      locations,
      setLocations,
      routeData,
      setRouteData
    }}>
      {children}
    </DashboardContext.Provider>
  )
}

//The hook that the children use to grab
export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useMyData must be used within MyProvider");
  return context;
};