import { useState, useEffect, useRef, useCallback, forwardRef } from "react";
import { Link } from "react-router-dom";
import {
  LayoutDashboard,
  ShieldAlert,
  TrendingUp,
  MapPin,
  ShoppingBag,
  ShieldCheck,
  Fingerprint,
  Timer,
  ScanFace,
  CarFront,
  Video,
  Map,
  ClipboardCheck,
  Layers,
  Settings,
  HelpCircle,
  Users,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronsUpDown,
  Check,
  Monitor,
  BarChart3,
  Cpu,
  Store,
  Wrench,
  Shield,
  Headphones,
  PenTool,
  LogOut,
  User,
  Clock,
  Filter,
  Activity,
  ChevronDown,
  ChevronLeft,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  X,
  Send,
  ArrowUpRight,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "@fe-common/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@fe-common/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@fe-common/components/ui/popover";
import { cn } from "@/app/lib/utils";
import { Page } from "@/app/components/layout/Sidebar";
import { CommandPalette } from "@/app/components/CommandPalette";

// ── Matrice brand icon ────────────────────────────────────────────────────────
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

// ── Platform switcher ─────────────────────────────────────────────────────────
type AppKey = "analytics" | "training" | "marketplace" | "support" | "support2" | "fe-common" | "vms" | "internal" | "annotation" | "client-centre";
const platforms: { icon: React.ElementType; label: string; shortcut: string; app?: AppKey; active?: boolean }[] = [
  { icon: Layers,     label: "Matrice AI — Client Centre", shortcut: "0", app: "client-centre" },
  { icon: Monitor,    label: "Matrice VMS",         shortcut: "1", app: "vms" },
  { icon: BarChart3,  label: "Matrice Analytics",   shortcut: "2", app: "analytics", active: true },
  { icon: Cpu,        label: "Matrice Training",    shortcut: "3", app: "training" },
  { icon: Store,      label: "Matrice Marketplace", shortcut: "4", app: "marketplace" },
  { icon: Wrench,     label: "Matrice Support",     shortcut: "5", app: "support" },
  { icon: Headphones, label: "Support Platform 2",  shortcut: "6", app: "support2" },
  { icon: Shield,     label: "Matrice Internal",    shortcut: "7", app: "internal" },
  { icon: PenTool,    label: "Matrice Annotation",  shortcut: "9", app: "annotation" },
  { icon: Layers,     label: "FE Components",       shortcut: "8", app: "fe-common" },
];

// ── Sidebar navigation ────────────────────────────────────────────────────────
const mainNavItems: { id: Page; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard",  label: "Dashboard",          icon: LayoutDashboard },
  { id: "volume",     label: "Volume Analytics",   icon: TrendingUp },
  { id: "incident",   label: "Incident Analytics", icon: ShieldAlert,    badge: 3 },
  { id: "zone",       label: "Zone Analytics",     icon: MapPin },
  { id: "quality",    label: "Quality Analytics",  icon: ShoppingBag },
  { id: "safety",     label: "Safety Analytics",   icon: ShieldCheck },
  { id: "identity",   label: "Identity Analytics", icon: Fingerprint },
  { id: "service",    label: "Service Analytics",  icon: Timer },
  { id: "cameras",        label: "Cameras",            icon: Video },
  { id: "license-plates", label: "License Plates",     icon: CarFront },
  { id: "metrics",        label: "Metrics & Rules",    icon: Map },
  { id: "design-system",     label: "Component Library", icon: Layers },
  { id: "sample-analytics",  label: "Staff Monitoring",  icon: Users },
];

const internalNavItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "microservices", label: "Microservices", icon: Activity },
];

const supportNavItems: { id: Page; label: string; icon: React.ElementType }[] = [
  { id: "settings", label: "Settings", icon: Settings },
];

// ── ForwardedLink helper ──────────────────────────────────────────────────────
const ForwardedLink = forwardRef<HTMLAnchorElement, React.ComponentProps<"a"> & { to?: string }>(
  (props, ref) => <a ref={ref} {...props} href={props.to} onClick={(e) => { e.preventDefault(); props.onClick?.(e); }} />
);
ForwardedLink.displayName = "ForwardedLink";

// ── AppLayout interface ───────────────────────────────────────────────────────
interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
  onPlatformSwitch?: (app: AppKey) => void;
}

// ── CustomSidebarTrigger ──────────────────────────────────────────────────────
function CustomSidebarTrigger() {
  const { open } = useSidebar();
  return (
    <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/5 h-7 w-7">
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
    </SidebarTrigger>
  );
}

