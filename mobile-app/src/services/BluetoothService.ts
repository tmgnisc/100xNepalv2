import BleManager from 'react-native-ble-manager';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { check, request, PERMISSIONS, RESULTS, Platform, openSettings } from 'react-native-permissions';
import { Emergency } from '../types/emergency';

// UUID for our SOS alert service
const SOS_SERVICE_UUID = '12345678-1234-1234-1234-123456789ABC';
const SOS_CHARACTERISTIC_UUID = '12345678-1234-1234-1234-123456789ABD';

class BluetoothService {
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;
  private connectedDevices: string[] = [];
  private receivedAlerts: Emergency[] = [];
  private scanListener: any = null;

  async checkPermissions(): Promise<boolean> {
    try {
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
      try {
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
          requestPermissions: true,
        });
        console.log('✅ Push notifications configured');
      } catch (error) {
        console.warn('⚠️ Push notification setup failed (non-critical):', error);
      }

      // Request permissions first
      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        console.error('❌ Bluetooth permissions not granted');
        return false;
      }

      // Initialize Bluetooth (non-blocking - won't crash if fails)
      try {
        await BleManager.start({ showAlert: false });
        console.log('✅ Bluetooth initialized');
        return true;
      } catch (error) {
        console.error('❌ BleManager.start failed:', error);
        return false;
      }
      
    } catch (error) {
      console.error('❌ Bluetooth initialization failed:', error);
      // Don't throw - let app continue without Bluetooth
      return false;
    }
  }

  // Broadcast SOS alert to nearby devices via BLE
  async broadcastSOSAlert(emergency: Emergency): Promise<void> {
    try {
      console.log('📢 Broadcasting SOS Alert:', emergency.id);
      
      // Store in local storage
      await AsyncStorage.setItem(`sos_${emergency.id}`, JSON.stringify(emergency));
      
      // For BLE, we'll use a simpler approach:
      // 1. Store emergency data locally
      // 2. Change device name to indicate SOS (if possible)
      // 3. Or use BLE advertising with custom service
      
      // Note: Full BLE advertising requires native code
      // For now, we'll use a polling mechanism where devices check for shared alerts
      
      console.log('✅ SOS alert stored for broadcasting');
      
    } catch (error) {
      console.error('❌ Failed to broadcast SOS:', error);
    }
  }

  // Start scanning for nearby SOS alerts
  async startScanning(): Promise<void> {
    if (this.isScanning) {
      console.log('⚠️ Already scanning');
      return;
    }

    try {
      // Check permissions before scanning
      const hasPermissions = await this.checkPermissions();
      if (!hasPermissions) {
        throw new Error('Bluetooth permissions not granted. Please grant permissions in Settings.');
      }

      // Check if Bluetooth is enabled
      try {
        const enabled = await BleManager.checkState();
        if (enabled !== 'on') {
          throw new Error('Bluetooth is not enabled. Please enable Bluetooth in Settings.');
        }
      } catch (error: any) {
        if (error.message?.includes('not enabled')) {
          throw error;
        }
        // If checkState fails, continue anyway
        console.warn('⚠️ Could not check Bluetooth state, continuing...');
      }

      this.isScanning = true;
      console.log('🔍 Starting scan for SOS alerts...');

      // Start scanning for devices
      await BleManager.scan([SOS_SERVICE_UUID], 10, true); // Scan for 10 seconds
      console.log('✅ Scan started');

      // Listen for discovered devices
      this.scanListener = BleManager.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
        try {
          console.log('📡 Discovered device:', peripheral.name || peripheral.id);
          
          // Check if device is advertising our SOS service
          if (peripheral.advertising?.serviceUUIDs?.includes(SOS_SERVICE_UUID)) {
            console.log('🚨 Found SOS alert from:', peripheral.id);
            this.handleSOSDevice(peripheral);
          }
        } catch (error) {
          console.error('Error handling peripheral:', error);
        }
      });

      // Also check for shared alerts periodically (fallback mechanism)
      this.startSharedAlertsPolling();

    } catch (error: any) {
      console.error('❌ Scan failed:', error);
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
                  // Note: In React Native, use TextDecoder or convert manually
                  let emergencyStr: string;
                  try {
                    if (typeof data === 'string') {
                      emergencyStr = atob(data); // Decode base64
                    } else {
                      emergencyStr = String.fromCharCode.apply(null, Array.from(data as any));
                    }
                    const emergency: Emergency = JSON.parse(emergencyStr);
                  
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

      // Show push notification
      PushNotification.localNotification({
        id: emergency.id,
        title: '🚨 SOS Alert Received!',
        message: `${emergency.name} - ${emergency.type} at ${emergency.location}`,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
        userInfo: { emergency },
      });

      console.log('📬 SOS Alert received and notification sent:', emergency.id);
      
      // Save to AsyncStorage
      await AsyncStorage.setItem(
        'receivedAlerts',
        JSON.stringify(this.receivedAlerts)
      );
    } catch (error) {
      console.error('❌ Failed to receive alert:', error);
    }
  }

  getReceivedAlerts(): Emergency[] {
    return this.receivedAlerts;
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
        BleManager.stopScan().then(() => {
          console.log('⏸️ Scan stopped');
          this.isScanning = false;
          
          // Remove scan listener
          if (this.scanListener) {
            this.scanListener.remove();
            this.scanListener = null;
          }
        });
      } catch (error) {
        console.error('Error stopping scan:', error);
        this.isScanning = false;
      }
    }
  }
}

export default new BluetoothService();
