/**
 * Dashboard 4 — Manager Kanban Board
 *
 * Three status columns:
 *   1. UN-ASSIGNED  — 2 cards per row, draggable out
 *   2. ASSIGNED     — 2 cards per row, draggable out
 *   3. IN-PROGRESS  — 1 card per row, zero-state when empty
 *
 * Drag from UN-ASSIGNED → ASSIGNED  triggers AssignToDialog
 * Drag from ASSIGNED    → IN-PROGRESS just moves the card (stage → in_progress)
 * Drag between any other pair moves freely.
 *
 * Severity colour system (v1.1):
 *   critical / high  →  Red    #E7000B
 *   medium           →  Amber  #D97706
 *   low / info       →  Grey   #64748B
 */

import { useState, useRef, useCallback } from "react";
import {
  Users, AlertTriangle, CheckCircle2,
  Inbox, Loader2,
} from "lucide-react";
import { PersonaSwitcher, Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { ALL_INCIDENTS, Incident } from "@/app/data/mockData";
import {
  IncidentCard2,
  LifecycleRecord, LifecycleStage,
  initRecords,
  D2_MONO, D2_SANS, D2_SNAPPY,
  STAFF_LIST,
  IncidentDetailModal2,
  SelfAssignDialog,
  AssignToDialog,
  EscalateConfirmDialog,
  ResolveDialog,
} from "@/app/components/pages/Dashboard2Page";

const MONO   = D2_MONO;
const SANS   = D2_SANS;
const SNAPPY = D2_SNAPPY;

type KanbanColumn = "unassigned" | "assigned" | "inprogress";

// ─── 3-tier severity remapping (Manager Dashboard only) ──────────────────────
// Displays: critical (red), medium (yellow), info/low (grey) — no orange
const remapSev = (s: string): string => {
  if (s === "high") return "critical"; // collapse high → critical (red)
  if (s === "low")  return "info";     // remap blue-low → grey-info
  return s;
};

// ─── Draggable wrapper around IncidentCard2 ───────────────────────────────────
function DraggableCard({
  incident, record, from,
  onDragStart, onCardClick, onSelfAssign, onAssignTo, onEscalate, onResolve,
}: {
  incident: Incident;
  record: LifecycleRecord;
  from: KanbanColumn;
  onDragStart: (e: React.DragEvent, id: number, from: KanbanColumn) => void;
  onCardClick: () => void;
  onSelfAssign: () => void;
  onAssignTo: () => void;
  onEscalate: () => void;
  onResolve: () => void;
}) {
  const displayIncident = { ...incident, severity: remapSev(incident.severity) };
  return (
    <div
      draggable
      onDragStart={e => onDragStart(e, incident.id, from)}
      style={{ cursor: "grab" }}
    >
      <IncidentCard2
        incident={displayIncident}
        record={record}
        className="w-full"
        onCardClick={onCardClick}
        onSelfAssign={onSelfAssign}
        onAssignTo={onAssignTo}
        onEscalate={onEscalate}
        onResolve={onResolve}
      />
    </div>
  );
}

// ─── Drop column ─────────────────────────────────────────────────────────────
function KanbanCol({
  id, label, count, accentColor, icon,
  incidents, records, twoCol,
  dragOverCol, onDragOver, onDragLeave, onDrop,
  onCardDragStart, onCardClick, onCardAction,
}: {
  id: KanbanColumn;
  label: string;
  count: number;
  accentColor: string;
  icon: React.ReactNode;
  incidents: Incident[];
  records: Map<number, LifecycleRecord>;
  twoCol: boolean;
  dragOverCol: KanbanColumn | null;
  onDragOver: (e: React.DragEvent, col: KanbanColumn) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent, col: KanbanColumn) => void;
  onCardDragStart: (e: React.DragEvent, id: number, from: KanbanColumn) => void;
  onCardClick: (inc: Incident) => void;
  onCardAction: (type: "self-assign" | "assign-to" | "escalate" | "resolve", inc: Incident) => void;
}) {
  const isOver = dragOverCol === id;

  return (
    <div className="flex flex-col min-h-0 w-full" style={{ minWidth: 0 }}>

      {/* Column header */}
      <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: `2px solid ${accentColor}` }}>
        <div style={{ color: accentColor }}>{icon}</div>
        <h3 className="font-bold uppercase tracking-[0.08em]"
          style={{ ...SANS, fontSize: "11px", color: "#374151" }}>
          {label}
        </h3>
        <span className="px-2 py-0.5 rounded-full font-bold text-white tabular-nums"
          style={{ ...MONO, fontSize: "10px", background: accentColor }}>
          {count}
        </span>
      </div>

      {/* Drop zone */}
      <div
        className="flex-1 overflow-y-auto rounded-[6px] [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200"
        onDragOver={e => onDragOver(e, id)}
        onDragLeave={onDragLeave}
        onDrop={e => onDrop(e, id)}
        style={{
          padding: "8px",
          background: isOver ? `${accentColor}08` : "transparent",
          border: isOver ? `2px dashed ${accentColor}60` : "2px dashed transparent",
          borderRadius: "6px",
          transition: `background 0.15s ${SNAPPY}, border-color 0.15s ${SNAPPY}`,
          minHeight: "200px",
        }}
      >
        {incidents.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center mb-3"
              style={{ background: `${accentColor}12` }}>
              <CheckCircle2 className="w-5 h-5" style={{ color: accentColor }} />
            </div>
            <p style={{ ...SANS, fontSize: "12px", color: "#94A3B8", lineHeight: 1.5 }}>
              No incidents in<br /><strong style={{ color: "#64748B" }}>{label}</strong>
            </p>
          </div>
        ) : (
          <div className={twoCol ? "grid grid-cols-2 gap-3" : "flex flex-col gap-3"}>
            {incidents.map(inc => (
              <DraggableCard
                key={inc.id}
                incident={inc}
                record={records.get(inc.id)!}
                from={id}
                onDragStart={onCardDragStart}
                onCardClick={() => onCardClick(inc)}
                onSelfAssign={() => onCardAction("self-assign", inc)}
                onAssignTo={() => onCardAction("assign-to", inc)}
                onEscalate={() => onCardAction("escalate", inc)}
                onResolve={() => onCardAction("resolve", inc)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════════
// Dashboard 4 Page
// ═══════════════════════════════════════════════════════════════════════════════
export function Dashboard4Page() {
  const [activePersona, setActivePersona] = useState<Persona>("monitoring");

  // Lifecycle records track assignee + stage
  const [records, setRecords] = useState<Map<number, LifecycleRecord>>(() => initRecords());

  // Drag state
  const draggingId   = useRef<number | null>(null);
  const draggingFrom = useRef<KanbanColumn | null>(null);
  const [dragOverCol, setDragOverCol] = useState<KanbanColumn | null>(null);

  // Pending assign triggered by drag (uses AssignToDialog)
  const [pendingAssign, setPendingAssign] = useState<Incident | null>(null);

  // Card-level dialogs (same as v3)
  type CD = null | { type: "self-assign" | "assign-to" | "escalate" | "resolve"; incident: Incident };
  const [cardDialog, setCardDialog] = useState<CD>(null);

  // Detail modal
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentInc, setCurrentInc] = useState<Incident | null>(null);

  // Active (non-resolved) incidents only
  const active = ALL_INCIDENTS.filter(i => records.get(i.id)?.stage !== "resolved");

  // Column membership
  const colFor = (inc: Incident): KanbanColumn => {
    const rec = records.get(inc.id);
    if (!rec || rec.assignee === "Unassigned") return "unassigned";
    if (rec.stage === "in_progress" || rec.stage === "escalated") return "inprogress";
    return "assigned";
  };

  const unassigned = active.filter(i => colFor(i) === "unassigned");
  const assigned   = active.filter(i => colFor(i) === "assigned");
  const inprogress = active.filter(i => colFor(i) === "inprogress");

  // ── Record mutation ────────────────────────────────────────────────────────
  const ts = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

  const handleCard = (type: CD["type"], inc: Incident, payload?: string) => {
    const rec = records.get(inc.id); if (!rec) return;
    const t = ts();
    if (type === "self-assign") {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "in_progress" as LifecycleStage, assignee: MY_OPERATOR, timeline: [{ id: `sa_${Date.now()}`, type: "human" as const, icon: "👤", title: `Self-Assigned by ${MY_OPERATOR}`, actor: MY_OPERATOR, timestamp: t }, ...rec.timeline] }); return n; });
    } else if (type === "assign-to" && payload) {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "in_progress" as LifecycleStage, assignee: payload, timeline: [{ id: `at_${Date.now()}`, type: "human" as const, icon: "👤", title: `Assigned to ${payload}`, actor: "Manager", timestamp: t }, ...rec.timeline] }); return n; });
    } else if (type === "escalate" && payload) {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "escalated" as LifecycleStage, assignee: payload, readOnly: true, timeline: [{ id: `esc_${Date.now()}`, type: "human" as const, icon: "🟠", title: `Escalated to ${payload}`, actor: "Manager", timestamp: t }, ...rec.timeline] }); return n; });
    } else if (type === "resolve") {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "resolved" as LifecycleStage, readOnly: true, timeline: [{ id: `res_${Date.now()}`, type: "human" as const, icon: "✅", title: `Resolved by Manager`, actor: "Manager", timestamp: t }, ...rec.timeline] }); return n; });
    }
    setCardDialog(null);
  };

  // ── Drag handlers ──────────────────────────────────────────────────────────
  const handleCardDragStart = (e: React.DragEvent, id: number, from: KanbanColumn) => {
    draggingId.current   = id;
    draggingFrom.current = from;
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, col: KanbanColumn) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverCol(col);
  };

  const handleDragLeave = () => setDragOverCol(null);

  const handleDrop = (e: React.DragEvent, toCol: KanbanColumn) => {
    e.preventDefault();
    setDragOverCol(null);
    const id   = draggingId.current;
    const from = draggingFrom.current;
    draggingId.current   = null;
    draggingFrom.current = null;
    if (id === null || from === toCol) return;

    const inc = ALL_INCIDENTS.find(i => i.id === id);
    if (!inc) return;

    // Dragging from unassigned → anywhere triggers the assign dialog
    if (from === "unassigned") {
      setPendingAssign(inc);
      return;
    }

    // All other moves: update record directly
    const t = ts();
    setRecords(prev => {
      const n = new Map(prev);
      const rec = n.get(id);
      if (!rec) return prev;
      if (toCol === "inprogress") {
        n.set(id, { ...rec, stage: "in_progress" as LifecycleStage, timeline: [{ id: `mv_${Date.now()}`, type: "human" as const, icon: "▶", title: "Moved to In-Progress", actor: "Manager", timestamp: t }, ...rec.timeline] });
      } else if (toCol === "assigned") {
        n.set(id, { ...rec, stage: "detected" as LifecycleStage, timeline: [{ id: `mv_${Date.now()}`, type: "human" as const, icon: "📋", title: "Moved back to Assigned", actor: "Manager", timestamp: t }, ...rec.timeline] });
      } else if (toCol === "unassigned") {
        n.set(id, { ...rec, assignee: "Unassigned", stage: "detected" as LifecycleStage, timeline: [{ id: `mv_${Date.now()}`, type: "human" as const, icon: "↩", title: "Unassigned", actor: "Manager", timestamp: t }, ...rec.timeline] });
      }
      return n;
    });
  };

  const openDetail = (inc: Incident) => { setCurrentInc(inc); setDetailOpen(true); };
  const updateRecord = useCallback((updated: LifecycleRecord) => {
    if (!currentInc) return;
    setRecords(p => { const n = new Map(p); n.set(currentInc.id, updated); return n; });
  }, [currentInc]);

  const colProps = (id: KanbanColumn) => ({
    dragOverCol, onDragOver: handleDragOver, onDragLeave: handleDragLeave,
    onDrop: handleDrop, onCardDragStart: handleCardDragStart,
    onCardClick: openDetail, records,
    onCardAction: (type: "self-assign" | "assign-to" | "escalate" | "resolve", inc: Incident) =>
      setCardDialog({ type, incident: inc }),
  });

  return (
    <div className="flex flex-col min-h-full font-sans" style={{ background: "#F8FAFC" }}>
      <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />

      {/* ── Board header ──────────────────────────────────────────────────── */}
      <div className="flex items-center gap-4 px-4 pt-3 pb-2" style={{ borderBottom: "1px solid #E2E8F0" }}>
        <div>
          <h2 className="font-bold" style={{ ...SANS, fontSize: "15px", color: "#0F172A" }}>Manager Dashboard</h2>
          <p style={{ ...MONO, fontSize: "11px", color: "#64748B", marginTop: "1px" }}>
            {active.length} active incidents · drag cards between columns to update status
          </p>
        </div>
        <div className="flex items-center gap-3 ml-auto">
          {[
            { label: "Unassigned",  count: unassigned.length, color: "#EA580C" },
            { label: "Assigned",    count: assigned.length,   color: "#0284C7" },
            { label: "In-Progress", count: inprogress.length, color: "#00775B" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
              style={{ background: s.color + "0F", border: `1px solid ${s.color}28` }}>
              <span className="tabular-nums font-bold" style={{ ...MONO, fontSize: "11px", color: s.color }}>{s.count}</span>
              <span style={{ ...SANS, fontSize: "11px", color: s.color, fontWeight: 500 }}>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Kanban board ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 px-4 pb-4 pt-3" style={{ gap: "14px" }}>

        {/* Un-Assigned: widest (2 cards/row) */}
        <div className="flex flex-col min-h-0" style={{ width: "46%", flexShrink: 0 }}>
          <KanbanCol id="unassigned" label="Un-Assigned" count={unassigned.length}
            accentColor="#EA580C" icon={<Inbox className="w-4 h-4" />}
            incidents={unassigned} twoCol={true} {...colProps("unassigned")} />
        </div>

        <div className="w-px shrink-0 self-stretch" style={{ background: "#E2E8F0" }} />

        {/* Assigned: medium (1 card/row) */}
        <div className="flex flex-col min-h-0" style={{ width: "30%", flexShrink: 0 }}>
          <KanbanCol id="assigned" label="Assigned" count={assigned.length}
            accentColor="#0284C7" icon={<Users className="w-4 h-4" />}
            incidents={assigned} twoCol={false} {...colProps("assigned")} />
        </div>

        <div className="w-px shrink-0 self-stretch" style={{ background: "#E2E8F0" }} />

        {/* In-Progress: narrowest (1 card/row) */}
        <div className="flex flex-col flex-1 min-h-0 min-w-0">
          <KanbanCol id="inprogress" label="In-Progress" count={inprogress.length}
            accentColor="#00775B" icon={<Loader2 className="w-4 h-4" />}
            incidents={inprogress} twoCol={false} {...colProps("inprogress")} />
        </div>
      </div>

      {/* ── Card dialogs (same as v3) ─────────────────────────────────────── */}
      {cardDialog?.type === "self-assign" && <SelfAssignDialog   incident={cardDialog.incident} onConfirm={() => handleCard("self-assign", cardDialog.incident)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "assign-to"   && <AssignToDialog     incident={cardDialog.incident} onConfirm={n  => handleCard("assign-to",   cardDialog.incident, n)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "escalate"    && <EscalateConfirmDialog incident={cardDialog.incident} onConfirm={(m,_n) => handleCard("escalate", cardDialog.incident, m)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "resolve"     && <ResolveDialog      incident={cardDialog.incident} onConfirm={() => handleCard("resolve",    cardDialog.incident)} onCancel={() => setCardDialog(null)} />}

      {/* ── Drag-assign modal ─────────────────────────────────────────────── */}
      {pendingAssign && (
        <AssignToDialog
          incident={pendingAssign}
          onConfirm={name => { handleCard("assign-to", pendingAssign, name); setPendingAssign(null); }}
          onCancel={() => setPendingAssign(null)}
        />
      )}

      {/* ── Detail modal ─────────────────────────────────────────────────── */}
      <IncidentDetailModal2
        incident={currentInc}
        record={currentInc ? records.get(currentInc.id) ?? null : null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={updateRecord}
        persona={activePersona}
      />
    </div>
  );
}
