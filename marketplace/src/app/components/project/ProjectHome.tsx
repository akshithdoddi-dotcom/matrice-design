import { Database, Cpu, Rocket, Calendar, Tag, Globe } from "lucide-react";
import { TrainingProject } from "@/app/data/mockData";
import { StatusCapsule } from "@/app/components/ui/DataGrid";
import { cn } from "@/app/lib/utils";

const STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "unknown", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
};

function StatCard({ icon: Icon, label, value, color }: { icon: React.ElementType; label: string; value: string | number; color: string }) {
  return (
    <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-5 flex items-center gap-4">
      <div className={cn("w-10 h-10 rounded-sm flex items-center justify-center shrink-0")} style={{ backgroundColor: `${color}18` }}>
        <Icon className="w-5 h-5" style={{ color }} />
      </div>
      <div>
        <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500">{label}</p>
        <p className="text-2xl font-bold text-neutral-900 leading-tight mt-0.5">{value}</p>
      </div>
    </div>
  );
}

interface ProjectHomeProps {
  project: TrainingProject;
}

export function ProjectHome({ project }: ProjectHomeProps) {
  return (
    <div className="flex flex-col gap-6">

      {/* Project header */}
      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-xl font-bold text-neutral-900 truncate">{project.name}</h1>
              <StatusCapsule status={STATUS_KEY[project.status]} label={STATUS_LABEL[project.status]} />
            </div>
            <div className="flex flex-wrap items-center gap-4 text-[11px] text-neutral-500">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                Created {project.createdAt}
              </span>
              {project.country && (
                <span className="flex items-center gap-1.5">
                  <Globe className="w-3.5 h-3.5" />
                  {project.country}
                </span>
              )}
              <span className="flex items-center gap-1.5">
                <Cpu className="w-3.5 h-3.5" />
                {project.computeType}
              </span>
            </div>
            {project.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                <Tag className="w-3 h-3 text-neutral-400 mt-0.5 shrink-0" />
                {project.tags.map((tag) => (
                  <span key={tag} className="px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-[10px] font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Type + output chip stack */}
          <div className="flex flex-col gap-2 shrink-0 items-end">
            <span className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-sm",
              project.type === "build"
                ? "bg-[#00775B]/10 text-[#00775B]"
                : "bg-[#0284C7]/10 text-[#0284C7]"
            )}>
              {project.type}
            </span>
            <span className="text-[10px] font-semibold text-neutral-500 bg-neutral-100 px-3 py-1 rounded-sm capitalize">
              {project.outputType.replace("_", " ")}
            </span>
            <span className="text-[10px] text-neutral-400 bg-neutral-50 px-3 py-1 rounded-sm">
              Input: {project.inputType}
            </span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={Database} label="Datasets"      value={3}  color="#7C3AED" />
        <StatCard icon={Cpu}      label="Training Runs" value={4}  color="#0284C7" />
        <StatCard icon={Rocket}   label="Deployments"   value={1}  color="#059669" />
      </div>

      {/* Config details */}
      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm p-6">
        <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-4">Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { label: "Compute Type",       value: project.computeType },
            { label: "Storage Type",       value: project.storageType ?? "—" },
            { label: "Supported Devices",  value: project.supportedDevices ?? "—" },
            { label: "Country",            value: project.country ?? "—" },
            { label: "Industry",           value: project.industry },
            { label: "Input Type",         value: project.inputType },
            { label: "Output Type",        value: project.outputType.replace("_", " ") },
            { label: "Project Type",       value: project.type },
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
