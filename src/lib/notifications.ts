/**
 * Browser Notification Service
 * Manages browser notifications for SOS alerts
 */

import { Emergency } from "@/types/emergency";
import { API_ENDPOINTS, apiRequest } from "./api";

class NotificationService {
  private pollingInterval: NodeJS.Timeout | null = null;
  private lastCheckedTimestamp: number = 0;
  private notificationPermission: NotificationPermission = "default";
  private isPolling: boolean = false;

  /**
   * Check if running on mobile device
   */
  private isMobileDevice(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }

  /**
   * Request notification permission
   */
  async requestPermission(): Promise<boolean> {
    if (!("Notification" in window)) {
      console.warn("⚠️ This browser does not support notifications");
      return false;
    }

    // Check if on mobile
    const isMobile = this.isMobileDevice();
    if (isMobile) {
      console.log("📱 Detected mobile device");
    }

    if (Notification.permission === "granted") {
      this.notificationPermission = "granted";
      console.log("✅ Notification permission already granted");
      return true;
    }

    if (Notification.permission === "denied") {
      this.notificationPermission = "denied";
      console.warn("❌ Notification permission denied. Please enable in browser settings.");
      if (isMobile) {
        console.warn("📱 On mobile: Go to browser settings → Site Settings → Notifications");
      }
      return false;
    }

    // Request permission - on mobile, this must be triggered by user interaction
    try {
      console.log("🔐 Requesting notification permission...");
      const permission = await Notification.requestPermission();
      this.notificationPermission = permission;
      
      if (permission === "granted") {
        console.log("✅ Notification permission granted!");
      } else if (permission === "denied") {
        console.warn("❌ Notification permission denied");
        if (isMobile) {
          console.warn("📱 On mobile: Go to browser → Settings → Site Settings → Notifications → Allow");
        }
      } else {
        console.log("⏳ Notification permission default (will ask later)");
      }
      
      return permission === "granted";
    } catch (error) {
      console.error("❌ Error requesting notification permission:", error);
      return false;
    }
  }

  /**
   * Show browser notification for SOS alert
   */
  showNotification(emergency: Emergency): void {
    // Check permission again (it might have been granted since last check)
    if (Notification.permission !== "granted") {
      console.warn("⚠️ Notification permission not granted:", Notification.permission);
      this.notificationPermission = Notification.permission;
      
      // On mobile, try to guide user
      if (this.isMobileDevice()) {
        console.warn("📱 Mobile: Please allow notifications in browser settings");
      }
      return;
    }

    // Update permission status
    this.notificationPermission = "granted";

    const title = `🚨 SOS Alert: ${emergency.type}`;
    const body = `${emergency.name} - ${emergency.location} (${emergency.wardNo})`;
    
    console.log("🔔 Creating notification:", { title, body, id: emergency.id });
    
    try {
      // Mobile-friendly notification options
      const notificationOptions: NotificationOptions = {
        body,
        tag: `sos-${emergency.id}`, // Prevent duplicate notifications
        requireInteraction: false, // Allow notification to auto-dismiss
        data: emergency,
        timestamp: Date.now(),
      };

      // Add icon only if supported (some mobile browsers don't support it)
      if ('icon' in Notification.prototype) {
        notificationOptions.icon = "/favicon.ico";
        notificationOptions.badge = "/favicon.ico";
      }

      // Add vibrate pattern for mobile devices (if supported)
      if ('vibrate' in Notification.prototype && this.isMobileDevice()) {
        notificationOptions.vibrate = [200, 100, 200, 100, 200]; // Longer pattern for mobile
      }

      const notification = new Notification(title, notificationOptions);

      console.log("✅ Notification created successfully");

      // Handle notification click
      notification.onclick = (event) => {
        console.log("👆 Notification clicked");
        event.preventDefault();
        window.focus();
        notification.close();
        
        // Navigate to municipality dashboard
        if (window.location.pathname !== "/municipality") {
          window.location.href = "/municipality";
        }
      };

      // Handle notification error
      notification.onerror = (error) => {
        console.error("❌ Notification error:", error);
        if (this.isMobileDevice()) {
          console.error("📱 Mobile: Notification might not be fully supported on this device");
        }
      };

      // Auto-close after 20 seconds (longer for mobile)
      setTimeout(() => {
        try {
          notification.close();
        } catch (e) {
          // Ignore close errors
        }
      }, 20000);
      
    } catch (error) {
      console.error("❌ Failed to create notification:", error);
      if (this.isMobileDevice()) {
        console.error("📱 Mobile: Check if notifications are enabled in browser and system settings");
      }
    }
  }

