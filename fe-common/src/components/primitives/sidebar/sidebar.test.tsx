import { Home, Users } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarProvider,
  SidebarSeparator,
  SidebarTrigger,
  useSidebar,
} from "./sidebar";

// Helper to render sidebar with required provider
function renderSidebar(ui: React.ReactNode, providerProps = {}) {
  return render(<SidebarProvider {...providerProps}>{ui}</SidebarProvider>);
}

describe("Primitives/Sidebar", () => {
  describe("SidebarProvider", () => {
    it("renders children inside the wrapper", () => {
      render(
        <SidebarProvider>
          <div data-testid="child">Content</div>
        </SidebarProvider>,
      );
      expect(screen.getByTestId("child")).toBeInTheDocument();
    });

    it("sets data-slot on the wrapper", () => {
      const { container } = render(
        <SidebarProvider>
          <div>Content</div>
        </SidebarProvider>,
      );
      expect(
        container.querySelector('[data-slot="sidebar-wrapper"]'),
      ).toBeInTheDocument();
    });

    it("sets CSS custom properties for sidebar width", () => {
      const { container } = render(
        <SidebarProvider>
          <div>Content</div>
        </SidebarProvider>,
      );
      const wrapper = container.querySelector(
        '[data-slot="sidebar-wrapper"]',
      ) as HTMLElement;
      expect(wrapper.style.getPropertyValue("--sidebar-width")).toBe("14rem");
      expect(wrapper.style.getPropertyValue("--sidebar-width-icon")).toBe(
        "3rem",
      );
    });
  });

  describe("Sidebar", () => {
    it("renders sidebar content", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <div data-testid="nav">Nav items</div>
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByTestId("nav")).toBeInTheDocument();
    });

    it("renders header and footer sections", () => {
      renderSidebar(
        <Sidebar>
          <SidebarHeader>
            <span>Header</span>
          </SidebarHeader>
          <SidebarContent>Main</SidebarContent>
          <SidebarFooter>
            <span>Footer</span>
          </SidebarFooter>
        </Sidebar>,
      );
      expect(screen.getByText("Header")).toBeInTheDocument();
      expect(screen.getByText("Footer")).toBeInTheDocument();
    });

    it("renders with collapsible=none as static sidebar", () => {
      renderSidebar(
        <Sidebar collapsible="none">
          <SidebarContent>Static</SidebarContent>
        </Sidebar>,
      );
      const sidebar = screen
        .getByText("Static")
        .closest('[data-slot="sidebar"]');
      expect(sidebar).toBeInTheDocument();
    });
  });

  describe("SidebarTrigger", () => {
    it("renders a toggle button", () => {
      renderSidebar(
        <>
          <SidebarTrigger />
          <Sidebar>
            <SidebarContent>Content</SidebarContent>
          </Sidebar>
        </>,
      );
      expect(
        screen.getByRole("button", { name: "Toggle Sidebar" }),
      ).toBeInTheDocument();
    });
  });

  describe("SidebarMenu", () => {
    it("renders menu items with icons and labels", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupLabel>Navigation</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Home />
                      <span>Home</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <Users />
                      <span>Users</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByText("Navigation")).toBeInTheDocument();
      expect(screen.getByText("Home")).toBeInTheDocument();
      expect(screen.getByText("Users")).toBeInTheDocument();
    });

    it("marks active menu button with data-active", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton isActive>
                      <span>Active Item</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>,
      );
      const button = screen
        .getByText("Active Item")
        .closest('[data-slot="sidebar-menu-button"]');
      expect(button).toHaveAttribute("data-active", "true");
    });
  });

  describe("SidebarSeparator", () => {
    it("renders a separator element", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <SidebarSeparator data-testid="sep" />
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByTestId("sep")).toBeInTheDocument();
    });
  });

  describe("SidebarMenuBadge", () => {
    it("renders badge content", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton>
                      <span>Inbox</span>
                    </SidebarMenuButton>
                    <SidebarMenuBadge>5</SidebarMenuBadge>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByText("5")).toBeInTheDocument();
    });
  });

  describe("SidebarMenuSkeleton", () => {
    it("renders skeleton loading state", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <SidebarMenuSkeleton data-testid="skel" />
          </SidebarContent>
        </Sidebar>,
      );
      expect(screen.getByTestId("skel")).toBeInTheDocument();
    });

    it("renders icon skeleton when showIcon is true", () => {
      renderSidebar(
        <Sidebar>
          <SidebarContent>
            <SidebarMenuSkeleton showIcon data-testid="skel-icon" />
          </SidebarContent>
        </Sidebar>,
      );
      const container = screen.getByTestId("skel-icon");
      expect(
        container.querySelector('[data-sidebar="menu-skeleton-icon"]'),
      ).toBeInTheDocument();
    });
  });

  describe("useSidebar", () => {
    it("throws when used outside SidebarProvider", () => {
      const ErrorComponent = () => {
        useSidebar();
        return null;
      };

      // Suppress console.error for this test
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      expect(() => render(<ErrorComponent />)).toThrow(
        "useSidebar must be used within a SidebarProvider.",
      );
      spy.mockRestore();
    });
  });
});
