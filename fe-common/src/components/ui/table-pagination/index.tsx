import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";

import * as React from "react";

import { cn } from "@/lib/utils";

import { getPageWindow } from "../data-table/helpers";

const controlBase = [
  "inline-flex h-8 shrink-0 items-center justify-center gap-1",
  "rounded-(--radius-sm) text-xs font-semibold uppercase tracking-wide",
  "transition-colors duration-(--duration-fast) ease-(--ease-snappy)",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary-main)",
  "focus-visible:ring-offset-2 focus-visible:ring-offset-(--background)",
  "disabled:pointer-events-none",
].join(" ");

export interface TablePaginationProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Current page index, 1-based */
  currentPage: number;
  /** Total number of pages (should be at least 1 when there is data to paginate) */
  pageCount: number;
  onPageChange: (page: number) => void;
  /** Row count for the default range summary (use with `pageSize`). The range is always clamped so it never exceeds `totalItems`, even if `currentPage` or `pageCount` is higher than the data allows. */
  totalItems?: number;
  pageSize?: number;
  /** Replaces the default range summary on the right */
  summary?: React.ReactNode;
  /**
   * When `summary` is set, or both `totalItems` and `pageSize` are set, a summary
   * region is shown on the right unless this is `false`.
   */
  showSummary?: boolean;
  previousLabel?: string;
  nextLabel?: string;
}

function DefaultRangeSummary({
  currentPage,
  pageSize,
  totalItems,
}: {
  currentPage: number;
  pageSize: number;
  totalItems: number;
}) {
  if (totalItems <= 0) {
    return (
      <p className="mui-table-pagination-summary">
        <span className="mui-table-pagination-summary-reg">Showing </span>
        <span className="mui-table-pagination-summary-num">0</span>
        <span className="mui-table-pagination-summary-reg"> of </span>
        <span className="mui-table-pagination-summary-num">0</span>
      </p>
    );
  }
  if (pageSize <= 0) {
    return (
      <p className="mui-table-pagination-summary">
        <span className="mui-table-pagination-summary-reg">Showing </span>
        <span className="mui-table-pagination-summary-num">{`1-${totalItems}`}</span>
        <span className="mui-table-pagination-summary-reg"> of </span>
        <span className="mui-table-pagination-summary-num">{totalItems}</span>
      </p>
    );
  }
  const maxPage = Math.max(1, Math.ceil(totalItems / pageSize));
  const page = Math.min(Math.max(1, currentPage), maxPage);
  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, totalItems);
  return (
    <p className="mui-table-pagination-summary">
      <span className="mui-table-pagination-summary-reg">Showing </span>
      <span className="mui-table-pagination-summary-num">{`${start}-${end}`}</span>
      <span className="mui-table-pagination-summary-reg"> of </span>
      <span className="mui-table-pagination-summary-num">{totalItems}</span>
    </p>
  );
}

export const TablePagination = React.forwardRef<
  HTMLDivElement,
  TablePaginationProps
>(
  (
    {
      className,
      currentPage,
      pageCount,
      onPageChange,
      totalItems,
      pageSize,
      summary,
      showSummary,
      previousLabel = "PREV",
      nextLabel = "NEXT",
      ...props
    },
    ref,
  ) => {
    const totalPages = Math.max(1, pageCount);
    const safePage = Math.min(Math.max(1, currentPage), totalPages);
    const pageNumbers = getPageWindow(totalPages, safePage);

    const canPrev = safePage > 1;
    const canNext = safePage < totalPages;

    const autoSummary =
      typeof totalItems === "number" && typeof pageSize === "number" ? (
        <DefaultRangeSummary
          currentPage={safePage}
          pageSize={pageSize}
          totalItems={totalItems}
        />
      ) : null;

    const resolvedSummary = summary ?? autoSummary;
    const hasSummary =
      showSummary !== false &&
      resolvedSummary !== null &&
      resolvedSummary !== undefined &&
      resolvedSummary !== "";

    return (
      <div
        ref={ref}
        className={cn(
          "flex w-full flex-wrap items-center gap-3",
          hasSummary ? "justify-between" : "justify-center",
          className,
        )}
        {...props}
      >
        {hasSummary ? (
          <div className="min-w-4 flex-1" aria-hidden="true" />
        ) : null}

        <nav
          className="mui-table-pagination-nav flex items-center gap-1"
          aria-label="Table pagination"
        >
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(1)}
            className={cn(controlBase, "min-w-8 px-1.5 disabled:opacity-30")}
            aria-label="First page"
          >
            <ChevronsLeft size={14} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            disabled={!canPrev}
            onClick={() => onPageChange(safePage - 1)}
            className={cn(controlBase, "min-w-8 px-1.5 disabled:opacity-30")}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} strokeWidth={2} aria-hidden />
          </button>

          {pageNumbers.map((pageNumber) => {
            const active = pageNumber === safePage;
            return (
              <button
                key={pageNumber}
                type="button"
                aria-current={active ? "page" : undefined}
                onClick={() => onPageChange(pageNumber)}
                className={cn(
                  controlBase,
                  "min-w-8 px-2 tabular-nums",
                  active
                    ? "bg-(--primary-main) text-white hover:bg-(--primary-hover)"
                    : "bg-(--card) text-(--foreground) hover:bg-(--bg-hover)",
                )}
              >
                {pageNumber}
              </button>
            );
          })}

          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(safePage + 1)}
            className={cn(controlBase, "min-w-8 px-1.5 disabled:opacity-30")}
            aria-label="Next page"
          >
            <ChevronRight size={14} strokeWidth={2} aria-hidden />
          </button>
          <button
            type="button"
            disabled={!canNext}
            onClick={() => onPageChange(totalPages)}
            className={cn(controlBase, "min-w-8 px-1.5 disabled:opacity-30")}
            aria-label="Last page"
          >
            <ChevronsRight size={14} strokeWidth={2} aria-hidden />
          </button>
        </nav>

        {hasSummary ? (
          <div className="flex min-w-4 flex-1 justify-end items-baseline">
            {typeof resolvedSummary === "string" ? (
              <p className="mui-table-pagination-summary">
                <span className="mui-table-pagination-summary-reg">
                  {resolvedSummary}
                </span>
              </p>
            ) : (
              resolvedSummary
            )}
          </div>
        ) : null}
      </div>
    );
  },
);

TablePagination.displayName = "TablePagination";
