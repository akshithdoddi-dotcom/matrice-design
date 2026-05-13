import { useState } from "react";
import {
  Bell, CheckCircle2, AlertTriangle, Radio, UserPlus,
  Lock, ShieldAlert, ClipboardList, X, ChevronRight,
} from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { AlertEvent } from "../../data/types";
import { cn } from "@/app/lib/utils";

// ── Action definitions ────────────────────────────────────────────────────────
type ActionDef = {
  label: string;
  icon: React.ElementType;
  variant: "danger" | "warning" | "primary" | "default";
};

function resolveActions(alert: AlertEvent): ActionDef[] {
  const n = alert.name.toLowerCase();
  const isIncident = alert.event_type === "INCIDENT";

  if (isIncident || n.includes("near-miss") || n.includes("collision")) {
    return [
      { label: "Dispatch Response", icon: Radio,         variant: "danger"   },
      { label: "File Report",       icon: ClipboardList, variant: "default"  },
    ];
  }
  if (n.includes("breach") || n.includes("unauthorized") || n.includes("equipment left")) {
    return [
      { label: "Lock Zone",        icon: Lock,    variant: "danger"  },
      { label: "Deploy Officer",   icon: UserPlus, variant: "primary" },
    ];
  }
  if (n.includes("repeat") || n.includes("loiter")) {
    return [
      { label: "Deploy Officer",   icon: UserPlus,    variant: "primary" },
      { label: "Flag for Review",  icon: ShieldAlert, variant: "default" },
    ];
  }
  // Default PPE/safety violation
  return [
    { label: "Deploy Officer",   icon: UserPlus,    variant: "primary" },
    { label: "Alert Supervisor", icon: Radio,        variant: "default" },
  ];
}

// ── Severity config ────────────────────────────────────────────────────────────
const SEV_CFG = {
  CRITICAL: {
    bar:    "bg-red-600",
    badge:  "bg-red-600 text-white",
    dot:    "bg-red-500",
    rowBg:  "bg-red-50/40 border-red-100",
    pulse:  true,
  },
  HIGH: {
    bar:    "bg-orange-500",
    badge:  "bg-orange-500 text-white",
    dot:    "bg-orange-400",
    rowBg:  "bg-orange-50/30 border-orange-100",
    pulse:  false,
  },
  MEDIUM: {
    bar:    "bg-amber-400",
    badge:  "bg-amber-100 text-amber-800",
    dot:    "bg-amber-400",
    rowBg:  "bg-amber-50/30 border-amber-100",
    pulse:  false,
  },
  LOW: {
    bar:    "bg-blue-400",
    badge:  "bg-blue-100 text-blue-700",
    dot:    "bg-blue-400",
    rowBg:  "bg-white border-neutral-100",
    pulse:  false,
  },
};

