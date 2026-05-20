import { useState, useRef, useCallback, useEffect } from "react";
import {
  Info, Minus, CheckCircle2, Eye, ArrowUpRight, ArrowDownRight,
  Search, Filter, ChevronLeft, ChevronRight, SlidersHorizontal,
  X, ChevronDown, AlertTriangle, AlertCircle, Download, UserPlus,
  Trash2, ChevronsLeft, ChevronsRight, ChevronUp, Columns3, Clock,
  ShieldAlert, Users, Bell, Shield,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { FilterDropdown } from "@fe-common/components/ui/FilterDropdown";
import {
  AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid,
} from "recharts";

// ─── Constants ────────────────────────────────────────────────────────────────
const HSW = 96, HSH = 32, HSP = 3;
const SB_EXPANDED_W = 224;
const SB_COLLAPSED_W = 56;
const OUTER_PAD = 24;

// ─── Types ────────────────────────────────────────────────────────────────────
type SeverityDir = "up" | "down" | "neutral";

interface CardVariant {
  id: string; label: string; sublabel: string; value: string;
  deltaPct: string; dir: SeverityDir; subtext: string;
  color: string; bgColor?: string; deltaNum?: string; deltaRef?: string;
  name: string; sparkData: number[];
}
interface KPICardProps { variant: CardVariant; isSkeleton?: boolean; frozenCursorFrac?: number; }
interface BSProps { dir: SeverityDir; num: string; ref_: string; color: string }
interface StatData {
  label: string; value: string; sublabel: string;
  num: string; ref_: string; dir: SeverityDir;
  definition: string; chip: string; color: string; bgColor: string;
}
interface AlertData {
  label: string; color: string; bgColor: string;
  zoneName?: string; description?: string; compliance?: string;
  alertInfo?: string; cameraId?: string;
  zones?: Array<{ name: string; compliance: string; num: string; ref_: string; dir: SeverityDir }>;
  footerNote?: string;
}
interface CapData {
  zoneName: string; current: number; max: number; occupancy: number;
  statusLabel: string; color: string; bgColor: string;
}
interface GridRow {
  id: string; status: string; event: string; zone: string;
  camera: string; confidence: number; timestamp: string;
  priority?: string; assignee?: string; duration?: string; riskScore?: number;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────
function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}
function buildSparkPath(data: number[], w = HSW, h = HSH, p = HSP): [number, number][] {
  const mn = Math.min(...data), mx = Math.max(...data), rng = mx - mn || 1;
  return data.map((v, i) => [
    p + (i / (data.length - 1)) * (w - p * 2),
    h - p - ((v - mn) / rng) * (h - p * 2),
  ]);
}
function interp(data: number[], frac: number): number {
  const idx = Math.max(0, Math.min(frac * (data.length - 1), data.length - 1));
  const lo = Math.floor(idx), hi = Math.min(lo + 1, data.length - 1);
  return data[lo] + (data[hi] - data[lo]) * (idx - lo);
}
const Sk = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-[3px] bg-neutral-200/80", className)} />
);

// ─── Severity palettes ────────────────────────────────────────────────────────
const SEVERITY_COLORS: Record<string, string> = {
  critical: "#E7000B", warning: "#EA580C", stable: "#00A63E",
  success: "#00A63E", info: "#2B7FFF", resolved: "#64748B",
  medium: "#E19A04", high: "#EA580C", low: "#2B7FFF",
};

const V21_STATUS_CFG: Record<string, { label: string; bg: string }> = {
  critical: { label: "Critical", bg: "#E7000B" }, warning: { label: "Warning", bg: "#EA580C" },
  stable:   { label: "Stable",   bg: "#00A63E" }, success: { label: "Success", bg: "#00A63E" },
  info:     { label: "Info",     bg: "#2B7FFF" }, resolved: { label: "Resolved", bg: "#475569" },
  medium:   { label: "Medium",   bg: "#E19A04" }, high: { label: "High", bg: "#EA580C" },
  low:      { label: "Low",      bg: "#2B7FFF" },
};
const SEVERITY_ORDER_V22: Record<string, number> = {
  critical: 0, high: 1, warning: 2, medium: 3, info: 4, low: 4, stable: 5, resolved: 6, success: 6,
};
const SORT_OPTIONS_V22: { key: string; label: string; shortLabel: string }[] = [
  { key: "timestamp-desc",  label: "Time: Newest First",       shortLabel: "Time ↓" },
  { key: "timestamp-asc",   label: "Time: Oldest First",       shortLabel: "Time ↑" },
  { key: "confidence-desc", label: "Confidence: High → Low",   shortLabel: "Conf ↓" },
  { key: "confidence-asc",  label: "Confidence: Low → High",   shortLabel: "Conf ↑" },
  { key: "id-asc",          label: "ID: A → Z",                shortLabel: "ID ↑"   },
  { key: "id-desc",         label: "ID: Z → A",                shortLabel: "ID ↓"   },
  { key: "severity-asc",    label: "Severity: Critical First", shortLabel: "Sev ↓"  },
  { key: "severity-desc",   label: "Severity: Low First",      shortLabel: "Sev ↑"  },
];

// ─── Accordion severity config ────────────────────────────────────────────────
const ACC_SEV_V11 = {
  default:  { color: "#475569", titleOpen: "#0F172A", bg: "#ffffff",               border: "#E2E8F0",              stripe: "#CBD5E1", shadow: "0 4px 20px rgba(0,0,0,0.08)",       iconColor: "#475569", badgeBg: "#F1F5F9",               badgeColor: "#64748B" },
  critical: { color: "#E7000B", titleOpen: "#E7000B", bg: "rgba(231,0,11,0.04)",   border: "rgba(231,0,11,0.20)",  stripe: "#E7000B", shadow: "0 4px 20px rgba(231,0,11,0.12)",    iconColor: "#E7000B", badgeBg: "rgba(231,0,11,0.08)",   badgeColor: "#E7000B" },
  high:     { color: "#EA580C", titleOpen: "#EA580C", bg: "rgba(234,88,12,0.04)",  border: "rgba(234,88,12,0.20)", stripe: "#EA580C", shadow: "0 4px 20px rgba(234,88,12,0.12)",   iconColor: "#EA580C", badgeBg: "rgba(234,88,12,0.08)",  badgeColor: "#EA580C" },
  medium:   { color: "#E19A04", titleOpen: "#B37A00", bg: "rgba(225,154,4,0.04)",  border: "rgba(225,154,4,0.20)", stripe: "#E19A04", shadow: "0 4px 20px rgba(225,154,4,0.12)",   iconColor: "#E19A04", badgeBg: "rgba(225,154,4,0.08)",  badgeColor: "#B37A00" },
  stable:   { color: "#00A63E", titleOpen: "#00A63E", bg: "rgba(0,166,62,0.04)",   border: "rgba(0,166,62,0.20)",  stripe: "#00A63E", shadow: "0 4px 20px rgba(0,166,62,0.12)",    iconColor: "#00A63E", badgeBg: "rgba(0,166,62,0.08)",   badgeColor: "#00A63E" },
  info:     { color: "#2B7FFF", titleOpen: "#2B7FFF", bg: "rgba(43,127,255,0.04)", border: "rgba(43,127,255,0.20)",stripe: "#2B7FFF", shadow: "0 4px 20px rgba(43,127,255,0.12)",  iconColor: "#2B7FFF", badgeBg: "rgba(43,127,255,0.08)", badgeColor: "#2B7FFF" },
  resolved: { color: "#64748B", titleOpen: "#475569", bg: "rgba(100,116,139,0.04)",border: "rgba(100,116,139,0.20)",stripe: "#94A3B8",shadow: "0 4px 20px rgba(100,116,139,0.10)", iconColor: "#64748B", badgeBg: "rgba(100,116,139,0.08)",badgeColor: "#64748B" },
} as const;
type AccSeverityV11 = keyof typeof ACC_SEV_V11;

// ─── Zone status config ───────────────────────────────────────────────────────
const ZONE_STATUS_CFG = {
  critical: { Icon: AlertCircle,   color: "#E7000B", bg: "rgba(231,0,11,0.10)"   },
  warning:  { Icon: AlertTriangle, color: "#EA580C", bg: "rgba(234,88,12,0.10)"  },
  stable:   { Icon: CheckCircle2,  color: "#00A63E", bg: "rgba(0,166,62,0.10)"   },
  info:     { Icon: Info,          color: "#2B7FFF", bg: "rgba(43,127,255,0.10)" },
} as const;
type ZoneStatus = keyof typeof ZONE_STATUS_CFG;

const ZONES_V12 = [
  { id: "z-a", label: "Zone A", sub: "Loading Dock",    headerColor: "#E7000B",
    comps: [{ name: "Cameras", status: "critical" as ZoneStatus },{ name: "Gateway", status: "warning" as ZoneStatus },{ name: "Compute", status: "stable" as ZoneStatus },{ name: "ML", status: "critical" as ZoneStatus }],
    note: "Cameras, ML down" },
  { id: "z-b", label: "Zone B", sub: "Assembly Line",   headerColor: "#EA580C",
    comps: [{ name: "Cameras", status: "critical" as ZoneStatus },{ name: "Gateway", status: "warning" as ZoneStatus },{ name: "Compute", status: "stable" as ZoneStatus },{ name: "ML", status: "stable" as ZoneStatus }],
    note: "1 active alert" },
  { id: "z-c", label: "Zone C", sub: "Warehouse",       headerColor: "#00A63E",
    comps: [{ name: "Cameras", status: "stable" as ZoneStatus },{ name: "Gateway", status: "stable" as ZoneStatus },{ name: "Compute", status: "stable" as ZoneStatus },{ name: "ML", status: "stable" as ZoneStatus }],
    note: "All systems nominal" },
  { id: "z-d", label: "Zone D", sub: "North Perimeter", headerColor: "#E19A04",
    comps: [{ name: "Cameras", status: "warning" as ZoneStatus },{ name: "Gateway", status: "stable" as ZoneStatus },{ name: "Compute", status: "stable" as ZoneStatus },{ name: "ML", status: "warning" as ZoneStatus }],
    note: "Degraded performance" },
  { id: "z-e", label: "Zone E", sub: "Main Entrance",   headerColor: "#2B7FFF",
    comps: [{ name: "Cameras", status: "stable" as ZoneStatus },{ name: "Gateway", status: "stable" as ZoneStatus },{ name: "Compute", status: "info" as ZoneStatus },{ name: "ML", status: "stable" as ZoneStatus }],
    note: "Update pending" },
];

