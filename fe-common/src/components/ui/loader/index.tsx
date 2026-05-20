import { type VariantProps, cva } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const loaderVariants = cva(
  [
    "flex flex-col items-center justify-center w-full",
    "transition-[background-color] duration-[var(--duration-normal)] ease-[var(--ease-smooth)]",
  ].join(" "),
  {
    variants: {
      size: {
        sm: "h-[120px]",
        default: "h-[300px]",
        lg: "h-[500px]",
        fullscreen: "h-screen",
      },
      background: {
        body: "bg-[var(--bg-body)]",
        none: "bg-transparent",
      },
    },
    defaultVariants: { size: "fullscreen", background: "body" },
  },
);

const SCALE: Record<NonNullable<LoaderProps["size"]>, string> = {
  sm: "scale-[0.4]",
  default: "scale-[0.6]",
  lg: "scale-[0.8]",
  fullscreen: "scale-100",
};

export interface LoaderProps
  extends
    React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof loaderVariants> {
  /** Optional text below animation, e.g. "Loading project…" */
  label?: string;
}

const Loader = React.forwardRef<HTMLDivElement, LoaderProps>(
  ({ className, size, background, label, ...props }, ref) => {
    const resolvedSize = size ?? "fullscreen";

    const boxes = Array.from({ length: 8 }, (_, index) => (
      <div key={index} className={`mui-loader-box box${index}`}>
        <div />
      </div>
    ));

    return (
      <div
        ref={ref}
        className={cn(loaderVariants({ size, background }), className)}
        role="status"
        aria-label={label ?? "Loading"}
        aria-live="polite"
        {...props}
      >
        <div className={cn("origin-center", SCALE[resolvedSize])}>
          <div
            className={cn(
              "mui-loader-scene",
              background === "none" && "mui-loader-scene--transparent",
            )}
          >
            {boxes}
            <div className="mui-loader-ground">
              <div />
            </div>
          </div>
        </div>

        {label && (
          <p
            className={cn(
              "mt-[var(--space-4)] text-[length:var(--text-sm)]",
              background === "none"
                ? "text-white/90"
                : "text-[var(--text-muted)]",
              "animate-pulse",
              resolvedSize !== "fullscreen" && "mt-[var(--space-2)]",
            )}
          >
            {label}
          </p>
        )}
      </div>
    );
  },
);
Loader.displayName = "Loader";

export { Loader, loaderVariants };

// ─────────────────────────────────────────────────────────────────────────────
// FullScreenLoader — fixed-position overlay backdrop with a centered Loader.
// Use for transient blocking states (workspace switching, save in progress).
// Renders nothing when `open` is false. Locks body scroll while open.
// ─────────────────────────────────────────────────────────────────────────────

export interface FullScreenLoaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Show / hide the overlay. */
  open: boolean;
  /** Optional text shown beneath the loader. */
  label?: string;
  /** Backdrop opacity preset. Default: "default" (~50% black). */
  backdrop?: "default" | "subtle" | "strong" | "transparent";
  /** Visual size of the inner Loader. Default: "default". */
  loaderSize?: LoaderProps["size"];
  /** Lock body scroll while open. Default: true. */
  lockScroll?: boolean;
}

const BACKDROP_CLASS: Record<
  NonNullable<FullScreenLoaderProps["backdrop"]>,
  string
> = {
  default: "bg-black/50",
  subtle: "bg-black/25",
  strong: "bg-black/70",
  transparent: "bg-transparent",
};

const FullScreenLoader = React.forwardRef<
  HTMLDivElement,
  FullScreenLoaderProps
>(
  (
    {
      open,
      label,
      backdrop = "default",
      loaderSize = "default",
      lockScroll = true,
      className,
      ...props
    },
    ref,
  ) => {
    React.useEffect(() => {
      if (!open || !lockScroll || typeof document === "undefined") return;
      const previous = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = previous;
      };
    }, [open, lockScroll]);

    if (!open) return null;

    return (
      <div
        ref={ref}
        role="status"
        aria-busy="true"
        aria-live="polite"
        aria-label={label ?? "Loading"}
        className={cn(
          "fixed inset-0 z-50 grid place-items-center",
          "backdrop-blur-sm",
          BACKDROP_CLASS[backdrop],
          className,
        )}
        {...props}
      >
        <Loader
          size={loaderSize}
          background="none"
          label={label}
          className="h-auto w-auto"
        />
      </div>
    );
  },
);
FullScreenLoader.displayName = "FullScreenLoader";

export { FullScreenLoader };
