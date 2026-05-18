import {
  type Control,
  type FieldValues,
  type Path,
  useController,
  useFormContext,
} from "react-hook-form";

import { TimePicker, type TimePickerProps } from "./time-picker";

export interface FormTimePickerProps<T extends FieldValues> extends Omit<
  TimePickerProps,
  "value" | "onChange" | "error"
> {
  name: Path<T>;
  control?: Control<T>;
}

export function FormTimePicker<T extends FieldValues>({
  name,
  control: controlProp,
  ...pickerProps
}: FormTimePickerProps<T>) {
  const formContext = useFormContext<T>();
  const control = (controlProp ?? formContext?.control) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  return (
    <TimePicker
      {...pickerProps}
      value={(field.value as Date | null) ?? null}
      onChange={(next) => field.onChange(next)}
      error={error?.message}
    />
  );
}

FormTimePicker.displayName = "FormTimePicker";
