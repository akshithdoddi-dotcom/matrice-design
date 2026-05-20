import * as React from "react";
import {
  Area,
  AreaChart,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
} from "recharts";

import { cn } from "@/lib/utils";

import {
  type KpiBadgeVariant,
  type KpiColorTheme,
  type KpiSize,
  kpiBadgePalette,
  kpiChart,
  kpiSizeScale,
  kpiSpacing,
  kpiThemePalette,
  kpiTypography,
} from "./tokens";

// ─────────────────────────────────────────────────────────────────────────────
// KpiCard — base container
// Owns: padding, radius, border, surface tint, optional theme background.
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Apply the theme's `chartBackground` to the whole card (Type C / Alert look). */
  emphasized?: boolean;
  /** Color theme — drives surface, border, and emphasized background. */
  colorTheme?: KpiColorTheme;
  /** Size scale — controls padding only at the container level. */
  size?: KpiSize;
  /** Make the card focusable / clickable. Adds keyboard handling + role. */
  interactive?: boolean;
}

export const KpiCardRoot = React.forwardRef<HTMLDivElement, KpiCardProps>(
  (
    {
      colorTheme,
      emphasized = false,
      size = "medium",
      interactive = false,
      className,
      style,
      onClick,
      onKeyDown,
      children,
      ...props
    },
    ref,
  ) => {
    const palette = colorTheme ? kpiThemePalette[colorTheme] : null;
    const padding = kpiSizeScale[size].padding;

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (interactive && onClick && (e.key === "Enter" || e.key === " ")) {
        e.preventDefault();
        onClick(e as unknown as React.MouseEvent<HTMLDivElement>);
      }
      onKeyDown?.(e);
    };

    return (
      <div
        ref={ref}
        role={interactive ? "button" : undefined}
        tabIndex={interactive ? 0 : undefined}
        onClick={onClick}
        onKeyDown={handleKeyDown}
        className={cn(
          "flex flex-col w-full transition-shadow duration-150",
          interactive &&
            "cursor-pointer hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-slate-400",
          className,
        )}
        style={{
          padding,
          gap: kpiSpacing.gapStandard,
          borderRadius: kpiSpacing.radiusCard,
          backgroundColor: emphasized
            ? (palette?.chartBackground ?? "#ffffff")
            : (palette?.cardSurface ?? "#ffffff"),
          border: `1px solid ${palette?.cardBorder ?? "rgba(15, 23, 42, 0.08)"}`,
          fontFamily: kpiTypography.fontFamilyText,
          ...style,
        }}
        {...props}
      >
        {children}
      </div>
    );
  },
);
KpiCardRoot.displayName = "KpiCard";

// ─────────────────────────────────────────────────────────────────────────────
// KpiBadge — status chip used in the label row
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  text: string;
  variant?: KpiBadgeVariant;
}

export const KpiBadge = React.forwardRef<HTMLSpanElement, KpiBadgeProps>(
  ({ text, variant = "info", className, style, ...props }, ref) => {
    const palette = kpiBadgePalette[variant];
    return (
      <span
        ref={ref}
        className={cn(
          "inline-flex items-center font-bold uppercase",
          className,
        )}
        style={{
          fontFamily: kpiTypography.fontFamilyText,
          fontSize: "10px",
          letterSpacing: "0.5px",
          padding: "3px 8px",
          borderRadius: kpiSpacing.radiusBadge,
          color: palette.text,
          backgroundColor: palette.background,
          ...style,
        }}
        {...props}
      >
        {text}
      </span>
    );
  },
);
KpiBadge.displayName = "KpiBadge";

// ─────────────────────────────────────────────────────────────────────────────
// KpiLabel — uppercase label with optional badge / icon on the right
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiLabelProps extends React.HTMLAttributes<HTMLDivElement> {
  text: string;
  icon?: React.ReactNode;
  badge?: { text: string; variant?: KpiBadgeVariant };
}

export const KpiLabel = React.forwardRef<HTMLDivElement, KpiLabelProps>(
  ({ text, icon, badge, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("flex items-center justify-between", className)}
        style={{ gap: kpiSpacing.gapStandard, ...style }}
        {...props}
      >
        <div
          className="flex items-center min-w-0"
          style={{ gap: kpiSpacing.gapTight }}
        >
          {icon && (
            <span className="shrink-0 inline-flex" aria-hidden="true">
              {icon}
            </span>
          )}
          <span
            className="uppercase truncate"
            style={{
              fontFamily: kpiTypography.fontFamilyText,
              fontSize: kpiTypography.label.fontSize,
              fontWeight: kpiTypography.label.fontWeight,
              letterSpacing: kpiTypography.label.letterSpacing,
              color: kpiTypography.label.color,
            }}
          >
            {text}
          </span>
        </div>
        {badge && <KpiBadge text={badge.text} variant={badge.variant} />}
      </div>
    );
  },
);
KpiLabel.displayName = "KpiLabel";

