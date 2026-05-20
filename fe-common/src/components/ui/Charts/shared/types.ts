import type {
  CSSProperties,
  ComponentType,
  MouseEvent,
  ReactNode,
} from "react";

// ─── Layout ───────────────────────────────────────────────────────

export interface Margin {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

// ─── Axis (shared by bar, line, scatter, and any future cartesian chart) ───

export interface AxisConfig {
  /** Axis label text */
  label?: string;

  /** Rotate tick labels (degrees) */
  tickAngle?: number;

  /** Custom tick formatter */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tickFormatter?: (value: any, index: number) => string;

  /** Scale type */
  scale?: "auto" | "linear" | "log" | "time" | "band" | "point";

  /** Axis domain bounds */
  domain?: [DomainBound, DomainBound];

  /** Unit suffix shown on ticks (e.g., "%", "ms") */
  unit?: string;

  /** Hide axis entirely (but keep scale) */
  hide?: boolean;

  /** Explicit tick values */
  ticks?: (string | number)[];

  /** Number of ticks (approximate) */
  tickCount?: number;
}

export type DomainBound = number | "auto" | "dataMin" | "dataMax";

// ─── Grid ─────────────────────────────────────────────────────────

export interface GridConfig {
  horizontal?: boolean;
  vertical?: boolean;
  strokeDasharray?: string;
}

// ─── Reference markers (lines, areas, dots — any cartesian chart) ─

export interface ReferenceLine {
  axis: "x" | "y";
  value: number | string;
  label?: string;
  color?: string;
  strokeDasharray?: string;
}

export interface ReferenceArea {
  x1: number | string;
  x2: number | string;
  y1: number | string;
  y2: number | string;
  color?: string;
  opacity?: number;
  label?: string;
}

// ─── Legend ────────────────────────────────────────────────────────

export interface LegendConfig {
  enabled?: boolean;
  position?: "top" | "bottom" | "left" | "right";
  alignment?: "start" | "center" | "end";
  /** Custom legend renderer — replaces built-in entirely */
  custom?: ComponentType<{ payload: LegendPayloadItem[] }>;
}

export interface LegendPayloadItem {
  value: string;
  color: string;
  type?: string;
}

// ─── Tooltip ──────────────────────────────────────────────────────

export interface TooltipConfig<TValue = number, TName = string> {
  /** Custom tooltip component — receives Recharts TooltipProps */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  content?: ComponentType<any>;
  /** Format value in default tooltip */
  valueFormatter?: (value: TValue, name: TName) => string;
  /** Format label in default tooltip */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  labelFormatter?: (label: any) => string;
  /** Disable tooltip */
  enabled?: boolean;
  /** Cursor style — crosshair line on hover */
  cursor?: boolean | CSSProperties;
}

// ─── Base props every chart shares ────────────────────────────────

export interface BaseChartProps {
  /** Required: chart height in pixels */
  height: number;

  /** Optional: explicit width (default: 100% responsive) */
  width?: number | string;

  /** Chart margins */
  margin?: Margin;

  /** Legend config */
  legend?: LegendConfig | boolean;

  /** Tooltip config — `false` to disable */
  tooltip?: TooltipConfig | false;

  /** Accessibility label */
  ariaLabel?: string;

  /** Additional CSS class on wrapper */
  className?: string;

  /** Animation — true by default, false for SSR or performance */
  animate?: boolean;
}

// ─── Cartesian base (extends Base — for bar, line, scatter) ──────

export interface CartesianChartProps extends BaseChartProps {
  xAxis?: AxisConfig | null;
  yAxis?: AxisConfig | null;
  grid?: GridConfig | boolean;
  referenceLines?: ReferenceLine[];
  referenceAreas?: ReferenceArea[];
}

// ─── Bar ──────────────────────────────────────────────────────────

export interface BarChartProps extends CartesianChartProps {
  /** Chart data */
  data: Record<string, string | number>[];

  /** Bar series definitions */
  bars: BarSeries[];

  /** Field used for category axis */
  categoryKey: string;

  /** Orientation */
  layout?: "vertical" | "horizontal";

  /** Enable stacking (bars with same stackId stack) */
  stacked?: boolean;

  /** Bar corner radius */
  radius?: number | [number, number, number, number];

  /** Gap between bars in a group (0-1) */
  barGap?: number;

