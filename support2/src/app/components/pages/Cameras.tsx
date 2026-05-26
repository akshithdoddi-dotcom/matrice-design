import { useState, useMemo } from "react";
import {
  Search,
  Video,
  MapPin,
  Wifi,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Activity,
  FileText,
  Terminal,
} from "lucide-react";
import {
  Camera,
  CameraStatus,
  MOCK_PROJECTS,
  MOCK_CLUSTERS,
  Pipeline,
  Project,
  Account,
  Cluster,
} from "@/data/mockData";

// ── Design tokens ──────────────────────────────────────────────────────────────

const TEAL      = "#00775B";
const PANEL_BG  = "#FFFFFF";
const PANEL_SEP = "#E2E8F0";

const CAM_STATUS_CFG: Record<CameraStatus, {
  color: string; bg: string; label: string;
  connLabel: string; connBg: string; connColor: string;
  headerBg: string; Icon: React.ElementType;
}> = {
  online: {
    color: "#00843A", bg: "rgba(0,166,62,0.08)",
    label: "Active",
    connLabel: "CONNECTION STABLE", connBg: "rgba(0,166,62,0.10)", connColor: "#00843A",
    headerBg: "#00775B", Icon: CheckCircle,
  },
  degraded: {
    color: "#B45309", bg: "rgba(225,154,4,0.10)",
    label: "Degraded",
    connLabel: "CONNECTION DEGRADED", connBg: "rgba(225,154,4,0.10)", connColor: "#B45309",
    headerBg: "#B45309", Icon: AlertTriangle,
  },
  offline: {
    color: "#E7000B", bg: "rgba(231,0,11,0.08)",
    label: "Offline",
    connLabel: "CONNECTION LOST", connBg: "rgba(231,0,11,0.08)", connColor: "#E7000B",
    headerBg: "#E7000B", Icon: XCircle,
  },
};

// ── Helpers ────────────────────────────────────────────────────────────────────

interface FlatCamera {
  camera: Camera;
  pipeline: Pipeline;
  project: Project;
}

function getAllCameras(clusterIds: Set<string>): FlatCamera[] {
  const result: FlatCamera[] = [];
  const seen = new Set<string>();
  for (const project of MOCK_PROJECTS) {
    if (!clusterIds.has(project.clusterId)) continue;
    for (const pipeline of project.pipelines) {
      for (const camera of pipeline.cameras) {
        if (seen.has(camera.id)) continue;
        seen.add(camera.id);
        result.push({ camera, pipeline, project });
      }
    }
  }
  return result;
}

function shortCamId(camId: string): string {
  let n = 0;
  for (let i = 0; i < camId.length; i++) n = ((n * 31) + camId.charCodeAt(i)) >>> 0;
  return n.toString(16).padStart(8, "0").slice(0, 8);
}

function deriveProtocol(camId: string): string {
  const protocols = ["RTSP", "RTSP", "HTTP", "FILE", "RTSP"];
  return protocols[camId.charCodeAt(camId.length - 1) % protocols.length];
}

function deriveGatewayId(pipelineId: string): string {
  let n = 0;
  for (let i = 0; i < pipelineId.length; i++) n = ((n * 31) + pipelineId.charCodeAt(i)) >>> 0;
  return n.toString(16).padStart(22, "0").slice(0, 22);
}

interface MockLog {
  time: string;
  user: string;
  msg: string;
  status: "PENDING" | "SUCCESS" | "ERROR" | "WARNING";
}

function getMockLogs(camera: Camera): MockLog[] {
  if (camera.status === "offline") {
    return [
      { time: "May 21, 06:16 PM", user: "System",      msg: "Camera connection lost",      status: "ERROR"   },
      { time: "May 21, 06:14 PM", user: "System",      msg: "Attempting reconnection",     status: "PENDING" },
    ];
  }
  if (camera.status === "degraded") {
    return [
      { time: "May 21, 06:18 PM", user: "System",      msg: "Frame drop detected",         status: "WARNING" },
      { time: "May 21, 06:16 PM", user: "Sunny Gogoi", msg: "Application added to camera", status: "PENDING" },
    ];
  }
  return [
    { time: "May 21, 06:16 PM", user: "Sunny Gogoi", msg: "Application added to camera", status: "PENDING" },
    { time: "May 21, 05:30 PM", user: "System",      msg: "Camera came online",           status: "SUCCESS" },
  ];
}

