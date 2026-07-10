import {
  ChevronRight, ChevronLeft, ChevronsLeft, ChevronsRight, SlidersHorizontal,
  Columns3, Filter, Search, X,
} from "lucide-react";

import * as React from "react";

// ─── V2.3 Table (sticky-ID, hover CTAs, accordion, sliding-window pagination) ──
// Shared engine behind the "Seamless HUD v2.3" table pattern: sticky first
// column, hover-revealed floating action buttons, chevron accordion rows,
// search + sort + column-visibility + multi-select filter toolbar, and a
// 5-page sliding-window pagination footer.

const V23_TEAL = "#00775B";
const V23_SEC = "#64748B";
const V23_HDR = "#F8FAFC";

function v23PagWindow(total: number, current: number): number[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const start = Math.max(1, current - 2);
  const end = Math.min(total, current + 2);
  const pages = new Set<number>([1, total]);
  for (let v = start; v <= end; v += 1) pages.add(v);
  return Array.from(pages).sort((a, b) => a - b);
}

const V23_BTN_BASE: React.CSSProperties = {
  background: "transparent", border: "none", borderBottom: "2px solid transparent",
  borderRadius: 0, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
  fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif", color: V23_SEC,
  padding: "4px 2px", transition: "color 150ms ease, border-bottom-color 150ms ease", whiteSpace: "nowrap",
};
const V23_DD_PANEL: React.CSSProperties = {
  position: "absolute", zIndex: 50, top: "calc(100% + 8px)", backgroundColor: "#fff",
  border: "1px solid #E2E8F0", borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
};
const v23DdItem = (active: boolean): React.CSSProperties => ({
  display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
  backgroundColor: active ? "rgba(0,119,91,0.05)" : "transparent",
  fontSize: 12, fontWeight: active ? 600 : 500, fontFamily: "Inter, sans-serif",
  color: active ? V23_TEAL : "#334155", transition: "background-color 100ms ease",
});

export function V23Mono({ children, hovered, color = "#64748B", weight = 500 }: { children: React.ReactNode; hovered: boolean; color?: string; weight?: number }) {
  return <span style={{ fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, fontWeight: weight, color: hovered ? "#0F172A" : color, transition: "color 100ms ease" }}>{children}</span>;
}

export function V23Inter({ children, hovered, color = "#334155", weight = 400 }: { children: React.ReactNode; hovered: boolean; color?: string; weight?: number }) {
  return <span style={{ fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: hovered ? Math.max(weight, 600) : weight, color: hovered ? "#0F172A" : color, transition: "color 100ms ease" }}>{children}</span>;
}

export interface V23Column<T> {
  key: string;
  label: string;
  minWidth: number;
  align?: "left" | "right";
  render: (row: T, hovered: boolean) => React.ReactNode;
}

export interface V23SortOption<T> {
  key: string;
  label: string;
  cmp: (a: T, b: T) => number;
}

export interface V23FilterGroup<T> {
  key: string;
  label: string;
  options: { value: string; label: string }[];
  getValue: (row: T) => string;
}

export interface V23RowAction<T> {
  title: string;
  color: string;
  icon: React.ReactNode;
  onClick: (row: T) => void;
}

export interface V23TableProps<T extends { id: string }> {
  data: T[];
  columns: V23Column<T>[];
  idLabel: string;
  idWidth?: number;
  renderId: (row: T, hovered: boolean) => React.ReactNode;
  searchPlaceholder: string;
  searchFn: (row: T, query: string) => boolean;
  sortOptions: V23SortOption<T>[];
  filterGroups?: V23FilterGroup<T>[];
  /** Extra control (e.g. a toggle switch) rendered in the toolbar's right cluster, before Clear. */
  toolbarExtra?: React.ReactNode;
  rowActions?: V23RowAction<T>[];
  rowAccent?: (row: T) => string;
  expandable?: boolean;
  isRowExpandable?: (row: T) => boolean;
  renderExpandedRow?: (row: T) => React.ReactNode;
  pageSize?: number;
  itemLabel: string;
}

