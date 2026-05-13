import { TrendingUp } from "lucide-react";
import { StatCard, StatCardData } from "@/app/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";
import { MOCK_PROJECTS, MOCK_TRAINING_JOBS, TrainingProject, TrainingJob } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── KPI card data ────────────────────────────────────────────────────────────

const DASHBOARD_STATS: StatCardData[] = [
  {
    label: "Total Projects",
    value: "8",
    sublabel: "Build & Deploy · All Time",
    num: "+2",
    ref_: "vs Last Month",
    dir: "up",
    chip: "ALL TIME",
    color: "#00775B",
    bgColor: "#E5FFF9",
  },
  {
    label: "Active Training Jobs",
    value: "3",
    sublabel: "Currently Running · Live",
    num: "+1",
    ref_: "vs Yesterday",
    dir: "up",
    chip: "LIVE",
    color: "#0284C7",
    bgColor: "#E0F2FE",
  },
  {
    label: "Datasets",
    value: "12",
    sublabel: "Across All Projects",
    num: "0",
    ref_: "No Change",
    dir: "neutral",
    chip: "STORED",
    color: "#7C3AED",
    bgColor: "#F3EEFF",
  },
  {
    label: "Models Deployed",
    value: "3",
    sublabel: "Live API Endpoints",
    num: "+1",
    ref_: "vs Last Week",
    dir: "up",
    chip: "DEPLOYED",
    color: "#059669",
    bgColor: "#ECFDF5",
  },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const PROJECT_STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "unknown", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const PROJECT_STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
};

const JOB_STATUS_KEY: Record<TrainingJob["status"], string> = {
  running: "active", queued: "info", paused: "pending",
};
const JOB_STATUS_LABEL: Record<TrainingJob["status"], string> = {
  running: "Running", queued: "Queued", paused: "Paused",
};

// ─── Dashboard ────────────────────────────────────────────────────────────────

interface TrainingDashboardProps {
  onOpenProject: (project: TrainingProject) => void;
}

export function TrainingDashboard({ onOpenProject }: TrainingDashboardProps) {
  const recentProjects = [...MOCK_PROJECTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  const activeJobs = MOCK_TRAINING_JOBS.filter(
    (j) => j.status === "running" || j.status === "queued"
  );
  const runningCount = MOCK_TRAINING_JOBS.filter((j) => j.status === "running").length;

  return (
    <div className="flex flex-col gap-6">

      {/* V12 Stat Cards — no sparklines, from Component Library */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {DASHBOARD_STATS.map((d) => (
          <StatCard key={d.label} d={d} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Projects — DataGrid Final Version */}
        <div className="xl:col-span-2 bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Recent Projects</h2>
            <span className="text-[10px] text-neutral-400">{recentProjects.length} shown</span>
          </div>
          <DataGrid<TrainingProject>
            columns={[
              {
                key: "name",
                header: "Project Name",
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
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">
                    {row.type}
                  </span>
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
                key: "status",
                header: "Status",
                width: "100px",
                render: (row) => (
                  <StatusCapsule
                    status={PROJECT_STATUS_KEY[row.status]}
                    label={PROJECT_STATUS_LABEL[row.status]}
                  />
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
            ]}
            data={recentProjects}
            compact
            onRowClick={(row) => onOpenProject(row)}
          />
        </div>

        {/* Active Training Jobs panel */}
        <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Active Jobs</h2>
            <div className="flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
              <span className="text-[10px] text-[#00775B] font-semibold">{runningCount} running</span>
            </div>
          </div>

          <div className="flex flex-col divide-y divide-neutral-100 flex-1 overflow-y-auto">
            {activeJobs.length === 0 ? (
              <div className="flex items-center justify-center flex-1 text-xs text-neutral-400 py-10">
                No active training jobs
              </div>
            ) : (
              activeJobs.map((job) => (
                <div key={job.id} className="px-5 py-3.5 hover:bg-neutral-50/70 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold text-neutral-800 truncate flex-1 mr-2">
                      {job.projectName}
                    </span>
                    <StatusCapsule
                      status={JOB_STATUS_KEY[job.status]}
                      label={JOB_STATUS_LABEL[job.status]}
                    />
                  </div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          job.status === "running" ? "bg-[#00775B]" : "bg-[#0284C7]/40"
                        )}
                        style={{ width: `${job.progress}%` }}
                      />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-500 shrink-0">{job.progress}%</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                    <span className="font-mono">{job.gpuModel}</span>
                    <span>·</span>
                    <span>Epoch {job.currentEpoch}/{job.epochs}</span>
                    {job.duration !== "—" && (
                      <>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <TrendingUp className="w-2.5 h-2.5" />
                          {job.duration}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
