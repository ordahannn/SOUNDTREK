import { useState, useEffect } from 'react';
import { getToken } from '../../../../services/sessionService';
import { getUser } from "@/services/sessionService";


/**
    Fetches data from the API using GET.

    @param endpoint - The API endpoint (URL)
    @returns Promise<any>
 */
export async function fetchDataUser<T = any>(endpoint: string): Promise<T> {
  try {
    const token = await getToken();
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to fetch data');
    }

    return await response.json() as T;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

/**
    Sends data to the API (for POST, PUT, DELETE).

    @param endpoint - The API endpoint (URL)
    @param data - Data to send (object)
    @param method - HTTP method ('POST' | 'PUT' | 'DELETE')
    @returns Promise<any>
 */
export async function sendDataUser<T = any>(
  endpoint: string,
  data: object,
  method: 'POST' | 'PUT' | 'DELETE' = 'POST'
): Promise<T> {
  try {
    const token = await getToken();

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
      },
      
      body: JSON.stringify(data),
    });

    const contentType = response.headers.get('content-type');
    let responseBody: any;

    if (contentType && contentType.indexOf('application/json') !== -1) {
      responseBody = await response.json();
    } else {
      responseBody = await response.text();
    }

    if (!response.ok) {
      throw new Error(
        (responseBody && responseBody.message) ||
        responseBody || // In case it's a plain string
        'Failed to send data'
      );
    }

    return responseBody as T;
  } catch (error) {
    console.error('Error sending data:', error);
    throw error;
  }
}

export function useUserId() {
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const user = await getUser();

      setUserId(user?.userId ?? null);
    })();
  }, []);

  return userId;
}