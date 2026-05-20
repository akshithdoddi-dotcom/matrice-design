import {
  Bell,
  Check,
  ChevronDown,
  ChevronRight,
  Loader2,
  PanelLeft,
  Search,
} from "lucide-react";

import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";

import { useOptionalSidebar } from "../sidebar";
import { NavbarActionStatus, navbarActionConfig } from "./navbar-action.config";

// Re-export action config so consumers can import from "navbar" directly
export { NavbarActionStatus, navbarActionConfig } from "./navbar-action.config";
export type { NavbarActionVariant } from "./navbar-action.config";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export interface NavbarDropdownOption {
  value: string;
  label: string;
  /** Icon rendered before the label */
  icon?: React.ReactNode;
  /** Per-option action. When provided, fires this instead of the parent onChange. */
  onClick?: () => void;
  /** Disables this option */
  disabled?: boolean;
}

export interface NavbarBreadcrumbDropdown {
  value: string;
  options: NavbarDropdownOption[];
  onChange?: (value: string) => void;
  /** Renders a small status dot before the label text */
  statusDot?: boolean;
  /** CSS color value for the status dot; defaults to neutral gray */
  statusColor?: string;
  /** Shows a loading spinner instead of the chevron while options are being fetched */
  loading?: boolean;
  /** Placeholder label shown when value is empty or not found in options */
  placeholder?: string;
  /** Renders custom content instead of the default NavbarDropdownButton.
   *  Use for segments that need richer UX (modal pickers, static labels, etc.) */
  customSlot?: React.ReactNode;
}

export interface NavbarProps extends React.HTMLAttributes<HTMLElement> {
  // ── Sidebar toggle ────────────────────────────────────────────────────────
  /** Overrides the sidebar context toggle when provided */
  onToggleSidebar?: () => void;
  /** Overrides the sidebar context open state when provided */
  isSidebarOpen?: boolean;

  // ── Left / breadcrumb ─────────────────────────────────────────────────────
  /** Root label of the breadcrumb path, e.g. "Projects" */
  breadcrumbRoot?: string;
  /** Up to N dropdown selectors rendered as breadcrumb segments */
  breadcrumbDropdowns?: NavbarBreadcrumbDropdown[];
  /**
   * Custom content rendered inside the breadcrumb nav after the dropdown pills.
   * Use for custom triggers (e.g. a paginated project picker) that need richer
   * UX than a simple popover list. A ChevronRight separator is inserted
   * automatically before the slot when preceding content exists.
   */
  breadcrumbSlot?: React.ReactNode;

  // ── Action button (start / stop) ──────────────────────────────────────────
  /** Current status of the action — controls which button variant is shown */
  actionStatus?: NavbarActionStatus;
  /** Callback fired when the action button (start or stop) is clicked.
   *  Receives the current status so the consumer can decide the next state. */
  onActionClick?: (currentStatus: NavbarActionStatus) => void;

  // ── Right section ─────────────────────────────────────────────────────────
  /** Renders a live HH:MM:SS AM/PM clock widget */
  showClock?: boolean;
  /** Callback when the search widget is clicked */
  onSearch?: () => void;
  /**
   * Callback when the bell notification icon is clicked.
   * When provided, the built-in NavbarNotificationButton is rendered.
   * Ignored when `notificationSlot` is provided.
   */
  onNotifications?: () => void;
  /**
   * Custom notification component (e.g. `<NotificationMenu>`).
   * When provided, replaces the built-in NavbarNotificationButton entirely.
   */
  notificationSlot?: React.ReactNode;
  /** Avatar element (image, initials, etc.) */
  avatar?: React.ReactNode;
  /**
   * Custom content appended to the right action group, after clock/search/bell/avatar.
   * Use this to inject app-specific controls (theme toggles, profile menus, etc.)
   * that require their own internal state or MUI Menu anchors.
   * When provided alongside omitting `onNotifications`, the built-in bell is hidden
   * and the slot takes full ownership of the right section actions.
   */
  rightSlot?: React.ReactNode;
}

