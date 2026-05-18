import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { Slot } from "@radix-ui/react-slot";

import { cn } from "../../../lib/utils";

const buttonVariants = cva("mui-btn", {
  variants: {
    variant: {
      default: "mui-btn-primary",
      destructive: "mui-btn-destructive",
      outline: "mui-btn-outline",
      secondary: "mui-btn-secondary",
      ghost: "mui-btn-ghost",
      link: "mui-btn-link",
    },
    size: {
      default: "",
      sm: "mui-btn-sm",
      lg: "mui-btn-lg",
      icon: "mui-btn-icon",
    },
    shape: {
      default: "",
      round: "mui-btn-round",
    },
  },
  defaultVariants: {
    variant: "default",
    size: "default",
    shape: "default",
  },
});

export interface ButtonProps
  extends
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
  isLoading?: boolean;
  startIcon?: React.ReactNode;
  endIcon?: React.ReactNode;
  children: React.ReactNode;
}

const Spinner = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    width={16}
    height={16}
    aria-hidden="true"
    style={{ animation: "spin 0.7s linear infinite", flexShrink: 0 }}
  >
    <circle
      cx="12"
      cy="12"
      r="10"
      stroke="currentColor"
      strokeWidth="3"
      style={{ opacity: 0.25 }}
    />
    <path
      fill="currentColor"
      style={{ opacity: 0.85 }}
      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
    />
  </svg>
);

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant,
      size,
      shape,
      isLoading = false,
      startIcon,
      endIcon,
      asChild = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    const Comp = asChild ? Slot : "button";
    const isDisabled = disabled || isLoading;

    return (
      <Comp
        ref={ref}
        className={cn(buttonVariants({ variant, size, shape }), className)}
        disabled={isDisabled}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? <Spinner /> : startIcon}
        {children}
        {!isLoading && endIcon}
      </Comp>
    );
  },
);

Button.displayName = "Button";

export { buttonVariants };
