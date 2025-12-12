import { Link } from "react-router-dom";
import {
  ChartLine,
  Database,
  Gauge,
  Layers,
  MapPin,
  Users
} from "lucide-react";
import clsx from "classnames";
import { useAuth } from "../../context/AuthProvider";

type SidebarProps = {
  currentPath: string;
};

const links = [
  { to: "/", label: "Dashboard", icon: Gauge, adminOnly: false },
  { to: "/indicators", label: "Indicateurs", icon: Database, adminOnly: false },
  { to: "/stats", label: "Statistiques", icon: ChartLine, adminOnly: false },
  { to: "/users", label: "Utilisateurs", icon: Users, adminOnly: true },
  { to: "/zones", label: "Zones", icon: MapPin, adminOnly: true },
  { to: "/sources", label: "Sources", icon: Layers, adminOnly: true }
];

export const Sidebar = ({ currentPath }: SidebarProps) => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <aside className="hidden lg:flex w-72 flex-col border-r border-white/5 bg-black/40 backdrop-blur-2xl">
      <div className="px-6 py-6 border-b border-white/5">
        <p className="text-xl font-bold tracking-tight text-white">EcoTrack</p>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Monitoring</p>
      </div>
      <nav className="flex-1 space-y-1 px-4 py-6">
        {links.map(({ to, label, icon: Icon, adminOnly }) => {
          if (adminOnly && !isAdmin) return null;

          const active = currentPath === to || currentPath.startsWith(`${to}/`);
          return (
            <Link
              key={to}
              to={to}
              className={clsx(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-300",
                active
                  ? "bg-white/10 text-white shadow-lg shadow-black/20 ring-1 ring-white/10 backdrop-blur-sm"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              )}
            >
              <Icon size={18} className={clsx("transition-transform duration-300", active && "scale-110")} />
              {label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
};

