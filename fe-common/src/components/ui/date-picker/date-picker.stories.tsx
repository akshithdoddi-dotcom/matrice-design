import dayjs from "dayjs";

import * as React from "react";
import { FormProvider, useForm } from "react-hook-form";

import type { Meta, StoryObj } from "@storybook/react";

import {
  DatePicker,
  DateTimePicker,
  FormDatePicker,
  FormDateTimePicker,
  FormTimePicker,
  TimePicker,
} from "./index";

const meta: Meta<typeof DatePicker> = {
  title: "Components/DateTimePicker",
  component: DatePicker,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

function DateControlled(args: React.ComponentProps<typeof DatePicker>) {
  const [value, setValue] = React.useState<Date | null>(new Date());
  return <DatePicker {...args} value={value} onChange={setValue} />;
}

function TimeControlled(args: React.ComponentProps<typeof TimePicker>) {
  const [value, setValue] = React.useState<Date | null>(new Date());
  return <TimePicker {...args} value={value} onChange={setValue} />;
}

function DateTimeControlled(args: React.ComponentProps<typeof DateTimePicker>) {
  const [value, setValue] = React.useState<Date | null>(new Date());
  return <DateTimePicker {...args} value={value} onChange={setValue} />;
}

export const DatePickerDefault: Story = {
  name: "DatePicker / Default",
  render: DateControlled,
  args: { label: "Start Date" },
};

export const DatePickerWithMinMax: Story = {
  name: "DatePicker / WithMinMax",
  render: DateControlled,
  args: {
    label: "Deadline",
    minDate: new Date(),
    maxDate: dayjs().add(30, "day").toDate(),
  },
};

export const DatePickerClearable: Story = {
  name: "DatePicker / Clearable",
  render: DateControlled,
  args: {
    label: "Clearable Date",
    clearable: true,
  },
};

export const DatePickerDisabledDates: Story = {
  name: "DatePicker / DisabledDates",
  render: DateControlled,
  args: {
    label: "Weekdays only",
    disableDate: (date) => date.getDay() === 0 || date.getDay() === 6,
    helperText: "Weekends are disabled",
  },
};

export const DatePickerSmallSize: Story = {
  name: "DatePicker / SmallSize",
  render: DateControlled,
  args: {
    label: "Small",
    size: "sm",
  },
};

export const DatePickerCustomFormat: Story = {
  name: "DatePicker / CustomFormat",
  render: DateControlled,
  args: {
    label: "Custom Format",
    displayFormat: "DD/MM/YYYY",
  },
};

export const TimePickerDefault: Story = {
  name: "TimePicker / Default",
  render: () => <TimeControlled label="Start Time" />,
};

export const TimePicker24Hour: Story = {
  name: "TimePicker / 24Hour",
  render: () => <TimeControlled label="24 Hour" ampm={false} />,
};

export const TimePickerMinuteStep: Story = {
  name: "TimePicker / MinuteStep",
  render: () => <TimeControlled label="15 min step" minuteStep={15} />,
};

export const DateTimePickerDefault: Story = {
  name: "DateTimePicker / Default",
  render: () => <DateTimeControlled label="Schedule Send" />,
};

export const DateTimePickerWithMinDate: Story = {
  name: "DateTimePicker / WithMinDate",
  render: () => <DateTimeControlled label="Future only" minDate={dayjs()} />,
};

export const DateTimePickerFormIntegration: Story = {
  name: "DateTimePicker / FormIntegration",
  render: () => {
    type FormValues = { sendTime: Date | null };
    const form = useForm<FormValues>({
      defaultValues: { sendTime: new Date() },
    });
    return (
      <FormProvider {...form}>
        <FormDateTimePicker<FormValues>
          name="sendTime"
          label="Select Date and Time"
        />
      </FormProvider>
    );
  },
};

export const AllVariantsSizes: Story = {
  name: "AllVariants / Sizes",
  render: () => (
    <div className="grid gap-4 md:grid-cols-2">
      <DatePicker label="Date sm" size="sm" />
      <DatePicker label="Date default" />
      <TimePicker label="Time sm" size="sm" />
      <TimePicker label="Time default" />
      <DateTimePicker label="DateTime sm" size="sm" />
      <DateTimePicker label="DateTime default" />
    </div>
  ),
};

export const AllVariantsErrorState: Story = {
  name: "AllVariants / ErrorState",
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <DatePicker label="Date" error="Required field" />
      <TimePicker label="Time" error="Required field" />
      <DateTimePicker label="DateTime" error="Required field" />
    </div>
  ),
};

export const AllVariantsDisabled: Story = {
  name: "AllVariants / Disabled",
  render: () => (
    <div className="grid gap-4 md:grid-cols-3">
      <DatePicker label="Date" disabled />
      <TimePicker label="Time" disabled />
      <DateTimePicker label="DateTime" disabled />
    </div>
  ),
};

export const DarkMode: Story = {
  name: "DarkMode",
  render: () => (
    <div data-theme="dark" className="rounded-lg bg-background p-6">
      <div className="grid gap-4 md:grid-cols-3">
        <DatePicker label="Date" />
        <TimePicker label="Time" />
        <DateTimePicker label="DateTime" />
      </div>
    </div>
  ),
};

export const FormDateAndTimeExamples: Story = {
  name: "Form / Date + Time wrappers",
  render: () => {
    type FormValues = {
      fromDate: Date | null;
      toDate: Date | null;
      activationTime: Date | null;
    };
    const form = useForm<FormValues>({
      defaultValues: {
        fromDate: null,
        toDate: null,
        activationTime: null,
      },
    });
    return (
      <FormProvider {...form}>
        <div className="grid gap-4 md:grid-cols-3">
          <FormDatePicker<FormValues>
            name="fromDate"
            label="From"
            size="sm"
            clearable
          />
          <FormDatePicker<FormValues>
            name="toDate"
            label="To"
            size="sm"
            clearable
          />
          <FormTimePicker<FormValues>
            name="activationTime"
            label="Activation Time"
            minuteStep={5}
          />
        </div>
      </FormProvider>
    );
  },
};
