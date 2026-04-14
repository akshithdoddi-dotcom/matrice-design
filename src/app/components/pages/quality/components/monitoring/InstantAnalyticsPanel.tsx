import { useState, useEffect, useCallback } from "react";
import {
  Zap, Radio, AlertTriangle, CheckCircle2, XCircle,
  Pause, RotateCcw, Wrench, UserPlus, Lock, ClipboardList,
  ShieldAlert, Eye, PhoneCall, Hammer, ChevronRight, RefreshCw,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { QualityTerminology } from "../../data/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
type EventState = "LIVE" | "ACKNOWLEDGED" | "RESOLVED";

interface InstantEvent {
  id: string;
  severity: Severity;
  title: string;
  detail: string;
  location: string;
  ageSeconds: number;
  actions: ActionDef[];
}

interface ActionDef {
  label: string;
  icon: React.ElementType;
  variant: "danger" | "warning" | "primary" | "default";
}

// ── Severity config ────────────────────────────────────────────────────────────

const SEV: Record<Severity, { bar: string; badge: string; dot: string; ring: string }> = {
  CRITICAL: { bar: "bg-red-600",    badge: "bg-red-600 text-white",            dot: "bg-red-500",    ring: "ring-red-200"   },
  HIGH:     { bar: "bg-orange-500", badge: "bg-orange-100 text-orange-700",    dot: "bg-orange-400", ring: "ring-orange-100" },
  MEDIUM:   { bar: "bg-amber-400",  badge: "bg-amber-100 text-amber-700",      dot: "bg-amber-400",  ring: "ring-amber-100"  },
  INFO:     { bar: "bg-sky-400",    badge: "bg-sky-50 text-sky-700",           dot: "bg-sky-400",    ring: "ring-sky-100"    },
};

// ── Event templates per app ────────────────────────────────────────────────────

const DEFECT_EVENTS: InstantEvent[] = [
  {
    id: "ie1",
    severity: "CRITICAL",
    title: "Defect spike detected",
    detail: "8 defects in last 5 min — rate crossed 5.1%",
    location: "Filling Station · Line 3",
    ageSeconds: 18,
    actions: [
      { label: "Pause Line",      icon: Pause,       variant: "danger"   },
      { label: "Alert Engineer",  icon: PhoneCall,   variant: "primary"  },
    ],
  },
  {
    id: "ie2",
    severity: "CRITICAL",
    title: "Batch #043 held at QC",
    detail: "Surface crack density 6.2% — exceeds 3.5% limit",
    location: "QC Station · Batch #043",
    ageSeconds: 47,
    actions: [
      { label: "Reject Batch",    icon: XCircle,     variant: "danger"   },
      { label: "Inspect Now",     icon: Eye,         variant: "primary"  },
    ],
  },
  {
    id: "ie3",
    severity: "HIGH",
    title: "Pattern: 3 consecutive batches with Underfill",
    detail: "Batches #041–#043 all show Underfill defects",
    location: "Forming Stage · Mould B",
    ageSeconds: 112,
    actions: [
      { label: "Review Process",  icon: RefreshCw,   variant: "warning"  },
      { label: "Alert QE",        icon: PhoneCall,   variant: "default"  },
    ],
  },
  {
    id: "ie4",
    severity: "HIGH",
    title: "Labeling stage crossed RED threshold",
    detail: "Defect rate jumped to 4.8% (+1.3% vs last hour)",
    location: "Labeling Stage · Zone D",
    ageSeconds: 205,
    actions: [
      { label: "Escalate",        icon: ShieldAlert, variant: "warning"  },
      { label: "Inspect Station", icon: Wrench,      variant: "primary"  },
    ],
  },
  {
    id: "ie5",
    severity: "MEDIUM",
    title: "Camera B2 offline",
    detail: "No frames received for 3 min — coverage gap",
    location: "Inspection Zone · Camera B2",
    ageSeconds: 310,
    actions: [
      { label: "Notify Tech",     icon: PhoneCall,   variant: "default"  },
      { label: "Switch Feed",     icon: Radio,       variant: "default"  },
    ],
  },
  {
    id: "ie6",
    severity: "MEDIUM",
    title: "Repeat defect: Shape Deform on Line 2",
    detail: "5th occurrence this shift — same mould cavity",
    location: "Moulding Stage · Line 2",
    ageSeconds: 480,
    actions: [
      { label: "Flag for Review", icon: ClipboardList, variant: "warning" },
      { label: "Halt Mould",      icon: Pause,         variant: "default" },
    ],
  },
  {
    id: "ie7",
    severity: "INFO",
    title: "Batch #040 cleared inspection",
    detail: "All 200 units passed. Density 1.1% — well within limit.",
    location: "QC Station · Batch #040",
    ageSeconds: 620,
    actions: [
      { label: "Release Batch",   icon: CheckCircle2, variant: "default" },
    ],
  },
  {
    id: "ie8",
    severity: "MEDIUM",
    title: "High ambient temp at Curing Stage",
    detail: "Temp 94°C — above 88°C threshold. May cause delamination.",
    location: "Curing Stage · Oven 1",
    ageSeconds: 790,
    actions: [
      { label: "Alert Operator",  icon: PhoneCall,   variant: "warning"  },
      { label: "Adjust Process",  icon: Hammer,      variant: "default"  },
    ],
  },
];

const SAFETY_EVENTS: InstantEvent[] = [
  {
    id: "se1",
    severity: "CRITICAL",
    title: "PPE violation — Hard hat missing",
    detail: "Worker detected without hard hat in mandatory zone",
    location: "Zone C · Camera 04",
    ageSeconds: 22,
    actions: [
      { label: "Deploy Officer",  icon: UserPlus,    variant: "danger"   },
      { label: "Alert Supervisor", icon: Radio,       variant: "primary"  },
    ],
  },
  {
    id: "se2",
    severity: "CRITICAL",
    title: "Unauthorized access attempt",
    detail: "Unidentified person at restricted entry — Gate 2",
    location: "Gate 2 · Camera 11",
    ageSeconds: 55,
    actions: [
      { label: "Lock Zone",       icon: Lock,        variant: "danger"   },
      { label: "Deploy Officer",  icon: UserPlus,    variant: "primary"  },
    ],
  },
  {
    id: "se3",
    severity: "HIGH",
    title: "Near-miss — Forklift & pedestrian",
    detail: "Pedestrian entered active forklift aisle without clearance",
    location: "Warehouse A · Aisle 3",
    ageSeconds: 134,
    actions: [
      { label: "File Report",     icon: ClipboardList, variant: "warning" },
      { label: "Dispatch Response", icon: Radio,      variant: "danger"   },
    ],
  },
  {
    id: "se4",
    severity: "HIGH",
    title: "Repeat violator — Worker #14",
    detail: "4th PPE violation this shift. Prior warnings issued.",
    location: "Zone E · Camera 07",
    ageSeconds: 248,
    actions: [
      { label: "Deploy Officer",  icon: UserPlus,    variant: "primary"  },
      { label: "Flag for Review", icon: ShieldAlert, variant: "default"  },
    ],
  },
  {
    id: "se5",
    severity: "MEDIUM",
    title: "Safety vest not detected",
    detail: "2 workers in loading dock without high-vis vests",
    location: "Loading Dock · Camera 09",
    ageSeconds: 390,
    actions: [
      { label: "Alert Supervisor", icon: Radio,      variant: "warning"  },
      { label: "Log Incident",    icon: ClipboardList, variant: "default" },
    ],
  },
  {
    id: "se6",
    severity: "MEDIUM",
    title: "Camera offline — Zone B",
    detail: "No signal for 4 min — coverage gap in monitored area",
    location: "Zone B · Camera 02",
    ageSeconds: 510,
    actions: [
      { label: "Notify Tech",     icon: PhoneCall,   variant: "default"  },
      { label: "Deploy Officer",  icon: UserPlus,    variant: "default"  },
    ],
  },
  {
    id: "se7",
    severity: "INFO",
    title: "Zone A compliance restored",
    detail: "All workers now compliant after officer intervention",
    location: "Zone A",
    ageSeconds: 680,
    actions: [
      { label: "Mark Resolved",   icon: CheckCircle2, variant: "default" },
    ],
  },
  {
    id: "se8",
    severity: "MEDIUM",
    title: "Equipment left unattended in walkway",
    detail: "Power tool obstructing emergency exit path",
    location: "Assembly B · Bay 4",
    ageSeconds: 820,
    actions: [
      { label: "Lock Zone",       icon: Lock,        variant: "warning"  },
      { label: "Alert Supervisor", icon: Radio,      variant: "default"  },
    ],
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAge(sec: number): string {
  if (sec < 60)  return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

const BTN_VARIANT: Record<string, string> = {
  danger:  "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  primary: "bg-[#00775B] text-white hover:bg-[#005e48]",
  default: "bg-neutral-100 text-neutral-700 hover:bg-neutral-200 border border-neutral-200",
};

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  terminology: QualityTerminology;
  appId: string;
}

export const InstantAnalyticsPanel = ({ terminology, appId: _appId }: Props) => {
  const baseEvents = terminology.isDefectApp ? DEFECT_EVENTS : SAFETY_EVENTS;

  const [states, setStates]   = useState<Record<string, EventState>>({});
  const [ticked, setTicked]   = useState(0);   // seconds elapsed — drives age display
  const [newCount, setNewCount] = useState(0);

  // Tick every second to keep ages live
  useEffect(() => {
    const id = setInterval(() => setTicked(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  // Simulate a new event arriving every 45s
  useEffect(() => {
    const id = setInterval(() => setNewCount(n => n + 1), 45_000);
    return () => clearInterval(id);
  }, []);

  const handleAction = useCallback((eventId: string, actionLabel: string) => {
    const resolveLabels = ["Release Batch", "Mark Resolved", "Reject Batch"];
    const ackLabels     = ["File Report", "Log Incident", "Flag for Review", "Notify Tech", "Switch Feed", "Alert QE", "Alert Supervisor", "Alert Operator", "Alert Engineer"];
    if (resolveLabels.includes(actionLabel)) {
      setStates(s => ({ ...s, [eventId]: "RESOLVED" }));
    } else if (ackLabels.includes(actionLabel)) {
      setStates(s => ({ ...s, [eventId]: "ACKNOWLEDGED" }));
    } else {
      setStates(s => ({ ...s, [eventId]: "ACKNOWLEDGED" }));
    }
  }, []);

  const liveEvents   = baseEvents.filter(e => (states[e.id] ?? "LIVE") === "LIVE");
  const ackedEvents  = baseEvents.filter(e => states[e.id] === "ACKNOWLEDGED");
  const resolvedCount = baseEvents.filter(e => states[e.id] === "RESOLVED").length;
  const criticalCount = liveEvents.filter(e => e.severity === "CRITICAL").length;

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-100">
        <Zap className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Instant Analytics
        </span>

        {/* Live pulse */}
        <span className="flex items-center gap-1.5 ml-1">
          <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
          <span className="text-[9px] font-bold uppercase tracking-wider text-[#00775B]">Live</span>
        </span>

        <div className="ml-auto flex items-center gap-1.5">
          {newCount > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700 animate-pulse">
              +{newCount} new
            </span>
          )}
          {criticalCount > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white">
              {criticalCount} CRITICAL
            </span>
          )}
          <span className="text-[9px] text-neutral-400">
            {liveEvents.length} active · {ackedEvents.length} acked · {resolvedCount} resolved
          </span>
        </div>
      </div>

      {/* ── Live feed ──────────────────────────────────────────────────────── */}
      <div className="divide-y divide-neutral-50 max-h-[460px] overflow-y-auto">
        {liveEvents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-neutral-400">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mb-2" />
            <p className="text-[11px] font-semibold">All clear — no active events</p>
          </div>
        ) : (
          liveEvents.map((ev) => {
            const sev = SEV[ev.severity];
            return (
              <div key={ev.id} className="flex gap-0 group">

                {/* Severity bar */}
                <div className={cn("w-[3px] shrink-0", sev.bar)} />

                <div className="flex-1 px-4 py-3 min-w-0">
                  <div className="flex items-start gap-3">

                    {/* Dot + content */}
                    <div className="mt-1 shrink-0">
                      <span className={cn("block w-2 h-2 rounded-full", sev.dot,
                        ev.severity === "CRITICAL" && "animate-pulse"
                      )} />
                    </div>

                    <div className="flex-1 min-w-0">
                      {/* Title row */}
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide", sev.badge)}>
                          {ev.severity}
                        </span>
                        <p className="text-[12px] font-bold text-neutral-900 leading-tight">
                          {ev.title}
                        </p>
                        <span className="text-[10px] text-neutral-400 ml-auto shrink-0 tabular-nums">
                          {fmtAge(ev.ageSeconds + ticked)}
                        </span>
                      </div>

                      {/* Detail */}
                      <p className="text-[11px] text-neutral-500 mb-1.5 leading-snug">{ev.detail}</p>

                      {/* Location */}
                      <p className="text-[10px] font-mono font-semibold text-neutral-400 mb-2">
                        📍 {ev.location}
                      </p>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2 flex-wrap">
                        {ev.actions.map((act) => (
                          <button
                            key={act.label}
                            onClick={() => handleAction(ev.id, act.label)}
                            className={cn(
                              "flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[10px] font-bold transition-all",
                              BTN_VARIANT[act.variant]
                            )}
                          >
                            <act.icon className="w-2.5 h-2.5 shrink-0" />
                            {act.label}
                            <ChevronRight className="w-2.5 h-2.5 opacity-60" />
                          </button>
                        ))}

                        {/* Dismiss */}
                        <button
                          onClick={() => setStates(s => ({ ...s, [ev.id]: "RESOLVED" }))}
                          className="ml-auto text-[9px] text-neutral-300 hover:text-neutral-500 font-semibold transition-colors"
                        >
                          Dismiss
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Acknowledged section */}
        {ackedEvents.length > 0 && (
          <>
            <div className="px-4 py-1.5 bg-neutral-50 flex items-center gap-2">
              <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                Acknowledged
              </span>
            </div>
            {ackedEvents.map((ev) => (
              <div key={ev.id} className="flex gap-0 opacity-50">
                <div className="w-[3px] shrink-0 bg-neutral-300" />
                <div className="flex-1 px-4 py-2.5 min-w-0 flex items-center gap-3">
                  <RotateCcw className="w-3 h-3 text-neutral-400 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-bold text-neutral-600 truncate">{ev.title}</p>
                    <p className="text-[10px] font-mono text-neutral-400 truncate">{ev.location}</p>
                  </div>
                  <span className="text-[9px] text-neutral-400 shrink-0">{fmtAge(ev.ageSeconds + ticked)}</span>
                  <button
                    onClick={() => setStates(s => ({ ...s, [ev.id]: "RESOLVED" }))}
                    className="text-[9px] text-neutral-400 hover:text-emerald-600 font-semibold shrink-0 transition-colors"
                  >
                    Resolve
                  </button>
                </div>
              </div>
            ))}
          </>
        )}
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="px-4 py-2.5 border-t border-neutral-100 bg-neutral-50 flex items-center gap-3">
        <Radio className="w-3 h-3 text-neutral-400" />
        <span className="text-[10px] text-neutral-400">
          Monitoring <span className="font-bold text-neutral-600">{terminology.appLabel}</span> · Actions logged to incident record
        </span>
        <span className="ml-auto text-[9px] font-mono text-neutral-300">
          updated {ticked % 60 < 5 ? "just now" : `${ticked % 60}s ago`}
        </span>
      </div>

    </div>
  );
};
