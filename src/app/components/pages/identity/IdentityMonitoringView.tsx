import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/app/lib/utils";
import {
  ShieldAlert, UserX, Eye, Clock, Radio, Lock, UserPlus,
  Shield, Ban, Navigation2, Fingerprint, ChevronDown,
  CheckCircle2, X, AlertTriangle, Star, Camera,
  Zap, BookmarkPlus, MapPin, Activity, Upload, Mail,
  Users, Plus, ChevronRight,
} from "lucide-react";
import { IdentityEvidenceMedia } from "./components/shared/IdentityEvidenceMedia";
import { SlidePanel } from "./components/panels/SlidePanel";
import { IDENTITY_LIVE_STATUS, IDENTITY_ZONES, UNKNOWN_TRACKERS } from "./data/mockData";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

// ─── Types ────────────────────────────────────────────────────────────────────
type MatchStatus = "BLACKLIST" | "UNKNOWN" | "WHITELIST" | "AUTHORIZED" | "VIP" | "UNREGISTERED" | "BOLO";
type FeedFilter  = "all" | "threats" | "unknowns" | "vip" | "authorized";

interface FeedPerson {
  id: string;
  identType: "FACE" | "PLATE";
  status: MatchStatus;
  displayName: string;
  subLabel?: string;
  camera: string; cameraId: string; zone: string;
  time: string;
  confidence?: number;
  dwell?: number;
  recurringDays?: number;
  imageSrc?: string;
  plateText?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  department?: string; employeeId?: string;
  enrollDate?: string; totalAppearances?: number;
  vehicleDesc?: string;
}

interface JourneyStop {
  camera: string; zone: string; time: string;
  dwellText: string; isCurrent?: boolean; alertNote?: string;
  linkedPlate?: string;
}

// ─── FR Feed data ─────────────────────────────────────────────────────────────
const FR_PEOPLE: FeedPerson[] = [
  {
    id: "f1", identType: "FACE", status: "BLACKLIST",
    displayName: "Subject BL-003", subLabel: "Confirmed blacklist — immediate action required",
    camera: "CAM-LB-01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "14:31:22", confidence: 94.7, severity: "CRITICAL",
    imageSrc: "https://i.pravatar.cc/160?u=bl003-subjectx",
  },
  {
    id: "f2", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #88", subLabel: "Action required · High dwell",
    camera: "CAM-SE-01", cameraId: "cam_south_entrance", zone: "South Entrance",
    time: "14:30:55", dwell: 252, recurringDays: 4, severity: "HIGH",
    imageSrc: "https://i.pravatar.cc/160?u=unk088-recurringz",
  },
  {
    id: "f3", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #134", subLabel: "Action required · Garage area",
    camera: "CAM-GB-01", cameraId: "cam_garage_entry_b", zone: "Garage Entry B",
    time: "14:28:45", dwell: 88, recurringDays: 2, severity: "MEDIUM",
    imageSrc: "https://i.pravatar.cc/160?u=unk134-garagek",
  },
  {
    id: "f4", identType: "FACE", status: "VIP",
    displayName: "Executive VIP-007", subLabel: "C-Suite · Escort protocol suggested",
    camera: "CAM-NE-01", cameraId: "cam_north_entrance", zone: "North Entrance",
    time: "14:31:10", confidence: 97.3, severity: "LOW",
    imageSrc: "https://i.pravatar.cc/160?u=vip007-exec99",
  },
  {
    id: "f5", identType: "FACE", status: "WHITELIST",
    displayName: "John Smith", subLabel: "Engineering · L3 Access · Authorised",
    camera: "CAM-LB-01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "14:29:45", confidence: 96.1,
    imageSrc: "https://i.pravatar.cc/160?u=john-smith-4821",
    department: "Engineering", employeeId: "EMP-4821",
    enrollDate: "2025-08-14", totalAppearances: 312,
  },
  {
    id: "f6", identType: "FACE", status: "WHITELIST",
    displayName: "Sarah Johnson", subLabel: "Human Resources · L2 Access",
    camera: "CAM-RC-01", cameraId: "cam_reception", zone: "Reception",
    time: "14:27:14", confidence: 95.4,
    imageSrc: "https://i.pravatar.cc/160?u=sarah-johnson-2198",
    department: "Human Resources", employeeId: "EMP-2198",
    enrollDate: "2024-03-20", totalAppearances: 187,
  },
];

// ─── LPR Feed data ────────────────────────────────────────────────────────────
const LPR_PEOPLE: FeedPerson[] = [
  {
    id: "p1", identType: "PLATE", status: "BOLO",
    displayName: "RJ-5588-BR", subLabel: "BOLO match — stolen vehicle, police notified",
    camera: "CAM-GA-02", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:28:30", confidence: 91.0, severity: "CRITICAL",
    plateText: "RJ-5588-BR", vehicleDesc: "Black Toyota Innova",
  },
  {
    id: "p2", identType: "PLATE", status: "UNREGISTERED",
    displayName: "UP80MN1123", subLabel: "Action required · Entry blocked",
    camera: "CAM-GA-01", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:31:06", confidence: 91.0, recurringDays: 3, severity: "HIGH",
    plateText: "UP80MN1123", vehicleDesc: "Silver Maruti Swift",
  },
  {
    id: "p3", identType: "PLATE", status: "UNREGISTERED",
    displayName: "KL-3312-MH", subLabel: "Action required · No permit",
    camera: "CAM-PL-01", cameraId: "cam_parking_lot", zone: "Parking Lot A",
    time: "14:25:01", confidence: 89.0, severity: "MEDIUM",
    plateText: "KL-3312-MH", vehicleDesc: "Red Honda City",
  },
  {
    id: "p4", identType: "PLATE", status: "VIP",
    displayName: "MH-0001-GJ", subLabel: "Executive · Valet protocol suggested",
    camera: "CAM-ME-01", cameraId: "cam_main_entrance", zone: "Main Entrance",
    time: "14:31:10", confidence: 98.5, severity: "LOW",
    plateText: "MH-0001-GJ", vehicleDesc: "Black Mercedes GLE",
  },
  {
    id: "p5", identType: "PLATE", status: "AUTHORIZED",
    displayName: "KA05MJ4421", subLabel: "White Honda City · Rahul Sharma · Finance",
    camera: "CAM-GA-01", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:26:05", confidence: 98.2,
    plateText: "KA05MJ4421", vehicleDesc: "White Honda City",
    department: "Finance", employeeId: "EMP-2231",
    enrollDate: "2024-11-02", totalAppearances: 88,
  },
  {
    id: "p6", identType: "PLATE", status: "AUTHORIZED",
    displayName: "DL-7723-UP", subLabel: "Blue Toyota Camry · Priya Nair · HR",
    camera: "CAM-PL-02", cameraId: "cam_parking_lot_b", zone: "Parking Lot B",
    time: "14:22:45", confidence: 96.1,
    plateText: "DL-7723-UP", vehicleDesc: "Blue Toyota Camry",
    department: "Human Resources", employeeId: "EMP-3341",
    enrollDate: "2024-05-10", totalAppearances: 134,
  },
];

// ─── Journey data ─────────────────────────────────────────────────────────────
const FR_JOURNEY: Record<string, JourneyStop[]> = {
  f1: [
    { camera: "CAM-PG-01", zone: "Parking Garage",  time: "08:52", dwellText: "4s",   linkedPlate: "KA05MJ4421" },
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "08:58", dwellText: "42s",  alertNote: "Unknown alert (resolved)" },
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:11", dwellText: "2s" },
    { camera: "CAM-LB-01", zone: "Main Lobby",      time: "14:31", dwellText: "active", isCurrent: true, alertNote: "BLACKLIST ACTIVE" },
  ],
  f2: [
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "08:41", dwellText: "31s" },
    { camera: "CAM-LB-01", zone: "Main Lobby",      time: "09:05", dwellText: "18s" },
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "14:30", dwellText: "4m 12s+", isCurrent: true, alertNote: "Dwell time growing" },
  ],
  f3: [
    { camera: "CAM-GB-01", zone: "Garage Entry B",  time: "09:08", dwellText: "22s" },
    { camera: "CAM-GB-01", zone: "Garage Entry B",  time: "14:28", dwellText: "1m 28s", isCurrent: true, alertNote: "Recurring unknown" },
  ],
  f4: [
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:31", dwellText: "active", isCurrent: true, alertNote: "VIP — escort recommended" },
  ],
  f5: [
    { camera: "CAM-PG-01", zone: "Parking Garage",  time: "08:52", dwellText: "3s",   linkedPlate: "KA05MJ4421" },
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:11", dwellText: "2s" },
    { camera: "CAM-LB-01", zone: "Main Lobby",      time: "14:29", dwellText: "active", isCurrent: true },
  ],
  f6: [
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:06", dwellText: "2s" },
    { camera: "CAM-RC-01", zone: "Reception",       time: "14:27", dwellText: "active", isCurrent: true },
  ],
};

