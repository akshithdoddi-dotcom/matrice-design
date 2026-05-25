import { useState, useMemo } from "react";
import {
  Search,
  Server,
  Cpu,
  HardDrive,
  ExternalLink,
  X,
  MapPin,
  Activity,
  Layers,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  Briefcase,
} from "lucide-react";
import {
  MOCK_CLUSTERS,
  Cluster,
  ClusterStatus,
  Account,
} from "@/data/mockData";

// ── Status config ─────────────────────────────────────────────────────────────

const STATUS_CFG: Record<
  ClusterStatus,
  { dot: string; label: string; bg: string; text: string; border: string }
> = {
  active:   { dot: "#00A63E", label: "ACTIVE",   bg: "rgba(0,166,62,0.08)",   text: "#00A63E", border: "rgba(0,166,62,0.20)"   },
  warning:  { dot: "#E19A04", label: "WARNING",  bg: "rgba(225,154,4,0.08)",  text: "#B37A00", border: "rgba(225,154,4,0.20)"  },
  inactive: { dot: "#E7000B", label: "INACTIVE", bg: "rgba(231,0,11,0.08)",   text: "#E7000B", border: "rgba(231,0,11,0.20)"   },
};

const SVC_STATUS_CFG = {
  running:  { color: "#00A63E", label: "running"  },
  starting: { color: "#E19A04", label: "starting" },
  stopped:  { color: "#94A3B8", label: "stopped"  },
  error:    { color: "#E7000B", label: "error"     },
};

// ── Props ─────────────────────────────────────────────────────────────────────

interface ClustersProps {
  account: Account | null;
  onBack: () => void;
  onSelectCluster: (cluster: Cluster) => void;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Clusters({ account, onBack, onSelectCluster }: ClustersProps) {
  const [query, setQuery]                     = useState("");
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);

  const accountClusters = useMemo(
    () => MOCK_CLUSTERS.filter((c) => c.accountId === account?.id),
    [account]
  );

  const filtered = useMemo(
    () => accountClusters.filter((c) =>
      c.name.toLowerCase().includes(query.toLowerCase())
    ),
    [accountClusters, query]
  );

  const totalClusters   = accountClusters.length;
  const activeClusters  = accountClusters.filter((c) => c.status === "active").length;
  const totalInstances  = accountClusters.reduce((s, c) => s + c.totalInstances, 0);
  const activeInstances = accountClusters.reduce((s, c) => s + c.instanceCount, 0);
  const totalSGW        = accountClusters.reduce((s, c) => s + c.sgCount, 0);
  const hasWarning      = accountClusters.some((c) => c.status === "warning");

  return (
    <div className="flex flex-col min-h-full">
      {/* Account banner */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ backgroundColor: "#00775B" }}
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-[8px] bg-white/15 border border-white/25 flex items-center justify-center">
            <Briefcase className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="text-[15px] font-bold text-white leading-tight">
              {account?.name ?? "Account"}
            </div>
            <div className="text-[11px] text-white/65 font-mono leading-tight mt-0.5">
              Account: {account?.accountId ?? "—"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/15 border border-white/25 rounded-[8px] px-3 py-2">
          <Server className="w-4 h-4 text-white/80" />
          <span className="text-[13px] font-semibold text-white">
            {totalClusters} Cluster{totalClusters !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header area: breadcrumb, stats, search */}
        <div className="px-6 pt-4 pb-3 flex-shrink-0 space-y-3">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8]">
            <button
              onClick={onBack}
              className="hover:text-[#00775B] transition-colors font-medium"
            >
              Support Desk
            </button>
            <span>›</span>
            <span className="text-[#0F172A] font-medium truncate max-w-[220px]">
              {account?.name ?? "Account"}
            </span>
            <span>›</span>
            <span>Clusters</span>
          </div>

