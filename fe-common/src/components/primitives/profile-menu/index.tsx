"use client";

import { LogOut } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

import { Avatar, AvatarFallback, AvatarImage } from "../avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../dropdown-menu";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface ProfileMenuUser {
  /** Display name shown in the header card */
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
  onSelect?: () => void;
  /** Visually marks the item as destructive (red text) */
  destructive?: boolean;
  /** Disables the item */
  disabled?: boolean;
  /** Renders a separator line above this item */
  separatorBefore?: boolean;
}

export interface ProfileMenuProps {
  /** User info displayed in the trigger and header card */
  user: ProfileMenuUser;
  /** Menu items rendered in the dropdown */
  items?: ProfileMenuItem[];
  /** When true, a built-in "Sign out" item is appended. Fires onSignOut. */
  showSignOut?: boolean;
  /** Callback for the built-in sign-out action */
  onSignOut?: () => void;
  /** Side of the trigger to place the dropdown. Default: "bottom" */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the dropdown. Default: "end" */
  align?: "start" | "center" | "end";
  /** Additional class names on the trigger button */
  triggerClassName?: string;
  /** Additional class names on the dropdown content */
  contentClassName?: string;
  /** Size of the avatar in the trigger. Default: "size-8" */
  avatarClassName?: string;
  /** Custom trigger element. Overrides the built-in trigger entirely. */
  customTrigger?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: ProfileAvatar
// ─────────────────────────────────────────────────────────────────────────────

function ProfileAvatar({
  user,
  className,
}: {
  user: ProfileMenuUser;
  className?: string;
}) {
  return (
    <Avatar className={cn("size-8", className)}>
      {user.avatarUrl && <AvatarImage src={user.avatarUrl} alt={user.name} />}
      <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
        {user.initials ?? user.name.slice(0, 2).toUpperCase()}
      </AvatarFallback>
    </Avatar>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// ProfileMenu
// ─────────────────────────────────────────────────────────────────────────────

function ProfileMenu({
  user,
  items = [],
  showSignOut = false,
  onSignOut,
  side = "bottom",
  align = "end",
  triggerClassName,
  contentClassName,
  avatarClassName,
  customTrigger,
}: ProfileMenuProps) {
  const allItems: ProfileMenuItem[] = React.useMemo(() => {
    const list = [...items];
    if (showSignOut) {
      list.push({
        key: "__sign-out__",
        label: "Sign out",
        icon: <LogOut className="size-4" />,
        onSelect: onSignOut,
        destructive: true,
        separatorBefore: list.length > 0,
      });
    }
    return list;
  }, [items, showSignOut, onSignOut]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {customTrigger ?? (
          <button
            type="button"
            data-slot="profile-menu-trigger"
            aria-label={`Profile menu for ${user.name}`}
            className={cn(
              "flex items-center gap-2 rounded-lg",
              "bg-transparent border-none cursor-pointer",
              "transition-colors hover:bg-accent",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              "px-2 py-1.5",
              triggerClassName,
            )}
          >
            <ProfileAvatar user={user} className={avatarClassName} />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-slot="profile-menu-content"
        side={side}
        align={align}
        className={cn("w-56", contentClassName)}
      >
        {/* User info header */}
        <div className="px-2 py-1.5 text-sm">
          <div className="flex items-center gap-2.5">
            <ProfileAvatar user={user} />
            <div className="flex flex-col min-w-0 flex-1">
              <span className="font-medium text-foreground truncate">
                {user.name}
              </span>
              {user.subtitle && (
                <span className="text-xs text-muted-foreground truncate">
                  {user.subtitle}
                </span>
              )}
            </div>
          </div>
        </div>

        {allItems.length > 0 && <DropdownMenuSeparator />}

        {allItems.map((item) => (
          <React.Fragment key={item.key}>
            {item.separatorBefore && <DropdownMenuSeparator />}
            <DropdownMenuItem
              disabled={item.disabled}
              variant={item.destructive ? "destructive" : "default"}
              className="cursor-pointer"
              onSelect={item.onSelect}
            >
              {item.icon}
              <span>{item.label}</span>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { ProfileMenu, ProfileAvatar };
