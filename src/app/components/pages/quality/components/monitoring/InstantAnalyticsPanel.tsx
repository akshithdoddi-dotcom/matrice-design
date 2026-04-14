import { useState, useEffect, useCallback } from "react";
import {
  Zap, Radio, AlertTriangle, CheckCircle2, XCircle,
  Pause, RotateCcw, Wrench, UserPlus, Lock, ClipboardList,
  ShieldAlert, Eye, PhoneCall, Hammer, RefreshCw, X,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { QualityTerminology } from "../../data/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity  = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
type EvtState  = "LIVE" | "ACKNOWLEDGED" | "RESOLVED";

interface ActionDef {
  label: string;
  icon:  React.ElementType;
  variant: "danger" | "warning" | "primary" | "default";
}

interface InstantEvent {
  id:         string;
  severity:   Severity;
  title:      string;
  detail:     string;
  location:   string;
  ageSeconds: number;
  actions:    ActionDef[];
}

// ── Config ────────────────────────────────────────────────────────────────────

const SEV_BAR: Record<Severity, string> = {
  CRITICAL: "bg-red-600",
  HIGH:     "bg-orange-500",
  MEDIUM:   "bg-amber-400",
  INFO:     "bg-sky-400",
};

const SEV_BADGE: Record<Severity, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH:     "bg-orange-100 text-orange-700",
  MEDIUM:   "bg-amber-100 text-amber-700",
  INFO:     "bg-sky-50 text-sky-700",
};

const SEV_ROW: Record<Severity, string> = {
  CRITICAL: "bg-red-50/30",
  HIGH:     "bg-orange-50/20",
  MEDIUM:   "",
  INFO:     "",
};

