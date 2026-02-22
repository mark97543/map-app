export const getAllTrips = async () => {
  const DIRECTUS_URL = 'https://api.wade-usa.com';
  
  // 1. Get the string from Local Storage
  const authRaw = localStorage.getItem('directus_auth_data');
  let token = null;

  // 2. Parse the JSON to get the actual access_token
  if (authRaw) {
    try {
      const authData = JSON.parse(authRaw);
      token = authData.access_token; // Directus stores it here
    } catch (e) {
      console.error("Error parsing auth data:", e);
    }
  }

  const response = await fetch(
    `${DIRECTUS_URL}/items/trips?fields=id,title,trip_summary,total_distance,total_time,trip_rating,status,trip_id`,
    {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 3. Attach the token if we found it
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
    }
  );

  if (!response.ok) {
    if (response.status === 403) {
      console.error("🔒 403: Token found but permissions denied OR token expired.");
    }
    return null;
  }

  const { data } = await response.json();
  return data;
};