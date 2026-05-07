import { Panel } from "../shared/Panel";
import { UserX } from "lucide-react";
import { UNKNOWN_TRACKERS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";

interface Props { terminology: IdentityTerminology }

export const UnknownSummarySection = ({ terminology }: Props) => {
  const recurring = UNKNOWN_TRACKERS.filter((t) => t.badge === "RECURRING");
  return (
    <Panel
      title={`${terminology.unknownLabel} Summary`}
      icon={UserX}
      info="Active unknown individuals tracked today. Recurring individuals require investigation."
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-black font-data text-neutral-900">{UNKNOWN_TRACKERS.length}</span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Active Trackers</span>
        </div>
        <div className="h-10 w-px bg-neutral-200" />
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-black font-data text-orange-600">{recurring.length}</span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Recurring</span>
        </div>
        <div className="h-10 w-px bg-neutral-200" />
        <div className="flex flex-col gap-0.5">
          <span className="text-3xl font-black font-data text-neutral-900">
            {UNKNOWN_TRACKERS.filter((t) => t.cross_camera).length}
          </span>
          <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Cross-Camera</span>
        </div>
      </div>

      {(() => {
        type TrackerRow = (typeof UNKNOWN_TRACKERS)[number];
        const columns: DataGridColumn<TrackerRow>[] = [
          {
            key: "id",
            header: "ID",
            width: "1fr",
            render: (tracker, hovered) => (
              <MonoCell hovered={hovered} isPrimary>{tracker.anonymized_label}</MonoCell>
            ),
          },
          {
            key: "appearances",
            header: "Appearances",
            width: "100px",
            render: (tracker, hovered) => (
              <MonoCell hovered={hovered}>{tracker.appearances}</MonoCell>
            ),
          },
          {
            key: "cameras",
            header: "Cameras",
            width: "1fr",
            render: (tracker) => (
              <div className="flex flex-wrap gap-1">
                {tracker.cameras.map((c) => (
                  <span key={c} className="text-[9px] bg-neutral-100 text-neutral-600 rounded px-1.5 py-0.5">{c}</span>
                ))}
              </div>
            ),
          },
          {
            key: "last_seen",
            header: "Last Seen",
            width: "90px",
            render: (tracker, hovered) => (
              <MonoCell hovered={hovered} color="#64748B">{tracker.last_seen}</MonoCell>
            ),
          },
          {
            key: "confidence",
            header: "Conf",
            width: "70px",
            render: (tracker, hovered) => (
              <MonoCell
                hovered={hovered}
                isPrimary
                color={tracker.confidence < 70 ? "#DC2626" : tracker.confidence < 80 ? "#D97706" : "#059669"}
                hoveredColor={tracker.confidence < 70 ? "#B91C1C" : tracker.confidence < 80 ? "#B45309" : "#047857"}
              >
                {tracker.confidence}%
              </MonoCell>
            ),
          },
          {
            key: "badge",
            header: "Badge",
            width: "90px",
            render: (tracker) => tracker.badge ? (
              <StatusCapsule
                status={tracker.badge === "RECURRING" ? "warning" : "info"}
                label={tracker.badge}
              />
            ) : null,
          },
        ];

        return (
          <div className="-mx-4 -mb-4">
            <DataGrid<TrackerRow>
              columns={columns}
              data={UNKNOWN_TRACKERS}
              getRowId={(row) => row.tracker_id}
            />
          </div>
        );
      })()}
    </Panel>
  );
};
