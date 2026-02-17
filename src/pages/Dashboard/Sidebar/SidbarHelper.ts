import mapboxgl from 'mapbox-gl';

/**
 * Teleports the map to a specific location and manages a search marker.
 * @param lng - Longitude
 * @param lat - Latitude
 * @param map - The Mapbox instance
 * @param currentCoords - State for current center (optional)
 * @param markerRef - A Ref to track and replace the existing search marker
 */
export const teleportTo = (
  lng: number, 
  lat: number, 
  map: mapboxgl.Map | null, 
  currentCoords: { lng: number, lat: number }, 
  markerRef: React.MutableRefObject<mapboxgl.Marker | null>
) => {
  // 1. Safety Check: If map isn't fully initialized, abort to prevent crashes
  if (!map || typeof map.getCanvasContainer !== 'function' || !map.getCanvasContainer()) {
    console.warn("Teleport failed: Map container not found or not ready.");
    return;
  }

  // 2. Coordinate Switcher (The "Google Maps" Fix)
  // If Lng is between -90 and 90 and Lat is outside that, user likely pasted Lat, Lng
  let finalLng = lng;
  let finalLat = lat;
  if (Math.abs(lng) <= 90 && Math.abs(lat) > 90) {
    [finalLng, finalLat] = [lat, lng];
  }

  // 3. Move the Map
  map.flyTo({
    center: [finalLng, finalLat],
    zoom: 14,
    essential: true,
    duration: 2000
  });

  // 4. Marker Management
  // Remove the previous search marker so we don't clutter the map
  if (markerRef.current) {
    markerRef.current.remove();
  }

  try {
    // Create new marker and store it in the ref
    const newMarker = new mapboxgl.Marker({ color: '#F2613F' }) // High contrast orange for search
      .setLngLat([finalLng, finalLat])
      .addTo(map);

    markerRef.current = newMarker;
  } catch (error) {
    console.error("Error adding marker to map:", error);
  }
};

/**
 * Validates if a string looks like "37.123, -113.123"
 */
export const isCoordString = (text: string): boolean => {
  const coordRegex = /^[-+]?\d+(\.\d+)?,\s*[-+]?\d+(\.\d+)?$/;
  return coordRegex.test(text.trim());
};

/**
 * Simple wrapper for Mapbox Geocoding API
 */
export const manualGeocode = async (query: string): Promise<[number, number] | null> => {
  const token = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json?access_token=${token}&limit=1`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.features && data.features.length > 0) {
      return data.features[0].center as [number, number];
    }
  } catch (e) {
    console.error("Geocoding failed", e);
  }
  return null;
};