import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import {
  CustomTooltip,
  CustomTooltipContent,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./index";

const meta: Meta<typeof Tooltip> = {
  title: "Primitives/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const Default: Story = {
  render: () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline">Hover me</Button>
      </TooltipTrigger>
      <TooltipContent>This is a tooltip</TooltipContent>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, padding: 48 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side}>
          <TooltipTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </TooltipTrigger>
          <TooltipContent side={side}>Tooltip on {side}</TooltipContent>
        </Tooltip>
      ))}
    </div>
  ),
};

export const Custom: Story = {
  name: "Custom (default colors)",
  render: () => (
    <div style={{ padding: 48 }}>
      <CustomTooltip content="Custom tooltip with default colors">
        <Button variant="outline">Hover me</Button>
      </CustomTooltip>
    </div>
  ),
};

export const CustomColors: Story = {
  name: "Custom — colors via props",
  render: () => (
    <div style={{ display: "flex", gap: 24, padding: 48, flexWrap: "wrap" }}>
      <CustomTooltip
        content="Dark tooltip"
        bgClassName="bg-foreground"
        textClassName="text-background"
      >
        <Button variant="outline">Dark</Button>
      </CustomTooltip>

      <CustomTooltip
        content="Destructive tooltip"
        bgClassName="bg-destructive"
        textClassName="text-white"
      >
        <Button variant="outline">Destructive</Button>
      </CustomTooltip>

      <CustomTooltip
        content="Muted surface tooltip"
        bgClassName="bg-muted"
        textClassName="text-foreground"
      >
        <Button variant="outline">Muted</Button>
      </CustomTooltip>

      <CustomTooltip
        content="Indigo tooltip"
        bgClassName="bg-indigo-600"
        textClassName="text-white"
      >
        <Button variant="outline">Indigo</Button>
      </CustomTooltip>
    </div>
  ),
};

export const CustomSides: Story = {
  name: "Custom — sides",
  render: () => (
    <div style={{ display: "flex", gap: 24, padding: 48 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <CustomTooltip
          key={side}
          side={side}
          content={`Custom tooltip on ${side}`}
          bgClassName="bg-foreground"
          textClassName="text-background"
        >
          <Button variant="outline" size="sm">
            {side}
          </Button>
        </CustomTooltip>
      ))}
    </div>
  ),
};

export const CustomNoArrow: Story = {
  name: "Custom — no arrow",
  render: () => (
    <div style={{ padding: 48 }}>
      <CustomTooltip
        content="No arrow on this tooltip"
        bgClassName="bg-foreground"
        textClassName="text-background"
        showArrow={false}
      >
        <Button variant="outline">Hover me</Button>
      </CustomTooltip>
    </div>
  ),
};

export const CustomLowLevel: Story = {
  name: "Custom — low-level (CustomTooltipContent)",
  render: () => (
    <div style={{ padding: 48 }}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="outline">Hover me</Button>
        </TooltipTrigger>
        <CustomTooltipContent
          bgClassName="bg-zinc-900"
          textClassName="text-white"
        >
          Composed using <code>CustomTooltipContent</code>
        </CustomTooltipContent>
      </Tooltip>
    </div>
  ),
};
