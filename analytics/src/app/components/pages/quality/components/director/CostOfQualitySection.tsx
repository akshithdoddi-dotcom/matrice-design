import { Panel } from "../shared/Panel";
import { DollarSign } from "lucide-react";
import { COQ_MONTHLY } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const CostOfQualitySection = ({ terminology: _terminology }: Props) => {
  const latestCoq = COQ_MONTHLY[COQ_MONTHLY.length - 1].coq;
  const prevCoq = COQ_MONTHLY[COQ_MONTHLY.length - 2].coq;
  const delta = latestCoq - prevCoq;

  const stats = [
    {
      label: "Monthly COQ",
      value: `$${latestCoq.toLocaleString()}`,
      delta: `${delta < 0 ? "" : "+"}$${Math.abs(delta).toLocaleString()} vs. last month`,
      positive: delta < 0,
    },
    {
      label: "Defects / 1000 Units",
      value: "3.2",
      delta: "-0.8 vs. last month",
      positive: true,
    },
    {
      label: "Batch Pass Rate",
      value: "97.3%",
      delta: "+0.5pp vs. last month",
      positive: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Stat cards */}
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white rounded-[4px] border border-neutral-100 p-5 shadow-sm flex flex-col gap-2"
        >
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
            {s.label}
          </p>
          <p className="text-3xl font-black font-data tabular-nums text-neutral-900">{s.value}</p>
          <p
            className={`text-[10px] font-semibold ${
              s.positive ? "text-emerald-600" : "text-red-500"
            }`}
          >
            {s.delta}
          </p>
        </div>
      ))}

      {/* COQ bar chart — spans full row below */}
      <div className="md:col-span-3">
        <Panel
          title="Cost of Quality — Monthly Trend"
          icon={DollarSign}
          info="Monthly cost of quality (COQ) in USD. Lower is better."
        >
          <ResponsiveContainer width="100%" height={180}>
            <BarChart
              data={COQ_MONTHLY}
              margin={{ top: 8, right: 8, left: 4, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 10, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "#94A3B8" }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
                formatter={(v: number) => [`$${v.toLocaleString()}`, "COQ"]}
              />
              <Bar
                dataKey="coq"
                name="Cost of Quality"
                radius={[4, 4, 0, 0]}
                maxBarSize={48}
              >
                {COQ_MONTHLY.map((entry, i) => (
                  <Cell
                    key={entry.month}
                    fill={i === COQ_MONTHLY.length - 1 ? "#00775B" : "#94A3B8"}
                    opacity={i === COQ_MONTHLY.length - 1 ? 1 : 0.6}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
};
