import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Info,
  ShieldAlert,
} from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./index";

const meta: Meta<typeof Badge> = {
  title: "Primitives/Badge",
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
      options: [
        "primary",
        "success",
        "warning",
        "error",
        "info",
        "neutral",
        "outline",
      ],
    },
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
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

export const InfoVariant: Story = {
  name: "Info",
  args: { variant: "info", children: "Info" },
};

export const Neutral: Story = {
  args: { variant: "neutral", children: "Neutral" },
};

export const Outline: Story = {
  args: { variant: "outline", children: "Outline" },
};

export const WithIcon: Story = {
  args: {
    variant: "info",
    children: "Info",
    icon: <Info size={12} />,
  },
};

export const SmallSize: Story = {
  name: "Small",
  args: { size: "sm", children: "Small" },
};

export const LargeSize: Story = {
  name: "Large",
  args: { size: "lg", children: "Large" },
};

export const AsChild: Story = {
  name: "As Child (link)",
  args: {
    asChild: true,
    variant: "primary",
    children: <a href="#">Clickable Badge</a>,
  },
};

export const AllVariants: Story = {
  name: "All Variants",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Badge>Primary</Badge>
      <Badge variant="success" icon={<CheckCircle2 size={12} />}>
        Success
      </Badge>
      <Badge variant="warning" icon={<AlertTriangle size={12} />}>
        Warning
      </Badge>
      <Badge variant="error" icon={<ShieldAlert size={12} />}>
        Error
      </Badge>
      <Badge variant="info" icon={<Info size={12} />}>
        Info
      </Badge>
      <Badge variant="neutral">Neutral</Badge>
      <Badge variant="outline">Outline</Badge>
    </div>
  ),
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
      <Badge size="sm">Small</Badge>
      <Badge size="default">Default</Badge>
      <Badge size="lg">Large</Badge>
    </div>
  ),
};

export const StatusBadges: Story = {
  name: "Status Badges (real-world)",
  render: () => (
    <div
      style={{
        display: "flex",
        gap: 10,
        flexWrap: "wrap",
        alignItems: "center",
      }}
    >
      <Badge
        variant="success"
        size="sm"
        icon={<Circle size={8} fill="currentColor" />}
      >
        Active
      </Badge>
      <Badge
        variant="warning"
        size="sm"
        icon={<Circle size={8} fill="currentColor" />}
      >
        Pending
      </Badge>
      <Badge
        variant="error"
        size="sm"
        icon={<Circle size={8} fill="currentColor" />}
      >
        Offline
      </Badge>
      <Badge variant="neutral" size="sm">
        Archived
      </Badge>
    </div>
  ),
};
