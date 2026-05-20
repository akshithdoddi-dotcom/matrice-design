import { useState, useEffect, useLayoutEffect, useRef, forwardRef } from "react";
import { createPortal } from "react-dom";
import {
  Settings,
  HelpCircle,
  Bell,
  Sun,
  Moon,
  Search,
  ChevronsUpDown,
  Check,
  LogOut,
  User,
  Clock,
  PanelLeft,
  PanelLeftClose,
  Monitor,
  BarChart3,
  Cpu,
  Store,
  Wrench,
  Shield,
  Layers,
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
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
  useSidebar,
} from "../ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { cn } from "../../lib/utils";

// ── MatriceIcon ───────────────────────────────────────────────────────────────

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

// ── Platform list ─────────────────────────────────────────────────────────────

const PLATFORMS = [
  { id: "vms",         label: "Matrice VMS",         icon: Monitor,  shortcut: "1" },
  { id: "analytics",   label: "Matrice Analytics",   icon: BarChart3, shortcut: "2" },
  { id: "training",    label: "Matrice Training",    icon: Cpu,      shortcut: "3" },
  { id: "marketplace", label: "Matrice Marketplace", icon: Store,    shortcut: "4" },
  { id: "support",     label: "Matrice Support",     icon: Wrench,   shortcut: "5" },
  { id: "internal",    label: "Matrice Internal",    icon: Shield,   shortcut: "6" },
  { id: "fe-common",   label: "FE Components",       icon: Layers,   shortcut: "7" },
];

// ── Types ─────────────────────────────────────────────────────────────────────

export interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  badge?: number;
}

export interface BreadcrumbSegment {
  label: string;
  onClick?: () => void;
}

export interface AppShellProps {
  // Navigation
  navItems: NavItem[];
  footerNavItems?: NavItem[];
  activePage: string;
  onPageChange: (page: string) => void;
  // Optional section label above main nav (e.g. project name in Training)
  navGroupLabel?: string;

  // Header
  breadcrumb?: BreadcrumbSegment[];   // custom breadcrumb; falls back to activePage label
  showLive?: boolean;
  headerExtra?: React.ReactNode;      // e.g. Global Filter button

  // Platform switcher
  platformLabel: string;              // e.g. "Analytics Platform"
  activePlatformId: string;           // e.g. "analytics"
  onPlatformSwitch?: (app: string) => void;

  // Theme
  isDark?: boolean;
  onToggleDark?: () => void;

  // Content
  children: React.ReactNode;
  contentClassName?: string;
}

// ── Sidebar trigger with open/close icon ──────────────────────────────────────

function CustomSidebarTrigger() {
  const { open } = useSidebar();
  return (
    <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/5 h-7 w-7">
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
    </SidebarTrigger>
  );
}

// ── Forwardref link shim ──────────────────────────────────────────────────────

const ForwardedLink = forwardRef<HTMLAnchorElement, React.ComponentProps<"a"> & { to?: string }>(
  (props, ref) => (
    <a ref={ref} {...props} href={props.to} onClick={(e) => { e.preventDefault(); props.onClick?.(e); }} />
  )
);
ForwardedLink.displayName = "ForwardedLink";

// ── AppShell ──────────────────────────────────────────────────────────────────

