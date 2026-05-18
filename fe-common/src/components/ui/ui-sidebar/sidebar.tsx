import {
  BarChart3,
  Camera,
  ChevronLeft,
  ChevronsUpDown,
  Headphones,
  Shield,
} from "lucide-react";

import * as React from "react";

import * as PopoverPrimitive from "@radix-ui/react-popover";

import { cn } from "@/lib/utils";
import { MatriceLogo } from "@/shared/svgs";

import { Command, CommandGroup, CommandItem, CommandList } from "../command";
import type {
  SidebarBrandHeaderProps,
  SidebarContentProps,
  SidebarContextValue,
  SidebarFooterProps,
  SidebarHeaderProps,
  SidebarLogoProps,
  SidebarNavGroupProps,
  SidebarNavItemProps,
  SidebarNavProps,
  SidebarProps,
} from "./types";
import { useControllableOpen } from "./use-controllable-open";

// ─────────────────────────────────────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────────────────────────────────────

const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a <Sidebar> provider.");
  }
  return ctx;
}

export function useOptionalSidebar(): SidebarContextValue | null {
  return React.useContext(SidebarContext);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar (root)
// ─────────────────────────────────────────────────────────────────────────────

export const Sidebar = React.forwardRef<HTMLElement, SidebarProps>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange,
      collapsible = true,
      showToggleButton = true,
      onHoverOpen = false,
      className,
      children,
      ...props
    },
    ref,
  ) => {
    const { open, setOpen } = useControllableOpen({
      openProp,
      defaultOpen,
      onOpenChange,
    });

    const collapsed = !open;

    const ctxValue = React.useMemo<SidebarContextValue>(
      () => ({ open, setOpen, collapsed, collapsible }),
      [open, setOpen, collapsed, collapsible],
    );

    // Write --sidebar-current-width to :root so sibling layout containers
    // (e.g. NavbarLayoutContent) can read the current offset via pure CSS
    // without needing to be inside the SidebarContext.Provider subtree.
    React.useEffect(() => {
      if (typeof document === "undefined") return;
      document.documentElement.style.setProperty(
        "--sidebar-current-width",
        open
          ? "var(--sidebar-width-open, 220px)"
          : "var(--sidebar-width-collapsed, 64px)",
      );
      return () => {
        document.documentElement.style.removeProperty(
          "--sidebar-current-width",
        );
      };
    }, [open]);

    const handleMouseEnter = React.useCallback(() => {
      if (onHoverOpen && collapsed) setOpen(true);
    }, [onHoverOpen, collapsed, setOpen]);

    const handleMouseLeave = React.useCallback(() => {
      if (onHoverOpen && open) setOpen(false);
    }, [onHoverOpen, open, setOpen]);

    return (
      <SidebarContext.Provider value={ctxValue}>
        <aside
          ref={ref}
          data-open={open ? "true" : "false"}
          data-sidebar-container=""
          className={cn(
            "fixed left-0 top-0 h-screen z-1200",
            "flex flex-col overflow-visible",
            "bg-(--bg-sidebar)",
            "transition-[width] duration-(--duration-normal) ease-(--ease-snappy)",
            "w-(--sidebar-width-open)",
            "data-[open=false]:w-(--sidebar-width-collapsed)",
            "data-[open=false]:max-md:-translate-x-full data-[open=false]:max-md:w-0",
            className,
          )}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          {...props}
        >
          {collapsible && showToggleButton && (
            <button
              type="button"
              aria-label="Toggle sidebar"
              aria-expanded={open}
              className={cn(
                "absolute -right-3 top-[5%] z-1300",
                "flex size-6",
                "items-center justify-center p-0",
                "rounded-full bg-surface border border-(--border-medium)",
                "cursor-pointer",
                "transition-colors duration-(--duration-fast) ease-(--ease-smooth)",
                "hover:bg-hover",
                "focus-visible:outline-none focus-visible:ring-2",
                "focus-visible:ring-(--primary-main) focus-visible:ring-offset-2",
              )}
              onClick={() => setOpen(!open)}
            >
              <ChevronLeft
                size={18}
                className={cn(
                  "text-(--primary-hover)",
                  "transition-transform duration-(--duration-normal) ease-(--ease-snappy)",
                  collapsed && "rotate-180",
                )}
              />
            </button>
          )}
          {children}
        </aside>
      </SidebarContext.Provider>
    );
  },
);

