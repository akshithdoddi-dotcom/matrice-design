import { Panel } from "../shared/Panel";
import { ShieldCheck } from "lucide-react";
import { SHIFT_BARS, VIOLATION_TYPE_LIVE } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

// Generate 7-day violation type distribution from VIOLATION_TYPE_LIVE
const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const MULTIPLIERS = [0.9, 1.1, 1.0, 1.2, 0.8, 0.6, 0.7];
const sevenDayViolationData = DAYS.map((day, i) => {
  const entry: Record<string, string | number> = { day };
  VIOLATION_TYPE_LIVE.forEach((v) => {
    entry[v.type] = Math.round(v.count * MULTIPLIERS[i]);
  });
  return entry;
});

export const SafeVsUnsafeSection = ({ terminology }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: stacked bar by shift */}
      <Panel
        title={`${terminology.safeLabel} vs. ${terminology.unsafeLabel} by Shift`}
        icon={ShieldCheck}
        info="Stacked bar showing compliant and non-compliant counts per shift."
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={SHIFT_BARS} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#94A3B8" }}
              tickFormatter={(v: string) => v.split(" ")[0]}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
              formatter={(value: number, name: string) => [
                `${value} (${((value / (SHIFT_BARS.reduce((s, b) => s + b.safe_count + b.unsafe_count, 0) / SHIFT_BARS.length)) * 100).toFixed(0)}%)`,
                name,
              ]}
            />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar
              dataKey="safe_count"
              name={terminology.safeLabel}
              stackId="a"
              fill="#00775B"
              maxBarSize={48}
            />
            <Bar
              dataKey="unsafe_count"
              name={terminology.unsafeLabel}
              stackId="a"
              fill="#EF4444"
              radius={[3, 3, 0, 0]}
              maxBarSize={48}
            />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      {/* Right: stacked by violation type per day */}
      <Panel
        title={`${terminology.negativeEventLabel} Type Distribution — 7 Days`}
        icon={ShieldCheck}
        info={`${terminology.negativeEventLabel} breakdown by type over the past 7 days.`}
      >
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={sevenDayViolationData}
            margin={{ top: 8, right: 8, left: -20, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 9, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            {VIOLATION_TYPE_LIVE.map((v) => (
              <Bar
                key={v.type}
                dataKey={v.type}
                stackId="b"
                fill={v.color}
                maxBarSize={36}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
};
