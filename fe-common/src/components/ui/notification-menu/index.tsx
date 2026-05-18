import { Bell } from "lucide-react";

import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { Badge } from "../badge";
import { EmptyState } from "../empty-state";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationMenuProps<T = unknown> {
  /** Array of notification items to display */
  items: T[];
  /** Unique key extractor for each item */
  getKey: (item: T) => string;
  /** Render function for each notification item */
  renderItem: (item: T) => React.ReactNode;
  /** Called when a notification item is clicked */
  onItemClick?: (item: T) => void;
  /** Number displayed on the badge. Hidden when 0 or undefined. */
  badgeCount?: number;
  /** Maximum badge number before showing "N+" (default: 9) */
  badgeMax?: number;
  /** Title displayed in the dropdown header (default: "Notifications") */
  title?: string;
  /** Controls the popover open state externally */
  open?: boolean;
  /** Called when the popover open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Side of the trigger to place the popover. Default: "bottom" */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the popover. Default: "end" */
  align?: "start" | "center" | "end";
  /** Additional class names on the trigger button */
  triggerClassName?: string;
  /** Additional class names on the popover content panel */
  contentClassName?: string;
  /** Custom trigger element. Overrides the built-in bell button entirely. */
  customTrigger?: React.ReactNode;
  /** Content rendered at the bottom of the list (e.g. "Load more" button) */
  footer?: React.ReactNode;
  /** Empty state props when there are no items */
  emptyState?: {
    title?: string;
    description?: string;
    icon?: React.ReactNode;
  };
  /** Called when the scrollable list is scrolled — useful for infinite scroll */
  onScroll?: (event: React.UIEvent<HTMLDivElement>) => void;
}

// ─────────────────────────────────────────────────────────────────────────────
// NotificationMenu
// ─────────────────────────────────────────────────────────────────────────────

function NotificationMenuInner<T = unknown>(
  {
    items,
    getKey,
    renderItem,
    onItemClick,
    badgeCount = 0,
    badgeMax = 9,
    title = "Notifications",
    open: controlledOpen,
    onOpenChange,
    side = "bottom",
    align = "end",
    triggerClassName,
    contentClassName,
    customTrigger,
    footer,
    emptyState,
    onScroll,
  }: NotificationMenuProps<T>,
  ref: React.ForwardedRef<HTMLButtonElement>,
) {
  const [internalOpen, setInternalOpen] = React.useState(false);
  const isControlled = controlledOpen !== undefined;
  const isOpen = isControlled ? controlledOpen : internalOpen;

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (!isControlled) setInternalOpen(next);
      onOpenChange?.(next);
    },
    [isControlled, onOpenChange],
  );

  const displayCount =
    badgeCount > 0
      ? badgeCount > badgeMax
        ? `${badgeMax}+`
        : `${badgeCount}`
      : null;

  return (
    <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverPrimitive.Trigger asChild>
        {customTrigger ? (
          customTrigger
        ) : (
          <button
            ref={ref}
            type="button"
            aria-label={`${title}${badgeCount > 0 ? ` — ${badgeCount} unread` : ""}`}
            className={cn(
              "relative inline-flex items-center justify-center size-6 rounded-sm",
              "bg-transparent border-none cursor-pointer",
              "transition-colors duration-(--duration-fast)",
              "hover:bg-white/10",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-(--primary-main) focus-visible:ring-offset-1",
              triggerClassName,
            )}
          >
            <Bell
              size={24}
              className="text-(--sidebar-text)/50"
              aria-hidden="true"
            />
            {displayCount && (
              <Badge
                variant="error"
                size="sm"
                className="absolute -top-1.5 -right-2 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold leading-none"
              >
                {displayCount}
              </Badge>
            )}
          </button>
        )}
      </PopoverPrimitive.Trigger>

      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          className={cn(
            "z-1400 w-80 flex flex-col",
            "bg-elevated border border-border rounded-md shadow-lg",
            "outline-none max-h-[420px]",
            "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
            "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            contentClassName,
          )}
        >
          {/* Header */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-border shrink-0">
            <span className="text-sm font-semibold text-foreground flex-1">
              {title}
            </span>
            {displayCount && (
              <Badge variant="error" size="sm">
                {displayCount}
              </Badge>
            )}
          </div>

          {/* Scrollable list */}
          <div className="overflow-y-auto flex-1 min-h-0" onScroll={onScroll}>
            {items.length > 0 ? (
              items.map((item) => (
                <div
                  key={getKey(item)}
                  role={onItemClick ? "button" : undefined}
                  tabIndex={onItemClick ? 0 : undefined}
                  onClick={() => onItemClick?.(item)}
                  onKeyDown={(e) => {
                    if (onItemClick && (e.key === "Enter" || e.key === " ")) {
                      e.preventDefault();
                      onItemClick(item);
                    }
                  }}
                  className={cn(
                    "border-b border-border last:border-b-0",
                    onItemClick &&
                      "cursor-pointer hover:bg-hover transition-colors duration-(--duration-fast)",
                  )}
                >
                  {renderItem(item)}
                </div>
              ))
            ) : (
              <EmptyState
                title={emptyState?.title ?? "No notifications"}
                description={emptyState?.description}
                icon={
                  emptyState?.icon ?? (
                    <Bell
                      size={28}
                      className="text-muted-foreground"
                      aria-hidden="true"
                    />
                  )
                }
                size="sm"
              />
            )}
          </div>

          {/* Footer slot */}
          {footer && (
            <div className="border-t border-border shrink-0">{footer}</div>
          )}
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}

// forwardRef doesn't support generics directly, so we cast.
export const NotificationMenu = React.forwardRef(NotificationMenuInner) as <
  T = unknown,
>(
  props: NotificationMenuProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null;

(NotificationMenu as React.FC).displayName = "NotificationMenu";