export function AppShell({
  navItems,
  footerNavItems,
  activePage,
  onPageChange,
  navGroupLabel,
  breadcrumb,
  showLive = false,
  headerExtra,
  platformLabel,
  activePlatformId,
  onPlatformSwitch,
  isDark = false,
  onToggleDark,
  children,
  contentClassName,
}: AppShellProps) {
  const [clockTime, setClockTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [platformOpen, setPlatformOpen] = useState(false);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const platformBtnRef = useRef<HTMLDivElement>(null);
  const platformPanelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const id = setInterval(() =>
      setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }))
    , 1000);
    return () => clearInterval(id);
  }, []);

  // Calculate portal position when opening
  useLayoutEffect(() => {
    if (!platformOpen || !platformBtnRef.current) return;
    const rect = platformBtnRef.current.getBoundingClientRect();
    setDropdownPos({ top: rect.bottom + 4, left: rect.left });
  }, [platformOpen]);

  // Close platform panel on outside click
  useEffect(() => {
    if (!platformOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        !platformBtnRef.current?.contains(e.target as Node) &&
        !platformPanelRef.current?.contains(e.target as Node)
      ) setPlatformOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [platformOpen]);

  // Default breadcrumb: just the active page label
  const activeLabelFromNav =
    navItems.find(i => i.id === activePage)?.label ??
    footerNavItems?.find(i => i.id === activePage)?.label ??
    activePage;

  const crumbs = breadcrumb ?? [{ label: activeLabelFromNav }];

  const defaultFooterNav: NavItem[] = [
    { id: "settings", label: "Settings", icon: Settings },
    { id: "help",     label: "Help & Support", icon: HelpCircle },
  ];
  const resolvedFooterNav = footerNavItems ?? defaultFooterNav;

  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
      <Sidebar collapsible="icon" variant="sidebar" className="border-r border-[#00775B]/15 bg-[#021d18]">

        {/* ── Platform switcher header ── */}
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <div ref={platformBtnRef}>
              <SidebarMenuButton
                size="lg"
                className={cn("hover:bg-white/5", platformOpen && "bg-white/5")}
                onClick={() => setPlatformOpen(o => !o)}
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#001410] border border-[#00775B]/30 p-1">
                  <MatriceIcon />
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold text-white">Matrice AI</span>
                  <span className="truncate text-xs text-white/50">{platformLabel}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4 text-white/40" />
              </SidebarMenuButton>
              </div>

              {platformOpen && createPortal(
                <div
                  ref={platformPanelRef}
                  style={{ position: "fixed", top: dropdownPos.top, left: dropdownPos.left, zIndex: 9999 }}
                  className="w-52 rounded-lg border border-[#00775B]/20 bg-[#021d18] shadow-2xl py-1.5 animate-in fade-in zoom-in-95 duration-100"
                >
                  <p className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-widest text-white/30">Platforms</p>
                  {PLATFORMS.map((p) => (
                    <button
                      key={p.id}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-[13px] hover:bg-white/5 cursor-pointer transition-colors"
                      onClick={() => {
                        setPlatformOpen(false);
                        onPlatformSwitch?.(p.id);
                      }}
                    >
                      <p.icon className={cn("size-4 shrink-0", p.id === activePlatformId ? "text-[#00956D]" : "text-white/50")} />
                      <span className={cn("flex-1 text-left", p.id === activePlatformId ? "text-white" : "text-white/70")}>{p.label}</span>
                      {p.id === activePlatformId && <Check className="size-3.5 text-[#00956D]" />}
                      <kbd className="text-[10px] font-mono text-white/50 border border-white/15 rounded px-1.5 py-0.5 bg-white/5">⌘{p.shortcut}</kbd>
                    </button>
                  ))}
                </div>,
                document.body
              )}
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>

        {/* ── Main nav ── */}
        <SidebarContent className="[&::-webkit-scrollbar]:w-0">
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu>
                {navItems.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          isActive && "bg-[#00775B] text-white hover:bg-[#00775B] hover:text-white",
                          !isActive && "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
                        <ForwardedLink to={`#${item.id}`} onClick={() => onPageChange(item.id)}>
                          <item.icon className="size-4" />
                          <span>{item.label}</span>
                          {item.badge && (
                            <SidebarMenuBadge className="ml-auto flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 text-xs font-bold text-white">
                              {item.badge}
                            </SidebarMenuBadge>
                          )}
                        </ForwardedLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        {/* ── Footer nav ── */}
        <SidebarFooter>
          <SidebarGroup className="p-0">
            <SidebarGroupContent>
              <SidebarMenu>
                {resolvedFooterNav.map((item) => {
                  const isActive = activePage === item.id;
                  return (
                    <SidebarMenuItem key={item.id}>
                      <SidebarMenuButton
                        asChild
                        isActive={isActive}
                        tooltip={item.label}
                        className={cn(
                          isActive && "bg-[#00775B] text-white hover:bg-[#00775B] hover:text-white",
                          !isActive && "text-white/70 hover:text-white hover:bg-white/5"
                        )}
                      >
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
        </SidebarFooter>

        <SidebarRail />
      </Sidebar>

      <SidebarInset className="bg-[#F8FAFC]">
        {/* ── Topbar ── */}
        <header className="flex h-12 shrink-0 items-center gap-2 bg-[#021d18] text-white px-4 border-b border-[#00775B]/15">
          <CustomSidebarTrigger />
          <div className="h-4 w-px bg-white/10" />

          {/* Breadcrumb */}
          <div className="flex-1 flex items-center gap-1.5 text-xs min-w-0">
            {crumbs.map((seg, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                {i > 0 && <span className="text-white/20 shrink-0">/</span>}
                <span
                  className={cn(
                    "truncate",
                    i === crumbs.length - 1 ? "text-white/70 font-medium" : "text-white/30",
                    seg.onClick && "cursor-pointer hover:text-white/60 transition-colors"
                  )}
                  onClick={seg.onClick}
                >
                  {seg.label}
                </span>
              </span>
            ))}
          </div>

          {/* Right-side actions */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Optional LIVE badge */}
            {showLive && (
              <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00775B] rounded-full text-white text-xs font-semibold shadow-md shadow-[#00775B]/30">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                LIVE
              </div>
            )}

            {/* Slot for app-specific header actions (e.g. Global Filter) */}
            {headerExtra}

            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 text-xs font-mono text-white/60">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              {clockTime}
            </div>

            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 text-xs text-white/40 bg-white/5 hover:bg-white/8 cursor-pointer transition-colors min-w-[140px]">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">Search</span>
              <div className="flex items-center gap-0.5 opacity-60">
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">⌘</kbd>
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">K</kbd>
              </div>
            </div>

            {/* Bell */}
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#021d18]" />
            </button>

            {/* User avatar */}
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
                  {isDark
                    ? <><Sun className="size-4" /><span>Light Mode</span></>
                    : <><Moon className="size-4" /><span>Dark Mode</span></>
                  }
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

        {/* ── Page content ── */}
        <div className={cn("flex flex-1 flex-col overflow-auto", contentClassName ?? "gap-4 p-6")}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
