import { cn } from "@/app/lib/utils";
import {
  Package, AlertCircle, TrendingDown, Activity,
  Eye, Shield, MapPin, type LucideIcon,
} from "lucide-react";
import {
  AreaChart, Area, YAxis, XAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  DEFECT_KPIS, COMPLIANCE_KPIS, DEFECT_HOURLY_TREND, HOURLY_DATA,
} from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

interface KPITile {
  label: string;
  definition: string;
  value: string;
  delta: string;
  deltaPositive: boolean;
  icon: LucideIcon;
  accentNum: string;
  accentBorder: string;
  accentIcon: string;
  chartColor: string;
  chartData: { x: string; v: number }[];
  yMin: number;
  yMax: number;
  unit: string;
}

// ── Sparkline with proper axis domain ─────────────────────────────────────
const Sparkline = ({
  data,
  color,
  yMin,
  yMax,
}: {
  data: { x: string; v: number }[];
  color: string;
  yMin: number;
  yMax: number;
}) => {
  const gradId = `sg-${color.replace(/[^a-z0-9]/gi, "")}`;
  return (
    <ResponsiveContainer width="100%" height={64}>
      <AreaChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.3} />
            <stop offset="100%" stopColor={color} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        {/* Hidden Y axis — just for domain scaling */}
        <YAxis domain={[yMin, yMax]} hide />
        <CartesianGrid strokeDasharray="2 4" stroke="#f0f0f0" vertical={false} />
        <XAxis
          dataKey="x"
          tick={{ fontSize: 8, fill: "#CBD5E1" }}
          axisLine={false}
          tickLine={false}
          interval="preserveStartEnd"
        />
        <Tooltip
          contentStyle={{
            fontSize: 9,
            borderRadius: 4,
            padding: "2px 8px",
            border: "1px solid #e5e7eb",
            background: "#fff",
          }}
          formatter={(v: number) => [v, ""]}
          labelStyle={{ fontSize: 8, color: "#94A3B8" }}
        />
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// ── Main component ─────────────────────────────────────────────────────────
export const PrimaryKPIRow = ({ terminology }: Props) => {
  const isDefect = terminology.isDefectApp;
  const d = DEFECT_KPIS;
  const c = COMPLIANCE_KPIS;

  // Defect hourly chart data with clear hour labels
  const defectHourlyLabels = DEFECT_HOURLY_TREND.map((h) => h.hour + ":00");

  const defectTiles: KPITile[] = [
    {
      label: "Total Inspected",
      definition: "Total number of items processed through the inspection line today",
      value: d.total_inspected.toLocaleString(),
      delta: `+${(d.total_inspected - d.vs_yesterday.total_inspected).toLocaleString()} vs yesterday`,
      deltaPositive: true,
      icon: Package,
      accentNum: "text-neutral-900",
      accentBorder: "border-neutral-200",
      accentIcon: "text-neutral-300",
      chartColor: "#00775B",
      chartData: DEFECT_HOURLY_TREND.map((h, i) => ({
        x: defectHourlyLabels[i],
        v: h.total_inspected,
      })),
      yMin: 0,
      yMax: 400,
      unit: "items / hr",
    },
    {
      label: "Defect Count",
      definition: "Number of inspected items with at least one detected defect",
      value: d.defect_count.toLocaleString(),
      delta: `${d.defect_count < d.vs_yesterday.defect_count ? "↓" : "↑"} ${Math.abs(d.defect_count - d.vs_yesterday.defect_count)} vs yesterday`,
      deltaPositive: d.defect_count < d.vs_yesterday.defect_count,
      icon: AlertCircle,
      accentNum: d.defect_count > d.vs_yesterday.defect_count ? "text-red-700" : "text-emerald-700",
      accentBorder: d.defect_count > d.vs_yesterday.defect_count ? "border-red-200" : "border-emerald-200",
      accentIcon: d.defect_count > d.vs_yesterday.defect_count ? "text-red-400" : "text-emerald-400",
      chartColor: "#EF4444",
      chartData: DEFECT_HOURLY_TREND.map((h, i) => ({
        x: defectHourlyLabels[i],
        v: h.defect_count,
      })),
      yMin: 0,
      yMax: 12,
      unit: "defects / hr",
    },
    {
      label: "Defect Rate",
      definition: "Ratio of defective items to total inspected (lower is better)",
      value: `${d.defect_rate_pct.toFixed(1)}%`,
      delta: `${d.defect_rate_pct < d.vs_yesterday.defect_rate_pct ? "↓" : "↑"} ${Math.abs(d.defect_rate_pct - d.vs_yesterday.defect_rate_pct).toFixed(1)}pp vs yesterday`,
      deltaPositive: d.defect_rate_pct < d.vs_yesterday.defect_rate_pct,
      icon: TrendingDown,
      accentNum:
        d.defect_rate_pct > 2.5 ? "text-red-700" :
        d.defect_rate_pct > 1.5 ? "text-amber-600" : "text-emerald-700",
      accentBorder:
        d.defect_rate_pct > 2.5 ? "border-red-200" :
        d.defect_rate_pct > 1.5 ? "border-amber-200" : "border-emerald-200",
      accentIcon:
        d.defect_rate_pct > 2.5 ? "text-red-400" :
        d.defect_rate_pct > 1.5 ? "text-amber-400" : "text-emerald-400",
      chartColor:
        d.defect_rate_pct > 2.5 ? "#EF4444" :
        d.defect_rate_pct > 1.5 ? "#F59E0B" : "#00775B",
      chartData: DEFECT_HOURLY_TREND.map((h, i) => ({
        x: defectHourlyLabels[i],
        v: h.defect_rate,
      })),
      yMin: 0,
      yMax: 4,
      unit: "defects per 100 items",
    },
    {
      label: "Defect Density",
      definition: "Average percentage of item surface area covered by defects",
      value: `${d.defect_density_pct.toFixed(1)}%`,
      delta: `${d.defect_density_pct < d.vs_yesterday.defect_density_pct ? "↓" : "↑"} ${Math.abs(d.defect_density_pct - d.vs_yesterday.defect_density_pct).toFixed(1)}pp vs yesterday`,
      deltaPositive: d.defect_density_pct < d.vs_yesterday.defect_density_pct,
      icon: Activity,
      accentNum:
        d.defect_density_pct > 3 ? "text-red-700" :
        d.defect_density_pct > 2 ? "text-amber-600" : "text-neutral-900",
      accentBorder:
        d.defect_density_pct > 3 ? "border-red-200" :
        d.defect_density_pct > 2 ? "border-amber-200" : "border-neutral-200",
      accentIcon:
        d.defect_density_pct > 3 ? "text-red-400" :
        d.defect_density_pct > 2 ? "text-amber-400" : "text-neutral-300",
      chartColor:
        d.defect_density_pct > 3 ? "#EF4444" :
        d.defect_density_pct > 2 ? "#F59E0B" : "#6366F1",
      chartData: DEFECT_HOURLY_TREND.map((h, i) => ({
        x: defectHourlyLabels[i],
        v: h.defect_density,
      })),
      yMin: 0,
      yMax: 5,
      unit: "% area per item",
    },
  ];

  // Compliance hourly chart — use HOURLY_DATA with proper time labels
  const compHourly = HOURLY_DATA.slice(-8);

  const complianceTiles: KPITile[] = [
    {
      label: "Total Observations",
      definition: "Total detection events recorded today",
      value: c.total_observations.toLocaleString(),
      delta: `+${(c.total_observations - c.vs_yesterday.total_observations).toLocaleString()} vs yesterday`,
      deltaPositive: true,
      icon: Eye,
      accentNum: "text-neutral-900",
      accentBorder: "border-neutral-200",
      accentIcon: "text-neutral-300",
      chartColor: "#00775B",
      chartData: compHourly.map((h) => ({ x: h.label, v: h.compliance_pct + h.violation_count })),
      yMin: 80,
      yMax: 120,
      unit: "events / hr",
    },
    {
      label: "Violations Today",
      definition: "Total non-compliant events detected today",
      value: c.violation_count.toLocaleString(),
      delta: `${c.violation_count < c.vs_yesterday.violation_count ? "↓" : "↑"} ${Math.abs(c.violation_count - c.vs_yesterday.violation_count)} vs yesterday`,
      deltaPositive: c.violation_count < c.vs_yesterday.violation_count,
      icon: AlertCircle,
      accentNum: c.violation_count > 50 ? "text-red-700" : c.violation_count > 30 ? "text-amber-600" : "text-emerald-700",
      accentBorder: c.violation_count > 50 ? "border-red-200" : c.violation_count > 30 ? "border-amber-200" : "border-emerald-200",
      accentIcon: c.violation_count > 50 ? "text-red-400" : c.violation_count > 30 ? "text-amber-400" : "text-emerald-400",
      chartColor: "#EF4444",
      chartData: compHourly.map((h) => ({ x: h.label, v: h.violation_count })),
      yMin: 0,
      yMax: 30,
      unit: "violations / hr",
    },
    {
      label: "Compliance Rate",
      definition: "Percentage of observations rated compliant",
      value: `${c.compliance_rate_pct.toFixed(1)}%`,
      delta: `${c.compliance_rate_pct > c.vs_yesterday.compliance_rate_pct ? "↑" : "↓"} ${Math.abs(c.compliance_rate_pct - c.vs_yesterday.compliance_rate_pct).toFixed(1)}pp vs yesterday`,
      deltaPositive: c.compliance_rate_pct > c.vs_yesterday.compliance_rate_pct,
      icon: Shield,
      accentNum: c.compliance_rate_pct >= 90 ? "text-emerald-700" : c.compliance_rate_pct >= 80 ? "text-amber-600" : "text-red-700",
      accentBorder: c.compliance_rate_pct >= 90 ? "border-emerald-200" : c.compliance_rate_pct >= 80 ? "border-amber-200" : "border-red-200",
      accentIcon: c.compliance_rate_pct >= 90 ? "text-emerald-400" : c.compliance_rate_pct >= 80 ? "text-amber-400" : "text-red-400",
      chartColor: c.compliance_rate_pct >= 90 ? "#00775B" : c.compliance_rate_pct >= 80 ? "#F59E0B" : "#EF4444",
      chartData: compHourly.map((h) => ({ x: h.label, v: h.compliance_pct })),
      yMin: 65,
      yMax: 100,
      unit: "% compliant",
    },
    {
      label: "High-Risk Zones",
      definition: "Zones with compliance below 75% in the last hour",
      value: c.high_risk_zones.toString(),
      delta: `${c.high_risk_zones < c.vs_yesterday.high_risk_zones ? "↓" : c.high_risk_zones === c.vs_yesterday.high_risk_zones ? "—" : "↑"} vs yesterday (${c.vs_yesterday.high_risk_zones})`,
      deltaPositive: c.high_risk_zones < c.vs_yesterday.high_risk_zones,
      icon: MapPin,
      accentNum: c.high_risk_zones > 2 ? "text-red-700" : c.high_risk_zones > 0 ? "text-amber-600" : "text-emerald-700",
      accentBorder: c.high_risk_zones > 2 ? "border-red-200" : c.high_risk_zones > 0 ? "border-amber-200" : "border-emerald-200",
      accentIcon: c.high_risk_zones > 2 ? "text-red-400" : c.high_risk_zones > 0 ? "text-amber-400" : "text-emerald-400",
      chartColor: "#F97316",
      chartData: [
        { x: "Mon", v: 3 }, { x: "Tue", v: 3 }, { x: "Wed", v: 4 },
        { x: "Thu", v: 3 }, { x: "Fri", v: 3 }, { x: "Sat", v: 2 },
        { x: "Sun", v: c.high_risk_zones },
      ],
      yMin: 0,
      yMax: 6,
      unit: "zones at risk",
    },
  ];

  const tiles = isDefect ? defectTiles : complianceTiles;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
      {tiles.map((tile) => {
        const Icon = tile.icon;
        return (
          <div
            key={tile.label}
            className={cn(
              "bg-white rounded-[4px] border shadow-sm flex flex-col overflow-hidden",
              tile.accentBorder
            )}
          >
            {/* ── Header ── */}
            <div className="px-4 pt-4 pb-0">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
                  {tile.label}
                </span>
                <Icon className={cn("w-3.5 h-3.5 shrink-0", tile.accentIcon)} />
              </div>

              {/* Large number */}
              <div className={cn("mt-2 text-[38px] font-black font-data tabular-nums leading-none", tile.accentNum)}>
                {tile.value}
              </div>

              {/* Delta */}
              <div className={cn(
                "mt-1 mb-2 text-[10px] font-semibold leading-tight",
                tile.deltaPositive ? "text-emerald-600" : "text-red-500"
              )}>
                {tile.delta}
              </div>
            </div>

            {/* ── Sparkline ── */}
            <div className="flex-1">
              <Sparkline
                data={tile.chartData}
                color={tile.chartColor}
                yMin={tile.yMin}
                yMax={tile.yMax}
              />
            </div>

            {/* ── Footer unit ── */}
            <div className="px-4 pb-3 -mt-1">
              <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-wide">
                {tile.unit}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
