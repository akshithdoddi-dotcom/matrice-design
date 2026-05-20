import {
  useController,
  useFormContext,
  type Control,
  type FieldValues,
  type Path,
} from "react-hook-form";
import { ChoiceGroup, type ChoiceGroupProps } from "./choice-group";

export interface FormChoiceGroupProps<
  T extends FieldValues,
  V extends string | number = string,
> extends Omit<ChoiceGroupProps<V>, "value" | "onChange" | "error"> {
  name: Path<T>;
  control?: Control<T>;
}

export function FormChoiceGroup<
  T extends FieldValues,
  V extends string | number = string,
>({
  name,
  control: controlProp,
  multiple = false,
  ...choiceGroupProps
}: FormChoiceGroupProps<T, V>) {
  const contextControl = controlProp == null ? useFormContext().control : null;
  const control = (controlProp ?? contextControl) as Control;

  const {
    field,
    fieldState: { error },
  } = useController({ name, control });

  const resolvedValue = multiple
    ? (Array.isArray(field.value) ? (field.value as V[]) : [])
    : ((field.value as V | undefined) ?? undefined);

  return (
    <ChoiceGroup<V>
      {...choiceGroupProps}
      multiple={multiple}
      value={resolvedValue}
      onChange={(next) => field.onChange(next)}
      error={error?.message}
    />
  );
}
