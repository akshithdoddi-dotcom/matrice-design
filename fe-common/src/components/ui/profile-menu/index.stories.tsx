import { Bell, CreditCard, HelpCircle, Settings, User } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { ProfileMenu } from "./index";
import type { ProfileMenuItem } from "./index";

/* -------------------------------------------------------------------------- */
/*  Theme CSS variables (shared across stories)                               */
/* -------------------------------------------------------------------------- */

const themeVars = `
:root {
  --primary-main: #00775b;
  --primary-hover: #004e3d;
  --primary-light: #00956d;
  --bg-surface: #ffffff;
  --bg-elevated: #ffffff;
  --bg-hover: #e2e8f0;
  --bg-sidebar: #021D18;
  --sidebar-text: #FAFAFA;
  --sidebar-border: rgba(255, 255, 255, 0.1);
  --sidebar-avatar-bg: #00503D;
  --sidebar-profile-bg: rgba(255, 255, 255, 0.05);
  --sidebar-profile-hover-bg: rgba(255, 255, 255, 0.1);
  --sidebar-profile-text-muted: rgba(255, 255, 255, 0.7);
  --sidebar-profile-border: rgba(255, 255, 255, 0.1);
  --text-primary: #0f172a;
  --text-secondary: #475569;
  --text-muted: #64748b;
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
  bg = "light",
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
/*  Shared data                                                               */
/* -------------------------------------------------------------------------- */

const defaultUser = {
  name: "John Doe",
  subtitle: "Administrator",
  initials: "JD",
};

const menuItems: ProfileMenuItem[] = [
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
  {
    key: "settings",
    label: "Settings",
    icon: <Settings size={14} />,
    onClick: () => console.log("settings"),
  },
  {
    key: "help",
    label: "Help & Support",
    icon: <HelpCircle size={14} />,
    onClick: () => console.log("help"),
    separatorBefore: true,
  },
];

/* -------------------------------------------------------------------------- */
/*  Meta                                                                      */
/* -------------------------------------------------------------------------- */

const meta: Meta<typeof ProfileMenu> = {
  title: "Components/ProfileMenu",
  component: ProfileMenu,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
};

export default meta;
type Story = StoryObj<typeof ProfileMenu>;

/* -------------------------------------------------------------------------- */
/*  Stories                                                                    */
/* -------------------------------------------------------------------------- */

export const AvatarTrigger: Story = {
  name: "Avatar Trigger (Default)",
  render: () => (
    <ThemeProvider>
      <ProfileMenu
        user={defaultUser}
        items={menuItems}
        showSignOut
        onSignOut={() => console.log("sign out")}
      />
    </ThemeProvider>
  ),
};

export const ExpandedTrigger: Story = {
  name: "Expanded Trigger (Sidebar Style)",
  render: () => (
    <ThemeProvider bg="dark">
      <div style={{ width: 204 }}>
        <ProfileMenu
          user={defaultUser}
          items={menuItems}
          showSignOut
          onSignOut={() => console.log("sign out")}
          variant="expanded"
          side="top"
          align="start"
        />
      </div>
    </ThemeProvider>
  ),
};

export const SignOutOnly: Story = {
  name: "Sign Out Only",
  render: () => (
    <ThemeProvider>
      <ProfileMenu
        user={{
          name: "Jane Smith",
          subtitle: "jane@example.com",
          initials: "JS",
        }}
        showSignOut
        onSignOut={() => console.log("sign out")}
      />
    </ThemeProvider>
  ),
};

export const NoMenuItems: Story = {
  name: "No Menu Items",
  render: () => (
    <ThemeProvider>
      <ProfileMenu user={defaultUser} />
    </ThemeProvider>
  ),
};

export const WithDisabledItem: Story = {
  name: "With Disabled Item",
  render: () => (
    <ThemeProvider>
      <ProfileMenu
        user={defaultUser}
        items={[
          ...menuItems.slice(0, 2),
          {
            key: "disabled-item",
            label: "Premium Feature",
            icon: <Settings size={14} />,
            disabled: true,
          },
        ]}
        showSignOut
        onSignOut={() => console.log("sign out")}
      />
    </ThemeProvider>
  ),
};
