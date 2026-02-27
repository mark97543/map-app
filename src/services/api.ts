const DIRECTUS_URL = 'https://api.wade-usa.com';

/**
 * Helper to grab the latest token from localStorage
 */
const getAuthToken = () => {
  const authRaw = localStorage.getItem('directus_auth_data');
  if (authRaw) {
    try {
      const authData = JSON.parse(authRaw);
      return authData.access_token;
    } catch (e) {
      console.error("Error parsing auth data:", e);
    }
  }
  return null;
};

/**
 * Helper for common headers
 */
const getHeaders = (token: string | null) => ({
  'Content-Type': 'application/json',
  ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
});

export const getAllTrips = async () => {
  const token = getAuthToken();
  const t = new Date().getTime(); // Cache buster
  
  const response = await fetch(
    `${DIRECTUS_URL}/items/trips?fields=id,title,trip_summary,total_distance,total_time,trip_rating,status,trip_id,start_date,total_budget&t=${t}`,
    {
      method: 'GET',
      headers: getHeaders(token),
    }
  );

  if (!response.ok) {
    if (response.status === 403) console.error("🔒 403: Forbidden or Expired Token");
    return null;
  }

  const { data } = await response.json();
  return data;
};

export const getTripById = async (tripId: string) => {
  const token = getAuthToken();
  const t = new Date().getTime(); // Cache buster to bypass CORS/Caching issues
  
  // Use the timestamp as a query param instead of Cache-Control header
  const url = `${DIRECTUS_URL}/items/trips?filter[trip_id][_eq]=${tripId}&fields=*,stops.*&t=${t}`;
  
  const response = await fetch(url, {
    method: 'GET',
    headers: getHeaders(token),
  });

  if (!response.ok) return null;

  const { data } = await response.json();
  return data[0] || null;
};

export const updateTrip = async (id: number, updatedFields: object) => {
  const token = getAuthToken();

  const response = await fetch(`${DIRECTUS_URL}/items/trips/${id}`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(updatedFields),
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Update failed:", errorData);
    return null;
  }

  const { data } = await response.json();
  return data;
};

export const createTrip = async (newTripData: object) => {
  const token = getAuthToken();

  const response = await fetch(`${DIRECTUS_URL}/items/trips`, {
    method: 'POST',
    headers: getHeaders(token),
    body: JSON.stringify(newTripData),
  });

  if (!response.ok) return null;

  const { data } = await response.json();
  return data;
};