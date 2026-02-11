import { createDirectus, rest, authentication } from "@directus/sdk";

/**
 * SCHEMA DEFINITION (Clean Slate)
 */
interface Schema {
  // Add collections here as needed
}

// Custom wrapper to bridge window.localStorage to Directus SDK requirements
class LocalStorageWrapper {
  get() {
    const data = window.localStorage.getItem("directus_auth_data");
    return data ? JSON.parse(data) : null;
  }
  set(data: any) {
    if (data) {
      window.localStorage.setItem("directus_auth_data", JSON.stringify(data));
    } else {
      window.localStorage.removeItem("directus_auth_data");
    }
  }
}

const DIRECTUS_URL = 'https://api.wade-usa.com';

const client = createDirectus<Schema>(DIRECTUS_URL)
  .with(authentication('json', { 
    storage: new LocalStorageWrapper() // Use the wrapper here
  }))
  .with(rest());

export default client;