// ─────────────────────────────────────────────────────────────────────────────
// NavbarDropdownButton
// ─────────────────────────────────────────────────────────────────────────────

export interface NavbarDropdownButtonProps {
  value: string;
  options: NavbarDropdownOption[];
  onChange?: (value: string) => void;
  statusDot?: boolean;
  statusColor?: string;
  /** Shows a spinner in place of the chevron while data is loading */
  loading?: boolean;
  /** Placeholder text shown when value is empty or not found in options */
  placeholder?: string;
  className?: string;
}

export const NavbarDropdownButton = React.forwardRef<
  HTMLButtonElement,
  NavbarDropdownButtonProps
>(
  (
    {
      value,
      options,
      onChange,
      statusDot,
      statusColor,
      loading,
      placeholder,
      className,
    },
    ref,
  ) => {
    const [open, setOpen] = React.useState(false);

    const resolvedLabel = options.find((o) => o.value === value)?.label;
    const displayLabel = resolvedLabel || value || placeholder || "Select…";
    const isPlaceholder = !resolvedLabel && !value;

    return (
      <PopoverPrimitive.Root
        open={open}
        onOpenChange={loading ? undefined : setOpen}
      >
        <PopoverPrimitive.Trigger asChild>
          <button
            ref={ref}
            type="button"
            aria-haspopup="listbox"
            aria-expanded={open}
            disabled={loading}
            className={cn(
              "inline-flex items-center gap-1.5 h-7 px-2 rounded-sm",
              "bg-(--primary-main)/25",
              "shadow-(--shadow-xs)",
              "cursor-pointer border-none",
              "focus-visible:outline-none focus-visible:ring-2",
              "focus-visible:ring-(--primary-main) focus-visible:ring-offset-1",
              "transition-colors duration-(--duration-fast)",
              "hover:bg-(--primary-main)/35",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              className,
            )}
          >
            {statusDot && !loading && (
              <span
                aria-hidden="true"
                className="inline-flex items-center justify-center size-3 rounded-full shrink-0"
                style={{ background: statusColor ?? "#8D8D8D" }}
              >
                <span
                  className="size-1.5 rounded-full"
                  style={{
                    background: statusColor
                      ? `color-mix(in srgb, ${statusColor} 70%, #000)`
                      : "#646464",
                  }}
                />
              </span>
            )}
            <span
              className={cn(
                "text-sm font-medium leading-5 whitespace-nowrap max-w-[136px] truncate",
                isPlaceholder
                  ? "text-(--sidebar-text)/50"
                  : "text-(--sidebar-text)",
              )}
            >
              {displayLabel}
            </span>
            {loading ? (
              <Loader2
                size={14}
                className="text-(--sidebar-text)/60 shrink-0 animate-spin"
                aria-hidden="true"
              />
            ) : (
              <ChevronDown
                size={16}
                className="text-(--sidebar-text) shrink-0"
              />
            )}
          </button>
        </PopoverPrimitive.Trigger>

        <PopoverPrimitive.Portal>
          <PopoverPrimitive.Content
            side="bottom"
            align="start"
            sideOffset={4}
            role="listbox"
            aria-label="Select option"
            className={cn(
              "z-1400 min-w-[--radix-popover-trigger-width] p-1",
              "bg-elevated border border-border rounded-md shadow-lg",
              "outline-none",
              "data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95",
              "data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95",
            )}
          >
            {options.map((option) => {
              const isSelected = option.value === value;
              return (
                <button
                  key={option.value}
                  type="button"
                  role="option"
                  aria-selected={isSelected}
                  disabled={option.disabled}
                  onClick={() => {
                    if (option.onClick) {
                      option.onClick();
                    } else {
                      onChange?.(option.value);
                    }
                    setOpen(false);
                  }}
                  className={cn(
                    "w-full flex items-center gap-2 px-2 py-1.5 rounded-sm",
                    "text-sm text-foreground cursor-pointer border-none bg-transparent",
                    "transition-colors duration-(--duration-fast)",
                    "hover:bg-hover",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-inset",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    isSelected && "text-brand font-medium",
                  )}
                >
                  {option.icon && (
                    <span
                      className="shrink-0 size-4 inline-flex items-center justify-center"
                      aria-hidden="true"
                    >
                      {option.icon}
                    </span>
                  )}
                  <span className="flex-1 text-left truncate">
                    {option.label}
                  </span>
                  {isSelected && (
                    <Check
                      size={14}
                      className="text-brand shrink-0"
                      aria-hidden="true"
                    />
                  )}
                </button>
              );
            })}
          </PopoverPrimitive.Content>
        </PopoverPrimitive.Portal>
      </PopoverPrimitive.Root>
    );
  },
);

