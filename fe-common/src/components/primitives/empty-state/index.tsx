import { Inbox } from "lucide-react";

import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center bg-surface rounded-xl transition-colors duration-(--duration-normal) ease-(--ease-smooth)",
  {
    variants: {
      size: {
        sm: "gap-3 p-4",
        default: "gap-4 p-8 min-h-[200px]",
        lg: "gap-5 p-12 min-h-[400px]",
      },
    },
    defaultVariants: { size: "default" },
  },
);

const iconBackdropSizeMap = {
  sm: "p-3 rounded-xl",
  default: "p-4 rounded-2xl",
  lg: "p-5 rounded-2xl",
} as const;

const defaultIconSizeMap = {
  sm: 20,
  default: 28,
  lg: 36,
} as const;

const titleSizeMap = {
  sm: "text-sm font-semibold",
  default: "text-sm font-semibold",
  lg: "text-lg font-semibold",
} as const;

const descriptionSizeMap = {
  sm: "text-xs",
  default: "text-sm max-w-xs",
  lg: "text-sm max-w-sm",
} as const;

type EmptyStateSize = "sm" | "default" | "lg";

function EmptyState({
  className,
  size,
  title,
  description,
  icon,
  action,
  ...props
}: React.ComponentProps<"div"> &
  VariantProps<typeof emptyStateVariants> & {
    title: string;
    description?: string;
    icon?: React.ReactNode;
    action?: React.ReactNode;
  }) {
  const resolvedSize: EmptyStateSize = size ?? "default";

  return (
    <div
      data-slot="empty-state"
      className={cn(emptyStateVariants({ size, className }))}
      {...props}
    >
      {/* Icon — custom icons render as-is; default gets a branded backdrop */}
      {icon ?? (
        <div
          data-slot="empty-state-icon"
          className={cn(
            "flex items-center justify-center bg-brand-subtle",
            iconBackdropSizeMap[resolvedSize],
          )}
        >
          <Inbox
            size={defaultIconSizeMap[resolvedSize]}
            className="text-brand"
            aria-hidden="true"
          />
        </div>
      )}

      {/* Text block */}
      <div className="flex flex-col items-center gap-1.5">
        <p
          data-slot="empty-state-title"
          className={cn(titleSizeMap[resolvedSize], "text-foreground")}
        >
          {title}
        </p>

        {description && (
          <p
            data-slot="empty-state-description"
            className={cn(
              descriptionSizeMap[resolvedSize],
              "text-muted-foreground leading-relaxed",
            )}
          >
            {description}
          </p>
        )}
      </div>

      {/* Optional action slot */}
      {action && <div data-slot="empty-state-action">{action}</div>}
    </div>
  );
}

export { EmptyState, emptyStateVariants };
