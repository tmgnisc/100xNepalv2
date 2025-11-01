import React, { useEffect, useState, useRef } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Alert,
  StatusBar,
} from 'react-native';
import BluetoothService from './services/BluetoothService';
import ApiService from './services/ApiService';
import { Emergency } from './types/emergency';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<Emergency[]>([]);
  const [discoveredDevices, setDiscoveredDevices] = useState<any[]>([]);
  const [pairedDevices, setPairedDevices] = useState<any[]>([]);
  const alertCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const deviceUpdateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      if (alertCheckIntervalRef.current) {
        clearInterval(alertCheckIntervalRef.current);
      }
    };
  }, []);

  const loadPairedDevices = async () => {
    try {
      const devices = await BluetoothService.getPairedDevices();
      setPairedDevices(devices);
      // Also update discovered devices list
      const allDevices = BluetoothService.getDiscoveredDevices();
      setDiscoveredDevices(allDevices);
    } catch (error) {
      console.error('Error loading paired devices:', error);
    }
  };

  const initializeApp = async () => {
    try {
      // Load stored alerts first (doesn't require Bluetooth)
      try {
        await BluetoothService.loadStoredAlerts();
        setAlerts(BluetoothService.getReceivedAlerts());
      } catch (loadError) {
        console.warn('Failed to load stored alerts:', loadError);
        // Continue anyway
      }
      
      // Try to initialize Bluetooth (non-blocking)
      try {
        const initialized = await BluetoothService.initialize();
        if (initialized) {
          setIsReady(true);
          console.log('✅ App initialized successfully');
          
          // Try to load paired devices (non-blocking)
          loadPairedDevices();
        } else {
          console.warn('⚠️ Bluetooth initialization failed, but app can still run');
          setIsReady(true); // Still mark as ready - user can enable Bluetooth later
        }
      } catch (initError: any) {
        console.error('Bluetooth initialization error:', initError);
        setIsReady(true); // App can still run without Bluetooth
      }
      
      // Make sure we set ready state even if everything fails
      if (!isReady) {
        setIsReady(true);
      }
    } catch (error: any) {
      console.error('Initialization error:', error?.message || error);
      // Don't crash - show warning but allow app to continue
      setIsReady(true);
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      
      // Show loading state
      Alert.alert(
        'Starting...',
        'Requesting permissions and enabling Bluetooth...',
        [],
        { cancelable: false }
      );

      await BluetoothService.startScanning();
      
      // Dismiss loading alert
      
      // Start polling backend API for new emergencies (when web app triggers SOS)
      ApiService.startPolling((newEmergencies: Emergency[]) => {
        // When new emergencies found from API, receive them
        newEmergencies.forEach(async (emergency) => {
          await BluetoothService.receiveSOSAlert(emergency);
          console.log('📬 Received SOS alert from API:', emergency.id);
        });
        // Update alerts list
        const updatedAlerts = BluetoothService.getReceivedAlerts();
        setAlerts([...updatedAlerts]);
      }, 5000); // Poll every 5 seconds
      
      // Check for Bluetooth-shared alerts periodically
      alertCheckIntervalRef.current = setInterval(async () => {
        try {
          await BluetoothService.checkForSharedAlerts();
          const updatedAlerts = BluetoothService.getReceivedAlerts();
          setAlerts([...updatedAlerts]);
        } catch (error) {
          console.error('Error checking alerts:', error);
        }
      }, 5000); // Check every 5 seconds
      
      // Update discovered devices list
      deviceUpdateIntervalRef.current = setInterval(() => {
        try {
          const devices = BluetoothService.getDiscoveredDevices();
          setDiscoveredDevices([...devices]);
        } catch (error) {
          console.error('Error getting discovered devices:', error);
        }
      }, 2000); // Update every 2 seconds
      
      Alert.alert(
        '✅ Listening Started',
        'App is now listening for SOS alerts from nearby devices.',
        [{ text: 'OK' }]
      );
      
    } catch (error: any) {
      console.error('Scan error:', error);
      setIsScanning(false);
      
      const errorMessage = error?.message || 'Failed to start scanning.';
      
      // Provide actionable error messages
      if (errorMessage.includes('permission')) {
        Alert.alert(
          'Permission Required',
          'Bluetooth permissions are required. Please grant permissions when prompted, or enable them in Settings → Apps → AarogyaConnect → Permissions.',
          [
            { text: 'Open Settings', onPress: () => {
              // Try to open settings (platform specific)
              if (Platform.OS === 'android') {
                // On Android, we can't directly open app settings directly, but user can do it
              }
            }},
            { text: 'OK' }
          ]
        );
      } else if (errorMessage.includes('Bluetooth') && errorMessage.includes('not enabled')) {
        Alert.alert(
          'Bluetooth Required',
          'Please enable Bluetooth in your device settings and try again.',
          [
            { text: 'Enable Bluetooth', onPress: () => {
              // Try to open Bluetooth settings
              // On Android, we can't directly enable, but we can guide
            }},
            { text: 'OK' }
          ]
        );
      } else {
        Alert.alert(
          'Scan Failed',
          errorMessage,
          [{ text: 'OK' }]
        );
      }
    }
  };

  const stopScanning = () => {
    try {
      BluetoothService.stopScanning();
      ApiService.stopPolling(); // Stop API polling too
      
      // Clear intervals if they exist
      if (alertCheckIntervalRef.current) {
        clearInterval(alertCheckIntervalRef.current);
        alertCheckIntervalRef.current = null;
      }
      if (deviceUpdateIntervalRef.current) {
        clearInterval(deviceUpdateIntervalRef.current);
        deviceUpdateIntervalRef.current = null;
      }
      setDiscoveredDevices([]);
      setIsScanning(false);
    } catch (error) {
      console.error('Error stopping scan:', error);
      setIsScanning(false);
    }
  };

  const testSOSAlert = async () => {
    try {
      const testEmergency: Emergency = {
        id: `E${Date.now()}`,
        name: 'Test User',
        type: 'Accident',
        location: 'Test Location',
        wardNo: 'Ward 16',
        phone: '1234567890',
        time: new Date().toLocaleTimeString(),
        status: 'Pending',
        lat: 27.6500,
        lng: 85.4500,
      };

      await BluetoothService.receiveSOSAlert(testEmergency);
      setAlerts([...BluetoothService.getReceivedAlerts()]);
      Alert.alert('Test Alert', 'Test SOS alert received!');
    } catch (error: any) {
      console.error('Test alert error:', error);
      Alert.alert('Error', 'Failed to send test alert. Please try again.');
    }
  };

  const broadcastTestSOS = async () => {
    try {
      const testEmergency: Emergency = {
        id: `E${Date.now()}`,
        name: 'User A',
        type: 'Pregnancy',
        location: 'Tamaghat',
        wardNo: 'Ward 16',
        phone: '9876543210',
        time: new Date().toLocaleTimeString(),
        status: 'Pending',
        lat: 27.6500,
        lng: 85.4500,
      };

      await BluetoothService.broadcastSOSAlert(testEmergency);
      Alert.alert('Broadcast', 'SOS alert broadcasted!');
    } catch (error: any) {
      console.error('Broadcast error:', error);
      Alert.alert('Error', 'Failed to broadcast alert. Please try again.');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      
      <View style={styles.header}>
        <Text style={styles.title}>🚨 AarogyaConnect</Text>
        <Text style={styles.subtitle}>Bluetooth SOS Alerts</Text>
      </View>

      <View style={styles.controls}>
        {!isReady ? (
          <TouchableOpacity
            style={[styles.button, { backgroundColor: '#9ca3af' }]}
            disabled
          >
            <Text style={styles.buttonText}>⏳ Initializing...</Text>
          </TouchableOpacity>
        ) : !isScanning ? (
          <TouchableOpacity
            style={[styles.button, styles.buttonPrimary]}
            onPress={startScanning}
          >
            <Text style={styles.buttonText}>🔍 Start Listening</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.button, styles.buttonSecondary]}
            onPress={stopScanning}
          >
            <Text style={styles.buttonText}>⏸️ Stop Listening</Text>
          </TouchableOpacity>
        )}

        <View style={styles.testButtons}>
          <TouchableOpacity
            style={[styles.button, styles.buttonTest]}
            onPress={testSOSAlert}
          >
            <Text style={styles.buttonTextSmall}>📬 Test Receive</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={[styles.button, styles.buttonTest]}
            onPress={broadcastTestSOS}
          >
            <Text style={styles.buttonTextSmall}>📢 Test Broadcast</Text>
          </TouchableOpacity>
        </View>
        
        {/* Refresh paired devices button */}
        <TouchableOpacity
          style={[styles.button, styles.buttonRefresh]}
          onPress={loadPairedDevices}
        >
          <Text style={styles.buttonTextSmall}>🔄 Refresh Device List</Text>
        </TouchableOpacity>
      </View>

      {(discoveredDevices.length > 0 || pairedDevices.length > 0) && (
        <View style={styles.devicesContainer}>
          <Text style={styles.sectionTitle}>
            Available Devices ({discoveredDevices.length || pairedDevices.length})
            {!isScanning && <Text style={styles.hintText}> (Tap "Start Listening" to scan for more)</Text>}
          </Text>
          <ScrollView style={styles.devicesList}>
            {discoveredDevices.map((device) => (
              <TouchableOpacity
                key={device.id}
                style={[styles.deviceCard, device.isPaired && styles.pairedDeviceCard]}
                onPress={async () => {
                  try {
                    Alert.alert(
                      'Connect to Device',
                      `Connect to ${device.name}?`,
                      [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Connect',
                          onPress: async () => {
                            const connected = await BluetoothService.connectToDevice(device.id);
                            if (connected) {
                              Alert.alert('Success', `Connected to ${device.name}`);
                            } else {
                              Alert.alert('Error', `Failed to connect to ${device.name}`);
                            }
                          },
                        },
                      ]
                    );
                  } catch (error) {
                    console.error('Error connecting:', error);
                  }
                }}
              >
                <View style={styles.deviceCardContent}>
                  <View style={styles.deviceCardHeader}>
                    <Text style={styles.deviceName}>
                      {device.name}
                      {device.isPaired && ' (Paired)'}
                    </Text>
                    {device.advertising?.serviceUUIDs?.includes('12345678-1234-1234-1234-123456789ABC') && (
                      <Text style={styles.sosIndicator}>🚨 SOS</Text>
                    )}
                  </View>
                  <Text style={styles.deviceRssi}>
                    {device.rssi ? `Signal: ${device.rssi} dBm` : 'Paired Device'}
                  </Text>
                  <Text style={styles.deviceId}>ID: {device.id.substring(0, 12)}...</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}

      <View style={styles.alertsContainer}>
        <Text style={styles.sectionTitle}>
          Received Alerts ({alerts.length})
        </Text>
        
        <ScrollView style={styles.alertsList}>
          {alerts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                No alerts received yet.{'\n'}
                Start listening to receive SOS alerts from nearby devices.
              </Text>
            </View>
          ) : (
            alerts.map((alert) => (
              <View key={alert.id} style={styles.alertCard}>
                <View style={styles.alertHeader}>
                  <Text style={styles.alertType}>{alert.type}</Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
                <Text style={styles.alertName}>{alert.name}</Text>
                <Text style={styles.alertLocation}>📍 {alert.location}</Text>
                {alert.phone && (
                  <Text style={styles.alertPhone}>📞 {alert.phone}</Text>
                )}
                <Text style={styles.alertWard}>🏘️ {alert.wardNo}</Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#dc2626',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 14,
    color: '#fff',
    marginTop: 4,
  },
  controls: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  buttonPrimary: {
    backgroundColor: '#2563eb',
  },
  buttonSecondary: {
    backgroundColor: '#dc2626',
  },
  buttonTest: {
    backgroundColor: '#10b981',
    padding: 12,
    flex: 1,
    marginHorizontal: 4,
  },
  buttonRefresh: {
    backgroundColor: '#6366f1',
    padding: 12,
    marginTop: 8,
  },
  hintText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: 'normal',
  },
  testButtons: {
    flexDirection: 'row',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonTextSmall: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  alertsContainer: {
    flex: 1,
    padding: 16,
  },
  devicesContainer: {
    padding: 16,
    backgroundColor: '#f9fafb',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  devicesList: {
    maxHeight: 200,
  },
  deviceCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    marginHorizontal: 16,
  },
  pairedDeviceCard: {
    borderColor: '#10b981',
    borderWidth: 2,
    backgroundColor: '#f0fdf4',
  },
  deviceCardContent: {
    flex: 1,
  },
  deviceCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  deviceName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1f2937',
  },
  deviceRssi: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  deviceId: {
    fontSize: 10,
    color: '#9ca3af',
    marginTop: 4,
  },
  sosIndicator: {
    fontSize: 12,
    color: '#dc2626',
    fontWeight: '600',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#1f2937',
  },
  alertsList: {
    flex: 1,
  },
  emptyState: {
    padding: 32,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  alertCard: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#dc2626',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  alertHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  alertType: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  alertTime: {
    fontSize: 12,
    color: '#6b7280',
  },
  alertName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginBottom: 4,
  },
  alertLocation: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  alertPhone: {
    fontSize: 14,
    color: '#4b5563',
    marginBottom: 4,
  },
  alertWard: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
});

export default App;

