import { useState } from "react";
import {
  LayoutGrid, List, Plus, ArrowLeft, ChevronDown, ChevronRight,
  Upload, X, AlertCircle, ExternalLink, Eye, Trash2, RefreshCw,
} from "lucide-react";
import { StatCard, StatCardData } from "@/app/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, StatusCapsule, GridActions, GridActionButton } from "@/app/components/ui/DataGrid";
import { Label } from "@/app/components/ui/label";
import { Input } from "@/app/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/app/components/ui/select";
import { Textarea } from "@/app/components/ui/textarea";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Types ────────────────────────────────────────────────────────────────────

type AppStatus = "published" | "in-review" | "created" | "rejected";

type Application = {
  id: string;
  name: string;
  description: string;
  status: AppStatus;
  category: string;
  industries: string[];
  tags: string[];
  url: string;
  updatedAt: string;
  versions: number;
  issueCount: number;
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
  { id: "app-001", name: "IOROIEHOI",         description: "vdsgvxfdbg",                                              status: "published", category: "APPLICATION INSIGHT", industries: ["Oil & Gas", "Automotive"],  tags: ["detection", "analytics"], url: "https://dev.app.matrice.ai/publish/app-001", updatedAt: "May 11, 2026",  versions: 2, issueCount: 0 },
  { id: "app-002", name: "TEST NEW ZIP",       description: "Description",                                             status: "in-review", category: "APPLICATION INSIGHT", industries: ["Airport", "Automotive"],   tags: ["detection"],              url: "",                                          updatedAt: "Jan 12, 2026",  versions: 1, issueCount: 1 },
  { id: "app-003", name: "PEOPLE COUNTING",    description: "https://dev.app.matrice.ai/publish/686d0ece378",          status: "published", category: "APPLICATION INSIGHT", industries: ["Oil & Gas", "Agriculture"],tags: ["counting", "tracking"],   url: "https://dev.app.matrice.ai/publish/686d0ece378", updatedAt: "Nov 13, 2025", versions: 3, issueCount: 0 },
  { id: "app-004", name: "COCO",               description: "https://dev.app.matrice.ai/publish/886d0ece378",          status: "published", category: "APPLICATION INSIGHT", industries: ["Cafe", "Manufacturing"],  tags: ["object-detection"],       url: "https://dev.app.matrice.ai/publish/886d0ece378", updatedAt: "May 8, 2026",  versions: 2, issueCount: 0 },
  { id: "app-005", name: "TESTING-1",          description: "https://dev.app.matrice.ai/publish",                      status: "created",   category: "APPLICATION INSIGHT", industries: [],                         tags: [],                         url: "https://dev.app.matrice.ai/publish",        updatedAt: "Jul 15, 2025",  versions: 0, issueCount: 0 },
  { id: "app-006", name: "TEST_PROJ_3",        description: "This is a test project. 1. This has a numbered list.",   status: "created",   category: "APPLICATION INSIGHT", industries: [],                         tags: [],                         url: "https://dev.app.matrice.ai/publish",        updatedAt: "Jul 16, 2025",  versions: 0, issueCount: 0 },
  { id: "app-007", name: "TESTING",            description: "vufof",                                                   status: "in-review", category: "APPLICATION INSIGHT", industries: [],                         tags: [],                         url: "",                                          updatedAt: "Jul 28, 2025",  versions: 1, issueCount: 0 },
  { id: "app-008", name: "CHECK FOR CAM",      description: "Hello",                                                   status: "created",   category: "APPLICATION INSIGHT", industries: [],                         tags: [],                         url: "",                                          updatedAt: "Jul 23, 2025",  versions: 0, issueCount: 0 },
];

const MOCK_ISSUES: ReportedIssue[] = [
  { id: "iss-001", appName: "TEST NEW ZIP", version: "v1.0", issueType: "Model Output", subIssue: "Incorrect Labels",   status: "open",        reportCount: 3, createdAt: "2026-04-20", updatedAt: "2026-05-01" },
  { id: "iss-002", appName: "TEST NEW ZIP", version: "v1.0", issueType: "Performance",  subIssue: "High Latency",       status: "in-progress", reportCount: 1, createdAt: "2026-05-02", updatedAt: "2026-05-08" },
];

