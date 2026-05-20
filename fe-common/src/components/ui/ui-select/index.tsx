import {
  Check,
  ChevronDown,
  Loader2,
  Minus,
  Plus,
  Search,
  X,
} from "lucide-react";

import * as React from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";

import * as Popover from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

export type OptionValue = string | number;

export interface Option {
  label: string;
  value: OptionValue;
  disabled?: boolean;
}

export interface SelectBaseProps {
  options: Option[];
  label?: string;
  placeholder?: string;
  disabled?: boolean;
  error?: boolean;
  errorMessage?: string;
  helperText?: string;
  required?: boolean;
  searchable?: boolean;
  clearable?: boolean;
  creatable?: boolean;
  loading?: boolean;
  size?: "sm" | "default";
  className?: string;
}

export interface SingleSelectProps extends SelectBaseProps {
  multiple?: false;
  value?: OptionValue | null;
  onChange?: (value: OptionValue | null) => void;
}

export interface MultiSelectProps extends SelectBaseProps {
  multiple: true;
  value?: OptionValue[];
  onChange?: (value: OptionValue[]) => void;
  maxDisplay?: number;
  selectAll?: boolean;
  selectAllLabel?: string;
}

export type SelectProps = SingleSelectProps | MultiSelectProps;

type ListItem =
  | { type: "selectAll" }
  | { type: "option"; option: Option }
  | { type: "create"; label: string; value: string };

const DEFAULT_PLACEHOLDER = "Select...";
const DEFAULT_SEARCH_PLACEHOLDER = "Search...";
const DEFAULT_SELECT_ALL_LABEL = "Select All";

function toValueKey(value: OptionValue): string {
  return `${typeof value}:${String(value)}`;
}

function normalizeSearch(value: string): string {
  return value.trim().toLowerCase();
}

