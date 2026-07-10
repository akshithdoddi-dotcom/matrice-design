import { useState, useRef, useEffect, useMemo } from "react";
import {
  CarFront, Search, Columns3,
  Download, ChevronLeft, ChevronRight, ChevronDown,
  AlertTriangle, Camera, Clock, RefreshCw,
  X, Check, Shield, Car, SlidersHorizontal,
} from "lucide-react";
import {
  IncidentCard2,
  LifecycleStage,
  LifecycleRecord,
  SelfAssignDialog,
  AssignToDialog,
  EscalateConfirmDialog,
  ResolveDialog,
} from "@/app/components/pages/Dashboard2Page";
import { Incident, IMG_PARKING } from "@/app/data/mockData";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface PlateRow {
  id: string;
  plateNumber: string;
  timestamp: string;
  location: string;
  camera: string;
  vehicleType: string;
  confidence: number;
  isBolo: boolean;
  boloReason?: string;
  boloSeverity?: "critical" | "high" | "medium";
}

interface BoloAlert {
  plate: string;
  severity: "critical" | "high" | "medium";
  reason: string;
  camera: string;
  location: string;
  timestamp: string;
  acknowledged: boolean;
}

// ─────────────────────────────────────────────
// Mock data
// ─────────────────────────────────────────────
const CAMERAS = ["All Cameras", "CAM-01", "CAM-02", "CAM-03", "CAM-04", "CAM-05", "CAM-08", "CAM-12", "CAM-15", "CAM-20"];
const VEHICLE_TYPES = ["All Types", "SUV", "Truck", "Van", "Motorcycle", "Bus", "Sedan", "Hatchback"];

const PLATE_DATA: PlateRow[] = [
  { id: "1",  plateNumber: "LM12VCV", timestamp: "Jul 9, 05:53 PM", location: "Main Entrance",    camera: "CAM-01", vehicleType: "SUV",        confidence: 97, isBolo: false },
  { id: "2",  plateNumber: "AK64DMV", timestamp: "Jul 9, 06:05 PM", location: "Entry Reception",  camera: "CAM-03", vehicleType: "Sedan",       confidence: 94, isBolo: true, boloReason: "Reported Stolen",      boloSeverity: "high"     },
  { id: "3",  plateNumber: "CE61WYA", timestamp: "Jul 9, 05:36 PM", location: "Parking Lot A",    camera: "CAM-05", vehicleType: "Hatchback",   confidence: 89, isBolo: false },
  { id: "4",  plateNumber: "NAEAKAL", timestamp: "Jul 9, 05:21 PM", location: "Parking Lot B",    camera: "CAM-08", vehicleType: "Truck",       confidence: 92, isBolo: false },
  { id: "5",  plateNumber: "HX53BDE", timestamp: "Jul 9, 05:15 PM", location: "Side Gate",        camera: "CAM-12", vehicleType: "Van",         confidence: 88, isBolo: false },
  { id: "6",  plateNumber: "NL610AX", timestamp: "Jul 9, 05:01 PM", location: "North Entrance",   camera: "CAM-15", vehicleType: "Motorcycle",  confidence: 91, isBolo: false },
  { id: "7",  plateNumber: "CE11VV",  timestamp: "Jul 9, 04:59 PM", location: "South Exit",       camera: "CAM-20", vehicleType: "Bus",         confidence: 96, isBolo: false },
  { id: "8",  plateNumber: "XYZ1011", timestamp: "Oct 15, 02:57 PM", location: "Parking Lot A",   camera: "CAM-05", vehicleType: "SUV",         confidence: 97, isBolo: false },
  { id: "9",  plateNumber: "DEF1022", timestamp: "Oct 15, 02:54 PM", location: "Parking Lot B",   camera: "CAM-08", vehicleType: "Truck",       confidence: 96, isBolo: false },
  { id: "10", plateNumber: "GH33DMV", timestamp: "Oct 15, 02:51 PM", location: "Entry Reception", camera: "CAM-03", vehicleType: "Sedan",       confidence: 93, isBolo: true, boloReason: "Outstanding Warrant",  boloSeverity: "critical" },
  { id: "11", plateNumber: "GHI1033", timestamp: "Oct 15, 02:51 PM", location: "Side Gate",       camera: "CAM-12", vehicleType: "Van",         confidence: 93, isBolo: false },
  { id: "12", plateNumber: "JKL1044", timestamp: "Oct 15, 02:48 PM", location: "North Entrance",  camera: "CAM-15", vehicleType: "Motorcycle",  confidence: 92, isBolo: false },
  { id: "13", plateNumber: "MN09XRZ", timestamp: "Oct 15, 02:47 PM", location: "Main Entrance",   camera: "CAM-01", vehicleType: "SUV",         confidence: 90, isBolo: true, boloReason: "Reported Stolen",      boloSeverity: "high"     },
  { id: "14", plateNumber: "MNO1055", timestamp: "Oct 15, 02:45 PM", location: "South Exit",      camera: "CAM-20", vehicleType: "Bus",         confidence: 95, isBolo: false },
  { id: "15", plateNumber: "PQR1066", timestamp: "Oct 15, 01:42 PM", location: "Main Entrance",   camera: "CAM-01", vehicleType: "Sedan",       confidence: 99, isBolo: false },
  { id: "16", plateNumber: "STU1077", timestamp: "Oct 15, 01:39 PM", location: "Parking Lot A",   camera: "CAM-05", vehicleType: "SUV",         confidence: 92, isBolo: false },
  { id: "17", plateNumber: "VWX1088", timestamp: "Oct 15, 01:36 PM", location: "Parking Lot B",   camera: "CAM-08", vehicleType: "Truck",       confidence: 93, isBolo: false },
  { id: "18", plateNumber: "YZA1099", timestamp: "Oct 15, 01:33 PM", location: "Side Gate",       camera: "CAM-12", vehicleType: "Van",         confidence: 96, isBolo: false },
  { id: "19", plateNumber: "ABC1110", timestamp: "Oct 15, 01:30 PM", location: "North Entrance",  camera: "CAM-15", vehicleType: "Motorcycle",  confidence: 92, isBolo: false },
  { id: "20", plateNumber: "RL22KVP", timestamp: "Oct 15, 01:10 PM", location: "Entry Reception", camera: "CAM-03", vehicleType: "Sedan",       confidence: 91, isBolo: true, boloReason: "Suspicious Activity",  boloSeverity: "medium"   },
];

