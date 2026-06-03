import { useState } from "react";
import {
  Search, X, ChevronUp, ChevronDown, ChevronLeft, ChevronRight,
  Plane, UtensilsCrossed, Building2, GraduationCap, Cross, ShoppingCart, HardHat, ShoppingBag,
  HeartPulse, Tag, Truck, BookOpen, Hotel, Factory, Briefcase,
  Camera, Users, Shield, BarChart2, Cpu, Eye, AlertTriangle, Car, Trash2, Flame,
  Star, TrendingUp, CalendarDays, ArrowRight, MapPin, Landmark, Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/app/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Types ─────────────────────────────────────────────────────────────────────

type Scenario = "Airport" | "Restaurant" | "Workplace" | "University" | "Hospital" | "Retail Store" | "Construction" | "Mall";
type Industry = "Healthcare" | "Retail" | "Transportation" | "Education" | "Hospitality" | "Construction" | "Manufacturing" | "Corporate";
type Category = "Most Common" | "Infrastructure" | "Safety & Compliance" | "Operations & Analytics";

type App = {
  id: string;
  name: string;
  description: string;
  badge: string;
  tags: string[];
  scenarios: Scenario[];
  industries: Industry[];
  categories: Category[];
  featured?: boolean;
  color: string;
  iconBg: string;
  Icon: React.ComponentType<{ className?: string }>;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const APPS: App[] = [
  {
    id: "a-001",
    name: "PEOPLE COUNTING AT ENTRY/EXIT",
    description: "Real-time counting and tracking of people entering and exiting airport terminals",
    badge: "OPTIMIZE STAFFING LEVELS",
    tags: ["COMMON", "AIRPORT"],
    scenarios: ["Airport", "Mall", "Hospital"],
    industries: ["Transportation", "Healthcare", "Retail"],
    categories: ["Most Common"],
    featured: true,
    color: "#1e3a2f",
    iconBg: "#2d5a42",
    Icon: Users,
  },
  {
    id: "a-002",
    name: "BAGGAGE DETECTION & TRACKING",
    description: "Automated detection and tracking of unattended baggage in restricted areas",
    badge: "LOWER LIABILITY CLAIMS",
    tags: ["SAFETY", "AIRPORT"],
    scenarios: ["Airport"],
    industries: ["Transportation"],
    categories: ["Safety & Compliance"],
    featured: true,
    color: "#2d1f0e",
    iconBg: "#5a3c1a",
    Icon: AlertTriangle,
  },
  {
    id: "a-003",
    name: "QUEUE LENGTH MONITORING",
    description: "Monitor and optimize queue lengths at security checkpoints and check-in counters",
    badge: "MINIMIZE WAIT TIMES",
    tags: ["OPERATIONS", "AIRPORT"],
    scenarios: ["Airport", "Hospital", "Retail Store"],
    industries: ["Transportation", "Healthcare", "Retail"],
    categories: ["Operations & Analytics"],
    featured: true,
    color: "#0c2340",
    iconBg: "#1a3d6b",
    Icon: BarChart2,
  },
  {
    id: "a-004",
    name: "PERIMETER INTRUSION DETECTION",
    description: "Detect unauthorized access along perimeter fences and restricted zones",
    badge: "REDUCE SECURITY RISK",
    tags: ["INFRASTRUCTURE", "AIRPORT"],
    scenarios: ["Airport", "Construction", "Workplace"],
    industries: ["Transportation", "Manufacturing", "Corporate"],
    categories: ["Infrastructure"],
    featured: true,
    color: "#0a2420",
    iconBg: "#12463e",
    Icon: Shield,
  },
  {
    id: "a-005",
    name: "CUSTOMER COUNTING & HEATMAP",
    description: "Track customer foot traffic and generate heat maps for store layout optimization",
    badge: "IDENTIFY HIGH-VALUE ZONES",
    tags: ["COMMON", "RETAIL STORE"],
    scenarios: ["Retail Store", "Mall", "Restaurant"],
    industries: ["Retail", "Hospitality"],
    categories: ["Most Common", "Operations & Analytics"],
    featured: true,
    color: "#1a1a2e",
    iconBg: "#2d2d5a",
    Icon: Eye,
  },
  {
    id: "a-006",
    name: "CUSTOMER FLOW ANALYSIS",
    description: "Track customer movement patterns to optimize table layouts and service efficiency",
    badge: "INCREASE CAPTURE RATE",
    tags: ["COMMON", "RESTAURANT"],
    scenarios: ["Restaurant", "Retail Store", "Mall"],
    industries: ["Hospitality", "Retail"],
    categories: ["Most Common"],
    color: "#1e2a1e",
    iconBg: "#2d452d",
    Icon: Users,
  },
  {
    id: "a-007",
    name: "OCCUPANCY DETECTION",
    description: "Monitor real-time office occupancy to optimize space utilization and energy usage",
    badge: "MAXIMIZE SPACE UTILITY",
    tags: ["COMMON", "WORKPLACE"],
    scenarios: ["Workplace", "Hospital", "University"],
    industries: ["Corporate", "Healthcare", "Education"],
    categories: ["Most Common"],
    color: "#1a1420",
    iconBg: "#2d2040",
    Icon: Building2,
  },
  {
    id: "a-008",
    name: "PPE COMPLIANCE DETECTION",
    description: "Detect and alert when workers are not wearing required personal protective equipment",
    badge: "ENSURE SITE SAFETY",
    tags: ["COMMON", "CONSTRUCTION"],
    scenarios: ["Construction", "Workplace"],
    industries: ["Construction", "Manufacturing"],
    categories: ["Most Common", "Safety & Compliance"],
    color: "#2a1a08",
    iconBg: "#5a3810",
    Icon: HardHat,
  },
  {
    id: "a-009",
    name: "SMART PARKING MANAGEMENT",
    description: "Automated parking spot detection and guidance system",
    badge: "MAINTAIN TRAFFIC FLOW",
    tags: ["INFRASTRUCTURE", "MALL"],
    scenarios: ["Mall", "Airport", "Workplace"],
    industries: ["Retail", "Transportation", "Corporate"],
    categories: ["Infrastructure"],
    color: "#0f1f2a",
    iconBg: "#1a3545",
    Icon: Car,
  },
  {
    id: "a-010",
    name: "VEHICLE LICENSE PLATE RECOGNITION",
    description: "Automatic number plate recognition for access control",
    badge: "AUTOMATE GATE ENTRY",
    tags: ["INFRASTRUCTURE", "WORKPLACE"],
    scenarios: ["Workplace", "Airport", "Hospital"],
    industries: ["Corporate", "Transportation", "Healthcare"],
    categories: ["Infrastructure"],
    color: "#1f1a0a",
    iconBg: "#3d3318",
    Icon: Car,
  },
  {
    id: "a-011",
    name: "WASTE MANAGEMENT MONITORING",
    description: "Monitor waste bin levels to optimize collection schedules",
    badge: "ENHANCE SERVICE EFFICIENCY",
    tags: ["INFRASTRUCTURE", "UNIVERSITY"],
    scenarios: ["University", "Mall", "Hospital"],
    industries: ["Education", "Healthcare"],
    categories: ["Infrastructure"],
    color: "#0a2010",
    iconBg: "#143d20",
    Icon: Trash2,
  },
  {
    id: "a-012",
    name: "FIRE & SMOKE DETECTION",
    description: "Early detection of fire and smoke to trigger automatic alerts and emergency protocols",
    badge: "PREVENT FIRE HAZARDS",
    tags: ["SAFETY", "CONSTRUCTION"],
    scenarios: ["Construction", "Workplace", "Hospital"],
    industries: ["Construction", "Healthcare", "Manufacturing"],
    categories: ["Safety & Compliance"],
    color: "#2a0a0a",
    iconBg: "#5a1515",
    Icon: Flame,
  },
  {
    id: "a-013",
    name: "CROWD DENSITY ANALYTICS",
    description: "Monitor crowd density and alert security when thresholds are exceeded",
    badge: "PREVENT OVERCROWDING",
    tags: ["SAFETY", "MALL"],
    scenarios: ["Mall", "Airport", "University"],
    industries: ["Retail", "Transportation", "Education"],
    categories: ["Safety & Compliance"],
    color: "#1a0a2a",
    iconBg: "#320f50",
    Icon: Users,
  },
  {
    id: "a-014",
    name: "SLIP & FALL DETECTION",
    description: "Detect slip and fall incidents in real-time and immediately notify safety personnel",
    badge: "REDUCE INCIDENT LIABILITY",
    tags: ["SAFETY", "HOSPITAL"],
    scenarios: ["Hospital", "Workplace", "Restaurant"],
    industries: ["Healthcare", "Corporate", "Hospitality"],
    categories: ["Safety & Compliance"],
    color: "#0a1a2a",
    iconBg: "#132d45",
    Icon: AlertTriangle,
  },
  {
    id: "a-015",
    name: "SHELF STOCK MONITORING",
    description: "Automatically detect empty shelves and trigger restocking workflows",
    badge: "MINIMIZE OUT-OF-STOCK",
    tags: ["OPERATIONS", "RETAIL STORE"],
    scenarios: ["Retail Store", "Mall"],
    industries: ["Retail"],
    categories: ["Operations & Analytics"],
    color: "#1a200a",
    iconBg: "#2d3a10",
    Icon: BarChart2,
  },
  {
    id: "a-016",
    name: "PATIENT FLOW OPTIMIZATION",
    description: "Track patient movement and wait times across hospital departments",
    badge: "REDUCE PATIENT WAIT TIME",
    tags: ["OPERATIONS", "HOSPITAL"],
    scenarios: ["Hospital"],
    industries: ["Healthcare"],
    categories: ["Operations & Analytics"],
    color: "#0a1a20",
    iconBg: "#12303d",
    Icon: HeartPulse,
  },
  {
    id: "a-017",
    name: "ASSET TRACKING",
    description: "Track movement and location of valuable equipment across facilities in real-time",
    badge: "REDUCE ASSET LOSS",
    tags: ["OPERATIONS", "WORKPLACE"],
    scenarios: ["Workplace", "Hospital", "University"],
    industries: ["Corporate", "Healthcare", "Education"],
    categories: ["Operations & Analytics"],
    color: "#201a10",
    iconBg: "#40351e",
    Icon: Cpu,
  },
  {
    id: "a-018",
    name: "DELIVERY ZONE MONITORING",
    description: "Monitor loading docks and delivery zones to streamline logistics operations",
    badge: "STREAMLINE LOGISTICS",
    tags: ["OPERATIONS", "CONSTRUCTION"],
    scenarios: ["Construction", "Workplace", "Hospital"],
    industries: ["Manufacturing", "Corporate", "Transportation"],
    categories: ["Operations & Analytics"],
    color: "#102010",
    iconBg: "#1e3d1e",
    Icon: Truck,
  },
];

const SCENARIOS: { label: Scenario; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Airport",      Icon: Plane },
  { label: "Restaurant",   Icon: UtensilsCrossed },
  { label: "Workplace",    Icon: Building2 },
  { label: "University",   Icon: GraduationCap },
  { label: "Hospital",     Icon: Cross },
  { label: "Retail Store", Icon: ShoppingCart },
  { label: "Construction", Icon: HardHat },
  { label: "Mall",         Icon: ShoppingBag },
];

const INDUSTRIES: { label: Industry; Icon: React.ComponentType<{ className?: string }> }[] = [
  { label: "Healthcare",    Icon: HeartPulse },
  { label: "Retail",        Icon: Tag },
  { label: "Transportation",Icon: Truck },
  { label: "Education",     Icon: BookOpen },
  { label: "Hospitality",   Icon: Hotel },
  { label: "Construction",  Icon: HardHat },
  { label: "Manufacturing", Icon: Factory },
  { label: "Corporate",     Icon: Briefcase },
];

const APP_CATEGORIES: Category[] = ["Most Common", "Infrastructure", "Safety & Compliance", "Operations & Analytics"];

const CATEGORY_COUNTS: Record<Category, number> = {
  "Most Common":          APPS.filter(a => a.categories.includes("Most Common")).length,
  "Infrastructure":       APPS.filter(a => a.categories.includes("Infrastructure")).length,
  "Safety & Compliance":  APPS.filter(a => a.categories.includes("Safety & Compliance")).length,
  "Operations & Analytics": APPS.filter(a => a.categories.includes("Operations & Analytics")).length,
};

// ─── Primitives ────────────────────────────────────────────────────────────────

function FilterChip<T extends string>({
  label, Icon, active, onClick,
}: {
  label: T;
  Icon: React.ComponentType<{ className?: string }>;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-3 h-8 rounded-[4px] border text-[11px] font-semibold whitespace-nowrap transition-all",
        active
          ? "bg-[#00775B] border-[#00775B] text-white"
          : "bg-white border-neutral-200 text-neutral-600 hover:border-[#00775B]/50 hover:text-[#00775B]"
      )}
    >
      <Icon className="w-3 h-3 shrink-0" />
      {label}
    </button>
  );
}

