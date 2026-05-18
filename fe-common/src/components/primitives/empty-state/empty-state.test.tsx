import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { EmptyState } from "./index";

describe("Primitives/EmptyState", () => {
  it("renders title text", () => {
    render(<EmptyState title="No results found" />);
    expect(screen.getByText("No results found")).toBeInTheDocument();
  });

  it("applies data-slot attribute", () => {
    const { container } = render(<EmptyState title="Test" />);
    expect(
      container.querySelector("[data-slot='empty-state']"),
    ).toBeInTheDocument();
  });

  it("renders description when provided", () => {
    render(
      <EmptyState
        title="No results"
        description="Try adjusting your filters"
      />,
    );
    expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
  });

  it("does not render description when not provided", () => {
    const { container } = render(<EmptyState title="No results" />);
    expect(
      container.querySelector("[data-slot='empty-state-description']"),
    ).not.toBeInTheDocument();
  });

  it("renders default icon when no custom icon is provided", () => {
    const { container } = render(<EmptyState title="Empty" />);
    expect(
      container.querySelector("[data-slot='empty-state-icon']"),
    ).toBeInTheDocument();
  });

  it("renders custom icon instead of default when icon prop is provided", () => {
    const { container } = render(
      <EmptyState
        title="Empty"
        icon={<span data-testid="custom-icon">custom</span>}
      />,
    );
    expect(screen.getByTestId("custom-icon")).toBeInTheDocument();
    expect(
      container.querySelector("[data-slot='empty-state-icon']"),
    ).not.toBeInTheDocument();
  });

  it("renders action when provided", () => {
    render(
      <EmptyState title="No items" action={<button>Create New</button>} />,
    );
    expect(
      screen.getByRole("button", { name: "Create New" }),
    ).toBeInTheDocument();
  });

  it("does not render action slot when action is not provided", () => {
    const { container } = render(<EmptyState title="No items" />);
    expect(
      container.querySelector("[data-slot='empty-state-action']"),
    ).not.toBeInTheDocument();
  });

  it("calls action onClick when button is clicked", async () => {
    const user = userEvent.setup();
    const handleClick = vi.fn();
    render(
      <EmptyState
        title="No items"
        action={<button onClick={handleClick}>Create New</button>}
      />,
    );
    await user.click(screen.getByRole("button", { name: "Create New" }));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("merges custom className", () => {
    const { container } = render(
      <EmptyState title="Test" className="min-h-[60vh]" />,
    );
    expect(container.querySelector("[data-slot='empty-state']")).toHaveClass(
      "min-h-[60vh]",
    );
  });

  it("forwards additional HTML attributes", () => {
    render(<EmptyState title="Test" data-testid="my-empty" />);
    expect(screen.getByTestId("my-empty")).toBeInTheDocument();
  });

  it.each(["sm", "default", "lg"] as const)(
    "renders size=%s without crashing",
    (size) => {
      render(<EmptyState size={size} title="Test" />);
      expect(screen.getByText("Test")).toBeInTheDocument();
    },
  );
});
