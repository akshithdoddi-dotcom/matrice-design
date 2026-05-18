import type { Meta, StoryObj } from "@storybook/react";

import { randomFloat } from "@/lib/utils";

import { LineChart } from "./LineChart";

const makeEpochData = () =>
  Array.from({ length: 20 }, (_, i) => ({
    epoch: i + 1,
    trainLoss: 1 / (i + 1) + 0.05 + randomFloat() * 0.02,
    valLoss: 1 / (i + 1) + 0.1 + randomFloat() * 0.03,
    accuracy: 0.5 + (i / 20) * 0.45 + randomFloat() * 0.02,
  }));

const meta: Meta<typeof LineChart> = {
  title: "Components/Charts/LineChart",
  component: LineChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof LineChart>;

export const Minimal: Story = {
  name: "Minimal",
  args: {
    data: makeEpochData(),
    lines: [{ dataKey: "trainLoss", color: "var(--chart-1)" }],
    xKey: "epoch",
    height: 320,
  },
};

export const MultiSeries: Story = {
  name: "Multi-Series",
  args: {
    data: makeEpochData(),
    lines: [
      { dataKey: "trainLoss", color: "var(--chart-1)", name: "Train Loss" },
      { dataKey: "valLoss", color: "var(--chart-3)", name: "Val Loss" },
    ],
    xKey: "epoch",
    height: 340,
    legend: true,
    xAxis: { label: "Epoch" },
    yAxis: { label: "Loss" },
  },
};

export const AreaChart: Story = {
  name: "Area Chart",
  args: {
    data: makeEpochData(),
    lines: [
      {
        dataKey: "trainLoss",
        color: "var(--chart-1)",
        name: "Train Loss",
        area: true,
      },
      {
        dataKey: "valLoss",
        color: "var(--chart-3)",
        name: "Val Loss",
        area: { opacity: 0.1 },
      },
    ],
    xKey: "epoch",
    height: 340,
    legend: true,
  },
};

export const StepCurve: Story = {
  name: "Step Curve",
  args: {
    data: makeEpochData().slice(0, 10),
    lines: [
      {
        dataKey: "accuracy",
        color: "var(--chart-2)",
        curve: "step",
        name: "Accuracy",
      },
    ],
    xKey: "epoch",
    height: 320,
    yAxis: { domain: [0.4, 1] },
  },
};

export const DashedLines: Story = {
  name: "Dashed Lines",
  args: {
    data: makeEpochData(),
    lines: [
      {
        dataKey: "trainLoss",
        color: "var(--chart-1)",
        name: "Actual",
        strokeStyle: "solid",
      },
      {
        dataKey: "valLoss",
        color: "var(--chart-6)",
        name: "Predicted",
        strokeStyle: "dashed",
      },
    ],
    xKey: "epoch",
    height: 340,
    legend: true,
  },
};

export const WithDots: Story = {
  name: "With Dots",
  args: {
    data: makeEpochData().slice(0, 10),
    lines: [
      { dataKey: "trainLoss", color: "var(--chart-1)", dots: true },
      { dataKey: "valLoss", color: "var(--chart-3)", dots: { size: 4 } },
    ],
    xKey: "epoch",
    height: 320,
    legend: true,
  },
};

export const WithReferenceLines: Story = {
  name: "With Reference Lines",
  args: {
    data: makeEpochData(),
    lines: [{ dataKey: "trainLoss", color: "var(--chart-1)" }],
    xKey: "epoch",
    height: 340,
    referenceLines: [
      {
        axis: "y",
        value: 0.2,
        label: "Threshold",
        color: "var(--chart-danger)",
        strokeDasharray: "8 4",
      },
    ],
  },
};

export const NullGaps: Story = {
  name: "Null Gaps (connectNulls)",
  args: {
    data: makeEpochData().map((d, i) => ({
      ...d,
      trainLoss: i >= 8 && i <= 12 ? null : d.trainLoss,
    })),
    lines: [
      {
        dataKey: "trainLoss",
        color: "var(--chart-1)",
        connectNulls: true,
        dots: true,
      },
    ],
    xKey: "epoch",
    height: 320,
  },
};

export const CustomTooltip: Story = {
  name: "Custom Tooltip",
  args: {
    data: makeEpochData(),
    lines: [{ dataKey: "accuracy", color: "var(--chart-2)", name: "Accuracy" }],
    xKey: "epoch",
    height: 320,
    tooltip: {
      valueFormatter: (v) => `${(Number(v) * 100).toFixed(1)}%`,
      labelFormatter: (label) => `Epoch ${label}`,
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
    data: makeEpochData(),
    lines: [
      {
        dataKey: "trainLoss",
        color: "var(--chart-1)",
        name: "Train Loss",
        area: true,
      },
      { dataKey: "valLoss", color: "var(--chart-3)", name: "Val Loss" },
    ],
    xKey: "epoch",
    height: 340,
    legend: true,
  },
};
