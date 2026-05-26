import { useState, useMemo } from "react";
import { MapPin, Server } from "lucide-react";
import { MOCK_CLUSTERS, MOCK_ACCOUNTS, Cluster } from "@/data/mockData";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";

// ── Row type ──────────────────────────────────────────────────────────────────

type Row = Cluster & { accountName: string };

// ── Filter tabs ───────────────────────────────────────────────────────────────

type StatusFilter = "all" | "active" | "warning" | "inactive";

const FILTER_TABS: { id: StatusFilter; label: string; dot?: string; activeBg: string }[] = [
  { id: "all",      label: "All",      activeBg: "#0F172A" },
  { id: "active",   label: "Active",   dot: "#00A63E", activeBg: "#00A63E" },
  { id: "warning",  label: "Warning",  dot: "#E19A04", activeBg: "#B37A00" },
  { id: "inactive", label: "Inactive", dot: "#E7000B", activeBg: "#E7000B" },
];

// ── Column definitions (DataGrid v2.3 format) ────────────────────────────────

const columns: DataGridColumn<Row>[] = [
  {
    key: "name",
    header: "Cluster",
    sortable: true,
    width: "minmax(200px, 2fr)",
    searchValue: (r) => r.name,
    render: (row, hovered) => <MonoCell hovered={hovered} isPrimary>{row.name}</MonoCell>,
  },
  {
    key: "accountName",
    header: "Account",
    sortable: true,
    width: "minmax(160px, 1.5fr)",
    searchValue: (r) => r.accountName,
    render: (row, hovered) => <InterCell hovered={hovered}>{row.accountName}</InterCell>,
  },
  {
    key: "status",
    header: "Status",
    width: "110px",
    render: (row) => (
      <StatusCapsule
        status={row.status === "inactive" ? "error" : row.status}
        label={row.status.toUpperCase()}
      />
    ),
  },
  {
    key: "ip",
    header: "IP Address",
    sortable: true,
    width: "minmax(130px, 1fr)",
    searchValue: (r) => r.ip,
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.ip}</MonoCell>,
  },
  {
    key: "location",
    header: "Location",
    sortable: true,
    width: "minmax(130px, 1fr)",
    searchValue: (r) => r.location,
    render: (row, hovered) => (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <MapPin style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
        <InterCell hovered={hovered}>{row.location}</InterCell>
      </div>
    ),
  },
  {
    key: "instanceCount",
    header: "Instances",
    width: "100px",
    render: (row, hovered) => (
      <span style={{ fontSize: 12, fontFamily: "'JetBrains Mono','Fira Code',monospace", color: hovered ? "#0F172A" : "#64748B" }}>
        {row.instanceCount}<span style={{ color: "#CBD5E1" }}>/{row.totalInstances}</span>
      </span>
    ),
  },
  {
    key: "sgCount",
    header: "SG",
    width: "70px",
    align: "center",
    sortable: true,
    render: (row, hovered) => <MonoCell hovered={hovered}>{String(row.sgCount)}</MonoCell>,
  },
  {
    key: "cpuCores",
    header: "CPU",
    width: "80px",
    align: "center",
    sortable: true,
    render: (row, hovered) => <MonoCell hovered={hovered}>{String(row.cpuCores)}</MonoCell>,
  },
  {
    key: "memory",
    header: "Memory",
    width: "90px",
    align: "center",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.memory}</MonoCell>,
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface AllClustersProps {
  onSelectCluster?: (cluster: Cluster) => void;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function AllClusters({ onSelectCluster }: AllClustersProps) {
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const allRows = useMemo<Row[]>(
    () =>
      MOCK_CLUSTERS.map((c) => ({
        ...c,
        accountName: MOCK_ACCOUNTS.find((a) => a.id === c.accountId)?.name ?? c.accountId,
      })),
    []
  );

  const filteredRows = useMemo(
    () => statusFilter === "all" ? allRows : allRows.filter((r) => r.status === statusFilter),
    [allRows, statusFilter]
  );

  const activeCnt  = allRows.filter((r) => r.status === "active").length;
  const warnCnt    = allRows.filter((r) => r.status === "warning").length;
  const inactCnt   = allRows.filter((r) => r.status === "inactive").length;

  const filterCounts: Record<StatusFilter, number> = {
    all: allRows.length, active: activeCnt, warning: warnCnt, inactive: inactCnt,
  };

  return (
    <div className="flex flex-col h-full overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>

      {/* Page header */}
      <div className="px-6 pt-5 pb-4 flex-shrink-0 border-b border-[#E2E8F0] bg-white">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-1">
              <div className="w-8 h-8 rounded-[8px] bg-[#F0FDF9] border border-[#00775B]/15 flex items-center justify-center">
                <Server className="w-4 h-4 text-[#00775B]" />
              </div>
              <span className="text-[16px] font-bold text-[#0F172A] leading-tight">All Clusters</span>
            </div>
            <p className="text-[12px] text-[#94A3B8] ml-[42px]">
              {allRows.length} clusters across {MOCK_ACCOUNTS.length} accounts
            </p>
          </div>

          {/* Summary chips */}
          <div className="flex items-center gap-2">
            {[
              { label: "Active",   count: activeCnt, dot: "#00A63E", color: "#00A63E" },
              { label: "Warning",  count: warnCnt,   dot: "#E19A04", color: "#B37A00" },
              { label: "Inactive", count: inactCnt,  dot: "#E7000B", color: "#E7000B" },
            ].map((s) => (
              <div
                key={s.label}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-[7px] border border-[#E2E8F0] bg-white text-[11px]"
              >
                <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.dot }} />
                <span className="text-[#64748B]">{s.label}:</span>
                <span className="font-bold" style={{ color: s.color }}>{s.count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Table area */}
      <div className="flex-1 overflow-auto p-6">
        <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
          {/* Filter tabs */}
          <div style={{ display: "flex", alignItems: "center", gap: 6, padding: "10px 14px", borderBottom: "1px solid #E2E8F0", backgroundColor: "#fff" }}>
            {FILTER_TABS.map((tab) => {
              const isActive = statusFilter === tab.id;
              const count = filterCounts[tab.id];
              return (
                <button
                  key={tab.id}
                  onClick={() => setStatusFilter(tab.id)}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 5, height: 28, padding: "0 10px",
                    borderRadius: 6, fontSize: 11, fontWeight: isActive ? 700 : 600, fontFamily: "Inter, sans-serif",
                    cursor: "pointer", border: isActive ? "none" : "1px solid #E2E8F0",
                    backgroundColor: isActive ? tab.activeBg : "transparent",
                    color: isActive ? "#fff" : "#64748B",
                    transition: "all 150ms ease", whiteSpace: "nowrap",
                  }}
                >
                  {tab.dot && (
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isActive ? "#fff" : tab.dot, flexShrink: 0 }} />
                  )}
                  {tab.label}
                  <span style={{
                    fontSize: 9, fontWeight: 700, padding: "1px 5px", borderRadius: 3,
                    backgroundColor: isActive ? "rgba(255,255,255,0.2)" : "#F1F5F9",
                    color: isActive ? "#fff" : "#64748B",
                  }}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* DataGrid v2.3 */}
          <DataGrid<Row>
            data={filteredRows}
            columns={columns}
            selectable
            searchable
            searchPlaceholder="Search clusters, IPs, locations..."
            pageSize={20}
            defaultSortKey="name"
            onRowClick={onSelectCluster ? (row) => onSelectCluster(row) : undefined}
            emptyState={
              <span>
                No clusters match the current filter.{" "}
                {statusFilter !== "all" && (
                  <button onClick={() => setStatusFilter("all")} style={{ color: "#00775B", background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 12 }}>
                    Show all
                  </button>
                )}
              </span>
            }
          />
        </div>
      </div>
    </div>
  );
}
