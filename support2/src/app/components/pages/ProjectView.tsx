import { useState } from "react";
import {
  ChevronRight,
  Video,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Info,
  GitBranch,
} from "lucide-react";
import {
  Project,
  Pipeline,
  Cluster,
  Account,
  ComponentStatus,
} from "@/data/mockData";
import { PipelineDetailPanel } from "@/app/components/ui/PipelineDetailPanel";

// ── Design tokens ──────────────────────────────────────────────────────────────

const TEAL       = "#00775B";
const BORDER_CLR = "#E2E8F0";

// ── Component status config ────────────────────────────────────────────────────

const COMP_CFG: Record<ComponentStatus, { Icon: React.ElementType; color: string; bg: string }> = {
  critical: { Icon: AlertCircle,   color: "#E7000B", bg: "rgba(231,0,11,0.08)"   },
  warning:  { Icon: AlertTriangle, color: "#E19A04", bg: "rgba(225,154,4,0.08)"  },
  stable:   { Icon: CheckCircle2,  color: "#00A63E", bg: "rgba(0,166,62,0.08)"   },
  info:     { Icon: Info,          color: "#2B7FFF", bg: "rgba(43,127,255,0.08)" },
};

// ── Left panel: pipeline list item ─────────────────────────────────────────────

interface PipelineItemProps {
  pipeline: Pipeline;
  isSelected: boolean;
  onClick: () => void;
}

