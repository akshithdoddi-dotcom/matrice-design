import { useState } from "react";
import { TrendingUp, LayoutGrid, List, Tag, Cpu, Clock, ArrowUpRight, Copy } from "lucide-react";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";
import { SegmentedControl } from "@fe-common/components/ui/segmented-control";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fe-common/components/ui/dialog";
import { Input } from "@fe-common/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe-common/components/ui/select";
import { Label } from "@fe-common/components/ui/label";
import { MOCK_PROJECTS, MOCK_TRAINING_JOBS, TrainingProject, TrainingJob } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ── Tab config ─────────────────────────────────────────────────────────────────

type DashTab = "projects" | "activities" | "users" | "cloud" | "settings";

const DASH_TABS: { id: DashTab; label: string }[] = [
  { id: "projects",   label: "Projects" },
  { id: "activities", label: "Activities" },
  { id: "users",      label: "Users" },
  { id: "cloud",      label: "Cloud Integrations" },
  { id: "settings",   label: "Account Settings" },
];

// ── KPI cards ──────────────────────────────────────────────────────────────────

const DASHBOARD_STATS: StatCardData[] = [
  { label: "Total Projects",       value: "8",  sublabel: "Build & Deploy · All Time", num: "+2", ref_: "vs Last Month", dir: "up",      chip: "ALL TIME", color: "#64748B", bgColor: "#F1F5F9" },
  { label: "Active Training Jobs", value: "3",  sublabel: "Currently Running · Live",  num: "+1", ref_: "vs Yesterday",  dir: "up",      chip: "LIVE",     color: "#64748B", bgColor: "#F1F5F9" },
  { label: "Datasets",             value: "12", sublabel: "Across All Projects",        num: "0",  ref_: "No Change",     dir: "neutral", chip: "STORED",   color: "#64748B", bgColor: "#F1F5F9" },
  { label: "Models Deployed",      value: "3",  sublabel: "Live API Endpoints",         num: "+1", ref_: "vs Last Week",  dir: "up",      chip: "DEPLOYED", color: "#64748B", bgColor: "#F1F5F9" },
];

// ── Status helpers ─────────────────────────────────────────────────────────────

const PROJECT_STATUS_KEY: Record<TrainingProject["status"], string> = {
  draft: "unknown", training: "active", complete: "success", failed: "critical", paused: "pending",
};
const PROJECT_STATUS_LABEL: Record<TrainingProject["status"], string> = {
  draft: "Draft", training: "Training", complete: "Complete", failed: "Failed", paused: "Paused",
};
const PROJECT_STATUS_COLOR: Record<TrainingProject["status"], { bg: string; text: string; dot: string }> = {
  draft:    { bg: "bg-neutral-100", text: "text-neutral-500", dot: "bg-neutral-400" },
  training: { bg: "bg-blue-50",     text: "text-blue-600",    dot: "bg-blue-500"    },
  complete: { bg: "bg-[#E5FFF9]",   text: "text-[#00775B]",   dot: "bg-[#00775B]"  },
  failed:   { bg: "bg-red-50",      text: "text-red-600",     dot: "bg-red-500"     },
  paused:   { bg: "bg-amber-50",    text: "text-amber-600",   dot: "bg-amber-500"   },
};
const PROJECT_TYPE_COLOR: Record<TrainingProject["type"], { bg: string; text: string }> = {
  build:  { bg: "bg-[#00775B]/10", text: "text-[#00775B]" },
  deploy: { bg: "bg-[#0284C7]/10", text: "text-[#0284C7]" },
};

const JOB_STATUS_KEY: Record<TrainingJob["status"], string> = {
  running: "active", queued: "info", paused: "pending",
};
const JOB_STATUS_LABEL: Record<TrainingJob["status"], string> = {
  running: "Running", queued: "Queued", paused: "Paused",
};

// ── Activities ─────────────────────────────────────────────────────────────────

