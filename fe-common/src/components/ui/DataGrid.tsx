import { useState, useMemo } from "react";
import {
  Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight,
  ChevronUp, ChevronDown, ChevronsUpDown, Square, CheckSquare,
} from "lucide-react";
import { cn } from "./utils";

// ─── Column definition ────────────────────────────────────────────────────────

export interface DataGridColumn<T = Record<string, unknown>> {
  key: string;
  header: string;
  headerContent?: React.ReactNode;
  width?: string;
  minWidth?: number;
  align?: "left" | "center" | "right";
  render: (row: T, hovered: boolean) => React.ReactNode;
  searchValue?: (row: T) => string;
  /** Enable client-side sorting for this column */
  sortable?: boolean;
  /** Custom sort comparator; falls back to localeCompare when omitted */
  sortFn?: (a: T, b: T, dir: "asc" | "desc") => number;
}

export interface DataGridProps<T extends { id: string | number }> {
  columns: DataGridColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  compact?: boolean;
  className?: string;
  emptyState?: React.ReactNode;
  getRowId?: (row: T) => string | number;
  // ── Search ──────────────────────────────────────────────────────────────────
  searchable?: boolean;
  searchPlaceholder?: string;
  // ── Pagination ──────────────────────────────────────────────────────────────
  pageSize?: number;
  // ── Sorting ─────────────────────────────────────────────────────────────────
  defaultSortKey?: string;
  defaultSortDir?: "asc" | "desc";
  /** Provide to take control of sorting (server-side). Omit for client-side. */
  onSortChange?: (key: string, dir: "asc" | "desc") => void;
  // ── Loading skeleton ────────────────────────────────────────────────────────
  loading?: boolean;
  loadingRows?: number;
  // ── Row selection ───────────────────────────────────────────────────────────
  selectable?: boolean;
  selectedIds?: Set<string | number>;
  onSelectionChange?: (ids: Set<string | number>) => void;
  // ── Expandable rows (v2.3 accordion) ────────────────────────────────────────
  expandable?: boolean;
  /** Return false to hide the expand chevron for a specific row */
  isRowExpandable?: (row: T) => boolean;
  /** Render content shown below the row when expanded */
  renderExpandedRow?: (row: T) => React.ReactNode;
  /** Controlled expanded state — array of expanded row ids */
  expandedRowIds?: (string | number)[];
  /** Fires when expand state changes */
  onExpandedRowIdsChange?: (ids: (string | number)[]) => void;
  /** Highlight a single row as "active/selected" without checkbox selection */
  selectedRowId?: string | number;
}

// ─── Palette (mirrors theme.css tokens) ──────────────────────────────────────

const TEAL        = "#00775B";
const HDR_BG      = "#F8FAFC";
const HDR_TEXT    = "#1E293B";
const ROW_HOVER   = "#EBF5F1";
const ROW_ODD     = "#F8FDFC";
const ROW_EVEN    = "#ffffff";
const ROW_SEL     = "#E5FFF7";
const BORDER_CLR  = "#E2E8F0";
const DIVIDER_CLR = "#F1F5F9";

// ─── Deterministic skeleton widths ───────────────────────────────────────────

const SKW = [72, 85, 60, 78, 55, 90, 68, 82, 63, 75];

// ─── Smart sliding-window pagination ─────────────────────────────────────────

function pagWindow(page: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, page - 2);
  const end   = Math.min(total, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ─── Shared atoms ─────────────────────────────────────────────────────────────

export const GridActionButton = ({
  children, hoverColor = TEAL, hoverBg, title, onClick,
}: {
  children: React.ReactNode;
  hoverColor?: string;
  hoverBg?: string;
  title?: string;
  onClick?: (e: React.MouseEvent) => void;
}) => (
  <button
    title={title}
    onClick={onClick}
    onMouseEnter={(e) => {
      e.currentTarget.style.color = hoverColor;
      e.currentTarget.style.backgroundColor = hoverBg ?? `${hoverColor}14`;
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.color = "#94A3B8";
      e.currentTarget.style.backgroundColor = "transparent";
    }}
    style={{
      display: "flex", alignItems: "center", justifyContent: "center",
      width: 26, height: 26, borderRadius: 3, border: "none",
      background: "transparent", cursor: "pointer", color: "#94A3B8",
      transition: "color 120ms ease, background-color 120ms ease", flexShrink: 0,
    }}
  >
    {children}
  </button>
);

export const GridActions = ({ visible, children }: { visible: boolean; children: React.ReactNode }) => (
  <div
    style={{
      display: "flex", alignItems: "center", gap: 2, padding: "3px 6px",
      backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)", border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: 4, boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      opacity: visible ? 1 : 0, transition: "opacity 150ms ease",
    }}
  >
    {children}
  </div>
);

