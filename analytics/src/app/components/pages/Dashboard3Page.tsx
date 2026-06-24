/**
 * Dashboard 3 — Dual-Lane Workspace (Refactored)
 *
 * LEFT  LANE (40%) — MY ASSIGNED QUEUE
 *   • 1-column full-width card stack  OR  compact table
 *   • Own [Grid][Table] toggle
 *
 * RIGHT LANE (60%) — LIVE UNASSIGNED RADAR
 *   • Multi-column grid  OR  compact table
 *   • Own [Grid][Table] toggle  +  filters right-justified in header
 *
 * FLOATING BATCH BAR — appears when any rows are selected
 *   • [👤 Mass Assign]  [🚨 Mass Escalate]
 */

import { useState, useCallback } from "react";
import {
  LayoutGrid, List, User, Users, AlertTriangle, CheckCircle2, Check, ChevronRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Checkbox } from "@fe-common/components/ui/Checkbox";
import { SeverityIcon } from "@fe-common/components/ui/SeverityIcon";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PersonaSwitcher, Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { DirectorDashboard } from "@/app/components/dashboard/DirectorDashboard";
import { ALL_INCIDENTS, Incident, SEVERITIES, APPLICATIONS, LOCATIONS } from "@/app/data/mockData";
import {
  IncidentCard2,
  SelfAssignDialog,
  AssignToDialog,
  EscalateConfirmDialog,
  ResolveDialog,
  FilterDropdown2,
  LifecycleRecord,
  LifecycleStage,
  initRecords,
  getSeverityHex,
  D2_MONO,
  D2_SANS,
  D2_SNAPPY,
  IncidentDetailModal2,
  STAGE_META,
} from "@/app/components/pages/Dashboard2Page";

const MONO   = D2_MONO;
const SANS   = D2_SANS;
const SNAPPY = D2_SNAPPY;

const MY_OPERATOR = "Staff_04";
const MY_MAX_LOAD = 5;
const SEV_ORDER: Record<string, number> = { critical:0, high:1, medium:2, low:3, info:4, resolved:5 };

// ─── Shared filter handler ────────────────────────────────────────────────────
function hf(set: Set<string>, val: string) { const n = new Set(set); n.has(val) ? n.delete(val) : n.add(val); return n; }

// ─── View-mode toggle ─────────────────────────────────────────────────────────
function ViewToggle({ view, onChange }: { view: "grid" | "table"; onChange: (v: "grid" | "table") => void }) {
  return (
    <div className="flex items-center bg-white border border-neutral-200 rounded-[3px] p-0.5 shadow-sm shrink-0">
      {(["grid", "table"] as const).map(v => (
        <button
          key={v}
          title={v === "grid" ? "Grid view" : "Table view"}
          onClick={() => onChange(v)}
          className={cn("h-6 w-6 p-0 rounded-[2px] flex items-center justify-center transition-all", view === v ? "bg-neutral-100 text-[#00775B]" : "text-neutral-400 hover:text-neutral-600")}
          style={{ transitionDuration: "200ms", transitionTimingFunction: SNAPPY }}
        >
          {v === "grid" ? <LayoutGrid className="w-3.5 h-3.5" /> : <List className="w-3.5 h-3.5" />}
        </button>
      ))}
    </div>
  );
}

// ─── Lane section header ──────────────────────────────────────────────────────
function LaneHeader({
  title, count, accent, sublabel,
  view, onViewChange,
  right,
}: {
  title: string; count: number; accent: string; sublabel?: string;
  view: "grid" | "table"; onViewChange: (v: "grid" | "table") => void;
  right?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-3 border-b border-neutral-200 flex-wrap">
      <div className="w-1 h-4 rounded-full shrink-0" style={{ background: accent }} />
      <h3 className="font-bold uppercase tracking-widest" style={{ ...SANS, fontSize:"11px", color:"#374151", letterSpacing:"0.1em" }}>
        {title}
      </h3>
      <span className="px-1.5 py-0.5 rounded-full font-bold tabular-nums text-white" style={{ ...MONO, fontSize:"11px", background: accent }}>
        {count}
      </span>
      {sublabel && (
        <span className="text-[10px] text-neutral-400 hidden xl:inline" style={MONO}>{sublabel}</span>
      )}
      <div className="flex-1" />
      {right}
      <ViewToggle view={view} onChange={onViewChange} />
    </div>
  );
}

