import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ChoiceOption<V extends string | number = string> {
  label: React.ReactNode;
  value: V;
  data?: unknown;
  disabled?: boolean;
}

interface ChoiceItemProps<V extends string | number> {
  option: ChoiceOption<V>;
  index: number;
  name: string;
  multiple: boolean;
  selected: boolean;
  disabled?: boolean;
  error?: string;
  size?: "sm" | "default" | "lg";
  renderOption?: (
    option: ChoiceOption<V>,
    state: { isSelected: boolean; isDisabled: boolean },
    onClick: () => void,
  ) => React.ReactElement;
  onSelect: (value: V) => void;
}

const indicatorSizeClass: Record<NonNullable<ChoiceItemProps<string>["size"]>, string> = {
  sm: "h-4 w-4",
  default: "h-[18px] w-[18px]",
  lg: "h-[22px] w-[22px]",
};

const labelSizeClass: Record<NonNullable<ChoiceItemProps<string>["size"]>, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-base",
};

const gapSizeClass: Record<NonNullable<ChoiceItemProps<string>["size"]>, string> = {
  sm: "gap-(--space-1)",
  default: "gap-(--space-2)",
  lg: "gap-(--space-3)",
};

export function ChoiceItem<V extends string | number>({
  option,
  index,
  name,
  multiple,
  selected,
  disabled,
  error,
  size = "default",
  renderOption,
  onSelect,
}: ChoiceItemProps<V>) {
  const optionId = `${name}-${index}`;
  const isDisabled = Boolean(disabled || option.disabled);

  if (renderOption) {
    return (
      <div className="relative">
        <input
          id={optionId}
          className="sr-only"
          type={multiple ? "checkbox" : "radio"}
          name={name}
          checked={selected}
          disabled={isDisabled}
          readOnly
          tabIndex={-1}
        />
        {renderOption(
          option,
          { isSelected: selected, isDisabled },
          () => {
            if (!isDisabled) {
              onSelect(option.value);
            }
          },
        )}
      </div>
    );
  }

  return (
    <label
      htmlFor={optionId}
      className={cn(
        "group inline-flex w-full items-center rounded-(--radius-md) border border-transparent px-2 py-1.5 transition-all duration-(--duration-fast) ease-(--ease-snappy)",
        gapSizeClass[size],
        !isDisabled && "hover:border-(--border-color) hover:bg-(--bg-hover)",
        selected && !renderOption && "border-(--primary-main) bg-(--primary-subtle)",
        isDisabled ? "cursor-not-allowed" : "cursor-pointer",
      )}
    >
      <input
        id={optionId}
        className="peer sr-only"
        type={multiple ? "checkbox" : "radio"}
        name={name}
        checked={selected}
        disabled={isDisabled}
        onChange={() => onSelect(option.value)}
      />

      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center border-2 transition-all duration-(--duration-fast) ease-(--ease-snappy)",
          "peer-focus-visible:ring-2 peer-focus-visible:ring-(--primary-main) peer-focus-visible:ring-offset-2",
          indicatorSizeClass[size],
          multiple ? "rounded-(--radius-sm)" : "rounded-full",
          error
            ? "border-(--color-error)"
            : "border-(--input-border) group-hover:border-(--neutral-400)",
          isDisabled && "border-(--neutral-300) bg-(--bg-disabled) opacity-50",
          selected &&
            (multiple
              ? "border-(--primary-main) bg-(--primary-main)"
              : "border-(--primary-main)"),
          isDisabled && selected && (multiple ? "bg-(--neutral-400)" : ""),
        )}
        aria-hidden="true"
      >
        {multiple ? (
          selected && <Check size={14} className="text-white" />
        ) : (
          <span
            className={cn(
              "h-2 w-2 rounded-full transition-all duration-(--duration-fast) ease-(--ease-snappy)",
              selected ? "bg-(--primary-main)" : "bg-transparent",
              isDisabled && selected && "bg-(--neutral-400)",
            )}
          />
        )}
      </span>

      <span
        className={cn(
          labelSizeClass[size],
          "text-(--text-primary) leading-snug",
          isDisabled && "text-(--text-disabled)",
        )}
      >
        {option.label}
      </span>
    </label>
  );
}
