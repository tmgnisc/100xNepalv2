/**
 * NotificationManager Component
 * Manages browser notifications for SOS alerts
 * Automatically polls the backend for new emergencies and shows notifications
 */

import { useEffect } from "react";
import notificationService from "@/lib/notifications";

export default function NotificationManager() {
  useEffect(() => {
    // Check if notifications are supported
    if (!notificationService.isSupported()) {
      console.log("⚠️ Browser notifications not supported");
      return;
    }

    console.log("🔔 Initializing notification service...");
    console.log("📊 Current permission status:", notificationService.getPermissionStatus());

    // Start polling for new emergencies
    // Will request permission automatically on first poll
    notificationService.startPolling(5000); // Poll every 5 seconds

    // Cleanup on unmount
    return () => {
      console.log("🛑 Stopping notification polling");
      notificationService.stopPolling();
    };
  }, []);

  // This component doesn't render anything
  return null;
}

