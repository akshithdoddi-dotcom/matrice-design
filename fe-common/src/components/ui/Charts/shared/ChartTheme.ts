export const chartTheme = {
  /** Axis tick text style */
  tick: {
    fontSize: 12,
    fill: "var(--chart-text-muted)",
    fontFamily: "inherit",
  },

  /** Axis label text style */
  axisLabel: { fontSize: 13, fill: "var(--chart-text)", fontWeight: 500 },

  /** Grid line style */
  grid: { stroke: "var(--chart-grid)", strokeDasharray: "3 3" },

  /** Tooltip container style */
  tooltip: {
    background: "var(--chart-tooltip-bg)",
    border: "1px solid var(--chart-tooltip-border)",
    borderRadius: 8,
    boxShadow: "var(--chart-tooltip-shadow)",
    padding: "8px 12px",
    fontSize: 13,
  },

  /** Default margins */
  defaultMargin: { top: 16, right: 16, bottom: 24, left: 24 },

  /** Color palette — 8 colors for series differentiation */
  palette: [
    "var(--chart-1)",
    "var(--chart-2)",
    "var(--chart-3)",
    "var(--chart-4)",
    "var(--chart-5)",
    "var(--chart-6)",
    "var(--chart-7)",
    "var(--chart-8)",
  ],

  /** Semantic colors for specific meanings */
  semantic: {
    success: "var(--chart-success)",
    danger: "var(--chart-danger)",
    warning: "var(--chart-warning)",
    info: "var(--chart-info)",
    muted: "var(--chart-muted)",
  },
} as const;