// ─── StatusCapsule ────────────────────────────────────────────────────────────

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  // Severity
  critical:   { label: "Critical",   bg: "#E7000B" },
  high:       { label: "High",       bg: "#EA580C" },
  warning:    { label: "Warning",    bg: "#EA580C" },
  medium:     { label: "Medium",     bg: "#E19A04" },
  low:        { label: "Low",        bg: "#2B7FFF" },
  info:       { label: "Info",       bg: "#2B7FFF" },
  // Green
  stable:     { label: "Stable",     bg: "#00A63E" },
  success:    { label: "Success",    bg: "#00A63E" },
  resolved:   { label: "Resolved",   bg: "#475569" },
  active:     { label: "Active",     bg: "#00A63E" },
  running:    { label: "Running",    bg: "#00A63E" },
  complete:   { label: "Complete",   bg: "#00A63E" },
  deployed:   { label: "Deployed",   bg: "#00A63E" },
  available:  { label: "Available",  bg: "#00A63E" },
  enabled:    { label: "Enabled",    bg: "#00A63E" },
  // Blue
  training:   { label: "Training",   bg: "#0284C7" },
  "in-use":   { label: "In Use",     bg: "#0284C7" },
  syncing:    { label: "Syncing",    bg: "#0284C7" },
  // Amber
  pending:    { label: "Pending",    bg: "#E19A04" },
  queued:     { label: "Queued",     bg: "#E19A04" },
  paused:     { label: "Paused",     bg: "#E19A04" },
  // Red
  failed:     { label: "Failed",     bg: "#E7000B" },
  flagged:    { label: "Flagged",    bg: "#E7000B" },
  error:      { label: "Error",      bg: "#E7000B" },
  // Neutral
  draft:      { label: "Draft",      bg: "#94A3B8" },
  unknown:    { label: "Unknown",    bg: "#94A3B8" },
  offline:    { label: "Offline",    bg: "#94A3B8" },
  disabled:   { label: "Disabled",   bg: "#94A3B8" },
  archived:   { label: "Archived",   bg: "#94A3B8" },
  deprecated: { label: "Deprecated", bg: "#94A3B8" },
};

// Issue 3.5: Non-color symbol prefixes so status is scannable without colour vision
const STATUS_SYMBOL: Record<string, string> = {
  // Green — checkmark
  active: "✓", online: "✓", running: "✓", healthy: "✓",
  success: "✓", available: "✓", enabled: "✓",
  // Amber — warning
  degraded: "⚠", warning: "⚠", pending: "◌", queued: "◌", paused: "⏸",
  // Red — cross
  offline: "✕", failed: "✕", error: "✕", flagged: "!",
  // Blue — activity
  starting: "▶", training: "◎", "in-use": "◎", syncing: "⟳",
  // Neutral — square
  stopped: "■", draft: "○", unknown: "?", disabled: "⊘",
};

export const StatusCapsule = ({
  status, label: overrideLabel,
}: {
  status: string; label?: string;
}) => {
  const key = status.toLowerCase();
  const cfg = STATUS_CFG[key] ?? { label: status, bg: "#94A3B8" };
  const symbol = STATUS_SYMBOL[key];
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", color: "#ffffff",
      backgroundColor: cfg.bg,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      whiteSpace: "nowrap",
    }}>
      {symbol && (
        <span style={{ fontSize: 9, opacity: 0.9, letterSpacing: 0, textTransform: "none" }}>
          {symbol}
        </span>
      )}
      {overrideLabel ?? cfg.label}
    </span>
  );
};

