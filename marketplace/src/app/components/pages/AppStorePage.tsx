import { useState, useRef, useEffect } from "react";
import {
  Search, X, ChevronDown,
  Plane, UtensilsCrossed, Building2, GraduationCap, Cross, ShoppingCart, HardHat, ShoppingBag,
  HeartPulse, Tag, Truck, BookOpen, Hotel, Factory, Briefcase,
  Camera, Users, Shield, BarChart2, Cpu, Eye, AlertTriangle, Car, Trash2, Flame,
  Star, TrendingUp, CalendarDays, ArrowRight, MapPin, Landmark, Zap,
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceLine } from "recharts";
import { cn } from "@/app/lib/utils";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|\s|\/)\w/g, (c) => c.toUpperCase());

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
  image?: string;
};

// ─── Mock Data ─────────────────────────────────────────────────────────────────

const APPS: App[] = [
  { id: "a-001", name: "PEOPLE COUNTING AT ENTRY/EXIT",      description: "Real-time counting and tracking of people entering and exiting airport terminals",                    badge: "OPTIMIZE STAFFING LEVELS",  tags: ["COMMON", "AIRPORT"],        scenarios: ["Airport", "Mall", "Hospital"],          industries: ["Transportation", "Healthcare", "Retail"],     categories: ["Most Common"],                          featured: true,  color: "#1e3a2f", iconBg: "#2d5a42", Icon: Users,        image: "/queue-overcrowding.png" },
  { id: "a-002", name: "BAGGAGE DETECTION & TRACKING",       description: "Automated detection and tracking of unattended baggage in restricted areas",                         badge: "LOWER LIABILITY CLAIMS",    tags: ["SAFETY", "AIRPORT"],        scenarios: ["Airport"],                               industries: ["Transportation"],                              categories: ["Safety & Compliance"],                  featured: true,  color: "#2d1f0e", iconBg: "#5a3c1a", Icon: AlertTriangle, image: "/abandoned-object.png" },
  { id: "a-003", name: "QUEUE LENGTH MONITORING",            description: "Monitor and optimize queue lengths at security checkpoints and check-in counters",                    badge: "MINIMIZE WAIT TIMES",       tags: ["OPERATIONS", "AIRPORT"],    scenarios: ["Airport", "Hospital", "Retail Store"],  industries: ["Transportation", "Healthcare", "Retail"],     categories: ["Operations & Analytics"],               featured: true,  color: "#0c2340", iconBg: "#1a3d6b", Icon: BarChart2,    image: "/queue-overcrowding.png" },
  { id: "a-004", name: "PERIMETER INTRUSION DETECTION",      description: "Detect unauthorized access along perimeter fences and restricted zones",                             badge: "REDUCE SECURITY RISK",      tags: ["INFRASTRUCTURE", "AIRPORT"],scenarios: ["Airport", "Construction", "Workplace"],  industries: ["Transportation", "Manufacturing", "Corporate"],categories: ["Infrastructure"],                       featured: true,  color: "#0a2420", iconBg: "#12463e", Icon: Shield,       image: "/after-hours-intrusion.png" },
  { id: "a-005", name: "CUSTOMER COUNTING & HEATMAP",        description: "Track customer foot traffic and generate heat maps for store layout optimization",                    badge: "IDENTIFY HIGH-VALUE ZONES", tags: ["COMMON", "RETAIL STORE"],   scenarios: ["Retail Store", "Mall", "Restaurant"],   industries: ["Retail", "Hospitality"],                       categories: ["Most Common", "Operations & Analytics"],featured: true,  color: "#1a1a2e", iconBg: "#2d2d5a", Icon: Eye,          image: "/loitering.png" },
  { id: "a-006", name: "CUSTOMER FLOW ANALYSIS",             description: "Track customer movement patterns to optimize table layouts and service efficiency",                   badge: "INCREASE CAPTURE RATE",     tags: ["COMMON", "RESTAURANT"],     scenarios: ["Restaurant", "Retail Store", "Mall"],   industries: ["Hospitality", "Retail"],                       categories: ["Most Common"],                                           color: "#1e2a1e", iconBg: "#2d452d", Icon: Users,        image: "/panic-movement.png" },
  { id: "a-007", name: "OCCUPANCY DETECTION",                description: "Monitor real-time office occupancy to optimize space utilization and energy usage",                  badge: "MAXIMIZE SPACE UTILITY",    tags: ["COMMON", "WORKPLACE"],      scenarios: ["Workplace", "Hospital", "University"],  industries: ["Corporate", "Healthcare", "Education"],        categories: ["Most Common"],                                           color: "#1a1420", iconBg: "#2d2040", Icon: Building2,    image: "/tailgating.png" },
  { id: "a-008", name: "PPE COMPLIANCE DETECTION",           description: "Detect and alert when workers are not wearing required personal protective equipment",               badge: "ENSURE SITE SAFETY",        tags: ["COMMON", "CONSTRUCTION"],   scenarios: ["Construction", "Workplace"],             industries: ["Construction", "Manufacturing"],                categories: ["Most Common", "Safety & Compliance"],                   color: "#2a1a08", iconBg: "#5a3810", Icon: HardHat,      image: "/unauthorized-entry.png" },
  { id: "a-009", name: "SMART PARKING MANAGEMENT",           description: "Automated parking spot detection and guidance system",                                               badge: "MAINTAIN TRAFFIC FLOW",     tags: ["INFRASTRUCTURE", "MALL"],   scenarios: ["Mall", "Airport", "Workplace"],          industries: ["Retail", "Transportation", "Corporate"],       categories: ["Infrastructure"],                                        color: "#0f1f2a", iconBg: "#1a3545", Icon: Car,          image: "/parking-obstruction.png" },
  { id: "a-010", name: "VEHICLE LICENSE PLATE RECOGNITION",  description: "Automatic number plate recognition for access control",                                              badge: "AUTOMATE GATE ENTRY",       tags: ["INFRASTRUCTURE", "WORKPLACE"],scenarios: ["Workplace", "Airport", "Hospital"],      industries: ["Corporate", "Transportation", "Healthcare"],   categories: ["Infrastructure"],                                        color: "#1f1a0a", iconBg: "#3d3318", Icon: Car,          image: "/vehicle-accident.png" },
  { id: "a-011", name: "WASTE MANAGEMENT MONITORING",        description: "Monitor waste bin levels to optimize collection schedules",                                          badge: "ENHANCE SERVICE EFFICIENCY",tags: ["INFRASTRUCTURE", "UNIVERSITY"],scenarios: ["University", "Mall", "Hospital"],        industries: ["Education", "Healthcare"],                      categories: ["Infrastructure"],                                        color: "#0a2010", iconBg: "#143d20", Icon: Trash2,       image: "/vandalism.png" },
  { id: "a-012", name: "FIRE & SMOKE DETECTION",             description: "Early detection of fire and smoke to trigger automatic alerts and emergency protocols",              badge: "PREVENT FIRE HAZARDS",      tags: ["SAFETY", "CONSTRUCTION"],   scenarios: ["Construction", "Workplace", "Hospital"], industries: ["Construction", "Healthcare", "Manufacturing"],  categories: ["Safety & Compliance"],                                   color: "#2a0a0a", iconBg: "#5a1515", Icon: Flame,        image: "/fire-smoke.png" },
  { id: "a-013", name: "CROWD DENSITY ANALYTICS",            description: "Monitor crowd density and alert security when thresholds are exceeded",                             badge: "PREVENT OVERCROWDING",      tags: ["SAFETY", "MALL"],           scenarios: ["Mall", "Airport", "University"],         industries: ["Retail", "Transportation", "Education"],       categories: ["Safety & Compliance"],                                   color: "#1a0a2a", iconBg: "#320f50", Icon: Users,        image: "/crowd-surge.png" },
  { id: "a-014", name: "SLIP & FALL DETECTION",              description: "Detect slip and fall incidents in real-time and immediately notify safety personnel",                badge: "REDUCE INCIDENT LIABILITY", tags: ["SAFETY", "HOSPITAL"],       scenarios: ["Hospital", "Workplace", "Restaurant"],  industries: ["Healthcare", "Corporate", "Hospitality"],      categories: ["Safety & Compliance"],                                   color: "#0a1a2a", iconBg: "#132d45", Icon: AlertTriangle, image: "/slip-fall.png" },
  { id: "a-015", name: "SHELF STOCK MONITORING",             description: "Automatically detect empty shelves and trigger restocking workflows",                                badge: "MINIMIZE OUT-OF-STOCK",     tags: ["OPERATIONS", "RETAIL STORE"],scenarios: ["Retail Store", "Mall"],                  industries: ["Retail"],                                      categories: ["Operations & Analytics"],                                color: "#1a200a", iconBg: "#2d3a10", Icon: BarChart2,    image: "/theft-shoplifting.png" },
  { id: "a-016", name: "PATIENT FLOW OPTIMIZATION",          description: "Track patient movement and wait times across hospital departments",                                  badge: "REDUCE PATIENT WAIT TIME",  tags: ["OPERATIONS", "HOSPITAL"],   scenarios: ["Hospital"],                              industries: ["Healthcare"],                                   categories: ["Operations & Analytics"],                                color: "#0a1a20", iconBg: "#12303d", Icon: HeartPulse,   image: "/medical-emergency.png" },
  { id: "a-017", name: "ASSET TRACKING",                     description: "Track movement and location of valuable equipment across facilities in real-time",                   badge: "REDUCE ASSET LOSS",         tags: ["OPERATIONS", "WORKPLACE"],  scenarios: ["Workplace", "Hospital", "University"],  industries: ["Corporate", "Healthcare", "Education"],        categories: ["Operations & Analytics"],                                color: "#201a10", iconBg: "#40351e", Icon: Cpu,          image: "/camera-tampering.png" },
  { id: "a-018", name: "DELIVERY ZONE MONITORING",           description: "Monitor loading docks and delivery zones to streamline logistics operations",                        badge: "STREAMLINE LOGISTICS",      tags: ["OPERATIONS", "CONSTRUCTION"],scenarios: ["Construction", "Workplace", "Hospital"], industries: ["Manufacturing", "Corporate", "Transportation"],categories: ["Operations & Analytics"],                                color: "#102010", iconBg: "#1e3d1e", Icon: Truck,        image: "/vehicle-accident.png" },
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
  "Most Common":             APPS.filter(a => a.categories.includes("Most Common")).length,
  "Infrastructure":          APPS.filter(a => a.categories.includes("Infrastructure")).length,
  "Safety & Compliance":     APPS.filter(a => a.categories.includes("Safety & Compliance")).length,
  "Operations & Analytics":  APPS.filter(a => a.categories.includes("Operations & Analytics")).length,
};

