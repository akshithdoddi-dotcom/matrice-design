import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, Cell, ResponsiveContainer,
} from "recharts";
import { Package, AlertTriangle, CheckCircle2, TrendingUp } from "lucide-react";
import { DENSITY_ITEMS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

const STATUS_CFG = {
  FAIL: { bar: "#EF4444", bg: "bg-red-50 border-red-200",   text: "text-red-700",   badge: "bg-red-600 text-white",           dot: "bg-red-500"   },
  WARN: { bar: "#F59E0B", bg: "bg-amber-50 border-amber-200", text: "text-amber-700", badge: "bg-amber-100 text-amber-800",    dot: "bg-amber-400" },
  PASS: { bar: "#10B981", bg: "bg-emerald-50 border-emerald-100", text: "text-emerald-700", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const THRESHOLD = 3.5; // % density threshold for FAIL

const failCount = DENSITY_ITEMS.filter(d => d.status === "FAIL").length;
const warnCount = DENSITY_ITEMS.filter(d => d.status === "WARN").length;
const passCount = DENSITY_ITEMS.filter(d => d.status === "PASS").length;

// Custom tooltip
const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: { payload: typeof DENSITY_ITEMS[0] }[] }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  const cfg = STATUS_CFG[d.status];
  return (
    <div className="bg-white border border-neutral-200 rounded-[6px] shadow-lg px-3 py-2.5 text-[11px] min-w-[160px]">
      <p className="font-bold text-neutral-800 mb-1">{d.label}</p>
      <div className="flex items-center justify-between gap-4 mb-1">
        <span className="text-neutral-500">Density</span>
        <span className={cn("font-black font-data tabular-nums", cfg.text)}>{d.density_pct.toFixed(1)}%</span>
      </div>
      <div className="flex items-center justify-between gap-4 mb-1.5">
        <span className="text-neutral-500">Defects</span>
        <span className="font-bold text-neutral-700">{d.defect_count}</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {d.defect_types.map(t => (
          <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-neutral-100 text-neutral-600">{t}</span>
        ))}
      </div>
    </div>
  );
};

export const DefectDensityChart = ({ terminology }: Props) => {
  const topFail = DENSITY_ITEMS.filter(d => d.status === "FAIL").slice(0, 3);

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
        <TrendingUp className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          {terminology.entityLabel} Defect Density
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {failCount > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white">
              {failCount} FAIL
            </span>
          )}
          {warnCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-amber-100 text-amber-700">
              {warnCount} WARN
            </span>
          )}
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-emerald-100 text-emerald-700">
            {passCount} PASS
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] divide-y lg:divide-y-0 lg:divide-x divide-neutral-100">

        {/* Left: Bar chart */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400 mb-3">
            Density % per {terminology.entityLabel}
          </p>
          <div style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={DENSITY_ITEMS}
                margin={{ top: 4, right: 8, left: -24, bottom: 0 }}
                barCategoryGap="20%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 9, fill: "#9ca3af", fontWeight: 600 }}
                  tickLine={false}
                  axisLine={false}
                  interval={0}
                  tickFormatter={v => v.replace("Batch #", "#")}
                />
                <YAxis
                  tick={{ fontSize: 9, fill: "#9ca3af" }}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={v => `${v}%`}
                  domain={[0, "auto"]}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: "#f9fafb" }} />
                <ReferenceLine
                  y={THRESHOLD}
                  stroke="#EF4444"
                  strokeDasharray="4 3"
                  strokeWidth={1.5}
                  label={{ value: `${THRESHOLD}% limit`, position: "right", fontSize: 8, fill: "#EF4444", fontWeight: 700 }}
                />
                <Bar dataKey="density_pct" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                  {DENSITY_ITEMS.map(d => (
                    <Cell key={d.id} fill={STATUS_CFG[d.status].bar} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="mt-3 flex items-center gap-4">
            {(["FAIL", "WARN", "PASS"] as const).map(s => (
              <span key={s} className="flex items-center gap-1 text-[9px] text-neutral-400">
                <span className={cn("w-2 h-2 rounded-sm", STATUS_CFG[s].dot === "bg-red-500" ? "bg-red-500" : STATUS_CFG[s].dot === "bg-amber-400" ? "bg-amber-400" : "bg-emerald-500")} />
                {s}
              </span>
            ))}
            <span className="flex items-center gap-1 text-[9px] text-neutral-400 ml-auto">
              <span className="w-4 border-t border-dashed border-red-400" />
              Density threshold
            </span>
          </div>
        </div>

        {/* Right: High-density callout cards */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400 mb-3">
            High Density — Requires Review
          </p>

          {topFail.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-[11px] font-semibold">All batches within limit</p>
            </div>
          ) : (
            <div className="space-y-2">
              {topFail.map((d, i) => (
                <div
                  key={d.id}
                  className={cn(
                    "flex items-start gap-3 px-3 py-2.5 rounded-[6px] border",
                    STATUS_CFG[d.status].bg
                  )}
                >
                  {/* Rank */}
                  <div className="shrink-0 w-5 h-5 rounded-full bg-red-600 text-white flex items-center justify-center text-[9px] font-black mt-0.5">
                    {i + 1}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="text-[12px] font-bold text-neutral-900">{d.label}</p>
                      <span className={cn("text-[8px] font-black px-1 py-0.5 rounded-[2px] uppercase", STATUS_CFG[d.status].badge)}>
                        {d.status}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-1.5 mb-1.5">
                      <span className="text-[20px] font-black font-data tabular-nums leading-none text-red-600">
                        {d.density_pct.toFixed(1)}%
                      </span>
                      <span className="text-[10px] text-neutral-400">density</span>
                      <span className="text-[10px] text-neutral-400 ml-1">·</span>
                      <span className="text-[10px] font-bold text-neutral-700">{d.defect_count} defects</span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {d.defect_types.map(t => (
                        <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-white/80 border border-red-200 text-red-700">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                </div>
              ))}

              {/* Summary footer */}
              <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center gap-2">
                <Package className="w-3 h-3 text-neutral-400" />
                <span className="text-[10px] text-neutral-500">
                  <span className="font-bold text-neutral-700">{failCount} of {DENSITY_ITEMS.length}</span> {terminology.entityLabel.toLowerCase()}s exceed density limit
                </span>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
