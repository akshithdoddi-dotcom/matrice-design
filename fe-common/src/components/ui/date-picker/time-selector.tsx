import dayjs from "dayjs";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  type DateValue,
  clampDate,
  normalizeDate,
  parseHourFromDisplay,
  setTimeParts,
  toHourDisplay,
} from "./utils";

interface TimeSelectorProps {
  value: DateValue | undefined;
  onChange: (value: Date) => void;
  minTime?: DateValue;
  maxTime?: DateValue;
  ampm?: boolean;
  minuteStep?: number;
}

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => i + start);
}

export function TimeSelector({
  value,
  onChange,
  minTime,
  maxTime,
  ampm = true,
  minuteStep = 1,
}: TimeSelectorProps) {
  const normalized = normalizeDate(value) ?? dayjs();
  const hour24 = normalized.hour();
  const minute = normalized.minute();
  const meridiem: "AM" | "PM" = hour24 >= 12 ? "PM" : "AM";
  const displayHour = toHourDisplay(hour24, ampm);

  const hourItems = ampm ? range(1, 12) : range(0, 23);
  const minuteItems = Array.from(
    { length: Math.ceil(60 / Math.max(1, minuteStep)) },
    (_, i) => i * Math.max(1, minuteStep),
  ).filter((v) => v < 60);

  const apply = (
    nextHourDisplay: number,
    nextMinute: number,
    nextMeridiem: "AM" | "PM",
  ) => {
    const hourBase = parseHourFromDisplay(nextHourDisplay, ampm);
    const next = setTimeParts(
      normalized,
      hourBase,
      nextMinute,
      ampm,
      nextMeridiem,
    );
    const clamped = clampDate(next, minTime, maxTime);
    onChange(clamped.toDate());
  };

  return (
    <div className="flex items-start gap-2">
      <div className="h-[200px] w-[64px] overflow-y-auto rounded-(--radius-sm) border border-(--border-color) p-1">
        {hourItems.map((item) => {
          const selected = item === displayHour;
          return (
            <button
              key={item}
              type="button"
              className={cn(
                "w-full rounded-(--radius-sm) px-3 py-1.5 text-center text-sm transition-all duration-(--duration-fast) ease-(--ease-snappy)",
                selected
                  ? "bg-(--primary-main) text-white"
                  : "text-(--text-primary) hover:bg-(--bg-hover)",
              )}
              onClick={() => apply(item, minute, meridiem)}
            >
              {String(item).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      <div className="pt-2 text-sm font-semibold text-(--text-muted)">:</div>

      <div className="h-[200px] w-[64px] overflow-y-auto rounded-(--radius-sm) border border-(--border-color) p-1">
        {minuteItems.map((item) => {
          const selected = item === minute;
          return (
            <button
              key={item}
              type="button"
              className={cn(
                "w-full rounded-(--radius-sm) px-3 py-1.5 text-center text-sm transition-all duration-(--duration-fast) ease-(--ease-snappy)",
                selected
                  ? "bg-(--primary-main) text-white"
                  : "text-(--text-primary) hover:bg-(--bg-hover)",
              )}
              onClick={() => apply(displayHour, item, meridiem)}
            >
              {String(item).padStart(2, "0")}
            </button>
          );
        })}
      </div>

      {ampm && (
        <div className="flex h-[200px] w-[70px] flex-col rounded-(--radius-sm) border border-(--border-color) p-1">
          {(["AM", "PM"] as const).map((period) => {
            const selected = period === meridiem;
            return (
              <button
                key={period}
                type="button"
                className={cn(
                  "flex-1 rounded-(--radius-sm) text-sm transition-all duration-(--duration-fast) ease-(--ease-snappy)",
                  selected
                    ? "bg-(--primary-main) text-white"
                    : "text-(--text-muted) hover:bg-(--bg-hover)",
                )}
                onClick={() => apply(displayHour, minute, period)}
              >
                {period}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
