import { 
  Fuel, 
  Utensils, 
  Hotel, 
  Camera, 
  MapPin, 
  Flag, 
  Coffee, 
  Binoculars,
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
    color: '#ff4d4d', // Red
    bgColor: 'rgba(255, 77, 77, 0.15)',
  },
  food: {
    label: 'Food',
    icon: Utensils,
    color: '#ff9f43', // Orange
    bgColor: 'rgba(255, 159, 67, 0.15)',
  },
  hotel: {
    label: 'Hotel',
    icon: Hotel,
    color: '#54a0ff', // Blue
    bgColor: 'rgba(84, 160, 255, 0.15)',
  },
  attraction: {
    label: 'Attraction',
    icon: Camera,
    color: '#00d2d3', // Teal
    bgColor: 'rgba(0, 210, 211, 0.15)',
  },
  origin: {
    label: 'Origin',
    icon: MapPin,
    color: '#1dd1a1', // Green
    bgColor: 'rgba(29, 209, 161, 0.15)',
  },
  destination: {
    label: 'Destination',
    icon: Flag,
    color: '#ee5253', // Soft Red/Pink
    bgColor: 'rgba(238, 82, 83, 0.15)',
  },
  rest: {
    label: 'Rest',
    icon: Coffee,
    color: '#feca57', // Yellow
    bgColor: 'rgba(254, 202, 87, 0.15)',
  },
  overlook: {
    label: 'Overlook',
    icon: Binoculars,
    color: '#a29bfe', // Purple
    bgColor: 'rgba(162, 155, 254, 0.15)',
  },
};

// Array version for mapping over in dropdowns/choices
export const STOP_TYPES_ARRAY = Object.entries(STOP_TYPES).map(([key, value]) => ({
  id: key,
  ...value,
}));