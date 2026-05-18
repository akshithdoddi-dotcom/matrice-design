import {
  BarChart3,
  Camera,
  Car,
  Gauge,
  Headphones,
  LayoutDashboard,
  LineChart,
  Settings,
  Shield,
  ShieldAlert,
  User,
} from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import {
  Command,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandShortcut,
} from "../command";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarLogo,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavItem,
} from "./index";

/* -------------------------------------------------------------------------- */
/*  Theme CSS variables injected via style element                            */
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
  --bg-elevated: #f1f5f9;
  --bg-sidebar: #021D18;
  --bg-hover: #e2e8f0;
  --bg-muted: #e2e8f0;
  --bg-header: #021D18;
  --sidebar-width-open: 220px;
  --sidebar-width-collapsed: 64px;
  --sidebar-text: #FAFAFA;
  --sidebar-border: rgba(255, 255, 255, 0.1);
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
  --error-main: #E7000B;
  --success-main: #00A63E;
  --warning-main: #E19A04;
  --color-primary-foreground: #ffffff;
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --radius-sm: 4px;
  --radius-md: 6px;
  --radius-lg: 8px;
  --radius-xl: 12px;
  --radius-full: 9999px;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1);
  --shadow-glow: 0 0 15px rgba(0, 119, 91, 0.4);
  --duration-instant: 100ms;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --duration-slow: 400ms;
  --ease-snappy: cubic-bezier(0.22, 1, 0.36, 1);
  --ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
  --font-ui: "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  --font-data: "JetBrains Mono", "SF Mono", Monaco, "Cascadia Code", Consolas, monospace;
}

[data-theme="dark"] {
  --primary-main: #00d4aa;
  --primary-hover: #00f5c4;
  --primary-active: #00ffd0;
  --primary-dark: #00b38a;
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
  --sidebar-bottom-bg: #021D18;
  --sidebar-bottom-border: rgba(255, 255, 255, 0.1);
  --sidebar-tooltip-border: rgba(255, 255, 255, 0.1);
  --sidebar-icon-filter: brightness(1);
  --sidebar-profile-bg: #00d4aa;
  --sidebar-profile-hover-bg: #00f5c4;
  --sidebar-profile-text-muted: rgba(255, 255, 255, 0.7);
  --sidebar-profile-border: transparent;
  --text-primary: #f1f5f9;
  --text-secondary: #cbd5e1;
  --text-muted: #94a3b8;
  --text-disabled: #64748b;
  --border-light: #1e293b;
  --border-medium: #334155;
  --border-dark: #475569;
  --error-main: #E7000B;
  --success-main: #00A63E;
  --warning-main: #E19A04;
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
  --shadow-md: 0 1px 3px 0 rgba(0, 0, 0, 0.4), 0 1px 2px -1px rgba(0, 0, 0, 0.3);
  --shadow-lg: 0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.3);
  --shadow-glow: 0 0 15px rgba(0, 212, 170, 0.4);
}
`;

/* -------------------------------------------------------------------------- */
/*  Platform switcher Command content                                         */
/* -------------------------------------------------------------------------- */

function PlatformSwitcher({
  activePlatform = "analytics",
}: {
  activePlatform?: string;
}) {
  return (
    <Command>
      <CommandList>
        <CommandGroup heading="Platforms">
          <CommandItem value="vms" active={activePlatform === "vms"}>
            <Camera className="size-4 shrink-0" />
            <span className="flex-1 truncate">Matrice VMS</span>
            <CommandShortcut>⌘1</CommandShortcut>
          </CommandItem>
          <CommandItem
            value="analytics"
            active={activePlatform === "analytics"}
          >
            <BarChart3 className="size-4 shrink-0" />
            <span className="flex-1 truncate">Matrice Analytics</span>
            <CommandShortcut>⌘2</CommandShortcut>
          </CommandItem>
          <CommandItem value="support" active={activePlatform === "support"}>
            <Headphones className="size-4 shrink-0" />
            <span className="flex-1 truncate">Matrice Support</span>
            <CommandShortcut>⌘3</CommandShortcut>
          </CommandItem>
          <CommandItem value="internal" active={activePlatform === "internal"}>
            <Shield className="size-4 shrink-0" />
            <span className="flex-1 truncate">Matrice Internal</span>
            <CommandShortcut>⌘4</CommandShortcut>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </Command>
  );
}

/* -------------------------------------------------------------------------- */
/*  Matrice Logo (uses exported SidebarLogo)                                  */
/* -------------------------------------------------------------------------- */

function MatriceLogo() {
  return (
    <SidebarLogo
      logo={
        <img
          src="/assets/collapsed-sidebar-matrice-logo.svg"
          alt="Matrice"
          style={{ width: 28, height: 28, objectFit: "contain" }}
        />
      }
      title="Matrice AI"
      subtitle="Support Platform"
      commandContent={<PlatformSwitcher />}
    />
  );
}

/* ----------------------------------------------`---------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

