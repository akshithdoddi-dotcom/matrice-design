import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// PageHeader — the icon + title + subtitle row that repeats at the top of
// most feature pages and tab panels. Action slot on the right (e.g. buttons,
// segmented control). Optional breadcrumbs above. Optional bottom border.
// ─────────────────────────────────────────────────────────────────────────────

const pageHeaderVariants = cva("flex flex-col w-full", {
  variants: {
    size: {
      sm: "gap-(--space-2) py-(--space-3)",
      default: "gap-(--space-3) py-(--space-4)",
      lg: "gap-(--space-4) py-(--space-6)",
    },
    bordered: {
      true: "border-b border-(--border-color)",
      false: "",
    },
  },
  defaultVariants: { size: "default", bordered: false },
});

const titleClass: Record<NonNullable<PageHeaderProps["size"]>, string> = {
  sm: "text-base font-semibold",
  default: "text-lg font-semibold",
  lg: "text-2xl font-semibold",
};

const subtitleClass: Record<NonNullable<PageHeaderProps["size"]>, string> = {
  sm: "text-xs",
  default: "text-sm",
  lg: "text-sm",
};

const iconWrapClass: Record<NonNullable<PageHeaderProps["size"]>, string> = {
  sm: "p-1.5 rounded-md",
  default: "p-2 rounded-lg",
  lg: "p-2.5 rounded-lg",
};

export interface PageHeaderProps
  extends
    Omit<React.HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof pageHeaderVariants> {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  /** Leading icon — rendered as-is, or wrapped in a primary-subtle backdrop. */
  icon?: React.ReactNode;
  /** When true (default) and `icon` is a React node, the icon sits inside a tinted backdrop. */
  iconBackdrop?: boolean;
  /** Slot above the title (breadcrumbs, back link). */
  eyebrow?: React.ReactNode;
  /** Slot on the right (primary actions, view link). */
  action?: React.ReactNode;
}

const PageHeader = React.forwardRef<HTMLDivElement, PageHeaderProps>(
  (
    {
      className,
      size,
      bordered,
      title,
      subtitle,
      icon,
      iconBackdrop = true,
      eyebrow,
      action,
      ...props
    },
    ref,
  ) => {
    const resolvedSize = size ?? "default";

    return (
      <header
        ref={ref}
        className={cn(pageHeaderVariants({ size, bordered }), className)}
        {...props}
      >
        {eyebrow && (
          <div className="text-xs text-(--text-muted) leading-none">
            {eyebrow}
          </div>
        )}

        <div className="flex items-start justify-between gap-(--space-4)">
          <div className="flex items-center gap-(--space-3) min-w-0">
            {icon &&
              (iconBackdrop ? (
                <div
                  className={cn(
                    "flex items-center justify-center bg-primary-subtle text-primary shrink-0",
                    iconWrapClass[resolvedSize],
                  )}
                  aria-hidden="true"
                >
                  {icon}
                </div>
              ) : (
                <div className="shrink-0" aria-hidden="true">
                  {icon}
                </div>
              ))}

            <div className="flex flex-col gap-1 min-w-0">
              <h1
                className={cn(
                  titleClass[resolvedSize],
                  "text-(--text-primary) leading-tight truncate m-0",
                )}
              >
                {title}
              </h1>
              {subtitle && (
                <p
                  className={cn(
                    subtitleClass[resolvedSize],
                    "text-(--text-muted) leading-relaxed m-0",
                  )}
                >
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          {action && <div className="shrink-0">{action}</div>}
        </div>
      </header>
    );
  },
);
PageHeader.displayName = "PageHeader";

export { PageHeader, pageHeaderVariants };
