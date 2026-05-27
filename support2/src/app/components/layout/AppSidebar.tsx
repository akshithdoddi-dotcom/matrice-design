"use client";

import { useState } from "react";
import {
  Server,
  Cpu,
  Camera,
  FolderOpen,
  Settings,
  HelpCircle,
  Monitor,
  BarChart3,
  Store,
  Wrench,
  Shield,
  Check,
  ChevronsUpDown,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  LogOut,
  User,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ── Page type ──────────────────────────────────────────────────────────────
export type Page =
  | "dashboard"
  | "support-desk"
  | "all-clusters"
  | "compute"
  | "cameras"
  | "projects"
  | "pipeline-detail"
  | "project-view"
  | "system-flow"
  | "gateways"
  | "ml-apps"
  | "command-centre"
  | "resource-visualizer"
  | "pipeline-view"
  | "camera-logs"
  | "settings";

// ── Matrice icon ───────────────────────────────────────────────────────────
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
    <path d="M33.3297 59.9718H33.3048C30.6873 59.8101 28.7179 60.5065 27.2471 61.9866C26.0381 63.193 25.365 64.7103 25.2029 66.2898C25.2528 66.6007 25.2279 66.9365 25.178 67.2599C25.0284 68.1181 24.5423 68.9265 23.7571 69.4737C22.6228 70.2697 21.0523 70.2945 19.9056 69.511C18.0608 68.2673 17.8988 65.7426 19.3821 64.2501C19.918 63.7153 20.5911 63.392 21.2891 63.2925C22.4109 63.2303 23.9066 63.0313 25.34 62.3597C26.4868 61.2155 27.9576 59.7479 28.5683 55.8551C28.5683 55.6312 28.5434 55.3949 28.506 55.171C28.4686 53.8278 28.9547 52.4971 29.9643 51.4897C32.1581 49.3007 35.8724 49.5868 37.6798 52.3105C38.7766 53.9771 38.7393 56.2157 37.5925 57.845C36.558 59.3126 34.9625 60.0215 33.3546 59.9842L33.3297 59.9718Z" fill="#00956D" />
    <path d="M69.564 74.461H69.5266C65.9992 74.5107 63.07 76.8862 62.4094 79.7716C62.2848 80.3313 61.3624 84.0002 56.439 85.2564C53.8464 82.4456 52.6623 74.9087 56.2894 74.1749C57.58 73.4785 61.9981 70.5184 62.048 67.5584C61.8236 61.6632 68.866 58.0689 73.5775 61.7876C78.7752 65.8545 75.9831 74.1998 69.5515 74.4734L69.564 74.461Z" fill="#00956D" />
    <path d="M86.079 55.7556C86.079 55.4944 86.054 55.2705 86.0166 55.0467C85.705 51.4896 88.8211 47.858 92.4109 47.6341C95.2154 48.0197 97.272 44.699 95.6392 42.3484C93.9191 39.7241 89.8058 40.744 89.407 43.7289C89.5815 47.7336 85.9419 51.2658 81.9533 50.9673C81.7289 50.9673 81.4921 50.9424 81.2677 50.9051H81.2428C76.3318 50.7434 74.1506 57.248 78.4009 60.0588C81.7164 62.285 86.2909 59.5986 86.079 55.7431V55.7556Z" fill="#00956D" />
    <path d="M38.4526 31.5157C38.4526 31.2545 38.4277 31.0306 38.3903 30.8068C38.0787 27.2497 41.1948 23.6181 44.7845 23.3942C47.589 23.7798 49.6456 20.4591 48.0128 18.1085C46.2927 15.4842 42.1795 16.5041 41.7806 19.489C41.9551 23.4937 38.3155 27.0259 34.3269 26.7274C34.1025 26.7274 33.8657 26.7025 33.6414 26.6652H33.6164C28.7055 26.5035 26.5242 33.0081 30.7746 35.8189C34.0901 38.0452 38.6645 35.3587 38.4526 31.5032V31.5157Z" fill="#00956D" />
    <circle cx="33.454" cy="78.279" r="5.000" fill="#00956D" />
  </svg>
);

