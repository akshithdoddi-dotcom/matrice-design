import { AppShell, NavItem, BreadcrumbSegment } from "@fe-common/components/layout/AppShell";
import {
  LayoutDashboard,
  Settings,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Layers,
  Users,
  Upload,
  Store,
  Server,
  Box,
} from "lucide-react";

export type Page = "dashboard" | "services" | "partners" | "publish" | "appstore" | "compute" | "byom" | "settings" | "docs" | "tutorials" | "help";

const MAIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard",    icon: LayoutDashboard },
  { id: "appstore",  label: "App Store",    icon: Store },
  { id: "publish",   label: "Applications", icon: Upload },
  { id: "byom",      label: "BYOM",         icon: Box },
  { id: "compute",   label: "Compute",      icon: Server },
  { id: "services",  label: "Services",     icon: Layers },
  { id: "partners",  label: "Partners",     icon: Users },
];

const FOOTER_NAV: NavItem[] = [
  { id: "docs",      label: "Docs",          icon: BookOpen },
  { id: "tutorials", label: "Tutorials",     icon: GraduationCap },
  { id: "help",      label: "Help & Support", icon: HelpCircle },
  { id: "settings",  label: "Settings",      icon: Settings },
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
      platformLabel="Marketplace"
      activePlatformId="marketplace"
      onPlatformSwitch={onPlatformSwitch}
      isDark={isDark}
      onToggleDark={onToggleDark}
      contentClassName={
        activePage === "settings" ? "p-0 min-h-0" :
        activePage === "appstore" ? "p-0 overflow-x-hidden" :
        undefined
      }
    >
      {children}
    </AppShell>
  );
}
