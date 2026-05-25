import { useState, useMemo } from "react";
import {
  Search,
  Cpu,
  Activity,
  Database,
  HardDrive,
  MemoryStick,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MinusCircle,
  Box,
  Server,
  Zap,
} from "lucide-react";
import {
  MOCK_COMPUTE_INSTANCES,
  ComputeInstance,
  ComputeStatus,
  Account,
  Cluster,
  MOCK_CLUSTERS,
} from "@/data/mockData";

// ── Design tokens ──────────────────────────────────────────────────────────────

const TEAL       = "#00775B";
const PANEL_BG   = "#FFFFFF";
const PANEL_SEP  = "#E2E8F0";

const STATUS_CFG: Record<ComputeStatus, { color: string; bg: string; label: string; Icon: React.ElementType }> = {
  healthy:  { color: "#00843A", bg: "rgba(0,166,62,0.08)",   label: "Healthy",  Icon: CheckCircle   },
  warning:  { color: "#B45309", bg: "rgba(225,154,4,0.10)",  label: "Warning",  Icon: AlertTriangle },
  error:    { color: "#E7000B", bg: "rgba(231,0,11,0.08)",   label: "Error",    Icon: XCircle       },
  inactive: { color: "#64748B", bg: "rgba(100,116,139,0.08)",label: "Inactive", Icon: MinusCircle   },
};

const STATUS_BAR_COLOR: Record<ComputeStatus, string> = {
  healthy:  "#00A63E",
  warning:  "#E19A04",
  error:    "#E7000B",
  inactive: "#94A3B8",
};

// ── Utility ───────────────────────────────────────────────────────────────────

function utilLabel(pct: number): { label: string; color: string; bg: string } {
  if (pct >= 80) return { label: "HIGH",    color: "#E7000B", bg: "rgba(231,0,11,0.10)"  };
  if (pct >= 50) return { label: "MED",     color: "#B45309", bg: "rgba(225,154,4,0.10)" };
  return              { label: "LOW",    color: "#00843A", bg: "rgba(0,166,62,0.10)"  };
}

// ── Left panel — compute instance row ─────────────────────────────────────────

interface ComputeRowProps {
  instance: ComputeInstance;
  isSelected: boolean;
  onClick: () => void;
}

function ComputeRow({ instance, isSelected, onClick }: ComputeRowProps) {
  const [hov, setHov] = useState(false);
  const cfg = STATUS_CFG[instance.status];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-full flex items-center gap-2.5 text-left transition-all duration-150"
      style={{
        padding: "9px 12px",
        backgroundColor: isSelected ? "rgba(0,119,91,0.07)" : hov ? "#F8FAFC" : "transparent",
        borderLeft: `2px solid ${isSelected ? TEAL : "transparent"}`,
        borderBottom: `1px solid ${PANEL_SEP}`,
      }}
    >
      {/* status dot */}
      <div
        style={{
          width: 8, height: 8, borderRadius: "50%",
          backgroundColor: cfg.color, flexShrink: 0,
        }}
      />

      <div className="flex-1 min-w-0">
        <div
          className="truncate leading-tight"
          style={{
            fontSize: 12,
            color: isSelected ? TEAL : "#0F172A",
            fontWeight: isSelected ? 600 : 500,
          }}
        >
          {instance.name}
        </div>
        <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
          {instance.ip} · {instance.containers} container{instance.containers !== 1 ? "s" : ""}
        </div>
      </div>

      {/* mini resource pills */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {(["gpuUtil","cpuUtil","ramUtil"] as const).map((key) => {
          const pct = instance[key];
          const u = utilLabel(pct);
          return (
            <div
              key={key}
              title={`${key.replace("Util","").toUpperCase()}: ${pct}%`}
              style={{
                fontSize: 9, fontWeight: 700,
                padding: "1px 4px", borderRadius: 3,
                backgroundColor: u.bg, color: u.color,
              }}
            >
              {pct}%
            </div>
          );
        })}
      </div>
    </button>
  );
}

// ── Right panel — resource utilization bar ─────────────────────────────────────

