"use client";

import * as React from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";
import { ChevronDownIcon } from "lucide-react";
import { cn } from "./utils";

// ─── Context ──────────────────────────────────────────────────────────────────

type AccordionVariant = "default" | "card" | "filled";

const AccordionVariantCtx = React.createContext<AccordionVariant>("default");

// ─── Root ─────────────────────────────────────────────────────────────────────

function Accordion({
  variant = "default",
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root> & { variant?: AccordionVariant }) {
  return (
    <AccordionVariantCtx.Provider value={variant}>
      <AccordionPrimitive.Root data-slot="accordion" data-variant={variant} {...props} />
    </AccordionVariantCtx.Provider>
  );
}

// ─── Item ─────────────────────────────────────────────────────────────────────

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  const variant = React.useContext(AccordionVariantCtx);
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        variant === "card"
          ? "mb-2 rounded-lg border border-border bg-card overflow-hidden last:mb-0 shadow-sm"
          : variant === "filled"
            ? "mb-1 rounded-md bg-muted overflow-hidden last:mb-0"
            : "border-b last:border-b-0",
        className,
      )}
      {...props}
    />
  );
}

// ─── Trigger ──────────────────────────────────────────────────────────────────

function AccordionTrigger({
  className,
  children,
  icon,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger> & {
  /** Optional leading icon displayed before the label */
  icon?: React.ReactNode;
}) {
  const variant = React.useContext(AccordionVariantCtx);
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          // Base
          "focus-visible:border-ring focus-visible:ring-ring/50 flex flex-1 items-center gap-3 text-left text-sm font-medium transition-all outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50",
          // Chevron rotation
          "[&[data-state=open]>span.chevron-wrap>svg]:rotate-180",
          // Variant-specific
          variant === "card"
            ? "px-4 py-3.5 hover:bg-muted/40"
            : variant === "filled"
              ? "px-3 py-3 hover:bg-muted/80"
              : "justify-between py-4 rounded-md hover:underline",
          className,
        )}
        {...props}
      >
        {icon && <span className="text-muted-foreground shrink-0">{icon}</span>}
        <span className="flex-1">{children}</span>
        <span className="chevron-wrap shrink-0 ml-auto pl-2">
          <ChevronDownIcon className="text-muted-foreground size-4 transition-transform duration-200" />
        </span>
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

// ─── Content ──────────────────────────────────────────────────────────────────

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  const variant = React.useContext(AccordionVariantCtx);
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm"
      {...props}
    >
      <div
        className={cn(
          variant === "card"   ? "px-4 pb-4 pt-0 text-muted-foreground"
            : variant === "filled" ? "px-3 pb-3 pt-0 text-muted-foreground"
              : "pt-0 pb-4",
          className,
        )}
      >
        {children}
      </div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
export type { AccordionVariant };
