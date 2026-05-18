import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Checkbox } from "./index";

describe("Primitives/Checkbox", () => {
  it("renders with role='checkbox'", () => {
    render(<Checkbox aria-label="agree" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toBeInTheDocument();
  });

  it("toggles checked state on click", async () => {
    const user = userEvent.setup();
    render(<Checkbox aria-label="agree" />);
    const cb = screen.getByRole("checkbox", { name: "agree" });
    expect(cb).toHaveAttribute("data-state", "unchecked");
    await user.click(cb);
    expect(cb).toHaveAttribute("data-state", "checked");
  });

  it("calls onCheckedChange handler", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Checkbox aria-label="agree" onCheckedChange={handleChange} />);
    await user.click(screen.getByRole("checkbox", { name: "agree" }));
    expect(handleChange).toHaveBeenCalledWith(true);
  });

  it("respects disabled prop and ignores clicks", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const handleChange = vi.fn();
    render(
      <Checkbox aria-label="agree" disabled onCheckedChange={handleChange} />,
    );
    const cb = screen.getByRole("checkbox", { name: "agree" });
    await user.click(cb);
    expect(handleChange).not.toHaveBeenCalled();
    expect(cb).toBeDisabled();
  });

  it("renders controlled checked state", () => {
    render(<Checkbox aria-label="agree" checked />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toHaveAttribute(
      "data-state",
      "checked",
    );
  });

  it("forwards className", () => {
    render(<Checkbox aria-label="agree" className="custom-cb" />);
    expect(screen.getByRole("checkbox", { name: "agree" })).toHaveClass(
      "custom-cb",
    );
  });

  it("sets data-slot for styling overrides", () => {
    render(<Checkbox aria-label="agree" />);
    expect(
      document.querySelector('[data-slot="checkbox"]'),
    ).toBeInTheDocument();
  });
});
