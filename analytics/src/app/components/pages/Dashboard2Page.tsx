/**
 * Dashboard 2 — Full replica of the main dashboard with lifecycle enhancements:
 *   • IncidentCard2: color-neutral status pill + assignee field
 *   • IncidentDetailModal2: multi-tier status banner, full audit timeline,
 *     complete lifecycle action panel (Acknowledge / Reassign / Escalate / Resolve)
 *
 * Severity colors are NEVER used for lifecycle state — they are reserved
 * exclusively for the severity badge in the card header.
 */

import { useState, useEffect, useRef, useCallback } from "react";
import {
  Bell, ChevronDown, ChevronLeft, ChevronRight,
  Check, User, X, Trash2, LayoutGrid, List, Send,
  MapPin, Video, Clock, Settings2, Circle, Snowflake,
  CheckCircle2, AlertTriangle, Copy, Image, Film,
  Zap, Shield, Play, Pause, ExternalLink,
  UserPlus, Users, Search as SearchIcon,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Button } from "@fe-common/components/ui/Button";
import { Checkbox } from "@fe-common/components/ui/Checkbox";
import { SeverityIcon } from "@fe-common/components/ui/SeverityIcon";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PersonaSwitcher, Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { MonitoringWidgets } from "@/app/components/dashboard/MonitoringWidgets";
import { ManagerWidgets } from "@/app/components/dashboard/ManagerWidgets";
import { DirectorDashboard } from "@/app/components/dashboard/DirectorDashboard";
import {
  DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule,
} from "@fe-common/components/ui/DataGrid";
import {
  ALL_INCIDENTS, Incident, IncidentSeverity,
  LOCATIONS, APPLICATIONS, SEVERITIES,
} from "@/app/data/mockData";

// ─── Typography tokens ────────────────────────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: "12px" };
const SANS: React.CSSProperties = { fontFamily: "'Inter',sans-serif", fontSize: "12px" };

// ─── Lifecycle types ──────────────────────────────────────────────────────────
type LifecycleStage = "detected" | "in_progress" | "escalated" | "cooldown" | "resolved";

interface TimelineNode {
  id: string;
  type: "system" | "human";
  icon: string;
  title: string;
  timestamp: string;
  actor?: string;
  note?: string;
  /** Sequential AI re-trigger — renders as a numbered 🚨 sub-alert badge */
  alertIndex?: number;
}

interface LifecycleRecord {
  stage: LifecycleStage;
  assignee: string;
  startedAt: number;
  timeline: TimelineNode[];
  readOnly: boolean;
}

// ─── Stage display config (all neutral — no severity colors) ─────────────────
const STAGE_META: Record<LifecycleStage, { label: string; icon: React.ReactNode }> = {
  detected:    { label: "DETECTED",    icon: <Circle       className="w-2.5 h-2.5" /> },
  in_progress: { label: "IN PROGRESS", icon: <Settings2    className="w-2.5 h-2.5" /> },
  escalated:   { label: "ESCALATED",   icon: <AlertTriangle className="w-2.5 h-2.5" /> },
  cooldown:    { label: "COOLDOWN",    icon: <Snowflake    className="w-2.5 h-2.5" /> },
  resolved:    { label: "RESOLVED",    icon: <CheckCircle2 className="w-2.5 h-2.5" /> },
};

// ─── Severity color helpers (severity color space ONLY) ──────────────────────
const getSeverityBg = (s: string) => ({
  critical: "bg-red-600", high: "bg-[#EA580C]", medium: "bg-[#CA8A04]",
  low: "bg-blue-500", info: "bg-neutral-500", resolved: "bg-green-600",
})[s] ?? "bg-neutral-500";

const getSeverityHex = (s: string) => ({
  critical: "#DC2626", high: "#EA580C", medium: "#CA8A04",
  low: "#3B82F6", info: "#475569", resolved: "#059669",
})[s] ?? "#475569";

// Staff / manager lists used by assignment dialogs
const STAFF_LIST    = ["Priya M.", "Jordan K.", "Liam T.", "Aisha R.", "Carlos V.", "Mei L.", "Sam W.", "Taylor R."];
const MANAGER_LIST  = ["Manager_01 · Alex T.", "Manager_02 · Sarah K.", "Director_01 · James R."];

// ─── Live SLA ticker ──────────────────────────────────────────────────────────
function useTicker(startedAt: number) {
  const [elapsed, setElapsed] = useState(Date.now() - startedAt);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const s = Math.floor(elapsed / 1000);
  return `${String(Math.floor(s / 3600)).padStart(2,"0")}:${String(Math.floor((s % 3600) / 60)).padStart(2,"0")}:${String(s % 60).padStart(2,"0")}`;
}

// ─── Neutral status pill (hollow, gray — lifecycle only) ─────────────────────
function StagePill({ stage, size = "sm" }: { stage: LifecycleStage; size?: "xs" | "sm" }) {
  const { label, icon } = STAGE_META[stage];
  const px = size === "xs" ? "px-1.5 py-0.5" : "px-2 py-1";
  const fs = size === "xs" ? "10px" : "11px";
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full shrink-0", px)}
      style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.82)", ...SANS, fontSize: fs, fontWeight: 600, letterSpacing: "0.04em" }}
    >
      {icon}{label}
    </span>
  );
}

