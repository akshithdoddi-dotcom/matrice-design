import { AppShell, NavItem } from "@fe-common/components/layout/AppShell";
import {
  Headphones,
  FolderOpen,
  GitBranch,
  Camera,
  Network,
  Cpu,
  Brain,
  Terminal,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Page } from "@/app/components/layout/AppSidebar";

const MAIN_NAV: NavItem[] = [
  { id: "support-desk",   label: "Support Desk",  icon: Headphones },
  { id: "projects",       label: "Projects",       icon: FolderOpen },
  { id: "system-flow",    label: "System Flow",    icon: GitBranch  },
  { id: "cameras",        label: "Cameras",        icon: Camera     },
  { id: "gateways",       label: "Gateways",       icon: Network    },
  { id: "compute",        label: "Compute",        icon: Cpu        },
  { id: "ml-apps",        label: "ML Apps",        icon: Brain      },
  { id: "command-centre", label: "Command Centre", icon: Terminal   },
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
  fullBleed?: boolean;
}

export function AppLayout({ activePage, onPageChange, children, isDark = false, onToggleDark, onPlatformSwitch, fullBleed = false }: AppLayoutProps) {
  return (
    <AppShell
      navItems={MAIN_NAV}
      footerNavItems={FOOTER_NAV}
      activePage={activePage}
      onPageChange={(p) => onPageChange(p as Page)}
      platformLabel="Support Platform"
      activePlatformId="support"
      onPlatformSwitch={onPlatformSwitch}
      isDark={isDark}
      onToggleDark={onToggleDark}
      contentClassName={fullBleed ? "p-0 min-h-0" : "p-6"}
    >
      {children}
    </AppShell>
  );
}
