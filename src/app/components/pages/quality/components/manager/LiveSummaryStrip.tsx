import { LIVE_STATUS, REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { Shield, AlertTriangle, MapPin, Users, ArrowRight } from "lucide-react";

interface Props {
  terminology: QualityTerminology;
}

export const LiveSummaryStrip = ({ terminology }: Props) => {
  const status = LIVE_STATUS;
  const rateColor =
    status.compliance_status === "GREEN"
      ? "text-emerald-600"
      : status.compliance_status === "AMBER"
      ? "text-amber-600"
      : "text-red-600";
  const bgColor =
    status.compliance_status === "GREEN"
      ? "bg-emerald-50 border-emerald-200"
      : status.compliance_status === "AMBER"
      ? "bg-amber-50 border-amber-200"
      : "bg-red-50 border-red-200";

  const totalAlerts =
    status.open_alerts.critical + status.open_alerts.high + status.open_alerts.medium;

  return (
    <div className={cn("rounded-[4px] border px-5 py-3 flex flex-wrap items-center gap-5", bgColor)}>
      <div className="flex items-center gap-2">
        <Shield className={cn("w-4 h-4", rateColor)} />
        <span className={cn("text-xl font-black tabular-nums font-data", rateColor)}>
          {status.compliance_rate_pct.toFixed(1)}%
        </span>
        <span className="text-[10px] text-neutral-500 uppercase tracking-widest">
          {terminology.primaryMetricLabel}
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden md:block" />

      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
        <span className="font-bold font-data text-neutral-700">{totalAlerts}</span>
        <span className="text-[10px] text-neutral-500">Open Alerts</span>
        {status.open_alerts.critical > 0 && (
          <span className="text-[10px] bg-red-600 text-white rounded px-1.5 py-0.5 font-bold">
            {status.open_alerts.critical} Critical
          </span>
        )}
      </div>

      <div className="flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-red-500" />
        <span className="font-bold font-data text-neutral-700">{status.high_risk_zones_count}</span>
        <span className="text-[10px] text-neutral-500">{terminology.zoneRiskLabel}s</span>
      </div>

      <div className="flex items-center gap-1.5">
        <Users className="w-3.5 h-3.5 text-orange-500" />
        <span className="font-bold font-data text-neutral-700">{REPEAT_VIOLATORS.length}</span>
        <span className="text-[10px] text-neutral-500">{terminology.repeatOffenderLabel}s</span>
      </div>

      <a
        href="#"
        className="ml-auto flex items-center gap-1 text-[10px] font-bold text-[#00775B] hover:underline"
      >
        Open full monitoring view <ArrowRight className="w-3 h-3" />
      </a>
    </div>
  );
};
