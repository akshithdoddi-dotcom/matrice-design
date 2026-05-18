import { Boxes, ChevronLeft, Plus } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "../button";
import { SegmentedControl } from "../segmented-control";
import { PageHeader } from "./index";

const meta: Meta<typeof PageHeader> = {
  title: "Components/PageHeader",
  component: PageHeader,
  tags: ["autodocs"],
  parameters: { layout: "padded" },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    bordered: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof PageHeader>;

export const Default: Story = {
  args: {
    title: "Bring Your Own Model",
    subtitle: "Manage and deploy custom models from your own checkpoints.",
    icon: <Boxes size={20} />,
  },
};

export const WithAction: Story = {
  args: {
    title: "Models",
    subtitle: "12 active · 3 training",
    icon: <Boxes size={20} />,
    action: (
      <Button>
        <Plus size={14} /> New model
      </Button>
    ),
  },
};

export const WithEyebrow: Story = {
  args: {
    title: "alpha-v2",
    subtitle: "Last trained 2 hours ago",
    icon: <Boxes size={20} />,
    eyebrow: (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
        <ChevronLeft size={12} /> Back to models
      </span>
    ),
  },
};

export const WithSegmentedAction: Story = {
  args: {
    title: "Datasets",
    subtitle: "Browse and manage labeled data.",
    icon: <Boxes size={20} />,
    action: (
      <SegmentedControl
        ariaLabel="View"
        defaultValue="grid"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ]}
      />
    ),
  },
};

export const Bordered: Story = {
  args: {
    title: "Dashboard",
    subtitle: "Overview of system health and throughput.",
    icon: <Boxes size={20} />,
    bordered: true,
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <PageHeader
        size="sm"
        title="Small"
        subtitle="sm size"
        icon={<Boxes size={16} />}
      />
      <PageHeader
        title="Default"
        subtitle="default size"
        icon={<Boxes size={20} />}
      />
      <PageHeader
        size="lg"
        title="Large"
        subtitle="lg size"
        icon={<Boxes size={24} />}
      />
    </div>
  ),
};

export const NoIcon: Story = {
  args: {
    title: "Settings",
    subtitle: "Workspace preferences and integrations.",
  },
};

export const RawIconNoBackdrop: Story = {
  args: {
    title: "Custom icon",
    subtitle: "When you supply your own composed icon node.",
    icon: (
      <img
        alt=""
        src="https://placehold.co/40x40/0066cc/white?text=M"
        style={{ borderRadius: 8 }}
      />
    ),
    iconBackdrop: false,
  },
};
