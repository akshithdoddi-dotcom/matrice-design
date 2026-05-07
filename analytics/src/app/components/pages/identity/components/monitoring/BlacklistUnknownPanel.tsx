import { ShieldAlert, UserX, Ban, ArrowRight } from "lucide-react";
import { IDENTITY_LIVE_STATUS, IDENTITY_ZONES, IDENTITY_ALERTS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}

export const BlacklistUnknownPanel = ({ terminology, onEntityClick }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  const totalDenied = IDENTITY_ZONES.reduce((s, z) => s + z.denied, 0);
  const topDeniedZone = [...IDENTITY_ZONES].sort((a, b) => b.denied - a.denied)[0];
  const blAlert = IDENTITY_ALERTS.find(
    (a) => (a.type === "BLACKLIST_MATCH" || a.type === "STOLEN_PLATE") && a.status === "ACTIVE"
  );

  return (
    <div className="grid grid-cols-3 gap-3">

      {/* ── Blacklist / BOLO Hits ── */}
      <button
        onClick={() => status.blacklist_matches > 0 && onEntityClick?.("blacklist")}
        className={cn(
          "bg-white rounded-[4px] border p-4 flex flex-col gap-2 text-left w-full transition-all hover:shadow-sm group",
          status.blacklist_matches > 0
            ? "border-red-200 bg-red-50/40 cursor-pointer"
            : "border-neutral-200 cursor-default"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className={cn("w-4 h-4", status.blacklist_matches > 0 ? "text-red-600" : "text-neutral-300")} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">
              {terminology.blacklistLabel} Hits
            </span>
          </div>
          {status.blacklist_matches > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              ACTIVE
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            "text-5xl font-black font-data tabular-nums leading-none",
            status.blacklist_matches > 0 ? "text-red-700" : "text-neutral-800"
          )}>
            {status.blacklist_matches}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-snug">
          {blAlert ? `${blAlert.zone} · ${blAlert.timestamp}` : "No active hits"}
        </p>
        {status.blacklist_matches > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-red-600 group-hover:gap-2 transition-all">
            View alerts <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </button>

      {/* ── Unknown / Unrecognised ── */}
      <button
        onClick={() => status.unknown_count > 0 && onEntityClick?.("unknown")}
        className={cn(
          "bg-white rounded-[4px] border p-4 flex flex-col gap-2 text-left w-full transition-all hover:shadow-sm group",
          status.unknown_count > 3
            ? "border-amber-200 cursor-pointer"
            : "border-neutral-200 cursor-default"
        )}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <UserX className={cn("w-4 h-4", status.unknown_count > 0 ? "text-amber-500" : "text-neutral-300")} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">
              {terminology.unknownShortLabel}s Active
            </span>
          </div>
          {status.unknown_count > 3 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-amber-500 text-white">
              WATCH
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            "text-5xl font-black font-data tabular-nums leading-none",
            status.unknown_count > 3 ? "text-amber-600" : "text-neutral-800"
          )}>
            {status.unknown_count}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-snug">
          {status.unknown_count > 0 ? "Longest tracked: 5h 19m" : "No active unknowns"}
        </p>
        {status.unknown_count > 0 && (
          <div className="flex items-center gap-1 text-[10px] font-bold text-amber-600 group-hover:gap-2 transition-all">
            Track unknowns <ArrowRight className="w-3 h-3" />
          </div>
        )}
      </button>

      {/* ── Access Denied Today (informational) ── */}
      <div className={cn(
        "bg-white rounded-[4px] border p-4 flex flex-col gap-2",
        totalDenied > 10 ? "border-orange-200" : "border-neutral-200"
      )}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Ban className={cn("w-4 h-4", totalDenied > 10 ? "text-orange-500" : "text-neutral-300")} />
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-500">
              Access Denied Today
            </span>
          </div>
          {totalDenied > 10 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-orange-100 text-orange-700 border border-orange-200">
              ELEVATED
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-1.5">
          <span className={cn(
            "text-5xl font-black font-data tabular-nums leading-none",
            totalDenied > 10 ? "text-orange-600" : "text-neutral-800"
          )}>
            {totalDenied}
          </span>
        </div>
        <p className="text-[10px] text-neutral-400 leading-snug">
          {topDeniedZone ? `Highest: ${topDeniedZone.zone_name} (${topDeniedZone.denied})` : "No denials"}
        </p>
        <p className="text-[10px] text-neutral-300 leading-snug">See zone activity for breakdown</p>
      </div>

    </div>
  );
};