// ─── Build deterministic multi-alert timeline ────────────────────────────────
function buildTimeline(inc: Incident): TimelineNode[] {
  const raw = inc.timestamp.replace(/ [AP]M$/, "");
  const [hh, mm] = raw.split(":").map(Number);
  const fmt = (h: number, m: number, s: number) =>
    `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  // ── Alert #1: first AI trigger ───────────────────────────────────────────
  const nodes: TimelineNode[] = [
    { id:"t1", type:"system", icon:"🚨", title:"Flame Detected", timestamp: fmt(hh,mm,0), alertIndex: 1 },
  ];

  if (inc.severity === "critical" || inc.severity === "high") {
    nodes.push({ id:"t2", type:"system", icon:"🔔", title:"Alert Broadcast to Monitoring Staff", timestamp: fmt(hh,mm,14) });
    nodes.push({ id:"t3", type:"human",  icon:"👤", title:"Assigned to Staff_04", actor:"Staff_04", timestamp: fmt(hh,mm+1,22) });
    nodes.push({ id:"t4", type:"human",  icon:"👁", title:"Acknowledged by Staff_04", actor:"Staff_04", timestamp: fmt(hh,mm+2,37) });
  }

  if (inc.severity === "critical") {
    // ── Sensor cooldown after first alert ───────────────────────────────────
    nodes.push({ id:"t5", type:"system", icon:"❄️", title:"Sensor Cooldown Detected", timestamp: fmt(hh,mm+4,8) });

    // ── Alert #2: re-trigger after cooldown ─────────────────────────────────
    nodes.push({ id:"t6", type:"system", icon:"🚨", title:"Flame Detected Again", timestamp: fmt(hh,mm+8,12), alertIndex: 2 });

    // ── Escalation with operator note ───────────────────────────────────────
    nodes.push({
      id:"t7", type:"human", icon:"🟠",
      title:"Escalated to Manager by Operator_02", actor:"Operator_02",
      timestamp: fmt(hh,mm+10,47),
      note: inc.description ?? "Sensor re-trigger confirmed — active threat still present after cooldown window.",
    });
  }

  return nodes.reverse();
}

// ─── Init lifecycle records ───────────────────────────────────────────────────
function initRecords(): Map<number, LifecycleRecord> {
  const m = new Map<number, LifecycleRecord>();
  ALL_INCIDENTS.forEach(inc => {
    const stage: LifecycleStage =
      inc.severity === "critical" ? "escalated"   :
      inc.severity === "high"     ? "in_progress" :
      inc.severity === "resolved" ? "resolved"    : "detected";
    m.set(inc.id, {
      stage,
      assignee: stage === "escalated" ? "Manager_01" : stage === "detected" ? "Unassigned" : "Staff_04",
      startedAt: Date.now() - (inc.id * 97_000),
      timeline: buildTimeline(inc),
      readOnly: stage === "escalated" || stage === "resolved",
    });
  });
  return m;
}

// ═══════════════════════════════════════════════════════════════════════════════
// IncidentCard2 — v1.2 design: overlay tags, circular hover, no footer strip
// ═══════════════════════════════════════════════════════════════════════════════
interface Card2Props {
  incident:     Incident;
  record:       LifecycleRecord;
  className?:   string;
  forceHover?:  boolean;
  onCardClick?: () => void;
  onSelfAssign?: () => void;
  onAssignTo?:   () => void;
  onEscalate?:   () => void;
  onResolve?:    () => void;
}

// Circular icon-only action button for hover overlay
function CircleBtn({ icon, bg, title, onClick }: { icon: React.ReactNode; bg: string; title: string; onClick: (e: React.MouseEvent) => void }) {
  return (
    <button
      title={title}
      onClick={onClick}
      className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg transition-transform hover:scale-110"
      style={{ background: bg, backdropFilter: "blur(4px)" }}
    >
      {icon}
    </button>
  );
}

export function IncidentCard2({ incident, record, className, forceHover, onCardClick, onSelfAssign, onAssignTo, onEscalate, onResolve }: Card2Props) {
  const [hov, setHov] = useState(false);
  const { severity, title, timestamp, incidentId, location, camera, image } = incident;
  const sevHex  = getSeverityHex(severity);
  const sevBgCl = getSeverityBg(severity);
  const isActive = hov || !!forceHover;

  // Determine which hover condition applies
  const canAssign   = record.stage === "detected";
  const canEscalate = record.stage === "in_progress" || record.stage === "cooldown";

  return (
    <div
      onClick={onCardClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn(
        "relative flex flex-col overflow-hidden rounded-sm border cursor-pointer shrink-0",
        "border-neutral-200 shadow-sm transition-all duration-300",
        isActive && "shadow-lg -translate-y-0.5",
        className,
      )}
      style={{ width: "260px" }}
    >
      {/* ── Header: severity bg, 52px, dual-row ─────────────────────────── */}
      <div className={cn("flex flex-col justify-center px-3 py-2 gap-0.5 shrink-0", sevBgCl)} style={{ height: "52px" }}>
        {/* Row 1: title + solid-white status tag */}
        <div className="flex items-center justify-between gap-2">
          <span className="truncate" style={{ ...SANS, fontSize: "12px", fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>
            {title}
          </span>
          <span
            className="shrink-0 rounded-[4px] px-2 py-0.5"
            style={{ ...SANS, fontSize: "11px", fontWeight: 600, color: "#1E293B", background: "#FFFFFF", whiteSpace: "nowrap" as const }}
          >
            {STAGE_META[record.stage].label}
          </span>
        </div>
        {/* Row 2: timestamp + incident ID — high-contrast Mono */}
        <div className="flex items-center justify-between">
          <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.95)" }}>{timestamp}</span>
          <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.88)" }}>{incidentId}</span>
        </div>
      </div>

      {/* ── Image: 148px, overlay tags, hover actions ────────────────────── */}
      <div className="relative overflow-hidden" style={{ height: "148px" }}>
        <ImageWithFallback
          src={image} alt="Incident"
          className={cn("w-full h-full object-cover transition-transform duration-500", isActive && "scale-[1.03]")}
        />

        {/* Camera overlay — top-left */}
        <div className="absolute top-2 left-2 z-10 inline-flex items-center" style={{ height:"24px", padding:"0 8px", borderRadius:"2px", background:"rgba(0,0,0,0.80)", backdropFilter:"blur(6px)" }}>
          <span style={{ ...SANS, fontSize:"10px", fontWeight:700, color:"#FFFFFF" }}>{camera}</span>
        </div>

        {/* Location overlay — top-right */}
        <div className="absolute top-2 right-2 z-10 inline-flex items-center" style={{ height:"24px", padding:"0 8px", borderRadius:"2px", background:"rgba(0,0,0,0.80)", backdropFilter:"blur(6px)" }}>
          <span style={{ ...SANS, fontSize:"10px", fontWeight:700, color:"#FFFFFF" }}>{location}</span>
        </div>

        {/* Assignee / Unassigned — bottom-right */}
        <div className="absolute bottom-2 right-2 z-10">
          {record.assignee === "Unassigned" ? (
            // Severity-colored unassigned tag
            <div className="inline-flex items-center gap-1.5" style={{ height:"24px", padding:"0 8px", borderRadius:"2px", background: sevHex }}>
              <AlertTriangle style={{ width:"11px", height:"11px", fill:"#FFFFFF", color: sevHex, flexShrink:0 }} />
              <span style={{ ...SANS, fontSize:"10px", fontWeight:700, color:"#FFFFFF", whiteSpace:"nowrap" as const }}>Un-Assigned</span>
            </div>
          ) : (
            // Teal assignee tag
            <div className="inline-flex items-center gap-1.5" style={{ height:"24px", padding:"0 8px", borderRadius:"2px", background:"#00775B" }}>
              <User style={{ width:"11px", height:"11px", color:"#FFFFFF", flexShrink:0 }} />
              <span style={{ ...SANS, fontSize:"10px", fontWeight:700, color:"#FFFFFF", whiteSpace:"nowrap" as const }}>{record.assignee}</span>
            </div>
          )}
        </div>

        {/* Hover gradient + circular action buttons */}
        <div
          className="absolute inset-0 z-20 flex flex-col justify-end transition-opacity duration-200"
          style={{
            background: "linear-gradient(to top, rgba(0,0,0,0.80) 0%, rgba(0,0,0,0.35) 50%, transparent 100%)",
            opacity: isActive ? 1 : 0,
            pointerEvents: isActive ? "auto" : "none",
          }}
        >
          <div className="flex items-center justify-center gap-4 pb-4">
            {canAssign && (
              <>
                {/* Self Assign — primary teal */}
                <CircleBtn
                  icon={<User style={{ width:"18px", height:"18px", color:"#FFFFFF" }} />}
                  bg="#00775B" title="Self Assign"
                  onClick={e => { e.stopPropagation(); onSelfAssign?.(); }}
                />
                {/* Assign To.. — white */}
                <CircleBtn
                  icon={<Users style={{ width:"18px", height:"18px", color:"#1E293B" }} />}
                  bg="rgba(255,255,255,0.92)" title="Assign To…"
                  onClick={e => { e.stopPropagation(); onAssignTo?.(); }}
                />
              </>
            )}
            {canEscalate && (
              <>
                {/* Escalate — severity color */}
                <CircleBtn
                  icon={<AlertTriangle style={{ width:"22px", height:"22px", fill:"#FFFFFF", color: sevHex }} />}
                  bg={sevHex} title="Escalate"
                  onClick={e => { e.stopPropagation(); onEscalate?.(); }}
                />
                {/* Resolve — teal */}
                <CircleBtn
                  icon={<Check style={{ width:"22px", height:"22px", color:"#FFFFFF" }} strokeWidth={3} />}
                  bg="#00775B" title="Resolve"
                  onClick={e => { e.stopPropagation(); onResolve?.(); }}
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Confirmation Dialogs
// ═══════════════════════════════════════════════════════════════════════════════

// Shared incident meta strip used inside all 3 dialogs
function IncidentMetaStrip({ incident }: { incident: Incident }) {
  const sevHex = getSeverityHex(incident.severity);
  return (
    <div className="flex items-start gap-3 p-3 rounded-[6px] border border-neutral-200 bg-neutral-50">
      <div
        className="w-7 h-7 rounded-[4px] flex items-center justify-center shrink-0"
        style={{ background: sevHex }}
      >
        <SeverityIcon severity={incident.severity} mode="inverse" className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p style={{ ...SANS, fontWeight:700, color:"#0F172A", fontSize:"13px" }}>{incident.title}</p>
          <span style={{ ...MONO, fontSize:"11px", color:"#64748B", background:"#F1F5F9", padding:"1px 6px", borderRadius:"3px", border:"1px solid #E2E8F0" }}>{incident.incidentId}</span>
        </div>
        <div className="flex items-center gap-3 mt-1">
          <span className="flex items-center gap-1" style={{ ...SANS, fontSize:"11px", color:"#64748B" }}>
            <MapPin className="w-3 h-3" />{incident.location}
          </span>
          <span className="flex items-center gap-1" style={{ ...MONO, fontSize:"11px", color:"#64748B" }}>
            <Video className="w-3 h-3" />{incident.camera}
          </span>
        </div>
      </div>
    </div>
  );
}

// Shared dialog shell
function DialogShell({ title, children, onCancel }: { title: string; children: React.ReactNode; onCancel: () => void }) {
  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.50)" }}
      onClick={onCancel}
    >
      <div
        className="w-[420px] bg-white rounded-[8px] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <h3 style={{ ...SANS, fontWeight:700, color:"#0F172A", fontSize:"14px" }}>{title}</h3>
          <button onClick={onCancel} className="p-1 rounded text-neutral-400 hover:text-neutral-600">
            <X className="w-4 h-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

// Shared search-select dropdown
function StaffDropdown({ options, value, onChange, placeholder }: { options: string[]; value: string; onChange: (v: string) => void; placeholder: string }) {
  const [query, setQuery] = useState("");
  const [open,  setOpen]  = useState(false);
  const filtered = options.filter(o => o.toLowerCase().includes(query.toLowerCase()));
  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 border border-neutral-200 rounded-[4px] px-3 py-2 cursor-text focus-within:border-[#00775B] transition-colors"
        onClick={() => setOpen(true)}
      >
        <SearchIcon className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <input
          autoFocus
          value={value || query}
          onChange={e => { setQuery(e.target.value); onChange(""); setOpen(true); }}
          placeholder={placeholder}
          className="flex-1 outline-none bg-transparent"
          style={{ ...SANS, fontSize:"12px", color:"#0F172A" }}
        />
      </div>
      {open && filtered.length > 0 && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white border border-neutral-200 rounded-[4px] shadow-lg py-1 max-h-40 overflow-y-auto">
            {filtered.map(opt => (
              <button
                key={opt}
                className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors"
                style={{ ...SANS, fontSize:"12px", color:"#0F172A" }}
                onClick={() => { onChange(opt); setQuery(""); setOpen(false); }}
              >
                {opt}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// Dialog 1: Self Assign
export function SelfAssignDialog({ incident, onConfirm, onCancel }: { incident: Incident; onConfirm: () => void; onCancel: () => void }) {
  return (
    <DialogShell title="Assign to yourself?" onCancel={onCancel}>
      <div className="px-5 py-4 space-y-4">
        <IncidentMetaStrip incident={incident} />
        <p style={{ ...SANS, fontSize:"12px", color:"#64748B" }}>
          You will be assigned as the primary responder and the incident will move to <strong>In Progress</strong>.
        </p>
      </div>
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-[4px] border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors" style={{ ...SANS, fontSize:"12px" }}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="h-9 px-5 rounded-[4px] flex items-center gap-1.5 text-white font-semibold transition-colors hover:bg-[#009e78]"
          style={{ ...SANS, fontSize:"12px", background:"#00775B" }}
        >
          <User className="w-3.5 h-3.5" /> Yes, Assign to me
        </button>
      </div>
    </DialogShell>
  );
}

// Dialog 2: Assign To..
export function AssignToDialog({ incident, onConfirm, onCancel }: { incident: Incident; onConfirm: (name: string) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState("");
  return (
    <DialogShell title="Assign to a team member" onCancel={onCancel}>
      <div className="px-5 py-4 space-y-4">
        <IncidentMetaStrip incident={incident} />
        <div>
          <p style={{ ...SANS, fontSize:"11px", fontWeight:700, color:"#475569", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"8px" }}>Select Staff Member</p>
          <StaffDropdown options={STAFF_LIST} value={selected} onChange={setSelected} placeholder="Search staff…" />
        </div>
      </div>
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-[4px] border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors" style={{ ...SANS, fontSize:"12px" }}>
          Cancel
        </button>
        <button
          onClick={() => selected && onConfirm(selected)}
          className="h-9 px-5 rounded-[4px] flex items-center gap-1.5 text-white font-semibold transition-colors"
          style={{ ...SANS, fontSize:"12px", background: selected ? "#00775B" : "#94A3B8", cursor: selected ? "pointer" : "default" }}
        >
          <Users className="w-3.5 h-3.5" /> Assign
        </button>
      </div>
    </DialogShell>
  );
}

// Dialog 3: Escalate
export function EscalateConfirmDialog({ incident, onConfirm, onCancel }: { incident: Incident; onConfirm: (manager: string, note: string) => void; onCancel: () => void }) {
  const [manager, setManager] = useState("");
  const [note,    setNote]    = useState("");
  const sevHexLocal = getSeverityHex(incident.severity);
  return (
    <DialogShell title="Escalate to Manager" onCancel={onCancel}>
      <div className="px-5 py-4 space-y-4">
        <IncidentMetaStrip incident={incident} />
        <div>
          <p style={{ ...SANS, fontSize:"11px", fontWeight:700, color:"#475569", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"8px" }}>Select Manager</p>
          <StaffDropdown options={MANAGER_LIST} value={manager} onChange={setManager} placeholder="Search managers…" />
        </div>
        <div>
          <p style={{ ...SANS, fontSize:"11px", fontWeight:700, color:"#475569", letterSpacing:"0.07em", textTransform:"uppercase", marginBottom:"8px" }}>Escalation Note <span style={{ color:"#94A3B8", fontWeight:400 }}>(optional)</span></p>
          <textarea
            value={note} onChange={e => setNote(e.target.value)}
            placeholder="Describe the escalation reason…" rows={3}
            className="w-full rounded-[4px] border border-neutral-200 resize-none outline-none focus:border-[#00775B] transition-colors"
            style={{ ...SANS, fontSize:"12px", color:"#0F172A", padding:"10px 12px", lineHeight:1.6 }}
          />
        </div>
      </div>
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-[4px] border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors" style={{ ...SANS, fontSize:"12px" }}>
          Cancel
        </button>
        <button
          onClick={() => manager && onConfirm(manager, note.trim())}
          className="h-9 px-5 rounded-[4px] flex items-center gap-1.5 text-white font-semibold transition-colors"
          style={{ ...SANS, fontSize:"12px", background: manager ? "#EA580C" : "#94A3B8", cursor: manager ? "pointer" : "default" }}
        >
          <AlertTriangle style={{ width:"14px", height:"14px", fill:"#FFFFFF", color: sevHexLocal }} /> Escalate
        </button>
      </div>
    </DialogShell>
  );
}

// Dialog 4: Resolve
export function ResolveDialog({ incident, onConfirm, onCancel }: { incident: Incident; onConfirm: () => void; onCancel: () => void }) {
  return (
    <DialogShell title="Resolve this incident?" onCancel={onCancel}>
      <div className="px-5 py-4 space-y-4">
        <IncidentMetaStrip incident={incident} />
        <p style={{ ...SANS, fontSize:"12px", color:"#64748B" }}>
          Marking as resolved will close the ticket and lock the audit timeline. This action cannot be undone.
        </p>
      </div>
      <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
        <button onClick={onCancel} className="h-9 px-4 rounded-[4px] border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors" style={{ ...SANS, fontSize:"12px" }}>
          Cancel
        </button>
        <button
          onClick={onConfirm}
          className="h-9 px-5 rounded-[4px] flex items-center gap-1.5 text-white font-semibold transition-colors hover:bg-emerald-700"
          style={{ ...SANS, fontSize:"12px", background:"#00775B" }}
        >
          <Check className="w-3.5 h-3.5" strokeWidth={3} /> Resolve
        </button>
      </div>
    </DialogShell>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// ═══════════════════════════════════════════════════════════════════════════════
// IncidentDetailModal2 — Matrice Design System v1.1 compliant
// ═══════════════════════════════════════════════════════════════════════════════
interface Modal2Props {
  incident: Incident | null;
  record:   LifecycleRecord | null;
  open:     boolean;
  onClose:  () => void;
  onUpdate: (r: LifecycleRecord) => void;
  persona:  Persona;
}

// ── Snappy easing ─────────────────────────────────────────────────────────────
const SNAPPY = "cubic-bezier(0.22, 1, 0.36, 1)";

// ── Severity hex map ─────────────────────────────────────────────────────────
const SEV_HEX: Record<string, string> = {
  critical: "#DC2626", high: "#EA580C", medium: "#CA8A04",
  low: "#3B82F6", info: "#475569", resolved: "#059669",
};

// ── Chronological audit timeline node ────────────────────────────────────────
// Alignment strategy: height-matched wrapper.
//   Both the ring wrapper (axis) and the first-line text wrapper (content) are
//   given an explicit height of ROW_H px with align-items:center. Flexbox then
//   centres both to the exact same y — no manual offset arithmetic needed.
//
// Node types:
//   System/AI    → hollow ring, 1.5px teal (#00775B) border, no fill
//   Human/Op     → same hollow ring + 4px solid core (#64748B)
//   Sub-alert    → same ring + core, both in severityColor
function TNode2({ node, isLast, severityColor = "#DC2626" }: { node: TimelineNode; isLast: boolean; severityColor?: string }) {
  const isSystem   = node.type === "system";
  const isSubAlert = node.alertIndex !== undefined;

  const RING  = 10;    // ring outer diameter, px
  const CORE  = 4;     // inner dot diameter, px
  const ROW_H = 22;    // px — shared first-row height for axis wrapper + text wrapper

  const ringBorder = isSubAlert ? severityColor : isSystem ? "#00775B" : "#64748B";
  const showCore   = !isSystem || isSubAlert;
  const coreColor  = isSubAlert ? severityColor : "#64748B";

  return (
    <div className="flex gap-3">

      {/* ── Axis column ───────────────────────────────────────────────────── */}
      <div className="flex flex-col items-center" style={{ flexShrink: 0, width: `${RING}px` }}>

        {/* Ring wrapper — exactly ROW_H tall, centres ring to match text cap */}
        <div style={{ height: `${ROW_H}px`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div
            style={{
              width:  `${RING}px`,
              height: `${RING}px`,
              borderRadius: "50%",
              border: `1.5px solid ${ringBorder}`,
              background: "transparent",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}
          >
            {showCore && (
              <div style={{ width: `${CORE}px`, height: `${CORE}px`, borderRadius: "50%", background: coreColor }} />
            )}
          </div>
        </div>

        {/* Rail — 1px neutral, connects ring bottoms */}
        {!isLast && (
          <div style={{ flex: 1, width: "1px", background: "#E2E8F0", minHeight: "16px" }} />
        )}
      </div>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <div className="flex-1 pb-4 min-w-0">

        {/* Sub-alert: severity-banded label */}
        {isSubAlert ? (
          <div
            className="flex items-center px-3 rounded-[4px] mb-1.5"
            style={{ background: severityColor, height: `${ROW_H}px` }}
          >
            <span
              className="uppercase flex-1 truncate mr-4"
              style={{ ...SANS, fontSize: "11px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.05em" }}
            >
              Alert #{node.alertIndex} — {node.title}
            </span>
            <span className="shrink-0 tabular-nums" style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.82)", fontWeight: 600 }}>
              {node.timestamp}
            </span>
          </div>
        ) : (
          /* Standard row — wrapper matches ROW_H so ring + text share the same centre */
          <div
            className="flex items-center justify-between gap-3"
            style={{ height: `${ROW_H}px` }}
          >
            <div className="min-w-0 flex items-center gap-1.5 flex-wrap">
              <span style={{ ...SANS, fontWeight: 600, color: "#0F172A", fontSize: "12px", lineHeight: `${ROW_H}px` }}>
                {node.title}
              </span>
              {node.actor && (
                <span style={{ ...SANS, color: "#94A3B8", fontSize: "11px", lineHeight: `${ROW_H}px` }}>
                  · {node.actor}
                </span>
              )}
            </div>
            <span className="shrink-0 tabular-nums" style={{ ...MONO, fontSize: "11px", color: "#475569", fontWeight: 600 }}>
              {node.timestamp}
            </span>
          </div>
        )}

        {/* Commentary sub-plate */}
        {node.note && (
          <div
            className="mt-1.5 px-3 py-2 rounded-[3px]"
            style={{ background: "rgba(0,0,0,0.02)", border: "1px solid rgba(0,0,0,0.05)" }}
          >
            <span style={{ ...SANS, fontSize: "11px", color: "#64748B", lineHeight: 1.65 }}>
              ↳ Note: <span style={{ fontStyle: "italic", color: "#374151" }}>"{node.note}"</span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Mock video player ─────────────────────────────────────────────────────────
function VideoPlayer2({ incident }: { incident: Incident }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(14);   // seconds
  const [speed, setSpeed]       = useState(1);
  const TOTAL = 150; // 2:30

  useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => setProgress(p => p >= TOTAL ? 0 : p + speed * 0.1), 100);
    return () => clearInterval(id);
  }, [playing, speed]);

  const fmt = (s: number) =>
    `${String(Math.floor(s / 60)).padStart(2,"0")}:${String(Math.floor(s % 60)).padStart(2,"0")}`;

  const scrub = (e: React.MouseEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    setProgress(((e.clientX - r.left) / r.width) * TOTAL);
  };

  const pct = `${((progress / TOTAL) * 100).toFixed(1)}%`;

  return (
    <div className="flex flex-col h-full bg-[#020912]">
      {/* Video frame */}
      <div className="relative flex-1 overflow-hidden">
        <img src={incident.image} alt="Video" className="w-full h-full object-cover opacity-75" />
        {/* Scanline texture */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 3px)" }} />
        {/* Pause overlay */}
        {!playing && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/25">
            <button
              onClick={() => setPlaying(true)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={{ background: "rgba(255,255,255,0.18)", backdropFilter: "blur(8px)", border: "1.5px solid rgba(255,255,255,0.30)" }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.28)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.18)"; }}
            >
              <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
            </button>
          </div>
        )}
      </div>

      {/* Controls bar */}
      <div className="shrink-0 px-3 pt-2.5 pb-2.5" style={{ background: "#060e1f", borderTop: "1px solid rgba(255,255,255,0.07)" }}>
        {/* Scrubber */}
        <div
          className="relative h-[3px] rounded-full mb-2.5 cursor-pointer"
          style={{ background: "rgba(255,255,255,0.12)" }}
          onClick={scrub}
        >
          <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: pct, background: "#00775B" }} />
          <div
            className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow"
            style={{ left: `calc(${pct} - 6px)` }}
          />
        </div>

        {/* Controls row */}
        <div className="flex items-center gap-3">
          {/* Play/Pause */}
          <button onClick={() => setPlaying(p => !p)} className="text-white/80 hover:text-white transition-colors">
            {playing
              ? <Pause className="w-4 h-4" fill="currentColor" />
              : <Play  className="w-4 h-4" fill="currentColor" />}
          </button>

          {/* Elapsed / Total */}
          <span className="tabular-nums" style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.70)" }}>
            {fmt(progress)}{" "}
            <span style={{ color: "rgba(255,255,255,0.35)" }}>/</span>{" "}
            {fmt(TOTAL)}
          </span>

          <div className="flex-1" />

          {/* Speed selector */}
          <div className="flex items-center gap-0.5 bg-white/8 rounded-[3px] p-0.5">
            {[0.5, 1, 1.5, 2].map(s => (
              <button
                key={s}
                onClick={() => setSpeed(s)}
                className="px-2 py-0.5 rounded-[2px] transition-all"
                style={{
                  ...MONO, fontSize: "10px", fontWeight: 700,
                  color: speed === s ? "#FFFFFF" : "rgba(255,255,255,0.38)",
                  background: speed === s ? "rgba(255,255,255,0.18)" : "transparent",
                }}
              >
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Escalation note popup ─────────────────────────────────────────────────────
function EscalatePopup2({ onSubmit, onCancel }: { onSubmit: (n: string) => void; onCancel: () => void }) {
  const [note, setNote] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center" style={{ background: "rgba(15,23,42,0.55)", backdropFilter: "blur(8px)" }} onClick={onCancel}>
      <div
        className="w-[440px] rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        style={{ background: "rgba(15,23,42,0.96)", border: "1px solid rgba(255,255,255,0.10)", boxShadow: "0 24px 64px rgba(0,0,0,0.60)" }}
        onClick={e => e.stopPropagation()}
      >
        <div className="px-5 py-4 border-b flex items-center justify-between" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <div>
            <span style={{ ...SANS, fontWeight: 700, color: "rgba(255,255,255,0.92)", fontSize: "13px" }}>Escalate to Manager</span>
            <p style={{ ...SANS, fontSize: "11px", color: "rgba(255,255,255,0.40)", marginTop: "3px" }}>Add an optional note for the incident record.</p>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-md" style={{ color: "rgba(255,255,255,0.40)" }}><X className="w-4 h-4" /></button>
        </div>
        <div className="p-5">
          <textarea
            ref={ref} value={note} onChange={e => setNote(e.target.value)}
            placeholder="Describe the escalation reason…" rows={3}
            className="w-full rounded-[4px] resize-none outline-none"
            style={{ ...SANS, fontSize: "12px", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.09)", color: "rgba(255,255,255,0.85)", padding: "10px 12px", lineHeight: 1.65 }}
            onKeyDown={e => { if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit(note.trim()); if (e.key === "Escape") onCancel(); }}
          />
          <div className="flex items-center justify-between mt-4">
            <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>⌘↵ submit · ESC cancel</span>
            <div className="flex gap-2">
              <button onClick={onCancel} className="h-8 px-4 rounded-md" style={{ ...SANS, fontSize: "12px", color: "rgba(255,255,255,0.50)", border: "1px solid rgba(255,255,255,0.10)", background: "transparent" }}>Cancel</button>
              <button
                onClick={() => onSubmit(note.trim())}
                className="h-8 px-4 rounded-md flex items-center gap-1.5"
                style={{ ...SANS, fontSize: "12px", fontWeight: 600, color: "#fff", background: "#EA580C", transition: `all 200ms ${SNAPPY}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = "0 0 16px rgba(234,88,12,0.45)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = "none"; }}
              >
                <Send className="w-3 h-3" /> Escalate
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Action button with snappy easing + brand glow ────────────────────────────
function ActionBtn2({ icon, label, onClick, variant }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  variant: "primary" | "neutral" | "resolve" | "escalate";
}) {
  const [hov, setHov] = useState(false);

  const base = {
    primary:  { bg: hov ? "#009e78" : "#00775B", color: "#fff",     border: "transparent",                  glow: "0 0 18px rgba(0,119,91,0.40)" },
    neutral:  { bg: hov ? "#F8FAFC" : "#FFFFFF", color: hov ? "#00775B" : "#374151", border: hov ? "#00775B" : "#D1D5DB", glow: "0 0 12px rgba(0,119,91,0.18)" },
    resolve:  { bg: hov ? "#ECFDF5" : "#FFFFFF", color: "#059669",  border: hov ? "#10B981" : "#A7F3D0",    glow: "0 0 14px rgba(5,150,105,0.28)" },
    escalate: { bg: hov ? "#FFF7ED" : "#FFFFFF", color: "#EA580C",  border: hov ? "#EA580C" : "#FDBA74",    glow: "0 0 14px rgba(234,88,12,0.28)" },
  }[variant];

  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      className="flex items-center gap-1.5 h-9 px-4 rounded-[4px] border"
      style={{
        ...SANS,
        fontSize: "12px",
        fontWeight: 600,
        background: base.bg,
        color: base.color,
        borderColor: base.border,
        boxShadow: hov ? base.glow : "none",
        transition: `all 200ms ${SNAPPY}`,
      }}
    >
      {icon}{label}
    </button>
  );
}

