import { useState, useMemo, useCallback, useEffect } from "react";
import {
  Search,
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Minus,
  Zap,
  CheckCircle,
  Activity,
  Layers,
} from "lucide-react";
import {
  MOCK_PROJECTS,
  Project,
  ProjectSeverity,
  ComponentStatus,
  Pipeline,
  Account,
  Cluster,
} from "@/data/mockData";
import { PipelineDetailPanel } from "@/app/components/ui/PipelineDetailPanel";

// ── Design tokens ──────────────────────────────────────────────────────────────

const TEAL      = "#00775B";
const PANEL_BG  = "#FFFFFF";
const PANEL_SEP = "#E2E8F0";

// Severity palette — light theme
const SEV: Record<string, {
  accent: string; text: string; badge: string; badgeBg: string;
}> = {
  critical: { accent: "#E7000B", text: "#E7000B", badge: "#E7000B", badgeBg: "rgba(231,0,11,0.08)"   },
  high:     { accent: "#EA580C", text: "#C2410C", badge: "#C2410C", badgeBg: "rgba(234,88,12,0.08)"  },
  medium:   { accent: "#E19A04", text: "#B45309", badge: "#B45309", badgeBg: "rgba(225,154,4,0.10)"  },
  stable:   { accent: "#00A63E", text: "#00843A", badge: "#00843A", badgeBg: "rgba(0,166,62,0.09)"   },
  resolved: { accent: "#64748B", text: "#475569", badge: "#475569", badgeBg: "rgba(100,116,139,0.10)" },
  default:  { accent: "#CBD5E1", text: "#64748B", badge: "#64748B", badgeBg: "#F1F5F9"               },
};

// Component status → dot colour
const COMP_DOT: Record<ComponentStatus, string> = {
  critical: "#E7000B",
  warning:  "#E19A04",
  stable:   "#00A63E",
  info:     "#2B7FFF",
};

// ── Severity icon ──────────────────────────────────────────────────────────────

function SevIcon({ sev, size = 11 }: { sev: ProjectSeverity; size?: number }) {
  const iconMap: Record<ProjectSeverity, React.ElementType> = {
    critical: AlertCircle,
    high:     AlertTriangle,
    medium:   Zap,
    stable:   CheckCircle,
    resolved: CheckCircle2,
    default:  Minus,
  };
  const Icon  = iconMap[sev] ?? Minus;
  const color = (SEV[sev] ?? SEV.default).text;
  return <Icon style={{ width: size, height: size, color, flexShrink: 0 }} />;
}

// ── Pipeline row (inside dark panel) ──────────────────────────────────────────

interface PipelineRowProps {
  pipeline: Pipeline;
  isSelected: boolean;
  onClick: () => void;
}

function PipelineRow({ pipeline, isSelected, onClick }: PipelineRowProps) {
  const [hov, setHov] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      className="w-full flex items-center gap-2.5 text-left transition-all duration-150 relative"
      style={{
        padding: "7px 12px 7px 14px",
        backgroundColor: isSelected
          ? "rgba(0,119,91,0.07)"
          : hov ? "#F8FAFC" : "transparent",
        borderLeft: `2px solid ${isSelected ? TEAL : "transparent"}`,
      }}
    >
      {/* pipeline colour stripe */}
      <div
        style={{
          width: 3, height: 18, borderRadius: 2,
          backgroundColor: pipeline.headerColor,
          flexShrink: 0, opacity: isSelected ? 1 : 0.55,
        }}
      />

      {/* name */}
      <span
        className="flex-1 truncate"
        style={{
          fontSize: 11,
          color: isSelected ? TEAL : "#334155",
          fontWeight: isSelected ? 600 : 400,
        }}
      >
        {pipeline.name}
      </span>

      {/* component status dots */}
      <div className="flex items-center gap-1 flex-shrink-0">
        {pipeline.comps.map((comp) => (
          <div
            key={comp.name}
            title={`${comp.name}: ${comp.status}`}
            style={{
              width: 6, height: 6, borderRadius: "50%",
              backgroundColor: COMP_DOT[comp.status] ?? "#94A3B8",
            }}
          />
        ))}
      </div>

      {/* active chevron */}
      {isSelected && (
        <ChevronRight style={{ width: 10, height: 10, color: TEAL, flexShrink: 0 }} />
      )}
    </button>
  );
}

// ── Project section (collapsible) ──────────────────────────────────────────────

interface ProjectSectionProps {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  selectedPipelineId: string | null;
  onSelectPipeline: (project: Project, pipeline: Pipeline) => void;
}

