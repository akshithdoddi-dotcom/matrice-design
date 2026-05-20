import { useState } from "react";
import {
  Plus, Trash2, ArrowUpRight, FolderOpen,
  LayoutGrid, List, Clock, Cpu, Tag,
} from "lucide-react";
import { Button } from "@fe-common/components/ui/Button";
import {
  DataGrid, MonoCell, InterCell, GridActions,
  GridActionButton, StatusCapsule,
} from "@fe-common/components/ui/DataGrid";
import { SegmentedControl } from "@fe-common/components/ui/segmented-control";
import { TrainingProject } from "@/app/data/mockData";
import { CreateProjectModal } from "@/app/components/pages/CreateProjectModal";
import { cn } from "@/app/lib/utils";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "unknown", training: "active", complete: "success",
  failed: "critical", paused: "pending",
};
const STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete",
  failed: "Failed", paused: "Paused",
};

const STATUS_COLOR: Record<TrainingProject["status"], { bg: string; text: string; dot: string }> = {
  draft:    { bg: "bg-neutral-100",     text: "text-neutral-500", dot: "bg-neutral-400" },
  training: { bg: "bg-blue-50",         text: "text-blue-600",    dot: "bg-blue-500" },
  complete: { bg: "bg-[#E5FFF9]",       text: "text-[#00775B]",   dot: "bg-[#00775B]" },
  failed:   { bg: "bg-red-50",          text: "text-red-600",     dot: "bg-red-500" },
  paused:   { bg: "bg-amber-50",        text: "text-amber-600",   dot: "bg-amber-500" },
};

const TYPE_COLOR: Record<TrainingProject["type"], { bg: string; text: string }> = {
  build:  { bg: "bg-[#00775B]/10", text: "text-[#00775B]" },
  deploy: { bg: "bg-[#0284C7]/10", text: "text-[#0284C7]" },
};

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyState({ onNew }: { onNew: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-5">
      <div className="w-16 h-16 rounded-sm bg-[#00775B]/8 border border-[#00775B]/15 flex items-center justify-center">
        <FolderOpen className="w-7 h-7 text-[#00775B]/60" />
      </div>
      <div className="text-center">
        <p className="text-sm font-semibold text-neutral-700">No projects yet</p>
        <p className="text-xs text-neutral-400 mt-1">Create your first project to start training models.</p>
      </div>
      <Button onClick={onNew} className="bg-[#00775B] hover:bg-[#006649] text-white border-transparent h-9 text-sm gap-2">
        <Plus className="w-4 h-4" /> New Project
      </Button>
    </div>
  );
}

// ─── Card view ────────────────────────────────────────────────────────────────

