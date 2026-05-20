import { X } from "lucide-react";

import * as React from "react";

import * as DialogPrimitive from "@radix-ui/react-dialog";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import { Input } from "../input";

// ─────────────────────────────────────────────────────────────────────────────
// Primitives — low-level composable pieces (shadcn pattern)
// ─────────────────────────────────────────────────────────────────────────────

const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;

const DialogOverlay = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "mui-dialog-overlay fixed inset-0 z-50 bg-(--bg-overlay)",
      className,
    )}
    {...props}
  />
));
DialogOverlay.displayName = "DialogOverlay";

const DialogContent = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        "mui-dialog-content fixed left-1/2 top-1/2 z-50 w-full",
        "bg-(--bg-surface) border border-(--border-color) rounded-xl",
        "shadow-lg dark:shadow-2xl dark:shadow-black/30",
        "focus:outline-none",
        "flex flex-col",
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPortal>
));
DialogContent.displayName = "DialogContent";

const DialogHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex items-start justify-between gap-3 p-6 pb-4", className)}
    {...props}
  />
);
DialogHeader.displayName = "DialogHeader";

const DialogFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("flex justify-end items-center gap-3 p-6 pt-4", className)}
    {...props}
  />
);
DialogFooter.displayName = "DialogFooter";

const DialogTitle = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold text-foreground leading-snug tracking-tight",
      className,
    )}
    {...props}
  />
));
DialogTitle.displayName = "DialogTitle";

const DialogDescription = React.forwardRef<
  React.ComponentRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn(
      "mt-1 text-sm text-muted-foreground leading-relaxed",
      className,
    )}
    {...props}
  />
));
DialogDescription.displayName = "DialogDescription";

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
// ManagedDialog types
// ─────────────────────────────────────────────────────────────────────────────

export interface ConfirmationConfig {
  /** Alert banner text. Supports \n line breaks via white-space: pre-wrap. */
  message: string;
  /** String the user must type to enable the confirm button. Default: "CONFIRM" */
  confirmText?: string;
  /** Confirm button label. Default: "Confirm" */
  confirmLabel?: string;
  /** Cancel button label. Default: "Cancel" */
  cancelLabel?: string;
  /** Called when the user types the confirmText and clicks confirm. */
  onConfirm: () => void;
  /** Shows spinner on confirm button and keeps it disabled. */
  loading?: boolean;
  /** Alert color scheme. Default: "danger" */
  variant?: "danger" | "warning";
}

export interface ManagedDialogProps {
  open: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  size?: "sm" | "md" | "lg";
  /** Show separator lines between header↔content and content↔footer. Default: true */
  dividers?: boolean;
  className?: string;
  contentClassName?: string;
  /** Renders inline after the title (e.g. tooltip icon, badge). */
  extraTitleNode?: React.ReactNode;

  // ── General mode ──
  children?: React.ReactNode;
  footer?: React.ReactNode;

  // ── Confirmation mode (overrides children + footer) ──
  confirmation?: ConfirmationConfig;
}

// ─────────────────────────────────────────────────────────────────────────────
// ManagedDialog — opinionated composite
// ─────────────────────────────────────────────────────────────────────────────

const SIZE_CLASS: Record<NonNullable<ManagedDialogProps["size"]>, string> = {
  sm: "max-w-[500px]",
  md: "max-w-[700px]",
  lg: "max-w-[900px]",
};

export const ManagedDialog = React.forwardRef<
  HTMLDivElement,
  ManagedDialogProps
