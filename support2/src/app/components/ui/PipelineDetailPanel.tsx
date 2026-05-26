import { useState } from "react";
import { Video, Brain, ChevronLeft } from "lucide-react";
import { Pipeline, Project, Camera, MLApp, CameraStatus, MLAppStatus } from "@/data/mockData";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";

// ── Design tokens ─────────────────────────────────────────────────────────────

const TEAL       = "#00775B";
const BORDER_CLR = "#E2E8F0";

// ── Status configs ─────────────────────────────────────────────────────────────

const CAM_CFG: Record<CameraStatus, { color: string; bg: string; label: string }> = {
  online:   { color: "#00A63E", bg: "rgba(0,166,62,0.10)",   label: "ONLINE"   },
  offline:  { color: "#E7000B", bg: "rgba(231,0,11,0.10)",   label: "OFFLINE"  },
  degraded: { color: "#E19A04", bg: "rgba(225,154,4,0.10)",  label: "DEGRADED" },
};

const ML_CFG: Record<MLAppStatus, { color: string; bg: string; label: string }> = {
  running:  { color: "#00A63E", bg: "rgba(0,166,62,0.10)",    label: "RUNNING"  },
  error:    { color: "#E7000B", bg: "rgba(231,0,11,0.10)",    label: "ERROR"    },
  stopped:  { color: "#94A3B8", bg: "rgba(100,116,139,0.10)", label: "STOPPED"  },
  starting: { color: "#2B7FFF", bg: "rgba(43,127,255,0.10)",  label: "STARTING" },
};


// ── Camera columns (DataGrid v2.3) ─────────────────────────────────────────────

