import {
  AlertCircle,
  BarChart3,
  Brain,
  Bug,
  Camera,
  Check,
  CheckCircle,
  Download,
  FolderOpen,
  GitBranch,
  Headset,
  HelpCircle,
  Info,
  LayoutDashboard,
  Monitor,
  Moon,
  Router,
  Server,
  Settings,
  Settings2,
  Shield,
  Sun,
  User,
  Wrench,
} from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Avatar, AvatarFallback } from "../avatar";
import { NotificationMenu } from "../notification-menu";
import { ProfileMenu } from "../profile-menu";
import type { ProfileMenuItem as ProfileMenuItemType } from "../profile-menu";
import { AppSidebar, SidebarInset } from "../sidebar";
import type { SidebarMenuItemConfig, SidebarPlatformConfig } from "../sidebar";
import {
  Navbar,
  NavbarActionButton,
  NavbarActionStatus,
  NavbarDropdownButton,
} from "./index";
import type { NavbarBreadcrumbDropdown } from "./index";

/* -------------------------------------------------------------------------- */
/*  Theme CSS variables                                                       */
/* -------------------------------------------------------------------------- */

const themeVars = `
:root {
  --primary-main: #00775b;
  --primary-hover: #004e3d;
  --primary-active: #003d32;
  --primary-light: #00956d;
  --primary-subtle: #e5fff9;
  --primary-dark: #004d40;
  --primary-glow: rgba(0, 119, 91, 0.4);
  --primary-glow-strong: rgba(0, 119, 91, 0.6);
  --bg-body: #f1f5f9;
  --bg-surface: #ffffff;
  --bg-elevated: #ffffff;
  --bg-sidebar: #021D18;
  --bg-hover: #e2e8f0;
  --bg-muted: #e2e8f0;
  --bg-header: #021D18;
  --sidebar-width-open: 220px;
  --sidebar-width-collapsed: 64px;
  --sidebar-text: #FAFAFA;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-text-secondary: rgba(255, 255, 255, 0.5);
  --sidebar-item-active-bg: #00775B;
  --sidebar-item-hover-bg: rgba(255, 255, 255, 0.1);
  --sidebar-bottom-bg: #021D18;
  --sidebar-bottom-border: rgba(255, 255, 255, 0.1);
  --sidebar-tooltip-border: rgba(255, 255, 255, 0.1);
  --sidebar-avatar-bg: #00503D;
  --sidebar-icon-filter: brightness(1);
  --sidebar-profile-bg: rgba(255, 255, 255, 0.05);
  --sidebar-profile-hover-bg: rgba(255, 255, 255, 0.1);
  --sidebar-profile-text-muted: rgba(255, 255, 255, 0.7);
  --sidebar-profile-border: rgba(255, 255, 255, 0.1);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --text-disabled: #94a3b8;
  --border-light: #e2e8f0;
  --border-medium: #cbd5e1;
  --border-dark: #94a3b8;
  --border-color: #e2e8f0;
  --error-main: #E7000B;
  --success-main: #00A63E;
  --warning-main: #E19A04;
  --color-primary-foreground: #ffffff;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  --shadow-xs: 0px 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 400ms;
  --ease-snappy: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-data: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", Consolas, monospace;
  --spacing: 0.25rem;
  --sidebar-width: 14rem;
}
`;

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

