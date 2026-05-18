import { describe, expect, it, vi } from "vitest";

import * as React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "./index";

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */

function renderCommand(ui: React.ReactElement) {
  return render(ui);
}

/* -------------------------------------------------------------------------- */
/*  Tests                                                                     */
/* -------------------------------------------------------------------------- */

describe("Command", () => {
  it("renders a list of items", () => {
    renderCommand(
      <Command>
        <CommandList>
          <CommandGroup heading="Platforms">
            <CommandItem value="vms">Matrice VMS</CommandItem>
            <CommandItem value="analytics">Matrice Analytics</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("Matrice VMS")).toBeInTheDocument();
    expect(screen.getByText("Matrice Analytics")).toBeInTheDocument();
  });

  it("renders the group heading", () => {
    renderCommand(
      <Command>
        <CommandList>
          <CommandGroup heading="Platforms">
            <CommandItem value="vms">Matrice VMS</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("Platforms")).toBeInTheDocument();
  });

  it("renders CommandShortcut inside an item", () => {
    renderCommand(
      <Command>
        <CommandList>
          <CommandGroup heading="Platforms">
            <CommandItem value="vms">
              Matrice VMS
              <CommandShortcut>⌘1</CommandShortcut>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("⌘1")).toBeInTheDocument();
  });

  it("calls onSelect when an item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderCommand(
      <Command>
        <CommandList>
          <CommandItem value="vms" onSelect={onSelect}>
            Matrice VMS
          </CommandItem>
        </CommandList>
      </Command>,
    );

    await user.click(screen.getByText("Matrice VMS"));
    expect(onSelect).toHaveBeenCalledWith("vms");
  });

  it("does not call onSelect when a disabled item is clicked", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();

    renderCommand(
      <Command>
        <CommandList>
          <CommandItem value="vms" disabled onSelect={onSelect}>
            Matrice VMS
          </CommandItem>
        </CommandList>
      </Command>,
    );

    await user.click(screen.getByText("Matrice VMS"));
    expect(onSelect).not.toHaveBeenCalled();
  });

  it("renders the empty state when CommandEmpty is provided and no items match", () => {
    renderCommand(
      <Command>
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
        </CommandList>
      </Command>,
    );

    expect(screen.getByText("No results found.")).toBeInTheDocument();
  });

  it("renders a separator between groups", () => {
    const { container } = renderCommand(
      <Command>
        <CommandList>
          <CommandGroup heading="Group A">
            <CommandItem value="a">Item A</CommandItem>
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Group B">
            <CommandItem value="b">Item B</CommandItem>
          </CommandGroup>
        </CommandList>
      </Command>,
    );

    const separator = container.querySelector("[cmdk-separator]");
    expect(separator).toBeInTheDocument();
  });

  it("renders a check icon when active prop is true", () => {
    const { container } = renderCommand(
      <Command>
        <CommandList>
          <CommandItem value="analytics" active>
            Matrice Analytics
          </CommandItem>
        </CommandList>
      </Command>,
    );

    // The active prop adds a Check icon to the item
    const checkIcon = container.querySelector("svg.lucide-check");
    expect(checkIcon).toBeInTheDocument();
  });

  it("accepts and forwards className on Command root", () => {
    const { container } = renderCommand(
      <Command className="custom-class">
        <CommandList />
      </Command>,
    );

    expect(container.firstChild).toHaveClass("custom-class");
  });
});
