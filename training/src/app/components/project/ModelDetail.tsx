import { useState, useMemo } from "react";
import {
  ArrowLeft, ChevronRight, ExternalLink, Download, CloudUpload,
  Play, Search, RefreshCw, CheckCircle, AlertCircle, Info,
  AlertTriangle, XCircle, Terminal, Copy, LayoutGrid, List,
  FileDown, Cpu, Zap, Package, Settings2, ChevronDown, X,
  Database, FlaskConical, TrendingUp, Layers,
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend, Cell,
} from "recharts";
import { Label }  from "@fe-common/components/ui/label";
import { Input }  from "@fe-common/components/ui/Input";
import { Slider } from "@fe-common/components/ui/slider";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@fe-common/components/ui/select";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";
import { Switch } from "@fe-common/components/ui/switch";
import { Select as FESelect } from "@fe-common/components/ui/ui-select";
import { Input as FEInput } from "@fe-common/components/ui/ui-input";
import { StatCard, type StatCardData } from "@fe-common/components/ui/StatCard";
import { TrainingJob } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Mock model data ──────────────────────────────────────────────────────────

const MODEL = {
  name:          "Skin-Cancer-Classification-Experiment-1-1",
  dataset:       "Skin Cancer Classification",
  datasetVer:    "v1.0",
  trainCount:    2639,
  testCount:     329,
  valCount:      329,
  framework:     "PyTorch",
  targetRuntime: "PyTorch",
  metric:        "acc@1",
  performance:   0.841945,
  status:        "Trained",
  updatedAt:     "11/10/2024",
  createdBy:     "Mohned Moneam",
  params: {
    batch_size:     "4",
    epochs:         "50",
    learning_rate:  "0.001",
    lr_gamma:       "0.1",
    lr_min:         "0.00001",
    lr_scheduler:   "StepLR",
    lr_step_size:   "10",
    min_delta:      "0.0001",
    momentum:       "0.95",
    optimizer:      "AdamW",
    patience:       "5",
    primary_metric: "acc@1",
    target_runtime: "PyTorch",
    weight_decay:   "0.0001",
  },
  modelInfo: {
    key:       "efficientnet_v2_s",
    name:      "EfficientNetV2 Small",
    paramsM:   "21.5",
    runtime:   "N/A",
  },
  familyInfo: {
    familyName:   "EfficientNet_V2",
    input:        "image",
    output:       "classification",
    exportFmts:   ["ONNX", "OpenVINO", "PyTorch", "TensorRT"],
    benchmarks:   "N/A",
    metrics:      ["acc@1", "acc@5", "f1_score", "precision", "recall", "specificity"],
    dockerImg:    "N/A",
    trainFW:      "PyTorch",
    dataProc:     "ImageNet",
    pruning:      "False",
    private:      "False",
    references:   ["https://arxiv.org/abs/2104.00298"],
    repoLink:     "N/A",
    description:  "EfficientNetV2 is a family of convolutional neural networks, with variants including Large, Medium, and Small. These models are built upon a concept called 'compound scaling,' addressing the trade-off between model size, accuracy, and computational efficiency. EfficientNetV2 is optimized for image classification tasks.",
  },
  architectures: [
    { name: "EfficientNetV2-S", key: "efficientnet_v2_s", paramsM: 21.5 },
    { name: "EfficientNetV2-M", key: "efficientnet_v2_m", paramsM: 54.1 },
    { name: "EfficientNetV2-L", key: "efficientnet_v2_l", paramsM: 118.5 },
  ],
};

// Performance chart mock
const PERF_DATA = [
  { category: "all",       val: 0.861, test: 0.842 },
  { category: "benign",    val: 0.883, test: 0.859 },
  { category: "malignant", val: 0.841, test: 0.824 },
];

// Training curves mock
const EPOCH_DATA = Array.from({ length: 50 }, (_, i) => {
  const epoch = i + 1;
  return {
    epoch,
    train_loss: Math.max(0.08, 1.2 * Math.exp(-epoch * 0.06) + (Math.random() - 0.5) * 0.03),
    val_loss:   Math.max(0.12, 1.4 * Math.exp(-epoch * 0.055) + (Math.random() - 0.5) * 0.04),
    train_acc:  Math.min(0.97, 0.45 + 0.52 * (1 - Math.exp(-epoch * 0.07)) + (Math.random() - 0.5) * 0.01),
    val_acc:    Math.min(0.93, 0.42 + 0.49 * (1 - Math.exp(-epoch * 0.065)) + (Math.random() - 0.5) * 0.015),
  };
});

// Confusion matrix mock (benign vs malignant)
const CONFUSION = {
  labels: ["benign", "malignant"],
  matrix: [[270, 59], [18, 311]],
};

// ROC curve mock
const ROC_DATA = (() => {
  const pts = [{ fpr: 0, tpr: 0 }];
  for (let i = 1; i <= 20; i++) {
    const fpr = i / 20;
    const tpr = Math.min(1, Math.sqrt(fpr) * 0.97 + (Math.random() - 0.5) * 0.03);
    pts.push({ fpr: +fpr.toFixed(3), tpr: +tpr.toFixed(3) });
  }
  pts.push({ fpr: 1, tpr: 1 });
  return pts;
})();

// Logs mock
type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";
const MOCK_LOGS: { ts: string; level: LogLevel; source: string; msg: string }[] = [
  { ts: "2024-11-10 14:30:01", level: "INFO",  source: "trainer",   msg: "Starting training job: Skin-Cancer-Classification-Experiment-1-1" },
  { ts: "2024-11-10 14:30:02", level: "INFO",  source: "loader",    msg: "Dataset loaded: 2639 train / 329 val / 329 test items" },
  { ts: "2024-11-10 14:30:03", level: "DEBUG", source: "model",     msg: "Initialising EfficientNetV2-S (21.5M params, pretrained=True)" },
  { ts: "2024-11-10 14:30:05", level: "INFO",  source: "optimizer", msg: "Optimizer: AdamW | lr=0.001 | weight_decay=0.0001 | momentum=0.95" },
  { ts: "2024-11-10 14:30:05", level: "INFO",  source: "scheduler", msg: "Scheduler: StepLR | step_size=10 | gamma=0.1 | lr_min=0.00001" },
  { ts: "2024-11-10 14:30:10", level: "INFO",  source: "epoch",     msg: "Epoch  1/50 | train_loss=1.182 | val_loss=1.347 | val_acc=0.423" },
  { ts: "2024-11-10 14:31:22", level: "INFO",  source: "epoch",     msg: "Epoch  5/50 | train_loss=0.741 | val_loss=0.883 | val_acc=0.621" },
  { ts: "2024-11-10 14:32:45", level: "INFO",  source: "epoch",     msg: "Epoch 10/50 | train_loss=0.482 | val_loss=0.591 | val_acc=0.744" },
  { ts: "2024-11-10 14:34:10", level: "WARN",  source: "lr",        msg: "Learning rate stepped: 0.001 → 0.0001 at epoch 10" },
  { ts: "2024-11-10 14:35:15", level: "INFO",  source: "epoch",     msg: "Epoch 15/50 | train_loss=0.334 | val_loss=0.421 | val_acc=0.813" },
  { ts: "2024-11-10 14:36:40", level: "INFO",  source: "epoch",     msg: "Epoch 20/50 | train_loss=0.282 | val_loss=0.371 | val_acc=0.841" },
  { ts: "2024-11-10 14:36:40", level: "INFO",  source: "checkpoint",msg: "Best model saved: val_acc=0.841 at epoch 20" },
  { ts: "2024-11-10 14:38:05", level: "WARN",  source: "lr",        msg: "Learning rate stepped: 0.0001 → 0.00001 at epoch 20" },
  { ts: "2024-11-10 14:42:30", level: "INFO",  source: "epoch",     msg: "Epoch 30/50 | train_loss=0.214 | val_loss=0.308 | val_acc=0.852" },
  { ts: "2024-11-10 14:47:55", level: "INFO",  source: "epoch",     msg: "Epoch 40/50 | train_loss=0.189 | val_loss=0.294 | val_acc=0.859" },
  { ts: "2024-11-10 14:51:30", level: "INFO",  source: "epoch",     msg: "Epoch 50/50 | train_loss=0.174 | val_loss=0.288 | val_acc=0.861" },
  { ts: "2024-11-10 14:51:45", level: "INFO",  source: "eval",      msg: "Test evaluation: test_acc=0.842 | test_loss=0.301" },
  { ts: "2024-11-10 14:51:48", level: "INFO",  source: "trainer",   msg: "Training complete. Status: TRAINED" },
];

// ─── Shared primitives ────────────────────────────────────────────────────────

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-md border border-neutral-200 shadow-sm", className)}>{children}</div>
);

