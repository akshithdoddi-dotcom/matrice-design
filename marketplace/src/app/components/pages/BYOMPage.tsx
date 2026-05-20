import { useState, useMemo } from "react";
import { ChevronRight, RefreshCw, Pencil, Trash2, X } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { StatusCapsule, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";
import { FilterDropdown } from "@fe-common/components/ui/FilterDropdown";
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

// ─── Column helpers ───────────────────────────────────────────────────────────

const fl  = (flex: number, minWidth: number) => ({ flex, minWidth, overflow: "hidden" as const });
const fx  = (width: number) => ({ width, flexShrink: 0 as const });

const MF = {
  cb:      fx(36),
  name:    fl(2.5, 140),
  status:  fx(92),
  input:   fl(1,   70),
  output:  fl(1.5, 95),
  fw:      fl(1.5, 90),
  fmt:     fl(1,   75),
  sdk:     fl(1,   65),
  count:   fx(62),
  year:    fx(82),
  priv:    fx(70),
  user:    fl(1.5, 95),
  account: fl(1.5, 95),
  created: fl(1.5, 105),
  updated: fl(1.5, 105),
  actions: fx(68),
};

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

const ColHdr = ({ style, children }: { style?: React.CSSProperties; children: React.ReactNode }) => (
  <div style={style}><span style={HDR}>{children}</span></div>
);

const TxtCell = ({ value, mono, color, hovered, hoveredColor, fontSize = 11, truncate = true }: {
  value: string; mono?: boolean; color?: string; hovered: boolean;
  hoveredColor?: string; fontSize?: number; truncate?: boolean;
}) => (
  <span style={{
    ...( mono ? MONO : INTER ), fontSize,
    color: hovered ? (hoveredColor ?? "#334155") : (color ?? "#64748B"),
    display: truncate ? "block" : undefined,
    whiteSpace: truncate ? "nowrap" : undefined,
    overflow: truncate ? "hidden" : undefined,
    textOverflow: truncate ? "ellipsis" : undefined,
  }}>{value}</span>
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

// ─── ModelFamilyRow ───────────────────────────────────────────────────────────

function ModelFamilyRow({ family }: { family: ModelFamily }) {
  const [open, setOpen] = useState(family.id === "mf-01");
  const [hov,  setHov]  = useState(false);
  const rowBg = hov ? "#EBF5F1" : "#ffffff";

  return (
    <div>
      {/* ── Main row ───────────────────────────────────────────────────────── */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", minHeight: 44,
          backgroundColor: rowBg, borderBottom: "1px solid #F1F5F9",
          position: "relative", transition: "background-color 100ms ease",
        }}
      >
        {/* Teal left strip */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
          backgroundColor: TEAL, opacity: hov || open ? 1 : 0,
          transition: "opacity 100ms ease",
        }} />

        {/* Checkbox placeholder */}
        <div style={{ ...fx(36), display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
          <div style={{
            width: 14, height: 14, borderRadius: 3,
            border: "1.5px solid #CBD5E1", backgroundColor: "#fff",
          }} />
        </div>

        {/* Name + expand */}
        <div style={{ ...fl(2.5, 140), display: "flex", alignItems: "center", gap: 6, paddingRight: 8, height: "100%", minHeight: 44, backgroundColor: rowBg, transition: "background-color 100ms ease" }}>
          <button
            onClick={() => setOpen(p => !p)}
            style={{
              width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center",
              border: "none", background: "transparent", cursor: "pointer", padding: 0, flexShrink: 0,
              color: hov ? "#64748B" : "#CBD5E1", transition: "color 120ms ease",
            }}
          >
            <ChevronRight style={{ width: 12, height: 12, transition: "transform 150ms ease", transform: open ? "rotate(90deg)" : "none" }} />
          </button>
          <span style={{ ...INTER, fontWeight: hov ? 700 : 600, color: hov ? "#0F172A" : "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", fontSize: 12, transition: "color 100ms ease" }}>
            {family.name}
          </span>
        </div>

        {/* Status */}
        <div style={{ ...fx(92), paddingLeft: 8, paddingRight: 8 }}>
          <StatusCapsule status={STATUS_MAP[family.status]} label={STATUS_LABEL[family.status]} />
        </div>

        {/* Flex cols */}
        <div style={{ ...fl(1, 70),   paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.input} hovered={hov} /></div>
        <div style={{ ...fl(1.5, 95), paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.output} hovered={hov} /></div>
        <div style={{ ...fl(1.5, 90), paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.trainingFramework} hovered={hov} /></div>
        <div style={{ ...fl(1, 75),   paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.inputFormat} mono hovered={hov} /></div>
        <div style={{ ...fl(1, 65),   paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.sdkVersion} mono hovered={hov} /></div>

        {/* Fixed cols */}
        <div style={{ ...fx(62), paddingLeft: 8, paddingRight: 8, textAlign: "center" }}>
          <span style={{ ...MONO, color: hov ? "#0F172A" : "#475569", fontWeight: 600 }}>{family.modelCount}</span>
        </div>
        <div style={{ ...fx(82), paddingLeft: 8, paddingRight: 8, textAlign: "center" }}>
          <span style={{ ...MONO, color: hov ? "#334155" : "#64748B" }}>{family.releaseYear}</span>
        </div>
        <div style={{ ...fx(70), paddingLeft: 8, paddingRight: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
          {family.isPrivate
            ? <span style={{ ...MONO, color: TEAL, fontWeight: 700, fontSize: 12 }}>✓</span>
            : <X style={{ width: 13, height: 13, color: "#CBD5E1" }} />}
        </div>

        {/* More flex cols */}
        <div style={{ ...fl(1.5, 95),  paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.user} hovered={hov} truncate /></div>
        <div style={{ ...fl(1.5, 95),  paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.account} mono hovered={hov} truncate /></div>
        <div style={{ ...fl(1.5, 105), paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.createdAt} mono color="#94A3B8" hoveredColor="#475569" fontSize={10} hovered={hov} /></div>
        <div style={{ ...fl(1.5, 105), paddingLeft: 8, paddingRight: 8 }}><TxtCell value={family.lastUpdated} mono color="#94A3B8" hoveredColor="#475569" fontSize={10} hovered={hov} /></div>

        {/* Actions */}
        <div style={{ ...fx(68), paddingLeft: 8, paddingRight: 12, display: "flex", justifyContent: "flex-end" }}>
          <GridActions visible={hov}>
            <GridActionButton title="Edit" hoverColor={TEAL}><Pencil className="w-3 h-3" /></GridActionButton>
            <GridActionButton title="Delete" hoverColor="#E7000B"><Trash2 className="w-3 h-3" /></GridActionButton>
          </GridActions>
        </div>
      </div>

      {/* ── Expansion panel ────────────────────────────────────────────────── */}
      {open && (
        <div style={{
          position: "sticky", left: 0, zIndex: 1,
          backgroundColor: "#F8FAFC",
          borderBottom: "1px solid rgba(0,119,91,0.15)",
          borderLeft: `3px solid ${TEAL}`,
        }}>
          {/* Panel header */}
          <div style={{
            display: "flex", alignItems: "center", gap: 10,
            paddingTop: 8, paddingBottom: 6, paddingLeft: 60, paddingRight: 16,
            borderBottom: "1px solid rgba(0,119,91,0.1)",
          }}>
            <span style={{ ...INTER, fontWeight: 700, color: "#334155" }}>Models</span>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>·</span>
            <span style={{ fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
              Includes all the models within the model family {family.name}
            </span>
            <button
              onClick={() => setOpen(false)}
              style={{
                marginLeft: "auto", display: "flex", alignItems: "center", justifyContent: "center",
                width: 20, height: 20, borderRadius: 3, border: "none", background: "transparent",
                cursor: "pointer", color: "#94A3B8",
              }}
            >
              <ChevronRight style={{ width: 12, height: 12, transform: "rotate(90deg)" }} />
            </button>
          </div>

          <div style={{ padding: "0 0 8px", overflowX: "auto" }}>
            {/* Sub-table header */}
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

            {/* Sub-table rows */}
            {family.models.map((model, si) => (
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
        </div>
      )}
    </div>
  );
}

// ─── BYOMPage ─────────────────────────────────────────────────────────────────

export function BYOMPage() {
  const [filterInput,  setFilterInput]  = useState("all");
  const [filterFW,     setFilterFW]     = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [filterOutput, setFilterOutput] = useState("all");
  const [showPrivate,  setShowPrivate]  = useState(false);

  const filtered = useMemo(() => {
    return MOCK_FAMILIES.filter(f => {
      if (filterInput  !== "all" && f.input              !== filterInput)  return false;
      if (filterFW     !== "all" && f.trainingFramework  !== filterFW)     return false;
      if (filterStatus !== "all" && f.status             !== filterStatus) return false;
      if (filterOutput !== "all" && f.output             !== filterOutput) return false;
      if (showPrivate  && !f.isPrivate) return false;
      return true;
    });
  }, [filterInput, filterFW, filterStatus, filterOutput, showPrivate]);

  const inputTypes    = [...new Set(MOCK_FAMILIES.map(f => f.input))];
  const frameworks    = [...new Set(MOCK_FAMILIES.map(f => f.trainingFramework))];
  const outputTypes   = [...new Set(MOCK_FAMILIES.map(f => f.output))];
  const statusOptions = ["approved", "in-review", "rejected", "draft"];

  return (
    <div className="flex flex-col gap-6 min-w-0">

      {/* ── Stat cards ────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* ── Charts ────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <SectionCard>
          <div className="px-5 py-4 border-b border-neutral-100">
            <h3 className="text-[13px] font-semibold text-neutral-800">Parameters vs Model Count</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Total Model Count: {MOCK_FAMILIES.reduce((a, f) => a + f.modelCount, 0)}</p>
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
      <SectionCard>
        {/* Card header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div>
            <h2 className="text-[13px] font-semibold text-neutral-800">Model Families</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">{filtered.length} of {MOCK_FAMILIES.length} families</p>
          </div>
          <button className="p-1.5 rounded-[4px] border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2.5 px-5 py-3 border-b border-neutral-100 bg-neutral-50/50 flex-wrap">
          <FilterDropdown
            label="Input Type" className="w-40"
            options={[{ value: "all", label: "All Input Types" }, ...inputTypes.map(v => ({ value: v, label: v }))]}
            value={filterInput} onValueChange={setFilterInput}
          />
          <FilterDropdown
            label="Training Framework" className="w-44"
            options={[{ value: "all", label: "All Frameworks" }, ...frameworks.map(v => ({ value: v, label: v }))]}
            value={filterFW} onValueChange={setFilterFW}
          />
          <FilterDropdown
            label="Status" className="w-36"
            options={[{ value: "all", label: "All Statuses" }, ...statusOptions.map(v => ({ value: v, label: STATUS_LABEL[v as MFStatus] }))]}
            value={filterStatus} onValueChange={setFilterStatus}
          />
          <FilterDropdown
            label="Model Type" className="w-44"
            options={[{ value: "all", label: "All Model Types" }, ...outputTypes.map(v => ({ value: v, label: v }))]}
            value={filterOutput} onValueChange={setFilterOutput}
          />
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-[11px] font-medium text-neutral-500 uppercase tracking-wide">Private Models</span>
            <ToggleSwitch checked={showPrivate} onChange={setShowPrivate} />
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <div style={{ minWidth: 1280 }}>
            {/* Column headers */}
            <div style={{
              display: "flex", alignItems: "center", height: 40,
              backgroundColor: "#F8FAFC", borderBottom: "1px solid #E2E8F0",
            }}>
              <ColHdr style={{ ...fx(36), paddingLeft: 10 }}><span /></ColHdr>
              <ColHdr style={{ ...fl(2.5, 140), paddingLeft: 6, paddingRight: 8 }}>Name</ColHdr>
              <ColHdr style={{ ...fx(92), paddingLeft: 8, paddingRight: 8 }}>Status</ColHdr>
              <ColHdr style={{ ...fl(1, 70),    paddingLeft: 8, paddingRight: 8 }}>Input</ColHdr>
              <ColHdr style={{ ...fl(1.5, 95),  paddingLeft: 8, paddingRight: 8 }}>Output</ColHdr>
              <ColHdr style={{ ...fl(1.5, 90),  paddingLeft: 8, paddingRight: 8 }}>Training Fr.</ColHdr>
              <ColHdr style={{ ...fl(1, 75),    paddingLeft: 8, paddingRight: 8 }}>Input Format</ColHdr>
              <ColHdr style={{ ...fl(1, 65),    paddingLeft: 8, paddingRight: 8 }}>SDK Ver.</ColHdr>
              <ColHdr style={{ ...fx(62), paddingLeft: 8, paddingRight: 8, textAlign: "center" as const }}>#Models</ColHdr>
              <ColHdr style={{ ...fx(82), paddingLeft: 8, paddingRight: 8, textAlign: "center" as const }}>Release Yr.</ColHdr>
              <ColHdr style={{ ...fx(70), paddingLeft: 8, paddingRight: 8, textAlign: "center" as const }}>Private</ColHdr>
              <ColHdr style={{ ...fl(1.5, 95),  paddingLeft: 8, paddingRight: 8 }}>User</ColHdr>
              <ColHdr style={{ ...fl(1.5, 95),  paddingLeft: 8, paddingRight: 8 }}>Account</ColHdr>
              <ColHdr style={{ ...fl(1.5, 105), paddingLeft: 8, paddingRight: 8 }}>Created At</ColHdr>
              <ColHdr style={{ ...fl(1.5, 105), paddingLeft: 8, paddingRight: 8 }}>Last Updated</ColHdr>
              <ColHdr style={{ ...fx(68), paddingLeft: 8, paddingRight: 12 }}> </ColHdr>
            </div>

            {/* Rows */}
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 gap-1.5">
                <p className="text-[13px] font-semibold text-neutral-600">No model families found</p>
                <p className="text-[11px] text-neutral-400">Try adjusting your filters</p>
              </div>
            ) : (
              filtered.map((f) => <ModelFamilyRow key={f.id} family={f} />)
            )}
          </div>
        </div>
      </SectionCard>

    </div>
  );
}
