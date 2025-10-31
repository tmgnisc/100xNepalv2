import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { EmergencyType } from "@/types/emergency";
import { getEmergenciesFromStorage, saveEmergenciesToStorage } from "@/lib/mockData";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";
import { motion } from "framer-motion";

export default function RuralPanel() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    wardNo: "Ward 16",
    location: "Tamaghat",
    phone: "",
    type: "Accident" as EmergencyType,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    setTimeout(() => {
      const newEmergency = {
        id: `E${Date.now()}`,
        ...formData,
        time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: "Pending" as const,
        // Tamaghat area coordinates (same as municipality map)
        lat: 27.6500 + (Math.random() - 0.5) * 0.01,
        lng: 85.4500 + (Math.random() - 0.5) * 0.01,
      };

      const existingEmergencies = getEmergenciesFromStorage();
      saveEmergenciesToStorage([newEmergency, ...existingEmergencies]);

      // Also persist to backend (json-server)
      (async () => {
        try {
          console.log("Sending emergency to backend:", newEmergency);
          
          // Use direct fetch with proper headers to avoid caching issues
          const response = await fetch(API_ENDPOINTS.emergencies, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
            cache: 'no-store',
            body: JSON.stringify(newEmergency),
          });
          
          console.log("Backend response:", {
            status: response.status,
            statusText: response.statusText,
            ok: response.ok,
            headers: Object.fromEntries(response.headers.entries()),
          });

          // JSON Server returns 201 for successful POST
          if (response.status === 201) {
            const data = await response.json().catch(() => null);
            console.log("Emergency saved to backend:", data);
            toast.success("Synced to server", { description: "Emergency saved to backend" });
          } else if (response.status === 200) {
            // Some servers return 200 instead of 201
            const data = await response.json().catch(() => null);
            console.log("Emergency saved to backend (200):", data);
            toast.success("Synced to server", { description: "Emergency saved to backend" });
          } else if (response.status === 304) {
            // 304 for POST is unusual - check if data exists, if not retry
            console.warn("Received 304 for POST request");
            const checkResponse = await fetch(API_ENDPOINTS.emergencies);
            const existing = await checkResponse.json().catch(() => []);
            const wasSaved = Array.isArray(existing) && existing.some((e: any) => e.id === newEmergency.id);
            
            if (!wasSaved) {
              // Retry with a completely fresh request
              console.log("Retrying POST request...");
              const retryResponse = await fetch(API_ENDPOINTS.emergencies, {
                method: "POST",
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newEmergency, _timestamp: Date.now() }),
              });
              
              if (retryResponse.ok) {
                toast.success("Synced to server", { description: "Emergency saved to backend" });
              } else {
                throw new Error(`Retry failed: ${retryResponse.status}`);
              }
            } else {
              toast.success("Synced to server", { description: "Emergency already saved" });
            }
          } else {
            const errorText = await response.text().catch(() => response.statusText);
            throw new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          // Non-blocking: show error but keep local success
          console.error("Failed to sync with backend:", error);
          toast.error("Saved locally. Sync to server failed.", {
            description: error instanceof Error ? error.message : "Please check backend server",
          });
        }
      })();

      setIsSubmitting(false);
      setShowSuccess(true);
      toast.success("Emergency Alert Sent!", {
        description: "Help is on the way. Your alert has been submitted.",
      });

      setTimeout(() => {
        setShowSuccess(false);
        setFormData({
          name: "",
          wardNo: "Ward 16",
          location: "Tamaghat",
          phone: "",
          type: "Accident",
        });
      }, 3000);
    }, 1500);
  };

  if (showSuccess) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="w-full max-w-md text-center border-success">
            <CardContent className="pt-12 pb-8">
              <CheckCircle2 className="h-24 w-24 text-success mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">Emergency Sent Successfully! 🚨</h2>
              <p className="text-lg text-muted-foreground mb-2">
                Help is on the way
              </p>
              <p className="text-muted-foreground">
                Please stay calm and wait for assistance
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-gradient-to-br from-emergency/5 via-trust/5 to-background">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center pb-8">
            <div className="mx-auto w-16 h-16 bg-emergency/10 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="h-8 w-8 text-emergency" />
            </div>
            <CardTitle className="text-3xl md:text-4xl">Emergency SOS</CardTitle>
            <CardDescription className="text-lg">
              Quick emergency alert for rural areas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="type" className="text-base">Emergency Type *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as EmergencyType })}
                  required
                >
                  <SelectTrigger className="h-14 text-lg">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pregnancy">Pregnancy Emergency</SelectItem>
                    <SelectItem value="Accident">Accident</SelectItem>
                    <SelectItem value="Illness">Critical Illness</SelectItem>
                    <SelectItem value="Other">Other Emergency</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="name" className="text-base">Patient Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter full name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="h-14 text-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wardNo" className="text-base">Ward Number *</Label>
                  <Input
                    id="wardNo"
                    placeholder="Ward 16"
                    value={formData.wardNo}
                    onChange={(e) => setFormData({ ...formData, wardNo: e.target.value })}
                    required
                    className="h-14 text-lg"
                    readOnly
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone" className="text-base">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="98XXXXXXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="h-14 text-lg"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-base">Location Details *</Label>
                <Input
                  id="location"
                  placeholder="Tamaghat"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  required
                  className="h-14 text-lg"
                  readOnly
                />
              </div>

              <Button
                type="submit"
                size="lg"
                disabled={isSubmitting}
                className="w-full h-16 text-xl font-bold pulse-emergency"
              >
                {isSubmitting ? (
                  "Sending Alert..."
                ) : (
                  <>
                    <AlertTriangle className="mr-2 h-6 w-6" />
                    Trigger SOS Alert
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
