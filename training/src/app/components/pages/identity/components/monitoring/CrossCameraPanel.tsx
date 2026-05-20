import { Panel } from "../shared/Panel";
import { Waypoints, Map, ArrowRight } from "lucide-react";
import { CROSS_CAMERA_TRACKS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";

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

type TrackRow = (typeof CROSS_CAMERA_TRACKS)[number];

export const CrossCameraPanel = ({ terminology, onJourneyClick }: Props) => {
  const title = terminology.isLPR ? "Vehicle Path" : "Movement Trail";
  const subtitle = terminology.isLPR
    ? "Vehicle routes traced across multiple access points"
    : "Individuals traced across multiple zones";

  const columns: DataGridColumn<TrackRow>[] = [
    {
      key: "subject",
      header: "Subject",
      width: "1fr",
      render: (track, hovered) => (
        <div>
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
            <InterCell hovered={hovered} isPrimary fontSize={12}>{track.tracker_id}</InterCell>
          </div>
          <div className="mt-0.5 text-[10px] text-neutral-400">{track.zones.join(" · ")}</div>
        </div>
      ),
    },
    {
      key: "path",
      header: "Path",
      width: "2fr",
      render: (track) => (
        <div>
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
        </div>
      ),
    },
    {
      key: "active",
      header: "Active",
      width: "80px",
      align: "right",
      render: (track, hovered) => (
        <MonoCell hovered={hovered} isPrimary fontSize={15}>{formatDuration(track.duration_sec)}</MonoCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "80px",
      align: "center",
      render: () => (
        <span className="inline-flex items-center gap-1 rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-emerald-700">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Live
        </span>
      ),
    },
    {
      key: "action",
      header: "",
      width: "88px",
      render: (_track, hovered) => onJourneyClick ? (
        <GridActions visible={hovered}>
          <GridActionButton title="View Map" hoverColor="#00775B" onClick={onJourneyClick}>
            <Map className="h-3 w-3" />
          </GridActionButton>
        </GridActions>
      ) : null,
    },
  ];

  return (
    <Panel
      title={title}
      icon={Waypoints}
      info={`${subtitle}. Click 'View Map' to see the full floor-plan journey with timestamps.`}
    >
      <div className="-mx-4 -mb-4">
        <DataGrid<TrackRow>
          columns={columns}
          data={CROSS_CAMERA_TRACKS}
          getRowId={(row) => row.tracker_id}
        />
      </div>
    </Panel>
  );
};
