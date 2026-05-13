import type { LiveStatus, QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { Wifi, AlertTriangle, MapPin, Shield } from "lucide-react";

interface Props {
  status: LiveStatus;
  terminology: QualityTerminology;
}

export const LiveStatusBar = ({ status, terminology }: Props) => {
  const isAlert =
    status.compliance_status === "RED" || status.open_alerts.critical > 0;
  const rateColor =
    status.compliance_status === "GREEN"
      ? "text-emerald-400"
      : status.compliance_status === "AMBER"
      ? "text-amber-400"
      : "text-red-400";

  return (
    <div
      className={cn(
        "w-full flex flex-wrap items-center gap-4 md:gap-6 px-4 py-3 rounded-[4px] border text-sm font-medium transition-colors",
        isAlert
          ? "bg-red-50 border-red-200 animate-pulse"
          : "bg-white border-neutral-100"
      )}
    >
      {/* Compliance Rate */}
      <div className="flex items-center gap-2">
        <Shield className={cn("w-4 h-4", rateColor)} />
        <span className={cn("text-xl font-black tabular-nums font-data", rateColor)}>
          {status.compliance_rate_pct.toFixed(1)}%
        </span>
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
          {terminology.primaryMetricLabel}
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden md:block" />

      {/* Active violations */}
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-bold font-data text-neutral-700">
          {status.active_violations_last_5min}
        </span>
        <span className="text-[10px] text-neutral-400">
          {terminology.negativeEventLabel}s (5min)
        </span>
      </div>

      {/* High-risk zones */}
      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-red-500" />
        {status.high_risk_zones_count > 0 ? (
          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">
            {status.high_risk_zones_count}
          </span>
        ) : (
          <span className="text-[10px] text-neutral-400">0</span>
        )}
        <span className="text-[10px] text-neutral-400">
          {terminology.zoneRiskLabel}s
        </span>
      </div>

      {/* Alert severity pills */}
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] bg-red-600 text-white rounded px-1.5 py-0.5 font-bold">
          C:{status.open_alerts.critical}
        </span>
        <span className="text-[10px] bg-orange-500 text-white rounded px-1.5 py-0.5 font-bold">
          H:{status.open_alerts.high}
        </span>
        <span className="text-[10px] bg-amber-400 text-neutral-900 rounded px-1.5 py-0.5 font-bold">
          M:{status.open_alerts.medium}
        </span>
      </div>

      {/* Camera status */}
      <div className="ml-auto flex items-center gap-1.5">
        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[10px] text-neutral-600 font-semibold">
          {status.cameras_online}/{status.cameras_total} cameras
        </span>
        <span className="ml-1 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <span className="text-[10px] text-emerald-600 font-bold">LIVE</span>
      </div>
    </div>
  );
};
