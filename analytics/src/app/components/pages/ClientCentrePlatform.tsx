import { useState, useRef, useEffect } from "react";
import {
  LayoutDashboard, Activity, FileText, BarChart3, Brain,
  Camera, GitBranch, Cpu, Database, Key, Mail, Settings,
  ChevronDown, ChevronRight, ChevronsUpDown, Bell, Search, Sun, Moon,
  LogOut, CheckCircle2, TrendingUp, Video, Layers, AlertTriangle,
  ArrowUpRight, ArrowDownRight, Plus, Circle, Check, MapPin,
  Monitor, Store, Wrench, Headphones, Shield, FolderOpen,
  Network, HardDrive, Server, ChevronLeft, Zap, BarChart2,
  SlidersHorizontal, Globe, List, LayoutGrid, Maximize2, Users, Tag, Briefcase, PanelLeft, User,
  Flame, HardHat, Thermometer, ShieldAlert, Car, BellRing, TriangleAlert,
  X, Eye,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { ALL_INCIDENTS, Incident, IMG_SERVER_ROOM, IMG_INDUSTRIAL, IMG_PARKING, IMG_CROWD, IMG_FIRE } from "@/app/data/mockData";
import {
  IncidentCard2,
  LifecycleRecord, LifecycleStage,
  initRecords,
  SelfAssignDialog, AssignToDialog, EscalateConfirmDialog, ResolveDialog,
  IncidentDetailModal2,
} from "@/app/components/pages/Dashboard2Page";

const INTER: React.CSSProperties = { fontFamily: "'Inter',sans-serif" };
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code',monospace" };

// ─── Dark sidebar constants ───────────────────────────────────────────────────
const SB_BG    = "#021d18";
const SB_BORDER = "rgba(0,119,91,0.15)";
const SB_MUTED  = "rgba(255,255,255,0.32)";
const SB_TEXT   = "rgba(255,255,255,0.62)";
const SB_ACTIVE_BG = "rgba(0,119,91,0.18)";
const SB_ACTIVE_TEXT = "#34D399";
const SB_SECTION = "rgba(255,255,255,0.38)";

// ─── Matrice logo ─────────────────────────────────────────────────────────────
const MatriceIcon = () => (
  <svg viewBox="0 0 113.7 109.945" fill="none" className="w-full h-full">
    <path d="M9.58511 9.56419H24.6545V0H0V109.932H24.6545V100.367H9.58511V9.56419Z" fill="#00956D" />
    <path d="M113.7 0.087L113.426 0.025H89.0458V9.577H104.115V100.38H89.0458V109.944H113.7V0.373V0.075V0.087Z" fill="#00956D" />
    <circle cx="21.775" cy="43.356" r="3.428" fill="#00956D" />
    <circle cx="45.109" cy="43.331" r="6.422" fill="#00956D" />
    <circle cx="56.788" cy="31.628" r="5.000" fill="#00956D" />
    <circle cx="68.429" cy="43.306" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="31.628" r="5.000" fill="#00956D" />
    <circle cx="68.417" cy="20.011" r="3.428" fill="#00956D" />
    <circle cx="45.084" cy="66.613" r="6.422" fill="#00956D" />
    <circle cx="56.751" cy="54.935" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="78.304" r="5.000" fill="#00956D" />
    <circle cx="45.109" cy="89.920" r="3.428" fill="#00956D" />
    <circle cx="68.554" cy="90.020" r="3.428" fill="#00956D" />
    <circle cx="91.912" cy="66.738" r="3.428" fill="#00956D" />
    <circle cx="33.454" cy="78.279" r="5.000" fill="#00956D" />
  </svg>
);

// ─── Platform switcher list ───────────────────────────────────────────────────
type PlatformApp = "analytics" | "training" | "marketplace" | "support" | "support2" | "fe-common" | "vms" | "internal" | "client-centre";
const PLATFORMS: { icon: React.ElementType; label: string; shortcut: string; app: PlatformApp }[] = [
  { icon: Layers,     label: "Matrice AI — Client Centre", shortcut: "0", app: "client-centre" },
  { icon: Monitor,    label: "Matrice VMS",                shortcut: "1", app: "vms" },
  { icon: BarChart3,  label: "Matrice Analytics",          shortcut: "2", app: "analytics" },
  { icon: Cpu,        label: "Matrice Training",           shortcut: "3", app: "training" },
  { icon: Store,      label: "Matrice Marketplace",        shortcut: "4", app: "marketplace" },
  { icon: Wrench,     label: "Matrice Support",            shortcut: "5", app: "support" },
  { icon: Headphones, label: "Support Platform 2",         shortcut: "6", app: "support2" },
  { icon: Shield,     label: "Matrice Internal",           shortcut: "7", app: "internal" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type AppMode = "hub" | "workspace";
type HubPage = "projects" | "compute" | "network" | "storage" | "databases" | "access-keys" | "invites" | "global-settings";
type WorkspacePage = "incidents-dashboard" | "live-streaming" | "incidents-log" | "metrics-rules" | "camera-analytics" | "specialized-intel" | "project-cameras" | "pipeline-settings" | "applications";

interface Project {
  id: string;
  name: string;
  description: string;
  pipelines: number;
  cameras: number;
  criticalAlerts: number;
  highAlerts: number;
  status: "healthy" | "degraded" | "critical";
  region: string;
}

interface Pipeline {
  id: string;
  name: string;
  projectId: string;
  cameras: number;
  status: "running" | "degraded" | "stopped";
  uptime: string;
}

// ─── Mock data ────────────────────────────────────────────────────────────────
const MOCK_PROJECTS: Project[] = [
  { id: "p1", name: "Matrice HQ",         description: "Main headquarters — all entrances, lobbies, server rooms", pipelines: 4, cameras: 42, criticalAlerts: 3, highAlerts: 7,  status: "degraded", region: "Mumbai" },
  { id: "p2", name: "Downtown Retail",    description: "Retail chain across 12 store locations",                  pipelines: 6, cameras: 78, criticalAlerts: 0, highAlerts: 2,  status: "healthy",  region: "Delhi NCR" },
  { id: "p3", name: "Airport Terminal B", description: "Security and crowd monitoring for terminal B",            pipelines: 3, cameras: 55, criticalAlerts: 1, highAlerts: 4,  status: "degraded", region: "Bangalore" },
  { id: "p4", name: "Warehouse District", description: "Logistics and perimeter monitoring",                      pipelines: 2, cameras: 28, criticalAlerts: 0, highAlerts: 0,  status: "healthy",  region: "Chennai" },
  { id: "p5", name: "Factory Floor A",    description: "Safety compliance and PPE monitoring",                    pipelines: 5, cameras: 34, criticalAlerts: 2, highAlerts: 5,  status: "critical", region: "Pune" },
  { id: "p6", name: "Corporate Campus",   description: "Multi-building campus security operations",               pipelines: 3, cameras: 61, criticalAlerts: 0, highAlerts: 1,  status: "healthy",  region: "Hyderabad" },
];

const MOCK_PIPELINES: Pipeline[] = [
  // Project p1 — Matrice HQ (10 pipelines)
  { id: "pl1",  name: "Main-Entrance-Pipeline",  projectId: "p1", cameras: 8,  status: "running",  uptime: "99.8%" },
  { id: "pl2",  name: "Perimeter-Monitor",        projectId: "p1", cameras: 12, status: "running",  uptime: "99.2%" },
  { id: "pl3",  name: "POS-Analytics",            projectId: "p1", cameras: 4,  status: "degraded", uptime: "97.1%" },
  { id: "pl4",  name: "Parking-Zone-A",           projectId: "p1", cameras: 6,  status: "running",  uptime: "100%"  },
  { id: "pl5",  name: "Server-Room-Guard",        projectId: "p1", cameras: 3,  status: "running",  uptime: "100%"  },
  { id: "pl6",  name: "Executive-Floor",          projectId: "p1", cameras: 5,  status: "running",  uptime: "99.5%" },
  { id: "pl7",  name: "Back-Exit-Monitor",        projectId: "p1", cameras: 4,  status: "stopped",  uptime: "—"     },
  { id: "pl8",  name: "Loading-Dock-Feed",        projectId: "p1", cameras: 7,  status: "running",  uptime: "98.9%" },
  { id: "pl9",  name: "Lobby-Turnstile",          projectId: "p1", cameras: 6,  status: "degraded", uptime: "95.3%" },
  { id: "pl10", name: "Rooftop-Surveillance",     projectId: "p1", cameras: 2,  status: "stopped",  uptime: "—"     },
  // Project p2 — Downtown Retail (6 pipelines)
  { id: "pl11", name: "Store-North-Feeds",        projectId: "p2", cameras: 14, status: "running",  uptime: "99.9%" },
  { id: "pl12", name: "Checkout-Analytics",       projectId: "p2", cameras: 8,  status: "running",  uptime: "98.7%" },
  { id: "pl13", name: "Stockroom-CCTV",           projectId: "p2", cameras: 5,  status: "running",  uptime: "99.1%" },
  { id: "pl14", name: "Entrance-Footfall",        projectId: "p2", cameras: 4,  status: "degraded", uptime: "96.4%" },
  { id: "pl15", name: "Parking-Retail",           projectId: "p2", cameras: 10, status: "running",  uptime: "99.7%" },
  { id: "pl16", name: "VIP-Lounge",              projectId: "p2", cameras: 3,  status: "stopped",  uptime: "—"     },
];

// Alert counts per pipeline (active alerts)
const PIPELINE_ALERT_COUNTS: Record<string, { critical: number; high: number }> = {
  pl1: { critical: 2, high: 2 }, pl2: { critical: 0, high: 1 }, pl3: { critical: 0, high: 0 },
  pl4: { critical: 0, high: 0 }, pl5: { critical: 0, high: 0 }, pl6: { critical: 1, high: 3 },
  pl7: { critical: 0, high: 0 }, pl8: { critical: 0, high: 1 }, pl9: { critical: 0, high: 0 },
  pl10: { critical: 0, high: 0 }, pl11: { critical: 0, high: 1 }, pl12: { critical: 0, high: 0 },
  pl13: { critical: 0, high: 0 }, pl14: { critical: 1, high: 1 }, pl15: { critical: 0, high: 0 },
  pl16: { critical: 0, high: 0 },
};

interface CameraFeed {
  id: string; name: string; location: string;
  status: "online" | "offline" | "alert";
  alertType?: string; alertSeverity?: "critical" | "high";
  timestamp: string;
  thumbnail: string;
}

const MOCK_CAMERAS: CameraFeed[] = [
  { id: "CAM-L01",  name: "Main Entrance",       location: "Building A — Ground", status: "alert",  alertType: "INTRUSION DETECTED",  alertSeverity: "critical", timestamp: "17:30 PM", thumbnail: IMG_CROWD      },
  { id: "CAM-L02",  name: "Executive Office",    location: "Floor 3 — West Wing", status: "alert",  alertType: "UNAUTHORISED ACCESS", alertSeverity: "high",     timestamp: "17:28 PM", thumbnail: IMG_SERVER_ROOM },
  { id: "CAM-P01",  name: "Parking Lot B",       location: "Exterior North",      status: "online",                                                               timestamp: "17:30 PM", thumbnail: IMG_PARKING    },
  { id: "CAM-S01",  name: "Server Room",         location: "Basement — IT Hub",   status: "online",                                                               timestamp: "17:30 PM", thumbnail: IMG_SERVER_ROOM },
  { id: "CAM-RC03", name: "Reception",           location: "Ground Floor",        status: "alert",  alertType: "PPE VIOLATION",       alertSeverity: "high",     timestamp: "17:26 PM", thumbnail: IMG_CROWD      },
  { id: "CAM-BE01", name: "Back Exit",           location: "Building A — Rear",   status: "online",                                                               timestamp: "17:30 PM", thumbnail: IMG_INDUSTRIAL },
  { id: "CAM-T01",  name: "Employee Turnstile",  location: "Floor 1 — Lobby",    status: "online",                                                               timestamp: "17:30 PM", thumbnail: IMG_CROWD      },
  { id: "CAM-F03",  name: "Factory Floor",       location: "Zone C — Assembly",   status: "alert",  alertType: "FIRE HAZARD",         alertSeverity: "critical", timestamp: "17:15 PM", thumbnail: IMG_FIRE       },
];

interface MockIncident {
  id: string; title: string; severity: "critical" | "high" | "medium" | "low";
  location: string; camera: string; timestamp: string;
  detectedObjects: string[]; assignedTo?: string; incidentId: string;
}

const MOCK_INCIDENTS: MockIncident[] = [
  { id: "1", incidentId: "INC-2047", title: "Intrusion Detected",   severity: "critical", location: "Main Entrance",     camera: "CAM-L01", timestamp: "17:30 PM", detectedObjects: ["PERSON", "WEAPON"] },
  { id: "2", incidentId: "INC-2046", title: "Unauthorised Access",  severity: "high",     location: "Executive Office",  camera: "CAM-L02", timestamp: "17:28 PM", detectedObjects: ["PERSON"] },
  { id: "3", incidentId: "INC-2045", title: "PPE Violation",        severity: "high",     location: "Reception",         camera: "CAM-RC03",timestamp: "17:26 PM", detectedObjects: ["PERSON", "NO-HELMET"] },
  { id: "4", incidentId: "INC-2044", title: "Fire Hazard",          severity: "critical", location: "Factory Floor",     camera: "CAM-F03", timestamp: "17:15 PM", detectedObjects: ["SMOKE", "FIRE"] },
  { id: "5", incidentId: "INC-2043", title: "Loitering Alert",      severity: "medium",   location: "Parking Lot B",     camera: "CAM-P01", timestamp: "17:10 PM", detectedObjects: ["PERSON"] },
  { id: "6", incidentId: "INC-2042", title: "Door Forced Open",     severity: "high",     location: "Back Exit",         camera: "CAM-BE01",timestamp: "16:55 PM", detectedObjects: ["DOOR", "PERSON"] },
];

// ─── Severity helpers ─────────────────────────────────────────────────────────
function severityColor(s: string) {
  if (s === "critical") return "#EF4444";
  if (s === "high")     return "#F97316";
  if (s === "medium")   return "#F59E0B";
  if (s === "low")      return "#3B82F6";
  if (s === "info")     return "#6366F1";
  if (s === "resolved") return "#10B981";
  return "#94A3B8";
}

// ─── Shared Sidebar Header (platform switcher) ────────────────────────────────
function SidebarHeader({ onPlatformSwitch }: { onPlatformSwitch?: (app: string) => void }) {
  const [platformOpen, setPlatformOpen] = useState(false);

  return (
    <div className="p-2 border-b relative" style={{ borderColor: SB_BORDER }}>
      <button
        onClick={() => setPlatformOpen(o => !o)}
        className="w-full flex items-center gap-2 p-2 rounded-md transition-colors hover:bg-white/5"
      >
        <div className="flex w-8 h-8 items-center justify-center rounded-lg border p-1 shrink-0"
          style={{ background: "#001410", borderColor: "rgba(0,119,91,0.3)" }}>
          <MatriceIcon />
        </div>
        <div className="flex-1 text-left leading-tight">
          <div className="text-[13px] font-semibold text-white" style={INTER}>Matrice AI</div>
          <div className="text-[11px]" style={{ ...INTER, color: "rgba(255,255,255,0.45)" }}>Client Centre</div>
        </div>
        <ChevronsUpDown className="w-4 h-4 shrink-0" style={{ color: "rgba(255,255,255,0.4)" }} />
      </button>

      {platformOpen && (
        <div className="absolute left-0 top-full mt-1 z-[200] w-56 rounded-lg border shadow-xl py-1"
          style={{ background: "#021d18", borderColor: "rgba(0,119,91,0.3)" }}>
          <p className="px-2 py-1.5 text-[11px] font-medium" style={{ ...MONO, color: "rgba(255,255,255,0.35)" }}>Platforms</p>
          {PLATFORMS.map(p => {
            const Icon = p.icon;
            const isActive = p.app === "client-centre";
            return (
              <button key={p.shortcut}
                className="flex w-full items-center gap-2 px-2 py-2 text-[13px] rounded-sm hover:bg-white/8 transition-colors"
                style={{ ...INTER, color: isActive ? SB_ACTIVE_TEXT : "rgba(255,255,255,0.75)" }}
                onClick={() => { setPlatformOpen(false); onPlatformSwitch?.(p.app); }}>
                <div className="flex w-6 h-6 items-center justify-center rounded-sm border"
                  style={{ background: "#001410", borderColor: "rgba(0,119,91,0.25)" }}>
                  <Icon className="w-3.5 h-3.5" style={{ color: isActive ? SB_ACTIVE_TEXT : "rgba(255,255,255,0.5)" }} />
                </div>
                <span className="flex-1 text-left">{p.label}</span>
                {isActive && <Check className="w-3.5 h-3.5" style={{ color: SB_ACTIVE_TEXT }} />}
                <kbd className="text-[10px] px-1 rounded border" style={{ ...MONO, background: "rgba(255,255,255,0.06)", borderColor: "rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.35)" }}>
                  ⌘{p.shortcut}
                </kbd>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── NAV BUTTON helper ────────────────────────────────────────────────────────
function NavBtn({ icon: Icon, label, active, onClick, badge }: {
  icon: React.ElementType; label: string; active?: boolean; onClick: () => void; badge?: number;
}) {
  return (
    <button onClick={onClick}
      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium transition-colors"
      style={{ ...INTER, color: active ? SB_ACTIVE_TEXT : SB_TEXT, background: active ? SB_ACTIVE_BG : "transparent" }}>
      <Icon className="w-4 h-4 shrink-0" style={{ color: active ? SB_ACTIVE_TEXT : SB_MUTED }} />
      <span className="flex-1 text-left">{label}</span>
      {badge !== undefined && badge > 0 && (
        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full" style={{ background: "#EF444425", color: "#EF4444", ...MONO }}>{badge}</span>
      )}
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function HubSidebar({ page, setPage, onPlatformSwitch, open = true }: {
  page: HubPage; setPage: (p: HubPage) => void; onPlatformSwitch?: (app: string) => void;
  open?: boolean;
}) {
  const [infraOpen, setInfraOpen] = useState(false);

  return (
    <aside className="flex flex-col shrink-0 border-r h-full overflow-y-auto overflow-x-hidden"
      style={{
        background: SB_BG, borderColor: SB_BORDER,
        width: open ? "224px" : "0px",
        minWidth: open ? "224px" : "0px",
        transition: "width 0.22s cubic-bezier(0.16,1,0.3,1), min-width 0.22s cubic-bezier(0.16,1,0.3,1)",
        visibility: open ? "visible" : "hidden",
        opacity: open ? 1 : 0,
      }}>
      <SidebarHeader onPlatformSwitch={onPlatformSwitch} />

      <nav className="flex-1 py-3 px-2 space-y-0.5">
        <NavBtn icon={FolderOpen}  label="Projects"        active={page === "projects"}       onClick={() => setPage("projects")} />

        {/* Infrastructure accordion */}
        <button onClick={() => setInfraOpen(o => !o)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium"
          style={{ ...INTER, color: (["compute","network","storage","databases"] as HubPage[]).includes(page) ? SB_ACTIVE_TEXT : SB_TEXT }}>
          <Server className="w-4 h-4 shrink-0" style={{ color: SB_MUTED }} />
          <span className="flex-1 text-left">Infrastructure</span>
          {infraOpen ? <ChevronDown className="w-3.5 h-3.5" style={{ color: SB_MUTED }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: SB_MUTED }} />}
        </button>
        {infraOpen && (
          <div className="pl-4 space-y-0.5">
            <NavBtn icon={Cpu}       label="Compute Clusters" active={page === "compute"}   onClick={() => setPage("compute")} />
            <NavBtn icon={Network}   label="Network LANs"     active={page === "network"}   onClick={() => setPage("network")} />
            <NavBtn icon={HardDrive} label="Storage Arrays"   active={page === "storage"}   onClick={() => setPage("storage")} />
            <NavBtn icon={Database}  label="Databases"        active={page === "databases"} onClick={() => setPage("databases")} />
          </div>
        )}

        <NavBtn icon={Key}      label="Access Keys"     active={page === "access-keys"}      onClick={() => setPage("access-keys")} />
        <NavBtn icon={Mail}     label="My Invites"      active={page === "invites"}           onClick={() => setPage("invites")} />
        <NavBtn icon={Settings} label="Global Settings" active={page === "global-settings"}  onClick={() => setPage("global-settings")} />
      </nav>

      <div className="border-t px-2 py-3" style={{ borderColor: SB_BORDER }}>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[12px]"
          style={{ ...INTER, color: SB_TEXT }}>
          <LogOut className="w-4 h-4" style={{ color: SB_MUTED }} />
          Sign out
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE SIDEBAR
// ─────────────────────────────────────────────────────────────────────────────
function WorkspaceSidebar({ page, setPage, onBackToHub, onPlatformSwitch, open = true }: {
  page: WorkspacePage; setPage: (p: WorkspacePage) => void;
  onBackToHub: () => void; onPlatformSwitch?: (app: string) => void;
  open?: boolean;
}) {
  const [intelOpen, setIntelOpen] = useState(false);

  const section = (label: string) => (
    <div className="px-3 pt-3 pb-1">
      <span className="text-[10px] font-bold tracking-widest uppercase" style={{ ...MONO, color: SB_SECTION }}>{label}</span>
    </div>
  );

  return (
    <aside className="flex flex-col shrink-0 border-r h-full overflow-y-auto overflow-x-hidden"
      style={{
        background: SB_BG, borderColor: SB_BORDER,
        width: open ? "224px" : "0px",
        minWidth: open ? "224px" : "0px",
        transition: "width 0.22s cubic-bezier(0.16,1,0.3,1), min-width 0.22s cubic-bezier(0.16,1,0.3,1)",
        visibility: open ? "visible" : "hidden",
        opacity: open ? 1 : 0,
      }}>
      <SidebarHeader onPlatformSwitch={onPlatformSwitch} />

      {/* Back to hub */}
      <div className="px-2 pt-2 pb-1">
        <button onClick={onBackToHub}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-[6px] text-[12px] font-medium transition-colors hover:bg-white/5"
          style={{ ...INTER, color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.08)" }}>
          <ChevronLeft className="w-3.5 h-3.5" />
          Back to Projects Hub
        </button>
      </div>
      <div className="mx-3 border-b" style={{ borderColor: SB_BORDER }} />

      <nav className="flex-1 py-1 px-2 space-y-0.5">
        {section("OPERATE")}
        <NavBtn icon={LayoutDashboard} label="Incidents Dashboard" active={page === "incidents-dashboard"} onClick={() => setPage("incidents-dashboard")} />
        <NavBtn icon={Video}           label="Live Streaming"      active={page === "live-streaming"}      onClick={() => setPage("live-streaming")} />
        <NavBtn icon={FileText}        label="Incidents Log"       active={page === "incidents-log"}       onClick={() => setPage("incidents-log")} />

        {section("INSIGHTS")}
        <NavBtn icon={BarChart3}        label="Metrics & Rules"    active={page === "metrics-rules"}       onClick={() => setPage("metrics-rules")} />
        <NavBtn icon={BarChart2}        label="Camera Analytics"   active={page === "camera-analytics"}    onClick={() => setPage("camera-analytics")} />

        {/* Specialized Intel accordion */}
        <button onClick={() => setIntelOpen(o => !o)}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] font-medium"
          style={{ ...INTER, color: page === "specialized-intel" ? SB_ACTIVE_TEXT : SB_TEXT, background: page === "specialized-intel" ? SB_ACTIVE_BG : "transparent" }}>
          <Brain className="w-4 h-4 shrink-0" style={{ color: SB_MUTED }} />
          <span className="flex-1 text-left">Specialized Intel</span>
          {intelOpen ? <ChevronDown className="w-3.5 h-3.5" style={{ color: SB_MUTED }} /> : <ChevronRight className="w-3.5 h-3.5" style={{ color: SB_MUTED }} />}
        </button>
        {intelOpen && (
          <div className="pl-4 space-y-0.5">
            {["Volume Analytics","Incident Analytics","Zone Analytics","Quality Analytics","Safety Analytics"].map(lbl => (
              <button key={lbl} onClick={() => setPage("specialized-intel")}
                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-[5px] text-[12px]"
                style={{ ...INTER, color: SB_TEXT }}>
                <ChevronRight className="w-3 h-3 shrink-0" style={{ color: SB_MUTED }} />
                {lbl}
              </button>
            ))}
          </div>
        )}

        {section("WORKSPACE CONFIG")}
        <NavBtn icon={Zap}             label="Applications"       active={page === "applications"}        onClick={() => setPage("applications")} />
        <NavBtn icon={Camera}          label="Project Cameras"    active={page === "project-cameras"}     onClick={() => setPage("project-cameras")} />
        <NavBtn icon={SlidersHorizontal} label="Pipeline Settings" active={page === "pipeline-settings"}  onClick={() => setPage("pipeline-settings")} />
      </nav>

      <div className="border-t px-2 py-3" style={{ borderColor: SB_BORDER }}>
        <button className="w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[12px]"
          style={{ ...INTER, color: SB_TEXT }}>
          <Settings className="w-4 h-4" style={{ color: SB_MUTED }} />
          Settings
        </button>
      </div>
    </aside>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// HUB TOP BAR
// ─────────────────────────────────────────────────────────────────────────────
function HubTopBar({ isDark, setIsDark, persona, onPersonaSwitch, onToggleSidebar }: {
  isDark: boolean; setIsDark: (v: boolean) => void;
  persona?: "manager" | "monitor";
  onPersonaSwitch?: (p: "manager" | "monitor") => void;
  onToggleSidebar?: () => void;
}) {
  const BG = "#021d18";
  const BORDER = "rgba(0,119,91,0.18)";
  const muted = "rgba(255,255,255,0.45)";
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header className="flex items-center gap-3 px-5 h-14 shrink-0 border-b"
      style={{ background: BG, borderColor: BORDER }}>
      {/* Sidebar toggle */}
      {onToggleSidebar && (
        <button onClick={onToggleSidebar}
          className="flex items-center justify-center rounded-md transition-colors hover:bg-white/8"
          title="Toggle Sidebar"
          style={{ width: "28px", height: "28px", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
          <PanelLeft className="w-4 h-4" />
        </button>
      )}
      <div className="w-px h-5 shrink-0" style={{ background: "rgba(0,119,91,0.18)" }} />
      <div className="flex-1" />
      {onPersonaSwitch && (
        <div className="flex items-center p-[3px] rounded-full shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
          {(["monitor", "manager"] as const).map(p => {
            const active = persona === p;
            return (
              <button key={p} onClick={() => onPersonaSwitch(p)}
                title={p === "monitor" ? "Monitoring Staff" : "Manager"}
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: "28px", height: "28px",
                  background: active ? "#00775B" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.35)",
                  transition: "background 0.2s cubic-bezier(0.16,1,0.3,1), color 0.2s cubic-bezier(0.16,1,0.3,1)",
                }}>
                {p === "monitor" ? <Monitor className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
      <button className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[12px]"
        style={{ background: "rgba(0,119,91,0.12)", border: "1px solid rgba(0,119,91,0.2)", color: muted, ...INTER }}>
        <Search className="w-3.5 h-3.5" />
        <span>Search projects…</span>
        <kbd className="text-[10px] px-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: muted, ...MONO }}>⌘K</kbd>
      </button>
      <div className="w-px h-5" style={{ background: "rgba(0,119,91,0.18)" }} />
      <button className="relative w-8 h-8 rounded-[6px] flex items-center justify-center"
        style={{ background: "rgba(0,119,91,0.12)", border: "1px solid rgba(0,119,91,0.2)" }}>
        <Bell className="w-4 h-4" style={{ color: muted }} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#EF4444", ...MONO }}>6</span>
      </button>
      {/* Avatar + profile dropdown */}
      <div className="relative" ref={avatarRef}>
        <button onClick={() => setAvatarOpen(v => !v)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-transparent hover:ring-[#00775B]/40 transition-all"
          style={{ background: "#00775B", ...INTER }}>AD</button>
        {avatarOpen && (
          <div className="absolute right-0 top-10 z-50 w-56 rounded-[6px] overflow-hidden shadow-xl"
            style={{ background: "#0F1F17", border: "1px solid rgba(0,119,91,0.25)" }}>
            <div className="px-3 py-2.5 border-b" style={{ borderColor: "rgba(0,119,91,0.15)" }}>
              <p className="text-[13px] font-semibold text-white" style={INTER}>Admin User</p>
              <p className="text-[11px] mt-0.5" style={{ ...INTER, color: muted }}>akshith.doddi@matrice.ai</p>
            </div>
            {[
              { icon: User, label: "Profile", action: () => setAvatarOpen(false) },
              { icon: isDark ? Sun : Moon, label: isDark ? "Light Mode" : "Dark Mode", action: () => { setIsDark(!isDark); setAvatarOpen(false); } },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-left transition-colors hover:bg-white/6"
                style={{ ...INTER, color: "rgba(255,255,255,0.72)" }}>
                <Icon className="w-4 h-4" style={{ color: muted }} />
                {label}
              </button>
            ))}
            <div className="border-t mx-3" style={{ borderColor: "rgba(0,119,91,0.15)" }} />
            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-left transition-colors hover:bg-white/6"
              style={{ ...INTER, color: "rgba(255,255,255,0.72)" }}>
              <LogOut className="w-4 h-4" style={{ color: muted }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// WORKSPACE TOP BAR
// ─────────────────────────────────────────────────────────────────────────────
function WorkspaceTopBar({
  project, setProject, pipeline, setPipeline, isDark, setIsDark, allProjects, projectPipelines,
  showPipelineControl, isPipelineActive, onTogglePipeline, persona, onPersonaSwitch, onToggleSidebar,
}: {
  project: Project; setProject: (p: Project) => void;
  pipeline: Pipeline | null; setPipeline: (p: Pipeline | null) => void;
  isDark: boolean; setIsDark: (v: boolean) => void;
  allProjects: Project[]; projectPipelines: Pipeline[];
  showPipelineControl?: boolean;
  isPipelineActive?: boolean;
  onTogglePipeline?: () => void;
  persona?: "manager" | "monitor";
  onPersonaSwitch?: (p: "manager" | "monitor") => void;
  onToggleSidebar?: () => void;
}) {
  const [projOpen, setProjOpen] = useState(false);
  const [pipeOpen, setPipeOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);
  const BG = "#021d18";
  const BORDER = "rgba(0,119,91,0.18)";
  const muted = "rgba(255,255,255,0.45)";
  const text = "rgba(255,255,255,0.9)";
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) setAvatarOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const SEVERITY_COUNTS = { critical: 3, high: 7, medium: 14 };

  return (
    <header className="flex items-center gap-3 px-4 h-14 shrink-0 border-b z-20"
      style={{ background: BG, borderColor: BORDER }}>

      {/* Sidebar toggle */}
      {onToggleSidebar && (
        <button onClick={onToggleSidebar}
          className="flex items-center justify-center rounded-md transition-colors hover:bg-white/8"
          title="Toggle Sidebar"
          style={{ width: "28px", height: "28px", color: "rgba(255,255,255,0.45)", flexShrink: 0 }}>
          <PanelLeft className="w-4 h-4" />
        </button>
      )}
      <div className="w-px h-5 shrink-0" style={{ background: "rgba(0,119,91,0.18)" }} />

      {/* Breadcrumb scope control */}
      <div className="flex items-center gap-1.5 text-[12px]" style={INTER}>
        <span style={{ color: "rgba(255,255,255,0.35)" }}>Projects</span>
        <ChevronRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />

        {/* Project selector */}
        <div className="relative">
          <button onClick={() => { setProjOpen(o => !o); setPipeOpen(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px]"
            style={{ background: "rgba(0,119,91,0.12)", border: "1px solid rgba(0,119,91,0.2)" }}>
            <span className="font-semibold" style={{ color: text }}>{project.name}</span>
            <ChevronDown className="w-3 h-3" style={{ color: muted }} />
          </button>
          {projOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 rounded-[8px] shadow-xl border min-w-[200px] py-1"
              style={{ background: "#021d18", borderColor: "rgba(0,119,91,0.3)" }}>
              {allProjects.map(p => (
                <button key={p.id} onClick={() => { setProject(p); setPipeline(null); setProjOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2 hover:bg-white/5"
                  style={{ ...INTER, color: p.id === project.id ? SB_ACTIVE_TEXT : text }}>
                  {p.id === project.id && <Check className="w-3 h-3" style={{ color: SB_ACTIVE_TEXT }} />}
                  {p.id !== project.id && <span className="w-3" />}
                  {p.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <ChevronRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.25)" }} />

        {/* Pipeline selector */}
        <div className="relative">
          <button onClick={() => { setPipeOpen(o => !o); setProjOpen(false); }}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px]"
            style={{ background: "rgba(0,119,91,0.12)", border: "1px solid rgba(0,119,91,0.2)" }}>
            <span className="font-semibold" style={{ color: pipeline ? text : muted }}>
              {pipeline ? pipeline.name : "Select pipeline…"}
            </span>
            <ChevronDown className="w-3 h-3" style={{ color: muted }} />
          </button>
          {pipeOpen && (
            <div className="absolute top-full mt-1 left-0 z-50 rounded-[8px] shadow-xl border min-w-[220px] py-1"
              style={{ background: "#021d18", borderColor: "rgba(0,119,91,0.3)" }}>
              <button onClick={() => { setPipeline(null); setPipeOpen(false); }}
                className="w-full text-left px-3 py-2 text-[12px] hover:bg-white/5 flex items-center gap-2"
                style={{ ...INTER, color: muted }}>
                <span className="w-3" />All pipelines
              </button>
              {projectPipelines.map(p => (
                <button key={p.id} onClick={() => { setPipeline(p); setPipeOpen(false); }}
                  className="w-full text-left px-3 py-2 text-[12px] flex items-center gap-2 hover:bg-white/5"
                  style={{ ...INTER, color: pipeline?.id === p.id ? SB_ACTIVE_TEXT : text }}>
                  {pipeline?.id === p.id && <Check className="w-3 h-3" style={{ color: SB_ACTIVE_TEXT }} />}
                  {pipeline?.id !== p.id && <span className="w-3" />}
                  <span className="flex-1">{p.name}</span>
                  <span className={cn("w-1.5 h-1.5 rounded-full")}
                    style={{ background: p.status === "running" ? "#10B981" : p.status === "degraded" ? "#F59E0B" : "#EF4444" }} />
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Start / Stop Pipeline — only on Live Streaming page ── */}
      {showPipelineControl && pipeline && (
        <button
          onClick={onTogglePipeline}
          className="flex items-center gap-2 px-4 rounded-[4px] text-[11px] font-semibold uppercase tracking-[0.03em] shrink-0"
          style={{
            height: "32px",
            background: isPipelineActive ? "rgba(239,68,68,0.10)" : "rgba(0,149,109,0.10)",
            border: `1px solid ${isPipelineActive ? "#EF4444" : "#00956D"}`,
            color: isPipelineActive ? "#EF4444" : "#00956D",
            transition: "background 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.2s cubic-bezier(0.16,1,0.3,1), color 0.2s cubic-bezier(0.16,1,0.3,1)",
            ...INTER,
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLButtonElement).style.background = isPipelineActive
              ? "rgba(239,68,68,0.20)"
              : "rgba(0,149,109,0.22)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLButtonElement).style.background = isPipelineActive
              ? "rgba(239,68,68,0.10)"
              : "rgba(0,149,109,0.10)";
          }}
        >
          {isPipelineActive ? "🛑 Stop Pipeline" : "🟢 Start Pipeline"}
        </button>
      )}

      <div className="flex-1" />

      {/* ── Persona switcher pill ── */}
      {onPersonaSwitch && (
        <div className="flex items-center p-[3px] rounded-full shrink-0"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.09)" }}>
          {(["monitor", "manager"] as const).map(p => {
            const active = persona === p;
            return (
              <button key={p} onClick={() => onPersonaSwitch(p)}
                title={p === "monitor" ? "Monitoring Staff" : "Manager"}
                className="flex items-center justify-center rounded-full transition-all"
                style={{
                  width: "28px", height: "28px",
                  background: active ? "#00775B" : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.35)",
                  transition: "background 0.2s cubic-bezier(0.16,1,0.3,1), color 0.2s cubic-bezier(0.16,1,0.3,1)",
                }}>
                {p === "monitor" ? <Monitor className="w-3.5 h-3.5" /> : <Briefcase className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}

      {/* Severity badges */}
      <div className="hidden md:flex items-center gap-1.5">
        {(["critical","high","medium"] as const).map(s => (
          <span key={s} className="inline-flex items-center gap-1 px-2 py-1 rounded-[4px] text-[10px] font-bold"
            style={{ ...MONO, background: severityColor(s) + "25", color: severityColor(s) }}>
            {SEVERITY_COUNTS[s]}
          </span>
        ))}
        <span className="text-[10px]" style={{ ...MONO, color: muted }}>open</span>
      </div>

      <div className="w-px h-5 mx-1" style={{ background: "rgba(0,119,91,0.18)" }} />

      {/* Live badge */}
      <div className="flex items-center gap-1.5 px-2 py-1 rounded-full"
        style={{ background: "#00775B18", border: "1px solid #00775B30" }}>
        <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
        <span className="text-[10px] font-bold tracking-wider" style={{ ...MONO, color: "#00775B" }}>LIVE</span>
      </div>

      <button className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] text-[12px]"
        style={{ background: "rgba(0,119,91,0.12)", border: "1px solid rgba(0,119,91,0.2)", color: muted, ...INTER }}>
        <Search className="w-3.5 h-3.5" />
        <kbd className="text-[10px] px-1 rounded" style={{ background: "rgba(255,255,255,0.08)", color: muted, ...MONO }}>⌘K</kbd>
      </button>

      <button className="relative w-8 h-8 rounded-[6px] flex items-center justify-center"
        style={{ background: "rgba(0,119,91,0.12)", border: "1px solid rgba(0,119,91,0.2)" }}>
        <Bell className="w-4 h-4" style={{ color: muted }} />
        <span className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[9px] font-bold text-white"
          style={{ background: "#EF4444", ...MONO }}>3</span>
      </button>

      {/* Avatar + profile dropdown */}
      <div className="relative" ref={avatarRef}>
        <button onClick={() => setAvatarOpen(v => !v)}
          className="w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-bold text-white ring-2 ring-transparent hover:ring-[#00775B]/40 transition-all"
          style={{ background: "#00775B", ...INTER }}>AD</button>
        {avatarOpen && (
          <div className="absolute right-0 top-10 z-50 w-56 rounded-[6px] overflow-hidden shadow-xl"
            style={{ background: "#0F1F17", border: "1px solid rgba(0,119,91,0.25)" }}>
            <div className="px-3 py-2.5 border-b" style={{ borderColor: "rgba(0,119,91,0.15)" }}>
              <p className="text-[13px] font-semibold text-white" style={INTER}>Admin User</p>
              <p className="text-[11px] mt-0.5" style={{ ...INTER, color: muted }}>akshith.doddi@matrice.ai</p>
            </div>
            {[
              { icon: User, label: "Profile", action: () => setAvatarOpen(false) },
              { icon: isDark ? Sun : Moon, label: isDark ? "Light Mode" : "Dark Mode", action: () => { setIsDark(!isDark); setAvatarOpen(false); } },
            ].map(({ icon: Icon, label, action }) => (
              <button key={label} onClick={action}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-left transition-colors hover:bg-white/6"
                style={{ ...INTER, color: "rgba(255,255,255,0.72)" }}>
                <Icon className="w-4 h-4" style={{ color: muted }} />
                {label}
              </button>
            ))}
            <div className="border-t mx-3" style={{ borderColor: "rgba(0,119,91,0.15)" }} />
            <button className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-left transition-colors hover:bg-white/6"
              style={{ ...INTER, color: "rgba(255,255,255,0.72)" }}>
              <LogOut className="w-4 h-4" style={{ color: muted }} />
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT CARD — high-density, hover-stateful, v1.1
// ─────────────────────────────────────────────────────────────────────────────
// Mock per-project app status for monitor persona
const PROJECT_PIPELINE_STATUS: Record<string, { active: number; inactive: number }> = {
  "p1": { active: 3, inactive: 1 },
  "p2": { active: 6, inactive: 0 },
  "p3": { active: 2, inactive: 1 },
  "p4": { active: 1, inactive: 1 },
  "p5": { active: 4, inactive: 1 },
  "p6": { active: 3, inactive: 0 },
};

const PROJECT_APP_STATUS: Record<string, { active: number; inactive: number }> = {
  "p1": { active: 7, inactive: 2 },
  "p2": { active: 3, inactive: 5 },
  "p3": { active: 12, inactive: 0 },
  "p4": { active: 5, inactive: 3 },
  "p5": { active: 9, inactive: 1 },
  "p6": { active: 0, inactive: 8 },
};

const PROJECT_LAST_ALERT: Record<string, string> = {
  "p1": "17:30",
  "p2": "16:45",
  "p3": "17:15",
  "p4": "NONE",
  "p5": "17:08",
  "p6": "16:20",
};

const PROJECT_LAST_RUN: Record<string, string> = {
  "p1": "2 min ago",
  "p2": "just now",
  "p3": "8 min ago",
  "p4": "14 min ago",
  "p5": "1 min ago",
  "p6": "5 min ago",
};

function ProjectCard({ project, incident, isDark, cardBg, text, sub, statusColor, onSelect, persona }: {
  project: Project; incident: boolean; isDark: boolean;
  cardBg: string; text: string; sub: string;
  statusColor: (s: Project["status"]) => string;
  onSelect: (p: Project) => void;
  persona?: "manager" | "monitor";
}) {
  const [hovered, setHovered] = useState(false);
  const totalAlerts = project.criticalAlerts + project.highAlerts;
  const hasAlerts = totalAlerts > 0;

  // ── Shared card shell style ──────────────────────────────────────────────────
  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    padding: "14px 16px",
    height: "112px",
    background: cardBg,
    border: `1px solid ${hovered ? "#00956D" : isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`,
    borderRadius: "4px",
    boxSizing: "border-box",
    cursor: "pointer",
    transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.15s ease, box-shadow 0.15s ease",
    transform: hovered ? "translateY(-2px)" : "translateY(0)",
    boxShadow: hovered ? "0 6px 16px rgba(0,149,109,0.06)" : "none",
    width: "100%",
  };

  // ── Monitor persona ───────────────────────────────────────────────────────────
  if (persona === "monitor") {
    const appStat   = PROJECT_APP_STATUS[project.id] ?? { active: 0, inactive: 0 };
    const totalApps = appStat.active + appStat.inactive;
    const lastAlert = PROJECT_LAST_ALERT[project.id] ?? "NONE";

    return (
      <button
        onClick={() => onSelect(project)}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="text-left"
        style={cardStyle}>

        {/* ── Top: name + alert badge ── */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
          <h3 className="truncate flex-1 min-w-0"
            style={{ ...INTER, fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
                     letterSpacing: "0.04em", color: isDark ? "#F1F5F9" : "#1E293B", lineHeight: 1.2, margin: 0 }}>
            {project.name}
          </h3>
          {hasAlerts && (
            <span className="shrink-0 ml-3 inline-flex items-center gap-1"
              style={{ ...INTER, fontWeight: 700, fontSize: "10px",
                       padding: "2px 6px", borderRadius: "3px",
                       background: "rgba(239,68,68,0.10)", border: "1px solid #EF4444", color: "#EF4444" }}>
              <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
              <span style={MONO}>{totalAlerts}</span> Alert{totalAlerts !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* ── Sub: app ratio ── */}
        <div style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
          <span style={{ ...MONO, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                         color: appStat.active < totalApps ? "#00956D" : isDark ? "#94A3B8" : "#334155" }}>
            {appStat.active}/{totalApps}
          </span>
          <span style={{ color: appStat.active < totalApps ? "#00956D" : "#64748B" }}>Apps active</span>
        </div>

        {/* ── Bottom row: cameras + last alert ── */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          width: "100%", marginTop: "auto",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9"}`, paddingTop: "8px",
        }}>
          <span style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px",
                         color: isDark ? "#64748B" : "#64748B" }}>
            <span style={{ ...MONO, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                           color: isDark ? "#94A3B8" : "#334155" }}>{project.cameras}</span>
            <span>Cameras</span>
          </span>
          <span style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
            <span style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#CBD5E1" }}>Last alert</span>
            <span style={{ ...MONO, fontWeight: 600, color: lastAlert === "NONE" ? "#00A63E" : "#64748B" }}>
              {lastAlert}
            </span>
          </span>
        </div>
      </button>
    );
  }

  // ── Manager persona ───────────────────────────────────────────────────────────
  const ps      = PROJECT_PIPELINE_STATUS[project.id] ?? { active: 0, inactive: 0 };
  const lastRun = PROJECT_LAST_RUN[project.id] ?? "—";
  const pipelineDeficit = ps.active < project.pipelines;

  return (
    <button
      onClick={() => onSelect(project)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="text-left"
      style={cardStyle}>

      {/* ── Top: name + alert badge ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <h3 className="truncate flex-1 min-w-0"
          style={{ ...INTER, fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
                   letterSpacing: "0.04em", color: isDark ? "#F1F5F9" : "#1E293B", lineHeight: 1.2, margin: 0 }}>
          {project.name}
        </h3>
        {hasAlerts && (
          <span className="shrink-0 ml-3 inline-flex items-center gap-1"
            style={{ ...INTER, fontWeight: 700, fontSize: "10px",
                     padding: "2px 6px", borderRadius: "3px",
                     background: "rgba(239,68,68,0.10)", border: "1px solid #EF4444", color: "#EF4444" }}>
            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            <span style={MONO}>{totalAlerts}</span> Alert{totalAlerts !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* ── Sub: pipeline ratio ── */}
      <div style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
        <span style={{ ...MONO, fontWeight: 700, fontVariantNumeric: "tabular-nums",
                       color: pipelineDeficit ? "#00956D" : isDark ? "#94A3B8" : "#334155" }}>
          {ps.active}/{project.pipelines}
        </span>
        <span style={{ color: pipelineDeficit ? "#00956D" : "#64748B" }}>Active pipelines</span>
      </div>

      {/* ── Bottom row: cameras + last run ── */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", marginTop: "auto",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9"}`, paddingTop: "8px",
      }}>
        <span style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", color: "#64748B" }}>
          <span style={{ ...MONO, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                         color: isDark ? "#94A3B8" : "#334155" }}>{project.cameras}</span>
          <span>Cameras</span>
        </span>
        <span style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#CBD5E1" }}>Last run</span>
          <span style={{ ...MONO, fontWeight: 600, color: "#64748B" }}>{lastRun}</span>
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PROJECT GRID (Hub main canvas)
// ─────────────────────────────────────────────────────────────────────────────
function ProjectGrid({ projects, onSelectProject, isDark, persona }: {
  projects: Project[]; onSelectProject: (p: Project) => void; isDark: boolean;
  persona?: "manager" | "monitor";
}) {
  const bg     = isDark ? "#020617" : "#F1F5F9";
  const cardBg = isDark ? "#0f172a" : "#FFFFFF";
  const text   = isDark ? "#F1F5F9" : "#0F172A";
  const muted  = isDark ? "#94A3B8" : "#64748B";
  const sub    = isDark ? "#64748B" : "#94A3B8";

  const statusColor = (s: Project["status"]) =>
    s === "healthy" ? "#00A63E" : s === "degraded" ? "#E19A04" : "#E7000B";

  const hasIncident = (p: Project) => p.criticalAlerts > 0 || p.highAlerts > 0;

  const [searchQ, setSearchQ] = useState("");
  const filtered = projects.filter(p => p.name.toLowerCase().includes(searchQ.toLowerCase()));

  return (
    <div className="flex-1 overflow-auto" style={{ background: bg }}>
      <div className="mx-auto p-8" style={{ maxWidth: "1200px" }}>

        {/* Page header */}
        <div style={{ marginBottom: "24px" }}>
          <div className="flex items-center gap-2" style={{ marginBottom: "8px" }}>
            <Globe className="w-4 h-4" style={{ color: "#00775B" }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ ...MONO, color: "#00775B" }}>
              GLOBAL HUB
            </span>
          </div>
          <div className="flex items-end justify-between" style={{ marginBottom: "16px" }}>
            <div>
              <h1 className="text-[28px] font-bold" style={{ ...INTER, color: text, letterSpacing: "-0.02em", marginBottom: "4px" }}>
                Projects Directory
              </h1>
              <p className="text-[14px]" style={{ ...INTER, color: muted, lineHeight: 1.6 }}>
                {projects.length} projects · Select a project to open its workspace
              </p>
            </div>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-[12px] font-semibold text-white"
              style={{ background: "#00775B", ...INTER, flexShrink: 0 }}>
              <Plus className="w-3.5 h-3.5" />
              New Project
            </button>
          </div>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: "360px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: isDark ? "#475569" : "#94A3B8", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search projects…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
              style={{
                width: "100%", height: 36, paddingLeft: 34, paddingRight: 10,
                fontSize: 13, ...INTER, color: isDark ? "#E2E8F0" : "#1E293B",
                background: isDark ? "#0f172a" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0"}`,
                borderRadius: 6, outline: "none",
              }}
            />
          </div>
        </div>

        {/* Org-wide stat tiles — v1.1 card spec */}
        <div className="grid grid-cols-2 lg:grid-cols-4" style={{ gap: "24px", marginBottom: "32px" }}>
          {[
            { label: "Total Projects",   value: projects.length,                                                                                                  icon: FolderOpen,    color: "#00775B" },
            { label: "Total Cameras",    value: projects.reduce((s, p) => s + p.cameras, 0),                                                                     icon: Camera,        color: "#8B5CF6" },
            ...(persona === "monitor"
              ? [{ label: "Active Applications", value: Object.values(PROJECT_APP_STATUS).reduce((s, a) => s + a.active, 0), icon: Zap,       color: "#00956D" }]
              : [{ label: "Active Pipelines",    value: projects.reduce((s, p) => s + p.pipelines, 0),                       icon: GitBranch, color: "#2B7FFF" }]),
            { label: "Critical Alerts",  value: projects.reduce((s, p) => s + p.criticalAlerts, 0),                                                              icon: AlertTriangle, color: "#E7000B" },
          ].map(stat => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} style={{ background: cardBg, border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`, borderRadius: "6px",
                padding: "24px", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                <div style={{ marginBottom: "16px" }}>
                  <div className="w-9 h-9 flex items-center justify-center rounded-[6px]"
                    style={{ background: stat.color + "12" }}>
                    <Icon className="w-4 h-4" style={{ color: stat.color }} />
                  </div>
                </div>
                <div className="text-[32px] font-bold leading-none" style={{ ...MONO,
                  color: text, fontVariantNumeric: "tabular-nums", letterSpacing: "-0.02em",
                  marginBottom: "6px" }}>
                  {stat.value}
                </div>
                <div className="text-[12px] font-semibold uppercase tracking-[0.05em]"
                  style={{ ...INTER, color: muted }}>
                  {stat.label}
                </div>
              </div>
            );
          })}
        </div>

        {/* Project cards — adaptive grid: high-density for monitor, 3-col for manager */}
        <div style={{
          display: "grid",
          gridTemplateColumns: persona === "monitor"
            ? "repeat(auto-fill, minmax(280px, 1fr))"
            : "repeat(3, 1fr)",
          gap: "16px",
          width: "100%",
        }}>
          {filtered.map(project => {
            const incident = hasIncident(project);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                incident={incident}
                isDark={isDark}
                cardBg={cardBg}
                text={text}
                sub={sub}
                statusColor={statusColor}
                onSelect={onSelectProject}
                persona={persona}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
}


// ─────────────────────────────────────────────────────────────────────────────
// CAMERA TILE — fills its grid cell, no aspect-ratio, Figma-exact overlays
// ─── Per-camera AI application catalogue ─────────────────────────────────────
const CAM_APPS: Record<string, { id: string; name: string }[]> = {
  "CAM-L01":  [{ id: "a1", name: "Intrusion Detection" }, { id: "a2", name: "People Counting" }, { id: "a3", name: "Zone Monitoring" }],
  "CAM-L02":  [{ id: "b1", name: "Face Recognition" }, { id: "b2", name: "Access Control" }, { id: "b3", name: "Behaviour Analysis" }],
  "CAM-P01":  [{ id: "c1", name: "Vehicle Detection" }, { id: "c2", name: "License Plate Reader" }, { id: "c3", name: "Loitering Alert" }],
  "CAM-S01":  [{ id: "d1", name: "Server Monitoring" }, { id: "d2", name: "Thermal Detection" }, { id: "d3", name: "Motion Sensor" }],
  "CAM-RC03": [{ id: "e1", name: "PPE Compliance" }, { id: "e2", name: "Queue Analytics" }, { id: "e3", name: "Crowd Density" }],
  "CAM-BE01": [{ id: "f1", name: "Perimeter Security" }, { id: "f2", name: "Tailgating Alert" }, { id: "f3", name: "Motion Detection" }],
  "CAM-T01":  [{ id: "g1", name: "Turnstile Analytics" }, { id: "g2", name: "Flow Monitoring" }, { id: "g3", name: "Access Control" }],
  "CAM-F03":  [{ id: "h1", name: "Fire Detection" }, { id: "h2", name: "Smoke Detection" }, { id: "h3", name: "PPE Compliance" }],
};

const APP_METRICS: Record<string, { label: string; value: string }[]> = {
  "Intrusion Detection":   [{ label: "Alerts Today", value: "4" }, { label: "Zones Active", value: "3" }, { label: "Last Event", value: "17:30" }],
  "People Counting":       [{ label: "Current Count", value: "12" }, { label: "Peak Today", value: "28" }, { label: "Avg Density", value: "Med" }],
  "Zone Monitoring":       [{ label: "Active Zones", value: "5" }, { label: "Violations", value: "2" }, { label: "Dwell Time", value: "4.2 m" }],
  "Face Recognition":      [{ label: "Matched", value: "8" }, { label: "Unknown", value: "1" }, { label: "Accuracy", value: "98.2%" }],
  "Access Control":        [{ label: "Granted", value: "47" }, { label: "Denied", value: "3" }, { label: "Last Entry", value: "17:25" }],
  "Behaviour Analysis":    [{ label: "Anomalies", value: "2" }, { label: "Tracked", value: "14" }, { label: "Conf.", value: "89.1%" }],
  "Vehicle Detection":     [{ label: "Vehicles", value: "9" }, { label: "Speed Avg", value: "18 km/h" }, { label: "Violations", value: "1" }],
  "License Plate Reader":  [{ label: "Plates Read", value: "31" }, { label: "Flagged", value: "2" }, { label: "Accuracy", value: "96.7%" }],
  "Loitering Alert":       [{ label: "Alerts", value: "3" }, { label: "Avg Dwell", value: "6.1 m" }, { label: "Active", value: "Yes" }],
  "Server Monitoring":     [{ label: "CPU Temp", value: "62°C" }, { label: "Anomalies", value: "0" }, { label: "Uptime", value: "99.9%" }],
  "Thermal Detection":     [{ label: "Hot Spots", value: "1" }, { label: "Max Temp", value: "71°C" }, { label: "Threshold", value: "65°C" }],
  "Motion Sensor":         [{ label: "Events", value: "11" }, { label: "False Pos.", value: "0" }, { label: "Sensitivity", value: "High" }],
  "PPE Compliance":        [{ label: "Violations", value: "2" }, { label: "Compliant", value: "94%" }, { label: "Workers", value: "7" }],
  "Queue Analytics":       [{ label: "Queue Len.", value: "6" }, { label: "Wait Time", value: "3.2 m" }, { label: "Throughput", value: "18/hr" }],
  "Crowd Density":         [{ label: "Current", value: "High" }, { label: "Count", value: "42" }, { label: "Alert Level", value: "1" }],
  "Perimeter Security":    [{ label: "Breaches", value: "0" }, { label: "Alerts", value: "1" }, { label: "Last Check", value: "17:28" }],
  "Tailgating Alert":      [{ label: "Events", value: "2" }, { label: "Prevented", value: "2" }, { label: "Conf.", value: "92.3%" }],
  "Motion Detection":      [{ label: "Events", value: "8" }, { label: "False Pos.", value: "1" }, { label: "Active", value: "Yes" }],
  "Turnstile Analytics":   [{ label: "In", value: "143" }, { label: "Out", value: "138" }, { label: "Net Flow", value: "+5" }],
  "Flow Monitoring":       [{ label: "Flow Rate", value: "22/m" }, { label: "Peak", value: "17:00" }, { label: "Congestion", value: "Low" }],
  "Fire Detection":        [{ label: "Alerts", value: "0" }, { label: "Temp Max", value: "24°C" }, { label: "Status", value: "Clear" }],
  "Smoke Detection":       [{ label: "Alerts", value: "0" }, { label: "AQI", value: "Good" }, { label: "Last Test", value: "06:00" }],
};

// ─────────────────────────────────────────────────────────────────────────────
function CameraTile({ cam, onClick, suppressAlerts = false }: {
  cam: CameraFeed; onClick?: () => void; suppressAlerts?: boolean;
}) {
  const alertColor = cam.alertSeverity === "critical" ? "#E7000B" : "#EA580C";
  const hasAlert   = cam.status === "alert" && !suppressAlerts;

  return (
    <div onClick={onClick}
      className="relative overflow-hidden flex flex-col w-full h-full"
      style={{
        background: "#0a1812",
        border: `1px solid ${hasAlert ? alertColor : "rgba(255,255,255,0.06)"}`,
        boxShadow: hasAlert ? `inset 0 0 0 1px ${alertColor}55` : undefined,
        cursor: onClick ? "pointer" : "default",
      }}>

      {/* Feed area — fills remaining height after bottom bar */}
      <div className="flex-1 relative flex items-center justify-center overflow-hidden"
        style={{ background: "#060f0c" }}>

        {/* Camera thumbnail */}
        <img src={cam.thumbnail} alt={cam.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{ opacity: cam.status === "offline" ? 0.25 : 0.82 }} />

        {/* Scanline texture overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-25"
          style={{ backgroundImage: "repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.18) 2px,rgba(0,0,0,0.18) 3px)" }} />

        {/* Subtle dark vignette */}
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.45) 100%)" }} />

        {/* Camera name — top left, Figma: dark pill */}
        <div className="absolute top-[3px] left-[3px] flex items-center h-[21px] px-[7px] rounded-[3px]"
          style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(2px)" }}>
          <span className="text-[10px] font-medium leading-none text-white truncate max-w-[140px]" style={INTER}>
            {cam.name}
          </span>
        </div>

        {/* Status dots — top right */}
        <div className="absolute top-[6px] right-[6px] flex items-center gap-[5px]">
          <span className="w-[6px] h-[6px] rounded-full"
            style={{ background: cam.status === "offline" ? "#475569" : "#059669", opacity: 0.85 }} />
          {hasAlert && (
            <span className="w-[6px] h-[6px] rounded-full" style={{ background: "#be123c" }} />
          )}
        </div>

        {/* Alert banner — full-width strip below the name label, Figma-exact */}
        {hasAlert && (
          <div className="absolute left-0 right-0 flex items-center gap-[8px] px-[12px]"
            style={{ top: "26px", height: "28px", background: alertColor,
                     boxShadow: `0 2px 8px ${alertColor}66` }}>
            <AlertTriangle className="w-[14px] h-[14px] text-white shrink-0" />
            <span className="text-[11px] font-bold text-white uppercase tracking-[0.3px] truncate" style={INTER}>
              {cam.alertType}
            </span>
          </div>
        )}
      </div>

      {/* Bottom bar — Figma: 24px, semi-transparent dark, LIVE + timestamp + cam id */}
      <div className="shrink-0 flex items-center justify-between border-t px-2"
        style={{ height: "24px", background: "rgba(0,0,0,0.72)",
                 borderColor: hasAlert ? `${alertColor}44` : "rgba(255,255,255,0.06)" }}>
        <div className="flex items-center gap-[5px]">
          <span className="w-[4px] h-[4px] rounded-full"
            style={{ background: hasAlert ? alertColor : "#059669",
                     boxShadow: hasAlert ? `0 0 4px ${alertColor}` : "0 0 4px #059669" }} />
          <span className="text-[10px] font-medium" style={{ ...MONO,
            color: hasAlert ? alertColor : "rgba(255,255,255,0.45)", letterSpacing: "0.1em" }}>
            {hasAlert ? cam.alertSeverity!.toUpperCase() : "LIVE"}
          </span>
        </div>
        <span className="text-[10px]" style={{ ...MONO, color: "rgba(203,213,225,0.55)" }}>
          {cam.timestamp}
        </span>
        <span className="text-[10px]" style={{ ...MONO, color: "rgba(255,255,255,0.28)" }}>
          {cam.id}
        </span>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE CARD  — matches project card design language
// ─────────────────────────────────────────────────────────────────────────────
function PipelineCard({ pipeline: p, isDark, cardBg, onClick }: {
  pipeline: Pipeline; isDark: boolean; cardBg: string; onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const alerts = PIPELINE_ALERT_COUNTS[p.id] ?? { critical: 0, high: 0 };
  const totalAlerts = alerts.critical + alerts.high;
  const sc = plStatusColor(p.status);

  const cardStyle: React.CSSProperties = {
    display: "flex",
    flexDirection: "column",
    padding: "14px 16px",
    height: "108px",
    background: cardBg,
    border: `1px solid ${hovered ? "#00956D" : isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`,
    borderRadius: "4px",
    boxSizing: "border-box",
    cursor: "pointer",
    transition: "transform 0.2s cubic-bezier(0.16,1,0.3,1), border-color 0.15s ease, box-shadow 0.15s ease",
    transform: hovered ? "translateY(-2px)" : "translateY(0)",
    boxShadow: hovered ? "0 6px 16px rgba(0,149,109,0.06)" : "none",
    width: "100%",
    textAlign: "left",
  };

  return (
    <button style={cardStyle}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}>

      {/* Top: name + alert badge */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <h3 className="truncate flex-1 min-w-0"
          style={{ ...INTER, fontSize: "12px", fontWeight: 700, textTransform: "uppercase",
                   letterSpacing: "0.04em", color: isDark ? "#F1F5F9" : "#1E293B", lineHeight: 1.2, margin: 0 }}>
          {p.name}
        </h3>
        {totalAlerts > 0 && (
          <span className="shrink-0 ml-3 inline-flex items-center gap-1"
            style={{ ...INTER, fontWeight: 700, fontSize: "10px",
                     padding: "2px 6px", borderRadius: "3px",
                     background: "rgba(239,68,68,0.10)", border: "1px solid #EF4444", color: "#EF4444" }}>
            <AlertTriangle className="w-2.5 h-2.5 shrink-0" />
            <span style={MONO}>{totalAlerts}</span> Alert{totalAlerts !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Middle: status + cameras */}
      <div style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px" }}>
        <span style={{ fontWeight: 600, color: sc }}>{plStatusLabel(p.status)}</span>
        <span style={{ color: isDark ? "#334155" : "#CBD5E1", marginInline: "2px" }}>·</span>
        <span style={{ ...MONO, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                       color: isDark ? "#94A3B8" : "#334155" }}>{p.cameras}</span>
        <span style={{ color: "#64748B" }}>Cams</span>
      </div>

      {/* Bottom: divider + uptime + open hint */}
      <div style={{
        display: "flex", alignItems: "center", justifyContent: "space-between",
        width: "100%", marginTop: "auto",
        borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#F1F5F9"}`, paddingTop: "8px",
      }}>
        <span style={{ ...INTER, fontSize: "11px", display: "flex", alignItems: "center", gap: "4px" }}>
          <span style={{ color: isDark ? "rgba(255,255,255,0.25)" : "#CBD5E1" }}>Uptime</span>
          <span style={{ ...MONO, fontWeight: 600, fontVariantNumeric: "tabular-nums",
                         color: isDark ? "#94A3B8" : "#334155" }}>{p.uptime}</span>
        </span>
        <span style={{ ...INTER, fontSize: "11px", fontWeight: 600, color: "#00775B",
                       opacity: hovered ? 1 : 0, transition: "opacity 0.15s" }}>
          Open →
        </span>
      </div>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PIPELINE TABLE  — v2.3 command grid aesthetic
// ─────────────────────────────────────────────────────────────────────────────
function PipelineTable({ pipelines, isDark, cardBg, onSelect }: {
  pipelines: Pipeline[]; isDark: boolean; cardBg: string;
  onSelect: (p: Pipeline) => void;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const teal    = isDark ? "#00956D" : "#00775B";
  const surface = isDark ? "#0F172A" : "#ffffff";
  const hdr     = isDark ? "#0A0F1A" : "#F8FAFC";
  const sec     = isDark ? "#94A3B8" : "#64748B";

  const runningCount = pipelines.filter(p => p.status === "running").length;
  const totalAlertCount = pipelines.reduce((acc, p) => {
    const a = PIPELINE_ALERT_COUNTS[p.id] ?? { critical: 0, high: 0 };
    return acc + a.critical + a.high;
  }, 0);

  const cols: { label: string; width: number | string }[] = [
    { label: "Pipeline",  width: "1fr"  },
    { label: "Status",    width: 120    },
    { label: "Cameras",   width: 90     },
    { label: "Uptime",    width: 90     },
    { label: "Alerts",    width: 100    },
    { label: "",          width: 80     },
  ];
  const gridTemplate = cols.map(c => typeof c.width === "number" ? `${c.width}px` : c.width).join(" ");

  return (
    <div style={{ borderRadius: 8, border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0", overflow: "hidden" }}>
      <div style={{ display: "flex", flexDirection: "column" }}>

        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px",
          backgroundColor: isDark ? "#0F172A" : surface,
          borderBottom: `2px solid ${teal}`,
        }}>
          <span style={{ ...INTER, fontSize: 13, fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A" }}>
            {runningCount}/{pipelines.length} running
          </span>
          <span style={{ color: isDark ? "#334155" : "#CBD5E1" }}>·</span>
          <span style={{ ...INTER, fontSize: 13, color: sec }}>
            {totalAlertCount > 0
              ? <><span style={MONO}>{totalAlertCount}</span> active alert{totalAlertCount !== 1 ? "s" : ""}</>
              : "No active alerts"}
          </span>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto", backgroundColor: surface }}>

          {/* Header row */}
          <div style={{
            display: "grid", gridTemplateColumns: gridTemplate,
            height: 44, alignItems: "center",
            backgroundColor: hdr,
            borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #E2E8F0",
            padding: "0 16px",
          }}>
            {cols.map(c => (
              <div key={c.label} style={{ paddingLeft: 8, paddingRight: 8 }}>
                <span style={{ ...INTER, fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const,
                               letterSpacing: "0.05em", color: isDark ? "#94A3B8" : "#1E293B" }}>
                  {c.label}
                </span>
              </div>
            ))}
          </div>

          {/* Rows */}
          {pipelines.map((p, idx) => {
            const alerts = PIPELINE_ALERT_COUNTS[p.id] ?? { critical: 0, high: 0 };
            const totalAlerts = alerts.critical + alerts.high;
            const sc = plStatusColor(p.status);
            const isHov = hoveredId === p.id;
            const rowBg = isHov
              ? (isDark ? "#0D2922" : "#EBF5F1")
              : idx % 2 === 1
                ? (isDark ? "#101B26" : "#F8FDFC")
                : (isDark ? "#0F172A" : "#ffffff");

            return (
              <div key={p.id}
                style={{
                  display: "grid", gridTemplateColumns: gridTemplate,
                  minHeight: 44, alignItems: "center",
                  backgroundColor: rowBg,
                  borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #F1F5F9",
                  padding: "0 16px",
                  position: "relative",
                  cursor: "pointer",
                  transition: "background-color 100ms ease",
                }}
                onClick={() => onSelect(p)}
                onMouseEnter={() => setHoveredId(p.id)}
                onMouseLeave={() => setHoveredId(null)}>

                {/* Severity left strip */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                  backgroundColor: sc,
                  opacity: isHov ? 1 : 0,
                  transition: "opacity 100ms ease",
                }} />

                {/* Pipeline name */}
                <div style={{ paddingLeft: 8, paddingRight: 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  <span style={{ ...INTER, fontSize: 12, fontWeight: 700, textTransform: "uppercase" as const,
                                 letterSpacing: "0.04em", color: isHov ? (isDark ? "#E2E8F0" : "#0F172A") : (isDark ? "#F1F5F9" : "#1E293B") }}>
                    {p.name}
                  </span>
                </div>

                {/* Status */}
                <div style={{ paddingLeft: 8 }}>
                  <span style={{ ...INTER, fontSize: 10, fontWeight: 600, padding: "2px 6px",
                                  borderRadius: 3, color: sc,
                                  background: `${sc}18`, border: `1px solid ${sc}40` }}>
                    {plStatusLabel(p.status)}
                  </span>
                </div>

                {/* Cameras */}
                <div style={{ paddingLeft: 8 }}>
                  <span style={{ ...MONO, fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums",
                                  color: isHov ? (isDark ? "#E2E8F0" : "#0F172A") : sec }}>
                    {p.cameras}
                  </span>
                </div>

                {/* Uptime */}
                <div style={{ paddingLeft: 8 }}>
                  <span style={{ ...MONO, fontSize: 12, fontWeight: 500, fontVariantNumeric: "tabular-nums",
                                  color: p.uptime === "—"
                                    ? (isDark ? "#475569" : "#CBD5E1")
                                    : isHov ? (isDark ? "#E2E8F0" : "#0F172A") : sec }}>
                    {p.uptime}
                  </span>
                </div>

                {/* Alerts */}
                <div style={{ paddingLeft: 8 }}>
                  {totalAlerts > 0 ? (
                    <span style={{ ...INTER, fontSize: 10, fontWeight: 700, padding: "2px 6px",
                                    borderRadius: 3, background: "rgba(239,68,68,0.10)",
                                    border: "1px solid #EF4444", color: "#EF4444",
                                    display: "inline-flex", alignItems: "center", gap: 4 }}>
                      <AlertTriangle style={{ width: 10, height: 10 }} />
                      <span style={MONO}>{totalAlerts}</span>
                    </span>
                  ) : (
                    <span style={{ ...INTER, fontSize: 12, color: isDark ? "#334155" : "#CBD5E1" }}>—</span>
                  )}
                </div>

                {/* Open */}
                <div style={{ paddingLeft: 8, textAlign: "right" as const }}>
                  <span style={{ ...INTER, fontSize: 11, fontWeight: 600, color: teal,
                                  opacity: isHov ? 1 : 0.4, transition: "opacity 150ms" }}>
                    Open →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// LIVE STREAMING PAGE — dual-state pipeline architecture
// ─────────────────────────────────────────────────────────────────────────────
function plStatusColor(s: Pipeline["status"]) {
  return s === "running" ? "#00A63E" : s === "degraded" ? "#E19A04" : "#EF4444";
}
function plStatusLabel(s: Pipeline["status"]) {
  return s === "running" ? "RUNNING" : s === "degraded" ? "DEGRADED" : "STOPPED";
}

function LiveStreamingPage({ pipeline, projectPipelines, onSelectPipeline, isDark, isPipelineActive, persona, onIncidentClick }: {
  pipeline: Pipeline | null; projectPipelines: Pipeline[];
  onSelectPipeline: (p: Pipeline) => void; isDark: boolean;
  isPipelineActive: boolean;
  persona: "manager" | "monitor";
  onIncidentClick: (incident: MockIncident) => void;
}) {
  // Monitor persona: auto-select first pipeline so they never see the chooser
  const effectivePipeline = persona === "monitor" ? (pipeline ?? MOCK_PIPELINES[0]) : pipeline;
  const bg     = isDark ? "#020617" : "#F1F5F9";
  const cardBg = isDark ? "#0f172a" : "#FFFFFF";
  const border = isDark ? "rgba(0,119,91,0.2)" : "#D1FAE5";
  const text   = isDark ? "#F1F5F9" : "#0F172A";
  const muted  = isDark ? "#94A3B8" : "#64748B";

  const [pipelineView, setPipelineView] = useState<"grid" | "table">("grid");
  const [gridLayout, setGridLayout] = useState<1|2|3|4>(4);
  const [selectedCamId, setSelectedCamId] = useState(MOCK_CAMERAS[0].id);
  const [camPage, setCamPage] = useState(1);
  const [plSearchQ, setPlSearchQ] = useState("");

  // Focus view: null = grid, string = focused camera id
  const [focusedCamId, setFocusedCamId] = useState<string | null>(null);
  const [focusVisible, setFocusVisible] = useState(false);

  // Per-camera selected application (only matters when active)
  const [selectedApps, setSelectedApps] = useState<Record<string, string>>({});

  // Animate focus in
  const openFocus = (camId: string) => {
    setFocusedCamId(camId);
    requestAnimationFrame(() => requestAnimationFrame(() => setFocusVisible(true)));
  };
  const closeFocus = () => {
    setFocusVisible(false);
    setTimeout(() => setFocusedCamId(null), 280);
  };

  // ── No pipeline selected — pipeline chooser (manager only) ──────────────
  if (!effectivePipeline) {
    const pipelines = projectPipelines.length > 0 ? projectPipelines : MOCK_PIPELINES.filter(p => p.projectId === "p1");
    const runningCount = pipelines.filter(p => p.status === "running").length;
    const alertCount = pipelines.reduce((acc, p) => {
      const a = PIPELINE_ALERT_COUNTS[p.id] ?? { critical: 0, high: 0 };
      return acc + a.critical + a.high;
    }, 0);
    const filteredPipelines = pipelines.filter(p => p.name.toLowerCase().includes(plSearchQ.toLowerCase()));

    return (
      <div className="flex-1 overflow-auto" style={{ background: bg }}>
        <div className="max-w-[1200px] mx-auto p-8">

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <Video className="w-5 h-5" style={{ color: "#00775B" }} />
            <span className="text-[11px] font-bold tracking-widest uppercase" style={{ ...MONO, color: "#00775B" }}>LIVE STREAMING</span>
          </div>
          <div className="flex items-end justify-between mb-4">
            <div>
              <h1 className="text-[22px] font-bold mb-1" style={{ ...INTER, color: text }}>
                Select a pipeline
              </h1>
              <p className="text-[13px]" style={{ ...INTER, color: muted }}>
                {runningCount}/{pipelines.length} running · {alertCount} active alerts
              </p>
            </div>
            {/* Layout toggle */}
            <div className="flex items-center gap-px p-0.5 rounded-[4px]"
              style={{ background: isDark ? "#1e293b" : "#E2E8F0" }}>
              {([["grid", <svg key="g" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="5.5" height="5.5" rx="0.5"/><rect x="7.5" y="1" width="5.5" height="5.5" rx="0.5"/><rect x="1" y="7.5" width="5.5" height="5.5" rx="0.5"/><rect x="7.5" y="7.5" width="5.5" height="5.5" rx="0.5"/></svg>], ["table", <svg key="t" width="14" height="14" viewBox="0 0 14 14" fill="currentColor"><rect x="1" y="1" width="12" height="2.5" rx="0.5"/><rect x="1" y="5" width="12" height="2.5" rx="0.5"/><rect x="1" y="9" width="12" height="2.5" rx="0.5"/><rect x="1" y="11.5" width="12" height="1" rx="0.5"/></svg>]] as const).map(([view, icon]) => (
                <button key={view} onClick={() => setPipelineView(view)}
                  className="flex items-center justify-center w-8 h-7 rounded-[3px] transition-all"
                  style={{
                    background: pipelineView === view ? (isDark ? "#0f172a" : "#fff") : "transparent",
                    color: pipelineView === view ? "#00775B" : isDark ? "#64748B" : "#94A3B8",
                    boxShadow: pipelineView === view ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
                  }}>
                  {icon}
                </button>
              ))}
            </div>
          </div>
          {/* Search */}
          <div style={{ position: "relative", maxWidth: "360px", marginBottom: "20px" }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: isDark ? "#475569" : "#94A3B8", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search pipelines…"
              value={plSearchQ}
              onChange={e => setPlSearchQ(e.target.value)}
              style={{
                width: "100%", height: 36, paddingLeft: 34, paddingRight: 10,
                fontSize: 13, ...INTER, color: isDark ? "#E2E8F0" : "#1E293B",
                background: isDark ? "#0f172a" : "#fff",
                border: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0"}`,
                borderRadius: 6, outline: "none",
              }}
            />
          </div>

          {/* Grid view */}
          {pipelineView === "grid" && (
            <div className="grid grid-cols-2 md:grid-cols-3 [@media(min-width:1900px)]:grid-cols-4" style={{ gap: "24px" }}>
              {filteredPipelines.map(p => (
                <PipelineCard key={p.id} pipeline={p} isDark={isDark} cardBg={cardBg}
                  onClick={() => { onSelectPipeline(p); }} />
              ))}
            </div>
          )}

          {/* Table view */}
          {pipelineView === "table" && (
            <PipelineTable pipelines={filteredPipelines} isDark={isDark} cardBg={cardBg}
              onSelect={p => { onSelectPipeline(p); }} />
          )}

        </div>
      </div>
    );
  }

  // ── Pipeline selected — full VMS layout ───────────────────────────────────
  const criticalCount = MOCK_CAMERAS.filter(c => c.alertSeverity === "critical").length;
  const highCount     = MOCK_CAMERAS.filter(c => c.alertSeverity === "high").length;
  const selectedCam   = MOCK_CAMERAS.find(c => c.id === selectedCamId) ?? MOCK_CAMERAS[0];

  // Grid layout SVG icons (Figma-matched: 1×1, 2×2, 3×3, 4×4)
  const GRID_ICONS: Record<number, React.ReactNode> = {
    1: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor"><rect x="2" y="2" width="12" height="12"/></svg>,
    2: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
         <rect x="2" y="2" width="5.5" height="5.5"/><rect x="8.5" y="2" width="5.5" height="5.5"/>
         <rect x="2" y="8.5" width="5.5" height="5.5"/><rect x="8.5" y="8.5" width="5.5" height="5.5"/>
       </svg>,
    3: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
         {[0,1,2].flatMap(r => [0,1,2].map(c =>
           <rect key={`${r}${c}`} x={2+c*4.7} y={2+r*4.7} width="3.7" height="3.7"/>
         ))}
       </svg>,
    4: <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
         {[0,1,2,3].flatMap(r => [0,1,2,3].map(c =>
           <rect key={`${r}${c}`} x={2+c*3.4} y={2+r*3.4} width="2.6" height="2.6"/>
         ))}
       </svg>,
  };

  // Build camera grid for current layout
  // 4-col: featured cam spans 2×2 (top-left), remaining 7 fill the rest
  // Grid: 4 cols × 3 rows = 12 cells; featured takes 4 cells; 8 remaining for 7 cams
  const totalCells = gridLayout === 1 ? 1 : gridLayout === 2 ? 4 : gridLayout === 3 ? 9 : 16;
  const camCount   = gridLayout === 4 ? Math.min(MOCK_CAMERAS.length - 1, 14) : Math.min(MOCK_CAMERAS.length, totalCells - (gridLayout === 4 ? 3 : 0));
  const otherCams  = MOCK_CAMERAS.filter(c => c.id !== selectedCamId).slice(0, gridLayout === 4 ? 11 : totalCells - 1);
  const gridRows   = gridLayout === 1 ? 1 : gridLayout === 2 ? 2 : gridLayout === 3 ? 3 : 3;
  const gridCols   = gridLayout;

  const totalPages = Math.ceil(MOCK_CAMERAS.length / Math.max(1, totalCells - (gridLayout === 4 ? 3 : 0)));

  return (
    <div className="flex overflow-hidden" style={{ flex: 1, minHeight: 0, background: "#040f0b" }}>

      {/* ── LEFT: Camera Directory ─────────────────────────────────────────── */}
      <div className="shrink-0 flex flex-col border-r"
        style={{ width: "220px", background: "#050e0b", borderColor: "rgba(255,255,255,0.07)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-3 border-b shrink-0"
          style={{ height: "40px", borderColor: "rgba(255,255,255,0.07)" }}>
          <span className="text-[12px] font-semibold text-white" style={INTER}>Camera Directory</span>
          <div className="flex items-center gap-1">
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
              <Search className="w-3.5 h-3.5" style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
            <button className="w-6 h-6 flex items-center justify-center rounded hover:bg-white/5 transition-colors">
              <SlidersHorizontal className="w-3 h-3" style={{ color: "rgba(255,255,255,0.4)" }} />
            </button>
          </div>
        </div>

        {/* Camera list — scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ scrollbarWidth: "none" }}>
          {MOCK_CAMERAS.map(cam => {
            const isSel      = cam.id === selectedCamId;
            const alertColor = cam.alertSeverity === "critical" ? "#E7000B"
                             : cam.alertSeverity === "high"     ? "#EA580C" : null;
            return (
              <button key={cam.id}
                onClick={() => setSelectedCamId(cam.id)}
                className="w-full text-left flex items-center gap-2 px-3 py-0 transition-colors border-l-2"
                style={{
                  height: "44px",
                  background: isSel ? "rgba(0,119,91,0.12)" : "transparent",
                  borderLeftColor: isSel ? "#00775B" : "transparent",
                }}>
                <div className="flex-1 min-w-0">
                  <div className="text-[11.5px] font-semibold leading-tight truncate"
                    style={{ ...INTER, color: isSel ? "#34D399" : "rgba(255,255,255,0.82)" }}>
                    {cam.name}
                  </div>
                  <div className="text-[10px] leading-tight mt-[2px] truncate"
                    style={{ ...INTER, color: "rgba(255,255,255,0.32)" }}>
                    {cam.location}
                  </div>
                </div>
                {alertColor ? (
                  <span className="shrink-0 text-[9px] font-bold px-[5px] py-[2px] text-white uppercase"
                    style={{ ...MONO, background: alertColor, borderRadius: "2px", letterSpacing: "0.04em" }}>
                    {cam.alertSeverity}
                  </span>
                ) : (
                  <span className="shrink-0 w-[7px] h-[7px] rounded-full"
                    style={{ background: cam.status === "online" ? "#059669" : "#475569", opacity: 0.8 }} />
                )}
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t flex items-center justify-between px-3"
          style={{ height: "32px", borderColor: "rgba(255,255,255,0.07)" }}>
          <span className="text-[10px]" style={{ ...MONO, color: "rgba(255,255,255,0.28)" }}>
            Viewing 1/{MOCK_CAMERAS.length} · {MOCK_CAMERAS.length}
          </span>
          <div className="flex items-center gap-0.5">
            <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5">
              <ChevronLeft className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
            <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-white/5">
              <ChevronRight className="w-3 h-3" style={{ color: "rgba(255,255,255,0.3)" }} />
            </button>
          </div>
        </div>
      </div>

      {/* ── RIGHT: Controls + Camera Grid ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* ── Controls bar ─────────────────────────────────────────────────── */}
        <div className="shrink-0 flex items-center gap-2 px-3 border-b"
          style={{ height: "49px", background: "#040f0b", borderColor: "rgba(255,255,255,0.07)" }}>

          {/* Grid layout toggles */}
          <div className="flex items-center gap-[1px] rounded-[4px] p-[2px]"
            style={{ background: "rgba(255,255,255,0.06)" }}>
            {([1,2,3,4] as const).map(n => (
              <button key={n} onClick={() => setGridLayout(n)}
                className="flex items-center justify-center rounded-[3px] transition-colors"
                style={{ width: "30px", height: "26px",
                         background: gridLayout === n ? "rgba(0,119,91,0.4)" : "transparent",
                         color: gridLayout === n ? "#34D399" : "rgba(255,255,255,0.35)" }}>
                {GRID_ICONS[n]}
              </button>
            ))}
          </div>

          {/* Alert pills — active only */}
          {isPipelineActive && (
            <div className="flex items-center gap-2 ml-2">
              {criticalCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 rounded-[4px]"
                  style={{ height: "30px", background: "rgba(231,0,11,0.14)", border: "1px solid rgba(231,0,11,0.28)" }}>
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#E7000B" }} />
                  <span className="text-[12px] font-semibold" style={{ ...INTER, color: "#E7000B" }}>{criticalCount} Critical</span>
                </div>
              )}
              {highCount > 0 && (
                <div className="flex items-center gap-1.5 px-3 rounded-[4px]"
                  style={{ height: "30px", background: "rgba(234,88,12,0.14)", border: "1px solid rgba(234,88,12,0.28)" }}>
                  <AlertTriangle className="w-3.5 h-3.5" style={{ color: "#EA580C" }} />
                  <span className="text-[12px] font-semibold" style={{ ...INTER, color: "#EA580C" }}>{highCount} High</span>
                </div>
              )}
            </div>
          )}

          <div className="flex-1" />

          {/* Assign Applications — visible only when active and manager persona */}
          {isPipelineActive && persona === "manager" && (
            <button
              className="flex items-center gap-1.5 px-4 rounded-[4px] text-[11px] font-semibold uppercase tracking-[0.03em]"
              style={{
                height: "32px",
                background: "rgba(0,149,109,0.10)",
                border: "1px solid rgba(0,149,109,0.35)",
                color: "#00956D",
                transition: "background 0.2s cubic-bezier(0.16,1,0.3,1)",
                ...INTER,
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,149,109,0.20)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,149,109,0.10)"; }}
            >
              <Tag className="w-3.5 h-3.5" />
              Assign Applications
            </button>
          )}
        </div>

        {/* ── Context guidance banner ───────────────────────────────────────── */}
        {!isPipelineActive ? (
          persona === "manager" ? (
            <div className="shrink-0 flex items-center gap-3 px-4 py-0 border-b"
              style={{ height: "40px", background: "rgba(239,68,68,0.06)", borderColor: "rgba(239,68,68,0.18)" }}>
              <span className="text-[11px]" style={{ ...INTER, color: "rgba(239,68,68,0.85)" }}>
                ⚠️ Pipeline Offline. Select a project and pipeline above, then click <strong style={{ color: "#EF4444" }}>Start Pipeline</strong> to engage the inference engine.
              </span>
            </div>
          ) : (
            !focusedCamId && (
              <div className="shrink-0 flex items-center gap-3 px-4 py-0 border-b"
                style={{ height: "40px", background: "rgba(239,68,68,0.04)", borderColor: "rgba(239,68,68,0.12)" }}>
                <span className="text-[11px]" style={{ ...INTER, color: "rgba(239,68,68,0.65)" }}>
                  Applications are currently disabled. Click a camera to view the stream.
                </span>
              </div>
            )
          )
        ) : (
          !focusedCamId && (
            <div className="shrink-0 flex items-center gap-3 px-4 py-0 border-b"
              style={{ height: "40px", background: "rgba(0,149,109,0.06)", borderColor: "rgba(0,149,109,0.18)" }}>
              <span className="text-[11px]" style={{ ...INTER, color: "#00956D" }}>
                💡 {persona === "monitor" ? "Live feeds active. Click any camera to maximize and select an application." : "Inference Active. Click any camera tile below to maximize view and configure live models."}
              </span>
            </div>
          )
        )}

        {/* ── Camera Grid — fills all remaining height ─────────────────────── */}
        <div className="flex-1 overflow-hidden relative" style={{ background: "#040f0b" }}>
          {gridLayout === 1 ? (
            <div className="w-full h-full p-[4px]">
              <CameraTile cam={selectedCam} suppressAlerts={!isPipelineActive}
                onClick={() => openFocus(selectedCam.id)} />
            </div>
          ) : (
            <div className="w-full h-full" style={{
              display: "grid", gap: "4px", padding: "4px",
              gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
              gridTemplateRows: `repeat(${gridRows}, 1fr)`,
            }}>
              <div style={gridLayout === 4 ? { gridColumn: "1 / span 2", gridRow: "1 / span 2" } : {}}>
                <CameraTile cam={selectedCam} suppressAlerts={!isPipelineActive}
                  onClick={() => openFocus(selectedCam.id)} />
              </div>
              {otherCams.map(cam => (
                <div key={cam.id}>
                  <CameraTile cam={cam} suppressAlerts={!isPipelineActive}
                    onClick={() => openFocus(cam.id)} />
                </div>
              ))}
            </div>
          )}

          {/* ── Focus View overlay ─────────────────────────────────────────── */}
          {focusedCamId && (() => {
            const focCam   = MOCK_CAMERAS.find(c => c.id === focusedCamId)!;
            const apps     = CAM_APPS[focusedCamId] ?? [];
            const selApp   = selectedApps[focusedCamId] ?? "";
            const EASE     = "cubic-bezier(0.16,1,0.3,1)";
            const inc      = MOCK_INCIDENTS.find(i => i.camera === focCam.id);
            const app      = apps.find(a => a.id === selApp);
            const appsOn   = isPipelineActive; // apps available only when pipeline active
            const GLASS    = "rgba(8,22,18,0.72)";
            const GLASS_BD = "rgba(255,255,255,0.10)";
            return (
              <div className="absolute inset-0 z-30 flex flex-col"
                style={{
                  background: "#040f0b",
                  opacity: focusVisible ? 1 : 0,
                  transform: focusVisible ? "scale(1)" : "scale(0.97)",
                  transition: `opacity 0.3s ${EASE}, transform 0.3s ${EASE}`,
                }}>

                {/* Slim top bar — back + camera name + status chip */}
                <div className="shrink-0 flex items-center gap-3 px-4 border-b"
                  style={{ height: "44px", background: "#040f0b", borderColor: "rgba(255,255,255,0.07)" }}>
                  <button onClick={closeFocus}
                    className="flex items-center gap-1.5 text-[11px] font-semibold px-3 py-1.5 rounded-[4px] hover:bg-white/8 transition-colors"
                    style={{ ...INTER, color: "rgba(255,255,255,0.55)", border: "1px solid rgba(255,255,255,0.1)", textTransform: "uppercase", letterSpacing: "0.03em" }}>
                    <ChevronLeft className="w-3.5 h-3.5" />Back to Grid
                  </button>
                  <div className="w-px h-4 shrink-0" style={{ background: "rgba(255,255,255,0.1)" }} />
                  <span className="text-[13px] font-semibold text-white" style={INTER}>{focCam.name}</span>
                  <span className="text-[11px]" style={{ ...MONO, color: "rgba(255,255,255,0.3)" }}>{focCam.location}</span>
                  <div className="flex-1" />
                  {/* Status chip — wording differs by persona */}
                  <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{
                      background: appsOn ? "rgba(0,149,109,0.12)" : "rgba(239,68,68,0.10)",
                      border: `1px solid ${appsOn ? "rgba(0,149,109,0.3)" : "rgba(239,68,68,0.3)"}`,
                      color: appsOn ? "#00956D" : "#EF4444",
                      ...MONO,
                    }}>
                    <span className="w-[5px] h-[5px] rounded-full shrink-0 mr-1"
                      style={{ background: appsOn ? "#00956D" : "#EF4444" }} />
                    {appsOn
                      ? (persona === "monitor" ? "Applications Active" : "Pipeline Active")
                      : (persona === "monitor" ? "Applications Disabled" : "Pipeline Inactive")}
                  </div>
                </div>

                {/* Full-canvas video — all overlays sit on top */}
                <div className="flex-1 relative overflow-hidden">
                  <CameraTile cam={focCam} suppressAlerts={!appsOn} />

                  {/* ── Glassmorphic app selector — top-right corner ── */}
                  <div className="absolute top-4 right-4 z-10"
                    style={{
                      background: GLASS,
                      border: `1px solid ${GLASS_BD}`,
                      borderRadius: "8px",
                      backdropFilter: "blur(14px)",
                      WebkitBackdropFilter: "blur(14px)",
                      minWidth: "220px",
                    }}>
                    {appsOn ? (
                      <div className="relative px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1.5" style={{ ...MONO, color: "rgba(255,255,255,0.38)" }}>Application</p>
                        <div className="relative">
                          <select
                            value={selApp}
                            onChange={e => setSelectedApps(p => ({ ...p, [focusedCamId]: e.target.value }))}
                            className="w-full appearance-none pl-2.5 pr-7 text-white outline-none rounded-[4px]"
                            style={{
                              height: "34px",
                              background: selApp ? "rgba(0,149,109,0.15)" : "rgba(255,255,255,0.07)",
                              border: `1px solid ${selApp ? "rgba(0,149,109,0.45)" : "rgba(255,255,255,0.12)"}`,
                              fontFamily: "Inter, sans-serif",
                              fontSize: "13px",
                              cursor: "pointer",
                            }}>
                            <option value="" style={{ background: "#0a1f18" }}>— Select application —</option>
                            {apps.map(a => (
                              <option key={a.id} value={a.id} style={{ background: "#0a1f18" }}>{a.name}</option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 pointer-events-none"
                            style={{ color: "rgba(255,255,255,0.4)" }} />
                        </div>
                        {selApp && (
                          <>
                            {APP_METRICS[app?.name ?? ""] && (
                              <div className="mt-2.5 pt-2.5 border-t" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
                                <div className="grid grid-cols-3 gap-x-3 gap-y-2">
                                  {APP_METRICS[app!.name].map(m => (
                                    <div key={m.label}>
                                      <p className="text-[8px] uppercase tracking-wider leading-tight" style={{ ...MONO, color: "rgba(255,255,255,0.32)" }}>{m.label}</p>
                                      <p className="text-[13px] font-bold tabular-nums text-white leading-tight mt-0.5" style={MONO}>{m.value}</p>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    ) : (
                      <div className="px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-widest mb-1" style={{ ...MONO, color: "rgba(255,255,255,0.38)" }}>Application</p>
                        <p className="text-[11px] font-medium" style={{ ...INTER, color: "rgba(239,68,68,0.7)" }}>
                          {persona === "monitor" ? "Applications disabled" : "Start pipeline to enable"}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* ── Bounding box — when app active + incident ── */}
                  {appsOn && selApp && inc && (
                    <div className="absolute pointer-events-none"
                      style={{ top: "22%", left: "18%", width: "38%", height: "44%",
                        border: `2px solid ${inc.severity === "critical" ? "#E7000B" : "#EA580C"}`,
                        boxShadow: `0 0 16px ${inc.severity === "critical" ? "#E7000B55" : "#EA580C55"}`,
                        borderRadius: "2px" }}>
                      <span className="absolute -top-5 left-0 text-[9px] font-bold text-white px-1.5 py-0.5 rounded-[2px]"
                        style={{ background: inc.severity === "critical" ? "#E7000B" : "#EA580C", ...MONO }}>
                        {inc.detectedObjects?.[0]} 91%
                      </span>
                    </div>
                  )}

                  {/* ── Alert action banner — bottom, when app active + incident ── */}
                  {appsOn && selApp && inc && (
                    <button
                      onClick={() => onIncidentClick(MOCK_INCIDENTS.find(x => x.camera === focCam.id)!)}
                      className="absolute bottom-4 left-4 z-10 flex items-center gap-2.5 px-4 py-2.5 rounded-[6px] transition-opacity hover:opacity-90"
                      style={{
                        background: inc.severity === "critical" ? "rgba(231,0,11,0.82)" : "rgba(234,88,12,0.82)",
                        border: `1px solid ${inc.severity === "critical" ? "#E7000B" : "#EA580C"}`,
                        backdropFilter: "blur(10px)",
                        WebkitBackdropFilter: "blur(10px)",
                      }}>
                      <AlertTriangle className="w-4 h-4 text-white shrink-0" />
                      <div>
                        <p className="text-[11px] font-bold text-white uppercase tracking-wide leading-tight" style={INTER}>{inc.title}</p>
                        <p className="text-[10px] text-white/60 leading-tight mt-0.5" style={INTER}>Tap to view incident details →</p>
                      </div>
                    </button>
                  )}

                  {/* Passive overlay when no app selected and apps are on */}
                  {appsOn && !selApp && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 px-4 py-2 rounded-[6px]"
                      style={{ background: GLASS, border: `1px solid ${GLASS_BD}`, backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}>
                      <Zap className="w-3.5 h-3.5 shrink-0" style={{ color: "#00956D" }} />
                      <span className="text-[12px] font-medium" style={{ ...INTER, color: "rgba(255,255,255,0.65)" }}>
                        Select an application above to enable inference overlays
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}
        </div>

        {/* Pagination */}
        <div className="shrink-0 flex items-center justify-center gap-3 border-t"
          style={{ height: "36px", background: "#040f0b", borderColor: "rgba(255,255,255,0.06)" }}>
          <button onClick={() => setCamPage(p => Math.max(1, p-1))}
            className="flex items-center gap-1 px-2 rounded text-[11px] hover:bg-white/5 transition-colors"
            style={{ ...INTER, color: "rgba(255,255,255,0.4)" }}>
            <ChevronLeft className="w-3 h-3" /> Prev
          </button>
          <span className="text-[11px]" style={{ ...MONO, color: "rgba(255,255,255,0.28)" }}>
            Page {camPage} of {Math.max(1, totalPages)}
          </span>
          <button onClick={() => setCamPage(p => Math.min(Math.max(1, totalPages), p+1))}
            className="flex items-center gap-1 px-2 rounded text-[11px] hover:bg-white/5 transition-colors"
            style={{ ...INTER, color: "rgba(255,255,255,0.4)" }}>
            Next <ChevronRight className="w-3 h-3" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENT DETAIL MODAL
// ─────────────────────────────────────────────────────────────────────────────
function IncidentDetailModal({ incident, onClose }: { incident: MockIncident; onClose: () => void }) {
  const alertColor = incident.severity === "critical" ? "#E7000B" : incident.severity === "high" ? "#EA580C" : "#E19A04";

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[880px] max-h-[90vh] overflow-hidden rounded-[12px] shadow-2xl"
        style={{ border: "1px solid rgba(0,119,91,0.25)" }}>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b"
          style={{ background: "#001E18", borderColor: "rgba(0,119,91,0.2)" }}>
          <div className="flex items-center gap-3">
            <div className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider text-white"
              style={{ background: alertColor, ...MONO }}>
              {incident.severity}
            </div>
            <h2 className="text-[13px] font-bold text-white uppercase tracking-wider" style={INTER}>
              Incident Details · {incident.incidentId}
            </h2>
          </div>
          <button onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-[6px] text-white transition-colors hover:bg-white/10">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
          </button>
        </div>

        <div className="flex overflow-hidden" style={{ maxHeight: "calc(90vh - 64px)" }}>
          {/* Left: Camera feed */}
          <div className="w-[56%] relative flex items-center justify-center"
            style={{ background: "#050d1a", minHeight: "460px" }}>
            {/* Grid bg */}
            <div className="absolute inset-0 opacity-[0.05]"
              style={{ backgroundImage: "repeating-linear-gradient(0deg,#00775B,#00775B 1px,transparent 1px,transparent 40px),repeating-linear-gradient(90deg,#00775B,#00775B 1px,transparent 1px,transparent 40px)" }} />

            {/* Alert banner at top of feed */}
            <div className="absolute left-0 right-0 top-0 flex items-center gap-2 px-4 py-2"
              style={{ background: alertColor }}>
              <AlertTriangle className="w-4 h-4 text-white shrink-0" />
              <span className="text-[12px] font-bold text-white tracking-wide uppercase" style={INTER}>{incident.title}</span>
            </div>

            <Camera className="w-16 h-16 opacity-10" style={{ color: "#00775B" }} />

            {/* LIVE badge */}
            <div className="absolute top-12 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full"
              style={{ background: "rgba(231,0,11,0.85)", border: "1px solid rgba(255,255,255,0.2)" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-bold text-white" style={MONO}>LIVE FEED</span>
            </div>

            {/* Bottom overlays */}
            <div className="absolute bottom-4 left-4 flex items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px]"
                style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span className="text-[10px] font-mono text-white">{incident.timestamp}</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-[4px]"
                style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)", border: "1px solid rgba(255,255,255,0.1)" }}>
                <Video className="w-3.5 h-3.5 text-white" />
                <span className="text-[10px] font-bold text-white">{incident.camera}</span>
              </div>
            </div>
            <button className="absolute bottom-4 right-4 flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] transition-colors"
              style={{ background: "rgba(0,0,0,0.8)", border: "1px solid rgba(255,255,255,0.15)", backdropFilter: "blur(4px)" }}>
              <Video className="w-3.5 h-3.5 text-white" />
              <span className="text-[10px] font-bold text-white uppercase tracking-wider">View Live</span>
            </button>
          </div>

          {/* Right: Details */}
          <div className="w-[44%] flex flex-col overflow-hidden" style={{ background: "#FAFAFA" }}>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">

              {/* Incident info */}
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ ...MONO, color: "#00775B" }}>Incident Information</span>
                  <span className="text-[10px] text-neutral-400" style={MONO}>{incident.incidentId} ⧉</span>
                </div>
                <div className="bg-white rounded-[8px] border border-neutral-200 p-4">
                  <h4 className="text-[15px] font-bold text-neutral-900 mb-2" style={INTER}>{incident.title}</h4>
                  <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wider text-white"
                    style={{ background: alertColor, ...MONO }}>{incident.severity}</div>
                  <p className="text-[12px] text-neutral-500 mt-3 italic" style={INTER}>
                    "Anomaly detected by AI inference pipeline — requires immediate review."
                  </p>
                </div>
              </div>

              {/* Location & Camera */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Location", value: incident.location, icon: <MapPin className="w-4 h-4" style={{ color: "#00775B" }} /> },
                  { label: "Camera Source", value: incident.camera, icon: <Video className="w-4 h-4" style={{ color: "#00775B" }} /> },
                ].map(item => (
                  <div key={item.label}>
                    <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ ...MONO, color: "#64748B" }}>{item.label}</div>
                    <div className="bg-white rounded-[6px] border border-neutral-200 p-3 flex items-center gap-2">
                      {item.icon}
                      <span className="text-[12px] font-bold text-neutral-900" style={INTER}>{item.value}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Detected objects */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ ...MONO, color: "#64748B" }}>Detected Objects</div>
                <div className="flex flex-wrap gap-2">
                  {incident.detectedObjects.map(obj => (
                    <span key={obj} className="px-2 py-1 rounded-[4px] text-[10px] font-bold uppercase tracking-wider text-white"
                      style={{ background: "#00775B", ...MONO }}>{obj}</span>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ ...MONO, color: "#64748B" }}>Incident Timeline</div>
                <div className="bg-white rounded-[8px] border border-neutral-200 p-4 space-y-3">
                  {[
                    { label: "Incident Viewed", time: "Now", actor: "Admin User", dot: "#00775B" },
                    { label: "Alert Triggered", time: "-2m", actor: "AI Pipeline", dot: "#94A3B8" },
                    { label: "Detection Confirmed", time: "-3m", actor: "Inference Engine", dot: "#94A3B8" },
                  ].map(ev => (
                    <div key={ev.label} className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: ev.dot }} />
                      <div>
                        <div className="text-[12px] font-bold text-neutral-900" style={INTER}>{ev.label}</div>
                        <div className="text-[10px] text-neutral-500 flex items-center gap-1" style={MONO}>
                          <span>{ev.time}</span><span className="opacity-40">·</span>
                          <span style={{ color: ev.dot !== "#94A3B8" ? "#00775B" : undefined }}>{ev.actor}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="px-6 py-4 border-t border-neutral-200 bg-white flex gap-3">
              <button className="flex-1 h-10 rounded-[6px] border border-neutral-200 text-[12px] font-bold flex items-center justify-center gap-2 transition-colors hover:border-[#00775B] hover:text-[#00775B]"
                style={{ ...INTER, color: "#475569" }}>
                <span>👤</span> ASSIGN
              </button>
              <button className="flex-1 h-10 rounded-[6px] text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                style={{ background: alertColor, ...INTER }}>
                🔺 ESCALATE
              </button>
              <button className="flex-1 h-10 rounded-[6px] text-[12px] font-bold text-white flex items-center justify-center gap-2 transition-colors hover:opacity-90"
                style={{ background: "#00775B", ...INTER }}>
                ✓ ACKNOWLEDGE
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// INCIDENTS DASHBOARD
// ── Incidents Dashboard — v3-style dual-lane with IncidentCard2 ──────────────
const CC_MY_OPERATOR = "Staff_04";

function IncidentsDashboard({ isDark }: { isDark: boolean }) {
  const [records, setRecords] = useState<Map<number, LifecycleRecord>>(() => initRecords());

  type CD = null | { type: "self-assign" | "assign-to" | "escalate" | "resolve"; incident: Incident };
  const [cardDialog, setCardDialog] = useState<CD>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [currentInc, setCurrentInc] = useState<Incident | null>(null);

  const active = ALL_INCIDENTS.filter(i => records.get(i.id)?.stage !== "resolved");
  const myQueue    = active.filter(i => records.get(i.id)?.assignee === CC_MY_OPERATOR);
  const unassigned = active.filter(i => records.get(i.id)?.assignee === "Unassigned");

  const ts = () => new Date().toLocaleTimeString("en-GB", { hour12: false });

  const handleCard = (type: CD["type"], inc: Incident, payload?: string) => {
    const rec = records.get(inc.id); if (!rec) return;
    const t = ts();
    if (type === "self-assign") {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "in_progress" as LifecycleStage, assignee: CC_MY_OPERATOR, timeline: [{ id: `sa_${Date.now()}`, type: "human" as const, icon: "👤", title: `Self-Assigned by ${CC_MY_OPERATOR}`, actor: CC_MY_OPERATOR, timestamp: t }, ...rec.timeline] }); return n; });
    } else if (type === "assign-to" && payload) {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "in_progress" as LifecycleStage, assignee: payload, timeline: [{ id: `at_${Date.now()}`, type: "human" as const, icon: "👤", title: `Assigned to ${payload}`, actor: CC_MY_OPERATOR, timestamp: t }, ...rec.timeline] }); return n; });
    } else if (type === "escalate" && payload) {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "escalated" as LifecycleStage, assignee: payload, readOnly: true, timeline: [{ id: `esc_${Date.now()}`, type: "human" as const, icon: "🟠", title: `Escalated to ${payload}`, actor: CC_MY_OPERATOR, timestamp: t }, ...rec.timeline] }); return n; });
    } else if (type === "resolve") {
      setRecords(p => { const n = new Map(p); n.set(inc.id, { ...rec, stage: "resolved" as LifecycleStage, readOnly: true, timeline: [{ id: `res_${Date.now()}`, type: "human" as const, icon: "✅", title: `Resolved`, actor: CC_MY_OPERATOR, timestamp: t }, ...rec.timeline] }); return n; });
    }
    setCardDialog(null);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col" style={{ background: isDark ? "#020617" : "#F8FAFC" }}>

      {/* Stats bar */}
      <div className="flex items-center gap-4 px-6 py-3 shrink-0" style={{ borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0"}`, background: isDark ? "#0f172a" : "#FFFFFF" }}>
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[#E7000B] animate-pulse" />
          <span style={{ ...MONO, fontSize: "10px", color: "#E7000B", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>LIVE MONITORING</span>
        </div>
        <div className="w-px h-4" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0" }} />
        {[
          { label: "Critical", count: active.filter(i => i.severity === "critical").length, color: "#E7000B" },
          { label: "High",     count: active.filter(i => i.severity === "high").length,     color: "#EA580C" },
          { label: "Total",    count: active.length,                                          color: "#00775B" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="tabular-nums font-bold" style={{ ...MONO, fontSize: "13px", color: s.color }}>{s.count}</span>
            <span style={{ ...INTER, fontSize: "11px", color: "#64748B" }}>{s.label}</span>
          </div>
        ))}
        <h2 className="ml-auto" style={{ ...INTER, fontSize: "13px", fontWeight: 700, color: isDark ? "#F1F5F9" : "#0F172A" }}>Active Incidents</h2>
      </div>

      {/* Dual-lane split */}
      <div className="flex flex-1 min-h-0 px-6 py-4 gap-6">

        {/* LEFT: My Assigned Queue (40%) */}
        <div className="flex flex-col min-h-0" style={{ width: "40%", flexShrink: 0 }}>
          <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: "2px solid #00775B" }}>
            <div className="w-1 h-4 rounded-full shrink-0" style={{ background: "#00775B" }} />
            <h3 className="font-bold uppercase tracking-[0.08em]" style={{ ...INTER, fontSize: "11px", color: "#374151" }}>My Assigned Queue</h3>
            <span className="px-1.5 py-0.5 rounded-full font-bold text-white tabular-nums" style={{ ...MONO, fontSize: "10px", background: "#00775B" }}>{myQueue.length}</span>
            <span style={{ ...MONO, fontSize: "10px", color: "#94A3B8" }}>{myQueue.length}/5 capacity</span>
          </div>
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">
            {myQueue.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 rounded-full bg-[#00775B]/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" style={{ color: "#00775B" }} />
                </div>
                <p style={{ ...INTER, fontSize: "13px", color: "#94A3B8" }}>No incidents assigned to you.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {myQueue.map(inc => (
                  <IncidentCard2 key={inc.id} incident={inc} record={records.get(inc.id)!}
                    isDark={isDark}
                    onCardClick={i => { setCurrentInc(i); setDetailOpen(true); }}
                    onSelfAssign={i => setCardDialog({ type: "self-assign", incident: i })}
                    onAssignTo={i => setCardDialog({ type: "assign-to", incident: i })}
                    onEscalate={i => setCardDialog({ type: "escalate", incident: i })}
                    onResolve={i => setCardDialog({ type: "resolve", incident: i })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="w-px shrink-0 self-stretch" style={{ background: isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0" }} />

        {/* RIGHT: Live Unassigned Radar (60%) */}
        <div className="flex flex-col flex-1 min-w-0 min-h-0">
          <div className="flex items-center gap-2 mb-3 pb-3" style={{ borderBottom: "2px solid #EA580C" }}>
            <div className="w-1 h-4 rounded-full shrink-0" style={{ background: "#EA580C" }} />
            <h3 className="font-bold uppercase tracking-[0.08em]" style={{ ...INTER, fontSize: "11px", color: "#374151" }}>Live Unassigned Radar</h3>
            <span className="px-1.5 py-0.5 rounded-full font-bold text-white tabular-nums" style={{ ...MONO, fontSize: "10px", background: "#EA580C" }}>{unassigned.length}</span>
            <div className="ml-auto flex items-center gap-1.5 px-2 py-1 rounded-full animate-pulse"
              style={{ background: "#E7000B0F", border: "1px solid #E7000B28" }}>
              <span className="w-1.5 h-1.5 rounded-full bg-[#E7000B] shrink-0" />
              <span style={{ ...MONO, fontSize: "9px", color: "#E7000B", fontWeight: 700, letterSpacing: "0.06em" }}>LIVE</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-neutral-200">
            {unassigned.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-10 h-10 rounded-full bg-[#00775B]/10 flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-5 h-5" style={{ color: "#00775B" }} />
                </div>
                <p style={{ ...INTER, fontSize: "13px", color: "#94A3B8" }}>No unassigned incidents. All clear.</p>
              </div>
            ) : (
              <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))" }}>
                {unassigned.map(inc => (
                  <IncidentCard2 key={inc.id} incident={inc} record={records.get(inc.id)!}
                    isDark={isDark}
                    onCardClick={i => { setCurrentInc(i); setDetailOpen(true); }}
                    onSelfAssign={i => setCardDialog({ type: "self-assign", incident: i })}
                    onAssignTo={i => setCardDialog({ type: "assign-to", incident: i })}
                    onEscalate={i => setCardDialog({ type: "escalate", incident: i })}
                    onResolve={i => setCardDialog({ type: "resolve", incident: i })}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Card dialogs */}
      {cardDialog?.type === "self-assign" && <SelfAssignDialog   incident={cardDialog.incident} onConfirm={() => handleCard("self-assign", cardDialog.incident)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "assign-to"   && <AssignToDialog     incident={cardDialog.incident} onConfirm={n  => handleCard("assign-to",   cardDialog.incident, n)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "escalate"    && <EscalateConfirmDialog incident={cardDialog.incident} onConfirm={(m,_n) => handleCard("escalate", cardDialog.incident, m)} onCancel={() => setCardDialog(null)} />}
      {cardDialog?.type === "resolve"     && <ResolveDialog      incident={cardDialog.incident} onConfirm={() => handleCard("resolve",    cardDialog.incident)} onCancel={() => setCardDialog(null)} />}

      {/* Detail modal */}
      <IncidentDetailModal2
        incident={currentInc}
        record={currentInc ? records.get(currentInc.id) ?? null : null}
        open={detailOpen}
        onClose={() => setDetailOpen(false)}
        onUpdate={updated => { if (!currentInc) return; setRecords(p => { const n = new Map(p); n.set(currentInc.id, updated); return n; }); }}
        persona="monitoring"
      />
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// APPLICATIONS PAGE
// ─────────────────────────────────────────────────────────────────────────────
type AppFeed    = { name: string; alerts: number };
type ActiveApp  = { icon: React.ElementType; color: string; name: string; category: string; feeds: AppFeed[] };
type StoreApp   = { icon: React.ElementType; color: string; name: string; category: string; desc: string; imgUrl?: string };

const ACTIVE_APPS_DATA: ActiveApp[] = [
  {
    icon: Flame, color: "#EA580C", name: "Fire & Smoke Detection", category: "SAFETY",
    feeds: [
      { name: "North Gate Exit Cam",    alerts: 8 },   // concentrated-critical
      { name: "Main Loading Bay 02",    alerts: 4 },   // concentrated-warning
      { name: "Server Room Rows A-D",   alerts: 2 },   // distributed
      { name: "South Parking Fence",    alerts: 0 },   // nominal
    ],
  },
  {
    icon: HardHat, color: "#E19A04", name: "PPE Detection", category: "COMPLIANCE",
    feeds: [
      { name: "Front Assembly Entrance", alerts: 0 },
      { name: "Material Loading Zone",   alerts: 0 },
      { name: "Workshop Corridor B",     alerts: 0 },
      { name: "Forklift Staging Area",   alerts: 0 },
      { name: "Exit Gate East",          alerts: 0 },
      { name: "Roof Access Stairs",      alerts: 0 },
      { name: "Chemical Store Entry",    alerts: 0 },
    ],
  },
  {
    icon: Thermometer, color: "#EA580C", name: "Heat Stress Monitoring", category: "SAFETY",
    feeds: [
      { name: "Boiler Room A",    alerts: 1 },  // distributed
      { name: "Foundry Floor 2",  alerts: 2 },  // distributed
      { name: "Engine Bay West",  alerts: 0 },  // nominal
    ],
  },
];

const STORE_APPS_DATA: StoreApp[] = [
  {
    icon: Car,         color: "#2B7FFF", name: "License Plate Recognition",
    category: "SECURITY", desc: "Automated ANPR for entry and exit point tracking across all vehicle lanes.",
    imgUrl: "https://www.figma.com/api/mcp/asset/2c1e6e4f-b66e-4762-87c4-bf1c488fd8a0",
  },
  {
    icon: Users,       color: "#EA580C", name: "Tailgating Detection",
    category: "ACCESS CONTROL", desc: "Identify unauthorised individuals following through secured access checkpoints.",
    imgUrl: "https://www.figma.com/api/mcp/asset/38a898c8-fc2e-4c0c-bb1c-718d2f3ecab4",
  },
  {
    icon: ShieldAlert, color: "#E7000B", name: "Intrusion Analytics",
    category: "PERIMETER", desc: "Perimeter tripwire breach detection with sub-second alert latency.",
    imgUrl: "https://www.figma.com/api/mcp/asset/f4a706e3-6183-4ca2-baf6-adadb451846b",
  },
  {
    icon: Monitor,     color: "#7C3AED", name: "Queue Length Monitoring",
    category: "OPERATIONS", desc: "Monitor and optimise queue lengths at service points and checkpoints in real-time.",
    imgUrl: "https://www.figma.com/api/mcp/asset/3e07b1ba-9cc6-4619-a34f-22542a920f4e",
  },
  {
    icon: Users,       color: "#0369A1", name: "People Counting",
    category: "RETAIL ANALYTICS", desc: "Real-time counting and dwell-time analysis for footfall optimisation across zones.",
    imgUrl: "https://www.figma.com/api/mcp/asset/f2d103bd-85e7-48a0-b621-9149fc9b6589",
  },
  {
    icon: HardDrive,   color: "#00775B", name: "PPE Compliance Detection",
    category: "COMPLIANCE", desc: "Detect and alert when workers are not wearing required personal protective equipment.",
    imgUrl: "https://www.figma.com/api/mcp/asset/a9062ade-22ff-4f2f-8d41-67247237f885",
  },
];

function ApplicationsPage({ isDark }: { isDark: boolean }) {
  const canvas  = isDark ? "#020617" : "#F8FAFC";
  const card    = isDark ? "#0A0F1A" : "#FFFFFF";
  const border  = isDark ? "#1E293B" : "#E2E8F0";
  const title   = isDark ? "#E2E8F0" : "#0F172A";
  const sub     = isDark ? "#475569" : "#64748B";
  const label   = isDark ? "#334155" : "#94A3B8";
  const hdr     = isDark ? "#0A0F1A" : "#F8FAFC";

  const [layout, setLayout] = useState<"grid" | "table">("grid");
  const [allCamsOpen, setAllCamsOpen] = useState(false);
  const [tableSearch, setTableSearch] = useState("");
  const [tableHoveredRow, setTableHoveredRow] = useState<string | null>(null);

  // Derived totals from per-feed data
  const totalAlerts = (app: ActiveApp) => app.feeds.reduce((s, f) => s + f.alerts, 0);

  const AlertBadge = ({ count }: { count: number }) => count > 0 ? (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontFamily: "Inter, sans-serif", fontWeight: 700, fontSize: "10px",
      padding: "2px 6px", borderRadius: "3px",
      background: "rgba(239,68,68,0.10)", border: "1px solid #EF4444", color: "#EF4444",
    }}>
      <TriangleAlert style={{ width: "10px", height: "10px", flexShrink: 0 }} />
      <span style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>{count}</span> Alert{count !== 1 ? "s" : ""}
    </span>
  ) : (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "4px",
      fontFamily: "Inter, sans-serif", fontWeight: 600, fontSize: "11px", color: sub,
    }}>
      <span style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace" }}>0</span> Alerts Today
    </span>
  );

  return (
    <div style={{ padding: "32px", backgroundColor: canvas, minHeight: "100%", ...INTER }}
      onClick={() => setAllCamsOpen(false)}>

      {/* ── Active Deployments header ───────────────────────────── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: title, margin: 0 }}>
          Active AI Deployments
          <span style={{
            marginLeft: "10px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.03em",
            padding: "3px 9px", borderRadius: "20px", verticalAlign: "middle",
            backgroundColor: "rgba(0,149,109,0.08)", border: "1px solid rgba(0,149,109,0.2)", color: "#00956D",
          }}>
            {ACTIVE_APPS_DATA.length} Apps Active
          </span>
        </h3>
        {/* Layout switcher */}
        <div style={{
          display: "flex", backgroundColor: isDark ? "#0F172A" : "#F1F5F9",
          border: `1px solid ${border}`, borderRadius: "6px", padding: "2px",
        }}>
          {([["grid", LayoutGrid], ["table", List]] as const).map(([mode, Icon]) => (
            <button key={mode} onClick={() => setLayout(mode)} style={{
              display: "flex", alignItems: "center", justifyContent: "center",
              width: "28px", height: "24px", borderRadius: "4px", border: "none", cursor: "pointer",
              backgroundColor: layout === mode ? (isDark ? "#1E293B" : "#FFFFFF") : "transparent",
              color: layout === mode ? (isDark ? "#E2E8F0" : "#0F172A") : label,
              boxShadow: layout === mode ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
              transition: "all 150ms ease",
            }}>
              <Icon style={{ width: "13px", height: "13px" }} />
            </button>
          ))}
        </div>
      </div>

      {/* ── GRID VIEW ───────────────────────────────────────────── */}
      {layout === "grid" && (
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))",
          gap: "16px", marginBottom: "40px",
        }}>
          {ACTIVE_APPS_DATA.map(app => {
            const AppIcon = app.icon;
            const appAlerts = totalAlerts(app);
            const accentColor = appAlerts > 0 ? app.color : "#00956D";
            const camOpen = allCamsOpen;
            const bandGrad = isDark
              ? `linear-gradient(112deg, ${accentColor}1A 0%, ${accentColor}08 100%)`
              : `linear-gradient(112deg, ${accentColor}10 0%, ${accentColor}05 100%)`;

            return (
            <div key={app.name} style={{
              display: "flex", flexDirection: "column",
              backgroundColor: card, border: `1px solid ${border}`,
              borderRadius: "8px", overflow: "visible",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              transition: "box-shadow 180ms, border-color 180ms",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = `0 4px 16px -4px ${accentColor}28`;
              (e.currentTarget as HTMLDivElement).style.borderColor = `${accentColor}48`;
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 3px rgba(0,0,0,0.06)";
              (e.currentTarget as HTMLDivElement).style.borderColor = border;
            }}
            >
              {/* ── Identity band ── */}
              <div style={{
                background: bandGrad, padding: "14px 14px 11px",
                borderBottom: `1px solid ${border}`, borderRadius: "8px 8px 0 0",
                display: "flex", alignItems: "center", gap: "10px",
              }}>
                <div style={{
                  width: "32px", height: "32px", borderRadius: "7px", flexShrink: 0,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  backgroundColor: isDark ? `${accentColor}20` : "#fff",
                  border: `1px solid ${accentColor}28`,
                }}>
                  <AppIcon style={{ width: "16px", height: "16px", color: accentColor }} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: "11px", fontWeight: 800, letterSpacing: "0.05em",
                    textTransform: "uppercase", color: isDark ? "#E2E8F0" : "#0F172A",
                    whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                  }}>{app.name}</div>
                  {/* RUNNING pill + category */}
                  <div style={{ display: "flex", alignItems: "center", gap: "6px", marginTop: "5px" }}>
                    <div style={{
                      display: "inline-flex", alignItems: "center", gap: "3px",
                      backgroundColor: "#00956D", borderRadius: "2px", padding: "1px 5px",
                    }}>
                      <span style={{ width: "4px", height: "4px", borderRadius: "50%", backgroundColor: "#A7F3D0", display: "inline-block" }} />
                      <span style={{ fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em", color: "#fff", textTransform: "uppercase" }}>Running</span>
                    </div>
                    <span style={{
                      fontSize: "9px", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase",
                      color: accentColor, opacity: 0.8,
                    }}>{app.category}</span>
                  </div>
                </div>
                {/* Alert badge — only here */}
                <AlertBadge count={appAlerts} />
              </div>

              {/* ── Camera telemetry trigger ── */}
              <div style={{ position: "relative" }} onClick={e => e.stopPropagation()}>
                <button onClick={() => setAllCamsOpen(!allCamsOpen)} style={{
                  width: "100%", display: "flex", alignItems: "center", gap: "8px",
                  padding: "10px 14px", background: "none", border: "none", cursor: "pointer",
                  borderBottom: camOpen ? `1px solid ${border}` : "none",
                  backgroundColor: camOpen ? (isDark ? "#0F172A" : "#F8FAFC") : "transparent",
                  transition: "background-color 120ms",
                }}>
                  <Video style={{ width: "12px", height: "12px", color: accentColor, flexShrink: 0 }} />
                  <span style={{ fontSize: "12px", fontWeight: 600, color: isDark ? "#94A3B8" : "#334155", flex: 1, textAlign: "left" }}>
                    {app.feeds.length} Cameras Connected
                  </span>
                  {appAlerts > 0 && (
                    <span style={{
                      fontSize: "10px", fontWeight: 700,
                      fontFamily: "'JetBrains Mono','Fira Code',monospace",
                      color: "#DC2626",
                    }}>
                      {appAlerts} alerts across feeds
                    </span>
                  )}
                  <ChevronDown style={{
                    width: "12px", height: "12px", color: label, flexShrink: 0,
                    transform: camOpen ? "rotate(180deg)" : "none", transition: "transform 150ms",
                  }} />
                </button>

                {/* ── Camera telemetry panel (inline, not floating) ── */}
                {camOpen && (
                  <div style={{
                    borderBottom: `1px solid ${border}`,
                    backgroundColor: isDark ? "#080C14" : "#FAFCFD",
                  }}>
                    {/* Column header */}
                    <div style={{
                      display: "grid", gridTemplateColumns: "1fr auto",
                      padding: "6px 14px", borderBottom: `1px solid ${border}`,
                      backgroundColor: isDark ? "#0A0F1A" : "#F1F5F9",
                    }}>
                      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: label }}>Camera Feed</span>
                      <span style={{ fontSize: "9px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase", color: label }}>Alerts</span>
                    </div>
                    {app.feeds.map((feed, i) => {
                      const isCritical = feed.alerts >= 5;
                      const isWarning  = feed.alerts > 0 && feed.alerts < 5;
                      const dotColor   = isCritical ? "#DC2626" : isWarning ? "#D97706" : "#22C55E";
                      const countColor = isCritical ? "#DC2626" : isWarning ? "#D97706" : isDark ? "#334155" : "#CBD5E1";
                      return (
                        <div key={i} style={{
                          display: "grid", gridTemplateColumns: "1fr auto",
                          alignItems: "center", padding: "7px 14px",
                          borderBottom: i < app.feeds.length - 1 ? `1px solid ${border}` : "none",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "7px" }}>
                            <span style={{ width: "6px", height: "6px", borderRadius: "50%", backgroundColor: dotColor, flexShrink: 0, display: "inline-block" }} />
                            <span style={{
                              fontSize: "11px", color: feed.alerts > 0 ? (isDark ? "#CBD5E1" : "#334155") : (isDark ? "#475569" : "#94A3B8"),
                              whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                              fontWeight: feed.alerts > 0 ? 500 : 400,
                            }}>{feed.name}</span>
                          </div>
                          <span style={{
                            fontSize: "11px", fontWeight: 700, color: countColor,
                            fontFamily: "'JetBrains Mono','Fira Code',monospace",
                          }}>
                            {feed.alerts > 0 ? feed.alerts : "—"}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ── Full-width View Live Feeds CTA ── */}
              <div style={{ padding: "12px 14px", marginTop: "auto" }}>
                <button style={{
                  width: "100%", fontSize: "12px", fontWeight: 700, padding: "9px 0",
                  borderRadius: "6px", cursor: "pointer",
                  backgroundColor: "#00956D", border: "none", color: "#fff",
                  letterSpacing: "0.02em",
                }}>
                  View Live Feeds
                </button>
              </div>
            </div>
          ); })}
        </div>
      )}

      {/* ── TABLE VIEW — V2.3 style ─────────────────────────────── */}
      {layout === "table" && (() => {
        const teal    = isDark ? "#00956D" : "#00775B";
        const sec     = isDark ? "#94A3B8" : "#64748B";
        const surface = isDark ? "#0F172A" : "#ffffff";
        const hoveredRow    = tableHoveredRow;
        const setHoveredRow = setTableHoveredRow;
        const filtered = ACTIVE_APPS_DATA.filter(a =>
          !tableSearch || a.name.toLowerCase().includes(tableSearch.toLowerCase()) || a.category.toLowerCase().includes(tableSearch.toLowerCase())
        );
        const COLS = [
          { key: "app",      label: "Application", w: 240 },
          { key: "category", label: "Category",    w: 140 },
          { key: "status",   label: "Status",       w: 90  },
          { key: "cameras",  label: "Cameras",      w: 80  },
          { key: "alerts",   label: "Alerts Today", w: 130 },
        ] as const;
        const totalW = COLS.reduce((s, c) => s + c.w, 0);

        return (
          <div style={{ borderRadius: 8, border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0", overflow: "hidden", marginBottom: 40 }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "10px 16px 10px", backgroundColor: surface, borderBottom: `2px solid ${teal}` }}>
              {/* Search */}
              <div style={{ position: "relative", width: 260, flexShrink: 0 }}>
                <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: isDark ? "#374151" : "#94A3B8", pointerEvents: "none" }} />
                <input type="text" placeholder="Search applications…" value={tableSearch}
                  onChange={e => setTableSearch(e.target.value)}
                  style={{ width: "100%", height: 32, paddingLeft: 34, paddingRight: tableSearch ? 28 : 4, fontSize: 12, fontFamily: "Inter, sans-serif", color: isDark ? "#E2E8F0" : "#1E293B", backgroundColor: "transparent", border: "none", borderBottom: isDark ? "2px solid rgba(255,255,255,0.1)" : "2px solid #E2E8F0", borderRadius: 0, outline: "none", transition: "border-bottom-color 200ms ease" }}
                  onFocus={e  => { e.target.style.borderBottomColor = teal; }}
                  onBlur={e   => { e.target.style.borderBottomColor = isDark ? "rgba(255,255,255,0.1)" : "#E2E8F0"; }}
                />
                {tableSearch && (
                  <button onClick={() => setTableSearch("")}
                    style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>
              {/* Right cluster */}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 4 }}>
                <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif", color: sec }}>
                  {filtered.length} of {ACTIVE_APPS_DATA.length} apps
                </span>
              </div>
            </div>

            {/* Table */}
            <div style={{ overflowX: "auto", backgroundColor: surface }}>
              {/* Header row */}
              <div style={{ display: "flex", alignItems: "center", height: 44, backgroundColor: hdr, minWidth: totalW, borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #E2E8F0" }}>
                {COLS.map(col => (
                  <div key={col.key} style={{ flexShrink: 0, width: col.w, paddingLeft: col.key === "app" ? 16 : 8, paddingRight: 8, display: "flex", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: isDark ? "#94A3B8" : "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {col.label}
                    </span>
                  </div>
                ))}
                {/* spacer for floating CTA */}
                <div style={{ flex: 1 }} />
              </div>

              {/* Rows */}
              {filtered.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, fontSize: 12, color: sec, fontFamily: "Inter, sans-serif" }}>
                  No applications match "{tableSearch}".{" "}
                  <button onClick={() => setTableSearch("")} style={{ marginLeft: 8, color: teal, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Clear</button>
                </div>
              ) : filtered.map((app, idx) => {
                const AppIcon   = app.icon;
                const appAlerts = totalAlerts(app);
                const accent    = appAlerts > 0 ? app.color : "#00956D";
                const isHov     = hoveredRow === app.name;
                const baseBg    = idx % 2 === 1 ? (isDark ? "#101B26" : "#F8FDFC") : (isDark ? "#0F172A" : "#ffffff");
                const bg        = isHov ? (isDark ? "#0D2922" : "#EBF5F1") : baseBg;

                const renderCell = (key: string) => {
                  if (key === "app") return (
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{ width: 28, height: 28, borderRadius: 6, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${accent}15` }}>
                        <AppIcon style={{ width: 14, height: 14, color: accent }} />
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif", color: isHov ? (isDark ? "#E2E8F0" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"), whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 170 }}>{app.name}</span>
                    </div>
                  );
                  if (key === "category") return (
                    <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" as const, color: isDark ? "#475569" : "#94A3B8", fontFamily: "Inter, sans-serif" }}>{app.category}</span>
                  );
                  if (key === "status") return (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10, fontWeight: 700, color: "#00956D", backgroundColor: "rgba(0,149,109,0.10)", padding: "2px 7px", borderRadius: 4, fontFamily: "Inter, sans-serif" }}>
                      <span style={{ width: 4, height: 4, borderRadius: "50%", backgroundColor: "#00956D", display: "inline-block" }} />LIVE
                    </span>
                  );
                  if (key === "cameras") return (
                    <span style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace", fontWeight: 500, color: isHov ? (isDark ? "#E2E8F0" : "#0F172A") : sec }}>
                      <Video style={{ width: 11, height: 11, color: isDark ? "#475569" : "#94A3B8" }} />{app.feeds.length}
                    </span>
                  );
                  if (key === "alerts") return <AlertBadge count={appAlerts} />;
                  return null;
                };

                return (
                  <div key={app.name}
                    onMouseEnter={() => setHoveredRow(app.name)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: totalW, backgroundColor: bg, borderBottom: isDark ? "1px solid rgba(255,255,255,0.04)" : "1px solid #F1F5F9", position: "relative", transition: "background-color 100ms ease" }}>
                    {/* Left severity strip */}
                    <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, backgroundColor: accent, opacity: isHov ? 1 : 0, transition: "opacity 100ms ease" }} />
                    {COLS.map(col => (
                      <div key={col.key} style={{ flexShrink: 0, width: col.w, paddingLeft: col.key === "app" ? 18 : 8, paddingRight: 8, display: "flex", alignItems: "center", minHeight: 44 }}>
                        {renderCell(col.key)}
                      </div>
                    ))}
                    {/* Floating CTA on hover */}
                    <div style={{ flex: 1 }} />
                    <div style={{ position: "sticky", right: 0, zIndex: 4, flexShrink: 0, height: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 6, paddingLeft: 40, paddingRight: 14, background: `linear-gradient(to right, ${bg}00 0%, ${bg} 40px)`, opacity: isHov ? 1 : 0, pointerEvents: isHov ? "auto" : "none", transition: "opacity 120ms ease" }}>
                      <button
                        onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = teal; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = teal; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color = isDark ? "#94A3B8" : "#64748B"; (e.currentTarget as HTMLButtonElement).style.borderColor = isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0"; }}
                        style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5, border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0"}`, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#F1F5F9", cursor: "pointer", color: isDark ? "#94A3B8" : "#64748B", fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif", transition: "background-color 100ms ease, color 100ms ease, border-color 100ms ease" }}>
                        <Eye style={{ width: 12, height: 12 }} /> View Live Feeds
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* ── App Store ──────────────────────────────────────────── */}
      <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 700, color: isDark ? "#E2E8F0" : "#084C3E", margin: 0 }}>Available in App Store</h3>
        <span style={{ fontSize: "13px", color: sub, letterSpacing: "-0.01em" }}>Recommended for you</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "16px" }}>
        {STORE_APPS_DATA.map(app => {
          const StoreIcon = app.icon;
          return (
          <div key={app.name} style={{
            borderRadius: "4px", overflow: "hidden",
            border: "1px solid #E5E7EB",
            boxShadow: "0 1px 1.5px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.10)",
            display: "flex", flexDirection: "column", cursor: "pointer",
            transition: "box-shadow 180ms, border-color 180ms",
            backgroundImage: "linear-gradient(111.75deg, rgb(229,255,249) 20%, rgb(214,252,245) 91%)",
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 10px 15px -3px rgba(0,119,91,0.12), 0 4px 6px rgba(0,119,91,0.08)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(0,119,91,0.4)";
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = "0 1px 1.5px rgba(0,0,0,0.10), 0 1px 1px rgba(0,0,0,0.10)";
            (e.currentTarget as HTMLDivElement).style.borderColor = "#E5E7EB";
          }}
          >
            {/* Image band — 120px, grey bg with cover image or icon placeholder */}
            <div style={{ height: "120px", backgroundColor: "#F3F4F6", overflow: "hidden", flexShrink: 0, position: "relative" }}>
              {app.imgUrl
                ? <img src={app.imgUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                : (
                  <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: `${app.color}10` }}>
                    <StoreIcon style={{ width: "32px", height: "32px", color: app.color, opacity: 0.4 }} />
                  </div>
                )
              }
            </div>
            {/* Content */}
            <div style={{ padding: "12px 12px 8px", display: "flex", flexDirection: "column", gap: "10px", flex: 1 }}>
              {/* Dark green label pill */}
              <div style={{
                display: "inline-flex", alignSelf: "flex-start",
                backgroundColor: "#00775B", borderRadius: "2px", padding: "2px 5px",
              }}>
                <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", color: "#fff", textTransform: "uppercase", whiteSpace: "nowrap" }}>
                  {app.category}
                </span>
              </div>
              <div>
                <div style={{
                  fontSize: "13px", fontWeight: 600, color: "#101828", letterSpacing: "-0.01em",
                  textTransform: "uppercase", marginBottom: "5px",
                }}>{app.name}</div>
                <div style={{ fontSize: "10px", color: "#6A7282", lineHeight: 1.6 }}>{app.desc}</div>
              </div>
            </div>
            {/* Footer — tag-style */}
            <div style={{
              display: "flex", alignItems: "center", justifyContent: "space-between",
              padding: "8px 12px", borderTop: "1px solid #CCDFDB",
            }}>
              <div style={{
                backgroundColor: "rgba(0,119,91,0.10)", border: "1px solid rgba(0,119,91,0.20)",
                borderRadius: "2px", padding: "2px 6px",
              }}>
                <span style={{ fontSize: "10px", fontWeight: 600, color: "#00775B", letterSpacing: "0.04em", textTransform: "uppercase" }}>
                  {app.category.split(" ")[0]}
                </span>
              </div>
              <span style={{ fontSize: "11px", fontWeight: 600, color: "#00956D" }}>Get Application →</span>
            </div>
          </div>
        ); })}
      </div>

      {/* App Store explore CTA */}
      <div style={{
        marginTop: "20px",
        background: isDark ? "linear-gradient(135deg,#0F172A 0%,#020617 100%)" : "linear-gradient(135deg,#1E293B 0%,#0F172A 100%)",
        borderRadius: "8px", padding: "22px 28px",
        display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer",
      }}>
        <div>
          <div style={{ fontSize: "15px", fontWeight: 700, color: "#FFFFFF", marginBottom: "3px" }}>Explore Matrice App Store</div>
          <div style={{ fontSize: "12px", color: "#94A3B8" }}>Discover 40+ native AI models ready for instant deployment on your pipelines.</div>
        </div>
        <div style={{ fontSize: "26px", color: "#00956D", flexShrink: 0 }}>→</div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// PLACEHOLDER PAGE
// ─────────────────────────────────────────────────────────────────────────────
function PlaceholderPage({ title, icon: Icon, isDark }: { title: string; icon: React.ElementType; isDark: boolean }) {
  const bg   = isDark ? "#020617" : "#F0FDF9";
  const text = isDark ? "#F1F5F9" : "#0F172A";
  const muted = isDark ? "#94A3B8" : "#64748B";
  return (
    <div className="flex-1 overflow-auto flex items-center justify-center" style={{ background: bg }}>
      <div className="text-center">
        <div className="w-16 h-16 rounded-[16px] mx-auto flex items-center justify-center mb-4" style={{ background: "#00775B15" }}>
          <Icon className="w-8 h-8" style={{ color: "#00775B" }} />
        </div>
        <h2 className="text-[20px] font-bold mb-2" style={{ ...INTER, color: text }}>{title}</h2>
        <p className="text-[13px]" style={{ ...INTER, color: muted }}>This section is coming soon.</p>
      </div>
    </div>
  );
}

// ─── Convert MockIncident → Incident (for IncidentDetailModal2) ──────────────
function mockToIncident(mi: MockIncident): import("@/app/data/mockData").Incident {
  const camFeed = MOCK_CAMERAS.find(c => c.id === mi.camera);
  return {
    id: parseInt(mi.id, 10) || 9000,
    incidentId: mi.incidentId,
    title: mi.title,
    severity: mi.severity as import("@/app/data/mockData").IncidentSeverity,
    timestamp: mi.timestamp,
    location: mi.location,
    camera: mi.camera,
    image: camFeed?.thumbnail ?? IMG_CROWD,
    application: "Client Centre",
    detectedObjects: mi.detectedObjects,
    assignee: mi.assignedTo,
  };
}

function makeLiveRecord(mi: MockIncident): import("@/app/components/pages/Dashboard2Page").LifecycleRecord {
  const t = mi.timestamp;
  return {
    stage: "detected" as import("@/app/components/pages/Dashboard2Page").LifecycleStage,
    assignee: mi.assignedTo ?? "Unassigned",
    readOnly: false,
    timeline: [
      { id: "det", type: "system" as const, icon: "🔴", title: "Incident Detected", actor: "AI Pipeline", timestamp: t },
      { id: "alr", type: "system" as const, icon: "⚡", title: "Alert Triggered",   actor: "AI Pipeline", timestamp: t },
    ],
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────
interface CCProps {
  onPlatformSwitch?: (app: string) => void;
}

export function ClientCentrePlatform({ onPlatformSwitch }: CCProps) {
  const [mode, setMode]               = useState<AppMode>("hub");
  const [hubPage, setHubPage]         = useState<HubPage>("projects");
  const [workspacePage, setWorkspacePage] = useState<WorkspacePage>("incidents-dashboard");
  const [activeProject, setActiveProject] = useState<Project | null>(null);
  const [activePipeline, setActivePipeline] = useState<Pipeline | null>(null);
  const [isDark, setIsDark]           = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-theme") === "dark"; } catch { return false; }
  });
  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { localStorage.setItem("matrice-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  const [persona, setPersona]         = useState<"manager" | "monitor">("manager");
  const [isPipelineActive, setIsPipelineActive] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<MockIncident | null>(null);
  const [liveModalOpen, setLiveModalOpen] = useState(false);

  const enterWorkspace = (project: Project) => {
    setActiveProject(project);
    setActivePipeline(null);
    setIsPipelineActive(false);
    setWorkspacePage("incidents-dashboard");
    setMode("workspace");
  };

  const backToHub = () => {
    setMode("hub");
    setActiveProject(null);
    setActivePipeline(null);
    setIsPipelineActive(false);
  };

  const projectPipelines = MOCK_PIPELINES.filter(p => p.projectId === activeProject?.id);

  // Hub canvas content
  function hubContent() {
    if (hubPage === "projects") return <ProjectGrid projects={MOCK_PROJECTS} onSelectProject={enterWorkspace} isDark={isDark} persona={persona} />;
    if (hubPage === "compute")   return <PlaceholderPage title="Compute Clusters"  icon={Cpu}       isDark={isDark} />;
    if (hubPage === "network")   return <PlaceholderPage title="Network LANs"      icon={Network}   isDark={isDark} />;
    if (hubPage === "storage")   return <PlaceholderPage title="Storage Arrays"    icon={HardDrive} isDark={isDark} />;
    if (hubPage === "databases") return <PlaceholderPage title="Databases"         icon={Database}  isDark={isDark} />;
    if (hubPage === "access-keys") return <PlaceholderPage title="Access Keys"     icon={Key}       isDark={isDark} />;
    if (hubPage === "invites")   return <PlaceholderPage title="My Invites"        icon={Mail}      isDark={isDark} />;
    if (hubPage === "global-settings") return <PlaceholderPage title="Global Settings" icon={Settings} isDark={isDark} />;
    return null;
  }

  // Workspace canvas content
  function workspaceContent() {
    if (workspacePage === "live-streaming") {
      return (
        <LiveStreamingPage
          pipeline={activePipeline}
          projectPipelines={projectPipelines}
          onSelectPipeline={p => { setActivePipeline(p); setIsPipelineActive(false); }}
          isDark={isDark}
          isPipelineActive={isPipelineActive}
          persona={persona}
          onIncidentClick={inc => { setSelectedIncident(inc); setLiveModalOpen(true); }}
        />
      );
    }
    if (workspacePage === "incidents-dashboard") return <IncidentsDashboard isDark={isDark} />;
    if (workspacePage === "incidents-log")       return <PlaceholderPage title="Incidents Log"          icon={FileText}        isDark={isDark} />;
    if (workspacePage === "metrics-rules")       return <PlaceholderPage title="Metrics & Rules"        icon={BarChart3}       isDark={isDark} />;
    if (workspacePage === "camera-analytics")    return <PlaceholderPage title="Camera Analytics"       icon={BarChart2}       isDark={isDark} />;
    if (workspacePage === "specialized-intel")   return <PlaceholderPage title="Specialized Intel"      icon={Brain}           isDark={isDark} />;
    if (workspacePage === "project-cameras")     return <PlaceholderPage title="Project Cameras"        icon={Camera}          isDark={isDark} />;
    if (workspacePage === "pipeline-settings")   return <PlaceholderPage title="Pipeline Settings"      icon={SlidersHorizontal} isDark={isDark} />;
    if (workspacePage === "applications")        return <ApplicationsPage isDark={isDark} />;
    return null;
  }

  // ── HUB MODE ──────────────────────────────────────────────────────────────
  if (mode === "hub") {
    return (
      <div className="flex h-screen overflow-hidden">
        <HubSidebar page={hubPage} setPage={setHubPage} onPlatformSwitch={onPlatformSwitch} open={sidebarOpen} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <HubTopBar isDark={isDark} setIsDark={setIsDark} persona={persona} onPersonaSwitch={setPersona} onToggleSidebar={() => setSidebarOpen(v => !v)} />
          {hubContent()}
        </div>
      </div>
    );
  }

  // ── WORKSPACE MODE ────────────────────────────────────────────────────────
  return (
    <div className="flex h-screen overflow-hidden">
      <IncidentDetailModal2
        incident={selectedIncident ? mockToIncident(selectedIncident) : null}
        record={selectedIncident ? makeLiveRecord(selectedIncident) : null}
        open={liveModalOpen}
        onClose={() => { setLiveModalOpen(false); setSelectedIncident(null); }}
        onUpdate={() => {}}
        persona="monitoring"
      />
      <WorkspaceSidebar
        page={workspacePage}
        setPage={setWorkspacePage}
        onBackToHub={backToHub}
        onPlatformSwitch={onPlatformSwitch}
        open={sidebarOpen}
      />
      <div className="flex flex-col flex-1 min-h-0">
        <WorkspaceTopBar
          project={activeProject!}
          setProject={p => { setActiveProject(p); setActivePipeline(null); setIsPipelineActive(false); }}
          pipeline={activePipeline}
          setPipeline={p => { setActivePipeline(p); setIsPipelineActive(false); }}
          isDark={isDark}
          setIsDark={setIsDark}
          allProjects={MOCK_PROJECTS}
          projectPipelines={projectPipelines}
          showPipelineControl={workspacePage === "live-streaming" && persona === "manager"}
          isPipelineActive={isPipelineActive}
          onTogglePipeline={() => setIsPipelineActive(v => !v)}
          persona={persona}
          onPersonaSwitch={setPersona}
          onToggleSidebar={() => setSidebarOpen(v => !v)}
        />
        <div className={`flex-1 min-h-0 flex flex-col ${workspacePage === "live-streaming" ? "overflow-hidden" : "overflow-y-auto"}`}>
          {workspaceContent()}
        </div>
      </div>
    </div>
  );
}

export default ClientCentrePlatform;
