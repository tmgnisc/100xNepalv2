import { useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Map, Building2, Settings, Siren } from "lucide-react";

// Fix for Leaflet default icon issue in React
import L from "leaflet";
import icon from "leaflet/dist/images/marker-icon.png";
import iconShadow from "leaflet/dist/images/marker-shadow.png";

const DefaultIcon = new Icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Blue marker icon
const BlueIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#3b82f6" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Tamaghat area, Kavrepalanchowk coordinates (hilly region)
const TAMAGHAT_CENTER: [number, number] = [27.6500, 85.4500];

// Static markers within Tamaghat area - all blue markers
const staticMarkers = [
  {
    id: "m1",
    position: [27.6510, 85.4515] as [number, number],
    name: "Tamaghat Health Center",
    type: "Healthcare Center",
    status: "Active",
    description: "Primary healthcare facility serving Tamaghat area",
  },
  {
    id: "m2",
    position: [27.6480, 85.4480] as [number, number],
    name: "Tamaghat Emergency Response Unit",
    type: "Emergency Service",
    status: "On Standby",
    description: "24/7 emergency response team for Tamaghat",
  },
  {
    id: "m3",
    position: [27.6525, 85.4530] as [number, number],
    name: "Tamaghat Health Post",
    type: "Health Post",
    status: "Active",
    description: "Community health post in Tamaghat central area",
  },
  {
    id: "m4",
    position: [27.6460, 85.4520] as [number, number],
    name: "Tamaghat Ward Clinic",
    type: "Ward Clinic",
    status: "Active",
    description: "Ward-level healthcare facility in Tamaghat",
  },
  {
    id: "m5",
    position: [27.6495, 85.4465] as [number, number],
    name: "Tamaghat Emergency Service",
    type: "Emergency Service",
    status: "Active",
    description: "Emergency coordination center for Tamaghat area",
  },
  {
    id: "m6",
    position: [27.6530, 85.4495] as [number, number],
    name: "Tamaghat Health Outpost",
    type: "Health Outpost",
    status: "Active",
    description: "Health monitoring outpost in Tamaghat region",
  },
  {
    id: "m7",
    position: [27.6475, 85.4540] as [number, number],
    name: "Tamaghat Community Health Center",
    type: "Community Health Center",
    status: "Active",
    description: "Serving Tamaghat community healthcare needs",
  },
  {
    id: "m8",
    position: [27.6505, 85.4475] as [number, number],
    name: "Tamaghat Ambulance Station",
    type: "Ambulance Service",
    status: "Active",
    description: "Ambulance service point for Tamaghat area",
  },
];

export default function MunicipalityMap() {
  const location = useLocation();

  // Set default icon for Leaflet
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

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
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="mb-4">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Tamaghat Area Map</h1>
              <p className="text-muted-foreground">Kavrepalanchowk District - Healthcare & Emergency Services</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Tamaghat Area Map</CardTitle>
                <div className="flex gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>Healthcare & Emergency Services</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[70vh] rounded overflow-hidden border">
                  <MapContainer 
                    center={TAMAGHAT_CENTER} 
                    zoom={13} 
                    style={{ height: "100%", width: "100%", zIndex: 0 }}
                    scrollWheelZoom={true}
                  >
                    {/* Default Leaflet (OpenStreetMap) standard view */}
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      maxZoom={19}
                    />
                    {staticMarkers.map((marker) => (
                      <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={BlueIcon}
                      >
                        <Popup>
                          <div className="space-y-2 min-w-[200px]">
                            <div className="font-bold text-base">{marker.name}</div>
                            <div className="text-sm font-medium text-muted-foreground">{marker.type}</div>
                            <div className="text-xs text-muted-foreground">{marker.description}</div>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                                {marker.status}
                              </span>
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    ))}
                  </MapContainer>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}