const LPR_JOURNEY: Record<string, JourneyStop[]> = {
  p1: [
    { camera: "CAM-ME-01", zone: "Main Entrance",   time: "14:10", dwellText: "3s",   alertNote: "First appearance" },
    { camera: "CAM-GA-02", zone: "Garage Entry A",  time: "14:28", dwellText: "blocked", isCurrent: true, alertNote: "BOLO MATCH — entry denied" },
  ],
  p2: [
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:05", dwellText: "blocked",  alertNote: "1st attempt blocked" },
    { camera: "CAM-PL-01", zone: "Parking Lot A",   time: "14:18", dwellText: "circling", alertNote: "Observed circling" },
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:31", dwellText: "blocked",  isCurrent: true, alertNote: "3rd attempt — escalate" },
  ],
  p3: [
    { camera: "CAM-PL-01", zone: "Parking Lot A",   time: "14:25", dwellText: "parked", isCurrent: true, alertNote: "No permit — notify owner" },
  ],
  p4: [
    { camera: "CAM-ME-01", zone: "Main Entrance",   time: "14:31", dwellText: "active", isCurrent: true, alertNote: "VIP — valet suggested" },
  ],
  p5: [
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:26", dwellText: "authorised", isCurrent: true, alertNote: "Entry authorised" },
  ],
  p6: [
    { camera: "CAM-PL-02", zone: "Parking Lot B",   time: "14:22", dwellText: "parked", isCurrent: true, alertNote: "Registered permit" },
  ],
};

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<MatchStatus, {
  label: string; bg: string; text: string;
  borderL: string; rowBg: string; dotColor: string; priority: number;
  headerBg: string; headerBorder: string;
}> = {
  BLACKLIST:    { label: "Blacklist",    bg: "bg-red-600",     text: "text-white",      borderL: "border-l-red-500",    rowBg: "bg-red-50/50",    dotColor: "bg-red-500",    priority: 0, headerBg: "bg-red-600",     headerBorder: "border-red-700" },
  BOLO:         { label: "BOLO",        bg: "bg-red-600",     text: "text-white",      borderL: "border-l-red-500",    rowBg: "bg-red-50/50",    dotColor: "bg-red-500",    priority: 0, headerBg: "bg-red-600",     headerBorder: "border-red-700" },
  UNKNOWN:      { label: "Unknown",     bg: "bg-amber-500",   text: "text-white",      borderL: "border-l-amber-400",  rowBg: "bg-amber-50/40",  dotColor: "bg-amber-400",  priority: 1, headerBg: "bg-amber-500",   headerBorder: "border-amber-600" },
  UNREGISTERED: { label: "Unregistered",bg: "bg-orange-500",  text: "text-white",      borderL: "border-l-orange-400", rowBg: "bg-orange-50/30", dotColor: "bg-orange-400", priority: 1, headerBg: "bg-orange-500",  headerBorder: "border-orange-600" },
  VIP:          { label: "VIP",         bg: "bg-yellow-500",  text: "text-yellow-900", borderL: "border-l-yellow-400", rowBg: "bg-yellow-50/20", dotColor: "bg-yellow-400", priority: 2, headerBg: "bg-yellow-500",  headerBorder: "border-yellow-600" },
  WHITELIST:    { label: "Authorised",  bg: "bg-emerald-600", text: "text-white",      borderL: "border-l-emerald-400",rowBg: "bg-white",        dotColor: "bg-emerald-500",priority: 3, headerBg: "bg-emerald-700", headerBorder: "border-emerald-800" },
  AUTHORIZED:   { label: "Authorised",  bg: "bg-emerald-600", text: "text-white",      borderL: "border-l-emerald-400",rowBg: "bg-white",        dotColor: "bg-emerald-500",priority: 3, headerBg: "bg-emerald-700", headerBorder: "border-emerald-800" },
};

