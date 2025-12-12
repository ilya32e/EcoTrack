import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "./App";
import { DashboardPage } from "./pages/Dashboard";
import { DebugPage } from "./pages/Debug";
import { IndicatorsPage } from "./pages/Indicators";
import { StatsPage } from "./pages/Stats";
import { UsersPage } from "./pages/Users";
import { ZonesPage } from "./pages/Zones";
import { SourcesPage } from "./pages/Sources";
import { LoginPage } from "./pages/Login";
import { RequireAuth } from "./components/layout/RequireAuth";
import { RequireAdmin } from "./components/layout/RequireAdmin";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />
  },
  {
    path: "/debug",
    element: <DebugPage />
  },
  {
    path: "/",
    element: (
      <RequireAuth>
        <AppShell />
      </RequireAuth>
    ),
    children: [
      { index: true, element: <DashboardPage /> },
      { path: "indicators", element: <IndicatorsPage /> },
      { path: "stats", element: <StatsPage /> },
      {
        path: "users",
        element: (
          <RequireAdmin>
            <UsersPage />
          </RequireAdmin>
        )
      },
      {
        path: "zones",
        element: (
          <RequireAdmin>
            <ZonesPage />
          </RequireAdmin>
        )
      },
      {
        path: "sources",
        element: (
          <RequireAdmin>
            <SourcesPage />
          </RequireAdmin>
        )
      },
      { path: "*", element: <Navigate to="/" replace /> }
    ]
  }
]);

