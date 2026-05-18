import * as React from "react";

import {
  type KpiBadgeProps,
  KpiCapacityBar,
  KpiCardRoot,
  type KpiCardProps as KpiCardRootProps,
  KpiDefinition,
  KpiGrid,
  KpiLabel,
  KpiSparkline,
  type KpiSparklineProps,
  KpiSubtitle,
  KpiValue,
} from "./parts";
import {
  type KpiBadgeVariant,
  type KpiColorTheme,
  type KpiSize,
  kpiSpacing,
} from "./tokens";

// ─────────────────────────────────────────────────────────────────────────────
// Unified KpiCard — selects layout via `type`
// ─────────────────────────────────────────────────────────────────────────────

export type KpiCardType =
  | "stat"
  | "spark"
  | "alert"
  | "performance"
  | "capacity"
  | "grid";

export interface KpiCardChildItem {
  label: string;
  value: string | number;
  subtitle?: string;
}

export interface KpiCardProps extends Omit<KpiCardRootProps, "emphasized"> {
  type?: KpiCardType;
  label?: string;
  value?: string | number;
  subtitle?: string;
  badge?: { text: string; variant?: KpiBadgeVariant };
  definition?: string;
  colorTheme?: KpiColorTheme;
  size?: KpiSize;
  icon?: React.ReactNode;

  /** Sparkline data — required for `spark` and `performance`, optional elsewhere. */
  chartData?: number[];
  chartType?: KpiSparklineProps["type"];
  /**
   * Show the chart hover tooltip. Defaults: true for `performance`, false for
   * `spark` (the inline 32px sparkline is too small for a readable badge).
   */
  chartTooltip?: boolean;
  /** Formatter for the tooltip value. */
  chartFormatValue?: (value: number) => string;

  /**
   * Numeric capacity (0–100). Used by `type="capacity"` to render the bar.
   * Falls back to parsing a percentage from `value` (e.g. "78%").
   */
  capacityPercent?: number;

  /** Items rendered when `type="grid"`. */
  items?: KpiCardChildItem[];

  /** Override emphasized look (defaults to true for `alert`). */
  emphasized?: boolean;
}

function parsePercent(value: string | number | undefined): number | undefined {
  if (value === undefined) return undefined;
  if (typeof value === "number") return value;
  const cleaned = value.trim().replaceAll("%", "").trim();
  if (cleaned === "") return undefined;
  const n = Number.parseFloat(cleaned);
  return Number.isFinite(n) ? n : undefined;
}

export const KpiCard = React.forwardRef<HTMLDivElement, KpiCardProps>(
  (
    {
      type = "stat",
      label,
      value,
      subtitle,
      badge,
      definition,
      colorTheme,
      size = "medium",
      icon,
      chartData,
      chartType = "line",
      chartTooltip,
      chartFormatValue,
      capacityPercent,
      items,
      emphasized,
      className,
      ...rest
    },
    ref,
  ) => {
    const isAlert = type === "alert";
    const resolvedEmphasized = emphasized ?? isAlert;

    // ── Type F: Grid ────────────────────────────────────────────────────────
    if (type === "grid") {
      return (
        <KpiCardRoot
          ref={ref}
          colorTheme={colorTheme}
          size={size}
          className={className}
          {...rest}
        >
          {label && <KpiLabel text={label} icon={icon} badge={badge} />}
          <KpiGrid
            columns={items && items.length <= 4 ? items.length : undefined}
          >
            {items?.map((item, idx) => (
              <div
                key={`${item.label}-${idx}`}
                className="flex flex-col"
                style={{ gap: kpiSpacing.gapTight }}
              >
                <KpiLabel text={item.label} />
                <KpiValue value={item.value} size={size} />
                {item.subtitle && <KpiSubtitle text={item.subtitle} />}
              </div>
            ))}
          </KpiGrid>
          {definition && <KpiDefinition text={definition} />}
        </KpiCardRoot>
      );
    }

    // ── Type D: Performance — chart fills most of the card ──────────────────
    if (type === "performance") {
      return (
        <KpiCardRoot
          ref={ref}
          colorTheme={colorTheme}
          size={size}
          className={className}
          {...rest}
        >
          {label && <KpiLabel text={label} icon={icon} badge={badge} />}
          <div
            className="flex items-baseline justify-between"
            style={{ gap: kpiSpacing.gapStandard }}
          >
            {value !== undefined && <KpiValue value={value} size={size} />}
            {subtitle && <KpiSubtitle text={subtitle} />}
          </div>
          {chartData && chartData.length > 0 && (
            <KpiSparkline
              data={chartData}
              type={chartType}
              colorTheme={colorTheme}
              height={64}
              ariaLabel={label ? `${label} trend` : undefined}
              tooltip={chartTooltip ?? true}
              formatValue={chartFormatValue}
            />
          )}
          {definition && <KpiDefinition text={definition} />}
        </KpiCardRoot>
      );
    }

    // ── Type E: Capacity — value + horizontal bar ───────────────────────────
    if (type === "capacity") {
      const percent = capacityPercent ?? parsePercent(value) ?? 0;
      return (
        <KpiCardRoot
          ref={ref}
          colorTheme={colorTheme}
          size={size}
          className={className}
          {...rest}
        >
          {label && <KpiLabel text={label} icon={icon} badge={badge} />}
          {value !== undefined && <KpiValue value={value} size={size} />}
          {subtitle && <KpiSubtitle text={subtitle} />}
          <KpiCapacityBar
            percent={percent}
            colorTheme={colorTheme}
            ariaLabel={label ? `${label} capacity` : undefined}
          />
          {definition && <KpiDefinition text={definition} />}
        </KpiCardRoot>
      );
    }

    // ── Type B: Spark — value + inline sparkline ────────────────────────────
    if (type === "spark") {
      return (
        <KpiCardRoot
          ref={ref}
          colorTheme={colorTheme}
          size={size}
          className={className}
          {...rest}
        >
          {label && <KpiLabel text={label} icon={icon} badge={badge} />}
          <div
            className="flex items-end justify-between"
            style={{ gap: kpiSpacing.gapStandard }}
          >
            <div className="flex flex-col" style={{ gap: kpiSpacing.gapTight }}>
              {value !== undefined && <KpiValue value={value} size={size} />}
              {subtitle && <KpiSubtitle text={subtitle} />}
            </div>
            {chartData && chartData.length > 0 && (
              <div className="flex-1 max-w-[120px]">
                <KpiSparkline
                  data={chartData}
                  type={chartType}
                  colorTheme={colorTheme}
                  ariaLabel={label ? `${label} trend` : undefined}
                  tooltip={chartTooltip ?? false}
                  formatValue={chartFormatValue}
                />
              </div>
            )}
          </div>
          {definition && <KpiDefinition text={definition} />}
        </KpiCardRoot>
      );
    }

    // ── Type A: Stat & Type C: Alert — same layout, different emphasis ──────
    return (
      <KpiCardRoot
        ref={ref}
        colorTheme={colorTheme}
        size={size}
        emphasized={resolvedEmphasized}
        className={className}
        {...rest}
      >
        {label && <KpiLabel text={label} icon={icon} badge={badge} />}
        {value !== undefined && <KpiValue value={value} size={size} />}
        {subtitle && <KpiSubtitle text={subtitle} />}
        {definition && <KpiDefinition text={definition} />}
      </KpiCardRoot>
    );
  },
);
KpiCard.displayName = "KpiCard";

// Re-export the Badge type alias used by consumers building KpiLabel manually.
export type { KpiBadgeProps };
