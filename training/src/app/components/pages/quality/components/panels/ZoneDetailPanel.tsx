import { MapPin, TrendingUp, TrendingDown, Minus, Clock, AlertTriangle } from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { QualityTerminology, ZoneMetric } from "../../data/types";
import { QualitySlidePanel } from "./QualitySlidePanel";
import { cn } from "@/app/lib/utils";

interface Props {
  zone: ZoneMetric | null;
  onClose: () => void;
  terminology: QualityTerminology;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b border-t border-neutral-100 bg-neutral-50 px-5 py-2">
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">{children}</p>
  </div>
);

export const ZoneDetailPanel = ({ zone, onClose, terminology }: Props) => {
  if (!zone) return null;

  const isHighRisk = zone.status === "HIGH_RISK";
  const isGood = zone.compliance_pct >= 90;
  const rateColor = isHighRisk ? "text-red-700" : isGood ? "text-emerald-700" : "text-amber-600";

  const zoneAlerts = ALERTS.filter(a => a.zone.includes(zone.zone_name.split(" — ")[0]));

  const statusBg = isHighRisk
    ? "bg-red-50 border-red-200 text-red-700"
    : isGood
    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
    : "bg-amber-50 border-amber-200 text-amber-700";
  const statusLabel = isHighRisk ? "HIGH RISK" : isGood ? "NORMAL" : "WATCH";

  return (
    <QualitySlidePanel
      isOpen={!!zone}
      onClose={onClose}
      title="Zone Detail"
      subtitle={zone.zone_name}
    >
      {/* Hero stats */}
      <div className="bg-white border-b border-neutral-100 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <MapPin className="w-4 h-4 text-neutral-400" />
              <span className="text-[12px] text-neutral-500">{zone.zone_name}</span>
              <span className={cn("inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase", statusBg)}>
                {statusLabel}
              </span>
            </div>
            <div className={cn("text-6xl font-black font-data tabular-nums leading-none mt-3", rateColor)}>
              {zone.compliance_pct.toFixed(1)}%
            </div>
            <div className="text-[12px] text-neutral-400 mt-1">{terminology.primaryMetricLabel}</div>
          </div>

          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-1">
              {terminology.negativeCountLabel}
            </div>
            <div className="text-4xl font-black font-data tabular-nums text-neutral-800">
              {zone.violation_count}
            </div>
            {zone.trend !== "stable" && (
              <div className={cn("flex items-center justify-end gap-1 mt-2 text-[12px] font-bold",
                zone.trend === "up" ? "text-emerald-600" : "text-red-500")}>
                {zone.trend === "up" ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
                {zone.trend === "up" ? "+" : ""}{zone.trend_delta_pct}% trend
              </div>
            )}
            {zone.trend === "stable" && (
              <div className="flex items-center justify-end gap-1 mt-2 text-[12px] text-neutral-400">
                <Minus className="w-3.5 h-3.5" /> Stable
              </div>
            )}
          </div>
        </div>

        {/* 4 stat boxes */}
        <div className="grid grid-cols-2 gap-2 mt-5">
          {[
            { label: "Defect Rate", value: `${zone.defect_rate_pct.toFixed(1)}%`, mono: true },
            { label: "Defect Count", value: zone.defect_count.toString(), mono: true },
            { label: "Peak Violation Hour", value: `${String(zone.peak_violation_hour).padStart(2, "0")}:00`, mono: true },
            { label: "Top Violation", value: zone.top_violation_type },
          ].map((stat) => (
            <div key={stat.label} className="rounded-[4px] border border-neutral-200 bg-white p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{stat.label}</div>
              <div className={cn("mt-1 text-[16px] font-black text-neutral-800", stat.mono && "font-data tabular-nums")}>
                {stat.value}
              </div>
            </div>
          ))}
        </div>

        {zone.flag && (
          <div className="mt-3 flex items-start gap-2 rounded-[4px] border border-amber-200 bg-amber-50/50 px-3 py-2.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
            <span className="text-[12px] text-amber-700 font-semibold">{zone.flag}</span>
          </div>
        )}
      </div>

      {/* Recent alerts for this zone */}
      <SectionLabel>Recent Alerts — {zone.zone_name.split(" — ")[0]}</SectionLabel>
      <div className="bg-white px-5 py-4 pb-10">
        {zoneAlerts.length === 0 ? (
          <p className="text-[12px] text-neutral-400 text-center py-4">No recent alerts for this zone</p>
        ) : (
          <div className="space-y-2">
            {zoneAlerts.map((alert) => (
              <div
                key={alert.id}
                className={cn(
                  "flex items-start gap-3 rounded-[4px] border p-3 border-l-2",
                  alert.severity === "CRITICAL" ? "border-red-200 border-l-red-600 bg-red-50/30" :
                  alert.severity === "HIGH" ? "border-orange-200 border-l-orange-500" :
                  "border-neutral-200"
                )}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[12px] font-bold text-neutral-800">{alert.name}</span>
                    <span className={cn(
                      "inline-flex h-5 items-center rounded-[2px] px-1.5 text-[9px] font-black uppercase",
                      alert.severity === "CRITICAL" ? "bg-red-600 text-white" :
                      alert.severity === "HIGH" ? "bg-orange-500 text-white" : "bg-amber-400 text-neutral-900"
                    )}>
                      {alert.severity}
                    </span>
                  </div>
                  <div className="mt-0.5 text-[11px] text-neutral-500">{alert.message}</div>
                  <div className="mt-1 flex items-center gap-1 text-[10px] text-neutral-400">
                    <Clock className="w-3 h-3" />
                    <span className="font-data tabular-nums">
                      {new Date(alert.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                    <span>· {alert.camera_id}</span>
                  </div>
                </div>
                <span className={cn(
                  "inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase shrink-0",
                  alert.status === "ACTIVE" ? "border-red-200 bg-red-50 text-red-700" :
                  alert.status === "ACKNOWLEDGED" ? "border-amber-200 bg-amber-50 text-amber-700" :
                  "border-emerald-200 bg-emerald-50 text-emerald-700"
                )}>
                  {alert.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </QualitySlidePanel>
  );
};
