import { useState } from "react";
import { Video, Brain } from "lucide-react";
import { Project, Pipeline, Camera, MLApp, Cluster, Account, CameraStatus, MLAppStatus } from "@/data/mockData";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";

// ── Design tokens ─────────────────────────────────────────────────────────────

const TEAL       = "#00775B";
const BORDER_CLR = "#E2E8F0";

// ── Status configs ─────────────────────────────────────────────────────────────

const CAM_CFG: Record<CameraStatus, { color: string; bg: string; label: string }> = {
  online:   { color: "#00A63E", bg: "rgba(0,166,62,0.10)",    label: "ONLINE"   },
  offline:  { color: "#E7000B", bg: "rgba(231,0,11,0.10)",    label: "OFFLINE"  },
  degraded: { color: "#E19A04", bg: "rgba(225,154,4,0.10)",   label: "DEGRADED" },
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function StatChip({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-[7px] px-3 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: color }} />
      <span className="text-[11px] text-white/80">{label}:</span>
      <span className="text-[12px] font-bold text-white">{value}</span>
    </div>
  );
}

// ── Camera columns (DataGrid v2.3) ───────────────────────────────────────────

const cameraCols: DataGridColumn<Camera>[] = [
  {
    key: "name",
    header: "Camera",
    width: "minmax(180px, 2fr)",
    sortable: true,
    searchValue: (r) => r.name,
    render: (row, hovered) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{ width: 28, height: 28, borderRadius: 6, backgroundColor: "rgba(0,119,91,0.08)", border: "1px solid rgba(0,119,91,0.15)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <Video style={{ width: 14, height: 14, color: TEAL }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div><InterCell hovered={hovered} isPrimary>{row.name}</InterCell></div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>{row.mlApps.length} ML app{row.mlApps.length !== 1 ? "s" : ""}</div>
        </div>
      </div>
    ),
  },
  {
    key: "ip",
    header: "IP Address",
    width: "minmax(120px, 1fr)",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.ip}</MonoCell>,
  },
  {
    key: "location",
    header: "Location",
    width: "minmax(110px, 1fr)",
    render: (row, hovered) => <InterCell hovered={hovered}>{row.location}</InterCell>,
  },
  {
    key: "status",
    header: "Status",
    width: "100px",
    render: (row) => <StatusCapsule status={row.status} label={CAM_CFG[row.status].label} />,
  },
  {
    key: "fps",
    header: "FPS",
    width: "60px",
    align: "center",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.fps > 0 ? String(row.fps) : "—"}</MonoCell>,
  },
  {
    key: "resolution",
    header: "Resolution",
    width: "90px",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.resolution}</MonoCell>,
  },
  {
    key: "mlAppsCount",
    header: "ML Apps",
    width: "70px",
    align: "center",
    render: (row) => (
      <span style={{
        display: "inline-flex", alignItems: "center", gap: 3, padding: "2px 7px",
        borderRadius: 4, fontSize: 10, fontWeight: 600,
        backgroundColor: row.mlApps.length > 0 ? "rgba(0,119,91,0.08)" : "#F8FAFC",
        color: row.mlApps.length > 0 ? TEAL : "#94A3B8",
      }}>
        <Brain style={{ width: 10, height: 10 }} />
        {row.mlApps.length}
      </span>
    ),
  },
];

// ── ML App sub-table columns (DataGrid v2.3) ─────────────────────────────────

const ML_CFG: Record<MLAppStatus, { color: string; bg: string; label: string }> = {
  running:  { color: "#00A63E", bg: "rgba(0,166,62,0.10)",    label: "RUNNING"  },
  error:    { color: "#E7000B", bg: "rgba(231,0,11,0.10)",    label: "ERROR"    },
  stopped:  { color: "#94A3B8", bg: "rgba(100,116,139,0.10)", label: "STOPPED"  },
  starting: { color: "#2B7FFF", bg: "rgba(43,127,255,0.10)",  label: "STARTING" },
};

const mlAppCols: DataGridColumn<MLApp>[] = [
  {
    key: "name",
    header: "ML App",
    width: "minmax(180px, 2fr)",
    render: (row, hovered) => {
      const cfg = ML_CFG[row.status];
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <div style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: cfg.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Brain style={{ width: 11, height: 11, color: cfg.color }} />
          </div>
          <InterCell hovered={hovered} isPrimary>{row.name}</InterCell>
        </div>
      );
    },
  },
  {
    key: "model",
    header: "Model",
    width: "minmax(140px, 1.5fr)",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.model}</MonoCell>,
  },
  {
    key: "status",
    header: "Status",
    width: "100px",
    render: (row) => <StatusCapsule status={row.status} label={ML_CFG[row.status].label} />,
  },
  {
    key: "latencyMs",
    header: "Latency",
    width: "80px",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.latencyMs > 0 ? `${row.latencyMs} ms` : "—"}</MonoCell>,
  },
  {
    key: "accuracy",
    header: "Accuracy",
    width: "80px",
    render: (row, hovered) => (
      <MonoCell hovered={hovered} color={row.accuracy > 0 ? "#334155" : "#94A3B8"}>
        {row.accuracy > 0 ? `${row.accuracy}%` : "—"}
      </MonoCell>
    ),
  },
];

function MLAppSubGrid({ camera }: { camera: Camera }) {
  return (
    <DataGrid<MLApp>
      data={camera.mlApps}
      columns={mlAppCols}
      compact
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
  const [expandedCams, setExpandedCams] = useState<(string | number)[]>([]);

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

        {/* Camera table (DataGrid v2.3 with expandable ML Apps) */}
        <div className="mx-6 mb-6" style={{ border: `1px solid ${BORDER_CLR}`, borderRadius: 8, overflow: "hidden" }}>
          <DataGrid<Camera>
            data={cameras}
            columns={cameraCols}
            expandable
            isRowExpandable={(cam) => cam.mlApps.length > 0}
            renderExpandedRow={(cam) => <MLAppSubGrid camera={cam} />}
            expandedRowIds={expandedCams}
            onExpandedRowIdsChange={setExpandedCams}
            emptyState={<span style={{ fontSize: 12, color: "#94A3B8" }}>No cameras configured for this pipeline</span>}
          />
        </div>
      </div>
    </div>
  );
}
