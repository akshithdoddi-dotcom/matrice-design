import { useState } from "react";
import {
  RefreshCw, Pencil, Trash2, X, Plus, Check, ChevronRight,
  Upload, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { V23Table, V23Mono, V23Inter } from "@fe-common/components/ui/V23Table";
import { Label } from "@fe-common/components/ui/label";
import { Input } from "@fe-common/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe-common/components/ui/select";
import { Textarea } from "@fe-common/components/ui/textarea";
import { Switch } from "@fe-common/components/ui/switch";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Shared style tokens ─────────────────────────────────────────────────────

const HDR: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif",
  textTransform: "uppercase", letterSpacing: "0.05em", color: "#1E293B",
};
const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11, fontWeight: 500, color: "#64748B",
};
const INTER: React.CSSProperties = { fontFamily: "Inter, sans-serif", fontSize: 12, color: "#334155" };

// Sub-table grid
const SUB_GRID = "minmax(130px,2fr) minmax(160px,2fr) 90px 110px 90px 90px 90px 90px";

// ─── Types ────────────────────────────────────────────────────────────────────

type MFStatus  = "approved" | "in-review" | "rejected" | "draft";
type JobStatus = "complete" | "pending" | "failed" | null;

type SubModel = {
  id: string; name: string; key: string;
  performance: number | null; paramsM: number | null;
  training: JobStatus; exporting: JobStatus; evaluation: JobStatus; deployment: JobStatus;
};

type ModelFamily = {
  id: string; name: string; status: MFStatus;
  input: string; output: string; trainingFramework: string;
  inputFormat: string; sdkVersion: string; modelCount: number;
  releaseYear: number; isPrivate: boolean; user: string; account: string;
  createdAt: string; lastUpdated: string; models: SubModel[];
};

// ─── Stat cards ───────────────────────────────────────────────────────────────