const BTN: Record<string, string> = {
  danger:  "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  primary: "bg-[#00775B] text-white hover:bg-[#006349]",
  default: "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50",
};

// ── Event data ─────────────────────────────────────────────────────────────────

const DEFECT_EVENTS: InstantEvent[] = [
  { id:"ie1", severity:"CRITICAL", title:"Defect spike detected",                      detail:"8 defects in 5 min — rate 5.1%",           location:"Filling Station · Line 3",     ageSeconds:18,  actions:[{ label:"Pause Line",      icon:Pause,       variant:"danger"  }, { label:"Alert Engineer",  icon:PhoneCall,    variant:"primary" }] },
  { id:"ie2", severity:"CRITICAL", title:"Batch #043 held at QC",                      detail:"Surface crack density 6.2% — limit 3.5%",  location:"QC Station · Batch #043",      ageSeconds:47,  actions:[{ label:"Reject Batch",    icon:XCircle,     variant:"danger"  }, { label:"Inspect Now",     icon:Eye,          variant:"primary" }] },
  { id:"ie3", severity:"HIGH",     title:"Pattern: 3 consecutive batches with Underfill", detail:"Batches #041–#043 — same mould cavity", location:"Forming Stage · Mould B",      ageSeconds:112, actions:[{ label:"Review Process",  icon:RefreshCw,   variant:"warning" }, { label:"Alert QE",        icon:PhoneCall,    variant:"default" }] },
  { id:"ie4", severity:"HIGH",     title:"Labeling stage crossed RED threshold",        detail:"Rate 4.8% — up 1.3% vs last hour",         location:"Labeling Stage · Zone D",      ageSeconds:205, actions:[{ label:"Escalate",        icon:ShieldAlert, variant:"warning" }, { label:"Inspect Station", icon:Wrench,       variant:"primary" }] },
  { id:"ie5", severity:"MEDIUM",   title:"Camera B2 offline",                          detail:"No frames for 3 min — coverage gap",        location:"Inspection Zone · Camera B2",  ageSeconds:310, actions:[{ label:"Notify Tech",     icon:PhoneCall,   variant:"default" }, { label:"Switch Feed",     icon:Radio,        variant:"default" }] },
  { id:"ie6", severity:"MEDIUM",   title:"Repeat defect: Shape Deform on Line 2",      detail:"5th occurrence this shift — same mould",    location:"Moulding Stage · Line 2",      ageSeconds:480, actions:[{ label:"Flag for Review", icon:ClipboardList, variant:"warning" }, { label:"Halt Mould",     icon:Pause,        variant:"default" }] },
  { id:"ie7", severity:"INFO",     title:"Batch #040 cleared inspection",               detail:"200 units passed — density 1.1%",           location:"QC Station · Batch #040",      ageSeconds:620, actions:[{ label:"Release Batch",   icon:CheckCircle2, variant:"default" }] },
  { id:"ie8", severity:"MEDIUM",   title:"High ambient temp at Curing Stage",          detail:"94°C — above 88°C threshold",               location:"Curing Stage · Oven 1",        ageSeconds:790, actions:[{ label:"Alert Operator",  icon:PhoneCall,   variant:"warning" }, { label:"Adjust Process",  icon:Hammer,       variant:"default" }] },
];

const SAFETY_EVENTS: InstantEvent[] = [
  { id:"se1", severity:"CRITICAL", title:"PPE violation — hard hat missing",           detail:"Worker in mandatory zone without hard hat", location:"Zone C · Camera 04",           ageSeconds:22,  actions:[{ label:"Deploy Officer",   icon:UserPlus,     variant:"danger"  }, { label:"Alert Supervisor", icon:Radio,       variant:"primary" }] },
  { id:"se2", severity:"CRITICAL", title:"Unauthorized access — Gate 2",               detail:"Unidentified person at restricted entry",   location:"Gate 2 · Camera 11",           ageSeconds:55,  actions:[{ label:"Lock Zone",        icon:Lock,         variant:"danger"  }, { label:"Deploy Officer",  icon:UserPlus,     variant:"primary" }] },
  { id:"se3", severity:"HIGH",     title:"Near-miss — forklift & pedestrian",          detail:"Pedestrian entered active forklift aisle",  location:"Warehouse A · Aisle 3",        ageSeconds:134, actions:[{ label:"Dispatch Response", icon:Radio,        variant:"danger"  }, { label:"File Report",     icon:ClipboardList, variant:"default" }] },
  { id:"se4", severity:"HIGH",     title:"Repeat violator — Worker #14",               detail:"4th PPE violation this shift",              location:"Zone E · Camera 07",           ageSeconds:248, actions:[{ label:"Deploy Officer",   icon:UserPlus,     variant:"primary" }, { label:"Flag for Review", icon:ShieldAlert,  variant:"default" }] },
  { id:"se5", severity:"MEDIUM",   title:"Safety vest not detected",                   detail:"2 workers in loading dock without high-vis", location:"Loading Dock · Camera 09",    ageSeconds:390, actions:[{ label:"Alert Supervisor", icon:Radio,        variant:"warning" }, { label:"Log Incident",    icon:ClipboardList, variant:"default" }] },
  { id:"se6", severity:"MEDIUM",   title:"Camera offline — Zone B",                    detail:"No signal for 4 min — coverage gap",        location:"Zone B · Camera 02",           ageSeconds:510, actions:[{ label:"Notify Tech",      icon:PhoneCall,    variant:"default" }, { label:"Deploy Officer",  icon:UserPlus,     variant:"default" }] },
  { id:"se7", severity:"INFO",     title:"Zone A compliance restored",                 detail:"All workers compliant after intervention",  location:"Zone A",                       ageSeconds:680, actions:[{ label:"Mark Resolved",    icon:CheckCircle2, variant:"default" }] },
  { id:"se8", severity:"MEDIUM",   title:"Equipment left in walkway",                  detail:"Power tool blocking emergency exit path",   location:"Assembly B · Bay 4",           ageSeconds:820, actions:[{ label:"Lock Zone",        icon:Lock,         variant:"warning" }, { label:"Alert Supervisor", icon:Radio,       variant:"default" }] },
];

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAge(sec: number) {
  if (sec < 60)   return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

const ACK_LABELS   = new Set(["File Report","Log Incident","Flag for Review","Notify Tech","Switch Feed","Alert QE","Alert Supervisor","Alert Operator","Alert Engineer"]);
const RESOLVE_LABELS = new Set(["Release Batch","Mark Resolved","Reject Batch"]);

// ── Component ─────────────────────────────────────────────────────────────────

interface Props {
  terminology: QualityTerminology;
  appId: string;
}

export const InstantAnalyticsPanel = ({ terminology, appId: _appId }: Props) => {
  const base = terminology.isDefectApp ? DEFECT_EVENTS : SAFETY_EVENTS;

  const [states, setStates]     = useState<Record<string, EvtState>>({});
  const [ticked, setTicked]     = useState(0);
  const [newCount, setNewCount] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setTicked(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const id = setInterval(() => setNewCount(n => n + 1), 45_000);
    return () => clearInterval(id);
  }, []);

  const act = useCallback((evId: string, label: string) => {
    setStates(s => ({
      ...s,
      [evId]: RESOLVE_LABELS.has(label) ? "RESOLVED" : ACK_LABELS.has(label) ? "ACKNOWLEDGED" : "ACKNOWLEDGED",
    }));
  }, []);

  const liveRows   = base.filter(e => (states[e.id] ?? "LIVE") === "LIVE");
  const ackedRows  = base.filter(e => states[e.id] === "ACKNOWLEDGED");
  const resolvedN  = base.filter(e => states[e.id] === "RESOLVED").length;
  const critN      = liveRows.filter(e => e.severity === "CRITICAL").length;

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 px-4 py-3 border-b border-neutral-100">
        <Zap className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
          Instant Analytics
        </span>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
        <span className="text-[9px] font-bold uppercase tracking-wider text-[#00775B]">Live</span>

        <div className="ml-auto flex items-center gap-1.5">
          {newCount > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-700">
              +{newCount} new
            </span>
          )}
          {critN > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              {critN} CRITICAL
            </span>
          )}
          <span className="text-[9px] text-neutral-400">
            {liveRows.length} active · {ackedRows.length} acked · {resolvedN} resolved
          </span>
        </div>
      </div>

      {/* ── Table ──────────────────────────────────────────────────────────── */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[700px] text-xs">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="w-[3px] p-0" />
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-24">Severity</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Event</th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-44">Location</th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-20">Age</th>
              <th className="pl-2 pr-4 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-56">Actions</th>
            </tr>
          </thead>

          {/* Live rows */}
          <tbody className="divide-y divide-neutral-50">
            {liveRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-10 text-center">
                  <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                    <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                    <span className="text-[11px] font-semibold">All clear — no active events</span>
                  </div>
                </td>
              </tr>
            ) : liveRows.map((ev) => (
              <tr
                key={ev.id}
                className={cn("group transition-colors", SEV_ROW[ev.severity], "hover:bg-neutral-50/70")}
              >
                {/* Severity bar */}
                <td className={cn("w-[3px] p-0", SEV_BAR[ev.severity])} />

                {/* Severity badge */}
                <td className="pl-4 pr-2 py-2.5">
                  <span className={cn(
                    "inline-flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide",
                    SEV_BADGE[ev.severity]
                  )}>
                    {ev.severity === "CRITICAL" && (
                      <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                    )}
                    {ev.severity}
                  </span>
                </td>

                {/* Event title + detail */}
                <td className="px-2 py-2.5 min-w-0">
                  <p className="text-[12px] font-bold text-neutral-900 leading-snug">{ev.title}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5 leading-snug">{ev.detail}</p>
                </td>

                {/* Location */}
                <td className="px-2 py-2.5">
                  <span className="text-[10px] font-mono text-neutral-400">
                    📍 {ev.location}
                  </span>
                </td>

                {/* Age */}
                <td className="px-2 py-2.5 text-right">
                  <span className="text-[10px] font-mono tabular-nums text-neutral-400">
                    {fmtAge(ev.ageSeconds + ticked)}
                  </span>
                </td>

                {/* Actions */}
                <td className="pl-2 pr-4 py-2.5">
                  <div className="flex items-center justify-end gap-1.5 flex-wrap">
                    {ev.actions.map((a) => (
                      <button
                        key={a.label}
                        onClick={() => act(ev.id, a.label)}
                        className={cn(
                          "inline-flex items-center gap-1 h-6 px-2 rounded-[3px] text-[9px] font-bold transition-colors whitespace-nowrap",
                          BTN[a.variant]
                        )}
                      >
                        <a.icon className="w-2.5 h-2.5 shrink-0" />
                        {a.label}
                      </button>
                    ))}
                    <button
                      onClick={() => setStates(s => ({ ...s, [ev.id]: "RESOLVED" }))}
                      className="text-neutral-300 hover:text-neutral-500 transition-colors ml-1"
                      title="Dismiss"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>

          {/* Acknowledged rows (dimmed section) */}
          {ackedRows.length > 0 && (
            <tbody className="divide-y divide-neutral-50 opacity-50">
              <tr>
                <td colSpan={6} className="px-4 py-1.5 bg-neutral-50">
                  <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">
                    Acknowledged
                  </span>
                </td>
              </tr>
              {ackedRows.map((ev) => (
                <tr key={ev.id} className="hover:bg-neutral-50/50 transition-colors">
                  <td className="w-[3px] p-0 bg-neutral-300" />
                  <td className="pl-4 pr-2 py-2">
                    <span className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] bg-neutral-100 text-neutral-500 uppercase">
                      <RotateCcw className="w-2 h-2" />
                      ACKED
                    </span>
                  </td>
                  <td className="px-2 py-2 text-[12px] font-bold text-neutral-500">{ev.title}</td>
                  <td className="px-2 py-2 text-[10px] font-mono text-neutral-400">{ev.location}</td>
                  <td className="px-2 py-2 text-right text-[10px] font-mono tabular-nums text-neutral-400">
                    {fmtAge(ev.ageSeconds + ticked)}
                  </td>
                  <td className="pl-2 pr-4 py-2 text-right">
                    <button
                      onClick={() => setStates(s => ({ ...s, [ev.id]: "RESOLVED" }))}
                      className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                    >
                      Resolve
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          )}
        </table>
      </div>

      {/* ── Footer ─────────────────────────────────────────────────────────── */}
      <div className="border-t border-neutral-100 px-4 py-2.5 bg-neutral-50/60 flex items-center gap-3">
        <AlertTriangle className="w-3 h-3 text-neutral-300" />
        <span className="text-[10px] text-neutral-400">
          Monitoring <span className="font-bold text-neutral-600">{terminology.appLabel}</span>
          <span className="mx-1.5 text-neutral-200">·</span>
          Actions logged to incident record
        </span>
        <span className="ml-auto text-[9px] font-mono text-neutral-300">
          {ticked % 60 < 3 ? "just now" : `${ticked % 60}s ago`}
        </span>
      </div>

    </div>
  );
};