// ─────────────────────────────────────────────────────────────────────────────
// KpiValue — large monospace numeric display
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiValueProps extends React.HTMLAttributes<HTMLSpanElement> {
  value: string | number;
  size?: KpiSize;
}

export const KpiValue = React.forwardRef<HTMLSpanElement, KpiValueProps>(
  ({ value, size = "medium", className, style, ...props }, ref) => {
    return (
      <span
        ref={ref}
        className={cn("block leading-none", className)}
        style={{
          fontFamily: kpiTypography.fontFamilyMono,
          fontWeight: kpiTypography.value.fontWeight,
          fontSize: kpiSizeScale[size].valueFontSize,
          color: kpiTypography.value.color,
          ...style,
        }}
        {...props}
      >
        {value}
      </span>
    );
  },
);
KpiValue.displayName = "KpiValue";

// ─────────────────────────────────────────────────────────────────────────────
// KpiSubtitle — secondary context line
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiSubtitleProps extends React.HTMLAttributes<HTMLParagraphElement> {
  text: string;
}

export const KpiSubtitle = React.forwardRef<
  HTMLParagraphElement,
  KpiSubtitleProps
>(({ text, className, style, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("m-0", className)}
      style={{
        fontFamily: kpiTypography.fontFamilyText,
        fontSize: kpiTypography.subtitle.fontSize,
        fontWeight: kpiTypography.subtitle.fontWeight,
        color: kpiTypography.subtitle.color,
        ...style,
      }}
      {...props}
    >
      {text}
    </p>
  );
});
KpiSubtitle.displayName = "KpiSubtitle";

// ─────────────────────────────────────────────────────────────────────────────
// KpiSparkline — Recharts-backed inline chart (line or area)
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiSparklineProps {
  data: number[];
  type?: "line" | "area";
  colorTheme?: KpiColorTheme;
  /** Chart pixel height. Defaults to inline 32px; pass 64 for the full size. */
  height?: number;
  /** Accessible name describing what the trend represents. */
  ariaLabel?: string;
  className?: string;
  /** Show the hover tooltip (badge + guide line + dot). Default: true. */
  tooltip?: boolean;
  /** Format the tooltip value. Default: round to 1 decimal. */
  formatValue?: (value: number) => string;
}

// Tooltip content — small dark/theme-colored pill that mirrors the design spec.
// Props match what Recharts injects at runtime; typed loosely because the
// recharts 3.x TooltipProps generic doesn't expose `payload` cleanly.
interface SparklineTooltipProps {
  active?: boolean;
  payload?: Array<{ value?: number | string }>;
  color: string;
  formatValue?: (v: number) => string;
}

