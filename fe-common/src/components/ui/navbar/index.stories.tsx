import {
  BarChart3,
  Bell,
  Camera,
  Car,
  CreditCard,
  Gauge,
  LayoutDashboard,
  LineChart,
  Settings,
  ShieldAlert,
  User,
} from "lucide-react";
import { AlertTriangle, Info, XCircle } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { NotificationMenu } from "../notification-menu";
import { ProfileMenu } from "../profile-menu";
import type { ProfileMenuItem } from "../profile-menu";
import {
  Sidebar,
  SidebarBrandHeader,
  SidebarContent,
  SidebarFooter,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavItem,
} from "../sidebar";
import {
  Navbar,
  NavbarActionButton,
  NavbarActionStatus,
  NavbarDropdownButton,
  NavbarLayoutContent,
} from "./index";
import type { NavbarBreadcrumbDropdown } from "./index";

/* -------------------------------------------------------------------------- */
/*  Theme CSS variables (shared with sidebar stories)                         */
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
}

[data-theme="dark"] {
  --primary-main: #00d4aa;
  --primary-hover: #00f5c4;
  --primary-active: #00ffd0;
  --primary-dark: #00b38a;
  --primary-light: #00f5c4;
  --primary-glow: rgba(0, 212, 170, 0.4);
  --primary-glow-strong: rgba(0, 212, 170, 0.6);
  --bg-body: #020617;
  --bg-surface: #0f172a;
  --bg-elevated: #1e293b;
  --bg-sidebar: #021D18;
  --bg-hover: #334155;
  --bg-muted: #1e293b;
  --bg-header: #021D18;
  --sidebar-text: #FAFAFA;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-item-active-bg: #00775B;
  --sidebar-item-hover-bg: rgba(255, 255, 255, 0.1);
  --sidebar-bottom-border: rgba(255, 255, 255, 0.1);
  --sidebar-tooltip-border: rgba(255, 255, 255, 0.1);
  --sidebar-profile-bg: rgba(255, 255, 255, 0.05);
  --sidebar-profile-hover-bg: rgba(255, 255, 255, 0.1);
  --sidebar-profile-text-muted: rgba(255, 255, 255, 0.7);
  --sidebar-profile-border: transparent;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-disabled: #64748b;
  --border-light: #1e293b;
  --border-medium: #334155;
  --border-dark: #475569;
  --border-color: #334155;
  --shadow-xs: 0px 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
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

/** Shared profile menu items for stories */
const profileUser = {
  name: "John Doe",
  subtitle: "Administrator",
  initials: "JD",
};

const profileMenuItems: ProfileMenuItem[] = [
  {
    key: "profile",
    label: "My Profile",
    icon: <User size={14} />,
    onClick: () => console.log("profile"),
  },
  {
    key: "billing",
    label: "Billing",
    icon: <CreditCard size={14} />,
    onClick: () => console.log("billing"),
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: <Bell size={14} />,
    onClick: () => console.log("notifications"),
  },
];

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
          <ProfileMenu
            user={profileUser}
            items={profileMenuItems}
            showSignOut
            onSignOut={() => console.log("sign out")}
          />
        }
        /* No sidebar context — toggle is driven by internal state */
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
          {/* Root label */}
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

          {/* Separator */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5.25 3.5L8.75 7L5.25 10.5"
              stroke="rgba(241,245,249,0.5)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Project dropdown */}
          <NavbarDropdownButton
            value={projectValue}
            options={projectOptions}
            onChange={setProjectValue}
          />

          {/* Separator */}
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M5.25 3.5L8.75 7L5.25 10.5"
              stroke="rgba(241,245,249,0.5)"
              strokeWidth="1"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>

          {/* Run dropdown with status dot */}
          <NavbarDropdownButton
            value={runValue}
            options={runOptions}
            onChange={setRunValue}
            statusDot
            statusColor="#8D8D8D"
          />

          {/* Action button */}
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
/*  Story 3 — WithSidebarLayout                                               */
/* -------------------------------------------------------------------------- */

function FullLayout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [activePlatform] = React.useState("analytics");
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
      {/*
       * showToggleButton={false} hides the built-in ChevronLeft toggle.
       * The Navbar's PanelLeft is the sole toggle.
       * Sidebar writes --sidebar-current-width to :root on every state change;
       * NavbarLayoutContent reads that variable — no shared context needed.
       */}
      <Sidebar
        open={sidebarOpen}
        onOpenChange={setSidebarOpen}
        collapsible
        showToggleButton={false}
      >
        <SidebarBrandHeader
          title="Matrice AI"
          subtitle="Analytics Platform"
          activePlatform={activePlatform}
        />

        <SidebarContent>
          <SidebarNav>
            <SidebarNavGroup label="Main">
              <SidebarNavItem
                href="/"
                icon={<LayoutDashboard size={16} />}
                active
              >
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem
                href="/incidents"
                icon={<ShieldAlert size={16} />}
                badge={3}
              >
                Incidents
              </SidebarNavItem>
              <SidebarNavItem href="/metrics" icon={<LineChart size={16} />}>
                Metrics &amp; Rules
              </SidebarNavItem>
              <SidebarNavItem href="/tracking" icon={<Gauge size={16} />}>
                Tracking
              </SidebarNavItem>
              <SidebarNavItem href="/analytics" icon={<BarChart3 size={16} />}>
                Analytics
              </SidebarNavItem>
              <SidebarNavItem href="/facial" icon={<Camera size={16} />}>
                Facial Recognition
              </SidebarNavItem>
              <SidebarNavItem href="/plates" icon={<Car size={16} />}>
                License Plates
              </SidebarNavItem>
            </SidebarNavGroup>
          </SidebarNav>
        </SidebarContent>

        <SidebarFooter>
          <SidebarNav>
            <SidebarNavItem
              href="/settings"
              icon={<Settings size={16} />}
              size="lg"
            >
              Settings
            </SidebarNavItem>
          </SidebarNav>
          <ProfileMenu
            user={profileUser}
            items={profileMenuItems}
            showSignOut
            onSignOut={() => console.log("sign out")}
            variant="expanded"
            side="top"
            align="start"
          />
        </SidebarFooter>
      </Sidebar>

      {/*
       * NavbarLayoutContent is a sibling of Sidebar.
       * It reads --sidebar-current-width (set by Sidebar on :root) to shift
       * itself — no React context or prop-drilling needed for the offset.
       * The Navbar toggle is wired via props since Navbar is outside the
       * Sidebar context provider.
       */}
      <NavbarLayoutContent>
        <Navbar
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={() => setSidebarOpen((v) => !v)}
          breadcrumbRoot="Projects"
          breadcrumbDropdowns={breadcrumbs}
          actionStatus={NavbarActionStatus.Resume}
          onActionClick={(status) =>
            console.log("action clicked, current status:", status)
          }
          showClock
          onSearch={() => console.log("search")}
          onNotifications={() => console.log("notifications")}
          avatar={
            <ProfileMenu
              user={profileUser}
              items={profileMenuItems}
              showSignOut
              onSignOut={() => console.log("sign out")}
            />
          }
        />

        {/* Page content placeholder */}
        <div
          style={{
            flex: 1,
            padding: 24,
            color: "var(--text-primary)",
            display: "flex",
            flexDirection: "column",
            gap: 16,
          }}
        >
          <div
            style={{
              background: "var(--bg-surface)",
              borderRadius: "var(--radius-lg)",
              border: "1px solid var(--border-color)",
              padding: 24,
              color: "var(--text-secondary)",
              fontSize: 14,
            }}
          >
            Main content area — click the{" "}
            <strong style={{ color: "var(--text-primary)" }}>PanelLeft</strong>{" "}
            icon in the navbar to toggle the sidebar. Select a project or run
            from the breadcrumb dropdowns.
          </div>
        </div>
      </NavbarLayoutContent>
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Meta                                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Navbar> = {
  title: "Components/Navbar",
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

export const WithSidebarLayout: Story = {
  name: "With Sidebar Layout",
  render: () => <FullLayout />,
};

/* -------------------------------------------------------------------------- */
/*  Story 4 — With NotificationMenu                                           */
/* -------------------------------------------------------------------------- */

interface SampleNotification {
  id: string;
  title: string;
  description: string;
  service: string;
  level: "critical" | "error" | "warning" | "info";
  read: boolean;
  createdAt: string;
}

const levelIcon: Record<SampleNotification["level"], React.ReactNode> = {
  critical: <XCircle size={14} className="text-destructive shrink-0" />,
  error: <AlertTriangle size={14} className="text-destructive shrink-0" />,
  warning: <AlertTriangle size={14} className="text-warning shrink-0" />,
  info: <Info size={14} className="text-brand shrink-0" />,
};

const sampleNotifications: SampleNotification[] = [
  {
    id: "1",
    title: "Deployment failed",
    description: "Pipeline #482 failed at build stage for project Alpha.",
    service: "CI/CD",
    level: "critical",
    read: false,
    createdAt: "2 minutes ago",
  },
  {
    id: "2",
    title: "High memory usage",
    description: "Server node-3 memory usage exceeded 90% threshold.",
    service: "Monitoring",
    level: "warning",
    read: false,
    createdAt: "15 minutes ago",
  },
  {
    id: "3",
    title: "New team member joined",
    description: "Jane Smith has been added to the Engineering workspace.",
    service: "Team",
    level: "info",
    read: true,
    createdAt: "1 hour ago",
  },
];

function renderNotification(item: SampleNotification) {
  return (
    <div
      className={`flex gap-2.5 px-3 py-2.5 ${!item.read ? "bg-hover/50" : ""}`}
    >
      <div className="mt-0.5">{levelIcon[item.level]}</div>
      <div className="flex flex-col gap-0.5 min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`text-xs font-semibold truncate ${!item.read ? "text-foreground" : "text-muted-foreground"}`}
          >
            {item.title}
          </span>
          <span className="text-[10px] text-muted-foreground whitespace-nowrap shrink-0 uppercase tracking-wide">
            {item.service}
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 m-0">
          {item.description}
        </p>
        <span className="text-[10px] text-muted-foreground mt-0.5">
          {item.createdAt}
        </span>
      </div>
    </div>
  );
}

function WithNotificationMenuDemo() {
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
        notificationSlot={
          <NotificationMenu<SampleNotification>
            items={sampleNotifications}
            getKey={(item) => item.id}
            renderItem={renderNotification}
            onItemClick={(item) =>
              console.log("Notification clicked:", item.id)
            }
            badgeCount={2}
          />
        }
        avatar={
          <ProfileMenu
            user={profileUser}
            items={profileMenuItems}
            showSignOut
            onSignOut={() => console.log("sign out")}
          />
        }
        isSidebarOpen={true}
        onToggleSidebar={() => console.log("toggle sidebar")}
      />
    </ThemeProvider>
  );
}

export const WithNotificationMenu: Story = {
  name: "With NotificationMenu",
  render: () => <WithNotificationMenuDemo />,
};

/* -------------------------------------------------------------------------- */
/*  Story 5 — With Many Notifications (scrollable)                            */
/* -------------------------------------------------------------------------- */

const manyNotifications: SampleNotification[] = [
  {
    id: "1",
    title: "Deployment failed",
    description: "Pipeline #482 failed at build stage for project Alpha.",
    service: "CI/CD",
    level: "critical",
    read: false,
    createdAt: "2 minutes ago",
  },
  {
    id: "2",
    title: "High memory usage",
    description: "Server node-3 memory usage exceeded 90% threshold.",
    service: "Monitoring",
    level: "warning",
    read: false,
    createdAt: "15 minutes ago",
  },
  {
    id: "3",
    title: "SSL certificate expiring",
    description: "Certificate for api.example.com expires in 7 days.",
    service: "Security",
    level: "error",
    read: false,
    createdAt: "1 hour ago",
  },
  {
    id: "4",
    title: "New team member joined",
    description: "Jane Smith has been added to the Engineering workspace.",
    service: "Team",
    level: "info",
    read: true,
    createdAt: "2 hours ago",
  },
  {
    id: "5",
    title: "Database migration complete",
    description: "Migration v42 applied successfully to production cluster.",
    service: "Database",
    level: "info",
    read: true,
    createdAt: "3 hours ago",
  },
  {
    id: "6",
    title: "Rate limit exceeded",
    description: "API gateway hit 429 threshold on /v2/inference endpoint.",
    service: "API Gateway",
    level: "warning",
    read: false,
    createdAt: "4 hours ago",
  },
  {
    id: "7",
    title: "Backup completed",
    description: "Nightly database backup completed successfully.",
    service: "Database",
    level: "info",
    read: true,
    createdAt: "6 hours ago",
  },
  {
    id: "8",
    title: "Node unhealthy",
    description: "Worker node k8s-worker-07 failed health check 3 times.",
    service: "Infrastructure",
    level: "critical",
    read: false,
    createdAt: "8 hours ago",
  },
];

function ManyNotificationsDemo() {
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
        notificationSlot={
          <NotificationMenu<SampleNotification>
            items={manyNotifications}
            getKey={(item) => item.id}
            renderItem={renderNotification}
            onItemClick={(item) =>
              console.log("Notification clicked:", item.id)
            }
            badgeCount={5}
            footer={
              <button
                type="button"
                className="w-full py-2 text-xs text-brand font-medium hover:bg-hover transition-colors cursor-pointer bg-transparent border-none"
                onClick={() => console.log("View all")}
              >
                View all notifications
              </button>
            }
          />
        }
        avatar={
          <ProfileMenu
            user={profileUser}
            items={profileMenuItems}
            showSignOut
            onSignOut={() => console.log("sign out")}
          />
        }
        isSidebarOpen={true}
        onToggleSidebar={() => console.log("toggle sidebar")}
      />
    </ThemeProvider>
  );
}

export const ManyNotifications: Story = {
  name: "Many Notifications (scrollable)",
  render: () => <ManyNotificationsDemo />,
};

/* -------------------------------------------------------------------------- */
/*  Story 6 — Action Button Showcase                                          */
/* -------------------------------------------------------------------------- */

function ActionButtonShowcaseDemo() {
  const [status, setStatus] = React.useState<NavbarActionStatus>(
    NavbarActionStatus.Resume,
  );

  const handleAction = (currentStatus: NavbarActionStatus) => {
    console.log("action clicked, current status:", currentStatus);
    // Example state machine: Resume → Running → Stopped → Resume
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
        {/* All three variants via NavbarActionButton */}
        <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
          <div style={{ textAlign: "center" }}>
            <NavbarActionButton
              status={NavbarActionStatus.Resume}
              onClick={() => console.log("resume")}
            />
            <p
              style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}
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
              style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}
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
              style={{ color: "var(--text-muted)", fontSize: 12, marginTop: 8 }}
            >
              Stop (Inactive)
            </p>
          </div>
        </div>

        {/* Interactive state cycling */}
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

export const ActionButtonShowcase: Story = {
  name: "Action Button Showcase",
  render: () => <ActionButtonShowcaseDemo />,
};
