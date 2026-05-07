import { Clock } from "lucide-react";
import { HOURLY_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const HourlyCompliancePanel = ({ terminology }: Props) => {
  const worstHour = [...HOURLY_DATA].sort((a, b) => a.compliance_pct - b.compliance_pct)[0];

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
        <div className="flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-[#00775B]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            Hourly {terminology.primaryMetricLabel}
          </span>
        </div>
        <div className="text-[10px] text-neutral-400">
          Worst hour:{" "}
          <span className="font-bold text-red-600 font-data tabular-nums">
            {worstHour.label} ({worstHour.compliance_pct.toFixed(0)}%)
          </span>
        </div>
      </div>
      <div className="p-4">
        <ResponsiveContainer width="100%" height={160}>
          <ComposedChart data={HOURLY_DATA} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
            <defs>
              <linearGradient id="complianceLineGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00775B" stopOpacity={0.1} />
                <stop offset="100%" stopColor="#00775B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 8, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              interval={2}
            />
            <YAxis
              yAxisId="left"
              domain={[60, 100]}
              tick={{ fontSize: 8, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={(v) => `${v}%`}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tick={{ fontSize: 8, fill: "#94A3B8" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }}
              formatter={(value: number, name: string) => [
                name === "compliance_pct" ? `${value.toFixed(1)}%` : `${value}`,
                name === "compliance_pct" ? terminology.primaryMetricLabel : terminology.negativeCountLabel,
              ]}
            />
            <ReferenceLine yAxisId="left" y={90} stroke="#00775B" strokeDasharray="4 4" strokeWidth={1} label={{ value: "Target 90%", fontSize: 8, fill: "#00775B" }} />
            <Bar yAxisId="right" dataKey="violation_count" fill="#FEE2E2" radius={[2, 2, 0, 0]} maxBarSize={12} isAnimationActive={false} />
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="compliance_pct"
              stroke="#00775B"
              strokeWidth={2}
              dot={false}
              isAnimationActive={false}
            />
          </ComposedChart>
        </ResponsiveContainer>
        <div className="mt-2 flex items-center gap-4 text-[10px] text-neutral-400">
          <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-[#00775B] inline-block" /> {terminology.primaryMetricLabel}</span>
          <span className="flex items-center gap-1"><span className="w-3 h-2 bg-red-100 inline-block rounded-sm" /> {terminology.negativeCountLabel}</span>
        </div>
      </div>
    </div>
  );
};
