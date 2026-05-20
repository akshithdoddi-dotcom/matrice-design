import { describe, expect, it, vi } from "vitest";

import * as React from "react";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SegmentedControl } from "./index";

const VIEW_OPTIONS = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "kanban", label: "Kanban" },
];

describe("SegmentedControl", () => {
  it("renders all options as radios with the correct selection", () => {
    render(
      <SegmentedControl
        ariaLabel="View"
        options={VIEW_OPTIONS}
        defaultValue="list"
      />,
    );

    const list = screen.getByRole("radio", { name: "List" });
    expect(list).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("calls onChange and updates selection in uncontrolled mode", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        options={VIEW_OPTIONS}
        defaultValue="grid"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Kanban" }));
    expect(onChange).toHaveBeenCalledWith("kanban");
    expect(screen.getByRole("radio", { name: "Kanban" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("respects controlled value (does not change without parent update)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        options={VIEW_OPTIONS}
        value="grid"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "List" }));
    expect(onChange).toHaveBeenCalledWith("list");
    // value didn't change because parent never updated it
    expect(screen.getByRole("radio", { name: "Grid" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("moves selection with arrow keys (roving tabindex)", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        options={VIEW_OPTIONS}
        defaultValue="grid"
        onChange={onChange}
      />,
    );

    const grid = screen.getByRole("radio", { name: "Grid" });
    grid.focus();

    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("list");

    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("kanban");

    // wraps around
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("grid");

    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenLastCalledWith("kanban");
  });

  it("Home/End jump to first/last enabled option", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        options={VIEW_OPTIONS}
        defaultValue="list"
        onChange={onChange}
      />,
    );

    screen.getByRole("radio", { name: "List" }).focus();

    await user.keyboard("{End}");
    expect(onChange).toHaveBeenLastCalledWith("kanban");

    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenLastCalledWith("grid");
  });

  it("skips disabled options when navigating with arrow keys", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List", disabled: true },
          { value: "kanban", label: "Kanban" },
        ]}
        defaultValue="grid"
        onChange={onChange}
      />,
    );

    screen.getByRole("radio", { name: "Grid" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenLastCalledWith("kanban");
  });

  it("does not invoke onChange when a disabled option is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(
      <SegmentedControl
        ariaLabel="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List", disabled: true },
        ]}
        defaultValue="grid"
        onChange={onChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "List" }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it("disables the entire group when `disabled` is set", () => {
    render(
      <SegmentedControl
        ariaLabel="View"
        options={VIEW_OPTIONS}
        defaultValue="grid"
        disabled
      />,
    );
    expect(screen.getByRole("radiogroup")).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    screen.getAllByRole("radio").forEach((btn) => {
      expect(btn).toBeDisabled();
    });
  });
});
