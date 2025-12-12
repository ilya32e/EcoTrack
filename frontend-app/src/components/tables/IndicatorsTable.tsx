import { format } from "date-fns";
import { fr } from "date-fns/locale";

import type { Indicator } from "../../types";

type Props = {
  data: Indicator[];
};

export const IndicatorsTable = ({ data }: Props) => (
  <div className="overflow-hidden rounded-2xl border border-slate-800">
    <table className="min-w-full divide-y divide-slate-800">
      <thead className="bg-slate-900/80 text-left text-xs uppercase tracking-wide text-slate-400">
        <tr>
          <th className="px-4 py-3">Type</th>
          <th className="px-4 py-3">Valeur</th>
          <th className="px-4 py-3">Zone</th>
          <th className="px-4 py-3">Source</th>
          <th className="px-4 py-3">Horodatage</th>
        </tr>
      </thead>
      <tbody className="divide-y divide-slate-800 text-sm">
        {data.map((indicator) => (
          <tr key={indicator.id} className="hover:bg-slate-900/40">
            <td className="px-4 py-3 font-semibold text-slate-100">{indicator.type}</td>
            <td className="px-4 py-3">
              <span className="font-semibold text-brand-light">
                {indicator.value.toFixed(2)} {indicator.unit}
              </span>
            </td>
            <td className="px-4 py-3">{indicator.zone?.name ?? `#${indicator.zone_id}`}</td>
            <td className="px-4 py-3">{indicator.source?.name ?? "N/A"}</td>
            <td className="px-4 py-3 text-slate-400">
              {format(new Date(indicator.timestamp), "dd MMM yyyy HH:mm", { locale: fr })}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

