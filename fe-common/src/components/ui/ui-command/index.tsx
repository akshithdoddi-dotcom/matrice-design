import { Check } from "lucide-react";

import { Command as CommandPrimitive } from "cmdk";
import * as React from "react";

import { cn } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

export type CommandProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive
>;

export type CommandListProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.List
>;

export type CommandEmptyProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Empty
>;

export type CommandGroupProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Group
>;

export type CommandSeparatorProps = React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Separator
>;

export interface CommandItemProps extends React.ComponentPropsWithoutRef<
  typeof CommandPrimitive.Item
> {
  /** When true, applies the active/current-selection brand styling. */
  active?: boolean;
}

export type CommandShortcutProps = React.HTMLAttributes<HTMLSpanElement>;

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

const Command = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive>,
  CommandProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive
    ref={ref}
    className={cn(
      "flex flex-col overflow-hidden rounded-md bg-(--bg-surface) text-foreground",
      className,
    )}
    {...props}
  />
));
Command.displayName = "Command";

const CommandList = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.List>,
  CommandListProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.List
    ref={ref}
    className={cn("overflow-y-auto overflow-x-hidden", className)}
    {...props}
  />
));
CommandList.displayName = "CommandList";

const CommandEmpty = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Empty>,
  CommandEmptyProps
>((props, ref) => (
  <CommandPrimitive.Empty
    ref={ref}
    className="py-6 text-center text-sm text-muted-foreground"
    {...props}
  />
));
CommandEmpty.displayName = "CommandEmpty";

const CommandGroup = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Group>,
  CommandGroupProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Group
    ref={ref}
    className={cn(
      "**:[[cmdk-group-heading]]:px-2 **:[[cmdk-group-heading]]:py-1.5",
      "**:[[cmdk-group-heading]]:text-xs **:[[cmdk-group-heading]]:font-medium",
      "**:[[cmdk-group-heading]]:text-muted-foreground",
      "pb-1",
      className,
    )}
    {...props}
  />
));
CommandGroup.displayName = "CommandGroup";

const CommandSeparator = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Separator>,
  CommandSeparatorProps
>(({ className, ...props }, ref) => (
  <CommandPrimitive.Separator
    ref={ref}
    className={cn("-mx-1 h-px bg-border", className)}
    {...props}
  />
));
CommandSeparator.displayName = "CommandSeparator";

const CommandItem = React.forwardRef<
  React.ComponentRef<typeof CommandPrimitive.Item>,
  CommandItemProps
>(({ className, active, children, ...props }, ref) => (
  <CommandPrimitive.Item
    ref={ref}
    className={cn(
      "group",
      "relative flex flex-row items-center gap-2 px-2 h-10",
      "cursor-pointer select-none outline-none text-sm",
      "mx-1",
      "rounded-md transition-colors",
      "data-[disabled=true]:pointer-events-none data-[disabled=true]:opacity-50",
      "text-foreground rounded-sm",
      "hover:bg-[var(--primary-subtle)] hover:text-[var(--primary-dark)]",
      "data-[selected=true]:bg-[var(--primary-main)] data-[selected=true]:text-white",
      className,
    )}
    {...props}
  >
    {children}
    {active && <Check size={14} className="shrink-0 text-primary" />}
  </CommandPrimitive.Item>
));
CommandItem.displayName = "CommandItem";

/**
 * Keyboard shortcut badge rendered at the trailing end of a CommandItem.
 * Displays a monospace key combination (e.g. ⌘1) in a small pill.
 */
const CommandShortcut = ({ className, ...props }: CommandShortcutProps) => (
  <span
    className={cn(
      "ml-auto inline-flex items-center justify-center shrink-0",
      "h-6 min-w-[31px] px-[7px] py-[2px]",
      "bg-(--neutral-100) border border-(--neutral-200) rounded-[4px]",
      "text-xs font-mono text-(--text-secondary)",
      "group-data-[selected=true]:bg-(--neutral-100) group-data-[selected=true]:text-(--text-secondary) group-data-[selected=true]:border-(--neutral-200)",
      className,
    )}
    {...props}
  />
);
CommandShortcut.displayName = "CommandShortcut";

// ─────────────────────────────────────────────────────────────────────────────
// Exports
// ─────────────────────────────────────────────────────────────────────────────

export {
  Command,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandSeparator,
  CommandItem,
  CommandShortcut,
};
