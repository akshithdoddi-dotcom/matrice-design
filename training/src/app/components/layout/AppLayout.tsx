import { AppShell, NavItem, BreadcrumbSegment } from "@fe-common/components/layout/AppShell";
import {
  LayoutDashboard,
  FolderOpen,
  Server,
  Settings,
  HelpCircle,
  BookOpen,
  GraduationCap,
  Home,
  Database,
  Cpu,
  Rocket,
} from "lucide-react";

export type Page = "dashboard" | "projects" | "compute" | "settings" | "docs" | "tutorials" | "help";
export type ProjectPage = "home" | "datasets" | "training" | "deployments";

const MAIN_NAV: NavItem[] = [
  { id: "dashboard", label: "Dashboard",   icon: LayoutDashboard },
  { id: "projects",  label: "All Projects", icon: FolderOpen },
  { id: "compute",   label: "Compute",     icon: Server },
];

const FOOTER_NAV: NavItem[] = [
  { id: "docs",      label: "Docs",          icon: BookOpen },
  { id: "tutorials", label: "Tutorials",     icon: GraduationCap },
  { id: "help",      label: "Help & Support", icon: HelpCircle },
  { id: "settings",  label: "Settings",      icon: Settings },
];

const PROJECT_NAV: NavItem[] = [
  { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
  { id: "home",        label: "Home",        icon: Home },
  { id: "datasets",    label: "Datasets",    icon: Database },
  { id: "training",    label: "Models",      icon: Cpu },
  { id: "deployments", label: "Deployments", icon: Rocket },
];

interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  projectName?: string;
  activeProjectPage?: ProjectPage;
  onProjectPageChange?: (page: ProjectPage) => void;
  onExitProject?: () => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
  onPlatformSwitch?: (app: string) => void;
  /** Override the AppShell content wrapper className (e.g. to remove padding for full-bleed pages). */
  contentClassName?: string;
}

export function AppLayout({
  activePage,
  onPageChange,
  projectName,
  activeProjectPage = "home",
  onProjectPageChange,
  onExitProject,
  children,
  isDark = false,
  onToggleDark,
  onPlatformSwitch,
  contentClassName,
}: AppLayoutProps) {
  const inProject = Boolean(projectName);

  const navItems = inProject ? PROJECT_NAV : MAIN_NAV;
  const footerNavItems = inProject ? [] : FOOTER_NAV;
  const shellActivePage = inProject ? activeProjectPage : activePage;

  const handlePageChange = (page: string) => {
    if (inProject) {
      if (page === "dashboard") {
        onExitProject?.();
      } else {
        onProjectPageChange?.(page as ProjectPage);
      }
    } else {
      onPageChange(page as Page);
    }
  };

  const breadcrumb: BreadcrumbSegment[] | undefined = inProject
    ? [
        { label: "All Projects", onClick: onExitProject },
        { label: projectName ?? "" },
        { label: PROJECT_NAV.find(i => i.id === activeProjectPage)?.label ?? "Home" },
      ]
    : undefined;

  return (
    <AppShell
      navItems={navItems}
      footerNavItems={footerNavItems}
      activePage={shellActivePage}
      onPageChange={handlePageChange}
      navGroupLabel={undefined}
      breadcrumb={breadcrumb}
      platformLabel="Training Platform"
      activePlatformId="training"
      onPlatformSwitch={onPlatformSwitch}
      isDark={isDark}
      onToggleDark={onToggleDark}
      contentClassName={contentClassName}
    >
      {children}
    </AppShell>
  );
}
