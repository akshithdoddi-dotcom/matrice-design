import { useState } from "react";
import { Plus, ExternalLink, StopCircle, AlertTriangle, ArrowLeft, ChevronRight } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { Label } from "@fe-common/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@fe-common/components/ui/dialog";
import { DataTable, type ColumnDef } from "@fe-common/components/ui/data-table";
import { Input } from "@fe-common/components/ui/Input";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@fe-common/components/ui/select";
import { Switch } from "@fe-common/components/ui/switch";
import { Deployment, TrainingProject } from "@/app/data/mockData";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

const STATS: StatCardData[] = [
  { label: "Total Deployments", value: "2",    sublabel: "All Endpoints",   num: "+1",   ref_: "vs Last Month", dir: "up",     chip: "TOTAL",   color: "#64748B", bgColor: "#F1F5F9" },
  { label: "Live",              value: "1",    sublabel: "Serving Traffic",  num: "0",    ref_: "No Change",     dir: "neutral",chip: "LIVE",    color: "#64748B", bgColor: "#F1F5F9" },
  { label: "Avg Latency",       value: "38ms", sublabel: "Live Endpoints",   num: "-4ms", ref_: "vs Last Week",  dir: "down",   chip: "LATENCY", color: "#64748B", bgColor: "#F1F5F9" },
  { label: "Stopped",           value: "1",    sublabel: "Inactive",         num: "0",    ref_: "No Change",     dir: "neutral",chip: "STOPPED", color: "#64748B", bgColor: "#F1F5F9" },
];

const MOCK_PROJECT_DEPLOYMENTS: Deployment[] = [
  { id: "dep-001", modelName: "PPE-Detect-v1.4",     endpoint: "api.matrice.ai/ppe/v1",        status: "live",    region: "us-east-1", latencyMs: 38, createdAt: "2026-04-15" },
  { id: "dep-002", modelName: "PPE-Detect-v1.3",     endpoint: "api.matrice.ai/ppe/v1-legacy", status: "stopped", region: "us-east-1", latencyMs: 0,  createdAt: "2026-03-10" },
];

const DEP_STATUS_KEY:   Record<Deployment["status"], string> = { live: "active", stopped: "offline", error: "critical" };
const DEP_STATUS_LABEL: Record<Deployment["status"], string> = { live: "Live",   stopped: "Stopped", error: "Error"    };

const REQUEST_COUNT_DATA = [
  { time: "Nov 7 10:04 PM", count: 5 },
  { time: "Nov 7 10:05 PM", count: 12 },
  { time: "Nov 7 10:06 PM", count: 20 },
  { time: "Nov 7 10:07 PM", count: 42 },
  { time: "Nov 7 10:08 PM", count: 31 },
  { time: "Nov 7 10:09 PM", count: 25 },
  { time: "Nov 7 10:10 PM", count: 18 },
  { time: "Nov 7 10:11 PM", count: 20 },
];

const LATENCY_DATA = [
  { time: "Nov 7 10:04 PM", averageLatency: 0.68 },
  { time: "Nov 7 10:05 PM", averageLatency: 0.71 },
  { time: "Nov 7 10:06 PM", averageLatency: 0.60 },
  { time: "Nov 7 10:07 PM", averageLatency: 0.35 },
  { time: "Nov 7 10:08 PM", averageLatency: 0.10 },
  { time: "Nov 7 10:09 PM", averageLatency: 0.08 },
  { time: "Nov 7 10:10 PM", averageLatency: 0.10 },
  { time: "Nov 7 10:11 PM", averageLatency: 0.09 },
];

// ─── Auth Key ─────────────────────────────────────────────────────────────────

type AuthKey = { id: string; key: string; keyType: string; expiresAt: string };

const MOCK_AUTH_KEYS: AuthKey[] = [
  { id: "1", key: "672ce53b06f3cf576afe6701", keyType: "external", expiresAt: "Nov 17, 2024 9:35 PM" },
];