const STATS: StatCardData[] = [
  { label: "Total Model Families", value: "85",  sublabel: "All Registered",   num: "+5", ref_: "vs Last Quarter", dir: "up",     chip: "ALL TIME", color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Approved",             value: "67",  sublabel: "Published & Live",  num: "+3", ref_: "vs Last Month",   dir: "up",     chip: "APPROVED", color: TEAL,      bgColor: "#E5FFF9" },
  { label: "In Review",            value: "12",  sublabel: "Pending Approval",  num: "+2", ref_: "vs Last Week",    dir: "up",     chip: "REVIEW",   color: "#D97706", bgColor: "#FFFBEB" },
  { label: "Private Models",       value: "8",   sublabel: "Restricted Access", num: "+1", ref_: "vs Last Month",   dir: "up",     chip: "PRIVATE",  color: "#7C3AED", bgColor: "#F3EEFF" },
];

// ─── Chart data ───────────────────────────────────────────────────────────────

const PARAM_DATA = [
  { name: "< 5M",     count: 8,  color: "#FDBA74" },
  { name: "5M–50M",   count: 42, color: "#F87171" },
  { name: "50M–100M", count: 15, color: "#FDE047" },
  { name: "100M–1B",  count: 14, color: "#FB923C" },
  { name: "> 1B",     count: 6,  color: "#2DD4BF" },
];

const RUNTIME_DATA = [
  { name: "PyTorch",     count: 62, color: "#EF4444" },
  { name: "ONNX",        count: 77, color: "#6B7280" },
  { name: "OpenVINO",    count: 68, color: "#8B5CF6" },
  { name: "TensorFlow",  count: 10, color: "#F59E0B" },
  { name: "TensorRT",    count: 64, color: "#22C55E" },
  { name: "TorchScript", count: 45, color: "#FDA4AF" },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

const MOCK_FAMILIES: ModelFamily[] = [
  {
    id: "mf-01", name: "MiVOLO", status: "approved",
    input: "image", output: "detection", trainingFramework: "PyTorch",
    inputFormat: "YOLO", sdkVersion: "—", modelCount: 1, releaseYear: 2026,
    isPrivate: false, user: "Teja Tanush", account: "9782886767…",
    createdAt: "Jan 19, 2026", lastUpdated: "Jan 20, 2026",
    models: [{ id: "m-01", name: "volo_d1", key: "model_imdb_age_g…", performance: 50.00, paramsM: 25.86, training: null, exporting: null, evaluation: null, deployment: null }],
  },
  {
    id: "mf-02", name: "JointBDOE", status: "approved",
    input: "image", output: "detection", trainingFramework: "PyTorch",
    inputFormat: "YOLO", sdkVersion: "—", modelCount: 1, releaseYear: 2025,
    isPrivate: false, user: "Sajjad Chaus", account: "9782886767…",
    createdAt: "Dec 30, 2025", lastUpdated: "Dec 31, 2025",
    models: [{ id: "m-02", name: "joint_bdoe_base", key: "joint_bdoe_v1_coco…", performance: 67.20, paramsM: 41.3, training: "complete", exporting: null, evaluation: "complete", deployment: null }],
  },
  {
    id: "mf-03", name: "DeepFace_RetinaNet", status: "approved",
    input: "video", output: "detection", trainingFramework: "PyTorch",
    inputFormat: "MSCOCO_v", sdkVersion: "—", modelCount: 1, releaseYear: 2025,
    isPrivate: false, user: "Mohned M.", account: "9782886767…",
    createdAt: "Sep 1, 2025", lastUpdated: "Sep 1, 2025",
    models: [{ id: "m-03", name: "deepface_retina_v2", key: "deepface_retina_wide…", performance: 73.40, paramsM: 32.0, training: null, exporting: "complete", evaluation: null, deployment: "pending" }],
  },
  {
    id: "mf-04", name: "BotSort", status: "approved",
    input: "video", output: "object_tracking", trainingFramework: "PyTorch",
    inputFormat: "MOT", sdkVersion: "—", modelCount: 1, releaseYear: 2025,
    isPrivate: false, user: "Mohned M.", account: "9782886767…",
    createdAt: "Jul 15, 2025", lastUpdated: "Jul 17, 2025",
    models: [{ id: "m-04", name: "botsort_v3", key: "botsort_mot17_dance…", performance: 61.80, paramsM: 18.5, training: "complete", exporting: "complete", evaluation: "complete", deployment: "complete" }],
  },
  {
    id: "mf-05", name: "YOLOv11-VideoInstSeg", status: "in-review",
    input: "video", output: "instance_segmentation", trainingFramework: "PyTorch",
    inputFormat: "DAVIS", sdkVersion: "—", modelCount: 5, releaseYear: 2025,
    isPrivate: false, user: "—", account: "9782886767…",
    createdAt: "Jun 3, 2025", lastUpdated: "Jun 30, 2025",
    models: [
      { id: "m-05a", name: "yolov11n-seg", key: "yolov11n_seg_davis17…", performance: 48.2, paramsM: 2.9,  training: "complete", exporting: "pending", evaluation: "pending", deployment: null },
      { id: "m-05b", name: "yolov11s-seg", key: "yolov11s_seg_davis17…", performance: 53.8, paramsM: 10.1, training: "complete", exporting: "pending", evaluation: "pending", deployment: null },
    ],
  },
  {
    id: "mf-06", name: "R2PLUS1D", status: "approved",
    input: "video", output: "activity_recognition", trainingFramework: "PyTorch",
    inputFormat: "Kinetics", sdkVersion: "—", modelCount: 1, releaseYear: 2018,
    isPrivate: false, user: "Mohned M.", account: "9782886767…",
    createdAt: "Mar 25, 2025", lastUpdated: "Jun 5, 2025",
    models: [{ id: "m-06", name: "r2plus1d_18", key: "r2plus1d_kinetics400…", performance: 72.10, paramsM: 31.5, training: "complete", exporting: "complete", evaluation: "complete", deployment: "complete" }],
  },
  {
    id: "mf-07", name: "FRCNN", status: "approved",
    input: "video", output: "detection", trainingFramework: "PyTorch",
    inputFormat: "mscoco_vid", sdkVersion: "—", modelCount: 1, releaseYear: 2025,
    isPrivate: false, user: "—", account: "9782886767…",
    createdAt: "Apr 1, 2025", lastUpdated: "Jun 5, 2025",
    models: [{ id: "m-07", name: "frcnn_resnet50", key: "frcnn_r50_coco_vid…", performance: 64.30, paramsM: 41.8, training: "complete", exporting: null, evaluation: "complete", deployment: null }],
  },
  {
    id: "mf-08", name: "KeypointRCNN", status: "approved",
    input: "video", output: "pose_estimation", trainingFramework: "PyTorch",
    inputFormat: "COCO", sdkVersion: "—", modelCount: 1, releaseYear: 2018,
    isPrivate: false, user: "Mohned M.", account: "9782886767…",
    createdAt: "Mar 25, 2025", lastUpdated: "Mar 25, 2025",
    models: [{ id: "m-08", name: "keypointrcnn_r50", key: "kprcnn_r50_coco_kp…", performance: 65.00, paramsM: 59.1, training: "complete", exporting: "complete", evaluation: "complete", deployment: "pending" }],
  },
  {
    id: "mf-09", name: "EfficientDet-D7", status: "in-review",
    input: "image", output: "detection", trainingFramework: "TensorFlow",
    inputFormat: "COCO", sdkVersion: "2.1.0", modelCount: 3, releaseYear: 2025,
    isPrivate: true, user: "Ankit Verma", account: "8821093456…",
    createdAt: "Feb 10, 2026", lastUpdated: "Feb 15, 2026",
    models: [{ id: "m-09", name: "efficientdet_d7", key: "effdet_d7_coco_val…", performance: 80.0, paramsM: 52.0, training: "complete", exporting: "pending", evaluation: null, deployment: null }],
  },
  {
    id: "mf-10", name: "SAM-2-Video", status: "draft",
    input: "video", output: "segmentation", trainingFramework: "PyTorch",
    inputFormat: "SA-1B", sdkVersion: "—", modelCount: 2, releaseYear: 2026,
    isPrivate: true, user: "Li Wei", account: "7712043821…",
    createdAt: "Apr 20, 2026", lastUpdated: "May 2, 2026",
    models: [{ id: "m-10", name: "sam2_hiera_tiny", key: "sam2_hiera_t_sa1b…", performance: null, paramsM: 38.9, training: "pending", exporting: null, evaluation: null, deployment: null }],
  },
  {
    id: "mf-11", name: "RT-DETR-v2", status: "rejected",
    input: "image", output: "detection", trainingFramework: "PyTorch",
    inputFormat: "COCO", sdkVersion: "—", modelCount: 2, releaseYear: 2025,
    isPrivate: false, user: "Carlos Ruiz", account: "6612038854…",
    createdAt: "Jan 5, 2026", lastUpdated: "Jan 22, 2026",
    models: [
      { id: "m-11a", name: "rtdetr_r50vd", key: "rtdetr_r50vd_coco…", performance: 53.1, paramsM: 42.0, training: "complete", exporting: "failed", evaluation: null, deployment: null },
      { id: "m-11b", name: "rtdetr_r101vd", key: "rtdetr_r101vd_coco…", performance: 54.3, paramsM: 76.0, training: "complete", exporting: "failed", evaluation: null, deployment: null },
    ],
  },
];

const STATUS_MAP: Record<MFStatus, string> = {
  "approved": "active", "in-review": "queued", "rejected": "failed", "draft": "draft",
};
const STATUS_LABEL: Record<MFStatus, string> = {
  "approved": "Approved", "in-review": "In Review", "rejected": "Rejected", "draft": "Draft",
};

// ─── Primitives ───────────────────────────────────────────────────────────────

const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const JobCell = ({ status }: { status: JobStatus }) => {
  if (!status) return <span style={{ ...MONO, color: "#CBD5E1" }}>—</span>;
  return <StatusCapsule status={status} />;
};

const ToggleSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    style={{
      width: 34, height: 18, borderRadius: 9, border: "none", cursor: "pointer",
      backgroundColor: checked ? TEAL : "#CBD5E1",
      position: "relative", transition: "background-color 150ms ease",
      padding: 0, flexShrink: 0,
    }}
  >
    <span style={{
      position: "absolute", top: 2, left: checked ? 16 : 2, width: 14, height: 14,
      borderRadius: "50%", backgroundColor: "#fff",
      transition: "left 150ms ease", display: "block",
      boxShadow: "0 1px 2px rgba(0,0,0,0.15)",
    }} />
  </button>
);

// ─── Add Model Family Modal ────────────────────────────────────────────────────

type WizardStep = 1 | 2 | 3;

const MODEL_INPUT_OPTIONS = ["image", "video"];
const MODEL_OUTPUT_OPTIONS = ["detection", "object_tracking", "instance_segmentation", "activity_recognition", "pose_estimation", "segmentation"];
const MODEL_TYPE_OPTIONS = ["Standard", "Ensemble", "Fine-tuned"];
const FRAMEWORK_OPTIONS = ["PyTorch", "TensorFlow", "ONNX", "OpenVINO", "TensorRT", "TorchScript"];
const EXPORT_FORMAT_OPTIONS = ["PyTorch", "ONNX", "OpenVINO", "TensorFlow", "TensorRT", "TorchScript"];

type KV = { key: string; value: string };
type NewModel = { name: string; key: string; paramsM: string };
type NewBenchmark = { id: string; dataset: string; splitType: string; metric: string; values: KV[] };

interface NewModelFamilyForm {
  name: string; input: string; output: string; description: string; references: string;
  modelType: string; releaseYear: number; isPrivate: boolean;
  models: NewModel[];
  trainingFramework: string; exportFormats: string[]; supportedMetrics: string[];
  inputFormat: string; inputSizes: KV[]; benchmarks: NewBenchmark[];
}

const emptyModelFamilyForm = (): NewModelFamilyForm => ({
  name: "", input: "", output: "", description: "", references: "",
  modelType: "Standard", releaseYear: new Date().getFullYear(), isPrivate: false,
  models: [{ name: "", key: "", paramsM: "" }],
  trainingFramework: "", exportFormats: [], supportedMetrics: [],
  inputFormat: "", inputSizes: [{ key: "", value: "" }],
  benchmarks: [],
});

function ChipMultiSelect({ options, selected, onChange, placeholder }: {
  options: string[]; selected: string[]; onChange: (v: string[]) => void; placeholder?: string;
}) {
  const [open, setOpen] = useState(false);
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter((s) => s !== v) : [...selected, v]);
  return (
    <div className="relative">
      <div
        className="border border-neutral-200 rounded-[4px] px-2 py-2 min-h-[42px] flex flex-wrap gap-1.5 items-center cursor-pointer"
        onClick={() => setOpen((o) => !o)}
      >
        {selected.length === 0 && <span className="text-[12px] text-neutral-400 px-1">{placeholder ?? "Select…"}</span>}
        {selected.map((s) => (
          <span key={s} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-[4px]" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
            {s}
            <button type="button" onClick={(e) => { e.stopPropagation(); toggle(s); }} className="hover:opacity-70">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute top-full left-0 mt-1 z-20 bg-white border border-neutral-200 rounded-[4px] shadow-lg p-2 flex flex-col gap-0.5 w-full max-h-52 overflow-y-auto">
            {options.map((opt) => (
              <label key={opt} className="flex items-center gap-2 text-[12px] text-neutral-700 px-2 py-1.5 hover:bg-neutral-50 rounded cursor-pointer">
                <input type="checkbox" checked={selected.includes(opt)} onChange={() => toggle(opt)} />
                {opt}
              </label>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function TagInput({ values, onChange, placeholder }: { values: string[]; onChange: (v: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const addTag = () => {
    const v = draft.trim();
    if (v && !values.includes(v)) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className="border border-neutral-200 rounded-[4px] px-2 py-2 min-h-[42px] flex flex-wrap gap-1.5 items-center">
      {values.map((v) => (
        <span key={v} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-[4px]" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
          {v}
          <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className="hover:opacity-70">
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addTag(); } }}
        onBlur={addTag}
        placeholder={values.length === 0 ? placeholder : ""}
        className="flex-1 min-w-[80px] text-[12px] outline-none bg-transparent"
      />
    </div>
  );
}

function WizardStepSection({ index, title, summary, isOpen, isDone, onOpen, children }: {
  index: number; title: string; summary?: string; isOpen: boolean; isDone: boolean; onOpen: () => void; children: React.ReactNode;
}) {
  return (
    <div className="border border-neutral-200 rounded-[4px] overflow-hidden bg-white">
      <div
        className={cn("flex items-center justify-between px-4 py-3", !isOpen && "cursor-pointer hover:bg-neutral-50")}
        style={{ backgroundColor: isOpen ? "#F8FAFC" : "#fff" }}
        onClick={() => { if (!isOpen) onOpen(); }}
      >
        <div className="flex items-center gap-3">
          <span
            className="w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
            style={isDone ? { backgroundColor: TEAL, color: "#fff" } : isOpen ? { border: `2px solid ${TEAL}`, color: TEAL } : { border: "1px solid #D1D5DB", color: "#9CA3AF" }}
          >
            {isDone ? <Check className="w-3.5 h-3.5" /> : index}
          </span>
          <span className={cn("text-[13px] font-semibold", isOpen || isDone ? "text-neutral-800" : "text-neutral-400")}>{title}</span>
        </div>
        {isDone && !isOpen && (
          <button onClick={(e) => { e.stopPropagation(); onOpen(); }} className="h-7 px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
            Edit
          </button>
        )}
      </div>
      {isDone && !isOpen && summary && (
        <div className="px-4 pb-3 -mt-1">
          <p className="text-[12px] text-neutral-500">{summary}</p>
        </div>
      )}
      {isOpen && <div className="px-4 pb-4 pt-3 border-t border-neutral-100 flex flex-col gap-4">{children}</div>}
    </div>
  );
}

function AddModelFamilyModal({ onClose, onCreate }: { onClose: () => void; onCreate: (family: ModelFamily) => void }) {
  const [openStep, setOpenStep] = useState<WizardStep>(1);
  const [doneSteps, setDoneSteps] = useState<Set<WizardStep>>(new Set());
  const [form, setForm] = useState<NewModelFamilyForm>(emptyModelFamilyForm);
  const [openBenchmarkId, setOpenBenchmarkId] = useState<string | null>(null);

  const completeStep = (s: WizardStep, next: WizardStep) => {
    setDoneSteps((p) => new Set(p).add(s));
    setOpenStep(next);
  };

  const updateModel = (idx: number, patch: Partial<NewModel>) =>
    setForm((f) => ({ ...f, models: f.models.map((m, i) => (i === idx ? { ...m, ...patch } : m)) }));
  const addModel = () => setForm((f) => ({ ...f, models: [...f.models, { name: "", key: "", paramsM: "" }] }));

  const updateInputSize = (idx: number, patch: Partial<KV>) =>
    setForm((f) => ({ ...f, inputSizes: f.inputSizes.map((s, i) => (i === idx ? { ...s, ...patch } : s)) }));
  const addInputSize = () => setForm((f) => ({ ...f, inputSizes: [...f.inputSizes, { key: "", value: "" }] }));

  const addBenchmark = () => {
    const id = `bm-${form.benchmarks.length + 1}`;
    setForm((f) => ({ ...f, benchmarks: [...f.benchmarks, { id, dataset: "", splitType: "", metric: "", values: [{ key: "", value: "" }] }] }));
    setOpenBenchmarkId(id);
  };
  const removeBenchmark = (id: string) => setForm((f) => ({ ...f, benchmarks: f.benchmarks.filter((b) => b.id !== id) }));
  const updateBenchmark = (id: string, patch: Partial<NewBenchmark>) =>
    setForm((f) => ({ ...f, benchmarks: f.benchmarks.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
  const updateBenchmarkValue = (bmId: string, idx: number, patch: Partial<KV>) =>
    setForm((f) => ({ ...f, benchmarks: f.benchmarks.map((b) => (b.id === bmId ? { ...b, values: b.values.map((v, i) => (i === idx ? { ...v, ...patch } : v)) } : b)) }));
  const addBenchmarkValue = (bmId: string) =>
    setForm((f) => ({ ...f, benchmarks: f.benchmarks.map((b) => (b.id === bmId ? { ...b, values: [...b.values, { key: "", value: "" }] } : b)) }));

  const handleCreate = () => {
    const cleanModels = form.models.filter((m) => m.name.trim());
    const family: ModelFamily = {
      id: `mf-${Math.floor(Math.random() * 90000 + 10000)}`,
      name: form.name || "Untitled Family",
      status: "draft",
      input: form.input || "image",
      output: form.output || "detection",
      trainingFramework: form.trainingFramework || "PyTorch",
      inputFormat: form.inputFormat || "—",
      sdkVersion: "—",
      modelCount: cleanModels.length || form.models.length,
      releaseYear: form.releaseYear,
      isPrivate: form.isPrivate,
      user: "You",
      account: "current-account",
      createdAt: "Just now",
      lastUpdated: "Just now",
      models: cleanModels.map((m, i) => ({
        id: `${form.name || "family"}-model-${i + 1}`,
        name: m.name, key: m.key || "—",
        performance: null, paramsM: m.paramsM ? Number(m.paramsM) : null,
        training: null, exporting: null, evaluation: null, deployment: null,
      })),
    };
    onCreate(family);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-3xl mx-4 flex flex-col max-h-[90vh]">
        {/* Top bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100 flex-shrink-0">
          <h2 className="text-[15px] font-bold text-neutral-900">Add Model Family</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-3 p-6 overflow-y-auto flex-1 min-h-0">
          <WizardStepSection index={1} title="General Info" summary={form.name || "—"} isOpen={openStep === 1} isDone={doneSteps.has(1)} onOpen={() => setOpenStep(1)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Model Family Name</Label>
                <Input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value.replace(/\s+/g, "") }))} placeholder="Enter model family name (no spaces)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Model Input</Label>
                <Select value={form.input} onValueChange={(v) => setForm((f) => ({ ...f, input: v }))}>
                  <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select input type" /></SelectTrigger>
                  <SelectContent>{MODEL_INPUT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Model Output</Label>
                <Select value={form.output} onValueChange={(v) => setForm((f) => ({ ...f, output: v }))}>
                  <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select output type" /></SelectTrigger>
                  <SelectContent>{MODEL_OUTPUT_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Description</Label>
                <Textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} placeholder="Describe this model family" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>References</Label>
                <Input value={form.references} onChange={(e) => setForm((f) => ({ ...f, references: e.target.value }))} placeholder="Link to papers or resources (optional)" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Model Type</Label>
                <Select value={form.modelType} onValueChange={(v) => setForm((f) => ({ ...f, modelType: v }))}>
                  <SelectTrigger className="h-10 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>{MODEL_TYPE_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Release Year</Label>
                <Input type="number" value={form.releaseYear} onChange={(e) => setForm((f) => ({ ...f, releaseYear: Number(e.target.value) }))} />
              </div>
              <div className="flex items-center justify-between border border-neutral-200 rounded-[4px] px-3 py-2.5">
                <div>
                  <p className="text-[12px] font-semibold text-neutral-700">Keep private</p>
                  <p className="text-[11px] text-neutral-400">Only your account can see this model family</p>
                </div>
                <Switch checked={form.isPrivate} onCheckedChange={(v) => setForm((f) => ({ ...f, isPrivate: v }))} />
              </div>
            </div>
            <div className="flex justify-end">
              <button onClick={() => completeStep(1, 2)} className="h-9 px-6 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px]" style={{ backgroundColor: TEAL }}>
                Continue
              </button>
            </div>
          </WizardStepSection>

          <WizardStepSection
            index={2} title="Add Models" isOpen={openStep === 2} isDone={doneSteps.has(2)} onOpen={() => setOpenStep(2)}
            summary={`${form.models.filter((m) => m.name.trim()).length || form.models.length} model(s)`}
          >
            <div className="flex flex-col gap-4">
              {form.models.map((m, i) => (
                <div key={i} className="border border-neutral-100 rounded-[4px] p-3 flex flex-col gap-3">
                  <p className="text-[12px] font-semibold text-neutral-700">Model {i + 1}</p>
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-1.5">
                      <Label>Model Name</Label>
                      <Input value={m.name} onChange={(e) => updateModel(i, { name: e.target.value })} />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Model Key</Label>
                      <Input value={m.key} onChange={(e) => updateModel(i, { key: e.target.value })} placeholder="e.g. resnet-18" />
                    </div>
                    <div className="flex flex-col gap-1.5">
                      <Label>Params (millions)</Label>
                      <Input type="number" value={m.paramsM} onChange={(e) => updateModel(i, { paramsM: e.target.value })} />
                    </div>
                  </div>
                </div>
              ))}
              <button onClick={addModel} className="self-start h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Another
              </button>
            </div>
            <div className="flex justify-end">
              <button onClick={() => completeStep(2, 3)} className="h-9 px-6 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px]" style={{ backgroundColor: TEAL }}>
                Continue
              </button>
            </div>
          </WizardStepSection>

          <WizardStepSection index={3} title="Model Settings" isOpen={openStep === 3} isDone={doneSteps.has(3)} onOpen={() => setOpenStep(3)}>
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <Label>Training Framework</Label>
                <Select value={form.trainingFramework} onValueChange={(v) => setForm((f) => ({ ...f, trainingFramework: v }))}>
                  <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select framework" /></SelectTrigger>
                  <SelectContent>{FRAMEWORK_OPTIONS.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Export Formats</Label>
                <ChipMultiSelect options={EXPORT_FORMAT_OPTIONS} selected={form.exportFormats} onChange={(v) => setForm((f) => ({ ...f, exportFormats: v }))} placeholder="Select runtimes" />
              </div>
              <div className="flex flex-col gap-1.5">
                <Label>Supported Metrics</Label>
                <TagInput values={form.supportedMetrics} onChange={(v) => setForm((f) => ({ ...f, supportedMetrics: v }))} placeholder="Select metrics" />
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-100">
              <p className="text-[12px] font-bold text-neutral-700 uppercase tracking-wide">Data Processing</p>
              <div className="flex flex-col gap-1.5">
                <Label>Input Format</Label>
                <Input value={form.inputFormat} onChange={(e) => setForm((f) => ({ ...f, inputFormat: e.target.value }))} placeholder="Select input format" />
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Input Size</p>
                {form.inputSizes.map((s, i) => (
                  <div key={i} className="flex flex-col gap-2 border border-neutral-100 rounded-[4px] p-3">
                    <p className="text-[12px] font-semibold text-neutral-600">Input Size {i + 1}</p>
                    <div className="flex flex-col gap-3">
                      <div className="flex flex-col gap-1.5">
                        <Label>Key</Label>
                        <Input value={s.key} onChange={(e) => updateInputSize(i, { key: e.target.value })} placeholder='e.g. "all"' />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <Label>Value</Label>
                        <Input type="number" value={s.value} onChange={(e) => updateInputSize(i, { value: e.target.value })} placeholder="0" />
                      </div>
                    </div>
                  </div>
                ))}
                <button onClick={addInputSize} className="self-start h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
                  <Plus className="w-3.5 h-3.5" /> Add Input Size
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-3 pt-2 border-t border-neutral-100">
              <p className="text-[12px] font-bold text-neutral-700 uppercase tracking-wide">Benchmark Results</p>
              {form.benchmarks.map((b, i) => {
                const isOpenBm = openBenchmarkId === b.id;
                return (
                  <div key={b.id} className="border border-neutral-100 rounded-[4px] overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-neutral-50" onClick={() => setOpenBenchmarkId(isOpenBm ? null : b.id)}>
                      <p className="text-[12px] font-semibold text-neutral-700">Benchmark {i + 1}</p>
                      <div className="flex items-center gap-2">
                        <button onClick={(e) => { e.stopPropagation(); removeBenchmark(b.id); }} className="text-[#E7000B] hover:opacity-70">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                        <ChevronRight className="w-3.5 h-3.5 text-neutral-400 transition-transform" style={{ transform: isOpenBm ? "rotate(90deg)" : "none" }} />
                      </div>
                    </div>
                    {isOpenBm && (
                      <div className="px-3 pb-3 flex flex-col gap-3 border-t border-neutral-100 pt-3">
                        <div className="flex flex-col gap-3">
                          <div className="flex flex-col gap-1.5">
                            <Label>Dataset</Label>
                            <Input value={b.dataset} onChange={(e) => updateBenchmark(b.id, { dataset: e.target.value })} placeholder="Select dataset" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Split Type</Label>
                            <Input value={b.splitType} onChange={(e) => updateBenchmark(b.id, { splitType: e.target.value })} placeholder="Select split type" />
                          </div>
                          <div className="flex flex-col gap-1.5">
                            <Label>Metric</Label>
                            <Input value={b.metric} onChange={(e) => updateBenchmark(b.id, { metric: e.target.value })} placeholder="Select metric" />
                          </div>
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Values</p>
                          {b.values.map((v, vi) => (
                            <div key={vi} className="flex flex-col gap-2 border border-neutral-100 rounded-[4px] p-3">
                              <p className="text-[12px] font-semibold text-neutral-600">Value {vi + 1}</p>
                              <div className="flex flex-col gap-3">
                                <div className="flex flex-col gap-1.5">
                                  <Label>Key</Label>
                                  <Input value={v.key} onChange={(e) => updateBenchmarkValue(b.id, vi, { key: e.target.value })} placeholder="e.g. model-key" />
                                </div>
                                <div className="flex flex-col gap-1.5">
                                  <Label>Value</Label>
                                  <Input type="number" value={v.value} onChange={(e) => updateBenchmarkValue(b.id, vi, { value: e.target.value })} placeholder="0" />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button onClick={() => addBenchmarkValue(b.id)} className="self-start h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
                            <Plus className="w-3.5 h-3.5" /> Add Value
                          </button>
                        </div>
                        <button onClick={() => setOpenBenchmarkId(null)} className="self-start h-8 px-4 text-[11px] font-semibold uppercase tracking-wide text-white rounded-[4px]" style={{ backgroundColor: TEAL }}>
                          Done
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
              <button onClick={addBenchmark} className="self-start h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add Benchmark
              </button>
            </div>
          </WizardStepSection>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-neutral-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <button className="h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
              <Upload className="w-3.5 h-3.5" /> Upload JSON
            </button>
            <button className="h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
              <Download className="w-3.5 h-3.5" /> Download Template
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-8 px-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-600 hover:text-neutral-800 transition-colors">
              Cancel
            </button>
            <button onClick={handleCreate} className="h-8 px-5 text-[11px] font-semibold uppercase tracking-wide text-white rounded-[4px] transition-colors" style={{ backgroundColor: TEAL }}>
              Create
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── BYOMPage ─────────────────────────────────────────────────────────────────

export function BYOMPage() {
  const [showPrivate, setShowPrivate] = useState(false);
  const [families, setFamilies] = useState<ModelFamily[]>(MOCK_FAMILIES);
  const [showAddFamily, setShowAddFamily] = useState(false);

  const privateFiltered = families.filter((f) => !showPrivate || f.isPrivate);

  const inputTypes    = [...new Set(families.map(f => f.input))];
  const frameworks    = [...new Set(families.map(f => f.trainingFramework))];
  const outputTypes   = [...new Set(families.map(f => f.output))];
  const statusOptions: MFStatus[] = ["approved", "in-review", "rejected", "draft"];

  return (
    <div className="flex flex-col gap-6 min-w-0">
      {showAddFamily && (
        <AddModelFamilyModal
          onClose={() => setShowAddFamily(false)}
          onCreate={(family) => setFamilies((prev) => [family, ...prev])}
        />
      )}

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard>
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-neutral-800">Parameters vs Model Count</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Total Model Count: {families.reduce((a, f) => a + f.modelCount, 0)}</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={PARAM_DATA} margin={{ top: 4, right: 24, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "Inter, sans-serif" }}
                  label={{ value: "Model Params", position: "insideBottom", offset: -12, fontSize: 10, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }}
                  label={{ value: "No. of Models", angle: -90, position: "insideLeft", offset: 14, fontSize: 10, fill: "#94A3B8" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 rounded-[4px] px-3 py-2 shadow-md text-[11px]">
                        <p className="font-semibold text-neutral-800">{d.name}</p>
                        <p className="text-neutral-500 font-mono">{d.count} models</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {PARAM_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>

        <SectionCard>
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-neutral-800">Supported Runtime vs Model Count</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Across all registered model families</p>
          </div>
          <div className="p-5">
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={RUNTIME_DATA} margin={{ top: 4, right: 24, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "Inter, sans-serif" }}
                  label={{ value: "Supported Runtimes", position: "insideBottom", offset: -12, fontSize: 10, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }}
                  label={{ value: "No. of Models", angle: -90, position: "insideLeft", offset: 14, fontSize: 10, fill: "#94A3B8" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 rounded-[4px] px-3 py-2 shadow-md text-[11px]">
                        <p className="font-semibold text-neutral-800">{d.name}</p>
                        <p className="text-neutral-500 font-mono">{d.count} models</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {RUNTIME_DATA.map((entry) => <Cell key={entry.name} fill={entry.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </SectionCard>
      </div>

      {/* ── Model Families table ───────────────────────────────────────────── */}
      <SectionCard className="min-w-0">
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div>
            <h2 className="text-[13px] font-semibold text-neutral-800">Model Families</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">{families.length} families total</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowAddFamily(true)}
              className="h-8 px-3 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide text-white rounded-[4px] transition-colors"
              style={{ backgroundColor: TEAL }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Model Family
            </button>
            <button className="p-1.5 rounded-[4px] border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <V23Table<ModelFamily>
          data={privateFiltered}
          idLabel="Name"
          renderId={(row, h) => <V23Inter hovered={h} weight={600} color="#475569">{row.name}</V23Inter>}
          searchPlaceholder="Search model families…"
          searchFn={(row, q) => `${row.name} ${row.user} ${row.account}`.toLowerCase().includes(q.toLowerCase())}
          sortOptions={[
            { key: "name-asc",    label: "Name (A-Z)",             cmp: (a, b) => a.name.localeCompare(b.name) },
            { key: "name-desc",   label: "Name (Z-A)",             cmp: (a, b) => b.name.localeCompare(a.name) },
            { key: "models-desc", label: "Models (High-Low)",      cmp: (a, b) => b.modelCount - a.modelCount },
            { key: "models-asc",  label: "Models (Low-High)",      cmp: (a, b) => a.modelCount - b.modelCount },
            { key: "year-desc",   label: "Release Year (Newest)",  cmp: (a, b) => b.releaseYear - a.releaseYear },
            { key: "year-asc",    label: "Release Year (Oldest)",  cmp: (a, b) => a.releaseYear - b.releaseYear },
          ]}
          filterGroups={[
            { key: "input",     label: "Input Types", getValue: (row) => row.input,             options: inputTypes.map((v) => ({ value: v, label: v })) },
            { key: "framework", label: "Frameworks",  getValue: (row) => row.trainingFramework,  options: frameworks.map((v) => ({ value: v, label: v })) },
            { key: "status",    label: "Statuses",    getValue: (row) => row.status,             options: statusOptions.map((v) => ({ value: v, label: STATUS_LABEL[v] })) },
            { key: "output",    label: "Model Types", getValue: (row) => row.output,             options: outputTypes.map((v) => ({ value: v, label: v })) },
          ]}
          toolbarExtra={
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide whitespace-nowrap">Private Models</span>
              <ToggleSwitch checked={showPrivate} onChange={setShowPrivate} />
            </div>
          }
          rowAccent={(row) => (row.status === "approved" ? TEAL : row.status === "in-review" ? "#D97706" : row.status === "rejected" ? "#E7000B" : "#94A3B8")}
          columns={[
            { key: "status",            label: "Status",       minWidth: 100, render: (row) => <StatusCapsule status={STATUS_MAP[row.status]} label={STATUS_LABEL[row.status]} /> },
            { key: "input",             label: "Input",        minWidth: 90,  render: (row, h) => <V23Inter hovered={h}>{row.input}</V23Inter> },
            { key: "output",            label: "Output",       minWidth: 110, render: (row, h) => <V23Inter hovered={h}>{row.output}</V23Inter> },
            { key: "trainingFramework", label: "Training Fr.", minWidth: 110, render: (row, h) => <V23Inter hovered={h}>{row.trainingFramework}</V23Inter> },
            { key: "inputFormat",       label: "Input Format", minWidth: 90,  render: (row, h) => <V23Mono hovered={h}>{row.inputFormat}</V23Mono> },
            { key: "sdkVersion",        label: "SDK Ver.",     minWidth: 80,  render: (row, h) => <V23Mono hovered={h}>{row.sdkVersion}</V23Mono> },
            { key: "modelCount",        label: "#Models",      minWidth: 80, align: "right", render: (row, h) => <V23Mono hovered={h} weight={600} color="#475569">{row.modelCount}</V23Mono> },
            { key: "releaseYear",       label: "Release Yr.",  minWidth: 90, align: "right", render: (row, h) => <V23Mono hovered={h}>{row.releaseYear}</V23Mono> },
            { key: "isPrivate",         label: "Private",      minWidth: 70, render: (row) => (row.isPrivate ? <span style={{ fontFamily: "'JetBrains Mono',monospace", color: TEAL, fontWeight: 700, fontSize: 12 }}>✓</span> : <X style={{ width: 13, height: 13, color: "#CBD5E1" }} />) },
            { key: "user",              label: "User",         minWidth: 100, render: (row, h) => <V23Inter hovered={h}>{row.user}</V23Inter> },
            { key: "account",           label: "Account",      minWidth: 100, render: (row, h) => <V23Mono hovered={h}>{row.account}</V23Mono> },
            { key: "createdAt",         label: "Created At",   minWidth: 100, render: (row, h) => <V23Mono hovered={h} color="#94A3B8">{row.createdAt}</V23Mono> },
            { key: "lastUpdated",       label: "Last Updated", minWidth: 100, render: (row, h) => <V23Mono hovered={h} color="#94A3B8">{row.lastUpdated}</V23Mono> },
          ]}
          rowActions={[
            { title: "Edit",   icon: <Pencil className="w-3 h-3" />,  color: TEAL,      onClick: () => {} },
            { title: "Delete", icon: <Trash2 className="w-3 h-3" />,  color: "#E7000B", onClick: () => {} },
          ]}
          expandable
          isRowExpandable={(row) => row.models.length > 0}
          renderExpandedRow={(row) => (
            <div style={{ padding: "0 0 8px", overflowX: "auto" }}>
              <div style={{
                display: "grid", gridTemplateColumns: SUB_GRID,
                alignItems: "center", height: 34,
                paddingLeft: 60, paddingRight: 16,
                backgroundColor: "rgba(0,0,0,0.035)",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
                minWidth: 960,
              }}>
                {["Model Name", "Model Key", "Performance", "#Params (M)", "Training", "Exporting", "Evaluation", "Deployment"].map(h => (
                  <span key={h} style={{ ...HDR, paddingRight: 12 }}>{h}</span>
                ))}
              </div>
              {row.models.map((model, si) => (
                <div key={model.id} style={{
                  display: "grid", gridTemplateColumns: SUB_GRID,
                  alignItems: "center", height: 38,
                  paddingLeft: 60, paddingRight: 16,
                  backgroundColor: si % 2 === 1 ? "rgba(0,119,91,0.015)" : "transparent",
                  borderTop: "1px solid rgba(0,119,91,0.06)",
                  minWidth: 960,
                }}>
                  <span style={{ ...INTER, fontWeight: 600, color: "#334155", paddingRight: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{model.name}</span>
                  <span style={{ ...MONO, color: "#94A3B8", fontSize: 10, paddingRight: 12, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{model.key}</span>
                  <span style={{ ...MONO, color: "#475569", fontWeight: 600, paddingRight: 12 }}>
                    {model.performance != null ? model.performance.toFixed(2) : "—"}
                  </span>
                  <span style={{ ...MONO, color: "#64748B", paddingRight: 12 }}>
                    {model.paramsM != null ? model.paramsM.toFixed(2) : "—"}
                  </span>
                  <div style={{ paddingRight: 12 }}><JobCell status={model.training} /></div>
                  <div style={{ paddingRight: 12 }}><JobCell status={model.exporting} /></div>
                  <div style={{ paddingRight: 12 }}><JobCell status={model.evaluation} /></div>
                  <div><JobCell status={model.deployment} /></div>
                </div>
              ))}
            </div>
          )}
          pageSize={10}
          itemLabel="families"
        />
      </SectionCard>

    </div>
  );
}
