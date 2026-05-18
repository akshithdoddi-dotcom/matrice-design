import { describe, expect, it } from "vitest";

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./index";

describe("Tooltip", () => {
  it("shows tooltip content on hover", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover target</TooltipTrigger>
          <TooltipContent>Tooltip text</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.hover(screen.getByText("Hover target"));
    const matches = await screen.findAllByText("Tooltip text");
    expect(matches.length).toBeGreaterThan(0);
  });

  it("applies side class to content", async () => {
    const user = userEvent.setup();

    render(
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>Hover target</TooltipTrigger>
          <TooltipContent side="left">Left tooltip</TooltipContent>
        </Tooltip>
      </TooltipProvider>,
    );

    await user.hover(screen.getByText("Hover target"));
    const matches = await screen.findAllByText("Left tooltip");
    const content = matches.find((el) =>
      el.classList.contains("mui-tooltip-left"),
    );
    expect(content).toBeTruthy();
  });
});
