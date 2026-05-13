import { TrendingUp, CheckCircle2 } from "lucide-react";
import { DENSITY_ITEMS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

const STATUS_CFG = {
  FAIL: { bar: "bg-red-500",    text: "text-red-600",     badge: "bg-red-600 text-white",        dot: "bg-red-500"    },
  WARN: { bar: "bg-amber-400",  text: "text-amber-600",   badge: "bg-amber-100 text-amber-800",  dot: "bg-amber-400"  },
  PASS: { bar: "bg-emerald-400",text: "text-emerald-600", badge: "bg-emerald-100 text-emerald-700", dot: "bg-emerald-500" },
};

const THRESHOLD = 3.5;
const MAX_PCT   = Math.max(...DENSITY_ITEMS.map(d => d.density_pct), THRESHOLD + 1);

const failCount = DENSITY_ITEMS.filter(d => d.status === "FAIL").length;
const warnCount = DENSITY_ITEMS.filter(d => d.status === "WARN").length;
const passCount = DENSITY_ITEMS.filter(d => d.status === "PASS").length;

export const DefectDensityChart = ({ terminology }: Props) => {
  const thresholdPct = (THRESHOLD / MAX_PCT) * 100;

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100">
        <TrendingUp className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Defect Density
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

      <div className="px-4 py-3 space-y-2">
        {/* Column labels */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
            {terminology.entityLabel}
          </span>
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
            Density
          </span>
        </div>

        {/* Rows */}
        {DENSITY_ITEMS.map(d => {
          const cfg = STATUS_CFG[d.status];
          const fillPct = (d.density_pct / MAX_PCT) * 100;
          return (
            <div key={d.id} className="flex items-center gap-2 group">
              {/* Status dot */}
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />

              {/* Label */}
              <span className="text-[10px] font-semibold text-neutral-600 w-14 shrink-0 truncate">
                {d.label.replace("Batch ", "")}
              </span>

              {/* Bar track */}
              <div className="relative flex-1 h-4 bg-neutral-100 rounded-[2px] overflow-visible">
                {/* Fill */}
                <div
                  className={cn("h-full rounded-[2px] transition-all", cfg.bar)}
                  style={{ width: `${fillPct}%` }}
                />
                {/* Threshold marker */}
                <div
                  className="absolute top-0 h-full w-px bg-red-400 opacity-70"
                  style={{ left: `${thresholdPct}%` }}
                />
              </div>

              {/* Value */}
              <span className={cn("text-[10px] font-black tabular-nums w-8 text-right shrink-0", cfg.text)}>
                {d.density_pct.toFixed(1)}%
              </span>
            </div>
          );
        })}

        {/* Legend + footer */}
        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {(["FAIL", "WARN", "PASS"] as const).map(s => (
              <span key={s} className="flex items-center gap-1 text-[9px] text-neutral-400">
                <span className={cn("w-2 h-2 rounded-sm", STATUS_CFG[s].dot)} />
                {s}
              </span>
            ))}
          </div>
          {failCount === 0 ? (
            <span className="flex items-center gap-1 text-[9px] text-emerald-600 font-semibold">
              <CheckCircle2 className="w-3 h-3" /> All clear
            </span>
          ) : (
            <span className="text-[9px] text-neutral-400">
              <span className="font-bold text-red-600">{failCount}</span> exceed limit
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
