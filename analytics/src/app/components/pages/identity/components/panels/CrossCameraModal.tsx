import { useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/app/lib/utils";
import {
  X, AlertTriangle, Car,
  Shield, Download, Share2
} from "lucide-react";

// ─── Mock journey data ────────────────────────────────────────────────────────
const MOCK_JOURNEY = {
  display_name: "John Smith",
  list_membership: "WHITELIST",
  date: "Apr 6, 2026",
  summary: {
    total_cameras: 4,
    total_on_site: 8,
    start_time: "08:52",
    end_time: "09:13",
    total_duration_min: 20.8,
    total_frame_time_sec: 56.6,
    avg_confidence: 94.0,
    alerts_triggered: 2,
    alerts_resolved: 1,
    linked_lpr: 1,
  },
  sightings: [
    {
      sequence: 1,
      camera_id: "cam_parking_garage",
      camera_label: "Parking Garage",
      timestamp: "08:52",
      match_confidence: 91.8,
      duration_sec: 4.2,
      direction: "Entering from street level",
      alerts: [],
      linked_lpr: { plate: "KA05MJ4421", camera: "Garage Entry A", time: "08:51" },
    },
    {
      sequence: 2,
      camera_id: "cam_south_entrance",
      camera_label: "South Entrance",
      timestamp: "08:58",
      match_confidence: 93.2,
      duration_sec: 42.0,
      direction: "Entering building",
      alerts: [{ name: "UNKNOWN AT ENTRY", severity: "MEDIUM", status: "RESOLVED" }],
      linked_lpr: null,
    },
    {
      sequence: 3,
      camera_id: "cam_north_entrance",
      camera_label: "North Entrance",
      timestamp: "09:11",
      match_confidence: 96.1,
      duration_sec: 2.1,
      direction: "Moving toward lobby",
      alerts: [],
      linked_lpr: null,
    },
    {
      sequence: 4,
      camera_id: "cam_main_lobby",
      camera_label: "Main Lobby",
      timestamp: "09:13",
      match_confidence: 94.7,
      duration_sec: 8.3,
      direction: "Entering main lobby",
      alerts: [{ name: "BLACKLIST MATCH", severity: "CRITICAL", status: "ACTIVE" }],
      linked_lpr: null,
    },
  ],
  transit_times: ["5.6 min", "12.9 min", "2.3 min"],
};

// ─── Camera nodes on SVG canvas ──────────────────────────────────────────────
const CAMERA_NODES = [
  { id: "cam_parking_garage",  label: "Parking\nGarage",   x: 90,  y: 260, detected: true,  sequence: 1 },
  { id: "cam_south_entrance",  label: "South\nEntrance",   x: 240, y: 200, detected: true,  sequence: 2 },
  { id: "cam_west_corridor",   label: "West\nCorridor",    x: 370, y: 150, detected: false, sequence: null },
  { id: "cam_north_entrance",  label: "North\nEntrance",   x: 500, y: 120, detected: true,  sequence: 3 },
  { id: "cam_main_lobby",      label: "Main\nLobby",       x: 640, y: 175, detected: true,  sequence: 4 },
  { id: "cam_executive_floor", label: "Executive\nFloor",  x: 720, y: 80,  detected: false, sequence: null },
  { id: "cam_service",         label: "Service\nRamp",     x: 460, y: 275, detected: false, sequence: null },
  { id: "cam_reception",       label: "Reception",         x: 590, y: 295, detected: false, sequence: null },
];

const ALERT_STYLES: Record<string, string> = {
  CRITICAL: "bg-[#FFE5E7] border-[#E7000B]/30 text-[#E7000B]",
  HIGH:     "bg-[#FEEFE7] border-[#EA580C]/30 text-[#EA580C]",
  MEDIUM:   "bg-[#FFF7E6] border-[#E19A04]/30 text-[#E19A04]",
  LOW:      "bg-[#E5F0FF] border-[#2B7FFF]/30 text-[#2B7FFF]",
};

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const CrossCameraModal = ({ isOpen, onClose }: Props) => {
  const journey = MOCK_JOURNEY;

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isOpen]);

  const detectedNodes = CAMERA_NODES
    .filter((n) => n.detected)
    .sort((a, b) => (a.sequence ?? 0) - (b.sequence ?? 0));

  return createPortal(
    <>
      {/* ── Backdrop ──────────────────────────────────────────────────────── */}
      <div
        className={cn(
          "fixed inset-0 z-[999] bg-black/50 backdrop-blur-[2px] transition-opacity duration-300 flex items-center justify-center p-6",
          isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      >
        {/* ── Dialog ──────────────────────────────────────────────────────── */}
        <div
          className={cn(
            "relative bg-white rounded-xl shadow-2xl flex flex-col transition-all duration-300",
            "w-full max-w-[1200px]",
            // fixed height so floor plan always has room
            "h-[85vh] max-h-[820px]",
            isOpen ? "scale-100 opacity-100" : "scale-95 opacity-0"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* ── Header ──────────────────────────────────────────────────── */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-200 shrink-0">
            <div className="flex items-center gap-4">
              <div>
                <h2 className="text-sm font-bold text-neutral-900">Cross-Camera Journey</h2>
                <p className="text-[11px] text-neutral-500">
                  {journey.display_name} · {journey.list_membership} · {journey.date}
                </p>
              </div>
              <div className="hidden md:flex items-center gap-4 ml-4 pl-4 border-l border-neutral-200">
                {[
                  { val: journey.summary.total_cameras,      label: "Cameras",  color: "text-neutral-900" },
                  { val: `${journey.summary.total_duration_min}m`, label: "Duration", color: "text-neutral-900" },
                  { val: `${journey.summary.avg_confidence}%`, label: "Avg Conf", color: "text-neutral-900" },
                  { val: journey.summary.alerts_triggered,   label: "Alerts",   color: "text-[#E7000B]" },
                ].map((s) => (
                  <div key={s.label} className="text-center">
                    <p className={cn("font-data tabular-nums text-sm font-black", s.color)}>{s.val}</p>
                    <p className="text-[9px] text-neutral-400 uppercase tracking-wide">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 h-7 px-3 rounded border border-neutral-200 text-xs font-semibold text-neutral-600 hover:border-neutral-300 transition-colors">
                <Share2 className="w-3 h-3" /> Share
              </button>
              <button className="flex items-center gap-1.5 h-7 px-3 rounded border border-neutral-200 text-xs font-semibold text-neutral-600 hover:border-neutral-300 transition-colors">
                <Download className="w-3 h-3" /> Export
              </button>
              <button
                onClick={onClose}
                className="flex items-center justify-center w-7 h-7 rounded-lg hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* ── Body ────────────────────────────────────────────────────── */}
          <div className="flex flex-1 overflow-hidden min-h-0">

            {/* Left: Floor plan */}
            <div className="flex-1 bg-neutral-50 p-4 flex flex-col min-w-0 overflow-hidden">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <p className="text-[10px] font-bold text-neutral-600 uppercase tracking-wider">Site Floor Plan</p>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#00775B] inline-block" />
                    Detected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-neutral-300 inline-block" />
                    Not detected
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-5 h-0.5 bg-[#00775B] inline-block border-dashed" style={{ borderTop: "2px dashed #00775B", height: 0 }} />
                    Path
                  </span>
                </div>
              </div>

              {/* SVG canvas — fills the remaining space */}
              <div className="flex-1 rounded-lg border border-neutral-200 bg-white shadow-sm overflow-hidden">
                <svg
                  viewBox="0 0 800 360"
                  preserveAspectRatio="xMidYMid meet"
                  className="w-full h-full"
                >
                  {/* Grid */}
                  {Array.from({ length: 21 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={360} stroke="#f1f5f9" strokeWidth={1} />
                  ))}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 40} x2={800} y2={i * 40} stroke="#f1f5f9" strokeWidth={1} />
                  ))}

                  {/* Building outline */}
                  <rect x={55} y={55} width={700} height={265} rx={8} fill="#fafafa" stroke="#e2e8f0" strokeWidth={1.5} />
                  <text x={405} y={45} textAnchor="middle" fill="#cbd5e1" fontSize={10} fontFamily="Inter, sans-serif">
                    HQ Building A · Ground Floor
                  </text>

                  {/* Path lines */}
                  {detectedNodes.slice(0, -1).map((node, i) => {
                    const next = detectedNodes[i + 1];
                    const midX = (node.x + next.x) / 2;
                    const midY = (node.y + next.y) / 2;
                    const angle = Math.atan2(next.y - node.y, next.x - node.x) * 180 / Math.PI;
                    return (
                      <g key={node.id}>
                        <line
                          x1={node.x} y1={node.y}
                          x2={next.x} y2={next.y}
                          stroke="#00775B" strokeWidth={2} strokeDasharray="6 3" opacity={0.65}
                        />
                        <text
                          x={midX} y={midY - 7}
                          textAnchor="middle" fill="#00775B" fontSize={8.5}
                          fontFamily="'JetBrains Mono', monospace" opacity={0.85}
                        >
                          {journey.transit_times[i]}
                        </text>
                        <polygon
                          points={`${next.x},${next.y} ${next.x - 7},${next.y - 4} ${next.x - 7},${next.y + 4}`}
                          fill="#00775B" opacity={0.65}
                          transform={`rotate(${angle}, ${next.x}, ${next.y})`}
                        />
                      </g>
                    );
                  })}

                  {/* Camera nodes */}
                  {CAMERA_NODES.map((node) => {
                    const sighting = journey.sightings.find((s) => s.camera_id === node.id);
                    const hasCritical = sighting?.alerts.some((a) => a.severity === "CRITICAL");
                    const hasAlert = (sighting?.alerts.length ?? 0) > 0;
                    return (
                      <g key={node.id}>
                        {node.detected && (
                          <circle cx={node.x} cy={node.y} r={20}
                            fill={hasCritical ? "#FFE5E7" : "#E5FFF9"} opacity={0.55}
                          />
                        )}
                        <circle cx={node.x} cy={node.y} r={13}
                          fill={node.detected ? (hasCritical ? "#E7000B" : "#00775B") : "#e2e8f0"}
                          stroke={hasAlert ? (hasCritical ? "#E7000B" : "#E19A04") : "white"}
                          strokeWidth={node.detected ? 2 : 1}
                        />
                        {node.sequence !== null && (
                          <text x={node.x} y={node.y + 4} textAnchor="middle"
                            fill="white" fontSize={10} fontWeight="700"
                            fontFamily="'JetBrains Mono', monospace"
                          >
                            {node.sequence}
                          </text>
                        )}
                        {!node.detected && (
                          <text x={node.x} y={node.y + 4} textAnchor="middle" fill="#94a3b8" fontSize={8}>●</text>
                        )}
                        {node.label.split("\n").map((line, li) => (
                          <text key={li} x={node.x} y={node.y + 24 + li * 11}
                            textAnchor="middle"
                            fill={node.detected ? "#334155" : "#94a3b8"}
                            fontSize={8.5} fontFamily="Inter, sans-serif"
                            fontWeight={node.detected ? "600" : "400"}
                          >
                            {line}
                          </text>
                        ))}
                        {sighting && (
                          <text x={node.x} y={node.y - 18} textAnchor="middle"
                            fill="#00775B" fontSize={8.5}
                            fontFamily="'JetBrains Mono', monospace" fontWeight="500"
                          >
                            {sighting.timestamp}
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* LPR badge under cam_parking_garage */}
                  <g transform="translate(90, 260)">
                    <rect x={-30} y={15} width={60} height={13} rx={3} fill="#EFF6FF" stroke="#BFDBFE" strokeWidth={1} />
                    <text x={0} y={25} textAnchor="middle" fill="#2B7FFF" fontSize={7.5}
                      fontFamily="'JetBrains Mono', monospace"
                    >KA05MJ4421</text>
                  </g>
                </svg>
              </div>
            </div>

            {/* Right: Sighting timeline */}
            <div className="w-[340px] shrink-0 border-l border-neutral-200 bg-white flex flex-col overflow-hidden">
              <div className="px-4 py-2.5 border-b border-neutral-100 bg-neutral-50 shrink-0">
                <p className="text-[10px] font-bold text-neutral-700 uppercase tracking-wider">Sighting Timeline</p>
                <p className="text-[10px] text-neutral-400 mt-0.5">
                  <span className="font-data tabular-nums">{journey.summary.start_time}</span>
                  {" → "}
                  <span className="font-data tabular-nums">{journey.summary.end_time}</span>
                  {" · "}{journey.summary.total_cameras} cameras
                </p>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {journey.sightings.map((sighting, i) => (
                  <div key={sighting.sequence}>
                    <div className={cn(
                      "rounded-lg border p-3",
                      sighting.alerts.some((a) => a.severity === "CRITICAL")
                        ? "border-[#E7000B]/30 bg-[#FFE5E7]"
                        : sighting.alerts.length > 0
                        ? "border-[#E19A04]/30 bg-[#FFF7E6]"
                        : "border-neutral-200 bg-white"
                    )}>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <div className={cn(
                            "w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shrink-0",
                            sighting.alerts.some((a) => a.severity === "CRITICAL") ? "bg-[#E7000B]" : "bg-[#00775B]"
                          )}>
                            {sighting.sequence}
                          </div>
                          <div>
                            <p className="text-xs font-bold text-neutral-800 leading-tight">{sighting.camera_label}</p>
                            <p className="text-[9px] text-neutral-400">{sighting.camera_id}</p>
                          </div>
                        </div>
                        <span className="font-data tabular-nums text-[10px] text-neutral-400 shrink-0">{sighting.timestamp}</span>
                      </div>

                      <div className="grid grid-cols-3 gap-1.5 mb-2">
                        {[
                          { val: `${sighting.match_confidence}%`, sub: "Confidence", mono: true },
                          { val: `${sighting.duration_sec}s`,     sub: "In Frame",   mono: true },
                          { val: sighting.direction.split(" ").slice(0, 2).join(" "), sub: "Direction", mono: false },
                        ].map((stat) => (
                          <div key={stat.sub} className="text-center px-1 py-1 rounded bg-white/70 border border-white">
                            <p className={cn("text-[11px] font-black text-neutral-800", stat.mono && "font-data tabular-nums")}>{stat.val}</p>
                            <p className="text-[8px] text-neutral-400">{stat.sub}</p>
                          </div>
                        ))}
                      </div>

                      {sighting.alerts.map((alert, ai) => (
                        <div key={ai} className={cn("flex items-center justify-between px-2 py-1 rounded border text-[9px] mb-1", ALERT_STYLES[alert.severity])}>
                          <div className="flex items-center gap-1">
                            {alert.severity === "CRITICAL" ? <Shield className="w-2.5 h-2.5" /> : <AlertTriangle className="w-2.5 h-2.5" />}
                            <span className="font-bold">{alert.name}</span>
                          </div>
                          <span className={cn("font-bold text-[9px]", alert.status === "ACTIVE" ? "text-current" : "text-[#00A63E]")}>
                            {alert.status}
                          </span>
                        </div>
                      ))}

                      {sighting.linked_lpr && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded border border-[#2B7FFF]/30 bg-[#E5F0FF] text-[9px] text-[#2B7FFF] font-semibold mb-1">
                          <Car className="w-2.5 h-2.5 shrink-0" />
                          <span className="truncate">LPR: {sighting.linked_lpr.plate} · {sighting.linked_lpr.camera} · </span>
                          <span className="font-data tabular-nums shrink-0">{sighting.linked_lpr.time}</span>
                        </div>
                      )}

                      <div className="flex gap-1 mt-1.5">
                        <button className="flex-1 h-6 rounded border border-neutral-200 text-[9px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                          View frame
                        </button>
                        <button className="flex-1 h-6 rounded border border-neutral-200 text-[9px] font-semibold text-neutral-600 hover:bg-neutral-50 transition-colors">
                          View clip
                        </button>
                        {sighting.alerts.some((a) => a.status === "ACTIVE") && (
                          <button className="h-6 px-2 rounded border border-[#E7000B]/30 text-[9px] font-bold text-[#E7000B] hover:bg-[#E7000B]/10 transition-colors">
                            Ack
                          </button>
                        )}
                      </div>
                    </div>

                    {i < journey.sightings.length - 1 && (
                      <div className="flex items-center gap-2 py-1 px-3">
                        <div className="w-px h-5 bg-neutral-200 mx-2" />
                        <span className="font-data tabular-nums text-[9px] text-neutral-400">↓ {journey.transit_times[i]} transit</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Footer summary bar ──────────────────────────────────────────── */}
          <div className="px-5 py-2.5 border-t border-neutral-200 bg-neutral-50 flex flex-wrap items-center gap-x-6 gap-y-1 shrink-0 rounded-b-xl">
            {[
              { label: "Journey time",     value: `${journey.summary.total_duration_min} minutes` },
              { label: "Total in frame",   value: `${journey.summary.total_frame_time_sec}s` },
              { label: "Avg confidence",   value: `${journey.summary.avg_confidence}%` },
              { label: "Alerts triggered", value: `${journey.summary.alerts_triggered} (${journey.summary.alerts_resolved} resolved)` },
              { label: "Linked LPR",       value: String(journey.summary.linked_lpr) },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <span className="text-[9px] text-neutral-400 uppercase tracking-wide">{item.label}:</span>
                <span className="font-data tabular-nums text-[10px] font-bold text-neutral-700">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>,
    document.body
  );
};
