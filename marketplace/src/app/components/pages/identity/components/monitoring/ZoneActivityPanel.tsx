import { Panel } from "../shared/Panel";
import { MapPin, TrendingUp, TrendingDown, Minus, Camera, ShieldAlert, UserRoundX, Ban } from "lucide-react";
import { IDENTITY_ZONES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";

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

const STATUS_COLOR: Record<string, string> = {
  GREEN:    "#047857",
  AMBER:    "#B45309",
  WATCH:    "#C2410C",
  CRITICAL: "#B91C1C",
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

type ZoneRow = (typeof IDENTITY_ZONES)[number];

export const ZoneActivityPanel = ({ terminology, onCameraClick, onEntityClick }: Props) => {
  const columns: DataGridColumn<ZoneRow>[] = [
    {
      key: "zone",
      header: "Zone",
      width: "1fr",
      render: (zone, hovered) => {
        const dot = STATUS_DOT[zone.status] ?? STATUS_DOT.GREEN;
        const isCritical = zone.status === "CRITICAL";
        return (
          <div className="flex items-center gap-2">
            <span className={cn("w-2 h-2 rounded-full shrink-0", dot, isCritical && "animate-pulse")} />
            <InterCell hovered={hovered} isPrimary>{zone.zone_name}</InterCell>
          </div>
        );
      },
    },
    {
      key: "identifications",
      header: `${terminology.identLabel}s`,
      width: "110px",
      align: "right",
      render: (zone, hovered) => {
        const color = STATUS_COLOR[zone.status] ?? STATUS_COLOR.GREEN;
        return (
          <MonoCell hovered={hovered} isPrimary fontSize={14} color={color} hoveredColor="#0F172A">
            {zone.identifications}
          </MonoCell>
        );
      },
    },
    {
      key: "cameras",
      header: "Cameras",
      width: "90px",
      align: "right",
      render: (zone, hovered) => (
        <MonoCell hovered={hovered}>{ACTIVE_CAMERAS[zone.zone_id] ?? 1}</MonoCell>
      ),
    },
    {
      key: "peak",
      header: "Peak Window",
      width: "130px",
      align: "right",
      render: (zone, hovered) => (
        <MonoCell hovered={hovered} fontSize={10} color="#64748B">
          {PEAK_WINDOW[zone.zone_id] ?? "—"}
        </MonoCell>
      ),
    },
    {
      key: "trend",
      header: "Trend",
      width: "70px",
      align: "center",
      render: (zone) => {
        const trend = ZONE_TREND[zone.zone_id] ?? "stable";
        return (
          <>
            {trend === "up"     && <TrendingUp   className="w-3.5 h-3.5 text-red-400 inline" />}
            {trend === "down"   && <TrendingDown  className="w-3.5 h-3.5 text-emerald-500 inline" />}
            {trend === "stable" && <Minus         className="w-3.5 h-3.5 text-neutral-300 inline" />}
          </>
        );
      },
    },
    {
      key: "riskMix",
      header: "Risk Mix",
      width: "320px",
      render: (zone) => (
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
      ),
    },
    {
      key: "lastEvent",
      header: "Last Event",
      width: "120px",
      align: "right",
      render: (zone, hovered) => (
        <MonoCell hovered={hovered} fontSize={10} color="#94A3B8">
          {LAST_EVENT[zone.zone_id] ?? "—"}
        </MonoCell>
      ),
    },
    {
      key: "cameraIcon",
      header: "",
      width: "64px",
      align: "right",
      render: (_zone, hovered) => (
        <Camera className={cn("w-3.5 h-3.5 transition-colors inline", hovered ? "text-[#00775B]" : "text-neutral-300")} />
      ),
    },
  ];

  return (
    <Panel
      title="Zone Activity"
      icon={MapPin}
      info={`Live ${terminology.identLabel.toLowerCase()} counts, active cameras, and risk indicators by zone. Click any row to view camera feed.`}
    >
      <div className="-mx-4 -mb-4">
        <DataGrid<ZoneRow>
          columns={columns}
          data={IDENTITY_ZONES}
          getRowId={(row) => row.zone_id}
          onRowClick={onCameraClick ? (row) => onCameraClick(row.zone_id) : undefined}
        />
      </div>
    </Panel>
  );
};
