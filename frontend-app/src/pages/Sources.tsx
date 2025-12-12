import { BookMarked } from "lucide-react";

import { Card } from "../components/ui/Card";
import { useSources } from "../hooks/useApi";

export const SourcesPage = () => {
  const { data, isLoading } = useSources();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Sources</h1>
        <p className="text-sm text-slate-400">
          Liste des APIs / datasets intégrés
        </p>
      </div>

      <Card title="Catalogue">
        {isLoading && <p className="text-sm text-slate-400">Chargement...</p>}
        <div className="space-y-3">
          {data?.map((source) => (
            <div
              key={source.id}
              className="flex flex-col gap-2 rounded-2xl border border-slate-800 p-4"
            >
              <div className="flex items-center gap-2 text-lg font-semibold">
                <BookMarked size={18} className="text-brand-light" />
                {source.name}
              </div>
              <p className="text-sm text-slate-400">{source.description ?? "—"}</p>
              {source.url && (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs text-brand-light underline"
                >
                  {source.url}
                </a>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

