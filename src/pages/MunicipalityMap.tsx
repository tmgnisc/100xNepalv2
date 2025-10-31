import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { Icon } from "leaflet";
import "leaflet/dist/leaflet.css";
import { SidebarProvider, Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInset, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarRail, SidebarTrigger } from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import { LayoutGrid, Map, Building2, Settings, Siren } from "lucide-react";

export default function MunicipalityMap() {
  const [emergencies, setEmergencies] = useState<Emergency[]>([]);
  const location = useLocation();

  useEffect(() => {
    setEmergencies(getEmergenciesFromStorage());
  }, []);

  const center = useMemo(() => {
    if (emergencies.length > 0 && emergencies[0].lat && emergencies[0].lng) {
      return [emergencies[0].lat, emergencies[0].lng] as [number, number];
    }
    return [29.27, 82.19] as [number, number];
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
              <h1 className="text-3xl md:text-4xl font-bold mb-2">Emergency Map</h1>
              <p className="text-muted-foreground">Visualize active emergencies on the map</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Live Emergencies</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="w-full h-[70vh] rounded overflow-hidden">
                  <MapContainer center={center} zoom={10} style={{ height: "100%", width: "100%" }}>
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution="&copy; OpenStreetMap contributors"
                    />
                    {emergencies.filter(e => e.lat && e.lng).map((e) => (
                      <CircleMarker
                        key={e.id}
                        center={[e.lat as number, e.lng as number]}
                        radius={10}
                        pathOptions={{ color: "#ef4444", weight: 2, fillOpacity: 0.4 }}
                      >
                        <Popup>
                          <div className="space-y-1">
                            <div className="font-semibold">{e.type}</div>
                            <div className="text-sm">{e.name}</div>
                            <div className="text-xs text-muted-foreground">{e.location}</div>
                            <div className="text-xs">Status: {e.status}</div>
                          </div>
                        </Popup>
                      </CircleMarker>
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


