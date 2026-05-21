import { useState } from "react";
import { ChevronRight, Video, Brain } from "lucide-react";
import { Project, Pipeline, Camera, MLApp, Cluster, Account, CameraStatus, MLAppStatus } from "@/data/mockData";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";

// ── Design tokens ─────────────────────────────────────────────────────────────

const TEAL       = "#00775B";
const BORDER_CLR = "#E2E8F0";

// ── Status configs ─────────────────────────────────────────────────────────────

const CAM_CFG: Record<CameraStatus, { color: string; bg: string; label: string }> = {
  online:   { color: "#00A63E", bg: "rgba(0,166,62,0.10)",    label: "ONLINE"   },
  offline:  { color: "#E7000B", bg: "rgba(231,0,11,0.10)",    label: "OFFLINE"  },
  degraded: { color: "#E19A04", bg: "rgba(225,154,4,0.10)",   label: "DEGRADED" },
};

const ML_CFG: Record<MLAppStatus, { color: string; bg: string; label: string }> = {
  running:  { color: "#00A63E", bg: "rgba(0,166,62,0.10)",    label: "RUNNING"  },
  error:    { color: "#E7000B", bg: "rgba(231,0,11,0.10)",    label: "ERROR"    },
  stopped:  { color: "#94A3B8", bg: "rgba(100,116,139,0.10)", label: "STOPPED"  },
  starting: { color: "#2B7FFF", bg: "rgba(43,127,255,0.10)",  label: "STARTING" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatusPill({ label, color, bg }: { label: string; color: string; bg: string }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "2px 7px", borderRadius: 4, backgroundColor: bg, fontSize: 9, fontWeight: 700, color, letterSpacing: "0.04em", whiteSpace: "nowrap" }}>
      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-[7px] px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-white/80">{label}:</span>
      <span className="text-[12px] font-bold text-white">{value}</span>
    </div>
  );
}

// ── Column definitions ────────────────────────────────────────────────────────

const cameraCols: ColumnDef<Camera>[] = [
  {
    id: "name",
    header: "Camera",
    minWidth: 200,
    cell: ({ row }) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "rgba(0,119,91,0.08)", border: "1px solid rgba(0,119,91,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Video style={{ width: 14, height: 14, color: "#00775B" }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{row.mlApps.length} ML app{row.mlApps.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
    ),
  },
  {
    id: "ip",
    header: "IP Address",
    accessorKey: "ip",
    minWidth: 130,
    cell: ({ row }) => <span style={{ fontSize: 11, fontFamily: "monospace", color: "#94A3B8" }}>{row.ip}</span>,
  },
  {
    id: "location",
    header: "Location",
    accessorKey: "location",
    minWidth: 110,
    cell: ({ row }) => <span style={{ fontSize: 11, color: "#64748B" }}>{row.location}</span>,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    minWidth: 100,
    sortable: false,
    cell: ({ row }) => <StatusPill label={CAM_CFG[row.status].label} color={CAM_CFG[row.status].color} bg={CAM_CFG[row.status].bg} />,
  },
  {
    id: "fps",
    header: "FPS",
    accessorKey: "fps",
    minWidth: 60,
    align: "center",
    cell: ({ row }) => <span style={{ fontSize: 11, color: "#64748B" }}>{row.fps > 0 ? row.fps : "—"}</span>,
  },
  {
    id: "resolution",
    header: "Resolution",
    accessorKey: "resolution",
    minWidth: 90,
    cell: ({ row }) => <span style={{ fontSize: 11, color: "#64748B" }}>{row.resolution}</span>,
  },
  {
    id: "mlAppsCount",
    header: "ML Apps",
    minWidth: 70,
    align: "center",
    cell: ({ row }) => (
      <div style={{ display: "flex", justifyContent: "center" }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px",
          borderRadius: 4, fontSize: 10, fontWeight: 600,
          backgroundColor: row.mlApps.length > 0 ? "rgba(0,119,91,0.08)" : "#F8FAFC",
          color: row.mlApps.length > 0 ? "#00775B" : "#94A3B8",
        }}>
          <Brain style={{ width: 10, height: 10 }} />
          {row.mlApps.length}
        </span>
      </div>
    ),
  },
];

// ── ML App sub-table ──────────────────────────────────────────────────────────

