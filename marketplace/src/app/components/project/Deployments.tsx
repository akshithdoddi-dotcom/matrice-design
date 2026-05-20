import { Plus, ExternalLink, StopCircle } from "lucide-react";
import { Button } from "@fe-common/components/ui/Button";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { Deployment } from "@/app/data/mockData";
import { TrainingProject } from "@/app/data/mockData";

const MOCK_PROJECT_DEPLOYMENTS: Deployment[] = [
  { id: "dep-001", modelName: "PPE-Detect-v1.4",    endpoint: "api.matrice.ai/ppe/v1",     status: "live",    region: "us-east-1",      latencyMs: 38, createdAt: "2026-04-15" },
  { id: "dep-002", modelName: "PPE-Detect-v1.3",    endpoint: "api.matrice.ai/ppe/v1-legacy", status: "stopped", region: "us-east-1",   latencyMs: 0,  createdAt: "2026-03-10" },
];

const DEP_STATUS_KEY: Record<Deployment["status"], string> = {
  live: "active", stopped: "offline", error: "critical",
};
const DEP_STATUS_LABEL: Record<Deployment["status"], string> = {
  live: "Live", stopped: "Stopped", error: "Error",
};

interface DeploymentsProps {
  project: TrainingProject;
}

export function Deployments({ project: _project }: DeploymentsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Deployments</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{MOCK_PROJECT_DEPLOYMENTS.length} deployments</p>
        </div>
        <Button className="bg-[#00775B] hover:bg-[#006649] text-white border-transparent h-9 text-xs gap-2 font-semibold uppercase tracking-wide shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Deploy Model
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
        <DataGrid<Deployment>
          columns={[
            {
              key: "id",
              header: "Deployment ID",
              width: "110px",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>
                  {row.id}
                </MonoCell>
              ),
            },
            {
              key: "modelName",
              header: "Model",
              render: (row, hovered) => (
                <InterCell hovered={hovered} isPrimary fontSize={11}>
                  {row.modelName}
                </InterCell>
              ),
            },
            {
              key: "endpoint",
              header: "Endpoint",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#0F172A">
                  {row.endpoint}
                </MonoCell>
              ),
            },
            {
              key: "status",
              header: "Status",
              width: "90px",
              render: (row) => (
                <StatusCapsule status={DEP_STATUS_KEY[row.status]} label={DEP_STATUS_LABEL[row.status]} />
              ),
            },
            {
              key: "region",
              header: "Region",
              width: "110px",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">
                  {row.region}
                </MonoCell>
              ),
            },
            {
              key: "latencyMs",
              header: "Latency",
              width: "80px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={11} color={row.latencyMs > 0 ? "#059669" : "#94A3B8"} hoveredColor="#0F172A">
                  {row.latencyMs > 0 ? `${row.latencyMs}ms` : "—"}
                </MonoCell>
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
              width: "70px",
              align: "right",
              render: (row, hovered) => (
                <div className="flex justify-end pr-1">
                  <GridActions visible={hovered}>
                    <GridActionButton title="Open Endpoint" hoverColor="#0284C7">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </GridActionButton>
                    {row.status === "live" && (
                      <GridActionButton title="Stop" hoverColor="#BE123C">
                        <StopCircle className="w-3.5 h-3.5" />
                      </GridActionButton>
                    )}
                  </GridActions>
                </div>
              ),
            },
          ]}
          data={MOCK_PROJECT_DEPLOYMENTS}
        />
      </div>
    </div>
  );
}
