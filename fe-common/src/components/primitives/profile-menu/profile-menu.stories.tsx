import { Bell, CreditCard, Moon, Settings, Sun, User } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ProfileMenu } from "./index";
import type { ProfileMenuItem } from "./index";

const meta: Meta<typeof ProfileMenu> = {
  title: "Primitives/ProfileMenu",
  component: ProfileMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ProfileMenu>;

const defaultUser = {
  name: "Mohammed Usman F",
  subtitle: "mohammed.usman@matrice.ai",
  initials: "MU",
};

const defaultItems: ProfileMenuItem[] = [
  {
    key: "profile",
    label: "Profile",
    icon: <User className="size-4" />,
    onSelect: () => console.log("profile"),
  },
  {
    key: "billing",
    label: "Billing",
    icon: <CreditCard className="size-4" />,
    onSelect: () => console.log("billing"),
  },
  {
    key: "notifications",
    label: "Notifications",
    icon: <Bell className="size-4" />,
    onSelect: () => console.log("notifications"),
  },
];

export const Default: Story = {
  render: () => (
    <div style={{ padding: 48, display: "flex", justifyContent: "flex-end" }}>
      <ProfileMenu
        user={defaultUser}
        items={defaultItems}
        showSignOut
        onSignOut={() => console.log("sign out")}
      />
    </div>
  ),
};

export const WithAvatar: Story = {
  render: () => (
    <div style={{ padding: 48, display: "flex", justifyContent: "flex-end" }}>
      <ProfileMenu
        user={{
          name: "John Doe",
          subtitle: "Administrator",
          avatarUrl: "https://github.com/shadcn.png",
          initials: "JD",
        }}
        items={defaultItems}
        showSignOut
        onSignOut={() => console.log("sign out")}
      />
    </div>
  ),
};

export const WithThemeToggle: Story = {
  name: "With Theme Toggle",
  render: function ThemeToggleDemo() {
    const [isDark, setIsDark] = React.useState(false);

    const items: ProfileMenuItem[] = [
      {
        key: "profile",
        label: "Profile",
        icon: <User className="size-4" />,
        onSelect: () => console.log("profile"),
      },
      {
        key: "settings",
        label: "Settings",
        icon: <Settings className="size-4" />,
        onSelect: () => console.log("settings"),
      },
      {
        key: "theme",
        label: isDark ? "Light Mode" : "Dark Mode",
        icon: isDark ? <Sun className="size-4" /> : <Moon className="size-4" />,
        onSelect: () => setIsDark((prev) => !prev),
      },
    ];

    return (
      <div style={{ padding: 48, display: "flex", justifyContent: "flex-end" }}>
        <ProfileMenu
          user={defaultUser}
          items={items}
          showSignOut
          onSignOut={() => console.log("sign out")}
        />
        <span
          style={{
            marginLeft: 16,
            alignSelf: "center",
            fontSize: 12,
            color: "#64748b",
          }}
        >
          Theme: {isDark ? "dark" : "light"}
        </span>
      </div>
    );
  },
};

export const MinimalNoItems: Story = {
  name: "Minimal (No Items)",
  render: () => (
    <div style={{ padding: 48, display: "flex", justifyContent: "flex-end" }}>
      <ProfileMenu user={{ name: "Jane Smith", initials: "JS" }} />
    </div>
  ),
};

export const SignOutOnly: Story = {
  name: "Sign Out Only",
  render: () => (
    <div style={{ padding: 48, display: "flex", justifyContent: "flex-end" }}>
      <ProfileMenu
        user={defaultUser}
        showSignOut
        onSignOut={() => console.log("sign out")}
      />
    </div>
  ),
};
