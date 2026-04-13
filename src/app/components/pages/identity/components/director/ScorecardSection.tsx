import { Panel } from "../shared/Panel";
import { ClipboardCheck } from "lucide-react";
import { IDENTITY_SCORECARD, SIX_MONTH_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

const STATUS_BADGE: Record<string, string> = {
  ON_TRACK:   "border-emerald-200 bg-emerald-50 text-emerald-700",
  WATCH:      "border-amber-200 bg-amber-50 text-amber-700",
  OFF_TARGET: "border-red-200 bg-red-50 text-red-700",
};

const STATUS_LEFT: Record<string, string> = {
  ON_TRACK:   "border-l-transparent",
  WATCH:      "border-l-amber-400",
  OFF_TARGET: "border-l-red-500",
};

const STATUS_LABEL: Record<string, string> = {
  ON_TRACK:   "On Track",
  WATCH:      "Monitor",
  OFF_TARGET: "Off Target",
};

export const ScorecardSection = ({ terminology: _terminology }: Props) => {
  const onTrack   = IDENTITY_SCORECARD.filter((r) => r.status === "ON_TRACK").length;
  const watch     = IDENTITY_SCORECARD.filter((r) => r.status === "WATCH").length;
  const offTarget = IDENTITY_SCORECARD.filter((r) => r.status === "OFF_TARGET").length;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
      {/* Monthly Blacklist Hit Trend — fills full card height */}
      <Panel
        title="Monthly Blacklist Hit Trend"
        icon={ClipboardCheck}
        info="Blacklist hits over the past 6 months."
        grow
      >
        <div className="flex-1 min-h-[180px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={SIX_MONTH_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb", padding: "4px 8px" }}
                formatter={(v: number) => [v, "Blacklist Hits"]}
              />
              <Bar dataKey="blacklist_hits" fill="#DC2626" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Blacklist Hits" maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Panel>

      {/* Performance Scorecard */}
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50 shrink-0">
          <div className="flex items-center gap-2">
            <ClipboardCheck className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Performance Scorecard</span>
          </div>
          <div className="flex items-center gap-3 text-[10px] font-bold">
            <span className="text-emerald-600">{onTrack} On Track</span>
            <span className="text-neutral-300">·</span>
            <span className="text-amber-600">{watch} Monitor</span>
            <span className="text-neutral-300">·</span>
            <span className="text-red-500">{offTarget} Off Target</span>
          </div>
        </div>
        <div className="overflow-x-auto flex-1">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-neutral-100 bg-neutral-50/80">
                <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Metric</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">This Period</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Last Period</th>
                <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Target</th>
                <th className="pl-2 pr-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-50">
              {IDENTITY_SCORECARD.map((row) => (
                <tr
                  key={row.metric}
                  className={cn("border-l-2 hover:bg-neutral-50/60 transition-colors", STATUS_LEFT[row.status])}
                >
                  <td className="pl-4 pr-2 py-2.5 text-[11px] font-semibold text-neutral-700">{row.metric}</td>
                  <td className="px-2 py-2.5 text-right font-data tabular-nums text-[12px] font-black text-neutral-900">
                    {row.this_period}{row.unit}
                  </td>
                  <td className="px-2 py-2.5 text-right font-data tabular-nums text-[11px] text-neutral-500">
                    {row.last_period}{row.unit}
                  </td>
                  <td className="px-2 py-2.5 text-right font-data tabular-nums text-[11px] text-neutral-400">
                    {row.target}{row.unit}
                  </td>
                  <td className="pl-2 pr-4 py-2.5 text-center">
                    <span className={cn(
                      "inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase tracking-wide",
                      STATUS_BADGE[row.status]
                    )}>
                      {STATUS_LABEL[row.status]}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