// ── Main modal ────────────────────────────────────────────────────────────────
export function IncidentDetailModal2({ incident, record, open, onClose, onUpdate, persona }: Modal2Props) {
  const [showEscalate,   setShowEscalate]   = useState(false);
  const [showSelfAssign, setShowSelfAssign]  = useState(false);
  const [showAssignTo,   setShowAssignTo]    = useState(false);
  const [showResolve,    setShowResolve]     = useState(false);
  const [mediaTab,       setMediaTab]       = useState<"image" | "video">("image");
  const [copied,         setCopied]         = useState(false);
  const ticker = useTicker(record?.startedAt ?? Date.now());

  if (!open || !incident || !record) return null;

  const ts    = () => new Date().toLocaleTimeString("en-GB", { hour12: false });
  const sevBg = SEV_HEX[incident.severity] ?? "#475569";

  const handleCopy = () => {
    navigator.clipboard.writeText(incident.incidentId).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };
  const handleSelfAssign = () => {
    setShowSelfAssign(false);
    onUpdate({ ...record, stage:"in_progress", assignee:"Staff_04", timeline:[{ id:`sa_${Date.now()}`, type:"human", icon:"👤", title:"Self-Assigned by Staff_04", actor:"Staff_04", timestamp:ts() }, ...record.timeline] });
  };
  const handleAssignTo = (name: string) => {
    setShowAssignTo(false);
    onUpdate({ ...record, stage:"in_progress", assignee:name, timeline:[{ id:`at_${Date.now()}`, type:"human", icon:"👤", title:`Assigned to ${name} by Admin`, actor:"Admin", timestamp:ts() }, ...record.timeline] });
  };
  const handleAcknowledge = () => {
    if (record.readOnly) return;
    onUpdate({ ...record, stage: "in_progress", assignee: "Staff_04", timeline: [{ id:`ack_${Date.now()}`, type:"human", icon:"👤", title:"Acknowledged by Staff_04", actor:"Staff_04", timestamp:ts() }, ...record.timeline] });
  };
  const handleEscalate = (note: string) => {
    setShowEscalate(false);
    onUpdate({ ...record, stage:"escalated", assignee:"Manager_01", readOnly:true, timeline:[{ id:`esc_${Date.now()}`, type:"human", icon:"🟠", title:"Escalated to Manager by Operator_02", actor:"Operator_02", timestamp:ts(), note:note||undefined }, ...record.timeline] });
  };
  const handleReassign = () => {
    onUpdate({ ...record, assignee:"Senior_Ops", timeline:[{ id:`re_${Date.now()}`, type:"human", icon:"🔄", title:"Reassigned to Senior_Ops by Staff_04", actor:"Staff_04", timestamp:ts() }, ...record.timeline] });
  };
  const handleResolve = () => {
    if (record.readOnly) return;
    setShowResolve(false);
    onUpdate({ ...record, stage:"resolved", readOnly:true, timeline:[{ id:`res_${Date.now()}`, type:"human", icon:"✅", title:"Incident Resolved by Staff_04", actor:"Staff_04", timestamp:ts() }, ...record.timeline] });
  };
  const handleCooldown = () => {
    onUpdate({ ...record, stage:"cooldown", timeline:[{ id:`cd_${Date.now()}`, type:"system", icon:"❄️", title:"Sensor Cooldown Detected", timestamp:ts() }, ...record.timeline] });
  };

  const stageLabel = STAGE_META[record.stage].label;

  return (
    <>
      {/* ── Backdrop: flat dark, no blur ──────────────────────────────────── */}
      <div
        className="fixed inset-0 z-50 animate-in fade-in duration-150"
        style={{ background: "rgba(0,0,0,0.50)", backdropFilter: "blur(0px)" }}
        onClick={onClose}
      />

      {/* ── Modal shell — wider to accommodate 16:9 image ────────────────── */}
      <div
        className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 rounded-[6px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        style={{
          width: "min(1260px, 96vw)",
          maxHeight: "94vh",
          background: "#FFFFFF",
          boxShadow: "0 24px 64px rgba(0,0,0,0.45), 0 2px 8px rgba(0,0,0,0.15)",
        }}
        onClick={e => e.stopPropagation()}
      >
        <div className="flex flex-col" style={{ maxHeight: "94vh" }}>

          {/* ── Header: severity bg, ID + title left, status + assignee + close right ── */}
          <div
            className="flex items-center px-5 py-3 shrink-0 gap-3"
            style={{ background: sevBg, minHeight: "52px" }}
          >
            {/* Left: ID + copy + separator + title */}
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className="tabular-nums" style={{ ...MONO, fontSize: "13px", fontWeight: 700, color: "#fff", letterSpacing: "0.06em" }}>
                {incident.incidentId}
              </span>
              <button
                onClick={handleCopy}
                className="flex items-center justify-center w-5 h-5 rounded"
                style={{ color: copied ? "#A7F3D0" : "rgba(255,255,255,0.45)", transition: `all 150ms ${SNAPPY}` }}
                title="Copy ID"
              >
                <Copy className="w-3 h-3" />
              </button>
              <span style={{ color: "rgba(255,255,255,0.30)" }}>·</span>
              {/* Incident title — slightly larger */}
              <span className="truncate" style={{ ...SANS, fontWeight: 700, color: "#fff", fontSize: "15px" }}>{incident.title}</span>
            </div>

            {/* Right: [assignee] [status] [activity timer] [close] */}
            <div className="flex items-center gap-2.5 shrink-0">

              {/* 1. Assignee chip — User icon + name, no label prefix */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full"
                style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.22)" }}
              >
                <User className="w-3.5 h-3.5 text-white/80 shrink-0" />
                <span style={{ ...SANS, fontSize: "12px", fontWeight: 600, color: "#FFFFFF", whiteSpace: "nowrap" as const }}>
                  {record.assignee === "Unassigned"
                    ? <span style={{ color: "rgba(255,255,255,0.60)" }}>Assign</span>
                    : record.assignee}
                </span>
              </div>

              {/* 2. Status capsule — solid white, dark text, no icon */}
              <span
                className="inline-flex items-center px-2.5 py-1 rounded-full"
                style={{ background: "#FFFFFF", color: "#1E293B", ...SANS, fontSize: "12px", fontWeight: 700, letterSpacing: "0.03em", whiteSpace: "nowrap" as const }}
              >
                {stageLabel}
              </span>

              {/* 3. Activity timer — styled like the global dashboard clock */}
              <div
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md"
                style={{ background: "rgba(255,255,255,0.10)", border: "1px solid rgba(255,255,255,0.20)" }}
              >
                <Clock className="w-3.5 h-3.5 text-white/70 shrink-0" />
                <span className="tabular-nums" style={{ ...MONO, fontSize: "12px", fontWeight: 600, color: "#FFFFFF" }}>{ticker}</span>
              </div>

              {/* 4. Close */}
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-[4px] flex items-center justify-center text-white shrink-0"
                style={{ background: "rgba(255,255,255,0.00)", transition: `all 150ms ${SNAPPY}` }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.20)"; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.00)"; }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body — left panel is 16:9, right panel is fixed 460px ──────── */}
          <div className="flex overflow-hidden">

            {/* Left: media canvas — 100px vertical breathing room, 16:9 inner media */}
            <div
              className="flex-1 min-w-0 relative flex flex-col justify-center"
              style={{ background: "#020912", paddingTop: "100px", paddingBottom: "100px" }}
            >
              {/* Media tab switcher — anchored to top-left of the whole panel */}
              <div
                className="absolute top-3 left-3 z-20 flex items-center gap-0.5 p-0.5 rounded-[4px]"
                style={{ background: "rgba(0,0,0,0.72)", backdropFilter: "blur(8px)" }}
              >
                {([
                  { id: "image" as const, icon: <Image className="w-3 h-3" />, label: "Image" },
                  { id: "video" as const, icon: <Film  className="w-3 h-3" />, label: "Video" },
                ] as const).map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setMediaTab(tab.id)}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-[3px]"
                    style={{
                      ...SANS, fontSize: "11px", fontWeight: 600,
                      background: mediaTab === tab.id ? "rgba(255,255,255,0.18)" : "transparent",
                      color: mediaTab === tab.id ? "#FFFFFF" : "rgba(255,255,255,0.50)",
                      transition: `all 150ms ${SNAPPY}`,
                    }}
                  >
                    {tab.icon}{tab.label}
                  </button>
                ))}
              </div>

              {/* 16:9 media container — fills panel width, height derived from ratio */}
              {mediaTab === "image" ? (
                <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <ImageWithFallback src={incident.image} alt="Evidence" className="w-full h-full object-cover" />
                  {/* Bottom meta: timestamp + camera + LIVE FEED button */}
                  <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between z-10">
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-[3px]" style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}>
                        <Clock className="w-3 h-3 text-white/70" />
                        <span className="tabular-nums" style={{ ...MONO, fontSize: "11px", color: "#fff" }}>{incident.timestamp}</span>
                      </div>
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded-[3px]" style={{ background: "rgba(0,0,0,0.80)", backdropFilter: "blur(8px)" }}>
                        <Video className="w-3 h-3 text-white/70" />
                        <span className="tabular-nums" style={{ ...MONO, fontSize: "11px", color: "#fff", fontWeight: 700 }}>{incident.camera}</span>
                      </div>
                    </div>
                    <button
                      className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[3px] transition-all"
                      style={{ background: "rgba(0,0,0,0.72)", border: "1px solid rgba(255,255,255,0.22)", backdropFilter: "blur(8px)" }}
                      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.90)"; }}
                      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = "rgba(0,0,0,0.72)"; }}
                    >
                      <ExternalLink className="w-3 h-3 text-white/80" />
                      <span style={{ ...MONO, fontSize: "10px", fontWeight: 700, color: "#fff", letterSpacing: "0.08em" }}>LIVE FEED</span>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                  <VideoPlayer2 incident={incident} />
                </div>
              )}
            </div>

            {/* Right: state ledger — 460px fixed */}
            <div className="flex flex-col overflow-hidden" style={{ width:"460px", flexShrink:0, background: "#FAFBFD" }}>

              {/* Scrollable content — compact proximity grouping */}
              <div className="flex-1 overflow-y-auto px-5 py-4 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">

                {/* ── Compact info cluster (location · camera · objects) ─── */}
                <div className="space-y-3 mb-4">
                  {/* Location + Camera — same row */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <p style={{ ...SANS, fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Location</p>
                      <div className="flex items-center gap-2 bg-white rounded-[4px] border border-neutral-100 px-3 py-2">
                        <MapPin className="w-3 h-3 text-[#00775B] shrink-0" />
                        <span style={{ ...SANS, fontWeight: 600, color: "#111827", fontSize: "12px" }}>{incident.location}</span>
                      </div>
                    </div>
                    <div>
                      <p style={{ ...SANS, fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "6px" }}>Camera Source</p>
                      <div className="flex items-center gap-2 bg-white rounded-[4px] border border-neutral-100 px-3 py-2">
                        <Video className="w-3 h-3 text-[#00775B] shrink-0" />
                        <span className="tabular-nums" style={{ ...MONO, fontWeight: 700, color: "#111827" }}>{incident.camera}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detected objects — directly below, no section gap */}
                  {incident.detectedObjects && incident.detectedObjects.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {incident.detectedObjects.map(obj => (
                        <span key={obj} style={{ ...SANS, fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }} className="px-2 py-1 bg-[#00775B] text-white rounded-[3px]">{obj}</span>
                      ))}
                    </div>
                  )}

                  {/* Description quote — tight to objects */}
                  {incident.description && (
                    <div className="px-3 py-2 rounded-[3px] border-l-[3px]" style={{ background: "rgba(0,0,0,0.02)", borderLeftColor: sevBg }}>
                      <span style={{ ...SANS, fontSize: "12px", color: "#475569", fontStyle: "italic", lineHeight: 1.6 }}>
                        "{incident.description}"
                      </span>
                    </div>
                  )}
                </div>

                {/* ── Chronological audit timeline with sub-alerts ─────── */}
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <p style={{ ...SANS, fontSize: "10px", fontWeight: 700, color: "#94A3B8", letterSpacing: "0.08em", textTransform: "uppercase" }}>Audit Timeline</p>
                    <div className="flex-1 h-px" style={{ background: "linear-gradient(to right, #E2E8F0, transparent)" }} />
                    <span style={{ ...MONO, fontSize: "10px", color: "#CBD5E1" }}>newest → oldest</span>
                  </div>
                  {record.timeline.map((node, i) => (
                    <TNode2 key={node.id} node={node} isLast={i === record.timeline.length - 1} severityColor={sevBg} />
                  ))}
                </div>
              </div>

              {/* ── Action tray — full-width stacked buttons ──────────── */}
              <div className="px-5 py-4 border-t border-neutral-100 shrink-0 bg-white flex flex-col gap-2.5">
                {record.readOnly ? (
                  <div className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-neutral-400" />
                    <span style={{ ...SANS, color: "#94A3B8", fontSize: "12px" }}>
                      {record.stage === "escalated" ? "Escalated — awaiting manager action." : "Incident closed — audit record locked."}
                    </span>
                  </div>
                ) : (<>

                  {/* ── Detected: Self Assign + Assign To.. — side-by-side ── */}
                  {record.stage === "detected" && (
                    <div className="flex gap-3">
                      <button
                        onClick={() => setShowSelfAssign(true)}
                        className="flex-1 h-11 rounded-[4px] flex items-center justify-center gap-2 font-semibold transition-colors hover:bg-[#009e78]"
                        style={{ ...SANS, fontSize:"13px", background:"#00775B", color:"#fff" }}
                      >
                        <User className="w-4 h-4" /> Self Assign
                      </button>
                      <button
                        onClick={() => setShowAssignTo(true)}
                        className="flex-1 h-11 rounded-[4px] flex items-center justify-center gap-2 font-semibold border transition-colors hover:border-[#00775B] hover:text-[#00775B]"
                        style={{ ...SANS, fontSize:"13px", background:"#fff", color:"#374151", borderColor:"#D1D5DB" }}
                      >
                        <Users className="w-4 h-4" /> Assign To…
                      </button>
                    </div>
                  )}

                  {/* ── In Progress: Escalate + Resolve — side-by-side, equal width ── */}
                  {(record.stage === "in_progress" || record.stage === "cooldown") && (
                    <div className="flex gap-3">
                      {record.stage === "in_progress" && (
                        <button
                          onClick={() => setShowEscalate(true)}
                          className="flex-1 h-11 rounded-[4px] flex items-center justify-center gap-2 font-semibold transition-opacity hover:opacity-90"
                          style={{ ...SANS, fontSize:"13px", background: sevBg, color:"#fff" }}
                        >
                          {/* White fill + severity-colored stroke: white triangle, colored exclamation */}
                          <AlertTriangle style={{ width:"20px", height:"20px", fill:"#FFFFFF", color: sevBg }} />
                          Escalate
                        </button>
                      )}
                      <button
                        onClick={() => setShowResolve(true)}
                        className="flex-1 h-11 rounded-[4px] flex items-center justify-center gap-2 font-semibold transition-colors hover:bg-[#009e78]"
                        style={{ ...SANS, fontSize:"13px", background:"#00775B", color:"#fff" }}
                      >
                        <Check style={{ width:"20px", height:"20px", color:"#FFFFFF" }} strokeWidth={3} />
                        Resolve
                      </button>
                    </div>
                  )}

                </>)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showEscalate   && <EscalatePopup2 onSubmit={handleEscalate} onCancel={() => setShowEscalate(false)} />}
      {showSelfAssign && incident && <SelfAssignDialog    incident={incident} onConfirm={handleSelfAssign} onCancel={() => setShowSelfAssign(false)} />}
      {showAssignTo   && incident && <AssignToDialog      incident={incident} onConfirm={handleAssignTo}   onCancel={() => setShowAssignTo(false)} />}
      {showResolve    && incident && <ResolveDialog       incident={incident} onConfirm={handleResolve}    onCancel={() => setShowResolve(false)} />}
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Filter dropdown (replicated from App.tsx)
// ═══════════════════════════════════════════════════════════════════════════════
function FilterDropdown2({ label, options, selected, onChange, className }: {
  label:string; options:string[]; selected:Set<string>; onChange:(v:string)=>void; className?:string;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className={cn("relative min-w-[140px]", className)}>
      <Button variant="outline" size="sm" onClick={() => setOpen(!open)}
        className={cn("h-8 text-[11px] font-medium bg-white border-neutral-200 text-neutral-800 hover:text-black gap-2 justify-between shadow-sm w-full", selected.size > 0 && "border-[#00775B] text-[#00775B] bg-[#00775B]/5")}>
        <span className="truncate">{selected.size > 0 ? `${selected.size} ${label}` : `All ${label}`}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" strokeWidth={2.5} />
      </Button>
      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 w-full min-w-[180px] bg-white rounded-[4px] shadow-xl border border-neutral-200 py-1 animate-in fade-in zoom-in-95 duration-100">
            {options.map(opt => (
              <div key={opt} className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer text-xs" onClick={() => onChange(opt)}>
                <Checkbox checked={selected.has(opt)} className="h-3.5 w-3.5" />
                <span className="truncate uppercase">{opt}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard 2 page root — all state self-contained
// ═══════════════════════════════════════════════════════════════════════════════
const GRID_LIMIT = 8;

export function Dashboard2Page() {
  const [activePersona, setActivePersona] = useState<Persona>("monitoring");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIncidents, setSelectedIncidents] = useState<Set<number>>(new Set());
  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set());
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [selectedLocs, setSelectedLocs] = useState<Set<string>>(new Set());
  const [gridExpanded, setGridExpanded] = useState(false);
  const [tablePage, setTablePage] = useState(1);
  const [detailOpen,     setDetailOpen]     = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [records,         setRecords]         = useState<Map<number, LifecycleRecord>>(() => initRecords());
  // Card-level confirmation dialogs (self-assign / assign-to / escalate)
  type CardDialog = null | { type: "self-assign" | "assign-to" | "escalate" | "resolve"; incident: Incident };
  const [cardDialog, setCardDialog] = useState<CardDialog>(null);

  const ITEMS_PER_PAGE = 8;
  const filteredIncidents = ALL_INCIDENTS.filter(inc => {
    if (selectedSeverities.size > 0 && !selectedSeverities.has(inc.severity)) return false;
    if (selectedApps.size > 0 && !selectedApps.has(inc.application)) return false;
    if (selectedLocs.size > 0 && !selectedLocs.has(inc.location)) return false;
    return true;
  });
  const visibleGrid = gridExpanded ? filteredIncidents : filteredIncidents.slice(0, GRID_LIMIT);
  const hasMore = !gridExpanded && filteredIncidents.length > GRID_LIMIT;
  const totalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE);
  const paginated = filteredIncidents.slice((tablePage-1)*ITEMS_PER_PAGE, tablePage*ITEMS_PER_PAGE);

  const handleFilter = (set: Set<string>, val: string) => {
    const next = new Set(set);
    next.has(val) ? next.delete(val) : next.add(val);
    return next;
  };
  const clearFilters = () => { setSelectedSeverities(new Set()); setSelectedApps(new Set()); setSelectedLocs(new Set()); };

  const openDetail = (inc: Incident) => { setCurrentIncident(inc); setDetailOpen(true); };
  const updateRecord = useCallback((updated: LifecycleRecord) => {
    if (!currentIncident) return;
    setRecords(prev => { const n = new Map(prev); n.set(currentIncident.id, updated); return n; });
  }, [currentIncident]);

  const toggleSel = (id: number) => setSelectedIncidents(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelectedIncidents(prev => prev.size === paginated.length ? new Set() : new Set(paginated.map(i => i.id)));
  const isAllSel  = paginated.length > 0 && paginated.every(i => selectedIncidents.has(i.id));

  useEffect(() => {
    if (activePersona === "monitoring") setViewMode("grid");
  }, [activePersona]);

  if (activePersona === "director") return (
    <div className="bg-[#F8FAFC] min-h-full">
      <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />
      <DirectorDashboard />
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-full font-sans">
      <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />
      {activePersona === "monitoring" && <MonitoringWidgets />}
      {activePersona === "manager"    && <ManagerWidgets    />}

      <div className="px-0">
        {/* ── Toolbar ──────────────────────────────────────────────────── */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
              {activePersona === "manager" ? "Operational Incidents" : "Active Incidents"}
            </h2>
            <div className="h-5 px-[6px] rounded-[2px] bg-[#00775B] flex items-center justify-center text-[10px] font-bold text-white">{ALL_INCIDENTS.length}</div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {selectedIncidents.size > 0 && (
              <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200 mr-2">
                <span className="text-xs font-bold text-neutral-600 mr-2">{selectedIncidents.size} Selected</span>
                <Button size="sm" className="h-8 bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200 font-bold text-[10px] uppercase tracking-wider gap-2 shadow-sm">
                  <User className="w-3.5 h-3.5" /> Assign
                </Button>
                <Button size="sm" className="h-8 bg-[#00775B] text-white hover:bg-[#009e78] border-transparent font-bold text-[10px] uppercase tracking-wider gap-2">
                  <Check className="w-3.5 h-3.5" /> Acknowledge
                </Button>
                <div className="w-px h-6 bg-neutral-200 mx-1" />
              </div>
            )}

            <div className="flex items-center gap-2 mr-2">
              {(selectedApps.size > 0 || selectedLocs.size > 0 || selectedSeverities.size > 0) && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="h-8 px-2 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 uppercase tracking-wide flex items-center gap-1.5">
                  <Trash2 className="w-3 h-3" /> Clear
                </Button>
              )}
              <FilterDropdown2 label="Severity" options={SEVERITIES} selected={selectedSeverities} onChange={v => setSelectedSeverities(handleFilter(selectedSeverities,v))} className="w-[160px]" />
              <FilterDropdown2 label="Applications" options={APPLICATIONS} selected={selectedApps} onChange={v => setSelectedApps(handleFilter(selectedApps,v))} className="w-[160px]" />
              <FilterDropdown2 label="Locations" options={LOCATIONS} selected={selectedLocs} onChange={v => setSelectedLocs(handleFilter(selectedLocs,v))} className="w-[160px]" />
            </div>

            <div className="w-px h-6 bg-neutral-200 mx-1" />
            <div className="flex items-center bg-white border border-neutral-200 rounded-[2px] p-0.5 shadow-sm">
              <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")} className={cn("h-7 w-7 p-0 rounded-[1px] hover:bg-neutral-100", viewMode==="grid" ? "bg-neutral-100 text-[#00775B]" : "text-neutral-400")} title="Grid">
                <LayoutGrid className={cn("w-3.5 h-3.5", viewMode==="grid" && "fill-current")} />
              </Button>
              <div className="w-px h-4 bg-neutral-200 mx-0.5" />
              <Button variant="ghost" size="sm" onClick={() => setViewMode("table")} className={cn("h-7 w-7 p-0 rounded-[1px] hover:bg-neutral-100", viewMode==="table" ? "bg-neutral-100 text-[#00775B]" : "text-neutral-400")} title="Table">
                <List className={cn("w-3.5 h-3.5", viewMode==="table" && "fill-current")} />
              </Button>
            </div>
          </div>
        </div>

        {/* ── Grid view ────────────────────────────────────────────────── */}
        {viewMode === "grid" && (
          <div className="space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
              {visibleGrid.map((inc, i) => (
                <IncidentCard2
                  key={inc.id}
                  incident={inc}
                  record={records.get(inc.id)!}
                  className="w-full"
                  forceHover={i === 0}
                  onCardClick={() => openDetail(inc)}
                  onSelfAssign={() => setCardDialog({ type:"self-assign", incident:inc })}
                  onAssignTo={()   => setCardDialog({ type:"assign-to",   incident:inc })}
                  onEscalate={() => setCardDialog({ type:"escalate",     incident:inc })}
                  onResolve={() => setCardDialog({ type:"resolve", incident:inc })}
                />
              ))}
            </div>
            {hasMore && (
              <button onClick={() => setGridExpanded(true)} className="w-full flex items-center justify-center gap-2 py-3 mt-2 bg-white border border-neutral-200 shadow-sm rounded-sm hover:bg-neutral-50 hover:border-[#00775B]/30 transition-all group">
                <span className="text-xs font-bold text-neutral-600 group-hover:text-[#00775B] uppercase tracking-widest">Show More Incidents</span>
                <div className="h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-[#00775B] transition-colors">
                  <ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-white" />
                </div>
              </button>
            )}
          </div>
        )}

        {/* ── Table view ───────────────────────────────────────────────── */}
        {viewMode === "table" && (
          <div className="w-full bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
            <DataGrid<Incident>
              columns={[
                {
                  key:"select", header:"",
                  headerContent: <div onClick={e => e.stopPropagation()}><Checkbox checked={isAllSel} onCheckedChange={toggleAll} className="border-neutral-300 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B]" /></div>,
                  width:"44px", align:"center",
                  render:(row) => <div onClick={e => e.stopPropagation()}><Checkbox checked={selectedIncidents.has(row.id)} onCheckedChange={() => toggleSel(row.id)} /></div>,
                },
                {
                  key:"severity", header:"Severity", width:"60px", align:"center",
                  render:(row) => <div className={cn("h-6 w-6 inline-flex items-center justify-center rounded-[2px] shadow-sm", getSeverityBg(row.severity))}><SeverityIcon severity={row.severity} mode="inverse" className="w-[12.6px] h-[12.6px]" /></div>,
                },
                {
                  key:"stage", header:"Stage", width:"120px",
                  render:(row) => {
                    const rec = records.get(row.id);
                    if (!rec) return null;
                    return (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold" style={{ border:"1px solid rgba(0,0,0,0.12)", color:"#374151", background:"rgba(0,0,0,0.04)", fontFamily:"Inter,sans-serif" }}>
                        {STAGE_META[rec.stage].icon} {STAGE_META[rec.stage].label}
                      </span>
                    );
                  },
                },
                { key:"incidentId", header:"ID", width:"100px", render:(row,h) => <MonoCell hovered={h} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>{row.incidentId}</MonoCell> },
                { key:"snapshot", header:"Snapshot", width:"88px",
                  render:(row,h) => <div className={cn("h-12 w-[72px] rounded-[2px] overflow-hidden border transition-colors bg-neutral-100", h ? "border-[#00775B]/30" : "border-neutral-200")}><ImageWithFallback src={row.image} alt="Evidence" className="h-full w-full object-cover" /></div> },
                { key:"title", header:"Incident Details",
                  render:(row,h) => <span style={{ fontSize:11, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.04em", color: h ? "#0F172A" : "#374151", transition:"color 120ms ease" }}>{row.title}</span> },
                { key:"assignee", header:"Assigned", width:"110px",
                  render:(row,h) => { const rec = records.get(row.id); return <InterCell hovered={h} fontSize={11} color="#6B7280" hoveredColor="#0F172A">{rec?.assignee ?? "—"}</InterCell>; } },
                { key:"location", header:"Location", width:"140px", render:(row,h) => <InterCell hovered={h} fontSize={11} color="#475569" hoveredColor="#0F172A">{row.location}</InterCell> },
                { key:"timestamp", header:"Date & Time", width:"108px", align:"right", render:(row,h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.timestamp}</MonoCell> },
                {
                  key:"actions", header:"", width:"60px", align:"right",
                  render:(row,h) => <div className="flex justify-end pr-1"><GridActions visible={h}><GridActionButton title="Open" hoverColor="#00775B" onClick={e => { e.stopPropagation(); openDetail(row); }}><ChevronRight className="w-3.5 h-3.5" /></GridActionButton></GridActions></div>,
                },
              ]}
              data={paginated}
              onRowClick={openDetail}
            />
            {totalPages > 1 && (
              <div className="p-2 border-t border-neutral-100 flex justify-center bg-neutral-50">
                <div className="flex gap-1">
                  {Array.from({ length: totalPages }).map((_,i) => (
                    <button key={i} onClick={() => setTablePage(i+1)} className={cn("h-6 w-6 text-xs rounded-sm flex items-center justify-center transition-colors", tablePage===i+1 ? "bg-[#00775B] text-white font-bold" : "text-neutral-500 hover:bg-neutral-200")}>{i+1}</button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Enhanced detail modal */}
      <IncidentDetailModal2
        incident={currentIncident}
        record={currentIncident ? records.get(currentIncident.id) ?? null : null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={updateRecord}
        persona={activePersona}
      />

      {/* Card-level confirmation dialogs */}
      {cardDialog?.type === "self-assign" && (
        <SelfAssignDialog
          incident={cardDialog.incident}
          onConfirm={() => {
            const inc = cardDialog.incident;
            const rec = records.get(inc.id)!;
            const ts  = new Date().toLocaleTimeString("en-GB", { hour12:false });
            setRecords(prev => { const n = new Map(prev); n.set(inc.id, { ...rec, stage:"in_progress", assignee:"Staff_04", timeline:[{ id:`sa_${Date.now()}`, type:"human", icon:"👤", title:"Self-Assigned by Staff_04", actor:"Staff_04", timestamp:ts }, ...rec.timeline] }); return n; });
            setCardDialog(null);
          }}
          onCancel={() => setCardDialog(null)}
        />
      )}
      {cardDialog?.type === "assign-to" && (
        <AssignToDialog
          incident={cardDialog.incident}
          onConfirm={(name) => {
            const inc = cardDialog.incident;
            const rec = records.get(inc.id)!;
            const ts  = new Date().toLocaleTimeString("en-GB", { hour12:false });
            setRecords(prev => { const n = new Map(prev); n.set(inc.id, { ...rec, stage:"in_progress", assignee:name, timeline:[{ id:`at_${Date.now()}`, type:"human", icon:"👤", title:`Assigned to ${name} by Admin`, actor:"Admin", timestamp:ts }, ...rec.timeline] }); return n; });
            setCardDialog(null);
          }}
          onCancel={() => setCardDialog(null)}
        />
      )}
      {cardDialog?.type === "escalate" && (
        <EscalateConfirmDialog
          incident={cardDialog.incident}
          onConfirm={(manager, note) => {
            const inc = cardDialog.incident;
            const rec = records.get(inc.id)!;
            const ts  = new Date().toLocaleTimeString("en-GB", { hour12:false });
            setRecords(prev => { const n = new Map(prev); n.set(inc.id, { ...rec, stage:"escalated", assignee:manager, readOnly:true, timeline:[{ id:`esc_${Date.now()}`, type:"human", icon:"🟠", title:`Escalated to ${manager}`, actor:"Operator", timestamp:ts, note:note||undefined }, ...rec.timeline] }); return n; });
            setCardDialog(null);
          }}
          onCancel={() => setCardDialog(null)}
        />
      )}
      {cardDialog?.type === "resolve" && (
        <ResolveDialog
          incident={cardDialog.incident}
          onConfirm={() => {
            const inc = cardDialog.incident;
            const rec = records.get(inc.id)!;
            const ts  = new Date().toLocaleTimeString("en-GB", { hour12:false });
            setRecords(prev => { const n = new Map(prev); n.set(inc.id, { ...rec, stage:"resolved", readOnly:true, timeline:[{ id:`res_${Date.now()}`, type:"human", icon:"✅", title:"Resolved by Staff_04", actor:"Staff_04", timestamp:ts }, ...rec.timeline] }); return n; });
            setCardDialog(null);
          }}
          onCancel={() => setCardDialog(null)}
        />
      )}
    </div>
  );
}
