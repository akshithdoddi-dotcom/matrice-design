import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { TextArea } from "./index";

describe("TextArea", () => {
  // -------------------------------------------------------------------------
  // Rendering
  // -------------------------------------------------------------------------
  it("renders a textarea element", () => {
    render(<TextArea />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("renders with label and associates via htmlFor", () => {
    render(<TextArea label="Description" />);
    const label = screen.getByText("Description");
    expect(label.tagName).toBe("LABEL");
    const textarea = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", textarea.id);
  });

  it("renders required star when required=true", () => {
    render(<TextArea label="Bio" required />);
    expect(screen.getByText("*")).toBeInTheDocument();
  });

  it("displays placeholder text", () => {
    render(<TextArea placeholder="Write something..." />);
    expect(
      screen.getByPlaceholderText("Write something..."),
    ).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Error and helper text
  // -------------------------------------------------------------------------
  it("shows error message and sets aria-invalid", () => {
    render(<TextArea error="This field is required" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    expect(screen.getByText("This field is required")).toBeInTheDocument();
  });

  it("shows helper text", () => {
    render(<TextArea helperText="Max 500 characters" />);
    expect(screen.getByText("Max 500 characters")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Character count
  // -------------------------------------------------------------------------
  it("displays character count when maxLength is set", () => {
    render(<TextArea maxLength={100} defaultValue="hello" />);
    expect(screen.getByText("5/100")).toBeInTheDocument();
  });

  it("updates character count as user types", async () => {
    const user = userEvent.setup();
    render(<TextArea maxLength={100} placeholder="Type here" />);
    expect(screen.getByText("0/100")).toBeInTheDocument();
    await user.type(screen.getByPlaceholderText("Type here"), "abc");
    expect(screen.getByText("3/100")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // User interactions
  // -------------------------------------------------------------------------
  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextArea placeholder="Type" onChange={handleChange} />);
    await user.type(screen.getByPlaceholderText("Type"), "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("is disabled when disabled=true", () => {
    render(<TextArea disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // Toolbar
  // -------------------------------------------------------------------------
  it("renders toolbar buttons when showToolbar=true", () => {
    render(<TextArea showToolbar />);
    expect(
      screen.getByRole("button", { name: "Insert bullet list item" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Insert numbered list item" }),
    ).toBeInTheDocument();
  });

  it("does not render toolbar by default", () => {
    render(<TextArea />);
    expect(
      screen.queryByRole("button", { name: "Insert bullet list item" }),
    ).not.toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Sizes
  // -------------------------------------------------------------------------
  it.each(["sm", "default", "lg"] as const)(
    "renders size=%s without crashing",
    (size) => {
      render(<TextArea size={size} />);
      expect(screen.getByRole("textbox")).toBeInTheDocument();
    },
  );

  // -------------------------------------------------------------------------
  // Controlled vs uncontrolled
  // -------------------------------------------------------------------------
  it("works as a controlled component", () => {
    const { rerender } = render(
      <TextArea value="initial" onChange={() => {}} />,
    );
    expect(screen.getByRole("textbox")).toHaveValue("initial");
    rerender(<TextArea value="updated" onChange={() => {}} />);
    expect(screen.getByRole("textbox")).toHaveValue("updated");
  });

  it("works as an uncontrolled component with defaultValue", () => {
    render(<TextArea defaultValue="default text" />);
    expect(screen.getByRole("textbox")).toHaveValue("default text");
  });

  // -------------------------------------------------------------------------
  // Toolbar interactions
  // -------------------------------------------------------------------------
  it("inserts bullet point when bullet button is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextArea showToolbar onChange={handleChange} />);

    const bulletBtn = screen.getByRole("button", {
      name: "Insert bullet list item",
    });
    await user.click(bulletBtn);

    expect(handleChange).toHaveBeenCalled();
  });

  it("inserts numbered list when numbered button is clicked", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextArea showToolbar onChange={handleChange} />);

    const numberedBtn = screen.getByRole("button", {
      name: "Insert numbered list item",
    });
    await user.click(numberedBtn);

    expect(handleChange).toHaveBeenCalled();
  });

  it("disables toolbar buttons when textarea is disabled", () => {
    render(<TextArea showToolbar disabled />);
    expect(
      screen.getByRole("button", { name: "Insert bullet list item" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Insert numbered list item" }),
    ).toBeDisabled();
  });

  // -------------------------------------------------------------------------
  // List continuation
  // -------------------------------------------------------------------------
  it("continues bullet list when pressing Enter after bullet item", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextArea defaultValue="• Item one" onChange={handleChange} />);

    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    // Move cursor to end
    await user.keyboard("{End}");
    await user.keyboard("{Enter}");

    // The onChange should be called with the new bullet continuation
    expect(handleChange).toHaveBeenCalled();
  });

  it("continues numbered list when pressing Enter after numbered item", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<TextArea defaultValue="1. First item" onChange={handleChange} />);

    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    await user.keyboard("{End}");
    await user.keyboard("{Enter}");

    expect(handleChange).toHaveBeenCalled();
  });

  it("does not continue list for regular text", async () => {
    const user = userEvent.setup();
    render(<TextArea defaultValue="Regular text" />);

    const textarea = screen.getByRole("textbox");
    await user.click(textarea);
    await user.keyboard("{End}");
    await user.keyboard("{Enter}");

    // Should just have a newline, no prefix
    expect(textarea).toHaveValue("Regular text\n");
  });

  it("calls onKeyDown prop when provided", async () => {
    const user = userEvent.setup();
    const handleKeyDown = vi.fn();
    render(<TextArea onKeyDown={handleKeyDown} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "a");

    expect(handleKeyDown).toHaveBeenCalled();
  });

  // -------------------------------------------------------------------------
  // Character count edge cases
  // -------------------------------------------------------------------------
  it("shows character count at max when maxLength is reached", async () => {
    const user = userEvent.setup();
    render(<TextArea maxLength={5} />);

    const textarea = screen.getByRole("textbox");
    await user.type(textarea, "12345");

    // HTML maxlength attribute prevents typing beyond limit
    expect(screen.getByText("5/5")).toBeInTheDocument();
  });

  it("handles controlled value with character count", () => {
    render(<TextArea value="test" maxLength={10} onChange={() => {}} />);
    expect(screen.getByText("4/10")).toBeInTheDocument();
  });

  // -------------------------------------------------------------------------
  // Accessibility
  // -------------------------------------------------------------------------
  it("links textarea to helper text via aria-describedby", () => {
    render(<TextArea helperText="Some help text" />);
    const textarea = screen.getByRole("textbox");
    const helperId = textarea.getAttribute("aria-describedby");
    expect(helperId).toBeTruthy();
    const helper = document.getElementById(helperId!);
    expect(helper).toHaveTextContent("Some help text");
  });

  it("links textarea to error text via aria-describedby", () => {
    render(<TextArea error="Error message" />);
    const textarea = screen.getByRole("textbox");
    const helperId = textarea.getAttribute("aria-describedby");
    expect(helperId).toBeTruthy();
    const helper = document.getElementById(helperId!);
    expect(helper).toHaveTextContent("Error message");
  });

  it("uses custom id when provided", () => {
    render(<TextArea id="custom-id" label="Custom" />);
    const textarea = screen.getByRole("textbox");
    expect(textarea.id).toBe("custom-id");
  });

  // -------------------------------------------------------------------------
  // Error vs Helper priority
  // -------------------------------------------------------------------------
  it("displays error instead of helper when both are provided", () => {
    render(<TextArea error="Error" helperText="Helper" />);
    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(screen.queryByText("Helper")).not.toBeInTheDocument();
  });
});
