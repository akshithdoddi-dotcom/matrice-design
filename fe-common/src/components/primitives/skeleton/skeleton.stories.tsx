import type { Meta, StoryObj } from "@storybook/react";

import { Skeleton } from "./index";

const meta: Meta<typeof Skeleton> = {
  title: "Primitives/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const Default: Story = {
  render: () => <Skeleton className="h-4 w-48" />,
};

export const Circle: Story = {
  render: () => <Skeleton className="size-12 rounded-full" />,
};

export const Card: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 8, width: 300 }}
    >
      <Skeleton className="h-32 w-full rounded-lg" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  ),
};

export const TextLines: Story = {
  render: () => (
    <div
      style={{ display: "flex", flexDirection: "column", gap: 6, width: 250 }}
    >
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-5/6" />
      <Skeleton className="h-4 w-4/6" />
    </div>
  ),
};
