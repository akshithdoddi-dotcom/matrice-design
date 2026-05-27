import { useState } from "react";
import {
  Layers, AlertTriangle, CheckCircle2, TrendingUp, TrendingDown,
  Minus, ChevronRight, Wrench, Bell, X,
} from "lucide-react";
import { PRODUCTION_STAGES } from "../../data/mockData";
import type { QualityTerminology, StageDefect } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
  appId: string;
}

const STATUS_CFG = {
  RED:   { bar: "bg-red-500",   bg: "bg-red-50/60 border-red-200",   dot: "bg-red-500",   badge: "bg-red-600 text-white",         label: "CRITICAL" },
  AMBER: { bar: "bg-amber-400", bg: "bg-amber-50/60 border-amber-200", dot: "bg-amber-400", badge: "bg-amber-100 text-amber-800",   label: "ELEVATED" },
  GREEN: { bar: "bg-emerald-500", bg: "bg-white border-neutral-100", dot: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700", label: "NORMAL"  },
};

const BTN_ACTIONS: Record<string, { label: string; variant: "danger"|"default" }[]> = {
  RED:   [{ label: "Inspect Station", variant: "danger" }, { label: "Alert Engineer", variant: "default" }],
  AMBER: [{ label: "Adjust Process",  variant: "default" }, { label: "Alert Operator", variant: "default" }],
};

function TrendIcon({ trend }: { trend: StageDefect["trend"] }) {
  if (trend === "up")     return <TrendingUp   className="w-3 h-3 text-red-500" />;
  if (trend === "down")   return <TrendingDown className="w-3 h-3 text-emerald-500" />;
  return                         <Minus        className="w-3 h-3 text-neutral-300" />;
}

export const StageDefectPanel = ({ terminology, appId }: Props) => {
  const stages = PRODUCTION_STAGES[appId] ?? [];
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [actioned, setActioned]   = useState<Record<string, string>>({});

  const critical = stages.filter(s => s.status === "RED"   && !dismissed.has(s.id));
  const elevated = stages.filter(s => s.status === "AMBER" && !dismissed.has(s.id));
  const alerts   = [...critical, ...elevated];
  const maxRate  = Math.max(...stages.map(s => s.defect_rate), 1);

  const handleAction = (id: string, label: string) => {
    setActioned(prev => ({ ...prev, [id]: label }));
    setTimeout(() => {
      setDismissed(prev => new Set([...prev, id]));
      setActioned(prev => { const n = { ...prev }; delete n[id]; return n; });
    }, 2000);
  };

  if (stages.length === 0) return null;

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 shrink-0">
        <Layers className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          {terminology.stageLabel} Breakdown
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {critical.length > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white" />
              {critical.length} CRITICAL
            </span>
          )}
          {elevated.length > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-amber-100 text-amber-700">
              {elevated.length} ELEVATED
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] divide-y lg:divide-y-0 lg:divide-x divide-neutral-100">

        {/* Left: Priority alert cards */}
        <div className="p-4 space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400 mb-3">
            Stages Requiring Attention
          </p>

          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
              <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
              <p className="text-[11px] font-semibold">All stages within tolerance</p>
            </div>
          ) : (
            alerts.map(stage => {
              const cfg  = STATUS_CFG[stage.status];
              const btns = BTN_ACTIONS[stage.status] ?? [];
              const done = actioned[stage.id];

              return (
                <div
                  key={stage.id}
                  className={cn(
                    "relative rounded-[6px] border border-l-[3px] px-3.5 py-3 transition-all",
                    stage.status === "RED"   && "border-l-red-500 bg-red-50/40 border-red-200",
                    stage.status === "AMBER" && "border-l-amber-400 bg-amber-50/30 border-amber-200"
                  )}
                >
                  {/* Dismiss */}
                  <button
                    onClick={() => setDismissed(prev => new Set([...prev, stage.id]))}
                    className="absolute top-2 right-2 w-5 h-5 flex items-center justify-center rounded hover:bg-black/10 text-neutral-300 hover:text-neutral-500 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>

                  {/* Top row */}
                  <div className="flex items-center gap-2 mb-1 pr-6">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot, stage.status === "RED" && "animate-pulse")} />
                    <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide", cfg.badge)}>
                      {cfg.label}
                    </span>
                    <TrendIcon trend={stage.trend} />
                  </div>

                  {/* Stage name + rate */}
                  <div className="flex items-baseline gap-2 mb-1">
                    <p className="text-[12px] font-bold text-neutral-900">{stage.stage}</p>
                    <span className={cn(
                      "text-[18px] font-black font-data tabular-nums leading-none",
                      stage.status === "RED" ? "text-red-600" : "text-amber-600"
                    )}>
                      {stage.defect_rate.toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-neutral-400">defect rate</span>
                  </div>

                  {/* Stats row */}
                  <div className="flex items-center gap-3 mb-2.5 text-[10px] text-neutral-500">
                    <span className="font-data font-bold text-neutral-700">{stage.defect_count} defects</span>
                    <span>·</span>
                    <span>{stage.units_inspected.toLocaleString()} inspected</span>
                    <span>·</span>
                    <span>{stage.defect_density.toFixed(1)}% density</span>
                  </div>

                  {/* Defect type tags */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {stage.top_defect_types.map(t => (
                      <span key={t} className="text-[9px] font-semibold px-1.5 py-0.5 rounded-[3px] bg-neutral-100 text-neutral-600">
                        {t}
                      </span>
                    ))}
                  </div>

                  {/* Action buttons */}
                  {done ? (
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {done} — logged
                    </div>
                  ) : (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {btns.map(btn => (
                        <button
                          key={btn.label}
                          onClick={() => handleAction(stage.id, btn.label)}
                          className={cn(
                            "inline-flex items-center gap-1 h-7 px-3 rounded-[4px] text-[10px] font-bold transition-colors",
                            btn.variant === "danger"
                              ? "bg-red-600 text-white hover:bg-red-700"
                              : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50"
                          )}
                        >
                          {btn.variant === "danger"
                            ? <Wrench className="w-3 h-3" />
                            : <Bell className="w-3 h-3" />}
                          {btn.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right: All-stage defect rate bar chart */}
        <div className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400 mb-3">
            Defect Rate by {terminology.stageLabel}
          </p>

          <div className="space-y-2.5">
            {[...stages].sort((a, b) => b.defect_rate - a.defect_rate).map(stage => {
              const cfg  = STATUS_CFG[stage.status];
              const pct  = (stage.defect_rate / maxRate) * 100;

              return (
                <div key={stage.id}>
                  <div className="flex items-center justify-between mb-0.5">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", cfg.dot)} />
                      <span className="text-[11px] text-neutral-700 truncate font-medium">{stage.stage}</span>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-2">
                      <TrendIcon trend={stage.trend} />
                      <span className={cn(
                        "text-[11px] font-black font-data tabular-nums",
                        stage.status === "RED" ? "text-red-600" : stage.status === "AMBER" ? "text-amber-600" : "text-emerald-600"
                      )}>
                        {stage.defect_rate.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  {/* Bar */}
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all", cfg.bar)}
                      style={{ width: `${Math.max(pct, 2)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] text-neutral-400">
                      {stage.defect_count} defects · {stage.units_inspected} units
                    </span>
                    <span className="text-[9px] text-neutral-400 font-mono">
                      {stage.defect_density.toFixed(1)}% density
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center gap-4 flex-wrap">
            {([["RED","CRITICAL"],["AMBER","ELEVATED"],["GREEN","NORMAL"]] as const).map(([status, label]) => (
              <span key={status} className="flex items-center gap-1 text-[9px] text-neutral-400">
                <span className={cn("w-2 h-2 rounded-full", STATUS_CFG[status].dot)} />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom: production flow indicator */}
      <div className="border-t border-neutral-100 bg-neutral-50/60 px-4 py-2.5">
        <div className="flex items-center gap-1 overflow-x-auto">
          {stages.map((stage, i) => {
            const cfg = STATUS_CFG[stage.status];
            return (
              <div key={stage.id} className="flex items-center gap-1 shrink-0">
                <div className={cn(
                  "flex items-center gap-1 px-2 py-1 rounded-[4px] text-[9px] font-bold border whitespace-nowrap",
                  cfg.bg
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot, stage.status === "RED" && "animate-pulse")} />
                  <span className={stage.status === "RED" ? "text-red-700" : stage.status === "AMBER" ? "text-amber-700" : "text-neutral-500"}>
                    {stage.stage}
                  </span>
                </div>
                {i < stages.length - 1 && (
                  <ChevronRight className="w-3 h-3 text-neutral-300 shrink-0" />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
