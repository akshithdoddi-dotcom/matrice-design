import * as React from "react";
import {
  CartesianGrid,
  Legend,
  ReferenceArea as RechReferenceArea,
  ReferenceLine as RechReferenceLine,
  Tooltip,
} from "recharts";

import { chartTheme } from "./ChartTheme";
import { ChartTooltip } from "./ChartTooltip";
import type {
  AxisConfig,
  GridConfig,
  LegendConfig,
  ReferenceArea,
  ReferenceLine,
  TooltipConfig,
} from "./types";
import { resolveGrid, resolveLegend } from "./utils";

/**
 * These helpers return Recharts JSX elements directly (as opposed to wrapping
 * them in components). Recharts inspects children shallowly — wrapping axis /
 * tooltip / legend / grid in a component breaks its child-detection, so the
 * helpers are invoked as plain function calls inside the chart JSX.
 */

type CursorConfig = {
  fill?: string;
  stroke?: string;
  strokeDasharray?: string;
  opacity?: number;
};

export function renderGrid(
  grid: GridConfig | boolean | undefined,
): React.ReactElement | null {
  const gridConfig = resolveGrid(grid);
  if (!gridConfig) return null;
  return (
    <CartesianGrid
      horizontal={gridConfig.horizontal}
      vertical={gridConfig.vertical}
      strokeDasharray={gridConfig.strokeDasharray}
      stroke={gridConfig.stroke}
    />
  );
}

export function renderTooltip(
  tooltip: TooltipConfig | false | undefined,
  cursor: CursorConfig | false = {
    stroke: "var(--chart-grid)",
    strokeDasharray: "3 3",
  },
): React.ReactElement | null {
  if (tooltip === false) return null;
  const cfg = tooltip as TooltipConfig | undefined;
  return (
    <Tooltip
      content={
        cfg?.content
          ? React.createElement(cfg.content)
          : // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (props: any) => <ChartTooltip {...props} config={cfg} />
      }
      cursor={cursor}
    />
  );
}

export function renderLegend(
  legend: LegendConfig | boolean | undefined,
): React.ReactElement | null {
  const legendConfig = resolveLegend(legend);
  if (!legendConfig) return null;
  return (
    <Legend
      verticalAlign={legendConfig.position === "top" ? "top" : "bottom"}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      align={legendConfig.alignment as any}
    />
  );
}

export function renderReferenceLines(
  lines: ReferenceLine[] | undefined,
): React.ReactElement[] | null {
  if (!lines?.length) return null;
  return lines.map((rl, i) => (
    <RechReferenceLine
      key={`rl-${i}`}
      {...(rl.axis === "x" ? { x: rl.value } : { y: rl.value })}
      stroke={rl.color ?? "var(--chart-muted)"}
      strokeDasharray={rl.strokeDasharray ?? "3 3"}
      label={rl.label}
    />
  ));
}

export function renderReferenceAreas(
  areas: ReferenceArea[] | undefined,
): React.ReactElement[] | null {
  if (!areas?.length) return null;
  return areas.map((ra, i) => (
    <RechReferenceArea
      key={`ra-${i}`}
      x1={ra.x1}
      x2={ra.x2}
      y1={ra.y1}
      y2={ra.y2}
      fill={ra.color ?? "var(--chart-muted)"}
      fillOpacity={ra.opacity ?? 0.1}
      label={ra.label}
    />
  ));
}

/**
 * Builds a spread-able props object for a Recharts XAxis/YAxis from an AxisConfig.
 * Options control which features apply (e.g. x axis gets tickAngle + auto-interval,
 * y axis gets angled label + tickCount).
 */
export interface AxisPropOptions {
  orientation: "x" | "y";
  /** Include tickAngle/dy/height for rotated ticks (x-axis only, default true for x) */
  allowTickAngle?: boolean;
  /** Include `scale` prop (only supported on some axes) */
  allowScale?: boolean;
  /** Data length — used to compute auto-interval to avoid label crowding */
  dataLength?: number;
  /** Enable automatic tick interval on x axis when not explicitly configured */
  autoInterval?: boolean;
}

export function buildAxisProps(
  axis: AxisConfig | null | undefined,
  opts: AxisPropOptions,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Record<string, any> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const props: Record<string, any> = {};
  if (!axis) return props;

  const isX = opts.orientation === "x";
  const tickAngleActive = opts.allowTickAngle !== false && !!axis.tickAngle;

  if (tickAngleActive) {
    props.angle = axis.tickAngle;
    if (isX) {
      props.textAnchor = "end" as const;
      props.dy = 8;
      props.height = 60;
    }
  }

  // On X-axis, a rotated-tick config suppresses the label (matches original behaviour
  // that put label next to un-rotated ticks only).
  if (axis.label && !(isX && tickAngleActive)) {
    props.label = {
      value: axis.label,
      style: chartTheme.axisLabel,
      ...(isX
        ? { position: "insideBottom" as const, offset: -5 }
        : { angle: -90, position: "insideLeft" as const, offset: 5 }),
    };
  }

  if (axis.tickFormatter) props.tickFormatter = axis.tickFormatter;
  if (opts.allowScale && axis.scale) props.scale = axis.scale;
  if (axis.domain) props.domain = axis.domain;
  if (axis.hide) props.hide = true;
  if (axis.ticks) props.ticks = axis.ticks;
  if (axis.unit) props.unit = axis.unit;

  if (axis.tickCount) {
    if (isX && opts.autoInterval && !axis.scale) {
      const len = opts.dataLength ?? 0;
      props.interval = Math.max(0, Math.ceil(len / axis.tickCount) - 1);
    } else {
      props.tickCount = axis.tickCount;
    }
  } else if (
    isX &&
    opts.autoInterval &&
    !axis.ticks &&
    (opts.dataLength ?? 0) > 15
  ) {
    props.interval = Math.max(0, Math.ceil((opts.dataLength ?? 0) / 10) - 1);
  }

  return props;
}
