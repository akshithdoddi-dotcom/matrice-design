"use client";

import { XIcon } from "lucide-react";

import * as React from "react";

import * as SheetPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Primitives — shadcn pattern, inlined here so consumers depend only on `ui/`.
// ─────────────────────────────────────────────────────────────────────────────

function Sheet({ ...props }: React.ComponentProps<typeof SheetPrimitive.Root>) {
  return <SheetPrimitive.Root data-slot="sheet" {...props} />;
}

function SheetTrigger({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Trigger>) {
  return <SheetPrimitive.Trigger data-slot="sheet-trigger" {...props} />;
}

function SheetClose({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Close>) {
  return <SheetPrimitive.Close data-slot="sheet-close" {...props} />;
}

function SheetPortal({
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Portal>) {
  return <SheetPrimitive.Portal data-slot="sheet-portal" {...props} />;
}

function SheetOverlay({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Overlay>) {
  return (
    <SheetPrimitive.Overlay
      data-slot="sheet-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className,
      )}
      {...props}
    />
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Content> & {
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <SheetPrimitive.Content
        data-slot="sheet-content"
        className={cn(
          "bg-background data-[state=open]:animate-in data-[state=closed]:animate-out fixed z-50 flex flex-col gap-4 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500",
          side === "right" &&
            "data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right inset-y-0 right-0 h-full w-3/4 border-l sm:max-w-sm",
          side === "left" &&
            "data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left inset-y-0 left-0 h-full w-3/4 border-r sm:max-w-sm",
          side === "top" &&
            "data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top inset-x-0 top-0 h-auto border-b",
          side === "bottom" &&
            "data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom inset-x-0 bottom-0 h-auto border-t",
          className,
        )}
        {...props}
      >
        {children}
        <SheetPrimitive.Close className="ring-offset-background focus:ring-ring data-[state=open]:bg-secondary absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none">
          <XIcon className="size-4" />
          <span className="sr-only">Close</span>
        </SheetPrimitive.Close>
      </SheetPrimitive.Content>
    </SheetPortal>
  );
}

function SheetHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      {...props}
    />
  );
}

function SheetFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  );
}

function SheetTitle({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Title>) {
  return (
    <SheetPrimitive.Title
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  );
}

function SheetDescription({
  className,
  ...props
}: React.ComponentProps<typeof SheetPrimitive.Description>) {
  return (
    <SheetPrimitive.Description
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

// ─────────────────────────────────────────────────────────────────────────────
// Internal helpers
// ─────────────────────────────────────────────────────────────────────────────

const Separator = () => (
  <div
    className="h-px w-full bg-neutral-200 dark:bg-neutral-700"
    role="separator"
    aria-hidden="true"
  />
);

// ─────────────────────────────────────────────────────────────────────────────
// ManagedSheet types
// ─────────────────────────────────────────────────────────────────────────────

export interface ManagedSheetProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;

  /** Which edge the drawer slides in from. Default: "right". */
  side?: "top" | "right" | "bottom" | "left";

  /**
   * Drawer width when side is "left" or "right", height when "top" or "bottom".
   * - "sm"   → ~24rem (sm:max-w-sm)
   * - "md"   → ~32rem (sm:max-w-md)         ← default
   * - "lg"   → ~48rem (sm:max-w-2xl)
   * - "xl"   → ~64rem (sm:max-w-4xl)
   * - "full" → 100% of viewport on that axis
   */
  size?: "sm" | "md" | "lg" | "xl" | "full";

  /** Show separator lines between header↔body and body↔footer. Default: true. */
  dividers?: boolean;

  className?: string;
  contentClassName?: string;

  /** Renders inline after the title (e.g. tooltip icon, badge). */
  extraTitleNode?: React.ReactNode;

  children?: React.ReactNode;
  footer?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Size lookups
// ─────────────────────────────────────────────────────────────────────────────

const HORIZONTAL_SIZE_CLASS: Record<
  NonNullable<ManagedSheetProps["size"]>,
  string
> = {
  sm: "sm:max-w-sm w-full",
  md: "sm:max-w-md w-full",
  lg: "sm:max-w-2xl w-full",
  xl: "sm:max-w-4xl w-full",
  full: "w-screen sm:max-w-none",
};

const VERTICAL_SIZE_CLASS: Record<
  NonNullable<ManagedSheetProps["size"]>,
  string
> = {
  sm: "h-1/4",
  md: "h-1/3",
  lg: "h-1/2",
  xl: "h-2/3",
  full: "h-screen",
};

// ─────────────────────────────────────────────────────────────────────────────
// ManagedSheet — opinionated composite
// ─────────────────────────────────────────────────────────────────────────────

export const ManagedSheet = React.forwardRef<HTMLDivElement, ManagedSheetProps>(
  (
    {
      open,
      onClose,
      title,
      description,
      side = "right",
      size = "md",
      dividers = true,
      className,
      contentClassName,
      extraTitleNode,
      children,
      footer,
    },
    ref,
  ) => {
    const isHorizontal = side === "left" || side === "right";
    const sizeClass = isHorizontal
      ? HORIZONTAL_SIZE_CLASS[size]
      : VERTICAL_SIZE_CLASS[size];

    const hasTitle = title !== undefined && title !== null;
    const hasDescription = description !== undefined && description !== null;
    const hasHeader = hasTitle || hasDescription;
    const hasFooter = Boolean(footer);

    const showTopDivider = dividers && hasHeader;
    const showBottomDivider = dividers && hasFooter;

    return (
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          ref={ref}
          side={side}
          className={cn("flex flex-col h-full gap-0 p-0", sizeClass, className)}
        >
          {/* ── Header ── */}
          {hasHeader && (
            <SheetHeader className="p-6 gap-1">
              {hasTitle && (
                <div className="flex items-center gap-2 min-w-0 pr-8">
                  <SheetTitle className="text-lg font-semibold text-foreground leading-snug tracking-tight">
                    {title}
                  </SheetTitle>
                  {extraTitleNode && (
                    <span className="shrink-0 text-muted-foreground">
                      {extraTitleNode}
                    </span>
                  )}
                </div>
              )}
              {hasDescription && (
                <SheetDescription className="text-sm text-muted-foreground leading-relaxed">
                  {description}
                </SheetDescription>
              )}
            </SheetHeader>
          )}

          {showTopDivider && <Separator />}

          {/* ── Body ── */}
          <div
            className={cn(
              "flex-1 min-h-0 overflow-y-auto p-6 text-foreground",
              !hasHeader && "pt-12",
              contentClassName,
            )}
          >
            {children}
          </div>

          {/* ── Footer ── */}
          {showBottomDivider && <Separator />}

          {hasFooter && (
            <SheetFooter className="p-6 flex-row justify-end items-center gap-3 mt-0">
              {footer}
            </SheetFooter>
          )}
        </SheetContent>
      </Sheet>
    );
  },
);
ManagedSheet.displayName = "ManagedSheet";
