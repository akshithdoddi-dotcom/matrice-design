import { useState, useMemo, useCallback } from "react";
import {
  ShieldAlert, UserX, Eye, Camera, Users, CheckCircle2, AlertTriangle,
  ChevronDown, ChevronUp, Search, Download, Filter, X, Clock,
  TrendingUp, TrendingDown, Minus, ChevronLeft, ChevronRight,
  Activity, BarChart3, ScanFace, Car, BadgeCheck, Star, Ban,
  RefreshCcw, ArrowRight,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { DataGrid, DataGridColumn, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";
import {
  ResponsiveContainer, AreaChart, Area, BarChart, Bar, LineChart, Line,
  XAxis, YAxis, Tooltip, Cell, PieChart, Pie, Legend,
} from "recharts";

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertType = "BLACKLIST_MATCH" | "UNKNOWN_PERSON" | "UNREGISTERED_PLATE" | "VIP_DETECTED" | "TAILGATING" | "ACCESS_DENIED" | "REPEAT_VISIT";
type Severity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFO";
type EventStatus = "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED" | "ESCALATED";

interface IdentEvent {
  id: string;
  type: AlertType;
  severity: Severity;
  timestamp: string;
  date: string;
  camera_id: string;
  camera_name: string;
  zone: string;
  subject: string;
  subject_id: string;
  kind: "FACE" | "PLATE";
  confidence: number;
  status: EventStatus;
  details: string;
  face_seed?: string;
  plate_text?: string;
  dwell?: string;
  location_note?: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────
const CAMERAS: { id: string; name: string; zone: string }[] = [
  { id: "CAM-01", name: "CAM-01", zone: "Main Lobby" },
  { id: "CAM-02", name: "CAM-02", zone: "North Gate" },
  { id: "CAM-03", name: "CAM-03", zone: "South Gate" },
  { id: "CAM-04", name: "CAM-04", zone: "East Wing" },
  { id: "CAM-05", name: "CAM-05", zone: "West Wing" },
  { id: "CAM-06", name: "CAM-06", zone: "Garage Level 1" },
  { id: "CAM-07", name: "CAM-07", zone: "Garage Level 2" },
  { id: "CAM-08", name: "CAM-08", zone: "Executive Floor" },
  { id: "CAM-09", name: "CAM-09", zone: "Reception" },
  { id: "CAM-10", name: "CAM-10", zone: "Server Room" },
  { id: "CAM-11", name: "CAM-11", zone: "Rooftop Access" },
  { id: "CAM-12", name: "CAM-12", zone: "Side Gate" },
  { id: "CAM-13", name: "CAM-13", zone: "Basement Store" },
  { id: "CAM-14", name: "CAM-14", zone: "Service Ramp" },
  { id: "CAM-15", name: "CAM-15", zone: "Staff Entrance" },
  { id: "CAM-16", name: "CAM-16", zone: "Loading Bay" },
  { id: "CAM-17", name: "CAM-17", zone: "Cafeteria" },
  { id: "CAM-18", name: "CAM-18", zone: "Parking Lot A" },
  { id: "CAM-19", name: "CAM-19", zone: "Parking Lot B" },
  { id: "CAM-20", name: "CAM-20", zone: "Visitor Centre" },
];

const makeEvent = (
  id: string, type: AlertType, severity: Severity, timestamp: string, camIdx: number,
  subject: string, subject_id: string, kind: "FACE" | "PLATE", confidence: number,
  status: EventStatus, details: string, extra?: Partial<IdentEvent>
): IdentEvent => ({
  id, type, severity, timestamp,
  date: "2025-04-13",
  camera_id: CAMERAS[camIdx].id,
  camera_name: CAMERAS[camIdx].name,
  zone: CAMERAS[camIdx].zone,
  subject, subject_id, kind, confidence, status, details,
  face_seed: kind === "FACE" ? subject_id : undefined,
  plate_text: kind === "PLATE" ? subject : undefined,
  dwell: extra?.dwell,
  location_note: extra?.location_note,
  ...extra,
});

export const IDENT_EVENTS: IdentEvent[] = [
  makeEvent("e01","BLACKLIST_MATCH","CRITICAL","14:31:22",0,"Subject BL-003","PER-0031","FACE",94,"ACTIVE","Confirmed blacklist match at Main Lobby. Immediate action required.",{face_seed:"u=bl003"}),
  makeEvent("e02","UNKNOWN_PERSON","HIGH","14:30:55",2,"Unknown #88","PER-0088","FACE",61,"ACTIVE","Unidentified individual at South Gate. Cross-camera tracking active.",{dwell:"5m 12s"}),
  makeEvent("e03","UNREGISTERED_PLATE","MEDIUM","14:31:06",5,"AB-7821-KA","PLT-0001","PLATE",91,"ACTIVE","Unregistered plate attempted Garage Level 1 entry. Vehicle blocked.",{plate_text:"AB-7821-KA"}),
  makeEvent("e04","VIP_DETECTED","LOW","14:31:10",1,"Exec VIP-007","PER-0007","FACE",97,"ACKNOWLEDGED","VIP detected at North Gate. Escort protocol suggested.",{face_seed:"u=vip007"}),
  makeEvent("e05","TAILGATING","HIGH","14:28:44",0,"PER-0210 + PER-0211","PER-0210","FACE",83,"ACTIVE","Tailgating detected — two individuals through single auth at Main Lobby.",{dwell:"0m 12s"}),
  makeEvent("e06","ACCESS_DENIED","MEDIUM","14:27:30",7,"PER-0055","PER-0055","FACE",88,"RESOLVED","Access denied: PER-0055 attempted entry to Executive Floor without clearance.",{}),
  makeEvent("e07","REPEAT_VISIT","INFO","14:26:15",2,"Unknown #134","PER-0134","FACE",72,"ACKNOWLEDGED","Recurring unknown individual. 7 appearances since 11:45.",{dwell:"2h 41m"}),
  makeEvent("e08","UNREGISTERED_PLATE","MEDIUM","14:25:01",17,"KL-3312-MH","PLT-0002","PLATE",89,"ACTIVE","Unregistered plate in Parking Lot A. No permit found.",{plate_text:"KL-3312-MH"}),
  makeEvent("e09","UNKNOWN_PERSON","HIGH","14:22:48",11,"Unknown #47","PER-0047","FACE",65,"ACTIVE","Unknown individual loitering at Side Gate for 18 minutes.",{dwell:"18m 05s"}),
  makeEvent("e10","ACCESS_DENIED","MEDIUM","14:20:33",9,"PER-0112","PER-0112","FACE",92,"RESOLVED","Access denied: Server Room entry attempt by PER-0112.",{}),
  makeEvent("e11","BLACKLIST_MATCH","CRITICAL","14:18:55",3,"Subject BL-011","PER-0011","FACE",91,"ESCALATED","High-priority blacklist subject detected at East Wing.",{face_seed:"u=bl011"}),
  makeEvent("e12","VIP_DETECTED","LOW","14:17:40",7,"Exec VIP-002","PER-0002","FACE",98,"ACKNOWLEDGED","C-suite VIP arrival at Executive Floor.",{face_seed:"u=vip002"}),
  makeEvent("e13","TAILGATING","HIGH","14:15:22",14,"PER-0302 + PER-0303","PER-0302","FACE",79,"RESOLVED","Tailgating at Staff Entrance — reviewed, authorized pair.",{}),
  makeEvent("e14","REPEAT_VISIT","INFO","14:12:10",16,"Unknown #201","PER-0201","FACE",68,"ACKNOWLEDGED","Returning unknown at Cafeteria. 4th appearance today.",{dwell:"45m"}),
  makeEvent("e15","UNREGISTERED_PLATE","MEDIUM","14:10:05",18,"DL-9944-UP","PLT-0003","PLATE",87,"RESOLVED","Plate DL-9944-UP cleared after manual verification.",{plate_text:"DL-9944-UP"}),
  makeEvent("e16","ACCESS_DENIED","HIGH","14:08:30",0,"PER-0078","PER-0078","FACE",90,"ACTIVE","Repeated failed access attempts at Main Lobby (3 in 10 min).",{}),
  makeEvent("e17","UNKNOWN_PERSON","MEDIUM","14:05:14",19,"Unknown #315","PER-0315","FACE",71,"ACKNOWLEDGED","Unknown individual at Visitor Centre checked in manually.",{dwell:"12m"}),
  makeEvent("e18","BLACKLIST_MATCH","CRITICAL","13:58:22",12,"Subject BL-019","PER-0019","FACE",88,"ESCALATED","Blacklist subject flagged at Side Gate. Security dispatched.",{face_seed:"u=bl019"}),
  makeEvent("e19","VIP_DETECTED","LOW","13:55:10",8,"Board Member VIP-015","PER-0015","FACE",96,"ACKNOWLEDGED","Board member detected at Reception.",{face_seed:"u=vip015"}),
  makeEvent("e20","TAILGATING","MEDIUM","13:52:30",5,"PER-0144 + PER-0145","PER-0144","FACE",81,"ACKNOWLEDGED","Minor tailgating incident at Garage Level 1.",{}),
  makeEvent("e21","UNREGISTERED_PLATE","LOW","13:50:05",6,"MH-2231-GJ","PLT-0004","PLATE",93,"RESOLVED","Visitor plate registered on-site after verification.",{plate_text:"MH-2231-GJ"}),
  makeEvent("e22","ACCESS_DENIED","MEDIUM","13:47:20",10,"PER-0099","PER-0099","FACE",85,"RESOLVED","Access denied: Rooftop restricted access attempt.",{}),
  makeEvent("e23","UNKNOWN_PERSON","MEDIUM","13:44:15",4,"Unknown #422","PER-0422","FACE",63,"ACTIVE","Unidentified at West Wing. Badge cloned suspicion.",{dwell:"8m 30s"}),
  makeEvent("e24","REPEAT_VISIT","INFO","13:40:00",13,"Unknown #177","PER-0177","FACE",70,"ACKNOWLEDGED","Known recurring unknown in Basement Store.",{dwell:"3h 12m"}),
  makeEvent("e25","BLACKLIST_MATCH","HIGH","13:35:40",1,"Subject BL-022","PER-0022","FACE",85,"ACKNOWLEDGED","Medium-priority BOLO match at North Gate.",{face_seed:"u=bl022"}),
  makeEvent("e26","ACCESS_DENIED","LOW","13:30:10",15,"PER-0220","PER-0220","FACE",91,"RESOLVED","Expired badge attempt at Staff Entrance.",{}),
  makeEvent("e27","TAILGATING","HIGH","13:25:55",0,"PER-0311 + Unknown","PER-0311","FACE",76,"ESCALATED","Tailgating with unknown individual at Main Lobby. Under review.",{}),
  makeEvent("e28","UNREGISTERED_PLATE","HIGH","13:20:30",6,"RJ-5588-BR","PLT-0005","PLATE",90,"ACTIVE","Stolen plate flag — BOLO match at Garage Level 2.",{plate_text:"RJ-5588-BR"}),
  makeEvent("e29","VIP_DETECTED","INFO","13:15:00",8,"Guest VIP-030","PER-0030","FACE",94,"ACKNOWLEDGED","Guest VIP arrival recorded at Executive Floor.",{face_seed:"u=vip030"}),
  makeEvent("e30","UNKNOWN_PERSON","HIGH","13:10:20",3,"Unknown #503","PER-0503","FACE",58,"ACTIVE","Unidentified at East Wing — attempted badge swipe.",{dwell:"22m"}),
  makeEvent("e31","ACCESS_DENIED","MEDIUM","13:05:10",9,"PER-0066","PER-0066","FACE",87,"RESOLVED","Access denied: Server Room off-hours attempt.",{}),
  makeEvent("e32","REPEAT_VISIT","LOW","13:00:00",17,"Unknown #281","PER-0281","FACE",73,"ACKNOWLEDGED","Frequent visitor not enrolled. Cafeteria area.",{dwell:"1h 15m"}),
  makeEvent("e33","BLACKLIST_MATCH","CRITICAL","12:55:30",2,"Subject BL-007","PER-0007","FACE",96,"RESOLVED","Historic blacklist match - resolved after identity confirmation.",{face_seed:"u=bl007"}),
  makeEvent("e34","TAILGATING","MEDIUM","12:50:15",14,"PER-0188 + PER-0189","PER-0188","FACE",82,"RESOLVED","Staff pair — tailgating policy reminder sent.",{}),
  makeEvent("e35","UNREGISTERED_PLATE","MEDIUM","12:45:00",18,"TN-1122-PY","PLT-0006","PLATE",86,"ACKNOWLEDGED","Parking Lot A: unregistered vehicle. Owner notified.",{plate_text:"TN-1122-PY"}),
  makeEvent("e36","ACCESS_DENIED","HIGH","12:40:30",7,"PER-0041","PER-0041","FACE",89,"ESCALATED","Multiple floor-level violations by same individual.",{}),
  makeEvent("e37","UNKNOWN_PERSON","MEDIUM","12:35:10",19,"Unknown #601","PER-0601","FACE",67,"RESOLVED","Visitor Centre unknown — registered as walk-in.",{dwell:"18m"}),
  makeEvent("e38","VIP_DETECTED","LOW","12:30:00",1,"Partner VIP-025","PER-0025","FACE",95,"ACKNOWLEDGED","Partner meeting — VIP at North Gate.",{face_seed:"u=vip025"}),
  makeEvent("e39","REPEAT_VISIT","INFO","12:25:40",4,"Unknown #344","PER-0344","FACE",69,"ACKNOWLEDGED","West Wing: 6th appearance this week.",{dwell:"55m"}),
  makeEvent("e40","BLACKLIST_MATCH","HIGH","12:20:10",11,"Subject BL-031","PER-0031","FACE",83,"ACKNOWLEDGED","Watchlist positive — BOLO subject near Rooftop Access.",{face_seed:"u=bl031"}),
  makeEvent("e41","ACCESS_DENIED","MEDIUM","12:15:00",12,"PER-0155","PER-0155","FACE",88,"RESOLVED","Side Gate: off-hours zone violation.",{}),
  makeEvent("e42","TAILGATING","LOW","12:10:30",8,"PER-0277 + PER-0278","PER-0277","FACE",84,"RESOLVED","Executive Floor tailgate — both authorized on review.",{}),
  makeEvent("e43","UNREGISTERED_PLATE","LOW","12:05:00",6,"GJ-7744-MP","PLT-0007","PLATE",92,"RESOLVED","Short-stay visitor plate. Approved after check.",{plate_text:"GJ-7744-MP"}),
  makeEvent("e44","UNKNOWN_PERSON","MEDIUM","12:00:20",0,"Unknown #712","PER-0712","FACE",64,"ACTIVE","Main Lobby: new unidentified individual. Under watch.",{dwell:"3m 10s"}),
  makeEvent("e45","VIP_DETECTED","LOW","11:55:00",9,"VIP Delegate-040","PER-0040","FACE",97,"ACKNOWLEDGED","Reception: international delegate registered.",{face_seed:"u=vip040"}),
  makeEvent("e46","REPEAT_VISIT","INFO","11:50:20",13,"Unknown #198","PER-0198","FACE",71,"ACKNOWLEDGED","Basement Store recurring unknown — long dwell.",{dwell:"4h 20m"}),
  makeEvent("e47","ACCESS_DENIED","HIGH","11:45:10",3,"PER-0333","PER-0333","FACE",90,"ACTIVE","East Wing: unauthorized zone access by PER-0333.",{}),
  makeEvent("e48","BLACKLIST_MATCH","MEDIUM","11:40:00",5,"Subject BL-044","PER-0044","FACE",79,"RESOLVED","Garage Level 1: partial blacklist match confirmed as false positive.",{face_seed:"u=bl044"}),
  makeEvent("e49","TAILGATING","MEDIUM","11:35:30",15,"PER-0400 + PER-0401","PER-0400","FACE",78,"RESOLVED","Staff Entrance: peer-verified entry.",{}),
  makeEvent("e50","UNREGISTERED_PLATE","MEDIUM","11:30:00",19,"AP-3355-HR","PLT-0008","PLATE",88,"ACKNOWLEDGED","Parking Lot B: unregistered plate under review.",{plate_text:"AP-3355-HR"}),
];

// ─── Alert type configs ───────────────────────────────────────────────────────
const ALERT_TYPE_CFG: Record<AlertType, { label: string; color: string; bg: string; icon: typeof ShieldAlert }> = {
  BLACKLIST_MATCH:     { label: "Blacklist",    color: "text-red-700",    bg: "bg-red-100",    icon: ShieldAlert },
  UNKNOWN_PERSON:      { label: "Unknown",      color: "text-amber-700",  bg: "bg-amber-100",  icon: UserX },
  UNREGISTERED_PLATE:  { label: "Plate",        color: "text-orange-700", bg: "bg-orange-100", icon: Car },
  VIP_DETECTED:        { label: "VIP",          color: "text-purple-700", bg: "bg-purple-100", icon: Star },
  TAILGATING:          { label: "Tailgate",     color: "text-pink-700",   bg: "bg-pink-100",   icon: Users },
  ACCESS_DENIED:       { label: "Denied",       color: "text-neutral-700",bg: "bg-neutral-100",icon: Ban },
  REPEAT_VISIT:        { label: "Repeat",       color: "text-sky-700",    bg: "bg-sky-100",    icon: RefreshCcw },
};

const SEVERITY_CFG: Record<Severity, { badge: string; dot: string }> = {
  CRITICAL: { badge: "bg-red-600 text-white",     dot: "bg-red-500" },
  HIGH:     { badge: "bg-orange-500 text-white",  dot: "bg-orange-400" },
  MEDIUM:   { badge: "bg-amber-500 text-white",   dot: "bg-amber-400" },
  LOW:      { badge: "bg-neutral-400 text-white", dot: "bg-neutral-400" },
  INFO:     { badge: "bg-sky-500 text-white",     dot: "bg-sky-400" },
};

const STATUS_CFG: Record<EventStatus, { label: string; cls: string }> = {
  ACTIVE:       { label: "Active",       cls: "bg-emerald-100 text-emerald-700 border border-emerald-200" },
  ACKNOWLEDGED: { label: "Ack'd",        cls: "bg-sky-100 text-sky-700 border border-sky-200" },
  RESOLVED:     { label: "Resolved",     cls: "bg-neutral-100 text-neutral-500 border border-neutral-200" },
  ESCALATED:    { label: "Escalated",    cls: "bg-red-50 text-red-700 border border-red-200" },
};

// ─── Analytics chart data ─────────────────────────────────────────────────────
const HOURLY_DATA = [
  { h: "6am", total: 45, matched: 40, unknown: 3, denied: 2 },
  { h: "7am", total: 120, matched: 108, unknown: 8, denied: 4 },
  { h: "8am", total: 340, matched: 308, unknown: 22, denied: 10 },
  { h: "9am", total: 290, matched: 264, unknown: 18, denied: 8 },
  { h: "10am", total: 210, matched: 192, unknown: 12, denied: 6 },
  { h: "11am", total: 175, matched: 161, unknown: 9, denied: 5 },
  { h: "12pm", total: 195, matched: 178, unknown: 11, denied: 6 },
  { h: "1pm", total: 220, matched: 202, unknown: 12, denied: 6 },
  { h: "2pm", total: 180, matched: 164, unknown: 11, denied: 5 },
  { h: "3pm", total: 160, matched: 146, unknown: 9, denied: 5 },
  { h: "4pm", total: 265, matched: 242, unknown: 16, denied: 7 },
  { h: "5pm", total: 320, matched: 292, unknown: 20, denied: 8 },
];

const SIX_MONTH_DATA = [
  { month: "Oct", compliance: 84.2, alerts: 42, unknowns: 31 },
  { month: "Nov", compliance: 87.1, alerts: 38, unknowns: 28 },
  { month: "Dec", compliance: 89.0, alerts: 31, unknowns: 22 },
  { month: "Jan", compliance: 91.4, alerts: 26, unknowns: 18 },
  { month: "Feb", compliance: 93.6, alerts: 19, unknowns: 14 },
  { month: "Mar", compliance: 94.2, alerts: 14, unknowns: 9 },
];

const ALERT_TYPE_DIST = [
  { name: "Access Denied", value: 14, fill: "#6B7280" },
  { name: "Unknown Person", value: 11, fill: "#F59E0B" },
  { name: "Unregistered Plate", value: 9, fill: "#EA580C" },
  { name: "Blacklist Match", value: 6, fill: "#DC2626" },
  { name: "Tailgating", value: 5, fill: "#EC4899" },
  { name: "Repeat Visit", value: 3, fill: "#0EA5E9" },
  { name: "VIP Detected", value: 2, fill: "#A855F7" },
];

const ZONE_ALERT_DATA = [
  { zone: "Main Lobby", alerts: 12 },
  { zone: "South Gate", alerts: 9 },
  { zone: "East Wing", alerts: 7 },
  { zone: "Garage L1", alerts: 6 },
  { zone: "Side Gate", alerts: 5 },
  { zone: "West Wing", alerts: 4 },
  { zone: "Staff Ent.", alerts: 4 },
  { zone: "Rooftop", alerts: 2 },
];

const CONFIDENCE_DIST = [
  { bucket: "<70%", count: 7, fill: "#DC2626" },
  { bucket: "70-80%", count: 11, fill: "#EA580C" },
  { bucket: "80-90%", count: 16, fill: "#D97706" },
  { bucket: "90-95%", count: 22, fill: "#65A30D" },
  { bucket: ">95%", count: 31, fill: "#00775B" },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────
function formatValue(v: number, unit: string) {
  if (unit === "%") return `${v.toFixed(1)}%`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}k`;
  return String(v);
}

function exportCSV(events: IdentEvent[]) {
  const header = ["ID","Type","Severity","Timestamp","Camera","Zone","Subject","Subject ID","Confidence","Status","Details"];
  const rows = events.map(e => [
    e.id, e.type, e.severity, e.timestamp, e.camera_id, e.zone,
    e.subject, e.subject_id, `${e.confidence}%`, e.status, `"${e.details}"`
  ]);
  const csv = [header, ...rows].map(r => r.join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "identity_events.csv"; a.click();
  URL.revokeObjectURL(url);
}

// ─── Sub-components ────────────────────────────────────────────────────────────

// Thumbnail cell
const EventThumb = ({ event }: { event: IdentEvent }) => {
  if (event.kind === "FACE") {
    return (
      <div className="relative w-10 h-10 rounded-[3px] overflow-hidden border border-neutral-200 bg-neutral-900 shrink-0">
        <img
          src={`https://i.pravatar.cc/80?${event.face_seed ?? `u=${event.subject_id}`}`}
          alt={event.subject}
          className="w-full h-full object-cover opacity-90"
          onError={(e) => { e.currentTarget.style.display = "none"; }}
        />
        <div className="absolute inset-0 border border-[#00FF84]/50 rounded-[3px] pointer-events-none" />
        <div className="pointer-events-none absolute left-[20%] top-[15%] h-[52%] w-[56%] rounded-[2px] border border-[#00FF84] opacity-80" />
      </div>
    );
  }
  return (
    <div className="relative w-[60px] h-10 rounded-[3px] overflow-hidden border border-neutral-200 bg-neutral-900 shrink-0 flex items-center justify-center">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#dff7ff_0%,#a2d4f5_48%,#1f2937_48%,#111827_100%)]" />
      <div className="relative z-10 bg-amber-100 border border-amber-300 rounded-[2px] px-1.5 py-0.5 text-[9px] font-black tracking-widest text-amber-800">
        {event.plate_text ?? "PLATE"}
      </div>
      <div className="absolute inset-0 border border-[#00FF84]/50 rounded-[3px] pointer-events-none" />
    </div>
  );
};

// Confidence bar
const ConfBar = ({ value }: { value: number }) => (
  <div className="flex items-center gap-1.5">
    <div className="h-1.5 w-16 rounded-full bg-neutral-100 overflow-hidden">
      <div
        className={cn("h-full rounded-full", value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-amber-500" : "bg-red-500")}
        style={{ width: `${value}%` }}
      />
    </div>
    <span className={cn("text-[10px] font-mono font-bold", value >= 90 ? "text-emerald-600" : value >= 75 ? "text-amber-600" : "text-red-500")}>
      {value}%
    </span>
  </div>
);

// Type badge
const TypeBadge = ({ type }: { type: AlertType }) => {
  const cfg = ALERT_TYPE_CFG[type];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[2px] text-[9px] font-bold uppercase tracking-wide", cfg.bg, cfg.color)}>
      <Icon className="w-2.5 h-2.5" />
      {cfg.label}
    </span>
  );
};

// Expanded row content
const ExpandedRow = ({
  event, onAck, onEscalate, onResolve
}: {
  event: IdentEvent;
  onAck: () => void; onEscalate: () => void; onResolve: () => void;
}) => (
  <div className="flex gap-6 py-3 px-4 bg-neutral-50/70 border-t border-neutral-100">
    <EventThumb event={event} />
    <div className="flex-1 min-w-0">
      <p className="text-[11px] text-neutral-700 leading-relaxed mb-2">{event.details}</p>
      <div className="grid grid-cols-4 gap-3">
        {event.dwell && (
          <div>
            <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Dwell</p>
            <p className="text-[11px] font-mono text-neutral-700">{event.dwell}</p>
          </div>
        )}
        <div>
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Kind</p>
          <p className="text-[11px] text-neutral-700">{event.kind === "FACE" ? "Face ID" : "Plate Read"}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Subject ID</p>
          <p className="text-[11px] font-mono text-neutral-700">{event.subject_id}</p>
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold">Date</p>
          <p className="text-[11px] font-mono text-neutral-700">{event.date}</p>
        </div>
      </div>
    </div>
    {event.status !== "RESOLVED" && (
      <div className="flex flex-col gap-1.5 shrink-0">
        {event.status === "ACTIVE" && (
          <button onClick={onAck} className="h-6 px-2.5 rounded-[4px] bg-sky-600 text-white text-[10px] font-bold hover:bg-sky-700 transition-colors whitespace-nowrap">
            Acknowledge
          </button>
        )}
        {(event.status === "ACTIVE" || event.status === "ACKNOWLEDGED") && (
          <button onClick={onEscalate} className="h-6 px-2.5 rounded-[4px] bg-red-600 text-white text-[10px] font-bold hover:bg-red-700 transition-colors whitespace-nowrap">
            Escalate
          </button>
        )}
        <button onClick={onResolve} className="h-6 px-2.5 rounded-[4px] border border-neutral-200 bg-white text-neutral-600 text-[10px] font-bold hover:border-neutral-400 transition-colors whitespace-nowrap">
          Mark Resolved
        </button>
      </div>
    )}
  </div>
);

// KPI Card
interface KPIProps {
  label: string; value: number | string; unit?: string;
  icon: typeof ShieldAlert; pulse?: boolean; subtitle: string;
  trend?: "up" | "down" | "flat"; trendValue?: string; filterKey?: string;
  onClick?: () => void; active?: boolean;
}
const KPICard = ({ label, value, unit, icon: Icon, pulse, subtitle, trend, trendValue, onClick, active }: KPIProps) => (
  <button
    onClick={onClick}
    className={cn(
      "bg-white rounded-[4px] border text-left p-4 flex flex-col gap-2 transition-all hover:shadow-md",
      active ? "border-[#00775B] shadow-[0_0_0_2px_rgba(0,119,91,0.15)]" : "border-neutral-100 shadow-sm",
      pulse && "ring-1 ring-red-400/30"
    )}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <Icon className={cn("w-3.5 h-3.5", pulse ? "text-red-500" : "text-[#00775B]")} />
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
      </div>
      {pulse && <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />}
      {active && !pulse && <span className="h-1.5 w-1.5 rounded-full bg-[#00775B]" />}
    </div>
    <div className="flex items-baseline gap-1">
      <span className={cn("text-3xl font-black font-mono leading-none", pulse ? "text-red-700" : "text-neutral-900")}>
        {typeof value === "number" ? formatValue(value, unit ?? "") : value}
      </span>
    </div>
    <p className="text-[10px] text-neutral-400 leading-snug">{subtitle}</p>
    {trend && trendValue && (
      <div className={cn("flex items-center gap-0.5 text-[10px] font-bold",
        trend === "up" ? "text-emerald-600" : trend === "down" ? "text-red-500" : "text-neutral-400")}>
        {trend === "up" ? <TrendingUp className="w-3 h-3" /> : trend === "down" ? <TrendingDown className="w-3 h-3" /> : <Minus className="w-3 h-3" />}
        {trendValue} vs yesterday
      </div>
    )}
  </button>
);

// ─── Analytics Panels ─────────────────────────────────────────────────────────
const MonitoringAnalytics = () => (
  <div className="grid grid-cols-2 gap-3">
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Identification Volume (Today)</p>
      <ResponsiveContainer width="100%" height={140}>
        <AreaChart data={HOURLY_DATA} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <defs>
            <linearGradient id="idGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00775B" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#00775B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis dataKey="h" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Area type="monotone" dataKey="matched" stroke="#00775B" fill="url(#idGrad)" strokeWidth={1.5} dot={false} name="Matched" />
          <Area type="monotone" dataKey="unknown" stroke="#F59E0B" fill="none" strokeWidth={1.5} dot={false} name="Unknown" strokeDasharray="4 2" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Confidence Distribution</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={CONFIDENCE_DIST} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="bucket" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Bar dataKey="count" radius={[2, 2, 0, 0]} name="Events" isAnimationActive={false}>
            {CONFIDENCE_DIST.map((d) => <Cell key={d.bucket} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Alert Type Breakdown</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={ALERT_TYPE_DIST} layout="vertical" margin={{ top: 0, right: 30, left: 70, bottom: 0 }}>
          <XAxis type="number" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Bar dataKey="value" radius={[0, 2, 2, 0]} isAnimationActive={false}>
            {ALERT_TYPE_DIST.map((d) => <Cell key={d.name} fill={d.fill} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Alerts by Zone</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={ZONE_ALERT_DATA} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="zone" tick={{ fontSize: 8 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Bar dataKey="alerts" fill="#00775B" radius={[2, 2, 0, 0]} name="Alerts" isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  </div>
);

const ManagerAnalytics = () => (
  <div className="grid grid-cols-2 gap-3">
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Matched vs Unknown vs Denied (Hourly)</p>
      <ResponsiveContainer width="100%" height={140}>
        <BarChart data={HOURLY_DATA} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="h" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Bar dataKey="matched" fill="#00775B" stackId="a" name="Matched" isAnimationActive={false} />
          <Bar dataKey="unknown" fill="#F59E0B" stackId="a" name="Unknown" isAnimationActive={false} />
          <Bar dataKey="denied" fill="#EF4444" stackId="a" name="Denied" radius={[2,2,0,0]} isAnimationActive={false} />
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Alert Distribution</p>
      <ResponsiveContainer width="100%" height={140}>
        <PieChart>
          <Pie data={ALERT_TYPE_DIST} cx="50%" cy="50%" outerRadius={55} innerRadius={28} dataKey="value" isAnimationActive={false}>
            {ALERT_TYPE_DIST.map((d) => <Cell key={d.name} fill={d.fill} />)}
          </Pie>
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 9 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
    <div className="col-span-2 bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Zone Alert Comparison</p>
      <ResponsiveContainer width="100%" height={120}>
        <BarChart data={ZONE_ALERT_DATA} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
          <XAxis dataKey="zone" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
          <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
          <Bar dataKey="alerts" radius={[2, 2, 0, 0]} isAnimationActive={false}>
            {ZONE_ALERT_DATA.map((d, i) => <Cell key={i} fill={d.alerts > 8 ? "#EF4444" : d.alerts > 5 ? "#F59E0B" : "#00775B"} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <div className="col-span-2 bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
      <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-2">Response Status Summary</p>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Active", count: IDENT_EVENTS.filter(e => e.status === "ACTIVE").length, cls: "text-emerald-600" },
          { label: "Acknowledged", count: IDENT_EVENTS.filter(e => e.status === "ACKNOWLEDGED").length, cls: "text-sky-600" },
          { label: "Escalated", count: IDENT_EVENTS.filter(e => e.status === "ESCALATED").length, cls: "text-red-600" },
          { label: "Resolved", count: IDENT_EVENTS.filter(e => e.status === "RESOLVED").length, cls: "text-neutral-500" },
        ].map(s => (
          <div key={s.label} className="text-center p-3 bg-neutral-50 rounded-[4px]">
            <p className={cn("text-2xl font-black font-mono", s.cls)}>{s.count}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const DirectorAnalytics = () => (
  <div className="space-y-3">
    <div className="grid grid-cols-5 gap-3">
      {[
        { label: "6-Month Match Rate", value: "94.2%", delta: "+10%", up: true },
        { label: "Avg Response Time", value: "4.2m", delta: "-18%", up: true },
        { label: "False Positive Rate", value: "1.8%", delta: "-0.6%", up: true },
        { label: "Enrolled Identities", value: "3,412", delta: "+312", up: true },
        { label: "Active Cameras", value: "14/20", delta: "92% uptime", up: false },
      ].map(s => (
        <div key={s.label} className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-2">{s.label}</p>
          <p className="text-2xl font-black font-mono text-neutral-900">{s.value}</p>
          <p className={cn("text-[10px] font-bold mt-1", s.up ? "text-emerald-600" : "text-neutral-400")}>{s.delta}</p>
        </div>
      ))}
    </div>
    <div className="grid grid-cols-2 gap-3">
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">6-Month Trend — Match Rate vs Alerts</p>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={SIX_MONTH_DATA} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis yAxisId="left" domain={[80, 100]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
            <YAxis yAxisId="right" orientation="right" domain={[0, 50]} tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
            <Line yAxisId="left" dataKey="compliance" stroke="#00775B" strokeWidth={2.5} dot={{ r: 3, fill: "#00775B" }} name="Match Rate %" />
            <Line yAxisId="right" dataKey="alerts" stroke="#EF4444" strokeWidth={1.5} strokeDasharray="4 3" dot={{ r: 2, fill: "#EF4444" }} name="Total Alerts" />
          </LineChart>
        </ResponsiveContainer>
      </div>
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-4">
        <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mb-3">Monthly Unknowns Trend</p>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={SIX_MONTH_DATA} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
            <defs>
              <linearGradient id="unkGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 9 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb" }} />
            <Area type="monotone" dataKey="unknowns" stroke="#F59E0B" fill="url(#unkGrad)" strokeWidth={2} dot={{ r: 3, fill: "#F59E0B" }} name="Unknowns" />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
);

// ─── Main Component ────────────────────────────────────────────────────────────
interface Props {
  persona: Persona;
}

const PAGE_SIZE = 10;

const ALL_TYPES: AlertType[] = ["BLACKLIST_MATCH","UNKNOWN_PERSON","UNREGISTERED_PLATE","VIP_DETECTED","TAILGATING","ACCESS_DENIED","REPEAT_VISIT"];
const ALL_SEVERITIES: Severity[] = ["CRITICAL","HIGH","MEDIUM","LOW","INFO"];

export const IdentityAnalyticsDashboard = ({ persona }: Props) => {
  // ── filter state ──────────────────────────────────────────────────────────
  const [selectedTypes, setSelectedTypes] = useState<Set<AlertType>>(new Set());
  const [selectedSeverities, setSelectedSeverities] = useState<Set<Severity>>(new Set());
  const [selectedCameras, setSelectedCameras] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<EventStatus | "ALL">("ALL");
  const [search, setSearch] = useState("");
  const [kpiFilter, setKpiFilter] = useState<string | null>(null);

  // ── table state ───────────────────────────────────────────────────────────
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [eventStatuses, setEventStatuses] = useState<Record<string, EventStatus>>({});

  // ── ui state ──────────────────────────────────────────────────────────────
  const [analyticsTab, setAnalyticsTab] = useState<Persona>(persona);
  const [typeDropOpen, setTypeDropOpen] = useState(false);
  const [camDropOpen, setCamDropOpen] = useState(false);

  const getStatus = (e: IdentEvent): EventStatus => eventStatuses[e.id] ?? e.status;

  const ack = useCallback((id: string) => setEventStatuses(s => ({ ...s, [id]: "ACKNOWLEDGED" })), []);
  const escalate = useCallback((id: string) => setEventStatuses(s => ({ ...s, [id]: "ESCALATED" })), []);
  const resolve = useCallback((id: string) => setEventStatuses(s => ({ ...s, [id]: "RESOLVED" })), []);

  // ── derived data ──────────────────────────────────────────────────────────
  const kpiCounts = useMemo(() => ({
    total: IDENT_EVENTS.length,
    blacklist: IDENT_EVENTS.filter(e => e.type === "BLACKLIST_MATCH").length,
    unknown: IDENT_EVENTS.filter(e => e.type === "UNKNOWN_PERSON").length,
    accuracy: 97.2,
    unique: 412,
    cameras: 14,
  }), []);

  const filtered = useMemo(() => {
    let events = IDENT_EVENTS.filter(e => {
      if (selectedTypes.size > 0 && !selectedTypes.has(e.type)) return false;
      if (selectedSeverities.size > 0 && !selectedSeverities.has(e.severity)) return false;
      if (selectedCameras.size > 0 && !selectedCameras.has(e.camera_id)) return false;
      if (statusFilter !== "ALL" && getStatus(e) !== statusFilter) return false;
      if (kpiFilter === "blacklist" && e.type !== "BLACKLIST_MATCH") return false;
      if (kpiFilter === "unknown" && e.type !== "UNKNOWN_PERSON") return false;
      if (kpiFilter === "active" && getStatus(e) !== "ACTIVE") return false;
      if (search) {
        const q = search.toLowerCase();
        if (!e.subject.toLowerCase().includes(q) && !e.zone.toLowerCase().includes(q) && !e.subject_id.toLowerCase().includes(q) && !e.camera_id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
    return events;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedTypes, selectedSeverities, selectedCameras, statusFilter, search, kpiFilter, eventStatuses]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageEvents = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const toggleType = (t: AlertType) => {
    setSelectedTypes(s => { const n = new Set(s); n.has(t) ? n.delete(t) : n.add(t); return n; });
    setPage(1);
  };
  const toggleSeverity = (s: Severity) => {
    setSelectedSeverities(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; });
    setPage(1);
  };
  const toggleCamera = (id: string) => {
    setSelectedCameras(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
    setPage(1);
  };
  const clearAll = () => {
    setSelectedTypes(new Set()); setSelectedSeverities(new Set());
    setSelectedCameras(new Set()); setStatusFilter("ALL");
    setSearch(""); setKpiFilter(null); setPage(1);
  };
  const hasFilters = selectedTypes.size > 0 || selectedSeverities.size > 0 || selectedCameras.size > 0 || statusFilter !== "ALL" || search || kpiFilter;

  const handleKpi = (key: string) => {
    setKpiFilter(prev => prev === key ? null : key);
    setPage(1);
  };

  return (
    <div className="space-y-3 pb-6">

      {/* ── Section 1: KPI Cards ─────────────────────────────────────────── */}
      <div className="grid grid-cols-6 gap-3">
        <KPICard
          label="Total Identifications"
          value={kpiCounts.total}
          icon={ScanFace}
          subtitle="50 events loaded today"
          trend="up" trendValue="+8.8%"
          onClick={() => handleKpi("all")}
          active={kpiFilter === "all"}
        />
        <KPICard
          label="Blacklist Alerts"
          value={kpiCounts.blacklist}
          icon={ShieldAlert}
          pulse={kpiCounts.blacklist > 0}
          subtitle={kpiCounts.blacklist > 0 ? "Active security threat" : "No active threats"}
          trend={kpiCounts.blacklist > 0 ? "down" : "flat"} trendValue={`${kpiCounts.blacklist} today`}
          onClick={() => handleKpi("blacklist")}
          active={kpiFilter === "blacklist"}
        />
        <KPICard
          label="Unknown Individuals"
          value={kpiCounts.unknown}
          icon={UserX}
          subtitle="Unidentified detections"
          trend="down" trendValue="-2 vs avg"
          onClick={() => handleKpi("unknown")}
          active={kpiFilter === "unknown"}
        />
        <KPICard
          label="Match Accuracy"
          value={kpiCounts.accuracy}
          unit="%"
          icon={BadgeCheck}
          subtitle="Confidence-weighted avg"
          trend="up" trendValue="+0.4%"
        />
        <KPICard
          label="Unique Visitors"
          value={kpiCounts.unique}
          icon={Users}
          subtitle="De-duplicated individuals"
          trend="up" trendValue="+24"
        />
        <KPICard
          label="Active Cameras"
          value={`${kpiCounts.cameras}/20`}
          icon={Camera}
          subtitle="6 offline / degraded"
          onClick={() => handleKpi("active")}
          active={kpiFilter === "active"}
        />
      </div>

      {/* ── Section 2: Alert Table ───────────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">

        {/* Table header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
          <div className="flex items-center gap-2">
            <Activity className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Alert & Incident Feed</span>
            <span className="text-[9px] font-bold bg-neutral-100 text-neutral-500 rounded-[2px] px-1.5 py-0.5">
              {filtered.length} events
            </span>
            {kpiFilter && (
              <span className="text-[9px] font-bold bg-[#00775B]/10 text-[#00775B] rounded-[2px] px-1.5 py-0.5 flex items-center gap-1">
                Filtered: {kpiFilter}
                <button onClick={() => setKpiFilter(null)}><X className="w-2.5 h-2.5" /></button>
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(filtered)}
              className="flex items-center gap-1 h-6 px-2 rounded-[4px] border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-600 hover:border-neutral-400 transition-colors"
            >
              <Download className="w-3 h-3" /> Export CSV
            </button>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-neutral-50 flex-wrap bg-neutral-50/40">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 w-3 h-3 text-neutral-400" />
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search subject, zone, camera…"
              className="h-7 pl-6 pr-3 rounded-[4px] border border-neutral-200 text-[11px] bg-white placeholder:text-neutral-400 focus:outline-none focus:border-[#00775B] w-48"
            />
          </div>

          {/* Alert type dropdown */}
          <div className="relative">
            <button
              onClick={() => setTypeDropOpen(o => !o)}
              className={cn(
                "flex items-center gap-1 h-7 px-2 rounded-[4px] border text-[10px] font-semibold transition-colors",
                selectedTypes.size > 0 ? "bg-[#00775B] text-white border-[#00775B]" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
              )}
            >
              <Filter className="w-3 h-3" />
              Type {selectedTypes.size > 0 && `(${selectedTypes.size})`}
              <ChevronDown className="w-3 h-3" />
            </button>
            {typeDropOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-[4px] shadow-md z-30 w-44 py-1">
                {ALL_TYPES.map(t => {
                  const cfg = ALERT_TYPE_CFG[t];
                  return (
                    <button
                      key={t}
                      onClick={() => toggleType(t)}
                      className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 text-[10px] text-left"
                    >
                      <span className={cn("w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center shrink-0",
                        selectedTypes.has(t) ? "bg-[#00775B] border-[#00775B]" : "border-neutral-300")}>
                        {selectedTypes.has(t) && <span className="text-white text-[8px]">✓</span>}
                      </span>
                      <span className={cn("font-bold", cfg.color)}>{cfg.label}</span>
                    </button>
                  );
                })}
                <button onClick={() => setTypeDropOpen(false)} className="w-full px-3 py-1.5 text-[10px] text-[#00775B] font-bold text-left border-t border-neutral-100 mt-1">Done</button>
              </div>
            )}
          </div>

          {/* Severity pills */}
          <div className="flex items-center gap-1">
            {ALL_SEVERITIES.map(s => (
              <button
                key={s}
                onClick={() => toggleSeverity(s)}
                className={cn(
                  "h-5 px-1.5 rounded-[2px] text-[9px] font-bold transition-colors",
                  selectedSeverities.has(s) ? SEVERITY_CFG[s].badge : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                )}
              >
                {s}
              </button>
            ))}
          </div>

          {/* Camera dropdown */}
          <div className="relative">
            <button
              onClick={() => setCamDropOpen(o => !o)}
              className={cn(
                "flex items-center gap-1 h-7 px-2 rounded-[4px] border text-[10px] font-semibold transition-colors",
                selectedCameras.size > 0 ? "bg-[#00775B] text-white border-[#00775B]" : "bg-white text-neutral-600 border-neutral-200 hover:border-neutral-400"
              )}
            >
              <Camera className="w-3 h-3" />
              Camera {selectedCameras.size > 0 && `(${selectedCameras.size})`}
              <ChevronDown className="w-3 h-3" />
            </button>
            {camDropOpen && (
              <div className="absolute top-full left-0 mt-1 bg-white border border-neutral-200 rounded-[4px] shadow-md z-30 w-52 py-1 max-h-56 overflow-y-auto">
                {CAMERAS.map(c => (
                  <button
                    key={c.id}
                    onClick={() => toggleCamera(c.id)}
                    className="w-full flex items-center gap-2 px-3 py-1.5 hover:bg-neutral-50 text-[10px] text-left"
                  >
                    <span className={cn("w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center shrink-0",
                      selectedCameras.has(c.id) ? "bg-[#00775B] border-[#00775B]" : "border-neutral-300")}>
                      {selectedCameras.has(c.id) && <span className="text-white text-[8px]">✓</span>}
                    </span>
                    <span className="font-semibold text-neutral-700">{c.id}</span>
                    <span className="text-neutral-400 truncate">{c.zone}</span>
                  </button>
                ))}
                <button onClick={() => setCamDropOpen(false)} className="w-full px-3 py-1.5 text-[10px] text-[#00775B] font-bold text-left border-t border-neutral-100 mt-1">Done</button>
              </div>
            )}
          </div>

          {/* Status toggle */}
          <div className="flex items-center gap-1">
            {(["ALL","ACTIVE","ACKNOWLEDGED","ESCALATED","RESOLVED"] as const).map(s => (
              <button
                key={s}
                onClick={() => { setStatusFilter(s); setPage(1); }}
                className={cn(
                  "h-5 px-1.5 rounded-[2px] text-[9px] font-bold transition-colors",
                  statusFilter === s ? "bg-[#00775B] text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                )}
              >
                {s === "ALL" ? "All" : s === "ACKNOWLEDGED" ? "Ack'd" : s.charAt(0) + s.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {hasFilters && (
            <button onClick={clearAll} className="flex items-center gap-1 h-5 px-1.5 rounded-[2px] text-[9px] font-bold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
              <X className="w-2.5 h-2.5" /> Clear
            </button>
          )}
        </div>

        {/* Table */}
        {(() => {
          const identColumns: DataGridColumn<IdentEvent>[] = [
            {
              key: "capture",
              header: "Capture",
              width: "60px",
              render: (event) => <EventThumb event={event} />,
            },
            {
              key: "type",
              header: "Type",
              width: "110px",
              render: (event) => <TypeBadge type={event.type} />,
            },
            {
              key: "severity",
              header: "Severity",
              width: "90px",
              render: (event) => {
                const scfg = SEVERITY_CFG[event.severity];
                const status = getStatus(event);
                return (
                  <div>
                    <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide", scfg.badge)}>
                      {event.severity}
                    </span>
                    {status === "ACTIVE" && event.severity !== "LOW" && event.severity !== "INFO" && (
                      <div className="flex items-center gap-1 mt-1">
                        <span className={cn("w-1.5 h-1.5 rounded-full animate-pulse", scfg.dot)} />
                        <span className="text-[8px] text-neutral-500 font-bold">LIVE</span>
                      </div>
                    )}
                  </div>
                );
              },
            },
            {
              key: "nameId",
              header: "Name / ID",
              width: "1fr",
              render: (event, hovered) => (
                <div>
                  <InterCell hovered={hovered} isPrimary fontSize={11}>{event.subject}</InterCell>
                  <div className="mt-0.5">
                    <MonoCell hovered={hovered} fontSize={9} color="#94A3B8">{event.subject_id}</MonoCell>
                  </div>
                </div>
              ),
            },
            {
              key: "location",
              header: "Location",
              width: "1fr",
              render: (event, hovered) => (
                <div>
                  <InterCell hovered={hovered} isPrimary fontSize={11}>{event.zone}</InterCell>
                  <div className="text-[9px] text-neutral-400">{event.camera_id}</div>
                </div>
              ),
            },
            {
              key: "time",
              header: "Time",
              width: "96px",
              render: (event, hovered) => (
                <MonoCell hovered={hovered} fontSize={10} color="#94A3B8">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {event.timestamp}
                  </span>
                </MonoCell>
              ),
            },
            {
              key: "confidence",
              header: "Confidence",
              width: "110px",
              render: (event) => <ConfBar value={event.confidence} />,
            },
            {
              key: "status",
              header: "Status",
              width: "90px",
              render: (event) => {
                const status = getStatus(event);
                const statusMap: Record<EventStatus, string> = {
                  ACTIVE: "active",
                  ACKNOWLEDGED: "info",
                  ESCALATED: "critical",
                  RESOLVED: "resolved",
                };
                return <StatusCapsule status={statusMap[status]} label={STATUS_CFG[status].label} />;
              },
            },
            {
              key: "expand",
              header: "",
              width: "36px",
              align: "right",
              render: (event) => expandedId === event.id
                ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400" />
                : <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />,
            },
          ];

          const expandedEvent = expandedId ? pageEvents.find(e => e.id === expandedId) : null;

          return (
            <div>
              <DataGrid<IdentEvent>
                columns={identColumns}
                data={pageEvents}
                getRowId={(row) => row.id}
                onRowClick={(event) => setExpandedId(expandedId === event.id ? null : event.id)}
                emptyState="No events match the current filters"
              />
              {expandedEvent && (
                <div className="border-t border-[#00775B]/20 bg-neutral-50/70">
                  <ExpandedRow
                    event={expandedEvent}
                    onAck={() => ack(expandedEvent.id)}
                    onEscalate={() => escalate(expandedEvent.id)}
                    onResolve={() => resolve(expandedEvent.id)}
                  />
                </div>
              )}
            </div>
          );
        })()}

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2.5 border-t border-neutral-50 bg-neutral-50/40">
          <span className="text-[10px] text-neutral-400">
            Showing {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length} events
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-6 h-6 rounded-[4px] border border-neutral-200 bg-white flex items-center justify-center disabled:opacity-40 hover:border-neutral-400 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "w-6 h-6 rounded-[4px] text-[10px] font-bold transition-colors",
                  page === p ? "bg-[#00775B] text-white" : "border border-neutral-200 bg-white text-neutral-600 hover:border-neutral-400"
                )}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-6 h-6 rounded-[4px] border border-neutral-200 bg-white flex items-center justify-center disabled:opacity-40 hover:border-neutral-400 transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* ── Section 3: Analytics Panel ───────────────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Analytics</span>
          </div>
          <div className="flex items-center gap-1">
            {(["monitoring","manager","director"] as Persona[]).map(p => (
              <button
                key={p}
                onClick={() => setAnalyticsTab(p)}
                className={cn(
                  "h-6 px-2.5 rounded-[4px] text-[10px] font-bold capitalize transition-colors",
                  analyticsTab === p ? "bg-[#00775B] text-white" : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          {analyticsTab === "monitoring" && <MonitoringAnalytics />}
          {analyticsTab === "manager" && <ManagerAnalytics />}
          {analyticsTab === "director" && <DirectorAnalytics />}
        </div>
      </div>
    </div>
  );
};