Sidebar.displayName = "Sidebar";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarHeader
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  SidebarHeaderProps
>(({ className, children, ...props }, ref) => {
  const { open } = useSidebar();
  return (
    <div
      ref={ref}
      data-open={open ? "true" : "false"}
      className={cn("flex flex-col p-2 gap-2", "overflow-hidden", className)}
      {...props}
    >
      {children}
    </div>
  );
});

SidebarHeader.displayName = "SidebarHeader";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarContent
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarContent = React.forwardRef<
  HTMLDivElement,
  SidebarContentProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex-1 overflow-y-auto overflow-x-hidden", className)}
    {...props}
  >
    {children}
  </div>
));

SidebarContent.displayName = "SidebarContent";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarNav
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarNav = React.forwardRef<HTMLElement, SidebarNavProps>(
  ({ className, children, ...props }, ref) => {
    const navRef = React.useRef<HTMLElement | null>(null);

    const setRefs = React.useCallback(
      (node: HTMLElement | null) => {
        navRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref)
          (ref as React.MutableRefObject<HTMLElement | null>).current = node;
      },
      [ref],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLElement>) => {
        const nav = navRef.current;
        if (!nav) return;

        const items = Array.from(
          nav.querySelectorAll<HTMLElement>(
            "[data-sidebar-nav-item]:not([aria-disabled='true'])",
          ),
        );

        if (items.length === 0) return;

        const currentIndex = items.indexOf(
          document.activeElement as HTMLElement,
        );

        switch (event.key) {
          case "ArrowDown": {
            event.preventDefault();
            const next = currentIndex < items.length - 1 ? currentIndex + 1 : 0;
            items[next].focus();
            break;
          }
          case "ArrowUp": {
            event.preventDefault();
            const prev = currentIndex > 0 ? currentIndex - 1 : items.length - 1;
            items[prev].focus();
            break;
          }
          case "Enter": {
            if (currentIndex >= 0) {
              event.preventDefault();
              items[currentIndex].click();
            }
            break;
          }
          case "Escape": {
            event.preventDefault();
            nav.closest<HTMLElement>("[data-sidebar-container]")?.focus();
            break;
          }
          default:
            break;
        }
      },
      [],
    );

    return (
      <nav
        ref={setRefs}
        role="navigation"
        aria-label="Main navigation"
        className={cn("px-2 py-0", className)}
        onKeyDown={handleKeyDown}
        {...props}
      >
        <ul className="flex flex-col gap-1 list-none m-0 p-0">{children}</ul>
      </nav>
    );
  },
);

SidebarNav.displayName = "SidebarNav";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarNavGroup
// ─────────────────────────────────────────────────────────────────────────────

function slugifyGroupLabel(label: string): string {
  let out = "";
  let needHyphen = false;
  for (const ch of label.toLowerCase()) {
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      needHyphen = true;
    } else {
      if (needHyphen && out.length > 0) {
        out += "-";
      }
      needHyphen = false;
      out += ch;
    }
  }
  return out;
}

const groupLabelId = (label: string) =>
  `sidebar-group-${slugifyGroupLabel(label)}`;

export const SidebarNavGroup = React.forwardRef<
  HTMLDivElement,
  SidebarNavGroupProps
