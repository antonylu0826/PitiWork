import type { KeycloakInstance } from 'keycloak-js';

/**
 * A helper function to make authenticated requests to an OData API.
 * It automatically handles token refreshes before making the call.
 *
 * @param keycloak The keycloak instance from `useKeycloak`.
 * @param url The full URL of the OData endpoint.
 * @param options Optional fetch options (e.g., method, body).
 * @returns A Promise that resolves to the Response object.
 */
export async function fetchOData(keycloak: KeycloakInstance, url: string, options: RequestInit = {}): Promise<Response> {
  try {
    // This will refresh the token if it's expired or about to expire in the next 70 seconds.
    // It returns true if the token was refreshed, false otherwise.
    const refreshed = await keycloak.updateToken(70);
    if (refreshed) {
      console.log('Keycloak token was refreshed');
    } else {
      console.log('Keycloak token is still valid');
    }
  } catch (error) {
    console.error('Failed to refresh Keycloak token:', error);
    // If token refresh fails, the user might need to log in again.
    // We throw an error to stop the API call.
    throw new Error('Authentication token could not be refreshed.');
  }

  // Create new headers or append to existing ones
  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${keycloak.token}`);

  const newOptions: RequestInit = {
    ...options,
    headers,
  };

  // Make the actual API call with the valid token
  return fetch(url, newOptions);
}

/**
 * Creates a new entity in the OData service.
 *
 * @param keycloak The keycloak instance.
 * @param baseUrl The base URL for the entity set (e.g., 'http://localhost:5003/api/odata/TestObject1').
 * @param data The data for the new entity.
 * @returns A Promise that resolves to the Response object.
 */
export function createOData(keycloak: KeycloakInstance, baseUrl: string, data: unknown): Promise<Response> {
  return fetchOData(keycloak, baseUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Updates an existing entity in the OData service.
 *
 * @param keycloak The keycloak instance.
 * @param baseUrl The base URL for the entity set.
 * @param oid The Oid of the entity to update.
 * @param data The updated data for the entity.
 * @returns A Promise that resolves to the Response object.
 */
export function updateOData(keycloak: KeycloakInstance, baseUrl: string, oid: string, data: unknown): Promise<Response> {
  const url = `${baseUrl}(${oid})`;
  return fetchOData(keycloak, url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
}

/**
 * Deletes an entity from the OData service.
 *
 * @param keycloak The keycloak instance.
 * @param baseUrl The base URL for the entity set.
 * @param oid The Oid of the entity to delete.
 * @returns A Promise that resolves to the Response object.
 */
export function deleteOData(keycloak: KeycloakInstance, baseUrl: string, oid: string): Promise<Response> {
  const url = `${baseUrl}(${oid})`;
  return fetchOData(keycloak, url, { method: 'DELETE' });
}