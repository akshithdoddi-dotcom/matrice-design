import * as React from "react";

import * as TabsPrimitive from "@radix-ui/react-tabs";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Primitives — low-level composable pieces (shadcn pattern)
// ─────────────────────────────────────────────────────────────────────────────

const Tabs = TabsPrimitive.Root;

/**
 * TabsList — the horizontal strip that holds all triggers.
 *
 * - `mui-tabs-list-scrollable` provides CSS-only scrollbar hiding (Firefox + webkit).
 * - Transparent background keeps the tab strip flush with the page surface.
 * - `items-end` + `-mb-px` on triggers lets the active 2px indicator cleanly
 *   cover the 1px gray baseline, eliminating the double-border seam.
 */
const TabsList = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "mui-tabs-list-scrollable",
      "flex items-end gap-0.5",
      "w-full overflow-x-auto",
      "border-b border-(--border-color)",
      "whitespace-nowrap",
      className,
    )}
    {...props}
  />
));
TabsList.displayName = "TabsList";

/**
 * TabsTrigger — a single tab button.
 *
 * Underline-style: indicator-only active state, no background treatment.
 *
 * State mapping:
 *   inactive  → text-muted-foreground
 *   hover     → text-foreground
 *   active    → text-primary + 2px teal bottom border
 *   disabled  → opacity-40, not-allowed cursor
 */
const TabsTrigger = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    className={cn(
      // Layout
      "relative inline-flex items-center justify-center shrink-0",
      "h-(--navbar-tab-height) px-4 -mb-px",
      // Typography
      "text-sm font-medium whitespace-nowrap select-none",
      // Bottom indicator — always present, transparent when inactive
      "border-b-2 border-b-transparent",
      // Rounded top for hover background
      "rounded-md rounded-b-none",
      // Transitions
      "transition-[color,border-color,background-color] duration-(--duration-fast) ease-(--ease-snappy)",
      // Inactive
      "text-(--text-muted)",
      // Hover — subtle background tint, text darkens
      "hover:text-(--text-primary) hover:bg-(--bg-hover)",
      // Active — underline indicator + primary text color
      "data-[state=active]:border-b-(--primary-main)",
      "data-[state=active]:text-(--primary-main)",
      "data-[state=active]:font-semibold",
      // Disabled
      "data-disabled:opacity-40",
      "data-disabled:cursor-not-allowed",
      "data-disabled:pointer-events-none",
      "data-disabled:hover:bg-transparent",
      // Focus
      "focus-visible:outline-none",
      "focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-offset-0",
      className,
    )}
    {...props}
  />
));
TabsTrigger.displayName = "TabsTrigger";

/**
 * TabsContent — the panel shown when its tab is active.
 */
const TabsContent = React.forwardRef<
  React.ComponentRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-3 text-(--text-primary)",
      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main) focus-visible:ring-offset-2",
      className,
    )}
    {...props}
  />
));
TabsContent.displayName = "TabsContent";

// ─────────────────────────────────────────────────────────────────────────────
// ManagedTabs types
// ─────────────────────────────────────────────────────────────────────────────

export interface TabItem {
  label: string;
  content: React.ReactNode;
  disabled?: boolean;
}

export interface ManagedTabsProps {
  tabs: TabItem[];
  /** Initial active tab index — uncontrolled mode. Default: 0 */
  defaultIndex?: number;
  /** Active tab index — controlled mode. */
  value?: number;
  /** Called with the new index on tab switch. */
  onChange?: (index: number) => void;
  className?: string;
  /** Extra className forwarded to every TabsContent panel. */
  contentClassName?: string;
  /** Extra className forwarded to the TabsList component. */
  tabsListClassName?: string;
  /** Extra className forwarded to the TabsTrigger component. */
  triggerClassName?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// ManagedTabs — opinionated wrapper
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Converts between the public number-index API and Radix's internal string value.
 * This keeps the consumer API simple (numeric indices) while Radix works with strings.
 */
export const ManagedTabs = React.forwardRef<HTMLDivElement, ManagedTabsProps>(
  (
    {
      tabs,
      defaultIndex = 0,
      value,
      onChange,
      className,
      contentClassName,
      tabsListClassName,
      triggerClassName,
    },
    ref,
  ) => {
    const isControlled = value !== undefined;

    const radixProps = isControlled
      ? {
          value: String(value),
          onValueChange: (v: string) => onChange?.(Number(v)),
        }
      : {
          defaultValue: String(defaultIndex),
        };

    return (
      <Tabs
        {...radixProps}
        ref={ref as React.Ref<HTMLDivElement>}
        className={cn("w-full", className)}
      >
        <TabsList className={tabsListClassName}>
          {tabs.map((tab, i) => (
            <TabsTrigger
              key={i}
              value={String(i)}
              disabled={tab.disabled}
              className={cn("rounded-none", triggerClassName)}
            >
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab, i) => (
          <TabsContent key={i} value={String(i)} className={contentClassName}>
            {tab.content}
          </TabsContent>
        ))}
      </Tabs>
    );
  },
);
ManagedTabs.displayName = "ManagedTabs";

export { Tabs, TabsList, TabsTrigger, TabsContent };
