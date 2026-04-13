import { Panel } from "../shared/Panel";
import { MapPin, TrendingUp, TrendingDown, Minus, Camera, ShieldAlert, UserRoundX, Ban } from "lucide-react";
import { IDENTITY_ZONES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: IdentityTerminology;
  onCameraClick?: (cameraId?: string) => void;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}

const STATUS_DOT: Record<string, string> = {
  GREEN:    "bg-emerald-500",
  AMBER:    "bg-amber-500",
  WATCH:    "bg-orange-500",
  CRITICAL: "bg-red-600",
};

const STATUS_TEXT: Record<string, string> = {
  GREEN:    "text-emerald-700",
  AMBER:    "text-amber-700",
  WATCH:    "text-orange-700",
  CRITICAL: "text-red-700",
};

const ZONE_TREND: Record<string, "up" | "down" | "stable"> = {
  z1: "up", z2: "stable", z3: "up", z4: "stable",
  z5: "stable", z6: "up", z7: "stable", z8: "down",
  z9: "stable", z10: "stable", z11: "stable", z12: "stable",
};

const LAST_EVENT: Record<string, string> = {
  z1: "just now", z2: "1m ago", z3: "2m ago", z4: "5m ago",
  z5: "3m ago", z6: "4m ago", z7: "2m ago", z8: "8m ago",
  z9: "12m ago", z10: "6m ago", z11: "15m ago", z12: "1m ago",
};

const ACTIVE_CAMERAS: Record<string, number> = {
  z1: 4, z2: 2, z3: 3, z4: 1, z5: 2, z6: 2, z7: 2, z8: 1, z9: 1, z10: 1, z11: 1, z12: 2,
};

const PEAK_WINDOW: Record<string, string> = {
  z1: "08:00-09:00", z2: "08:00-09:00", z3: "17:00-18:00", z4: "09:00-10:00",
  z5: "08:00-09:00", z6: "08:00-09:00", z7: "07:00-08:00", z8: "10:00-11:00",
  z9: "12:00-13:00", z10: "14:00-15:00", z11: "10:00-11:00", z12: "09:00-10:00",
};

export const ZoneActivityPanel = ({ terminology, onCameraClick, onEntityClick }: Props) => (
  <Panel
    title="Zone Activity"
    icon={MapPin}
    info={`Live ${terminology.identLabel.toLowerCase()} counts, active cameras, and risk indicators by zone. Click any row to view camera feed.`}
  >
    <div className="overflow-x-auto -mx-4 -mb-4">
      <table className="w-full min-w-[980px] text-xs">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80">
            <th className="pl-6 pr-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
              Zone
            </th>
            <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-[110px]">
              {terminology.identLabel}s
            </th>
            <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-[90px]">
              Cameras
            </th>
            <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-[130px]">
              Peak Window
            </th>
            <th className="px-3 py-3 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-[70px]">
              Trend
            </th>
            <th className="px-3 py-3 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-[320px]">
              Risk Mix
            </th>
            <th className="px-3 py-3 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-[120px]">
              Last Event
            </th>
            <th className="pl-3 pr-6 py-3 w-[64px]" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {IDENTITY_ZONES.map(zone => {
            const dot = STATUS_DOT[zone.status] ?? STATUS_DOT.GREEN;
            const label = STATUS_TEXT[zone.status] ?? STATUS_TEXT.GREEN;
            const trend = ZONE_TREND[zone.zone_id] ?? "stable";
            const last = LAST_EVENT[zone.zone_id] ?? "—";
            const peakWindow = PEAK_WINDOW[zone.zone_id] ?? "—";
            const activeCameras = ACTIVE_CAMERAS[zone.zone_id] ?? 1;
            const isCritical = zone.status === "CRITICAL";

            return (
              <tr
                key={zone.zone_id}
                onClick={() => onCameraClick?.(zone.zone_id)}
                className={cn(
                  "transition-colors group",
                  onCameraClick ? "cursor-pointer hover:bg-neutral-50" : "",
                  isCritical ? "bg-red-50/30" : ""
                )}
              >
                {/* Zone name + status dot */}
                <td className="pl-6 pr-3 py-3">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      dot,
                      isCritical && "animate-pulse"
                    )} />
                    <span className="font-semibold text-neutral-800">{zone.zone_name}</span>
                  </div>
                </td>

                {/* Count */}
                <td className="px-3 py-3 text-right">
                  <span className={cn("font-data font-black tabular-nums text-sm", label)}>
                    {zone.identifications}
                  </span>
                </td>

                <td className="px-3 py-3 text-right">
                  <span className="font-data text-[11px] font-bold tabular-nums text-neutral-700">
                    {activeCameras}
                  </span>
                </td>

                <td className="px-3 py-3 text-right">
                  <span className="font-data text-[10px] font-semibold tabular-nums text-neutral-500">
                    {peakWindow}
                  </span>
                </td>

                {/* Trend */}
                <td className="px-3 py-3 text-center">
                  {trend === "up"     && <TrendingUp   className="w-3.5 h-3.5 text-red-400 inline" />}
                  {trend === "down"   && <TrendingDown  className="w-3.5 h-3.5 text-emerald-500 inline" />}
                  {trend === "stable" && <Minus         className="w-3.5 h-3.5 text-neutral-300 inline" />}
                </td>

                {/* Risk mix */}
                <td className="px-3 py-3">
                  <div className="flex flex-wrap items-center gap-1">
                    {zone.blacklist_hits > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); onEntityClick?.("blacklist"); }}
                        className="inline-flex items-center gap-1 rounded-md border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-black text-red-700 transition-colors hover:bg-red-100"
                        title={`View ${terminology.blacklistLabel.toLowerCase()} event`}
                      >
                        <ShieldAlert className="h-3 w-3" />
                        <span className="font-data tabular-nums">{zone.blacklist_hits}</span>
                        <span>{terminology.isLPR ? "BOLO" : "Blacklist"}</span>
                      </button>
                    )}
                    {zone.unknown > 0 && (
                      <button
                        onClick={e => { e.stopPropagation(); onEntityClick?.("unknown"); }}
                        className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[9px] font-black text-slate-700 transition-colors hover:bg-slate-100"
                        title={`View ${terminology.unknownLabel.toLowerCase()}s`}
                      >
                        <UserRoundX className="h-3 w-3" />
                        <span className="font-data tabular-nums">{zone.unknown}</span>
                        <span>{terminology.unknownShortLabel}</span>
                      </button>
                    )}
                    {zone.denied > 0 && (
                      <span className="inline-flex items-center gap-1 rounded-md border border-orange-200 bg-orange-50 px-2 py-1 text-[9px] font-black text-orange-700">
                        <Ban className="h-3 w-3" />
                        <span className="font-data tabular-nums">{zone.denied}</span>
                        <span>Denied</span>
                      </span>
                    )}
                    {zone.blacklist_hits === 0 && zone.unknown === 0 && zone.denied === 0 && (
                      <span className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-bold text-emerald-700">
                        Clear
                      </span>
                    )}
                  </div>
                </td>

                {/* Last event */}
                <td className="px-3 py-3 text-right">
                  <span className="text-[10px] text-neutral-400 font-data">{last}</span>
                </td>

                {/* Camera icon */}
                <td className="pl-3 pr-6 py-3 text-right">
                  <Camera className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors inline" />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  </Panel>
);
