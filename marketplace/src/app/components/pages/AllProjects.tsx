import { useState } from "react";
import { Plus, Trash2, ArrowUpRight, FolderOpen } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@/app/components/ui/DataGrid";
import { TrainingProject } from "@/app/data/mockData";
import { CreateProjectModal } from "@/app/components/pages/CreateProjectModal";
import { cn } from "@/app/lib/utils";

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "unknown", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
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

// ─── AllProjects ──────────────────────────────────────────────────────────────

interface AllProjectsProps {
  projects: TrainingProject[];
  onProjectsChange: (projects: TrainingProject[]) => void;
  onOpenProject: (project: TrainingProject) => void;
}

export function AllProjects({ projects, onProjectsChange, onOpenProject }: AllProjectsProps) {
  const [modalOpen, setModalOpen] = useState(false);

  function handleCreated(project: TrainingProject) {
    onProjectsChange([project, ...projects]);
  }

  function handleDelete(id: string, e: React.MouseEvent) {
    e.stopPropagation();
    onProjectsChange(projects.filter((p) => p.id !== id));
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">All Projects</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{projects.length} project{projects.length !== 1 ? "s" : ""}</p>
        </div>
        <Button
          onClick={() => setModalOpen(true)}
          className="bg-[#00775B] hover:bg-[#006649] text-white border-transparent h-9 text-xs gap-2 font-semibold uppercase tracking-wide shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" /> New Project
        </Button>
      </div>

      {/* Table or empty state */}
      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
        {projects.length === 0 ? (
          <EmptyState onNew={() => setModalOpen(true)} />
        ) : (
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
                    row.type === "build"
                      ? "bg-[#00775B]/10 text-[#00775B]"
                      : "bg-[#0284C7]/10 text-[#0284C7]"
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
        )}
      </div>

      <CreateProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
}