type Activity = {
  id: string;
  actionType: string;
  project: string;
  user: string;
  instanceId: string;
  gpuRequired: string;
  stepCode: string;
  status: string;
  computeConfig: string;
  totalCredits: number;
  serviceName: string;
  updatedAt: string;
};

const ACTIVITY_STATUS_STYLE: Record<string, { bg: string; text: string }> = {
  Completed: { bg: "bg-[#E5FFF9]", text: "text-[#00775B]" },
  Running:   { bg: "bg-blue-50",   text: "text-blue-600"  },
  Failed:    { bg: "bg-red-50",    text: "text-red-600"   },
  Queued:    { bg: "bg-amber-50",  text: "text-amber-600" },
  Live:      { bg: "bg-[#E5FFF9]", text: "text-[#00775B]" },
};

const MOCK_ACTIVITIES: Activity[] = [
  { id: "act-001", actionType: "Training", project: "PPE-Detect-v1.4", user: "Mohammed Usman F", instanceId: "i-0a1b2c3d4e", gpuRequired: "Yes", stepCode: "STEP_001", status: "Completed", computeConfig: "p3.2xlarge", totalCredits: 120, serviceName: "EC2 Training", updatedAt: "Jun 14, 2026" },
  { id: "act-002", actionType: "Deploy",   project: "PPE-Detect-v1.4", user: "Mohammed Usman F", instanceId: "i-0f5e6d7c8b", gpuRequired: "No",  stepCode: "STEP_002", status: "Live",      computeConfig: "t3.medium",  totalCredits: 15,  serviceName: "EC2 Deploy",   updatedAt: "Jun 14, 2026" },
  { id: "act-003", actionType: "Training", project: "SentimentV2",     user: "Mohammed Usman F", instanceId: "i-0b9a8f7e6d", gpuRequired: "Yes", stepCode: "STEP_001", status: "Running",   computeConfig: "p3.8xlarge", totalCredits: 480, serviceName: "EC2 Training", updatedAt: "Jun 15, 2026" },
  { id: "act-004", actionType: "Training", project: "FraudDetect",     user: "Mohammed Usman F", instanceId: "i-0c1d2e3f4a", gpuRequired: "Yes", stepCode: "STEP_001", status: "Failed",    computeConfig: "p3.2xlarge", totalCredits: 60,  serviceName: "EC2 Training", updatedAt: "Jun 13, 2026" },
  { id: "act-005", actionType: "Deploy",   project: "SentimentV2",     user: "Mohammed Usman F", instanceId: "i-0d5e6f7a8b", gpuRequired: "No",  stepCode: "STEP_002", status: "Queued",    computeConfig: "t3.medium",  totalCredits: 0,   serviceName: "EC2 Deploy",   updatedAt: "Jun 15, 2026" },
];

const ACTIVITY_COLUMNS: ColumnDef<Activity>[] = [
  { id: "id",           accessorKey: "id",           header: "Action Id",     cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-600">{row.id}</span> },
  { id: "actionType",   accessorKey: "actionType",   header: "Action Type",   cell: ({ row }) => <span className="text-[11px] text-neutral-700">{row.actionType}</span> },
  { id: "project",      accessorKey: "project",      header: "Project",       cell: ({ row }) => <span className="text-[11px] text-neutral-700">{row.project}</span> },
  { id: "user",         accessorKey: "user",         header: "User",          cell: ({ row }) => <span className="text-[11px] text-neutral-600">{row.user}</span> },
  { id: "instanceId",   accessorKey: "instanceId",   header: "Instance Id",   cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.instanceId}</span> },
  { id: "gpuRequired",  accessorKey: "gpuRequired",  header: "GPU Required",  cell: ({ row }) => <span className={cn("text-[11px]", row.gpuRequired === "Yes" ? "text-[#00775B] font-medium" : "text-neutral-400")}>{row.gpuRequired}</span> },
  { id: "stepCode",     accessorKey: "stepCode",     header: "Step Code",     cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.stepCode}</span> },
  {
    id: "status", accessorKey: "status", header: "Status",
    cell: ({ row }) => {
      const s = ACTIVITY_STATUS_STYLE[row.status] ?? { bg: "bg-neutral-100", text: "text-neutral-500" };
      return <span className={cn("inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full", s.bg, s.text)}>{row.status}</span>;
    },
  },
  { id: "computeConfig", accessorKey: "computeConfig", header: "Compute Config", cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.computeConfig}</span> },
  { id: "totalCredits",  accessorKey: "totalCredits",  header: "Total Credits",  cell: ({ row }) => <span className="text-[11px] font-medium text-neutral-700">{row.totalCredits}</span> },
  { id: "serviceName",   accessorKey: "serviceName",   header: "Service Name",   cell: ({ row }) => <span className="text-[11px] text-neutral-600">{row.serviceName}</span> },
  { id: "updatedAt",     accessorKey: "updatedAt",     header: "Updated At",     cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-400">{row.updatedAt}</span> },
];