function UtilBar({ label, pct }: { label: string; pct: number }) {
  const u = utilLabel(pct);
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{label}</span>
          <span
            style={{
              fontSize: 8, fontWeight: 700,
              padding: "1px 5px", borderRadius: 3,
              backgroundColor: u.bg, color: u.color,
              letterSpacing: "0.05em",
            }}
          >
            {u.label}
          </span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, fontFamily: "monospace", color: "#0F172A" }}>
          {pct}%
        </span>
      </div>
      <div style={{ height: 5, backgroundColor: "#F1F5F9", borderRadius: 99, overflow: "hidden" }}>
        <div
          style={{
            height: "100%",
            width: `${pct}%`,
            borderRadius: 99,
            backgroundColor: u.color,
            transition: "width 0.4s ease",
          }}
        />
      </div>
    </div>
  );
}

// ── Right panel — detail view ──────────────────────────────────────────────────

function ComputeDetail({ instance }: { instance: ComputeInstance }) {
  const status = STATUS_CFG[instance.status];
  const StatusIcon = status.Icon;
  const barColor   = STATUS_BAR_COLOR[instance.status];

  return (
    <div className="flex-1 min-h-0 overflow-auto p-5 space-y-4">

      {/* ── Status header ──────────────────────────────────────────────── */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-[8px]"
        style={{ backgroundColor: barColor }}
      >
        <StatusIcon style={{ width: 15, height: 15, color: "#fff", flexShrink: 0 }} />
        <span style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>
          Status — {status.label}
        </span>
      </div>

      {/* ── Instance info + GPU specs ───────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Instance details */}
        <div
          className="rounded-[8px] p-4"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              ["Instance ID",     instance.instanceId],
              ["Lease Type",      instance.leaseType],
              ["Instance Source", instance.instanceSource],
              ["Instance IP",     instance.ip],
              ["Containers",      String(instance.containers)],
              ["Last Updated",    instance.lastUpdated],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", fontFamily: label === "Instance ID" || label === "Instance IP" ? "monospace" : undefined }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* GPU / hardware specs */}
        <div
          className="rounded-[8px] p-4"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {[
              ["GPU",              instance.gpu       || "—"],
              ["GPU Provider",     instance.gpuProvider || "—"],
              ["GPU Architecture", instance.gpuArchitecture || "—"],
              ["Total Memory",     instance.totalMemory || "—"],
              ["CPU Architecture", instance.cpuArchitecture || "—"],
              ["CUDA Version",     instance.cudaVersion || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 2 }}>{label}</div>
                <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Resource Utilization ───────────────────────────────────────── */}
      <div
        className="rounded-[8px] p-4"
        style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Activity style={{ width: 13, height: 13, color: TEAL }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Resource Utilization</span>
          </div>
          <span style={{ fontSize: 10, color: "#94A3B8", fontStyle: "italic" }}>Sorted by usage</span>
        </div>

        <div className="space-y-3 mb-4">
          <UtilBar label="GPU" pct={instance.gpuUtil} />
          <UtilBar label="CPU" pct={instance.cpuUtil} />
          <UtilBar label="RAM" pct={instance.ramUtil} />
        </div>

        {/* Available resources */}
        <div style={{ borderTop: `1px solid ${PANEL_SEP}`, paddingTop: 12 }}>
          <div style={{ fontSize: 10, color: "#94A3B8", marginBottom: 8 }}>Available Resources</div>
          <div className="grid grid-cols-3 gap-3">
            {[
              { icon: Cpu,        label: "CPU",     value: String(instance.cpuCores) },
              { icon: MemoryStick, label: "MEMORY",  value: `${instance.memoryGB} GB` },
              { icon: HardDrive,  label: "STORAGE", value: instance.storageGB > 0 ? `${instance.storageGB.toLocaleString()} GB` : "0 GB" },
            ].map(({ icon: Icon, label, value }) => (
              <div
                key={label}
                className="rounded-[6px] p-3 text-center"
                style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
              >
                <div style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", marginBottom: 4 }}>{label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: "#0F172A", fontFamily: "monospace" }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Container Resources + DB Connections ──────────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Containers */}
        <div
          className="rounded-[8px] p-4"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Box style={{ width: 13, height: 13, color: TEAL }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Container Resources</span>
            </div>
            <span
              style={{
                fontSize: 9, fontWeight: 700,
                padding: "2px 6px", borderRadius: 3,
                backgroundColor: "#F1F5F9", color: "#64748B",
              }}
            >
              {instance.containerList.length} CONTAINERS
            </span>
          </div>

          {instance.containerList.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Box style={{ width: 24, height: 24, color: "#CBD5E1" }} />
              <span style={{ fontSize: 11, color: "#94A3B8" }}>No container metrics available</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {/* header */}
              <div className="grid gap-2 pb-1.5" style={{ gridTemplateColumns: "1fr 40px 40px 40px", borderBottom: `1px solid ${PANEL_SEP}` }}>
                {["Container","CPU","RAM","GPU"].map((h) => (
                  <span key={h} style={{ fontSize: 9, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.07em", textAlign: h === "Container" ? "left" : "center" }}>{h}</span>
                ))}
              </div>
              {instance.containerList.map((c) => (
                <div key={c.id} className="grid gap-2 items-center" style={{ gridTemplateColumns: "1fr 40px 40px 40px" }}>
                  <div className="flex items-center gap-1.5 min-w-0">
                    <div style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: c.status === "running" ? "#00A63E" : "#E7000B", flexShrink: 0 }} />
                    <span style={{ fontSize: 11, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.name}</span>
                  </div>
                  {[c.cpuUtil, c.ramUtil, c.gpuUtil].map((v, i) => (
                    <span key={i} style={{ fontSize: 11, fontWeight: 600, fontFamily: "monospace", color: v > 70 ? "#E7000B" : "#334155", textAlign: "center" }}>{v}%</span>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Database connections */}
        <div
          className="rounded-[8px] p-4"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Database style={{ width: 13, height: 13, color: TEAL }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Database Connections</span>
          </div>

          {instance.dbConnections.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 gap-2">
              <Database style={{ width: 24, height: 24, color: "#CBD5E1" }} />
              <span style={{ fontSize: 11, color: "#94A3B8" }}>No connections configured</span>
            </div>
          ) : (
            <div className="space-y-1.5">
              {instance.dbConnections.map((db) => {
                const isRunning = db.status === "running";
                const isError   = db.status === "error";
                return (
                  <div
                    key={db.port}
                    className="flex items-center justify-between px-3 py-2 rounded-[6px]"
                    style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
                  >
                    <span style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", fontFamily: "monospace" }}>
                      Port {db.port}
                    </span>
                    <span
                      style={{
                        fontSize: 9, fontWeight: 700,
                        padding: "2px 7px", borderRadius: 3,
                        backgroundColor: isError ? "rgba(231,0,11,0.08)" : isRunning ? "rgba(0,166,62,0.08)" : "#F1F5F9",
                        color: isError ? "#E7000B" : isRunning ? "#00843A" : "#64748B",
                      }}
                    >
                      {db.status.toUpperCase()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Compute page ───────────────────────────────────────────────────────────────

interface ComputeProps {
  account?: Account | null;
  cluster?: Cluster | null;
}

type StatusFilter = "all" | ComputeStatus;

const STATUS_TABS: { id: StatusFilter; label: string; dot?: string; activeBg: string }[] = [
  { id: "all",      label: "All",      activeBg: "#0F172A" },
  { id: "healthy",  label: "Healthy",  dot: "#00A63E", activeBg: "#00843A" },
  { id: "warning",  label: "Warning",  dot: "#E19A04", activeBg: "#B45309" },
  { id: "error",    label: "Error",    dot: "#E7000B", activeBg: "#E7000B" },
  { id: "inactive", label: "Inactive", dot: "#94A3B8", activeBg: "#475569" },
];

export function Compute({ account, cluster }: ComputeProps) {
  const [query,        setQuery]        = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Filter instances to the selected cluster (or account's clusters if no cluster)
  const clusterIds = useMemo(() => {
    if (cluster) return new Set([cluster.id]);
    if (account) {
      const ids = MOCK_CLUSTERS.filter((c) => c.accountId === account.id).map((c) => c.id);
      return new Set(ids);
    }
    return new Set(MOCK_COMPUTE_INSTANCES.map((i) => i.clusterId));
  }, [account, cluster]);

  const baseFiltered = useMemo(
    () =>
      MOCK_COMPUTE_INSTANCES.filter(
        (i) =>
          clusterIds.has(i.clusterId) &&
          i.name.toLowerCase().includes(query.toLowerCase())
      ),
    [clusterIds, query]
  );

  const filtered = useMemo(
    () => statusFilter === "all" ? baseFiltered : baseFiltered.filter((i) => i.status === statusFilter),
    [baseFiltered, statusFilter]
  );

  const statusCounts = useMemo(() => ({
    all:      baseFiltered.length,
    healthy:  baseFiltered.filter((i) => i.status === "healthy").length,
    warning:  baseFiltered.filter((i) => i.status === "warning").length,
    error:    baseFiltered.filter((i) => i.status === "error").length,
    inactive: baseFiltered.filter((i) => i.status === "inactive").length,
  }), [baseFiltered]);

  const [selectedId, setSelectedId] = useState<string>(() => filtered[0]?.id ?? "");

  // Keep selectedId valid when filter changes
  const selectedInstance = filtered.find((i) => i.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">

      {/* ── LEFT: instance navigator ─────────────────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 300, backgroundColor: PANEL_BG, borderRight: `1px solid ${PANEL_SEP}` }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-3 flex-shrink-0"
          style={{ height: 44, borderBottom: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
        >
          <Server style={{ width: 13, height: 13, color: TEAL, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", letterSpacing: "0.03em" }}>
            Compute
          </span>
          <span
            style={{
              marginLeft: "auto", fontSize: 9, fontWeight: 700,
              padding: "2px 6px", borderRadius: 4,
              backgroundColor: "rgba(0,119,91,0.10)", color: TEAL,
            }}
          >
            {baseFiltered.length}
          </span>
        </div>

        {/* Search */}
        <div className="px-3 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${PANEL_SEP}` }}>
          <div className="relative">
            <Search style={{ position: "absolute", left: 9, top: "50%", transform: "translateY(-50%)", width: 12, height: 12, color: "#94A3B8" }} />
            <input
              type="text"
              placeholder="Search instances…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%", height: 32, paddingLeft: 28, paddingRight: 10,
                backgroundColor: "#fff", border: "1px solid #E2E8F0",
                borderRadius: 6, fontSize: 11, color: "#0F172A", outline: "none",
              }}
              className="placeholder:text-slate-400 focus:border-[#00775B] transition-colors"
            />
          </div>
        </div>

        {/* Status filter */}
        <div className="flex flex-wrap gap-1 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${PANEL_SEP}` }}>
          {STATUS_TABS.map((tab) => {
            const isActive   = statusFilter === tab.id;
            const count      = statusCounts[tab.id] ?? 0;
            const isDisabled = count === 0 && tab.id !== "all";
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setStatusFilter(tab.id)}
                disabled={isDisabled}
                style={{
                  height: 22, padding: "0 8px",
                  borderRadius: 4, fontSize: 10, fontWeight: 600,
                  backgroundColor: isActive ? tab.activeBg : "transparent",
                  color: isActive ? "#fff" : isDisabled ? "#CBD5E1" : "#64748B",
                  border: "1px solid",
                  borderColor: isActive ? "transparent" : "#E2E8F0",
                  cursor: isDisabled ? "not-allowed" : "pointer",
                  display: "flex", alignItems: "center", gap: 4,
                  transition: "all 0.12s",
                }}
              >
                {tab.dot && (
                  <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: isActive ? "#fff" : tab.dot }} />
                )}
                {tab.label}
                <span style={{ fontSize: 9, opacity: 0.75 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* Instance list */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 12, color: "#94A3B8" }}>
              No instances match "{query}"
            </div>
          ) : (
            filtered.map((instance) => (
              <ComputeRow
                key={instance.id}
                instance={instance}
                isSelected={instance.id === selectedInstance?.id}
                onClick={() => setSelectedId(instance.id)}
              />
            ))
          )}
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-3 flex-shrink-0"
          style={{ height: 34, borderTop: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
        >
          <div className="flex items-center gap-1.5">
            <Zap style={{ width: 10, height: 10, color: "#CBD5E1" }} />
            <span style={{ fontSize: 10, color: "#94A3B8" }}>
              {filtered.length} instance{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {selectedInstance && (
            <span
              style={{
                fontSize: 9, fontWeight: 600,
                padding: "2px 7px", borderRadius: 3,
                backgroundColor: "rgba(0,119,91,0.10)", color: TEAL,
                maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {selectedInstance.name}
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT: instance detail ───────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
        {selectedInstance ? (
          <ComputeDetail instance={selectedInstance} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "#94A3B8" }}>
            <Server style={{ width: 32, height: 32, opacity: 0.3 }} />
            <span style={{ fontSize: 13 }}>Select an instance to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}
