// Design tokens for the KPI Card library.
//
// Hard-coded literals here mirror the Figma spec exactly. They are exposed as
// a single object so a host app can swap the import for its own theme later
// (or wire them up to CSS variables) without touching component internals.

export type KpiBadgeVariant = "realtime" | "warning" | "success" | "info" | "error" | "neutral";
export type KpiColorTheme = "red" | "orange" | "green" | "blue" | "error" | "warning" | "success";
export type KpiSize = "small" | "medium" | "large";

export interface KpiBadgePalette {
  text: string;
  background: string;
}

export interface KpiThemePalette {
  /** Page-level chart panel background (light tint). */
  chartBackground: string;
  /** Stroke / line / area accent. */
  stroke: string;
  /** Card surface tint (very light). */
  cardSurface: string;
  /** Subtle border that matches the theme. */
  cardBorder: string;
  /** Filled / progress area for capacity bars. */
  progressFill: string;
  /** Track behind the progress fill. */
  progressTrack: string;
}

export const kpiBadgePalette: Record<KpiBadgeVariant, KpiBadgePalette> = {
  realtime: { text: "#e7000b", background: "rgba(231, 0, 11, 0.12)" },
  error:    { text: "#e7000b", background: "rgba(231, 0, 11, 0.12)" },
  warning:  { text: "#ff6b00", background: "rgba(255, 107, 0, 0.12)" },
  success:  { text: "#00775b", background: "rgba(0, 119, 91, 0.12)" },
  info:     { text: "#0066cc", background: "rgba(0, 102, 204, 0.12)" },
  neutral:  { text: "#475569", background: "rgba(71, 85, 105, 0.10)" },
};

export const kpiThemePalette: Record<KpiColorTheme, KpiThemePalette> = {
  red: {
    chartBackground: "#ffe5e7",
    stroke: "#e7000b",
    cardSurface: "#fff5f6",
    cardBorder: "rgba(231, 0, 11, 0.18)",
    progressFill: "#e7000b",
    progressTrack: "rgba(231, 0, 11, 0.16)",
  },
  /** Semantic alias → red */
  error: {
    chartBackground: "#ffe5e7",
    stroke: "#e7000b",
    cardSurface: "#fff5f6",
    cardBorder: "rgba(231, 0, 11, 0.18)",
    progressFill: "#e7000b",
    progressTrack: "rgba(231, 0, 11, 0.16)",
  },
  orange: {
    chartBackground: "#fff3e5",
    stroke: "#ff6b00",
    cardSurface: "#fff8f0",
    cardBorder: "rgba(255, 107, 0, 0.18)",
    progressFill: "#ff6b00",
    progressTrack: "rgba(255, 107, 0, 0.16)",
  },
  /** Semantic alias → orange */
  warning: {
    chartBackground: "#fff3e5",
    stroke: "#ff6b00",
    cardSurface: "#fff8f0",
    cardBorder: "rgba(255, 107, 0, 0.18)",
    progressFill: "#ff6b00",
    progressTrack: "rgba(255, 107, 0, 0.16)",
  },
  green: {
    chartBackground: "#e5fff9",
    stroke: "#00775b",
    cardSurface: "#f0fffb",
    cardBorder: "rgba(0, 119, 91, 0.18)",
    progressFill: "#00775b",
    progressTrack: "rgba(0, 119, 91, 0.16)",
  },
  /** Semantic alias → green */
  success: {
    chartBackground: "#e5fff9",
    stroke: "#00775b",
    cardSurface: "#f0fffb",
    cardBorder: "rgba(0, 119, 91, 0.18)",
    progressFill: "#00775b",
    progressTrack: "rgba(0, 119, 91, 0.16)",
  },
  blue: {
    chartBackground: "#e5f3ff",
    stroke: "#0066cc",
    cardSurface: "#f0f8ff",
    cardBorder: "rgba(0, 102, 204, 0.18)",
    progressFill: "#0066cc",
    progressTrack: "rgba(0, 102, 204, 0.16)",
  },
};

export const kpiTypography = {
  fontFamilyText: "Inter, ui-sans-serif, system-ui, sans-serif",
  fontFamilyMono:
    "'JetBrains Mono', ui-monospace, SFMono-Regular, Menlo, monospace",
  label: {
    fontSize: "12px",
    fontWeight: 700,
    letterSpacing: "0.5px",
    color: "#475569",
  },
  value: {
    fontSize: "28px",
    fontWeight: 700,
    color: "#0f172a",
  },
  subtitle: {
    fontSize: "12px",
    fontWeight: 400,
    color: "#64748b",
  },
  definition: {
    fontSize: "10px",
    fontWeight: 400,
    color: "#94a3b8",
  },
} as const;

export const kpiSpacing = {
  cardPadding: "16px",
  gapTight: "4px",
  gapStandard: "8px",
  gapLoose: "12px",
  radiusCard: "8px",
  radiusBadge: "4px",
} as const;

export const kpiChart = {
  sparklineHeight: 32,
  fullChartHeight: 64,
  strokeWidth: 2,
} as const;

/**
 * Maps the abstract `size` prop onto concrete value/label scales.
 * Component-level styling overrides these where needed.
 */
export const kpiSizeScale: Record<
  KpiSize,
  { valueFontSize: string; labelFontSize: string; padding: string }
> = {
  small: { valueFontSize: "20px", labelFontSize: "11px", padding: "12px" },
  medium: { valueFontSize: "28px", labelFontSize: "12px", padding: "16px" },
  large: { valueFontSize: "36px", labelFontSize: "13px", padding: "20px" },
};
