import { useState, type Dispatch, type SetStateAction } from "react";
import {
  LayoutGrid, List, Plus, ArrowLeft, ChevronRight,
  Upload, X, AlertCircle, ExternalLink, Eye, Trash2,
  Pencil, BookOpen, Download, Check,
} from "lucide-react";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, StatusCapsule, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";
import { V23Table, V23Mono, V23Inter } from "@fe-common/components/ui/V23Table";
import { Label } from "@fe-common/components/ui/label";
import { Input } from "@fe-common/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe-common/components/ui/select";
import { Textarea } from "@fe-common/components/ui/textarea";
import { Switch } from "@fe-common/components/ui/switch";
import { cn } from "@/app/lib/utils";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const titleCase = (s: string) =>
  s.toLowerCase().replace(/(^|\s|\/)\w/g, (c) => c.toUpperCase());

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";
const COLOR_PALETTE = ["#00775B", "#D97706", "#0284C7", "#DC2626", "#7C3AED", "#DB2777", "#059669", "#EA580C"];

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "published" | "in-review" | "created" | "rejected";
type AppStage = "Alpha" | "Beta" | "Stable";
type VersionStatus = "published" | "draft" | "deprecated";

type AppVersion = {
  version: string;
  status: VersionStatus;
  lastUpdated: string;
  owner: string;
  modelCount: number;
};

// ─── Version metadata row types (shared by Add Version / Update Version) ──────

type CategoryRow = { id: string; name: string; classes: string };
type MetricRow = { id: string; name: string; value: string };
type BenchmarkRow = { id: string; hardware: string; latencyMs: string; throughputFps: string };

type Resource = {
  label: string;
  type: "notebook" | "article";
};

type Application = {
  id: string;
  name: string;
  description: string;
  status: AppStatus;
  stage: AppStage;
  category: string;
  industries: string[];
  tags: string[];
  url: string;
  updatedAt: string;
  versions: number;
  issueCount: number;
  image?: string;
  objects: string;
  resources: Resource[];
  versionHistory: AppVersion[];
  // Update Application form fields — optional so existing MOCK_APPS literals don't need updating
  projectType?: string;
  blogLinks?: string;
  appType?: "Standard" | "Enterprise" | "Custom";
  releaseStage?: "Public" | "Private" | "Internal";
  notebookLink?: string;
  serverType?: "None" | "Dedicated CPU" | "Dedicated GPU";
  featured?: boolean;
};

type ReportedIssue = {
  id: string;
  appName: string;
  version: string;
  issueType: string;
  subIssue: string;
  status: "open" | "resolved" | "in-progress";
  reportCount: number;
  createdAt: string;
  updatedAt: string;
};

// ─── Mock Data ────────────────────────────────────────────────────────────────

const MOCK_APPS: Application[] = [
  { id: "app-001", name: "PPE COMPLIANCE DETECTION",    description: "Detects missing personal protective equipment on workers in real-time, including helmets, vests, and gloves. Triggers instant alerts to safety supervisors.",         status: "published", stage: "Stable", category: "SAFETY",              industries: ["Oil & Gas", "Manufacturing"],  tags: ["detection", "safety"],     url: "https://dev.app.matrice.ai/publish/app-001", updatedAt: "May 11, 2026",  versions: 2, issueCount: 2, image: "/unauthorized-entry.png",
    objects: "Helmet, Vest, Gloves",
    resources: [{ label: "Python Notebook", type: "notebook" }, { label: "Deployment Guide", type: "article" }],
    versionHistory: [
      { version: "v1.0", status: "deprecated", lastUpdated: "Jan 20, 2026", owner: "Pathikreet Chowdhury", modelCount: 1 },
      { version: "v1.1", status: "published",  lastUpdated: "May 11, 2026", owner: "Pathikreet Chowdhury", modelCount: 2 },
    ] },
  { id: "app-002", name: "BAGGAGE THREAT SCREENING",    description: "AI-powered detection of prohibited items and potential threats in baggage at checkpoints. Flags anomalies for security personnel review with confidence scores.",       status: "in-review", stage: "Beta", category: "SECURITY",            industries: ["Airport", "Transportation"],   tags: ["detection", "security"],   url: "",                                          updatedAt: "Jan 12, 2026",  versions: 1, issueCount: 2, image: "/abandoned-object.png",
    objects: "Bag, Prohibited Item",
    resources: [{ label: "Python Notebook", type: "notebook" }],
    versionHistory: [
      { version: "v1.0", status: "draft", lastUpdated: "Jan 12, 2026", owner: "Ananya Rao", modelCount: 1 },
    ] },
  { id: "app-003", name: "PEOPLE COUNTING & FLOW",      description: "Accurately counts and tracks the flow of people entering, exiting, and moving across zones. Provides occupancy analytics and crowd density heatmaps in real-time.",   status: "published", stage: "Stable", category: "ANALYTICS",           industries: ["Retail", "Mall", "Airport"],   tags: ["counting", "tracking"],   url: "https://dev.app.matrice.ai/publish/686d0ece378", updatedAt: "Nov 13, 2025", versions: 3, issueCount: 2, image: "/queue-overcrowding.png",
    objects: "Person",
    resources: [{ label: "Python Notebook", type: "notebook" }, { label: "Use Case Article", type: "article" }],
    versionHistory: [
      { version: "v1.0", status: "deprecated", lastUpdated: "Feb 2, 2025",  owner: "Suresh Iyer", modelCount: 1 },
      { version: "v1.1", status: "deprecated", lastUpdated: "Jul 18, 2025", owner: "Suresh Iyer", modelCount: 1 },
      { version: "v1.2", status: "published",  lastUpdated: "Nov 13, 2025", owner: "Suresh Iyer", modelCount: 2 },
    ] },
  { id: "app-004", name: "VEHICLE LICENSE PLATE OCR",   description: "Reads and logs vehicle license plates at entry and exit points. Integrates with access control systems to automate gate operations and maintain vehicle logs.",       status: "published", stage: "Stable", category: "ACCESS CONTROL",      industries: ["Corporate", "Manufacturing"], tags: ["ocr", "vehicle"],          url: "https://dev.app.matrice.ai/publish/886d0ece378", updatedAt: "May 8, 2026",  versions: 2, issueCount: 1, image: "/vehicle-accident.png",
    objects: "License Plate, Vehicle",
    resources: [{ label: "Python Notebook", type: "notebook" }],
    versionHistory: [
      { version: "v1.0", status: "deprecated", lastUpdated: "Oct 4, 2025", owner: "Meera Nair", modelCount: 1 },
      { version: "v1.1", status: "published",  lastUpdated: "May 8, 2026", owner: "Meera Nair", modelCount: 1 },
    ] },
  { id: "app-005", name: "FORKLIFT PROXIMITY ALERT",    description: "Monitors safe distances between forklifts and pedestrians on the warehouse floor. Emits audio-visual warnings when proximity thresholds are breached.",              status: "created",   stage: "Alpha", category: "SAFETY",              industries: ["Manufacturing", "Logistics"],  tags: ["proximity", "safety"],    url: "",                                          updatedAt: "Jul 15, 2025",  versions: 0, issueCount: 0, image: "/panic-movement.png",
    objects: "Not configured",
    resources: [],
    versionHistory: [] },
  { id: "app-006", name: "SHELF STOCK MONITOR",         description: "Automatically detects empty or low-stock shelves using ceiling cameras and notifies store staff. Reduces out-of-stock incidents and improves replenishment speed.",   status: "created",   stage: "Alpha", category: "RETAIL ANALYTICS",   industries: ["Retail", "Grocery"],          tags: ["inventory", "retail"],    url: "",                                          updatedAt: "Jul 16, 2025",  versions: 0, issueCount: 0, image: "/theft-shoplifting.png",
    objects: "Not configured",
    resources: [],
    versionHistory: [] },
  { id: "app-007", name: "FIRE & SMOKE DETECTION",      description: "Early detection of fire and smoke across camera feeds using thermal and visual analysis. Integrates with alarm systems for automated emergency response triggers.",   status: "in-review", stage: "Beta", category: "SAFETY",              industries: ["Healthcare", "Construction"],  tags: ["fire", "safety"],         url: "",                                          updatedAt: "Jul 28, 2025",  versions: 1, issueCount: 1, image: "/fire-smoke.png",
    objects: "Fire, Smoke",
    resources: [{ label: "Python Notebook", type: "notebook" }],
    versionHistory: [
      { version: "v1.0", status: "draft", lastUpdated: "Jul 28, 2025", owner: "Ananya Rao", modelCount: 1 },
    ] },
  { id: "app-008", name: "CUSTOMER QUEUE ANALYTICS",    description: "Measures queue lengths and estimated wait times at checkout counters and service desks. Provides actionable staffing insights to reduce customer wait times.",        status: "created",   stage: "Alpha", category: "ANALYTICS",           industries: ["Retail", "Hospitality"],       tags: ["queue", "analytics"],     url: "",                                          updatedAt: "Jul 23, 2025",  versions: 0, issueCount: 0, image: "/crowd-surge.png",
    objects: "Not configured",
    resources: [],
    versionHistory: [] },
];

