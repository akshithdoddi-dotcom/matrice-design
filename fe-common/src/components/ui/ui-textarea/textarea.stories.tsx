import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";

import type { Meta, StoryObj } from "@storybook/react";

import { FormTextArea, TextArea } from "./index";

const meta: Meta<typeof TextArea> = {
  title: "Components/TextArea",
  component: TextArea,
  tags: ["autodocs"],
  args: {
    label: "Description",
    placeholder: "Enter text...",
    size: "default",
  },
  argTypes: {
    size: { control: "select", options: ["sm", "default", "lg"] },
    showToolbar: { control: "boolean" },
    disabled: { control: "boolean" },
  },
};

export default meta;
type Story = StoryObj<typeof TextArea>;

export const Default: Story = {};

export const Sizes: Story = {
  render: () => (
    <div className="grid gap-4">
      <TextArea size="sm" label="Small" placeholder="Small textarea" />
      <TextArea size="default" label="Default" placeholder="Default textarea" />
      <TextArea size="lg" label="Large" placeholder="Large textarea" />
    </div>
  ),
};

export const WithToolbar: Story = {
  args: {
    label: "Annotation Guidelines",
    showToolbar: true,
    size: "lg",
    placeholder: "Write guidelines...",
  },
};

export const WithCharacterCount: Story = {
  render: (args) => {
    const [value, setValue] = React.useState("");
    return (
      <TextArea
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
        maxLength={500}
        helperText="Keep it concise"
      />
    );
  },
};

export const ErrorState: Story = {
  args: {
    label: "Notes",
    error: "This field is required",
  },
};

export const HelperText: Story = {
  args: {
    label: "Description",
    helperText: "This helps users understand the expected content.",
  },
};

export const Disabled: Story = {
  args: {
    label: "Read-only notes",
    value: "This cannot be edited",
    disabled: true,
  },
};

export const WithFormTextArea: Story = {
  render: () => {
    type FormValues = { annotationGuidelines: string };
    const form = useForm<FormValues>({
      defaultValues: { annotationGuidelines: "" },
      mode: "onChange",
    });

    return (
      <FormProvider {...form}>
        <FormTextArea<FormValues>
          name="annotationGuidelines"
          label="Annotation Guidelines"
          placeholder="Describe labeling rules..."
          showToolbar
          size="lg"
          helperText="Use bullet points for clarity"
        />
      </FormProvider>
    );
  },
};

export const AllStates: Story = {
  render: () => (
    <div className="grid gap-4">
      <TextArea label="Default" placeholder="Type..." />
      <TextArea label="Toolbar" showToolbar placeholder="Try list buttons" />
      <TextArea
        label="Error"
        error="Please fill this field"
        value="Invalid text"
        readOnly
      />
      <TextArea label="Disabled" disabled value="Disabled content" readOnly />
    </div>
  ),
};

export const DarkMode: Story = {
  args: {
    label: "Dark Mode",
    placeholder: "Type...",
    showToolbar: true,
  },
  decorators: [
    (StoryFn) => (
      <div data-theme="dark" className="rounded-lg bg-background p-6">
        <StoryFn />
      </div>
    ),
  ],
};