// ── Users ──────────────────────────────────────────────────────────────────────

type AppUser = {
  userId: string;
  name: string;
  email: string;
  joiningDate: string;
  role: string;
};

const USER_ROLE_STYLE: Record<string, { bg: string; text: string }> = {
  "Admin":           { bg: "bg-[#00775B]/10", text: "text-[#00775B]"  },
  "ML Engineer":     { bg: "bg-blue-50",       text: "text-blue-600"   },
  "Data Scientist":  { bg: "bg-purple-50",     text: "text-purple-600" },
  "Viewer":          { bg: "bg-neutral-100",   text: "text-neutral-500"},
};

const MOCK_USERS: AppUser[] = [
  { userId: "usr-001", name: "Mohammed Usman F", email: "mohammed.usman@matrice.ai", joiningDate: "Jan 15, 2024", role: "Admin" },
  { userId: "usr-002", name: "Priya Sharma",     email: "priya.sharma@matrice.ai",   joiningDate: "Feb 10, 2024", role: "ML Engineer" },
  { userId: "usr-003", name: "Arjun Menon",      email: "arjun.menon@matrice.ai",    joiningDate: "Mar 01, 2024", role: "Data Scientist" },
  { userId: "usr-004", name: "Sarah Chen",       email: "sarah.chen@matrice.ai",     joiningDate: "Apr 22, 2024", role: "Viewer" },
];

const USER_COLUMNS: ColumnDef<AppUser>[] = [
  { id: "userId",      accessorKey: "userId",      header: "User ID",      cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-600">{row.userId}</span> },
  { id: "name",        accessorKey: "name",        header: "Name",         cell: ({ row }) => <span className="text-[11px] font-medium text-neutral-800">{row.name}</span> },
  { id: "email",       accessorKey: "email",       header: "Email",        cell: ({ row }) => <span className="text-[11px] text-neutral-600">{row.email}</span> },
  { id: "joiningDate", accessorKey: "joiningDate", header: "Joining Date", cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.joiningDate}</span> },
  {
    id: "role", accessorKey: "role", header: "Role",
    cell: ({ row }) => {
      const c = USER_ROLE_STYLE[row.role] ?? { bg: "bg-neutral-100", text: "text-neutral-500" };
      return <span className={cn("inline-flex text-[10px] font-semibold px-2 py-0.5 rounded-full", c.bg, c.text)}>{row.role}</span>;
    },
  },
];

// ── Cloud Integrations ─────────────────────────────────────────────────────────

type Bucket = {
  id: string;
  bucketAlias: string;
  region: string;
  bucketName: string;
  endpointUrl: string;
};

type CloudKey = {
  id: string;
  credentialAlias: string;
  serviceProvider: string;
  accessKey: string;
  expiresOn: string;
};

const MOCK_BUCKETS: Bucket[] = [];
const MOCK_CLOUD_KEYS: CloudKey[] = [];

