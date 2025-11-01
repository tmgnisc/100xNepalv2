/**
 * API Service for Mobile App
 * Polls the backend JSON Server for new emergencies
 */

import { Emergency } from '../types/emergency';
import AsyncStorage from '@react-native-async-storage/async-storage';

// API Base URL - can be configured via environment or defaults
// For mobile app, use the same hostname/IP as the web app is running on
// IMPORTANT: Change this to your server's network IP address when testing on physical devices
// Example: If your web app is at http://10.142.67.208:8080, API is at http://10.142.67.208:3001/api
const getApiBaseUrl = (): string => {
  // Try to get from AsyncStorage (user configured)
  // Default to localhost for development, or set your network IP here:
  
  // Option 1: Use localhost (works for emulator or same device)
  // return 'http://localhost:3001/api';
  
  // Option 2: Use your network IP (for physical devices on same network)
  // Replace with your actual server IP:
  return 'http://10.142.67.208:3001/api'; // Your network IP - CHANGE THIS!
  
  // Option 3: Could load from AsyncStorage for runtime configuration
};

const API_ENDPOINTS = {
  emergencies: `${getApiBaseUrl()}/emergencies`,
};

class ApiService {
  private lastCheckedTimestamp: number = 0;
  private pollingInterval: NodeJS.Timeout | null = null;
  private isPolling: boolean = false;

  /**
   * Get API base URL (for configuration)
   */
  getApiBaseUrl(): string {
    return getApiBaseUrl();
  }

  /**
   * Set custom API base URL
   */
  setApiBaseUrl(url: string): void {
    // This can be extended to save to AsyncStorage
    console.log('API URL would be set to:', url);
  }

  /**
   * Fetch emergencies from backend API
   */
  async fetchEmergencies(): Promise<Emergency[]> {
    try {
      const response = await fetch(API_ENDPOINTS.emergencies, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        cache: 'no-store',
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const emergencies: Emergency[] = await response.json();
      return emergencies || [];
    } catch (error: any) {
      console.error('❌ Failed to fetch emergencies from API:', error?.message || error);
      // Return empty array on error
      return [];
    }
  }

  /**
   * Get new emergencies since last check
   */
  async getNewEmergencies(callback: (emergencies: Emergency[]) => void): Promise<void> {
    try {
      const allEmergencies = await this.fetchEmergencies();
      
      // Filter for new emergencies (status not Resolved/Complete/Treated)
      const activeEmergencies = allEmergencies.filter(
        (e) => !['Resolved', 'Complete', 'Treated'].includes(e.status)
      );

      // Check which ones are new by comparing with stored last checked timestamp
      const newEmergencies = activeEmergencies.filter((e) => {
        // Parse ID to get timestamp if possible, or use time field
        const emergencyTime = this.parseEmergencyTime(e);
        return emergencyTime > this.lastCheckedTimestamp;
      });

      if (newEmergencies.length > 0) {
        console.log(`📬 Found ${newEmergencies.length} new emergency(ies) from API`);
        this.lastCheckedTimestamp = Math.max(
          ...newEmergencies.map((e) => this.parseEmergencyTime(e))
        );
        
        // Store last checked timestamp
        await AsyncStorage.setItem('lastEmergencyCheck', this.lastCheckedTimestamp.toString());
        
        callback(newEmergencies);
      }
    } catch (error: any) {
      console.error('Error checking for new emergencies:', error?.message || error);
    }
  }

  /**
   * Parse emergency timestamp from ID or time field
   */
  private parseEmergencyTime(emergency: Emergency): number {
    // Try to extract timestamp from ID (format: E1234567890)
    const idMatch = emergency.id.match(/E(\d+)/);
    if (idMatch) {
      return parseInt(idMatch[1], 10);
    }
    
    // Fallback: use current time
    return Date.now();
  }

  /**
   * Start polling for new emergencies
   */
  startPolling(callback: (emergencies: Emergency[]) => void, intervalMs: number = 5000): void {
    if (this.isPolling) {
      console.log('⚠️ Already polling');
      return;
    }

    this.isPolling = true;
    console.log(`📡 Starting API polling (every ${intervalMs}ms)`);

    // Load last checked timestamp
    AsyncStorage.getItem('lastEmergencyCheck').then((stored) => {
      if (stored) {
        this.lastCheckedTimestamp = parseInt(stored, 10);
      }
    });

    // Poll immediately
    this.getNewEmergencies(callback);

    // Then poll at intervals
    this.pollingInterval = setInterval(() => {
      this.getNewEmergencies(callback);
    }, intervalMs);
  }

  /**
   * Stop polling
   */
  stopPolling(): void {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      this.pollingInterval = null;
    }
    this.isPolling = false;
    console.log('⏸️ Stopped API polling');
  }

  /**
   * Check if currently polling
   */
  isCurrentlyPolling(): boolean {
    return this.isPolling;
  }
}

export default new ApiService();

