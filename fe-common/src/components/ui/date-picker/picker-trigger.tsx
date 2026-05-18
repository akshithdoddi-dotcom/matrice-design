import { X } from "lucide-react";

import * as React from "react";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

export type PickerSize = "sm" | "default";

const triggerSizeClass: Record<PickerSize, string> = {
  sm: "h-8 text-xs",
  default: "h-10 text-sm",
};

export interface PickerTriggerProps {
  id: string;
  open: boolean;
  disabled?: boolean;
  hasError?: boolean;
  hasHelper?: boolean;
  helperId: string;
  size: PickerSize;
  placeholder: string;
  displayValue: string;
  clearable?: boolean;
  hasValue: boolean;
  onClear?: () => void;
  trailingIcon: React.ReactNode;
}

/**
 * Shared trigger button used by DatePicker, TimePicker and DateTimePicker.
 * Encapsulates the styling, a11y wiring and the optional "clear" affordance.
 */
export const PickerTrigger = React.forwardRef<
  HTMLButtonElement,
  PickerTriggerProps
>(function PickerTrigger(
  {
    id,
    open,
    disabled,
    hasError,
    hasHelper,
    helperId,
    size,
    placeholder,
    displayValue,
    clearable,
    hasValue,
    onClear,
    trailingIcon,
  },
  ref,
) {
  return (
    <Popover.Trigger asChild>
      <button
        ref={ref}
        id={id}
        type="button"
        disabled={disabled}
        aria-invalid={hasError || undefined}
        aria-describedby={hasHelper ? helperId : undefined}
        aria-expanded={open}
        aria-haspopup="dialog"
        className={cn(
          "relative flex w-full items-center rounded-(--radius-md) border bg-(--input-bg) px-3 text-left text-(--input-text)",
          "transition-all duration-(--duration-fast) ease-(--ease-snappy)",
          "hover:border-(--neutral-400) focus:outline-none focus:ring-2 focus:ring-(--primary-main) focus:border-(--primary-main)",
          triggerSizeClass[size],
          disabled &&
            "cursor-not-allowed border-(--input-border) bg-(--bg-disabled) text-(--text-disabled) opacity-50",
          hasError &&
            "border-(--color-error) focus:ring-(--color-error) focus:border-(--color-error)",
          open && "border-(--primary-main) ring-2 ring-(--primary-main)",
        )}
      >
        <span
          className={cn(
            "truncate",
            !displayValue && "text-(--input-placeholder)",
          )}
        >
          {displayValue || placeholder}
        </span>
        <span className="ml-auto inline-flex items-center gap-1">
          {clearable && hasValue && !disabled && (
            <span
              role="button"
              tabIndex={0}
              className="rounded p-0.5 text-(--text-muted) hover:text-(--text-primary)"
              onClick={(event) => {
                event.preventDefault();
                event.stopPropagation();
                onClear?.();
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  event.preventDefault();
                  onClear?.();
                }
              }}
            >
              <X size={14} />
            </span>
          )}
          {trailingIcon}
        </span>
      </button>
    </Popover.Trigger>
  );
});
