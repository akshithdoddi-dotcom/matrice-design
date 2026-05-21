import { useMemo, useEffect, useCallback } from "react";
import {
  Server,
  Layers,
  MapPin,
  ArrowRight,
} from "lucide-react";
import {
  MOCK_ACCOUNTS,
  MOCK_CLUSTERS,
  MOCK_PROJECTS,
  Account,
  Cluster,
  Project,
  ProjectSeverity,
} from "@/data/mockData";
import { StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { StatCard, STAT_PRESETS } from "@fe-common/components/ui/StatCard";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";

// ── Design tokens ─────────────────────────────────────────────────────────────

const TEAL = "#00775B";

const SEV_BG: Record<ProjectSeverity, string> = {
  critical: "#E7000B",
  high:     "#EA580C",
  medium:   "#E19A04",
  stable:   "#00A63E",
  resolved: "#64748B",
  default:  "#94A3B8",
};

// ── Column definitions ────────────────────────────────────────────────────────

const clusterCols: ColumnDef<Cluster>[] = [
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
    id: "status",
    header: "Status",
    accessorKey: "status",
    minWidth: 100,
    sortable: false,
    cell: ({ row }) => (
      <StatusCapsule status={row.status === "inactive" ? "error" : row.status as any} label={row.status.toUpperCase()} />
    ),
  },
  {
    id: "ip",
    header: "IP Address",
    accessorKey: "ip",
    minWidth: 140,
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-[#94A3B8]">{row.ip}</span>
    ),
  },
  {
    id: "location",
    header: "Location",
    accessorKey: "location",
    minWidth: 120,
    cell: ({ row }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
        <MapPin style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
        <span style={{ fontSize: 11, color: "#64748B" }}>{row.location}</span>
      </div>
    ),
  },
  {
    id: "instances",
    header: "Instances",
    minWidth: 100,
    cell: ({ row }) => (
      <span style={{ fontSize: 12, color: "#64748B" }}>
        {row.instanceCount}<span style={{ color: "#CBD5E1" }}>/{row.totalInstances}</span>
      </span>
    ),
  },
  {
    id: "sgCount",
    header: "SG",
    accessorKey: "sgCount",
    minWidth: 60,
    align: "center",
    cell: ({ row }) => (
      <span className="text-[12px] text-[#64748B]">{row.sgCount}</span>
    ),
  },
];

const projectSubCols: ColumnDef<Project>[] = [
  {
    id: "severity",
    header: "Severity",
    minWidth: 90,
    sortable: false,
    cell: ({ row }) => {
      const sevBg = SEV_BG[row.severity] ?? SEV_BG.default;
      return (
        <span style={{ display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 4, fontSize: 9, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase", color: "#fff", backgroundColor: sevBg, whiteSpace: "nowrap" }}>
          {row.severity}
        </span>
      );
    },
  },
  {
    id: "name",
    header: "Project",
    accessorKey: "name",
    minWidth: 160,
    filterable: true,
    cell: ({ row }) => (
      <span className="text-[12px] font-medium text-[#334155]">{row.name}</span>
    ),
  },
  {
    id: "pipelineCount",
    header: "Pipelines",
    accessorKey: "pipelineCount",
    minWidth: 80,
    align: "center",
    cell: ({ row }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
        <Layers style={{ width: 11, height: 11, color: "#94A3B8", flexShrink: 0 }} />
        <span style={{ fontSize: 12, color: "#64748B" }}>{row.pipelineCount}</span>
      </div>
    ),
  },
  {
    id: "lastActive",
    header: "Last Active",
    accessorKey: "lastActive",
    minWidth: 100,
    cell: ({ row }) => (
      <span className="text-[11px] text-[#94A3B8]">{row.lastActive}</span>
    ),
  },
];

// ── ProjectSubTable ───────────────────────────────────────────────────────────

function ProjectSubTable({
  cluster,
  onSelectProject,
  onSelectCluster,
}: {
  cluster: Cluster;
  onSelectProject: (project: Project) => void;
  onSelectCluster: () => void;
}) {
  const projects = useMemo(
    () => MOCK_PROJECTS.filter((p) => p.clusterId === cluster.id),
    [cluster.id]
  );

  return (
    <div style={{ backgroundColor: "#F8FDFC" }}>
      <DataTable
        data={projects}
        rowIdKey="id"
        columns={projectSubCols}
        toolbar={false}
        pagination="none"
        showRowCue={false}
        striped={false}
        emptyState={{ title: "No projects", description: "No projects on this cluster" }}
        onRowClick={onSelectProject}
      />
      <div style={{ padding: "8px 16px", borderTop: "1px solid rgba(0,119,91,0.14)", display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={onSelectCluster}
          style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: TEAL, background: "none", border: "none", cursor: "pointer" }}
        >
          View all projects <ArrowRight style={{ width: 12, height: 12 }} />
        </button>
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface SupportDeskProps {
  selectedAccount: Account | null;
  onSelectAccount: (account: Account) => void;
  onSelectCluster: (cluster: Cluster) => void;
  onSelectProject: (cluster: Cluster, project: Project) => void;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function SupportDesk({
  selectedAccount,
  onSelectAccount,
  onSelectCluster,
  onSelectProject,
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

  const renderExpandedCluster = useCallback(
    (cluster: Cluster) => (
      <ProjectSubTable
        cluster={cluster}
        onSelectProject={(project) => onSelectProject(cluster, project)}
        onSelectCluster={() => onSelectCluster(cluster)}
      />
    ),
    [onSelectProject, onSelectCluster]
  );

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
          <DataTable
            data={accountClusters}
            rowIdKey="id"
            columns={clusterCols}
            selectable
            selectionMode="multi"
            expandable
            renderExpandedRow={renderExpandedCluster}
            striped={false}
            emptyState={{ title: "No clusters", description: "No clusters for this account" }}
          />
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
