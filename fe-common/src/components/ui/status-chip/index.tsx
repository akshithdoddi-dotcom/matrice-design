import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Variant auto-detection — pure UI utility, no business logic
// Maps generic status vocabulary → visual variant
// ─────────────────────────────────────────────────────────────────────────────

export type StatusVariant = "success" | "error" | "warning" | "info" | "default";

export function getVariantFromStatus(status: string): StatusVariant {
  const s = status.toLowerCase();

  if (["success", "complete", "active", "running", "deployed", "healthy"].some((k) => s.includes(k)))
    return "success";

  if (["error", "fail", "stopped", "crashed", "rejected"].some((k) => s.includes(k)))
    return "error";

  if (["warning", "pending", "queued", "paused", "degraded"].some((k) => s.includes(k)))
    return "warning";

  if (["info", "progress", "training", "uploading", "processing"].some((k) => s.includes(k)))
    return "info";

  return "default";
}

// ─────────────────────────────────────────────────────────────────────────────
// CVA variants — all colors sourced from CSS variables in globals.css
// Dark mode is automatic: --color-*-bg already switches in [data-theme="dark"]
// ─────────────────────────────────────────────────────────────────────────────

const statusChipVariants = cva(
  [
    "inline-flex items-center justify-center font-semibold capitalize",
    "rounded-(--radius-sm)",
    "transition-all duration-(--duration-fast) ease-(--ease-snappy)",
    "select-none whitespace-nowrap",
  ].join(" "),
  {
    variants: {
      variant: {
        success: "bg-(--color-success-bg) text-(--color-success)",
        error:   "bg-(--color-error-bg)   text-(--color-error)",
        warning: "bg-(--color-warning-bg) text-(--color-warning)",
        info:    "bg-(--color-info-bg)    text-(--color-info)",
        default: "bg-(--primary-subtle)   text-(--primary-main)",
      },
      size: {
        default: "min-w-[100px] px-2 py-1 text-xs",
        sm:      "px-1.5 py-0.5 text-[11px]",
      },
    },
    defaultVariants: { variant: "default", size: "default" },
  },
);

// ─────────────────────────────────────────────────────────────────────────────
// Props
// ─────────────────────────────────────────────────────────────────────────────

export interface StatusChipProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof statusChipVariants> {
  /** The status string to display — drives auto-detection when variant is omitted. */
  status: string;
  /** Manual override. When omitted, variant is auto-detected from `status`. */
  variant?: StatusVariant;
  size?: "sm" | "default";
  /** Optional leading icon (e.g. lucide-react icon, 14px recommended). */
  icon?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────────────────────

export const StatusChip = React.forwardRef<HTMLSpanElement, StatusChipProps>(
  ({ status, variant, size = "default", icon, className, ...props }, ref) => {
    const resolvedVariant = variant ?? getVariantFromStatus(status);

    return (
      <span
        ref={ref}
        className={cn(
          statusChipVariants({ variant: resolvedVariant, size }),
          icon ? "gap-1.5" : "",
          className,
          "p-2"
        )}
        {...props}
      >
        {icon && <span className="inline-flex shrink-0" aria-hidden="true">{icon}</span>}
        {status}
      </span>
    );
  },
);
StatusChip.displayName = "StatusChip";

export { statusChipVariants };
