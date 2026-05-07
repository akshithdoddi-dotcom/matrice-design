import { Panel } from "../shared/Panel";
import { MapPin } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

export const ZoneHeatmapPanel = ({ terminology }: Props) => {
  return (
    <Panel
      title={`Zone Overview — ${terminology.primaryMetricLabel}`}
      icon={MapPin}
      info="Compliance rate and violation count per zone. Red pulsing border = high-risk zone."
    >
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
        {ZONE_DATA.map((zone) => {
          const isHighRisk = zone.status === "HIGH_RISK";
          const isWatch = zone.status === "WATCH" || zone.status === "AMBER";
          const bgColor =
            isHighRisk
              ? "bg-red-50 border-red-300"
              : zone.compliance_pct >= 90
              ? "bg-emerald-50 border-emerald-200"
              : "bg-amber-50 border-amber-200";
          const rateColor =
            isHighRisk
              ? "text-red-600"
              : zone.compliance_pct >= 90
              ? "text-emerald-600"
              : "text-amber-600";

          return (
            <div
              key={zone.zone_id}
              className={cn(
                "rounded-[4px] border p-3 flex flex-col gap-1.5 transition-all",
                bgColor,
                isHighRisk && "animate-pulse border-2"
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
              <p className={cn("text-2xl font-black tabular-nums font-data", rateColor)}>
                {zone.compliance_pct.toFixed(1)}%
              </p>
              <p className="text-[10px] text-neutral-500">
                {zone.violation_count} {terminology.negativeEventLabel.toLowerCase()}s
              </p>
              <p className="text-[10px] text-neutral-400 truncate">
                Top: {zone.top_violation_type}
              </p>
              <div className="flex items-center gap-1">
                <span
                  className={cn(
                    "text-[9px] font-bold px-1.5 py-0.5 rounded-full",
                    isHighRisk
                      ? "bg-red-100 text-red-700"
                      : zone.compliance_pct >= 90
                      ? "bg-emerald-100 text-emerald-700"
                      : "bg-amber-100 text-amber-700"
                  )}
                >
                  {isHighRisk ? "HIGH RISK" : zone.compliance_pct >= 90 ? "NORMAL" : "WATCH"}
                </span>
                {zone.trend === "up" && (
                  <span className="text-[9px] text-emerald-600 font-bold">↑ {zone.trend_delta_pct}%</span>
                )}
                {zone.trend === "down" && (
                  <span className="text-[9px] text-red-500 font-bold">↓ {Math.abs(zone.trend_delta_pct)}%</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </Panel>
  );
};
