/**
 * V12 Stat Card — extracted from the Component Library (DesignSystem.tsx).
 * No sparkline. Colored border + glow, accent chip, badge-stack trend indicator.
 */
import { useState } from "react";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

export function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Primitives ───────────────────────────────────────────────────────────────

export type StatDir = "up" | "down" | "neutral";

/** Outer card shell — color-matched border, light tint bg, hover glow */
export const V12Card = ({
  color, bgColor, children, className,
}: { color: string; bgColor: string; children: React.ReactNode; className?: string }) => {
  const [h, setH] = useState(false);
  return (
    <div
      className={cn("w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200", className)}
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
export const V12Label = ({ label, chip, color }: { label: string; chip?: string; color: string }) => (
  <div className="px-4 pt-4 flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>
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
export const V12Badge = ({ dir, num, ref_, color }: { dir: StatDir; num: string; ref_: string; color: string }) => (
  <div
    className="flex flex-col px-[10px] py-[8px] rounded-[6px] flex-shrink-0"
    style={{ backgroundColor: hex2rgba(color, 0.12) }}
  >
    <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color }}>
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

// ─── Stat Card (Type A) ───────────────────────────────────────────────────────

export interface StatCardData {
  label: string;
  value: string;
  sublabel: string;
  num: string;
  ref_: string;
  dir: StatDir;
  chip: string;
  color: string;
  bgColor: string;
}

export const StatCard = ({ d }: { d: StatCardData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <V12Label label={d.label} chip={d.chip} color={d.color} />
    <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
      <div className="flex flex-col gap-[7px]">
        <div
          className="font-mono font-bold tabular-nums leading-none text-[#0f172a]"
          style={{ fontSize: 28 }}
        >
          {d.value}
        </div>
        <div className="text-[12px] text-[#64748b]">{d.sublabel}</div>
      </div>
      <V12Badge dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
    </div>
  </V12Card>
);
