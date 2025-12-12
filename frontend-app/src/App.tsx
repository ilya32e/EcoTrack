import { Outlet, useLocation } from "react-router-dom";

import { Sidebar } from "./components/layout/Sidebar";
import { Topbar } from "./components/layout/Topbar";

export const AppShell = () => {
  const location = useLocation();

  return (
    <div className="flex min-h-screen bg-transparent text-gray-100 font-sans selection:bg-brand selection:text-white">
      <Sidebar currentPath={location.pathname} />
      <main className="flex flex-1 flex-col relative overflow-hidden">
        <Topbar />
        <div className="flex-1 overflow-y-auto px-8 py-6 scrollbar-hide animate-fade-in">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