function ProjectSection({
  project,
  isOpen,
  onToggle,
  selectedPipelineId,
  onSelectPipeline,
}: ProjectSectionProps) {
  const [hov, setHov] = useState(false);
  const t = SEV[project.severity] ?? SEV.default;
  const hasActivePipeline = project.pipelines.some((p) => p.id === selectedPipelineId);

  return (
    <div style={{ borderBottom: `1px solid ${PANEL_SEP}` }}>
      {/* header */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        className="w-full flex items-center gap-2.5 text-left transition-all duration-150"
        style={{
          padding: "9px 12px",
          backgroundColor: isOpen
            ? "#F8FAFC"
            : hov ? "#F8FAFC" : "transparent",
          borderLeft: `2px solid ${isOpen || hasActivePipeline ? t.accent : "transparent"}`,
        }}
      >
        <SevIcon sev={project.severity} />

        <div className="flex-1 min-w-0">
          <div
            className="truncate leading-tight"
            style={{
              fontSize: 12,
              color: isOpen ? "#0F172A" : "#334155",
              fontWeight: isOpen ? 600 : 500,
            }}
          >
            {project.name}
          </div>
          <div style={{ fontSize: 10, color: "#94A3B8", marginTop: 2 }}>
            {project.pipelineCount} pipeline{project.pipelineCount !== 1 ? "s" : ""} · {project.lastActive}
          </div>
        </div>

        {/* severity badge */}
        <span
          style={{
            fontSize: 8, fontWeight: 700,
            padding: "2px 5px", borderRadius: 3,
            backgroundColor: t.badgeBg, color: t.badge,
            letterSpacing: "0.05em", textTransform: "uppercase",
            flexShrink: 0,
          }}
        >
          {project.severity}
        </span>

        <ChevronDown
          style={{
            width: 12, height: 12, flexShrink: 0,
            color: "#CBD5E1",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.18s",
          }}
        />
      </button>

      {/* pipeline rows */}
      {isOpen && (
        <div style={{ paddingBottom: 4, backgroundColor: "#FAFBFC" }}>
          {project.pipelines.length === 0 ? (
            <div style={{ padding: "8px 16px", fontSize: 11, color: "#94A3B8" }}>
              No pipelines configured
            </div>
          ) : (
            project.pipelines.map((pipeline) => (
              <PipelineRow
                key={pipeline.id}
                pipeline={pipeline}
                isSelected={pipeline.id === selectedPipelineId}
                onClick={() => onSelectPipeline(project, pipeline)}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

// ── Sticky group header ────────────────────────────────────────────────────────

function GroupHeader({
  label,
  count,
  Icon,
  accent,
}: {
  label: string;
  count: number;
  Icon: React.ElementType;
  accent: string;
}) {
  return (
    <div
      className="flex items-center gap-2"
      style={{
        padding: "5px 12px",
        backgroundColor: "#F1F5F9",
        borderBottom: `1px solid ${PANEL_SEP}`,
        borderTop: `1px solid ${PANEL_SEP}`,
      }}
    >
      <Icon style={{ width: 10, height: 10, color: accent, flexShrink: 0 }} />
      <span
        style={{
          fontSize: 9, fontWeight: 700,
          color: accent, letterSpacing: "0.08em", textTransform: "uppercase",
        }}
      >
        {label}
      </span>
      <span
        style={{
          fontSize: 8, fontWeight: 700,
          padding: "1px 5px", borderRadius: 3,
          backgroundColor: `${accent}18`, color: accent,
        }}
      >
        {count}
      </span>
    </div>
  );
}

// ── Severity filter pill ───────────────────────────────────────────────────────

type SeverityFilter = "all" | ProjectSeverity;

const SEV_TABS: {
  id: SeverityFilter;
  label: string;
  dot?: string;
  activeBg: string;
}[] = [
  { id: "all",      label: "All",      activeBg: "#0F172A" },
  { id: "critical", label: "Critical", dot: "#E7000B", activeBg: "#E7000B" },
  { id: "high",     label: "High",     dot: "#EA580C", activeBg: "#EA580C" },
  { id: "medium",   label: "Medium",   dot: "#E19A04", activeBg: "#B37A00" },
  { id: "stable",   label: "Stable",   dot: "#00A63E", activeBg: "#00843A" },
  { id: "resolved", label: "Resolved", dot: "#64748B", activeBg: "#475569" },
];

const ATTENTION_SEVS: ProjectSeverity[] = ["critical", "high", "medium"];
const HEALTHY_SEVS:   ProjectSeverity[] = ["stable", "resolved", "default"];

// ── Projects page ──────────────────────────────────────────────────────────────

interface ProjectsProps {
  account: Account | null;
  cluster?: Cluster | null;
  initialOpenId?: string | null;
  onBack: () => void;
  onBackToDesk?: () => void;
  onSelectPipeline?: (project: Project, pipeline: Pipeline) => void;
  onEnterProject?: (project: Project) => void;
}

// helper – first project + pipeline visible for a given cluster
function getDefaults(cluster: Cluster | null | undefined) {
  const projs = MOCK_PROJECTS.filter((p) => !cluster || p.clusterId === cluster.id);
  const first  = projs[0] ?? null;
  return {
    project:  first,
    pipeline: first?.pipelines[0] ?? null,
  };
}

export function Projects({ account, cluster, initialOpenId }: ProjectsProps) {
  const [query,          setQuery]          = useState("");
  const [severityFilter, setSeverityFilter] = useState<SeverityFilter>("all");

  // ── Initial defaults ───────────────────────────────────────────────────────
  const { project: defProject, pipeline: defPipeline } = useMemo(
    () => getDefaults(cluster),
    [] // eslint-disable-line react-hooks/exhaustive-deps — intentionally only on mount
  );

  const [openIds, setOpenIds] = useState<Set<string>>(() => {
    const s = new Set<string>();
    if (initialOpenId) s.add(initialOpenId);
    else if (defProject) s.add(defProject.id);
    return s;
  });

  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(defPipeline);
  const [selectedProject,  setSelectedProject]  = useState<Project  | null>(defProject);

  // ── When breadcrumb switches project (initialOpenId changes) ──────────────
  useEffect(() => {
    if (!initialOpenId) return;
    const proj = MOCK_PROJECTS.find((p) => p.id === initialOpenId);
    if (!proj) return;
    setOpenIds((prev) => {
      if (prev.has(initialOpenId)) return prev;
      return new Set([...prev, initialOpenId]);
    });
    if (proj.pipelines.length > 0) {
      setSelectedProject(proj);
      setSelectedPipeline(proj.pipelines[0]);
    }
  }, [initialOpenId]);

  // ── Filter logic ──────────────────────────────────────────────────────────
  const baseFiltered = useMemo(
    () =>
      MOCK_PROJECTS.filter(
        (p) =>
          (!cluster || p.clusterId === cluster.id) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, cluster]
  );

  const filtered = useMemo(
    () =>
      severityFilter === "all"
        ? baseFiltered
        : baseFiltered.filter((p) => p.severity === severityFilter),
    [baseFiltered, severityFilter]
  );

  const sevCounts = useMemo<Record<SeverityFilter, number>>(
    () => ({
      all:      baseFiltered.length,
      critical: baseFiltered.filter((p) => p.severity === "critical").length,
      high:     baseFiltered.filter((p) => p.severity === "high").length,
      medium:   baseFiltered.filter((p) => p.severity === "medium").length,
      stable:   baseFiltered.filter((p) => p.severity === "stable").length,
      resolved: baseFiltered.filter((p) => p.severity === "resolved").length,
      default:  baseFiltered.filter((p) => p.severity === "default").length,
    }),
    [baseFiltered]
  );

  const attentionProjects = useMemo(
    () => filtered.filter((p) => ATTENTION_SEVS.includes(p.severity)),
    [filtered]
  );
  const healthyProjects = useMemo(
    () => filtered.filter((p) => HEALTHY_SEVS.includes(p.severity)),
    [filtered]
  );

  const toggleItem = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleSelectPipeline = useCallback((project: Project, pipeline: Pipeline) => {
    setSelectedProject(project);
    setSelectedPipeline(pipeline);
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full overflow-hidden">

      {/* ── LEFT: project navigator ──────────────────────────────────────── */}
      <div
        className="flex flex-col flex-shrink-0 overflow-hidden"
        style={{
          width: 340,
          backgroundColor: PANEL_BG,
          borderRight: `1px solid ${PANEL_SEP}`,
        }}
      >
        {/* ── Header bar ─────────────────────────────────────────────────── */}
        <div
          className="flex items-center gap-2.5 px-3 flex-shrink-0"
          style={{
            height: 44,
            borderBottom: `1px solid ${PANEL_SEP}`,
            backgroundColor: "#F8FAFC",
          }}
        >
          <Layers style={{ width: 13, height: 13, color: TEAL, flexShrink: 0 }} />
          <span style={{ fontSize: 11, fontWeight: 700, color: "#0F172A", letterSpacing: "0.03em" }}>
            Projects
          </span>
          <span
            style={{
              marginLeft: "auto",
              fontSize: 9, fontWeight: 700,
              padding: "2px 6px", borderRadius: 4,
              backgroundColor: "rgba(0,119,91,0.10)", color: TEAL,
            }}
          >
            {baseFiltered.length}
          </span>
        </div>

        {/* ── Search ─────────────────────────────────────────────────────── */}
        <div className="px-3 py-2.5 flex-shrink-0" style={{ borderBottom: `1px solid ${PANEL_SEP}` }}>
          <div className="relative">
            <Search
              style={{
                position: "absolute", left: 9, top: "50%",
                transform: "translateY(-50%)",
                width: 12, height: 12, color: "#94A3B8",
              }}
            />
            <input
              type="text"
              placeholder="Search projects…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              style={{
                width: "100%", height: 32,
                paddingLeft: 28, paddingRight: 10,
                backgroundColor: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 6,
                fontSize: 11,
                color: "#0F172A",
                outline: "none",
              }}
              className="placeholder:text-slate-400 focus:border-[#00775B] transition-colors"
            />
          </div>
        </div>

        {/* ── Severity filter tabs ────────────────────────────────────────── */}
        <div
          className="flex flex-wrap gap-1 px-3 py-2 flex-shrink-0"
          style={{ borderBottom: `1px solid ${PANEL_SEP}` }}
        >
          {SEV_TABS.map((tab) => {
            const isActive   = severityFilter === tab.id;
            const count      = sevCounts[tab.id] ?? 0;
            const isDisabled = count === 0 && tab.id !== "all";
            return (
              <button
                key={tab.id}
                onClick={() => !isDisabled && setSeverityFilter(tab.id)}
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
                  <span
                    style={{
                      width: 5, height: 5, borderRadius: "50%",
                      backgroundColor: isActive ? "#fff" : tab.dot,
                    }}
                  />
                )}
                {tab.label}
                <span style={{ fontSize: 9, opacity: 0.75 }}>{count}</span>
              </button>
            );
          })}
        </div>

        {/* ── Project list ────────────────────────────────────────────────── */}
        <div className="flex-1 overflow-auto">
          {attentionProjects.length > 0 && (
            <>
              <GroupHeader
                label="Needs attention"
                count={attentionProjects.length}
                Icon={AlertTriangle}
                accent="#F87171"
              />
              {attentionProjects.map((project) => (
                <ProjectSection
                  key={project.id}
                  project={project}
                  isOpen={openIds.has(project.id)}
                  onToggle={() => toggleItem(project.id)}
                  selectedPipelineId={selectedPipeline?.id ?? null}
                  onSelectPipeline={handleSelectPipeline}
                />
              ))}
            </>
          )}

          {healthyProjects.length > 0 && (
            <>
              <GroupHeader
                label="Healthy"
                count={healthyProjects.length}
                Icon={CheckCircle2}
                accent="#34D399"
              />
              {healthyProjects.map((project) => (
                <ProjectSection
                  key={project.id}
                  project={project}
                  isOpen={openIds.has(project.id)}
                  onToggle={() => toggleItem(project.id)}
                  selectedPipelineId={selectedPipeline?.id ?? null}
                  onSelectPipeline={handleSelectPipeline}
                />
              ))}
            </>
          )}

          {filtered.length === 0 && (
            <div
              style={{
                padding: "48px 20px", textAlign: "center",
                fontSize: 12, color: "#94A3B8",
              }}
            >
              No projects match "{query}"
            </div>
          )}
        </div>

        {/* ── Footer: project / pipeline count ──────────────────────────── */}
        <div
          className="flex items-center justify-between px-3 flex-shrink-0"
          style={{
            height: 34,
            borderTop: `1px solid ${PANEL_SEP}`,
            backgroundColor: "#F8FAFC",
          }}
        >
          <div className="flex items-center gap-1.5">
            <Activity style={{ width: 10, height: 10, color: "#CBD5E1" }} />
            <span style={{ fontSize: 10, color: "#94A3B8" }}>
              {filtered.length} project{filtered.length !== 1 ? "s" : ""}
            </span>
          </div>
          {selectedPipeline && (
            <span
              style={{
                fontSize: 9, fontWeight: 600,
                padding: "2px 7px", borderRadius: 3,
                backgroundColor: "rgba(0,119,91,0.10)", color: TEAL,
                maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {selectedPipeline.name}
            </span>
          )}
        </div>
      </div>

      {/* ── RIGHT: pipeline detail panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
        {selectedPipeline && selectedProject ? (
          <PipelineDetailPanel
            key={selectedPipeline.id}
            pipeline={selectedPipeline}
            project={selectedProject}
          />
        ) : (
          <div
            className="flex-1 flex flex-col items-center justify-center gap-3"
            style={{ color: "#94A3B8" }}
          >
            <Layers style={{ width: 32, height: 32, opacity: 0.3 }} />
            <span style={{ fontSize: 13 }}>Select a pipeline to view details</span>
          </div>
        )}
      </div>
    </div>
  );
}