NavbarDropdownButton.displayName = "NavbarDropdownButton";

// ─────────────────────────────────────────────────────────────────────────────
// NavbarStartButton
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// NavbarActionButton (single config-driven button)
// ─────────────────────────────────────────────────────────────────────────────

export interface NavbarActionButtonProps {
  status: NavbarActionStatus;
  onClick?: (currentStatus: NavbarActionStatus) => void;
  className?: string;
  disabled?: boolean;
}

export const NavbarActionButton = React.forwardRef<
  HTMLButtonElement,
  NavbarActionButtonProps
>(({ status, onClick, className, disabled }, ref) => {
  const variant = navbarActionConfig[status];
  const Icon = variant.icon;

  const handleClick = React.useCallback(() => {
    onClick?.(status);
  }, [onClick, status]);

  return (
    <button
      ref={ref}
      type="button"
      aria-label={variant.ariaLabel}
      disabled={disabled}
      onClick={handleClick}
      className={cn(
        "inline-flex items-center justify-center size-7 rounded",
        variant.bg,
        variant.border,
        "shadow-(--shadow-xs)",
        "cursor-pointer",
        "transition-colors duration-(--duration-fast)",
        "hover:brightness-110",
        "focus-visible:outline-none focus-visible:ring-2",
        variant.ring,
        "focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        variant.extra,
        className,
      )}
    >
      <Icon size={16} className="text-(--primary-subtle)" aria-hidden="true" />
    </button>
  );
});

NavbarActionButton.displayName = "NavbarActionButton";

// ─────────────────────────────────────────────────────────────────────────────
// NavbarNotificationButton
// ─────────────────────────────────────────────────────────────────────────────

export type NavbarNotificationButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement>;

export const NavbarNotificationButton = React.forwardRef<
  HTMLButtonElement,
  NavbarNotificationButtonProps
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    type="button"
    aria-label="Notifications"
    className={cn(
      "inline-flex items-center justify-center size-6 rounded-sm",
      "bg-transparent border-none cursor-pointer",
      "transition-colors duration-(--duration-fast)",
      "hover:bg-white/10",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-(--primary-main) focus-visible:ring-offset-1",
      className,
    )}
    {...props}
  >
    <Bell size={24} className="text-(--sidebar-text)/50" aria-hidden="true" />
  </button>
));

NavbarNotificationButton.displayName = "NavbarNotificationButton";

// ─────────────────────────────────────────────────────────────────────────────
// Internal: NavbarClockWidget
// ─────────────────────────────────────────────────────────────────────────────

function useClockTime(): string {
  const fmt = () =>
    new Date().toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });

  const [time, setTime] = React.useState(fmt);

  React.useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

function NavbarClockWidget() {
  const time = useClockTime();

  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 h-[33px] px-2",
        "bg-white/10 border border-white/10 rounded-sm",
      )}
      aria-label={`Current time: ${time}`}
    >
      {/* Clock icon — two concentric arcs, rendered as SVG to match Figma exactly */}
      <svg
        width="12"
        height="12"
        viewBox="0 0 12 12"
        fill="none"
        aria-hidden="true"
        className="shrink-0 text-(--sidebar-text)"
      >
        <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1" />
        <path
          d="M6 3.5V6L7.5 7.5"
          stroke="currentColor"
          strokeWidth="1"
          strokeLinecap="round"
        />
      </svg>
      <span className="text-xs leading-[15px] text-(--sidebar-text) whitespace-nowrap font-(--font-data)">
        {time}
      </span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Internal: NavbarSearchWidget