// ─── MonoCell ─────────────────────────────────────────────────────────────────

export const MonoCell = ({
  children, hovered, isPrimary, color = "#475569",
  hoveredColor = "#0F172A", fontSize = 12,
}: {
  children: React.ReactNode;
  hovered: boolean;
  isPrimary?: boolean;
  color?: string;
  hoveredColor?: string;
  fontSize?: number;
}) => (
  <span style={{
    fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
    fontSize, fontWeight: hovered && isPrimary ? 700 : 500,
    color: hovered ? hoveredColor : color,
    letterSpacing: "0.01em", transition: "color 100ms ease",
  }}>
    {children}
  </span>
);

// ─── InterCell ────────────────────────────────────────────────────────────────

export const InterCell = ({
  children, hovered, isPrimary, color = "#334155",
  hoveredColor = "#0F172A", fontSize = 12, className,
}: {
  children: React.ReactNode;
  hovered: boolean;
  isPrimary?: boolean;
  color?: string;
  hoveredColor?: string;
  fontSize?: number;
  className?: string;
}) => (
  <span className={className} style={{
    fontFamily: "Inter, sans-serif", fontSize,
    fontWeight: hovered && isPrimary ? 600 : 400,
    color: hovered ? hoveredColor : color, transition: "color 120ms ease",
  }}>
    {children}
  </span>
);

// ─── Sort icon ────────────────────────────────────────────────────────────────

const SortIcon = ({ active, dir }: { active: boolean; dir: "asc" | "desc" }) => {
  if (!active) return <ChevronsUpDown style={{ width: 11, height: 11, color: "#CBD5E1", flexShrink: 0 }} />;
  return dir === "asc"
    ? <ChevronUp  style={{ width: 11, height: 11, color: TEAL, flexShrink: 0 }} />
    : <ChevronDown style={{ width: 11, height: 11, color: TEAL, flexShrink: 0 }} />;
};

// ─── DataGrid ─────────────────────────────────────────────────────────────────

