import * as React from "react";
import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Primitives — low-level composable pieces (shadcn pattern)
// ─────────────────────────────────────────────────────────────────────────────

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative w-full bg-surface border border-border rounded-lg",
        "transition-all duration-(--duration-normal) ease-(--ease-snappy)",
        "hover:border-(--primary-main)",
        "focus-within:border-(--primary-main)",
        className,
      )}
      {...props}
    />
  ),
);
Card.displayName = "Card";

const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between py-2 px-4", className)}
      {...props}
    />
  ),
);
CardHeader.displayName = "CardHeader";

const CardTitle = React.forwardRef<HTMLHeadingElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-base font-semibold text-(--text-primary) leading-tight",
        className,
      )}
      {...props}
    />
  ),
);
CardTitle.displayName = "CardTitle";

const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-xs text-(--text-secondary) leading-normal", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  ),
);
CardContent.displayName = "CardContent";

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "flex items-center px-4 py-3 border-t border-border",
        className,
      )}
      {...props}
    />
  ),
);
CardFooter.displayName = "CardFooter";

// ─────────────────────────────────────────────────────────────────────────────
// Internal separator — thin rule between header and content
// ─────────────────────────────────────────────────────────────────────────────

const CardSeparator = () => (
  <div className="h-px w-full bg-border" role="separator" aria-hidden="true" />
);

// ─────────────────────────────────────────────────────────────────────────────
// ContentCard — opinionated composite (header + divider + content)
// This is what the dashboard uses for 98% of panels.
// ─────────────────────────────────────────────────────────────────────────────

export interface ContentCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** String renders as <CardTitle>; ReactNode renders as-is. */
  header?: string | React.ReactNode;
  /** Subtitle below the header string — only shown when header is a string. */
  subHeader?: string;
  /** Slot in the top-right of the header row. */
  action?: React.ReactNode;
  /** Extra className forwarded to <CardContent>. */
  contentClassName?: string;
  /** Extra className forwarded to <CardHeader>. */
  headerClassName?: string;
  children?: React.ReactNode;
}

const ContentCard = React.forwardRef<HTMLDivElement, ContentCardProps>(
  (
    {
      header,
      subHeader,
      action,
      contentClassName,
      headerClassName,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const hasHeader = header !== undefined && header !== null;

    return (
      <Card ref={ref} className={className} {...props}>
        {hasHeader && (
          <>
            <CardHeader className={cn("gap-2", headerClassName)}>
              <div className="flex flex-col gap-0.5 min-w-0 flex-1">
                {typeof header === "string" ? (
                  <CardTitle>{header}</CardTitle>
                ) : (
                  header
                )}
                {typeof header === "string" && subHeader && (
                  <CardDescription>{subHeader}</CardDescription>
                )}
              </div>
              {action && <div className="shrink-0">{action}</div>}
            </CardHeader>
            <CardSeparator />
          </>
        )}
        <CardContent className={contentClassName}>{children}</CardContent>
      </Card>
    );
  },
);
ContentCard.displayName = "ContentCard";

export {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardSeparator,
  ContentCard,
};
