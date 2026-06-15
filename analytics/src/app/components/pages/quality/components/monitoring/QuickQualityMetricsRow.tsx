import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  ResponsiveContainer, YAxis, XAxis, CartesianGrid, Tooltip
} from "recharts";
import { TrendingDown, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface DefectTrendDataPoint {
  date: string;
  defects: number;
}

interface DefectTypeData {
  name: string;
  count: number;
  color: string;
}

interface ZoneData {
  zone: string;
  defects: number;
}

interface Props {
  defectTrendData: DefectTrendDataPoint[];
  defectTypeData: DefectTypeData[];
  zoneInsightsData: ZoneData[];
  passRate: number;
  totalInspected: number;
}

export const QuickQualityMetricsRow = ({
  defectTrendData,
  defectTypeData,
  zoneInsightsData,
  passRate,
  totalInspected,
}: Props) => {
  const defectiveCount = Math.round(totalInspected * (1 - passRate / 100));
  const passCount = totalInspected - defectiveCount;

  const latestDefects = defectTrendData[defectTrendData.length - 1]?.defects ?? 0;
  const previousDefects = defectTrendData[defectTrendData.length - 2]?.defects ?? latestDefects;
  const peakDefects = Math.max(...defectTrendData.map(d => d.defects));
  const trendIncreasing = latestDefects > previousDefects;

  const maxZoneDefects = Math.max(...zoneInsightsData.map(z => z.defects));
  const worstZone = zoneInsightsData.find(z => z.defects === maxZoneDefects);

  const totalDefects = defectTypeData.reduce((s, d) => s + d.count, 0);
  const criticalCount = defectTypeData.find(d => d.name === "Critical")?.count ?? 0;

  return (
    <div className="grid grid-cols-2 gap-3">

      {/* ── 1. Defect Trend ─────────────────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-700">Defect Trend</p>
            <p className="text-[9px] text-neutral-500 mt-0.5">7-day trajectory</p>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded text-[9px] font-semibold border",
            trendIncreasing
              ? "bg-red-50 border-red-200 text-red-700"
              : "bg-emerald-50 border-emerald-200 text-emerald-700"
          )}>
            {trendIncreasing
              ? <TrendingUp className="w-3 h-3" />
              : <TrendingDown className="w-3 h-3" />}
            {trendIncreasing ? "Increasing" : "Decreasing"}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 px-2">
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={defectTrendData} margin={{ top: 0, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="trendGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: "rgba(0,0,0,0.5)" }}
                axisLine={false}
                tickLine={false}
                height={18}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "rgba(0,0,0,0.5)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #EF4444", backgroundColor: "#fff" }}
                formatter={(v) => [`${v} defects`, ""]}
              />
              <Area
                type="monotone"
                dataKey="defects"
                stroke="#EF4444"
                strokeWidth={2}
                fill="url(#trendGrad)"
                dot={{ r: 3, fill: "#EF4444", strokeWidth: 0 }}
                activeDot={{ r: 4 }}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Footer stats */}
        <div className="grid grid-cols-3 border-t border-neutral-100">
          {[
            { label: "TODAY", value: latestDefects },
            { label: "YESTERDAY", value: previousDefects },
            { label: "7-DAY PEAK", value: peakDefects },
          ].map(({ label, value }, i) => (
            <div key={label} className={cn(
              "px-4 py-3",
              i < 2 && "border-r border-neutral-100"
            )}>
              <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-500">{label}</p>
              <p className="text-xl font-black font-mono text-neutral-900 mt-1 leading-none">{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. Defect Type Distribution ─────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-start justify-between border-b border-neutral-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-700">Defect Type Distribution</p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Severity breakdown</p>
          </div>
          <div className="bg-neutral-900 text-white text-sm font-black font-mono px-2.5 py-1 rounded leading-none">
            {totalDefects}
          </div>
        </div>

        {/* Chart + legend */}
        <div className="flex-1 flex items-center px-4 py-3 gap-4">
          {/* Donut */}
          <div className="w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  formatter={(v) => `${v} defects`}
                />
                <Pie
                  data={defectTypeData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={3}
                  dataKey="count"
                  isAnimationActive={false}
                >
                  {defectTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Legend */}
          <div className="flex-1 space-y-3">
            {defectTypeData.map((type) => {
              const pct = totalDefects > 0 ? Math.round((type.count / totalDefects) * 100) : 0;
              return (
                <div key={type.name}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: type.color }} />
                      <span className="text-[10px] text-neutral-700 font-medium">{type.name}</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-[13px] font-black text-neutral-900 font-mono">{type.count}</span>
                      <span className="text-[9px] text-neutral-400">{pct}%</span>
                    </div>
                  </div>
                  <div className="h-1 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: type.color }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer alert */}
        {criticalCount > 0 && (
          <div className="mx-4 mb-3 px-3 py-2 bg-red-50 border border-red-200 rounded flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            <p className="text-[10px] text-red-700 font-medium">
              {criticalCount} critical issue{criticalCount !== 1 ? "s" : ""} — immediate attention required
            </p>
          </div>
        )}
      </div>

      {/* ── 3. Zone Level Insights ──────────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-start justify-between">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-700">Zone Level Insights</p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Defects per zone</p>
          </div>
          <div className="flex items-center gap-1.5 px-2 py-1 bg-red-50 border border-red-200 rounded text-[9px] font-semibold text-red-700">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
            Highest: {worstZone?.zone}
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 px-2">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={zoneInsightsData} margin={{ top: 0, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.06)" vertical={false} />
              <XAxis
                dataKey="zone"
                tick={{ fontSize: 9, fill: "rgba(0,0,0,0.5)" }}
                axisLine={false}
                tickLine={false}
                height={18}
              />
              <YAxis
                tick={{ fontSize: 9, fill: "rgba(0,0,0,0.5)" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #3B82F6", backgroundColor: "#fff" }}
                formatter={(v) => [`${v} defects`, ""]}
              />
              <Bar dataKey="defects" radius={[3, 3, 0, 0]} isAnimationActive={false}>
                {zoneInsightsData.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.defects === maxZoneDefects ? "#EF4444" : "#10B981"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Zone risk distribution mini-bar */}
        <div className="px-4 pb-3 border-t border-neutral-100 pt-2">
          <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-500 mb-2">Zone Risk Distribution</p>
          <div className="flex gap-2">
            {zoneInsightsData.map((z) => {
              const pct = maxZoneDefects > 0 ? (z.defects / maxZoneDefects) * 100 : 0;
              const isWorst = z.defects === maxZoneDefects;
              return (
                <div key={z.zone} className="flex-1">
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: isWorst ? "#EF4444" : "#10B981",
                      }}
                    />
                  </div>
                  <p className="text-[8px] text-neutral-400 text-center mt-1">{z.zone}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── 4. Good vs Defective Ratio ──────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 flex items-start justify-between border-b border-neutral-100">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-700">Good vs Defective Ratio</p>
            <p className="text-[9px] text-neutral-500 mt-0.5">Quality yield overview</p>
          </div>
          <div className="px-2.5 py-1 border border-emerald-500 rounded text-[10px] font-bold text-emerald-700">
            {passRate.toFixed(1)}% pass
          </div>
        </div>

        {/* Chart + stats */}
        <div className="flex-1 flex items-center px-4 py-3 gap-4">
          {/* Donut */}
          <div className="w-[140px] shrink-0">
            <ResponsiveContainer width="100%" height={140}>
              <PieChart margin={{ top: 0, right: 0, bottom: 0, left: 0 }}>
                <Tooltip
                  contentStyle={{ fontSize: 11, borderRadius: 6 }}
                  formatter={(v) => {
                    const pct = ((Number(v) / totalInspected) * 100).toFixed(1);
                    return `${v} units (${pct}%)`;
                  }}
                />
                <Pie
                  data={[
                    { name: "Good", value: passCount },
                    { name: "Defective", value: defectiveCount },
                  ]}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                  isAnimationActive={false}
                >
                  <Cell fill="#10B981" />
                  <Cell fill="#EF4444" />
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Passed / Failed stat boxes */}
          <div className="flex-1 flex flex-col gap-2">
            <div className="bg-emerald-50 border border-emerald-200 rounded p-3">
              <p className="text-[8px] font-bold uppercase tracking-widest text-emerald-700">Passed</p>
              <p className="text-2xl font-black font-mono text-emerald-900 leading-tight mt-1">
                {passRate.toFixed(1)}%
              </p>
              <p className="text-[9px] text-emerald-600 mt-0.5">{passCount} units</p>
            </div>
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-[8px] font-bold uppercase tracking-widest text-red-700">Failed</p>
              <p className="text-2xl font-black font-mono text-red-900 leading-tight mt-1">
                {(100 - passRate).toFixed(1)}%
              </p>
              <p className="text-[9px] text-red-600 mt-0.5">{defectiveCount} units</p>
            </div>
          </div>
        </div>

        {/* Footer: target progress */}
        <div className="px-4 pb-3 border-t border-neutral-100 pt-2">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[9px] text-neutral-500">
              {passRate >= 95 ? "✓ On target" : "✕ Below target"}
            </span>
            <span className="text-[9px] text-neutral-500">Target 95%</span>
          </div>
          <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
            <div
              className={cn(
                "h-full rounded-full transition-all",
                passRate >= 95 ? "bg-emerald-500" : "bg-red-500"
              )}
              style={{ width: `${Math.min(passRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

    </div>
  );
};
