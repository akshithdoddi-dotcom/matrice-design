import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Button } from "./index";

describe("Primitives/Button", () => {
  it("renders children text and has role='button'", () => {
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

  it("renders as a child element when asChild is true", () => {
    render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "Link Button" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
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

  it.each(["default", "sm", "lg", "icon"] as const)(
    "renders size=%s without crashing",
    (size) => {
      render(<Button size={size}>Test</Button>);
      expect(screen.getByRole("button")).toBeInTheDocument();
    },
  );
});
