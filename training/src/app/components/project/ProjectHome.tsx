import {
  Calendar, Cpu, Globe, Tag, Database, Rocket,
  ArrowUpRight, TrendingUp, ArrowRight, Building2,
} from "lucide-react";
import { TrainingProject, MOCK_DATASETS, MOCK_TRAINING_JOBS, MOCK_DEPLOYMENTS } from "@/app/data/mockData";
import { ProjectPage } from "@/app/components/layout/AppLayout";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { cn } from "@/app/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "draft", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
};

function SectionHeader({
  title,
  count,
  icon: Icon,
  onViewAll,
}: {
  title: string;
  count?: number;
  icon: React.ElementType;
  onViewAll?: () => void;
}) {
  return (
    <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
      <div className="flex items-center gap-2">
        <Icon className="w-3.5 h-3.5 text-neutral-400" />
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">{title}</h2>
        {count !== undefined && (
          <span className="text-[10px] font-semibold text-neutral-400 bg-neutral-100 px-1.5 py-0.5 rounded-full">
            {count}
          </span>
        )}
      </div>
      {onViewAll && (
        <button
          onClick={onViewAll}
          className="flex items-center gap-1 text-[10px] font-semibold text-[#00775B] hover:text-[#004e3d] transition-colors"
        >
          View all <ArrowUpRight className="w-3 h-3" />
        </button>
      )}
    </div>
  );
}

// ─── Datasets panel ───────────────────────────────────────────────────────────

