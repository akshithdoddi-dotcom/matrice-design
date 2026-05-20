import { useState, useRef, useEffect } from "react";
import { ZONE_CARDS, ZONE_VIOLATIONS_TICKER, ZoneCard as ZoneCardType, ZoneStatus } from "@/app/data/mockData";
import { Persona } from "../dashboard/PersonaSwitcher";
import { MapPin, Clock, Users, AlertTriangle, Camera, TrendingUp, Gauge, Shield, ArrowRight, Activity, Maximize2, BarChart3, PieChart, Calendar, Search, Check, ChevronDown, Bell, Eye, Ban, Settings, X } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { LineChart, Line, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, Cell, PieChart as RechartsPieChart, Pie } from "recharts";
import { AnalyticsHeader } from "./AnalyticsHeader";
import { motion } from "motion/react";
import { ImageWithFallback } from "../figma/ImageWithFallback";
import { ZoneConfigurationModal } from "../zone-config/ZoneConfigurationModal";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";

// Utility: Calculate seconds ago for real-time timestamps
const getSecondsAgo = (zoneId: string): number => {
  // Simulate real-time updates based on zone ID
  const hash = zoneId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return (hash % 60) + 1; // 1-60 seconds ago
};

// App Category Types
type AppCategory = "all" | "intrusion" | "queue" | "directional" | "mustering" | "parking" | "utilization";

interface AppFilter {
  id: AppCategory;
  label: string;
  icon: React.ReactNode;
}

const APP_FILTERS: AppFilter[] = [
  { id: "all", label: "All Applications", icon: <Maximize2 className="w-3.5 h-3.5" /> },
  { id: "intrusion", label: "Intrusion", icon: <Shield className="w-3.5 h-3.5" /> },
  { id: "queue", label: "Queue & Wait", icon: <Clock className="w-3.5 h-3.5" /> },
  { id: "directional", label: "Directional Flow", icon: <ArrowRight className="w-3.5 h-3.5" /> },
  { id: "mustering", label: "Mustering", icon: <Users className="w-3.5 h-3.5" /> },
  { id: "parking", label: "Parking", icon: <Activity className="w-3.5 h-3.5" /> },
  { id: "utilization", label: "Utilization", icon: <BarChart3 className="w-3.5 h-3.5" /> },
];

// Map zone app names to categories
const getZoneCategory = (app: string): AppCategory => {
  if (app.includes("Intrusion") || app.includes("Hazardous")) return "intrusion";
  if (app.includes("Queue") || app.includes("Wait")) return "queue";
  if (app.includes("Directional") || app.includes("Wrong-way")) return "directional";
  if (app.includes("Mustering") || app.includes("Overcrowding")) return "mustering";
  if (app.includes("Parking")) return "parking";
  if (app.includes("Utilization") || app.includes("Dwell") || app.includes("Heatmap")) return "utilization";
  return "all";
};

