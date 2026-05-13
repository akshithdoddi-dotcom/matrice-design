import { Panel } from "../shared/Panel";
import { BarChart2 } from "lucide-react";
import { HOURLY_IDENT_DATA, WEEKLY_VISIT_DATA } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";
import { useState } from "react";

interface Props { terminology: IdentityTerminology; timeRange: string }

export const VolumeSection = ({ terminology, timeRange: _timeRange }: Props) => {
  const [view, setView] = useState<"today" | "week">("today");
  const data = view === "today" ? HOURLY_IDENT_DATA : WEEKLY_VISIT_DATA;
  const xKey = view === "today" ? "label" : "day";
  const peakValue = view === "today"
    ? Math.max(...HOURLY_IDENT_DATA.map((d) => d.total))
    : Math.max(...WEEKLY_VISIT_DATA.map((d) => d.identifications));

  return (
    <Panel
      title={`${terminology.identLabel} Volume`}
      icon={BarChart2}
      info={`${terminology.identLabel} events broken down by ${view === "today" ? "hour (today)" : "day (this week)"}. Includes matched, unknown, and denied.`}
      headerRight={
        <div className="flex items-center gap-1 rounded-lg bg-neutral-100 p-0.5">
          {(["today", "week"] as const).map((v) => (
            <button
              key={v}
              onClick={(e) => { e.stopPropagation(); setView(v); }}
              className={`text-[10px] font-bold px-2 py-1 rounded-md transition-colors ${
                view === v ? "bg-white text-neutral-800 shadow-sm" : "text-neutral-500 hover:text-neutral-700"
              }`}
            >
              {v === "today" ? "Today" : "7 Days"}
            </button>
          ))}
        </div>
      }
    >
      <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
        <BarChart
          data={data}
          margin={{ top: 4, right: 4, bottom: 0, left: -10 }}
          barCategoryGap="30%"
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey={xKey} tick={{ fontSize: 9 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <ReferenceLine
            y={peakValue * 0.8}
            stroke="#94A3B8"
            strokeDasharray="3 3"
            label={{ value: "80% peak", fontSize: 9, fill: "#94A3B8" }}
          />
          <Bar dataKey={view === "today" ? "matched" : "identifications"} fill="#00775B" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Matched" stackId="a" />
          <Bar dataKey="unknown" fill="#94A3B8" radius={[0, 0, 0, 0]} isAnimationActive={false} name="Unknown" stackId="a" />
          <Bar dataKey="denied" fill="#EF4444" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Denied" stackId="a" />
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
};
