import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { NotificationMenu } from "./index";

// ─── Helpers ─────────────────────────────────────────────────────────────────

interface Item {
  id: string;
  text: string;
  read: boolean;
}

const sampleItems: Item[] = [
  { id: "1", text: "Alert 1", read: false },
  { id: "2", text: "Alert 2", read: true },
];

function renderItem(item: Item) {
  return <span>{item.text}</span>;
}

function renderMenu(
  overrides: Partial<React.ComponentProps<typeof NotificationMenu<Item>>> = {},
) {
  return render(
    <NotificationMenu<Item>
      items={sampleItems}
      getKey={(item) => item.id}
      renderItem={renderItem}
      badgeCount={2}
      {...overrides}
    />,
  );
}

// ─── Tests ───────────────────────────────────────────────────────────────────

describe("Primitives/NotificationMenu", () => {
  it("renders the trigger with bell icon", () => {
    renderMenu({ items: [], badgeCount: 0 });
    expect(
      screen.getByRole("button", { name: /notifications/i }),
    ).toBeInTheDocument();
  });

  it("shows badge count on trigger when badgeCount > 0", () => {
    renderMenu({ badgeCount: 5 });
    expect(screen.getByText("5")).toBeInTheDocument();
  });

  it("shows N+ when badgeCount exceeds badgeMax", () => {
    renderMenu({ badgeCount: 15, badgeMax: 9 });
    expect(screen.getByText("9+")).toBeInTheDocument();
  });

  it("does not show badge when badgeCount is 0", () => {
    renderMenu({ badgeCount: 0 });
    expect(screen.queryByText("0")).not.toBeInTheDocument();
  });

  it("renders header with default title", () => {
    renderMenu({ open: true });
    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("renders header with custom title", () => {
    renderMenu({ title: "Alerts", open: true });
    expect(screen.getByText("Alerts")).toBeInTheDocument();
  });

  it("renders header action slot", () => {
    renderMenu({
      headerAction: <button>Mark all read</button>,
      open: true,
    });
    expect(
      screen.getByRole("button", { name: "Mark all read" }),
    ).toBeInTheDocument();
  });

  it("renders notification items", () => {
    renderMenu({ open: true });
    expect(screen.getByText("Alert 1")).toBeInTheDocument();
    expect(screen.getByText("Alert 2")).toBeInTheDocument();
  });

  it("calls onItemClick when an item is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    renderMenu({ onItemClick: handleClick, open: true });
    await user.click(screen.getByText("Alert 1"));
    expect(handleClick).toHaveBeenCalledTimes(1);
    expect(handleClick).toHaveBeenCalledWith(sampleItems[0]);
  });

  it("renders empty state when no items", () => {
    renderMenu({ items: [], badgeCount: 0, open: true });
    expect(screen.getByText("No notifications")).toBeInTheDocument();
  });

  it("renders custom empty state text", () => {
    renderMenu({
      items: [],
      badgeCount: 0,
      emptyState: {
        title: "All caught up!",
        description: "No new alerts.",
      },
      open: true,
    });
    expect(screen.getByText("All caught up!")).toBeInTheDocument();
    expect(screen.getByText("No new alerts.")).toBeInTheDocument();
  });

  it("renders footer slot", () => {
    renderMenu({
      footer: <button>View all</button>,
      open: true,
    });
    expect(
      screen.getByRole("button", { name: "View all" }),
    ).toBeInTheDocument();
  });

  it("renders custom trigger instead of default bell", () => {
    renderMenu({
      customTrigger: <button>Custom Bell</button>,
    });
    expect(
      screen.getByRole("button", { name: "Custom Bell" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: /notifications/i }),
    ).not.toBeInTheDocument();
  });

  it("applies data-slot attributes on key sections", () => {
    const { container } = renderMenu({
      footer: <span>footer</span>,
      open: true,
    });
    // notification-menu is in the container
    expect(
      container.querySelector("[data-slot='notification-menu']"),
    ).toBeInTheDocument();
    // Other slots are in a Portal, so query document.body
    expect(
      document.body.querySelector("[data-slot='notification-menu-header']"),
    ).toBeInTheDocument();
    expect(
      document.body.querySelector("[data-slot='notification-menu-list']"),
    ).toBeInTheDocument();
    expect(
      document.body.querySelector("[data-slot='notification-menu-footer']"),
    ).toBeInTheDocument();
  });

  it("applies unread styling when isUnread returns true", () => {
    renderMenu({
      isUnread: (item) => !item.read,
      open: true,
    });
    const unreadItem = screen
      .getByText("Alert 1")
      .closest("[data-slot='notification-menu-item']");
    expect(unreadItem).toHaveClass("bg-primary/5");

    const readItem = screen
      .getByText("Alert 2")
      .closest("[data-slot='notification-menu-item']");
    expect(readItem).not.toHaveClass("bg-primary/5");
  });
});
