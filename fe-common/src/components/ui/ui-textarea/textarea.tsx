import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

import { TextAreaToolbar } from "./textarea-toolbar";

export const textareaVariants = cva(
  [
    "w-full rounded-(--radius-md) border bg-(--input-bg) px-3 py-2.5",
    "text-(--input-text) placeholder:text-(--input-placeholder)",
    "border-(--input-border)",
    "hover:border-(--primary-main)",
    "focus:outline-none focus:ring-2 focus:ring-(--primary-main) focus:border-(--primary-main)",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-(--bg-disabled)",
    "transition-all duration-(--duration-fast) ease-(--ease-snappy)",
    "resize-y",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "min-h-[100px] text-xs",
        default: "min-h-[160px] text-sm",
        lg: "min-h-[240px] text-base",
      },
    },
    defaultVariants: {
      size: "default",
    },
  },
);

export interface TextAreaProps
  extends
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "size">,
    VariantProps<typeof textareaVariants> {
  label?: string;
  helperText?: string;
  error?: string;
  showToolbar?: boolean;
  maxLength?: number;
}

function mergeRefs<T>(...refs: Array<React.Ref<T> | undefined>) {
  return (value: T) => {
    for (const ref of refs) {
      if (typeof ref === "function") {
        ref(value);
      } else if (ref && "current" in ref) {
        (ref as React.MutableRefObject<T>).current = value;
      }
    }
  };
}

function emitChange(
  textarea: HTMLTextAreaElement,
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>,
) {
  onChange?.({
    target: textarea,
    currentTarget: textarea,
  } as React.ChangeEvent<HTMLTextAreaElement>);
}

function insertTokenAtCursor(
  textarea: HTMLTextAreaElement,
  token: string,
  onChange?: React.ChangeEventHandler<HTMLTextAreaElement>,
) {
  const start = textarea.selectionStart ?? textarea.value.length;
  const value = textarea.value;
  const lineStart = value.lastIndexOf("\n", Math.max(0, start - 1)) + 1;
  const atLineStart = start === lineStart;
  const insertion = atLineStart ? token : `\n${token}`;

  textarea.setRangeText(insertion, start, start, "end");
  emitChange(textarea, onChange);
  textarea.focus();
}

function getListContinuationPrefix(line: string): string | null {
  if (line.startsWith("• ")) {
    return "• ";
  }

  let i = 0;
  while (i < line.length && line[i] >= "0" && line[i] <= "9") {
    i += 1;
  }
  if (i === 0 || line[i] !== "." || line[i + 1] !== " ") {
    return null;
  }
  const n = Number(line.slice(0, i));
  if (!Number.isFinite(n)) {
    return null;
  }
  return `${n + 1}. `;
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  (
    {
      id: idProp,
      label,
      helperText,
      error,
      showToolbar = false,
      maxLength,
      size,
      className,
      disabled,
      onChange,
      onKeyDown,
      value,
      defaultValue,
      required,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const helperId = `${id}-helper`;
    const internalRef = React.useRef<HTMLTextAreaElement>(null);
    const textareaRef = mergeRefs(ref, internalRef);
    const [uncontrolledValue, setUncontrolledValue] = React.useState<string>(
      typeof defaultValue === "string" ? defaultValue : "",
    );

    const currentValue = typeof value === "string" ? value : uncontrolledValue;
    const charCount = currentValue.length;
    const countError = maxLength != null && charCount > maxLength;

    return (
      <div className="input-root">
        {label && (
          <label htmlFor={id} className="input-label">
            {label}
            {required && (
              <span className="input-required-star" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        {showToolbar && (
          <TextAreaToolbar
            disabled={disabled}
            onInsertBullet={() => {
              if (internalRef.current) {
                insertTokenAtCursor(internalRef.current, "• ", onChange);
              }
            }}
            onInsertNumbered={() => {
              if (internalRef.current) {
                insertTokenAtCursor(internalRef.current, "1. ", onChange);
              }
            }}
          />
        )}

        <textarea
          ref={textareaRef}
          id={id}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={
            error || helperText || maxLength ? helperId : undefined
          }
          disabled={disabled}
          required={required}
          maxLength={maxLength}
          value={value}
          defaultValue={defaultValue}
          className={cn(
            textareaVariants({ size }),
            showToolbar && "rounded-t-none border-t-0",
            error &&
              "border-(--color-error) focus:border-(--color-error) focus:ring-(--color-error)",
            className,
          )}
          onKeyDown={(event) => {
            onKeyDown?.(event);
            if (event.defaultPrevented || event.key !== "Enter") {
              return;
            }

            const target = event.currentTarget;
            const cursor = target.selectionStart ?? target.value.length;
            const lineStart =
              target.value.lastIndexOf("\n", Math.max(0, cursor - 1)) + 1;
            const currentLine = target.value.slice(lineStart, cursor);
            const nextPrefix = getListContinuationPrefix(
              currentLine.trimStart(),
            );

            if (!nextPrefix) {
              return;
            }

            event.preventDefault();
            target.setRangeText(`\n${nextPrefix}`, cursor, cursor, "end");
            emitChange(target, onChange);
          }}
          onChange={(event) => {
            if (value === undefined) {
              setUncontrolledValue(event.target.value);
            }
            onChange?.(event);
          }}
          {...props}
        />

        {(error || helperText || maxLength != null) && (
          <div
            id={helperId}
            className="mt-1 flex items-start justify-between gap-3"
          >
            <p
              className={cn(
                error ? "input-error-text" : "input-helper-text",
                "m-0",
              )}
            >
              {error ?? helperText}
            </p>
            {maxLength != null && (
              <span
                className={cn(
                  "text-xs leading-normal",
                  countError ? "text-(--color-error)" : "text-(--text-muted)",
                )}
              >
                {charCount}/{maxLength}
              </span>
            )}
          </div>
        )}
      </div>
    );
  },
);

TextArea.displayName = "TextArea";