// ─── App detail data ──────────────────────────────────────────────────────────

type AppDetail = {
  outcome: string;
  outcomeHighlight: string;
  decisions: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }[];
  keyDrivers: string[];
  // Chart
  chartTitle: string;
  chartSubtitle: string;
  chartBarA: string;
  chartBarB: string;
  chartData: { name: string; inbound: number; outbound: number }[];
  chartLimit: number;
  limitLabel: string;
  // Metrics
  metric1Label: string;
  metric1Value: string;
  metric1Delta: string;
  metric1Up: boolean;
  metric2Label: string;
  metric2Value: string;
  metric2Status: string;
  metric2Ok: boolean;
};

const APP_DETAILS: Record<string, AppDetail> = {
  "a-001": {
    outcome: "Eliminate 28% of staffing overhead via automated flow alerts and predictive scheduling.",
    outcomeHighlight: "28% of staffing overhead",
    decisions: [
      { icon: Users,        title: "Staffing optimisation",        subtitle: "based on real-time dwell times" },
      { icon: AlertTriangle,title: "Automated SLA breach alerts",  subtitle: "for queue management" },
      { icon: TrendingUp,   title: "Spatial ROI analysis",         subtitle: "for high-traffic zones" },
    ],
    keyDrivers: ["Occupancy ROI", "SLA Compliance", "Labor Optimisation"],
    chartTitle: "Entrance Traffic", chartSubtitle: "Inbound vs Outbound",
    chartBarA: "Inbound", chartBarB: "Outbound",
    chartData: [
      { name: "Ent A", inbound: 312, outbound: 198 },
      { name: "Ent B", inbound: 145, outbound: 167 },
      { name: "Ent C", inbound: 278, outbound: 134 },
    ],
    chartLimit: 280, limitLabel: "Capacity Limit",
    metric1Label: "Total Traffic",    metric1Value: "12.4k", metric1Delta: "+8%",   metric1Up: true,
    metric2Label: "Avg Dwell Time",   metric2Value: "4m 12s", metric2Status: "OK",  metric2Ok: true,
  },
  "a-002": {
    outcome: "Cut false-positive security alerts by 42%, reducing screening delays at peak hours.",
    outcomeHighlight: "false-positive security alerts by 42%",
    decisions: [
      { icon: Shield,       title: "Automated threat flagging",    subtitle: "with confidence scoring" },
      { icon: AlertTriangle,title: "Real-time staff alerts",       subtitle: "for flagged items and anomalies" },
      { icon: BarChart2,    title: "Threat pattern analytics",     subtitle: "for security team reporting" },
    ],
    keyDrivers: ["Threat Detection Rate", "False Positive Rate", "Screening Throughput"],
    chartTitle: "Baggage Screening", chartSubtitle: "Cleared vs Flagged (hourly)",
    chartBarA: "Cleared", chartBarB: "Flagged",
    chartData: [
      { name: "08:00", inbound: 320, outbound: 18 },
      { name: "10:00", inbound: 415, outbound: 31 },
      { name: "12:00", inbound: 290, outbound: 12 },
    ],
    chartLimit: 400, limitLabel: "Capacity Limit",
    metric1Label: "Bags Screened",    metric1Value: "1.02k", metric1Delta: "+14%",  metric1Up: true,
    metric2Label: "Avg Screen Time",  metric2Value: "8.3s",  metric2Status: "OK",   metric2Ok: true,
  },
  "a-003": {
    outcome: "Reduce checkout wait times by 35% and improve peak-hour staffing accuracy.",
    outcomeHighlight: "Reduce checkout wait times by 35%",
    decisions: [
      { icon: Users,      title: "Queue length forecasting",      subtitle: "up to 15 minutes ahead" },
      { icon: BarChart2,  title: "Peak-hour staffing alerts",     subtitle: "based on entry flow patterns" },
      { icon: TrendingUp, title: "Daily traffic heatmaps",        subtitle: "for layout optimisation" },
    ],
    keyDrivers: ["Queue Analytics", "Footfall Trends", "Dwell Time"],
    chartTitle: "Zone Traffic", chartSubtitle: "Count vs Exits by Zone",
    chartBarA: "Entries", chartBarB: "Exits",
    chartData: [
      { name: "Zone A", inbound: 420, outbound: 380 },
      { name: "Zone B", inbound: 210, outbound: 195 },
      { name: "Zone C", inbound: 310, outbound: 290 },
    ],
    chartLimit: 350, limitLabel: "Zone Capacity",
    metric1Label: "Daily Footfall",   metric1Value: "18.2k", metric1Delta: "+12%",  metric1Up: true,
    metric2Label: "Avg Wait Time",    metric2Value: "2m 48s", metric2Status: "OK",  metric2Ok: true,
  },
  "a-004": {
    outcome: "Automate 95% of gate operations, eliminating manual verification bottlenecks.",
    outcomeHighlight: "95% of gate operations",
    decisions: [
      { icon: Car,        title: "Automatic access control",      subtitle: "whitelist & blacklist matching" },
      { icon: Shield,     title: "Blacklist breach alerts",       subtitle: "instant security notifications" },
      { icon: BarChart2,  title: "Vehicle movement logs",         subtitle: "for compliance and audits" },
    ],
    keyDrivers: ["Recognition Accuracy", "Gate Throughput", "Access Compliance"],
    chartTitle: "Gate Activity", chartSubtitle: "Approved vs Denied entries",
    chartBarA: "Approved", chartBarB: "Denied",
    chartData: [
      { name: "Gate 1", inbound: 284, outbound: 12 },
      { name: "Gate 2", inbound: 156, outbound: 8 },
      { name: "Gate 3", inbound: 310, outbound: 21 },
    ],
    chartLimit: 300, limitLabel: "Gate Capacity",
    metric1Label: "Vehicles Today",   metric1Value: "763",   metric1Delta: "+6%",   metric1Up: true,
    metric2Label: "Avg Read Time",    metric2Value: "0.8s",  metric2Status: "Fast", metric2Ok: true,
  },
  "a-005": {
    outcome: "Reduce proximity incidents by 60%, cutting near-miss reports across all warehouse zones.",
    outcomeHighlight: "proximity incidents by 60%",
    decisions: [
      { icon: AlertTriangle, title: "Zone intrusion alerts",       subtitle: "when workers enter forklift paths" },
      { icon: Shield,        title: "Incident heatmaps",           subtitle: "for risk zone identification" },
      { icon: BarChart2,     title: "Daily safety reports",        subtitle: "for compliance and insurance" },
    ],
    keyDrivers: ["Incident Rate", "Alert Response Time", "Zone Compliance"],
    chartTitle: "Proximity Events", chartSubtitle: "Warnings vs Incidents by shift",
    chartBarA: "Warnings", chartBarB: "Incidents",
    chartData: [
      { name: "Shift 1", inbound: 14, outbound: 2 },
      { name: "Shift 2", inbound: 22, outbound: 5 },
      { name: "Shift 3", inbound: 9,  outbound: 1 },
    ],
    chartLimit: 20, limitLabel: "Alert Threshold",
    metric1Label: "Alerts Today",     metric1Value: "45",    metric1Delta: "-18%",  metric1Up: false,
    metric2Label: "Incidents",        metric2Value: "8",     metric2Status: "High", metric2Ok: false,
  },
  "a-006": {
    outcome: "Eliminate 90% of out-of-stock incidents through automated shelf monitoring and alerts.",
    outcomeHighlight: "90% of out-of-stock incidents",
    decisions: [
      { icon: Eye,        title: "Real-time shelf depletion alerts", subtitle: "notifies staff before stock runs out" },
      { icon: BarChart2,  title: "Restock velocity tracking",        subtitle: "measures response time to alerts" },
      { icon: TrendingUp, title: "Product demand forecasting",       subtitle: "based on depletion patterns" },
    ],
    keyDrivers: ["Out-of-Stock Rate", "Restock Speed", "Shelf Compliance"],
    chartTitle: "Shelf Occupancy", chartSubtitle: "Stocked vs Empty slots by aisle",
    chartBarA: "Stocked", chartBarB: "Empty",
    chartData: [
      { name: "Aisle A", inbound: 48, outbound: 6 },
      { name: "Aisle B", inbound: 52, outbound: 2 },
      { name: "Aisle C", inbound: 39, outbound: 13 },
    ],
    chartLimit: 50, limitLabel: "Restock Threshold",
    metric1Label: "Shelves Monitored", metric1Value: "184",  metric1Delta: "+3",    metric1Up: true,
    metric2Label: "Empty Slots",       metric2Value: "21",   metric2Status: "Warn", metric2Ok: false,
  },
  "a-007": {
    outcome: "Detect fire and smoke 4× faster than traditional sensors, enabling faster evacuation.",
    outcomeHighlight: "4× faster than traditional sensors",
    decisions: [
      { icon: AlertTriangle, title: "Automatic alarm triggering",  subtitle: "integrated with PA and sprinkler systems" },
      { icon: Shield,        title: "Evacuation route analytics",  subtitle: "monitors exit crowd flow during alerts" },
      { icon: BarChart2,     title: "Incident timeline reports",   subtitle: "for insurance and compliance" },
    ],
    keyDrivers: ["Detection Latency", "False Alarm Rate", "Coverage Zones"],
    chartTitle: "Detection Events", chartSubtitle: "Smoke vs Flame detections by camera",
    chartBarA: "Smoke", chartBarB: "Flame",
    chartData: [
      { name: "Cam 01", inbound: 3, outbound: 1 },
      { name: "Cam 02", inbound: 0, outbound: 0 },
      { name: "Cam 03", inbound: 5, outbound: 2 },
    ],
    chartLimit: 4, limitLabel: "Alert Threshold",
    metric1Label: "Cameras Active",  metric1Value: "28",    metric1Delta: "100%",  metric1Up: true,
    metric2Label: "Avg Detect Time", metric2Value: "1.2s",  metric2Status: "Fast", metric2Ok: true,
  },
  "a-008": {
    outcome: "Reduce average customer wait time by 40% through AI-driven staffing and queue predictions.",
    outcomeHighlight: "Reduce average customer wait time by 40%",
    decisions: [
      { icon: Users,      title: "Dynamic lane staffing alerts",  subtitle: "open or close lanes based on queue length" },
      { icon: BarChart2,  title: "Wait time heatmaps",            subtitle: "identify chronic bottleneck periods" },
      { icon: TrendingUp, title: "Customer satisfaction scores",  subtitle: "correlated with wait time data" },
    ],
    keyDrivers: ["Queue Length", "Wait Time", "Staffing Efficiency"],
    chartTitle: "Queue Lengths", chartSubtitle: "Peak vs Off-peak by counter",
    chartBarA: "Peak", chartBarB: "Off-peak",
    chartData: [
      { name: "Counter 1", inbound: 18, outbound: 6 },
      { name: "Counter 2", inbound: 24, outbound: 9 },
      { name: "Counter 3", inbound: 11, outbound: 4 },
    ],
    chartLimit: 20, limitLabel: "SLA Limit",
    metric1Label: "Customers Today", metric1Value: "2.1k",  metric1Delta: "+9%",   metric1Up: true,
    metric2Label: "Avg Wait Time",   metric2Value: "3m 55s", metric2Status: "OK",  metric2Ok: true,
  },
};

