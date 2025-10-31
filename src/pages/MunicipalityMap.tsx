import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Map, Building2, Settings, Siren } from "lucide-react";
import { Emergency } from "@/types/emergency";
import { API_ENDPOINTS, apiRequest } from "@/lib/api";

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

// Red marker icon for emergency alerts
const RedIcon = new Icon({
  iconUrl: "data:image/svg+xml;base64," + btoa(`
    <svg xmlns="http://www.w3.org/2000/svg" width="25" height="41" viewBox="0 0 25 41">
      <path fill="#ef4444" d="M12.5 0C5.6 0 0 5.6 0 12.5c0 8.5 12.5 28.5 12.5 28.5S25 21 25 12.5C25 5.6 19.4 0 12.5 0z"/>
      <circle fill="white" cx="12.5" cy="12.5" r="5"/>
    </svg>
  `),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// Tamaghat area, Kavrepalanchowk coordinates (hilly region)
const TAMAGHAT_CENTER: [number, number] = [27.6500, 85.4500];

// IoT Device markers within Tamaghat area - all blue markers
const staticMarkers = [
  {
    id: "iot-001",
    position: [27.6510, 85.4515] as [number, number],
    name: "IoT Device IOT-001",
    type: "Emergency Detection Sensor",
    status: "Online",
    description: "IoT sensor monitoring emergency alerts in Tamaghat area",
  },
  {
    id: "iot-002",
    position: [27.6480, 85.4480] as [number, number],
    name: "IoT Device IOT-002",
    type: "SOS Alert Node",
    status: "Online",
    description: "IoT device for receiving and transmitting emergency SOS signals",
  },
  {
    id: "iot-003",
    position: [27.6525, 85.4530] as [number, number],
    name: "IoT Device IOT-003",
    type: "Monitoring Station",
    status: "Online",
    description: "IoT monitoring station tracking emergency events in real-time",
  },
  {
    id: "iot-004",
    position: [27.6460, 85.4520] as [number, number],
    name: "IoT Device IOT-004",
    type: "Emergency Sensor Node",
    status: "Online",
    description: "IoT sensor node detecting and reporting emergency incidents",
  },
  {
    id: "iot-005",
    position: [27.6495, 85.4465] as [number, number],
    name: "IoT Device IOT-005",
    type: "Alert Transmission Unit",
    status: "Online",
    description: "IoT device for emergency alert transmission and coordination",
  },
  {
    id: "iot-006",
    position: [27.6530, 85.4495] as [number, number],
    name: "IoT Device IOT-006",
    type: "Emergency Monitoring Device",
    status: "Online",
    description: "IoT monitoring device tracking emergency situations in region",
  },
  {
    id: "iot-007",
    position: [27.6475, 85.4540] as [number, number],
    name: "IoT Device IOT-007",
    type: "Sensor Node",
    status: "Online",
    description: "IoT sensor node for continuous emergency detection and reporting",
  },
  {
    id: "iot-008",
    position: [27.6505, 85.4475] as [number, number],
    name: "IoT Device IOT-008",
    type: "Emergency Detection Device",
    status: "Online",
    description: "IoT device for detecting and reporting emergency incidents",
  },
];

// The IoT device that triggers SOS alerts (always the first one)
const SOS_TRIGGER_DEVICE_ID = "iot-001";

export default function MunicipalityMap() {
  const location = useLocation();
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);

  // Set default icon for Leaflet
  useEffect(() => {
    L.Marker.prototype.options.icon = DefaultIcon;
  }, []);

  // Fetch emergencies and check if any are pending
  useEffect(() => {
    const loadEmergencies = async () => {
      try {
        const data = await apiRequest<Emergency[]>(API_ENDPOINTS.emergencies);
        setEmergencies(data);
      } catch (error) {
        console.error("Failed to load emergencies:", error);
      }
    };

    loadEmergencies();
    // Poll every 3 seconds
    const interval = setInterval(loadEmergencies, 3000);
    return () => clearInterval(interval);
  }, []);

  // Check if there are active/pending emergencies
  const hasActiveEmergency = useMemo(() => {
    return emergencies.some(e => !["Resolved", "Complete", "Treated"].includes(e.status));
  }, [emergencies]);

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
              <p className="text-muted-foreground">Kavrepalanchowk District - IoT Device Locations</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>IoT Device Network Map</CardTitle>
                <div className="flex gap-4 mt-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-blue-500"></div>
                    <span>IoT Emergency Detection Devices</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-red-500 animate-pulse"></div>
                    <span>Active SOS Alert (IOT-001)</span>
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
                    {staticMarkers.map((marker) => {
                      // IOT-001 turns red when there's an active emergency
                      const isSOSTrigger = marker.id === SOS_TRIGGER_DEVICE_ID;
                      const hasActiveAlert = isSOSTrigger && hasActiveEmergency;
                      // Show red icon when active, blue when resolved
                      const iconToUse = hasActiveAlert ? RedIcon : BlueIcon;
                      
                      return (
                        <Marker
                          key={marker.id}
                          position={marker.position}
                          icon={iconToUse}
                        >
                          <Popup>
                            <div className="space-y-2 min-w-[200px]">
                              <div className="font-bold text-base">{marker.name}</div>
                              <div className="text-sm font-medium text-muted-foreground">{marker.type}</div>
                              <div className="text-xs text-muted-foreground">{marker.description}</div>
                              {hasActiveAlert && (
                                <div className="text-xs text-red-600 font-semibold mt-1">
                                  🚨 SOS Alert Active
                                </div>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded ${
                                  hasActiveAlert
                                    ? "bg-red-100 text-red-700" 
                                    : "bg-blue-100 text-blue-700"
                                }`}>
                                  {hasActiveAlert ? "Alert Triggered" : marker.status}
                                </span>
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      );
                    })}
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


