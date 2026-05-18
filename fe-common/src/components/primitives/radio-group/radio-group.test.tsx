import { describe, expect, it, vi } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RadioGroup, RadioGroupItem } from "./index";

function Example({ onValueChange }: { onValueChange?: (v: string) => void }) {
  return (
    <RadioGroup defaultValue="a" onValueChange={onValueChange}>
      <label>
        <RadioGroupItem value="a" /> Option A
      </label>
      <label>
        <RadioGroupItem value="b" /> Option B
      </label>
      <label>
        <RadioGroupItem value="c" disabled /> Option C
      </label>
    </RadioGroup>
  );
}

describe("Primitives/RadioGroup", () => {
  it("renders all radio items", () => {
    render(<Example />);
    expect(screen.getAllByRole("radio")).toHaveLength(3);
  });

  it("selects default value on initial render", () => {
    render(<Example />);
    const [a, b] = screen.getAllByRole("radio");
    expect(a).toHaveAttribute("data-state", "checked");
    expect(b).toHaveAttribute("data-state", "unchecked");
  });

  it("changes selection on click and calls onValueChange", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();
    render(<Example onValueChange={handleChange} />);
    const [a, b] = screen.getAllByRole("radio");
    await user.click(b);
    expect(b).toHaveAttribute("data-state", "checked");
    expect(a).toHaveAttribute("data-state", "unchecked");
    expect(handleChange).toHaveBeenCalledWith("b");
  });

  it("does not select disabled item", async () => {
    const user = userEvent.setup({ pointerEventsCheck: 0 });
    const handleChange = vi.fn();
    render(<Example onValueChange={handleChange} />);
    const [, , c] = screen.getAllByRole("radio");
    await user.click(c);
    expect(handleChange).not.toHaveBeenCalled();
  });

  it("forwards className on RadioGroup and RadioGroupItem", () => {
    render(
      <RadioGroup className="custom-group">
        <RadioGroupItem value="x" className="custom-item" />
      </RadioGroup>,
    );
    expect(document.querySelector('[data-slot="radio-group"]')).toHaveClass(
      "custom-group",
    );
    expect(
      document.querySelector('[data-slot="radio-group-item"]'),
    ).toHaveClass("custom-item");
  });
});
