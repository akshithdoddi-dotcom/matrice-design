import { useState, useRef, useEffect } from "react";
import { cn } from "@/app/lib/utils";
import {
  LayoutDashboard, ShieldAlert, Map, TrendingUp, ShoppingBag,
  Settings, HelpCircle, ChevronDown, ChevronUp, Check,
  ScanFace, CarFront, Video, ClipboardCheck, MapPin, Fingerprint, ShieldCheck, Layers, Timer, Users,
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────────
export type Page =
  | "dashboard" | "dashboard-2" | "dashboard-3" | "incident-lifecycle" | "volume" | "incident" | "zone" | "quality" | "safety" | "identity"
  | "facial-recognition" | "license-plates" | "cameras" | "metrics" | "compliance"
  | "design-system" | "settings" | "service" | "sample-analytics" | "microservices";

interface SidebarProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  collapsed?: boolean;
  noTransition?: boolean;
}

// ─── Platform Switcher data ────────────────────────────────────────────────────
const PLATFORMS = [
  { id: "vms",       name: "Matrice VMS",       shortcut: "1", icon: "🎥" },
  { id: "analytics", name: "Matrice Analytics",  shortcut: "2", icon: "📊", active: true },
  { id: "support",   name: "Matrice Support",    shortcut: "3", icon: "🎧", checked: true },
  { id: "internal",  name: "Matrice Internal",   shortcut: "4", icon: "🛡" },
];

// ─── Nav items (flat list) ─────────────────────────────────────────────────────
const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard",          label: "Dashboard",           icon: LayoutDashboard },
  { id: "volume",             label: "Volume Analytics",    icon: TrendingUp },
  { id: "incident",           label: "Incident Analytics",  icon: ShieldAlert,    badge: 3 },
  { id: "zone",               label: "Zone Analytics",      icon: MapPin },
  { id: "quality",            label: "Quality Analytics",   icon: ShoppingBag },
  { id: "safety",             label: "Safety Analytics",    icon: ShieldCheck },
  { id: "identity",           label: "Identity Analytics",  icon: Fingerprint },
  { id: "service",            label: "Service Analytics",   icon: Timer },
  { id: "cameras",            label: "Cameras",             icon: Video },
  { id: "metrics",            label: "Metrics & Rules",     icon: Map },
  { id: "design-system",      label: "Component Library",   icon: Layers },
  { id: "sample-analytics",  label: "Staff Monitoring",    icon: Users },
];

// ─── Matrice icon mark (green dot-grid) ───────────────────────────────────────
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

// ─── Tooltip wrapper for collapsed nav items ──────────────────────────────────
const NavTooltip = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="relative group/tip">
    {children}
    {/* Tooltip — rendered to the right of the icon */}
    <div className="pointer-events-none absolute left-full top-1/2 -translate-y-1/2 ml-3 z-[9999]
                    opacity-0 group-hover/tip:opacity-100 transition-opacity duration-150 delay-75">
      {/* left-pointing caret */}
      <span className="absolute -left-1.5 top-1/2 -translate-y-1/2
                       border-[6px] border-transparent border-r-[#1e293b]" />
      <span className="block bg-[#1e293b] text-white text-xs font-medium
                       px-2.5 py-1.5 rounded-md shadow-xl whitespace-nowrap border border-white/10">
        {label}
      </span>
    </div>
  </div>
);

// ─── Platform Switcher Popover ─────────────────────────────────────────────────
const PlatformSwitcher = ({ onClose }: { onClose: () => void }) => (
  <div className="absolute left-3 top-[calc(100%+6px)] w-56 z-50 bg-white rounded-xl shadow-2xl border border-neutral-100 overflow-hidden">
    <div className="px-3 pt-3 pb-1">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Platforms</p>
    </div>
    <div className="py-1">
      {PLATFORMS.map((p) => (
        <button
          key={p.id}
          onClick={onClose}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 text-sm font-medium transition-colors",
            p.active ? "bg-[#00775B] text-white" : "text-neutral-700 hover:bg-neutral-50"
          )}
        >
          <span className="text-base leading-none">{p.icon}</span>
          <span className="flex-1 text-left">{p.name}</span>
          {p.checked && !p.active && <Check className="w-3.5 h-3.5 text-[#00775B] shrink-0" />}
          <kbd className={cn(
            "text-[10px] font-mono px-1.5 py-0.5 rounded border shrink-0",
            p.active ? "bg-white/20 border-white/30 text-white" : "bg-neutral-100 border-neutral-200 text-neutral-500"
          )}>⌘{p.shortcut}</kbd>
        </button>
      ))}
    </div>
    <div className="h-px bg-neutral-100 mx-3" />
    <div className="px-3 py-2">
      <p className="text-[10px] text-neutral-400 text-center">Keyboard shortcuts active</p>
    </div>
  </div>
);