function fmtDwell(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

type ActionDef = {
  key: string; label: string; confirmMsg: string; successMsg: string;
  icon?: React.ElementType; variant: "danger" | "primary" | "default";
};

type DrawerMode = { kind: "action"; action: ActionDef } | { kind: "watchlist" };

// ─── Watchlist Form (inside ActionDrawer) ──────────────────────────────────────
const FR_REASONS = [
  "Security Threat", "Terminated Employee", "Banned Visitor",
  "Shoplifting Suspect", "Previous Incident", "VIP Registration",
  "Unauthorised Access", "Custom Reason",
];
const LPR_REASONS = [
  "Stolen Vehicle", "No Access Permit", "Expired Permit",
  "BOLO Vehicle", "Parking Violation", "Suspicious Activity",
  "Blacklisted Owner", "Custom Reason",
];
const WL_GROUPS = [
  "Security Team", "Operations Manager", "Site Supervisor",
  "Executive Team", "Dispatch Center",
];

function WatchlistForm({
  isLPR, person, onCancel, onSubmit,
}: {
  isLPR: boolean; person: FeedPerson;
  onCancel: () => void; onSubmit: () => void;
}) {
  const reasons = isLPR ? LPR_REASONS : FR_REASONS;
  const frStatuses  = ["BLACKLIST", "BOLO", "VIP", "WATCH"] as const;
  const lprStatuses = ["BLACKLIST", "BOLO", "PERMITTED", "WATCH"] as const;
  const statuses = isLPR ? lprStatuses : frStatuses;
  const statusStyle: Record<string, string> = {
    BLACKLIST: "bg-red-600 border-red-600 text-white",
    BOLO:      "bg-red-500 border-red-500 text-white",
    VIP:       "bg-yellow-500 border-yellow-500 text-yellow-900",
    PERMITTED: "bg-emerald-600 border-emerald-600 text-white",
    WATCH:     "bg-amber-500 border-amber-500 text-white",
  };

  const [name,        setName]        = useState(isLPR ? (person.plateText ?? person.displayName) : person.displayName);
  const [vehicleDesc, setVehicleDesc] = useState(person.vehicleDesc ?? "");
  const [ownerName,   setOwnerName]   = useState("");
  const [wlStatus,    setWlStatus]    = useState<string>("BLACKLIST");
  const [severity,    setSeverity]    = useState<"Critical" | "High" | "Medium">("High");
  const [accessLevel, setAccessLevel] = useState("None");
  const [reason,      setReason]      = useState("");
  const [reasonOpen,  setReasonOpen]  = useState(false);
  const [watchFrom,   setWatchFrom]   = useState("");
  const [watchUntil,  setWatchUntil]  = useState("");
  const [caseRef,     setCaseRef]     = useState("");
  const [notes,       setNotes]       = useState("");
  const [email,       setEmail]       = useState("");
  const [groups,      setGroups]      = useState<string[]>([]);

  const toggleGroup = (g: string) =>
    setGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const inputCls = "w-full h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 focus:outline-none focus:border-[#00775B] placeholder:text-neutral-300";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-1";

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

        {/* ── Identity info ─────────────────────────── */}
        {isLPR ? (
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Plate Number <span className="text-red-500">*</span></label>
                <input value={name} onChange={e => setName(e.target.value)}
                  placeholder="e.g. KA05MJ4421" className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Vehicle Description</label>
                <input value={vehicleDesc} onChange={e => setVehicleDesc(e.target.value)}
                  placeholder="e.g. Black Toyota Innova" className={inputCls} />
              </div>
            </div>
            <div>
              <label className={labelCls}>Owner Name <span className="text-neutral-300">(optional)</span></label>
              <input value={ownerName} onChange={e => setOwnerName(e.target.value)}
                placeholder="e.g. Full name of registered owner" className={inputCls} />
            </div>
          </>
        ) : (
          <>
            <div className="border-2 border-dashed border-neutral-200 rounded-[8px] p-4 text-center hover:border-[#00775B]/40 transition-colors cursor-pointer bg-neutral-50">
              <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-1.5" />
              <p className="text-[11px] text-neutral-500">
                <span className="font-semibold text-[#00775B]">Upload reference photo</span> — drag & drop or click
              </p>
              <p className="text-[9px] text-neutral-400 mt-0.5">PNG, JPG up to 10MB · Used for FR matching</p>
            </div>
            <div>
              <label className={labelCls}>Display Name <span className="text-red-500">*</span></label>
              <input value={name} onChange={e => setName(e.target.value)}
                placeholder="e.g. John Doe" className={inputCls} />
            </div>
          </>
        )}

        {/* ── Status + Severity ─────────────────────── */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className={labelCls}>Watchlist Status</label>
            <div className="flex flex-wrap gap-1.5">
              {statuses.map(s => (
                <button key={s} onClick={() => setWlStatus(s)}
                  className={cn(
                    "h-7 px-2.5 rounded-[5px] text-[9px] font-bold border transition-all",
                    wlStatus === s ? (statusStyle[s] ?? "bg-neutral-700 text-white border-neutral-700") : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"
                  )}
                >{s}</button>
              ))}
            </div>
          </div>
          <div>
            <label className={labelCls}>Alert Severity</label>
            <div className="flex gap-1.5">
              {(["Critical", "High", "Medium"] as const).map(s => (
                <button key={s} onClick={() => setSeverity(s)}
                  className={cn(
                    "flex-1 h-7 rounded-[5px] text-[9px] font-bold border transition-all",
                    severity === s
                      ? s === "Critical" ? "bg-red-600 border-red-600 text-white"
                        : s === "High"   ? "bg-amber-500 border-amber-500 text-white"
                        : "bg-blue-500 border-blue-500 text-white"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"
                  )}
                >{s}</button>
              ))}
            </div>
          </div>
        </div>

        {/* LPR: Access Permit */}
        {isLPR && (
          <div>
            <label className={labelCls}>Access Permit</label>
            <div className="flex gap-1.5">
              {(["Valid", "Expired", "None", "Visitor"] as const).map(lvl => (
                <button key={lvl} onClick={() => setAccessLevel(lvl)}
                  className={cn(
                    "flex-1 h-7 rounded-[5px] text-[9px] font-bold border transition-all",
                    accessLevel === lvl
                      ? lvl === "Valid"    ? "bg-emerald-600 border-emerald-600 text-white"
                        : lvl === "Expired" ? "bg-amber-500 border-amber-500 text-white"
                        : lvl === "Visitor" ? "bg-blue-500 border-blue-500 text-white"
                        : "bg-neutral-700 border-neutral-700 text-white"
                      : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"
                  )}
                >{lvl}</button>
              ))}
            </div>
          </div>
        )}

        {/* ── Flag Reason ───────────────────────────── */}
        <div className="relative">
          <label className={labelCls}>Flag Reason <span className="text-red-500">*</span></label>
          <button
            onClick={() => setReasonOpen(v => !v)}
            className="w-full h-8 px-3 flex items-center justify-between rounded-[6px] border border-neutral-200 text-[12px] text-left focus:outline-none hover:border-neutral-300 transition-colors"
          >
            <span className={reason ? "text-neutral-800" : "text-neutral-300"}>{reason || "Select a reason"}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform", reasonOpen && "rotate-180")} />
          </button>
          {reasonOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-[6px] border border-neutral-200 bg-white shadow-lg overflow-hidden">
              {reasons.map(r => (
                <button key={r} onClick={() => { setReason(r); setReasonOpen(false); }}
                  className={cn("w-full px-3 py-2 text-left text-[12px] hover:bg-[#E5FFF9] transition-colors",
                    reason === r ? "text-[#00775B] font-semibold bg-[#E5FFF9]" : "text-neutral-700"
                  )}>{r}</button>
              ))}
            </div>
          )}
        </div>

        {/* ── Watch Period + Case Ref ───────────────── */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className={labelCls}>Watch From</label>
            <input type="date" value={watchFrom} onChange={e => setWatchFrom(e.target.value)}
              className="w-full h-8 px-2 rounded-[6px] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none focus:border-[#00775B]" />
          </div>
          <div>
            <label className={labelCls}>Watch Until</label>
            <input type="date" value={watchUntil} onChange={e => setWatchUntil(e.target.value)}
              className="w-full h-8 px-2 rounded-[6px] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none focus:border-[#00775B]" />
          </div>
          <div>
            <label className={labelCls}>Case Ref. <span className="text-neutral-300">(opt)</span></label>
            <input value={caseRef} onChange={e => setCaseRef(e.target.value)}
              placeholder="e.g. INC-2024-001"
              className="w-full h-8 px-2 rounded-[6px] border border-neutral-200 text-[11px] text-neutral-800 focus:outline-none focus:border-[#00775B] placeholder:text-neutral-300" />
          </div>
        </div>

        {/* ── Notes ────────────────────────────────── */}
        <div>
          <label className={labelCls}>Notes / Instructions</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder="e.g. Do not approach — contact supervisor immediately."
            className="w-full px-3 py-2 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 focus:outline-none focus:border-[#00775B] placeholder:text-neutral-300 resize-none"
          />
        </div>

        {/* ── Notifications ─────────────────────────── */}
        <div className="border-t border-neutral-100 pt-3 space-y-3">
          <p className={labelCls}><Mail className="w-3 h-3 inline mr-1" />Alert Notifications</p>
          <input value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Recipient emails (comma-separated)"
            className={inputCls} />
          <div>
            <p className="text-[9px] font-bold uppercase tracking-wide text-neutral-400 mb-1.5">
              <Users className="w-3 h-3 inline mr-1" />Notify Groups
            </p>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              {WL_GROUPS.map(g => (
                <label key={g} className="flex items-center gap-2 cursor-pointer py-1 hover:text-neutral-900">
                  <input type="checkbox" checked={groups.includes(g)} onChange={() => toggleGroup(g)}
                    className="w-3 h-3 accent-[#00775B] rounded" />
                  <span className="text-[11px] text-neutral-700">{g}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 px-5 py-3.5 flex items-center justify-between shrink-0">
        <p className="text-[10px] text-neutral-400">Alerts activate immediately upon save</p>
        <div className="flex items-center gap-2.5">
          <button onClick={onCancel}
            className="h-9 px-5 rounded-[6px] border border-neutral-200 text-[12px] font-bold text-neutral-600 hover:border-neutral-300 transition-colors"
          >Cancel</button>
          <button onClick={onSubmit}
            className="h-9 px-6 rounded-[6px] bg-[#00775B] text-[12px] font-bold text-white hover:bg-[#006349] transition-colors inline-flex items-center gap-1.5"
          >
            {isLPR ? "Save Vehicle" : "Save Person"}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </>
  );
}

// ─── Action Modal — centered popup over the entity panel ──────────────────────
function ActionDrawer({
  mode, isThreat, isLPR, person, onClose,
}: {
  mode: DrawerMode | null; isThreat: boolean; isLPR: boolean;
  person: FeedPerson; onClose: () => void;
}) {
  const [miniConfirm, setMiniConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");

  // Reset state when mode changes
  useEffect(() => { setDone(false); setDoneMsg(""); setMiniConfirm(false); }, [mode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && mode) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mode, onClose]);

  const action   = mode?.kind === "action" ? mode.action : null;
  const isWL     = mode?.kind === "watchlist";
  const isDanger = isThreat || action?.variant === "danger";

  const handleExecute = () => {
    if (action) { setDoneMsg(action.successMsg); setDone(true); setMiniConfirm(false); setTimeout(onClose, 2200); }
  };
  const handleWLSubmit = () => {
    setDoneMsg(isLPR ? "Vehicle added to watchlist — alerts enabled" : "Person added to watchlist — alerts enabled");
    setDone(true);
    setTimeout(onClose, 2200);
  };

  const modalTitle = isWL
    ? (isLPR ? "Add / Manage Vehicle" : "Add / Manage Flagged Person")
    : (action?.label ?? "");

  if (!mode) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div
        className={cn(
          "fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden",
          "max-w-[95vw] max-h-[90vh]",
          isWL ? "w-[560px]" : "w-[460px]"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isWL ? "bg-[#00775B]/10" : isDanger ? "bg-red-100" : "bg-[#00775B]/10"
            )}>
              {isWL
                ? <Plus className="w-3.5 h-3.5 text-[#00775B]" />
                : action?.icon
                ? <action.icon className={cn("w-3.5 h-3.5", isDanger ? "text-red-600" : "text-[#00775B]")} />
                : null}
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-neutral-900 leading-tight">{modalTitle}</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{person.displayName} · {person.zone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {done ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[200px]">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-[14px] font-bold text-neutral-800">{doneMsg}</p>
              <p className="text-[11px] text-neutral-400">Closing automatically…</p>
            </div>

          ) : isWL ? (
            <WatchlistForm isLPR={isLPR} person={person} onCancel={onClose} onSubmit={handleWLSubmit} />

          ) : (
            <div className="px-6 py-6 space-y-4">
              {/* Confirm message */}
              <p className="text-[14px] text-neutral-700 leading-relaxed">{action?.confirmMsg}</p>

              {/* Subject summary */}
              <div className="flex items-center gap-3 px-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-[8px]">
                <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                  <img
                    src={person.imageSrc ?? `https://i.pravatar.cc/64?u=${person.id}`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-neutral-800 truncate">{person.displayName}</p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">{person.zone} · {person.camera}</p>
                </div>
              </div>

              {/* Danger warning */}
              {isDanger && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                    Critical security action — this will be logged and is irreversible once executed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer — action buttons (non-watchlist, non-done) */}
        {!done && !isWL && action && (
          <div className="border-t border-neutral-100 px-5 py-3.5 flex items-center justify-end gap-2.5 shrink-0 bg-white">
            <button
              onClick={onClose}
              className="h-9 px-5 rounded-[6px] border border-neutral-200 text-[12px] font-bold text-neutral-600 hover:border-neutral-300 transition-colors"
            >Cancel</button>
            <button
              onClick={() => isDanger ? setMiniConfirm(true) : handleExecute()}
              className={cn(
                "h-9 px-6 rounded-[6px] text-[12px] font-bold text-white transition-colors inline-flex items-center gap-1.5",
                isDanger ? "bg-red-600 hover:bg-red-700" : "bg-[#00775B] hover:bg-[#006349]"
              )}
            >
              Confirm
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Mini-confirm modal (sits above the action modal) ── */}
      {miniConfirm && action && (
        <>
          <div className="fixed inset-0 z-[1100] bg-black/40" onClick={() => setMiniConfirm(false)} />
          <div
            className="fixed z-[1101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-white rounded-[12px] shadow-2xl p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-[13px] font-black text-neutral-900">Are you sure?</p>
                <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{action.confirmMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMiniConfirm(false)}
                className="flex-1 h-9 rounded-[6px] border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:border-neutral-300 transition-colors"
              >Cancel</button>
              <button
                onClick={handleExecute}
                className="flex-1 h-9 rounded-[6px] bg-red-600 text-[11px] font-bold text-white hover:bg-red-700 transition-colors"
              >Yes, proceed</button>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}

// ─── Notify section ───────────────────────────────────────────────────────────
function ActionsSection() {
  const [showGroup, setShowGroup]       = useState(false);
  const [selected, setSelected]         = useState<string[]>([]);
  const [notified, setNotified]         = useState<"admin" | "group" | null>(null);

  const toggleGroup = (g: string) =>
    setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const handleNotifyAdmin = () => {
    setNotified("admin");
    setTimeout(() => setNotified(null), 3000);
  };

  const handleSendGroup = () => {
    if (!selected.length) return;
    setNotified("group");
    setShowGroup(false);
    setSelected([]);
    setTimeout(() => setNotified(null), 3000);
  };

  return (
    <div className="border-t border-neutral-100 bg-neutral-50/40">

      <div className="px-5 py-4 space-y-2">

        {/* ── Notify section ───────────────────────────────────────────────── */}
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2.5">Notify</p>

          <div className="flex gap-2 flex-wrap">
            {/* Notify Admin */}
            <button
              onClick={handleNotifyAdmin}
              className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[6px] text-[11px] font-bold border border-neutral-200 bg-white text-neutral-600 hover:border-[#00775B]/40 hover:text-[#00775B] transition-all"
            >
              <Mail className="w-3.5 h-3.5" />
              Notify Admin
            </button>

            {/* Notify Group toggle */}
            <button
              onClick={() => setShowGroup(v => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 h-8 px-3.5 rounded-[6px] text-[11px] font-bold border transition-all",
                showGroup
                  ? "border-[#00775B] bg-[#E5FFF9] text-[#00775B]"
                  : "border-neutral-200 bg-white text-neutral-600 hover:border-[#00775B]/40 hover:text-[#00775B]"
              )}
            >
              <Users className="w-3.5 h-3.5" />
              Notify Group
              <ChevronDown className={cn("w-3 h-3 transition-transform", showGroup && "rotate-180")} />
            </button>
          </div>

          {/* Group selector */}
          {showGroup && (
            <div className="mt-2 rounded-[6px] border border-neutral-200 bg-white overflow-hidden">
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 px-3 pt-2.5 pb-1.5">
                Select groups to notify
              </p>
              <div className="divide-y divide-neutral-50">
                {WL_GROUPS.map(g => (
                  <label key={g} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors">
                    <input
                      type="checkbox"
                      checked={selected.includes(g)}
                      onChange={() => toggleGroup(g)}
                      className="w-3.5 h-3.5 accent-[#00775B] cursor-pointer"
                    />
                    <span className="text-[12px] text-neutral-700 font-medium">{g}</span>
                  </label>
                ))}
              </div>
              <div className="px-3 py-2.5 border-t border-neutral-100 bg-neutral-50/60">
                <button
                  onClick={handleSendGroup}
                  disabled={!selected.length}
                  className={cn(
                    "w-full h-8 rounded-[6px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all",
                    selected.length
                      ? "bg-[#00775B] text-white hover:bg-[#006349]"
                      : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                  )}
                >
                  <Mail className="w-3 h-3" />
                  {selected.length
                    ? `Send to ${selected.length} group${selected.length > 1 ? "s" : ""}`
                    : "Select a group"}
                  {selected.length > 0 && <ChevronRight className="w-3 h-3" />}
                </button>
              </div>
            </div>
          )}

          {/* Sent confirmation */}
          {notified && (
            <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-[6px] bg-emerald-50 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <p className="text-[11px] font-semibold text-emerald-700">
                {notified === "admin"
                  ? "Admin notified — email sent successfully"
                  : "Notification sent to selected groups"}
              </p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

// Feed table row
function FeedTableRow({
  person, rowIndex, onClick, isLPR,
}: {
  person: FeedPerson; rowIndex: number; onClick: () => void; isLPR: boolean;
}) {
  const cfg = STATUS_CFG[person.status];
  const isThreat = person.status === "BLACKLIST" || person.status === "BOLO" ||
    person.status === "UNKNOWN" || person.status === "UNREGISTERED";
  const isActive = isThreat && (person.severity === "CRITICAL" || person.severity === "HIGH");
  const isBlacklist = person.status === "BLACKLIST" || person.status === "BOLO";
  const isPlate = isLPR || person.identType === "PLATE";
  const id = `${isLPR ? "LP" : "FR"}-${String(rowIndex + 1).padStart(3, "0")}`;

  return (
    <tr
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0",
        "hover:bg-[#E5FFF9]",
        isBlacklist && rowIndex === 0 && "bg-red-50/40",
      )}
    >
      {/* ID */}
      <td className="px-3 py-2">
        <span className="text-[10px] font-mono font-bold text-neutral-500">{id}</span>
      </td>

      {/* Snapshot */}
      <td className="px-3 py-2">
        <div className="h-10 w-[60px] rounded-[2px] overflow-hidden border border-neutral-200 group-hover:border-[#00775B]/30 transition-colors bg-neutral-100 relative shrink-0">
          {isPlate ? (
            <IdentityEvidenceMedia kind="PLATE" seed={person.id} plateText={person.plateText} className="h-full w-full" />
          ) : (
            <IdentityEvidenceMedia kind="FACE" seed={person.id} imageSrc={person.imageSrc} live={isActive} className="h-full w-full" />
          )}
        </div>
      </td>

      {/* Identity details */}
      <td className="px-3 py-2 max-w-[180px]">
        <p className="text-[11px] font-bold text-neutral-900 truncate leading-tight">{person.displayName}</p>
        {person.subLabel && (
          <p className={cn("text-[9px] truncate mt-0.5 leading-snug",
            isThreat ? "text-red-600 font-semibold" : "text-neutral-400"
          )}>{person.subLabel}</p>
        )}
      </td>

      {/* Status */}
      <td className="px-3 py-2">
        <span className={cn(
          "text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide whitespace-nowrap",
          cfg.bg, cfg.text,
          isActive && "animate-pulse"
        )}>
          {cfg.label}
        </span>
      </td>

      {/* Zone — name only */}
      <td className="px-3 py-2">
        <p className="text-[11px] font-semibold text-neutral-700 truncate">{person.zone}</p>
      </td>

      {/* Camera */}
      <td className="px-3 py-2">
        <p className="text-[11px] font-mono text-neutral-600">{person.camera}</p>
      </td>

      {/* Match % */}
      <td className="px-3 py-2 text-right">
        {person.confidence != null ? (
          <span className={cn(
            "text-[11px] font-mono font-bold tabular-nums",
            person.confidence >= 90 ? "text-emerald-600" : "text-amber-500"
          )}>
            {person.confidence.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[11px] text-neutral-300 font-mono">—</span>
        )}
      </td>

      {/* Dwell */}
      <td className="px-3 py-2 text-right">
        {person.dwell != null ? (
          <span className={cn(
            "text-[11px] font-mono font-bold tabular-nums",
            person.dwell > 180 ? "text-amber-500" : "text-neutral-500"
          )}>
            {fmtDwell(person.dwell)}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-300 font-mono">—</span>
        )}
      </td>

      {/* Time */}
      <td className="px-3 py-2 text-right">
        <span className="text-[10px] font-mono text-neutral-500">{person.time}</span>
      </td>

      {/* Action */}
      <td className="px-3 py-2 text-right">
        <button
          onClick={e => { e.stopPropagation(); onClick(); }}
          className={cn(
            "h-7 w-7 inline-flex items-center justify-center rounded-full border transition-colors",
            isActive
              ? "border-red-200 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white"
              : "border-neutral-200 bg-white text-neutral-500 hover:border-[#00775B] hover:text-[#00775B]"
          )}
          title="View details"
        >
          <Eye className="w-3.5 h-3.5" />
        </button>
      </td>
    </tr>
  );
}

// ─── Entity Detail Modal ───────────────────────────────────────────────────────
function EntityModal({
  isOpen, person, journey, isLPR, terminology, onClose,
}: {
  isOpen: boolean; person: FeedPerson | null; journey: JourneyStop[];
  isLPR: boolean; terminology: IdentityTerminology;
  onClose: () => void;
}) {
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);

  // Reset drawer when panel closes
  useEffect(() => { if (!isOpen) setDrawerMode(null); }, [isOpen]);

  if (!person) return null;

  const cfg = STATUS_CFG[person.status];
  const isThreat = person.status === "BLACKLIST" || person.status === "BOLO";
  const isUnknown = person.status === "UNKNOWN" || person.status === "UNREGISTERED";
  const isVIP = person.status === "VIP";

  const frActions = isThreat ? [
    { key: "dispatch", label: "Dispatch Officer",             confirmMsg: `Send an officer to ${person.zone} to intercept and verify this individual.`,              successMsg: `Officer dispatched — en route to ${person.zone}`, icon: Radio,         variant: "danger"   as const },
    { key: "lockdown", label: "Lock Zone",                    confirmMsg: `Restrict all access to ${person.zone} and secure all entry points immediately.`,          successMsg: `${person.zone} secured — all entries restricted`, icon: Lock,          variant: "danger"   as const },
    { key: "control",  label: "Alert Control Room",           confirmMsg: "Broadcast a critical alert to all control room operators on duty.",                        successMsg: "Control room notified — standby for response",   icon: Zap,           variant: "primary"  as const },
    { key: "fp",       label: "Mark as False Match",          confirmMsg: "Dismiss this match as a false positive and remove the active alert.",                     successMsg: "Alert cleared — feed restored",                  icon: X,             variant: "default"  as const },
  ] : isUnknown ? [
    { key: "officer",   label: "Deploy Officer",              confirmMsg: `Send an officer to ${person.zone} to physically verify the identity of this individual.`, successMsg: "Officer dispatched — ETA 2 min",                 icon: UserPlus,      variant: "primary"  as const },
    { key: "track",     label: "Enable Movement Tracking",    confirmMsg: "Begin real-time movement tracking for this individual across all connected zones.",        successMsg: "Tracking enabled — monitoring all zones",         icon: Navigation2,   variant: "primary"  as const },
    { key: "watchlist", label: "Add to Watchlist",            confirmMsg: "Add this person to the watchlist. Future appearances will trigger immediate alerts.",     successMsg: "Added — alerts active for future appearances",    icon: BookmarkPlus,  variant: "default"  as const },
    { key: "dismiss",   label: "Clear Alert",                 confirmMsg: "Clear this alert. The individual will not be flagged again unless re-detected.",          successMsg: "Alert cleared",                                  icon: X,             variant: "default"  as const },
  ] : isVIP ? [
    { key: "escort",    label: "Activate Escort Protocol",   confirmMsg: `Assign a dedicated security escort for ${person.displayName} at ${person.zone}.`,          successMsg: "Escort team notified — meeting at zone entry",    icon: Shield,        variant: "primary"  as const },
    { key: "desk",      label: "Alert Front Desk",           confirmMsg: "Notify the front desk of this VIP arrival so they can prepare a reception.",               successMsg: "Front desk alerted — guest log updated",          icon: Zap,           variant: "default"  as const },
    { key: "route",     label: "Open VIP Access Route",      confirmMsg: "Unlock VIP-designated gates and elevators for immediate access.",                          successMsg: "VIP route unlocked — access granted",             icon: Navigation2,   variant: "default"  as const },
  ] : [
    { key: "log",     label: "Log as Cleared Entry",         confirmMsg: "Confirm and record this as a verified, cleared entry in the access register.",             successMsg: "Entry logged in access register",                 icon: CheckCircle2,  variant: "default"  as const },
    { key: "flag",    label: "Flag for Supervisor Review",   confirmMsg: "Flag this event and send a notification to the on-duty supervisor for review.",            successMsg: "Flagged — supervisor notified",                   icon: AlertTriangle, variant: "default"  as const },
  ];

  const lprActions = isThreat ? [
    { key: "seal",   label: "Seal Entry Point",              confirmMsg: `Close and lock the gate at ${person.zone}. All approaching vehicles will be stopped.`,     successMsg: `Gate sealed at ${person.zone} — security alerted`, icon: Ban,         variant: "danger"   as const },
    { key: "police", label: "Alert Authorities",              confirmMsg: "Transmit vehicle details to the relevant authorities. A reference number will be generated.",    successMsg: "Authorities alerted — reference number generated", icon: Radio,     variant: "danger"   as const },
    { key: "alert",  label: "Alert All Operators",           confirmMsg: "Broadcast this vehicle ID to all entry and exit operators across the site.",                successMsg: "All operators on alert — vehicle flagged",          icon: Zap,         variant: "primary"  as const },
    { key: "fp",     label: "Mark as False Match",           confirmMsg: "Dismiss as a false positive. The gate block will be lifted and the alert removed.",         successMsg: "Alert cleared — gate access restored",             icon: X,           variant: "default"  as const },
  ] : isUnknown ? [
    { key: "block",   label: "Deny Entry",                   confirmMsg: `Block this vehicle at ${person.zone}. The barrier will remain closed until manually released.`, successMsg: "Entry denied — barrier locked",               icon: Ban,         variant: "danger"   as const },
    { key: "visitor", label: "Register as Day Visitor",      confirmMsg: "Issue a temporary visitor permit for this vehicle, valid for today only.",                  successMsg: "Day pass issued — plate added to visitor list",     icon: UserPlus,   variant: "primary"  as const },
    { key: "bolo",    label: "Escalate to BOLO List",        confirmMsg: "Escalate this plate to the BOLO watchlist. All operators and gate cameras will be notified.", successMsg: "Plate added to BOLO — all gates on alert",        icon: AlertTriangle, variant: "default" as const },
  ] : isVIP ? [
    { key: "valet",    label: "Activate Valet Service",      confirmMsg: "Dispatch the valet team to receive this executive vehicle at the gate.",                    successMsg: "Valet dispatched — arrival confirmed",             icon: Star,        variant: "primary"  as const },
    { key: "desk",     label: "Alert Front Desk",            confirmMsg: "Notify the front desk of this executive vehicle's arrival.",                                successMsg: "Front desk alerted — guest record updated",        icon: Zap,         variant: "default"  as const },
  ] : [
    { key: "log",  label: "Log Authorised Entry",            confirmMsg: "Confirm and record this as an authorised vehicle entry in the access log.",                 successMsg: "Entry logged in vehicle access register",          icon: CheckCircle2, variant: "default" as const },
    { key: "flag", label: "Flag for Review",                 confirmMsg: "Flag this vehicle event and notify the on-duty supervisor for follow-up.",                  successMsg: "Flagged — supervisor notified",                    icon: AlertTriangle, variant: "default" as const },
  ];

  const actions = isLPR ? lprActions : frActions;
  const isPlate = isLPR || person.identType === "PLATE";

  // Status badge for SlidePanel headerRight
  const statusBadge = (
    <div className="flex items-center gap-2">
      <span className={cn(
        "text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-[3px] text-white",
        cfg.headerBg
      )}>
        {cfg.label}
      </span>
      {isThreat && (
        <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Active Threat
        </span>
      )}
      <span className="text-[10px] font-mono text-neutral-400">{person.time}</span>
    </div>
  );

  return (
    <>
      <SlidePanel
        isOpen={isOpen}
        onClose={onClose}
        title={person.displayName}
        subtitle={`${person.zone} · ${person.camera}`}
        width="w-[680px]"
        headerRight={statusBadge}
      >

        {/* ── Identity Hero ─────────────────────────────────────── */}
        <div className={cn(
          "flex gap-4 p-5 border-b border-neutral-100",
          isThreat ? "bg-red-50/40" : isUnknown ? "bg-amber-50/20" : isVIP ? "bg-yellow-50/20" : ""
        )}>
          {/* Image */}
          <div className="shrink-0">
            {isPlate ? (
              <IdentityEvidenceMedia
                kind="PLATE" seed={person.id}
                plateText={person.plateText}
                confidence={person.confidence}
                size="lg" live={isThreat}
                className="w-48 h-32"
              />
            ) : (
              <IdentityEvidenceMedia
                kind="FACE" seed={person.id}
                imageSrc={person.imageSrc}
                confidence={person.confidence}
                size="lg" live={isThreat}
                className="w-36 h-36"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h2 className="text-xl font-black text-neutral-900 leading-tight">{person.displayName}</h2>
                  {person.subLabel && (
                    <p className={cn("text-[12px] mt-0.5", isThreat ? "text-red-600 font-medium" : "text-neutral-500")}>
                      {person.subLabel}
                    </p>
                  )}
                  {person.vehicleDesc && (
                    <p className="text-[11px] text-neutral-500 mt-0.5">{person.vehicleDesc}</p>
                  )}
                </div>
                <button
                  onClick={() => setDrawerMode({ kind: "watchlist" })}
                  className="shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-[5px] bg-[#E5FFF9] border border-[#00775B]/25 text-[10px] font-bold text-[#00775B] hover:bg-[#00775B]/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {isLPR ? "Manage Vehicle" : "Manage Person"}
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-2">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Zone</p>
                <p className="text-[12px] font-semibold text-neutral-800">{person.zone}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Camera</p>
                <p className="text-[12px] font-mono text-neutral-800">{person.camera}</p>
              </div>
              {person.confidence != null && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">{terminology.matchScoreLabel}</p>
                  <p className={cn("text-[12px] font-mono font-bold", person.confidence >= 90 ? "text-emerald-600" : "text-amber-600")}>
                    {person.confidence}%
                  </p>
                </div>
              )}
              {person.dwell != null && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Dwell</p>
                  <p className={cn("text-[12px] font-mono font-bold", person.dwell > 180 ? "text-amber-600" : "text-neutral-700")}>
                    {fmtDwell(person.dwell)}
                  </p>
                </div>
              )}
              {person.department && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Dept.</p>
                  <p className="text-[12px] font-semibold text-neutral-800">{person.department}</p>
                </div>
              )}
              {person.employeeId && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">ID</p>
                  <p className="text-[12px] font-mono text-neutral-700">{person.employeeId}</p>
                </div>
              )}
              {person.totalAppearances != null && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Visits</p>
                  <p className="text-[12px] font-mono text-neutral-700">{person.totalAppearances}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Movement Path / Gate History ─────────────────────── */}
        <div className="px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 mb-4">
            <Navigation2 className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {isLPR ? "Gate History" : "Movement Path Tracking"}
            </span>
            <span className="ml-auto text-[9px] text-neutral-400 font-mono">
              {journey.length} checkpoint{journey.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Timeline with vertical connector */}
          <div className="relative pl-1">
            {journey.length > 1 && (
              <div className="absolute left-[7px] top-5 bottom-5 w-[2px] bg-neutral-200 rounded-full" />
            )}
            <div className="space-y-2">
              {journey.map((stop, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 pr-3 py-2.5 rounded-[6px] text-[11px] relative pl-3",
                  stop.isCurrent
                    ? isThreat ? "bg-red-50 border border-red-200" : "bg-[#E5FFF9] border border-[#00775B]/20"
                    : "bg-neutral-50 border border-transparent"
                )}>
                  {/* Status dot */}
                  <span className={cn(
                    "w-3 h-3 rounded-full shrink-0 z-10",
                    stop.isCurrent
                      ? isThreat
                        ? "bg-red-500 animate-pulse ring-2 ring-red-200"
                        : "bg-[#00775B] animate-pulse ring-2 ring-emerald-200"
                      : i === 0 ? "bg-neutral-400" : "bg-[#00775B]"
                  )} />

                  {/* Camera thumbnail */}
                  <div className="shrink-0 w-14 h-10 rounded-[4px] overflow-hidden border border-neutral-200 bg-neutral-900 relative">
                    {isLPR ? (
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a2535_0%,#111827_100%)] flex items-center justify-center">
                        <Camera className="w-4 h-4 text-neutral-600" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center">
                          <span className="text-[7px] font-mono text-amber-300 font-bold tracking-wide leading-none block py-[2px]">
                            {person.plateText ?? "──"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={`https://i.pravatar.cc/112?u=${person.id}-stop${i}-cam`}
                          alt=""
                          className="w-full h-full object-cover opacity-80"
                          style={{ filter: "contrast(1.1) saturate(0.7) brightness(0.85)" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
                      </>
                    )}
                    <div className="absolute top-0 left-0 right-0 bg-black/70 px-1 py-[1px]">
                      <span className="text-[6px] font-mono text-[#00FF84] tracking-wider">{stop.camera}</span>
                    </div>
                    {stop.isCurrent && (
                      <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 bg-black/70 rounded-[2px] px-1 py-[1px]">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[6px] font-bold text-white">LIVE</span>
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-neutral-400 shrink-0 w-10">{stop.time}</span>
                  <span className="font-semibold text-neutral-800 flex-1">{stop.zone}</span>
                  <span className={cn("text-[10px] font-mono shrink-0",
                    stop.isCurrent && isThreat ? "text-red-500 font-bold" : "text-neutral-400"
                  )}>{stop.dwellText}</span>

                  {stop.alertNote && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] shrink-0",
                      stop.isCurrent && isThreat
                        ? "bg-red-600 text-white"
                        : stop.alertNote.toLowerCase().includes("resolved") || stop.alertNote.toLowerCase().includes("authoris")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    )}>{stop.alertNote}</span>
                  )}
                  {stop.linkedPlate && (
                    <span className="text-[9px] font-mono text-[#00775B] font-bold shrink-0 bg-[#E5FFF9] px-1.5 py-0.5 rounded-[3px]">
                      Linked: {stop.linkedPlate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Notify actions */}
        <ActionsSection />

      </SlidePanel>

      {/* Action drawer — second SlidePanel layer */}
      <ActionDrawer
        mode={drawerMode}
        isThreat={isThreat}
        isLPR={isLPR}
        person={person}
        onClose={() => setDrawerMode(null)}
      />
    </>
  );
}

// ─── Priority Watchlist (always-visible center panel — horizontal grid) ────────
function WatchlistPanel({
  people, onOpenModal, isLPR,
}: {
  people: FeedPerson[]; onOpenModal: (id: string) => void; isLPR: boolean;
}) {
  const threats = people
    .filter(p => p.status === "BLACKLIST" || p.status === "BOLO" || p.status === "UNKNOWN" || p.status === "UNREGISTERED")
    .sort((a, b) => STATUS_CFG[a.status].priority - STATUS_CFG[b.status].priority)
    .slice(0, 6);

  const criticalCount = threats.filter(p => p.status === "BLACKLIST" || p.status === "BOLO").length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100 shrink-0">
        <Activity className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Priority Watchlist</span>
        {criticalCount > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
            <span className="w-1 h-1 rounded-full bg-white" />
            {criticalCount} CRITICAL
          </span>
        )}
        {criticalCount === 0 && threats.length > 0 && (
          <span className="ml-auto text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-amber-100 text-amber-700">
            {threats.length} ALERTS
          </span>
        )}
      </div>

      <div className="flex-1 overflow-y-auto p-3">
        {threats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-neutral-400">
            <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
            <p className="text-[12px] font-semibold">No active threats</p>
            <p className="text-[10px]">All clear</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 xl:grid-cols-4 gap-2.5">
            {threats.map(p => {
              const cfg = STATUS_CFG[p.status];
              const isCritical = p.status === "BLACKLIST" || p.status === "BOLO";
              const isPlate = isLPR || p.identType === "PLATE";

              return (
                <div
                  key={p.id}
                  onClick={() => onOpenModal(p.id)}
                  className={cn(
                    "group relative rounded-[6px] overflow-hidden cursor-pointer transition-all select-none flex flex-col",
                    "hover:shadow-md hover:-translate-y-[1px] active:translate-y-0",
                    isCritical
                      ? "bg-white border border-red-200 shadow-[0_1px_6px_rgba(220,38,38,0.10)]"
                      : "bg-white border border-amber-200/70 shadow-[0_1px_6px_rgba(217,119,6,0.08)]",
                  )}
                >
                  {/* Left accent bar */}
                  <div className={cn(
                    "absolute left-0 top-0 bottom-0 w-[3px]",
                    isCritical ? "bg-red-600" : "bg-amber-500"
                  )} />

                  {/* ── Top: badge row ─────────────────────────────────────── */}
                  <div className="flex items-center gap-1.5 pl-3.5 pr-2.5 pt-2.5 pb-2">
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-[0.1em] px-1.5 py-[3px] rounded-[3px]",
                      isCritical
                        ? "bg-red-600 text-white animate-pulse"
                        : "bg-amber-100 text-amber-800",
                      p.severity === "HIGH" && !isCritical && "animate-pulse"
                    )}>
                      {cfg.label}
                    </span>
                    {p.severity && (
                      <span className={cn(
                        "flex items-center gap-[3px] text-[8px] font-bold uppercase tracking-wide px-1.5 py-[3px] rounded-[3px]",
                        isCritical ? "bg-red-50 text-red-600" : "bg-amber-50 text-amber-700"
                      )}>
                        <span className={cn("w-1 h-1 rounded-full", isCritical ? "bg-red-500 animate-pulse" : "bg-amber-400")} />
                        {p.severity}
                      </span>
                    )}
                    <span className="ml-auto text-[9px] font-mono text-neutral-400">{p.time.slice(0, 5)}</span>
                  </div>

                  {/* ── Body: image left, info right ───────────────────────── */}
                  <div className="flex gap-2.5 pl-3.5 pr-2.5 pb-2.5 flex-1">

                    {/* Image — taller portrait crop */}
                    <div className={cn(
                      "shrink-0 rounded-[4px] overflow-hidden border",
                      isCritical ? "border-red-200" : "border-amber-200/80"
                    )}>
                      {isPlate ? (
                        <IdentityEvidenceMedia
                          kind="PLATE" seed={p.id} plateText={p.plateText}
                          className="h-[72px] w-[90px]"
                        />
                      ) : (
                        <IdentityEvidenceMedia
                          kind="FACE" seed={p.id} imageSrc={p.imageSrc}
                          live={isCritical}
                          className="h-[72px] w-[56px]"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[13px] font-black text-neutral-900 truncate leading-tight">{p.displayName}</p>
                        <div className="flex items-center gap-1 mt-0.5 mb-1.5">
                          <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                          <p className="text-[10px] text-neutral-500 truncate">{p.zone}</p>
                        </div>
                        {p.subLabel && (
                          <p className={cn(
                            "text-[9px] leading-snug line-clamp-2",
                            isCritical ? "text-red-600 font-semibold" : "text-amber-700 font-medium"
                          )}>
                            {p.subLabel}
                          </p>
                        )}
                      </div>

                      {/* Confidence bar */}
                      {p.confidence != null && (
                        <div className="mt-2">
                          <div className="flex items-center justify-between mb-0.5">
                            <span className="text-[8px] text-neutral-400 uppercase tracking-wide">Match</span>
                            <span className={cn(
                              "text-[9px] font-black font-mono tabular-nums",
                              p.confidence >= 90 ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {p.confidence.toFixed(1)}%
                            </span>
                          </div>
                          <div className="h-[3px] bg-neutral-100 rounded-full overflow-hidden">
                            <div
                              className={cn("h-full rounded-full transition-all", p.confidence >= 90 ? "bg-emerald-500" : "bg-amber-400")}
                              style={{ width: `${p.confidence}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── Footer: camera + act button ─────────────────────────── */}
                  <div className={cn(
                    "flex items-center justify-between pl-3.5 pr-2.5 py-2 border-t mt-auto",
                    isCritical ? "border-red-100 bg-red-50/50" : "border-amber-100/80 bg-amber-50/30"
                  )}>
                    <span className="text-[9px] font-mono text-neutral-400">{p.camera}</span>
                    <button className={cn(
                      "h-6 px-2.5 rounded-[4px] text-[9px] font-bold flex items-center gap-1 transition-colors",
                      isCritical
                        ? "bg-red-600 text-white hover:bg-red-700 group-hover:bg-red-700"
                        : "bg-amber-500 text-white hover:bg-amber-600 group-hover:bg-amber-600"
                    )}>
                      Act
                      <ChevronRight className="w-2.5 h-2.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
  onCameraClick?: (id?: string) => void;
  onJourneyClick?: () => void;
}

export const IdentityMonitoringView = ({
  terminology,
}: Props) => {
  const isLPR = terminology.isLPR;
  const people = isLPR ? LPR_PEOPLE : FR_PEOPLE;
  const journeyMap = isLPR ? LPR_JOURNEY : FR_JOURNEY;

  const [modalPersonId, setModalPersonId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");

  const status = IDENTITY_LIVE_STATUS;

  const filtered = people
    .filter(p => {
      if (feedFilter === "threats")    return p.status === "BLACKLIST" || p.status === "BOLO" || p.status === "UNKNOWN" || p.status === "UNREGISTERED";
      if (feedFilter === "unknowns")   return p.status === "UNKNOWN" || p.status === "UNREGISTERED";
      if (feedFilter === "vip")        return p.status === "VIP";
      if (feedFilter === "authorized") return p.status === "WHITELIST" || p.status === "AUTHORIZED";
      return true;
    })
    .sort((a, b) => STATUS_CFG[a.status].priority - STATUS_CFG[b.status].priority);

  const modalPerson = modalPersonId ? people.find(p => p.id === modalPersonId) ?? null : null;
  const modalJourney = modalPersonId ? (journeyMap[modalPersonId] ?? []) : [];

  const threatCount = people.filter(p => p.status === "BLACKLIST" || p.status === "BOLO").length;
  const unknownCount = people.filter(p => p.status === "UNKNOWN" || p.status === "UNREGISTERED").length;

  const systemColor = threatCount > 0 ? "text-red-400" : unknownCount > 0 ? "text-amber-400" : "text-emerald-400";
  const systemLabel = threatCount > 0 ? "CRITICAL" : unknownCount > 0 ? "AMBER" : "GREEN";

  const FEED_FILTERS: { key: FeedFilter; label: string; count?: number }[] = [
    { key: "all",        label: "All",                                            count: people.length },
    { key: "threats",    label: isLPR ? "BOLO / Unreg" : "Threats",              count: people.filter(p => p.status === "BLACKLIST" || p.status === "BOLO" || p.status === "UNKNOWN" || p.status === "UNREGISTERED").length },
    { key: "unknowns",   label: isLPR ? "Unregistered" : "Unknowns",             count: people.filter(p => p.status === "UNKNOWN" || p.status === "UNREGISTERED").length },
    { key: "vip",        label: "VIP",                                            count: people.filter(p => p.status === "VIP").length },
    { key: "authorized", label: "Authorised",                                     count: people.filter(p => p.status === "WHITELIST" || p.status === "AUTHORIZED").length },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* ── System Status Bar ─────────────────────────────────────────────── */}
      <div className="bg-[#021d18] rounded-[4px] px-4 py-2.5 flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-2">
          <span className={cn("w-2 h-2 rounded-full animate-pulse", threatCount > 0 ? "bg-red-500" : unknownCount > 0 ? "bg-amber-400" : "bg-emerald-400")} />
          <span className={cn("text-[10px] font-black uppercase tracking-widest", systemColor)}>{systemLabel}</span>
        </div>
        <div className="w-px h-4 bg-white/10" />
        {[
          { label: isLPR ? "Plates/min" : "IDs/min", value: `${status.identifications_last_min}`, color: "text-white" },
          { label: "Active Threats", value: `${threatCount}`, color: threatCount > 0 ? "text-red-400 font-black" : "text-white" },
          { label: isLPR ? "Unregistered" : "Unknowns", value: `${unknownCount}`, color: unknownCount > 0 ? "text-amber-400" : "text-white" },
          { label: "Cameras", value: `${status.cameras_online}/${status.cameras_total}`, color: "text-white" },
          { label: "Open Alerts", value: `${status.open_alerts.critical}C · ${status.open_alerts.high}H · ${status.open_alerts.medium}M`, color: "text-neutral-300" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[9px] text-white/40 uppercase tracking-wider">{s.label}</span>
            <span className={cn("text-[11px] font-mono font-bold", s.color)}>{s.value}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] text-emerald-400 font-bold">LIVE</span>
        </div>
      </div>

      {/* ── Priority Watchlist — full width row ──────────────────────────── */}
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
        <WatchlistPanel people={people} onOpenModal={setModalPersonId} isLPR={isLPR} />
      </div>

      {/* ── Live Feed + Right sidebar ─────────────────────────────────────── */}
      <div className="overflow-x-auto -mx-0">
      <div className="grid gap-3" style={{ gridTemplateColumns: "minmax(0, 3fr) 252px", minHeight: 480, minWidth: 640 }}>

        {/* ── Live Feed (~75%) ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">
          {/* Header + filters */}
          <div className="px-4 py-2.5 border-b border-neutral-100 shrink-0 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#00775B]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-600">Live Feed</span>
              <span className="text-[10px] font-mono text-neutral-400 ml-1">{filtered.length} events</span>
            </div>
            {threatCount > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
                {threatCount} THREAT{threatCount > 1 ? "S" : ""}
              </span>
            )}
            <div className="flex items-center gap-1 ml-auto flex-wrap">
              {FEED_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => setFeedFilter(f.key)}
                  className={cn(
                    "h-6 px-2 rounded-[3px] text-[9px] font-bold transition-colors whitespace-nowrap",
                    feedFilter === f.key
                      ? f.key === "threats" && threatCount > 0
                        ? "bg-red-600 text-white"
                        : "bg-[#00775B] text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {f.label}{f.count != null && f.count > 0 ? ` (${f.count})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-[11px] text-neutral-400">No events</div>
            ) : (
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#001E18] sticky top-0 z-10">
                  <tr className="text-[9px] uppercase tracking-widest font-bold text-white/80 h-8">
                    <th className="px-3 py-2 w-16">ID</th>
                    <th className="px-3 py-2 w-16">Snapshot</th>
                    <th className="px-3 py-2">Identity</th>
                    <th className="px-3 py-2 w-28">Status</th>
                    <th className="px-3 py-2">Zone</th>
                    <th className="px-3 py-2 w-28">Camera</th>
                    <th className="px-3 py-2 w-20 text-right">Match %</th>
                    <th className="px-3 py-2 w-20 text-right">Dwell</th>
                    <th className="px-3 py-2 w-24 text-right">Time</th>
                    <th className="px-3 py-2 w-16 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p, i) => (
                    <FeedTableRow
                      key={p.id}
                      person={p}
                      rowIndex={i}
                      onClick={() => setModalPersonId(p.id)}
                      isLPR={isLPR}
                    />
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* ── RIGHT: Zone Command ──────────────────────────────────────────── */}
        <div className="flex flex-col gap-3">

          {/* Zone status grid */}
          <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-neutral-50">
              <MapPin className="w-3.5 h-3.5 text-[#00775B]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Zone Status</span>
            </div>
            <div className="p-2 grid grid-cols-2 gap-1.5">
              {IDENTITY_ZONES.slice(0, 8).map(zone => {
                const color = zone.status === "CRITICAL" ? "bg-red-50 border-red-300 text-red-700"
                  : zone.status === "WATCH" ? "bg-amber-50 border-amber-300 text-amber-700"
                  : zone.status === "AMBER" ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-emerald-50/30 border-neutral-200 text-neutral-600";
                const dot = zone.status === "CRITICAL" ? "bg-red-500 animate-pulse"
                  : zone.status === "WATCH" ? "bg-amber-400"
                  : zone.status === "AMBER" ? "bg-orange-400"
                  : "bg-emerald-400";
                return (
                  <div key={zone.zone_id} className={cn("rounded-[3px] border px-2 py-1.5", color)}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                      <span className="text-[9px] font-bold truncate">{zone.zone_name}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] font-mono opacity-70">
                      <span>{zone.identifications} IDs</span>
                      {zone.blacklist_hits > 0 && <span className="font-black text-red-600">🚨 {zone.blacklist_hits}</span>}
                      {zone.unknown > 0 && <span>{zone.unknown} unk</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active unknowns tracker */}
          <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex-1">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-neutral-50">
              <UserX className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
                {isLPR ? "Unregistered Vehicles" : "Unknown Trackers"}
              </span>
            </div>
            <div className="divide-y divide-neutral-50">
              {UNKNOWN_TRACKERS.slice(0, 3).map(t => (
                <div key={t.tracker_id} className="px-3 py-2 flex gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="text-[10px] font-bold text-neutral-800 truncate">{t.anonymized_label}</p>
                      {t.badge && (
                        <span className="text-[8px] font-black px-1 py-0.5 rounded-[2px] bg-amber-100 text-amber-700 shrink-0">
                          {t.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[9px] text-neutral-400">{t.appearances} appearances · {t.first_seen}–{t.last_seen}</p>
                    <p className="text-[9px] text-neutral-400 truncate">{t.cameras.join(" → ")}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className={cn("text-[9px] font-mono font-bold", t.confidence >= 75 ? "text-amber-600" : "text-red-500")}>
                      {t.confidence}%
                    </span>
                    {t.cross_camera && (
                      <p className="text-[8px] text-[#00775B] font-bold">cross-cam</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Camera status strip */}
          <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-3">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Camera className="w-3 h-3 text-[#00775B]" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Cameras</span>
              </div>
              <span className="text-[10px] font-mono font-bold text-neutral-700">{status.cameras_online}/{status.cameras_total}</span>
            </div>
            <div className="flex gap-1 flex-wrap">
              {Array.from({ length: status.cameras_total }, (_, i) => {
                const online = i < status.cameras_online;
                return (
                  <div
                    key={i}
                    title={`CAM-${String(i + 1).padStart(2, "0")}`}
                    className={cn("w-4 h-4 rounded-[2px]", online ? "bg-emerald-400" : "bg-red-400/60")}
                  />
                );
              })}
            </div>
            <div className="flex items-center gap-3 mt-2 text-[9px]">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[1px] bg-emerald-400" />Online</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-[1px] bg-red-400/60" />Offline</span>
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* ── Entity Detail Slide Panel ─────────────────────────────────────── */}
      <EntityModal
        isOpen={!!modalPerson}
        person={modalPerson}
        journey={modalJourney}
        isLPR={isLPR}
        terminology={terminology}
        onClose={() => setModalPersonId(null)}
      />
    </div>
  );
};
