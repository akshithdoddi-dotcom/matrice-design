import * as React from "react";

import type { Meta, StoryObj } from "@storybook/react";

import { Select, type SelectProps, type SingleSelectProps } from "./index";

const baseOptions = [
  { label: "CPU", value: "cpu" },
  { label: "GPU", value: "gpu" },
  { label: "TPU", value: "tpu" },
];

const manyOptions = Array.from({ length: 60 }, (_, index) => ({
  label: `Option ${index + 1}`,
  value: `option-${index + 1}`,
}));

const meta: Meta<typeof Select> = {
  title: "Components/Select",
  component: Select,
  tags: ["autodocs"],
  args: {
    options: baseOptions,
    placeholder: "Select...",
    searchable: true,
    clearable: false,
    creatable: false,
    loading: false,
    disabled: false,
    error: false,
    size: "default",
  },
  argTypes: {
    multiple: { control: "boolean" },
    searchable: { control: "boolean" },
    clearable: { control: "boolean" },
    creatable: { control: "boolean" },
    selectAll: { control: "boolean" },
    loading: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "boolean" },
    size: { control: "select", options: ["default", "sm"] },
    maxDisplay: { control: "number" },
    placeholder: { control: "text" },
  },
};

export default meta;
type Story = StoryObj<typeof Select>;

function SingleControlled(args: SelectProps) {
  const props = args as SingleSelectProps;
  const [value, setValue] = React.useState<string | number | null>(
    props.value ?? null,
  );
  return (
    <Select {...props} multiple={false} value={value} onChange={setValue} />
  );
}

function MultiControlled(args: SelectProps) {
  const props = args as Extract<SelectProps, { multiple: true }>;
  const [value, setValue] = React.useState<Array<string | number>>(
    props.value ?? [],
  );
  return <Select {...props} multiple value={value} onChange={setValue} />;
}

export const SingleDefault: Story = {
  render: SingleControlled,
  args: {
    // label: "Compute Type",
    options: baseOptions,
  },
};

export const SingleSearchable: Story = {
  render: SingleControlled,
  args: {
    label: "Country",
    placeholder: "Select country...",
    options: [
      { label: "India", value: "IN" },
      { label: "United States", value: "US" },
      { label: "Germany", value: "DE" },
      { label: "Japan", value: "JP" },
    ],
    searchable: true,
  },
};

export const SingleClearable: Story = {
  render: SingleControlled,
  args: {
    label: "Country",
    options: [
      { label: "India", value: "IN" },
      { label: "United States", value: "US" },
      { label: "Germany", value: "DE" },
    ],
    clearable: true,
  },
};

export const SingleCreatable: Story = {
  render: SingleControlled,
  args: {
    label: "Tag",
    options: [
      { label: "Vision", value: "vision" },
      { label: "NLP", value: "nlp" },
    ],
    creatable: true,
  },
};

export const SingleWithError: Story = {
  render: SingleControlled,
  args: {
    label: "Role",
    options: [
      { label: "Admin", value: "admin" },
      { label: "Editor", value: "editor" },
    ],
    error: true,
    errorMessage: "Please choose a role.",
  },
};

export const SingleDisabled: Story = {
  render: SingleControlled,
  args: {
    label: "Team",
    options: [
      { label: "A", value: "A" },
      { label: "B", value: "B" },
    ],
    disabled: true,
  },
};

export const SingleLoading: Story = {
  render: SingleControlled,
  args: {
    label: "Dataset",
    options: [],
    loading: true,
  },
};

export const MultiDefault: Story = {
  render: MultiControlled,
  args: {
    label: "Expertise",
    options: [
      { label: "Computer Vision", value: "cv" },
      { label: "NLP", value: "nlp" },
      { label: "MLOps", value: "mlops" },
      { label: "Data Engineering", value: "data" },
    ],
  },
};

export const MultiWithSelectAll: Story = {
  render: MultiControlled,
  args: {
    label: "Split Types",
    options: [
      { label: "Train", value: "train" },
      { label: "Validation", value: "val" },
      { label: "Test", value: "test" },
    ],
    selectAll: true,
  },
};

export const MultiMaxDisplay: Story = {
  render: MultiControlled,
  args: {
    label: "Team Members",
    options: [
      { label: "Anita", value: "anita" },
      { label: "Rahul", value: "rahul" },
      { label: "Isha", value: "isha" },
      { label: "Maria", value: "maria" },
      { label: "David", value: "david" },
    ],
    maxDisplay: 2,
  },
};

export const MultiCreatable: Story = {
  render: MultiControlled,
  args: {
    label: "Tags",
    options: [
      { label: "Backend", value: "backend" },
      { label: "Frontend", value: "frontend" },
    ],
    creatable: true,
    selectAll: true,
  },
};

export const SmallSize: Story = {
  render: SingleControlled,
  args: {
    label: "Compact Select",
    options: baseOptions,
    size: "sm",
  },
};

export const ManyOptions: Story = {
  render: SingleControlled,
  args: {
    label: "Large Dataset",
    options: manyOptions,
  },
};

export const DisabledOptions: Story = {
  render: SingleControlled,
  args: {
    label: "Project",
    options: [
      { label: "Project Alpha", value: "alpha" },
      { label: "Project Beta", value: "beta", disabled: true },
      { label: "Project Gamma", value: "gamma" },
    ],
  },
};

export const EmptyState: Story = {
  render: SingleControlled,
  args: {
    label: "No Data",
    options: [],
  },
};

export const DarkMode: Story = {
  render: SingleControlled,
  args: {
    label: "Theme Select",
    options: baseOptions,
  },
  decorators: [
    (StoryFn) => (
      <div data-theme="dark" className="min-h-[240px] bg-background p-6">
        <StoryFn />
      </div>
    ),
  ],
};
