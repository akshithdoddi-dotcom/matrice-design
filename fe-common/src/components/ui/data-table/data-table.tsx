import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Columns3,
  Download,
  Filter,
  X,
} from "lucide-react";

import * as React from "react";

import * as Popover from "@radix-ui/react-popover";
import {
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type ColumnDef as TanstackColumnDef,
  type VisibilityState,
  flexRender,
  functionalUpdate,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { cn } from "@/lib/utils";

import { Button } from "../button";
import { ContentCard } from "../card";
import { EmptyState } from "../empty-state";
import { TablePagination } from "../table-pagination";
import { getAlignClass, toSortModel, toSortingState } from "./helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableCheckbox,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "./primitives";
import {
  type ColumnDef,
  DEFAULT_PAGE_SIZE,
  DEFAULT_PAGE_SIZE_OPTIONS,
  type DataTableProps,
} from "./types";

const ROWCUE_COLUMN_ID = "__rowcue__";

function RowCueChevron() {
  return (
    <svg
      className="mui-datatable-rowcue-chevron"
      width={6}
      height={12}
      viewBox="0 0 3 6"
      fill="none"
      aria-hidden
    >
      <path
        d="M0.5 0.5 L2.5 3 L0.5 5.5"
        stroke="currentColor"
        strokeWidth={0.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function DataTable<T extends object>({
  columns,
  data,
  rowIdKey,
  pagination = "client",
  pageSize = DEFAULT_PAGE_SIZE,
  pageSizeOptions: _pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalRows,
  currentPage = 1,
  onPageChange,
  onPageSizeChange: _onPageSizeChange,
  sortable = true,
  sortModel,
  onSortChange,
  selectable = false,
  selectionMode = "multi",
  selectedRows,
  onSelectionChange,
  expandable = false,
  renderExpandedRow,
  isRowExpandable,
  expandedRows,
  defaultExpandedRows,
  onExpandedRowsChange,
  expansionMode = "multi",
  loading = false,
  emptyState,
  toolbar = true,
  toolbarActions,
  exportable = false,
  onExport,
  onRowClick,
  className,
  headerClassName,
  striped = true,
  showRowCue = true,
  cardTitle,
  cardSubTitle,
  cardAction,
}: DataTableProps<T>) {
  const isServerPagination = pagination === "server";
  const hasPagination = pagination !== "none";
  const hasFilterableColumns = columns.some((column) => column.filterable);
  const isSortControlled = sortModel !== undefined;
  const isSelectionControlled = selectedRows !== undefined;

  const [internalSorting, setInternalSorting] = React.useState(
    toSortingState(sortModel),
  );
  const [internalPagination, setInternalPagination] =
    React.useState<PaginationState>({
      pageIndex: 0,
      pageSize,
    });
  const [internalRowSelection, setInternalRowSelection] =
    React.useState<RowSelectionState>({});
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const isExpansionControlled = expandedRows !== undefined;

  const [internalExpanded, setInternalExpanded] = React.useState<
    Record<string, true>
  >(() => {
    const seed: Record<string, true> = {};
    if (defaultExpandedRows) {
      for (const id of defaultExpandedRows) {
        seed[String(id)] = true;
      }
    }
    return seed;
  });

  const controlledExpanded = React.useMemo<Record<string, true>>(() => {
    if (!isExpansionControlled || !expandedRows) {
      return {};
    }
    return expandedRows.reduce<Record<string, true>>((acc, id) => {
      acc[String(id)] = true;
      return acc;
    }, {});
  }, [isExpansionControlled, expandedRows]);

  const expandedState = isExpansionControlled
    ? controlledExpanded
    : internalExpanded;

  React.useEffect(() => {
    setInternalPagination((prev) => ({ ...prev, pageSize }));
  }, [pageSize]);

  const sorting = isSortControlled
    ? toSortingState(sortModel)
    : internalSorting;

  const selectedIdLookup = React.useMemo(() => {
    const map = new Map<string, T[keyof T]>();
    for (const row of data) {
      const rowId = row[rowIdKey] as T[keyof T];
      map.set(String(rowId), rowId);
    }
    return map;
  }, [data, rowIdKey]);

  const alignByColumnId = React.useMemo(() => {
    const map = new Map<string, ColumnDef<T>["align"]>();
    for (const column of columns) {
      map.set(column.id, column.align ?? "left");
    }
    return map;
  }, [columns]);

  const controlledSelection = React.useMemo<RowSelectionState>(() => {
    if (!isSelectionControlled || !selectedRows) {
      return {};
    }
    return selectedRows.reduce<RowSelectionState>((acc, id) => {
      acc[String(id)] = true;
      return acc;
    }, {});
  }, [isSelectionControlled, selectedRows]);

  const rowSelection = isSelectionControlled
    ? controlledSelection
    : internalRowSelection;

  const handleToggleExpanded = React.useCallback(
    (rowId: string) => {
      const isOpen = Boolean(expandedState[rowId]);
      const next: Record<string, true> = isOpen
        ? (Object.fromEntries(
            Object.entries(expandedState).filter(([key]) => key !== rowId),
          ) as Record<string, true>)
        : expansionMode === "single"
          ? { [rowId]: true }
          : { ...expandedState, [rowId]: true };

      if (!isExpansionControlled) {
        setInternalExpanded(next);
      }

      if (onExpandedRowsChange) {
        const ids = Object.keys(next)
          .map((key) => selectedIdLookup.get(key))
          .filter((value): value is T[keyof T] => value !== undefined);
        onExpandedRowsChange(ids);
      }
    },
    [
      expandedState,
      expansionMode,
      isExpansionControlled,
      onExpandedRowsChange,
      selectedIdLookup,
    ],
  );

  const pageCount = React.useMemo(() => {
    if (!hasPagination) {
      return 1;
    }
    if (isServerPagination) {
      const resolvedTotalRows = totalRows ?? data.length;
      return Math.max(1, Math.ceil(resolvedTotalRows / pageSize));
    }
    return undefined;
  }, [hasPagination, isServerPagination, totalRows, data.length, pageSize]);

  const tableColumns = React.useMemo<TanstackColumnDef<T, unknown>[]>(() => {
    const computedColumns: TanstackColumnDef<T, unknown>[] = columns.map(
      (column) => ({
        id: column.id,
        header: column.header,
        accessorKey: column.accessorKey as string | undefined,
        accessorFn: column.accessorFn,
        size: column.minWidth,
        minSize: column.minWidth,
        maxSize: column.maxWidth,
        enableSorting: sortable && (column.sortable ?? true),
        enableHiding: true,
        enableResizing: column.resizable ?? false,
        filterFn: column.filterable
          ? (row, columnId, value) =>
              String(row.getValue(columnId) ?? "")
                .toLowerCase()
                .includes(String(value ?? "").toLowerCase())
          : undefined,
        cell: (context) => {
          if (column.cell) {
            return column.cell({
              row: context.row.original,
              getValue: () => context.getValue(),
            });
          }
          const value = context.getValue();
          return value == null ? "" : String(value);
        },
      }),
    );

    const rowCueColumn: TanstackColumnDef<T, unknown> = {
      id: ROWCUE_COLUMN_ID,
      enableSorting: false,
      enableHiding: false,
      size: 34,
      minSize: 34,
      maxSize: 34,
      header: () => null,
      cell: ({ row }) => {
        if (expandable) {
          const original = row.original;
          const canExpand = isRowExpandable
            ? isRowExpandable(original)
            : Boolean(renderExpandedRow);
          if (!canExpand) {
            return (
              <span className="mui-datatable-rowcue-cell" aria-hidden="true" />
            );
          }
          const rowId = String(original[rowIdKey]);
          const isOpen = Boolean(expandedState[rowId]);
          return (
            <div className="mui-datatable-rowcue-cell mui-datatable-expand-cell">
              <button
                type="button"
                className={cn(
                  "mui-datatable-expand-toggle",
                  isOpen && "mui-datatable-expand-toggle-open",
                )}
                aria-expanded={isOpen}
                aria-controls={`mui-datatable-expanded-${rowId}`}
                aria-label={isOpen ? "Collapse row" : "Expand row"}
                onClick={(event) => {
                  event.stopPropagation();
                  handleToggleExpanded(rowId);
                }}
              >
                <RowCueChevron />
              </button>
            </div>
          );
        }
        return (
          <div className="mui-datatable-rowcue-cell">
            <span className="mui-datatable-rowcue-icon" aria-hidden="true">
              <RowCueChevron />
            </span>
          </div>
        );
      },
    };

    const leadingColumns: TanstackColumnDef<T, unknown>[] = [];

    if (showRowCue || expandable) {
      leadingColumns.push(rowCueColumn);
    }

    if (selectable) {
      const selectionColumn: TanstackColumnDef<T, unknown> = {
        id: "__select__",
        enableSorting: false,
        enableHiding: false,
        size: 44,
        minSize: 44,
        maxSize: 44,
        header: ({ table }) =>
          selectionMode === "multi" ? (
            <div className="mui-datatable-select-cell">
              <TableCheckbox
                checked={table.getIsAllPageRowsSelected()}
                indeterminate={table.getIsSomePageRowsSelected()}
                ariaLabel="Select all rows"
                onChange={(checked) => table.toggleAllPageRowsSelected(checked)}
              />
            </div>
          ) : null,
        cell: ({ row }) => (
          <div className="mui-datatable-select-cell">
            <TableCheckbox
              checked={row.getIsSelected()}
              ariaLabel="Select row"
              onChange={(checked) => row.toggleSelected(checked)}
            />
          </div>
        ),
      };
      leadingColumns.push(selectionColumn);
    }

    if (leadingColumns.length === 0) {
      return computedColumns;
    }

    return [...leadingColumns, ...computedColumns];
  }, [
    columns,
    showRowCue,
    selectable,
    selectionMode,
    sortable,
    expandable,
    renderExpandedRow,
    isRowExpandable,
    rowIdKey,
    expandedState,
    handleToggleExpanded,
  ]);

  const table = useReactTable({
    data,
    columns: tableColumns,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel:
      sortable && !isServerPagination ? getSortedRowModel() : undefined,
    getFilteredRowModel: hasFilterableColumns
      ? getFilteredRowModel()
      : undefined,
    getPaginationRowModel:
      pagination === "client" ? getPaginationRowModel() : undefined,
    manualPagination: isServerPagination,
    manualSorting: isServerPagination && sortable,
    pageCount,
    state: {
      sorting,
      rowSelection,
      columnVisibility,
      columnFilters,
      pagination: isServerPagination
        ? { pageIndex: Math.max(currentPage - 1, 0), pageSize }
        : internalPagination,
    },
    onSortingChange: (updater) => {
      const next = functionalUpdate(updater, sorting);
      if (!isSortControlled) {
        setInternalSorting(next);
      }
      onSortChange?.(toSortModel(next));
    },
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    onPaginationChange:
      pagination === "client" ? setInternalPagination : undefined,
    enableRowSelection: selectable,
    enableMultiRowSelection: selectionMode === "multi",
    onRowSelectionChange: (updater) => {
      const next = functionalUpdate(updater, rowSelection);
      if (!isSelectionControlled) {
        setInternalRowSelection(next);
      }
      const selectedIds = Object.entries(next)
        .filter(([, value]) => Boolean(value))
        .map(([id]) => selectedIdLookup.get(id))
        .filter((value): value is T[keyof T] => value !== undefined);
      onSelectionChange?.(selectedIds);
    },
    getRowId: (row) => String(row[rowIdKey]),
  });

  const visibleLeafColumns = table.getVisibleLeafColumns();
  const totalVisibleColumns = visibleLeafColumns.length;
  const firstDataColumnId = columns[0]?.id;
  const rows = table.getRowModel().rows;

  const resolvedTotalRows = hasPagination
    ? isServerPagination
      ? (totalRows ?? data.length)
      : table.getFilteredRowModel().rows.length
    : data.length;

  const currentPageIndex = hasPagination
    ? isServerPagination
      ? Math.max(currentPage - 1, 0)
      : table.getState().pagination.pageIndex
    : 0;

  const currentPageSize = hasPagination
    ? isServerPagination
      ? pageSize
      : table.getState().pagination.pageSize
    : data.length;

  const pageCountResolved = hasPagination
    ? isServerPagination
      ? Math.max(1, Math.ceil(resolvedTotalRows / currentPageSize))
      : Math.max(1, table.getPageCount())
    : 1;

  const handlePageChange = (page: number) => {
    if (!hasPagination) {
      return;
    }
    if (isServerPagination) {
      onPageChange?.(page);
      return;
    }
    table.setPageIndex(page - 1);
    onPageChange?.(page);
  };

  const handleDefaultExport = () => {
    const visibleColumns = table
      .getVisibleLeafColumns()
      .filter(
        (column) =>
          column.id !== "__select__" && column.id !== ROWCUE_COLUMN_ID,
      );

    const headers = visibleColumns.map((column) =>
      String(column.columnDef.header ?? column.id),
    );
    const body = table.getFilteredRowModel().rows.map((row) =>
      visibleColumns.map((column) => {
        const value = row.getValue(column.id);
        return `"${String(value ?? "")
          .split('"')
          .join('""')}"`;
      }),
    );
    const csv = [
      headers.join(","),
      ...body.map((cells) => cells.join(",")),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "data-table-export.csv";
    anchor.click();
    URL.revokeObjectURL(url);
  };

  const internalTable = (
    <div className={cn("mui-datatable", className)}>
      {toolbar && (
        <div className="mui-datatable-toolbar">
          <Popover.Root>
            <Popover.Trigger asChild>
              <button type="button" className="mui-datatable-toolbar-btn">
                <Columns3 size={13} />
                Columns
              </button>
            </Popover.Trigger>
            <Popover.Content
              sideOffset={8}
              align="start"
              className="mui-datatable-popover"
            >
              <div className="mui-datatable-popover-title">Toggle columns</div>
              <div className="mui-datatable-popover-list">
                {table
                  .getAllLeafColumns()
                  .filter(
                    (column) =>
                      column.id !== "__select__" &&
                      column.id !== ROWCUE_COLUMN_ID,
                  )
                  .map((column) => (
                    <label
                      key={column.id}
                      className="mui-datatable-popover-item"
                    >
                      <input
                        type="checkbox"
                        checked={column.getIsVisible()}
                        onChange={(event) =>
                          column.toggleVisibility(event.target.checked)
                        }
                        className="mui-datatable-checkbox"
                      />
                      <span>
                        {String(column.columnDef.header ?? column.id)}
                      </span>
                    </label>
                  ))}
              </div>
            </Popover.Content>
          </Popover.Root>

          {hasFilterableColumns && (
            <Popover.Root>
              <Popover.Trigger asChild>
                <button type="button" className="mui-datatable-toolbar-btn">
                  <Filter size={13} />
                  Filter
                </button>
              </Popover.Trigger>
              <Popover.Content
                sideOffset={8}
                align="start"
                className="mui-datatable-popover"
              >
                <div className="mui-datatable-filter-head">
                  <p className="mui-datatable-popover-title">Filters</p>
                  <button
                    type="button"
                    onClick={() => table.resetColumnFilters()}
                    className="mui-datatable-clear"
                  >
                    <X size={12} />
                    Clear
                  </button>
                </div>
                <div className="mui-datatable-filter-list">
                  {columns
                    .filter((column) => column.filterable)
                    .map((column) => {
                      const tableColumn = table.getColumn(column.id);
                      if (!tableColumn) {
                        return null;
                      }
                      return (
                        <div
                          key={column.id}
                          className="mui-datatable-filter-item"
                        >
                          <label className="mui-datatable-filter-label">
                            {column.header}
                          </label>
                          <input
                            value={String(tableColumn.getFilterValue() ?? "")}
                            onChange={(event) =>
                              tableColumn.setFilterValue(event.target.value)
                            }
                            className="mui-datatable-filter-input"
                            placeholder={`Filter ${column.header}`}
                          />
                        </div>
                      );
                    })}
                </div>
              </Popover.Content>
            </Popover.Root>
          )}

          {exportable && (
            <button
              type="button"
              className="mui-datatable-toolbar-btn"
              onClick={() => (onExport ? onExport() : handleDefaultExport())}
            >
              <Download size={13} />
              Export
            </button>
          )}

          <div className="flex-1" />
          {toolbarActions}
        </div>
      )}

      <div className="mui-datatable-scroll">
        <Table>
          <TableHeader className={headerClassName}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  const alignClass = getAlignClass(
                    header.column.id === ROWCUE_COLUMN_ID
                      ? "center"
                      : (alignByColumnId.get(header.column.id) ?? "left"),
                  );
                  const canSort = header.column.getCanSort();
                  const sortDirection = header.column.getIsSorted();

                  return (
                    <TableHead
                      key={header.id}
                      className={cn(
                        alignClass,
                        canSort && "mui-datatable-th-sortable",
                        header.column.id === "__select__" &&
                          "mui-datatable-th-select",
                        header.column.id === ROWCUE_COLUMN_ID &&
                          "mui-datatable-th-rowcue",
                      )}
                      style={
                        header.column.id !== "__select__" &&
                        header.column.id !== ROWCUE_COLUMN_ID
                          ? { minWidth: header.column.getSize() }
                          : undefined
                      }
                      onClick={
                        canSort
                          ? header.column.getToggleSortingHandler()
                          : undefined
                      }
                    >
                      {header.isPlaceholder ? null : (
                        <div
                          className={cn(
                            "mui-datatable-th-inner",
                            alignClass === "text-right" && "ml-auto",
                            sortDirection && "mui-datatable-th-sorted",
                          )}
                        >
                          <span className="truncate">
                            {flexRender(
                              header.column.columnDef.header,
                              header.getContext(),
                            )}
                          </span>
                          {canSort &&
                            (sortDirection === "asc" ? (
                              <ArrowUp size={14} />
                            ) : sortDirection === "desc" ? (
                              <ArrowDown size={14} />
                            ) : (
                              <ArrowUpDown
                                size={14}
                                className="text-muted-foreground"
                              />
                            ))}
                        </div>
                      )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {!loading && rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={totalVisibleColumns}
                  className="mui-datatable-empty-cell border-b-0 p-0"
                >
                  <div className="px-4 py-6">
                    <EmptyState
                      title={emptyState?.title ?? "No data"}
                      description={
                        emptyState?.description ?? "No items to display"
                      }
                      action={emptyState?.action}
                    />
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              rows.map((row, dataRowIndex) => {
                const rowId = row.id;
                const isExpanded = expandable && Boolean(expandedState[rowId]);
                const canExpand =
                  expandable &&
                  (isRowExpandable
                    ? isRowExpandable(row.original)
                    : Boolean(renderExpandedRow));

                return (
                  <React.Fragment key={row.id}>
                    <TableRow
                      className={cn(
                        striped &&
                          (dataRowIndex % 2 === 0
                            ? "mui-datatable-row-even"
                            : "mui-datatable-row-odd"),
                        row.getIsSelected() && "mui-datatable-row-selected",
                        onRowClick && "mui-datatable-row-clickable",
                        isExpanded && "mui-datatable-row-expanded",
                      )}
                      onClick={() => onRowClick?.(row.original)}
                    >
                      {row.getVisibleCells().map((cell) => {
                        const alignClass = getAlignClass(
                          cell.column.id === ROWCUE_COLUMN_ID
                            ? "center"
                            : (alignByColumnId.get(cell.column.id) ?? "left"),
                        );
                        const isFirstDataColumn =
                          cell.column.id === firstDataColumnId &&
                          cell.column.id !== "__select__" &&
                          cell.column.id !== ROWCUE_COLUMN_ID;
                        const isStatusColumn =
                          cell.column.id !== "__select__" &&
                          cell.column.id !== ROWCUE_COLUMN_ID &&
                          cell.column.id.toLowerCase() === "status";
                        const isSecondaryDataCell =
                          cell.column.id !== "__select__" &&
                          cell.column.id !== ROWCUE_COLUMN_ID &&
                          !isFirstDataColumn &&
                          !isStatusColumn;
                        return (
                          <TableCell
                            key={cell.id}
                            className={cn(
                              alignClass,
                              cell.column.id === "__select__" &&
                                "mui-datatable-td-select",
                              cell.column.id === ROWCUE_COLUMN_ID &&
                                "mui-datatable-td-rowcue",
                              isFirstDataColumn && "mui-datatable-td-lead",
                              isSecondaryDataCell && "mui-datatable-td-body",
                            )}
                            style={
                              cell.column.id !== "__select__" &&
                              cell.column.id !== ROWCUE_COLUMN_ID
                                ? { minWidth: cell.column.getSize() }
                                : undefined
                            }
                          >
                            {flexRender(
                              cell.column.columnDef.cell,
                              cell.getContext(),
                            )}
                          </TableCell>
                        );
                      })}
                    </TableRow>

                    {isExpanded && canExpand && renderExpandedRow ? (
                      <tr
                        id={`mui-datatable-expanded-${rowId}`}
                        className="mui-datatable-expanded-row"
                        data-state="open"
                      >
                        <td
                          colSpan={totalVisibleColumns}
                          className="mui-datatable-expanded-cell"
                        >
                          <div className="mui-datatable-expanded-content">
                            {renderExpandedRow(row.original)}
                          </div>
                        </td>
                      </tr>
                    ) : null}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>

          {hasPagination && (
            <TableFooter>
              <TableRow>
                <TableCell
                  colSpan={totalVisibleColumns}
                  className="mui-datatable-footer-cell"
                >
                  <TablePagination
                    currentPage={currentPageIndex + 1}
                    pageCount={pageCountResolved}
                    onPageChange={handlePageChange}
                    totalItems={resolvedTotalRows}
                    pageSize={currentPageSize}
                  />
                </TableCell>
              </TableRow>
            </TableFooter>
          )}
        </Table>
      </div>

      {loading && (
        <div className="mui-datatable-loading">
          <div className="mui-datatable-loading-bar-wrap">
            <div className="mui-datatable-loading-bar" />
          </div>
          <div className="mui-datatable-loading-overlay" />
        </div>
      )}
    </div>
  );

  if (cardTitle !== undefined && cardTitle !== null) {
    return (
      <ContentCard
        header={cardTitle}
        subHeader={cardSubTitle}
        action={cardAction}
        contentClassName="p-0"
      >
        {internalTable}
      </ContentCard>
    );
  }

  return internalTable;
}