function ThemeProvider({
  theme = "light",
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

function ProfileCard({
  name,
  role,
  initials,
}: {
  name: string;
  role: string;
  initials: string;
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        height: 48,
        padding: "0 6px",
        background: "var(--sidebar-profile-bg)",
        border: "1px solid var(--sidebar-profile-border)",
        borderRadius: "var(--radius-md)",
        boxShadow: "var(--shadow-sm)",
        marginTop: 4,
      }}
    >
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: "var(--radius-sm)",
          background: "var(--sidebar-avatar-bg)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          fontWeight: 700,
          color: "var(--color-primary-foreground)",
          flexShrink: 0,
        }}
      >
        {initials}
      </span>
      <div className="sidebar-profile-info" style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: "var(--sidebar-text)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {name}
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 600,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            color: "var(--sidebar-profile-text-muted)",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
          }}
        >
          {role}
        </div>
      </div>
    </div>
  );
}

function DemoSidebar({
  defaultOpen = true,
  collapsible = true,
  showBadge = false,
}: {
  defaultOpen?: boolean;
  collapsible?: boolean;
  showBadge?: boolean;
}) {
  return (
    <Sidebar defaultOpen={defaultOpen} collapsible={collapsible}>
      <SidebarHeader>
        <MatriceLogo />
      </SidebarHeader>

      <SidebarContent>
        <SidebarNav>
          <SidebarNavItem href="/" icon={<LayoutDashboard size={16} />} active>
            Dashboard
          </SidebarNavItem>
          <SidebarNavItem
            href="/incidents"
            icon={<ShieldAlert size={16} />}
            badge={showBadge ? 3 : undefined}
          >
            Incidents Management
          </SidebarNavItem>
          <SidebarNavItem href="/metrics" icon={<LineChart size={16} />}>
            Metrics & Rules
          </SidebarNavItem>
          <SidebarNavItem href="/tracking" icon={<Gauge size={16} />}>
            Tracking & Analytics
          </SidebarNavItem>
          <SidebarNavItem href="/analytics" icon={<BarChart3 size={16} />}>
            Business Analytics
          </SidebarNavItem>
          <SidebarNavItem href="/facial" icon={<Camera size={16} />}>
            Facial Recognition
          </SidebarNavItem>
          <SidebarNavItem href="/plates" icon={<Car size={16} />}>
            License Plate Recog.
          </SidebarNavItem>
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
        <ProfileCard name="John Doe" role="Administrator" initials="JD" />
      </SidebarFooter>
    </Sidebar>
  );
}

function StoryLayout({
  children,
  theme = "light",
}: {
  children: React.ReactNode;
  theme?: "light" | "dark";
}) {
  return (
    <ThemeProvider theme={theme}>
      <div style={{ display: "flex", minHeight: "100vh" }}>
        {children}
        <div
          style={{
            flex: 1,
            marginLeft: "var(--sidebar-width-open)",
            padding: 24,
            color: "var(--text-primary)",
            transition: "margin-left 300ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          Main content area
        </div>
      </div>
    </ThemeProvider>
  );
}

/* -------------------------------------------------------------------------- */
/*  Meta                                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof Sidebar> = {
  title: "Components/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

/* -------------------------------------------------------------------------- */
/*  Stories                                                                    */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  render: () => (
    <StoryLayout>
      <DemoSidebar />
    </StoryLayout>
  ),
};

export const Collapsed: Story = {
  render: () => (
    <StoryLayout>
      <DemoSidebar defaultOpen={false} />
    </StoryLayout>
  ),
};

export const ActiveItem: Story = {
  render: () => (
    <StoryLayout>
      <Sidebar defaultOpen>
        <SidebarHeader>
          <MatriceLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavItem href="/" icon={<LayoutDashboard size={20} />}>
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem
              href="/incidents"
              icon={<ShieldAlert size={20} />}
              active
            >
              Incidents Management
            </SidebarNavItem>
            <SidebarNavItem href="/metrics" icon={<LineChart size={20} />}>
              Metrics & Rules
            </SidebarNavItem>
          </SidebarNav>
        </SidebarContent>
      </Sidebar>
    </StoryLayout>
  ),
};

export const WithBadge: Story = {
  render: () => (
    <StoryLayout>
      <DemoSidebar showBadge />
    </StoryLayout>
  ),
};

export const CustomFooter: Story = {
  render: () => (
    <StoryLayout>
      <Sidebar defaultOpen>
        <SidebarHeader>
          <MatriceLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavItem
              href="/"
              icon={<LayoutDashboard size={20} />}
              active
            >
              Dashboard
            </SidebarNavItem>
          </SidebarNav>
        </SidebarContent>
        <SidebarFooter>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: 8,
              color: "var(--sidebar-text)",
              fontSize: 12,
            }}
          >
            <User size={20} />
            <span className="sidebar-profile-info">Custom footer content</span>
          </div>
        </SidebarFooter>
      </Sidebar>
    </StoryLayout>
  ),
};

export const DarkTheme: Story = {
  render: () => (
    <StoryLayout theme="dark">
      <DemoSidebar />
    </StoryLayout>
  ),
};

