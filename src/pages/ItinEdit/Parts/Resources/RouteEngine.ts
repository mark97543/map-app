// src/pages/ItinEdit/Parts/Resources/RouteEngine.ts

// Pulling the token directly from your Vite environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

/**
 * Fetches driving data for an entire array of coordinates in ONE single API call.
 * Note: Mapbox Directions API accepts infinate coordinates
 */
export const fetchBatchDriveData = async (coordinates: {lat: number, lng: number}[]) => {
  if (!MAPBOX_TOKEN || coordinates.length < 2) return [];

  const MAX_POINTS = 25;
  let allLegs: any[] = [];

  // We loop through the coordinates in chunks
  for (let i = 0; i < coordinates.length - 1; i += (MAX_POINTS - 1)) {
    
    // Grab a slice of up to 25 points
    const chunk = coordinates.slice(i, i + MAX_POINTS);
    
    // If the chunk only has one point (can happen at the very end), skip it
    if (chunk.length < 2) break;

    const coordsString = chunk.map(c => `${c.lng},${c.lat}`).join(';');
    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?overview=false&access_token=${MAPBOX_TOKEN}`;

    try {
      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes[0]) {
        const legs = data.routes[0].legs.map((leg: any) => ({
          miles: leg.distance * 0.000621371,
          minutes: Math.round(leg.duration / 60)
        }));
        allLegs = [...allLegs, ...legs];
      }
    } catch (error) {
      console.error("Mapbox Chunk Error:", error);
    }
  }

  return allLegs;
};
/**
 * Adds a specific number of minutes to an "HH:MM" time string.
 */
export const addMinutes = (timeStr: string, minsToAdd: number): string => {
  if (!timeStr) return "--:--";
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  date.setMinutes(date.getMinutes() + minsToAdd);

  const newHours = String(date.getHours()).padStart(2, '0');
  const newMins = String(date.getMinutes()).padStart(2, '0');
  return `${newHours}:${newMins}`;
};