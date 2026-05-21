import { useState, useMemo, useCallback } from "react";
import {
  Search,
  FolderOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Minus,
  Zap,
  CheckCircle,
  Info,
  Briefcase,
  FolderOpen as FolderIcon,
} from "lucide-react";
import { MOCK_PROJECTS, Project, ProjectSeverity, ComponentStatus, Pipeline, Account, Cluster } from "@/data/mockData";
import { cn } from "@/app/lib/utils";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";

// ── Design tokens ─────────────────────────────────────────────────────────────

const SEV = {
  default:  { stripe: "#CBD5E1", border: "#E2E8F0",                bg: "#ffffff",                  badgeBg: "#F1F5F9",               badgeColor: "#64748B",  shadow: "0 4px 20px rgba(0,0,0,0.08)",       iconColor: "#475569", titleOpen: "#0F172A" },
  critical: { stripe: "#E7000B", border: "rgba(231,0,11,0.20)",    bg: "rgba(231,0,11,0.04)",      badgeBg: "rgba(231,0,11,0.08)",   badgeColor: "#E7000B",  shadow: "0 4px 20px rgba(231,0,11,0.12)",    iconColor: "#E7000B", titleOpen: "#E7000B" },
  high:     { stripe: "#EA580C", border: "rgba(234,88,12,0.20)",   bg: "rgba(234,88,12,0.04)",     badgeBg: "rgba(234,88,12,0.08)",  badgeColor: "#EA580C",  shadow: "0 4px 20px rgba(234,88,12,0.12)",   iconColor: "#EA580C", titleOpen: "#EA580C" },
  medium:   { stripe: "#E19A04", border: "rgba(225,154,4,0.20)",   bg: "rgba(225,154,4,0.04)",     badgeBg: "rgba(225,154,4,0.08)",  badgeColor: "#B37A00",  shadow: "0 4px 20px rgba(225,154,4,0.12)",   iconColor: "#E19A04", titleOpen: "#B37A00" },
  stable:   { stripe: "#00A63E", border: "rgba(0,166,62,0.20)",    bg: "rgba(0,166,62,0.04)",      badgeBg: "rgba(0,166,62,0.08)",   badgeColor: "#00A63E",  shadow: "0 4px 20px rgba(0,166,62,0.12)",    iconColor: "#00A63E", titleOpen: "#00A63E" },
  resolved: { stripe: "#94A3B8", border: "rgba(100,116,139,0.20)", bg: "rgba(100,116,139,0.04)",   badgeBg: "rgba(100,116,139,0.08)",badgeColor: "#64748B",  shadow: "0 4px 20px rgba(100,116,139,0.10)", iconColor: "#64748B", titleOpen: "#475569" },
} as const;

const COMP_STATUS: Record<ComponentStatus, { Icon: React.ElementType; color: string; bg: string }> = {
  critical: { Icon: AlertCircle,   color: "#E7000B", bg: "rgba(231,0,11,0.08)"   },
  warning:  { Icon: AlertTriangle, color: "#E19A04", bg: "rgba(225,154,4,0.08)"  },
  stable:   { Icon: CheckCircle2,  color: "#00A63E", bg: "rgba(0,166,62,0.08)"   },
  info:     { Icon: Info,          color: "#2B7FFF", bg: "rgba(43,127,255,0.08)" },
};

// ── Severity icon ─────────────────────────────────────────────────────────────

function SeverityDot({ severity }: { severity: ProjectSeverity }) {
  const s = SEV[severity] ?? SEV.default;
  const icons: Record<ProjectSeverity, React.ElementType> = {
    critical: AlertCircle,
    high:     AlertTriangle,
    medium:   Zap,
    stable:   CheckCircle,
    resolved: CheckCircle2,
    default:  Minus,
  };
  const Icon = icons[severity];
  return <Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.iconColor }} />;
}

// ── Pipeline table columns ────────────────────────────────────────────────────

