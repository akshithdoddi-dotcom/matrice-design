import { useState } from "react";
import { Panel } from "../shared/Panel";
import { Clock } from "lucide-react";
import { HOURLY_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
  Cell,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

// Shift boundaries (hours)
const SHIFT_BOUNDARIES = [6, 14, 22];

export const DailyQualityHourSection = ({ terminology }: Props) => {
  const [mode, setMode] = useState<"compliance" | "violations">("compliance");

  const worstHour = HOURLY_DATA.reduce((prev, curr) =>
    curr.compliance_pct < prev.compliance_pct ? curr : prev
  );

  const getBarColor = (status: "GREEN" | "AMBER" | "RED") => {
    if (status === "GREEN") return "#00775B";
    if (status === "AMBER") return "#F59E0B";
    return "#EF4444";
  };

  return (
    <Panel
      title={`Hourly ${terminology.primaryMetricLabel} — Today (with Shift Boundaries)`}
      icon={Clock}
      info="Compliance rate by hour with vertical shift boundaries. Worst hour annotated."
    >
      {/* Toggle */}
      <div className="flex items-center justify-end mb-3 gap-1">
        <button
          onClick={() => setMode("compliance")}
          className={cn(
            "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
            mode === "compliance"
              ? "bg-[#00775B] text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
          )}
        >
          Compliance %
        </button>
        <button
          onClick={() => setMode("violations")}
          className={cn(
            "px-3 py-1 text-[10px] font-bold rounded-md transition-all",
            mode === "violations"
              ? "bg-red-500 text-white"
              : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
          )}
        >
          {terminology.negativeCountLabel}
        </button>
      </div>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={HOURLY_DATA} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            tickFormatter={(v: string) => v.slice(0, 5)}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "#94A3B8" }}
            domain={mode === "compliance" ? [60, 100] : [0, "auto"]}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: 11, borderRadius: 8 }}
            formatter={(value: number) => [
              mode === "compliance" ? `${value}%` : value,
              mode === "compliance" ? terminology.primaryMetricLabel : terminology.negativeCountLabel,
            ]}
          />
          {mode === "compliance" && (
            <ReferenceLine
              y={90}
              stroke="#00775B"
              strokeDasharray="4 3"
              strokeWidth={1.5}
              label={{ value: "Target 90%", position: "right", fontSize: 9, fill: "#00775B" }}
            />
          )}
          {/* Shift boundary reference lines */}
          {SHIFT_BOUNDARIES.map((shiftHour) => {
            const dataPoint = HOURLY_DATA.find((d) => d.hour === shiftHour);
            if (!dataPoint) return null;
            return (
              <ReferenceLine
                key={`shift-${shiftHour}`}
                x={dataPoint.label}
                stroke="#6366F1"
                strokeDasharray="6 3"
                strokeWidth={1.5}
                label={{
                  value: `Shift ${shiftHour === 6 ? "A" : shiftHour === 14 ? "B" : "C"}`,
                  position: "top",
                  fontSize: 8,
                  fill: "#6366F1",
                }}
              />
            );
          })}
          <Bar
            dataKey={mode === "compliance" ? "compliance_pct" : "violation_count"}
            radius={[3, 3, 0, 0]}
            maxBarSize={28}
          >
            {HOURLY_DATA.map((entry) => (
              <Cell
                key={entry.hour}
                fill={
                  mode === "compliance"
                    ? getBarColor(entry.status)
                    : entry.hour === worstHour.hour
                    ? "#EF4444"
                    : "#F97316"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="mt-2 flex items-center gap-4 text-[10px] text-neutral-500 flex-wrap">
        <span className="flex items-center gap-1">
          <span className="w-3 h-0.5 bg-indigo-500 inline-block" style={{ borderTop: "2px dashed #6366F1" }} />
          <span>Shift boundaries</span>
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
          Peak non-compliance: {worstHour.label} — {worstHour.compliance_pct}% ({worstHour.violation_count}{" "}
          {terminology.negativeEventLabel.toLowerCase()}s)
        </span>
      </div>
    </Panel>
  );
};
