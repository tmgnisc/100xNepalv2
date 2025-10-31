import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Ambulance, MapPin, Clock, Phone } from "lucide-react";
import { Emergency } from "@/types/emergency";
import { getEmergenciesFromStorage, saveEmergenciesToStorage } from "@/lib/mockData";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Volunteer() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = () => {
    const data = getEmergenciesFromStorage();
    const relevant = data.filter(e => 
      ["Ambulance Assigned", "Ambulance Dispatched", "On Route", "Reached"].includes(e.status)
    );
    setEmergencies(relevant);
  };

  const updateStatus = (id: string, newStatus: Emergency["status"]) => {
    const all = getEmergenciesFromStorage();
    const updated = all.map(e => e.id === id ? { ...e, status: newStatus } : e);
    saveEmergenciesToStorage(updated);
    loadEmergencies();
    toast.success("Status Updated", {
      description: `Mission ${id} marked as ${newStatus}`,
    });
  };

  const getProgressValue = (status: Emergency["status"]) => {
    if (status === "Ambulance Assigned") return 25;
    if (status === "Ambulance Dispatched" || status === "On Route") return 50;
    if (status === "Reached") return 75;
    return 100;
  };

  const getStatusColor = (status: Emergency["status"]) => {
    if (status === "Reached") return "bg-success";
    if (["On Route", "Ambulance Dispatched"].includes(status)) return "bg-warning";
    return "bg-trust";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Volunteer Dashboard</h1>
          <p className="text-muted-foreground">Active emergency missions and ambulance coordination</p>
        </div>

        {emergencies.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <Ambulance className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No Active Missions</h3>
              <p className="text-muted-foreground">
                All clear! You'll be notified when an emergency is assigned.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {emergencies.map((emergency) => (
              <motion.div
                key={emergency.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="border-2 hover:border-primary transition-colors">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-1">{emergency.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">Mission ID: {emergency.id}</p>
                      </div>
                      <Badge className={getStatusColor(emergency.status)}>
                        {emergency.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">{getProgressValue(emergency.status)}%</span>
                      </div>
                      <Progress value={getProgressValue(emergency.status)} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-emergency/10 rounded">
                          <MapPin className="h-4 w-4 text-emergency" />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Location</p>
                          <p className="font-medium">{emergency.location}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-trust/10 rounded">
                          <Clock className="h-4 w-4 text-trust" />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Alert Time</p>
                          <p className="font-medium">{emergency.time}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 col-span-2">
                        <div className="p-2 bg-warning/10 rounded">
                          <Phone className="h-4 w-4 text-warning" />
                        </div>
                        <div>
                          <p className="text-muted-foreground">Contact</p>
                          <p className="font-medium">{emergency.phone || "Not provided"}</p>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      {emergency.status === "Ambulance Assigned" && (
                        <Button
                          className="w-full"
                          onClick={() => updateStatus(emergency.id, "On Route")}
                        >
                          Start Journey
                        </Button>
                      )}
                      {(emergency.status === "Ambulance Dispatched" || emergency.status === "On Route") && (
                        <Button
                          className="w-full"
                          onClick={() => updateStatus(emergency.id, "Reached")}
                        >
                          Mark as Reached
                        </Button>
                      )}
                      {emergency.status === "Reached" && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => updateStatus(emergency.id, "Complete")}
                        >
                          Complete Mission
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
