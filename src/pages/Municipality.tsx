import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, Building2, Ambulance, CheckCircle } from "lucide-react";
import { Emergency } from "@/types/emergency";
import { getEmergenciesFromStorage, saveEmergenciesToStorage, generateMockEmergency } from "@/lib/mockData";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function Municipality() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });

  useEffect(() => {
    loadEmergencies();
    const interval = setInterval(() => {
      const random = Math.random();
      if (random > 0.7) {
        const newEmergency = generateMockEmergency();
        const current = getEmergenciesFromStorage();
        const updated = [newEmergency, ...current];
        saveEmergenciesToStorage(updated);
        setEmergencies(updated);
        toast.info("New Emergency Alert", {
          description: `${newEmergency.type} - ${newEmergency.location}`,
        });
      }
    }, 20000);

    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = () => {
    const data = getEmergenciesFromStorage();
    setEmergencies(data);
    updateStats(data);
  };

  const updateStats = (data: Emergency[]) => {
    const active = data.filter(e => !["Resolved", "Complete", "Treated"].includes(e.status)).length;
    const resolved = data.filter(e => ["Resolved", "Complete", "Treated"].includes(e.status)).length;
    setStats({ active, resolved, total: data.length });
  };

  const updateStatus = (id: string, newStatus: Emergency["status"]) => {
    const updated = emergencies.map(e => e.id === id ? { ...e, status: newStatus } : e);
    setEmergencies(updated);
    saveEmergenciesToStorage(updated);
    updateStats(updated);
    toast.success("Status Updated", {
      description: `Emergency ${id} marked as ${newStatus}`,
    });
  };

  const getStatusColor = (status: Emergency["status"]) => {
    if (["Resolved", "Complete", "Treated"].includes(status)) return "bg-success";
    if (["On Route", "Ambulance Dispatched", "Forwarded"].includes(status)) return "bg-warning";
    return "bg-emergency";
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Municipality Dashboard</h1>
          <p className="text-muted-foreground">Real-time emergency coordination center</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Active Emergencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emergency/10 rounded-lg">
                  <AlertTriangle className="h-6 w-6 text-emergency" />
                </div>
                <div className="text-3xl font-bold">{stats.active}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Resolved Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-success/10 rounded-lg">
                  <CheckCircle className="h-6 w-6 text-success" />
                </div>
                <div className="text-3xl font-bold">{stats.resolved}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">Total Handled</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-trust/10 rounded-lg">
                  <Clock className="h-6 w-6 text-trust" />
                </div>
                <div className="text-3xl font-bold">{stats.total}</div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Emergency Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emergencies.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        No emergency alerts yet. System is monitoring...
                      </TableCell>
                    </TableRow>
                  ) : (
                    emergencies.map((emergency) => (
                      <TableRow key={emergency.id}>
                        <TableCell className="font-mono text-sm">{emergency.id}</TableCell>
                        <TableCell className="font-medium">{emergency.name}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{emergency.type}</Badge>
                        </TableCell>
                        <TableCell>{emergency.location}</TableCell>
                        <TableCell>{emergency.time}</TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(emergency.status)}>
                            {emergency.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {emergency.status === "Pending" && (
                              <>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(emergency.id, "Forwarded")}
                                >
                                  <Building2 className="h-3 w-3 mr-1" />
                                  Forward
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => updateStatus(emergency.id, "Ambulance Assigned")}
                                >
                                  <Ambulance className="h-3 w-3 mr-1" />
                                  Assign
                                </Button>
                              </>
                            )}
                            {!["Resolved", "Complete"].includes(emergency.status) && emergency.status !== "Pending" && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(emergency.id, "Resolved")}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Resolve
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
