import { afterEach, describe, expect, it } from "vitest";

import { cleanup, render, screen } from "@testing-library/react";

import { FullScreenLoader, Loader } from "./index";

describe("Loader", () => {
  it("renders the loader element", () => {
    render(<Loader size="sm" />);
    expect(screen.getByRole("status")).toBeInTheDocument();
  });

  it("renders label text when label prop is provided", () => {
    render(<Loader size="sm" label="Loading project…" />);
    expect(screen.getByText("Loading project…")).toBeInTheDocument();
    expect(screen.getByRole("status")).toHaveAttribute(
      "aria-label",
      "Loading project…",
    );
  });

  it("renders without label when label prop is omitted", () => {
    render(<Loader size="sm" />);
    const loader = screen.getByRole("status");
    expect(loader).toHaveAttribute("aria-label", "Loading");
    // No <p> label text
    expect(loader.querySelector("p")).not.toBeInTheDocument();
  });
});

describe("FullScreenLoader", () => {
  afterEach(() => {
    cleanup();
    document.body.style.overflow = "";
  });

  it("renders nothing when `open` is false", () => {
    render(<FullScreenLoader open={false} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("renders the overlay and surfaces the label via aria-label", () => {
    render(<FullScreenLoader open={true} label="Switching workspace" />);
    // Both the overlay wrapper and the inner Loader have role=status.
    const statuses = screen.getAllByRole("status");
    expect(statuses.length).toBeGreaterThanOrEqual(1);
    expect(
      statuses.some(
        (el) => el.getAttribute("aria-label") === "Switching workspace",
      ),
    ).toBe(true);
  });

  it("locks body scroll while open and restores it on close", () => {
    const { rerender } = render(<FullScreenLoader open={true} />);
    expect(document.body.style.overflow).toBe("hidden");

    rerender(<FullScreenLoader open={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("does NOT lock body scroll when lockScroll is false", () => {
    render(<FullScreenLoader open={true} lockScroll={false} />);
    expect(document.body.style.overflow).toBe("");
  });

  it("falls back to 'Loading' as aria-label when no label is provided", () => {
    render(<FullScreenLoader open={true} />);
    const statuses = screen.getAllByRole("status");
    expect(
      statuses.some((el) => el.getAttribute("aria-label") === "Loading"),
    ).toBe(true);
  });
});
