import { Plus, Eye, Trash2 } from "lucide-react";
import { Button } from "@fe-common/components/ui/Button";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";
import { Dataset } from "@/app/data/mockData";
import { TrainingProject } from "@/app/data/mockData";

const MOCK_PROJECT_DATASETS: Dataset[] = [
  { id: "ds-001", name: "Training Set v3",     sizeMb: 4200, trainSplit: 70, valSplit: 20, testSplit: 10, createdAt: "2026-04-08", itemCount: 12450 },
  { id: "ds-002", name: "Augmented Set A",      sizeMb: 1850, trainSplit: 75, valSplit: 15, testSplit: 10, createdAt: "2026-04-20", itemCount: 5300 },
  { id: "ds-003", name: "Validation Samples",   sizeMb: 780,  trainSplit: 0,  valSplit: 100, testSplit: 0, createdAt: "2026-04-25", itemCount: 2100 },
];

function SplitBar({ train, val, test }: { train: number; val: number; test: number }) {
  return (
    <div className="flex items-center gap-1 w-full">
      <div className="flex h-2 flex-1 rounded-full overflow-hidden gap-px">
        <div className="bg-[#00775B]" style={{ width: `${train}%` }} title={`Train ${train}%`} />
        <div className="bg-[#0284C7]" style={{ width: `${val}%` }} title={`Val ${val}%`} />
        {test > 0 && <div className="bg-[#7C3AED]" style={{ width: `${test}%` }} title={`Test ${test}%`} />}
      </div>
      <span className="text-[9px] font-mono text-neutral-400 shrink-0 w-[72px] text-right">
        {train}/{val}/{test}
      </span>
    </div>
  );
}

interface DatasetsProps {
  project: TrainingProject;
}

export function Datasets({ project: _project }: DatasetsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-sm font-bold uppercase tracking-wider text-neutral-900">Datasets</h1>
          <p className="text-xs text-neutral-500 mt-0.5">{MOCK_PROJECT_DATASETS.length} datasets</p>
        </div>
        <Button className="bg-[#00775B] hover:bg-[#006649] text-white border-transparent h-9 text-xs gap-2 font-semibold uppercase tracking-wide shadow-sm">
          <Plus className="w-3.5 h-3.5" /> Add Dataset
        </Button>
      </div>

      <div className="bg-white rounded-sm border border-neutral-200 shadow-sm overflow-hidden">
        <DataGrid<Dataset>
          columns={[
            {
              key: "id",
              header: "ID",
              width: "90px",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>
                  {row.id}
                </MonoCell>
              ),
            },
            {
              key: "name",
              header: "Name",
              render: (row, hovered) => (
                <InterCell hovered={hovered} isPrimary fontSize={11}>
                  {row.name}
                </InterCell>
              ),
            },
            {
              key: "itemCount",
              header: "Items",
              width: "80px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#0F172A">
                  {row.itemCount.toLocaleString()}
                </MonoCell>
              ),
            },
            {
              key: "sizeMb",
              header: "Size",
              width: "80px",
              align: "right",
              render: (row, hovered) => (
                <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">
                  {(row.sizeMb / 1024).toFixed(1)} GB
                </MonoCell>
              ),
            },
            {
              key: "split",
              header: "Train / Val / Test",
              width: "200px",
              render: (row) => (
                <SplitBar train={row.trainSplit} val={row.valSplit} test={row.testSplit} />
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
              render: (_row, hovered) => (
                <div className="flex justify-end pr-1">
                  <GridActions visible={hovered}>
                    <GridActionButton title="View" hoverColor="#0284C7">
                      <Eye className="w-3.5 h-3.5" />
                    </GridActionButton>
                    <GridActionButton title="Delete" hoverColor="#BE123C">
                      <Trash2 className="w-3.5 h-3.5" />
                    </GridActionButton>
                  </GridActions>
                </div>
              ),
            },
          ]}
          data={MOCK_PROJECT_DATASETS}
        />
      </div>
    </div>
  );
}
