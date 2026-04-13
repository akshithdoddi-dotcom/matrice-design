import { Panel } from "../shared/Panel";
import { UserX } from "lucide-react";
import { UNKNOWN_TRACKERS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onTrackerClick?: () => void;
}

export const UnknownTrackerPanel = ({ terminology, onTrackerClick }: Props) => (
  <Panel
    title={`${terminology.unknownLabel} Tracker`}
    icon={UserX}
    info="Active unknown individuals being tracked across cameras. Click a tracker to view details."
  >
    <div className="flex flex-col gap-2">
      {UNKNOWN_TRACKERS.map((tracker) => (
        <div
          key={tracker.tracker_id}
          onClick={onTrackerClick}
          className={cn(
            "rounded-lg p-3 border transition-all",
            onTrackerClick ? "cursor-pointer hover:brightness-95 hover:shadow-sm" : "",
            tracker.badge === "RECURRING" ? "bg-orange-50 border-orange-200" : "bg-slate-50 border-slate-200"
          )}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                tracker.badge === "RECURRING" ? "bg-orange-500 text-white" :
                tracker.badge === "NEW"       ? "bg-blue-500 text-white" :
                                                "bg-slate-400 text-white"
              )}>
                {tracker.badge ?? "ACTIVE"}
              </span>
              <span className="text-xs font-bold text-neutral-800">{tracker.anonymized_label}</span>
            </div>
            <span className="text-[10px] font-data text-neutral-400 shrink-0">
              {tracker.appearances}× seen
            </span>
          </div>
          <div className="mt-1.5 flex flex-wrap gap-1">
            {tracker.cameras.map((cam) => (
              <span key={cam} className="text-[9px] bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-600">
                {cam}
              </span>
            ))}
            {tracker.cross_camera && (
              <span className="text-[9px] bg-amber-100 text-amber-700 border border-amber-200 rounded px-1.5 py-0.5 font-bold">
                cross-cam
              </span>
            )}
          </div>
          <div className="mt-1.5 flex items-center gap-3 text-[10px] text-neutral-500">
            <span>First: {tracker.first_seen}</span>
            <span>Last: {tracker.last_seen}</span>
            <span className={cn(
              "font-semibold font-data",
              tracker.confidence < 70 ? "text-red-600" :
              tracker.confidence < 80 ? "text-amber-600" : "text-emerald-600"
            )}>
              Conf: {tracker.confidence}%
            </span>
          </div>
        </div>
      ))}
    </div>
  </Panel>
);
