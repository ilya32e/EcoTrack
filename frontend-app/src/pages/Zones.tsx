import { useState } from "react";
import { MapPinned } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { useCreateZone, useZones } from "../hooks/useApi";

export const ZonesPage = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, error } = useZones();
  const createZone = useCreateZone();
  const [form, setForm] = useState({
    name: "",
    postal_code: "",
    description: ""
  });

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await createZone.mutateAsync({
      name: form.name,
      postal_code: form.postal_code,
      description: form.description
    });
    await queryClient.invalidateQueries({ queryKey: ["zones"] });
    setForm({ name: "", postal_code: "", description: "" });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Zones géographiques</h1>
        <p className="text-sm text-slate-400">
          Cartographiez vos périmètres de suivi
        </p>
      </div>

      <Card title="Créer une zone">
        <form className="grid gap-4 md:grid-cols-3" onSubmit={handleSubmit}>
          <div>
            <label className="text-sm text-slate-400">Nom</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Code postal</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2"
              value={form.postal_code}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, postal_code: e.target.value }))
              }
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Description</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2"
              value={form.description}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, description: e.target.value }))
              }
            />
          </div>
          <div className="md:col-span-3 flex justify-end">
            <Button type="submit" className="w-full md:w-auto">
              Ajouter
            </Button>
          </div>
        </form>
      </Card>

      <Card title="Liste des zones">
        {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}
        {error && (
          <div className="rounded-lg bg-red-500/10 border border-red-500 p-3 text-red-400 text-sm">
            <p><strong>Erreur:</strong> {error instanceof Error ? error.message : "Impossible de charger les zones"}</p>
            <p className="text-xs mt-1">Vérifiez que le serveur API est en cours d'exécution et que vous êtes connecté.</p>
          </div>
        )}
        {!isLoading && !error && (!data || data.length === 0) && (
          <p className="text-sm text-slate-400">Aucune zone trouvée. Créez-en une pour commencer.</p>
        )}
        <div className="grid gap-4 md:grid-cols-2">
          {data?.map((zone) => (
            <div
              key={zone.id}
              className="rounded-2xl border border-slate-800 p-4"
            >
              <div className="flex items-center gap-2 font-semibold text-slate-100">
                <MapPinned size={18} />
                {zone.name}
              </div>
              <p className="text-xs text-slate-500">{zone.description ?? "—"}</p>
              <p className="text-sm text-slate-400 mt-2">
                {zone.postal_code ?? "Code postal inconnu"}
              </p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

