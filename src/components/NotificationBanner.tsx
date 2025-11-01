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
      const granted = await notificationService.requestPermission();
      if (granted) {
        setPermissionStatus("granted");
        setShowBanner(false);
        
        // Show success message
        if (window.confirm) {
          alert("✅ Notifications enabled! You will now receive SOS alerts.");
        }
      } else {
        setPermissionStatus(notificationService.getPermissionStatus());
        // Show instructions
        alert("📱 Please enable notifications in your browser settings:\n\nChrome: ⋮ Menu → Settings → Site Settings → Notifications\n\nSafari: Settings → Safari → Notifications");
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
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
                <div className="mt-2 p-2 bg-warning/10 rounded text-xs text-warning flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    Permission denied. Go to browser Settings → Site Settings → Notifications → Allow
                  </span>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