function ThemeProvider({
  theme = "dark",
  children,
}: {
  theme?: "light" | "dark";
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      <div
        data-theme={theme === "dark" ? "dark" : undefined}
        style={{
          background: theme === "dark" ? "#020617" : "#f1f5f9",
          minHeight: "100vh",
          fontFamily:
            '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {children}
      </div>
    </>
  );
}

/* ── Mock data ──────────────────────────────────────────────────────────── */

const projectOptions = [
  { value: "h100-demo", label: "H100-webrtc-demo" },
  { value: "a100-cluster", label: "A100-cluster-bench" },
  { value: "v100-prod", label: "V100-production" },
  { value: "t4-research", label: "T4-research-exp" },
];

const runOptions = [
  { value: "run-3", label: "Run 3 — latest" },
  { value: "run-2", label: "Run 2 — stable" },
  { value: "run-1", label: "Run 1 — baseline" },
];

const storyPlatforms: SidebarPlatformConfig[] = [
  {
    value: "vms",
    label: "Matrice VMS",
    icon: <Monitor className="size-4 shrink-0" />,
    shortcut: "1",
    href: "#",
  },
  {
    value: "analytics",
    label: "Matrice Analytics",
    icon: <BarChart3 className="size-4 shrink-0" />,
    shortcut: "2",
    href: "#",
  },
  {
    value: "support",
    label: "Matrice Support",
    icon: <Wrench className="size-4 shrink-0" />,
    shortcut: "3",
    href: "#",
  },
  {
    value: "internal",
    label: "Matrice Internal",
    icon: <Shield className="size-4 shrink-0" />,
    shortcut: "4",
    href: "#",
  },
];

const mainNavItems: SidebarMenuItemConfig[] = [
  {
    key: "support-desk",
    icon: <Headset />,
    label: "Support Desk",
    isActive: true,
  },
  { key: "projects", icon: <FolderOpen />, label: "Projects" },
  { key: "system-flow", icon: <GitBranch />, label: "System Flow" },
  { key: "cameras", icon: <Camera />, label: "Cameras" },
  { key: "gateways", icon: <Router />, label: "Gateways" },
  { key: "compute", icon: <Server />, label: "Compute" },
  { key: "ml-apps", icon: <Brain />, label: "ML Apps", disabled: true },
  {
    key: "command-centre",
    icon: <LayoutDashboard />,
    label: "Command Centre",
    disabled: true,
  },
];

const supportNavItems: SidebarMenuItemConfig[] = [
  { key: "issues", icon: <Bug />, label: "Issues" },
  { key: "device-config", icon: <Settings2 />, label: "Device Config" },
  { key: "downloads", icon: <Download />, label: "Downloads" },
  { key: "settings", icon: <Settings />, label: "Settings" },
  { key: "help", icon: <HelpCircle />, label: "Help and Support" },
];

interface Notification {
  id: string;
  type: "issue" | "deployment" | "alert" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
}

const notificationTypeConfig: Record<
  Notification["type"],
  { icon: React.ElementType; colorClass: string; dotClass: string }
> = {
  alert: {
    icon: AlertCircle,
    colorClass: "text-destructive bg-destructive/10",
    dotClass: "bg-destructive",
  },
  issue: {
    icon: Bug,
    colorClass: "text-orange-500 bg-orange-500/10",
    dotClass: "bg-orange-500",
  },
  deployment: {
    icon: CheckCircle,
    colorClass: "text-primary bg-primary/10",
    dotClass: "bg-primary",
  },
  info: {
    icon: Info,
    colorClass: "text-blue-500 bg-blue-500/10",
    dotClass: "bg-blue-500",
  },
};

const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "alert",
    title: "Critical: Fire Detection false positive spike",
    description:
      "ISS-1023 — False positive rate increased by 23% on Qatar_Demo.",
    time: "30 min ago",
    read: false,
  },
  {
    id: "n2",
    type: "issue",
    title: "New issue assigned to you",
    description: "ISS-1024 — Camera feed dropping on Car_Park_30.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "n3",
    type: "deployment",
    title: "Firmware v3.2.1 available",
    description: "New gateway firmware ready for download.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "n4",
    type: "info",
    title: "Compute node H100 memory usage high",
    description: "RAM at 92% on H100-Lan-default. Consider restarting.",
    time: "1 day ago",
    read: true,
  },
  {
    id: "n5",
    type: "deployment",
    title: "Batch deployment completed",
    description: "Fire Detection pipeline deployed to 5 cameras.",
    time: "2 days ago",
    read: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Story 1 — Default (Navbar in isolation)                                   */
/* -------------------------------------------------------------------------- */

function DefaultDemo() {
  const [projectValue, setProjectValue] = React.useState("h100-demo");
  const [runValue, setRunValue] = React.useState("run-3");

  const breadcrumbs: NavbarBreadcrumbDropdown[] = [
    {
      value: projectValue,
      options: projectOptions,
      onChange: setProjectValue,
    },
    {
      value: runValue,
      options: runOptions,
      onChange: setRunValue,
      statusDot: true,
      statusColor: "#8D8D8D",
    },
  ];

  return (
    <ThemeProvider theme="dark">
      <Navbar
        breadcrumbRoot="Projects"
        breadcrumbDropdowns={breadcrumbs}
        actionStatus={NavbarActionStatus.Resume}
        onActionClick={(status) =>
          console.log("action clicked, current status:", status)
        }
        showClock
        onSearch={() => console.log("search clicked")}
        onNotifications={() => console.log("bell clicked")}
        avatar={
          <Avatar className="size-8">
            <AvatarFallback className="text-xs bg-(--primary-main) text-white">
              JD
            </AvatarFallback>
          </Avatar>
        }
        isSidebarOpen={true}
        onToggleSidebar={() => console.log("toggle sidebar")}
      />
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Story 2 — BreadcrumbDropdownShowcase                                      */
/* -------------------------------------------------------------------------- */

function BreadcrumbShowcase() {
  const [projectValue, setProjectValue] = React.useState("h100-demo");
  const [runValue, setRunValue] = React.useState("run-3");

  return (
    <ThemeProvider theme="dark">
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          padding: 32,
        }}
      >
        <div
          style={{
            background: "var(--bg-header)",
            borderRadius: "var(--radius-md)",
            padding: "8px 12px",
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              fontSize: 14,
              fontWeight: 400,
              lineHeight: "20px",
              color: "var(--text-muted)",
              whiteSpace: "nowrap",
            }}
          >
            Projects
          </span>

          <NavbarDropdownButton
            value={projectValue}
            options={projectOptions}
            onChange={setProjectValue}
          />

          <NavbarDropdownButton
            value={runValue}
            options={runOptions}
            onChange={setRunValue}
            statusDot
            statusColor="#8D8D8D"
          />

          <NavbarActionButton
            status={NavbarActionStatus.Resume}
            onClick={(status) =>
              console.log("action clicked, current status:", status)
            }
          />
        </div>
      </div>
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Story 3 — Full Layout (Sidebar + Navbar, Support Platform pattern)        */
/*  Uses SidebarInset so sidebar and navbar are flush — no gap.               */
/*  Content area has rounded-tl-2xl where it meets the header.                */
/* -------------------------------------------------------------------------- */

function FullLayoutDemo() {
  const [isDark, setIsDark] = React.useState(true);
  const [activePlatform, setActivePlatform] = React.useState("support");
  const [notifications, setNotifications] =
    React.useState<Notification[]>(initialNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const profileItems: ProfileMenuItemType[] = [
    {
      key: "profile",
      label: "Profile",
      icon: <User className="size-4" />,
      onSelect: () => console.log("profile"),
    },
    {
      key: "theme",
      label: isDark ? "Light Mode" : "Dark Mode",
      icon: isDark ? <Sun className="size-4" /> : <Moon className="size-4" />,
      onSelect: () => setIsDark((prev) => !prev),
    },
  ];

  const notificationSlot = (
    <NotificationMenu<Notification>
      items={notifications}
      getKey={(n) => n.id}
      renderItem={(n) => {
        const config = notificationTypeConfig[n.type];
        return (
          <>
            <div
              className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${config.dotClass}`}
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <span
                  className={`text-sm truncate ${!n.read ? "font-medium" : "text-muted-foreground"}`}
                >
                  {n.title}
                </span>
                {!n.read && (
                  <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                {n.description}
              </p>
              <span className="text-[11px] text-muted-foreground/70 mt-1 block">
                {n.time}
              </span>
            </div>
          </>
        );
      }}
      onItemClick={(n) => markAsRead(n.id)}
      isUnread={(n) => !n.read}
      badgeCount={unreadCount}
      triggerClassName="text-sidebar-foreground/70 hover:bg-sidebar-accent"
      headerAction={
        unreadCount > 0 ? (
          <button
            onClick={markAllAsRead}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors cursor-pointer border-none bg-transparent"
          >
            <Check className="w-3 h-3" />
            Mark all read
          </button>
        ) : undefined
      }
      footer={
        <button className="text-xs text-primary hover:underline w-full text-center block cursor-pointer border-none bg-transparent">
          View all activity
        </button>
      }
    />
  );

  const profileSlot = (
    <ProfileMenu
      user={{
        name: "Mohammed Usman F",
        subtitle: "mohammed.usman@matrice.ai",
        initials: "MU",
      }}
      items={profileItems}
      showSignOut
      onSignOut={() => console.log("sign out")}
    />
  );

  return (
    <ThemeProvider theme={isDark ? "dark" : "light"}>
      <AppSidebar
        menuItems={mainNavItems}
        footerItems={supportNavItems}
        platforms={storyPlatforms}
        activePlatform={activePlatform}
        onPlatformChange={setActivePlatform}
        title="Matrice.ai"
        subtitle="Support Platform"
        defaultOpen={false}
        collapsible="icon"
        variant="sidebar"
        showRail
      >
        {/* SidebarInset — dark bg matches sidebar/navbar */}
        <SidebarInset className="overflow-hidden bg-sidebar">
          {/* Navbar */}
          <Navbar
            breadcrumbRoot="Support Desk"
            breadcrumbSlot={
              <span className="text-sm font-medium text-sidebar-foreground">
                All Tickets
              </span>
            }
            notificationSlot={notificationSlot}
            rightSlot={profileSlot}
          />

          {/* Content area — dark bg wrapper, content has rounded-tl-2xl */}
          <div className="flex flex-1 flex-col overflow-hidden min-h-0">
            <div className="flex-1 rounded-tl-2xl bg-background p-6">
              <div className="rounded-lg border border-border p-6">
                <h2 className="text-lg font-semibold text-foreground mb-2">
                  Full Layout
                </h2>
                <p className="text-sm text-muted-foreground">
                  AppSidebar + Navbar composing the full layout. The content
                  area has a rounded top-left corner where it meets the dark
                  header. This mirrors the Support Platform layout pattern.
                </p>
              </div>
            </div>
          </div>
        </SidebarInset>
      </AppSidebar>
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Story 5 — Action Button Showcase                                          */
/* -------------------------------------------------------------------------- */

function ActionButtonShowcaseDemo() {
  const [status, setStatus] = React.useState<NavbarActionStatus>(
    NavbarActionStatus.Resume,
  );

  const handleAction = (currentStatus: NavbarActionStatus) => {
    switch (currentStatus) {
      case NavbarActionStatus.Resume:
        setStatus(NavbarActionStatus.Running);
        break;
      case NavbarActionStatus.Running:
        setStatus(NavbarActionStatus.Stopped);
        break;
      case NavbarActionStatus.Stopped:
        setStatus(NavbarActionStatus.Resume);
        break;
    }
  };

  return (
    <ThemeProvider theme="dark">
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 32,
          padding: 32,
        }}
      >
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <NavbarActionButton
              status={NavbarActionStatus.Resume}
              onClick={() => console.log("resume")}
            />
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Start (Resume)
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <NavbarActionButton
              status={NavbarActionStatus.Running}
              onClick={() => console.log("running")}
            />
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Stop (Running)
            </p>
          </div>
          <div style={{ textAlign: "center" }}>
            <NavbarActionButton
              status={NavbarActionStatus.Stopped}
              onClick={() => console.log("stopped")}
            />
            <p
              style={{
                color: "var(--text-muted)",
                fontSize: 12,
                marginTop: 8,
              }}
            >
              Stop (Inactive)
            </p>
          </div>
        </div>

        <div
          style={{
            background: "var(--bg-header)",
            borderRadius: "var(--radius-md)",
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 12,
          }}
        >
          <span style={{ color: "var(--text-muted)", fontSize: 13 }}>
            Status:{" "}
            <strong style={{ color: "var(--sidebar-text)" }}>{status}</strong>
          </span>
          <NavbarActionButton status={status} onClick={handleAction} />
        </div>
        <p style={{ color: "var(--text-muted)", fontSize: 12 }}>
          Click the button to cycle: Resume → Running → Stopped → Resume
        </p>
      </div>
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Meta                                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Navbar> = {
  title: "Primitives/Navbar",
  component: Navbar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Navbar>;

/* -------------------------------------------------------------------------- */
/*  Stories                                                                   */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  name: "Default",
  render: () => <DefaultDemo />,
};

export const BreadcrumbDropdownShowcase: Story = {
  name: "Breadcrumb Dropdown Showcase",
  render: () => <BreadcrumbShowcase />,
};

export const FullLayout: Story = {
  name: "Full Layout (Sidebar + Navbar)",
  render: () => <FullLayoutDemo />,
};

export const ActionButtonShowcase: Story = {
  name: "Action Button Showcase",
  render: () => <ActionButtonShowcaseDemo />,
};
