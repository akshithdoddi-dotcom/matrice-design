import { useState, useEffect, useRef, forwardRef } from "react";
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
  LogOut,
  User,
  Clock,
  Filter,
  Activity,
  ChevronDown,
  PanelLeft,
  PanelLeftClose,
  Sparkles,
  X,
  Send,
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
type AppKey = "analytics" | "training" | "marketplace" | "fe-common" | "vms";
const platforms: { icon: React.ElementType; label: string; shortcut: string; app?: AppKey; active?: boolean }[] = [
  { icon: Monitor,   label: "Matrice VMS",         shortcut: "1", app: "vms" },
  { icon: BarChart3, label: "Matrice Analytics",   shortcut: "2", app: "analytics", active: true },
  { icon: Cpu,       label: "Matrice Training",    shortcut: "3", app: "training" },
  { icon: Store,     label: "Matrice Marketplace", shortcut: "4", app: "marketplace" },
  { icon: Wrench,    label: "Matrice Support",     shortcut: "5" },
  { icon: Shield,    label: "Matrice Internal",    shortcut: "6" },
  { icon: Layers,    label: "FE Components",       shortcut: "7", app: "fe-common" },
];

// ── Sidebar navigation ────────────────────────────────────────────────────────
const mainNavItems: { id: Page; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "volume", label: "Volume Analytics", icon: TrendingUp },
  { id: "incident", label: "Incident Analytics", icon: ShieldAlert, badge: 3 },
  { id: "zone", label: "Zone Analytics", icon: MapPin },
  { id: "quality", label: "Quality Analytics", icon: ShoppingBag },
  { id: "safety", label: "Safety Analytics", icon: ShieldCheck },
  { id: "identity", label: "Identity Analytics", icon: Fingerprint },
  { id: "service", label: "Service Analytics", icon: Timer },
  { id: "facial-recognition", label: "Facial Recognition", icon: ScanFace },
  { id: "license-plates", label: "License Plates", icon: CarFront },
  { id: "cameras", label: "Cameras", icon: Video },
  { id: "metrics", label: "Metrics & Rules", icon: Map },
  { id: "compliance", label: "Compliance", icon: ClipboardCheck },
  { id: "design-system", label: "Component Library", icon: Layers },
  { id: "sample-analytics", label: "Staff Monitoring", icon: Users },
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
function SearchResultsView({ query, onClear }: { query: string; onClear: () => void }) {
  const maxN = Math.max(...FREQ_DATA.map(d => d.n));

  const confColor = (c: number) =>
    c >= 90 ? "text-emerald-600 bg-emerald-50 border-emerald-200"
    : c >= 75 ? "text-amber-600 bg-amber-50 border-amber-200"
    : "text-red-600 bg-red-50 border-red-200";

  return (
    <div className="flex flex-1 flex-col gap-4 p-6 overflow-auto">
      {/* Query bar */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 flex-1 bg-white border border-[#00775B]/25 rounded-lg px-4 py-2 shadow-sm">
          <Sparkles className="w-4 h-4 text-[#00775B] shrink-0" />
          <span className="text-sm font-medium text-neutral-700 flex-1" style={{ fontFamily: "Inter, sans-serif" }}>
            {query}
          </span>
          <span className="text-[10px] font-mono text-neutral-400">{AUDIT_LOG_DATA.length} results · 2025-05-20</span>
        </div>
        <button
          onClick={onClear}
          className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium text-neutral-500 hover:text-neutral-800 border border-neutral-200 bg-white hover:bg-neutral-50 transition-colors shadow-sm"
        >
          <X className="w-3.5 h-3.5" /> Clear search
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
const COPILOT_SUGGESTIONS = [
  "Summarize critical incidents today",
  "Show compliance gaps this week",
  "Analyze peak activity zones",
  "Generate safety report",
];

function CopilotDrawer({ onClose }: { onClose: () => void }) {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      text: "Hello! I'm Matrice Spark. I can analyze incidents, query camera feeds, identify compliance gaps, and generate reports across your surveillance infrastructure.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed) return;
    const userMsg = { role: "user", text: trimmed };
    const botMsg = {
      role: "assistant",
      text: `Analyzing "${trimmed}"…\n\nI found 12 related events across 4 camera zones in the last 24 hours. Peak activity was recorded at 12:00–14:00. 3 incidents are flagged as critical and require immediate review. Would you like a detailed breakdown?`,
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
    setInput("");
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 80);
  };

  return (
    <div
      className="w-[380px] shrink-0 flex flex-col border-l border-white/10 animate-in slide-in-from-right duration-200"
      style={{ backdropFilter: "blur(16px) saturate(180%)", background: "rgba(15,23,42,0.92)" }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 shrink-0">
        <Sparkles className="w-4 h-4 text-[#00956D]" />
        <span className="font-semibold text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>
          Matrice Spark
        </span>
        <span className="text-[9px] px-1.5 py-0.5 rounded-sm bg-[#00775B]/25 text-[#34D399] font-mono tracking-widest ml-0.5">
          BETA
        </span>
        <button onClick={onClose} className="ml-auto text-white/40 hover:text-white transition-colors p-0.5 rounded">
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 [&::-webkit-scrollbar]:w-0">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === "user" ? "justify-end" : "justify-start")}>
            {msg.role === "assistant" && (
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 rounded-full bg-[#00775B]/30 border border-[#00775B]/40 flex items-center justify-center shrink-0 mt-0.5">
                  <Sparkles className="w-3 h-3 text-[#00956D]" />
                </div>
                <div className="max-w-[85%] rounded-lg rounded-tl-none px-3 py-2 text-[12px] leading-relaxed bg-white/8 border border-white/10 text-white/85 whitespace-pre-line"
                  style={{ fontFamily: "Inter, sans-serif" }}>
                  {msg.text}
                </div>
              </div>
            )}
            {msg.role === "user" && (
              <div className="max-w-[85%] rounded-lg rounded-tr-none px-3 py-2 text-[12px] leading-relaxed bg-[#00775B] text-white"
                style={{ fontFamily: "Inter, sans-serif" }}>
                {msg.text}
              </div>
            )}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Suggestion chips */}
      <div className="px-4 py-2.5 border-t border-white/10 flex flex-wrap gap-1.5 shrink-0">
        {COPILOT_SUGGESTIONS.map(s => (
          <button
            key={s}
            onClick={() => setInput(s)}
            className="text-[11px] px-2.5 py-1 rounded-full bg-white/6 border border-white/10 text-white/60 hover:text-white hover:bg-white/12 transition-colors"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 py-3 border-t border-white/10 shrink-0">
        <div className="flex items-center gap-2 bg-white/8 border border-white/12 rounded-lg px-3 py-2 focus-within:border-[#00775B]/50 transition-colors">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleSend()}
            placeholder="Ask Matrice Spark..."
            className="flex-1 bg-transparent text-[12px] text-white placeholder-white/30 outline-none"
            style={{ fontFamily: "Inter, sans-serif" }}
          />
          <button
            onClick={handleSend}
            className={cn("transition-colors p-0.5", input.trim() ? "text-[#00956D] hover:text-[#34D399]" : "text-white/20 cursor-default")}
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

  // Vision Intelligence Search
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchActive, setSearchActive] = useState(false);

  // Copilot drawer
  const [copilotOpen, setCopilotOpen] = useState(false);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setSearchActive(true);
    }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setSearchActive(false);
    setSearchInput("");
  };

  useEffect(() => {
    const id = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

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
      <SidebarInset className="bg-[#F8FAFC] flex flex-col overflow-hidden">
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

          {/* Center: Vision Intelligence Search */}
          <div className="flex-1 flex justify-center px-3">
            <form onSubmit={handleSearchSubmit} className="w-full max-w-xl">
              <div className="relative flex items-center">
                <Search className="absolute left-3 w-3.5 h-3.5 text-white/30 pointer-events-none" />
                <input
                  value={searchInput}
                  onChange={e => setSearchInput(e.target.value)}
                  placeholder="Search events, behaviors, or compliance trends across sites..."
                  className="w-full h-8 pl-9 pr-8 bg-white/5 border border-white/10 rounded-lg text-[12px] text-white placeholder-white/25 focus:outline-none focus:border-[#00775B]/60 focus:bg-white/8 transition-all"
                  style={{ fontFamily: "Inter, sans-serif" }}
                />
                {searchInput ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-2.5 text-white/30 hover:text-white/70 transition-colors"
                  >
                    <X className="w-3 h-3" />
                  </button>
                ) : (
                  <div className="absolute right-2.5 flex items-center gap-0.5 pointer-events-none opacity-40">
                    <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">⌘</kbd>
                    <kbd className="text-[9px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">K</kbd>
                  </div>
                )}
              </div>
            </form>
          </div>

          {/* Right: actions */}
          <div className="flex items-center gap-1.5 shrink-0">
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
              <SearchResultsView query={searchQuery} onClear={clearSearch} />
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
            <CopilotDrawer onClose={() => setCopilotOpen(false)} />
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
    </div>
  );
}
