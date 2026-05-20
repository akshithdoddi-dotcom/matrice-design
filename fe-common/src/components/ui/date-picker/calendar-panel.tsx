import { ChevronLeft, ChevronRight } from "lucide-react";

import * as React from "react";
import { DayPicker } from "react-day-picker";

import { type DateValue, isDateDisabled } from "./utils";

const sharedClassNames = {
  months: "flex",
  month: "space-y-2",
  caption:
    "flex items-center justify-between text-sm font-semibold text-(--text-primary)",
  nav: "flex items-center gap-1",
  button_previous:
    "inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--text-muted) hover:bg-(--bg-hover)",
  button_next:
    "inline-flex h-8 w-8 items-center justify-center rounded-(--radius-sm) text-(--text-muted) hover:bg-(--bg-hover)",
  weekdays: "flex",
  weekday: "w-9 text-center text-xs text-(--text-muted)",
  week: "flex",
  day: "h-9 w-9 rounded-(--radius-md) text-sm text-(--text-primary) hover:bg-(--bg-hover)",
  selected: "bg-(--primary-main)! text-white!",
  today: "font-semibold text-(--primary-main)",
  disabled: "text-(--text-disabled) opacity-50",
  outside: "text-(--text-muted) opacity-40",
};

const sharedComponents = {
  Chevron: ({
    orientation,
  }: {
    orientation?: "left" | "right" | "up" | "down";
  }) =>
    orientation === "left" ? (
      <ChevronLeft size={16} />
    ) : (
      <ChevronRight size={16} />
    ),
};

export interface CalendarPanelProps {
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  disableDate?: (date: Date) => boolean;
}

/**
 * Shared DayPicker configuration used by DatePicker and DateTimePicker.
 * Bundles the default classNames, chevron components and the composed
 * disabled-date predicate.
 */
export function CalendarPanel({
  selected,
  onSelect,
  minDate,
  maxDate,
  disableDate,
}: CalendarPanelProps) {
  return (
    <DayPicker
      mode="single"
      selected={selected}
      onSelect={onSelect}
      disabled={(date) => isDateDisabled(date, minDate, maxDate, disableDate)}
      components={sharedComponents}
      classNames={sharedClassNames}
    />
  );
}
