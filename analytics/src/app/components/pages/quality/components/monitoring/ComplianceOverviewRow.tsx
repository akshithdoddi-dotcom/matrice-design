import { ShieldCheck, TrendingUp } from "lucide-react";
import { LIVE_STATUS, COUNT_VS_TIME } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
  terminology: QualityTerminology;
}

const Panel = ({ title, icon: Icon, children }: { title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }) => (
  <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
    <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-50">
      <Icon className="w-3.5 h-3.5 text-[#00775B]" />
      <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">{title}</span>
    </div>
    <div className="p-4">{children}</div>
  </div>
);

export const ComplianceOverviewRow = ({ terminology }: Props) => {
  const safePct = LIVE_STATUS.compliance_rate_pct;
  const unsafePct = 100 - safePct;
  const total = 980;
  const safeCount = Math.round((safePct / 100) * total);
  const unsafeCount = total - safeCount;

  // Last 20 points of COUNT_VS_TIME for a compact chart
  const chartData = COUNT_VS_TIME.slice(-20).map((p, i) => ({
    t: `${i * 3}m`,
    rate: Math.min(100, Math.round((p.compliant / (p.compliant + p.violation)) * 100)),
  }));

  const rateColor =
    safePct >= 90 ? "text-emerald-600" : safePct >= 80 ? "text-amber-600" : "text-red-600";
  const rateLineColor =
    safePct >= 90 ? "#00775B" : safePct >= 80 ? "#F59E0B" : "#EF4444";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

      {/* Left: Compliant vs Non-Compliant */}
      <Panel title={`${terminology.safeLabel} vs ${terminology.unsafeLabel}`} icon={ShieldCheck}>
        <div className="flex flex-col gap-3">
          {/* Stacked progress bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-neutral-100">
            <div
              className="h-full bg-emerald-500 transition-all duration-700 rounded-l-full"
              style={{ width: `${safePct}%` }}
            />
            <div
              className="h-full bg-red-400 transition-all duration-700 rounded-r-full"
              style={{ width: `${unsafePct}%` }}
            />
          </div>

          {/* Count boxes */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="rounded-[4px] border border-emerald-200 bg-emerald-50/50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-emerald-600 mb-1">{terminology.safeLabel}</div>
              <div className="text-3xl font-black font-data tabular-nums text-emerald-700">{safeCount}</div>
              <div className="text-[10px] text-emerald-500 mt-0.5 font-semibold">{safePct.toFixed(1)}%</div>
            </div>
            <div className="rounded-[4px] border border-red-200 bg-red-50/50 p-3">
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-red-500 mb-1">{terminology.unsafeLabel}</div>
              <div className="text-3xl font-black font-data tabular-nums text-red-600">{unsafeCount}</div>
              <div className="text-[10px] text-red-400 mt-0.5 font-semibold">{unsafePct.toFixed(1)}%</div>
            </div>
          </div>

          <p className="text-[10px] text-neutral-400 text-center">
            Based on {total.toLocaleString()} observations in current window
          </p>
        </div>
      </Panel>

      {/* Right: Compliance Rate live trend */}
      <Panel title={`${terminology.primaryMetricLabel} — Live`} icon={TrendingUp}>
        <div className="flex flex-col gap-3">
          <div className="flex items-baseline gap-3">
            <span className={cn("text-5xl font-black font-data tabular-nums leading-none", rateColor)}>
              {safePct.toFixed(1)}%
            </span>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.primaryMetricLabel}</div>
              <div className="text-[10px] text-emerald-600 font-semibold">↑ 3.2% vs yesterday</div>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={80}>
            <AreaChart data={chartData} margin={{ top: 2, right: 4, left: -28, bottom: 0 }}>
              <defs>
                <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={rateLineColor} stopOpacity={0.15} />
                  <stop offset="95%" stopColor={rateLineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="t" tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} interval={4} />
              <YAxis domain={[70, 100]} tick={{ fontSize: 8, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }}
                formatter={(v: number) => [`${v}%`, terminology.primaryMetricLabel]}
              />
              <Area
                type="monotone"
                dataKey="rate"
                stroke={rateLineColor}
                strokeWidth={1.5}
                fill="url(#rateGrad)"
                dot={false}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>

          <div className="flex items-center gap-4 text-[10px] text-neutral-400">
            <span>Target: <span className="font-bold text-neutral-600">90%</span></span>
            <span>Industry avg: <span className="font-bold text-neutral-600">85%</span></span>
          </div>
        </div>
      </Panel>
    </div>
  );
};
