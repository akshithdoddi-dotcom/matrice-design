import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { PieChart } from "./PieChart";

const statusData = [
  { name: "Deployed", value: 120, color: "var(--chart-success)" },
  { name: "Pending", value: 45, color: "var(--chart-warning)" },
  { name: "Failed", value: 12, color: "var(--chart-danger)" },
  { name: "Queued", value: 30, color: "var(--chart-info)" },
];

const meta: Meta<typeof PieChart> = {
  title: "Components/Charts/PieChart",
  component: PieChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof PieChart>;

export const Minimal: Story = {
  name: "Minimal",
  args: {
    data: statusData,
    height: 320,
    paddingAngle: 2,
  },
};

export const WithLegend: Story = {
  name: "With Legend",
  args: {
    data: statusData,
    height: 320,
    legend: true,
    paddingAngle: 2,
  },
};

export const Donut: Story = {
  name: "Donut",
  args: {
    data: statusData,
    variant: "donut",
    height: 340,
    legend: true,
    paddingAngle: 2,
  },
};

export const DonutWithCenter: Story = {
  name: "Donut with Center Content",
  args: {
    data: statusData,
    variant: "donut",
    height: 340,
    legend: true,
    paddingAngle: 2,
    centerContent: (
      <div style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: 24, fontWeight: 700, color: "var(--chart-text)" }}
        >
          207
        </div>
        <div style={{ fontSize: 12, color: "var(--chart-text-muted)" }}>
          Total
        </div>
      </div>
    ),
  },
};

export const InsideLabels: Story = {
  name: "Inside Labels",
  args: {
    data: statusData,
    height: 340,
    paddingAngle: 2,
    labels: { type: "percent", position: "inside" },
  },
};

export const OutsideLabels: Story = {
  name: "Outside Labels",
  args: {
    data: statusData,
    height: 340,
    paddingAngle: 2,
    labels: { type: "name", position: "outside" },
    labelLines: true,
  },
};

export const SemiCircle: Story = {
  name: "Semi-Circle",
  args: {
    data: statusData,
    height: 240,
    paddingAngle: 2,
    startAngle: 180,
    endAngle: 0,
    legend: true,
  },
};

export const SinglePoint: Story = {
  name: "Single Data Point",
  args: {
    data: [{ name: "Active", value: 100, color: "var(--chart-1)" }],
    height: 320,
    paddingAngle: 2,
    legend: true,
  },
};

export const CustomTooltip: Story = {
  name: "Custom Tooltip",
  args: {
    data: statusData,
    height: 320,
    paddingAngle: 2,
    tooltip: {
      valueFormatter: (v) => `${v} instances`,
    },
  },
};

export const DarkMode: Story = {
  name: "Dark Mode",
  decorators: [
    (Story) => (
      <div data-theme="dark" className="rounded-lg bg-background p-4">
        <Story />
      </div>
    ),
  ],
  args: {
    data: statusData,
    variant: "donut",
    height: 340,
    legend: true,
    paddingAngle: 2,
    centerContent: (
      <div style={{ textAlign: "center" }}>
        <div
          style={{ fontSize: 24, fontWeight: 700, color: "var(--chart-text)" }}
        >
          207
        </div>
        <div style={{ fontSize: 12, color: "var(--chart-text-muted)" }}>
          Total
        </div>
      </div>
    ),
  },
};
