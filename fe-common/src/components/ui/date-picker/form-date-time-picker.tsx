import {
  type Control,
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";

import { DateTimePicker, type DateTimePickerProps } from "./date-time-picker";

export interface FormDateTimePickerProps<T extends FieldValues> extends Omit<
  DateTimePickerProps,
  "value" | "onChange" | "error"
> {
  name: Path<T>;
  control?: Control<T>;
}

export function FormDateTimePicker<T extends FieldValues>({
  name,
  control: controlProp,
  ...pickerProps
}: FormDateTimePickerProps<T>) {
  const formContext = useFormContext<T>();
  const control = (controlProp ?? formContext?.control) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <DateTimePicker
      {...pickerProps}
      value={(field.value as Date | null) ?? null}
      onChange={(next) => field.onChange(next)}
      error={error?.message}
    />
  );
}

FormDateTimePicker.displayName = "FormDateTimePicker";