const INITIAL_BOLO: BoloAlert[] = [
  { plate: "GH33DMV", severity: "critical", reason: "Outstanding Warrant",  camera: "CAM-03", location: "Entry Reception", timestamp: "Oct 15, 02:51 PM", acknowledged: false },
  { plate: "AK64DMV", severity: "high",     reason: "Reported Stolen",      camera: "CAM-03", location: "Entry Reception", timestamp: "Jul 9, 06:05 PM",  acknowledged: false },
  { plate: "MN09XRZ", severity: "high",     reason: "Reported Stolen",      camera: "CAM-01", location: "Main Entrance",   timestamp: "Oct 15, 02:47 PM", acknowledged: false },
  { plate: "RL22KVP", severity: "medium",   reason: "Suspicious Activity",  camera: "CAM-03", location: "Entry Reception", timestamp: "Oct 15, 01:10 PM", acknowledged: true  },
];

// Map BOLO severity → lifecycle stage
const boloStage = (sev: BoloAlert["severity"]): LifecycleStage =>
  sev === "critical" ? "in_progress" : sev === "high" ? "in_progress" : "detected";

// Construct a fake Incident from a BoloAlert (for IncidentCard2 compatibility)
const boloToIncident = (alert: BoloAlert, idx: number): Incident => ({
  id: idx + 9000,
  incidentId: alert.plate,        // plate in the bottom-right mono slot
  title: alert.reason,            // reason in the title slot
  severity: alert.severity,
  timestamp: alert.timestamp,
  location: alert.location,
  camera: alert.camera,
  image: IMG_PARKING,             // parking lot CCTV still
  application: "LPR",
});

const boloRecord = (sev: BoloAlert["severity"]): LifecycleRecord => ({
  stage: boloStage(sev),
  assignee: "Unassigned",
  startedAt: Date.now() - 300_000,
  timeline: [],
  readOnly: false,
});

// ─────────────────────────────────────────────
// Shared toolbar style tokens (V2_3Content)
// ─────────────────────────────────────────────
const CONF_COLOR = (c: number) => c >= 95 ? "#00A63E" : c >= 85 ? "#64748B" : "#EA580C";

