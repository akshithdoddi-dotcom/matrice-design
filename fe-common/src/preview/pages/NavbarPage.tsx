import { useState } from "react";
import { Navbar, NavbarActionStatus } from "../../components/ui/navbar";
import { ProfileMenu } from "../../components/ui/profile-menu";
import { NotificationMenu } from "../../components/ui/notification-menu";

export function NavbarPage() {
  const [actionStatus, setActionStatus] = useState<NavbarActionStatus>(NavbarActionStatus.Idle);
  const [project, setProject] = useState("Project Alpha");
  const [env, setEnv] = useState("production");

  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Navbar</h1>
        <p className="text-sm text-(--text-secondary)">
          Top navigation bar with breadcrumbs, action button, search, clock, and right-side slots.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Basic</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden">
          <Navbar breadcrumbRoot="Projects" />
        </div>
      </section>

      {/* With breadcrumb dropdowns */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Breadcrumb Dropdowns</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden">
          <Navbar
            breadcrumbRoot="Projects"
            breadcrumbDropdowns={[
              {
                value: project,
                options: [
                  { value: "Project Alpha", label: "Project Alpha" },
                  { value: "Project Beta",  label: "Project Beta"  },
                  { value: "Project Gamma", label: "Project Gamma" },
                ],
                onChange: setProject,
              },
              {
                value: env,
                options: [
                  { value: "production",  label: "Production"  },
                  { value: "staging",     label: "Staging"     },
                  { value: "development", label: "Development" },
                ],
                onChange: setEnv,
                statusDot: true,
                statusColor: "var(--success-main)",
              },
            ]}
          />
        </div>
        <p className="text-xs text-(--text-muted)">Selected: {project} / {env}</p>
      </section>

      {/* With action button */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Action Button</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden">
          <Navbar
            breadcrumbRoot="Training"
            breadcrumbDropdowns={[
              { value: "ResNet-50 Fine-Tune", options: [
                { value: "ResNet-50 Fine-Tune", label: "ResNet-50 Fine-Tune" },
                { value: "ViT-B Training",     label: "ViT-B Training"     },
              ], onChange: () => {} }
            ]}
            actionStatus={actionStatus}
            onActionClick={(current) => {
              setActionStatus(
                current === NavbarActionStatus.Running
                  ? NavbarActionStatus.Idle
                  : NavbarActionStatus.Running,
              );
            }}
            showClock
            onSearch={() => {}}
          />
        </div>
        <p className="text-xs text-(--text-muted)">Status: {actionStatus}</p>
      </section>

      {/* With right-side slots */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Profile & Notification Menus</h2>
        <div className="border border-(--border-color) rounded-xl overflow-hidden">
          <Navbar
            breadcrumbRoot="Analytics"
            onSearch={() => {}}
            notificationSlot={
              <NotificationMenu
                items={[
                  { id: "1", title: "Model deployed",      time: "2m ago",  read: false },
                  { id: "2", title: "Training completed",  time: "1h ago",  read: false },
                  { id: "3", title: "Dataset uploaded",    time: "3h ago",  read: true  },
                ]}
                getKey={(n) => n.id}
                renderItem={(n) => (
                  <div className="flex flex-col gap-0.5 px-3 py-2.5">
                    <p className={`text-sm ${n.read ? "text-(--text-secondary)" : "text-(--text-primary) font-medium"}`}>
                      {n.title}
                    </p>
                    <p className="text-xs text-(--text-muted)">{n.time}</p>
                  </div>
                )}
                badgeCount={2}
              />
            }
            avatar={
              <ProfileMenu
                user={{ name: "Mohammed Usman", subtitle: "Admin", initials: "MU" }}
                items={[
                  { key: "profile", label: "Profile", onClick: () => {} },
                  { key: "settings", label: "Settings", onClick: () => {} },
                ]}
                showSignOut
                onSignOut={() => {}}
              />
            }
          />
        </div>
      </section>
    </div>
  );
}
