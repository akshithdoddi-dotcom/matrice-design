import { describe, expect, it, vi } from "vitest";

import { FormProvider, useForm } from "react-hook-form";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormDatePicker } from "./form-date-picker";
import { FormDateTimePicker } from "./form-date-time-picker";
import { FormTimePicker } from "./form-time-picker";

interface TestFormValues {
  date: Date | null;
  time: Date | null;
  dateTime: Date | null;
}

function TestWrapper({
  children,
  defaultValues = { date: null, time: null, dateTime: null },
}: {
  children: React.ReactNode;
  defaultValues?: Partial<TestFormValues>;
}) {
  const methods = useForm<TestFormValues>({
    defaultValues: { date: null, time: null, dateTime: null, ...defaultValues },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

function ControlledDatePickerWrapper({
  defaultValues = { date: null },
  onSubmit = vi.fn(),
}: {
  defaultValues?: Partial<TestFormValues>;
  onSubmit?: (data: TestFormValues) => void;
}) {
  const methods = useForm<TestFormValues>({
    defaultValues: { date: null, time: null, dateTime: null, ...defaultValues },
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormDatePicker<TestFormValues>
        name="date"
        control={methods.control}
        label="Select date"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

function ControlledTimePickerWrapper({
  defaultValues = { time: null },
  onSubmit = vi.fn(),
}: {
  defaultValues?: Partial<TestFormValues>;
  onSubmit?: (data: TestFormValues) => void;
}) {
  const methods = useForm<TestFormValues>({
    defaultValues: { date: null, time: null, dateTime: null, ...defaultValues },
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormTimePicker<TestFormValues>
        name="time"
        control={methods.control}
        label="Select time"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

function ControlledDateTimePickerWrapper({
  defaultValues = { dateTime: null },
  onSubmit = vi.fn(),
}: {
  defaultValues?: Partial<TestFormValues>;
  onSubmit?: (data: TestFormValues) => void;
}) {
  const methods = useForm<TestFormValues>({
    defaultValues: { date: null, time: null, dateTime: null, ...defaultValues },
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormDateTimePicker<TestFormValues>
        name="dateTime"
        control={methods.control}
        label="Select date and time"
      />
      <button type="submit">Submit</button>
    </form>
  );
}

// ---------------------------------------------------------------------------
// FormDatePicker
// ---------------------------------------------------------------------------
describe("FormDatePicker", () => {
  it("renders with FormProvider context", () => {
    render(
      <TestWrapper>
        <FormDatePicker<TestFormValues> name="date" label="Birth date" />
      </TestWrapper>,
    );
    expect(screen.getByText("Birth date")).toBeInTheDocument();
  });

  it("renders with explicit control prop", () => {
    render(<ControlledDatePickerWrapper />);
    expect(screen.getByText("Select date")).toBeInTheDocument();
  });

  it("displays placeholder when no date selected", () => {
    render(<ControlledDatePickerWrapper />);
    expect(screen.getByText("Select date...")).toBeInTheDocument();
  });

  it("displays formatted date when form has default value", () => {
    const testDate = new Date(2025, 5, 15); // June 15, 2025
    render(<ControlledDatePickerWrapper defaultValues={{ date: testDate }} />);
    expect(screen.getByText("Jun 15, 2025")).toBeInTheDocument();
  });

  it("opens calendar popover on click", async () => {
    const user = userEvent.setup();
    render(<ControlledDatePickerWrapper />);

    const trigger = screen.getByRole("button", { name: /select date/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("submits form with selected date", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const testDate = new Date(2025, 0, 20);
    render(
      <ControlledDatePickerWrapper
        defaultValues={{ date: testDate }}
        onSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByText("Submit"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ date: testDate }),
      expect.anything(),
    );
  });

  it("displays validation error from form", async () => {
    function ValidationWrapper() {
      const methods = useForm<TestFormValues>({
        defaultValues: { date: null },
      });

      return (
        <form>
          <FormDatePicker<TestFormValues>
            name="date"
            control={methods.control}
            label="Required date"
          />
          <button
            type="button"
            onClick={() =>
              methods.setError("date", { message: "Date is required" })
            }
          >
            Set Error
          </button>
        </form>
      );
    }

    const user = userEvent.setup();
    render(<ValidationWrapper />);

    await user.click(screen.getByText("Set Error"));
    expect(screen.getByText("Date is required")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(FormDatePicker.displayName).toBe("FormDatePicker");
  });
});

// ---------------------------------------------------------------------------
// FormTimePicker
// ---------------------------------------------------------------------------
describe("FormTimePicker", () => {
  it("renders with FormProvider context", () => {
    render(
      <TestWrapper>
        <FormTimePicker<TestFormValues> name="time" label="Meeting time" />
      </TestWrapper>,
    );
    expect(screen.getByText("Meeting time")).toBeInTheDocument();
  });

  it("renders with explicit control prop", () => {
    render(<ControlledTimePickerWrapper />);
    expect(screen.getByText("Select time")).toBeInTheDocument();
  });

  it("displays placeholder when no time selected", () => {
    render(<ControlledTimePickerWrapper />);
    expect(screen.getByText("Select time...")).toBeInTheDocument();
  });

  it("displays formatted time when form has default value", () => {
    const testTime = new Date(2025, 0, 1, 14, 30); // 2:30 PM
    render(<ControlledTimePickerWrapper defaultValues={{ time: testTime }} />);
    expect(screen.getByText("02:30 PM")).toBeInTheDocument();
  });

  it("opens time popover on click", async () => {
    const user = userEvent.setup();
    render(<ControlledTimePickerWrapper />);

    const trigger = screen.getByRole("button", { name: /select time/i });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("submits form with selected time", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const testTime = new Date(2025, 0, 1, 9, 0);
    render(
      <ControlledTimePickerWrapper
        defaultValues={{ time: testTime }}
        onSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByText("Submit"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ time: testTime }),
      expect.anything(),
    );
  });

  it("displays validation error from form", async () => {
    function ValidationWrapper() {
      const methods = useForm<TestFormValues>({
        defaultValues: { time: null },
      });

      return (
        <form>
          <FormTimePicker<TestFormValues>
            name="time"
            control={methods.control}
            label="Required time"
          />
          <button
            type="button"
            onClick={() =>
              methods.setError("time", { message: "Time is required" })
            }
          >
            Set Error
          </button>
        </form>
      );
    }

    const user = userEvent.setup();
    render(<ValidationWrapper />);

    await user.click(screen.getByText("Set Error"));
    expect(screen.getByText("Time is required")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(FormTimePicker.displayName).toBe("FormTimePicker");
  });
});

// ---------------------------------------------------------------------------
// FormDateTimePicker
// ---------------------------------------------------------------------------
describe("FormDateTimePicker", () => {
  it("renders with FormProvider context", () => {
    render(
      <TestWrapper>
        <FormDateTimePicker<TestFormValues>
          name="dateTime"
          label="Event date & time"
        />
      </TestWrapper>,
    );
    expect(screen.getByText("Event date & time")).toBeInTheDocument();
  });

  it("renders with explicit control prop", () => {
    render(<ControlledDateTimePickerWrapper />);
    expect(screen.getByText("Select date and time")).toBeInTheDocument();
  });

  it("displays placeholder when no datetime selected", () => {
    render(<ControlledDateTimePickerWrapper />);
    expect(screen.getByText("Select date and time...")).toBeInTheDocument();
  });

  it("displays formatted datetime when form has default value", () => {
    const testDateTime = new Date(2025, 5, 15, 14, 30); // June 15, 2025 2:30 PM
    render(
      <ControlledDateTimePickerWrapper
        defaultValues={{ dateTime: testDateTime }}
      />,
    );
    expect(screen.getByText("Jun 15, 2025 02:30 PM")).toBeInTheDocument();
  });

  it("opens datetime popover on click", async () => {
    const user = userEvent.setup();
    render(<ControlledDateTimePickerWrapper />);

    const trigger = screen.getByRole("button", {
      name: /select date and time/i,
    });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
  });

  it("submits form with selected datetime", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    const testDateTime = new Date(2025, 0, 20, 10, 15);
    render(
      <ControlledDateTimePickerWrapper
        defaultValues={{ dateTime: testDateTime }}
        onSubmit={handleSubmit}
      />,
    );

    await user.click(screen.getByText("Submit"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ dateTime: testDateTime }),
      expect.anything(),
    );
  });

  it("displays validation error from form", async () => {
    function ValidationWrapper() {
      const methods = useForm<TestFormValues>({
        defaultValues: { dateTime: null },
      });

      return (
        <form>
          <FormDateTimePicker<TestFormValues>
            name="dateTime"
            control={methods.control}
            label="Required datetime"
          />
          <button
            type="button"
            onClick={() =>
              methods.setError("dateTime", {
                message: "Date and time is required",
              })
            }
          >
            Set Error
          </button>
        </form>
      );
    }

    const user = userEvent.setup();
    render(<ValidationWrapper />);

    await user.click(screen.getByText("Set Error"));
    expect(screen.getByText("Date and time is required")).toBeInTheDocument();
  });

  it("has correct displayName", () => {
    expect(FormDateTimePicker.displayName).toBe("FormDateTimePicker");
  });
});
