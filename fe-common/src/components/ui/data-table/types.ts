import * as React from "react";

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

export interface DataTableProps<T extends object> {
  columns: ColumnDef<T>[];
  data: T[];
  rowIdKey: keyof T;
  pagination?: "client" | "server" | "none";
  pageSize?: number;
  /** Kept for API compatibility; the footer no longer includes a row-size control—set `pageSize` from the parent. */
  pageSizeOptions?: number[];
  totalRows?: number;
  currentPage?: number;
  onPageChange?: (page: number) => void;
  /** Kept for API compatibility; not invoked from the table UI after the footer change. */
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
}

export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_PAGE_SIZE_OPTIONS = [5, 10, 25, 100];
