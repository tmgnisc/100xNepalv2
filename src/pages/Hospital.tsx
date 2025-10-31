import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Building2, Bed, Stethoscope, Ambulance } from "lucide-react";
import { Emergency } from "@/types/emergency";
import { getEmergenciesFromStorage, saveEmergenciesToStorage, mockHospitals } from "@/lib/mockData";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Hospital() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const hospital = mockHospitals[0];

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(loadEmergencies, 3000);
    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = () => {
    const data = getEmergenciesFromStorage();
    const relevant = data.filter(e => ["Forwarded", "Received", "Ambulance Dispatched", "Treated"].includes(e.status));
    setEmergencies(relevant);
  };

  const updateStatus = (id: string, newStatus: Emergency["status"]) => {
    const all = getEmergenciesFromStorage();
    const updated = all.map(e => e.id === id ? { ...e, status: newStatus } : e);
    saveEmergenciesToStorage(updated);
    setEmergencies(updated.filter(e => ["Forwarded", "Received", "Ambulance Dispatched", "Treated"].includes(e.status)));
    toast.success("Status Updated", {
      description: `Patient ${id} marked as ${newStatus}`,
    });
  };

  const getReadinessColor = (readiness: string) => {
    if (readiness === "high") return "text-success";
    if (readiness === "medium") return "text-warning";
    return "text-emergency";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{hospital.name}</h1>
          <p className="text-muted-foreground">Patient intake and resource management</p>
        </div>

        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Available Beds</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-trust/10 rounded-lg">
                  <Bed className="h-5 w-5 text-trust" />
                </div>
                <div className="text-2xl font-bold">{hospital.beds}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Doctors On Duty</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <Stethoscope className="h-5 w-5 text-success" />
                </div>
                <div className="text-2xl font-bold">{hospital.doctors}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Ambulances</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Ambulance className="h-5 w-5 text-warning" />
                </div>
                <div className="text-2xl font-bold">{hospital.ambulances}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Readiness Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emergency/10 rounded-lg">
                  <Building2 className="h-5 w-5 text-emergency" />
                </div>
                <div className={`text-2xl font-bold uppercase ${getReadinessColor(hospital.readiness)}`}>
                  {hospital.readiness}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Incoming Patient Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Patient</TableHead>
                    <TableHead>Emergency Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emergencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        No incoming requests at the moment
                      </TableCell>
                    </TableRow>
                  ) : (
                    emergencies.map((emergency) => (
                      <TableRow key={emergency.id}>
                        <TableCell className="font-mono text-sm">{emergency.id}</TableCell>
                        <TableCell className="font-medium">{emergency.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="bg-emergency/10">
                            {emergency.type}
                          </Badge>
                        </TableCell>
                        <TableCell>{emergency.location}</TableCell>
                        <TableCell>
                          <Badge>{emergency.status}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {emergency.status === "Forwarded" && (
                              <Button
                                size="sm"
                                onClick={() => updateStatus(emergency.id, "Received")}
                              >
                                Accept
                              </Button>
                            )}
                            {emergency.status === "Received" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(emergency.id, "Ambulance Dispatched")}
                              >
                                Dispatch Ambulance
                              </Button>
                            )}
                            {emergency.status === "Ambulance Dispatched" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(emergency.id, "Treated")}
                              >
                                Mark Treated
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
