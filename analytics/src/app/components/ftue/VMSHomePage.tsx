import React, { useState, useRef, useEffect, useMemo, useCallback } from "react";
import {
  Layers, FolderOpen, GitBranch, Camera, Network, Cpu, HardDrive,
  Database, Film, Key, Users, Settings, ChevronDown, LayoutGrid,
  List, Search, Plus, SortAsc, Zap, X, Clock,
  BarChart3, MonitorPlay, Headphones, Shield, Check, ChevronsUpDown,
  ChevronRight, Copy, Play, ArrowLeft, Rocket, Video, ArrowRight, Loader2, CheckCircle2,
  ArrowUpRight, ArrowDownRight, Minus, Upload, Filter, ChevronLeft,
  ChevronsLeft, ChevronsRight, ChevronUp,
} from "lucide-react";
import { VMSPlatform } from "@/app/components/pages/VMSPlatform";
import { CLUSTERS, SAMPLE_CAMERAS, CameraAppRow, CAMERA_GROUPS, type CameraGroup } from "@/app/components/ftue/FTUEWizard";
import { cn } from "@/app/lib/utils";

const INTER: React.CSSProperties = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

// ─── Types ────────────────────────────────────────────────────────────────────

type VMSNavPage = "projects" | "pipelines" | "streaming" | "cameras";

interface VMSHomePageProps {
  onLaunchSetup: () => void;
  onPlatformSwitch?: (app: string) => void;
}

interface Project {
  id: string;
  name: string;
  updatedAgo: string;
  status: "Active" | "Idle" | "Error";
  role: "ADMIN" | "VIEWER" | "EDITOR";
}

