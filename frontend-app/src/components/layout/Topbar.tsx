import { CalendarDays, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "../../context/AuthProvider";

export const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="flex items-center justify-between border-b border-white/5 bg-transparent px-8 py-6">
      <div>
        <p className="text-2xl font-bold tracking-tight text-white mb-1">Bonjour, {user?.email?.split('@')[0] ?? "Utilisateur"}</p>
        <p className="text-sm font-medium text-gray-500">Aperçu en temps réel de vos indicateurs</p>
      </div>
      <div className="flex items-center gap-4 text-sm text-gray-400">
        <span className="hidden md:flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/5 backdrop-blur-md">
          <CalendarDays size={16} className="text-brand" />
          {new Date().toLocaleDateString("fr-FR", {
            weekday: "long",
            day: "numeric",
            month: "long"
          })}
        </span>
        <button
          className="inline-flex items-center gap-2 rounded-full bg-white/5 border border-white/5 px-4 py-2 text-white hover:bg-white/10 transition-colors backdrop-blur-md"
          onClick={() => {
            logout();
            navigate("/login");
          }}
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </header>
  );
};

