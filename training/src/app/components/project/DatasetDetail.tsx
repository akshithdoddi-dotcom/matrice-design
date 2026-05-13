import { useState, useMemo } from "react";
import {
  ArrowLeft, RefreshCw, ChevronDown, ChevronRight,
  Search, X, Play, CloudUpload, HardDrive, Zap, Plus,
  LayoutGrid, List, Tag, Wand2, Layers, Shuffle,
  SlidersHorizontal, CheckCircle, Clock, AlertCircle,
  Trash2, ImageIcon, Cpu, Settings2, Sparkles,
  FlipHorizontal, Download,
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend,
  ScatterChart, Scatter, ZAxis,
} from "recharts";
import { Label }  from "@/app/components/ui/label";
import { Input }  from "@/app/components/ui/Input";
import { Switch } from "@/app/components/ui/switch";
import { Slider } from "@/app/components/ui/slider";
import { Textarea } from "@/app/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/app/components/ui/select";
import { Dataset } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Detail-level mock data ───────────────────────────────────────────────────

const DETAIL = {
  version:    "v1.0",
  status:     "Processed",
  classes:    2,
  createdBy:  "Mohammed Usman",
  split:      { train: 2600, test: 480, val: 190, unassigned: 27 },
  categories: [
    { name: "benign",    train: 1450, test: 180, val: 160, unassigned: 10 },
    { name: "malignant", train: 1150, test: 300,  val:  30, unassigned: 17 },
  ],
  recentActions: [
    { type: "processed", msg: "Dataset processed successfully", time: "2 days ago",  icon: "ok"  },
    { type: "uploaded",  msg: "1,200 images uploaded",          time: "3 days ago",  icon: "ok"  },
    { type: "created",   msg: "Dataset version created",        time: "4 days ago",  icon: "ok"  },
  ],
};

const SCATTER_DATA = Array.from({ length: 40 }, (_, i) => ({
  x: 20 + Math.floor(Math.random() * 280),
  y: 20 + Math.floor(Math.random() * 280),
  label: Math.random() > 0.5 ? "malignant" : "benign",
}));

const TRANSFORMS = [
  { id: "bit-depth",    name: "Bit Depth Reduction", params: []                                                                  },
  { id: "blur",         name: "Blur",                params: [{ key: "radius",     label: "Radius",     min: 1, max: 15, step: 1, default: 3 }] },
  { id: "brightness",   name: "Brightness Contrast", params: [{ key: "brightness", label: "Brightness", min: -1, max: 1, step: 0.05, default: 0.2 }, { key: "contrast", label: "Contrast", min: -1, max: 1, step: 0.05, default: 0.2 }] },
  { id: "color-jitter", name: "Color Jitter",        params: [{ key: "hue", label: "Hue", min: 0, max: 0.5, step: 0.01, default: 0.1 }, { key: "saturation", label: "Saturation", min: 0, max: 2, step: 0.1, default: 0.5 }] },
  { id: "compression",  name: "Compression Artifacts",params: []                                                                 },
  { id: "downscale",    name: "Downscale Upscale",   params: [{ key: "scale", label: "Scale Factor", min: 0.1, max: 0.9, step: 0.05, default: 0.5 }] },
  { id: "film-grain",   name: "Film Grain",          params: [{ key: "intensity", label: "Intensity", min: 0, max: 1, step: 0.05, default: 0.3 }] },
  { id: "flip",         name: "Flip",                params: []                                                                  },
  { id: "fog",          name: "Fog",                 params: [{ key: "alpha", label: "Alpha", min: 0.1, max: 0.9, step: 0.05, default: 0.4 }] },
  { id: "hsv",          name: "Hsv",                 params: []                                                                  },
  { id: "iso-noise",    name: "Iso Noise",           params: []                                                                  },
  { id: "low-light",    name: "Low Light",           params: [{ key: "gamma", label: "Gamma", min: 0.1, max: 2, step: 0.1, default: 0.5 }] },
  { id: "posterize",    name: "Posterize",           params: [{ key: "bits", label: "Bits", min: 2, max: 8, step: 1, default: 4 }] },
  { id: "rain",         name: "Rain",                params: [{ key: "drop_width", label: "Drop Width", min: 1, max: 5, step: 1, default: 2 }, { key: "blur_value", label: "Blur Value", min: 1, max: 7, step: 1, default: 3 }] },
  { id: "random-affine",name: "Random Affine",       params: []                                                                  },
  { id: "shadows",      name: "Shadows",             params: []                                                                  },
  { id: "snow",         name: "Snow",                params: []                                                                  },
  { id: "speckle",      name: "Speckle",             params: []                                                                  },
];

const GEN_PLACEHOLDER_COLORS = [
  ["#1a3a2a","#2d6b4e"], ["#3a1a1a","#6b2d2d"], ["#1a2a3a","#2d4e6b"],
  ["#3a2a1a","#6b4e2d"], ["#2a1a3a","#4e2d6b"], ["#1a3a3a","#2d6b6b"],
  ["#3a3a1a","#6b6b2d"], ["#2a3a1a","#4e6b2d"], ["#3a1a2a","#6b2d4e"],
  ["#1a1a3a","#2d2d6b"], ["#3a2a2a","#6b4e4e"], ["#1a2a2a","#2d4e4e"],
];

// ─── Shared card wrapper ──────────────────────────────────────────────────────

const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-md border border-neutral-200 shadow-sm", className)}>{children}</div>
);

const SectionHead = ({ title, sub }: { title: string; sub?: string }) => (
  <div className="px-5 py-4 border-b border-neutral-100">
    <h3 className="text-[13px] font-semibold text-neutral-800">{title}</h3>
    {sub && <p className="text-[11px] text-neutral-400 mt-0.5">{sub}</p>}
  </div>
);

// ─── Tab bar ─────────────────────────────────────────────────────────────────

type DsTab = "summary" | "add-data" | "analysis" | "splitting" | "preview" | "annotation" | "augmentation" | "image-gen";

const TABS: { id: DsTab; label: string }[] = [
  { id: "summary",      label: "Summary"          },
  { id: "add-data",     label: "Add Data"         },
  { id: "analysis",     label: "Analysis"         },
  { id: "splitting",    label: "Data Splitting"   },
  { id: "preview",      label: "Preview"          },
  { id: "annotation",   label: "Annotation"       },
  { id: "augmentation", label: "Augmentation"     },
  { id: "image-gen",    label: "Image Generation" },
];

// ─── Status info bar ─────────────────────────────────────────────────────────

