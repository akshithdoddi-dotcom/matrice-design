import { useState, useMemo } from "react";
import {
  FolderOpen, AlertCircle, AlertTriangle, CheckCircle,
  CheckCircle2, Minus, Camera, Server, Cpu, Brain,
  ChevronDown, ArrowRight, X,
} from "lucide-react";
import {
  MOCK_PROJECTS, Project, Pipeline, ComponentStatus, Account, Cluster,
} from "@/data/mockData";

// ── Severity config ───────────────────────────────────────────────────────────

const SEV: Record<string, {
  accent: string; bg: string; iconColor: string;
  Icon: React.ElementType; badgeBg: string; badgeText: string; label: string;
}> = {
  critical: { accent: "#E7000B", bg: "#FFF5F5", iconColor: "#E7000B", Icon: AlertCircle,  badgeBg: "rgba(231,0,11,0.10)",   badgeText: "#E7000B", label: "Critical" },
  high:     { accent: "#EA580C", bg: "#FFF7F5", iconColor: "#EA580C", Icon: AlertTriangle, badgeBg: "rgba(234,88,12,0.10)",  badgeText: "#EA580C", label: "High"     },
  medium:   { accent: "#E19A04", bg: "#FFFBEB", iconColor: "#E19A04", Icon: AlertTriangle, badgeBg: "rgba(225,154,4,0.12)",  badgeText: "#B45309", label: "Medium"   },
  stable:   { accent: "#00A63E", bg: "#F0FDF4", iconColor: "#00A63E", Icon: CheckCircle,   badgeBg: "rgba(0,166,62,0.10)",   badgeText: "#00843A", label: "Stable"   },
  resolved: { accent: "#64748B", bg: "#F8FAFC", iconColor: "#64748B", Icon: CheckCircle2,  badgeBg: "rgba(100,116,139,0.1)", badgeText: "#475569", label: "Resolved" },
  default:  { accent: "#CBD5E1", bg: "#F8FAFC", iconColor: "#94A3B8", Icon: Minus,         badgeBg: "#F1F5F9",               badgeText: "#64748B", label: "Unknown"  },
};

const COMP: Record<ComponentStatus, { Icon: React.ElementType; color: string; bg: string }> = {
  critical: { Icon: AlertCircle,   color: "#E7000B", bg: "rgba(231,0,11,0.07)"   },
  warning:  { Icon: AlertTriangle, color: "#F59E0B", bg: "rgba(245,158,11,0.09)" },
  stable:   { Icon: CheckCircle,   color: "#00A63E", bg: "rgba(0,166,62,0.07)"   },
  info:     { Icon: CheckCircle,   color: "#2B7FFF", bg: "rgba(43,127,255,0.07)" },
};

