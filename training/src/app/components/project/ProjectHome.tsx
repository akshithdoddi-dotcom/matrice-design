import { Calendar, Cpu, Globe, Tag, Check, ChevronRight, Database, Rocket, ArrowRight } from "lucide-react";
import { TrainingProject } from "@/app/data/mockData";
import { ProjectPage } from "@/app/components/layout/AppLayout";
import { StatCard, StatCardData, hex2rgba } from "@/app/components/ui/StatCard";
import { StatusCapsule } from "@/app/components/ui/DataGrid";
import { cn } from "@/app/lib/utils";

const TEAL = "#00775B";

const STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "draft", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
};

// ─── Pipeline Stepper ─────────────────────────────────────────────────────────

type StepStatus = "complete" | "active" | "pending";

interface PipelineStep {
  id: ProjectPage;
  num: number;
  title: string;
  desc: string;
  icon: React.ElementType;
  stat: string;
  status: StepStatus;
  color: string;
  bgColor: string;
}

const STEPS: PipelineStep[] = [
  {
    id: "datasets",    num: 1, title: "Prepare Data",   desc: "Upload & configure training datasets",
    icon: Database,    stat: "3 datasets",              status: "complete",
    color: "#059669",  bgColor: "#ECFDF5",
  },
  {
    id: "training",    num: 2, title: "Train Model",    desc: "Run jobs & tune model accuracy",
    icon: Cpu,         stat: "4 runs · 94.2% best",    status: "active",
    color: TEAL,       bgColor: "#E5FFF9",
  },
  {
    id: "deployments", num: 3, title: "Deploy",         desc: "Serve inference via live endpoints",
    icon: Rocket,      stat: "1 live endpoint",         status: "complete",
    color: "#7C3AED",  bgColor: "#F3EEFF",
  },
];

const STATUS_CONFIG: Record<StepStatus, { ring: string; fill: string; text: string }> = {
  complete: { ring: "#059669", fill: "#059669", text: "#fff" },
  active:   { ring: TEAL,     fill: TEAL,       text: "#fff" },
  pending:  { ring: "#CBD5E1", fill: "#fff",     text: "#94A3B8" },
};

function PipelineStepper({ onNavigate }: { onNavigate?: (page: ProjectPage) => void }) {
  return (
    <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-[13px] font-semibold text-neutral-800">Project Pipeline</h2>
          <p className="text-[11px] text-neutral-400 mt-0.5">Click any step to navigate</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] font-semibold uppercase tracking-wider">
          {(["complete", "active", "pending"] as StepStatus[]).map((s) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_CONFIG[s].ring }} />
              <span className="text-neutral-400 capitalize">{s}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start">
        {STEPS.map((step, idx) => {
          const cfg = STATUS_CONFIG[step.status];
          return (
            <div key={step.id} className="flex items-start flex-1">
              {/* Step card */}
              <button
                onClick={() => onNavigate?.(step.id)}
                className="flex-1 flex flex-col items-center gap-3 px-4 py-5 rounded-[6px] transition-all duration-150 hover:bg-neutral-50 group cursor-pointer text-left"
              >
                {/* Circle node */}
                <div
                  className="w-12 h-12 rounded-full border-2 flex items-center justify-center transition-transform duration-150 group-hover:scale-110 shrink-0"
                  style={{ borderColor: cfg.ring, backgroundColor: cfg.fill }}
                >
                  {step.status === "complete" ? (
                    <Check className="w-5 h-5" style={{ color: cfg.text }} />
                  ) : step.status === "active" ? (
                    <step.icon className="w-5 h-5" style={{ color: cfg.text }} />
                  ) : (
                    <span className="text-[13px] font-bold" style={{ color: cfg.text }}>{step.num}</span>
                  )}
                </div>

                {/* Step info */}
                <div className="text-center flex flex-col items-center gap-1.5">
                  <p className="text-[13px] font-semibold text-neutral-800 group-hover:text-[#00775B] transition-colors">{step.title}</p>
                  <p className="text-[11px] text-neutral-400 leading-snug">{step.desc}</p>
                  <div
                    className="mt-1 px-2.5 py-0.5 rounded-full text-[10px] font-semibold"
                    style={{ backgroundColor: hex2rgba(step.color, 0.12), color: step.color }}
                  >
                    {step.stat}
                  </div>
                </div>

                {/* Navigate hint */}
                <span className="flex items-center gap-1 text-[10px] text-neutral-300 group-hover:text-[#00775B] transition-colors font-medium">
                  View <ArrowRight className="w-3 h-3" />
                </span>
              </button>

              {/* Connector arrow */}
              {idx < STEPS.length - 1 && (
                <div className="flex-none flex items-center mt-6 px-1">
                  <div className="w-8 h-px bg-neutral-200" />
                  <ChevronRight className="w-4 h-4 text-neutral-300 -ml-1" />
                </div>
              )}
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
}

export function ProjectHome({ project, onNavigate }: ProjectHomeProps) {
  const STATS: StatCardData[] = [
    { label: "Datasets",      value: "3",     sublabel: "Attached",       num: "+1",    ref_: "vs Last Week",  dir: "up",     chip: "DATASETS",  color: "#7C3AED", bgColor: "#F3EEFF" },
    { label: "Training Runs", value: "4",     sublabel: "All Runs",       num: "+2",    ref_: "vs Last Month", dir: "up",     chip: "RUNS",      color: "#0284C7", bgColor: "#E0F2FE" },
    { label: "Deployments",   value: "1",     sublabel: "Live Endpoints", num: "0",     ref_: "No Change",     dir: "neutral",chip: "DEPLOYED",  color: "#059669", bgColor: "#ECFDF5" },
    { label: "Best Accuracy", value: "94.2%", sublabel: "Top Run",        num: "+1.3%", ref_: "vs Prev Run",   dir: "up",     chip: "ACCURACY",  color: "#D97706", bgColor: "#FFFBEB" },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Project header */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-neutral-900 truncate">{project.name}</h1>
              <StatusCapsule status={STATUS_KEY[project.status]} label={STATUS_LABEL[project.status]} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />Created {project.createdAt}</span>
              {project.country && <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" />{project.country}</span>}
              <span className="flex items-center gap-1.5"><Cpu className="w-3.5 h-3.5" />{project.computeType}</span>
            </div>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Tag className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-medium">{tag}</span>
                ))}
              </div>
            )}
          </div>
          <div className="flex flex-col gap-2 shrink-0 items-end">
            <span className={cn("text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-[4px]",
              project.type === "build" ? "bg-[#00775B]/10 text-[#00775B]" : "bg-[#0284C7]/10 text-[#0284C7]")}>
              {project.type}
            </span>
            <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-[4px] capitalize">
              {project.outputType.replace("_", " ")}
            </span>
            <span className="text-[10px] text-neutral-400 bg-neutral-50 px-3 py-1 rounded-[4px]">Input: {project.inputType}</span>
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Pipeline stepper */}
      <PipelineStepper onNavigate={onNavigate} />

      {/* Config details */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm p-6">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700 mb-4">Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Compute Type",      value: project.computeType },
            { label: "Storage Type",      value: project.storageType ?? "—" },
            { label: "Supported Devices", value: project.supportedDevices ?? "—" },
            { label: "Country",           value: project.country ?? "—" },
            { label: "Industry",          value: project.industry },
            { label: "Input Type",        value: project.inputType },
            { label: "Output Type",       value: project.outputType.replace("_", " ") },
            { label: "Project Type",      value: project.type },
          ].map(({ label, value }) => (
            <div key={label}>
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
              <p className="text-sm font-semibold text-neutral-800 mt-1 capitalize">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