export const MobileViewport: Story = {
  parameters: {
    viewport: { defaultViewport: "mobile1" },
  },
  render: () => (
    <StoryLayout>
      <DemoSidebar />
    </StoryLayout>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [open, setOpen] = React.useState(true);
    return (
      <StoryLayout>
        <Sidebar open={open} onOpenChange={setOpen}>
          <SidebarHeader>
            <MatriceLogo />
          </SidebarHeader>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem
                href="/"
                icon={<LayoutDashboard size={20} />}
                active
              >
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem href="/settings" icon={<Settings size={20} />}>
                Settings
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>
      </StoryLayout>
    );
  },
};

export const Grouped: Story = {
  render: () => (
    <StoryLayout>
      <Sidebar defaultOpen>
        <SidebarHeader>
          <MatriceLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavGroup label="Contents">
              <SidebarNavItem
                href="/dashboard"
                icon={<LayoutDashboard size={20} />}
                active
              >
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem
                href="/incidents"
                icon={<ShieldAlert size={20} />}
                badge={3}
              >
                Incidents
              </SidebarNavItem>
              <SidebarNavItem href="/metrics" icon={<LineChart size={20} />}>
                Metrics & Rules
              </SidebarNavItem>
            </SidebarNavGroup>
            <SidebarNavGroup label="Analytics">
              <SidebarNavItem href="/tracking" icon={<Gauge size={20} />}>
                Tracking
              </SidebarNavItem>
              <SidebarNavItem href="/analytics" icon={<BarChart3 size={20} />}>
                Business Analytics
              </SidebarNavItem>
            </SidebarNavGroup>
            <SidebarNavGroup label="Recognition">
              <SidebarNavItem href="/facial" icon={<Camera size={20} />}>
                Facial Recognition
              </SidebarNavItem>
              <SidebarNavItem href="/plates" icon={<Car size={20} />}>
                License Plate Recog.
              </SidebarNavItem>
            </SidebarNavGroup>
          </SidebarNav>
        </SidebarContent>
        <SidebarFooter>
          <ProfileCard name="John Doe" role="Administrator" initials="JD" />
        </SidebarFooter>
      </Sidebar>
    </StoryLayout>
  ),
};

export const GroupedCollapsed: Story = {
  render: () => (
    <StoryLayout>
      <Sidebar defaultOpen={false}>
        <SidebarHeader>
          <MatriceLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavGroup label="Contents">
              <SidebarNavItem
                href="/dashboard"
                icon={<LayoutDashboard size={20} />}
                active
              >
                Dashboard
              </SidebarNavItem>
              <SidebarNavItem href="/metrics" icon={<LineChart size={20} />}>
                Metrics & Rules
              </SidebarNavItem>
            </SidebarNavGroup>
            <SidebarNavGroup label="Settings">
              <SidebarNavItem href="/settings" icon={<Settings size={20} />}>
                Settings
              </SidebarNavItem>
            </SidebarNavGroup>
          </SidebarNav>
        </SidebarContent>
      </Sidebar>
    </StoryLayout>
  ),
};

export const HoverToOpen: Story = {
  render: () => (
    <StoryLayout>
      <Sidebar defaultOpen={false} onHoverOpen>
        <SidebarHeader>
          <MatriceLogo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavItem
              href="/"
              icon={<LayoutDashboard size={20} />}
              active
            >
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem href="/settings" icon={<Settings size={20} />}>
              Settings
            </SidebarNavItem>
            <SidebarNavItem href="/metrics" icon={<LineChart size={20} />}>
              Metrics & Rules
            </SidebarNavItem>
          </SidebarNav>
        </SidebarContent>
        <SidebarFooter>
          <ProfileCard name="John Doe" role="Administrator" initials="JD" />
        </SidebarFooter>
      </Sidebar>
    </StoryLayout>
  ),
};

/* -------------------------------------------------------------------------- */
/*  Platform Switcher via Command                                              */
/* -------------------------------------------------------------------------- */

export const WithPlatformSwitcher: Story = {
  name: "Platform Switcher (Command)",
  render: () => (
    <StoryLayout>
      <Sidebar defaultOpen>
        <SidebarHeader>
          <SidebarLogo
            logo={
              <img
                src="/assets/collapsed-sidebar-matrice-logo.svg"
                alt="Matrice"
                style={{ width: 28, height: 28, objectFit: "contain" }}
              />
            }
            title="Matrice Analytics"
            subtitle="Analytics Platform"
            commandContent={<PlatformSwitcher activePlatform="analytics" />}
          />
        </SidebarHeader>
        <SidebarContent>
          <SidebarNav>
            <SidebarNavItem
              href="/"
              icon={<LayoutDashboard size={20} />}
              active
            >
              Dashboard
            </SidebarNavItem>
            <SidebarNavItem href="/settings" icon={<Settings size={20} />}>
              Settings
            </SidebarNavItem>
          </SidebarNav>
        </SidebarContent>
        <SidebarFooter>
          <ProfileCard name="John Doe" role="Administrator" initials="JD" />
        </SidebarFooter>
      </Sidebar>
    </StoryLayout>
  ),
};