          {/* Stats bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {hasWarning ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[rgba(225,154,4,0.08)] border border-[rgba(225,154,4,0.20)]">
                <AlertTriangle className="w-3.5 h-3.5 text-[#E19A04]" />
                <span className="text-[11px] font-bold text-[#B37A00]">WARNING</span>
              </div>
            ) : (
              <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[rgba(0,166,62,0.08)] border border-[rgba(0,166,62,0.20)]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#00A63E]" />
                <span className="text-[11px] font-bold text-[#00A63E]">HEALTHY</span>
              </div>
            )}
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <Layers className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[11px] text-[#64748B]">
                Clusters:{" "}
                <span className="font-semibold text-[#0F172A]">
                  {activeClusters}/{totalClusters}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <Activity className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[11px] text-[#64748B]">
                Instances:{" "}
                <span className="font-semibold text-[#0F172A]">
                  {activeInstances}/{totalInstances}
                </span>
              </span>
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[6px] bg-[#F8FAFC] border border-[#E2E8F0]">
              <Server className="w-3.5 h-3.5 text-[#64748B]" />
              <span className="text-[11px] text-[#64748B]">
                SGW:{" "}
                <span className="font-semibold text-[#0F172A]">{totalSGW}</span>
              </span>
            </div>
            <span className="ml-auto text-[11px] text-[#94A3B8] italic">
              Updated 2s ago
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search clusters..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[7px] border border-[#E2E8F0] bg-white text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[#00775B]/10 transition-all"
            />
          </div>
        </div>

        {/* Two-panel content */}
        <div className="flex-1 flex gap-4 overflow-hidden px-6 pb-6">
          {/* Left: cluster list */}
          <div className="flex flex-col w-[340px] flex-shrink-0 overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 mb-3 flex-shrink-0">
              <span className="text-[13px] font-semibold text-[#0F172A]">Cluster Health</span>
              <span className="px-2 py-0.5 rounded-[4px] bg-[#F0FDF9] border border-[#00775B]/15 text-[10px] font-bold text-[#00775B]">
                {totalClusters} CLUSTERS
              </span>
              <div className="flex items-center gap-3 ml-auto text-[9px] text-[#94A3B8]">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E19A04] inline-block" />
                  Warning
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A63E] inline-block" />
                  Healthy
                </span>
              </div>
            </div>

            {/* Cluster cards */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {filtered.length === 0 ? (
                <div className="text-center py-8 text-[13px] text-[#94A3B8]">
                  No clusters found
                </div>
              ) : (
                filtered.map((cluster) => (
                  <ClusterCard
                    key={cluster.id}
                    cluster={cluster}
                    isSelected={selectedCluster?.id === cluster.id}
                    onClick={() => setSelectedCluster(cluster)}
                  />
                ))
              )}
            </div>
          </div>

          {/* Right: detail panel */}
          <div className="flex-1 overflow-hidden">
            {selectedCluster ? (
              <ClusterDetail
                cluster={selectedCluster}
                onClose={() => setSelectedCluster(null)}
                onViewProjects={() => onSelectCluster(selectedCluster)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center rounded-[8px] border border-dashed border-[#E2E8F0] bg-[#F8FAFC]">
                <Server className="w-10 h-10 text-[#CBD5E1] mb-3" />
                <p className="text-[13px] font-medium text-[#94A3B8]">
                  Select a cluster to view details
                </p>
                <p className="text-[11px] text-[#CBD5E1] mt-1">
                  Click any cluster from the list on the left
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cluster card (left list) ──────────────────────────────────────────────────

function ClusterCard({
  cluster,
  isSelected,
  onClick,
}: {
  cluster: Cluster;
  isSelected: boolean;
  onClick: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const s = STATUS_CFG[cluster.status];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="relative rounded-[8px] p-3.5 cursor-pointer outline-none transition-all duration-150"
      style={{
        border: `1px solid ${isSelected ? "rgba(0,119,91,0.30)" : hovered ? "rgba(0,119,91,0.15)" : "#E2E8F0"}`,
        borderLeft: `3px solid ${isSelected ? "#00775B" : s.dot}`,
        backgroundColor: isSelected ? "#F0FDF9" : hovered ? "#FAFBFC" : "#fff",
        boxShadow: isSelected
          ? "0 2px 8px rgba(0,119,91,0.10)"
          : hovered
          ? "0 2px 6px rgba(0,0,0,0.06)"
          : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2 min-w-0">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0 mt-0.5"
            style={{ backgroundColor: s.dot }}
          />
          <span className="text-[13px] font-semibold text-[#0F172A] truncate">
            {cluster.name}
          </span>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-[#CBD5E1] hover:text-[#00775B] transition-colors ml-2 flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1.5 text-[11px] font-mono text-[#94A3B8] mb-2.5">
        <span>{cluster.ip}</span>
        <span className="text-[#CBD5E1]">·</span>
        <span>{cluster.location}</span>
      </div>

      <div className="flex items-center gap-2">
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] font-medium text-[#64748B]">
          <Layers className="w-2.5 h-2.5" />
          {cluster.instanceCount} inst
        </span>
        <span className="flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-[#F1F5F9] border border-[#E2E8F0] text-[10px] font-medium text-[#64748B]">
          <Activity className="w-2.5 h-2.5" />
          {cluster.sgCount} SG
        </span>
      </div>
    </div>
  );
}

// ── Cluster detail panel (right) ──────────────────────────────────────────────

function ClusterDetail({
  cluster,
  onClose,
  onViewProjects,
}: {
  cluster: Cluster;
  onClose: () => void;
  onViewProjects: () => void;
}) {
  const s = STATUS_CFG[cluster.status];

  return (
    <div
      className="h-full flex flex-col rounded-[8px] overflow-hidden"
      style={{ border: "1px solid #E2E8F0", backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 px-4 py-3 border-b border-[#E2E8F0] flex-shrink-0">
        <span
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: s.dot }}
        />
        <span className="text-[14px] font-bold text-[#0F172A] flex-1 min-w-0 truncate">
          {cluster.name}
        </span>
        <span
          className="px-2 py-0.5 rounded-[4px] text-[10px] font-bold flex-shrink-0"
          style={{ backgroundColor: s.bg, color: s.text, border: `1px solid ${s.border}` }}
        >
          {s.label}
        </span>
        <div className="flex items-center gap-1 text-[11px] font-mono text-[#94A3B8] flex-shrink-0">
          <MapPin className="w-3 h-3" />
          <span>{cluster.ip}</span>
          <span className="text-[#CBD5E1] mx-0.5">·</span>
          <span>{cluster.location}</span>
        </div>
        <button
          onClick={onClose}
          className="text-[#94A3B8] hover:text-[#475569] transition-colors ml-1 flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-px bg-[#E2E8F0] flex-shrink-0">
        {[
          { label: "INSTANCES", value: `${cluster.instanceCount}/${cluster.totalInstances}`, sub: `${cluster.instanceCount} running`, Icon: Layers },
          { label: "CPU CORES", value: cluster.cpuCores,  sub: null, Icon: Cpu       },
          { label: "MEMORY",    value: cluster.memory,    sub: null, Icon: HardDrive },
        ].map(({ label, value, sub, Icon }) => (
          <div key={label} className="bg-[#FAFBFC] px-4 py-3.5">
            <div className="flex items-center gap-1.5 mb-1.5">
              <Icon className="w-3 h-3 text-[#94A3B8]" />
              <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
                {label}
              </span>
            </div>
            <div className="text-[22px] font-bold text-[#0F172A] leading-none">{value}</div>
            {sub && <div className="text-[10px] text-[#94A3B8] mt-1">{sub}</div>}
          </div>
        ))}
      </div>

      {/* Services list */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 py-2.5 border-b border-[#F1F5F9] flex-shrink-0">
          <span className="text-[12px] font-semibold text-[#0F172A]">
            Services on this cluster
          </span>
        </div>
        <div className="divide-y divide-[#F8FAFC]">
          {cluster.services.map((svc) => {
            const sc = SVC_STATUS_CFG[svc.status];
            return (
              <div key={svc.id} className="flex items-center gap-3 px-4 py-2.5">
                <span
                  className="px-1.5 py-0.5 rounded-[3px] text-[9px] font-bold flex-shrink-0"
                  style={{
                    backgroundColor: "rgba(0,119,91,0.10)",
                    color: "#00775B",
                  }}
                >
                  {svc.type}
                </span>
                <span className="flex-1 text-[11px] text-[#475569] font-mono truncate">
                  {svc.name}
                </span>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ backgroundColor: sc.color }}
                  />
                  <span className="text-[10px] text-[#94A3B8]">{sc.label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer: View Projects */}
      <div className="px-4 py-3 border-t border-[#E2E8F0] flex-shrink-0">
        <button
          onClick={onViewProjects}
          className="w-full flex items-center justify-center gap-2 h-9 rounded-[7px] text-[13px] font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
          style={{ backgroundColor: "#00775B" }}
        >
          View Projects
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
