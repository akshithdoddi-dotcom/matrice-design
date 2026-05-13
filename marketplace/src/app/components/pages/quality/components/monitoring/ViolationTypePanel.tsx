import { Panel } from "../shared/Panel";
import { AlertTriangle } from "lucide-react";
import { VIOLATION_TYPE_LIVE } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
  ResponsiveContainer,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const ViolationTypePanel = ({ terminology }: Props) => {
  const sorted = [...VIOLATION_TYPE_LIVE].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((s, d) => s + d.count, 0);

  return (
    <Panel
      title={`${terminology.negativeEventLabel} Types (Live)`}
      icon={AlertTriangle}
      info={`Breakdown of ${terminology.negativeEventLabel.toLowerCase()} types detected in the current session.`}
    >
      <ResponsiveContainer width="100%" height={180}>
        <BarChart
          layout="vertical"
          data={sorted}
          margin={{ top: 0, right: 24, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
          <XAxis
            type="number"
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="type"
            width={80}
            tick={{ fontSize: 10, fill: "#64748B" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(value: number) => [value, terminology.negativeCountLabel]}
          />
          <Bar dataKey="count" radius={[0, 3, 3, 0]} maxBarSize={14}>
            {sorted.map((entry) => (
              <Cell key={entry.type} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 text-[10px] text-neutral-400 text-right">
        Total: <span className="font-bold text-neutral-600">{total}</span> {terminology.negativeEventLabel.toLowerCase()}s
      </div>
    </Panel>
  );
};