// ─── V2.3 Dataset ─────────────────────────────────────────────────────────────
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
  const statuses = ["critical","warning","stable","info","resolved","critical","warning","info","high","low","medium","resolved","critical","warning","stable"];
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
      id: `INC-0${num}`, status: statuses[i % statuses.length],
      event: events[i % events.length], zone: zones[i % zones.length],
      camera: `CAM-${String((i % 38) + 1).padStart(2, "0")}`,
      confidence: Math.max(60, +(baseConfs[i % baseConfs.length] - (i % 7) * 0.4).toFixed(1)),
      timestamp: `2026-04-${String(Math.max(1, day)).padStart(2, "0")} ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`,
      priority: priorities[i % priorities.length], assignee: assignees[i % assignees.length],
      duration: durations[i % durations.length], riskScore: riskScores[i % riskScores.length],
    });
  }
  return rows;
})();

type V23SubRow = { id: string; event: string; camera: string; confidence: number; timestamp: string };
const V23_SUB_DATA: Record<string, V23SubRow[]> = {};
V23_GRID_DATA.slice(0, 30).forEach((row) => {
  const subEvents = ["Pre-event Motion Detected", "Sensor Threshold Breach", "Camera Zone Alert"];
  V23_SUB_DATA[row.id] = subEvents.map((ev, j) => ({
    id: `${row.id}-S${j + 1}`, event: ev, camera: row.camera,
    confidence: Math.max(50, +(row.confidence - (j + 1) * 5.2).toFixed(1)),
    timestamp: row.timestamp,
  }));
});

const V23_COL_DEFS = [
  { key: "status",     label: "Status",     minWidth: 120 },
  { key: "event",      label: "Event Type", minWidth: 220 },
  { key: "zone",       label: "Zone",       minWidth: 170 },
  { key: "camera",     label: "Camera",     minWidth: 90  },
  { key: "confidence", label: "Conf.",      minWidth: 80  },
  { key: "timestamp",  label: "Timestamp",  minWidth: 180 },
  { key: "priority",   label: "Priority",   minWidth: 100 },
  { key: "assignee",   label: "Assignee",   minWidth: 140 },
  { key: "duration",   label: "Duration",   minWidth: 100 },
  { key: "riskScore",  label: "Risk Score", minWidth: 100 },
] as const;
type V23ColKey = typeof V23_COL_DEFS[number]["key"];

const ALL_EVENTS_V23 = [...new Set(V23_GRID_DATA.map((r) => r.event))].sort();
const ALL_ZONES_V23  = [...new Set(V23_GRID_DATA.map((r) => r.zone))].sort();
const ALL_STATUSES_V23 = [...new Set(V23_GRID_DATA.map((r) => r.status))].sort(
  (a, b) => (SEVERITY_ORDER_V22[a] ?? 7) - (SEVERITY_ORDER_V22[b] ?? 7)
);
function v23PagWindow(page: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, page - 2);
  const end = Math.min(total, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}
const ROWS_PER_PAGE_V23 = 10;

