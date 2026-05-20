import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { Input } from "../input";
import { Popover, PopoverContent, PopoverTrigger } from "./index";

const meta: Meta<typeof Popover> = {
  title: "Primitives/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">Open Popover</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-4">
            <div className="space-y-2">
              <h4 className="font-medium leading-none">Dimensions</h4>
              <p className="text-sm text-muted-foreground">
                Set the dimensions for the layer.
              </p>
            </div>
            <div className="grid gap-2">
              <Input placeholder="Width" />
              <Input placeholder="Height" />
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};

export const Sides: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 24,
        padding: 100,
        justifyContent: "center",
      }}
    >
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Popover key={side}>
          <PopoverTrigger asChild>
            <Button variant="outline" size="sm">
              {side}
            </Button>
          </PopoverTrigger>
          <PopoverContent side={side} className="w-48">
            <p className="text-sm">Popover on {side}</p>
          </PopoverContent>
        </Popover>
      ))}
    </div>
  ),
};

export const WithForm: Story = {
  render: () => (
    <div style={{ padding: 48 }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button>Update Email</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="grid gap-3">
            <label className="text-sm font-medium" htmlFor="email">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" />
            <Button size="sm">Save</Button>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
};
