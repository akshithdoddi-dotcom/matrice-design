import { Settings, User, CreditCard, HelpCircle } from "lucide-react";
import { ProfileMenu } from "../../components/ui/profile-menu";

export function ProfileMenuPage() {
  return (
    <div className="p-8 space-y-10">
      <div>
        <h1 className="text-2xl font-bold text-(--text-primary) mb-1">Profile Menu</h1>
        <p className="text-sm text-(--text-secondary)">
          Avatar trigger with user card and dropdown menu items.
        </p>
      </div>

      {/* Basic */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Basic</h2>
        <div className="flex gap-6">
          <ProfileMenu
            user={{ name: "Mohammed Usman", subtitle: "Admin", initials: "MU" }}
            items={[
              { key: "profile",  label: "Profile",  icon: <User className="size-4" />,        onClick: () => {} },
              { key: "settings", label: "Settings", icon: <Settings className="size-4" />,    onClick: () => {} },
              { key: "billing",  label: "Billing",  icon: <CreditCard className="size-4" />,  onClick: () => {}, separatorBefore: true },
              { key: "help",     label: "Help",     icon: <HelpCircle className="size-4" />,  onClick: () => {} },
            ]}
            showSignOut
            onSignOut={() => {}}
          />
        </div>
      </section>

      {/* With avatar image */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">With Avatar Image</h2>
        <ProfileMenu
          user={{
            name: "Jane Cooper",
            subtitle: "jane.cooper@matrice.ai",
            avatarUrl: "https://i.pravatar.cc/150?img=47",
            initials: "JC",
          }}
          items={[
            { key: "profile",  label: "My Profile", icon: <User className="size-4" />,     onClick: () => {} },
            { key: "settings", label: "Settings",   icon: <Settings className="size-4" />, onClick: () => {} },
          ]}
          showSignOut
          onSignOut={() => {}}
        />
      </section>

      {/* Minimal — initials only, no menu items */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Minimal</h2>
        <ProfileMenu
          user={{ name: "Alex Rivera", initials: "AR" }}
          showSignOut
          onSignOut={() => {}}
        />
      </section>

      {/* Placement */}
      <section className="space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-(--text-secondary)">Side Placement</h2>
        <div className="flex gap-6">
          {(["bottom", "top", "right", "left"] as const).map((side) => (
            <div key={side} className="flex flex-col items-center gap-2">
              <ProfileMenu
                user={{ name: "Demo User", initials: "DU" }}
                side={side}
                items={[{ key: "a", label: "Item A", onClick: () => {} }]}
              />
              <span className="text-xs text-(--text-muted)">{side}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
