import { SlidePanel } from "./SlidePanel";
import { cn } from "@/app/lib/utils";
import {
  Camera, Wifi, AlertTriangle, CheckCircle2, User, ShieldAlert,
  Star, Settings, Download, ChevronRight, Activity
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

// ─── Mock camera data ─────────────────────────────────────────────────────────
const MOCK_CAMERA = {
  camera_id: "cam_main_lobby",
  camera_label: "Main Lobby",
  location: "HQ Building A · Ground Floor",
  status: { online: true, model_active: true, last_detection_sec_ago: 23, resolution: "1920×1080", processing_fps: 15, avg_detection_confidence: 0.94, low_confidence_detections_last_1hr: 2, last_calibration: "2026-03-15", zone_label: "Main Lobby Entry Zone" },
  current_window: { total_identifications: 12, matched: 9, unknown: 2, blacklist_hits: 1, authorization_rate_pct: 83.3, active_alerts: 2 },
  recent_detections: [
    { timestamp: "09:13:22", display_name: "BL-003", list_status: "BLACKLIST" as const, match_confidence: 94.7, dwell_sec: 8.3, alert_active: true },
    { timestamp: "09:12:45", display_name: "John Smith", list_status: "WHITELIST" as const, match_confidence: 96.2, dwell_sec: 3.1, alert_active: false },
    { timestamp: "09:12:31", display_name: "Unknown #88", list_status: "UNKNOWN" as const, match_confidence: 63.1, dwell_sec: 5.8, alert_active: true },
    { timestamp: "09:12:18", display_name: "Sarah Johnson", list_status: "WHITELIST" as const, match_confidence: 98.1, dwell_sec: 2.4, alert_active: false },
    { timestamp: "09:12:04", display_name: "Raj Patel", list_status: "WHITELIST" as const, match_confidence: 95.6, dwell_sec: 4.2, alert_active: false },
    { timestamp: "09:11:52", display_name: "Unknown #104", list_status: "UNKNOWN" as const, match_confidence: 58.4, dwell_sec: 3.1, alert_active: false },
    { timestamp: "09:11:40", display_name: "Emily Chen", list_status: "VIP" as const, match_confidence: 97.3, dwell_sec: 2.0, alert_active: false },
  ],
  hourly_chart: [
    { hour: "06", matched: 8, unknown: 1, blacklist: 0 },
    { hour: "07", matched: 41, unknown: 5, blacklist: 0 },
    { hour: "08", matched: 148, unknown: 12, blacklist: 0 },
    { hour: "09", matched: 62, unknown: 6, blacklist: 1 },
  ],
  active_alerts: [
    { alert_id: "evt_001", name: "BLACKLIST MATCH", severity: "CRITICAL" as const, timestamp: "09:13:22", entity: "BL-003", status: "ACTIVE" as const },
    { alert_id: "evt_002", name: "UNKNOWN AT ENTRY", severity: "MEDIUM" as const, timestamp: "09:12:31", entity: "Unknown #88", status: "ACTIVE" as const },
  ],
};

const LIST_STYLES: Record<string, { bg: string; text: string; badge: string }> = {
  BLACKLIST: { bg: "bg-[#FFE5E7]", text: "text-[#E7000B]", badge: "bg-[#E7000B] text-white" },
  WHITELIST: { bg: "bg-[#E5FFEF]", text: "text-[#00A63E]", badge: "bg-[#00A63E] text-white" },
  UNKNOWN:   { bg: "bg-neutral-50",  text: "text-neutral-600", badge: "bg-neutral-400 text-white" },
  VIP:       { bg: "bg-purple-50",   text: "text-purple-700",  badge: "bg-purple-600 text-white" },
};

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-2 bg-neutral-50 border-b border-neutral-100">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">{children}</p>
  </div>
);

interface Props {
  isOpen: boolean;
  onClose: () => void;
  cameraId?: string;
  onDetectionClick?: () => void;
}