const AUTH_KEY_COLUMNS: ColumnDef<AuthKey>[] = [
  {
    id: "key",
    accessorKey: "key",
    header: "Key",
    cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-700">{row.key}</span>,
  },
  {
    id: "keyType",
    accessorKey: "keyType",
    header: "Key Type",
    cell: ({ row }) => <span className="text-[11px] text-neutral-500">{row.keyType}</span>,
  },
  {
    id: "expiresAt",
    accessorKey: "expiresAt",
    header: "Expires At",
    cell: ({ row }) => <span className="text-[11px] text-neutral-500">{row.expiresAt}</span>,
  },
];

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
      {/* Compute */}
      <div className="flex flex-col gap-1.5">
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

// ─── Deployment detail ────────────────────────────────────────────────────────

type DepTab = "dashboard" | "authkeys" | "integrations" | "drift" | "settings" | "predictions" | "camera" | "streaming" | "output";

const DEP_TABS: { id: DepTab; label: string }[] = [
  { id: "dashboard",    label: "Dashboard" },
  { id: "authkeys",     label: "Auth Keys" },
  { id: "integrations", label: "Integrations" },
  { id: "drift",        label: "Drift Monitoring Summary" },
  { id: "settings",     label: "Deployment Settings" },
  { id: "predictions",  label: "Run Predictions" },
  { id: "camera",       label: "Camera Management" },
  { id: "streaming",    label: "Streaming Gateways" },
  { id: "output",       label: "Output Stream" },
];