function PipelineItem({ pipeline, isSelected, onClick }: PipelineItemProps) {
  const camCount = pipeline.cameras?.length ?? 0;

  return (
    <button
      onClick={onClick}
      className="w-full text-left transition-all duration-150 rounded-[8px] overflow-hidden"
      style={{
        border: isSelected ? `1px solid ${TEAL}40` : "1px solid #E2E8F0",
        backgroundColor: isSelected ? "rgba(0,119,91,0.06)" : "#fff",
        boxShadow: isSelected ? `0 0 0 2px ${TEAL}18` : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <div className="flex" style={{ minHeight: 64 }}>
        {/* Color stripe */}
        <div
          className="flex-shrink-0"
          style={{
            width: 4,
            backgroundColor: isSelected ? TEAL : pipeline.headerColor,
            borderRadius: "8px 0 0 8px",
          }}
        />

        {/* Content */}
        <div className="flex-1 px-3 py-2.5 min-w-0">
          <div
            className="text-[12px] leading-tight truncate mb-1.5"
            style={{ fontWeight: isSelected ? 700 : 500, color: isSelected ? TEAL : "#0F172A" }}
          >
            {pipeline.name}
          </div>

          <div className="flex flex-wrap gap-1 mb-1.5">
            {pipeline.comps.map((comp) => {
              const cfg = COMP_CFG[comp.status];
              return (
                <div
                  key={comp.name}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 2,
                    padding: "2px 5px", borderRadius: 3, backgroundColor: cfg.bg,
                  }}
                >
                  <cfg.Icon style={{ width: 9, height: 9, color: cfg.color }} />
                  <span style={{ fontSize: 9, color: cfg.color, fontWeight: 600 }}>
                    {comp.name.slice(0, 4)}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between gap-2">
            <span className="text-[10px] truncate flex-1 min-w-0" style={{ color: "#94A3B8" }}>
              {pipeline.note || "—"}
            </span>
            {camCount > 0 && (
              <div
                className="flex items-center gap-1 flex-shrink-0"
                style={{
                  padding: "1px 5px", borderRadius: 3,
                  backgroundColor: isSelected ? "rgba(0,119,91,0.1)" : "#F1F5F9",
                }}
              >
                <Video style={{ width: 8, height: 8, color: isSelected ? TEAL : "#94A3B8" }} />
                <span style={{ fontSize: 9, fontWeight: 600, color: isSelected ? TEAL : "#64748B" }}>
                  {camCount}
                </span>
              </div>
            )}
          </div>
        </div>

        {isSelected && (
          <div className="flex-shrink-0 flex items-center pr-2">
            <ChevronRight style={{ width: 14, height: 14, color: TEAL }} />
          </div>
        )}
      </div>
    </button>
  );
}

// ── Empty state ────────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center h-full gap-3" style={{ color: "#94A3B8" }}>
      <div
        className="w-12 h-12 rounded-[12px] flex items-center justify-center"
        style={{ backgroundColor: "rgba(0,119,91,0.06)", border: "1px solid rgba(0,119,91,0.12)" }}
      >
        <GitBranch style={{ width: 22, height: 22, color: TEAL }} />
      </div>
      <div className="text-center">
        <div className="text-[13px] font-medium text-[#64748B]">No pipeline selected</div>
        <div className="text-[11px] mt-1" style={{ color: "#94A3B8" }}>
          Select a pipeline from the left panel to view details
        </div>
      </div>
    </div>
  );
}

// ── Props ──────────────────────────────────────────────────────────────────────

interface ProjectViewProps {
  project: Project | null;
  cluster: Cluster | null;
  account: Account | null;
  initialPipelineId?: string | null;
  onBack: () => void;
  onBackToDesk?: () => void;
}

// ── Main component ─────────────────────────────────────────────────────────────

export function ProjectView({
  project,
  initialPipelineId,
}: ProjectViewProps) {
  const pipelines = project?.pipelines ?? [];

  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(() => {
    if (!project) return null;
    if (initialPipelineId) {
      return pipelines.find((p) => p.id === initialPipelineId) ?? pipelines[0] ?? null;
    }
    return pipelines[0] ?? null;
  });

  if (!project) {
    return (
      <div className="flex items-center justify-center h-full text-[13px] text-[#94A3B8]">
        No project selected.
      </div>
    );
  }

  return (
    <div className="flex h-full overflow-hidden">
      {/* ── Left panel ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col overflow-hidden flex-shrink-0"
        style={{ width: 260, borderRight: `1px solid ${BORDER_CLR}`, backgroundColor: "#F8FAFC" }}
      >
        {/* Project header */}
        <div className="px-4 py-3.5 flex-shrink-0" style={{ backgroundColor: TEAL }}>
          <div className="text-[13px] font-bold text-white leading-tight truncate">{project.name}</div>
          <div className="text-[10px] mt-0.5" style={{ color: "rgba(255,255,255,0.6)" }}>
            {pipelines.length} pipeline{pipelines.length !== 1 ? "s" : ""}
          </div>
        </div>

        {/* Section label */}
        <div
          className="px-3 pt-3 pb-2 flex-shrink-0 flex items-center gap-1.5"
          style={{ borderBottom: `1px solid ${BORDER_CLR}` }}
        >
          <GitBranch style={{ width: 11, height: 11, color: "#64748B" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.65px] text-[#94A3B8]">
            Inference Pipelines
          </span>
          <span
            className="ml-auto text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
            style={{ backgroundColor: "rgba(0,119,91,0.08)", color: TEAL }}
          >
            {pipelines.length}
          </span>
        </div>

        {/* Pipeline list */}
        <div className="flex-1 overflow-auto p-2 space-y-1.5">
          {pipelines.map((pl) => (
            <PipelineItem
              key={pl.id}
              pipeline={pl}
              isSelected={selectedPipeline?.id === pl.id}
              onClick={() => setSelectedPipeline(pl)}
            />
          ))}
          {pipelines.length === 0 && (
            <div className="flex items-center justify-center py-10 text-[11px] text-[#94A3B8]">
              No pipelines
            </div>
          )}
        </div>
      </div>

      {/* ── Right panel ────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden" style={{ backgroundColor: "#F8FAFC" }}>
        {selectedPipeline ? (
          <PipelineDetailPanel key={selectedPipeline.id} pipeline={selectedPipeline} project={project} />
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  );
}
