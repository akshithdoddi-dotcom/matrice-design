import { Clock3 } from "lucide-react";

import * as React from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { type DatePickerBaseProps } from "./date-picker";
import { PickerTrigger } from "./picker-trigger";
import { TimeSelector } from "./time-selector";
import { type DateValue, formatDate, normalizeDate } from "./utils";

export interface TimePickerProps extends DatePickerBaseProps {
  value?: DateValue;
  onChange?: (date: Date | null) => void;
  minTime?: DateValue;
  maxTime?: DateValue;
  ampm?: boolean;
  displayFormat?: string;
  minuteStep?: number;
}

export const TimePicker = React.forwardRef<HTMLButtonElement, TimePickerProps>(
  (
    {
      label,
      placeholder = "Select time...",
      error,
      helperText,
      disabled,
      clearable = false,
      size = "default",
      className,
      value,
      onChange,
      minTime,
      maxTime,
      ampm = true,
      displayFormat = "hh:mm A",
      minuteStep = 1,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);
    const id = React.useId();
    const helperId = `${id}-helper`;
    const selected = normalizeDate(value);
    const hasError = Boolean(error);
    const displayValue = formatDate(value, ampm ? displayFormat : "HH:mm");

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
              <Clock3
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
              "z-[1700] min-w-[220px] rounded-(--radius-lg) border border-(--border-color) bg-(--bg-elevated) p-3 shadow-(--shadow-lg)",
              "animate-[fadeIn_var(--duration-fast)_var(--ease-snappy)]",
            )}
            role="dialog"
            aria-label="Choose time"
          >
            <TimeSelector
              value={selected?.toDate()}
              minTime={minTime}
              maxTime={maxTime}
              ampm={ampm}
              minuteStep={minuteStep}
              onChange={(next) => onChange?.(next)}
            />
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

TimePicker.displayName = "TimePicker";
