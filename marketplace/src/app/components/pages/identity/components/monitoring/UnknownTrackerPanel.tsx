import { Panel } from "../shared/Panel";
import { UserX, MapPin, Radio, Eye, ShieldPlus, AlertTriangle } from "lucide-react";
import { UNKNOWN_TRACKERS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";

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

type TrackerRow = (typeof UNKNOWN_TRACKERS)[number];

export const UnknownTrackerPanel = ({ terminology, onTrackerClick }: Props) => {
  const priority: Record<string, number> = { RECURRING: 0, NEW: 1 };
  const sorted = [...UNKNOWN_TRACKERS].sort(
    (a, b) => (priority[a.badge ?? ""] ?? 2) - (priority[b.badge ?? ""] ?? 2)
  );

  const columns: DataGridColumn<TrackerRow>[] = [
    {
      key: "capture",
      header: "Capture",
      width: "60px",
      render: (tracker) => (
        <FaceCapture seed={String(tracker.tracker_id)} confidence={tracker.confidence} />
      ),
    },
    {
      key: "id",
      header: "ID",
      width: "1fr",
      render: (tracker, hovered) => {
        const isRecurring = tracker.badge === "RECURRING";
        const isNew = tracker.badge === "NEW";
        return (
          <div>
            <div className="flex items-center gap-1.5 mb-0.5">
              <span className={cn(
                "text-[9px] font-black px-1.5 py-0.5 rounded-[2px] uppercase",
                isRecurring ? "bg-orange-500 text-white" :
                isNew       ? "bg-blue-500 text-white"   : "bg-neutral-400 text-white"
              )}>
                {tracker.badge ?? "ACTIVE"}
              </span>
            </div>
            <InterCell hovered={hovered} isPrimary>{tracker.anonymized_label}</InterCell>
            <div className="flex items-center gap-1 mt-0.5 text-[10px] text-neutral-400">
              <Radio className="w-3 h-3 text-emerald-500" />
              <MonoCell hovered={hovered} fontSize={10} color="#94A3B8">{tracker.appearances}× seen</MonoCell>
            </div>
          </div>
        );
      },
    },
    {
      key: "location",
      header: "Last Known Location",
      width: "1fr",
      render: (tracker, hovered) => {
        const currentZone = tracker.cameras[tracker.cameras.length - 1];
        return (
          <div className="flex items-center gap-1 flex-wrap">
            <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
            <InterCell hovered={hovered} isPrimary>{currentZone}</InterCell>
            {tracker.cross_camera && (
              <span className="text-[8px] font-bold px-1 py-0.5 rounded-[2px] bg-amber-100 text-amber-700 border border-amber-200">
                {tracker.cameras.length} zones
              </span>
            )}
          </div>
        );
      },
    },
    {
      key: "tracked",
      header: "Tracked",
      width: "80px",
      align: "right",
      render: (tracker, hovered) => (
        <MonoCell hovered={hovered} isPrimary>
          {formatDuration(tracker.first_seen, tracker.last_seen)}
        </MonoCell>
      ),
    },
    {
      key: "confidence",
      header: "Conf",
      width: "64px",
      align: "right",
      render: (tracker, hovered) => (
        <MonoCell
          hovered={hovered}
          color={tracker.confidence < 70 ? "#EF4444" : tracker.confidence < 80 ? "#D97706" : "#059669"}
          hoveredColor={tracker.confidence < 70 ? "#DC2626" : tracker.confidence < 80 ? "#B45309" : "#047857"}
        >
          {tracker.confidence}%
        </MonoCell>
      ),
    },
    {
      key: "actions",
      header: "Actions",
      width: "96px",
      align: "right",
      render: (tracker, hovered) => {
        const isRecurring = tracker.badge === "RECURRING";
        return (
          <GridActions visible={hovered}>
            {isRecurring && (
              <GridActionButton
                title="Alert"
                hoverColor="#EA580C"
                onClick={onTrackerClick}
              >
                <AlertTriangle className="w-3 h-3" />
              </GridActionButton>
            )}
            <GridActionButton title="View" onClick={onTrackerClick}>
              <Eye className="w-3 h-3" />
            </GridActionButton>
            <GridActionButton title="Watch" hoverColor="#D97706">
              <ShieldPlus className="w-3 h-3" />
            </GridActionButton>
          </GridActions>
        );
      },
    },
  ];

  return (
    <Panel
      title={`${terminology.unknownLabel} Tracker`}
      icon={UserX}
      info="Unrecognized individuals actively tracked. Dispatch, watch, or clear — directly inline."
    >
      <div className="-mx-4 -mb-4">
        <DataGrid<TrackerRow>
          columns={columns}
          data={sorted}
          getRowId={(row) => row.tracker_id}
        />
      </div>
    </Panel>
  );
};
