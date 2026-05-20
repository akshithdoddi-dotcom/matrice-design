import type { Meta, StoryObj } from "@storybook/react";

import { randomFloat } from "@/lib/utils";

import { ScatterChart } from "./ScatterChart";

const makeEmbeddingData = () =>
  Array.from({ length: 40 }, (_, i) => ({
    x: Math.cos(i / 5) * 20 + 50 + randomFloat() * 10,
    y: Math.sin(i / 5) * 15 + 50 + randomFloat() * 10,
    size: (i % 6) + 2,
  }));

const makeClusterA = () =>
  Array.from({ length: 25 }, () => ({
    x: 30 + randomFloat() * 20,
    y: 60 + randomFloat() * 20,
  }));

const makeClusterB = () =>
  Array.from({ length: 25 }, () => ({
    x: 60 + randomFloat() * 20,
    y: 30 + randomFloat() * 20,
  }));

const meta: Meta<typeof ScatterChart> = {
  title: "Components/Charts/ScatterChart",
  component: ScatterChart,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScatterChart>;

export const Minimal: Story = {
  name: "Minimal",
  args: {
    series: [
      { name: "Points", data: makeEmbeddingData(), color: "var(--chart-1)" },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
  },
};

export const MultipleSeries: Story = {
  name: "Multiple Series",
  args: {
    series: [
      { name: "Cluster A", data: makeClusterA(), color: "var(--chart-1)" },
      { name: "Cluster B", data: makeClusterB(), color: "var(--chart-3)" },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
    legend: true,
    xAxis: { label: "Dimension 1" },
    yAxis: { label: "Dimension 2" },
  },
};

export const DifferentShapes: Story = {
  name: "Different Shapes",
  args: {
    series: [
      {
        name: "Cluster A",
        data: makeClusterA(),
        color: "var(--chart-1)",
        shape: "circle",
      },
      {
        name: "Cluster B",
        data: makeClusterB(),
        color: "var(--chart-3)",
        shape: "diamond",
      },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
    legend: true,
  },
};

export const BubbleChart: Story = {
  name: "Bubble Chart (Dynamic Size)",
  args: {
    series: [
      {
        name: "Embeddings",
        data: makeEmbeddingData(),
        color: "var(--chart-4)",
      },
    ],
    xKey: "x",
    yKey: "y",
    nodeSize: { dataKey: "size", range: [40, 400] },
    height: 360,
  },
};

export const WithReferenceAreas: Story = {
  name: "With Reference Areas",
  args: {
    series: [
      { name: "Cluster A", data: makeClusterA(), color: "var(--chart-1)" },
      { name: "Cluster B", data: makeClusterB(), color: "var(--chart-3)" },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
    legend: true,
    referenceAreas: [
      {
        x1: 25,
        x2: 55,
        y1: 55,
        y2: 85,
        color: "var(--chart-1)",
        opacity: 0.05,
        label: "Zone A",
      },
      {
        x1: 55,
        x2: 85,
        y1: 25,
        y2: 55,
        color: "var(--chart-3)",
        opacity: 0.05,
        label: "Zone B",
      },
    ],
  },
};

export const WithReferenceLines: Story = {
  name: "With Reference Lines",
  args: {
    series: [
      { name: "Points", data: makeEmbeddingData(), color: "var(--chart-1)" },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
    referenceLines: [
      { axis: "x", value: 50, label: "Center X", color: "var(--chart-muted)" },
      { axis: "y", value: 50, label: "Center Y", color: "var(--chart-muted)" },
    ],
  },
};

export const CustomTooltip: Story = {
  name: "Custom Tooltip",
  args: {
    series: [
      { name: "Points", data: makeEmbeddingData(), color: "var(--chart-1)" },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
    tooltip: {
      valueFormatter: (v) => Number(v).toFixed(2),
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
    series: [
      { name: "Cluster A", data: makeClusterA(), color: "var(--chart-1)" },
      { name: "Cluster B", data: makeClusterB(), color: "var(--chart-3)" },
    ],
    xKey: "x",
    yKey: "y",
    height: 360,
    legend: true,
  },
};
