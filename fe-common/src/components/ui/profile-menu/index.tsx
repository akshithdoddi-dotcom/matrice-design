import { ChevronDown, LogOut } from "lucide-react";

import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileMenuUser {
  /** Display name shown in the expanded card */
  name: string;
  /** Secondary line — role, email, etc. */
  subtitle?: string;
  /** Avatar image URL. When absent the fallback initials are shown. */
  avatarUrl?: string;
  /** 1–2 character fallback rendered when avatarUrl is missing or fails */
  initials?: string;
}

export interface ProfileMenuItem {
  /** Unique key for this item */
  key: string;
  /** Label text */
  label: string;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /** Called when the item is clicked. The menu closes automatically. */
  onClick?: () => void;
  /** Visually marks the item as destructive (red text) */
  destructive?: boolean;
  /** Disables the item */
  disabled?: boolean;
  /** Renders a separator line above this item */
  separatorBefore?: boolean;
}

export interface ProfileMenuProps {
  /** User info displayed in the trigger and expanded card */
  user: ProfileMenuUser;
  /** Menu items rendered in the dropdown */
  items?: ProfileMenuItem[];
  /** When true, a built-in "Sign out" item is appended. Fires onSignOut. */
  showSignOut?: boolean;
  /** Callback for the built-in sign-out action */
  onSignOut?: () => void;
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
  /** Additional class names on the popover content */
  contentClassName?: string;
  /**
   * Render mode for the trigger.
   * - "avatar" (default): shows only the avatar circle
   * - "expanded": shows avatar + name/subtitle + chevron (sidebar-style)
   */
  variant?: "avatar" | "expanded";
  /** Custom trigger element. Overrides the built-in trigger entirely. */
  customTrigger?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: Avatar trigger (compact)
// ─────────────────────────────────────────────────────────────────────────────

const ProfileAvatar = React.forwardRef<
  HTMLSpanElement,
  { user: ProfileMenuUser; className?: string }
>(({ user, className }, ref) => (
  <Avatar
    ref={ref}
    size="sm"
    className={cn(
      "size-8 bg-primary flex text-white justify-center rounded-full items-center",
      className,
    )}
  >
    {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
    <AvatarFallback className="text-white primary-main w-full h-full flex justify-center items-center text-xs rounded-full font-bold">
      {user.initials ?? user.name.slice(0, 2).toUpperCase()}
    </AvatarFallback>
  </Avatar>
));
ProfileAvatar.displayName = "ProfileAvatar";

// ─────────────────────────────────────────────────────────────────────────────
// ProfileMenu
// ─────────────────────────────────────────────────────────────────────────────

export const ProfileMenu = React.forwardRef<
  HTMLButtonElement,
  ProfileMenuProps
>(
  (
    {
      user,
      items = [],
      showSignOut = false,
      onSignOut,
      open: controlledOpen,
      onOpenChange,
      side = "bottom",
      align = "end",
      triggerClassName,
      contentClassName,
      variant = "avatar",
      customTrigger,
    },
    ref,
  ) => {
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

    const close = React.useCallback(
      () => handleOpenChange(false),
      [handleOpenChange],
    );

    // Build final items list
    const allItems: ProfileMenuItem[] = React.useMemo(() => {
      const list = [...items];
      if (showSignOut) {
        list.push({
          key: "__sign-out__",
          label: "Sign out",
          icon: <LogOut size={14} />,
          onClick: onSignOut,
          destructive: true,
          separatorBefore: list.length > 0,
        });
      }
      return list;
    }, [items, showSignOut, onSignOut]);

    return (
      <PopoverPrimitive.Root open={isOpen} onOpenChange={handleOpenChange}>
        <PopoverPrimitive.Trigger asChild>
          {customTrigger ? (
            customTrigger
          ) : variant === "expanded" ? (
            <button
              ref={ref}
              type="button"
              className={cn(
                "flex items-center gap-2.5 w-full px-1.5 py-1.5 rounded-md",
                "bg-(--sidebar-profile-bg) border border-(--sidebar-profile-border)",
                "cursor-pointer transition-colors duration-(--duration-fast)",
                "hover:bg-(--sidebar-profile-hover-bg)",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-inset",
                triggerClassName,
              )}
            >
              <ProfileAvatar user={user} />
              <div className="flex flex-col items-start min-w-0 flex-1">
                <span className="text-[13px] font-bold leading-tight text-(--sidebar-text) truncate w-full text-left">
                  {user.name}
                </span>
                {user.subtitle && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-(--sidebar-profile-text-muted) truncate w-full text-left">
                    {user.subtitle}
                  </span>
                )}
              </div>
              <ChevronDown
                size={14}
                className="text-(--sidebar-text)/60 shrink-0"
                aria-hidden="true"
              />
            </button>
          ) : (
            <button
              ref={ref}
              type="button"
              aria-label={`Profile menu for ${user.name}`}
              className={cn(
                "inline-flex items-center justify-center size-8 rounded-full",
                "bg-transparent border-none cursor-pointer",
                "transition-colors duration-(--duration-fast)",
                "hover:ring-2 hover:ring-(--primary-main)/40",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main)",
                triggerClassName,
              )}
            >
              <ProfileAvatar user={user} />
            </button>
          )}
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side={side}
            align={align}
            sideOffset={8}
            className={cn(
              "z-1400 w-56 p-1",
              "bg-elevated border border-border rounded-md shadow-lg",
              "outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
              contentClassName,
            )}
          >
            {/* User info card at top */}
            <div className="flex items-center gap-2.5 px-2 py-2.5">
              <ProfileAvatar user={user} />
              <div className="flex flex-col min-w-0 flex-1">
                <span className="text-sm font-semibold text-foreground truncate">
                  {user.name}
                </span>
                {user.subtitle && (
                  <span className="text-xs text-muted-foreground truncate">
                    {user.subtitle}
                  </span>
                )}
              </div>
            </div>

            {/* Separator between user card and menu items */}
            {allItems.length > 0 && (
              <div
                className="h-px bg-border mx-1 my-1"
                role="separator"
                aria-hidden="true"
              />
            )}

            {/* Menu items */}
            {allItems.map((item) => (
              <React.Fragment key={item.key}>
                {item.separatorBefore && (
                  <div
                    className="h-px bg-border mx-1 my-1"
                    role="separator"
                    aria-hidden="true"
                  />
                )}
                <button
                  type="button"
                  disabled={item.disabled}
                  onClick={() => {
                    item.onClick?.();
                    close();
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm",
                    "text-sm cursor-pointer border-none bg-transparent",
                    "transition-colors duration-(--duration-fast)",
                    "hover:bg-hover",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-inset",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    item.destructive
                      ? "text-destructive hover:bg-destructive/10"
                      : "text-foreground",
                  )}
                >
                  {item.icon && (
                    <span
                      className="shrink-0 size-4 inline-flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {item.icon}
                    </span>
                  )}
                  <span className="flex-1 text-left truncate">
                    {item.label}
                  </span>
                </button>
              </React.Fragment>
            ))}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

ProfileMenu.displayName = "ProfileMenu";
