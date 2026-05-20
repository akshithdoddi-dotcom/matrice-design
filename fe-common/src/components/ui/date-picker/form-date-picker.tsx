import {
  type Control,
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";

import { DatePicker, type DatePickerProps } from "./date-picker";

export interface FormDatePickerProps<T extends FieldValues> extends Omit<
  DatePickerProps,
  "value" | "onChange" | "error"
> {
  name: Path<T>;
  control?: Control<T>;
}

export function FormDatePicker<T extends FieldValues>({
  name,
  control: controlProp,
  ...pickerProps
}: FormDatePickerProps<T>) {
  const formContext = useFormContext<T>();
  const control = (controlProp ?? formContext?.control) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <DatePicker
      {...pickerProps}
      value={(field.value as Date | null) ?? null}
      onChange={(next) => field.onChange(next)}
      error={error?.message}
    />
  );
}

FormDatePicker.displayName = "FormDatePicker";