const SORT_OPTIONS = [
  { key: "ts-desc",    label: "Newest first"           },
  { key: "ts-asc",     label: "Oldest first"            },
  { key: "plate-asc",  label: "Plate A → Z"             },
  { key: "conf-desc",  label: "Confidence (high → low)" },
  { key: "bolo-first", label: "BOLO alerts first"       },
];

const teal = "#00775B";

const btnBase: React.CSSProperties = {
  background: "transparent",
  border: "none",
  borderBottom: "2px solid transparent",
  borderRadius: 0,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 5,
  fontSize: 12,
  fontWeight: 600,
  fontFamily: "Inter, sans-serif",
  color: "#64748B",
  padding: "4px 2px",
  whiteSpace: "nowrap",
  transition: "color 150ms ease, border-bottom-color 150ms ease",
};

const activeBtnBase: React.CSSProperties = {
  ...btnBase,
  color: teal,
  borderBottomColor: teal,
};

const dropdownPanel: React.CSSProperties = {
  position: "absolute",
  zIndex: 60,
  top: "calc(100% + 8px)",
  right: 0,
  background: "#fff",
  border: "1px solid #E2E8F0",
  borderRadius: 6,
  boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
  overflow: "hidden",
  minWidth: 200,
};

// ─────────────────────────────────────────────
// Plate thumbnail (table)
// ─────────────────────────────────────────────
const PlateThumbnail = ({ plate, isBolo }: { plate: string; isBolo: boolean }) => (
  <div style={{
    width: 56, height: 36, borderRadius: 4, flexShrink: 0,
    background: isBolo ? "#1a0606" : "#0f1923",
    border: `1.5px solid ${isBolo ? "#E7000B55" : "#334155"}`,
    display: "flex", alignItems: "center", justifyContent: "center",
    position: "relative", overflow: "hidden",
  }}>
    <span style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 9, fontWeight: 700, color: "#E2E8F0", letterSpacing: 1 }}>
      {plate}
    </span>
    {isBolo && <div style={{ position: "absolute", top: 2, right: 2, width: 6, height: 6, borderRadius: "50%", background: "#E7000B" }} />}
  </div>
);

