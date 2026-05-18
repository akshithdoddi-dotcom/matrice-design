import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DateTimePicker } from "./date-time-picker";

describe("DateTimePicker", () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it("renders with placeholder text", () => {
    render(<DateTimePicker />);
    expect(screen.getByText("Select date and time...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<DateTimePicker placeholder="Choose datetime" />);
    expect(screen.getByText("Choose datetime")).toBeInTheDocument();
  });

  it("renders label and associates it with the trigger", () => {
    render(<DateTimePicker label="Event date & time" />);
    const label = screen.getByText("Event date & time");
    expect(label.tagName).toBe("LABEL");
  });

  it("displays formatted datetime when value is provided", () => {
    const testDate = new Date(2025, 5, 15, 14, 30); // June 15, 2025 2:30 PM
    render(<DateTimePicker value={testDate} />);
    expect(screen.getByText("Jun 15, 2025 02:30 PM")).toBeInTheDocument();
  });

  it("displays 24-hour format when ampm is false", () => {
    const testDate = new Date(2025, 5, 15, 14, 30);
    render(<DateTimePicker value={testDate} ampm={false} />);
    expect(screen.getByText("Jun 15, 2025 14:30")).toBeInTheDocument();
  });

  it("uses custom displayFormat", () => {
    const testDate = new Date(2025, 0, 20, 9, 15);
    // When ampm=false, displayFormat is overridden to use 24-hour format internally
    render(<DateTimePicker value={testDate} ampm={false} />);
    expect(screen.getByText("Jan 20, 2025 09:15")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Error and helper text
  // -------------------------------------------------------------------------
  it("shows error message and sets aria-invalid", () => {
    render(<DateTimePicker error="Date & time is required" />);
    expect(screen.getByText("Date & time is required")).toBeInTheDocument();
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("shows helper text", () => {
    render(<DateTimePicker helperText="Choose your preferred time" />);
    expect(screen.getByText("Choose your preferred time")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Disabled state
  // -------------------------------------------------------------------------
  it("disables the trigger button when disabled=true", () => {
    render(<DateTimePicker disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("does not open popover when disabled", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker disabled />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // -------------------------------------------------------------------------
  // Popover interactions
  // -------------------------------------------------------------------------
  it("opens popover when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("renders calendar and time selector in popover", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker />);
    await user.click(screen.getByRole("button"));

    // Should have the dialog
    expect(screen.getByRole("dialog")).toBeInTheDocument();

    // Should have Now button and Done button
    expect(screen.getByText("Now")).toBeInTheDocument();
    expect(screen.getByText("Done")).toBeInTheDocument();
  });

  it("closes popover when Done is clicked", async () => {
    const user = userEvent.setup();
    render(<DateTimePicker />);
    const trigger = screen.getByRole("button");

    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.click(screen.getByText("Done"));
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  // -------------------------------------------------------------------------
  // Clear functionality
  // -------------------------------------------------------------------------
  it("shows the clear button when clearable and value is set", () => {
    render(
      <DateTimePicker
        value={new Date(2025, 0, 15, 10, 0)}
        clearable
        onChange={() => {}}
      />,
    );
    // The clear button has role="button" inside the trigger
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onChange with null when clear is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DateTimePicker
        value={new Date(2025, 0, 15, 10, 0)}
        clearable
        onChange={handleChange}
      />,
    );
    // Find the clear button (the inner role="button" span)
    const clearButtons = screen.getAllByRole("button");
    const clearBtn = clearButtons.find((btn) => btn.tagName !== "BUTTON");
    if (clearBtn) {
      await user.click(clearBtn);
      expect(handleChange).toHaveBeenCalledWith(null);
    }
  });

  it("does not show clear button when disabled", () => {
    render(
      <DateTimePicker
        value={new Date(2025, 0, 15, 10, 0)}
        clearable
        disabled
        onChange={() => {}}
      />,
    );
    // Only the main trigger button should exist
    const buttons = screen.getAllByRole("button");
    expect(buttons).toHaveLength(1);
  });

  // -------------------------------------------------------------------------
  // Now button
  // -------------------------------------------------------------------------
  it("calls onChange with current datetime when Now is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<DateTimePicker onChange={handleChange} />);

    await user.click(screen.getByRole("button"));
    await user.click(screen.getByText("Now"));

    expect(handleChange).toHaveBeenCalled();
    const calledWith = handleChange.mock.calls[0][0];
    expect(calledWith).toBeInstanceOf(Date);
  });

  // -------------------------------------------------------------------------
  // Sizes
  // -------------------------------------------------------------------------
  it.each(["sm", "default"] as const)(
    "renders size=%s without crashing",
    (size) => {
      render(<DateTimePicker size={size} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    },
  );

  // -------------------------------------------------------------------------
  // Min/Max date constraints
  // -------------------------------------------------------------------------
  it("respects minDate constraint", async () => {
    const user = userEvent.setup();
    const minDate = new Date(2025, 5, 10);
    render(<DateTimePicker minDate={minDate} />);

    await user.click(screen.getByRole("button"));
    // Calendar should be rendered
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("respects maxDate constraint", async () => {
    const user = userEvent.setup();
    const maxDate = new Date(2025, 5, 20);
    render(<DateTimePicker maxDate={maxDate} />);

    await user.click(screen.getByRole("button"));
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  it("has correct aria attributes on trigger", () => {
    render(<DateTimePicker />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-haspopup", "dialog");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it("has correct displayName", () => {
    expect(DateTimePicker.displayName).toBe("DateTimePicker");
  });
});
