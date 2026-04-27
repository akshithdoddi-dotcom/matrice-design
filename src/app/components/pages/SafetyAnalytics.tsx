import { useState, useEffect } from "react";
import { Persona } from "../dashboard/PersonaSwitcher";
import { AlertTriangle, TrendingDown, TrendingUp, X, CheckCircle2, AlertCircle, ChevronLeft, ChevronRight, ChevronDown, Clock } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Dot, Cell, PieChart, Pie } from "recharts";
import { FilterDropdown } from "@/app/components/ui/FilterDropdown";

// ─── Sparkline component ──────────────────────────────────────────────────────
const SafetySparkline = ({
  data, color, width = 160, height = 28,
}: { data: number[]; color: string; width?: number; height?: number }) => {
  const PAD = 2, W = width, H = height;
  if (!data || data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  const pts = data.map((v, i) => [
    PAD + (i / (data.length - 1)) * (W - PAD * 2),
    H - PAD - ((v - min) / range) * (H - PAD * 2),
  ]);
  const d = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const [nx, ny] = pts[pts.length - 1];
  return (
    <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none" className="block">
      <path d={d} stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" opacity="0.9" />
      <circle cx={nx} cy={ny} r="2.5" fill={color} opacity="0.3">
        <animate attributeName="r" values="2.5;5;2.5" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={nx} cy={ny} r="2.5" fill={color} />
    </svg>
  );
};

// ─── Floating HUD ────────────────────────────────────────────────────────────
// position: fixed (not sticky) — parent overflow-x:hidden breaks sticky.
// Left edge tracks the fixed sidebar width + matching p-6 (24px) content padding.
const SB_EXPANDED_W = 224;  // Sidebar w-56 = 14rem = 224px
const SB_COLLAPSED_W = 56;  // Sidebar w-14 = 3.5rem = 56px
const CONTENT_PAD = 24;     // App.tsx p-6 = 1.5rem = 24px

const FloatingHUD = ({
  timeRange,
  onTimeRangeChange,
  selectedApps,
  onToggleApp,
  dataFreshnessSeconds,
  persona,
  sidebarCollapsed,
  timeRangeInfo,
}: {
  timeRange: "5M" | "1H" | "1D" | "1W";
  onTimeRangeChange: (r: string) => void;
  selectedApps: string[];
  onToggleApp: (app: string) => void;
  dataFreshnessSeconds: number;
  persona: Persona;
  sidebarCollapsed: boolean;
  timeRangeInfo: string;
}) => {
  const pipelineName =
    selectedApps.length === 1
      ? selectedApps[0]
      : selectedApps.length > 1
      ? `${selectedApps.length} Pipelines`
      : "PPE Detection";

  const sidebarW = sidebarCollapsed ? SB_COLLAPSED_W : SB_EXPANDED_W;

  return (
    <div
      style={{
        position: "fixed",
        // header h-12 = 48px, then match the p-6 = 24px horizontal gap
        top: 48 + CONTENT_PAD,
        left: sidebarW + CONTENT_PAD,
        right: CONTENT_PAD,
        height: 40,
        zIndex: 20,
        backgroundColor: "rgba(241, 245, 249, 0.88)",
        backdropFilter: "blur(14px)",
        WebkitBackdropFilter: "blur(14px)",
        border: "1px solid rgba(0, 119, 91, 0.2)",
        boxShadow: "0 4px 16px rgba(0,0,0,0.07), 0 1px 3px rgba(0,0,0,0.05)",
        borderRadius: 6,
        display: "flex",
        alignItems: "center",
        paddingLeft: 14,
        paddingRight: 10,
        transition: "left 300ms cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* ── Left: Breadcrumb + live sync ────────────────────────────────── */}
      <div className="flex items-center gap-[6px] flex-shrink-0 min-w-0">
        <span className="text-[12px] text-[rgba(13,31,27,0.42)]">Project:</span>
        <span className="font-mono text-[12px] font-medium text-[#0d1f1b]">Matrice AI</span>
        <ChevronDown className="w-[11px] h-[11px] text-[rgba(13,31,27,0.25)] -rotate-90 flex-shrink-0" />
        <span className="text-[12px] text-[rgba(13,31,27,0.42)]">Pipeline:</span>
        <span className="font-mono text-[12px] font-medium text-[#0d1f1b]">{pipelineName}</span>

        {persona === "monitoring" && (
          <>
            <div className="h-3.5 w-px bg-[rgba(0,119,91,0.2)] flex-shrink-0 mx-0.5" />
            {/* Pulsing live dot */}
            <span className="relative flex-shrink-0 w-[6px] h-[6px]">
              <span
                className="absolute inset-0 rounded-full animate-ping"
                style={{
                  backgroundColor: dataFreshnessSeconds < 60 ? "rgba(0,119,91,0.5)" : "rgba(234,179,8,0.5)",
                }}
              />
              <span
                className="relative block w-full h-full rounded-full"
                style={{ backgroundColor: dataFreshnessSeconds < 60 ? "#00775B" : "#EAB308" }}
              />
            </span>
            <span className="text-[11px] text-[#64748B] leading-none">
              Updated{" "}
              <span className="font-mono font-medium text-[#334155] tabular-nums">
                {dataFreshnessSeconds}s
              </span>{" "}
              ago
            </span>
          </>
        )}
      </div>

      {/* ── Flex spacer ─────────────────────────────────────────────────── */}
      <div className="flex-1" />

      {/* ── Right: App filter + Time Range pills + Info chip ─────────────── */}
      <div className="flex items-center gap-2 flex-shrink-0">

        {/* App multi-select dropdown — unchanged functionality */}
        <FilterDropdown
          label="Apps"
          options={["all", "PPE", "Intrusion", "Crowd", "LPR", "Face Recog"]}
          selectedItems={selectedApps}
          onToggleItem={onToggleApp}
          className="w-[140px]"
        />

        {/* Time range pill group */}
        <div className="flex items-center rounded-[4px] border border-[rgba(0,119,91,0.2)] bg-white/50 p-[2px] gap-[1px]">
          {(["5M", "1H", "1D", "1W"] as const).map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={cn(
                "px-[10px] py-[3px] text-[10px] font-bold uppercase tracking-wide rounded-[3px] transition-all leading-none",
                timeRange === r
                  ? "bg-[#00775B] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-[rgba(0,119,91,0.08)] hover:text-[#00775B]"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Time-range info chip */}
        <div className="flex items-center gap-1.5 h-[28px] px-2.5 bg-white/50 border border-[rgba(0,119,91,0.15)] rounded-[4px] text-[11px] text-neutral-500 font-mono w-44 overflow-hidden flex-shrink-0">
          <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="truncate">{timeRangeInfo}</span>
        </div>
      </div>
    </div>
  );
};

// ─── Static data ──────────────────────────────────────────────────────────────
const SAFETY_METRICS = {
  complianceRate: 94.3,
  complianceChange: 2.1,
  violationCount: 47,
  violationChange: -12,
  topRiskZone: "Loading Dock",
};

const COMPLIANCE_SPARKLINE = [98, 97, 96, 92, 89, 91, 93, 90, 94, 96, 97, 94.3];
const VIOLATION_SPARKLINE  = [1, 2, 3, 8, 14, 11, 9, 13, 7, 4, 3, 7];

const COMPLIANCE_TREND_DATA = [
  { time: "00:00", compliance: 98, violations: 1 },
  { time: "02:00", compliance: 97, violations: 2 },
  { time: "04:00", compliance: 96, violations: 3 },
  { time: "06:00", compliance: 92, violations: 8 },
  { time: "08:00", compliance: 89, violations: 14 },
  { time: "10:00", compliance: 91, violations: 11 },
  { time: "12:00", compliance: 93, violations: 9 },
  { time: "14:00", compliance: 90, violations: 13 },
  { time: "16:00", compliance: 94, violations: 7 },
  { time: "18:00", compliance: 96, violations: 4 },
  { time: "20:00", compliance: 97, violations: 3 },
  { time: "22:00", compliance: 98, violations: 2 },
];

const ZONE_COMPLIANCE_DATA = [
  { time: "00:00", loadingDock: 95, assembly: 98, warehouse: 96 },
  { time: "04:00", loadingDock: 92, assembly: 97, warehouse: 95 },
  { time: "08:00", loadingDock: 85, assembly: 94, warehouse: 91 },
  { time: "12:00", loadingDock: 88, assembly: 95, warehouse: 93 },
  { time: "16:00", loadingDock: 90, assembly: 96, warehouse: 94 },
  { time: "20:00", loadingDock: 94, assembly: 97, warehouse: 96 },
];

const VIOLATION_BY_TYPE_DATA = [
  { time: "00:00", ppe: 1, unsafeBehavior: 0 },
  { time: "04:00", ppe: 2, unsafeBehavior: 1 },
  { time: "08:00", ppe: 10, unsafeBehavior: 4 },
  { time: "12:00", ppe: 7, unsafeBehavior: 2 },
  { time: "16:00", ppe: 5, unsafeBehavior: 2 },
  { time: "20:00", ppe: 2, unsafeBehavior: 1 },
];

const HEATMAP_ZONES = [
  { zone: "Loading Dock",    violations: 23, risk: "high"   },
  { zone: "Assembly Line 1", violations: 8,  risk: "medium" },
  { zone: "Warehouse A",     violations: 6,  risk: "medium" },
  { zone: "Main Entrance",   violations: 5,  risk: "low"    },
  { zone: "Packaging Area",  violations: 3,  risk: "low"    },
  { zone: "North Parking",   violations: 2,  risk: "low"    },
];

// Compliance by zone bar — bottom 3 highlighted
const ZONE_COMPLIANCE_BAR = [
  { zone: "N.Parking", compliance: 99, color: "#00A63E" },
  { zone: "Main Ent.", compliance: 98, color: "#00A63E" },
  { zone: "Packaging", compliance: 97, color: "#00A63E" },
  { zone: "Assembly",  compliance: 92, color: "#E19A04" },
  { zone: "Warehouse", compliance: 87, color: "#EA580C" },
  { zone: "Load.Dock", compliance: 68, color: "#E7000B" },
];

// Violation types pie
const VIOLATION_TYPE_PIE = [
  { name: "No Helmet",       value: 28, pct: "60%", color: "#E7000B" },
  { name: "Unsafe Behavior", value: 14, pct: "30%", color: "#EA580C" },
  { name: "No Vest/Gloves",  value: 5,  pct: "10%", color: "#E19A04" },
];

// Cautionary zones (approaching threshold)
const CAUTIONARY_ZONES = [
  { zone: "Assembly Line 2", compliance: 84, change: -5 },
  { zone: "Warehouse B",     compliance: 86, change: -3 },
];

// ─── TypeScript interfaces ────────────────────────────────────────────────────
interface SafetyViolation {
  id: number;
  time: string;
  cameraId: string;
  zone: string;
  type: "PPE" | "Unsafe Behavior" | "Restricted Access";
  severity: "Critical" | "High" | "Medium";
  trackerId: string;
  imageUrl: string;
  compliance: { helmet: boolean; vest: boolean; gloves: boolean; boots: boolean };
  auditStatus: "Pending" | "Completed" | "In Review";
  staffNote: string | null;
  status: "OPEN" | "STAFF_DISPATCHED" | "RESOLVED";
  shift: "morning" | "evening" | "night";
  hoursAgo: number; // for time-range filtering
}

interface RepeatViolator {
  name: string;
  workerId: string;
  count: number;
  lastSeen: string;
  zone: string;
  mainType: string;
  shift: "morning" | "evening" | "night";
  status: "OPEN" | "STAFF_DISPATCHED" | "RESOLVED";
  weeklyActivity: { day: string; count: number }[];
  typeBreakdown: { type: string; count: number; color: string }[];
}

interface ZoneOverviewRow {
  zone: string;
  compliance: number;
  violations: number;
  status: "critical" | "warning" | "caution" | "normal";
  camera: string;
  diagnostic: string;
  topType: string;
  complianceTrend: number[];
  recentViolations: { time: string; type: string; severity: string }[];
}

type ModalPayload =
  | { kind: "violation"; data: SafetyViolation }
  | { kind: "violator";  data: RepeatViolator  }
  | { kind: "zone";      data: ZoneOverviewRow };

// ─── Violation data (expanded to 13 for pagination) ──────────────────────────
const MOCK_VIOLATIONS: SafetyViolation[] = [
  { id: 1,  time: "06:22 AM", cameraId: "CAM-LD-013",  zone: "Loading Dock",    type: "PPE",              severity: "Critical", trackerId: "TRK-8847A", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: false, vest: true, gloves: true, boots: true }, auditStatus: "Completed", staffNote: "Worker reminded about helmet. PPE re-issued at shift start.", status: "RESOLVED",         shift: "morning", hoursAgo: 8.1  },
  { id: 2,  time: "07:15 AM", cameraId: "CAM-AS-005",  zone: "Assembly Line 2", type: "Unsafe Behavior",  severity: "High",     trackerId: "TRK-2201F", imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400", compliance: { helmet: true, vest: true, gloves: true, boots: false }, auditStatus: "Completed", staffNote: "Unsafe operation near machinery. Safety brief conducted.", status: "RESOLVED",         shift: "morning", hoursAgo: 7.2  },
  { id: 3,  time: "08:47 AM", cameraId: "CAM-LD-012",  zone: "Loading Dock",    type: "PPE",              severity: "Critical", trackerId: "TRK-8847A", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: false, vest: true, gloves: true, boots: true }, auditStatus: "Completed", staffNote: "Second incident this morning. Supervisor alerted.", status: "STAFF_DISPATCHED", shift: "morning", hoursAgo: 5.7  },
  { id: 4,  time: "09:12 AM", cameraId: "CAM-AS-004",  zone: "Assembly Line 1", type: "Unsafe Behavior",  severity: "High",     trackerId: "TRK-9012B", imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400", compliance: { helmet: true, vest: true, gloves: false, boots: true }, auditStatus: "In Review",  staffNote: null,                                                            status: "STAFF_DISPATCHED", shift: "morning", hoursAgo: 5.3  },
  { id: 5,  time: "09:55 AM", cameraId: "CAM-LD-014",  zone: "Loading Dock",    type: "PPE",              severity: "Critical", trackerId: "TRK-1028C", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: true, vest: false, gloves: true, boots: true }, auditStatus: "In Review",  staffNote: null,                                                            status: "OPEN",             shift: "morning", hoursAgo: 4.5  },
  { id: 6,  time: "10:28 AM", cameraId: "CAM-LD-015",  zone: "Loading Dock",    type: "PPE",              severity: "High",     trackerId: "TRK-1028C", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: true, vest: false, gloves: true, boots: true }, auditStatus: "Completed", staffNote: "Vest requirement enforced. Employee issued safety vest.", status: "RESOLVED",         shift: "morning", hoursAgo: 4.0  },
  { id: 7,  time: "11:35 AM", cameraId: "CAM-WH-008",  zone: "Warehouse A",     type: "Restricted Access",severity: "Medium",   trackerId: "TRK-1135D", imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400", compliance: { helmet: true, vest: true, gloves: true, boots: true }, auditStatus: "Pending",    staffNote: null,                                                            status: "OPEN",             shift: "morning", hoursAgo: 2.9  },
  { id: 8,  time: "12:30 PM", cameraId: "CAM-PK-001",  zone: "Packaging Area",  type: "PPE",              severity: "Medium",   trackerId: "TRK-3302G", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: false, vest: true, gloves: true, boots: true }, auditStatus: "Pending",    staffNote: null,                                                            status: "OPEN",             shift: "morning", hoursAgo: 2.0  },
  { id: 9,  time: "01:45 PM", cameraId: "CAM-ME-002",  zone: "Main Entrance",   type: "Restricted Access",severity: "Medium",   trackerId: "TRK-4403H", imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400", compliance: { helmet: true, vest: true, gloves: true, boots: true }, auditStatus: "Completed", staffNote: "Visitor without escort. Security protocol followed.",      status: "RESOLVED",         shift: "morning", hoursAgo: 0.7  },
  { id: 10, time: "02:15 PM", cameraId: "CAM-LD-012",  zone: "Loading Dock",    type: "PPE",              severity: "Critical", trackerId: "TRK-1415E", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: false, vest: false, gloves: true, boots: true }, auditStatus: "In Review", staffNote: null,                                                            status: "STAFF_DISPATCHED", shift: "evening", hoursAgo: 0.2  },
  { id: 11, time: "03:30 PM", cameraId: "CAM-WH-009",  zone: "Warehouse A",     type: "Unsafe Behavior",  severity: "High",     trackerId: "TRK-1415E", imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400", compliance: { helmet: true, vest: true, gloves: false, boots: true }, auditStatus: "Pending",    staffNote: null,                                                            status: "OPEN",             shift: "evening", hoursAgo: -1.0 },
  { id: 12, time: "04:45 PM", cameraId: "CAM-AS-004",  zone: "Assembly Line 1", type: "PPE",              severity: "Medium",   trackerId: "TRK-5504I", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: true, vest: false, gloves: true, boots: true }, auditStatus: "Pending",    staffNote: null,                                                            status: "OPEN",             shift: "evening", hoursAgo: -2.2 },
  { id: 13, time: "05:20 PM", cameraId: "CAM-LD-016",  zone: "Loading Dock",    type: "PPE",              severity: "High",     trackerId: "TRK-8847A", imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400", compliance: { helmet: false, vest: true, gloves: true, boots: false }, auditStatus: "Pending",    staffNote: null,                                                            status: "OPEN",             shift: "evening", hoursAgo: -2.8 },
];

// ─── Repeat violators (with history) ─────────────────────────────────────────
const REPEAT_VIOLATORS: RepeatViolator[] = [
  {
    name: "James Horton", workerId: "TRK-8847A", count: 12, lastSeen: "05:20 PM", zone: "Loading Dock", mainType: "PPE", shift: "morning", status: "STAFF_DISPATCHED",
    weeklyActivity: [{ day: "M", count: 3 }, { day: "T", count: 2 }, { day: "W", count: 1 }, { day: "T", count: 2 }, { day: "F", count: 3 }, { day: "S", count: 0 }, { day: "Su", count: 1 }],
    typeBreakdown: [{ type: "No Helmet", count: 9, color: "#E7000B" }, { type: "No Vest", count: 2, color: "#EA580C" }, { type: "No Gloves", count: 1, color: "#E19A04" }],
  },
  {
    name: "Marcus Webb", workerId: "TRK-1415E", count: 9, lastSeen: "03:30 PM", zone: "Loading Dock", mainType: "PPE", shift: "evening", status: "OPEN",
    weeklyActivity: [{ day: "M", count: 1 }, { day: "T", count: 2 }, { day: "W", count: 2 }, { day: "T", count: 1 }, { day: "F", count: 2 }, { day: "S", count: 1 }, { day: "Su", count: 0 }],
    typeBreakdown: [{ type: "No Helmet", count: 6, color: "#E7000B" }, { type: "Unsafe Behavior", count: 2, color: "#EA580C" }, { type: "No Vest", count: 1, color: "#E19A04" }],
  },
  {
    name: "Devon Clarke", workerId: "TRK-1028C", count: 7, lastSeen: "10:28 AM", zone: "Loading Dock", mainType: "PPE", shift: "morning", status: "STAFF_DISPATCHED",
    weeklyActivity: [{ day: "M", count: 1 }, { day: "T", count: 1 }, { day: "W", count: 2 }, { day: "T", count: 1 }, { day: "F", count: 1 }, { day: "S", count: 0 }, { day: "Su", count: 1 }],
    typeBreakdown: [{ type: "No Vest", count: 5, color: "#EA580C" }, { type: "No Gloves", count: 2, color: "#E19A04" }],
  },
  {
    name: "Sam Nguyen", workerId: "TRK-9012B", count: 4, lastSeen: "09:12 AM", zone: "Assembly Line 1", mainType: "Unsafe Behavior", shift: "morning", status: "RESOLVED",
    weeklyActivity: [{ day: "M", count: 0 }, { day: "T", count: 1 }, { day: "W", count: 0 }, { day: "T", count: 1 }, { day: "F", count: 1 }, { day: "S", count: 0 }, { day: "Su", count: 1 }],
    typeBreakdown: [{ type: "Unsafe Behavior", count: 4, color: "#EA580C" }],
  },
  {
    name: "Luis Ortega", workerId: "TRK-1135D", count: 2, lastSeen: "11:35 AM", zone: "Warehouse A", mainType: "Restricted Access", shift: "morning", status: "OPEN",
    weeklyActivity: [{ day: "M", count: 0 }, { day: "T", count: 0 }, { day: "W", count: 1 }, { day: "T", count: 0 }, { day: "F", count: 0 }, { day: "S", count: 0 }, { day: "Su", count: 1 }],
    typeBreakdown: [{ type: "Restricted Access", count: 2, color: "#64748B" }],
  },
];

// ─── Zone overview data ───────────────────────────────────────────────────────
const ZONE_OVERVIEW: ZoneOverviewRow[] = [
  { zone: "Loading Dock",    compliance: 68,  violations: 23, status: "critical", camera: "CAM-LD-012", diagnostic: "Mainly PPE violations during morning shift change", topType: "No Helmet", complianceTrend: [75, 72, 70, 68, 65, 67, 68], recentViolations: [{ time: "08:47 AM", type: "PPE", severity: "Critical" }, { time: "09:55 AM", type: "PPE", severity: "Critical" }, { time: "02:15 PM", type: "PPE", severity: "Critical" }] },
  { zone: "Assembly Line 1", compliance: 92,  violations: 8,  status: "warning",  camera: "CAM-AS-004", diagnostic: "Unsafe behavior spikes during lunch transition period", topType: "Unsafe Behavior", complianceTrend: [95, 93, 91, 92, 90, 91, 92], recentViolations: [{ time: "09:12 AM", type: "Unsafe Behavior", severity: "High" }] },
  { zone: "Warehouse A",     compliance: 87,  violations: 6,  status: "warning",  camera: "CAM-WH-008", diagnostic: "Restricted access attempts from non-badged staff", topType: "Restricted Access", complianceTrend: [90, 88, 87, 86, 88, 87, 87], recentViolations: [{ time: "11:35 AM", type: "Restricted Access", severity: "Medium" }] },
  { zone: "Assembly Line 2", compliance: 84,  violations: 5,  status: "caution",  camera: "CAM-AS-006", diagnostic: "Compliance down 5pts this week — elevated risk of spike", topType: "Unsafe Behavior", complianceTrend: [92, 90, 88, 87, 85, 84, 84], recentViolations: [{ time: "07:15 AM", type: "Unsafe Behavior", severity: "High" }] },
  { zone: "Main Entrance",   compliance: 98,  violations: 5,  status: "normal",   camera: "CAM-ME-002", diagnostic: "Compliance stable — access control operating normally", topType: "Restricted Access", complianceTrend: [97, 98, 99, 97, 98, 98, 98], recentViolations: [{ time: "01:45 PM", type: "Restricted Access", severity: "Medium" }] },
  { zone: "Packaging Area",  compliance: 97,  violations: 3,  status: "normal",   camera: "CAM-PK-001", diagnostic: "Minor PPE incidents during inbound delivery windows", topType: "PPE", complianceTrend: [96, 97, 97, 98, 97, 97, 97], recentViolations: [{ time: "12:30 PM", type: "PPE", severity: "Medium" }] },
  { zone: "North Parking",   compliance: 99,  violations: 2,  status: "normal",   camera: "CAM-NP-001", diagnostic: "Excellent compliance maintained across all shifts", topType: "Restricted Access", complianceTrend: [99, 99, 98, 99, 99, 99, 99], recentViolations: [] },
];

// ─── Constants ────────────────────────────────────────────────────────────────

// ─── Component ────────────────────────────────────────────────────────────────
export const SafetyAnalytics = ({ persona, sidebarCollapsed = false }: { persona: Persona; sidebarCollapsed?: boolean }) => {
  const [chartView, setChartView] = useState<"trend" | "zone" | "type">("trend");
  const [modal, setModal] = useState<ModalPayload | null>(null);
  const [timeRange, setTimeRange] = useState<"5M" | "1H" | "1D" | "1W">("1D");
  const [selectedShift] = useState<"all" | "morning" | "evening" | "night">("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 10;

  // ── App filter ──────────────────────────────────────────────────────────────
  const [selectedApps, setSelectedApps] = useState<string[]>([]);

  // ── Data freshness counter ───────────────────────────────────────────────────
  const [dataFreshnessSeconds, setDataFreshnessSeconds] = useState(4);
  useEffect(() => {
    if (persona !== "monitoring") return;
    const id = setInterval(() => setDataFreshnessSeconds((s) => (s >= 90 ? 4 : s + 1)), 1000);
    return () => clearInterval(id);
  }, [persona]);

  const toggleAppFilter = (app: string) => {
    if (app === "all") { setSelectedApps([]); return; }
    setSelectedApps((prev) => prev.includes(app) ? prev.filter(a => a !== app) : [...prev, app]);
  };

  // ── Helpers ─────────────────────────────────────────────────────────────────
  const getSeverityColor = (s: string) => {
    if (s === "Critical") return { bg: "#E7000B", text: "#fff" };
    if (s === "High")     return { bg: "#EA580C", text: "#fff" };
    if (s === "Medium")   return { bg: "#E19A04", text: "#fff" };
    return { bg: "#64748B", text: "#fff" };
  };

  const getTypeColor = (t: string) => {
    if (t === "PPE")               return "#2B7FFF";
    if (t === "Unsafe Behavior")   return "#EA580C";
    if (t === "Restricted Access") return "#64748B";
    return "#64748B";
  };

  const getStatusConfig = (s: string) => {
    if (s === "OPEN")             return { label: "OPEN",             color: "#E7000B", bg: "#FFE5E7" };
    if (s === "STAFF_DISPATCHED") return { label: "STAFF DISPATCHED", color: "#EA580C", bg: "#FEEFE7" };
    if (s === "RESOLVED")         return { label: "RESOLVED",         color: "#00A63E", bg: "#E5FFEF" };
    return { label: "OPEN", color: "#E7000B", bg: "#FFE5E7" };
  };

  const getZoneStatusConfig = (s: string) => {
    if (s === "critical") return { label: "CRITICAL", color: "#E7000B", bg: "#FFE5E7" };
    if (s === "warning")  return { label: "WARNING",  color: "#EA580C", bg: "#FEEFE7" };
    if (s === "caution")  return { label: "CAUTION",  color: "#E19A04", bg: "#FFF7E6" };
    return { label: "NORMAL", color: "#00A63E", bg: "#E5FFEF" };
  };

  const getViolatorSeverity = (count: number) => {
    if (count >= 10) return { color: "#E7000B", bg: "#FFE5E7", label: "Critical" };
    if (count >= 7)  return { color: "#EA580C", bg: "#FEEFE7", label: "High"     };
    if (count >= 4)  return { color: "#E19A04", bg: "#FFF7E6", label: "Medium"   };
    if (count >= 2)  return { color: "#2B7FFF", bg: "#E5F0FF", label: "Low"      };
    return { color: "#64748B", bg: "#F0F2F4", label: "Info" };
  };

  const getRiskColor = (r: string) => {
    if (r === "high")   return "#E7000B";
    if (r === "medium") return "#E19A04";
    return "#00775B";
  };

  // ── Time range label ──────────────────────────────────────────────────────────
  const getTimeRangeInfo = () => {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (timeRange === "5M") {
      const from = new Date(now.getTime() - 5 * 60 * 1000);
      return `Since ${fmt(from)} today`;
    }
    if (timeRange === "1H") {
      const from = new Date(now.getTime() - 60 * 60 * 1000);
      return `Since ${fmt(from)} today`;
    }
    if (timeRange === "1D") return "Since 00:00 today";
    return "Past 7 days";
  };

  // ── Filtered violations ──────────────────────────────────────────────────────
  const filteredViolations = MOCK_VIOLATIONS.filter((v) => {
    const shiftOk  = selectedShift === "all" || v.shift === selectedShift;
    const statusOk = selectedStatus === "all" || v.status === selectedStatus;
    const timeOk   = timeRange === "1W" ? true
                   : timeRange === "1D" ? true
                   : timeRange === "1H" ? v.hoursAgo <= 1
                   : v.hoursAgo <= (5 / 60); // 5M
    return shiftOk && statusOk && timeOk;
  });
  const totalPages = Math.ceil(filteredViolations.length / ITEMS_PER_PAGE);
  const paginatedViolations = filteredViolations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // ── Manager chart renderer ───────────────────────────────────────────────────
  const getComplianceData = () => {
    if (chartView === "zone") return ZONE_COMPLIANCE_DATA;
    if (chartView === "type") return VIOLATION_BY_TYPE_DATA;
    return COMPLIANCE_TREND_DATA;
  };
  const renderChart = () => {
    const data = getComplianceData();
    if (chartView === "trend") return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} domain={[85, 100]} />
          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "1px solid #E2E8F0" }} />
          <Line type="monotone" dataKey="compliance" stroke="#00775B" strokeWidth={2} dot={<Dot r={3} fill="#00775B" />} activeDot={{ r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    );
    if (chartView === "zone") return (
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} domain={[80, 100]} />
          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "1px solid #E2E8F0" }} />
          <Line type="monotone" dataKey="loadingDock" stroke="#E7000B" strokeWidth={2} name="Loading Dock" />
          <Line type="monotone" dataKey="assembly" stroke="#2B7FFF" strokeWidth={2} name="Assembly" />
          <Line type="monotone" dataKey="warehouse" stroke="#00775B" strokeWidth={2} name="Warehouse" />
        </LineChart>
      </ResponsiveContainer>
    );
    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={{ stroke: "#E2E8F0" }} tickLine={false} />
          <Tooltip contentStyle={{ fontSize: "11px", borderRadius: "6px", border: "1px solid #E2E8F0" }} />
          <Bar dataKey="ppe" fill="#2B7FFF" name="PPE Violations" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unsafeBehavior" fill="#EA580C" name="Unsafe Behavior" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ── Universal modal renderer ─────────────────────────────────────────────────
  const renderModal = () => {
    if (!modal) return null;
    const closeModal = () => setModal(null);

    if (modal.kind === "violator") {
      const v = modal.data;
      const vs = getViolatorSeverity(v.count);
      const stc = getStatusConfig(v.status);
      return (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50" onClick={closeModal}>
          <div className="bg-white h-screen w-full max-w-[520px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5 flex-wrap">
                <div className="font-bold text-neutral-900 text-base">{v.name}</div>
                <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: vs.bg, color: vs.color }}>{vs.label} Risk</div>
                <div className="text-xs text-neutral-300">|</div>
                <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: stc.bg, color: stc.color }}>{stc.label}</div>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded"><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            {/* Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Identity row */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 grid grid-cols-3 gap-3 text-[10px]">
                <div><div className="text-neutral-400 uppercase tracking-wide mb-1">Tracker ID</div><div className="font-mono font-bold text-neutral-900">{v.workerId}</div></div>
                <div><div className="text-neutral-400 uppercase tracking-wide mb-1">Zone</div><div className="font-bold text-neutral-900 truncate">{v.zone}</div></div>
                <div><div className="text-neutral-400 uppercase tracking-wide mb-1">Last Seen</div><div className="font-bold text-neutral-900">{v.lastSeen}</div></div>
              </div>
              {/* 7-day activity */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">7-Day Activity Summary</div>
                <div className="h-[100px]">
                  <ResponsiveContainer width="100%" height={100} minWidth={200}>
                    <BarChart data={v.weeklyActivity} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "4px" }} />
                      <Bar dataKey="count" fill={vs.color} radius={[3, 3, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-neutral-500">
                  <div>Total this week</div>
                  <div className="font-data font-bold" style={{ color: vs.color }}>{v.count} violations</div>
                </div>
              </div>
              {/* Violation type breakdown */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Violation Type Breakdown</div>
                <div className="space-y-2.5">
                  {v.typeBreakdown.map((tb) => {
                    const maxCount = Math.max(...v.typeBreakdown.map(x => x.count));
                    return (
                      <div key={tb.type}>
                        <div className="flex items-center justify-between mb-1">
                          <div className="text-[11px] font-medium text-neutral-700">{tb.type}</div>
                          <div className="text-[11px] font-bold text-neutral-900">{tb.count} incidents</div>
                        </div>
                        <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(tb.count / maxCount) * 100}%`, backgroundColor: tb.color }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
              {/* Recommendation */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="text-[10px] font-bold uppercase tracking-wider text-amber-900 mb-1">Recommended Action</div>
                <div className="text-[11px] text-amber-800">
                  {v.count >= 10
                    ? "Mandatory retraining required. Escalate to Safety Manager for formal written warning."
                    : v.count >= 7
                    ? "Schedule retraining session within 48 hours. Issue verbal warning."
                    : v.count >= 4
                    ? "Conduct safety refresher briefing. Monitor closely for 7 days."
                    : "Add to watch list. Ensure daily PPE compliance check."}
                </div>
              </div>
            </div>
            {/* Footer */}
            <div className="bg-white border-t border-neutral-200 px-5 py-4 flex gap-2">
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                <AlertCircle className="w-3.5 h-3.5" /> Issue Warning
              </button>
              <button className="flex-[2] h-10 flex items-center justify-center gap-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#009e78] transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Schedule Retraining
              </button>
            </div>
          </div>
        </div>
      );
    }

    if (modal.kind === "zone") {
      const z = modal.data;
      const zs = getZoneStatusConfig(z.status);
      return (
        <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50" onClick={closeModal}>
          <div className="bg-white h-screen w-full max-w-[520px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
            <div className="bg-white border-b border-neutral-200 px-5 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="font-bold text-neutral-900 text-base">{z.zone}</div>
                <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: zs.bg, color: zs.color }}>{zs.label}</div>
              </div>
              <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded"><X className="w-4 h-4 text-neutral-400" /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Key metrics */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 grid grid-cols-3 gap-3">
                <div className="text-center"><div className="text-[9px] text-neutral-400 uppercase tracking-wide mb-1">Compliance</div><div className="font-data font-bold text-2xl" style={{ color: zs.color }}>{z.compliance}%</div></div>
                <div className="text-center"><div className="text-[9px] text-neutral-400 uppercase tracking-wide mb-1">Violations Today</div><div className="font-data font-bold text-2xl text-neutral-900">{z.violations}</div></div>
                <div className="text-center"><div className="text-[9px] text-neutral-400 uppercase tracking-wide mb-1">Camera</div><div className="font-mono font-bold text-[11px] text-neutral-700 mt-1">{z.camera}</div></div>
              </div>
              {/* Compliance 7-day trend */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">7-Day Compliance Trend</div>
                <div className="h-[80px]">
                  <ResponsiveContainer width="100%" height={80} minWidth={200}>
                    <LineChart data={z.complianceTrend.map((v, i) => ({ day: ["M","T","W","T","F","S","Su"][i], v }))} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                      <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                      <YAxis hide domain={[Math.min(...z.complianceTrend) - 5, 100]} />
                      <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "4px" }} formatter={(val: number) => [`${val}%`, "Compliance"]} />
                      <Line type="monotone" dataKey="v" stroke={zs.color} strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              {/* Diagnostic */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Diagnostic</div>
                <div className="text-[12px] font-medium text-neutral-700">{z.diagnostic}</div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="text-[9px] font-bold text-neutral-500 uppercase tracking-wide">Top violation type:</div>
                  <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: getTypeColor(z.topType) + "20", color: getTypeColor(z.topType) }}>{z.topType}</div>
                </div>
              </div>
              {/* Recent violations */}
              {z.recentViolations.length > 0 && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Recent Violations</div>
                  <div className="space-y-2">
                    {z.recentViolations.map((rv, i) => {
                      const sc = getSeverityColor(rv.severity);
                      return (
                        <div key={i} className="flex items-center gap-3 py-1.5 border-b border-neutral-100 last:border-0">
                          <div className="font-mono text-[10px] text-neutral-500 w-16">{rv.time}</div>
                          <div className="text-[10px] font-medium text-neutral-700 flex-1">{rv.type}</div>
                          <div className="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase text-white" style={{ backgroundColor: sc.bg }}>{rv.severity}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
            <div className="bg-white border-t border-neutral-200 px-5 py-4 flex gap-2">
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                <AlertCircle className="w-3.5 h-3.5" /> Process Audit
              </button>
              <button className="flex-[2] h-10 flex items-center justify-center gap-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#009e78] transition-colors">
                <CheckCircle2 className="w-3.5 h-3.5" /> Review Staffing
              </button>
            </div>
          </div>
        </div>
      );
    }

    // kind === "violation"
    const v = modal.data;
    const sc  = getSeverityColor(v.severity);
    const stc = getStatusConfig(v.status);
    return (
      <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50" onClick={closeModal}>
        <div className="bg-white h-screen w-full max-w-[550px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300" onClick={(e) => e.stopPropagation()}>
          <div className="bg-white border-b border-neutral-200 px-5 py-3 flex items-center justify-between">
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="font-bold text-neutral-900 text-base">Violation Details</div>
              <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: sc.bg }}>{v.severity}</div>
              <div className="text-xs text-neutral-300">|</div>
              <div className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider" style={{ backgroundColor: stc.bg, color: stc.color }}>{stc.label}</div>
            </div>
            <button onClick={closeModal} className="p-1 hover:bg-neutral-100 rounded"><X className="w-4 h-4 text-neutral-400" /></button>
          </div>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {/* Visual evidence */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="aspect-video bg-neutral-900 rounded overflow-hidden mb-3">
                <img src={v.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-3 gap-3 text-[10px]">
                <div><div className="text-neutral-400 uppercase tracking-wide mb-0.5">Time</div><div className="font-bold text-neutral-900">{v.time}</div></div>
                <div><div className="text-neutral-400 uppercase tracking-wide mb-0.5">Camera</div><div className="font-mono font-bold text-neutral-900 truncate">{v.cameraId}</div></div>
                <div><div className="text-neutral-400 uppercase tracking-wide mb-0.5">Zone</div><div className="font-bold text-neutral-900">{v.zone}</div></div>
              </div>
            </div>
            {/* Performance timeline */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Performance Timeline</div>
              <div className="space-y-0">
                {[
                  { label: "DETECTED",    time: v.time,              color: "#E7000B", done: true  },
                  { label: "CAPTURED",    time: v.time,              color: "#EA580C", done: true  },
                  { label: "DISPATCHED",  time: v.status !== "OPEN" ? "—" : "Pending", color: v.status !== "OPEN" ? "#E19A04" : "#94a3b8", done: v.status !== "OPEN" },
                  { label: "RESOLVED",    time: v.status === "RESOLVED" ? "—" : "Pending", color: v.status === "RESOLVED" ? "#00A63E" : "#94a3b8", done: v.status === "RESOLVED" },
                ].map((step, i, arr) => (
                  <div key={step.label} className="flex items-start gap-3 pb-2">
                    <div className="flex flex-col items-center">
                      <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: step.done ? step.color : "#e2e8f0" }}>
                        {step.done ? <CheckCircle2 className="w-3 h-3 text-white" /> : <div className="w-2 h-2 rounded-full bg-neutral-400" />}
                      </div>
                      {i < arr.length - 1 && <div className="w-0.5 bg-neutral-200 my-1" style={{ height: "16px" }} />}
                    </div>
                    <div className="flex-1 pt-0.5 flex items-center justify-between">
                      <div className="text-[11px] font-bold uppercase tracking-wide" style={{ color: step.done ? step.color : "#94a3b8" }}>{step.label}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{step.time}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* PPE compliance checklist */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">PPE Compliance Checklist</div>
              <div className="space-y-2">
                {[{ label: "Hard Hat", key: "helmet" }, { label: "Safety Vest", key: "vest" }, { label: "Gloves", key: "gloves" }, { label: "Steel-Toe Boots", key: "boots" }].map(({ label, key }) => {
                  const ok = v.compliance[key as keyof typeof v.compliance];
                  return (
                    <div key={key} className="flex items-center gap-2 py-1.5 border-b border-neutral-100 last:border-0">
                      <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0", ok ? "bg-[#00775B]" : "bg-[#E7000B]")}>
                        {ok ? <CheckCircle2 className="w-3 h-3 text-white" /> : <X className="w-3 h-3 text-white" />}
                      </div>
                      <div className="flex-1 text-[11px] font-medium text-neutral-700">{label}</div>
                      <div className={cn("text-[10px] font-bold uppercase", ok ? "text-[#00775B]" : "text-[#E7000B]")}>{ok ? "✓" : "✗"}</div>
                    </div>
                  );
                })}
              </div>
            </div>
            {/* Audit + staff note */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Audit Status</div>
                <div className={cn("px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider", v.auditStatus === "Completed" && "bg-[#00775B] text-white", v.auditStatus === "In Review" && "bg-[#E19A04] text-white", v.auditStatus === "Pending" && "bg-neutral-400 text-white")}>{v.auditStatus}</div>
              </div>
              {v.staffNote && <div className="p-3 bg-white border border-neutral-200 rounded"><div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Staff Note</div><div className="text-[11px] text-neutral-700">{v.staffNote}</div></div>}
            </div>
            {/* Numerical proof */}
            <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 grid grid-cols-2 gap-3 text-[10px]">
              <div><div className="text-neutral-400 uppercase tracking-wide mb-1">Tracker ID</div><div className="font-mono font-bold text-neutral-900">{v.trackerId}</div></div>
              <div><div className="text-neutral-400 uppercase tracking-wide mb-1">Shift</div><div className="font-bold text-neutral-900 capitalize">{v.shift}</div></div>
            </div>
          </div>
          <div className="bg-white border-t border-neutral-200 px-5 py-4 flex gap-2">
            <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
              <AlertCircle className="w-3.5 h-3.5" /> Flag Issue
            </button>
            <button className="flex-[2] h-10 flex items-center justify-center gap-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#009e78] transition-colors">
              <CheckCircle2 className="w-3.5 h-3.5" /> Mark Resolved
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Floating HUD (fixed, floats over scrolling content) ──────────────── */}
      <FloatingHUD
        timeRange={timeRange}
        onTimeRangeChange={(r) => { setTimeRange(r as typeof timeRange); setCurrentPage(1); }}
        selectedApps={selectedApps}
        onToggleApp={toggleAppFilter}
        dataFreshnessSeconds={dataFreshnessSeconds}
        persona={persona}
        sidebarCollapsed={sidebarCollapsed}
        timeRangeInfo={getTimeRangeInfo()}
      />
      {/* Spacer so content starts below the fixed HUD (40px HUD + 24px gap = 64px) */}
      <div style={{ height: 56 }} />

      {/* ══════════════════════════════════════════════════════════════════════
          MONITORING PERSONA
          ══════════════════════════════════════════════════════════════════════ */}
      {persona === "monitoring" && (
        <>

          {/* ── LAYER 1 · 2×2 KPI + [Pie + Bar chart] ──────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[689px_1fr] gap-4">

            {/* Left — 2×2 KPI grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-[9px]">

              {/* Card 1 · Compliance Rate */}
              <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] pt-3 px-3 pb-3 flex flex-col">
                <div className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">Compliance Rate</div>
                <div className="flex items-center justify-between flex-1">
                  <div className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">{SAFETY_METRICS.complianceRate}%</div>
                  <div className="bg-[#E5FFEF] rounded border border-[rgba(185,248,207,0.5)] shadow-sm pt-[5px] px-[9px] pb-[1px]">
                    <div className="flex items-center gap-1 mb-[2px]">
                      <div className="font-data font-bold text-[#00A63E] text-[15px] leading-[18px]">+{SAFETY_METRICS.complianceChange}%</div>
                      <TrendingUp className="w-4 h-4 text-[#00A63E]" />
                    </div>
                    <div className="font-bold text-[#00A63E] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80">vs yesterday</div>
                  </div>
                </div>
                <div className="mt-2">
                  <SafetySparkline data={COMPLIANCE_SPARKLINE} color="#00A63E" width={160} height={28} />
                  <div className="text-[9px] text-white/30 mt-0.5">Last 12h · Compliance %</div>
                </div>
              </div>

              {/* Card 2 · Violation Count */}
              <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] pt-3 px-3 pb-3 flex flex-col">
                <div className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">Violation Count</div>
                <div className="flex items-center justify-between flex-1">
                  <div className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">{SAFETY_METRICS.violationCount}</div>
                  <div className="bg-[#E5FFEF] rounded border border-[rgba(185,248,207,0.5)] shadow-sm pt-[5px] px-[9px] pb-[1px]">
                    <div className="flex items-center gap-1 mb-[2px]">
                      <div className="font-data font-bold text-[#00A63E] text-[15px] leading-[18px]">-{Math.abs(SAFETY_METRICS.violationChange)}%</div>
                      <TrendingDown className="w-4 h-4 text-[#00A63E]" />
                    </div>
                    <div className="font-bold text-[#00A63E] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80">vs yesterday</div>
                  </div>
                </div>
                <div className="mt-2">
                  <SafetySparkline data={VIOLATION_SPARKLINE} color="#E7000B" width={160} height={28} />
                  <div className="text-[9px] text-white/30 mt-0.5">Last 12h · Violations</div>
                </div>
              </div>

              {/* Card 3 · Critical Zone Alert — red gradient */}
              <div className="bg-gradient-to-br from-[#8B0000] to-[#E7000B] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(231,0,11,0.3),0px_4px_6px_0px_rgba(139,0,0,0.2)] pt-3 px-3 pb-3 flex flex-col border-2 border-[#E7000B]/30">
                <div className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">Critical Zone Alert</div>
                <div className="flex items-center justify-between flex-1">
                  <div>
                    <div className="font-data font-bold text-[20px] text-white tracking-tight leading-tight">{SAFETY_METRICS.topRiskZone}</div>
                    <div className="text-[10px] text-white/60 mt-0.5">Mainly PPE violations during<br/>morning shift change</div>
                  </div>
                  <div className="bg-white/95 rounded border border-white/40 shadow-sm pt-[5px] px-[9px] pb-[1px]">
                    <div className="font-data font-bold text-[#8B0000] text-[18px] leading-[18px] block text-center">68%</div>
                    <div className="font-bold text-[#8B0000] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80 text-center">compliance</div>
                  </div>
                </div>
                <div className="font-medium text-white text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">⚠ 23 violations today · CAM-LD-012</div>
              </div>

              {/* Card 4 · Cautionary Alerts — amber gradient */}
              <div className="bg-gradient-to-br from-[#78350F] to-[#E19A04] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(225,154,4,0.3),0px_4px_6px_0px_rgba(120,53,15,0.2)] pt-3 px-3 pb-3 flex flex-col border-2 border-[#E19A04]/30">
                <div className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">Cautionary Alerts</div>
                <div className="flex-1 space-y-2 mt-1">
                  {CAUTIONARY_ZONES.map((cz) => (
                    <div key={cz.zone} className="flex items-center justify-between bg-white/10 rounded px-2 py-1.5">
                      <div>
                        <div className="text-white font-bold text-[11px] leading-tight">{cz.zone}</div>
                        <div className="text-white/60 text-[9px]">{cz.compliance}% compliance</div>
                      </div>
                      <div className="text-right">
                        <div className="font-data font-bold text-white text-[14px] leading-tight">{cz.change}%</div>
                        <div className="text-white/50 text-[8px] uppercase tracking-wide">this week</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="font-medium text-white text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">⚡ 2 zones approaching threshold</div>
              </div>
            </div>

            {/* Right — [Pie] + [Compliance by Zone bar] */}
            <div className="grid grid-cols-[220px_1fr] gap-[9px]">

              {/* Violation Types Pie */}
              <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
                <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-2">Violation Types</div>
                <div className="relative flex-1 flex items-center justify-center">
                  <div style={{ width: "180px", height: "180px" }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={VIOLATION_TYPE_PIE} cx="50%" cy="50%" innerRadius={52} outerRadius={82} paddingAngle={0} dataKey="value">
                          {VIOLATION_TYPE_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <div className="font-data font-bold text-[28px] leading-[32px] text-[#0f172a]">{SAFETY_METRICS.violationCount}</div>
                    <div className="font-bold text-[9px] text-[#94a3b8] uppercase tracking-[0.5px]">Total</div>
                  </div>
                </div>
                <div className="space-y-1.5 mt-2">
                  {VIOLATION_TYPE_PIE.map((e) => (
                    <div key={e.name} className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: e.color }} />
                      <div className="text-[10px] text-neutral-600 flex-1 truncate">{e.name}</div>
                      <div className="text-[10px] font-bold text-neutral-800">{e.pct}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Compliance by Zone */}
              <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
                <div className="flex items-center justify-between mb-2">
                  <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">Compliance by Zone</div>
                  <div className="text-[9px] font-bold text-[#E7000B] uppercase tracking-wider">Bottom 3 at risk</div>
                </div>
                <div className="flex-1" style={{ minHeight: "200px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={ZONE_COMPLIANCE_BAR} layout="horizontal" margin={{ top: 8, right: 12, bottom: 28, left: 0 }}>
                      <XAxis dataKey="zone" type="category" tick={{ fontSize: 9, fill: "#64748B", fontWeight: 500 }} axisLine={false} tickLine={false} interval={0} height={32} />
                      <YAxis type="number" hide domain={[60, 100]} />
                      <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "4px" }} formatter={(v: number) => [`${v}%`, "Compliance"]} />
                      <Bar dataKey="compliance" radius={[3, 3, 0, 0]}>
                        {ZONE_COMPLIANCE_BAR.map((e, i) => <Cell key={i} fill={e.color} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

          {/* ── LAYER 2 · DIAGNOSTIC SPLIT-VIEW ──────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-4">

            {/* Left — High-risk live feed */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">High-Risk Zone · Live Feed</div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5 px-2 py-1 bg-[#E7000B] text-white rounded text-[9px] font-bold uppercase tracking-wider">
                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-ping inline-block" />LIVE
                  </div>
                  <div className="text-[10px] font-mono text-neutral-500">CAM-LD-012</div>
                </div>
              </div>
              <div className="relative aspect-video bg-neutral-900 rounded-lg overflow-hidden mb-3">
                <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800" alt="Loading Dock Camera Feed" className="w-full h-full object-cover opacity-60" />
                <div className="absolute inset-0 p-3 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-start justify-between">
                    <div className="bg-black/60 rounded px-2 py-1 backdrop-blur-sm">
                      <div className="text-white text-[9px] font-bold uppercase tracking-wider">Loading Dock</div>
                      <div className="text-white/50 text-[9px] font-mono">CAM-LD-012 · Zone 3</div>
                    </div>
                    <div className="bg-[#E7000B]/90 rounded px-2 py-1 flex items-center gap-1.5">
                      <AlertTriangle className="w-3 h-3 text-white" /><div className="text-white text-[9px] font-bold uppercase">High Risk</div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between">
                    <div className="bg-black/50 rounded px-2 py-1"><div className="text-white/40 text-[9px] font-mono">14:27:03</div></div>
                    <div className="bg-black/60 rounded px-2 py-1"><div className="text-[#E7000B] text-[9px] font-bold uppercase">5 Violations Today</div></div>
                  </div>
                </div>
              </div>
              <div>
                <div className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-2">Recent Detections — Loading Dock</div>
                <div className="space-y-1.5">
                  {MOCK_VIOLATIONS.filter((v) => v.zone === "Loading Dock").slice(0, 4).map((v) => {
                    const sc = getSeverityColor(v.severity);
                    const stc = getStatusConfig(v.status);
                    return (
                      <div key={v.id} onClick={() => setModal({ kind: "violation", data: v })}
                        className="flex items-center gap-3 px-3 py-2 bg-neutral-50 rounded-lg border border-neutral-100 hover:border-[#00775B] cursor-pointer transition-colors">
                        <div className="font-mono text-[10px] text-neutral-500 w-16 shrink-0">{v.time}</div>
                        <div className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white shrink-0" style={{ backgroundColor: sc.bg }}>{v.severity}</div>
                        <div className="text-[10px] font-medium text-neutral-700 flex-1 truncate">{v.type}</div>
                        <div className="font-mono text-[9px] text-neutral-400 shrink-0">{v.trackerId}</div>
                        <div className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider shrink-0 whitespace-nowrap" style={{ backgroundColor: stc.bg, color: stc.color }}>{stc.label}</div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Right — Repeat Violators */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">Repeat Violators</div>
                <div className="text-[9px] text-neutral-400 font-medium">Today</div>
              </div>
              <div className="space-y-2 flex-1">
                {REPEAT_VIOLATORS.map((v) => {
                  const vs = getViolatorSeverity(v.count);
                  const stc = getStatusConfig(v.status);
                  return (
                    <div key={v.workerId} onClick={() => setModal({ kind: "violator", data: v })}
                      className="p-2.5 rounded-lg border cursor-pointer hover:shadow-sm transition-all"
                      style={{ borderColor: vs.color + "40", backgroundColor: vs.bg }}>
                      <div className="flex items-start gap-2.5 mb-1.5">
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-[13px] text-neutral-900 leading-tight truncate">{v.name}</div>
                          <div className="font-mono text-[10px] text-neutral-500">{v.workerId}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-data font-bold text-[20px] leading-tight" style={{ color: vs.color }}>{v.count}</div>
                          <div className="text-[9px] text-neutral-500">violations</div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-1">
                        <div className="text-[9px] text-neutral-500 truncate">{v.zone} · {v.lastSeen}</div>
                        <div className="inline-flex px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider whitespace-nowrap shrink-0" style={{ backgroundColor: stc.color + "18", color: stc.color }}>{stc.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 pt-3 border-t border-neutral-100">
                <div className="text-[9px] text-neutral-400 text-center">Click to view 7-day history & violation breakdown</div>
              </div>
            </div>
          </div>

          {/* ── LAYER 3 · SIDE-BY-SIDE TABLES ────────────────────────────────── */}
          <div className="grid grid-cols-1 xl:grid-cols-[320px_1fr] gap-4">

            {/* Left — Zone Overview table */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
              <div className="px-4 py-3 border-b border-neutral-100">
                <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">Zone Overview</div>
              </div>
              {/* Column headers — dark */}
              <div className="px-3 py-2.5 bg-[#021D18] grid grid-cols-[1fr_56px_72px] gap-2 text-[10px] uppercase font-bold text-white/70 tracking-wider">
                <div>Zone</div><div className="text-center">Compl.</div><div className="text-right">Status</div>
              </div>
              <div className="flex-1 divide-y divide-neutral-100">
                {ZONE_OVERVIEW.map((z, idx) => {
                  const zs = getZoneStatusConfig(z.status);
                  return (
                    <div key={z.zone} onClick={() => setModal({ kind: "zone", data: z })}
                      className={cn("px-3 py-2.5 grid grid-cols-[1fr_56px_72px] gap-2 items-center cursor-pointer hover:bg-[#E5FFF9] transition-colors",
                        idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50")}>
                      <div>
                        <div className="text-[11px] font-bold text-neutral-900 truncate">{z.zone}</div>
                        <div className="text-[9px] text-neutral-400">{z.violations} violations</div>
                      </div>
                      <div className="text-center">
                        <div className="font-data font-bold text-[13px]" style={{ color: zs.color }}>{z.compliance}%</div>
                      </div>
                      <div className="text-right">
                        <div className="inline-flex px-1.5 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ backgroundColor: zs.bg, color: zs.color }}>{zs.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right — Violation Log with pagination */}
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden flex flex-col">
              {/* White header */}
              <div className="px-4 border-b border-[#f1f5f9] flex items-center justify-between gap-3 h-[48px]">
                <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] shrink-0">Violation Log</div>
                <div className="flex items-center gap-2 ml-auto">
                  {/* Status filter */}
                  <FilterDropdown
                    label="Status"
                    options={[
                      { value: "all",              label: "All Status"    },
                      { value: "OPEN",             label: "Open"          },
                      { value: "STAFF_DISPATCHED", label: "Dispatched"    },
                      { value: "RESOLVED",         label: "Resolved"      },
                    ]}
                    value={selectedStatus}
                    onValueChange={(v) => { setSelectedStatus(v); setCurrentPage(1); }}
                    className="w-[130px]"
                  />
                  <div className="text-[10px] text-[#64748b] tabular-nums shrink-0">{filteredViolations.length} violations</div>
                  <div className="flex items-center gap-1.5 px-[9px] h-[19.5px] bg-[#ffe5e7] border border-[rgba(231,0,11,0.2)] rounded-[4px] text-[9px] font-bold text-[#e7000b] uppercase tracking-wider shrink-0">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#E7000B] animate-ping inline-block" />
                    {filteredViolations.filter((v) => v.status === "OPEN").length} OPEN
                  </div>
                </div>
              </div>
              {/* Dark column headers — 6 cols: Time | Violation ID | Zone | Type | Severity | Status */}
              <div className="px-3 bg-[#021D18] grid grid-cols-[56px_78px_1fr_62px_64px_108px] gap-2 text-[10px] uppercase font-bold text-white/70 tracking-wider shrink-0 h-[35px] items-center">
                <div>Time</div><div>ID</div><div>Zone</div><div>Type</div><div>Severity</div><div>Status</div>
              </div>
              {/* Rows */}
              <div className="flex-1 overflow-y-auto">
                {paginatedViolations.length === 0 ? (
                  <div className="px-4 py-10 text-center">
                    <AlertCircle className="w-10 h-10 text-neutral-200 mx-auto mb-2" />
                    <div className="text-sm text-neutral-400">No violations match current filters</div>
                  </div>
                ) : (
                  paginatedViolations.map((v, idx) => {
                    const sc  = getSeverityColor(v.severity);
                    const stc = getStatusConfig(v.status);
                    const typeShort = v.type === "Unsafe Behavior" ? "Unsafe" : v.type === "Restricted Access" ? "Access" : v.type;
                    return (
                      <div key={v.id} onClick={() => setModal({ kind: "violation", data: v })}
                        className={cn("px-3 grid grid-cols-[56px_78px_1fr_62px_64px_108px] gap-2 items-center cursor-pointer hover:bg-[#E5FFF9] transition-colors h-[45px] border-b border-[#f1f5f9]",
                          idx % 2 === 0 ? "bg-white" : "bg-[rgba(250,250,250,0.5)]")}>
                        {/* Time */}
                        <div className="text-[11px] font-medium text-neutral-700 tabular-nums leading-tight">{v.time}</div>
                        {/* Violation ID */}
                        <div className="text-[10px] font-mono text-[#64748b] truncate">{v.trackerId}</div>
                        {/* Zone */}
                        <div className="text-[11px] font-medium text-[#1e293b] truncate">{v.zone}</div>
                        {/* Type — unified slate pill */}
                        <div>
                          <div className="inline-flex items-center px-1.5 h-[17.5px] rounded-[4px] text-[9px] font-bold uppercase tracking-[0.45px] bg-[#f1f5f9] text-[#45556c]">
                            {typeShort}
                          </div>
                        </div>
                        {/* Severity */}
                        <div>
                          <div className="inline-flex items-center px-1.5 h-[17.5px] rounded-[4px] text-[9px] font-bold uppercase tracking-wider text-white" style={{ backgroundColor: sc.bg }}>
                            {v.severity}
                          </div>
                        </div>
                        {/* Status */}
                        <div>
                          <div className="inline-flex items-center px-2 h-[17.5px] rounded-[4px] text-[9px] font-bold uppercase tracking-wider whitespace-nowrap" style={{ backgroundColor: stc.bg, color: stc.color }}>
                            {stc.label}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-4 py-3 bg-[#fafafa] border-t border-[#e2e8f0] flex items-center justify-center gap-3 relative shrink-0">
                  {/* Prev */}
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "flex items-center justify-center gap-1.5 h-7 w-[76px] rounded-[4px] text-[12px] font-bold uppercase tracking-[0.6px] transition-colors",
                      currentPage === 1
                        ? "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                        : "bg-[#00775b] text-white hover:bg-[#009e78]"
                    )}
                  >
                    <ChevronLeft className="w-3.5 h-3.5" /> PREV
                  </button>

                  {/* Page numbers */}
                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                      <button
                        key={p}
                        onClick={() => setCurrentPage(p)}
                        className={cn(
                          "w-7 h-7 rounded-[4px] text-[12px] font-bold transition-colors",
                          currentPage === p
                            ? "bg-[#00775b] text-white"
                            : "bg-[#f1f5f9] text-[#475569] hover:bg-[#e2e8f0]"
                        )}
                      >
                        {p}
                      </button>
                    ))}
                  </div>

                  {/* Next */}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "flex items-center justify-center gap-1.5 h-7 w-[77px] rounded-[4px] text-[12px] font-bold uppercase tracking-[0.6px] transition-colors",
                      currentPage === totalPages
                        ? "bg-[#e2e8f0] text-[#94a3b8] cursor-not-allowed"
                        : "bg-[#00775b] text-white hover:bg-[#009e78]"
                    )}
                  >
                    NEXT <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  {/* Showing X–Y of Z */}
                  <div className="absolute right-4 text-[11px] text-[#64748b] tabular-nums">
                    Showing{" "}
                    <span className="font-semibold text-[#334155]">
                      {(currentPage - 1) * ITEMS_PER_PAGE + 1}–{Math.min(currentPage * ITEMS_PER_PAGE, filteredViolations.length)}
                    </span>{" "}
                    of{" "}
                    <span className="font-semibold text-[#334155]">{filteredViolations.length}</span>{" "}
                    incidents
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Manager Persona ─────────────────────────────────────────────────────── */}
      {persona === "manager" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Violation Count", value: `${SAFETY_METRICS.violationCount}`, sub: "Under SLA target (60)", subColor: "#00A63E" },
              { label: "Compliance Rate", value: `${SAFETY_METRICS.complianceRate}%`, sub: `↑ ${SAFETY_METRICS.complianceChange}% this week`, subColor: "#00A63E" },
              { label: "Peak Hour", value: "08:00", sub: "14 violations", subColor: "#EA580C" },
              { label: "Top Risk Zone", value: SAFETY_METRICS.topRiskZone, sub: "49% of violations", subColor: "#E7000B", smallValue: true },
            ].map(({ label, value, sub, subColor, smallValue }) => (
              <div key={label} className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
                <div className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">{label}</div>
                <div className={cn("font-data font-bold text-white tracking-[-0.75px]", smallValue ? "text-[20px] leading-tight" : "text-[30px]")}>{value}</div>
                <div className="font-bold text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2" style={{ color: subColor }}>{sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">Safety Compliance Trends</div>
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                {(["trend", "zone", "type"] as const).map((v) => (
                  <button key={v} onClick={() => setChartView(v)}
                    className={cn("px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                      chartView === v ? "bg-[#00775B] text-white" : "text-neutral-600 hover:text-neutral-900")}>
                    {v === "trend" ? "Trend" : v === "zone" ? "By Zone" : "By Type"}
                  </button>
                ))}
              </div>
            </div>
            <div className="h-80">{renderChart()}</div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">Violations by Type</div>
              <div className="space-y-3">
                {[{ label: "PPE Violations", pct: 68, color: "#2B7FFF", val: "32 (68%)" }, { label: "Unsafe Behavior", pct: 26, color: "#EA580C", val: "12 (26%)" }, { label: "Restricted Access", pct: 6, color: "#64748B", val: "3 (6%)" }].map(({ label, pct, color, val }) => (
                  <div key={label}>
                    <div className="flex items-center justify-between mb-2"><div className="text-[11px] font-medium text-neutral-700">{label}</div><div className="text-[11px] font-bold text-neutral-900">{val}</div></div>
                    <div className="h-2 bg-neutral-100 rounded-full overflow-hidden"><div className="h-full" style={{ width: `${pct}%`, backgroundColor: color }} /></div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1">Insight</div>
                <div className="text-[11px] text-blue-800">PPE violations account for 68% of all safety issues. Consider equipment availability review.</div>
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">Peak Hour Analysis</div>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={COMPLIANCE_TREND_DATA} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fontSize: 10, fill: "#64748B" }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ fontSize: "10px", borderRadius: "4px" }} cursor={{ fill: "rgba(0,119,91,0.1)" }} />
                  <Bar dataKey="violations" fill="#E7000B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="text-[10px] font-bold uppercase tracking-wider text-red-900 mb-1">Recommendation</div>
                <div className="text-[11px] text-red-800">Morning shift (8AM–10AM) shows highest violations. Consider additional safety briefing.</div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Director Persona ────────────────────────────────────────────────────── */}
      {persona === "director" && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[
              { label: "Monthly Compliance", value: "94.8%",   sub: "↑ 1.2% vs last month",     subColor: "#00A63E" },
              { label: "YoY Reduction",       value: "32%",     sub: "Severe violations down",    subColor: "#00A63E" },
              { label: "Audit Complete",       value: "98.2%",  sub: "All critical audited",      subColor: "#00A63E" },
              { label: "Zero Incident Days",   value: "18",     sub: "This quarter",              subColor: "#00775B" },
            ].map(({ label, value, sub, subColor }) => (
              <div key={label} className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
                <div className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">{label}</div>
                <div className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">{value}</div>
                <div className="font-bold text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2" style={{ color: subColor }}>{sub}</div>
              </div>
            ))}
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">Safety Heatmap - 30 Day Analysis</div>
            <div className="space-y-3">
              {HEATMAP_ZONES.map((z) => (
                <div key={z.zone} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <div className="text-[11px] font-bold text-neutral-900">{z.zone}</div>
                      <div className="text-[11px] font-bold" style={{ color: getRiskColor(z.risk) }}>{z.violations} violations</div>
                    </div>
                    <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden relative">
                      <div className="h-full transition-all duration-500" style={{ width: `${(z.violations / 23) * 100}%`, backgroundColor: getRiskColor(z.risk) }} />
                      <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-neutral-700 uppercase tracking-wider">{z.risk} risk</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">Protocol Audit Status</div>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1"><div className="text-[10px] text-neutral-500 uppercase tracking-wide">Completed</div><div className="font-data font-bold text-2xl text-[#00775B]">46</div></div>
                  <div className="flex items-baseline justify-between"><div className="text-[10px] text-neutral-500 uppercase tracking-wide">In Review</div><div className="font-data font-bold text-lg text-[#E19A04]">1</div></div>
                </div>
                <div className="pt-4 border-t border-neutral-200 grid grid-cols-2 gap-3">
                  <div><div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Critical</div><div className="font-data font-bold text-lg text-neutral-900">100%</div><div className="text-[9px] text-[#00A63E] font-bold">All audited</div></div>
                  <div><div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">High</div><div className="font-data font-bold text-lg text-neutral-900">96%</div><div className="text-[9px] text-[#00A63E] font-bold">1 pending</div></div>
                </div>
              </div>
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <div className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">Legal Compliance</div>
              <div className="space-y-4">
                <div><div className="flex items-baseline justify-between mb-2"><div className="text-[10px] text-neutral-500 uppercase tracking-wide">Documentation Rate</div><div className="font-data font-bold text-2xl text-[#00775B]">98.2%</div></div><div className="text-[10px] text-neutral-500">All incidents properly documented</div></div>
                <div className="pt-4 border-t border-neutral-200"><div className="flex items-baseline justify-between mb-2"><div className="text-[10px] text-neutral-500 uppercase tracking-wide">Staff Notes</div><div className="font-data font-bold text-2xl text-neutral-900">46/47</div></div><div className="text-[10px] text-neutral-500">1 note pending completion</div></div>
                <div className="pt-4 border-t border-neutral-200"><div className="flex items-baseline justify-between mb-2"><div className="text-[10px] text-neutral-500 uppercase tracking-wide">Regulatory Score</div><div className="font-data font-bold text-2xl text-[#00775B]">96/100</div></div><div className="text-[10px] text-[#00A63E] font-bold">✓ OSHA Compliant</div></div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Universal side modal ───────────────────────────────────────────── */}
      {renderModal()}
    </div>
  );
};
