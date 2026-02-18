import { createDirectus, rest, authentication } from "@directus/sdk";

interface Schema {
  // Add collections here as needed
}

const DIRECTUS_URL = 'https://api.wade-usa.com';

/**
 * CUSTOM FETCH WRAPPER
 * This forces the browser to ignore cookies, killing the "Mark" ghost.
 */
const customFetch = (url: string | URL | Request, options?: RequestInit) => {
  return fetch(url, {
    ...options,
    credentials: 'omit', // Forces the browser to ignore cookies
  });
};

const client = createDirectus<Schema>(DIRECTUS_URL, {
  globals: {
    fetch: customFetch, // Injecting our clean fetcher here
  },
})
  .with(authentication('json', { 
    storage: {
      get: () => {
        const data = window.localStorage.getItem("directus_auth_data");
        return data ? JSON.parse(data) : null;
      },
      set: (value) => {
        if (value) {
          window.localStorage.setItem("directus_auth_data", JSON.stringify(value));
        } else {
          window.localStorage.removeItem("directus_auth_data");
        }
      }
    }
  }))
  .with(rest());

export default client;