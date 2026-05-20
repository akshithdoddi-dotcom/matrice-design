import { BarChart3, Monitor } from "lucide-react";
import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { PlatformSwitcher } from "./index";
import type { Platform } from "./index";

const platforms: Platform[] = [
  {
    value: "vms",
    label: "Matrice VMS",
    icon: <Monitor className="size-4" />,
    shortcut: "1",
  },
  {
    value: "analytics",
    label: "Matrice Analytics",
    icon: <BarChart3 className="size-4" />,
    shortcut: "2",
  },
];

describe("Primitives/PlatformSwitcher", () => {
  it("renders the title and subtitle", () => {
    render(
      <PlatformSwitcher
        platforms={platforms}
        title="Matrice.ai"
        subtitle="Support"
      />,
    );
    expect(screen.getByText("Matrice.ai")).toBeInTheDocument();
    expect(screen.getByText("Support")).toBeInTheDocument();
  });

  it("opens dropdown on click and shows platforms", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSwitcher
        platforms={platforms}
        activePlatform="vms"
        title="Matrice.ai"
      />,
    );
    await user.click(screen.getByText("Matrice.ai"));
    expect(await screen.findByText("Matrice VMS")).toBeInTheDocument();
    expect(screen.getByText("Matrice Analytics")).toBeInTheDocument();
  });

  it("calls onPlatformChange when a platform is selected", async () => {
    const user = userEvent.setup();
    const handler = vi.fn();
    render(
      <PlatformSwitcher
        platforms={platforms}
        activePlatform="vms"
        onPlatformChange={handler}
        title="Matrice.ai"
      />,
    );
    await user.click(screen.getByText("Matrice.ai"));
    await user.click(await screen.findByText("Matrice Analytics"));
    expect(handler).toHaveBeenCalledWith("analytics");
  });

  it("shows check icon for active platform", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSwitcher
        platforms={platforms}
        activePlatform="vms"
        title="Matrice.ai"
      />,
    );
    await user.click(screen.getByText("Matrice.ai"));
    await screen.findByText("Matrice VMS");
    // The active item's parent should contain a check icon
    const vmsItem = screen
      .getByText("Matrice VMS")
      .closest("[data-slot='dropdown-menu-item']");
    expect(vmsItem?.querySelector("svg")).toBeInTheDocument();
  });

  it("renders custom logo when provided", () => {
    render(
      <PlatformSwitcher
        platforms={platforms}
        title="Acme"
        logo={<div data-testid="custom-logo">Logo</div>}
      />,
    );
    expect(screen.getByTestId("custom-logo")).toBeInTheDocument();
  });

  it("renders fallback initial when no logo provided", () => {
    render(<PlatformSwitcher platforms={platforms} title="Matrice.ai" />);
    expect(screen.getByText("M")).toBeInTheDocument();
  });

  it("renders dropdown label", async () => {
    const user = userEvent.setup();
    render(
      <PlatformSwitcher
        platforms={platforms}
        title="Matrice.ai"
        dropdownLabel="My Platforms"
      />,
    );
    await user.click(screen.getByText("Matrice.ai"));
    expect(await screen.findByText("My Platforms")).toBeInTheDocument();
  });
});
