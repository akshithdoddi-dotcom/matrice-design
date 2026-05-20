import { useState } from "react";
import { Home, BarChart3, Users, Settings, HelpCircle, FileText, Bell, LogOut } from "lucide-react";
import { AppSidebar } from "../../components/primitives/sidebar";
import type { SidebarMenuItemConfig } from "../../components/primitives/sidebar";

const MENU_ITEMS: SidebarMenuItemConfig[] = [
  { key: "home",       label: "Home",       icon: <Home className="size-4" />,      href: "#", isActive: true },
  { key: "analytics",  label: "Analytics",  icon: <BarChart3 className="size-4" />, href: "#" },
  { key: "users",      label: "Users",      icon: <Users className="size-4" />,     href: "#" },
  { key: "reports",    label: "Reports",    icon: <FileText className="size-4" />,  href: "#", badge: 3 },
  { key: "settings",   label: "Settings",   icon: <Settings className="size-4" />,  href: "#" },
];

const FOOTER_ITEMS: SidebarMenuItemConfig[] = [
  { key: "help",    label: "Help & Support", icon: <HelpCircle className="size-4" />, href: "#" },
  { key: "signout", label: "Sign Out",        icon: <LogOut className="size-4" />,    onClick: () => {} },
];

export function SidebarPage() {
  const [collapsible, setCollapsible] = useState<"offcanvas" | "icon" | "none">("offcanvas");

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Sidebar / AppSidebar</h1>
        <p className="text-sm text-(--text-secondary)">
          Production-ready sidebar with platform switcher, nav items, badges, and collapsible modes.
        </p>
      </div>

      {/* Collapsible mode switcher */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Collapsible Mode</h2>
        <div className="flex gap-2">
          {(["offcanvas", "icon", "none"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setCollapsible(mode)}
              className={`px-3 py-1.5 rounded text-sm font-medium border transition-colors ${
                collapsible === mode
                  ? "bg-(--primary-main) text-white border-(--primary-main)"
                  : "border-(--border-color) text-(--text-secondary) hover:border-(--primary-main)"
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </section>

      {/* Live demo */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Live Demo</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden h-[480px] flex">
          <AppSidebar
            activePlatform="analytics"
            subtitle="Analytics Platform"
            menuItems={MENU_ITEMS}
            footerItems={FOOTER_ITEMS}
            collapsible={collapsible}
            showRail={collapsible === "icon"}
          >
            {/* Main content area */}
            <div className="flex-1 flex items-center justify-center bg-(--surface) text-(--text-secondary) text-sm">
              Main content area
            </div>
          </AppSidebar>
        </div>
      </section>

      {/* With sub-items */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Sub-Items</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden h-[400px] flex">
          <AppSidebar
            title="Matrice AI"
            subtitle="Support Platform"
            activePlatform="support"
            collapsible="none"
            menuItems={[
              {
                key: "tickets",
                label: "Tickets",
                icon: <FileText className="size-4" />,
                isActive: true,
                children: [
                  { key: "open",   label: "Open",   href: "#", isActive: true },
                  { key: "closed", label: "Closed", href: "#" },
                ],
              },
              { key: "users",     label: "Users",     icon: <Users className="size-4" />,     href: "#" },
              { key: "notifs",    label: "Notifications", icon: <Bell className="size-4" />, href: "#", badge: 12 },
              { key: "settings",  label: "Settings",  icon: <Settings className="size-4" />,  href: "#" },
            ]}
          >
            <div className="flex-1 flex items-center justify-center bg-(--surface) text-(--text-secondary) text-sm">
              Content
            </div>
          </AppSidebar>
        </div>
      </section>

      {/* Loading state */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Loading State</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden h-[300px] flex">
          <AppSidebar
            collapsible="none"
            menuItems={[]}
            loading
            loadingCount={6}
          >
            <div className="flex-1 flex items-center justify-center bg-(--surface) text-(--text-secondary) text-sm">
              Content
            </div>
          </AppSidebar>
        </div>
      </section>
    </div>
  );
}