>(({ label, className, children, ...props }, ref) => {
  const { collapsed } = useSidebar();
  const id = groupLabelId(label);

  return (
    <div
      ref={ref}
      role="group"
      aria-labelledby={id}
      data-sidebar-nav-group=""
      className={cn("p-0", className)}
      {...props}
    >
      <span
        id={id}
        aria-hidden={collapsed}
        data-sidebar-nav-group-label=""
        className={cn(
          "block px-3.5 mb-2",
          "text-[11px] font-semibold uppercase tracking-[0.06em]",
          "text-(--sidebar-text-secondary)",
          "whitespace-nowrap overflow-hidden",
          "transition-[opacity,height,margin-bottom] duration-(--duration-fast) ease-(--ease-smooth)",
          collapsed ? "opacity-0 h-0 mb-0" : "opacity-100",
        )}
      >
        {label}
      </span>
      <ul className="flex flex-col gap-1 list-none m-0 p-0">{children}</ul>
    </div>
  );
});

SidebarNavGroup.displayName = "SidebarNavGroup";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarNavItem
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarNavItem = React.forwardRef<
  HTMLElement,
  SidebarNavItemProps
>(
  (
    {
      icon,
      active = false,
      badge,
      href,
      as: Component,
      tooltip,
      size = "default",
      onClick,
      children,
      className,
      ...props
    },
    ref,
  ) => {
    const { collapsed } = useSidebar();

    const tooltipText =
      tooltip ?? (typeof children === "string" ? children : undefined);

    const hasBadge = badge !== undefined && badge !== null;

    const itemClassName = cn(
      "group relative flex flex-row items-center gap-2",
      "py-2 h-8 w-full rounded-sm",
      // Transition padding so the icon slides smoothly into center position
      // when the sidebar collapses — no layout snap or jitter.
      // SidebarNav adds px-2 (8px) left offset, so navItem.pl needs to be
      // (64px sidebar_center - 8px icon_half - 8px SidebarNav_px) = 16px → pl-4.
      collapsed ? "pl-4 pr-0" : "pl-2 pr-8",
      "text-(--sidebar-text) no-underline cursor-pointer",
      "border-none bg-transparent font-[inherit]",
      "transition-[background-color,opacity,padding-left,padding-right] duration-(--duration-normal) ease-(--ease-snappy)",
      active
        ? "bg-(--sidebar-item-active-bg) text-sm font-normal opacity-100"
        : [
            size === "lg"
              ? "text-sm font-normal"
              : "[font-size:var(--sidebar-nav-item-font-size)] font-medium",
            "opacity-70",
            "hover:bg-(--sidebar-item-hover-bg) hover:opacity-100",
          ],
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-(--primary-glow-strong) focus-visible:ring-inset",
      className,
    );

    const content = (
      <>
        <span
          className="shrink-0 inline-flex items-center justify-center size-4"
          aria-hidden="true"
        >
          {icon}
        </span>

        <span
          className={cn(
            "flex-1 min-w-0 whitespace-nowrap overflow-hidden text-ellipsis",
            "transition-[max-width,opacity] duration-(--duration-normal) ease-(--ease-snappy)",
            collapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100",
          )}
          title={typeof children === "string" ? children : undefined}
        >
          {children}
        </span>

        {hasBadge && (
          <span
            className={cn(
              "inline-flex items-center justify-center min-w-5 h-5 rounded-full",
              "bg-(--error-main) shadow-lg",
              "text-[10px] font-bold leading-none px-1 shrink-0",
              "text-(--sidebar-text)",
              collapsed && "absolute -top-1 -right-1",
            )}
            aria-label={`${badge} notifications`}
          >
            {badge}
          </span>
        )}

        {collapsed && tooltipText && (
          <span
            role="tooltip"
            className={cn(
              "absolute left-[calc(100%+0.5rem)] top-1/2 -translate-y-1/2",
              "bg-(--bg-header) border border-(--sidebar-tooltip-border)",
              "rounded-lg shadow-lg px-2.5 py-1.5",
              "text-xs text-(--sidebar-text) whitespace-nowrap",
              "z-1400 pointer-events-none",
              "opacity-0 invisible",
              "group-hover:opacity-100 group-hover:visible",
              "transition-opacity duration-(--duration-fast) ease-(--ease-smooth)",
            )}
          >
            {tooltipText}
          </span>
        )}
      </>
    );

    const sharedProps = {
      className: itemClassName,
      "aria-current": active ? ("page" as const) : undefined,
      "data-sidebar-nav-item": "",
      "data-active": active ? "true" : undefined,
      tabIndex: 0,
      onClick,
      ...props,
    };

    if (Component) {
      return (
        <li className="list-none">
          <Component ref={ref} href={href} {...sharedProps}>
            {content}
          </Component>
        </li>
      );
    }

    if (href) {
      return (
        <li className="list-none">
          <a
            ref={ref as React.Ref<HTMLAnchorElement>}
            href={href}
            {...sharedProps}
          >
            {content}
          </a>
        </li>
      );
    }

    return (
      <li className="list-none">
        <button
          ref={ref as React.Ref<HTMLButtonElement>}
          type="button"
          {...sharedProps}
        >
          {content}
        </button>
      </li>
    );
  },
);

