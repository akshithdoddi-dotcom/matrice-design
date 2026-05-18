import type { Meta, StoryObj } from "@storybook/react";

import { BarChart } from "./BarChart";

const sampleData = [
  { model: "GPT-4", accuracy: 0.92, loss: 0.08, f1: 0.89 },
  { model: "Claude", accuracy: 0.95, loss: 0.05, f1: 0.93 },
  { model: "Gemini", accuracy: 0.88, loss: 0.12, f1: 0.85 },
  { model: "Llama", accuracy: 0.84, loss: 0.16, f1: 0.81 },
];

const meta: Meta<typeof BarChart> = {
  title: "Components/Charts/BarChart",
  component: BarChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BarChart>;

export const Minimal: Story = {
  name: "Minimal",
  args: {
    data: sampleData.map(({ model, accuracy }) => ({ model, accuracy })),
    bars: [{ dataKey: "accuracy", color: "var(--chart-1)" }],
    categoryKey: "model",
    height: 320,
  },
};

export const Grouped: Story = {
  name: "Grouped",
  args: {
    data: sampleData,
    bars: [
      { dataKey: "accuracy", color: "var(--chart-1)", name: "Accuracy" },
      { dataKey: "f1", color: "var(--chart-2)", name: "F1 Score" },
    ],
    categoryKey: "model",
    height: 320,
    legend: true,
    radius: 4,
  },
};

export const Stacked: Story = {
  name: "Stacked",
  args: {
    data: sampleData,
    bars: [
      { dataKey: "accuracy", color: "var(--chart-1)", name: "Accuracy" },
      { dataKey: "loss", color: "var(--chart-6)", name: "Loss" },
    ],
    categoryKey: "model",
    stacked: true,
    height: 320,
    legend: true,
    radius: [4, 4, 0, 0],
  },
};

export const Horizontal: Story = {
  name: "Horizontal",
  args: {
    data: sampleData,
    bars: [{ dataKey: "accuracy", color: "var(--chart-2)" }],
    categoryKey: "model",
    layout: "horizontal",
    height: 300,
    radius: [0, 4, 4, 0],
  },
};

export const WithLabels: Story = {
  name: "With Labels",
  args: {
    data: sampleData.map(({ model, accuracy }) => ({ model, accuracy })),
    bars: [{ dataKey: "accuracy", color: "var(--chart-4)", label: true }],
    categoryKey: "model",
    height: 320,
  },
};

export const WithPatterns: Story = {
  name: "With Patterns",
  args: {
    data: sampleData,
    bars: [
      {
        dataKey: "accuracy",
        color: "var(--chart-1)",
        name: "Accuracy",
        pattern: "diagonal",
      },
      { dataKey: "f1", color: "var(--chart-3)", name: "F1", pattern: "dots" },
    ],
    categoryKey: "model",
    height: 320,
    legend: true,
  },
};

export const CustomTooltip: Story = {
  name: "Custom Tooltip",
  args: {
    data: sampleData,
    bars: [{ dataKey: "accuracy", color: "var(--chart-1)" }],
    categoryKey: "model",
    height: 320,
    tooltip: {
      valueFormatter: (v) => `${(Number(v) * 100).toFixed(1)}%`,
    },
  },
};

export const WithReferenceLines: Story = {
  name: "With Reference Lines",
  args: {
    data: sampleData,
    bars: [{ dataKey: "accuracy", color: "var(--chart-1)" }],
    categoryKey: "model",
    height: 320,
    referenceLines: [
      { axis: "y", value: 0.9, label: "Target", color: "var(--chart-danger)" },
    ],
  },
};

export const EmptyData: Story = {
  name: "Empty Data",
  args: {
    data: [],
    bars: [{ dataKey: "value", color: "var(--chart-1)" }],
    categoryKey: "id",
    height: 320,
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
    data: sampleData,
    bars: [
      { dataKey: "accuracy", color: "var(--chart-1)", name: "Accuracy" },
      { dataKey: "f1", color: "var(--chart-2)", name: "F1" },
    ],
    categoryKey: "model",
    height: 320,
    legend: true,
    radius: 4,
  },
};