function DatasetsPanel({
  onNavigate,
  onOpenDataset,
}: {
  onNavigate?: (page: ProjectPage) => void;
  onOpenDataset?: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
      <SectionHeader
        title="Datasets"
        count={MOCK_DATASETS.length}
        icon={Database}
        onViewAll={() => onNavigate?.("datasets")}
      />
      <div className="divide-y divide-neutral-100">
        {MOCK_DATASETS.slice(0, 3).map((ds) => (
          <div
            key={ds.id}
            className="px-5 py-3.5 hover:bg-neutral-50/60 transition-colors cursor-pointer"
            onClick={() => onOpenDataset?.(ds.id)}
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-[12px] font-semibold text-neutral-800 truncate">{ds.name}</p>
              <span className="text-[10px] font-mono text-neutral-400 shrink-0 ml-2">{ds.createdAt}</span>
            </div>
            {/* Split bar */}
            <div className="flex items-center gap-2">
              <div className="flex h-1.5 flex-1 rounded-full overflow-hidden bg-neutral-100">
                <div className="bg-[#00775B]" style={{ width: `${ds.trainSplit}%` }} />
                <div className="bg-[#0284C7]" style={{ width: `${ds.valSplit}%` }} />
                {ds.testSplit > 0 && <div className="bg-[#F59E0B]" style={{ width: `${ds.testSplit}%` }} />}
              </div>
              <span className="text-[10px] font-mono text-neutral-500 shrink-0">{ds.trainSplit}/{ds.valSplit}/{ds.testSplit}</span>
            </div>
            {/* Meta */}
            <div className="flex items-center gap-3 mt-1.5 text-[10px] text-neutral-400">
              <span>{ds.itemCount.toLocaleString()} items</span>
              <span>·</span>
              <span>{(ds.sizeMb / 1024).toFixed(1)} GB</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Training Jobs panel ──────────────────────────────────────────────────────

const JOB_STATUS_COLOR = {
  running: { bg: "bg-blue-50",     text: "text-blue-600",     dot: "bg-blue-500",     label: "Running" },
  queued:  { bg: "bg-amber-50",    text: "text-amber-600",    dot: "bg-amber-500",    label: "Queued"  },
  paused:  { bg: "bg-neutral-100", text: "text-neutral-500",  dot: "bg-neutral-400",  label: "Paused"  },
} as const;

function TrainingJobsPanel({
  onNavigate,
  onOpenJob,
}: {
  onNavigate?: (page: ProjectPage) => void;
  onOpenJob?: (id: string) => void;
}) {
  const jobs = MOCK_TRAINING_JOBS.slice(0, 3);
  return (
    <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
      <SectionHeader
        title="Training Jobs"
        count={MOCK_TRAINING_JOBS.length}
        icon={Cpu}
        onViewAll={() => onNavigate?.("training")}
      />
      <div className="divide-y divide-neutral-100">
        {jobs.map((job) => {
          const sc = JOB_STATUS_COLOR[job.status];
          return (
            <div
              key={job.id}
              className="px-5 py-3.5 hover:bg-neutral-50/60 transition-colors cursor-pointer"
              onClick={() => onOpenJob?.(job.id)}
            >
              <div className="flex items-center justify-between mb-2">
                <p className="text-[12px] font-semibold text-neutral-800 truncate">{job.projectName}</p>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2",
                  sc.bg, sc.text,
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot, job.status === "running" && "animate-pulse")} />
                  {sc.label}
                </span>
              </div>
              {/* Progress bar */}
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className={cn("h-full rounded-full transition-all", job.status === "running" ? "bg-[#00775B]" : "bg-neutral-300")}
                    style={{ width: `${job.progress}%` }}
                  />
                </div>
                <span className="text-[10px] font-mono text-neutral-500 shrink-0 w-7 text-right">{job.progress}%</span>
              </div>
              {/* Meta */}
              <div className="flex items-center gap-3 mt-1.5 text-[10px] text-neutral-400">
                <span className="font-mono">{job.gpuModel}</span>
                <span>·</span>
                <span>Ep {job.currentEpoch}/{job.epochs}</span>
                {job.duration !== "—" && (
                  <>
                    <span>·</span>
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-2.5 h-2.5" />{job.duration}
                    </span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Deployments panel ────────────────────────────────────────────────────────

const DEP_STATUS_COLOR = {
  live:    { bg: "bg-[#E5FFF9]",   text: "text-[#00775B]",   dot: "bg-[#00775B]",   label: "Live"    },
  stopped: { bg: "bg-neutral-100", text: "text-neutral-500", dot: "bg-neutral-400", label: "Stopped" },
  error:   { bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-500",     label: "Error"   },
} as const;

function DeploymentsPanel({
  onNavigate,
  onOpenDeployment,
}: {
  onNavigate?: (page: ProjectPage) => void;
  onOpenDeployment?: (id: string) => void;
}) {
  return (
    <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
      <SectionHeader
        title="Deployments"
        count={MOCK_DEPLOYMENTS.length}
        icon={Rocket}
        onViewAll={() => onNavigate?.("deployments")}
      />
      <div className="divide-y divide-neutral-100">
        {MOCK_DEPLOYMENTS.slice(0, 3).map((dep) => {
          const sc = DEP_STATUS_COLOR[dep.status];
          return (
            <div
              key={dep.id}
              className="px-5 py-3.5 hover:bg-neutral-50/60 transition-colors cursor-pointer"
              onClick={() => onOpenDeployment?.(dep.id)}
            >
              <div className="flex items-center justify-between mb-1.5">
                <p className="text-[12px] font-semibold text-neutral-800 truncate">{dep.modelName}</p>
                <span className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full shrink-0 ml-2",
                  sc.bg, sc.text,
                )}>
                  <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot, dep.status === "live" && "animate-pulse")} />
                  {sc.label}
                </span>
              </div>
              <p className="text-[10px] font-mono text-neutral-400 truncate mb-1.5">{dep.endpoint}</p>
              <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                <span>{dep.region}</span>
                {dep.status === "live" && (
                  <>
                    <span>·</span>
                    <span>{dep.latencyMs}ms</span>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── ProjectHome ──────────────────────────────────────────────────────────────

interface ProjectHomeProps {
  project: TrainingProject;
  onNavigate?: (page: ProjectPage) => void;
  onOpenDataset?: (id: string) => void;
  onOpenJob?: (id: string) => void;
  onOpenDeployment?: (id: string) => void;
}

export function ProjectHome({ project, onNavigate, onOpenDataset, onOpenJob, onOpenDeployment }: ProjectHomeProps) {
  const STATS: StatCardData[] = [
    { label: "Datasets",      value: "3",     sublabel: "Attached",       num: "+1",    ref_: "vs Last Week",  dir: "up",     chip: "DATASETS",  color: "#0284C7", bgColor: "#E0F2FE" },
    { label: "Training Runs", value: "4",     sublabel: "All Runs",       num: "+2",    ref_: "vs Last Month", dir: "up",     chip: "RUNS",      color: "#0284C7", bgColor: "#E0F2FE" },
    { label: "Deployments",   value: "1",     sublabel: "Live Endpoints", num: "0",     ref_: "No Change",     dir: "neutral",chip: "DEPLOYED",  color: "#059669", bgColor: "#ECFDF5" },
    { label: "Best Accuracy", value: "94.2%", sublabel: "Top Run",        num: "+1.3%", ref_: "vs Prev Run",   dir: "up",     chip: "ACCURACY",  color: "#D97706", bgColor: "#FFFBEB" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">

      {/* Project header */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm p-6 flex items-start justify-between gap-6">

        {/* Left: name, meta, tags */}
        <div className="flex flex-col gap-3 min-w-0 flex-1">
          {/* Name */}
          <h1 className="text-xl font-bold text-neutral-900 truncate">{project.name}</h1>

          {/* Meta row */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-[11px] text-neutral-500">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 shrink-0" />Created {project.createdAt}
            </span>
            {project.country && (
              <span className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 shrink-0" />{project.country}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0" />{project.industry}
            </span>
            <span className="flex items-center gap-1.5 font-medium text-neutral-600">
              {project.inputType}
              <ArrowRight className="w-3 h-3 text-neutral-300" />
              <span className="capitalize">{project.outputType.replace("_", " ")}</span>
            </span>
          </div>

          {/* Tags */}
          {project.tags.length > 0 && (
            <div className="flex flex-wrap items-center gap-1.5">
              <Tag className="w-3 h-3 text-neutral-300 shrink-0" />
              {project.tags.map((tag) => (
                <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-full text-[10px] font-medium">{tag}</span>
              ))}
            </div>
          )}
        </div>

        {/* Right: status + type badges */}
        <div className="flex flex-col items-end gap-2 shrink-0">
          <StatusCapsule status={STATUS_KEY[project.status]} label={STATUS_LABEL[project.status]} />
          <span className={cn(
            "text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[4px]",
            project.type === "build" ? "bg-[#00775B]/10 text-[#00775B]" : "bg-[#0284C7]/10 text-[#0284C7]",
          )}>
            {project.type}
          </span>
        </div>

      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Activity panels — 1×3 row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <DatasetsPanel    onNavigate={onNavigate} onOpenDataset={onOpenDataset} />
        <TrainingJobsPanel onNavigate={onNavigate} onOpenJob={onOpenJob} />
        <DeploymentsPanel  onNavigate={onNavigate} onOpenDeployment={onOpenDeployment} />
      </div>


    </div>
  );
}
