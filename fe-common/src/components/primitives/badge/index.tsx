import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-sm px-2 py-0.5 font-semibold text-xs uppercase tracking-wide transition-colors",
  {
    variants: {
      variant: {
        primary: "bg-brand-subtle text-brand",
        success: "bg-[var(--color-success-bg)] text-[var(--color-success)]",
        warning: "bg-[var(--color-warning-bg)] text-[var(--color-warning)]",
        error: "bg-[var(--color-error-bg)] text-[var(--color-error)]",
        info: "bg-[var(--color-info-bg)] text-[var(--color-info)]",
        neutral: "bg-secondary text-muted-foreground",
        outline: "border border-border bg-transparent text-foreground",
      },
      size: {
        sm: "px-1.5 py-0.5 text-[10px]",
        default: "px-2 py-0.5 text-xs",
        lg: "px-2.5 py-1 text-sm",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  },
);

function Badge({
  className,
  variant,
  size,
  asChild = false,
  icon,
  children,
  ...props
}: React.ComponentProps<"span"> &
  VariantProps<typeof badgeVariants> & {
    asChild?: boolean;
    icon?: React.ReactNode;
  }) {
  const iconNode = icon ? (
    <span
      data-slot="badge-icon"
      className="shrink-0 [&_svg]:size-3"
      aria-hidden="true"
    >
      {icon}
    </span>
  ) : null;

  if (asChild) {
    return (
      <Slot
        data-slot="badge"
        className={cn(badgeVariants({ variant, size, className }))}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant, size, className }))}
      {...props}
    >
      {iconNode}
      {children}
    </span>
  );
}

export { Badge, badgeVariants };
