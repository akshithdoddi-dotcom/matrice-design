import { Settings } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  ProfileMenu,
  type ProfileMenuItem,
  type ProfileMenuUser,
} from "./index";

const testUser: ProfileMenuUser = {
  name: "John Doe",
  subtitle: "Admin",
  avatarUrl: "https://example.com/avatar.jpg",
  initials: "JD",
};

const testItems: ProfileMenuItem[] = [
  { key: "settings", label: "Settings", icon: <Settings size={14} /> },
  { key: "help", label: "Help" },
];

describe("ProfileMenu", () => {
  // -------------------------------------------------------------------------
  // Rendering - Avatar variant (default)
  // -------------------------------------------------------------------------
  it("renders avatar trigger by default", () => {
    render(<ProfileMenu user={testUser} />);
    const trigger = screen.getByRole("button", {
      name: /profile menu for john doe/i,
    });
    expect(trigger).toBeInTheDocument();
  });

  it("renders avatar with initials when no avatarUrl", () => {
    const userWithoutAvatar = { ...testUser, avatarUrl: undefined };
    render(<ProfileMenu user={userWithoutAvatar} />);
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("generates initials from name when initials not provided", () => {
    const userWithoutInitials = { name: "Jane Smith", subtitle: "User" };
    render(<ProfileMenu user={userWithoutInitials} />);
    expect(screen.getByText("JA")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Rendering - Expanded variant
  // -------------------------------------------------------------------------
  it("renders expanded trigger with name and subtitle", () => {
    render(<ProfileMenu user={testUser} variant="expanded" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });

  it("renders expanded trigger without subtitle when not provided", () => {
    const userWithoutSubtitle = { name: "John Doe" };
    render(<ProfileMenu user={userWithoutSubtitle} variant="expanded" />);
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.queryByText("Admin")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Custom trigger
  // -------------------------------------------------------------------------
  it("renders custom trigger when provided", () => {
    render(
      <ProfileMenu
        user={testUser}
        customTrigger={<button data-testid="custom-trigger">Custom</button>}
      />,
    );
    expect(screen.getByTestId("custom-trigger")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Popover interactions
  // -------------------------------------------------------------------------
  it("opens popover when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={testUser} items={testItems} />);

    await user.click(screen.getByRole("button"));

    // User info card in popover should be visible
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Help")).toBeInTheDocument();
  });

  it("calls item onClick when clicked", async () => {
    const user = userEvent.setup();
    const handleSettingsClick = vi.fn();
    const items = [
      { key: "settings", label: "Settings", onClick: handleSettingsClick },
    ];
    render(<ProfileMenu user={testUser} items={items} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Settings"));

    expect(handleSettingsClick).toHaveBeenCalled();
  });

  it("closes popover after item click", async () => {
    const user = userEvent.setup();
    const items = [{ key: "settings", label: "Settings", onClick: vi.fn() }];
    render(<ProfileMenu user={testUser} items={items} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Settings"));

    // Popover should close
    expect(screen.queryByRole("separator")).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Sign out
  // -------------------------------------------------------------------------
  it("shows sign out item when showSignOut is true", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={testUser} showSignOut />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByText("Sign out")).toBeInTheDocument();
  });

  it("calls onSignOut when sign out is clicked", async () => {
    const user = userEvent.setup();
    const handleSignOut = vi.fn();
    render(
      <ProfileMenu user={testUser} showSignOut onSignOut={handleSignOut} />,
    );

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Sign out"));

    expect(handleSignOut).toHaveBeenCalled();
  });

  it("shows separator before sign out when there are other items", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={testUser} items={testItems} showSignOut />);

    await user.click(screen.getByRole("button"));

    // Should have sign out with separator - check by finding the separator divs
    const separatorDivs = document.querySelectorAll('[role="separator"]');
    expect(separatorDivs.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Controlled state
  // -------------------------------------------------------------------------
  it("supports controlled open state", async () => {
    const handleOpenChange = vi.fn();
    const { rerender } = render(
      <ProfileMenu
        user={testUser}
        items={testItems}
        open={false}
        onOpenChange={handleOpenChange}
      />,
    );

    // Should not show menu items when closed
    expect(screen.queryByText("Settings")).not.toBeInTheDocument();

    // Open it via prop
    rerender(
      <ProfileMenu
        user={testUser}
        items={testItems}
        open={true}
        onOpenChange={handleOpenChange}
      />,
    );

    // Menu items should be visible
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Disabled items
  // -------------------------------------------------------------------------
  it("renders disabled items", async () => {
    const user = userEvent.setup();
    const items = [{ key: "disabled", label: "Disabled Item", disabled: true }];
    render(<ProfileMenu user={testUser} items={items} />);

    await user.click(screen.getByRole("button"));
    const disabledButton = screen.getByText("Disabled Item").closest("button");
    expect(disabledButton).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // Item with separator
  // -------------------------------------------------------------------------
  it("renders separator before item when separatorBefore is true", async () => {
    const user = userEvent.setup();
    const items = [
      { key: "first", label: "First" },
      { key: "second", label: "Second", separatorBefore: true },
    ];
    render(<ProfileMenu user={testUser} items={items} />);

    await user.click(screen.getByRole("button"));

    // Check that both items are rendered
    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("Second")).toBeInTheDocument();
    // Check separator divs exist
    const separatorDivs = document.querySelectorAll('[role="separator"]');
    expect(separatorDivs.length).toBeGreaterThan(0);
  });

  // -------------------------------------------------------------------------
  // Empty items
  // -------------------------------------------------------------------------
  it("renders without items", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={testUser} />);

    await user.click(screen.getByRole("button"));
    // User info card should show in popover
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Admin")).toBeInTheDocument();
  });
});
