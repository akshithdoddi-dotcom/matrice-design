import { Plus, StopCircle, PlayCircle } from "lucide-react";
import { Button } from "@fe-common/components/ui/Button";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { TrainingJob } from "@/app/data/mockData";
import { TrainingProject } from "@/app/data/mockData";

const MOCK_PROJECT_JOBS: TrainingJob[] = [
  { id: "job-001", projectId: "p001", projectName: "", status: "running", progress: 67, startedAt: "2026-05-10 14:30", computeType: "Matrice", gpuModel: "RTX 4090", epochs: 100, currentEpoch: 67, duration: "2h 14m" },
  { id: "job-002", projectId: "p001", projectName: "", status: "queued",  progress: 0,  startedAt: "2026-05-11 09:00", computeType: "Matrice", gpuModel: "RTX 4090", epochs: 80,  currentEpoch: 0,  duration: "—" },
  { id: "job-003", projectId: "p001", projectName: "", status: "paused",  progress: 48, startedAt: "2026-05-09 11:00", computeType: "AWS",     gpuModel: "A100",     epochs: 150, currentEpoch: 72, duration: "3h 52m" },
  { id: "job-004", projectId: "p001", projectName: "", status: "running", progress: 92, startedAt: "2026-05-11 06:00", computeType: "Matrice", gpuModel: "RTX 4090", epochs: 50,  currentEpoch: 46, duration: "4h 01m" },
];

const JOB_STATUS_KEY: Record<TrainingJob["status"], string> = {
  running: "active", queued: "info", paused: "pending",
};
const JOB_STATUS_LABEL: Record<TrainingJob["status"], string> = {
  running: "Running", queued: "Queued", paused: "Paused",
};

function ProgressBar({ value, status }: { value: number; status: TrainingJob["status"] }) {
  const color = status === "running" ? "#00775B" : status === "paused" ? "#D97706" : "#E2E8F0";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono text-neutral-500 w-7 text-right shrink-0">{value}%</span>
    </div>
  );
}

interface TrainingJobsProps {
  project: TrainingProject;
}

export function TrainingJobs({ project: _project }: TrainingJobsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Training</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{MOCK_PROJECT_JOBS.length} jobs total</p>
        </div>
        <Button className="bg-[#00775B] hover:bg-[#006649] text-white border-transparent h-9 text-xs gap-2 font-semibold uppercase tracking-wide shadow-sm">
          <Plus className="w-3.5 h-3.5" /> New Training Run
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
        <DataGrid<TrainingJob>
          columns={[
            {
              key: "id",
              header: "Job ID",
              width: "90px",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>
                  {row.id}
                </MonoCell>
              ),
            },
            {
              key: "status",
              header: "Status",
              width: "90px",
              render: (row) => (
                <StatusCapsule status={JOB_STATUS_KEY[row.status]} label={JOB_STATUS_LABEL[row.status]} />
              ),
            },
            {
              key: "progress",
              header: "Progress",
              width: "180px",
              render: (row) => <ProgressBar value={row.progress} status={row.status} />,
            },
            {
              key: "epochs",
              header: "Epochs",
              width: "90px",
              align: "center",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#0F172A">
                  {row.currentEpoch} / {row.epochs}
                </MonoCell>
              ),
            },
            {
              key: "gpuModel",
              header: "GPU",
              width: "120px",
              render: (row, hovered) => (
                <InterCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#334155">
                  {row.gpuModel}
                </InterCell>
              ),
            },
            {
              key: "computeType",
              header: "Provider",
              width: "80px",
              render: (row, hovered) => (
                <InterCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#334155">
                  {row.computeType}
                </InterCell>
              ),
            },
            {
              key: "startedAt",
              header: "Started",
              width: "130px",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">
                  {row.startedAt}
                </MonoCell>
              ),
            },
            {
              key: "duration",
              header: "Duration",
              width: "80px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">
                  {row.duration}
                </MonoCell>
              ),
            },
            {
              key: "actions",
              header: "",
              width: "70px",
              align: "right",
              render: (row, hovered) => (
                <div className="flex justify-end pr-1">
                  <GridActions visible={hovered}>
                    {row.status === "running" ? (
                      <GridActionButton title="Pause" hoverColor="#D97706">
                        <StopCircle className="w-3.5 h-3.5" />
                      </GridActionButton>
                    ) : row.status === "paused" ? (
                      <GridActionButton title="Resume" hoverColor="#00775B">
                        <PlayCircle className="w-3.5 h-3.5" />
                      </GridActionButton>
                    ) : null}
                  </GridActions>
                </div>
              ),
            },
          ]}
          data={MOCK_PROJECT_JOBS}
        />
      </div>
    </div>
  );
}
