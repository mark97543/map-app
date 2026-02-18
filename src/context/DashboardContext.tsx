import { createContext, useContext, useState, type ReactNode } from 'react';
import { Map } from 'mapbox-gl';
//Define what datas lives in here 

interface DashboardContextType{
  map:Map | null;
  setMap:(map:Map | null)=>void;
  mapSelection:string;
  setMapSelection:(n:string)=>void;
}

//Create the actual context object
const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({children}:{children:ReactNode})=>{
  const [map, setMap] = useState<Map | null>(null);
  const [mapSelection, setMapSelection]=useState('High Contrast');

  return(
    <DashboardContext.Provider value={{
      map,
      setMap,
      mapSelection,
      setMapSelection
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