import { useState } from "react";
import { CloudUpload, Eye, Trash2, Plus, HardDrive, Zap } from "lucide-react";
import { DatasetDetail } from "@/app/components/project/DatasetDetail";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";
import { Input } from "@fe-common/components/ui/Input";
import { Select as FESelect } from "@fe-common/components/ui/ui-select";
import { Dataset, TrainingProject } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

const STATS: StatCardData[] = [
  { label: "Total Datasets",      value: "3",       sublabel: "In Project",        num: "+1",    ref_: "vs Last Week",   dir: "up",     chip: "DATASETS", color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Total Items",         value: "19.8k",   sublabel: "Across Datasets",   num: "+2k",   ref_: "vs Last Upload",  dir: "up",     chip: "ITEMS",    color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Total Size",          value: "6.7 GB",  sublabel: "Stored",            num: "+1.2GB",ref_: "vs Last Upload",  dir: "up",     chip: "SIZE",     color: "#D97706", bgColor: "#FFFBEB" },
  { label: "Train / Val / Test",  value: "70/20/10",sublabel: "Avg Split",         num: "—",     ref_: "—",               dir: "neutral",chip: "SPLIT",    color: "#059669", bgColor: "#ECFDF5" },
];

const MOCK_PROJECT_DATASETS: Dataset[] = [
  { id: "ds-001", name: "Training Set v3",    sizeMb: 4200, trainSplit: 70, valSplit: 20, testSplit: 10, createdAt: "2026-04-08", itemCount: 12450 },
  { id: "ds-002", name: "Augmented Set A",    sizeMb: 1850, trainSplit: 75, valSplit: 15, testSplit: 10, createdAt: "2026-04-20", itemCount: 5300  },
  { id: "ds-003", name: "Validation Samples", sizeMb: 780,  trainSplit: 0,  valSplit: 100,testSplit: 0,  createdAt: "2026-04-25", itemCount: 2100  },
];

const DATA_FORMATS = [
  { id: "LabelBox",   desc: "JSON annotations"  },
  { id: "COCO",       desc: "MS COCO format"    },
  { id: "YOLO",       desc: "YOLO txt labels"   },
  { id: "Pascal VOC", desc: "XML annotations"   },
  { id: "ImageNet",   desc: "Folder structure"  },
  { id: "Unlabeled",  desc: "No annotations"    },
];

const CLOUD_PROVIDERS = [
  { id: "aws",    label: "AWS S3",       logo: <span className="text-[11px] font-extrabold" style={{ color: "#FF9900" }}>aws</span> },
  { id: "gcp",    label: "Google Cloud", logo: <span className="text-[13px] font-extrabold bg-gradient-to-r from-blue-500 via-red-500 to-green-500 bg-clip-text text-transparent">G</span> },
  { id: "oracle", label: "Oracle OCI",   logo: <span className="text-[10px] font-bold text-red-600">OCI</span> },
  { id: "others", label: "Others",       logo: <span className="text-[9px] font-semibold text-neutral-400">•••</span> },
];

// ─── Shared tab bar ───────────────────────────────────────────────────────────

type DTab = "upload" | "datasets";

const PageTabBar = ({ active, onChange }: { active: DTab; onChange: (t: DTab) => void }) => {
  const tabs: { id: DTab; label: string }[] = [
    { id: "upload",   label: "Upload Dataset" },
    { id: "datasets", label: "All Datasets"   },
  ];
  return (
    <div className="flex items-center border-b border-neutral-200 bg-white">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn("relative px-5 py-3 text-[12px] font-semibold transition-colors",
            active === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
          {t.label}
          {active === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />}
        </button>
      ))}
    </div>
  );
};

// ─── Split bar ────────────────────────────────────────────────────────────────

function SplitBar({ train, val, test }: { train: number; val: number; test: number }) {
  return (
    <div className="flex items-center gap-1 w-full">
      <div className="flex h-2 flex-1 rounded-full overflow-hidden gap-px">
        <div className="bg-[#00775B]" style={{ width: `${train}%` }} />
        <div className="bg-[#0284C7]" style={{ width: `${val}%` }} />
        {test > 0 && <div className="bg-[#F59E0B]" style={{ width: `${test}%` }} />}
      </div>
      <span className="text-[9px] font-mono text-neutral-400 shrink-0 w-[72px] text-right">{train}/{val}/{test}</span>
    </div>
  );
}

// ─── Upload Dataset tab ───────────────────────────────────────────────────────