const SectionHead = ({ title, sub, action }: { title: string; sub?: string; action?: React.ReactNode }) => (
  <div className="px-5 py-4 border-b border-neutral-100 flex items-start justify-between">
    <div>
      <h3 className="text-[13px] font-semibold text-neutral-800">{title}</h3>
      {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
    </div>
    {action}
  </div>
);

// Chip tag
const Chip = ({ children, color }: { children: React.ReactNode; color?: string }) => (
  <span className="inline-flex items-center h-6 px-2.5 rounded-md border text-[10px] font-semibold"
    style={{ color: color ?? "#475569", borderColor: color ? `${color}40` : "#E2E8F0", backgroundColor: color ? `${color}10` : "#F8FAFC" }}>
    {children}
  </span>
);

// Key-value pair with label on top
const KVCell = ({ k, v, chip }: { k: string; v: React.ReactNode; chip?: boolean }) => (
  <div className="flex flex-col gap-1 py-4 px-4 border-r border-b border-neutral-100 last:border-r-0">
    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{k}</span>
    {chip ? (
      <div className="flex flex-wrap gap-1 mt-0.5">
        {Array.isArray(v) ? v.map((tag) => (
          <span key={tag} className="inline-flex items-center h-5 px-2 rounded border border-neutral-200 text-[10px] font-medium text-neutral-600 bg-neutral-50">{tag}</span>
        )) : <span className="inline-flex items-center h-5 px-2 rounded border border-neutral-200 text-[10px] font-medium text-neutral-600 bg-neutral-50">{v}</span>}
      </div>
    ) : (
      <span className="text-[13px] font-semibold text-neutral-800 leading-snug">{v}</span>
    )}
  </div>
);

// Multi-select chip input (simulated)
type MultiChipState = string[];
const MultiChipSelect = ({ label, values, onRemove, placeholder, options, onAdd }: {
  label: string; values: MultiChipState; onRemove: (v: string) => void;
  placeholder?: string; options: string[]; onAdd: (v: string) => void;
}) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex flex-col gap-1 relative">
      <span className="text-[10px] font-semibold text-neutral-500 px-1 -mb-1">{label}</span>
      <div onClick={() => setOpen(!open)}
        className="min-h-[36px] w-full border border-neutral-200 rounded-md px-2.5 py-1.5 flex flex-wrap gap-1 items-center cursor-pointer hover:border-neutral-300 transition-colors bg-white">
        {values.map((v) => (
          <span key={v} className="inline-flex items-center gap-1 h-5 px-2 rounded bg-[#E5FFF9] text-[#00775B] text-[10px] font-semibold">
            {v}
            <button onClick={(e) => { e.stopPropagation(); onRemove(v); }} className="hover:text-red-500"><X className="w-2.5 h-2.5" /></button>
          </span>
        ))}
        {values.length === 0 && <span className="text-[11px] text-neutral-400">{placeholder}</span>}
        <ChevronDown className="w-3 h-3 text-neutral-400 ml-auto" />
      </div>
      {open && (
        <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-neutral-200 rounded-md shadow-lg py-1 max-h-40 overflow-y-auto">
          {options.filter((o) => !values.includes(o)).map((o) => (
            <button key={o} onClick={() => { onAdd(o); setOpen(false); }}
              className="w-full text-left px-3 py-1.5 text-[11px] text-neutral-700 hover:bg-[#E5FFF9] hover:text-[#00775B] transition-colors">
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type MTab = "summary" | "hyperparams" | "analysis" | "model-test" | "evaluation" | "export" | "logs";
const MTABS: { id: MTab; label: string }[] = [
  { id: "summary",    label: "Summary"          },
  { id: "hyperparams",label: "Hyperparameters"  },
  { id: "analysis",   label: "Training Analysis"},
  { id: "model-test", label: "Model Test"       },
  { id: "evaluation", label: "Evaluation"       },
  { id: "export",     label: "Export"           },
  { id: "logs",       label: "Logs"             },
];

// ─── Header info bar ─────────────────────────────────────────────────────────

function ModelHeaderBar() {
  return (
    <div className="flex items-center gap-3 px-5 py-2 border-b border-neutral-200 bg-white flex-wrap text-[11px]">
      <div className="flex items-center gap-3">
        <span className="text-neutral-400">Last Updated: <span className="font-medium text-neutral-600">{MODEL.updatedAt}</span></span>
        <span className="text-neutral-200">|</span>
        <span className="text-neutral-400">Created By: <span className="font-medium text-neutral-600">{MODEL.createdBy}</span></span>
      </div>
      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1 h-6 px-3 rounded-full border border-neutral-300 text-neutral-700 text-[10px] font-semibold bg-white">
          <CheckCircle className="w-3 h-3 text-[#00775B]" /> {MODEL.status}
        </span>
        <span className="text-[11px] font-mono font-medium text-neutral-500 bg-neutral-100 h-6 px-2.5 rounded flex items-center truncate max-w-[160px]">
          {MODEL.name.slice(0, 32)}…
        </span>
        <button className="h-6 px-3 rounded text-[11px] font-semibold text-neutral-700 border border-neutral-200 hover:bg-neutral-50 transition-colors">
          Optimize/Export
        </button>
        <button className="h-6 px-3 rounded bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors">
          Deploy
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

function SummaryTab() {
  const [splitFilter, setSplitFilter] = useState<string[]>(["test", "val"]);
  const [metricFilter, setMetricFilter] = useState("acc@1");
  const [labelFilter,  setLabelFilter]  = useState<string[]>(["all", "benign", "malignant"]);
  const [modelsFilter, setModelsFilter] = useState<string[]>(["Skin-Cancer-Exp-1-1"]);
  const [classRange,   setClassRange]   = useState<number[]>([0, 20]);
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");

  const total = MODEL.trainCount + MODEL.testCount + MODEL.valCount;

  const STAT_CARDS: StatCardData[] = [
    {
      label: "Test Accuracy", value: "84.19%", sublabel: "acc@1 · test split",
      num: "+1.3%", ref_: "vs baseline", dir: "up", chip: "ACC@1",
      color: "#64748B", bgColor: "#F1F5F9",
      sparkline: [74, 78, 80, 80, 82, 83, 84, 84.19],
    },
    {
      label: "Val Accuracy", value: "86.1%", sublabel: "acc@1 · val split",
      num: "Epoch 50", ref_: "final epoch", dir: "up", chip: "VAL",
      color: "#64748B", bgColor: "#F1F5F9",
      sparkline: [42, 62, 74, 81, 84, 85, 86, 86.1],
    },
    {
      label: "Total Samples", value: "3,297", sublabel: `${MODEL.trainCount} train · ${MODEL.testCount} test · ${MODEL.valCount} val`,
      num: `${MODEL.valCount}`, ref_: "val samples", dir: "neutral", chip: "DATA",
      color: "#64748B", bgColor: "#F1F5F9",
    },
    {
      label: "Model Params", value: "21.5M", sublabel: "EfficientNetV2-S",
      num: "FP32", ref_: "no pruning", dir: "neutral", chip: "PARAMS",
      color: "#64748B", bgColor: "#F1F5F9",
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC] min-w-0">

      {/* ── StatCards row ── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STAT_CARDS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* ── Dataset + Training Config info ── */}
      <div className="grid grid-cols-2 gap-4">

        {/* Dataset card */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50/40">
            <Database className="w-3.5 h-3.5 text-neutral-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Dataset</h3>
          </div>
          <div className="grid grid-cols-2 divide-x divide-neutral-100">
            <KVCell k="Dataset Name"    v={<span className="text-[#00775B] font-semibold">{MODEL.dataset}</span>} />
            <KVCell k="Dataset Version" v={<span className="text-[#00775B] font-semibold">{MODEL.datasetVer}</span>} />
          </div>
          <div className="border-t border-neutral-100 px-5 pt-3 pb-1 flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Split Distribution</span>
            <div className="flex items-center gap-3 text-[10px]">
              {([
                { label: "Train", count: MODEL.trainCount, color: "#00775B" },
                { label: "Test",  count: MODEL.testCount,  color: "#0284C7" },
                { label: "Val",   count: MODEL.valCount,   color: "#D97706" },
              ] as const).map(({ label, count, color }) => (
                <span key={label} className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-sm shrink-0 inline-block" style={{ backgroundColor: color }} />
                  <span className="text-neutral-500">{label}</span>
                  <span className="font-mono font-semibold" style={{ color }}>{count.toLocaleString()}</span>
                </span>
              ))}
            </div>
          </div>
          <div className="px-5 pb-4 pt-2">
            <div className="h-2 rounded-full overflow-hidden flex">
              <div className="h-full bg-[#00775B] transition-all" style={{ width: `${(MODEL.trainCount / total) * 100}%` }} />
              <div className="h-full bg-[#0284C7] transition-all" style={{ width: `${(MODEL.testCount  / total) * 100}%` }} />
              <div className="h-full bg-[#D97706] transition-all" style={{ width: `${(MODEL.valCount   / total) * 100}%` }} />
            </div>
          </div>
        </Card>

        {/* Training config card */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50/40">
            <Cpu className="w-3.5 h-3.5 text-neutral-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-500">Training Configuration</h3>
          </div>
          <div className="grid grid-cols-2 divide-x divide-neutral-100">
            <KVCell k="Training Framework" v={<span className="text-[#00775B] font-semibold">{MODEL.framework}</span>} />
            <KVCell k="Target Runtime"     v={<span className="text-[#00775B] font-semibold">{MODEL.targetRuntime}</span>} />
          </div>
          <div className="grid grid-cols-2 divide-x divide-neutral-100 border-t border-neutral-100">
            <KVCell k="Primary Metric" v={
              <span className="inline-flex items-center h-6 px-2.5 rounded-[4px] text-[11px] font-bold bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20">
                {MODEL.metric}
              </span>
            } />
            <KVCell k="Performance (Test)" v={
              <div className="flex items-center gap-2">
                <span className="text-[22px] font-bold font-mono text-[#00775B] leading-none">{(MODEL.performance * 100).toFixed(2)}%</span>
                <TrendingUp className="w-4 h-4 text-[#00775B]/60" />
              </div>
            } />
          </div>
        </Card>
      </div>

      {/* ── Model Performance chart ── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-800">Model Performance</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Per-class breakdown across splits</p>
          </div>
          <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-0.5">
            <button onClick={() => setViewMode("grid")}
              className={cn("p-1.5 rounded transition-colors", viewMode === "grid" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400")}>
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button onClick={() => setViewMode("list")}
              className={cn("p-1.5 rounded transition-colors", viewMode === "list" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400")}>
              <List className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="flex">
          {/* Filter sidebar */}
          <div className="w-64 flex-shrink-0 border-r border-neutral-100 p-4 flex flex-col gap-4 bg-neutral-50/30">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Filters</p>
            <MultiChipSelect label="Select Split Type"
              values={splitFilter} onRemove={(v) => setSplitFilter(p => p.filter(x => x !== v))}
              options={["train", "test", "val"]} onAdd={(v) => setSplitFilter(p => [...p, v])}
              placeholder="Select splits…" />
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Select Metric</Label>
              <Select value={metricFilter} onValueChange={setMetricFilter}>
                <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {["acc@1", "acc@5", "f1_score", "precision", "recall"].map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <MultiChipSelect label="Select Labels"
              values={labelFilter} onRemove={(v) => setLabelFilter(p => p.filter(x => x !== v))}
              options={["all", "benign", "malignant"]} onAdd={(v) => setLabelFilter(p => [...p, v])}
              placeholder="Select labels…" />
            <MultiChipSelect label="Select Models (max 3)"
              values={modelsFilter} onRemove={(v) => setModelsFilter(p => p.filter(x => x !== v))}
              options={["Skin-Cancer-Exp-1-1", "RegNet-Y-timm_1280"]}
              onAdd={(v) => modelsFilter.length < 3 && setModelsFilter(p => [...p, v])}
              placeholder="Select models…" />
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-600">Number of Classes</Label>
                <span className="text-[10px] font-mono text-neutral-400">{classRange[0]}–{classRange[1]}</span>
              </div>
              <Slider value={classRange} onValueChange={setClassRange} min={0} max={20} step={1}
                className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
            </div>
            <button className="h-9 rounded-[4px] bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
              Apply Filters
            </button>
          </div>

          {/* Chart / Table area */}
          <div className="flex-1 p-5 flex flex-col gap-3">
            {/* Quick metric chips */}
            <div className="flex items-center gap-2 flex-wrap">
              {[
                { label: "Accuracy",   value: "84.19%", color: "#00775B" },
                { label: "Macro F1",   value: "0.882",  color: "#0284C7" },
                { label: "Precision",  value: "0.889",  color: "#7C3AED" },
                { label: "Recall",     value: "0.883",  color: "#D97706" },
              ].map(({ label, value, color }) => (
                <div key={label} className="flex items-center gap-2 h-8 px-3 rounded-[4px] border border-neutral-200 bg-white">
                  <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</span>
                  <span className="font-mono font-bold text-[12px]" style={{ color }}>{value}</span>
                </div>
              ))}
            </div>
            {viewMode === "grid" ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={PERF_DATA} layout="vertical" margin={{ top: 4, right: 32, bottom: 24, left: 56 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                  <XAxis type="number" domain={[0, 0.9]} tick={{ fontSize: 10, fill: "#94A3B8" }}
                    label={{ value: metricFilter, position: "insideBottom", offset: -14, fontSize: 10, fill: "#94A3B8" }} />
                  <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }} width={60} />
                  <Tooltip
                    content={({ active, payload, label }) => {
                      if (!active || !payload?.length) return null;
                      return (
                        <div className="bg-white border border-neutral-200 rounded-[4px] px-3 py-2 shadow text-[11px]">
                          <p className="font-semibold text-neutral-800 capitalize mb-1">{label}</p>
                          {payload.map((p) => (
                            <p key={p.dataKey} className="font-mono" style={{ color: p.fill }}>
                              {String(p.dataKey)}: {Number(p.value).toFixed(4)}
                            </p>
                          ))}
                        </div>
                      );
                    }}
                  />
                  <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                  <Bar dataKey="val"  name={`${MODEL.name.slice(0, 22)}… (val)`}  fill="#06B6D4" barSize={20} radius={[0, 2, 2, 0]} />
                  <Bar dataKey="test" name={`${MODEL.name.slice(0, 22)}… (test)`} fill={TEAL}     barSize={20} radius={[0, 2, 2, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <DataTable<{ id: number; category: string; val: number; test: number }>
                columns={[
                  { id: "category", header: "Class", accessorKey: "category",
                    cell: ({ row }) => <span className="capitalize font-medium text-neutral-700 text-[12px]">{row.category}</span> },
                  { id: "val",  header: "Val Score",  accessorKey: "val",  align: "right",
                    cell: ({ row }) => (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(row.val / 0.9) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-cyan-600">{row.val.toFixed(4)}</span>
                      </div>
                    ) },
                  { id: "test", header: "Test Score", accessorKey: "test", align: "right",
                    cell: ({ row }) => (
                      <div className="flex items-center justify-end gap-2">
                        <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                          <div className="h-full rounded-full bg-[#00775B]" style={{ width: `${(row.test / 0.9) * 100}%` }} />
                        </div>
                        <span className="font-mono text-[11px] font-semibold text-[#00775B]">{row.test.toFixed(4)}</span>
                      </div>
                    ) },
                ]}
                data={PERF_DATA.map((r, i) => ({ id: i, ...r }))}
                rowIdKey="id"
                pagination="none"
                toolbar={false}
              />
            )}
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — HYPERPARAMETERS
// ═══════════════════════════════════════════════════════════════════════════════

// Param group definition
const PARAM_GROUPS = [
  {
    id: "training",
    label: "Training Config",
    color: "#00775B",
    bgColor: "#F0FBF7",
    icon: Cpu,
    params: [
      { key: "batch_size",     label: "Batch Size",          chip: false },
      { key: "epochs",         label: "Epochs",              chip: false },
      { key: "patience",       label: "Early Stop Patience", chip: false },
      { key: "min_delta",      label: "Min Delta",           chip: false },
      { key: "primary_metric", label: "Primary Metric",      chip: true  },
      { key: "target_runtime", label: "Target Runtime",      chip: true  },
    ],
  },
  {
    id: "optimizer",
    label: "Optimizer",
    color: "#0284C7",
    bgColor: "#F0F7FF",
    icon: Zap,
    params: [
      { key: "optimizer",    label: "Optimizer",    chip: true  },
      { key: "learning_rate",label: "Learning Rate",chip: false },
      { key: "momentum",     label: "Momentum",     chip: false },
      { key: "weight_decay", label: "Weight Decay", chip: false },
    ],
  },
  {
    id: "scheduler",
    label: "LR Scheduler",
    color: "#7C3AED",
    bgColor: "#FAF5FF",
    icon: Settings2,
    params: [
      { key: "lr_scheduler", label: "Scheduler Type", chip: true  },
      { key: "lr_step_size", label: "Step Size",       chip: false },
      { key: "lr_gamma",     label: "Gamma",           chip: false },
      { key: "lr_min",       label: "Min LR",          chip: false },
    ],
  },
] as const;

function HyperparametersTab() {

  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC] min-w-0">

      {/* ── Model Info + Benchmark Results + Architectures — same row ── */}
      <div className="grid grid-cols-3 gap-4">

        {/* ── Model Information ── */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
            <Package className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Model Information</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {([
              { label: "Model Key",       value: MODEL.modelInfo.key,       mono: true,  accent: false },
              { label: "Model Name",      value: MODEL.modelInfo.name,      mono: false, accent: false },
              { label: "Parameters",      value: `${MODEL.modelInfo.paramsM}M`, mono: true, accent: true },
              { label: "Runtime",         value: MODEL.modelInfo.runtime,   mono: false, accent: false },
              { label: "Framework",       value: MODEL.familyInfo.trainFW,  mono: false, accent: false },
              { label: "Data Processing", value: MODEL.familyInfo.dataProc, mono: false, accent: false },
              { label: "Pruning",         value: MODEL.familyInfo.pruning,  mono: false, accent: false },
              { label: "Input → Output",  value: `${MODEL.familyInfo.input} → ${MODEL.familyInfo.output}`, mono: false, accent: false },
            ] as { label: string; value: string; mono: boolean; accent: boolean }[]).map(({ label, value, mono, accent }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/60 transition-colors">
                <span className="text-[11px] text-neutral-500 shrink-0 mr-3">{label}</span>
                <span className={cn(
                  "text-[12px] font-semibold text-right capitalize",
                  mono && "font-mono normal-case",
                  accent ? "text-[#00775B]" : "text-neutral-800",
                )}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Benchmark Results ── */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
            <FlaskConical className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Benchmark Results</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {([
              { label: "Dataset", value: "ImageNet",  chip: false },
              { label: "Metric",  value: "acc@1",     chip: true, chipColor: "#00775B", chipBg: "#E5FFF9" },
              { label: "Split",   value: "val",       chip: true, chipColor: "#475569",  chipBg: "#F1F5F9" },
            ] as { label: string; value: string; chip: boolean; chipColor?: string; chipBg?: string }[]).map(({ label, value, chip, chipColor, chipBg }) => (
              <div key={label} className="flex items-center justify-between px-5 py-3">
                <span className="text-[11px] text-neutral-500">{label}</span>
                {chip ? (
                  <span className="inline-flex items-center h-5 px-2.5 rounded-[4px] text-[10px] font-bold border"
                    style={{ color: chipColor, backgroundColor: chipBg, borderColor: `${chipColor}30` }}>
                    {value.toUpperCase()}
                  </span>
                ) : (
                  <span className="text-[13px] font-bold text-neutral-800">{value}</span>
                )}
              </div>
            ))}
            {/* Score section */}
            <div className="px-5 py-4 flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-neutral-500">Score</span>
                <span className="font-mono font-bold text-[22px] text-[#0284C7] leading-none">84.23</span>
              </div>
              <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full bg-[#0284C7]" style={{ width: "84.23%" }} />
              </div>
              <div className="flex justify-between text-[9px] font-mono text-neutral-400">
                <span>0</span><span>50</span><span>100</span>
              </div>
            </div>
          </div>
        </Card>

        {/* ── Model Architectures ── */}
        <Card className="overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
            <Layers className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
            <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Model Architectures</h3>
          </div>
          <div className="divide-y divide-neutral-100">
            {MODEL.architectures.map((arch) => {
              const isActive = arch.key === MODEL.modelInfo.key;
              const pct = (arch.paramsM / 120) * 100;
              return (
                <div key={arch.key}
                  className={cn(
                    "px-5 py-3.5 flex flex-col gap-2 transition-colors",
                    isActive ? "bg-[#F0FBF7]" : "hover:bg-neutral-50/50",
                  )}>
                  {/* Name + badge row */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={cn(
                        "w-1.5 h-1.5 rounded-full shrink-0",
                        isActive ? "bg-[#00775B]" : "bg-neutral-300",
                      )} />
                      <span className="text-[12px] font-semibold text-neutral-800">{arch.name}</span>
                      {isActive && (
                        <span className="inline-flex items-center h-4 px-1.5 rounded-[4px] bg-[#E5FFF9] text-[#00775B] text-[9px] font-bold uppercase border border-[#00775B]/20">
                          Active
                        </span>
                      )}
                    </div>
                    <span className={cn(
                      "inline-flex items-center h-5 px-2 rounded-[4px] text-[10px] font-bold shrink-0",
                      isActive ? "bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20" : "bg-neutral-100 text-neutral-500",
                    )}>
                      {arch.paramsM < 30 ? "Small" : arch.paramsM < 80 ? "Medium" : "Large"}
                    </span>
                  </div>
                  {/* Params bar */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full"
                        style={{ width: `${pct}%`, backgroundColor: isActive ? "#00775B" : "#7C3AED" }} />
                    </div>
                    <span className="font-mono text-[11px] font-bold shrink-0 w-10 text-right"
                      style={{ color: isActive ? "#00775B" : "#7C3AED" }}>
                      {arch.paramsM}M
                    </span>
                  </div>
                  {/* Model key */}
                  <span className="font-mono text-[10px] text-neutral-400">{arch.key}</span>
                </div>
              );
            })}
          </div>
        </Card>

      </div>

      {/* ── Param group cards ── */}
      <div className="grid grid-cols-3 gap-4">
        {PARAM_GROUPS.map((group) => {
          const GroupIcon = group.icon;
          return (
            <Card key={group.id} className="overflow-hidden">
              {/* Group header */}
              <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 bg-neutral-50">
                <GroupIcon className="w-3.5 h-3.5 shrink-0 text-neutral-400" />
                <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">
                  {group.label}
                </h3>
              </div>
              {/* Params list */}
              <div className="divide-y divide-neutral-100">
                {group.params.map(({ key, label, chip }) => {
                  const value = MODEL.params[key as keyof typeof MODEL.params];
                  return (
                    <div key={key} className="flex items-center justify-between px-5 py-3 hover:bg-neutral-50/60 transition-colors">
                      <span className="text-[11px] text-neutral-500 shrink-0 mr-3">{label}</span>
                      {chip ? (
                        <span className="inline-flex items-center h-5 px-2.5 rounded-[4px] text-[10px] font-bold uppercase tracking-wide shrink-0"
                          style={{ backgroundColor: `${group.color}14`, color: group.color }}>
                          {value}
                        </span>
                      ) : (
                        <span className="font-mono text-[13px] font-semibold text-neutral-800">{value}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </Card>
          );
        })}
      </div>

    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — TRAINING ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function AnalysisSection({
  title, metric, color, data,
}: { title: string; metric: "loss" | "acc"; color: string; data: typeof EPOCH_DATA }) {
  const [models,    setModels]    = useState<string[]>(["Skin-Cancer-Exp-1-1"]);
  const [splits,    setSplits]    = useState<string[]>(["train", "val"]);
  const [epochRange,setEpochRange]= useState<number[]>([0, 50]);
  const [selMetric, setSelMetric] = useState(metric === "loss" ? "loss" : "acc@1");

  const trimmed = data.filter((d) => d.epoch >= epochRange[0] && d.epoch <= epochRange[1]);

  return (
    <Card className="overflow-hidden">
      <SectionHead title={title} />
      <div className="flex">
        {/* Filter sidebar */}
        <div className="w-64 flex-shrink-0 border-r border-neutral-100 p-4 flex flex-col gap-4 bg-neutral-50/30">
          <MultiChipSelect label="Select Models (Max 3)"
            values={models} onRemove={(v) => setModels(p => p.filter(x => x !== v))}
            options={["Skin-Cancer-Exp-1-1", "RegNet-Y-timm_1280"]}
            onAdd={(v) => models.length < 3 && setModels(p => [...p, v])}
            placeholder="Add models…" />
          <MultiChipSelect label="Select Split"
            values={splits} onRemove={(v) => setSplits(p => p.filter(x => x !== v))}
            options={["train", "val", "test"]} onAdd={(v) => setSplits(p => [...p, v])}
            placeholder="Select splits…" />
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Select Metric</Label>
            <Select value={selMetric} onValueChange={setSelMetric}>
              <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {["loss", "acc@1", "acc@5", "f1_score", "precision"].map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs text-neutral-600">Epoch Range</Label>
              <span className="text-[10px] font-mono text-neutral-400">{epochRange[0]}–{epochRange[1]}</span>
            </div>
            <Slider value={epochRange} onValueChange={setEpochRange} min={0} max={50} step={5}
              className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
          </div>
        </div>

        {/* Chart */}
        <div className="flex-1 p-5">
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={trimmed} margin={{ top: 8, right: 24, bottom: 24, left: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
              <XAxis dataKey="epoch" tick={{ fontSize: 10, fill: "#94A3B8" }}
                label={{ value: "Epoch", position: "insideBottom", offset: -14, fontSize: 10, fill: "#94A3B8" }} />
              <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }}
                domain={metric === "loss" ? ["auto", "auto"] : [0, 1]}
                tickFormatter={(v) => metric === "loss" ? v.toFixed(2) : v.toFixed(2)} />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="bg-white border border-neutral-200 rounded px-3 py-2 shadow text-[11px]">
                      <p className="font-semibold text-neutral-700 mb-1">Epoch {label}</p>
                      {payload.map((p) => (
                        <p key={p.dataKey} className="font-mono" style={{ color: p.color }}>
                          {p.name}: {Number(p.value).toFixed(4)}
                        </p>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
              {splits.includes("train") && (
                <Line dataKey={metric === "loss" ? "train_loss" : "train_acc"} name="train" stroke={color}
                  dot={false} strokeWidth={2} activeDot={{ r: 4 }} />
              )}
              {splits.includes("val") && (
                <Line dataKey={metric === "loss" ? "val_loss" : "val_acc"} name="val" stroke="#0284C7"
                  dot={false} strokeWidth={2} strokeDasharray="5 3" activeDot={{ r: 4 }} />
              )}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </Card>
  );
}

function TrainingAnalysisTab() {
  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC] min-w-0">
      <AnalysisSection title="Model Training Analysis for Loss"        metric="loss" color="#EF4444" data={EPOCH_DATA} />
      <AnalysisSection title="Model Training Analysis for Performance" metric="acc"  color={TEAL}    data={EPOCH_DATA} />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — MODEL TEST
// ═══════════════════════════════════════════════════════════════════════════════

function ModelTestTab() {
  const [uploadMode, setUploadMode] = useState<"upload" | "url">("upload");
  const [imageUrl,   setImageUrl]   = useState("");
  const [dragging,   setDragging]   = useState(false);
  const [predicted,  setPredicted]  = useState<null | { cls: string; confidence: number }>(null);
  const [loading,    setLoading]    = useState(false);

  const handlePredict = () => {
    setLoading(true);
    setTimeout(() => {
      setPredicted({ cls: "benign", confidence: 0.9231 });
      setLoading(false);
    }, 1800);
  };

  return (
    <div className="p-6 bg-[#F8FAFC] min-w-0">
      <Card className="overflow-hidden">
        <div className="px-5 py-4 border-b border-neutral-100 flex items-center justify-between">
          <button className="flex items-center gap-2 h-9 px-4 rounded-md bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#004e3d] transition-colors">
            Create Deployment <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Sub-tabs */}
        <div className="flex border-b border-neutral-100">
          {(["upload", "url"] as const).map((m) => (
            <button key={m} onClick={() => setUploadMode(m)}
              className={cn("px-5 py-3 text-[12px] font-semibold border-b-2 transition-colors",
                uploadMode === m ? "text-[#00775B] border-[#00775B]" : "text-neutral-500 border-transparent hover:text-neutral-700")}>
              {m === "upload" ? "Upload Image" : "Image URL"}
            </button>
          ))}
        </div>

        <div className="p-6 flex flex-col gap-5">
          {uploadMode === "upload" && (
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); }}
              className={cn("flex flex-col items-center justify-center gap-4 py-16 rounded-md border-2 border-dashed transition-colors cursor-pointer",
                dragging ? "border-[#00775B] bg-[#00775B]/5" : "border-neutral-300 bg-neutral-50 hover:border-[#00775B]/50 hover:bg-neutral-100/50")}>
              <div className="w-14 h-14 rounded-full bg-[#00775B] flex items-center justify-center shadow-lg">
                <CloudUpload className="w-7 h-7 text-white" />
              </div>
              <div className="text-center">
                <p className="text-[14px] font-semibold text-neutral-700">Drag &amp; Drop image here or Browse</p>
                <p className="text-[12px] text-neutral-400 mt-1">Supported formats: .jpeg, .png</p>
              </div>
            </div>
          )}

          {uploadMode === "url" && (
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-neutral-600">Image URL</Label>
              <Input value={imageUrl} onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg" className="h-10 text-sm" />
              <p className="text-[10px] text-neutral-400">Paste a direct URL to a publicly accessible image file</p>
            </div>
          )}

          <button onClick={handlePredict} disabled={loading}
            className={cn("w-full h-12 rounded-md text-[14px] font-bold text-white transition-all",
              loading ? "bg-[#004e3d]" : "bg-[#00775B] hover:bg-[#004e3d]")}>
            {loading ? <span className="flex items-center justify-center gap-2"><RefreshCw className="w-4 h-4 animate-spin" /> Running Inference…</span> : "Predict"}
          </button>

          {/* Prediction result */}
          {predicted && (
            <div className="flex items-start gap-4 p-5 rounded-md bg-[#E5FFF9] border border-[#00775B]/20">
              <div className="w-10 h-10 rounded-full bg-[#00775B] flex items-center justify-center flex-shrink-0">
                <CheckCircle className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#00775B]">Prediction Result</p>
                <div className="flex items-center gap-4 mt-2">
                  <div>
                    <p className="text-[10px] text-[#00775B]/70 uppercase tracking-wide">Class</p>
                    <p className="text-[20px] font-bold text-[#021d18] capitalize">{predicted.cls}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-[#00775B]/70 uppercase tracking-wide">Confidence</p>
                    <p className="text-[20px] font-bold text-[#021d18]">{(predicted.confidence * 100).toFixed(2)}%</p>
                  </div>
                  <div className="flex-1">
                    <div className="h-2 bg-[#00775B]/20 rounded-full overflow-hidden">
                      <div className="h-full bg-[#00775B] rounded-full" style={{ width: `${predicted.confidence * 100}%` }} />
                    </div>
                  </div>
                </div>
                <p className="text-[10px] text-[#00775B]/60 mt-2">Model: {MODEL.modelInfo.name} · Metric: {MODEL.metric}</p>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — EVALUATION
// ═══════════════════════════════════════════════════════════════════════════════

// AUC ≈ 0.924
const AUC = 0.924;

// Classification report data
const CLASS_REPORT = [
  { cls: "benign",    precision: 0.937, recall: 0.821, f1: 0.875, support: 329 },
  { cls: "malignant", precision: 0.840, recall: 0.945, f1: 0.889, support: 329 },
  { cls: "macro avg", precision: 0.888, recall: 0.883, f1: 0.882, support: 658, isAvg: true },
];

// Classification report row type for DataTable
type ClassReportRow = {
  id: string;
  cls: string;
  precision: number;
  recall: number;
  f1: number;
  support: number;
  isAvg?: boolean;
  // Per-threshold breakdown for expanded row
  thresholds: Array<{ threshold: number; precision: number; recall: number; f1: number }>;
};

const CLASS_REPORT_ROWS: ClassReportRow[] = [
  {
    id: "benign",    cls: "benign",    precision: 0.937, recall: 0.821, f1: 0.875, support: 329,
    thresholds: [
      { threshold: 0.3, precision: 0.891, recall: 0.964, f1: 0.926 },
      { threshold: 0.5, precision: 0.937, recall: 0.821, f1: 0.875 },
      { threshold: 0.7, precision: 0.961, recall: 0.733, f1: 0.832 },
      { threshold: 0.9, precision: 0.982, recall: 0.612, f1: 0.754 },
    ],
  },
  {
    id: "malignant", cls: "malignant", precision: 0.840, recall: 0.945, f1: 0.889, support: 329,
    thresholds: [
      { threshold: 0.3, precision: 0.795, recall: 0.982, f1: 0.879 },
      { threshold: 0.5, precision: 0.840, recall: 0.945, f1: 0.889 },
      { threshold: 0.7, precision: 0.897, recall: 0.903, f1: 0.900 },
      { threshold: 0.9, precision: 0.941, recall: 0.821, f1: 0.877 },
    ],
  },
  {
    id: "macro-avg", cls: "macro avg", precision: 0.888, recall: 0.883, f1: 0.882, support: 658, isAvg: true,
    thresholds: [
      { threshold: 0.3, precision: 0.843, recall: 0.973, f1: 0.903 },
      { threshold: 0.5, precision: 0.888, recall: 0.883, f1: 0.882 },
      { threshold: 0.7, precision: 0.929, recall: 0.818, f1: 0.866 },
      { threshold: 0.9, precision: 0.962, recall: 0.717, f1: 0.816 },
    ],
  },
];

type EvalResult = {
  id: string;
  dataset: string;
  version: string;
  splitTypes: string;
  accuracy: string;
  macroF1: string;
  aucRoc: string;
  updatedAt: string;
  status: "complete" | "running" | "failed";
};

const EVAL_RESULTS: EvalResult[] = [
  { id: "eval-001", dataset: "Skin Cancer Classification", version: "v1.0", splitTypes: "test, val", accuracy: "84.19%", macroF1: "0.882", aucRoc: "0.924", updatedAt: "Nov 10, 2024", status: "complete" },
  { id: "eval-002", dataset: "Skin Cancer Classification", version: "v0.9", splitTypes: "test",      accuracy: "81.4%",  macroF1: "0.861", aucRoc: "0.908", updatedAt: "Nov 02, 2024", status: "complete" },
];

const EVAL_COLUMNS: ColumnDef<EvalResult>[] = [
  {
    id: "dataset",
    header: "Dataset Name",
    accessorKey: "dataset",
    cell: ({ row }) => <span className="text-[12px] font-medium text-neutral-800">{row.dataset}</span>,
  },
  {
    id: "version",
    header: "Dataset Version",
    accessorKey: "version",
    cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.version}</span>,
  },
  {
    id: "splitTypes",
    header: "Split Types",
    accessorKey: "splitTypes",
    cell: ({ row }) => <span className="text-[11px] text-neutral-500">{row.splitTypes}</span>,
  },
  {
    id: "accuracy",
    header: "Accuracy",
    accessorKey: "accuracy",
    align: "right",
    cell: ({ row }) => <span className="font-mono font-semibold text-[11px] text-[#00775B]">{row.accuracy}</span>,
  },
  {
    id: "macroF1",
    header: "Macro F1",
    accessorKey: "macroF1",
    align: "right",
    cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-700">{row.macroF1}</span>,
  },
  {
    id: "aucRoc",
    header: "AUC-ROC",
    accessorKey: "aucRoc",
    align: "right",
    cell: ({ row }) => <span className="font-mono text-[11px] text-[#7C3AED]">{row.aucRoc}</span>,
  },
  {
    id: "updatedAt",
    header: "Last Updated",
    accessorKey: "updatedAt",
    align: "right",
    cell: ({ row }) => <span className="text-[11px] text-neutral-400">{row.updatedAt}</span>,
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => {
      const cfg = row.status === "complete"
        ? { label: "Complete", color: "#00775B", bg: "#E5FFF9" }
        : row.status === "running"
        ? { label: "Running",  color: "#0284C7", bg: "#EFF6FF" }
        : { label: "Failed",   color: "#DC2626", bg: "#FEF2F2" };
      return (
        <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}>
          {cfg.label}
        </span>
      );
    },
  },
];

function EvaluationTab() {
  const [compute,      setCompute]      = useState("auto");
  const [showForm,     setShowForm]     = useState(false);
  const [splitFilter,  setSplitFilter]  = useState(["test", "val"]);
  const [metricFilter, setMetricFilter] = useState("acc@1");
  const [labelFilter,  setLabelFilter]  = useState(["all"]);
  const [modelsFilter, setModelsFilter] = useState(["Skin-Cancer-Exp-1-1"]);
  const [classRange,   setClassRange]   = useState([0, 20]);
  const [viewMode,     setViewMode]     = useState<"grid" | "list">("grid");


  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC] min-w-0">

      {/* ── Create Evaluation form ── */}
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
          <h3 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">New Evaluation</h3>
          <button
            onClick={() => setShowForm(f => !f)}
            className="text-[11px] font-medium text-[#00775B] hover:underline">
            {showForm ? "Cancel" : "+ Create"}
          </button>
        </div>
        {showForm && (
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">Dataset</Label>
                <Select defaultValue="skin-cancer">
                  <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="skin-cancer">Skin Cancer Classification</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">Split Types</Label>
                <Select value={splitSel} onValueChange={setSplitSel}>
                  <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="test">Test Set</SelectItem>
                    <SelectItem value="val">Validation Set</SelectItem>
                    <SelectItem value="test,val">Test + Val</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">Compute</Label>
                <Select value={compute} onValueChange={setCompute}>
                  <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="auto">Automatically launch a new instance</SelectItem>
                    <SelectItem value="matrice">Matrice Cloud GPU</SelectItem>
                    <SelectItem value="aws">AWS p3.2xlarge</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={() => setShowForm(false)}
                className="h-8 px-4 rounded-md bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#005f48] transition-colors">
                Run Evaluation
              </button>
            </div>
          </div>
        )}
      </Card>

      {/* ── Evaluations table with inline expanded detail ── */}
      <DataTable<EvalResult>
        columns={EVAL_COLUMNS}
        data={EVAL_RESULTS}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        cardTitle="Evaluation Results"
        cardSubTitle={`${EVAL_RESULTS.length} evaluations`}
        expandable
        expansionMode="single"
        renderExpandedRow={(evalRow) => (
          <div className="bg-[#F8FAFC]">
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-white">
              <div>
                <h3 className="text-[13px] font-semibold text-neutral-800">Model Performance</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">{evalRow.dataset} · {evalRow.version} · {evalRow.splitTypes}</p>
              </div>
              <div className="flex items-center gap-1 bg-neutral-100 rounded-md p-0.5">
                <button onClick={() => setViewMode("grid")}
                  className={cn("p-1.5 rounded transition-colors", viewMode === "grid" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400")}>
                  <LayoutGrid className="w-3.5 h-3.5" />
                </button>
                <button onClick={() => setViewMode("list")}
                  className={cn("p-1.5 rounded transition-colors", viewMode === "list" ? "bg-white shadow-sm text-neutral-800" : "text-neutral-400")}>
                  <List className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex">
              {/* Filter sidebar */}
              <div className="w-56 flex-shrink-0 border-r border-neutral-100 p-4 flex flex-col gap-3 bg-neutral-50/30">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Filters</p>
                <MultiChipSelect label="Select Split Type"
                  values={splitFilter} onRemove={(v) => setSplitFilter(p => p.filter(x => x !== v))}
                  options={["train", "test", "val"]} onAdd={(v) => setSplitFilter(p => [...p, v])}
                  placeholder="Select splits…" />
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Select Metric</Label>
                  <Select value={metricFilter} onValueChange={setMetricFilter}>
                    <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["acc@1", "acc@5", "f1_score", "precision", "recall"].map((m) => (
                        <SelectItem key={m} value={m}>{m}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <MultiChipSelect label="Select Labels"
                  values={labelFilter} onRemove={(v) => setLabelFilter(p => p.filter(x => x !== v))}
                  options={["all", "benign", "malignant"]} onAdd={(v) => setLabelFilter(p => [...p, v])}
                  placeholder="Select labels…" />
                <MultiChipSelect label="Select Models (max 3)"
                  values={modelsFilter} onRemove={(v) => setModelsFilter(p => p.filter(x => x !== v))}
                  options={["Skin-Cancer-Exp-1-1", "RegNet-Y-timm_1280"]}
                  onAdd={(v) => modelsFilter.length < 3 && setModelsFilter(p => [...p, v])}
                  placeholder="Select models…" />
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs text-neutral-600">Number of Classes</Label>
                    <span className="text-[10px] font-mono text-neutral-400">{classRange[0]}–{classRange[1]}</span>
                  </div>
                  <Slider value={classRange} onValueChange={setClassRange} min={0} max={20} step={1}
                    className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
                </div>
                <button className="h-9 rounded-[4px] bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                  Apply Filters
                </button>
              </div>

              {/* Chart / Table area */}
              <div className="flex-1 p-5 flex flex-col gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  {[
                    { label: "Accuracy",  value: evalRow.accuracy, color: "#00775B" },
                    { label: "Macro F1",  value: evalRow.macroF1,  color: "#0284C7" },
                    { label: "AUC-ROC",   value: evalRow.aucRoc,   color: "#7C3AED" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="flex items-center gap-2 h-8 px-3 rounded-[4px] border border-neutral-200 bg-white">
                      <span className="text-[10px] text-neutral-400 uppercase tracking-wide">{label}</span>
                      <span className="font-mono font-bold text-[12px]" style={{ color }}>{value}</span>
                    </div>
                  ))}
                </div>
                {viewMode === "grid" ? (
                  <ResponsiveContainer width="100%" height={220}>
                    <BarChart data={PERF_DATA} layout="vertical" margin={{ top: 4, right: 32, bottom: 24, left: 56 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                      <XAxis type="number" domain={[0, 0.9]} tick={{ fontSize: 10, fill: "#94A3B8" }}
                        label={{ value: metricFilter, position: "insideBottom", offset: -14, fontSize: 10, fill: "#94A3B8" }} />
                      <YAxis type="category" dataKey="category" tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }} width={60} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div className="bg-white border border-neutral-200 rounded-[4px] px-3 py-2 shadow text-[11px]">
                            <p className="font-semibold text-neutral-800 capitalize mb-1">{label}</p>
                            {payload.map((p) => (
                              <p key={p.dataKey} className="font-mono" style={{ color: p.fill }}>
                                {String(p.dataKey)}: {Number(p.value).toFixed(4)}
                              </p>
                            ))}
                          </div>
                        );
                      }} />
                      <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                      <Bar dataKey="val"  name={`${MODEL.name.slice(0, 22)}… (val)`}  fill="#06B6D4" barSize={20} radius={[0, 2, 2, 0]} />
                      <Bar dataKey="test" name={`${MODEL.name.slice(0, 22)}… (test)`} fill={TEAL}     barSize={20} radius={[0, 2, 2, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <DataTable<{ id: number; category: string; val: number; test: number }>
                    columns={[
                      { id: "category", header: "Class", accessorKey: "category",
                        cell: ({ row }) => <span className="capitalize font-medium text-neutral-700 text-[12px]">{row.category}</span> },
                      { id: "val",  header: "Val Score",  accessorKey: "val",  align: "right",
                        cell: ({ row }) => (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-cyan-500" style={{ width: `${(row.val / 0.9) * 100}%` }} />
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-cyan-600">{row.val.toFixed(4)}</span>
                          </div>
                        ) },
                      { id: "test", header: "Test Score", accessorKey: "test", align: "right",
                        cell: ({ row }) => (
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-16 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                              <div className="h-full rounded-full bg-[#00775B]" style={{ width: `${(row.test / 0.9) * 100}%` }} />
                            </div>
                            <span className="font-mono text-[11px] font-semibold text-[#00775B]">{row.test.toFixed(4)}</span>
                          </div>
                        ) },
                    ]}
                    data={PERF_DATA.map((r, i) => ({ id: i, ...r }))}
                    rowIdKey="id"
                    pagination="none"
                    toolbar={false}
                  />
                )}
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6 — EXPORT
// ═══════════════════════════════════════════════════════════════════════════════

const EXPORT_FORMATS = [
  { id: "pytorch",     label: "PyTorch",     ext: ".pt",   desc: "Native format, best for further training",     icon: "🔥", color: "#EF4444" },
  { id: "onnx",        label: "ONNX",        ext: ".onnx", desc: "Cross-platform, works on most runtimes",       icon: "⚙️", color: "#0284C7" },
  { id: "tensorrt",    label: "TensorRT",    ext: ".engine",desc: "NVIDIA GPU optimised, best inference speed",  icon: "⚡", color: "#22C55E" },
  { id: "openvino",    label: "OpenVINO",    ext: ".xml",  desc: "Intel CPU, VPU and iGPU acceleration",         icon: "🔵", color: "#0EA5E9" },
  { id: "coreml",      label: "Core ML",     ext: ".mlmodel",desc: "Apple silicon and iPhone deployment",         icon: "🍎", color: "#6B7280" },
  { id: "tflite",      label: "TFLite",      ext: ".tflite",desc: "Mobile and embedded edge devices",            icon: "📱", color: "#F59E0B" },
];

const HARDWARE_TARGETS = ["NVIDIA GPU (V100)", "NVIDIA Jetson", "Intel CPU", "Apple M-Series", "Raspberry Pi", "Mobile (Android)", "Mobile (iOS)"];

const QUANT_OPTIONS = [
  { id: "none",  label: "None",        desc: "No quantization, full float32 precision" },
  { id: "fp16",  label: "FP16",        desc: "Half precision, ~2× speedup with minimal accuracy loss" },
  { id: "int8",  label: "INT8",        desc: "Integer quantization, ~4× smaller model, hardware specific" },
  { id: "dynamic",label: "Dynamic",    desc: "Runtime quantization, best compatibility" },
];

const PAST_EXPORTS = [
  { fmt: "ONNX",    hw: "NVIDIA GPU",    date: "2024-11-10", size: "83.2 MB", status: "ready"   },
  { fmt: "PyTorch", hw: "—",             date: "2024-11-10", size: "86.0 MB", status: "ready"   },
  { fmt: "TFLite",  hw: "Mobile",        date: "2024-11-09", size: "21.5 MB", status: "failed"  },
];

// Inference row type for DataTable
type InferenceRow = {
  id: string;
  name: string;
  status: "Exported" | "Failed" | "Running";
  baseModel: string;
  architecture: string;
  exportFormat: string;
  framework: string;
  lastUpdated: string;
};

const INFERENCE_ROWS: InferenceRow[] = [
  {
    id: "inf-001",
    name: "—",
    status: "Exported",
    baseModel: "Skin-Cancer-Classi...",
    architecture: "Skin-Cancer-Classi...",
    exportFormat: "ONNX",
    framework: "PyTorch",
    lastUpdated: "Nov 10, 2024 12:29",
  },
  {
    id: "inf-002",
    name: "—",
    status: "Exported",
    baseModel: "Skin-Cancer-Classi...",
    architecture: "Skin-Cancer-Classi...",
    exportFormat: "PyTorch",
    framework: "PyTorch",
    lastUpdated: "Nov 10, 2024 12:15",
  },
  {
    id: "inf-003",
    name: "—",
    status: "Failed",
    baseModel: "Skin-Cancer-Classi...",
    architecture: "Skin-Cancer-Classi...",
    exportFormat: "TFLite",
    framework: "PyTorch",
    lastUpdated: "Nov 9, 2024 18:42",
  },
];

function ExportTab() {
  const [modelName,  setModelName]  = useState("");
  const [format,     setFormat]     = useState("");
  const [compute,    setCompute]    = useState("auto");
  const [pruning,    setPruning]    = useState(false);
  const [exporting,  setExporting]  = useState(false);
  const [done,       setDone]       = useState(false);

  const handleExport = () => {
    setExporting(true);
    setDone(false);
    setTimeout(() => { setExporting(false); setDone(true); }, 2500);
  };

  const inferenceColumns: ColumnDef<InferenceRow>[] = [
    {
      id: "name",
      header: "Name",
      accessorKey: "name",
      cell: ({ row }) => <span className="text-neutral-600 font-mono text-[11px]">{row.name}</span>,
    },
    {
      id: "status",
      header: "Status",
      accessorKey: "status",
      cell: ({ row }) => (
        <span className={cn(
          "inline-flex items-center gap-1 h-5 px-2.5 rounded-full text-[10px] font-bold uppercase tracking-wide",
          row.status === "Exported" ? "bg-[#E5FFF9] text-[#00775B]"
            : row.status === "Failed" ? "bg-red-50 text-red-600"
            : "bg-blue-50 text-blue-600",
        )}>
          {row.status}
        </span>
      ),
    },
    {
      id: "baseModel",
      header: "Base Model",
      accessorKey: "baseModel",
      cell: ({ row }) => <span className="text-neutral-600 text-[12px] truncate max-w-[140px] block">{row.baseModel}</span>,
    },
    {
      id: "architecture",
      header: "Architecture",
      accessorKey: "architecture",
      cell: ({ row }) => <span className="text-neutral-600 text-[12px] truncate max-w-[140px] block">{row.architecture}</span>,
    },
    {
      id: "exportFormat",
      header: "Export Format",
      accessorKey: "exportFormat",
      cell: ({ row }) => (
        <span className="font-mono text-[11px] bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">{row.exportFormat}</span>
      ),
    },
    {
      id: "framework",
      header: "Training Framework",
      accessorKey: "framework",
      cell: ({ row }) => <span className="text-neutral-500 text-[12px]">{row.framework}</span>,
    },
    {
      id: "lastUpdated",
      header: "Last Updated",
      accessorKey: "lastUpdated",
      cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-400">{row.lastUpdated}</span>,
    },
  ];

  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC] min-w-0">

      {/* ── Export Model form ── */}
      <Card className="p-6 flex flex-col gap-5">
        <h3 className="text-[15px] font-semibold text-neutral-800">Export Model</h3>

        {/* Model name */}
        <FEInput
          label="Export Model Name"
          placeholder="e.g. resnet50-export-v1"
          value={modelName}
          onChange={(e) => setModelName(e.target.value)}
        />

        {/* Export format select */}
        <FESelect
          label="Export Format"
          placeholder="Select a format…"
          value={format || null}
          onChange={(v) => setFormat((v as string) ?? "")}
          options={EXPORT_FORMATS.map(({ id, label, ext }) => ({
            value: id,
            label: `${label} (${ext})`,
          }))}
          searchable={false}
        />

        {/* Compute select */}
        <FESelect
          label="Compute"
          placeholder="Select compute target…"
          value={compute}
          onChange={(v) => setCompute((v as string) ?? "auto")}
          options={[
            { value: "auto", label: "Automatically launch a new instance" },
            { value: "v100", label: "NVIDIA V100" },
            { value: "a100", label: "NVIDIA A100" },
            { value: "cpu",  label: "CPU only" },
          ]}
          searchable={false}
        />

        {/* Pruning toggle */}
        <div className="flex items-center justify-between py-1 border-t border-neutral-100">
          <div>
            <p className="text-[12px] font-semibold text-neutral-700">Apply Pruning</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">Removes ~30% of weights with minimal accuracy loss</p>
          </div>
          <Switch checked={pruning} onCheckedChange={setPruning} />
        </div>

        {/* Export button */}
        <div className="flex justify-end gap-3 pt-1">
          {done && (
            <button className="flex items-center gap-2 h-10 px-5 rounded-md border border-[#00775B] text-[#00775B] text-sm font-semibold hover:bg-[#00775B]/5 transition-colors">
              <Download className="w-4 h-4" /> Download
            </button>
          )}
          <button
            onClick={handleExport}
            disabled={exporting || !format}
            className={cn(
              "flex items-center gap-2 h-10 px-8 rounded-md text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
              done ? "bg-emerald-600" : "bg-[#00775B] hover:bg-[#006649]",
            )}>
            {exporting
              ? <><RefreshCw className="w-4 h-4 animate-spin" /> Exporting…</>
              : done
              ? <><CheckCircle className="w-4 h-4" /> Complete</>
              : "Export"}
          </button>
        </div>
      </Card>

      {/* ── Inferences DataTable ── */}
      <DataTable<InferenceRow>
        columns={inferenceColumns}
        data={INFERENCE_ROWS}
        rowIdKey="id"
        pagination="client"
        pageSize={10}
        toolbar={false}
        selectable
        selectionMode="multi"
        showRowCue={false}
        cardTitle="Inferences"
        cardSubTitle="Export runs for this model version"
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7 — LOGS
// ═══════════════════════════════════════════════════════════════════════════════

type LogStatus = "SUCCESS" | "FAILED" | "RUNNING" | "PENDING";
type LogRow = {
  id: number;
  lastUpdated: string;
  action: string;
  subAction: string;
  stepCode: string;
  status: LogStatus;
  statusDescription: string;
};

const LOG_STATUS_CONFIG: Record<LogStatus, { color: string; bg: string }> = {
  SUCCESS: { color: "#00775B", bg: "#E5FFF9" },
  FAILED:  { color: "#DC2626", bg: "#FEF2F2" },
  RUNNING: { color: "#0284C7", bg: "#EFF6FF" },
  PENDING: { color: "#64748B", bg: "#F1F5F9" },
};

const LOG_ROWS: LogRow[] = [
  { id: 1,  lastUpdated: "2024-11-10 14:30:01", action: "INIT",    subAction: "setup_env",      stepCode: "INIT_001", status: "SUCCESS", statusDescription: "Environment initialized successfully" },
  { id: 2,  lastUpdated: "2024-11-10 14:30:02", action: "DATA",    subAction: "load_dataset",   stepCode: "DATA_001", status: "SUCCESS", statusDescription: "Dataset loaded: 2639 train / 329 val / 329 test" },
  { id: 3,  lastUpdated: "2024-11-10 14:30:03", action: "MODEL",   subAction: "init_backbone",  stepCode: "MDL_001",  status: "SUCCESS", statusDescription: "EfficientNetV2-S initialized (21.5M params)" },
  { id: 4,  lastUpdated: "2024-11-10 14:30:05", action: "TRAIN",   subAction: "setup_optimizer",stepCode: "TRN_001",  status: "SUCCESS", statusDescription: "AdamW optimizer configured (lr=0.001)" },
  { id: 5,  lastUpdated: "2024-11-10 14:30:05", action: "TRAIN",   subAction: "setup_scheduler",stepCode: "TRN_002",  status: "SUCCESS", statusDescription: "StepLR scheduler set (step_size=10, gamma=0.1)" },
  { id: 6,  lastUpdated: "2024-11-10 14:30:10", action: "TRAIN",   subAction: "epoch",          stepCode: "TRN_003",  status: "SUCCESS", statusDescription: "Epoch 1/50 — train_loss=1.182, val_loss=1.347" },
  { id: 7,  lastUpdated: "2024-11-10 14:42:15", action: "TRAIN",   subAction: "epoch",          stepCode: "TRN_003",  status: "SUCCESS", statusDescription: "Epoch 10/50 — train_loss=0.612, val_loss=0.731" },
  { id: 8,  lastUpdated: "2024-11-10 14:55:20", action: "TRAIN",   subAction: "epoch",          stepCode: "TRN_003",  status: "SUCCESS", statusDescription: "Epoch 20/50 — train_loss=0.341, val_loss=0.489" },
  { id: 9,  lastUpdated: "2024-11-10 15:08:30", action: "TRAIN",   subAction: "checkpoint",     stepCode: "TRN_004",  status: "SUCCESS", statusDescription: "Checkpoint saved at epoch 25 (val_acc=0.831)" },
  { id: 10, lastUpdated: "2024-11-10 15:22:45", action: "TRAIN",   subAction: "epoch",          stepCode: "TRN_003",  status: "SUCCESS", statusDescription: "Epoch 40/50 — train_loss=0.198, val_loss=0.312" },
  { id: 11, lastUpdated: "2024-11-10 15:38:10", action: "TRAIN",   subAction: "augmentation",   stepCode: "TRN_005",  status: "FAILED",  statusDescription: "MixUp augmentation skipped — batch size too small" },
  { id: 12, lastUpdated: "2024-11-10 15:51:48", action: "TRAIN",   subAction: "epoch",          stepCode: "TRN_003",  status: "SUCCESS", statusDescription: "Epoch 50/50 — train_loss=0.162, val_loss=0.289" },
  { id: 13, lastUpdated: "2024-11-10 16:01:05", action: "EVAL",    subAction: "run_inference",  stepCode: "EVL_001",  status: "SUCCESS", statusDescription: "Inference complete on test split (329 samples)" },
  { id: 14, lastUpdated: "2024-11-10 16:02:10", action: "EVAL",    subAction: "compute_metrics",stepCode: "EVL_002",  status: "SUCCESS", statusDescription: "Accuracy=84.19%, Macro F1=0.882, AUC=0.924" },
  { id: 15, lastUpdated: "2024-11-10 16:03:00", action: "EXPORT",  subAction: "save_weights",   stepCode: "EXP_001",  status: "SUCCESS", statusDescription: "Model weights saved to /artifacts/model_best.pt" },
  { id: 16, lastUpdated: "2024-11-10 16:03:45", action: "EXPORT",  subAction: "convert_onnx",   stepCode: "EXP_002",  status: "RUNNING", statusDescription: "Converting to ONNX format…" },
  { id: 17, lastUpdated: "2024-11-10 16:04:00", action: "NOTIFY",  subAction: "send_webhook",   stepCode: "NTF_001",  status: "PENDING", statusDescription: "Waiting for ONNX conversion to complete" },
  { id: 18, lastUpdated: "2024-11-10 16:04:00", action: "CLEANUP", subAction: "free_resources", stepCode: "CLN_001",  status: "PENDING", statusDescription: "Pending post-export cleanup" },
];

const LOG_COLUMNS: ColumnDef<LogRow>[] = [
  {
    accessorKey: "lastUpdated",
    header: "Last Updated",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-neutral-500">{row.lastUpdated}</span>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] font-semibold text-neutral-700">{row.action}</span>
    ),
  },
  {
    accessorKey: "subAction",
    header: "Sub-Action",
    cell: ({ row }) => (
      <span className="font-mono text-[11px] text-neutral-500">{row.subAction}</span>
    ),
  },
  {
    accessorKey: "stepCode",
    header: "Step Code",
    cell: ({ row }) => (
      <span className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded text-neutral-600">{row.stepCode}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const cfg = LOG_STATUS_CONFIG[row.status];
      return (
        <span className="inline-flex items-center h-5 px-2 rounded text-[10px] font-bold"
          style={{ color: cfg.color, backgroundColor: cfg.bg }}>
          {row.status}
        </span>
      );
    },
  },
  {
    accessorKey: "statusDescription",
    header: "Status Description",
    cell: ({ row }) => (
      <span className="text-[11px] text-neutral-600">{row.statusDescription}</span>
    ),
  },
];

function LogsTab() {
  return (
    <div className="p-6 bg-[#F8FAFC]">
      <DataTable<LogRow>
        columns={LOG_COLUMNS}
        data={LOG_ROWS}
        rowIdKey="id"
        pagination="none"
        toolbar={false}
        expandable
        expansionMode="single"
        renderExpandedRow={(row) => {
          const cfg = LOG_STATUS_CONFIG[row.status];
          return (
            <div className="px-6 py-4 bg-[#F8FAFC] flex flex-col gap-3">
              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: "Last Updated", value: row.lastUpdated },
                  { label: "Action",       value: row.action },
                  { label: "Sub-Action",   value: row.subAction },
                  { label: "Step Code",    value: row.stepCode },
                  { label: "Status",       value: row.status, colored: true },
                ].map(({ label, value, colored }) => (
                  <div key={label} className="flex flex-col gap-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{label}</span>
                    {colored ? (
                      <span className="inline-flex items-center h-5 w-fit px-2 rounded text-[10px] font-bold"
                        style={{ color: cfg.color, backgroundColor: cfg.bg }}>{value}</span>
                    ) : (
                      <span className="font-mono text-[12px] text-neutral-700">{value}</span>
                    )}
                  </div>
                ))}
              </div>
              <div className="flex flex-col gap-1 pt-2 border-t border-neutral-200">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Status Description</span>
                <span className="text-[12px] text-neutral-700">{row.statusDescription}</span>
              </div>
            </div>
          );
        }}
      />
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — ModelDetail
// ═══════════════════════════════════════════════════════════════════════════════

interface ModelDetailProps {
  job: TrainingJob;
  onBack: () => void;
}

export function ModelDetail({ job, onBack }: ModelDetailProps) {
  const [activeTab, setActiveTab] = useState<MTab>("summary");

  return (
    <div className="flex flex-col h-full min-w-0">

      {/* Breadcrumb + tab bar */}
      <div className="bg-white border-b border-neutral-200">
        {/* Back + name */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-neutral-100">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-[#00775B] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Training</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-[12px] font-semibold text-neutral-800 truncate max-w-xs">{MODEL.name}</span>
          <span className="font-mono text-[10px] bg-neutral-100 text-neutral-500 h-5 px-2 rounded inline-flex items-center ml-1 flex-shrink-0">
            {job.id}
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex items-center overflow-x-auto px-2">
          {MTABS.map(({ id, label }) => (
            <button key={id} onClick={() => setActiveTab(id)}
              className={cn("relative flex-shrink-0 px-4 py-3 text-[12px] font-semibold transition-colors whitespace-nowrap",
                activeTab === id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
              {label}
              {activeTab === id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Context bar */}
      <ModelHeaderBar />

      {/* Content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {activeTab === "summary"     && <SummaryTab />}
        {activeTab === "hyperparams" && <HyperparametersTab />}
        {activeTab === "analysis"    && <TrainingAnalysisTab />}
        {activeTab === "model-test"  && <ModelTestTab />}
        {activeTab === "evaluation"  && <EvaluationTab />}
        {activeTab === "export"      && <ExportTab />}
        {activeTab === "logs"        && <LogsTab />}
      </div>
    </div>
  );
}
