import type * as React from "react";

// ─────────────────────────────────────────────────────────────────────────────
// Menu Item
// ─────────────────────────────────────────────────────────────────────────────

/** A single navigation entry rendered inside the sidebar. */
export interface SidebarMenuItemConfig {
  /** Unique key used as the React list key. */
  key: string;
  /** Visible label for this item. */
  label: string;
  /** Icon rendered in both expanded and collapsed states. */
  icon?: React.ReactNode;
  /** Icon rendered when `isActive` is true. Falls back to `icon` when omitted. */
  activeIcon?: React.ReactNode;
  /** Navigation target. Renders an anchor when provided. */
  href?: string;
  /** Click handler — mutually exclusive with `href` for semantic clarity. */
  onClick?: (event: React.MouseEvent) => void;
  /** Marks this item as the currently active page/route. */
  isActive?: boolean;
  /** Badge rendered beside the label (e.g. unread count). */
  badge?: string | number;
  /** Disables the item interaction. */
  disabled?: boolean;
  /** Nested items rendered as a sub-menu. */
  children?: SidebarMenuItemConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Menu Group
// ─────────────────────────────────────────────────────────────────────────────

/** A labelled group of menu items (e.g. "Platform", "Settings"). */
export interface SidebarMenuGroupConfig {
  /** Unique key for the group. */
  key: string;
  /** Heading label rendered above the items. Hidden when sidebar is collapsed. */
  label?: string;
  /** Items inside this group. */
  items: SidebarMenuItemConfig[];
}

// ─────────────────────────────────────────────────────────────────────────────
// Platform
// ─────────────────────────────────────────────────────────────────────────────

/** A platform entry for the built-in header switcher. */
export interface SidebarPlatformConfig {
  /** Unique identifier (e.g. "analytics", "support"). */
  value: string;
  /** Human-readable label. */
  label: string;
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** URL opened in a new tab when this platform is selected. */
  href: string;
  /** Keyboard shortcut hint (e.g. "1", "2"). */
  shortcut?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ClassNames
// ─────────────────────────────────────────────────────────────────────────────

/** Granular class-name overrides for each sidebar region. */
export interface SidebarClassNames {
  /** The outermost sidebar wrapper (peer element). */
  root?: string;
  /** The header region. */
  header?: string;
  /** The scrollable content area. */
  content?: string;
  /** The footer region. */
  footer?: string;
  /** Each `SidebarGroup` wrapper. */
  group?: string;
  /** Each `SidebarMenuButton`. */
  menuButton?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// AppSidebar (public API)
// ─────────────────────────────────────────────────────────────────────────────

export interface AppSidebarProps {
  // ── Header (Matrice brand by default) ──────────────────────────────────

  /**
   * Currently active platform value — highlights it in the platform switcher.
   * When omitted the switcher still renders but without a check mark.
   */
  activePlatform?: string;

  /**
   * Primary title shown in the header.
   * @default "Matrice AI"
   */
  title?: string;

  /** Secondary subtitle (e.g. "Support Platform"). */
  subtitle?: string;

  /**
   * Logo element rendered in both collapsed and expanded states.
   * Defaults to the built-in Matrice SVG logo.
   */
  logo?: React.ReactNode;

  /**
   * Platforms available in the header switcher dropdown.
   * When omitted the built-in Matrice platform list is used.
   */
  platforms?: SidebarPlatformConfig[];

  /** Called when a platform is selected from the switcher. */
  onPlatformChange?: (value: string) => void;

  /**
   * **Full override** — replaces the entire header (logo + platform switcher).
   * When provided, `title`, `subtitle`, `logo`, `platforms`, and
   * `activePlatform` are ignored.
   */
  header?: React.ReactNode;

  // ── Navigation ─────────────────────────────────────────────────────────

  /**
   * Primary navigation items rendered in the scrollable content area.
   * Accepts flat items or grouped items for section headings.
   */
  menuItems: (SidebarMenuItemConfig | SidebarMenuGroupConfig)[];

  /**
   * Items pinned to the sidebar footer — same shape as `menuItems`.
   */
  footerItems?: (SidebarMenuItemConfig | SidebarMenuGroupConfig)[];

  // ── Custom footer ──────────────────────────────────────────────────────

  /**
   * Optional custom footer rendered **below** `footerItems`.
   * Use this for profile cards, version info, or other non-menu content.
   * Not rendered by default.
   */
  customFooter?: React.ReactNode;

  // ── State ──────────────────────────────────────────────────────────────

  /** Default open state (uncontrolled). @default true */
  defaultOpen?: boolean;

  /** Controlled open state. */
  open?: boolean;

  /** Callback when the sidebar open/collapsed state changes. */
  onOpenChange?: (open: boolean) => void;

  // ── Layout ─────────────────────────────────────────────────────────────

  /** Which side of the viewport the sidebar renders on. @default "left" */
  side?: "left" | "right";

  /**
   * Visual variant.
   * - `"sidebar"` — standard attached sidebar.
   * - `"floating"` — rounded with shadow, inset from edges.
   * - `"inset"` — content area insets with rounded corners.
   * @default "sidebar"
   */
  variant?: "sidebar" | "floating" | "inset";

  /**
   * Collapse behaviour.
   * - `"offcanvas"` — slides off-screen.
   * - `"icon"` — collapses to icon-only rail.
   * - `"none"` — always expanded, cannot collapse.
   * @default "offcanvas"
   */
  collapsible?: "offcanvas" | "icon" | "none";

  // ── Customisation ──────────────────────────────────────────────────────

  /** Granular class-name overrides for each sidebar region. */
  classNames?: SidebarClassNames;

  /**
   * Show a rail (thin drag handle) on the sidebar edge for toggling.
   * @default false
   */
  showRail?: boolean;

  /**
   * Show the skeleton loading state instead of navigation items.
   * Useful while menu data is being fetched.
   * @default false
   */
  loading?: boolean;

  /** Number of skeleton rows to show in loading state. @default 5 */
  loadingCount?: number;

  /**
   * Page content rendered alongside the sidebar, inside the same provider.
   * This is required so that `SidebarTrigger`, `SidebarInset`, and any
   * component calling `useSidebar()` can access the sidebar context.
   *
   * @example
   * ```tsx
   * <AppSidebar menuItems={items}>
   *   <SidebarInset>
   *     <header><SidebarTrigger /></header>
   *     <main>Page content</main>
   *   </SidebarInset>
   * </AppSidebar>
   * ```
   */
  children?: React.ReactNode;
}
