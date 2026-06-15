import { useState, useEffect, useRef } from "react";
import * as Popover from "@radix-ui/react-popover";
import { Plus, ExternalLink, StopCircle, AlertTriangle, ArrowLeft, ChevronRight, UploadCloud, Camera, MapPin, Video, Sliders } from "lucide-react";
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

type DepTab = "dashboard" | "authkeys" | "integrations" | "drift" | "settings" | "predictions" | "camera" | "streaming" | "output" | "kafka";

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
  { id: "kafka",        label: "Kafka Instance" },
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
  const [autoScale,      setAutoScale]      = useState(false);
  const [showEditDeploy, setShowEditDeploy] = useState(false);
  const [editAutoScale,  setEditAutoScale]  = useState(false);
  const [editInstMin,    setEditInstMin]    = useState("1");
  const [editInstMax,    setEditInstMax]    = useState("1");
  const [showAddKey, setShowAddKey] = useState(false);
  const [keyValidity, setKeyValidity] = useState("10");
  const [receiveMailDrift, setReceiveMailDrift] = useState(false);
  const [createDataset, setCreateDataset] = useState(false);
  type DriftMonitor = { id: string; name: string; deployment: string; compute: string; bucket: string; status: "Running" | "Stopped"; createdAt: string };
  const [driftMonitors, setDriftMonitors] = useState<DriftMonitor[]>([
    { id: "1", name: "Road Line Detection", deployment: "test", compute: "Auto", bucket: "Auto", status: "Running", createdAt: "11/08/2024" },
    { id: "2", name: "Vehicle Count Monitor", deployment: "prod-v2", compute: "Auto", bucket: "s3-bucket-01", status: "Stopped", createdAt: "10/25/2024" },
  ]);
  const [expandedDrift, setExpandedDrift] = useState<string | null>(null);
  const [driftSampleCount, setDriftSampleCount] = useState("1000");
  const [driftGranularity, setDriftGranularity] = useState("Minute");
  const driftChartData = [
    { time: "8:14 PM", solidLine: 0.78, roadLine: 0.75, dottedLine: 0.72, dividerLine: 0.80, all: 0.78 },
    { time: "8:15 PM", solidLine: 0.82, roadLine: 0.52, dottedLine: 0.78, dividerLine: 0.79, all: 0.75 },
    { time: "8:18 PM", solidLine: 0.60, roadLine: 0.65, dottedLine: 0.88, dividerLine: 0.82, all: 0.68 },
    { time: "8:23 PM", solidLine: 0.62, roadLine: 0.70, dottedLine: 0.91, dividerLine: 0.77, all: 0.70 },
    { time: "8:24 PM", solidLine: 0.85, roadLine: 0.90, dottedLine: 0.84, dividerLine: 0.83, all: 0.85 },
    { time: "8:25 PM", solidLine: 0.88, roadLine: 0.85, dottedLine: 0.80, dividerLine: 0.78, all: 0.82 },
    { time: "8:27 PM", solidLine: 0.75, roadLine: 0.76, dottedLine: 0.74, dividerLine: 0.80, all: 0.76 },
    { time: "8:29 PM", solidLine: 0.70, roadLine: 0.35, dottedLine: 0.68, dividerLine: 0.72, all: 0.60 },
    { time: "8:30 PM", solidLine: 0.82, roadLine: 0.42, dottedLine: 0.76, dividerLine: 0.80, all: 0.68 },
    { time: "8:33 PM", solidLine: 0.78, roadLine: 0.80, dottedLine: 0.82, dividerLine: 0.30, all: 0.62 },
    { time: "8:34 PM", solidLine: 0.80, roadLine: 0.78, dottedLine: 0.79, dividerLine: 0.74, all: 0.76 },
    { time: "8:35 PM", solidLine: 0.82, roadLine: 0.74, dottedLine: 0.80, dividerLine: 0.76, all: 0.78 },
    { time: "8:36 PM", solidLine: 0.90, roadLine: 0.88, dottedLine: 0.85, dividerLine: 0.80, all: 0.84 },
  ];

  // Run Predictions state
  type PredTab = "image" | "video" | "dataset";
  const [predTab,       setPredTab]       = useState<PredTab>("image");
  const [imgSubTab,     setImgSubTab]     = useState<"upload" | "url">("upload");
  const [imgUrl,        setImgUrl]        = useState("");
  const [vidSubTab,     setVidSubTab]     = useState<"upload" | "url">("upload");
  const [vidUrl,        setVidUrl]        = useState("");
  const [vidFps,        setVidFps]        = useState("5");
  const [predAuthKey,   setPredAuthKey]   = useState("");
  const [dsDataset,     setDsDataset]     = useState("");
  const [dsVersion,     setDsVersion]     = useState("");
  const [dsSplitType,   setDsSplitType]   = useState("");
  const [dsSampleCount, setDsSampleCount] = useState("0");
  const [dsReqCount,    setDsReqCount]    = useState("0");

  // Camera Management
  type CameraGroup = { id: string; name: string; location: string; cameras: number; createdAt: string; updatedAt: string };
  const [cameraGroups, setCameraGroups]       = useState<CameraGroup[]>([]);
  const [showCreateCG, setShowCreateCG]       = useState(false);
  const [cgStep,       setCgStep]             = useState<1 | 2>(1);
  const [cgName,       setCgName]             = useState("");
  const [cgLocation,   setCgLocation]         = useState("");
  const [cgAspect,     setCgAspect]           = useState("16:9");
  const [cgWidth,      setCgWidth]            = useState("1920");
  const [cgHeight,     setCgHeight]           = useState("1080");
  const [cgFps,        setCgFps]              = useState(24);
  const [cgQuality,    setCgQuality]          = useState(80);
  // Add Individual Camera (step 2)
  type IndivCamera = { name: string; ip: string; protocol: string };
  const [cgCameras,    setCgCameras]          = useState<IndivCamera[]>([]);
  const [camName,      setCamName]            = useState("");
  const [camIp,        setCamIp]              = useState("");
  const [camProtocol,  setCamProtocol]        = useState("RTSP");

  // Streaming Gateways
  type StreamingGateway = { id: string; name: string; description: string; cameraGroups: string[]; createdAt: string; updatedAt: string };
  const [gateways,        setGateways]        = useState<StreamingGateway[]>([]);
  const [showCreateGW,    setShowCreateGW]    = useState(false);
  const [gwName,          setGwName]          = useState(`MUF-${new Date().toISOString().slice(0,10).replace(/-/g,"")}`);
  const [gwDesc,          setGwDesc]          = useState("");
  const [gwCamGroups,     setGwCamGroups]     = useState<string[]>([]);

  // Output Stream
  const [outCamera,       setOutCamera]       = useState("");
  const [outPosition,     setOutPosition]     = useState("Earliest");
  const [outConnected,    setOutConnected]    = useState(false);
  const [outResultTab,    setOutResultTab]    = useState<"results" | "json">("results");

  // Kafka Instance
  const [kafkaAlias,        setKafkaAlias]        = useState("");
  const [kafkaInstanceId,   setKafkaInstanceId]   = useState("");
  const [kafkaInstanceType, setKafkaInstanceType] = useState("");
  const [kafkaProvider,     setKafkaProvider]     = useState("");
  const [kafkaLaunchDur,    setKafkaLaunchDur]    = useState("");
  const [kafkaShutdownThr,  setKafkaShutdownThr]  = useState("");
  const [kafkaAdvOpen,      setKafkaAdvOpen]      = useState(false);
  const [kafkaOs,           setKafkaOs]           = useState("");
  const [kafkaOsVersion,    setKafkaOsVersion]    = useState("");
  const [kafkaGpuType,      setKafkaGpuType]      = useState("");
  const [kafkaGpuCount,     setKafkaGpuCount]     = useState("0");
  const [kafkaGpuMem,       setKafkaGpuMem]       = useState("0");
  const [kafkaRam,          setKafkaRam]          = useState("0");
  const [kafkaStorage,      setKafkaStorage]      = useState("0");
  const [kafkaMachine,      setKafkaMachine]      = useState("");
  const [kafkaCpuType,      setKafkaCpuType]      = useState("");
  const [kafkaEncKey,       setKafkaEncKey]       = useState("");
  const [kafkaErrors,       setKafkaErrors]       = useState<Record<string, string>>({});
  useEffect(() => { setKafkaErrors({}); }, [activeTab]);
  const [visibleCount, setVisibleCount] = useState(DEP_TABS.length);
  const [moreOpen,     setMoreOpen]     = useState(false);
  const [actionsOpen,  setActionsOpen]  = useState(false);
  const tabBarRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const measure = () => {
      if (!tabBarRef.current) return;
      const available = tabBarRef.current.offsetWidth - 56;
      let total = 0, count = 0;
      for (const tab of DEP_TABS) {
        const w = tab.label.length * 7.2 + 32;
        if (total + w > available) break;
        total += w; count++;
      }
      setVisibleCount(Math.max(1, count));
    };
    measure();
    const ro = new ResizeObserver(measure);
    if (tabBarRef.current) ro.observe(tabBarRef.current);
    return () => ro.disconnect();
  }, []);

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
        <div ref={tabBarRef} className="flex items-center px-2 min-w-0">
          {DEP_TABS.slice(0, visibleCount).map((t) => (
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

          {visibleCount < DEP_TABS.length && (() => {
            const overflowTabs = DEP_TABS.slice(visibleCount);
            const overflowActive = overflowTabs.some((t) => t.id === activeTab);
            return (
              <Popover.Root open={moreOpen} onOpenChange={setMoreOpen}>
                <Popover.Trigger asChild>
                  <button className={cn(
                    "relative flex-shrink-0 flex items-center gap-1 px-3 py-3 text-[12px] font-semibold transition-colors whitespace-nowrap",
                    overflowActive ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700",
                  )}>
                    {overflowActive
                      ? <>{overflowTabs.find((t) => t.id === activeTab)?.label} <span className="text-neutral-400">▾</span></>
                      : <span className="tracking-widest text-neutral-400 hover:text-neutral-600">•••</span>
                    }
                    {overflowActive && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />}
                  </button>
                </Popover.Trigger>
                <Popover.Portal>
                  <Popover.Content align="end" sideOffset={0}
                    className="z-50 w-fit rounded-lg border border-neutral-200 bg-white shadow-lg py-1 outline-none">
                    {overflowTabs.map((t) => (
                      <button key={t.id}
                        onClick={() => { setActiveTab(t.id); setMoreOpen(false); }}
                        className={cn(
                          "block w-full whitespace-nowrap text-left px-4 py-2 text-[12px] font-semibold transition-colors",
                          activeTab === t.id ? "text-[#00775B] bg-[#00775B]/5" : "text-neutral-600 hover:bg-neutral-50",
                        )}>
                        {t.label}
                      </button>
                    ))}
                  </Popover.Content>
                </Popover.Portal>
              </Popover.Root>
            );
          })()}
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

          <Popover.Root open={actionsOpen} onOpenChange={setActionsOpen}>
            <Popover.Trigger asChild>
              <button className="w-7 h-7 flex items-center justify-center rounded-md text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100 transition-colors">
                <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
                  <circle cx="2" cy="8" r="1.5" /><circle cx="8" cy="8" r="1.5" /><circle cx="14" cy="8" r="1.5" />
                </svg>
              </button>
            </Popover.Trigger>
            <Popover.Portal>
              <Popover.Content align="end" sideOffset={6}
                className="z-50 w-fit rounded-lg border border-neutral-200 bg-white shadow-lg py-1 outline-none">
                {["Wakeup Server", "Add Schedule", "Restart Deployment"].map((label) => (
                  <button key={label}
                    onClick={() => setActionsOpen(false)}
                    className="block w-full whitespace-nowrap text-left px-4 py-2 text-[12px] font-medium text-neutral-700 hover:bg-neutral-50 transition-colors">
                    {label}
                  </button>
                ))}
                <div className="my-1 border-t border-neutral-100" />
                <button
                  onClick={() => setActionsOpen(false)}
                  className="block w-full whitespace-nowrap text-left px-4 py-2 text-[12px] font-medium text-red-500 hover:bg-red-50 transition-colors">
                  Delete Deployment
                </button>
              </Popover.Content>
            </Popover.Portal>
          </Popover.Root>
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
            <div className="bg-white rounded border border-neutral-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">New Drift Monitor</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">Configure a new drift monitoring job for this deployment.</p>
              </div>
              <div className="p-5 flex flex-col gap-5">
                {/* Row 1 — Identity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Monitor Name</Label>
                    <Input placeholder="e.g. Road Line Detection Monitor" className="h-9 text-[12px]" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Select Deployment</Label>
                    <Select defaultValue="test">
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="test">test</SelectItem></SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Row 2 — Infrastructure */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Storage / Bucket</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="auto">Auto</SelectItem></SelectContent>
                    </Select>
                    <p className="text-[11px] text-neutral-400">Use auto or <button className="text-[#00775B] hover:underline">add a custom bucket</button></p>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <Label className="text-xs text-neutral-600">Compute</Label>
                    <Select defaultValue="auto">
                      <SelectTrigger className="h-9 text-[12px]"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="auto">Automatically launch a new instance</SelectItem></SelectContent>
                    </Select>
                    <p className="text-[11px] text-neutral-400">Use auto or <button className="text-[#00775B] hover:underline">add custom compute</button></p>
                  </div>
                </div>

                {/* Row 3 — Thresholds */}
                <div className="grid grid-cols-2 gap-4">
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

                {/* Row 4 — Options + Action */}
                <div className="flex items-center justify-between pt-1 border-t border-neutral-100">
                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2.5">
                      <Switch checked={receiveMailDrift} onCheckedChange={setReceiveMailDrift} className="[&[data-state=unchecked]]:bg-neutral-300" />
                      <Label className="text-xs text-neutral-600 cursor-pointer" onClick={() => setReceiveMailDrift(!receiveMailDrift)}>Receive Mail Alerts</Label>
                    </div>
                    <div className="flex items-center gap-2.5">
                      <Switch checked={createDataset} onCheckedChange={setCreateDataset} className="[&[data-state=unchecked]]:bg-neutral-300" />
                      <Label className="text-xs text-neutral-600 cursor-pointer" onClick={() => setCreateDataset(!createDataset)}>Auto-create Dataset</Label>
                    </div>
                  </div>
                  <button className="h-9 px-5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                    Create Monitor
                  </button>
                </div>
              </div>
            </div>
            {(() => {
              const driftCols: ColumnDef<DriftMonitor>[] = [
                {
                  id: "name", accessorKey: "name", header: "Name",
                  cell: ({ row }) => <span className="text-[12px] font-medium text-neutral-800">{row.name}</span>,
                },
                {
                  id: "deployment", accessorKey: "deployment", header: "Deployment",
                  cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.deployment}</span>,
                },
                {
                  id: "compute", accessorKey: "compute", header: "Compute",
                  cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.compute}</span>,
                },
                {
                  id: "bucket", accessorKey: "bucket", header: "Bucket",
                  cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.bucket}</span>,
                },
                {
                  id: "status", accessorKey: "status", header: "Status",
                  cell: ({ row }) => (
                    <span className={cn(
                      "inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-full",
                      row.status === "Running" ? "bg-green-50 text-green-700" : "bg-neutral-100 text-neutral-500"
                    )}>
                      <span className={cn("w-1.5 h-1.5 rounded-full", row.status === "Running" ? "bg-green-500" : "bg-neutral-400")} />
                      {row.status}
                    </span>
                  ),
                },
                {
                  id: "action", header: "",
                  cell: ({ row }) => (
                    <button
                      onClick={() => setExpandedDrift(expandedDrift === row.id ? null : row.id)}
                      className="h-7 px-3 rounded border border-neutral-200 text-[11px] font-medium text-neutral-500 hover:bg-neutral-50 hover:text-[#00775B] hover:border-[#00775B]/30 transition-colors whitespace-nowrap"
                    >
                      {expandedDrift === row.id ? "Hide Chart" : "View Chart"}
                    </button>
                  ),
                },
              ];
              return (
                <>
                  <DataTable
                    data={driftMonitors}
                    columns={driftCols}
                    toolbar={false}
                    cardTitle="Drift Monitoring"
                    pagination="none"
                  />
                  {expandedDrift && (() => {
                    const dm = driftMonitors.find((d) => d.id === expandedDrift);
                    if (!dm) return null;
                    return (
                      <div className="bg-white rounded border border-neutral-200 p-5">
                        <div className="flex items-center justify-between mb-4">
                          <div>
                            <h4 className="text-[13px] font-semibold text-neutral-800">Mean Confidence Score vs Time</h4>
                            <p className="text-[11px] text-neutral-400 mt-0.5">{dm.name}</p>
                          </div>
                          <div className="flex items-center gap-1 border border-neutral-200 rounded-md p-0.5">
                            <button className="w-7 h-6 flex items-center justify-center rounded bg-neutral-100 text-neutral-600">
                              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="1" width="6" height="6" rx="1"/><rect x="9" y="1" width="6" height="6" rx="1"/><rect x="1" y="9" width="6" height="6" rx="1"/><rect x="9" y="9" width="6" height="6" rx="1"/></svg>
                            </button>
                            <button className="w-7 h-6 flex items-center justify-center rounded text-neutral-400">
                              <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="1" y="7" width="14" height="2" rx="1"/><rect x="1" y="12" width="14" height="2" rx="1"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex gap-5">
                          <div className="w-52 flex-shrink-0 flex flex-col gap-3">
                            <p className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wide">Filters</p>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] text-neutral-500">Select Sample Count</label>
                              <Select value={driftSampleCount} onValueChange={setDriftSampleCount}>
                                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                                <SelectContent>{["100","500","1000","5000"].map((v) => <SelectItem key={v} value={v}>Recent {v}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] text-neutral-500">Select Labels</label>
                              <div className="border border-neutral-200 rounded-md p-2 flex flex-wrap gap-1 bg-white">
                                {["All","divider-line","dotted-line","road-sign-line","solid-line"].map((lbl) => (
                                  <span key={lbl} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-neutral-100 text-[11px] text-neutral-600">
                                    {lbl}
                                    <svg viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2" className="w-2.5 h-2.5 cursor-pointer"><path d="M2 2l8 8M10 2l-8 8" strokeLinecap="round"/></svg>
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] text-neutral-500">Select Granularity</label>
                              <Select value={driftGranularity} onValueChange={setDriftGranularity}>
                                <SelectTrigger className="h-8 text-[12px]"><SelectValue /></SelectTrigger>
                                <SelectContent>{["Minute","Hour","Day","Week"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}</SelectContent>
                              </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-neutral-500">Start Date</label>
                                <Input type="date" className="h-8 text-[11px]" />
                              </div>
                              <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-neutral-500">End Date</label>
                                <Input type="date" className="h-8 text-[11px]" />
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[11px] text-neutral-500">Confidence Threshold</label>
                              <input type="range" min={0} max={1} step={0.01} defaultValue={0.5} className="accent-[#00775B] w-full" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <ResponsiveContainer width="100%" height={280}>
                              <LineChart data={driftChartData} margin={{ top: 4, right: 16, left: -20, bottom: 24 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="time" tick={{ fontSize: 10, fill: "#9ca3af" }} angle={-40} textAnchor="end" interval={0} />
                                <YAxis domain={[0, 1]} tick={{ fontSize: 10, fill: "#9ca3af" }} tickCount={6} />
                                <Tooltip contentStyle={{ fontSize: 11 }} />
                                <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
                                <Line type="monotone" dataKey="solidLine"   name="solid-line"   stroke="#2DD4BF" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="roadLine"    name="road-line"    stroke="#F59E0B" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="dottedLine"  name="dotted-line"  stroke="#F87171" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="dividerLine" name="divider-line" stroke="#60A5FA" strokeWidth={2} dot={{ r: 3 }} />
                                <Line type="monotone" dataKey="all"         name="All"          stroke="#D1D5DB" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </>
              );
            })()}
          </div>
        )}

        {/* ── Deployment Settings ── */}
        {activeTab === "settings" && (
          <div className="p-6 flex flex-col gap-4">
            {/* Deployment Info */}
            <div className="bg-white rounded border border-neutral-200">
              <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Deployment Info</h3>
                <button
                  onClick={() => { setEditAutoScale(autoScale); setShowEditDeploy(true); }}
                  className="h-7 px-3 rounded border border-[#00775B] text-[#00775B] text-[11px] font-semibold hover:bg-[#00775B]/5 transition-colors"
                >Edit</button>
              </div>

              {/* Edit Deployment Info modal */}
              <Dialog open={showEditDeploy} onOpenChange={setShowEditDeploy}>
                <DialogContent className="w-[400px]">
                  <DialogHeader>
                    <DialogTitle className="text-[14px]">Edit Deployment Info</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col gap-4 py-2">
                    {/* Auto Scale toggle */}
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[12px] font-semibold text-neutral-800">Auto Scale</p>
                        <p className="text-[11px] text-neutral-400 mt-0.5">Automatically scale instances based on traffic</p>
                      </div>
                      <button
                        onClick={() => setEditAutoScale((v) => !v)}
                        className={cn(
                          "relative inline-flex h-5 w-9 flex-shrink-0 rounded-full border-2 border-transparent transition-colors cursor-pointer",
                          editAutoScale ? "bg-[#00775B]" : "bg-neutral-200"
                        )}
                      >
                        <span className={cn(
                          "pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform",
                          editAutoScale ? "translate-x-4" : "translate-x-0"
                        )} />
                      </button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      onClick={() => setShowEditDeploy(false)}
                      className="h-9 px-4 rounded border border-neutral-200 text-neutral-600 text-[12px] font-semibold hover:bg-neutral-50 transition-colors"
                    >Cancel</button>
                    <button
                      onClick={() => { setAutoScale(editAutoScale); setShowEditDeploy(false); }}
                      className="h-9 px-5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors"
                    >Save</button>
                  </div>
                </DialogContent>
              </Dialog>

              <div className="divide-y divide-neutral-100">
                <div className="grid grid-cols-2 divide-x divide-neutral-100">
                  {[
                    { label: "Auto Scale", value: autoScale ? "true" : "false" },
                    { label: "Instance Range", value: `[${editInstMin}, ${editInstMax}]` },
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
        {activeTab === "predictions" && (() => {
          const PRED_TABS: { id: typeof predTab; label: string }[] = [
            { id: "image",   label: "Image" },
            { id: "video",   label: "Video" },
            { id: "dataset", label: "Dataset Simulation" },
          ];

          const WarningBanner = () => (
            <div className="flex items-center gap-2.5 bg-amber-50 border border-amber-200 rounded px-4 py-2.5 text-[11px] text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              <span>Please make sure the deployment is in deployed state before running any predictions</span>
            </div>
          );

          const DropZone = ({ label, formats }: { label: string; formats: string }) => (
            <div className="border-2 border-dashed border-[#00775B]/40 rounded-lg p-10 flex flex-col items-center gap-3 cursor-pointer hover:bg-[#00775B]/[0.02] transition-colors">
              <UploadCloud className="w-10 h-10 text-[#00775B]" />
              <div className="text-center">
                <p className="text-[13px] font-semibold text-neutral-800">Drag and Drop {label} here</p>
                <p className="text-[11px] text-neutral-400 mt-0.5">Supported formats: {formats}</p>
              </div>
            </div>
          );

          const SubTabBar = ({
            tabs, active, onChange,
          }: { tabs: { id: string; label: string }[]; active: string; onChange: (v: string) => void }) => (
            <div className="flex border-b border-neutral-200">
              {tabs.map((t) => (
                <button key={t.id} onClick={() => onChange(t.id)}
                  className={cn("relative px-4 py-2.5 text-[12px] font-semibold transition-colors",
                    active === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
                  {t.label}
                  {active === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />}
                </button>
              ))}
            </div>
          );

          const PredictionResults = () => (
            <div className="bg-white rounded border border-neutral-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-neutral-100">
                <h3 className="text-[13px] font-semibold text-neutral-800">Prediction Results</h3>
                <p className="text-[11px] text-neutral-400 mt-0.5">A Preview of Predicted Results from Current Deployment</p>
              </div>
              <div className="flex flex-col items-center justify-center py-16 gap-3">
                <img src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" alt="" className="w-16 h-16 opacity-10" />
                <div className="text-center">
                  <p className="text-[13px] font-semibold text-neutral-500">No predictions found</p>
                </div>
              </div>
            </div>
          );

          return (
            <div className="flex flex-col gap-4 p-6">
              {/* Top-level tab bar */}
              <div className="bg-white rounded border border-neutral-200 overflow-hidden">
                <div className="flex border-b border-neutral-200">
                  {PRED_TABS.map((t) => (
                    <button key={t.id} onClick={() => setPredTab(t.id)}
                      className={cn("relative px-5 py-3 text-[12px] font-semibold transition-colors",
                        predTab === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
                      {t.label}
                      {predTab === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />}
                    </button>
                  ))}
                </div>

                <div className="p-5 flex flex-col gap-4">

                  {/* ── Image ── */}
                  {predTab === "image" && (
                    <>
                      <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <SubTabBar
                          tabs={[{ id: "upload", label: "Upload Image" }, { id: "url", label: "Image URL" }]}
                          active={imgSubTab}
                          onChange={(v) => setImgSubTab(v as "upload" | "url")}
                        />
                        <div className="p-4">
                          {imgSubTab === "upload"
                            ? <DropZone label="an image" formats=".jpeg, .png" />
                            : (
                              <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-neutral-600">Image URL</Label>
                                <Input value={imgUrl} onChange={(e) => setImgUrl(e.target.value)} placeholder="https://example.com/image.jpg" className="h-9 text-[13px]" />
                              </div>
                            )
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <WarningBanner />
                        <button className="flex-shrink-0 h-9 px-4 rounded bg-neutral-200 text-neutral-500 text-[12px] font-semibold cursor-not-allowed">Run Prediction</button>
                      </div>
                    </>
                  )}

                  {/* ── Video ── */}
                  {predTab === "video" && (
                    <>
                      <div className="flex items-start gap-3">
                        <div className="w-40">
                          <Label className="text-[10px] text-neutral-500 mb-1 block">Required FPS</Label>
                          <Select value={vidFps} onValueChange={setVidFps}>
                            <SelectTrigger className="h-9 text-[13px]"><SelectValue /></SelectTrigger>
                            <SelectContent>
                              {["1","2","5","10","15","24","30"].map((v) => <SelectItem key={v} value={v}>{v}</SelectItem>)}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="flex-1">
                          <Label className="text-[10px] text-neutral-500 mb-1 block">Auth Key</Label>
                          <Select value={predAuthKey} onValueChange={setPredAuthKey}>
                            <SelectTrigger className="h-9 text-[13px]"><SelectValue placeholder="Auth Key" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="key-1">672ce53b06f3cf576afe6701</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-neutral-400 mt-1">
                            If there are no auth key choices available; please{" "}
                            <span className="text-[#00775B] cursor-pointer hover:underline">Add auth key</span>
                          </p>
                        </div>
                      </div>
                      <div className="border border-neutral-200 rounded-lg overflow-hidden">
                        <SubTabBar
                          tabs={[{ id: "upload", label: "Upload Video" }, { id: "url", label: "Video URL" }]}
                          active={vidSubTab}
                          onChange={(v) => setVidSubTab(v as "upload" | "url")}
                        />
                        <div className="p-4">
                          {vidSubTab === "upload"
                            ? <DropZone label="an video" formats=".mp4" />
                            : (
                              <div className="flex flex-col gap-1.5">
                                <Label className="text-xs text-neutral-600">Video URL</Label>
                                <Input value={vidUrl} onChange={(e) => setVidUrl(e.target.value)} placeholder="https://example.com/video.mp4" className="h-9 text-[13px]" />
                              </div>
                            )
                          }
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <WarningBanner />
                        <button className="flex-shrink-0 h-9 px-4 rounded bg-neutral-200 text-neutral-500 text-[12px] font-semibold cursor-not-allowed">Run Prediction</button>
                      </div>
                    </>
                  )}

                  {/* ── Dataset Simulation ── */}
                  {predTab === "dataset" && (
                    <>
                      {/* Data source — sequential dependency: pick dataset → version → split */}
                      <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50/60 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Data Source</p>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] text-neutral-600">Dataset</Label>
                          <Select value={dsDataset} onValueChange={setDsDataset}>
                            <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue placeholder="Select a dataset" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="skin-cancer">Skin Cancer Classification</SelectItem>
                              <SelectItem value="ppe-detect">PPE Detection Dataset</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-600">Version</Label>
                            <Select value={dsVersion} onValueChange={setDsVersion}>
                              <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue placeholder="Select version" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="v1">v1.0</SelectItem>
                                <SelectItem value="v2">v2.0</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-600">Split Type</Label>
                            <Select value={dsSplitType} onValueChange={setDsSplitType}>
                              <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue placeholder="Select split" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="train">Train</SelectItem>
                                <SelectItem value="val">Validation</SelectItem>
                                <SelectItem value="test">Test</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      {/* Run configuration — auth + volume controls */}
                      <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50/60 p-4">
                        <p className="text-[10px] font-semibold uppercase tracking-wide text-neutral-400">Run Configuration</p>
                        <div className="flex flex-col gap-1">
                          <Label className="text-[11px] text-neutral-600">Auth Key</Label>
                          <Select value={predAuthKey} onValueChange={setPredAuthKey}>
                            <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue placeholder="Select auth key" /></SelectTrigger>
                            <SelectContent>
                              <SelectItem value="key-1">672ce53b06f3cf576afe6701</SelectItem>
                            </SelectContent>
                          </Select>
                          <p className="text-[10px] text-neutral-400 mt-0.5">
                            No keys available?{" "}
                            <span className="text-[#00775B] cursor-pointer hover:underline">Add auth key</span>
                          </p>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-600">Total Sample Count</Label>
                            <Input value={dsSampleCount} onChange={(e) => setDsSampleCount(e.target.value)} className="h-9 text-[13px] bg-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-600">Request Count</Label>
                            <Input value={dsReqCount} onChange={(e) => setDsReqCount(e.target.value)} className="h-9 text-[13px] bg-white" />
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <WarningBanner />
                        <button className="flex-shrink-0 h-9 px-4 rounded bg-neutral-200 text-neutral-500 text-[12px] font-semibold cursor-not-allowed">Run Prediction</button>
                      </div>
                    </>
                  )}

                </div>
              </div>

              <PredictionResults />
            </div>
          );
        })()}

        {/* ── Camera Management ── */}
        {activeTab === "camera" && (() => {
          const aspectOptions = ["16:9", "4:3", "1:1", "9:16", "21:9"];
          const protocolOptions = ["RTSP", "RTMP", "HTTP", "ONVIF"];

          const cgCols: ColumnDef<CameraGroup>[] = [
            { accessorKey: "name",      header: "Name",       cell: ({ row }) => <span className="font-medium text-[13px] text-neutral-800">{row.name}</span> },
            { accessorKey: "location",  header: "Location",   cell: ({ row }) => (
              <span className="flex items-center gap-1.5 text-[12px] text-neutral-500"><MapPin className="w-3 h-3" />{row.location}</span>
            )},
            { accessorKey: "cameras",   header: "Cameras",    cell: ({ row }) => (
              <span className="flex items-center gap-1.5 text-[12px]"><Camera className="w-3.5 h-3.5 text-neutral-400" />{row.cameras}</span>
            )},
            { accessorKey: "createdAt", header: "Created At", cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.createdAt}</span> },
            { accessorKey: "updatedAt", header: "Updated At", cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.updatedAt}</span> },
          ];

          const resetCreateModal = () => {
            setCgStep(1); setCgName(""); setCgLocation(""); setCgAspect("16:9");
            setCgWidth("1920"); setCgHeight("1080"); setCgFps(24); setCgQuality(80);
            setCgCameras([]); setCamName(""); setCamIp(""); setCamProtocol("RTSP");
          };

          return (
            <div className="p-6">
              {/* Create Camera Group modal */}
              <Dialog open={showCreateCG} onOpenChange={(v) => { if (!v) { setShowCreateCG(false); resetCreateModal(); } }}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden">
                  <DialogHeader className="px-6 pt-5 pb-0">
                    <DialogTitle className="text-[15px] font-semibold">Create Camera Group</DialogTitle>
                  </DialogHeader>

                  {/* Step indicator */}
                  <div className="flex items-center gap-0 px-6 pt-4 pb-5">
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold",
                        cgStep === 1 ? "bg-[#00775B] text-white" : "bg-[#00775B] text-white")}>1</div>
                      <span className={cn("text-[12px] font-semibold", cgStep === 1 ? "text-[#00775B]" : "text-[#00775B]")}>Create Camera Group</span>
                    </div>
                    <div className="flex-1 h-px bg-neutral-200 mx-3" />
                    <div className="flex items-center gap-2">
                      <div className={cn("w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold border",
                        cgStep === 2 ? "bg-[#00775B] text-white border-[#00775B]" : "bg-white text-neutral-400 border-neutral-300")}>2</div>
                      <span className={cn("text-[12px] font-semibold", cgStep === 2 ? "text-[#00775B]" : "text-neutral-400")}>Add Individual Cameras</span>
                    </div>
                  </div>

                  {/* Step 1 */}
                  {cgStep === 1 && (
                    <div className="px-6 pb-6 flex flex-col gap-5">
                      <div>
                        <p className="text-[13px] font-semibold text-neutral-800 mb-3">Camera Group Configuration</p>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-500">Camera Group Name</Label>
                            <Input value={cgName} onChange={(e) => setCgName(e.target.value)} placeholder="e.g. Warehouse Floor A" className="h-9 text-[13px]" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-500">Location</Label>
                            <Input value={cgLocation} onChange={(e) => setCgLocation(e.target.value)} placeholder="e.g. Building 3, Floor 2" className="h-9 text-[13px]" />
                          </div>
                        </div>
                      </div>

                      <div>
                        <p className="text-[13px] font-semibold text-neutral-800 mb-3">Default Stream Settings</p>
                        <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50/60 p-4">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-500">Aspect Ratio</Label>
                            <Select value={cgAspect} onValueChange={setCgAspect}>
                              <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {aspectOptions.map((a) => <SelectItem key={a} value={a}>{a}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                          <div className="grid grid-cols-2 gap-3 items-end">
                            <div className="flex flex-col gap-1">
                              <Label className="text-[11px] text-neutral-500">Width</Label>
                              <div className="relative">
                                <Input value={cgWidth} onChange={(e) => setCgWidth(e.target.value)} className="h-9 text-[13px] pr-14 bg-white" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">pixels</span>
                              </div>
                            </div>
                            <div className="flex flex-col gap-1">
                              <Label className="text-[11px] text-neutral-500">Height</Label>
                              <div className="relative">
                                <Input value={cgHeight} onChange={(e) => setCgHeight(e.target.value)} className="h-9 text-[13px] pr-14 bg-white" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[11px] text-neutral-400">pixels</span>
                              </div>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-5">
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-[11px] text-neutral-500">Frames Per Second</Label>
                                <span className="text-[11px] font-semibold text-neutral-700">{cgFps}</span>
                              </div>
                              <input type="range" min={1} max={60} value={cgFps}
                                onChange={(e) => setCgFps(Number(e.target.value))}
                                className="w-full accent-[#00775B] h-1.5 rounded-full cursor-pointer" />
                              <div className="flex justify-between text-[10px] text-neutral-400"><span>1</span><span>60</span></div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <div className="flex items-center justify-between">
                                <Label className="text-[11px] text-neutral-500">Video Quality</Label>
                                <span className="text-[11px] font-semibold text-neutral-700">{cgQuality}%</span>
                              </div>
                              <input type="range" min={10} max={100} value={cgQuality}
                                onChange={(e) => setCgQuality(Number(e.target.value))}
                                className="w-full accent-[#00775B] h-1.5 rounded-full cursor-pointer" />
                              <div className="flex justify-between text-[10px] text-neutral-400"><span>10%</span><span>100%</span></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex justify-end">
                        <button
                          disabled={!cgName.trim()}
                          onClick={() => setCgStep(2)}
                          className={cn("h-9 px-5 rounded text-[13px] font-semibold transition-colors",
                            cgName.trim() ? "bg-[#00775B] text-white hover:bg-[#006649]" : "bg-neutral-200 text-neutral-400 cursor-not-allowed")}>
                          Create Camera Group
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Step 2 */}
                  {cgStep === 2 && (
                    <div className="px-6 pb-6 flex flex-col gap-4">
                      <div className="flex items-center gap-2 bg-[#00775B]/5 border border-[#00775B]/20 rounded-lg px-4 py-2.5">
                        <Camera className="w-4 h-4 text-[#00775B]" />
                        <span className="text-[12px] text-[#00775B] font-medium">Group <strong>{cgName}</strong> created · Add cameras below</span>
                      </div>

                      {/* Add camera form */}
                      <div className="flex flex-col gap-3 rounded-lg border border-neutral-100 bg-neutral-50/60 p-4">
                        <p className="text-[11px] font-semibold uppercase tracking-wide text-neutral-400">Add Camera</p>
                        <div className="grid grid-cols-3 gap-3">
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-500">Camera Name</Label>
                            <Input value={camName} onChange={(e) => setCamName(e.target.value)} placeholder="e.g. Cam-01" className="h-9 text-[13px] bg-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-500">IP Address / URL</Label>
                            <Input value={camIp} onChange={(e) => setCamIp(e.target.value)} placeholder="192.168.1.x or rtsp://…" className="h-9 text-[13px] bg-white" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <Label className="text-[11px] text-neutral-500">Protocol</Label>
                            <Select value={camProtocol} onValueChange={setCamProtocol}>
                              <SelectTrigger className="h-9 text-[13px] bg-white"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                {protocolOptions.map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <button
                            disabled={!camName.trim() || !camIp.trim()}
                            onClick={() => { setCgCameras((prev) => [...prev, { name: camName, ip: camIp, protocol: camProtocol }]); setCamName(""); setCamIp(""); }}
                            className={cn("h-8 px-4 rounded text-[12px] font-semibold transition-colors",
                              camName.trim() && camIp.trim() ? "bg-[#00775B] text-white hover:bg-[#006649]" : "bg-neutral-200 text-neutral-400 cursor-not-allowed")}>
                            + Add Camera
                          </button>
                        </div>
                      </div>

                      {/* Added cameras list */}
                      {cgCameras.length > 0 && (
                        <div className="border border-neutral-200 rounded-lg overflow-hidden">
                          <div className="grid grid-cols-3 px-4 py-2 bg-neutral-50 border-b border-neutral-200 text-[10px] font-semibold uppercase tracking-wide text-neutral-400">
                            <span>Name</span><span>IP / URL</span><span>Protocol</span>
                          </div>
                          {cgCameras.map((c, i) => (
                            <div key={i} className="grid grid-cols-3 px-4 py-2.5 text-[12px] border-b border-neutral-100 last:border-0">
                              <span className="font-medium text-neutral-800">{c.name}</span>
                              <span className="text-neutral-500 font-mono text-[11px]">{c.ip}</span>
                              <span className="text-neutral-500">{c.protocol}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className="flex justify-between items-center pt-1">
                        <span className="text-[11px] text-neutral-400">{cgCameras.length} camera{cgCameras.length !== 1 ? "s" : ""} added</span>
                        <button
                          onClick={() => {
                            const now = new Date().toISOString().split("T")[0];
                            setCameraGroups((prev) => [...prev, { id: `cg-${prev.length + 1}`, name: cgName, location: cgLocation || "—", cameras: cgCameras.length, createdAt: now, updatedAt: now }]);
                            setShowCreateCG(false);
                            resetCreateModal();
                          }}
                          className="h-9 px-5 rounded bg-[#00775B] text-white text-[13px] font-semibold hover:bg-[#006649] transition-colors">
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>

              {/* Table */}
              <DataTable<CameraGroup>
                data={cameraGroups}
                columns={cgCols}
                toolbar={false}
                cardTitle="Camera Groups"
                cardAction={
                  <button onClick={() => { resetCreateModal(); setShowCreateCG(true); }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Create Camera Group
                  </button>
                }
                pagination="none"
              />
            </div>
          );
        })()}

        {/* ── Streaming Gateways ── */}
        {activeTab === "streaming" && (() => {
          const gwCols: ColumnDef<StreamingGateway>[] = [
            { accessorKey: "name",         header: "Name",          cell: ({ row }) => <span className="font-medium text-[13px] text-neutral-800">{row.name}</span> },
            { accessorKey: "id",           header: "Gateway ID",    cell: ({ row }) => <span className="font-mono text-[11px] text-neutral-500">{row.id}</span> },
            { accessorKey: "cameraGroups", header: "Camera Groups", cell: ({ row }) => (
              <div className="flex flex-wrap gap-1">
                {row.cameraGroups.length > 0
                  ? row.cameraGroups.map((g) => <span key={g} className="bg-neutral-100 text-neutral-600 text-[10px] px-2 py-0.5 rounded-full">{g}</span>)
                  : <span className="text-neutral-400 text-[12px]">—</span>}
              </div>
            )},
            { accessorKey: "createdAt", header: "Created At", cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.createdAt}</span> },
            { accessorKey: "updatedAt", header: "Updated At", cell: ({ row }) => <span className="text-[12px] text-neutral-500">{row.updatedAt}</span> },
          ];

          const resetGW = () => {
            setGwName(`MUF-${new Date().toISOString().slice(0,10).replace(/-/g,"")}`);
            setGwDesc(""); setGwCamGroups([]);
          };

          return (
            <div className="p-6">
              {/* Create Gateway modal */}
              <Dialog open={showCreateGW} onOpenChange={(v) => { if (!v) { setShowCreateGW(false); resetGW(); } }}>
                <DialogContent className="max-w-lg p-0 overflow-hidden">
                  <DialogHeader className="px-6 pt-5 pb-4 border-b border-neutral-100">
                    <DialogTitle className="text-[15px] font-semibold">Create Streaming Gateway</DialogTitle>
                  </DialogHeader>

                  <div className="px-6 py-5 flex flex-col gap-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-neutral-500">Streaming Gateway Name <span className="text-red-400">*</span></Label>
                        <Input value={gwName} onChange={(e) => setGwName(e.target.value)} className="h-9 text-[13px]" />
                      </div>
                      <div className="flex flex-col gap-1">
                        <Label className="text-[11px] text-neutral-500">Description <span className="text-red-400">*</span></Label>
                        <Input value={gwDesc} onChange={(e) => setGwDesc(e.target.value)} placeholder="e.g. Main warehouse feed" className="h-9 text-[13px]" />
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      <Label className="text-[11px] text-neutral-500">Select Camera Groups</Label>
                      <Select
                        value={gwCamGroups[0] ?? ""}
                        onValueChange={(v) => setGwCamGroups((prev) => prev.includes(v) ? prev.filter((x) => x !== v) : [...prev, v])}
                      >
                        <SelectTrigger className="h-9 text-[13px]">
                          <SelectValue placeholder="Camera Groups">
                            {gwCamGroups.length > 0 ? gwCamGroups.join(", ") : undefined}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {cameraGroups.length === 0
                            ? <div className="px-3 py-2 text-[12px] text-neutral-400">No camera groups yet</div>
                            : cameraGroups.map((cg) => (
                              <SelectItem key={cg.id} value={cg.name}>
                                <span className="flex items-center gap-2">
                                  {gwCamGroups.includes(cg.name) && <span className="text-[#00775B]">✓</span>}
                                  {cg.name}
                                </span>
                              </SelectItem>
                            ))
                          }
                        </SelectContent>
                      </Select>
                      {gwCamGroups.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1">
                          {gwCamGroups.map((g) => (
                            <span key={g} className="flex items-center gap-1 bg-[#00775B]/10 text-[#00775B] text-[10px] px-2 py-0.5 rounded-full">
                              {g}
                              <button onClick={() => setGwCamGroups((prev) => prev.filter((x) => x !== g))} className="hover:text-red-500 ml-0.5">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 px-6 pb-5">
                    <button onClick={() => { setShowCreateGW(false); resetGW(); }}
                      className="h-9 px-4 rounded border border-neutral-200 text-[13px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                      Cancel
                    </button>
                    <button
                      disabled={!gwName.trim() || !gwDesc.trim()}
                      onClick={() => {
                        const now = new Date().toISOString().split("T")[0];
                        setGateways((prev) => [...prev, {
                          id: `GW-${String(prev.length + 1).padStart(3,"0")}`,
                          name: gwName, description: gwDesc, cameraGroups: gwCamGroups,
                          createdAt: now, updatedAt: now,
                        }]);
                        setShowCreateGW(false); resetGW();
                      }}
                      className={cn("h-9 px-5 rounded text-[13px] font-semibold transition-colors",
                        gwName.trim() && gwDesc.trim() ? "bg-[#00775B] text-white hover:bg-[#006649]" : "bg-neutral-200 text-neutral-400 cursor-not-allowed")}>
                      Create
                    </button>
                  </div>
                </DialogContent>
              </Dialog>

              <DataTable<StreamingGateway>
                data={gateways}
                columns={gwCols}
                toolbar={false}
                cardTitle="Streaming Gateways"
                cardAction={
                  <button onClick={() => { resetGW(); setShowCreateGW(true); }}
                    className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                    <Plus className="w-3.5 h-3.5" /> Create New Gateway
                  </button>
                }
                pagination="none"
              />
            </div>
          );
        })()}

        {/* ── Output Stream ── */}
        {activeTab === "output" && (() => {
          const allCameras = cameraGroups.flatMap((cg) =>
            cgCameras.length > 0 ? cgCameras.map((c) => `${cg.name} / ${c.name}`) : []
          );
          const noCameras = allCameras.length === 0;

          return (
            <div className="flex flex-col h-full">
              {/* Toolbar */}
              <div className="flex items-center gap-2.5 px-5 py-3 border-b border-neutral-100 bg-white flex-shrink-0 flex-wrap">
                <Select value={outCamera} onValueChange={setOutCamera}>
                  <SelectTrigger className="h-8 text-[12px] w-40">
                    <SelectValue placeholder="Select Camera" />
                  </SelectTrigger>
                  <SelectContent>
                    {noCameras
                      ? <div className="px-3 py-2 text-[11px] text-neutral-400">No cameras available</div>
                      : allCameras.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)
                    }
                  </SelectContent>
                </Select>

                <Select value={outPosition} onValueChange={setOutPosition}>
                  <SelectTrigger className="h-8 text-[12px] w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {["Earliest", "Latest", "Custom"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                  </SelectContent>
                </Select>

                {noCameras && (
                  <span className="text-[11px] text-red-500 font-medium">No cameras found for this deployment</span>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  <button
                    onClick={() => setOutConnected(true)}
                    disabled={noCameras || !outCamera || outConnected}
                    className={cn("flex items-center gap-1.5 h-8 px-3.5 rounded text-[12px] font-semibold transition-colors",
                      !noCameras && outCamera && !outConnected
                        ? "bg-[#00775B] text-white hover:bg-[#006649]"
                        : "bg-[#00775B]/40 text-white cursor-not-allowed")}>
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 10 10"><polygon points="0,0 10,5 0,10" /></svg>
                    Connect
                  </button>
                  <button
                    onClick={() => setOutConnected(false)}
                    disabled={!outConnected}
                    className={cn("flex items-center gap-1.5 h-8 px-3.5 rounded text-[12px] font-semibold transition-colors border",
                      outConnected ? "border-neutral-300 text-neutral-600 hover:bg-neutral-50" : "border-neutral-200 text-neutral-300 cursor-not-allowed")}>
                    Disconnect
                  </button>
                  <button
                    onClick={() => setOutConnected(false)}
                    className="flex items-center gap-1.5 h-8 px-3.5 rounded bg-[#00775B] text-white text-[12px] font-semibold hover:bg-[#006649] transition-colors">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
                    </svg>
                    Reset
                  </button>
                  <button
                    onClick={() => { setOutConnected(false); setOutCamera(""); }}
                    className="h-8 px-3.5 rounded border border-neutral-300 text-[12px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                    Clear
                  </button>

                  {!isLive && (
                    <span className="flex items-center gap-1.5 text-[11px] text-red-500 font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block" />
                      Network Error
                    </span>
                  )}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 min-h-0 gap-0 p-5 gap-4">
                {/* Video panel */}
                <div className="flex-1 min-w-0 rounded-lg border border-neutral-200 bg-neutral-50 flex items-center justify-center">
                  {outConnected
                    ? (
                      <div className="flex flex-col items-center gap-2 text-neutral-400">
                        <div className="w-10 h-10 rounded-full bg-[#00775B]/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-[#00775B]" />
                        </div>
                        <p className="text-[12px]">Connecting to stream…</p>
                      </div>
                    )
                    : (
                      <p className="text-[12px] text-neutral-400">Waiting for stream… (No video data received)</p>
                    )
                  }
                </div>

                {/* Results panel */}
                <div className="w-[380px] flex-shrink-0 rounded-lg border border-neutral-200 bg-white flex flex-col overflow-hidden">
                  {/* Tab bar */}
                  <div className="flex border-b border-neutral-200">
                    {(["results", "json"] as const).map((t) => (
                      <button key={t} onClick={() => setOutResultTab(t)}
                        className={cn("relative flex-1 py-2.5 text-[12px] font-semibold capitalize transition-colors",
                          outResultTab === t ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
                        {t === "results" ? "Results" : "JSON"}
                        {outResultTab === t && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B]" />}
                      </button>
                    ))}
                  </div>

                  {/* Results content */}
                  {outResultTab === "results" && (
                    <div className="flex flex-col gap-4 p-4 flex-1 overflow-auto">
                      <div>
                        <p className="text-[11px] font-semibold text-neutral-700 mb-2">Key Information</p>
                        <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                          {[["Stream Key", "N/A"], ["Input Order", "N/A"]].map(([label, val]) => (
                            <div key={label}>
                              <p className="text-[10px] text-neutral-400">{label}</p>
                              <p className="text-[13px] font-medium text-neutral-700">{val}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-[11px] font-semibold text-neutral-700 mb-2">Application Results</p>
                        <p className="text-[12px] text-neutral-400 italic">No human text available for any applications…</p>
                      </div>
                    </div>
                  )}

                  {/* JSON content */}
                  {outResultTab === "json" && (
                    <div className="flex-1 overflow-auto p-4">
                      <pre className="text-[11px] text-neutral-500 font-mono whitespace-pre-wrap">{JSON.stringify({ streamKey: null, inputOrder: null, results: [] }, null, 2)}</pre>
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })()}

        {/* ── Kafka Instance ── */}
        {activeTab === "kafka" && (() => {
          const F = ({ label, errorKey, value, onChange, error, type = "text", colSpan = 1 }: {
            label: string; errorKey: string; value: string; onChange: (v: string) => void;
            error?: string; type?: string; colSpan?: number;
          }) => (
            <div className={colSpan === 2 ? "col-span-2" : ""}>
              <Label className="text-[11px] text-neutral-500 mb-1 block">{label}</Label>
              <Input
                type={type} value={value}
                onChange={(e) => { onChange(e.target.value); setKafkaErrors((p) => ({ ...p, [errorKey]: "" })); }}
                className={cn("h-9 text-[13px]", error && "border-red-400 focus-visible:ring-red-200")}
              />
              {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
            </div>
          );

          const validate = () => {
            const errs: Record<string, string> = {};
            if (!kafkaAlias.trim())        errs.alias        = "Invalid input: expected string, received undefined";
            if (!kafkaInstanceId.trim())   errs.instanceId   = "Instance ID is required";
            if (!kafkaInstanceType.trim()) errs.instanceType = "Instance Type is required";
            if (!kafkaProvider)            errs.provider     = "Service Provider is required";
            if (!kafkaLaunchDur.trim())    errs.launchDur    = "Invalid input: expected number, received undefined";
            if (!kafkaShutdownThr.trim())  errs.shutdownThr  = "Invalid input: expected number, received undefined";
            setKafkaErrors(errs);
            return Object.keys(errs).length === 0;
          };

          return (
            <div className="p-6 flex flex-col gap-5 overflow-auto">
              {/* Basic fields */}
              <div className="grid grid-cols-2 gap-4">
                <F label="Alias"         errorKey="alias"        value={kafkaAlias}        onChange={setKafkaAlias}        error={kafkaErrors.alias} />
                <F label="Instance ID"   errorKey="instanceId"   value={kafkaInstanceId}   onChange={setKafkaInstanceId}   error={kafkaErrors.instanceId} />
                <F label="Instance Type" errorKey="instanceType" value={kafkaInstanceType} onChange={setKafkaInstanceType} error={kafkaErrors.instanceType} />

                <div>
                  <Label className="text-[11px] text-neutral-500 mb-1 block">Service Provider</Label>
                  <Select value={kafkaProvider} onValueChange={(v) => { setKafkaProvider(v); setKafkaErrors((p) => ({ ...p, provider: "" })); }}>
                    <SelectTrigger className={cn("h-9 text-[13px]", kafkaErrors.provider && "border-red-400")}>
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      {["AWS", "GCP", "Azure", "On-Premise"].map((p) => <SelectItem key={p} value={p}>{p}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  {kafkaErrors.provider && <p className="text-[10px] text-red-500 mt-0.5">{kafkaErrors.provider}</p>}
                </div>
              </div>

              {/* Shutdown Settings */}
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-[11px] font-semibold text-neutral-500 whitespace-nowrap">Shutdown Settings</span>
                  <div className="flex-1 h-px bg-neutral-200" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <F label="Launch Duration"    value={kafkaLaunchDur}   onChange={setKafkaLaunchDur}   type="number" error={kafkaErrors.launchDur} />
                  <F label="Shutdown Threshold" value={kafkaShutdownThr} onChange={setKafkaShutdownThr} type="number" error={kafkaErrors.shutdownThr} />
                </div>
              </div>

              {/* Advance Settings */}
              <div className="border border-neutral-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setKafkaAdvOpen((v) => !v)}
                  className="w-full flex items-center justify-between px-4 py-3 bg-white hover:bg-neutral-50 transition-colors">
                  <span className="text-[13px] font-semibold text-neutral-700">Advance Settings</span>
                  <svg className={cn("w-4 h-4 text-neutral-400 transition-transform", kafkaAdvOpen && "rotate-180")}
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {kafkaAdvOpen && (
                  <div className="px-4 pb-4 pt-3 bg-white border-t border-neutral-100 grid grid-cols-4 gap-3">
                    {([
                      { label: "OS",              value: kafkaOs,       set: setKafkaOs },
                      { label: "OS Version",       value: kafkaOsVersion,set: setKafkaOsVersion },
                      { label: "GPU Type",         value: kafkaGpuType,  set: setKafkaGpuType },
                      { label: "GPU Count",        value: kafkaGpuCount, set: setKafkaGpuCount, type: "number" },
                      { label: "Total GPU Memory", value: kafkaGpuMem,   set: setKafkaGpuMem,   type: "number" },
                      { label: "RAM",              value: kafkaRam,      set: setKafkaRam,       type: "number" },
                      { label: "Storage",          value: kafkaStorage,  set: setKafkaStorage,   type: "number" },
                      { label: "Machine Name",     value: kafkaMachine,  set: setKafkaMachine },
                      { label: "CPU Type",         value: kafkaCpuType,  set: setKafkaCpuType,  colSpan: 2 },
                      { label: "Encryption Key",   value: kafkaEncKey,   set: setKafkaEncKey,   colSpan: 2 },
                    ] as { label: string; value: string; set: (v: string) => void; type?: string; colSpan?: number }[]).map(({ label, value, set, type = "text", colSpan = 1 }) => (
                      <div key={label} className={colSpan === 2 ? "col-span-2" : ""}>
                        <Label className="text-[11px] text-neutral-500 mb-1 block">{label}</Label>
                        <Input type={type} value={value} onChange={(e) => set(e.target.value)} className="h-9 text-[13px]" />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Add button */}
              <div className="flex justify-end pt-1">
                <button
                  onClick={() => { if (validate()) alert("Kafka instance added!"); }}
                  className="h-9 px-6 rounded bg-[#00775B] text-white text-[13px] font-semibold hover:bg-[#006649] transition-colors">
                  Add
                </button>
              </div>
            </div>
          );
        })()}

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
