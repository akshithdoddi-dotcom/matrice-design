import { Panel } from "../shared/Panel";
import { ShieldAlert, UserX } from "lucide-react";
import { IDENTITY_LIVE_STATUS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const BlacklistUnknownPanel = ({ terminology }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  return (
    <Panel
      title="Threat Counters"
      icon={ShieldAlert}
      info="Active blacklist matches and unknown individuals tracked in the last 5 minutes."
    >
      <div className="grid grid-cols-2 gap-3">
        {/* Blacklist */}
        <div className={cn(
          "rounded-lg p-4 flex flex-col items-center gap-1 border",
          status.blacklist_matches > 0
            ? "bg-red-50 border-red-200"
            : "bg-neutral-50 border-neutral-200"
        )}>
          <ShieldAlert className={cn("w-6 h-6", status.blacklist_matches > 0 ? "text-red-600" : "text-neutral-400")} />
          <span className={cn("text-4xl font-black font-data", status.blacklist_matches > 0 ? "text-red-700" : "text-neutral-700")}>
            {status.blacklist_matches}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-widest text-center", status.blacklist_matches > 0 ? "text-red-500" : "text-neutral-400")}>
            {terminology.blacklistLabel} Hits
          </span>
          {status.blacklist_matches > 0 && (
            <span className="text-[10px] bg-red-600 text-white rounded px-2 py-0.5 font-bold mt-1 animate-pulse">
              ACTIVE
            </span>
          )}
        </div>

        {/* Unknown */}
        <div className={cn(
          "rounded-lg p-4 flex flex-col items-center gap-1 border",
          status.unknown_count > 3
            ? "bg-amber-50 border-amber-200"
            : "bg-neutral-50 border-neutral-200"
        )}>
          <UserX className={cn("w-6 h-6", status.unknown_count > 3 ? "text-amber-600" : "text-neutral-400")} />
          <span className={cn("text-4xl font-black font-data", status.unknown_count > 3 ? "text-amber-700" : "text-neutral-700")}>
            {status.unknown_count}
          </span>
          <span className={cn("text-[10px] font-bold uppercase tracking-widest text-center", status.unknown_count > 3 ? "text-amber-500" : "text-neutral-400")}>
            {terminology.unknownShortLabel}s (5min)
          </span>
          {status.unknown_count > 3 && (
            <span className="text-[10px] bg-amber-500 text-white rounded px-2 py-0.5 font-bold mt-1">
              WATCH
            </span>
          )}
        </div>
      </div>
    </Panel>
  );
};
