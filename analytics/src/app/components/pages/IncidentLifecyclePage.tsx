import { useState, useEffect, useRef, useCallback } from "react";
import { ALL_INCIDENTS, Incident } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";
import { SeverityIcon } from "@fe-common/components/ui/SeverityIcon";
import {
  ChevronRight, User, MapPin, Video, X, Send,
  CheckCircle2, AlertTriangle, Clock, Settings2, Snowflake,
  Circle, Zap, ArrowUpRight,
} from "lucide-react";

// ─── Typography tokens ────────────────────────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace", fontSize: "12px" };
const SANS: React.CSSProperties = { fontFamily: "'Inter',sans-serif", fontSize: "12px" };

// ─── Lifecycle stage types ────────────────────────────────────────────────────
type LifecycleStage = "detected" | "in_progress" | "escalated" | "cooldown" | "resolved";

interface TimelineNode {
  id: string;
  type: "system" | "human";
  icon: string;
  title: string;
  timestamp: string;     // HH:MM:SS
  actor?: string;
  note?: string;
}

interface LifecycleRecord {
  stage: LifecycleStage;
  assignee: string;
  startedAt: number;     // Date.now() snapshot
  timeline:  TimelineNode[];
  readOnly:  boolean;
}

// ─── Stage config (color-neutral — severity color space is reserved for severity only) ──
const STAGE_CONFIG: Record<LifecycleStage, {
  label: string;
  icon: React.ReactNode;
}> = {
  detected:    { label: "DETECTED",    icon: <Circle     className="w-3 h-3" /> },
  in_progress: { label: "IN PROGRESS", icon: <Settings2  className="w-3 h-3" /> },
  escalated:   { label: "ESCALATED",   icon: <AlertTriangle className="w-3 h-3" /> },
  cooldown:    { label: "COOLDOWN",    icon: <Snowflake  className="w-3 h-3" /> },
  resolved:    { label: "RESOLVED",    icon: <CheckCircle2 className="w-3 h-3" /> },
};

// ─── Severity border accent (frame color — the ONLY place severity colors live) ─
const SEVERITY_FRAME: Record<string, string> = {
  critical: "border-red-600",
  high:     "border-orange-500",
  medium:   "border-yellow-500",
  low:      "border-blue-500",
  info:     "border-neutral-400",
  resolved: "border-green-500",
};
const SEVERITY_HEADER_BG: Record<string, string> = {
  critical: "bg-red-950/60",
  high:     "bg-orange-950/50",
  medium:   "bg-yellow-950/40",
  low:      "bg-blue-950/40",
  info:     "bg-neutral-900/60",
  resolved: "bg-green-950/40",
};

// ─── Build a deterministic mock timeline for each incident ────────────────────
function buildTimeline(incident: Incident): TimelineNode[] {
  const base = incident.timestamp.replace(" PM","").replace(" AM","");
  const [hh, mm] = base.split(":").map(Number);
  const fmt = (h: number, m: number, s: number) =>
    `${String(h).padStart(2,"0")}:${String(m).padStart(2,"0")}:${String(s).padStart(2,"0")}`;

  const nodes: TimelineNode[] = [
    {
      id: "t1", type: "system", icon: "🚨",
      title: "AI Detection Triggered",
      timestamp: fmt(hh, mm, 0),
    },
  ];

  if (incident.severity === "critical" || incident.severity === "high") {
    nodes.push({
      id: "t2", type: "system", icon: "🔔",
      title: "Alert Broadcast to Monitoring Staff",
      timestamp: fmt(hh, mm, 14),
    });
    nodes.push({
      id: "t3", type: "human", icon: "👤",
      title: `Acknowledged by Staff_04`,
      actor: "Staff_04",
      timestamp: fmt(hh, mm + 2, 37),
    });
  }

  if (incident.severity === "critical") {
    nodes.push({
      id: "t4", type: "human", icon: "⚠️",
      title: "Escalated to Manager by Operator_02",
      actor: "Operator_02",
      timestamp: fmt(hh, mm + 5, 12),
      note: "Confirmed active flame in storage aisle 4 — requires immediate on-site response and fire suppression protocol activation.",
    });
    nodes.push({
      id: "t5", type: "system", icon: "❄️",
      title: "Sensor Cooldown Detected",
      timestamp: fmt(hh, mm + 8, 44),
    });
  }

  return nodes.reverse(); // newest first
}

