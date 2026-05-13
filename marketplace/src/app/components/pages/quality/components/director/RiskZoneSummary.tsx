import { ZONE_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";

interface Props {
  terminology: QualityTerminology;
}

const ACTION_TAGS: Record<string, string> = {
  "Zone C — Forklift Corridor": "Process audit",
  "Zone E — Chemical Bay": "Staffing review",
  "Zone B — Assembly": "Training recommended",
};

export const RiskZoneSummary = ({ terminology }: Props) => {
  const sorted = [...ZONE_DATA].sort((a, b) => a.compliance_pct - b.compliance_pct);

  return (
    <div>
      <h3 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500 mb-3 flex items-center gap-2">
        <span className="w-3.5 h-3.5 rounded-sm bg-[#00775B] inline-block" />
        {terminology.zoneRiskLabel} Summary
      </h3>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {sorted.map((zone) => {
          const isHighRisk = zone.status === "HIGH_RISK";
          const isWatch = zone.status === "AMBER";
          const action = ACTION_TAGS[zone.zone_name];

          return (
            <div
              key={zone.zone_id}
              className={cn(
                "bg-white rounded-[4px] border p-4 shadow-sm flex flex-col gap-2",
                isHighRisk ? "border-red-300" : isWatch ? "border-amber-200" : "border-neutral-100"
              )}
            >
              <div className="flex items-center justify-between">
                <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-500 truncate">
                  {zone.zone_name}
                </p>
                {isHighRisk && (
                  <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0" />
                )}
              </div>

              {/* Avg violation rate (compliance inverse) */}
              <p
                className={cn(
                  "text-2xl font-black tabular-nums font-data",
                  isHighRisk
                    ? "text-red-600"
                    : zone.compliance_pct >= 90
                    ? "text-emerald-600"
                    : "text-amber-600"
                )}
              >
                {zone.compliance_pct.toFixed(1)}%
              </p>
              <p className="text-[10px] text-neutral-400">{terminology.primaryMetricLabel}</p>

              {/* MoM trend */}
              <div className="flex items-center gap-1">
                {zone.trend === "up" && (
                  <span className="flex items-center gap-0.5 text-emerald-600 text-[10px] font-bold">
                    <ArrowUp className="w-3 h-3" /> +{zone.trend_delta_pct}% MoM
                  </span>
                )}
                {zone.trend === "down" && (
                  <span className="flex items-center gap-0.5 text-red-500 text-[10px] font-bold">
                    <ArrowDown className="w-3 h-3" /> {zone.trend_delta_pct}% MoM
                  </span>
                )}
                {zone.trend === "stable" && (
                  <span className="flex items-center gap-0.5 text-neutral-400 text-[10px] font-bold">
                    <Minus className="w-3 h-3" /> Stable
                  </span>
                )}
              </div>

              {/* Action tag for top 3 high-risk zones */}
              {action && (
                <div className="mt-1">
                  <span className="text-[9px] font-bold bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full">
                    {action}
                  </span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
