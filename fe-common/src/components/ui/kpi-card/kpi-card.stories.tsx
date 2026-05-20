import type { Meta, StoryObj } from "@storybook/react";

import { KpiCard, KpiGrid } from "./index";

const meta: Meta<typeof KpiCard> = {
  title: "Components/KpiCard",
  component: KpiCard,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    type: {
      control: "select",
      options: ["stat", "spark", "alert", "performance", "capacity", "grid"],
    },
    colorTheme: {
      control: "select",
      options: ["red", "orange", "green", "blue"],
    },
    size: {
      control: "select",
      options: ["small", "medium", "large"],
    },
    chartType: {
      control: "select",
      options: ["line", "area"],
    },
  },
  decorators: [
    (Story) => (
      <div style={{ width: 320 }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof KpiCard>;

const SAMPLE_TREND = [10, 12, 11, 14, 13, 16, 15, 18];

// ── Type A: Stat ────────────────────────────────────────────────────────────
export const TypeAStat: Story = {
  name: "Type A — Stat",
  args: {
    type: "stat",
    label: "Violations",
    value: "02",
    subtitle: "Assembly Line · Active",
    badge: { text: "REAL-TIME", variant: "realtime" },
    definition: "Last 2 days ago",
    colorTheme: "red",
  },
};

// ── Type B: Spark ───────────────────────────────────────────────────────────
export const TypeBSpark: Story = {
  name: "Type B — Spark",
  args: {
    type: "spark",
    label: "Active Employees",
    value: "14",
    subtitle: "Overtime hours",
    badge: { text: "WARNING", variant: "warning" },
    chartData: SAMPLE_TREND,
    chartType: "area",
    colorTheme: "orange",
    definition: "Headcount on the floor right now",
  },
};

// ── Type C: Alert ───────────────────────────────────────────────────────────
export const TypeCAlert: Story = {
  name: "Type C — Alert",
  args: {
    type: "alert",
    label: "Critical Failures",
    value: "03",
    subtitle: "Line 4 · Conveyor",
    badge: { text: "REAL-TIME", variant: "realtime" },
    definition: "Investigate immediately",
    colorTheme: "red",
  },
};

// ── Type D: Performance ─────────────────────────────────────────────────────
export const TypeDPerformance: Story = {
  name: "Type D — Performance",
  args: {
    type: "performance",
    label: "Throughput",
    value: "1,284",
    subtitle: "Units / hr",
    badge: { text: "SUCCESS", variant: "success" },
    chartData: SAMPLE_TREND,
    chartType: "area",
    colorTheme: "green",
    definition: "Last 8 hours",
  },
};

// ── Type E: Capacity ────────────────────────────────────────────────────────
export const TypeECapacity: Story = {
  name: "Type E — Capacity",
  args: {
    type: "capacity",
    label: "Zone Capacity",
    value: "78%",
    subtitle: "Loading Dock",
    badge: { text: "ON CAPACITY", variant: "warning" },
    colorTheme: "orange",
    definition: "Approaching upper threshold",
  },
};

// ── Type F: Grid ────────────────────────────────────────────────────────────
export const TypeFGrid: Story = {
  name: "Type F — Grid",
  args: {
    type: "grid",
    label: "Shift Summary",
    badge: { text: "INFO", variant: "info" },
    colorTheme: "blue",
    items: [
      { label: "Shifts", value: "08", subtitle: "Active" },
      { label: "Workers", value: "142", subtitle: "On site" },
      { label: "Breaks", value: "12", subtitle: "In progress" },
      { label: "Idle", value: "03", subtitle: "Stations" },
    ],
    definition: "Refreshed every 60s",
  },
  decorators: [
    (Story) => (
      <div style={{ width: 520 }}>
        <Story />
      </div>
    ),
  ],
};

// ── Themed grid layout ──────────────────────────────────────────────────────
export const KpiGridLayout: Story = {
  name: "KpiGrid — Multi-card Layout",
  render: () => (
    <KpiGrid columns={2}>
      <KpiCard
        type="stat"
        label="Violations"
        value="02"
        subtitle="Assembly Line"
        badge={{ text: "REAL-TIME", variant: "realtime" }}
        colorTheme="red"
      />
      <KpiCard
        type="spark"
        label="Throughput"
        value="1.2K"
        subtitle="Units / hr"
        badge={{ text: "SUCCESS", variant: "success" }}
        chartData={SAMPLE_TREND}
        chartType="area"
        colorTheme="green"
      />
      <KpiCard
        type="capacity"
        label="Dock Capacity"
        value="78%"
        subtitle="Loading Dock"
        colorTheme="orange"
      />
      <KpiCard
        type="alert"
        label="Critical"
        value="03"
        subtitle="Conveyor"
        badge={{ text: "REAL-TIME", variant: "realtime" }}
        colorTheme="red"
      />
    </KpiGrid>
  ),
  decorators: [
    (Story) => (
      <div style={{ width: 720 }}>
        <Story />
      </div>
    ),
  ],
};