// ─── Live SLA ticker ──────────────────────────────────────────────────────────
function useTicker(startedAt: number) {
  const [elapsed, setElapsed] = useState(Date.now() - startedAt);
  useEffect(() => {
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 1000);
    return () => clearInterval(id);
  }, [startedAt]);
  const totalSec = Math.floor(elapsed / 1000);
  const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const ss = String(totalSec % 60).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

// ─── Severity badge (compact, color-encoded — severity color space only) ─────
function SevBadge({ severity }: { severity: string }) {
  const bg: Record<string,string> = {
    critical: "bg-red-600", high: "bg-orange-500", medium: "bg-yellow-500",
    low: "bg-blue-500", info: "bg-neutral-500", resolved: "bg-green-600",
  };
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-white", bg[severity] ?? "bg-neutral-500")}>
      <SeverityIcon severity={severity} mode="inverse" className="w-3 h-3" />
      <span className="text-[10px] font-bold uppercase tracking-wider" style={SANS}>{severity}</span>
    </span>
  );
}

// ─── Lifecycle status pill (color-NEUTRAL — gray outlined only) ───────────────
function StagePill({ stage }: { stage: LifecycleStage }) {
  const { label, icon } = STAGE_CONFIG[stage];
  return (
    <span
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
      style={{ border: "1px solid rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.85)", ...SANS, fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em" }}
    >
      {icon}{label}
    </span>
  );
}

// ─── Timeline node ────────────────────────────────────────────────────────────
function TNode({ node, isLast }: { node: TimelineNode; isLast: boolean }) {
  return (
    <div className="flex gap-3 group">
      {/* Dot + line */}
      <div className="flex flex-col items-center">
        <div
          className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10"
          style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.14)" }}
        >
          <span style={{ fontSize: "11px", lineHeight: 1 }}>{node.icon}</span>
        </div>
        {!isLast && <div className="w-px flex-1 mt-1" style={{ background: "rgba(255,255,255,0.08)", minHeight: "20px" }} />}
      </div>

      {/* Content */}
      <div className="flex-1 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span style={{ ...SANS, fontSize: "12px", color: "rgba(255,255,255,0.88)", fontWeight: 500 }}>
              {node.title}
            </span>
            {node.actor && (
              <span style={{ ...SANS, fontSize: "11px", color: "rgba(255,255,255,0.40)", marginLeft: "6px" }}>
                · {node.actor}
              </span>
            )}
          </div>
          <span
            className="shrink-0 tabular-nums"
            style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.35)" }}
          >
            {node.timestamp}
          </span>
        </div>

        {/* Comment sub-plate */}
        {node.note && (
          <div
            className="mt-2 px-3 py-2 rounded"
            style={{ background: "rgba(255,255,255,0.02)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <span style={{ ...SANS, fontSize: "12px", color: "rgba(255,255,255,0.40)", lineHeight: 1.5 }}>
              ↳ Note:{" "}
              <span style={{ color: "rgba(255,255,255,0.62)", fontStyle: "italic" }}>
                "{node.note}"
              </span>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Escalation micro-popup ───────────────────────────────────────────────────
function EscalatePopup({
  onSubmit, onCancel,
}: {
  onSubmit: (note: string) => void;
  onCancel: () => void;
}) {
  const [note, setNote] = useState("");
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => { ref.current?.focus(); }, []);

  return (
    <div
      className="rounded-lg overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      style={{ background: "rgba(15,23,42,0.98)", border: "1px solid rgba(255,255,255,0.12)", boxShadow: "0 16px 48px rgba(0,0,0,0.55)" }}
    >
      <div className="px-4 py-3 border-b" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="flex items-center justify-between">
          <span style={{ ...SANS, fontWeight: 600, color: "rgba(255,255,255,0.90)", fontSize: "12px" }}>
            ⚠️ Escalate to Manager
          </span>
          <button onClick={onCancel} className="p-0.5 rounded" style={{ color: "rgba(255,255,255,0.40)" }}>
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <p style={{ ...SANS, fontSize: "11px", color: "rgba(255,255,255,0.40)", marginTop: "4px" }}>
          Optional: add an escalation note for the manager.
        </p>
      </div>
      <div className="p-4">
        <textarea
          ref={ref}
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Describe the escalation reason…"
          rows={3}
          className="w-full rounded resize-none outline-none"
          style={{
            ...SANS, fontSize: "12px",
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.10)",
            color: "rgba(255,255,255,0.82)",
            padding: "10px 12px",
            lineHeight: 1.6,
          }}
          onKeyDown={e => {
            if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onSubmit(note.trim());
            if (e.key === "Escape") onCancel();
          }}
        />
        <div className="flex items-center justify-end gap-2 mt-3">
          <button
            onClick={onCancel}
            style={{ ...SANS, fontSize: "12px", color: "rgba(255,255,255,0.45)", padding: "6px 14px", borderRadius: "6px", border: "1px solid rgba(255,255,255,0.10)", background: "transparent" }}
          >
            Cancel
          </button>
          <button
            onClick={() => onSubmit(note.trim())}
            className="flex items-center gap-1.5"
            style={{ ...SANS, fontSize: "12px", fontWeight: 600, color: "#fff", padding: "6px 14px", borderRadius: "6px", background: "#EA580C", border: "none", cursor: "pointer" }}
          >
            <Send className="w-3 h-3" /> Escalate
          </button>
        </div>
        <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.22)", marginTop: "8px", textAlign: "right" }}>
          ⌘↵ to submit · ESC to cancel
        </p>
      </div>
    </div>
  );
}

// ─── Incident detail pane ─────────────────────────────────────────────────────
function IncidentDetail({
  incident,
  record,
  onUpdate,
}: {
  incident: Incident;
  record: LifecycleRecord;
  onUpdate: (updated: LifecycleRecord) => void;
}) {
  const ticker = useTicker(record.startedAt);
  const [showEscalate, setShowEscalate] = useState(false);

  const handleAcknowledge = useCallback(() => {
    if (record.readOnly || record.stage !== "detected") return;
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    const newNode: TimelineNode = {
      id: `t_ack_${Date.now()}`, type: "human", icon: "👤",
      title: "Acknowledged by Staff_04", actor: "Staff_04", timestamp: ts,
    };
    onUpdate({
      ...record,
      stage: "in_progress",
      timeline: [newNode, ...record.timeline],
    });
  }, [record, onUpdate]);

  const handleEscalateSubmit = useCallback((note: string) => {
    setShowEscalate(false);
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    const newNode: TimelineNode = {
      id: `t_esc_${Date.now()}`, type: "human", icon: "⚠️",
      title: "Escalated to Manager by Operator_02",
      actor: "Operator_02", timestamp: ts,
      note: note || undefined,
    };
    onUpdate({
      ...record,
      stage: "escalated",
      assignee: "Manager_01",
      timeline: [newNode, ...record.timeline],
      readOnly: true,   // frontline view goes read-only after escalation
    });
  }, [record, onUpdate]);

  const handleResolve = useCallback(() => {
    if (record.readOnly) return;
    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
    const newNode: TimelineNode = {
      id: `t_res_${Date.now()}`, type: "human", icon: "✅",
      title: "Incident Resolved by Staff_04", actor: "Staff_04", timestamp: ts,
    };
    onUpdate({
      ...record,
      stage: "resolved",
      timeline: [newNode, ...record.timeline],
      readOnly: true,
    });
  }, [record, onUpdate]);

  const isCritical = incident.severity === "critical";

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ background: "#070f1d" }}>

      {/* ── Header status band ─────────────────────────────────────────────── */}
      <div
        className={cn(
          "shrink-0 border-t-[3px] border-b px-5 py-3",
          SEVERITY_FRAME[incident.severity],
          SEVERITY_HEADER_BG[incident.severity],
        )}
        style={{ borderBottomColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Row 1: ID + severity */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-3">
            <span style={{ ...MONO, color: "rgba(255,255,255,0.45)" }}>
              {incident.incidentId}
            </span>
            <SevBadge severity={incident.severity} />
            {isCritical && (
              <span
                className="px-1.5 py-0.5 rounded text-red-300 text-[10px] font-bold uppercase tracking-wider animate-pulse"
                style={{ background: "rgba(220,38,38,0.20)", border: "1px solid rgba(220,38,38,0.35)" }}
              >
                ● CRITICAL
              </span>
            )}
          </div>
          {/* SLA live ticker */}
          <span
            className="flex items-center gap-1.5"
            style={{ ...MONO, color: "rgba(255,255,255,0.55)" }}
          >
            ⏱ Active Duration: <span style={{ color: "rgba(255,255,255,0.85)" }}>{ticker}</span>
          </span>
        </div>

        {/* Row 2: title + stage pill */}
        <div className="flex items-center justify-between">
          <h2 style={{ ...SANS, fontSize: "14px", fontWeight: 700, color: "rgba(255,255,255,0.95)" }}>
            {incident.title}
          </h2>
          <StagePill stage={record.stage} />
        </div>

        {/* Row 3: meta */}
        <div className="flex items-center gap-4 mt-2">
          <span className="flex items-center gap-1.5" style={{ ...SANS, color: "rgba(255,255,255,0.45)" }}>
            <User className="w-3 h-3" />
            Assigned to:{" "}
            <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{record.assignee}</span>
          </span>
          <span className="flex items-center gap-1.5" style={{ ...SANS, color: "rgba(255,255,255,0.38)" }}>
            <MapPin className="w-3 h-3" />{incident.location}
          </span>
          <span className="flex items-center gap-1.5" style={{ ...MONO, color: "rgba(255,255,255,0.38)" }}>
            <Video className="w-3 h-3" />{incident.camera}
          </span>
        </div>
      </div>

      {/* ── Body: timeline + actions ────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">

        {/* Scrollable timeline column */}
        <div className="flex-1 overflow-y-auto px-6 py-5 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10">

          {/* Section label */}
          <div className="flex items-center gap-2 mb-5">
            <span style={{ ...MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.30)", textTransform: "uppercase" }}>
              Audit Timeline
            </span>
            <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.06)" }} />
            <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.22)" }}>
              newest → oldest
            </span>
          </div>

          {/* Timeline nodes */}
          {record.timeline.map((node, i) => (
            <TNode key={node.id} node={node} isLast={i === record.timeline.length - 1} />
          ))}
        </div>

        {/* Right actions column */}
        <div
          className="w-[220px] shrink-0 flex flex-col gap-3 px-4 py-5 border-l"
          style={{ borderColor: "rgba(255,255,255,0.06)", background: "rgba(255,255,255,0.015)" }}
        >
          <p style={{ ...MONO, fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em", color: "rgba(255,255,255,0.28)", textTransform: "uppercase" }}>
            Actions
          </p>

          {/* Escalate popup overlay */}
          {showEscalate && (
            <div className="absolute right-4 bottom-40 w-80 z-50">
              <EscalatePopup
                onSubmit={handleEscalateSubmit}
                onCancel={() => setShowEscalate(false)}
              />
            </div>
          )}

          {record.readOnly ? (
            /* ── Read-only historical state ── */
            <div
              className="rounded-lg px-3 py-3 flex flex-col gap-1.5"
              style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
            >
              <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.35)", letterSpacing: "0.05em" }}>
                HISTORICAL VIEW
              </span>
              <span style={{ ...SANS, fontSize: "11px", color: "rgba(255,255,255,0.50)", lineHeight: 1.5 }}>
                Ticket {record.stage === "escalated" ? "escalated to manager" : "closed"}. Controls are locked for audit integrity.
              </span>
            </div>
          ) : (
            <>
              {/* Acknowledge */}
              {record.stage === "detected" && (
                <ActionBtn icon={<ChevronRight className="w-3.5 h-3.5" />} label="Acknowledge" onClick={handleAcknowledge} variant="default" />
              )}

              {/* Escalate */}
              {(record.stage === "detected" || record.stage === "in_progress") && (
                <ActionBtn
                  icon={<AlertTriangle className="w-3.5 h-3.5" />}
                  label="Escalate to Manager"
                  onClick={() => setShowEscalate(true)}
                  variant="warn"
                />
              )}

              {/* Mark cooldown */}
              {record.stage === "in_progress" && (
                <ActionBtn
                  icon={<Snowflake className="w-3.5 h-3.5" />}
                  label="Mark Cooldown"
                  onClick={() => {
                    const ts = new Date().toLocaleTimeString("en-GB", { hour12: false });
                    onUpdate({
                      ...record,
                      stage: "cooldown",
                      timeline: [{ id: `t_cd_${Date.now()}`, type: "system", icon: "❄️", title: "Sensor Cooldown Detected", timestamp: ts }, ...record.timeline],
                    });
                  }}
                  variant="default"
                />
              )}

              {/* Resolve */}
              {(record.stage === "in_progress" || record.stage === "cooldown") && (
                <ActionBtn icon={<CheckCircle2 className="w-3.5 h-3.5" />} label="Resolve Incident" onClick={handleResolve} variant="resolve" />
              )}
            </>
          )}

          {/* Static meta plate */}
          <div
            className="mt-auto rounded-lg px-3 py-3"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em", marginBottom: "8px" }}>INCIDENT META</p>
            <dl className="space-y-1.5">
              {[
                { k: "ID",          v: incident.incidentId },
                { k: "Application", v: incident.application },
                { k: "Detected",    v: incident.timestamp },
                { k: "Camera",      v: incident.camera },
              ].map(({ k, v }) => (
                <div key={k} className="flex flex-col gap-0.5">
                  <dt style={{ ...SANS, fontSize: "10px", color: "rgba(255,255,255,0.28)", textTransform: "uppercase", letterSpacing: "0.06em" }}>{k}</dt>
                  <dd style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.65)" }}>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

// tiny button helper
function ActionBtn({ icon, label, onClick, variant }: {
  icon: React.ReactNode; label: string; onClick: () => void;
  variant: "default" | "warn" | "resolve";
}) {
  const [hov, setHov] = useState(false);
  const bg: Record<string,string> = {
    default: hov ? "rgba(255,255,255,0.12)" : "rgba(255,255,255,0.06)",
    warn:    hov ? "rgba(234,88,12,0.30)"   : "rgba(234,88,12,0.12)",
    resolve: hov ? "rgba(22,163,74,0.30)"   : "rgba(22,163,74,0.12)",
  };
  const borderColor: Record<string,string> = {
    default: "rgba(255,255,255,0.12)",
    warn:    "rgba(234,88,12,0.40)",
    resolve: "rgba(22,163,74,0.40)",
  };
  const color: Record<string,string> = {
    default: "rgba(255,255,255,0.82)",
    warn:    "rgba(253,186,116,0.95)",
    resolve: "rgba(134,239,172,0.95)",
  };
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      onClick={onClick}
      className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-left"
      style={{ ...SANS, fontWeight: 600, transition: "all 150ms ease-out", background: bg[variant], border: `1px solid ${borderColor[variant]}`, color: color[variant] }}
    >
      {icon}{label}
    </button>
  );
}

// ─── Incident list item ───────────────────────────────────────────────────────
const SEV_STRIPE: Record<string,string> = {
  critical: "bg-red-600", high: "bg-orange-500", medium: "bg-yellow-500",
  low: "bg-blue-500", info: "bg-neutral-500", resolved: "bg-green-600",
};

function IncidentListItem({
  incident, isActive, stage, onClick,
}: {
  incident: Incident; isActive: boolean; stage: LifecycleStage; onClick: () => void;
}) {
  const { label } = STAGE_CONFIG[stage];
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-start gap-0 text-left transition-colors",
        isActive ? "bg-white/8" : "hover:bg-white/5"
      )}
    >
      {/* Severity stripe */}
      <div className={cn("w-[3px] self-stretch shrink-0", SEV_STRIPE[incident.severity])} />
      <div className="flex-1 px-3 py-3 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <span style={{ ...SANS, fontWeight: 600, fontSize: "12px", color: "rgba(255,255,255,0.88)" }} className="truncate">
            {incident.title}
          </span>
          {isActive && <ChevronRight className="w-3 h-3 shrink-0 text-white/40 mt-0.5" />}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          <span style={{ ...MONO, fontSize: "10px", color: "rgba(255,255,255,0.35)" }}>{incident.incidentId}</span>
          <span style={{ fontSize: "9px", color: "rgba(255,255,255,0.30)", letterSpacing: "0.06em", fontFamily: "Inter,sans-serif", textTransform: "uppercase" }} className={cn("px-1.5 py-0.5 rounded-sm", stage === "resolved" ? "bg-white/5" : "bg-white/4")}>
            {label}
          </span>
        </div>
        <div className="flex items-center gap-1 mt-1">
          <MapPin className="w-2.5 h-2.5 text-white/25" />
          <span style={{ ...SANS, fontSize: "11px", color: "rgba(255,255,255,0.38)" }} className="truncate">{incident.location}</span>
        </div>
      </div>
    </button>
  );
}

// ─── Initialise lifecycle records for all incidents ───────────────────────────
function initRecords(): Map<number, LifecycleRecord> {
  const m = new Map<number, LifecycleRecord>();
  ALL_INCIDENTS.forEach(inc => {
    const stage: LifecycleStage =
      inc.severity === "critical" ? "escalated" :
      inc.severity === "high"     ? "in_progress" :
      inc.severity === "resolved" ? "resolved" : "detected";
    m.set(inc.id, {
      stage,
      assignee: stage === "escalated" ? "Manager_01" : stage === "detected" ? "Unassigned" : "Staff_04",
      startedAt: Date.now() - (inc.id * 87_000),   // stagger start times for visual variety
      timeline: buildTimeline(inc),
      readOnly: stage === "escalated" || stage === "resolved",
    });
  });
  return m;
}

// ─── Page root ────────────────────────────────────────────────────────────────
export function IncidentLifecyclePage() {
  const [records, setRecords] = useState<Map<number, LifecycleRecord>>(() => initRecords());
  const [selectedId, setSelectedId] = useState<number>(ALL_INCIDENTS[0].id);

  const selectedIncident = ALL_INCIDENTS.find(i => i.id === selectedId)!;
  const selectedRecord   = records.get(selectedId)!;

  const updateRecord = useCallback((updated: LifecycleRecord) => {
    setRecords(prev => {
      const next = new Map(prev);
      next.set(selectedId, updated);
      return next;
    });
  }, [selectedId]);

  return (
    <div className="flex h-full overflow-hidden" style={{ background: "#070f1d", fontFamily: "Inter,sans-serif" }}>

      {/* ── Left: incident list ─────────────────────────────────────────────── */}
      <aside
        className="w-[260px] shrink-0 flex flex-col overflow-hidden border-r"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "#050d19" }}
      >
        {/* List header */}
        <div className="px-4 py-3 border-b flex items-center justify-between shrink-0" style={{ borderColor: "rgba(255,255,255,0.07)" }}>
          <span style={{ ...SANS, fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", color: "rgba(255,255,255,0.50)", textTransform: "uppercase" }}>
            Active Incidents
          </span>
          <span
            className="px-1.5 py-0.5 rounded text-[10px] font-bold text-white"
            style={{ background: "#00775B", ...MONO, fontSize: "10px" }}
          >
            {ALL_INCIDENTS.length}
          </span>
        </div>
        {/* List */}
        <div className="flex-1 overflow-y-auto divide-y [&::-webkit-scrollbar]:w-0" style={{ borderColor: "rgba(255,255,255,0.05)" }}>
          {ALL_INCIDENTS.map(inc => (
            <IncidentListItem
              key={inc.id}
              incident={inc}
              isActive={inc.id === selectedId}
              stage={records.get(inc.id)!.stage}
              onClick={() => setSelectedId(inc.id)}
            />
          ))}
        </div>
      </aside>

      {/* ── Right: detail pane ─────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 relative overflow-hidden">
        {selectedIncident && selectedRecord ? (
          <IncidentDetail
            key={selectedId}
            incident={selectedIncident}
            record={selectedRecord}
            onUpdate={updateRecord}
          />
        ) : (
          <div className="flex items-center justify-center h-full">
            <span style={{ ...SANS, color: "rgba(255,255,255,0.25)" }}>Select an incident to view its lifecycle</span>
          </div>
        )}
      </div>
    </div>
  );
}
