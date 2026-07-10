import * as React from "react";

// ── Column definition ─────────────────────────────────────────────────────────

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey?: keyof T;
  accessorFn?: (row: T) => unknown;
  cell?: (info: { row: T; getValue: () => unknown }) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  minWidth?: number;
  maxWidth?: number;
  align?: "left" | "center" | "right";
  pinned?: "left" | "right";
}

/** A single trailing per-row action button rendered by `rowActions`. */
export interface RowAction {
  label: string;
  icon: React.ReactNode;
  onClick: () => void;
  /** Accent color applied on hover/focus. */
  color?: string;
}

/** An entry in the toolbar's "Sort by" dropdown (`sortOptions`). */
export interface SortOption {
  key: string;
  label: string;
  /** Shorter label shown on the trigger button once selected. */
  shortLabel?: string;
}

export interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  rowIdKey: keyof T;
  pagination?: "client" | "server" | "none";
  pageSize?: number;
  pageSizeOptions?: number[];
  totalRows?: number;
  /** Current page. Interpreted relative to `pageNumberBase` — 1-based by default. */
  currentPage?: number;
  /** The base index `currentPage`/`onPageChange` are expressed in. Defaults to 1 (1-based). Pass 0 for a 0-based caller convention. */
  pageNumberBase?: number;
  onPageChange?: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  sortable?: boolean;
  sortModel?: { id: string; direction: "asc" | "desc" }[];
  onSortChange?: (sort: { id: string; direction: "asc" | "desc" }[]) => void;
  selectable?: boolean;
  selectionMode?: "single" | "multi";
  selectedRows?: T[keyof T][];
  onSelectionChange?: (selectedIds: T[keyof T][]) => void;
  /**
   * Enables expandable rows. The leading column hosts expand/collapse when true
   * (that column is always included while expandable is on).
   */
  expandable?: boolean;
  /** Render the expanded panel for a given row. Receives the original row. */
  renderExpandedRow?: (row: T) => React.ReactNode;
  /** Per-row gating. Return false to hide the chevron for that row. */
  isRowExpandable?: (row: T) => boolean;
  /** Controlled expanded ids. Pair with onExpandedRowsChange. */
  expandedRows?: T[keyof T][];
  /** Initial expanded ids (uncontrolled mode only). */
  defaultExpandedRows?: T[keyof T][];
  /** Fires on toggle with the new full list of expanded ids. */
  onExpandedRowsChange?: (expandedIds: T[keyof T][]) => void;
  /** "single" closes any other open row when a new one opens. Defaults to "multi". */
  expansionMode?: "single" | "multi";
  loading?: boolean;
  emptyState?: {
    title?: string;
    description?: string;
    action?: React.ReactNode;
  };
  toolbar?: boolean;
  toolbarActions?: React.ReactNode;
  exportable?: boolean;
  onExport?: () => void;
  /** Shows a search input in the toolbar. */
  searchable?: boolean;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  /** Options for a "Sort by" dropdown in the toolbar, independent of per-column click-sort. */
  sortOptions?: SortOption[];
  sortOptionKey?: string;
  onSortOptionChange?: (key: string) => void;
  /** Per-row trailing action buttons, rendered in a dedicated non-data column. */
  rowActions?: (row: T) => RowAction[] | undefined;
  onRowClick?: (row: T) => void;
  className?: string;
  headerClassName?: string;
  striped?: boolean;
  /**
   * When false, omits the leading chevron column. Defaults to true.
   * Has no effect when `expandable` is true (that column hosts the expand control).
   */
  showRowCue?: boolean;
  cardTitle?: string | React.ReactNode;
  cardSubTitle?: string;
  cardAction?: React.ReactNode;
  /** "compact" renders a centered sliding-window pager with a "Showing a-b of n" caption instead of the default footer. */
  paginationVariant?: "default" | "compact";
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 100];
