import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Checkbox } from "./index";

const meta: Meta<typeof Checkbox> = {
  title: "Primitives/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
    checked: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Default: Story = {
  args: { "aria-label": "default" },
};

export const Checked: Story = {
  args: { "aria-label": "checked", defaultChecked: true },
};

export const Disabled: Story = {
  args: { "aria-label": "disabled", disabled: true },
};

export const DisabledChecked: Story = {
  args: {
    "aria-label": "disabled-checked",
    disabled: true,
    defaultChecked: true,
  },
};

export const WithLabel: Story = {
  render: () => (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Checkbox /> Accept terms and conditions
    </label>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return (
      <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
        <Checkbox
          checked={checked}
          onCheckedChange={(v) => setChecked(v === true)}
        />
        Subscribe to updates ({checked ? "yes" : "no"})
      </label>
    );
  },
};

export const Indeterminate: Story = {
  render: () => (
    <label style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
      <Checkbox checked="indeterminate" /> Some items selected
    </label>
  ),
};
