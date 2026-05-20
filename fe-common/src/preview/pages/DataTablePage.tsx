// ══════════════════════════════════════════════════════════════════════════════
//  DataTable — v2.3 Command Grid (exact copy from analytics Component Library)
//  Gmail-style multi-select · row accordion · column picker · sticky ID
//  sliding-window pagination · decoupled sandbox controls
// ══════════════════════════════════════════════════════════════════════════════
import { useState } from "react";
import {
  Layers,
  CheckCircle2,
  Eye,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  Download,
  UserPlus,
  Trash2,
  ChevronsLeft,
  ChevronsRight,
  ChevronUp,
  Columns3,
  Sun,
  Moon,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GridRow {
  id: string;
  status: string;
  event: string;
  zone: string;
  camera: string;
  confidence: number;
  timestamp: string;
  priority?: string;
  assignee?: string;
  duration?: string;
  riskScore?: number;
}

// ─── Shared colour tokens ─────────────────────────────────────────────────────

const SEVERITY_COLORS: Record<string, string> = {
  critical: "#E7000B",
  warning:  "#EA580C",
  stable:   "#00A63E",
  success:  "#00A63E",
  info:     "#2B7FFF",
  resolved: "#64748B",
  medium:   "#E19A04",
  high:     "#EA580C",
  low:      "#2B7FFF",
};

const ELECTRIC_COLORS: Record<string, string> = {
  critical: "#FF3131",
  warning:  "#FF6B35",
  stable:   "#4ADE80",
  success:  "#4ADE80",
  info:     "#60A5FA",
  resolved: "#6B7280",
  medium:   "#FBBF24",
  high:     "#FF6B35",
  low:      "#60A5FA",
};

const V21_STATUS_CFG: Record<string, { label: string; bg: string }> = {
  critical: { label: "Critical", bg: "#E7000B" },
  warning:  { label: "Warning",  bg: "#EA580C" },
  stable:   { label: "Stable",   bg: "#00A63E" },
  success:  { label: "Success",  bg: "#00A63E" },
  info:     { label: "Info",     bg: "#2B7FFF" },
  resolved: { label: "Resolved", bg: "#475569" },
  medium:   { label: "Medium",   bg: "#E19A04" },
  high:     { label: "High",     bg: "#EA580C" },
  low:      { label: "Low",      bg: "#2B7FFF" },
};

const SEVERITY_ORDER_V22: Record<string, number> = {
  critical: 0, high: 1, warning: 2, medium: 3, info: 4, low: 4, stable: 5, resolved: 6, success: 6,
};

// Statuses in severity order
const ALL_STATUSES_V22 = ["critical", "high", "warning", "medium", "info", "low", "stable", "resolved"];

const SORT_OPTIONS_V22: { key: string; label: string; shortLabel: string }[] = [
  { key: "timestamp-desc",  label: "Time: Newest First",       shortLabel: "Time ↓"  },
  { key: "timestamp-asc",   label: "Time: Oldest First",       shortLabel: "Time ↑"  },
  { key: "confidence-desc", label: "Confidence: High → Low",   shortLabel: "Conf ↓"  },
  { key: "confidence-asc",  label: "Confidence: Low → High",   shortLabel: "Conf ↑"  },
  { key: "id-asc",          label: "ID: A → Z",                shortLabel: "ID ↑"    },
  { key: "id-desc",         label: "ID: Z → A",                shortLabel: "ID ↓"    },
  { key: "severity-asc",    label: "Severity: Critical First", shortLabel: "Sev ↓"   },
  { key: "severity-desc",   label: "Severity: Low First",      shortLabel: "Sev ↑"   },
];

// ─── Shared helper components ─────────────────────────────────────────────────

const SectionHeader = ({
  icon: Icon,
  title,
  description,
  isDark,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  isDark: boolean;
}) => (
  <div className="flex items-start gap-3 mb-5">
    <div
      className="w-8 h-8 rounded-[4px] flex items-center justify-center flex-shrink-0 mt-0.5"
      style={{ backgroundColor: isDark ? "rgba(0,149,109,0.15)" : "#E5FFF9" }}
    >
      <Icon className="w-4 h-4" style={{ color: isDark ? "#00956D" : "#00775B" }} />
    </div>
    <div>
      <h2
        className="text-[13px] font-bold uppercase tracking-[0.6px]"
        style={{ color: isDark ? "#E2E8F0" : "#0f172a" }}
      >
        {title}
      </h2>
      <p className="text-[12px] mt-0.5" style={{ color: isDark ? "#64748B" : "#64748b" }}>
        {description}
      </p>
    </div>
  </div>
);

const SpecChip = ({ label, value, isDark }: { label: string; value: string; isDark: boolean }) => (
  <div
    className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[11px]"
    style={{
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
      border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
    }}
  >
    <span style={{ color: isDark ? "#475569" : "#94a3b8", fontWeight: 500 }}>{label}:</span>
    <span className="font-mono" style={{ color: isDark ? "#9CA3AF" : "#334155", fontWeight: 600 }}>{value}</span>
  </div>
);

const Annotation = ({ children, isDark }: { children: React.ReactNode; isDark: boolean }) => (
  <div className="flex items-center gap-1.5 text-[11px]" style={{ color: isDark ? "#475569" : "#64748b" }}>
    <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? "#00956D" : "#00775B" }} />
    {children}
  </div>
);

