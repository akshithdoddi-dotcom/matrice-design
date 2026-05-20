import dayjs, { type Dayjs } from "dayjs";

export type DateValue = Date | Dayjs | null;

export function normalizeDate(value: DateValue | undefined): Dayjs | null {
  if (value == null) {
    return null;
  }
  const date = dayjs(value);
  return date.isValid() ? date : null;
}

export function toDate(value: Dayjs | null): Date | null {
  return value ? value.toDate() : null;
}

export function formatDate(
  value: DateValue | undefined,
  displayFormat: string,
): string {
  const normalized = normalizeDate(value);
  return normalized ? normalized.format(displayFormat) : "";
}

export function clampDate(
  value: Dayjs,
  minDate?: DateValue,
  maxDate?: DateValue,
): Dayjs {
  const min = normalizeDate(minDate);
  const max = normalizeDate(maxDate);

  if (min && value.isBefore(min)) {
    return min;
  }
  if (max && value.isAfter(max)) {
    return max;
  }
  return value;
}

export function setTimeParts(
  value: Dayjs,
  hour: number,
  minute: number,
  ampm: boolean,
  meridiem: "AM" | "PM",
): Dayjs {
  let normalizedHour = hour;

  if (ampm) {
    if (meridiem === "PM" && hour < 12) {
      normalizedHour = hour + 12;
    }
    if (meridiem === "AM" && hour === 12) {
      normalizedHour = 0;
    }
  }

  return value.hour(normalizedHour).minute(minute).second(0).millisecond(0);
}

export function toHourDisplay(hour24: number, ampm: boolean): number {
  if (!ampm) {
    return hour24;
  }
  const value = hour24 % 12;
  return value === 0 ? 12 : value;
}

export function parseHourFromDisplay(
  displayHour: number,
  ampm: boolean,
): number {
  if (!ampm) {
    return displayHour;
  }
  if (displayHour === 12) {
    return 0;
  }
  return displayHour;
}

/**
 * Combined disabled-date predicate used by DatePicker and DateTimePicker.
 * Returns true if the date should be blocked (before min, after max, or
 * rejected by a caller-supplied `disableDate`).
 */
export function isDateDisabled(
  date: Date,
  minDate?: DateValue,
  maxDate?: DateValue,
  disableDate?: (date: Date) => boolean,
): boolean {
  if (disableDate?.(date)) {
    return true;
  }
  const min = normalizeDate(minDate);
  const max = normalizeDate(maxDate);
  if (min && dayjs(date).isBefore(min, "day")) {
    return true;
  }
  if (max && dayjs(date).isAfter(max, "day")) {
    return true;
  }
  return false;
}
