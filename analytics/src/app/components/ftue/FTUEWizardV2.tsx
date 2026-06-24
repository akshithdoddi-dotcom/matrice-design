import { useState, useMemo, useRef, useCallback } from "react";
import { CameraAppRow } from "@/app/components/ftue/FTUEWizard";
import {
  Camera, FolderOpen, GitBranch, Rocket, Check, ChevronDown, ChevronUp,
  Flame, ShieldAlert, Eye, Users, Footprints, Zap, ArrowRight,
  Loader2, CheckCircle2, Video, BarChart3, X, Upload, Tag, Search,
  HardHat, Car, ShoppingCart, PersonStanding, AlertTriangle, Thermometer,
  Truck, Package, MonitorCheck, Activity, ScanFace, Lock, Wind, Droplets,
  BatteryWarning, Wifi, MousePointerClick, Map, Gauge, Plus, Sun, Moon,
  Trash2,
} from "lucide-react";
function cn(...classes) { return classes.filter(Boolean).join(" "); }

// ─── Fonts ────────────────────────────────────────────────────────────────────
const INTER: React.CSSProperties = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
const MONO: React.CSSProperties  = { fontFamily: "'JetBrains Mono', monospace" };

// ─── Theme ────────────────────────────────────────────────────────────────────
interface Theme {
  isDark: boolean;
  panel: string;
  topBar: string;
  title: string;
  subtitle: string;
  label: string;
  monoLabel: string;
  divider: string;
  inputBg: string;
  inputBorder: string;
  inputText: string;
  inputPlaceholder: string;
  selectText: string;
  cardBg: string;
  cardBorder: string;
  gridBg: string;
  gridSep: string;
  gridItemBg: string;
  gridItemHover: string;
  gridItemText: string;
  gridItemSub: string;
  chipInactiveBg: string;
  chipInactiveText: string;
  footerBg: string;
  footerBorder: string;
  backBtn: string;
  sectionLabel: string;
  primary: string;
  primaryGlow: string;
  bindingBg: string;
  bindingBorder: string;
  bindingToken: string;
  bindingTokenBorder: string;
  cameraChipBg: string;
  cameraTabActive: string;
  cameraTabInactive: string;
}

function buildTheme(isDark: boolean): Theme {
  if (isDark) return {
    isDark,
    panel: "#020617",
    topBar: "bg-[#020617] border-[#0F172A]",
    title: "#F1F5F9",
    subtitle: "#475569",
    label: "#94A3B8",
    monoLabel: "#475569",
    divider: "#1E293B",
    inputBg: "#1E293B",
    inputBorder: "#334155",
    inputText: "#E2E8F0",
    inputPlaceholder: "#475569",
    selectText: "#E2E8F0",
    cardBg: "#0A0F1A",
    cardBorder: "#1E293B",
    gridBg: "#020617",
    gridSep: "#0F172A",
    gridItemBg: "#020617",
    gridItemHover: "#0F172A",
    gridItemText: "#94A3B8",
    gridItemSub: "#475569",
    chipInactiveBg: "#1E293B",
    chipInactiveText: "#64748B",
    footerBg: "#020617",
    footerBorder: "#0F172A",
    backBtn: "border-[#1E293B] text-[#475569] hover:bg-[#0F172A] hover:text-[#94A3B8]",
    sectionLabel: "#475569",
    primary: "#00775B",
    primaryGlow: "rgba(0,119,91,0.18)",
    bindingBg: "#0A0F1A",
    bindingBorder: "#1E293B",
    bindingToken: "#1E293B",
    bindingTokenBorder: "#334155",
    cameraChipBg: "#0F172A",
    cameraTabActive: "bg-[#00775B]/15 border-[#00775B]/40 text-[#00D4AA]",
    cameraTabInactive: "bg-[#0F172A] border-[#1E293B] text-[#475569] hover:border-[#334155] hover:text-[#64748B]",
  };
  return {
    isDark,
    panel: "#F8FAFC",
    topBar: "bg-white border-[#E2E8F0]",
    title: "#0F172A",
    subtitle: "#64748B",
    label: "#475569",
    monoLabel: "#94A3B8",
    divider: "#E2E8F0",
    inputBg: "#FFFFFF",
    inputBorder: "#CBD5E1",
    inputText: "#334155",
    inputPlaceholder: "#94A3B8",
    selectText: "#334155",
    cardBg: "#FFFFFF",
    cardBorder: "#E2E8F0",
    gridBg: "#FAFAFA",
    gridSep: "#F1F5F9",
    gridItemBg: "#FFFFFF",
    gridItemHover: "#F8FAFC",
    gridItemText: "#475569",
    gridItemSub: "#94A3B8",
    chipInactiveBg: "#F1F5F9",
    chipInactiveText: "#64748B",
    footerBg: "#FFFFFF",
    footerBorder: "#E2E8F0",
    backBtn: "border-[#E2E8F0] text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#334155]",
    sectionLabel: "#94A3B8",
    primary: "#00775B",
    primaryGlow: "rgba(0,119,91,0.10)",
    bindingBg: "#F8FAFC",
    bindingBorder: "#E2E8F0",
    bindingToken: "#F1F5F9",
    bindingTokenBorder: "#CBD5E1",
    cameraChipBg: "#F1F5F9",
    cameraTabActive: "bg-[#E5FFF9] border-[#00775B]/40 text-[#00775B]",
    cameraTabInactive: "bg-white border-[#E2E8F0] text-[#64748B] hover:border-[#CBD5E1] hover:text-[#475569]",
  };
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FTUEWizardV2Props {
  onComplete: (dest: "vms" | "analytics") => void;
  onSwitchVersion: () => void;
  onPlatformSwitch?: (app: string) => void;
  onDismiss?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4 | 5;
type LaunchPhaseTop = "confirm" | "booting" | "success";

interface CameraEntry {
  id: string;
  name: string;
  protocol: "RTSP" | "IP" | "FILE";
  url: string;
  apps: Set<string>;
}

interface ProjectForm {
  name: string; industry: string; license: string; tags: string[];
  country: string; computeType: string; storageType: string; supportedDevices: string[];
}

interface PipelineForm {
  name: string; description: string; cluster: string;
}

// ─── Options ──────────────────────────────────────────────────────────────────
const INDUSTRIES    = ["Retail", "Manufacturing", "Healthcare", "Logistics", "Education", "Finance", "Government", "Hospitality"];
const LICENSES      = ["footfall_license", "People_detect License", "Matrice AI Primary License"];
const CLUSTERS      = ["cluster-prod-01 (Singapore)", "cluster-prod-02 (Mumbai)", "cluster-edge-01 (On-Premise)"];
const COUNTRIES     = ["Singapore", "India", "United States", "United Kingdom", "Australia"];
const COMPUTE_TYPES = ["Matrice", "Cloud GPU (Standard)", "Cloud GPU (High Performance)", "Edge TPU"];
const STORAGE_TYPES = ["Matrice", "Object Storage (S3)", "Block Storage (NVMe)", "Hybrid"];
const DEVICE_OPTIONS= ["Nvidia GPU", "Intel CPU", "EDGE camera", "IOS", "Android"];
const MAX_CAMERAS   = 10;

type AppCategory = "All" | "Safety" | "Security" | "Retail" | "Traffic";
interface AIApp { id: string; label: string; desc: string; icon: React.ElementType; color: string; category: Exclude<AppCategory,"All">; }

const AI_APPS: AIApp[] = [
  { id:"fire",          label:"Fire & Smoke",        desc:"Detects active flames and smoke plumes",       icon:Flame,            color:"#EA580C", category:"Safety"   },
  { id:"ppe",           label:"PPE Detection",        desc:"Hard hat, vest & glove compliance",            icon:HardHat,          color:"#E19A04", category:"Safety"   },
  { id:"slip",          label:"Slip & Fall",          desc:"Detects falls on floor surfaces",              icon:AlertTriangle,    color:"#E7000B", category:"Safety"   },
  { id:"heat",          label:"Heat Stress",          desc:"Thermal anomaly & worker heat alerts",         icon:Thermometer,      color:"#EA580C", category:"Safety"   },
  { id:"gas",           label:"Gas Leak",             desc:"Airborne chemical & gas hazard detection",     icon:Wind,             color:"#64748B", category:"Safety"   },
  { id:"flood",         label:"Flood Detection",      desc:"Water accumulation & overflow alerts",         icon:Droplets,         color:"#2B7FFF", category:"Safety"   },
  { id:"emergency",     label:"Emergency Exits",      desc:"Blocked exit route identification",            icon:AlertTriangle,    color:"#E7000B", category:"Safety"   },
  { id:"power",         label:"Power Hazard",         desc:"Exposed wiring and electrical risk zones",     icon:BatteryWarning,   color:"#E19A04", category:"Safety"   },
  { id:"forklift",      label:"Forklift Safety",      desc:"Proximity alerts between forklifts & people",  icon:Truck,            color:"#EA580C", category:"Safety"   },
  { id:"spill",         label:"Spill Detection",      desc:"Liquid spill identification on floor",         icon:Droplets,         color:"#2B7FFF", category:"Safety"   },
  { id:"confined",      label:"Confined Space",       desc:"Unauthorized confined space entry",            icon:Lock,             color:"#64748B", category:"Safety"   },
  { id:"intrusion",     label:"Intrusion Detection",  desc:"Perimeter breach & unauthorized access",       icon:ShieldAlert,      color:"#E7000B", category:"Security" },
  { id:"loitering",     label:"Loitering",            desc:"Detects stationary presence in zones",         icon:PersonStanding,   color:"#64748B", category:"Security" },
  { id:"face",          label:"Facial Recognition",   desc:"Identify known and unknown individuals",       icon:ScanFace,         color:"#2B7FFF", category:"Security" },
  { id:"weapon",        label:"Weapon Detection",     desc:"Firearms & bladed objects in frame",           icon:AlertTriangle,    color:"#E7000B", category:"Security" },
  { id:"tailgating",    label:"Tailgating",           desc:"Piggybacking through access control points",   icon:Users,            color:"#EA580C", category:"Security" },
  { id:"vandal",        label:"Vandalism",            desc:"Graffiti, damage & property destruction",      icon:AlertTriangle,    color:"#E19A04", category:"Security" },
  { id:"abandoned",     label:"Abandoned Object",     desc:"Unattended bags, boxes & luggage",             icon:Package,          color:"#64748B", category:"Security" },
  { id:"fence",         label:"Fence Climbing",       desc:"Perimeter fence breach attempt detection",     icon:ShieldAlert,      color:"#E7000B", category:"Security" },
  { id:"cam_tamper",    label:"Camera Tamper",        desc:"Detects obstruction or misalignment",          icon:Eye,              color:"#64748B", category:"Security" },
  { id:"access",        label:"Access Control",       desc:"Door & turnstile unauthorized entry",          icon:Lock,             color:"#2B7FFF", category:"Security" },
  { id:"fight",         label:"Fight Detection",      desc:"Physical altercation in real-time",            icon:AlertTriangle,    color:"#E7000B", category:"Security" },
  { id:"mask",          label:"Mask Detection",       desc:"Enforces face-covering compliance",            icon:ShieldAlert,      color:"#00775B", category:"Security" },
  { id:"footfall",      label:"Footfall Counter",     desc:"People counting & entry/exit tracking",        icon:Footprints,       color:"#2B7FFF", category:"Retail"   },
  { id:"queue",         label:"Queue Analytics",      desc:"Queue length and wait time measurement",       icon:Users,            color:"#00775B", category:"Retail"   },
  { id:"shelf",         label:"Shelf Monitoring",     desc:"Out-of-stock & product placement alerts",      icon:Package,          color:"#E19A04", category:"Retail"   },
  { id:"heatmap",       label:"Zone Heatmap",         desc:"Customer dwell time & hot-zone mapping",       icon:Map,              color:"#EA580C", category:"Retail"   },
  { id:"checkout",      label:"Checkout Fraud",       desc:"Point-of-sale shrinkage detection",            icon:ShoppingCart,     color:"#E7000B", category:"Retail"   },
  { id:"age",           label:"Age Estimation",       desc:"Demographic profiling for marketing",          icon:Users,            color:"#2B7FFF", category:"Retail"   },
  { id:"shopper",       label:"Shopper Journey",      desc:"End-to-end customer path analytics",           icon:MousePointerClick,color:"#00775B", category:"Retail"   },
  { id:"cart",          label:"Cart Abandonment",     desc:"Identifies shoppers leaving without purchase", icon:ShoppingCart,     color:"#64748B", category:"Retail"   },
  { id:"engagement",    label:"Display Engagement",   desc:"Attention time on product displays",           icon:Eye,              color:"#E19A04", category:"Retail"   },
  { id:"staff_retail",  label:"Staff Efficiency",     desc:"Associate task tracking and idle detection",   icon:Activity,         color:"#00775B", category:"Retail"   },
  { id:"lpr",           label:"License Plate",        desc:"Automatic number plate recognition",           icon:Car,              color:"#2B7FFF", category:"Traffic"  },
  { id:"speed",         label:"Speed Detection",      desc:"Vehicle speed estimation & overspeed alerts",  icon:Gauge,            color:"#E7000B", category:"Traffic"  },
  { id:"wrong_way",     label:"Wrong-Way Driver",     desc:"Contra-flow vehicle movement alerts",          icon:Car,              color:"#EA580C", category:"Traffic"  },
  { id:"parking",       label:"Parking Analytics",    desc:"Occupancy tracking & overstay detection",      icon:Car,              color:"#64748B", category:"Traffic"  },
  { id:"congestion",    label:"Congestion Monitor",   desc:"Traffic density and jam detection",            icon:Activity,         color:"#E19A04", category:"Traffic"  },
  { id:"illegal_park",  label:"Illegal Parking",      desc:"No-park zone & fire-lane violations",          icon:AlertTriangle,    color:"#E7000B", category:"Traffic"  },
  { id:"veh_class",     label:"Vehicle Class",        desc:"Classify trucks, cars, bikes & more",          icon:Truck,            color:"#2B7FFF", category:"Traffic"  },
  { id:"signal",        label:"Signal Violation",     desc:"Red-light & signal running detection",         icon:MonitorCheck,     color:"#E7000B", category:"Traffic"  },
  { id:"pedestrian",    label:"Pedestrian Safety",    desc:"Crosswalk compliance & near-miss alerts",      icon:PersonStanding,   color:"#00775B", category:"Traffic"  },
  { id:"incident",      label:"Traffic Incident",     desc:"Accident & road hazard identification",        icon:AlertTriangle,    color:"#EA580C", category:"Traffic"  },
  { id:"drone",         label:"Drone Detection",      desc:"Airspace intrusion by UAVs",                   icon:Wifi,             color:"#64748B", category:"Traffic"  },
];

const CATEGORIES: AppCategory[] = ["All", "Safety", "Security", "Retail", "Traffic"];

// ─── Themed Primitives ────────────────────────────────────────────────────────

function DLabel({ children, required, t }: { children: React.ReactNode; required?: boolean; t: Theme }) {
  return (
    <label className="block text-[11px] font-semibold uppercase tracking-[0.07em] mb-[6px]"
      style={{ ...INTER, color: t.label }}>
      {children}{required && <span className="text-[#E7000B] ml-0.5">*</span>}
    </label>
  );
}

function DInput({ value, onChange, placeholder, t }: {
  value: string; onChange: (v: string) => void; placeholder?: string; t: Theme;
}) {
  return (
    <input type="text" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
      style={{ ...INTER, backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.inputText }}
      className="w-full h-10 px-4 rounded-[4px] border text-[14px] placeholder:text-[#94A3B8] transition-all duration-200 focus:outline-none focus:ring-2"
      onFocus={e => { e.target.style.borderColor = t.primary; e.target.style.boxShadow = `0 0 0 2px ${t.primaryGlow}`; }}
      onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
    />
  );
}

function DSelect({ value, onChange, options, placeholder, t }: {
  value: string; onChange: (v: string) => void; options: string[]; placeholder?: string; t: Theme;
}) {
  return (
    <div className="relative">
      <select value={value} onChange={e => onChange(e.target.value)}
        style={{ ...INTER, backgroundColor: t.inputBg, borderColor: t.inputBorder, color: value ? t.inputText : t.inputPlaceholder }}
        className="w-full h-10 px-4 pr-10 rounded-[4px] border text-[14px] appearance-none cursor-pointer transition-all duration-200 focus:outline-none"
        onFocus={e => { e.target.style.borderColor = t.primary; e.target.style.boxShadow = `0 0 0 2px ${t.primaryGlow}`; }}
        onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}>
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: t.inputPlaceholder }} />
    </div>
  );
}

