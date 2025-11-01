/**
 * API Configuration and Base URL
 * 
 * This file contains the API configuration for connecting to the JSON Server backend.
 * Automatically detects hostname to work with mobile devices accessing via IP address.
 */

// Detect the current hostname (works for localhost and IP addresses)
const getApiBaseUrl = () => {
  // Use environment variable if set
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL;
  }
  
  // Detect hostname from current window location
  if (typeof window !== 'undefined') {
    const hostname = window.location.hostname;
    const protocol = window.location.protocol;
    // Use the same hostname but port 3001 for API
    // Note: JSON Server routes.json rewrites /api/* to /*, so we use /api prefix
    // But direct endpoints work without /api, so we provide both options
    return `${protocol}//${hostname}:3001/api`;
  }
  
  // Fallback to localhost
  return 'http://localhost:3001/api';
};

const API_BASE_URL = getApiBaseUrl();

// Log API URL for debugging (especially helpful for mobile access)
if (typeof window !== 'undefined') {
  console.log('API Base URL:', API_BASE_URL);
  console.log('Current hostname:', window.location.hostname);
}

export const API_ENDPOINTS = {
  emergencies: `${API_BASE_URL}/emergencies`,
  hospitals: `${API_BASE_URL}/hospitals`,
  volunteers: `${API_BASE_URL}/volunteers`,
  ambulances: `${API_BASE_URL}/ambulances`,
  sosAlert: `${API_BASE_URL}/sos-alert`, // Custom SOS alert endpoint
} as const;

/**
 * Get ESP8266 device URL for triggering SOS alerts
 * Configure via VITE_ESP8266_URL environment variable, or it will try to detect from current hostname
 */
export const getESP8266Url = (): string | null => {
  // Use environment variable if set
  if (import.meta.env.VITE_ESP8266_URL) {
    return import.meta.env.VITE_ESP8266_URL;
  }
  
  // If no ESP8266 URL is configured, return null (device won't be notified)
  // User should set VITE_ESP8266_URL in .env file with the ESP8266 IP address
  // Example: VITE_ESP8266_URL=http://192.168.1.100
  return null;
};

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
      cache: 'no-cache', // Prevent caching
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        ...options?.headers,
      },
    });

    // Log response for debugging
    console.log('API Response:', {
      url,
      status: response.status,
      statusText: response.statusText,
      method: options?.method || 'GET',
    });

    if (!response.ok && response.status !== 304) {
      const errorText = await response.text().catch(() => response.statusText);
      throw new Error(`API Error: ${response.status} ${errorText}`);
    }

    // Handle 304 Not Modified - return empty or cached data
    if (response.status === 304) {
      console.warn('Received 304 Not Modified. This might indicate a caching issue.');
      return {} as T;
    }

    // For POST/PUT/PATCH, return the created/updated object
    if (response.status === 201 || response.status === 200) {
      try {
        return await response.json();
      } catch (e) {
        // If response has no body (some POST requests), return the request data
        return {} as T;
      }
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

