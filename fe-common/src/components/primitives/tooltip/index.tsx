"use client";

import * as React from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  );
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return (
    <TooltipProvider>
      <TooltipPrimitive.Root data-slot="tooltip" {...props} />
    </TooltipProvider>
  );
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />;
}

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "bg-primary text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance",
          className,
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow className="bg-primary fill-primary z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

function CustomTooltipContent({
  className,
  sideOffset = 0,
  children,
  bgClassName,
  textClassName,
  showArrow = true,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content> & {
  /** Tailwind background class, e.g. "bg-foreground" or "bg-zinc-900" */
  bgClassName?: string;
  /** Tailwind text-color class, e.g. "text-background" */
  textClassName?: string;
  /** Hide the arrow if false */
  showArrow?: boolean;
}) {
  const bg = bgClassName ?? "bg-primary";
  const text = textClassName ?? "text-primary-foreground";
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="custom-tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 z-50 w-fit origin-(--radix-tooltip-content-transform-origin) rounded-md px-3 py-1.5 text-xs text-balance shadow-sm",
          bg,
          text,
          className,
        )}
        {...props}
      >
        {children}
        {showArrow && (
          <TooltipPrimitive.Arrow
            className={cn(
              "z-50 size-2.5 translate-y-[calc(-50%_-_2px)] rotate-45 rounded-[2px]",
              bg,
              bgClassName ? "" : "fill-primary",
            )}
          />
        )}
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}

interface CustomTooltipProps {
  /** Element that triggers the tooltip */
  children: React.ReactNode;
  /** Tooltip content */
  content: React.ReactNode;
  /** Tailwind background class for the bubble + arrow */
  bgClassName?: string;
  /** Tailwind text-color class */
  textClassName?: string;
  /** Side of the trigger to render on */
  side?: React.ComponentProps<typeof TooltipPrimitive.Content>["side"];
  /** Alignment along the side */
  align?: React.ComponentProps<typeof TooltipPrimitive.Content>["align"];
  /** Distance from the trigger */
  sideOffset?: number;
  /** Disable the tooltip */
  disabled?: boolean;
  /** Render the trigger as its child (Radix asChild) */
  asChild?: boolean;
  /** Hide the arrow */
  showArrow?: boolean;
  /** Additional classes on the content */
  className?: string;
  /** Delay before opening, ms */
  delayDuration?: number;
}

function CustomTooltip({
  children,
  content,
  bgClassName,
  textClassName,
  side = "top",
  align = "center",
  sideOffset = 4,
  disabled,
  asChild = true,
  showArrow = true,
  className,
  delayDuration,
}: CustomTooltipProps) {
  if (disabled) return <>{children}</>;
  return (
    <TooltipProvider delayDuration={delayDuration}>
      <TooltipPrimitive.Root>
        <TooltipPrimitive.Trigger asChild={asChild}>
          {children}
        </TooltipPrimitive.Trigger>
        <CustomTooltipContent
          side={side}
          align={align}
          sideOffset={sideOffset}
          bgClassName={bgClassName}
          textClassName={textClassName}
          showArrow={showArrow}
          className={className}
        >
          {content}
        </CustomTooltipContent>
      </TooltipPrimitive.Root>
    </TooltipProvider>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  CustomTooltip,
  CustomTooltipContent,
};
export type { CustomTooltipProps };
