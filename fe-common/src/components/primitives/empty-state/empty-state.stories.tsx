import { Plus, Zap } from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "@/components/primitives/button";

import { EmptyState } from "./index";

const meta: Meta<typeof EmptyState> = {
  title: "Primitives/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: {
      control: "select",
      options: ["sm", "default", "lg"],
    },
    title: { control: "text" },
    description: { control: "text" },
  },
  args: {
    title: "No items found",
    description: "Try adjusting your filters or create a new item.",
    size: "default",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const TitleOnly: Story = {
  name: "Title Only",
  args: {
    title: "No data available",
    description: undefined,
  },
};

export const SmallSize: Story = {
  name: "Small Size",
  args: {
    size: "sm",
    title: "No data available for this chart",
    description: undefined,
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: 320,
          border: "1px solid var(--border-color)",
          borderRadius: "var(--radius-lg)",
          overflow: "hidden",
        }}
      >
        <Story />
      </div>
    ),
  ],
};

export const LargeSize: Story = {
  name: "Large Size",
  args: {
    size: "lg",
    title: "Ready to Deploy Your First Application?",
    description:
      "Get started by creating a new project. You can deploy pre-built models or train your own.",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 640 }}>
        <Story />
      </div>
    ),
  ],
};

export const WithAction: Story = {
  name: "With Action",
  args: {
    title: "No items found",
    description: "Try adjusting your filters or create a new item.",
    action: <Button>Create New</Button>,
  },
};

export const WithCustomIcon: Story = {
  name: "With Custom Icon",
  args: {
    title: "No services found",
    description: "We haven't found any active services in this project.",
    icon: (
      <svg
        width={120}
        height={120}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect
          x="20"
          y="35"
          width="80"
          height="60"
          rx="6"
          fill="var(--neutral-100)"
          stroke="var(--border-color-strong)"
          strokeWidth="2"
        />
        <rect
          x="20"
          y="25"
          width="80"
          height="18"
          rx="6"
          fill="var(--neutral-200)"
          stroke="var(--border-color-strong)"
          strokeWidth="2"
        />
        <circle cx="32" cy="34" r="4" fill="var(--color-error-light)" />
        <circle cx="44" cy="34" r="4" fill="var(--color-warning-light)" />
        <circle cx="56" cy="34" r="4" fill="var(--color-success-light)" />
        <rect
          x="36"
          y="56"
          width="48"
          height="6"
          rx="3"
          fill="var(--neutral-300)"
        />
        <rect
          x="36"
          y="68"
          width="32"
          height="6"
          rx="3"
          fill="var(--neutral-200)"
        />
      </svg>
    ),
  },
};

export const WithGradientIcon: Story = {
  name: "With Gradient Icon",
  args: {
    size: "lg",
    title: "Ready to Deploy Your First Application?",
    description:
      "Get started by creating a new project. You can deploy pre-built models or train your own.",
    icon: (
      <div
        className="w-[120px] h-[120px] rounded-full flex items-center justify-center"
        style={{
          background:
            "linear-gradient(135deg, var(--primary-hover), var(--primary-main))",
        }}
      >
        <Zap color="white" size={48} aria-hidden="true" />
      </div>
    ),
    action: (
      <Button>
        <Plus size={16} />
        Create Project
      </Button>
    ),
  },
  decorators: [
    (Story) => (
      <div style={{ width: 600 }}>
        <Story />
      </div>
    ),
  ],
};

export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <div
        data-theme="dark"
        style={{
          background: "var(--bg-body)",
          padding: 48,
          borderRadius: "var(--radius-xl)",
          minWidth: 480,
        }}
      >
        <Story />
      </div>
    ),
  ],
  args: {
    title: "No items found",
    description: "Try adjusting your filters or create a new item.",
    action: <Button>Create New</Button>,
  },
};

export const AllSizes: Story = {
  name: "All Sizes",
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 24,
        width: 640,
      }}
    >
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginBottom: 8,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          sm — cards &amp; charts
        </p>
        <EmptyState size="sm" title="No data available for this chart" />
      </div>
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginBottom: 8,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          default — tables &amp; listings
        </p>
        <EmptyState
          title="No items found"
          description="Try adjusting your filters or create a new item."
          action={<Button>Create New</Button>}
        />
      </div>
      <div>
        <p
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            marginBottom: 8,
            fontWeight: 500,
            textTransform: "uppercase",
            letterSpacing: "0.05em",
          }}
        >
          lg — full page
        </p>
        <EmptyState
          size="lg"
          title="Ready to Deploy Your First Application?"
          description="Get started by creating a new project. You can deploy pre-built models or train your own."
          action={
            <Button>
              <Plus size={16} />
              Create Project
            </Button>
          }
        />
      </div>
    </div>
  ),
};
