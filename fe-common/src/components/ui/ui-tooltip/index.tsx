import { cva } from "class-variance-authority";
import * as React from "react";

import * as TooltipPrimitive from "@radix-ui/react-tooltip";

import { cn } from "@/lib/utils";

const tooltipContentVariants = cva("mui-tooltip", {
  variants: {
    side: {
      top: "mui-tooltip-top",
      right: "mui-tooltip-right",
      bottom: "mui-tooltip-bottom",
      left: "mui-tooltip-left",
    },
  },
  defaultVariants: {
    side: "top",
  },
});

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

export type TooltipContentProps = React.ComponentPropsWithoutRef<
  typeof TooltipPrimitive.Content
>;

const TooltipContent = React.forwardRef<
  React.ComponentRef<typeof TooltipPrimitive.Content>,
  TooltipContentProps
>(({ className, side = "top", sideOffset = 6, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      side={side}
      sideOffset={sideOffset}
      className={cn(tooltipContentVariants({ side }), className)}
      {...props}
    />
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = "TooltipContent";

export {
  TooltipProvider,
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  tooltipContentVariants,
};