// ─────────────────────────────────────────────────────────────────────────────

interface NavbarSearchWidgetProps {
  onClick?: () => void;
}

function NavbarSearchWidget({ onClick }: NavbarSearchWidgetProps) {
  return (
    <button
      type="button"
      aria-label="Search (⌘K)"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 h-[33px] px-2 w-40",
        "bg-white/10 border border-white/10 rounded-sm",
        "cursor-pointer",
        "focus-visible:outline-none focus-visible:ring-2",
        "focus-visible:ring-(--primary-main) focus-visible:ring-offset-1",
        "hover:bg-white/15 transition-colors duration-(--duration-fast)",
      )}
    >
      <Search
        size={12}
        className="text-(--sidebar-text)/50 shrink-0"
        aria-hidden="true"
      />
      <span className="flex-1 text-left text-xs text-(--sidebar-text)/[0.28]">
        Search
      </span>
      <kbd
        aria-hidden="true"
        className={cn(
          "inline-flex items-center px-1 h-[19px]",
          "border border-white/[0.14] rounded-[3px]",
          "text-[10px] leading-[13px] font-medium text-(--sidebar-text)/30",
          "font-(--font-data)",
        )}
      >
        ⌘K
      </kbd>
    </button>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Navbar (root)
// ─────────────────────────────────────────────────────────────────────────────

