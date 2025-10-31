import { Link, useLocation } from "react-router-dom";
import { Activity, Home, Users, Building2, Ambulance, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const navLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/rural", label: "Rural SOS", icon: Activity },
  { to: "/municipality", label: "Municipality", icon: Users },
  { to: "/hospital", label: "Hospital", icon: Building2 },
  { to: "/volunteer", label: "Volunteer", icon: Ambulance },
  { to: "/about", label: "About", icon: Info },
];

export default function Navbar() {
  const location = useLocation();

  return (
    <nav className="border-b bg-card sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2 font-bold text-xl">
            <Activity className="h-6 w-6 text-emergency" />
            <span className="bg-gradient-to-r from-emergency to-trust bg-clip-text text-transparent">
              AarogyaConnect
            </span>
          </Link>
          
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-md transition-colors text-sm font-medium",
                  location.pathname === to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {label}
              </Link>
            ))}
          </div>

          <div className="md:hidden flex items-center gap-2">
            {navLinks.slice(1, 5).map(({ to, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  location.pathname === to
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted"
                )}
              >
                <Icon className="h-5 w-5" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
}
