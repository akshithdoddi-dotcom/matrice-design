import * as React from "react";

/* -------------------------------------------------------------------------- */
/*  Sidebar Context                                                           */
/* -------------------------------------------------------------------------- */

export interface SidebarContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  collapsed: boolean;
  collapsible: boolean;
}

/* -------------------------------------------------------------------------- */
/*  Compound component props                                                  */
/* -------------------------------------------------------------------------- */

export interface SidebarProps extends React.HTMLAttributes<HTMLElement> {
  /** Uncontrolled default open state. */
  defaultOpen?: boolean;
  /** Controlled open state. */
  open?: boolean;
  /** Callback when the open state changes. */
  onOpenChange?: (open: boolean) => void;
  /** Whether the sidebar can be collapsed. @default true */
  collapsible?: boolean;
  /**
   * Whether the built-in floating toggle button (ChevronLeft) is rendered.
   * Set to `false` when an external control (e.g. Navbar PanelLeft) drives
   * the sidebar open state.
   * @default true
   */
  showToggleButton?: boolean;
  /** If true, sidebar expands on hover and collapses on mouse leave. @default false */
  onHoverOpen?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarNavProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarNavItemProps extends Omit<
  React.HTMLAttributes<HTMLElement>,
  "children"
> {
  /** Icon rendered before the label. */
  icon?: React.ReactNode;
  /** Whether this item is the current/active page. */
  active?: boolean;
  /** Optional badge count/text shown on the item. */
  badge?: number | string;
  /** Navigation target. Renders an <a> when provided. */
  href?: string;
  /** Custom wrapper element (e.g. a framework Link component). */
  as?: React.ElementType;
  /** Tooltip text shown when sidebar is collapsed. Defaults to children text. */
  tooltip?: string;
  /**
   * Item size variant.
   * - `"default"` — 13px / font-weight 500 when inactive (standard nav items).
   * - `"lg"` — 14px / font-weight 400 when inactive (footer utility items).
   * @default "default"
   */
  size?: "default" | "lg";
  /** Click handler. */
  onClick?: (event: React.MouseEvent) => void;
  /** Label content. */
  children: React.ReactNode;
  className?: string;
}

export interface SidebarNavGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Group heading label displayed above the nav items. */
  label: string;
  /** Nav items belonging to this group. */
  children: React.ReactNode;
  className?: string;
}

export interface SidebarFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export interface SidebarLogoProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "title"
> {
  /** The icon/mark shown in both expanded and collapsed states. */
  logo: React.ReactNode;
  /** The primary wordmark/title shown when expanded. */
  title?: React.ReactNode;
  /** Optional subtitle or context label shown below the title when expanded. */
  subtitle?: React.ReactNode;
  /**
   * When provided, the entire logo row becomes a clickable trigger that opens
   * a Command popover below the row. The content is composed by the consumer
   * using the Command primitives.
   */
  commandContent?: React.ReactNode;
  /**
   * @deprecated Use `commandContent` instead. Simple click callback — no
   * popover is rendered when only this prop is provided.
   */
  onTriggerClick?: () => void;
  className?: string;
}

/* -------------------------------------------------------------------------- */
/*  SidebarBrandHeader                                                        */
/* -------------------------------------------------------------------------- */

/** A single entry in the platform/workspace switcher popover. */
export interface SidebarPlatformOption {
  /** Unique identifier for this platform. */
  value: string;
  /** Human-readable platform name. */
  label: string;
  /** Icon rendered to the left of the label. */
  icon?: React.ReactNode;
  /** URL to open in a new tab when this platform is selected. */
  href: string;
}

export interface SidebarBrandHeaderProps extends Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  /** Primary wordmark displayed when the sidebar is expanded. */
  title?: string;
  /** Secondary label displayed below the title when expanded. */
  subtitle?: string;
  /**
   * Custom logo element rendered in both collapsed and expanded states.
   * Defaults to the built-in Matrice SVG logo when omitted.
   */
  logo?: React.ReactNode;
  /**
   * The currently active platform value — used only to show a check icon.
   * The platform list itself is managed internally.
   */
  activePlatform?: string;
}
