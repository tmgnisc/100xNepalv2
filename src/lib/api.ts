/**
 * API Configuration and Base URL
 * 
 * This file contains the API configuration for connecting to the JSON Server backend.
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export const API_ENDPOINTS = {
  emergencies: `${API_BASE_URL}/emergencies`,
  hospitals: `${API_BASE_URL}/hospitals`,
  volunteers: `${API_BASE_URL}/volunteers`,
  ambulances: `${API_BASE_URL}/ambulances`,
} as const;

/**
 * Helper function to build URL with query parameters
 */
export function buildUrl(endpoint: string, params?: Record<string, string | number>): string {
  const url = new URL(endpoint);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.append(key, String(value));
    });
  }
  return url.toString();
}

/**
 * Fetch wrapper with error handling
 */
export async function apiRequest<T>(
  url: string,
  options?: RequestInit
): Promise<T> {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

export default {
  API_BASE_URL,
  API_ENDPOINTS,
  buildUrl,
  apiRequest,
};