const BTN_CLS = {
  danger:  "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  primary: "bg-[#00775B] text-white hover:bg-[#006349]",
  default: "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50",
};

function formatTs(ts: string) {
  return new Date(ts).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

// ── Component ──────────────────────────────────────────────────────────────────
export const ActiveIncidentPanel = () => {
  // Local state: track per-alert status overrides
  const [overrides, setOverrides] = useState<Record<string, "ACKNOWLEDGED" | "RESOLVED">>({});
  const [done, setDone] = useState<Record<string, string>>({});     // id → action label

  const alerts = [...ALERTS]
    .sort((a, b) => {
      const order = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
      return order[a.severity] - order[b.severity] ||
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
    })
    .filter(a => {
      const eff = overrides[a.id] ?? a.status;
      return eff !== "RESOLVED";
    });

  const activeCount = alerts.filter(a => (overrides[a.id] ?? a.status) === "ACTIVE").length;
  const critCount   = alerts.filter(a => a.severity === "CRITICAL").length;

  const handleAction = (id: string, label: string) => {
    setDone(prev => ({ ...prev, [id]: label }));
    setTimeout(() => {
      setOverrides(prev => ({ ...prev, [id]: "ACKNOWLEDGED" }));
      setDone(prev => { const n = { ...prev }; delete n[id]; return n; });
    }, 1800);
  };

  const handleAcknowledge = (id: string) => {
    setOverrides(prev => ({ ...prev, [id]: "ACKNOWLEDGED" }));
  };

  const resolvedCount = Object.values(overrides).filter(v => v === "RESOLVED").length +
    ALERTS.filter(a => a.status === "RESOLVED" && !overrides[a.id]).length;

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 shrink-0">
        <Bell className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Active Incidents
        </span>
        <div className="ml-auto flex items-center gap-1.5">
          {critCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white" />
              {critCount} CRITICAL
            </span>
          )}
          {activeCount > 0 && (
            <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[2px] bg-amber-100 text-amber-700">
              {activeCount} OPEN
            </span>
          )}
        </div>
      </div>

      {/* Alert list — scrollable */}
      <div className="flex-1 overflow-y-auto divide-y divide-neutral-50">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-neutral-400">
            <CheckCircle2 className="w-9 h-9 text-emerald-400 mb-2" />
            <p className="text-[12px] font-semibold">All clear</p>
            <p className="text-[10px]">No active incidents</p>
          </div>
        ) : (
          alerts.map((alert) => {
            const cfg = SEV_CFG[alert.severity];
            const effStatus = overrides[alert.id] ?? alert.status;
            const isActive  = effStatus === "ACTIVE";
            const isAcked   = effStatus === "ACKNOWLEDGED";
            const doneLabel = done[alert.id];
            const actions   = resolveActions(alert);
            const isIncident = alert.event_type === "INCIDENT";

            return (
              <div
                key={alert.id}
                className={cn(
                  "relative flex gap-0 border-l-[3px] transition-all",
                  cfg.bar.replace("bg-", "border-l-"),
                  isActive ? cn(cfg.rowBg) : "bg-white border-neutral-100",
                  isAcked && "opacity-70"
                )}
              >
                {/* Content */}
                <div className="flex-1 px-4 py-3 min-w-0">
                  {/* Top row */}
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {/* Severity badge */}
                      <span className={cn(
                        "text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide shrink-0",
                        cfg.badge
                      )}>
                        {alert.severity}
                      </span>
                      {/* Type badge */}
                      {isIncident && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] bg-purple-100 text-purple-700 uppercase tracking-wide shrink-0">
                          Incident
                        </span>
                      )}
                      {/* Live pulse */}
                      {isActive && (
                        <span className={cn(
                          "w-1.5 h-1.5 rounded-full shrink-0",
                          cfg.dot,
                          cfg.pulse && "animate-pulse"
                        )} />
                      )}
                      {/* Acked badge */}
                      {isAcked && (
                        <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] bg-neutral-100 text-neutral-500 uppercase">
                          Acknowledged
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 shrink-0">{formatTs(alert.timestamp)}</span>
                  </div>

                  {/* Alert name */}
                  <p className="text-[12px] font-bold text-neutral-900 leading-snug mb-0.5">
                    {alert.name}
                  </p>

                  {/* Zone + camera */}
                  <p className="text-[10px] text-neutral-400 font-mono mb-1.5">
                    {alert.zone} · {alert.camera_id}
                  </p>

                  {/* Message */}
                  <p className="text-[11px] text-neutral-600 leading-relaxed line-clamp-2 mb-3">
                    {alert.message}
                  </p>

                  {/* Action buttons */}
                  {doneLabel ? (
                    <div className="flex items-center gap-1.5 text-[11px] text-emerald-600 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {doneLabel} — acknowledged
                    </div>
                  ) : (
                    <div className="flex items-center flex-wrap gap-1.5">
                      {/* Primary actions */}
                      {actions.map((a) => {
                        const AIcon = a.icon;
                        return (
                          <button
                            key={a.label}
                            onClick={() => handleAction(alert.id, a.label)}
                            className={cn(
                              "inline-flex items-center gap-1 h-7 px-3 rounded-[4px] text-[10px] font-bold transition-colors",
                              BTN_CLS[a.variant]
                            )}
                          >
                            <AIcon className="w-3 h-3 shrink-0" />
                            {a.label}
                          </button>
                        );
                      })}

                      {/* Acknowledge button (only if active) */}
                      {isActive && (
                        <button
                          onClick={() => handleAcknowledge(alert.id)}
                          className="inline-flex items-center gap-1 h-7 px-2.5 rounded-[4px] text-[10px] font-bold text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors"
                        >
                          <X className="w-3 h-3" />
                          Ack
                        </button>
                      )}
                    </div>
                  )}
                </div>

                {/* Right chevron (detail hint) */}
                <div className="flex items-start pt-4 pr-3">
                  <ChevronRight className="w-3 h-3 text-neutral-200" />
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer summary */}
      <div className="border-t border-neutral-100 px-4 py-2.5 flex items-center gap-3 shrink-0 bg-neutral-50/60">
        <span className="text-[10px] text-neutral-400">
          <span className="font-bold text-red-600">{activeCount}</span> active
        </span>
        <span className="text-neutral-200">·</span>
        <span className="text-[10px] text-neutral-400">
          <span className="font-bold text-neutral-600">
            {Object.values(overrides).filter(v => v === "ACKNOWLEDGED").length + ALERTS.filter(a => a.status === "ACKNOWLEDGED" && !overrides[a.id]).length}
          </span> acknowledged
        </span>
        <span className="text-neutral-200">·</span>
        <span className="text-[10px] text-neutral-400">
          <span className="font-bold text-emerald-600">{resolvedCount}</span> resolved
        </span>
        <AlertTriangle className="w-3 h-3 text-neutral-300 ml-auto" />
        <span className="text-[9px] text-neutral-300 font-mono">Live · auto-refresh</span>
      </div>
    </div>
  );
};