  /**
   * Start polling for new emergencies
   */
  async startPolling(intervalMs: number = 5000): Promise<void> {
    if (this.isPolling) {
      console.warn("⚠️ Already polling");
      return;
    }

    const isMobile = this.isMobileDevice();
    
    // Request permission first (but don't block if denied - still poll)
    const hasPermission = await this.requestPermission();
    if (!hasPermission) {
      console.warn("⚠️ Notification permission not granted, but will continue polling");
      if (isMobile) {
        console.warn("📱 Mobile: Notifications won't show until permission is granted");
        console.warn("📱 Tip: Grant permission when browser prompts, or enable in browser settings");
      }
      // Continue anyway - maybe permission will be granted later
    }

    this.isPolling = true;
    // Start from current time, but check for recent emergencies (last 5 minutes)
    this.lastCheckedTimestamp = Date.now() - 300000; // Start 5 minutes ago to catch recent alerts

    console.log("✅ Started polling for SOS alerts", {
      isMobile: isMobile,
      permission: this.notificationPermission,
      interval: intervalMs,
      startTime: new Date(this.lastCheckedTimestamp).toISOString(),
    });

    if (isMobile) {
      console.log("📱 Mobile device detected - notifications may behave differently");
    }

    // Poll immediately
    await this.checkForNewEmergencies();

    // Then poll at intervals
    this.pollingInterval = setInterval(async () => {
      await this.checkForNewEmergencies();
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
    console.log("⏸️ Stopped polling for SOS alerts");
  }

  /**
   * Check for new emergencies and show notifications
   */
  private async checkForNewEmergencies(): Promise<void> {
    try {
      // Use direct endpoint (without /api prefix) to avoid route rewrite issues with query params
      // JSON Server routes.json rewrites /api/emergencies to /emergencies, but query params cause 404
      // Solution: Use direct /emergencies endpoint instead of /api/emergencies
      const apiBaseUrl = API_ENDPOINTS.emergencies.replace('/api/emergencies', '');
      const directUrl = `${apiBaseUrl}/emergencies?_sort=id&_order=desc&_limit=20`;
      
      console.log("🔍 Polling for new emergencies...", {
        url: directUrl,
        lastChecked: new Date(this.lastCheckedTimestamp).toISOString(),
      });
      
      const emergencies: Emergency[] = await apiRequest<Emergency[]>(directUrl);

      if (!emergencies || emergencies.length === 0) {
        console.log("📭 No emergencies found");
        return;
      }

      console.log(`📋 Found ${emergencies.length} emergencies`);

      // Track which emergencies we've already notified about
      const notifiedIds = new Set<string>();
      
      // Filter for new emergencies
      const newEmergencies = emergencies.filter((emergency) => {
        // Extract timestamp from ID (format: E{timestamp})
        const idTimestamp = parseInt(emergency.id.replace(/^E/, '')) || 0;
        
        // Also check createdAt if available
        const createdAt = emergency.createdAt 
          ? new Date(emergency.createdAt).getTime()
          : idTimestamp;
        
        // Calculate time since creation
        const timeSinceCreation = Date.now() - createdAt;
        
        // New emergency if:
        // 1. Created after last check timestamp, OR
        // 2. Status is Pending and created recently (within last 3 minutes)
        const isNew = createdAt > this.lastCheckedTimestamp || 
                   (emergency.status === "Pending" && timeSinceCreation < 180000); // Within last 3 minutes
        
        if (isNew) {
          console.log("🆕 New emergency detected:", {
            id: emergency.id,
            name: emergency.name,
            type: emergency.type,
            status: emergency.status,
            createdAt: emergency.createdAt || new Date(idTimestamp).toISOString(),
            timeSinceCreation: Math.round(timeSinceCreation / 1000) + "s",
          });
        }
        
        return isNew;
      });

      console.log(`📬 Found ${newEmergencies.length} new emergencies`);

      // Show notifications for new emergencies
      newEmergencies.forEach((emergency) => {
        // Only show notifications for pending emergencies
        if (emergency.status === "Pending" && !notifiedIds.has(emergency.id)) {
          try {
            this.showNotification(emergency);
            notifiedIds.add(emergency.id);
            console.log("📬 ✅ Notification shown for emergency:", emergency.id);
          } catch (notifError) {
            console.error("❌ Failed to show notification:", notifError);
          }
        }
      });

      // Update last checked timestamp to the most recent emergency
      if (emergencies.length > 0) {
        const mostRecent = emergencies[0];
        const idTimestamp = parseInt(mostRecent.id.replace(/^E/, '')) || Date.now();
        const createdAt = mostRecent.createdAt 
          ? new Date(mostRecent.createdAt).getTime()
          : idTimestamp;
        
        // Only update if this is actually newer
        if (createdAt > this.lastCheckedTimestamp) {
          this.lastCheckedTimestamp = createdAt;
          console.log("⏰ Updated last checked timestamp:", new Date(this.lastCheckedTimestamp).toISOString());
        }
      }
    } catch (error) {
      console.error("❌ Error checking for new emergencies:", error);
    }
  }

  /**
   * Check if notifications are supported
   */
  isSupported(): boolean {
    return "Notification" in window;
  }

  /**
   * Get current permission status
   */
  getPermissionStatus(): NotificationPermission {
    if (!this.isSupported()) {
      return "denied";
    }
    return Notification.permission;
  }
}

// Export singleton instance
export default new NotificationService();

