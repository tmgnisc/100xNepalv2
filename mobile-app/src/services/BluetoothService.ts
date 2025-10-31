import BleManager from 'react-native-ble-manager';
import PushNotification from 'react-native-push-notification';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Emergency } from '../types/emergency';

// UUID for our SOS alert service
const SOS_SERVICE_UUID = '0000180D-0000-1000-8000-00805F9B34FB'; // Standard Health Service UUID
const SOS_CHARACTERISTIC_UUID = '00002A37-0000-1000-8000-00805F9B34FB'; // Heart Rate Measurement UUID (we'll repurpose it)

class BluetoothService {
  private isScanning: boolean = false;
  private isAdvertising: boolean = false;
  private connectedDevices: string[] = [];
  private receivedAlerts: Emergency[] = [];

  async initialize(): Promise<boolean> {
    try {
      await BleManager.start({ showAlert: false });
      console.log('✅ Bluetooth initialized');
      
      // Configure push notifications
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

      return true;
    } catch (error) {
      console.error('❌ Bluetooth initialization failed:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    // Note: You'll need to add actual permission checks using react-native-permissions
    // This is a simplified version
    return true;
  }

  // Broadcast SOS alert to nearby devices
  async broadcastSOSAlert(emergency: Emergency): Promise<void> {
    try {
      const emergencyData = JSON.stringify(emergency);
      
      // Store in local storage as backup
      await AsyncStorage.setItem(`sos_${emergency.id}`, emergencyData);
      
      // For BLE advertising, we use the device name or scan response
      // Note: BLE advertising has 31 byte limit, so we'll use device name prefix
      const deviceName = `SOS-${emergency.id.slice(-6)}`; // Last 6 chars of ID
      
      console.log('📢 Broadcasting SOS Alert:', emergency.id);
      
      // Start advertising with SOS indicator in device name
      // Note: react-native-ble-manager doesn't directly support advertising,
      // so we'll use scanning + connection approach instead
      
      // Alternative: Use a simpler approach - scan for devices with "SOS-" prefix
      // and connect to share data
      
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
      this.isScanning = true;
      console.log('🔍 Starting scan for SOS alerts...');

      BleManager.scan([], 5, true).then(() => {
        console.log('✅ Scan started');
      });

      // Listen for discovered devices
      BleManager.addListener('BleManagerDiscoverPeripheral', (peripheral) => {
        const deviceName = peripheral.name || '';
        
        // Check if device is broadcasting SOS alert
        if (deviceName.startsWith('SOS-')) {
          console.log('🚨 Found SOS alert from:', peripheral.id);
          this.handleSOSDevice(peripheral);
        }
      });

    } catch (error) {
      console.error('❌ Scan failed:', error);
      this.isScanning = false;
    }
  }

  private async handleSOSDevice(peripheral: any): Promise<void> {
    try {
      // Connect to device
      await BleManager.connect(peripheral.id);
      console.log('✅ Connected to SOS device:', peripheral.id);

      // Discover services
      const services = await BleManager.retrieveServices(peripheral.id);
      
      // Read emergency data from characteristic
      // In a real implementation, you'd read from the characteristic
      // For now, we'll extract from device name or use stored data
      
      // Try to get emergency data from AsyncStorage (if shared via another method)
      // For simplicity, we'll use a different approach:
      
      // Disconnect after reading
      await BleManager.disconnect(peripheral.id);
      
    } catch (error) {
      console.error('❌ Failed to handle SOS device:', error);
    }
  }

  // Simpler approach: Use a shared storage mechanism
  // When device A triggers SOS, it saves to a shared location
  // Device B scans for this shared location periodically
  async checkForSharedAlerts(): Promise<void> {
    try {
      // In a real scenario, devices would share via:
      // 1. BLE advertisements (limited data)
      // 2. BLE connection + characteristic read/write
      // 3. Nearby devices API (Android/iOS)
      
      // For now, we'll use a simplified mock approach
      console.log('🔍 Checking for shared alerts...');
    } catch (error) {
      console.error('❌ Failed to check alerts:', error);
    }
  }

  // Receive SOS alert (called from main app)
  async receiveSOSAlert(emergency: Emergency): Promise<void> {
    try {
      // Store the alert
      this.receivedAlerts.unshift(emergency);
      
      // Show push notification
      PushNotification.localNotification({
        title: '🚨 SOS Alert Received!',
        message: `${emergency.name} - ${emergency.type} at ${emergency.location}`,
        playSound: true,
        soundName: 'default',
        importance: 'high',
        priority: 'high',
      });

      console.log('📬 SOS Alert received:', emergency.id);
      
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
      }
    } catch (error) {
      console.error('❌ Failed to load alerts:', error);
    }
  }

  stopScanning(): void {
    if (this.isScanning) {
      BleManager.stopScan().then(() => {
        console.log('⏸️ Scan stopped');
        this.isScanning = false;
      });
    }
  }
}

export default new BluetoothService();

