import { useState, useRef, useMemo } from "react";
import {
  Camera, FolderOpen, GitBranch, Rocket, Check, ChevronDown,
  ChevronUp, Flame, ShieldAlert, Eye, Users, Footprints,
  Zap, ArrowRight, Loader2, CheckCircle2, Video, BarChart3,
  X, Upload, Tag, Search, HardHat, Car, ShoppingCart,
  PersonStanding, AlertTriangle, Thermometer, Truck, Package,
  MonitorCheck, Activity, ScanFace, Lock, Wind, Droplets,
  BatteryWarning, Wifi, MousePointerClick, Map, Gauge,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Design tokens ────────────────────────────────────────────────────────────
const INTER: React.CSSProperties = { fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" };
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono', monospace" };

// ─── Types ────────────────────────────────────────────────────────────────────
export interface FTUEWizardProps {
  onComplete: (dest: "vms" | "analytics") => void;
  onSkip: () => void;
  onSwitchVersion?: () => void;
  onDismiss?: () => void;
}

type WizardStep = 1 | 2 | 3 | 4;

interface CameraForm {
  name: string;
  gateway: string;
  protocol: "RTSP" | "IP" | "FILE";
  url: string;
  resolution: string;
  fps: number;
  quality: number;
}

interface ProjectForm {
  name: string;
  industry: string;
  license: string;
  tags: string[];
  country: string;
  computeType: string;
  storageType: string;
  supportedDevices: string[];
}

interface PipelineForm {
  name: string;
  description: string;
  cluster: string;
  cameraApps: Map<string, Set<string>>;
}

export interface CameraDevice {
  id: string;
  name: string;
  location: string;
  group: string;
}

export const CAMERA_GROUPS = ["All", "Entrance", "Parking", "Lobby", "Office", "Warehouse", "Security", "Outdoor"] as const;
export type CameraGroup = typeof CAMERA_GROUPS[number];

export const SAMPLE_CAMERAS: CameraDevice[] = [
  { id: "c01", name: "Main Entrance - CAM 01",   location: "Building A · Ground Floor",    group: "Entrance"  },
  { id: "c02", name: "Main Entrance - CAM 02",   location: "Building A · Ground Floor",    group: "Entrance"  },
  { id: "c03", name: "North Gate",               location: "Perimeter · North",            group: "Entrance"  },
  { id: "c04", name: "South Gate",               location: "Perimeter · South",            group: "Entrance"  },
  { id: "c05", name: "East Gate",                location: "Perimeter · East",             group: "Entrance"  },
  { id: "c06", name: "West Gate",                location: "Perimeter · West",             group: "Entrance"  },
  { id: "c07", name: "Loading Bay - CAM 01",     location: "Warehouse · Ground Floor",     group: "Entrance"  },
  { id: "c08", name: "Loading Bay - CAM 02",     location: "Warehouse · Ground Floor",     group: "Entrance"  },
  { id: "c09", name: "Parking Level B1 - Entry", location: "Basement 1 · Parking",        group: "Parking"   },
  { id: "c10", name: "Parking Level B1 - Exit",  location: "Basement 1 · Parking",        group: "Parking"   },
  { id: "c11", name: "Parking Level B2 - Entry", location: "Basement 2 · Parking",        group: "Parking"   },
  { id: "c12", name: "Parking Level B2 - Exit",  location: "Basement 2 · Parking",        group: "Parking"   },
  { id: "c13", name: "Parking Lot A - CAM 01",   location: "Surface Lot A",               group: "Parking"   },
  { id: "c14", name: "Parking Lot A - CAM 02",   location: "Surface Lot A",               group: "Parking"   },
  { id: "c15", name: "Parking Lot B - CAM 01",   location: "Surface Lot B",               group: "Parking"   },
  { id: "c16", name: "Parking Lot B - CAM 02",   location: "Surface Lot B",               group: "Parking"   },
  { id: "c17", name: "Main Lobby - CAM 01",      location: "Building A · Level 1",        group: "Lobby"     },
  { id: "c18", name: "Main Lobby - CAM 02",      location: "Building A · Level 1",        group: "Lobby"     },
  { id: "c19", name: "Reception Desk",           location: "Building A · Level 1",        group: "Lobby"     },
  { id: "c20", name: "Elevator Bank A",          location: "Building A · Level 1",        group: "Lobby"     },
  { id: "c21", name: "Elevator Bank B",          location: "Building B · Level 1",        group: "Lobby"     },
  { id: "c22", name: "Cafeteria - CAM 01",       location: "Building A · Level 2",        group: "Lobby"     },
  { id: "c23", name: "Cafeteria - CAM 02",       location: "Building A · Level 2",        group: "Lobby"     },
  { id: "c24", name: "Conference Hall",          location: "Building B · Level 3",        group: "Lobby"     },
  { id: "c25", name: "Office Floor 3 - CAM 01",  location: "Building A · Level 3",        group: "Office"    },
  { id: "c26", name: "Office Floor 3 - CAM 02",  location: "Building A · Level 3",        group: "Office"    },
  { id: "c27", name: "Office Floor 4 - CAM 01",  location: "Building A · Level 4",        group: "Office"    },
  { id: "c28", name: "Office Floor 4 - CAM 02",  location: "Building A · Level 4",        group: "Office"    },
  { id: "c29", name: "Office Floor 5 - CAM 01",  location: "Building B · Level 5",        group: "Office"    },
  { id: "c30", name: "Office Floor 5 - CAM 02",  location: "Building B · Level 5",        group: "Office"    },
  { id: "c31", name: "Open Plan Area A",         location: "Building A · Level 3",        group: "Office"    },
  { id: "c32", name: "Open Plan Area B",         location: "Building B · Level 4",        group: "Office"    },
  { id: "c33", name: "Executive Suite Corridor", location: "Building A · Level 6",        group: "Office"    },
  { id: "c34", name: "Executive Suite Entrance", location: "Building A · Level 6",        group: "Office"    },
  { id: "c35", name: "Warehouse Zone A - CAM 01",location: "Warehouse · Zone A",          group: "Warehouse" },
  { id: "c36", name: "Warehouse Zone A - CAM 02",location: "Warehouse · Zone A",          group: "Warehouse" },
  { id: "c37", name: "Warehouse Zone B - CAM 01",location: "Warehouse · Zone B",          group: "Warehouse" },
  { id: "c38", name: "Warehouse Zone B - CAM 02",location: "Warehouse · Zone B",          group: "Warehouse" },
  { id: "c39", name: "Conveyor Belt - CAM 01",   location: "Warehouse · Production Line", group: "Warehouse" },
  { id: "c40", name: "Conveyor Belt - CAM 02",   location: "Warehouse · Production Line", group: "Warehouse" },
  { id: "c41", name: "Packing Area - CAM 01",    location: "Warehouse · Dispatch",        group: "Warehouse" },
  { id: "c42", name: "Packing Area - CAM 02",    location: "Warehouse · Dispatch",        group: "Warehouse" },
  { id: "c43", name: "Server Room - CAM 01",     location: "IT Block · Level 1",          group: "Security"  },
  { id: "c44", name: "Server Room - CAM 02",     location: "IT Block · Level 1",          group: "Security"  },
  { id: "c45", name: "Data Center Entrance",     location: "IT Block · Level 1",          group: "Security"  },
  { id: "c46", name: "Security Control Room",    location: "Building A · Level 1",        group: "Security"  },
  { id: "c47", name: "CCTV Monitoring Station",  location: "Building A · Level 1",        group: "Security"  },
  { id: "c48", name: "Biometric Gate - Main",    location: "Building A · Basement",       group: "Security"  },
  { id: "c49", name: "Perimeter Fence - North",  location: "Outdoor · North Boundary",    group: "Outdoor"   },
  { id: "c50", name: "Perimeter Fence - South",  location: "Outdoor · South Boundary",    group: "Outdoor"   },
  { id: "c51", name: "Rooftop - CAM 01",         location: "Outdoor · Rooftop",           group: "Outdoor"   },
  { id: "c52", name: "Rooftop - CAM 02",         location: "Outdoor · Rooftop",           group: "Outdoor"   },
];

// ─── Options ──────────────────────────────────────────────────────────────────
const GATEWAYS = ["Gateway-01 (Primary)", "Gateway-02 (Backup)", "Gateway-03 (Edge)"];
const INDUSTRIES = ["Retail", "Manufacturing", "Healthcare", "Logistics", "Education", "Finance", "Government", "Hospitality"];
const LICENSES = ["footfall_license", "People_detect License", "Matrice AI Primary License"];
export const CLUSTERS = ["cluster-prod-01 (Singapore)", "cluster-prod-02 (Mumbai)", "cluster-edge-01 (On-Premise)"];
const COUNTRIES = ["Singapore", "India", "United States", "United Kingdom", "Australia"];
const COMPUTE_TYPES = ["Matrice", "Cloud GPU (Standard)", "Cloud GPU (High Performance)", "Edge TPU"];
const STORAGE_TYPES = ["Matrice", "Object Storage (S3)", "Block Storage (NVMe)", "Hybrid"];
const DEVICE_OPTIONS = ["Nvidia GPU", "Intel CPU", "EDGE camera", "IOS", "Android"];

export type AppCategory = "All" | "Safety" | "Security" | "Retail" | "Traffic";

export interface AIApp {
  id: string;
  label: string;
  desc: string;
  icon: React.ElementType;
  color: string;
  category: Exclude<AppCategory, "All">;
}

export const AI_APPS: AIApp[] = [
  // Safety
  { id: "fire",         label: "Fire & Smoke",       desc: "Detects active flames and smoke plumes",      icon: Flame,           color: "#EA580C", category: "Safety"   },
  { id: "ppe",          label: "PPE Detection",       desc: "Hard hat, vest & glove compliance",           icon: HardHat,         color: "#E19A04", category: "Safety"   },
  { id: "slip",         label: "Slip & Fall",         desc: "Detects falls on floor surfaces",             icon: AlertTriangle,   color: "#E7000B", category: "Safety"   },
  { id: "heat",         label: "Heat Stress",         desc: "Thermal anomaly & worker heat alerts",        icon: Thermometer,     color: "#EA580C", category: "Safety"   },
  { id: "gas",          label: "Gas Leak",            desc: "Airborne chemical & gas hazard detection",    icon: Wind,            color: "#64748B", category: "Safety"   },
  { id: "flood",        label: "Flood Detection",     desc: "Water accumulation & overflow alerts",        icon: Droplets,        color: "#2B7FFF", category: "Safety"   },
  { id: "emergency",    label: "Emergency Exits",     desc: "Blocked exit route identification",           icon: AlertTriangle,   color: "#E7000B", category: "Safety"   },
  { id: "power",        label: "Power Hazard",        desc: "Exposed wiring and electrical risk zones",    icon: BatteryWarning,  color: "#E19A04", category: "Safety"   },
  { id: "forklift",     label: "Forklift Safety",     desc: "Proximity alerts between forklifts & people", icon: Truck,           color: "#EA580C", category: "Safety"   },
  { id: "spill",        label: "Spill Detection",     desc: "Liquid spill identification on floor",        icon: Droplets,        color: "#2B7FFF", category: "Safety"   },
  { id: "confined",     label: "Confined Space",      desc: "Unauthorized confined space entry",           icon: Lock,            color: "#64748B", category: "Safety"   },
  // Security
  { id: "intrusion",    label: "Intrusion Detection", desc: "Perimeter breach & unauthorized access",      icon: ShieldAlert,     color: "#E7000B", category: "Security" },
  { id: "loitering",    label: "Loitering",           desc: "Detects stationary presence in zones",        icon: PersonStanding,  color: "#64748B", category: "Security" },
  { id: "face",         label: "Facial Recognition",  desc: "Identify known and unknown individuals",      icon: ScanFace,        color: "#2B7FFF", category: "Security" },
  { id: "weapon",       label: "Weapon Detection",    desc: "Firearms & bladed objects in frame",          icon: AlertTriangle,   color: "#E7000B", category: "Security" },
  { id: "tailgating",   label: "Tailgating",          desc: "Piggybacking through access control points",  icon: Users,           color: "#EA580C", category: "Security" },
  { id: "vandal",       label: "Vandalism",           desc: "Graffiti, damage & property destruction",     icon: AlertTriangle,   color: "#E19A04", category: "Security" },
  { id: "abandoned",    label: "Abandoned Object",    desc: "Unattended bags, boxes & luggage",            icon: Package,         color: "#64748B", category: "Security" },
  { id: "fence",        label: "Fence Climbing",      desc: "Perimeter fence breach attempt detection",    icon: ShieldAlert,     color: "#E7000B", category: "Security" },
  { id: "camera_tamper",label: "Camera Tamper",       desc: "Detects obstruction or misalignment",         icon: Eye,             color: "#64748B", category: "Security" },
  { id: "access",       label: "Access Control",      desc: "Door & turnstile unauthorized entry",         icon: Lock,            color: "#2B7FFF", category: "Security" },
  { id: "fight",        label: "Fight Detection",     desc: "Physical altercation in real-time",           icon: AlertTriangle,   color: "#E7000B", category: "Security" },
  { id: "mask",         label: "Mask Detection",      desc: "Enforces face-covering compliance",           icon: ShieldAlert,     color: "#00775B", category: "Security" },
  // Retail
  { id: "footfall",     label: "Footfall Counter",    desc: "People counting & entry/exit tracking",       icon: Footprints,      color: "#2B7FFF", category: "Retail"   },
  { id: "queue",        label: "Queue Analytics",     desc: "Queue length and wait time measurement",      icon: Users,           color: "#00775B", category: "Retail"   },
  { id: "shelf",        label: "Shelf Monitoring",    desc: "Out-of-stock & product placement alerts",     icon: Package,         color: "#E19A04", category: "Retail"   },
  { id: "heatmap",      label: "Zone Heatmap",        desc: "Customer dwell time & hot-zone mapping",      icon: Map,             color: "#EA580C", category: "Retail"   },
  { id: "checkout",     label: "Checkout Fraud",      desc: "Point-of-sale shrinkage detection",           icon: ShoppingCart,    color: "#E7000B", category: "Retail"   },
  { id: "age",          label: "Age Estimation",      desc: "Demographic profiling for marketing",         icon: Users,           color: "#2B7FFF", category: "Retail"   },
  { id: "shopper",      label: "Shopper Journey",     desc: "End-to-end customer path analytics",          icon: MousePointerClick,color: "#00775B",category: "Retail"   },
  { id: "cart",         label: "Cart Abandonment",    desc: "Identifies shoppers leaving without purchase",icon: ShoppingCart,    color: "#64748B", category: "Retail"   },
  { id: "engagement",   label: "Display Engagement",  desc: "Attention time on product displays",          icon: Eye,             color: "#E19A04", category: "Retail"   },
  { id: "staff_retail", label: "Staff Efficiency",    desc: "Associate task tracking and idle detection",  icon: Activity,        color: "#00775B", category: "Retail"   },
  // Traffic
  { id: "lpr",          label: "License Plate",       desc: "Automatic number plate recognition",          icon: Car,             color: "#2B7FFF", category: "Traffic"  },
  { id: "speed",        label: "Speed Detection",     desc: "Vehicle speed estimation & overspeed alerts", icon: Gauge,           color: "#E7000B", category: "Traffic"  },
  { id: "wrong_way",    label: "Wrong-Way Driver",    desc: "Contra-flow vehicle movement alerts",         icon: Car,             color: "#EA580C", category: "Traffic"  },
  { id: "parking",      label: "Parking Analytics",   desc: "Occupancy tracking & overstay detection",     icon: Car,             color: "#64748B", category: "Traffic"  },
  { id: "congestion",   label: "Congestion Monitor",  desc: "Traffic density and jam detection",           icon: Activity,        color: "#E19A04", category: "Traffic"  },
  { id: "illegal_park", label: "Illegal Parking",     desc: "No-park zone & fire-lane violations",         icon: AlertTriangle,   color: "#E7000B", category: "Traffic"  },
  { id: "vehicle_class",label: "Vehicle Class",       desc: "Classify trucks, cars, bikes & more",         icon: Truck,           color: "#2B7FFF", category: "Traffic"  },
  { id: "signal",       label: "Signal Violation",    desc: "Red-light & signal running detection",        icon: MonitorCheck,    color: "#E7000B", category: "Traffic"  },
  { id: "pedestrian",   label: "Pedestrian Safety",   desc: "Crosswalk compliance & near-miss alerts",     icon: PersonStanding,  color: "#00775B", category: "Traffic"  },
  { id: "incident",     label: "Traffic Incident",    desc: "Accident & road hazard identification",       icon: AlertTriangle,   color: "#EA580C", category: "Traffic"  },
  { id: "drone",        label: "Drone Detection",     desc: "Airspace intrusion by UAVs",                  icon: Wifi,            color: "#64748B", category: "Traffic"  },
];

// ─── Primitives ───────────────────────────────────────────────────────────────

function FieldLabel({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-[12px] font-semibold text-[#334155] tracking-[0.05em] uppercase mb-[6px]" style={INTER}>
      {children}
      {required && <span className="text-[#E7000B] ml-0.5">*</span>}
    </label>
  );
}

function TextInput({
  value, onChange, placeholder, className,
}: { value: string; onChange: (v: string) => void; placeholder?: string; className?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      style={INTER}
      className={cn(
        "w-full h-10 px-4 rounded-[4px] border border-[#CBD5E1] bg-white text-[14px] text-[#334155] placeholder:text-[#94A3B8]",
        "transition-all duration-200 focus:outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[rgba(0,119,91,0.15)]",
        className,
      )}
    />
  );
}

function SelectInput({
  value, onChange, options, placeholder,
}: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={INTER}
        className={cn(
          "w-full h-10 px-4 pr-10 rounded-[4px] border border-[#CBD5E1] bg-white text-[14px] appearance-none cursor-pointer",
          value ? "text-[#334155]" : "text-[#94A3B8]",
          "transition-all duration-200 focus:outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[rgba(0,119,91,0.15)]",
        )}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B] pointer-events-none" />
    </div>
  );
}

function Slider({ label, value, min, max, unit, onChange }: {
  label: string; value: number; min: number; max: number; unit: string; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <span className="text-[12px] font-semibold text-[#475569] uppercase tracking-[0.05em]" style={INTER}>{label}</span>
        <span className="text-[12px] font-semibold text-[#00775B]" style={MONO}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="w-full h-1.5 rounded-full accent-[#00775B] cursor-pointer"
      />
      <div className="flex justify-between mt-1">
        <span className="text-[10px] text-[#94A3B8]" style={INTER}>{min}{unit}</span>
        <span className="text-[10px] text-[#94A3B8]" style={INTER}>{max}{unit}</span>
      </div>
    </div>
  );
}

// ─── Tag Input ────────────────────────────────────────────────────────────────
function TagInput({ tags, onChange }: { tags: string[]; onChange: (t: string[]) => void }) {
  const [draft, setDraft] = useState("");

  const add = () => {
    const trimmed = draft.trim().replace(/^#/, "");
    if (trimmed && !tags.includes(trimmed)) onChange([...tags, trimmed]);
    setDraft("");
  };

  return (
    <div>
      <div className="relative flex items-center">
        <input
          type="text"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === "Enter" && add()}
          placeholder="e.g. security, retail…"
          style={INTER}
          className="w-full h-10 pl-4 pr-16 rounded-[4px] border border-[#CBD5E1] bg-white text-[14px] text-[#334155] placeholder:text-[#94A3B8] transition-all duration-200 focus:outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[rgba(0,119,91,0.15)]"
        />
        <button
          onClick={add}
          disabled={!draft.trim()}
          className={cn(
            "absolute right-1.5 h-7 px-3 rounded-[3px] text-[12px] font-semibold transition-all",
            draft.trim() ? "bg-[#00775B] text-white" : "bg-[#F1F5F9] text-[#94A3B8] cursor-not-allowed",
          )}
          style={INTER}
        >
          Add
        </button>
      </div>
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {tags.map(t => (
            <span
              key={t}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E5FFF9] border border-[#00775B]/20 text-[12px] font-medium text-[#00775B]"
              style={INTER}
            >
              <Tag className="w-3 h-3" />
              {t}
              <button onClick={() => onChange(tags.filter(x => x !== t))} className="ml-0.5 hover:text-[#E7000B]">
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Supported Devices Multi-select ──────────────────────────────────────────
function DeviceSelect({ selected, onChange }: { selected: string[]; onChange: (d: string[]) => void }) {
  const toggle = (d: string) => {
    if (selected.includes(d)) onChange(selected.filter(x => x !== d));
    else onChange([...selected, d]);
  };
  return (
    <div className="flex flex-wrap gap-2">
      {DEVICE_OPTIONS.map(d => (
        <button
          key={d}
          onClick={() => toggle(d)}
          style={INTER}
          className={cn(
            "px-3 py-1.5 rounded-[4px] border text-[12px] font-semibold transition-all duration-150",
            selected.includes(d)
              ? "border-[#00775B] bg-[#E5FFF9] text-[#00775B]"
              : "border-[#E2E8F0] bg-white text-[#64748B] hover:border-[#CBD5E1]",
          )}
        >
          {selected.includes(d) && <Check className="inline w-3 h-3 mr-1" />}
          {d}
        </button>
      ))}
    </div>
  );
}

// ─── Advanced Accordion ───────────────────────────────────────────────────────
function AdvancedAccordion({ label, children, open, onToggle }: {
  label: string; children: React.ReactNode; open: boolean; onToggle: () => void;
}) {
  return (
    <div className="mt-5">
      <button
        onClick={onToggle}
        className="flex items-center gap-1.5 text-[13px] font-semibold text-[#00775B] hover:text-[#004E3D] transition-colors"
        style={INTER}
      >
        {open ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        {label}
      </button>
      {open && (
        <div className="mt-4 space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// ─── Step 1 ───────────────────────────────────────────────────────────────────
function Step1({ form, setForm }: { form: CameraForm; setForm: (f: CameraForm) => void }) {
  const [advOpen, setAdvOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Camera Name</FieldLabel>
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Main Entrance Cam" />
        </div>
        <div>
          <FieldLabel required>Gateway</FieldLabel>
          <SelectInput value={form.gateway} onChange={v => setForm({ ...form, gateway: v })} options={GATEWAYS} placeholder="Select gateway…" />
        </div>
      </div>

      {/* Protocol toggle */}
      <div>
        <FieldLabel required>Protocol</FieldLabel>
        <div className="flex rounded-[4px] border border-[#CBD5E1] overflow-hidden w-fit">
          {(["RTSP", "IP", "FILE"] as const).map(p => (
            <button
              key={p}
              onClick={() => setForm({ ...form, protocol: p })}
              style={INTER}
              className={cn(
                "px-6 py-2 text-[13px] font-semibold transition-all duration-150",
                form.protocol === p ? "bg-[#00775B] text-white" : "bg-white text-[#64748B] hover:bg-[#F1F5F9]",
              )}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Conditional: RTSP or IP → path + detect codec */}
      {(form.protocol === "RTSP" || form.protocol === "IP") && (
        <div>
          <FieldLabel required>Stream URL</FieldLabel>
          <TextInput
            value={form.url}
            onChange={v => setForm({ ...form, url: v })}
            placeholder={form.protocol === "RTSP" ? "rtsp://192.168.1.100:554/stream" : "http://192.168.1.100/video"}
          />
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1">
              <FieldLabel>Camera Feed Path</FieldLabel>
              <div className="flex gap-2">
                <TextInput value="" onChange={() => {}} placeholder="Camera Feed Path (Optional)" />
                <button
                  style={INTER}
                  className="shrink-0 h-10 px-4 rounded-[4px] border border-[#00775B] text-[13px] font-semibold text-[#00775B] hover:bg-[#E5FFF9] transition-colors whitespace-nowrap"
                >
                  Detect Codec
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Conditional: FILE → drag & drop */}
      {form.protocol === "FILE" && (
        <div>
          <FieldLabel>Video File</FieldLabel>
          <div
            onClick={() => fileRef.current?.click()}
            onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={e => {
              e.preventDefault(); setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) setFileName(f.name);
            }}
            className={cn(
              "flex flex-col items-center justify-center gap-3 py-8 rounded-[6px] border-2 border-dashed cursor-pointer transition-all duration-200",
              dragging
                ? "border-[#00775B] bg-[#E5FFF9]"
                : fileName
                  ? "border-[#00775B]/40 bg-[#E5FFF9]/50"
                  : "border-[#CBD5E1] bg-[#FAFAFA] hover:border-[#94A3B8] hover:bg-white",
            )}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".mp4,.avi,.mov,.wmv,.flv"
              className="hidden"
              onChange={e => { const f = e.target.files?.[0]; if (f) setFileName(f.name); }}
            />
            <div className="w-10 h-10 rounded-full bg-[#00775B] flex items-center justify-center">
              <Upload className="w-5 h-5 text-white" />
            </div>
            {fileName ? (
              <div style={INTER} className="text-center">
                <div className="text-[14px] font-semibold text-[#00775B]">{fileName}</div>
                <div className="text-[12px] text-[#64748B] mt-0.5">Click to change file</div>
              </div>
            ) : (
              <div style={INTER} className="text-center">
                <div className="text-[14px] font-semibold text-[#334155]">Drag and drop a video here</div>
                <div className="text-[12px] text-[#64748B] mt-0.5">or click to browse</div>
                <div className="text-[11px] text-[#94A3B8] mt-2">Supported formats: .mp4, .avi, .mov, .wmv, .flv (max 500MB)</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced accordion */}
      <AdvancedAccordion label="+ Advanced Configuration" open={advOpen} onToggle={() => setAdvOpen(o => !o)}>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <FieldLabel>Resolution</FieldLabel>
            <SelectInput value={form.resolution} onChange={v => setForm({ ...form, resolution: v })} options={["480p", "720p", "1080p", "4K"]} />
          </div>
          <div>
            <FieldLabel>Camera Make</FieldLabel>
            <TextInput value="" onChange={() => {}} placeholder="e.g. Hikvision" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-8">
          <Slider label="Streaming FPS" value={form.fps} min={1} max={60} unit=" fps" onChange={v => setForm({ ...form, fps: v })} />
          <Slider label="Video Quality" value={form.quality} min={10} max={100} unit="%" onChange={v => setForm({ ...form, quality: v })} />
        </div>
      </AdvancedAccordion>
    </div>
  );
}

// ─── Step 2 ───────────────────────────────────────────────────────────────────
function Step2({ form, setForm }: { form: ProjectForm; setForm: (f: ProjectForm) => void }) {
  const [advOpen, setAdvOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div>
        <FieldLabel required>Project Name</FieldLabel>
        <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Singapore Flagship Store" />
      </div>
      <div className="grid grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Industry</FieldLabel>
          <SelectInput value={form.industry} onChange={v => setForm({ ...form, industry: v })} options={INDUSTRIES} placeholder="Select industry…" />
        </div>
        <div>
          <FieldLabel>License</FieldLabel>
          <SelectInput value={form.license} onChange={v => setForm({ ...form, license: v })} options={LICENSES} placeholder="Select license…" />
        </div>
      </div>
      <div>
        <FieldLabel>Tags</FieldLabel>
        <TagInput tags={form.tags} onChange={tags => setForm({ ...form, tags })} />
      </div>

      <AdvancedAccordion label="+ Advanced Options" open={advOpen} onToggle={() => setAdvOpen(o => !o)}>
        <div className="grid grid-cols-2 gap-5">
          <div>
            <FieldLabel>Country</FieldLabel>
            <SelectInput value={form.country} onChange={v => setForm({ ...form, country: v })} options={COUNTRIES} />
          </div>
          <div>
            <FieldLabel>Compute Type</FieldLabel>
            <SelectInput value={form.computeType} onChange={v => setForm({ ...form, computeType: v })} options={COMPUTE_TYPES} />
          </div>
        </div>
        <div>
          <FieldLabel>Storage Type</FieldLabel>
          <div className="w-1/2">
            <SelectInput value={form.storageType} onChange={v => setForm({ ...form, storageType: v })} options={STORAGE_TYPES} />
          </div>
        </div>
        <div>
          <FieldLabel>Supported Devices</FieldLabel>
          <DeviceSelect selected={form.supportedDevices} onChange={d => setForm({ ...form, supportedDevices: d })} />
        </div>
      </AdvancedAccordion>
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
export const CATEGORIES: AppCategory[] = ["All", "Safety", "Security", "Retail", "Traffic"];

// ─── Shared: per-camera app assignment row ───────────────────────────────────
export function CameraAppRow({
  camera, selectedApps, onAppsChange, defaultExpanded = false,
  expanded: controlledExpanded, onExpand,
}: {
  camera: CameraDevice;
  selectedApps: Set<string>;
  onAppsChange: (next: Set<string>) => void;
  defaultExpanded?: boolean;
  expanded?: boolean;
  onExpand?: () => void;
}) {
  const [localExpanded, setLocalExpanded] = useState(defaultExpanded);
  const expanded = controlledExpanded !== undefined ? controlledExpanded : localExpanded;
  const [appSearch, setAppSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<AppCategory>("All");

  const filteredApps = useMemo(() =>
    AI_APPS.filter(app => {
      const matchCat = activeCategory === "All" || app.category === activeCategory;
      const q = appSearch.toLowerCase();
      return matchCat && (!q || app.label.toLowerCase().includes(q) || app.desc.toLowerCase().includes(q));
    }),
    [appSearch, activeCategory]
  );

  const hasApps = selectedApps.size > 0;

  return (
    <div className={cn("rounded-[6px] border overflow-hidden", hasApps ? "border-[#00775B]/30" : "border-[#F59E0B]/40")}>
      <button type="button" onClick={() => onExpand ? onExpand() : setLocalExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 bg-white hover:bg-[#FAFAFA] transition-colors text-left" style={INTER}>
        <div className={cn("w-2 h-2 rounded-full shrink-0 mt-0.5", hasApps ? "bg-[#00775B]" : "bg-[#F59E0B]")} />
        <div className="flex-1 min-w-0">
          <div className="text-[13px] font-semibold text-[#0F172A] truncate">{camera.name}</div>
          <div className="text-[11px] text-[#94A3B8]">{camera.location}</div>
          {selectedApps.size > 0 && (
            <div className="flex flex-wrap gap-1 mt-1.5" style={{ maxWidth: "min(100%, 480px)" }}>
              {[...selectedApps].map(appId => {
                const app = AI_APPS.find(a => a.id === appId);
                if (!app) return null;
                const Icon = app.icon;
                return (
                  <span key={appId} className="inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-[4px]"
                    style={{ ...INTER, background: "#00775B15", color: "#00775B" }}>
                    <Icon className="w-2.5 h-2.5" />
                    {app.label}
                  </span>
                );
              })}
            </div>
          )}
        </div>
        {hasApps ? (
          <span className="shrink-0 text-[11px] font-semibold text-[#00775B] bg-[#E5FFF9] px-2.5 py-1 rounded-full">
            {selectedApps.size} app{selectedApps.size !== 1 ? "s" : ""}
          </span>
        ) : (
          <span className="shrink-0 text-[11px] font-semibold text-[#F59E0B] bg-[#FFF8E5] px-2.5 py-1 rounded-full">
            ⚠ Add 1+ app
          </span>
        )}
        <ChevronDown className={cn("w-4 h-4 text-[#94A3B8] shrink-0 transition-transform duration-150", expanded && "rotate-180")} />
      </button>

      {expanded && (
        <div className="border-t border-[#E2E8F0]">
          <div className="px-3 pt-3 pb-2 border-b border-[#F1F5F9]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
              <input type="text" value={appSearch} onChange={e => setAppSearch(e.target.value)}
                placeholder="Search applications…" style={INTER}
                className="w-full h-8 pl-9 pr-4 rounded-[4px] border border-[#E2E8F0] bg-[#FAFAFA] text-[12px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#00775B] transition-all" />
              {appSearch && <button onClick={() => setAppSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3 h-3 text-[#94A3B8]" /></button>}
            </div>
            <div className="flex gap-1.5 mt-2 flex-wrap">
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={INTER}
                  className={cn("h-6 px-2.5 rounded-full text-[11px] font-semibold transition-all",
                    activeCategory === cat ? "bg-[#00775B] text-white" : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]")}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-y-auto" style={{ maxHeight: "220px" }}>
            {filteredApps.length === 0 ? (
              <div className="py-8 flex flex-col items-center gap-1" style={INTER}>
                <Search className="w-7 h-7 text-[#CBD5E1]" />
                <div className="text-[12px] text-[#94A3B8]">No apps found</div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-px bg-[#F1F5F9] p-px">
                {filteredApps.map(app => {
                  const selected = selectedApps.has(app.id);
                  const Icon = app.icon;
                  return (
                    <button key={app.id} type="button"
                      onClick={() => { const n = new Set(selectedApps); n.has(app.id) ? n.delete(app.id) : n.add(app.id); onAppsChange(n); }}
                      style={INTER}
                      className={cn("group flex items-center gap-2.5 px-3 py-2.5 text-left transition-all",
                        selected ? "bg-[#E5FFF9] border border-[#00775B]" : "bg-white border border-transparent hover:bg-[#FAFAFA]")}>
                      <div className="w-7 h-7 rounded-[5px] flex items-center justify-center shrink-0 transition-all"
                        style={{ backgroundColor: selected ? "#00775B18" : "#F1F5F9" }}>
                        <Icon className="w-3.5 h-3.5 transition-colors" style={{ color: selected ? "#00775B" : "#94A3B8" }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold text-[#1E293B] truncate">{app.label}</div>
                        <div className="text-[10px] text-[#94A3B8] truncate">{app.desc}</div>
                      </div>
                      <div className={cn("w-3.5 h-3.5 rounded-full shrink-0 flex items-center justify-center transition-all",
                        selected ? "bg-[#00775B]" : "border border-[#E2E8F0] group-hover:border-[#CBD5E1]")}>
                        {selected && <Check className="w-2 h-2 text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div className="px-3 py-2 border-t border-[#F1F5F9] flex justify-between bg-[#FAFAFA]">
            <span className="text-[11px] text-[#94A3B8]" style={INTER}>{filteredApps.length} apps</span>
            {selectedApps.size > 0 && <span className="text-[11px] font-semibold text-[#00775B]" style={INTER}>{selectedApps.size} selected</span>}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Step 3 ───────────────────────────────────────────────────────────────────
function Step3({ form, setForm }: { form: PipelineForm; setForm: (f: PipelineForm) => void }) {
  const [camSearch, setCamSearch] = useState("");
  const [activeGroup, setActiveGroup] = useState<CameraGroup>("All");

  const filteredCameras = useMemo(() =>
    SAMPLE_CAMERAS.filter(c => {
      const matchGroup = activeGroup === "All" || c.group === activeGroup;
      const q = camSearch.toLowerCase();
      return matchGroup && (!q || c.name.toLowerCase().includes(q) || c.location.toLowerCase().includes(q));
    }),
    [camSearch, activeGroup]
  );

  const toggleCamera = (camId: string) => {
    const next = new Map(form.cameraApps);
    next.has(camId) ? next.delete(camId) : next.set(camId, new Set());
    setForm({ ...form, cameraApps: next });
  };

  const selectedCameraIds = [...form.cameraApps.keys()];
  const allHaveApps = selectedCameraIds.length > 0 && selectedCameraIds.every(id => (form.cameraApps.get(id)?.size ?? 0) > 0);

  return (
    <div className="space-y-4">
      {/* Pipeline fields */}
      <div className="grid grid-cols-2 gap-5">
        <div>
          <FieldLabel required>Pipeline Name</FieldLabel>
          <TextInput value={form.name} onChange={v => setForm({ ...form, name: v })} placeholder="e.g. Main-Entrance-Pipeline" />
        </div>
        <div>
          <FieldLabel required>Cluster</FieldLabel>
          <SelectInput value={form.cluster} onChange={v => setForm({ ...form, cluster: v })} options={CLUSTERS} placeholder="Select cluster…" />
        </div>
      </div>
      <div>
        <FieldLabel>Description</FieldLabel>
        <TextInput value={form.description} onChange={v => setForm({ ...form, description: v })} placeholder="Optional pipeline description" />
      </div>

      {/* Camera selection */}
      <div className="flex items-center gap-3 pt-1">
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-5 h-5 rounded-full bg-[#00775B] flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white leading-none" style={INTER}>1</span>
          </div>
          <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider" style={INTER}>Select Cameras</span>
        </div>
        <div className="flex-1 h-px bg-[#E2E8F0]" />
      </div>

      <div className="rounded-[6px] border border-[#E2E8F0] overflow-hidden">
        <div className="px-3 pt-3 pb-2 border-b border-[#F1F5F9] space-y-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
            <input type="text" value={camSearch} onChange={e => setCamSearch(e.target.value)}
              placeholder={`Search ${SAMPLE_CAMERAS.length} cameras…`} style={INTER}
              className="w-full h-9 pl-9 pr-4 rounded-[4px] border border-[#E2E8F0] bg-[#FAFAFA] text-[13px] text-[#334155] placeholder:text-[#94A3B8] focus:outline-none focus:border-[#00775B] focus:ring-2 focus:ring-[rgba(0,119,91,0.12)] transition-all" />
            {camSearch && <button onClick={() => setCamSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2"><X className="w-3.5 h-3.5 text-[#94A3B8] hover:text-[#64748B]" /></button>}
          </div>
          <div className="flex gap-1.5 overflow-x-auto pb-0.5 scrollbar-none">
            {CAMERA_GROUPS.map(g => (
              <button key={g} onClick={() => setActiveGroup(g)} style={INTER}
                className={cn("shrink-0 h-6 px-2.5 rounded-full text-[11px] font-semibold transition-all",
                  activeGroup === g ? "bg-[#00775B] text-white shadow-[0_1px_4px_rgba(0,119,91,0.3)]" : "bg-[#F1F5F9] text-[#475569] hover:bg-[#E2E8F0]")}>
                {g}
              </button>
            ))}
          </div>
        </div>
        <div className="overflow-y-auto" style={{ maxHeight: "200px" }}>
          {filteredCameras.length === 0 ? (
            <div className="py-8 text-center text-[12px] text-[#94A3B8]" style={INTER}>No cameras match "{camSearch}"</div>
          ) : filteredCameras.map(cam => {
            const selected = form.cameraApps.has(cam.id);
            return (
              <label key={cam.id} className={cn(
                "flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors border-b border-[#F8FAFC] last:border-0",
                selected ? "bg-[#E5FFF9]" : "bg-white hover:bg-[#FAFAFA]")}>
                <input type="checkbox" checked={selected} onChange={() => toggleCamera(cam.id)} className="sr-only" />
                <div className={cn("w-4 h-4 rounded-[3px] border flex items-center justify-center shrink-0 transition-all",
                  selected ? "bg-[#00775B] border-[#00775B]" : "border-[#CBD5E1] bg-white")}>
                  {selected && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <Camera className="w-3.5 h-3.5 text-[#94A3B8] shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className={cn("text-[13px] font-semibold truncate", selected ? "text-[#00775B]" : "text-[#0F172A]")}>{cam.name}</div>
                  <div className="text-[11px] text-[#94A3B8] truncate">{cam.location}</div>
                </div>
                {selected && <span className="shrink-0 text-[10px] font-bold text-[#00775B] bg-[#00775B]/10 px-2 py-0.5 rounded-full">SELECTED</span>}
              </label>
            );
          })}
        </div>
        <div className="px-4 py-2.5 border-t border-[#E2E8F0] bg-[#FAFAFA] flex items-center justify-between">
          <span className="text-[11px] text-[#94A3B8]" style={INTER}>{filteredCameras.length} shown of {SAMPLE_CAMERAS.length}</span>
          {form.cameraApps.size > 0 && <span className="text-[11px] font-semibold text-[#00775B]" style={INTER}>{form.cameraApps.size} selected</span>}
        </div>
      </div>

      {/* Per-camera app assignment */}
      {selectedCameraIds.length > 0 && (
        <>
          <div className="flex items-center gap-3 pt-1">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-5 h-5 rounded-full bg-[#00775B] flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-white leading-none" style={INTER}>2</span>
              </div>
              <span className="text-[12px] font-bold text-[#0F172A] uppercase tracking-wider" style={INTER}>Assign Applications Per Camera</span>
            </div>
            <div className="flex-1 h-px bg-[#E2E8F0]" />
          </div>
          {!allHaveApps && (
            <div className="flex items-center gap-2 px-3 py-2.5 rounded-[6px] bg-[#FFF8E5] border border-[#F59E0B]/30" style={INTER}>
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0" />
              <span className="text-[12px] text-[#92400E]">Each selected camera needs at least 1 application assigned before you can continue.</span>
            </div>
          )}
          <div className="space-y-2">
            {selectedCameraIds.map((camId) => {
              const cam = SAMPLE_CAMERAS.find(c => c.id === camId)!;
              return (
                <CameraAppRow
                  key={camId}
                  camera={cam}
                  selectedApps={form.cameraApps.get(camId)!}
                  onAppsChange={(next) => {
                    const m = new Map(form.cameraApps);
                    m.set(camId, next);
                    setForm({ ...form, cameraApps: m });
                  }}
                />
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

// ─── Step 4 ───────────────────────────────────────────────────────────────────
type LaunchPhase = "confirm" | "booting" | "success";

function Step4({ onComplete }: { onComplete: (dest: "vms" | "analytics") => void }) {
  const [phase, setPhase] = useState<LaunchPhase>("confirm");
  const [progress, setProgress] = useState(0);
  const [bootMsg, setBootMsg] = useState("Initializing cluster nodes…");

  const BOOT_MSGS = [
    "Initializing cluster nodes…",
    "Connecting camera streams…",
    "Loading AI inference models…",
    "Binding pipeline applications…",
    "Running system health checks…",
    "Pipeline ready — finalizing…",
  ];

  const handleDeploy = () => {
    setPhase("booting");
    let step = 0;
    const id = setInterval(() => {
      step++;
      setProgress(Math.min(step * 17, 100));
      setBootMsg(BOOT_MSGS[Math.min(step - 1, BOOT_MSGS.length - 1)]);
      if (step >= 6) { clearInterval(id); setTimeout(() => setPhase("success"), 600); }
    }, 700);
  };

  if (phase === "confirm") {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="w-20 h-20 rounded-full bg-[#E5FFF9] border-2 border-[#00775B]/20 flex items-center justify-center">
          <Rocket className="w-9 h-9 text-[#00775B]" />
        </div>
        <div style={INTER}>
          <h3 className="text-[22px] font-bold text-[#0F172A] mb-2">Ready to Deploy</h3>
          <p className="text-[14px] text-[#64748B] max-w-[400px] leading-relaxed">
            Your camera, project, and pipeline are configured. Click below to deploy and start your AI pipeline.
          </p>
        </div>
        <div className="w-full max-w-[360px] p-4 rounded-[6px] bg-[#FAFAFA] border border-[#E2E8F0] text-left space-y-2">
          {[
            { label: "Camera stream connected" },
            { label: "Inference project created" },
            { label: "AI pipeline configured" },
            { label: "Applications bound & ready" },
          ].map(({ label }) => (
            <div key={label} className="flex items-center gap-3 text-[13px] text-[#475569]" style={INTER}>
              <div className="w-5 h-5 rounded-full bg-[#E5FFF9] flex items-center justify-center shrink-0">
                <Check className="w-3 h-3 text-[#00775B]" />
              </div>
              {label}
            </div>
          ))}
        </div>
        <button
          onClick={handleDeploy}
          className="flex items-center gap-2.5 px-8 py-3 rounded-[4px] bg-[#00775B] hover:bg-[#004E3D] active:scale-[0.98] text-white text-[15px] font-semibold transition-all duration-200 shadow-[0_4px_14px_rgba(0,119,91,0.35)]"
          style={INTER}
        >
          <Rocket className="w-4 h-4" />
          Deploy & Start Pipeline
        </button>
      </div>
    );
  }

  if (phase === "booting") {
    return (
      <div className="flex flex-col items-center text-center gap-6 py-4">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 rounded-full border-4 border-[#E2E8F0]" />
          <div className="absolute inset-0 rounded-full border-4 border-[#00775B] border-r-transparent transition-all duration-700" style={{ transform: `rotate(${progress * 3.6}deg)` }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Loader2 className="w-7 h-7 text-[#00775B] animate-spin" />
          </div>
        </div>
        <div style={INTER}>
          <h3 className="text-[20px] font-bold text-[#0F172A] mb-1">Booting Pipeline</h3>
          <p className="text-[13px] text-[#64748B]">{bootMsg}</p>
        </div>
        <div className="w-full max-w-[360px]">
          <div className="flex justify-between mb-2">
            <span className="text-[11px] font-semibold text-[#94A3B8] uppercase tracking-wider" style={INTER}>Initialization</span>
            <span className="text-[12px] font-semibold text-[#00775B]" style={MONO}>{progress}%</span>
          </div>
          <div className="h-1.5 rounded-full bg-[#E2E8F0] overflow-hidden">
            <div className="h-full rounded-full bg-[#00775B] transition-all duration-700" style={{ width: `${progress}%` }} />
          </div>
        </div>
        <p className="text-[12px] text-[#94A3B8]" style={INTER}>Full initialization may take ~5 minutes.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center text-center gap-6 py-4">
      <div className="w-20 h-20 rounded-full bg-[#E5FFF9] border-2 border-[#00775B]/30 flex items-center justify-center">
        <CheckCircle2 className="w-10 h-10 text-[#00775B]" />
      </div>
      <div style={INTER}>
        <h3 className="text-[22px] font-bold text-[#0F172A] mb-2">Pipeline Live!</h3>
        <p className="text-[14px] text-[#64748B] max-w-[380px] leading-relaxed">Your AI pipeline is running. Choose where to go next.</p>
      </div>
      <div className="grid grid-cols-2 gap-4 w-full">
        <button
          onClick={() => onComplete("vms")}
          className="group flex flex-col items-center gap-3 p-6 rounded-[6px] border-2 border-[#E2E8F0] bg-white hover:border-[#00775B] hover:bg-[#E5FFF9] transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] group-hover:bg-[#00775B]/10 flex items-center justify-center transition-all">
            <Video className="w-6 h-6 text-[#64748B] group-hover:text-[#00775B] transition-colors" />
          </div>
          <div style={INTER}>
            <div className="text-[14px] font-semibold text-[#0F172A]">Live Tracking</div>
            <div className="text-[12px] text-[#64748B] mt-0.5">VMS Streaming view</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#00775B] transition-colors" />
        </button>
        <button
          onClick={() => onComplete("analytics")}
          className="group flex flex-col items-center gap-3 p-6 rounded-[6px] border-2 border-[#E2E8F0] bg-white hover:border-[#2B7FFF] hover:bg-[#E5F0FF] transition-all duration-200"
        >
          <div className="w-12 h-12 rounded-[8px] bg-[#F1F5F9] group-hover:bg-[#2B7FFF]/10 flex items-center justify-center transition-all">
            <BarChart3 className="w-6 h-6 text-[#64748B] group-hover:text-[#2B7FFF] transition-colors" />
          </div>
          <div style={INTER}>
            <div className="text-[14px] font-semibold text-[#0F172A]">Analytics Dashboard</div>
            <div className="text-[12px] text-[#64748B] mt-0.5">Open Insights dashboard</div>
          </div>
          <ArrowRight className="w-4 h-4 text-[#94A3B8] group-hover:text-[#2B7FFF] transition-colors" />
        </button>
      </div>
    </div>
  );
}

// ─── Progress Stepper ─────────────────────────────────────────────────────────
const STEP_META = [
  { step: 1 as WizardStep, label: "Add Camera", icon: Camera },
  { step: 2 as WizardStep, label: "Create Project", icon: FolderOpen },
  { step: 3 as WizardStep, label: "Build Pipeline & Apps", icon: GitBranch },
  { step: 4 as WizardStep, label: "Launch", icon: Rocket },
];

function ProgressStepper({ current }: { current: WizardStep }) {
  return (
    <div className="flex items-center justify-center" style={INTER}>
      {STEP_META.map((s, i) => {
        const done = current > s.step;
        const active = current === s.step;
        const Icon = s.icon;
        return (
          <div key={s.step} className="flex items-center">
            <div className="flex flex-col items-center gap-1.5">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                done ? "bg-[#00775B] border-[#00775B]" : active ? "bg-white border-[#00775B]" : "bg-white border-[#CBD5E1]",
              )}>
                {done ? <Check className="w-4 h-4 text-white" /> : <Icon className={cn("w-3.5 h-3.5", active ? "text-[#00775B]" : "text-[#94A3B8]")} />}
              </div>
              <span className={cn("text-[11px] font-semibold whitespace-nowrap", active ? "text-[#00775B]" : done ? "text-[#334155]" : "text-[#94A3B8]")}>
                {s.label}
              </span>
            </div>
            {i < STEP_META.length - 1 && (
              <div className={cn("w-16 h-px mx-3 mb-5 transition-colors duration-300", done ? "bg-[#00775B]" : "bg-[#E2E8F0]")} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Home Screen Background ───────────────────────────────────────────────────
function HomeScreenBG() {
  const NAV_ITEMS = [
    { label: "Platforms", icon: "⊞" },
    { label: "Projects", active: true, icon: "⊡" },
    { label: "Pipelines", icon: "⟶" },
    { label: "Cameras", icon: "◉" },
    { label: "Networking", icon: "⬡" },
    { label: "Compute", icon: "⬢" },
    { label: "Storage", icon: "▭" },
    { label: "Database", icon: "⊚" },
    { label: "Recordings", icon: "⏺" },
    { label: "Access Keys", icon: "⚿" },
    { label: "My Invites", icon: "✉" },
  ];

  return (
    <div className="fixed inset-0 flex bg-[#F1F5F9]" style={INTER}>
      {/* Sidebar */}
      <div className="w-[192px] shrink-0 bg-[#0F172A] flex flex-col h-full">
        {/* Logo */}
        <div className="px-4 py-3 border-b border-white/10 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-[6px] bg-[#00775B] flex items-center justify-center text-white text-[14px] font-bold shrink-0">[X]</div>
          <div>
            <div className="text-[13px] font-semibold text-white">Matrice AI</div>
            <div className="text-[10px] text-white/40">VMS Platform</div>
          </div>
        </div>
        {/* Nav */}
        <div className="flex-1 py-3 px-2 space-y-0.5">
          {NAV_ITEMS.map(item => (
            <div
              key={item.label}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] cursor-default",
                item.active ? "bg-[#00775B]/20 text-white" : "text-white/50",
              )}
            >
              <span className="text-[16px]">{item.icon}</span>
              {item.label}
            </div>
          ))}
        </div>
        <div className="px-2 py-3 border-t border-white/10 space-y-0.5">
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] text-white/50 cursor-default">
            <span className="text-[16px]">⚙</span> Settings
          </div>
          <div className="flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-[13px] text-white/50 cursor-default">
            <div className="w-6 h-6 rounded-full bg-[#334155] flex items-center justify-center text-[10px] text-white font-bold">AD</div>
            Admin
          </div>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Topbar */}
        <div className="h-12 bg-white border-b border-[#E2E8F0] flex items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <div className="w-5 h-5 rounded-[4px] bg-[#00775B]/10 flex items-center justify-center">
              <div className="w-3 h-3 rounded-[2px] border border-[#00775B]" />
            </div>
            <span className="text-[14px] font-semibold text-[#0F172A]">Matrice AI</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-[12px] text-[#64748B] bg-[#F1F5F9] px-3 py-1 rounded-[4px] border border-[#E2E8F0]">⏱ 09:36:25 AM</div>
            <div className="w-8 h-8 rounded-full bg-[#00775B] flex items-center justify-center text-white text-[12px] font-bold">AD</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 relative">
          {/* Grid lines */}
          <div
            className="absolute inset-0 opacity-50"
            style={{
              backgroundImage: "linear-gradient(#E2E8F0 1px, transparent 1px), linear-gradient(90deg, #E2E8F0 1px, transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />
          <div className="relative">
            <div className="mb-4">
              <h1 className="text-[24px] font-bold text-[#0F172A]">All Projects</h1>
              <p className="text-[13px] text-[#64748B] mt-0.5">1 project · Manage and monitor your deployments</p>
            </div>
            {/* Tips bar */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-[6px] bg-[#E5FFF9] border border-[#00775B]/20 mb-4 text-[13px] text-[#334155]">
              <span className="text-[#00775B]">✦</span>
              <strong>Quick tips:</strong> Press ⌘/ to search · Click any card to open project · Toggle grid/list to switch views
              <X className="w-4 h-4 ml-auto text-[#94A3B8]" />
            </div>
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 px-3 py-2 rounded-[4px] border border-[#E2E8F0] bg-white w-64 text-[13px] text-[#94A3B8]">
                🔍 Search projects… <span className="ml-auto text-[11px]">⌘/</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="h-9 px-3 rounded-[4px] border border-[#E2E8F0] bg-white text-[13px] text-[#64748B]">Sort</button>
                <button className="h-9 px-3 rounded-[4px] border border-[#E2E8F0] bg-white text-[13px] text-[#64748B]">⊞</button>
                <button className="h-9 px-3 rounded-[4px] border border-[#E2E8F0] bg-white text-[13px] text-[#64748B]">≡</button>
                <button className="h-9 px-4 rounded-[4px] bg-[#00775B] text-white text-[13px] font-semibold">+ New Project</button>
              </div>
            </div>
            {/* Project card */}
            <div className="w-56 p-4 rounded-[6px] bg-white border border-[#E2E8F0] shadow-[0_1px_3px_rgba(0,0,0,0.08)]">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 rounded-[6px] bg-[#E5FFF9] border border-[#00775B]/20 flex items-center justify-center text-[14px] font-bold text-[#00775B]">S</div>
                <div>
                  <div className="text-[13px] font-semibold text-[#0F172A]">setup project</div>
                  <div className="text-[11px] text-[#94A3B8]">11 minutes ago</div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-[#475569] bg-[#F1F5F9] px-2 py-0.5 rounded-[2px]">ADMIN</span>
                <span className="flex items-center gap-1 text-[11px] text-[#00A63E]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#00A63E] inline-block" /> Active
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Wizard Step Titles ───────────────────────────────────────────────────────
const STEP_TITLES: Record<WizardStep, { title: string; subtitle: string }> = {
  1: { title: "Connect your first camera", subtitle: "Add a camera stream to start monitoring your space with AI." },
  2: { title: "Create an inference project", subtitle: "Group cameras and configure AI processing for your deployment." },
  3: { title: "Build your pipeline", subtitle: "Set up the AI pipeline and bind applications to your camera." },
  4: { title: "Deploy & go live", subtitle: "Review your setup and launch your first AI-powered pipeline." },
};

// ─── Main Wizard ──────────────────────────────────────────────────────────────
export function FTUEWizard({ onComplete, onSkip, onSwitchVersion, onDismiss }: FTUEWizardProps) {
  const [step, setStep] = useState<WizardStep>(1);

  const [cameraForm, setCameraForm] = useState<CameraForm>({
    name: "", gateway: "", protocol: "RTSP", url: "",
    resolution: "720p", fps: 15, quality: 80,
  });

  const [projectForm, setProjectForm] = useState<ProjectForm>({
    name: "", industry: "", license: "", tags: [],
    country: "Singapore", computeType: "Matrice", storageType: "Matrice",
    supportedDevices: ["Nvidia GPU"],
  });

  const [pipelineForm, setPipelineForm] = useState<PipelineForm>({
    name: "", description: "", cluster: "", cameraApps: new Map(),
  });

  const canNext = () => {
    if (step === 1) return !!(cameraForm.name.trim() && cameraForm.gateway && (cameraForm.protocol === "FILE" || cameraForm.url.trim()));
    if (step === 2) return !!(projectForm.name.trim() && projectForm.industry);
    if (step === 3) {
      const { name, cluster, cameraApps } = pipelineForm;
      return !!(name.trim() && cluster && cameraApps.size > 0 && [...cameraApps.values()].every(s => s.size > 0));
    }
    return false;
  };

  const meta = STEP_TITLES[step];

  return (
    <>
      <HomeScreenBG />
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 flex items-center justify-center p-6"
        style={{ backgroundColor: "rgba(15, 23, 42, 0.65)", backdropFilter: "blur(3px)" }}
      >
        {/* Modal */}
        <div
          className="relative w-full max-w-[800px] bg-white rounded-[8px] shadow-[0_25px_80px_rgba(0,0,0,0.28)] overflow-hidden flex flex-col"
          style={{ maxHeight: "90vh" }}
        >
          {/* Accent bar */}
          <div className="h-1 bg-gradient-to-r from-[#00775B] via-[#00956D] to-[#00D4AA]" />

          {/* Header */}
          <div className="px-8 pt-6 pb-5 border-b border-[#E2E8F0]">
            <div className="flex items-start justify-between mb-5">
              <div style={INTER}>
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-5 h-5 rounded-[4px] bg-[#00775B] flex items-center justify-center">
                    <Zap className="w-3 h-3 text-white" />
                  </div>
                  <span className="text-[11px] font-semibold text-[#00775B] uppercase tracking-[0.08em]">
                    Initial Setup · Step {step} of 4
                  </span>
                </div>
                <h2 className="text-[22px] font-bold text-[#0F172A] leading-tight">{meta.title}</h2>
                <p className="text-[14px] text-[#64748B] mt-1 leading-relaxed">{meta.subtitle}</p>
              </div>
              {/* Top-right actions: dismiss + version switcher */}
              <div className="flex items-center gap-2 shrink-0 mt-1">
                {onDismiss && (
                  <button
                    onClick={onDismiss}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] border border-[#E2E8F0] text-[12px] font-semibold text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#0F172A] transition-all"
                    style={INTER}
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    Back to VMS
                  </button>
                )}
              {onSwitchVersion && (
                <div className="flex items-center gap-1 p-1 rounded-[6px] bg-[#F1F5F9] border border-[#E2E8F0]">
                  {(["v1","v2"] as const).map(v => (
                    <button key={v} onClick={() => v === "v2" && onSwitchVersion()}
                      style={INTER}
                      className={cn(
                        "px-3 py-1 rounded-[4px] text-[11px] font-bold tracking-wider uppercase transition-all duration-150",
                        v === "v1" ? "bg-[#00775B] text-white shadow-sm" : "text-[#94A3B8] hover:text-[#64748B]",
                      )}>
                      {v}
                    </button>
                  ))}
                </div>
              )}
              </div>
            </div>
            <ProgressStepper current={step} />
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto px-8 py-6">
            {step === 1 && <Step1 form={cameraForm} setForm={setCameraForm} />}
            {step === 2 && <Step2 form={projectForm} setForm={setProjectForm} />}
            {step === 3 && <Step3 form={pipelineForm} setForm={setPipelineForm} />}
            {step === 4 && <Step4 onComplete={onComplete} />}
          </div>

          {/* Footer */}
          {step < 4 && (
            <div className="px-8 py-4 border-t border-[#E2E8F0] flex items-center justify-between bg-[#FAFAFA]">
              <button
                onClick={() => step > 1 && setStep((step - 1) as WizardStep)}
                disabled={step === 1}
                className="px-5 py-2.5 rounded-[4px] border border-[#E2E8F0] text-[14px] font-semibold text-[#475569] hover:bg-[#F1F5F9] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                style={INTER}
              >
                Back
              </button>
              <button
                onClick={() => canNext() && setStep((step + 1) as WizardStep)}
                disabled={!canNext()}
                className={cn(
                  "flex items-center gap-2 px-6 py-2.5 rounded-[4px] text-[14px] font-semibold text-white transition-all duration-200",
                  canNext()
                    ? "bg-[#00775B] hover:bg-[#004E3D] active:scale-[0.98] shadow-[0_2px_8px_rgba(0,119,91,0.3)]"
                    : "bg-[#CBD5E1] cursor-not-allowed",
                )}
                style={INTER}
              >
                {step === 3 ? "Review & Launch" : "Continue"}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
