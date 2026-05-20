import dayjs from "dayjs";
import { Calendar } from "lucide-react";

import * as React from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { CalendarPanel } from "./calendar-panel";
import { PickerTrigger } from "./picker-trigger";
import {
  type DateValue,
  clampDate,
  formatDate,
  normalizeDate,
  toDate,
} from "./utils";

export interface DatePickerBaseProps {
  label?: string;
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  clearable?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export interface DatePickerProps extends DatePickerBaseProps {
  value?: DateValue;
  onChange?: (date: Date | null) => void;
  minDate?: DateValue;
  maxDate?: DateValue;
  displayFormat?: string;
  disableDate?: (date: Date) => boolean;
}

export const DatePicker = React.forwardRef<HTMLButtonElement, DatePickerProps>(
  (
    {
      label,
      placeholder = "Select date...",
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
      displayFormat = "MMM D, YYYY",
      disableDate,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();
    const helperId = `${id}-helper`;
    const selected = normalizeDate(value);
    const hasError = Boolean(error);
    const displayValue = formatDate(value, displayFormat);

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
              "z-[1700] min-w-[280px] rounded-(--radius-lg) border border-(--border-color) bg-(--bg-elevated) p-3 shadow-(--shadow-lg)",
              "animate-[fadeIn_var(--duration-fast)_var(--ease-snappy)]",
            )}
            role="dialog"
            aria-label="Choose date"
          >
            <CalendarPanel
              selected={selected?.toDate()}
              minDate={minDate}
              maxDate={maxDate}
              disableDate={disableDate}
              onSelect={(date) => {
                if (!date) {
                  onChange?.(null);
                  return;
                }
                const next = clampDate(dayjs(date), minDate, maxDate);
                onChange?.(toDate(next));
              }}
            />

            <div className="mt-2 flex justify-end">
              <button
                type="button"
                className="text-xs text-(--primary-main) hover:underline"
                onClick={() => {
                  const next = clampDate(dayjs(), minDate, maxDate);
                  onChange?.(toDate(next.startOf("day")));
                }}
              >
                Today
              </button>
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

DatePicker.displayName = "DatePicker";