function ProjectCard({
  project,
  onOpen,
  onDelete,
}: {
  project: TrainingProject;
  onOpen: (p: TrainingProject) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}) {
  const sc = STATUS_COLOR[project.status];
  const tc = TYPE_COLOR[project.type];

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => onOpen(project)}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpen(project); }}
      className="group relative bg-white border border-neutral-200 rounded-sm p-5 flex flex-col gap-4 hover:border-[#00775B]/40 hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00775B]"
    >
      {/* Top row: name + type badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[13px] font-semibold text-neutral-900 truncate leading-snug">
            {project.name}
          </p>
          <p className="text-[11px] text-neutral-400 mt-0.5">{project.industry}</p>
        </div>
        <span className={cn(
          "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm",
          tc.bg, tc.text,
        )}>
          {project.type}
        </span>
      </div>

      {/* Meta pills */}
      <div className="flex flex-wrap gap-1.5">
        <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded-sm">
          <Tag className="w-3 h-3" />{project.inputType}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded-sm">
          <Cpu className="w-3 h-3" />{project.computeType}
        </span>
        <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-50 border border-neutral-100 px-2 py-0.5 rounded-sm font-mono">
          <Clock className="w-3 h-3" />{project.createdAt}
        </span>
      </div>

      {/* Footer: status + actions */}
      <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
        <span className={cn(
          "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2.5 py-1 rounded-full",
          sc.bg, sc.text,
        )}>
          <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
          {STATUS_LABEL[project.status]}
        </span>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            title="Open Project"
            onClick={(e) => { e.stopPropagation(); onOpen(project); }}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-neutral-400 hover:text-[#00775B] hover:bg-[#00775B]/8 transition-colors"
          >
            <ArrowUpRight className="w-4 h-4" />
          </button>
          <button
            title="Delete"
            onClick={(e) => onDelete(project.id, e)}
            className="w-7 h-7 flex items-center justify-center rounded-sm text-neutral-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── AllProjects ──────────────────────────────────────────────────────────────

interface AllProjectsProps {
  projects: TrainingProject[];
  onProjectsChange: (projects: TrainingProject[]) => void;
  onOpenProject: (project: TrainingProject) => void;
}

export function AllProjects({ projects, onProjectsChange, onOpenProject }: AllProjectsProps) {
  const [modalOpen, setModalOpen] = useState(false);
  const [view, setView] = useState<"card" | "table">("card");

  function handleCreated(project: TrainingProject) {
    onProjectsChange([project, ...projects]);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    onProjectsChange(projects.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-5 p-6">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">All Projects</h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <SegmentedControl
            size="sm"
            value={view}
            onChange={(v) => setView(v as "card" | "table")}
            options={[
              { value: "card",  icon: <LayoutGrid className="w-3.5 h-3.5" /> },
              { value: "table", icon: <List        className="w-3.5 h-3.5" /> },
            ]}
          />
          <Button
            onClick={() => setModalOpen(true)}
            className="bg-[#00775B] hover:bg-[#006649] text-white border-transparent h-9 text-xs gap-2 font-semibold uppercase tracking-wide shadow-sm"
          >
            <Plus className="w-3.5 h-3.5" /> New Project
          </Button>
        </div>
      </div>

      {/* Content */}
      {projects.length === 0 ? (
        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
          <EmptyState onNew={() => setModalOpen(true)} />
        </div>
      ) : view === "card" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {projects.map((p) => (
            <ProjectCard
              key={p.id}
              project={p}
              onOpen={onOpenProject}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
          <DataGrid<TrainingProject>
            searchable
            searchPlaceholder="Search projects…"
            pageSize={10}
            columns={[
              {
                key: "name",
                header: "Project Name",
                searchValue: (row) => row.name,
                render: (row, hovered) => (
                  <InterCell hovered={hovered} fontSize={11} isPrimary>
                    {row.name}
                  </InterCell>
                ),
              },
              {
                key: "type",
                header: "Type",
                width: "70px",
                render: (row) => (
                  <span className={cn(
                    "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm",
                    TYPE_COLOR[row.type].bg, TYPE_COLOR[row.type].text,
                  )}>
                    {row.type}
                  </span>
                ),
              },
              {
                key: "inputType",
                header: "Input",
                width: "70px",
                render: (row, hovered) => (
                  <InterCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#334155">
                    {row.inputType}
                  </InterCell>
                ),
              },
              {
                key: "outputType",
                header: "Output",
                width: "140px",
                render: (row, hovered) => (
                  <InterCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#334155">
                    {row.outputType.replace("_", " ")}
                  </InterCell>
                ),
              },
              {
                key: "industry",
                header: "Industry",
                width: "120px",
                render: (row, hovered) => (
                  <InterCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#334155">
                    {row.industry}
                  </InterCell>
                ),
              },
              {
                key: "status",
                header: "Status",
                width: "100px",
                render: (row) => (
                  <StatusCapsule status={STATUS_KEY[row.status]} label={STATUS_LABEL[row.status]} />
                ),
              },
              {
                key: "createdAt",
                header: "Created",
                width: "96px",
                align: "right",
                render: (row, hovered) => (
                  <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">
                    {row.createdAt}
                  </MonoCell>
                ),
              },
              {
                key: "actions",
                header: "",
                width: "80px",
                align: "right",
                render: (row, hovered) => (
                  <div className="flex justify-end pr-1">
                    <GridActions visible={hovered}>
                      <GridActionButton
                        title="Open Project"
                        hoverColor="#00775B"
                        onClick={(e) => { e.stopPropagation(); onOpenProject(row); }}
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </GridActionButton>
                      <GridActionButton
                        title="Delete"
                        hoverColor="#BE123C"
                        onClick={(e) => handleDelete(row.id, e)}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </GridActionButton>
                    </GridActions>
                  </div>
                ),
              },
            ]}
            data={projects}
            onRowClick={(row) => onOpenProject(row)}
          />
        </div>
      )}

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