SidebarNavItem.displayName = "SidebarNavItem";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarFooter
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  SidebarFooterProps
>(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "mt-auto bg-(--bg-sidebar) border-t border-(--sidebar-bottom-border)",
      "p-2 overflow-hidden",
      className,
    )}
    {...props}
  >
    {children}
  </div>
));

SidebarFooter.displayName = "SidebarFooter";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarLogo
// ─────────────────────────────────────────────────────────────────────────────

export const SidebarLogo = React.forwardRef<HTMLDivElement, SidebarLogoProps>(
  (
    {
      logo,
      title,
      subtitle,
      commandContent,
      onTriggerClick,
      className,
      ...props
    },
    ref,
  ) => {
    const { collapsed } = useSidebar();
    const [commandOpen, setCommandOpen] = React.useState(false);

    const hasTrigger = Boolean(commandContent ?? onTriggerClick);

    // Shared inner markup for all render variants
    const logoInner = (
      <>
        <span className="shrink-0 inline-flex items-center justify-center">
          {logo}
        </span>

        <span
          className={cn(
            "flex flex-col min-w-0 overflow-hidden",
            "transition-[max-width,opacity] duration-(--duration-normal) ease-(--ease-snappy)",
            collapsed ? "max-w-0 opacity-0" : "max-w-full opacity-100 flex-1",
          )}
        >
          {title && (
            <span className="text-sm font-semibold leading-5 text-(--sidebar-text) truncate whitespace-nowrap">
              {title}
            </span>
          )}
          {subtitle && (
            <span className="text-xs font-normal leading-4 text-(--sidebar-text) truncate whitespace-nowrap">
              {subtitle}
            </span>
          )}
        </span>

        {hasTrigger && !collapsed && (
          <ChevronsUpDown
            size={16}
            className="shrink-0 text-(--sidebar-text)"
          />
        )}
      </>
    );

    // Whole-row button styles shared by both trigger variants.
    // Padding transitions in sync with the sidebar width so the logo
    // mark slides smoothly to center (32px) in the 64px collapsed state.
    // SidebarHeader adds p-2 (8px) left offset, so row.pl needs to be
    // (64px sidebar_center - 14px logo_half - 8px SidebarHeader_p) = 10px.
    const rowButtonClassName = cn(
      "flex flex-row items-center gap-2 py-2 w-full",
      collapsed ? "pl-[10px] pr-0" : "px-2",
      "transition-[padding-left,padding-right] duration-(--duration-normal) ease-(--ease-snappy)",
      "cursor-pointer border-none bg-transparent font-[inherit] text-left",
      "rounded-sm",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-(--primary-main) focus-visible:ring-inset",
    );

    if (commandContent) {
      return (
        <div ref={ref} className={className} {...props}>
          <PopoverPrimitive.Root
            open={commandOpen}
            onOpenChange={setCommandOpen}
          >
            <PopoverPrimitive.Trigger asChild>
              <button
                type="button"
                aria-label="Switch workspace"
                aria-expanded={commandOpen}
                className={rowButtonClassName}
              >
                {logoInner}
              </button>
            </PopoverPrimitive.Trigger>
            <PopoverPrimitive.Portal>
              <PopoverPrimitive.Content
                side="bottom"
                align="start"
                sideOffset={4}
                className={cn(
                  "z-1400 p-[5px]",
                  "min-w-(--sidebar-width-open)",
                  "bg-surface  rounded-md shadow-xl",
                  "outline-none",
                )}
              >
                {commandContent}
              </PopoverPrimitive.Content>
            </PopoverPrimitive.Portal>
          </PopoverPrimitive.Root>
        </div>
      );
    }

    if (onTriggerClick) {
      return (
        <div ref={ref} className={className} {...props}>
          <button
            type="button"
            aria-label="Switch workspace"
            onClick={onTriggerClick}
            className={rowButtonClassName}
          >
            {logoInner}
          </button>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={cn(
          "flex flex-row items-center gap-2 py-2 w-full",
          collapsed ? "pl-[10px] pr-0" : "px-2",
          "transition-[padding-left,padding-right] duration-(--duration-normal) ease-(--ease-snappy)",
          className,
        )}
        {...props}
      >
        {logoInner}
      </div>
    );
  },
);

SidebarLogo.displayName = "SidebarLogo";

// ─────────────────────────────────────────────────────────────────────────────
// SidebarBrandHeader
// ─────────────────────────────────────────────────────────────────────────────
//
// Opinionated wrapper: SidebarHeader + SidebarLogo with a built-in Matrice
// platform switcher popover. Clicking a platform opens it in a new tab.
// Pass `activePlatform` to highlight the current platform with a check icon.
//
// Usage:
//
//   <SidebarBrandHeader
//     title="Matrice AI"
//     subtitle="Support Platform"
//     activePlatform="support"
//   />
//

const MATRICE_PLATFORMS = [
  {
    value: "analytics",
    label: "Matrice Analytics",
    icon: <BarChart3 className="size-4 shrink-0" />,
    href: "https://analytics.app.matrice.ai",
  },
  {
    value: "vms",
    label: "Matrice VMS",
    icon: <Camera className="size-4 shrink-0" />,
    href: "https://streaming.app.matrice.ai",
  },
  {
    value: "support",
    label: "Matrice Support",
    icon: <Headphones className="size-4 shrink-0" />,
    href: "https://support.app.matrice.ai",
  },
  {
    value: "internal",
    label: "Matrice Internal",
    icon: <Shield className="size-4 shrink-0" />,
    href: "https://internal.app.matrice.ai",
  },
];

export const SidebarBrandHeader = React.forwardRef<
  HTMLDivElement,
  SidebarBrandHeaderProps
>(({ title, subtitle, logo, activePlatform, className, ...props }, ref) => {
  const resolvedLogo = logo ?? <MatriceLogo />;

  const commandContent = (
    <Command>
      <CommandList>
        <CommandGroup heading="Platforms">
          {MATRICE_PLATFORMS.map((platform) => (
            <CommandItem
              key={platform.value}
              value={platform.value}
              active={platform.value === activePlatform}
              onSelect={() => window.open(platform.href, "_blank")}
            >
              <span className="size-4 shrink-0 inline-flex items-center justify-center">
                {platform.icon}
              </span>
              <span className="flex-1 truncate">{platform.label}</span>
            </CommandItem>
          ))}
        </CommandGroup>
      </CommandList>
    </Command>
  );

  return (
    <SidebarHeader ref={ref} className={className} {...props}>
      <SidebarLogo
        logo={resolvedLogo}
        title={title}
        subtitle={subtitle}
        commandContent={commandContent}
      />
    </SidebarHeader>
  );
});

SidebarBrandHeader.displayName = "SidebarBrandHeader";
