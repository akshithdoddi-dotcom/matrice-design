// Components
export { BarChart } from "./BarChart/BarChart";
export { LineChart } from "./LineChart/LineChart";
export { PieChart } from "./PieChart/PieChart";
export { ScatterChart } from "./ScatterChart/ScatterChart";

// Shared components (for flexible layouts)
export { ChartContainer } from "./shared/ChartContainer";
export { ChartLegend } from "./shared/ChartLegend";
export { ChartTooltip } from "./shared/ChartTooltip";

// Theme (for custom charts or overrides)
export { chartTheme } from "./shared/ChartTheme";

// All types
export type {
  BaseChartProps,
  CartesianChartProps,
  Margin,
  AxisConfig,
  GridConfig,
  LegendConfig,
  TooltipConfig,
  ReferenceLine,
  ReferenceArea,
  DomainBound,
  LegendPayloadItem,
  BarChartProps,
  BarSeries,
  LineChartProps,
  LineSeries,
  PieChartProps,
  PieDatum,
  ScatterChartProps,
  ScatterSeries,
} from "./shared/types";

// Legend item type
export type { ChartLegendItem } from "./shared/ChartLegend";