// ─── Stats ────────────────────────────────────────────────────────────────────

const STATS: StatCardData[] = [
  { label: "Total Applications", value: "8",  sublabel: "All Published & Draft", num: "+2",  ref_: "vs Last Month",  dir: "up",     chip: "TOTAL",    color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Published",          value: "3",  sublabel: "Live on Marketplace",   num: "+1",  ref_: "vs Last Month",  dir: "up",     chip: "LIVE",     color: TEAL,      bgColor: "#E5FFF9" },
  { label: "In Review",          value: "2",  sublabel: "Awaiting Approval",     num: "0",   ref_: "No Change",      dir: "neutral",chip: "REVIEW",   color: "#D97706", bgColor: "#FFFBEB" },
  { label: "Issues Reported",    value: "2",  sublabel: "Open Across All Apps",  num: "+2",  ref_: "vs Last Week",   dir: "up",     chip: "ISSUES",   color: "#DC2626", bgColor: "#FEF2F2" },
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

// ─── App card thumbnail (simulated detection overlay) ────────────────────────

function AppThumbnail({ status }: { status: AppStatus }) {
  const colors: Record<AppStatus, string> = {
    published:  "#004d38",
    "in-review":"#3b2a00",
    created:    "#1e293b",
    rejected:   "#3b0a0a",
  };
  return (
    <div
      className="w-full h-40 relative overflow-hidden flex-shrink-0"
      style={{ backgroundColor: colors[status] }}
    >
      {/* Simulated detection grid */}
      <div className="absolute inset-0 opacity-10"
        style={{ backgroundImage: "linear-gradient(#00ff88 1px,transparent 1px),linear-gradient(90deg,#00ff88 1px,transparent 1px)", backgroundSize: "24px 24px" }} />
      {/* Bounding boxes */}
      <div className="absolute top-8 left-6 w-20 h-14 border-2 border-[#00ff88] opacity-70 rounded-sm" />
      <div className="absolute top-12 left-32 w-16 h-18 border-2 border-[#ffdd00] opacity-60 rounded-sm" />
      <div className="absolute top-6 left-56 w-24 h-20 border-2 border-[#00aaff] opacity-50 rounded-sm" />
      <div className="absolute top-16 right-10 w-14 h-12 border-2 border-[#ff4444] opacity-60 rounded-sm" />
    </div>
  );
}

// ─── Application Card ─────────────────────────────────────────────────────────

function AppCard({ app, onClick }: { app: Application; onClick: () => void }) {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col cursor-pointer hover:border-[#00775B]/40 hover:shadow-md transition-all"
    >
      <AppThumbnail status={app.status} />
      <div className="p-3 flex flex-col gap-2 flex-1">
        <div className="flex items-start justify-between gap-2">
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
            {app.category}
          </span>
          {app.issueCount > 0 && (
            <span className="flex items-center gap-1 text-[10px] text-red-500 font-semibold">
              <AlertCircle className="w-3 h-3" /> {app.issueCount}
            </span>
          )}
        </div>
        <h3 className="text-[13px] font-bold text-neutral-900 leading-tight">{app.name}</h3>
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_DOT[app.status] }} />
          <span className="text-[10px] font-bold tracking-wide" style={{ color: STATUS_DOT[app.status] }}>
            {STATUS_LABEL[app.status]}
          </span>
          <span className="text-[10px] text-neutral-400 ml-1">Updated {app.updatedAt}</span>
        </div>
        <p className="text-[11px] text-neutral-400 truncate">{app.description || "—"}</p>
        {app.industries.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-auto pt-1">
            {app.industries.map((ind) => (
              <span key={ind} className="text-[9px] font-semibold uppercase tracking-wide px-2 py-0.5 bg-neutral-100 text-neutral-500 rounded-sm">
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
        <AppThumbnail status={app.status} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-bold text-neutral-900">{app.name}</span>
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
          <button onClick={onClose} className="h-9 px-5 text-[12px] font-semibold text-neutral-600 hover:text-neutral-800 transition-colors mr-2">
            Cancel
          </button>
          <button
            disabled={!name}
            onClick={() => { onCreate(name); onClose(); }}
            className="h-9 px-7 text-[12px] font-semibold text-white rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            style={{ backgroundColor: TEAL }}
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Add Models Modal ─────────────────────────────────────────────────────────

function AddModelsModal({ appName, onClose }: { appName: string; onClose: () => void }) {
  const [objects,        setObjects]       = useState("");
  const [settingsOpen,   setSettingsOpen]  = useState(true);
  const [categories,     setCategories]    = useState<{ id: string; name: string; classes: string }[]>([]);

  const addCategory = () => setCategories(p => [...p, { id: Date.now().toString(), name: "", classes: "" }]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-[6px] shadow-2xl w-full max-w-2xl mx-4 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-100">
          <h2 className="text-[15px] font-bold text-neutral-900">Add Model(s) to Application</h2>
          <button onClick={onClose} className="p-1 text-neutral-400 hover:text-neutral-700 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-0 overflow-y-auto">
          {/* Version-level settings */}
          <div className="border-b border-neutral-100">
            <button
              onClick={() => setSettingsOpen(p => !p)}
              className="w-full flex items-center justify-between px-6 py-3.5 text-[13px] font-semibold text-neutral-800 hover:bg-neutral-50 transition-colors"
            >
              Version-level settings
              <ChevronDown className={cn("w-4 h-4 text-neutral-400 transition-transform", settingsOpen && "rotate-180")} />
            </button>
            {settingsOpen && (
              <div className="px-6 pb-5 flex flex-col gap-4">
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
                  <Label className="text-xs text-neutral-600">Color Mapping (Optional)</Label>
                  <div className="border border-neutral-200 rounded-[4px] px-4 py-3 bg-neutral-50/60">
                    <p className="text-[11px] text-neutral-400">
                      {objects.trim()
                        ? "Set custom colors for each detected object class."
                        : "No detection objects available for this application."}
                    </p>
                  </div>
                </div>

                {/* Supported Categories */}
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label className="text-xs text-neutral-600">Supported Categories</Label>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Add one row per category and assign tracking classes for that category only.</p>
                    </div>
                    <button
                      onClick={addCategory}
                      className="flex items-center gap-1.5 text-[11px] font-semibold transition-colors"
                      style={{ color: TEAL }}
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Category
                    </button>
                  </div>
                  <div className="border border-neutral-200 rounded-[4px] overflow-hidden">
                    {categories.length === 0 ? (
                      <div className="px-4 py-4 text-[11px] text-neutral-400">
                        No categories added yet. Click "Add Category" to define a category-to-classes mapping.
                      </div>
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
                            <input
                              value={cat.classes}
                              onChange={(e) => setCategories(p => p.map((c, j) => j === i ? { ...c, classes: e.target.value } : c))}
                              placeholder="Classes (comma-separated)"
                              className="flex-[2] h-8 px-2 text-[12px] border border-neutral-200 rounded-[4px] outline-none focus:border-[#00775B] transition-colors"
                            />
                            <button onClick={() => setCategories(p => p.filter((_, j) => j !== i))} className="text-neutral-300 hover:text-red-500 transition-colors">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Inspection Models */}
          <div className="px-6 py-4 flex flex-col gap-2">
            <Label className="text-xs text-neutral-600">Inspection Models (CAM Files)</Label>
            <div
              className="flex flex-col items-center justify-center gap-2 py-6 rounded-[4px] border-2 border-dashed border-[#00775B]/30 bg-neutral-50/60 cursor-pointer hover:border-[#00775B]/60 transition-colors"
            >
              <Upload className="w-5 h-5 text-neutral-400" />
              <p className="text-[12px] text-neutral-500">Drag & drop CAM files, or <span className="text-[#00775B] font-semibold">browse</span></p>
              <p className="text-[10px] text-neutral-400">Supports .cam, .zip formats</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-neutral-100">
          <button onClick={onClose} className="h-9 px-5 text-[12px] font-semibold text-neutral-600 hover:text-neutral-800 transition-colors mr-2">
            Cancel
          </button>
          <button
            className="h-9 px-7 text-[12px] font-semibold text-white rounded-[4px] transition-colors"
            style={{ backgroundColor: TEAL }}
            onClick={onClose}
          >
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Application Detail ───────────────────────────────────────────────────────

type DetailTab = "overview" | "issues" | "versions";

function ApplicationDetail({
  app,
  onBack,
}: {
  app: Application;
  onBack: () => void;
}) {
  const [tab,            setTab]            = useState<DetailTab>("issues");
  const [showAddModels,  setShowAddModels]  = useState(false);
  const [versionFilter,  setVersionFilter]  = useState("all");
  const [typeFilter,     setTypeFilter]     = useState("all");

  const appIssues = MOCK_ISSUES.filter((i) => i.appName === app.name);

  const TABS: { id: DetailTab; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "issues",   label: `Reported Issues${appIssues.length > 0 ? ` (${appIssues.length})` : ""}` },
    { id: "versions", label: "Versions" },
  ];

  return (
    <div className="flex flex-col gap-6">
      {showAddModels && <AddModelsModal appName={app.name} onClose={() => setShowAddModels(false)} />}

      {/* Breadcrumb */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button onClick={onBack} className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-neutral-800 transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> Publish
          </button>
          <span className="text-neutral-300">/</span>
          <span className="text-[12px] font-semibold text-neutral-800">{app.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAddModels(true)}
            className="h-8 px-4 text-[11px] font-semibold text-white rounded-[4px] flex items-center gap-1.5 transition-colors"
            style={{ backgroundColor: TEAL }}
          >
            <Plus className="w-3.5 h-3.5" /> Add Versions
          </button>
        </div>
      </div>

      {/* App header card */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex gap-0">
        <div className="w-48 flex-shrink-0">
          <AppThumbnail status={app.status} />
        </div>
        <div className="flex-1 p-5 flex flex-col gap-2 justify-center border-l border-neutral-100">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-sm" style={{ backgroundColor: "#E5FFF9", color: TEAL }}>
                  {app.category}
                </span>
              </div>
              <h2 className="text-[18px] font-bold text-neutral-900">{app.name}</h2>
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
            <span>{app.versions} version{app.versions !== 1 ? "s" : ""}</span>
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
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden">
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
            <div className="grid grid-cols-3 gap-4">
              {[
                { label: "Total Versions", value: String(app.versions) },
                { label: "Open Issues",    value: String(app.issueCount) },
                { label: "Status",         value: STATUS_LABEL[app.status] },
              ].map((item) => (
                <div key={item.label} className="border border-neutral-100 rounded-[4px] p-4 bg-neutral-50/50">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">{item.label}</p>
                  <p className="text-[20px] font-bold font-mono text-neutral-900 mt-1">{item.value}</p>
                </div>
              ))}
            </div>
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400">Description</p>
              <p className="text-[13px] text-neutral-700">{app.description || "No description provided."}</p>
            </div>
          </div>
        )}

        {/* Reported Issues */}
        {tab === "issues" && (
          <div className="flex flex-col">
            {/* Filters */}
            <div className="flex items-end gap-3 px-5 py-4 border-b border-neutral-100 bg-neutral-50/50">
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-500">Version</Label>
                <Select value={versionFilter} onValueChange={setVersionFilter}>
                  <SelectTrigger className="h-9 w-36 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Versions</SelectItem>
                    {Array.from({ length: app.versions }, (_, i) => (
                      <SelectItem key={i} value={`v${i + 1}.0`}>v{i + 1}.0</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-500">Issue Type</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="h-9 w-40 text-[12px]"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="model-output">Model Output</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
                    <SelectItem value="ui">UI / UX</SelectItem>
                    <SelectItem value="crash">Crash</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <button
                className="h-9 px-5 text-[12px] font-semibold text-white rounded-[4px] transition-colors"
                style={{ backgroundColor: TEAL }}
              >
                Apply Filters
              </button>
            </div>

            {appIssues.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-3">
                <div className="w-16 h-16 rounded-full bg-neutral-100 flex items-center justify-center">
                  <AlertCircle className="w-7 h-7 text-neutral-300" />
                </div>
                <p className="text-[13px] font-semibold text-neutral-500">No issues found</p>
                <p className="text-[11px] text-neutral-400">No issues have been reported for this application</p>
              </div>
            ) : (
              <DataGrid<ReportedIssue>
                columns={[
                  { key: "appName",     header: "Application Name", render: (r, h) => <InterCell hovered={h} isPrimary fontSize={11}>{r.appName}</InterCell> },
                  { key: "version",     header: "Version",  width: "80px",  render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#0F172A">{r.version}</MonoCell> },
                  { key: "issueType",   header: "Issue Type", width: "130px", render: (r, h) => <InterCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#334155">{r.issueType}</InterCell> },
                  { key: "subIssue",    header: "Sub Issue", render: (r, h) => <InterCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#334155">{r.subIssue}</InterCell> },
                  { key: "status",      header: "Status",   width: "110px", render: (r) => <StatusCapsule status={ISSUE_STATUS_KEY[r.status]} label={ISSUE_STATUS_LABEL[r.status]} /> },
                  { key: "reportCount", header: "Report Count", width: "100px", align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#0F172A">{r.reportCount}</MonoCell> },
                  { key: "createdAt",   header: "Created At",   width: "100px", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.createdAt}</MonoCell> },
                  { key: "updatedAt",   header: "Last Updated", width: "100px", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.updatedAt}</MonoCell> },
                  { key: "actions",     header: "", width: "60px", align: "right", render: (_, h) => (
                    <div className="flex justify-end pr-1">
                      <GridActions visible={h}>
                        <GridActionButton title="View" hoverColor={TEAL}><Eye className="w-3.5 h-3.5" /></GridActionButton>
                      </GridActions>
                    </div>
                  )},
                ]}
                data={appIssues}
              />
            )}
          </div>
        )}

        {/* Versions */}
        {tab === "versions" && (
          <div className="p-6">
            {app.versions === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <p className="text-[13px] font-semibold text-neutral-500">No versions yet</p>
                <p className="text-[11px] text-neutral-400">Click "Add Versions" to upload your first model version.</p>
                <button
                  onClick={() => setShowAddModels(true)}
                  className="mt-2 h-8 px-5 text-[12px] font-semibold text-white rounded-[4px] flex items-center gap-1.5"
                  style={{ backgroundColor: TEAL }}
                >
                  <Plus className="w-3.5 h-3.5" /> Add Versions
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-3">
                {Array.from({ length: app.versions }, (_, i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-neutral-200 rounded-[4px] bg-neutral-50/50">
                    <div>
                      <p className="text-[12px] font-bold text-neutral-800">Version v{i + 1}.0</p>
                      <p className="text-[11px] text-neutral-400 mt-0.5">Published {app.updatedAt}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusCapsule status={i === app.versions - 1 ? "active" : "offline"} label={i === app.versions - 1 ? "Latest" : "Archived"} />
                      <GridActions visible>
                        <GridActionButton title="View" hoverColor={TEAL}><Eye className="w-3.5 h-3.5" /></GridActionButton>
                        <GridActionButton title="Refresh" hoverColor="#0284C7"><RefreshCw className="w-3.5 h-3.5" /></GridActionButton>
                        <GridActionButton title="Delete" hoverColor="#DC2626"><Trash2 className="w-3.5 h-3.5" /></GridActionButton>
                      </GridActions>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
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
          {apps.map((app) => (
            <AppListRow key={app.id} app={app} onClick={() => setSelectedApp(app)} />
          ))}
        </div>
      )}
    </div>
  );
}
