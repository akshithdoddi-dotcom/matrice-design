import { useState } from "react";
import { Plus, ExternalLink, StopCircle, AlertTriangle } from "lucide-react";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { Label } from "@fe-common/components/ui/label";
import { Input } from "@fe-common/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe-common/components/ui/select";
import { Switch } from "@fe-common/components/ui/switch";
import { Deployment, TrainingProject } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

const STATS: StatCardData[] = [
  { label: "Total Deployments", value: "2",    sublabel: "All Endpoints",   num: "+1",   ref_: "vs Last Month", dir: "up",     chip: "TOTAL",   color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Live",              value: "1",    sublabel: "Serving Traffic",  num: "0",    ref_: "No Change",     dir: "neutral",chip: "LIVE",    color: TEAL,      bgColor: "#E5FFF9" },
  { label: "Avg Latency",       value: "38ms", sublabel: "Live Endpoints",   num: "-4ms", ref_: "vs Last Week",  dir: "down",   chip: "LATENCY", color: "#059669", bgColor: "#ECFDF5" },
  { label: "Stopped",           value: "1",    sublabel: "Inactive",         num: "0",    ref_: "No Change",     dir: "neutral",chip: "STOPPED", color: "#94A3B8", bgColor: "#F1F5F9" },
];

const MOCK_PROJECT_DEPLOYMENTS: Deployment[] = [
  { id: "dep-001", modelName: "PPE-Detect-v1.4",     endpoint: "api.matrice.ai/ppe/v1",        status: "live",    region: "us-east-1", latencyMs: 38, createdAt: "2026-04-15" },
  { id: "dep-002", modelName: "PPE-Detect-v1.3",     endpoint: "api.matrice.ai/ppe/v1-legacy", status: "stopped", region: "us-east-1", latencyMs: 0,  createdAt: "2026-03-10" },
];

const DEP_STATUS_KEY:   Record<Deployment["status"], string> = { live: "active", stopped: "offline", error: "critical" };
const DEP_STATUS_LABEL: Record<Deployment["status"], string> = { live: "Live",   stopped: "Stopped", error: "Error"    };

// ─── Schedule entry ───────────────────────────────────────────────────────────

type ScheduleEntry = { id: string; startDate: string; endDate: string; startTime: string; endTime: string; custom: boolean };

function ScheduleCard({ entry, index, onRemove, onChange }: {
  entry: ScheduleEntry;
  index: number;
  onRemove: () => void;
  onChange: (e: Partial<ScheduleEntry>) => void;
}) {
  return (
    <div className="border border-neutral-200 rounded-[4px] bg-white">
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-neutral-100">
        <span className="text-[12px] font-semibold text-neutral-700">Schedule #{index + 1}</span>
        <button onClick={onRemove} className="text-[11px] text-neutral-400 hover:text-red-500 transition-colors">Remove</button>
      </div>
      <div className="p-4 flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Start Date</Label>
            <Input type="date" value={entry.startDate} onChange={(e) => onChange({ startDate: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">End Date</Label>
            <Input type="date" value={entry.endDate} onChange={(e) => onChange({ endDate: e.target.value })} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">Start Time</Label>
            <Input type="time" value={entry.startTime} onChange={(e) => onChange({ startTime: e.target.value })} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label className="text-xs text-neutral-600">End Time</Label>
            <Input type="time" value={entry.endTime} onChange={(e) => onChange({ endTime: e.target.value })} />
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Label className="text-xs text-neutral-600">Every Day</Label>
          <Switch checked={entry.custom} onCheckedChange={(v) => onChange({ custom: v })} />
          <Label className="text-xs text-neutral-600">Custom</Label>
        </div>
      </div>
    </div>
  );
}

// ─── Toggle row ───────────────────────────────────────────────────────────────

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5 border-b border-neutral-100">
      <Label className="text-[13px] text-neutral-700 font-normal cursor-pointer">{label}</Label>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

// ─── Create Deployment form ───────────────────────────────────────────────────

function CreateDeploymentForm() {
  const [compute,      setCompute]      = useState("auto");
  const [depName,      setDepName]      = useState("");
  const [gpuRequired,  setGpuRequired]  = useState(true);
  const [kafkaEnabled, setKafkaEnabled] = useState(false);
  const [modelType,    setModelType]    = useState("trained");
  const [modelName,    setModelName]    = useState("");
  const [autoScale,    setAutoScale]    = useState(false);
  const [autoShutdown, setAutoShutdown] = useState(false);
  const [customSched,  setCustomSched]  = useState(true);
  const [serverType,   setServerType]   = useState("fastapi");
  const [schedules,    setSchedules]    = useState<ScheduleEntry[]>([{
    id: "s1", startDate: "2026-05-11", endDate: "2026-05-18", startTime: "09:00", endTime: "17:00", custom: false,
  }]);

  const addSchedule = () => setSchedules(p => [...p, {
    id: Date.now().toString(), startDate: "", endDate: "", startTime: "09:00", endTime: "17:00", custom: false,
  }]);

  return (
    <div className="flex flex-col gap-5 p-5">
      {/* Compute (top right) */}
      <div className="flex justify-end">
        <div className="w-80 flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Compute</Label>
          <Select value={compute} onValueChange={setCompute}>
            <SelectTrigger className="h-10 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="auto">Automatically launch a new instance</SelectItem>
              <SelectItem value="matrice">Matrice Cloud GPU</SelectItem>
              <SelectItem value="aws">AWS p3.2xlarge</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-[11px] text-neutral-400">
            You can also configure your compute or use auto{" "}
            <button className="text-[#00775B] font-medium hover:underline">Add Compute</button>
          </p>
        </div>
      </div>

      {/* Two-column form */}
      <div className="grid grid-cols-2 gap-6">
        {/* Left */}
        <div className="border border-neutral-200 rounded-[4px] bg-white overflow-hidden">
          <div className="p-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Deployment Name</Label>
              <Input
                placeholder="e.g. ppe-detector-prod"
                value={depName}
                onChange={(e) => setDepName(e.target.value)}
                validationStatus={depName === "" ? undefined : undefined}
              />
            </div>
          </div>
          <ToggleRow label="GPU Required"  checked={gpuRequired}  onChange={setGpuRequired} />
          <ToggleRow label="Kafka Enabled" checked={kafkaEnabled} onChange={setKafkaEnabled} />
          <div className="p-4 flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Model Type</Label>
              <Select value={modelType} onValueChange={setModelType}>
                <SelectTrigger className="h-10 text-[12px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="trained">Trained / Exported Model</SelectItem>
                  <SelectItem value="onnx">ONNX Model</SelectItem>
                  <SelectItem value="tensorrt">TensorRT Engine</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-1.5">
              <Label className="text-xs text-neutral-600">Model Name</Label>
              <Select value={modelName} onValueChange={setModelName}>
                <SelectTrigger className="h-10 text-[12px]">
                  <SelectValue placeholder="Select a model…" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ppe-v14">PPE-Detect-v1.4</SelectItem>
                  <SelectItem value="ppe-v13">PPE-Detect-v1.3</SelectItem>
                  <SelectItem value="yolo-seg">YOLOv11-seg</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Right */}
        <div className="border border-neutral-200 rounded-[4px] bg-white overflow-hidden">
          <ToggleRow label="Auto Scale"    checked={autoScale}    onChange={setAutoScale} />
          <ToggleRow label="Auto Shutdown" checked={autoShutdown} onChange={(v) => { setAutoShutdown(v); if (v) setCustomSched(false); }} />
          {(autoShutdown || customSched) && (
            <div className="p-3 flex items-start gap-2 bg-[#FFFBEB]">
              <AlertTriangle className="w-4 h-4 text-[#D97706] shrink-0 mt-0.5" />
              <p className="text-[11px] text-[#92400E]">
                Auto Shutdown and Custom Schedule are mutually exclusive; enabling one will automatically disable the other.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Custom Schedule section */}
      <div className="border border-neutral-200 rounded-[4px] bg-white overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-100">
          <div className="flex items-center gap-3">
            <span className="text-[13px] font-semibold text-neutral-800">Custom Schedule</span>
            <Switch
              checked={customSched}
              onCheckedChange={(v) => { setCustomSched(v); if (v) setAutoShutdown(false); }}
            />
          </div>
          {customSched && (
            <button onClick={addSchedule}
              className="h-8 px-4 text-[11px] font-semibold text-white rounded-[4px] flex items-center gap-1.5"
              style={{ backgroundColor: TEAL }}>
              <Plus className="w-3.5 h-3.5" /> Add Another
            </button>
          )}
        </div>
        {customSched && (
          <div className="p-4 flex flex-col gap-4">
            {schedules.map((s, i) => (
              <ScheduleCard key={s.id} entry={s} index={i}
                onRemove={() => setSchedules(p => p.filter((_, j) => j !== i))}
                onChange={(upd) => setSchedules(p => p.map((x, j) => j === i ? { ...x, ...upd } : x))}
              />
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="w-40 flex flex-col gap-1.5">
          <Label className="text-xs text-neutral-600">Server Type</Label>
          <Select value={serverType} onValueChange={setServerType}>
            <SelectTrigger className="h-10 text-[12px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fastapi">fastapi</SelectItem>
              <SelectItem value="flask">flask</SelectItem>
              <SelectItem value="triton">triton</SelectItem>
              <SelectItem value="torchserve">torchserve</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <button disabled={!depName || !modelName}
          className="h-9 px-8 text-[12px] font-semibold text-white rounded-[4px] disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ backgroundColor: TEAL }}>
          Create
        </button>
      </div>
    </div>
  );
}

// ─── Deployments page ─────────────────────────────────────────────────────────

type DTab = "create" | "deployments";

interface DeploymentsProps { project: TrainingProject; }

export function Deployments({ project: _project }: DeploymentsProps) {
  const [tab, setTab] = useState<DTab>("create");

  const TABS: { id: DTab; label: string }[] = [
    { id: "create",      label: "Create Deployment" },
    { id: "deployments", label: "All Deployments"   },
  ];

  return (
    <div className="flex flex-col gap-6 p-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Main card with tabs */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden">
        {/* Tab bar */}
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

        {tab === "create"      && <CreateDeploymentForm />}

        {tab === "deployments" && (
          <DataGrid<Deployment>
            columns={[
              { key: "id",         header: "Deployment ID", width: "110px", render: (r, h) => <MonoCell hovered={h} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>{r.id}</MonoCell> },
              { key: "modelName",  header: "Model",                         render: (r, h) => <InterCell hovered={h} isPrimary fontSize={11}>{r.modelName}</InterCell> },
              { key: "endpoint",   header: "Endpoint",                      render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#64748B" hoveredColor="#0F172A">{r.endpoint}</MonoCell> },
              { key: "status",     header: "Status",          width: "90px", render: (r) => <StatusCapsule status={DEP_STATUS_KEY[r.status]} label={DEP_STATUS_LABEL[r.status]} /> },
              { key: "region",     header: "Region",          width: "110px",render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.region}</MonoCell> },
              { key: "latencyMs",  header: "Latency",         width: "80px", align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11} color={r.latencyMs > 0 ? "#059669" : "#94A3B8"} hoveredColor="#0F172A">{r.latencyMs > 0 ? `${r.latencyMs}ms` : "—"}</MonoCell> },
              { key: "createdAt",  header: "Created",         width: "96px", align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.createdAt}</MonoCell> },
              { key: "actions",    header: "",                width: "70px", align: "right", render: (r, h) => (
                <div className="flex justify-end pr-1">
                  <GridActions visible={h}>
                    <GridActionButton title="Open Endpoint" hoverColor="#0284C7"><ExternalLink className="w-3.5 h-3.5" /></GridActionButton>
                    {r.status === "live" && <GridActionButton title="Stop" hoverColor="#BE123C"><StopCircle className="w-3.5 h-3.5" /></GridActionButton>}
                  </GridActions>
                </div>
              )},
            ]}
            data={MOCK_PROJECT_DEPLOYMENTS}
          />
        )}

      </div>
    </div>
  );
}