interface Pipeline {
  id: string;
  name: string;
  pipelineId: string;
  cameras: number;
  apps: number;
  status: "running" | "stopped" | "error";
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const SAMPLE_PROJECTS: Project[] = [
  { id: "1", name: "setup project2", updatedAgo: "7 days ago", status: "Active", role: "ADMIN" },
  { id: "2", name: "setup project",  updatedAgo: "7 days ago", status: "Active", role: "ADMIN" },
];

const SAMPLE_PIPELINES: Record<string, Pipeline[]> = {
  "1": [
    { id: "p1", name: "setup pipeline",   pipelineId: "6a26e969586200ba48eeec2e", cameras: 2, apps: 5, status: "stopped" },
  ],
  "2": [
    { id: "p1", name: "main pipeline",    pipelineId: "7b37f070697311cb59fffd3f", cameras: 3, apps: 4, status: "running" },
    { id: "p2", name: "backup pipeline",  pipelineId: "8c48g181708422dc60gge4g0", cameras: 1, apps: 2, status: "stopped" },
  ],
};

const ALL_PLATFORMS = [
  { id: "analytics", name: "Matrice Analytics", icon: BarChart3,   shortcut: "2", active: true },
  { id: "vms",       name: "Matrice VMS",        icon: MonitorPlay, shortcut: "1", active: false },
  { id: "training",  name: "Matrice Training",   icon: Layers,      shortcut: "3", active: false },
  { id: "marketplace", name: "Matrice Marketplace", icon: Shield,   shortcut: "4", active: false },
  { id: "support",   name: "Matrice Support",    icon: Headphones,  shortcut: "5", active: false },
];

const NAV_ITEMS = [
  { label: "Platforms",   icon: Layers,      page: null },
  { label: "Projects",    icon: FolderOpen,  page: "projects" },
  { label: "Pipelines",   icon: GitBranch,   page: "pipelines" },
  { label: "Cameras",     icon: Camera,      page: null },
  { label: "Networking",  icon: Network,     page: null },
  { label: "Compute",     icon: Cpu,         page: null },
  { label: "Storage",     icon: HardDrive,   page: null },
  { label: "Database",    icon: Database,    page: null },
  { label: "Recordings",  icon: Film,        page: null },
  { label: "Access Keys", icon: Key,         page: null },
  { label: "My Invites",  icon: Users,       page: null },
] as const;

// ─── MatriceIcon SVG ──────────────────────────────────────────────────────────

const MatriceIcon = () => (
  <svg viewBox="0 0 113.7 109.945" fill="none" style={{ width: "100%", height: "100%" }}>
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
  </svg>
);

// ─── Helper components ────────────────────────────────────────────────────────

function statusColor(s: Project["status"]) {
  return s === "Active" ? "#059669" : s === "Error" ? "#EF4444" : "#94A3B8";
}

function pipelineStatusStyle(s: Pipeline["status"]): { bg: string; color: string; label: string } {
  if (s === "running") return { bg: "rgba(5,150,105,0.14)", color: "#059669", label: "RUNNING" };
  if (s === "error")   return { bg: "rgba(239,68,68,0.14)",  color: "#EF4444", label: "ERROR" };
  return { bg: "rgba(251,44,54,0.14)", color: "#FB2C36", label: "STOPPED" };
}

// ─── PlatformSwitcher dropdown ────────────────────────────────────────────────

function PlatformSwitcher({ onSwitch }: { onSwitch: (app: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={ref} style={{ position: "relative", padding: "8px" }}>
      {/* Trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...INTER,
          display: "flex", alignItems: "center", gap: "8px",
          padding: "8px", borderRadius: "6px", width: "100%",
          background: open ? "rgba(255,255,255,0.08)" : "transparent",
          border: "none", cursor: "pointer", minHeight: "48px",
          transition: "background 0.15s",
        }}
        onMouseEnter={e => { if (!open) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
        onMouseLeave={e => { if (!open) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
      >
        {/* Logo */}
        <div style={{
          width: "32px", height: "32px", borderRadius: "8px", flexShrink: 0,
          background: "#012a1f", border: "1px solid rgba(0,119,91,0.3)",
          padding: "5px", boxSizing: "border-box",
        }}>
          <MatriceIcon />
        </div>
        <div style={{ flex: 1, minWidth: 0, textAlign: "left" }}>
          <div style={{ fontSize: "14px", fontWeight: 700, color: "#fff", lineHeight: "1.2" }}>Matrice AI</div>
          <div style={{ fontSize: "11px", color: "rgba(255,255,255,0.5)", lineHeight: "1.3" }}>VMS Platform</div>
        </div>
        <ChevronsUpDown size={16} color="rgba(255,255,255,0.4)" style={{ flexShrink: 0 }} />
      </button>

      {/* Dropdown */}
      {open && (
        <div style={{
          position: "absolute", left: "calc(100% + 4px)", top: "8px",
          width: "208px", background: "#fff", borderRadius: "8px",
          boxShadow: "0 8px 24px rgba(0,0,0,0.18)", border: "1px solid #E2E8F0",
          zIndex: 1000, overflow: "hidden",
        }}>
          <div style={{
            padding: "8px 12px 6px",
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
            color: "#94A3B8", textTransform: "uppercase", ...INTER,
          }}>Platforms</div>
          {ALL_PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => { setOpen(false); onSwitch(p.id); }}
              style={{
                ...INTER,
                display: "flex", alignItems: "center", gap: "8px",
                width: "100%", padding: "8px 12px", border: "none",
                background: "transparent", cursor: "pointer", textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8FAFC"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "transparent"}
            >
              <div style={{
                width: "24px", height: "24px", borderRadius: "6px", flexShrink: 0,
                background: "#F1F5F9", border: "1px solid #E2E8F0",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}>
                <p.icon size={14} color="#64748B" />
              </div>
              <span style={{ flex: 1, fontSize: "14px", color: "#0F172A" }}>{p.name}</span>
              {p.id === "vms" && <Check size={14} color="#00775B" />}
              <kbd style={{
                ...MONO, fontSize: "10px", color: "#94A3B8",
                background: "#F1F5F9", border: "1px solid #E2E8F0",
                borderRadius: "4px", padding: "1px 6px",
              }}>⌘{p.shortcut}</kbd>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar shared layout ────────────────────────────────────────────────────

function VMSSidebar({
  activePage, onPlatformSwitch, onNavClick,
}: {
  activePage: string;
  onPlatformSwitch: (app: string) => void;
  onNavClick: (label: string) => void;
}) {
  return (
    <div style={{
      width: "224px", flexShrink: 0, background: "#001E18",
      display: "flex", flexDirection: "column", height: "100%",
    }}>
      <PlatformSwitcher onSwitch={onPlatformSwitch} />

      {/* Nav items */}
      <div style={{ flex: 1, overflowY: "auto", padding: "0 8px 8px", paddingTop: "4px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          {NAV_ITEMS.map(item => {
            const isActive =
              (item.label === "Projects"  && (activePage === "projects" || activePage === "pipelines")) ||
              (item.label === "Pipelines" && activePage === "pipelines") ||
              (item.label === "Cameras"   && activePage === "cameras");
            return (
              <button key={item.label} onClick={() => onNavClick(item.label)} style={{
                ...INTER,
                display: "flex", alignItems: "center", gap: "8px",
                height: "32px", padding: "8px", borderRadius: "6px", width: "100%",
                background: isActive ? "rgba(255,255,255,0.15)" : "transparent",
                border: "none", cursor: "pointer", textAlign: "left",
                transition: "background 0.1s",
              }}
              onMouseEnter={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.07)"; }}
              onMouseLeave={e => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}>
                <item.icon size={16} color={isActive ? "#fff" : "rgba(255,255,255,0.65)"} />
                <span style={{
                  fontSize: "14px", fontWeight: isActive ? 600 : 400,
                  color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                }}>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: "8px" }}>
        <button style={{ ...INTER, display: "flex", alignItems: "center", gap: "8px", padding: "8px", borderRadius: "4px", width: "100%", background: "transparent", border: "none", cursor: "pointer", opacity: 0.8 }}>
          <Settings size={16} color="#FAFAFA" />
          <span style={{ fontSize: "13px", color: "#FAFAFA" }}>Settings</span>
        </button>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "8px" }}>
          <div style={{ width: "24px", height: "24px", borderRadius: "12px", background: "#00775B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontSize: "10px", color: "#fff", fontWeight: 600, ...INTER }}>AD</span>
          </div>
          <span style={{ fontSize: "13px", color: "#FAFAFA", opacity: 0.8, ...INTER }}>Admin</span>
        </div>
      </div>
    </div>
  );
}

// ─── Header shared layout ─────────────────────────────────────────────────────

function VMSHeader({ breadcrumb }: { breadcrumb?: React.ReactNode }) {
  const [time, setTime] = useState(() => new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
  useEffect(() => {
    const id = setInterval(() => setTime(new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div style={{
      background: "#001E18", height: "49px", display: "flex",
      alignItems: "center", justifyContent: "space-between",
      padding: "8px 12px", flexShrink: 0,
      borderBottom: "1px solid rgba(255,255,255,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        {breadcrumb}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "6px",
          border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px",
          padding: "4px 12px", height: "33px",
        }}>
          <Clock size={14} color="#fff" />
          <span style={{ fontSize: "12px", color: "#fff", ...INTER }}>{time}</span>
        </div>
        <div style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#00775B", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
          <span style={{ fontSize: "12px", color: "#fff", fontWeight: 600, ...INTER }}>AD</span>
        </div>
      </div>
    </div>
  );
}

// ─── ProjectCard ──────────────────────────────────────────────────────────────

function ProjectCard({ project, onClick }: { project: Project; onClick: () => void }) {
  const initials = project.name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase();
  return (
    <div onClick={onClick} style={{
      ...INTER,
      background: "linear-gradient(135deg, #ffffff 0%, #e5fff9 100%)",
      border: "1px solid #E2E8F0", borderRadius: "10px", padding: "14px 16px",
      boxShadow: "0 1px 3px rgba(0,0,0,0.08)", cursor: "pointer", transition: "all 0.15s",
    }}
    onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 4px 16px rgba(0,119,91,0.12)"; el.style.transform = "translateY(-1px)"; }}
    onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = "0 1px 3px rgba(0,0,0,0.08)"; el.style.transform = "translateY(0)"; }}>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "10px" }}>
        <div style={{ width: "34px", height: "34px", borderRadius: "8px", flexShrink: 0, background: "rgba(0,119,91,0.06)", border: "1px solid rgba(0,119,91,0.08)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: 500, color: "#00775B" }}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: "15px", fontWeight: 600, color: "#0F172A", letterSpacing: "-0.15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{project.name}</div>
          <div style={{ fontSize: "12px", color: "#65758B", marginTop: "1px" }}>{project.updatedAgo}</div>
        </div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
        <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: "4px", background: "rgba(0,119,91,0.07)", color: "#00775B", textTransform: "uppercase" }}>{project.role}</span>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <div style={{ width: "6px", height: "6px", borderRadius: "3px", background: statusColor(project.status), boxShadow: `0 0 8px ${statusColor(project.status)}72` }} />
          <span style={{ fontSize: "12px", color: "#65758B" }}>{project.status}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Projects page ────────────────────────────────────────────────────────────

function ProjectsContent({ onSelectProject, onLaunchSetup }: { onSelectProject: (p: Project) => void; onLaunchSetup: () => void }) {
  const [search, setSearch] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [tipDismissed, setTipDismissed] = useState(false);
  const filtered = SAMPLE_PROJECTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div style={{ flex: 1, background: "#F1F5F9", borderTopLeftRadius: "16px", overflowY: "auto", padding: "20px 24px 24px" }}>
      <h1 style={{ ...INTER, fontSize: "22px", fontWeight: 400, color: "#0F172A", letterSpacing: "-0.55px", margin: "0 0 4px" }}>All Projects</h1>
      <p style={{ ...INTER, fontSize: "12.5px", color: "#65758B", margin: "0 0 16px" }}>{filtered.length} project{filtered.length !== 1 ? "s" : ""} · Manage and monitor your deployments</p>

      {!tipDismissed && (
        <div style={{ display: "flex", alignItems: "center", gap: "12px", background: "#E5FFF9", border: "1px solid rgba(0,119,91,0.12)", borderRadius: "10px", padding: "11px 15px", marginBottom: "16px" }}>
          <div style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(0,119,91,0.07)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Zap size={16} color="#00775B" />
          </div>
          <div style={{ flex: 1, fontSize: "12px", color: "#475569", display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", ...INTER }}>
            <span style={{ fontWeight: 600, color: "#0F172A" }}>Quick tips:</span>
            <span>Press</span>
            <span style={{ background: "rgba(0,0,0,0.05)", border: "1px solid rgba(0,0,0,0.05)", borderRadius: "3px", padding: "1px 6px", fontSize: "10px", color: "#475569" }}>⌘ /</span>
            <span>to search · Click any card to open project · Toggle grid/list to switch views</span>
          </div>
          <button onClick={() => setTipDismissed(true)} style={{ background: "transparent", border: "none", cursor: "pointer", padding: "4px", color: "#64748B" }}><X size={16} /></button>
        </div>
      )}

      {/* Toolbar */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "10px", padding: "9px 13px", display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", boxShadow: "0 1px 1px rgba(0,0,0,0.03)" }}>
        <div style={{ position: "relative", maxWidth: "340px", flex: "1 0 0", minWidth: 0 }}>
          <Search size={16} color="#94A3B8" style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)" }} />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..." style={{ ...INTER, width: "100%", height: "34px", borderRadius: "7px", border: "1px solid transparent", background: "#fff", paddingLeft: "33px", paddingRight: "48px", fontSize: "13px", color: "#0F172A", outline: "none", boxSizing: "border-box" }} />
          <span style={{ position: "absolute", right: "8px", top: "50%", transform: "translateY(-50%)", background: "rgba(0,0,0,0.04)", border: "1px solid rgba(0,0,0,0.04)", borderRadius: "4px", padding: "2px 7px", fontSize: "10.5px", color: "#65758B", ...MONO }}>⌘ /</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexShrink: 0 }}>
          <button style={{ ...INTER, display: "flex", alignItems: "center", gap: "6px", height: "32px", padding: "0 12px", borderRadius: "6px", background: "transparent", border: "none", cursor: "pointer", fontSize: "14px", color: "#0F172A" }}><SortAsc size={14} />Sort</button>
          <div style={{ display: "flex", gap: "2px", padding: "2px", background: "#F1F5F9", borderRadius: "7px" }}>
            {(["grid", "list"] as const).map(m => (
              <button key={m} onClick={() => setViewMode(m)} style={{ width: "36px", height: "36px", borderRadius: "6px", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", background: viewMode === m ? "#fff" : "transparent", boxShadow: viewMode === m ? "0 1px 1px rgba(0,0,0,0.06)" : "none", color: viewMode === m ? "#0F172A" : "#94A3B8" }}>
                {m === "grid" ? <LayoutGrid size={16} /> : <List size={16} />}
              </button>
            ))}
          </div>
          <button style={{ ...INTER, display: "flex", alignItems: "center", gap: "6px", height: "32px", padding: "0 12px", borderRadius: "6px", background: "#00775B", border: "none", cursor: "pointer", fontSize: "14px", color: "#fff", fontWeight: 500 }}><Plus size={14} />New Project</button>
        </div>
      </div>

      {/* Project grid */}
      {filtered.length > 0 ? (
        <div style={{ display: viewMode === "grid" ? "grid" : "flex", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", flexDirection: "column", gap: "16px" }}>
          {filtered.map(p => <ProjectCard key={p.id} project={p} onClick={() => onSelectProject(p)} />)}
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "60px 24px", color: "#94A3B8", gap: "12px" }}>
          <FolderOpen size={40} color="#CBD5E1" /><span style={{ fontSize: "14px", ...INTER }}>No projects match your search</span>
        </div>
      )}

      {/* Launch Setup banner */}
      <div style={{ marginTop: "32px", background: "linear-gradient(135deg, #001E18 0%, #003D2E 100%)", borderRadius: "14px", padding: "24px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "24px", boxShadow: "0 4px 24px rgba(0,119,91,0.18)" }}>
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px", background: "rgba(0,119,91,0.3)", border: "1px solid rgba(0,119,91,0.4)", borderRadius: "20px", padding: "3px 10px", marginBottom: "10px" }}>
            <div style={{ width: "6px", height: "6px", borderRadius: "3px", background: "#00D48C" }} />
            <span style={{ fontSize: "11px", fontWeight: 600, color: "#00D48C", letterSpacing: "0.05em", textTransform: "uppercase", ...INTER }}>Quick Start</span>
          </div>
          <h2 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", margin: "0 0 6px", letterSpacing: "-0.3px", ...INTER }}>Set up your first pipeline</h2>
          <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.6)", margin: 0, lineHeight: 1.5, ...INTER }}>Connect cameras, configure AI applications, and deploy your inference pipeline in minutes.</p>
        </div>
        <button onClick={onLaunchSetup} style={{ ...INTER, display: "flex", alignItems: "center", gap: "8px", background: "#00775B", border: "none", borderRadius: "10px", padding: "12px 22px", cursor: "pointer", flexShrink: 0, fontSize: "14px", fontWeight: 600, color: "#fff", boxShadow: "0 4px 16px rgba(0,119,91,0.45)", transition: "all 0.15s" }}
          onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#005E47"; el.style.transform = "translateY(-1px)"; }}
          onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "#00775B"; el.style.transform = "translateY(0)"; }}>
          <Zap size={16} />Launch Initial Setup
        </button>
      </div>
    </div>
  );
}

// ─── New Pipeline Modal ───────────────────────────────────────────────────────

interface NewPipelineForm {
  name: string;
  description: string;
  cluster: string;
  cameraApps: Map<string, Set<string>>;
}

type NewPipelineStep = 1 | 2 | 3 | 4;
type NewPipelineLaunchPhase = "confirm" | "booting" | "success";


function NewPipelineModal({ onClose, onComplete }: { onClose: () => void; onComplete: (dest: "vms" | "analytics") => void }) {
  const [step, setStep] = useState<NewPipelineStep>(1);
  const [form, setForm] = useState<NewPipelineForm>({ name: "", description: "", cluster: "", cameraApps: new Map() });
  const [camSearch, setCamSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<CameraGroup>("All");
  const [phase, setPhase] = useState<NewPipelineLaunchPhase>("confirm");
  const [progress, setProgress] = useState(0);
  const [bootMsg, setBootMsg] = useState("Initializing cluster nodes…");

  const BOOT_MSGS = [
    "Initializing cluster nodes…", "Connecting camera streams…",
    "Loading AI inference models…", "Binding pipeline applications…",
    "Running system health checks…", "Pipeline ready — finalizing…",
  ];

  const filteredCameras = useMemo(() =>
    SAMPLE_CAMERAS.filter(c => {
      const matchGroup = activeGroup === "All" || c.group === activeGroup;
      const q = camSearch.toLowerCase();
      return matchGroup && (!q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }),
    [camSearch, activeGroup]
  );

  const selectedCameraIds = [...form.cameraApps.keys()];
  const allHaveApps = selectedCameraIds.length > 0 && selectedCameraIds.every(id => (form.cameraApps.get(id)?.size ?? 0) > 0);
  const canStep1 = !!(form.name.trim() && form.cluster);

  const toggleCamera = (camId: string) => {
    const next = new Map(form.cameraApps);
    next.has(camId) ? next.delete(camId) : next.set(camId, new Set());
    setForm({ ...form, cameraApps: next });
  };

  const handleDeploy = () => {
    setPhase("booting");
    let s = 0;
    const id = setInterval(() => {
      s++;
      setProgress(Math.min(s * 17, 100));
      setBootMsg(BOOT_MSGS[Math.min(s - 1, BOOT_MSGS.length - 1)]);
      if (s >= 6) { clearInterval(id); setTimeout(() => setPhase("success"), 600); }
    }, 700);
  };

  const inputCls = "w-full h-10 px-4 rounded-[4px] border border-[#CBD5E1] bg-white text-[14px] text-[#334155] placeholder:text-[#94A3B8] transition-all duration-200 focus:outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[rgba(0,119,91,0.15)]";
  const labelStyle: React.CSSProperties = { ...INTER, display: "block", fontSize: "11px", fontWeight: 600, color: "#334155", letterSpacing: "0.05em", textTransform: "uppercase", marginBottom: "6px" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(3px)" }}>
      <div className="relative w-full max-w-[800px] bg-white rounded-[8px] shadow-[0_25px_80px_rgba(0,0,0,0.28)] overflow-hidden flex flex-col" style={{ maxHeight: "90vh" }}>
        {/* Accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#00775B] via-[#00956D] to-[#00D4AA]" />

        {/* Header */}
        <div className="px-8 pt-6 pb-5 border-b border-[#E2E8F0]">
          <div className="flex items-start justify-between mb-5">
            <div style={INTER}>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-5 h-5 rounded-[4px] bg-[#00775B] flex items-center justify-center">
                  <GitBranch className="w-3 h-3 text-white" />
                </div>
                <span className="text-[11px] font-semibold text-[#00775B] uppercase tracking-[0.08em]">
                  New Pipeline · Step {step} of 4
                </span>
              </div>
              <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight">
                {step === 1 ? "Build Pipeline" : step === 2 ? "Select Cameras" : step === 3 ? "Assign Applications" : "Review & Launch"}
              </h2>
              <p className="text-[14px] text-[#64748B] mt-1 leading-relaxed">
                {step === 1 ? "Name your pipeline and choose a cluster." : step === 2 ? "Choose which cameras this pipeline will monitor." : step === 3 ? "Assign at least one AI application to each camera." : "Review your configuration and deploy."}
              </p>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-[6px] border border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all mt-1">
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Step indicators */}
          <div className="flex items-center justify-center gap-2" style={INTER}>
            {[
              { n: 1 as NewPipelineStep, label: "Build Pipeline", Icon: GitBranch },
              { n: 2 as NewPipelineStep, label: "Cameras", Icon: Camera },
              { n: 3 as NewPipelineStep, label: "Applications", Icon: Zap },
              { n: 4 as NewPipelineStep, label: "Launch", Icon: Rocket },
            ].map(({ n, label, Icon }, i) => {
              const done = step > n;
              const active = step === n;
              return (
                <React.Fragment key={n}>
                  <div className="flex flex-col items-center gap-1.5">
                    <div className={cn("w-7 h-7 rounded-full flex items-center justify-center border-2 transition-all", done ? "bg-[#00775B] border-[#00775B]" : active ? "bg-white border-[#00775B]" : "bg-white border-[#CBD5E1]")}>
                      {done ? <Check className="w-3.5 h-3.5 text-white" /> : <Icon className={cn("w-3 h-3", active ? "text-[#00775B]" : "text-[#94A3B8]")} />}
                    </div>
                    <span className={cn("text-[10px] font-semibold whitespace-nowrap", active ? "text-[#00775B]" : done ? "text-[#334155]" : "text-[#94A3B8]")}>{label}</span>
                  </div>
                  {i < 3 && <div className={cn("w-10 h-px mb-5 transition-colors", done ? "bg-[#00775B]" : "bg-[#E2E8F0]")} />}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-8 py-6">
          {step === 1 && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-5">
                <div>
                  <label style={labelStyle}>Pipeline Name <span style={{ color: "#EF4444" }}>*</span></label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="e.g. Main-Entrance-Pipeline" style={INTER} className={inputCls} />
                </div>
                <div>
                  <label style={labelStyle}>Cluster <span style={{ color: "#EF4444" }}>*</span></label>
                  <div className="relative">
                    <select value={form.cluster} onChange={e => setForm({ ...form, cluster: e.target.value })} style={INTER} className={cn(inputCls, "appearance-none cursor-pointer pr-10", form.cluster ? "text-[#334155]" : "text-[#94A3B8]")}>
                      <option value="">Select cluster…</option>
                      {CLUSTERS.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div>
                <label style={labelStyle}>Description</label>
                <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Optional pipeline description" style={INTER} className={inputCls} />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              {/* Camera picker */}
              <div className="rounded-[6px] border border-[#E2E8F0] overflow-hidden">
                <div className="px-3 pt-3 pb-2 border-b border-[#F1F5F9] space-y-2">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
                    <input type="text" value={camSearch} onChange={e => setCamSearch(e.target.value)}
                      placeholder={`Search ${SAMPLE_CAMERAS.length} cameras…`} style={INTER}
                      className="w-full h-9 pl-9 pr-4 rounded-[4px] border border-[#E2E8F0] bg-[#FAFAFA] text-[13px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[rgba(0,119,91,0.12)] transition-all" />
                    {camSearch && <button onClick={() => setCamSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#64748B]" /></button>}
                  </div>
                  <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
                    {CAMERA_GROUPS.map(g => (
                      <button key={g} onClick={() => setActiveGroup(g)} style={INTER}
                        className={cn("shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold transition-all",
                          activeGroup === g ? "bg-[#00775B] text-white shadow-[0_1px_4px_rgba(0,119,91,0.3)]" : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]")}>
                        {g}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="overflow-y-auto" style={{ maxHeight: "320px" }}>
                  {filteredCameras.length === 0 ? (
                    <div className="py-8 text-center text-[12px] text-[#94A3B8]" style={INTER}>No cameras match "{camSearch}"</div>
                  ) : filteredCameras.map(cam => {
                    const selected = form.cameraApps.has(cam.id);
                    return (
                      <label key={cam.id} className={cn(
                        "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-[#F8FAFC] last:border-0",
                        selected ? "bg-[#E5FFF9]" : "bg-white hover:bg-[#FAFAFA]")}>
                        <input type="checkbox" checked={selected} onChange={() => toggleCamera(cam.id)} className="sr-only" />
                        <div className={cn("w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-all",
                          selected ? "bg-[#00775B] border-[#00775B]" : "border-[#CBD5E1] bg-white")}>
                          {selected && <Check className="w-2.5 h-2.5 text-white" />}
                        </div>
                        <Camera size={14} color="#94A3B8" className="shrink-0" />
                        <div className="flex-1 min-w-0">
                          <div className={cn("text-[13px] font-semibold truncate", selected ? "text-[#00775B]" : "text-[#0F172A]")}>{cam.name}</div>
                          <div className="text-[11px] text-[#94A3B8] truncate">{cam.location}</div>
                        </div>
                        {selected && <span className="shrink-0 text-[10px] font-bold text-[#00775B] bg-[#00775B]/10 px-2 py-0.5 rounded-full">SELECTED</span>}
                      </label>
                    );
                  })}
                </div>
                <div className="px-4 py-2.5 border-t border-[#E2E8F0] bg-[#FAFAFA] flex items-center justify-between">
                  <span className="text-[11px] text-[#94A3B8]" style={INTER}>{filteredCameras.length} shown of {SAMPLE_CAMERAS.length}</span>
                  {form.cameraApps.size > 0 && <span className="text-[11px] font-semibold text-[#00775B]" style={INTER}>{form.cameraApps.size} selected</span>}
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-3">
              {selectedCameraIds.length === 0 ? (
                <div className="py-12 text-center" style={INTER}>
                  <Camera className="w-10 h-10 text-[#CBD5E1] mx-auto mb-3" />
                  <p className="text-[14px] text-[#94A3B8]">No cameras selected. Go back to select cameras first.</p>
                </div>
              ) : (
                <>
                  {!allHaveApps && (
                    <div className="flex items-center gap-2 px-3 py-2.5 rounded-[6px] bg-[#F0FDF8] border border-[#00775B]/20" style={INTER}>
                      <Zap className="w-4 h-4 text-[#00775B] shrink-0" />
                      <span className="text-[12px] text-[#00775B]">Assign at least 1 application per camera to proceed.</span>
                    </div>
                  )}
                  <div className="space-y-2">
                    {selectedCameraIds.map((camId) => {
                      const cam = SAMPLE_CAMERAS.find(c => c.id === camId)!;
                      return (
                        <CameraAppRow
                          key={camId}
                          camera={cam}
                          selectedApps={form.cameraApps.get(camId)!}
                          onAppsChange={(next) => {
                            const m = new Map(form.cameraApps);
                            m.set(camId, next);
                            setForm({ ...form, cameraApps: m });
                          }}
                        />
                      );
                    })}
                  </div>
                </>
              )}
            </div>
          )}

          {step === 4 && (
            <>
              {phase === "confirm" && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-[#E5FFF9] border-2 border-[#00775B]/20 flex items-center justify-center">
                    <Rocket className="w-9 h-9 text-[#00775B]" />
                  </div>
                  <div style={INTER}>
                    <h3 className="text-[22px] font-bold text-[#0F172A] mb-2">Ready to Deploy</h3>
                    <p className="text-[14px] text-[#64748B] max-w-[400px] leading-relaxed">Your pipeline is configured. Click below to deploy and start your AI pipeline.</p>
                  </div>
                  <div className="w-full max-w-[360px] p-4 rounded-[6px] bg-[#FAFAFA] border border-[#E2E8F0] text-left space-y-2">
                    {[
                      { label: `Pipeline: ${form.name}` },
                      { label: `Cluster: ${form.cluster.split(" ")[0]}` },
                      { label: `${form.cameraApps.size} camera${form.cameraApps.size !== 1 ? "s" : ""} · ${[...form.cameraApps.values()].reduce((a, s) => a + s.size, 0)} app bindings` },
                    ].map(({ label }) => (
                      <div key={label} className="flex items-center gap-3 text-[13px] text-[#475569]" style={INTER}>
                        <div className="w-5 h-5 rounded-full bg-[#E5FFF9] flex items-center justify-center shrink-0">
                          <Check className="w-3 h-3 text-[#00775B]" />
                        </div>
                        {label}
                      </div>
                    ))}
                  </div>
                  <button onClick={handleDeploy} className="flex items-center gap-2.5 px-8 py-3 rounded-[4px] bg-[#00775B] hover:bg-[#004E3D] active:scale-[0.98] text-white text-[15px] font-semibold transition-all shadow-[0_4px_14px_rgba(0,119,91,0.35)]" style={INTER}>
                    <Rocket className="w-4 h-4" />
                    Deploy & Start Pipeline
                  </button>
                </div>
              )}
              {phase === "booting" && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  <div className="relative w-20 h-20">
                    <div className="absolute inset-0 rounded-full border-4 border-[#E2E8F0]" />
                    <div className="absolute inset-0 rounded-full border-4 border-[#00775B] border-r-transparent transition-all duration-700" style={{ transform: `rotate(${progress * 3.6}deg)` }} />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Loader2 className="w-7 h-7 text-[#00775B] animate-spin" />
                    </div>
                  </div>
                  <div style={INTER}>
                    <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">Booting Pipeline</h3>
                    <p className="text-[13px] text-[#64748B]">{bootMsg}</p>
                  </div>
                  <div className="w-full max-w-[360px]">
                    <div className="flex justify-between mb-2">
                      <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider" style={INTER}>Initialization</span>
                      <span className="text-[12px] font-semibold text-[#00775B]" style={MONO}>{progress}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
                      <div className="h-full rounded-full bg-[#00775B] transition-all duration-700" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                </div>
              )}
              {phase === "success" && (
                <div className="flex flex-col items-center text-center gap-6 py-4">
                  <div className="w-20 h-20 rounded-full bg-[#E5FFF9] border-2 border-[#00775B]/30 flex items-center justify-center">
                    <CheckCircle2 className="w-10 h-10 text-[#00775B]" />
                  </div>
                  <div style={INTER}>
                    <h3 className="text-[22px] font-bold text-[#0F172A] mb-2">Pipeline Live!</h3>
                    <p className="text-[14px] text-[#64748B] max-w-[380px] leading-relaxed">Your AI pipeline is running. Choose where to go next.</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4 w-full">
                    <button onClick={() => onComplete("vms")} className="group flex flex-col items-center gap-3 p-6 rounded-[6px] border-2 border-[#E2E8F0] bg-white hover:border-[#00775B] hover:bg-[#E5FFF9] transition-all">
                      <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] group-hover:bg-[#00775B]/10 flex items-center justify-center transition-all">
                        <Video className="w-6 h-6 text-[#64748B] group-hover:text-[#00775B] transition-colors" />
                      </div>
                      <div style={INTER}>
                        <div className="text-[14px] font-semibold text-[#0F172A]">Live Tracking</div>
                        <div className="text-[12px] text-[#64748B] mt-0.5">VMS Streaming view</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00775B] transition-colors" />
                    </button>
                    <button onClick={() => onComplete("analytics")} className="group flex flex-col items-center gap-3 p-6 rounded-[6px] border-2 border-[#E2E8F0] bg-white hover:border-[#2B7FFF] hover:bg-[#E5F0FF] transition-all">
                      <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] group-hover:bg-[#2B7FFF]/10 flex items-center justify-center transition-all">
                        <BarChart3 className="w-6 h-6 text-[#64748B] group-hover:text-[#2B7FFF] transition-colors" />
                      </div>
                      <div style={INTER}>
                        <div className="text-[14px] font-semibold text-[#0F172A]">Analytics Dashboard</div>
                        <div className="text-[12px] text-[#64748B] mt-0.5">Open Insights dashboard</div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2B7FFF] transition-colors" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!(step === 4 && phase !== "confirm") && (
          <div className="px-8 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#FAFAFA]">
            <button onClick={() => step > 1 ? setStep((step - 1) as NewPipelineStep) : onClose()} className="px-5 py-2.5 rounded-[4px] border border-[#E2E8F0] text-[14px] font-semibold text-[#475569] hover:bg-[#F1F5F9] transition-all" style={INTER}>
              {step === 1 ? "Cancel" : "Back"}
            </button>
            <div className="flex items-center gap-3">
              {step === 2 && (
                <button onClick={() => setStep(3)} className="px-5 py-2.5 rounded-[4px] border border-[#E2E8F0] text-[14px] font-semibold text-[#475569] hover:bg-[#F1F5F9] transition-all" style={INTER}>
                  Skip
                </button>
              )}
              {step === 3 && (
                <button onClick={() => setStep(4)} className="px-5 py-2.5 rounded-[4px] border border-[#E2E8F0] text-[14px] font-semibold text-[#475569] hover:bg-[#F1F5F9] transition-all" style={INTER}>
                  Skip
                </button>
              )}
              {step === 1 && (
                <button onClick={() => canStep1 && setStep(2)} disabled={!canStep1} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-[14px] font-semibold text-white transition-all", canStep1 ? "bg-[#00775B] hover:bg-[#004E3D] shadow-[0_2px_8px_rgba(0,119,91,0.3)]" : "bg-[#CBD5E1] cursor-not-allowed")} style={INTER}>
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 2 && (
                <button onClick={() => setStep(3)} disabled={form.cameraApps.size === 0} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-[14px] font-semibold text-white transition-all", form.cameraApps.size > 0 ? "bg-[#00775B] hover:bg-[#004E3D] shadow-[0_2px_8px_rgba(0,119,91,0.3)]" : "bg-[#CBD5E1] cursor-not-allowed")} style={INTER}>
                  Next <ArrowRight className="w-4 h-4" />
                </button>
              )}
              {step === 3 && (
                <button onClick={() => setStep(4)} disabled={selectedCameraIds.length > 0 && !allHaveApps} className={cn("flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-[14px] font-semibold text-white transition-all", (selectedCameraIds.length === 0 || allHaveApps) ? "bg-[#00775B] hover:bg-[#004E3D] shadow-[0_2px_8px_rgba(0,119,91,0.3)]" : "bg-[#CBD5E1] cursor-not-allowed")} style={INTER}>
                  Review & Launch <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Pipelines page ───────────────────────────────────────────────────────────

function PipelinesContent({ project, onSelectPipeline, onBack, onPipelineComplete }: { project: Project; onSelectPipeline: (p: Pipeline) => void; onBack: () => void; onPipelineComplete: (dest: "vms" | "analytics") => void }) {
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const pipelines = (SAMPLE_PIPELINES[project.id] || []).filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  const statusStyle = (s: Pipeline["status"]) => pipelineStatusStyle(s);

  return (
    <>
    <div style={{ flex: 1, background: "#F1F5F9", borderTopLeftRadius: "16px", overflowY: "auto", padding: "24px" }}>
      {/* Page header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "20px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
          <div style={{ ...INTER, fontSize: "20px", fontWeight: 600, color: "#0F172A" }}>All Pipelines</div>
          <div style={{ ...INTER, fontSize: "12px", color: "#475569" }}>{pipelines.length} pipeline{pipelines.length !== 1 ? "s" : ""} in this project</div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          {/* Search */}
          <div style={{ position: "relative", width: "280px" }}>
            <Search size={18} color="#94A3B8" style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)" }} />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search pipelines..." style={{ ...INTER, width: "100%", height: "36px", borderRadius: "8px", border: "1px solid #CBD5E1", background: "#fff", paddingLeft: "38px", paddingRight: "14px", fontSize: "13px", color: "#0F172A", outline: "none", boxSizing: "border-box" }} />
          </div>
          <button onClick={() => setShowModal(true)} style={{ ...INTER, display: "flex", alignItems: "center", gap: "8px", height: "36px", padding: "0 16px", borderRadius: "6px", background: "#00775B", border: "none", cursor: "pointer", fontSize: "14px", color: "#fff" }}>
            <Plus size={16} />New Pipeline
          </button>
        </div>
      </div>

      {/* Table */}
      <div style={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: "8px", overflow: "hidden" }}>
        {/* Columns toolbar */}
        <div style={{ padding: "12px 16px", borderBottom: "1px solid #E2E8F0" }}>
          <button style={{ ...INTER, display: "flex", alignItems: "center", gap: "8px", height: "32px", padding: "0 13px", border: "1px solid #CBD5E1", borderRadius: "6px", background: "transparent", cursor: "pointer", fontSize: "12px", fontWeight: 600, color: "#0F172A" }}>
            <LayoutGrid size={14} />Columns
          </button>
        </div>

        {/* Table header */}
        <div style={{ background: "#F8FAFC", display: "grid", gridTemplateColumns: "34px 44px 1fr 1fr 160px 200px 180px", borderBottom: "2px solid #00775B" }}>
          {["", "", "INFERENCE PIPELINE NAME", "INFERENCE PIPELINE ID", "NO OF CAMERAS", "UNIQUE APPLICATIONS", "STATUS"].map((col, i) => (
            <div key={i} style={{ padding: i > 1 ? "10px 16px" : "10px 8px", display: "flex", alignItems: "center", gap: "4px" }}>
              {col && <span style={{ ...INTER, fontSize: "11px", fontWeight: 400, letterSpacing: "0.05em", color: "#0F172A", textTransform: "uppercase" }}>{col}</span>}
              {col && i > 1 && <ArrowLeft size={14} color="#64748B" style={{ transform: "rotate(90deg)" }} />}
            </div>
          ))}
        </div>

        {/* Table rows */}
        {pipelines.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8", ...INTER }}>No pipelines found</div>
        ) : pipelines.map(pl => {
          const ss = statusStyle(pl.status);
          return (
            <div key={pl.id}
              onClick={() => onSelectPipeline(pl)}
              style={{ display: "grid", gridTemplateColumns: "34px 44px 1fr 1fr 160px 200px 180px", borderBottom: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", transition: "background 0.1s" }}
              onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = "#F8FAFC"}
              onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = "#fff"}>
              {/* Expand */}
              <div style={{ padding: "14px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <ChevronRight size={12} color="#94A3B8" />
              </div>
              {/* Checkbox */}
              <div style={{ padding: "14px 8px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "16px", height: "16px", borderRadius: "2.5px", border: "1px solid #767676", background: "#fff" }} />
              </div>
              {/* Name */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ width: "8px", height: "8px", borderRadius: "4px", background: ss.color, flexShrink: 0 }} />
                <span style={{ ...INTER, fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>{pl.name}</span>
              </div>
              {/* ID */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center", gap: "4px" }}>
                <span style={{ ...MONO, fontSize: "12px", color: "#0F172A" }}>{pl.pipelineId}</span>
                <button onClick={e => { e.stopPropagation(); navigator.clipboard.writeText(pl.pipelineId); }} style={{ width: "24px", height: "24px", borderRadius: "12px", border: "none", background: "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#94A3B8" }}>
                  <Copy size={14} />
                </button>
              </div>
              {/* Cameras */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center" }}>
                <span style={{ ...MONO, fontSize: "13px", color: "#0F172A" }}>{pl.cameras}</span>
              </div>
              {/* Apps */}
              <div style={{ padding: "14px 16px", display: "flex", alignItems: "center" }}>
                <span style={{ ...MONO, fontSize: "13px", color: "#0F172A" }}>{pl.apps}</span>
              </div>
              {/* Status */}
              <div style={{ padding: "12px 16px", display: "flex", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", background: ss.bg, borderRadius: "8px", padding: "4px 10px", height: "28px" }}>
                  <Play size={12} color={ss.color} />
                  <span style={{ ...INTER, fontSize: "11px", letterSpacing: "0.05em", color: ss.color, fontWeight: 500 }}>{ss.label}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
    {showModal && (
      <NewPipelineModal
        onClose={() => setShowModal(false)}
        onComplete={(dest) => { setShowModal(false); onPipelineComplete(dest); }}
      />
    )}
    </>
  );
}

// ─── Breadcrumb for pipelines page ───────────────────────────────────────────

function PipelinesBreadcrumb({ project, onBack }: { project: Project; onBack: () => void }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
      <button onClick={onBack} style={{ ...INTER, fontSize: "14px", color: "#64748B", background: "none", border: "none", cursor: "pointer", padding: 0 }}>Projects</button>
      <ChevronRight size={14} color="#64748B" />
      <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,119,91,0.25)", borderRadius: "4px", padding: "4px 8px", boxShadow: "0 1px 2px rgba(0,0,0,0.1)" }}>
        <span style={{ ...INTER, fontSize: "14px", color: "#fff" }}>Project: {project.name}</span>
        <ChevronDown size={16} color="#fff" />
      </div>
    </div>
  );
}

// ─── CAMERAS PAGE ─────────────────────────────────────────────────────────────

interface CamRow {
  id: string; name: string;
  status: "ONLINE" | "OFFLINE" | "NO HEARTBEAT";
  protocol: "RTSP" | "IP" | "FILE";
  feedPath: string; aspectRatio: string; dimensions: string;
  fps: number; recording: "ACTIVE" | "INACTIVE";
}

const CAMS_DATA: CamRow[] = [
  { id:"c01", name:"business_metric_1xp_prod11",    status:"NO HEARTBEAT", protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/business_metric_1xp",  aspectRatio:"16:9", dimensions:"1140×562",  fps:30, recording:"INACTIVE" },
  { id:"c02", name:"Car_Park_30",                    status:"NO HEARTBEAT", protocol:"RTSP", feedPath:"rtsp://admin:Aa12345678@10.11.15.30:554/cam/realmonitor",                   aspectRatio:"16:9", dimensions:"640×480",   fps:10, recording:"INACTIVE" },
  { id:"c03", name:"Car_Park_45",                    status:"NO HEARTBEAT", protocol:"RTSP", feedPath:"rtsp://admin:A12345678@10.11.15.45:554/cam/realmonitor",                    aspectRatio:"16:9", dimensions:"640×480",   fps:10, recording:"INACTIVE" },
  { id:"c04", name:"Car_Park_46",                    status:"NO HEARTBEAT", protocol:"RTSP", feedPath:"rtsp://admin:A12345678@10.11.15.46:554/cam/realmonitor",                    aspectRatio:"16:9", dimensions:"640×480",   fps:10, recording:"INACTIVE" },
  { id:"c05", name:"Alert Test (FIRE)",              status:"NO HEARTBEAT", protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/alert_test_fire",      aspectRatio:"16:9", dimensions:"640×480",   fps:10, recording:"INACTIVE" },
  { id:"c06", name:"Alert (FR)",                     status:"NO HEARTBEAT", protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/alert_fr_feed",        aspectRatio:"16:9", dimensions:"1280×720",  fps:16, recording:"INACTIVE" },
  { id:"c07", name:"Analytics thor2 fire test",      status:"NO HEARTBEAT", protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/analytics_thor2",      aspectRatio:"16:9", dimensions:"1920×1080", fps:30, recording:"INACTIVE" },
  { id:"c08", name:"Alerts (FR 2)",                  status:"NO HEARTBEAT", protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/alerts_fr2",           aspectRatio:"16:9", dimensions:"1920×1080", fps:17, recording:"INACTIVE" },
  { id:"c09", name:"Vehicle Type Analytics Thor2",   status:"NO HEARTBEAT", protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/vehicle_type_analytics",aspectRatio:"16:9", dimensions:"1920×1080", fps:30, recording:"INACTIVE" },
  { id:"c10", name:"Thor2_Business_analytics",       status:"ONLINE",       protocol:"FILE", feedPath:"https://s3.us-west-2.amazonaws.com/prod.applications/thor2_business",       aspectRatio:"16:9", dimensions:"1920×1080", fps:30, recording:"ACTIVE"   },
];

// ── Stat card (V12StatCard style, light theme) ─────────────────────────────
function VMSStatCard({ label, value, sublabel, dir, num, ref_, definition, chip, color, bg }: {
  label: string; value: string; sublabel: string;
  dir: "up" | "down" | "neutral"; num: string; ref_: string;
  definition: string; chip: string; color: string; bg: string;
}) {
  const [hov, setHov] = useState(false);
  const DirIcon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  return (
    <div onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ flex: 1, minWidth: 220, borderRadius: 4, border: `1px solid ${color}`, background: bg,
        boxShadow: hov ? `0 0 18px 4px ${color}38, 0 4px 14px rgba(0,0,0,0.07)` : `0 0 6px 1px ${color}1A, 0 1px 3px rgba(0,0,0,0.04)`,
        transition: "box-shadow 200ms", cursor: "default", display: "flex", flexDirection: "column",
    }}>
      {/* Label row */}
      <div style={{ padding: "16px 16px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#475569" }}>{label}</span>
        <span style={{ ...INTER, fontSize: 9, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", padding: "3px 8px", borderRadius: 99, backgroundColor: `${color}24`, color }}>{chip}</span>
      </div>
      {/* Value row */}
      <div style={{ padding: "12px 16px 16px", display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 12 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          <div style={{ ...MONO, fontSize: 28, fontWeight: 700, color: "#0F172A", lineHeight: 1 }}>{value}</div>
          <div style={{ ...INTER, fontSize: 12, color: "#64748B" }}>{sublabel}</div>
        </div>
        {/* BS badge */}
        <div style={{ display: "flex", flexDirection: "column", padding: "8px 10px", borderRadius: 6, backgroundColor: `${color}20`, flexShrink: 0 }}>
          <div style={{ ...MONO, fontSize: 13, fontWeight: 700, color, display: "flex", alignItems: "center", gap: 4, lineHeight: 1 }}>
            <DirIcon style={{ width: 14, height: 14 }} />{num}
          </div>
          <div style={{ ...INTER, fontSize: 10, color: "#94A3B8", marginTop: 5, lineHeight: 1 }}>{ref_}</div>
        </div>
      </div>
      {/* Divider */}
      <div style={{ height: 1, margin: "0 16px", backgroundColor: `${color}38` }} />
      {/* Definition */}
      <div style={{ padding: "12px 16px", display: "flex", alignItems: "center", gap: 8 }}>
        <span style={{ ...INTER, fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#94A3B8", flexShrink: 0 }}>Definition</span>
        <span style={{ ...INTER, fontSize: 11, color: "#475569" }}>{definition}</span>
      </div>
    </div>
  );
}

// ── Add Camera Modal ───────────────────────────────────────────────────────────
interface AddedCam { id: string; name: string; protocol: "RTSP" | "IP" | "FILE"; url: string; }

function AddCameraModal({ onClose }: { onClose: () => void }) {
  const [tab,        setTab]        = useState<"manual" | "bulk">("manual");
  const [name,       setName]       = useState("");
  const [protocol,   setProtocol]   = useState<"RTSP" | "IP" | "FILE">("RTSP");
  const [url,        setUrl]        = useState("");
  const [feedPath,   setFeedPath]   = useState("");
  const [advOpen,    setAdvOpen]    = useState(false);
  const [fps,        setFps]        = useState(15);
  const [quality,    setQuality]    = useState(80);
  const [resolution, setResolution] = useState("720p");
  const [connState,  setConnState]  = useState<"idle" | "testing" | "error" | "success">("idle");
  const [cameras,    setCameras]    = useState<AddedCam[]>([]);
  const [dragging,   setDragging]   = useState(false);
  const [fileName,   setFileName]   = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canAdd = name.trim() && (protocol === "FILE" ? !!fileName : url.trim());
  const MAX    = 10;

  const handleAdd = () => {
    if (!canAdd || cameras.length >= MAX) return;
    setCameras(p => [...p, { id: `cam-${Date.now()}`, name: name.trim(), protocol, url }]);
    setName(""); setUrl(""); setFeedPath(""); setFileName(null); setConnState("idle");
  };

  const handleTest = () => {
    if (connState === "testing") return;
    setConnState("testing");
    setTimeout(() => setConnState(prev => prev === "testing" ? (Math.random() > 0.4 ? "success" : "error") : prev), 1300);
  };

  const borderColor = (active: boolean) => active ? "#00775B" : "#E2E8F0";
  const inputStyle: React.CSSProperties = { ...INTER, width: "100%", height: 40, padding: "0 12px", borderRadius: 6, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", outline: "none", backgroundColor: "#FAFAFA", boxSizing: "border-box" as const, transition: "border-color 150ms" };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 200, backgroundColor: "rgba(0,0,0,0.55)", display: "flex", alignItems: "center", justifyContent: "center" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "min(920px, 96vw)", maxHeight: "90vh", backgroundColor: "#fff", borderRadius: 8, overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 24px 80px rgba(0,0,0,0.22)" }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "18px 24px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <div style={{ ...INTER, fontSize: 18, fontWeight: 700, color: "#0F172A" }}>Add Cameras</div>
            <div style={{ ...INTER, fontSize: 12, color: "#64748B", marginTop: 2 }}>Connect individual cameras or upload in bulk to your workspace.</div>
          </div>
          <button onClick={onClose} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #E2E8F0", background: "#F8FAFC", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <X style={{ width: 14, height: 14, color: "#64748B" }} />
          </button>
        </div>

        {/* Body — scrollable */}
        <div style={{ flex: 1, overflowY: "auto", padding: "24px" }}>
          <div style={{ display: "flex", gap: 24, alignItems: "flex-start" }}>
            {/* LEFT — form */}
            <div style={{ flex: "0 0 52%", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Tab switcher */}
              <div style={{ display: "flex", borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#F1F5F9", padding: 4, gap: 4 }}>
                {([
                  { key: "manual" as const, label: "Individual Cameras", sub: "Add one by one",  badge: "ADD"  },
                  { key: "bulk"   as const, label: "Multiple Cameras",    sub: "Upload a file",   badge: "BULK" },
                ] as const).map(item => {
                  const active = tab === item.key;
                  return (
                    <button key={item.key} onClick={() => setTab(item.key)} style={{ ...INTER, flex: 1, padding: "9px 14px", borderRadius: 6, fontSize: 13, fontWeight: active ? 600 : 400, cursor: "pointer", border: "none", transition: "all 0.18s", backgroundColor: active ? "#fff" : "transparent", color: active ? "#0F172A" : "#94A3B8", boxShadow: active ? "0 1px 3px rgba(0,0,0,0.08),0 0 0 1px rgba(0,0,0,0.04)" : "none", textAlign: "left" as const, display: "flex", flexDirection: "column" as const, gap: 2 }}>
                      <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        {item.label}
                        {active && <span style={{ ...MONO, fontSize: 8, fontWeight: 700, padding: "1px 5px", borderRadius: 3, backgroundColor: "rgba(0,119,91,0.12)", color: "#00775B" }}>{item.badge}</span>}
                      </span>
                      <span style={{ ...INTER, fontSize: 11, fontWeight: 400, color: active ? "#94A3B8" : "#CBD5E1" }}>{item.sub}</span>
                    </button>
                  );
                })}
              </div>

              {tab === "manual" && (
                <>
                  {/* Camera Name */}
                  <div>
                    <label style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#475569", marginBottom: 6, display: "block" }}>
                      Camera Name <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Main Entrance, Lobby, Loading Bay…"
                      style={inputStyle}
                      onFocus={e => { e.currentTarget.style.borderColor = "#00775B"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,119,91,0.1)"; }}
                      onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }} />
                  </div>

                  {/* Protocol */}
                  <div>
                    <label style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#475569", marginBottom: 6, display: "block" }}>
                      Protocol <span style={{ color: "#EF4444" }}>*</span>
                    </label>
                    <div style={{ display: "flex", borderRadius: 6, overflow: "hidden", border: "1.5px solid #E2E8F0", width: "fit-content" }}>
                      {(["RTSP", "IP", "FILE"] as const).map(p => (
                        <button key={p} onClick={() => { setProtocol(p); setConnState("idle"); }}
                          style={{ ...INTER, padding: "8px 24px", fontSize: 13, fontWeight: 600, cursor: "pointer", border: "none", borderRight: p !== "FILE" ? "1px solid #E2E8F0" : "none", backgroundColor: protocol === p ? "#00775B" : "#FAFAFA", color: protocol === p ? "#fff" : "#64748B", transition: "all 150ms" }}>
                          {p}
                        </button>
                      ))}
                    </div>
                  </div>

                  {(protocol === "RTSP" || protocol === "IP") && (
                    <>
                      {/* Stream URL */}
                      <div>
                        <label style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#475569", marginBottom: 6, display: "block" }}>
                          Stream URL <span style={{ color: "#EF4444" }}>*</span>
                        </label>
                        <input value={url} onChange={e => { setUrl(e.target.value); setConnState("idle"); }}
                          placeholder={protocol === "RTSP" ? "rtsp://192.168.1.100:554/stream" : "http://192.168.1.100/video"}
                          style={inputStyle}
                          onFocus={e => { e.currentTarget.style.borderColor = "#00775B"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,119,91,0.1)"; }}
                          onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }} />
                      </div>
                      {/* Feed path + Test */}
                      <div>
                        <label style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#475569", marginBottom: 6, display: "block" }}>Camera Feed Path</label>
                        <div style={{ display: "flex", gap: 8 }}>
                          <input value={feedPath} onChange={e => setFeedPath(e.target.value)} placeholder="Camera Feed Path (Optional)"
                            style={{ ...inputStyle, flex: 1 }}
                            onFocus={e => { e.currentTarget.style.borderColor = "#00775B"; e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,119,91,0.1)"; }}
                            onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; e.currentTarget.style.boxShadow = "none"; }} />
                          <button onClick={handleTest} style={{ ...INTER, flexShrink: 0, height: 40, padding: "0 16px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: connState === "testing" ? "not-allowed" : "pointer", border: `1.5px solid ${connState === "success" ? "#00775B" : connState === "error" ? "#E7000B" : "#00775B"}`, backgroundColor: connState === "success" ? "rgba(0,119,91,0.06)" : connState === "error" ? "rgba(231,0,11,0.05)" : "transparent", color: connState === "success" ? "#00775B" : connState === "error" ? "#E7000B" : "#00775B", whiteSpace: "nowrap" as const, transition: "all 150ms" }}>
                            {connState === "testing" ? "Testing…" : connState === "success" ? "✓ Connected" : connState === "error" ? "Retry Test" : "Test Connection"}
                          </button>
                        </div>
                        {connState === "error" && (
                          <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 6, backgroundColor: "rgba(231,0,11,0.04)", border: "1px solid rgba(231,0,11,0.15)", display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>⚠️</span>
                            <div style={{ ...INTER, fontSize: 12, lineHeight: 1.5 }}>
                              <div style={{ fontWeight: 600, color: "#E7000B", marginBottom: 2 }}>Connection failed</div>
                              <div style={{ color: "#64748B" }}>Unable to reach stream at the provided URL. Check the device is online, port is open, and credentials are correct.</div>
                            </div>
                          </div>
                        )}
                        {connState === "success" && (
                          <div style={{ marginTop: 8, padding: "10px 12px", borderRadius: 6, backgroundColor: "rgba(0,119,91,0.04)", border: "1px solid rgba(0,119,91,0.18)", display: "flex", gap: 8 }}>
                            <span style={{ fontSize: 14 }}>✅</span>
                            <div style={{ ...INTER, fontSize: 12, lineHeight: 1.5 }}>
                              <div style={{ fontWeight: 600, color: "#00775B", marginBottom: 4 }}>Stream verified successfully</div>
                              <div style={{ display: "flex", flexWrap: "wrap" as const, gap: 6 }}>
                                {[["Codec","H.264"],["Resolution","1920×1080"],["FPS","25"],["Latency","38 ms"]].map(([k,v]) => (
                                  <span key={k} style={{ ...MONO, fontSize: 10, padding: "2px 7px", borderRadius: 4, backgroundColor: "rgba(0,119,91,0.08)", color: "#00775B" }}>{k}: <strong>{v}</strong></span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}

                  {protocol === "FILE" && (
                    <div>
                      <label style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.05em", color: "#475569", marginBottom: 6, display: "block" }}>Video File</label>
                      <div onClick={() => fileRef.current?.click()}
                        onDragOver={e => { e.preventDefault(); setDragging(true); }}
                        onDragLeave={() => setDragging(false)}
                        onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
                        style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "32px 16px", borderRadius: 8, border: `2px dashed ${dragging ? "#00775B" : "#CBD5E1"}`, backgroundColor: dragging ? "rgba(0,119,91,0.04)" : "#FAFAFA", cursor: "pointer", transition: "all 200ms" }}>
                        <input ref={fileRef} type="file" accept=".mp4,.avi,.mov,.wmv,.flv" style={{ display: "none" }}
                          onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }} />
                        <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#00775B", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <Upload style={{ width: 20, height: 20, color: "#fff" }} />
                        </div>
                        <div style={{ ...INTER, textAlign: "center" as const }}>
                          {fileName ? (
                            <>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#00775B" }}>{fileName}</div>
                              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>Click to change file</div>
                            </>
                          ) : (
                            <>
                              <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>Drag and drop a video file here</div>
                              <div style={{ fontSize: 12, color: "#94A3B8", marginTop: 2 }}>or click to browse</div>
                              <div style={{ fontSize: 11, color: "#CBD5E1", marginTop: 6 }}>Supported: .mp4, .avi, .mov, .wmv, .flv · max 500 MB</div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Advanced accordion */}
                  <div style={{ borderRadius: 8, border: "1px solid #E2E8F0", overflow: "hidden" }}>
                    <button onClick={() => setAdvOpen(o => !o)} style={{ ...INTER, width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "11px 14px", background: "#FAFAFA", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "#00775B" }}>
                      <span>+ Advanced Configuration</span>
                      <ChevronDown style={{ width: 14, height: 14, transform: advOpen ? "rotate(180deg)" : "none", transition: "transform 150ms" }} />
                    </button>
                    {advOpen && (
                      <div style={{ padding: "16px 14px", display: "flex", flexDirection: "column", gap: 14, borderTop: "1px solid #E2E8F0" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                          <div>
                            <label style={{ ...INTER, fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 5, display: "block" }}>Resolution</label>
                            <div style={{ position: "relative" }}>
                              <select value={resolution} onChange={e => setResolution(e.target.value)} style={{ ...INTER, width: "100%", height: 38, padding: "0 32px 0 10px", borderRadius: 6, border: "1.5px solid #E2E8F0", fontSize: 13, color: "#0F172A", backgroundColor: "#FAFAFA", appearance: "none" as const, cursor: "pointer" }}>
                                {["480p","720p","1080p","4K"].map(r => <option key={r}>{r}</option>)}
                              </select>
                              <ChevronDown style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", width: 14, height: 14, color: "#94A3B8", pointerEvents: "none" }} />
                            </div>
                          </div>
                          <div>
                            <label style={{ ...INTER, fontSize: 11, fontWeight: 600, color: "#475569", marginBottom: 5, display: "block" }}>Camera Make</label>
                            <input placeholder="e.g. Hikvision" style={{ ...inputStyle, height: 38 }}
                              onFocus={e => { e.currentTarget.style.borderColor = "#00775B"; }}
                              onBlur={e  => { e.currentTarget.style.borderColor = "#E2E8F0"; }} />
                          </div>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 }}>
                          {[{ label: "Streaming FPS", value: fps, set: setFps, min: 1, max: 60, unit: " fps" }, { label: "Video Quality", value: quality, set: setQuality, min: 10, max: 100, unit: "%" }].map(s => (
                            <div key={s.label}>
                              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                                <label style={{ ...INTER, fontSize: 11, fontWeight: 600, color: "#475569" }}>{s.label}</label>
                                <span style={{ ...MONO, fontSize: 11, color: "#00775B" }}>{s.value}{s.unit}</span>
                              </div>
                              <input type="range" min={s.min} max={s.max} value={s.value} onChange={e => s.set(Number(e.target.value))}
                                style={{ width: "100%", accentColor: "#00775B", cursor: "pointer" }} />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Add button — centered */}
                  <div style={{ display: "flex", justifyContent: "center" }}>
                    <button onClick={handleAdd} disabled={!canAdd || cameras.length >= MAX}
                      style={{ ...INTER, display: "flex", alignItems: "center", gap: 8, height: 38, padding: "0 24px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: canAdd && cameras.length < MAX ? "pointer" : "not-allowed", backgroundColor: canAdd && cameras.length < MAX ? "#00775B" : "#F1F5F9", color: canAdd && cameras.length < MAX ? "#fff" : "#94A3B8", border: "none", boxShadow: canAdd && cameras.length < MAX ? "0 2px 8px rgba(0,119,91,0.25)" : "none", transition: "all 200ms" }}>
                      <Plus style={{ width: 14, height: 14 }} />
                      {cameras.length >= MAX ? `Max ${MAX} cameras reached` : "Add Camera"}
                    </button>
                  </div>
                </>
              )}

              {tab === "bulk" && (
                <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                  {/* Step 1: Download templates */}
                  <div>
                    <div style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#94A3B8", marginBottom: 8 }}>1. Download Template</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                      {[
                        { ext: "XLSX", label: "Excel Template", sub: "Download, fill and upload", color: "#1D6F42", bg: "rgba(29,111,66,0.08)", border: "rgba(29,111,66,0.19)" },
                        { ext: "CSV",  label: "CSV Template",   sub: "Download, fill and upload", color: "#2B7FFF", bg: "rgba(43,127,255,0.08)", border: "rgba(43,127,255,0.19)" },
                      ].map(t => (
                        <button key={t.ext} onClick={e => e.preventDefault()}
                          style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 6, cursor: "pointer", backgroundColor: "#fff", border: "1px solid #E2E8F0", transition: "0.15s", textAlign: "left" as const }}
                          onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.color; (e.currentTarget as HTMLButtonElement).style.backgroundColor = t.bg; }}
                          onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#E2E8F0"; (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#fff"; }}>
                          <div style={{ width: 34, height: 34, borderRadius: 5, flexShrink: 0, backgroundColor: t.bg, border: `1px solid ${t.border}`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <span style={{ ...MONO, fontSize: 8, fontWeight: 800, color: t.color, letterSpacing: "0.02em" }}>{t.ext}</span>
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ ...INTER, fontSize: 12, fontWeight: 600, color: "#334155" }}>{t.label}</div>
                            <div style={{ ...INTER, fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{t.sub}</div>
                          </div>
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: "#94A3B8" }}>
                            <path d="M7 1v8M4 6l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                      ))}
                    </div>
                  </div>
                  {/* Step 2: Upload */}
                  <div>
                    <div style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#94A3B8", marginBottom: 8 }}>2. Upload Filled File</div>
                    <div onClick={() => fileRef.current?.click()}
                      onDragOver={e => { e.preventDefault(); setDragging(true); }}
                      onDragLeave={() => setDragging(false)}
                      onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
                      style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12, padding: "32px 16px", borderRadius: 8, border: `2px dashed ${dragging ? "#00775B" : "#CBD5E1"}`, backgroundColor: dragging ? "rgba(0,119,91,0.02)" : "#FAFAFA", cursor: "pointer", transition: "all 200ms" }}>
                      <input ref={fileRef} type="file" accept=".csv,.xlsx" style={{ display: "none" }} onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }} />
                      <div style={{ width: 40, height: 40, borderRadius: "50%", backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <Upload style={{ width: 18, height: 18, color: "#64748B" }} />
                      </div>
                      <div style={{ ...INTER, textAlign: "center" as const }}>
                        {fileName ? (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#00775B" }}>{fileName}</div>
                            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>Click to change file</div>
                          </>
                        ) : (
                          <>
                            <div style={{ fontSize: 13, fontWeight: 600, color: "#0F172A" }}>Drag & drop your file here</div>
                            <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 3 }}>or click to browse · .xlsx, .csv · max 20 MB</div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* RIGHT — Added cameras */}
            <div style={{ flex: 1, borderRadius: 10, border: "1px solid #E2E8F0", backgroundColor: "#F8FAFC", overflow: "hidden", minHeight: 320, display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderBottom: "1px solid #E2E8F0", backgroundColor: "#F1F5F9" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Camera style={{ width: 13, height: 13, color: "#00775B" }} />
                  <span style={{ ...INTER, fontSize: 11, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#475569" }}>Added Cameras</span>
                </div>
                <span style={{ ...MONO, fontSize: 10, fontWeight: 700, padding: "2px 8px", borderRadius: 10, backgroundColor: cameras.length > 0 ? "rgba(0,119,91,0.12)" : "#E2E8F0", border: `1px solid ${cameras.length > 0 ? "rgba(0,119,91,0.3)" : "#CBD5E1"}`, color: cameras.length > 0 ? "#00775B" : "#94A3B8", transition: "all 0.2s" }}>
                  {cameras.length} / {MAX}
                </span>
              </div>
              <div style={{ flex: 1, padding: 14, overflowY: "auto" }}>
                {cameras.length === 0 ? (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 10, padding: "32px 16px", textAlign: "center" as const }}>
                    <div style={{ width: 44, height: 44, borderRadius: 10, backgroundColor: "#E2E8F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Camera style={{ width: 20, height: 20, color: "#94A3B8" }} />
                    </div>
                    <div>
                      <div style={{ ...INTER, fontSize: 13, fontWeight: 600, color: "#94A3B8", marginBottom: 4 }}>No cameras added yet</div>
                      <div style={{ ...INTER, fontSize: 11, color: "#CBD5E1" }}>Fill in the form and click "Add Camera"</div>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10 }}>
                    {cameras.map(cam => {
                      const pColor = cam.protocol === "RTSP" ? "#2B7FFF" : cam.protocol === "IP" ? "#7C3AED" : "#00775B";
                      return (
                        <div key={cam.id} style={{ borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#fff", padding: "10px 12px", display: "flex", flexDirection: "column", gap: 6, position: "relative" }}>
                          <button onClick={() => setCameras(p => p.filter(c => c.id !== cam.id))}
                            style={{ position: "absolute", top: 8, right: 8, width: 20, height: 20, borderRadius: 4, border: "none", backgroundColor: "#F1F5F9", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <X style={{ width: 10, height: 10, color: "#94A3B8" }} />
                          </button>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <Camera style={{ width: 12, height: 12, color: "#94A3B8", flexShrink: 0 }} />
                            <span style={{ ...INTER, fontSize: 12, fontWeight: 600, color: "#0F172A", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, paddingRight: 20 }}>{cam.name}</span>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                            <span style={{ ...MONO, fontSize: 9, fontWeight: 700, padding: "1px 6px", borderRadius: 3, backgroundColor: `${pColor}15`, color: pColor }}>{cam.protocol}</span>
                            {cam.url && <span style={{ ...MONO, fontSize: 10, color: "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, flex: 1 }}>{cam.url}</span>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: 10, padding: "16px 24px", borderTop: "1px solid #F1F5F9", backgroundColor: "#FAFAFA" }}>
          <button onClick={onClose} style={{ ...INTER, height: 38, padding: "0 18px", borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", border: "1.5px solid #E2E8F0", backgroundColor: "#fff", color: "#334155" }}>Cancel</button>
          <button style={{ ...INTER, height: 38, padding: "0 20px", borderRadius: 6, fontSize: 13, fontWeight: 700, cursor: "pointer", border: "none", backgroundColor: cameras.length > 0 ? "#00775B" : "#E2E8F0", color: cameras.length > 0 ? "#fff" : "#94A3B8", boxShadow: cameras.length > 0 ? "0 2px 8px rgba(0,119,91,0.3)" : "none", transition: "all 200ms" }}>
            Add Cameras{cameras.length > 0 ? ` (${cameras.length})` : ""}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── CamerasPage ────────────────────────────────────────────────────────────────
function CamerasPage() {
  const [search,     setSearch]     = useState("");
  const [showModal,  setShowModal]  = useState(false);
  const [hovRow,     setHovRow]     = useState<string | null>(null);
  const [selected,   setSelected]   = useState<Set<string>>(new Set());
  const [page,       setPage]       = useState(1);
  const ROWS_PER_PAGE = 10;

  const teal    = "#00956D";
  const surface = "#fff";
  const hdr     = "#F8FAFC";
  const sec     = "#64748B";
  const border  = "#E2E8F0";

  const filtered = CAMS_DATA.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.protocol.toLowerCase().includes(search.toLowerCase())
  );
  const totalPages    = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const paginated     = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);
  const pageIds       = paginated.map(r => r.id);
  const allPageSel    = pageIds.length > 0 && pageIds.every(id => selected.has(id));
  const someSel       = pageIds.some(id => selected.has(id)) && !allPageSel;

  const toggleAll  = () => setSelected(p => { const n = new Set(p); allPageSel ? pageIds.forEach(id => n.delete(id)) : pageIds.forEach(id => n.add(id)); return n; });
  const toggleRow  = (id: string) => setSelected(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const statusBadge = (s: CamRow["status"]) => {
    const cfg = s === "ONLINE" ? { bg: "rgba(5,150,105,0.12)", color: "#059669", label: "ONLINE" }
      : s === "OFFLINE" ? { bg: "rgba(239,68,68,0.12)", color: "#EF4444", label: "OFFLINE" }
      : { bg: "rgba(234,88,12,0.12)", color: "#EA580C", label: "NO HEARTBEAT" };
    return (
      <span style={{ ...INTER, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 4, backgroundColor: cfg.bg, color: cfg.color, whiteSpace: "nowrap" as const }}>
        {cfg.label}
      </span>
    );
  };

  // V2.3 checkbox
  const Chk = ({ checked, indeterminate, onChange }: { checked: boolean; indeterminate?: boolean; onChange: () => void }) => (
    <div onClick={e => { e.stopPropagation(); onChange(); }}
      style={{ width: 15, height: 15, borderRadius: 3, border: `1.5px solid ${checked || indeterminate ? teal : "#CBD5E1"}`, backgroundColor: checked ? teal : "transparent", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 100ms" }}>
      {checked && <Check style={{ width: 9, height: 9, color: "#fff" }} />}
      {indeterminate && !checked && <Minus style={{ width: 9, height: 9, color: teal }} />}
    </div>
  );

  const cols = [
    { key: "name",        label: "Camera Name",  w: 260 },
    { key: "status",      label: "Status",        w: 130 },
    { key: "protocol",    label: "Protocol",      w: 80  },
    { key: "feedPath",    label: "Feed Path",     w: 220 },
    { key: "aspectRatio", label: "Aspect Ratio",  w: 90  },
    { key: "dimensions",  label: "Dimensions",    w: 100 },
    { key: "fps",         label: "Stream FPS",    w: 90  },
    { key: "recording",   label: "Recording",     w: 90  },
  ] as const;

  const totalW = 44 + cols.reduce((s, c) => s + c.w, 0);

  const rowBg = (idx: number, hov: boolean, sel: boolean) => {
    if (hov) return "#EBF5F1";
    if (sel) return "#F2FAF7";
    return idx % 2 === 1 ? "#F8FDFC" : "#fff";
  };

  return (
    <div style={{ flex: 1, background: "#F1F5F9", borderTopLeftRadius: 16, overflowY: "auto", overflowX: "hidden", padding: 24, minWidth: 0 }}>
      {/* ── Page header ── */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
        <div>
          <div style={{ ...INTER, fontSize: 20, fontWeight: 700, color: "#0F172A" }}>Cameras</div>
          <div style={{ ...INTER, fontSize: 12, color: "#64748B", marginTop: 2 }}>{CAMS_DATA.length} cameras · Matrice Primary Account</div>
        </div>
        <button onClick={() => setShowModal(true)} style={{ ...INTER, display: "flex", alignItems: "center", gap: 8, height: 36, padding: "0 16px", borderRadius: 6, backgroundColor: "#00775B", border: "none", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer", boxShadow: "0 2px 8px rgba(0,119,91,0.28)" }}>
          <Plus style={{ width: 15, height: 15 }} /> Add Camera(s)
        </button>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: "flex", gap: 16, marginBottom: 24 }}>
        <VMSStatCard label="Cameras Online"     value="1/243"   sublabel="Active live streams"                  dir="up"      num="+1"  ref_="vs yesterday" definition="Reachable cameras streaming live right now"    chip="LIVE"         color="#2B7FFF" bg="#EFF5FF" />
        <VMSStatCard label="Cameras Offline"    value="0/243"   sublabel="Stream unreachable"                   dir="neutral" num="-0"  ref_="vs yesterday" definition="Cameras the stream can't currently reach"        chip="ALERT"        color="#EF4444" bg="#FFF1F1" />
        <VMSStatCard label="With Applications"  value="184/243" sublabel="Running at least one inference app"   dir="neutral" num="-0"  ref_="vs yesterday" definition="Cameras running at least one inference app"      chip="APPS"         color="#00775B" bg="#EDFAF5" />
        <VMSStatCard label="Avg Stream FPS"     value="29"      sublabel="Mean configured frame rate"           dir="neutral" num="-0"  ref_="vs yesterday" definition="Mean configured frame rate across cameras"       chip="PERFORMANCE"  color="#64748B" bg="#F4F6F9" />
      </div>

      {/* ── Table (V2.3 style) ── */}
      <div style={{ borderRadius: 8, border: `1px solid ${border}`, overflow: "hidden" }}>

        {/* Toolbar */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "10px 16px 10px", backgroundColor: surface, borderBottom: `2px solid ${teal}` }}>
          {/* Columns button */}
          <button style={{ ...INTER, display: "flex", alignItems: "center", gap: 6, height: 32, padding: "0 12px", border: `1px solid ${border}`, borderRadius: 6, backgroundColor: "#F8FAFC", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#334155" }}>
            <LayoutGrid style={{ width: 13, height: 13 }} /> Columns
          </button>
          {/* Search */}
          <div style={{ position: "relative", width: 280 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
            <input type="text" placeholder="Search cameras, feed paths…" value={search} onChange={e => { setSearch(e.target.value); setPage(1); }}
              style={{ ...INTER, width: "100%", height: 32, paddingLeft: 34, paddingRight: search ? 28 : 4, fontSize: 12, color: "#1E293B", backgroundColor: "transparent", border: "none", borderBottom: `2px solid ${border}`, borderRadius: 0, outline: "none", transition: "border-bottom-color 200ms" }}
              onFocus={e  => { e.target.style.borderBottomColor = teal; }}
              onBlur={e   => { e.target.style.borderBottomColor = border; }} />
            {search && <button onClick={() => { setSearch(""); setPage(1); }} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}><X style={{ width: 12, height: 12 }} /></button>}
          </div>
          {/* Status filter */}
          <button style={{ ...INTER, display: "flex", alignItems: "center", gap: 5, padding: "4px 2px", border: "none", borderBottom: `2px solid transparent`, borderRadius: 0, background: "transparent", cursor: "pointer", fontSize: 12, fontWeight: 600, color: "#64748B" }}>
            <Filter style={{ width: 12, height: 12 }} /> Status
          </button>
          {/* Right cluster */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 10 }}>
            {selected.size > 0 && (
              <span style={{ ...INTER, fontSize: 12, fontWeight: 700, color: teal }}>{selected.size} selected</span>
            )}
            <span style={{ ...INTER, fontSize: 12, color: sec }}>{filtered.length} of {CAMS_DATA.length} cameras</span>
          </div>
        </div>

        {/* Table scroll area */}
        <div style={{ overflowX: "auto", backgroundColor: surface }}>
          {/* Header */}
          <div style={{ display: "flex", alignItems: "center", height: 44, backgroundColor: hdr, minWidth: totalW, borderBottom: `1px solid ${border}` }}>
            <div style={{ width: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Chk checked={allPageSel} indeterminate={someSel} onChange={toggleAll} />
            </div>
            {cols.map(col => (
              <div key={col.key} style={{ flexShrink: 0, width: col.w, paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", gap: 4 }}>
                <span style={{ ...INTER, fontSize: 12, fontWeight: 700, color: "#1E293B", textTransform: "uppercase" as const, letterSpacing: "0.05em" }}>{col.label}</span>
                <SortAsc style={{ width: 10, height: 10, color: "#CBD5E1", flexShrink: 0 }} />
              </div>
            ))}
          </div>

          {/* Rows */}
          {paginated.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, ...INTER, fontSize: 12, color: sec }}>
              No cameras match "{search}".{" "}<button onClick={() => setSearch("")} style={{ marginLeft: 8, color: teal, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clear</button>
            </div>
          ) : paginated.map((cam, idx) => {
            const isSel = selected.has(cam.id);
            const isHov = hovRow === cam.id;
            const bg    = rowBg(idx, isHov, isSel);

            return (
              <div key={cam.id} onMouseEnter={() => setHovRow(cam.id)} onMouseLeave={() => setHovRow(null)}
                style={{ display: "flex", alignItems: "center", minHeight: 44, minWidth: totalW, backgroundColor: bg, borderBottom: `1px solid #F1F5F9`, position: "relative", transition: "background-color 100ms" }}>
                {/* Severity strip */}
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, backgroundColor: cam.status === "ONLINE" ? "#059669" : cam.status === "OFFLINE" ? "#EF4444" : "#EA580C", opacity: isHov || isSel ? 1 : 0, transition: "opacity 100ms" }} />
                <div style={{ width: 44, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Chk checked={isSel} onChange={() => toggleRow(cam.id)} />
                </div>
                {cols.map(col => {
                  const s: React.CSSProperties = { ...INTER, fontSize: 12, color: isHov ? "#0F172A" : "#334155" };
                  const mono: React.CSSProperties = { ...MONO, fontSize: 12, color: isHov ? "#0F172A" : sec };
                  let cell: React.ReactNode;
                  if (col.key === "name") cell = (
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <Camera style={{ width: 13, height: 13, color: "#94A3B8", flexShrink: 0 }} />
                      <span style={{ ...s, fontWeight: 500, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const }}>{cam.name}</span>
                    </div>
                  );
                  else if (col.key === "status") cell = statusBadge(cam.status);
                  else if (col.key === "protocol") cell = <span style={{ ...MONO, fontSize: 11, fontWeight: 700, color: cam.protocol === "RTSP" ? "#2B7FFF" : cam.protocol === "IP" ? "#7C3AED" : "#00775B" }}>{cam.protocol}</span>;
                  else if (col.key === "feedPath") cell = <span style={{ ...mono, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" as const, maxWidth: 200 }}>{cam.feedPath}</span>;
                  else if (col.key === "aspectRatio") cell = <span style={mono}>{cam.aspectRatio}</span>;
                  else if (col.key === "dimensions")  cell = <span style={mono}>{cam.dimensions}</span>;
                  else if (col.key === "fps") cell = <span style={mono}>{cam.fps} fps</span>;
                  else if (col.key === "recording") cell = (
                    <span style={{ ...INTER, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", padding: "3px 8px", borderRadius: 4, backgroundColor: cam.recording === "ACTIVE" ? "rgba(5,150,105,0.10)" : "rgba(100,116,139,0.10)", color: cam.recording === "ACTIVE" ? "#059669" : "#64748B" }}>{cam.recording}</span>
                  );
                  return (
                    <div key={col.key} style={{ flexShrink: 0, width: col.w, paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", minHeight: 44, overflow: "hidden" }}>
                      {cell}
                    </div>
                  );
                })}
                {/* Floating CTA */}
                <div style={{ position: "sticky", right: 0, zIndex: 4, flexShrink: 0, height: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 4, paddingLeft: 32, paddingRight: 12, background: `linear-gradient(to right, ${bg}00 0%, ${bg} 32px)`, opacity: isHov ? 1 : 0, pointerEvents: isHov ? "auto" : "none", transition: "opacity 120ms" }}>
                  <button style={{ ...INTER, display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 5, border: `1px solid ${border}`, backgroundColor: "#F1F5F9", cursor: "pointer", color: "#64748B", fontSize: 11, fontWeight: 600, transition: "all 100ms" }}
                    onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = teal; (e.currentTarget as HTMLButtonElement).style.color = "#fff"; (e.currentTarget as HTMLButtonElement).style.borderColor = teal; }}
                    onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.backgroundColor = "#F1F5F9"; (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.borderColor = border; }}>
                    <Video style={{ width: 12, height: 12 }} /> View
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 16px", borderTop: `1px solid #F1F5F9`, backgroundColor: surface }}>
          <span style={{ ...INTER, fontSize: 12, color: sec }}>Showing {(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filtered.length)} of {filtered.length}</span>
          <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <button onClick={() => setPage(1)} disabled={page === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", backgroundColor: "#F1F5F9", color: page === 1 ? "#CBD5E1" : "#475569", transition: "all 120ms" }}>
              <ChevronsLeft style={{ width: 13, height: 13 }} />
            </button>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", backgroundColor: "transparent", color: page === 1 ? "#CBD5E1" : "#475569" }}>
              <ChevronLeft style={{ width: 13, height: 13 }} />
            </button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              const p = Math.max(1, Math.min(totalPages - 4, page - 2)) + i;
              return (
                <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: 4, border: page === p ? `1px solid ${teal}40` : "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono',monospace", backgroundColor: page === p ? teal : "#F1F5F9", color: page === p ? "#fff" : "#94A3B8", transition: "all 120ms" }}>
                  {p}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", backgroundColor: "transparent", color: page === totalPages ? "#CBD5E1" : "#475569" }}>
              <ChevronRight style={{ width: 13, height: 13 }} />
            </button>
            <button onClick={() => setPage(totalPages)} disabled={page === totalPages} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", backgroundColor: "#F1F5F9", color: page === totalPages ? "#CBD5E1" : "#475569" }}>
              <ChevronsRight style={{ width: 13, height: 13 }} />
            </button>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <span style={{ ...INTER, fontSize: 12, color: sec }}>Rows per page</span>
            <select defaultValue={10} style={{ ...INTER, height: 28, padding: "0 8px", borderRadius: 4, border: `1px solid ${border}`, fontSize: 12, color: "#334155", cursor: "pointer" }}>
              <option>10</option><option>25</option><option>50</option>
            </select>
          </div>
        </div>
      </div>

      {showModal && <AddCameraModal onClose={() => setShowModal(false)} />}
    </div>
  );
}

// ─── Root component ───────────────────────────────────────────────────────────

export function VMSHomePage({ onLaunchSetup, onPlatformSwitch }: VMSHomePageProps) {
  const [page, setPage] = useState<VMSNavPage>("projects");
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const handlePlatformSwitch = (app: string) => {
    if (app === "vms") return; // already here
    onPlatformSwitch?.(app);
  };

  const handleNavClick = (label: string) => {
    if (label === "Projects") { setPage("projects"); setSelectedProject(null); setSelectedPipeline(null); }
    if (label === "Pipelines" && selectedProject) setPage("pipelines");
    if (label === "Cameras")  { setPage("cameras"); setSelectedProject(null); setSelectedPipeline(null); }
  };

  const handleSelectProject = (p: Project) => {
    setSelectedProject(p);
    setPage("pipelines");
    setSelectedPipeline(null);
  };

  const handleSelectPipeline = (p: Pipeline) => {
    setSelectedPipeline(p);
    setPage("streaming");
  };

  // Streaming page — render VMSPlatform full-screen
  if (page === "streaming") {
    return (
      <VMSPlatform
        onPlatformSwitch={(app) => {
          if (app === "vms") { setPage("pipelines"); return; }
          onPlatformSwitch?.(app);
        }}
      />
    );
  }

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", ...INTER }}>
      <VMSSidebar
        activePage={page}
        onPlatformSwitch={handlePlatformSwitch}
        onNavClick={handleNavClick}
      />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", background: "#001E18", minWidth: 0 }}>
        <VMSHeader
          breadcrumb={
            page === "pipelines" && selectedProject
              ? <PipelinesBreadcrumb project={selectedProject} onBack={() => { setPage("projects"); setSelectedProject(null); }} />
              : undefined
          }
        />

        {page === "cameras" && <CamerasPage />}
        {page === "projects" && (
          <ProjectsContent onSelectProject={handleSelectProject} onLaunchSetup={onLaunchSetup} />
        )}
        {page === "pipelines" && selectedProject && (
          <PipelinesContent
            project={selectedProject}
            onSelectPipeline={handleSelectPipeline}
            onBack={() => { setPage("projects"); setSelectedProject(null); }}
            onPipelineComplete={(dest) => {
              if (dest === "analytics") { onPlatformSwitch?.("analytics"); }
              else { setPage("streaming"); }
            }}
          />
        )}
      </div>
    </div>
  );
}