export function DataGrid<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  compact = false,
  className,
  emptyState,
  getRowId,
  searchable,
  searchPlaceholder,
  pageSize,
  defaultSortKey,
  defaultSortDir = "asc",
  onSortChange,
  loading = false,
  loadingRows = 5,
  selectable = false,
  selectedIds: controlledSelectedIds,
  onSelectionChange,
  expandable = false,
  isRowExpandable,
  renderExpandedRow,
  expandedRowIds,
  onExpandedRowIdsChange,
  selectedRowId,
}: DataGridProps<T>) {
  const [hoveredId, setHoveredId]   = useState<string | number | null>(null);
  const [searchQ,   setSearchQ]     = useState("");
  const [page,      setPage]        = useState(1);
  const [sortKey,   setSortKey]     = useState<string | null>(defaultSortKey ?? null);
  const [sortDir,   setSortDir]     = useState<"asc" | "desc">(defaultSortDir);
  const [internalSelected, setInternalSelected] = useState<Set<string | number>>(new Set());
  const [internalExpanded, setInternalExpanded] = useState<Set<string | number>>(new Set());

  const selectedIds = controlledSelectedIds ?? internalSelected;
  const setSelected = (ids: Set<string | number>) => {
    if (!controlledSelectedIds) setInternalSelected(ids);
    onSelectionChange?.(ids);
  };

  const expandedIds = expandedRowIds ? new Set(expandedRowIds) : internalExpanded;
  const toggleExpand = (id: string | number) => {
    const next = new Set(expandedIds);
    next.has(id) ? next.delete(id) : next.add(id);
    if (!expandedRowIds) setInternalExpanded(next);
    onExpandedRowIdsChange?.([...next]);
  };

  const rowH        = compact ? 36 : 44;
  const resolveId   = (row: T) => (getRowId ? getRowId(row) : row.id);

  // Auto-injected columns: expand chevron + select checkbox
  const allColumns: DataGridColumn<T>[] = useMemo(() => {
    const cols: DataGridColumn<T>[] = [];

    // Expand chevron column
    if (expandable) {
      cols.push({
        key: "__expand__",
        header: "",
        width: "32px",
        align: "center",
        render: (row: T) => {
          const id = resolveId(row);
          const canExpand = isRowExpandable ? isRowExpandable(row) : true;
          const isExp = expandedIds.has(id);
          if (!canExpand) return <span style={{ width: 14 }} />;
          return (
            <button
              onClick={(e) => { e.stopPropagation(); toggleExpand(id); }}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", padding: 0, width: 20, height: 20, borderRadius: 3, color: isExp ? TEAL : "#CBD5E1", transition: "color 120ms ease" }}
            >
              <ChevronRight style={{ width: 14, height: 14, transition: "transform 150ms ease", transform: isExp ? "rotate(90deg)" : "none" }} />
            </button>
          );
        },
      });
    }

    // Select checkbox column
    if (selectable) {
      const allIds = data.map(resolveId);
      const allSelected = allIds.length > 0 && allIds.every((id) => selectedIds.has(id));
      const someSelected = allIds.some((id) => selectedIds.has(id)) && !allSelected;
      cols.push({
        key: "__select__",
        header: "",
        width: "40px",
        align: "center",
        headerContent: (
          <button
            onClick={(e) => {
              e.stopPropagation();
              const next = new Set<string | number>(allSelected ? [] : allIds);
              setSelected(next);
            }}
            style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: allSelected ? TEAL : someSelected ? TEAL : "#CBD5E1" }}
          >
            {allSelected
              ? <CheckSquare style={{ width: 14, height: 14 }} />
              : <Square style={{ width: 14, height: 14, opacity: someSelected ? 0.6 : 1 }} />}
          </button>
        ),
        render: (row: T) => {
          const id  = resolveId(row);
          const sel = selectedIds.has(id);
          return (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const next = new Set(selectedIds);
                sel ? next.delete(id) : next.add(id);
                setSelected(next);
              }}
              style={{ background: "none", border: "none", cursor: "pointer", display: "flex", alignItems: "center", color: sel ? TEAL : "#CBD5E1" }}
            >
              {sel
                ? <CheckSquare style={{ width: 14, height: 14 }} />
                : <Square style={{ width: 14, height: 14 }} />}
            </button>
          );
        },
      });
    }

    cols.push(...columns);
    return cols;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columns, selectable, selectedIds, data, expandable, expandedIds]);

  const colTemplate = allColumns.map((c) => c.width ?? "1fr").join(" ");

  // ── Search ────────────────────────────────────────────────────────────────
  const filteredData = useMemo(() => {
    if (!searchQ.trim()) return data;
    const q = searchQ.toLowerCase();
    return data.filter((row) =>
      columns.some((col) => {
        if (col.searchValue) return col.searchValue(row).toLowerCase().includes(q);
        const v = (row as Record<string, unknown>)[col.key];
        return typeof v === "string" ? v.toLowerCase().includes(q) : String(v ?? "").toLowerCase().includes(q);
      })
    );
  }, [data, searchQ, columns]);

  // ── Client-side sort (skipped when onSortChange is provided = server-side) ─
  const sortedData = useMemo(() => {
    if (!sortKey || onSortChange) return filteredData;
    const col = columns.find((c) => c.key === sortKey);
    return [...filteredData].sort((a, b) => {
      if (col?.sortFn) return col.sortFn(a, b, sortDir);
      const aV = String((a as Record<string, unknown>)[sortKey] ?? "");
      const bV = String((b as Record<string, unknown>)[sortKey] ?? "");
      const cmp = aV.localeCompare(bV, undefined, { numeric: true, sensitivity: "base" });
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredData, sortKey, sortDir, columns, onSortChange]);

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages   = pageSize ? Math.max(1, Math.ceil(sortedData.length / pageSize)) : 1;
  const safePageSize = pageSize ?? sortedData.length;
  const paginatedData = sortedData.slice((page - 1) * safePageSize, page * safePageSize);

  const handleSearch = (v: string) => { setSearchQ(v); setPage(1); };

  const handleSortClick = (col: DataGridColumn<T>) => {
    if (!col.sortable) return;
    const newDir: "asc" | "desc" = sortKey === col.key && sortDir === "asc" ? "desc" : "asc";
    setSortKey(col.key);
    setSortDir(newDir);
    setPage(1);
    onSortChange?.(col.key, newDir);
  };

  return (
    <div className={cn("w-full font-sans flex flex-col", className)}>

      {/* ── Toolbar ────────────────────────────────────────────────────────── */}
      {searchable && (
        <div style={{
          display: "flex", alignItems: "center", gap: 12,
          padding: "10px 16px",
          backgroundColor: "#ffffff",
          borderBottom: `2px solid ${TEAL}`,
        }}>
          <div style={{ position: "relative", width: 280, flexShrink: 0 }}>
            <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder={searchPlaceholder ?? "Search…"}
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%", height: 32, paddingLeft: 34, paddingRight: searchQ ? 28 : 8,
                fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1E293B",
                backgroundColor: "transparent", border: "none",
                borderBottom: "2px solid #E2E8F0", borderRadius: 0, outline: "none",
                transition: "border-bottom-color 200ms ease",
              }}
              onFocus={(e) => { e.target.style.borderBottomColor = TEAL; }}
              onBlur={(e) => { e.target.style.borderBottomColor = "#E2E8F0"; }}
            />
            {searchQ && (
              <button
                onClick={() => handleSearch("")}
                style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>
          {selectable && selectedIds.size > 0 && (
            <span style={{ fontSize: 11, color: TEAL, fontWeight: 600, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
              {selectedIds.size} selected
            </span>
          )}
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
            {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
          </span>
        </div>
      )}

      {/* ── Column headers ──────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: colTemplate, alignItems: "center", height: 44,
        backgroundColor: HDR_BG, borderBottom: `1px solid ${BORDER_CLR}`,
      }}>
        {allColumns.map((col) => {
          const isSortActive = sortKey === col.key;
          return (
            <div
              key={col.key}
              onClick={() => handleSortClick(col)}
              style={{
                padding: "0 8px", fontSize: 11, fontWeight: 700,
                fontFamily: "Inter, sans-serif", color: isSortActive ? TEAL : HDR_TEXT,
                textTransform: "uppercase", letterSpacing: "0.05em",
                display: "flex", alignItems: "center", gap: 4,
                justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
                overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
                cursor: col.sortable ? "pointer" : "default",
                userSelect: "none",
              }}
            >
              {col.headerContent ?? col.header}
              {col.sortable && <SortIcon active={isSortActive} dir={sortDir} />}
            </div>
          );
        })}
      </div>

      {/* ── Loading skeleton ────────────────────────────────────────────────── */}
      {loading ? (
        Array.from({ length: loadingRows }).map((_, rIdx) => (
          <div
            key={rIdx}
            style={{
              display: "grid", gridTemplateColumns: colTemplate,
              alignItems: "center", minHeight: rowH,
              backgroundColor: rIdx % 2 === 0 ? ROW_EVEN : ROW_ODD,
              borderBottom: `1px solid ${DIVIDER_CLR}`,
            }}
          >
            {allColumns.map((col, cIdx) => (
              <div key={col.key} style={{ padding: "0 8px" }}>
                <div
                  className="skeleton"
                  style={{
                    height: 11, borderRadius: 3,
                    width: `${SKW[(rIdx * allColumns.length + cIdx) % SKW.length]}%`,
                  }}
                />
              </div>
            ))}
          </div>
        ))
      ) : paginatedData.length === 0 ? (
        /* ── Empty state ──────────────────────────────────────────────────── */
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 16px", fontSize: 12, color: "#94A3B8", fontFamily: "Inter, sans-serif",
        }}>
          {emptyState ?? (searchQ ? (
            <span>
              No results for <strong>"{searchQ}"</strong>.{" "}
              <button
                onClick={() => handleSearch("")}
                style={{ color: TEAL, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}
              >
                Clear search
              </button>
            </span>
          ) : "No data")}
        </div>
      ) : (
        /* ── Rows ─────────────────────────────────────────────────────────── */
        paginatedData.map((row, idx) => {
          const rid      = resolveId(row);
          const isHov    = hoveredId === rid;
          const isSel    = selectedIds.has(rid);
          const isActiveRow = selectedRowId !== undefined && selectedRowId === rid;
          const isExp    = expandable && expandedIds.has(rid);
          const rowBg    = isActiveRow ? ROW_SEL : isSel ? ROW_SEL : isHov ? ROW_HOVER : idx % 2 === 1 ? ROW_ODD : ROW_EVEN;

          return (
            <div key={rid}>
              <div
                onMouseEnter={() => setHoveredId(rid)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onRowClick?.(row)}
                style={{
                  display: "grid", gridTemplateColumns: colTemplate,
                  alignItems: "center", minHeight: rowH,
                  position: "relative", backgroundColor: rowBg,
                  borderBottom: isExp ? "none" : `1px solid ${DIVIDER_CLR}`,
                  cursor: onRowClick ? "pointer" : "default",
                  transition: "background-color 100ms ease",
                  outline: (isSel || isActiveRow) ? `1px solid ${TEAL}33` : undefined,
                }}
              >
                {/* 2px teal left strip */}
                <div style={{
                  position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                  backgroundColor: TEAL,
                  opacity: isHov || isSel || isExp || isActiveRow ? 1 : 0,
                  transition: "opacity 100ms ease",
                }} />

                {/* Issue 2.2 + 3.3: right-edge chevron — non-color active-row indicator */}
                {isActiveRow && (
                  <div style={{
                    position: "absolute", right: 8, top: "50%",
                    transform: "translateY(-50%)", pointerEvents: "none",
                  }}>
                    <ChevronRight style={{ width: 13, height: 13, color: TEAL, opacity: 0.7 }} />
                  </div>
                )}

                {allColumns.map((col) => (
                  <div
                    key={col.key}
                    style={{
                      padding: "0 8px", textAlign: col.align ?? "left",
                      overflow: "hidden", minWidth: 0,
                      display: "flex", alignItems: "center",
                      justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
                    }}
                  >
                    {col.render(row, isHov)}
                  </div>
                ))}
              </div>

              {/* Expanded content */}
              {isExp && renderExpandedRow && (
                <div style={{
                  borderLeft: `3px solid ${TEAL}`,
                  borderBottom: `1px solid ${DIVIDER_CLR}`,
                  backgroundColor: ROW_ODD,
                }}>
                  {renderExpandedRow(row)}
                </div>
              )}
            </div>
          );
        })
      )}

      {/* ── Pagination ──────────────────────────────────────────────────────── */}
      {pageSize && totalPages > 1 && !loading && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderTop: `1px solid ${BORDER_CLR}`,
          backgroundColor: HDR_BG,
        }}>
          <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PagBtn onClick={() => setPage(1)} disabled={page === 1} title="First"><ChevronsLeft style={{ width: 12, height: 12 }} /></PagBtn>
            <PagBtn onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1} title="Previous"><ChevronLeft style={{ width: 12, height: 12 }} /></PagBtn>
            {pagWindow(page, totalPages).map((n) => (
              <PagBtn key={n} onClick={() => setPage(n)} active={n === page}>{n}</PagBtn>
            ))}
            <PagBtn onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Next"><ChevronRight style={{ width: 12, height: 12 }} /></PagBtn>
            <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Last"><ChevronsRight style={{ width: 12, height: 12 }} /></PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PagBtn ───────────────────────────────────────────────────────────────────

const PagBtn = ({
  children, onClick, disabled, active, title,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  title?: string;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    onMouseEnter={(e) => { if (!active && !disabled) { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#1E293B"; } }}
    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
    style={{
      minWidth: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
      border: active ? `1px solid ${TEAL}` : "1px solid transparent",
      borderRadius: 4, cursor: disabled ? "default" : "pointer",
      background: active ? `${TEAL}0D` : "transparent",
      color: active ? TEAL : disabled ? "#CBD5E1" : "#64748B",
      fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: "Inter, sans-serif",
      transition: "all 100ms ease", padding: "0 4px",
    }}
  >
    {children}
  </button>
);

export default DataGrid;