export const CameraFeedPanel = ({ isOpen, onClose, cameraId: _cameraId, onDetectionClick }: Props) => {
  const cam = MOCK_CAMERA;

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={cam.camera_label}
      subtitle={cam.location}
    >
      {/* ── Live status strip ─────────────────────────────────────────────── */}
      <div className="px-6 py-4 border-b border-neutral-100">
        {/* Feed placeholder */}
        <div className="w-full aspect-video bg-neutral-900 rounded-lg flex items-center justify-center mb-4 relative overflow-hidden border border-neutral-800">
          <Camera className="w-12 h-12 text-neutral-600" />
          <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 rounded px-2 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] font-bold text-white font-data">LIVE</span>
          </div>
          <div className="absolute bottom-2 left-2 text-[10px] text-neutral-400 font-data tabular-nums">
            {cam.camera_id} · Updated {cam.status.last_detection_sec_ago}s ago
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-neutral-600 font-semibold">Online</span>
          </div>
          <span className="text-neutral-300">·</span>
          <div className="flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-xs text-neutral-600">
              Model active · <span className="font-data tabular-nums font-semibold">{cam.status.processing_fps} fps</span>
            </span>
          </div>
          <span className="text-neutral-300">·</span>
          <span className="text-xs text-neutral-500">{cam.status.resolution}</span>
        </div>
      </div>

      {/* ── Current window stats ────────────────────────────────────────── */}
      <SectionLabel>Right Now — Last 5 Minutes</SectionLabel>
      <div className="px-6 py-4 grid grid-cols-3 gap-3 border-b border-neutral-50">
        {[
          { label: "Identifications", value: String(cam.current_window.total_identifications), color: "text-neutral-900" },
          { label: "Matched", value: String(cam.current_window.matched), color: "text-[#00A63E]" },
          { label: "Unknown", value: String(cam.current_window.unknown), color: "text-neutral-600" },
          { label: "Blacklist Hits", value: String(cam.current_window.blacklist_hits), color: cam.current_window.blacklist_hits > 0 ? "text-[#E7000B]" : "text-neutral-400" },
          { label: "Auth Rate", value: `${cam.current_window.authorization_rate_pct}%`, color: cam.current_window.authorization_rate_pct < 90 ? "text-[#E19A04]" : "text-[#00A63E]" },
          { label: "Active Alerts", value: String(cam.current_window.active_alerts), color: cam.current_window.active_alerts > 0 ? "text-[#E7000B]" : "text-neutral-400" },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-2.5 rounded-lg bg-neutral-50 border border-neutral-100">
            <p className={cn("font-data tabular-nums text-2xl font-black", stat.color)}>{stat.value}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5 leading-tight">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* ── Recent detections ───────────────────────────────────────────── */}
      <SectionLabel>Recent Detections</SectionLabel>
      <div className="px-6 py-3 border-b border-neutral-50">
        <div className="space-y-1.5">
          {cam.recent_detections.map((det, i) => {
            const styles = LIST_STYLES[det.list_status] ?? LIST_STYLES.UNKNOWN;
            return (
              <button
                key={i}
                onClick={onDetectionClick}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border cursor-pointer transition-all hover:shadow-sm text-left",
                  det.alert_active ? "border-l-2 border-l-[#E7000B]" : "",
                  styles.bg, "border-neutral-100"
                )}
              >
                <div className="w-7 h-7 rounded bg-neutral-200 flex items-center justify-center shrink-0">
                  {det.list_status === "VIP" ? <Star className="w-3.5 h-3.5 text-purple-500" /> :
                   det.list_status === "BLACKLIST" ? <ShieldAlert className="w-3.5 h-3.5 text-[#E7000B]" /> :
                   <User className="w-3.5 h-3.5 text-neutral-400" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", styles.badge)}>
                      {det.list_status}
                    </span>
                    <span className="text-xs font-semibold text-neutral-800 truncate">{det.display_name}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-data tabular-nums text-[10px] font-semibold text-neutral-500">{det.match_confidence}%</span>
                  <span className="font-data tabular-nums text-[10px] text-neutral-400">{det.dwell_sec}s</span>
                  <span className="font-data tabular-nums text-[10px] text-neutral-400">{det.timestamp}</span>
                  <ChevronRight className="w-3 h-3 text-neutral-300" />
                </div>
              </button>
            );
          })}
        </div>
        <button className="mt-2 text-xs text-[#00775B] font-semibold hover:underline flex items-center gap-1">
          View all detections <ChevronRight className="w-3 h-3" />
        </button>
      </div>

      {/* ── Hourly chart ─────────────────────────────────────────────────── */}
      <SectionLabel>Hourly Performance — Today</SectionLabel>
      <div className="px-6 py-4 border-b border-neutral-50">
        <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
          <BarChart data={cam.hourly_chart} margin={{ top: 4, right: 4, bottom: 0, left: -20 }} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="hour" tick={{ fontSize: 9, fontFamily: "'JetBrains Mono'" }} tickFormatter={(v) => `${v}:00`} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="matched" stackId="a" fill="#00775B" radius={[0,0,0,0]} isAnimationActive={false} name="Matched" />
            <Bar dataKey="unknown" stackId="a" fill="#94A3B8" isAnimationActive={false} name="Unknown" />
            <Bar dataKey="blacklist" stackId="a" fill="#E7000B" radius={[3,3,0,0]} isAnimationActive={false} name="Blacklist" />
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-neutral-400 mt-1">
          Peak: <span className="font-data tabular-nums font-semibold text-neutral-600">08:00–09:00 · 160 identifications</span>
        </p>
      </div>

      {/* ── Active alerts ─────────────────────────────────────────────────── */}
      <SectionLabel>Active Alerts</SectionLabel>
      <div className="px-6 py-4 space-y-2 border-b border-neutral-50">
        {cam.active_alerts.map((alert) => (
          <div key={alert.alert_id} className={cn(
            "flex items-start justify-between gap-3 p-3 rounded-lg border",
            alert.severity === "CRITICAL" ? "bg-[#FFE5E7] border-[#E7000B]/20" : "bg-[#FFF7E6] border-[#E19A04]/20"
          )}>
            <div className="flex items-start gap-2">
              <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0",
                alert.severity === "CRITICAL" ? "text-[#E7000B]" : "text-[#E19A04]"
              )} />
              <div>
                <p className="text-xs font-bold text-neutral-800">{alert.name.replace(/_/g, " ")}</p>
                <p className="text-[10px] text-neutral-500 mt-0.5">
                  {alert.entity} · <span className="font-data tabular-nums">{alert.timestamp}</span>
                </p>
              </div>
            </div>
            <div className="flex gap-1.5 shrink-0">
              <button className="h-6 px-2 rounded border border-current text-[10px] font-bold text-[#E7000B] hover:bg-[#E7000B]/10 transition-colors">
                Ack
              </button>
              <button onClick={onDetectionClick} className="h-6 px-2 rounded border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                View
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* ── Camera health ─────────────────────────────────────────────────── */}
      <SectionLabel>Camera Health</SectionLabel>
      <div className="px-6 py-4 grid grid-cols-2 gap-3 pb-8">
        {[
          { label: "Resolution", value: cam.status.resolution },
          { label: "Processing FPS", value: String(cam.status.processing_fps), mono: true },
          { label: "Avg Detection Conf", value: `${(cam.status.avg_detection_confidence * 100).toFixed(0)}%`, mono: true },
          { label: "Low-Conf (1hr)", value: String(cam.status.low_confidence_detections_last_1hr), mono: true },
          { label: "Last Calibration", value: cam.status.last_calibration },
          { label: "Zone Config", value: cam.status.zone_label },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
            <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>
              {item.value}
            </p>
          </div>
        ))}
        <div className="col-span-2 flex flex-wrap gap-2 pt-2">
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded border border-neutral-200 text-[11px] text-neutral-600 hover:border-neutral-300 transition-colors">
            <Download className="w-3 h-3" /> Last 5 min clip
          </button>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded border border-neutral-200 text-[11px] text-neutral-600 hover:border-neutral-300 transition-colors">
            <Settings className="w-3 h-3" /> Configure alerts
          </button>
        </div>
      </div>
    </SlidePanel>
  );
};
