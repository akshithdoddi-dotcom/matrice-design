import { AlertTriangle, CheckCircle2, Info } from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./index";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: {
    children: "Badge",
    variant: "primary",
    size: "default",
  },
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "success", "warning", "error", "info", "neutral"],
    },
    size: {
      control: "select",
      options: ["default", "sm", "lg"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Default: Story = {};

export const Success: Story = {
  args: { variant: "success", children: "Success" },
};

export const Warning: Story = {
  args: { variant: "warning", children: "Warning" },
};

export const Error: Story = {
  args: { variant: "error", children: "Error" },
};

export const WithIcon: Story = {
  args: {
    variant: "info",
    children: "Info",
    icon: <Info size={12} />,
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
      <Badge>Primary</Badge>
      <Badge variant="success" icon={<CheckCircle2 size={12} />}>
        Success
      </Badge>
      <Badge variant="warning" icon={<AlertTriangle size={12} />}>
        Warning
      </Badge>
      <Badge variant="error">Error</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="neutral">Neutral</Badge>
    </div>
  ),
};
