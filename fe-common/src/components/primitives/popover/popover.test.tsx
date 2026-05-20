import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { Popover, PopoverContent, PopoverTrigger } from "./index";

describe("Primitives/Popover", () => {
  it("renders the trigger element", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Content</PopoverContent>
      </Popover>,
    );
    expect(screen.getByText("Open")).toBeInTheDocument();
  });

  it("shows content on trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Popover body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Open"));
    expect(await screen.findByText("Popover body")).toBeInTheDocument();
  });

  it("does not show content when closed", () => {
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent>Hidden</PopoverContent>
      </Popover>,
    );
    expect(screen.queryByText("Hidden")).not.toBeInTheDocument();
  });

  it("applies custom className to content", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Open</PopoverTrigger>
        <PopoverContent className="custom-class">Styled</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Open"));
    const content = await screen.findByText("Styled");
    expect(content.closest("[data-slot='popover-content']")).toHaveClass(
      "custom-class",
    );
  });

  it("closes on second trigger click", async () => {
    const user = userEvent.setup();
    render(
      <Popover>
        <PopoverTrigger>Toggle</PopoverTrigger>
        <PopoverContent>Body</PopoverContent>
      </Popover>,
    );
    await user.click(screen.getByText("Toggle"));
    expect(await screen.findByText("Body")).toBeInTheDocument();
    await user.click(screen.getByText("Toggle"));
    await screen.findByText("Toggle");
    // Content may still be in DOM during exit animation; check data-state
    const content = screen.queryByText("Body");
    if (content) {
      const slot = content.closest("[data-slot='popover-content']");
      expect(slot?.getAttribute("data-state")).toBe("closed");
    }
  });
});
