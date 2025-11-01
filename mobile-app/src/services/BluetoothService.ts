import BleManager from 'react-native-ble-manager';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, request, PERMISSIONS, RESULTS, Platform, openSettings } from 'react-native-permissions';
import { Emergency } from '../types/emergency';

// UUID for our SOS alert service
const SOS_SERVICE_UUID = '12345678-1234-1234-1234-123456789ABC';
const SOS_CHARACTERISTIC_UUID = '12345678-1234-1234-1234-123456789ABD';

// Base64 decode helper (atob polyfill for React Native)
function decodeBase64(str: string): string {
  try {
    // Try native atob first (might be available in some RN versions)
    if (typeof atob !== 'undefined') {
      return atob(str);
    }
    
    // Manual base64 decode for React Native
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';
    let output = '';
    let i = 0;
    
    str = str.replace(/[^A-Za-z0-9\+\/\=]/g, '');
    
    while (i < str.length) {
      const enc1 = chars.indexOf(str.charAt(i++));
      const enc2 = chars.indexOf(str.charAt(i++));
      const enc3 = chars.indexOf(str.charAt(i++));
      const enc4 = chars.indexOf(str.charAt(i++));
      
      if (enc1 === -1 || enc2 === -1 || enc3 === -1 || enc4 === -1) {
        break;
      }
      
      const bits = (enc1 << 18) | (enc2 << 12) | (enc3 << 6) | enc4;
      
      output += String.fromCharCode((bits >> 16) & 255);
      if (enc3 !== 64) output += String.fromCharCode((bits >> 8) & 255);
      if (enc4 !== 64) output += String.fromCharCode(bits & 255);
    }
    
    return output;
  } catch (error) {
    console.error('Base64 decode error:', error);
    return '';
  }
}

class BluetoothService {
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;
  private connectedDevices: string[] = [];
  private receivedAlerts: Emergency[] = [];
  private scanListener: any = null;
  private currentSOSAlert: Emergency | null = null; // Store current active SOS alert
  private connectionListener: any = null;