const mlAppCols: ColumnDef<MLApp>[] = [
  {
    id: "name",
    header: "ML App",
    minWidth: 180,
    cell: ({ row }) => {
      const cfg = ML_CFG[row.status];
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Brain style={{ width: 11, height: 11, color: cfg.color }} />
          </div>
          <span style={{ fontSize: 12, fontWeight: 500, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{row.name}</span>
        </div>
      );
    },
  },
  {
    id: "model",
    header: "Model",
    accessorKey: "model",
    minWidth: 150,
    cell: ({ row }) => <span style={{ fontSize: 11, fontFamily: "monospace", color: "#64748B" }}>{row.model}</span>,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    minWidth: 100,
    sortable: false,
    cell: ({ row }) => {
      const cfg = ML_CFG[row.status];
      return <StatusPill label={cfg.label} color={cfg.color} bg={cfg.bg} />;
    },
  },
  {
    id: "latencyMs",
    header: "Latency",
    accessorKey: "latencyMs",
    minWidth: 80,
    cell: ({ row }) => <span style={{ fontSize: 11, color: "#64748B" }}>{row.latencyMs > 0 ? `${row.latencyMs} ms` : "—"}</span>,
  },
  {
    id: "accuracy",
    header: "Accuracy",
    accessorKey: "accuracy",
    minWidth: 80,
    cell: ({ row }) => <span style={{ fontSize: 11, color: row.accuracy > 0 ? "#334155" : "#94A3B8", fontWeight: row.accuracy > 0 ? 600 : 400 }}>{row.accuracy > 0 ? `${row.accuracy}%` : "—"}</span>,
  },
];

function MLAppSubTable({ camera }: { camera: Camera }) {
  return (
    <DataTable
      data={camera.mlApps}
      rowIdKey="id"
      columns={mlAppCols}
      toolbar={false}
      pagination="none"
      showRowCue={false}
      striped={false}
    />
  );
}

// ── Pipeline Detail page ───────────────────────────────────────────────────────

interface PipelineDetailProps {
  project: Project | null;
  pipeline: Pipeline | null;
  cluster: Cluster | null;
  account: Account | null;
  onBack: () => void;
  onBackToDesk?: () => void;
}

export function PipelineDetail({ project, pipeline, cluster, account, onBack, onBackToDesk }: PipelineDetailProps) {
  const [expandedCams, setExpandedCams] = useState<string[]>([]);

  if (!pipeline || !project) {
    return (
      <div className="flex items-center justify-center h-full text-[13px] text-[#94A3B8]">
        No pipeline selected.
      </div>
    );
  }

  const cameras = pipeline.cameras ?? [];
  const onlineCount  = cameras.filter((c) => c.status === "online").length;
  const issueCount   = cameras.filter((c) => c.status !== "online").length;
  const mlAppTotal   = cameras.reduce((sum, c) => sum + c.mlApps.length, 0);

  const allExpanded = cameras.length > 0 && expandedCams.length === cameras.length;

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between px-6 py-4 flex-shrink-0"
        style={{ backgroundColor: TEAL }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-2 rounded-full flex-shrink-0"
            style={{ height: 32, backgroundColor: pipeline.headerColor, borderRadius: 4 }}
          />
          <div>
            <div className="text-[15px] font-bold text-white leading-tight">{pipeline.name}</div>
            <div className="text-[11px] text-white/60 mt-0.5">{project.name}</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <StatChip label="Cameras"  value={String(cameras.length)} color="#2B7FFF" />
          <StatChip label="Online"   value={String(onlineCount)}    color="#00A63E" />
          {issueCount > 0 && <StatChip label="Issues" value={String(issueCount)} color="#E7000B" />}
          <StatChip label="ML Apps"  value={String(mlAppTotal)}     color="#8B5CF6" />
        </div>
      </div>

      {/* ── Body ──────────────────────────────────────────────────── */}
      <div className="flex-1 overflow-auto">
        {/* Breadcrumb */}
        <div
          className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] px-6 py-3 flex-wrap"
          style={{ borderBottom: `1px solid ${BORDER_CLR}`, backgroundColor: "#fff" }}
        >
          <button onClick={onBackToDesk ?? onBack} className="hover:text-[#00775B] transition-colors font-medium">
            Support Desk
          </button>
          <ChevronRight className="w-3 h-3" />
          {account && (
            <>
              <span className="truncate max-w-[120px]">{account.name}</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          {cluster && (
            <>
              <span className="font-mono truncate max-w-[140px]">{cluster.name}</span>
              <ChevronRight className="w-3 h-3" />
            </>
          )}
          <button onClick={onBack} className="hover:text-[#00775B] transition-colors font-medium truncate max-w-[160px]">
            {project.name}
          </button>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0F172A] font-medium truncate max-w-[160px]">{pipeline.name}</span>
        </div>

        {/* Section label */}
        <div className="flex items-center gap-2 px-6 pt-5 pb-3">
          <Video style={{ width: 14, height: 14, color: TEAL }} />
          <span className="text-[12px] font-bold text-[#0F172A]">Cameras</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]"
            style={{ backgroundColor: "rgba(0,119,91,0.08)", color: TEAL }}
          >
            {cameras.length}
          </span>
          {cameras.length > 0 && (
            <button
              onClick={() => setExpandedCams(allExpanded ? [] : cameras.map(c => c.id))}
              className="ml-auto text-[11px] font-medium transition-colors hover:text-[#00775B]"
              style={{ color: "#64748B" }}
            >
              {allExpanded ? "Collapse all" : "Expand all"}
            </button>
          )}
        </div>

        {/* Camera table */}
        <div className="mx-6 mb-6">
          <DataTable
            data={cameras}
            rowIdKey="id"
            columns={cameraCols}
            expandable
            isRowExpandable={(cam) => cam.mlApps.length > 0}
            renderExpandedRow={(cam) => <MLAppSubTable camera={cam} />}
            expandedRows={expandedCams}
            onExpandedRowsChange={(ids) => setExpandedCams(ids.map(id => String(id)))}
            toolbar={false}
            pagination="none"
            emptyState={{ title: "No cameras", description: "No cameras configured for this pipeline" }}
          />
        </div>
      </div>
    </div>
  );
}
