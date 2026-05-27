import { useState, useMemo } from "react";
import {
  Search, ChevronUp, ChevronDown, Camera as CameraIcon,
  Cpu, Brain, MapPin, CheckCircle, AlertTriangle, X,
  User, Calendar, Hash, Bell, PhoneCall,
  Wifi, Monitor, Layers, ExternalLink, Activity,
  Clock, Shield, Server as ServerIcon,
  Database, HardDrive, Zap, Container, Play, Square,
  MemoryStick, GitBranch, Package,
} from "lucide-react";
import { DataTable } from "@fe-common/components/ui/data-table";
import type { ColumnDef } from "@fe-common/components/ui/data-table";
import {
  Pipeline, Project, Cluster, Account,
  MOCK_COMPUTE_INSTANCES,
  Camera, MLApp, MLAppStatus, CameraStatus,
  ComputeInstance,
} from "@/data/mockData";

// ── Tokens ────────────────────────────────────────────────────────────────────

const TEAL   = "#00775B";
const GREEN  = "#00A63E";
const AMBER  = "#F59E0B";
const RED    = "#E7000B";
const GREY   = "#64748B";

// ── Mock log data ─────────────────────────────────────────────────────────────

// ── Log row types ─────────────────────────────────────────────────────────────

interface PipelineLogRow {
  id: string;
  ts: string;
  pipelineName: string;
  action: string;
  details: string;
  user: string;
  prevState: string;
  newState: string;
}

interface CamLogRow {
  id: string;
  ts: string;
  camName: string;
  action: string;
  details: string;
  user: string;
  status: string;
}

const PIPELINE_LOGS: PipelineLogRow[] = [
  { id: "pl1", ts: "26/05/2026, 17:15:07", pipelineName: "Inference Pipeline A", action: "Stopped",  details: "Pipeline stopped",  user: "Pratik Raje", prevState: "Active",  newState: "Stopped" },
  { id: "pl2", ts: "26/05/2026, 16:20:10", pipelineName: "Inference Pipeline A", action: "Started",  details: "Pipeline started",  user: "Pratik Raje", prevState: "Stopped", newState: "Active"  },
  { id: "pl3", ts: "26/05/2026, 16:15:57", pipelineName: "Inference Pipeline A", action: "Stopped",  details: "Pipeline stopped",  user: "Pratik Raje", prevState: "Active",  newState: "Stopped" },
  { id: "pl4", ts: "25/05/2026, 23:08:01", pipelineName: "Inference Pipeline A", action: "Started",  details: "Pipeline started",  user: "Pratik Raje", prevState: "Stopped", newState: "Active"  },
  { id: "pl5", ts: "25/05/2026, 21:59:02", pipelineName: "Inference Pipeline A", action: "Stopped",  details: "Pipeline stopped",  user: "Pratik Raje", prevState: "Active",  newState: "Stopped" },
  { id: "pl6", ts: "25/05/2026, 15:44:49", pipelineName: "Inference Pipeline A", action: "Started",  details: "Pipeline started",  user: "Pratik Raje", prevState: "Stopped", newState: "Active"  },
  { id: "pl7", ts: "25/05/2026, 15:44:29", pipelineName: "Inference Pipeline A", action: "Created",  details: "Pipeline created",  user: "Pratik Raje", prevState: "—",       newState: "Created" },
];

const CAM_LOGS: CamLogRow[] = [
  { id: "cl1", ts: "25/04/2026, 13:21:06", camName: "Main-Entrance-PTZ", action: "Added",   details: "Application added to camera",                                          user: "John Doe", status: "In Use" },
  { id: "cl2", ts: "25/04/2026, 13:13:58", camName: "Main-Entrance-PTZ", action: "Removed", details: "Application removed from camera or may be assigned to other pipelines", user: "John Doe", status: "—"      },
  { id: "cl3", ts: "25/04/2026, 12:58:02", camName: "Main-Entrance-PTZ", action: "Added",   details: "Application added to camera",                                          user: "John Doe", status: "In Use" },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function actionBadge(action: string) {
  const cfg: Record<string, { bg: string; text: string }> = {
    Started: { bg: "rgba(0,166,62,0.12)",  text: GREEN  },
    Active:  { bg: "rgba(0,166,62,0.12)",  text: GREEN  },
    Created: { bg: "rgba(0,166,62,0.12)",  text: GREEN  },
    "In Use":{ bg: "rgba(0,166,62,0.12)",  text: GREEN  },
    Added:   { bg: "rgba(0,166,62,0.12)",  text: GREEN  },
    Stopped: { bg: "rgba(231,0,11,0.10)",  text: RED    },
    Removed: { bg: "rgba(100,116,139,0.1)",text: GREY   },
    "—":     { bg: "transparent",          text: GREY   },
  };
  const c = cfg[action] ?? { bg: "#F1F5F9", text: GREY };
  return (
    <span className="px-2.5 py-1 rounded text-[12px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {action}
    </span>
  );
}

// ── Camera status helpers ─────────────────────────────────────────────────────

const CAM_STATUS: Record<CameraStatus, { color: string; label: string; connLabel: string }> = {
  online:   { color: GREEN, label: "Online",   connLabel: "CONNECTION STABLE"   },
  degraded: { color: AMBER, label: "Degraded", connLabel: "CONNECTION DEGRADED" },
  offline:  { color: RED,   label: "Offline",  connLabel: "CONNECTION LOST"     },
};

const ML_STATUS: Record<MLAppStatus, { color: string; border: string; label: string }> = {
  running:  { color: GREEN, border: GREEN, label: "RUNNING"  },
  error:    { color: RED,   border: RED,   label: "ERROR"    },
  stopped:  { color: GREY,  border: GREY,  label: "STOPPED"  },
  starting: { color: AMBER, border: AMBER, label: "PENDING"  },
};

// ── Collapsible section ───────────────────────────────────────────────────────

function Section({
  icon: Icon, iconBg, iconColor, title, badge,
  defaultOpen = true, children,
}: {
  icon: React.ElementType; iconBg: string; iconColor: string;
  title: string; badge?: React.ReactNode;
  defaultOpen?: boolean; children: React.ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="bg-white rounded overflow-hidden mb-3 shadow-sm"
      style={{ border: "1px solid #E5E7EB" }}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50/70 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: iconBg }}>
            <Icon style={{ width: 19, height: 19, color: iconColor }} />
          </div>
          <span className="text-[15px] font-semibold text-gray-900">{title}</span>
        </div>
        <div className="flex items-center gap-3">
          {badge}
          {open
            ? <ChevronUp className="w-4 h-4 text-gray-300" />
            : <ChevronDown className="w-4 h-4 text-gray-300" />
          }
        </div>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-2 border-t border-gray-100">
          {children}
        </div>
      )}
    </div>
  );
}

function CountBadge({ active, total }: { active: number; total: number }) {
  const allGood = total === 0 || active === total;
  const none    = total > 0 && active === 0;
  const bg      = allGood ? "#F0FDF4" : none ? "#FFF5F5" : "#FFFBEB";
  const color   = allGood ? GREEN     : none ? RED       : AMBER;
  const border  = allGood ? `${GREEN}30` : none ? `${RED}30` : `${AMBER}30`;
  return (
    <span className="text-[11px] font-bold px-3 py-1 rounded"
      style={{ backgroundColor: bg, color, border: `1px solid ${border}` }}>
      {active}/{total} Active
    </span>
  );
}

// ── Camera Detail Modal ───────────────────────────────────────────────────────

