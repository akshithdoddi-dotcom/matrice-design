/**
 * StatCard v1.2 — Matrice AI design system.
 * Colored border + glow, accent chip, badge-stack trend indicator.
 * Optional: compact size, sparkline, loading skeleton, click interaction.
 */
import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "./utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Preset colour palette ────────────────────────────────────────────────────

export const STAT_PRESETS = {
  teal:    { color: "#00775B", bgColor: "#F0FBF7" },
  red:     { color: "#E7000B", bgColor: "#FFF5F5" },
  blue:    { color: "#0284C7", bgColor: "#F0F7FF" },
  purple:  { color: "#9333EA", bgColor: "#FAF5FF" },
  amber:   { color: "#E19A04", bgColor: "#FFFBEB" },
  slate:   { color: "#64748B", bgColor: "#F8FAFC" },
} satisfies Record<string, { color: string; bgColor: string }>;

export type StatPreset = keyof typeof STAT_PRESETS;

// ─── Primitives ───────────────────────────────────────────────────────────────

export type StatDir = "up" | "down" | "neutral";

/** Outer card shell — color-matched border, light tint bg, hover glow */
export const V12Card = ({
  color, bgColor, children, className, onClick,
}: {
  color: string;
  bgColor: string;
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
}) => {
  const [h, setH] = useState(false);
  return (
    <div
      role={onClick ? "button" : undefined}
      tabIndex={onClick ? 0 : undefined}
      className={cn(
        "w-full rounded-[4px] flex flex-col select-none transition-all duration-200",
        onClick ? "cursor-pointer" : "cursor-default",
        className,
      )}
      style={{
        minWidth: 240,
        border: `1px solid ${color}`,
        background: bgColor,
        boxShadow: h
          ? `0 0 18px 4px ${hex2rgba(color, 0.22)}, 0 4px 14px rgba(0,0,0,0.07)`
          : `0 0 6px 1px ${hex2rgba(color, 0.10)}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onMouseEnter={() => setH(true)}
      onMouseLeave={() => setH(false)}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick?.()}
    >
      {children}
    </div>
  );
};

/** 1px color-tinted divider */
export const V12Divider = ({ color }: { color: string }) => (
  <div style={{ height: 1, backgroundColor: hex2rgba(color, 0.22), margin: "0 16px" }} />
);

/** Top row: 11px bold label + optional accent chip */
export const V12Label = ({
  label, chip, color, compact,
}: {
  label: string; chip?: string; color: string; compact?: boolean;
}) => (
  <div className={cn("px-4 flex items-center justify-between", compact ? "pt-3" : "pt-4")}>
    <span
      className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none"
      style={{ color: "#475569" }}
    >
      {label}
    </span>
    {chip && (
      <span
        className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0"
        style={{ backgroundColor: hex2rgba(color, 0.14), color }}
      >
        {chip}
      </span>
    )}
  </div>
);

/** 2-line badge stack: direction arrow + number + reference label */
export const V12Badge = ({
  dir, num, ref_, color, compact,
}: {
  dir: StatDir; num: string; ref_: string; color: string; compact?: boolean;
}) => (
  <div
    className="flex flex-col rounded-[6px] flex-shrink-0"
    style={{
      padding: compact ? "6px 8px" : "8px 10px",
      backgroundColor: hex2rgba(color, 0.12),
    }}
  >
    <div
      className="flex items-center gap-[4px] font-mono font-bold leading-none"
      style={{ fontSize: compact ? 12 : 13, color }}
    >
      {dir === "up"
        ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
        : dir === "down"
          ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />
          : <Minus className="w-3 h-3 flex-shrink-0" />}
      {num}
    </div>
    <div className="text-[10px] font-normal mt-[5px] leading-none text-[#94a3b8]">{ref_}</div>
  </div>
);

// ─── Sparkline ────────────────────────────────────────────────────────────────

const SKELETON_PATTERN = [68, 82, 55, 90, 73, 60, 85, 70];

export const Sparkline = ({
  data, color, width = 64, height = 24,
}: {
  data: number[]; color: string; width?: number; height?: number;
}) => {
  if (data.length < 2) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pad = 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * (width - pad * 2) + pad;
    const y = (height - pad * 2) - ((v - min) / range) * (height - pad * 2) + pad;
    return `${x},${y}`;
  }).join(" ");
  return (
    <svg width={width} height={height} style={{ flexShrink: 0, overflow: "visible" }}>
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={0.75}
      />
      {/* terminal dot */}
      {(() => {
        const last = data[data.length - 1];
        const x = width - pad;
        const y = (height - pad * 2) - ((last - min) / range) * (height - pad * 2) + pad;
        return <circle cx={x} cy={y} r={2} fill={color} />;
      })()}
    </svg>
  );
};

// ─── Loading skeleton ─────────────────────────────────────────────────────────

export const StatCardSkeleton = ({ compact }: { compact?: boolean }) => (
  <div
    className="w-full rounded-[4px] flex flex-col select-none"
    style={{
      minWidth: 240,
      border: "1px solid #E2E8F0",
      background: "#F8FAFC",
    }}
  >
    <div className={cn("px-4 flex items-center justify-between", compact ? "pt-3" : "pt-4")}>
      <div className="skeleton h-[10px] w-24 rounded" />
      <div className="skeleton h-[18px] w-12 rounded-full" />
    </div>
    <div className={cn("px-4 flex items-end justify-between gap-4", compact ? "pt-2 pb-3" : "pt-3 pb-4")}>
      <div className="flex flex-col gap-[7px]">
        <div className={cn("skeleton rounded", compact ? "h-6 w-16" : "h-8 w-20")} />
        <div className="skeleton h-[10px] w-28 rounded" />
      </div>
      <div className="skeleton rounded-[6px]" style={{ width: 64, height: 42 }} />
    </div>
  </div>
);

// ─── StatCard ─────────────────────────────────────────────────────────────────

export interface StatCardData {
  label: string;
  value: string;
  sublabel: string;
  /** Trend badge number string, e.g. "+12.4%" or "-3ms" */
  num: string;
  /** Trend badge reference label, e.g. "vs last month" */
  ref_: string;
  dir: StatDir;
  /** Optional accent chip text, e.g. "LIVE" */
  chip?: string;
  color: string;
  bgColor: string;
  /** Optional mini sparkline data points */
  sparkline?: number[];
}

export interface StatCardProps {
  d: StatCardData;
  compact?: boolean;
  loading?: boolean;
  onClick?: () => void;
  className?: string;
}

export const StatCard = ({ d, compact, loading, onClick, className }: StatCardProps) => {
  if (loading) return <StatCardSkeleton compact={compact} />;

  return (
    <V12Card color={d.color} bgColor={d.bgColor} onClick={onClick} className={className}>
      <V12Label label={d.label} chip={d.chip} color={d.color} compact={compact} />
      <div className={cn("px-4 flex items-end justify-between gap-4", compact ? "pt-2 pb-3" : "pt-3 pb-4")}>
        <div className="flex flex-col gap-[7px]">
          <div
            className="font-mono font-bold tabular-nums leading-none text-[#0f172a]"
            style={{ fontSize: compact ? 22 : 28 }}
          >
            {d.value}
          </div>
          <div className="text-[12px] text-[#64748b]">{d.sublabel}</div>
        </div>
        {d.sparkline && d.sparkline.length >= 2 ? (
          <Sparkline data={d.sparkline} color={d.color} />
        ) : (
          <V12Badge dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} compact={compact} />
        )}
      </div>
    </V12Card>
  );
};

export default StatCard;
