import {
  BarChart3,
  Bell,
  FileText,
  FolderOpen,
  HelpCircle,
  Home,
  Inbox,
  Layers,
  LogOut,
  Settings,
  Users,
} from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react";

import { AppSidebar } from "./app-sidebar";
import { SidebarInset, SidebarTrigger } from "./sidebar";
import type { SidebarMenuGroupConfig, SidebarMenuItemConfig } from "./types";

const meta: Meta<typeof AppSidebar> = {
  title: "Primitives/AppSidebar",
  component: AppSidebar,
  tags: ["autodocs"],
  parameters: {
    layout: "fullscreen",
  },
  decorators: [
    (Story) => (
      <div style={{ height: "100vh", display: "flex" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof AppSidebar>;

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const mainItems: SidebarMenuItemConfig[] = [
  {
    key: "home",
    label: "Home",
    icon: <Home className="size-4" />,
    href: "/",
    isActive: true,
  },
  {
    key: "inbox",
    label: "Inbox",
    icon: <Inbox className="size-4" />,
    href: "/inbox",
    badge: 3,
  },
  {
    key: "users",
    label: "Users",
    icon: <Users className="size-4" />,
    href: "/users",
  },
  {
    key: "analytics",
    label: "Analytics",
    icon: <BarChart3 className="size-4" />,
    href: "/analytics",
  },
];

const groupedNav: SidebarMenuGroupConfig[] = [
  {
    key: "platform",
    label: "Platform",
    items: [
      {
        key: "home",
        label: "Home",
        icon: <Home className="size-4" />,
        href: "/",
        isActive: true,
      },
      {
        key: "inbox",
        label: "Inbox",
        icon: <Inbox className="size-4" />,
        href: "/inbox",
        badge: 12,
      },
      {
        key: "users",
        label: "Users",
        icon: <Users className="size-4" />,
        href: "/users",
      },
      {
        key: "analytics",
        label: "Analytics",
        icon: <BarChart3 className="size-4" />,
        href: "/analytics",
      },
    ],
  },
  {
    key: "workspace",
    label: "Workspace",
    items: [
      {
        key: "projects",
        label: "Projects",
        icon: <FolderOpen className="size-4" />,
        href: "/projects",
      },
      {
        key: "documents",
        label: "Documents",
        icon: <FileText className="size-4" />,
        href: "/documents",
      },
      {
        key: "integrations",
        label: "Integrations",
        icon: <Layers className="size-4" />,
        href: "/integrations",
      },
    ],
  },
];

const footerNav: SidebarMenuItemConfig[] = [
  {
    key: "help",
    label: "Help",
    icon: <HelpCircle className="size-4" />,
    href: "/help",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings className="size-4" />,
    href: "/settings",
  },
];

const itemsWithSubMenus: SidebarMenuItemConfig[] = [
  {
    key: "home",
    label: "Dashboard",
    icon: <Home className="size-4" />,
    isActive: true,
    href: "/",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings className="size-4" />,
    children: [
      {
        key: "general",
        label: "General",
        href: "/settings/general",
        isActive: true,
      },
      { key: "security", label: "Security", href: "/settings/security" },
      {
        key: "notifications",
        label: "Notifications",
        href: "/settings/notifications",
      },
    ],
  },
  {
    key: "users",
    label: "Users",
    icon: <Users className="size-4" />,
    children: [
      { key: "all", label: "All Users", href: "/users" },
      { key: "roles", label: "Roles", href: "/users/roles" },
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Content wrapper — rendered as children of AppSidebar so it's inside the
// SidebarProvider and can use SidebarTrigger / SidebarInset.
// ─────────────────────────────────────────────────────────────────────────────

function PageContent({ description }: { description: string }) {
  return (
    <SidebarInset>
      <header className="flex items-center gap-2 p-4 border-b border-border">
        <SidebarTrigger />
        <span className="text-sm text-muted-foreground">{description}</span>
      </header>
      <main className="p-6">
        <p className="text-muted-foreground">{description}</p>
      </main>
    </SidebarInset>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Stories
// ─────────────────────────────────────────────────────────────────────────────

/** Default Matrice-branded sidebar with flat nav items. */
export const Default: Story = {
  render: () => (
    <AppSidebar
      activePlatform="support"
      subtitle="Support Platform"
      menuItems={mainItems}
      footerItems={footerNav}
    >
      <PageContent description="Default sidebar with Matrice brand header and flat navigation." />
    </AppSidebar>
  ),
};

/** Grouped navigation items with section headings. */
export const GroupedNavigation: Story = {
  render: () => (
    <AppSidebar
      activePlatform="analytics"
      subtitle="Analytics Dashboard"
      menuItems={groupedNav}
      footerItems={footerNav}
    >
      <PageContent description="Sidebar with grouped navigation sections." />
    </AppSidebar>
  ),
};

/** Sub-menu support for nested navigation. */
export const WithSubMenus: Story = {
  render: () => (
    <AppSidebar
      activePlatform="support"
      subtitle="Support Platform"
      menuItems={itemsWithSubMenus}
      footerItems={footerNav}
    >
      <PageContent description="Sidebar with nested sub-menus under Settings and Users." />
    </AppSidebar>
  ),
};

/** Collapsible icon mode — collapses to icon-only rail. */
export const IconMode: Story = {
  render: () => (
    <AppSidebar
      activePlatform="vms"
      subtitle="Video Management"
      menuItems={mainItems}
      footerItems={footerNav}
      collapsible="icon"
      defaultOpen={false}
    >
      <PageContent description="Icon-collapsed sidebar. Click trigger or press Cmd+B to expand." />
    </AppSidebar>
  ),
};

/** Floating variant with rounded corners and shadow. */
export const Floating: Story = {
  render: () => (
    <AppSidebar
      activePlatform="analytics"
      subtitle="Analytics"
      menuItems={mainItems}
      variant="floating"
    >
      <PageContent description="Floating sidebar variant." />
    </AppSidebar>
  ),
};

/** Right-side sidebar. */
export const RightSide: Story = {
  render: () => (
    <AppSidebar
      activePlatform="internal"
      subtitle="Internal Tools"
      menuItems={mainItems}
      side="right"
    >
      <PageContent description="Right-side sidebar." />
    </AppSidebar>
  ),
};

/** With a rail (drag handle) for toggling. */
export const WithRail: Story = {
  render: () => (
    <AppSidebar
      activePlatform="support"
      subtitle="Support"
      menuItems={mainItems}
      showRail
    >
      <PageContent description="Drag the rail on the sidebar edge to toggle." />
    </AppSidebar>
  ),
};

/** Loading skeleton state. */
export const Loading: Story = {
  render: () => (
    <AppSidebar menuItems={[]} loading loadingCount={6}>
      <PageContent description="Sidebar in loading state showing skeletons." />
    </AppSidebar>
  ),
};

/** Custom header override — completely replaces the brand header. */
export const CustomHeader: Story = {
  render: () => (
    <AppSidebar
      menuItems={mainItems}
      footerItems={footerNav}
      header={
        <div className="flex items-center gap-3 px-2 py-3">
          <div className="size-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            AC
          </div>
          <div className="grid text-sm leading-tight">
            <span className="font-semibold">Acme Corp</span>
            <span className="text-xs text-muted-foreground">Enterprise</span>
          </div>
        </div>
      }
    >
      <PageContent description="Sidebar with a fully custom header replacing the Matrice brand." />
    </AppSidebar>
  ),
};

/** Custom footer below the footer nav items. */
export const WithCustomFooter: Story = {
  render: () => (
    <AppSidebar
      activePlatform="support"
      subtitle="Support Platform"
      menuItems={mainItems}
      footerItems={footerNav}
      customFooter={
        <div className="flex items-center gap-3 border-t border-border px-3 py-3">
          <div className="size-8 rounded-full bg-muted flex items-center justify-center">
            <Users className="size-4" />
          </div>
          <div className="grid text-sm leading-tight flex-1 min-w-0">
            <span className="font-medium truncate">John Doe</span>
            <span className="text-xs text-muted-foreground truncate">
              john@matrice.ai
            </span>
          </div>
          <button
            type="button"
            className="shrink-0 text-muted-foreground hover:text-foreground"
          >
            <LogOut className="size-4" />
          </button>
        </div>
      }
    >
      <PageContent description="Sidebar with custom footer showing a profile card." />
    </AppSidebar>
  ),
};

/** Custom title and subtitle overriding defaults. */
export const CustomBranding: Story = {
  render: () => (
    <AppSidebar
      title="My App"
      subtitle="Dashboard v2"
      menuItems={mainItems}
      footerItems={footerNav}
    >
      <PageContent description="Sidebar with custom title and subtitle (no platform highlight)." />
    </AppSidebar>
  ),
};

/** Badges on multiple items (numeric and text). */
export const WithBadges: Story = {
  render: () => {
    const badgedItems: SidebarMenuItemConfig[] = [
      {
        key: "inbox",
        label: "Inbox",
        icon: <Inbox className="size-4" />,
        badge: 42,
        href: "/inbox",
      },
      {
        key: "alerts",
        label: "Alerts",
        icon: <Bell className="size-4" />,
        badge: "New",
        href: "/alerts",
      },
      {
        key: "home",
        label: "Home",
        icon: <Home className="size-4" />,
        href: "/",
        isActive: true,
      },
    ];

    return (
      <AppSidebar
        activePlatform="support"
        subtitle="Support"
        menuItems={badgedItems}
      >
        <PageContent description="Sidebar items with numeric and text badges." />
      </AppSidebar>
    );
  },
};
