import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Input } from "./index";

describe("Input", () => {
  it("renders with label text and associates label via htmlFor", () => {
    render(<Input label="Email" />);
    const label = screen.getByText("Email");
    expect(label.tagName).toBe("LABEL");
    const input = screen.getByRole("textbox");
    expect(label).toHaveAttribute("for", input.id);
  });

  it("displays placeholder text", () => {
    render(<Input placeholder="Enter your name" />);
    expect(screen.getByPlaceholderText("Enter your name")).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Input placeholder="Email" onChange={handleChange} />);
    await user.type(screen.getByPlaceholderText("Email"), "hello");
    expect(handleChange).toHaveBeenCalled();
  });

  it("shows error message when error prop is provided", () => {
    render(<Input errorMessage="This field is required" />);
    expect(screen.getByRole("alert")).toHaveTextContent(
      "This field is required",
    );
  });

  it("shows helper text when helperText prop is provided", () => {
    render(<Input helperText="Enter a valid email" />);
    expect(screen.getByText("Enter a valid email")).toBeInTheDocument();
  });

  it("toggles password visibility when eye icon is clicked", async () => {
    const user = userEvent.setup();
    render(<Input type="password" placeholder="Password" />);
    const input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");

    const toggleButton = screen.getByRole("button", { name: "Show password" });
    await user.click(toggleButton);
    expect(input).toHaveAttribute("type", "text");

    const hideButton = screen.getByRole("button", { name: "Hide password" });
    await user.click(hideButton);
    expect(input).toHaveAttribute("type", "password");
  });
});