// ─── App Detail Modal ─────────────────────────────────────────────────────────

function AppDetailModal({ app, onClose }: { app: App; onClose: () => void }) {
  const detail = APP_DETAILS[app.id] ?? APP_DETAILS["a-001"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-[10px] shadow-2xl w-full max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 overflow-hidden">

          {/* ── Left panel ─────────────────────────────────────────────────── */}
          <div className="w-[420px] shrink-0 flex flex-col bg-neutral-950 overflow-y-auto">

            {/* Vision stream */}
            <div className="relative h-[240px] shrink-0 overflow-hidden" style={{ backgroundColor: app.color }}>
              {/* grid */}
              <div className="absolute inset-0 opacity-10"
                style={{ backgroundImage: `radial-gradient(${TEAL}60 1px,transparent 1px)`, backgroundSize: "18px 18px" }} />
              {/* glow */}
              <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 50%, ${app.iconBg}99, transparent 70%)` }} />
              {/* centre icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: app.iconBg }}>
                  <app.Icon className="w-8 h-8 text-white/80" />
                </div>
              </div>
              {/* bounding box overlays */}
              <div className="absolute top-10 left-12 w-28 h-20 border-2 rounded-sm opacity-60" style={{ borderColor: "#00ff88" }}>
                <span className="absolute -top-4 left-0 text-[9px] font-bold text-[#00ff88]">Detection 97%</span>
              </div>
              <div className="absolute top-16 right-16 w-20 h-16 border-2 border-dashed rounded-sm opacity-50" style={{ borderColor: "#ffd166" }}>
                <span className="absolute -top-4 left-0 text-[9px] font-bold text-[#ffd166]">Track 94%</span>
              </div>
              {/* badge */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm rounded-full px-2.5 py-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00ff88] animate-pulse" />
                <span className="text-[9px] font-bold text-white tracking-widest uppercase">AI Vision Stream</span>
              </div>
            </div>

            {/* Chart */}
            <div className="p-4 border-b border-white/10">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">{detail.chartTitle}</p>
                  <p className="text-[9px] text-white/30 mt-0.5">{detail.chartSubtitle}</p>
                </div>
                {detail.chartData.some(d => d.inbound > detail.chartLimit) && (
                  <div className="flex items-center gap-1 text-[9px] font-bold text-red-400 bg-red-500/10 border border-red-500/20 rounded-full px-2 py-0.5">
                    <AlertTriangle className="w-2.5 h-2.5" /> Over Limit
                  </div>
                )}
              </div>
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={detail.chartData} barCategoryGap="30%" barGap={2}>
                  <CartesianGrid vertical={false} stroke="rgba(255,255,255,0.06)" />
                  <XAxis dataKey="name" tick={{ fill: "rgba(255,255,255,0.4)", fontSize: 9 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "rgba(255,255,255,0.3)", fontSize: 9 }} axisLine={false} tickLine={false} width={28} />
                  <ReferenceLine y={detail.chartLimit} stroke="#ef4444" strokeDasharray="4 3" strokeWidth={1.5} />
                  <Bar dataKey="inbound"  fill="#00775B" radius={[3,3,0,0]} />
                  <Bar dataKey="outbound" fill="#34d399" radius={[3,3,0,0]} opacity={0.7} />
                </BarChart>
              </ResponsiveContainer>
              <div className="flex gap-4 mt-1">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#00775B]" /><span className="text-[9px] text-white/40">{detail.chartBarA}</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-sm bg-[#34d399]" /><span className="text-[9px] text-white/40">{detail.chartBarB}</span></div>
                <div className="flex items-center gap-1.5 ml-auto"><span className="w-2 h-0.5 bg-red-500" /><span className="text-[9px] text-white/30">{detail.limitLabel}</span></div>
              </div>
            </div>

            {/* Metric cards */}
            <div className="flex divide-x divide-white/10">
              <div className="flex-1 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{detail.metric1Label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[22px] font-bold text-white font-mono">{detail.metric1Value}</span>
                  <span className={cn("text-[10px] font-semibold", detail.metric1Up ? "text-[#34d399]" : "text-amber-400")}>
                    {detail.metric1Up ? "↑" : "↓"} {detail.metric1Delta}
                  </span>
                </div>
              </div>
              <div className="flex-1 px-5 py-4">
                <p className="text-[9px] font-bold uppercase tracking-widest text-white/40">{detail.metric2Label}</p>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-[22px] font-bold text-white font-mono">{detail.metric2Value}</span>
                  <span className={cn("text-[10px] font-semibold", detail.metric2Ok ? "text-[#34d399]" : "text-amber-400")}>
                    {detail.metric2Ok ? "✓" : "⚠"} {detail.metric2Status}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Right panel ────────────────────────────────────────────────── */}
          <div className="flex-1 overflow-y-auto flex flex-col">

            {/* Header */}
            <div className="px-7 pt-6 pb-5 border-b border-neutral-100">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-[10px] font-semibold text-neutral-600">
                    <MapPin className="w-3 h-3" />
                    SCENARIO: {app.scenarios[0]?.toUpperCase() ?? "GENERAL"}
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-neutral-200 bg-neutral-50 text-[10px] font-semibold text-neutral-600">
                    <Landmark className="w-3 h-3" />
                    INDUSTRY: {app.industries[0]?.toUpperCase() ?? "ALL"}
                  </div>
                </div>
                <button onClick={onClose} className="text-neutral-400 hover:text-neutral-700 transition-colors p-1 shrink-0">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <h2 className="text-[22px] font-bold text-neutral-900 leading-tight">{app.name.split(" ").map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(" ")}</h2>
              <p className="text-[13px] text-neutral-500 mt-2 leading-relaxed">{app.description}</p>
            </div>

            {/* Body */}
            <div className="px-7 py-5 flex flex-col gap-5 flex-1">

              {/* Executive outcome */}
              <div className="rounded-[8px] bg-[#F0FDF8] border border-[#00775B]/20 p-4">
                <div className="flex items-center gap-1.5 mb-2">
                  <Star className="w-3 h-3 text-[#00775B]" />
                  <p className="text-[9px] font-bold uppercase tracking-widest text-[#00775B]">Executive Outcome</p>
                </div>
                <p className="text-[14px] font-bold text-neutral-800 leading-snug">
                  {detail.outcome.replace(detail.outcomeHighlight, "").split("").length > 0 && (
                    <>
                      {detail.outcome.substring(0, detail.outcome.indexOf(detail.outcomeHighlight))}
                      <span className="text-[#00775B]">{detail.outcomeHighlight}</span>
                      {detail.outcome.substring(detail.outcome.indexOf(detail.outcomeHighlight) + detail.outcomeHighlight.length)}
                    </>
                  )}
                </p>
              </div>

              {/* Business decisions */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Business Decisions it Drives</p>
                <div className="flex flex-col gap-2">
                  {detail.decisions.map((d, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 rounded-[6px] bg-neutral-50 border border-neutral-100">
                      <div className="w-7 h-7 rounded-[6px] bg-[#E5FFF9] flex items-center justify-center shrink-0">
                        <d.icon className="w-3.5 h-3.5 text-[#00775B]" />
                      </div>
                      <div>
                        <p className="text-[12px] font-semibold text-neutral-800">{d.title}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{d.subtitle}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Key drivers */}
              <div>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Key Drivers</p>
                <div className="flex flex-wrap gap-2">
                  {detail.keyDrivers.map((k) => (
                    <div key={k} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-neutral-200 bg-white text-[11px] font-semibold text-neutral-600">
                      <Zap className="w-3 h-3 text-[#00775B]" />
                      {k}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Footer CTA */}
            <div className="px-7 py-4 border-t border-neutral-100 flex gap-3">
              <button className="flex-1 h-11 rounded-[6px] border border-neutral-200 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2">
                <CalendarDays className="w-4 h-4" /> Schedule Demo
              </button>
              <button
                className="flex-1 h-11 rounded-[6px] text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-colors"
                style={{ backgroundColor: TEAL }}
              >
                View Full Application <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AppCard({ app, onClick }: { app: App; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="rounded-[6px] border border-neutral-200 bg-white overflow-hidden hover:border-[#00775B]/40 hover:shadow-md transition-all cursor-pointer group">
      {/* Image placeholder */}
      <div
        className="w-full h-[110px] relative flex items-center justify-center"
        style={{ backgroundColor: app.color }}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center"
          style={{ backgroundColor: app.iconBg }}
        >
          <app.Icon className="w-5 h-5 text-white/80" />
        </div>
        <Camera className="absolute bottom-2 right-2 w-3 h-3 text-white/20" />
      </div>

      {/* Badge */}
      <div className="px-3 pt-2.5">
        <span
          className="inline-block text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-[3px] text-white"
          style={{ backgroundColor: TEAL }}
        >
          {app.badge}
        </span>
      </div>

      {/* Title */}
      <div className="px-3 pt-1.5">
        <p className="text-[11px] font-bold text-neutral-800 uppercase leading-tight group-hover:text-[#00775B] transition-colors line-clamp-2">
          {app.name}
        </p>
      </div>

      {/* Description */}
      <div className="px-3 pt-1.5">
        <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-2">{app.description}</p>
      </div>

      {/* Tags */}
      <div className="px-3 pt-2 pb-3 flex flex-wrap gap-1">
        {app.tags.map((t) => (
          <span
            key={t}
            className="inline-block text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded-[3px] bg-neutral-100 text-neutral-500"
          >
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

const PAGE_SIZE = 4;

// ─── Featured Apps row (simple, no collapse) ──────────────────────────────────

function FeaturedAppsRow({ apps, onAppClick }: { apps: App[]; onAppClick?: (app: App) => void }) {
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(apps.length / PAGE_SIZE);
  const visible = apps.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="px-6 py-5 border-b border-neutral-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-[14px] font-bold text-neutral-800">Featured Apps</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">Recommended for you</p>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-neutral-400">{page + 1} / {totalPages}</span>
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0}
              className="w-7 h-7 rounded-[4px] border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page === totalPages - 1}
              className="w-7 h-7 rounded-[4px] border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {visible.map((app) => <AppCard key={app.id} app={app} onClick={() => onAppClick?.(app)} />)}
      </div>
    </div>
  );
}

// ─── Category section (collapsible + pagination in header) ────────────────────

function CategorySection({ category, apps, count, onAppClick }: {
  category: Category;
  apps: App[];
  count: number;
  onAppClick?: (app: App) => void;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [page, setPage] = useState(0);
  const totalPages = Math.ceil(apps.length / PAGE_SIZE);
  const visible = apps.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE);

  return (
    <div className="border-b border-neutral-100">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3.5 hover:bg-neutral-50 transition-colors">
        {/* Left: accent + title + count */}
        <div className="flex items-center gap-3">
          <span className="w-1 h-5 rounded-none bg-[#00775B] shrink-0" />
          <h2 className="text-[13px] font-bold text-neutral-800">{category}</h2>
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-neutral-100 text-[10px] font-semibold text-neutral-500">
            {count}
          </span>
        </div>

        {/* Right: pagination + hide/show */}
        <div className="flex items-center gap-2">
          {totalPages > 1 && !collapsed && (
            <>
              <span className="text-[10px] text-neutral-400">{page + 1} / {totalPages}</span>
              <button
                onClick={(e) => { e.stopPropagation(); setPage((p) => Math.max(0, p - 1)); }}
                disabled={page === 0}
                className="w-7 h-7 rounded-[4px] border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); setPage((p) => Math.min(totalPages - 1, p + 1)); }}
                disabled={page === totalPages - 1}
                className="w-7 h-7 rounded-[4px] border border-neutral-200 flex items-center justify-center text-neutral-500 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
              <div className="w-px h-4 bg-neutral-200 mx-1" />
            </>
          )}
          <button
            onClick={() => setCollapsed((c) => !c)}
            className={cn(
              "flex items-center gap-1.5 px-2.5 h-7 rounded-[4px] border text-[11px] font-semibold transition-colors",
              collapsed
                ? "border-neutral-200 text-neutral-500 bg-white hover:border-neutral-300"
                : "border-[#00775B]/30 text-[#00775B] bg-[#00775B]/5 hover:bg-[#00775B]/10"
            )}
          >
            {collapsed ? <><ChevronDown className="w-3.5 h-3.5" /> Show</> : <><ChevronUp className="w-3.5 h-3.5" /> Hide</>}
          </button>
        </div>
      </div>

      {/* Cards */}
      {!collapsed && (
        <div className="px-6 pb-5">
          {apps.length === 0 ? (
            <div className="py-6 flex flex-col items-center gap-2">
              <Camera className="w-8 h-8 text-neutral-300" />
              <p className="text-[12px] text-neutral-400">No apps match the current filters</p>
            </div>
          ) : (
            <div className="grid grid-cols-4 gap-3">
              {visible.map((app) => <AppCard key={app.id} app={app} onClick={() => onAppClick?.(app)} />)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── AppStorePage ──────────────────────────────────────────────────────────────

export function AppStorePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [selectedIndustry, setSelectedIndustry] = useState<Industry | null>(null);
  const [search, setSearch] = useState("");
  const [activeApp, setActiveApp] = useState<App | null>(null);

  const hasFilters = selectedScenario !== null || selectedIndustry !== null || search.trim() !== "";

  const resetFilters = () => {
    setSelectedScenario(null);
    setSelectedIndustry(null);
    setSearch("");
  };

  const filterApps = (apps: App[]) => {
    return apps.filter((app) => {
      if (selectedScenario && !app.scenarios.includes(selectedScenario)) return false;
      if (selectedIndustry && !app.industries.includes(selectedIndustry)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!app.name.toLowerCase().includes(q) && !app.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  };

  const featuredApps = filterApps(APPS.filter((a) => a.featured));

  return (
    <div className="flex flex-col w-full overflow-x-hidden">
      {/* ── Page header ──────────────────────────────────────────────────────── */}
      <div className="px-6 pt-5 pb-5 bg-[#F2FAF6] border-b border-neutral-200">

        {/* Title row */}
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <h1 className="text-[20px] font-bold text-neutral-900 leading-tight">Where is your camera?</h1>
            <p className="text-[11px] text-neutral-500 mt-0.5">Select a scenario or industry to filter applications</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {hasFilters && (
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 h-8 px-3 rounded-[4px] border border-neutral-300 bg-white text-[11px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                <X className="w-3 h-3" />
                Reset filters
              </button>
            )}
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
              <input
                type="text"
                placeholder="Search apps..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 w-48 text-[11px] bg-white border border-neutral-200 rounded-[4px] outline-none placeholder:text-neutral-400 focus:border-[#00775B] transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Filter strips — two columns separated by a divider */}
        <div className="flex gap-0">

          {/* Scenarios column */}
          <div className="flex flex-col gap-2 w-0 flex-1 min-w-0 overflow-hidden">
            <p className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">Scenarios</p>
            <div className="flex flex-wrap gap-1.5">
              {SCENARIOS.map(({ label, Icon }) => (
                <FilterChip
                  key={label}
                  label={label}
                  Icon={Icon}
                  active={selectedScenario === label}
                  onClick={() => setSelectedScenario(selectedScenario === label ? null : label)}
                />
              ))}
            </div>
          </div>

          {/* Divider */}
          <div className="w-px bg-neutral-200 mx-5 self-stretch shrink-0" />

          {/* Industries column */}
          <div className="flex flex-col gap-2 w-0 flex-1 min-w-0 overflow-hidden">
            <p className="text-[9px] font-bold tracking-widest uppercase text-neutral-400">Industries</p>
            <div className="flex flex-wrap gap-1.5">
              {INDUSTRIES.map(({ label, Icon }) => (
                <FilterChip
                  key={label}
                  label={label}
                  Icon={Icon}
                  active={selectedIndustry === label}
                  onClick={() => setSelectedIndustry(selectedIndustry === label ? null : label)}
                />
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {activeApp && <AppDetailModal app={activeApp} onClose={() => setActiveApp(null)} />}

      {/* ── Content ───────────────────────────────────────────────────────────── */}
      <div className="flex flex-col gap-0">

        {/* Featured Apps */}
        {featuredApps.length > 0 && <FeaturedAppsRow apps={featuredApps} onAppClick={setActiveApp} />}

        {/* Category sections */}
        {APP_CATEGORIES.map((category) => {
          const apps = filterApps(APPS.filter((a) => a.categories.includes(category)));
          const count = hasFilters ? apps.length : CATEGORY_COUNTS[category];
          return <CategorySection key={category} category={category} apps={apps} count={count} onAppClick={setActiveApp} />;
        })}

        {/* Empty state when filters return nothing */}
        {hasFilters && featuredApps.length === 0 && APP_CATEGORIES.every(
          (cat) => filterApps(APPS.filter((a) => a.categories.includes(cat))).length === 0
        ) && (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Camera className="w-10 h-10 text-neutral-300" />
            <p className="text-[13px] font-semibold text-neutral-500">No apps match your filters</p>
            <p className="text-[11px] text-neutral-400">Try adjusting your scenario, industry, or search query</p>
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 h-8 px-4 rounded-[4px] bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors"
            >
              <X className="w-3 h-3" /> Reset filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