export function V23Table<T extends { id: string }>({
  data, columns, idLabel, idWidth = 160, renderId, searchPlaceholder, searchFn,
  sortOptions, filterGroups = [], toolbarExtra, rowActions, rowAccent,
  expandable = false, isRowExpandable, renderExpandedRow,
  pageSize = 10, itemLabel,
}: V23TableProps<T>) {
  const [searchQ, setSearchQ] = React.useState("");
  const [sortKey, setSortKey] = React.useState(sortOptions[0]?.key ?? "");
  const [hiddenCols, setHiddenCols] = React.useState<Set<string>>(new Set());
  const [filterSel, setFilterSel] = React.useState<Record<string, Set<string>>>({});
  const [page, setPage] = React.useState(1);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [hoveredId, setHoveredId] = React.useState<string | null>(null);
  const [openDD, setOpenDD] = React.useState<string | null>(null);

  const toggleFilter = (groupKey: string, value: string) => {
    setFilterSel((prev) => {
      const next = new Set(prev[groupKey] ?? []);
      next.has(value) ? next.delete(value) : next.add(value);
      return { ...prev, [groupKey]: next };
    });
    setPage(1);
  };

  const hasActiveFilters = searchQ !== "" || Object.values(filterSel).some((s) => s && s.size > 0);
  const clearFilters = () => { setSearchQ(""); setFilterSel({}); setPage(1); };

  const currentSort = sortOptions.find((o) => o.key === sortKey) ?? sortOptions[0];

  const filtered = data
    .filter((row) => {
      if (searchQ && !searchFn(row, searchQ)) return false;
      for (const g of filterGroups) {
        const sel = filterSel[g.key];
        if (sel && sel.size > 0 && !sel.has(g.getValue(row))) return false;
      }
      return true;
    })
    .sort(currentSort?.cmp ?? (() => 0));

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const paginated = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);
  const pagWindow = v23PagWindow(totalPages, safePage);

  const visibleCols = columns.filter((c) => !hiddenCols.has(c.key));
  const rowBg = (idx: number, hovered: boolean) => (hovered ? "#EBF5F1" : idx % 2 === 1 ? "#F8FDFC" : "#ffffff");

  return (
    <div style={{ width: "100%", minWidth: 0, overflow: "hidden" }}>
      {/* Toolbar */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: 12, padding: "10px 16px", backgroundColor: "#fff", borderBottom: `2px solid ${V23_TEAL}`, flexWrap: "wrap" }}>
        <div style={{ position: "relative", width: 240, flexShrink: 0 }}>
          <Search style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
          <input
            type="text" placeholder={searchPlaceholder} value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
            style={{ width: "100%", height: 32, paddingLeft: 34, paddingRight: searchQ ? 28 : 4, fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1E293B", backgroundColor: "transparent", border: "none", borderBottom: "2px solid #E2E8F0", outline: "none", transition: "border-bottom-color 200ms ease" }}
            onFocus={(e) => { e.target.style.borderBottomColor = V23_TEAL; }}
            onBlur={(e) => { e.target.style.borderBottomColor = "#E2E8F0"; }}
          />
          {searchQ && (
            <button onClick={() => { setSearchQ(""); setPage(1); }} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
              <X style={{ width: 12, height: 12 }} />
            </button>
          )}
        </div>

        {sortOptions.length > 0 && (
          <div style={{ position: "relative" }}>
            <button onClick={() => setOpenDD((k) => (k === "sort" ? null : "sort"))} style={sortKey !== sortOptions[0].key ? { ...V23_BTN_BASE, color: V23_TEAL, borderBottomColor: V23_TEAL } : V23_BTN_BASE}>
              <SlidersHorizontal style={{ width: 12, height: 12 }} />
              {sortKey === sortOptions[0].key ? "Sort" : currentSort?.label}
            </button>
            {openDD === "sort" && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpenDD(null)} />
                <div style={{ ...V23_DD_PANEL, left: 0, minWidth: 200 }}>
                  {sortOptions.map((opt) => (
                    <div key={opt.key} onClick={() => { setSortKey(opt.key); setOpenDD(null); }} style={v23DdItem(sortKey === opt.key)}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}

        <div style={{ position: "relative" }}>
          <button onClick={() => setOpenDD((k) => (k === "columns" ? null : "columns"))} style={hiddenCols.size > 0 ? { ...V23_BTN_BASE, color: V23_TEAL, borderBottomColor: V23_TEAL } : V23_BTN_BASE}>
            <Columns3 style={{ width: 12, height: 12 }} />
            Columns{hiddenCols.size > 0 ? ` (${columns.length - hiddenCols.size}/${columns.length})` : ""}
          </button>
          {openDD === "columns" && (
            <>
              <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpenDD(null)} />
              <div style={{ ...V23_DD_PANEL, left: 0, minWidth: 190, maxHeight: 320, overflowY: "auto" }}>
                {columns.map((col) => {
                  const vis = !hiddenCols.has(col.key);
                  return (
                    <div key={col.key} onClick={() => setHiddenCols((p) => { const n = new Set(p); vis ? n.add(col.key) : n.delete(col.key); return n; })} style={v23DdItem(vis)}>
                      <span style={{ width: 13, height: 13, flexShrink: 0, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${vis ? V23_TEAL : "#CBD5E1"}`, backgroundColor: vis ? V23_TEAL : "transparent" }}>
                        {vis && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                      </span>
                      <span style={{ flex: 1 }}>{col.label}</span>
                    </div>
                  );
                })}
              </div>
            </>
          )}
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 12 }}>
          {toolbarExtra}
          <button onClick={clearFilters} style={{ ...V23_BTN_BASE, visibility: hasActiveFilters ? "visible" : "hidden", color: "#E7000B", borderBottomColor: "#E7000B", gap: 4 }}>
            <X style={{ width: 12, height: 12 }} /> Clear
          </button>
          {filterGroups.length > 0 && (() => {
            const totalSelected = filterGroups.reduce((sum, g) => sum + (filterSel[g.key]?.size ?? 0), 0);
            return (
              <div style={{ position: "relative" }}>
                <button onClick={() => setOpenDD((k) => (k === "filter" ? null : "filter"))} style={totalSelected > 0 ? { ...V23_BTN_BASE, color: V23_TEAL, borderBottomColor: V23_TEAL } : V23_BTN_BASE}>
                  <Filter style={{ width: 12, height: 12, flexShrink: 0 }} />
                  Filter{totalSelected > 0 ? ` (${totalSelected})` : ""}
                </button>
                {openDD === "filter" && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setOpenDD(null)} />
                    <div style={{ ...V23_DD_PANEL, right: 0, left: "auto", minWidth: 220, maxHeight: 360, overflowY: "auto" }}>
                      {filterGroups.map((g, gi) => {
                        const sel = filterSel[g.key] ?? new Set<string>();
                        return (
                          <div key={g.key} style={{ borderTop: gi > 0 ? "1px solid #F1F5F9" : "none" }}>
                            <div style={{ padding: "8px 12px 4px", fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
                              {g.label}
                            </div>
                            {g.options.map((opt) => (
                              <div key={opt.value} onClick={() => toggleFilter(g.key, opt.value)} style={v23DdItem(sel.has(opt.value))}>
                                <span style={{ width: 13, height: 13, flexShrink: 0, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", border: `1.5px solid ${sel.has(opt.value) ? V23_TEAL : "#CBD5E1"}`, backgroundColor: sel.has(opt.value) ? V23_TEAL : "transparent" }}>
                                  {sel.has(opt.value) && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
                                </span>
                                <span style={{ flex: 1 }}>{opt.label}</span>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}
              </div>
            );
          })()}
        </div>
      </div>

      {/* Table */}
      <div style={{ width: "100%", maxWidth: "100%", overflowX: "auto", backgroundColor: "#fff" }}>
        <div style={{ display: "flex", alignItems: "center", height: 44, backgroundColor: V23_HDR, borderBottom: "1px solid #E2E8F0" }}>
          <div style={{ display: "flex", alignItems: "center", flexShrink: 0, position: "sticky", left: 0, zIndex: 3, backgroundColor: V23_HDR, height: "100%" }}>
            <div style={{ width: idWidth, paddingLeft: 12, paddingRight: 8, display: "flex", alignItems: "center", gap: 6 }}>
              {expandable && <span style={{ width: 16, height: 16, flexShrink: 0 }} />}
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{idLabel}</span>
            </div>
          </div>
          {visibleCols.map((col) => (
            <div key={col.key} style={{ flexShrink: 0, width: col.minWidth, paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", justifyContent: col.align === "right" ? "flex-end" : "flex-start" }}>
              <span style={{ fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em" }}>{col.label}</span>
            </div>
          ))}
        </div>

        {paginated.length === 0 ? (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, fontSize: 12, color: V23_SEC, fontFamily: "Inter, sans-serif" }}>
            No {itemLabel} match the current filters.{" "}
            {hasActiveFilters && <button onClick={clearFilters} style={{ marginLeft: 8, color: V23_TEAL, background: "none", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Clear filters</button>}
          </div>
        ) : (
          paginated.map((row, idx) => {
            const isHov = hoveredId === row.id;
            const isExp = expandedId === row.id;
            const canExpand = expandable && (isRowExpandable ? isRowExpandable(row) : Boolean(renderExpandedRow));
            const bg = rowBg(idx, isHov);
            const accent = rowAccent?.(row) ?? V23_TEAL;

            return (
              <div key={row.id}>
                <div
                  onMouseEnter={() => setHoveredId(row.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  style={{ display: "flex", alignItems: "center", minHeight: 44, backgroundColor: bg, borderBottom: "1px solid #F1F5F9", position: "relative", transition: "background-color 100ms ease" }}
                >
                  <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 2, backgroundColor: accent, opacity: isHov ? 1 : 0, transition: "opacity 100ms ease" }} />

                  <div style={{ display: "flex", alignItems: "center", flexShrink: 0, position: "sticky", left: 0, zIndex: 2, backgroundColor: bg, height: "100%", minHeight: 44, transition: "background-color 100ms ease" }}>
                    <div style={{ width: idWidth, paddingLeft: 12, paddingRight: 8, display: "flex", alignItems: "center", gap: 6, height: "100%" }}>
                      {expandable && (
                        canExpand ? (
                          <button
                            onClick={(e) => { e.stopPropagation(); setExpandedId((p) => (p === row.id ? null : row.id)); }}
                            style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", padding: 0, flexShrink: 0, borderRadius: 3, color: isHov ? "#64748B" : "#CBD5E1", transition: "color 120ms ease" }}
                          >
                            <ChevronRight style={{ width: 12, height: 12, transition: "transform 150ms ease", transform: isExp ? "rotate(90deg)" : "none" }} />
                          </button>
                        ) : <span style={{ width: 16, height: 16, flexShrink: 0 }} />
                      )}
                      {renderId(row, isHov)}
                    </div>
                  </div>

                  {visibleCols.map((col) => (
                    <div key={col.key} style={{ flexShrink: 0, width: col.minWidth, paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", justifyContent: col.align === "right" ? "flex-end" : "flex-start", minHeight: 44 }}>
                      {col.render(row, isHov)}
                    </div>
                  ))}

                  {rowActions && rowActions.length > 0 && (
                    <div style={{ position: "sticky", right: 0, zIndex: 4, flexShrink: 0, height: "100%", minHeight: 44, display: "flex", alignItems: "center", gap: 4, paddingLeft: 36, paddingRight: 10, background: `linear-gradient(to right, ${bg}00 0%, ${bg} 36px)`, opacity: isHov ? 1 : 0, pointerEvents: isHov ? "auto" : "none", transition: "opacity 120ms ease" }}>
                      {rowActions.map((action) => (
                        <button
                          key={action.title} title={action.title}
                          onClick={(e) => { e.stopPropagation(); action.onClick(row); }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = action.color; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = action.color; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#F1F5F9"; e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 5, border: "1px solid #E2E8F0", backgroundColor: "#F1F5F9", cursor: "pointer", color: "#64748B", transition: "background-color 100ms ease, color 100ms ease, border-color 100ms ease" }}
                        >
                          {action.icon}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {isExp && canExpand && renderExpandedRow && (
                  <div style={{ position: "sticky", left: 0, zIndex: 1, backgroundColor: "#F8FAFC", borderBottom: "1px solid rgba(0,119,91,0.15)", borderLeft: `3px solid ${accent}` }}>
                    {renderExpandedRow(row)}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Sliding-window pagination */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, padding: "10px 16px", position: "relative", borderTop: "1px solid #F1F5F9", backgroundColor: "#fff" }}>
        <button onClick={() => setPage(1)} disabled={safePage === 1} title="First page" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: safePage === 1 ? "not-allowed" : "pointer", backgroundColor: "#F1F5F9", color: safePage === 1 ? "#CBD5E1" : "#475569" }}>
          <ChevronsLeft style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={safePage === 1} title="Previous page" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: safePage === 1 ? "not-allowed" : "pointer", backgroundColor: "transparent", color: safePage === 1 ? "#CBD5E1" : "#475569" }}>
          <ChevronLeft style={{ width: 13, height: 13 }} />
        </button>
        {pagWindow.map((p) => (
          <button key={p} onClick={() => setPage(p)} style={{ width: 28, height: 28, borderRadius: 4, border: safePage === p ? `1px solid ${V23_TEAL}40` : "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", backgroundColor: safePage === p ? V23_TEAL : "#F1F5F9", color: safePage === p ? "#ffffff" : "#94A3B8" }}>
            {p}
          </button>
        ))}
        <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={safePage === totalPages} title="Next page" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: safePage === totalPages ? "not-allowed" : "pointer", backgroundColor: "transparent", color: safePage === totalPages ? "#CBD5E1" : "#475569" }}>
          <ChevronRight style={{ width: 13, height: 13 }} />
        </button>
        <button onClick={() => setPage(totalPages)} disabled={safePage === totalPages} title="Last page" style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "none", cursor: safePage === totalPages ? "not-allowed" : "pointer", backgroundColor: safePage === totalPages ? "#F1F5F9" : "#F1F5F9", color: safePage === totalPages ? "#CBD5E1" : "#475569" }}>
          <ChevronsRight style={{ width: 13, height: 13 }} />
        </button>
        <div style={{ position: "absolute", right: 16, fontSize: 11, color: V23_SEC, fontFamily: "Inter, sans-serif" }}>
          <span>Showing </span>
          <span style={{ fontWeight: 600, color: "#334155" }}>
            {filtered.length === 0 ? 0 : (safePage - 1) * pageSize + 1}–{Math.min(safePage * pageSize, filtered.length)}
          </span>
          <span> of </span>
          <span style={{ fontWeight: 600, color: "#334155" }}>{filtered.length}</span>
          <span> {itemLabel}</span>
        </div>
      </div>
    </div>
  );
}
