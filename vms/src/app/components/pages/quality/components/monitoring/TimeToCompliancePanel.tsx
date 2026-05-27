import { Panel } from "../shared/Panel";
import { Timer } from "lucide-react";
import { TTC_BUCKETS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const TimeToCompliancePanel = ({ terminology: _terminology }: Props) => {
  const totalEvents = TTC_BUCKETS.reduce((s, b) => s + b.count, 0);
  // Weighted average (approximate seconds)
  const midpoints = [15, 45, 150, 360]; // seconds
  const avgSeconds = Math.round(
    TTC_BUCKETS.reduce((s, b, i) => s + b.count * midpoints[i], 0) / totalEvents
  );
  const avgDisplay =
    avgSeconds < 60
      ? `${avgSeconds}s`
      : `${Math.floor(avgSeconds / 60)}m ${avgSeconds % 60}s`;

  return (
    <Panel
      title="Time to Compliance"
      icon={Timer}
      info="How quickly workers return to a compliant state after a violation is detected."
    >
      <div className="flex flex-col gap-4">
        {/* Big stat */}
        <div className="flex flex-col items-center py-2">
          <p className="text-4xl font-black font-data tabular-nums text-neutral-900">{avgDisplay}</p>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1">
            Avg Time to Compliance
          </p>
        </div>

        {/* Histogram */}
        <ResponsiveContainer width="100%" height={100}>
          <BarChart data={TTC_BUCKETS} margin={{ top: 0, right: 4, left: -24, bottom: 0 }}>
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
              formatter={(v: number) => [v, "Events"]}
            />
            <Bar dataKey="count" radius={[3, 3, 0, 0]}>
              {TTC_BUCKETS.map((b) => (
                <Cell key={b.label} fill={b.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Legend */}
        <div className="flex flex-wrap gap-2 justify-center">
          {TTC_BUCKETS.map((b) => (
            <div key={b.label} className="flex items-center gap-1 text-[10px] text-neutral-500">
              <span
                className="w-2 h-2 rounded-sm inline-block"
                style={{ backgroundColor: b.color }}
              />
              {b.label}: {b.count}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
};
