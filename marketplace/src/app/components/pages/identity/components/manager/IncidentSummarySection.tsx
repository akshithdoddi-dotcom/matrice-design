import { useState } from "react";
import { Panel } from "../shared/Panel";
import { ClipboardList } from "lucide-react";
import { IDENTITY_ALERTS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

const SEVERITY_STYLE: Record<string, string> = {
  CRITICAL: "bg-red-100 text-red-700",
  HIGH:     "bg-orange-100 text-orange-700",
  MEDIUM:   "bg-amber-100 text-amber-700",
  LOW:      "bg-blue-100 text-blue-700",
};
const STATUS_STYLE: Record<string, string> = {
  ACTIVE:       "bg-red-100 text-red-700",
  ACKNOWLEDGED: "bg-amber-100 text-amber-700",
  RESOLVED:     "bg-emerald-100 text-emerald-700",
};

export const IncidentSummarySection = ({ terminology: _terminology }: Props) => {
  const [filterSeverity, setFilterSeverity] = useState<string>("ALL");
  const filtered = filterSeverity === "ALL"
    ? IDENTITY_ALERTS
    : IDENTITY_ALERTS.filter((a) => a.severity === filterSeverity);

  const counts = {
    critical: IDENTITY_ALERTS.filter((a) => a.severity === "CRITICAL").length,
    high:     IDENTITY_ALERTS.filter((a) => a.severity === "HIGH").length,
    medium:   IDENTITY_ALERTS.filter((a) => a.severity === "MEDIUM").length,
  };

  return (
    <Panel
      title="Incident Summary"
      icon={ClipboardList}
      info="All identity-related incidents and alerts today. Filter by severity."
    >
      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { key: "ALL", label: "All", count: IDENTITY_ALERTS.length },
          { key: "CRITICAL", label: "Critical", count: counts.critical },
          { key: "HIGH", label: "High", count: counts.high },
          { key: "MEDIUM", label: "Medium", count: counts.medium },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilterSeverity(f.key)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-colors",
              filterSeverity === f.key
                ? "bg-[#00775B] text-white border-[#00775B]"
                : "bg-white text-neutral-600 border-neutral-200 hover:border-[#00775B] hover:text-[#00775B]"
            )}
          >
            {f.label}
            <span className={cn("rounded-full px-1.5 py-0.5 text-[10px]",
              filterSeverity === f.key ? "bg-white/20 text-white" : "bg-neutral-100 text-neutral-600"
            )}>
              {f.count}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        {filtered.map((alert) => (
          <div key={alert.id} className="flex items-start gap-3 p-3 rounded-lg border border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
            <div className="flex flex-col gap-1 flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", SEVERITY_STYLE[alert.severity])}>
                  {alert.severity}
                </span>
                <span className="text-xs font-semibold text-neutral-800 truncate">{alert.subject}</span>
              </div>
              <p className="text-[11px] text-neutral-600 leading-relaxed">{alert.message}</p>
              <div className="flex items-center gap-3 text-[10px] text-neutral-400 mt-0.5">
                <span>{alert.zone}</span>
                <span>·</span>
                <span>{alert.camera_id}</span>
                <span>·</span>
                <span className="font-data">{alert.timestamp}</span>
              </div>
            </div>
            <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0", STATUS_STYLE[alert.status])}>
              {alert.status}
            </span>
          </div>
        ))}
      </div>
    </Panel>
  );
};
