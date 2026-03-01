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

export const updateStopsBatch = async (payload: { id: number | string, sort: number }[]) => {
  const token = getAuthToken();

  // Directus Batch Update: PATCH to the collection root with an array
  const response = await fetch(`${DIRECTUS_URL}/items/stops`, {
    method: 'PATCH',
    headers: getHeaders(token),
    body: JSON.stringify(payload), // Send the array of {id, sort}
  });

  if (!response.ok) {
    const errorData = await response.json();
    console.error("Batch update failed:", errorData);
    throw new Error("Failed to update stops order");
  }

  const { data } = await response.json();
  return data;
};

/**
 * Deletes a single stop by ID from the database.
 */
export const deleteStopFromDB = async (stopId: string | number) => {
  const token = getAuthToken(); // 1. Grab the token

  try {
    const response = await fetch(`${DIRECTUS_URL}/items/stops/${stopId}`, {
      method: 'DELETE',
      headers: getHeaders(token), // 2. Attach the token using your helper!
    });

    if (!response.ok) {
      // Try to parse the Directus error message if available
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to delete stop: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error("❌ API Error deleting stop:", error);
    throw error;
  }
};

/**
 * Creates a new blank stop in the database.
 */
export const createStopInDB = async (newStopData: object) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${DIRECTUS_URL}/items/stops`, {
      method: 'POST',
      headers: getHeaders(token),
      body: JSON.stringify(newStopData),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to create stop: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const { data } = await response.json();
    return data; // Returns the newly created stop with its official Database ID
  } catch (error) {
    console.error("❌ API Error creating stop:", error);
    throw error;
  }
};

/**
 * Deletes an entire trip from the database.
 */
export const deleteTripFromDB = async (tripId: number | string) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${DIRECTUS_URL}/items/trips/${tripId}`, {
      method: 'DELETE',
      headers: getHeaders(token),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to delete trip: ${response.status} ${JSON.stringify(errorData)}`);
    }

    return true;
  } catch (error) {
    console.error("❌ API Error deleting trip:", error);
    throw error;
  }
};

/**
 * Updates a single stop by ID in the database.
 */
export const updateStopInDB = async (stopId: string | number, updates: object) => {
  const token = getAuthToken();

  try {
    const response = await fetch(`${DIRECTUS_URL}/items/stops/${stopId}`, {
      method: 'PATCH',
      headers: getHeaders(token),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Failed to update stop: ${response.status} ${JSON.stringify(errorData)}`);
    }

    const { data } = await response.json();
    return data;
  } catch (error) {
    console.error("❌ API Error updating stop:", error);
    throw error;
  }
};
