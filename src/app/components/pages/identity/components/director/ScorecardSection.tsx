import { Panel } from "../shared/Panel";
import { ClipboardCheck } from "lucide-react";
import { IDENTITY_SCORECARD, SIX_MONTH_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

const STATUS_SYMBOL: Record<string, string> = {
  ON_TRACK:  "✓",
  WATCH:     "⚠",
  OFF_TARGET: "✗",
};

const STATUS_STYLE: Record<string, string> = {
  ON_TRACK:   "text-emerald-600",
  WATCH:      "text-amber-600",
  OFF_TARGET: "text-red-600",
};

const STATUS_ROW_BG: Record<string, string> = {
  ON_TRACK:   "",
  WATCH:      "bg-amber-50",
  OFF_TARGET: "bg-red-50",
};

export const ScorecardSection = ({ terminology: _terminology }: Props) => (
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
    {/* Incident trend by month */}
    <Panel
      title="Monthly Blacklist Hit Trend"
      icon={ClipboardCheck}
      info="Blacklist hits and total identifications over the past 6 months."
    >
      <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
        <BarChart data={SIX_MONTH_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 9 }} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <Bar dataKey="blacklist_hits" fill="#DC2626" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Blacklist Hits" />
        </BarChart>
      </ResponsiveContainer>
    </Panel>

    {/* Scorecard table */}
    <Panel
      title="Performance Scorecard"
      icon={ClipboardCheck}
      info="Key performance metrics vs targets. ✓ = On Track, ⚠ = Watch, ✗ = Off Target"
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Metric</th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">This Period</th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Last Period</th>
              <th className="text-right py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Target</th>
              <th className="text-center py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400">Status</th>
            </tr>
          </thead>
          <tbody>
            {IDENTITY_SCORECARD.map((row) => (
              <tr key={row.metric} className={cn("border-b border-neutral-50 hover:bg-neutral-50 transition-colors", STATUS_ROW_BG[row.status])}>
                <td className="py-2.5 px-2 font-medium text-neutral-800">{row.metric}</td>
                <td className="py-2.5 px-2 text-right tabular-nums font-data font-semibold text-neutral-900">
                  {row.this_period}{row.unit}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums font-data text-neutral-500">
                  {row.last_period}{row.unit}
                </td>
                <td className="py-2.5 px-2 text-right tabular-nums font-data text-neutral-500">
                  {row.target}{row.unit}
                </td>
                <td className={cn("py-2.5 px-2 text-center text-sm font-black", STATUS_STYLE[row.status])}>
                  {STATUS_SYMBOL[row.status]}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[10px] text-neutral-400">
        <span className="text-emerald-600 font-bold">✓ On Track: {IDENTITY_SCORECARD.filter((r) => r.status === "ON_TRACK").length}</span>
        <span className="text-amber-600 font-bold">⚠ Watch: {IDENTITY_SCORECARD.filter((r) => r.status === "WATCH").length}</span>
        <span className="text-red-600 font-bold">✗ Off Target: {IDENTITY_SCORECARD.filter((r) => r.status === "OFF_TARGET").length}</span>
      </div>
    </Panel>
  </div>
);