>(
  (
    {
      open,
      onClose,
      title,
      size = "sm",
      dividers = true,
      className,
      contentClassName,
      extraTitleNode,
      children,
      footer,
      confirmation,
    },
    _ref,
  ) => {
    const isConfirmation = confirmation !== undefined;

    // ── Confirmation internal state ──
    const [inputValue, setInputValue] = React.useState("");
    const [hasAttempted, setHasAttempted] = React.useState(false);

    // Reset state whenever the dialog closes
    React.useEffect(() => {
      if (!open) {
        setInputValue("");
        setHasAttempted(false);
      }
    }, [open]);

    const {
      message = "",
      confirmText = "CONFIRM",
      confirmLabel = "Confirm",
      cancelLabel = "Cancel",
      onConfirm,
      loading = false,
      variant: alertVariant = "danger",
    } = confirmation ?? ({} as ConfirmationConfig);

    const isMatch = isConfirmation && inputValue === confirmText;
    const showError = isConfirmation && hasAttempted && !isMatch;

    const handleConfirmClick = () => {
      if (isMatch) {
        onConfirm?.();
      } else {
        setHasAttempted(true);
      }
    };

    // ── Computed layout flags ──
    const hasTitle = title !== undefined && title !== null;
    const effectiveFooter = isConfirmation ? "__confirmation__" : footer;
    const showTopDivider = dividers && hasTitle;
    const showBottomDivider = dividers && Boolean(effectiveFooter);

    // Alert banner variant styles (all from CSS variables)
    const alertClass =
      alertVariant === "danger"
        ? "bg-(--color-error-bg) border-l-[3px] border-l-destructive text-destructive"
        : "bg-(--color-warning-bg) border-l-[3px] border-l-warning text-warning";

    return (
      <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
        <DialogContent
          className={cn(
            "w-[calc(100vw-2rem)] max-h-[85vh]",
            SIZE_CLASS[size],
            className,
          )}
        >
          {/* ── Close button — always visible ── */}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className={cn(
              "absolute top-5 right-5 z-10",
              "flex items-center justify-center w-8 h-8 rounded-full",
              "text-muted-foreground hover:text-foreground hover:bg-(--bg-hover)",
              "transition-all duration-(--duration-fast) ease-(--ease-snappy)",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main)",
            )}
          >
            <X size={16} />
          </button>

          {/* ── Header ── */}
          {hasTitle && (
            <DialogHeader>
              <div className="flex items-center gap-2 min-w-0 flex-1 pr-8">
                <DialogTitle>{title}</DialogTitle>
                {extraTitleNode && (
                  <span className="shrink-0 text-muted-foreground">
                    {extraTitleNode}
                  </span>
                )}
              </div>
            </DialogHeader>
          )}

          {showTopDivider && <Separator />}

          {/* ── Content ── */}
          <div
            className={cn(
              "p-6 overflow-auto flex-1 min-h-0 text-foreground",
              !hasTitle && "pt-12",
              contentClassName,
            )}
          >
            {isConfirmation ? (
              <div>
                {/* Alert banner */}
                <div
                  className={cn(
                    "rounded-lg p-4 mb-5 text-sm font-medium whitespace-pre-wrap leading-relaxed",
                    alertClass,
                  )}
                  role="alert"
                >
                  {message}
                </div>

                {/* Confirmation input */}
                <Input
                  placeholder={confirmText}
                  value={inputValue}
                  onChange={(e) => {
                    setInputValue(e.target.value);
                  }}
                  autoFocus
                  error={showError}
                  aria-label={`Type ${confirmText} to confirm`}
                  aria-describedby={
                    showError ? "dialog-confirm-error" : undefined
                  }
                />

                {/* Error message */}
                {showError && (
                  <p
                    id="dialog-confirm-error"
                    className="mt-2 text-xs text-destructive"
                    role="alert"
                  >
                    Text does not match. Please type{" "}
                    <strong className="font-semibold">{confirmText}</strong>{" "}
                    exactly.
                  </p>
                )}
              </div>
            ) : (
              children
            )}
          </div>

          {/* ── Footer ── */}
          {showBottomDivider && <Separator />}

          {isConfirmation ? (
            <DialogFooter>
              <Button variant="outline" onClick={onClose}>
                {cancelLabel}
              </Button>
              <Button
                variant="default"
                disabled={!isMatch || loading}
                isLoading={loading}
                onClick={handleConfirmClick}
                aria-disabled={!isMatch || undefined}
              >
                {confirmLabel}
              </Button>
            </DialogFooter>
          ) : (
            footer && <DialogFooter>{footer}</DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    );
  },
);
ManagedDialog.displayName = "ManagedDialog";

export {
  Dialog,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogClose,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
};
