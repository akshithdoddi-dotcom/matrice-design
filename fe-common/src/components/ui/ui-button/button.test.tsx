import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./index";

describe("Button", () => {
  it('renders children text and has role="button"', () => {
    render(<Button>Click me</Button>);
    expect(
      screen.getByRole("button", { name: "Click me" }),
    ).toBeInTheDocument();
  });

  it("calls onClick handler when clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    await user.click(screen.getByRole("button", { name: "Click" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("does NOT call onClick when disabled", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Click
      </Button>,
    );
    await user.click(screen.getByRole("button", { name: "Click" }));
    expect(handleClick).not.toHaveBeenCalled();
  });

  it("shows loading spinner and disables button when isLoading=true", () => {
    render(<Button isLoading>Loading</Button>);
    const button = screen.getByRole("button", { name: "Loading" });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute("aria-busy", "true");
    // Spinner SVG should be present
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("renders startIcon before children text", () => {
    const icon = <span data-testid="start-icon">★</span>;
    render(<Button startIcon={icon}>Label</Button>);
    const button = screen.getByRole("button", { name: /Label/ });
    const startIcon = screen.getByTestId("start-icon");
    // startIcon should come before the text content
    expect(button).toContainElement(startIcon);
    const children = Array.from(button.childNodes);
    const iconIndex = children.indexOf(startIcon);
    const textIndex = children.findIndex(
      (node) => node.textContent === "Label",
    );
    expect(iconIndex).toBeLessThan(textIndex);
  });

  it("renders endIcon after children text", () => {
    const icon = <span data-testid="end-icon">→</span>;
    render(<Button endIcon={icon}>Label</Button>);
    const button = screen.getByRole("button", { name: /Label/ });
    const endIcon = screen.getByTestId("end-icon");
    expect(button).toContainElement(endIcon);
    const children = Array.from(button.childNodes);
    const iconIndex = children.indexOf(endIcon);
    const textIndex = children.findIndex(
      (node) => node.textContent === "Label",
    );
    expect(iconIndex).toBeGreaterThan(textIndex);
  });

  it.each([
    "default",
    "destructive",
    "outline",
    "secondary",
    "ghost",
    "link",
  ] as const)("renders variant=%s without crashing", (variant) => {
    render(<Button variant={variant}>Test</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
