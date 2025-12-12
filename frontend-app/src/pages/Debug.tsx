import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthProvider";
import { apiClient } from "../services/api";
import { Card } from "../components/ui/Card";

export const DebugPage = () => {
  const { token, user } = useAuth();
  const [apiStatus, setApiStatus] = useState<"checking" | "ok" | "error">("checking");
  const [apiError, setApiError] = useState<string>("");
  const [testResults, setTestResults] = useState<Record<string, any>>({});

  useEffect(() => {
    const runTests = async () => {
      const results: Record<string, any> = {};

      // Test 1: Health check
      try {
        const response = await apiClient.get("/health/", {
          baseURL: apiClient.defaults.baseURL?.replace("/api/v1", "") || "http://127.0.0.1:8000"
        });
        results.health = { status: "ok", data: response.data };
        setApiStatus("ok");
      } catch (error: any) {
        results.health = { status: "error", error: error.message };
        setApiStatus("error");
        setApiError(error.message);
      }

      // Test 2: Current user endpoint
      try {
        const response = await apiClient.get("/users/me/");
        results.me = { status: "ok", data: response.data };
      } catch (error: any) {
        results.me = { status: "error", error: error.response?.data || error.message };
      }

      // Test 3: List users
      try {
        const response = await apiClient.get("/users/");
        results.users = { status: "ok", count: response.data?.length };
      } catch (error: any) {
        results.users = { status: "error", error: error.response?.data || error.message };
      }

      // Test 4: List zones
      try {
        const response = await apiClient.get("/zones/");
        results.zones = { status: "ok", count: response.data?.length };
      } catch (error: any) {
        results.zones = { status: "error", error: error.response?.data || error.message };
      }

      setTestResults(results);
    };

    runTests();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-semibold">Debug Panel</h1>
        <p className="text-sm text-slate-400">Diagnostic d'état de l'application</p>
      </div>

      {/* Authentication Status */}
      <Card title="État d'Authentification">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-slate-400">Token présent:</p>
            <p className={token ? "text-green-400" : "text-red-400"}>
              {token ? "✅ Oui" : "❌ Non"}
            </p>
          </div>
          {token && (
            <div>
              <p className="text-slate-400">Token (premiers 50 caractères):</p>
              <p className="font-mono text-xs bg-slate-900 p-2 rounded break-all text-slate-300">
                {token.substring(0, 50)}...
              </p>
            </div>
          )}
          <div>
            <p className="text-slate-400">Utilisateur connecté:</p>
            <p className={user ? "text-green-400" : "text-red-400"}>
              {user ? `✅ ${user.email} (${user.role})` : "❌ Non identifié"}
            </p>
          </div>
        </div>
      </Card>

      {/* API Configuration */}
      <Card title="Configuration API">
        <div className="space-y-2 text-sm">
          <div>
            <p className="text-slate-400">URL de base:</p>
            <p className="font-mono text-xs bg-slate-900 p-2 rounded text-slate-300">
              {apiClient.defaults.baseURL}
            </p>
          </div>
          <div>
            <p className="text-slate-400">Authorization Header:</p>
            <p className={apiClient.defaults.headers.common.Authorization ? "text-green-400" : "text-red-400"}>
              {apiClient.defaults.headers.common.Authorization ? "✅ Configuré" : "❌ Non configuré"}
            </p>
          </div>
        </div>
      </Card>

      {/* API Status */}
      <Card title="État du Serveur API">
        <div className="space-y-3 text-sm">
          <div className={`p-3 rounded-lg ${
            apiStatus === "ok" ? "bg-green-500/10 text-green-400" :
            apiStatus === "error" ? "bg-red-500/10 text-red-400" :
            "bg-blue-500/10 text-blue-400"
          }`}>
            {apiStatus === "checking" && "🔄 Vérification..."}
            {apiStatus === "ok" && "✅ Serveur API accessible"}
            {apiStatus === "error" && `❌ Erreur: ${apiError}`}
          </div>
        </div>
      </Card>

      {/* Endpoint Tests */}
      <Card title="Tests d'Endpoints">
        <div className="space-y-3 text-sm">
          {Object.entries(testResults).map(([endpoint, result]: [string, any]) => (
            <div key={endpoint} className="border-l-2 border-slate-700 pl-3 py-1">
              <p className="font-semibold capitalize text-slate-200">
                GET /{endpoint}
              </p>
              {result.status === "ok" ? (
                <p className="text-green-400">
                  ✅ OK
                  {result.count !== undefined && ` (${result.count} items)`}
                  {result.data && ` - ${JSON.stringify(result.data).substring(0, 50)}...`}
                </p>
              ) : (
                <p className="text-red-400">
                  ❌ Erreur: {typeof result.error === "string" ? result.error : JSON.stringify(result.error)}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* LocalStorage Info */}
      <Card title="localStorage (ecotrack_auth)">
        <pre className="text-xs bg-slate-900 p-3 rounded overflow-auto max-h-48 text-slate-300">
          {JSON.stringify(
            localStorage.getItem("ecotrack_auth")
              ? JSON.parse(localStorage.getItem("ecotrack_auth") || "{}")
              : "Vide",
            null,
            2
          )}
        </pre>
      </Card>

      {/* Quick Actions */}
      <Card title="Actions Rapides">
        <div className="space-y-2">
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            className="w-full px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm"
          >
            🗑️ Vider localStorage et recharger
          </button>
          <button
            onClick={() => window.location.reload()}
            className="w-full px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm"
          >
            🔄 Recharger la page
          </button>
          <button
            onClick={() => window.location.href = "/login"}
            className="w-full px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg text-sm"
          >
            🔐 Aller à la page de connexion
          </button>
        </div>
      </Card>
    </div>
  );
};
