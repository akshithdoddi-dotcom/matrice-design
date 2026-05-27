import { IDENTITY_LIVE_STATUS, IDENTITY_KPI_CARDS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { Activity, AlertTriangle, ShieldCheck, Wifi, UserX, ShieldAlert } from "lucide-react";

interface Props { terminology: IdentityTerminology }

export const LiveSummaryStrip = ({ terminology }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  const totalIdents = IDENTITY_KPI_CARDS[0]?.value ?? 0;
  const matchAcc = IDENTITY_KPI_CARDS[2]?.value ?? 0;

  const hasBlacklist = status.blacklist_matches > 0;

  return (
    <div className={cn(
      "bg-white rounded-[4px] border shadow-sm px-4 py-3 flex flex-wrap items-center gap-x-6 gap-y-2",
      hasBlacklist ? "border-red-200" : "border-neutral-100"
    )}>
      {/* Identifications */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        <Activity className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[22px] font-black font-data tabular-nums leading-none text-[#00775B]">
          {totalIdents.toLocaleString()}
        </span>
        <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
          {terminology.identLabel}s today
        </span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* Match accuracy */}
      <div className="flex items-center gap-1.5">
        <ShieldCheck className="w-3.5 h-3.5 text-neutral-400" />
        <span className="font-data tabular-nums font-bold text-[13px] text-neutral-800">{matchAcc}%</span>
        <span className="text-[10px] text-neutral-400">match accuracy</span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* Blacklist hits */}
      <div className="flex items-center gap-1.5">
        <ShieldAlert className={cn("w-3.5 h-3.5", hasBlacklist ? "text-red-500" : "text-neutral-300")} />
        <span className={cn("font-data tabular-nums font-bold text-[13px]", hasBlacklist ? "text-red-600" : "text-neutral-500")}>
          {status.blacklist_matches}
        </span>
        <span className="text-[10px] text-neutral-400">{terminology.blacklistLabel} hits</span>
        {hasBlacklist && (
          <span className="inline-flex h-5 items-center rounded-[2px] bg-red-600 px-1.5 text-[9px] font-black text-white animate-pulse">
            ACTIVE
          </span>
        )}
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* Unknowns */}
      <div className="flex items-center gap-1.5">
        <UserX className={cn("w-3.5 h-3.5", status.unknown_count > 3 ? "text-amber-500" : "text-neutral-300")} />
        <span className={cn("font-data tabular-nums font-bold text-[13px]", status.unknown_count > 3 ? "text-amber-600" : "text-neutral-500")}>
          {status.unknown_count}
        </span>
        <span className="text-[10px] text-neutral-400">{terminology.unknownShortLabel}s active</span>
      </div>

      <div className="h-4 w-px bg-neutral-200 hidden sm:block" />

      {/* Alerts */}
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3.5 h-3.5 text-neutral-400" />
        <span className="inline-flex h-5 items-center rounded-[2px] bg-red-600 px-1.5 text-[9px] font-black text-white">
          C:{status.open_alerts?.critical ?? 0}
        </span>
        <span className="inline-flex h-5 items-center rounded-[2px] bg-orange-500 px-1.5 text-[9px] font-black text-white">
          H:{status.open_alerts?.high ?? 0}
        </span>
      </div>

      {/* Camera status — right */}
      <div className="ml-auto flex items-center gap-1.5">
        <Wifi className="w-3.5 h-3.5 text-emerald-500" />
        <span className="text-[11px] text-neutral-600 font-semibold font-data tabular-nums">
          {status.cameras_online}/{status.cameras_total} cameras
        </span>
        <span className="inline-flex h-5 items-center rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 text-[9px] font-bold text-emerald-700">
          LIVE
        </span>
      </div>
    </div>
  );
};