export const Navbar = React.forwardRef<HTMLElement, NavbarProps>(
  (
    {
      // Sidebar toggle
      onToggleSidebar,
      isSidebarOpen,
      // Left
      breadcrumbRoot,
      breadcrumbDropdowns,
      breadcrumbSlot,
      actionStatus,
      onActionClick,
      // Right
      showClock = false,
      onSearch,
      onNotifications,
      notificationSlot,
      avatar,
      rightSlot,
      className,
      ...props
    },
    ref,
  ) => {
    const sidebarCtx = useOptionalSidebar();

    // Only expose the toggle button when there is something to toggle.
    const hasSidebarControl =
      sidebarCtx !== null || onToggleSidebar !== undefined;
    const effectiveOpen = isSidebarOpen ?? sidebarCtx?.open ?? true;

    const handleToggle = React.useCallback(() => {
      if (onToggleSidebar) {
        onToggleSidebar();
      } else if (sidebarCtx) {
        sidebarCtx.setOpen(!sidebarCtx.open);
      }
    }, [onToggleSidebar, sidebarCtx]);

    return (
      <header
        ref={ref}
        className={cn(
          "flex flex-row items-center justify-between",
          "px-3 py-2 h-[49px]",
          "bg-(--bg-header)",
          "relative",
          className,
        )}
        {...props}
      >
        {/* ── LEFT — flex-1 so it fills all space between toggle and right widgets */}
        <div className="flex flex-row items-center flex-1 min-w-0">
          {/* Sidebar toggle — only rendered when sidebar control is available */}
          {hasSidebarControl && (
            <button
              type="button"
              aria-label={effectiveOpen ? "Collapse sidebar" : "Expand sidebar"}
              aria-expanded={effectiveOpen}
              onClick={handleToggle}
              className={cn(
                "inline-flex items-center justify-center size-7 shrink-0",
                "bg-transparent border-none cursor-pointer",
                "border-r border-(--sidebar-border)",
                "transition-colors duration-(--duration-fast)",
                "hover:bg-white/10",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-(--primary-main) focus-visible:ring-inset",
              )}
            >
              <PanelLeft
                size={16}
                className="text-(--sidebar-text)"
                aria-hidden="true"
              />
            </button>
          )}

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex flex-row items-center gap-1.5 pl-2 min-w-0"
          >
            {breadcrumbRoot && (
              <>
                <span className="text-sm font-normal leading-5 text-muted-foreground whitespace-nowrap shrink-0">
                  {breadcrumbRoot}
                </span>
                {breadcrumbDropdowns && breadcrumbDropdowns.length > 0 && (
                  <ChevronRight
                    size={14}
                    className="text-(--sidebar-text)/50 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </>
            )}

            {breadcrumbDropdowns?.map((dropdown, idx) => (
              <React.Fragment key={idx}>
                {dropdown.customSlot ?? (
                  <NavbarDropdownButton
                    value={dropdown.value}
                    options={dropdown.options}
                    onChange={dropdown.onChange}
                    statusDot={dropdown.statusDot}
                    statusColor={dropdown.statusColor}
                    loading={dropdown.loading}
                    placeholder={dropdown.placeholder}
                  />
                )}
                {idx < (breadcrumbDropdowns?.length ?? 0) - 1 && (
                  <ChevronRight
                    size={14}
                    className="text-(--sidebar-text)/50 shrink-0"
                    aria-hidden="true"
                  />
                )}
              </React.Fragment>
            ))}

            {/* Slot for custom breadcrumb content (e.g. a paginated project picker) */}
            {breadcrumbSlot && (
              <>
                {(breadcrumbRoot ||
                  (breadcrumbDropdowns && breadcrumbDropdowns.length > 0)) && (
                  <ChevronRight
                    size={14}
                    className="text-(--sidebar-text)/50 shrink-0"
                    aria-hidden="true"
                  />
                )}
                {breadcrumbSlot}
              </>
            )}

            {actionStatus !== undefined && onActionClick && (
              <NavbarActionButton
                status={actionStatus}
                onClick={onActionClick}
              />
            )}
          </nav>
        </div>

        {/* ── RIGHT — shrink-0 so it never gets compressed by the breadcrumb */}
        <div className="flex flex-row items-center gap-2 shrink-0">
          {showClock && <NavbarClockWidget />}
          {onSearch !== undefined && <NavbarSearchWidget onClick={onSearch} />}
          {/* Notification slot takes priority over the built-in bell button */}
          {notificationSlot
            ? notificationSlot
            : onNotifications !== undefined && (
                <NavbarNotificationButton onClick={onNotifications} />
              )}
          {avatar && (
            <div className="size-8 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              {avatar}
            </div>
          )}
          {rightSlot}
        </div>
      </header>
    );
  },
);

Navbar.displayName = "Navbar";

// ─────────────────────────────────────────────────────────────────────────────
// NavbarLayoutContent
// ─────────────────────────────────────────────────────────────────────────────
//
// Companion layout wrapper for consuming apps. Place it as a sibling of
// <Sidebar> — it automatically reads the sidebar context and applies the
// correct margin-left + transition so the Navbar and page content always sit
// flush against the sidebar edge without any manual width calculation.
//
// Usage in a consuming app:
//
//   <Sidebar open={open} onOpenChange={setOpen} showToggleButton={false}>
//     ...nav items...
//   </Sidebar>
//
//   <NavbarLayoutContent>
//     <Navbar ... />
//     <main>...page content...</main>
//   </NavbarLayoutContent>
//

export interface NavbarLayoutContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
}

export const NavbarLayoutContent = React.forwardRef<
  HTMLDivElement,
  NavbarLayoutContentProps
>(({ className, style, children, ...props }, ref) => (
  // Reads --sidebar-current-width which the Sidebar component writes to :root
  // on every open/close. Falls back to --sidebar-width-open when no Sidebar is
  // present. No React context required — works as a plain sibling of <Sidebar>.
  <div
    ref={ref}
    className={cn(
      "flex flex-col min-h-screen",
      "transition-[margin-left] duration-(--duration-normal) ease-(--ease-snappy)",
      className,
    )}
    style={{
      marginLeft:
        "var(--sidebar-current-width, var(--sidebar-width-open, 220px))",
      ...style,
    }}
    {...props}
  >
    {children}
  </div>
));

NavbarLayoutContent.displayName = "NavbarLayoutContent";
