import * as React from "react";
import {
  ScatterChart as RechartsScatterChart,
  Scatter,
  XAxis,
  YAxis,
  ZAxis,
} from "recharts";

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
import type { ScatterChartProps } from "../shared/types";
import { mergeMargin } from "../shared/utils";

export function ScatterChart({
  series,
  xKey,
  yKey,
  height,
  width,
  nodeSize = 60,
  nodeShape = "circle",
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
}: ScatterChartProps) {
  const resolvedMargin = mergeMargin(margin);

  const dynamicSize = typeof nodeSize === "object";

  return (
    <ChartContainer
      height={height}
      width={width}
      ariaLabel={ariaLabel}
      className={className}
    >
      <RechartsScatterChart margin={resolvedMargin} {...rechartsProps}>
        {renderGrid(grid)}

        <XAxis
          dataKey={xKey}
          type="number"
          tick={chartTheme.tick}
          tickLine={false}
          axisLine={false}
          name={xKey}
          {...buildAxisProps(xAxis, {
            orientation: "x",
            allowTickAngle: false,
          })}
        />

        <YAxis
          dataKey={yKey}
          type="number"
          tick={chartTheme.tick}
          tickLine={false}
          axisLine={false}
          name={yKey}
          {...buildAxisProps(yAxis, { orientation: "y" })}
        />

        {dynamicSize && (
          <ZAxis
            dataKey={
              (nodeSize as { dataKey: string; range: [number, number] }).dataKey
            }
            range={
              (nodeSize as { dataKey: string; range: [number, number] }).range
            }
          />
        )}

        {renderTooltip(tooltip, {
          strokeDasharray: "3 3",
          stroke: "var(--chart-grid)",
        })}
        {renderLegend(legend)}
        {renderReferenceLines(referenceLines)}
        {renderReferenceAreas(referenceAreas)}

        {series.map((s) => (
          <Scatter
            key={s.name}
            name={s.name}
            data={s.data}
            fill={s.color}
            shape={s.shape ?? nodeShape}
            isAnimationActive={animate}
            onClick={
              onPointClick
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (data: any, _: any, event: any) => onPointClick(data, event)
                : undefined
            }
            cursor={onPointClick ? "pointer" : undefined}
          />
        ))}
      </RechartsScatterChart>
    </ChartContainer>
  );
}
