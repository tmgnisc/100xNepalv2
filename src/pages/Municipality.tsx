import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Clock, Building2, Ambulance, CheckCircle, Map, LayoutGrid, Settings, Siren } from "lucide-react";
import { Emergency } from "@/types/emergency";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "@/components/ui/sidebar";

export default function Municipality() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const [stats, setStats] = useState({ active: 0, resolved: 0, total: 0 });
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    loadEmergencies();
    // Poll for new emergencies every 5 seconds
    const interval = setInterval(loadEmergencies, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadEmergencies = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Emergency[]>(API_ENDPOINTS.emergencies);
      // Sort by ID (newest first - higher timestamp in ID)
      const sorted = data.sort((a, b) => {
        // Extract timestamp from ID if it exists (format: E{timestamp})
        const timestampA = parseInt(a.id.replace('E', '')) || 0;
        const timestampB = parseInt(b.id.replace('E', '')) || 0;
        return timestampB - timestampA;
      });
      setEmergencies(sorted);
      updateStats(sorted);
    } catch (error) {
      console.error("Failed to load emergencies:", error);
      toast.error("Failed to load emergencies", {
        description: "Please check if the backend server is running",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStats = (data: Emergency[]) => {
    const active = data.filter(e => !["Resolved", "Complete", "Treated"].includes(e.status)).length;
    const resolved = data.filter(e => ["Resolved", "Complete", "Treated"].includes(e.status)).length;
    setStats({ active, resolved, total: data.length });
  };

  const updateStatus = async (id: string, newStatus: Emergency["status"]) => {
    try {
      const emergency = emergencies.find(e => e.id === id);
      if (!emergency) return;

      const updatedEmergency = { ...emergency, status: newStatus };
      
      // Update in backend
      await apiRequest(`${API_ENDPOINTS.emergencies}/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ status: newStatus }),
      });

      // Update local state
      const updated = emergencies.map(e => e.id === id ? updatedEmergency : e);
      setEmergencies(updated);
      updateStats(updated);

      toast.success("Status Updated", {
        description: `Emergency ${id} marked as ${newStatus}`,
      });
    } catch (error) {
      console.error("Failed to update status:", error);
      toast.error("Failed to update status", {
        description: "Please try again later",
      });
    }
  };

  const getStatusColor = (status: Emergency["status"]) => {
    if (["Resolved", "Complete", "Treated"].includes(status)) return "bg-success";
    if (["On Route", "Ambulance Dispatched", "Forwarded"].includes(status)) return "bg-warning";
    return "bg-emergency";
  };

  return (
    <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader className="px-3 py-2">
          <div className="flex items-center gap-2 px-1 py-1.5 text-sm font-semibold">
            <Siren className="h-4 w-4 text-emergency" />
            Municipality
          </div>
          <SidebarTrigger className="ml-auto" />
        </SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname === "/municipality"}>
                    <Link to="/municipality">
                      <LayoutGrid />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith("/municipality/map") }>
                    <Link to="/municipality/map">
                      <Map />
                      <span>Map</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Building2 />
                    <span>Hospitals</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton disabled>
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
        <SidebarRail />
      </Sidebar>
      <SidebarInset>
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
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                        Loading emergencies...
                      </TableCell>
                    </TableRow>
                  ) : emergencies.length === 0 ? (
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
                            {!["Resolved", "Complete", "Treated"].includes(emergency.status) && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => updateStatus(emergency.id, "Resolved")}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Mark as Resolved
                              </Button>
                            )}
                            {["Resolved", "Complete", "Treated"].includes(emergency.status) && (
                              <span className="text-xs text-muted-foreground">Resolved</span>
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
      </SidebarInset>
    </SidebarProvider>
  );
}
