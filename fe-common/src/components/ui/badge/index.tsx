import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "@/lib/utils";

const badgeVariants = cva("mui-badge", {
  variants: {
    variant: {
      primary: "mui-badge-primary",
      success: "mui-badge-success",
      warning: "mui-badge-warning",
      error: "mui-badge-error",
      info: "mui-badge-info",
      neutral: "mui-badge-neutral",
    },
    size: {
      default: "",
      sm: "px-1.5 py-0.5 text-[10px]",
      lg: "px-2.5 py-1 text-sm",
    },
  },
  defaultVariants: {
    variant: "primary",
    size: "default",
  },
});

export interface BadgeProps
  extends
    React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {
  asChild?: boolean;
  icon?: React.ReactNode;
}

const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  (
    { className, variant, size, asChild = false, icon, children, ...props },
    ref,
  ) => {
    const Comp = asChild ? Slot : "span";
    return (
      <Comp
        ref={ref}
        className={cn(badgeVariants({ variant, size }), className)}
        {...props}
      >
        {icon ? (
          <span className="mui-badge-icon" aria-hidden="true">
            {icon}
          </span>
        ) : null}
        {children}
      </Comp>
    );
  },
);

Badge.displayName = "Badge";

export { Badge, badgeVariants };