// ════════════════════════════════════════════════════════════════════════════
//  FLOATING HUD
// ════════════════════════════════════════════════════════════════════════════
const FloatingHUD = ({
  timeRange, onTimeRangeChange, selectedZones, onToggleZone,
  dataFreshnessSeconds, sidebarCollapsed, timeRangeInfo,
}: {
  timeRange: "5M" | "1H" | "1D" | "1W";
  onTimeRangeChange: (r: string) => void;
  selectedZones: string[];
  onToggleZone: (z: string) => void;
  dataFreshnessSeconds: number;
  sidebarCollapsed: boolean;
  timeRangeInfo: string;
}) => {
  const pipelineName = selectedZones.length === 1 ? selectedZones[0]
    : selectedZones.length > 1 ? `${selectedZones.length} Zones` : "All Zones";
  const sidebarW = sidebarCollapsed ? SB_COLLAPSED_W : SB_EXPANDED_W;
  const isFresh  = dataFreshnessSeconds < 60;

  return (
    <div style={{
      position: "fixed", top: 64,
      left: sidebarW + OUTER_PAD, right: OUTER_PAD,
      minHeight: 52, padding: "0 24px", zIndex: 20,
      display: "flex", alignItems: "center",
      backgroundColor: "rgba(255, 255, 255, 0.88)",
      backdropFilter: "blur(32px) saturate(160%)",
      WebkitBackdropFilter: "blur(32px) saturate(160%)",
      borderTop: "1px solid rgba(255, 255, 255, 0.6)",
      borderLeft: "1px solid rgba(226, 232, 240, 0.4)",
      borderRight: "1px solid rgba(226, 232, 240, 0.4)",
      borderBottom: "1px solid rgba(226, 232, 240, 0.4)",
      boxShadow: "0 0 0 1px rgba(0,0,0,0.05), 0 8px 32px rgba(0,0,0,0.2)",
      borderRadius: 6,
      transition: "left 300ms cubic-bezier(0.4, 0, 0.2, 1)",
    }}>
      {/* Left: breadcrumb + live sync */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
        <span style={{ fontSize: 12, color: "#64748B" }}>Project:</span>
        <span style={{ fontSize: 12, color: "#0F172A", fontWeight: 500 }}>Matrice AI</span>
        <ChevronDown style={{ width: 10, height: 10, color: "#CBD5E1", transform: "rotate(-90deg)" }} />
        <span style={{ fontSize: 12, color: "#64748B" }}>Monitor:</span>
        <span className="font-mono" style={{ fontSize: 12, color: "#0F172A", fontWeight: 500 }}>{pipelineName}</span>
        <span style={{ display: "block", width: 1, height: 14, backgroundColor: "rgba(0,0,0,0.1)", margin: "0 6px" }} />
        <span style={{ position: "relative", width: 7, height: 7, display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
          <span className="animate-ping" style={{ position: "absolute", inset: 0, borderRadius: "50%", backgroundColor: isFresh ? "rgba(0,166,62,0.4)" : "rgba(234,179,8,0.4)" }} />
          <span style={{ position: "relative", width: "100%", height: "100%", borderRadius: "50%", display: "block", backgroundColor: isFresh ? "#00A63E" : "#EAB308" }} />
        </span>
        <span style={{ fontSize: 11, color: "#64748B", lineHeight: 1 }}>
          Updated <span className="font-mono tabular-nums" style={{ fontWeight: 600, color: "#334155" }}>{dataFreshnessSeconds}s</span> ago
        </span>
      </div>

      <div style={{ flex: 1 }} />

      {/* Right: zone filter + time range + time info */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        <FilterDropdown
          label="Zones"
          options={["all", "Loading Dock A", "Assembly Line 2", "Warehouse B", "Main Entrance", "Exit Gate 3"]}
          selectedItems={selectedZones}
          onToggleItem={onToggleZone}
          className="w-[140px]"
        />
        <div style={{ display: "flex", alignItems: "center", border: "1px solid rgba(0,119,91,0.2)", borderRadius: 2, backgroundColor: "rgba(0,0,0,0.03)", padding: "2px", gap: 1, width: 120, flexShrink: 0 }}>
          {(["5M", "1H", "1D", "1W"] as const).map((r) => (
            <button key={r} onClick={() => onTimeRangeChange(r)}
              style={{ flex: 1, padding: "4px 0", fontSize: 10, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: 1, border: "none", cursor: "pointer", lineHeight: 1, transition: "background-color 120ms, color 120ms, box-shadow 120ms", backgroundColor: timeRange === r ? "#00775B" : "transparent", color: timeRange === r ? "#ffffff" : "#64748B", boxShadow: timeRange === r ? "0 1px 4px rgba(0,119,91,0.3)" : "none" } as React.CSSProperties}>
              {r}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, height: 30, padding: "0 10px", backgroundColor: "#F0F2F4", border: "1px solid rgba(0,0,0,0.06)", borderRadius: 4, width: 176, marginLeft: 4 }}>
          <Clock style={{ width: 11, height: 11, color: "#94A3B8" }} />
          <span className="font-mono" style={{ fontSize: 11, color: "#475569", whiteSpace: "nowrap" }}>{timeRangeInfo}</span>
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  V1.2 PLATFORM CARD CATALOGUE ATOMS
// ════════════════════════════════════════════════════════════════════════════
const V12Card = ({ color, bgColor, children, className }: { color: string; bgColor: string; children: React.ReactNode; className?: string }) => {
  const [h, setH] = useState(false);
  return (
    <div className={cn("w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200", className)}
      style={{ minWidth: 0, border: `1px solid ${color}`, background: bgColor, boxShadow: h ? `0 0 18px 4px ${hex2rgba(color, 0.22)}, 0 4px 14px rgba(0,0,0,0.07)` : `0 0 6px 1px ${hex2rgba(color, 0.10)}, 0 1px 3px rgba(0,0,0,0.04)` }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}>
      {children}
    </div>
  );
};
const V12Divider = ({ color }: { color: string }) => (
  <div style={{ height: 1, backgroundColor: hex2rgba(color, 0.22), margin: "0 16px" }} />
);
const V12Label = ({ label, chip, color }: { label: string; chip?: string; color: string }) => (
  <div className="px-4 pt-4 flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>{label}</span>
    {chip && <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0" style={{ backgroundColor: hex2rgba(color, 0.14), color }}>{chip}</span>}
  </div>
);
const BS = ({ dir, num, ref_, color }: BSProps) => (
  <div className="flex flex-col px-[10px] py-[8px] rounded-[6px] flex-shrink-0" style={{ backgroundColor: hex2rgba(color, 0.12) }}>
    <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color }}>
      {dir === "up" ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" /> : dir === "down" ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" /> : <Minus className="w-3 h-3 flex-shrink-0" />}
      {num}
    </div>
    <div className="text-[10px] font-normal mt-[5px] leading-none text-[#94a3b8]">{ref_}</div>
  </div>
);

// ── Type B Spark: HUDKPICard ──────────────────────────────────────────────────
const HUDKPICard = ({ variant, isSkeleton = false, frozenCursorFrac }: KPICardProps) => {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [cursorFrac, setCursorFrac] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const isFrozen   = frozenCursorFrac !== undefined;
  const activeFrac = isFrozen ? frozenCursorFrac! : cursorFrac;
  const showGlow   = isFrozen || cursorFrac !== null;
  const showCursor = isFrozen || cursorFrac !== null;
  const hover      = isFrozen || isCardHovered;
  const bg          = variant.bgColor ?? hex2rgba(variant.color, 0.08);
  const dividerColor = hex2rgba(variant.color, 0.22);
  const badgeBg      = hex2rgba(variant.color, 0.12);
  const deltaNum = variant.deltaNum ?? variant.deltaPct;
  const deltaRef = variant.deltaRef ?? "vs Yesterday";
  const handleSvgMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setCursorFrac(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, []);
  if (isSkeleton) return (
    <div className="w-full rounded-[4px] flex flex-col" style={{ border: `1px solid ${variant.color}`, background: bg }}>
      <div className="px-4 pt-4 pb-3 flex flex-col"><Sk className="h-3 w-24" /><div className="flex flex-col gap-1 mt-3"><Sk className="h-7 w-20" /><Sk className="h-3 w-32" /></div></div>
      <div style={{ height: 1, margin: "0 16px", backgroundColor: dividerColor }} />
      <div className="px-4 py-3 flex items-center justify-between gap-3"><Sk className="h-[46px] w-[78px] rounded-[6px]" /><Sk className="h-[32px] w-[96px] rounded-[3px]" /></div>
    </div>
  );
  const pts      = buildSparkPath(variant.sparkData, HSW, HSH, HSP);
  const dPath    = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fillPath = `${dPath} L ${pts[pts.length-1][0].toFixed(1)} ${HSH} L ${pts[0][0].toFixed(1)} ${HSH} Z`;
  const [lx, ly] = pts[pts.length - 1];
  const cxPx = activeFrac != null ? HSP + activeFrac * (HSW - HSP * 2) : null;
  const cyPx = activeFrac != null ? (() => {
    const mn = Math.min(...variant.sparkData), mx = Math.max(...variant.sparkData), rng = mx - mn || 1;
    return HSH - HSP - ((interp(variant.sparkData, activeFrac!) - mn) / rng) * (HSH - HSP * 2);
  })() : null;
  const tipVal = activeFrac != null ? interp(variant.sparkData, activeFrac).toFixed(1) + (variant.value.includes("%") ? "%" : "") : null;
  return (
    <div className="w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200"
      style={{ border: `1px solid ${variant.color}`, background: bg, boxShadow: hover ? `0 0 20px 4px ${hex2rgba(variant.color, 0.25)}, 0 4px 16px rgba(0,0,0,0.08)` : `0 0 8px 1px ${hex2rgba(variant.color, 0.12)}, 0 1px 3px rgba(0,0,0,0.04)` }}
      onMouseEnter={() => setIsCardHovered(true)} onMouseLeave={() => { setIsCardHovered(false); setCursorFrac(null); }}>
      <div className="px-4 pt-4 pb-3 flex flex-col">
        <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>{variant.label}</span>
        <div className="flex flex-col gap-[5px] mt-3">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 24 }}>{variant.value}</div>
          <div className="text-[10px] font-normal text-[#64748b]">{variant.sublabel}</div>
        </div>
      </div>
      <div style={{ height: 1, margin: "0 16px", backgroundColor: dividerColor }} />
      <div className="px-4 py-3 flex items-center justify-between gap-3">
        <div className="flex flex-col px-[10px] py-[7px] rounded-[6px] flex-shrink-0" style={{ backgroundColor: badgeBg }}>
          <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color: variant.color }}>
            {variant.dir === "up" ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" /> : variant.dir === "down" ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" /> : <Minus className="w-3 h-3 flex-shrink-0" />}
            {deltaNum}
          </div>
          <div className="text-[9px] font-normal mt-[4px] leading-none text-[#94a3b8]">{deltaRef}</div>
        </div>
        <div className="relative flex-shrink-0">
          {showCursor && tipVal && cxPx != null && (
            <div className="absolute z-10 pointer-events-none -translate-x-1/2" style={{ left: cxPx, top: -26 }}>
              <div className="text-white font-mono text-[9px] font-semibold px-2 py-[3px] rounded-[3px] whitespace-nowrap shadow-lg" style={{ backgroundColor: variant.color }}>{tipVal}</div>
              <div className="w-0 h-0 mx-auto border-x-[3px] border-x-transparent border-t-[3px]" style={{ borderTopColor: variant.color }} />
            </div>
          )}
          <svg ref={svgRef} width={HSW} height={HSH} viewBox={`0 0 ${HSW} ${HSH}`} fill="none"
            className="cursor-crosshair transition-all duration-150"
            style={showGlow ? { filter: `drop-shadow(0 0 4px ${variant.color}) drop-shadow(0 0 8px ${hex2rgba(variant.color, 0.5)})` } : {}}
            onMouseMove={isFrozen ? undefined : handleSvgMove} onMouseLeave={isFrozen ? undefined : () => setCursorFrac(null)}>
            <path d={fillPath} fill={variant.color} opacity="0.12" />
            <path d={dPath} stroke={variant.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lx} cy={ly} r="2" fill={variant.color} opacity="0.3"><animate attributeName="r" values="2;5;2" dur="2.5s" repeatCount="indefinite" /><animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" /></circle>
            <circle cx={lx} cy={ly} r="1.8" fill={variant.color} />
            {showCursor && cxPx != null && cyPx != null && (<><line x1={cxPx} y1={HSP - 1} x2={cxPx} y2={HSH - HSP + 1} stroke={hex2rgba(variant.color, 0.65)} strokeWidth="1" strokeDasharray="2 2" /><circle cx={cxPx} cy={cyPx} r="3" fill={variant.color} stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" /></>)}
          </svg>
        </div>
      </div>
    </div>
  );
};

// ── Type A: V12StatCard ───────────────────────────────────────────────────────
const V12StatCard = ({ d }: { d: StatData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <V12Label label={d.label} chip={d.chip} color={d.color} />
    <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
      <div className="flex flex-col gap-[7px]">
        <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{d.value}</div>
        <div className="text-[12px] text-[#64748b]">{d.sublabel}</div>
      </div>
      <BS dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
    </div>
    <V12Divider color={d.color} />
    <div className="px-4 py-3 flex items-center gap-2">
      <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] flex-shrink-0">Definition</span>
      <span className="text-[11px] text-[#475569]">{d.definition}</span>
    </div>
  </V12Card>
);

// ── Type C: V12AlertCard ──────────────────────────────────────────────────────
const V12AlertCard = ({ d }: { d: AlertData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <div className="px-4 pt-4 pb-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: d.color }}>{d.label}</span>
    </div>
    {d.zoneName ? (
      <>
        <div className="px-4 pt-3 pb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-[7px] min-w-0">
            <div className="text-[16px] font-semibold text-[#0f172a] leading-tight">{d.zoneName}</div>
            <div className="text-[12px] text-[#64748b]">{d.description}</div>
          </div>
          <div className="flex flex-col items-center px-4 py-3 rounded-[6px] flex-shrink-0 bg-white/70">
            <span className="font-mono font-bold leading-none" style={{ fontSize: 22, color: d.color }}>{d.compliance}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] mt-1.5">Compliance</span>
          </div>
        </div>
        <V12Divider color={d.color} />
        <div className="px-4 py-3 flex items-center gap-1.5">
          <span style={{ color: d.color }} className="text-[11px]">⚠</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.4px]" style={{ color: d.color }}>{d.alertInfo}</span>
          <span className="text-[11px] text-[#94a3b8] mx-1">·</span>
          <span className="text-[11px] font-mono text-[#64748b]">{d.cameraId}</span>
        </div>
      </>
    ) : (
      <>
        <div className="px-4 pt-3 pb-1 flex flex-col gap-2">
          {d.zones?.map((z) => (
            <div key={z.name} className="flex items-center justify-between py-2.5 px-3 rounded-[4px]" style={{ backgroundColor: hex2rgba(d.color, 0.08) }}>
              <div>
                <div className="text-[13px] font-semibold text-[#0f172a]">{z.name}</div>
                <div className="text-[11px] text-[#64748b] mt-[5px]">{z.compliance}</div>
              </div>
              <BS dir={z.dir} num={z.num} ref_={z.ref_} color={d.color} />
            </div>
          ))}
        </div>
        <V12Divider color={d.color} />
        <div className="px-4 py-3 flex items-center gap-1.5">
          <span style={{ color: d.color }} className="text-[11px]">⚡</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.4px]" style={{ color: d.color }}>{d.footerNote}</span>
        </div>
      </>
    )}
  </V12Card>
);

// ── Type E: V12CapacityCard ───────────────────────────────────────────────────
const V12CapacityCard = ({ d }: { d: CapData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <div className="px-4 pt-4 pb-0 flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none text-[#475569]">Zone Capacity</span>
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full" style={{ backgroundColor: hex2rgba(d.color, 0.14), color: d.color }}>{d.statusLabel}</span>
    </div>
    <div className="px-4 pt-3 pb-3 flex flex-col gap-[7px]">
      <div className="text-[14px] font-semibold text-[#0f172a]">{d.zoneName}</div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{d.occupancy}%</span>
        <span className="text-[12px] text-[#64748b]">{d.current}/{d.max} staff</span>
      </div>
    </div>
    <div className="px-4 pb-4">
      <div className="h-[6px] rounded-full bg-white/60 overflow-hidden">
        <div className="h-full rounded-full" style={{ width: `${d.occupancy}%`, backgroundColor: d.color }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-[#94a3b8] font-mono">0</span>
        <span className="text-[10px] font-mono font-bold" style={{ color: d.color }}>{d.occupancy}% capacity</span>
        <span className="text-[10px] text-[#94a3b8] font-mono">{d.max}</span>
      </div>
    </div>
  </V12Card>
);

// ── ZoneSummaryCard ───────────────────────────────────────────────────────────
const ZoneSummaryCard = ({ zone }: { zone: typeof ZONES_V12[0] }) => (
  <div className="flex-shrink-0 w-[168px] rounded-[6px] overflow-hidden" style={{ border: "1px solid #E2E8F0", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}>
    <div className="px-3 py-2" style={{ backgroundColor: zone.headerColor }}>
      <div className="text-[11px] font-bold text-white leading-tight">{zone.label}</div>
      <div className="text-[9px] text-white/75 leading-tight mt-[1px]">{zone.sub}</div>
    </div>
    <div className="grid grid-cols-2 gap-[3px] p-[5px] bg-[#F8FAFC]">
      {zone.comps.map((comp) => {
        const st = ZONE_STATUS_CFG[comp.status];
        return (
          <div key={comp.name} className="flex flex-col items-center justify-center gap-[3px] py-[7px] rounded-[4px]" style={{ backgroundColor: st.bg }}>
            <st.Icon className="w-[13px] h-[13px]" style={{ color: st.color }} />
            <span className="text-[8px] font-semibold leading-none" style={{ color: "#64748B" }}>{comp.name}</span>
          </div>
        );
      })}
    </div>
    <div className="px-3 py-2" style={{ borderTop: "1px solid #F1F5F9" }}>
      <p className="text-[9px] leading-snug" style={{ color: "#94A3B8" }}>{zone.note}</p>
    </div>
  </div>
);

// ── AccItemV12 (Accordion v1.2 Enhanced White) ────────────────────────────────
interface AccItemV12Props {
  id: string; icon: React.ElementType; title: string; description: string;
  badgeText: string; badgeNum: string; isOpen: boolean; onToggle: () => void;
  showIcon: boolean; showDescription: boolean; rightSide: "none" | "text" | "icon";
  contentType: "text" | "cards"; severity: AccSeverityV11; capsTitle: boolean;
}
const AccItemV12 = ({ icon: Icon, title, description, badgeText, badgeNum, isOpen, onToggle, showIcon, showDescription, rightSide, contentType, severity, capsTitle }: AccItemV12Props) => {
  const [hovered, setHovered] = useState(false);
  const s = ACC_SEV_V11[severity];
  const isDefault = severity === "default";
  return (
    <div className="rounded-[8px] overflow-hidden transition-all duration-200"
      style={{ border: `1px solid ${isOpen ? s.border : "#E2E8F0"}`, borderLeft: `3px solid ${s.stripe}`, backgroundColor: isOpen ? s.bg : "#ffffff", boxShadow: isOpen ? s.shadow : hovered ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)" }}>
      <button onClick={onToggle} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-3 px-4 text-left outline-none transition-all duration-200"
        style={{ height: 52, backgroundColor: !isOpen && hovered ? "#F8FAFC" : "transparent" }}>
        {showIcon && <Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.iconColor }} />}
        <div className="flex-1 min-w-0">
          <div className="leading-tight truncate transition-all duration-200"
            style={{ color: isOpen ? s.titleOpen : "#0F172A", fontWeight: isOpen ? 700 : capsTitle ? 600 : 500, fontSize: capsTitle ? 11 : 13, textTransform: capsTitle ? "uppercase" : "none", letterSpacing: capsTitle ? "0.07em" : "normal" }}>
            {title}
          </div>
          {showDescription && <div className="text-[11px] mt-0.5 leading-tight truncate" style={{ color: "#94A3B8" }}>{description}</div>}
        </div>
        {rightSide === "text" && (
          <div className="flex-shrink-0 px-2.5 py-1 rounded-[3px] text-[10px] font-mono font-semibold"
            style={{ backgroundColor: s.badgeBg, color: s.badgeColor, border: `1px solid ${isDefault ? "#E2E8F0" : s.border}` }}>
            {badgeText}
          </div>
        )}
        {rightSide === "icon" && (
          <div className="min-w-[22px] h-[18px] px-1.5 rounded-[3px] flex items-center justify-center flex-shrink-0 text-[9px] font-bold"
            style={{ backgroundColor: s.badgeBg, color: s.badgeColor }}>
            {badgeNum}
          </div>
        )}
        <ChevronDown className="w-4 h-4 flex-shrink-0 transition-all duration-200"
          style={{ color: isDefault ? (isOpen ? "#475569" : "#CBD5E1") : s.color, opacity: isOpen ? 1 : 0.45, transform: isOpen ? "rotate(180deg)" : "none" }} />
      </button>
      <div className="overflow-hidden transition-all duration-300" style={{ maxHeight: isOpen ? (contentType === "cards" ? 300 : 200) : 0 }}>
        <div className="pb-4" style={{ borderTop: `1px dashed ${isDefault ? "#E2E8F0" : s.border}` }}>
          {contentType === "text" ? (
            <p className="text-[12px] text-[#475569] leading-relaxed px-4 pt-3">
              Last updated 2 minutes ago. Automated detection flagged anomalous activity across 3 camera feeds. Response team notified. All affected feeds are flagged for manual review.
            </p>
          ) : (
            <div className="px-4 pt-3">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.65px] text-[#94A3B8]">Zone Summary</span>
                <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]" style={{ backgroundColor: isDefault ? "#F1F5F9" : s.badgeBg, color: isDefault ? "#64748B" : s.badgeColor }}>{ZONES_V12.length}</span>
              </div>
              <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                {ZONES_V12.map((zone) => <ZoneSummaryCard key={zone.id} zone={zone} />)}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ════════════════════════════════════════════════════════════════════════════
//  V2.3 ATOMS
// ════════════════════════════════════════════════════════════════════════════
const V23JsonView = ({ row }: { row: GridRow }) => {
  const json = JSON.stringify({
    incident_id: row.id, severity: row.status, event_type: row.event,
    location: { zone: row.zone, camera: row.camera },
    confidence_pct: row.confidence, detected_at: row.timestamp,
    metadata: { response_required: row.status === "critical" || row.status === "high" || row.status === "warning", ai_model: "matrice-vision-v3.2", processing_ms: Math.floor(row.confidence * 0.8), frame_id: `F-${row.id.replace("INC-0", "")}` },
  }, null, 2);
  const tokens = json.split(/("(?:[^"\\]|\\.)*"\s*:?|true|false|null|\b\d+\.?\d*\b)/g);
  return (
    <pre style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, lineHeight: 1.7, margin: 0, padding: "16px 20px", backgroundColor: "#0D1117", color: "#8B949E", overflowX: "auto", whiteSpace: "pre" }}>
      {tokens.map((t, i) => {
        if (/"[^"]*"\s*:/.test(t))  return <span key={i} style={{ color: "#79C0FF" }}>{t}</span>;
        if (/^"[^"]*"$/.test(t))    return <span key={i} style={{ color: "#A5D6FF" }}>{t}</span>;
        if (t === "true")            return <span key={i} style={{ color: "#7EE787" }}>{t}</span>;
        if (t === "false")           return <span key={i} style={{ color: "#FF7B72" }}>{t}</span>;
        if (t === "null")            return <span key={i} style={{ color: "#C9D1D9" }}>{t}</span>;
        if (/^\d/.test(t))           return <span key={i} style={{ color: "#FFA657" }}>{t}</span>;
        return <span key={i}>{t}</span>;
      })}
    </pre>
  );
};
const V23Pill = ({ status }: { status: string }) => {
  const key = status.toLowerCase();
  const bg = SEVERITY_COLORS[key] ?? "#64748B";
  const label = V21_STATUS_CFG[key]?.label ?? status;
  return <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#ffffff", backgroundColor: bg, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>{label}</span>;
};
const V23Checkbox = ({ checked, indeterminate = false, onChange }: { checked: boolean; indeterminate?: boolean; onChange: () => void }) => {
  const active = checked || indeterminate;
  return (
    <button onClick={(e) => { e.stopPropagation(); onChange(); }}
      style={{ width: 15, height: 15, flexShrink: 0, borderRadius: 3, border: `1.5px solid ${active ? "#00775B" : "#CBD5E1"}`, backgroundColor: active ? "#00775B" : "transparent", display: "inline-flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all 100ms ease", padding: 0 }}>
      {indeterminate && !checked && <svg width="7" height="2" viewBox="0 0 7 2" fill="none"><rect x="0" y="0.5" width="7" height="1" rx="0.5" fill="white" /></svg>}
      {checked && <svg width="9" height="7" viewBox="0 0 9 7" fill="none"><path d="M1 3.5L3.5 6L8 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </button>
  );
};
const V23Toggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button onClick={() => onChange(!checked)}
    style={{ position: "relative", flexShrink: 0, borderRadius: 9999, width: 32, height: 18, cursor: "pointer", border: "none", backgroundColor: checked ? "#00775B" : "#CBD5E1", transition: "background-color 200ms ease" }}>
    <span style={{ position: "absolute", top: 2, width: 14, height: 14, backgroundColor: "#fff", borderRadius: "50%", boxShadow: "0 1px 2px rgba(0,0,0,0.15)", left: checked ? "calc(100% - 16px)" : 2, transition: "left 200ms ease" }} />
  </button>
);

// ════════════════════════════════════════════════════════════════════════════
//  STAFF LEDGER  (Seamless HUD v2.3 — all toggles on)
// ════════════════════════════════════════════════════════════════════════════
const StaffLedger = () => {
  const isDark = false;
  const [selectionMode,  setSelectionMode]  = useState(true);
  const [expandableRows, setExpandableRows] = useState(true);
  const [stickyCol,      setStickyCol]      = useState(true);
  const [hScroll,        setHScroll]        = useState(true);
  const [expandContent,  setExpandContent]  = useState<"json" | "table">("json");
  const [selectedIds,    setSelectedIds]    = useState<Set<string>>(new Set());
  const [expandedId,     setExpandedId]     = useState<string | null>(null);
  const [hiddenCols,     setHiddenCols]     = useState<Set<V23ColKey>>(new Set());
  const [colPickerOpen,  setColPickerOpen]  = useState(false);
  const [sortKey,        setSortKey]        = useState("timestamp-desc");
  const [sortOpen,       setSortOpen]       = useState(false);
  const [sevOpen,        setSevOpen]        = useState(false);
  const [appOpen,        setAppOpen]        = useState(false);
  const [zoneOpen,       setZoneOpen]       = useState(false);
  const [searchQ,        setSearchQ]        = useState("");
  const [statusFilters,  setStatusFilters]  = useState<Set<string>>(new Set());
  const [appFilters,     setAppFilters]     = useState<Set<string>>(new Set());
  const [zoneFilters,    setZoneFilters]    = useState<Set<string>>(new Set());
  const [page,           setPage]           = useState(1);
  const [hoveredId,      setHoveredId]      = useState<string | null>(null);

  const closeAllDropdowns = () => { setSortOpen(false); setSevOpen(false); setAppOpen(false); setZoneOpen(false); setColPickerOpen(false); };
  const hasActiveFilters  = searchQ !== "" || statusFilters.size > 0 || appFilters.size > 0 || zoneFilters.size > 0;
  const clearFilters = () => { setSearchQ(""); setStatusFilters(new Set()); setAppFilters(new Set()); setZoneFilters(new Set()); setPage(1); };
  const toggleStatus = (s: string) => { setStatusFilters(p => { const n = new Set(p); n.has(s) ? n.delete(s) : n.add(s); return n; }); setPage(1); };
  const toggleApp    = (a: string) => { setAppFilters(p    => { const n = new Set(p); n.has(a) ? n.delete(a) : n.add(a); return n; }); setPage(1); };
  const toggleZone   = (z: string) => { setZoneFilters(p   => { const n = new Set(p); n.has(z) ? n.delete(z) : n.add(z); return n; }); setPage(1); };

  const currentSortOpt = SORT_OPTIONS_V22.find(o => o.key === sortKey) ?? SORT_OPTIONS_V22[0];
  const sortIsDefault  = sortKey === "timestamp-desc";

  const filteredData = V23_GRID_DATA.filter(r => {
    if (searchQ && ![r.id, r.event, r.zone].some(f => f.toLowerCase().includes(searchQ.toLowerCase()))) return false;
    if (statusFilters.size > 0 && !statusFilters.has(r.status)) return false;
    if (appFilters.size    > 0 && !appFilters.has(r.event))     return false;
    if (zoneFilters.size   > 0 && !zoneFilters.has(r.zone))     return false;
    return true;
  }).sort((a, b) => {
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
  const pageIds       = paginatedData.map(r => r.id);
  const pageSelected  = pageIds.filter(id => selectedIds.has(id));
  const allPageSel    = pageIds.length > 0 && pageSelected.length === pageIds.length;
  const someSel       = pageSelected.length > 0 && !allPageSel;
  const selCount      = selectedIds.size;
  const toggleRowSel  = (id: string) => setSelectedIds(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const togglePageAll = () => {
    if (allPageSel) setSelectedIds(p => { const n = new Set(p); pageIds.forEach(id => n.delete(id)); return n; });
    else            setSelectedIds(p => { const n = new Set(p); pageIds.forEach(id => n.add(id));    return n; });
  };

  const visibleCols = V23_COL_DEFS.filter(c => !hiddenCols.has(c.key));
  const scrollColW  = visibleCols.reduce((s, c) => s + c.minWidth, 0);
  const stickyW     = (selectionMode ? 44 : 0) + 160;
  const totalMinW   = stickyW + scrollColW;

  const teal   = "#00775B";
  const sec    = "#64748B";
  const surface = "#ffffff";
  const hdr    = "#F8FAFC";

  const btnBase: React.CSSProperties = { background: "transparent", border: "none", borderBottom: "2px solid transparent", borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif", color: "#64748B", padding: "4px 2px", transition: "color 150ms ease, border-bottom-color 150ms ease", whiteSpace: "nowrap" };
  const activeBtnBase: React.CSSProperties = { ...btnBase, color: teal, borderBottomColor: teal };
  const dropdownPanel: React.CSSProperties = { position: "absolute", zIndex: 50, top: "calc(100% + 8px)", backgroundColor: "#fff", border: "1px solid #E2E8F0", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden" };
  const ddItem = (active: boolean): React.CSSProperties => ({ display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer", backgroundColor: active ? "rgba(0,119,91,0.05)" : "transparent", fontSize: 12, fontWeight: active ? 600 : 500, fontFamily: "Inter, sans-serif", color: active ? teal : "#334155", transition: "background-color 100ms ease" });

  const ChkBox = ({ checked }: { checked: boolean }) => (
    <span style={{ width: 13, height: 13, flexShrink: 0, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${checked ? teal : "#CBD5E1"}`, backgroundColor: checked ? teal : "transparent" }}>
      {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
    </span>
  );

  const sevLabel  = statusFilters.size === 0 ? "Severity" : statusFilters.size === 1 ? (V21_STATUS_CFG[[...statusFilters][0]]?.label ?? [...statusFilters][0]) : `${statusFilters.size} Severities`;
  const appLabel  = appFilters.size === 0 ? "Events" : appFilters.size === 1 ? ([...appFilters][0].length > 16 ? [...appFilters][0].slice(0, 16) + "…" : [...appFilters][0]) : `${appFilters.size} Events`;
  const zoneLabel = zoneFilters.size === 0 ? "Zones" : zoneFilters.size === 1 ? [...zoneFilters][0] : `${zoneFilters.size} Zones`;

  const renderCell = (key: V23ColKey, row: GridRow, hv: boolean) => {
    const mono: React.CSSProperties  = { fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, fontWeight: 500, color: hv ? "#0F172A" : sec };
    const inter: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 12, color: hv ? "#0F172A" : "#334155" };
    switch (key) {
      case "status":     return <V23Pill status={row.status} />;
      case "event":      return <span style={{ ...inter, fontWeight: 500 }}>{row.event}</span>;
      case "zone":       return <span style={inter}>{row.zone}</span>;
      case "camera":     return <span style={mono}>{row.camera}</span>;
      case "confidence": return <span style={{ ...mono, color: hv ? "#0F172A" : (row.confidence >= 95 ? "#00A63E" : row.confidence >= 80 ? sec : "#EA580C") }}>{row.confidence.toFixed(1)}%</span>;
      case "timestamp":  return <span style={mono}>{row.timestamp}</span>;
      case "priority": {
        const pCfg: Record<string, { color: string; bg: string }> = { High: { color: "#E7000B", bg: "#FEE2E2" }, Medium: { color: "#D97706", bg: "#FEF3C7" }, Low: { color: "#2563EB", bg: "#DBEAFE" } };
        const pv = row.priority ?? "Medium";
        const pc = pCfg[pv] ?? { color: "#64748B", bg: "#F1F5F9" };
        return <span style={{ fontFamily: "Inter, sans-serif", fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: pc.color, backgroundColor: pc.bg, padding: "2px 7px", borderRadius: 4 }}>{pv}</span>;
      }
      case "assignee":  return <span style={{ ...inter, fontWeight: 500 }}>{row.assignee ?? "—"}</span>;
      case "duration":  return <span style={mono}>{row.duration ?? "—"}</span>;
      case "riskScore": {
        const rs = row.riskScore ?? 0;
        const rsCol = rs >= 80 ? "#E7000B" : rs >= 60 ? "#D97706" : "#2563EB";
        return <span style={{ ...mono, fontWeight: 700, color: hv ? "#0F172A" : rsCol }}>{rs}</span>;
      }
    }
  };

  const rowBg = (idx: number, hovered: boolean, selected: boolean): string => {
    if (hovered)       return "#EBF5F1";
    if (selected)      return "#F2FAF7";
    if (idx % 2 === 1) return "#F8FDFC";
    return "#ffffff";
  };

  const TRow = ({ label, val, set }: { label: string; val: boolean; set: (v: boolean) => void }) => (
    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
      <span style={{ fontSize: 11, fontWeight: 500, fontFamily: "Inter, sans-serif", color: "#334155", whiteSpace: "nowrap" }}>{label}</span>
      <V23Toggle checked={val} onChange={set} />
    </div>
  );
  const divider = <div style={{ width: 1, alignSelf: "stretch", backgroundColor: "#E2E8F0", flexShrink: 0 }} />;

  return (
    <div className="space-y-4">
      {/* Control strip */}
      <div style={{ display: "flex", alignItems: "stretch", flexWrap: "wrap", borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff", overflow: "hidden" }}>
        <div style={{ padding: "12px 16px", display: "flex", flexDirection: "column", justifyContent: "center", gap: 2, backgroundColor: "#F8FAFC", borderRight: "1px solid #E2E8F0", flexShrink: 0 }}>
          <span style={{ fontSize: 8, fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.12em", color: teal, fontFamily: "Inter, sans-serif" }}>Controls</span>
          <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono', monospace", color: "#94A3B8" }}>Table v2.3</span>
        </div>
        {divider}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Behaviour</span>
          <div style={{ display: "flex", gap: 16 }}><TRow label="Selection Mode" val={selectionMode} set={setSelectionMode} /><TRow label="Expandable Rows" val={expandableRows} set={setExpandableRows} /></div>
        </div>
        {divider}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Layout</span>
          <div style={{ display: "flex", gap: 16 }}><TRow label="Sticky Col" val={stickyCol} set={setStickyCol} /><TRow label="H-Scroll" val={hScroll} set={setHScroll} /></div>
        </div>
        {divider}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Expand View</span>
          <div style={{ display: "flex", borderRadius: 4, border: "1px solid #E2E8F0", overflow: "hidden", height: 26 }}>
            {(["json", "table"] as const).map(t => (
              <button key={t} onClick={() => setExpandContent(t)}
                style={{ flex: 1, width: 52, fontSize: 10, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", border: "none", cursor: "pointer", backgroundColor: expandContent === t ? teal : "transparent", color: expandContent === t ? "#fff" : sec }}>
                {t === "json" ? "JSON" : "Table"}
              </button>
            ))}
          </div>
        </div>
        {divider}
        <div style={{ padding: "10px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 8, justifyContent: "center" }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Columns</span>
          <div style={{ display: "flex", gap: 5, flexWrap: "wrap" }}>
            {V23_COL_DEFS.map(col => {
              const vis = !hiddenCols.has(col.key);
              return (
                <button key={col.key} onClick={() => setHiddenCols(p => { const n = new Set(p); vis ? n.add(col.key) : n.delete(col.key); return n; })}
                  style={{ fontSize: 10, fontWeight: 600, fontFamily: "Inter, sans-serif", padding: "3px 8px", borderRadius: 4, border: `1px solid ${vis ? teal + "40" : "#E2E8F0"}`, cursor: "pointer", backgroundColor: vis ? `${teal}0D` : "transparent", color: vis ? teal : "#94A3B8", whiteSpace: "nowrap" }}>
                  {col.label}
                </button>
              );
            })}
          </div>
        </div>
        {divider}
        <div style={{ padding: "10px 16px", display: "flex", flexDirection: "column", gap: 8, justifyContent: "center", flexShrink: 0 }}>
          <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Stats</span>
          <div style={{ display: "flex", gap: 12 }}>
            {[{ n: V23_GRID_DATA.length, label: "Total" }, { n: filteredData.length, label: "Filtered" }, { n: selectedIds.size, label: "Selected" }, { n: totalPages, label: "Pages" }].map(({ n, label }) => (
              <div key={label} style={{ display: "flex", flexDirection: "column", gap: 1 }}>
                <span style={{ fontSize: 15, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: teal, lineHeight: 1 }}>{n}</span>
                <span style={{ fontSize: 9, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>{label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table card */}
      <div style={{ borderRadius: 8, border: "1px solid #E2E8F0", overflow: "clip" }}>
        <div style={{ display: "flex", flexDirection: "column" }}>
          {/* Toolbar */}
          <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "10px 16px 10px", backgroundColor: surface, borderBottom: `2px solid ${teal}` }}>
            {selectionMode && selCount > 0 ? (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <V23Checkbox checked={allPageSel} indeterminate={someSel} onChange={togglePageAll} />
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: teal }}>{selCount} item{selCount !== 1 ? "s" : ""} selected</span>
                </div>
                <div style={{ marginLeft: 16, display: "flex", alignItems: "center", gap: 2 }}>
                  {[{ Icon: Download, label: "Export", color: teal }, { Icon: UserPlus, label: "Assign", color: "#2B7FFF" }, { Icon: CheckCircle2, label: "Resolve", color: "#00A63E" }, { Icon: Trash2, label: "Delete", color: "#E7000B" }].map(({ Icon, label, color }) => (
                    <button key={label}
                      onMouseEnter={e => { (e.currentTarget).style.backgroundColor = `${color}12`; (e.currentTarget).style.color = color; }}
                      onMouseLeave={e => { (e.currentTarget).style.backgroundColor = "transparent"; (e.currentTarget).style.color = "#94A3B8"; }}
                      style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 8px", borderRadius: 4, border: "none", cursor: "pointer", background: "transparent", fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif", color: "#94A3B8" }}>
                      <Icon style={{ width: 12, height: 12 }} /> {label}
                    </button>
                  ))}
                </div>
                <button onClick={() => setSelectedIds(new Set())} style={{ ...btnBase, marginLeft: "auto", color: "#94A3B8" }}><X style={{ width: 11, height: 11 }} /> Deselect All</button>
              </>
            ) : (
              <>
                <div style={{ position: "relative", width: 260, flexShrink: 0 }}>
                  <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
                  <input type="text" placeholder="Search incidents, zones…" value={searchQ}
                    onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                    style={{ width: "100%", height: 32, paddingLeft: 34, paddingRight: searchQ ? 28 : 4, fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1E293B", backgroundColor: "transparent", border: "none", borderBottom: "2px solid #E2E8F0", borderRadius: 0, outline: "none" }}
                    onFocus={e => { e.target.style.borderBottomColor = teal; }}
                    onBlur={e  => { e.target.style.borderBottomColor = "#E2E8F0"; }}
                  />
                  {searchQ && <button onClick={() => { setSearchQ(""); setPage(1); }} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}><X style={{ width: 12, height: 12 }} /></button>}
                </div>

                <div style={{ position: "relative" }}>
                  <button onClick={() => { setSortOpen(o => !o); setSevOpen(false); setAppOpen(false); setZoneOpen(false); setColPickerOpen(false); }} style={!sortIsDefault ? activeBtnBase : btnBase}>
                    <SlidersHorizontal style={{ width: 12, height: 12 }} />{sortIsDefault ? "Sort" : currentSortOpt.shortLabel}
                  </button>
                  {sortOpen && (<><div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} /><div style={{ ...dropdownPanel, left: 0, minWidth: 220 }}>{SORT_OPTIONS_V22.map(opt => (<div key={opt.key} onClick={() => { setSortKey(opt.key); setSortOpen(false); }} style={ddItem(sortKey === opt.key)} onMouseEnter={e => { if (sortKey !== opt.key) (e.currentTarget as HTMLElement).style.backgroundColor = "#F8FAFC"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = sortKey === opt.key ? "rgba(0,119,91,0.05)" : "transparent"; }}>{opt.label}</div>))}</div></>)}
                </div>

                <div style={{ position: "relative" }}>
                  <button onClick={() => { setColPickerOpen(o => !o); closeAllDropdowns(); setColPickerOpen(o => !o); }} style={hiddenCols.size > 0 ? activeBtnBase : btnBase}>
                    <Columns3 style={{ width: 12, height: 12 }} />Columns{hiddenCols.size > 0 ? ` (${V23_COL_DEFS.length - hiddenCols.size}/${V23_COL_DEFS.length})` : ""}
                  </button>
                  {colPickerOpen && (<><div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setColPickerOpen(false)} /><div style={{ ...dropdownPanel, left: 0, minWidth: 200 }}><div style={{ padding: "8px 12px 4px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Toggle Columns</div>{V23_COL_DEFS.map(col => { const vis = !hiddenCols.has(col.key); return (<div key={col.key} onClick={() => setHiddenCols(p => { const n = new Set(p); vis ? n.add(col.key) : n.delete(col.key); return n; })} style={ddItem(vis)} onMouseEnter={e => { if (!vis) (e.currentTarget as HTMLElement).style.backgroundColor = "#F8FAFC"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = vis ? "rgba(0,119,91,0.05)" : "transparent"; }}><ChkBox checked={vis} /><span style={{ flex: 1 }}>{col.label}</span><span style={{ fontSize: 9, color: "#94A3B8" }}>{col.minWidth}px</span></div>); })}</div></>)}
                </div>

                <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 12 }}>
                  <button onClick={clearFilters} style={{ ...btnBase, visibility: hasActiveFilters ? "visible" : "hidden", color: "#E7000B", borderBottomColor: "#E7000B", gap: 4 }}><X style={{ width: 12, height: 12 }} /> Clear</button>

                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setSevOpen(o => !o); setSortOpen(false); setAppOpen(false); setZoneOpen(false); setColPickerOpen(false); }} style={{ ...(statusFilters.size > 0 ? activeBtnBase : btnBase), width: 104, overflow: "hidden" }}>
                      <Filter style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{sevLabel}</span>
                    </button>
                    {sevOpen && (<><div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSevOpen(false)} /><div style={{ ...dropdownPanel, minWidth: 210 }}>{ALL_STATUSES_V23.map(s => (<div key={s} onClick={() => toggleStatus(s)} style={ddItem(statusFilters.has(s))} onMouseEnter={e => { if (!statusFilters.has(s)) (e.currentTarget as HTMLElement).style.backgroundColor = "#F8FAFC"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = statusFilters.has(s) ? "rgba(0,119,91,0.05)" : "transparent"; }}><ChkBox checked={statusFilters.has(s)} /><span style={{ flex: 1 }}>{V21_STATUS_CFG[s]?.label ?? s}</span><V23Pill status={s} /></div>))}</div></>)}
                  </div>

                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setAppOpen(o => !o); setSortOpen(false); setSevOpen(false); setZoneOpen(false); setColPickerOpen(false); }} style={{ ...(appFilters.size > 0 ? activeBtnBase : btnBase), width: 104, overflow: "hidden" }}>
                      <Filter style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{appLabel}</span>
                    </button>
                    {appOpen && (<><div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAppOpen(false)} /><div style={{ ...dropdownPanel, minWidth: 230, maxHeight: 280, overflowY: "auto" }}>{ALL_EVENTS_V23.map(a => (<div key={a} onClick={() => toggleApp(a)} style={ddItem(appFilters.has(a))} onMouseEnter={e => { if (!appFilters.has(a)) (e.currentTarget as HTMLElement).style.backgroundColor = "#F8FAFC"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = appFilters.has(a) ? "rgba(0,119,91,0.05)" : "transparent"; }}><ChkBox checked={appFilters.has(a)} /><span style={{ flex: 1 }}>{a}</span></div>))}</div></>)}
                  </div>

                  <div style={{ position: "relative" }}>
                    <button onClick={() => { setZoneOpen(o => !o); setSortOpen(false); setSevOpen(false); setAppOpen(false); setColPickerOpen(false); }} style={{ ...(zoneFilters.size > 0 ? activeBtnBase : btnBase), width: 104, overflow: "hidden" }}>
                      <Filter style={{ width: 12, height: 12, flexShrink: 0 }} /><span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{zoneLabel}</span>
                    </button>
                    {zoneOpen && (<><div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setZoneOpen(false)} /><div style={{ ...dropdownPanel, minWidth: 200, maxHeight: 280, overflowY: "auto" }}>{ALL_ZONES_V23.map(z => (<div key={z} onClick={() => toggleZone(z)} style={ddItem(zoneFilters.has(z))} onMouseEnter={e => { if (!zoneFilters.has(z)) (e.currentTarget as HTMLElement).style.backgroundColor = "#F8FAFC"; }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = zoneFilters.has(z) ? "rgba(0,119,91,0.05)" : "transparent"; }}><ChkBox checked={zoneFilters.has(z)} /><span style={{ flex: 1 }}>{z}</span></div>))}</div></>)}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Table */}
          <div style={{ overflowX: hScroll ? "auto" : "hidden", backgroundColor: surface }}>
            <div style={{ display: "flex", alignItems: "center", height: 44, backgroundColor: hdr, minWidth: hScroll ? totalMinW : undefined, borderBottom: "1px solid #E2E8F0" }}>
              <div style={{ display: "flex", alignItems: "center", flexShrink: 0, position: stickyCol && hScroll ? "sticky" : "relative", left: 0, zIndex: 3, backgroundColor: hdr, height: "100%", boxShadow: stickyCol && hScroll ? "2px 0 6px rgba(0,0,0,0.05)" : undefined }}>
                {selectionMode && <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><V23Checkbox checked={allPageSel} indeterminate={someSel} onChange={togglePageAll} /></div>}
                <div style={{ width: 160, paddingLeft: selectionMode ? 4 : 12, paddingRight: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  {expandableRows && <span style={{ width: 16, height: 16, flexShrink: 0 }} />}
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>Incident ID</span>
                </div>
              </div>
              {visibleCols.map(col => (
                <div key={col.key} style={{ ...(hScroll ? { flexShrink: 0, width: col.minWidth } : { flex: col.minWidth }), paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center" }}>
                  <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</span>
                </div>
              ))}
            </div>

            {paginatedData.length === 0 ? (
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>
                No incidents match the current filters.{" "}{hasActiveFilters && <button onClick={clearFilters} style={{ marginLeft: 8, color: teal, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Clear filters</button>}
              </div>
            ) : paginatedData.map((row, idx) => {
              const isHov = hoveredId === row.id || idx === 0;
              const isSel = selectedIds.has(row.id);
              const isExp = expandedId === row.id;
              const bg    = rowBg(idx, isHov, isSel);
              const sevColor = SEVERITY_COLORS[row.status] ?? "#64748B";
              return (
                <div key={row.id}>
                  <div onMouseEnter={() => setHoveredId(row.id)} onMouseLeave={() => setHoveredId(null)}
                    onClick={() => selectionMode && selCount > 0 ? toggleRowSel(row.id) : undefined}
                    style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: hScroll ? totalMinW : undefined, backgroundColor: bg, borderBottom: "1px solid #F1F5F9", position: "relative", cursor: selectionMode && selCount > 0 ? "pointer" : "default", transition: "background-color 100ms ease" }}>
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, backgroundColor: sevColor, opacity: isHov || isSel ? 1 : 0, transition: "opacity 100ms ease" }} />
                    <div style={{ display: "flex", alignItems: "center", flexShrink: 0, position: stickyCol && hScroll ? "sticky" : "relative", left: 0, zIndex: 2, backgroundColor: bg, height: "100%", minHeight: 44, transition: "background-color 100ms ease", boxShadow: stickyCol && hScroll ? "2px 0 6px rgba(0,0,0,0.04)" : undefined }}>
                      {selectionMode && <div style={{ width: 44, display: "flex", alignItems: "center", justifyContent: "center" }}><V23Checkbox checked={isSel} onChange={() => toggleRowSel(row.id)} /></div>}
                      <div style={{ width: 160, paddingLeft: selectionMode ? 4 : 12, paddingRight: 8, display: "flex", alignItems: "center", gap: 6, height: "100%" }}>
                        {expandableRows && (
                          <button onClick={e => { e.stopPropagation(); setExpandedId(prev => prev === row.id ? null : row.id); }}
                            style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", padding: 0, flexShrink: 0, borderRadius: 3, color: isHov ? "#64748B" : "#CBD5E1" }}>
                            <ChevronRight style={{ width: 12, height: 12, transition: "transform 150ms ease", transform: isExp ? "rotate(90deg)" : "none" }} />
                          </button>
                        )}
                        <span style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, fontWeight: isHov ? 700 : 600, color: isHov ? "#0F172A" : "#475569", letterSpacing: "0.01em" }}>{row.id}</span>
                      </div>
                    </div>
                    {visibleCols.map(col => (
                      <div key={col.key} style={{ ...(hScroll ? { flexShrink: 0, width: col.minWidth } : { flex: col.minWidth }), paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", minHeight: 44 }}>
                        {renderCell(col.key, row, isHov)}
                      </div>
                    ))}
                    <div style={{ position: "sticky", right: 0, zIndex: 4, flexShrink: 0, height: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 4, paddingLeft: 36, paddingRight: 10, background: `linear-gradient(to right, ${bg}00 0%, ${bg} 36px)`, opacity: isHov ? 1 : 0, pointerEvents: isHov ? "auto" : "none", transition: "opacity 120ms ease" }}>
                      {[{ Icon: Eye, title: "View", hc: teal }, { Icon: UserPlus, title: "Assign", hc: teal }, { Icon: Trash2, title: "Delete", hc: "#E7000B" }].map(({ Icon, title, hc }, btnIdx) => {
                        const isPinned = idx === 0 && btnIdx === 0;
                        return (
                          <button key={title} title={title}
                            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hc; (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; (e.currentTarget as HTMLButtonElement).style.borderColor = hc; }}
                            onMouseLeave={e => { if (isPinned) { (e.currentTarget as HTMLButtonElement).style.backgroundColor = hc; (e.currentTarget as HTMLButtonElement).style.color = "#ffffff"; (e.currentTarget as HTMLButtonElement).style.borderColor = hc; } else { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; } }}
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 5, border: `1px solid ${isPinned ? hc : "#E2E8F0"}`, backgroundColor: isPinned ? hc : "#F1F5F9", cursor: "pointer", color: isPinned ? "#ffffff" : "#64748B" }}>
                            <Icon style={{ width: 12, height: 12 }} />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  {isExp && expandableRows && (
                    <div style={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: "#F8FAFC", borderBottom: "1px solid rgba(0,119,91,0.15)", borderLeft: `3px solid ${sevColor}` }}>
                      {(() => {
                        const subIndent = (selectionMode ? 44 : 0) + (selectionMode ? 4 : 12) + 16 + 6 - 3;
                        const subCols   = "160px minmax(180px, 260px) 80px 180px";
                        return (
                          <>
                            <div style={{ display: "flex", alignItems: "center", gap: 10, paddingTop: 8, paddingBottom: 6, paddingLeft: subIndent, paddingRight: 16, borderBottom: "1px solid rgba(0,119,91,0.1)" }}>
                              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: "#475569" }}>{row.id}</span>
                              <span style={{ fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>·</span>
                              <span style={{ fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>{row.event}</span>
                              <div style={{ marginLeft: "auto", display: "flex", gap: 4 }}>
                                <button onClick={() => setExpandContent("json")} style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 3, border: "none", cursor: "pointer", backgroundColor: expandContent === "json" ? teal : "#E2E8F0", color: expandContent === "json" ? "#fff" : sec }}>JSON</button>
                                <button onClick={() => setExpandContent("table")} style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", textTransform: "uppercase", letterSpacing: "0.06em", padding: "2px 8px", borderRadius: 3, border: "none", cursor: "pointer", backgroundColor: expandContent === "table" ? teal : "#E2E8F0", color: expandContent === "table" ? "#fff" : sec }}>Sub-Table</button>
                              </div>
                              <button onClick={() => setExpandedId(null)} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 20, height: 20, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: sec }}><ChevronUp style={{ width: 12, height: 12 }} /></button>
                            </div>
                            {expandContent === "json" ? (
                              <V23JsonView row={row} />
                            ) : (
                              <div style={{ padding: "0 0 8px" }}>
                                <div style={{ display: "grid", gridTemplateColumns: subCols, alignItems: "center", height: 34, paddingLeft: subIndent, paddingRight: 16, backgroundColor: "rgba(0,0,0,0.05)", borderBottom: "1px solid rgba(0,0,0,0.08)" }}>
                                  {["Sub-Event ID", "Event Type", "Conf.", "Timestamp"].map(h => (
                                    <span key={h} style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "#475569", fontFamily: "Inter, sans-serif", paddingRight: 16 }}>{h}</span>
                                  ))}
                                </div>
                                {(V23_SUB_DATA[row.id] ?? [
                                  { id: `${row.id}-S1`, event: "Pre-event Motion Detected", camera: row.camera, confidence: +(row.confidence - 5.2).toFixed(1), timestamp: row.timestamp },
                                  { id: `${row.id}-S2`, event: "Sensor Threshold Breach",   camera: row.camera, confidence: +(row.confidence - 10.4).toFixed(1), timestamp: row.timestamp },
                                  { id: `${row.id}-S3`, event: "Camera Zone Alert",          camera: row.camera, confidence: +(row.confidence - 15.6).toFixed(1), timestamp: row.timestamp },
                                ]).map((sub, si) => (
                                  <div key={sub.id} style={{ display: "grid", gridTemplateColumns: subCols, alignItems: "center", height: 36, paddingLeft: subIndent, paddingRight: 16, backgroundColor: si % 2 === 1 ? "rgba(0,119,91,0.015)" : "transparent", borderTop: "1px solid rgba(0,119,91,0.06)" }}>
                                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#94A3B8", paddingRight: 16 }}>{sub.id}</span>
                                    <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, color: "#334155", paddingRight: 16 }}>{sub.event}</span>
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
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 16px", position: "relative", borderTop: "1px solid #F1F5F9", backgroundColor: surface }}>
              <button onClick={() => setPage(1)} disabled={page === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", backgroundColor: "#F1F5F9", color: page === 1 ? "#CBD5E1" : "#475569" }}><ChevronsLeft style={{ width: 13, height: 13 }} /></button>
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", backgroundColor: "transparent", color: page === 1 ? "#CBD5E1" : "#475569" }}><ChevronLeft style={{ width: 13, height: 13 }} /></button>
              {pagWindow.map(p => (
                <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: 4, border: page === p ? `1px solid ${teal}40` : "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", backgroundColor: page === p ? teal : "#F1F5F9", color: page === p ? "#ffffff" : "#94A3B8" }}>{p}</button>
              ))}
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", backgroundColor: "transparent", color: page === totalPages ? "#CBD5E1" : "#475569" }}><ChevronRight style={{ width: 13, height: 13 }} /></button>
              <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", backgroundColor: "#F1F5F9", color: page === totalPages ? "#CBD5E1" : "#475569" }}><ChevronsRight style={{ width: 13, height: 13 }} /></button>
              <div style={{ position: "absolute", right: 16, fontSize: 11, color: sec, fontFamily: "Inter, sans-serif" }}>
                <span>Showing </span><span style={{ fontWeight: 600, color: "#334155" }}>{(page - 1) * ROWS_PER_PAGE_V23 + 1}–{Math.min(page * ROWS_PER_PAGE_V23, filteredData.length)}</span><span> of </span><span style={{ fontWeight: 600, color: "#334155" }}>{filteredData.length}</span><span> incidents</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ── Staff Activity Chart data ─────────────────────────────────────────────────
const STAFF_CHART_DATA = [
  { time: "06:00", onDuty: 38,  ppeCompliant: 31 },
  { time: "07:00", onDuty: 74,  ppeCompliant: 61 },
  { time: "08:00", onDuty: 112, ppeCompliant: 95 },
  { time: "09:00", onDuty: 131, ppeCompliant: 114 },
  { time: "10:00", onDuty: 138, ppeCompliant: 120 },
  { time: "11:00", onDuty: 142, ppeCompliant: 127 },
  { time: "12:00", onDuty: 135, ppeCompliant: 118 },
  { time: "13:00", onDuty: 138, ppeCompliant: 122 },
  { time: "14:00", onDuty: 142, ppeCompliant: 130 },
];

// ── Stacked Area Chart ────────────────────────────────────────────────────────
const StackedAreaChart = () => (
  <div className="w-full h-full flex flex-col" style={{
    minHeight: 280, borderRadius: 6,
    border: "1px solid rgba(0,119,91,0.14)",
    backgroundColor: "#ffffff",
    boxShadow: "0 0 6px 1px rgba(0,119,91,0.06), 0 1px 3px rgba(0,0,0,0.04)",
  }}>
    {/* Header */}
    <div className="flex items-start justify-between px-5 pt-4 pb-3 flex-shrink-0">
      <div>
        <p className="text-[11px] font-bold uppercase tracking-[0.05em] text-[#475569] leading-none">Staff Activity</p>
        <p className="text-[10px] font-mono text-[#94A3B8] mt-1 leading-none">8-hour rolling · shift view</p>
      </div>
      <div className="flex items-center gap-5 flex-shrink-0">
        <div className="flex items-center gap-1.5">
          <span style={{ display: "block", width: 20, height: 2.5, borderRadius: 9999, backgroundColor: "#00775B" }} />
          <span className="text-[10px] font-medium text-[#64748B]">On Duty</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span style={{ display: "block", width: 20, height: 2.5, borderRadius: 9999, backgroundColor: "#34D399" }} />
          <span className="text-[10px] font-medium text-[#64748B]">PPE Compliant</span>
        </div>
      </div>
    </div>
    <div style={{ height: 1, backgroundColor: "rgba(0,119,91,0.08)", margin: "0" }} />
    {/* Chart */}
    <div className="flex-1 px-4 pb-4 pt-3" style={{ minHeight: 200 }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={STAFF_CHART_DATA} margin={{ top: 6, right: 4, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="smGradOnDuty" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#00775B" stopOpacity={0.20} />
              <stop offset="100%" stopColor="#00775B" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="smGradPPE" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%"   stopColor="#34D399" stopOpacity={0.22} />
              <stop offset="100%" stopColor="#34D399" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" stroke="#F1F5F9" vertical={false} />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "Inter, sans-serif" }}
            axisLine={{ stroke: "#E2E8F0" }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "Inter, sans-serif" }}
            axisLine={false}
            tickLine={false}
            width={34}
          />
          <Tooltip
            contentStyle={{
              fontSize: 11, fontFamily: "Inter, sans-serif",
              borderRadius: 4, border: "1px solid #E2E8F0",
              boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
              padding: "6px 10px",
            }}
            labelStyle={{ fontWeight: 600, color: "#0F172A", marginBottom: 4 }}
          />
          <Area type="monotone" dataKey="onDuty"      stroke="#00775B" strokeWidth={1.5}
            fill="url(#smGradOnDuty)" name="On Duty"
            dot={false} activeDot={{ r: 4, fill: "#00775B", stroke: "#ffffff", strokeWidth: 2 }} />
          <Area type="monotone" dataKey="ppeCompliant" stroke="#34D399" strokeWidth={1.5}
            fill="url(#smGradPPE)" name="PPE Compliant"
            dot={false} activeDot={{ r: 4, fill: "#34D399", stroke: "#ffffff", strokeWidth: 2 }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  </div>
);

// ════════════════════════════════════════════════════════════════════════════
//  PAGE DATA
// ════════════════════════════════════════════════════════════════════════════

// Type B Spark — HIGH severity (orange)
const STAFF_KPI_CARD: CardVariant = {
  id: "staff-kpi", label: "Active Staff On Duty", sublabel: "All Zones · Live",
  value: "142", deltaPct: "+6%", deltaNum: "+6%", deltaRef: "vs Yesterday",
  dir: "up", subtext: "", color: "#EA580C", bgColor: "#FEEFE7", name: "High",
  sparkData: [118, 122, 127, 131, 135, 138, 140, 142],
};

// Type E Capacity — CRITICAL severity (red)
const STAFF_CAP_CARD: CapData = {
  zoneName: "Loading Dock A", current: 56, max: 60,
  occupancy: 93, statusLabel: "CRITICAL", color: "#E7000B", bgColor: "#FFE5E7",
};

// Type C Alert — MEDIUM severity (amber)
const STAFF_ALERT_CARD: AlertData = {
  label: "Active PPE Violations", color: "#E19A04", bgColor: "rgba(225,154,4,0.05)",
  zoneName: "Assembly Line 2", description: "Vest & hardhat non-compliance on morning shift",
  compliance: "74%", alertInfo: "18 VIOLATIONS TODAY", cameraId: "CAM-AL-007",
};

// Type A Stat — STABLE severity (green)
const STAFF_STAT_CARD: StatData = {
  label: "Avg Response Time", chip: "LIVE", color: "#00A63E", bgColor: "#E5FFEF",
  value: "4.2m", sublabel: "Alert-to-action · Rolling 8h",
  num: "-1.8m", ref_: "vs Yesterday", dir: "down",
  definition: "Time from alert trigger to first responder acknowledgement",
};

// 6 accordion items — critical / high / medium / stable / info / resolved
const STAFF_ACC_ITEMS = [
  { id: "acc-1", icon: ShieldAlert,   severity: "critical" as AccSeverityV11, title: "Hardhat Violations — Loading Dock",      description: "23 violations detected this shift · 3 cameras flagged", badgeText: "23 Events", badgeNum: "23" },
  { id: "acc-2", icon: AlertTriangle, severity: "high"     as AccSeverityV11, title: "Safety Zone Breach — Assembly Line 2",   description: "Unauthorised personnel in restricted area",             badgeText: "11 Events", badgeNum: "11" },
  { id: "acc-3", icon: Users,         severity: "medium"   as AccSeverityV11, title: "Crowd Density Alert — Main Entrance",    description: "Queue length exceeding threshold during shift change",  badgeText: "7 Events",  badgeNum: "7"  },
  { id: "acc-4", icon: CheckCircle2,  severity: "stable"   as AccSeverityV11, title: "Daily Safety Checks Passed",             description: "All 14 checkpoints cleared across 4 zones",            badgeText: "14/14",     badgeNum: "14" },
  { id: "acc-5", icon: Bell,          severity: "info"     as AccSeverityV11, title: "System Calibration Scheduled",           description: "Sensor re-calibration window: 02:00–04:00 tonight",   badgeText: "Scheduled", badgeNum: "1"  },
  { id: "acc-6", icon: Shield,        severity: "resolved" as AccSeverityV11, title: "Shift Handover — Night to Day",          description: "All incidents reviewed and closed · handover complete", badgeText: "Resolved",  badgeNum: "0"  },
];

// ════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ════════════════════════════════════════════════════════════════════════════
export function StaffMonitoring() {
  const [timeRange,     setTimeRange]     = useState<"5M" | "1H" | "1D" | "1W">("1H");
  const [selectedZones, setSelectedZones] = useState<string[]>([]);
  const [freshness,     setFreshness]     = useState(0);
  const [openAccItems,  setOpenAccItems]  = useState<string[]>(["acc-1"]);

  useEffect(() => {
    const id = setInterval(() => setFreshness(s => (s >= 90 ? 0 : s + 1)), 1000);
    return () => clearInterval(id);
  }, []);

  const toggleZone = (z: string) => {
    if (z === "all") { setSelectedZones([]); return; }
    setSelectedZones(prev => prev.includes(z) ? prev.filter(x => x !== z) : [...prev, z]);
  };
  const toggleAccItem = (id: string) =>
    setOpenAccItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);

  const timeRangeInfo = timeRange === "5M" ? "Last 5 minutes" : timeRange === "1H" ? "Last 60 minutes" : timeRange === "1D" ? "Last 24 hours" : "Last 7 days";

  return (
    <div className="relative">
      <FloatingHUD
        timeRange={timeRange}
        onTimeRangeChange={(r) => setTimeRange(r as "5M" | "1H" | "1D" | "1W")}
        selectedZones={selectedZones}
        onToggleZone={toggleZone}
        dataFreshnessSeconds={freshness}
        sidebarCollapsed={false}
        timeRangeInfo={timeRangeInfo}
      />

      {/*
        Spacer maths (all from AppLayout scroll-container top = viewport y 48):
          HUD fixed top:64 + minH:52 = bottom at viewport y 116
          AppLayout content div has p-6 (24px) top padding → first content at y 72
          Spacer needed = (116 + 16gap) - 72 = 60px
      */}
      <div style={{ height: 60 }} />

      {/* ── Max-width content shell: 1200px, centred, 32px inter-section gaps ── */}
      <div className="max-w-[1200px] mx-auto pb-10 space-y-8">

        {/* ── Row 1 · 2×2 KPI cards + Stacked Area Chart ───────────────────── */}
        <div className="grid grid-cols-1 xl:grid-cols-[520px_1fr] gap-6">
          <div className="grid grid-cols-2 gap-4">
            <HUDKPICard variant={STAFF_KPI_CARD} />
            <V12CapacityCard d={STAFF_CAP_CARD} />
            <V12AlertCard d={STAFF_ALERT_CARD} />
            <V12StatCard d={STAFF_STAT_CARD} />
          </div>
          <StackedAreaChart />
        </div>

        {/* ── Row 2 · Ledger table (flex-1) + Zone Alerts sidebar (300px sticky) */}
        <div className="flex gap-6 items-start">

          {/* Table — constrained, h-scroll enabled internally */}
          <div className="flex-1 min-w-0">
            <StaffLedger />
          </div>

          {/* Zone Alerts sidebar — always visible, sticky below HUD */}
          <div
            className="flex-shrink-0 w-[300px] space-y-2"
            style={{ position: "sticky", top: 84 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#475569]">Zone Alerts</span>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] bg-[#F1F5F9] text-[#64748B]">{STAFF_ACC_ITEMS.length} items</span>
            </div>
            {STAFF_ACC_ITEMS.map((item) => (
              <AccItemV12
                key={item.id} id={item.id} icon={item.icon}
                title={item.title} description={item.description}
                badgeText={item.badgeText} badgeNum={item.badgeNum}
                isOpen={openAccItems.includes(item.id)}
                onToggle={() => toggleAccItem(item.id)}
                showIcon={true} showDescription={true}
                rightSide="text" contentType="cards"
                severity={item.severity} capsTitle={false}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