const BUCKET_COLUMNS: ColumnDef<Bucket>[] = [
  { id: "bucketAlias", accessorKey: "bucketAlias", header: "Bucket Alias",        cell: ({ row }) => <span className="text-[11px] text-neutral-700">{row.bucketAlias}</span> },
  { id: "region",      accessorKey: "region",      header: "Region",              cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.region}</span> },
  { id: "bucketName",  accessorKey: "bucketName",  header: "Bucket Name",         cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-700">{row.bucketName}</span> },
  { id: "endpointUrl", accessorKey: "endpointUrl", header: "Bucket Endpoint URL", cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-400">{row.endpointUrl}</span> },
];

const CLOUD_KEY_COLUMNS: ColumnDef<CloudKey>[] = [
  { id: "credentialAlias", accessorKey: "credentialAlias", header: "Credential Alias",  cell: ({ row }) => <span className="text-[11px] text-neutral-700">{row.credentialAlias}</span> },
  { id: "serviceProvider", accessorKey: "serviceProvider", header: "Service Provider",  cell: ({ row }) => <span className="text-[11px] text-neutral-700">{row.serviceProvider}</span> },
  { id: "accessKey",       accessorKey: "accessKey",       header: "Access Key",        cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.accessKey}</span> },
  { id: "expiresOn",       accessorKey: "expiresOn",       header: "Expires On",        cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.expiresOn}</span> },
];

// ── Component ──────────────────────────────────────────────────────────────────

interface TrainingDashboardProps {
  onOpenProject: (project: TrainingProject) => void;
}