// ── Left panel: camera card row ─────────────────────────────────────────────

interface CameraRowProps {
  flat: FlatCamera;
  isSelected: boolean;
  onClick: () => void;
}

function CameraRow({ flat, isSelected, onClick }: CameraRowProps) {
  const [hov, setHov] = useState(false);
  const { camera } = flat;
  const cfg = CAM_STATUS_CFG[camera.status];

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-full text-left transition-all duration-150"
      style={{
        padding: "10px 12px",
        backgroundColor: isSelected ? "rgba(0,119,91,0.06)" : hov ? "#F8FAFC" : "transparent",
        borderLeft: `2px solid ${isSelected ? TEAL : "transparent"}`,
        borderBottom: `1px solid ${PANEL_SEP}`,
      }}
    >
      <div className="flex items-start gap-2.5">
        {/* Camera icon */}
        <div
          className="flex items-center justify-center rounded-[6px] flex-shrink-0 mt-0.5"
          style={{ width: 28, height: 28, backgroundColor: isSelected ? cfg.bg : "#F1F5F9" }}
        >
          <Video style={{ width: 12, height: 12, color: isSelected ? cfg.color : "#94A3B8" }} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Name row */}
          <div className="flex items-center justify-between gap-1 mb-1">
            <span
              className="truncate leading-tight"
              style={{ fontSize: 12, fontWeight: 600, color: isSelected ? TEAL : "#0F172A" }}
            >
              {camera.name}
            </span>
            {/* Status dot */}
            <span
              style={{
                width: 7, height: 7, borderRadius: "50%",
                backgroundColor: cfg.color, flexShrink: 0,
              }}
            />
          </div>

          {/* Location */}
          <div className="flex items-center gap-1 mb-1.5">
            <MapPin style={{ width: 9, height: 9, color: "#CBD5E1", flexShrink: 0 }} />
            <span style={{ fontSize: 10, color: "#94A3B8" }}>{camera.location || "Unknown"}</span>
          </div>

          {/* Connection badge */}
          <span
            style={{
              display: "inline-block",
              fontSize: 9, fontWeight: 700,
              padding: "2px 6px", borderRadius: 3,
              backgroundColor: cfg.connBg, color: cfg.connColor,
              letterSpacing: "0.05em",
            }}
          >
            {cfg.connLabel}
          </span>
        </div>
      </div>
    </button>
  );
}

// ── Right panel: camera detail ─────────────────────────────────────────────

