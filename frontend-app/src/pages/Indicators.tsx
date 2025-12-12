import { useState } from "react";
import { Plus } from "lucide-react";

import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { IndicatorsTable } from "../components/tables/IndicatorsTable";
import { useIndicators } from "../hooks/useApi";

export const IndicatorsPage = () => {
  const [filters, setFilters] = useState<{ type?: string; zone_id?: number }>({});
  const { data, isLoading } = useIndicators({
    ...filters,
    limit: 50
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Indicateurs</h1>
          <p className="text-sm text-slate-400">
            Liste complète avec filtres avancés
          </p>
        </div>
        <Button>
          <Plus size={16} className="mr-2" />
          Ajouter
        </Button>
      </div>

      <Card title="Filtres">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm text-slate-400">Type</label>
            <input
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2"
              placeholder="pm25, co2..."
              value={filters.type ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, type: e.target.value || undefined }))
              }
            />
          </div>
          <div>
            <label className="text-sm text-slate-400">Zone ID</label>
            <input
              type="number"
              className="mt-1 w-full rounded-2xl border border-slate-800 bg-slate-950 px-3 py-2"
              value={filters.zone_id ?? ""}
              onChange={(e) =>
                setFilters((prev) => ({
                  ...prev,
                  zone_id: e.target.value ? Number(e.target.value) : undefined
                }))
              }
            />
          </div>
          <div className="flex items-end">
            <Button
              variant="ghost"
              className="w-full justify-center"
              onClick={() => setFilters({})}
            >
              Réinitialiser
            </Button>
          </div>
        </div>
      </Card>

      <Card title="Résultats">
        {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}
        {data && <IndicatorsTable data={data.items} />}
      </Card>
    </div>
  );
};

