import { useState } from "react";
import { Panel } from "../shared/Panel";
import { StatusBadge } from "../shared/StatusBadge";
import type { Severity } from "../shared/StatusBadge";
import { Map } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { ZoneMetric, QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface Props {
  terminology: QualityTerminology;
}

type SortKey = keyof ZoneMetric;

export const ZonePerformanceTable = ({ terminology }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("compliance_pct");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...ZONE_DATA].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    if (typeof av === "number" && typeof bv === "number") {
      return sortAsc ? av - bv : bv - av;
    }
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button onClick={() => handleSort(col)} className="ml-1 hover:text-neutral-600 transition-colors">
      {sortKey === col ? (
        sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />
      ) : (
        <Minus className="w-3 h-3 inline opacity-30" />
      )}
    </button>
  );

  const rowBg = (status: ZoneMetric["status"]) => {
    if (status === "HIGH_RISK") return "bg-red-50";
    if (status === "WATCH" || status === "AMBER") return "bg-amber-50";
    return "";
  };

  const compColor = (pct: number) =>
    pct >= 90 ? "text-emerald-600" : pct >= 80 ? "text-amber-600" : "text-red-600";

  return (
    <Panel
      title="Zone Performance"
      icon={Map}
      info="Sortable table of zone compliance, violations, and risk status."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {[
                { label: "Zone", col: "zone_name" as SortKey },
                { label: `${terminology.primaryMetricLabel}`, col: "compliance_pct" as SortKey },
                { label: terminology.negativeCountLabel, col: "violation_count" as SortKey },
                { label: `Top ${terminology.negativeEventLabel}`, col: "top_violation_type" as SortKey },
                { label: "Peak Hour", col: "peak_violation_hour" as SortKey },
                { label: "Trend", col: "trend" as SortKey },
                { label: "Status", col: "status" as SortKey },
              ].map(({ label, col }) => (
                <th
                  key={col}
                  className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3 whitespace-nowrap cursor-pointer hover:text-neutral-600"
                  onClick={() => handleSort(col)}
                >
                  {label} <SortBtn col={col} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((zone) => (
              <tr
                key={zone.zone_id}
                className={cn("border-b border-neutral-50 transition-colors", rowBg(zone.status))}
              >
                <td className="py-2.5 pr-3 font-semibold text-neutral-700 whitespace-nowrap">
                  {zone.zone_name}
                </td>
                <td className={cn("py-2.5 pr-3 font-black tabular-nums font-data", compColor(zone.compliance_pct))}>
                  {zone.compliance_pct.toFixed(1)}%
                </td>
                <td className="py-2.5 pr-3 font-semibold text-neutral-700">{zone.violation_count}</td>
                <td className="py-2.5 pr-3 text-neutral-500">{zone.top_violation_type}</td>
                <td className="py-2.5 pr-3 text-neutral-500">{zone.peak_violation_hour}:00</td>
                <td className="py-2.5 pr-3">
                  {zone.trend === "up" && (
                    <span className="flex items-center gap-0.5 text-emerald-600 font-bold text-[10px]">
                      <ArrowUp className="w-3 h-3" /> +{zone.trend_delta_pct}%
                    </span>
                  )}
                  {zone.trend === "down" && (
                    <span className="flex items-center gap-0.5 text-red-500 font-bold text-[10px]">
                      <ArrowDown className="w-3 h-3" /> {zone.trend_delta_pct}%
                    </span>
                  )}
                  {zone.trend === "stable" && (
                    <span className="flex items-center gap-0.5 text-neutral-400 font-bold text-[10px]">
                      <Minus className="w-3 h-3" /> {zone.trend_delta_pct}%
                    </span>
                  )}
                </td>
                <td className="py-2.5">
                  <StatusBadge severity={zone.status as Severity} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
