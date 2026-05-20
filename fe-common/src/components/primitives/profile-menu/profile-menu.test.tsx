import { User } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ProfileMenu } from "./index";
import type { ProfileMenuItem } from "./index";

const testUser = {
  name: "John Doe",
  subtitle: "john@example.com",
  initials: "JD",
};

const testItems: ProfileMenuItem[] = [
  { key: "profile", label: "Profile", icon: <User className="size-4" /> },
  { key: "settings", label: "Settings" },
];

describe("Primitives/ProfileMenu", () => {
  it("renders the trigger with avatar", () => {
    render(<ProfileMenu user={testUser} />);
    expect(
      screen.getByRole("button", { name: /profile menu for john doe/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("JD")).toBeInTheDocument();
  });

  it("shows user info and items when opened", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={testUser} items={testItems} />);
    await user.click(
      screen.getByRole("button", { name: /profile menu for john doe/i }),
    );
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("john@example.com")).toBeInTheDocument();
    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
  });

  it("fires onSelect when an item is clicked", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    const items: ProfileMenuItem[] = [
      { key: "action", label: "Do Something", onSelect: handler },
    ];
    render(<ProfileMenu user={testUser} items={items} />);
    await user.click(
      screen.getByRole("button", { name: /profile menu for john doe/i }),
    );
    await user.click(await screen.findByText("Do Something"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("renders sign out item when showSignOut is true", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<ProfileMenu user={testUser} showSignOut onSignOut={handler} />);
    await user.click(
      screen.getByRole("button", { name: /profile menu for john doe/i }),
    );
    expect(await screen.findByText("Sign out")).toBeInTheDocument();
  });

  it("fires onSignOut when sign out is clicked", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(<ProfileMenu user={testUser} showSignOut onSignOut={handler} />);
    await user.click(
      screen.getByRole("button", { name: /profile menu for john doe/i }),
    );
    await user.click(await screen.findByText("Sign out"));
    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("uses first two characters of name when initials not provided", () => {
    render(<ProfileMenu user={{ name: "Alice Bob" }} />);
    expect(screen.getByText("AL")).toBeInTheDocument();
  });

  it("renders custom trigger when provided", () => {
    render(
      <ProfileMenu
        user={testUser}
        customTrigger={<button data-testid="custom">Custom</button>}
      />,
    );
    expect(screen.getByTestId("custom")).toBeInTheDocument();
  });

  it("does not render items section when no items and no signOut", async () => {
    const user = userEvent.setup();
    render(<ProfileMenu user={testUser} />);
    await user.click(
      screen.getByRole("button", { name: /profile menu for john doe/i }),
    );
    // Should show user info but no menu items
    expect(await screen.findByText("John Doe")).toBeInTheDocument();
    expect(
      document.querySelector("[data-slot='dropdown-menu-separator']"),
    ).not.toBeInTheDocument();
  });
});
