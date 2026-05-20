import { Panel } from "../shared/Panel";
import { ClipboardList } from "lucide-react";
import { SCORECARD_DATA } from "../../data/mockData";
import type { QualityTerminology, ScorecardRow } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@fe-common/components/ui/DataGrid";

interface Props {
  terminology: QualityTerminology;
}

const STATUS_STYLES = {
  ON_TRACK:   { cell: "text-emerald-700 bg-emerald-50", pill: "bg-emerald-100 text-emerald-700" },
  WATCH:      { cell: "text-amber-700 bg-amber-50",     pill: "bg-amber-100 text-amber-700"     },
  OFF_TARGET: { cell: "text-red-700 bg-red-50",         pill: "bg-red-100 text-red-700"         },
};

export const QualityScorecard = ({ terminology: _terminology }: Props) => {
  const onTrack   = SCORECARD_DATA.filter((r) => r.status === "ON_TRACK").length;
  const watch     = SCORECARD_DATA.filter((r) => r.status === "WATCH").length;
  const offTarget = SCORECARD_DATA.filter((r) => r.status === "OFF_TARGET").length;

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit === "USD") return `$${value.toLocaleString()}`;
    return `${value.toLocaleString()} ${unit !== "violations" && unit !== "zones" && unit !== "workers" && unit !== "alerts" && unit !== "sec" ? unit : unit}`;
  };

  return (
    <Panel
      title="Quality Scorecard"
      icon={ClipboardList}
      info="Month-over-month scorecard for key quality metrics. Status is determined by comparison to target."
    >
      <DataGrid<ScorecardRow>
        data={SCORECARD_DATA}
        getRowId={(row) => row.metric}
        columns={[
          {
            key: "metric",
            header: "Metric",
            width: "1fr",
            render: (row, hovered) => (
              <InterCell hovered={hovered} isPrimary>{row.metric}</InterCell>
            ),
          },
          {
            key: "this_period",
            header: "This Month",
            width: "100px",
            render: (row, hovered) => {
              const c = row.status === "ON_TRACK" ? "#059669" : row.status === "WATCH" ? "#D97706" : "#DC2626";
              return (
                <MonoCell hovered={hovered} isPrimary color={c} hoveredColor={c}>
                  {formatValue(row.this_period, row.unit)}
                </MonoCell>
              );
            },
          },
          {
            key: "last_period",
            header: "Last Month",
            width: "100px",
            render: (row, hovered) => (
              <MonoCell hovered={hovered} color="#64748B">{formatValue(row.last_period, row.unit)}</MonoCell>
            ),
          },
          {
            key: "target",
            header: "Target",
            width: "100px",
            render: (row, hovered) => (
              <MonoCell hovered={hovered} color="#94A3B8">{formatValue(row.target, row.unit)}</MonoCell>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: "108px",
            render: (row) => (
              <StatusCapsule
                status={row.status === "ON_TRACK" ? "stable" : row.status === "WATCH" ? "warning" : "critical"}
                label={`${row.symbol} ${row.status === "ON_TRACK" ? "On Track" : row.status === "WATCH" ? "Watch" : "Off Target"}`}
              />
            ),
          },
        ]}
      />

      {/* Summary footer */}
      <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center gap-3 text-[11px] font-semibold">
        <span className="text-emerald-600">{onTrack} On Track</span>
        <span className="text-neutral-300">·</span>
        <span className="text-amber-600">{watch} Watch</span>
        <span className="text-neutral-300">·</span>
        <span className="text-red-500">{offTarget} Off Target</span>
      </div>
    </Panel>
  );
};
