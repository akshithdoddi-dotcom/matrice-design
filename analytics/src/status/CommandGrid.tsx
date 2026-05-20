// CommandGrid — v2.3 visual pattern (Command Grid) adapted for the Microservices status page.
// Matches the v2.3 design system table: teal underline toolbar, underline-style filter/sort
// buttons, alternating opaque rows, hover state, sliding-window pagination.

import { useState } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, X, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

const TEAL = "#00775B";
const SEC  = "#64748B";

// ── Sliding window pagination (5 pages max visible) ──────────────────────────
function pagWindow(page: number, total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  let start = Math.max(1, page - 2);
  const end  = Math.min(total, start + 4);
  if (end - start < 4) start = Math.max(1, end - 4);
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

// ── Column definition ─────────────────────────────────────────────────────────
export interface CGColumn<T> {
  key: string;
  label: string;
  minWidth: number;
  render: (row: T, hovered: boolean) => React.ReactNode;
  sortValue?: (row: T) => string | number;
}

// ── Sort option ───────────────────────────────────────────────────────────────
export interface CGSortOption {
  key: string;
  label: string;
  short: string;
}

// ── Props ─────────────────────────────────────────────────────────────────────
export interface CommandGridProps<T extends { id: string | number }> {
  columns: CGColumn<T>[];
  data: T[];
  rowsPerPage?: number;
  searchPlaceholder?: string;
  searchFilter?: (row: T, q: string) => boolean;
  sortOptions?: CGSortOption[];
  defaultSort?: string;
  applySort?: (data: T[], sortKey: string) => T[];
  renderExpand?: (row: T) => React.ReactNode;
  emptyMessage?: string;
  toolbarExtras?: React.ReactNode;
}

export function CommandGrid<T extends { id: string | number }>({
  columns,
  data,
  rowsPerPage = 10,
  searchPlaceholder = "Search…",
  searchFilter,
  sortOptions,
  defaultSort,
  applySort,
  renderExpand,
  emptyMessage = "No records found.",
  toolbarExtras,
}: CommandGridProps<T>) {
  const [query,      setQuery]      = useState("");
  const [sortKey,    setSortKey]    = useState(defaultSort ?? "");
  const [sortOpen,   setSortOpen]   = useState(false);
  const [page,       setPage]       = useState(1);
  const [hoveredId,  setHoveredId]  = useState<string | number | null>(null);
  const [expandedId, setExpandedId] = useState<string | number | null>(null);

  const currentSort = sortOptions?.find(o => o.key === sortKey);
  const sortDefault = !sortKey || sortKey === (defaultSort ?? "");

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = data.filter(row => {
    if (!query || !searchFilter) return true;
    return searchFilter(row, query);
  });

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sorted = (applySort && sortKey) ? applySort([...filtered], sortKey) : filtered;

  // ── Paginate ────────────────────────────────────────────────────────────────
  const total   = Math.ceil(sorted.length / rowsPerPage);
  const paged   = sorted.slice((page - 1) * rowsPerPage, page * rowsPerPage);
  const window  = pagWindow(page, total);

  const goPage = (p: number) => setPage(Math.max(1, Math.min(total, p)));

  // ── Column widths ────────────────────────────────────────────────────────────
  const gridTemplate = columns.map(c => `${c.minWidth}px`).join(" ");

  // ── Row background (pre-blended, opaque so sticky col never bleeds) ──────────
  const rowBg = (idx: number, hovered: boolean): React.CSSProperties["backgroundColor"] => {
    if (hovered) return "#EBF5F1";
    if (idx % 2 === 1) return "#F8FDFC";
    return "#ffffff";
  };

  // ── Shared styles ────────────────────────────────────────────────────────────
  const btnBase: React.CSSProperties = {
    background: "transparent", border: "none", borderBottom: "2px solid transparent",
    borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    color: SEC, padding: "4px 2px",
    transition: "color 150ms ease, border-bottom-color 150ms ease", whiteSpace: "nowrap",
  };
  const activeBtnBase: React.CSSProperties = { ...btnBase, color: TEAL, borderBottomColor: TEAL };

  return (
    <div style={{ borderRadius: 4, border: "1px solid #E2E8F0", overflow: "hidden", background: "#fff" }}>

      {/* ── Toolbar ─────────────────────────────────────────────────────────── */}
      <div style={{
        display: "flex", alignItems: "flex-end", gap: 12, padding: "10px 16px",
        backgroundColor: "#fff",
        borderBottom: `2px solid ${TEAL}`,
      }}>
        {/* Search */}
        <div style={{ position: "relative", width: 240, flexShrink: 0 }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={query}
            onChange={e => { setQuery(e.target.value); setPage(1); }}
            style={{
              width: "100%", height: 30, paddingLeft: 32, paddingRight: query ? 28 : 4,
              fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1E293B",
              backgroundColor: "transparent", border: "none",
              borderBottom: "2px solid #E2E8F0", borderRadius: 0, outline: "none",
              transition: "border-bottom-color 200ms ease",
            }}
            onFocus={e  => { e.target.style.borderBottomColor = TEAL; }}
            onBlur={e   => { e.target.style.borderBottomColor = "#E2E8F0"; }}
          />
          {query && (
            <button onClick={() => { setQuery(""); setPage(1); }}
              style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>

        {/* Sort */}
        {sortOptions && sortOptions.length > 0 && (
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setSortOpen(o => !o)}
              style={!sortDefault ? activeBtnBase : btnBase}
            >
              <SlidersHorizontal style={{ width: 12, height: 12 }} />
              {sortDefault ? "Sort" : (currentSort?.short ?? "Sort")}
            </button>
            {sortOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} />
                <div style={{
                  position: "absolute", zIndex: 50, top: "calc(100% + 8px)", left: 0,
                  backgroundColor: "#fff", border: "1px solid #E2E8F0",
                  borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
                  overflow: "hidden", minWidth: 200,
                }}>
                  {sortOptions.map(opt => {
                    const active = sortKey === opt.key;
                    return (
                      <div
                        key={opt.key}
                        onClick={() => { setSortKey(opt.key); setSortOpen(false); setPage(1); }}
                        style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
                          cursor: "pointer",
                          backgroundColor: active ? "rgba(0,119,91,0.05)" : "transparent",
                          fontSize: 12, fontWeight: active ? 600 : 500,
                          fontFamily: "Inter, sans-serif",
                          color: active ? TEAL : "#334155",
                          transition: "background-color 100ms ease",
                        }}
                        onMouseEnter={e => { if (!active) (e.currentTarget as HTMLElement).style.backgroundColor = "#F8FAFC"; }}
                        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = active ? "rgba(0,119,91,0.05)" : "transparent"; }}
                      >
                        {opt.label}
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        )}

        {/* Extra toolbar controls */}
        {toolbarExtras && (
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
            {toolbarExtras}
          </div>
        )}

        {/* Row count */}
        <div style={{ marginLeft: toolbarExtras ? 12 : "auto", fontSize: 11, fontFamily: "Inter, sans-serif", color: "#94A3B8", whiteSpace: "nowrap" }}>
          {sorted.length} rows{query ? ` (filtered from ${data.length})` : ""}
        </div>
      </div>

      {/* ── Column headers ───────────────────────────────────────────────────── */}
      <div style={{
        display: "grid", gridTemplateColumns: gridTemplate, gap: 12,
        padding: "8px 20px",
        backgroundColor: "#F8FAFC",
        borderBottom: "1px solid #E2E8F0",
      }}>
        {columns.map(col => (
          <span key={col.key} style={{
            fontSize: 10, fontWeight: 700, textTransform: "uppercase",
            letterSpacing: "0.07em", color: SEC, fontFamily: "Inter, sans-serif",
            whiteSpace: "nowrap",
          }}>
            {col.label}
          </span>
        ))}
        {renderExpand && <span style={{ width: 28 }} />}
      </div>

      {/* ── Rows ─────────────────────────────────────────────────────────────── */}
      {paged.length === 0 ? (
        <div style={{ padding: "32px 20px", textAlign: "center", fontSize: 13, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
          {emptyMessage}
        </div>
      ) : (
        paged.map((row, idx) => {
          const isHovered  = hoveredId === row.id;
          const isExpanded = expandedId === row.id;
          return (
            <div key={row.id}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: renderExpand ? `${gridTemplate} 28px` : gridTemplate,
                  gap: 12,
                  padding: "10px 20px",
                  backgroundColor: rowBg(idx, isHovered),
                  borderBottom: idx < paged.length - 1 || isExpanded ? "1px solid #F1F5F9" : "none",
                  alignItems: "center",
                  cursor: renderExpand ? "pointer" : "default",
                  transition: "background-color 100ms ease",
                }}
                onMouseEnter={() => setHoveredId(row.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={renderExpand ? () => setExpandedId(isExpanded ? null : row.id) : undefined}
              >
                {columns.map(col => (
                  <div key={col.key} style={{ minWidth: 0, overflow: "hidden" }}>
                    {col.render(row, isHovered)}
                  </div>
                ))}
                {renderExpand && (
                  <ChevronDown
                    style={{
                      width: 14, height: 14,
                      color: "#CBD5E1",
                      transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                      transition: "transform 200ms ease",
                      flexShrink: 0,
                    }}
                  />
                )}
              </div>

              {/* Accordion expand */}
              {renderExpand && (
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: "hidden" }}
                    >
                      <div style={{ backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0" }}>
                        {renderExpand(row)}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              )}
            </div>
          );
        })
      )}

      {/* ── Pagination ───────────────────────────────────────────────────────── */}
      {total > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
          padding: "8px 16px",
          borderTop: "1px solid #F1F5F9",
          backgroundColor: "#fff",
        }}>
          {/* First */}
          <PagBtn onClick={() => goPage(1)} disabled={page === 1} icon={<ChevronsLeft style={{ width: 13, height: 13 }} />} />
          {/* Prev */}
          <PagBtn onClick={() => goPage(page - 1)} disabled={page === 1} icon={<ChevronLeft style={{ width: 13, height: 13 }} />} />

          {/* Window */}
          {window[0] > 1 && <PagEllipsis />}
          {window.map(p => (
            <button key={p} onClick={() => goPage(p)}
              style={{
                minWidth: 28, height: 28, borderRadius: 4, fontSize: 12,
                fontFamily: "'JetBrains Mono', monospace", fontWeight: p === page ? 700 : 500,
                border: `1px solid ${p === page ? TEAL : "#E2E8F0"}`,
                backgroundColor: p === page ? TEAL : "transparent",
                color: p === page ? "#fff" : SEC,
                cursor: "pointer", transition: "all 120ms ease", padding: "0 6px",
              }}
            >
              {p}
            </button>
          ))}
          {window[window.length - 1] < total && <PagEllipsis />}

          {/* Next */}
          <PagBtn onClick={() => goPage(page + 1)} disabled={page === total} icon={<ChevronRight style={{ width: 13, height: 13 }} />} />
          {/* Last */}
          <PagBtn onClick={() => goPage(total)} disabled={page === total} icon={<ChevronsRight style={{ width: 13, height: 13 }} />} />
        </div>
      )}
    </div>
  );
}

const PagBtn = ({ onClick, disabled, icon }: { onClick: () => void; disabled: boolean; icon: React.ReactNode }) => (
  <button onClick={onClick} disabled={disabled}
    style={{
      width: 28, height: 28, borderRadius: 4, border: "1px solid #E2E8F0",
      backgroundColor: "transparent", cursor: disabled ? "not-allowed" : "pointer",
      display: "flex", alignItems: "center", justifyContent: "center",
      color: disabled ? "#CBD5E1" : SEC, transition: "all 120ms ease",
    }}>
    {icon}
  </button>
);

const PagEllipsis = () => (
  <span style={{ fontSize: 12, color: "#CBD5E1", fontFamily: "monospace", padding: "0 2px" }}>…</span>
);
