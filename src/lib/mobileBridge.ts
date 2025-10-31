/**
 * Mobile App Bridge Utility
 * Handles communication with React Native mobile app
 */

import { Emergency } from "@/types/emergency";

/**
 * Check if Web Bluetooth API is available
 */
export function isWebBluetoothAvailable(): boolean {
  return 'bluetooth' in navigator && 'requestDevice' in navigator.bluetooth;
}

/**
 * Try to broadcast SOS alert via Web Bluetooth (if available)
 * This works in Chrome/Edge on Android/ChromeOS, limited iOS support
 */
export async function broadcastViaWebBluetooth(emergency: Emergency): Promise<boolean> {
  if (!isWebBluetoothAvailable()) {
    console.log('Web Bluetooth API not available');
    return false;
  }

  try {
    // Request Bluetooth device with our custom service UUID
    const device = await navigator.bluetooth.requestDevice({
      filters: [
        { services: ['0000180D-0000-1000-8000-00805F9B34FB'] }, // Health Service UUID
      ],
      optionalServices: ['0000180D-0000-1000-8000-00805F9B34FB'],
    });

    console.log('Bluetooth device selected:', device.name);

    // Connect to device
    const server = await device.gatt!.connect();
    const service = await server.getPrimaryService('0000180D-0000-1000-8000-00805F9B34FB');
    const characteristic = await service.getCharacteristic('00002A37-0000-1000-8000-00805F9B34FB');

    // Send emergency data (limited size)
    const emergencyData = JSON.stringify({
      id: emergency.id,
      type: emergency.type,
      name: emergency.name.substring(0, 10), // Limit size
    });

    // Write to characteristic
    const encoder = new TextEncoder();
    await characteristic.writeValue(encoder.encode(emergencyData));

    console.log('✅ Emergency broadcasted via Web Bluetooth');
    return true;
  } catch (error) {
    console.warn('Web Bluetooth broadcast failed:', error);
    return false;
  }
}

/**
 * Try to open mobile app via deep link
 */
export function openMobileAppViaDeepLink(emergency: Emergency): void {
  try {
    // Deep link scheme (configure in mobile app)
    const params = new URLSearchParams({
      action: 'sos',
      id: emergency.id,
      name: emergency.name,
      type: emergency.type,
      location: emergency.location,
      wardNo: emergency.wardNo,
      phone: emergency.phone || '',
      time: emergency.time,
    });

    const deepLink = `aarogyaconnect://sos?${params.toString()}`;
    
    // Try to open app
    window.location.href = deepLink;
    
    // Fallback: If app not installed, redirect after short delay
    setTimeout(() => {
      // Could redirect to Play Store / App Store
      console.log('Mobile app not found, would redirect to app store');
    }, 500);
  } catch (error) {
    console.error('Deep link failed:', error);
  }
}

/**
 * Try to broadcast SOS via available methods
 * 1. Web Bluetooth (if available)
 * 2. Deep link to mobile app
 */
export async function broadcastSOSAlert(emergency: Emergency): Promise<void> {
  // Try Web Bluetooth first (if browser supports it)
  const bluetoothSuccess = await broadcastViaWebBluetooth(emergency);
  
  if (!bluetoothSuccess) {
    // Fallback to deep link
    openMobileAppViaDeepLink(emergency);
  }
}

/**
 * Check if running in mobile app context (React Native WebView)
 */
export function isInMobileApp(): boolean {
  // Check for React Native WebView user agent or custom header
  return (
    window.ReactNativeWebView !== undefined ||
    navigator.userAgent.includes('AarogyaConnect')
  );
}

/**
 * Send message to mobile app if running in WebView
 */
export function sendToMobileApp(message: any): void {
  if (window.ReactNativeWebView) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
    console.log('✅ Message sent to mobile app');
  } else {
    console.log('Not running in mobile app context');
  }
}

// Extend Window interface for TypeScript
declare global {
  interface Window {
    ReactNativeWebView?: {
      postMessage: (data: string) => void;
    };
  }
}

