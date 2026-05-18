import { Mail, Search, User } from "lucide-react";

import type { Meta, StoryObj } from "@storybook/react";

import { Input } from "./index";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
  tags: ["autodocs"],
  args: { placeholder: "Placeholder text" },
  argTypes: {
    inputSize: { control: "select", options: ["default", "sm", "lg"] },
    error: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof Input>;

export const Default: Story = {};

export const WithLabel: Story = {
  args: { label: "Email address", placeholder: "you@example.com" },
};

export const Required: Story = {
  args: {
    label: "Email address",
    placeholder: "you@example.com",
    required: true,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Username",
    placeholder: "johndoe",
    helperText: "Only letters, numbers and underscores.",
  },
};

export const ErrorState: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    error: true,
    errorMessage: "Please enter a valid email address.",
    defaultValue: "not-an-email",
  },
};

export const Disabled: Story = {
  args: {
    label: "Username",
    defaultValue: "johndoe",
    disabled: true,
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    type: "password",
    placeholder: "Enter your password",
  },
};

export const WithStartIcon: Story = {
  args: {
    label: "Email",
    placeholder: "you@example.com",
    startIcon: <Mail size={18} />,
  },
};

export const WithEndIcon: Story = {
  args: {
    label: "Search",
    placeholder: "Search...",
    endIcon: <Search size={18} />,
  },
};

export const WithBothIcons: Story = {
  args: {
    label: "Profile",
    placeholder: "Enter name",
    startIcon: <User size={18} />,
    endIcon: <Search size={18} />,
  },
};

export const Small: Story = {
  args: { label: "Compact field", inputSize: "sm", placeholder: "Small input" },
};

export const Large: Story = {
  args: { label: "Large field", inputSize: "lg", placeholder: "Large input" },
};

export const AllStates: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        maxWidth: 400,
      }}
    >
      <Input label="Default" placeholder="Enter text" />
      <Input label="With value" defaultValue="Some value" />
      <Input
        label="With helper"
        placeholder="Enter text"
        helperText="This is helper text."
      />
      <Input
        label="Error"
        defaultValue="bad input"
        error
        errorMessage="This field has an error."
      />
      <Input label="Disabled" defaultValue="Disabled value" disabled />
      <Input label="Password" type="password" placeholder="Secret" />
      <Input
        label="With icon"
        placeholder="Search"
        startIcon={<Search size={18} />}
      />
    </div>
  ),
};
