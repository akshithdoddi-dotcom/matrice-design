import {
  AlertTriangle,
  Bell,
  Check,
  CheckCircle,
  Info,
  XCircle,
} from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { NotificationMenu } from "./index";

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

const levelConfig: Record<
  SampleNotification["level"],
  { icon: React.ReactNode; dotClass: string }
> = {
  critical: {
    icon: <XCircle size={16} className="text-destructive shrink-0" />,
    dotClass: "bg-destructive",
  },
  error: {
    icon: <AlertTriangle size={16} className="text-destructive shrink-0" />,
    dotClass: "bg-destructive",
  },
  warning: {
    icon: <AlertTriangle size={16} className="text-orange-500 shrink-0" />,
    dotClass: "bg-orange-500",
  },
  info: {
    icon: <Info size={16} className="text-blue-500 shrink-0" />,
    dotClass: "bg-blue-500",
  },
};

const sampleItems: SampleNotification[] = [
  {
    id: "1",
    title: "Critical: Fire Detection false positive spike",
    description:
      "ISS-1023 — False positive rate increased by 23% on Qatar_Demo.",
    service: "Monitoring",
    level: "critical",
    read: false,
    createdAt: "30 min ago",
  },
  {
    id: "2",
    title: "New issue assigned to you",
    description: "ISS-1024 — Camera feed dropping on Car_Park_30.",
    service: "Issues",
    level: "error",
    read: false,
    createdAt: "2 hours ago",
  },
  {
    id: "3",
    title: "Firmware v3.2.1 available",
    description: "New gateway firmware ready for download.",
    service: "Deployments",
    level: "info",
    read: false,
    createdAt: "5 hours ago",
  },
  {
    id: "4",
    title: "Compute node H100 memory usage high",
    description: "RAM at 92% on H100-Lan-default. Consider restarting.",
    service: "Monitoring",
    level: "warning",
    read: true,
    createdAt: "1 day ago",
  },
  {
    id: "5",
    title: "Batch deployment completed",
    description: "Fire Detection pipeline deployed to 5 cameras.",
    service: "Deployments",
    level: "info",
    read: true,
    createdAt: "2 days ago",
  },
];

/* -------------------------------------------------------------------------- */
/*  Shared render function                                                    */
/* -------------------------------------------------------------------------- */

function renderNotification(item: SampleNotification) {
  const config = levelConfig[item.level];
  return (
    <>
      <div
        className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${config.dotClass}`}
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <span
            className={`text-sm truncate ${!item.read ? "font-medium" : "text-muted-foreground"}`}
          >
            {item.title}
          </span>
          {!item.read && (
            <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2 m-0">
          {item.description}
        </p>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[11px] text-muted-foreground/70">
            {item.createdAt}
          </span>
          <span className="text-[10px] text-muted-foreground uppercase tracking-wide">
            {item.service}
          </span>
        </div>
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Interactive demos                                                         */
/* -------------------------------------------------------------------------- */

function DefaultDemo() {
  const [notifications, setNotifications] =
    React.useState<SampleNotification[]>(sampleItems);
  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAsRead = (item: SampleNotification) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationMenu<SampleNotification>
      items={notifications}
      getKey={(item) => item.id}
      renderItem={renderNotification}
      onItemClick={markAsRead}
      isUnread={(item) => !item.read}
      badgeCount={unreadCount}
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
        <button
          type="button"
          className="text-xs text-primary hover:underline w-full text-center block cursor-pointer border-none bg-transparent"
        >
          View all activity
        </button>
      }
    />
  );
}

function EmptyDemo() {
  return (
    <NotificationMenu<SampleNotification>
      items={[]}
      getKey={(item) => item.id}
      renderItem={renderNotification}
      emptyState={{
        title: "You're all caught up!",
        description: "No new alerts at the moment.",
        icon: <CheckCircle size={28} className="text-primary" />,
      }}
    />
  );
}

function CustomTriggerDemo() {
  return (
    <NotificationMenu<SampleNotification>
      items={sampleItems.slice(0, 3)}
      getKey={(item) => item.id}
      renderItem={renderNotification}
      onItemClick={(item) => console.log("Clicked:", item.id)}
      isUnread={(item) => !item.read}
      badgeCount={3}
      title="Alerts"
      customTrigger={
        <button
          type="button"
          className="relative inline-flex items-center justify-center size-9 rounded-full border border-border bg-surface cursor-pointer hover:bg-hover transition-colors"
        >
          <Bell size={18} className="text-foreground" />
          <span className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center rounded-full bg-destructive text-white text-[10px] font-bold px-1">
            3
          </span>
        </button>
      }
    />
  );
}

function HighBadgeDemo() {
  return (
    <NotificationMenu<SampleNotification>
      items={sampleItems}
      getKey={(item) => item.id}
      renderItem={renderNotification}
      isUnread={(item) => !item.read}
      badgeCount={42}
      badgeMax={9}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  Meta                                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof NotificationMenu> = {
  title: "Primitives/NotificationMenu",
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
  name: "Default (interactive)",
  render: () => <DefaultDemo />,
};

export const Empty: Story = {
  name: "Empty State",
  render: () => <EmptyDemo />,
};

export const CustomTrigger: Story = {
  name: "Custom Trigger",
  render: () => <CustomTriggerDemo />,
};

export const HighBadgeCount: Story = {
  name: "High Badge Count (9+)",
  render: () => <HighBadgeDemo />,
};

export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{
          background: "var(--bg-body)",
          padding: 48,
          borderRadius: "var(--radius-xl)",
          minWidth: 200,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
  render: () => <DefaultDemo />,
};
