import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { Skeleton } from "./index";

describe("Primitives/Skeleton", () => {
  it("renders a div element", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toBeInstanceOf(HTMLDivElement);
  });

  it("forwards the data-slot attribute", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("data-slot", "skeleton");
  });

  it("applies custom className", () => {
    const { container } = render(<Skeleton className="h-10 w-40" />);
    const el = container.firstChild as HTMLElement;
    expect(el.className).toContain("h-10");
    expect(el.className).toContain("w-40");
  });

  it("forwards additional props", () => {
    const { container } = render(<Skeleton data-testid="skel" />);
    expect(container.firstChild).toHaveAttribute("data-testid", "skel");
  });
});