// ── Platform switcher data ─────────────────────────────────────────────────
const platforms = [
  { id: "vms",         icon: Monitor,  label: "Matrice VMS",         shortcut: "1" },
  { id: "analytics",   icon: BarChart3,label: "Matrice Analytics",   shortcut: "2" },
  { id: "training",    icon: Cpu,      label: "Matrice Training",    shortcut: "3" },
  { id: "marketplace", icon: Store,    label: "Matrice Marketplace", shortcut: "4" },
  { id: "support",     icon: Wrench,   label: "Matrice Support",     shortcut: "5", active: true },
  { id: "internal",    icon: Shield,   label: "Matrice Internal",    shortcut: "6" },
];

// ── Nav items (NOTE: actual nav is driven by AppLayout → AppShell navItems prop)
// Base items — always visible
const NAV_ITEMS_BASE: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "support-desk", label: "All Clusters", icon: Server },
];
// Cluster-scoped items — only shown when a cluster is selected
const NAV_ITEMS_CLUSTER: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "projects", label: "Projects", icon: FolderOpen },
  { id: "compute",  label: "Compute",  icon: Cpu        },
  { id: "cameras",  label: "Cameras",  icon: Camera     },
];

// ── Props ─────────────────────────────────────────────────────────────────
interface AppSidebarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
  isDark: boolean;
  onToggleDark: () => void;
  onPlatformSwitch?: (app: string) => void;
}

