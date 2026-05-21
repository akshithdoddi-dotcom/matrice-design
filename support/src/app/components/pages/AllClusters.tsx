import { useMemo } from "react";
import { MapPin } from "lucide-react";
import { MOCK_CLUSTERS, MOCK_ACCOUNTS, Cluster } from "@/data/mockData";
import { StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";

// ── Row type ──────────────────────────────────────────────────────────────────

type Row = Cluster & { accountName: string };

// ── Column definitions ────────────────────────────────────────────────────────

const columns: ColumnDef<Row>[] = [
  {
    id: "name",
    header: "Cluster",
    accessorKey: "name",
    filterable: true,
    minWidth: 200,
    cell: ({ row }) => (
      <span className="font-mono text-[11px] font-medium text-[#0F172A]">{row.name}</span>
    ),
  },
  {
    id: "accountName",
    header: "Account",
    accessorKey: "accountName",
    filterable: true,
    minWidth: 160,
    cell: ({ row }) => (
      <span className="text-[12px] text-[#64748B]">{row.accountName}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    minWidth: 110,
    cell: ({ row }) => (
      <StatusCapsule
        status={row.status === "inactive" ? "error" : (row.status as any)}
        label={row.status.toUpperCase()}
      />
    ),
  },
  {
    id: "ip",
    header: "IP Address",
    accessorKey: "ip",
    filterable: true,
    minWidth: 140,
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-[#94A3B8]">{row.ip}</span>
    ),
  },
  {
    id: "location",
    header: "Location",
    accessorKey: "location",
    filterable: true,
    minWidth: 130,
    cell: ({ row }) => (
      <div className="flex items-center gap-1">
        <MapPin style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#64748B" }}>{row.location}</span>
      </div>
    ),
  },
  {
    id: "instanceCount",
    header: "Instances",
    minWidth: 100,
    cell: ({ row }) => (
      <span style={{ fontSize: 12, color: "#64748B" }}>
        {row.instanceCount}
        <span style={{ color: "#CBD5E1" }}>/{row.totalInstances}</span>
      </span>
    ),
  },
  {
    id: "sgCount",
    header: "SG",
    accessorKey: "sgCount",
    minWidth: 70,
    align: "center",
    cell: ({ row }) => (
      <span className="text-[12px] text-[#64748B]">{row.sgCount}</span>
    ),
  },
  {
    id: "cpuCores",
    header: "CPU",
    accessorKey: "cpuCores",
    minWidth: 80,
    align: "center",
    cell: ({ row }) => (
      <span className="text-[12px] text-[#64748B]">{row.cpuCores}</span>
    ),
  },
  {
    id: "memory",
    header: "Memory",
    accessorKey: "memory",
    minWidth: 90,
    align: "center",
    cell: ({ row }) => (
      <span className="text-[12px] text-[#64748B]">{row.memory}</span>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function AllClusters() {
  const rows = useMemo<Row[]>(
    () =>
      MOCK_CLUSTERS.map((c) => ({
        ...c,
        accountName:
          MOCK_ACCOUNTS.find((a) => a.id === c.accountId)?.name ?? c.accountId,
      })),
    []
  );

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Page header */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ backgroundColor: "#00775B" }}
      >
        <div>
          <div className="text-[15px] font-bold text-white leading-tight">All Clusters</div>
          <div className="text-[11px] text-white/60 mt-0.5">
            {MOCK_CLUSTERS.length} clusters across {MOCK_ACCOUNTS.length} accounts
          </div>
        </div>
        <div className="flex items-center gap-3">
          <StatChip label="Active"   value={String(MOCK_CLUSTERS.filter((c) => c.status === "active").length)}   color="#00A63E" />
          <StatChip label="Warning"  value={String(MOCK_CLUSTERS.filter((c) => c.status === "warning").length)}  color="#E19A04" />
          <StatChip label="Inactive" value={String(MOCK_CLUSTERS.filter((c) => c.status === "inactive").length)} color="#E7000B" />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto p-6">
        <DataTable<Row>
          data={rows}
          rowIdKey="id"
          columns={columns}
          selectable
          selectionMode="multi"
          emptyState={{ title: "No clusters", description: "No clusters found" }}
        />
      </div>
    </div>
  );
}

// ── Stat chip ─────────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-[7px] px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-white/80">{label}:</span>
      <span className="text-[12px] font-bold text-white">{value}</span>
    </div>
  );
}
