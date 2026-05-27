import { useState, useMemo } from "react";
import {
  ArrowUpRight, ArrowDownRight, Minus,
  ChevronRight, ChevronDown, ChevronLeft, RefreshCw,
  Activity, Plus, Search, Filter, SlidersHorizontal, X, Edit2, Trash2,
  LayoutGrid, List, Video,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { CAMERAS, CAMERA_SUMMARY, Camera, HeartbeatSegment } from "@/app/data/cameraData";

// ─── Shared helpers ───────────────────────────────────────────────────────────
function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

type SeverityDir = "up" | "down" | "neutral";

// ══════════════════════════════════════════════════════════════════════════════
//  V1.2  ·  TYPE A — STAT CARD
// ══════════════════════════════════════════════════════════════════════════════
const V12Card = ({ color, bgColor, children }: { color: string; bgColor: string; children: React.ReactNode }) => {
  const [h, setH] = useState(false);
  return (
    <div
      className="w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200"
      style={{
        minWidth: 220,
        border: `1px solid ${color}`, background: bgColor,
        boxShadow: h
          ? `0 0 18px 4px ${hex2rgba(color, 0.22)}, 0 4px 14px rgba(0,0,0,0.07)`
          : `0 0 6px 1px ${hex2rgba(color, 0.10)}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >{children}</div>
  );
};

const V12Divider = ({ color }: { color: string }) => (
  <div style={{ height: 1, backgroundColor: hex2rgba(color, 0.22), margin: "0 16px" }} />
);

const V12Label = ({ label, chip, color }: { label: string; chip?: string; color: string }) => (
  <div className="px-4 pt-4 flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>{label}</span>
    {chip && (
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0"
        style={{ backgroundColor: hex2rgba(color, 0.14), color }}>
        {chip}
      </span>
    )}
  </div>
);

const BS = ({ dir, num, ref_, color }: { dir: SeverityDir; num: string; ref_: string; color: string }) => (
  <div className="flex flex-col px-[10px] py-[8px] rounded-[6px] flex-shrink-0" style={{ backgroundColor: hex2rgba(color, 0.12) }}>
    <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color }}>
      {dir === "up" ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
        : dir === "down" ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />
        : <Minus className="w-3 h-3 flex-shrink-0" />}
      {num}
    </div>
    <div className="text-[10px] font-normal mt-[5px] leading-none text-[#94a3b8]">{ref_}</div>
  </div>
);

interface StatData {
  label: string; value: string; sublabel: string;
  num: string; ref_: string; dir: SeverityDir;
  definition: string; chip: string;
  color: string; bgColor: string;
}

const V12StatCard = ({ d }: { d: StatData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <V12Label label={d.label} chip={d.chip} color={d.color} />
    <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
      <div className="flex flex-col gap-[7px]">
        <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{d.value}</div>
        <div className="text-[12px] text-[#64748b]">{d.sublabel}</div>
      </div>
      <BS dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
    </div>
  </V12Card>
);

// ─── Status Pill ─────────────────────────────────────────────────────────────
const CAMERA_STATUS_CFG: Record<string, { label: string; bg: string }> = {
  online:         { label: "Online",       bg: "#00A63E" },
  offline:        { label: "Offline",      bg: "#E7000B" },
  "no-heartbeat": { label: "No Heartbeat", bg: "#EA580C" },
};

const StatusPill = ({ status }: { status: string }) => {
  const cfg = CAMERA_STATUS_CFG[status.toLowerCase()] ?? { label: status, bg: "#64748B" };
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", padding: "2px 8px", borderRadius: 4,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
      color: "#ffffff", backgroundColor: cfg.bg, fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
};

// ─── Heartbeat Panel ─────────────────────────────────────────────────────────
const STATUS_COLOR: Record<string, string> = {
  online:  "#00A63E",
  offline: "#E7000B",
  unknown: "#94A3B8",
};

type TimeRange = "1H" | "6H" | "12H" | "24H";
const RANGE_MINUTES: Record<TimeRange, number> = { "1H": 60, "6H": 360, "12H": 720, "24H": 1440 };

function getTickLabels(rangeMinutes: number): string[] {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(now.getTime() - (rangeMinutes - (rangeMinutes / 6) * i) * 60_000);
    return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  });
}

function computeStats(segments: HeartbeatSegment[], windowMinutes: number) {
  const windowStart = 1440 - windowMinutes;
  const clipped = segments
    .map(s => ({ ...s, start: Math.max(s.start, windowStart), end: Math.min(s.end, 1440) }))
    .filter(s => s.end > s.start);
  const onlineMinutes = clipped.filter(s => s.status === "online").reduce((a, s) => a + (s.end - s.start), 0);
  const offlineEvents = clipped.filter(s => s.status === "offline").length;
  let longestOnline = 0, current = 0;
  for (const s of clipped) {
    if (s.status === "online") { current += s.end - s.start; longestOnline = Math.max(longestOnline, current); }
    else { current = 0; }
  }
  const pct = ((onlineMinutes / windowMinutes) * 100).toFixed(1);
  const h = Math.floor(longestOnline / 60), m = longestOnline % 60;
  return { pct, longestStr: h > 0 ? `${h}h ${m}m` : `${m}m`, offlineEvents };
}

const HeartbeatPanel = ({ camera }: { camera: Camera }) => {
  const [range, setRange] = useState<TimeRange>("24H");
  const windowMinutes = RANGE_MINUTES[range];
  const windowStart   = 1440 - windowMinutes;

  const now = new Date();
  const fromTime = new Date(now.getTime() - windowMinutes * 60_000);
  const fromStr = `${fromTime.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} ${fromTime.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;
  const toStr   = `${now.toLocaleDateString("en-US", { month: "2-digit", day: "2-digit", year: "numeric" })} ${now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}`;

  const visibleSegments = camera.heartbeat24h
    .map(s => ({ ...s, start: Math.max(s.start, windowStart), end: Math.min(s.end, 1440) }))
    .filter(s => s.end > s.start);

  const stats = computeStats(camera.heartbeat24h, windowMinutes);
  const ticks = getTickLabels(windowMinutes);

  return (
    <div className="border-l-2 bg-neutral-50 px-6 py-4 animate-in slide-in-from-top-1 duration-200"
      style={{ borderColor: "#00775B" }}>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-2">
          <Activity className="w-3.5 h-3.5 text-[#00775B]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-700">
            {camera.name} · 24h Heartbeat
          </span>
        </div>
        <div className="flex items-center bg-white border border-neutral-200 rounded-[4px] p-0.5 shadow-sm gap-0.5">
          {(["1H", "6H", "12H", "24H"] as TimeRange[]).map(r => (
            <button key={r} onClick={() => setRange(r)}
              className={cn(
                "px-2.5 py-1 text-[10px] font-bold uppercase rounded-[3px] transition-colors",
                range === r ? "bg-[#00775B] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-800 hover:bg-neutral-100"
              )}>
              {r}
            </button>
          ))}
          <div className="w-px h-4 bg-neutral-200 mx-0.5" />
          <button className="px-2.5 py-1 text-[10px] font-bold uppercase text-[#00775B] hover:bg-[#00775B]/5 rounded-[3px] transition-colors flex items-center gap-1">
            <RefreshCw className="w-2.5 h-2.5" />Refresh
          </button>
        </div>
      </div>
      <p className="text-[10px] text-neutral-400 mb-0.5">From {fromStr} to {toStr}</p>
      <p className="text-[10px] text-neutral-400 mb-3">Each segment is one online ↔ offline transition</p>
      <div className="flex w-full h-[28px] rounded-[3px] overflow-hidden border border-neutral-200 shadow-sm">
        {visibleSegments.map((seg, i) => (
          <div key={i} title={`${seg.status} · ${seg.end - seg.start}m`}
            style={{ width: `${((seg.end - seg.start) / windowMinutes) * 100}%`, backgroundColor: STATUS_COLOR[seg.status], flexShrink: 0 }} />
        ))}
      </div>
      <div className="flex justify-between mt-1.5">
        {ticks.map((t, i) => (
          <div key={i} className="flex flex-col items-center" style={{ width: 1 }}>
            <div className="w-px h-1.5 bg-neutral-300" />
            <span className="text-[9px] font-mono text-neutral-400 mt-0.5 whitespace-nowrap">{t}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        {[{ status: "online", label: "Online" }, { status: "offline", label: "Offline" }, { status: "unknown", label: "Unknown" }].map(({ status, label }) => (
          <div key={status} className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: STATUS_COLOR[status] }} />
            <span className="text-[10px] font-medium text-neutral-500">{label}</span>
          </div>
        ))}
      </div>
      <div className="flex items-center gap-6 mt-3 pt-3 border-t border-neutral-200">
        {[
          { label: "Uptime", val: `${stats.pct}%`, color: parseFloat(stats.pct) >= 90 ? "#00775B" : parseFloat(stats.pct) >= 70 ? "#E19A04" : "#E7000B" },
          { label: "Longest Online", val: stats.longestStr, color: "#334155" },
          { label: "Offline Events", val: String(stats.offlineEvents), color: stats.offlineEvents === 0 ? "#00775B" : stats.offlineEvents <= 2 ? "#E19A04" : "#E7000B" },
        ].map((s, i) => (
          <div key={i} className="flex items-center gap-3">
            {i > 0 && <div className="w-px h-8 bg-neutral-200" />}
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-neutral-400">{s.label}</p>
              <p className="text-sm font-black" style={{ fontFamily: "'JetBrains Mono', monospace", color: s.color }}>{s.val}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── V2.2 Toolbar ────────────────────────────────────────────────────────────
const CAM_STATUS_LABELS: Record<string, string> = {
  online:         "Online",
  offline:        "Offline",
  "no-heartbeat": "No Heartbeat",
};
const CAM_SORT_OPTIONS = [
  { key: "status-priority", label: "Status: Issues First",  shortLabel: "Issues ↑" },
  { key: "name-asc",        label: "Name: A → Z",           shortLabel: "Name ↑"  },
  { key: "name-desc",       label: "Name: Z → A",           shortLabel: "Name ↓"  },
  { key: "fps-desc",        label: "FPS: High → Low",       shortLabel: "FPS ↓"   },
  { key: "fps-asc",         label: "FPS: Low → High",       shortLabel: "FPS ↑"   },
  { key: "mem-desc",        label: "Memory: High → Low",    shortLabel: "Mem ↓"   },
  { key: "mem-asc",         label: "Memory: Low → High",    shortLabel: "Mem ↑"   },
];
const STATUS_PRIORITY: Record<string, number> = { offline: 0, "no-heartbeat": 1, online: 2 };

const InlineCheckbox = ({ checked }: { checked: boolean }) => (
  <span style={{
    width: 13, height: 13, flexShrink: 0, borderRadius: 2, display: "inline-flex",
    alignItems: "center", justifyContent: "center", transition: "all 100ms ease",
    border: `1.5px solid ${checked ? "#00775B" : "#CBD5E1"}`,
    backgroundColor: checked ? "#00775B" : "transparent",
  }}>
    {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
  </span>
);

// ══════════════════════════════════════════════════════════════════════════════
//  Overview Grid (table view)
// ══════════════════════════════════════════════════════════════════════════════
const OV_COLS    = "36px 1fr 110px 80px 210px 74px 104px 76px 96px";
const OV_HEADERS = ["", "Camera Name", "Status", "Protocol", "Feed Path", "Aspect Ratio", "Dimensions", "Stream FPS", "Memory"];

const CamerasGrid = ({ cameras }: { cameras: Camera[] }) => {
  const [hoveredId, setHoveredId]   = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "inherit", width: "100%" }}>
      <div style={{
        display: "grid", gridTemplateColumns: OV_COLS,
        alignItems: "center", height: 40,
        backgroundColor: "transparent", borderBottom: "2px solid #00775B",
        paddingLeft: 8, paddingRight: 8,
      }}>
        {OV_HEADERS.map((h, i) => (
          <div key={i} style={{
            fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif",
            color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em",
            paddingLeft: i === 0 ? 0 : 8, paddingRight: 8,
          }}>{h}</div>
        ))}
      </div>

      {cameras.length === 0 && (
        <div style={{ padding: "32px 16px", textAlign: "center", color: "#94A3B8", fontSize: 12 }}>
          No cameras match the current filters.
        </div>
      )}

      {cameras.map((cam, idx) => {
        const isHovered  = hoveredId === cam.id;
        const isExpanded = expandedId === cam.id;
        const isEven     = idx % 2 === 1;
        const rowBg      = isHovered ? "rgba(0,119,91,0.08)" : isEven ? "rgba(0,119,91,0.018)" : "#ffffff";
        const glowShadow = isHovered ? "0 0 10px rgba(0,119,91,0.3)" : "none";

        const mono: React.CSSProperties = {
          fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11, fontWeight: isHovered ? 600 : 500,
          color: isHovered ? "#0F172A" : "#64748B",
          textShadow: glowShadow,
          transition: "color 120ms ease, text-shadow 200ms ease",
        };
        const inter: React.CSSProperties = {
          fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: isHovered ? 500 : 400,
          color: isHovered ? "#0F172A" : "#334155",
          textShadow: isHovered ? "0 0 10px rgba(0,119,91,0.25)" : "none",
          transition: "color 120ms ease, text-shadow 200ms ease",
        };

        return (
          <div key={cam.id}>
            <div
              onMouseEnter={() => setHoveredId(cam.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => setExpandedId(prev => prev === cam.id ? null : cam.id)}
              style={{
                display: "grid", gridTemplateColumns: OV_COLS,
                alignItems: "center", height: 44,
                backgroundColor: rowBg, cursor: "pointer",
                transition: "background-color 120ms ease",
                paddingLeft: 8, paddingRight: 8,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                {isExpanded
                  ? <ChevronDown style={{ width: 14, height: 14, color: "#00775B", flexShrink: 0 }} />
                  : <ChevronRight style={{ width: 14, height: 14, color: isHovered ? "#334155" : "#CBD5E1", flexShrink: 0, transition: "color 120ms" }} />
                }
              </div>
              <div style={{ paddingLeft: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                <span style={{ ...inter, fontWeight: isHovered ? 600 : 500 }}>{cam.name}</span>
              </div>
              <div style={{ paddingLeft: 8 }}><StatusPill status={cam.status} /></div>
              <div style={{ paddingLeft: 8 }}><span style={mono}>{cam.protocol}</span></div>
              <div style={{ paddingLeft: 8, overflow: "hidden" }}>
                <span style={{ ...mono, color: isHovered ? "#0F172A" : "#94A3B8", display: "block", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                  title={cam.feedPath}>{cam.feedPath}</span>
              </div>
              <div style={{ paddingLeft: 8 }}><span style={mono}>{cam.aspectRatio}</span></div>
              <div style={{ paddingLeft: 8 }}><span style={mono}>{cam.dimensions}</span></div>
              <div style={{ paddingLeft: 8 }}>
                <span style={{ ...mono, color: cam.streamingFps === 0 ? "#CBD5E1" : (isHovered ? "#0F172A" : "#334155") }}>
                  {cam.streamingFps === 0 ? "—" : `${cam.streamingFps} fps`}
                </span>
              </div>
              <div style={{ paddingLeft: 8 }}>
                <span style={{ ...mono, color: cam.memoryUsageMb === 0 ? "#CBD5E1" : (isHovered ? "#0F172A" : "#334155") }}>
                  {cam.memoryUsageMb === 0 ? "—" : `${cam.memoryUsageMb} MB`}
                </span>
              </div>
            </div>
            {isExpanded && <HeartbeatPanel camera={cam} />}
          </div>
        );
      })}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  Configure Camera Grid
// ══════════════════════════════════════════════════════════════════════════════
function parseIpPort(feedPath: string): { ip: string; port: string } {
  try {
    const normalized = feedPath
      .replace(/^onvif:\/\//, "http://")
      .replace(/^webrtc:\/\//, "http://")
      .replace(/^rtsp:\/\//, "http://");
    const u = new URL(normalized);
    const defaultPort = feedPath.startsWith("http://") ? "80"
      : feedPath.startsWith("https://") ? "443"
      : feedPath.startsWith("rtsp://") ? "554"
      : "—";
    return { ip: u.hostname, port: u.port || defaultPort };
  } catch {
    return { ip: "—", port: "—" };
  }
}

const CFG_COLS    = "minmax(160px, 1fr) 120px 50px 72px 90px 100px 100px 64px";
const CFG_HEADERS = ["Camera Name", "IP Address", "Port", "Protocol", "Zone", "Application", "Status", ""];

const ConfigureGrid = ({ cameras }: { cameras: Camera[] }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  return (
    <div style={{ fontFamily: "inherit", width: "100%" }}>
      <div style={{
        display: "grid", gridTemplateColumns: CFG_COLS,
        alignItems: "center", height: 40,
        backgroundColor: "transparent", borderBottom: "2px solid #00775B",
        paddingLeft: 16, paddingRight: 16,
      }}>
        {CFG_HEADERS.map((h, i) => (
          <div key={i} style={{
            fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif",
            color: "#1E293B", textTransform: "uppercase", letterSpacing: "0.05em",
            paddingRight: 8,
          }}>{h}</div>
        ))}
      </div>

      {cameras.map((cam, idx) => {
        const isHovered = hoveredId === cam.id;
        const isEven    = idx % 2 === 1;
        const rowBg     = isHovered ? "rgba(0,119,91,0.08)" : isEven ? "rgba(0,119,91,0.018)" : "#ffffff";
        const { ip, port } = parseIpPort(cam.feedPath);

        const mono: React.CSSProperties = {
          fontFamily: "'JetBrains Mono','Fira Code',monospace", fontSize: 11, fontWeight: 500,
          color: isHovered ? "#0F172A" : "#64748B", transition: "color 120ms ease",
        };
        const inter: React.CSSProperties = {
          fontFamily: "Inter, sans-serif", fontSize: 12, fontWeight: isHovered ? 500 : 400,
          color: isHovered ? "#0F172A" : "#334155", transition: "color 120ms ease",
        };

        return (
          <div key={cam.id}
            onMouseEnter={() => setHoveredId(cam.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "grid", gridTemplateColumns: CFG_COLS,
              alignItems: "center", height: 44,
              backgroundColor: rowBg, transition: "background-color 120ms ease",
              paddingLeft: 16, paddingRight: 16,
            }}
          >
            <div style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              <span style={{ ...inter, fontWeight: isHovered ? 600 : 500 }}>{cam.name}</span>
            </div>
            <div><span style={mono}>{ip}</span></div>
            <div><span style={mono}>{port}</span></div>
            <div><span style={mono}>{cam.protocol}</span></div>
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 4,
                fontSize: 10, fontWeight: 600, color: "#475569",
                backgroundColor: "#F1F5F9", border: "1px solid #E2E8F0",
                fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
              }}>{cam.zone}</span>
            </div>
            <div>
              <span style={{
                display: "inline-flex", alignItems: "center", padding: "2px 7px", borderRadius: 4,
                fontSize: 10, fontWeight: 600, color: "#00775B",
                backgroundColor: "#E5FFF9", border: "1px solid #00775B30",
                fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
              }}>{cam.application}</span>
            </div>
            <div><StatusPill status={cam.status} /></div>
            <div style={{ display: "flex", alignItems: "center", gap: 4, opacity: isHovered ? 1 : 0, transition: "opacity 150ms ease" }}>
              <button
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 4, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", color: "#64748B" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#00775B"; e.currentTarget.style.borderColor = "#00775B"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                title="Edit"
              ><Edit2 style={{ width: 11, height: 11 }} /></button>
              <button
                style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 26, height: 26, borderRadius: 4, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", color: "#64748B" }}
                onMouseEnter={e => { e.currentTarget.style.color = "#E7000B"; e.currentTarget.style.borderColor = "#E7000B"; }}
                onMouseLeave={e => { e.currentTarget.style.color = "#64748B"; e.currentTarget.style.borderColor = "#E2E8F0"; }}
                title="Remove"
              ><Trash2 style={{ width: 11, height: 11 }} /></button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

// ──────────────────────────────────────────────────────────────────────────────
//  Camera Square Grid (visual view)
// ──────────────────────────────────────────────────────────────────────────────
const CAM_STATUS_STYLE: Record<string, { bg: string; border: string; dot: string; label: string }> = {
  online:         { bg: "#E5FFEF", border: "#00A63E", dot: "#00A63E", label: "Online"       },
  offline:        { bg: "#FFE5E7", border: "#E7000B", dot: "#E7000B", label: "Offline"      },
  "no-heartbeat": { bg: "#FEEFE7", border: "#EA580C", dot: "#EA580C", label: "No Heartbeat" },
};

function computeUptime24h(cam: Camera): { pct: number; offlineDuration: number } {
  const total = 1440;
  const onlineMin = cam.heartbeat24h
    .filter(s => s.status === "online")
    .reduce((a, s) => a + (s.end - s.start), 0);
  const offlineMin = cam.heartbeat24h
    .filter(s => s.status === "offline")
    .reduce((a, s) => a + (s.end - s.start), 0);
  return { pct: Math.round((onlineMin / total) * 100), offlineDuration: offlineMin };
}

function fmtDuration(minutes: number): string {
  if (minutes === 0) return "0m";
  const h = Math.floor(minutes / 60), m = minutes % 60;
  return h > 0 ? (m > 0 ? `${h}h ${m}m` : `${h}h`) : `${m}m`;
}

const CameraDetailModal = ({ camera, onClose }: { camera: Camera; onClose: () => void }) => (
  <div style={{ position: "fixed", inset: 0, zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
    <div style={{ position: "fixed", inset: 0, backgroundColor: "rgba(0,0,0,0.45)", backdropFilter: "blur(2px)" }} onClick={onClose} />
    <div style={{
      position: "relative", zIndex: 201, width: "100%", maxWidth: 720,
      backgroundColor: "#ffffff", borderRadius: 8,
      border: "1px solid #E2E8F0", boxShadow: "0 24px 48px rgba(0,0,0,0.18)",
      overflow: "hidden",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "14px 20px", borderBottom: "1px solid #F1F5F9" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 4, backgroundColor: "#00775B", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Video style={{ width: 14, height: 14, color: "#fff" }} />
          </div>
          <div>
            <p style={{ fontSize: 13, fontWeight: 700, color: "#0F172A", fontFamily: "Inter, sans-serif", margin: 0 }}>{camera.name}</p>
            <p style={{ fontSize: 10, color: "#94A3B8", fontFamily: "Inter, sans-serif", margin: 0, marginTop: 1 }}>{camera.feedPath}</p>
          </div>
        </div>
        <button onClick={onClose} style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 28, height: 28, borderRadius: 4, border: "1px solid #E2E8F0", background: "#fff", cursor: "pointer", color: "#64748B" }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = "#94A3B8"; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = "#E2E8F0"; }}>
          <X style={{ width: 13, height: 13 }} />
        </button>
      </div>
      <HeartbeatPanel camera={camera} />
    </div>
  </div>
);

const CameraSquareGrid = ({ cameras }: { cameras: Camera[] }) => {
  const [selectedCam, setSelectedCam] = useState<Camera | null>(null);

  return (
    <>
      <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: 12 }}>
        {cameras.length === 0 && (
          <div style={{ gridColumn: "1/-1", padding: "32px 0", textAlign: "center", color: "#94A3B8", fontSize: 12, fontFamily: "Inter, sans-serif" }}>
            No cameras match the current filters.
          </div>
        )}
        {cameras.map(cam => {
          const s = CAM_STATUS_STYLE[cam.status] ?? CAM_STATUS_STYLE["online"];
          const { pct, offlineDuration } = computeUptime24h(cam);
          const uptimeColor = pct >= 90 ? "#00A63E" : pct >= 70 ? "#E19A04" : "#E7000B";
          const isProblem = cam.status === "offline" || cam.status === "no-heartbeat";

          return (
            <button
              key={cam.id}
              onClick={() => setSelectedCam(cam)}
              style={{
                display: "flex", flexDirection: "column", alignItems: "flex-start",
                padding: "12px 14px", borderRadius: 6,
                border: `1px solid ${s.border}`, backgroundColor: s.bg,
                cursor: "pointer", textAlign: "left",
                boxShadow: `0 0 6px 1px ${hex2rgba(s.border, 0.10)}`,
                transition: "box-shadow 150ms ease, transform 150ms ease",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 16px 3px ${hex2rgba(s.border, 0.22)}, 0 4px 12px rgba(0,0,0,0.06)`; (e.currentTarget as HTMLElement).style.transform = "translateY(-1px)"; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = `0 0 6px 1px ${hex2rgba(s.border, 0.10)}`; (e.currentTarget as HTMLElement).style.transform = "none"; }}
            >
              {/* Status dot + label */}
              <div style={{ display: "flex", alignItems: "center", gap: 5, marginBottom: 8 }}>
                <span style={{ width: 7, height: 7, borderRadius: "50%", backgroundColor: s.dot, flexShrink: 0, boxShadow: `0 0 5px ${s.dot}` }} />
                <span style={{ fontSize: 9, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: s.dot, fontFamily: "Inter, sans-serif" }}>{s.label}</span>
              </div>
              {/* Camera name */}
              <p style={{ fontSize: 12, fontWeight: 700, color: "#0F172A", fontFamily: "Inter, sans-serif", margin: 0, lineHeight: 1.3, wordBreak: "break-word" }}>{cam.name}</p>
              {/* Zone + Application badges */}
              <div style={{ marginTop: 7, display: "flex", flexWrap: "wrap", gap: 4 }}>
                <span style={{
                  fontSize: 9, fontWeight: 600, fontFamily: "Inter, sans-serif",
                  padding: "2px 6px", borderRadius: 3,
                  backgroundColor: "rgba(255,255,255,0.7)", border: "1px solid rgba(0,0,0,0.08)",
                  color: "#475569",
                }}>{cam.zone}</span>
                <span style={{
                  fontSize: 9, fontWeight: 600, fontFamily: "Inter, sans-serif",
                  padding: "2px 6px", borderRadius: 3,
                  backgroundColor: hex2rgba(s.border, 0.12), border: `1px solid ${hex2rgba(s.border, 0.25)}`,
                  color: s.dot,
                }}>{cam.application}</span>
              </div>
              {/* Divider */}
              <div style={{ width: "100%", height: 1, backgroundColor: hex2rgba(s.border, 0.18), margin: "9px 0" }} />
              {/* Bottom row */}
              <div style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ display: "flex", flex: 1, flexDirection: "column", gap: 2 }}>
                  <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Uptime 24h</span>
                  <span style={{ fontSize: 14, fontWeight: 800, fontFamily: "'JetBrains Mono', monospace", color: uptimeColor, lineHeight: 1 }}>{pct}%</span>
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2 }}>
                  {isProblem && offlineDuration > 0 ? (
                    <>
                      <span style={{ fontSize: 8, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>Offline for</span>
                      <span style={{ fontSize: 11, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color: s.dot }}>{fmtDuration(offlineDuration)}</span>
                    </>
                  ) : (
                    <>
                      <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#64748B" }}>{cam.protocol} · {cam.aspectRatio}</span>
                      {cam.streamingFps > 0 && (
                        <span style={{ fontSize: 9, fontFamily: "'JetBrains Mono',monospace", color: "#94A3B8" }}>{cam.dimensions} · {cam.streamingFps}fps</span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      {selectedCam && <CameraDetailModal camera={selectedCam} onClose={() => setSelectedCam(null)} />}
    </>
  );
};

// ─── Tab Bar ─────────────────────────────────────────────────────────────────
type CameraTab = "overview" | "configure";

const TabBar = ({ active, onChange }: { active: CameraTab; onChange: (t: CameraTab) => void }) => (
  <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #E2E8F0" }}>
    {([
      { id: "overview",  label: "Overview" },
      { id: "configure", label: "Configure Camera" },
    ] as { id: CameraTab; label: string }[]).map(tab => (
      <button
        key={tab.id}
        onClick={() => onChange(tab.id)}
        style={{
          padding: "10px 16px",
          fontSize: 12, fontWeight: active === tab.id ? 700 : 500,
          fontFamily: "Inter, sans-serif",
          color: active === tab.id ? "#00775B" : "#64748B",
          background: "transparent", border: "none", cursor: "pointer",
          borderBottom: active === tab.id ? "2px solid #00775B" : "2px solid transparent",
          marginBottom: -1,
          transition: "color 120ms, border-color 120ms",
          whiteSpace: "nowrap",
        }}
        onMouseEnter={e => { if (active !== tab.id) e.currentTarget.style.color = "#334155"; }}
        onMouseLeave={e => { if (active !== tab.id) e.currentTarget.style.color = "#64748B"; }}
      >
        {tab.label}
      </button>
    ))}
  </div>
);

// ─── Cameras Page ─────────────────────────────────────────────────────────────
const ROWS_PER_PAGE = 10;

export const Cameras = () => {
  const [activeTab, setActiveTab] = useState<CameraTab>("overview");
  const [searchQ,       setSearchQ]       = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [appFilters,    setAppFilters]    = useState<Set<string>>(new Set());
  const [zoneFilters,   setZoneFilters]   = useState<Set<string>>(new Set());
  const [sortKey,       setSortKey]       = useState("status-priority");
  const [viewMode,      setViewMode]      = useState<"table" | "grid">("table");
  const [sortOpen,      setSortOpen]      = useState(false);
  const [statusOpen,    setStatusOpen]    = useState(false);
  const [appOpen,       setAppOpen]       = useState(false);
  const [zoneOpen,      setZoneOpen]      = useState(false);
  const [page,          setPage]          = useState(1);

  const allApplications = useMemo(() => [...new Set(CAMERAS.map(c => c.application))].sort(), []);
  const allZones        = useMemo(() => [...new Set(CAMERAS.map(c => c.zone))].sort(), []);
  const allStatuses     = ["online", "offline", "no-heartbeat"];

  const hasActiveFilters = searchQ !== "" || statusFilters.size > 0 || appFilters.size > 0 || zoneFilters.size > 0;
  const clearFilters = () => { setSearchQ(""); setStatusFilters(new Set()); setAppFilters(new Set()); setZoneFilters(new Set()); setPage(1); };

  const toggleStatus = (s: string) => { setStatusFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; }); setPage(1); };
  const toggleApp    = (a: string) => { setAppFilters(prev    => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; }); setPage(1); };
  const toggleZone   = (z: string) => { setZoneFilters(prev   => { const n = new Set(prev); n.has(z) ? n.delete(z) : n.add(z); return n; }); setPage(1); };

  const statusLabel = statusFilters.size === 0 ? "Status"
    : statusFilters.size === 1 ? (CAM_STATUS_LABELS[[...statusFilters][0]] ?? [...statusFilters][0])
    : `${statusFilters.size} Statuses`;
  const appLabel  = appFilters.size  === 0 ? "Applications" : appFilters.size  === 1 ? [...appFilters][0]  : `${appFilters.size} Apps`;
  const zoneLabel = zoneFilters.size === 0 ? "Zones"        : zoneFilters.size === 1 ? [...zoneFilters][0] : `${zoneFilters.size} Zones`;

  const currentSortOpt = CAM_SORT_OPTIONS.find(o => o.key === sortKey) ?? CAM_SORT_OPTIONS[0];
  const sortIsDefault  = sortKey === "status-priority";

  const filteredCameras = useMemo(() => {
    return CAMERAS
      .filter(cam => {
        if (searchQ) {
          const q = searchQ.toLowerCase();
          if (!cam.name.toLowerCase().includes(q) && !cam.feedPath.toLowerCase().includes(q)) return false;
        }
        if (statusFilters.size > 0 && !statusFilters.has(cam.status)) return false;
        if (appFilters.size    > 0 && !appFilters.has(cam.application)) return false;
        if (zoneFilters.size   > 0 && !zoneFilters.has(cam.zone))       return false;
        return true;
      })
      .sort((a, b) => {
        if (sortKey === "status-priority") return (STATUS_PRIORITY[a.status] ?? 3) - (STATUS_PRIORITY[b.status] ?? 3);
        if (sortKey === "name-desc")  return b.name.localeCompare(a.name);
        if (sortKey === "fps-desc")   return b.streamingFps - a.streamingFps;
        if (sortKey === "fps-asc")    return a.streamingFps - b.streamingFps;
        if (sortKey === "mem-desc")   return b.memoryUsageMb - a.memoryUsageMb;
        if (sortKey === "mem-asc")    return a.memoryUsageMb - b.memoryUsageMb;
        return a.name.localeCompare(b.name);
      });
  }, [searchQ, statusFilters, appFilters, zoneFilters, sortKey]);

  const totalPages    = Math.ceil(filteredCameras.length / ROWS_PER_PAGE);
  const paginatedCams = filteredCameras.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const integratedBtnBase: React.CSSProperties = {
    background: "transparent", border: "none",
    borderBottom: "2px solid transparent", borderRadius: 0,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    color: "#64748B", padding: "4px 2px",
    transition: "color 150ms ease, border-bottom-color 150ms ease",
    whiteSpace: "nowrap",
  };
  const dropdownPanel: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 8px)", right: 0, zIndex: 50,
    backgroundColor: "#fff", border: "1px solid #E2E8F0",
    borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
  };
  const mkItem = (isActive: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
    backgroundColor: isActive ? "rgba(0,119,91,0.05)" : "transparent",
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    color: isActive ? "#00775B" : "#334155", transition: "background-color 100ms ease",
  });
  const mkCheckItem = (isActive: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
    backgroundColor: isActive ? "rgba(0,119,91,0.05)" : "transparent",
    fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif",
    color: isActive ? "#00775B" : "#334155", transition: "background-color 100ms ease",
  });
  const hoverIn  = (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => { if (!isActive) e.currentTarget.style.backgroundColor = "#F8FAFC"; };
  const hoverOut = (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => { e.currentTarget.style.backgroundColor = isActive ? "rgba(0,119,91,0.05)" : "transparent"; };

  const cards: StatData[] = [
    { label: "Cameras Online",      value: String(CAMERA_SUMMARY.online),      sublabel: "Active live streams",      num: "+1", ref_: "vs Yesterday", dir: "up",      chip: "LIVE",      color: "#00A63E", bgColor: "#E5FFEF", definition: "" },
    { label: "Cameras Offline",     value: String(CAMERA_SUMMARY.offline),     sublabel: "No active stream",         num: "-1", ref_: "vs Yesterday", dir: "down",    chip: "ALERT",     color: "#E7000B", bgColor: "#FFE5E7", definition: "" },
    { label: "No Recent Heartbeat", value: String(CAMERA_SUMMARY.noHeartbeat), sublabel: "Missed last health check", num: "0",  ref_: "No Change",    dir: "neutral", chip: "CHECK",     color: "#EA580C", bgColor: "#FEEFE7", definition: "" },
    { label: "Avg Stream FPS",      value: String(CAMERA_SUMMARY.avgFps),      sublabel: "Online cameras only",      num: "+2", ref_: "vs Yesterday", dir: "up",      chip: "STREAMING", color: "#2B7FFF", bgColor: "#E5F0FF", definition: "" },
  ];

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <TabBar active={activeTab} onChange={setActiveTab} />

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((c) => <V12StatCard key={c.label} d={c} />)}
          </div>

          <h2 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
            All Cameras
            <span className="ml-2 font-mono font-normal text-neutral-400">
              {filteredCameras.length !== CAMERAS.length ? `${filteredCameras.length} / ${CAMERAS.length}` : CAMERAS.length}
            </span>
          </h2>

          <div style={{ borderRadius: 8, border: "1px solid #E2E8F0", backgroundColor: "#ffffff", position: "relative" }}>
            {/* Toolbar */}
            <div style={{ display: "flex", alignItems: "flex-end", flexWrap: "wrap", gap: "8px 16px", padding: "10px 16px 10px" }}>
              {/* Search */}
              <div style={{ position: "relative", flex: "0 1 200px" }}>
                <Search style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: "#94A3B8", pointerEvents: "none" }} />
                <input
                  type="text" placeholder="Search cameras, feed paths…"
                  value={searchQ} onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                  style={{
                    width: "100%", height: 32, paddingLeft: 22, paddingRight: searchQ ? 24 : 4,
                    fontSize: 12, fontFamily: "Inter, sans-serif", color: "#1E293B",
                    backgroundColor: "transparent", border: "none",
                    borderBottom: "2px solid #E2E8F0", borderRadius: 0, outline: "none",
                    transition: "border-bottom-color 200ms ease",
                  }}
                  onFocus={e => { e.target.style.borderBottomColor = "#00775B"; }}
                  onBlur={e  => { e.target.style.borderBottomColor = "#E2E8F0"; }}
                />
                {searchQ && (
                  <button onClick={() => { setSearchQ(""); setPage(1); }} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
                    <X style={{ width: 12, height: 12 }} />
                  </button>
                )}
              </div>

              {/* Sort */}
              <div style={{ position: "relative" }}>
                <button
                  onClick={() => { setSortOpen(o => !o); setStatusOpen(false); setAppOpen(false); setZoneOpen(false); }}
                  style={{ ...integratedBtnBase, color: !sortIsDefault ? "#00775B" : "#64748B", borderBottomColor: !sortIsDefault ? "#00775B" : "transparent" }}
                >
                  <SlidersHorizontal style={{ width: 12, height: 12 }} />
                  {sortIsDefault ? "Sort" : currentSortOpt.shortLabel}
                </button>
                {sortOpen && (
                  <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} />
                    <div style={{ ...dropdownPanel, left: 0, right: "auto", minWidth: 220 }}>
                      {CAM_SORT_OPTIONS.map(opt => (
                        <div key={opt.key} onClick={() => { setSortKey(opt.key); setSortOpen(false); }} style={mkItem(sortKey === opt.key)}
                          onMouseEnter={e => hoverIn(e, sortKey === opt.key)} onMouseLeave={e => hoverOut(e, sortKey === opt.key)}>
                          {opt.label}
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Right cluster */}
              <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 12, flexWrap: "nowrap" }}>
                {/* Clear */}
                <button onClick={clearFilters} style={{ ...integratedBtnBase, visibility: hasActiveFilters ? "visible" : "hidden", color: "#E7000B", borderBottomColor: "#E7000B", gap: 4 }}>
                  <X style={{ width: 12, height: 12 }} /> Clear
                </button>

                {/* Status */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setStatusOpen(o => !o); setSortOpen(false); setAppOpen(false); setZoneOpen(false); }}
                    style={{ ...integratedBtnBase, color: statusFilters.size > 0 ? "#00775B" : "#64748B", borderBottomColor: statusFilters.size > 0 ? "#00775B" : "transparent" }}>
                    <Filter style={{ width: 12, height: 12 }} />{statusLabel}
                  </button>
                  {statusOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setStatusOpen(false)} />
                      <div style={{ ...dropdownPanel, minWidth: 200 }}>
                        {allStatuses.map(s => (
                          <div key={s} onClick={() => toggleStatus(s)} style={mkCheckItem(statusFilters.has(s))}
                            onMouseEnter={e => hoverIn(e, statusFilters.has(s))} onMouseLeave={e => hoverOut(e, statusFilters.has(s))}>
                            <InlineCheckbox checked={statusFilters.has(s)} />
                            <span style={{ flex: 1 }}>{CAM_STATUS_LABELS[s]}</span>
                            <StatusPill status={s} />
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Applications */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setAppOpen(o => !o); setSortOpen(false); setStatusOpen(false); setZoneOpen(false); }}
                    style={{ ...integratedBtnBase, color: appFilters.size > 0 ? "#00775B" : "#64748B", borderBottomColor: appFilters.size > 0 ? "#00775B" : "transparent" }}>
                    <Filter style={{ width: 12, height: 12 }} />{appLabel}
                  </button>
                  {appOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAppOpen(false)} />
                      <div style={{ ...dropdownPanel, minWidth: 200, maxHeight: 280, overflowY: "auto" }}>
                        {allApplications.map(a => (
                          <div key={a} onClick={() => toggleApp(a)} style={mkCheckItem(appFilters.has(a))}
                            onMouseEnter={e => hoverIn(e, appFilters.has(a))} onMouseLeave={e => hoverOut(e, appFilters.has(a))}>
                            <InlineCheckbox checked={appFilters.has(a)} />
                            <span style={{ flex: 1 }}>{a}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Zones */}
                <div style={{ position: "relative" }}>
                  <button onClick={() => { setZoneOpen(o => !o); setSortOpen(false); setStatusOpen(false); setAppOpen(false); }}
                    style={{ ...integratedBtnBase, color: zoneFilters.size > 0 ? "#00775B" : "#64748B", borderBottomColor: zoneFilters.size > 0 ? "#00775B" : "transparent" }}>
                    <Filter style={{ width: 12, height: 12 }} />{zoneLabel}
                  </button>
                  {zoneOpen && (
                    <>
                      <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setZoneOpen(false)} />
                      <div style={{ ...dropdownPanel, minWidth: 200, maxHeight: 280, overflowY: "auto" }}>
                        {allZones.map(z => (
                          <div key={z} onClick={() => toggleZone(z)} style={mkCheckItem(zoneFilters.has(z))}
                            onMouseEnter={e => hoverIn(e, zoneFilters.has(z))} onMouseLeave={e => hoverOut(e, zoneFilters.has(z))}>
                            <InlineCheckbox checked={zoneFilters.has(z)} />
                            <span style={{ flex: 1 }}>{z}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* View toggle */}
                <div style={{ display: "flex", alignItems: "center", marginLeft: 4, border: "1px solid #E2E8F0", borderRadius: 4, overflow: "hidden" }}>
                  {([
                    { mode: "table" as const, Icon: List,       title: "Table view" },
                    { mode: "grid"  as const, Icon: LayoutGrid, title: "Grid view"  },
                  ]).map(({ mode, Icon, title }) => (
                    <button key={mode} title={title} onClick={() => setViewMode(mode)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "center",
                        width: 28, height: 28, border: "none", cursor: "pointer",
                        backgroundColor: viewMode === mode ? "#00775B" : "#ffffff",
                        color: viewMode === mode ? "#ffffff" : "#94A3B8",
                        transition: "background-color 120ms ease, color 120ms ease",
                      }}
                      onMouseEnter={e => { if (viewMode !== mode) e.currentTarget.style.backgroundColor = "#F8FAFC"; }}
                      onMouseLeave={e => { if (viewMode !== mode) e.currentTarget.style.backgroundColor = "#ffffff"; }}
                    >
                      <Icon style={{ width: 13, height: 13 }} />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div style={{ height: 1, backgroundColor: "#E2E8F0" }} />

            <div style={{ overflow: viewMode === "table" ? "hidden" : "visible" }}>
              {viewMode === "grid" ? (
                <CameraSquareGrid cameras={filteredCameras} />
              ) : paginatedCams.length === 0 ? (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 100, fontSize: 12, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
                  No cameras match the current filters.{" "}
                  {hasActiveFilters && (
                    <button onClick={clearFilters} style={{ marginLeft: 8, color: "#00775B", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>Clear filters</button>
                  )}
                </div>
              ) : (
                <CamerasGrid cameras={paginatedCams} />
              )}

              {viewMode === "table" && totalPages > 1 && (
                <div style={{ padding: "10px 16px", borderTop: "1px solid #F1F5F9", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    style={{ display: "flex", alignItems: "center", gap: 4, height: 28, minWidth: 72, padding: "0 10px", borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", backgroundColor: page === 1 ? "#E2E8F0" : "#00775B", color: page === 1 ? "#94A3B8" : "#ffffff" }}>
                    <ChevronLeft style={{ width: 13, height: 13 }} /> PREV
                  </button>
                  <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                      <button key={p} onClick={() => setPage(p)}
                        style={{ width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", backgroundColor: page === p ? "#00775B" : "#F1F5F9", color: page === p ? "#ffffff" : "#475569" }}>
                        {p}
                      </button>
                    ))}
                  </div>
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    style={{ display: "flex", alignItems: "center", gap: 4, height: 28, minWidth: 72, padding: "0 10px", borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", backgroundColor: page === totalPages ? "#E2E8F0" : "#00775B", color: page === totalPages ? "#94A3B8" : "#ffffff" }}>
                    NEXT <ChevronRight style={{ width: 13, height: 13 }} />
                  </button>
                  <div style={{ position: "absolute", right: 16, fontSize: 12, color: "#64748B", fontFamily: "Inter, sans-serif" }}>
                    Showing <span style={{ fontWeight: 600, color: "#334155" }}>{(page - 1) * ROWS_PER_PAGE + 1}–{Math.min(page * ROWS_PER_PAGE, filteredCameras.length)}</span> of <span style={{ fontWeight: 600, color: "#334155" }}>{filteredCameras.length}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Configure Camera Tab ── */}
      {activeTab === "configure" && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                Camera Configuration
                <span className="ml-2 font-mono font-normal text-neutral-400">{CAMERAS.length}</span>
              </h2>
              <p className="text-[10px] text-neutral-400 mt-0.5">Manage connection details and assignments for each camera.</p>
            </div>
            <button
              style={{ display: "flex", alignItems: "center", gap: 6, height: 34, padding: "0 14px", backgroundColor: "#00775B", color: "#ffffff", border: "none", borderRadius: 4, cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "Inter, sans-serif", boxShadow: "0 1px 3px rgba(0,119,91,0.3)", transition: "background-color 150ms ease" }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = "#005f47"; }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = "#00775B"; }}
            >
              <Plus style={{ width: 13, height: 13 }} />
              Add Camera
            </button>
          </div>
          <div style={{ borderRadius: 8, border: "1px solid #E2E8F0", overflow: "hidden", backgroundColor: "#ffffff" }}>
            <ConfigureGrid cameras={CAMERAS} />
          </div>
        </div>
      )}
    </div>
  );
};