export const Select = React.forwardRef<HTMLButtonElement, SelectProps>(
  (
    {
      options,
      label,
      placeholder = DEFAULT_PLACEHOLDER,
      disabled = false,
      error = false,
      errorMessage,
      helperText,
      required = false,
      searchable = true,
      clearable = false,
      creatable = false,
      loading = false,
      size = "default",
      className,
      ...rest
    },
    ref,
  ) => {
    const isMulti = rest.multiple === true;
    const multiProps = isMulti
      ? (rest as {
          value?: OptionValue[];
          onChange?: (value: OptionValue[]) => void;
          maxDisplay?: number;
          selectAll?: boolean;
          selectAllLabel?: string;
        })
      : null;
    const singleProps = !isMulti
      ? (rest as {
          value?: OptionValue | null;
          onChange?: (value: OptionValue | null) => void;
        })
      : null;
    const helperId = React.useId();
    const listboxId = React.useId();
    const [open, setOpen] = React.useState(false);
    const [query, setQuery] = React.useState("");
    const [highlightedIndex, setHighlightedIndex] = React.useState<number>(-1);
    const [createdOptions, setCreatedOptions] = React.useState<Option[]>([]);
    const searchInputRef = React.useRef<HTMLInputElement>(null);

    React.useEffect(() => {
      if (open && searchable) {
        searchInputRef.current?.focus();
      }
    }, [open, searchable]);

    const mergedOptions = React.useMemo(() => {
      const known = new Set(options.map((item) => toValueKey(item.value)));
      const custom = createdOptions.filter(
        (item) => !known.has(toValueKey(item.value)),
      );
      return [...options, ...custom];
    }, [options, createdOptions]);

    const selectedValues = isMulti
      ? Array.isArray(multiProps?.value)
        ? multiProps.value
        : []
      : [];
    const selectedSingle = !isMulti ? (singleProps?.value ?? null) : null;

    const selectedSet = React.useMemo(
      () => new Set(selectedValues.map((value) => toValueKey(value))),
      [selectedValues],
    );

    const selectedSingleKey =
      selectedSingle === null ? null : toValueKey(selectedSingle);

    const selectedOptions = React.useMemo(() => {
      if (isMulti) {
        return mergedOptions.filter((item) =>
          selectedSet.has(toValueKey(item.value)),
        );
      }

      if (selectedSingleKey == null) {
        return [];
      }

      const match = mergedOptions.find(
        (item) => toValueKey(item.value) === selectedSingleKey,
      );
      return match ? [match] : [];
    }, [isMulti, mergedOptions, selectedSet, selectedSingleKey]);

    const normalizedQuery = normalizeSearch(query);
    const filteredOptions = React.useMemo(() => {
      if (!searchable || normalizedQuery.length === 0) {
        return mergedOptions;
      }

      return mergedOptions.filter((item) =>
        item.label.toLowerCase().includes(normalizedQuery),
      );
    }, [searchable, normalizedQuery, mergedOptions]);

    const showCreateOption =
      creatable &&
      normalizedQuery.length > 0 &&
      !mergedOptions.some(
        (item) => normalizeSearch(item.label) === normalizedQuery,
      );

    const allEnabledOptions = React.useMemo(
      () => mergedOptions.filter((item) => !item.disabled),
      [mergedOptions],
    );

    const selectedEnabledCount = React.useMemo(() => {
      if (!isMulti) {
        return 0;
      }

      return allEnabledOptions.filter((item) =>
        selectedSet.has(toValueKey(item.value)),
      ).length;
    }, [isMulti, allEnabledOptions, selectedSet]);

    const allSelected =
      isMulti &&
      allEnabledOptions.length > 0 &&
      selectedEnabledCount === allEnabledOptions.length;
    const partiallySelected =
      isMulti &&
      selectedEnabledCount > 0 &&
      selectedEnabledCount < allEnabledOptions.length;

    const listItems = React.useMemo<ListItem[]>(() => {
      const items: ListItem[] = [];
      if (isMulti && multiProps?.selectAll) {
        items.push({ type: "selectAll" });
      }

      for (const option of filteredOptions) {
        items.push({ type: "option", option });
      }

      if (showCreateOption) {
        items.push({
          type: "create",
          label: query.trim(),
          value: query.trim(),
        });
      }

      return items;
    }, [
      isMulti,
      multiProps?.selectAll,
      filteredOptions,
      showCreateOption,
      query,
    ]);

    const actionableIndexes = React.useMemo(() => {
      return listItems.reduce<number[]>((acc, item, index) => {
        if (item.type === "option" && item.option.disabled) {
          return acc;
        }
        acc.push(index);
        return acc;
      }, []);
    }, [listItems]);

    React.useEffect(() => {
      if (!open) {
        setHighlightedIndex(-1);
        return;
      }

      if (actionableIndexes.length === 0) {
        setHighlightedIndex(-1);
        return;
      }

      setHighlightedIndex((current) =>
        actionableIndexes.includes(current) ? current : actionableIndexes[0],
      );
    }, [open, actionableIndexes]);

    const moveHighlight = React.useCallback(
      (direction: 1 | -1) => {
        if (actionableIndexes.length === 0) {
          return;
        }

        const currentPosition = actionableIndexes.indexOf(highlightedIndex);
        const start = currentPosition === -1 ? 0 : currentPosition;
        const nextPosition =
          (start + direction + actionableIndexes.length) %
          actionableIndexes.length;
        setHighlightedIndex(actionableIndexes[nextPosition]);
      },
      [actionableIndexes, highlightedIndex],
    );

    const triggerChange = React.useCallback(
      (next: OptionValue | null | OptionValue[]) => {
        if (isMulti) {
          multiProps?.onChange?.(Array.isArray(next) ? next : []);
          return;
        }

        singleProps?.onChange?.(
          Array.isArray(next) ? null : (next as OptionValue | null),
        );
      },
      [isMulti, multiProps, singleProps],
    );

    const toggleOption = React.useCallback(
      (option: Option) => {
        if (option.disabled) {
          return;
        }

        if (isMulti) {
          const key = toValueKey(option.value);
          const exists = selectedSet.has(key);
          const next = exists
            ? selectedValues.filter((value) => toValueKey(value) !== key)
            : [...selectedValues, option.value];
          triggerChange(next);
          return;
        }

        triggerChange(option.value);
        setOpen(false);
      },
      [isMulti, selectedSet, selectedValues, triggerChange],
    );

    const handleSelectAll = React.useCallback(() => {
      if (!isMulti) {
        return;
      }

      if (allSelected) {
        triggerChange([]);
        return;
      }

      triggerChange(allEnabledOptions.map((item) => item.value));
    }, [isMulti, allSelected, allEnabledOptions, triggerChange]);

    const handleCreate = React.useCallback(() => {
      const nextValue = query.trim();
      if (!nextValue) {
        return;
      }

      const existing = mergedOptions.find(
        (item) => normalizeSearch(item.label) === normalizeSearch(nextValue),
      );
      const created: Option = existing ?? {
        label: nextValue,
        value: nextValue,
      };

      if (!existing) {
        setCreatedOptions((prev) => [...prev, created]);
      }

      if (isMulti) {
        if (!selectedSet.has(toValueKey(created.value))) {
          triggerChange([...selectedValues, created.value]);
        }
      } else {
        triggerChange(created.value);
        setOpen(false);
      }

      setQuery("");
    }, [
      query,
      mergedOptions,
      isMulti,
      selectedSet,
      selectedValues,
      triggerChange,
    ]);

    const clearSelection = React.useCallback(
      (event: React.SyntheticEvent) => {
        event.preventDefault();
        event.stopPropagation();
        triggerChange(isMulti ? [] : null);
      },
      [isMulti, triggerChange],
    );

    const removeChip = React.useCallback(
      (value: OptionValue) => {
        if (!isMulti) {
          return;
        }

        const key = toValueKey(value);
        triggerChange(
          selectedValues.filter((item) => toValueKey(item) !== key),
        );
      },
      [isMulti, selectedValues, triggerChange],
    );

    const hasValue = isMulti
      ? selectedValues.length > 0
      : selectedSingle !== null;
    const hasError = error || Boolean(errorMessage);
    const helperContent = hasError ? (errorMessage ?? helperText) : helperText;
    const maxDisplay = isMulti ? (multiProps?.maxDisplay ?? 3) : 0;

    const handleSelectFromHighlighted = React.useCallback(() => {
      if (highlightedIndex < 0) {
        return;
      }

      const item = listItems[highlightedIndex];
      if (!item) {
        return;
      }

      if (item.type === "selectAll") {
        handleSelectAll();
        return;
      }

      if (item.type === "create") {
        handleCreate();
        return;
      }

      toggleOption(item.option);
    }, [
      highlightedIndex,
      listItems,
      handleSelectAll,
      handleCreate,
      toggleOption,
    ]);

    const onSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveHighlight(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveHighlight(-1);
          break;
        case "Enter":
          event.preventDefault();
          handleSelectFromHighlighted();
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
        case "Tab":
          setOpen(false);
          break;
        case "Backspace":
          if (isMulti && query.length === 0 && selectedValues.length > 0) {
            const next = [...selectedValues];
            next.pop();
            triggerChange(next);
          }
          break;
        default:
          break;
      }
    };

    const onPopoverKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (searchable) {
        return;
      }

      switch (event.key) {
        case "ArrowDown":
          event.preventDefault();
          moveHighlight(1);
          break;
        case "ArrowUp":
          event.preventDefault();
          moveHighlight(-1);
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          handleSelectFromHighlighted();
          break;
        case "Escape":
          event.preventDefault();
          setOpen(false);
          break;
        case "Tab":
          setOpen(false);
          break;
        default:
          break;
      }
    };

    return (
      <div className="mui-input-root">
        {label && (
          <label className="mui-input-label">
            {label}
            {required && (
              <span className="mui-input-required-star" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <Popover.Root
          open={open}
          onOpenChange={(next) => !disabled && setOpen(next)}
        >
          <Popover.Trigger asChild>
            <button
              ref={ref}
              type="button"
              disabled={disabled}
              aria-haspopup="listbox"
              aria-expanded={open}
              aria-controls={listboxId}
              aria-invalid={hasError || undefined}
              aria-describedby={helperContent ? helperId : undefined}
              data-open={open ? "true" : "false"}
              data-error={hasError ? "true" : "false"}
              data-multiple={isMulti ? "true" : "false"}
              data-size={size}
              className={cn("mui-select-trigger", className)}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown" || event.key === "ArrowUp") {
                  event.preventDefault();
                  setOpen(true);
                }
                if ((event.key === "Enter" || event.key === " ") && !open) {
                  event.preventDefault();
                  setOpen(true);
                }
              }}
            >
              <div className="mui-select-value-wrap">
                {isMulti ? (
                  selectedOptions.length > 0 ? (
                    <>
                      {selectedOptions.slice(0, maxDisplay).map((item) => (
                        <span
                          key={toValueKey(item.value)}
                          className="mui-select-chip"
                        >
                          <span className="truncate">{item.label}</span>
                          <span
                            role="button"
                            tabIndex={0}
                            aria-label={`Remove ${item.label}`}
                            className="mui-select-chip-remove"
                            onClick={(event) => {
                              event.preventDefault();
                              event.stopPropagation();
                              removeChip(item.value);
                            }}
                            onKeyDown={(event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                event.stopPropagation();
                                removeChip(item.value);
                              }
                            }}
                          >
                            <X size={8} />
                          </span>
                        </span>
                      ))}
                      {selectedOptions.length > maxDisplay && (
                        <span className="mui-select-chip-more">
                          +{selectedOptions.length - maxDisplay} more
                        </span>
                      )}
                    </>
                  ) : (
                    <span className="mui-select-placeholder">
                      {placeholder}
                    </span>
                  )
                ) : selectedOptions[0] ? (
                  <span className="truncate">{selectedOptions[0].label}</span>
                ) : (
                  <span className="mui-select-placeholder">{placeholder}</span>
                )}
              </div>

              <div className="mui-select-actions">
                {clearable && hasValue && !disabled && (
                  <span
                    role="button"
                    tabIndex={0}
                    aria-label="Clear selection"
                    className="mui-select-icon-button"
                    onClick={clearSelection}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        clearSelection(e);
                      }
                    }}
                  >
                    <X size={14} />
                  </span>
                )}

                {loading ? (
                  <Loader2 size={14} className="mui-select-spinner" />
                ) : (
                  <ChevronDown
                    size={14}
                    className={cn(
                      "mui-select-chevron",
                      open && "mui-select-chevron-open",
                    )}
                  />
                )}
              </div>
            </button>
          </Popover.Trigger>

          <Popover.Content
            sideOffset={6}
            align="start"
            className="mui-select-popover"
            onOpenAutoFocus={(event) => {
              if (searchable) {
                event.preventDefault();
              }
            }}
            onKeyDown={onPopoverKeyDown}
          >
            {searchable && (
              <div className="mui-select-search-wrap">
                <div className="mui-select-search-inner">
                  <Search size={14} className="mui-select-search-icon" />
                  <input
                    ref={searchInputRef}
                    value={query}
                    placeholder={DEFAULT_SEARCH_PLACEHOLDER}
                    className="mui-select-search-input"
                    onChange={(event) => setQuery(event.target.value)}
                    onKeyDown={onSearchKeyDown}
                  />
                </div>
              </div>
            )}

            <div id={listboxId} role="listbox" className="mui-select-list">
              {loading ? (
                <div className="mui-select-state-row">
                  <Loader2 size={14} className="mui-select-spinner" />
                  <span>Loading...</span>
                </div>
              ) : listItems.length === 0 ? (
                <p className="mui-select-empty-state">No options found</p>
              ) : (
                listItems.map((item, index) => {
                  if (item.type === "selectAll") {
                    return (
                      <div key="select-all">
                        <button
                          type="button"
                          className="mui-select-option"
                          data-highlighted={
                            highlightedIndex === index ? "true" : "false"
                          }
                          onMouseEnter={() => setHighlightedIndex(index)}
                          onClick={handleSelectAll}
                        >
                          <span
                            className="mui-select-checkbox"
                            data-checked={allSelected ? "true" : "false"}
                          >
                            {allSelected ? (
                              <Check size={12} />
                            ) : partiallySelected ? (
                              <Minus size={12} />
                            ) : null}
                          </span>
                          <span>
                            {multiProps?.selectAllLabel ??
                              DEFAULT_SELECT_ALL_LABEL}
                          </span>
                        </button>
                        <div className="mui-select-divider" />
                      </div>
                    );
                  }

                  if (item.type === "create") {
                    return (
                      <button
                        key={`create-${item.value}`}
                        type="button"
                        className="mui-select-option mui-select-option-create"
                        data-highlighted={
                          highlightedIndex === index ? "true" : "false"
                        }
                        onMouseEnter={() => setHighlightedIndex(index)}
                        onClick={handleCreate}
                      >
                        <Plus size={14} />
                        <span>Create "{item.label}"</span>
                      </button>
                    );
                  }

                  const option = item.option;
                  const valueKey = toValueKey(option.value);
                  const selected = isMulti
                    ? selectedSet.has(valueKey)
                    : selectedSingleKey === valueKey;

                  return (
                    <button
                      key={valueKey}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      disabled={option.disabled}
                      className="mui-select-option"
                      data-selected={selected ? "true" : "false"}
                      data-disabled={option.disabled ? "true" : "false"}
                      data-highlighted={
                        highlightedIndex === index ? "true" : "false"
                      }
                      data-multiple={isMulti ? "true" : "false"}
                      onMouseEnter={() =>
                        !option.disabled && setHighlightedIndex(index)
                      }
                      onClick={() => toggleOption(option)}
                    >
                      {isMulti ? (
                        <>
                          <span
                            className="mui-select-checkbox"
                            data-checked={selected ? "true" : "false"}
                          >
                            {selected && <Check size={12} />}
                          </span>
                          <span className="truncate">{option.label}</span>
                        </>
                      ) : (
                        <>
                          <span className="truncate">{option.label}</span>
                          {selected && <Check size={14} className="ml-auto" />}
                        </>
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </Popover.Content>
        </Popover.Root>

        {helperContent && (
          <p
            id={helperId}
            className={
              hasError ? "mui-input-error-text" : "mui-input-helper-text"
            }
            role={hasError ? "alert" : undefined}
          >
            {helperContent}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = "Select";

export interface FormSelectProps<
  T extends FieldValues = FieldValues,
> extends Omit<SelectProps, "value" | "onChange" | "error" | "errorMessage"> {
  name: Path<T>;
  control?: Control<T>;
}

export function FormSelect<T extends FieldValues = FieldValues>({
  name,
  control: controlProp,
  ...selectProps
}: FormSelectProps<T>) {
  const formContext = useFormContext<T>();
  const control = (controlProp ?? formContext?.control) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  if (selectProps.multiple) {
    const props = selectProps as Omit<
      MultiSelectProps,
      "value" | "onChange" | "error" | "errorMessage"
    >;
    return (
      <Select
        {...props}
        multiple
        value={Array.isArray(field.value) ? (field.value as OptionValue[]) : []}
        onChange={(value) => field.onChange(value)}
        error={Boolean(error)}
        errorMessage={error?.message}
      />
    );
  }

  const singleValue =
    field.value === undefined || field.value === ""
      ? null
      : (field.value as OptionValue | null);
  const props = selectProps as Omit<
    SingleSelectProps,
    "value" | "onChange" | "error" | "errorMessage"
  >;

  return (
    <Select
      {...props}
      multiple={false}
      value={singleValue}
      onChange={(value) => field.onChange(value)}
      error={Boolean(error)}
      errorMessage={error?.message}
    />
  );
}

FormSelect.displayName = "FormSelect";