const SparklineTooltip: React.FC<SparklineTooltipProps> = ({
  active,
  payload,
  color,
  formatValue,
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const raw = payload[0]?.value;
  if (raw === undefined || raw === null) return null;
  const numeric = typeof raw === "number" ? raw : Number(raw);
  const text = formatValue
    ? formatValue(numeric)
    : Number.isInteger(numeric)
      ? `${numeric}`
      : numeric.toFixed(1);

  return (
    <div
      role="tooltip"
      style={{
        fontFamily: kpiTypography.fontFamilyMono,
        fontSize: "11px",
        fontWeight: 700,
        color: "#ffffff",
        backgroundColor: color,
        padding: "3px 8px",
        borderRadius: 4,
        boxShadow: "0 2px 6px rgba(15, 23, 42, 0.18)",
        whiteSpace: "nowrap",
        transform: "translateY(-4px)",
      }}
    >
      {text}
    </div>
  );
};

export const KpiSparkline: React.FC<KpiSparklineProps> = ({
  data,
  type = "line",
  colorTheme = "blue",
  height = kpiChart.sparklineHeight,
  ariaLabel,
  className,
  tooltip = true,
  formatValue,
}) => {
  const palette = kpiThemePalette[colorTheme];
  const series = data.map((v, i) => ({ i, v }));
  const gradientId = React.useId();

  // Margin reserves space so the active dot and tooltip don't clip on the edges.
  const margin = tooltip
    ? { top: 12, right: 8, bottom: 4, left: 8 }
    : { top: 2, right: 0, bottom: 2, left: 0 };

  const tooltipNode = tooltip ? (
    <Tooltip
      cursor={{
        stroke: palette.stroke,
        strokeWidth: 1,
        strokeDasharray: "2 2",
      }}
      wrapperStyle={{ outline: "none" }}
      content={
        <SparklineTooltip color={palette.stroke} formatValue={formatValue} />
      }
    />
  ) : null;

  const activeDot = tooltip
    ? {
        r: 4,
        stroke: "#ffffff",
        strokeWidth: 2,
        fill: palette.stroke,
      }
    : false;

  return (
    <div
      className={cn("w-full", className)}
      style={{ height }}
      role="img"
      aria-label={ariaLabel ?? "Trend sparkline"}
    >
      <ResponsiveContainer width="100%" height="100%">
        {type === "area" ? (
          <AreaChart data={series} margin={margin}>
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="0%"
                  stopColor={palette.stroke}
                  stopOpacity={0.35}
                />
                <stop
                  offset="100%"
                  stopColor={palette.stroke}
                  stopOpacity={0}
                />
              </linearGradient>
            </defs>
            {tooltipNode}
            <Area
              type="monotone"
              dataKey="v"
              stroke={palette.stroke}
              strokeWidth={kpiChart.strokeWidth}
              fill={`url(#${gradientId})`}
              isAnimationActive={false}
              dot={false}
              activeDot={activeDot}
            />
          </AreaChart>
        ) : (
          <LineChart data={series} margin={margin}>
            {tooltipNode}
            <Line
              type="monotone"
              dataKey="v"
              stroke={palette.stroke}
              strokeWidth={kpiChart.strokeWidth}
              isAnimationActive={false}
              dot={false}
              activeDot={activeDot}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KpiDefinition — small footer line explaining the metric
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiDefinitionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  text: string;
}

export const KpiDefinition = React.forwardRef<
  HTMLParagraphElement,
  KpiDefinitionProps
>(({ text, className, style, ...props }, ref) => {
  return (
    <p
      ref={ref}
      className={cn("m-0", className)}
      style={{
        fontFamily: kpiTypography.fontFamilyText,
        fontSize: kpiTypography.definition.fontSize,
        fontWeight: kpiTypography.definition.fontWeight,
        color: kpiTypography.definition.color,
        ...style,
      }}
      {...props}
    >
      {text}
    </p>
  );
});
KpiDefinition.displayName = "KpiDefinition";

// ─────────────────────────────────────────────────────────────────────────────
// KpiCapacityBar — horizontal progress bar used by Type E (Capacity)
// Exposed in case consumers want the bar without the wrapper card.
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiCapacityBarProps {
  /** Number 0–100. Values outside this range are clamped. */
  percent: number;
  colorTheme?: KpiColorTheme;
  className?: string;
  ariaLabel?: string;
}

export const KpiCapacityBar: React.FC<KpiCapacityBarProps> = ({
  percent,
  colorTheme = "blue",
  className,
  ariaLabel,
}) => {
  const palette = kpiThemePalette[colorTheme];
  const clamped = Math.min(100, Math.max(0, percent));

  return (
    <div
      className={cn("w-full", className)}
      role="progressbar"
      aria-valuenow={clamped}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={ariaLabel ?? "Capacity"}
      style={{
        height: 8,
        borderRadius: 999,
        backgroundColor: palette.progressTrack,
        overflow: "hidden",
      }}
    >
      <div
        style={{
          width: `${clamped}%`,
          height: "100%",
          backgroundColor: palette.progressFill,
          transition: "width 200ms ease-out",
        }}
      />
    </div>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// KpiGrid — responsive layout wrapper for groups of KPIs (Type F)
// ─────────────────────────────────────────────────────────────────────────────

export interface KpiGridProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Fixed column count. When omitted, grid is responsive (auto-fit, min 200px). */
  columns?: number;
  gap?: string;
}

export const KpiGrid = React.forwardRef<HTMLDivElement, KpiGridProps>(
  ({ columns, gap = kpiSpacing.gapLoose, className, style, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn("grid w-full", className)}
        style={{
          gap,
          gridTemplateColumns: columns
            ? `repeat(${columns}, minmax(0, 1fr))`
            : "repeat(auto-fit, minmax(200px, 1fr))",
          ...style,
        }}
        {...props}
      />
    );
  },
);
KpiGrid.displayName = "KpiGrid";