  /** Gap between bar groups (0-1, or pixel number) */
  barCategoryGap?: number | string;

  /** Bar click handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onBarClick?: (data: any, index: number, event: MouseEvent) => void;

  /** Pass-through to underlying Recharts BarChart */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rechartsProps?: Record<string, any>;
}

export interface BarSeries {
  dataKey: string;
  name?: string;
  color: string;
  stackId?: string;
  /** Pattern fill for visual distinction */
  pattern?: "crosshatch" | "diagonal" | "dots";
  /** Show value label on bar */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  label?: boolean | ComponentType<any>;
  /** Per-bar radius override */
  radius?: number | [number, number, number, number];
  /** Max bar width in pixels */
  maxBarSize?: number;
}

// ─── Line ─────────────────────────────────────────────────────────

export interface LineChartProps extends CartesianChartProps {
  /** Chart data — flat array of data points */
  data: Record<string, string | number | Date | null>[];

  /** Line/area series definitions */
  lines: LineSeries[];

  /** Data key for x-axis values */
  xKey: string;

  /** Click handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPointClick?: (data: any, event: MouseEvent) => void;

  /** Pass-through to underlying Recharts component */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rechartsProps?: Record<string, any>;
}

export interface LineSeries {
  dataKey: string;
  name?: string;
  color: string;

  /** Render as area (filled under line) */
  area?: boolean | { opacity?: number; fillColor?: string };

  /** Line style */
  strokeStyle?: "solid" | "dashed" | "dotted";
  strokeWidth?: number;

  /** Curve interpolation */
  curve?:
    | "monotone"
    | "linear"
    | "step"
    | "stepBefore"
    | "stepAfter"
    | "natural"
    | "basis";

  /** Data point dots */
  dots?: boolean | { size?: number; shape?: "circle" | "square" | "diamond" };

  /** Whether to connect across null values */
  connectNulls?: boolean;

  /** Y-axis ID (for dual-axis charts) */
  yAxisId?: string;
}

// ─── Pie ──────────────────────────────────────────────────────────

export interface PieChartProps extends BaseChartProps {
  /** Chart data */
  data: PieDatum[];

  /** Pie or donut */
  variant?: "pie" | "donut";

  /** Inner radius (0-1 ratio, or pixel number). Donut defaults to 0.6 */
  innerRadius?: number | string;

  /** Outer radius */
  outerRadius?: number | string;

  /** Show value/percentage labels on slices */
  labels?:
    | boolean
    | {
        type?: "value" | "percent" | "name";
        formatter?: (entry: PieDatum) => string;
        position?: "inside" | "outside";
      };

  /** Leader lines to external labels */
  labelLines?: boolean;

  /** Hover effect — expand active slice */
  activeSlice?: boolean;

  /** Slice padding angle in degrees */
  paddingAngle?: number;

  /** Start/end angles for semi-circles or custom arcs */
  startAngle?: number;
  endAngle?: number;

  /** Content rendered in the donut center */
  centerContent?: ReactNode;

  /** Slice click handler */
  onSliceClick?: (data: PieDatum, index: number, event: MouseEvent) => void;

  /** Pass-through to Recharts Pie */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rechartsProps?: Record<string, any>;
}

export interface PieDatum {
  name: string;
  value: number;
  color: string;
}

// ─── Scatter ──────────────────────────────────────────────────────

export interface ScatterChartProps extends CartesianChartProps {
  /** Scatter data series (multiple for color/shape grouping) */
  series: ScatterSeries[];

  /** Data key for x-axis values */
  xKey: string;

  /** Data key for y-axis values */
  yKey: string;

  /** Node sizing — fixed, or dynamic based on a data field */
  nodeSize?: number | { dataKey: string; range: [number, number] };

  /** Default node shape */
  nodeShape?:
    | "circle"
    | "cross"
    | "diamond"
    | "square"
    | "star"
    | "triangle"
    | "wye";

  /** Point click handler */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onPointClick?: (data: any, event: MouseEvent) => void;

  /** Pass-through to Recharts ScatterChart */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  rechartsProps?: Record<string, any>;
}

export interface ScatterSeries {
  name: string;
  data: Record<string, number | string>[];
  color: string;
  shape?:
    | "circle"
    | "cross"
    | "diamond"
    | "square"
    | "star"
    | "triangle"
    | "wye";
  /** Per-series node size override */
  size?: number;
}
