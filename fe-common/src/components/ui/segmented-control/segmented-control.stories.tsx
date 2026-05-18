import { Calendar, LayoutGrid, List } from "lucide-react";

import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { SegmentedControl } from "./index";

const meta: Meta<typeof SegmentedControl> = {
  title: "Components/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
  parameters: { layout: "centered" },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    fullWidth: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

export const Default: Story = {
  args: {
    ariaLabel: "View mode",
    options: [
      { value: "grid", label: "Grid" },
      { value: "list", label: "List" },
      { value: "kanban", label: "Kanban" },
    ],
    defaultValue: "grid",
  },
};

export const IconsOnly: Story = {
  args: {
    ariaLabel: "View mode",
    options: [
      { value: "grid", icon: <LayoutGrid size={16} />, ariaLabel: "Grid" },
      { value: "list", icon: <List size={16} />, ariaLabel: "List" },
      {
        value: "calendar",
        icon: <Calendar size={16} />,
        ariaLabel: "Calendar",
      },
    ],
    defaultValue: "grid",
  },
};

export const IconWithLabel: Story = {
  args: {
    ariaLabel: "View mode",
    options: [
      { value: "grid", label: "Grid", icon: <LayoutGrid size={14} /> },
      { value: "list", label: "List", icon: <List size={14} /> },
    ],
    defaultValue: "grid",
  },
};

export const Sizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <SegmentedControl
        size="sm"
        ariaLabel="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ]}
        defaultValue="grid"
      />
      <SegmentedControl
        size="md"
        ariaLabel="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ]}
        defaultValue="grid"
      />
      <SegmentedControl
        size="lg"
        ariaLabel="View"
        options={[
          { value: "grid", label: "Grid" },
          { value: "list", label: "List" },
        ]}
        defaultValue="grid"
      />
    </div>
  ),
};

export const FullWidth: Story = {
  decorators: [
    (Story) => (
      <div style={{ width: 480 }}>
        <Story />
      </div>
    ),
  ],
  args: {
    ariaLabel: "View mode",
    fullWidth: true,
    options: [
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
      { value: "year", label: "Year" },
    ],
    defaultValue: "week",
  },
};

export const WithDisabledOption: Story = {
  args: {
    ariaLabel: "View mode",
    options: [
      { value: "grid", label: "Grid" },
      { value: "list", label: "List" },
      { value: "kanban", label: "Kanban", disabled: true },
    ],
    defaultValue: "grid",
  },
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = React.useState("grid");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <SegmentedControl
          ariaLabel="View"
          value={value}
          onChange={setValue}
          options={[
            { value: "grid", label: "Grid" },
            { value: "list", label: "List" },
            { value: "kanban", label: "Kanban" },
          ]}
        />
        <p style={{ fontSize: 12, color: "var(--text-muted)" }}>
          Selected: <code>{value}</code>
        </p>
      </div>
    );
  },
};
