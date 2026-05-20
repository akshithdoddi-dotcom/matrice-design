import { Panel } from "../shared/Panel";
import { Users } from "lucide-react";
import { REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology, RepeatViolator } from "../../data/types";
import { DataGrid, MonoCell, InterCell, StatusCapsule, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";

interface Props {
  terminology: QualityTerminology;
}

export const RepeatViolatorsSection = ({ terminology }: Props) => {
  const recurringCount = REPEAT_VIOLATORS.filter((v) => v.badge === "RECURRING").length;

  return (
    <Panel
      title={`${terminology.repeatOffenderLabel}s`}
      icon={Users}
      info={`${terminology.entityLabel}s with 3+ ${terminology.negativeEventLabel.toLowerCase()}s in 7 days. Recurring badge = seen on 4+ days.`}
    >
      {/* Headline stat */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-50">
        <div>
          <p className="text-4xl font-black font-data text-neutral-900">{REPEAT_VIOLATORS.length}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">
            Total {terminology.repeatOffenderLabel}s
          </p>
        </div>
        <div className="ml-6">
          <p className="text-2xl font-black font-data text-amber-600">{recurringCount}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">
            Recurring (4+ days)
          </p>
        </div>
      </div>

      {/* Table */}
      <DataGrid<RepeatViolator>
        data={REPEAT_VIOLATORS}
        getRowId={(v) => v.tracker_id}
        columns={[
          {
            key: "entity_id",
            header: `${terminology.entityLabel} ID`,
            width: "1fr",
            render: (v, hovered) => (
              <InterCell hovered={hovered} isPrimary>{v.anonymized_label}</InterCell>
            ),
          },
          {
            key: "violation_count",
            header: `${terminology.negativeEventLabel}s`,
            width: "72px",
            render: (v, hovered) => (
              <MonoCell hovered={hovered} isPrimary color="#EF4444" hoveredColor="#DC2626">
                {v.violation_count}
              </MonoCell>
            ),
          },
          {
            key: "days_seen",
            header: "Days Seen",
            width: "72px",
            render: (v, hovered) => (
              <MonoCell hovered={hovered}>{v.days_seen}</MonoCell>
            ),
          },
          {
            key: "zones",
            header: "Zones",
            width: "120px",
            render: (v, hovered) => (
              <InterCell hovered={hovered} color="#64748B">{v.zones.join(", ")}</InterCell>
            ),
          },
          {
            key: "last_seen",
            header: "Last Seen",
            width: "120px",
            render: (v, hovered) => (
              <MonoCell hovered={hovered} fontSize={10} color="#94A3B8">
                {new Date(v.last_violation_ts).toLocaleString("en-GB", {
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </MonoCell>
            ),
          },
          {
            key: "top_types",
            header: "Top Types",
            width: "1fr",
            render: (v, hovered) => (
              <InterCell hovered={hovered} color="#64748B">
                {Object.entries(v.violation_types).map(([type, count]) => `${type}(${count})`).join(", ")}
              </InterCell>
            ),
          },
          {
            key: "badge",
            header: "Badge",
            width: "88px",
            render: (v) => (
              v.badge === "RECURRING"
                ? <StatusCapsule status="warning" label="RECURRING" />
                : <span className="text-[10px] text-neutral-300">—</span>
            ),
          },
          {
            key: "action",
            header: "Action",
            width: "100px",
            render: (_v, hovered) => (
              <GridActions visible={hovered}>
                <GridActionButton hoverColor="#DC2626" hoverBg="rgba(220,38,38,0.08)" title="Flag for Review">
                  <span style={{ fontSize: 10, fontWeight: 700 }}>Flag</span>
                </GridActionButton>
              </GridActions>
            ),
          },
        ]}
      />
    </Panel>
  );
};
