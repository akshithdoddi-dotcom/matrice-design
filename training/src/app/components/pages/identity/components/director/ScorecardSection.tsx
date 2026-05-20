import { Panel } from "../shared/Panel";
import { ClipboardCheck } from "lucide-react";
import { IDENTITY_SCORECARD, SIX_MONTH_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell, StatusCapsule } from "@fe-common/components/ui/DataGrid";

interface Props { terminology: IdentityTerminology }

const STATUS_BADGE: Record<string, string> = {
  ON_TRACK:   "border-emerald-200 bg-emerald-50 text-emerald-700",
  WATCH:      "border-amber-200 bg-amber-50 text-amber-700",
  OFF_TARGET: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LEFT: Record<string, string> = {
  ON_TRACK:   "border-l-transparent",
  WATCH:      "border-l-amber-400",
  OFF_TARGET: "border-l-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK:   "On Track",
  WATCH:      "Monitor",
  OFF_TARGET: "Off Target",
};

export const ScorecardSection = ({ terminology: _terminology }: Props) => {
  const onTrack   = IDENTITY_SCORECARD.filter((r) => r.status === "ON_TRACK").length;
  const watch     = IDENTITY_SCORECARD.filter((r) => r.status === "WATCH").length;
  const offTarget = IDENTITY_SCORECARD.filter((r) => r.status === "OFF_TARGET").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      {/* Monthly Blacklist Hit Trend — fills full card height */}
      <Panel
        title="Monthly Blacklist Hit Trend"
        icon={ClipboardCheck}
        info="Blacklist hits over the past 6 months."
        grow
      >
        <div className="flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SIX_MONTH_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb", padding: "4px 8px" }}
                formatter={(v: number) => [v, "Blacklist Hits"]}
              />
              <Bar dataKey="blacklist_hits" fill="#DC2626" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Blacklist Hits" maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Performance Scorecard */}
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Performance Scorecard</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="text-emerald-600">{onTrack} On Track</span>
            <span className="text-neutral-300">·</span>
            <span className="text-amber-600">{watch} Monitor</span>
            <span className="text-neutral-300">·</span>
            <span className="text-red-500">{offTarget} Off Target</span>
          </div>
        </div>
        {(() => {
          type ScorecardRow = (typeof IDENTITY_SCORECARD)[number];
          const scorecardColumns: DataGridColumn<ScorecardRow>[] = [
            {
              key: "metric",
              header: "Metric",
              width: "1fr",
              render: (row, hovered) => (
                <InterCell hovered={hovered} isPrimary fontSize={11}>{row.metric}</InterCell>
              ),
            },
            {
              key: "this_period",
              header: "This Period",
              width: "100px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} isPrimary fontSize={12}>{row.this_period}{row.unit}</MonoCell>
              ),
            },
            {
              key: "last_period",
              header: "Last Period",
              width: "100px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={11} color="#64748B">{row.last_period}{row.unit}</MonoCell>
              ),
            },
            {
              key: "target",
              header: "Target",
              width: "90px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={11} color="#94A3B8">{row.target}{row.unit}</MonoCell>
              ),
            },
            {
              key: "status",
              header: "Status",
              width: "100px",
              align: "center",
              render: (row) => {
                const statusMap: Record<string, string> = {
                  ON_TRACK: "active",
                  WATCH: "warning",
                  OFF_TARGET: "critical",
                };
                const labelMap: Record<string, string> = {
                  ON_TRACK: "On Track",
                  WATCH: "Monitor",
                  OFF_TARGET: "Off Target",
                };
                return <StatusCapsule status={statusMap[row.status] ?? "unknown"} label={labelMap[row.status]} />;
              },
            },
          ];

          return (
            <div className="flex-1 overflow-hidden">
              <DataGrid<ScorecardRow>
                columns={scorecardColumns}
                data={IDENTITY_SCORECARD}
                getRowId={(row) => row.metric}
              />
            </div>
          );
        })()}
      </div>
    </div>
  );
};
