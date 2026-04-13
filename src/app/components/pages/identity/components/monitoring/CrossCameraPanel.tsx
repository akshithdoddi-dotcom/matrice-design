import { Panel } from "../shared/Panel";
import { Waypoints, Map, ArrowRight } from "lucide-react";
import { CROSS_CAMERA_TRACKS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onJourneyClick?: () => void;
}

function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}s`;
  if (s === 0) return `${m}m`;
  return `${m}m ${s}s`;
}

export const CrossCameraPanel = ({ terminology, onJourneyClick }: Props) => {
  const title = terminology.isLPR ? "Vehicle Path" : "Movement Trail";
  const subtitle = terminology.isLPR
    ? "Vehicle routes traced across multiple access points"
    : "Individuals traced across multiple zones";

  return (
    <Panel
      title={title}
      icon={Waypoints}
      info={`${subtitle}. Click 'View Map' to see the full floor-plan journey with timestamps.`}
    >
      <div className="overflow-x-auto -mx-4 -mb-4">
        <table className="w-full min-w-[580px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Subject</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Path</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Active</th>
              <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
              <th className="pl-2 pr-4 py-2 w-24" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {CROSS_CAMERA_TRACKS.map((track) => (
              <tr
                key={track.tracker_id}
                className={cn(
                  "transition-colors group",
                  track.badge === "BLACKLIST"
                    ? "bg-red-50/30 hover:bg-red-50/50"
                    : "hover:bg-neutral-50/60"
                )}
              >
                {/* Subject */}
                <td className="pl-4 pr-2 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "inline-flex h-5 items-center rounded-[2px] px-1.5 text-[9px] font-black uppercase tracking-wide shrink-0",
                      track.badge === "BLACKLIST"
                        ? "bg-red-600 text-white"
                        : track.badge === "WATCH"
                        ? "bg-amber-500 text-white"
                        : "bg-neutral-600 text-white"
                    )}>
                      {track.badge}
                    </span>
                    <span className="text-[12px] font-semibold text-neutral-800 truncate">{track.tracker_id}</span>
                  </div>
                  <div className="mt-0.5 pl-0 text-[10px] text-neutral-400">{track.zones.join(" · ")}</div>
                </td>

                {/* Path breadcrumb */}
                <td className="px-2 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {track.path.map((zone, i) => (
                      <span key={zone} className="flex items-center gap-1">
                        <span className={cn(
                          "rounded-[2px] border px-1.5 py-0.5 text-[10px] font-semibold leading-tight",
                          i === track.path.length - 1
                            ? "border-[#00775B]/25 bg-[#E5FFF9] text-[#00775B]"
                            : "border-neutral-200 bg-neutral-50 text-neutral-500"
                        )}>
                          {zone}
                        </span>
                        {i < track.path.length - 1 && (
                          <ArrowRight className="w-2.5 h-2.5 text-neutral-300 shrink-0" />
                        )}
                      </span>
                    ))}
                  </div>
                  <div className="mt-1 text-[10px] text-neutral-400">
                    Now at:{" "}
                    <span className="font-semibold text-[#00775B]">
                      {track.path[track.path.length - 1]}
                    </span>
                    <span className="ml-1.5 text-[#00775B] font-bold">● now</span>
                  </div>
                </td>

                {/* Duration */}
                <td className="px-2 py-3 text-right">
                  <span className="font-data tabular-nums text-[15px] font-black text-neutral-900">
                    {formatDuration(track.duration_sec)}
                  </span>
                </td>

                {/* Live badge */}
                <td className="px-2 py-3 text-center">
                  <span className="inline-flex items-center gap-1 rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    Live
                  </span>
                </td>

                {/* Action */}
                <td className="pl-2 pr-4 py-3">
                  {onJourneyClick && (
                    <button
                      onClick={onJourneyClick}
                      className="flex h-7 items-center gap-1.5 rounded-[4px] border border-[#00775B] bg-white px-3 text-[11px] font-bold text-[#00775B] transition-all hover:bg-[#E5FFF9] active:scale-[0.97]"
                    >
                      <Map className="h-3 w-3" />
                      View Map
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
