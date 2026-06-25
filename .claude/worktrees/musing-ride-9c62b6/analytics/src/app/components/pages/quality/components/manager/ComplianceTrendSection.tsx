import { Panel } from "../shared/Panel";
import { TrendingUp } from "lucide-react";
import { HOURLY_DATA, SHIFT_BARS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
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
  timeRange: string;
}

export const ComplianceTrendSection = ({ terminology, timeRange: _timeRange }: Props) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {/* Left: Line chart compliance over hours */}
      <Panel
        title={`${terminology.primaryMetricLabel} Trend — Today`}
        icon={TrendingUp}
        info={`${terminology.primaryMetricLabel} by hour. Reference at 90% target. Red shading below 80%.`}
      >
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={HOURLY_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 9, fill: "#94A3B8" }}
              tickFormatter={(v: string) => v.slice(0, 5)}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              domain={[60, 100]}
              tick={{ fontSize: 9, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 11, borderRadius: 8 }}
              formatter={(v: number) => [`${v}%`, terminology.primaryMetricLabel]}
            />
            {/* Red shading below 80% */}
            <ReferenceArea y1={60} y2={80} fill="#FEE2E2" fillOpacity={0.4} />
            {/* Target reference line at 90% */}
            <ReferenceLine
              y={90}
              stroke="#00775B"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: "90%", position: "right", fontSize: 9, fill: "#00775B" }}
            />
            <Line
              type="monotone"
              dataKey="compliance_pct"
              stroke="#00775B"
              strokeWidth={2}
              dot={{ r: 3, fill: "#00775B" }}
              activeDot={{ r: 5 }}
              name={terminology.primaryMetricLabel}
            />
          </LineChart>
        </ResponsiveContainer>
      </Panel>

      {/* Right: Grouped bar chart by shift */}
      <Panel
        title={`${terminology.negativeCountLabel} by Shift`}
        icon={TrendingUp}
        info={`Total ${terminology.negativeEventLabel.toLowerCase()} count per shift.`}
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
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
            <Bar
              dataKey="unsafe_count"
              name={terminology.negativeCountLabel}
              fill="#EF4444"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />
            <Bar
              dataKey="safe_count"
              name={terminology.safeLabel}
              fill="#00775B"
              radius={[3, 3, 0, 0]}
              maxBarSize={40}
            />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
};