function CameraDetailModal({ cam, pipeline, project, account, onClose }: {
  cam: Camera; pipeline: Pipeline; project: Project; account: Account | null; onClose: () => void;
}) {
  const [notifyOpen,   setNotifyOpen]   = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);

  const cfg = CAM_STATUS[cam.status];
  const camLogs = CAM_LOGS.filter((l) => l.camName === cam.name);

  // Mock extended details
  const techDetails = [
    { label: "Camera ID",         value: cam.id,                      mono: true  },
    { label: "Feed Path",         value: `/feeds/${cam.id}/stream`,    mono: true  },
    { label: "Stream URL",        value: `rtsp://${cam.ip}/stream1`,   mono: true  },
    { label: "Protocol",          value: "RTSP",                       mono: false },
    { label: "Codec",             value: "H.264",                      mono: false },
    { label: "Memory Usage",      value: "128 MB",                     mono: false },
    { label: "Gateway ID",        value: `gw-${cam.id.slice(-4)}`,     mono: true  },
    { label: "LAN ID",            value: `lan-${cam.id.slice(-4)}`,    mono: true  },
    { label: "Media Storage ID",  value: `ms-${cam.id.slice(-4)}`,     mono: true  },
    { label: "Location ID",       value: `loc-${cam.id.slice(-4)}`,    mono: true  },
    { label: "Current Compute",   value: "compute-node-01",            mono: true  },
    { label: "Primary Compute",   value: "compute-node-01",            mono: true  },
    { label: "Secondary Compute", value: "compute-node-02",            mono: true  },
    { label: "Created",           value: "12/01/2026, 09:14:22",       mono: false },
    { label: "Updated",           value: "26/05/2026, 17:00:00",       mono: false },
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}
    >
      {/* Drawer panel */}
      <div
        className="relative bg-white flex flex-col h-full overflow-hidden"
        style={{ width: 560, maxWidth: "92vw", borderLeft: "1px solid #E5E7EB" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ── */}
        <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
          <div className="flex items-start justify-between gap-4 mb-3">
            <div className="min-w-0">
              <div className="flex items-center gap-2 mb-0.5">
                <span
                  className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide"
                  style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}
                >
                  {cfg.label.toUpperCase()}
                </span>
                <span className="text-[10px] text-gray-400 uppercase tracking-wide">Video Source</span>
              </div>
              <div className="text-[18px] font-bold text-gray-900 truncate">{cam.name}</div>
              {cam.location && (
                <div className="flex items-center gap-1 mt-0.5">
                  <MapPin style={{ width: 11, height: 11, color: "#94A3B8" }} />
                  <span className="text-[12px] text-gray-500">{cam.location}</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0"
            >
              <X className="w-4 h-4 text-gray-500" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setNotifyOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
              style={{ border: "1px solid #D1D5DB" }}>
              <Bell style={{ width: 13, height: 13 }} />
              Notify Client
            </button>
            <button onClick={() => setEscalateOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: TEAL }}>
              <PhoneCall style={{ width: 13, height: 13 }} />
              Escalate
            </button>
            <span className="ml-auto text-[11px] font-bold px-2.5 py-1 rounded"
              style={{ backgroundColor: `${cfg.color}10`, color: cfg.color, border: `1px solid ${cfg.color}30` }}>
              {cam.status === "online" ? "● Video stream available" : "● Stream unavailable"}
            </span>
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: "#F8FAFC" }}>

          {/* Camera Status */}
          <div className="bg-white rounded p-4" style={{ border: "1px solid #E5E7EB" }}>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Camera Status</div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-2.5">
              {[
                { icon: Activity,    label: "Status",      value: cfg.label,       color: cfg.color  },
                { icon: CheckCircle, label: "Recording",   value: cam.status === "online" ? "Active" : "Inactive", color: cam.status === "online" ? GREEN : RED },
                { icon: Wifi,        label: "Connection",  value: cfg.connLabel.replace("CONNECTION ", ""),  color: cfg.color  },
                { icon: MapPin,      label: "Location",    value: cam.location || "Unknown",  color: undefined },
                { icon: Hash,        label: "Camera ID",   value: cam.id,          color: undefined, mono: true },
                { icon: Monitor,     label: "Resolution",  value: cam.resolution,  color: undefined },
                { icon: Activity,    label: "Frame Rate",  value: `${cam.fps} fps`,color: undefined },
                { icon: Shield,      label: "Protocol",    value: "RTSP",          color: undefined },
                { icon: Clock,       label: "Uptime",      value: cam.status === "online" ? "14d 6h 22m" : "—", color: undefined },
              ].map(({ icon: Icon, label, value, color, mono }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <div className="flex items-center gap-1.5">
                    <Icon style={{ width: 11, height: 11, color: "#CBD5E1" }} />
                    <span className="text-[11px] text-gray-400">{label}</span>
                  </div>
                  <span
                    className={`text-[11px] font-semibold ${mono ? "font-mono" : ""}`}
                    style={{ color: color ?? "#374151" }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Applications */}
          <div className="bg-white rounded p-4" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Applications</div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                {cam.mlApps.length}
              </span>
            </div>
            {cam.mlApps.length === 0 ? (
              <p className="text-[12px] text-gray-400 py-2">No applications attached.</p>
            ) : (
              <div className="space-y-2">
                {cam.mlApps.map((app) => {
                  const ml = ML_STATUS[app.status];
                  return (
                    <div key={app.id} className="rounded p-3 flex items-center justify-between gap-4"
                      style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                      <div className="min-w-0 flex-1">
                        <div className="text-[13px] font-semibold text-gray-900 truncate">{app.name}</div>
                        <div className="text-[11px] font-mono text-gray-400 truncate">{app.model}</div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span className="text-[10px] text-gray-400">
                            Latency: <span className="font-semibold text-gray-700">{app.latencyMs > 0 ? `${app.latencyMs}ms` : "N/A"}</span>
                          </span>
                          <span className="text-[10px] text-gray-400">
                            Accuracy: <span className="font-semibold text-gray-700">{app.accuracy > 0 ? `${app.accuracy}%` : "N/A"}</span>
                          </span>
                        </div>
                      </div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide flex-shrink-0"
                        style={{ backgroundColor: `${ml.color}12`, color: ml.color }}>
                        {ml.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Camera Logs */}
          <div className="bg-white rounded p-4" style={{ border: "1px solid #E5E7EB" }}>
            <div className="flex items-center justify-between mb-3">
              <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Camera Logs</div>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
                {camLogs.length}
              </span>
            </div>
            {camLogs.length === 0 ? (
              <p className="text-[12px] text-gray-400 py-2">No logs for this camera.</p>
            ) : (
              <div className="space-y-1.5">
                {camLogs.map((log) => (
                  <div key={log.id} className="flex items-center gap-3 py-2 border-b border-gray-50 last:border-0">
                    <span className="text-[11px] font-mono text-gray-400 flex-shrink-0">{log.ts}</span>
                    <div className="flex-1 min-w-0 text-[11px] text-gray-600 truncate">{log.details}</div>
                    {actionBadge(log.action)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Technical Details */}
          <div className="bg-white rounded p-4" style={{ border: "1px solid #E5E7EB" }}>
            <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-3">Technical Details</div>
            <div className="space-y-2">
              {techDetails.map(({ label, value, mono }) => (
                <div key={label} className="flex items-center justify-between py-1 border-b border-gray-50 last:border-0">
                  <span className="text-[11px] text-gray-400">{label}</span>
                  <span className={`text-[11px] font-medium text-gray-700 max-w-[240px] truncate text-right ${mono ? "font-mono" : ""}`}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {notifyOpen && (
        <NotifyClientModal
          pipeline={pipeline} project={project} account={account}
          statusLabel={cfg.label} onClose={() => setNotifyOpen(false)}
        />
      )}
      {escalateOpen && (
        <EscalateModal
          pipeline={pipeline} project={project} account={account}
          statusLabel={cfg.label} onClose={() => setEscalateOpen(false)}
        />
      )}
    </div>
  );
}

// ── Camera card ───────────────────────────────────────────────────────────────

function CameraCard({ cam, onClick }: { cam: Camera; onClick?: () => void }) {
  const cfg = CAM_STATUS[cam.status];
  return (
    <div
      className="rounded bg-white overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      style={{ border: "1px solid #E5E7EB", borderTop: `3px solid ${cfg.color}` }}
      onClick={onClick}
    >
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 truncate">{cam.name}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">IP Camera</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide flex-shrink-0"
            style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}>
            {cfg.label.toUpperCase()}
          </span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 my-3" />

        {/* Meta rows */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <MapPin style={{ width: 11, height: 11, color: "#CBD5E1" }} />
              <span className="text-[11px] text-gray-400">Location</span>
            </div>
            <span className="text-[11px] font-medium text-gray-700">{cam.location || "Unknown"}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Resolution</span>
            <span className="text-[11px] font-medium text-gray-700">{cam.resolution}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">Frame Rate</span>
            <span className="text-[11px] font-bold tabular-nums" style={{ color: cfg.color }}>{cam.fps} fps</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-gray-400">IP Address</span>
            <span className="text-[11px] font-mono text-gray-500">{cam.ip}</span>
          </div>
        </div>

        {/* Connection banner */}
        <div className="mt-3 px-2.5 py-1.5 rounded flex items-center gap-1.5"
          style={{ backgroundColor: `${cfg.color}08`, border: `1px solid ${cfg.color}20` }}>
          <div className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
          <span className="text-[11px] font-bold tracking-wide" style={{ color: cfg.color }}>{cfg.connLabel}</span>
        </div>
      </div>
    </div>
  );
}

// ── Compute card ──────────────────────────────────────────────────────────────

function metricColor(v: number) {
  if (v >= 90) return RED;
  if (v >= 70) return AMBER;
  return GREEN;
}

function ComputeCard({ name, gpuUtil, cpuUtil, ramUtil, onClick }: {
  name: string; gpuUtil: number; cpuUtil: number; ramUtil: number; onClick?: () => void;
}) {
  const metrics = [
    { label: "GPU", value: gpuUtil },
    { label: "CPU", value: cpuUtil },
    { label: "RAM", value: ramUtil },
  ];
  const overallColor = metricColor(Math.max(gpuUtil, cpuUtil, ramUtil));
  return (
    <div className="rounded bg-white overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      style={{ border: "1px solid #E5E7EB", borderTop: `3px solid ${overallColor}`, minWidth: 220 }}
      onClick={onClick}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 truncate">{name}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">Compute Node</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide flex-shrink-0"
            style={{ backgroundColor: `${overallColor}12`, color: overallColor }}>
            {overallColor === GREEN ? "HEALTHY" : overallColor === AMBER ? "WARNING" : "CRITICAL"}
          </span>
        </div>

        {/* Metric rows with progress bars */}
        <div className="space-y-2.5">
          {metrics.map((m) => {
            const c = metricColor(m.value);
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-gray-500">{m.label}</span>
                  <span className="text-[11px] font-bold tabular-nums" style={{ color: c }}>{m.value}%</span>
                </div>
                <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
                  <div
                    className="h-full rounded transition-all duration-500"
                    style={{ width: `${m.value}%`, backgroundColor: c }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ── ML App card ───────────────────────────────────────────────────────────────

function MLCard({ app, onClick }: { app: MLApp; onClick?: () => void }) {
  const cfg = ML_STATUS[app.status];
  const latencyColor = app.latencyMs > 200 ? RED : app.latencyMs > 100 ? AMBER : GREEN;
  const accuracyColor = app.accuracy < 70 ? RED : app.accuracy < 85 ? AMBER : GREEN;
  return (
    <div className="rounded bg-white overflow-hidden transition-shadow hover:shadow-md cursor-pointer"
      style={{ border: "1px solid #E5E7EB", borderTop: `3px solid ${cfg.color}`, minWidth: 220 }}
      onClick={onClick}>
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-gray-900 truncate">{app.name}</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wide mt-0.5">ML Application</div>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide flex-shrink-0"
            style={{ backgroundColor: `${cfg.color}12`, color: cfg.color }}>
            {cfg.label}
          </span>
        </div>

        {/* Model name */}
        <div className="mb-3 px-2.5 py-1.5 rounded"
          style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
          <span className="text-[10px] text-gray-400 uppercase tracking-wide block mb-0.5">Model</span>
          <span className="text-[12px] font-mono font-medium text-gray-700 truncate block">{app.model}</span>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-100 mb-3" />

        {/* Metrics */}
        <div className="space-y-2.5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Latency</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: latencyColor }}>
                {app.latencyMs > 0 ? `${app.latencyMs} ms` : "N/A"}
              </span>
            </div>
            {app.latencyMs > 0 && (
              <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
                <div className="h-full rounded transition-all duration-500"
                  style={{ width: `${Math.min(app.latencyMs / 3, 100)}%`, backgroundColor: latencyColor }} />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-[11px] text-gray-400">Accuracy</span>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: accuracyColor }}>
                {app.accuracy > 0 ? `${app.accuracy}%` : "N/A"}
              </span>
            </div>
            {app.accuracy > 0 && (
              <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
                <div className="h-full rounded transition-all duration-500"
                  style={{ width: `${app.accuracy}%`, backgroundColor: accuracyColor }} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Compute Detail Modal ──────────────────────────────────────────────────────

const DB_META: Record<number, { name: string; protocol: string }> = {
  6334:  { name: "qdrant",      protocol: "http://localhost:6334"  },
  27017: { name: "mongo",       protocol: "mongodb://localhost:27017" },
  8123:  { name: "clickhouse",  protocol: "http://localhost:8123"  },
  5432:  { name: "postgres",    protocol: "postgresql://localhost:5432" },
  6379:  { name: "redis",       protocol: "redis://localhost:6379" },
};

const MOCK_ACTIONS = [
  { id: "6a15a70ee457dd7b37271745", status: "running",  cpu: 100.5, gpu: 4.8,  mem: "1.7 GB", started: "May 26, 07:28 PM", updated: "May 26, 07:44 PM" },
  { id: "6a15a0bce457dd7b372716f7", status: "stopped",  cpu: 98.2,  gpu: 4.5,  mem: "1.7 GB", started: "May 26, 07:01 PM", updated: "May 26, 07:26 PM" },
  { id: "6a159fb3e457dd7b372716d3", status: "stopped",  cpu: 43.4,  gpu: 4.1,  mem: "1.7 GB", started: "May 26, 06:57 PM", updated: "May 26, 07:00 PM" },
  { id: "6a1575a471915dba22c65640", status: "stopped",  cpu: 75.7,  gpu: 5.1,  mem: "1.7 GB", started: "May 26, 03:57 PM", updated: "May 26, 04:11 PM" },
  { id: "6a15719c71915dba22c65612", status: "stopped",  cpu: 71.3,  gpu: 5.3,  mem: "1.8 GB", started: "May 26, 03:40 PM", updated: "May 26, 03:57 PM" },
];

const MOCK_GPU_MEM = [
  { id: 0, free: "56.54 GB" }, { id: 1, free: "71.72 GB" }, { id: 2, free: "79.13 GB" },
  { id: 3, free: "79.13 GB" }, { id: 4, free: "78.08 GB" }, { id: 5, free: "77.35 GB" },
  { id: 6, free: "69.81 GB" }, { id: 7, free: "79.13 GB" },
];

const MOCK_MOUNTS = [
  { path: "/data",        free: "1589.3", total: "2932.9" },
  { path: "/data2",       free: "2725.2", total: "2932.9" },
  { path: "/docker_data", free: "1589.3", total: "2932.9" },
  { path: "/",            free: "59.1",   total: "438.5"  },
];

function DrawerHeader({
  title, subtitle, statusBg, statusColor, statusLabel,
  onClose, onNotify, onEscalate,
}: {
  title: string; subtitle: string;
  statusBg: string; statusColor: string; statusLabel: string;
  onClose: () => void; onNotify: () => void; onEscalate: () => void;
}) {
  return (
    <div className="flex-shrink-0 px-6 py-4 border-b border-gray-100">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[10px] font-bold px-2 py-0.5 rounded tracking-wide"
              style={{ backgroundColor: statusBg, color: statusColor }}>
              {statusLabel}
            </span>
            <span className="text-[10px] text-gray-400 uppercase tracking-wide">{subtitle}</span>
          </div>
          <div className="text-[18px] font-bold text-gray-900 truncate">{title}</div>
        </div>
        <button onClick={onClose}
          className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onNotify}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[12px] font-medium text-gray-700 hover:bg-gray-50 transition-colors"
          style={{ border: "1px solid #D1D5DB" }}>
          <Bell style={{ width: 13, height: 13 }} />
          Notify Client
        </button>
        <button onClick={onEscalate}
          className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-[12px] font-semibold text-white transition-opacity hover:opacity-90"
          style={{ backgroundColor: TEAL }}>
          <PhoneCall style={{ width: 13, height: 13 }} />
          Escalate to Technical Team
        </button>
      </div>
    </div>
  );
}

function DetailSection({ title, icon: Icon, children }: {
  title: string; icon?: React.ElementType; children: React.ReactNode;
}) {
  return (
    <div className="bg-white rounded p-4" style={{ border: "1px solid #E5E7EB" }}>
      <div className="flex items-center gap-2 mb-3">
        {Icon && <Icon style={{ width: 13, height: 13, color: "#94A3B8" }} />}
        <div className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">{title}</div>
      </div>
      {children}
    </div>
  );
}

function KVRow({ label, value, mono, color }: {
  label: string; value: React.ReactNode; mono?: boolean; color?: string;
}) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
      <span className="text-[11px] text-gray-400">{label}</span>
      <span className={`text-[11px] font-semibold text-right max-w-[240px] truncate ${mono ? "font-mono" : ""}`}
        style={{ color: color ?? "#374151" }}>
        {value}
      </span>
    </div>
  );
}

function ComputeDetailModal({ ci, pipeline, project, account, onClose }: {
  ci: ComputeInstance; pipeline: Pipeline; project: Project; account: Account | null; onClose: () => void;
}) {
  const [showAllActions, setShowAllActions] = useState(false);
  const [notifyOpen,     setNotifyOpen]     = useState(false);
  const [escalateOpen,   setEscalateOpen]   = useState(false);
  const overallColor = metricColor(Math.max(ci.gpuUtil, ci.cpuUtil, ci.ramUtil));
  const statusLabel  = overallColor === GREEN ? "HEALTHY" : overallColor === AMBER ? "WARNING" : "CRITICAL";
  const visibleActions = showAllActions ? MOCK_ACTIONS : MOCK_ACTIONS.slice(0, 5);
  const runningCount = MOCK_ACTIONS.filter((a) => a.status === "running").length;
  const stoppedCount = MOCK_ACTIONS.filter((a) => a.status === "stopped").length;

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}>
      <div className="relative bg-white flex flex-col h-full overflow-hidden"
        style={{ width: 600, maxWidth: "92vw", borderLeft: "1px solid #E5E7EB" }}
        onClick={(e) => e.stopPropagation()}>

        <DrawerHeader
          title={ci.name}
          subtitle="Compute Node"
          statusBg={`${overallColor}12`}
          statusColor={overallColor}
          statusLabel={statusLabel}
          onClose={onClose}
          onNotify={() => setNotifyOpen(true)}
          onEscalate={() => setEscalateOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: "#F8FAFC" }}>

          {/* Overview */}
          <DetailSection title="Overview" icon={ServerIcon}>
            <KVRow label="Status"           value={statusLabel} color={overallColor} />
            <KVRow label="Instance ID"      value={ci.instanceId} mono />
            <KVRow label="Lease Type"       value={ci.leaseType} />
            <KVRow label="Instance Source"  value={ci.instanceSource} />
            <KVRow label="Instance IP"      value={ci.ip} mono />
            <KVRow label="Containers"       value={ci.containers} />
            <KVRow label="Current Jobs"     value="1008" />
            <KVRow label="Created"          value="May 21, 04:09 PM" />
            <KVRow label="Last Updated"     value={ci.lastUpdated} />
          </DetailSection>

          {/* Resource Utilization */}
          <DetailSection title="Resource Utilization" icon={Activity}>
            {[
              { label: "GPU", value: ci.gpuUtil },
              { label: "CPU", value: ci.cpuUtil },
              { label: "RAM", value: ci.ramUtil },
            ].map(({ label, value }) => {
              const c = metricColor(value);
              const tier = value >= 90 ? "Critical" : value >= 70 ? "High" : "Low";
              return (
                <div key={label} className="mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[11px] font-medium text-gray-600">{label}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-gray-400">{tier}</span>
                      <span className="text-[11px] font-bold tabular-nums" style={{ color: c }}>{value}%</span>
                    </div>
                  </div>
                  <div className="h-2 rounded bg-gray-100 overflow-hidden">
                    <div className="h-full rounded transition-all" style={{ width: `${value}%`, backgroundColor: c }} />
                  </div>
                </div>
              );
            })}
          </DetailSection>

          {/* Available Resources */}
          <DetailSection title="Available Resources" icon={Zap}>
            <KVRow label="CPU"     value={`${ci.cpuCores.toLocaleString()}.0 cores`} />
            <KVRow label="Memory"  value={`${ci.memoryGB} GB`} />
            <KVRow label="Storage" value={ci.storageGB > 0 ? `${ci.storageGB.toLocaleString()} GB` : "5963.3 / 9239.2 GB"} />
          </DetailSection>

          {/* GPU Memory Free */}
          <DetailSection title="GPU Memory Free" icon={MemoryStick}>
            <div className="grid grid-cols-2 gap-2">
              {MOCK_GPU_MEM.map((g) => (
                <div key={g.id} className="flex items-center justify-between px-3 py-2 rounded"
                  style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                  <span className="text-[11px] text-gray-500">GPU {g.id}</span>
                  <span className="text-[11px] font-semibold text-gray-800">{g.free}</span>
                </div>
              ))}
            </div>
          </DetailSection>

          {/* Top Mounts */}
          <DetailSection title="Top Mounts" icon={HardDrive}>
            {MOCK_MOUNTS.map((m) => (
              <div key={m.path} className="flex items-center justify-between py-1.5 border-b border-gray-50 last:border-0">
                <span className="text-[11px] font-mono text-gray-700">{m.path}</span>
                <span className="text-[11px] text-gray-500">{m.free} / {m.total} GB free</span>
              </div>
            ))}
          </DetailSection>

          {/* Database Connections */}
          <DetailSection title="Database Connections" icon={Database}>
            {ci.dbConnections.map((db) => {
              const meta = DB_META[db.port] ?? { name: `service-${db.port}`, protocol: `localhost:${db.port}` };
              const isRunning = db.status === "running";
              return (
                <div key={db.port} className="mb-3 last:mb-0 rounded p-3"
                  style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[11px] font-bold text-gray-500">Port {db.port}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                      style={{
                        backgroundColor: isRunning ? "rgba(0,166,62,0.10)" : "rgba(231,0,11,0.10)",
                        color: isRunning ? GREEN : RED,
                      }}>
                      {db.status}
                    </span>
                  </div>
                  <div className="text-[12px] font-semibold text-gray-800 mb-0.5">{meta.name}</div>
                  <div className="text-[11px] font-mono text-gray-400">{meta.protocol}</div>
                </div>
              );
            })}
          </DetailSection>

          {/* Persistent Paths */}
          <DetailSection title="Persistent Paths" icon={GitBranch}>
            {[
              { label: "Tracking DB",     path: "/data/db" },
              { label: "Identity DB",     path: "/data/db" },
              { label: "Microservices DB", path: "/data/db" },
            ].map(({ label, path }) => (
              <KVRow key={label} label={label} value={path} mono />
            ))}
          </DetailSection>

          {/* Hardware Configuration */}
          <DetailSection title="Hardware Configuration" icon={Cpu}>
            <KVRow label="GPU"              value={ci.gpu} />
            <KVRow label="GPU Provider"     value={ci.gpuProvider} />
            <KVRow label="GPU Architecture" value={ci.gpuArchitecture} />
            <KVRow label="Total Memory"     value={ci.totalMemory} />
            <KVRow label="CPU"              value="Intel(R) Xeon(R) Platinum 8470" />
            <KVRow label="CPU Architecture" value={ci.cpuArchitecture} />
            <KVRow label="CUDA Version"     value={ci.cudaVersion || "N/A"} />
          </DetailSection>

          {/* Container Resources */}
          <DetailSection title="Container Resources" icon={Container}>
            {ci.containerList.length === 0 ? (
              <p className="text-[12px] text-gray-400 py-2">No container metrics available.</p>
            ) : (
              <div className="space-y-2">
                {ci.containerList.map((c) => {
                  const sc = metricColor(Math.max(c.cpuUtil, c.ramUtil, c.gpuUtil));
                  return (
                    <div key={c.id} className="rounded p-3" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[12px] font-semibold text-gray-800">{c.name}</span>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded"
                          style={{ backgroundColor: c.status === "running" ? "rgba(0,166,62,0.10)" : "#F1F5F9", color: c.status === "running" ? GREEN : GREY }}>
                          {c.status}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-[11px]">
                        {[{ l: "CPU", v: c.cpuUtil }, { l: "GPU", v: c.gpuUtil }, { l: "RAM", v: c.ramUtil }].map(({ l, v }) => (
                          <div key={l}>
                            <span className="text-gray-400">{l} </span>
                            <span className="font-bold" style={{ color: metricColor(v) }}>{v}%</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </DetailSection>

          {/* Action Activity */}
          <DetailSection title="Action Activity" icon={Package}>
            <div className="flex items-center gap-3 mb-3">
              <span className="text-[12px] text-gray-500">{MOCK_ACTIONS.length} actions on this instance</span>
              <span className="flex items-center gap-1 text-[11px]" style={{ color: GREY }}>{stoppedCount} stopped</span>
              <span className="flex items-center gap-1 text-[11px]" style={{ color: GREEN }}>{runningCount} running</span>
            </div>
            <div className="space-y-2">
              {visibleActions.map((a) => {
                const isRunning = a.status === "running";
                return (
                  <div key={a.id} className="rounded p-3" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[11px] font-mono text-gray-700 truncate max-w-[200px]">{a.id}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1"
                        style={{ backgroundColor: isRunning ? "rgba(0,166,62,0.10)" : "#F1F5F9", color: isRunning ? GREEN : GREY }}>
                        {isRunning ? <Play style={{ width: 9, height: 9 }} /> : <Square style={{ width: 9, height: 9 }} />}
                        {a.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-[11px] mb-2">
                      <div><span className="text-gray-400">CPU </span><span className="font-bold text-gray-700">{a.cpu}%</span></div>
                      <div><span className="text-gray-400">GPU </span><span className="font-bold text-gray-700">{a.gpu}%</span></div>
                      <div><span className="text-gray-400">Mem </span><span className="font-bold text-gray-700">{a.mem}</span></div>
                    </div>
                    <div className="flex items-center gap-4 text-[10px] text-gray-400">
                      <span>Started {a.started}</span>
                      <span>Updated {a.updated}</span>
                    </div>
                  </div>
                );
              })}
            </div>
            {MOCK_ACTIONS.length > 5 && (
              <button
                onClick={() => setShowAllActions((v) => !v)}
                className="mt-2 w-full text-center text-[12px] text-gray-500 hover:text-gray-700 py-1.5 rounded hover:bg-gray-50 transition-colors"
                style={{ border: "1px solid #E5E7EB" }}>
                {showAllActions ? "Show less" : `Show all ${MOCK_ACTIONS.length} actions`}
              </button>
            )}
          </DetailSection>

        </div>
      </div>
      {notifyOpen   && <NotifyClientModal pipeline={pipeline} project={project} account={account} statusLabel={statusLabel} onClose={() => setNotifyOpen(false)} />}
      {escalateOpen && <EscalateModal     pipeline={pipeline} project={project} account={account} statusLabel={statusLabel} onClose={() => setEscalateOpen(false)} />}
    </div>
  );
}

// ── ML Detail Modal ───────────────────────────────────────────────────────────

function MLDetailModal({ app, pipeline, project, account, onClose }: {
  app: MLApp; pipeline: Pipeline; project: Project; account: Account | null; onClose: () => void;
}) {
  const [notifyOpen,   setNotifyOpen]   = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const cfg = ML_STATUS[app.status];
  const isRunning = app.status === "running";

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end"
      style={{ backgroundColor: "rgba(0,0,0,0.35)" }}
      onClick={onClose}>
      <div className="relative bg-white flex flex-col h-full overflow-hidden"
        style={{ width: 520, maxWidth: "92vw", borderLeft: "1px solid #E5E7EB" }}
        onClick={(e) => e.stopPropagation()}>

        <DrawerHeader
          title={app.name}
          subtitle="ML Application"
          statusBg={`${cfg.color}12`}
          statusColor={cfg.color}
          statusLabel={cfg.label}
          onClose={onClose}
          onNotify={() => setNotifyOpen(true)}
          onEscalate={() => setEscalateOpen(true)}
        />

        <div className="flex-1 overflow-y-auto p-5 space-y-4" style={{ backgroundColor: "#F8FAFC" }}>

          {/* App Status Banner */}
          <div className="rounded p-4 flex items-center gap-3"
            style={{ backgroundColor: isRunning ? "rgba(0,166,62,0.06)" : "rgba(231,0,11,0.05)", border: `1px solid ${cfg.color}25` }}>
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.color }} />
            <span className="text-[13px] font-medium" style={{ color: cfg.color }}>
              {isRunning
                ? "Application is running and processing"
                : app.status === "stopped" ? "Application has been stopped"
                : app.status === "starting" ? "Application is starting up"
                : "Application encountered an error"}
            </span>
          </div>

          {/* Overview */}
          <DetailSection title="Overview" icon={Brain}>
            <KVRow label="Name"            value={app.name} />
            <KVRow label="Description"     value="No description provided." color="#94A3B8" />
            <KVRow label="Status"          value="Deployed" />
            <KVRow label="Deployed"        value="Yes" />
            <KVRow label="Attached Cameras" value="0" />
            <KVRow label="Access Scale"    value="N/A" color="#94A3B8" />
            <KVRow label="Deploy Type"     value="N/A" color="#94A3B8" />
            <KVRow label="Created"         value="N/A" color="#94A3B8" />
            <KVRow label="Last Updated"    value="N/A" color="#94A3B8" />
          </DetailSection>

          {/* Model Details */}
          <DetailSection title="Model Details" icon={Package}>
            <div className="rounded p-3 mb-3" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
              <div className="text-[10px] text-gray-400 uppercase tracking-wide mb-0.5">Model</div>
              <div className="text-[13px] font-mono font-semibold text-gray-800">{app.model}</div>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400">Latency</span>
                  <span className="text-[11px] font-bold" style={{ color: app.latencyMs > 200 ? RED : app.latencyMs > 100 ? AMBER : GREEN }}>
                    {app.latencyMs > 0 ? `${app.latencyMs} ms` : "N/A"}
                  </span>
                </div>
                {app.latencyMs > 0 && (
                  <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${Math.min(app.latencyMs / 3, 100)}%`, backgroundColor: app.latencyMs > 200 ? RED : app.latencyMs > 100 ? AMBER : GREEN }} />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-gray-400">Accuracy</span>
                  <span className="text-[11px] font-bold" style={{ color: app.accuracy < 70 ? RED : app.accuracy < 85 ? AMBER : GREEN }}>
                    {app.accuracy > 0 ? `${app.accuracy}%` : "N/A"}
                  </span>
                </div>
                {app.accuracy > 0 && (
                  <div className="h-1.5 rounded bg-gray-100 overflow-hidden">
                    <div className="h-full rounded" style={{ width: `${app.accuracy}%`, backgroundColor: app.accuracy < 70 ? RED : app.accuracy < 85 ? AMBER : GREEN }} />
                  </div>
                )}
              </div>
            </div>
          </DetailSection>

          {/* Attached Cameras */}
          <DetailSection title="Attached Cameras (0)" icon={CameraIcon}>
            <p className="text-[12px] text-gray-400 py-2">No cameras attached to this application.</p>
          </DetailSection>

          {/* Identifiers */}
          <DetailSection title="Identifiers" icon={Hash}>
            <KVRow label="App ID"     value={app.id} mono />
            <KVRow label="Project ID" value="N/A" color="#94A3B8" />
            <KVRow label="User ID"    value="N/A" color="#94A3B8" />
            <KVRow label="Account #"  value="N/A" color="#94A3B8" />
          </DetailSection>

        </div>
      </div>
      {notifyOpen   && <NotifyClientModal pipeline={pipeline} project={project} account={account} statusLabel={cfg.label} onClose={() => setNotifyOpen(false)} />}
      {escalateOpen && <EscalateModal     pipeline={pipeline} project={project} account={account} statusLabel={cfg.label} onClose={() => setEscalateOpen(false)} />}
    </div>
  );
}

// ── Notify Client Modal ───────────────────────────────────────────────────────

function NotifyClientModal({
  pipeline, project, account, statusLabel, onClose,
}: {
  pipeline: Pipeline; project: Project; account: Account | null;
  statusLabel: string; onClose: () => void;
}) {
  const mlApps  = pipeline.cameras.flatMap((c) => c.mlApps);
  const activeCams = pipeline.cameras.filter((c) => c.status === "online").length;
  const activeML   = mlApps.filter((a) => a.status === "running").length;

  const defaultMsg = `Dear ${account?.name ?? "Client"} (${account?.accountId ?? ""}) Team,

We are currently monitoring your pipeline "${pipeline.name}" in the "${project.name}" project.

We have identified some performance degradation that our team is actively addressing.

Current Status Summary:
• Cameras: All ${pipeline.cameras.length} cameras operating normally
• ML Applications: ${activeML} of ${mlApps.length} applications not deployed or failing
• Compute Resources: All 1 compute instances operational

Our support team is actively investigating the situation and will keep you updated. If you have any questions or concerns, please don't hesitate to reach out.

Best regards,
Matrice AI Support Team`;

  const [msg, setMsg] = useState(defaultMsg);

  const statusColor = statusLabel === "HEALTHY" ? GREEN : statusLabel === "DEGRADED" ? AMBER : RED;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded shadow-2xl w-[600px] max-w-[94vw] max-h-[90vh] flex flex-col"
        style={{ border: "1px solid #E5E7EB" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(0,119,91,0.10)" }}>
              <Bell style={{ width: 17, height: 17, color: TEAL }} />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-gray-900">
                Notify Client — {account?.name ?? "Client"} ({account?.accountId ?? ""})
              </div>
              <div className="text-[12px] text-gray-400 mt-0.5">Send a status update to the client's primary contact</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        {/* Context grid */}
        <div className="mx-6 mt-4 rounded p-4 grid grid-cols-2 gap-x-6 gap-y-3"
          style={{ border: "1px solid #E5E7EB", backgroundColor: "#F8FAFC" }}>
          {[
            { label: "CLIENT",         value: `${account?.name ?? "—"} (${account?.accountId ?? ""})` },
            { label: "PROJECT",        value: project.name },
            { label: "PIPELINE",       value: pipeline.name },
            { label: "CURRENT STATUS", value: statusLabel, color: statusColor },
          ].map(({ label, value, color }) => (
            <div key={label}>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
              {label === "CURRENT STATUS" ? (
                <span className="text-[11px] font-bold px-2 py-0.5 rounded"
                  style={{ backgroundColor: `${color}15`, color }}>
                  {value}
                </span>
              ) : (
                <div className="text-[13px] font-semibold text-gray-800 truncate">{value}</div>
              )}
            </div>
          ))}
        </div>

        {/* Message */}
        <div className="px-6 mt-4 flex-1 overflow-auto">
          <div className="text-[13px] font-semibold text-gray-700 mb-2">Suggested Message</div>
          <textarea
            value={msg}
            onChange={(e) => setMsg(e.target.value)}
            rows={10}
            className="w-full text-[13px] text-gray-700 px-3.5 py-3 rounded resize-none outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] transition-all"
            style={{ border: "1px solid #D1D5DB", lineHeight: "1.6" }}
          />
        </div>

        {/* Info note */}
        <div className="mx-6 mt-3 px-3.5 py-2.5 rounded flex items-start gap-2"
          style={{ backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD" }}>
          <ExternalLink style={{ width: 13, height: 13, color: "#0369A1", flexShrink: 0, marginTop: 1 }} />
          <span className="text-[11px] text-blue-700">
            This message will be sent to the primary contact for {account?.name ?? "the client"} ({account?.accountId ?? ""}). You can customize it before sending.
          </span>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 mt-4">
          <button onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors"
            style={{ border: "1px solid #D1D5DB" }}>
            Cancel
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-white rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: TEAL }}>
            Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Escalate Modal ────────────────────────────────────────────────────────────

const PRIORITY_LEVELS = [
  { value: "p1", label: "Critical - P1" },
  { value: "p2", label: "High - P2"     },
  { value: "p3", label: "Medium - P3"   },
  { value: "p4", label: "Low - P4"      },
];

function EscalateModal({
  pipeline, project, account, statusLabel, onClose,
}: {
  pipeline: Pipeline; project: Project; account: Account | null;
  statusLabel: string; onClose: () => void;
}) {
  const [priority,    setPriority]    = useState("p2");
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [notes,       setNotes]       = useState("");

  const mlApps    = pipeline.cameras.flatMap((c) => c.mlApps);
  const failedML  = mlApps.filter((a) => a.status !== "running").length;
  const pipelineId = pipeline.id ?? "—";

  const escalationMsg = `WARNING: Performance degradation detected. Investigation needed.

Affected Component: pipeline "${pipeline.name}" (ID: ${pipelineId}) in project "${project.name}"
Client: ${account?.name ?? "—"} (${account?.accountId ?? ""})
Current Status: ${statusLabel}

Component Failures:
- ML Apps: ${failedML}/${mlApps.length} not deployed (${mlApps.length > 0 ? Math.round((failedML / mlApps.length) * 100) : 0}% failure rate)

Please investigate root cause and apply fix within SLA.`;

  const statusColor = statusLabel === "HEALTHY" ? GREEN : statusLabel === "DEGRADED" ? AMBER : RED;
  const selectedPriority = PRIORITY_LEVELS.find((p) => p.value === priority)!;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={() => { onClose(); setPriorityOpen(false); }}>
      <div className="bg-white rounded shadow-2xl w-[600px] max-w-[94vw] max-h-[90vh] flex flex-col"
        style={{ border: "1px solid #E5E7EB" }}
        onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-start justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: "rgba(234,88,12,0.10)" }}>
              <AlertTriangle style={{ width: 17, height: 17, color: "#EA580C" }} />
            </div>
            <div>
              <div className="text-[15px] font-semibold text-gray-900">Escalate to Technical Team</div>
              <div className="text-[12px] text-gray-400 mt-0.5">Create an escalation ticket for the technical team to investigate</div>
            </div>
          </div>
          <button onClick={onClose}
            className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100 transition-colors flex-shrink-0">
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Context grid */}
          <div className="rounded p-4 grid grid-cols-2 gap-x-6 gap-y-3"
            style={{ border: "1px solid #E5E7EB", backgroundColor: "#F8FAFC" }}>
            {[
              { label: "CLIENT",         value: `${account?.name ?? "—"} (${account?.accountId ?? ""})` },
              { label: "PROJECT",        value: project.name },
              { label: "PIPELINE",       value: pipeline.name },
              { label: "CURRENT STATUS", value: statusLabel, color: statusColor },
            ].map(({ label, value, color }) => (
              <div key={label}>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{label}</div>
                {label === "CURRENT STATUS" ? (
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded flex items-center gap-1 w-fit"
                    style={{ backgroundColor: `${color}15`, color }}>
                    {statusLabel !== "HEALTHY" && <AlertTriangle style={{ width: 10, height: 10 }} />}
                    {value}
                  </span>
                ) : (
                  <div className="text-[13px] font-semibold text-gray-800 truncate">{value}</div>
                )}
              </div>
            ))}
          </div>

          {/* Priority Level */}
          <div>
            <div className="text-[13px] font-semibold text-gray-700 mb-2">Priority Level</div>
            <div className="relative">
              <button
                onClick={() => setPriorityOpen((v) => !v)}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded text-[13px] font-medium text-gray-800 bg-white transition-colors hover:bg-gray-50"
                style={{ border: `1px solid ${priorityOpen ? TEAL : "#D1D5DB"}`,
                  outline: priorityOpen ? `2px solid ${TEAL}20` : "none" }}>
                {selectedPriority.label}
                <ChevronDown className="w-4 h-4 text-gray-400" style={{ transform: priorityOpen ? "rotate(180deg)" : "none", transition: "transform 0.15s" }} />
              </button>
              {priorityOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded shadow-lg z-10 overflow-hidden"
                  style={{ border: "1px solid #E5E7EB" }}>
                  {PRIORITY_LEVELS.map((p) => (
                    <button key={p.value}
                      onClick={() => { setPriority(p.value); setPriorityOpen(false); }}
                      className="w-full flex items-center justify-between px-3.5 py-2.5 text-[13px] hover:bg-gray-50 transition-colors"
                      style={{ color: priority === p.value ? TEAL : "#374151" }}>
                      {p.label}
                      {priority === p.value && <CheckCircle style={{ width: 14, height: 14, color: TEAL }} />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Escalation message */}
          <div>
            <div className="text-[13px] font-semibold text-gray-700 mb-2">Escalation Details</div>
            <textarea
              value={escalationMsg}
              readOnly
              rows={8}
              className="w-full text-[12px] font-mono text-gray-600 px-3.5 py-3 rounded resize-none bg-gray-50"
              style={{ border: "1px solid #E5E7EB", lineHeight: "1.6" }}
            />
          </div>

          {/* Additional Notes */}
          <div>
            <div className="text-[13px] font-semibold text-gray-700 mb-2">Additional Notes <span className="font-normal text-gray-400">(Optional)</span></div>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="Add any additional context or notes for the technical team..."
              className="w-full text-[13px] text-gray-700 px-3.5 py-3 rounded resize-none outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] transition-all placeholder-gray-400"
              style={{ border: "1px solid #D1D5DB" }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100">
          <button onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-gray-700 rounded hover:bg-gray-50 transition-colors"
            style={{ border: "1px solid #D1D5DB" }}>
            Cancel
          </button>
          <button onClick={onClose}
            className="px-4 py-2 text-[13px] font-semibold text-white rounded transition-opacity hover:opacity-90"
            style={{ backgroundColor: "#EA580C" }}>
            Create Escalation
          </button>
        </div>
      </div>
    </div>
  );
}

// ── System Flow tab ───────────────────────────────────────────────────────────

function SystemFlowTab({ pipeline, cluster, project, account }: {
  pipeline: Pipeline; cluster: Cluster | null;
  project: Project; account: Account | null;
}) {
  const [detailCam,     setDetailCam]     = useState<Camera | null>(null);
  const [detailCompute, setDetailCompute] = useState<ComputeInstance | null>(null);
  const [detailML,      setDetailML]      = useState<MLApp | null>(null);
  const [notifyOpen,    setNotifyOpen]    = useState(false);
  const [escalateOpen,  setEscalateOpen]  = useState(false);

  const cameras   = pipeline.cameras;
  const mlApps    = useMemo(
    () => cameras.flatMap((c) => c.mlApps),
    [cameras]
  );
  const computes  = useMemo(
    () => cluster ? MOCK_COMPUTE_INSTANCES.filter((i) => i.clusterId === cluster.id) : [],
    [cluster]
  );

  const activeCams   = cameras.filter((c) => c.status === "online").length;
  const activeML     = mlApps.filter((a) => a.status === "running").length;
  const activeComp   = computes.filter((c) => c.status === "healthy").length;
  const totalActive  = activeCams + activeML + activeComp;
  const totalAll     = cameras.length + mlApps.length + computes.length;

  const isHealthy = totalActive === totalAll;
  const statusColor = isHealthy ? GREEN : activeCams < cameras.length || activeML < mlApps.length ? RED : AMBER;
  const statusLabel = isHealthy ? "HEALTHY" : totalActive < totalAll / 2 ? "DEGRADED" : "DEGRADED";

  return (
    <div className="flex flex-col h-full overflow-auto p-5" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-5">
        <div className="relative flex-1 max-w-lg">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search for your infrastructure..."
            className="w-full pl-9 pr-4 py-2.5 text-[13px] rounded bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] transition-all placeholder-gray-400"
          />
        </div>
        <div className="flex-1" />
        <button
          onClick={() => setNotifyOpen(true)}
          className="px-4 py-2.5 text-[13px] font-medium rounded border border-gray-300 text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2 flex-shrink-0">
          <Bell className="w-4 h-4" />
          Notify Client
        </button>
        <button
          onClick={() => setEscalateOpen(true)}
          className="px-4 py-2.5 text-[13px] font-semibold rounded text-white flex items-center gap-2 transition-opacity hover:opacity-90 flex-shrink-0"
          style={{ backgroundColor: TEAL }}>
          <PhoneCall className="w-4 h-4" />
          Escalate to Technical Team
        </button>
      </div>

      {/* Diagram header */}
      <div className="bg-white rounded px-5 py-3.5 flex items-center justify-between mb-5"
        style={{ border: "1px solid #E5E7EB" }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: `${TEAL}15` }}>
            <Layers style={{ width: 16, height: 16, color: TEAL }} />
          </div>
          <span className="text-[14px] font-semibold text-gray-900">System Flow Diagram</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold px-2.5 py-1 rounded tracking-wide"
            style={{ backgroundColor: `${statusColor}12`, color: statusColor }}>
            {statusLabel}
          </span>
          <span className="text-[12px] text-gray-500">{totalActive}/{totalAll} COMPONENTS ACTIVE</span>
        </div>
      </div>

      {/* Video Sources */}
      <Section
        icon={CameraIcon}
        iconBg={activeCams === cameras.length ? `${GREEN}12` : `${RED}12`}
        iconColor={activeCams === cameras.length ? GREEN : RED}
        title="Video Sources"
        badge={<CountBadge active={activeCams} total={cameras.length} />}
      >
        {cameras.length === 0 ? (
          <p className="text-[12px] text-gray-400 py-2">No cameras in this pipeline.</p>
        ) : (
          <div className="grid gap-3 pt-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))" }}>
            {cameras.map((cam) => (
              <CameraCard key={cam.id} cam={cam} onClick={() => setDetailCam(cam)} />
            ))}
          </div>
        )}
      </Section>

      {/* Streaming Gateways */}
      <Section
        icon={Wifi} iconBg="#F1F5F9" iconColor="#94A3B8"
        title="Streaming Gateways"
        badge={<CountBadge active={0} total={0} />}
      >
        <p className="text-[13px] text-gray-400 py-3">No streaming gateways found for this pipeline.</p>
      </Section>

      {/* Compute Layer */}
      <Section
        icon={Monitor}
        iconBg={activeComp === computes.length && computes.length > 0 ? `${GREEN}12` : "#F1F5F9"}
        iconColor={activeComp === computes.length && computes.length > 0 ? GREEN : "#94A3B8"}
        title="Compute Layer"
      >
        {computes.length === 0 ? (
          <p className="text-[13px] text-gray-400 py-3">No compute instances found.</p>
        ) : (
          <div className="flex flex-wrap gap-3 pt-2">
            {computes.map((ci) => (
              <ComputeCard key={ci.id} name={ci.name} gpuUtil={ci.gpuUtil} cpuUtil={ci.cpuUtil} ramUtil={ci.ramUtil}
                onClick={() => setDetailCompute(ci)} />
            ))}
          </div>
        )}
      </Section>

      {/* ML Applications */}
      <Section
        icon={Brain}
        iconBg={activeML === 0 && mlApps.length > 0 ? `${AMBER}12` : `${GREEN}12`}
        iconColor={activeML === 0 && mlApps.length > 0 ? AMBER : GREEN}
        title="ML Applications"
        badge={<CountBadge active={activeML} total={mlApps.length} />}
      >
        {mlApps.length === 0 ? (
          <p className="text-[12px] text-gray-400 py-3">No ML applications in this pipeline.</p>
        ) : (
          <div className="flex flex-wrap gap-3 pt-2">
            {mlApps.map((app) => <MLCard key={app.id} app={app} onClick={() => setDetailML(app)} />)}
          </div>
        )}
      </Section>

      {/* Camera detail drawer */}
      {detailCam && (
        <CameraDetailModal
          cam={detailCam} pipeline={pipeline} project={project} account={account}
          onClose={() => setDetailCam(null)}
        />
      )}

      {/* Compute detail drawer */}
      {detailCompute && (
        <ComputeDetailModal
          ci={detailCompute} pipeline={pipeline} project={project} account={account}
          onClose={() => setDetailCompute(null)}
        />
      )}

      {/* ML App detail drawer */}
      {detailML && (
        <MLDetailModal
          app={detailML} pipeline={pipeline} project={project} account={account}
          onClose={() => setDetailML(null)}
        />
      )}

      {/* Notify Client modal */}
      {notifyOpen && (
        <NotifyClientModal
          pipeline={pipeline} project={project} account={account}
          statusLabel={statusLabel} onClose={() => setNotifyOpen(false)}
        />
      )}

      {/* Escalate modal */}
      {escalateOpen && (
        <EscalateModal
          pipeline={pipeline} project={project} account={account}
          statusLabel={statusLabel} onClose={() => setEscalateOpen(false)}
        />
      )}
    </div>
  );
}

// ── Pipeline Logs tab ─────────────────────────────────────────────────────────

const PIPELINE_LOG_COLS: ColumnDef<PipelineLogRow>[] = [
  {
    id: "ts",
    header: "Timestamp",
    accessorKey: "ts",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] font-mono text-gray-600">{row.ts}</span>
    ),
  },
  {
    id: "pipelineName",
    header: "Pipeline Name",
    accessorKey: "pipelineName",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-700">{row.pipelineName}</span>
    ),
  },
  {
    id: "action",
    header: "Action",
    accessorKey: "action",
    sortable: true,
    cell: ({ row }) => actionBadge(row.action),
  },
  {
    id: "details",
    header: "Details",
    accessorKey: "details",
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-600">{row.details}</span>
    ),
  },
  {
    id: "user",
    header: "User",
    accessorKey: "user",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-700">{row.user}</span>
    ),
  },
  {
    id: "prevState",
    header: "Previous State",
    accessorKey: "prevState",
    cell: ({ row }) => actionBadge(row.prevState),
  },
  {
    id: "newState",
    header: "New State",
    accessorKey: "newState",
    cell: ({ row }) => actionBadge(row.newState),
  },
];

function PipelineLogsTab({ pipeline }: { pipeline: Pipeline }) {
  const data = useMemo(
    () => PIPELINE_LOGS.map((r) => ({ ...r, pipelineName: pipeline.name })),
    [pipeline.name]
  );

  return (
    <div className="flex flex-col h-full overflow-auto p-5" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Selector card */}
      <div className="bg-white rounded p-5 mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <h2 className="text-[15px] font-semibold text-gray-900 mb-3">Inference Pipeline Logs</h2>
        <label className="text-[12px] text-gray-500 mb-1.5 block">Selected Pipeline</label>
        <div className="flex items-center justify-between px-3 py-2.5 rounded bg-gray-50"
          style={{ border: "1px solid #D1D5DB" }}>
          <span className="text-[13px] font-medium text-gray-800">{pipeline.name}</span>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </div>
      </div>

      {/* DataTable */}
      <DataTable<PipelineLogRow>
        columns={PIPELINE_LOG_COLS}
        data={data}
        rowIdKey="id"
        sortable
        selectable
        selectionMode="multi"
        expandable
        expansionMode="single"
        renderExpandedRow={(row) => (
          <div className="grid grid-cols-4 gap-6 py-3 px-2 text-[12px]">
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pipeline</div>
              <div className="font-medium text-gray-800">{row.pipelineName}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">User</div>
              <div className="font-medium text-gray-800">{row.user}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Timestamp</div>
              <div className="font-mono text-gray-700">{row.ts}</div>
            </div>
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Transition</div>
              <div className="flex items-center gap-2">
                {actionBadge(row.prevState)}
                <span className="text-gray-300">→</span>
                {actionBadge(row.newState)}
              </div>
            </div>
          </div>
        )}
        toolbar
        pagination="client"
        pageSize={10}
        cardTitle={<span className="text-[14px] font-semibold text-gray-900">Logs for: {pipeline.name}</span>}
      />
    </div>
  );
}

// ── Log Detail modal ──────────────────────────────────────────────────────────

function LogDetailModal({ log, onClose }: {
  log: typeof CAM_LOGS[0]; onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-white rounded shadow-2xl w-[520px] max-w-[90vw]"
        style={{ border: "1px solid #E5E7EB" }}
        onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <span className="text-[16px] font-semibold text-gray-900">Log Details</span>
          <button onClick={onClose} className="w-7 h-7 rounded flex items-center justify-center hover:bg-gray-100 transition-colors">
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Camera card */}
          <div className="rounded p-3.5 flex items-center justify-between"
            style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded flex items-center justify-center bg-white border border-gray-200">
                <CameraIcon className="w-4 h-4 text-gray-500" />
              </div>
              <div>
                <div className="text-[10px] text-gray-400 uppercase tracking-wide font-medium mb-0.5">Camera</div>
                <div className="text-[14px] font-semibold text-gray-900">{log.camName}</div>
              </div>
            </div>
            {actionBadge(log.action.toUpperCase())}
          </div>

          {/* Details */}
          <div>
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Details</div>
            <div className="rounded px-3.5 py-2.5 text-[13px] text-gray-700" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
              {log.details}
            </div>
          </div>

          {/* User + Timestamp */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                <User className="w-3 h-3" /> User
              </div>
              <span className="text-[14px] font-semibold text-gray-900">{log.user}</span>
            </div>
            <div>
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                <Calendar className="w-3 h-3" /> Timestamp
              </div>
              <span className="text-[14px] font-semibold text-gray-900">{log.ts}</span>
            </div>
          </div>

          {/* Status */}
          {log.status !== "—" && (
            <div>
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">Status</div>
              <div className="rounded px-3.5 py-2.5" style={{ backgroundColor: "#F8FAFC", border: "1px solid #E5E7EB" }}>
                {actionBadge(log.status)}
              </div>
            </div>
          )}

          {/* Advanced metadata */}
          <div className="pt-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                <Hash className="w-3 h-3" /> Advanced Metadata
              </div>
              <button className="text-[12px] text-gray-500 hover:text-gray-700">Show</button>
            </div>
            <div className="mt-2 flex items-center gap-2 border-t border-gray-100 pt-2">
              <Hash className="w-3 h-3 text-gray-400" />
              <span className="text-[12px] font-mono text-gray-500">69ec726aa6f789b970c123ee</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Camera Logs tab ───────────────────────────────────────────────────────────

const CAM_LOG_COLS: ColumnDef<CamLogRow>[] = [
  {
    id: "ts",
    header: "Timestamp",
    accessorKey: "ts",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] font-mono text-gray-600">{row.ts}</span>
    ),
  },
  {
    id: "camName",
    header: "Camera Name",
    accessorKey: "camName",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] font-medium text-gray-800">{row.camName}</span>
    ),
  },
  {
    id: "action",
    header: "Action",
    accessorKey: "action",
    sortable: true,
    cell: ({ row }) => actionBadge(row.action),
  },
  {
    id: "details",
    header: "Details",
    accessorKey: "details",
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-600">{row.details}</span>
    ),
  },
  {
    id: "user",
    header: "User",
    accessorKey: "user",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-700">{row.user}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      row.status !== "—"
        ? actionBadge(row.status)
        : <span className="text-gray-300 text-[12px]">—</span>
    ),
  },
];

function CameraLogsTab({ pipeline }: { pipeline: Pipeline }) {
  const [selectedCam, setSelectedCam] = useState(pipeline.cameras[0]?.name ?? "");
  const [selectedApp, setSelectedApp] = useState(pipeline.cameras[0]?.mlApps[0]?.id ?? "");
  const [detailLog, setDetailLog]     = useState<CamLogRow | null>(null);

  const filteredLogs = useMemo(
    () => CAM_LOGS.filter((l) => !selectedCam || l.camName === selectedCam),
    [selectedCam]
  );

  const camOptions  = useMemo(() => pipeline.cameras.map((c) => c.name), [pipeline]);
  const appOptions  = useMemo(
    () => pipeline.cameras.flatMap((c) => c.mlApps.map((a) => a.id)),
    [pipeline]
  );

  return (
    <div className="flex flex-col h-full overflow-auto p-5" style={{ backgroundColor: "#F3F4F6" }}>
      {/* Selector card */}
      <div className="bg-white rounded p-5 mb-4" style={{ border: "1px solid #E5E7EB" }}>
        <h2 className="text-[15px] font-semibold text-gray-900 mb-4">Camera &amp; Application Logs</h2>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-[12px] text-gray-500 mb-1.5 block">Camera</label>
            <div className="relative">
              <select
                value={selectedCam}
                onChange={(e) => setSelectedCam(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 rounded bg-gray-50 text-[13px] text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] cursor-pointer"
              >
                <option value="">All cameras</option>
                {camOptions.map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
          <div>
            <label className="text-[12px] text-gray-500 mb-1.5 block">Application</label>
            <div className="relative">
              <select
                value={selectedApp}
                onChange={(e) => setSelectedApp(e.target.value)}
                className="w-full appearance-none px-3 py-2.5 rounded bg-gray-50 text-[13px] text-gray-800 border border-gray-200 outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] cursor-pointer font-mono"
              >
                <option value="">All applications</option>
                {appOptions.map((id) => <option key={id} value={id}>{id}</option>)}
              </select>
              <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>

      {/* DataTable */}
      <DataTable<CamLogRow>
        columns={CAM_LOG_COLS}
        data={filteredLogs}
        rowIdKey="id"
        sortable
        selectable
        selectionMode="multi"
        toolbar
        pagination="client"
        pageSize={10}
        onRowClick={(row) => setDetailLog(row)}
        cardTitle={
          <span className="text-[14px] font-semibold text-gray-900">
            Logs · {selectedCam || "All cameras"}
          </span>
        }
        emptyState={{ title: "No logs found", description: "Try selecting a different camera or application." }}
      />

      {detailLog && <LogDetailModal log={detailLog} onClose={() => setDetailLog(null)} />}
    </div>
  );
}

// ── PipelineView ──────────────────────────────────────────────────────────────

type Tab = "system-flow" | "pipeline-logs" | "camera-logs";

interface PipelineViewProps {
  pipeline: Pipeline | null;
  project:  Project  | null;
  cluster:  Cluster  | null;
  account:  Account  | null;
  onBack:   () => void;
}

export function PipelineView({ pipeline, project, cluster, account, onBack }: PipelineViewProps) {
  const [tab, setTab] = useState<Tab>("system-flow");

  if (!pipeline || !project) {
    return (
      <div className="flex items-center justify-center h-full text-gray-400">
        No pipeline selected.
      </div>
    );
  }

  const TABS: { id: Tab; label: string }[] = [
    { id: "system-flow",   label: "System Flow"   },
    { id: "pipeline-logs", label: "Pipeline Logs" },
    { id: "camera-logs",   label: "Camera Logs"   },
  ];

  return (
    <div className="flex flex-col h-full">
      {/* Tab bar */}
      <div className="bg-white border-b border-gray-200 px-5 flex items-center gap-0 flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-4 py-3.5 text-[13px] font-medium transition-colors relative"
            style={{
              color: tab === t.id ? TEAL : "#64748B",
              borderBottom: tab === t.id ? `2px solid ${TEAL}` : "2px solid transparent",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden">
        {tab === "system-flow"   && <SystemFlowTab   pipeline={pipeline} cluster={cluster} project={project} account={account} />}
        {tab === "pipeline-logs" && <PipelineLogsTab pipeline={pipeline} />}
        {tab === "camera-logs"   && <CameraLogsTab   pipeline={pipeline} />}
      </div>
    </div>
  );
}