  async checkPermissions(): Promise<boolean> {
    try {
      // Safety check for Platform
      if (!Platform || !Platform.OS) {
        console.warn('⚠️ Platform not available');
        return false;
      }
      
      if (Platform.OS === 'android') {
        // Android 12+ (API 31+) requires BLUETOOTH_SCAN and BLUETOOTH_CONNECT
        if (Platform.Version >= 31) {
          const scanResult = await check(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
          const connectResult = await check(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
          const locationResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
          
          if (scanResult !== RESULTS.GRANTED) {
            const scanRequest = await request(PERMISSIONS.ANDROID.BLUETOOTH_SCAN);
            if (scanRequest !== RESULTS.GRANTED) {
              console.warn('⚠️ BLUETOOTH_SCAN permission denied');
              return false;
            }
          }
          
          if (connectResult !== RESULTS.GRANTED) {
            const connectRequest = await request(PERMISSIONS.ANDROID.BLUETOOTH_CONNECT);
            if (connectRequest !== RESULTS.GRANTED) {
              console.warn('⚠️ BLUETOOTH_CONNECT permission denied');
              return false;
            }
          }
          
          // Location still recommended for BLE scanning
          if (locationResult !== RESULTS.GRANTED) {
            const locationRequest = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            // Location is nice-to-have, don't block if denied
            console.warn('⚠️ Location permission not granted (may affect scanning)');
          }
        } else {
          // Android < 12 - Location is required for BLE scanning
          const locationResult = await check(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
          if (locationResult !== RESULTS.GRANTED) {
            const locationRequest = await request(PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION);
            if (locationRequest !== RESULTS.GRANTED) {
              console.warn('⚠️ Location permission required for Bluetooth scanning');
              return false;
            }
          }
        }
      }
      
      return true;
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      return false;
    }
  }

  async initialize(): Promise<boolean> {
    try {
      // Initialize push notifications first (doesn't require Bluetooth)
      // Note: Disable requestPermissions to avoid Firebase requirement
      try {
        if (PushNotification && typeof PushNotification.configure === 'function') {
          PushNotification.configure({
            onRegister: function (token) {
              console.log('Push token:', token);
            },
            onNotification: function (notification) {
              console.log('Notification:', notification);
            },
            permissions: {
              alert: true,
              badge: true,
              sound: true,
            },
            popInitialNotification: true,
            requestPermissions: false, // Changed to false - we'll handle permissions manually
          });
          console.log('✅ Push notifications configured');
        }
      } catch (error: any) {
        console.warn('⚠️ Push notification setup failed (non-critical):', error?.message || error);
      }

      // Request permissions first
      let hasPermissions = false;
      try {
        hasPermissions = await this.checkPermissions();
      } catch (permError: any) {
        console.warn('⚠️ Permission check failed:', permError?.message || permError);
      }

      if (!hasPermissions) {
        console.warn('⚠️ Bluetooth permissions not granted - app can still run');
        return true; // App can run without Bluetooth initially
      }

      // Initialize Bluetooth (non-blocking - won't crash if fails)
      try {
        if (BleManager && typeof BleManager.start === 'function') {
          await BleManager.start({ showAlert: false });
          console.log('✅ Bluetooth initialized');
          return true;
        } else {
          console.warn('⚠️ BleManager not available');
          return true; // App can run without Bluetooth
        }
      } catch (error: any) {
        console.error('❌ BleManager.start failed:', error?.message || error);
        return true; // App can still run
      }
      
    } catch (error: any) {
      console.error('❌ Bluetooth initialization failed:', error?.message || error);
      // Don't throw - let app continue without Bluetooth
      return true; // Changed from false to true - app should still work
    }
  }

  // Broadcast SOS alert to nearby devices via BLE
  async broadcastSOSAlert(emergency: Emergency): Promise<void> {
    try {
      console.log('📢 Broadcasting SOS Alert via Bluetooth:', emergency.id);
      
      // Store in local storage
      await AsyncStorage.setItem(`sos_${emergency.id}`, JSON.stringify(emergency));
      
      // Store current SOS alert so it can be shared when devices connect
      this.currentSOSAlert = emergency;
      
      // Make sure Bluetooth is initialized
      try {
        if (BleManager && typeof BleManager.start === 'function') {
          await BleManager.start({ showAlert: false });
        }
      } catch (initError) {
        console.warn('⚠️ Bluetooth already initialized or failed:', initError);
      }
      
      // Start scanning - this makes our device discoverable to others
      // When other devices discover us, they can connect and request the SOS data
      if (!this.isScanning) {
        try {
          await this.startScanning();
          console.log('✅ Started scanning - device is now discoverable');
        } catch (scanError: any) {
          console.warn('⚠️ Could not start scanning for broadcasting:', scanError?.message || scanError);
          // Still continue - the alert is stored and can be shared via other means
        }
      }
      
      // Set up connection listener so when other devices connect, we can share SOS data
      this.setupConnectionListener();
      
      console.log('✅ SOS alert ready for Bluetooth broadcasting');
      console.log('📡 Nearby devices can now discover and receive this alert');
      
    } catch (error: any) {
      console.error('❌ Failed to broadcast SOS:', error?.message || error);
    }
  }
  
  // Set up listener for when other devices connect to us
  private setupConnectionListener(): void {
    if (this.connectionListener) {
      return; // Already set up
    }
    
    try {
      this.connectionListener = BleManager.addListener('BleManagerConnectPeripheral', async (peripheral: any) => {
        try {
          console.log('📱 Device connected to us:', peripheral.id);
          
          // If we have an active SOS alert, share it
          if (this.currentSOSAlert) {
            await this.shareSOSWithConnectedDevice(peripheral.id, this.currentSOSAlert);
          }
        } catch (error) {
          console.error('Error handling incoming connection:', error);
        }
      });
    } catch (error) {
      console.warn('Could not set up connection listener:', error);
    }
  }
  
  // Share SOS alert with a connected device
  private async shareSOSWithConnectedDevice(deviceId: string, emergency: Emergency): Promise<void> {
    try {
      console.log('📤 Sharing SOS alert with device:', deviceId);
      
      // Wait for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Discover services on the connected device
      const services = await BleManager.retrieveServices(deviceId);
      
      // Check if the connected device has our SOS service (it should, if it's listening)
      if (services.characteristics) {
        for (const service of services.characteristics) {
          if (service.service === SOS_SERVICE_UUID) {
            // Found our service - try to write SOS data to characteristic
            for (const characteristic of service.characteristics) {
              if (characteristic.characteristic === SOS_CHARACTERISTIC_UUID) {
                // Write the emergency data as bytes (JSON string converted to byte array)
                const emergencyJson = JSON.stringify(emergency);
                const bytes: number[] = [];
                
                // Convert string to byte array (React Native doesn't have Buffer)
                for (let i = 0; i < emergencyJson.length; i++) {
                  bytes.push(emergencyJson.charCodeAt(i));
                }
                
                try {
                  // Write the SOS data to the characteristic
                  await BleManager.write(
                    deviceId,
                    SOS_SERVICE_UUID,
                    SOS_CHARACTERISTIC_UUID,
                    bytes
                  );
                  
                  console.log('✅ SOS alert shared with device:', deviceId);
                } catch (writeError) {
                  console.warn('⚠️ Could not write SOS data (device may need to read instead):', writeError);
                  // This is okay - the receiving device will read it via checkDeviceForSOS
                }
                break;
              }
            }
          }
        }
      }
    } catch (error: any) {
      console.warn('⚠️ Error sharing SOS with connected device:', error?.message || error);
    }
  }

  // Enable Bluetooth programmatically
  async enableBluetooth(): Promise<boolean> {
    try {
      if (!BleManager) {
        throw new Error('Bluetooth module not available');
      }

      const state = await BleManager.checkState();
      
      if (state === 'on') {
        console.log('✅ Bluetooth is already enabled');
        return true;
      }

      // Try to enable Bluetooth
      // Note: This requires BLUETOOTH_CONNECT permission on Android 12+
      console.log('🔵 Attempting to enable Bluetooth...');
      
      // On Android, we need to show system dialog to enable Bluetooth
      // BleManager doesn't have direct enable(), so we use checkState to trigger dialog
      // or we'll need to guide user to enable manually
      
      if (state === 'off') {
        // Cannot enable programmatically on most Android versions
        // We'll return false and let UI handle showing system dialog
        console.warn('⚠️ Bluetooth is off. Please enable Bluetooth in Settings.');
        return false;
      }

      return state === 'on';
    } catch (error: any) {
      console.error('❌ Error checking/enabling Bluetooth:', error?.message || error);
      return false;
    }
  }

  // Start scanning for nearby SOS alerts
  async startScanning(): Promise<void> {
    if (this.isScanning) {
      console.log('⚠️ Already scanning');
      return;
    }

    try {
      // Check if BleManager is available
      if (!BleManager || typeof BleManager.scan !== 'function') {
        throw new Error('Bluetooth module not available. Please check installation.');
      }

      // Step 1: Request permissions first (automatically)
      console.log('🔐 Requesting Bluetooth permissions...');
      let hasPermissions = false;
      try {
        hasPermissions = await this.checkPermissions();
        if (!hasPermissions) {
          // Try requesting again more aggressively
          console.log('🔄 Retrying permission request...');
          hasPermissions = await this.checkPermissions();
        }
      } catch (permError: any) {
        console.warn('Permission check error:', permError?.message || permError);
        // Try once more
        try {
          hasPermissions = await this.checkPermissions();
        } catch (retryError) {
          console.error('Permission request failed after retry:', retryError);
        }
      }

      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted. Please grant permissions in Settings.');
      }

      console.log('✅ Permissions granted');

      // Step 2: Check and enable Bluetooth
      console.log('🔵 Checking Bluetooth state...');
      try {
        const state = await BleManager.checkState();
        console.log('📊 Bluetooth state:', state);
        
        if (state !== 'on') {
          // Try to guide user to enable
          const enabled = await this.enableBluetooth();
          if (!enabled) {
            throw new Error('Bluetooth is not enabled. Please enable Bluetooth in Settings and try again.');
          }
        }
        console.log('✅ Bluetooth is enabled');
      } catch (error: any) {
        if (error?.message?.includes('not enabled') || error?.message?.includes('Bluetooth')) {
          throw error;
        }
        // If checkState fails, continue anyway
        console.warn('⚠️ Could not check Bluetooth state, continuing...');
      }

      this.isScanning = true;
      console.log('🔍 Starting scan for SOS alerts...');

      // Start continuous scanning (makes device discoverable and finds other devices)
      // Scan indefinitely until stopped (use longer duration for continuous scanning)
      await BleManager.scan([], 0, true); // Scan for all devices, indefinitely
      console.log('✅ Continuous scan started - device is discoverable');

      // Listen for discovered devices
      try {
        this.scanListener = BleManager.addListener('BleManagerDiscoverPeripheral', (peripheral: any) => {
          try {
            const deviceName = peripheral?.name || peripheral?.id || 'Unknown Device';
            console.log('📡 Discovered device:', deviceName, 'RSSI:', peripheral?.rssi);
            
            // Store discovered device for UI
            this.discoveredDevices.set(peripheral.id, {
              id: peripheral.id,
              name: deviceName,
              rssi: peripheral.rssi || 0,
              advertising: peripheral.advertising,
              timestamp: Date.now(),
            });
            
            // Check if device is advertising our SOS service OR if we have an active SOS alert
            // If device is advertising SOS service, connect and read
            // Also, if we're scanning and discover a device, try to connect and see if they have SOS data
            if (peripheral?.advertising?.serviceUUIDs?.includes(SOS_SERVICE_UUID)) {
              console.log('🚨 Found device advertising SOS service:', peripheral.id);
              this.handleSOSDevice(peripheral);
            } else {
              // Even if not explicitly advertising, try to connect and check for SOS data
              // This handles the case where Device A triggered SOS and Device B is scanning
              setTimeout(async () => {
                try {
                  await this.checkDeviceForSOS(peripheral);
                } catch (err) {
                  // Silently fail - not all devices will have SOS data
                }
              }, 2000); // Wait a bit before checking
            }
          } catch (error) {
            console.error('Error handling peripheral:', error);
          }
        });
      } catch (listenerError) {
        console.warn('Could not add scan listener:', listenerError);
      }

      // Also check for shared alerts periodically (fallback mechanism)
      this.startSharedAlertsPolling();

    } catch (error: any) {
      console.error('❌ Scan failed:', error?.message || error);
      this.isScanning = false;
      throw error; // Re-throw so UI can show error
    }
  }

  private startSharedAlertsPolling(): void {
    // Poll for shared alerts every 10 seconds
    // This is a fallback mechanism for when BLE direct communication isn't available
    setInterval(async () => {
      try {
        await this.checkForSharedAlerts();
      } catch (error) {
        console.error('Error in shared alerts polling:', error);
      }
    }, 10000);
  }

  // Check if a discovered device has SOS data (without explicit advertising)
  private async checkDeviceForSOS(peripheral: any): Promise<void> {
    try {
      // Don't check the same device multiple times
      if (this.connectedDevices.includes(peripheral.id)) {
        return;
      }
      
      console.log('🔍 Checking device for SOS data:', peripheral.id);
      
      // Try to connect
      await BleManager.connect(peripheral.id);
      this.connectedDevices.push(peripheral.id);
      
      // Wait for connection
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Discover services
      const services = await BleManager.retrieveServices(peripheral.id);
      
      // Check for SOS service
      if (services.characteristics) {
        for (const service of services.characteristics) {
          if (service.service === SOS_SERVICE_UUID) {
            console.log('✅ Found SOS service on device:', peripheral.id);
            // This device has our SOS service - try to read data
            await this.handleSOSDevice(peripheral);
            return;
          }
        }
      }
      
      // No SOS service found, disconnect
      await BleManager.disconnect(peripheral.id);
      this.connectedDevices = this.connectedDevices.filter(id => id !== peripheral.id);
      
    } catch (error: any) {
      console.warn('⚠️ Error checking device for SOS:', error?.message || error);
      try {
        await BleManager.disconnect(peripheral.id);
        this.connectedDevices = this.connectedDevices.filter(id => id !== peripheral.id);
      } catch (disconnectError) {
        // Ignore
      }
    }
  }

  private async handleSOSDevice(peripheral: any): Promise<void> {
    try {
      console.log('📱 Connecting to SOS device:', peripheral.id);
      
      // Connect to device
      await BleManager.connect(peripheral.id);
      console.log('✅ Connected to SOS device');

      // Wait a moment for connection to stabilize
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Discover services
      const services = await BleManager.retrieveServices(peripheral.id);
      console.log('📋 Services discovered:', services);

      // Try to read emergency data from characteristic
      if (services.characteristics) {
        for (const service of services.characteristics) {
          if (service.service === SOS_SERVICE_UUID) {
            for (const characteristic of service.characteristics) {
              if (characteristic.characteristic === SOS_CHARACTERISTIC_UUID) {
                try {
                  const data = await BleManager.read(
                    peripheral.id,
                    SOS_SERVICE_UUID,
                    SOS_CHARACTERISTIC_UUID
                  );
                  
                  // Parse emergency data (convert base64 to string)
                  // React Native doesn't have atob, so we'll decode manually
                  let emergencyStr: string;
                  let emergency: Emergency;
                  try {
                    if (typeof data === 'string') {
                      // Simple base64 decode for React Native
                      emergencyStr = decodeBase64(data);
                    } else if (data instanceof Array || Array.isArray(data)) {
                      emergencyStr = String.fromCharCode.apply(null, Array.from(data));
                    } else {
                      emergencyStr = String(data);
                    }
                    emergency = JSON.parse(emergencyStr);
                  } catch (parseError) {
                    console.error('Error parsing emergency data:', parseError);
                    throw parseError;
                  }
                
                  // Receive and display alert
                  await this.receiveSOSAlert(emergency);
                  console.log('✅ SOS alert received via BLE');
                } catch (readError) {
                  console.error('Error reading characteristic:', readError);
                }
              }
            }
          }
        }
      }

      // Disconnect after reading
      await BleManager.disconnect(peripheral.id);
      
    } catch (error) {
      console.error('❌ Failed to handle SOS device:', error);
      try {
        await BleManager.disconnect(peripheral.id);
      } catch (disconnectError) {
        // Ignore disconnect errors
      }
    }
  }

  // Check for shared alerts (simplified mechanism)
  async checkForSharedAlerts(): Promise<void> {
    try {
      // This is a placeholder for a shared storage mechanism
      // In a real scenario, devices would share via:
      // 1. BLE advertisements (limited data)
      // 2. BLE connection + characteristic read/write (what we're doing above)
      // 3. Nearby Messages API (Android) / Multipeer Connectivity (iOS)
      
      // For now, we'll check if there are any new alerts stored locally
      // that might have been shared via another mechanism
      
      const allKeys = await AsyncStorage.getAllKeys();
      const sosKeys = allKeys.filter(key => key.startsWith('sos_'));
      
      for (const key of sosKeys) {
        try {
          const emergencyData = await AsyncStorage.getItem(key);
          if (emergencyData) {
            const emergency: Emergency = JSON.parse(emergencyData);
            // Check if we already have this alert
            if (!this.receivedAlerts.find(a => a.id === emergency.id)) {
              await this.receiveSOSAlert(emergency);
              console.log('📬 Received shared SOS alert:', emergency.id);
            }
          }
        } catch (error) {
          console.error('Error processing shared alert:', error);
        }
      }
    } catch (error) {
      console.error('❌ Failed to check alerts:', error);
    }
  }

  // Receive SOS alert and show notification
  async receiveSOSAlert(emergency: Emergency): Promise<void> {
    try {
      // Check if already received
      if (this.receivedAlerts.find(a => a.id === emergency.id)) {
        return;
      }

      // Store the alert
      this.receivedAlerts.unshift(emergency);
      
      // Limit to last 50 alerts
      if (this.receivedAlerts.length > 50) {
        this.receivedAlerts = this.receivedAlerts.slice(0, 50);
      }

      // Show push notification (safe - won't crash if module unavailable or Firebase not set up)
      try {
        if (PushNotification && typeof PushNotification.localNotification === 'function') {
          // Use localNotification which doesn't require Firebase
          PushNotification.localNotification({
            id: parseInt(emergency.id.replace(/\D/g, '').slice(-9)) || Date.now(), // Convert ID to number
            title: '🚨 SOS Alert Received!',
            message: `${emergency.name} - ${emergency.type} at ${emergency.location}`,
            playSound: true,
            soundName: 'default',
            importance: 'high',
            priority: 'high',
            userInfo: { emergency: JSON.stringify(emergency) }, // Serialize to avoid issues
          });
          console.log('📬 SOS Alert received and notification sent:', emergency.id);
        } else {
          console.log('📬 SOS Alert received (notification not available):', emergency.id);
        }
      } catch (notifError: any) {
        // Silently fail - notifications are not critical
        console.warn('Notification failed (non-critical):', notifError?.message || 'Unknown error');
        console.log('📬 SOS Alert received (notification skipped):', emergency.id);
      }
      
      // Save to AsyncStorage
      try {
        await AsyncStorage.setItem(
          'receivedAlerts',
          JSON.stringify(this.receivedAlerts)
        );
      } catch (storageError) {
        console.warn('Storage save failed:', storageError);
      }
    } catch (error) {
      console.error('❌ Failed to receive alert:', error);
    }
  }

  getReceivedAlerts(): Emergency[] {
    return this.receivedAlerts;
  }

  getDiscoveredDevices(): any[] {
    // Remove devices older than 30 seconds
    const now = Date.now();
    const recentDevices: any[] = [];
    
    this.discoveredDevices.forEach((device, id) => {
      if (now - device.timestamp < 30000) { // 30 seconds
        recentDevices.push(device);
      } else {
        this.discoveredDevices.delete(id);
      }
    });
    
    return recentDevices;
  }

  async loadStoredAlerts(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem('receivedAlerts');
      if (stored) {
        this.receivedAlerts = JSON.parse(stored);
        console.log(`✅ Loaded ${this.receivedAlerts.length} stored alerts`);
      }
    } catch (error) {
      console.error('❌ Failed to load alerts:', error);
    }
  }

  stopScanning(): void {
    if (this.isScanning) {
      try {
        if (BleManager && typeof BleManager.stopScan === 'function') {
          BleManager.stopScan().then(() => {
            console.log('⏸️ Scan stopped');
            this.isScanning = false;
            
            // Remove scan listener
            if (this.scanListener) {
              try {
                this.scanListener.remove();
              } catch (e) {
                // Ignore remove errors
              }
              this.scanListener = null;
            }
          }).catch((error: any) => {
            console.warn('Stop scan promise error:', error);
            this.isScanning = false;
          });
        } else {
          this.isScanning = false;
        }
      } catch (error: any) {
        console.error('Error stopping scan:', error?.message || error);
        this.isScanning = false;
      }
    }
  }
}

export default new BluetoothService();
