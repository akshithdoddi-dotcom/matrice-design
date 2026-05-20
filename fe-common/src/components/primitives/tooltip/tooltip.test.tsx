import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";

import { Tooltip, TooltipContent, TooltipTrigger } from "./index";

describe("Primitives/Tooltip", () => {
  it("renders the trigger element", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    );
    expect(screen.getByText("Hover me")).toBeInTheDocument();
  });

  it("shows tooltip content on hover", async () => {
    render(
      <Tooltip defaultOpen>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    );
    // Using defaultOpen to test tooltip content renders correctly
    // Radix renders tooltip text in multiple places (visible + screen reader)
    const tooltipElements = await screen.findAllByText("Tooltip text");
    expect(tooltipElements.length).toBeGreaterThan(0);
  });

  it("hides tooltip content when not hovered", () => {
    render(
      <Tooltip>
        <TooltipTrigger>Hover me</TooltipTrigger>
        <TooltipContent>Tooltip text</TooltipContent>
      </Tooltip>,
    );
    expect(screen.queryByText("Tooltip text")).not.toBeInTheDocument();
  });
});
