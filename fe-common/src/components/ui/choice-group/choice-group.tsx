import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { ChoiceItem, type ChoiceOption } from "./choice-item";

export const choiceGroupVariants = cva("flex", {
  variants: {
    orientation: {
      vertical: "flex-col gap-(--space-2)",
      horizontal: "flex-row flex-wrap gap-(--space-4)",
    },
    size: {
      sm: "",
      default: "",
      lg: "",
    },
  },
  defaultVariants: {
    orientation: "vertical",
    size: "default",
  },
});

export interface ChoiceGroupProps<V extends string | number = string>
  extends VariantProps<typeof choiceGroupVariants> {
  options: ChoiceOption<V>[];
  value?: V | V[];
  onChange?: (value: V | V[]) => void;
  multiple?: boolean;
  label?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  renderOption?: (
    option: ChoiceOption<V>,
    state: { isSelected: boolean; isDisabled: boolean },
    onClick: () => void,
  ) => React.ReactElement;
  columns?: number;
  className?: string;
}

export function ChoiceGroup<V extends string | number = string>({
  options,
  value,
  onChange,
  multiple = false,
  label,
  error,
  helperText,
  disabled = false,
  renderOption,
  columns,
  orientation,
  size,
  className,
}: ChoiceGroupProps<V>) {
  const generatedName = React.useId();
  const helperId = React.useId();

  const selectedValues = React.useMemo(() => {
    if (multiple) {
      return Array.isArray(value) ? value : [];
    }
    return value === undefined ? [] : [value as V];
  }, [multiple, value]);

  const isSelected = React.useCallback(
    (optionValue: V) => selectedValues.some((item) => item === optionValue),
    [selectedValues],
  );

  const handleSelect = React.useCallback(
    (optionValue: V) => {
      if (multiple) {
        const selected = selectedValues.includes(optionValue);
        const next = selected
          ? selectedValues.filter((item) => item !== optionValue)
          : [...selectedValues, optionValue];
        onChange?.(next as V[]);
        return;
      }

      onChange?.(optionValue);
    },
    [multiple, onChange, selectedValues],
  );

  const hasMessage = Boolean(error || helperText);
  const description = error ?? helperText;

  return (
    <fieldset
      className={cn("m-0 border-0 p-0", className)}
      aria-invalid={Boolean(error) || undefined}
      aria-describedby={hasMessage ? helperId : undefined}
    >
      {label && (
        <legend className="mb-(--space-2) text-sm font-medium text-(--text-primary)">
          {label}
        </legend>
      )}

      <div
        className={cn(
          renderOption
            ? "grid gap-(--space-2)"
            : choiceGroupVariants({ orientation, size }),
        )}
        style={renderOption && columns ? { gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` } : undefined}
      >
        {options.map((option, index) => (
          <ChoiceItem
            key={`${String(option.value)}-${index}`}
            option={option}
            index={index}
            name={generatedName}
            multiple={multiple}
            selected={isSelected(option.value)}
            disabled={disabled}
            error={error}
            size={size ?? "default"}
            renderOption={renderOption}
            onSelect={handleSelect}
          />
        ))}
      </div>

      {description && (
        <p
          id={helperId}
          className={cn(
            "mt-(--space-1) text-xs",
            error ? "text-(--color-error)" : "text-(--text-muted)",
          )}
        >
          {description}
        </p>
      )}
    </fieldset>
  );
}
