import { useState } from "react";
import { ChevronRight, X } from "lucide-react";
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import {
  DataGrid, MonoCell, InterCell, StatusCapsule,
  DataGridColumn,
} from "@fe-common/components/ui/DataGrid";
import { Slider } from "@fe-common/components/ui/slider";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Primitives ───────────────────────────────────────────────────────────────

const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const FSelect = ({ placeholder, options, value, onChange }: {
  placeholder: string; options: string[]; value: string; onChange: (v: string) => void;
}) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-9 px-3 text-[12px] text-neutral-700 bg-white border border-neutral-200 rounded-[4px] outline-none appearance-none focus:border-[#00775B] transition-colors"
  >
    <option value="">{placeholder}</option>
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

// ─── Stat cards ───────────────────────────────────────────────────────────────

const STATS: StatCardData[] = [
  { label: "Active Clusters",     value: "9",  sublabel: "Registered Clusters",  num: "+2", ref_: "vs Last Month",  dir: "up",      chip: "CLUSTERS",  color: TEAL,      bgColor: "#E5FFF9" },
  { label: "Running Nodes",       value: "2",  sublabel: "Across All Clusters",  num: "+1", ref_: "vs Yesterday",   dir: "up",      chip: "RUNNING",   color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "On-Demand Launched",  value: "0",  sublabel: "Active Instances",     num: "0",  ref_: "No Change",      dir: "neutral", chip: "ON-DEMAND", color: "#7C3AED", bgColor: "#F3EEFF" },
  { label: "Dedicated Instances", value: "0",  sublabel: "Reserved Instances",   num: "0",  ref_: "No Change",      dir: "neutral", chip: "DEDICATED", color: "#D97706", bgColor: "#FFFBEB" },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

type ClusterNode = { id: string; alias: string; status: "running" | "stopped"; leaseType: string };
type Cluster     = {
  id: string; name: string; region: string; ip: string; kubernetes: boolean;
  status: "active" | "offline" | "degraded";
  gpuModel: string; totalVram: string; nodeCount: number; created: string;
  nodes: ClusterNode[];
};

const CLUSTERS: Cluster[] = [
  {
    id: "c-1", name: "JBK_Thor_LAN-default",            region: "Kolkata",   ip: "0.0.0.2",        kubernetes: false,
    status: "active",   gpuModel: "NVIDIA Jetson AGX Orin", totalVram: "64 GB",  nodeCount: 2, created: "Jan 8, 2026",
    nodes: [
      { id: "n-1", alias: "jbk_thor", status: "running", leaseType: "user-local" },
      { id: "n-2", alias: "asdf",     status: "running", leaseType: "user-local" },
    ],
  },
  { id: "c-2", name: "H100-Lan-default",                region: "US",        ip: "127.0.0.1",      kubernetes: false, status: "active",   gpuModel: "NVIDIA H100 SXM5",         totalVram: "80 GB",  nodeCount: 1, created: "Nov 14, 2025", nodes: [] },
  { id: "c-3", name: "Orin_Lan-default",                region: "Bengaluru", ip: "192.168.1.25",   kubernetes: false, status: "offline",  gpuModel: "NVIDIA Jetson AGX Orin",   totalVram: "64 GB",  nodeCount: 0, created: "Dec 3, 2025",  nodes: [] },
  { id: "c-4", name: "RPics-default",                   region: "LA",        ip: "0.0.9.0",        kubernetes: false, status: "active",   gpuModel: "NVIDIA RTX 4090",          totalVram: "24 GB",  nodeCount: 1, created: "Oct 5, 2025",  nodes: [] },
  { id: "c-5", name: "Orin_Stream-default",             region: "Jersey",    ip: "192.68.1.1",     kubernetes: false, status: "degraded", gpuModel: "NVIDIA Jetson AGX Orin",   totalVram: "64 GB",  nodeCount: 1, created: "Jan 14, 2026", nodes: [] },
  { id: "c-6", name: "test-lan-default",                region: "N/A",       ip: "104.28.217.149", kubernetes: false, status: "offline",  gpuModel: "—",                        totalVram: "—",      nodeCount: 0, created: "Feb 2, 2026",  nodes: [] },
  { id: "c-7", name: "Orin_LAN-default",                region: "Bangalore", ip: "0.0.0.3",        kubernetes: false, status: "active",   gpuModel: "NVIDIA Jetson AGX Orin",   totalVram: "64 GB",  nodeCount: 1, created: "Sep 22, 2025", nodes: [] },
  { id: "c-8", name: "fault-tolerant-default",          region: "unknown",   ip: "73.47.89.222",   kubernetes: false, status: "degraded", gpuModel: "NVIDIA A100 PCIe",         totalVram: "40 GB",  nodeCount: 1, created: "Mar 10, 2026", nodes: [] },
  { id: "c-9", name: "fault-tolerance-testing-default", region: "Kolkata",   ip: "192.162.17.18",  kubernetes: false, status: "offline",  gpuModel: "NVIDIA A100 PCIe",         totalVram: "40 GB",  nodeCount: 0, created: "Mar 21, 2026", nodes: [] },
];

type InstanceRow = {
  id: string; alias: string; status: "running" | "stopped" | "pending";
  priceHour: number; machineEff: number; provider: string;
  launchedAt: string; launchDur: string; shutdownAt: string;
  gpuType: string; gpuMemory: string; cpu: string; cores: number;
  memGB: number; storageGB: number; storageType: string;
};

const INSTANCE_COLS: DataGridColumn<InstanceRow>[] = [
  { key: "alias",       header: "Alias",           render: (r, h) => <InterCell hovered={h} isPrimary fontSize={12}>{r.alias}</InterCell> },
  { key: "status",      header: "Status",          width: "90px",  render: (r) => <StatusCapsule status={r.status} /> },
  { key: "priceHour",   header: "$Price/Hour",      width: "96px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11}>${r.priceHour.toFixed(2)}</MonoCell> },
  { key: "machineEff",  header: "Machine EFF",      width: "100px", align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11}>{r.machineEff}</MonoCell> },
  { key: "provider",    header: "Service Provider", width: "120px", render: (r, h) => <InterCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#334155">{r.provider}</InterCell> },
  { key: "launchedAt",  header: "Launched At",      width: "130px", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.launchedAt}</MonoCell> },
  { key: "launchDur",   header: "Launch Dur.",      width: "90px",  render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B">{r.launchDur}</MonoCell> },
  { key: "shutdownAt",  header: "Shutdown",         width: "90px",  render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8">{r.shutdownAt}</MonoCell> },
  { key: "gpuType",     header: "GPU Type",         width: "120px", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B">{r.gpuType}</MonoCell> },
  { key: "gpuMemory",   header: "GPU Memory",       width: "96px",  render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B">{r.gpuMemory}</MonoCell> },
  { key: "cpu",         header: "CPU",              width: "100px", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B">{r.cpu}</MonoCell> },
  { key: "cores",       header: "#Cores",           width: "70px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11}>{r.cores}</MonoCell> },
  { key: "memGB",       header: "Memory GB",        width: "90px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11}>{r.memGB}</MonoCell> },
  { key: "storageGB",   header: "Storage GB",       width: "90px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11}>{r.storageGB}</MonoCell> },
  { key: "storageType", header: "Storage Type",     width: "100px", render: (r, h) => <InterCell hovered={h} fontSize={11} color="#64748B">{r.storageType}</InterCell> },
];

const PROVIDER_COLORS: Record<string, string> = {
  GCP: "#4285F4", LAMBDA: "#F4511E", voltage_par: "#34A853", OCI: "#EA4335", AWS: "#8E44AD",
};

const SCATTER_DATA = {
  LAMBDA:      [
    { name: "gpu_1x_a10",        x: 0.72, y: 210 },
    { name: "gpu_1x_a100_sxm4",  x: 1.60, y: 155 },
    { name: "gpu_1x_h100_pcie",  x: 2.41, y: 175 },
    { name: "gpu_1x_h100_sxm5",  x: 2.50, y: 82  },
    { name: "gpu_1x_h100_sxm5b", x: 4.10, y: 90  },
  ],
  OCI:         [{ name: "VM.GPU.A10.1",    x: 2.10, y: 120 }],
  GCP:         [{ name: "g2-standard-4",   x: 0.70, y: 1.8 }, { name: "a2-ultragpu-1g", x: 5.10, y: 12 }],
  AWS:         [{ name: "p3.2xlarge",      x: 3.10, y: 1.6 }],
  voltage_par: [{ name: "vp-h100-01",      x: 1.90, y: 95  }],
};

// ─── Nested Cluster Table (v2.3 DataGrid pattern) ────────────────────────────

const HDR: React.CSSProperties = {
  fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif",
  textTransform: "uppercase", letterSpacing: "0.05em", color: "#1E293B",
};
const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 12, fontWeight: 500, color: "#64748B",
};
const INTER: React.CSSProperties = {
  fontFamily: "Inter, sans-serif", fontSize: 12, color: "#334155",
};

// Sub-table column widths
const SUB_COLS = "minmax(140px,1fr) 120px 150px";

function ClusterRow({ cluster }: { cluster: Cluster }) {
  const [open, setOpen]     = useState(cluster.id === "c-1");
  const [hov,  setHov]      = useState(false);

  const rowBg = hov ? "#EBF5F1" : "#ffffff";

  return (
    <div>
      {/* ── Main row ─────────────────────────────────────────────────────── */}
      <div
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          display: "flex", alignItems: "center", minHeight: 44,
          backgroundColor: rowBg,
          borderBottom: "1px solid #F1F5F9",
          position: "relative", transition: "background-color 100ms ease",
        }}
      >
        {/* teal left strip on hover */}
        <div style={{
          position: "absolute", left: 0, top: 0, bottom: 0, width: 2,
          backgroundColor: TEAL, opacity: hov || open ? 1 : 0,
          transition: "opacity 100ms ease",
        }} />

        {/* Cluster Name */}
        <div style={{ ...flexCol(C.name), display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, paddingRight: 8, height: "100%", minHeight: 44, backgroundColor: rowBg, transition: "background-color 100ms ease" }}>
          <button onClick={() => setOpen(p => !p)} style={{ width: 16, height: 16, display: "flex", alignItems: "center", justifyContent: "center", border: "none", background: "transparent", cursor: "pointer", padding: 0, flexShrink: 0, borderRadius: 3, color: hov ? "#64748B" : "#CBD5E1", transition: "color 120ms ease" }}>
            <ChevronRight style={{ width: 12, height: 12, transition: "transform 150ms ease", transform: open ? "rotate(90deg)" : "none" }} />
          </button>
          <span style={{ ...INTER, fontWeight: hov ? 700 : 600, color: hov ? "#0F172A" : "#475569", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", transition: "color 100ms ease" }}>
            {cluster.name}
          </span>
        </div>

        {/* Flex cols */}
        <div style={{ ...flexCol(C.region),  paddingLeft: 8, paddingRight: 8 }}>
          <span style={{ ...INTER, color: hov ? "#334155" : "#64748B", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{cluster.region}</span>
        </div>
        <div style={{ ...flexCol(C.ip),      paddingLeft: 8, paddingRight: 8 }}>
          <span style={{ ...MONO, color: hov ? "#334155" : "#94A3B8", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{cluster.ip}</span>
        </div>

        {/* Fixed cols */}
        <div style={{ ...fixedCol(C.status), paddingLeft: 8, paddingRight: 8 }}>
          <StatusCapsule status={cluster.status === "active" ? "active" : cluster.status === "degraded" ? "queued" : "failed"} label={cluster.status.charAt(0).toUpperCase() + cluster.status.slice(1)} />
        </div>

        <div style={{ ...flexCol(C.gpu),     paddingLeft: 8, paddingRight: 8 }}>
          <span style={{ ...MONO, color: hov ? "#334155" : "#64748B", fontSize: 11, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", display: "block" }}>{cluster.gpuModel}</span>
        </div>
        <div style={{ ...fixedCol(C.vram),   paddingLeft: 8, paddingRight: 8, textAlign: "right"  as const }}>
          <span style={{ ...MONO, color: hov ? "#334155" : "#64748B", fontSize: 11 }}>{cluster.totalVram}</span>
        </div>
        <div style={{ ...fixedCol(C.nodes),  paddingLeft: 8, paddingRight: 8, textAlign: "center" as const }}>
          <span style={{ ...MONO, color: hov ? "#0F172A" : "#475569", fontSize: 12, fontWeight: 600 }}>{cluster.nodeCount}</span>
        </div>
        <div style={{ ...flexCol(C.created), paddingLeft: 8, paddingRight: 8 }}>
          <span style={{ ...MONO, color: "#94A3B8", fontSize: 10, whiteSpace: "nowrap" }}>{cluster.created}</span>
        </div>
        <div style={{ ...fixedCol(C.kubernetes), paddingLeft: 8, paddingRight: 16, display: "flex", alignItems: "center" }}>
          {cluster.kubernetes ? <span style={{ color: TEAL, fontSize: 12, fontWeight: 700 }}>✓</span> : <X style={{ width: 14, height: 14, color: "#CBD5E1" }} />}
        </div>
      </div>

      {/* ── Expansion panel (v2.3 style) ─────────────────────────────────── */}
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
            paddingTop: 8, paddingBottom: 6, paddingLeft: 31, paddingRight: 16,
            borderBottom: "1px solid rgba(0,119,91,0.1)",
          }}>
            <span style={{ ...MONO, fontWeight: 700, color: "#475569" }}>{cluster.name}</span>
            <span style={{ fontSize: 12, color: "#64748B", fontFamily: "Inter, sans-serif" }}>·</span>
            <span style={{ fontSize: 12, color: "#64748B", fontFamily: "Inter, sans-serif" }}>{cluster.nodes.length} node{cluster.nodes.length !== 1 ? "s" : ""}</span>
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

          {cluster.nodes.length === 0 ? (
            <div style={{ padding: "12px 31px", fontSize: 12, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
              No nodes registered for this cluster
            </div>
          ) : (
            <div style={{ padding: "0 0 8px" }}>
              {/* Sub-table header */}
              <div style={{
                display: "grid", gridTemplateColumns: SUB_COLS,
                alignItems: "center", height: 34, paddingLeft: 31, paddingRight: 16,
                backgroundColor: "rgba(0,0,0,0.035)",
                borderBottom: "1px solid rgba(0,0,0,0.07)",
              }}>
                {["Alias", "Status", "Lease Type"].map(h => (
                  <span key={h} style={{ ...HDR, paddingRight: 16 }}>{h}</span>
                ))}
              </div>

              {/* Sub-table rows */}
              {cluster.nodes.map((node, si) => (
                <div key={node.id} style={{
                  display: "grid", gridTemplateColumns: SUB_COLS,
                  alignItems: "center", height: 36, paddingLeft: 31, paddingRight: 16,
                  backgroundColor: si % 2 === 1 ? "rgba(0,119,91,0.015)" : "transparent",
                  borderTop: "1px solid rgba(0,119,91,0.06)",
                }}>
                  <span style={{ ...INTER, fontWeight: 500, paddingRight: 16 }}>{node.alias}</span>
                  <div style={{ paddingRight: 16 }}>
                    <StatusCapsule status={node.status} label={node.status === "running" ? "Running" : "Stopped"} />
                  </div>
                  <span style={{ ...MONO, color: "#94A3B8" }}>{node.leaseType}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Responsive column definitions — flex cols grow/shrink, fixed cols stay locked
const C = {
  name:       { flex: 3, minWidth: 160 },
  region:     { flex: 1, minWidth: 80  },
  ip:         { flex: 1.5, minWidth: 110 },
  status:     { width: 86,  flexShrink: 0 },
  gpu:        { flex: 2.5, minWidth: 140 },
  vram:       { width: 72,  flexShrink: 0 },
  nodes:      { width: 64,  flexShrink: 0 },
  created:    { flex: 1.5, minWidth: 100 },
  kubernetes: { width: 88,  flexShrink: 0 },
} as const;

const flexCol  = (def: { flex: number; minWidth: number }) => ({ flex: def.flex, minWidth: def.minWidth, overflow: "hidden" as const });
const fixedCol = (def: { width: number; flexShrink: 0 })  => ({ width: def.width, flexShrink: 0 as const });

function ClustersTab() {
  return (
    <SectionCard>
      <div style={{ overflowX: "auto" }}>
        <div style={{ minWidth: 760 }}>
          {/* Table header row */}
          <div style={{
            display: "flex", alignItems: "center", height: 44,
            backgroundColor: "#F8FAFC",
            borderBottom: "1px solid #E2E8F0",
          }}>
            <div style={{ ...flexCol(C.name), display: "flex", alignItems: "center", gap: 6, paddingLeft: 12, paddingRight: 8 }}>
              <span style={{ width: 16, height: 16, flexShrink: 0 }} />
              <span style={HDR}>Cluster Name</span>
            </div>
            <div style={{ ...flexCol(C.region),  paddingLeft: 8, paddingRight: 8 }}><span style={HDR}>Region</span></div>
            <div style={{ ...flexCol(C.ip),      paddingLeft: 8, paddingRight: 8 }}><span style={HDR}>Public IP</span></div>
            <div style={{ ...fixedCol(C.status), paddingLeft: 8, paddingRight: 8 }}><span style={HDR}>Status</span></div>
            <div style={{ ...flexCol(C.gpu),     paddingLeft: 8, paddingRight: 8 }}><span style={HDR}>GPU Model</span></div>
            <div style={{ ...fixedCol(C.vram),   paddingLeft: 8, paddingRight: 8, textAlign: "right"  as const }}><span style={HDR}>VRAM</span></div>
            <div style={{ ...fixedCol(C.nodes),  paddingLeft: 8, paddingRight: 8, textAlign: "center" as const }}><span style={HDR}>Nodes</span></div>
            <div style={{ ...flexCol(C.created), paddingLeft: 8, paddingRight: 8 }}><span style={HDR}>Created</span></div>
            <div style={{ ...fixedCol(C.kubernetes), paddingLeft: 8, paddingRight: 16 }}><span style={HDR}>Kubernetes</span></div>
          </div>

          {CLUSTERS.map((c) => <ClusterRow key={c.id} cluster={c} />)}
        </div>
      </div>
    </SectionCard>
  );
}

// ─── On-Demand tab ────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ScatterDot = (props: any) => {
  const { cx, cy, fill, payload } = props;
  return (
    <g>
      <circle cx={cx} cy={cy} r={6} fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={1.5} />
      <text x={cx + 9} y={cy + 4} fontSize={9} fill="#475569" fontFamily="Inter, sans-serif">{payload.name}</text>
    </g>
  );
};

function OnDemandTab() {
  const [provider, setProvider] = useState("");
  const [gpu,      setGpu]      = useState("");
  const [gpuCount, setGpuCount] = useState("1");
  const [price,    setPrice]    = useState([0, 6]);
  const [eff,      setEff]      = useState([0, 300]);

  const EMPTY_STATE = (
    <div className="flex flex-col items-center justify-center py-14 gap-1.5">
      <p className="text-[13px] font-semibold text-neutral-600">No On-Demand Instances</p>
      <p className="text-[11px] text-neutral-400">Select a point on the chart above to launch an instance</p>
    </div>
  );

  return (
    <div className="flex flex-col gap-5">
      <SectionCard>
        <div className="px-5 py-3.5 border-b border-neutral-100">
          <h3 className="text-[13px] font-semibold text-neutral-800">Launch an On-Demand Instance</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Filter and select a GPU instance from the chart</p>
        </div>
        <div className="flex">
          {/* Filters */}
          <div className="w-60 flex-shrink-0 border-r border-neutral-100 p-5 flex flex-col gap-4">
            <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Filters</p>
            <FSelect placeholder="Service Provider" options={Object.keys(PROVIDER_COLORS)} value={provider} onChange={setProvider} />
            <FSelect placeholder="GPU" options={["A10", "A100 SXM4", "H100 PCIe", "H100 SXM5", "T4"]} value={gpu} onChange={setGpu} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Number of GPUs</p>
              <FSelect placeholder="1" options={["1", "2", "4", "8"]} value={gpuCount} onChange={setGpuCount} />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Price ($/hr)</p>
                <span className="text-[10px] font-mono text-neutral-500">{price[0].toFixed(1)} – {price[1].toFixed(1)}</span>
              </div>
              <Slider min={0} max={6} step={0.1} value={price} onValueChange={setPrice}
                className="[&_[data-slot=slider-range]]:bg-[#00775B] [&_[data-slot=slider-thumb]]:border-[#00775B]" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2.5">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">Machine Efficiency</p>
                <span className="text-[10px] font-mono text-neutral-500">{eff[0]} – {eff[1]}</span>
              </div>
              <Slider min={0} max={300} step={1} value={eff} onValueChange={setEff}
                className="[&_[data-slot=slider-range]]:bg-[#00775B] [&_[data-slot=slider-thumb]]:border-[#00775B]" />
            </div>
          </div>

          {/* Scatter chart */}
          <div className="flex-1 p-5">
            <ResponsiveContainer width="100%" height={320}>
              <ScatterChart margin={{ top: 10, right: 40, bottom: 32, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                <XAxis dataKey="x" type="number" name="Price" domain={[0, 6.5]} tickCount={8}
                  label={{ value: "Price per Hour ($)", position: "insideBottom", offset: -18, fontSize: 10, fill: "#94A3B8" }}
                  tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }} />
                <YAxis dataKey="y" type="number" name="Machine Efficiency" scale="log" domain={[1, 1000]}
                  label={{ value: "Machine Efficiency", angle: -90, position: "insideLeft", offset: 12, fontSize: 10, fill: "#94A3B8" }}
                  tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "JetBrains Mono, monospace" }} />
                <Tooltip cursor={{ strokeDasharray: "3 3" }}
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-white border border-neutral-200 rounded-[4px] px-3 py-2 shadow-md text-[11px]">
                        <p className="font-semibold text-neutral-800 mb-1">{d.name}</p>
                        <p className="text-neutral-500">Price: <span className="font-mono text-neutral-700">${d.x}/hr</span></p>
                        <p className="text-neutral-500">Efficiency: <span className="font-mono text-neutral-700">{d.y}</span></p>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: 10, paddingTop: 6 }} />
                {Object.entries(SCATTER_DATA).map(([name, data]) => (
                  <Scatter key={name} name={name} data={data} fill={PROVIDER_COLORS[name]} shape={<ScatterDot />} />
                ))}
              </ScatterChart>
            </ResponsiveContainer>
            <p className="text-right text-[10px] text-neutral-400 italic -mt-1">Select a point to launch an instance</p>
          </div>
        </div>
      </SectionCard>

      <SectionCard>
        <div className="px-5 py-3.5 border-b border-neutral-100">
          <h3 className="text-[13px] font-semibold text-neutral-800">On-Demand Instances</h3>
          <p className="text-[11px] text-neutral-400 mt-0.5">Active and recently terminated on-demand GPU instances</p>
        </div>
        <DataGrid<InstanceRow> columns={INSTANCE_COLS} data={[]} emptyState={EMPTY_STATE} searchable searchPlaceholder="Search instances…" />
      </SectionCard>
    </div>
  );
}

// ─── Dedicated Instances tab ──────────────────────────────────────────────────

function DedicatedTab() {
  const EMPTY_STATE = (
    <div className="flex flex-col items-center justify-center py-14 gap-1.5">
      <p className="text-[13px] font-semibold text-neutral-600">No Dedicated Instances</p>
      <p className="text-[11px] text-neutral-400">We haven't found any Dedicated Instances!</p>
      <button className="mt-2 h-9 px-5 text-[11px] font-semibold rounded-[4px] bg-[#00775B] hover:bg-[#006649] text-white transition-colors uppercase tracking-wide">
        Add New Dedicated Instance
      </button>
    </div>
  );

  return (
    <SectionCard>
      <div className="px-5 py-3.5 border-b border-neutral-100">
        <h3 className="text-[13px] font-semibold text-neutral-800">Dedicated Instances</h3>
        <p className="text-[11px] text-neutral-400 mt-0.5">Reserved GPU instances for exclusive high-throughput use</p>
      </div>
      <DataGrid<InstanceRow> columns={INSTANCE_COLS} data={[]} emptyState={EMPTY_STATE} searchable searchPlaceholder="Search instances…" />
    </SectionCard>
  );
}

// ─── Tab bar ──────────────────────────────────────────────────────────────────

type ComputeTab = "clusters" | "ondemand" | "dedicated";

function TabBar({ active, onChange }: { active: ComputeTab; onChange: (t: ComputeTab) => void }) {
  const tabs: { id: ComputeTab; label: string }[] = [
    { id: "clusters",  label: "Compute Clusters" },
    { id: "ondemand",  label: "On-Demand Instances" },
    { id: "dedicated", label: "Dedicated Instances" },
  ];
  return (
    <div className="flex items-center gap-0 border-b border-neutral-200 bg-white -mt-6 -mx-6 px-6">
      {tabs.map((t) => (
        <button key={t.id} onClick={() => onChange(t.id)}
          className={cn("relative px-4 py-3 text-[12px] font-semibold transition-colors",
            active === t.id ? "text-[#00775B]" : "text-neutral-500 hover:text-neutral-700")}>
          {t.label}
          {active === t.id && <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />}
        </button>
      ))}
    </div>
  );
}

// ─── ComputePage ──────────────────────────────────────────────────────────────

export function ComputePage() {
  const [tab, setTab] = useState<ComputeTab>("clusters");

  return (
    <div className="flex flex-col gap-6">
      <TabBar active={tab} onChange={setTab} />

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {tab === "clusters"  && <ClustersTab />}
      {tab === "ondemand"  && <OnDemandTab />}
      {tab === "dedicated" && <DedicatedTab />}
    </div>
  );
}