export function AppSidebar({
  activePage,
  onPageChange,
  collapsed,
  onToggleCollapse,
  isDark,
  onToggleDark,
  onPlatformSwitch,
}: AppSidebarProps) {
  const [platformOpen, setPlatformOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const w = collapsed ? "w-[60px]" : "w-[224px]";

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-[#021d18] border-r border-[#00775B]/15 transition-all duration-200 flex-shrink-0",
        w
      )}
    >
      {/* ── Platform header ─────────────────────────────────────────── */}
      <div className="relative px-2 py-3 border-b border-[#00775B]/15">
        <button
          onClick={() => setPlatformOpen((v) => !v)}
          className="w-full flex items-center gap-2 p-1.5 rounded-lg hover:bg-white/5 transition-colors"
        >
          <div className="w-8 h-8 flex-shrink-0 rounded-lg bg-[#001410] border border-[#00775B]/30 p-1 flex items-center justify-center">
            <MatriceIcon />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1 text-left min-w-0">
                <div className="text-[13px] font-semibold text-white truncate leading-tight">Matrice AI</div>
                <div className="text-[10px] text-white/50 truncate leading-tight">Support Platform</div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
            </>
          )}
        </button>

        {/* Platform dropdown */}
        {platformOpen && (
          <div className="absolute left-2 right-2 top-full mt-1 z-50 bg-[#021d18] border border-[#00775B]/20 rounded-lg shadow-xl overflow-hidden">
            <div className="px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] text-white/30">Platforms</div>
            {platforms.map((p) => (
              <button
                key={p.shortcut}
                className="w-full flex items-center gap-2.5 px-3 py-2 hover:bg-white/5 transition-colors"
                onClick={() => { setPlatformOpen(false); onPlatformSwitch?.(p.id); }}
              >
                <div className="w-5 h-5 rounded border border-white/15 flex items-center justify-center flex-shrink-0">
                  <p.icon className="w-3 h-3 text-white/60" />
                </div>
                <span className="flex-1 text-left text-[12px] text-white/80">{p.label}</span>
                {p.active && <Check className="w-3 h-3 text-[#00775B]" />}
                <kbd className="text-[9px] font-mono text-white/30 border border-white/15 rounded px-1">⌘{p.shortcut}</kbd>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── Main nav ───────────────────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto py-2 px-2 space-y-0.5">
        {NAV_ITEMS_BASE.map((item) => {
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              title={collapsed ? item.label : undefined}
              className={cn(
                "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left",
                isActive
                  ? "bg-[#00775B] text-white"
                  : "text-white/60 hover:text-white hover:bg-white/5"
              )}
            >
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{item.label}</span>}
            </button>
          );
        })}
      </nav>

      {/* ── Footer ─────────────────────────────────────────────────── */}
      <div className="px-2 pb-3 space-y-0.5 border-t border-[#00775B]/15 pt-2">
        <button
          onClick={() => onPageChange("settings")}
          className={cn(
            "w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-150 text-left",
            activePage === "settings"
              ? "bg-[#00775B] text-white"
              : "text-white/60 hover:text-white hover:bg-white/5"
          )}
        >
          <Settings className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Settings</span>}
        </button>

        <button className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-[13px] font-medium text-white/60 hover:text-white hover:bg-white/5 transition-all duration-150 text-left">
          <HelpCircle className="w-4 h-4 flex-shrink-0" />
          {!collapsed && <span>Help & Support</span>}
        </button>

        {/* User row */}
        <div className="relative">
          <button
            onClick={() => setProfileOpen((v) => !v)}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <div className="w-7 h-7 rounded-full bg-[#00775B] flex items-center justify-center text-white text-[11px] font-bold flex-shrink-0">
              MF
            </div>
            {!collapsed && (
              <>
                <div className="flex-1 min-w-0 text-left">
                  <div className="text-[12px] font-medium text-white truncate">Mohammed F</div>
                  <div className="text-[10px] text-white/40 truncate">mohammed.usman@matrice.ai</div>
                </div>
                <ChevronsUpDown className="w-3.5 h-3.5 text-white/30 flex-shrink-0" />
              </>
            )}
          </button>

          {profileOpen && (
            <div className="absolute bottom-full left-0 right-0 mb-1 bg-[#021d18] border border-[#00775B]/20 rounded-lg shadow-xl overflow-hidden z-50">
              <button
                onClick={onToggleDark}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-white/70 hover:text-white text-[12px]"
              >
                {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                {isDark ? "Light Mode" : "Dark Mode"}
              </button>
              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-white/70 hover:text-white text-[12px]">
                <User className="w-3.5 h-3.5" />
                Profile
              </button>
              <div className="h-px bg-white/10 mx-2" />
              <button className="w-full flex items-center gap-2.5 px-3 py-2.5 hover:bg-white/5 transition-colors text-red-400/80 hover:text-red-400 text-[12px]">
                <LogOut className="w-3.5 h-3.5" />
                Logout
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ── Collapse toggle ────────────────────────────────────────── */}
      <button
        onClick={onToggleCollapse}
        className="absolute bottom-[120px] -right-3 w-6 h-6 rounded-full bg-[#021d18] border border-[#00775B]/20 flex items-center justify-center text-white/40 hover:text-white/80 transition-colors z-10 shadow-sm"
        style={{ position: "relative", alignSelf: "flex-end", marginRight: "-12px", marginBottom: "0" }}
      >
        {collapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>
    </aside>
  );
}

// ── Header component ───────────────────────────────────────────────────────
export function AppHeader({ activePage, title }: { activePage: Page; title: string }) {
  return (
    <header className="h-12 flex items-center gap-3 bg-[#021d18] text-white px-4 border-b border-[#00775B]/15 flex-shrink-0">
      {/* Page title */}
      <div className="flex-1 text-[13px] text-white/50 font-normal">{title}</div>

      {/* Live badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00775B] rounded-full text-white text-[11px] font-semibold shadow-md shadow-[#00775B]/30">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        LIVE
      </div>

      {/* Search */}
      <div className="hidden md:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 text-[12px] text-white/40 bg-white/5 hover:bg-white/8 cursor-pointer transition-colors min-w-[140px]">
        <Search className="w-3.5 h-3.5 flex-shrink-0" />
        <span className="flex-1">Search</span>
        <span className="text-[10px] font-mono text-white/30 border border-white/15 rounded px-1">⌘K</span>
      </div>

      {/* Bell */}
      <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
        <Bell className="w-4 h-4" />
        <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#021d18]" />
      </button>

      {/* User avatar */}
      <div className="h-8 w-8 rounded-full bg-[#00775B] flex items-center justify-center text-white text-[11px] font-bold ring-2 ring-transparent hover:ring-[#00775B]/40 transition-all cursor-pointer">
        MF
      </div>
    </header>
  );
}
