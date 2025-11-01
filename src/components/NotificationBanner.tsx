/**
 * NotificationBanner Component
 * Shows a banner on mobile to request notification permission
 * Appears when permission is not granted
 */

import { useState, useEffect } from "react";
import { Bell, X, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import notificationService from "@/lib/notifications";

export default function NotificationBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>("default");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if mobile
    const checkMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    setIsMobile(checkMobile);

    // Check notification support
    if (!notificationService.isSupported()) {
      return;
    }

    // Check permission status
    const checkPermission = () => {
      const status = notificationService.getPermissionStatus();
      setPermissionStatus(status);
      // Show banner if permission is not granted and it's mobile
      setShowBanner(checkMobile && status !== "granted");
    };

    checkPermission();

    // Check periodically (every 5 seconds)
    const interval = setInterval(checkPermission, 5000);

    return () => clearInterval(interval);
  }, []);

  const handleRequestPermission = async () => {
    try {
      // Force refresh permission status first
      const currentStatus = Notification.permission;
      console.log("📊 Current permission status:", currentStatus);
      
      if (currentStatus === "granted") {
        // Already granted, just update state
        setPermissionStatus("granted");
        setShowBanner(false);
        return;
      }

      // Request permission
      const granted = await notificationService.requestPermission();
      
      // Force refresh permission check after request
      await new Promise(resolve => setTimeout(resolve, 500)); // Small delay
      const newStatus = Notification.permission;
      
      if (granted || newStatus === "granted") {
        setPermissionStatus("granted");
        setShowBanner(false);
        
        // Show success message
        alert("✅ Notifications enabled! You will now receive SOS alerts.");
        
        // Reload notification service to pick up new permission
        window.location.reload();
      } else {
        setPermissionStatus(newStatus);
        
        // Provide more detailed help
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        const isAndroid = /Android/.test(navigator.userAgent);
        
        let instructions = "📱 Permission was denied. Please try:\n\n";
        
        if (isAndroid) {
          instructions += "1. Tap ⋮ (three dots) → Settings\n";
          instructions += "2. Site Settings → Notifications\n";
          instructions += "3. Find this site → Set to 'Allow'\n";
          instructions += "4. Also check: Phone Settings → Apps → Browser → Notifications\n\n";
        } else if (isIOS) {
          instructions += "1. Tap 'Aa' icon → Website Settings\n";
          instructions += "2. Set Notifications to 'Allow'\n";
          instructions += "3. Also check: Settings → Safari → Notifications\n\n";
        }
        
        instructions += "Note: HTTP (non-HTTPS) sites may have notification restrictions.\n";
        instructions += "If it still doesn't work, try closing and reopening the browser tab.";
        
        alert(instructions);
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      alert("Error requesting permission. Please check browser console for details.");
    }
  };

  const handleTestNotification = () => {
    if (permissionStatus !== "granted") {
      alert("Please enable notifications first!");
      return;
    }

    // Show a test notification
    if ("Notification" in window && Notification.permission === "granted") {
      const notification = new Notification("🧪 Test Notification", {
        body: "Notifications are working! You will receive SOS alerts.",
        icon: "/favicon.ico",
        tag: "test-notification",
      });

      setTimeout(() => notification.close(), 5000);
    }
  };

  if (!showBanner || !isMobile) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:hidden">
      <Card className="border-2 border-emergency bg-background shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0">
              <Bell className="h-6 w-6 text-emergency" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-sm mb-1">Enable Notifications</h3>
              <p className="text-xs text-muted-foreground mb-3">
                Get notified when SOS alerts are triggered in your area.
              </p>
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={handleRequestPermission}
                  className="flex-1 text-xs"
                >
                  <Bell className="h-4 w-4 mr-1" />
                  Enable
                </Button>
                {permissionStatus === "granted" && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={handleTestNotification}
                    className="text-xs"
                  >
                    Test
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setShowBanner(false)}
                  className="px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              {permissionStatus === "denied" && (
                <div className="mt-2 p-2 bg-warning/10 rounded text-xs text-warning flex flex-col gap-2">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold mb-1">Permission denied</p>
                      <p className="text-xs">
                        If you already enabled it in settings, try:
                      </p>
                      <ul className="text-xs mt-1 space-y-1 list-disc list-inside">
                        <li>Refresh this page</li>
                        <li>Close and reopen browser tab</li>
                        <li>Clear site data and try again</li>
                        <li>Check system notification settings</li>
                      </ul>
                      <p className="text-xs mt-1 italic">
                        Note: HTTP (non-HTTPS) sites may have restrictions on some browsers.
                      </p>
                    </div>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      // Try to refresh permission status
                      const status = Notification.permission;
                      setPermissionStatus(status);
                      if (status === "granted") {
                        setShowBanner(false);
                        window.location.reload();
                      } else {
                        alert(`Current status: ${status}\n\nIf you enabled it in settings, try refreshing the page.`);
                      }
                    }}
                    className="text-xs w-full"
                  >
                    Refresh Status
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