// ── Mock data for Vision Intelligence Search results ──────────────────────────
const AUDIT_LOG_DATA = [
  { id: "EVT-2841", ts: "14:23:41", camera: "CAM-04 · Entrance A", zone: "Entry Zone",    event: "Unauthorized Access",  conf: 94 },
  { id: "EVT-2840", ts: "14:18:12", camera: "CAM-11 · Parking Lot", zone: "Parking",      event: "Loitering Detected",   conf: 87 },
  { id: "EVT-2839", ts: "14:11:05", camera: "CAM-02 · Server Room", zone: "Restricted",   event: "After-Hours Access",   conf: 98 },
  { id: "EVT-2838", ts: "13:55:33", camera: "CAM-07 · Loading Dock",zone: "Loading Zone",  event: "Unattended Baggage",   conf: 76 },
  { id: "EVT-2837", ts: "13:42:17", camera: "CAM-15 · Lobby East",  zone: "Lobby",        event: "Crowd Density High",   conf: 91 },
  { id: "EVT-2836", ts: "13:30:08", camera: "CAM-03 · Fire Exit B", zone: "Exit Zone",    event: "Door Held Open",       conf: 100 },
  { id: "EVT-2835", ts: "13:22:44", camera: "CAM-08 · Cafeteria",   zone: "Break Area",   event: "Slip / Fall Risk",     conf: 82 },
  { id: "EVT-2834", ts: "13:14:19", camera: "CAM-01 · Main Gate",   zone: "Perimeter",    event: "Fence Breach",         conf: 89 },
];

const FREQ_DATA = [
  { h: "00:00", n: 2 }, { h: "02:00", n: 1 }, { h: "04:00", n: 0 },
  { h: "06:00", n: 3 }, { h: "08:00", n: 8 }, { h: "10:00", n: 12 },
  { h: "12:00", n: 15 },{ h: "14:00", n: 11 },{ h: "16:00", n: 9 },
  { h: "18:00", n: 7 }, { h: "20:00", n: 5 }, { h: "22:00", n: 3 },
];

