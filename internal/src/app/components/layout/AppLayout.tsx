import { AppShell, NavSection } from "@fe-common/components/layout/AppShell";
import {
  LayoutDashboard,
  Server,
  Layers,
  Database,
  Network,
  HardDrive,
  Cpu,
  Radio,
  Terminal,
  Camera,
  Video,
  Users,
  Flag,
} from "lucide-react";

export type Page =
  | "dashboard"
  | "microservices" | "kafka" | "redis" | "clusters" | "system"
  | "inference" | "streaming-gateway" | "websocket" | "cameras" | "ip-camera-logs"
  | "team" | "feature";

const NAV_SECTIONS: NavSection[] = [
  {
    label: "Operations",
    items: [
      { id: "dashboard",   label: "Dashboard",   icon: LayoutDashboard },
    ],
  },
  {
    label: "Infrastructure",
    items: [
      { id: "microservices", label: "Microservices",     icon: Server },
      { id: "kafka",         label: "Kafka",             icon: Layers },
      { id: "redis",         label: "Redis",             icon: Database },
      { id: "clusters",      label: "Clusters",          icon: Network },
      { id: "system",        label: "System",            icon: HardDrive },
    ],
  },
  {
    label: "Applications",
    items: [
      { id: "inference",         label: "Inference",          icon: Cpu },
      { id: "streaming-gateway", label: "Streaming Gateway",  icon: Radio },
      { id: "websocket",         label: "Web Socket",         icon: Terminal },
      { id: "cameras",           label: "Cameras",            icon: Camera },
      { id: "ip-camera-logs",    label: "IP Camera Logs",     icon: Video },
    ],
  },
  {
    label: "Team & Admin",
    items: [
      { id: "team",    label: "Team",    icon: Users },
      { id: "feature", label: "Feature", icon: Flag },
    ],
  },
];

interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
  onPlatformSwitch?: (app: string) => void;
}

export function AppLayout({
  activePage,
  onPageChange,
  children,
  isDark = false,
  onToggleDark,
  onPlatformSwitch,
}: AppLayoutProps) {
  return (
    <AppShell
      navItems={[]}
      navSections={NAV_SECTIONS}
      activePage={activePage}
      onPageChange={(p) => onPageChange(p as Page)}
      platformLabel="Internal Platform"
      activePlatformId="internal"
      onPlatformSwitch={onPlatformSwitch}
      isDark={isDark}
      onToggleDark={onToggleDark}
      contentClassName="flex flex-1 flex-col overflow-auto p-0"
    >
      {children}
    </AppShell>
  );
}