const pipelineCols: ColumnDef<Pipeline>[] = [
  {
    id: "color",
    header: "",
    minWidth: 16,
    maxWidth: 16,
    sortable: false,
    cell: ({ row }) => (
      <div style={{ width: 6, height: 22, borderRadius: 3, backgroundColor: row.headerColor }} />
    ),
  },
  {
    id: "name",
    header: "Pipeline",
    accessorKey: "name",
    minWidth: 160,
    cell: ({ row }) => (
      <span className="text-[12px] font-medium text-[#0F172A]">{row.name}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    minWidth: 140,
    sortable: false,
    cell: ({ row }) => (
      <div style={{ display: "flex", gap: 3 }}>
        {row.comps.map(comp => {
          const st = COMP_STATUS[comp.status];
          return (
            <div key={comp.name} style={{ display: "flex", alignItems: "center", gap: 2, padding: "2px 5px", borderRadius: 3, backgroundColor: st.bg }}>
              <st.Icon style={{ width: 9, height: 9, color: st.color }} />
              <span style={{ fontSize: 9, color: st.color, fontWeight: 600 }}>{comp.name.slice(0, 3)}</span>
            </div>
          );
        })}
      </div>
    ),
  },
  {
    id: "note",
    header: "Note",
    accessorKey: "note",
    minWidth: 110,
    cell: ({ row }) => (
      <span className="text-[10px] text-[#94A3B8] truncate">{row.note}</span>
    ),
  },
];

// ── Project accordion row ─────────────────────────────────────────────────────

interface ProjectRowProps {
  project: Project;
  isOpen: boolean;
  onToggle: () => void;
  onSelectPipeline?: (pipeline: Pipeline) => void;
}

function ProjectRow({ project, isOpen, onToggle, onSelectPipeline }: ProjectRowProps) {
  const [hovered, setHovered] = useState(false);
  const s = SEV[project.severity] ?? SEV.default;
  const isDefault = project.severity === "default";

  const badge =
    project.severity === "stable" || project.severity === "resolved"
      ? "Healthy"
      : `${project.pipelineCount} pipeline${project.pipelineCount !== 1 ? "s" : ""}`;

  return (
    <div
      className="rounded-[8px] overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isOpen ? s.border : "#E2E8F0"}`,
        borderLeft: `3px solid ${s.stripe}`,
        backgroundColor: isOpen ? s.bg : "#ffffff",
        boxShadow: isOpen ? s.shadow : hovered ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Trigger */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-3 px-4 text-left outline-none transition-all duration-200"
        style={{ height: 52, backgroundColor: !isOpen && hovered ? "#F8FAFC" : "transparent" }}
      >
        <SeverityDot severity={project.severity} />

        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] leading-tight truncate transition-all duration-200"
            style={{ color: isOpen ? s.titleOpen : "#0F172A", fontWeight: isOpen ? 700 : 500 }}
          >
            {project.name}
          </div>
          <div className="text-[11px] mt-0.5 leading-tight truncate text-[#94A3B8]">
            {project.pipelineCount} pipeline{project.pipelineCount !== 1 ? "s" : ""} · Last active {project.lastActive}
          </div>
        </div>

        <div
          className="flex-shrink-0 px-2.5 py-1 rounded-[3px] text-[10px] font-semibold transition-all duration-200"
          style={{
            backgroundColor: s.badgeBg,
            color: s.badgeColor,
            border: `1px solid ${isDefault ? "#E2E8F0" : s.border}`,
          }}
        >
          {badge}
        </div>

        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-all duration-200"
          style={{
            color: isDefault ? (isOpen ? "#475569" : "#CBD5E1") : s.iconColor,
            opacity: isOpen ? 1 : 0.5,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Content: pipeline table */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? 400 : 0 }}
      >
        <div style={{ borderTop: `1px dashed ${isDefault ? "#E2E8F0" : s.border}` }}>
          <div className="px-4 pt-3 pb-4">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[9px] font-bold uppercase tracking-[0.65px] text-[#94A3B8]">
                Inference Pipelines
              </span>
              <span
                className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                style={{ backgroundColor: isDefault ? "#F1F5F9" : s.badgeBg, color: isDefault ? "#64748B" : s.badgeColor }}
              >
                {project.pipelineCount}
              </span>
            </div>
            <DataTable
              data={project.pipelines}
              rowIdKey="id"
              columns={pipelineCols}
              toolbar={false}
              pagination="none"
              showRowCue={true}
              onRowClick={(pipeline) => onSelectPipeline?.(pipeline)}
              emptyState={{ title: "No pipelines", description: "No pipelines configured" }}
              striped={false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Pagination bar ─────────────────────────────────────────────────────────────

interface PaginationProps {
  total: number;
  page: number;
  perPage: number;
  onPage: (p: number) => void;
  label: string;
}

function Pagination({ total, page, perPage, onPage, label }: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const from = (page - 1) * perPage + 1;
  const to = Math.min(page * perPage, total);

  if (total === 0) return null;

  return (
    <div className="flex items-center justify-between pt-2 pb-1">
      <span className="text-[11px] text-[#94A3B8]">
        Showing {from}–{to} of {total} {label}
      </span>
      <div className="flex items-center gap-1">
        <button
          onClick={() => onPage(page - 1)}
          disabled={page === 1}
          className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#E2E8F0]"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
        </button>
        {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
          const p = i + 1;
          return (
            <button
              key={p}
              onClick={() => onPage(p)}
              className="w-7 h-7 rounded-[5px] text-[11px] font-medium flex items-center justify-center transition-all"
              style={{
                backgroundColor: p === page ? "#00775B" : "transparent",
                color: p === page ? "#fff" : "#64748B",
                border: p === page ? "none" : "1px solid #E2E8F0",
              }}
            >
              {p}
            </button>
          );
        })}
        {totalPages > 5 && <span className="text-[11px] text-[#94A3B8] px-1">…{totalPages}</span>}
        <button
          onClick={() => onPage(page + 1)}
          disabled={page === totalPages}
          className="w-7 h-7 rounded-[5px] flex items-center justify-center text-[#64748B] hover:bg-[#F1F5F9] disabled:opacity-30 disabled:cursor-not-allowed transition-colors border border-[#E2E8F0]"
        >
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

// ── Project group ─────────────────────────────────────────────────────────────

const ATTENTION_SEVS: ProjectSeverity[] = ["critical", "high", "medium"];
const HEALTHY_SEVS: ProjectSeverity[] = ["stable", "resolved", "default"];
const PER_PAGE = 10;

interface ProjectGroupProps {
  title: string;
  count: number;
  accentBg: string;
  accentText: string;
  accentBorder: string;
  Icon: React.ElementType;
  projects: Project[];
  openIds: Set<string>;
  onToggle: (id: string) => void;
  onSelectPipeline?: (project: Project, pipeline: Pipeline) => void;
}

function ProjectGroup({
  title,
  count,
  accentBg,
  accentText,
  accentBorder,
  Icon,
  projects,
  openIds,
  onToggle,
  onSelectPipeline,
}: ProjectGroupProps) {
  const [page, setPage] = useState(1);

  const paged = useMemo(
    () => projects.slice((page - 1) * PER_PAGE, page * PER_PAGE),
    [projects, page]
  );

  if (count === 0) return null;

  return (
    <div>
      {/* Group header */}
      <div
        className="flex items-center gap-2.5 px-4 py-2.5 rounded-[6px] mb-2"
        style={{ backgroundColor: accentBg, border: `1px solid ${accentBorder}` }}
      >
        <Icon className="w-3.5 h-3.5 flex-shrink-0" style={{ color: accentText }} />
        <span className="text-[11px] font-bold uppercase tracking-[0.07em]" style={{ color: accentText }}>
          {title}
        </span>
        <span
          className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
          style={{ backgroundColor: accentBorder, color: accentText }}
        >
          {count}
        </span>
      </div>

      {/* Project rows */}
      <div className="space-y-2">
        {paged.map((project) => (
          <ProjectRow
            key={project.id}
            project={project}
            isOpen={openIds.has(project.id)}
            onToggle={() => onToggle(project.id)}
            onSelectPipeline={(pl) => onSelectPipeline?.(project, pl)}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="mt-3">
        <Pagination
          total={projects.length}
          page={page}
          perPage={PER_PAGE}
          onPage={setPage}
          label="projects"
        />
      </div>
    </div>
  );
}

// ── Projects page ─────────────────────────────────────────────────────────────

interface ProjectsProps {
  account: Account | null;
  cluster?: Cluster | null;
  initialOpenId?: string | null;
  onBack: () => void;
  onBackToDesk?: () => void;
  onSelectPipeline?: (project: Project, pipeline: Pipeline) => void;
}

export function Projects({ account, cluster, initialOpenId, onBack, onBackToDesk, onSelectPipeline }: ProjectsProps) {
  const [query, setQuery] = useState("");
  const [openIds, setOpenIds] = useState<Set<string>>(
    () => new Set(initialOpenId ? [initialOpenId] : [])
  );

  const toggleItem = useCallback((id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const filtered = useMemo(
    () =>
      MOCK_PROJECTS.filter(
        (p) =>
          (!cluster || p.clusterId === cluster.id) &&
          p.name.toLowerCase().includes(query.toLowerCase())
      ),
    [query, cluster]
  );

  const attentionProjects = useMemo(
    () => filtered.filter((p) => ATTENTION_SEVS.includes(p.severity)),
    [filtered]
  );
  const healthyProjects = useMemo(
    () => filtered.filter((p) => HEALTHY_SEVS.includes(p.severity)),
    [filtered]
  );

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
          <FolderIcon className="w-4 h-4 text-white/80" />
          <span className="text-[13px] font-semibold text-white">
            {(account?.projectCount ?? 0).toLocaleString()} Projects
          </span>
        </div>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 space-y-6 overflow-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-1.5 text-[11px] text-[#94A3B8] flex-wrap">
          <button
            onClick={onBackToDesk ?? onBack}
            className="hover:text-[#00775B] transition-colors font-medium"
          >
            Support Desk
          </button>
          <span>›</span>
          <button
            onClick={onBack}
            className="hover:text-[#00775B] transition-colors font-medium truncate max-w-[160px]"
          >
            {account?.name ?? "Account"}
          </button>
          {cluster && (
            <>
              <span>›</span>
              <button
                onClick={onBack}
                className="hover:text-[#00775B] transition-colors font-medium truncate max-w-[160px]"
              >
                {cluster.name}
              </button>
            </>
          )}
          <span>›</span>
          <span className="text-[#0F172A] font-medium">Projects Overview</span>
        </div>

        {/* Search + count */}
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#94A3B8]" />
            <input
              type="text"
              placeholder="Search for projects and pipelines..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-[7px] border border-[#E2E8F0] bg-white text-[13px] text-[#0F172A] placeholder:text-[#94A3B8] outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[#00775B]/10 transition-all"
            />
          </div>
          <div className="flex items-center gap-1.5 h-10 px-3.5 rounded-[7px] border border-[#E2E8F0] bg-white text-[12px] text-[#64748B] flex-shrink-0">
            <FolderOpen className="w-3.5 h-3.5 text-[#94A3B8]" />
            Showing {filtered.length} of {MOCK_PROJECTS.length} projects
          </div>
        </div>

        {/* Needs Attention group */}
        <ProjectGroup
          title="Needs Attention"
          count={attentionProjects.length}
          accentBg="rgba(231,0,11,0.04)"
          accentText="#E7000B"
          accentBorder="rgba(231,0,11,0.15)"
          Icon={AlertTriangle}
          projects={attentionProjects}
          openIds={openIds}
          onToggle={toggleItem}
          onSelectPipeline={onSelectPipeline}
        />

        {/* Healthy group */}
        <ProjectGroup
          title="Healthy"
          count={healthyProjects.length}
          accentBg="rgba(0,166,62,0.04)"
          accentText="#00A63E"
          accentBorder="rgba(0,166,62,0.15)"
          Icon={CheckCircle2}
          projects={healthyProjects}
          openIds={openIds}
          onToggle={toggleItem}
          onSelectPipeline={onSelectPipeline}
        />

        {filtered.length === 0 && (
          <div className="text-center py-16 text-[13px] text-[#94A3B8]">
            No projects match "{query}"
          </div>
        )}
      </div>
    </div>
  );
}
