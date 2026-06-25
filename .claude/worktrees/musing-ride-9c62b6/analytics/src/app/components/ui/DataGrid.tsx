import { useState } from "react";
import { cn } from "@/app/lib/utils";

// ─── DataGrid ─────────────────────────────────────────────────────────────────
//
// Master unified table component for Matrice AI Analytics.
// Replaces all ad-hoc table styles across the platform.
//
// Design pillars
//  • Ghost Header    — rgba(241,245,249,0.5) + blur(4px), Inter Bold 11px all-caps
//  • Precision Rows  — 44px height (36px compact), 8px cell padding grid tokens
//  • Hover High-Tech — rgba(0,119,91,0.04) bg + 3px teal left bar + ID weight bump
//  • Dividers        — 1px solid #F1F5F9 horizontal only (no vertical rules)
//  • Typography      — JetBrains Mono for IDs / numbers / timestamps; Inter for names
//  • Actions         — glassmorphic container, opacity 0→1 on row hover

export interface DataGridColumn<T = Record<string, unknown>> {
  /** Unique key, used for React reconciliation */
  key: string;
  /** Column header label (rendered all-caps by the component) */
  header: string;
  /**
   * Optional custom header cell content.
   * When provided, replaces the text label entirely (e.g. for a select-all checkbox).
   */
  headerContent?: React.ReactNode;
  /**
   * CSS grid column sizing value.
   * e.g. "120px" | "1fr" | "minmax(80px,1fr)" | "48px"
   */
  width?: string;
  align?: "left" | "center" | "right";
  /**
   * Cell renderer.
   * @param row       The full row data object
   * @param hovered   Whether this row is currently hovered
   */
  render: (row: T, hovered: boolean) => React.ReactNode;
}

export interface DataGridProps<T extends { id: string | number }> {
  columns: DataGridColumn<T>[];
  data: T[];
  /** Called when any non-action cell is clicked */
  onRowClick?: (row: T) => void;
  /** 36px rows instead of 44px */
  compact?: boolean;
  /** Extra class applied to the outer wrapper */
  className?: string;
  /** Rendered when data is empty */
  emptyState?: React.ReactNode;
  /** Optionally override row id resolution */
  getRowId?: (row: T) => string | number;
}

// ─── Shared action button atom ────────────────────────────────────────────────
export const GridActionButton = ({
  children,
  hoverColor = "#00775B",
  hoverBg,
  title,
  onClick,
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
      const el = e.currentTarget;
      el.style.color = hoverColor;
      el.style.backgroundColor = hoverBg ?? `${hoverColor}14`;
    }}
    onMouseLeave={(e) => {
      const el = e.currentTarget;
      el.style.color = "#94A3B8";
      el.style.backgroundColor = "transparent";
    }}
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: 26,
      height: 26,
      borderRadius: 3,
      border: "none",
      background: "transparent",
      cursor: "pointer",
      color: "#94A3B8",
      transition: "color 120ms ease, background-color 120ms ease",
      flexShrink: 0,
    }}
  >
    {children}
  </button>
);

// ─── Glassmorphic action container ────────────────────────────────────────────
export const GridActions = ({
  visible,
  children,
}: {
  visible: boolean;
  children: React.ReactNode;
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      gap: 2,
      padding: "3px 6px",
      backgroundColor: "rgba(255,255,255,0.92)",
      backdropFilter: "blur(12px)",
      WebkitBackdropFilter: "blur(12px)",
      border: "1px solid rgba(0,0,0,0.06)",
      borderRadius: 4,
      boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
      opacity: visible ? 1 : 0,
      transition: "opacity 150ms ease",
    }}
  >
    {children}
  </div>
);

// ─── StatusCapsule (10% opacity fill, shared KPI palette) ────────────────────
const STATUS_CFG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical:  { label: "Critical",  color: "#E7000B", bg: "rgba(231,0,11,0.08)",    border: "rgba(231,0,11,0.2)" },
  high:      { label: "High",      color: "#EA580C", bg: "rgba(234,88,12,0.08)",   border: "rgba(234,88,12,0.2)" },
  warning:   { label: "Warning",   color: "#EA580C", bg: "rgba(234,88,12,0.08)",   border: "rgba(234,88,12,0.2)" },
  medium:    { label: "Medium",    color: "#E19A04", bg: "rgba(225,154,4,0.08)",   border: "rgba(225,154,4,0.2)" },
  low:       { label: "Low",       color: "#2B7FFF", bg: "rgba(43,127,255,0.08)",  border: "rgba(43,127,255,0.2)" },
  info:      { label: "Info",      color: "#2B7FFF", bg: "rgba(43,127,255,0.08)",  border: "rgba(43,127,255,0.2)" },
  stable:    { label: "Stable",    color: "#00A63E", bg: "rgba(0,166,62,0.08)",    border: "rgba(0,166,62,0.2)" },
  success:   { label: "Success",   color: "#00A63E", bg: "rgba(0,166,62,0.08)",    border: "rgba(0,166,62,0.2)" },
  resolved:  { label: "Resolved",  color: "#00A63E", bg: "rgba(0,166,62,0.08)",    border: "rgba(0,166,62,0.2)" },
  active:    { label: "Active",    color: "#00A63E", bg: "rgba(0,166,62,0.08)",    border: "rgba(0,166,62,0.2)" },
  flagged:   { label: "Flagged",   color: "#E7000B", bg: "rgba(231,0,11,0.08)",    border: "rgba(231,0,11,0.2)" },
  unknown:   { label: "Unknown",   color: "#64748B", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
  pending:   { label: "Pending",   color: "#E19A04", bg: "rgba(225,154,4,0.08)",   border: "rgba(225,154,4,0.2)" },
  offline:   { label: "Offline",   color: "#64748B", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
};

export const StatusCapsule = ({
  status,
  label: overrideLabel,
}: {
  status: string;
  label?: string;
}) => {
  const key = status.toLowerCase();
  const cfg = STATUS_CFG[key] ?? {
    label: status,
    color: "#64748B",
    bg: "rgba(100,116,139,0.08)",
    border: "rgba(100,116,139,0.2)",
  };
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "2px 8px",
        borderRadius: 100,
        fontSize: 10,
        fontWeight: 700,
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        color: cfg.color,
        backgroundColor: cfg.bg,
        border: `1px solid ${cfg.border}`,
        whiteSpace: "nowrap",
        lineHeight: 1.6,
      }}
    >
      {overrideLabel ?? cfg.label}
    </span>
  );
};

