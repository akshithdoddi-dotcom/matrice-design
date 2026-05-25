import { useMemo, useEffect } from "react";
import {
  Server,
  MapPin,
} from "lucide-react";
import {
  MOCK_ACCOUNTS,
  MOCK_CLUSTERS,
  Account,
  Cluster,
} from "@/data/mockData";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";
// InterCell used in location column
import { StatCard, STAT_PRESETS } from "@fe-common/components/ui/StatCard";

// ── Design tokens ─────────────────────────────────────────────────────────────

// ── Cluster columns (DataGrid v2.3) ──────────────────────────────────────────

const clusterCols: DataGridColumn<Cluster>[] = [
  {
    key: "name",
    header: "Cluster",
    sortable: true,
    width: "minmax(200px, 2fr)",
    searchValue: (r) => r.name,
    render: (row, hovered) => <MonoCell hovered={hovered} isPrimary>{row.name}</MonoCell>,
  },
  {
    key: "status",
    header: "Status",
    width: "100px",
    render: (row) => (
      <StatusCapsule status={row.status === "inactive" ? "error" : row.status} label={row.status.toUpperCase()} />
    ),
  },
  {
    key: "ip",
    header: "IP Address",
    width: "minmax(130px, 1fr)",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.ip}</MonoCell>,
  },
  {
    key: "location",
    header: "Location",
    width: "minmax(120px, 1fr)",
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
    width: "60px",
    align: "center",
    render: (row, hovered) => <MonoCell hovered={hovered}>{String(row.sgCount)}</MonoCell>,
  },
];

// ── Props ─────────────────────────────────────────────────────────────────────

interface SupportDeskProps {
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  onSelectCluster: (cluster: Cluster) => void;
  onSelectProject?: (cluster: Cluster, project: never) => void; // kept for compat
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SupportDesk({
  selectedAccount,
  onSelectAccount,
  onSelectCluster,
}: SupportDeskProps) {
  useEffect(() => {
    if (!selectedAccount && MOCK_ACCOUNTS.length > 0) {
      onSelectAccount(MOCK_ACCOUNTS[0]);
    }
  }, []);

  const accountClusters = useMemo(
    () => selectedAccount ? MOCK_CLUSTERS.filter((c) => c.accountId === selectedAccount.id) : [],
    [selectedAccount]
  );

  const totalClusters   = accountClusters.length;
  const activeClusters  = accountClusters.filter((c) => c.status === "active").length;
  const warningClusters = accountClusters.filter((c) => c.status === "warning").length;
  const totalInstances  = accountClusters.reduce((s, c) => s + c.totalInstances, 0);
  const activeInstances = accountClusters.reduce((s, c) => s + c.instanceCount, 0);
  const totalSGW        = accountClusters.reduce((s, c) => s + c.sgCount, 0);
  const hasWarning      = warningClusters > 0;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F8FAFC" }}>
      {selectedAccount ? (
        <div className="flex-1 overflow-auto p-6 space-y-6">

          {/* ── Summary cards ── */}
          <div className="grid grid-cols-4 gap-4">
            <StatCard d={{
              label: "Active Clusters",
              value: `${activeClusters}`,
              sublabel: `of ${totalClusters} total`,
              chip: "LIVE",
              dir: "neutral",
              num: "No change",
              ref_: "vs last check",
              ...(hasWarning ? STAT_PRESETS.amber : STAT_PRESETS.teal),
            }} />
            <StatCard d={{
              label: "Cluster Warnings",
              value: `${warningClusters}`,
              sublabel: warningClusters === 0 ? "All clusters healthy" : `${warningClusters} need attention`,
              chip: "REAL-TIME",
              dir: warningClusters > 0 ? "up" : "neutral",
              num: warningClusters > 0 ? `+${warningClusters}` : "No change",
              ref_: "vs yesterday",
              ...(warningClusters > 0 ? STAT_PRESETS.red : STAT_PRESETS.teal),
            }} />
            <StatCard d={{
              label: "Instances Running",
              value: `${activeInstances}`,
              sublabel: `of ${totalInstances} total`,
              chip: "LIVE",
              dir: "neutral",
              num: "No change",
              ref_: "vs last check",
              ...STAT_PRESETS.blue,
            }} />
            <StatCard d={{
              label: "Security Groups",
              value: `${totalSGW}`,
              sublabel: "across all clusters",
              chip: "SYNCED",
              dir: "neutral",
              num: "No change",
              ref_: "vs last sync",
              ...STAT_PRESETS.slate,
            }} />
          </div>

          {/* ── Cluster table ── */}
          <div style={{ border: "1px solid #E2E8F0", borderRadius: 8, overflow: "hidden" }}>
            <DataGrid<Cluster>
              data={accountClusters}
              columns={clusterCols}
              selectable
              onRowClick={(cluster) => onSelectCluster(cluster)}
              emptyState={<span style={{ fontSize: 12, color: "#94A3B8" }}>No clusters for this account</span>}
            />
          </div>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-14 h-14 rounded-[12px] bg-[#F0FDF9] border border-[#00775B]/15 flex items-center justify-center mx-auto mb-3">
              <Server className="w-7 h-7 text-[#00775B]/40" />
            </div>
            <p className="text-[14px] font-semibold text-[#0F172A]">No account selected</p>
            <p className="text-[12px] text-[#94A3B8] mt-1">Use the account switcher above</p>
          </div>
        </div>
      )}
    </div>
  );
}
