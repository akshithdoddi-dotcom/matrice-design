import { useState } from "react";
import {
  Sigma,
  Bell,
  Plus,
  LayoutGrid,
  Camera as CameraIcon,
  MapPin,
  Clock,
  Zap,
  Mail,
  Calendar,
  Target,
  Braces,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { CreateMetricDialog } from "./CreateMetricDialog";
import { CreateRuleDialog } from "./CreateRuleDialog";
import { ConfirmDeleteDialog } from "./ConfirmDeleteDialog";
import { RenameDialog } from "./RenameDialog";
import { MetricsRulesHeader } from "./MetricsRulesHeader";
import {
  CardMenu,
  MetricDef,
  Pagination,
  RuleDef,
  StatusToggle,
  ViewMode,
  ViewToggle,
  getSeverityConfig,
} from "./metricsRulesShared";

const PAGE_SIZE = 6;

const INITIAL_METRICS: MetricDef[] = [
  {
    id: "m1",
    name: "Pedestrian Crowd 1",
    application: "People Counting",
    camera: "Cam-L02",
    location: "Lobby Reception",
    formula: "playback_cam_1_total_new_count",
    frequency: "Hourly",
    createdDate: "Jul 9",
    active: true,
  },
  {
    id: "m2",
    name: "PPE Violations Hourly",
    application: "PPE Detection",
    camera: "Cam-F03",
    location: "Factory Floor",
    formula: "cam_f03_ppe_violation_count",
    frequency: "Hourly",
    createdDate: "Jul 8",
    active: true,
  },
  {
    id: "m3",
    name: "Illegal Parking Count",
    application: "License Plate Recognition",
    camera: "Cam-LD01",
    location: "Loading Dock",
    formula: "cam_ld01_illegal_park_count",
    frequency: "Daily",
    createdDate: "Jul 8",
    active: true,
  },
  {
    id: "m4",
    name: "Loitering Duration Avg",
    application: "Crowd Analytics",
    camera: "Cam-PL02",
    location: "Parking Level B",
    formula: "cam_pl02_loiter_duration_avg",
    frequency: "Hourly",
    createdDate: "Jul 7",
    active: true,
  },
  {
    id: "m5",
    name: "Tailgating Events",
    application: "Intrusion Detection",
    camera: "Cam-T01",
    location: "Employee Turnstile",
    formula: "cam_t01_tailgate_event_count",
    frequency: "Daily",
    createdDate: "Jul 6",
    active: false,
  },
  {
    id: "m6",
    name: "Face Match Alerts",
    application: "Face Recognition",
    camera: "Cam-NE02",
    location: "North Entrance",
    formula: "cam_ne02_face_match_count",
    frequency: "Hourly",
    createdDate: "Jul 5",
    active: true,
  },
  {
    id: "m7",
    name: "Crowd Density Peak",
    application: "Crowd Analytics",
    camera: "Cam-S01",
    location: "Server Room A",
    formula: "cam_s01_crowd_density_peak",
    frequency: "Weekly",
    createdDate: "Jul 3",
    active: true,
  },
  {
    id: "m8",
    name: "Door Forced Events",
    application: "Intrusion Detection",
    camera: "Cam-BE01",
    location: "Back Exit",
    formula: "cam_be01_door_forced_count",
    frequency: "Daily",
    createdDate: "Jul 1",
    active: false,
  },
];

const INITIAL_RULES: RuleDef[] = [
  {
    id: "r1",
    name: "Pedestrian Rule 1",
    targetMetricId: "m1",
    operator: ">",
    threshold: 2,
    unit: "count",
    severity: "critical",
    cooldownMinutes: 5,
    triggeredCount: 2,
    notifyEmails: ["ops-team@matrice.ai"],
    createdDate: "Jul 9",
    active: true,
  },
  {
    id: "r2",
    name: "PPE Rule 1",
    targetMetricId: "m2",
    operator: ">",
    threshold: 0,
    unit: "count",
    severity: "high",
    cooldownMinutes: 10,
    triggeredCount: 5,
    notifyEmails: ["safety@matrice.ai"],
    createdDate: "Jul 8",
    active: true,
  },
  {
    id: "r3",
    name: "Parking Rule 1",
    targetMetricId: "m3",
    operator: ">=",
    threshold: 5,
    unit: "count",
    severity: "medium",
    cooldownMinutes: 30,
    triggeredCount: 1,
    notifyEmails: ["security@matrice.ai"],
    createdDate: "Jul 8",
    active: true,
  },
  {
    id: "r4",
    name: "Loitering Rule 1",
    targetMetricId: "m4",
    operator: ">",
    threshold: 120,
    unit: "sec",
    severity: "high",
    cooldownMinutes: 15,
    triggeredCount: 3,
    notifyEmails: ["ops-team@matrice.ai", "security@matrice.ai"],
    createdDate: "Jul 7",
    active: true,
  },
  {
    id: "r5",
    name: "Tailgating Rule 1",
    targetMetricId: "m5",
    operator: ">",
    threshold: 0,
    unit: "count",
    severity: "critical",
    cooldownMinutes: 5,
    triggeredCount: 0,
    notifyEmails: ["security@matrice.ai"],
    createdDate: "Jul 6",
    active: false,
  },
  {
    id: "r6",
    name: "Face Match Rule 1",
    targetMetricId: "m6",
    operator: ">=",
    threshold: 1,
    unit: "count",
    severity: "critical",
    cooldownMinutes: 1,
    triggeredCount: 8,
    notifyEmails: ["security@matrice.ai"],
    createdDate: "Jul 5",
    active: true,
  },
  {
    id: "r7",
    name: "Crowd Density Rule 1",
    targetMetricId: "m7",
    operator: ">",
    threshold: 50,
    unit: "count",
    severity: "low",
    cooldownMinutes: 60,
    triggeredCount: 0,
    notifyEmails: ["ops-team@matrice.ai"],
    createdDate: "Jul 3",
    active: true,
  },
  {
    id: "r8",
    name: "Door Forced Rule 1",
    targetMetricId: "m8",
    operator: ">",
    threshold: 0,
    unit: "count",
    severity: "medium",
    cooldownMinutes: 5,
    triggeredCount: 4,
    notifyEmails: ["security@matrice.ai"],
    createdDate: "Jul 1",
    active: false,
  },
];

const DetailRow = ({ icon: Icon, label, value }: { icon: any; label: string; value: string }) => (
  <div className="flex items-start gap-2 min-w-0">
    <Icon className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0" />
    <div className="min-w-0">
      <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">{label}</div>
      <div className="text-[11px] font-medium text-neutral-700 truncate">{value}</div>
    </div>
  </div>
);

const MetricCard = ({
  metric,
  onRename,
  onEdit,
  onDelete,
}: {
  metric: MetricDef;
  onRename: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => (
  <div className="group bg-white rounded-[4px] border border-neutral-200 shadow-sm hover:border-[#00775B]/30 hover:shadow-md transition-all duration-200 flex flex-col w-full max-w-sm">
    <div className="flex items-start justify-between p-4 pb-3">
      <div className="flex items-center gap-2.5 min-w-0">
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-sm font-bold text-neutral-800 truncate">{metric.name}</span>
            {metric.active && <span className="w-1.5 h-1.5 rounded-full bg-[#00A63E] shrink-0" />}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[9px] font-bold uppercase tracking-wide text-[#00775B] bg-[#E5FFF9] px-1.5 py-0.5 rounded">
              {metric.frequency}
            </span>
            <span className="text-[10px] text-neutral-400">{metric.createdDate}</span>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 gap-2.5 px-4 pb-3">
      <DetailRow icon={LayoutGrid} label="Application" value={metric.application} />
      <DetailRow icon={CameraIcon} label="Camera" value={metric.camera} />
      <DetailRow icon={MapPin} label="Location" value={metric.location} />
    </div>

    <div className="border-t border-neutral-100 px-4 py-3 mt-auto flex items-end justify-between gap-3">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
          <Braces className="w-3 h-3" /> Formula
        </div>
        <code className="block bg-[#F8FAFC] border border-neutral-100 rounded px-2 py-1.5 text-[11px] font-mono text-[#00775B] truncate">
          {metric.formula}
        </code>
      </div>
      <CardMenu onRename={onRename} onEdit={onEdit} onDelete={onDelete} />
    </div>
  </div>
);

const RuleCard = ({
  rule,
  metricName,
  onRename,
  onEdit,
  onDelete,
  onToggle,
}: {
  rule: RuleDef;
  metricName: string;
  onRename: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (id: string) => void;
}) => {
  const sev = getSeverityConfig(rule.severity);

  return (
    <div className="group bg-white rounded-[4px] border border-neutral-200 shadow-sm hover:border-[#00775B]/30 hover:shadow-md transition-all duration-200 flex flex-col w-full max-w-sm">
      <div className="flex items-start justify-between p-4 pb-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="min-w-0">
            <span className="text-sm font-bold text-neutral-800 truncate block">{rule.name}</span>
            <span className="text-[10px] text-neutral-400">
              ID: {rule.id.slice(0, 8)}
              {rule.id.length > 8 ? "..." : ""}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <span
            className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded text-white"
            style={{ backgroundColor: sev.bright }}
          >
            {rule.severity}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2.5 px-4 pb-3">
        <DetailRow icon={Target} label="Target Metric" value={metricName} />
        <DetailRow icon={Braces} label="Condition" value={`${rule.operator} ${rule.threshold} ${rule.unit}`} />
        <DetailRow icon={Clock} label="Cooldown" value={`${rule.cooldownMinutes} min`} />
        <DetailRow icon={Zap} label="Triggered" value={`${rule.triggeredCount} times`} />
        <DetailRow
          icon={Mail}
          label="Notifies"
          value={`${rule.notifyEmails.length} recipient${rule.notifyEmails.length !== 1 ? "s" : ""}`}
        />
        <DetailRow icon={Calendar} label="Created" value={rule.createdDate} />
      </div>

      <div className="border-t border-neutral-100 px-4 py-3 mt-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold uppercase tracking-wide text-neutral-400">Status</span>
          <span
            className={cn(
              "text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded",
              rule.active ? "bg-[#E5FFEF] text-[#00A63E]" : "bg-neutral-100 text-neutral-400"
            )}
          >
            {rule.active ? "Active" : "Inactive"}
          </span>
        </div>
        <div className="flex items-center gap-2.5">
          <StatusToggle active={rule.active} onChange={() => onToggle(rule.id)} />
          <CardMenu onRename={onRename} onEdit={onEdit} onDelete={onDelete} />
        </div>
      </div>
    </div>
  );
};

const METRICS_TABLE_COLS = "2fr 0.8fr 1.2fr 1fr 1.2fr 1.6fr 0.7fr 40px";
const RULES_TABLE_COLS = "1.6fr 0.8fr 1.3fr 1fr 0.8fr 0.8fr 0.9fr 0.7fr 0.9fr 40px";

const TableHeaderCell = ({ children }: { children: React.ReactNode }) => (
  <div className="text-[10px] font-bold uppercase tracking-wide text-neutral-400 truncate">{children}</div>
);

const MetricsTable = ({
  metrics,
  onRename,
  onEdit,
  onDelete,
}: {
  metrics: MetricDef[];
  onRename: (m: MetricDef) => void;
  onEdit: (m: MetricDef) => void;
  onDelete: (m: MetricDef) => void;
}) => (
  <div className="overflow-x-auto">
    <div className="min-w-[820px]">
      <div className="grid gap-3 px-3 py-2 border-b border-neutral-200" style={{ gridTemplateColumns: METRICS_TABLE_COLS }}>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell>Frequency</TableHeaderCell>
        <TableHeaderCell>Application</TableHeaderCell>
        <TableHeaderCell>Camera</TableHeaderCell>
        <TableHeaderCell>Location</TableHeaderCell>
        <TableHeaderCell>Formula</TableHeaderCell>
        <TableHeaderCell>Created</TableHeaderCell>
        <span />
      </div>
      {metrics.map((m, idx) => (
        <div
          key={m.id}
          className={cn(
            "grid gap-3 px-3 py-2.5 items-center border-b border-neutral-100 last:border-b-0 hover:bg-[#E5FFF9] transition-colors",
            idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
          )}
          style={{ gridTemplateColumns: METRICS_TABLE_COLS }}
        >
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-xs font-bold text-neutral-800 truncate">{m.name}</span>
            {m.active && <span className="w-1.5 h-1.5 rounded-full bg-[#00A63E] shrink-0" />}
          </div>
          <span className="text-[11px] font-medium text-neutral-600 truncate">{m.frequency}</span>
          <span className="text-[11px] font-medium text-neutral-600 truncate">{m.application}</span>
          <span className="text-[11px] font-medium text-neutral-600 truncate">{m.camera}</span>
          <span className="text-[11px] font-medium text-neutral-600 truncate">{m.location}</span>
          <code className="text-[10px] font-mono text-[#00775B] truncate">{m.formula}</code>
          <span className="text-[11px] text-neutral-400 truncate">{m.createdDate}</span>
          <CardMenu onRename={() => onRename(m)} onEdit={() => onEdit(m)} onDelete={() => onDelete(m)} />
        </div>
      ))}
    </div>
  </div>
);

const RulesTable = ({
  rules,
  metrics,
  onRename,
  onEdit,
  onDelete,
  onToggle,
}: {
  rules: RuleDef[];
  metrics: MetricDef[];
  onRename: (r: RuleDef) => void;
  onEdit: (r: RuleDef) => void;
  onDelete: (r: RuleDef) => void;
  onToggle: (id: string) => void;
}) => (
  <div className="overflow-x-auto">
    <div className="min-w-[920px]">
      <div className="grid gap-3 px-3 py-2 border-b border-neutral-200" style={{ gridTemplateColumns: RULES_TABLE_COLS }}>
        <TableHeaderCell>Name</TableHeaderCell>
        <TableHeaderCell>Severity</TableHeaderCell>
        <TableHeaderCell>Target Metric</TableHeaderCell>
        <TableHeaderCell>Condition</TableHeaderCell>
        <TableHeaderCell>Cooldown</TableHeaderCell>
        <TableHeaderCell>Triggered</TableHeaderCell>
        <TableHeaderCell>Notifies</TableHeaderCell>
        <TableHeaderCell>Created</TableHeaderCell>
        <TableHeaderCell>Status</TableHeaderCell>
        <span />
      </div>
      {rules.map((r, idx) => {
        const sev = getSeverityConfig(r.severity);
        const metricName = metrics.find((m) => m.id === r.targetMetricId)?.name ?? "Unknown Metric";
        return (
          <div
            key={r.id}
            className={cn(
              "grid gap-3 px-3 py-2.5 items-center border-b border-neutral-100 last:border-b-0 hover:bg-[#E5FFF9] transition-colors",
              idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
            )}
            style={{ gridTemplateColumns: RULES_TABLE_COLS }}
          >
            <div className="min-w-0">
              <div className="text-xs font-bold text-neutral-800 truncate">{r.name}</div>
              <div className="text-[10px] text-neutral-400">ID: {r.id.slice(0, 8)}</div>
            </div>
            <span
              className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded text-white w-fit"
              style={{ backgroundColor: sev.bright }}
            >
              {r.severity}
            </span>
            <span className="text-[11px] font-medium text-neutral-600 truncate">{metricName}</span>
            <span className="text-[11px] font-medium text-neutral-600 truncate">{`${r.operator} ${r.threshold} ${r.unit}`}</span>
            <span className="text-[11px] font-medium text-neutral-600 truncate">{r.cooldownMinutes} min</span>
            <span className="text-[11px] font-medium text-neutral-600 truncate">{r.triggeredCount}x</span>
            <span className="text-[11px] font-medium text-neutral-600 truncate">
              {r.notifyEmails.length} recipient{r.notifyEmails.length !== 1 ? "s" : ""}
            </span>
            <span className="text-[11px] text-neutral-400 truncate">{r.createdDate}</span>
            <StatusToggle active={r.active} onChange={() => onToggle(r.id)} />
            <CardMenu onRename={() => onRename(r)} onEdit={() => onEdit(r)} onDelete={() => onDelete(r)} />
          </div>
        );
      })}
    </div>
  </div>
);

const EmptySection = ({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
  disabled,
}: {
  icon: any;
  title: string;
  description: string;
  actionLabel: string;
  onAction: () => void;
  disabled?: boolean;
}) => (
  <div className="bg-white border border-dashed border-neutral-200 rounded-sm p-10 flex flex-col items-center justify-center text-center">
    <div className="bg-neutral-50 p-4 rounded-full mb-4">
      <Icon className="w-8 h-8 text-neutral-400" />
    </div>
    <h4 className="text-sm font-bold text-neutral-700 mb-1">{title}</h4>
    <p className="text-xs text-neutral-500 max-w-xs mb-4">{description}</p>
    <button
      onClick={onAction}
      disabled={disabled}
      className="flex items-center gap-1.5 text-xs font-bold text-[#00775B] bg-[#E5FFF9] hover:bg-[#00775B] hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-sm"
    >
      <Plus className="w-3.5 h-3.5" /> {actionLabel}
    </button>
  </div>
);

type PendingDelete = { type: "metric" | "rule"; id: string; name: string };
type Renaming = { type: "metric" | "rule"; id: string; name: string };

export const MetricsRules = ({ persona }: { persona: Persona }) => {
  const [metrics, setMetrics] = useState<MetricDef[]>(INITIAL_METRICS);
  const [rules, setRules] = useState<RuleDef[]>(INITIAL_RULES);
  const [isCreateMetricOpen, setIsCreateMetricOpen] = useState(false);
  const [isCreateRuleOpen, setIsCreateRuleOpen] = useState(false);
  const [editingMetric, setEditingMetric] = useState<MetricDef | null>(null);
  const [editingRule, setEditingRule] = useState<RuleDef | null>(null);
  const [renaming, setRenaming] = useState<Renaming | null>(null);
  const [statusFilter, setStatusFilter] = useState("All");
  const [pendingDelete, setPendingDelete] = useState<PendingDelete | null>(null);
  const [metricsPage, setMetricsPage] = useState(1);
  const [rulesPage, setRulesPage] = useState(1);
  const [metricsView, setMetricsView] = useState<ViewMode>("grid");
  const [rulesView, setRulesView] = useState<ViewMode>("grid");

  const matchesStatus = (active: boolean) =>
    statusFilter === "All" || (statusFilter === "Active" ? active : !active);

  const filteredMetrics = metrics.filter((m) => matchesStatus(m.active));
  const filteredRules = rules.filter((r) => matchesStatus(r.active));

  const totalMetricPages = Math.max(1, Math.ceil(filteredMetrics.length / PAGE_SIZE));
  const safeMetricsPage = Math.min(metricsPage, totalMetricPages);
  const paginatedMetrics = filteredMetrics.slice((safeMetricsPage - 1) * PAGE_SIZE, safeMetricsPage * PAGE_SIZE);

  const totalRulePages = Math.max(1, Math.ceil(filteredRules.length / PAGE_SIZE));
  const safeRulesPage = Math.min(rulesPage, totalRulePages);
  const paginatedRules = filteredRules.slice((safeRulesPage - 1) * PAGE_SIZE, safeRulesPage * PAGE_SIZE);

  const handleSaveMetric = (metric: MetricDef) =>
    setMetrics((prev) => (prev.some((m) => m.id === metric.id) ? prev.map((m) => (m.id === metric.id ? metric : m)) : [metric, ...prev]));
  const handleSaveRule = (rule: RuleDef) =>
    setRules((prev) => (prev.some((r) => r.id === rule.id) ? prev.map((r) => (r.id === rule.id ? rule : r)) : [rule, ...prev]));
  const handleToggleRule = (id: string) =>
    setRules((prev) => prev.map((r) => (r.id === id ? { ...r, active: !r.active } : r)));

  const confirmDelete = () => {
    if (!pendingDelete) return;
    if (pendingDelete.type === "metric") {
      setMetrics((prev) => prev.filter((m) => m.id !== pendingDelete.id));
      setRules((prev) => prev.filter((r) => r.targetMetricId !== pendingDelete.id));
    } else {
      setRules((prev) => prev.filter((r) => r.id !== pendingDelete.id));
    }
    setPendingDelete(null);
  };

  const openCreateMetric = () => {
    setEditingMetric(null);
    setIsCreateMetricOpen(true);
  };
  const openCreateRule = () => {
    setEditingRule(null);
    setIsCreateRuleOpen(true);
  };

  const handleRenameSave = (name: string) => {
    if (!renaming) return;
    if (renaming.type === "metric") {
      setMetrics((prev) => prev.map((m) => (m.id === renaming.id ? { ...m, name } : m)));
    } else {
      setRules((prev) => prev.map((r) => (r.id === renaming.id ? { ...r, name } : r)));
    }
    setRenaming(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <MetricsRulesHeader
        persona={persona}
        statusFilter={statusFilter}
        onStatusFilterChange={(next) => {
          setStatusFilter(next);
          setMetricsPage(1);
          setRulesPage(1);
        }}
      />

      {/* Metrics */}
      <section className="bg-white rounded-[4px] border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">Metrics</h3>
              <span className="text-[10px] font-bold text-[#00775B] bg-[#E5FFF9] rounded-full px-2 py-0.5">
                {filteredMetrics.length}
              </span>
            </div>
            <p className="text-xs text-neutral-500">Custom values from your camera data.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ViewToggle view={metricsView} onChange={setMetricsView} />
            <button
              onClick={openCreateMetric}
              className="flex items-center gap-1.5 bg-[#00775B] hover:bg-[#005f48] text-white text-xs font-bold px-3 py-2 rounded-sm shadow-sm transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Create Metric
            </button>
          </div>
        </div>
        <div className="px-5 pt-4 pb-5">
          {filteredMetrics.length === 0 ? (
            <EmptySection
              icon={Sigma}
              title={metrics.length === 0 ? "No metrics yet" : "No metrics match your filters"}
              description={
                metrics.length === 0
                  ? "Create your first custom metric to start tracking operational data."
                  : "Try a different status filter."
              }
              actionLabel="Create Metric"
              onAction={openCreateMetric}
            />
          ) : (
            <>
              {metricsView === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedMetrics.map((m) => (
                    <MetricCard
                      key={m.id}
                      metric={m}
                      onRename={() => setRenaming({ type: "metric", id: m.id, name: m.name })}
                      onEdit={() => {
                        setEditingMetric(m);
                        setIsCreateMetricOpen(true);
                      }}
                      onDelete={() => setPendingDelete({ type: "metric", id: m.id, name: m.name })}
                    />
                  ))}
                </div>
              ) : (
                <MetricsTable
                  metrics={paginatedMetrics}
                  onRename={(m) => setRenaming({ type: "metric", id: m.id, name: m.name })}
                  onEdit={(m) => {
                    setEditingMetric(m);
                    setIsCreateMetricOpen(true);
                  }}
                  onDelete={(m) => setPendingDelete({ type: "metric", id: m.id, name: m.name })}
                />
              )}
              {totalMetricPages > 1 && (
                <Pagination
                  currentPage={safeMetricsPage}
                  totalPages={totalMetricPages}
                  totalItems={filteredMetrics.length}
                  itemsPerPage={PAGE_SIZE}
                  onPageChange={setMetricsPage}
                />
              )}
            </>
          )}
        </div>
      </section>

      {/* Alert Rules */}
      <section className="bg-white rounded-[4px] border border-neutral-200 shadow-sm">
        <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-neutral-100">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wide">Alert Rules</h3>
              <span className="text-[10px] font-bold text-[#00775B] bg-[#E5FFF9] rounded-full px-2 py-0.5">
                {filteredRules.length}
              </span>
            </div>
            <p className="text-xs text-neutral-500">Thresholds that trigger alerts.</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <ViewToggle view={rulesView} onChange={setRulesView} />
            <button
              onClick={openCreateRule}
              disabled={metrics.length === 0}
              title={metrics.length === 0 ? "Create a metric first" : undefined}
              className="flex items-center gap-1.5 border border-[#00775B] text-[#00775B] hover:bg-[#E5FFF9] disabled:opacity-40 disabled:cursor-not-allowed disabled:border-neutral-200 disabled:text-neutral-400 disabled:hover:bg-transparent text-xs font-bold px-3 py-2 rounded-sm transition-colors shrink-0"
            >
              <Plus className="w-3.5 h-3.5" /> Create Rule
            </button>
          </div>
        </div>
        <div className="px-5 pt-4 pb-5">
          {filteredRules.length === 0 ? (
            <EmptySection
              icon={Bell}
              title={rules.length === 0 ? "No alert rules yet" : "No rules match your filters"}
              description={
                rules.length === 0
                  ? "Set thresholds on your metrics to trigger alerts and notify your team."
                  : "Try a different status filter."
              }
              actionLabel="Create Rule"
              onAction={openCreateRule}
              disabled={metrics.length === 0}
            />
          ) : (
            <>
              {rulesView === "grid" ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                  {paginatedRules.map((r) => (
                    <RuleCard
                      key={r.id}
                      rule={r}
                      metricName={metrics.find((m) => m.id === r.targetMetricId)?.name ?? "Unknown Metric"}
                      onRename={() => setRenaming({ type: "rule", id: r.id, name: r.name })}
                      onEdit={() => {
                        setEditingRule(r);
                        setIsCreateRuleOpen(true);
                      }}
                      onDelete={() => setPendingDelete({ type: "rule", id: r.id, name: r.name })}
                      onToggle={handleToggleRule}
                    />
                  ))}
                </div>
              ) : (
                <RulesTable
                  rules={paginatedRules}
                  metrics={metrics}
                  onRename={(r) => setRenaming({ type: "rule", id: r.id, name: r.name })}
                  onEdit={(r) => {
                    setEditingRule(r);
                    setIsCreateRuleOpen(true);
                  }}
                  onDelete={(r) => setPendingDelete({ type: "rule", id: r.id, name: r.name })}
                  onToggle={handleToggleRule}
                />
              )}
              {totalRulePages > 1 && (
                <Pagination
                  currentPage={safeRulesPage}
                  totalPages={totalRulePages}
                  totalItems={filteredRules.length}
                  itemsPerPage={PAGE_SIZE}
                  onPageChange={setRulesPage}
                />
              )}
            </>
          )}
        </div>
      </section>

      <CreateMetricDialog
        open={isCreateMetricOpen}
        onOpenChange={(next) => {
          setIsCreateMetricOpen(next);
          if (!next) setEditingMetric(null);
        }}
        onSave={handleSaveMetric}
        editingMetric={editingMetric}
      />
      <CreateRuleDialog
        open={isCreateRuleOpen}
        onOpenChange={(next) => {
          setIsCreateRuleOpen(next);
          if (!next) setEditingRule(null);
        }}
        metrics={metrics}
        onSave={handleSaveRule}
        editingRule={editingRule}
      />
      <RenameDialog
        open={renaming !== null}
        title={`Rename ${renaming?.type === "metric" ? "Metric" : "Rule"}`}
        initialName={renaming?.name ?? ""}
        onOpenChange={(next) => { if (!next) setRenaming(null); }}
        onSave={handleRenameSave}
      />
      <ConfirmDeleteDialog
        open={pendingDelete !== null}
        title={`Delete ${pendingDelete?.type === "metric" ? "metric" : "rule"} "${pendingDelete?.name ?? ""}"?`}
        description={
          pendingDelete?.type === "metric"
            ? "This will also remove any alert rules that target this metric. This action cannot be undone."
            : "This will stop all alerting on this rule. This action cannot be undone."
        }
        onCancel={() => setPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </div>
  );
};
