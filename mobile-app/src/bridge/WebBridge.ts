/**
 * Bridge between Web App and React Native App
 * Handles communication when both are running on the same device
 */

import { Emergency } from '../types/emergency';
import BluetoothService from '../services/BluetoothService';

// This can be used if web app and mobile app are running on same device
// via React Native WebView or similar bridge

export class WebBridge {
  // Listen for messages from WebView
  static setupWebViewListener(webViewRef: any) {
    // In React Native WebView component:
    // <WebView
    //   ref={webViewRef}
    //   onMessage={(event) => {
    //     const data = JSON.parse(event.nativeEvent.data);
    //     if (data.type === 'SOS_TRIGGER') {
    //       WebBridge.handleSOSTrigger(data.emergency);
    //     }
    //   }}
    // />
  }

  // Handle SOS trigger from web app
  static async handleSOSTrigger(emergency: Emergency) {
    console.log('📱 Received SOS from web app:', emergency.id);
    
    // Broadcast via Bluetooth
    await BluetoothService.broadcastSOSAlert(emergency);
    
    // Also receive it locally (for testing/display)
    await BluetoothService.receiveSOSAlert(emergency);
  }

  // Send message to WebView
  static sendToWebView(webViewRef: any, message: any) {
    if (webViewRef?.current) {
      webViewRef.current.postMessage(JSON.stringify(message));
    }
  }
}