// ─── Scenario Dropdown ─────────────────────────────────────────────────────────

function ScenarioDropdown({
  selected,
  onSelect,
  dark = true,
}: {
  selected: Scenario | null;
  onSelect: (s: Scenario | null) => void;
  dark?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const SelectedIcon = selected ? SCENARIOS.find(s => s.label === selected)?.Icon : null;

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "inline-flex items-center gap-1.5 px-3.5 h-8 rounded-full border text-[11px] font-semibold whitespace-nowrap transition-all",
          dark
            ? selected
              ? "rounded-full bg-white text-[#00775B] border-white shadow-sm"
              : "rounded-full bg-white/8 border-white/15 text-white/60 hover:bg-white/15 hover:text-white/80"
            : selected
              ? "rounded-[4px] bg-[#00775B]/10 text-[#00775B] border-[#00775B]/30"
              : "rounded-[4px] bg-white border-neutral-200 text-neutral-600 hover:border-neutral-300 hover:text-neutral-800"
        )}
      >
        {SelectedIcon && <SelectedIcon className="w-3 h-3 shrink-0" />}
        {selected ?? "Scenario"}
        <ChevronDown className={cn("w-3 h-3 transition-transform duration-200", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-[8px] border border-neutral-200 shadow-2xl z-50 py-1 overflow-hidden">
          {selected && (
            <>
              <button
                onClick={() => { onSelect(null); setOpen(false); }}
                className="w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold text-neutral-500 hover:bg-neutral-50 transition-colors"
              >
                <X className="w-3 h-3" /> Clear scenario
              </button>
              <div className="h-px bg-neutral-100 my-1" />
            </>
          )}
          {SCENARIOS.map(({ label, Icon }) => (
            <button
              key={label}
              onClick={() => { onSelect(label); setOpen(false); }}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-[11px] font-semibold transition-colors",
                selected === label
                  ? "text-[#00775B] bg-[#00775B]/5"
                  : "text-neutral-700 hover:bg-neutral-50"
              )}
            >
              <Icon className="w-3.5 h-3.5 text-neutral-400" />
              {label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App detail data ──────────────────────────────────────────────────────────

type AppDetail = {
  outcome: string;
  outcomeHighlight: string;
  decisions: { icon: React.ComponentType<{ className?: string }>; title: string; subtitle: string }[];
  keyDrivers: string[];
  chartTitle: string;
  chartSubtitle: string;
  chartBarA: string;
  chartBarB: string;
  chartData: { name: string; inbound: number; outbound: number }[];
  chartLimit: number;
  limitLabel: string;
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
              {app.image ? (
                <>
                  <img src={app.image} alt={app.name} className="w-full h-full object-cover opacity-70" />
                  <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-transparent to-black/60" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `radial-gradient(${TEAL}60 1px,transparent 1px)`, backgroundSize: "18px 18px" }} />
                  <div className="absolute inset-0" style={{ background: `radial-gradient(ellipse at 40% 50%, ${app.iconBg}99, transparent 70%)` }} />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: app.iconBg }}>
                      <app.Icon className="w-8 h-8 text-white/80" />
                    </div>
                  </div>
                </>
              )}
              <div className="absolute top-10 left-12 w-28 h-20 border-2 rounded-sm opacity-60" style={{ borderColor: "#00ff88" }}>
                <span className="absolute -top-4 left-0 text-[9px] font-bold text-[#00ff88]">Detection 97%</span>
              </div>
              <div className="absolute top-16 right-16 w-20 h-16 border-2 border-dashed rounded-sm opacity-50" style={{ borderColor: "#ffd166" }}>
                <span className="absolute -top-4 left-0 text-[9px] font-bold text-[#ffd166]">Track 94%</span>
              </div>
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
              <button className="flex-1 h-11 rounded-[6px] border border-neutral-200 text-[13px] font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center gap-2 uppercase tracking-wide">
                <CalendarDays className="w-4 h-4" /> Schedule Demo
              </button>
              <button
                className="flex-1 h-11 rounded-[6px] text-[13px] font-bold text-white flex items-center justify-center gap-2 transition-colors uppercase tracking-wide"
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

// ─── App Card ─────────────────────────────────────────────────────────────────

function AppCard({ app, onClick }: { app: App; onClick?: () => void }) {
  return (
    <div onClick={onClick} className="rounded-[6px] border border-neutral-200 bg-white overflow-hidden hover:border-[#00775B]/40 hover:shadow-md transition-all cursor-pointer group">
      <div className="w-full h-[120px] relative overflow-hidden" style={{ backgroundColor: app.color }}>
        {app.image ? (
          <>
            <img src={app.image} alt={app.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-95 group-hover:scale-105 transition-all duration-300" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: app.iconBg }}>
              <app.Icon className="w-5 h-5 text-white/80" />
            </div>
          </div>
        )}
        <Camera className="absolute bottom-2 right-2 w-3 h-3 text-white/30" />
      </div>

      <div className="px-3 pt-2.5">
        <span
          className="inline-block text-[8px] font-bold tracking-widest uppercase px-1.5 py-0.5 rounded-[3px] text-white"
          style={{ backgroundColor: TEAL }}
        >
          {app.badge}
        </span>
      </div>

      <div className="px-3 pt-1.5">
        <p className="text-[11px] font-bold text-neutral-800 leading-tight group-hover:text-[#00775B] transition-colors line-clamp-2">
          {titleCase(app.name)}
        </p>
      </div>

      <div className="px-3 pt-1.5">
        <p className="text-[10px] text-neutral-500 leading-relaxed line-clamp-2">{app.description}</p>
      </div>

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

// ─── Industry Tab Bar ─────────────────────────────────────────────────────────

const INDUSTRY_TAB_LABELS: (Industry | "All")[] = ["All", ...INDUSTRIES.map(i => i.label)];

function IndustryTabBar({
  active,
  onSelect,
  selectedScenario,
  onSelectScenario,
}: {
  active: Industry | "All";
  onSelect: (t: Industry | "All") => void;
  selectedScenario: Scenario | null;
  onSelectScenario: (s: Scenario | null) => void;
}) {
  return (
    <div className="sticky top-0 z-20 bg-white border-b border-neutral-200 flex items-center px-6 gap-0">
      <div className="flex items-center flex-1 overflow-x-auto no-scrollbar">
        {INDUSTRY_TAB_LABELS.map((label) => (
          <button
            key={label}
            onClick={() => onSelect(label)}
            className={cn(
              "shrink-0 px-4 h-11 text-[11px] font-bold tracking-wider uppercase whitespace-nowrap border-b-2 transition-all",
              active === label
                ? "border-[#00775B] text-[#00775B]"
                : "border-transparent text-neutral-500 hover:text-neutral-800 hover:border-neutral-300"
            )}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="shrink-0 pl-4 border-l border-neutral-200 ml-2">
        <ScenarioDropdown selected={selectedScenario} onSelect={onSelectScenario} dark={false} />
      </div>
    </div>
  );
}

// ─── AppStorePage ──────────────────────────────────────────────────────────────

export function AppStorePage() {
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState<Industry | "All">("All");
  const [activeApp, setActiveApp] = useState<App | null>(null);

  const filterApps = (apps: App[]) => {
    return apps.filter((app) => {
      if (selectedScenario && !app.scenarios.includes(selectedScenario)) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!app.name.toLowerCase().includes(q) && !app.description.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  };

  const visibleApps = filterApps(
    activeTab === "All" ? APPS : APPS.filter((a) => a.industries.includes(activeTab as Industry))
  );

  const hasFilters = selectedScenario !== null || search.trim() !== "";

  const resetFilters = () => {
    setSelectedScenario(null);
    setSearch("");
    setActiveTab("All");
  };

  return (
    <div className="flex flex-col w-full overflow-x-hidden">

      {/* ── Hero ─────────────────────────────────────────────────────────────── */}
      <div
        className="relative overflow-hidden border-b border-[#002a1e]"
        style={{ background: "linear-gradient(150deg, #001f17 0%, #003d2e 45%, #005c44 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.05]"
          style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "22px 22px" }}
        />
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse 60% 60% at 50% 0%, #00775B55, transparent)" }}
        />

        <div className="relative px-8 pt-11 pb-9 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-1.5 bg-white/8 border border-white/12 rounded-full px-3.5 py-1 text-[9px] font-bold tracking-[0.12em] text-white/50 uppercase mb-5">
            <Camera className="w-3 h-3" />
            AI Vision Applications
          </div>
          <h1 className="text-[30px] font-bold text-white leading-tight tracking-tight mb-2">
            Where is your camera?
          </h1>
          <p className="text-[13px] text-white/50 max-w-[360px] mb-8 leading-relaxed">
            Browse and deploy AI-powered computer vision apps tailored to your environment.
          </p>
          <div className="relative w-full max-w-[520px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by application, use case, or keyword…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-12 pl-11 pr-11 text-[13px] bg-white rounded-full border-0 outline-none shadow-2xl placeholder:text-neutral-400 focus:ring-2 focus:ring-[#00ff99]/20 transition-all"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── Tab bar ──────────────────────────────────────────────────────────── */}
      <IndustryTabBar
        active={activeTab}
        onSelect={setActiveTab}
        selectedScenario={selectedScenario}
        onSelectScenario={setSelectedScenario}
      />

      {/* ── Modal ────────────────────────────────────────────────────────────── */}
      {activeApp && <AppDetailModal app={activeApp} onClose={() => setActiveApp(null)} />}

      {/* ── Flat card grid ───────────────────────────────────────────────────── */}
      <div className="px-6 py-5">
        {visibleApps.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Camera className="w-10 h-10 text-neutral-300" />
            <p className="text-[13px] font-semibold text-neutral-500">No apps match your filters</p>
            <p className="text-[11px] text-neutral-400">Try adjusting your search or scenario</p>
            <button
              onClick={resetFilters}
              className="mt-2 inline-flex items-center gap-1.5 h-8 px-4 rounded-[4px] bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors uppercase tracking-wide"
            >
              <X className="w-3 h-3" /> Reset filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-3">
            {visibleApps.map((app) => (
              <AppCard key={app.id} app={app} onClick={() => setActiveApp(app)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