function DSlider({ label, value, min, max, unit, onChange, t }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void; t: Theme;
}) {
  return (
    <div>
      <div className="flex justify-between mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.05em]" style={{ ...INTER, color: t.label }}>{label}</span>
        <span className="text-[12px] font-semibold" style={{ ...MONO, color: t.primary }}>{value}{unit}</span>
      </div>
      <input type="range" min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#00775B] cursor-pointer" />
    </div>
  );
}

function DAccordion({ label, children, open, onToggle, t }: {
  label: string; children: React.ReactNode; open: boolean; onToggle: () => void; t: Theme;
}) {
  return (
    <div className="mt-5">
      <button onClick={onToggle} className="flex items-center gap-1.5 text-[12px] font-semibold transition-colors"
        style={{ ...INTER, color: t.primary }}>
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}{label}
      </button>
      {open && <div className="mt-4 space-y-4">{children}</div>}
    </div>
  );
}

function DTagInput({ tags, onChange, t }: { tags: string[]; onChange: (v: string[]) => void; t: Theme }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const val = draft.trim().replace(/^#/, "");
    if (val && !tags.includes(val)) onChange([...tags, val]);
    setDraft("");
  };
  return (
    <div>
      <div className="relative flex items-center">
        <input type="text" value={draft} onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()} placeholder="e.g. security, retail…"
          style={{ ...INTER, backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.inputText }}
          className="w-full h-10 pl-4 pr-16 rounded-[4px] border text-[14px] placeholder:text-[#94A3B8] focus:outline-none transition-all"
          onFocus={e => { e.target.style.borderColor = t.primary; e.target.style.boxShadow = `0 0 0 2px ${t.primaryGlow}`; }}
          onBlur={e => { e.target.style.borderColor = t.inputBorder; e.target.style.boxShadow = "none"; }}
        />
        <button onClick={add} disabled={!draft.trim()}
          className={cn("absolute right-1.5 h-7 px-3 rounded-[3px] text-[12px] font-semibold transition-all",
            draft.trim() ? "text-white" : "cursor-not-allowed")}
          style={{ backgroundColor: draft.trim() ? t.primary : t.chipInactiveBg, color: draft.trim() ? "#fff" : t.chipInactiveText }}
        >{draft.trim() ? "Add" : "Add"}</button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map(tag => (
            <span key={tag} className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[12px] font-medium"
              style={{ backgroundColor: t.primaryGlow, border: `1px solid ${t.primary}40`, color: t.primary }}>
              <Tag className="w-3 h-3" />{tag}
              <button onClick={() => onChange(tags.filter(x => x !== tag))} className="ml-0.5 hover:opacity-70"><X className="w-3 h-3" /></button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

function DDeviceSelect({ selected, onChange, t }: { selected: string[]; onChange: (d: string[]) => void; t: Theme }) {
  const toggle = (d: string) => selected.includes(d) ? onChange(selected.filter(x => x !== d)) : onChange([...selected, d]);
  return (
    <div className="flex flex-wrap gap-2">
      {DEVICE_OPTIONS.map(d => (
        <button key={d} onClick={() => toggle(d)} style={INTER}
          className="px-3 py-1.5 rounded-[4px] border text-[12px] font-semibold transition-all duration-150"
          style={{ backgroundColor: selected.includes(d) ? t.primaryGlow : t.chipInactiveBg,
            borderColor: selected.includes(d) ? t.primary : t.inputBorder,
            color: selected.includes(d) ? t.primary : t.chipInactiveText }}>
          {selected.includes(d) && <Check className="inline w-3 h-3 mr-1" />}{d}
        </button>
      ))}
    </div>
  );
}

// ─── Camera filled icon SVG ───────────────────────────────────────────────────
function CameraFilledIcon({ size = 14, color = "currentColor" }: { size?: number; color?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 16" fill="none">
      <path d="M7 0L5.5 2H2C0.9 2 0 2.9 0 4V14C0 15.1 0.9 16 2 16H18C19.1 16 20 15.1 20 14V4C20 2.9 19.1 2 18 2H14.5L13 0H7ZM10 13C7.8 13 6 11.2 6 9C6 6.8 7.8 5 10 5C12.2 5 14 6.8 14 9C14 11.2 12.2 13 10 13ZM10 7C8.9 7 8 7.9 8 9C8 10.1 8.9 11 10 11C11.1 11 12 10.1 12 9C12 7.9 11.1 7 10 7Z"
        fill={color} />
    </svg>
  );
}

// ─── Camera Card ─────────────────────────────────────────────────────────────
function CameraCard({ cam, onRemove, t }: { cam: CameraEntry; onRemove: () => void; t: Theme }) {
  const protocolColor = cam.protocol === "RTSP" ? "#00775B"
    : cam.protocol === "IP" ? "#2B7FFF" : "#7C3AED";

  const urlHost = cam.url
    ? cam.url.replace(/^(rtsp|http|https):\/\//, "").split("/")[0]
    : cam.protocol === "FILE" ? "video file" : "";

  return (
    <div
      style={{
        display: "flex", flexDirection: "column", gap: "6px",
        padding: "9px 10px",
        borderRadius: "8px",
        backgroundColor: t.isDark ? "#0A0F1A" : "#FFFFFF",
        border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
        borderLeft: `3px solid ${protocolColor}`,
        transition: "box-shadow 0.15s",
        minWidth: 0, position: "relative",
      }}
      onMouseEnter={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow =
          t.isDark ? "0 3px 10px rgba(0,0,0,0.4)" : "0 3px 10px rgba(0,0,0,0.07)";
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLDivElement).style.boxShadow = "none";
      }}
    >
      {/* Row 1: icon | name | protocol badge | × */}
      <div style={{ display: "flex", alignItems: "center", gap: "7px", minWidth: 0 }}>
        <div style={{
          width: "22px", height: "22px", borderRadius: "5px", flexShrink: 0,
          backgroundColor: `${protocolColor}12`,
          border: `1px solid ${protocolColor}22`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}>
          <CameraFilledIcon size={11} color={protocolColor} />
        </div>
        <div style={{
          ...INTER, fontSize: "12px", fontWeight: 600, flex: 1, minWidth: 0,
          color: t.isDark ? "#E2E8F0" : "#0F172A",
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>
          {cam.name}
        </div>
        <span style={{
          ...MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em",
          padding: "2px 6px", borderRadius: "4px", flexShrink: 0,
          backgroundColor: `${protocolColor}12`,
          border: `1px solid ${protocolColor}30`,
          color: protocolColor,
        }}>
          {cam.protocol}
        </span>
        <button
          onClick={onRemove}
          style={{
            width: "20px", height: "20px", borderRadius: "4px", flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            backgroundColor: "transparent", border: "none", cursor: "pointer",
            color: t.isDark ? "#475569" : "#94A3B8", transition: "all 0.15s",
          }}
          onMouseEnter={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.backgroundColor = t.isDark ? "#2D1B1B" : "#FEE2E2";
            el.style.color = "#E7000B";
          }}
          onMouseLeave={e => {
            const el = e.currentTarget as HTMLButtonElement;
            el.style.backgroundColor = "transparent";
            el.style.color = t.isDark ? "#475569" : "#94A3B8";
          }}
        >
          <X style={{ width: "11px", height: "11px" }} />
        </button>
      </div>

      {/* Row 2: host URL */}
      {urlHost && (
        <div style={{ paddingLeft: "29px" }}>
          <div style={{
            ...MONO, fontSize: "10px",
            color: t.isDark ? "#475569" : "#64748B",
            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {urlHost}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Bulk Upload Tab ──────────────────────────────────────────────────────────
function BulkUploadTab({ onBulkAdd, t }: {
  onBulkAdd: (cameras: Omit<CameraEntry, "id" | "apps">[]) => void;
  t: Theme;
}) {
  const [uploadDragging, setUploadDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock parsed cameras from the uploaded file
  const MOCK_BULK_CAMERAS: Omit<CameraEntry, "id" | "apps">[] = [
    { name: "Main Entrance", protocol: "RTSP", url: "rtsp://192.168.1.10/stream1" },
    { name: "Lobby A",       protocol: "RTSP", url: "rtsp://192.168.1.11/stream1" },
    { name: "Loading Bay",   protocol: "IP",   url: "http://192.168.1.20/video"   },
  ];

  const handleFileDrop = (file: File) => {
    setUploadedFile(file);
    setReviewMode(true);
  };

  const borderColor = uploadDragging ? t.primary : t.inputBorder;

  if (reviewMode && uploadedFile) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        {/* File summary */}
        <div style={{
          display: "flex", alignItems: "center", gap: "10px",
          padding: "10px 14px", borderRadius: "6px",
          backgroundColor: t.isDark ? "#0A0F1A" : "#F8FAFC",
          border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
        }}>
          <div style={{
            width: "32px", height: "32px", borderRadius: "4px",
            backgroundColor: "#00775B15", border: "1px solid #00775B30",
            display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="2" stroke="#00775B" strokeWidth="1.2" />
              <path d="M3.5 5h7M3.5 7.5h5M3.5 10h3.5" stroke="#00775B" strokeWidth="1" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ ...INTER, fontSize: "12px", fontWeight: 600, color: t.isDark ? "#E2E8F0" : "#0F172A" }}>
              {uploadedFile.name}
            </div>
            <div style={{ ...MONO, fontSize: "10px", color: t.sectionLabel }}>
              {MOCK_BULK_CAMERAS.length} cameras detected · {(uploadedFile.size / 1024).toFixed(1)} KB
            </div>
          </div>
          <button
            onClick={() => { setReviewMode(false); setUploadedFile(null); }}
            style={{ background: "none", border: "none", cursor: "pointer", color: t.sectionLabel, padding: "4px" }}
          >
            <X style={{ width: "14px", height: "14px" }} />
          </button>
        </div>

        {/* Review table */}
        <div>
          <div style={{ ...INTER, fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: t.sectionLabel, marginBottom: "8px" }}>
            Review & Confirm ({MOCK_BULK_CAMERAS.length} cameras)
          </div>
          <div style={{ borderRadius: "6px", overflow: "hidden", border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}` }}>
            {/* Table header */}
            <div style={{
              display: "grid", gridTemplateColumns: "1fr 80px 1fr",
              padding: "8px 12px",
              backgroundColor: t.isDark ? "#0F172A" : "#F8FAFC",
              borderBottom: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
            }}>
              {["CAMERA NAME", "PROTOCOL", "STREAM URL"].map(h => (
                <span key={h} style={{ ...MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.08em", color: t.sectionLabel }}>{h}</span>
              ))}
            </div>
            {/* Rows */}
            {MOCK_BULK_CAMERAS.map((cam, i) => {
              const protocolColor = cam.protocol === "RTSP" ? "#00775B" : cam.protocol === "IP" ? "#2B7FFF" : "#64748B";
              return (
                <div key={i} style={{
                  display: "grid", gridTemplateColumns: "1fr 80px 1fr",
                  padding: "10px 12px", alignItems: "center",
                  borderBottom: i < MOCK_BULK_CAMERAS.length - 1 ? `1px solid ${t.isDark ? "#0F172A" : "#F1F5F9"}` : "none",
                  backgroundColor: t.isDark ? "#020617" : "#FFFFFF",
                }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <CameraFilledIcon size={12} color={t.primary} />
                    <span style={{ ...INTER, fontSize: "12px", fontWeight: 500, color: t.isDark ? "#CBD5E1" : "#334155" }}>{cam.name}</span>
                  </div>
                  <span style={{
                    ...MONO, fontSize: "9px", fontWeight: 700,
                    padding: "2px 6px", borderRadius: "3px", width: "fit-content",
                    backgroundColor: `${protocolColor}15`, color: protocolColor,
                  }}>{cam.protocol}</span>
                  <span style={{ ...MONO, fontSize: "10px", color: t.sectionLabel, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{cam.url}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Confirm button */}
        <button
          onClick={() => { onBulkAdd(MOCK_BULK_CAMERAS); setReviewMode(false); setUploadedFile(null); }}
          style={{
            ...INTER, alignSelf: "flex-start",
            display: "flex", alignItems: "center", gap: "8px",
            padding: "10px 20px", borderRadius: "4px",
            backgroundColor: "#00775B", color: "#fff",
            fontSize: "13px", fontWeight: 600, cursor: "pointer", border: "none",
            boxShadow: "0 2px 8px rgba(0,119,91,0.3)",
          }}
        >
          <Check style={{ width: "14px", height: "14px" }} />
          Add {MOCK_BULK_CAMERAS.length} Cameras
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Template download cards */}
      <div>
        <div style={{ ...INTER, fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: t.sectionLabel, marginBottom: "8px" }}>
          1. Download Template
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
          {[
            { label: "Excel Template", ext: "XLSX", desc: "Download, fill and upload", accentColor: "#1D6F42" },
            { label: "CSV Template",   ext: "CSV",  desc: "Download, fill and upload", accentColor: "#2B7FFF" },
          ].map(tmpl => (
            <button
              key={tmpl.ext}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                padding: "10px 12px", borderRadius: "6px", cursor: "pointer",
                backgroundColor: t.isDark ? "#0A0F1A" : "#FFFFFF",
                border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
                transition: "all 0.15s", textAlign: "left",
              }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.primary; }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = t.isDark ? "#1E293B" : "#E2E8F0"; }}
            >
              {/* File type icon */}
              <div style={{
                width: "34px", height: "34px", borderRadius: "5px", flexShrink: 0,
                backgroundColor: `${tmpl.accentColor}14`,
                border: `1px solid ${tmpl.accentColor}30`,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
              }}>
                <span style={{ ...MONO, fontSize: "8px", fontWeight: 800, color: tmpl.accentColor, letterSpacing: "0.02em" }}>{tmpl.ext}</span>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...INTER, fontSize: "12px", fontWeight: 600, color: t.isDark ? "#CBD5E1" : "#334155" }}>{tmpl.label}</div>
                <div style={{ ...INTER, fontSize: "10px", color: t.sectionLabel, marginTop: "1px" }}>{tmpl.desc}</div>
              </div>
              {/* Download arrow */}
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0, color: t.sectionLabel }}>
                <path d="M7 1v8M4 6l3 3 3-3M2 12h10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ))}
        </div>
      </div>

      {/* File drop zone */}
      <div>
        <div style={{ ...INTER, fontSize: "11px", fontWeight: 600, letterSpacing: "0.07em", textTransform: "uppercase", color: t.sectionLabel, marginBottom: "8px" }}>
          2. Upload Filled File
        </div>
        <div
          onClick={() => fileInputRef.current?.click()}
          onDragOver={e => { e.preventDefault(); setUploadDragging(true); }}
          onDragLeave={() => setUploadDragging(false)}
          onDrop={e => {
            e.preventDefault(); setUploadDragging(false);
            const f = e.dataTransfer.files[0];
            if (f) handleFileDrop(f);
          }}
          style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            gap: "8px", padding: "28px 20px", borderRadius: "6px", cursor: "pointer",
            border: `1.5px dashed ${borderColor}`,
            backgroundColor: uploadDragging ? t.primaryGlow : t.isDark ? "#0A0F1A" : "#FAFAFA",
            transition: "all 0.15s",
          }}
        >
          <input ref={fileInputRef} type="file" accept=".xlsx,.xls,.csv" className="hidden"
            onChange={e => { const f = e.target.files?.[0]; if (f) handleFileDrop(f); }} />
          <div style={{
            width: "36px", height: "36px", borderRadius: "50%",
            backgroundColor: t.isDark ? "#0F172A" : "#F1F5F9",
            border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <Upload style={{ width: "16px", height: "16px", color: t.primary }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ ...INTER, fontSize: "13px", fontWeight: 600, color: t.isDark ? "#CBD5E1" : "#334155" }}>
              Drag & drop your file here
            </div>
            <div style={{ ...INTER, fontSize: "11px", color: t.sectionLabel, marginTop: "2px" }}>
              or click to browse · .xlsx, .csv · max 20 MB
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Step 1 — Multi-Camera Onboarding ─────────────────────────────────────────
function Step1({
  cameras, onAddCamera, onRemoveCamera, t,
}: {
  cameras: CameraEntry[];
  onAddCamera: (c: Omit<CameraEntry, "id" | "apps">) => void;
  onRemoveCamera: (id: string) => void;
  t: Theme;
}) {
  const [tab, setTab] = useState<"manual" | "bulk">("manual");
  const [name, setName] = useState("");
  const [protocol, setProtocol] = useState<"RTSP"|"IP"|"FILE">("RTSP");
  const [url, setUrl] = useState("");
  const [advOpen, setAdvOpen] = useState(false);
  const [fps, setFps] = useState(15);
  const [quality, setQuality] = useState(80);
  const [resolution, setResolution] = useState("720p");
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const canAdd = name.trim() && (protocol === "FILE" || url.trim());
  const atMax = cameras.length >= MAX_CAMERAS;

  const handleAdd = () => {
    if (!canAdd || atMax) return;
    onAddCamera({ name: name.trim(), protocol, url });
    setName(""); setUrl(""); setFileName(null);
  };

  const handleBulkAdd = (cams: Omit<CameraEntry, "id" | "apps">[]) => {
    const remaining = MAX_CAMERAS - cameras.length;
    cams.slice(0, remaining).forEach(c => onAddCamera(c));
  };

  const FIELD_GAP = "16px";

  const TabSwitcher = (
    <div style={{
      display: "flex",
      borderRadius: "8px",
      border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
      backgroundColor: t.isDark ? "#0A0F1A" : "#F1F5F9",
      padding: "4px",
      gap: "4px",
    }}>
      {([
        { key: "manual" as const, label: "Individual Cameras", sub: "Add one by one" },
        { key: "bulk"   as const, label: "Multiple Cameras",    sub: "Upload a file" },
      ] as const).map((item) => {
        const active = tab === item.key;
        return (
          <button
            key={item.key}
            onClick={() => setTab(item.key)}
            style={{
              ...INTER,
              flex: 1,
              padding: "9px 14px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: active ? 600 : 400,
              cursor: "pointer",
              border: "none",
              transition: "all 0.18s",
              backgroundColor: active
                ? t.isDark ? "#0F172A" : "#FFFFFF"
                : "transparent",
              color: active
                ? t.isDark ? "#F1F5F9" : "#0F172A"
                : t.sectionLabel,
              boxShadow: active
                ? t.isDark
                  ? "0 1px 4px rgba(0,0,0,0.4)"
                  : "0 1px 3px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.04)"
                : "none",
              textAlign: "left" as const,
              display: "flex",
              flexDirection: "column" as const,
              gap: "2px",
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              {item.label}
              {active && (
                <span style={{
                  ...MONO, fontSize: "8px", fontWeight: 700,
                  padding: "1px 5px", borderRadius: "3px",
                  backgroundColor: `${t.primary}20`,
                  color: t.primary,
                }}>
                  {item.key === "manual" ? "ADD" : "BULK"}
                </span>
              )}
            </span>
            <span style={{
              ...INTER, fontSize: "11px", fontWeight: 400,
              color: active
                ? t.isDark ? "#64748B" : "#94A3B8"
                : t.isDark ? "#253328" : "#CBD5E1",
            }}>
              {item.sub}
            </span>
          </button>
        );
      })}
    </div>
  );

  return (
    <div style={{ display: "flex", gap: "24px", alignItems: "flex-start" }}>

      {/* ── LEFT: Tab switcher + Form ────────────────────────────────────── */}
      <div style={{ flex: "0 0 52%", display: "flex", flexDirection: "column", gap: FIELD_GAP }}>
        {TabSwitcher}

          {/* Manual tab form */}
          {tab === "manual" && (
            <>
              {/* Camera name */}
              <div>
                <DLabel required t={t}>Camera Name</DLabel>
                <DInput value={name} onChange={setName} placeholder="e.g. Main Entrance, Lobby, Loading Bay…" t={t} />
              </div>

              {/* Protocol toggle */}
              <div>
                <DLabel required t={t}>Protocol</DLabel>
                <div className="flex rounded-[4px] overflow-hidden w-fit" style={{ border: `1px solid ${t.inputBorder}` }}>
                  {(["RTSP","IP","FILE"] as const).map(p => (
                    <button key={p} onClick={() => setProtocol(p)} style={INTER}
                      className="px-6 py-2 text-[13px] font-semibold transition-all duration-150"
                      style={{ backgroundColor: protocol === p ? t.primary : t.inputBg, color: protocol === p ? "#fff" : t.chipInactiveText }}>
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* RTSP / IP fields — each field its own gap slot */}
              {(protocol === "RTSP" || protocol === "IP") && (
                <>
                  <div>
                    <DLabel required t={t}>Stream URL</DLabel>
                    <DInput value={url} onChange={setUrl}
                      placeholder={protocol === "RTSP" ? "rtsp://192.168.1.100:554/stream" : "http://192.168.1.100/video"} t={t} />
                  </div>
                  <div>
                    <DLabel t={t}>Camera Feed Path</DLabel>
                    <div className="flex gap-2">
                      <DInput value="" onChange={() => {}} placeholder="Camera Feed Path (Optional)" t={t} />
                      <button style={{ ...INTER, borderColor: t.primary, color: t.primary }}
                        className="shrink-0 h-10 px-4 rounded-[4px] border text-[13px] font-semibold transition-colors whitespace-nowrap hover:opacity-80">
                        Detect Codec
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* FILE: drag & drop */}
              {protocol === "FILE" && (
                <div>
                  <DLabel t={t}>Video File</DLabel>
                  <div
                    onClick={() => fileRef.current?.click()}
                    onDragOver={e => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={e => { e.preventDefault(); setDragging(false); const f = e.dataTransfer.files[0]; if (f) setFileName(f.name); }}
                    className="flex flex-col items-center justify-center gap-3 py-8 rounded-[6px] border-2 border-dashed cursor-pointer transition-all duration-200"
                    style={{ borderColor: dragging ? t.primary : t.inputBorder, backgroundColor: dragging ? t.primaryGlow : t.inputBg }}>
                    <input ref={fileRef} type="file" accept=".mp4,.avi,.mov,.wmv,.flv" className="hidden"
                      onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }} />
                    <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ backgroundColor: t.primary }}>
                      <Upload className="w-5 h-5 text-white" />
                    </div>
                    <div style={INTER} className="text-center">
                      {fileName ? (
                        <>
                          <div className="text-[14px] font-semibold" style={{ color: t.primary }}>{fileName}</div>
                          <div className="text-[12px] mt-0.5" style={{ color: t.label }}>Click to change file</div>
                        </>
                      ) : (
                        <>
                          <div className="text-[14px] font-semibold" style={{ color: t.title }}>Drag and drop a video here</div>
                          <div className="text-[12px] mt-0.5" style={{ color: t.label }}>or click to browse</div>
                          <div className="text-[11px] mt-2" style={{ color: t.sectionLabel }}>Supported: .mp4, .avi, .mov, .wmv, .flv (max 500MB)</div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Advanced accordion */}
              <DAccordion label="+ Advanced Configuration" open={advOpen} onToggle={() => setAdvOpen(o => !o)} t={t}>
                <div className="grid grid-cols-2 gap-5">
                  <div><DLabel t={t}>Resolution</DLabel>
                    <DSelect value={resolution} onChange={setResolution} options={["480p","720p","1080p","4K"]} t={t} />
                  </div>
                  <div><DLabel t={t}>Camera Make</DLabel>
                    <DInput value="" onChange={() => {}} placeholder="e.g. Hikvision" t={t} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8">
                  <DSlider label="Streaming FPS" value={fps} min={1} max={60} unit=" fps" onChange={setFps} t={t} />
                  <DSlider label="Video Quality" value={quality} min={10} max={100} unit="%" onChange={setQuality} t={t} />
                </div>
              </DAccordion>

              {/* Add camera button */}
              <div>
                <button onClick={handleAdd} disabled={!canAdd || atMax}
                  className="flex items-center gap-2 h-10 px-5 rounded-[4px] text-[14px] font-semibold transition-all duration-200 active:scale-[0.98]"
                  style={{ ...INTER,
                    backgroundColor: canAdd && !atMax ? t.primary : t.chipInactiveBg,
                    color: canAdd && !atMax ? "#fff" : t.chipInactiveText,
                    cursor: canAdd && !atMax ? "pointer" : "not-allowed",
                    boxShadow: canAdd && !atMax ? "0 2px 8px rgba(0,119,91,0.25)" : "none",
                  }}>
                  <Plus className="w-4 h-4" />
                  {atMax ? `Max ${MAX_CAMERAS} cameras reached` : "Add Camera"}
                </button>
              </div>
            </>
          )}

          {/* Bulk tab */}
          {tab === "bulk" && (
            <BulkUploadTab onBulkAdd={handleBulkAdd} t={t} />
          )}
        </div>

        {/* ── RIGHT: Added Cameras panel ──────────────────────────────────── */}
        <div style={{
          flex: 1,
          borderRadius: "10px",
          border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
          backgroundColor: t.isDark ? "#0A0F1A" : "#F8FAFC",
          overflow: "hidden",
          minHeight: "320px",
          display: "flex",
          flexDirection: "column",
        }}>
          {/* Panel header */}
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "12px 16px",
            borderBottom: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
            backgroundColor: t.isDark ? "#0F172A" : "#F1F5F9",
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <CameraFilledIcon size={13} color={t.primary} />
              <span style={{ ...INTER, fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: t.isDark ? "#94A3B8" : "#475569" }}>
                Added Cameras
              </span>
            </div>
            <span style={{
              ...MONO, fontSize: "10px", fontWeight: 700,
              padding: "2px 8px", borderRadius: "10px",
              backgroundColor: cameras.length > 0 ? t.primaryGlow : t.isDark ? "#1E293B" : "#E2E8F0",
              border: `1px solid ${cameras.length > 0 ? `${t.primary}40` : t.isDark ? "#334155" : "#CBD5E1"}`,
              color: cameras.length > 0 ? t.primary : t.sectionLabel,
              transition: "all 0.2s",
            }}>
              {cameras.length} / {MAX_CAMERAS}
            </span>
          </div>

          {/* Panel body */}
          <div style={{ flex: 1, padding: "14px", overflowY: "auto" }}>
            {cameras.length === 0 ? (
              /* Empty state */
              <div style={{
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                height: "100%", gap: "10px", padding: "32px 16px", textAlign: "center",
              }}>
                <div style={{
                  width: "44px", height: "44px", borderRadius: "10px",
                  backgroundColor: t.isDark ? "#1E293B" : "#E2E8F0",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CameraFilledIcon size={20} color={t.isDark ? "#334155" : "#94A3B8"} />
                </div>
                <div>
                  <div style={{ ...INTER, fontSize: "13px", fontWeight: 600, color: t.isDark ? "#334155" : "#94A3B8", marginBottom: "4px" }}>
                    No cameras added yet
                  </div>
                  <div style={{ ...INTER, fontSize: "11px", color: t.isDark ? "#1E293B" : "#CBD5E1" }}>
                    Fill in the form and click "Add Camera"
                  </div>
                </div>
              </div>
            ) : (
              /* 2-column camera grid */
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px" }}>
                {cameras.map(cam => (
                  <CameraCard key={cam.id} cam={cam} onRemove={() => onRemoveCamera(cam.id)} t={t} />
                ))}
              </div>
            )}
          </div>
        </div>

      </div>
  );
}

// ─── Step 2 — Project ─────────────────────────────────────────────────────────
function Step2({ form, setForm, t }: { form: ProjectForm; setForm: (f: ProjectForm) => void; t: Theme }) {
  const [advOpen, setAdvOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div><DLabel required t={t}>Project Name</DLabel>
        <DInput value={form.name} onChange={v => setForm({...form, name: v})} placeholder="e.g. Singapore Flagship Store" t={t} />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div><DLabel required t={t}>Industry</DLabel>
          <DSelect value={form.industry} onChange={v => setForm({...form, industry: v})} options={INDUSTRIES} placeholder="Select industry…" t={t} />
        </div>
        <div><DLabel t={t}>License</DLabel>
          <DSelect value={form.license} onChange={v => setForm({...form, license: v})} options={LICENSES} placeholder="Select license…" t={t} />
        </div>
      </div>
      <div><DLabel t={t}>Tags</DLabel>
        <DTagInput tags={form.tags} onChange={tags => setForm({...form, tags})} t={t} />
      </div>
      <DAccordion label="+ Advanced Options" open={advOpen} onToggle={() => setAdvOpen(o => !o)} t={t}>
        <div className="grid grid-cols-2 gap-5">
          <div><DLabel t={t}>Country</DLabel>
            <DSelect value={form.country} onChange={v => setForm({...form, country: v})} options={COUNTRIES} t={t} />
          </div>
          <div><DLabel t={t}>Compute Type</DLabel>
            <DSelect value={form.computeType} onChange={v => setForm({...form, computeType: v})} options={COMPUTE_TYPES} t={t} />
          </div>
        </div>
        <div><DLabel t={t}>Storage Type</DLabel>
          <div className="w-1/2">
            <DSelect value={form.storageType} onChange={v => setForm({...form, storageType: v})} options={STORAGE_TYPES} t={t} />
          </div>
        </div>
        <div><DLabel t={t}>Supported Devices</DLabel>
          <DDeviceSelect selected={form.supportedDevices} onChange={d => setForm({...form, supportedDevices: d})} t={t} />
        </div>
      </DAccordion>
    </div>
  );
}

// ─── Step 3 — Pipeline + Per-Camera App Binding ───────────────────────────────
const CATEGORIES_LIST: AppCategory[] = ["All", "Safety", "Security", "Retail", "Traffic"];

function AppGrid({ cameraId, cameras, onToggleApp, t }: {
  cameraId: string;
  cameras: CameraEntry[];
  onToggleApp: (camId: string, appId: string) => void;
  t: Theme;
}) {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<AppCategory>("All");
  const cam = cameras.find(c => c.id === cameraId);
  if (!cam) return null;

  const filtered = AI_APPS.filter(app => {
    const matchCat = activeCategory === "All" || app.category === activeCategory;
    const q = search.toLowerCase();
    return matchCat && (!q || app.label.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q));
  });

  return (
    <div className="rounded-[6px] overflow-hidden" style={{ border: `1px solid ${t.cardBorder}` }}>
      {/* Search + chips */}
      <div className="px-3 pt-3 pb-2.5" style={{ backgroundColor: t.isDark ? "#0F172A" : "#F8FAFC", borderBottom: `1px solid ${t.divider}` }}>
        <div className="relative flex items-center">
          <Search className="absolute left-3 w-4 h-4" style={{ color: t.inputPlaceholder }} />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder={`Search ${AI_APPS.length}+ applications…`} style={INTER}
            className="w-full h-9 pl-9 pr-4 rounded-[4px] border text-[13px] focus:outline-none transition-all"
            style={{ backgroundColor: t.inputBg, borderColor: t.inputBorder, color: t.inputText }}
          />
          {search && <button onClick={() => setSearch("")} className="absolute right-3">
            <X className="w-3.5 h-3.5" style={{ color: t.inputPlaceholder }} />
          </button>}
        </div>
        <div className="flex items-center gap-2 mt-2 overflow-x-auto pb-0.5">
          {CATEGORIES_LIST.map(cat => (
            <button key={cat} onClick={() => setActiveCategory(cat)} style={INTER}
              className="shrink-0 h-7 px-3 rounded-full text-[12px] font-semibold transition-all duration-150"
              style={{
                backgroundColor: activeCategory === cat ? t.primary : t.chipInactiveBg,
                color: activeCategory === cat ? "#fff" : t.chipInactiveText,
                boxShadow: activeCategory === cat ? `0 1px 6px ${t.primaryGlow}` : "none",
              }}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="overflow-y-auto" style={{
        maxHeight: "360px",
        backgroundColor: t.gridBg,
        WebkitMaskImage: filtered.length > 12 ? "linear-gradient(to bottom, black 82%, transparent 100%)" : undefined,
        maskImage: filtered.length > 12 ? "linear-gradient(to bottom, black 82%, transparent 100%)" : undefined,
      }}>
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center" style={INTER}>
            <Search className="w-8 h-8 mb-3" style={{ color: t.divider }} />
            <div className="text-[13px] font-semibold" style={{ color: t.sectionLabel }}>No applications found</div>
          </div>
        ) : (
          <div className="grid grid-cols-3" style={{ backgroundColor: t.divider, gap: "1px" }}>
            {filtered.map(app => {
              const selected = cam.apps.has(app.id);
              const Icon = app.icon;
              return (
                <button key={app.id} onClick={() => onToggleApp(cameraId, app.id)}
                  className="group flex items-center gap-2.5 px-3 py-3 text-left transition-all duration-150"
                  style={{
                    backgroundColor: selected
                      ? t.isDark ? "rgba(0,119,91,0.12)" : "#E5FFF9"
                      : t.gridItemBg,
                    // No border on individual cards — grid gap provides the separator
                    border: selected
                      ? `1px solid ${t.primary}50`
                      : "1px solid transparent",
                  }}>
                  {/* Icon container — teal on select, neutral otherwise */}
                  <div className="w-8 h-8 rounded-[6px] flex items-center justify-center shrink-0 transition-all"
                    style={{ backgroundColor: selected
                      ? t.isDark ? "rgba(0,119,91,0.20)" : "rgba(0,119,91,0.12)"
                      : t.isDark ? "#0F172A" : "#F1F5F9" }}>
                    <Icon className="w-4 h-4 transition-colors"
                      style={{ color: selected ? t.primary : t.gridItemText }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold leading-tight truncate"
                      style={{ color: selected ? (t.isDark ? "#E2E8F0" : "#001E18") : t.gridItemText }}>
                      {app.label}
                    </div>
                    <div className="text-[10px] leading-tight mt-0.5 truncate"
                      style={{ color: t.gridItemSub }}>
                      {app.desc}
                    </div>
                  </div>
                  {/* Check circle — teal when selected */}
                  <div className="w-4 h-4 rounded-full shrink-0 flex items-center justify-center transition-all"
                    style={{
                      backgroundColor: selected ? t.primary : "transparent",
                      border: selected ? "none" : `1px solid ${t.inputBorder}`,
                    }}>
                    {selected && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 flex items-center justify-between" style={{ backgroundColor: t.isDark ? "#0F172A" : "#F8FAFC", borderTop: `1px solid ${t.divider}` }}>
        <span className="text-[11px]" style={{ ...INTER, color: t.sectionLabel }}>{filtered.length} apps</span>
        {cam.apps.size > 0 && (
          <span className="text-[11px] font-semibold" style={{ ...INTER, color: t.primary }}>{cam.apps.size} bound to this camera</span>
        )}
      </div>
    </div>
  );
}

function Step3({ pipelineForm, setPipelineForm, t }: {
  pipelineForm: PipelineForm;
  setPipelineForm: (f: PipelineForm) => void;
  t: Theme;
}) {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-5">
        <div><DLabel required t={t}>Pipeline Name</DLabel>
          <DInput value={pipelineForm.name} onChange={v => setPipelineForm({...pipelineForm, name: v})} placeholder="e.g. Main-Entrance-Pipeline" t={t} />
        </div>
        <div><DLabel required t={t}>Cluster</DLabel>
          <DSelect value={pipelineForm.cluster} onChange={v => setPipelineForm({...pipelineForm, cluster: v})} options={CLUSTERS} placeholder="Select cluster…" t={t} />
        </div>
      </div>
      <div><DLabel t={t}>Description</DLabel>
        <DInput value={pipelineForm.description} onChange={v => setPipelineForm({...pipelineForm, description: v})} placeholder="Optional pipeline description" t={t} />
      </div>
    </div>
  );
}

// ─── Step 4 — Launch ──────────────────────────────────────────────────────────
type LaunchPhase = "confirm" | "booting" | "success";

function Step4({ onComplete, onFadeStart, cameras, projectForm, pipelineForm, t, onPhaseChange }: {
  onComplete: (dest: "vms"|"analytics") => void;
  onFadeStart: () => void;
  cameras: CameraEntry[];
  projectForm: ProjectForm;
  pipelineForm: PipelineForm;
  t: Theme;
  onPhaseChange?: (p: LaunchPhaseTop) => void;
}) {
  const [phase, setPhase] = useState<LaunchPhase>("confirm");
  const setPhaseWithNotify = (p: LaunchPhase) => { setPhase(p); onPhaseChange?.(p as LaunchPhaseTop); };
  const [progress, setProgress] = useState(0);
  const [bootMsg, setBootMsg] = useState("Initializing cluster nodes…");

  const BOOT_MSGS = [
    "Initializing cluster nodes…","Connecting camera streams…","Loading AI inference models…",
    "Binding pipeline applications…","Running system health checks…","Pipeline ready — finalizing…",
  ];

  const handleDeploy = () => {
    setPhaseWithNotify("booting");
    let s = 0;
    const id = setInterval(() => {
      s++;
      setProgress(Math.min(s * 17, 100));
      setBootMsg(BOOT_MSGS[Math.min(s - 1, BOOT_MSGS.length - 1)]);
      if (s >= 6) { clearInterval(id); setTimeout(() => setPhaseWithNotify("success"), 600); }
    }, 700);
  };

  if (phase === "confirm") {
    const totalApps = cameras.reduce((sum, c) => sum + c.apps.size, 0);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>

        {/* Summary tokens */}
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" as const }}>
          {[
            { label: "PROJECT", value: projectForm.name || "Unnamed Project", icon: "◈" },
            { label: "PIPELINE", value: pipelineForm.name || "Unnamed Pipeline", icon: "⬡" },
            { label: "CAMERAS", value: `${cameras.length} connected`, icon: "⊙" },
            { label: "APPLICATIONS", value: `${totalApps} bindings`, icon: "◎" },
          ].map(tok => (
            <div key={tok.label} style={{
              display: "flex", alignItems: "center", gap: "8px",
              padding: "7px 12px", borderRadius: "6px",
              backgroundColor: t.isDark ? "#0A0F1A" : "#F8FAFC",
              border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
            }}>
              <span style={{ ...MONO, fontSize: "11px", color: t.primary }}>{tok.icon}</span>
              <div>
                <div style={{ ...MONO, fontSize: "8px", fontWeight: 700, letterSpacing: "0.08em", color: t.sectionLabel }}>{tok.label}</div>
                <div style={{ ...INTER, fontSize: "12px", fontWeight: 600, color: t.isDark ? "#E2E8F0" : "#0F172A" }}>{tok.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Camera + bindings review */}
        <div>
          <div style={{ ...INTER, fontSize: "11px", fontWeight: 700, letterSpacing: "0.07em", textTransform: "uppercase" as const, color: t.sectionLabel, marginBottom: "10px" }}>
            Camera · Application Bindings
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {cameras.map(cam => {
              const protocolColor = cam.protocol === "RTSP" ? "#00775B" : cam.protocol === "IP" ? "#2B7FFF" : "#7C3AED";
              const urlHost = cam.url ? cam.url.replace(/^(rtsp|http|https):\/\//, "").split("/")[0] : "";
              const boundApps = AI_APPS.filter(a => cam.apps.has(a.id));
              return (
                <div key={cam.id} style={{
                  borderRadius: "8px",
                  backgroundColor: t.isDark ? "#0A0F1A" : "#FFFFFF",
                  border: `1px solid ${t.isDark ? "#1E293B" : "#E2E8F0"}`,
                  borderLeft: `3px solid ${protocolColor}`,
                  overflow: "hidden",
                }}>
                  {/* Camera row */}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px" }}>
                    <div style={{
                      width: "26px", height: "26px", borderRadius: "6px", flexShrink: 0,
                      backgroundColor: `${protocolColor}12`, border: `1px solid ${protocolColor}22`,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      <CameraFilledIcon size={12} color={protocolColor} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ ...INTER, fontSize: "13px", fontWeight: 600, color: t.isDark ? "#E2E8F0" : "#0F172A" }}>{cam.name}</div>
                      {urlHost && <div style={{ ...MONO, fontSize: "10px", color: t.sectionLabel, marginTop: "1px" }}>{urlHost}</div>}
                    </div>
                    <span style={{
                      ...MONO, fontSize: "9px", fontWeight: 700, letterSpacing: "0.05em",
                      padding: "2px 6px", borderRadius: "4px", flexShrink: 0,
                      backgroundColor: `${protocolColor}12`, border: `1px solid ${protocolColor}30`, color: protocolColor,
                    }}>{cam.protocol}</span>
                    <span style={{
                      ...INTER, fontSize: "11px", fontWeight: 600, flexShrink: 0,
                      color: boundApps.length > 0 ? t.primary : t.sectionLabel,
                    }}>
                      {boundApps.length} app{boundApps.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {/* App chips row */}
                  <div style={{
                    padding: "8px 14px 10px 50px",
                    borderTop: `1px solid ${t.isDark ? "#0F172A" : "#F1F5F9"}`,
                    backgroundColor: t.isDark ? "#020617" : "#FAFAFA",
                    display: "flex", flexWrap: "wrap" as const, gap: "6px",
                  }}>
                    {boundApps.length > 0 ? boundApps.map(app => (
                      <span key={app.id} style={{
                        ...INTER, fontSize: "11px", fontWeight: 500,
                        padding: "3px 9px", borderRadius: "12px",
                        backgroundColor: t.isDark ? "#0F172A" : `${t.primary}10`,
                        border: `1px solid ${t.isDark ? "#1E293B" : `${t.primary}25`}`,
                        color: t.isDark ? "#94A3B8" : t.primary,
                        display: "flex", alignItems: "center", gap: "5px",
                      }}>
                        <app.icon style={{ width: "10px", height: "10px", flexShrink: 0 }} />
                        {app.label}
                      </span>
                    )) : (
                      <span style={{ ...INTER, fontSize: "11px", color: t.isDark ? "#334155" : "#CBD5E1", fontStyle: "italic" }}>
                        No applications bound to this camera
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Deploy CTA */}
        <div style={{ display: "flex", justifyContent: "flex-start", paddingBottom: "8px" }}>
          <button onClick={handleDeploy}
            className="flex items-center gap-2.5 px-8 py-3.5 rounded-[4px] text-white text-[15px] font-semibold transition-all duration-200 active:scale-[0.98]"
            style={{ ...INTER, backgroundColor: "#00775B", boxShadow: "0 4px 20px rgba(0,119,91,0.4)" }}>
            <Rocket className="w-4 h-4" />Deploy & Start Pipeline
          </button>
        </div>
      </div>
    );
  }

  if (phase === "booting") return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="relative w-20 h-20">
        <div className="absolute inset-0 rounded-full border-4" style={{ borderColor: t.divider }} />
        <div className="absolute inset-0 rounded-full border-4 border-r-transparent transition-all duration-700"
          style={{ borderColor: t.primary, transform: `rotate(${progress * 3.6}deg)` }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-7 h-7 animate-spin" style={{ color: t.primary }} />
        </div>
      </div>
      <div style={INTER}>
        <h3 className="text-[20px] font-bold mb-1" style={{ color: t.title }}>Booting Pipeline</h3>
        <p className="text-[13px]" style={{ color: t.subtitle }}>{bootMsg}</p>
      </div>
      <div className="w-full max-w-[400px]">
        <div className="flex justify-between mb-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider" style={{ ...INTER, color: t.sectionLabel }}>Initialization</span>
          <span className="text-[12px] font-semibold" style={{ ...MONO, color: t.primary }}>{progress}%</span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: t.divider }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${progress}%`, backgroundColor: t.primary }} />
        </div>
      </div>
      <p className="text-[12px]" style={{ ...INTER, color: t.sectionLabel }}>Full initialization may take ~5 minutes.</p>
    </div>
  );

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-full flex items-center justify-center"
        style={{ backgroundColor: `${t.primary}15`, border: `2px solid ${t.primary}30` }}>
        <CheckCircle2 className="w-10 h-10" style={{ color: t.primary }} />
      </div>
      <div style={INTER}>
        <h3 className="text-[22px] font-bold mb-2" style={{ color: t.title }}>Pipeline Live!</h3>
        <p className="text-[14px] max-w-[380px] leading-relaxed" style={{ color: t.subtitle }}>Your AI pipeline is running. Choose where to go next.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full max-w-[480px]">
        {([
          { dest: "vms" as const,       Icon: Video,     label: "Live Tracking",      sub: "VMS Streaming view",    accent: t.primary,  accentGlow: t.primaryGlow },
          { dest: "analytics" as const, Icon: BarChart3,  label: "Analytics Dashboard", sub: "Open Insights dashboard", accent: "#2B7FFF", accentGlow: "rgba(43,127,255,0.10)" },
        ] as const).map(({ dest, Icon, label, sub, accent, accentGlow }) => (
          <button key={dest}
            onClick={() => { onFadeStart(); setTimeout(() => onComplete(dest), 450); }}
            className="flex flex-col items-center gap-3 p-6 rounded-[8px] border transition-all duration-200 text-center"
            style={{ backgroundColor: t.cardBg, borderColor: t.cardBorder }}
            onMouseEnter={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = accent;
              el.style.backgroundColor = t.isDark ? accentGlow : accentGlow;
              el.style.boxShadow = `0 0 0 3px ${accentGlow}`;
              const iconWrap = el.querySelector<HTMLDivElement>(".card-icon-wrap")!;
              const icon = el.querySelector<SVGElement>(".card-icon")!;
              const arrow = el.querySelector<SVGElement>(".card-arrow")!;
              if (iconWrap) iconWrap.style.backgroundColor = accentGlow;
              if (icon) icon.style.color = accent;
              if (arrow) arrow.style.color = accent;
            }}
            onMouseLeave={e => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.borderColor = t.cardBorder;
              el.style.backgroundColor = t.cardBg;
              el.style.boxShadow = "none";
              const iconWrap = el.querySelector<HTMLDivElement>(".card-icon-wrap")!;
              const icon = el.querySelector<SVGElement>(".card-icon")!;
              const arrow = el.querySelector<SVGElement>(".card-arrow")!;
              if (iconWrap) iconWrap.style.backgroundColor = t.isDark ? "#1E293B" : "#F1F5F9";
              if (icon) icon.style.color = t.sectionLabel;
              if (arrow) arrow.style.color = t.sectionLabel;
            }}
          >
            <div className="card-icon-wrap w-14 h-14 rounded-[10px] flex items-center justify-center transition-all"
              style={{ backgroundColor: t.isDark ? "#1E293B" : "#F1F5F9" }}>
              <Icon className="card-icon w-7 h-7 transition-colors" style={{ color: t.sectionLabel }} />
            </div>
            <div style={INTER}>
              <div className="text-[15px] font-semibold" style={{ color: t.title }}>{label}</div>
              <div className="text-[12px] mt-0.5" style={{ color: t.subtitle }}>{sub}</div>
            </div>
            <ArrowRight className="card-arrow w-4 h-4 transition-colors" style={{ color: t.sectionLabel }} />
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Left-panel vertical stepper ──────────────────────────────────────────────
const STEP_META_LEFT = [
  { step: 0, label: "Create Account",    done: true  },
  { step: 1, label: "Add Cameras",       done: false },
  { step: 2, label: "Create Project",    done: false },
  { step: 3, label: "Build Pipeline",    done: false },
  { step: 4, label: "Assign Applications", done: false },
  { step: 5, label: "Launch",            done: false },
];

// ─── Hi-Tech "Phase Gate" Stepper ────────────────────────────────────────────
// Design language: stacked horizontal phase bands separated by hairline rules.
// Each band = step number (mono) + diamond node + step name + right-side status.
function VerticalStepper({ current }: { current: WizardStep }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
      {STEP_META_LEFT.map((s, i) => {
        const isActive  = s.step === current;
        const isDone    = s.done || s.step < current;
        const isUpcoming = !isActive && !isDone;

        return (
          <div key={s.step}>
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "12px",
              padding: "12px 12px 12px 14px",
              borderLeft: isActive
                ? "2px solid #00FFCC"
                : isDone
                ? "2px solid rgba(0,255,204,0.30)"
                : "2px solid transparent",
              backgroundColor: isActive ? "rgba(0,255,204,0.035)" : "transparent",
              borderRadius: "0 4px 4px 0",
              transition: "all 0.2s",
            }}>

              {/* Status indicator — 16px circle, clear visual weight */}
              <div style={{
                width: "18px", height: "18px",
                borderRadius: "50%",
                flexShrink: 0,
                display: "flex", alignItems: "center", justifyContent: "center",
                backgroundColor: isDone
                  ? "#00FFCC"
                  : isActive
                  ? "transparent"
                  : "transparent",
                border: isActive
                  ? "1.5px solid #00FFCC"
                  : isDone
                  ? "none"
                  : "1.5px solid #2A3D30",
                transition: "all 0.2s",
              }}>
                {isDone ? (
                  /* Solid checkmark */
                  <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                    <polyline points="1,4 3.5,6.5 9,1"
                      stroke="#001410" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : isActive ? (
                  /* Filled dot */
                  <div style={{ width: "7px", height: "7px", borderRadius: "50%", backgroundColor: "#00FFCC" }} />
                ) : (
                  /* Empty — upcoming */
                  null
                )}
              </div>

              {/* Label + sub */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  ...INTER,
                  fontSize: "14px",
                  fontWeight: isActive ? 700 : isDone ? 500 : 400,
                  color: isActive
                    ? "#FFFFFF"
                    : isDone
                    ? "#6B8F7A"
                    : "#3A5045",
                  lineHeight: 1.3,
                  letterSpacing: isActive ? "-0.01em" : "0",
                }}>
                  {s.label}
                </div>
                {isActive && (
                  <div style={{
                    ...INTER, fontSize: "11px", marginTop: "2px",
                    color: "rgba(0,255,204,0.55)", fontWeight: 400,
                  }}>
                    In progress
                  </div>
                )}
                {isDone && (
                  <div style={{
                    ...INTER, fontSize: "11px", marginTop: "2px",
                    color: "rgba(0,255,204,0.30)", fontWeight: 400,
                  }}>
                    Completed
                  </div>
                )}
              </div>
            </div>

            {/* Connector line — between steps */}
            {i < STEP_META_LEFT.length - 1 && (
              <div style={{
                width: "1px", height: "8px",
                marginLeft: "22px",
                backgroundColor: isDone
                  ? "rgba(0,255,204,0.25)"
                  : "rgba(255,255,255,0.06)",
              }} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Real Matrice Brand Icon (matches analytics sidebar) ─────────────────────
const MatriceIcon = () => (
  <svg viewBox="0 0 113.7 109.945" fill="none" className="w-full h-full">
    <path d="M9.58511 9.56419H24.6545V0H0V109.932H24.6545V100.367H9.58511V9.56419Z" fill="#00956D" />
    <path d="M113.7 0.087L113.426 0.025H89.0458V9.577H104.115V100.38H89.0458V109.944H113.7V0.373V0.075V0.087Z" fill="#00956D" />
    <circle cx="21.775" cy="43.356" r="3.428" fill="#00956D" />
    <circle cx="45.109" cy="43.331" r="6.422" fill="#00956D" />
    <circle cx="56.788" cy="31.628" r="5" fill="#00956D" />
    <circle cx="68.429" cy="43.306" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="31.628" r="5" fill="#00956D" />
    <circle cx="68.417" cy="20.011" r="3.428" fill="#00956D" />
    <circle cx="45.084" cy="66.613" r="6.422" fill="#00956D" />
    <circle cx="56.751" cy="54.935" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="78.304" r="5" fill="#00956D" />
    <circle cx="45.109" cy="89.92" r="3.428" fill="#00956D" />
    <circle cx="68.554" cy="90.02" r="3.428" fill="#00956D" />
    <circle cx="91.912" cy="66.738" r="3.428" fill="#00956D" />
  </svg>
);

type AppKey = "analytics"|"training"|"marketplace"|"support"|"support2"|"fe-common"|"vms"|"internal";
const PLATFORMS: { label: string; shortcut: string; app: AppKey }[] = [
  { label: "Matrice Analytics",   shortcut: "2", app: "analytics"  },
  { label: "Matrice Training",    shortcut: "3", app: "training"   },
  { label: "Matrice Marketplace", shortcut: "4", app: "marketplace"},
  { label: "Matrice Support",     shortcut: "5", app: "support"    },
  { label: "Matrice Internal",    shortcut: "7", app: "internal"   },
];

// ─── Left-panel header: platform switcher + version toggler ───────────────────
function LeftPanelHeader({
  onPlatformSwitch, onSwitchVersion,
}: {
  onPlatformSwitch?: (app: string) => void;
  onSwitchVersion: () => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex items-center justify-between mb-10">
      {/* Platform switcher button (same style as analytics sidebar) */}
      <div className="relative flex-1 mr-3">
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2.5 w-full rounded-[8px] px-2.5 py-2 transition-colors hover:bg-white/5"
          style={{ backgroundColor: open ? "rgba(255,255,255,0.06)" : "transparent" }}
        >
          <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#001410] border border-[#00775B]/30 p-1 shrink-0">
            <MatriceIcon />
          </div>
          <div className="flex-1 text-left min-w-0">
            <div className="text-[14px] font-semibold text-white truncate" style={INTER}>Matrice AI</div>
            <div className="text-[10px] text-white/35 uppercase tracking-wider truncate" style={INTER}>VMS Platform</div>
          </div>
          <svg className="w-4 h-4 text-white/30 shrink-0" viewBox="0 0 16 16" fill="none">
            <path d="M5 6l3-3 3 3M5 10l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        {open && (
          <div className="absolute left-0 top-full mt-1 z-50 w-52 rounded-[8px] overflow-hidden shadow-xl"
            style={{ backgroundColor: "#0D1B12", border: "1px solid #1E3A2A" }}>
            <p className="px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.1em]" style={{ color: "#334155" }}>Switch Platform</p>
            {PLATFORMS.map(p => (
              <button key={p.app}
                onClick={() => { setOpen(false); onPlatformSwitch?.(p.app); }}
                className="flex items-center gap-2.5 w-full px-3 py-2 text-[13px] text-left transition-colors hover:bg-white/5"
                style={{ ...INTER, color: "#64748B" }}>
                <span className="flex-1">{p.label}</span>
                <kbd className="text-[10px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: "#0F1F14", borderColor: "#1E3A2A", color: "#334155" }}>⌘{p.shortcut}</kbd>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* v1 / v2 version switcher */}
      <div className="flex items-center gap-0.5 p-1 rounded-[6px] shrink-0" style={{ backgroundColor: "#0F172A", border: "1px solid #1E293B" }}>
        {(["v1","v2"] as const).map(v => (
          <button key={v}
            onClick={() => v === "v1" && onSwitchVersion()}
            style={{
              ...INTER,
              backgroundColor: v === "v2" ? "#00775B" : "transparent",
              color: v === "v2" ? "#fff" : "#475569",
              boxShadow: v === "v2" ? "0 1px 4px rgba(0,119,91,0.4)" : "none",
            }}
            className="px-3 py-1 rounded-[4px] text-[11px] font-bold tracking-wider uppercase transition-all duration-150">
            {v}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Version Switcher (kept for V1 modal) ─────────────────────────────────────
export function VersionSwitcher({ active, onSwitch }: { active: "v1"|"v2"; onSwitch: (v: "v1"|"v2") => void }) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-[6px]" style={{ backgroundColor: "#0F172A", border: "1px solid #1E293B" }}>
      {(["v1","v2"] as const).map(v => (
        <button key={v} onClick={() => onSwitch(v)}
          className="px-3 py-1 rounded-[4px] text-[11px] font-bold tracking-wider uppercase transition-all duration-150"
          style={{
            ...INTER,
            backgroundColor: active === v ? "#00775B" : "transparent",
            color: active === v ? "#fff" : "#475569",
            boxShadow: active === v ? "0 1px 4px rgba(0,119,91,0.4)" : "none",
          }}>
          {v}
        </button>
      ))}
    </div>
  );
}

// ─── Step title / subtitle overrides ─────────────────────────────────────────
const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
  1: {
    title: "Add your cameras",
    subtitle: "Add at least one camera to get started. You can always connect more later.",
  },
  2: {
    title: "Create an inference project",
    subtitle: "Group your cameras under a project. One project is all you need to begin.",
  },
  3: {
    title: "Build your pipeline",
    subtitle: "Name your pipeline and select a compute cluster.",
  },
  4: {
    title: "Assign applications",
    subtitle: "Assign at least one AI application to each camera before launching.",
  },
  5: {
    title: "Review your setup",
    subtitle: "Confirm cameras and app bindings before deploying the inference pipeline.",
  },
};

const STEP_TITLES_LAUNCH: Record<string, { title: string; subtitle: string }> = {
  booting: { title: "Deploy & go live", subtitle: "Spinning up your inference pipeline…" },
  success: { title: "You're live!", subtitle: "Your AI-powered pipeline is running." },
};

const STEP_MONO_LABELS: Record<WizardStep, string> = {
  1: "STEP 01 / CAMERA ONBOARDING",
  2: "STEP 02 / PROJECT INITIALIZATION",
  3: "STEP 03 / PIPELINE CONFIGURATION",
  4: "STEP 04 / APP ASSIGNMENT",
  5: "STEP 05 / REVIEW & LAUNCH",
};

// ─── Theme Toggle ──────────────────────────────────────────────────────────────
function ThemeToggle({ isDark, onToggle, t }: { isDark: boolean; onToggle: () => void; t: Theme }) {
  return (
    <button onClick={onToggle}
      className="flex items-center gap-2 px-3 py-1.5 rounded-[6px] border text-[12px] font-semibold transition-all duration-200"
      style={{ ...INTER, backgroundColor: t.cardBg, borderColor: t.cardBorder, color: t.subtitle }}>
      {isDark
        ? <><Sun className="w-3.5 h-3.5" style={{ color: "#E19A04" }} />Light</>
        : <><Moon className="w-3.5 h-3.5" style={{ color: "#2B7FFF" }} />Dark</>
      }
    </button>
  );
}

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export function FTUEWizardV2({ onComplete, onSwitchVersion, onPlatformSwitch, onDismiss }: FTUEWizardV2Props) {
  const [step, setStep] = useState<WizardStep>(1);
  const [fading, setFading] = useState(false);
  const [isDark, setIsDark] = useState(false); // default light — matches login page
  const [launchPhase, setLaunchPhase] = useState<LaunchPhaseTop>("confirm");
  const t = buildTheme(isDark);

  // Camera state — single array shared across steps
  const [cameras, setCameras] = useState<CameraEntry[]>([]);

  const [projectForm, setProjectForm] = useState<ProjectForm>({
    name: "", industry: "", license: "", tags: [],
    country: "Singapore", computeType: "Matrice", storageType: "Matrice", supportedDevices: ["Nvidia GPU"],
  });

  const [pipelineForm, setPipelineForm] = useState<PipelineForm>({
    name: "", description: "", cluster: "",
  });

  const addCamera = useCallback((c: Omit<CameraEntry, "id" | "apps">) => {
    setCameras(prev => [...prev, { ...c, id: `cam-${Date.now()}`, apps: new Set() }]);
  }, []);

  const removeCamera = useCallback((id: string) => {
    setCameras(prev => prev.filter(c => c.id !== id));
  }, []);

  const toggleApp = useCallback((camId: string, appId: string) => {
    setCameras(prev => prev.map(cam => {
      if (cam.id !== camId) return cam;
      const apps = new Set(cam.apps);
      apps.has(appId) ? apps.delete(appId) : apps.add(appId);
      return { ...cam, apps };
    }));
  }, []);

  const setCameraApps = useCallback((camId: string, apps: Set<string>) => {
    setCameras(prev => prev.map(cam => cam.id === camId ? { ...cam, apps } : cam));
  }, []);

  const canNext = () => {
    if (step === 1) return cameras.length > 0;
    if (step === 2) return !!(projectForm.name.trim() && projectForm.industry);
    if (step === 3) return !!(pipelineForm.name.trim() && pipelineForm.cluster);
    if (step === 4) return cameras.length > 0 && cameras.every(c => c.apps.size > 0);
    return false;
  };

  const meta = (step === 5 && launchPhase !== "confirm")
    ? (STEP_TITLES_LAUNCH[launchPhase] ?? STEP_TITLES[step])
    : STEP_TITLES[step];

  return (
    <div className="fixed inset-0 z-50 flex transition-opacity duration-400"
      style={{ opacity: fading ? 0 : 1, transition: "opacity 400ms ease-out" }}>

      {/* ── Left Panel — 30% (always dark) ─────────────────────────────────── */}
      <div className="w-[24%] flex flex-col h-full relative overflow-hidden border-r border-[#1E293B]"
        style={{ background: "linear-gradient(160deg, #001A10 0%, #00110B 50%, #000D08 100%)" }}>
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "linear-gradient(#00D4AA 1px, transparent 1px), linear-gradient(90deg, #00D4AA 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#00775B]/15 to-transparent pointer-events-none" />

        <div className="relative flex flex-col h-full px-8 py-8">
          <LeftPanelHeader onPlatformSwitch={onPlatformSwitch} onSwitchVersion={onSwitchVersion} />

          <div className="mb-10" style={INTER}>
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] mb-2" style={{ color: "#00775B" }}>Initial Setup</div>
            <h2 className="text-[22px] font-bold text-white leading-snug">
              Get your first<br />
              <span style={{ color: "#00D4AA" }}>pipeline running</span><br />
              in minutes.
            </h2>
            <p className="text-[13px] mt-3 leading-relaxed" style={{ color: "#94A3B8" }}>
              Configure once, monitor everywhere. Your AI vision workspace will be ready at the end of these steps.
            </p>
          </div>

          <div className="flex-1">
            <VerticalStepper current={step} />
          </div>

          <div style={{ borderTop: "1px solid #0F1F14", paddingTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>

            {/* Back to VMS home */}
            {onDismiss && (
              <button
                onClick={onDismiss}
                style={{
                  ...INTER, display: "flex", alignItems: "center", gap: "6px",
                  padding: "8px 12px", borderRadius: "6px", width: "100%",
                  background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)",
                  cursor: "pointer", fontSize: "13px", fontWeight: 500,
                  color: "#94A3B8", transition: "all 0.15s", textAlign: "left",
                }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(0,119,91,0.12)"; el.style.color = "#00D4AA"; el.style.borderColor = "rgba(0,119,91,0.3)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.background = "rgba(255,255,255,0.04)"; el.style.color = "#94A3B8"; el.style.borderColor = "rgba(255,255,255,0.08)"; }}
              >
                ← Back to VMS Home
              </button>
            )}

            {/* Documentation link — prominent, with icon */}
            <a href="#" onClick={e => e.preventDefault()}
              style={{ textDecoration: "none", display: "flex", flexDirection: "column", gap: "2px" }}
              onMouseEnter={e => {
                const el = e.currentTarget;
                el.querySelector<HTMLSpanElement>(".doc-label")!.style.color = "#00FFCC";
                el.querySelector<HTMLDivElement>(".doc-bar")!.style.width = "100%";
              }}
              onMouseLeave={e => {
                const el = e.currentTarget;
                el.querySelector<HTMLSpanElement>(".doc-label")!.style.color = "#94A3B8";
                el.querySelector<HTMLDivElement>(".doc-bar")!.style.width = "0%";
              }}
            >
              <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.1em", color: "#334155" }}>
                SUPPORT
              </span>
              <span className="doc-label" style={{
                ...INTER, fontSize: "13px", fontWeight: 600,
                color: "#94A3B8", transition: "color 150ms", lineHeight: 1.4,
              }}>
                View Setup Documentation →
              </span>
              {/* Animated underline bar */}
              <div style={{ height: "1px", backgroundColor: "rgba(0,255,204,0.12)", marginTop: "2px", position: "relative", overflow: "hidden" }}>
                <div className="doc-bar" style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  backgroundColor: "#00FFCC", width: "0%", transition: "width 200ms ease-out",
                }} />
              </div>
            </a>

            {/* Backers — readable warm-dark gray */}
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              <span style={{ ...MONO, fontSize: "9px", letterSpacing: "0.1em", color: "#334155" }}>BACKED BY</span>
              <span style={{ ...INTER, fontSize: "11px", color: "#4A6659", lineHeight: 1.5 }}>
                NVIDIA · Google for Startups<br />Microsoft for Startups · Plug and Play
              </span>
            </div>

            <div style={{ ...INTER, fontSize: "10px", color: "#253328" }}>
              © 2025 Matrice.ai, Inc. All rights reserved.
            </div>
          </div>
        </div>
      </div>

      {/* ── Right Panel — 70% (themed) ─────────────────────────────────────── */}
      <div className="w-[76%] flex flex-col h-full overflow-hidden border-l border-[#1E293B]"
        style={{ backgroundColor: t.panel }}>

        {/* Top bar */}
        <div className={cn("shrink-0 flex items-center justify-between pl-24 pr-10 py-5 border-b", t.topBar)}>
          <div style={INTER}>
            <div className="text-[11px] uppercase tracking-[0.1em] mb-1.5" style={{ ...MONO, color: t.monoLabel }}>
              {STEP_MONO_LABELS[step]}
            </div>
            <h3 className="text-[20px] font-bold" style={{ color: t.title }}>{meta.title}</h3>
            <p className="text-[13px] mt-0.5" style={{ color: t.subtitle }}>{meta.subtitle}</p>
          </div>
          {/* Right controls: theme toggle + step pills */}
          <div className="flex items-center gap-4 shrink-0">
            <ThemeToggle isDark={isDark} onToggle={() => setIsDark(d => !d)} t={t} />
            <div className="flex items-center gap-2">
              {([1,2,3,4,5] as WizardStep[]).map(s => (
                <div key={s} className="h-1.5 rounded-full transition-all duration-300"
                  style={{
                    width: s === step ? "2rem" : "1rem",
                    backgroundColor: s === step ? t.primary : s < step ? `${t.primary}40` : t.divider,
                  }} />
              ))}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div className={cn("py-8", step === 4 || step === 1 || step === 5 ? "w-full pl-12 pr-10" : "w-full max-w-[600px] pl-24 pr-10")}>
            {step === 1 && <Step1 cameras={cameras} onAddCamera={addCamera} onRemoveCamera={removeCamera} t={t} />}
            {step === 2 && <Step2 form={projectForm} setForm={setProjectForm} t={t} />}
            {step === 3 && (
              <Step3
                pipelineForm={pipelineForm}
                setPipelineForm={setPipelineForm}
                t={t}
              />
            )}
            {step === 4 && (
              <div className="space-y-3">
                {!cameras.every(c => c.apps.size > 0) && (
                  <div className="flex items-center gap-2 px-3 py-2.5 rounded-[6px] mb-2"
                    style={{ background: t.isDark ? "rgba(0,119,91,0.08)" : "#F0FDF8", border: `1px solid ${t.isDark ? "rgba(0,119,91,0.25)" : "rgba(0,119,91,0.2)"}` }}>
                    <Zap className="w-4 h-4 shrink-0" style={{ color: t.primary }} />
                    <span className="text-[12px]" style={{ ...INTER, color: t.primary }}>Assign at least 1 application to each camera to proceed.</span>
                  </div>
                )}
                {cameras.map(cam => (
                  <CameraAppRow
                    key={cam.id}
                    camera={{ id: cam.id, name: cam.name, location: cam.protocol, group: "All" }}
                    selectedApps={cam.apps}
                    onAppsChange={(next) => setCameraApps(cam.id, next)}
                  />
                ))}
              </div>
            )}
            {step === 5 && (
              <Step4
                onComplete={onComplete}
                onFadeStart={() => setFading(true)}
                cameras={cameras}
                projectForm={projectForm}
                pipelineForm={pipelineForm}
                t={t}
                onPhaseChange={setLaunchPhase}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        {(step < 5 || (step === 5 && launchPhase === "confirm")) && (
          <div className="shrink-0 pl-24 pr-10 py-5 border-t flex items-center justify-between"
            style={{ backgroundColor: t.footerBg, borderColor: t.footerBorder }}>
            <button onClick={() => step > 1 && setStep((step - 1) as WizardStep)} disabled={step === 1}
              className={cn("px-5 py-2.5 rounded-[4px] border text-[14px] font-semibold transition-all disabled:opacity-30 disabled:cursor-not-allowed", t.backBtn)}
              style={INTER}>
              Back
            </button>
            {step < 5 && (
              <div className="flex items-center gap-3">
                {!canNext() && step === 1 && cameras.length === 0 && (
                  <span className="text-[12px]" style={{ ...INTER, color: t.sectionLabel }}>Add at least one camera</span>
                )}
                {!canNext() && step === 4 && (
                  <span className="text-[12px]" style={{ ...INTER, color: t.sectionLabel }}>Each camera needs at least 1 app</span>
                )}
                <button onClick={() => canNext() && setStep((step + 1) as WizardStep)} disabled={!canNext()}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-[14px] font-semibold transition-all duration-200 active:scale-[0.98]"
                  style={{ ...INTER,
                    backgroundColor: canNext() ? "#00775B" : t.isDark ? "#1E293B" : "#E2E8F0",
                    color: canNext() ? "#fff" : t.isDark ? "#334155" : "#94A3B8",
                    cursor: canNext() ? "pointer" : "not-allowed",
                    boxShadow: canNext() ? "0 2px 12px rgba(0,119,91,0.35)" : "none",
                  }}>
                  {step === 4 ? "Review & Launch" : "Continue"}<ArrowRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
