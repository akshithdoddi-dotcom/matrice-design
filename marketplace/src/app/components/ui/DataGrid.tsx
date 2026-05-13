import { useState, useMemo } from "react";
import { Search, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from "lucide-react";
import { cn } from "@/app/lib/utils";

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
}

export interface DataGridProps<T extends { id: string | number }> {
  columns: DataGridColumn<T>[];
  data: T[];
  onRowClick?: (row: T) => void;
  compact?: boolean;
  className?: string;
  emptyState?: React.ReactNode;
  getRowId?: (row: T) => string | number;
  searchable?: boolean;
  searchPlaceholder?: string;
  pageSize?: number;
}

// ─── Palette ──────────────────────────────────────────────────────────────────

const TEAL = "#00775B";
const HDR_BG = "#F8FAFC";
const HDR_TEXT = "#1E293B";
const ROW_HOVER = "#EBF5F1";        // rgba(0,119,91,0.07) on white
const ROW_ODD = "#F8FDFC";          // rgba(0,119,91,0.018) on white
const ROW_EVEN = "#ffffff";
const BORDER_CLR = "#E2E8F0";
const DIVIDER_CLR = "#F1F5F9";

// ─── Smart sliding-window pagination ─────────────────────────────────────────

function pagWindow(page: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, page - 2);
  const end = Math.min(total, start + 4);
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

// ─── StatusCapsule — v2.3 solid pill style ───────────────────────────────────

const STATUS_CFG: Record<string, { label: string; bg: string }> = {
  // Severity
  critical:  { label: "Critical",  bg: "#E7000B" },
  high:      { label: "High",      bg: "#EA580C" },
  warning:   { label: "Warning",   bg: "#EA580C" },
  medium:    { label: "Medium",    bg: "#E19A04" },
  low:       { label: "Low",       bg: "#2B7FFF" },
  info:      { label: "Info",      bg: "#2B7FFF" },
  // Success / green
  stable:    { label: "Stable",    bg: "#00A63E" },
  success:   { label: "Success",   bg: "#00A63E" },
  resolved:  { label: "Resolved",  bg: "#475569" },
  active:    { label: "Active",    bg: "#00A63E" },
  running:   { label: "Running",   bg: "#00A63E" },
  complete:  { label: "Complete",  bg: "#00A63E" },
  deployed:  { label: "Deployed",  bg: "#00A63E" },
  available: { label: "Available", bg: "#00A63E" },
  // Blue / in-progress
  training:  { label: "Training",  bg: "#0284C7" },
  "in-use":  { label: "In Use",    bg: "#0284C7" },
  // Amber / pending
  pending:   { label: "Pending",   bg: "#E19A04" },
  queued:    { label: "Queued",    bg: "#E19A04" },
  paused:    { label: "Paused",    bg: "#E19A04" },
  // Red
  failed:    { label: "Failed",    bg: "#E7000B" },
  flagged:   { label: "Flagged",   bg: "#E7000B" },
  // Neutral
  draft:     { label: "Draft",     bg: "#94A3B8" },
  unknown:   { label: "Unknown",   bg: "#94A3B8" },
  offline:   { label: "Offline",   bg: "#94A3B8" },
};

export const StatusCapsule = ({ status, label: overrideLabel }: { status: string; label?: string }) => {
  const key = status.toLowerCase();
  const cfg = STATUS_CFG[key] ?? { label: status, bg: "#94A3B8" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
      textTransform: "uppercase", color: "#ffffff",
      backgroundColor: cfg.bg,
      fontFamily: "'JetBrains Mono','Fira Code',monospace",
      whiteSpace: "nowrap",
    }}>
      {overrideLabel ?? cfg.label}
    </span>
  );
};

// ─── MonoCell ─────────────────────────────────────────────────────────────────

export const MonoCell = ({
  children, hovered, isPrimary, color = "#475569", hoveredColor = "#0F172A", fontSize = 12,
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
    letterSpacing: "0.01em", transition: "color 100ms ease, font-weight 100ms ease",
  }}>
    {children}
  </span>
);

// ─── InterCell ────────────────────────────────────────────────────────────────

