import * as React from "react";

import { chartTheme } from "./ChartTheme";
import type { TooltipConfig } from "./types";

interface DefaultTooltipProps {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    color: string;
    dataKey: string;
  }>;
  label?: string | number;
  config?: TooltipConfig;
}

export function ChartTooltip({
  active,
  payload,
  label,
  config,
}: DefaultTooltipProps) {
  if (!active || !payload?.length) return null;

  const formattedLabel = config?.labelFormatter
    ? config.labelFormatter(label)
    : label;

  return (
    <div style={chartTheme.tooltip}>
      {formattedLabel != null && (
        <p
          style={{
            margin: 0,
            marginBottom: 4,
            fontWeight: 500,
            color: "var(--chart-text)",
            fontSize: 13,
          }}
        >
          {formattedLabel}
        </p>
      )}
      {payload.map((entry) => (
        <div
          key={entry.dataKey ?? entry.name}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            marginTop: 2,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: entry.color,
              flexShrink: 0,
            }}
          />
          <span style={{ color: "var(--chart-text-muted)", fontSize: 12 }}>
            {entry.name}:
          </span>
          <span
            style={{
              color: "var(--chart-text)",
              fontWeight: 500,
              fontSize: 12,
            }}
          >
            {config?.valueFormatter
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                config.valueFormatter(entry.value, entry.name as any)
              : typeof entry.value === "number" &&
                  !Number.isInteger(entry.value)
                ? entry.value.toFixed(2)
                : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
}