// ─────────────────────────────────────────────
// Toolbar dropdown
// ─────────────────────────────────────────────
const Dropdown = ({ open, onToggle, label, icon: Icon, children, active, alignRight }: {
  open: boolean; onToggle: () => void; label: string;
  icon: React.ElementType; children: React.ReactNode;
  active?: boolean; alignRight?: boolean;
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!open) return;
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) onToggle(); };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [open, onToggle]);
  return (
    <div ref={ref} style={{ position: "relative" }}>
      <button onClick={onToggle} style={(active || open) ? activeBtnBase : btnBase}>
        <Icon size={12} />
        {label}
        <ChevronDown size={11} style={{ opacity: 0.6, transform: open ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
      </button>
      {open && (
        <div style={{ ...dropdownPanel, left: alignRight ? "auto" : 0, right: alignRight ? 0 : "auto" }}>
          {children}
        </div>
      )}
    </div>
  );
};

const DdItem = ({ onClick, active, children }: { onClick: () => void; active: boolean; children: React.ReactNode }) => (
  <div onClick={onClick}
    style={{
      display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
      fontSize: 12, fontFamily: "Inter, sans-serif",
      color: active ? teal : "#334155",
      background: active ? "#E5FFF9" : "transparent",
      fontWeight: active ? 600 : 400,
    }}
    onMouseEnter={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"; }}
    onMouseLeave={e => { if (!active) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
    {active ? <Check size={11} color={teal} /> : <span style={{ width: 11 }} />}
    {children}
  </div>
);

// ─────────────────────────────────────────────
// Column definitions
// ─────────────────────────────────────────────
const ROWS_PER_PAGE = 10;

const COL_DEFS = [
  { key: "image",       label: "Image",       w: 70,  always: true  },
  { key: "plateNumber", label: "Plate Number", w: 150, always: true  },
  { key: "timestamp",   label: "Timestamp",    w: 160, always: false },
  { key: "location",    label: "Location",     w: 180, always: false },
  { key: "camera",      label: "Camera",       w: 100, always: false },
  { key: "vehicleType", label: "Vehicle Type", w: 120, always: false },
  { key: "confidence",  label: "Confidence",   w: 100, always: false },
  { key: "actions",     label: "Actions",      w: 110, always: true  },
];

// ─────────────────────────────────────────────
// Main page
// ─────────────────────────────────────────────
type DialogType = "self-assign" | "assign-to" | "escalate" | "resolve" | null;

export const LicensePlates = () => {
  // ── Table filters / pagination ───────────────────────────────────────────
  const [search,     setSearch]     = useState("");
  const [camFilter,  setCamFilter]  = useState("All Cameras");
  const [typeFilter, setTypeFilter] = useState("All Types");
  const [boloOnly,   setBoloOnly]   = useState(false);
  const [sortKey,    setSortKey]    = useState("ts-desc");
  const [page,       setPage]       = useState(1);
  const [hoveredId,  setHoveredId]  = useState<string | null>(null);

  const [sortOpen, setSortOpen] = useState(false);
  const [camOpen,  setCamOpen]  = useState(false);
  const [typeOpen, setTypeOpen] = useState(false);
  const [colOpen,  setColOpen]  = useState(false);
  const closeAll = () => { setSortOpen(false); setCamOpen(false); setTypeOpen(false); setColOpen(false); };

  const [hiddenCols, setHiddenCols] = useState<Set<string>>(new Set());
  const toggleCol = (c: string) => setHiddenCols(p => { const n = new Set(p); n.has(c) ? n.delete(c) : n.add(c); return n; });

  // ── BOLO state ───────────────────────────────────────────────────────────
  const [boloAlerts, setBoloAlerts] = useState<BoloAlert[]>(INITIAL_BOLO);
  // Lifecycle records keyed by plate number
  const [boloLifecycle, setBoloLifecycle] = useState<Record<string, LifecycleRecord>>(() =>
    Object.fromEntries(INITIAL_BOLO.map(a => [a.plate, boloRecord(a.severity)]))
  );

  // Dialog state
  const [dialogType, setDialogType]   = useState<DialogType>(null);
  const [dialogPlate, setDialogPlate] = useState<string | null>(null);

  const openDialog = (plate: string, type: DialogType) => {
    setDialogPlate(plate);
    setDialogType(type);
  };
  const closeDialog = () => { setDialogType(null); setDialogPlate(null); };

  const activeBolos = boloAlerts.filter(a => !a.acknowledged);
  const unackedCount = activeBolos.length;

  // Lifecycle transitions
  const advanceStage = (plate: string, newStage: LifecycleStage, newAssignee?: string) => {
    setBoloLifecycle(prev => ({
      ...prev,
      [plate]: { ...prev[plate], stage: newStage, ...(newAssignee ? { assignee: newAssignee } : {}) },
    }));
  };

  const acknowledgeAlert = (plate: string) => {
    setBoloAlerts(prev => prev.map(a => a.plate === plate ? { ...a, acknowledged: true } : a));
  };

  // ── Table filtering ──────────────────────────────────────────────────────
  const hasActiveFilters = search || camFilter !== "All Cameras" || typeFilter !== "All Types" || boloOnly;
  const sortIsDefault = sortKey === "ts-desc";
  const currentSort = SORT_OPTIONS.find(o => o.key === sortKey) ?? SORT_OPTIONS[0];

  const filtered = useMemo(() => {
    let rows = PLATE_DATA.filter(r => {
      if (search     && !r.plateNumber.toLowerCase().includes(search.toLowerCase()) && !r.location.toLowerCase().includes(search.toLowerCase())) return false;
      if (camFilter  !== "All Cameras" && r.camera !== camFilter)  return false;
      if (typeFilter !== "All Types"   && r.vehicleType !== typeFilter) return false;
      if (boloOnly   && !r.isBolo) return false;
      return true;
    });
    switch (sortKey) {
      case "ts-asc":    rows = [...rows].sort((a, b) => a.id.localeCompare(b.id)); break;
      case "plate-asc": rows = [...rows].sort((a, b) => a.plateNumber.localeCompare(b.plateNumber)); break;
      case "conf-desc": rows = [...rows].sort((a, b) => b.confidence - a.confidence); break;
      case "bolo-first":rows = [...rows].sort((a, b) => (b.isBolo ? 1 : 0) - (a.isBolo ? 1 : 0)); break;
    }
    return rows;
  }, [search, camFilter, typeFilter, boloOnly, sortKey]);

  const totalPages  = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginated   = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const visibleCols = COL_DEFS.filter(c => c.always || !hiddenCols.has(c.key));

  const mono: React.CSSProperties  = { fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12 };
  const inter: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 12 };

  // Column picker checkbox
  const ChkBox = ({ checked }: { checked: boolean }) => (
    <div style={{
      width: 13, height: 13, borderRadius: 2, flexShrink: 0,
      border: `1.5px solid ${checked ? teal : "#CBD5E1"}`,
      background: checked ? teal : "transparent",
      display: "flex", alignItems: "center", justifyContent: "center",
    }}>
      {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </div>
  );

  // Active dialog's incident + plate ────────────────────────────────────────
  const dialogAlert   = dialogPlate ? boloAlerts.find(a => a.plate === dialogPlate) : null;
  const dialogIncident = dialogAlert ? boloToIncident(dialogAlert, boloAlerts.indexOf(dialogAlert)) : null;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500"
      style={{ display: "flex", flexDirection: "column", gap: 0, height: "100%", minHeight: 0 }}>

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div style={{ paddingBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 36, height: 36, borderRadius: 8, background: "#E5FFF9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CarFront size={18} color={teal} />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, color: "#0F172A", fontFamily: "Inter, sans-serif", margin: 0, lineHeight: 1.2 }}>
              License Plate Recognition
            </h1>
            <p style={{ fontSize: 12, color: "#64748B", fontFamily: "Inter, sans-serif", margin: "2px 0 0" }}>
              Search and trace vehicle movements by license plate
            </p>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          {unackedCount > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", background: "#FFE5E7", border: "1px solid #E7000B44", borderRadius: 6 }}>
              <AlertTriangle size={13} color="#E7000B" />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#E7000B", fontFamily: "Inter, sans-serif" }}>{unackedCount} BOLO Active</span>
            </div>
          )}
          <button style={{
            display: "flex", alignItems: "center", gap: 6, padding: "7px 14px",
            background: teal, border: "none", borderRadius: 6, cursor: "pointer",
            fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: "#fff",
          }}>
            + Add BOLO Plate
          </button>
        </div>
      </div>

      {/* ── Stats row ────────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexShrink: 0 }}>
        {[
          { label: "Total Reads",    value: PLATE_DATA.length,                        color: "#0F172A" },
          { label: "BOLO Matches",   value: PLATE_DATA.filter(p => p.isBolo).length,  color: "#E7000B" },
          { label: "Active Alerts",  value: unackedCount,                              color: "#EA580C" },
          { label: "Cameras Online", value: 9,                                         color: "#00A63E" },
        ].map(s => (
          <div key={s.label} style={{ flex: 1, background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, padding: "12px 16px" }}>
            <div style={{ fontSize: 24, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: s.color, lineHeight: 1, marginBottom: 3 }}>{s.value}</div>
            <div style={{ fontSize: 11, color: "#64748B", fontFamily: "Inter, sans-serif" }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* ── Active BOLO Alerts ─────────────────────────────────────────────── */}
      {activeBolos.length > 0 && (
        <div style={{ marginBottom: 16, flexShrink: 0 }}>
          {/* Section header */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
            <div style={{ width: 26, height: 26, borderRadius: 6, background: "#FFE5E7", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={13} color="#E7000B" />
            </div>
            <span style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "Inter, sans-serif" }}>Active BOLO Alerts</span>
            <span style={{ fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", background: "#E7000B", color: "#fff", padding: "2px 8px", borderRadius: 10 }}>
              {activeBolos.length}
            </span>
          </div>
          {/* Subtitle below the heading */}
          <p style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif", margin: "0 0 10px 34px" }}>
            Be On the Look Out — unacknowledged vehicle detections requiring response
          </p>

          {/* Horizontal scroll row — using exact IncidentCard2 */}
          <div style={{ display: "flex", gap: 12, overflowX: "auto", paddingBottom: 6 }}
            className="no-scrollbar">
            {boloAlerts.map((alert, idx) => {
              if (alert.acknowledged) return null;
              const incident = boloToIncident(alert, idx);
              const record   = boloLifecycle[alert.plate] ?? boloRecord(alert.severity);
              return (
                <IncidentCard2
                  key={alert.plate}
                  incident={incident}
                  record={record}
                  onCardClick={() => {}}
                  onSelfAssign={() => openDialog(alert.plate, "self-assign")}
                  onAssignTo={() => openDialog(alert.plate, "assign-to")}
                  onEscalate={() => openDialog(alert.plate, "escalate")}
                  onResolve={() => openDialog(alert.plate, "resolve")}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* ── License Plate Feed ────────────────────────────────────────────── */}
      <div style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column", background: "#fff", border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>

        {/* ── Toolbar (exact V2_3Content style) ────────────────────────────── */}
        <div style={{
          display: "flex", alignItems: "flex-end", gap: 12,
          padding: "10px 16px",
          backgroundColor: "#fff",
          borderBottom: `2px solid ${teal}`,
          paddingBottom: 10,
          flexShrink: 0,
        }}>
          {/* Search — underline only, no box border */}
          <div style={{ position: "relative", width: 240, flexShrink: 0 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search plate or location…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{
                width: "100%", height: 32, paddingLeft: 34, paddingRight: search ? 28 : 4,
                fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1E293B",
                backgroundColor: "transparent", border: "none",
                borderBottom: "2px solid #E2E8F0",
                borderRadius: 0, outline: "none",
                transition: "border-bottom-color 200ms ease",
              }}
              onFocus={e => { e.target.style.borderBottomColor = teal; }}
              onBlur={e  => { e.target.style.borderBottomColor = "#E2E8F0"; }}
            />
            {search && (
              <button onClick={() => { setSearch(""); setPage(1); }}
                style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {/* Sort */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { closeAll(); setSortOpen(o => !o); }} style={!sortIsDefault ? activeBtnBase : btnBase}>
              <SlidersHorizontal style={{ width: 12, height: 12 }} />
              {sortIsDefault ? "Sort" : currentSort.label}
            </button>
            {sortOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} />
                <div style={{ ...dropdownPanel, left: 0, right: "auto", minWidth: 220 }}>
                  {SORT_OPTIONS.map(opt => (
                    <DdItem key={opt.key} onClick={() => { setSortKey(opt.key); setSortOpen(false); }} active={sortKey === opt.key}>
                      {opt.label}
                    </DdItem>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Columns */}
          <div style={{ position: "relative" }}>
            <button onClick={() => { closeAll(); setColOpen(o => !o); }} style={hiddenCols.size > 0 ? activeBtnBase : btnBase}>
              <Columns3 style={{ width: 12, height: 12 }} />
              Columns{hiddenCols.size > 0 ? ` (${COL_DEFS.length - hiddenCols.size}/${COL_DEFS.length})` : ""}
            </button>
            {colOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setColOpen(false)} />
                <div style={{ ...dropdownPanel, left: 0, right: "auto" }}>
                  <div style={{ padding: "8px 12px 4px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
                    Toggle Columns
                  </div>
                  {COL_DEFS.filter(c => !c.always).map(col => {
                    const vis = !hiddenCols.has(col.key);
                    return (
                      <div key={col.key} onClick={() => toggleCol(col.key)}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
                          fontSize: 12, fontFamily: "Inter, sans-serif",
                          color: vis ? teal : "#334155",
                          background: vis ? "rgba(0,119,91,0.05)" : "transparent",
                        }}
                        onMouseEnter={e => { if (!vis) (e.currentTarget as HTMLDivElement).style.background = "#F8FAFC"; }}
                        onMouseLeave={e => { if (!vis) (e.currentTarget as HTMLDivElement).style.background = "transparent"; }}>
                        <ChkBox checked={vis} />
                        <span style={{ flex: 1 }}>{col.label}</span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Right cluster */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 12 }}>
            {/* Clear */}
            <button
              onClick={() => { setSearch(""); setCamFilter("All Cameras"); setTypeFilter("All Types"); setBoloOnly(false); setSortKey("ts-desc"); setPage(1); }}
              style={{ ...btnBase, visibility: hasActiveFilters ? "visible" : "hidden", color: "#E7000B", borderBottomColor: "#E7000B", gap: 4 }}>
              <X style={{ width: 12, height: 12 }} /> Clear
            </button>

            {/* Camera filter */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { closeAll(); setCamOpen(o => !o); }}
                style={{ ...(camFilter !== "All Cameras" ? activeBtnBase : btnBase), minWidth: 90, overflow: "hidden" }}>
                <Camera style={{ width: 12, height: 12, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {camFilter === "All Cameras" ? "Camera" : camFilter}
                </span>
              </button>
              {camOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setCamOpen(false)} />
                  <div style={{ ...dropdownPanel, maxHeight: 260, overflowY: "auto" }}>
                    {CAMERAS.map(c => (
                      <DdItem key={c} onClick={() => { setCamFilter(c); setCamOpen(false); setPage(1); }} active={camFilter === c}>{c}</DdItem>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Vehicle type filter */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { closeAll(); setTypeOpen(o => !o); }}
                style={{ ...(typeFilter !== "All Types" ? activeBtnBase : btnBase), minWidth: 90, overflow: "hidden" }}>
                <Car style={{ width: 12, height: 12, flexShrink: 0 }} />
                <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {typeFilter === "All Types" ? "Vehicle" : typeFilter}
                </span>
              </button>
              {typeOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setTypeOpen(false)} />
                  <div style={{ ...dropdownPanel, maxHeight: 260, overflowY: "auto" }}>
                    {VEHICLE_TYPES.map(t => (
                      <DdItem key={t} onClick={() => { setTypeFilter(t); setTypeOpen(false); setPage(1); }} active={typeFilter === t}>{t}</DdItem>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* BOLO Only */}
            <button
              onClick={() => { setBoloOnly(v => !v); setPage(1); }}
              style={{
                ...btnBase,
                color: boloOnly ? "#E7000B" : "#64748B",
                borderBottomColor: boloOnly ? "#E7000B" : "transparent",
              }}>
              <Shield style={{ width: 12, height: 12 }} />
              BOLO Only
              {boloOnly && (
                <span style={{ fontSize: 10, fontWeight: 800, fontFamily: "'JetBrains Mono',monospace", background: "#E7000B", color: "#fff", padding: "0 5px", borderRadius: 8, lineHeight: "16px" }}>
                  {PLATE_DATA.filter(p => p.isBolo).length}
                </span>
              )}
            </button>

            {/* Export */}
            <button style={{
              display: "flex", alignItems: "center", gap: 5, padding: "4px 10px",
              background: "none", border: "1px solid #E2E8F0", borderRadius: 5,
              cursor: "pointer", fontSize: 11, fontWeight: 600,
              color: "#64748B", fontFamily: "Inter, sans-serif",
            }}>
              <Download size={11} /> Export
            </button>
          </div>
        </div>

        {/* ── Table ───────────────────────────────────────────────────────── */}
        <div style={{ overflowX: "auto", flex: 1, overflowY: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead style={{ position: "sticky", top: 0, zIndex: 2 }}>
              <tr style={{ height: 44, background: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                {visibleCols.map(col => (
                  <th key={col.key} style={{
                    width: col.w, padding: "0 14px", textAlign: "left",
                    fontSize: 12, fontWeight: 700, letterSpacing: "0.05em",
                    textTransform: "uppercase", color: "#1E293B",
                    fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
                    background: "#F8FAFC",
                  }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.map((row, idx) => {
                const hovered = hoveredId === row.id;
                const rowBg   = row.isBolo
                  ? (hovered ? "#FFF0F0" : idx % 2 === 1 ? "#FFF8F8" : "#fff")
                  : (hovered ? "#EBF5F1" : idx % 2 === 1 ? "#F8FDFC" : "#fff");
                return (
                  <tr key={row.id}
                    onMouseEnter={() => setHoveredId(row.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    style={{ background: rowBg, borderBottom: "1px solid #F1F5F9", transition: "background 80ms" }}>
                    {visibleCols.map(col => (
                      <td key={col.key} style={{ padding: "8px 14px", verticalAlign: "middle" }}>
                        {col.key === "image" && <PlateThumbnail plate={row.plateNumber} isBolo={row.isBolo} />}
                        {col.key === "plateNumber" && (
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ ...mono, fontWeight: 700, color: row.isBolo ? "#E7000B" : "#0F172A", fontSize: 13 }}>{row.plateNumber}</span>
                            {row.isBolo && (
                              <span style={{ fontSize: 8, fontWeight: 800, fontFamily: "Inter,sans-serif", letterSpacing: "0.06em", textTransform: "uppercase", color: "#E7000B", background: "#FFE5E7", padding: "1px 5px", borderRadius: 3 }}>BOLO</span>
                            )}
                          </div>
                        )}
                        {col.key === "timestamp"   && <span style={{ ...mono, color: "#475569" }}>{row.timestamp}</span>}
                        {col.key === "location"    && <span style={{ ...inter, color: "#334155", fontWeight: 500 }}>{row.location}</span>}
                        {col.key === "camera"      && <span style={{ ...mono, color: "#64748B" }}>{row.camera}</span>}
                        {col.key === "vehicleType" && <span style={{ ...inter, color: "#475569" }}>{row.vehicleType}</span>}
                        {col.key === "confidence"  && (
                          <span style={{ ...mono, fontWeight: 700, color: CONF_COLOR(row.confidence) }}>{row.confidence}%</span>
                        )}
                        {col.key === "actions" && (
                          <button style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: "none", border: "1px solid #E2E8F0", borderRadius: 5, cursor: "pointer", fontSize: 11, fontWeight: 600, color: "#475569", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
                            <RefreshCw size={10} /> Trace Path
                          </button>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr>
                  <td colSpan={visibleCols.length} style={{ padding: "48px 16px", textAlign: "center", color: "#94A3B8", fontFamily: "Inter, sans-serif", fontSize: 13 }}>
                    No records match your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: "1px solid #F1F5F9", flexShrink: 0 }}>
          <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
            Showing {filtered.length === 0 ? 0 : Math.min((page - 1) * ROWS_PER_PAGE + 1, filtered.length)}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E2E8F0", borderRadius: 4, background: "none", cursor: page === 1 ? "not-allowed" : "pointer", opacity: page === 1 ? 0.35 : 1 }}>
              <ChevronLeft size={13} color="#475569" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter(p => Math.abs(p - page) <= 2)
              .map(p => (
                <button key={p} onClick={() => setPage(p)} style={{
                  width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
                  border: "1px solid #E2E8F0", borderRadius: 4, fontSize: 11, fontWeight: p === page ? 700 : 500,
                  fontFamily: "'JetBrains Mono', monospace", cursor: "pointer",
                  background: p === page ? teal : "none",
                  color: p === page ? "#fff" : "#475569",
                  borderColor: p === page ? teal : "#E2E8F0",
                }}>{p}</button>
              ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages || totalPages === 0}
              style={{ width: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid #E2E8F0", borderRadius: 4, background: "none", cursor: (page === totalPages || totalPages === 0) ? "not-allowed" : "pointer", opacity: (page === totalPages || totalPages === 0) ? 0.35 : 1 }}>
              <ChevronRight size={13} color="#475569" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Lifecycle Dialogs ─────────────────────────────────────────────── */}
      {dialogIncident && dialogPlate && (
        <>
          {dialogType === "self-assign" && (
            <SelfAssignDialog
              incident={dialogIncident}
              onConfirm={() => {
                advanceStage(dialogPlate, "in_progress", "You");
              }}
              onCancel={closeDialog}
            />
          )}
          {dialogType === "assign-to" && (
            <AssignToDialog
              incident={dialogIncident}
              onConfirm={(name) => {
                advanceStage(dialogPlate, "in_progress", name);
                closeDialog();
              }}
              onCancel={closeDialog}
            />
          )}
          {dialogType === "escalate" && (
            <EscalateConfirmDialog
              incident={dialogIncident}
              onConfirm={(manager) => {
                advanceStage(dialogPlate, "escalated", manager);
                closeDialog();
              }}
              onCancel={closeDialog}
            />
          )}
          {dialogType === "resolve" && (
            <ResolveDialog
              incident={dialogIncident}
              onConfirm={() => {
                acknowledgeAlert(dialogPlate);
                closeDialog();
              }}
              onCancel={closeDialog}
            />
          )}
        </>
      )}
    </div>
  );
};
