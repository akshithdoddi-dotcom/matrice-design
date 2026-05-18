import dayjs from "dayjs";

import { chartTheme } from "./ChartTheme";
import type { GridConfig, LegendConfig, Margin } from "./types";

/**
 * Given the time range of data in ms, returns an appropriate tick formatter.
 */
export function autoTimeFormat(
  domainMs: number,
): (timestamp: number) => string {
  const ONE_HOUR = 3_600_000;
  const ONE_DAY = 86_400_000;
  const THIRTY_DAYS = 30 * ONE_DAY;
  const ONE_YEAR = 365 * ONE_DAY;

  if (domainMs < ONE_HOUR) {
    return (ts: number) => dayjs(ts).format("HH:mm:ss");
  }
  if (domainMs < ONE_DAY) {
    return (ts: number) => dayjs(ts).format("HH:mm");
  }
  if (domainMs < THIRTY_DAYS) {
    return (ts: number) => dayjs(ts).format("MMM DD");
  }
  if (domainMs < ONE_YEAR) {
    return (ts: number) => dayjs(ts).format("MMM YYYY");
  }
  return (ts: number) => dayjs(ts).format("YYYY");
}

/**
 * Resolves palette index to color, or passes through string colors.
 */
export function resolveColor(
  color: string | number,
  palette: readonly string[] = chartTheme.palette,
): string {
  if (typeof color === "number") {
    return palette[color % palette.length];
  }
  return color;
}

/**
 * Deep merges with chartTheme.defaultMargin.
 */
export function mergeMargin(custom?: Margin): Margin {
  return { ...chartTheme.defaultMargin, ...custom };
}

/**
 * Normalizes grid config union into CartesianGrid props or null.
 */
export function resolveGrid(config: GridConfig | boolean | undefined): {
  horizontal: boolean;
  vertical: boolean;
  strokeDasharray: string;
  stroke: string;
} | null {
  if (config === false) return null;

  if (config === true || config === undefined) {
    return {
      horizontal: true,
      vertical: false,
      strokeDasharray: chartTheme.grid.strokeDasharray,
      stroke: chartTheme.grid.stroke,
    };
  }

  return {
    horizontal: config.horizontal ?? true,
    vertical: config.vertical ?? false,
    strokeDasharray: config.strokeDasharray ?? chartTheme.grid.strokeDasharray,
    stroke: chartTheme.grid.stroke,
  };
}

/**
 * Normalizes the legend config union into a resolved config.
 */
export function resolveLegend(
  config: LegendConfig | boolean | undefined,
): LegendConfig | null {
  if (config === false) return null;
  if (config === true)
    return { enabled: true, position: "bottom", alignment: "center" };
  if (config === undefined) return null;
  if (config.enabled === false) return null;
  return { enabled: true, position: "bottom", alignment: "center", ...config };
}

/**
 * Returns Recharts-compatible stroke dasharray for line styles.
 */
export function strokeDashForStyle(
  style?: "solid" | "dashed" | "dotted",
): string | undefined {
  switch (style) {
    case "dashed":
      return "8 4";
    case "dotted":
      return "2 4";
    default:
      return undefined;
  }
}
