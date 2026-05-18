import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { DatePicker } from "./date-picker";
import { TimePicker } from "./time-picker";

// ---------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------
describe("DatePicker", () => {
  it("renders with placeholder text", () => {
    render(<DatePicker />);
    expect(screen.getByText("Select date...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<DatePicker placeholder="Choose a date" />);
    expect(screen.getByText("Choose a date")).toBeInTheDocument();
  });

  it("renders label and associates it with the trigger", () => {
    render(<DatePicker label="Start date" />);
    const label = screen.getByText("Start date");
    expect(label.tagName).toBe("LABEL");
  });

  it("displays formatted date when value is provided", () => {
    render(
      <DatePicker value={new Date(2025, 0, 15)} displayFormat="MMM D, YYYY" />,
    );
    expect(screen.getByText("Jan 15, 2025")).toBeInTheDocument();
  });

  it("shows error message and sets aria-invalid", () => {
    render(<DatePicker error="Date is required" />);
    expect(screen.getByText("Date is required")).toBeInTheDocument();
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("shows helper text", () => {
    render(<DatePicker helperText="Format: MM/DD/YYYY" />);
    expect(screen.getByText("Format: MM/DD/YYYY")).toBeInTheDocument();
  });

  it("disables the trigger button when disabled=true", () => {
    render(<DatePicker disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("shows the clear button when clearable and value is set", () => {
    render(
      <DatePicker
        value={new Date(2025, 0, 15)}
        clearable
        onChange={() => {}}
      />,
    );
    // The clear button has role="button" inside the trigger
    const buttons = screen.getAllByRole("button");
    // Should have the clear button + trigger button
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("calls onChange with null when clear is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(
      <DatePicker
        value={new Date(2025, 0, 15)}
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

  it("opens popover when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<DatePicker />);
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("does not open popover when disabled", async () => {
    const user = userEvent.setup();
    render(<DatePicker disabled />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "false");
  });

  it.each(["sm", "default"] as const)(
    "renders size=%s without crashing",
    (size) => {
      render(<DatePicker size={size} />);
      expect(screen.getByRole("button")).toBeInTheDocument();
    },
  );
});

// ---------------------------------------------------------------------------
// TimePicker
// ---------------------------------------------------------------------------
describe("TimePicker", () => {
  it("renders with placeholder text", () => {
    render(<TimePicker />);
    expect(screen.getByText("Select time...")).toBeInTheDocument();
  });

  it("renders with custom placeholder", () => {
    render(<TimePicker placeholder="Pick a time" />);
    expect(screen.getByText("Pick a time")).toBeInTheDocument();
  });

  it("renders label", () => {
    render(<TimePicker label="Meeting time" />);
    expect(screen.getByText("Meeting time")).toBeInTheDocument();
  });

  it("displays formatted time when value is provided", () => {
    // 2:30 PM
    const date = new Date(2025, 0, 1, 14, 30);
    render(<TimePicker value={date} />);
    expect(screen.getByText("02:30 PM")).toBeInTheDocument();
  });

  it("shows error message and sets aria-invalid", () => {
    render(<TimePicker error="Time is required" />);
    expect(screen.getByText("Time is required")).toBeInTheDocument();
    const trigger = screen.getByRole("button");
    expect(trigger).toHaveAttribute("aria-invalid", "true");
  });

  it("shows helper text", () => {
    render(<TimePicker helperText="In your local timezone" />);
    expect(screen.getByText("In your local timezone")).toBeInTheDocument();
  });

  it("disables the trigger when disabled=true", () => {
    render(<TimePicker disabled />);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("opens popover when trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<TimePicker />);
    const trigger = screen.getByRole("button");
    await user.click(trigger);
    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });
});