// ── 110-row dataset ───────────────────────────────────────────────────────────
const V23_GRID_DATA: GridRow[] = (() => {
  const events = [
    "Hardhat Missing","Safety Zone Breach","PPE Compliant Check","Crowd Density Alert",
    "Restricted Area Intrusion","Spill Detected","Vest Missing","Queue Length Exceeded",
    "Fire Hazard Detected","Forklift Proximity Alert","Visitor Badge Missing",
    "Equipment Obstruction","No Safety Harness","Unauthorised Vehicle Entry",
    "Loitering Detected","Chemical Leak Proximity","Excessive Speed Detected",
    "Tailgating Incident","Manual Handling Risk","Near-Miss Logged",
  ];
  const zones = [
    "Loading Dock A","Assembly Line 2","Warehouse B","Exit Gate 3","Server Room",
    "Kitchen Area","Loading Dock B","Main Entrance","Boiler Room","Warehouse A",
    "Assembly Line 1","Reception","Loading Bay","Roof Access","Parking Zone B",
    "Shift Handover","Hazmat Zone","Exit Corridor A","Access Gate 1","Control Room",
    "Production Floor","Warehouse C","Assembly Line 3",
  ];
  const statuses = [
    "critical","warning","stable","info","resolved","critical","warning",
    "info","high","low","medium","resolved","critical","warning","stable",
  ];
  const baseConfs  = [97.3,84.1,99.7,76.2,92.8,88.5,95.1,71.4,98.2,89.4,100.0,68.9,91.3,96.7,77.6];
  const priorities = ["High","Medium","Low","High","Medium","Low","High","Medium","Low","Medium","Low","High","Medium","Low","Medium"];
  const assignees  = ["A. Kumar","M. Singh","R. Patel","S. Sharma","N. Verma","K. Das","P. Nair","V. Rao","J. Mehta","D. Gupta"];
  const durations  = ["0h 12m","0h 34m","1h 05m","2h 17m","0h 48m","3h 22m","1h 41m","0h 27m","4h 09m","1h 55m"];
  const riskScores = [92,74,45,83,61,29,77,56,88,39,68,95,52,71,33];
  const rows: GridRow[] = [];
  for (let i = 0; i < 110; i++) {
    const num = 5110 - i;
    const dayOffset = Math.floor(i / 22);
    const day = 28 - dayOffset;
    const h = 23 - (i % 23);
    const m = (i * 11) % 60;
    rows.push({
      id: `INC-0${num}`,
      status: statuses[i % statuses.length],
      event: events[i % events.length],
      zone: zones[i % zones.length],
      camera: `CAM-${String((i % 38) + 1).padStart(2, "0")}`,
      confidence: Math.max(60, +(baseConfs[i % baseConfs.length] - (i % 7) * 0.4).toFixed(1)),
      timestamp: `2026-04-${String(Math.max(1, day)).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      priority:  priorities[i % priorities.length],
      assignee:  assignees[i % assignees.length],
      duration:  durations[i % durations.length],
      riskScore: riskScores[i % riskScores.length],
    });
  }
  return rows;
})();

// ── Sub-event data (accordion sub-table content) ──────────────────────────────
type V23SubRow = { id: string; event: string; camera: string; confidence: number; timestamp: string };
const V23_SUB_DATA: Record<string, V23SubRow[]> = {};
V23_GRID_DATA.slice(0, 30).forEach((row) => {
  const subEvents = ["Pre-event Motion Detected", "Sensor Threshold Breach", "Camera Zone Alert"];
  V23_SUB_DATA[row.id] = subEvents.map((ev, j) => ({
    id: `${row.id}-S${j + 1}`,
    event: ev,
    camera: row.camera,
    confidence: Math.max(50, +(row.confidence - (j + 1) * 5.2).toFixed(1)),
    timestamp: row.timestamp,
  }));
});

// ── Column definitions (hideable scrollable cols) ─────────────────────────────
const V23_COL_DEFS = [
  { key: "status",      label: "Status",      minWidth: 120 },
  { key: "event",       label: "Event Type",  minWidth: 220 },
  { key: "zone",        label: "Zone",        minWidth: 170 },
  { key: "camera",      label: "Camera",      minWidth: 90  },
  { key: "confidence",  label: "Conf.",       minWidth: 80  },
  { key: "timestamp",   label: "Timestamp",   minWidth: 180 },
  { key: "priority",    label: "Priority",    minWidth: 100 },
  { key: "assignee",    label: "Assignee",    minWidth: 140 },
  { key: "duration",    label: "Duration",    minWidth: 100 },
  { key: "riskScore",   label: "Risk Score",  minWidth: 100 },
] as const;
type V23ColKey = typeof V23_COL_DEFS[number]["key"];

// ── Unique filter values for v2.3 dataset ────────────────────────────────────
const ALL_EVENTS_V23 = [...new Set(V23_GRID_DATA.map((r) => r.event))].sort();
const ALL_ZONES_V23  = [...new Set(V23_GRID_DATA.map((r) => r.zone))].sort();

// ── Smart pagination: sliding window of 5 ────────────────────────────────────
function v23PagWindow(page: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, page - 2);
  const end   = Math.min(total, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ── Inline JSON syntax highlighter ───────────────────────────────────────────
const V23JsonView = ({ row }: { row: GridRow }) => {
  const json = JSON.stringify({
    incident_id: row.id,
    severity: row.status,
    event_type: row.event,
    location: { zone: row.zone, camera: row.camera },
    confidence_pct: row.confidence,
    detected_at: row.timestamp,
    metadata: {
      response_required: row.status === "critical" || row.status === "high" || row.status === "warning",
      ai_model: "matrice-vision-v3.2",
      processing_ms: Math.floor(row.confidence * 0.8),
      frame_id: `F-${row.id.replace("INC-0", "")}`,
    },
  }, null, 2);

  const tokens = json.split(/("(?:[^"\\]|\\.)*"\s*:?|true|false|null|\b\d+\.?\d*\b)/g);
  return (
    <pre style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
      fontSize: 12, lineHeight: 1.7, margin: 0,
      padding: "16px 20px", backgroundColor: "#0D1117", color: "#8B949E",
      overflowX: "auto", whiteSpace: "pre",
    }}>
      {tokens.map((t, i) => {
        if (/"[^"]*"\s*:/.test(t)) return <span key={i} style={{ color: "#79C0FF" }}>{t}</span>;
        if (/^"[^"]*"$/.test(t))   return <span key={i} style={{ color: "#A5D6FF" }}>{t}</span>;
        if (t === "true")           return <span key={i} style={{ color: "#7EE787" }}>{t}</span>;
        if (t === "false")          return <span key={i} style={{ color: "#FF7B72" }}>{t}</span>;
        if (t === "null")           return <span key={i} style={{ color: "#C9D1D9" }}>{t}</span>;
        if (/^\d/.test(t))          return <span key={i} style={{ color: "#FFA657" }}>{t}</span>;
        return <span key={i}>{t}</span>;
      })}
    </pre>
  );
};

// ── v2.3 Status Pill ──────────────────────────────────────────────────────────
const V23Pill = ({ status, isDark }: { status: string; isDark: boolean }) => {
  const key = status.toLowerCase();
  const bg = isDark ? (ELECTRIC_COLORS[key] ?? "#6B7280") : (SEVERITY_COLORS[key] ?? "#64748B");
  const label = V21_STATUS_CFG[key]?.label ?? status;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px",
      borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", color: "#ffffff", backgroundColor: bg,
      fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
    }}>{label}</span>
  );
};

// ── Row checkbox atom ─────────────────────────────────────────────────────────
const V23Checkbox = ({
  checked, indeterminate = false, onChange, isDark,
}: { checked: boolean; indeterminate?: boolean; onChange: () => void; isDark: boolean }) => {
  const active = checked || indeterminate;
  const teal = isDark ? "#00956D" : "#00775B";
  return (
    <button onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{
        width: 15, height: 15, flexShrink: 0, borderRadius: 3,
        border: `1.5px solid ${active ? teal : (isDark ? "#475569" : "#CBD5E1")}`,
        backgroundColor: active ? teal : "transparent",
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        cursor: "pointer", transition: "all 100ms ease", padding: 0,
      }}
    >
      {indeterminate && !checked && (
        <svg width="7" height="2" viewBox="0 0 7 2" fill="none">
          <rect x="0" y="0.5" width="7" height="1" rx="0.5" fill="white" />
        </svg>
      )}
      {checked && (
        <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
          <path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
};

// ── Mini toggle ───────────────────────────────────────────────────────────────
const V23Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!checked)}
    style={{
      position: "relative", flexShrink: 0, borderRadius: 9999,
      width: 32, height: 18, cursor: "pointer", border: "none",
      backgroundColor: checked ? "#00775B" : "#CBD5E1",
      transition: "background-color 200ms ease",
    }}
  >
    <span style={{
      position: "absolute", top: 2, width: 14, height: 14,
      backgroundColor: "#fff", borderRadius: "50%",
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
      left: checked ? "calc(100% - 16px)" : 2,
      transition: "left 200ms ease",
    }} />
  </button>
);

const ROWS_PER_PAGE_V23 = 10;

// ── Main v2.3 component ───────────────────────────────────────────────────────
const V2_3Content = ({ isDark }: { isDark: boolean }) => {
  // ── Sandbox feature toggles ──────────────────────────────────────────────────
  const [selectionMode,  setSelectionMode]  = useState(true);
  const [expandableRows, setExpandableRows] = useState(true);
  const [stickyCol,      setStickyCol]      = useState(true);
  const [hScroll,        setHScroll]        = useState(true);
  const [expandContent,  setExpandContent]  = useState<"json" | "table">("json");

  // ── Row selection ────────────────────────────────────────────────────────────
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // ── Accordion ────────────────────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // ── Column visibility ────────────────────────────────────────────────────────
  const [hiddenCols,    setHiddenCols]    = useState<Set<V23ColKey>>(new Set());
  const [colPickerOpen, setColPickerOpen] = useState(false);

  // ── Toolbar dropdowns ────────────────────────────────────────────────────────
  const [sortKey,  setSortKey]  = useState("timestamp-desc");
  const [sortOpen, setSortOpen] = useState(false);
  const [sevOpen,  setSevOpen]  = useState(false);
  const [appOpen,  setAppOpen]  = useState(false);
  const [zoneOpen, setZoneOpen] = useState(false);

  // ── Filters ──────────────────────────────────────────────────────────────────
  const [searchQ,       setSearchQ]       = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [appFilters,    setAppFilters]    = useState<Set<string>>(new Set());
  const [zoneFilters,   setZoneFilters]   = useState<Set<string>>(new Set());
  const [page,          setPage]          = useState(1);

  const closeAllDropdowns = () => { setSortOpen(false); setSevOpen(false); setAppOpen(false); setZoneOpen(false); setColPickerOpen(false); };
  const hasActiveFilters  = searchQ !== "" || statusFilters.size > 0 || appFilters.size > 0 || zoneFilters.size > 0;
  const clearFilters = () => { setSearchQ(""); setStatusFilters(new Set()); setAppFilters(new Set()); setZoneFilters(new Set()); setPage(1); };

  const toggleStatus = (s: string) => { setStatusFilters(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; }); setPage(1); };
  const toggleApp    = (a: string) => { setAppFilters(p    => { const n = new Set(p); n.has(a) ? n.delete(a) : n.add(a); return n; }); setPage(1); };
  const toggleZone   = (z: string) => { setZoneFilters(p   => { const n = new Set(p); n.has(z) ? n.delete(z) : n.add(z); return n; }); setPage(1); };

  const currentSortOpt = SORT_OPTIONS_V22.find(o => o.key === sortKey) ?? SORT_OPTIONS_V22[0];
  const sortIsDefault  = sortKey === "timestamp-desc";

  // ── Derived data ─────────────────────────────────────────────────────────────
  const filteredData = V23_GRID_DATA
    .filter(r => {
      if (searchQ && ![r.id, r.event, r.zone].some(f => f.toLowerCase().includes(searchQ.toLowerCase()))) return false;
      if (statusFilters.size > 0 && !statusFilters.has(r.status)) return false;
      if (appFilters.size    > 0 && !appFilters.has(r.event))     return false;
      if (zoneFilters.size   > 0 && !zoneFilters.has(r.zone))     return false;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "confidence-desc") return b.confidence - a.confidence;
      if (sortKey === "confidence-asc")  return a.confidence - b.confidence;
      if (sortKey === "id-asc")          return a.id.localeCompare(b.id);
      if (sortKey === "id-desc")         return b.id.localeCompare(a.id);
      if (sortKey === "severity-asc")    return (SEVERITY_ORDER_V22[a.status] ?? 7) - (SEVERITY_ORDER_V22[b.status] ?? 7);
      if (sortKey === "severity-desc")   return (SEVERITY_ORDER_V22[b.status] ?? 7) - (SEVERITY_ORDER_V22[a.status] ?? 7);
      if (sortKey === "timestamp-asc")   return a.timestamp.localeCompare(b.timestamp);
      return b.timestamp.localeCompare(a.timestamp);
    });

  const totalPages    = Math.ceil(filteredData.length / ROWS_PER_PAGE_V23);
  const paginatedData = filteredData.slice((page - 1) * ROWS_PER_PAGE_V23, page * ROWS_PER_PAGE_V23);
  const pagWindow     = v23PagWindow(page, totalPages);

  // ── Selection helpers ────────────────────────────────────────────────────────
  const pageIds      = paginatedData.map(r => r.id);
  const pageSelected = pageIds.filter(id => selectedIds.has(id));
  const allPageSel   = pageIds.length > 0 && pageSelected.length === pageIds.length;
  const someSel      = pageSelected.length > 0 && !allPageSel;
  const selCount     = selectedIds.size;
  const toggleRowSel  = (id: string) => setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const togglePageAll = () => {
    if (allPageSel) setSelectedIds(p => { const n = new Set(p); pageIds.forEach(id => n.delete(id)); return n; });
    else            setSelectedIds(p => { const n = new Set(p); pageIds.forEach(id => n.add(id));    return n; });
  };

  // ── Column layout helpers ────────────────────────────────────────────────────
  const visibleCols = V23_COL_DEFS.filter(c => !hiddenCols.has(c.key));
  const scrollColW  = visibleCols.reduce((s, c) => s + c.minWidth, 0);
  const stickyW     = (selectionMode ? 44 : 0) + 160;
  const totalMinW   = stickyW + scrollColW;

  // ── Colour tokens ────────────────────────────────────────────────────────────
  const teal    = isDark ? "#00956D" : "#00775B";
  const sec     = isDark ? "#94A3B8" : "#64748B";
  const surface = isDark ? "#0F172A" : "#ffffff";
  const hdr     = isDark ? "#0A0F1A" : "#F8FAFC";

  // ── Shared style factories ────────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    background: "transparent", border: "none", borderBottom: "2px solid transparent",
    borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    color: isDark ? "#4B5563" : "#64748B", padding: "4px 2px",
    transition: "color 150ms ease, border-bottom-color 150ms ease", whiteSpace: "nowrap",
  };
  const activeBtnBase: React.CSSProperties = { ...btnBase, color: teal, borderBottomColor: teal };
  const dropdownPanel: React.CSSProperties = {
    position: "absolute", zIndex: 50, top: "calc(100% + 8px)",
    backgroundColor: isDark ? "#1E293B" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
    borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
  };
  const ddItem = (active: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
    backgroundColor: active ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent",
    fontSize: 12, fontWeight: active ? 600 : 500, fontFamily: "Inter, sans-serif",
    color: active ? teal : (isDark ? "#CBD5E1" : "#334155"),
    transition: "background-color 100ms ease",
  });

  // ── Inline checkbox (filter dropdowns) ───────────────────────────────────────
  const ChkBox = ({ checked }: { checked: boolean }) => (
    <span style={{
      width: 13, height: 13, flexShrink: 0, borderRadius: 2, display: "inline-flex",
      alignItems: "center", justifyContent: "center", transition: "all 100ms ease",
      border: `1.5px solid ${checked ? teal : (isDark ? "#475569" : "#CBD5E1")}`,
      backgroundColor: checked ? teal : "transparent",
    }}>
      {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );

  // ── Filter labels ─────────────────────────────────────────────────────────────
  const sevLabel  = statusFilters.size === 0 ? "Severity"
    : statusFilters.size === 1 ? (V21_STATUS_CFG[[...statusFilters][0]]?.label ?? [...statusFilters][0])
    : `${statusFilters.size} Severities`;
  const appLabel  = appFilters.size === 0 ? "Events"
    : appFilters.size === 1 ? ([...appFilters][0].length > 16 ? [...appFilters][0].slice(0, 16) + "…" : [...appFilters][0])
    : `${appFilters.size} Events`;
  const zoneLabel = zoneFilters.size === 0 ? "Zones"
    : zoneFilters.size === 1 ? [...zoneFilters][0]
    : `${zoneFilters.size} Zones`;

  // ── Cell renderer ─────────────────────────────────────────────────────────────
  const renderCell = (key: V23ColKey, row: GridRow, hovered: boolean) => {
    const mono: React.CSSProperties  = { fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, fontWeight: 500, color: hovered ? (isDark ? "#E2E8F0" : "#0F172A") : sec };
    const inter: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 12, color: hovered ? (isDark ? "#E2E8F0" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155") };
    switch (key) {
      case "status":     return <V23Pill status={row.status} isDark={isDark} />;
      case "event":      return <span style={{ ...inter, fontWeight: 500 }}>{row.event}</span>;
      case "zone":       return <span style={inter}>{row.zone}</span>;
      case "camera":     return <span style={mono}>{row.camera}</span>;
      case "confidence": return <span style={{ ...mono, color: hovered ? (isDark ? "#E2E8F0" : "#0F172A") : (row.confidence >= 95 ? "#00A63E" : row.confidence >= 80 ? sec : "#EA580C") }}>{row.confidence.toFixed(1)}%</span>;
      case "timestamp":  return <span style={mono}>{row.timestamp}</span>;
      case "priority": {
        const pCfg: Record<string, { color: string; bg: string }> = {
          High:   { color: "#E7000B", bg: isDark ? "#E7000B22" : "#FEE2E2" },
          Medium: { color: "#D97706", bg: isDark ? "#D9770622" : "#FEF3C7" },
          Low:    { color: "#2563EB", bg: isDark ? "#2563EB22" : "#DBEAFE" },
        };
        const pv = row.priority ?? "Medium";
        const pc = pCfg[pv] ?? { color: "#64748B", bg: isDark ? "#64748B22" : "#F1F5F9" };
        return <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: pc.color, backgroundColor: pc.bg, padding: "2px 7px", borderRadius: 4 }}>{pv}</span>;
      }
      case "assignee":  return <span style={{ ...inter, fontWeight: 500 }}>{row.assignee ?? "—"}</span>;
      case "duration":  return <span style={mono}>{row.duration ?? "—"}</span>;
      case "riskScore": {
        const rs = row.riskScore ?? 0;
        const rsCol = rs >= 80 ? "#E7000B" : rs >= 60 ? "#D97706" : "#2563EB";
        return <span style={{ ...mono, fontWeight: 700, color: hovered ? (isDark ? "#E2E8F0" : "#0F172A") : rsCol }}>{rs}</span>;
      }
    }
  };

  // ── Row background (solid, opaque for sticky) ─────────────────────────────────
  const rowBg = (idx: number, hovered: boolean, selected: boolean): string => {
    if (hovered)       return isDark ? "#0D2922" : "#EBF5F1";
    if (selected)      return isDark ? "#0F2019" : "#F2FAF7";
    if (idx % 2 === 1) return isDark ? "#101B26" : "#F8FDFC";
    return isDark ? "#0F172A" : "#ffffff";
  };

  const [hoveredId, setHoveredId] = useState<string | null>(null);

  // ── Toggle row (sandbox control strip) ───────────────────────────────────────
  const TRow = ({ label, val, set }: { label: string; val: boolean; set: (v: boolean) => void }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 500, fontFamily: "Inter, sans-serif", color: isDark ? "#CBD5E1" : "#334155", whiteSpace: "nowrap" }}>{label}</span>
      <V23Toggle checked={val} onChange={set} />
    </div>
  );

  const divider = <div style={{ width: 1, alignSelf: "stretch", backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0", flexShrink: 0 }} />;

  return (
    <div className="space-y-6">
      <SectionHeader isDark={isDark} icon={Layers} title="Seamless HUD v2.3" description="Gmail-style multi-select · row accordion (JSON / sub-table) · column picker · sticky ID · sliding-window pagination · decoupled sandbox controls." />

      {/* Spec chips */}
      <div className="flex flex-wrap gap-2">
        {[
          ["Selection",   "Gmail-logic: 0 → toolbar, 1+ → action bar"],
          ["Accordion",   "Chevron expand · JSON code view · sub-table"],
          ["Columns",     "Per-column toggle · sticky ID · min-widths"],
          ["Scroll",      "H-scroll + position:sticky opaque fill"],
          ["Pagination",  "5-page sliding window · << < [n] > >>"],
          ["Controls",    "Decoupled sandbox strip · live stat counters"],
        ].map(([l, v]) => <SpecChip key={l} label={l!} value={v!} isDark={isDark} />)}
      </div>

      {/* ── Sandbox control strip ─────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "stretch", flexWrap: "wrap",
        borderRadius: 8, border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
        backgroundColor: isDark ? "#070C14" : "#ffffff",
        overflow: "hidden",
      }}>
        {/* Label */}
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, backgroundColor: isDark ? "#040810" : "#F8FAFC", borderRight: isDark ? "1px solid rgba(255,255,255,0.07)" : "1px solid #E2E8F0", flexShrink: 0 }}>
          <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: teal, fontFamily: "Inter, sans-serif" }}>Sandbox</span>
          <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#94A3B8", letterSpacing: "0.04em" }}>Table v2.3</span>
        </div>
        {divider}
        {/* Behaviour */}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Behaviour</span>
          <div style={{ display: "flex", gap: 16 }}>
            <TRow label="Selection Mode"  val={selectionMode}  set={setSelectionMode}  />
            <TRow label="Expandable Rows" val={expandableRows} set={setExpandableRows} />
          </div>
        </div>
        {divider}
        {/* Layout */}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Layout</span>
          <div style={{ display: "flex", gap: 16 }}>
            <TRow label="Sticky Col" val={stickyCol} set={setStickyCol} />
            <TRow label="H-Scroll"   val={hScroll}   set={setHScroll}   />
          </div>
        </div>
        {divider}
        {/* Expand View */}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Expand View</span>
          <div style={{ display: "flex", borderRadius: 4, border: isDark ? "1px solid rgba(255,255,255,0.1)" : "1px solid #E2E8F0", overflow: "hidden", height: 26 }}>
            {(["json", "table"] as const).map(t => (
              <button key={t} onClick={() => setExpandContent(t)}
                style={{ flex: 1, width: 52, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", border: "none", cursor: "pointer", transition: "all 150ms ease", backgroundColor: expandContent === t ? teal : "transparent", color: expandContent === t ? "#fff" : sec }}>
                {t === "json" ? "JSON" : "Table"}
              </button>
            ))}
          </div>
        </div>
        {divider}
        {/* Column toggles */}
        <div style={{ padding: "10px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Columns</span>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {V23_COL_DEFS.map(col => {
              const vis = !hiddenCols.has(col.key);
              return (
                <button key={col.key} onClick={() => setHiddenCols(p => { const n = new Set(p); vis ? n.add(col.key) : n.delete(col.key); return n; })}
                  style={{ fontSize: 10, fontWeight: 600, fontFamily: "Inter, sans-serif", padding: "3px 8px", borderRadius: 4, border: `1px solid ${vis ? teal + "40" : (isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0")}`, cursor: "pointer", transition: "all 120ms ease", backgroundColor: vis ? (isDark ? `${teal}18` : `${teal}0D`) : "transparent", color: vis ? teal : "#94A3B8", whiteSpace: "nowrap" }}>
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
        {divider}
        {/* Stats */}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Stats</span>
          <div style={{ display: "flex", gap: 12 }}>
            {[
              { n: V23_GRID_DATA.length, label: "Total"    },
              { n: filteredData.length,  label: "Filtered" },
              { n: selectedIds.size,     label: "Selected" },
              { n: totalPages,           label: "Pages"    },
            ].map(({ n, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: teal, lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 9, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Table ─────────────────────────────────────────────────────────────── */}
      <div style={{ borderRadius: 8, border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0", overflow: "hidden" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>

          {/* ── Toolbar ─────────────────────────────────────────────────────── */}
          <div style={{
            display: "flex", alignItems: "flex-end", gap: 12,
            padding: "10px 16px 10px",
            backgroundColor: isDark ? "#0F172A" : surface,
            borderBottom: `2px solid ${teal}`,
          }}>
            {selectionMode && selCount > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <V23Checkbox checked={allPageSel} indeterminate={someSel} onChange={togglePageAll} isDark={isDark} />
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: teal, whiteSpace: "nowrap" }}>
                    {selCount} item{selCount !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 2 }}>
                  {[
                    { Icon: Download,     label: "Export",  color: teal       },
                    { Icon: UserPlus,     label: "Assign",  color: "#2B7FFF"  },
                    { Icon: CheckCircle2, label: "Resolve", color: "#00A63E"  },
                    { Icon: Trash2,       label: "Delete",  color: "#E7000B"  },
                  ].map(({ Icon, label, color }) => (
                    <button key={label}
                      onMouseEnter={e => { (e.currentTarget).style.backgroundColor = `${color}12`; (e.currentTarget).style.color = color; }}
                      onMouseLeave={e => { (e.currentTarget).style.backgroundColor = "transparent"; (e.currentTarget).style.color = isDark ? "#64748B" : "#94A3B8"; }}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 4, border: "none", cursor: "pointer", background: "transparent", fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif", color: isDark ? "#64748B" : "#94A3B8", transition: "color 120ms ease, background-color 120ms ease" }}>
                      <Icon style={{ width: 12, height: 12 }} /> {label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelectedIds(new Set())}
                  style={{ ...btnBase, marginLeft: "auto", color: isDark ? "#374151" : "#94A3B8" }}>
                  <X style={{ width: 11, height: 11 }} /> Deselect All
                </button>
              </>
            ) : (
              <>
                {/* Search */}
                <div style={{ position: "relative", width: 260, flexShrink: 0 }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: isDark ? "#374151" : "#94A3B8", pointerEvents: "none" }} />
                  <input type="text" placeholder="Search incidents, zones…" value={searchQ}
                    onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                    style={{ width: "100%", height: 32, paddingLeft: 34, paddingRight: searchQ ? 28 : 4, fontSize: 12, fontFamily: "Inter, sans-serif", color: isDark ? "#E2E8F0" : "#1E293B", backgroundColor: "transparent", border: "none", borderBottom: isDark ? "2px solid rgba(255,255,255,0.1)" : "2px solid #E2E8F0", borderRadius: 0, outline: "none", transition: "border-bottom-color 200ms ease" }}
                    onFocus={e => { e.target.style.borderBottomColor = teal; }}
                    onBlur={e  => { e.target.style.borderBottomColor = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"; }}
                  />
                  {searchQ && (
                    <button onClick={() => { setSearchQ(""); setPage(1); }}
                      style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
                      <X style={{ width: 12, height: 12 }} />
                    </button>
                  )}
                </div>

                {/* Sort */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setSortOpen(o => !o); setSevOpen(false); setAppOpen(false); setZoneOpen(false); setColPickerOpen(false); }}
                    style={!sortIsDefault ? activeBtnBase : btnBase}>
                    <SlidersHorizontal style={{ width: 12, height: 12 }} />
                    {sortIsDefault ? "Sort" : currentSortOpt.shortLabel}
                  </button>
                  {sortOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} />
                      <div style={{ ...dropdownPanel, left: 0, right: "auto", minWidth: 220 }}>
                        {SORT_OPTIONS_V22.map(opt => (
                          <div key={opt.key} onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                            style={ddItem(sortKey === opt.key)}
                            onMouseEnter={e => { if (sortKey !== opt.key) (e.currentTarget).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"; }}
                            onMouseLeave={e => { (e.currentTarget).style.backgroundColor = sortKey === opt.key ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent"; }}>
                            {opt.label}
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Column Picker */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => { closeAllDropdowns(); setColPickerOpen(o => !o); }}
                    style={hiddenCols.size > 0 ? activeBtnBase : btnBase}>
                    <Columns3 style={{ width: 12, height: 12 }} />
                    Columns{hiddenCols.size > 0 ? ` (${V23_COL_DEFS.length - hiddenCols.size}/${V23_COL_DEFS.length})` : ""}
                  </button>
                  {colPickerOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setColPickerOpen(false)} />
                      <div style={{ ...dropdownPanel, left: 0, right: "auto", minWidth: 200 }}>
                        <div style={{ padding: "8px 12px 4px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
                          Toggle Columns
                        </div>
                        {V23_COL_DEFS.map(col => {
                          const vis = !hiddenCols.has(col.key);
                          return (
                            <div key={col.key} onClick={() => setHiddenCols(p => { const n = new Set(p); vis ? n.add(col.key) : n.delete(col.key); return n; })}
                              style={ddItem(vis)}
                              onMouseEnter={e => { if (!vis) (e.currentTarget).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"; }}
                              onMouseLeave={e => { (e.currentTarget).style.backgroundColor = vis ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent"; }}>
                              <ChkBox checked={vis} />
                              <span style={{ flex: 1 }}>{col.label}</span>
                              <span style={{ fontSize: 9, color: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }}>{col.minWidth}px</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>

                {/* Right cluster */}
                <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 12 }}>
                  <button onClick={clearFilters}
                    style={{ ...btnBase, visibility: hasActiveFilters ? "visible" : "hidden", color: isDark ? "#EF4444" : "#E7000B", borderBottomColor: isDark ? "#EF4444" : "#E7000B", gap: 4 }}>
                    <X style={{ width: 12, height: 12 }} /> Clear
                  </button>

                  {/* Severity */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setSevOpen(o => !o); setSortOpen(false); setAppOpen(false); setZoneOpen(false); setColPickerOpen(false); }}
                      style={{ ...(statusFilters.size > 0 ? activeBtnBase : btnBase), width: 104, overflow: "hidden" }}>
                      <Filter style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sevLabel}</span>
                    </button>
                    {sevOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSevOpen(false)} />
                        <div style={{ ...dropdownPanel, right: 0, left: "auto", minWidth: 210 }}>
                          {ALL_STATUSES_V22.map(s => (
                            <div key={s} onClick={() => toggleStatus(s)} style={ddItem(statusFilters.has(s))}
                              onMouseEnter={e => { if (!statusFilters.has(s)) (e.currentTarget).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"; }}
                              onMouseLeave={e => { (e.currentTarget).style.backgroundColor = statusFilters.has(s) ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent"; }}>
                              <ChkBox checked={statusFilters.has(s)} />
                              <span style={{ flex: 1 }}>{V21_STATUS_CFG[s]?.label ?? s}</span>
                              <V23Pill status={s} isDark={isDark} />
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Events */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setAppOpen(o => !o); setSortOpen(false); setSevOpen(false); setZoneOpen(false); setColPickerOpen(false); }}
                      style={{ ...(appFilters.size > 0 ? activeBtnBase : btnBase), width: 104, overflow: "hidden" }}>
                      <Filter style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appLabel}</span>
                    </button>
                    {appOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAppOpen(false)} />
                        <div style={{ ...dropdownPanel, right: 0, left: "auto", minWidth: 230, maxHeight: 280, overflowY: "auto" }}>
                          {ALL_EVENTS_V23.map(a => (
                            <div key={a} onClick={() => toggleApp(a)} style={ddItem(appFilters.has(a))}
                              onMouseEnter={e => { if (!appFilters.has(a)) (e.currentTarget).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"; }}
                              onMouseLeave={e => { (e.currentTarget).style.backgroundColor = appFilters.has(a) ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent"; }}>
                              <ChkBox checked={appFilters.has(a)} />
                              <span style={{ flex: 1 }}>{a}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Zones */}
                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setZoneOpen(o => !o); setSortOpen(false); setSevOpen(false); setAppOpen(false); setColPickerOpen(false); }}
                      style={{ ...(zoneFilters.size > 0 ? activeBtnBase : btnBase), width: 104, overflow: "hidden" }}>
                      <Filter style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zoneLabel}</span>
                    </button>
                    {zoneOpen && (
                      <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setZoneOpen(false)} />
                        <div style={{ ...dropdownPanel, right: 0, left: "auto", minWidth: 200, maxHeight: 280, overflowY: "auto" }}>
                          {ALL_ZONES_V23.map(z => (
                            <div key={z} onClick={() => toggleZone(z)} style={ddItem(zoneFilters.has(z))}
                              onMouseEnter={e => { if (!zoneFilters.has(z)) (e.currentTarget).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"; }}
                              onMouseLeave={e => { (e.currentTarget).style.backgroundColor = zoneFilters.has(z) ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent"; }}>
                              <ChkBox checked={zoneFilters.has(z)} />
                              <span style={{ flex: 1 }}>{z}</span>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* ── Table body ──────────────────────────────────────────────────── */}
          <div style={{ overflowX: hScroll ? "auto" : "hidden", backgroundColor: surface }}>

            {/* Header row */}
            <div style={{
              display: "flex", alignItems: "center", height: 44,
              backgroundColor: hdr, minWidth: hScroll ? totalMinW : undefined,
              borderBottom: isDark ? "2px solid transparent" : "1px solid #E2E8F0",
            }}>
              <div style={{
                display: "flex", alignItems: "center", flexShrink: 0,
                position: stickyCol && hScroll ? "sticky" : "relative", left: 0, zIndex: 3,
                backgroundColor: hdr, height: "100%",
              }}>
                {selectionMode && (
                  <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <V23Checkbox checked={allPageSel} indeterminate={someSel} onChange={togglePageAll} isDark={isDark} />
                  </div>
                )}
                <div style={{ width: 160, paddingLeft: selectionMode ? 4 : 12, paddingRight: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  {expandableRows && <span style={{ width: 16, height: 16, flexShrink: 0 }} />}
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: isDark ? "#94A3B8" : "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Incident ID</span>
                </div>
              </div>
              {visibleCols.map(col => (
                <div key={col.key} style={{
                  ...(hScroll ? { flexShrink: 0, width: col.minWidth } : { flex: col.minWidth }),
                  paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center",
                }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: isDark ? "#94A3B8" : "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {col.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Rows */}
            {paginatedData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>
                No incidents match the current filters.{" "}
                {hasActiveFilters && (
                  <button onClick={clearFilters} style={{ marginLeft: 8, color: teal, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Clear filters</button>
                )}
              </div>
            ) : (
              paginatedData.map((row, idx) => {
                const isHov = hoveredId === row.id || idx === 0;
                const isSel = selectedIds.has(row.id);
                const isExp = expandedId === row.id;
                const bg    = rowBg(idx, isHov, isSel);
                const sevColor = SEVERITY_COLORS[row.status] ?? "#64748B";

                return (
                  <div key={row.id}>
                    <div
                      onMouseEnter={() => setHoveredId(row.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => selectionMode && selCount > 0 ? toggleRowSel(row.id) : undefined}
                      style={{
                        display: "flex", alignItems: "center",
                        minHeight: 44, minWidth: hScroll ? totalMinW : undefined,
                        backgroundColor: bg, borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #F1F5F9",
                        position: "relative", cursor: selectionMode && selCount > 0 ? "pointer" : "default",
                        transition: "background-color 100ms ease",
                      }}
                    >
                      {/* Severity left strip */}
                      <div style={{
                        position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                        backgroundColor: sevColor, opacity: isHov || isSel ? 1 : 0,
                        transition: "opacity 100ms ease",
                      }} />

                      {/* Sticky group */}
                      <div style={{
                        display: "flex", alignItems: "center", flexShrink: 0,
                        position: stickyCol && hScroll ? "sticky" : "relative", left: 0, zIndex: 2,
                        backgroundColor: bg, height: "100%", minHeight: 44,
                        transition: "background-color 100ms ease",
                      }}>
                        {selectionMode && (
                          <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <V23Checkbox checked={isSel} onChange={() => toggleRowSel(row.id)} isDark={isDark} />
                          </div>
                        )}
                        <div style={{ width: 160, paddingLeft: selectionMode ? 4 : 12, paddingRight: 8, display: "flex", alignItems: "center", gap: 6, height: "100%" }}>
                          {expandableRows && (
                            <button
                              onClick={e => { e.stopPropagation(); setExpandedId(prev => prev === row.id ? null : row.id); }}
                              style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", padding: 0, flexShrink: 0, borderRadius: 3, color: isHov ? (isDark ? "#94A3B8" : "#64748B") : (isDark ? "#374151" : "#CBD5E1"), transition: "color 120ms ease" }}>
                              <ChevronRight style={{ width: 12, height: 12, transition: "transform 150ms ease", transform: isExp ? "rotate(90deg)" : "none" }} />
                            </button>
                          )}
                          <span style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, fontWeight: isHov ? 700 : 600, color: isHov ? (isDark ? "#E2E8F0" : "#0F172A") : (isDark ? "#94A3B8" : "#475569"), transition: "color 100ms ease, font-weight 100ms ease", letterSpacing: "0.01em" }}>
                            {row.id}
                          </span>
                        </div>
                      </div>

                      {/* Scrollable cells */}
                      {visibleCols.map(col => (
                        <div key={col.key} style={{
                          ...(hScroll ? { flexShrink: 0, width: col.minWidth } : { flex: col.minWidth }),
                          paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", minHeight: 44,
                        }}>
                          {renderCell(col.key, row, isHov)}
                        </div>
                      ))}

                      {/* Floating CTAs */}
                      <div style={{
                        position: "sticky", right: 0, zIndex: 4, flexShrink: 0,
                        height: "100%", minHeight: 44,
                        display: "flex", alignItems: "center", gap: 4,
                        paddingLeft: 36, paddingRight: 10,
                        background: `linear-gradient(to right, ${bg}00 0%, ${bg} 36px)`,
                        opacity: isHov ? 1 : 0,
                        pointerEvents: isHov ? "auto" : "none",
                        transition: "opacity 120ms ease",
                      }}>
                        {[
                          { Icon: Eye,      title: "View",   hc: teal      },
                          { Icon: UserPlus, title: "Assign", hc: teal      },
                          { Icon: Trash2,   title: "Delete", hc: "#E7000B" },
                        ].map(({ Icon, title, hc }, btnIdx) => {
                          const isPinned = idx === 0 && btnIdx === 0;
                          return (
                            <button key={title} title={title}
                              onMouseEnter={e => {
                                (e.currentTarget as HTMLButtonElement).style.backgroundColor = hc;
                                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = hc;
                              }}
                              onMouseLeave={e => {
                                if (isPinned) {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = hc;
                                  (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = hc;
                                } else {
                                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9";
                                  (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#94A3B8" : "#64748B";
                                  (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0";
                                }
                              }}
                              style={{
                                display: "flex", alignItems: "center", justifyContent: "center",
                                width: 28, height: 28, borderRadius: 5,
                                border: `1px solid ${isPinned ? hc : (isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0")}`,
                                backgroundColor: isPinned ? hc : (isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9"),
                                cursor: "pointer", color: isPinned ? "#ffffff" : (isDark ? "#94A3B8" : "#64748B"),
                                transition: "background-color 100ms ease, color 100ms ease, border-color 100ms ease",
                              }}>
                              <Icon style={{ width: 12, height: 12 }} />
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Expansion panel */}
                    {isExp && expandableRows && (
                      <div style={{
                        position: "sticky", left: 0, zIndex: 1,
                        backgroundColor: isDark ? "#080F1C" : "#F8FAFC",
                        borderBottom: isDark ? "1px solid rgba(0,149,109,0.2)" : "1px solid rgba(0,119,91,0.15)",
                        borderLeft: `3px solid ${sevColor}`,
                      }}>
                        {(() => {
                          const subIndent = (selectionMode ? 44 : 0) + (selectionMode ? 4 : 12) + 16 + 6 - 3;
                          const subCols   = "160px minmax(180px, 260px) 80px 180px";
                          return (
                            <>
                              <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, paddingBottom: 6, paddingLeft: subIndent, paddingRight: 16, borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid rgba(0,119,91,0.1)" }}>
                                <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#94A3B8" : "#475569" }}>{row.id}</span>
                                <span style={{ fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>·</span>
                                <span style={{ fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>{row.event}</span>
                                <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                                  <button onClick={() => setExpandContent("json")}
                                    style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 3, border: "none", cursor: "pointer", transition: "all 120ms ease", backgroundColor: expandContent === "json" ? teal : (isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0"), color: expandContent === "json" ? "#fff" : sec }}>
                                    JSON
                                  </button>
                                  <button onClick={() => setExpandContent("table")}
                                    style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 3, border: "none", cursor: "pointer", transition: "all 120ms ease", backgroundColor: expandContent === "table" ? teal : (isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0"), color: expandContent === "table" ? "#fff" : sec }}>
                                    Sub-Table
                                  </button>
                                </div>
                                <button onClick={() => setExpandedId(null)}
                                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: sec }}>
                                  <ChevronUp style={{ width: 12, height: 12 }} />
                                </button>
                              </div>
                              {expandContent === "json" ? (
                                <V23JsonView row={row} />
                              ) : (
                                <div style={{ padding: "0 0 8px" }}>
                                  <div style={{ display: "grid", gridTemplateColumns: subCols, alignItems: "center", height: 34, paddingLeft: subIndent, paddingRight: 16, backgroundColor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid rgba(0,0,0,0.08)" }}>
                                    {["Sub-Event ID", "Event Type", "Conf.", "Timestamp"].map(h => (
                                      <span key={h} style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: isDark ? "#94A3B8" : "#475569", fontFamily: "Inter, sans-serif", paddingRight: 16 }}>{h}</span>
                                    ))}
                                  </div>
                                  {(V23_SUB_DATA[row.id] ?? [
                                    { id: `${row.id}-S1`, event: "Pre-event Motion Detected", camera: row.camera, confidence: +(row.confidence - 5.2).toFixed(1), timestamp: row.timestamp },
                                    { id: `${row.id}-S2`, event: "Sensor Threshold Breach",   camera: row.camera, confidence: +(row.confidence - 10.4).toFixed(1), timestamp: row.timestamp },
                                    { id: `${row.id}-S3`, event: "Camera Zone Alert",          camera: row.camera, confidence: +(row.confidence - 15.6).toFixed(1), timestamp: row.timestamp },
                                  ]).map((sub, si) => (
                                    <div key={sub.id} style={{ display: "grid", gridTemplateColumns: subCols, alignItems: "center", height: 36, paddingLeft: subIndent, paddingRight: 16, backgroundColor: si % 2 === 1 ? (isDark ? "rgba(255,255,255,0.02)" : "rgba(0,119,91,0.015)") : "transparent", borderTop: isDark ? "1px solid rgba(255,255,255,0.03)" : "1px solid rgba(0,119,91,0.06)" }}>
                                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: isDark ? "#64748B" : "#94A3B8", paddingRight: 16 }}>{sub.id}</span>
                                      <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: isDark ? "#CBD5E1" : "#334155", paddingRight: 16 }}>{sub.event}</span>
                                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: Math.max(0, sub.confidence) >= 80 ? "#00A63E" : "#EA580C", paddingRight: 16 }}>{Math.max(0, sub.confidence).toFixed(1)}%</span>
                                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: sec }}>{sub.timestamp}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </>
                          );
                        })()}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Smart Pagination ─────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
              padding: "10px 16px", position: "relative",
              borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #F1F5F9",
              backgroundColor: isDark ? "#0A0F1A" : surface,
            }}>
              <button onClick={() => setPage(1)} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", backgroundColor: page === 1 ? (isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9") : (isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"), color: page === 1 ? (isDark ? "#374151" : "#CBD5E1") : (isDark ? "#94A3B8" : "#475569") }}>
                <ChevronsLeft style={{ width: 13, height: 13 }} />
              </button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", backgroundColor: "transparent", color: page === 1 ? (isDark ? "#374151" : "#CBD5E1") : (isDark ? "#94A3B8" : "#475569") }}>
                <ChevronLeft style={{ width: 13, height: 13 }} />
              </button>
              {pagWindow.map(p => (
                <button key={p} onClick={() => setPage(p)}
                  style={{ width: 28, height: 28, borderRadius: 4, border: page === p ? `1px solid ${teal}40` : "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", backgroundColor: page === p ? teal : (isDark ? "rgba(255,255,255,0.04)" : "#F1F5F9"), color: page === p ? "#ffffff" : (isDark ? "#64748B" : "#94A3B8") }}>
                  {p}
                </button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", backgroundColor: "transparent", color: page === totalPages ? (isDark ? "#374151" : "#CBD5E1") : (isDark ? "#94A3B8" : "#475569") }}>
                <ChevronRight style={{ width: 13, height: 13 }} />
              </button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9", color: page === totalPages ? (isDark ? "#374151" : "#CBD5E1") : (isDark ? "#94A3B8" : "#475569") }}>
                <ChevronsRight style={{ width: 13, height: 13 }} />
              </button>
              <div style={{ position: "absolute", right: 16, fontSize: 11, color: sec, fontFamily: "Inter, sans-serif" }}>
                <span style={{ fontWeight: 400 }}>Showing </span>
                <span style={{ fontWeight: 600, color: isDark ? "#6B7280" : "#334155" }}>
                  {(page - 1) * ROWS_PER_PAGE_V23 + 1}–{Math.min(page * ROWS_PER_PAGE_V23, filteredData.length)}
                </span>
                <span style={{ fontWeight: 400 }}> of </span>
                <span style={{ fontWeight: 600, color: isDark ? "#6B7280" : "#334155" }}>{filteredData.length}</span>
                <span style={{ fontWeight: 400 }}> incidents</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation isDark={isDark}>Multi-select: header checkbox + row checkboxes · allPage/partial/none states · Gmail toggle (0 → toolbar, 1+ → action bar)</Annotation>
        <Annotation isDark={isDark}>Accordion: ChevronRight rotates 90° on expand · JSON syntax-highlighted (keys sky, values green, nums amber) · sub-table 36px rows</Annotation>
        <Annotation isDark={isDark}>Sticky column: <code className="font-mono text-[10px] bg-neutral-100 px-1 rounded">position:sticky;left:0</code> on flex sticky-group div — works inside overflow-x:auto container</Annotation>
        <Annotation isDark={isDark}>Column picker: toggles for 10 scrollable cols · Incident ID + checkbox + actions always visible · live min-width annotation</Annotation>
        <Annotation isDark={isDark}>Pagination: <code className="font-mono text-[10px] bg-neutral-100 px-1 rounded">v23PagWindow(page,total)</code> → 5-page sliding window · ChevronsLeft/Right for first/last</Annotation>
        <Annotation isDark={isDark}>Sandbox: independent feature toggles update layout in real-time · Stats grid shows filtered/selected counts live</Annotation>
      </div>
    </div>
  );
};

// ── Page wrapper ───────────────────────────────────────────────────────────────
export function DataTablePage() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div
      className="p-8 space-y-6 min-h-full"
      style={{ backgroundColor: isDark ? "#0A0F1A" : "#F8FAFC" }}
    >
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: isDark ? "#E2E8F0" : "#0F172A" }}>DataTable</h1>
          <p className="text-sm mt-1" style={{ color: isDark ? "#64748B" : "#64748B" }}>
            Full-featured data grid — sorting, multi-filter, row selection, accordion expand, column picker, sticky columns, smart pagination.
          </p>
        </div>
        {/* Dark mode toggle */}
        <button
          onClick={() => setIsDark(d => !d)}
          style={{
            display: "flex", alignItems: "center", gap: 6, padding: "6px 12px",
            borderRadius: 6, border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid #E2E8F0",
            backgroundColor: isDark ? "rgba(255,255,255,0.06)" : "#ffffff",
            cursor: "pointer", fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
            color: isDark ? "#94A3B8" : "#64748B",
          }}
        >
          {isDark ? <Sun style={{ width: 14, height: 14 }} /> : <Moon style={{ width: 14, height: 14 }} />}
          {isDark ? "Light" : "Dark"}
        </button>
      </div>

      <V2_3Content isDark={isDark} />
    </div>
  );
}
