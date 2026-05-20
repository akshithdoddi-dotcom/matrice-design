import type { ReactNode } from "react";
import { useState } from "react";
import { CheckCircle2, AlertCircle, Info } from "lucide-react";
import { NotificationMenu } from "../../components/ui/notification-menu";

interface Notif {
  id: string;
  title: string;
  description: string;
  time: string;
  read: boolean;
  type: "success" | "error" | "info";
}

const MOCK_NOTIFS: Notif[] = [
  { id: "1", title: "Model deployed",        description: "ResNet-50 is live in production.",     time: "2m ago",  read: false, type: "success" },
  { id: "2", title: "Training failed",        description: "ViT-B run #31 terminated with OOM.",   time: "18m ago", read: false, type: "error"   },
  { id: "3", title: "Dataset uploaded",       description: "COCO 2024 (8.2 GB) is ready.",         time: "1h ago",  read: false, type: "info"    },
  { id: "4", title: "Job queued",             description: "BERT-tiny NLP training is queued.",    time: "3h ago",  read: true,  type: "info"    },
  { id: "5", title: "GPU alert resolved",     description: "GPU-3 is back online.",                 time: "5h ago",  read: true,  type: "success" },
];

const TYPE_ICON: Record<Notif["type"], ReactNode> = {
  success: <CheckCircle2 className="size-4 text-(--success-main)" />,
  error:   <AlertCircle   className="size-4 text-(--error-main)"   />,
  info:    <Info          className="size-4 text-(--info-main)"    />,
};

export function NotificationMenuPage() {
  const [items, setItems] = useState(MOCK_NOTIFS);
  const unread = items.filter((n) => !n.read).length;

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Notification Menu</h1>
        <p className="text-sm text-(--text-secondary)">
          Bell-icon trigger with badge count and a scrollable notifications popover.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Notifications</h2>
        <NotificationMenu
          items={items}
          getKey={(n) => n.id}
          badgeCount={unread}
          renderItem={(n) => (
            <div
              className={`flex gap-3 px-3 py-2.5 transition-colors hover:bg-(--primary-subtle) cursor-pointer ${n.read ? "opacity-70" : ""}`}
              onClick={() => setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
            >
              <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type]}</div>
              <div className="flex flex-col gap-0.5 min-w-0">
                <p className={`text-sm leading-snug ${n.read ? "text-(--text-secondary)" : "text-(--text-primary) font-medium"}`}>
                  {n.title}
                </p>
                <p className="text-xs text-(--text-muted) truncate">{n.description}</p>
                <p className="text-xs text-(--text-muted)">{n.time}</p>
              </div>
              {!n.read && <div className="size-2 rounded-full bg-(--primary-main) mt-1 ml-auto shrink-0" />}
            </div>
          )}
          onItemClick={(n) => setItems((prev) => prev.map((x) => x.id === n.id ? { ...x, read: true } : x))}
          title="Notifications"
          footer={
            <div className="px-3 py-2 border-t border-(--border-color)">
              <button
                className="text-xs text-(--primary-main) font-medium hover:underline"
                onClick={() => setItems((prev) => prev.map((n) => ({ ...n, read: true })))}
              >
                Mark all as read
              </button>
            </div>
          }
        />
        <p className="text-xs text-(--text-muted)">Click items to mark as read. Unread: {unread}</p>
      </section>

      {/* Empty */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Empty State</h2>
        <NotificationMenu
          items={[]}
          getKey={(n: Notif) => n.id}
          renderItem={() => null}
          badgeCount={0}
          emptyState={{
            title: "All caught up!",
            description: "No new notifications.",
          }}
        />
      </section>
    </div>
  );
}