type UploadMode = "local" | "cloud";

function UploadDatasetTab() {
  const [storage,    setStorage]    = useState("Auto");
  const [compute,    setCompute]    = useState("auto");
  const [dataFormat, setDataFormat] = useState<string | null>(null);
  const [uploadMode, setUploadMode] = useState<UploadMode>("local");
  const [urlType,    setUrlType]    = useState("private");
  const [cloudPath,  setCloudPath]  = useState("");
  const [cloudProv,  setCloudProv]  = useState<string | null>("aws");
  const [dragging,   setDragging]   = useState(false);

  const canUpload = !!dataFormat;

  const DATA_FORMAT_OPTIONS = DATA_FORMATS.map(({ id, desc }) => ({ label: `${id} — ${desc}`, value: id }));
  const CLOUD_OPTIONS = CLOUD_PROVIDERS.map(({ id, label }) => ({ label, value: id }));
  const STORAGE_OPTIONS = [
    { label: "Auto",                     value: "Auto"                     },
    { label: "matrice-default-bucket",   value: "matrice-default-bucket"   },
    { label: "s3://my-bucket",           value: "s3://my-bucket"           },
    { label: "gs://my-bucket",           value: "gs://my-bucket"           },
  ];
  const COMPUTE_OPTIONS = [
    { label: "Automatically launch a new instance", value: "auto"         },
    { label: "Matrice Cloud GPU",                   value: "matrice-gpu"  },
    { label: "AWS p3.2xlarge",                      value: "aws-p3"       },
    { label: "GCP A100",                            value: "gcp-a100"     },
  ];

  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC]">

      {/* ── Row 1: Storage & Compute + Data Format — side by side ── */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <HardDrive className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Storage &amp; Compute</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <FESelect
                label="Storage / Bucket Alias"
                options={STORAGE_OPTIONS}
                value={storage}
                onChange={(v) => setStorage(v as string)}
                searchable
              />
              <p className="text-xs text-neutral-400">Configure your bucket or use auto{" "}
                <button className="text-[#00775B] font-medium hover:underline">+ Add Bucket</button></p>
            </div>
            <div className="flex flex-col gap-1.5">
              <FESelect
                label="Compute"
                options={COMPUTE_OPTIONS}
                value={compute}
                onChange={(v) => setCompute(v as string)}
              />
              <p className="text-xs text-neutral-400">Configure your compute or use auto{" "}
                <button className="text-[#00775B] font-medium hover:underline">+ Add Compute</button></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-md border border-neutral-200 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <Zap className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Data Format</h3>
          </div>
          <FESelect
            label="Data Format"
            options={DATA_FORMAT_OPTIONS}
            value={dataFormat}
            onChange={(v) => setDataFormat(v as string | null)}
            placeholder="Select format…"
            searchable
            clearable
          />
        </div>
      </div>

      {/* ── Row 2: Upload / Cloud ── */}
      <div className="bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {(["local", "cloud"] as UploadMode[]).map((m) => (
            <button key={m} onClick={() => setUploadMode(m)}
              className={cn("flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                uploadMode === m ? "text-[#00775B] border-[#00775B]" : "text-neutral-500 border-transparent hover:text-neutral-700")}>
              {m === "local" ? <><CloudUpload className="w-4 h-4" /> Upload Local Files</> : <><HardDrive className="w-4 h-4" /> Import from Cloud</>}
            </button>
          ))}
        </div>

        {uploadMode === "local" && (
          <div className="p-6">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e)    => { e.preventDefault(); setDragging(false); }}
              className={cn("flex flex-col items-center justify-center gap-4 py-14 rounded-md border-2 border-dashed transition-colors",
                dragging ? "border-[#00775B] bg-[#00775B]/5" : "border-[#00775B]/30 bg-[#F8FAFC]")}>
              <div className="w-14 h-14 rounded-full bg-[#00775B]/10 flex items-center justify-center">
                <CloudUpload className="w-7 h-7" style={{ color: TEAL }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-700">Drag and drop files here</p>
                <p className="text-xs text-neutral-400 mt-1">or browse from your computer</p>
              </div>
              <button className="flex items-center gap-2 h-9 px-6 rounded-md text-sm font-semibold text-white transition-colors"
                style={{ backgroundColor: TEAL }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#006649")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL)}>
                <CloudUpload className="w-4 h-4" /> Select Files
              </button>
              <p className="text-xs text-neutral-400">Supported: .png · .jpeg · .jpg · .json · .ndjson</p>
            </div>
          </div>
        )}

        {uploadMode === "cloud" && (
          <div className="p-6 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-4">
              <FESelect
                label="Cloud Provider"
                options={CLOUD_OPTIONS}
                value={cloudProv}
                onChange={(v) => setCloudProv(v as string | null)}
              />
              <FESelect
                label="URL Type"
                options={[
                  { label: "Private (using bucket alias)", value: "private" },
                  { label: "Public URL",                   value: "public"  },
                  { label: "S3 URI",                       value: "s3-uri"  },
                  { label: "GCS URI",                      value: "gcs-uri" },
                ]}
                value={urlType}
                onChange={(v) => setUrlType(v as string)}
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-neutral-600">Cloud Path</label>
              <Input
                placeholder="e.g. datasets/my-project/v3/"
                value={cloudPath}
                onChange={(e) => setCloudPath(e.target.value)}
                className="h-9 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* ── Upload button ── */}
      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          {canUpload
            ? <span className="text-[#00775B] font-medium">Format selected: {dataFormat}</span>
            : "Select a data format to enable upload"}
        </p>
        <button disabled={!canUpload}
          className="h-9 px-6 text-sm font-semibold rounded-md text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: canUpload ? TEAL : "#94A3B8" }}>
          Upload Dataset
        </button>
      </div>
    </div>
  );
}

// ─── All Datasets tab (updated with row click) ───────────────────────────────

function AllDatasetsTab({ onView }: { onView: (d: Dataset) => void }) {
  return (
    <div>
      <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
        <p className="text-xs text-neutral-400">{MOCK_PROJECT_DATASETS.length} attached datasets</p>
        <button className="flex items-center gap-1.5 h-8 px-3 text-xs font-semibold rounded-md text-white" style={{ backgroundColor: TEAL }}>
          <Plus className="w-3.5 h-3.5" /> Add Dataset
        </button>
      </div>
      <DataGrid<Dataset>
        columns={[
          { key: "id",        header: "ID",                width: "90px",  render: (r, h) => <MonoCell hovered={h} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>{r.id}</MonoCell> },
          { key: "name",      header: "Name",                              render: (r, h) => <InterCell hovered={h} isPrimary fontSize={11}>{r.name}</InterCell> },
          { key: "itemCount", header: "Items",             width: "80px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#475569" hoveredColor="#0F172A">{r.itemCount.toLocaleString()}</MonoCell> },
          { key: "sizeMb",    header: "Size",              width: "80px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{(r.sizeMb / 1024).toFixed(1)} GB</MonoCell> },
          { key: "split",     header: "Train / Val / Test",width: "200px", render: (r) => <SplitBar train={r.trainSplit} val={r.valSplit} test={r.testSplit} /> },
          { key: "createdAt", header: "Created",           width: "96px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.createdAt}</MonoCell> },
          { key: "actions",   header: "",                  width: "70px",  align: "right", render: (row, h) => (
            <div className="flex justify-end pr-1">
              <GridActions visible={h}>
                <GridActionButton title="View"   hoverColor="#0284C7" onClick={() => onView(row)}><Eye    className="w-3.5 h-3.5" /></GridActionButton>
                <GridActionButton title="Delete" hoverColor="#BE123C"><Trash2 className="w-3.5 h-3.5" /></GridActionButton>
              </GridActions>
            </div>
          )},
        ]}
        data={MOCK_PROJECT_DATASETS}
        onRowClick={(row) => onView(row)}
      />
    </div>
  );
}

// ─── Datasets page ────────────────────────────────────────────────────────────

interface DatasetsProps { project: TrainingProject; initialDatasetId?: string; }

export function Datasets({ project: _project, initialDatasetId }: DatasetsProps) {
  const [tab,     setTab]     = useState<DTab>("datasets");
  const [selected, setSelected] = useState<Dataset | null>(
    initialDatasetId ? (MOCK_PROJECT_DATASETS.find(d => d.id === initialDatasetId) ?? null) : null
  );

  if (selected) {
    return <DatasetDetail dataset={selected} onBack={() => setSelected(null)} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>
      <div className="bg-white rounded-md border border-neutral-200 shadow-sm overflow-hidden">
        <PageTabBar active={tab} onChange={setTab} />
        {tab === "upload"   && <UploadDatasetTab />}
        {tab === "datasets" && <AllDatasetsTab onView={setSelected} />}
      </div>
    </div>
  );
}