// ─── Compact table row ────────────────────────────────────────────────────────
function IncidentTableRow({
  incident, record, selected, onToggle, onOpen,
}: {
  incident: Incident; record: LifecycleRecord;
  selected: boolean; onToggle: () => void; onOpen: () => void;
}) {
  const [hov, setHov] = useState(false);
  const sevHex = getSeverityHex(incident.severity);

  return (
    <tr
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className={cn("border-b border-neutral-100 cursor-pointer transition-colors", hov ? "bg-[#00775B]/5" : selected ? "bg-neutral-50" : "bg-white")}
      style={{ transitionDuration:"200ms", transitionTimingFunction: SNAPPY }}
    >
      {/* Checkbox */}
      <td className="pl-3 pr-2 py-2.5 w-8" onClick={e => { e.stopPropagation(); onToggle(); }}>
        <Checkbox checked={selected} onCheckedChange={onToggle} className="border-neutral-300 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B]" />
      </td>

      {/* Severity */}
      <td className="px-2 py-2.5 w-8" onClick={onOpen}>
        <div className="w-6 h-6 rounded-[3px] flex items-center justify-center" style={{ background: sevHex }}>
          <SeverityIcon severity={incident.severity} mode="inverse" className="w-3.5 h-3.5" />
        </div>
      </td>

      {/* Stage */}
      <td className="px-2 py-2.5 w-[110px]" onClick={onOpen}>
        <span
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full"
          style={{ ...SANS, fontSize:"10px", fontWeight:600, letterSpacing:"0.04em", color:"#374151", background:"rgba(0,0,0,0.04)", border:"1px solid rgba(0,0,0,0.10)", whiteSpace:"nowrap" as const }}
        >
          {STAGE_META[record.stage].icon}
          {STAGE_META[record.stage].label}
        </span>
      </td>

      {/* ID */}
      <td className="px-2 py-2.5 w-[88px]" onClick={onOpen}>
        <span className="tabular-nums" style={{ ...MONO, fontSize:"11px", color:"#64748B" }}>{incident.incidentId}</span>
      </td>

      {/* Snapshot */}
      <td className="px-2 py-2.5 w-16" onClick={onOpen}>
        <div className="h-9 w-14 rounded-[2px] overflow-hidden border border-neutral-200 bg-neutral-100">
          <ImageWithFallback src={incident.image} alt="" className="h-full w-full object-cover" />
        </div>
      </td>

      {/* Details */}
      <td className="px-2 py-2.5 min-w-0" onClick={onOpen}>
        <span style={{ ...SANS, fontSize:"11px", fontWeight:700, color: hov ? "#0F172A" : "#374151", textTransform:"uppercase", letterSpacing:"0.04em", transition:"color 200ms" }}>
          {incident.title}
        </span>
      </td>

      {/* Camera */}
      <td className="px-2 py-2.5 w-[100px] hidden md:table-cell" onClick={onOpen}>
        <span className="tabular-nums" style={{ ...MONO, fontSize:"11px", color:"#64748B" }}>{incident.camera}</span>
      </td>

      {/* Assignee */}
      <td className="px-2 py-2.5 w-[96px] hidden lg:table-cell" onClick={onOpen}>
        <span style={{ ...SANS, fontSize:"11px", color: record.assignee === "Unassigned" ? "#9CA3AF" : "#374151" }}>{record.assignee}</span>
      </td>

      {/* Timestamp */}
      <td className="pl-2 pr-3 py-2.5 w-[80px] text-right" onClick={onOpen}>
        <span className="tabular-nums" style={{ ...MONO, fontSize:"11px", color:"#94A3B8" }}>{incident.timestamp}</span>
      </td>
    </tr>
  );
}

