"use client";

import { Bell } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Badge } from "../badge";
import { EmptyState } from "../empty-state";
import { Popover, PopoverContent, PopoverTrigger } from "../popover";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NotificationMenuProps<T = unknown> {
  /** Array of notification items to display */
  items: T[];
  /** Unique key extractor for each item */
  getKey: (item: T) => string;
  /** Render function for each notification item's content */
  renderItem: (item: T) => React.ReactNode;
  /** Called when a notification item is clicked */
  onItemClick?: (item: T) => void;
  /** Determines whether an item is unread (applies highlight styling) */
  isUnread?: (item: T) => boolean;
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
  /** Side of the trigger to place the popover (default: "bottom") */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the popover (default: "end") */
  align?: "start" | "center" | "end";
  /** Additional class names on the trigger button */
  triggerClassName?: string;
  /** Additional class names on the popover content panel */
  contentClassName?: string;
  /** Custom trigger element. Overrides the built-in bell button entirely. */
  customTrigger?: React.ReactNode;
  /** Action slot rendered in the header (e.g. "Mark all read" button) */
  headerAction?: React.ReactNode;
  /** Content rendered at the bottom of the list (e.g. "View all" link) */
  footer?: React.ReactNode;
  /** Empty state configuration when there are no items */
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
    isUnread,
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
    headerAction,
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
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <div data-slot="notification-menu">
        {/* ── Trigger ── */}
        <PopoverTrigger asChild>
          {customTrigger ? (
            customTrigger
          ) : (
            <button
              ref={ref}
              type="button"
              data-slot="notification-menu-trigger"
              aria-label={`${title}${badgeCount > 0 ? ` — ${badgeCount} unread` : ""}`}
              className={cn(
                "relative inline-flex items-center justify-center size-9 rounded-lg",
                "bg-transparent border-none cursor-pointer",
                "transition-colors duration-(--duration-fast)",
                "hover:bg-accent",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-ring focus-visible:ring-offset-1",
                triggerClassName,
              )}
            >
              <Bell
                size={20}
                className="text-sidebar-foreground/70"
                aria-hidden="true"
              />
              {displayCount && (
                <Badge
                  variant="error"
                  size="sm"
                  className="absolute -top-1 -right-1 min-w-4 h-4 flex items-center justify-center rounded-full text-[10px] font-bold leading-none px-1"
                >
                  {displayCount}
                </Badge>
              )}
            </button>
          )}
        </PopoverTrigger>

        {/* ── Content panel ── */}
        <PopoverContent
          data-slot="notification-menu-content"
          side={side}
          align={align}
          sideOffset={8}
          className={cn("w-96 max-h-120 flex flex-col p-0", contentClassName)}
        >
          {/* Header */}
          <div
            data-slot="notification-menu-header"
            className="flex items-center justify-between px-4 py-3 border-b border-border shrink-0"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">{title}</span>
              {displayCount && (
                <Badge
                  variant="error"
                  size="sm"
                  className="rounded-full min-w-4.5 text-center"
                >
                  {displayCount}
                </Badge>
              )}
            </div>
            {headerAction && (
              <div data-slot="notification-menu-header-action">
                {headerAction}
              </div>
            )}
          </div>

          {/* Scrollable list */}
          <div
            data-slot="notification-menu-list"
            role="list"
            className="overflow-y-auto flex-1 min-h-0"
            onScroll={onScroll}
          >
            {items.length > 0 ? (
              items.map((item) => {
                const unread = isUnread?.(item) ?? false;
                return (
                  <div
                    key={getKey(item)}
                    data-slot="notification-menu-item"
                    role="listitem"
                    tabIndex={onItemClick ? 0 : undefined}
                    onClick={onItemClick ? () => onItemClick(item) : undefined}
                    onKeyDown={
                      onItemClick
                        ? (e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              onItemClick(item);
                            }
                          }
                        : undefined
                    }
                    className={cn(
                      "flex gap-3 px-4 py-3 border-b border-border last:border-b-0",
                      "transition-colors duration-(--duration-fast)",
                      unread && "bg-primary/5",
                      onItemClick && "cursor-pointer hover:bg-muted/50",
                    )}
                  >
                    {renderItem(item)}
                  </div>
                );
              })
            ) : (
              <EmptyState
                data-slot="notification-menu-empty"
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
                className="py-8"
              />
            )}
          </div>

          {/* Footer */}
          {footer && (
            <div
              data-slot="notification-menu-footer"
              className="border-t border-border px-4 py-2.5 shrink-0"
            >
              {footer}
            </div>
          )}
        </PopoverContent>
      </div>
    </Popover>
  );
}

// forwardRef doesn't support generics directly, so we cast.
export const NotificationMenu = React.forwardRef(NotificationMenuInner) as <
  T = unknown,
>(
  props: NotificationMenuProps<T> & React.RefAttributes<HTMLButtonElement>,
) => React.ReactElement | null;

(NotificationMenu as React.FC).displayName = "NotificationMenu";