function CameraDetail({ flat }: { flat: FlatCamera }) {
  const { camera, pipeline } = flat;
  const cfg        = CAM_STATUS_CFG[camera.status];
  const StatusIcon = cfg.Icon;
  const protocol   = deriveProtocol(camera.id);
  const camId      = shortCamId(camera.id);
  const fullCamId  = `${camId}f363042d4d919803`;
  const gatewayId  = deriveGatewayId(pipeline.id);
  const logs       = getMockLogs(camera);
  const rtspAvail  = camera.status !== "offline";

  const LOG_BADGE: Record<MockLog["status"], { bg: string; color: string }> = {
    PENDING: { bg: "rgba(225,154,4,0.12)", color: "#B45309" },
    SUCCESS: { bg: "rgba(0,166,62,0.10)",  color: "#00843A" },
    ERROR:   { bg: "rgba(231,0,11,0.08)",  color: "#E7000B" },
    WARNING: { bg: "rgba(225,154,4,0.12)", color: "#B45309" },
  };

  return (
    <div className="flex-1 min-h-0 overflow-auto p-5 space-y-4">

      {/* ── Camera status card ─────────────────────────────────────── */}
        <div
          className="rounded-[8px] overflow-hidden"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          {/* Header */}
          <div
            className="flex items-center justify-between px-4 py-2.5"
            style={{ backgroundColor: cfg.headerBg }}
          >
            <div className="flex items-center gap-2">
              <Wifi style={{ width: 14, height: 14, color: "#fff" }} />
              <div>
                <div style={{ fontSize: 9, fontWeight: 700, color: "rgba(255,255,255,0.65)", letterSpacing: "0.07em" }}>
                  CAMERA STATUS
                </div>
                <div style={{ fontSize: 13, fontWeight: 700, color: "#fff" }}>{cfg.label}</div>
              </div>
            </div>
            <span
              className="flex items-center gap-1.5"
              style={{
                fontSize: 11, fontWeight: 600,
                padding: "4px 10px", borderRadius: 99,
                backgroundColor: "rgba(255,255,255,0.18)", color: "#fff",
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: "#fff", display: "inline-block" }} />
              {camera.status.charAt(0).toUpperCase() + camera.status.slice(1)}
            </span>
          </div>

          {/* Info grid */}
          <div className="p-4 grid grid-cols-2 gap-3">
            {([
              ["Location",   camera.location || "Unknown"   ],
              ["Camera ID",  camId                          ],
              ["Resolution", camera.resolution              ],
              ["Frame Rate", camera.fps > 0 ? `${camera.fps} fps` : "N/A"],
              ["Protocol",   protocol                       ],
              ["Uptime",     camera.status === "online" ? "Online" : camera.status === "degraded" ? "Degraded" : "Offline"],
            ] as [string, string][]).map(([label, value]) => (
              <div
                key={label}
                className="rounded-[6px] p-2.5"
                style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
              >
                <div style={{ fontSize: 9, color: "#94A3B8", marginBottom: 3, fontWeight: 600, letterSpacing: "0.05em" }}>
                  {label}
                </div>
                <div style={{
                  fontSize: 12, fontWeight: 600,
                  color: label === "Uptime" && camera.status === "online" ? "#00843A" : "#0F172A",
                }}>
                  {value}
                </div>
              </div>
            ))}
          </div>
        </div>

      {/* ── Bottom row: logs + technical details ───────────────────── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Camera Logs */}
        <div
          className="rounded-[8px] p-4"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <FileText style={{ width: 13, height: 13, color: TEAL }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Camera Logs</span>
          </div>
          <div className="space-y-2">
            {logs.map((log, i) => {
              const badge = LOG_BADGE[log.status];
              return (
                <div
                  key={i}
                  className="flex items-start justify-between px-3 py-2.5 rounded-[6px]"
                  style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
                >
                  <div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>
                      {log.time} • {log.user}
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 500, color: "#334155", marginTop: 2 }}>
                      {log.msg}
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: 9, fontWeight: 700,
                      padding: "2px 6px", borderRadius: 3,
                      backgroundColor: badge.bg, color: badge.color,
                      letterSpacing: "0.05em", flexShrink: 0, marginLeft: 8,
                    }}
                  >
                    {log.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Technical Details */}
        <div
          className="rounded-[8px] p-4"
          style={{ border: `1px solid ${PANEL_SEP}`, backgroundColor: "#fff" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Terminal style={{ width: 13, height: 13, color: TEAL }} />
            <span style={{ fontSize: 12, fontWeight: 700, color: "#0F172A" }}>Technical Details</span>
          </div>
          <div className="space-y-2.5">
            {([
              ["Camera ID",    fullCamId,                       true ],
              ["IP Address",   camera.ip || "N/A",              false],
              ["RTSP URL",     rtspAvail ? "Available" : "N/A", false],
              ["Gateway ID",   gatewayId,                       true ],
              ["Memory Usage", "N/A",                           false],
              ["Protocol",     protocol,                        false],
            ] as [string, string, boolean][]).map(([label, value, mono]) => (
              <div key={label} className="flex items-start gap-2">
                <span style={{ fontSize: 11, color: "#64748B", minWidth: 100, flexShrink: 0 }}>{label}:</span>
                <span style={{
                  fontSize: 11, fontWeight: 500, color: "#0F172A",
                  fontFamily: mono ? "monospace" : undefined,
                  wordBreak: "break-all",
                }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Cameras page ──────────────────────────────────────────────────────────────

interface CamerasProps {
  account?: Account | null;
  cluster?: Cluster | null;
}

type CamFilter = "all" | CameraStatus;

const CAM_FILTER_TABS: { id: CamFilter; label: string; dot?: string; activeBg: string }[] = [
  { id: "all",      label: "All",      activeBg: "#0F172A" },
  { id: "online",   label: "Online",   dot: "#00A63E", activeBg: "#00843A" },
  { id: "degraded", label: "Degraded", dot: "#E19A04", activeBg: "#B45309" },
  { id: "offline",  label: "Offline",  dot: "#E7000B", activeBg: "#E7000B" },
];

export function Cameras({ account, cluster }: CamerasProps) {
  const [query,        setQuery]        = useState("");
  const [statusFilter, setStatusFilter] = useState<CamFilter>("all");

  const clusterIds = useMemo(() => {
    if (cluster) return new Set([cluster.id]);
    if (account) {
      const ids = MOCK_CLUSTERS.filter((c) => c.accountId === account.id).map((c) => c.id);
      return new Set(ids);
    }
    return new Set(MOCK_PROJECTS.map((p) => p.clusterId));
  }, [account, cluster]);

  const allCameras = useMemo(() => getAllCameras(clusterIds), [clusterIds]);

  const baseFiltered = useMemo(
    () =>
      allCameras.filter((fc) =>
        fc.camera.name.toLowerCase().includes(query.toLowerCase()) ||
        fc.camera.location.toLowerCase().includes(query.toLowerCase())
      ),
    [allCameras, query]
  );

  const filtered = useMemo(
    () => statusFilter === "all" ? baseFiltered : baseFiltered.filter((fc) => fc.camera.status === statusFilter),
    [baseFiltered, statusFilter]
  );

  const statusCounts = useMemo(() => ({
    all:      baseFiltered.length,
    online:   baseFiltered.filter((fc) => fc.camera.status === "online").length,
    degraded: baseFiltered.filter((fc) => fc.camera.status === "degraded").length,
    offline:  baseFiltered.filter((fc) => fc.camera.status === "offline").length,
  }), [baseFiltered]);

  const [selectedId, setSelectedId] = useState<string>(() => filtered[0]?.camera.id ?? "");
  const selectedFlat = filtered.find((fc) => fc.camera.id === selectedId) ?? filtered[0] ?? null;

  return (
    <div className="flex h-full min-h-0 overflow-hidden">

      {/* ── LEFT: camera navigator ───────────────────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{ width: 300, backgroundColor: PANEL_BG, borderRight: `1px solid ${PANEL_SEP}` }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-2.5 px-3 flex-shrink-0"
          style={{ height: 44, borderBottom: `1px solid ${PANEL_SEP}`, backgroundColor: "#F8FAFC" }}
        >
          <Video style={{ width: 13, height: 13, color: TEAL, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", letterSpacing: "0.03em" }}>
            Cameras
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
              placeholder="Search cameras…"
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

        {/* Status filter tabs */}
        <div className="flex flex-wrap gap-1 px-3 py-2 flex-shrink-0" style={{ borderBottom: `1px solid ${PANEL_SEP}` }}>
          {CAM_FILTER_TABS.map((tab) => {
            const isActive   = statusFilter === tab.id;
            const count      = statusCounts[tab.id as keyof typeof statusCounts] ?? 0;
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

        {/* Camera list */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div style={{ padding: "48px 20px", textAlign: "center", fontSize: 12, color: "#94A3B8" }}>
              No cameras match "{query}"
            </div>
          ) : (
            filtered.map((flat) => (
              <CameraRow
                key={flat.camera.id}
                flat={flat}
                isSelected={flat.camera.id === selectedFlat?.camera.id}
                onClick={() => setSelectedId(flat.camera.id)}
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
            <Activity style={{ width: 10, height: 10, color: "#CBD5E1" }} />
            <span style={{ fontSize: 10, color: "#94A3B8" }}>
              {filtered.length} camera{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {selectedFlat && (
            <span
              style={{
                fontSize: 9, fontWeight: 600,
                padding: "2px 7px", borderRadius: 3,
                backgroundColor: "rgba(0,119,91,0.10)", color: TEAL,
                maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {selectedFlat.camera.name}
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT: camera detail ──────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
        {selectedFlat ? (
          <CameraDetail flat={selectedFlat} />
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center gap-3" style={{ color: "#94A3B8" }}>
            <Video style={{ width: 32, height: 32, opacity: 0.3 }} />
            <span style={{ fontSize: 13 }}>Select a camera to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}
