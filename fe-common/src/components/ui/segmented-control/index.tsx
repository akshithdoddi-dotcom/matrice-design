import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// SegmentedControl — compact button-row toggle (e.g. grid / list / kanban).
//
// Differs from <Tabs> (full-width nav with content panels) and <ChoiceGroup>
// (form-control radio/checkbox). This is a self-contained widget for a single
// view-mode choice: small, visual, single-select, with roving tabindex.
// ─────────────────────────────────────────────────────────────────────────────

export type SegmentedControlSize = "sm" | "md" | "lg";

export interface SegmentedControlOption<V extends string = string> {
  value: V;
  label?: string;
  icon?: React.ReactNode;
  /** Tooltip / aria-label fallback when `label` is omitted (icon-only). */
  ariaLabel?: string;
  disabled?: boolean;
}

export interface SegmentedControlProps<V extends string = string> extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  options: SegmentedControlOption<V>[];
  /** Controlled selected value. */
  value?: V;
  /** Uncontrolled initial value. */
  defaultValue?: V;
  onChange?: (value: V) => void;
  size?: SegmentedControlSize;
  disabled?: boolean;
  /** Stretch to fill the parent's width. Default: false (intrinsic). */
  fullWidth?: boolean;
  /** Accessible label describing what the control toggles (e.g. "View mode"). */
  ariaLabel?: string;
}

const SIZE_CLASSES: Record<
  SegmentedControlSize,
  { item: string; iconGap: string; height: string }
> = {
  sm: {
    item: "px-2.5 text-xs h-7",
    iconGap: "gap-1",
    height: "h-7",
  },
  md: {
    item: "px-3 text-sm h-8",
    iconGap: "gap-1.5",
    height: "h-8",
  },
  lg: {
    item: "px-4 text-sm h-10",
    iconGap: "gap-2",
    height: "h-10",
  },
};

export function SegmentedControl<V extends string = string>({
  options,
  value: controlledValue,
  defaultValue,
  onChange,
  size = "md",
  disabled = false,
  fullWidth = false,
  ariaLabel,
  className,
  ...rest
}: SegmentedControlProps<V>) {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = React.useState<V | undefined>(
    defaultValue ?? options.find((o) => !o.disabled)?.value,
  );
  const currentValue = isControlled ? controlledValue : internalValue;

  const buttonRefs = React.useRef<Array<HTMLButtonElement | null>>([]);

  const select = React.useCallback(
    (next: V) => {
      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, onChange],
  );

  const focusIndex = (idx: number) => {
    const btn = buttonRefs.current[idx];
    btn?.focus();
  };

  // Move focus + selection to the next/previous enabled option, wrapping.
  const moveFocus = (fromIdx: number, dir: 1 | -1) => {
    const len = options.length;
    let next = fromIdx;
    for (let step = 0; step < len; step++) {
      next = (next + dir + len) % len;
      if (!options[next].disabled) {
        focusIndex(next);
        select(options[next].value);
        return;
      }
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLButtonElement>,
    idx: number,
  ) => {
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
        e.preventDefault();
        moveFocus(idx, 1);
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        moveFocus(idx, -1);
        break;
      case "Home":
        e.preventDefault();
        for (let i = 0; i < options.length; i++) {
          if (!options[i].disabled) {
            focusIndex(i);
            select(options[i].value);
            return;
          }
        }
        break;
      case "End":
        e.preventDefault();
        for (let i = options.length - 1; i >= 0; i--) {
          if (!options[i].disabled) {
            focusIndex(i);
            select(options[i].value);
            return;
          }
        }
        break;
    }
  };

  const sizing = SIZE_CLASSES[size];

  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      className={cn(
        "inline-flex items-center rounded-md border border-(--border-color) bg-(--neutral-100) p-0.5 gap-0.5",
        "transition-opacity",
        disabled && "opacity-60 pointer-events-none",
        fullWidth && "w-full",
        className,
      )}
      {...rest}
    >
      {options.map((option, idx) => {
        const selected = option.value === currentValue;
        const itemDisabled = disabled || Boolean(option.disabled);
        const iconOnly = !option.label && Boolean(option.icon);

        return (
          <button
            key={option.value}
            ref={(el) => {
              buttonRefs.current[idx] = el;
            }}
            type="button"
            role="radio"
            aria-checked={selected}
            aria-label={
              option.ariaLabel ?? (iconOnly ? option.value : undefined)
            }
            disabled={itemDisabled}
            tabIndex={selected ? 0 : -1}
            onClick={() => !itemDisabled && select(option.value)}
            onKeyDown={(e) => handleKeyDown(e, idx)}
            className={cn(
              "inline-flex items-center justify-center font-medium rounded-sm",
              "transition-colors duration-150 ease-out",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-offset-1",
              sizing.item,
              sizing.iconGap,
              fullWidth && "flex-1",
              selected
                ? "bg-(--primary-main) text-(--color-primary-foreground) shadow-sm"
                : "text-(--text-secondary) hover:text-(--text-primary) hover:bg-(--bg-hover)",
              itemDisabled &&
                "cursor-not-allowed opacity-50 hover:bg-transparent",
            )}
          >
            {option.icon && (
              <span className="inline-flex shrink-0" aria-hidden="true">
                {option.icon}
              </span>
            )}
            {option.label && <span>{option.label}</span>}
          </button>
        );
      })}
    </div>
  );
}

SegmentedControl.displayName = "SegmentedControl";
