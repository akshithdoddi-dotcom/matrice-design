import { describe, expect, it, vi } from "vitest";

import { FormProvider, useForm } from "react-hook-form";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { FormTextArea } from "./form-textarea";

interface TestFormValues {
  description: string;
  notes: string;
}

function TestWrapper({
  children,
  defaultValues = { description: "", notes: "" },
}: {
  children: React.ReactNode;
  defaultValues?: Partial<TestFormValues>;
}) {
  const methods = useForm<TestFormValues>({
    defaultValues: { description: "", notes: "", ...defaultValues },
  });

  return <FormProvider {...methods}>{children}</FormProvider>;
}

function ControlledWrapper({
  defaultValues = { description: "" },
  onSubmit = vi.fn(),
}: {
  defaultValues?: Partial<TestFormValues>;
  onSubmit?: (data: TestFormValues) => void;
}) {
  const methods = useForm<TestFormValues>({
    defaultValues: { description: "", notes: "", ...defaultValues },
  });

  return (
    <form onSubmit={methods.handleSubmit(onSubmit)}>
      <FormTextArea<TestFormValues>
        name="description"
        control={methods.control}
        label="Description"
        placeholder="Enter description..."
      />
      <button type="submit">Submit</button>
    </form>
  );
}

describe("FormTextArea", () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it("renders with FormProvider context", () => {
    render(
      <TestWrapper>
        <FormTextArea<TestFormValues> name="description" label="Description" />
      </TestWrapper>,
    );
    expect(screen.getByText("Description")).toBeInTheDocument();
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with explicit control prop", () => {
    render(<ControlledWrapper />);
    expect(screen.getByText("Description")).toBeInTheDocument();
  });

  it("renders placeholder text", () => {
    render(<ControlledWrapper />);
    expect(
      screen.getByPlaceholderText("Enter description..."),
    ).toBeInTheDocument();
  });

  it("displays default value from form", () => {
    render(
      <ControlledWrapper defaultValues={{ description: "Initial text" }} />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("Initial text");
  });

  // -------------------------------------------------------------------------
  // User interactions
  // -------------------------------------------------------------------------
  it("updates form state when user types", async () => {
    const user = userEvent.setup();
    const handleSubmit = vi.fn();
    render(<ControlledWrapper onSubmit={handleSubmit} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Hello world");
    await user.click(screen.getByText("Submit"));

    expect(handleSubmit).toHaveBeenCalledWith(
      expect.objectContaining({ description: "Hello world" }),
      expect.anything(),
    );
  });

  it("syncs value changes with form state", async () => {
    const user = userEvent.setup();
    render(<ControlledWrapper />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "Test content");

    expect(textarea).toHaveValue("Test content");
  });

  // -------------------------------------------------------------------------
  // Validation errors
  // -------------------------------------------------------------------------
  it("displays validation error from form", async () => {
    function ValidationWrapper() {
      const methods = useForm<TestFormValues>({
        defaultValues: { description: "" },
      });

      return (
        <form>
          <FormTextArea<TestFormValues>
            name="description"
            control={methods.control}
            label="Description"
          />
          <button
            type="button"
            onClick={() =>
              methods.setError("description", {
                message: "Description is required",
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
    expect(screen.getByText("Description is required")).toBeInTheDocument();
  });

  it("sets aria-invalid when there is an error", async () => {
    function ValidationWrapper() {
      const methods = useForm<TestFormValues>({
        defaultValues: { description: "" },
      });

      return (
        <form>
          <FormTextArea<TestFormValues>
            name="description"
            control={methods.control}
            label="Description"
          />
          <button
            type="button"
            onClick={() =>
              methods.setError("description", { message: "Required" })
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
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true");
  });

  // -------------------------------------------------------------------------
  // Props passthrough
  // -------------------------------------------------------------------------
  it("passes additional props to TextArea", () => {
    render(
      <TestWrapper>
        <FormTextArea<TestFormValues>
          name="description"
          label="Description"
          disabled
        />
      </TestWrapper>,
    );
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  it("passes maxLength prop to TextArea", () => {
    render(
      <TestWrapper>
        <FormTextArea<TestFormValues>
          name="description"
          label="Description"
          maxLength={100}
        />
      </TestWrapper>,
    );
    expect(screen.getByText("0/100")).toBeInTheDocument();
  });

  it("renders with showToolbar prop", () => {
    render(
      <TestWrapper>
        <FormTextArea<TestFormValues>
          name="description"
          label="Description"
          showToolbar
        />
      </TestWrapper>,
    );
    expect(
      screen.getByRole("button", { name: "Insert bullet list item" }),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Edge cases
  // -------------------------------------------------------------------------
  it("handles undefined field value gracefully", () => {
    render(
      <TestWrapper
        defaultValues={{ description: undefined as unknown as string }}
      >
        <FormTextArea<TestFormValues> name="description" label="Description" />
      </TestWrapper>,
    );
    expect(screen.getByRole("textbox")).toHaveValue("");
  });

  it("has correct displayName", () => {
    expect(FormTextArea.displayName).toBe("FormTextArea");
  });
});
