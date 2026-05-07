import { AlertTriangle } from "lucide-react";
import { VIOLATION_TYPE_LIVE, COUNT_VS_TIME } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const ViolationInsightsPanel = ({ terminology }: Props) => {
  const sorted = [...VIOLATION_TYPE_LIVE].sort((a, b) => b.count - a.count);
  const total = sorted.reduce((s, d) => s + d.count, 0);

  // Downsample COUNT_VS_TIME to every 5 minutes for chart
  const chartData = COUNT_VS_TIME.filter((_, i) => i % 5 === 0).map((p) => ({
    t: `${p.t}m`,
    violations: p.violation,
    compliant: p.compliant,
  }));

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-50">
        <AlertTriangle className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          {terminology.negativeEventLabel} Breakdown &amp; Activity
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[220px,1fr] divide-y md:divide-y-0 md:divide-x divide-neutral-100">

        {/* Left: Violation type table */}
        <div className="px-4 py-3">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-2">
            By Type — Live
          </div>
          <div className="space-y-1">
            {sorted.map((item, i) => {
              const pct = Math.round((item.count / total) * 100);
              return (
                <div key={item.type} className="flex items-center gap-2 py-0.5">
                  <span className="w-3.5 text-[10px] font-black text-neutral-300 text-right tabular-nums shrink-0">{i + 1}</span>
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="w-[72px] shrink-0 text-[11px] text-neutral-700 truncate">{item.type}</span>
                  <div className="flex-1 h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${pct}%`, backgroundColor: item.color }}
                    />
                  </div>
                  <span className="w-5 text-right font-data tabular-nums text-[11px] font-black text-neutral-800 shrink-0">{item.count}</span>
                </div>
              );
            })}
          </div>
          <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400">
            <span>Total</span>
            <span className="font-black font-data tabular-nums text-neutral-700">{total} {terminology.negativeEventLabel.toLowerCase()}s</span>
          </div>
        </div>

        {/* Right: Count vs Time chart */}
        <div className="px-4 pt-3 pb-2 flex flex-col">
          <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-1">
            {terminology.negativeEventLabel} Count — Last 60 Minutes
          </div>
          <div className="flex-1 min-h-0">
            <ResponsiveContainer width="100%" height={120}>
              <AreaChart data={chartData} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
                <defs>
                  <linearGradient id="violGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f5f5f5" vertical={false} />
                <XAxis
                  dataKey="t"
                  tick={{ fontSize: 8, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  interval={2}
                />
                <YAxis
                  tick={{ fontSize: 8, fill: "#94A3B8" }}
                  axisLine={false}
                  tickLine={false}
                  width={28}
                />
                <Tooltip
                  contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb", padding: "4px 8px" }}
                  formatter={(v: number, name: string) => [v, name === "violations" ? terminology.negativeCountLabel : "Compliant"]}
                />
                <Area
                  type="monotone"
                  dataKey="violations"
                  stroke="#EF4444"
                  strokeWidth={1.5}
                  fill="url(#violGrad)"
                  dot={false}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="flex items-center gap-1 mt-1">
            <span className="w-3 h-0.5 bg-red-400 inline-block rounded-full" />
            <span className="text-[10px] text-neutral-400">{terminology.negativeEventLabel}s over last hour</span>
          </div>
        </div>
      </div>
    </div>
  );
};