// ─── MonoCell — JetBrains Mono cell renderer helper ──────────────────────────
export const MonoCell = ({
  children,
  hovered,
  isPrimary,
  color = "#475569",
  hoveredColor = "#0F172A",
  fontSize = 11,
}: {
  children: React.ReactNode;
  hovered: boolean;
  isPrimary?: boolean;
  color?: string;
  hoveredColor?: string;
  fontSize?: number;
}) => (
  <span
    style={{
      fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
      fontSize,
      fontWeight: hovered && isPrimary ? 600 : 500,
      color: hovered ? hoveredColor : color,
      letterSpacing: "0.01em",
      transition: "font-weight 120ms ease, color 120ms ease",
    }}
  >
    {children}
  </span>
);

// ─── InterCell — regular Inter text cell ─────────────────────────────────────
export const InterCell = ({
  children,
  hovered,
  isPrimary,
  color = "#475569",
  hoveredColor = "#0F172A",
  fontSize = 12,
  className,
}: {
  children: React.ReactNode;
  hovered: boolean;
  isPrimary?: boolean;
  color?: string;
  hoveredColor?: string;
  fontSize?: number;
  className?: string;
}) => (
  <span
    className={className}
    style={{
      fontFamily: "Inter, sans-serif",
      fontSize,
      fontWeight: hovered && isPrimary ? 500 : 400,
      color: hovered ? hoveredColor : color,
      transition: "color 120ms ease",
    }}
  >
    {children}
  </span>
);

// ─── DataGrid ─────────────────────────────────────────────────────────────────
export function DataGrid<T extends { id: string | number }>({
  columns,
  data,
  onRowClick,
  compact = false,
  className,
  emptyState,
  getRowId,
}: DataGridProps<T>) {
  const [hoveredId, setHoveredId] = useState<string | number | null>(null);

  const rowH = compact ? 36 : 44;
  const colTemplate = columns.map((c) => c.width ?? "1fr").join(" ");
  const resolveId = (row: T) => (getRowId ? getRowId(row) : row.id);

  return (
    <div className={cn("w-full font-sans", className)}>

      {/* ── Ghost Header ─────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: colTemplate,
          alignItems: "center",
          height: 36,
          backgroundColor: "rgba(241, 245, 249, 0.5)",
          backdropFilter: "blur(4px)",
          WebkitBackdropFilter: "blur(4px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        {columns.map((col) => (
          <div
            key={col.key}
            style={{
              padding: "0 8px",
              fontSize: 11,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              color: "#94A3B8",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              textAlign: col.align ?? "left",
              overflow: "hidden",
              whiteSpace: "nowrap",
              textOverflow: "ellipsis",
              display: "flex",
              alignItems: "center",
              justifyContent: col.align === "center" ? "center" : col.align === "right" ? "flex-end" : "flex-start",
            }}
          >
            {col.headerContent ?? col.header}
          </div>
        ))}
      </div>

      {/* ── Rows ─────────────────────────────────────────────────────────── */}
      {data.length === 0 && emptyState ? (
        <div className="flex items-center justify-center py-12 text-[12px] text-neutral-400">
          {emptyState}
        </div>
      ) : (
        data.map((row) => {
          const rid = resolveId(row);
          const isHovered = hoveredId === rid;

          return (
            <div
              key={rid}
              onMouseEnter={() => setHoveredId(rid)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onRowClick?.(row)}
              style={{
                display: "grid",
                gridTemplateColumns: colTemplate,
                alignItems: "center",
                minHeight: rowH,
                position: "relative",
                backgroundColor: isHovered ? "rgba(0, 119, 91, 0.04)" : "#ffffff",
                borderBottom: "1px solid #F1F5F9",
                cursor: onRowClick ? "pointer" : "default",
                transition: "background-color 120ms ease",
              }}
            >
              {/* 3px teal selection bar */}
              <div
                style={{
                  position: "absolute",
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: 3,
                  backgroundColor: "#00775B",
                  opacity: isHovered ? 1 : 0,
                  transition: "opacity 120ms ease",
                  borderRadius: "0 1px 1px 0",
                }}
              />

              {columns.map((col) => (
                <div
                  key={col.key}
                  style={{
                    padding: "0 8px",
                    textAlign: col.align ?? "left",
                    overflow: "hidden",
                    minWidth: 0,
                  }}
                >
                  {col.render(row, isHovered)}
                </div>
              ))}
            </div>
          );
        })
      )}
    </div>
  );
}

export default DataGrid;