const MOCK_ISSUES: ReportedIssue[] = [
  { id: "iss-001", appName: "PPE COMPLIANCE DETECTION",    version: "v1.0", issueType: "Model Output", subIssue: "Missed Detections in Low Light",  status: "resolved",    reportCount: 4, createdAt: "2026-02-10", updatedAt: "2026-03-01" },
  { id: "iss-002", appName: "PPE COMPLIANCE DETECTION",    version: "v1.1", issueType: "UI / UX",       subIssue: "Alert Banner Overlaps Feed",      status: "open",        reportCount: 2, createdAt: "2026-05-15", updatedAt: "2026-05-20" },
  { id: "iss-003", appName: "BAGGAGE THREAT SCREENING",    version: "v1.0", issueType: "Model Output",  subIssue: "False Positive Rate High",        status: "open",        reportCount: 3, createdAt: "2026-04-20", updatedAt: "2026-05-01" },
  { id: "iss-004", appName: "BAGGAGE THREAT SCREENING",    version: "v1.0", issueType: "Performance",   subIssue: "High Inference Latency",          status: "in-progress", reportCount: 1, createdAt: "2026-05-02", updatedAt: "2026-05-08" },
  { id: "iss-005", appName: "PEOPLE COUNTING & FLOW",      version: "v1.2", issueType: "Crash",         subIssue: "Service Restart Under Heavy Load", status: "in-progress", reportCount: 5, createdAt: "2026-06-01", updatedAt: "2026-06-10" },
  { id: "iss-006", appName: "PEOPLE COUNTING & FLOW",      version: "v1.1", issueType: "Model Output",  subIssue: "Overcounting in Dense Crowds",     status: "resolved",    reportCount: 2, createdAt: "2025-09-12", updatedAt: "2025-10-01" },
  { id: "iss-007", appName: "VEHICLE LICENSE PLATE OCR",   version: "v1.1", issueType: "Model Output",  subIssue: "Misreads on Non-Standard Plates",  status: "open",        reportCount: 6, createdAt: "2026-05-25", updatedAt: "2026-06-02" },
  { id: "iss-008", appName: "FIRE & SMOKE DETECTION",      version: "v1.0", issueType: "Performance",   subIssue: "Delayed Alert Trigger",            status: "open",        reportCount: 2, createdAt: "2026-06-15", updatedAt: "2026-06-18" },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS: StatCardData[] = [
  { label: "Total Applications", value: "8",  sublabel: "All Published & Draft", num: "+2",  ref_: "vs Last Month",  dir: "up",     chip: "TOTAL",    color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Published",          value: "3",  sublabel: "Live on Marketplace",   num: "+1",  ref_: "vs Last Month",  dir: "up",     chip: "LIVE",     color: TEAL,      bgColor: "#E5FFF9" },
  { label: "In Review",          value: "2",  sublabel: "Awaiting Approval",     num: "0",   ref_: "No Change",      dir: "neutral",chip: "REVIEW",   color: "#D97706", bgColor: "#FFFBEB" },
  { label: "Issues Reported",    value: "8",  sublabel: "Open Across All Apps",  num: "+6",  ref_: "vs Last Week",   dir: "up",     chip: "ISSUES",   color: "#DC2626", bgColor: "#FEF2F2" },
];

// ─── Status helpers ───────────────────────────────────────────────────────────

const STATUS_DOT: Record<AppStatus, string> = {
  published: "#16A34A",
  "in-review": "#D97706",
  created: "#94A3B8",
  rejected: "#DC2626",
};
const STATUS_LABEL: Record<AppStatus, string> = {
  published: "PUBLISHED",
  "in-review": "IN-REVIEW",
  created: "CREATED",
  rejected: "REJECTED",
};
const ISSUE_STATUS_KEY: Record<ReportedIssue["status"], string>   = { open: "critical", "in-progress": "active", resolved: "success" };
const ISSUE_STATUS_LABEL: Record<ReportedIssue["status"], string> = { open: "Open",     "in-progress": "In Progress", resolved: "Resolved" };

const VERSION_STATUS_KEY: Record<VersionStatus, string>   = { published: "success", draft: "active", deprecated: "offline" };
const VERSION_STATUS_LABEL: Record<VersionStatus, string> = { published: "Published", draft: "Draft", deprecated: "Deprecated" };

// ─── App card thumbnail ───────────────────────────────────────────────────────

const THUMBNAIL_THEMES: Record<AppStatus, { bg: string; grid: string; accent: string }> = {
  published:  { bg: "#021f15", grid: "#00ff88", accent: "#00775B" },
  "in-review":{ bg: "#1c1400", grid: "#ffd166", accent: "#D97706" },
  created:    { bg: "#0d1624", grid: "#60a5fa", accent: "#0284C7" },
  rejected:   { bg: "#1c0505", grid: "#f87171", accent: "#DC2626" },
};

function AppThumbnail({ status, name, image }: { status: AppStatus; name: string; image?: string }) {
  const t = THUMBNAIL_THEMES[status];
  const initials = name.split(" ").slice(0, 2).map(w => w[0]).join("").toUpperCase();

  if (image) {
    return (
      <div className="w-full h-36 relative overflow-hidden flex-shrink-0">
        <img src={image} alt={name} className="absolute inset-0 w-full h-full object-cover object-center" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT[status] }} />
      </div>
    );
  }

  return (
    <div className="w-full h-36 relative overflow-hidden flex-shrink-0 flex items-center justify-center" style={{ backgroundColor: t.bg }}>
      <div className="absolute inset-0" style={{ backgroundImage: `radial-gradient(${t.grid}28 1px, transparent 1px)`, backgroundSize: "20px 20px" }} />
      <div className="absolute inset-0 opacity-20" style={{ background: `radial-gradient(ellipse at 50% 60%, ${t.accent}80, transparent 70%)` }} />
      <div className="relative z-10 w-14 h-14 rounded-[8px] flex items-center justify-center text-[18px] font-black tracking-tight text-white/90"
        style={{ backgroundColor: t.accent + "33", border: `1.5px solid ${t.accent}60` }}>
        {initials || "AI"}
      </div>
      <div className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT[status] }} />
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function AppCard({ app, onClick }: { app: Application; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[6px] border border-neutral-200 overflow-hidden flex flex-col cursor-pointer hover:border-[#00775B]/50 hover:shadow-lg transition-all group"
    >
      <AppThumbnail status={app.status} name={app.name} image={app.image} />

      <div className="p-4 flex flex-col gap-3 flex-1">
        {/* Category + issue badge */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-sm" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
            {app.category}
          </span>
          {app.issueCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-sm">
              <AlertCircle className="w-2.5 h-2.5" /> {app.issueCount} issue{app.issueCount > 1 ? "s" : ""}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-[13px] font-bold text-neutral-900 leading-snug group-hover:text-[#00775B] transition-colors line-clamp-2">
          {titleCase(app.name)}
        </h3>

        {/* Description */}
        <p className="text-[11px] text-neutral-500 leading-relaxed line-clamp-2 flex-1">
          {app.description || "No description provided."}
        </p>

        {/* Footer: status + meta */}
        <div className="flex items-center justify-between pt-1 border-t border-neutral-100 mt-auto">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[app.status] }} />
            <span className="text-[10px] font-bold tracking-wide" style={{ color: STATUS_DOT[app.status] }}>
              {STATUS_LABEL[app.status]}
            </span>
          </div>
          <span className="text-[9px] text-neutral-400 font-mono">{app.updatedAt}</span>
        </div>

        {/* Industry tags */}
        {app.industries.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {app.industries.map((ind) => (
              <span key={ind} className="text-[9px] font-semibold uppercase tracking-wide px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-sm">
                {ind}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── App list row ─────────────────────────────────────────────────────────────

function AppListRow({ app, onClick }: { app: Application; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-5 py-3 border-b border-neutral-100 hover:bg-neutral-50 transition-colors cursor-pointer"
    >
      <div className="w-10 h-10 rounded-[4px] overflow-hidden flex-shrink-0" style={{ backgroundColor: "#004d38" }}>
        <AppThumbnail status={app.status} name={app.name} image={app.image} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-neutral-900">{titleCase(app.name)}</span>
          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>{app.category}</span>
        </div>
        <p className="text-[11px] text-neutral-400 truncate mt-0.5">{app.description || "—"}</p>
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {app.industries.map((ind) => (
          <span key={ind} className="text-[9px] font-semibold uppercase px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-sm">{ind}</span>
        ))}
      </div>
      <div className="flex items-center gap-1.5 w-28 flex-shrink-0">
        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[app.status] }} />
        <span className="text-[10px] font-bold" style={{ color: STATUS_DOT[app.status] }}>{STATUS_LABEL[app.status]}</span>
      </div>
      <span className="text-[10px] text-neutral-400 font-mono w-28 text-right flex-shrink-0">{app.updatedAt}</span>
      <ChevronRight className="w-4 h-4 text-neutral-300 flex-shrink-0" />
    </div>
  );
}

// ─── Create Application Modal ─────────────────────────────────────────────────

function CreateApplicationModal({ onClose, onCreate }: { onClose: () => void; onCreate: (name: string) => void }) {
  const [name,       setName]       = useState("");
  const [industries, setIndustries] = useState("");
  const [categories, setCategories] = useState("");
  const [projectType,setProjectType]= useState("");
  const [blogLinks,  setBlogLinks]  = useState("");
  const [dragging,   setDragging]   = useState(false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-neutral-900">Create Application</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Application Name</Label>
            <Input placeholder="e.g. PPE Detection" value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Industries</Label>
              <Select value={industries} onValueChange={setIndustries}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select Industries" /></SelectTrigger>
                <SelectContent>
                  {["Oil & Gas", "Automotive", "Airport", "Manufacturing", "Retail", "Agriculture", "Cafe", "Healthcare"].map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Categories</Label>
              <Select value={categories} onValueChange={setCategories}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select Categories" /></SelectTrigger>
                <SelectContent>
                  {["Application Insight", "Safety", "Compliance", "Access Control", "Tracking", "Analytics"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Project Type</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select Project Type" /></SelectTrigger>
              <SelectContent>
                {["Object Detection", "Classification", "Segmentation", "Pose Estimation", "OCR", "Anomaly Detection"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image Upload */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => { e.preventDefault(); setDragging(false); }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 py-8 rounded-[4px] border-2 border-dashed transition-colors cursor-pointer",
              dragging ? "border-[#00775B] bg-[#00775B]/5" : "border-[#00775B]/40 bg-neutral-50/60"
            )}
          >
            <div className="w-12 h-12 rounded-full bg-[#E5FFF9] flex items-center justify-center">
              <Upload className="w-5 h-5 text-[#00775B]" />
            </div>
            <div className="text-center">
              <p className="text-[13px] font-semibold text-neutral-700">Drag and Drop an image here</p>
              <p className="text-[11px] text-neutral-400 mt-0.5">Supported formats: .jpeg, .png</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Blog Links</Label>
            <Input placeholder="https://blog.matrice.ai/..." value={blogLinks} onChange={(e) => setBlogLinks(e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="h-9 px-5 text-[12px] font-semibold uppercase tracking-wide text-neutral-600 hover:text-neutral-800 transition-colors mr-2">
            Cancel
          </button>
          <button
            disabled={!name}
            onClick={() => { onCreate(name); onClose(); }}
            className="h-9 px-7 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: TEAL }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── File chooser field (shared across version-metadata + demo forms) ─────────

function FileChooserField({
  label, subtitle, file, onChange, id,
}: { label: string; subtitle?: string; file: File | null; onChange: (f: File | null) => void; id: string }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs text-neutral-600">{label}</Label>
      {subtitle && <p className="text-[11px] text-neutral-400 -mt-1">{subtitle}</p>}
      <div className="flex items-center gap-3">
        <label
          htmlFor={id}
          className="h-9 px-4 text-[11px] font-semibold text-neutral-700 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors cursor-pointer flex items-center gap-1.5 flex-shrink-0"
        >
          <Upload className="w-3.5 h-3.5" /> Choose File
        </label>
        <input
          id={id}
          type="file"
          accept=".json"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />
        <span className="text-[11px] text-neutral-400 truncate">{file?.name ?? "No file chosen"}</span>
      </div>
    </div>
  );
}

// ─── Shared version-metadata fields (used by Add Version + Update Version) ────

function VersionMetadataFields({
  objects, setObjects,
  categories, setCategories,
  metrics, setMetrics,
  publishedBenchmarks, setPublishedBenchmarks,
  internalBenchmarks, setInternalBenchmarks,
  analyticsJson, setAnalyticsJson,
  dashboardJson, setDashboardJson,
  incidentTypes, setIncidentTypes,
  vlmPrompt, setVlmPrompt,
}: {
  objects: string; setObjects: Dispatch<SetStateAction<string>>;
  categories: CategoryRow[]; setCategories: Dispatch<SetStateAction<CategoryRow[]>>;
  metrics: MetricRow[]; setMetrics: Dispatch<SetStateAction<MetricRow[]>>;
  publishedBenchmarks: BenchmarkRow[]; setPublishedBenchmarks: Dispatch<SetStateAction<BenchmarkRow[]>>;
  internalBenchmarks: BenchmarkRow[]; setInternalBenchmarks: Dispatch<SetStateAction<BenchmarkRow[]>>;
  analyticsJson: File | null; setAnalyticsJson: Dispatch<SetStateAction<File | null>>;
  dashboardJson: File | null; setDashboardJson: Dispatch<SetStateAction<File | null>>;
  incidentTypes: string; setIncidentTypes: Dispatch<SetStateAction<string>>;
  vlmPrompt: string; setVlmPrompt: Dispatch<SetStateAction<string>>;
}) {
  const addCategory = () => setCategories(p => [...p, { id: Date.now().toString() + Math.random(), name: "", classes: "" }]);
  const addMetric = () => setMetrics(p => [...p, { id: Date.now().toString() + Math.random(), name: "", value: "" }]);
  const addBenchmark = (setter: Dispatch<SetStateAction<BenchmarkRow[]>>) =>
    setter(p => [...p, { id: Date.now().toString() + Math.random(), hardware: "", latencyMs: "", throughputFps: "" }]);

  const BenchmarkList = ({
    title, rows, setRows,
  }: { title: string; rows: BenchmarkRow[]; setRows: Dispatch<SetStateAction<BenchmarkRow[]>> }) => (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-neutral-600">{title}</Label>
        <button onClick={() => addBenchmark(setRows)} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors" style={{ color: TEAL }}>
          <Plus className="w-3.5 h-3.5" /> Add Benchmark
        </button>
      </div>
      <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
        {rows.length === 0 ? (
          <div className="px-4 py-4 text-[11px] text-neutral-400">No benchmarks added.</div>
        ) : (
          <div className="divide-y divide-neutral-100">
            {rows.map((row, i) => (
              <div key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                <input
                  value={row.hardware}
                  onChange={(e) => setRows(p => p.map((r, j) => j === i ? { ...r, hardware: e.target.value } : r))}
                  placeholder="Hardware Name"
                  className="flex-[2] h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                />
                <input
                  value={row.latencyMs}
                  onChange={(e) => setRows(p => p.map((r, j) => j === i ? { ...r, latencyMs: e.target.value } : r))}
                  placeholder="Latency MS"
                  className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                />
                <input
                  value={row.throughputFps}
                  onChange={(e) => setRows(p => p.map((r, j) => j === i ? { ...r, throughputFps: e.target.value } : r))}
                  placeholder="Throughput FPS"
                  className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                />
                <button onClick={() => setRows(p => p.filter((_, j) => j !== i))} className="text-neutral-300 hover:text-red-500 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-neutral-600">Objects (one per line)</Label>
        <Textarea
          placeholder="Objects (one per line)"
          value={objects}
          onChange={(e) => setObjects(e.target.value)}
          className="min-h-[160px] text-[12px]"
        />
      </div>

      {/* Color Mapping */}
      <div className="flex flex-col gap-2">
        <Label className="text-xs text-neutral-600">Color Mapping</Label>
        <p className="text-[11px] text-neutral-400 -mt-1">Automatically generated from Objects. Assign colors to each detection category for visualization.</p>
        {objects.trim() ? (
          <div className="border border-neutral-200 rounded-[4px] divide-y divide-neutral-100">
            {objects.split("\n").map(s => s.trim()).filter(Boolean).map((obj, i) => (
              <div key={obj} className="flex items-center justify-between gap-3 px-4 py-2.5">
                <span className="text-[12px] text-neutral-700 flex-1">{obj}</span>
                <input type="color" defaultValue={COLOR_PALETTE[i % COLOR_PALETTE.length]} className="w-8 h-8 rounded border border-neutral-200 cursor-pointer" />
              </div>
            ))}
          </div>
        ) : (
          <div className="border border-neutral-200 rounded-[4px] px-4 py-3 bg-neutral-50/60">
            <p className="text-[11px] text-neutral-400">No detection objects available. Add objects first.</p>
          </div>
        )}
      </div>

      {/* Supported Categories */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs text-neutral-600">Supported Categories</Label>
            <p className="text-[11px] text-neutral-400 mt-0.5">Add one row per category and assign tracking classes for that category only.</p>
          </div>
          <button onClick={addCategory} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors" style={{ color: TEAL }}>
            <Plus className="w-3.5 h-3.5" /> Add Category
          </button>
        </div>
        <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
          {categories.length === 0 ? (
            <div className="px-4 py-4 text-[11px] text-neutral-400">No categories added yet.</div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {categories.map((cat, i) => (
                <div key={cat.id} className="flex items-center gap-3 px-4 py-2.5">
                  <input
                    value={cat.name}
                    onChange={(e) => setCategories(p => p.map((c, j) => j === i ? { ...c, name: e.target.value } : c))}
                    placeholder="Category name"
                    className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                  />
                  {objects.trim() ? (
                    <input
                      value={cat.classes}
                      onChange={(e) => setCategories(p => p.map((c, j) => j === i ? { ...c, classes: e.target.value } : c))}
                      placeholder="Tracking classes (comma-separated)"
                      className="flex-[2] h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                    />
                  ) : (
                    <span className="flex-[2] text-[11px] text-neutral-400">Add objects first</span>
                  )}
                  <button onClick={() => setCategories(p => p.filter((_, j) => j !== i))} className="text-neutral-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Metrics */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <div>
            <Label className="text-xs text-neutral-600">Metrics</Label>
            <p className="text-[11px] text-neutral-400 mt-0.5">Dashboard-compatible metric rows.</p>
          </div>
          <button onClick={addMetric} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors" style={{ color: TEAL }}>
            <Plus className="w-3.5 h-3.5" /> Add Metric
          </button>
        </div>
        <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
          {metrics.length === 0 ? (
            <div className="px-4 py-4 text-[11px] text-neutral-400">No metrics added. Click Add Metric to add performance metrics.</div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {metrics.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                  <input
                    value={m.name}
                    onChange={(e) => setMetrics(p => p.map((r, j) => j === i ? { ...r, name: e.target.value } : r))}
                    placeholder="Metric Name"
                    className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                  />
                  <input
                    value={m.value}
                    onChange={(e) => setMetrics(p => p.map((r, j) => j === i ? { ...r, value: e.target.value } : r))}
                    placeholder="Value"
                    className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                  />
                  <button onClick={() => setMetrics(p => p.filter((_, j) => j !== i))} className="text-neutral-300 hover:text-red-500 transition-colors">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <BenchmarkList title="Published Benchmarks" rows={publishedBenchmarks} setRows={setPublishedBenchmarks} />
      <BenchmarkList title="Internal Benchmarks" rows={internalBenchmarks} setRows={setInternalBenchmarks} />

      <div className="grid grid-cols-2 gap-3">
        <FileChooserField id="analytics-metrics-json" label="Analytics Metrics (JSON File)" subtitle="Upload a JSON file. This matches fe-dashboard." file={analyticsJson} onChange={setAnalyticsJson} />
        <FileChooserField id="dashboard-widgets-json" label="Dashboard Widgets (JSON File)" subtitle="Upload a JSON file. This matches fe-dashboard." file={dashboardJson} onChange={setDashboardJson} />
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-neutral-600">Incident types</Label>
        <Textarea
          placeholder="Incident types (one per line: key | Name | order | warning:60,critical:90)"
          value={incidentTypes}
          onChange={(e) => setIncidentTypes(e.target.value)}
          className="min-h-[100px] text-[12px]"
        />
      </div>

      <div className="border border-neutral-200 rounded-[4px] px-4 py-3 bg-neutral-50/60 flex flex-col gap-1.5">
        <p className="text-[11px] font-semibold text-neutral-600">Widget Data Key Check</p>
        <p className="text-[11px] text-neutral-400">Widgets should usually use metric keys. Tracking classes are only useful when you intentionally want detection-based fallback.</p>
        <p className="text-[11px] text-neutral-400">Upload dashboard widgets and analytics metrics to preview whether each widget data key is coming from metrics or tracking classes.</p>
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-neutral-600">VLM prompt</Label>
        <Textarea
          placeholder="VLM prompt"
          value={vlmPrompt}
          onChange={(e) => setVlmPrompt(e.target.value)}
          className="min-h-[100px] text-[12px]"
        />
      </div>
    </div>
  );
}

// ─── Add Version Modal ────────────────────────────────────────────────────────

const RELEASE_OPTIONS = ["Alpha", "Beta", "Stable", "v1.x", "v2.x"];
const PROJECT_OPTIONS = ["Project Alpha", "Project Beta", "Warehouse-Vision-01", "Retail-Analytics-Core"];
const MODEL_TYPE_OPTIONS = [
  { value: "trained", label: "Trained" },
  { value: "pretrained", label: "Pre-trained" },
  { value: "custom-upload", label: "Custom Upload" },
];
const TRAINED_MODEL_OPTIONS = ["ResNet-50-v2", "YOLOv8-Detector", "EfficientDet-D3", "MobileNet-SSD"];
const RUNTIME_FRAMEWORK_OPTIONS = ["ONNX", "TensorRT", "PyTorch", "TFLite"];

type ModelBlockData = {
  id: string;
  upstream: string;
  project: string;
  modelType: string;
  trainedModel: string;
  modelName: string;
  inputCategories: string;
  outputCategories: string;
  postProcessingFile: File | null;
  runtimeFramework: string;
  gpuMemoryMb: string;
  minFps: string;
  maxFps: string;
  metrics: MetricRow[];
  publishedBenchmarks: BenchmarkRow[];
  internalBenchmarks: BenchmarkRow[];
};

const emptyModel = (): ModelBlockData => ({
  id: Date.now().toString() + Math.random(),
  upstream: "__camera__",
  project: "",
  modelType: "trained",
  trainedModel: "",
  modelName: "",
  inputCategories: "",
  outputCategories: "",
  postProcessingFile: null,
  runtimeFramework: "",
  gpuMemoryMb: "",
  minFps: "",
  maxFps: "",
  metrics: [],
  publishedBenchmarks: [],
  internalBenchmarks: [],
});

function ReleaseChipSelect({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [open, setOpen] = useState(false);
  const toggle = (r: string) => onChange(value.includes(r) ? value.filter(v => v !== r) : [...value, r]);
  return (
    <div className="flex flex-col gap-1.5 relative">
      <Label className="text-xs text-neutral-600">Supported Releases*</Label>
      <p className="text-[11px] text-neutral-400 -mt-1">Release lines this version applies to.</p>
      <div className="flex flex-wrap items-center gap-1.5 border border-neutral-200 rounded-[4px] px-2 py-2 min-h-[42px]">
        {value.map(r => (
          <span key={r} className="flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded-[4px]" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
            {r}
            <button onClick={() => toggle(r)}><X className="w-3 h-3" /></button>
          </span>
        ))}
        <button onClick={() => setOpen(p => !p)} className="text-[11px] font-semibold flex items-center gap-1" style={{ color: TEAL }}>
          <Plus className="w-3 h-3" /> Add
        </button>
      </div>
      {open && (
        <div className="absolute top-full left-0 mt-1 z-10 bg-white border border-neutral-200 rounded-[4px] shadow-lg p-2 flex flex-col gap-1 w-48">
          {RELEASE_OPTIONS.map(r => (
            <label key={r} className="flex items-center gap-2 text-[12px] text-neutral-700 px-2 py-1 hover:bg-neutral-50 rounded cursor-pointer">
              <input type="checkbox" checked={value.includes(r)} onChange={() => toggle(r)} />
              {r}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

function ModelBlock({
  index, data, otherModels, onChange, onRemove,
}: {
  index: number;
  data: ModelBlockData;
  otherModels: { id: string; name: string }[];
  onChange: (patch: Partial<ModelBlockData>) => void;
  onRemove: () => void;
}) {
  return (
    <div className="border border-neutral-200 rounded-[4px] p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <p className="text-[13px] font-semibold text-neutral-800">Model #{index + 1}</p>
        <button onClick={onRemove} className="text-neutral-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Upstream</Label>
          <p className="text-[11px] text-neutral-400 -mt-1">Which model's output feeds this model's input?</p>
          <Select value={data.upstream} onValueChange={(v) => onChange({ upstream: v })}>
            <SelectTrigger className="h-10 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__camera__">None (reads from camera)</SelectItem>
              {otherModels.map(m => <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Project (filter for model lookup)</Label>
          <Select value={data.project} onValueChange={(v) => onChange({ project: v })}>
            <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {PROJECT_OPTIONS.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Select Model Type</Label>
          <Select value={data.modelType} onValueChange={(v) => onChange({ modelType: v })}>
            <SelectTrigger className="h-10 text-[12px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              {MODEL_TYPE_OPTIONS.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        {data.modelType !== "custom-upload" && (
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Select trained Model</Label>
            <Select value={data.trainedModel} onValueChange={(v) => onChange({ trainedModel: v })}>
              <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select..." /></SelectTrigger>
              <SelectContent>
                {TRAINED_MODEL_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div className="flex flex-col gap-1.5">
        <Label className="text-xs text-neutral-600">Model Name*</Label>
        <Input value={data.modelName} onChange={(e) => onChange({ modelName: e.target.value })} />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Input categories (one per line)</Label>
          <Textarea className="min-h-[80px] text-[12px]" placeholder="Input categories (one per line)" value={data.inputCategories} onChange={(e) => onChange({ inputCategories: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Output categories (one per line)</Label>
          <Textarea className="min-h-[80px] text-[12px]" placeholder="Output categories (one per line)" value={data.outputCategories} onChange={(e) => onChange({ outputCategories: e.target.value })} />
        </div>
      </div>

      <FileChooserField id={`postproc-${data.id}`} label="Post Processing Config (JSON File, optional)" subtitle="Upload a JSON file. This matches fe-dashboard." file={data.postProcessingFile} onChange={(f) => onChange({ postProcessingFile: f })} />

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Runtime Frameworks</Label>
          <Select value={data.runtimeFramework} onValueChange={(v) => onChange({ runtimeFramework: v })}>
            <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select..." /></SelectTrigger>
            <SelectContent>
              {RUNTIME_FRAMEWORK_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">GPU Memory (MB)</Label>
          <Input type="number" placeholder="e.g., 8192" value={data.gpuMemoryMb} onChange={(e) => onChange({ gpuMemoryMb: e.target.value })} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Minimum FPS</Label>
          <Input type="number" placeholder="e.g., 30" value={data.minFps} onChange={(e) => onChange({ minFps: e.target.value })} />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Maximum FPS</Label>
          <Input type="number" placeholder="e.g., 60" value={data.maxFps} onChange={(e) => onChange({ maxFps: e.target.value })} />
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs text-neutral-600">Performance Metrics</Label>
          <button
            onClick={() => onChange({ metrics: [...data.metrics, { id: Date.now().toString() + Math.random(), name: "", value: "" }] })}
            className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors" style={{ color: TEAL }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Metric
          </button>
        </div>
        <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
          {data.metrics.length === 0 ? (
            <div className="px-4 py-3 text-[11px] text-neutral-400">No metrics added. Click Add Metric to add performance metrics.</div>
          ) : (
            <div className="divide-y divide-neutral-100">
              {data.metrics.map((m, i) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                  <input value={m.name} onChange={(e) => onChange({ metrics: data.metrics.map((r, j) => j === i ? { ...r, name: e.target.value } : r) })} placeholder="Metric Name" className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors" />
                  <input value={m.value} onChange={(e) => onChange({ metrics: data.metrics.map((r, j) => j === i ? { ...r, value: e.target.value } : r) })} placeholder="Value" className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors" />
                  <button onClick={() => onChange({ metrics: data.metrics.filter((_, j) => j !== i) })} className="text-neutral-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {(["publishedBenchmarks", "internalBenchmarks"] as const).map((key) => (
        <div key={key} className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-neutral-600">{key === "publishedBenchmarks" ? "Published Benchmarks" : "Internal Benchmarks"}</Label>
            <button
              onClick={() => onChange({ [key]: [...data[key], { id: Date.now().toString() + Math.random(), hardware: "", latencyMs: "", throughputFps: "" }] } as Partial<ModelBlockData>)}
              className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors" style={{ color: TEAL }}
            >
              <Plus className="w-3.5 h-3.5" /> Add Benchmark
            </button>
          </div>
          <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
            {data[key].length === 0 ? (
              <div className="px-4 py-3 text-[11px] text-neutral-400">No benchmarks added.</div>
            ) : (
              <div className="divide-y divide-neutral-100">
                {data[key].map((row, i) => (
                  <div key={row.id} className="flex items-center gap-3 px-4 py-2.5">
                    <input value={row.hardware} onChange={(e) => onChange({ [key]: data[key].map((r, j) => j === i ? { ...r, hardware: e.target.value } : r) } as Partial<ModelBlockData>)} placeholder="Hardware Name" className="flex-[2] h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors" />
                    <input value={row.latencyMs} onChange={(e) => onChange({ [key]: data[key].map((r, j) => j === i ? { ...r, latencyMs: e.target.value } : r) } as Partial<ModelBlockData>)} placeholder="Latency MS" className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors" />
                    <input value={row.throughputFps} onChange={(e) => onChange({ [key]: data[key].map((r, j) => j === i ? { ...r, throughputFps: e.target.value } : r) } as Partial<ModelBlockData>)} placeholder="Throughput FPS" className="flex-1 h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors" />
                    <button onClick={() => onChange({ [key]: data[key].filter((_, j) => j !== i) } as Partial<ModelBlockData>)} className="text-neutral-300 hover:text-red-500 transition-colors"><X className="w-4 h-4" /></button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AddModelsModal({ appName, onClose }: { appName: string; onClose: () => void }) {
  const [step, setStep] = useState<0 | 1>(0);
  const [releases, setReleases] = useState<string[]>([]);
  const [objects, setObjects] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [publishedBenchmarks, setPublishedBenchmarks] = useState<BenchmarkRow[]>([]);
  const [internalBenchmarks, setInternalBenchmarks] = useState<BenchmarkRow[]>([]);
  const [analyticsJson, setAnalyticsJson] = useState<File | null>(null);
  const [dashboardJson, setDashboardJson] = useState<File | null>(null);
  const [incidentTypes, setIncidentTypes] = useState("");
  const [vlmPrompt, setVlmPrompt] = useState("");
  const [models, setModels] = useState<ModelBlockData[]>([emptyModel()]);

  const patchModel = (id: string, patch: Partial<ModelBlockData>) =>
    setModels(p => p.map(m => m.id === id ? { ...m, ...patch } : m));
  const removeModel = (id: string) =>
    setModels(p => p.filter(m => m.id !== id).map(m => m.upstream === id ? { ...m, upstream: "__camera__" } : m));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-neutral-900">Add Model(s) to Application</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Stepper */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-neutral-100">
          {(["Version Settings", `Models (${models.length})`] as const).map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => i <= step && setStep(i as 0 | 1)}
                disabled={i > step}
                className={cn(
                  "w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold transition-colors flex-shrink-0",
                  i < step ? "bg-[#00775B] text-white" : i === step ? "border-2 border-[#00775B] text-[#00775B]" : "border border-neutral-300 text-neutral-400"
                )}
              >
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </button>
              <span className={cn("text-[12px] font-semibold", i === step ? "text-neutral-800" : "text-neutral-400")}>{label}</span>
              {i === 0 && <div className="w-8 h-px bg-neutral-200 ml-1" />}
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          {step === 0 ? (
            <>
              <ReleaseChipSelect value={releases} onChange={setReleases} />
              <VersionMetadataFields
                objects={objects} setObjects={setObjects}
                categories={categories} setCategories={setCategories}
                metrics={metrics} setMetrics={setMetrics}
                publishedBenchmarks={publishedBenchmarks} setPublishedBenchmarks={setPublishedBenchmarks}
                internalBenchmarks={internalBenchmarks} setInternalBenchmarks={setInternalBenchmarks}
                analyticsJson={analyticsJson} setAnalyticsJson={setAnalyticsJson}
                dashboardJson={dashboardJson} setDashboardJson={setDashboardJson}
                incidentTypes={incidentTypes} setIncidentTypes={setIncidentTypes}
                vlmPrompt={vlmPrompt} setVlmPrompt={setVlmPrompt}
              />
            </>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <p className="text-[13px] font-semibold text-neutral-800">Models ({models.length})</p>
                <button onClick={() => setModels(p => [...p, emptyModel()])} className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide transition-colors" style={{ color: TEAL }}>
                  <Plus className="w-3.5 h-3.5" /> Add another model
                </button>
              </div>
              <div className="flex flex-col gap-4">
                {models.map((m, i) => (
                  <ModelBlock
                    key={m.id}
                    index={i}
                    data={m}
                    otherModels={models.filter(o => o.id !== m.id).map(o => ({ id: o.id, name: o.modelName || `Model #${models.indexOf(o) + 1}` }))}
                    onChange={(patch) => patchModel(m.id, patch)}
                    onRemove={() => removeModel(m.id)}
                  />
                ))}
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between items-center px-6 py-4 border-t border-neutral-100">
          <div>
            {step === 1 && (
              <button
                onClick={() => setStep(0)}
                className="h-9 px-5 text-[12px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors"
              >
                Previous
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="h-9 px-5 text-[12px] font-semibold uppercase tracking-wide text-neutral-600 hover:text-neutral-800 transition-colors">
              Cancel
            </button>
            {step === 0 ? (
              <button
                className="h-9 px-7 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px] transition-colors"
                style={{ backgroundColor: TEAL }}
                onClick={() => setStep(1)}
              >
                Next
              </button>
            ) : (
              <button
                className="h-9 px-7 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px] transition-colors"
                style={{ backgroundColor: TEAL }}
                onClick={onClose}
              >
                Create
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Add Demo Preview Modal ────────────────────────────────────────────────────

function AddDemoModal({ app, version, onClose }: { app: Application; version: AppVersion; onClose: () => void }) {
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [outputZip, setOutputZip] = useState<File | null>(null);
  const [badgeLabel, setBadgeLabel] = useState("");
  const [cameraPlacement, setCameraPlacement] = useState("");
  const [resolution, setResolution] = useState("");
  const [deployment, setDeployment] = useState("");
  const [outputFormat, setOutputFormat] = useState("");
  const [frameRate, setFrameRate] = useState("");
  const [businessDecisions, setBusinessDecisions] = useState("");
  const [keyDrivers, setKeyDrivers] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-neutral-900">Add Demo Preview</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          <FileChooserField id="demo-video" label="Upload Demo Video" subtitle="MP4, MOV, AVI, MKV, WebM and other common video formats." file={videoFile} onChange={setVideoFile} />
          <FileChooserField id="demo-output" label="Upload Demo Output" subtitle="ZIP archive containing the demo output assets." file={outputZip} onChange={setOutputZip} />

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Application version</Label>
            <Input value={version.version} disabled className="bg-neutral-50 text-neutral-500" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Badge Label</Label>
              <Input placeholder="Executive outcome" value={badgeLabel} onChange={(e) => setBadgeLabel(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Camera Placement</Label>
              <Input placeholder="Overhead preferred at 90-degree angle; height 3-10 ft" value={cameraPlacement} onChange={(e) => setCameraPlacement(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Resolution</Label>
              <Input placeholder="1080p recommended, 720p minimum" value={resolution} onChange={(e) => setResolution(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Deployment</Label>
              <Input placeholder="Edge device or cloud API" value={deployment} onChange={(e) => setDeployment(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Output Format</Label>
              <Input placeholder="RTSP stream + JSON metadata" value={outputFormat} onChange={(e) => setOutputFormat(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Frame Rate</Label>
              <Input placeholder="Minimum 15 FPS" value={frameRate} onChange={(e) => setFrameRate(e.target.value)} />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Current Metrics</Label>
            <p className="text-[11px] text-neutral-400 -mt-1">Existing analytics config for this version.</p>
            <div className="border border-neutral-200 rounded-[4px] px-4 py-3 bg-neutral-50/60">
              <p className="text-[11px] text-neutral-400">No existing analytics config found for this version.</p>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Business decisions</Label>
            <Textarea className="min-h-[100px] text-[12px]" placeholder="One per line: title | subtitle" value={businessDecisions} onChange={(e) => setBusinessDecisions(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Key drivers</Label>
            <Textarea className="min-h-[100px] text-[12px]" placeholder="One per line" value={keyDrivers} onChange={(e) => setKeyDrivers(e.target.value)} />
          </div>
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="h-9 px-5 text-[12px] font-semibold uppercase tracking-wide text-neutral-600 hover:text-neutral-800 transition-colors mr-2">
            Cancel
          </button>
          <button className="h-9 px-7 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px] transition-colors" style={{ backgroundColor: TEAL }} onClick={onClose}>
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Update Version Modal ──────────────────────────────────────────────────────

function UpdateVersionModal({ app, version, onClose }: { app: Application; version: AppVersion; onClose: () => void }) {
  const [runtimeFramework, setRuntimeFramework] = useState("");
  const [gpuMemory, setGpuMemory] = useState("");
  const [minFps, setMinFps] = useState("");
  const [maxFps, setMaxFps] = useState("");
  const [objects, setObjects] = useState("");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [metrics, setMetrics] = useState<MetricRow[]>([]);
  const [publishedBenchmarks, setPublishedBenchmarks] = useState<BenchmarkRow[]>([]);
  const [internalBenchmarks, setInternalBenchmarks] = useState<BenchmarkRow[]>([]);
  const [analyticsJson, setAnalyticsJson] = useState<File | null>(null);
  const [dashboardJson, setDashboardJson] = useState<File | null>(null);
  const [incidentTypes, setIncidentTypes] = useState("");
  const [vlmPrompt, setVlmPrompt] = useState("");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-neutral-900">Update Version Metadata</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Version Number</Label>
            <Input value={version.version} disabled className="bg-neutral-50 text-neutral-500" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="flex flex-col gap-1.5 col-span-1">
              <Label className="text-xs text-neutral-600">Runtime Frameworks</Label>
              <Select value={runtimeFramework} onValueChange={setRuntimeFramework}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select..." /></SelectTrigger>
                <SelectContent>
                  {RUNTIME_FRAMEWORK_OPTIONS.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">GPU Memory (MB)</Label>
              <Input type="number" value={gpuMemory} onChange={(e) => setGpuMemory(e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Minimum FPS</Label>
              <Input type="number" value={minFps} onChange={(e) => setMinFps(e.target.value)} />
            </div>
          </div>
          <div className="flex flex-col gap-1.5 w-1/3">
            <Label className="text-xs text-neutral-600">Maximum FPS</Label>
            <Input type="number" value={maxFps} onChange={(e) => setMaxFps(e.target.value)} />
          </div>

          <VersionMetadataFields
            objects={objects} setObjects={setObjects}
            categories={categories} setCategories={setCategories}
            metrics={metrics} setMetrics={setMetrics}
            publishedBenchmarks={publishedBenchmarks} setPublishedBenchmarks={setPublishedBenchmarks}
            internalBenchmarks={internalBenchmarks} setInternalBenchmarks={setInternalBenchmarks}
            analyticsJson={analyticsJson} setAnalyticsJson={setAnalyticsJson}
            dashboardJson={dashboardJson} setDashboardJson={setDashboardJson}
            incidentTypes={incidentTypes} setIncidentTypes={setIncidentTypes}
            vlmPrompt={vlmPrompt} setVlmPrompt={setVlmPrompt}
          />
        </div>

        <div className="flex justify-end px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="h-9 px-5 text-[12px] font-semibold uppercase tracking-wide text-neutral-600 hover:text-neutral-800 transition-colors mr-2">
            Cancel
          </button>
          <button className="h-9 px-7 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px] transition-colors" style={{ backgroundColor: TEAL }} onClick={onClose}>
            Update
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Application Detail ───────────────────────────────────────────────────────

type VersionModel = {
  id: string;
  name: string;
  architecture: string;
  type: "Trained";
  gpuMemory: string;
  runtime: string;
};

const MODEL_ARCHITECTURES = ["YOLOv10", "ResNet-50", "EfficientNet-B4", "YOLOv8", "MobileNetV3"];
const GPU_MEMORY_OPTIONS = ["2.1 GB", "3.4 GB", "4.2 GB", "6.8 GB"];
const RUNTIME_OPTIONS = ["PyTorch 2.1", "ONNX Runtime", "TensorRT 8.6"];

function getModelsForVersion(version: AppVersion, appName: string): VersionModel[] {
  const count = Math.max(version.modelCount, 0);
  const label = appName.split(" ").slice(0, 2).join(" ");
  return Array.from({ length: count }, (_, i) => ({
    id: `${version.version}-model-${i + 1}`,
    name: count > 1 ? `${label} ${i + 1}` : label,
    architecture: MODEL_ARCHITECTURES[(i + version.version.length) % MODEL_ARCHITECTURES.length],
    type: "Trained" as const,
    gpuMemory: GPU_MEMORY_OPTIONS[i % GPU_MEMORY_OPTIONS.length],
    runtime: RUNTIME_OPTIONS[i % RUNTIME_OPTIONS.length],
  }));
}

type DetailTab = "overview" | "versions" | "issues";

function ApplicationDetail({
  app,
  onBack,
}: {
  app: Application;
  onBack: () => void;
}) {
  const [tab,            setTab]            = useState<DetailTab>("overview");
  const [showAddModels,  setShowAddModels]  = useState(false);
  const [showEditApp,    setShowEditApp]    = useState(false);
  const [addDemoVersion, setAddDemoVersion] = useState<AppVersion | null>(null);
  const [editingVersion, setEditingVersion] = useState<AppVersion | null>(null);

  const appIssues = MOCK_ISSUES.filter((i) => i.appName === app.name);
  const currentVersion = app.versionHistory[app.versionHistory.length - 1];

  const TABS: { id: DetailTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "versions", label: `Versions${app.versionHistory.length > 0 ? ` (${app.versionHistory.length})` : ""}` },
    { id: "issues",   label: `Reported Issues${appIssues.length > 0 ? ` (${appIssues.length})` : ""}` },
  ];

  const STAT_ITEMS = [
    { label: "Status", value: STATUS_LABEL[app.status], color: STATUS_DOT[app.status] },
    { label: "Current Version", value: currentVersion ? currentVersion.version : "—", color: "#334155" },
    { label: "Industries", value: app.industries.join(", ") || "Not configured", color: "#334155" },
    { label: "Objects", value: app.objects, color: "#334155" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {showAddModels && <AddModelsModal appName={app.name} onClose={() => setShowAddModels(false)} />}
      {showEditApp && <EditApplicationModal app={app} onClose={() => setShowEditApp(false)} />}
      {addDemoVersion && <AddDemoModal app={app} version={addDemoVersion} onClose={() => setAddDemoVersion(null)} />}
      {editingVersion && <UpdateVersionModal app={app} version={editingVersion} onClose={() => setEditingVersion(null)} />}

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Publish
          </button>
          <span className="text-neutral-300">/</span>
          <span className="text-[12px] font-semibold text-neutral-800">{titleCase(app.name)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowEditApp(true)}
            className="h-8 px-4 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 rounded-[4px] border border-neutral-200 flex items-center gap-1.5 hover:border-neutral-300 transition-colors"
          >
            <Pencil className="w-3.5 h-3.5" /> Update Application
          </button>
          <button
            onClick={() => setShowAddModels(true)}
            className="h-8 px-4 text-[11px] font-semibold uppercase tracking-wide text-white rounded-[4px] flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: TEAL }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Version
          </button>
        </div>
      </div>

      {/* App header card */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex gap-0">
        <div className="w-48 flex-shrink-0">
          <AppThumbnail status={app.status} name={app.name} image={app.image} />
        </div>
        <div className="flex-1 p-5 flex flex-col gap-2 justify-center border-l border-neutral-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
                  {app.category}
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm bg-neutral-100 text-neutral-500">
                  {app.stage}
                </span>
              </div>
              <h2 className="text-[18px] font-bold text-neutral-900">{titleCase(app.name)}</h2>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full" style={{ backgroundColor: STATUS_DOT[app.status] + "18" }}>
              <span className="w-2 h-2 rounded-full" style={{ backgroundColor: STATUS_DOT[app.status] }} />
              <span className="text-[10px] font-bold tracking-wide" style={{ color: STATUS_DOT[app.status] }}>
                {STATUS_LABEL[app.status]}
              </span>
            </div>
          </div>
          <p className="text-[12px] text-neutral-500">{app.description || "No description provided."}</p>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Updated {app.updatedAt}</span>
            <span>·</span>
            <span>{app.versionHistory.length} version{app.versionHistory.length !== 1 ? "s" : ""}</span>
            {app.url && (
              <>
                <span>·</span>
                <a href={app.url} className="flex items-center gap-1 text-[#00775B] hover:underline" target="_blank" rel="noreferrer">
                  <ExternalLink className="w-3 h-3" /> View Live
                </a>
              </>
            )}
          </div>
          {app.industries.length > 0 && (
            <div className="flex gap-1.5 mt-1">
              {app.industries.map((ind) => (
                <span key={ind} className="text-[9px] font-semibold uppercase px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-sm">{ind}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden min-w-0">
        <div className="flex items-center border-b border-neutral-200 bg-white">
          {TABS.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={cn("relative px-5 py-3 text-[12px] font-semibold transition-colors",
                tab === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
              {t.label}
              {tab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />}
            </button>
          ))}
        </div>

        {/* Overview */}
        {tab === "overview" && (
          <div className="p-6 flex flex-col gap-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {STAT_ITEMS.map((item) => (
                <div key={item.label} className="border border-neutral-100 rounded-[4px] p-4 bg-neutral-50/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{item.label}</p>
                  <p className="text-[14px] font-bold text-neutral-900 mt-1 truncate" style={{ color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Description</p>
              <p className="text-[13px] text-neutral-700">{app.description || "No description provided."}</p>
            </div>

            <div className="flex flex-col gap-2">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Resources</p>
              {app.resources.length === 0 ? (
                <p className="text-[12px] text-neutral-400">No resources added for this application yet.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  {app.resources.map((r) => (
                    <div key={r.label} className="flex items-center gap-2.5 px-4 py-3 border border-neutral-200 rounded-[4px] hover:border-[#00775B]/40 hover:bg-neutral-50/60 transition-colors cursor-pointer group">
                      {r.type === "notebook" ? <BookOpen className="w-4 h-4 text-[#00775B]" /> : <ExternalLink className="w-4 h-4 text-[#00775B]" />}
                      <span className="text-[12px] font-semibold text-neutral-700 group-hover:text-neutral-900">{r.label}</span>
                      <ExternalLink className="w-3 h-3 text-neutral-300 ml-auto" />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Versions */}
        {tab === "versions" && (
          <div>
            {app.versionHistory.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-[13px] font-semibold text-neutral-500">No versions yet</p>
                <p className="text-[11px] text-neutral-400">Click "Add Version" to upload your first model version.</p>
                <button
                  onClick={() => setShowAddModels(true)}
                  className="mt-2 h-8 px-5 text-[12px] font-semibold text-white rounded-[4px] flex items-center gap-1.5"
                  style={{ backgroundColor: TEAL }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Version
                </button>
              </div>
            ) : (
              <V23Table<AppVersion & { id: string }>
                data={app.versionHistory.map((v) => ({ ...v, id: v.version }))}
                idLabel="App Version"
                renderId={(row, h) => <V23Mono hovered={h} color="#475569">{row.version}</V23Mono>}
                searchPlaceholder="Search versions, owners…"
                searchFn={(row, q) => `${row.version} ${row.owner}`.toLowerCase().includes(q.toLowerCase())}
                sortOptions={[
                  { key: "version-desc", label: "Version (Newest)",      cmp: (a, b) => b.version.localeCompare(a.version) },
                  { key: "version-asc",  label: "Version (Oldest)",      cmp: (a, b) => a.version.localeCompare(b.version) },
                  { key: "updated-desc", label: "Last Updated (Newest)", cmp: (a, b) => b.lastUpdated.localeCompare(a.lastUpdated) },
                  { key: "updated-asc",  label: "Last Updated (Oldest)", cmp: (a, b) => a.lastUpdated.localeCompare(b.lastUpdated) },
                ]}
                filterGroups={[
                  {
                    key: "status", label: "Status", getValue: (row) => row.status,
                    options: [
                      { value: "published",  label: "Published" },
                      { value: "draft",      label: "Draft" },
                      { value: "deprecated", label: "Deprecated" },
                    ],
                  },
                ]}
                rowAccent={(row) => (row.status === "published" ? TEAL : row.status === "draft" ? "#D97706" : "#94A3B8")}
                columns={[
                  { key: "status",      label: "Status",       minWidth: 120, render: (row) => <StatusCapsule status={VERSION_STATUS_KEY[row.status]} label={VERSION_STATUS_LABEL[row.status]} /> },
                  { key: "lastUpdated", label: "Last Updated", minWidth: 130, render: (row, h) => <V23Mono hovered={h}>{row.lastUpdated}</V23Mono> },
                  { key: "owner",       label: "Owner",        minWidth: 170, render: (row, h) => <V23Inter hovered={h} weight={500}>{row.owner}</V23Inter> },
                  { key: "modelCount",  label: "Models",       minWidth: 90, align: "right", render: (row, h) => <V23Mono hovered={h}>{row.modelCount}</V23Mono> },
                ]}
                rowActions={[
                  { title: "Add demo",        icon: <Plus className="w-3.5 h-3.5" />,        color: TEAL,      onClick: (r) => setAddDemoVersion(r) },
                  { title: "Edit version",    icon: <Pencil className="w-3.5 h-3.5" />,      color: "#0284C7", onClick: (r) => setEditingVersion(r) },
                  { title: "Open model demo", icon: <ExternalLink className="w-3.5 h-3.5" />, color: "#334155", onClick: () => {} },
                ]}
                expandable
                isRowExpandable={(r) => r.modelCount > 0}
                renderExpandedRow={(r) => (
                  <div className="flex flex-col gap-2 py-3 px-4">
                    {getModelsForVersion(r, app.name).map((m) => (
                      <div key={m.id} className="flex items-center justify-between gap-4 px-4 py-3 bg-white border border-neutral-200 rounded-[4px]">
                        <div className="flex flex-col gap-0.5">
                          <p className="text-[12px] font-semibold text-neutral-800">
                            {m.name} <span className="text-neutral-400 font-normal">/ {m.architecture}</span>
                          </p>
                          <div className="flex items-center gap-3 text-[11px] text-neutral-500">
                            <span>Type: {m.type}</span>
                            <span>·</span>
                            <span>GPU Memory: {m.gpuMemory}</span>
                            <span>·</span>
                            <span>Runtime: {m.runtime}</span>
                          </div>
                        </div>
                        <button className="h-7 px-3 text-[11px] font-semibold uppercase tracking-wide text-neutral-700 rounded-[4px] border border-neutral-200 flex items-center gap-1.5 hover:border-[#00775B]/50 hover:text-[#00775B] transition-colors">
                          <Download className="w-3.5 h-3.5" /> Download Model
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                pageSize={10}
                itemLabel="versions"
              />
            )}
          </div>
        )}

        {/* Reported Issues */}
        {tab === "issues" && (
          <div>
            {appIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-neutral-300" />
                </div>
                <p className="text-[13px] font-semibold text-neutral-500">No issues found</p>
                <p className="text-[11px] text-neutral-400">No issues have been reported for this application</p>
              </div>
            ) : (
              <V23Table<ReportedIssue>
                data={appIssues}
                idLabel="Version"
                renderId={(row, h) => <V23Mono hovered={h} color="#475569">{row.version}</V23Mono>}
                searchPlaceholder="Search issues…"
                searchFn={(row, q) => `${row.version} ${row.issueType} ${row.subIssue}`.toLowerCase().includes(q.toLowerCase())}
                sortOptions={[
                  { key: "updated-desc", label: "Last Updated (Newest)", cmp: (a, b) => b.updatedAt.localeCompare(a.updatedAt) },
                  { key: "updated-asc",  label: "Last Updated (Oldest)", cmp: (a, b) => a.updatedAt.localeCompare(b.updatedAt) },
                  { key: "reports-desc", label: "Reports (High-Low)",    cmp: (a, b) => b.reportCount - a.reportCount },
                  { key: "reports-asc",  label: "Reports (Low-High)",    cmp: (a, b) => a.reportCount - b.reportCount },
                ]}
                filterGroups={[
                  {
                    key: "version", label: "Versions", getValue: (row) => row.version,
                    options: app.versionHistory.map((v) => ({ value: v.version, label: v.version })),
                  },
                  {
                    key: "issueType", label: "Types", getValue: (row) => row.issueType,
                    options: [
                      { value: "Model Output", label: "Model Output" },
                      { value: "Performance",  label: "Performance" },
                      { value: "UI / UX",      label: "UI / UX" },
                      { value: "Crash",        label: "Crash" },
                    ],
                  },
                ]}
                rowAccent={(row) => (row.status === "open" ? "#E7000B" : row.status === "in-progress" ? "#D97706" : "#00A63E")}
                columns={[
                  { key: "issueType",   label: "Issue Type",    minWidth: 150, render: (row, h) => <V23Inter hovered={h} weight={500}>{row.issueType}</V23Inter> },
                  { key: "status",      label: "Status",        minWidth: 120, render: (row) => <StatusCapsule status={ISSUE_STATUS_KEY[row.status]} label={ISSUE_STATUS_LABEL[row.status]} /> },
                  { key: "reportCount", label: "Reports",       minWidth: 90, align: "right", render: (row, h) => <V23Mono hovered={h}>{row.reportCount}</V23Mono> },
                  { key: "updatedAt",   label: "Last Updated",  minWidth: 120, render: (row, h) => <V23Mono hovered={h} color="#94A3B8">{row.updatedAt}</V23Mono> },
                ]}
                pageSize={10}
                itemLabel="issues"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Edit Application Modal ────────────────────────────────────────────────────

const RELEASE_STAGE_OPTIONS = [
  { value: "Public",   label: "Public (Visible for everyone)" },
  { value: "Private",  label: "Private (Invite only)" },
  { value: "Internal", label: "Internal (Team only)" },
] as const;

const SERVER_TYPE_OPTIONS = [
  { value: "None",          label: "No dedicated server" },
  { value: "Dedicated CPU", label: "Dedicated CPU" },
  { value: "Dedicated GPU", label: "Dedicated GPU" },
] as const;

function EditApplicationModal({ app, onClose }: { app: Application; onClose: () => void }) {
  const [name,         setName]         = useState(app.name);
  const [industries,   setIndustries]   = useState(app.industries[0] ?? "");
  const [categories,   setCategories]   = useState(app.category ?? "");
  const [projectType,  setProjectType]  = useState(app.projectType ?? "");
  const [imagePreview, setImagePreview] = useState<string | undefined>(app.image);
  const [dragging,     setDragging]     = useState(false);
  const [blogLinks,    setBlogLinks]    = useState(app.blogLinks ?? "");
  const [appType,      setAppType]      = useState<Application["appType"]>(app.appType ?? "Standard");
  const [releaseStage, setReleaseStage] = useState<Application["releaseStage"]>(app.releaseStage ?? "Public");
  const [description,  setDescription]  = useState(app.description);
  const [notebookLink, setNotebookLink] = useState(app.notebookLink ?? "");
  const [serverType,   setServerType]   = useState<Application["serverType"]>(app.serverType ?? "None");
  const [featured,     setFeatured]     = useState(app.featured ?? false);

  const canSave = Boolean(name && industries && categories && projectType && blogLinks && description && notebookLink);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-lg mx-4 flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-neutral-900">Update Application</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-4 p-6 overflow-y-auto">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Application Name*</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Industries*</Label>
              <Select value={industries} onValueChange={setIndustries}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select Industries" /></SelectTrigger>
                <SelectContent>
                  {["Oil & Gas", "Automotive", "Airport", "Manufacturing", "Retail", "Agriculture", "Cafe", "Healthcare"].map(i => (
                    <SelectItem key={i} value={i}>{i}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Categories*</Label>
              <Select value={categories} onValueChange={setCategories}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select Categories" /></SelectTrigger>
                <SelectContent>
                  {["Application Insight", "Safety", "Compliance", "Access Control", "Tracking", "Analytics"].map(c => (
                    <SelectItem key={c} value={c}>{c}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Project Type*</Label>
            <Select value={projectType} onValueChange={setProjectType}>
              <SelectTrigger className="h-10 text-[12px]"><SelectValue placeholder="Select Project Type" /></SelectTrigger>
              <SelectContent>
                {["Object Detection", "Classification", "Segmentation", "Pose Estimation", "OCR", "Anomaly Detection"].map(t => (
                  <SelectItem key={t} value={t}>{t}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Image upload with preview */}
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Application Image</Label>
            {imagePreview ? (
              <div className="relative rounded-[4px] border border-neutral-200 overflow-hidden group">
                <img src={imagePreview} alt={name} className="w-full h-32 object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setImagePreview(undefined)}
                    className="h-8 px-4 text-[11px] font-semibold text-white bg-black/60 rounded-[4px] flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" /> Replace Image
                  </button>
                </div>
              </div>
            ) : (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={(e) => { e.preventDefault(); setDragging(false); }}
                className={cn(
                  "flex flex-col items-center justify-center gap-3 py-8 rounded-[4px] border-2 border-dashed transition-colors cursor-pointer",
                  dragging ? "border-[#00775B] bg-[#00775B]/5" : "border-[#00775B]/40 bg-neutral-50/60"
                )}
              >
                <div className="w-12 h-12 rounded-full bg-[#E5FFF9] flex items-center justify-center">
                  <Upload className="w-5 h-5 text-[#00775B]" />
                </div>
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-neutral-700">Drag and Drop an image here</p>
                  <p className="text-[11px] text-neutral-400 mt-0.5">Supported formats: .jpeg, .png</p>
                </div>
              </div>
            )}
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Blog Links*</Label>
            <Input placeholder="https://blog.matrice.ai/..." value={blogLinks} onChange={(e) => setBlogLinks(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">App type</Label>
              <Select value={appType} onValueChange={(v) => setAppType(v as Application["appType"])}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(["Standard", "Enterprise", "Custom"] as const).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Release stage</Label>
              <Select value={releaseStage} onValueChange={(v) => setReleaseStage(v as Application["releaseStage"])}>
                <SelectTrigger className="h-10 text-[12px]"><SelectValue /></SelectTrigger>
                <SelectContent>
                  {RELEASE_STAGE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Description*</Label>
            <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Notebook link*</Label>
            <Input type="url" placeholder="https://notebooks.matrice.ai/..." value={notebookLink} onChange={(e) => setNotebookLink(e.target.value)} />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Server type</Label>
            <Select value={serverType} onValueChange={(v) => setServerType(v as Application["serverType"])}>
              <SelectTrigger className="h-10 text-[12px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                {SERVER_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-4 px-1 py-1">
            <div className="flex flex-col gap-0.5">
              <p className="text-[12px] font-semibold text-neutral-800">Featured application</p>
              <p className="text-[11px] text-neutral-400">Highlight this application in appstore surfaces.</p>
            </div>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="h-9 px-4 text-[12px] font-semibold uppercase tracking-wide text-neutral-600 rounded-[4px] border border-neutral-200 hover:border-neutral-300 transition-colors">
            Cancel
          </button>
          <button
            disabled={!canSave}
            onClick={onClose}
            className="h-9 px-5 text-[12px] font-semibold uppercase tracking-wide text-white rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: TEAL }}
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Publish Page ─────────────────────────────────────────────────────────────

export function PublishPage() {
  const [apps,            setApps]            = useState<Application[]>(MOCK_APPS);
  const [view,            setView]            = useState<"grid" | "list">("grid");
  const [selectedApp,     setSelectedApp]     = useState<Application | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const handleCreate = (name: string) => {
    const newApp: Application = {
      id: `app-${Date.now()}`,
      name: name.toUpperCase(),
      description: "",
      status: "created",
      category: "APPLICATION INSIGHT",
      industries: [],
      tags: [],
      url: "",
      updatedAt: "Just now",
      versions: 0,
      issueCount: 0,
    };
    setApps((p) => [newApp, ...p]);
  };

  if (selectedApp) {
    return <ApplicationDetail app={selectedApp} onBack={() => setSelectedApp(null)} />;
  }

  return (
    <div className="flex flex-col gap-6">
      {showCreateModal && (
        <CreateApplicationModal
          onClose={() => setShowCreateModal(false)}
          onCreate={handleCreate}
        />
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-[16px] font-bold text-neutral-900">All Applications</h1>
          <p className="text-[11px] text-neutral-400 mt-0.5">{apps.length} applications total</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Grid / List toggle */}
          <div className="flex items-center border border-neutral-200 rounded-[4px] p-0.5 bg-white">
            <button
              onClick={() => setView("grid")}
              className={cn("p-1.5 rounded-[3px] transition-colors", view === "grid" ? "bg-[#00775B] text-white" : "text-neutral-400 hover:text-neutral-700")}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setView("list")}
              className={cn("p-1.5 rounded-[3px] transition-colors", view === "list" ? "bg-[#00775B] text-white" : "text-neutral-400 hover:text-neutral-700")}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-9 px-4 text-[12px] font-semibold text-white rounded-[4px] flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: TEAL }}
          >
            <Plus className="w-4 h-4" /> Create Application
          </button>
        </div>
      </div>

      {/* Applications */}
      {view === "grid" ? (
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {apps.map((app) => (
            <AppCard key={app.id} app={app} onClick={() => setSelectedApp(app)} />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden">
          <DataGrid<Application>
            searchable
            searchPlaceholder="Search applications…"
            columns={[
              {
                key: "name",
                header: "Application",
                render: (row, hov) => (
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-[4px] flex-shrink-0 overflow-hidden" style={{ backgroundColor: "#004d38" }}>
                      <div className="w-full h-full opacity-40" style={{ backgroundImage: "linear-gradient(#00ff88 1px,transparent 1px),linear-gradient(90deg,#00ff88 1px,transparent 1px)", backgroundSize: "6px 6px" }} />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <InterCell hovered={hov} isPrimary fontSize={12}>{row.name}</InterCell>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-sm w-fit mt-0.5" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>{row.category}</span>
                    </div>
                  </div>
                ),
              },
              {
                key: "description",
                header: "Description",
                render: (row, hov) => <InterCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.description || "—"}</InterCell>,
              },
              {
                key: "industries",
                header: "Industries",
                width: "180px",
                render: (row) => (
                  <div className="flex flex-wrap gap-1">
                    {row.industries.length > 0
                      ? row.industries.map((ind) => (
                          <span key={ind} className="text-[9px] font-semibold uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-sm">{ind}</span>
                        ))
                      : <span className="text-[11px] text-neutral-300">—</span>
                    }
                  </div>
                ),
              },
              {
                key: "versions",
                header: "Versions",
                width: "76px",
                align: "right",
                render: (row, hov) => <MonoCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#0F172A">{row.versions}</MonoCell>,
              },
              {
                key: "status",
                header: "Status",
                width: "110px",
                render: (row) => (
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[row.status] }} />
                    <span className="text-[10px] font-bold tracking-wide" style={{ color: STATUS_DOT[row.status] }}>{STATUS_LABEL[row.status]}</span>
                  </div>
                ),
              },
              {
                key: "updatedAt",
                header: "Updated",
                width: "100px",
                align: "right",
                render: (row, hov) => <MonoCell hovered={hov} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.updatedAt}</MonoCell>,
              },
              {
                key: "actions",
                header: "",
                width: "70px",
                align: "right",
                render: (row, hov) => (
                  <div className="flex justify-end pr-1">
                    <GridActions visible={hov}>
                      <GridActionButton title="Open" hoverColor={TEAL} onClick={() => setSelectedApp(row)}>
                        <Eye className="w-3.5 h-3.5" />
                      </GridActionButton>
                      <GridActionButton title="Delete" hoverColor="#DC2626">
                        <Trash2 className="w-3.5 h-3.5" />
                      </GridActionButton>
                    </GridActions>
                  </div>
                ),
              },
            ]}
            data={apps}
          />
        </div>
      )}
    </div>
  );
}
