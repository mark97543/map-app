// src/pages/ItinEdit/Parts/Resources/RouteEngine.ts

// Pulling the token directly from your Vite environment variables
const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

/**
 * Fetches driving data for an entire array of coordinates in ONE single API call.
 * Note: Mapbox Directions API accepts up to 25 coordinates per request.
 */
export const fetchBatchDriveData = async (coordinates: {lat: number, lng: number}[]) => {
  if (!MAPBOX_TOKEN) {
    console.error("🚨 Mapbox token is missing! Check your .env file.");
    return [];
  }

  // We need at least 2 points to make a route
  if (coordinates.length < 2) return [];

  try {
    // Mapbox requires the format: lng,lat;lng,lat;lng,lat
    const coordsString = coordinates
      .map(c => `${c.lng},${c.lat}`)
      .join(';');

    const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordsString}?overview=false&access_token=${MAPBOX_TOKEN}`;
    
    const response = await fetch(url);
    const data = await response.json();

    if (data.routes && data.routes.length > 0) {
      // Mapbox returns "legs". Each leg is the journey between two waypoints.
      return data.routes[0].legs.map((leg: any) => ({
        miles: leg.distance * 0.000621371, // Convert meters to miles
        minutes: Math.round(leg.duration / 60) // Convert seconds to minutes
      }));
    }
    return [];
  } catch (error) {
    console.error("Mapbox API Error:", error);
    return [];
  }
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