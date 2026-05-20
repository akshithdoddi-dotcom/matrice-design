"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "../dropdown-menu";
import { SidebarMenuButton, useOptionalSidebar } from "../sidebar";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface Platform {
  /** Unique identifier */
  value: string;
  /** Display label */
  label: string;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /** Keyboard shortcut hint (e.g. "1", "2") */
  shortcut?: string;
  /** URL to navigate to when selected */
  href?: string;
  /** Disables this option */
  disabled?: boolean;
}

export interface PlatformSwitcherProps {
  /** List of available platforms */
  platforms: Platform[];
  /** Currently active platform value */
  activePlatform?: string;
  /** Called when a platform is selected */
  onPlatformChange?: (value: string) => void;
  /** Logo element rendered as the icon in collapsed sidebar mode */
  logo?: React.ReactNode;
  /** Primary title (e.g. "Matrice.ai") */
  title: string;
  /** Secondary subtitle (e.g. "Support Platform") */
  subtitle?: string;
  /** Label shown above the platform list in the dropdown */
  dropdownLabel?: string;
  /** Side of the dropdown relative to trigger. Default: "right" when in sidebar, "bottom" otherwise */
  side?: "top" | "bottom" | "left" | "right";
  /** Alignment of the dropdown. Default: "start" */
  align?: "start" | "center" | "end";
  /** Additional class names on the trigger */
  triggerClassName?: string;
  /** Additional class names on the dropdown content */
  contentClassName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// PlatformSwitcher
// ─────────────────────────────────────────────────────────────────────────────

function PlatformSwitcher({
  platforms,
  activePlatform,
  onPlatformChange,
  logo,
  title,
  subtitle,
  dropdownLabel = "Platforms",
  side,
  align = "start",
  triggerClassName,
  contentClassName,
}: PlatformSwitcherProps) {
  const sidebarCtx = useOptionalSidebar();
  const isInSidebar = sidebarCtx !== null;
  const resolvedSide = side ?? (isInSidebar ? "right" : "bottom");

  const triggerContent = (
    <>
      <div className="flex aspect-square size-8 items-center justify-center shrink-0">
        {logo ?? (
          <div className="size-6 rounded bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {title.charAt(0)}
          </div>
        )}
      </div>
      <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
        <span className="truncate font-semibold">{title}</span>
        {subtitle && (
          <span className="truncate text-xs text-muted-foreground">
            {subtitle}
          </span>
        )}
      </div>
      <ChevronsUpDown className="ml-auto size-4 shrink-0" />
    </>
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isInSidebar ? (
          <SidebarMenuButton
            size="lg"
            data-slot="platform-switcher-trigger"
            className={cn(
              "cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground",
              triggerClassName,
            )}
          >
            {triggerContent}
          </SidebarMenuButton>
        ) : (
          <button
            type="button"
            data-slot="platform-switcher-trigger"
            className={cn(
              "flex w-full items-center gap-2 rounded-md p-2 text-left text-sm",
              "bg-transparent border-none cursor-pointer",
              "transition-colors hover:bg-accent hover:text-accent-foreground",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
              triggerClassName,
            )}
          >
            {triggerContent}
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent
        data-slot="platform-switcher-content"
        className={cn(
          "w-[--radix-dropdown-menu-trigger-width] min-w-64 rounded-lg p-1.5",
          contentClassName,
        )}
        align={align}
        side={resolvedSide}
        sideOffset={6}
      >
        <DropdownMenuLabel className="px-2 pt-1 pb-1.5 text-[11px] font-medium tracking-wide uppercase text-muted-foreground">
          {dropdownLabel}
        </DropdownMenuLabel>
        {platforms.map((platform) => {
          const isActive = platform.value === activePlatform;
          return (
            <DropdownMenuItem
              key={platform.value}
              disabled={platform.disabled}
              className={cn(
                "gap-2.5 px-2 py-2 rounded-md cursor-pointer transition-colors",
                isActive &&
                  "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground data-highlighted:bg-primary data-highlighted:text-primary-foreground [&>svg]:text-primary-foreground",
              )}
              onSelect={() => {
                if (platform.href) {
                  window.open(platform.href, "_blank", "noopener,noreferrer");
                }
                onPlatformChange?.(platform.value);
              }}
            >
              {platform.icon && (
                <div
                  className={cn(
                    "flex size-7 items-center justify-center rounded-md border border-edge shrink-0 bg-background",
                    isActive &&
                      "bg-primary-foreground border-primary-foreground text-primary [&_svg]:text-primary",
                  )}
                >
                  {platform.icon}
                </div>
              )}
              <span className="flex-1 truncate text-sm">{platform.label}</span>
              {isActive && <Check className="size-4 shrink-0" />}
              {platform.shortcut && !isActive && (
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-edge bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                  <span className="text-xs">&#8984;</span>
                  {platform.shortcut}
                </kbd>
              )}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export { PlatformSwitcher };
export type { Platform as PlatformSwitcherPlatform };