const DEVICON_BASE = "https://cdn.jsdelivr.net/gh/devicons/devicon/icons";
const CODE_SNIPPETS: { lang: string; icon: string; color: string; code: string }[] = [
  { lang: "Python",     icon: `${DEVICON_BASE}/python/python-original.svg`,         color: "#3776AB", code: `import requests\nurl = "https://prod.backend.app.matrice.ai/v1/model_prediction/deployment/6a0aefce16fd47ac19082292/predict"\nauth_key = "AUTH_KEY"\n\nfiles = {'image': open('file_path', 'rb')}\ndata = {\n  'authKey': auth_key,\n}\nheaders = {}\nresponse = requests.post(url, headers=headers, data=data, files=files)\nprint(response.text)` },
  { lang: "JavaScript", icon: `${DEVICON_BASE}/javascript/javascript-original.svg`, color: "#F7DF1E", code: `const formData = new FormData();\nformData.append('image', fs.createReadStream('file_path'));\nformData.append('authKey', 'AUTH_KEY');\n\nfetch('https://prod.backend.app.matrice.ai/v1/predict', {\n  method: 'POST',\n  body: formData,\n}).then(r => r.json()).then(console.log);` },
  { lang: "Swift",      icon: `${DEVICON_BASE}/swift/swift-original.svg`,           color: "#FA7343", code: `let url = URL(string: "https://prod.backend.app.matrice.ai/v1/predict")!\nvar request = URLRequest(url: url)\nrequest.httpMethod = "POST"\n// attach image and authKey\nURLSession.shared.dataTask(with: request) { data, _, _ in\n  print(String(data: data!, encoding: .utf8) ?? "")\n}.resume()` },
  { lang: "Java",       icon: `${DEVICON_BASE}/java/java-original.svg`,             color: "#ED8B00", code: `OkHttpClient client = new OkHttpClient();\nRequestBody body = new MultipartBody.Builder()\n  .setType(MultipartBody.FORM)\n  .addFormDataPart("authKey", "AUTH_KEY")\n  .addFormDataPart("image", "file.jpg", RequestBody.create(file, MediaType.parse("image/*")))\n  .build();\nRequest req = new Request.Builder().url("https://prod.backend.app.matrice.ai/v1/predict").post(body).build();\nclient.newCall(req).execute();` },
  { lang: "PHP",        icon: `${DEVICON_BASE}/php/php-original.svg`,               color: "#777BB4", code: `<?php\n$curl = curl_init();\ncurl_setopt_array($curl, [\n  CURLOPT_URL => "https://prod.backend.app.matrice.ai/v1/predict",\n  CURLOPT_POST => true,\n  CURLOPT_POSTFIELDS => ["authKey" => "AUTH_KEY", "image" => new CURLFile("file_path")],\n]);\n$response = curl_exec($curl);\ncurl_close($curl);` },
  { lang: "Go",         icon: `${DEVICON_BASE}/go/go-original.svg`,                 color: "#00ADD8", code: `package main\n\nimport (\n  "bytes"\n  "fmt"\n  "io"\n  "mime/multipart"\n  "net/http"\n  "os"\n)\n\nfunc main() {\n  var b bytes.Buffer\n  w := multipart.NewWriter(&b)\n  w.WriteField("authKey", "AUTH_KEY")\n  f, _ := os.Open("file_path")\n  fw, _ := w.CreateFormFile("image", "file_path")\n  io.Copy(fw, f)\n  w.Close()\n  resp, _ := http.Post(\n    "https://prod.backend.app.matrice.ai/v1/predict",\n    w.FormDataContentType(), &b,\n  )\n  fmt.Println(resp.Status)\n}` },
  { lang: "C#",         icon: `${DEVICON_BASE}/csharp/csharp-original.svg`,         color: "#239120", code: `using var client = new HttpClient();\nusing var form = new MultipartFormDataContent();\nform.Add(new StringContent("AUTH_KEY"), "authKey");\nform.Add(new StreamContent(File.OpenRead("file_path")), "image", "file_path");\nvar response = await client.PostAsync(\n  "https://prod.backend.app.matrice.ai/v1/predict", form\n);\nConsole.WriteLine(await response.Content.ReadAsStringAsync());` },
  { lang: "Dart",       icon: `${DEVICON_BASE}/dart/dart-original.svg`,             color: "#0175C2", code: `import 'package:http/http.dart' as http;\nimport 'dart:io';\n\nfinal request = http.MultipartRequest(\n  'POST',\n  Uri.parse('https://prod.backend.app.matrice.ai/v1/predict'),\n);\nrequest.fields['authKey'] = 'AUTH_KEY';\nrequest.files.add(await http.MultipartFile.fromPath('image', 'file_path'));\nfinal response = await request.send();\nprint(await response.stream.bytesToString());` },
  { lang: "Kotlin",     icon: `${DEVICON_BASE}/kotlin/kotlin-original.svg`,         color: "#7F52FF", code: `val client = OkHttpClient()\nval body = MultipartBody.Builder()\n  .setType(MultipartBody.FORM)\n  .addFormDataPart("authKey", "AUTH_KEY")\n  .addFormDataPart("image", "file.jpg",\n    File("file_path").asRequestBody("image/*".toMediaType()))\n  .build()\nval request = Request.Builder()\n  .url("https://prod.backend.app.matrice.ai/v1/predict")\n  .post(body).build()\nprintln(client.newCall(request).execute().body?.string())` },
];

