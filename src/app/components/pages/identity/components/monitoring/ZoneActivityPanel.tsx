import { Panel } from "../shared/Panel";
import { MapPin } from "lucide-react";
import { IDENTITY_ZONES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onCameraClick?: (cameraId?: string) => void;
}

const STATUS_COLOR: Record<string, { bg: string; border: string; label: string }> = {
  GREEN:    { bg: "bg-emerald-50",  border: "border-emerald-200", label: "text-emerald-700" },
  AMBER:    { bg: "bg-amber-50",    border: "border-amber-200",   label: "text-amber-700" },
  WATCH:    { bg: "bg-orange-50",   border: "border-orange-200",  label: "text-orange-700" },
  CRITICAL: { bg: "bg-red-50",      border: "border-red-300",     label: "text-red-700" },
};

export const ZoneActivityPanel = ({ terminology, onCameraClick }: Props) => (
  <Panel
    title="Zone Activity Map"
    icon={MapPin}
    info={`Live ${terminology.identLabel.toLowerCase()} counts and status per access zone. Click any zone to see the camera feed.`}
  >
    <div className="grid grid-cols-3 md:grid-cols-4 gap-2">
      {IDENTITY_ZONES.map((zone) => {
        const colors = STATUS_COLOR[zone.status] ?? STATUS_COLOR.GREEN;
        return (
          <div
            key={zone.zone_id}
            onClick={() => onCameraClick?.(zone.zone_id)}
            className={cn(
              "rounded-lg p-2.5 border flex flex-col gap-1 transition-all",
              onCameraClick ? "cursor-pointer hover:brightness-95 hover:shadow-sm" : "",
              colors.bg, colors.border,
              zone.status === "CRITICAL" && "animate-pulse"
            )}
          >
            <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-500 leading-tight">
              {zone.zone_name}
            </span>
            <span className={cn("text-lg font-black font-data tabular-nums", colors.label)}>
              {zone.identifications}
            </span>
            <div className="flex items-center gap-1">
              {zone.blacklist_hits > 0 && (
                <span className="text-[8px] bg-red-600 text-white rounded px-1 py-0.5 font-bold font-data tabular-nums">
                  BL:{zone.blacklist_hits}
                </span>
              )}
              {zone.unknown > 0 && (
                <span className="text-[8px] bg-slate-400 text-white rounded px-1 py-0.5 font-bold font-data tabular-nums">
                  ?{zone.unknown}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </Panel>
);
