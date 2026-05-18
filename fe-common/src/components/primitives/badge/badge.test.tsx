import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { Badge } from "./index";

describe("Primitives/Badge", () => {
  it("renders children text", () => {
    render(<Badge>Active</Badge>);
    expect(screen.getByText("Active")).toBeInTheDocument();
  });

  it("applies data-slot attribute", () => {
    render(<Badge>Test</Badge>);
    expect(screen.getByText("Test")).toHaveAttribute("data-slot", "badge");
  });

  it("renders as a <span> by default", () => {
    render(<Badge>Tag</Badge>);
    expect(screen.getByText("Tag").tagName).toBe("SPAN");
  });

  it("renders icon when provided", () => {
    render(<Badge icon={<span data-testid="badge-icon">i</span>}>Info</Badge>);
    expect(screen.getByTestId("badge-icon")).toBeInTheDocument();
  });

  it("does not render icon slot when icon is not provided", () => {
    const { container } = render(<Badge>Plain</Badge>);
    expect(
      container.querySelector("[data-slot='badge-icon']"),
    ).not.toBeInTheDocument();
  });

  it("renders as child element when asChild is true", () => {
    render(
      <Badge asChild>
        <a href="/test">Link Badge</a>
      </Badge>,
    );
    const link = screen.getByRole("link", { name: "Link Badge" });
    expect(link).toBeInTheDocument();
    expect(link).toHaveAttribute("href", "/test");
  });

  it("merges custom className", () => {
    render(<Badge className="custom-class">Styled</Badge>);
    expect(screen.getByText("Styled")).toHaveClass("custom-class");
  });

  it("forwards additional HTML attributes", () => {
    render(<Badge data-testid="my-badge">Test</Badge>);
    expect(screen.getByTestId("my-badge")).toBeInTheDocument();
  });

  it.each([
    "primary",
    "success",
    "warning",
    "error",
    "info",
    "neutral",
    "outline",
  ] as const)("renders variant=%s without crashing", (variant) => {
    render(<Badge variant={variant}>Test</Badge>);
    expect(screen.getByText("Test")).toBeInTheDocument();
  });

  it.each(["sm", "default", "lg"] as const)(
    "renders size=%s without crashing",
    (size) => {
      render(<Badge size={size}>Test</Badge>);
      expect(screen.getByText("Test")).toBeInTheDocument();
    },
  );
});