export const InterCell = ({
  children, hovered, isPrimary, color = "#334155", hoveredColor = "#0F172A", fontSize = 12, className,
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

// ─── DataGrid ─────────────────────────────────────────────────────────────────

export function DataGrid<T extends { id: string | number }>({
  columns, data, onRowClick, compact = false, className,
  emptyState, getRowId, searchable, searchPlaceholder, pageSize,
}: DataGridProps<T>) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);
  const [searchQ, setSearchQ] = useState("");
  const [page, setPage] = useState(1);

  const rowH = compact ? 36 : 44;
  const colTemplate = columns.map((c) => c.width ?? "1fr").join(" ");
  const resolveId = (row: T) => (getRowId ? getRowId(row) : row.id);

  // ── Search filtering ──────────────────────────────────────────────────────
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

  // ── Pagination ────────────────────────────────────────────────────────────
  const totalPages = pageSize ? Math.max(1, Math.ceil(filteredData.length / pageSize)) : 1;
  const safePageSize = pageSize ?? filteredData.length;
  const paginatedData = filteredData.slice((page - 1) * safePageSize, page * safePageSize);

  const handleSearch = (v: string) => { setSearchQ(v); setPage(1); };

  return (
    <div className={cn("w-full font-sans flex flex-col", className)}>

      {/* ── Toolbar (search) — shown when searchable ─────────────────────── */}
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
              <button onClick={() => handleSearch("")}
                style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif", whiteSpace: "nowrap" }}>
            {filteredData.length} {filteredData.length === 1 ? "result" : "results"}
          </span>
        </div>
      )}

      {/* ── Column headers ────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: colTemplate, alignItems: "center", height: 44,
        backgroundColor: HDR_BG, borderBottom: `1px solid ${BORDER_CLR}`,
      }}>
        {columns.map((col) => (
          <div key={col.key} style={{
            padding: "0 8px", fontSize: 12, fontWeight: 700,
            fontFamily: "Inter, sans-serif", color: HDR_TEXT,
            textTransform: "uppercase", letterSpacing: "0.05em",
            display: "flex", alignItems: "center",
            justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
            overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis",
          }}>
            {col.headerContent ?? col.header}
          </div>
        ))}
      </div>

      {/* ── Rows ──────────────────────────────────────────────────────────── */}
      {paginatedData.length === 0 ? (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center",
          padding: "32px 16px", fontSize: 12, color: "#94A3B8", fontFamily: "Inter, sans-serif",
        }}>
          {emptyState ?? (searchQ ? (
            <span>No results for <strong>"{searchQ}"</strong>. <button onClick={() => handleSearch("")} style={{ color: TEAL, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>Clear search</button></span>
          ) : "No data")}
        </div>
      ) : (
        paginatedData.map((row, idx) => {
          const rid = resolveId(row);
          const isHovered = hoveredId === rid;
          const rowBg = isHovered ? ROW_HOVER : idx % 2 === 1 ? ROW_ODD : ROW_EVEN;

          return (
            <div
              key={rid}
              onMouseEnter={() => setHoveredId(rid)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onRowClick?.(row)}
              style={{
                display: "grid", gridTemplateColumns: colTemplate, alignItems: "center",
                minHeight: rowH, position: "relative", backgroundColor: rowBg,
                borderBottom: `1px solid ${DIVIDER_CLR}`,
                cursor: onRowClick ? "pointer" : "default",
                transition: "background-color 100ms ease",
              }}
            >
              {/* 2px teal left strip on hover */}
              <div style={{
                position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
                backgroundColor: TEAL,
                opacity: isHovered ? 1 : 0,
                transition: "opacity 100ms ease",
              }} />

              {columns.map((col) => (
                <div key={col.key} style={{
                  padding: "0 8px", textAlign: col.align ?? "left",
                  overflow: "hidden", minWidth: 0,
                  display: "flex", alignItems: "center",
                  justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
                }}>
                  {col.render(row, isHovered)}
                </div>
              ))}
            </div>
          );
        })
      )}

      {/* ── Pagination ────────────────────────────────────────────────────── */}
      {pageSize && totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "10px 16px", borderTop: `1px solid ${BORDER_CLR}`,
          backgroundColor: HDR_BG,
        }}>
          <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
            {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filteredData.length)} of {filteredData.length}
          </span>
          <div style={{ display: "flex", alignItems: "center", gap: 2 }}>
            <PagBtn onClick={() => setPage(1)}    disabled={page === 1}          title="First"><ChevronsLeft  style={{ width: 12, height: 12 }} /></PagBtn>
            <PagBtn onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} title="Previous"><ChevronLeft style={{ width: 12, height: 12 }} /></PagBtn>
            {pagWindow(page, totalPages).map((n) => (
              <PagBtn key={n} onClick={() => setPage(n)} active={n === page}>{n}</PagBtn>
            ))}
            <PagBtn onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} title="Next"><ChevronRight style={{ width: 12, height: 12 }} /></PagBtn>
            <PagBtn onClick={() => setPage(totalPages)} disabled={page === totalPages} title="Last"><ChevronsRight style={{ width: 12, height: 12 }} /></PagBtn>
          </div>
        </div>
      )}
    </div>
  );
}

const PagBtn = ({ children, onClick, disabled, active, title }: {
  children: React.ReactNode; onClick?: () => void;
  disabled?: boolean; active?: boolean; title?: string;
}) => (
  <button
    onClick={onClick} disabled={disabled} title={title}
    onMouseEnter={(e) => { if (!active && !disabled) { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#1E293B"; } }}
    onMouseLeave={(e) => { if (!active) { e.currentTarget.style.backgroundColor = "transparent"; e.currentTarget.style.color = "#64748B"; } }}
    style={{
      minWidth: 28, height: 28, display: "flex", alignItems: "center", justifyContent: "center",
      border: active ? `1px solid ${TEAL}` : "1px solid transparent",
      borderRadius: 4, cursor: disabled ? "default" : "pointer", background: active ? `${TEAL}0D` : "transparent",
      color: active ? TEAL : disabled ? "#CBD5E1" : "#64748B",
      fontSize: 11, fontWeight: active ? 700 : 500, fontFamily: "Inter, sans-serif",
      transition: "all 100ms ease", padding: "0 4px",
    }}
  >
    {children}
  </button>
);

export default DataGrid;