// ─── Sidebar ───────────────────────────────────────────────────────────────────
export const Sidebar = ({ activePage, onPageChange, collapsed = false, noTransition = false }: SidebarProps) => {
  const [platformOpen, setPlatformOpen] = useState(false);
  const platformRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (platformRef.current && !platformRef.current.contains(e.target as Node))
        setPlatformOpen(false);
    };
    if (platformOpen) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [platformOpen]);

  // Close platform switcher when collapsing
  useEffect(() => {
    if (collapsed) setPlatformOpen(false);
  }, [collapsed]);

  return (
    <aside className={cn(
      "hidden lg:flex flex-col bg-[#021d18] h-screen fixed left-0 top-0 z-40 border-r border-[#00775B]/15",
      !noTransition && "transition-all duration-300",
      collapsed ? "overflow-visible" : "overflow-hidden",
      collapsed ? "w-14" : "w-56"
    )}>

      {/* ── Brand / Platform Switcher ── */}
      <div ref={platformRef} className="relative border-b border-white/5 shrink-0">
        {collapsed ? (
          /* Collapsed: just the icon mark, centred */
          <div className="flex items-center justify-center py-3.5">
            <div className="w-8 h-8 rounded-lg bg-[#012a1f] border border-[#00775B]/30 flex items-center justify-center p-1.5">
              <MatriceIcon />
            </div>
          </div>
        ) : (
          /* Expanded: full brand + switcher */
          <div className="px-3 pt-4 pb-3">
            <button
              onClick={() => setPlatformOpen((o) => !o)}
              className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/5 transition-colors group"
            >
              <div className="w-9 h-9 rounded-lg bg-[#012a1f] border border-[#00775B]/30 flex items-center justify-center shrink-0 p-1.5">
                <MatriceIcon />
              </div>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-bold text-white leading-tight">Matrice AI</p>
                <p className="text-[10px] text-white/50 leading-tight">Analytics Platform</p>
              </div>
              {platformOpen
                ? <ChevronUp   className="w-3.5 h-3.5 text-white/40 shrink-0" />
                : <ChevronDown className="w-3.5 h-3.5 text-white/40 shrink-0" />
              }
            </button>
            {platformOpen && <PlatformSwitcher onClose={() => setPlatformOpen(false)} />}
          </div>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className={cn("flex-1 py-3 space-y-0.5", collapsed ? "px-1.5 overflow-visible" : "px-3 overflow-y-auto custom-scrollbar")}>
        {NAV_ITEMS.map((item) => {
          const isActive = activePage === item.id;
          const btn = (
            <button
              key={item.id}
              onClick={() => onPageChange(item.id)}
              className={cn(
                "w-full flex items-center rounded-lg text-sm font-medium transition-all relative",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5",
                isActive
                  ? "bg-[#00775B] text-white shadow-md shadow-[#00775B]/20"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5"
              )}
            >
              <item.icon className={cn("shrink-0", collapsed ? "h-5 w-5" : "h-4 w-4", isActive ? "text-white" : "text-white/40")} />
              {!collapsed && (
                <>
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge && item.badge > 0 && (
                    <div className={cn(
                      "h-5 min-w-[20px] px-1.5 rounded-full flex items-center justify-center text-[10px] font-bold",
                      isActive ? "bg-white/20 text-white" : "bg-red-600 text-white"
                    )}>
                      {item.badge}
                    </div>
                  )}
                </>
              )}
              {/* Collapsed badge dot */}
              {collapsed && item.badge && item.badge > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-red-600 border border-[#021d18]" />
              )}
            </button>
          );

          return collapsed ? (
            <NavTooltip key={item.id} label={item.label}>{btn}</NavTooltip>
          ) : btn;
        })}
      </nav>

      {/* ── Footer ── */}
      <div className={cn("pb-4 pt-2 border-t border-white/5 space-y-0.5 shrink-0", collapsed ? "px-1.5" : "px-3")}>
        {[
          { icon: HelpCircle, label: "Help & Support", page: undefined as Page | undefined },
          { icon: Settings,   label: "Settings",       page: "settings" as Page },
        ].map(({ icon: Icon, label, page }) => {
          const isActive = page && activePage === page;
          const btn = (
            <button
              key={label}
              onClick={() => page && onPageChange(page)}
              className={cn(
                "w-full flex items-center rounded-lg text-sm font-medium transition-all",
                isActive
                  ? "bg-[#00775B] text-white"
                  : "text-white/50 hover:text-white/80 hover:bg-white/5",
                collapsed ? "justify-center p-2.5" : "gap-3 px-3 py-2.5"
              )}
            >
              <Icon className={cn("shrink-0", isActive ? "text-white" : "text-white/40", collapsed ? "h-5 w-5" : "h-4 w-4")} />
              {!collapsed && <span>{label}</span>}
            </button>
          );
          return collapsed ? (
            <NavTooltip key={label} label={label}>{btn}</NavTooltip>
          ) : btn;
        })}
      </div>
    </aside>
  );
};
