import * as React from "react";
import { Area, ComposedChart, Line, XAxis, YAxis } from "recharts";

import { ChartContainer } from "../shared/ChartContainer";
import { chartTheme } from "../shared/ChartTheme";
import {
  buildAxisProps,
  renderGrid,
  renderLegend,
  renderReferenceAreas,
  renderReferenceLines,
  renderTooltip,
} from "../shared/chartElements";
import type { LineChartProps, LineSeries } from "../shared/types";
import { mergeMargin, strokeDashForStyle } from "../shared/utils";

const CURVE_MAP: Record<NonNullable<LineSeries["curve"]>, string> = {
  monotone: "monotoneX",
  linear: "linear",
  step: "step",
  stepBefore: "stepBefore",
  stepAfter: "stepAfter",
  natural: "natural",
  basis: "basisOpen",
};

export function LineChart({
  data,
  lines,
  xKey,
  height,
  width,
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
  onPointClick,
  rechartsProps,
}: LineChartProps) {
  const resolvedMargin = mergeMargin(margin);

  return (
    <ChartContainer
      height={height}
      width={width}
      ariaLabel={ariaLabel}
      className={className}
    >
      <ComposedChart data={data} margin={resolvedMargin} {...rechartsProps}>
        {renderGrid(grid)}

        <XAxis
          dataKey={xKey}
          tick={chartTheme.tick}
          tickLine={false}
          axisLine={false}
          {...buildAxisProps(xAxis, {
            orientation: "x",
            allowScale: true,
            dataLength: data.length,
            autoInterval: true,
          })}
        />

        <YAxis
          tick={chartTheme.tick}
          tickLine={false}
          axisLine={false}
          {...buildAxisProps(yAxis, { orientation: "y", allowScale: true })}
        />

        {renderTooltip(tooltip)}
        {renderLegend(legend)}
        {renderReferenceLines(referenceLines)}
        {renderReferenceAreas(referenceAreas)}

        {lines.map((line) => {
          const curveType = CURVE_MAP[line.curve ?? "monotone"];
          const strokeDash = strokeDashForStyle(line.strokeStyle);
          const dotConfig =
            line.dots === true
              ? { r: 3 }
              : line.dots && typeof line.dots === "object"
                ? { r: line.dots.size ?? 3 }
                : false;

          const areaConfig = line.area;

          if (areaConfig) {
            const areaOpacity =
              typeof areaConfig === "object"
                ? (areaConfig.opacity ?? 0.15)
                : 0.15;
            const areaFill =
              typeof areaConfig === "object"
                ? (areaConfig.fillColor ?? line.color)
                : line.color;

            return (
              <Area
                key={`area-${line.dataKey}`}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                type={curveType as any}
                dataKey={line.dataKey}
                name={line.name ?? line.dataKey}
                stroke={line.color}
                strokeWidth={line.strokeWidth ?? 2}
                strokeDasharray={strokeDash}
                fill={areaFill}
                fillOpacity={areaOpacity}
                dot={dotConfig}
                connectNulls={line.connectNulls}
                yAxisId={line.yAxisId ?? 0}
                isAnimationActive={animate}
                activeDot={
                  onPointClick
                    ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      { onClick: onPointClick as any, cursor: "pointer" }
                    : undefined
                }
              />
            );
          }

          return (
            <Line
              key={`line-${line.dataKey}`}
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              type={curveType as any}
              dataKey={line.dataKey}
              name={line.name ?? line.dataKey}
              stroke={line.color}
              strokeWidth={line.strokeWidth ?? 2}
              strokeDasharray={strokeDash}
              dot={dotConfig}
              connectNulls={line.connectNulls}
              yAxisId={line.yAxisId ?? 0}
              isAnimationActive={animate}
              activeDot={
                onPointClick
                  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    { onClick: onPointClick as any, cursor: "pointer" }
                  : undefined
              }
            />
          );
        })}
      </ComposedChart>
    </ChartContainer>
  );
}
