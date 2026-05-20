"use client";

import {
  ChevronLeftIcon,
  ChevronRightIcon,
  MoreHorizontalIcon,
} from "lucide-react";

import * as React from "react";

import { buttonVariants } from "@/components/primitives/button";
import { cn } from "@/lib/utils";

type ButtonSize = "default" | "sm" | "lg" | "icon";

function PaginationRoot({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  );
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex flex-row items-center gap-1", className)}
      {...props}
    />
  );
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />;
}

type PaginationLinkProps = {
  isActive?: boolean;
  size?: ButtonSize;
  asChild?: React.ElementType;
} & React.ComponentProps<"a">;

function PaginationLink({
  className,
  isActive,
  size = "icon",
  asChild,
  ...props
}: PaginationLinkProps) {
  const Comp = asChild ?? "a";
  return (
    <Comp
      aria-current={isActive ? "page" : undefined}
      data-slot="pagination-link"
      data-active={isActive}
      className={cn(
        buttonVariants({
          variant: isActive ? "outline" : "ghost",
          size,
        }),
        className,
      )}
      {...props}
    />
  );
}

type PaginationEdgeButtonProps = React.ComponentProps<typeof PaginationLink> & {
  label?: string;
};

function PaginationPrevious({
  className,
  label = "Previous",
  ...props
}: PaginationEdgeButtonProps) {
  return (
    <PaginationLink
      aria-label={label}
      size="default"
      className={cn("gap-1 px-2.5 sm:pl-2.5", className)}
      {...props}
    >
      <ChevronLeftIcon />
      <span className="hidden sm:block">{label}</span>
    </PaginationLink>
  );
}

function PaginationNext({
  className,
  label = "Next",
  ...props
}: PaginationEdgeButtonProps) {
  return (
    <PaginationLink
      aria-label={label}
      size="default"
      className={cn("gap-1 px-2.5 sm:pr-2.5", className)}
      {...props}
    >
      <span className="hidden sm:block">{label}</span>
      <ChevronRightIcon />
    </PaginationLink>
  );
}

type PaginationEllipsisProps = React.ComponentProps<"span"> & {
  srLabel?: string;
};

function PaginationEllipsis({
  className,
  srLabel = "More pages",
  ...props
}: PaginationEllipsisProps) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn("flex size-9 items-center justify-center", className)}
      {...props}
    >
      <MoreHorizontalIcon className="size-4" />
      <span className="sr-only">{srLabel}</span>
    </span>
  );
}

// ---------------------------------------------------------------------------
// Config-driven wrapper
// ---------------------------------------------------------------------------

type PaginationLabels = {
  previous?: string;
  next?: string;
  more?: string;
  page?: (n: number) => string;
};

type PaginationProps = {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
  showEdges?: boolean;
  as?: React.ElementType;
  hrefBuilder?: (page: number) => string | undefined;
  labels?: PaginationLabels;
  className?: string;
};

function buildPageList(
  page: number,
  totalPages: number,
  siblingCount: number,
): Array<number | "left-ellipsis" | "right-ellipsis"> {
  if (totalPages <= 1) return [1];

  const totalNumbers = siblingCount * 2 + 5;
  if (totalPages <= totalNumbers) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const leftSibling = Math.max(page - siblingCount, 2);
  const rightSibling = Math.min(page + siblingCount, totalPages - 1);
  const showLeftEllipsis = leftSibling > 2;
  const showRightEllipsis = rightSibling < totalPages - 1;

  const items: Array<number | "left-ellipsis" | "right-ellipsis"> = [1];
  if (showLeftEllipsis) items.push("left-ellipsis");
  for (let i = leftSibling; i <= rightSibling; i++) items.push(i);
  if (showRightEllipsis) items.push("right-ellipsis");
  items.push(totalPages);
  return items;
}

function Pagination({
  page,
  totalPages,
  onPageChange,
  siblingCount = 1,
  showEdges = true,
  as,
  hrefBuilder,
  labels,
  className,
}: PaginationProps) {
  const items = React.useMemo(
    () => buildPageList(page, totalPages, siblingCount),
    [page, totalPages, siblingCount],
  );

  const handleSelect = (n: number) => (event: React.MouseEvent) => {
    if (n === page) return;
    if (!hrefBuilder) event.preventDefault();
    onPageChange(n);
  };

  const pageLabel = labels?.page ?? ((n: number) => `Page ${n}`);
  const isFirst = page <= 1;
  const isLast = page >= totalPages;

  if (totalPages <= 0) return null;

  return (
    <PaginationRoot className={className}>
      <PaginationContent>
        {showEdges && (
          <PaginationItem>
            <PaginationPrevious
              asChild={as}
              label={labels?.previous}
              href={isFirst ? undefined : hrefBuilder?.(page - 1)}
              aria-disabled={isFirst}
              data-disabled={isFirst || undefined}
              className={cn(isFirst && "pointer-events-none opacity-50")}
              onClick={isFirst ? undefined : handleSelect(page - 1)}
            />
          </PaginationItem>
        )}

        {items.map((item, idx) => {
          if (item === "left-ellipsis" || item === "right-ellipsis") {
            return (
              <PaginationItem key={`${item}-${idx}`}>
                <PaginationEllipsis srLabel={labels?.more} />
              </PaginationItem>
            );
          }
          const isActive = item === page;
          return (
            <PaginationItem key={item}>
              <PaginationLink
                asChild={as}
                isActive={isActive}
                aria-label={pageLabel(item)}
                href={hrefBuilder?.(item)}
                onClick={handleSelect(item)}
              >
                {item}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        {showEdges && (
          <PaginationItem>
            <PaginationNext
              asChild={as}
              label={labels?.next}
              href={isLast ? undefined : hrefBuilder?.(page + 1)}
              aria-disabled={isLast}
              data-disabled={isLast || undefined}
              className={cn(isLast && "pointer-events-none opacity-50")}
              onClick={isLast ? undefined : handleSelect(page + 1)}
            />
          </PaginationItem>
        )}
      </PaginationContent>
    </PaginationRoot>
  );
}

export {
  Pagination,
  PaginationRoot,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
};
export type { PaginationProps, PaginationLabels };
