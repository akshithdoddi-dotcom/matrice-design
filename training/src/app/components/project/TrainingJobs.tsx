import { useState } from "react";
import { StopCircle, PlayCircle, LayoutGrid, List, Eye } from "lucide-react";
import { ModelDetail } from "@/app/components/project/ModelDetail";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { Label } from "@fe-common/components/ui/label";
import { Input } from "@fe-common/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe-common/components/ui/select";
import { Switch } from "@fe-common/components/ui/switch";
import { TrainingJob, TrainingProject } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

const STATS: StatCardData[] = [
  { label: "Total Runs",    value: "4",     sublabel: "All Jobs",      num: "+2",   ref_: "vs Last Week",  dir: "up",     chip: "RUNS",     color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Running",       value: "2",     sublabel: "Active Now",    num: "+1",   ref_: "vs Yesterday",  dir: "up",     chip: "RUNNING",  color: TEAL,      bgColor: "#E5FFF9" },
  { label: "Best Accuracy", value: "94.2%", sublabel: "Top Epoch",     num: "+1.3%",ref_: "vs Prev Run",   dir: "up",     chip: "ACCURACY", color: "#D97706", bgColor: "#FFFBEB" },
  { label: "Compute Hours", value: "10.2h", sublabel: "This Month",    num: "+3h",  ref_: "vs Last Month", dir: "up",     chip: "COMPUTE",  color: "#7C3AED", bgColor: "#F3EEFF" },
];

// ─── Mock Jobs ────────────────────────────────────────────────────────────────

const MOCK_PROJECT_JOBS: TrainingJob[] = [
  { id: "job-001", projectId: "p001", projectName: "", status: "running", progress: 67, startedAt: "2026-05-10 14:30", computeType: "Matrice", gpuModel: "RTX 4090", epochs: 100, currentEpoch: 67, duration: "2h 14m" },
  { id: "job-002", projectId: "p001", projectName: "", status: "queued",  progress: 0,  startedAt: "2026-05-11 09:00", computeType: "Matrice", gpuModel: "RTX 4090", epochs: 80,  currentEpoch: 0,  duration: "—" },
  { id: "job-003", projectId: "p001", projectName: "", status: "paused",  progress: 48, startedAt: "2026-05-09 11:00", computeType: "AWS",     gpuModel: "A100",     epochs: 150, currentEpoch: 72, duration: "3h 52m" },
  { id: "job-004", projectId: "p001", projectName: "", status: "running", progress: 92, startedAt: "2026-05-11 06:00", computeType: "Matrice", gpuModel: "RTX 4090", epochs: 50,  currentEpoch: 46, duration: "4h 01m" },
];

const JOB_STATUS_KEY:   Record<TrainingJob["status"], string> = { running: "active", queued: "pending", paused: "paused" };
const JOB_STATUS_LABEL: Record<TrainingJob["status"], string> = { running: "Running", queued: "Queued",  paused: "Paused"  };

// ─── Model families ───────────────────────────────────────────────────────────

const MODEL_FAMILIES: Record<string, { color: string; data: { name: string; x: number; y: number }[] }> = {
  "ResNet":       { color: "#EF4444", data: [{ name: "resnet18", x: 18, y: 69.8 }, { name: "resnet50", x: 45, y: 76.1 }, { name: "resnet101", x: 89, y: 77.8 }, { name: "resnet152", x: 135, y: 78.5 }] },
  "EfficientNet": { color: "#F97316", data: [{ name: "effnet_b0", x: 12, y: 77.1 }, { name: "effnet_b3", x: 35, y: 81.1 }, { name: "effnet_b7", x: 220, y: 84.1 }] },
  "ViT":          { color: "#8B5CF6", data: [{ name: "vit_s_16", x: 480, y: 81.4 }, { name: "vit_b_16", x: 980, y: 81.9 }, { name: "vit_l_16", x: 3400, y: 82.5 }] },
  "ConvNeXt":     { color: "#06B6D4", data: [{ name: "convnext_tiny", x: 58, y: 82.1 }, { name: "convnext_base", x: 185, y: 83.8 }, { name: "convnext_large", x: 380, y: 84.3 }] },
  "MobileNet":    { color: "#22C55E", data: [{ name: "mobilenet_v2", x: 8, y: 72.0 }, { name: "mobilenet_v3_s", x: 6, y: 67.7 }, { name: "mobilenet_v3_l", x: 10, y: 75.2 }] },
  "DenseNet":     { color: "#EAB308", data: [{ name: "densenet121", x: 52, y: 74.4 }, { name: "densenet169", x: 72, y: 75.6 }, { name: "densenet201", x: 95, y: 76.9 }] },
  "Swin":         { color: "#EC4899", data: [{ name: "swin_t", x: 200, y: 81.2 }, { name: "swin_b", x: 480, y: 83.5 }, { name: "swin_l", x: 870, y: 86.4 }] },
  "TIMM/CaiT":    { color: "#0EA5E9", data: [{ name: "timm_cait_xxs24", x: 850, y: 78.5 }, { name: "timm_cait_xxs36_384", x: 8720, y: 81.98 }, { name: "timm_cait_s36_384", x: 18200, y: 85.1 }] },
};

// ─── Tab types ────────────────────────────────────────────────────────────────

type TTab = "add-models" | "jobs";

// ─── Shared tab bar ───────────────────────────────────────────────────────────

const PageTabBar = ({ active, onChange }: { active: TTab; onChange: (t: TTab) => void }) => {
  const tabs: { id: TTab; label: string }[] = [
    { id: "add-models", label: "Add Models"    },
    { id: "jobs",       label: "Training Jobs" },
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

// ─── Primitives ───────────────────────────────────────────────────────────────

const FilterSelect = ({ label, options, value, onChange, className }: {
  label: string; options: { value: string; label: string }[]; value: string; onChange: (v: string) => void; className?: string;
}) => (
  <div className={cn("flex flex-col gap-1.5", className)}>
    <Label className="text-xs text-neutral-600">{label}</Label>
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 text-[12px]">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
      </SelectContent>
    </Select>
  </div>
);

function ProgressBar({ value, status }: { value: number; status: TrainingJob["status"] }) {
  const color = status === "running" ? TEAL : status === "paused" ? "#D97706" : "#E2E8F0";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${value}%`, backgroundColor: color }} />
      </div>
      <span className="text-[10px] font-mono text-neutral-500 w-7 text-right shrink-0">{value}%</span>
    </div>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScatterDot = (props: any) => {
  const { cx, cy, fill } = props;
  return <circle cx={cx} cy={cy} r={5} fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={1.2} />;
};

// ─── Training Jobs tab ────────────────────────────────────────────────────────

function JobsTab({ onView }: { onView: (j: TrainingJob) => void }) {
  return (
    <DataGrid<TrainingJob>
      columns={[
        { key: "id",          header: "Job ID",   width: "90px",  render: (r, h) => <MonoCell hovered={h} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>{r.id}</MonoCell> },
        { key: "status",      header: "Status",   width: "90px",  render: (r) => <StatusCapsule status={JOB_STATUS_KEY[r.status]} label={JOB_STATUS_LABEL[r.status]} /> },
        { key: "progress",    header: "Progress", width: "180px", render: (r) => <ProgressBar value={r.progress} status={r.status} /> },
        { key: "epochs",      header: "Epochs",   width: "90px",  align: "center", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#475569" hoveredColor="#0F172A">{r.currentEpoch} / {r.epochs}</MonoCell> },
        { key: "gpuModel",    header: "GPU",      width: "120px", render: (r, h) => <InterCell hovered={h} fontSize={10} color="#64748B" hoveredColor="#334155">{r.gpuModel}</InterCell> },
        { key: "computeType", header: "Provider", width: "80px",  render: (r, h) => <InterCell hovered={h} fontSize={10} color="#64748B" hoveredColor="#334155">{r.computeType}</InterCell> },
        { key: "startedAt",   header: "Started",  width: "130px", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.startedAt}</MonoCell> },
        { key: "duration",    header: "Duration", width: "80px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.duration}</MonoCell> },
        { key: "actions",     header: "",         width: "90px",  align: "right", render: (r, h) => (
          <div className="flex justify-end pr-1">
            <GridActions visible={h}>
              <GridActionButton title="View Details" hoverColor="#0284C7" onClick={() => onView(r)}><Eye className="w-3.5 h-3.5" /></GridActionButton>
              {r.status === "running" ? (
                <GridActionButton title="Pause"  hoverColor="#D97706"><StopCircle className="w-3.5 h-3.5" /></GridActionButton>
              ) : r.status === "paused" ? (
                <GridActionButton title="Resume" hoverColor={TEAL}><PlayCircle className="w-3.5 h-3.5" /></GridActionButton>
              ) : null}
            </GridActions>
          </div>
        )},
      ]}
      data={MOCK_PROJECT_JOBS}
    />
  );
}

// ─── Add Models tab ───────────────────────────────────────────────────────────

type AddModelView = "library" | "checkpoint";

function AddModelsTab() {
  const [view,       setView]       = useState<AddModelView>("library");
  const [dataset,    setDataset]    = useState("all");
  const [datasetVer, setDatasetVer] = useState("all");
  const [metric,     setMetric]     = useState("acc1");
  const [tuning,     setTuning]     = useState("default");
  const [compute,    setCompute]    = useState("auto");
  const [families,   setFamilies]   = useState("all");
  const [params,     setParams]     = useState("all");
  const [exportFmt,  setExportFmt]  = useState("pytorch");
  const [showNames,  setShowNames]  = useState(false);
  const [_chartView, setChartView]  = useState<"grid" | "list">("grid");

  // Checkpoint state
  const [checkpointName, setCheckpointName] = useState("");
  const [modelFamily,    setModelFamily]    = useState("");
  const [classesTab,     setClassesTab]     = useState<"add" | "upload">("add");
  const [classInput,     setClassInput]     = useState("");
  const [classes,        setClasses]        = useState<string[]>([]);
  const [urlInput,       setUrlInput]       = useState("");
  const [dragging,       setDragging]       = useState(false);

  const addCls = () => { if (classInput.trim()) { setClasses(p => [...p, classInput.trim()]); setClassInput(""); } };

  return (
    <div className="flex flex-col gap-0">

      {/* Sub-tab switcher */}
      <div className="flex items-center gap-1 px-5 py-3 border-b border-neutral-100 bg-white">
        {(["library", "checkpoint"] as AddModelView[]).map((v) => (
          <button key={v} onClick={() => setView(v)}
            className={cn("px-4 py-1.5 text-[11px] font-semibold rounded-full transition-colors",
              view === v ? "bg-[#00775B] text-white" : "text-neutral-500 hover:text-neutral-700 hover:bg-neutral-100")}>
            {v === "library" ? "Select from Library" : "Add Checkpoint"}
          </button>
        ))}
      </div>

      {/* ── Library view ── */}
      {view === "library" && (
        <div className="flex flex-col">
          <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-100">
            <div>
              <h3 className="text-[14px] font-bold text-neutral-900">Select Models by Performance</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5">Click a point to add a model. Adjust configuration from the popup.</p>
            </div>
            <div className="flex items-center gap-1 border border-neutral-200 rounded-[4px] p-0.5">
              <button onClick={() => setChartView("grid")} className="p-1.5 rounded-[3px] text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"><LayoutGrid className="w-3.5 h-3.5" /></button>
              <button onClick={() => setChartView("list")} className="p-1.5 rounded-[3px] text-neutral-400 hover:text-neutral-700 hover:bg-neutral-50 transition-colors"><List className="w-3.5 h-3.5" /></button>
            </div>
          </div>

          <div className="px-5 py-3 bg-neutral-50/50 border-b border-neutral-100 flex flex-col gap-3">
            <div className="grid grid-cols-5 gap-3">
              <FilterSelect label="Dataset" options={[
                { value: "all", label: "All Datasets" },
                { value: "train-v3", label: "Training Set v3" },
                { value: "aug-a", label: "Augmented Set A" },
              ]} value={dataset} onChange={setDataset} />
              <FilterSelect label="Dataset Version" options={[
                { value: "all", label: "All Versions" },
                { value: "v1", label: "v1" },
                { value: "v2", label: "v2" },
                { value: "v3", label: "v3" },
              ]} value={datasetVer} onChange={setDatasetVer} />
              <FilterSelect label="Primary Metric" options={[
                { value: "acc1",  label: "acc@1" },
                { value: "acc5",  label: "acc@5" },
                { value: "map",   label: "mAP" },
                { value: "miou",  label: "mIoU" },
              ]} value={metric} onChange={setMetric} />
              <FilterSelect label="Tuning Type" options={[
                { value: "default",   label: "Default" },
                { value: "autotune",  label: "AutoTune" },
                { value: "manual",    label: "Manual" },
              ]} value={tuning} onChange={setTuning} />
              <FilterSelect label="Compute" options={[
                { value: "auto",    label: "Auto launch instance" },
                { value: "matrice", label: "Matrice Cloud GPU" },
                { value: "aws",     label: "AWS p3.2xlarge" },
              ]} value={compute} onChange={setCompute} />
            </div>
            <div className="flex items-center gap-3">
              <FilterSelect label="Model Families" options={[
                { value: "all", label: "All Families" },
                ...Object.keys(MODEL_FAMILIES).map((f) => ({ value: f, label: f })),
              ]} value={families} onChange={setFamilies} className="w-44" />
              <FilterSelect label="Params (Million)" options={[
                { value: "all",   label: "All Params" },
                { value: "lt10",  label: "< 10M" },
                { value: "10-50", label: "10–50M" },
                { value: "50-200",label: "50–200M" },
                { value: "gt200", label: "> 200M" },
              ]} value={params} onChange={setParams} className="w-40" />
              <FilterSelect label="Export Format" options={[
                { value: "pytorch",   label: "PyTorch" },
                { value: "onnx",      label: "ONNX" },
                { value: "tensorrt",  label: "TensorRT" },
                { value: "openvino",  label: "OpenVINO" },
              ]} value={exportFmt} onChange={setExportFmt} className="w-36" />
              <div className="flex items-center gap-2 mt-5 ml-2">
                <Switch checked={showNames} onCheckedChange={setShowNames} />
                <span className="text-[12px] text-neutral-600">Display Model Names</span>
              </div>
              <button
                className="ml-auto mt-5 h-10 px-6 text-[12px] font-semibold rounded-[4px] text-white transition-colors"
                style={{ backgroundColor: TEAL }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#006649")}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = TEAL)}
              >
                Start Training
              </button>
            </div>
          </div>

          <div className="p-5">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 10, right: 30, bottom: 40, left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" type="number" name="Latency" domain={[0, 40000]} tickCount={9}
                  label={{ value: "Latency (ms) [Prediction time on NVIDIA V100]", position: "insideBottom", offset: -28, fontSize: 10, fill: "#94A3B8", fontWeight: 700 }}
                  tick={{ fontSize: 9, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }} />
                <YAxis dataKey="y" type="number" domain={[55, 92]}
                  label={{ value: "Performance Metric  Better →", angle: -90, position: "insideLeft", offset: -36, fontSize: 10, fill: "#94A3B8", fontWeight: 600 }}
                  tick={{ fontSize: 9, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload?.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div className="bg-white border border-neutral-200 rounded-[4px] px-3 py-2 shadow-lg text-[11px] max-w-[220px]">
                      <p className="font-bold text-neutral-800 mb-1">{d.name}</p>
                      <p className="text-neutral-500">Latency: <span className="font-mono text-neutral-700">{d.x.toFixed(2)}</span></p>
                      <p className="text-neutral-500">{metric}: <span className="font-mono text-[#00775B] font-semibold">{d.y}</span></p>
                    </div>
                  );
                }} />
                {Object.entries(MODEL_FAMILIES).map(([name, { color, data }]) => (
                  <Scatter key={name} name={name} data={data} fill={color} shape={<ScatterDot />} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap gap-3 mt-2 justify-center">
              {Object.entries(MODEL_FAMILIES).map(([name, { color }]) => (
                <div key={name} className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[10px] font-medium text-neutral-500">{name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Checkpoint view ── */}
      {view === "checkpoint" && (
        <div className="p-5 flex flex-col gap-5">
          <div>
            <h3 className="text-[14px] font-bold text-neutral-900">Add Model Checkpoint</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Upload a custom model checkpoint to use in training.</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Checkpoint Name</Label>
            <Input
              value={checkpointName}
              onChange={(e) => setCheckpointName(e.target.value)}
              placeholder="e.g. my_custom_model_v1"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Model Family</Label>
            <Select value={modelFamily} onValueChange={setModelFamily}>
              <SelectTrigger className="h-10 text-[12px]">
                <SelectValue placeholder="Select model family…" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(MODEL_FAMILIES).map((f) => (
                  <SelectItem key={f} value={f}>{f}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
            <div className="flex border-b border-neutral-100">
              {(["add", "upload"] as const).map((t) => (
                <button key={t} onClick={() => setClassesTab(t)}
                  className={cn("flex flex-col items-start px-4 py-2.5 text-[12px] transition-colors border-r border-neutral-100 last:border-r-0",
                    classesTab === t ? "bg-[#00775B]/8 text-[#00775B] font-semibold border-b-2 border-b-[#00775B]" : "text-neutral-500 hover:bg-neutral-50")}>
                  <span className="font-semibold">{t === "add" ? "Add Classes" : "Upload Classes"}</span>
                  <span className="text-[10px] font-normal text-neutral-400 mt-0.5">{t === "add" ? "Add classes manually" : "Supported formats: .txt"}</span>
                </button>
              ))}
            </div>
            {classesTab === "add" && (
              <div className="p-3 flex gap-2 items-end">
                <div className="flex-1">
                  <Input
                    value={classInput}
                    onChange={(e) => setClassInput(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && addCls()}
                    placeholder="Add class name…"
                  />
                </div>
                <button onClick={addCls} className="h-10 px-5 text-[12px] font-semibold text-white rounded-[4px] shrink-0" style={{ backgroundColor: TEAL }}>Add</button>
              </div>
            )}
            {classes.length > 0 && (
              <div className="px-3 pb-3 flex flex-wrap gap-1.5">
                {classes.map((c) => (
                  <span key={c} className="flex items-center gap-1 px-2 py-0.5 bg-[#00775B]/10 text-[#00775B] rounded text-[11px] font-medium">
                    {c}
                    <button onClick={() => setClasses(p => p.filter(x => x !== c))} className="hover:text-red-500"><span>×</span></button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-5">
            <div
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e)    => { e.preventDefault(); setDragging(false); }}
              className={cn("flex flex-col items-center justify-center gap-3 py-10 rounded-[4px] border-2 border-dashed transition-colors cursor-pointer",
                dragging ? "border-[#00775B] bg-[#00775B]/5" : "border-[#00775B]/40 bg-neutral-50")}>
              <div className="w-12 h-12 flex items-center justify-center text-[#00775B]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-10 h-10">
                  <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <p className="text-[13px] font-semibold text-neutral-700">Drag &amp; Drop files here</p>
              <p className="text-[11px] text-neutral-400">Accepts .pt format</p>
            </div>

            <div className="flex flex-col gap-3">
              <p className="text-[13px] font-semibold text-neutral-800">Import from</p>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "AWS",    logo: <span className="text-[10px] font-bold" style={{ color: "#FF9900" }}>aws</span> },
                  { label: "GCP",    logo: <span className="text-[11px] font-bold text-blue-500">G</span> },
                  { label: "Oracle", logo: <span className="text-[9px] font-bold text-red-600">OCI</span> },
                  { label: "Others", logo: <span className="text-[9px] font-semibold text-neutral-500">•••</span> },
                ].map(({ label, logo }) => (
                  <div key={label} className="flex flex-col items-center gap-1 cursor-pointer group">
                    <div className="w-10 h-10 rounded-[6px] border border-neutral-200 flex items-center justify-center bg-white shadow-sm group-hover:border-[#00775B] transition-all">{logo}</div>
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">URL</Label>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://…"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-start">
            <button disabled={!checkpointName || !modelFamily}
              className="h-9 px-6 text-[12px] font-semibold text-white rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: TEAL }}>
              Add Checkpoint
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── TrainingJobs page ────────────────────────────────────────────────────────

interface TrainingJobsProps { project: TrainingProject; }

export function TrainingJobs({ project: _project }: TrainingJobsProps) {
  const [tab,         setTab]         = useState<TTab>("add-models");
  const [selectedJob, setSelectedJob] = useState<TrainingJob | null>(null);

  if (selectedJob) {
    return <ModelDetail job={selectedJob} onBack={() => setSelectedJob(null)} />;
  }

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden">
        <PageTabBar active={tab} onChange={setTab} />
        {tab === "add-models" && <AddModelsTab />}
        {tab === "jobs"       && <JobsTab onView={setSelectedJob} />}
      </div>
    </div>
  );
}
