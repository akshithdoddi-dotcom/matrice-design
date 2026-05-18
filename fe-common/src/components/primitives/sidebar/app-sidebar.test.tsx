import { Bell, HelpCircle, Home, Settings, Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { AppSidebar } from "./app-sidebar";
import type { SidebarMenuGroupConfig, SidebarMenuItemConfig } from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Fixtures
// ─────────────────────────────────────────────────────────────────────────────

const flatItems: SidebarMenuItemConfig[] = [
  {
    key: "home",
    label: "Home",
    icon: <Home data-testid="icon-home" />,
    href: "/",
    isActive: true,
  },
  {
    key: "users",
    label: "Users",
    icon: <Users data-testid="icon-users" />,
    href: "/users",
  },
  {
    key: "settings",
    label: "Settings",
    icon: <Settings data-testid="icon-settings" />,
    href: "/settings",
  },
];

const groupedItems: SidebarMenuGroupConfig[] = [
  {
    key: "main",
    label: "Main",
    items: [
      { key: "home", label: "Home", icon: <Home />, isActive: true },
      { key: "users", label: "Users", icon: <Users /> },
    ],
  },
  {
    key: "admin",
    label: "Admin",
    items: [{ key: "settings", label: "Settings", icon: <Settings /> }],
  },
];

const footerItems: SidebarMenuItemConfig[] = [
  { key: "help", label: "Help", icon: <HelpCircle /> },
];

const itemsWithChildren: SidebarMenuItemConfig[] = [
  {
    key: "settings",
    label: "Settings",
    icon: <Settings />,
    children: [
      { key: "general", label: "General", href: "/settings/general" },
      { key: "security", label: "Security", href: "/settings/security" },
    ],
  },
];

const itemsWithBadge: SidebarMenuItemConfig[] = [
  { key: "inbox", label: "Inbox", icon: <Bell />, badge: 5, href: "/inbox" },
  {
    key: "alerts",
    label: "Alerts",
    icon: <Bell />,
    badge: "New",
    href: "/alerts",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Tests
// ─────────────────────────────────────────────────────────────────────────────

describe("AppSidebar", () => {
  // ── Rendering ──────────────────────────────────────────────────────────

  describe("rendering", () => {
    it("renders all flat menu items", () => {
      render(<AppSidebar menuItems={flatItems} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders grouped menu items with labels", () => {
      render(<AppSidebar menuItems={groupedItems} />);
      expect(screen.getByText("Main")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });

    it("renders footer items", () => {
      render(<AppSidebar menuItems={flatItems} footerItems={footerItems} />);
      expect(screen.getByText("Help")).toBeInTheDocument();
    });

    it("renders sub-menu children", () => {
      render(<AppSidebar menuItems={itemsWithChildren} />);
      expect(screen.getByText("General")).toBeInTheDocument();
      expect(screen.getByText("Security")).toBeInTheDocument();
    });

    it("renders badges on menu items", () => {
      render(<AppSidebar menuItems={itemsWithBadge} />);
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("marks active item correctly", () => {
      render(<AppSidebar menuItems={flatItems} />);
      const homeButton = screen
        .getByText("Home")
        .closest('[data-slot="sidebar-menu-button"]');
      expect(homeButton).toHaveAttribute("data-active", "true");
    });

    it("renders activeIcon when item is active", () => {
      const items: SidebarMenuItemConfig[] = [
        {
          key: "home",
          label: "Home",
          icon: <Home data-testid="icon-default" />,
          activeIcon: <Home data-testid="icon-active" />,
          isActive: true,
        },
      ];
      render(<AppSidebar menuItems={items} />);
      expect(screen.getByTestId("icon-active")).toBeInTheDocument();
      expect(screen.queryByTestId("icon-default")).not.toBeInTheDocument();
    });
  });

  // ── Default header ─────────────────────────────────────────────────────

  describe("default header", () => {
    it("renders the default Matrice brand header", () => {
      render(
        <AppSidebar
          menuItems={flatItems}
          activePlatform="support"
          subtitle="Support Platform"
        />,
      );
      expect(screen.getByText("Matrice AI")).toBeInTheDocument();
      expect(screen.getByText("Support Platform")).toBeInTheDocument();
    });

    it("renders custom title", () => {
      render(
        <AppSidebar
          menuItems={flatItems}
          title="Custom Title"
          subtitle="Custom Sub"
        />,
      );
      expect(screen.getByText("Custom Title")).toBeInTheDocument();
      expect(screen.getByText("Custom Sub")).toBeInTheDocument();
    });
  });

  // ── Custom header override ─────────────────────────────────────────────

  describe("custom header", () => {
    it("renders custom header instead of brand header", () => {
      render(
        <AppSidebar
          menuItems={flatItems}
          header={<div data-testid="custom-header">My Header</div>}
        />,
      );
      expect(screen.getByTestId("custom-header")).toBeInTheDocument();
      expect(screen.queryByText("Matrice AI")).not.toBeInTheDocument();
    });
  });

  // ── Custom footer ──────────────────────────────────────────────────────

  describe("custom footer", () => {
    it("renders customFooter below footer items", () => {
      render(
        <AppSidebar
          menuItems={flatItems}
          footerItems={footerItems}
          customFooter={<div data-testid="custom-footer">Profile</div>}
        />,
      );
      expect(screen.getByText("Help")).toBeInTheDocument();
      expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    });

    it("renders customFooter even without footerItems", () => {
      render(
        <AppSidebar
          menuItems={flatItems}
          customFooter={<div data-testid="custom-footer">Version 1.0</div>}
        />,
      );
      expect(screen.getByTestId("custom-footer")).toBeInTheDocument();
    });

    it("does not render footer when neither footerItems nor customFooter provided", () => {
      const { container } = render(<AppSidebar menuItems={flatItems} />);
      expect(
        container.querySelector('[data-slot="sidebar-footer"]'),
      ).not.toBeInTheDocument();
    });
  });

  // ── Loading state ──────────────────────────────────────────────────────

  describe("loading state", () => {
    it("renders skeleton items when loading", () => {
      const { container } = render(
        <AppSidebar menuItems={flatItems} loading loadingCount={3} />,
      );
      const skeletons = container.querySelectorAll(
        '[data-slot="sidebar-menu-skeleton"]',
      );
      expect(skeletons.length).toBe(3);
      expect(screen.queryByText("Home")).not.toBeInTheDocument();
    });

    it("defaults to 5 skeleton items", () => {
      const { container } = render(
        <AppSidebar menuItems={flatItems} loading />,
      );
      const skeletons = container.querySelectorAll(
        '[data-slot="sidebar-menu-skeleton"]',
      );
      expect(skeletons.length).toBe(5);
    });
  });

  // ── Layout props ───────────────────────────────────────────────────────

  describe("layout", () => {
    it("renders with floating variant", () => {
      const { container } = render(
        <AppSidebar menuItems={flatItems} variant="floating" />,
      );
      expect(
        container.querySelector('[data-variant="floating"]'),
      ).toBeInTheDocument();
    });

    it("renders on the right side", () => {
      const { container } = render(
        <AppSidebar menuItems={flatItems} side="right" />,
      );
      expect(
        container.querySelector('[data-side="right"]'),
      ).toBeInTheDocument();
    });

    it("renders the rail when showRail is true", () => {
      const { container } = render(
        <AppSidebar menuItems={flatItems} showRail />,
      );
      expect(
        container.querySelector('[data-sidebar="rail"]'),
      ).toBeInTheDocument();
    });

    it("does not render the rail by default", () => {
      const { container } = render(<AppSidebar menuItems={flatItems} />);
      expect(
        container.querySelector('[data-sidebar="rail"]'),
      ).not.toBeInTheDocument();
    });
  });

  // ── Click handlers ─────────────────────────────────────────────────────

  describe("interactions", () => {
    it("calls onClick when a non-href item is clicked", async () => {
      const user = userEvent.setup();
      const handleClick = vi.fn();
      const items: SidebarMenuItemConfig[] = [
        { key: "action", label: "Action", onClick: handleClick },
      ];

      render(<AppSidebar menuItems={items} />);
      await user.click(screen.getByText("Action"));
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it("renders href items as anchor elements", () => {
      render(<AppSidebar menuItems={flatItems} />);
      const homeLink = screen.getByText("Home").closest("a");
      expect(homeLink).toHaveAttribute("href", "/");
    });

    it("renders disabled items with disabled attribute", () => {
      const items: SidebarMenuItemConfig[] = [
        { key: "disabled", label: "Disabled", disabled: true },
      ];
      render(<AppSidebar menuItems={items} />);
      const button = screen
        .getByText("Disabled")
        .closest('[data-slot="sidebar-menu-button"]');
      expect(button).toBeDisabled();
    });
  });

  // ── Controlled state ───────────────────────────────────────────────────

  describe("controlled state", () => {
    it("accepts open and onOpenChange props", () => {
      const handleChange = vi.fn();
      render(
        <AppSidebar
          menuItems={flatItems}
          open={true}
          onOpenChange={handleChange}
        />,
      );
      const wrapper = document.querySelector('[data-slot="sidebar-wrapper"]');
      expect(wrapper).toBeInTheDocument();
    });
  });

  // ── Mixed items (flat + grouped) ───────────────────────────────────────

  describe("mixed menu items", () => {
    it("renders a mix of flat items and groups", () => {
      const mixed: (SidebarMenuItemConfig | SidebarMenuGroupConfig)[] = [
        { key: "home", label: "Home", icon: <Home /> },
        {
          key: "admin",
          label: "Admin",
          items: [{ key: "settings", label: "Settings", icon: <Settings /> }],
        },
      ];

      render(<AppSidebar menuItems={mixed} />);
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Admin")).toBeInTheDocument();
      expect(screen.getByText("Settings")).toBeInTheDocument();
    });
  });
});
