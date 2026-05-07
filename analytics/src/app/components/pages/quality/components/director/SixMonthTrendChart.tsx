import { Panel } from "../shared/Panel";
import { TrendingUp } from "lucide-react";
import { SIX_MONTH_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ReferenceArea,
  ResponsiveContainer,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const SixMonthTrendChart = ({ terminology }: Props) => {
  return (
    <Panel
      title="6-Month Trend"
      icon={TrendingUp}
      info={`${terminology.primaryMetricLabel} (bars, left axis) and ${terminology.negativeEventLabel} rate (dashed line, right axis) over the last 6 months.`}
    >
      <ResponsiveContainer width="100%" height={260}>
        <ComposedChart data={SIX_MONTH_DATA} margin={{ top: 16, right: 24, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            yAxisId="left"
            domain={[70, 100]}
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            domain={[0, 5]}
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v) => `${v}%`}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(value: number, name: string) => [
              `${value.toFixed(1)}%`,
              name,
            ]}
          />
          <Legend iconSize={10} wrapperStyle={{ fontSize: 10 }} />

          {/* Green reference band >=90% */}
          <ReferenceArea
            yAxisId="left"
            y1={90}
            y2={100}
            fill="#DCFCE7"
            fillOpacity={0.5}
          />

          {/* Target 90% reference line */}
          <ReferenceLine
            yAxisId="left"
            y={90}
            stroke="#00775B"
            strokeDasharray="4 3"
            strokeWidth={1.5}
            label={{ value: "Target 90%", position: "insideTopLeft", fontSize: 9, fill: "#00775B" }}
          />

          {/* Annotations */}
          <ReferenceLine
            yAxisId="left"
            x="Dec 25"
            stroke="#6366F1"
            strokeDasharray="4 3"
            label={{ value: "PPE policy updated", position: "top", fontSize: 8, fill: "#6366F1" }}
          />
          <ReferenceLine
            yAxisId="left"
            x="Feb 26"
            stroke="#F97316"
            strokeDasharray="4 3"
            label={{ value: "New helmets issued", position: "top", fontSize: 8, fill: "#F97316" }}
          />

          <Bar
            yAxisId="left"
            dataKey="compliance_pct"
            name={terminology.primaryMetricLabel}
            fill="#00775B"
            opacity={0.8}
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="defect_rate_pct"
            name={`${terminology.negativeEventLabel} Rate`}
            stroke="#EF4444"
            strokeWidth={2}
            strokeDasharray="6 3"
            dot={{ r: 4, fill: "#EF4444" }}
            activeDot={{ r: 6 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Panel>
  );
};
