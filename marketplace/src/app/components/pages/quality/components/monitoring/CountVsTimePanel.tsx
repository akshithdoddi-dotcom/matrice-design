import { Panel } from "../shared/Panel";
import { BarChart2 } from "lucide-react";
import { COUNT_VS_TIME } from "../../data/mockData";
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
  ResponsiveContainer,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const CountVsTimePanel = ({ terminology }: Props) => {
  // Compute rolling 5-point average for overlay
  const dataWithAvg = COUNT_VS_TIME.map((d, i) => {
    const window = COUNT_VS_TIME.slice(Math.max(0, i - 4), i + 1);
    const avg = window.reduce((s, p) => s + p.violation, 0) / window.length;
    return { ...d, rollingAvg: Math.round(avg * 10) / 10 };
  });

  return (
    <Panel
      title={`${terminology.negativeCountLabel} vs. Time`}
      icon={BarChart2}
      info={`Live ${terminology.negativeEventLabel.toLowerCase()} count per minute over the last hour. Green bars = compliant observations, red bars = ${terminology.negativeEventLabel.toLowerCase()}s.`}
    >
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={dataWithAvg} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="t"
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            tickFormatter={(v) => (v % 10 === 0 ? `${v}m` : "")}
            axisLine={false}
            tickLine={false}
          />
          <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(value: number, name: string) => [value, name === "compliant" ? "Compliant" : name === "violation" ? terminology.negativeEventLabel : "Rolling Avg"]}
            labelFormatter={(l) => `${l} min ago`}
          />
          <Legend
            iconSize={8}
            wrapperStyle={{ fontSize: 10 }}
            formatter={(value) =>
              value === "compliant"
                ? terminology.safeLabel
                : value === "violation"
                ? terminology.negativeEventLabel
                : "Rolling Avg"
            }
          />
          <Bar dataKey="compliant" fill="#00775B" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={6} />
          <Bar dataKey="violation" fill="#EF4444" opacity={0.8} radius={[2, 2, 0, 0]} maxBarSize={6} />
          <Line
            type="monotone"
            dataKey="rollingAvg"
            stroke="#F59E0B"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="4 2"
          />
        </ComposedChart>
      </ResponsiveContainer>
    </Panel>
  );
};
