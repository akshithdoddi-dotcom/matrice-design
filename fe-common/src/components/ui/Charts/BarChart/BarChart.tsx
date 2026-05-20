import * as React from "react";
import { Bar, BarChart as RechartsBarChart, XAxis, YAxis } from "recharts";

import { ChartContainer } from "../shared/ChartContainer";
import { chartTheme } from "../shared/ChartTheme";
import { PatternDefs, getPatternFill } from "../shared/PatternDefs";
import {
  buildAxisProps,
  renderGrid,
  renderLegend,
  renderReferenceAreas,
  renderReferenceLines,
  renderTooltip,
} from "../shared/chartElements";
import type { BarChartProps } from "../shared/types";
import { mergeMargin } from "../shared/utils";

export function BarChart({
  data,
  bars,
  categoryKey,
  height,
  width,
  layout = "vertical",
  stacked = false,
  radius,
  barGap,
  barCategoryGap,
  margin,
  xAxis,
  yAxis,
  grid,
  legend,
  tooltip,
  referenceLines,
  referenceAreas,
  ariaLabel,
  className,
  animate = true,
  onBarClick,
  rechartsProps,
}: BarChartProps) {
  const resolvedMargin = mergeMargin(margin);

  const patterns = bars
    .filter((b) => b.pattern)
    .map((b) => ({ id: b.pattern!, color: b.color }));

  // Recharts uses layout="vertical" for horizontal bars (Y is category)
  const isHorizontal = layout === "horizontal";
  const rechartsLayout = isHorizontal ? "vertical" : "horizontal";

  // In horizontal layout the category axis is the Y-axis (takes yAxis config,
  // uses Y-style label rotation) while the value axis becomes the X-axis.
  const categoryAxisProps = {
    dataKey: categoryKey,
    tick: chartTheme.tick,
    tickLine: false,
    axisLine: false,
    ...(isHorizontal
      ? {
          type: "category" as const,
          ...buildAxisProps(yAxis, { orientation: "y" }),
        }
      : buildAxisProps(xAxis, { orientation: "x" })),
  };

  const valueAxisProps = {
    tick: chartTheme.tick,
    tickLine: false,
    axisLine: false,
    ...(isHorizontal
      ? {
          type: "number" as const,
          ...buildAxisProps(xAxis, { orientation: "x", allowTickAngle: false }),
        }
      : buildAxisProps(yAxis, { orientation: "y" })),
  };

  return (
    <ChartContainer
      height={height}
      width={width}
      ariaLabel={ariaLabel}
      className={className}
    >
      <RechartsBarChart
        data={data}
        layout={rechartsLayout}
        margin={resolvedMargin}
        barGap={barGap}
        barCategoryGap={barCategoryGap}
        {...rechartsProps}
      >
        {patterns.length > 0 && <PatternDefs patterns={patterns} />}

        {renderGrid(grid)}

        {isHorizontal ? (
          <>
            <YAxis {...categoryAxisProps} />
            <XAxis {...valueAxisProps} />
          </>
        ) : (
          <>
            <XAxis {...categoryAxisProps} />
            <YAxis {...valueAxisProps} />
          </>
        )}

        {renderTooltip(tooltip, { fill: "var(--chart-grid)", opacity: 0.3 })}
        {renderLegend(legend)}
        {renderReferenceLines(referenceLines)}
        {renderReferenceAreas(referenceAreas)}

        {bars.map((bar) => (
          <Bar
            key={bar.dataKey}
            dataKey={bar.dataKey}
            name={bar.name ?? bar.dataKey}
            fill={
              bar.pattern ? getPatternFill(bar.pattern, bar.color) : bar.color
            }
            stackId={stacked ? (bar.stackId ?? "stack") : undefined}
            radius={bar.radius ?? radius ?? 0}
            maxBarSize={bar.maxBarSize}
            isAnimationActive={animate}
            label={
              bar.label === true
                ? {
                    position: "top" as const,
                    fill: "var(--chart-text)",
                    fontSize: 11,
                  }
                : typeof bar.label === "function"
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    (bar.label as any)
                  : undefined
            }
            onClick={
              onBarClick
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (data: any, index: number, event: any) =>
                    onBarClick(data, index, event)
                : undefined
            }
            cursor={onBarClick ? "pointer" : undefined}
          />
        ))}
      </RechartsBarChart>
    </ChartContainer>
  );
}
