import { Filter, ChevronDown, Settings, HelpCircle } from "lucide-react";
import { AppShell, NavItem } from "@fe-common/components/layout/AppShell";
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
  Users,
} from "lucide-react";
import { Page } from "@/app/components/layout/Sidebar";

const MAIN_NAV: NavItem[] = [
  { id: "dashboard",        label: "Dashboard",         icon: LayoutDashboard },
  { id: "volume",           label: "Volume Analytics",  icon: TrendingUp },
  { id: "incident",         label: "Incident Analytics",icon: ShieldAlert, badge: 3 },
  { id: "zone",             label: "Zone Analytics",    icon: MapPin },
  { id: "quality",          label: "Quality Analytics", icon: ShoppingBag },
  { id: "safety",           label: "Safety Analytics",  icon: ShieldCheck },
  { id: "identity",         label: "Identity Analytics",icon: Fingerprint },
  { id: "service",          label: "Service Analytics", icon: Timer },
  { id: "facial-recognition", label: "Facial Recognition", icon: ScanFace },
  { id: "license-plates",   label: "License Plates",    icon: CarFront },
  { id: "cameras",          label: "Cameras",           icon: Video },
  { id: "metrics",          label: "Metrics & Rules",   icon: Map },
  { id: "compliance",       label: "Compliance",        icon: ClipboardCheck },
  { id: "design-system",    label: "Component Library", icon: Layers },
  { id: "sample-analytics", label: "Staff Monitoring",  icon: Users },
];

const FOOTER_NAV: NavItem[] = [
  { id: "settings", label: "Settings",      icon: Settings },
  { id: "help",     label: "Help & Support", icon: HelpCircle },
];

interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
  onPlatformSwitch?: (app: string) => void;
}

export function AppLayout({ activePage, onPageChange, children, isDark = false, onToggleDark, onPlatformSwitch }: AppLayoutProps) {
  return (
    <AppShell
      navItems={MAIN_NAV}
      footerNavItems={FOOTER_NAV}
      activePage={activePage}
      onPageChange={(p) => onPageChange(p as Page)}
      platformLabel="Analytics Platform"
      activePlatformId="analytics"
      onPlatformSwitch={onPlatformSwitch}
      showLive
      headerExtra={
        <button className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 border border-white/10 transition-all">
          <Filter className="w-3.5 h-3.5" />
          Global Filter
          <ChevronDown className="w-3 h-3 opacity-60" />
        </button>
      }
      isDark={isDark}
      onToggleDark={onToggleDark}
      contentClassName={activePage === "settings" ? "p-0 min-h-0" : "gap-4 p-6"}
    >
      {children}
    </AppShell>
  );
}
