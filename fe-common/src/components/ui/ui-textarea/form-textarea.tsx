import React from "react";
import {
  type Control,
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";

import { TextArea, type TextAreaProps } from "./textarea";

export interface FormTextAreaProps<
  T extends FieldValues = FieldValues,
> extends Omit<
  TextAreaProps,
  "name" | "error" | "value" | "onChange" | "onBlur"
> {
  name: Path<T>;
  control?: Control<T>;
}

export function FormTextArea<T extends FieldValues = FieldValues>({
  name,
  control: controlProp,
  ...textareaProps
}: FormTextAreaProps<T>) {
  const formContext = useFormContext<T>();
  const control = (controlProp ?? formContext?.control) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TextArea
      {...textareaProps}
      name={field.name}
      value={(field.value as string) ?? ""}
      onChange={field.onChange as React.ChangeEventHandler<HTMLTextAreaElement>}
      onBlur={field.onBlur}
      ref={field.ref}
      error={error?.message}
    />
  );
}

FormTextArea.displayName = "FormTextArea";