function StatusBar({ dataset }: { dataset: Dataset }) {
  return (
    <div className="flex items-center gap-3 px-5 py-2.5 border-b border-neutral-200 bg-white text-[11px] flex-wrap">
      <span className="text-neutral-400">Last Updated: <span className="text-neutral-600 font-medium">{dataset.createdAt}</span></span>
      <span className="text-neutral-200">|</span>
      <span className="text-neutral-400">Created By: <span className="text-neutral-600 font-medium">{DETAIL.createdBy}</span></span>
      <div className="ml-auto flex items-center gap-2">
        <span className="inline-flex items-center gap-1 h-6 px-2.5 rounded-full text-[10px] font-semibold bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20">
          <CheckCircle className="w-3 h-3" /> {DETAIL.status}
        </span>
        <Select defaultValue="v1.0">
          <SelectTrigger className="h-7 w-20 text-[11px] font-mono">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="v1.0">v1.0</SelectItem>
            <SelectItem value="v1.1">v1.1</SelectItem>
          </SelectContent>
        </Select>
        <button className="flex items-center gap-1.5 h-7 px-3 rounded-md text-[11px] font-semibold text-white"
          style={{ backgroundColor: TEAL }}>
          <Play className="w-3 h-3 fill-white" /> Train Model
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 1 — SUMMARY
// ═══════════════════════════════════════════════════════════════════════════════

const SPLIT_COLORS: Record<string, string> = {
  train: TEAL, test: "#F59E0B", val: "#22C55E", unassigned: "#E2E8F0",
};
const CAT_COLORS = [TEAL, "#F59E0B", "#22C55E", "#7C3AED"];

function SummaryTab({ dataset }: { dataset: Dataset }) {
  const { split, categories, recentActions } = DETAIL;
  const total = dataset.itemCount;

  const splitBarData = [
    { name: "train",      count: split.train      },
    { name: "test",       count: split.test       },
    { name: "validation", count: split.val        },
    { name: "unassigned", count: split.unassigned },
  ];

  const catBarData = categories.map((c) => ({
    name: c.name,
    train: c.train,
    test:  c.test,
    val:   c.val,
    unassigned: c.unassigned,
  }));

  const [catSearch, setCatSearch]   = useState("");
  const [catDist,   setCatDist]     = useState("all");
  const [catSplit,  setCatSplit]    = useState("all");
  const [classRange, setClassRange] = useState<number[]>([0, 2]);

  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC] min-w-0">

      {/* ── Top row: info cards + split chart + recent actions ── */}
      <div className="grid grid-cols-12 gap-4">

        {/* Info metrics (3 stacked cards) */}
        <div className="col-span-3 flex flex-col gap-3">
          {[
            { label: "Version", value: DETAIL.version, icon: <Layers className="w-5 h-5 text-[#00775B]" />, color: "#00775B", bg: "#E5FFF9" },
            { label: "Total",   value: total.toLocaleString(), icon: <ImageIcon className="w-5 h-5 text-[#0284C7]" />, color: "#0284C7", bg: "#E0F2FE" },
            { label: "Classes", value: String(DETAIL.classes), icon: <Tag className="w-5 h-5 text-[#7C3AED]" />, color: "#7C3AED", bg: "#F3EEFF" },
          ].map(({ label, value, icon, color, bg }) => (
            <Card key={label} className="flex items-center gap-4 px-4 py-4">
              <div className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0" style={{ backgroundColor: bg }}>
                {icon}
              </div>
              <div>
                <p className="text-[11px] text-neutral-400 font-medium uppercase tracking-wide">{label}</p>
                <p className="text-[22px] font-bold font-mono leading-tight" style={{ color }}>{value}</p>
              </div>
            </Card>
          ))}
        </div>

        {/* Split Distribution chart */}
        <Card className="col-span-5 overflow-hidden">
          <SectionHead title="Split Distribution" />
          <div className="p-4">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={splitBarData} margin={{ top: 4, right: 16, bottom: 24, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#94A3B8" }}
                  label={{ value: "Split Type", position: "insideBottom", offset: -14, fontSize: 10, fill: "#94A3B8" }} />
                <YAxis tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }}
                  label={{ value: "Count", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: "#94A3B8" }} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 rounded px-3 py-1.5 shadow text-[11px]">
                        <p className="font-semibold text-neutral-800 capitalize">{d.name}</p>
                        <p className="font-mono text-neutral-500">{d.count.toLocaleString()} items</p>
                      </div>
                    );
                  }}
                />
                <Bar dataKey="count" radius={[2, 2, 0, 0]}>
                  {splitBarData.map((entry) => (
                    <Cell key={entry.name} fill={SPLIT_COLORS[entry.name] ?? "#CBD5E1"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Actions */}
        <Card className="col-span-4">
          <SectionHead title="Recent Actions" />
          {recentActions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-12 h-12 rounded-full bg-neutral-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-neutral-300" />
              </div>
              <p className="text-[12px] text-neutral-400">No recent actions found</p>
            </div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {recentActions.map((a, i) => (
                <div key={i} className="flex items-start gap-3 px-4 py-3.5">
                  <div className={cn("w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                    a.icon === "ok" ? "bg-[#E5FFF9]" : "bg-amber-50")}>
                    {a.icon === "ok"
                      ? <CheckCircle className="w-3 h-3 text-[#00775B]" />
                      : <Clock className="w-3 h-3 text-amber-500" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] text-neutral-700 font-medium leading-tight">{a.msg}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* ── Category Split Distribution ── */}
      <Card className="overflow-hidden">
        <SectionHead title="Category Split Distribution" />
        <div className="flex">
          {/* Filter sidebar */}
          <div className="w-64 flex-shrink-0 border-r border-neutral-100 p-4 flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Filters</p>
            <Input placeholder="Search Category" className="h-9 text-sm"
              value={catSearch} onChange={(e) => setCatSearch(e.target.value)} />
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-500">Select Distribution</Label>
              <Select value={catDist} onValueChange={setCatDist}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="val">Validation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-500">Select Split</Label>
              <Select value={catSplit} onValueChange={setCatSplit}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="stratified">Stratified</SelectItem>
                  <SelectItem value="random">Random</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-3">
              <Label className="text-xs text-neutral-500">Number of Classes</Label>
              <Slider
                value={classRange} onValueChange={setClassRange}
                min={0} max={DETAIL.classes} step={1}
                className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]"
              />
            </div>
          </div>

          {/* Horizontal stacked bar chart */}
          <div className="flex-1 p-5">
            <ResponsiveContainer width="100%" height={160}>
              <BarChart data={catBarData} layout="vertical" margin={{ top: 8, right: 24, bottom: 8, left: 16 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10, fill: "#94A3B8" }}
                  label={{ value: "Image Count", position: "insideBottom", offset: -2, fontSize: 10, fill: "#94A3B8" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: "#475569", fontWeight: 500 }} width={70} />
                <Tooltip
                  content={({ active, payload, label }) => {
                    if (!active || !payload?.length) return null;
                    return (
                      <div className="bg-white border border-neutral-200 rounded px-3 py-2 shadow text-[11px]">
                        <p className="font-semibold text-neutral-800 capitalize mb-1">{label}</p>
                        {payload.map((p) => (
                          <p key={p.dataKey} className="font-mono text-neutral-500">
                            <span style={{ color: p.fill }} className="font-medium">{p.dataKey}: </span>{p.value}
                          </p>
                        ))}
                      </div>
                    );
                  }}
                />
                <Legend iconType="square" iconSize={9} wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                <Bar dataKey="train" stackId="a" fill={TEAL}      name="train"      />
                <Bar dataKey="test"  stackId="a" fill="#F59E0B"   name="test"       />
                <Bar dataKey="val"   stackId="a" fill="#22C55E"   name="val"        radius={[0, 2, 2, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 2 — ADD DATA (mirrors Upload Dataset)
// ═══════════════════════════════════════════════════════════════════════════════

const DATA_FORMATS = [
  { id: "LabelBox",    desc: "JSON annotations" },
  { id: "COCO",        desc: "MS COCO format"   },
  { id: "YOLO",        desc: "YOLO txt labels"  },
  { id: "Pascal VOC",  desc: "XML annotations"  },
  { id: "ImageNet",    desc: "Folder structure" },
  { id: "Unlabeled",   desc: "No annotations"  },
];
const CLOUD_PROVIDERS = [
  { id: "aws",    label: "AWS S3",       logo: <span className="text-[11px] font-extrabold" style={{ color: "#FF9900" }}>aws</span> },
  { id: "gcp",    label: "Google Cloud", logo: <span className="text-[13px] font-extrabold bg-gradient-to-r from-blue-500 via-red-500 to-green-500 bg-clip-text text-transparent">G</span> },
  { id: "oracle", label: "Oracle OCI",   logo: <span className="text-[10px] font-bold text-red-600">OCI</span> },
  { id: "others", label: "Others",       logo: <span className="text-[9px] font-semibold text-neutral-400">•••</span> },
];

function AddDataTab() {
  const [storage,    setStorage]    = useState("Auto");
  const [compute,    setCompute]    = useState("auto");
  const [dataFormat, setDataFormat] = useState("");
  const [uploadMode, setUploadMode] = useState<"local" | "cloud">("local");
  const [urlType,    setUrlType]    = useState("private");
  const [cloudPath,  setCloudPath]  = useState("");
  const [cloudProv,  setCloudProv]  = useState("aws-s3");
  const [selCloud,   setSelCloud]   = useState("aws");
  const [dragging,   setDragging]   = useState(false);
  const canUpload = !!dataFormat;

  return (
    <div className="p-6 flex flex-col gap-5 bg-[#F8FAFC]">
      {/* Storage & Compute */}
      <Card className="p-5">
        <div className="flex items-center gap-2 mb-4">
          <HardDrive className="w-4 h-4 text-neutral-400" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Storage &amp; Compute</h3>
        </div>
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Storage / Bucket Alias</Label>
              <Select value={storage} onValueChange={setStorage}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Auto">Auto</SelectItem>
                  <SelectItem value="matrice-default-bucket">matrice-default-bucket</SelectItem>
                  <SelectItem value="s3://my-bucket">s3://my-bucket</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-neutral-400">Configure your bucket or use auto{" "}
              <button className="text-[#00775B] font-medium hover:underline">+ Add Bucket</button></p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Compute</Label>
              <Select value={compute} onValueChange={setCompute}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="auto">Automatically launch a new instance</SelectItem>
                  <SelectItem value="matrice-gpu">Matrice Cloud GPU</SelectItem>
                  <SelectItem value="aws-p3">AWS p3.2xlarge</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-neutral-400">Configure your compute or use auto{" "}
              <button className="text-[#00775B] font-medium hover:underline">+ Add Compute</button></p>
          </div>
        </div>
      </Card>

      {/* Data Format */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Data Format</h3>
          </div>
          {dataFormat && (
            <button onClick={() => setDataFormat("")} className="text-xs text-neutral-400 hover:text-red-500 transition-colors">Clear</button>
          )}
        </div>
        <div className="grid grid-cols-6 gap-2">
          {DATA_FORMATS.map(({ id, desc }) => {
            const active = dataFormat === id;
            return (
              <button key={id} onClick={() => setDataFormat(active ? "" : id)}
                className={cn("flex flex-col items-center gap-1.5 px-3 py-3 rounded-md border text-center transition-all",
                  active ? "border-[#00775B] bg-[#00775B]/8 shadow-sm" : "border-neutral-200 hover:border-[#00775B]/40 hover:bg-neutral-50")}>
                <span className={cn("text-xs font-bold", active ? "text-[#00775B]" : "text-neutral-700")}>{id}</span>
                <span className="text-[9px] text-neutral-400 leading-tight">{desc}</span>
                {active && <span className="w-4 h-4 rounded-full bg-[#00775B] flex items-center justify-center"><span className="text-white text-[8px] font-bold">✓</span></span>}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Upload / Cloud */}
      <Card className="overflow-hidden">
        <div className="flex border-b border-neutral-100">
          {(["local", "cloud"] as const).map((m) => (
            <button key={m} onClick={() => setUploadMode(m)}
              className={cn("flex items-center gap-2 px-5 py-3 text-sm font-medium border-b-2 transition-colors",
                uploadMode === m ? "text-[#00775B] border-[#00775B]" : "text-neutral-500 border-transparent hover:text-neutral-700")}>
              {m === "local" ? <><CloudUpload className="w-4 h-4" /> Upload Local Files</> : <><HardDrive className="w-4 h-4" /> Import from Cloud</>}
            </button>
          ))}
        </div>

        {uploadMode === "local" && (
          <div className="p-6">
            <div onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={(e) => { e.preventDefault(); setDragging(false); }}
              className={cn("flex flex-col items-center justify-center gap-4 py-14 rounded-md border-2 border-dashed transition-colors",
                dragging ? "border-[#00775B] bg-[#00775B]/5" : "border-[#00775B]/30 bg-[#F8FAFC]")}>
              <div className="w-14 h-14 rounded-full bg-[#00775B]/10 flex items-center justify-center">
                <CloudUpload className="w-7 h-7" style={{ color: TEAL }} />
              </div>
              <div className="text-center">
                <p className="text-sm font-semibold text-neutral-700">Drag and drop files here</p>
                <p className="text-xs text-neutral-400 mt-1">or browse from your computer</p>
              </div>
              <button className="flex items-center gap-2 h-9 px-6 rounded-md text-sm font-semibold text-white" style={{ backgroundColor: TEAL }}>
                <CloudUpload className="w-4 h-4" /> Select Files
              </button>
              <p className="text-xs text-neutral-400">Supported: .png · .jpeg · .jpg · .json · .ndjson</p>
            </div>
          </div>
        )}

        {uploadMode === "cloud" && (
          <div className="p-6 flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Select Provider</p>
              <div className="grid grid-cols-4 gap-3">
                {CLOUD_PROVIDERS.map(({ id, label, logo }) => (
                  <button key={id} onClick={() => setSelCloud(id)}
                    className={cn("flex flex-col items-center gap-2 p-3 rounded-md border transition-all",
                      selCloud === id ? "border-[#00775B] bg-[#00775B]/6 shadow-sm" : "border-neutral-200 hover:border-[#00775B]/40 hover:bg-neutral-50")}>
                    <div className={cn("w-10 h-10 rounded-md border flex items-center justify-center bg-white",
                      selCloud === id ? "border-[#00775B]/30" : "border-neutral-200")}>{logo}</div>
                    <span className={cn("text-[10px] font-semibold", selCloud === id ? "text-[#00775B]" : "text-neutral-500")}>{label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">URL Type</Label>
              <Select value={urlType} onValueChange={setUrlType}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">Private (using bucket alias)</SelectItem>
                  <SelectItem value="public">Public URL</SelectItem>
                  <SelectItem value="s3-uri">S3 URI</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Cloud Path</Label>
              <Input placeholder="e.g. datasets/my-project/v3/" value={cloudPath}
                onChange={(e) => setCloudPath(e.target.value)} className="h-9 text-sm" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Cloud Provider</Label>
              <Select value={cloudProv} onValueChange={setCloudProv}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="aws-s3">AWS S3</SelectItem>
                  <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                  <SelectItem value="oracle">Oracle Object Storage</SelectItem>
                  <SelectItem value="azure">Azure Blob</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-xs text-neutral-400">
          {canUpload ? <span className="text-[#00775B] font-medium">Format selected: {dataFormat}</span> : "Select a data format to enable upload"}
        </p>
        <button disabled={!canUpload}
          className="h-9 px-6 text-sm font-semibold rounded-md text-white disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: canUpload ? TEAL : "#94A3B8" }}>
          Add Data
        </button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 3 — ANALYSIS
// ═══════════════════════════════════════════════════════════════════════════════

function AnalysisTab() {
  const [labelFilter, setLabelFilter] = useState("all");
  const [sampleCount, setSampleCount] = useState("1000");
  const [splitFilter, setSplitFilter] = useState("all");
  const [widthRange,  setWidthRange]  = useState<number[]>([0, 300]);
  const [heightRange, setHeightRange] = useState<number[]>([0, 300]);
  const [viewMode,    setViewMode]    = useState<"grid" | "list">("grid");

  const filteredData = useMemo(() => {
    return SCATTER_DATA.filter((d) => {
      if (labelFilter !== "all" && d.label !== labelFilter) return false;
      if (d.x < widthRange[0]  || d.x > widthRange[1])  return false;
      if (d.y < heightRange[0] || d.y > heightRange[1]) return false;
      return true;
    });
  }, [labelFilter, widthRange, heightRange]);

  const malignantData = filteredData.filter((d) => d.label === "malignant");
  const benignData    = filteredData.filter((d) => d.label === "benign");

  return (
    <div className="p-6 bg-[#F8FAFC] min-w-0">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h3 className="text-[13px] font-semibold text-neutral-800">Image Height vs Width</h3>
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
          <div className="w-64 flex-shrink-0 border-r border-neutral-100 p-4 flex flex-col gap-4">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Filters</p>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-500">Select Labels</Label>
              <Select value={labelFilter} onValueChange={setLabelFilter}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Labels</SelectItem>
                  <SelectItem value="benign">Benign</SelectItem>
                  <SelectItem value="malignant">Malignant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-500">Select Sample Count</Label>
              <Select value={sampleCount} onValueChange={setSampleCount}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="100">Random 100</SelectItem>
                  <SelectItem value="500">Random 500</SelectItem>
                  <SelectItem value="1000">Random 1000</SelectItem>
                  <SelectItem value="all">All Items</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-500">Select Split Type</Label>
              <Select value={splitFilter} onValueChange={setSplitFilter}>
                <SelectTrigger className="h-9 text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                  <SelectItem value="val">Validation</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-500">Width</Label>
                <span className="text-[10px] font-mono text-neutral-400">{widthRange[0]}–{widthRange[1]}px</span>
              </div>
              <Slider value={widthRange} onValueChange={setWidthRange} min={0} max={300} step={10}
                className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs text-neutral-500">Height</Label>
                <span className="text-[10px] font-mono text-neutral-400">{heightRange[0]}–{heightRange[1]}px</span>
              </div>
              <Slider value={heightRange} onValueChange={setHeightRange} min={0} max={300} step={10}
                className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
            </div>
            <button onClick={() => { setLabelFilter("all"); setSplitFilter("all"); setWidthRange([0, 300]); setHeightRange([0, 300]); }}
              className="flex items-center justify-center gap-2 h-9 rounded-md border border-red-200 text-red-500 hover:bg-red-50 text-xs font-medium transition-colors mt-2">
              <Trash2 className="w-3.5 h-3.5" /> Delete All Filters
            </button>
          </div>

          {/* Scatter chart */}
          <div className="flex-1 p-5">
            <ResponsiveContainer width="100%" height={400}>
              <ScatterChart margin={{ top: 12, right: 24, bottom: 32, left: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis type="number" dataKey="x" name="Width"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  label={{ value: "Width", position: "insideBottom", offset: -20, fontSize: 11, fill: "#94A3B8" }}
                  domain={[0, 300]} tickCount={7} />
                <YAxis type="number" dataKey="y" name="Height"
                  tick={{ fontSize: 10, fill: "#94A3B8" }}
                  label={{ value: "Height", angle: -90, position: "insideLeft", offset: 12, fontSize: 11, fill: "#94A3B8" }}
                  domain={[0, 300]} tickCount={7} />
                <ZAxis range={[30, 30]} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 rounded px-3 py-1.5 shadow text-[11px]">
                        <p className="font-semibold text-neutral-800 capitalize mb-0.5">{d.label}</p>
                        <p className="font-mono text-neutral-500">{d.x}×{d.y}px</p>
                      </div>
                    );
                  }}
                />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11, paddingTop: 4 }} />
                <Scatter name="malignant" data={malignantData} fill="#F59E0B" opacity={0.7} />
                <Scatter name="benign"    data={benignData}    fill={TEAL}     opacity={0.6} />
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 4 — DATA SPLITTING
// ═══════════════════════════════════════════════════════════════════════════════

function DataSplittingTab({ dataset }: { dataset: Dataset }) {
  const [train,    setTrain]    = useState(dataset.trainSplit);
  const [val,      setVal]      = useState(dataset.valSplit);
  const [strategy, setStrategy] = useState<"random" | "stratified" | "sequential">("stratified");
  const [seed,     setSeed]     = useState("42");
  const [saved,    setSaved]    = useState(false);

  const test = Math.max(0, 100 - train - val);

  const handleTrain = (v: number[]) => {
    const t = v[0];
    const remaining = 100 - t;
    setTrain(t);
    setVal(Math.min(val, remaining));
  };
  const handleVal = (v: number[]) => {
    const maxVal = 100 - train;
    setVal(Math.min(v[0], maxVal));
  };

  const handleSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2000); };

  const preview = DETAIL.categories.map((c) => {
    const total = c.train + c.test + c.val + c.unassigned;
    return {
      name:  c.name,
      total,
      train: Math.round(total * train / 100),
      val:   Math.round(total * val / 100),
      test:  Math.round(total * test / 100),
    };
  });

  return (
    <div className="p-6 bg-[#F8FAFC] flex flex-col gap-5 min-w-0">

      {/* Current split visual + sliders */}
      <div className="grid grid-cols-2 gap-5">

        {/* Sliders card */}
        <Card className="p-5 flex flex-col gap-5">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400" />
            <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Adjust Split Ratios</h3>
          </div>

          {/* Visual bar */}
          <div className="flex h-3 rounded-full overflow-hidden gap-px">
            <div className="transition-all" style={{ width: `${train}%`, backgroundColor: TEAL }} />
            <div className="transition-all" style={{ width: `${val}%`, backgroundColor: "#0284C7" }} />
            <div className="transition-all" style={{ width: `${test}%`, backgroundColor: "#7C3AED" }} />
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            {[
              { label: "Train", value: train, color: TEAL },
              { label: "Val",   value: val,   color: "#0284C7" },
              { label: "Test",  value: test,  color: "#7C3AED" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                <span className="text-neutral-500">{label}</span>
                <span className="font-bold font-mono" style={{ color }}>{value}%</span>
              </div>
            ))}
            <span className="ml-auto text-neutral-400">Must sum to 100%</span>
          </div>

          {/* Train slider */}
          <div className="flex flex-col gap-3">
            {[
              { label: "Train", value: [train], onChange: handleTrain, color: TEAL, max: 90 },
              { label: "Val",   value: [val],   onChange: handleVal,   color: "#0284C7", max: 100 - train },
            ].map(({ label, value, onChange, color, max }) => (
              <div key={label} className="flex items-center gap-3">
                <span className="text-xs font-medium text-neutral-600 w-10">{label}</span>
                <div className="flex-1">
                  <Slider value={value} onValueChange={onChange} min={0} max={max} step={5}
                    className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
                </div>
                <span className="text-[11px] font-mono font-semibold w-8 text-right" style={{ color }}>{value[0]}%</span>
              </div>
            ))}
            <div className="flex items-center gap-3">
              <span className="text-xs font-medium text-neutral-400 w-10">Test</span>
              <div className="flex-1 h-4 flex items-center">
                <div className="h-2 rounded-full flex-1 bg-neutral-100 relative">
                  <div className="absolute left-0 top-0 h-full rounded-full" style={{ width: `${(test / 40) * 100}%`, backgroundColor: "#7C3AED", opacity: 0.4 }} />
                </div>
              </div>
              <span className="text-[11px] font-mono font-semibold w-8 text-right text-[#7C3AED]">{test}%</span>
            </div>
            <p className="text-[10px] text-neutral-400">Test split is calculated automatically (100 − Train − Val)</p>
          </div>

          {/* Seed */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Random Seed</Label>
            <Input value={seed} onChange={(e) => setSeed(e.target.value)} className="h-9 text-sm font-mono" placeholder="42" />
            <p className="text-[10px] text-neutral-400">Ensures reproducible splits across runs</p>
          </div>
        </Card>

        {/* Strategy card */}
        <div className="flex flex-col gap-5">
          <Card className="p-5 flex flex-col gap-4">
            <div className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Splitting Strategy</h3>
            </div>
            <div className="flex flex-col gap-3">
              {([
                { id: "random",      label: "Random Split",      desc: "Randomly assign items across sets. Best for balanced datasets." },
                { id: "stratified",  label: "Stratified Split",  desc: "Maintains class proportion in each split. Recommended." },
                { id: "sequential", label: "Sequential Split",  desc: "Splits in order of data entry. Useful for time-series data." },
              ] as const).map(({ id, label, desc }) => (
                <button key={id} onClick={() => setStrategy(id)}
                  className={cn("flex items-start gap-3 p-3 rounded-md border text-left transition-all",
                    strategy === id ? "border-[#00775B] bg-[#00775B]/5 shadow-sm" : "border-neutral-200 hover:border-neutral-300 hover:bg-neutral-50")}>
                  <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5",
                    strategy === id ? "border-[#00775B]" : "border-neutral-300")}>
                    {strategy === id && <div className="w-2 h-2 rounded-full bg-[#00775B]" />}
                  </div>
                  <div>
                    <p className={cn("text-[12px] font-semibold", strategy === id ? "text-[#00775B]" : "text-neutral-700")}>{label}</p>
                    <p className="text-[10px] text-neutral-400 mt-0.5 leading-relaxed">{desc}</p>
                  </div>
                </button>
              ))}
            </div>
          </Card>

          {/* Stats */}
          <Card className="p-4 flex flex-col gap-2">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500 mb-1">Current Configuration</p>
            {[
              { label: "Strategy",    value: strategy.charAt(0).toUpperCase() + strategy.slice(1) },
              { label: "Seed",        value: seed || "42" },
              { label: "Total Items", value: dataset.itemCount.toLocaleString() },
              { label: "Est. Train",  value: Math.round(dataset.itemCount * train / 100).toLocaleString() },
              { label: "Est. Val",    value: Math.round(dataset.itemCount * val   / 100).toLocaleString() },
              { label: "Est. Test",   value: Math.round(dataset.itemCount * test  / 100).toLocaleString() },
            ].map(({ label, value }) => (
              <div key={label} className="flex items-center justify-between py-1 border-b border-neutral-50 last:border-0">
                <span className="text-[11px] text-neutral-500">{label}</span>
                <span className="text-[11px] font-mono font-medium text-neutral-800">{value}</span>
              </div>
            ))}
          </Card>
        </div>
      </div>

      {/* Class distribution preview */}
      <Card className="overflow-hidden">
        <SectionHead title="Class Distribution Preview" sub="Estimated item counts per class after applying the new split" />
        <table className="w-full text-[12px]">
          <thead>
            <tr className="bg-neutral-50 border-b border-neutral-100">
              {["Class", "Total Items", `Train (${train}%)`, `Val (${val}%)`, `Test (${test}%)`].map((h) => (
                <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, i) => (
              <tr key={row.name} className={cn("border-b border-neutral-50", i % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}>
                <td className="px-5 py-3 font-medium text-neutral-800 capitalize">{row.name}</td>
                <td className="px-5 py-3 font-mono text-neutral-500">{row.total.toLocaleString()}</td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${train}%`, backgroundColor: TEAL }} />
                    </div>
                    <span className="font-mono text-neutral-600 w-12 text-right">{row.train.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${val}%`, backgroundColor: "#0284C7" }} />
                    </div>
                    <span className="font-mono text-neutral-600 w-12 text-right">{row.val.toLocaleString()}</span>
                  </div>
                </td>
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${test}%`, backgroundColor: "#7C3AED" }} />
                    </div>
                    <span className="font-mono text-neutral-600 w-12 text-right">{row.test.toLocaleString()}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end px-5 py-4 border-t border-neutral-100 bg-neutral-50/50">
          <button onClick={handleSave}
            className={cn("flex items-center gap-2 h-9 px-5 rounded-md text-sm font-semibold text-white transition-all",
              saved ? "bg-emerald-500" : "bg-[#00775B] hover:bg-[#006649]")}>
            {saved ? <><CheckCircle className="w-4 h-4" /> Saved!</> : "Save Split Configuration"}
          </button>
        </div>
      </Card>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 5 — PREVIEW
// ═══════════════════════════════════════════════════════════════════════════════

const PREVIEW_ITEMS = Array.from({ length: 24 }, (_, i) => ({
  id:    i,
  label: i % 3 === 0 ? "malignant" : "benign",
  split: i % 5 < 3 ? "train" : i % 5 === 3 ? "test" : "val",
  hue:   20 + (i % 4) * 15,
}));

function PreviewTab() {
  const [splitFilter, setSplitFilter] = useState("all");
  const [classFilter, setClassFilter] = useState("all");
  const [typeFilter,  setTypeFilter]  = useState("all");
  const [viewMode,    setViewMode]    = useState<"grid" | "list">("grid");

  const filtered = PREVIEW_ITEMS.filter((item) => {
    if (splitFilter !== "all" && item.split  !== splitFilter) return false;
    if (classFilter !== "all" && item.label  !== classFilter) return false;
    return true;
  });

  return (
    <div className="flex flex-col h-full bg-[#F8FAFC] min-w-0">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-5 py-3.5 border-b border-neutral-200 bg-white flex-wrap">
        <div className="flex items-center gap-2">
          {[
            { label: "Select Split", value: splitFilter, onChange: setSplitFilter, options: [{ v: "all", l: "All" }, { v: "train", l: "Train" }, { v: "test", l: "Test" }, { v: "val", l: "Validation" }] },
            { label: "Select Class", value: classFilter, onChange: setClassFilter, options: [{ v: "all", l: "All" }, { v: "benign", l: "Benign" }, { v: "malignant", l: "Malignant" }] },
            { label: "Select Item Type", value: typeFilter, onChange: setTypeFilter, options: [{ v: "all", l: "All" }, { v: "image", l: "Image" }] },
          ].map(({ label, value, onChange, options }) => (
            <Select key={label} value={value} onValueChange={onChange}>
              <SelectTrigger className="h-8 w-40 text-[11px]">
                <SelectValue placeholder={label} />
              </SelectTrigger>
              <SelectContent>
                {options.map(({ v, l }) => <SelectItem key={v} value={v}>{l}</SelectItem>)}
              </SelectContent>
            </Select>
          ))}
        </div>
        <div className="ml-auto flex items-center gap-1 bg-neutral-100 rounded-md p-0.5">
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

      {/* Image grid */}
      <div className="flex-1 overflow-y-auto p-5">
        {viewMode === "grid" ? (
          <div className="grid grid-cols-4 gap-3">
            {filtered.map((item) => (
              <div key={item.id} className="relative rounded-md overflow-hidden border border-neutral-200 shadow-sm group cursor-pointer hover:shadow-md transition-shadow">
                {/* Placeholder image */}
                <div className="aspect-square relative overflow-hidden"
                  style={{ background: `radial-gradient(circle at 40% 40%, hsl(${item.hue}, 60%, 25%), hsl(${item.hue + 20}, 50%, 12%))` }}>
                  {/* Lesion blob simulation */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full opacity-60"
                      style={{ width: "60%", height: "60%", background: `radial-gradient(circle, hsl(${item.hue + 5}, 55%, 15%), hsl(${item.hue}, 40%, 8%))` }} />
                  </div>
                  {/* Hover overlay */}
                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button className="h-7 px-3 rounded-md bg-white/90 text-neutral-800 text-[11px] font-semibold">View</button>
                  </div>
                </div>
                {/* Label badge */}
                <div className="absolute top-2 right-2">
                  <span className={cn("inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold",
                    item.label === "benign" ? "bg-[#00775B] text-white" : "bg-amber-500 text-white")}>
                    {item.label}
                  </span>
                </div>
                {/* Info bar */}
                <div className="px-2.5 py-2 bg-white border-t border-neutral-100">
                  <p className="text-[10px] font-mono text-neutral-400">IMG_{String(item.id + 1).padStart(4, "0")}.jpg</p>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="text-[9px] uppercase tracking-wide text-neutral-400">{item.split}</span>
                    <span className="text-[9px] text-neutral-300">224×224</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Card className="overflow-hidden">
            <table className="w-full text-[12px]">
              <thead>
                <tr className="bg-neutral-50 border-b border-neutral-100">
                  {["#", "Filename", "Class", "Split", "Dimensions", "Size"].map((h) => (
                    <th key={h} className="text-left px-5 py-2.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((item, i) => (
                  <tr key={item.id} className={cn("border-b border-neutral-50 hover:bg-neutral-50 transition-colors", i % 2 === 0 ? "bg-white" : "bg-neutral-50/30")}>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-neutral-400">{item.id + 1}</td>
                    <td className="px-5 py-2.5 font-mono text-[11px] text-neutral-600">IMG_{String(item.id + 1).padStart(4, "0")}.jpg</td>
                    <td className="px-5 py-2.5">
                      <span className={cn("inline-flex items-center h-5 px-2 rounded-full text-[10px] font-semibold",
                        item.label === "benign" ? "bg-[#E5FFF9] text-[#00775B]" : "bg-amber-50 text-amber-700")}>
                        {item.label}
                      </span>
                    </td>
                    <td className="px-5 py-2.5 text-[11px] text-neutral-500 capitalize">{item.split}</td>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-neutral-400">224×224</td>
                    <td className="px-5 py-2.5 font-mono text-[10px] text-neutral-400">48 KB</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        )}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between px-5 py-3 border-t border-neutral-200 bg-white text-[11px] text-neutral-500">
        <span>Showing {filtered.length} of {PREVIEW_ITEMS.length} items</span>
        <div className="flex items-center gap-1">
          {[1, 2, 3, "...", 12].map((p, i) => (
            <button key={i}
              className={cn("h-7 w-7 rounded text-[11px] font-medium transition-colors",
                p === 1 ? "bg-[#00775B] text-white" : "text-neutral-500 hover:bg-neutral-100")}>
              {p}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 6 — ANNOTATION
// ═══════════════════════════════════════════════════════════════════════════════

const ANNOTATION_TOOLS = [
  { id: "select", icon: "↖", label: "Select" },
  { id: "rect",   icon: "⬜", label: "Rectangle" },
  { id: "poly",   icon: "⬡",  label: "Polygon" },
  { id: "point",  icon: "•",  label: "Point" },
];

function AnnotationTab() {
  const [activeTool, setActiveTool] = useState("rect");
  const [activeClass, setActiveClass] = useState("benign");

  return (
    <div className="flex h-[600px] bg-[#F8FAFC] min-w-0 overflow-hidden">
      {/* Tool palette */}
      <div className="w-14 flex-shrink-0 bg-[#021d18] flex flex-col items-center gap-2 pt-4 pb-4">
        {ANNOTATION_TOOLS.map(({ id, icon, label }) => (
          <button key={id} title={label} onClick={() => setActiveTool(id)}
            className={cn("w-9 h-9 rounded-md flex items-center justify-center text-lg transition-colors",
              activeTool === id ? "bg-[#00775B] text-white" : "text-neutral-400 hover:bg-white/10 hover:text-white")}>
            {icon}
          </button>
        ))}
        <div className="mt-auto flex flex-col gap-2">
          <button title="Zoom In"  className="w-9 h-9 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 flex items-center justify-center font-bold text-lg">+</button>
          <button title="Zoom Out" className="w-9 h-9 rounded-md text-neutral-400 hover:text-white hover:bg-white/10 flex items-center justify-center font-bold text-lg">−</button>
        </div>
      </div>

      {/* Canvas area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Image nav */}
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-neutral-200 bg-white text-[11px]">
          <button className="text-neutral-400 hover:text-neutral-600">← Prev</button>
          <span className="text-neutral-500 font-mono">IMG_0001.jpg</span>
          <span className="text-neutral-300">|</span>
          <span className="text-neutral-400">1 of 2,600</span>
          <button className="text-neutral-400 hover:text-neutral-600">Next →</button>
          <div className="ml-auto flex items-center gap-2">
            <span className="inline-flex items-center h-5 px-2 rounded bg-[#E5FFF9] text-[#00775B] text-[10px] font-semibold">{activeClass}</span>
            <button className="h-6 px-2.5 rounded bg-[#00775B] text-white text-[10px] font-semibold">Save</button>
          </div>
        </div>

        {/* Canvas */}
        <div className="flex-1 bg-neutral-800 relative overflow-hidden flex items-center justify-center">
          <div className="relative"
            style={{ width: 480, height: 480, background: "radial-gradient(circle at 40% 40%, hsl(30, 60%, 20%), hsl(15, 40%, 10%))" }}>
            {/* Lesion sim */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="rounded-full opacity-60"
                style={{ width: "55%", height: "55%", background: "radial-gradient(circle, hsl(10, 55%, 12%), hsl(5, 40%, 7%))" }} />
            </div>
            {/* Annotation box simulation */}
            <div className="absolute border-2 border-[#00775B] rounded"
              style={{ top: "20%", left: "18%", width: "60%", height: "58%" }}>
              <span className="absolute -top-5 left-0 bg-[#00775B] text-white text-[10px] font-semibold px-1.5 py-0.5 rounded-t">benign</span>
              <div className="absolute -top-1 -left-1 w-2 h-2 bg-[#00775B] rounded-sm" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-[#00775B] rounded-sm" />
              <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-[#00775B] rounded-sm" />
              <div className="absolute -bottom-1 -right-1 w-2 h-2 bg-[#00775B] rounded-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Annotations panel */}
      <div className="w-56 flex-shrink-0 border-l border-neutral-200 bg-white flex flex-col">
        <div className="px-4 py-3 border-b border-neutral-100">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Labels</p>
        </div>
        <div className="p-3 flex flex-col gap-2">
          {["benign", "malignant"].map((cls) => (
            <button key={cls} onClick={() => setActiveClass(cls)}
              className={cn("flex items-center gap-2 px-3 py-2 rounded-md text-[12px] font-medium transition-colors w-full text-left",
                activeClass === cls ? "bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20" : "hover:bg-neutral-50 text-neutral-600 border border-transparent")}>
              <span className="w-3 h-3 rounded-sm flex-shrink-0"
                style={{ backgroundColor: cls === "benign" ? TEAL : "#F59E0B" }} />
              {cls}
            </button>
          ))}
        </div>
        <div className="px-4 py-3 border-b border-t border-neutral-100 mt-2">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-neutral-500">Annotations</p>
        </div>
        <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
          <div className="flex items-center justify-between px-2 py-1.5 bg-[#E5FFF9] rounded text-[11px]">
            <span className="font-medium text-[#00775B]">benign #1</span>
            <button className="text-neutral-400 hover:text-red-500"><X className="w-3 h-3" /></button>
          </div>
        </div>
        <div className="p-3 border-t border-neutral-100">
          <button className="w-full h-8 rounded-md bg-[#00775B] text-white text-xs font-semibold">Save &amp; Next →</button>
        </div>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 7 — AUGMENTATION
// ═══════════════════════════════════════════════════════════════════════════════

type SelectedTransform = { id: string; name: string; params: Record<string, number>; expanded: boolean };

function AugmentationTab() {
  const [newVersion,   setNewVersion]   = useState(true);
  const [versionName,  setVersionName]  = useState("v1.1");
  const [transformSearch, setTransformSearch] = useState("");
  const [autoSelect,   setAutoSelect]   = useState(true);
  const [selected, setSelected] = useState<SelectedTransform[]>([
    { id: "flip",       name: "Flip",               params: {},                               expanded: false },
    { id: "brightness", name: "Brightness Contrast", params: { brightness: 0.2, contrast: 0.2 }, expanded: false },
    { id: "rain",       name: "Rain",                params: { drop_width: 2, blur_value: 3 },  expanded: false },
    { id: "color-jitter", name: "Color Jitter",      params: { hue: 0.1, saturation: 0.5 },     expanded: false },
  ]);

  const isSelected = (id: string) => selected.some((s) => s.id === id);
  const filteredTransforms = TRANSFORMS.filter((t) =>
    t.name.toLowerCase().includes(transformSearch.toLowerCase())
  );

  const toggleTransform = (t: typeof TRANSFORMS[0]) => {
    if (isSelected(t.id)) {
      setSelected((prev) => prev.filter((s) => s.id !== t.id));
    } else {
      const defaults: Record<string, number> = {};
      t.params.forEach((p) => { defaults[p.key] = p.default; });
      setSelected((prev) => [...prev, { id: t.id, name: t.name, params: defaults, expanded: false }]);
    }
  };

  const removeSelected = (id: string) => setSelected((prev) => prev.filter((s) => s.id !== id));
  const toggleExpand   = (id: string) => setSelected((prev) => prev.map((s) => s.id === id ? { ...s, expanded: !s.expanded } : s));
  const updateParam = (id: string, key: string, value: number) =>
    setSelected((prev) => prev.map((s) => s.id === id ? { ...s, params: { ...s.params, [key]: value } } : s));

  const getTransformDef = (id: string) => TRANSFORMS.find((t) => t.id === id);

  return (
    <div className="flex h-[640px] bg-[#F8FAFC] gap-0 min-w-0 overflow-hidden">

      {/* ── Left panel ── */}
      <div className="w-80 flex-shrink-0 flex flex-col bg-white border-r border-neutral-200 overflow-y-auto">

        {/* New Version + Version name */}
        <div className="px-4 py-3.5 border-b border-neutral-100">
          <div className="flex items-center justify-between mb-3">
            <Label className="text-[12px] font-semibold text-neutral-700">New Version</Label>
            <Switch checked={newVersion} onCheckedChange={setNewVersion} />
          </div>
          {newVersion && (
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-500">Version Name</Label>
              <Input value={versionName} onChange={(e) => setVersionName(e.target.value)} className="h-8 text-sm font-mono" />
            </div>
          )}
        </div>

        {/* Search + Auto Select */}
        <div className="px-4 py-3 border-b border-neutral-100 flex flex-col gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-neutral-400" />
            <Input value={transformSearch} onChange={(e) => setTransformSearch(e.target.value)}
              placeholder="Search for Transforms" className="pl-8 h-8 text-[12px]" />
          </div>
          <div className="flex items-center justify-between">
            <Label className="text-[12px] text-neutral-600">Auto Select</Label>
            <Switch checked={autoSelect} onCheckedChange={setAutoSelect} />
          </div>
        </div>

        {/* Transform chips */}
        <div className="px-4 py-3 border-b border-neutral-100 flex flex-wrap gap-2">
          {filteredTransforms.map((t) => {
            const active = isSelected(t.id);
            return (
              <button key={t.id} onClick={() => toggleTransform(t)}
                className={cn("h-7 px-3 rounded-full text-[11px] font-medium border transition-all",
                  active
                    ? "bg-[#00775B] text-white border-[#00775B] shadow-sm"
                    : "bg-white text-neutral-600 border-neutral-200 hover:border-[#00775B]/40 hover:text-[#00775B]")}>
                {t.name}
              </button>
            );
          })}
        </div>

        {/* Selected transforms accordion */}
        <div className="flex-1 overflow-y-auto">
          {selected.map((s) => {
            const def = getTransformDef(s.id);
            const hasParams = def && def.params.length > 0;
            return (
              <div key={s.id} className="border-b border-neutral-100 last:border-0">
                <div className="flex items-center gap-2 px-4 py-3">
                  <div className="flex-1 flex items-center gap-2">
                    <FlipHorizontal className="w-3.5 h-3.5 text-neutral-300 flex-shrink-0" />
                    <span className="text-[12px] font-medium text-neutral-700 truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button onClick={() => removeSelected(s.id)}
                      className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-red-500 hover:bg-red-50 transition-colors">
                      <X className="w-3 h-3" />
                    </button>
                    {hasParams && (
                      <button onClick={() => toggleExpand(s.id)}
                        className="w-5 h-5 rounded flex items-center justify-center text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
                        <ChevronDown className={cn("w-3 h-3 transition-transform", s.expanded && "rotate-180")} />
                      </button>
                    )}
                  </div>
                </div>
                {s.expanded && hasParams && def && (
                  <div className="px-4 pb-3 flex flex-col gap-3 bg-neutral-50/50">
                    {def.params.map((p) => (
                      <div key={p.key} className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between">
                          <Label className="text-[10px] text-neutral-500">{p.label}</Label>
                          <span className="text-[10px] font-mono text-neutral-600">{s.params[p.key] ?? p.default}</span>
                        </div>
                        <Slider
                          value={[s.params[p.key] ?? p.default]}
                          onValueChange={([v]) => updateParam(s.id, p.key, v)}
                          min={p.min} max={p.max} step={p.step}
                          className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Action buttons */}
        <div className="px-4 py-3.5 border-t border-neutral-100 flex gap-2">
          <button className="flex-1 h-8 rounded-md border border-[#00775B] text-[#00775B] text-[12px] font-semibold hover:bg-[#00775B]/5 transition-colors">
            Execute on Image
          </button>
          <button className="flex-1 h-8 rounded-md bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
            Add to Transforms
          </button>
        </div>
      </div>

      {/* ── Image preview area ── */}
      <div className="flex-1 grid grid-cols-2 gap-0 min-w-0">
        {[
          { label: "Original Image",     hasImage: true  },
          { label: "Transformed Image",  hasImage: false },
        ].map(({ label, hasImage }) => (
          <div key={label} className={cn("flex flex-col border-r last:border-r-0 border-neutral-200")}>
            <div className="px-4 py-2.5 border-b border-neutral-100 bg-white">
              <p className="text-[12px] font-semibold text-neutral-700">{label}</p>
            </div>
            <div className="flex-1 flex items-center justify-center bg-neutral-100/50">
              {hasImage ? (
                <div className="relative w-64 h-64"
                  style={{ background: "radial-gradient(circle at 40% 40%, hsl(30, 60%, 20%), hsl(15, 40%, 10%))" }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full opacity-60"
                      style={{ width: "60%", height: "60%", background: "radial-gradient(circle, hsl(10, 55%, 12%), hsl(5, 40%, 7%))" }} />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center max-w-[220px]">
                  <div className="w-12 h-12 rounded-full bg-amber-50 border border-amber-200 flex items-center justify-center">
                    <AlertCircle className="w-5 h-5 text-amber-500" />
                  </div>
                  <p className="text-[12px] text-neutral-500 leading-relaxed">
                    Select transforms and click <span className="font-semibold text-neutral-700">Execute on Image</span>
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// TAB 8 — IMAGE GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

const IMAGE_GEN_MODELS = [
  { id: "stable-diffusion-xl", label: "Stable Diffusion XL", desc: "High quality, versatile" },
  { id: "stable-diffusion-2",  label: "Stable Diffusion 2.1", desc: "Faster generation" },
  { id: "dall-e-3",            label: "DALL·E 3",             desc: "Best prompt adherence" },
  { id: "midjourney-api",      label: "Midjourney API",       desc: "Artistic, detailed" },
];

const IMAGE_GEN_STYLES = ["Realistic", "Clinical", "Microscopic", "Artistic", "Sketch", "Augmented"];

type GenImage = { id: number; selected: boolean; colors: string[] };

function ImageGenerationTab() {
  const [prompt,      setPrompt]      = useState("");
  const [model,       setModel]       = useState("stable-diffusion-xl");
  const [count,       setCount]       = useState("12");
  const [resolution,  setResolution]  = useState("224");
  const [style,       setStyle]       = useState("Realistic");
  const [genClass,    setGenClass]    = useState("benign");
  const [genSplit,    setGenSplit]    = useState("train");
  const [isGenerating,setIsGenerating]= useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [cfgScale,    setCfgScale]    = useState(7);
  const [steps,       setSteps]       = useState(30);
  const [generated,   setGenerated]   = useState<GenImage[]>([]);
  const [allSelected, setAllSelected] = useState(false);

  const handleGenerate = () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    setTimeout(() => {
      const imgs: GenImage[] = GEN_PLACEHOLDER_COLORS.slice(0, parseInt(count)).map((colors, i) => ({
        id: i, selected: false, colors,
      }));
      setGenerated(imgs);
      setIsGenerating(false);
    }, 2000);
  };

  const toggleImageSelect = (id: number) =>
    setGenerated((prev) => prev.map((img) => img.id === id ? { ...img, selected: !img.selected } : img));

  const toggleAll = () => {
    setAllSelected(!allSelected);
    setGenerated((prev) => prev.map((img) => ({ ...img, selected: !allSelected })));
  };

  const selectedCount = generated.filter((g) => g.selected).length;

  return (
    <div className="p-6 bg-[#F8FAFC] flex flex-col gap-5 min-w-0">

      {/* ── Configuration panel ── */}
      <div className="grid grid-cols-3 gap-5">

        {/* Prompt */}
        <div className="col-span-2 flex flex-col gap-0">
          <Card className="p-5 flex flex-col gap-4 h-full">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00775B]" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Generation Prompt</h3>
            </div>
            <div className="flex flex-col gap-1.5 flex-1">
              <Label className="text-xs text-neutral-600">Describe the images you want to generate</Label>
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g. Close-up dermoscopy image of a benign melanocytic nevus with uniform pigmentation and regular border, clinical photography..."
                className="flex-1 min-h-[100px] text-sm resize-none"
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Negative Prompt <span className="text-neutral-400">(optional)</span></Label>
              <Input placeholder="e.g. blurry, low quality, artifacts, text, watermark" className="h-9 text-sm" />
            </div>
          </Card>
        </div>

        {/* Settings */}
        <div className="flex flex-col gap-3">
          <Card className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Settings</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Model</Label>
              <Select value={model} onValueChange={setModel}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {IMAGE_GEN_MODELS.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      <span className="font-medium">{m.label}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[10px] text-neutral-400">{IMAGE_GEN_MODELS.find(m => m.id === model)?.desc}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">Count</Label>
                <Select value={count} onValueChange={setCount}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["4", "8", "12", "16", "24", "32"].map((n) => (
                      <SelectItem key={n} value={n}>{n} images</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">Resolution</Label>
                <Select value={resolution} onValueChange={setResolution}>
                  <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["224", "256", "512", "768", "1024"].map((r) => (
                      <SelectItem key={r} value={r}>{r}×{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Visual Style</Label>
              <div className="flex flex-wrap gap-1.5">
                {IMAGE_GEN_STYLES.map((s) => (
                  <button key={s} onClick={() => setStyle(s)}
                    className={cn("h-6 px-2.5 rounded-full text-[10px] font-medium border transition-all",
                      style === s
                        ? "bg-[#00775B] text-white border-[#00775B]"
                        : "bg-white text-neutral-500 border-neutral-200 hover:border-[#00775B]/40")}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </Card>

          <Card className="p-4 flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <Tag className="w-4 h-4 text-neutral-400" />
              <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Class Assignment</h3>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Assign to Class</Label>
              <Select value={genClass} onValueChange={setGenClass}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="benign">Benign</SelectItem>
                  <SelectItem value="malignant">Malignant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Add to Split</Label>
              <Select value={genSplit} onValueChange={setGenSplit}>
                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="train">Train</SelectItem>
                  <SelectItem value="val">Validation</SelectItem>
                  <SelectItem value="test">Test</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </Card>
        </div>
      </div>

      {/* Advanced settings (collapsible) */}
      <button onClick={() => setShowAdvanced(!showAdvanced)}
        className="flex items-center gap-2 text-[11px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors self-start">
        <ChevronRight className={cn("w-3.5 h-3.5 transition-transform", showAdvanced && "rotate-90")} />
        Advanced Settings
      </button>
      {showAdvanced && (
        <Card className="p-5 grid grid-cols-2 gap-5">
          {[
            { label: "CFG Scale", desc: "Higher = more prompt-adherent", value: cfgScale, min: 1, max: 20, step: 0.5, onChange: setCfgScale },
            { label: "Sampling Steps", desc: "More steps = higher quality, slower", value: steps, min: 10, max: 100, step: 5, onChange: setSteps },
          ].map(({ label, desc, value, min, max, step, onChange }) => (
            <div key={label} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-xs text-neutral-700">{label}</Label>
                  <p className="text-[10px] text-neutral-400">{desc}</p>
                </div>
                <span className="text-[13px] font-bold font-mono text-[#00775B]">{value}</span>
              </div>
              <Slider value={[value]} onValueChange={([v]) => onChange(v)} min={min} max={max} step={step}
                className="[&_.bg-primary]:bg-[#00775B] [&_.border-primary]:border-[#00775B]" />
            </div>
          ))}
        </Card>
      )}

      {/* Generate button */}
      <div className="flex items-center gap-3">
        <button onClick={handleGenerate} disabled={!prompt.trim() || isGenerating}
          className={cn(
            "flex items-center gap-2 h-10 px-6 rounded-md text-sm font-semibold text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed",
            isGenerating ? "bg-[#006649]" : "bg-[#00775B] hover:bg-[#006649]"
          )}>
          {isGenerating
            ? <><RefreshCw className="w-4 h-4 animate-spin" /> Generating…</>
            : <><Wand2 className="w-4 h-4" /> Generate {count} Images</>}
        </button>
        {generated.length > 0 && (
          <p className="text-[11px] text-neutral-400">
            {generated.length} images generated · <span className="text-[#00775B] font-medium">{selectedCount} selected</span>
          </p>
        )}
      </div>

      {/* Generated images */}
      {generated.length > 0 && (
        <Card className="overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <div className="flex items-center gap-3">
              <h3 className="text-[13px] font-semibold text-neutral-800">Generated Images</h3>
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-[#00775B] text-white text-[10px] font-bold">
                {generated.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={toggleAll}
                className="text-[11px] font-medium text-neutral-500 hover:text-neutral-700 transition-colors">
                {allSelected ? "Deselect All" : "Select All"}
              </button>
            </div>
          </div>
          <div className="p-5 grid grid-cols-6 gap-3">
            {generated.map((img) => (
              <div key={img.id}
                onClick={() => toggleImageSelect(img.id)}
                className={cn("relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-all",
                  img.selected ? "border-[#00775B] shadow-md shadow-[#00775B]/20" : "border-transparent hover:border-neutral-300")}>
                <div className="w-full h-full"
                  style={{ background: `radial-gradient(circle at 45% 40%, ${img.colors[0]}, ${img.colors[1]})` }}>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full opacity-50"
                      style={{ width: "55%", height: "55%", background: `radial-gradient(circle, rgba(255,255,255,0.05), transparent)` }} />
                  </div>
                </div>
                {img.selected && (
                  <div className="absolute inset-0 bg-[#00775B]/15 flex items-start justify-end p-1.5">
                    <div className="w-5 h-5 rounded-full bg-[#00775B] flex items-center justify-center shadow">
                      <CheckCircle className="w-3 h-3 text-white" />
                    </div>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 px-1.5 py-1 bg-black/40">
                  <p className="text-[9px] font-mono text-white/80">gen_{String(img.id + 1).padStart(3, "0")}.png</p>
                </div>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between px-5 py-3.5 border-t border-neutral-100 bg-neutral-50/50">
            <div className="flex items-center gap-2">
              <span className={cn("text-[12px]", selectedCount > 0 ? "text-neutral-700 font-medium" : "text-neutral-400")}>
                {selectedCount > 0 ? `${selectedCount} image${selectedCount > 1 ? "s" : ""} selected` : "Select images to add to dataset"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button disabled={selectedCount === 0}
                className="flex items-center gap-2 h-8 px-4 rounded-md border border-neutral-200 text-[12px] font-medium text-neutral-600 hover:bg-neutral-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Download className="w-3.5 h-3.5" /> Download
              </button>
              <button disabled={selectedCount === 0}
                className="flex items-center gap-2 h-8 px-4 rounded-md border border-red-200 text-[12px] font-medium text-red-500 hover:bg-red-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Discard
              </button>
              <button disabled={selectedCount === 0}
                className="flex items-center gap-2 h-8 px-4 rounded-md bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                <Plus className="w-3.5 h-3.5" /> Add to Dataset
              </button>
            </div>
          </div>
        </Card>
      )}

      {/* Empty prompt state */}
      {generated.length === 0 && !isGenerating && (
        <Card className="py-16 flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-full bg-[#00775B]/10 flex items-center justify-center">
            <Wand2 className="w-7 h-7 text-[#00775B]" />
          </div>
          <p className="text-[13px] font-semibold text-neutral-600">Generate synthetic training data</p>
          <p className="text-[12px] text-neutral-400 text-center max-w-sm">
            Use AI to create additional labelled images for your dataset. Write a detailed prompt and click Generate.
          </p>
        </Card>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN — DatasetDetail
// ═══════════════════════════════════════════════════════════════════════════════

interface DatasetDetailProps {
  dataset: Dataset;
  onBack: () => void;
}

export function DatasetDetail({ dataset, onBack }: DatasetDetailProps) {
  const [activeTab, setActiveTab] = useState<DsTab>("summary");

  return (
    <div className="flex flex-col h-full min-w-0">

      {/* Breadcrumb + Tab bar */}
      <div className="bg-white border-b border-neutral-200">
        {/* Back + name */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-neutral-100">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-[#00775B] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Datasets</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-[12px] font-semibold text-neutral-800">{dataset.name}</span>
          <span className="inline-flex items-center h-5 px-2 rounded-full bg-neutral-100 text-neutral-500 text-[10px] font-mono font-semibold ml-1">
            {DETAIL.version}
          </span>
        </div>

        {/* Horizontal tab bar */}
        <div className="flex items-center overflow-x-auto px-2">
          {TABS.map(({ id, label }) => (
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

      {/* Status bar */}
      <StatusBar dataset={dataset} />

      {/* Info banner */}
      <div className="flex items-center gap-2 px-5 py-2 bg-sky-50 border-b border-sky-100 text-[11px] text-sky-700">
        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
        Dataset version is frozen.
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-y-auto min-w-0">
        {activeTab === "summary"      && <SummaryTab       dataset={dataset} />}
        {activeTab === "add-data"     && <AddDataTab />}
        {activeTab === "analysis"     && <AnalysisTab />}
        {activeTab === "splitting"    && <DataSplittingTab dataset={dataset} />}
        {activeTab === "preview"      && <PreviewTab />}
        {activeTab === "annotation"   && <AnnotationTab />}
        {activeTab === "augmentation" && <AugmentationTab />}
        {activeTab === "image-gen"    && <ImageGenerationTab />}
      </div>
    </div>
  );
}
