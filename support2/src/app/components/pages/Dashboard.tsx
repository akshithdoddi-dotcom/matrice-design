import { useMemo } from "react";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Camera,
  Server,
  Cpu,
  FolderOpen,
  MapPin,
  Activity,
} from "lucide-react";
import { StatCard, STAT_PRESETS } from "@fe-common/components/ui/StatCard";
import {
  MOCK_PROJECTS,
  MOCK_CLUSTERS,
  MOCK_COMPUTE_INSTANCES,
  Camera as CameraType,
  Pipeline,
  Project,
  Cluster,
} from "@/data/mockData";

// ── Tokens ────────────────────────────────────────────────────────────────────
const GREEN = "#00843A";
const AMBER = "#D97706";
const RED   = "#DC2626";
const TEAL  = "#00775B";

// ── Helpers ───────────────────────────────────────────────────────────────────

interface FlatCamera { camera: CameraType; pipeline: Pipeline; project: Project; cluster: (typeof MOCK_CLUSTERS)[0] }

function getAllCameras(): FlatCamera[] {
  const seen = new Set<string>();
  const out: FlatCamera[] = [];
  for (const project of MOCK_PROJECTS) {
    const cluster = MOCK_CLUSTERS.find((c) => c.id === project.clusterId) ?? MOCK_CLUSTERS[0];
    for (const pipeline of project.pipelines)
      for (const camera of pipeline.cameras)
        if (!seen.has(camera.id)) { seen.add(camera.id); out.push({ camera, pipeline, project, cluster }); }
  }
  return out;
}

// ── Alert row ─────────────────────────────────────────────────────────────────

function AlertRow({ color, icon: Icon, title, subtitle, onClick }: {
  color: string; icon: React.ElementType; title: string; subtitle: string; onClick?: () => void;
}) {
  return (
    <div
      className="flex items-start gap-3 px-4 py-3.5 rounded-xl transition-all duration-150"
      style={{
        backgroundColor: `${color}08`,
        border: `1px solid ${color}25`,
        borderLeft: `4px solid ${color}`,
        cursor: onClick ? "pointer" : "default",
      }}
      onClick={onClick}
    >
      <Icon style={{ width: 18, height: 18, color, flexShrink: 0, marginTop: 1 }} />
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: "#0F172A" }}>{title}</div>
        <div style={{ fontSize: 12, color: "#64748B", marginTop: 1 }}>{subtitle}</div>
      </div>
    </div>
  );
}

// ── Cluster card ──────────────────────────────────────────────────────────────

