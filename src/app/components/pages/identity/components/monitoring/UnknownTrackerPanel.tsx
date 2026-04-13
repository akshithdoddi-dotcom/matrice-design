import { Panel } from "../shared/Panel";
import { UserX, MapPin, Radio, Eye, ShieldPlus, AlertTriangle } from "lucide-react";
import { UNKNOWN_TRACKERS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onTrackerClick?: () => void;
}

function formatDuration(firstSeen: string, lastSeen: string): string {
  const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
  const diff = Math.max(0, toMin(lastSeen) - toMin(firstSeen));
  const hrs = Math.floor(diff / 60);
  const mins = diff % 60;
  if (hrs > 0) return `${hrs}h ${mins}m`;
  return mins > 0 ? `${mins}m` : "<1m";
}

// Surveillance-style face capture
const FaceCapture = ({ seed, confidence }: { seed: string; confidence: number }) => (
  <div className="relative w-12 h-12 shrink-0 rounded-[4px] overflow-hidden bg-neutral-900">
    <img
      src={`https://i.pravatar.cc/48?u=${seed}`}
      alt=""
      className="w-full h-full object-cover opacity-90"
      onError={e => { e.currentTarget.style.display = "none"; }}
    />
    <div
      className="absolute inset-[3px] pointer-events-none"
      style={{ border: "1.5px solid #00FF41", boxShadow: "0 0 5px rgba(0,255,65,0.4)" }}
    />
    {/* Corner brackets */}
    <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-[#00FF41] pointer-events-none" />
    <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-[#00FF41] pointer-events-none" />
    <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-[#00FF41] pointer-events-none" />
    <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-[#00FF41] pointer-events-none" />
    <div className="absolute bottom-0 left-0 right-0 bg-black/70 text-[7px] font-data text-[#00FF41] text-center py-px">
      {confidence}%
    </div>
  </div>
);

export const UnknownTrackerPanel = ({ terminology, onTrackerClick }: Props) => {
  const priority: Record<string, number> = { RECURRING: 0, NEW: 1 };
  const sorted = [...UNKNOWN_TRACKERS].sort(
    (a, b) => (priority[a.badge ?? ""] ?? 2) - (priority[b.badge ?? ""] ?? 2)
  );

  return (
    <Panel
      title={`${terminology.unknownLabel} Tracker`}
      icon={UserX}
      info="Unrecognized individuals actively tracked. Dispatch, watch, or clear — directly inline."
    >
      <div className="overflow-x-auto -mx-4 -mb-4">
        <table className="w-full text-xs min-w-[520px]">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-14">
                Capture
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                ID
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Last Known Location
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-20">
                Tracked
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-16">
                Conf
              </th>
              <th className="pl-2 pr-4 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {sorted.map(tracker => {
              const duration = formatDuration(tracker.first_seen, tracker.last_seen);
              const isRecurring = tracker.badge === "RECURRING";
              const isNew = tracker.badge === "NEW";
              const currentZone = tracker.cameras[tracker.cameras.length - 1];

              return (
                <tr
                  key={tracker.tracker_id}
                  className={cn(
                    "transition-colors",
                    isRecurring ? "bg-orange-50/40" : "bg-white hover:bg-neutral-50/60"
                  )}
                >
                  {/* Face capture */}
                  <td className="pl-4 pr-2 py-2.5">
                    <FaceCapture seed={String(tracker.tracker_id)} confidence={tracker.confidence} />
                  </td>

                  {/* ID + badge */}
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn(
                        "text-[9px] font-black px-1.5 py-0.5 rounded-[2px] uppercase",
                        isRecurring ? "bg-orange-500 text-white" :
                        isNew       ? "bg-blue-500 text-white"   : "bg-neutral-400 text-white"
                      )}>
                        {tracker.badge ?? "ACTIVE"}
                      </span>
                    </div>
                    <span className="font-bold text-neutral-800">{tracker.anonymized_label}</span>
                    <div className="flex items-center gap-1 mt-0.5 text-[10px] text-neutral-400">
                      <Radio className="w-3 h-3 text-emerald-500" />
                      <span className="font-data">{tracker.appearances}× seen</span>
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-2 py-2.5">
                    <div className="flex items-center gap-1 flex-wrap">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="font-medium text-neutral-700">{currentZone}</span>
                      {tracker.cross_camera && (
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded-[2px] bg-amber-100 text-amber-700 border border-amber-200">
                          {tracker.cameras.length} zones
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Duration */}
                  <td className="px-2 py-2.5 text-right">
                    <span className="font-data font-semibold tabular-nums text-neutral-700">{duration}</span>
                  </td>

                  {/* Confidence */}
                  <td className="px-2 py-2.5 text-right">
                    <span className={cn(
                      "font-data font-bold tabular-nums",
                      tracker.confidence < 70 ? "text-red-500" :
                      tracker.confidence < 80 ? "text-amber-600" : "text-emerald-600"
                    )}>
                      {tracker.confidence}%
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="pl-2 pr-4 py-2.5">
                    <div className="flex items-center gap-1 justify-end">
                      {isRecurring && (
                        <button
                          onClick={onTrackerClick}
                          className="flex items-center gap-1 h-6 px-2 rounded-[4px] text-[9px] font-bold bg-orange-500 text-white hover:bg-orange-600 transition-colors whitespace-nowrap"
                        >
                          <AlertTriangle className="w-3 h-3" />
                          Alert
                        </button>
                      )}
                      <button
                        onClick={onTrackerClick}
                        className="flex items-center gap-1 h-6 px-2 rounded-[4px] border border-neutral-200 bg-white text-[9px] font-semibold text-neutral-700 hover:border-[#00775B] hover:text-[#00775B] transition-colors whitespace-nowrap"
                      >
                        <Eye className="w-3 h-3" />
                        View
                      </button>
                      <button className="flex items-center gap-1 h-6 px-2 rounded-[4px] border border-neutral-200 bg-white text-[9px] font-semibold text-neutral-500 hover:border-amber-300 hover:text-amber-600 transition-colors whitespace-nowrap">
                        <ShieldPlus className="w-3 h-3" />
                        Watch
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
