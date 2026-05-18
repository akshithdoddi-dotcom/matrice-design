"use client";

import { BarChart3, Headphones, Monitor, Shield } from "lucide-react";

import * as React from "react";

import { MatriceLogo } from "@/shared/svgs";

import { PlatformSwitcher } from "../platform-switcher";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSkeleton,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
  SidebarRail,
} from "./sidebar";
import type {
  AppSidebarProps,
  SidebarMenuGroupConfig,
  SidebarMenuItemConfig,
  SidebarPlatformConfig,
} from "./types";

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────

const DEFAULT_TITLE = "Matrice AI";

const DEFAULT_PLATFORMS: SidebarPlatformConfig[] = [
  {
    value: "analytics",
    label: "Matrice Analytics",
    icon: <BarChart3 className="size-4 shrink-0" />,
    href: "https://analytics.app.matrice.ai",
    shortcut: "1",
  },
  {
    value: "vms",
    label: "Matrice VMS",
    icon: <Monitor className="size-4 shrink-0" />,
    href: "https://streaming.app.matrice.ai",
    shortcut: "2",
  },
  {
    value: "support",
    label: "Matrice Support",
    icon: <Headphones className="size-4 shrink-0" />,
    href: "https://support.app.matrice.ai",
    shortcut: "3",
  },
  {
    value: "internal",
    label: "Matrice Internal",
    icon: <Shield className="size-4 shrink-0" />,
    href: "https://internal.app.matrice.ai",
    shortcut: "4",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// Type guard
// ─────────────────────────────────────────────────────────────────────────────

function isMenuGroup(
  item: SidebarMenuItemConfig | SidebarMenuGroupConfig,
): item is SidebarMenuGroupConfig {
  return "items" in item && Array.isArray(item.items);
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: renders a single menu item (with optional sub-items)
// ─────────────────────────────────────────────────────────────────────────────

function NavItem({
  item,
  menuButtonClassName,
}: {
  item: SidebarMenuItemConfig;
  menuButtonClassName?: string;
}) {
  const resolvedIcon =
    item.isActive && item.activeIcon ? item.activeIcon : item.icon;

  const hasChildren = item.children && item.children.length > 0;

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        asChild={Boolean(item.href)}
        isActive={item.isActive}
        tooltip={item.label}
        disabled={item.disabled}
        className={menuButtonClassName}
        onClick={item.href ? undefined : item.onClick}
      >
        {item.href ? (
          <a href={item.href}>
            {resolvedIcon}
            <span>{item.label}</span>
          </a>
        ) : (
          <>
            {resolvedIcon}
            <span>{item.label}</span>
          </>
        )}
      </SidebarMenuButton>

      {item.badge !== undefined && item.badge !== null && (
        <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
      )}

      {hasChildren && (
        <SidebarMenuSub>
          {item.children!.map((child) => (
            <SidebarMenuSubItem key={child.key}>
              <SidebarMenuSubButton
                asChild={Boolean(child.href)}
                isActive={child.isActive}
              >
                {child.href ? (
                  <a href={child.href}>
                    {child.icon}
                    <span>{child.label}</span>
                  </a>
                ) : (
                  <span
                    role="button"
                    tabIndex={0}
                    onClick={child.onClick}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        child.onClick?.(e as unknown as React.MouseEvent);
                      }
                    }}
                  >
                    {child.icon}
                    <span>{child.label}</span>
                  </span>
                )}
              </SidebarMenuSubButton>
            </SidebarMenuSubItem>
          ))}
        </SidebarMenuSub>
      )}
    </SidebarMenuItem>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: renders a flat list OR grouped list of items
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Collects consecutive flat items into a single implicit group so they share
 * one `SidebarGroup` wrapper (and its padding) instead of each getting their
 * own. Explicit `SidebarMenuGroupConfig` entries always start a new group.
 */
function groupConsecutiveItems(
  items: (SidebarMenuItemConfig | SidebarMenuGroupConfig)[],
): (SidebarMenuItemConfig[] | SidebarMenuGroupConfig)[] {
  const result: (SidebarMenuItemConfig[] | SidebarMenuGroupConfig)[] = [];
  let currentFlat: SidebarMenuItemConfig[] = [];

  for (const entry of items) {
    if (isMenuGroup(entry)) {
      if (currentFlat.length > 0) {
        result.push(currentFlat);
        currentFlat = [];
      }
      result.push(entry);
    } else {
      currentFlat.push(entry);
    }
  }

  if (currentFlat.length > 0) {
    result.push(currentFlat);
  }

  return result;
}

function NavSection({
  items,
  groupClassName,
  menuButtonClassName,
}: {
  items: (SidebarMenuItemConfig | SidebarMenuGroupConfig)[];
  groupClassName?: string;
  menuButtonClassName?: string;
}) {
  const grouped = groupConsecutiveItems(items);

  return (
    <>
      {grouped.map((entry) => {
        // Explicit group with label
        if (!Array.isArray(entry)) {
          return (
            <SidebarGroup key={entry.key} className={groupClassName}>
              {entry.label && (
                <SidebarGroupLabel>{entry.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {entry.items.map((item) => (
                    <NavItem
                      key={item.key}
                      item={item}
                      menuButtonClassName={menuButtonClassName}
                    />
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        }

        // Consecutive flat items — single implicit group
        return (
          <SidebarGroup
            key={entry.map((i) => i.key).join("-")}
            className={groupClassName}
          >
            <SidebarGroupContent>
              <SidebarMenu>
                {entry.map((item) => (
                  <NavItem
                    key={item.key}
                    item={item}
                    menuButtonClassName={menuButtonClassName}
                  />
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        );
      })}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: loading skeleton
// ─────────────────────────────────────────────────────────────────────────────

function NavSkeleton({ count }: { count: number }) {
  return (
    <SidebarGroup>
      <SidebarGroupContent>
        <SidebarMenu>
          {Array.from({ length: count }, (_, i) => (
            <SidebarMenuItem key={i}>
              <SidebarMenuSkeleton showIcon />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: default brand header
// ─────────────────────────────────────────────────────────────────────────────

function DefaultBrandHeader({
  title,
  subtitle,
  logo,
  platforms,
  activePlatform,
  onPlatformChange,
  className,
}: {
  title: string;
  subtitle?: string;
  logo: React.ReactNode;
  platforms: SidebarPlatformConfig[];
  activePlatform?: string;
  onPlatformChange?: (value: string) => void;
  className?: string;
}) {
  return (
    <SidebarHeader className={className}>
      <SidebarMenu>
        <SidebarMenuItem>
          <PlatformSwitcher
            platforms={platforms}
            activePlatform={activePlatform}
            onPlatformChange={onPlatformChange}
            title={title}
            subtitle={subtitle}
            logo={logo}
          />
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarHeader>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: sidebar body (needs to be inside SidebarProvider)
// ─────────────────────────────────────────────────────────────────────────────

function SidebarBody({
  // Header
  header,
  title = DEFAULT_TITLE,
  subtitle,
  logo,
  platforms = DEFAULT_PLATFORMS,
  activePlatform,
  onPlatformChange,
  // Navigation
  menuItems,
  footerItems,
  customFooter,
  // Layout
  side = "left",
  variant = "sidebar",
  collapsible = "offcanvas",
  // Customisation
  classNames,
  showRail = false,
  loading = false,
  loadingCount = 5,
}: Omit<AppSidebarProps, "defaultOpen" | "open" | "onOpenChange">) {
  const resolvedLogo = logo ?? <MatriceLogo size={24} />;
  const hasFooterItems = footerItems && footerItems.length > 0;
  const hasCustomFooter = customFooter !== undefined;

  return (
    <Sidebar
      side={side}
      variant={variant}
      collapsible={collapsible}
      className={classNames?.root}
    >
      {/* ── Header ────────────────────────────────────────────────────── */}
      {header !== undefined ? (
        <SidebarHeader className={classNames?.header}>{header}</SidebarHeader>
      ) : (
        <DefaultBrandHeader
          title={title}
          subtitle={subtitle}
          logo={resolvedLogo}
          platforms={platforms}
          activePlatform={activePlatform}
          onPlatformChange={onPlatformChange}
          className={classNames?.header}
        />
      )}

      {/* ── Content ───────────────────────────────────────────────────── */}
      <SidebarContent className={classNames?.content}>
        {loading ? (
          <NavSkeleton count={loadingCount} />
        ) : (
          <NavSection
            items={menuItems}
            groupClassName={classNames?.group}
            menuButtonClassName={classNames?.menuButton}
          />
        )}
      </SidebarContent>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      {(hasFooterItems || hasCustomFooter) && (
        <SidebarFooter className={classNames?.footer}>
          {hasFooterItems && !loading && (
            <NavSection
              items={footerItems!}
              groupClassName={classNames?.group}
              menuButtonClassName={classNames?.menuButton}
            />
          )}
          {hasCustomFooter && customFooter}
        </SidebarFooter>
      )}

      {/* ── Rail ──────────────────────────────────────────────────────── */}
      {showRail && <SidebarRail />}
    </Sidebar>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// AppSidebar (public component)
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Production-ready, props-driven sidebar for Matrice platform applications.
 *
 * Wraps the low-level shadcn/radix primitives into a single component that
 * accepts declarative props — consumers never assemble primitives themselves.
 *
 * ### Default header
 * By default, the Matrice brand header with a platform switcher is rendered.
 * Customise it via `title`, `subtitle`, `logo`, `activePlatform`, and
 * `platforms`. To replace the header entirely, pass the `header` prop.
 *
 * ### Navigation
 * Pass flat `SidebarMenuItemConfig[]` or grouped `SidebarMenuGroupConfig[]`
 * to `menuItems` and `footerItems`.
 *
 * ### Custom footer
 * Pass `customFooter` for non-menu content below the footer items (e.g.
 * profile card, version info). Not rendered by default.
 *
 * @example
 * ```tsx
 * <AppSidebar
 *   activePlatform="support"
 *   subtitle="Support Platform"
 *   menuItems={[
 *     { key: "home", label: "Home", icon: <Home />, href: "/", isActive: true },
 *     { key: "users", label: "Users", icon: <Users />, href: "/users" },
 *   ]}
 *   footerItems={[
 *     { key: "settings", label: "Settings", icon: <Settings />, href: "/settings" },
 *   ]}
 *   collapsible="icon"
 * />
 * ```
 */
function AppSidebar({
  defaultOpen,
  open,
  onOpenChange,
  children,
  ...sidebarProps
}: AppSidebarProps) {
  return (
    <SidebarProvider
      defaultOpen={defaultOpen}
      open={open}
      onOpenChange={onOpenChange}
    >
      <SidebarBody {...sidebarProps} />
      {children}
    </SidebarProvider>
  );
}

export { AppSidebar };
export type {
  AppSidebarProps,
  SidebarMenuItemConfig,
  SidebarMenuGroupConfig,
  SidebarPlatformConfig,
  SidebarClassNames,
} from "./types";