function ClusterCard({ cluster, onClick }: { cluster: (typeof MOCK_CLUSTERS)[0]; onClick: () => void }) {
  const color      = cluster.status === "active" ? GREEN : cluster.status === "warning" ? AMBER : "#64748B";
  const label      = cluster.status === "active" ? "Healthy" : cluster.status === "warning" ? "Warning" : "Inactive";
  const StatusIcon = cluster.status === "active" ? CheckCircle : cluster.status === "warning" ? AlertTriangle : XCircle;
  return (
    <div
      className="bg-white rounded-xl p-4 cursor-pointer transition-all duration-150 hover:shadow-md"
      style={{ border: "1px solid #E2E8F0", borderLeft: `4px solid ${color}` }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <span className="truncate" style={{ fontSize: 13, fontWeight: 600, color: "#0F172A", flex: 1 }} title={cluster.name}>
          {cluster.name}
        </span>
        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full flex-shrink-0"
          style={{ backgroundColor: `${color}12` }}>
          <StatusIcon style={{ width: 11, height: 11, color }} />
          <span style={{ fontSize: 10, fontWeight: 700, color, letterSpacing: "0.04em" }}>
            {label.toUpperCase()}
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 mb-2">
        <MapPin style={{ width: 10, height: 10, color: "#CBD5E1" }} />
        <span style={{ fontSize: 11, color: "#94A3B8" }}>{cluster.location || "Unknown"}</span>
      </div>
      <div style={{ fontSize: 11, color: "#64748B" }}>
        <span style={{ fontWeight: 600, color: "#334155" }}>{cluster.instanceCount}</span>
        /{cluster.totalInstances} instances running
      </div>
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface DashboardProps {
  onGoToClusters?: () => void;
  onSelectCluster?: (cluster: Cluster) => void;
  onSelectClusterForCameras?: (cluster: Cluster) => void;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export function Dashboard({ onGoToClusters, onSelectCluster, onSelectClusterForCameras }: DashboardProps = {}) {
  const now = new Date().toLocaleString("en-US", {
    weekday: "long", month: "short", day: "numeric",
    hour: "numeric", minute: "2-digit",
  });

  const allCameras  = useMemo(getAllCameras, []);
  const camOnline   = allCameras.filter((f) => f.camera.status === "online").length;
  const camDegraded = allCameras.filter((f) => f.camera.status === "degraded").length;
  const camOffline  = allCameras.filter((f) => f.camera.status === "offline").length;
  const camTotal    = allCameras.length;

  const clTotal    = MOCK_CLUSTERS.length;
  const clHealthy  = MOCK_CLUSTERS.filter((c) => c.status === "active").length;
  const clWarning  = MOCK_CLUSTERS.filter((c) => c.status === "warning").length;
  const clInactive = MOCK_CLUSTERS.filter((c) => c.status === "inactive").length;

  const compTotal   = MOCK_COMPUTE_INSTANCES.length;
  const compHealthy = MOCK_COMPUTE_INSTANCES.filter((i) => i.status === "healthy").length;
  const compWarning = MOCK_COMPUTE_INSTANCES.filter((i) => i.status === "warning").length;
  const compError   = MOCK_COMPUTE_INSTANCES.filter((i) => i.status === "error").length;

  const projTotal    = MOCK_PROJECTS.length;
  const projCritical = MOCK_PROJECTS.filter((p) => p.severity === "critical" || p.severity === "high").length;
  const projStable   = MOCK_PROJECTS.filter((p) => p.severity === "stable" || p.severity === "resolved").length;

  const hasCritical = camOffline > 0 || compError > 0;
  const hasWarning  = camDegraded > 0 || clWarning > 0 || compWarning > 0;
  const heroColor   = hasCritical ? RED : hasWarning ? AMBER : GREEN;
  const heroBg      = hasCritical ? "#FEF2F2" : hasWarning ? "#FFFBEB" : "#F0FDF4";
  const heroBorder  = hasCritical ? "#FECACA" : hasWarning ? "#FDE68A" : "#BBF7D0";
  const HeroIcon    = hasCritical ? XCircle : hasWarning ? AlertTriangle : CheckCircle;
  const heroText    = hasCritical
    ? `${camOffline + compError} Critical Issues Detected`
    : hasWarning
    ? `${camDegraded + clWarning + compWarning} Items Need Attention`
    : "All Systems Running Normally";

  // Alerts
  const alerts: { color: string; icon: React.ElementType; title: string; subtitle: string; cluster?: (typeof MOCK_CLUSTERS)[0] }[] = [];
  allCameras.filter((f) => f.camera.status === "offline").slice(0, 4).forEach(({ camera, cluster }) => {
    alerts.push({ color: RED, icon: Camera, title: `Camera offline — ${camera.name}`, subtitle: `Location: ${camera.location || "Unknown"} · IP: ${camera.ip}`, cluster });
  });
  MOCK_COMPUTE_INSTANCES.filter((i) => i.status === "error").forEach((i) => {
    alerts.push({ color: RED, icon: Cpu, title: `Compute node error — ${i.name}`, subtitle: `IP: ${i.ip} · Last updated: ${i.lastUpdated}` });
  });
  allCameras.filter((f) => f.camera.status === "degraded").slice(0, 3).forEach(({ camera, cluster }) => {
    alerts.push({ color: AMBER, icon: Camera, title: `Camera degraded — ${camera.name}`, subtitle: `Location: ${camera.location || "Unknown"} · ${camera.fps} fps`, cluster });
  });
  MOCK_CLUSTERS.filter((c) => c.status === "warning").forEach((c) => {
    alerts.push({ color: AMBER, icon: Server, title: `Cluster needs attention — ${c.name}`, subtitle: `${c.instanceCount}/${c.totalInstances} instances running · ${c.location}` });
  });
  const shownAlerts = alerts.slice(0, 8);

  const barTotal = camTotal || 1;

  return (
    <div className="space-y-5 p-6 overflow-auto min-h-0">

      {/* ── Hero banner ─────────────────────────────────────────────────── */}
      <div className="rounded-2xl p-6 flex items-center justify-between flex-wrap gap-4"
        style={{ backgroundColor: heroBg, border: `1px solid ${heroBorder}` }}>
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
            style={{ backgroundColor: `${heroColor}18` }}>
            <HeroIcon style={{ width: 28, height: 28, color: heroColor }} />
          </div>
          <div>
            <div style={{ fontSize: 22, fontWeight: 800, color: heroColor }}>{heroText}</div>
            <div style={{ fontSize: 13, color: "#64748B", marginTop: 2 }}>Last checked: {now}</div>
          </div>
        </div>
        <div className="flex items-center gap-6 flex-wrap">
          {camOffline > 0 && (
            <div className="text-center">
              <div style={{ fontSize: 28, fontWeight: 800, color: RED }}>{camOffline}</div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>CAMERAS OFFLINE</div>
            </div>
          )}
          {compError > 0 && (
            <div className="text-center">
              <div style={{ fontSize: 28, fontWeight: 800, color: RED }}>{compError}</div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>COMPUTE ERRORS</div>
            </div>
          )}
          {clWarning > 0 && (
            <div className="text-center">
              <div style={{ fontSize: 28, fontWeight: 800, color: AMBER }}>{clWarning}</div>
              <div style={{ fontSize: 11, color: "#64748B", fontWeight: 600 }}>CLUSTER WARNINGS</div>
            </div>
          )}
          {!hasCritical && !hasWarning && (
            <div className="flex items-center gap-2 px-4 py-2 rounded-full" style={{ backgroundColor: `${GREEN}15` }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: GREEN, display: "inline-block" }} />
              <span style={{ fontSize: 13, fontWeight: 600, color: GREEN }}>No issues found</span>
            </div>
          )}
        </div>
      </div>

      {/* ── Stat cards ──────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-4">
        <StatCard
          d={{
            label: "Cameras",
            value: `${camTotal}`,
            sublabel: `${camOnline} online · ${camOffline > 0 ? `${camOffline} offline` : "none offline"}`,
            chip: "LIVE",
            dir: camOffline > 0 ? "up" : "neutral",
            num: camOffline > 0 ? `${camOffline} offline` : "All online",
            ref_: "current status",
            ...(camOffline > 0 ? STAT_PRESETS.red : camDegraded > 0 ? STAT_PRESETS.amber : STAT_PRESETS.teal),
          }}
          onClick={onGoToClusters}
        />
        <StatCard
          d={{
            label: "Clusters",
            value: `${clTotal}`,
            sublabel: `${clHealthy} healthy · ${clInactive > 0 ? `${clInactive} inactive` : "none inactive"}`,
            chip: "LIVE",
            dir: clWarning > 0 || clInactive > 0 ? "up" : "neutral",
            num: clWarning > 0 ? `${clWarning} warning` : clInactive > 0 ? `${clInactive} inactive` : "All healthy",
            ref_: "current status",
            ...(clInactive > 0 ? STAT_PRESETS.red : clWarning > 0 ? STAT_PRESETS.amber : STAT_PRESETS.teal),
          }}
          onClick={onGoToClusters}
        />
        <StatCard
          d={{
            label: "Compute Nodes",
            value: `${compTotal}`,
            sublabel: `${compHealthy} healthy · ${compError > 0 ? `${compError} errors` : "no errors"}`,
            chip: "LIVE",
            dir: compError > 0 ? "up" : "neutral",
            num: compError > 0 ? `${compError} errors` : compWarning > 0 ? `${compWarning} warning` : "All healthy",
            ref_: "current status",
            ...(compError > 0 ? STAT_PRESETS.red : compWarning > 0 ? STAT_PRESETS.amber : STAT_PRESETS.blue),
          }}
          onClick={onGoToClusters}
        />
        <StatCard
          d={{
            label: "Projects",
            value: `${projTotal}`,
            sublabel: `${projStable} stable · ${projCritical > 0 ? `${projCritical} flagged` : "none flagged"}`,
            chip: "LIVE",
            dir: projCritical > 0 ? "up" : "neutral",
            num: projCritical > 0 ? `${projCritical} flagged` : "All stable",
            ref_: "current status",
            ...(projCritical > 0 ? STAT_PRESETS.amber : STAT_PRESETS.teal),
          }}
          onClick={onGoToClusters}
        />
      </div>

      {/* ── Alerts ──────────────────────────────────────────────────────── */}
      {shownAlerts.length > 0 && (
        <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle style={{ width: 18, height: 18, color: AMBER }} />
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Needs Your Attention</h2>
            <span className="ml-1 px-2 py-0.5 rounded-full"
              style={{ fontSize: 11, fontWeight: 700, backgroundColor: "#FEF3C7", color: AMBER }}>
              {shownAlerts.length}
            </span>
          </div>
          <div className="space-y-2">
            {shownAlerts.map((a, i) => (
              <AlertRow
                key={i}
                color={a.color}
                icon={a.icon}
                title={a.title}
                subtitle={a.subtitle}
                onClick={a.cluster ? () => onSelectClusterForCameras?.(a.cluster!) : onGoToClusters}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Camera health ───────────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 mb-5">
          <Activity style={{ width: 16, height: 16, color: TEAL }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Camera Health</h2>
          <span style={{ fontSize: 13, color: "#94A3B8", marginLeft: 4 }}>{camTotal} cameras total</span>
        </div>

        {/* Big stat badges */}
        <div className="grid grid-cols-3 gap-4 mb-5">
          {[
            { label: "Online",   count: camOnline,   color: GREEN, bg: "#F0FDF4" },
            { label: "Degraded", count: camDegraded, color: AMBER, bg: "#FFFBEB" },
            { label: "Offline",  count: camOffline,  color: RED,   bg: "#FEF2F2" },
          ].map((s) => (
            <div key={s.label} className="rounded-xl p-4 text-center"
              style={{ backgroundColor: s.bg, border: `1px solid ${s.color}25` }}>
              <div style={{ fontSize: 36, fontWeight: 800, color: s.color }}>{s.count}</div>
              <div style={{ fontSize: 13, fontWeight: 600, color: s.color, marginTop: 2 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Stacked progress bar */}
        <div className="mb-4">
          <div className="flex rounded-full overflow-hidden" style={{ height: 12, backgroundColor: "#F1F5F9" }}>
            {camOnline   > 0 && <div style={{ width: `${(camOnline   / barTotal) * 100}%`, backgroundColor: GREEN }} />}
            {camDegraded > 0 && <div style={{ width: `${(camDegraded / barTotal) * 100}%`, backgroundColor: AMBER }} />}
            {camOffline  > 0 && <div style={{ width: `${(camOffline  / barTotal) * 100}%`, backgroundColor: RED   }} />}
          </div>
          <div className="flex justify-between mt-2">
            {[{ label: "Online", color: GREEN }, { label: "Degraded", color: AMBER }, { label: "Offline", color: RED }].map((l) => (
              <div key={l.label} className="flex items-center gap-1.5">
                <span style={{ width: 8, height: 8, borderRadius: "50%", backgroundColor: l.color, display: "inline-block" }} />
                <span style={{ fontSize: 11, color: "#64748B" }}>{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Offline camera list */}
        {camOffline > 0 && (
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#94A3B8", letterSpacing: "0.06em", marginBottom: 8 }}>
              OFFLINE CAMERAS
            </div>
            <div className="grid grid-cols-2 gap-2">
              {allCameras.filter((f) => f.camera.status === "offline").map(({ camera, cluster }) => (
                <div
                  key={camera.id}
                  className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl cursor-pointer transition-all duration-150 hover:shadow-sm"
                  style={{ backgroundColor: "#FEF2F2", border: "1px solid #FECACA" }}
                  onClick={() => onSelectClusterForCameras?.(cluster)}
                >
                  <XCircle style={{ width: 14, height: 14, color: RED, flexShrink: 0 }} />
                  <div className="min-w-0">
                    <div style={{ fontSize: 12, fontWeight: 600, color: "#0F172A" }} className="truncate">{camera.name}</div>
                    <div style={{ fontSize: 10, color: "#94A3B8" }}>{camera.location || "Unknown"}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── Cluster status grid ──────────────────────────────────────────── */}
      <div className="bg-white rounded-2xl p-5" style={{ border: "1px solid #E2E8F0" }}>
        <div className="flex items-center gap-2 mb-4">
          <Server style={{ width: 16, height: 16, color: TEAL }} />
          <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0F172A" }}>Cluster Status</h2>
          <span style={{ fontSize: 13, color: "#94A3B8", marginLeft: 4 }}>{clTotal} clusters · {clHealthy} healthy</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {MOCK_CLUSTERS.map((cl) => (
            <ClusterCard
              key={cl.id}
              cluster={cl}
              onClick={() => onSelectCluster?.(cl)}
            />
          ))}
        </div>
      </div>

    </div>
  );
}
