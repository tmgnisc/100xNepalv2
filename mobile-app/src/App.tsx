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
import { Emergency } from './types/emergency';

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [alerts, setAlerts] = useState<Emergency[]>([]);
  const alertCheckIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    initializeApp();
    
    // Cleanup on unmount
    return () => {
      if (alertCheckIntervalRef.current) {
        clearInterval(alertCheckIntervalRef.current);
      }
    };
  }, []);

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
        } else {
          console.warn('⚠️ Bluetooth initialization failed, but app can still run');
          setIsReady(true); // Still mark as ready - user can enable Bluetooth later
          // Don't show alert immediately - let user try when ready
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
      // Only show alert if it's a critical error
      if (error?.message?.includes('critical') || error?.message?.includes('fatal')) {
        Alert.alert(
          'Warning',
          'Some features may not work. Please check Bluetooth permissions in Settings.',
          [{ text: 'OK' }]
        );
      }
    }
  };

  const startScanning = async () => {
    try {
      setIsScanning(true);
      await BluetoothService.startScanning();
      
      // Check for alerts periodically
      alertCheckIntervalRef.current = setInterval(async () => {
        try {
          await BluetoothService.checkForSharedAlerts();
          const updatedAlerts = BluetoothService.getReceivedAlerts();
          setAlerts([...updatedAlerts]);
        } catch (error) {
          console.error('Error checking alerts:', error);
        }
      }, 5000); // Check every 5 seconds
      
    } catch (error: any) {
      console.error('Scan error:', error);
      setIsScanning(false);
      Alert.alert(
        'Scan Failed',
        error?.message || 'Failed to start scanning. Please check Bluetooth is enabled and permissions are granted.',
        [{ text: 'OK' }]
      );
    }
  };

  const stopScanning = () => {
    try {
      BluetoothService.stopScanning();
      // Clear interval if it exists
      if (alertCheckIntervalRef.current) {
        clearInterval(alertCheckIntervalRef.current);
        alertCheckIntervalRef.current = null;
      }
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
      </View>

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