const cameraCols: DataGridColumn<Camera>[] = [
  {
    key: "name",
    header: "Camera",
    width: "minmax(160px, 2fr)",
    sortable: true,
    searchValue: (r) => r.name,
    render: (row, hovered) => (
      <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          backgroundColor: "rgba(0,119,91,0.08)", border: "1px solid rgba(0,119,91,0.15)",
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <Video style={{ width: 14, height: 14, color: TEAL }} />
        </div>
        <div style={{ minWidth: 0 }}>
          <div><InterCell hovered={hovered} isPrimary>{row.name}</InterCell></div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 1 }}>
            {row.mlApps.length} ML app{row.mlApps.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>
    ),
  },
  {
    key: "ip",
    header: "IP Address",
    width: "minmax(110px, 1fr)",
    render: (row, hovered) => <MonoCell hovered={hovered}>{row.ip}</MonoCell>,
  },
  {
    key: "location",
    header: "Location",
    width: "minmax(100px, 1fr)",
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

// ── ML App sub-table columns (DataGrid v2.3) ───────────────────────────────────

const mlAppCols: DataGridColumn<MLApp>[] = [
  {
    key: "name",
    header: "ML App",
    width: "minmax(160px, 2fr)",
    render: (row, hovered) => {
      const cfg = ML_CFG[row.status];
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 7, minWidth: 0 }}>
          <div style={{
            width: 22, height: 22, borderRadius: 5, backgroundColor: cfg.bg,
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
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
    width: "minmax(130px, 1.5fr)",
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

// Issue 2.3: ML app sub-table wrapped in a labeled card with colored left border
// to visually disambiguate from camera rows in the parent table

function MLAppSubGrid({ camera }: { camera: Camera }) {
  return (
    <div style={{ borderLeft: `3px solid ${TEAL}`, backgroundColor: "#F0FDF9" }}>
      {/* Card header: "ML Apps N" label */}
      <div style={{
        padding: "8px 16px 6px",
        display: "flex", alignItems: "center", gap: 6,
        borderBottom: "1px solid rgba(0,119,91,0.12)",
      }}>
        <Brain style={{ width: 11, height: 11, color: TEAL }} />
        <span style={{
          fontSize: 10, fontWeight: 700, color: TEAL,
          textTransform: "uppercase", letterSpacing: "0.06em",
        }}>
          ML Apps
        </span>
        <span style={{
          fontSize: 9, fontWeight: 700, padding: "1px 5px",
          borderRadius: 3, backgroundColor: "rgba(0,119,91,0.12)", color: TEAL,
        }}>
          {camera.mlApps.length}
        </span>
      </div>
      <DataGrid<MLApp> data={camera.mlApps} columns={mlAppCols} compact />
    </div>
  );
}

// ── PipelineDetailPanel ────────────────────────────────────────────────────────

export interface PipelineDetailPanelProps {
  pipeline: Pipeline;
  project: Project;
  // Issue 1.3 + 2.1 + 3.6 + 4.1: close callback — rendered as labeled pill in teal header
  onClose?: () => void;
}

export function PipelineDetailPanel({ pipeline, project, onClose }: PipelineDetailPanelProps) {
  const [expandedCams, setExpandedCams] = useState<(string | number)[]>([]);

  const cameras        = pipeline.cameras ?? [];
  const onlineCount    = cameras.filter((c) => c.status === "online").length;
  const mlAppTotal     = cameras.reduce((sum, c) => sum + c.mlApps.length, 0);

  // Issue 1.4: Specific status counts instead of the vague "Issues" label
  const degradedCount  = cameras.filter((c) => c.status === "degraded").length;
  const offlineCount   = cameras.filter((c) => c.status === "offline").length;

  // Issue 4.4: Three-state expand button
  const expandableIds  = cameras.filter((c) => c.mlApps.length > 0).map((c) => c.id);
  const expandableCount = expandableIds.length;
  const allExpanded    = expandableCount > 0 && expandedCams.length >= expandableCount;
  const partialExpand  = expandedCams.length > 0 && expandedCams.length < expandableCount;

  const expandLabel = allExpanded
    ? "Collapse all"
    : partialExpand
      ? `Expand remaining (${expandableCount - expandedCams.length})`
      : "Expand all";

  const handleExpandToggle = () => {
    if (allExpanded) {
      setExpandedCams([]);
    } else {
      // Expand only the not-yet-expanded rows
      const alreadyOpen = new Set(expandedCams);
      const toOpen = expandableIds.filter((id) => !alreadyOpen.has(id));
      setExpandedCams([...expandedCams, ...toOpen]);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Pipeline header ── clean light strip with pipeline colour accent */}
      <div
        className="flex items-center justify-between flex-shrink-0"
        style={{
          backgroundColor: "#fff",
          borderBottom: `1px solid ${BORDER_CLR}`,
          borderLeft: `3px solid ${pipeline.headerColor}`,
          padding: "10px 16px 10px 14px",
          minHeight: 52,
        }}
      >
        {/* Name + project */}
        <div className="flex items-center gap-2.5 min-w-0">
          {onClose && (
            <button
              onClick={onClose}
              className="flex items-center gap-1 flex-shrink-0 transition-colors"
              style={{
                padding: "4px 8px", borderRadius: 5,
                backgroundColor: "#F1F5F9",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                fontSize: 11, fontWeight: 600, cursor: "pointer",
              }}
              onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#E2E8F0"; }}
              onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = "#F1F5F9"; }}
            >
              <ChevronLeft style={{ width: 11, height: 11 }} />
            </button>
          )}
          <div className="min-w-0">
            <div className="text-[13px] font-bold text-[#0F172A] truncate leading-tight">{pipeline.name}</div>
            <div className="text-[10px] text-[#94A3B8] mt-0.5 truncate">{project.name}</div>
          </div>
        </div>

        {/* Compact inline stats */}
        <div className="flex items-center gap-3 flex-shrink-0 text-[11px]">
          <span style={{ color: "#64748B" }}>
            <span className="font-semibold text-[#0F172A]">{cameras.length}</span> cam{cameras.length !== 1 ? "s" : ""}
          </span>
          <span style={{ color: "#64748B" }}>
            <span className="font-semibold" style={{ color: "#00A63E" }}>{onlineCount}</span> online
          </span>
          {degradedCount > 0 && (
            <span title={`${degradedCount} camera${degradedCount > 1 ? "s" : ""} degraded`} style={{ color: "#B45309" }}>
              <span className="font-semibold">{degradedCount}</span> degraded
            </span>
          )}
          {offlineCount > 0 && (
            <span title={`${offlineCount} camera${offlineCount > 1 ? "s" : ""} offline`} style={{ color: "#E7000B" }}>
              <span className="font-semibold">{offlineCount}</span> offline
            </span>
          )}
          <span style={{ color: "#64748B" }}>
            <span className="font-semibold text-[#7C3AED]">{mlAppTotal}</span> ML app{mlAppTotal !== 1 ? "s" : ""}
          </span>
        </div>
      </div>

      {/* Camera section */}
      <div className="flex-1 overflow-auto p-5">
        <div className="flex items-center gap-2 mb-3">
          <Video style={{ width: 13, height: 13, color: TEAL }} />
          <span className="text-[12px] font-bold text-[#0F172A]">Cameras</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-[3px]"
            style={{ backgroundColor: "rgba(0,119,91,0.08)", color: TEAL }}
          >
            {cameras.length}
          </span>
          {/* Issue 4.4: Three-state expand button */}
          {expandableCount > 0 && (
            <button
              onClick={handleExpandToggle}
              className="ml-auto text-[11px] font-medium transition-colors hover:text-[#00775B]"
              style={{ color: "#64748B" }}
            >
              {expandLabel}
            </button>
          )}
        </div>

        <div style={{ border: `1px solid ${BORDER_CLR}`, borderRadius: 8, overflow: "hidden" }}>
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