export function TrainingDashboard({ onOpenProject }: TrainingDashboardProps) {
  const [activeTab,   setActiveTab]   = useState<DashTab>("projects");
  const [projectView, setProjectView] = useState<"card" | "table">("card");

  // Add Bucket modal
  const [showAddBucket,     setShowAddBucket]     = useState(false);
  const [bucketAliasSelect, setBucketAliasSelect] = useState("");

  // Add Cloud Key modal
  const [showAddKey,  setShowAddKey]  = useState(false);
  const [keyAlias,    setKeyAlias]    = useState("");
  const [keyAccount,  setKeyAccount]  = useState("");
  const [keyProvider, setKeyProvider] = useState("AWS");
  const [keyAccess,   setKeyAccess]   = useState("");
  const [keySecret,   setKeySecret]   = useState("");
  const [keyExpiry,   setKeyExpiry]   = useState("");

  const recentProjects = [...MOCK_PROJECTS]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 6);

  const activeJobs  = MOCK_TRAINING_JOBS.filter((j) => j.status === "running" || j.status === "queued");
  const runningCount = MOCK_TRAINING_JOBS.filter((j) => j.status === "running").length;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-neutral-200 flex-shrink-0">
        <div className="flex items-center overflow-x-auto px-2">
          {DASH_TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={cn(
                "relative flex-shrink-0 px-4 py-3 text-[12px] font-semibold transition-colors whitespace-nowrap",
                activeTab === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {t.label}
              {activeTab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* ── Scrollable content ── */}
      <div className="flex-1 overflow-auto">

        {/* Projects */}
        {activeTab === "projects" && (
          <div className="flex flex-col gap-6 p-6">
            <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
              {DASHBOARD_STATS.map((d) => <StatCard key={d.label} d={d} />)}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              {/* Recent Projects card */}
              <div className="xl:col-span-2 bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Recent Projects</h2>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-neutral-400">{recentProjects.length} shown</span>
                    <SegmentedControl
                      size="sm"
                      value={projectView}
                      onChange={(v) => setProjectView(v as "card" | "table")}
                      options={[
                        { value: "card",  icon: <LayoutGrid className="w-3 h-3" /> },
                        { value: "table", icon: <List        className="w-3 h-3" /> },
                      ]}
                    />
                  </div>
                </div>

                {projectView === "card" ? (
                  <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {recentProjects.map((p) => {
                      const sc = PROJECT_STATUS_COLOR[p.status];
                      const tc = PROJECT_TYPE_COLOR[p.type];
                      return (
                        <div
                          key={p.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => onOpenProject(p)}
                          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") onOpenProject(p); }}
                          className="group relative bg-white border border-neutral-200 rounded-sm p-4 flex flex-col gap-3 hover:border-[#00775B]/40 hover:shadow-md transition-all cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#00775B]"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="min-w-0">
                              <p className="text-[12px] font-semibold text-neutral-900 truncate leading-snug">{p.name}</p>
                              <p className="text-[10px] text-neutral-400 mt-0.5">{p.industry}</p>
                            </div>
                            <span className={cn("shrink-0 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm", tc.bg, tc.text)}>
                              {p.type}
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-sm">
                              <Tag className="w-2.5 h-2.5" />{p.inputType}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-neutral-500 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-sm">
                              <Cpu className="w-2.5 h-2.5" />{p.computeType}
                            </span>
                            <span className="flex items-center gap-1 text-[10px] text-neutral-400 bg-neutral-50 border border-neutral-100 px-1.5 py-0.5 rounded-sm font-mono">
                              <Clock className="w-2.5 h-2.5" />{p.createdAt}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                            <span className={cn("inline-flex items-center gap-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-full", sc.bg, sc.text)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", sc.dot)} />
                              {PROJECT_STATUS_LABEL[p.status]}
                            </span>
                            <ArrowUpRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <DataGrid<TrainingProject>
                    columns={[
                      { key: "name",      header: "Project Name", render: (row, hovered) => <InterCell hovered={hovered} fontSize={11} isPrimary>{row.name}</InterCell> },
                      { key: "type",      header: "Type",  width: "70px",  render: (row) => <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm", PROJECT_TYPE_COLOR[row.type].bg, PROJECT_TYPE_COLOR[row.type].text)}>{row.type}</span> },
                      { key: "outputType",header: "Output",width: "140px", render: (row, hovered) => <InterCell hovered={hovered} fontSize={10} color="#64748B" hoveredColor="#334155">{row.outputType.replace("_", " ")}</InterCell> },
                      { key: "status",    header: "Status",width: "100px", render: (row) => <StatusCapsule status={PROJECT_STATUS_KEY[row.status]} label={PROJECT_STATUS_LABEL[row.status]} /> },
                      { key: "createdAt", header: "Created",width: "96px", align: "right", render: (row, hovered) => <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.createdAt}</MonoCell> },
                    ]}
                    data={recentProjects}
                    compact
                    onRowClick={(row) => onOpenProject(row)}
                  />
                )}
              </div>

              {/* Active Training Jobs */}
              <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
                  <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Active Jobs</h2>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
                    <span className="text-[10px] text-[#00775B] font-semibold">{runningCount} running</span>
                  </div>
                </div>
                <div className="flex flex-col divide-y divide-neutral-100 flex-1 overflow-y-auto">
                  {activeJobs.length === 0 ? (
                    <div className="flex items-center justify-center flex-1 text-xs text-neutral-400 py-10">No active training jobs</div>
                  ) : (
                    activeJobs.map((job) => (
                      <div key={job.id} className="px-5 py-3.5 hover:bg-neutral-50/70 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-[11px] font-semibold text-neutral-800 truncate flex-1 mr-2">{job.projectName}</span>
                          <StatusCapsule status={JOB_STATUS_KEY[job.status]} label={JOB_STATUS_LABEL[job.status]} />
                        </div>
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex-1 h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", job.status === "running" ? "bg-[#00775B]" : "bg-[#0284C7]/40")}
                              style={{ width: `${job.progress}%` }}
                            />
                          </div>
                          <span className="text-[10px] font-mono text-neutral-500 shrink-0">{job.progress}%</span>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                          <span className="font-mono">{job.gpuModel}</span>
                          <span>·</span>
                          <span>Epoch {job.currentEpoch}/{job.epochs}</span>
                          {job.duration !== "—" && (
                            <>
                              <span>·</span>
                              <span className="flex items-center gap-1"><TrendingUp className="w-2.5 h-2.5" />{job.duration}</span>
                            </>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Activities */}
        {activeTab === "activities" && (
          <div className="p-6">
            <DataTable<Activity>
              columns={ACTIVITY_COLUMNS}
              data={MOCK_ACTIVITIES}
              rowIdKey="id"
              pagination="none"
              cardTitle="Activities"
              toolbar={false}
            />
          </div>
        )}

        {/* Users */}
        {activeTab === "users" && (
          <div className="p-6">
            <DataTable<AppUser>
              columns={USER_COLUMNS}
              data={MOCK_USERS}
              rowIdKey="userId"
              pagination="none"
              cardTitle="Users"
              toolbar={false}
              cardAction={
                <button className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors">
                  + Invite User
                </button>
              }
            />
          </div>
        )}

        {/* Cloud Integrations */}
        {activeTab === "cloud" && (
          <div className="p-6 flex flex-col gap-6">

            {/* Add Bucket modal */}
            <Dialog open={showAddBucket} onOpenChange={setShowAddBucket}>
              <DialogContent className="w-[420px]">
                <DialogHeader>
                  <DialogTitle className="text-[14px]">Add Bucket</DialogTitle>
                </DialogHeader>
                <div className="py-2">
                  <Select value={bucketAliasSelect} onValueChange={setBucketAliasSelect}>
                    <SelectTrigger className="h-10 text-[13px]"><SelectValue placeholder="Select Alias" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="aws-prod">aws-prod</SelectItem>
                      <SelectItem value="gcp-staging">gcp-staging</SelectItem>
                      <SelectItem value="azure-backup">azure-backup</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-1">
                  <button onClick={() => setShowAddBucket(false)} className="h-9 px-5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">Add</button>
                </div>
              </DialogContent>
            </Dialog>

            {/* Add Cloud Access Key modal */}
            <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
              <DialogContent className="w-[420px]">
                <DialogHeader>
                  <DialogTitle className="text-[14px]">Add Cloud Access Key</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-3 py-2">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Cloud Credential Alias</Label>
                    <Input value={keyAlias} onChange={(e) => setKeyAlias(e.target.value)} placeholder="Cloud Credential Alias" className="h-9 text-[13px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Account Number</Label>
                    <Input value={keyAccount} onChange={(e) => setKeyAccount(e.target.value)} placeholder="97828867687 19887307619115" className="h-9 text-[13px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Service Provider</Label>
                    <Select value={keyProvider} onValueChange={setKeyProvider}>
                      <SelectTrigger className="h-10 text-[13px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="AWS">AWS</SelectItem>
                        <SelectItem value="GCP">GCP</SelectItem>
                        <SelectItem value="Azure">Azure</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Access Key</Label>
                    <Input value={keyAccess} onChange={(e) => setKeyAccess(e.target.value)} placeholder="Access Key" className="h-9 text-[13px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Secret Key</Label>
                    <Input value={keySecret} onChange={(e) => setKeySecret(e.target.value)} placeholder="Secret Key" type="password" className="h-9 text-[13px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Expiry</Label>
                    <Input value={keyExpiry} onChange={(e) => setKeyExpiry(e.target.value)} type="date" className="h-9 text-[13px]" />
                  </div>
                </div>
                <div className="flex justify-end pt-1">
                  <button onClick={() => setShowAddKey(false)} className="h-9 px-5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">Add</button>
                </div>
              </DialogContent>
            </Dialog>

            <DataTable<Bucket>
              columns={BUCKET_COLUMNS}
              data={MOCK_BUCKETS}
              rowIdKey="id"
              pagination="none"
              cardTitle="Buckets"
              cardAction={
                <button onClick={() => setShowAddBucket(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors">
                  + Add Bucket
                </button>
              }
            />

            <DataTable<CloudKey>
              columns={CLOUD_KEY_COLUMNS}
              data={MOCK_CLOUD_KEYS}
              rowIdKey="id"
              pagination="none"
              cardTitle="Cloud Access Keys"
              cardAction={
                <button onClick={() => setShowAddKey(true)} className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors">
                  + Add Cloud Access Key
                </button>
              }
            />
          </div>
        )}

        {/* Account Settings */}
        {activeTab === "settings" && (
          <div className="p-6 flex flex-col gap-8">

            {/* Top row: Account Number + Current Plan */}
            <div className="grid grid-cols-2 gap-4">
              {/* Account Number */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Account Number</span>
                  <button
                    onClick={() => navigator.clipboard.writeText("9782886768719887307619115")}
                    className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-neutral-200 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-[#00775B] hover:border-[#00775B]/30 transition-colors"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <p className="text-[13px] font-mono font-semibold text-neutral-800 break-all leading-relaxed">9782886768719887307619115</p>
                <p className="text-[11px] text-neutral-400 leading-relaxed">Keep this number safe and secure — it uniquely identifies your account.</p>
              </div>

              {/* Current Plan */}
              <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3">
                <span className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400">Current Plan</span>
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-[#00775B] text-white text-[11px] font-bold tracking-wide">ENTERPRISE</span>
                  <button className="h-8 px-4 rounded-lg border border-neutral-200 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                    Manage Plan
                  </button>
                </div>
                <p className="text-[11px] text-neutral-500 leading-relaxed">Bespoke deployment, dedicated engineers, and SLAs tailored to your organisation's unique demands.</p>
              </div>
            </div>

            {/* Usage */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">Usage</p>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { label: "Users",        desc: "Accounts & permissions",      value: "18",        pct: 72 },
                  { label: "Projects",     desc: "Training containers",          value: "284",       pct: 88 },
                  { label: "Images",       desc: "Image files across projects",  value: "6,137,318", pct: 94 },
                  { label: "Data Storage", desc: "386,894 MB utilized",          value: "386.9 GB",  pct: 91 },
                ].map(({ label, desc, value, pct }) => (
                  <div key={label} className="bg-white border border-neutral-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-800">{label}</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">{desc}</p>
                      </div>
                      <span className="text-[18px] font-bold text-neutral-800 shrink-0">{value}</span>
                    </div>
                    <div>
                      <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full bg-[#00775B] transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-neutral-400">{pct}% used</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Credits */}
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-widest text-neutral-400 mb-4">Credits</p>
              <div className="grid grid-cols-2 gap-3">
                {/* Subscription */}
                <div className="bg-white border border-neutral-200 rounded-xl p-5 flex flex-col gap-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-neutral-800">Subscription</p>
                    <span className="text-[22px] font-bold text-neutral-300">0</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Renews monthly with your plan. Expires at the end of each billing cycle.</p>
                  <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden mt-auto">
                    <div className="h-full bg-neutral-300 rounded-full" style={{ width: "0%" }} />
                  </div>
                </div>

                {/* Purchased */}
                <div className="bg-white border border-[#00775B]/20 rounded-xl p-5 flex flex-col gap-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-[#00775B]/[0.03] to-transparent pointer-events-none" />
                  <div className="flex items-center justify-between">
                    <p className="text-[13px] font-semibold text-neutral-800">Purchased</p>
                    <span className="text-[22px] font-bold text-[#00775B]">9,605,957</span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed">Bought credits never expire. Use them anytime across all your projects.</p>
                  <div className="h-1.5 bg-[#00775B]/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00775B] rounded-full" style={{ width: "90%" }} />
                  </div>
                  <button className="mt-1 h-8 px-4 rounded-lg bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors self-start flex items-center gap-1.5">
                    Learn More
                    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M7 17L17 7"/><path d="M7 7h10v10"/></svg>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