const COMP_ICON: Record<string, React.ElementType> = {
  Cameras: Camera, Camera: Camera, Gateway: Server, Compute: Cpu, ML: Brain,
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function countIssues(project: Project) {
  let n = 0;
  for (const pl of project.pipelines)
    for (const c of pl.comps)
      if (c.status === "critical" || c.status === "warning") n++;
  return n;
}

const SEVERITY_ORDER = ["critical", "high", "medium", "stable", "resolved"];

// ── Pipeline row card ─────────────────────────────────────────────────────────

function PipelineCard({
  pipeline, project, onPipelineClick,
}: {
  pipeline: Pipeline;
  project: Project;
  onPipelineClick?: (project: Project, pipeline: Pipeline) => void;
}) {
  const headerColor = pipeline.headerColor || "#64748B";
  const hasIssue = pipeline.comps.some(
    (c) => c.status === "critical" || c.status === "warning"
  );

  return (
    <button
      onClick={() => onPipelineClick?.(project, pipeline)}
      className="w-full text-left rounded bg-white transition-all duration-150 hover:shadow-sm group px-4 py-3"
      style={{
        border: "1px solid #E5E7EB",
        borderLeft: `3px solid ${headerColor}`,
      }}
    >
      {/* Top row: name + arrow */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0">
          <div className="text-[13px] font-semibold text-gray-900 truncate">{pipeline.name}</div>
          {pipeline.note && (
            <div className="text-[11px] text-gray-400 mt-0.5 truncate">{pipeline.note}</div>
          )}
        </div>
        <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5 transition-all flex-shrink-0 mt-0.5" />
      </div>

      {/* Bottom row: component chips */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {pipeline.comps.map((comp) => {
          const c = COMP[comp.status] ?? COMP.stable;
          const CompIcon = COMP_ICON[comp.name] ?? Server;
          return (
            <div
              key={comp.name}
              className="flex items-center gap-1 px-2 py-0.5 rounded"
              style={{ backgroundColor: c.bg }}
            >
              <CompIcon style={{ width: 10, height: 10, color: c.color }} />
              <span className="text-[10px] font-medium" style={{ color: c.color }}>
                {comp.name}
              </span>
            </div>
          );
        })}
      </div>
    </button>
  );
}

// ── Project row ───────────────────────────────────────────────────────────────

function ProjectRow({
  project, open, onToggle, onPipelineClick,
}: {
  project: Project;
  open: boolean;
  onToggle: () => void;
  onPipelineClick?: (project: Project, pipeline: Pipeline) => void;
}) {
  const cfg    = SEV[project.severity] ?? SEV.default;
  const issues = countIssues(project);

  return (
    <div
      className="rounded overflow-hidden"
      style={{ border: `1px solid ${cfg.accent}22` }}
    >
      {/* ── Header ── */}
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 transition-all hover:brightness-[0.97]"
        style={{ backgroundColor: cfg.bg }}
      >
        {/* Icon + name */}
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          <cfg.Icon style={{ width: 16, height: 16, color: cfg.iconColor, flexShrink: 0 }} />
          <span className="text-[14px] font-semibold text-gray-900 truncate">{project.name}</span>
        </div>

        {/* Pipeline health summary */}
        <div className="hidden md:flex items-center gap-3 flex-shrink-0 text-[12px] text-gray-500">
          {(() => {
            const critical = project.pipelines.filter((pl) =>
              pl.comps.some((c) => c.status === "critical")
            ).length;
            const warning = project.pipelines.filter((pl) =>
              pl.comps.some((c) => c.status === "warning") &&
              !pl.comps.some((c) => c.status === "critical")
            ).length;
            const healthy = project.pipelines.length - critical - warning;
            return (
              <>
                {critical > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#E7000B" }} />
                    <span style={{ color: "#E7000B" }} className="font-medium">{critical} critical</span>
                  </span>
                )}
                {warning > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#F59E0B" }} />
                    <span style={{ color: "#B45309" }} className="font-medium">{warning} degraded</span>
                  </span>
                )}
                {healthy > 0 && (
                  <span className="flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "#00A63E" }} />
                    <span style={{ color: "#00843A" }} className="font-medium">{healthy} healthy</span>
                  </span>
                )}
              </>
            );
          })()}
        </div>

        {/* Dot separator */}
        <span className="hidden md:block w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />

        {/* Pipeline count + issues + chevron */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-[12px] text-gray-400">
            {project.pipelines.length} pipeline{project.pipelines.length !== 1 ? "s" : ""}
          </span>

          {/* Dot separator */}
          {issues > 0 && <span className="w-1 h-1 rounded-full bg-gray-300 flex-shrink-0" />}

          {issues > 0 && (
            <span
              className="text-[11px] font-bold px-2.5 py-0.5 rounded"
              style={{ backgroundColor: cfg.badgeBg, color: cfg.badgeText }}
            >
              {issues} issue{issues > 1 ? "s" : ""}
            </span>
          )}
          <ChevronDown
            className="w-4 h-4 transition-transform duration-200"
            style={{ color: cfg.iconColor, transform: open ? "rotate(180deg)" : "none" }}
          />
        </div>
      </button>

      {/* ── Expanded body ── */}
      {open && (
        <div className="bg-white border-t px-5 py-4" style={{ borderColor: `${cfg.accent}15` }}>
          <div className="flex items-center gap-2 mb-3">
            <FolderOpen className="w-3.5 h-3.5 text-gray-400" />
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider">
              Inference Pipelines
            </span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-gray-100 text-gray-500">
              {project.pipelines.length}
            </span>
          </div>
          <div className="grid gap-2" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))" }}>
            {project.pipelines.map((pl) => (
              <PipelineCard
                key={pl.id}
                pipeline={pl}
                project={project}
                onPipelineClick={onPipelineClick}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface ProjectsProps {
  account: Account | null;
  cluster: Cluster | null;
  initialOpenId?: string | null;
  onBack?: () => void;
  onBackToDesk?: () => void;
  onSelectPipeline?: (project: Project, pipeline: Pipeline) => void;
  onEnterProject?: (project: Project) => void;
  onPipelineClick?: (project: Project, pipeline: Pipeline) => void;
}

// ── Page ──────────────────────────────────────────────────────────────────────

export function Projects({ cluster, initialOpenId, onPipelineClick }: ProjectsProps) {
  const projects = useMemo(
    () => cluster ? MOCK_PROJECTS.filter((p) => p.clusterId === cluster.id) : MOCK_PROJECTS,
    [cluster]
  );

  const sorted = useMemo(
    () => [...projects].sort(
      (a, b) => SEVERITY_ORDER.indexOf(a.severity) - SEVERITY_ORDER.indexOf(b.severity)
    ),
    [projects]
  );

  const defaultOpen = useMemo(() => {
    if (initialOpenId) return new Set([initialOpenId]);
    return new Set(
      sorted.filter((p) => p.severity === "critical" || p.severity === "high").map((p) => p.id)
    );
  }, []);

  const [openIds, setOpenIds]   = useState<Set<string>>(defaultOpen);
  const [filterSev, setFilterSev] = useState<string | null>(null);

  const severityCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const p of projects) counts[p.severity] = (counts[p.severity] ?? 0) + 1;
    return counts;
  }, [projects]);

  const visible = filterSev ? sorted.filter((p) => p.severity === filterSev) : sorted;

  const toggle = (id: string) =>
    setOpenIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const issueProjects = projects.filter(
    (p) => p.severity === "critical" || p.severity === "high"
  ).length;

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F3F4F6" }}>
      {/* ── Page header ── */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <FolderOpen className="w-5 h-5 text-[#00775B]" />
          <span className="text-[16px] font-semibold text-gray-900">Projects Overview</span>
        </div>
        <div className="flex items-center gap-3">
          {issueProjects > 0 && (
            <span className="text-[12px] font-semibold text-red-600 bg-red-50 px-2.5 py-1 rounded border border-red-100">
              {issueProjects} with issues
            </span>
          )}
          <span className="text-[13px] text-gray-400">
            {visible.length} of {projects.length} projects
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-5">
        {/* ── Severity filter tabs ── */}
        <div className="flex items-center gap-2 mb-5 flex-wrap">
          <button
            onClick={() => setFilterSev(null)}
            className="px-3 py-1.5 rounded text-[12px] font-medium transition-colors"
            style={{
              backgroundColor: !filterSev ? "#0F172A" : "#fff",
              color: !filterSev ? "#fff" : "#64748B",
              border: !filterSev ? "1px solid #0F172A" : "1px solid #E2E8F0",
            }}
          >
            All <span className="ml-1 opacity-60">{projects.length}</span>
          </button>
          {SEVERITY_ORDER.filter((s) => severityCounts[s]).map((s) => {
            const cfg = SEV[s] ?? SEV.default;
            const active = filterSev === s;
            return (
              <button
                key={s}
                onClick={() => setFilterSev(active ? null : s)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: active ? cfg.accent : cfg.bg,
                  color: active ? "#fff" : cfg.iconColor,
                  border: `1px solid ${active ? cfg.accent : cfg.accent + "30"}`,
                }}
              >
                <cfg.Icon style={{ width: 12, height: 12 }} />
                {cfg.label}
                <span
                  className="px-1.5 py-0.5 rounded text-[10px] font-bold"
                  style={{
                    backgroundColor: active ? "rgba(255,255,255,0.25)" : cfg.badgeBg,
                    color: active ? "#fff" : cfg.badgeText,
                  }}
                >
                  {severityCounts[s]}
                </span>
              </button>
            );
          })}
          {filterSev && (
            <button
              onClick={() => setFilterSev(null)}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded text-[12px] text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              <X className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        {/* ── Project rows ── */}
        {visible.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <FolderOpen className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-[14px] font-medium text-gray-500">No projects found</p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {visible.map((project) => (
              <ProjectRow
                key={project.id}
                project={project}
                open={openIds.has(project.id)}
                onToggle={() => toggle(project.id)}
                onPipelineClick={onPipelineClick}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
