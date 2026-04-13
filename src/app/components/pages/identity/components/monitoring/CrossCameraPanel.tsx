import { Panel } from "../shared/Panel";
import { Waypoints } from "lucide-react";
import { CROSS_CAMERA_TRACKS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onJourneyClick?: () => void;
}

export const CrossCameraPanel = ({ terminology: _terminology, onJourneyClick }: Props) => (
  <Panel
    title="Cross-Camera Tracking"
    icon={Waypoints}
    info="Individuals tracked across multiple camera zones in a single session. Click 'Journey' to view the full floor-plan map."
  >
    <div className="flex flex-col gap-2">
      {CROSS_CAMERA_TRACKS.map((track) => (
        <div
          key={track.tracker_id}
          className={cn(
            "rounded-lg p-3 border",
            track.badge === "BLACKLIST" ? "bg-red-50 border-red-200" :
            track.severity === "high"   ? "bg-orange-50 border-orange-200" :
                                          "bg-slate-50 border-slate-200"
          )}
        >
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className={cn(
                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                track.badge === "BLACKLIST" ? "bg-red-600 text-white" :
                track.badge === "WATCH"     ? "bg-orange-500 text-white" :
                                              "bg-slate-500 text-white"
              )}>
                {track.badge}
              </span>
              <span className="text-xs font-bold text-neutral-800">{track.tracker_id}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-data text-neutral-400">
                {Math.floor(track.duration_sec / 60)}m {track.duration_sec % 60}s
              </span>
              {onJourneyClick && (
                <button
                  onClick={onJourneyClick}
                  className="flex items-center gap-1 h-6 px-2 rounded border border-neutral-200 bg-white text-[10px] font-semibold text-[#00775B] hover:bg-[#E5FFF9] hover:border-[#00775B]/30 transition-colors"
                >
                  <Waypoints className="w-3 h-3" />
                  Journey
                </button>
              )}
            </div>
          </div>
          <div className="mt-2 flex items-center gap-1 flex-wrap">
            {track.path.map((zone, i) => (
              <span key={zone} className="flex items-center gap-1">
                <span className="text-[10px] bg-white border border-neutral-200 rounded px-1.5 py-0.5 text-neutral-700">
                  {zone}
                </span>
                {i < track.path.length - 1 && (
                  <span className="text-[10px] text-neutral-400">→</span>
                )}
              </span>
            ))}
          </div>
        </div>
      ))}
    </div>
  </Panel>
);
