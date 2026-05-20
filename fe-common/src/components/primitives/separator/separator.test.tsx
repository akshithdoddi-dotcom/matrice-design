import { describe, expect, it } from "vitest";

import { render } from "@testing-library/react";

import { Separator } from "./index";

describe("Primitives/Separator", () => {
  it("renders a horizontal separator by default", () => {
    const { container } = render(<Separator />);
    const sep = container.firstChild as HTMLElement;
    expect(sep).toHaveAttribute("data-orientation", "horizontal");
  });

  it("renders a vertical separator", () => {
    const { container } = render(<Separator orientation="vertical" />);
    const sep = container.firstChild as HTMLElement;
    expect(sep).toHaveAttribute("data-orientation", "vertical");
  });

  it("is decorative by default", () => {
    const { container } = render(<Separator />);
    const sep = container.firstChild as HTMLElement;
    expect(sep).toHaveAttribute("role", "none");
  });

  it("has separator role when not decorative", () => {
    const { container } = render(<Separator decorative={false} />);
    const sep = container.firstChild as HTMLElement;
    expect(sep).toHaveAttribute("role", "separator");
  });

  it("forwards the data-slot attribute", () => {
    const { container } = render(<Separator />);
    const sep = container.firstChild as HTMLElement;
    expect(sep).toHaveAttribute("data-slot", "separator-root");
  });
});
