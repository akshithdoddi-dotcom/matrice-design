import { cn } from "@/app/lib/utils";
import { Wifi, AlertTriangle, ShieldAlert, Users } from "lucide-react";
import { IDENTITY_LIVE_STATUS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";

interface Props { terminology: IdentityTerminology }

export const LiveStatusBar = ({ terminology }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  const isAlert = status.status === "RED" || status.open_alerts.critical > 0;

  return (
    <div className={cn(
      "w-full flex flex-wrap items-center gap-4 md:gap-6 px-4 py-3 rounded-[4px] border text-sm font-medium transition-colors",
      isAlert ? "bg-red-50 border-red-200" : "bg-white border-neutral-100"
    )}>
      {/* ID Rate */}
      <div className="flex items-center gap-2">
        <Users className={cn("w-4 h-4", isAlert ? "text-red-500" : "text-emerald-500")} />
        <span className={cn("text-xl font-black tabular-nums font-data", isAlert ? "text-red-600" : "text-emerald-600")}>
          {status.identifications_last_min}
        </span>
        <span className="text-[10px] text-neutral-400 uppercase tracking-widest">
          {terminology.identLabel}s / min
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden md:block" />

      {/* Blacklist hits */}
      <div className="flex items-center gap-1.5">
        <ShieldAlert className={cn("w-3.5 h-3.5", status.blacklist_matches > 0 ? "text-red-500" : "text-neutral-400")} />
        <span className={cn("font-bold", status.blacklist_matches > 0 ? "text-red-700" : "text-neutral-700")}>
          {status.blacklist_matches}
        </span>
        <span className="text-[10px] text-neutral-400">{terminology.blacklistLabel} hits</span>
      </div>

      {/* Unknown count */}
      <div className="flex items-center gap-1.5">
        <AlertTriangle className={cn("w-3.5 h-3.5", status.unknown_count > 0 ? "text-amber-500" : "text-neutral-400")} />
        <span className="font-bold text-neutral-700">{status.unknown_count}</span>
        <span className="text-[10px] text-neutral-400">{terminology.unknownShortLabel}s</span>
      </div>

      {/* Alert pills */}
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
