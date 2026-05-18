import { Cell, Pie, PieChart as RechartsPieChart } from "recharts";

import { ChartContainer } from "../shared/ChartContainer";
import { renderLegend, renderTooltip } from "../shared/chartElements";
import type { PieChartProps, PieDatum } from "../shared/types";

const RADIAN = Math.PI / 180;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function renderInsideLabel(props: any) {
  const {
    cx,
    cy,
    midAngle,
    innerRadius,
    outerRadius,
    percent,
    value,
    name,
    labelType,
    formatter,
  } = props;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  let text: string;
  if (formatter) {
    text = formatter({ name, value, color: "" });
  } else if (labelType === "percent") {
    text = `${(percent * 100).toFixed(0)}%`;
  } else if (labelType === "name") {
    text = name;
  } else {
    text = String(value);
  }

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      fontSize={12}
      fontWeight={500}
    >
      {text}
    </text>
  );
}

export function PieChart({
  data,
  height,
  width,
  variant = "pie",
  innerRadius: innerRadiusProp,
  outerRadius: outerRadiusProp,
  labels,
  labelLines,
  activeSlice: _activeSlice = true,
  paddingAngle,
  startAngle = 90,
  endAngle = -270,
  centerContent,
  margin,
  legend,
  tooltip,
  ariaLabel,
  className,
  animate = true,
  onSliceClick,
  rechartsProps,
}: PieChartProps) {
  // PieChart needs minimal margins — cartesian defaults are too aggressive
  const resolvedMargin = { top: 5, right: 5, bottom: 5, left: 5, ...margin };

  const resolvedInnerRadius =
    innerRadiusProp ?? (variant === "donut" ? "60%" : 0);
  const resolvedOuterRadius = outerRadiusProp ?? "80%";

  // Label config
  const showLabels = labels !== undefined && labels !== false;
  const labelConfig = typeof labels === "object" ? labels : {};
  const labelPosition = labelConfig.position ?? "outside";
  const labelType = labelConfig.type ?? "percent";
  const labelFormatter = labelConfig.formatter;

  return (
    <ChartContainer
      height={height}
      width={width}
      ariaLabel={ariaLabel}
      className={className}
    >
      <RechartsPieChart margin={resolvedMargin} {...rechartsProps}>
        <Pie
          data={data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={resolvedInnerRadius}
          outerRadius={resolvedOuterRadius}
          paddingAngle={paddingAngle}
          startAngle={startAngle}
          endAngle={endAngle}
          isAnimationActive={animate}
          label={
            showLabels
              ? labelPosition === "inside"
                ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (props: any) =>
                    renderInsideLabel({
                      ...props,
                      labelType,
                      formatter: labelFormatter,
                    })
                : // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  (props: any) => {
                    const { name, value, percent } = props;
                    let text: string;
                    if (labelFormatter) {
                      text = labelFormatter({ name, value, color: "" });
                    } else if (labelType === "name") {
                      text = name;
                    } else if (labelType === "value") {
                      text = String(value);
                    } else {
                      text = `${(percent * 100).toFixed(0)}%`;
                    }
                    return (
                      <text {...props} fill="var(--chart-text)" fontSize={12}>
                        {text}
                      </text>
                    );
                  }
              : false
          }
          labelLine={
            showLabels && labelPosition === "outside" && labelLines !== false
          }
          onClick={
            onSliceClick
              ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
                (data: any, index: number, event: any) =>
                  onSliceClick(data as PieDatum, index, event)
              : undefined
          }
          cursor={onSliceClick ? "pointer" : undefined}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>

        {renderTooltip(tooltip, false)}
        {renderLegend(legend)}

        {centerContent && (
          <foreignObject
            x="0"
            y="0"
            width="100%"
            height="100%"
            style={{ pointerEvents: "none" }}
          >
            <div
              style={{
                width: "100%",
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {centerContent}
            </div>
          </foreignObject>
        )}
      </RechartsPieChart>
    </ChartContainer>
  );
}
