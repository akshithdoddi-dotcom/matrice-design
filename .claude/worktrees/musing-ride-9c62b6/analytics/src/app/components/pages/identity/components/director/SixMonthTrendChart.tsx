import { Panel } from "../shared/Panel";
import { TrendingUp } from "lucide-react";
import { SIX_MONTH_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  ComposedChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceArea, ReferenceLine,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const SixMonthTrendChart = ({ terminology }: Props) => (
  <Panel
    title={`6-Month ${terminology.matchScoreLabel} Trend`}
    icon={TrendingUp}
    info="Month-over-month identification accuracy, unknown rate, and total volume. Reference area shows target zone."
  >
    <ResponsiveContainer width="100%" height={280} minWidth={0} minHeight={0}>
      <ComposedChart data={SIX_MONTH_TREND} margin={{ top: 8, right: 40, bottom: 0, left: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="label" tick={{ fontSize: 10 }} />
        <YAxis
          yAxisId="left"
          domain={[90, 100]}
          orientation="left"
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => `${v}%`}
          label={{ value: "Accuracy %", angle: -90, position: "insideLeft", fontSize: 10, fill: "#94A3B8", dx: -4 }}
        />
        <YAxis
          yAxisId="right"
          domain={[0, 10]}
          orientation="right"
          tick={{ fontSize: 10 }}
          tickFormatter={(v) => `${v}%`}
          label={{ value: "Unknown %", angle: 90, position: "insideRight", fontSize: 10, fill: "#94A3B8", dx: 4 }}
        />
        <Tooltip
          contentStyle={{ fontSize: 11 }}
          formatter={(v: number, name: string) => [`${v}${name.includes("total") ? "" : "%"}`, name]}
        />
        <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
        <ReferenceArea yAxisId="left" y1={97} y2={100} fill="#00775B" fillOpacity={0.06} />
        <ReferenceLine yAxisId="left" y={97} stroke="#00775B" strokeDasharray="4 4"
          label={{ value: "Target 97%", fontSize: 9, fill: "#00775B" }} />
        <Line
          yAxisId="left"
          type="monotone"
          dataKey="accuracy_pct"
          stroke="#00775B"
          strokeWidth={2.5}
          dot={{ r: 4, fill: "#00775B" }}
          isAnimationActive={false}
          name="Match Accuracy"
        />
        <Line
          yAxisId="right"
          type="monotone"
          dataKey="unknown_rate_pct"
          stroke="#EF4444"
          strokeWidth={2}
          strokeDasharray="4 3"
          dot={{ r: 3, fill: "#EF4444" }}
          isAnimationActive={false}
          name={`${terminology.unknownShortLabel} Rate`}
        />
      </ComposedChart>
    </ResponsiveContainer>
  </Panel>
);
