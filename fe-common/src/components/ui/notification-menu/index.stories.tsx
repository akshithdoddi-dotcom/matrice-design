import { AlertTriangle, Bell, CheckCircle, Info, XCircle } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { NotificationMenu } from "./index";

/* -------------------------------------------------------------------------- */
/*  Theme CSS variables                                                       */
/* -------------------------------------------------------------------------- */

const themeVars = `
:root {
  --primary-main: #00775b;
  --primary-hover: #004e3d;
  --primary-light: #00956d;
  --bg-surface: #ffffff;
  --bg-elevated: #ffffff;
  --bg-hover: #e2e8f0;
  --bg-header: #021D18;
  --sidebar-text: #FAFAFA;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
  --text-disabled: #94a3b8;
  --border-color: #e2e8f0;
  --duration-fast: 200ms;
  --duration-normal: 300ms;
  --ease-snappy: cubic-bezier(0.22, 1, 0.36, 1);
  --radius-sm: 4px;
  --radius-md: 6px;
  --spacing: 0.25rem;
}
`;

function ThemeProvider({
  bg = "dark",
  children,
}: {
  bg?: "light" | "dark";
  children: React.ReactNode;
}) {
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: themeVars }} />
      <div
        style={{
          background: bg === "dark" ? "#021D18" : "#f1f5f9",
          minHeight: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 48,
          fontFamily: '"Inter", sans-serif',
        }}
      >
        {children}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sample data                                                               */
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
  critical: <XCircle size={16} className="text-destructive shrink-0" />,
  error: <AlertTriangle size={16} className="text-destructive shrink-0" />,
  warning: <AlertTriangle size={16} className="text-warning shrink-0" />,
  info: <Info size={16} className="text-brand shrink-0" />,
};

const sampleItems: SampleNotification[] = [
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
  {
    id: "4",
    title: "SSL certificate expiring",
    description: "Certificate for api.example.com expires in 7 days.",
    service: "Security",
    level: "error",
    read: false,
    createdAt: "3 hours ago",
  },
  {
    id: "5",
    title: "Backup completed",
    description: "Nightly database backup completed successfully.",
    service: "Database",
    level: "info",
    read: true,
    createdAt: "6 hours ago",
  },
];

/* -------------------------------------------------------------------------- */
/*  Shared render function                                                    */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/*  Meta                                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof NotificationMenu> = {
  title: "Components/NotificationMenu",
  component: NotificationMenu,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
};

export default meta;
type Story = StoryObj<typeof NotificationMenu>;

/* -------------------------------------------------------------------------- */
/*  Stories                                                                    */
/* -------------------------------------------------------------------------- */

export const Default: Story = {
  name: "Default (with items)",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={sampleItems}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        onItemClick={(item) => console.log("Clicked:", item.id)}
        badgeCount={3}
      />
    </ThemeProvider>
  ),
};

export const Empty: Story = {
  name: "Empty State",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={[]}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        badgeCount={0}
      />
    </ThemeProvider>
  ),
};

export const CustomTitle: Story = {
  name: "Custom Title",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={sampleItems.slice(0, 2)}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        onItemClick={(item) => console.log("Clicked:", item.id)}
        badgeCount={2}
        title="Alerts"
      />
    </ThemeProvider>
  ),
};

export const WithFooter: Story = {
  name: "With Footer",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={sampleItems}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        onItemClick={(item) => console.log("Clicked:", item.id)}
        badgeCount={3}
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
    </ThemeProvider>
  ),
};

export const NoBadge: Story = {
  name: "No Badge (all read)",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={sampleItems.filter((i) => i.read)}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        onItemClick={(item) => console.log("Clicked:", item.id)}
      />
    </ThemeProvider>
  ),
};

export const HighBadgeCount: Story = {
  name: "High Badge Count (9+)",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={sampleItems}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        badgeCount={42}
      />
    </ThemeProvider>
  ),
};

export const CustomEmptyState: Story = {
  name: "Custom Empty State",
  render: () => (
    <ThemeProvider>
      <NotificationMenu<SampleNotification>
        items={[]}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        emptyState={{
          title: "You're all caught up!",
          description: "No new alerts at the moment.",
          icon: <CheckCircle size={28} className="text-brand" />,
        }}
      />
    </ThemeProvider>
  ),
};

export const OnLightBackground: Story = {
  name: "On Light Background (custom trigger)",
  render: () => (
    <ThemeProvider bg="light">
      <NotificationMenu<SampleNotification>
        items={sampleItems.slice(0, 3)}
        getKey={(item) => item.id}
        renderItem={renderNotification}
        onItemClick={(item) => console.log("Clicked:", item.id)}
        badgeCount={2}
        customTrigger={
          <button
            type="button"
            className="relative inline-flex items-center justify-center size-9 rounded-full border border-border bg-surface cursor-pointer hover:bg-hover transition-colors"
          >
            <Bell size={18} className="text-foreground" />
            <span className="absolute -top-1 -right-1 min-w-[16px] h-4 flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold px-1">
              2
            </span>
          </button>
        }
      />
    </ThemeProvider>
  ),
};
