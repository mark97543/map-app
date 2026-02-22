import React, { createContext, useContext, useState, type ReactNode } from 'react';
import { Map } from 'mapbox-gl';

export type StopType = 'stop' | 'gas' | 'hotel' | 'food' | 'shaping';

export interface Locations {
  id: string;
  name: string;
  coord: { lng: number; lat: number };
  isEditing?: boolean;
  isNew?: boolean;
  type: StopType;
  duration: number;
}

interface DashboardContextType {
  map: Map | null;
  setMap: (map: Map | null) => void;
  mapSelection: string;
  setMapSelection: (n: string) => void;
  mapCoords: { lng: number; lat: number };
  setMapCoords: (coords: { lng: number; lat: number }) => void;
  search: string;
  setSearch: (n: string) => void;
  locations: Locations[];
  setLocations: React.Dispatch<React.SetStateAction<Locations[]>>;
  routeData: any;
  setRouteData: React.Dispatch<React.SetStateAction<any>>;
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [map, setMap] = useState<Map | null>(null);
  const [mapSelection, setMapSelection] = useState('High Contrast');
  const [mapCoords, setMapCoords] = useState({ lng: -98.57, lat: 39.82 });
  const [search, setSearch] = useState('');
  const [routeData, setRouteData] = useState<any>(null);

  const [locations, setLocations] = useState<Locations[]>([
    { id: '1', name: 'Sector Alpha', coord: { lng: -73.9352, lat: 40.7306 }, type: 'stop', duration: 0 },
    { id: '2', name: 'Supply Depot', coord: { lng: -74.0060, lat: 40.7128 }, type: 'gas', duration: 15 }
  ]);

  return (
    <DashboardContext.Provider value={{
      map, setMap, mapSelection, setMapSelection, mapCoords, setMapCoords,
      search, setSearch, locations, setLocations, routeData, setRouteData
    }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) throw new Error("useDashboard must be used within DashboardProvider");
  return context;
};