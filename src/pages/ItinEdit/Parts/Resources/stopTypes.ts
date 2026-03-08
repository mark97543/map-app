import { 
  Fuel, 
  Utensils, 
  Hotel, 
  Camera, 
  MapPin, 
  Flag, 
  Coffee, 
  Binoculars,
  Milestone, // ✅ Perfect icon for a "Via" point
  type LucideIcon 
} from 'lucide-react';

export interface StopTypeConfig {
  label: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const STOP_TYPES: Record<string, StopTypeConfig> = {
  gas: {
    label: 'Gas',
    icon: Fuel,
    color: '#ff4d4d',
    bgColor: 'rgba(255, 77, 77, 0.15)',
  },
  food: {
    label: 'Food',
    icon: Utensils,
    color: '#ff9f43',
    bgColor: 'rgba(255, 159, 67, 0.15)',
  },
  hotel: {
    label: 'Hotel',
    icon: Hotel,
    color: '#54a0ff',
    bgColor: 'rgba(84, 160, 255, 0.15)',
  },
  attraction: {
    label: 'Attraction',
    icon: Camera,
    color: '#00d2d3',
    bgColor: 'rgba(0, 210, 211, 0.15)',
  },
  origin: {
    label: 'Origin',
    icon: MapPin,
    color: '#1dd1a1',
    bgColor: 'rgba(29, 209, 161, 0.15)',
  },
  destination: {
    label: 'Destination',
    icon: Flag,
    color: '#ee5253',
    bgColor: 'rgba(238, 82, 83, 0.15)',
  },
  rest: {
    label: 'Rest',
    icon: Coffee,
    color: '#feca57',
    bgColor: 'rgba(254, 202, 87, 0.15)',
  },
  overlook: {
    label: 'Overlook',
    icon: Binoculars,
    color: '#a29bfe',
    bgColor: 'rgba(162, 155, 254, 0.15)',
  },
  // 📍 NEW TYPE: WAYPOINT
  waypoint: {
    label: 'Waypoint',
    icon: Milestone,
    color: '#dfe6e9', // Subtle Grey/Silver
    bgColor: 'rgba(223, 230, 233, 0.15)',
  },
};

export const STOP_TYPES_ARRAY = Object.entries(STOP_TYPES).map(([key, value]) => ({
  id: key,
  ...value,
}));