// ─── Compact table shell ──────────────────────────────────────────────────────
function IncidentTable({
  incidents, records, selected, onToggle, onToggleAll, onOpen,
}: {
  incidents: Incident[];
  records: Map<number, LifecycleRecord>;
  selected: Set<number>;
  onToggle: (id: number) => void;
  onToggleAll: () => void;
  onOpen: (inc: Incident) => void;
}) {
  const allSel = incidents.length > 0 && incidents.every(i => selected.has(i.id));
  return (
    <div className="w-full bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80">
            <th className="pl-3 pr-2 py-2 w-8">
              <Checkbox checked={allSel} onCheckedChange={onToggleAll} className="border-neutral-300 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B]" />
            </th>
            {["Sev", "Stage", "ID", "", "Details", "Camera", "Assigned", "Time"].map((h, i) => (
              <th key={i} className="px-2 py-2" style={{ ...SANS, fontSize:"10px", fontWeight:700, color:"#94A3B8", textTransform:"uppercase", letterSpacing:"0.07em", whiteSpace:"nowrap" as const }}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {incidents.map(inc => (
            <IncidentTableRow
              key={inc.id}
              incident={inc}
              record={records.get(inc.id)!}
              selected={selected.has(inc.id)}
              onToggle={() => onToggle(inc.id)}
              onOpen={() => onOpen(inc)}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── Floating batch action bar ────────────────────────────────────────────────
function FloatingBatchBar({
  count, onMassAssign, onMassEscalate,
}: {
  count: number; onMassAssign: () => void; onMassEscalate: () => void;
}) {
  return (
    <div
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-3 rounded-[8px] shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-200"
      style={{ background: "#0F172A", border: "1px solid rgba(255,255,255,0.12)", backdropFilter: "blur(12px)", boxShadow: "0 16px 48px rgba(0,0,0,0.50)" }}
    >
      <span style={{ ...MONO, fontSize:"12px", color:"rgba(255,255,255,0.60)" }} className="tabular-nums">
        {count} selected
      </span>
      <div className="w-px h-4" style={{ background:"rgba(255,255,255,0.15)" }} />
      <button
        onClick={onMassAssign}
        className="flex items-center gap-1.5 h-8 px-3 rounded-[4px] text-white font-semibold transition-all hover:bg-[#009e78]"
        style={{ ...SANS, fontSize:"12px", background:"#00775B", transitionDuration:"200ms", transitionTimingFunction:SNAPPY }}
      >
        <Users className="w-3.5 h-3.5" /> Mass Assign
      </button>
      <button
        onClick={onMassEscalate}
        className="flex items-center gap-1.5 h-8 px-3 rounded-[4px] text-white font-semibold transition-all hover:opacity-90"
        style={{ ...SANS, fontSize:"12px", background:"#EA580C", transitionDuration:"200ms", transitionTimingFunction:SNAPPY }}
      >
        <AlertTriangle style={{ width:"14px", height:"14px", fill:"#FFFFFF", color:"#EA580C" }} />
        Mass Escalate
      </button>
    </div>
  );
}

// ─── Mass dialogs (simplified wrappers) ──────────────────────────────────────
function MassAssignDialog({ count, onConfirm, onCancel }: { count: number; onConfirm: (name: string) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const filtered = (D2_SANS as never, STAFF_LIST.filter((s: string) => s.toLowerCase().includes(query.toLowerCase())));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background:"rgba(0,0,0,0.50)" }} onClick={onCancel}>
      <div className="w-[420px] bg-white rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h3 style={{ ...SANS, fontWeight:700, color:"#0F172A", fontSize:"14px" }}>Mass Assign — {count} incidents</h3>
            <p style={{ ...SANS, fontSize:"11px", color:"#64748B", marginTop:"2px" }}>All selected incidents will be assigned to the chosen staff member.</p>
          </div>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p style={{ ...SANS, fontSize:"11px", fontWeight:700, color:"#475569", letterSpacing:"0.07em", textTransform:"uppercase" }}>Select Staff Member</p>
          <div className="relative border border-neutral-200 rounded-[4px] px-3 py-2 flex items-center gap-2 focus-within:border-[#00775B] transition-colors" onClick={() => setOpen(true)}>
            <input autoFocus value={selected || query} onChange={e => { setQuery(e.target.value); setSelected(""); setOpen(true); }}
              placeholder="Search staff…" className="flex-1 outline-none bg-transparent" style={{ ...SANS, fontSize:"12px" }} />
          </div>
          {open && filtered.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="border border-neutral-200 rounded-[4px] shadow-lg bg-white max-h-40 overflow-y-auto z-20 relative">
                {filtered.map((opt: string) => (
                  <button key={opt} className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors" style={{ ...SANS, fontSize:"12px" }}
                    onClick={() => { setSelected(opt); setQuery(""); setOpen(false); }}>{opt}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="h-9 px-4 rounded-[4px] border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors" style={{ ...SANS, fontSize:"12px" }}>Cancel</button>
          <button onClick={() => selected && onConfirm(selected)}
            className="h-9 px-5 rounded-[4px] flex items-center gap-1.5 text-white font-semibold transition-colors"
            style={{ ...SANS, fontSize:"12px", background: selected ? "#00775B" : "#94A3B8", cursor: selected ? "pointer" : "default" }}>
            <Users className="w-3.5 h-3.5" /> Assign
          </button>
        </div>
      </div>
    </div>
  );
}

function MassEscalateDialog({ count, onConfirm, onCancel }: { count: number; onConfirm: (manager: string) => void; onCancel: () => void }) {
  const [selected, setSelected] = useState("");
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const MANAGERS = ["Manager_01 · Alex T.", "Manager_02 · Sarah K.", "Director_01 · James R."];
  const filtered = MANAGERS.filter(s => s.toLowerCase().includes(query.toLowerCase()));

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center" style={{ background:"rgba(0,0,0,0.50)" }} onClick={onCancel}>
      <div className="w-[420px] bg-white rounded-[8px] shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150" onClick={e => e.stopPropagation()}>
        <div className="px-5 py-4 border-b border-neutral-100">
          <h3 style={{ ...SANS, fontWeight:700, color:"#0F172A", fontSize:"14px" }}>Mass Escalate — {count} incidents</h3>
          <p style={{ ...SANS, fontSize:"11px", color:"#64748B", marginTop:"2px" }}>All selected incidents will be escalated to the chosen manager.</p>
        </div>
        <div className="px-5 py-4 space-y-3">
          <p style={{ ...SANS, fontSize:"11px", fontWeight:700, color:"#475569", letterSpacing:"0.07em", textTransform:"uppercase" }}>Select Manager</p>
          <div className="border border-neutral-200 rounded-[4px] px-3 py-2 flex items-center gap-2 focus-within:border-[#EA580C] transition-colors" onClick={() => setOpen(true)}>
            <input autoFocus value={selected || query} onChange={e => { setQuery(e.target.value); setSelected(""); setOpen(true); }}
              placeholder="Search managers…" className="flex-1 outline-none bg-transparent" style={{ ...SANS, fontSize:"12px" }} />
          </div>
          {open && filtered.length > 0 && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="border border-neutral-200 rounded-[4px] shadow-lg bg-white max-h-40 overflow-y-auto z-20 relative">
                {filtered.map(opt => (
                  <button key={opt} className="w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors" style={{ ...SANS, fontSize:"12px" }}
                    onClick={() => { setSelected(opt); setQuery(""); setOpen(false); }}>{opt}</button>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="px-5 py-3 bg-neutral-50 border-t border-neutral-100 flex items-center justify-end gap-2">
          <button onClick={onCancel} className="h-9 px-4 rounded-[4px] border border-neutral-200 text-neutral-600 hover:bg-neutral-100 transition-colors" style={{ ...SANS, fontSize:"12px" }}>Cancel</button>
          <button onClick={() => selected && onConfirm(selected)}
            className="h-9 px-5 rounded-[4px] flex items-center gap-1.5 text-white font-semibold transition-colors"
            style={{ ...SANS, fontSize:"12px", background: selected ? "#EA580C" : "#94A3B8", cursor: selected ? "pointer" : "default" }}>
            <AlertTriangle style={{ width:"14px", height:"14px", fill:"#FFFFFF", color: selected ? "#EA580C" : "#94A3B8" }} /> Escalate
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Empty lane ───────────────────────────────────────────────────────────────
function EmptyLane({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center mb-3">
        <Check className="w-5 h-5 text-neutral-400" />
      </div>
      <p style={{ ...SANS, fontSize:"13px", color:"#94A3B8" }}>{message}</p>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard 3 Page
// ═══════════════════════════════════════════════════════════════════════════════
export function Dashboard3Page() {
  const [activePersona, setActivePersona] = useState<Persona>("monitoring");

  // Filters (applied to both lanes)
  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set());
  const [selectedApps,        setSelectedApps]       = useState<Set<string>>(new Set());
  const [selectedLocs,        setSelectedLocs]       = useState<Set<string>>(new Set());

  // Per-lane view mode
  const [queueView,  setQueueView]  = useState<"grid" | "table">("grid");
  const [radarView,  setRadarView]  = useState<"grid" | "table">("grid");

  // Per-lane selection (for batch actions)
  const [queueSel,  setQueueSel]  = useState<Set<number>>(new Set());
  const [radarSel,  setRadarSel]  = useState<Set<number>>(new Set());

  // Lifecycle records
  const [records, setRecords] = useState<Map<number, LifecycleRecord>>(() => initRecords());

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentInc, setCurrentInc] = useState<Incident | null>(null);

  // Card dialogs
  type CD = null | { type: "self-assign" | "assign-to" | "escalate" | "resolve"; incident: Incident };
  const [cardDialog, setCardDialog] = useState<CD>(null);

  // Mass action dialogs
  const [showMassAssign,    setShowMassAssign]    = useState(false);
  const [showMassEscalate,  setShowMassEscalate]  = useState(false);

  // ── Filtering ────────────────────────────────────────────────────────────
  const filtered = ALL_INCIDENTS.filter(inc => {
    if (selectedSeverities.size > 0 && !selectedSeverities.has(inc.severity)) return false;
    if (selectedApps.size > 0        && !selectedApps.has(inc.application))   return false;
    if (selectedLocs.size > 0        && !selectedLocs.has(inc.location))       return false;
    return true;
  });

  const myQueue    = [...filtered.filter(i => records.get(i.id)?.assignee === MY_OPERATOR)]
    .sort((a, b) => (SEV_ORDER[a.severity] ?? 5) - (SEV_ORDER[b.severity] ?? 5));
  const unassigned = filtered.filter(i => records.get(i.id)?.assignee === "Unassigned");

  // ── Selection helpers ────────────────────────────────────────────────────
  const toggleQ  = (id: number) => setQueueSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleR  = (id: number) => setRadarSel(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAllQ = () => setQueueSel(p => p.size === myQueue.length    ? new Set() : new Set(myQueue.map(i => i.id)));
  const toggleAllR = () => setRadarSel(p => p.size === unassigned.length ? new Set() : new Set(unassigned.map(i => i.id)));

  const totalSelected = queueSel.size + radarSel.size;
  const allSelectedIds = [...queueSel, ...radarSel];

  // ── Record mutation helpers ──────────────────────────────────────────────
  const applyToIds = (ids: number[], updater: (rec: LifecycleRecord) => LifecycleRecord) => {
    setRecords(prev => {
      const n = new Map(prev);
      ids.forEach(id => { const r = n.get(id); if (r) n.set(id, updater(r)); });
      return n;
    });
  };

  const ts = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

  const openDetail = (inc: Incident) => { setCurrentInc(inc); setDetailOpen(true); };
  const updateRecord = useCallback((updated: LifecycleRecord) => {
    if (!currentInc) return;
    setRecords(p => { const n = new Map(p); n.set(currentInc.id, updated); return n; });
  }, [currentInc]);

  const handleCard = (type: CD["type"], inc: Incident, payload?: string) => {
    const rec = records.get(inc.id); if (!rec) return;
    const t = ts();
    if (type === "self-assign") {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage:"in_progress" as LifecycleStage, assignee:MY_OPERATOR, timeline:[{ id:`sa_${Date.now()}`, type:"human" as const, icon:"👤", title:`Self-Assigned by ${MY_OPERATOR}`, actor:MY_OPERATOR, timestamp:t }, ...rec.timeline] }); return n; });
    } else if (type === "assign-to" && payload) {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage:"in_progress" as LifecycleStage, assignee:payload, timeline:[{ id:`at_${Date.now()}`, type:"human" as const, icon:"👤", title:`Assigned to ${payload}`, actor:"Admin", timestamp:t }, ...rec.timeline] }); return n; });
    } else if (type === "escalate" && payload) {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage:"escalated" as LifecycleStage, assignee:payload, readOnly:true, timeline:[{ id:`esc_${Date.now()}`, type:"human" as const, icon:"🟠", title:`Escalated to ${payload}`, actor:"Operator", timestamp:t }, ...rec.timeline] }); return n; });
    } else if (type === "resolve") {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage:"resolved" as LifecycleStage, readOnly:true, timeline:[{ id:`res_${Date.now()}`, type:"human" as const, icon:"✅", title:`Resolved by ${MY_OPERATOR}`, actor:MY_OPERATOR, timestamp:t }, ...rec.timeline] }); return n; });
    }
    setCardDialog(null);
  };

  if (activePersona === "director") return (
    <div className="bg-[#F8FAFC] min-h-full">
      <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />
      <DirectorDashboard />
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] min-h-full flex flex-col font-sans">
      <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />

      {/* ── Dual-Lane Split ─────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 mt-1" style={{ gap: "24px" }}>

        {/* ── LEFT: My Assigned Queue (40%) ─────────────────────────────── */}
        <div className="flex flex-col min-h-0 overflow-hidden" style={{ width:"40%", flexShrink:0 }}>
          <LaneHeader
            title="My Assigned Queue"
            count={myQueue.length}
            accent="#00775B"
            sublabel={`${myQueue.length}/${MY_MAX_LOAD} capacity`}
            view={queueView}
            onViewChange={v => { setQueueView(v); setQueueSel(new Set()); }}
          />

          {myQueue.length === 0 ? (
            <EmptyLane message="No incidents currently assigned to you." />
          ) : queueView === "grid" ? (
            /* 2-column grid — eliminates dead whitespace in the 40% lane */
            <div className="flex-1 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">
              <div className="grid grid-cols-2 gap-3">
                {myQueue.map(inc => (
                  <IncidentCard2
                    key={inc.id}
                    incident={inc}
                    record={records.get(inc.id)!}
                    className="w-full"
                    onCardClick={() => openDetail(inc)}
                    onSelfAssign={() => setCardDialog({ type:"self-assign", incident:inc })}
                    onAssignTo={() => setCardDialog({ type:"assign-to", incident:inc })}
                    onEscalate={() => setCardDialog({ type:"escalate", incident:inc })}
                    onResolve={() => setCardDialog({ type:"resolve", incident:inc })}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">
              <IncidentTable
                incidents={myQueue}
                records={records}
                selected={queueSel}
                onToggle={toggleQ}
                onToggleAll={toggleAllQ}
                onOpen={openDetail}
              />
            </div>
          )}
        </div>

        {/* ── Structural divider ────────────────────────────────────────── */}
        <div className="w-px shrink-0 self-stretch" style={{ background:"#E2E8F0" }} />

        {/* ── RIGHT: Live Unassigned Radar (60%) ────────────────────────── */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0 overflow-hidden">
          <LaneHeader
            title="Live Unassigned Radar"
            count={unassigned.length}
            accent="#EA580C"
            view={radarView}
            onViewChange={v => { setRadarView(v); setRadarSel(new Set()); }}
            right={
              /* Filters right-justified in the radar lane header */
              <div className="flex items-center gap-2 flex-wrap">
                <FilterDropdown2 label="Severity"     options={SEVERITIES}   selected={selectedSeverities} onChange={v => setSelectedSeverities(hf(selectedSeverities,v))} className="w-[130px]" />
                <FilterDropdown2 label="Applications" options={APPLICATIONS} selected={selectedApps}       onChange={v => setSelectedApps(hf(selectedApps,v))}             className="w-[140px]" />
                <FilterDropdown2 label="Locations"    options={LOCATIONS}    selected={selectedLocs}       onChange={v => setSelectedLocs(hf(selectedLocs,v))}             className="w-[130px]" />
              </div>
            }
          />

          {unassigned.length === 0 ? (
            <EmptyLane message="No unassigned incidents. All clear." />
          ) : radarView === "grid" ? (
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">
              <div className="grid gap-3" style={{ gridTemplateColumns:"repeat(auto-fill, minmax(260px, 1fr))" }}>
                {unassigned.map(inc => (
                  <IncidentCard2
                    key={inc.id}
                    incident={inc}
                    record={records.get(inc.id)!}
                    onCardClick={() => openDetail(inc)}
                    onSelfAssign={() => setCardDialog({ type:"self-assign", incident:inc })}
                    onAssignTo={() => setCardDialog({ type:"assign-to", incident:inc })}
                    onEscalate={() => setCardDialog({ type:"escalate", incident:inc })}
                    onResolve={() => setCardDialog({ type:"resolve", incident:inc })}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">
              <IncidentTable
                incidents={unassigned}
                records={records}
                selected={radarSel}
                onToggle={toggleR}
                onToggleAll={toggleAllR}
                onOpen={openDetail}
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Detail modal ────────────────────────────────────────────────────── */}
      <IncidentDetailModal2
        incident={currentInc}
        record={currentInc ? records.get(currentInc.id) ?? null : null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={updateRecord}
        persona={activePersona}
      />

      {/* ── Card dialogs ────────────────────────────────────────────────────── */}
      {cardDialog?.type === "self-assign" && <SelfAssignDialog incident={cardDialog.incident} onConfirm={() => handleCard("self-assign", cardDialog.incident)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "assign-to"   && <AssignToDialog   incident={cardDialog.incident} onConfirm={n => handleCard("assign-to", cardDialog.incident, n)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "escalate"    && <EscalateConfirmDialog incident={cardDialog.incident} onConfirm={(m,_n) => handleCard("escalate", cardDialog.incident, m)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "resolve"     && <ResolveDialog    incident={cardDialog.incident} onConfirm={() => handleCard("resolve", cardDialog.incident)} onCancel={() => setCardDialog(null)} />}

      {/* ── Floating batch bar ──────────────────────────────────────────────── */}
      {totalSelected > 0 && (
        <FloatingBatchBar
          count={totalSelected}
          onMassAssign={() => setShowMassAssign(true)}
          onMassEscalate={() => setShowMassEscalate(true)}
        />
      )}

      {/* ── Mass action dialogs ─────────────────────────────────────────────── */}
      {showMassAssign && (
        <MassAssignDialog
          count={totalSelected}
          onConfirm={name => {
            const t = ts();
            applyToIds(allSelectedIds, rec => ({
              ...rec,
              stage: "in_progress" as LifecycleStage,
              assignee: name,
              timeline: [{ id:`ma_${Date.now()}_${rec.assignee}`, type:"human" as const, icon:"👤", title:`Mass Assigned to ${name}`, actor:"Admin", timestamp:t }, ...rec.timeline],
            }));
            setQueueSel(new Set()); setRadarSel(new Set());
            setShowMassAssign(false);
          }}
          onCancel={() => setShowMassAssign(false)}
        />
      )}
      {showMassEscalate && (
        <MassEscalateDialog
          count={totalSelected}
          onConfirm={manager => {
            const t = ts();
            applyToIds(allSelectedIds, rec => ({
              ...rec,
              stage: "escalated" as LifecycleStage,
              assignee: manager,
              readOnly: true,
              timeline: [{ id:`me_${Date.now()}`, type:"human" as const, icon:"🟠", title:`Mass Escalated to ${manager}`, actor:"Admin", timestamp:t }, ...rec.timeline],
            }));
            setQueueSel(new Set()); setRadarSel(new Set());
            setShowMassEscalate(false);
          }}
          onCancel={() => setShowMassEscalate(false)}
        />
      )}
    </div>
  );
}
