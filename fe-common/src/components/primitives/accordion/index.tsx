"use client";

import { ChevronDownIcon } from "lucide-react";

import * as React from "react";

import * as AccordionPrimitive from "@radix-ui/react-accordion";

import { cn } from "@/lib/utils";

function Accordion({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Root>) {
  return (
    <AccordionPrimitive.Root
      data-slot="accordion"
      className={cn(
        "bg-surface text-foreground border-edge divide-edge w-full divide-y overflow-hidden rounded-lg border shadow-xs",
        className,
      )}
      {...props}
    />
  );
}

function AccordionItem({
  className,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Item>) {
  return (
    <AccordionPrimitive.Item
      data-slot="accordion-item"
      className={cn(
        "group/accordion-item data-[state=open]:bg-hover/40 transition-colors",
        className,
      )}
      {...props}
    />
  );
}

function AccordionTrigger({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="flex">
      <AccordionPrimitive.Trigger
        data-slot="accordion-trigger"
        className={cn(
          "text-foreground hover:bg-hover focus-visible:ring-ring/40 group/accordion-trigger flex flex-1 items-center justify-between gap-4 px-5 py-4 text-left text-sm leading-6 font-medium transition-colors outline-none focus-visible:ring-[3px] disabled:pointer-events-none disabled:opacity-50 data-[state=open]:font-semibold",
          className,
        )}
        {...props}
      >
        <span className="min-w-0 flex-1 truncate">{children}</span>
        <ChevronDownIcon
          aria-hidden="true"
          strokeWidth={2.25}
          className="text-muted-foreground group-hover/accordion-trigger:text-foreground group-data-[state=open]/accordion-trigger:text-foreground pointer-events-none size-5 shrink-0 transition-transform duration-300 ease-out group-data-[state=open]/accordion-trigger:rotate-180"
        />
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

function AccordionContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content
      data-slot="accordion-content"
      className="text-muted-foreground data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down overflow-hidden text-sm leading-relaxed"
      {...props}
    >
      <div className={cn("px-5 pt-3 pb-5", className)}>{children}</div>
    </AccordionPrimitive.Content>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
