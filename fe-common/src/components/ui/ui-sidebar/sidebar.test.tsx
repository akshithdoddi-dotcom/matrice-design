import { describe, expect, it, vi } from "vitest";

import * as React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarNav,
  SidebarNavGroup,
  SidebarNavItem,
  useSidebar,
} from "./index";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

const HomeIcon = () => (
  <svg data-testid="icon-home">
    <rect />
  </svg>
);
const SettingsIcon = () => (
  <svg data-testid="icon-settings">
    <rect />
  </svg>
);

function renderSidebar(props: Record<string, unknown> = {}) {
  return render(
    <Sidebar defaultOpen {...props}>
      <SidebarHeader>
        <span>Logo</span>
      </SidebarHeader>
      <SidebarContent>
        <SidebarNav>
          <SidebarNavItem href="/" icon={<HomeIcon />} active>
            Home
          </SidebarNavItem>
          <SidebarNavItem href="/settings" icon={<SettingsIcon />}>
            Settings
          </SidebarNavItem>
        </SidebarNav>
      </SidebarContent>
      <SidebarFooter>
        <span>Footer</span>
      </SidebarFooter>
    </Sidebar>,
  );
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("Sidebar", () => {
  it("renders header, nav items, and footer", () => {
    renderSidebar();
    expect(screen.getByText("Logo")).toBeInTheDocument();
    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Settings")).toBeInTheDocument();
    expect(screen.getByText("Footer")).toBeInTheDocument();
  });

  it("renders as an aside element with navigation", () => {
    renderSidebar();
    expect(screen.getByRole("complementary")).toBeInTheDocument();
    expect(
      screen.getByRole("navigation", { name: "Main navigation" }),
    ).toBeInTheDocument();
  });

  describe("Toggle", () => {
    it("collapses when toggle button is clicked", async () => {
      const user = userEvent.setup();
      renderSidebar();
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveAttribute("data-open", "true");

      const toggleButton = screen.getByRole("button", {
        name: "Toggle sidebar",
      });
      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute("data-open", "false");
    });

    it("expands when toggle button is clicked while collapsed", async () => {
      const user = userEvent.setup();
      renderSidebar({ defaultOpen: false });
      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveAttribute("data-open", "false");

      const toggleButton = screen.getByRole("button", {
        name: "Toggle sidebar",
      });
      await user.click(toggleButton);
      expect(sidebar).toHaveAttribute("data-open", "true");
    });

    it("calls onOpenChange callback", async () => {
      const user = userEvent.setup();
      const onOpenChange = vi.fn();
      renderSidebar({ onOpenChange });

      const toggleButton = screen.getByRole("button", {
        name: "Toggle sidebar",
      });
      await user.click(toggleButton);
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it("has aria-expanded on toggle button", () => {
      renderSidebar();
      const toggleButton = screen.getByRole("button", {
        name: "Toggle sidebar",
      });
      expect(toggleButton).toHaveAttribute("aria-expanded", "true");
    });
  });

  describe("Active item", () => {
    it("applies aria-current=page to the active item", () => {
      renderSidebar();
      const homeLink = screen.getByRole("link", { name: /Home/ });
      expect(homeLink).toHaveAttribute("aria-current", "page");
    });

    it("does not set aria-current on inactive items", () => {
      renderSidebar();
      const settingsLink = screen.getByRole("link", { name: /Settings/ });
      expect(settingsLink).not.toHaveAttribute("aria-current");
    });

    it("applies data-active attribute to the active item", () => {
      renderSidebar();
      const homeLink = screen.getByRole("link", { name: /Home/ });
      expect(homeLink).toHaveAttribute("data-active", "true");
    });
  });

  describe("Badge", () => {
    it("renders a badge when provided", () => {
      render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem href="/alerts" icon={<HomeIcon />} badge={5}>
                Alerts
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByText("5")).toBeInTheDocument();
      expect(screen.getByLabelText("5 notifications")).toBeInTheDocument();
    });

    it("does not render a badge when not provided", () => {
      renderSidebar();
      expect(screen.queryByLabelText(/notifications/)).not.toBeInTheDocument();
    });
  });

  describe("Keyboard navigation", () => {
    it("ArrowDown moves focus to the next item", async () => {
      const user = userEvent.setup();
      renderSidebar();
      const homeLink = screen.getByRole("link", { name: /Home/ });
      const settingsLink = screen.getByRole("link", { name: /Settings/ });

      homeLink.focus();
      await user.keyboard("{ArrowDown}");
      expect(document.activeElement).toBe(settingsLink);
    });

    it("ArrowUp moves focus to the previous item", async () => {
      const user = userEvent.setup();
      renderSidebar();
      const homeLink = screen.getByRole("link", { name: /Home/ });
      const settingsLink = screen.getByRole("link", { name: /Settings/ });

      settingsLink.focus();
      await user.keyboard("{ArrowUp}");
      expect(document.activeElement).toBe(homeLink);
    });

    it("ArrowDown wraps around from last to first", async () => {
      const user = userEvent.setup();
      renderSidebar();
      const homeLink = screen.getByRole("link", { name: /Home/ });
      const settingsLink = screen.getByRole("link", { name: /Settings/ });

      settingsLink.focus();
      await user.keyboard("{ArrowDown}");
      expect(document.activeElement).toBe(homeLink);
    });

    it("Enter activates the focused item", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem icon={<HomeIcon />} onClick={onClick}>
                Click Me
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );

      const button = screen.getByRole("button", { name: /Click Me/ });
      button.focus();
      await user.keyboard("{Enter}");
      expect(onClick).toHaveBeenCalledTimes(1);
    });

    it("Escape moves focus to the sidebar container", async () => {
      const user = userEvent.setup();
      renderSidebar();
      const sidebar = screen.getByRole("complementary");
      const homeLink = screen.getByRole("link", { name: /Home/ });

      homeLink.focus();
      await user.keyboard("{Escape}");
      expect(document.activeElement).toBe(sidebar);
    });
  });

  describe("SidebarNavGroup", () => {
    it("renders group label and items", () => {
      render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavGroup label="Contents">
                <SidebarNavItem href="/" icon={<HomeIcon />}>
                  Home
                </SidebarNavItem>
              </SidebarNavGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByText("Contents")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
    });

    it("renders with role=group and aria-labelledby", () => {
      const { container } = render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavGroup label="Settings">
                <SidebarNavItem href="/settings" icon={<SettingsIcon />}>
                  Settings
                </SidebarNavItem>
              </SidebarNavGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      const group = container.querySelector("[role='group']");
      expect(group).toBeInTheDocument();
      expect(group).toHaveAttribute(
        "aria-labelledby",
        "sidebar-group-settings",
      );
    });

    it("hides group label when collapsed", () => {
      const { container } = render(
        <Sidebar defaultOpen={false}>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavGroup label="Contents">
                <SidebarNavItem href="/" icon={<HomeIcon />}>
                  Home
                </SidebarNavItem>
              </SidebarNavGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      const label = container.querySelector("[data-sidebar-nav-group-label]");
      expect(label).toHaveAttribute("aria-hidden", "true");
    });

    it("renders multiple groups with spacing", () => {
      const { container } = render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavGroup label="Contents">
                <SidebarNavItem href="/" icon={<HomeIcon />}>
                  Home
                </SidebarNavItem>
              </SidebarNavGroup>
              <SidebarNavGroup label="Settings">
                <SidebarNavItem href="/settings" icon={<SettingsIcon />}>
                  Settings
                </SidebarNavItem>
              </SidebarNavGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      const groups = container.querySelectorAll("[data-sidebar-nav-group]");
      expect(groups).toHaveLength(2);
    });

    it("keyboard navigation works across groups", async () => {
      const user = userEvent.setup();
      render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavGroup label="Group 1">
                <SidebarNavItem href="/" icon={<HomeIcon />}>
                  Home
                </SidebarNavItem>
              </SidebarNavGroup>
              <SidebarNavGroup label="Group 2">
                <SidebarNavItem href="/settings" icon={<SettingsIcon />}>
                  Settings
                </SidebarNavItem>
              </SidebarNavGroup>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      const homeLink = screen.getByRole("link", { name: /Home/ });
      const settingsLink = screen.getByRole("link", { name: /Settings/ });

      homeLink.focus();
      await user.keyboard("{ArrowDown}");
      expect(document.activeElement).toBe(settingsLink);
    });
  });

  describe("Collapsed tooltips", () => {
    it("renders tooltip spans when collapsed", () => {
      const { container } = render(
        <Sidebar defaultOpen={false}>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem href="/" icon={<HomeIcon />}>
                Home
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      const tooltip = container.querySelector("[role='tooltip']");
      expect(tooltip).toBeInTheDocument();
      expect(tooltip).toHaveTextContent("Home");
      expect(tooltip).toHaveAttribute("role", "tooltip");
    });

    it("does not render tooltip spans when expanded", () => {
      const { container } = render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem href="/" icon={<HomeIcon />}>
                Home
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      expect(
        container.querySelector("[role='tooltip']"),
      ).not.toBeInTheDocument();
    });
  });

  describe("useSidebar hook", () => {
    function HookConsumer() {
      const { open, collapsed, setOpen } = useSidebar();
      return (
        <div>
          <span data-testid="open">{String(open)}</span>
          <span data-testid="collapsed">{String(collapsed)}</span>
          <button type="button" onClick={() => setOpen(!open)}>
            hook-toggle
          </button>
        </div>
      );
    }

    it("exposes open, collapsed, and setOpen", () => {
      render(
        <Sidebar defaultOpen>
          <HookConsumer />
        </Sidebar>,
      );
      expect(screen.getByTestId("open")).toHaveTextContent("true");
      expect(screen.getByTestId("collapsed")).toHaveTextContent("false");
    });

    it("setOpen toggles the sidebar", async () => {
      const user = userEvent.setup();
      render(
        <Sidebar defaultOpen>
          <HookConsumer />
        </Sidebar>,
      );
      await user.click(screen.getByRole("button", { name: "hook-toggle" }));
      expect(screen.getByTestId("open")).toHaveTextContent("false");
      expect(screen.getByTestId("collapsed")).toHaveTextContent("true");
    });

    it("throws when used outside Sidebar", () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<HookConsumer />)).toThrow(
        "useSidebar must be used within a <Sidebar> provider.",
      );
      spy.mockRestore();
    });
  });

  describe("Custom as prop", () => {
    it("renders with a custom component", () => {
      const CustomLink = React.forwardRef<
        HTMLAnchorElement,
        React.AnchorHTMLAttributes<HTMLAnchorElement>
      >(({ children, ...props }, ref) => (
        <a ref={ref} data-testid="custom-link" {...props}>
          {children}
        </a>
      ));
      CustomLink.displayName = "CustomLink";

      render(
        <Sidebar defaultOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem
                as={CustomLink}
                href="/custom"
                icon={<HomeIcon />}
              >
                Custom
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );

      expect(screen.getByTestId("custom-link")).toBeInTheDocument();
      expect(screen.getByTestId("custom-link")).toHaveAttribute(
        "href",
        "/custom",
      );
    });
  });

  describe("Collapsible prop", () => {
    it("hides toggle button when collapsible=false", () => {
      render(
        <Sidebar defaultOpen collapsible={false}>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem href="/" icon={<HomeIcon />}>
                Home
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );
      expect(
        screen.queryByRole("button", { name: "Toggle sidebar" }),
      ).not.toBeInTheDocument();
    });
  });

  describe("onHoverOpen prop", () => {
    it("expands on mouse enter and collapses on mouse leave", async () => {
      const user = userEvent.setup();
      render(
        <Sidebar defaultOpen={false} onHoverOpen>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem href="/" icon={<HomeIcon />}>
                Home
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );

      const sidebar = screen.getByRole("complementary");
      expect(sidebar).toHaveAttribute("data-open", "false");

      await user.hover(sidebar);
      expect(sidebar).toHaveAttribute("data-open", "true");

      await user.unhover(sidebar);
      expect(sidebar).toHaveAttribute("data-open", "false");
    });

    it("does not expand on hover when onHoverOpen is false", async () => {
      const user = userEvent.setup();
      render(
        <Sidebar defaultOpen={false} onHoverOpen={false}>
          <SidebarContent>
            <SidebarNav>
              <SidebarNavItem href="/" icon={<HomeIcon />}>
                Home
              </SidebarNavItem>
            </SidebarNav>
          </SidebarContent>
        </Sidebar>,
      );

      const sidebar = screen.getByRole("complementary");
      await user.hover(sidebar);
      expect(sidebar).toHaveAttribute("data-open", "false");
    });
  });
});
