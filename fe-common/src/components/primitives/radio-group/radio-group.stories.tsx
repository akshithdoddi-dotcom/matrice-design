import { useState } from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { RadioGroup, RadioGroupItem } from "./index";

const meta: Meta<typeof RadioGroup> = {
  title: "Primitives/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  argTypes: {
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

const labelStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
};

export const Default: Story = {
  args: { defaultValue: "small" },
  render: (args) => (
    <RadioGroup {...args}>
      <label style={labelStyle}>
        <RadioGroupItem value="small" /> Small
      </label>
      <label style={labelStyle}>
        <RadioGroupItem value="medium" /> Medium
      </label>
      <label style={labelStyle}>
        <RadioGroupItem value="large" /> Large
      </label>
    </RadioGroup>
  ),
};

export const Disabled: Story = {
  args: { defaultValue: "x", disabled: true },
  render: (args) => (
    <RadioGroup {...args}>
      <label style={labelStyle}>
        <RadioGroupItem value="x" /> Disabled selected
      </label>
      <label style={labelStyle}>
        <RadioGroupItem value="y" /> Disabled
      </label>
    </RadioGroup>
  ),
};

export const ItemDisabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a">
      <label style={labelStyle}>
        <RadioGroupItem value="a" /> Available
      </label>
      <label style={labelStyle}>
        <RadioGroupItem value="b" /> Available
      </label>
      <label style={labelStyle}>
        <RadioGroupItem value="c" disabled /> Unavailable
      </label>
    </RadioGroup>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState("comfortable");
    return (
      <div>
        <RadioGroup value={value} onValueChange={setValue}>
          <label style={labelStyle}>
            <RadioGroupItem value="compact" /> Compact
          </label>
          <label style={labelStyle}>
            <RadioGroupItem value="comfortable" /> Comfortable
          </label>
          <label style={labelStyle}>
            <RadioGroupItem value="spacious" /> Spacious
          </label>
        </RadioGroup>
        <p style={{ marginTop: 12, fontSize: 12 }}>Selected: {value}</p>
      </div>
    );
  },
};