function DeploymentDetail({ dep, onBack }: { dep: Deployment; onBack: () => void }) {
  const [activeTab, setActiveTab] = useState<DepTab>("dashboard");
  const [sampleCount, setSampleCount] = useState("Recent 1000");
  const [granularity, setGranularity] = useState("Minute");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [codeModal, setCodeModal]   = useState<string | null>(null);
  const [selectedLang, setSelectedLang] = useState("Python");
  const [codeCopied, setCodeCopied] = useState(false);
  const [autoScale,  setAutoScale]  = useState(false);
  const [showAddKey, setShowAddKey] = useState(false);
  const [keyValidity, setKeyValidity] = useState("10");
  const [receiveMailDrift, setReceiveMailDrift] = useState(false);
  const [createDataset, setCreateDataset] = useState(false);

  const isLive = dep.status === "live";

  return (
    <div className="flex flex-col min-h-0">
      {/* Header: breadcrumb + tabs (white, matches ModelDetail) */}
      <div className="bg-white border-b border-neutral-200">
        {/* Breadcrumb row */}
        <div className="flex items-center gap-3 px-5 py-2.5 border-b border-neutral-100">
          <button onClick={onBack}
            className="flex items-center gap-1.5 text-[12px] text-neutral-500 hover:text-[#00775B] transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Deployments</span>
          </button>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
          <span className="text-[12px] font-semibold text-neutral-800 truncate max-w-xs">{dep.modelName}</span>
          <span className="font-mono text-[10px] bg-neutral-100 text-neutral-500 h-5 px-2 rounded inline-flex items-center ml-1 flex-shrink-0">
            {dep.id}
          </span>
        </div>

        {/* Tab bar */}
        <div className="flex items-center overflow-x-auto px-2">
          {DEP_TABS.map((t) => (
            <button key={t.id} onClick={() => setActiveTab(t.id)}
              className={cn(
                "relative flex-shrink-0 px-4 py-3 text-[12px] font-semibold transition-colors whitespace-nowrap",
                activeTab === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700",
              )}>
              {t.label}
              {activeTab === t.id && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meta bar */}
      <div className="flex items-center gap-3 px-5 py-2 border-b border-neutral-200 bg-white flex-wrap text-[11px]">
        <div className="flex items-center gap-3">
          <span className="text-neutral-400">Last Updated: <span className="font-medium text-neutral-600">{dep.createdAt}</span></span>
          <span className="text-neutral-200">|</span>
          <span className="text-neutral-400">Created By: <span className="font-medium text-neutral-600">Mohammed Usman F</span></span>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <span className={cn(
            "inline-flex items-center h-6 px-3 rounded-full border text-[10px] font-semibold",
            isLive ? "bg-[#E5FFF9] text-[#00775B] border-[#00775B]/30" : "bg-neutral-100 text-neutral-500 border-neutral-300",
          )}>
            {isLive ? "Live" : "Queued"}
          </span>
        </div>
      </div>

      {/* Tab content */}
      <div className="flex-1 overflow-auto bg-[#F8FAFC]">

        {/* ── Dashboard ── */}
        {activeTab === "dashboard" && (
          <div className="p-6 flex flex-col gap-6">
            {/* Request Count vs Time */}
            <div className="bg-white rounded border border-neutral-200">
              <div className="px-5 py-3 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Request Count vs Time</h3>
              </div>
              <div className="flex">
                <div className="w-52 border-r border-neutral-100 p-4 flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Filters</p>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Select Sample Count</Label>
                    <Select value={sampleCount} onValueChange={setSampleCount}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Recent 100", "Recent 500", "Recent 1000", "All"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Select Granularity</Label>
                    <Select value={granularity} onValueChange={setGranularity}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Minute", "Hour", "Day"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-[12px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-[12px]" />
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={REQUEST_COUNT_DATA} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} label={{ value: "Time", position: "insideBottom", offset: -4, fontSize: 11, fill: "#94A3B8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} label={{ value: "Number of Requests", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#94A3B8" }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #E2E8F0" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" align="right" />
                      <Line type="monotone" dataKey="count" stroke="#F5A623" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Average Prediction Latency */}
            <div className="bg-white rounded border border-neutral-200">
              <div className="px-5 py-3 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Average Prediction Latency</h3>
              </div>
              <div className="flex">
                <div className="w-52 border-r border-neutral-100 p-4 flex flex-col gap-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-500">Filters</p>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Select Sample Count</Label>
                    <Select value={sampleCount} onValueChange={setSampleCount}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Recent 100", "Recent 500", "Recent 1000", "All"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Select Granularity</Label>
                    <Select value={granularity} onValueChange={setGranularity}>
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {["Minute", "Hour", "Day"].map((v) => (
                          <SelectItem key={v} value={v}>{v}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Start Date</Label>
                    <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="h-9 text-[12px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">End Date</Label>
                    <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="h-9 text-[12px]" />
                  </div>
                </div>
                <div className="flex-1 p-4">
                  <ResponsiveContainer width="100%" height={260}>
                    <LineChart data={LATENCY_DATA} margin={{ top: 8, right: 24, left: 0, bottom: 8 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                      <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} label={{ value: "Time", position: "insideBottom", offset: -4, fontSize: 11, fill: "#94A3B8" }} />
                      <YAxis tick={{ fontSize: 10, fill: "#94A3B8" }} tickLine={false} axisLine={false} label={{ value: "Average Latency", angle: -90, position: "insideLeft", offset: 10, fontSize: 11, fill: "#94A3B8" }} />
                      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 6, border: "1px solid #E2E8F0" }} />
                      <Legend wrapperStyle={{ fontSize: 11 }} verticalAlign="top" align="right" />
                      <Line type="monotone" dataKey="averageLatency" stroke="#F5A623" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Auth Keys ── */}
        {activeTab === "authkeys" && (
          <div className="p-6">
            {/* Add Auth Key dialog */}
            <Dialog open={showAddKey} onOpenChange={setShowAddKey}>
              <DialogContent className="w-[420px]">
                <DialogHeader>
                  <DialogTitle className="text-[14px]">Add Auth Key</DialogTitle>
                </DialogHeader>
                <div className="flex flex-col gap-1.5 py-2">
                  <Label className="text-xs text-neutral-600">Validity (in days)</Label>
                  <Select value={keyValidity} onValueChange={setKeyValidity}>
                    <SelectTrigger className="h-10 text-[13px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["1", "7", "10", "30", "90", "365"].map((v) => (
                        <SelectItem key={v} value={v}>{v}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    onClick={() => setShowAddKey(false)}
                    className="h-9 px-5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                    Add
                  </button>
                </div>
              </DialogContent>
            </Dialog>

            <DataTable<AuthKey>
              columns={AUTH_KEY_COLUMNS}
              data={MOCK_AUTH_KEYS}
              rowIdKey="id"
              pagination="none"
              cardTitle="Auth Keys"
              toolbar={false}
              cardAction={
                <button
                  onClick={() => setShowAddKey(true)}
                  className="inline-flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-[11px] font-semibold hover:bg-[#006649] transition-colors">
                  + Add Authkey
                </button>
              }
            />
          </div>
        )}

        {/* ── Integrations ── */}
        {activeTab === "integrations" && (() => {
          const active = CODE_SNIPPETS.find(s => s.lang === selectedLang) ?? CODE_SNIPPETS[0];
          return (
            <div className="p-6 flex flex-col gap-4">
              {/* Warning banner */}
              <div className="flex items-start gap-2.5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-[12px] text-amber-800">
                <span className="mt-0.5">⚠</span>
                <span>Before trying any integrations please make sure the deployment is in <strong>Deployed</strong> state.</span>
              </div>

              {/* Split panel */}
              <div className="flex rounded-xl border border-neutral-200 overflow-hidden bg-white min-h-[420px]">
                {/* Left: language list */}
                <div className="w-48 border-r border-neutral-100 flex flex-col py-3">
                  <p className="px-4 pb-2 text-[10px] font-semibold uppercase tracking-widest text-neutral-400">SDK / Language</p>
                  {CODE_SNIPPETS.map(({ lang, icon, color }) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLang(lang)}
                      className={cn(
                        "flex items-center gap-3 px-4 py-2.5 text-[12px] font-medium transition-colors text-left",
                        selectedLang === lang
                          ? "bg-neutral-50 text-neutral-900 border-r-2 border-[#00775B]"
                          : "text-neutral-500 hover:bg-neutral-50 hover:text-neutral-700",
                      )}>
                      <span className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
                        style={{ backgroundColor: `${color}18` }}>
                        <img src={icon} alt={lang} className="w-4 h-4" />
                      </span>
                      {lang}
                    </button>
                  ))}
                </div>

                {/* Right: code panel */}
                <div className="flex-1 flex flex-col min-w-0">
                  {/* Code header */}
                  <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded flex items-center justify-center"
                        style={{ backgroundColor: `${active.color}18` }}>
                        <img src={active.icon} alt={active.lang} className="w-4 h-4" />
                      </span>
                      <span className="text-[13px] font-semibold text-neutral-800">{active.lang}</span>
                      <span className="text-[10px] font-mono bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded">REST API</span>
                    </div>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(active.code);
                        setCodeCopied(true);
                        setTimeout(() => setCodeCopied(false), 1500);
                      }}
                      className={cn(
                        "inline-flex items-center gap-1.5 h-7 px-3 rounded text-[11px] font-medium transition-colors",
                        codeCopied
                          ? "bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/30"
                          : "border border-neutral-200 text-neutral-600 hover:bg-neutral-50",
                      )}>
                      {codeCopied ? "✓ Copied!" : "Copy"}
                    </button>
                  </div>

                  {/* Code block */}
                  <div className="flex-1 bg-[#0F172A] overflow-auto">
                    <pre className="p-5 text-[12px] font-mono text-[#94A3B8] leading-relaxed whitespace-pre-wrap">{active.code}</pre>
                  </div>

                  {/* Footer hint */}
                  <div className="px-5 py-2.5 border-t border-neutral-100 bg-neutral-50 text-[11px] text-neutral-400 flex items-center gap-1.5">
                    <span>🔑</span>
                    <span>Replace <code className="font-mono bg-neutral-100 px-1 rounded text-neutral-600">AUTH_KEY</code> with a key from the <strong>Auth Keys</strong> tab before making requests.</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Drift Monitoring ── */}
        {activeTab === "drift" && (
          <div className="p-6 flex flex-col gap-5">
            <div className="bg-white rounded border border-neutral-200 p-5 flex flex-col gap-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Storage / Bucket Alias</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="auto">Auto</SelectItem></SelectContent>
                  </Select>
                  <p className="text-[11px] text-neutral-400">You can also configure your bucket or use auto <button className="text-[#00775B]">Add Bucket</button></p>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Drift Monitoring Name</Label>
                  <Input placeholder="Drift Monitoring Name" className="h-9 text-[12px]" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Compute</Label>
                  <Select defaultValue="auto">
                    <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="auto">Automatically launch a new instance</SelectItem></SelectContent>
                  </Select>
                  <p className="text-[11px] text-neutral-400">You can also configure your compute or use auto <button className="text-[#00775B]">Add Compute</button></p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Select Deployment</Label>
                  <Select defaultValue="test">
                    <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent><SelectItem value="test">test</SelectItem></SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Image Store Count Threshold</Label>
                  <Select defaultValue="500">
                    <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{["100","500","1000","5000"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label className="text-xs text-neutral-600">Image Store Confidence Threshold</Label>
                  <Select defaultValue="0.3">
                    <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                    <SelectContent>{["0.1","0.3","0.5","0.7"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div />
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-neutral-600">Receive Mail</Label>
                  <Switch checked={receiveMailDrift} onCheckedChange={setReceiveMailDrift} />
                </div>
                <div className="flex items-center gap-3">
                  <Label className="text-xs text-neutral-600">Create Dataset</Label>
                  <Switch checked={createDataset} onCheckedChange={setCreateDataset} />
                </div>
              </div>
              <div className="flex justify-end">
                <button className="h-9 px-5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">Create</button>
              </div>
            </div>
            {/* Table */}
            <div className="bg-white rounded border border-neutral-200">
              <div className="px-5 py-3 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Drift Monitoring</h3>
              </div>
              <div className="p-6 flex flex-col items-center justify-center py-12 gap-2">
                <p className="text-[12px] text-neutral-400">No drift monitoring configured yet.</p>
              </div>
            </div>
          </div>
        )}

        {/* ── Deployment Settings ── */}
        {activeTab === "settings" && (
          <div className="p-6 flex flex-col gap-4">
            {/* Deployment Info */}
            <div className="bg-white rounded border border-neutral-200">
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Deployment Info</h3>
                <button className="h-7 px-3 rounded border border-[#00775B] text-[#00775B] text-[11px] font-semibold hover:bg-[#00775B]/5 transition-colors">Edit</button>
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="grid grid-cols-2 divide-x divide-neutral-100">
                  {[
                    { label: "Auto Scale", value: autoScale ? "true" : "false" },
                    { label: "Instance Range", value: "[1, 1]" },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-5 py-4 flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-neutral-700">{label}</span>
                      <span className="text-[12px] text-neutral-500">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Model Info */}
            <div className="bg-white rounded border border-neutral-200">
              <div className="px-5 py-3 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Model Info</h3>
              </div>
              <div className="divide-y divide-neutral-100">
                <div className="grid grid-cols-4 divide-x divide-neutral-100">
                  {[
                    { label: "Model",             value: "Skin-Cancer-Classification-Experiment-1-1", colored: true },
                    { label: "Dataset",           value: "Skin Cancer Classification",               colored: true },
                    { label: "Dataset Version",   value: "v1.0",                                     colored: true },
                    { label: "Model Name",        value: "EfficientNetV2 Small",                     colored: true },
                  ].map(({ label, value, colored }) => (
                    <div key={label} className="px-4 py-4 flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-neutral-700">{label}</span>
                      <span className={cn("text-[12px]", colored ? "text-[#00775B]" : "text-neutral-500")}>{value}</span>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-3 divide-x divide-neutral-100">
                  {[
                    { label: "Primary Metric",      value: "acc@1 (0.8419452905654907)" },
                    { label: "Training Framework",  value: "PyTorch" },
                    { label: "Target Runtime",      value: "PyTorch" },
                  ].map(({ label, value }) => (
                    <div key={label} className="px-4 py-4 flex flex-col gap-1">
                      <span className="text-[11px] font-semibold text-neutral-700">{label}</span>
                      <span className="text-[12px] text-neutral-500">{value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── Run Predictions ── */}
        {activeTab === "predictions" && (
          <div className="p-6">
            <div className="bg-white rounded border border-neutral-200 p-5 flex flex-col gap-4 max-w-lg">
              <h3 className="text-[13px] font-semibold text-neutral-800">Run a Prediction</h3>
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs text-neutral-600">Upload Image</Label>
                <div className="border-2 border-dashed border-neutral-200 rounded p-8 flex flex-col items-center gap-2 text-neutral-400 text-[12px] hover:border-[#00775B]/40 transition-colors cursor-pointer">
                  <span className="text-2xl">↑</span>
                  <span>Click to upload or drag & drop</span>
                  <span className="text-[10px]">PNG, JPG, JPEG up to 10MB</span>
                </div>
              </div>
              <button className="h-9 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                Predict
              </button>
            </div>
          </div>
        )}

        {/* ── Camera / Streaming / Output — placeholder ── */}
        {(activeTab === "camera" || activeTab === "streaming" || activeTab === "output") && (
          <div className="p-6 flex flex-col items-center justify-center py-24 gap-2">
            <p className="text-[14px] font-medium text-neutral-500">
              {activeTab === "camera" ? "Camera Management" : activeTab === "streaming" ? "Streaming Gateways" : "Output Stream"}
            </p>
            <p className="text-[12px] text-neutral-400">This section is not yet configured for this deployment.</p>
          </div>
        )}

      </div>
    </div>
  );
}

// ─── Deployments page ─────────────────────────────────────────────────────────

type DTab = "create" | "deployments";

interface DeploymentsProps { project: TrainingProject; }

export function Deployments({ project: _project }: DeploymentsProps) {
  const [tab, setTab] = useState<DTab>("create");
  const [selectedDep, setSelectedDep] = useState<Deployment | null>(null);

  const TABS: { id: DTab; label: string }[] = [
    { id: "create",      label: "Create Deployment" },
    { id: "deployments", label: "All Deployments"   },
  ];

  if (selectedDep) {
    return <DeploymentDetail dep={selectedDep} onBack={() => setSelectedDep(null)} />;
  }

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
            onRowClick={(row) => setSelectedDep(row)}
          />
        )}

      </div>
    </div>
  );
}
