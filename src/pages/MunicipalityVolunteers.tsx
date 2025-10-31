import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Users, Phone, MapPin, Ambulance, Plus, Edit, Trash2, Droplet } from "lucide-react";
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
import { LayoutGrid, Map, Settings, Siren } from "lucide-react";

interface Volunteer {
  id: string;
  name: string;
  phone: string;
  bloodGroup: string;
  ambulanceId?: string | null;
  status: "available" | "on-mission" | "offline";
  location?: {
    lat: number;
    lng: number;
  };
}

const BLOOD_GROUPS = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"];

type VolunteerFormData = Omit<Volunteer, "id">;

export default function MunicipalityVolunteers() {
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [formData, setFormData] = useState<VolunteerFormData>({
    name: "",
    phone: "",
    bloodGroup: "O+",
    ambulanceId: null,
    status: "available",
    location: {
      lat: 27.6500,
      lng: 85.4500,
    },
  });
  const location = useLocation();

  useEffect(() => {
    loadVolunteers();
    // Refresh every 5 seconds
    const interval = setInterval(loadVolunteers, 5000);
    return () => clearInterval(interval);
  }, []);

  const loadVolunteers = async () => {
    try {
      setLoading(true);
      const data = await apiRequest<Volunteer[]>(API_ENDPOINTS.volunteers);
      setVolunteers(data);
    } catch (error) {
      console.error("Failed to load volunteers:", error);
      toast.error("Failed to load volunteers", {
        description: "Please check if the backend server is running",
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: Volunteer["status"]) => {
    if (status === "available") return "bg-success";
    if (status === "on-mission") return "bg-warning";
    return "bg-muted";
  };

  const getStatusLabel = (status: Volunteer["status"]) => {
    if (status === "available") return "Available";
    if (status === "on-mission") return "On Mission";
    return "Offline";
  };

  const resetForm = () => {
    setFormData({
      name: "",
      phone: "",
      bloodGroup: "O+",
      ambulanceId: null,
      status: "available",
      location: {
        lat: 27.6500,
        lng: 85.4500,
      },
    });
    setEditingVolunteer(null);
  };

  const handleOpenDialog = (volunteer?: Volunteer) => {
    if (volunteer) {
      setEditingVolunteer(volunteer);
      setFormData({
        name: volunteer.name,
        phone: volunteer.phone,
        bloodGroup: volunteer.bloodGroup,
        ambulanceId: volunteer.ambulanceId || null,
        status: volunteer.status,
        location: volunteer.location || { lat: 27.6500, lng: 85.4500 },
      });
    } else {
      resetForm();
    }
    setIsDialogOpen(true);
  };

  const handleCreateVolunteer = async () => {
    try {
      const newVolunteer = {
        ...formData,
        id: `v${Date.now()}`,
      };

      await apiRequest(API_ENDPOINTS.volunteers, {
        method: "POST",
        body: JSON.stringify(newVolunteer),
      });

      toast.success("Volunteer Created", {
        description: `${newVolunteer.name} has been added successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadVolunteers();
    } catch (error) {
      console.error("Failed to create volunteer:", error);
      toast.error("Failed to create volunteer", {
        description: "Please try again later",
      });
    }
  };

  const handleUpdateVolunteer = async () => {
    if (!editingVolunteer) return;

    try {
      await apiRequest(`${API_ENDPOINTS.volunteers}/${editingVolunteer.id}`, {
        method: "PATCH",
        body: JSON.stringify(formData),
      });

      toast.success("Volunteer Updated", {
        description: `${formData.name} has been updated successfully`,
      });

      setIsDialogOpen(false);
      resetForm();
      loadVolunteers();
    } catch (error) {
      console.error("Failed to update volunteer:", error);
      toast.error("Failed to update volunteer", {
        description: "Please try again later",
      });
    }
  };

  const handleDeleteVolunteer = async (id: string, name: string) => {
    try {
      await apiRequest(`${API_ENDPOINTS.volunteers}/${id}`, {
        method: "DELETE",
      });

      toast.success("Volunteer Deleted", {
        description: `${name} has been removed successfully`,
      });

      loadVolunteers();
    } catch (error) {
      console.error("Failed to delete volunteer:", error);
      toast.error("Failed to delete volunteer", {
        description: "Please try again later",
      });
    }
  };

  const handleSubmit = () => {
    if (editingVolunteer) {
      handleUpdateVolunteer();
    } else {
      handleCreateVolunteer();
    }
  };

  const stats = {
    total: volunteers.length,
    available: volunteers.filter(v => v.status === "available").length,
    onMission: volunteers.filter(v => v.status === "on-mission").length,
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
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith("/municipality/map")}>
                    <Link to="/municipality/map">
                      <Map />
                      <span>Map</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton asChild isActive={location.pathname.startsWith("/municipality/volunteers")}>
                    <Link to="/municipality/volunteers">
                      <Users />
                      <span>Volunteers</span>
                    </Link>
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Volunteers Management</h1>
              <p className="text-muted-foreground">Manage volunteer network and ambulance drivers</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total Volunteers</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-trust/10 rounded-lg">
                      <Users className="h-6 w-6 text-trust" />
                    </div>
                    <div className="text-3xl font-bold">{stats.total}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-success/10 rounded-lg">
                      <Ambulance className="h-6 w-6 text-success" />
                    </div>
                    <div className="text-3xl font-bold">{stats.available}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-muted-foreground">On Mission</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-warning/10 rounded-lg">
                      <Ambulance className="h-6 w-6 text-warning" />
                    </div>
                    <div className="text-3xl font-bold">{stats.onMission}</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Volunteers List</CardTitle>
                <Dialog open={isDialogOpen} onOpenChange={(open) => {
                  setIsDialogOpen(open);
                  if (!open) resetForm();
                }}>
                  <DialogTrigger asChild>
                    <Button onClick={() => handleOpenDialog()}>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Volunteer
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                      <DialogTitle>
                        {editingVolunteer ? "Edit Volunteer" : "Add New Volunteer"}
                      </DialogTitle>
                      <DialogDescription>
                        {editingVolunteer
                          ? "Update volunteer information below."
                          : "Fill in the details to register a new volunteer."}
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid gap-2">
                        <Label htmlFor="name">Name *</Label>
                        <Input
                          id="name"
                          placeholder="Enter full name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="phone">Phone Number *</Label>
                        <Input
                          id="phone"
                          type="tel"
                          placeholder="98XXXXXXXX"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          required
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="bloodGroup">Blood Group *</Label>
                        <Select
                          value={formData.bloodGroup}
                          onValueChange={(value) => setFormData({ ...formData, bloodGroup: value })}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select blood group" />
                          </SelectTrigger>
                          <SelectContent>
                            {BLOOD_GROUPS.map((group) => (
                              <SelectItem key={group} value={group}>
                                {group}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="ambulanceId">Ambulance ID</Label>
                        <Input
                          id="ambulanceId"
                          placeholder="a1 (optional)"
                          value={formData.ambulanceId || ""}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              ambulanceId: e.target.value || null,
                            })
                          }
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="status">Status *</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) =>
                            setFormData({
                              ...formData,
                              status: value as Volunteer["status"],
                            })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="on-mission">On Mission</SelectItem>
                            <SelectItem value="offline">Offline</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => {
                        setIsDialogOpen(false);
                        resetForm();
                      }}>
                        Cancel
                      </Button>
                      <Button onClick={handleSubmit} disabled={!formData.name || !formData.phone}>
                        {editingVolunteer ? "Update" : "Create"}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Phone</TableHead>
                        <TableHead>Blood Group</TableHead>
                        <TableHead>Ambulance ID</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Location</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            Loading volunteers...
                          </TableCell>
                        </TableRow>
                      ) : volunteers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                            No volunteers registered yet
                          </TableCell>
                        </TableRow>
                      ) : (
                        volunteers.map((volunteer) => (
                          <TableRow key={volunteer.id}>
                            <TableCell className="font-mono text-sm">{volunteer.id}</TableCell>
                            <TableCell className="font-medium">{volunteer.name}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Phone className="h-3 w-3 text-muted-foreground" />
                                {volunteer.phone}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                                <Droplet className="h-3 w-3 mr-1" />
                                {volunteer.bloodGroup}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {volunteer.ambulanceId ? (
                                <div className="flex items-center gap-2">
                                  <Ambulance className="h-3 w-3 text-muted-foreground" />
                                  <span className="font-mono text-sm">{volunteer.ambulanceId}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <Badge className={getStatusColor(volunteer.status)}>
                                {getStatusLabel(volunteer.status)}
                              </Badge>
                            </TableCell>
                            <TableCell>
                              {volunteer.location ? (
                                <div className="flex items-center gap-2 text-xs">
                                  <MapPin className="h-3 w-3 text-muted-foreground" />
                                  <span>{volunteer.location.lat.toFixed(4)}, {volunteer.location.lng.toFixed(4)}</span>
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleOpenDialog(volunteer)}
                                >
                                  <Edit className="h-3 w-3" />
                                </Button>
                                <AlertDialog>
                                  <AlertDialogTrigger asChild>
                                    <Button size="sm" variant="outline" className="text-destructive">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </AlertDialogTrigger>
                                  <AlertDialogContent>
                                    <AlertDialogHeader>
                                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                      <AlertDialogDescription>
                                        This will permanently delete {volunteer.name} from the system.
                                        This action cannot be undone.
                                      </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                                      <AlertDialogAction
                                        onClick={() => handleDeleteVolunteer(volunteer.id, volunteer.name)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                      >
                                        Delete
                                      </AlertDialogAction>
                                    </AlertDialogFooter>
                                  </AlertDialogContent>
                                </AlertDialog>
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

