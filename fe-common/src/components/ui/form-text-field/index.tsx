/**
 * FormTextField — thin react-hook-form wrapper around Input.
 *
 * Zero runtime dependency on react-hook-form from this library's side.
 * The consuming app must have react-hook-form installed.
 *
 * Usage inside a <FormProvider>:
 *   <FormTextField<LoginSchema> name="email" label="Email" />
 *
 * Or with an explicit control prop (no FormProvider needed):
 *   <FormTextField name="email" control={control} label="Email" />
 */

import * as React from "react";
import {
  useController,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { Input, type InputProps } from "../input";

// ---------------------------------------------------------------------------

export interface FormTextFieldProps<T extends FieldValues = FieldValues>
  extends Omit<
    InputProps,
    "name" | "error" | "errorMessage" | "value" | "onChange" | "onBlur"
  > {
  name: Path<T>;
  /**
   * Pass explicitly, or omit when inside a <FormProvider>.
   */
  control?: Control<T>;
}

export function FormTextField<T extends FieldValues = FieldValues>({
  name,
  control: controlProp,
  ...inputProps
}: FormTextFieldProps<T>) {
  const contextControl = controlProp == null ? useFormContext().control : null;
  const control = (controlProp ?? contextControl) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <Input
      {...inputProps}
      name={field.name}
      value={(field.value as string) ?? ""}
      onChange={field.onChange}
      onBlur={field.onBlur}
      ref={field.ref}
      error={Boolean(error)}
      errorMessage={error?.message}
    />
  );
}

FormTextField.displayName = "FormTextField";
