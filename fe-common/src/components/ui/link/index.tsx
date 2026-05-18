import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { ExternalLink } from "lucide-react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const linkVariants = cva(
  [
    "inline-flex items-center gap-1 rounded-sm",
    "transition-colors duration-[var(--duration-fast)] ease-[var(--ease-snappy)]",
    "focus-visible:outline-none focus-visible:ring-2",
    "focus-visible:ring-[var(--primary-main)] focus-visible:ring-offset-2",
    "cursor-pointer",
  ].join(" "),
  {
    variants: {
      variant: {
        default: [
          "text-[var(--primary-main)] font-semibold underline",
          "hover:text-[var(--primary-hover)]",
        ].join(" "),
        muted: [
          "text-[var(--text-muted)] font-medium no-underline",
          "hover:text-[var(--text-primary)] hover:underline",
        ].join(" "),
        unstyled: [
          "text-inherit font-[inherit] no-underline",
          "hover:text-[var(--primary-main)]",
        ].join(" "),
      },
    },
    defaultVariants: { variant: "default" },
  },
);

export interface LinkProps
  extends React.AnchorHTMLAttributes<HTMLAnchorElement>,
    VariantProps<typeof linkVariants> {
  /** Adds target="_blank" + rel="noopener noreferrer" + external icon. */
  external?: boolean;
  /** Renders as Radix Slot — compose with Next.js Link or any router link. */
  asChild?: boolean;
}

const Link = React.forwardRef<HTMLAnchorElement, LinkProps>(
  ({ className, variant, external = false, asChild = false, children, ...props }, ref) => {
    const Comp = asChild ? Slot : "a";

    const externalProps = external
      ? { target: "_blank", rel: "noopener noreferrer" }
      : {};

    return (
      <Comp
        ref={ref}
        className={cn(linkVariants({ variant }), className)}
        {...externalProps}
        {...props}
      >
        {children}
        {external && (
          <ExternalLink size={12} aria-hidden="true" className="shrink-0" />
        )}
      </Comp>
    );
  },
);
Link.displayName = "Link";

export { Link, linkVariants };