// Zone Multi-Select Filter Component
const ZoneMultiSelectFilter = ({ 
  selectedZones, 
  onZoneToggle,
  onClearAll 
}: { 
  selectedZones: Set<string>; 
  onZoneToggle: (zoneId: string) => void;
  onClearAll: () => void;
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredZones = ZONE_CARDS.filter(zone => 
    zone.zoneName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-3 py-2 bg-white border rounded text-[11px] font-bold transition-all",
          selectedZones.size > 0 
            ? "border-[#00775B] text-[#00775B] bg-[#E5FFF9]" 
            : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
        )}
      >
        <MapPin className="w-3.5 h-3.5" />
        <span>
          {selectedZones.size === 0 
            ? "Filter by Zone" 
            : `${selectedZones.size} Zone${selectedZones.size > 1 ? 's' : ''} Selected`}
        </span>
        <ChevronDown className={cn("w-3 h-3 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full right-0 mt-1 w-80 max-w-[calc(100vw-2rem)] bg-white border border-neutral-200 rounded-md shadow-xl z-50 animate-in fade-in zoom-in-95 duration-100">
            <div className="p-3 border-b border-neutral-100">
              <div className="relative">
                <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search zones..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-neutral-50 border border-neutral-200 rounded focus:border-[#00775B] focus:ring-1 focus:ring-[#00775B] outline-none"
                />
              </div>
            </div>

            <div className="max-h-64 overflow-y-auto custom-scrollbar p-2">
              {filteredZones.map((zone) => {
                const isSelected = selectedZones.has(zone.id);
                return (
                  <div
                    key={zone.id}
                    onClick={() => onZoneToggle(zone.id)}
                    className={cn(
                      "flex items-center gap-2 px-2 py-2 rounded cursor-pointer transition-colors",
                      isSelected ? "bg-[#E5FFF9]" : "hover:bg-neutral-50"
                    )}
                  >
                    <div className={cn(
                      "w-4 h-4 rounded border-2 flex items-center justify-center transition-all",
                      isSelected 
                        ? "border-[#00775B] bg-[#00775B]" 
                        : "border-neutral-300"
                    )}>
                      {isSelected && <Check className="w-3 h-3 text-white" />}
                    </div>
                    <div className="flex-1">
                      <div className="text-xs font-bold text-neutral-800">{zone.zoneName}</div>
                      <div className="text-[9px] text-neutral-500">{zone.app}</div>
                    </div>
                    {zone.status === "critical" || zone.status === "violation" ? (
                      <AlertTriangle className="w-3 h-3 text-red-500" />
                    ) : null}
                  </div>
                );
              })}
            </div>

            <div className="p-2 border-t border-neutral-100 bg-neutral-50 flex justify-between items-center">
              <button
                onClick={() => {
                  onClearAll();
                  setIsOpen(false);
                }}
                className="text-[10px] font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wide"
              >
                Clear All
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="px-3 py-1 bg-[#00775B] text-white text-[10px] font-bold uppercase rounded hover:bg-[#00956D]"
              >
                Apply
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

// App Filter Bar Component (Application Type Filters)
const AppFilterBar = ({ 
  selectedFilter, 
  onFilterChange,
  selectedZones,
  onZoneToggle,
  onClearZones
}: { 
  selectedFilter: AppCategory; 
  onFilterChange: (filter: AppCategory) => void;
  selectedZones: Set<string>;
  onZoneToggle: (zoneId: string) => void;
  onClearZones: () => void;
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-3 shadow-sm">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Filter by Application Type</h3>
          <div className="flex gap-2 flex-wrap">
            {APP_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onFilterChange(filter.id)}
                className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                  selectedFilter === filter.id
                    ? "bg-[#00775B] text-white shadow-md"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                )}
              >
                {filter.icon}
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        <div className="shrink-0">
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-2">Filter by Zone</h3>
          <ZoneMultiSelectFilter 
            selectedZones={selectedZones}
            onZoneToggle={onZoneToggle}
            onClearAll={onClearZones}
          />
        </div>
      </div>

      {(selectedFilter !== "all" || selectedZones.size > 0) && (
        <div className="flex items-center justify-between gap-2 pt-2 border-t border-neutral-100">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase text-neutral-400 tracking-wider">Active Filters:</span>
            {selectedFilter !== "all" && (
              <span className="px-2 py-1 bg-[#00775B] text-white text-[9px] font-bold uppercase rounded">
                {APP_FILTERS.find(f => f.id === selectedFilter)?.label}
              </span>
            )}
            {selectedZones.size > 0 && (
              <span className="px-2 py-1 bg-[#00775B] text-white text-[9px] font-bold uppercase rounded">
                {selectedZones.size} Zone{selectedZones.size > 1 ? 's' : ''}
              </span>
            )}
          </div>
          <button
            onClick={() => {
              onFilterChange("all");
              onClearZones();
            }}
            className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-[9px] font-bold uppercase rounded transition-colors flex items-center gap-1.5"
          >
            <span>Clear All Filters</span>
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Shared helpers ──────────────────────────────────────────────────────────

const STATUS_THEMES = {
  critical: { bar: "#E7000B", bg: "#FFF0F0", hero: "#E7000B", spark: "#E7000B" },
  warning:  { bar: "#EA580C", bg: "#FEEFE7", hero: "#EA580C", spark: "#EA580C" },
  normal:   { bar: "#00A63E", bg: "#F0FFF8", hero: "#00775B", spark: "#00A63E" },
} as const;

// Enhanced sparkline: threshold line, peak dot, pulsing "now" dot
const ZoneSparkline = ({
  data,
  color,
  thresholdPct,
  label = "Last 20m",
}: {
  data: number[];
  color: string;
  thresholdPct?: number; // 0-1: fraction of data range for the dashed threshold line
  label?: string;
}) => {
  if (data.length < 2) return null;
  const W = 200;
  const H = 30;
  const PAD = 4;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const toX = (i: number) => (i / (data.length - 1)) * W;
  const toY = (v: number) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const path = data.map((v, i) => `${i === 0 ? "M" : "L"} ${toX(i).toFixed(1)} ${toY(v).toFixed(1)}`).join(" ");
  const peakIdx = data.indexOf(max);
  const peakX = toX(peakIdx);
  const peakY = toY(max);
  const nowX = toX(data.length - 1);
  const nowY = toY(data[data.length - 1]);
  const threshY = thresholdPct !== undefined ? toY(min + thresholdPct * range) : undefined;
  const aboveThresh = thresholdPct !== undefined && data[data.length - 1] > min + thresholdPct * range;
  return (
    <div className="px-3 pb-1 shrink-0">
      <svg width="100%" height={H} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
        {threshY !== undefined && (
          <line x1="0" y1={threshY} x2={W} y2={threshY}
            stroke={aboveThresh ? color : "#9CA3AF"} strokeWidth="0.8" strokeDasharray="4 3" opacity="0.5" />
        )}
        <path d={path} fill="none" stroke={color} strokeWidth="1.75"
          strokeLinecap="round" strokeLinejoin="round" opacity="0.85" />
        {peakIdx !== data.length - 1 && (
          <circle cx={peakX} cy={peakY} r="2.5" fill={color} opacity="0.75" />
        )}
        <circle cx={nowX} cy={nowY} r="2.5" fill={color} />
      </svg>
      <div className="flex justify-between mt-0.5 mb-1">
        <span className="text-[7px] text-neutral-400 font-mono">{label}</span>
        <span className="text-[7px] font-bold font-mono" style={{ color }}>Now ●</span>
      </div>
    </div>
  );
};

// Shared hover action buttons
const HoverActions = () => (
  <></>
);

// ─── Adaptive Zone Card ───────────────────────────────────────────────────────

interface AdaptiveZoneCardProps {
  zone: ZoneCardType;
  onClick: () => void;
  scrollRef?: (el: HTMLDivElement | null) => void;
  isHighlighted?: boolean;
}

const AdaptiveZoneCard = ({ zone, onClick, scrollRef, isHighlighted }: AdaptiveZoneCardProps) => {
  const category = getZoneCategory(zone.app);

  // ── INTRUSION ───────────────────────────────────────────────────────────────
  if (category === "intrusion") {
    const count = zone.currentCount;
    const isActive = count > 0;
    const t = isActive ? STATUS_THEMES.critical : STATUS_THEMES.normal;
    return (
      <motion.div
        ref={scrollRef} layout
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={onClick}
        className={cn(
          "group relative rounded border overflow-hidden cursor-pointer flex flex-col h-[220px] transition-all hover:shadow-md",
          isHighlighted && "border-[#00775B] !border-2 shadow-[0_0_12px_rgba(0,119,91,0.3)]",
          !isHighlighted && "border-neutral-200"
        )}
        style={{ backgroundColor: t.bg }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ backgroundColor: t.bar }} />
        <div className="pl-4 pr-3 pt-3 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2 gap-1">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-500 truncate leading-tight">{zone.app}</p>
              <h3 className="text-[11px] font-bold text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#E7000B]" />
              <span className="text-[8px] font-mono" style={{ color: t.bar }}>Live</span>
            </div>
          </div>
          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            {isActive ? (
              <>
                <div className="text-[52px] font-mono font-bold leading-none" style={{ color: t.hero }}>
                  {String(count).padStart(2, "0")}
                </div>
                <div className="text-[10px] font-semibold text-neutral-600 mt-1 uppercase tracking-wide">
                  Unauthorized {count > 1 ? "Targets" : "Target"}
                </div>
                {zone.lastIncident && (
                  <div className="text-[9px] text-neutral-400 mt-0.5 font-mono">First detected {zone.lastIncident}</div>
                )}
              </>
            ) : (
              <>
                <div className="text-[28px] font-bold leading-none" style={{ color: t.hero }}>✓ CLEAR</div>
                <div className="text-[10px] font-semibold text-neutral-500 mt-1">Zone Secured</div>
              </>
            )}
          </div>
        </div>
        <ZoneSparkline data={zone.sparklineData} color={t.spark} />
        {/* Camera badge */}
        <button onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono text-white z-10"
          style={{ backgroundColor: t.bar }}>
          <Camera className="w-2.5 h-2.5" />{zone.camera}
        </button>
        <HoverActions />
      </motion.div>
    );
  }

  // ── QUEUE ────────────────────────────────────────────────────────────────────
  if (category === "queue") {
    const waitSecs = parseInt(zone.dwellTime.split('m')[0]) * 60 + (parseInt(zone.dwellTime.split('m')[1]?.split('s')[0] || "0") || 0);
    const slaSecs = parseInt((zone.slaLimit || "5m").replace('m', '')) * 60;
    const slaPercent = Math.min((waitSecs / slaSecs) * 100, 100);
    const breached = waitSecs > slaSecs;
    const nearBreach = !breached && (slaSecs - waitSecs) <= 30;
    const t = breached ? STATUS_THEMES.critical : nearBreach ? STATUS_THEMES.warning : STATUS_THEMES.normal;
    return (
      <motion.div
        ref={scrollRef} layout
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={onClick}
        className={cn(
          "group relative rounded border overflow-hidden cursor-pointer flex flex-col h-[220px] transition-all hover:shadow-md",
          isHighlighted && "border-[#00775B] !border-2 shadow-[0_0_12px_rgba(0,119,91,0.3)]",
          !isHighlighted && "border-neutral-200"
        )}
        style={{ backgroundColor: t.bg }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ backgroundColor: t.bar }} />
        <div className="pl-4 pr-3 pt-3 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2 gap-1">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-500 truncate leading-tight">{zone.app}</p>
              <h3 className="text-[11px] font-bold text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            </div>
            {breached && (
              <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white shrink-0" style={{ backgroundColor: t.bar }}>SLA Breach</span>
            )}
          </div>
          {/* Hero */}
          <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="text-[38px] font-mono font-bold leading-none" style={{ color: t.hero }}>{zone.dwellTime}</div>
            <div className="text-[10px] font-semibold text-neutral-600 mt-1 uppercase tracking-wide">Avg Wait Time</div>
            <div className="text-[13px] font-bold text-neutral-700 mt-1.5">
              {zone.queueLength || 0}{" "}
              <span className="text-[10px] font-normal text-neutral-500">People in Queue</span>
            </div>
          </div>
          {/* SLA bar */}
          <div className="mb-2 shrink-0">
            <div className="flex justify-between mb-0.5">
              <span className="text-[8px] text-neutral-500 uppercase tracking-wide">SLA {zone.slaLimit || "5m"}</span>
              <span className="text-[8px] font-mono font-bold" style={{ color: t.bar }}>{Math.round(slaPercent)}%</span>
            </div>
            <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all" style={{ width: `${slaPercent}%`, backgroundColor: t.bar }} />
            </div>
          </div>
        </div>
        <ZoneSparkline data={zone.sparklineData} color={t.spark} thresholdPct={0.85} label="Last 20m · Wait Time" />
        <button onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono text-white z-10"
          style={{ backgroundColor: t.bar }}>
          <Camera className="w-2.5 h-2.5" />{zone.camera}
        </button>
        <HoverActions />
      </motion.div>
    );
  }

  // ── DIRECTIONAL ──────────────────────────────────────────────────────────────
  if (category === "directional") {
    const violations = zone.status === "violation" ? Math.max(zone.currentCount, 6) : Math.min(zone.currentCount, 4);
    const t = violations > 5 ? STATUS_THEMES.critical : violations > 2 ? STATUS_THEMES.warning : STATUS_THEMES.normal;
    const compliance = Math.round(((100 - violations) / 100) * 100);
    return (
      <motion.div
        ref={scrollRef} layout
        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
        onClick={onClick}
        className={cn(
          "group relative rounded border overflow-hidden cursor-pointer flex flex-col h-[220px] transition-all hover:shadow-md",
          isHighlighted && "border-[#00775B] !border-2 shadow-[0_0_12px_rgba(0,119,91,0.3)]",
          !isHighlighted && "border-neutral-200"
        )}
        style={{ backgroundColor: t.bg }}
      >
        <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ backgroundColor: t.bar }} />
        <div className="pl-4 pr-3 pt-3 flex flex-col flex-1 min-h-0">
          {/* Header */}
          <div className="flex items-start justify-between mb-2 gap-1">
            <div className="flex-1 min-w-0">
              <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-500 truncate leading-tight">{zone.app}</p>
              <h3 className="text-[11px] font-bold text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
            </div>
            <div className="flex items-center gap-1 shrink-0 mt-0.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00A63E]" />
              <span className="text-[8px] font-mono text-[#00A63E]">Live</span>
            </div>
          </div>
          {/* Hero + compliance */}
          <div className="flex items-center flex-1 gap-2">
            <div className="flex-1 text-center">
              <div className="text-[52px] font-mono font-bold leading-none" style={{ color: t.hero }}>{violations}</div>
              <div className="text-[10px] font-semibold text-neutral-600 mt-1 uppercase tracking-wide">Wrong-Way</div>
              <div className="text-[9px] text-neutral-400">violations · last hour</div>
            </div>
            <div className="flex flex-col items-center gap-1.5 shrink-0">
              <ArrowRight className={cn("w-8 h-8", violations > 5 ? "text-[#E7000B]" : "text-[#00A63E]")} strokeWidth={2.5} />
              <div className="text-center">
                <div className="text-[18px] font-mono font-bold leading-none" style={{ color: t.hero }}>{compliance}%</div>
                <div className="text-[8px] text-neutral-500 leading-tight">Compliance</div>
              </div>
            </div>
          </div>
        </div>
        <ZoneSparkline data={zone.sparklineData} color={t.spark} thresholdPct={0.75} label="Last 20m · Violations" />
        <button onClick={(e) => { e.stopPropagation(); onClick(); }}
          className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono text-white z-10"
          style={{ backgroundColor: t.bar }}>
          <Camera className="w-2.5 h-2.5" />{zone.camera}
        </button>
        <HoverActions />
      </motion.div>
    );
  }

  // ── DENSITY (mustering / parking / utilization / default) ────────────────────
  const occ = zone.occupancy;
  const t = occ >= 90 ? STATUS_THEMES.critical : occ >= 75 ? STATUS_THEMES.warning : STATUS_THEMES.normal;
  const radius = 22;
  const circ = 2 * Math.PI * radius;
  const dashOffset = circ - (occ / 100) * circ;
  return (
    <motion.div
      ref={scrollRef} layout
      initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      onClick={onClick}
      className={cn(
        "group relative rounded border overflow-hidden cursor-pointer flex flex-col h-[220px] transition-all hover:shadow-md",
        isHighlighted && "border-[#00775B] !border-2 shadow-[0_0_12px_rgba(0,119,91,0.3)]",
        !isHighlighted && "border-neutral-200"
      )}
      style={{ backgroundColor: t.bg }}
    >
      <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l" style={{ backgroundColor: t.bar }} />
      <div className="pl-4 pr-3 pt-3 flex flex-col flex-1 min-h-0">
        {/* Header */}
        <div className="mb-2">
          <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-500 truncate leading-tight">{zone.app}</p>
          <h3 className="text-[11px] font-bold text-neutral-800 truncate leading-tight">{zone.zoneName}</h3>
        </div>
        {/* Hero + donut */}
        <div className="flex items-center flex-1 gap-2">
          <div className="flex-1 text-center">
            <div className="text-[52px] font-mono font-bold leading-none" style={{ color: t.hero }}>
              {occ}<span className="text-[30px]">%</span>
            </div>
            <div className="text-[10px] font-semibold text-neutral-600 mt-1 uppercase tracking-wide">Current Density</div>
            <div className="text-[12px] font-bold text-neutral-700 mt-1">
              {zone.currentCount} <span className="text-[9px] font-normal text-neutral-500">/ {zone.maxCapacity} Capacity</span>
            </div>
          </div>
          {/* Mini donut */}
          <div className="relative w-14 h-14 shrink-0">
            <svg className="w-full h-full -rotate-90" viewBox="0 0 50 50">
              <circle cx="25" cy="25" r={radius} fill="none" stroke="#E5E7EB" strokeWidth="5" />
              <circle cx="25" cy="25" r={radius} fill="none" stroke={t.bar} strokeWidth="5"
                strokeDasharray={circ} strokeDashoffset={dashOffset} strokeLinecap="round" className="transition-all" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-[10px] font-mono font-bold" style={{ color: t.hero }}>{occ}%</span>
            </div>
          </div>
        </div>
      </div>
      <ZoneSparkline data={zone.sparklineData} color={t.spark} thresholdPct={0.9} label="Last 20m · Density" />
      <button onClick={(e) => { e.stopPropagation(); onClick(); }}
        className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[8px] font-mono text-white z-10"
        style={{ backgroundColor: t.bar }}>
        <Camera className="w-2.5 h-2.5" />{zone.camera}
      </button>
      <HoverActions />
    </motion.div>
  );
};

const ZoneViolationsTicker = () => {
  return (
    <div className="w-full bg-neutral-900 text-white text-[10px] py-1.5 px-4 overflow-hidden flex items-center gap-4 border-b border-[#00775B]/30 sticky top-0 z-30">
      <span className="font-bold uppercase tracking-wider text-[#00775B] shrink-0 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-[#E7000B] shadow-[0_0_8px_rgba(231,0,11,0.6)]" />
        Live Zone Violations
      </span>
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-marquee whitespace-nowrap flex gap-8">
          {[...ZONE_VIOLATIONS_TICKER, ...ZONE_VIOLATIONS_TICKER].map((violation, i) => (
            <span key={i} className="inline-flex items-center gap-2">
              <span className={cn(
                "font-bold uppercase px-1.5 py-0.5 rounded text-[9px]",
                violation.severity === "critical" && "bg-[#E7000B] text-white",
                violation.severity === "high" && "bg-[#EA580C] text-white",
                violation.severity === "medium" && "bg-[#E19A04] text-white"
              )}>
                {violation.severity}
              </span>
              <span className="font-medium">{violation.message}</span>
              <span className="text-neutral-400">({violation.zone} - {violation.camera})</span>
              <span className="text-neutral-500">{violation.time}</span>
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// Live Zone Occupancy Map - Visual Centerpiece
const LiveZoneOccupancyMap = ({ onZoneClick, highlightedZone }: { onZoneClick: (zone: ZoneCardType) => void; highlightedZone?: string | null }) => {
  const [hoveredZone, setHoveredZone] = useState<string | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [hasConfigured, setHasConfigured] = useState(false);

  // Simplified 2D floor plan layout - zones positioned as rectangles
  const zonePositions = [
    { zone: ZONE_CARDS[0], x: 10, y: 10, width: 120, height: 80, label: "Main\nEntrance" }, // Main Entrance Queue
    { zone: ZONE_CARDS[1], x: 150, y: 10, width: 100, height: 60, label: "Server\nRoom" }, // Server Room
    { zone: ZONE_CARDS[2], x: 10, y: 110, width: 140, height: 90, label: "Loading\nDock" }, // Loading Dock
    { zone: ZONE_CARDS[3], x: 270, y: 10, width: 140, height: 120, label: "Parking\nLot A" }, // Parking
    { zone: ZONE_CARDS[4], x: 150, y: 90, width: 100, height: 60, label: "Restricted\nZone C" }, // Restricted Zone
    { zone: ZONE_CARDS[5], x: 270, y: 150, width: 100, height: 70, label: "Cafeteria" }, // Cafeteria
    { zone: ZONE_CARDS[6], x: 10, y: 220, width: 110, height: 80, label: "Lobby" }, // Lobby
    { zone: ZONE_CARDS[7], x: 380, y: 150, width: 90, height: 70, label: "Perimeter\nNorth" }, // Perimeter
    { zone: ZONE_CARDS[8], x: 170, y: 170, width: 90, height: 80, label: "Warehouse\nA" }, // Warehouse
    { zone: ZONE_CARDS[9], x: 380, y: 10, width: 90, height: 120, label: "Emergency\nExit B" }, // Emergency Exit
    { zone: ZONE_CARDS[10], x: 130, y: 270, width: 130, height: 80, label: "Retail\nFloor 1" }, // Retail Floor
    { zone: ZONE_CARDS[11], x: 280, y: 240, width: 90, height: 60, label: "Back\nAlley" }, // Back Alley
  ];

  // Mirror STATUS_THEMES thresholds so map and matrix cards stay in sync
  const getZoneColor = (status: string, occupancy: number) => {
    if (status === "critical" || status === "violation") return "#E7000B";
    if (status === "stagnant" || occupancy >= 90) return "#E7000B";   // critical tier
    if (occupancy >= 75) return "#EA580C";                            // warning tier
    if (occupancy >= 50) return "#E19A04";                            // mild amber
    return "#00A63E";                                                  // normal
  };

  const hoveredData = hoveredZone ? zonePositions.find(z => z.zone.id === hoveredZone)?.zone : null;

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4 h-full">
      <div className="flex items-center gap-2 mb-3">
        <MapPin className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Live Zone Occupancy Map</h3>

        {/* Configure Areas Button — only shown after first configuration */}
        {hasConfigured && (
          <button
            onClick={() => setIsConfigOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#00775B] hover:bg-[#009e78] text-white rounded text-[10px] font-bold uppercase tracking-wider transition-all shadow-sm hover:shadow-md ml-2"
            title="Configure Zones"
          >
            <Settings className="w-3.5 h-3.5" />
            Configure Areas
          </button>
        )}

        {/* Live Pulsing Indicator */}
        {hasConfigured && (
          <div className="flex items-center gap-1.5 ml-auto">
            <div className="w-2 h-2 rounded-full bg-[#00775B] shadow-[0_0_8px_rgba(0,119,91,0.6)]" />
            <span className="text-[9px] font-bold uppercase tracking-wider text-[#00775B]">Live</span>
          </div>
        )}
      </div>

      {/* Zone Configuration Modal */}
      <ZoneConfigurationModal
        isOpen={isConfigOpen}
        onClose={() => setIsConfigOpen(false)}
        onSave={() => setHasConfigured(true)}
      />

      {/* Placeholder when not yet configured */}
      {!hasConfigured ? (
        <div className="relative bg-neutral-50 rounded border border-neutral-200 flex flex-col items-center justify-center" style={{ height: 500 }}>
          {/* Greyed-out zone mockup */}
          <svg width="100%" height="60%" viewBox="0 0 480 260" preserveAspectRatio="xMidYMid meet" className="opacity-20 pointer-events-none select-none">
            <defs>
              <pattern id="placeholder-grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#9CA3AF" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#placeholder-grid)" />
            <rect x="20" y="20" width="110" height="75" fill="#6B7280" rx="4" />
            <rect x="150" y="20" width="90" height="55" fill="#6B7280" rx="4" />
            <rect x="20" y="110" width="130" height="80" fill="#6B7280" rx="4" />
            <rect x="260" y="20" width="130" height="110" fill="#6B7280" rx="4" />
            <rect x="150" y="90" width="90" height="55" fill="#9CA3AF" rx="4" />
            <rect x="260" y="145" width="95" height="65" fill="#9CA3AF" rx="4" />
            <rect x="20" y="205" width="100" height="45" fill="#9CA3AF" rx="4" />
            <rect x="365" y="20" width="85" height="110" fill="#6B7280" rx="4" />
            <rect x="160" y="160" width="85" height="75" fill="#9CA3AF" rx="4" />
            <text x="75" y="62" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">ZONE A</text>
            <text x="195" y="52" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">ZONE B</text>
            <text x="85" y="155" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">ZONE C</text>
            <text x="325" y="82" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">ZONE D</text>
            <text x="408" y="82" textAnchor="middle" fill="#fff" fontSize="8" fontWeight="bold">ZONE E</text>
          </svg>

          {/* CTA */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
            <div className="text-center space-y-1">
              <p className="text-sm font-bold uppercase tracking-wider text-neutral-700">No Zones Configured</p>
              <p className="text-xs text-neutral-400">Set up zones to track real-time occupancy and violations</p>
            </div>
            <button
              onClick={() => setIsConfigOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-[#00775B] hover:bg-[#009e78] text-white rounded text-xs font-bold uppercase tracking-wider transition-all shadow-md hover:shadow-lg"
            >
              <Settings className="w-4 h-4" />
              Configure Zones
            </button>
          </div>
        </div>
      ) : (
      <div className="relative bg-neutral-50 rounded border border-neutral-200" style={{ height: 500 }}>
        <svg width="100%" height="100%" viewBox="0 0 480 360" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
          {/* Grid lines for spatial context */}
          <defs>
            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
              <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#D1D5DB" strokeWidth="0.8" opacity="0.4" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Zone rectangles */}
          {zonePositions.map(({ zone, x, y, width, height, label }) => (
            <g key={zone.id}>
              <rect
                x={x}
                y={y}
                width={width}
                height={height}
                fill={getZoneColor(zone.status, zone.occupancy)}
                fillOpacity={hoveredZone === zone.id || highlightedZone === zone.id ? 0.9 : 0.7}
                stroke={highlightedZone === zone.id ? "#00775B" : hoveredZone === zone.id ? "#00775B" : "#fff"}
                strokeWidth={highlightedZone === zone.id ? 4 : hoveredZone === zone.id ? 3 : 2}
                rx="4"
                className="cursor-pointer transition-all"
                onMouseEnter={() => setHoveredZone(zone.id)}
                onMouseLeave={() => setHoveredZone(null)}
                onClick={() => onZoneClick(zone)}
                style={{
                  filter: zone.status === "critical" || zone.status === "violation" 
                    ? "drop-shadow(0 0 8px rgba(231, 0, 11, 0.6))" 
                    : highlightedZone === zone.id
                    ? "drop-shadow(0 0 12px rgba(0, 119, 91, 0.8))"
                    : "none"
                }}
              />
              {/* Zone Name */}
              <text
                x={x + width / 2}
                y={y + height / 2 - 10}
                textAnchor="middle"
                dominantBaseline="middle"
                className="text-[9px] font-bold fill-white pointer-events-none"
                style={{ textShadow: "0 1px 2px rgba(0,0,0,0.5)" }}
              >
                {label.split('\n').map((line, i) => (
                  <tspan key={i} x={x + width / 2} dy={i === 0 ? 0 : 11}>{line}</tspan>
                ))}
              </text>
              {/* Incident Type - if zone has violations */}
              {(zone.status === "critical" || zone.status === "violation") && (
                <text
                  x={x + width / 2}
                  y={y + height / 2 + 18}
                  textAnchor="middle"
                  className="text-[8px] font-bold fill-white pointer-events-none uppercase tracking-wide"
                  style={{ textShadow: "0 1px 3px rgba(0,0,0,0.8)" }}
                >
                  {zone.app.split(' ')[0]}
                </text>
              )}
              {/* Occupancy Percentage at bottom */}
              <text
                x={x + width / 2}
                y={y + height - 8}
                textAnchor="middle"
                className="text-[10px] font-mono font-bold fill-white pointer-events-none"
                style={{ textShadow: "0 1px 3px rgba(0,0,0,0.7)" }}
              >
                {zone.occupancy}%
              </text>
            </g>
          ))}
        </svg>

        {/* Hover Tooltip */}
        {hoveredData && (
          <div className="absolute bottom-4 left-4 bg-neutral-900/95 backdrop-blur-sm text-white px-3 py-2.5 rounded-lg shadow-xl text-[10px] font-mono pointer-events-none z-10 border border-white/10">
            <div className="font-bold text-[11px] mb-1.5">{hoveredData.zoneName}</div>
            <div className="space-y-0.5 text-[9px] mb-2">
              <div className="flex justify-between gap-3">
                <span className="text-neutral-300">Application:</span>
                <span className="font-bold text-white">{hoveredData.app}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-neutral-300">Dwell Time:</span>
                <span className="font-bold text-white">{hoveredData.dwellTime}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-neutral-300">Occupancy:</span>
                <span className="font-bold" style={{
                  color: hoveredData.occupancy >= 90 ? "#E7000B" : hoveredData.occupancy >= 75 ? "#EA580C" : "#00A63E"
                }}>
                  {hoveredData.occupancy}%
                </span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-neutral-300">Queue:</span>
                <span className="font-bold text-white">{hoveredData.queueLength} people</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-neutral-300">Camera:</span>
                <span className="font-bold text-white">{hoveredData.camera}</span>
              </div>
            </div>
            {(hoveredData.status === "critical" || hoveredData.status === "violation") && (
              <div className="pt-2 border-t border-white/10">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-[#E7000B]" />
                  <span className="text-[8px] font-bold uppercase tracking-wider text-[#E7000B]">Active Incident</span>
                </div>
              </div>
            )}
            <div className="mt-2 pt-2 border-t border-white/10 text-[8px] text-neutral-400 text-center">
              Click to view details
            </div>
          </div>
        )}

        {/* Legend */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-sm px-2 py-1.5 rounded border border-neutral-200 text-[9px] space-y-1">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#00A63E] rounded" />
            <span className="text-neutral-600">Normal</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#E19A04] rounded" />
            <span className="text-neutral-600">Busy</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#EA580C] rounded" />
            <span className="text-neutral-600">Stagnant</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 bg-[#E7000B] rounded" />
            <span className="text-neutral-600">Violation</span>
          </div>
        </div>
      </div>
      )}
    </div>
  );
};

// At-Risk Zones - Tactical Hotspot Sidebar
// Count-up timer sub-component
const CountUpTimer = ({ initialSeconds }: { initialSeconds: number }) => {
  const [secs, setSecs] = useState(initialSeconds);
  useEffect(() => {
    const id = setInterval(() => setSecs((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, []);
  return <>{String(Math.floor(secs / 60)).padStart(2, "0")}:{String(secs % 60).padStart(2, "0")}</>;
};

// Per-zone at-risk card
const AtRiskCard = ({
  zone,
  index,
  isAcknowledged,
  onAcknowledge,
  onView,
}: {
  zone: ZoneCardType;
  index: number;
  isAcknowledged: boolean;
  onAcknowledge: (e: React.MouseEvent) => void;
  onView: () => void;
}) => {
  const category = getZoneCategory(zone.app);
  const isViolation = zone.status === "critical" || zone.status === "violation";
  const timerSeed = zone.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 90 + 15;
  const [activeSeconds, setActiveSeconds] = useState(timerSeed);
  useEffect(() => {
    if (category !== "intrusion" || zone.currentCount === 0) return;
    const id = setInterval(() => setActiveSeconds((s) => s + 1), 1000);
    return () => clearInterval(id);
  }, [category, zone.currentCount]);

  const pulseSpeed = isViolation ? "0.8s" : "2s";
  const borderColor = isViolation ? "#E7000B" : "#EA580C";
  const bgColor = isViolation ? "#FFF0F0" : "#FEEFE7";

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: isAcknowledged ? 0.55 : 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className="rounded border overflow-hidden cursor-pointer transition-all relative"
      style={{
        borderColor: isAcknowledged ? "#E5E7EB" : borderColor,
        backgroundColor: isAcknowledged ? "#F9FAFB" : bgColor,
        boxShadow: !isAcknowledged && isViolation ? `0 0 10px rgba(231,0,11,0.2)` : undefined,
      }}
      onClick={() => !isAcknowledged && onView()}
    >
      <div className="p-2.5">
        {/* ── QUEUE ── */}
        {category === "queue" && (() => {
          const waitSecs = parseInt(zone.dwellTime.split("m")[0]) * 60 + (parseInt(zone.dwellTime.split("m")[1]?.split("s")[0] || "0") || 0);
          const slaSecs = parseInt((zone.slaLimit || "5m").replace("m", "")) * 60;
          const slaPercent = Math.min((waitSecs / slaSecs) * 100, 100);
          const breached = waitSecs > slaSecs;
          const alertColor = breached ? "#E7000B" : "#EA580C";

          // Compute forecast text
          const last5 = zone.sparklineData.slice(-5);
          const trendPerMin = (last5[last5.length - 1] - last5[0]) / (last5.length - 1);
          let forecastText: string | null = null;
          if (breached) {
            const over = waitSecs - slaSecs;
            const m = Math.floor(over / 60);
            const s = over % 60;
            forecastText = `Exceeds SLA by ${m > 0 ? `${m}m ` : ""}${s}s`;
          } else if (trendPerMin > 0) {
            const remainingSecs = slaSecs - waitSecs;
            const estMins = Math.ceil((remainingSecs / 60) / (trendPerMin / 100 * 2));
            if (estMins <= 5) forecastText = `⚡ Projected breach in ~${estMins}m at current rate`;
          }

          return (
            <>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: alertColor }}>
                    {breached ? "SLA Breach" : "Near Limit"}
                  </span>
                  <div className="text-[10px] font-bold text-neutral-800 mt-1 truncate">{zone.zoneName}</div>
                </div>
                <TrendingUp className="w-4 h-4 shrink-0 ml-1 mt-0.5" style={{ color: alertColor }} />
              </div>
              <div className="text-[26px] font-mono font-bold leading-none mb-0.5" style={{ color: alertColor }}>{zone.dwellTime}</div>
              <div className="text-[9px] text-neutral-500 mb-1">{zone.queueLength} people · SLA {zone.slaLimit || "5m"}</div>
              {forecastText && (
                <div className="text-[8px] font-bold mb-1.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: alertColor + "18", color: alertColor }}>
                  {forecastText}
                </div>
              )}
              <div className="h-1.5 bg-neutral-200 rounded-full overflow-hidden mb-0">
                <div className="h-full rounded-full" style={{ width: `${slaPercent}%`, backgroundColor: alertColor }} />
              </div>
            </>
          );
        })()}

        {/* ── INTRUSION ── */}
        {category === "intrusion" && (() => {
          const count = zone.currentCount;
          return (
            <>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white bg-[#E7000B]">Unauthorized</span>
                  <div className="text-[10px] font-bold text-neutral-800 mt-1 truncate">{zone.zoneName}</div>
                </div>
                <div className="text-right shrink-0 ml-2">
                  <div className="text-[8px] text-neutral-500 font-data leading-none">Active</div>
                  <div className="text-[12px] font-data font-bold text-[#E7000B] leading-tight tabular-nums">
                    <CountUpTimer initialSeconds={activeSeconds} />
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2 mb-1.5">
                <div className="text-[38px] font-mono font-bold text-[#E7000B] leading-none">{String(count || 1).padStart(2, "0")}</div>
                <div className="text-[9px] text-neutral-600 leading-snug">Unauthorized<br />{count > 1 ? "targets" : "target"} in zone</div>
                <div className="ml-auto w-2 h-2 bg-[#E7000B] rounded-full" />
              </div>
            </>
          );
        })()}

        {/* ── DIRECTIONAL ── */}
        {category === "directional" && (() => {
          const violations = isViolation ? Math.max(zone.currentCount, 6) : Math.min(zone.currentCount, 4);
          return (
            <>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white bg-[#EA580C]">Flow Breach</span>
                  <div className="text-[10px] font-bold text-neutral-800 mt-1 truncate">{zone.zoneName}</div>
                </div>
                <ArrowRight className="w-4 h-4 text-[#E7000B] rotate-180 shrink-0 ml-1 mt-0.5" />
              </div>
              <div className="flex items-end gap-2 mb-1.5">
                <span className="text-[38px] font-mono font-bold text-[#E7000B] leading-none">{violations}</span>
                <span className="text-[9px] text-neutral-600 mb-1">wrong-way<br />violations</span>
              </div>
            </>
          );
        })()}

        {/* ── DENSITY (default) ── */}
        {category !== "queue" && category !== "intrusion" && category !== "directional" && (() => {
          const pct = zone.occupancy;
          const remaining = zone.maxCapacity - zone.currentCount;
          const alertColor = pct >= 90 ? "#E7000B" : "#EA580C";
          return (
            <>
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <span className="text-[8px] font-bold uppercase px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: alertColor }}>
                    {pct >= 100 ? "Over Capacity" : pct > 90 ? "Near Limit" : "High Density"}
                  </span>
                  <div className="text-[10px] font-bold text-neutral-800 mt-1 truncate">{zone.zoneName}</div>
                </div>
                <Users className="w-4 h-4 shrink-0 ml-1 mt-0.5" style={{ color: alertColor }} />
              </div>
              <div className="text-[36px] font-mono font-bold leading-none mb-0.5" style={{ color: alertColor }}>{pct}%</div>
              <div className="text-[9px] text-neutral-500 mb-1.5">
                {zone.currentCount}/{zone.maxCapacity} capacity
                {remaining <= 3 && remaining > 0 && <span className="font-bold" style={{ color: alertColor }}> · {remaining} left</span>}
                {remaining <= 0 && <span className="font-bold" style={{ color: alertColor }}> · At limit</span>}
              </div>
              <div className="h-2 bg-neutral-200 rounded-full overflow-hidden mb-0">
                <div className={cn("h-full rounded-full")}
                  style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: alertColor }} />
              </div>
            </>
          );
        })()}
      </div>

      {/* Acknowledged overlay */}
      {isAcknowledged && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 pointer-events-none">
          <div className="flex items-center gap-1 bg-[#00A63E] text-white text-[9px] font-bold px-2 py-1 rounded-full shadow">
            <Check className="w-3 h-3" /> Claimed
          </div>
        </div>
      )}
    </motion.div>
  );
};

const AtRiskZonesSidebar = ({ onViewCamera }: { onViewCamera: (zone: ZoneCardType) => void }) => {
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const atRiskZones = [...ZONE_CARDS]
    .filter((z) => z.status === "critical" || z.status === "violation" || z.occupancy > 80)
    .sort((a, b) => {
      const order: Record<string, number> = { critical: 0, violation: 1, stagnant: 2, safe: 3 };
      return (order[a.status] ?? 4) - (order[b.status] ?? 4) || b.occupancy - a.occupancy;
    })
    .slice(0, 4);

  const handleAcknowledge = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setAcknowledged((prev) => new Set([...prev, id]));
  };

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-3 h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-3.5 h-3.5 text-[#E7000B]" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">At-Risk Zones</h3>
        </div>
        <span className="text-[8px] font-bold bg-[#E7000B] text-white px-1.5 py-0.5 rounded-full">{atRiskZones.length}</span>
      </div>
      <div className="flex flex-col gap-2 flex-1 overflow-y-auto">
        {atRiskZones.map((zone, index) => (
          <AtRiskCard
            key={zone.id}
            zone={zone}
            index={index}
            isAcknowledged={acknowledged.has(zone.id)}
            onAcknowledge={(e) => handleAcknowledge(zone.id, e)}
            onView={() => onViewCamera(zone)}
          />
        ))}
      </div>
    </div>
  );
};

// Simplified Zone Card - 40% smaller, primary metrics only
interface CompactZoneCardProps extends ZoneCardType {
  onClick: () => void;
}

const CompactZoneCard = ({ onClick, ...zone }: CompactZoneCardProps) => {
  const isViolation = zone.status === "critical" || zone.status === "violation";
  const violationCount = isViolation ? 1 : 0;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded border p-2 group hover:border-[#00775B]/50 transition-all cursor-pointer relative",
        isViolation && "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.5)]",
        zone.status === "stagnant" && "border-[#E19A04] bg-[#FFF7E6]",
        zone.status === "safe" && "border-neutral-200 bg-white"
      )}
      onClick={onClick}
    >
      {/* Header - Zone Name + App Tag */}
      <div className="mb-1.5">
        <h3 className="text-[9px] font-bold uppercase tracking-wide text-neutral-800 truncate mb-0.5">
          {zone.zoneName}
        </h3>
        <p className="text-[8px] text-neutral-500 truncate">{zone.app}</p>
      </div>

      {/* Primary Metrics Only - Icons + Values */}
      <div className="grid grid-cols-3 gap-1.5">
        <div className="flex flex-col items-center">
          <Users className="w-3 h-3 text-neutral-400 mb-0.5" />
          <div className={cn(
            "text-sm font-mono font-bold",
            zone.occupancy > 90 ? "text-[#E7000B]" : zone.occupancy > 75 ? "text-[#EA580C]" : "text-[#00775B]"
          )}>
            {zone.occupancy}%
          </div>
        </div>
        <div className="flex flex-col items-center">
          <Clock className="w-3 h-3 text-neutral-400 mb-0.5" />
          <div className="text-[10px] font-mono font-bold text-neutral-900">{zone.dwellTime}</div>
        </div>
        <div className="flex flex-col items-center">
          <AlertTriangle className="w-3 h-3 text-neutral-400 mb-0.5" />
          <div className={cn(
            "text-sm font-mono font-bold",
            violationCount > 0 ? "text-red-600" : "text-neutral-400"
          )}>
            {violationCount}
          </div>
        </div>
      </div>

      {/* Camera Badge */}
      <div className="absolute top-1 right-1 bg-neutral-900/70 text-white text-[7px] font-mono px-1 py-0.5 rounded">
        {zone.camera}
      </div>

      {/* Violation Pulse Indicator */}
      {isViolation && (
        <div className="-top-1 -right-1 w-2.5 h-2.5 bg-[#E7000B] rounded-full" />
      )}
    </motion.div>
  );
};

const QueueManagementPanel = () => {
  const queueZones = ZONE_CARDS.filter(z => z.queueLength > 0).sort((a, b) => b.queueLength - a.queueLength);

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Queue Management Panel</h3>
      </div>

      <div className="space-y-3">
        {queueZones.map((zone) => {
          const waitTimeSeconds = parseInt(zone.dwellTime.split('m')[0]) * 60 + parseInt(zone.dwellTime.split('m ')[1]?.split('s')[0] || "0");
          const slaLimit = 300; // 5 mins
          const slaPercentage = Math.min((waitTimeSeconds / slaLimit) * 100, 100);
          const breached = waitTimeSeconds > slaLimit;

          return (
            <div key={zone.id} className="border border-neutral-100 rounded p-2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] font-bold text-neutral-700">{zone.zoneName}</span>
                <span className="text-[9px] font-mono text-neutral-500">{zone.camera}</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <div className="flex justify-between text-[9px] mb-1">
                    <span className="text-neutral-500">Wait Time vs SLA</span>
                    <span className={cn("font-mono font-bold", breached ? "text-red-600" : "text-[#00775B]")}>
                      {zone.dwellTime}
                    </span>
                  </div>
                  <div className="w-full bg-neutral-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={cn(
                        "h-full transition-all",
                        breached ? "bg-[#E7000B]" : slaPercentage > 80 ? "bg-[#EA580C]" : "bg-[#00775B]"
                      )}
                      style={{ width: `${slaPercentage}%` }}
                    />
                  </div>
                </div>

                <div className="text-center">
                  <div className={cn(
                    "text-xl font-mono font-bold",
                    zone.queueLength > 10 ? "text-[#E7000B]" : zone.queueLength > 5 ? "text-[#EA580C]" : "text-[#00775B]"
                  )}>
                    {zone.queueLength}
                  </div>
                  <div className="text-[8px] text-neutral-400 uppercase">Queue</div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const IntrusionAlertGrid = () => {
  const restrictedZones = ZONE_CARDS.filter(z => z.app.includes("Intrusion") || z.app.includes("Hazardous"));

  return (
    <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-red-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Restricted Zones Monitor</h3>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {restrictedZones.map((zone) => (
          <div 
            key={zone.id}
            className={cn(
              "border rounded p-2 transition-all",
              zone.status === "violation" || zone.status === "critical"
                ? "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.5)] animate-pulse"
                : "border-neutral-200 bg-white"
            )}
          >
            <div className="flex justify-between items-start mb-2">
              <span className="text-[10px] font-bold text-neutral-800">{zone.zoneName}</span>
              {zone.lastIncident && (
                <span className="text-[8px] font-bold text-red-600 uppercase">{zone.lastIncident}</span>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-mono font-bold text-neutral-900">{zone.currentCount}</div>
                <div className="text-[8px] text-neutral-500 uppercase">Detected</div>
              </div>

              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center",
                zone.status === "violation" || zone.status === "critical"
                  ? "bg-[#E7000B] text-white"
                  : "bg-[#E5FFEF] text-[#00A63E]"
              )}>
                <Users className="w-5 h-5" />
              </div>
            </div>

            <div className="text-[9px] font-mono text-neutral-500 mt-2">{zone.camera}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

const ZoneDetailModal = ({ zone, open, onClose }: { zone: ZoneCardType | null; open: boolean; onClose: () => void }) => {
  if (!zone || !open) return null;

  const category = getZoneCategory(zone.app);
  const isViolation = zone.status === "critical" || zone.status === "violation";
  const t = isViolation ? STATUS_THEMES.critical : zone.occupancy >= 75 ? STATUS_THEMES.warning : STATUS_THEMES.normal;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-end bg-black/50"
      onClick={onClose}
    >
      <div
        className="bg-white h-screen w-full max-w-[550px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col h-full">
          {/* Compact Identity Header */}
          <div className="bg-white border-b border-neutral-200 px-5 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <p className="font-bold text-neutral-900 text-base">{zone.zoneName}</p>
                <span
                  className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                  style={{ backgroundColor: t.bar }}
                >
                  {zone.status}
                </span>
                <span className="text-xs text-neutral-400">|</span>
                <span className="text-xs text-neutral-600">{zone.app}</span>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-neutral-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-neutral-400" />
              </button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto">
            <div className="p-5 space-y-4">
              {/* Visual Evidence Container */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="relative aspect-[16/9] bg-neutral-900 rounded overflow-hidden">
                  <ImageWithFallback
                    src={zone.image}
                    alt={zone.zoneName}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-3 left-3 bg-neutral-900/90 backdrop-blur-sm text-white px-2 py-1 rounded text-[10px] font-bold uppercase">
                    {zone.camera}
                  </div>
                  <div className="absolute top-3 right-3 flex items-center gap-1.5 bg-white/10 backdrop-blur-sm rounded px-2 py-1">
                    <div className="w-2 h-2 rounded-full bg-[#00A63E]" />
                    <span className="text-[10px] text-white font-bold uppercase tracking-wide">Live</span>
                  </div>
                </div>
                {/* Tight 3-Column Metadata Strip */}
                <div className="mt-3 grid grid-cols-3 gap-3 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Dwell Time</span>
                    <span className="font-data font-bold text-neutral-900">{zone.dwellTime}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Camera</span>
                    <span className="font-data font-bold text-neutral-900 truncate">{zone.camera}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Last Update</span>
                    <span className="font-data font-bold text-neutral-900">{zone.lastIncident || "Now"}</span>
                  </div>
                </div>
              </div>

              {/* Key Metrics Container */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Key Metrics</div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-white rounded p-3 border border-neutral-200">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1">Occupancy</div>
                    <div className="text-2xl font-mono font-bold" style={{ color: t.hero }}>
                      {zone.occupancy}%
                    </div>
                    <div className="text-[10px] text-neutral-500 font-mono mt-1">
                      {zone.currentCount} / {zone.maxCapacity}
                    </div>
                  </div>
                  <div className="bg-white rounded p-3 border border-neutral-200">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1">Queue Length</div>
                    <div className="text-2xl font-mono font-bold text-neutral-900">{zone.queueLength}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">people waiting</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-neutral-200">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1">Avg Dwell</div>
                    <div className="text-2xl font-mono font-bold text-neutral-900">{zone.dwellTime}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">per person</div>
                  </div>
                  <div className="bg-white rounded p-3 border border-neutral-200">
                    <div className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1">Turnover</div>
                    <div className="text-2xl font-mono font-bold text-neutral-900">{zone.turnoverRate}</div>
                    <div className="text-[10px] text-neutral-500 mt-1">people/hr</div>
                  </div>
                </div>
              </div>

              {/* Directional Flow (if applicable) */}
              {zone.directionalFlow && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Directional Flow</div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#E5FFF9] rounded p-3">
                      <div className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Inbound</div>
                      <div className="text-2xl font-mono font-bold text-[#00775B]">{zone.directionalFlow.inbound}%</div>
                    </div>
                    <div className="bg-white rounded p-3 border border-neutral-200">
                      <div className="text-[10px] text-neutral-600 uppercase tracking-wide mb-1">Outbound</div>
                      <div className="text-2xl font-mono font-bold text-neutral-700">{zone.directionalFlow.outbound}%</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Occupancy Timeline */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">
                  Occupancy Timeline (Last 20 min)
                </div>
                <div className="bg-white rounded p-2 border border-neutral-200">
                  <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={zone.sparklineData.map((value, i) => ({ index: i, value, time: `${i * 2}m` }))} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                      <RechartsTooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-neutral-900/95 backdrop-blur-sm text-white px-3 py-2 rounded shadow-lg text-xs font-mono">
                                <div className="font-bold mb-1" style={{ color: t.hero }}>{payload[0].payload.time} ago</div>
                                <div>Occupancy: <span className="font-bold">{payload[0].value}%</span></div>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey="value"
                        stroke={t.spark}
                        strokeWidth={2}
                        dot={{ fill: t.spark, r: 3 }}
                        activeDot={{ r: 5 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* SLA Information (for queue zones) */}
              {zone.slaLimit && (
                <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                  <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">SLA Compliance</div>
                  <div className="bg-white rounded p-3 border border-neutral-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] text-neutral-600">SLA Limit</span>
                      <span className="text-[11px] font-mono font-bold text-neutral-900">{zone.slaLimit}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] text-neutral-600">Current Wait</span>
                      <span className="text-[11px] font-mono font-bold" style={{ color: t.hero }}>{zone.dwellTime}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sticky Footer with Action Buttons */}
          <div className="bg-white border-t border-neutral-200 px-5 py-4">
            <div className="flex gap-2">
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                <Camera className="w-3.5 h-3.5" />
                View Live Feed
              </button>
              <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#009e78] transition-colors">
                <Settings className="w-3.5 h-3.5" />
                Configure Zone
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Manager Application Filter Bar
const ManagerAppFilterBar = ({ 
  selectedFilter, 
  onFilterChange 
}: { 
  selectedFilter: AppCategory; 
  onFilterChange: (filter: AppCategory) => void;
}) => {
  return (
    <div className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Application Focus</h3>
          <p className="text-[9px] text-neutral-400">Filter zones by application type to see relevant performance metrics</p>
        </div>
      </div>
      <div className="flex gap-2 flex-wrap">
        {APP_FILTERS.map((filter) => {
          const zoneCount = filter.id === "all" 
            ? ZONE_CARDS.length 
            : ZONE_CARDS.filter(z => getZoneCategory(z.app) === filter.id).length;
          
          return (
            <button
              key={filter.id}
              onClick={() => onFilterChange(filter.id)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all",
                selectedFilter === filter.id
                  ? "bg-[#00775B] text-white shadow-md"
                  : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
              )}
            >
              {filter.icon}
              <span>{filter.label}</span>
              <span className={cn(
                "ml-1 px-1.5 py-0.5 rounded text-[8px] font-mono",
                selectedFilter === filter.id ? "bg-white/20" : "bg-neutral-200"
              )}>
                {zoneCount}
              </span>
            </button>
          );
        })}
      </div>
      
      {selectedFilter !== "all" && (
        <div className="mt-3 pt-3 border-t border-neutral-100 flex items-center justify-between">
          <div className="text-[9px] text-neutral-500">
            Showing <span className="font-bold text-neutral-700">{ZONE_CARDS.filter(z => getZoneCategory(z.app) === selectedFilter).length}</span> {APP_FILTERS.find(f => f.id === selectedFilter)?.label} zones
          </div>
          <button
            onClick={() => onFilterChange("all")}
            className="text-[9px] font-bold uppercase text-[#00775B] hover:text-[#00956D] transition-colors"
          >
            Clear Filter
          </button>
        </div>
      )}
    </div>
  );
};

// Manager Performance KPIs
const ManagerKPICards = () => {
  const totalZones = ZONE_CARDS.length;
  const avgUtilization = Math.round(ZONE_CARDS.reduce((acc, z) => acc + z.occupancy, 0) / totalZones);
  const avgTurnover = (ZONE_CARDS.reduce((acc, z) => acc + z.turnoverRate, 0) / totalZones).toFixed(1);
  
  // Calculate SLA compliance - zones under 5 min wait time
  const queueZones = ZONE_CARDS.filter(z => z.queueLength > 0);
  const slaCompliantZones = queueZones.filter(z => {
    const waitMins = parseInt(z.dwellTime.split('m')[0]);
    return waitMins <= 5;
  });
  const slaCompliance = queueZones.length > 0 
    ? Math.round((slaCompliantZones.length / queueZones.length) * 100) 
    : 100;

  const kpis = [
    { label: "Total Zones", value: totalZones, unit: "zones", status: "neutral", trend: "+2 vs last week" },
    { label: "Avg Utilization", value: avgUtilization, unit: "%", status: avgUtilization >= 60 ? "optimal" : "understaffed", trend: avgUtilization >= 60 ? "+5% vs 7D" : "-8% vs 7D" },
    { label: "Avg Turnover", value: avgTurnover, unit: "/hr", status: "optimal", trend: "+12% vs 7D" },
    { label: "Queue SLA Compliance", value: slaCompliance, unit: "%", status: slaCompliance >= 85 ? "optimal" : "understaffed", trend: slaCompliance >= 85 ? "+3% vs 7D" : "-15% vs 7D" },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {kpis.map((kpi) => (
        <div key={kpi.label} className="bg-white border border-neutral-200 rounded-md p-4 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between mb-2">
            <h3 className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{kpi.label}</h3>
            <div className={cn(
              "text-[8px] font-bold uppercase px-1.5 py-0.5 rounded",
              kpi.status === "optimal" && "bg-[#E5FFF9] text-[#00775B]",
              kpi.status === "understaffed" && "bg-[#FEEFE7] text-[#EA580C]",
              kpi.status === "neutral" && "bg-neutral-100 text-neutral-600"
            )}>
              {kpi.status === "optimal" ? "Optimal" : kpi.status === "understaffed" ? "At Risk" : "Active"}
            </div>
          </div>
          <div className="flex items-baseline gap-1.5 mb-1">
            <span className="text-3xl font-mono font-bold text-neutral-900">{kpi.value}</span>
            <span className="text-sm font-mono text-neutral-500">{kpi.unit}</span>
          </div>
          <div className="text-[9px] font-mono font-medium text-neutral-400">{kpi.trend}</div>
        </div>
      ))}
    </div>
  );
};

// Zone Efficiency Table with App-Specific Columns
const ZoneEfficiencyTable = ({ 
  onZoneClick,
  appFilter = "all" 
}: { 
  onZoneClick: (zone: ZoneCardType) => void;
  appFilter?: AppCategory;
}) => {
  const getStaffingStatus = (zone: ZoneCardType) => {
    if (zone.occupancy > 85 && zone.queueLength > 10) return "Understaffed";
    if (zone.occupancy < 40) return "Over-resourced";
    return "Optimal";
  };

  const getSLACompliance = (zone: ZoneCardType) => {
    if (zone.queueLength === 0) return 100;
    const waitMins = parseInt(zone.dwellTime.split('m')[0]);
    return waitMins <= 5 ? 95 : waitMins <= 8 ? 75 : 45;
  };

  const getDetectionFrequency = (zone: ZoneCardType) => {
    // For intrusion/security zones
    return zone.status === "critical" || zone.status === "violation" ? "High" : "Low";
  };

  const getActionRecommendation = (zone: ZoneCardType) => {
    const staffingStatus = getStaffingStatus(zone);
    const slaCompliance = getSLACompliance(zone);
    const category = getZoneCategory(zone.app);

    if (staffingStatus === "Understaffed" && slaCompliance < 75) {
      return { type: "schedule", label: "Export Schedule", color: "text-[#EA580C]" };
    }
    if (category === "intrusion" && (zone.status === "critical" || zone.status === "violation")) {
      return { type: "security", label: "Review Security", color: "text-[#E7000B]" };
    }
    if (staffingStatus === "Over-resourced") {
      return { type: "optimize", label: "Optimize Resources", color: "text-[#E19A04]" };
    }
    return { type: "view", label: "View Details", color: "text-[#00775B]" };
  };

  // Filter zones by app category
  const filteredZones = appFilter === "all" 
    ? ZONE_CARDS 
    : ZONE_CARDS.filter(zone => getZoneCategory(zone.app) === appFilter);

  // Determine which columns to show based on app filter
  const showStaffingColumn = appFilter === "all" || appFilter === "queue" || appFilter === "mustering";
  const showSLAColumn = appFilter === "all" || appFilter === "queue";
  const showDetectionColumn = appFilter === "intrusion";
  const showAvgWaitColumn = appFilter === "queue";

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm overflow-hidden">
      <div className="px-4 py-3 border-b border-neutral-200 bg-neutral-50 flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Zone Performance Matrix</h3>
          <p className="text-[9px] text-neutral-500 mt-0.5 font-mono">
            {appFilter === "all" && "All applications • Staffing & SLA focused"}
            {appFilter === "queue" && "Queue Management • Wait time & SLA optimized"}
            {appFilter === "intrusion" && "Security Zones • Detection frequency focused"}
            {appFilter !== "all" && appFilter !== "queue" && appFilter !== "intrusion" && `${APP_FILTERS.find(f => f.id === appFilter)?.label} • Application-specific metrics`}
          </p>
        </div>
        <div className="text-[9px] font-mono text-neutral-500">
          Showing <span className="font-bold text-neutral-700">{filteredZones.length}</span> zones
        </div>
      </div>
      <div className="overflow-x-auto">
        {(() => {
          const columns: DataGridColumn<ZoneCardType>[] = [
            {
              key: "zoneName",
              header: "Zone Name",
              width: "2fr",
              render: (row, h) => (
                <div className="flex flex-col">
                  <MonoCell hovered={h} isPrimary>{row.zoneName}</MonoCell>
                  <InterCell hovered={h} fontSize={9} color="#94A3B8">{row.app}</InterCell>
                </div>
              ),
            },
            {
              key: "dwellTime",
              header: showAvgWaitColumn ? "Avg Wait Time" : "Avg Dwell Time",
              width: "100px",
              render: (row, h) => <MonoCell hovered={h} color="#0F172A">{row.dwellTime}</MonoCell>,
            },
            {
              key: "maxCapacity",
              header: "Peak Count",
              width: "80px",
              align: "right",
              render: (row, h) => <MonoCell hovered={h}>{String(row.maxCapacity)}</MonoCell>,
            },
          ];

          if (showStaffingColumn) {
            columns.push({
              key: "staffing",
              header: "Staffing Status",
              width: "120px",
              render: (row) => {
                const s = getStaffingStatus(row);
                return <StatusCapsule status={s === "Optimal" ? "stable" : s === "Understaffed" ? "critical" : "warning"} label={s} />;
              },
            });
          }
          if (showDetectionColumn) {
            columns.push({
              key: "detection",
              header: "Detection Freq",
              width: "110px",
              render: (row) => {
                const d = getDetectionFrequency(row);
                return <StatusCapsule status={d === "High" ? "critical" : "stable"} label={d} />;
              },
            });
          }
          if (showSLAColumn) {
            columns.push({
              key: "sla",
              header: "SLA Compliance",
              width: "130px",
              render: (row, h) => {
                const sla = getSLACompliance(row);
                return (
                  <div className="flex items-center gap-2">
                    <MonoCell hovered={h}>{`${sla}%`}</MonoCell>
                    <div className="flex-1 max-w-[60px] bg-neutral-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={sla >= 90 ? "h-full bg-[#00A63E]" : sla >= 75 ? "h-full bg-[#EA580C]" : "h-full bg-[#E7000B]"}
                        style={{ width: `${sla}%` }}
                      />
                    </div>
                  </div>
                );
              },
            });
          }
          columns.push({
            key: "sparkline",
            header: "7-Day Trend",
            width: "90px",
            render: (row) => (
              <div className="w-20 h-8">
                <ResponsiveContainer width="100%" height={32} minHeight={32}>
                  <LineChart data={row.sparklineData.map((v, i) => ({ index: i, value: v }))} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    <Line type="monotone" dataKey="value" stroke="#00775B" strokeWidth={1.5} dot={false} isAnimationActive={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ),
          });
          columns.push({
            key: "action",
            header: "Action",
            width: "130px",
            render: (row) => {
              const actionRec = getActionRecommendation(row);
              return (
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); onZoneClick(row); }}
                    className={cn("text-[9px] font-bold uppercase hover:underline transition-colors", actionRec.color)}
                  >
                    {actionRec.label}
                  </button>
                  {actionRec.type === "schedule" && (
                    <span className="text-[8px] px-1.5 py-0.5 bg-[#FEEFE7] text-[#EA580C] rounded font-bold">⚠️</span>
                  )}
                  {actionRec.type === "security" && (
                    <span className="text-[8px] px-1.5 py-0.5 bg-[#FFE5E7] text-[#E7000B] rounded font-bold">🚨</span>
                  )}
                </div>
              );
            },
          });

          return (
            <DataGrid
              columns={columns}
              data={filteredZones}
              onRowClick={onZoneClick}
              compact
            />
          );
        })()}
      </div>
      
      {/* Action Summary Footer */}
      {filteredZones.some(z => {
        const rec = getActionRecommendation(z);
        return rec.type === "schedule" || rec.type === "security";
      }) && (
        <div className="px-4 py-3 bg-[#FFF7E6] border-t border-[#E19A04]/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-4 h-4 text-[#EA580C] shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-[10px] font-bold uppercase tracking-wider text-neutral-700 mb-1">
                Recommended Actions
              </h4>
              <div className="space-y-1">
                {filteredZones.filter(z => getActionRecommendation(z).type === "schedule").length > 0 && (
                  <p className="text-[9px] text-neutral-600">
                    <span className="font-bold text-[#EA580C]">
                      {filteredZones.filter(z => getActionRecommendation(z).type === "schedule").length} zones
                    </span> require staffing optimization. Consider exporting a revised schedule.
                  </p>
                )}
                {filteredZones.filter(z => getActionRecommendation(z).type === "security").length > 0 && (
                  <p className="text-[9px] text-neutral-600">
                    <span className="font-bold text-[#E7000B]">
                      {filteredZones.filter(z => getActionRecommendation(z).type === "security").length} security zones
                    </span> show high detection frequency. Review coverage and protocols.
                  </p>
                )}
              </div>
            </div>
            <button className="px-3 py-1.5 bg-neutral-900 hover:bg-neutral-800 text-white text-[9px] font-bold uppercase rounded transition-colors">
              Export Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Weekly Hotspot Heatmap (7x24 grid)
const WeeklyHotspotHeatmap = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Generate mock density data
  const generateDensityData = () => {
    return days.map((day, dayIndex) => 
      hours.map((hour) => {
        // Simulate peak hours (9-17) and weekday patterns
        const isWeekday = dayIndex < 5;
        const isPeakHour = hour >= 9 && hour <= 17;
        const baseValue = isWeekday && isPeakHour ? 60 + Math.random() * 30 : Math.random() * 40;
        return Math.round(baseValue);
      })
    );
  };

  const densityData = generateDensityData();

  const getDensityColor = (value: number) => {
    if (value >= 80) return "#EF4444"; // Hot - Red
    if (value >= 60) return "#F59E0B"; // Warm - Amber
    if (value >= 40) return "#00956D"; // Normal - Primary Light
    return "#E5E7EB"; // Cold - Neutral
  };

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Calendar className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Weekly Hotspot Heatmap</h3>
        <span className="text-[9px] text-neutral-400 font-mono">(Accumulated Density - 7D x 24H)</span>
      </div>

      <div className="overflow-x-auto">
        <div className="inline-block min-w-full">
          {/* Hour labels */}
          <div className="flex mb-1">
            <div className="w-12" /> {/* Day label spacer */}
            {hours.map((hour) => (
              <div key={hour} className="w-6 text-center">
                {hour % 3 === 0 && <span className="text-[8px] font-mono text-neutral-400">{hour}</span>}
              </div>
            ))}
          </div>

          {/* Heatmap grid */}
          {days.map((day, dayIndex) => (
            <div key={day} className="flex items-center mb-1">
              <div className="w-12 text-[9px] font-bold text-neutral-600 uppercase">{day}</div>
              <div className="flex gap-0.5">
                {densityData[dayIndex].map((value, hourIndex) => (
                  <div
                    key={hourIndex}
                    className="w-6 h-4 rounded-sm cursor-pointer hover:ring-2 hover:ring-[#00775B] transition-all group relative"
                    style={{ backgroundColor: getDensityColor(value) }}
                    title={`${day} ${hourIndex}:00 - Density: ${value}%`}
                  >
                    {/* Tooltip on hover */}
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block bg-neutral-900 text-white text-[8px] font-mono px-2 py-1 rounded whitespace-nowrap z-10">
                      {day} {hourIndex}:00<br />{value}% density
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Legend */}
          <div className="flex items-center gap-4 mt-4 pt-3 border-t border-neutral-200">
            <span className="text-[9px] font-bold uppercase text-neutral-500 tracking-wider">Density:</span>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#E5E7EB]" />
                <span className="text-[9px] text-neutral-600">Low (&lt;40%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#00956D]" />
                <span className="text-[9px] text-neutral-600">Normal (40-60%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#F59E0B]" />
                <span className="text-[9px] text-neutral-600">Warm (60-80%)</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-4 h-4 rounded-sm bg-[#EF4444]" />
                <span className="text-[9px] text-neutral-600">Hot (&gt;80%)</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// SLA Breach Trend Chart
const SLABreachTrend = () => {
  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const breachData = days.map((day, i) => ({
    day,
    breaches: Math.floor(Math.random() * 15) + (i === 1 ? 20 : 5), // Tuesday spike
    color: i === 1 ? "#EF4444" : "#F59E0B"
  }));

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <AlertTriangle className="w-4 h-4 text-amber-500" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">SLA Breach Frequency (7D)</h3>
      </div>

      <div className="h-48">
        <ResponsiveContainer width="100%" height={192} minHeight={192}>
          <BarChart data={breachData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <XAxis 
              dataKey="day" 
              tick={{ fontSize: 10, fill: "#737373" }} 
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <YAxis 
              tick={{ fontSize: 10, fill: "#737373", fontFamily: "Geist Mono, monospace" }} 
              tickLine={false}
              axisLine={{ stroke: "#E5E7EB" }}
            />
            <RechartsTooltip 
              contentStyle={{ 
                backgroundColor: "#1F2937", 
                border: "none", 
                borderRadius: "4px", 
                fontSize: "10px",
                fontFamily: "Geist Mono, monospace"
              }}
              labelStyle={{ color: "#F9FAFB", fontWeight: "bold" }}
              itemStyle={{ color: "#F9FAFB" }}
            />
            <Bar dataKey="breaches" radius={[4, 4, 0, 0]}>
              {breachData.map((entry) => (
                <Cell key={`breach-${entry.day}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-200 text-[9px] text-neutral-500">
        <span className="font-bold">Insight:</span> Tuesday shows 2.5x higher breach rate. Consider additional staffing for 10AM-2PM shift block.
      </div>
    </div>
  );
};

// Dwell Time Distribution
const DwellTimeDistribution = () => {
  const distributionData = [
    { name: "<5 min", value: 35, color: "#00956D" },
    { name: "5-15 min", value: 40, color: "#60A5FA" },
    { name: "15-30 min", value: 18, color: "#F59E0B" },
    { name: ">30 min", value: 7, color: "#EF4444" },
  ];

  return (
    <div className="bg-white border border-neutral-200 rounded-md shadow-sm p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="w-4 h-4 text-[#00775B]" />
        <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-700">Dwell Time Distribution</h3>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="h-40 flex items-center justify-center">
          <ResponsiveContainer width="100%" height={160} minHeight={160}>
            <RechartsPieChart>
              <Pie
                data={distributionData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={60}
                paddingAngle={2}
                dataKey="value"
              >
                {distributionData.map((entry) => (
                  <Cell key={`dwell-${entry.name}`} fill={entry.color} />
                ))}
              </Pie>
              <RechartsTooltip 
                contentStyle={{ 
                  backgroundColor: "#1F2937", 
                  border: "none", 
                  borderRadius: "4px", 
                  fontSize: "10px",
                  fontFamily: "Geist Mono, monospace"
                }}
                itemStyle={{ color: "#F9FAFB" }}
              />
            </RechartsPieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend */}
        <div className="flex flex-col justify-center space-y-2">
          {distributionData.map((item) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded" style={{ backgroundColor: item.color }} />
                <span className="text-[10px] font-medium text-neutral-600">{item.name}</span>
              </div>
              <span className="text-xs font-mono font-bold text-neutral-900">{item.value}%</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-neutral-200 text-[9px] text-neutral-500">
        <span className="font-bold">Note:</span> 25% of visitors exceed 15 min dwell time, indicating potential loitering or engagement opportunities.
      </div>
    </div>
  );
};

export const ZoneAnalytics = ({ persona }: { persona: Persona }) => {
  const [selectedZone, setSelectedZone] = useState<ZoneCardType | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [appFilter, setAppFilter] = useState<AppCategory>("all");
  const [selectedZoneIds, setSelectedZoneIds] = useState<Set<string>>(new Set());
  const [highlightedZoneId, setHighlightedZoneId] = useState<string | null>(null);
  const zoneRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const handleZoneClick = (zone: ZoneCardType) => {
    setSelectedZone(zone);
    setModalOpen(true);
    
    // Highlight and scroll to zone card when clicked from map
    setHighlightedZoneId(zone.id);
    setTimeout(() => {
      const element = zoneRefs.current.get(zone.id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 100);
    
    // Clear highlight after 3 seconds
    setTimeout(() => {
      setHighlightedZoneId(null);
    }, 3000);
  };

  const handleZoneToggle = (zoneId: string) => {
    const newSet = new Set(selectedZoneIds);
    if (newSet.has(zoneId)) {
      newSet.delete(zoneId);
    } else {
      newSet.add(zoneId);
    }
    setSelectedZoneIds(newSet);
  };

  const handleClearZones = () => {
    setSelectedZoneIds(new Set());
  };

  // Filter zones by app category
  let filteredZones = appFilter === "all" 
    ? ZONE_CARDS 
    : ZONE_CARDS.filter(zone => getZoneCategory(zone.app) === appFilter);

  // Further filter by selected zone IDs
  if (selectedZoneIds.size > 0) {
    filteredZones = filteredZones.filter(zone => selectedZoneIds.has(zone.id));
  }

  // Sort: ALWAYS show high-priority alerts (critical/violation) first, regardless of filters
  // Priority order: Critical → Violation → Stagnant → Safe
  const sortedZones = [...filteredZones].sort((a, b) => {
    // Define priority mapping (lower number = higher priority = appears first)
    const statusPriority: Record<ZoneStatus, number> = { 
      critical: 0, 
      violation: 1, 
      stagnant: 2, 
      safe: 3 
    };
    
    // Get priorities (ensure critical is always 0)
    const priorityA = statusPriority[a.status] ?? 99;
    const priorityB = statusPriority[b.status] ?? 99;
    
    // Sort by status priority first (critical zones MUST appear first)
    if (priorityA !== priorityB) {
      return priorityA - priorityB; // Ascending: 0 (critical) comes before 1 (violation), etc.
    }
    
    // Within same status, pinned items come first
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    
    // Finally, sort by occupancy (higher occupancy first)
    return b.occupancy - a.occupancy;
  });

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader 
        title="Zone Analytics" 
        icon={MapPin} 
        defaultGranularity={persona === "manager" ? "1w" : "1d"}
      />

      {/* Live Violations Ticker */}
      {persona === "monitoring" && <ZoneViolationsTicker />}

      {/* Monitoring Staff: Risk Grid View */}
      {persona === "monitoring" && (
        <div className="space-y-4">
          {/* Level 1: Global Triage - Floor Plan Map (Left) + At-Risk Zones Sidebar (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2">
              <LiveZoneOccupancyMap 
                onZoneClick={handleZoneClick} 
                highlightedZone={highlightedZoneId}
              />
            </div>
            <div>
              <AtRiskZonesSidebar onViewCamera={handleZoneClick} />
            </div>
          </div>

          {/* Level 2: Filter Logic Bridge - App & Zone Filters */}
          <AppFilterBar 
            selectedFilter={appFilter} 
            onFilterChange={setAppFilter}
            selectedZones={selectedZoneIds}
            onZoneToggle={handleZoneToggle}
            onClearZones={handleClearZones}
          />

          {/* Level 3: Action Matrix - Adaptive Zone Cards */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-neutral-700 uppercase tracking-wider">
                {appFilter === "all" && selectedZoneIds.size === 0 && "All Zones Matrix"}
                {appFilter !== "all" && selectedZoneIds.size === 0 && `${APP_FILTERS.find(f => f.id === appFilter)?.label} Zones`}
                {selectedZoneIds.size > 0 && appFilter === "all" && `${selectedZoneIds.size} Selected Zone${selectedZoneIds.size > 1 ? 's' : ''}`}
                {selectedZoneIds.size > 0 && appFilter !== "all" && `${selectedZoneIds.size} ${APP_FILTERS.find(f => f.id === appFilter)?.label} Zone${selectedZoneIds.size > 1 ? 's' : ''}`}
              </h3>
              <div className="text-[10px] font-mono text-neutral-500">
                Showing {sortedZones.length} of {ZONE_CARDS.length} zones
              </div>
            </div>
            
            {sortedZones.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {sortedZones.map((zone) => (
                  <AdaptiveZoneCard 
                    key={zone.id}
                    zone={zone}
                    onClick={() => handleZoneClick(zone)}
                    isHighlighted={highlightedZoneId === zone.id}
                    scrollRef={(el) => {
                      if (el) zoneRefs.current.set(zone.id, el);
                      else zoneRefs.current.delete(zone.id);
                    }}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-neutral-200 rounded-md p-8 text-center">
                <AlertTriangle className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                <p className="text-sm font-bold text-neutral-400">No zones match your filter criteria</p>
                <p className="text-xs text-neutral-400 mt-1">Try adjusting your application or zone filters</p>
              </div>
            )}
          </div>

          {/* Queue Management & Intrusion Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <QueueManagementPanel />
            <IntrusionAlertGrid />
          </div>
        </div>
      )}

      {/* Manager: Operational Efficiency View */}
      {persona === "manager" && (
        <div className="space-y-4">
          {/* KPI Cards with Live View Toggle */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <ManagerKPICards />
            </div>
            <button
              onClick={() => window.location.reload()} // In real app, this would switch persona to monitoring
              className="shrink-0 flex items-center gap-2 px-4 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-md transition-colors shadow-md border border-neutral-700"
            >
              <Activity className="w-4 h-4" />
              <div className="text-left">
                <div className="text-[10px] font-bold uppercase tracking-wider">Switch to</div>
                <div className="text-xs font-bold">Live Map View</div>
              </div>
            </button>
          </div>

          {/* Application Filter Bar */}
          <ManagerAppFilterBar 
            selectedFilter={appFilter}
            onFilterChange={setAppFilter}
          />

          {/* Zone Efficiency Table with App-Specific Columns */}
          <ZoneEfficiencyTable 
            onZoneClick={handleZoneClick}
            appFilter={appFilter}
          />

          {/* Strategic Visualizations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <WeeklyHotspotHeatmap />
            <SLABreachTrend />
          </div>

          {/* Pattern Detection */}
          <DwellTimeDistribution />
        </div>
      )}

      {/* Zone Detail Modal */}
      <ZoneDetailModal zone={selectedZone} open={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};