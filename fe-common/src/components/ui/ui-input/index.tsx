import { Eye, EyeOff } from "lucide-react";

import * as React from "react";

import { cn } from "../../../lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  helperText?: string;
  error?: boolean;
  errorMessage?: string;
  required?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  inputSize?: "default" | "sm" | "lg";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      id: idProp,
      label,
      helperText,
      error = false,
      errorMessage,
      required = false,
      startIcon,
      endIcon,
      inputSize = "default",
      type = "text",
      disabled,
      className,
      ...props
    },
    ref,
  ) => {
    const generatedId = React.useId();
    const id = idProp ?? generatedId;
    const helperId = `${id}-helper`;

    const [showPassword, setShowPassword] = React.useState(false);
    const isPassword = type === "password";
    const resolvedType = isPassword
      ? showPassword
        ? "text"
        : "password"
      : type;

    const hasError = error || Boolean(errorMessage);
    const helperContent = hasError ? (errorMessage ?? helperText) : helperText;

    const sizeClass =
      inputSize === "sm"
        ? "mui-input-field-sm"
        : inputSize === "lg"
          ? "mui-input-field-lg"
          : "";

    const hasEndAdornment = isPassword || Boolean(endIcon);

    const fieldClassName = cn(
      "mui-input-field",
      sizeClass,
      startIcon && "mui-has-start-icon",
      hasEndAdornment && "mui-has-end-icon",
      className,
    );

    return (
      <div className="mui-input-root">
        {label && (
          <label htmlFor={id} className="mui-input-label">
            {label}
            {required && (
              <span className="mui-input-required-star" aria-hidden="true">
                *
              </span>
            )}
          </label>
        )}

        <div style={{ position: "relative" }}>
          {startIcon && (
            <span
              className="mui-input-icon-adornment mui-input-icon-adornment-start"
              aria-hidden="true"
            >
              {startIcon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            type={resolvedType}
            disabled={disabled}
            required={required}
            aria-invalid={hasError || undefined}
            aria-describedby={helperContent ? helperId : undefined}
            aria-required={required || undefined}
            className={fieldClassName}
            {...props}
          />

          {isPassword ? (
            <button
              type="button"
              className="mui-input-password-toggle"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((v) => !v)}
              tabIndex={-1}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          ) : endIcon ? (
            <span
              className="mui-input-icon-adornment mui-input-icon-adornment-end"
              aria-hidden="true"
            >
              {endIcon}
            </span>
          ) : null}
        </div>

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

Input.displayName = "Input";
