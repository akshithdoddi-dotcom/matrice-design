import { useState } from "react";
import { TrendingUp, LayoutGrid, List, Tag, Cpu, Clock, ArrowUpRight } from "lucide-react";
import { StatCard, StatCardData } from "@/app/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";
import { SegmentedControl } from "@/app/components/ui/segmented-control";
import { MOCK_PROJECTS, MOCK_TRAINING_JOBS, TrainingProject, TrainingJob } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── KPI card data ────────────────────────────────────────────────────────────

const DASHBOARD_STATS: StatCardData[] = [
  { label: "Total Projects",      value: "8",  sublabel: "Build & Deploy · All Time",  num: "+2", ref_: "vs Last Month", dir: "up",     chip: "ALL TIME", color: "#00775B", bgColor: "#E5FFF9" },
  { label: "Active Training Jobs",value: "3",  sublabel: "Currently Running · Live",   num: "+1", ref_: "vs Yesterday",  dir: "up",     chip: "LIVE",     color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Datasets",            value: "12", sublabel: "Across All Projects",         num: "0",  ref_: "No Change",     dir: "neutral",chip: "STORED",   color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Models Deployed",     value: "3",  sublabel: "Live API Endpoints",          num: "+1", ref_: "vs Last Week",  dir: "up",     chip: "DEPLOYED", color: "#059669", bgColor: "#ECFDF5" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const PROJECT_STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "unknown", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const PROJECT_STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
};

const PROJECT_STATUS_COLOR: Record<TrainingProject["status"], { bg: string; text: string; dot: string }> = {
  draft:    { bg: "bg-neutral-100", text: "text-neutral-500", dot: "bg-neutral-400" },
  training: { bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500"    },
  complete: { bg: "bg-[#E5FFF9]",   text: "text-[#00775B]",   dot: "bg-[#00775B]"  },
  failed:   { bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-500"     },
  paused:   { bg: "bg-amber-50",    text: "text-amber-600",   dot: "bg-amber-500"   },
};

const PROJECT_TYPE_COLOR: Record<TrainingProject["type"], { bg: string; text: string }> = {
  build:  { bg: "bg-[#00775B]/10", text: "text-[#00775B]" },
  deploy: { bg: "bg-[#0284C7]/10", text: "text-[#0284C7]" },
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
  const [projectView, setProjectView] = useState<"card" | "table">("card");

  const recentProjects = [...MOCK_PROJECTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const activeJobs = MOCK_TRAINING_JOBS.filter(
    (j) => j.status === "running" || j.status === "queued"
  );
  const runningCount = MOCK_TRAINING_JOBS.filter((j) => j.status === "running").length;

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* V12 Stat Cards — no sparklines, from Component Library */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {DASHBOARD_STATS.map((d) => (
          <StatCard key={d.label} d={d} />
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Projects */}
        <div className="xl:col-span-2 bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Recent Projects</h2>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-neutral-400">{recentProjects.length} shown</span>
              <SegmentedControl
                size="sm"
                value={projectView}
                onChange={(v) => setProjectView(v as "card" | "table")}
                options={[
                  { value: "card",  icon: <LayoutGrid className="w-3 h-3" /> },
                  { value: "table", icon: <List        className="w-3 h-3" /> },
                ]}
              />
            </div>
          </div>

          {/* Card view */}
          {projectView === "card" ? (
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {recentProjects.map((p) => {
                const sc = PROJECT_STATUS_COLOR[p.status];
                const tc = PROJECT_TYPE_COLOR[p.type];
                return (
                  <div
                    key={p.id}
                    role="button"
                    tabIndex={0}
                    onClick={() => onOpenProject(p)}
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpenProject(p); }}
                    className="group relative bg-white border border-neutral-200 rounded-sm p-4 flex flex-col gap-3 hover:border-[#00775B]/40 hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00775B]"
                  >
                    {/* Name + type */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-[12px] font-semibold text-neutral-900 truncate leading-snug">{p.name}</p>
                        <p className="text-[10px] text-neutral-400 mt-0.5">{p.industry}</p>
                      </div>
                      <span className={cn(
                        "shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm",
                        tc.bg, tc.text,
                      )}>
                        {p.type}
                      </span>
                    </div>

                    {/* Meta pills */}
                    <div className="flex flex-wrap gap-1">
                      <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-sm">
                        <Tag className="w-2.5 h-2.5" />{p.inputType}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-sm">
                        <Cpu className="w-2.5 h-2.5" />{p.computeType}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-sm font-mono">
                        <Clock className="w-2.5 h-2.5" />{p.createdAt}
                      </span>
                    </div>

                    {/* Footer: status + open arrow */}
                    <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full",
                        sc.bg, sc.text,
                      )}>
                        <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                        {PROJECT_STATUS_LABEL[p.status]}
                      </span>
                      <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table view */
            <DataGrid<TrainingProject>
              columns={[
                {
                  key: "name",
                  header: "Project Name",
                  render: (row, hovered) => (
                    <InterCell hovered={hovered} fontSize={11} isPrimary>{row.name}</InterCell>
                  ),
                },
                {
                  key: "type",
                  header: "Type",
                  width: "70px",
                  render: (row) => (
                    <span className={cn(
                      "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm",
                      PROJECT_TYPE_COLOR[row.type].bg, PROJECT_TYPE_COLOR[row.type].text,
                    )}>
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
                    <StatusCapsule status={PROJECT_STATUS_KEY[row.status]} label={PROJECT_STATUS_LABEL[row.status]} />
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
          )}
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