// ── Vision Intelligence Search Results View ───────────────────────────────────
function SearchResultsView({
  query,
  onClear,
  onEditQuery,
}: {
  query:        string;
  onClear:      () => void;
  onEditQuery:  () => void;
}) {
  const maxN = Math.max(...FREQ_DATA.map(d => d.n));

  const confColor = (c: number) =>
    c >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : c >= 75 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 overflow-auto">
      {/* ── Context bar ─────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-3">
        {/* Exit action — single, authoritative */}
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm shrink-0"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <ChevronLeft className="w-3.5 h-3.5" /> Exit Search
        </button>

        {/* Click-to-edit query chip */}
        <button
          title="Click to edit query (⌘K)"
          onClick={onEditQuery}
          className="group flex items-center gap-2 flex-1 bg-white border border-[#00775B]/30 hover:border-[#00775B]/70 rounded-lg px-4 py-2 shadow-sm transition-all text-left"
          style={{ fontFamily: "Inter, sans-serif" }}
        >
          <Sparkles className="w-4 h-4 text-[#00775B] shrink-0" />
          <span className="text-sm font-medium text-neutral-700 flex-1 truncate">
            {query}
          </span>
          {/* pencil hint */}
          <svg
            className="w-3.5 h-3.5 shrink-0 text-[#00775B] opacity-0 group-hover:opacity-100 transition-opacity"
            viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
          >
            <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
            <path d="M9.5 4.5l2 2" />
          </svg>
          <span className="text-[10px] font-mono text-neutral-400 shrink-0 ml-1">{AUDIT_LOG_DATA.length} results</span>
        </button>
      </div>

      {/* Dual pane */}
      <div className="flex gap-4 flex-1 min-h-0">
        {/* Left — Audit Log Table */}
        <div className="flex-1 bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-[#FAFAFA] shrink-0">
            <Activity className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Audit Log</span>
            <span className="ml-auto font-mono text-[10px] text-neutral-400">{AUDIT_LOG_DATA.length} events</span>
          </div>
          <div className="overflow-auto flex-1">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50">
                  {["ID", "Time", "Camera", "Zone", "Event Type", "Conf %"].map(h => (
                    <th key={h} className="text-left px-3 py-2 font-semibold text-[10px] uppercase tracking-wider text-neutral-500 whitespace-nowrap">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {AUDIT_LOG_DATA.map((row, i) => (
                  <tr
                    key={row.id}
                    className={cn("border-b border-neutral-50 hover:bg-[#00775B]/5 cursor-pointer transition-colors", i % 2 === 0 ? "bg-white" : "bg-neutral-50/50")}
                  >
                    <td className="px-3 py-2.5 font-mono text-[10px] text-neutral-500">{row.id}</td>
                    <td className="px-3 py-2.5 font-mono text-[10px] text-neutral-500 whitespace-nowrap">{row.ts}</td>
                    <td className="px-3 py-2.5 text-neutral-700 whitespace-nowrap">{row.camera}</td>
                    <td className="px-3 py-2.5 text-neutral-500 whitespace-nowrap">{row.zone}</td>
                    <td className="px-3 py-2.5 font-medium text-neutral-800">{row.event}</td>
                    <td className="px-3 py-2.5">
                      <span className={cn("inline-block px-1.5 py-0.5 rounded border font-mono text-[10px] font-semibold", confColor(row.conf))}>
                        {row.conf}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right — Frequency Graph */}
        <div className="w-72 shrink-0 bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-neutral-100 bg-[#FAFAFA] shrink-0">
            <TrendingUp className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Event Frequency</span>
            <span className="ml-auto font-mono text-[10px] text-neutral-400">24 h</span>
          </div>
          <div className="flex-1 p-4 flex flex-col gap-3">
            {/* Bar chart */}
            <div className="flex items-end gap-1.5 h-32">
              {FREQ_DATA.map(d => (
                <div key={d.h} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className="w-full rounded-t-sm transition-all"
                    style={{
                      height: maxN > 0 ? `${(d.n / maxN) * 100}%` : "4%",
                      background: d.n >= 10 ? "#00775B" : d.n >= 5 ? "#00956D" : "#34D399",
                      minHeight: "3px",
                    }}
                  />
                </div>
              ))}
            </div>
            {/* X-axis labels */}
            <div className="flex items-center gap-1.5">
              {FREQ_DATA.map(d => (
                <div key={d.h} className="flex-1 text-center font-mono text-[8px] text-neutral-400 leading-none">
                  {d.h.slice(0, 2)}
                </div>
              ))}
            </div>
            {/* Summary stats */}
            <div className="mt-auto pt-3 border-t border-neutral-100 grid grid-cols-3 gap-2">
              {[
                { label: "Peak", value: `${Math.max(...FREQ_DATA.map(d => d.n))} evt` },
                { label: "Total", value: `${FREQ_DATA.reduce((a, d) => a + d.n, 0)}` },
                { label: "Avg/hr", value: `${(FREQ_DATA.reduce((a, d) => a + d.n, 0) / 24).toFixed(1)}` },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="font-mono text-sm font-bold text-neutral-800">{s.value}</div>
                  <div className="text-[9px] uppercase tracking-wider text-neutral-400 font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Matrice Spark Chat Drawer ─────────────────────────────────────────────────

const SPARK_SANS: React.CSSProperties = { fontFamily: "Inter, sans-serif" };
const SPARK_MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace" };

// ── Types ─────────────────────────────────────────────────────────────────────
interface SparkNavCard {
  page:  Page;
  label: string;
  /** 2–3 data-asset micro-chips shown beneath the nav button */
  chips: { icon: string; label: string }[];
}

interface SparkMessage {
  id:        string;
  role:      "user" | "assistant";
  text:      string;
  navCard?:  SparkNavCard;
  followUps?: string[];
  isTyping?: boolean;
}

// ── Technical token formatter ─────────────────────────────────────────────────
// Any token matching the pattern is wrapped in 12px JetBrains Mono for
// precision monitoring clarity (EVT-*, CAM-*, PLN-*, TRJ-*, RPT-*, HH:MM:SS, N%)
const _SPLIT = /(\b(?:EVT|CAM|PLN|TRJ|RPT|SOP)-[\w.-]+\b|\b\d{2}:\d{2}:\d{2}\b|\b\d{1,4}%\b)/g;
const _MATCH = /^(?:(?:EVT|CAM|PLN|TRJ|RPT|SOP)-[\w.-]+|\d{2}:\d{2}:\d{2}|\d{1,4}%)$/;

function FmtText({ text }: { text: string }) {
  const parts = text.split(_SPLIT);
  return (
    <>
      {parts.map((p, i) =>
        _MATCH.test(p) ? (
          <code
            key={i}
            style={{ ...SPARK_MONO, fontSize: "11px", color: "rgba(52,211,153,0.92)",
              background: "rgba(255,255,255,0.07)", padding: "1px 5px",
              borderRadius: "3px", border: "1px solid rgba(255,255,255,0.10)" }}
          >
            {p}
          </code>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

// Paragraph-aware wrapper: splits on \n\n for paragraphs, \n for line breaks
function MsgBody({ text }: { text: string }) {
  return (
    <div className="space-y-1.5">
      {text.split(/\n\n+/).map((para, pi) => (
        <p key={pi} className="leading-relaxed">
          {para.split("\n").map((line, li) => (
            <span key={li}>
              {li > 0 && <br />}
              <FmtText text={line} />
            </span>
          ))}
        </p>
      ))}
    </div>
  );
}

// Three-dot typing indicator
function TypingDots() {
  return (
    <div className="flex items-center gap-1 py-1 px-0.5">
      {[0, 1, 2].map(i => (
        <span
          key={i}
          className="w-1.5 h-1.5 rounded-full animate-bounce"
          style={{ background: "rgba(255,255,255,0.30)", animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

// Navigation card appended to the bottom of an AI bubble
function NavCard({ card, onNavigate }: { card: SparkNavCard; onNavigate?: (p: Page) => void }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div className="mt-3 pt-3" style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}>

      {/* ── Tier 1: Primary action button ────────────────────────────────────
           Resting  : teal text on dark teal-tinted fill, teal border outline
           Hover    : filled teal plate, white text, brighter border + ↗ shift
      ───────────────────────────────────────────────────────────────────────── */}
      <button
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => onNavigate?.(card.page)}
        className="flex items-center gap-2 w-full px-3 py-2.5 rounded-md text-left"
        style={{
          ...SPARK_SANS, fontSize: "12px", fontWeight: 600,
          transition: "background 150ms ease-out, border-color 150ms ease-out, color 150ms ease-out",
          // Resting: dark teal tint — matches screenshot exactly
          background: hovered ? "rgba(0,119,91,0.35)"        : "rgba(0,119,91,0.12)",
          border:     `1px solid ${hovered
                          ? "rgba(52,211,153,0.65)"
                          : "rgba(0,149,109,0.45)"}`,
          // Resting: bright teal label; Hover: white for max contrast on filled plate
          color:      hovered ? "#FFFFFF"                    : "rgba(52,211,153,0.95)",
        }}
      >
        <ArrowUpRight
          className="w-3.5 h-3.5 shrink-0"
          style={{
            transition: "transform 150ms ease-out",
            transform:  hovered ? "translate(2px,-2px)" : "translate(0,0)",
          }}
        />
        View {card.label}
      </button>

      {/* ── Tier 2: Hollow informational chips — no fill, outline-only ── */}
      <div className="mt-2.5">
        <span style={{ ...SPARK_SANS, fontSize: "11px", color: "rgba(148,163,184,0.65)" }}>
          Data Insights waiting for you:
        </span>
        <div className="flex flex-wrap gap-1.5 mt-1.5">
          {card.chips.map((chip, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1"
              style={{
                ...SPARK_MONO, fontSize: "11px",
                padding:      "2px 6px",
                borderRadius: "3px",
                // Hollow — no background fill so chips read as informational, not clickable
                background:   "transparent",
                border:       "1px solid rgba(255,255,255,0.18)",
                // High-contrast neutral-200 for sharp readability without hover
                color:        "rgba(226,232,240,0.80)",
              }}
            >
              <span style={{ fontSize: "10px" }}>{chip.icon}</span>
              {chip.label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Response corpus ───────────────────────────────────────────────────────────
const SPARK_CORPUS: {
  keywords:  string[];
  text:      string;
  navCard?:  SparkNavCard;
  followUps: string[];
}[] = [
  {
    keywords: ["incident", "critical", "alert", "intrusion", "breach", "unauthorized"],
    text: "Scanning today's incident log against pipeline PLN-0042…\n\nI found 3 critical events unresolved:\n• EVT-2841 · CAM-04 · 14:23:41 — Unauthorized Access (94%)\n• EVT-2839 · CAM-02 · 14:11:05 — After-Hours Access, Server Room (98%)\n• EVT-2834 · CAM-01 · 13:14:19 — Fence Breach, Perimeter (89%)\n\nPeak window: 13:00–15:00. All 3 are pending acknowledgment and require immediate review.",
    navCard: {
      page:  "incident",
      label: "Incident Analytics",
      chips: [
        { icon: "📋", label: "Event Log"       },
        { icon: "📊", label: "Timeline View"   },
        { icon: "⚠️", label: "Unresolved Flags" },
      ],
    },
    followUps: ["Break down by camera zone", "Filter to Building A only", "Export incident report PDF"],
  },
  {
    keywords: ["compliance", "ppe", "violation", "gap", "safety vest", "hard hat"],
    text: "Running compliance audit for the last 7 days…\n\nI found 11 PPE violations across 4 zones:\n• CAM-08 · Fitness Center — 4 violations (Mon–Wed)\n• CAM-07 · Loading Dock — 3 violations\n• CAM-03 · Fire Exit B — 2 violations\n• CAM-15 · Lobby East — 2 violations\n\nCurrent compliance score: 78% (↓6% vs last week). Hard-hat non-compliance is the primary driver — 7 of 11 violations.",
    navCard: {
      page:  "compliance",
      label: "Compliance",
      chips: [
        { icon: "📋", label: "Audit Logs"         },
        { icon: "📈", label: "Trend Curves"        },
        { icon: "⚠️", label: "Violation Triggers"  },
      ],
    },
    followUps: ["Which zones are worst this week?", "Compare to last month's score", "Set PPE alert threshold"],
  },
  {
    keywords: ["peak", "volume", "activity", "crowd", "density", "busy", "footfall", "traffic"],
    text: "Analysing footfall patterns across all cameras for the last 24 h…\n\nTop zones by detection volume:\n1. Lobby East · CAM-15 — 1,240 detections\n2. Main Gate · CAM-01 — 988 detections\n3. Cafeteria · CAM-08 — 876 detections\n\nPeak window: 12:00–14:00 (avg 47 persons/frame).\n\nAnomaly flagged: CAM-11 (Parking Lot) recorded a 3× spike at 03:22:00 — 19 detections in a normally empty zone. Not yet flagged in the incident log.",
    navCard: {
      page:  "volume",
      label: "Volume Analytics",
      chips: [
        { icon: "📊", label: "Hourly Heatmap"  },
        { icon: "⚡", label: "Anomaly Spikes"  },
        { icon: "📹", label: "Camera Counts"   },
      ],
    },
    followUps: ["Show CAM-11 footage at 03:22:00", "What triggered the parking spike?", "Compare week-over-week volume"],
  },
  {
    keywords: ["safety", "report", "generate", "export", "summary", "slip", "fall"],
    text: "Generating safety report for the active period…\n\nReport ID: RPT-20260522-04 · Pipeline: PLN-0042\n\nKey findings:\n• 7 safety events logged in the past 24 h\n• 2 slip/fall risks flagged at CAM-08 · 13:22:44\n• PPE compliance: 78% (threshold 85%)\n• Door-held-open at CAM-03 · 13:30:08 — 100% confidence\n\nReport ready. Requires safety manager sign-off before distribution.",
    navCard: {
      page:  "safety",
      label: "Safety Analytics",
      chips: [
        { icon: "🛡️", label: "Risk Scores"      },
        { icon: "📋", label: "Shift Reports"    },
        { icon: "🚪", label: "Exit Violations"  },
      ],
    },
    followUps: ["Export as PDF", "Who needs to sign off?", "Schedule weekly auto-report"],
  },
  {
    keywords: ["identity", "facial", "recognition", "person", "who", "subject", "trajectory"],
    text: "Running identity correlation across all camera feeds…\n\nSubject matched across 3 zones:\n• CAM-04 · 14:23:41 — Entry, Building A (97%)\n• CAM-15 · 14:25:12 — Lobby East transit\n• CAM-02 · 14:31:07 — Server Room approach (flagged)\n\nTrajectory ID: TRJ-00441. Subject traversed 3 restricted zones in 7 min 26 s. The Server Room approach directly triggered EVT-2839.",
    navCard: {
      page:  "facial-recognition",
      label: "Facial Recognition",
      chips: [
        { icon: "👁️", label: "Trail Replay"    },
        { icon: "🗺️", label: "Zone Map"        },
        { icon: "🔗", label: "Identity Links"  },
      ],
    },
    followUps: ["Replay full trajectory TRJ-00441", "Cross-reference access control logs", "Add subject to watchlist"],
  },
  {
    keywords: ["zone", "area", "building", "sector", "location", "map"],
    text: "Analysing zone activity heatmap for the current shift…\n\nHigh-activity zones:\n• Zone: Entry — 1,228 events (14:00–15:00)\n• Zone: Server Room — 3 flagged events, all unresolved\n• Zone: Loading Dock — 6 PPE events, Mon–Fri\n\nQuiet zones with anomalous activity: Parking Lot (03:22:00 spike, see CAM-11).",
    navCard: {
      page:  "zone",
      label: "Zone Analytics",
      chips: [
        { icon: "🔥", label: "Activity Heatmap" },
        { icon: "⏱️", label: "Dwell Times"      },
        { icon: "🗺️", label: "Zone Paths"       },
      ],
    },
    followUps: ["Drill into Server Room zone", "Show Loading Dock PPE trend", "Compare zone activity 14:00–16:00"],
  },
];

const SPARK_DEFAULT = {
  text: "I've run your query against the live analytics pipeline.\n\nNo direct module match found, but I can cross-reference incident logs, camera feeds, compliance records, zone data, and identity trails.\n\nCould you narrow the scope? For example:\n• A time range (e.g., 08:00–16:00)\n• A target zone (e.g., Building A, Server Room)\n• An event type (e.g., PPE violation, intrusion)",
  followUps: ["Try: Critical incidents today", "Try: PPE compliance this week", "Try: Peak activity zones"],
};

// Starter chips shown only before the first user turn
const STARTER_CHIPS = [
  "Summarize critical incidents today",
  "Show compliance gaps this week",
  "Analyse peak activity zones",
  "Generate safety report",
];

// ── CopilotDrawer ─────────────────────────────────────────────────────────────
function CopilotDrawer({
  onClose,
  onNavigate,
}: {
  onClose:     () => void;
  onNavigate?: (page: Page) => void;
}) {
  const [input,          setInput]          = useState("");
  const [hasInteracted,  setHasInteracted]  = useState(false);
  const [messages,       setMessages]       = useState<SparkMessage[]>([
    {
      id:       "init",
      role:     "assistant",
      text:     "Hello! I'm Matrice Spark. I can analyse incidents, query camera feeds, identify compliance gaps, and generate reports across your surveillance infrastructure.",
      followUps: [],
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const scrollBottom = useCallback(() => {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 60);
  }, []);

  const handleSend = useCallback((textOverride?: string) => {
    const trimmed = (textOverride ?? input).trim();
    if (!trimmed) return;

    // First interaction — permanently dismiss starter chips
    setHasInteracted(true);
    setInput("");

    const userMsg: SparkMessage = { id: `u${Date.now()}`, role: "user", text: trimmed };
    const typingMsg: SparkMessage = { id: `t${Date.now()}`, role: "assistant", text: "", isTyping: true };

    setMessages(prev => [...prev, userMsg, typingMsg]);
    scrollBottom();

    // Simulate AI latency then resolve with a corpus match
    const lower = trimmed.toLowerCase();
    const match = SPARK_CORPUS.find(c => c.keywords.some(k => lower.includes(k)));
    const resp  = match ?? SPARK_DEFAULT;

    setTimeout(() => {
      setMessages(prev => [
        ...prev.filter(m => !m.isTyping),
        {
          id:        `a${Date.now()}`,
          role:      "assistant",
          text:      resp.text,
          navCard:   (resp as (typeof SPARK_CORPUS)[0]).navCard,
          followUps: resp.followUps,
        },
      ]);
      scrollBottom();
    }, 950);
  }, [input, scrollBottom]);

  // Derive index of last assistant message (for follow-up chip placement)
  const lastAssistantIdx = messages.reduce<number>(
    (acc, m, i) => (m.role === "assistant" ? i : acc), -1
  );

  return (
    <div
      className="w-[380px] shrink-0 flex flex-col animate-in slide-in-from-right duration-200"
      style={{
        backdropFilter: "blur(16px) saturate(180%)",
        background:     "rgba(15,23,42,0.92)",
        // Rim edge glow: captures edge lighting, separates panel from dashboard grid
        borderLeft:     "1px solid rgba(255,255,255,0.05)",
        // Depth vignette: drops a shadow over the underlying interface, establishes layer hierarchy
        boxShadow:      "-12px 0 30px rgba(15,23,42,0.35)",
      }}
    >
      {/* ── Header ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        <Sparkles className="w-4 h-4 text-[#00956D]" />
        <span className="font-semibold text-white text-sm" style={SPARK_SANS}>Matrice Spark</span>
        <span
          className="text-[9px] px-1.5 py-0.5 rounded-sm tracking-widest ml-0.5"
          style={{ ...SPARK_MONO, background: "rgba(0,119,91,0.25)", color: "#34D399" }}
        >
          BETA
        </span>
        <button onClick={onClose} className="ml-auto text-white/40 hover:text-white transition-colors p-0.5 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* ── Message thread ───────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4 [&::-webkit-scrollbar]:w-0">
        {messages.map((msg, idx) => (
          <div key={msg.id}>
            {/* ── User bubble ─────────────────────────────────────────── */}
            {msg.role === "user" && (
              <div className="flex justify-end">
                <div
                  className="max-w-[85%] rounded-lg rounded-tr-none px-3 py-2.5 text-[12px] leading-relaxed border"
                  style={{
                    ...SPARK_SANS,
                    background:  "rgba(255,255,255,0.03)",
                    borderColor: "rgba(255,255,255,0.10)",
                    color:       "rgba(255,255,255,0.82)",
                  }}
                >
                  {msg.text}
                </div>
              </div>
            )}

            {/* ── Assistant bubble ─────────────────────────────────────── */}
            {msg.role === "assistant" && (
              <div className="flex items-start gap-2.5">
                {/* Avatar */}
                <div className="w-6 h-6 rounded-full bg-[#00775B]/30 border border-[#00775B]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#00956D]" />
                </div>

                {/* Bubble */}
                <div
                  className="flex-1 min-w-0 rounded-lg rounded-tl-none px-3 py-2.5 border"
                  style={{
                    ...SPARK_SANS, fontSize: "12px",
                    background:  "rgba(255,255,255,0.06)",
                    borderColor: "rgba(255,255,255,0.10)",
                    color:       "rgba(255,255,255,0.85)",
                  }}
                >
                  {msg.isTyping ? (
                    <TypingDots />
                  ) : (
                    <>
                      <MsgBody text={msg.text} />
                      {msg.navCard && (
                        <NavCard card={msg.navCard} onNavigate={onNavigate} />
                      )}
                    </>
                  )}
                </div>
              </div>
            )}

            {/* ── Context-aware follow-up chips (last assistant msg only) ── */}
            {msg.role === "assistant"
              && idx === lastAssistantIdx
              && !msg.isTyping
              && msg.followUps && msg.followUps.length > 0
              && (
              <div className="flex flex-wrap gap-1.5 mt-2.5 pl-[34px]">
                {msg.followUps.map(chip => (
                  <button
                    key={chip}
                    onClick={() => handleSend(chip)}
                    className="text-[11px] px-2.5 py-1 rounded-full border transition-colors text-left"
                    style={{
                      ...SPARK_SANS,
                      background:  "rgba(0,119,91,0.10)",
                      borderColor: "rgba(0,119,91,0.30)",
                      color:       "rgba(52,211,153,0.85)",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background    = "rgba(0,119,91,0.20)";
                      (e.currentTarget as HTMLElement).style.borderColor   = "rgba(0,119,91,0.55)";
                      (e.currentTarget as HTMLElement).style.color         = "rgba(52,211,153,1)";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background    = "rgba(0,119,91,0.10)";
                      (e.currentTarget as HTMLElement).style.borderColor   = "rgba(0,119,91,0.30)";
                      (e.currentTarget as HTMLElement).style.color         = "rgba(52,211,153,0.85)";
                    }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* ── Starter chips — dismissed permanently after first send ──────────── */}
      {!hasInteracted && (
        <div className="px-4 pt-2 pb-2.5 border-t border-white/8 flex flex-wrap gap-1.5 shrink-0">
          {STARTER_CHIPS.map(s => (
            <button
              key={s}
              onClick={() => handleSend(s)}
              className="text-[11px] px-2.5 py-1 rounded-full border transition-colors"
              style={{
                ...SPARK_SANS,
                background:  "rgba(255,255,255,0.05)",
                borderColor: "rgba(255,255,255,0.10)",
                color:       "rgba(255,255,255,0.60)",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,1)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.10)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "rgba(255,255,255,0.60)"; (e.currentTarget as HTMLElement).style.background = "rgba(255,255,255,0.05)"; }}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* ── Input ────────────────────────────────────────────────────────────── */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <div
          className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors"
          style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.10)" }}
          onFocus={() => {}}
        >
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Matrice Spark…"
            className="flex-1 bg-transparent text-[12px] outline-none"
            style={{ ...SPARK_SANS, color: "rgba(255,255,255,0.88)", caretColor: "#34D399" }}
          />
          <button
            onClick={() => handleSend()}
            className="transition-colors p-0.5 shrink-0"
            style={{ color: input.trim() ? "#00956D" : "rgba(255,255,255,0.18)" }}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main AppLayout ─────────────────────────────────────────────────────────────
export function AppLayout({ activePage, onPageChange, children, isDark = false, onToggleDark, onPlatformSwitch }: AppLayoutProps) {
  const [clockTime, setClockTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [platformOpen, setPlatformOpen] = useState(false);
  const platformBtnRef = useRef<HTMLButtonElement>(null);
  const platformPanelRef = useRef<HTMLDivElement>(null);

  // Vision Intelligence Search (query/active driven by Command Palette)
  const [searchQuery,         setSearchQuery]         = useState("");
  const [searchActive,        setSearchActive]        = useState(false);
  const [paletteOpen,         setPaletteOpen]         = useState(false);
  /** Pre-fill string for the palette when re-opened from an active results context */
  const [paletteInitialQuery, setPaletteInitialQuery] = useState("");

  // Copilot drawer
  const [copilotOpen, setCopilotOpen] = useState(false);

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
  };

  const handlePaletteSearch = (query: string) => {
    setSearchQuery(query);
    setSearchActive(true);
  };

  useEffect(() => {
    const id = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // Global Cmd+K / Ctrl+K → open command palette.
  // Pre-fills the current query when search results are visible so the operator
  // can iterate on a prompt without retyping it from scratch.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (paletteOpen) {
          setPaletteOpen(false);
        } else {
          setPaletteInitialQuery(searchActive ? searchQuery : "");
          setPaletteOpen(true);
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [paletteOpen, searchActive, searchQuery]);

  // Close platform panel on outside click
  useEffect(() => {
    if (!platformOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        !platformBtnRef.current?.contains(e.target as Node) &&
        !platformPanelRef.current?.contains(e.target as Node)
      ) {
        setPlatformOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [platformOpen]);

  return (
    // h-screen overflow-hidden caps the layout to exactly the viewport — prevents the page
    // itself from scrolling so the header stays pinned and the Spark drawer is always fully visible.
    <div className="h-screen overflow-hidden flex">
    <SidebarProvider defaultOpen={true} className="flex-1 min-w-0 overflow-hidden" style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
      {/* ── Left Sidebar ────────────────────────────────────────────────────── */}
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-[#00775B]/15 bg-[#021d18]">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem className="relative">
              <SidebarMenuButton
                ref={platformBtnRef}
                size="lg"
                className={cn("hover:bg-white/5", platformOpen && "bg-white/5")}
                onClick={() => setPlatformOpen(o => !o)}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#001410] border border-[#00775B]/30 p-1">
                  <MatriceIcon />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">Matrice AI</span>
                  <span className="truncate text-xs text-white/50">Analytics Platform</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-white/40" />
              </SidebarMenuButton>

              {platformOpen && (
                <div
                  ref={platformPanelRef}
                  className="absolute left-0 top-full mt-1 z-[200] w-56 rounded-lg border border-border bg-popover text-popover-foreground shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
                >
                  <p className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Platforms</p>
                  {platforms.map((platform) => (
                    <button
                      key={platform.shortcut}
                      className="flex w-full items-center gap-2 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm transition-colors"
                      onClick={() => {
                        setPlatformOpen(false);
                        if (platform.app) onPlatformSwitch?.(platform.app);
                      }}
                    >
                      <div className="flex size-6 items-center justify-center rounded-sm border bg-background">
                        <platform.icon className="size-4 shrink-0" />
                      </div>
                      <span className="flex-1 text-left">{platform.label}</span>
                      {platform.active && <Check className="size-4 text-primary" />}
                      <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                        <span className="text-xs">⌘</span>{platform.shortcut}
                      </kbd>
                    </button>
                  ))}
                </div>
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        <SidebarContent className="[&::-webkit-scrollbar]:w-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {mainNavItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn(isActive && "bg-[#00775B] text-white hover:bg-[#00775B] hover:text-white", !isActive && "text-white/70 hover:text-white hover:bg-white/5")}>
                        <ForwardedLink to={`#${item.id}`} onClick={() => onPageChange(item.id)}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                          {item.badge && <span className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">{item.badge}</span>}
                        </ForwardedLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>

          <SidebarGroup>
            <SidebarGroupLabel className="text-white/30 text-[10px] font-bold uppercase tracking-widest px-2">
              Internal Platform
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {internalNavItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn(isActive && "bg-[#00775B] text-white hover:bg-[#00775B] hover:text-white", !isActive && "text-white/70 hover:text-white hover:bg-white/5")}>
                        <ForwardedLink to={`#${item.id}`} onClick={() => onPageChange(item.id)}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </ForwardedLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {supportNavItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.label} className={cn(isActive && "bg-[#00775B] text-white hover:bg-[#00775B] hover:text-white", !isActive && "text-white/70 hover:text-white hover:bg-white/5")}>
                        <ForwardedLink to={`#${item.id}`} onClick={() => onPageChange(item.id)}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                        </ForwardedLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
                <SidebarMenuItem>
                  <SidebarMenuButton asChild tooltip="Help & Support" className="text-white/70 hover:text-white hover:bg-white/5">
                    <ForwardedLink to="#help">
                      <HelpCircle className="size-4" />
                      <span>Help & Support</span>
                    </ForwardedLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      {/* ── Main area (header + body) ────────────────────────────────────────── */}
      <SidebarInset className="bg-[#F8FAFC] dark:bg-[#020617] flex flex-col overflow-hidden">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center bg-[#021d18] text-white px-4 border-b border-[#00775B]/15 gap-2">
          {/* Left: trigger + divider + page title */}
          <div className="flex items-center gap-2 shrink-0">
            <CustomSidebarTrigger />
            <div className="h-4 w-px bg-white/10" />
            <span className="text-white/40 text-sm font-normal whitespace-nowrap hidden sm:block">
              {activePage === "settings"
                ? "Settings"
                : mainNavItems.find(i => i.id === activePage)?.label ?? "Dashboard"}
            </span>
          </div>

          <div className="flex-1" />

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Vision Search anchor */}
            <button
              onClick={() => { setPaletteInitialQuery(""); setPaletteOpen(true); }}
              className="flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/18 text-white/50 hover:text-white transition-all"
              style={{ fontFamily: "Inter, sans-serif" }}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="hidden md:block text-[12px]">Vision Search</span>
              <div className="hidden md:flex items-center gap-0.5 ml-1">
                <kbd className="text-[9px] px-1 py-0.5 rounded border border-white/15 bg-white/8" style={{ fontFamily: "JetBrains Mono, monospace" }}>⌘</kbd>
                <kbd className="text-[9px] px-1 py-0.5 rounded border border-white/15 bg-white/8" style={{ fontFamily: "JetBrains Mono, monospace" }}>K</kbd>
              </div>
            </button>

            {/* LIVE indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-[#00775B] rounded-full text-white text-xs font-semibold shadow-md shadow-[#00775B]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>

            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/10 text-xs font-mono text-white/60">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              {clockTime}
            </div>

            {/* Bell */}
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#021d18]" />
            </button>

            {/* Copilot toggle */}
            <button
              onClick={() => setCopilotOpen(o => !o)}
              className={cn(
                "h-8 px-2.5 flex items-center gap-1.5 rounded-lg border transition-all text-xs font-medium",
                copilotOpen
                  ? "bg-[#00775B]/20 border-[#00775B]/50 text-[#34D399]"
                  : "border-white/10 text-white/50 hover:text-white hover:bg-white/8"
              )}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span className="hidden lg:block">Spark</span>
            </button>

            {/* User profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-[#00775B] flex items-center justify-center text-white text-xs font-bold shadow-md hover:bg-[#006649] transition-colors ring-2 ring-transparent hover:ring-[#00775B]/40">
                  AU
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">admin@matrice.ai</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="size-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onToggleDark}>
                  {isDark ? (
                    <>
                      <Sun className="size-4" />
                      <span>Light Mode</span>
                    </>
                  ) : (
                    <>
                      <Moon className="size-4" />
                      <span>Dark Mode</span>
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <LogOut className="size-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Body row: main content + optional Spark drawer */}
        {/* min-h-0 is critical — without it flex children use min-height:auto and overflow the parent */}
        <div className="flex flex-1 min-h-0 overflow-hidden">
          {/* Main content area */}
          <div className="flex flex-1 flex-col overflow-auto min-w-0">
            {searchActive ? (
              <SearchResultsView
                query={searchQuery}
                onClear={clearSearch}
                onEditQuery={() => { setPaletteInitialQuery(searchQuery); setPaletteOpen(true); }}
              />
            ) : (
              <div className={cn(
                "flex flex-1 flex-col",
                activePage === "settings" ? "p-0 min-h-0" : "gap-4 p-6"
              )}>
                {children}
              </div>
            )}
          </div>

          {/* Spark drawer (slides in from right, pushes content left) */}
          {copilotOpen && (
            <CopilotDrawer
              onClose={() => setCopilotOpen(false)}
              onNavigate={(page) => { onPageChange(page); setCopilotOpen(false); }}
            />
          )}
        </div>

        {/* Command Palette (Cmd+K) — rendered inside SidebarInset so it overlays correctly */}
        {paletteOpen && (
          <CommandPalette
            platform="analytics"
            onSearch={handlePaletteSearch}
            onClose={() => setPaletteOpen(false)}
            initialQuery={paletteInitialQuery}
          />
        )}
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
