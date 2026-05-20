import dayjs from "dayjs";
import { Calendar } from "lucide-react";

import * as React from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import { CalendarPanel } from "./calendar-panel";
import { type DatePickerBaseProps } from "./date-picker";
import { PickerTrigger } from "./picker-trigger";
import { TimeSelector } from "./time-selector";
import {
  type DateValue,
  clampDate,
  formatDate,
  normalizeDate,
  setTimeParts,
  toDate,
  toHourDisplay,
} from "./utils";

export interface DateTimePickerProps extends DatePickerBaseProps {
  value?: DateValue;
  onChange?: (date: Date | null) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  ampm?: boolean;
  displayFormat?: string;
  minuteStep?: number;
  disableDate?: (date: Date) => boolean;
}

export const DateTimePicker = React.forwardRef<
  HTMLButtonElement,
  DateTimePickerProps
>(
  (
    {
      label,
      placeholder = "Select date and time...",
      error,
      helperText,
      disabled,
      clearable = false,
      size = "default",
      className,
      value,
      onChange,
      minDate,
      maxDate,
      ampm = true,
      displayFormat = "MMM D, YYYY hh:mm A",
      minuteStep = 1,
      disableDate,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();
    const helperId = `${id}-helper`;
    const selected = normalizeDate(value);
    const hasError = Boolean(error);
    const displayValue = formatDate(
      value,
      ampm ? displayFormat : "MMM D, YYYY HH:mm",
    );

    const currentForTime = selected ?? dayjs();

    return (
      <div className={cn("input-root", className)}>
        {label && (
          <label className="input-label" htmlFor={id}>
            {label}
          </label>
        )}

        <Popover.Root
          open={open}
          onOpenChange={(next) => !disabled && setOpen(next)}
        >
          <PickerTrigger
            ref={ref}
            id={id}
            open={open}
            disabled={disabled}
            hasError={hasError}
            hasHelper={Boolean(error || helperText)}
            helperId={helperId}
            size={size}
            placeholder={placeholder}
            displayValue={displayValue}
            clearable={clearable}
            hasValue={Boolean(selected)}
            onClear={() => onChange?.(null)}
            trailingIcon={
              <Calendar
                size={size === "sm" ? 14 : 16}
                className={cn(
                  open ? "text-(--primary-main)" : "text-(--text-muted)",
                )}
              />
            }
          />

          <Popover.Content
            sideOffset={6}
            align="start"
            className={cn(
              "z-[1700] min-w-[320px] rounded-(--radius-lg) border border-(--border-color) bg-(--bg-elevated) p-3 shadow-(--shadow-lg)",
              "animate-[fadeIn_var(--duration-fast)_var(--ease-snappy)]",
            )}
            role="dialog"
            aria-label="Choose date and time"
          >
            <CalendarPanel
              selected={selected?.toDate()}
              minDate={minDate}
              maxDate={maxDate}
              disableDate={disableDate}
              onSelect={(date) => {
                if (!date) {
                  return;
                }
                const base = dayjs(date);
                const withTime = setTimeParts(
                  base,
                  toHourDisplay(currentForTime.hour(), ampm),
                  currentForTime.minute(),
                  ampm,
                  currentForTime.hour() >= 12 ? "PM" : "AM",
                );
                const next = clampDate(withTime, minDate, maxDate);
                onChange?.(toDate(next));
              }}
            />

            <div className="my-3 h-px bg-(--border-color)" />

            <TimeSelector
              value={currentForTime.toDate()}
              minTime={minDate}
              maxTime={maxDate}
              ampm={ampm}
              minuteStep={minuteStep}
              onChange={(next) => {
                const nextDate = clampDate(dayjs(next), minDate, maxDate);
                onChange?.(toDate(nextDate));
              }}
            />

            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                className="text-xs text-(--primary-main) hover:underline"
                onClick={() =>
                  onChange?.(toDate(clampDate(dayjs(), minDate, maxDate)))
                }
              >
                Now
              </button>
              <Button size="sm" onClick={() => setOpen(false)}>
                Done
              </Button>
            </div>
          </Popover.Content>
        </Popover.Root>

        {(error || helperText) && (
          <p
            id={helperId}
            className={error ? "input-error-text" : "input-helper-text"}
          >
            {error ?? helperText}
          </p>
        )}
      </div>
    );
  },
);

DateTimePicker.displayName = "DateTimePicker";
