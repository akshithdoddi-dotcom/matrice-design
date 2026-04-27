import { useState, useEffect, useCallback } from "react";
import type { GroupConfig } from "@/app/components/pages/IdentityAnalytics";
import {
  Radio, AlertTriangle, CheckCircle2, XCircle,
  RotateCcw, Wrench, UserPlus, Lock, ClipboardList,
  ShieldAlert, Eye, PhoneCall, Hammer, RefreshCw, X,
  Bell, ChevronRight, MapPin, Camera, Clock,
  Mail, Check,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { QualitySlidePanel as SlidePanel } from "../panels/QualitySlidePanel";
import type { QualityTerminology } from "../../data/types";

// ── Types ─────────────────────────────────────────────────────────────────────

type Severity  = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
type EvtState  = "LIVE" | "ACKNOWLEDGED" | "RESOLVED";

interface ActionDef {
  label: string;
  icon:  React.ElementType;
  variant: "danger" | "warning" | "primary" | "default";
}

interface InstantEvent {
  id:         string;
  severity:   Severity;
  title:      string;
  detail:     string;
  location:   string;
  camera:     string;
  ageSeconds: number;
  actions:    ActionDef[];
  imgSeed:    number;
}

// ── Config ────────────────────────────────────────────────────────────────────

const SEV_BAR: Record<Severity, string> = {
  CRITICAL: "bg-red-600",
  HIGH:     "bg-orange-500",
  MEDIUM:   "bg-amber-400",
  INFO:     "bg-sky-400",
};

const SEV_BADGE_COLOR: Record<Severity, string> = {
  CRITICAL: "bg-red-600 text-white",
  HIGH:     "bg-orange-100 text-orange-700",
  MEDIUM:   "bg-amber-100 text-amber-700",
  INFO:     "bg-sky-50 text-sky-700",
};

const SEV_ROW: Record<Severity, string> = {
  CRITICAL: "bg-red-50/40",
  HIGH:     "bg-orange-50/20",
  MEDIUM:   "",
  INFO:     "",
};

const BTN_STYLES: Record<string, string> = {
  danger:  "bg-red-600 text-white hover:bg-red-700",
  warning: "bg-amber-500 text-white hover:bg-amber-600",
  primary: "bg-[#00775B] text-white hover:bg-[#006349]",
  default: "bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-50",
};

// ── Per-app config (images + context) ─────────────────────────────────────────
// imgSeeds: 8 picsum seeds visually relevant to each app
// locations / cameras: domain-appropriate names

const APP_CONFIG: Record<string, {
  imgSeeds: number[];
  locations: string[];
  cameras: string[];
  eventTitles: [string, string][];  // [title, detail]
}> = {
  bottle:        { imgSeeds:[101,102,103,104,105,106,107,108], locations:["Filling Station","QC Station","Labeling Stage","Capping Line","Forming Stage","Inspection Zone","Moulding Stage","Curing Stage"], cameras:["Line 3 · Cam 01","Batch Cam 02","Zone D · Cam 04","Camera B2","Line 2 · Cam 06","Cam 07","Cam 08","Oven 1 · Cam 09"], eventTitles:[["Defect spike — Filling","Defect rate hit 5.1% — 8 units flagged in the last 5 min"],["Batch #043 held at QC","Crack density above limit — batch held pending QC review"],["3 batches with Underfill","Same mould cavity flagged across 3 consecutive batches"],["Labeling stage crossed threshold","Defect rate rising — up 1.3 points since last hour"],["Camera B2 offline","No frames received for 3+ min — coverage gap at line"],["Repeat defect: Shape Deform","Same mould flagged 5 times this shift — root cause unresolved"],["Batch #040 cleared QC","200 units passed inspection — density within spec"],["High temp at Curing Stage","Temperature at 94°C, above the 88°C process limit"]] },
  pcb:           { imgSeeds:[201,202,203,204,205,206,207,208], locations:["SMT Line A","AOI Station","Reflow Oven","Wave Solder","X-Ray Station","Rework Bay","Electrical Test","Final QC"], cameras:["Line A · Cam 01","AOI Cam 02","Oven Cam 03","Solder Cam 04","X-Ray Cam 05","Rework Cam 06","Test Cam 07","QC Cam 08"], eventTitles:[["Solder bridge spike on SMT A","4.2% defect rate — 6 bridges detected in the last 4 min"],["Batch #PCB-88 failed AOI","Tombstone rate at 5.8%, above the 2% AOI limit"],["Reflow profile deviation","Peak temperature reached 248°C, spec is 245°C"],["Missing component: C204","3 boards missing 100nF cap — feeder issue on Line A"],["X-Ray camera offline","No frames for 2+ min — Station 3 coverage gap"],["Repeat cold joint — same board position","Same pad R112 flagged 4 times this shift"],["Batch #PCB-85 released","140 boards passed — defect rate 0.8%, all clear"],["Flux residue above threshold","Ionic contamination at 12µg/cm², limit is 10µg/cm²"]] },
  welding:       { imgSeeds:[301,302,303,304,305,306,307,308], locations:["Weld Bay A","Robotic Cell 2","Inspection Station","Post-Weld QC","Grinding Area","NDT Station","Assembly Fit-Up","Final Inspection"], cameras:["Bay A · Cam 01","Robot Cam 02","Insp Cam 03","QC Cam 04","Grind Cam 05","NDT Cam 06","Fit-Up Cam 07","Final Cam 08"], eventTitles:[["Porosity spike — Weld Bay A","8 porous welds in 5 min — rate 5.1%"],["Batch #W043 failed NDT","Crack detected — wall thickness 3.2mm"],["Undercut pattern on Robot Cell 2","3 consecutive joints — same program step"],["Spatter rate crossed RED threshold","Rate 4.8% — up 1.3% vs last shift"],["Camera offline — NDT Station","No frames for 3 min — coverage gap"],["Repeat incomplete fusion — Joint #7","5th occurrence this shift — root cause open"],["Batch #W040 released","80 joints passed — UT inspection clear"],["High interpass temp — Bay A","Interpass 280°C — above 250°C spec"]] },
  "car-damage":  { imgSeeds:[401,402,403,404,405,406,407,408], locations:["Exterior Scan Bay","Panel Assessment","Bumper Station","Undercarriage Zone","Paint Booth","Glass Inspection","Interior Check","Final Gate"], cameras:["Scan Bay · Cam 01","Panel Cam 02","Bumper Cam 03","Under Cam 04","Paint Cam 05","Glass Cam 06","Interior Cam 07","Gate Cam 08"], eventTitles:[["Dent detection spike — Scan Bay","8 dents in 5 min — severity HIGH"],["Vehicle #443 failed panel assessment","Scratch density 6.2% — limit 3.5%"],["3 vehicles with hood damage","Sequential arrival — same transport batch"],["Paint booth defect rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Scan camera offline","No frames for 3 min — Bay 2 gap"],["Repeat bumper crack — same model","5th occurrence this shift — supplier issue"],["Vehicle #440 cleared assessment","Full scan passed — no damage detected"],["Lighting intensity low in Glass Zone","Lux 180 — below 220 threshold"]] },
  corrosion:     { imgSeeds:[501,502,503,504,505,506,507,508], locations:["Tank Farm A","Pipe Network B","Storage Vessel 3","Heat Exchanger","Cooling Tower","Pressure Vessel","Structural Bay","Coating Station"], cameras:["Tank Cam 01","Pipe Cam 02","Vessel Cam 03","HX Cam 04","Tower Cam 05","PV Cam 06","Struct Cam 07","Coat Cam 08"], eventTitles:[["Corrosion rate spike — Tank Farm A","Wall loss 0.8mm in 30 days — limit 0.5mm"],["Vessel #V043 flagged — pitting detected","Pit depth 4.2mm — structural limit 3mm"],["3 pipe sections with delamination","Same coating batch — supplier quality issue"],["Heat exchanger fouling elevated","Efficiency drop 12% — above 8% threshold"],["UT camera offline — Pipe Network B","No readings for 3 min — coverage gap"],["Repeat crevice corrosion — Flange F7","5th occurrence this quarter — root cause open"],["Vessel #V040 cleared inspection","Full UT scan passed — no active corrosion"],["Humidity spike in Coating Station","RH 82% — above 75% application limit"]] },
  "road-damage": { imgSeeds:[601,602,603,604,605,606,607,608], locations:["Section A · KM 0–5","Junction B12","Overpass Section","Shoulder Zone C","Intersection D4","Urban Corridor","Highway Ramp","Service Road"], cameras:["Seg-A Cam 01","Junction Cam 02","Overpass Cam 03","Shoulder Cam 04","Inter Cam 05","Urban Cam 06","Ramp Cam 07","SR Cam 08"], eventTitles:[["Crack density spike — Section A","8 new cracks in 500m — severity HIGH"],["Junction B12 — pavement failure","Alligator cracking 6.2% area — limit 3%"],["3 overpass sections with spalling","Same pour batch — material issue suspected"],["Shoulder surface distress elevated","IRI 4.8 — up 1.3 vs last survey"],["Camera offline — Section B","No frames for 3 min — coverage gap"],["Repeat longitudinal crack — KM 12","5th detection this month — no repair issued"],["Section A0 cleared assessment","500m stretch assessed — no critical damage"],["Standing water detected — Ramp 2","Drainage blockage — slip risk HIGH"]] },
  pothole:       { imgSeeds:[701,702,703,704,705,706,707,708], locations:["Main Blvd · Zone A","Industrial Access Rd","Parking Lot B3","Highway Ramp 7","Residential Block 4","Port Entry Road","Airport Access","Ring Road Sector 2"], cameras:["Blvd Cam 01","Access Cam 02","Lot Cam 03","Ramp Cam 04","Res Cam 05","Port Cam 06","Airport Cam 07","Ring Cam 08"], eventTitles:[["Critical pothole — Main Blvd Zone A","Depth 12cm · width 45cm — road hazard"],["Cluster of 4 potholes — Industrial Rd","Within 20m — base failure suspected"],["3 potholes on Ramp 7","Formed post-rain — drainage issue confirmed"],["Pothole rate elevated — Sector 2","8 new potholes this shift — up 60%"],["Camera offline — Parking Lot B3","No frames for 3 min — coverage gap"],["Repeat pothole location — KM 4.2","5th occurrence — temporary patch failing"],["Industrial Access Rd cleared","Full survey complete — no new potholes"],["High-severity pothole — Port Entry","Depth 18cm — HGV restriction advised"]] },
  "phone-screen":{ imgSeeds:[801,802,803,804,805,806,807,808], locations:["Display Assembly A","Lamination Station","Backlight Zone","Touch Panel QC","Cover Glass Fit","Final Display Test","Cleanliness Check","Packaging Gate"], cameras:["Asm Cam 01","Lam Cam 02","BL Cam 03","Touch Cam 04","Glass Cam 05","Test Cam 06","Clean Cam 07","Pack Cam 08"], eventTitles:[["Dead pixel cluster — Assembly A","8 units affected in 5 min — rate 5.1%"],["Batch #D043 held — delamination","Air bubble density 6.2% — limit 3.5%"],["3 panels with backlight bleed","Same batch — diffuser sheet issue"],["Touch response failure elevated","Rate 4.8% — up 1.3% vs last hour"],["Inspection camera offline","No frames for 3 min — coverage gap"],["Repeat scratch — Display Station 2","5th occurrence this shift — jig wear"],["Batch #D040 released","200 displays passed — zero defects"],["Dust particle spike — Cleanroom A","Particle count 2,400/m³ — limit 1,800"]] },
  assembly:      { imgSeeds:[901,902,903,904,905,906,907,908], locations:["Line A · Station 3","Torque Station","Press Fit Zone","Sub-Assembly B","End-of-Line Test","Rework Cell","Vision Station","Packaging Gate"], cameras:["Line A · Cam 01","Torque Cam 02","Press Cam 03","Sub-B Cam 04","EOL Cam 05","Rework Cam 06","Vision Cam 07","Pack Cam 08"], eventTitles:[["Assembly error spike — Station 3","8 misassemblies in 5 min — rate 5.1%"],["Batch #A043 failed end-of-line test","Torque spec failure — 6.2% out of range"],["3 units missing fastener M8","Sequential units — feeder jam suspected"],["Vision inspection threshold crossed","Defect rate 4.8% — up 1.3% vs last hr"],["Vision camera offline","No frames for 3 min — Station 5 gap"],["Repeat wrong orientation — Part P17","5th occurrence this shift — fixture wear"],["Batch #A040 released","180 units passed — full assembly verified"],["Compressed air pressure low","68 PSI — below 80 PSI minimum"]] },
  "food-quality":{ imgSeeds:[111,112,113,114,115,116,117,118], locations:["Sorting Line A","Grading Station","Wash Zone B","Packaging Line","Cold Store Gate","Metal Detect","Weight Check","Final QC"], cameras:["Sort Cam 01","Grade Cam 02","Wash Cam 03","Pack Cam 04","Store Cam 05","Metal Cam 06","Weight Cam 07","QC Cam 08"], eventTitles:[["Foreign body detected — Sorting A","Suspected plastic fragment — line halted"],["Batch #F043 flagged — discolouration","Colour deviation 6.2 ΔE — limit 3.5"],["3 consecutive underweight packs","Weight 428g vs target 450g — filler fault"],["Contamination rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Sort camera offline","No frames for 3 min — coverage gap"],["Repeat mould detection — same zone","5th occurrence this shift — humidity issue"],["Batch #F040 released","500 units passed — spec compliant"],["Cold store temperature elevated","4.8°C — above 4°C HACCP limit"]] },
  textile:       { imgSeeds:[121,122,123,124,125,126,127,128], locations:["Weaving Room A","Dyeing Station","Cutting Zone B","Inspection Table","Finishing Line","Print Station","Folding Gate","Packaging Area"], cameras:["Weave Cam 01","Dye Cam 02","Cut Cam 03","Insp Cam 04","Finish Cam 05","Print Cam 06","Fold Cam 07","Pack Cam 08"], eventTitles:[["Fabric defect spike — Weaving A","8 snags in 5 min — rate 5.1%"],["Batch #T043 held — colour mismatch","ΔE 6.2 — limit 3.5 — dyeing fault"],["3 rolls with warp thread break","Same loom — warp tension issue"],["Cutting defect rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Inspection camera offline","No frames for 3 min — Table 2 gap"],["Repeat pilling — same fabric lot","5th occurrence — raw material issue"],["Batch #T040 released","250m passed — zero critical defects"],["Humidity spike — Weaving Room A","RH 78% — above 70% thread spec"]] },
  "solar-panel": { imgSeeds:[131,132,133,134,135,136,137,138], locations:["Cell Layup Station","String Welding","Lamination Press","EL Imaging Zone","Flash Test Station","Framing Line","Cleaning Station","Final Inspection"], cameras:["Layup Cam 01","String Cam 02","Lam Cam 03","EL Cam 04","Flash Cam 05","Frame Cam 06","Clean Cam 07","Final Cam 08"], eventTitles:[["Micro-crack spike — Layup Station","8 cracked cells in 5 min — rate 5.1%"],["Module #S043 failed EL imaging","Dark area coverage 6.2% — limit 3%"],["3 modules with delamination","Same batch — EVA film supplier issue"],["Flash test failure rate elevated","Rate 4.8% — up 1.3% vs last hour"],["EL camera offline","No frames for 3 min — coverage gap"],["Repeat busbar misalignment","5th occurrence this shift — jig wear"],["Module #S040 released","50 panels passed — Pmax within spec"],["Laminator temp deviation","158°C — below 160°C process spec"]] },
  semiconductor: { imgSeeds:[141,142,143,144,145,146,147,148], locations:["Lithography Bay","Etching Chamber","CVD Station","CMP Zone","Wafer Inspect","Dicing Line","Die Attach","Wire Bond"], cameras:["Litho Cam 01","Etch Cam 02","CVD Cam 03","CMP Cam 04","Insp Cam 05","Dice Cam 06","Die Cam 07","Bond Cam 08"], eventTitles:[["CD deviation — Lithography Bay","8 dies out of spec in 5 min — rate 5.1%"],["Wafer #W043 held — etch uniformity","Non-uniformity 6.2% — limit 3%"],["3 wafers with CVD deposition fault","Same run — gas flow controller issue"],["Particle count threshold crossed","Rate 4.8 above limit — up 1.3% vs baseline"],["Inspection camera offline","No frames for 2 min — critical gap"],["Repeat gate oxide pinhole — Position D7","5th occurrence — reticle contamination"],["Wafer #W040 released","25 dies passed final inspection — yield 98.4%"],["CMP slurry pH out of range","pH 10.8 — above 10.5 spec limit"]] },
  "metal-surface":{ imgSeeds:[151,152,153,154,155,156,157,158], locations:["Rolling Mill A","Surface Prep","Shot Blast Zone","Coating Line","Visual Check","Flatness Test","Gauge Station","Final Store"], cameras:["Mill Cam 01","Prep Cam 02","Blast Cam 03","Coat Cam 04","Visual Cam 05","Flat Cam 06","Gauge Cam 07","Store Cam 08"], eventTitles:[["Surface defect spike — Rolling Mill A","8 scratches in 5 min — rate 5.1%"],["Coil #M043 held — pitting detected","Pit density 6.2/m² — limit 3/m²"],["3 coils with edge crack","Same roll pass — roll wear suspected"],["Coating adhesion failure elevated","Rate 4.8% — up 1.3% vs last hour"],["Visual camera offline","No frames for 3 min — Station 4 gap"],["Repeat orange peel — Coating Line","5th occurrence — viscosity drift"],["Coil #M040 released","5 tonnes passed — surface grade A confirmed"],["Shot blast pressure low","5.2 bar — below 6 bar spec"]] },
  glass:         { imgSeeds:[161,162,163,164,165,166,167,168], locations:["Float Line A","Annealing Lehr","Cutting Station","Edge Grind Zone","Coating Booth","Tempering Furnace","Inspection Station","Packing Gate"], cameras:["Float Cam 01","Lehr Cam 02","Cut Cam 03","Grind Cam 04","Coat Cam 05","Temper Cam 06","Insp Cam 07","Pack Cam 08"], eventTitles:[["Inclusion spike — Float Line A","8 stones detected in 5 min — rate 5.1%"],["Sheet #G043 held at inspection","Bubble density 6.2/m² — limit 3/m²"],["3 sheets with distortion","Same melt tank batch — pull rate issue"],["Edge chip rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Inspection camera offline","No frames for 3 min — coverage gap"],["Repeat seed defect — same tank zone","5th occurrence — refractory wear"],["Sheet #G040 released","20 sheets passed — optical quality confirmed"],["Annealing temp deviation","Lehr zone 4: 498°C — above 490°C spec"]] },
  paint:         { imgSeeds:[171,172,173,174,175,176,177,178], locations:["Pre-Treatment Zone","Primer Booth","Base Coat Line","Clear Coat","Flash-Off Zone","Oven Cure","Inspection Bay","Rectification"], cameras:["Pre-Treat Cam 01","Primer Cam 02","Base Cam 03","Clear Cam 04","Flash Cam 05","Oven Cam 06","Insp Cam 07","Rect Cam 08"], eventTitles:[["Fish-eye spike — Base Coat Line","8 defects in 5 min — rate 5.1%"],["Panel #P043 held — orange peel","Surface roughness Ra 2.4 — limit 1.8"],["3 panels with dirt inclusion","Same batch — filter bypass suspected"],["Sagging rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Inspection camera offline","No frames for 3 min — coverage gap"],["Repeat pin-hole — Clear Coat zone","5th occurrence — viscosity out of range"],["Panel #P040 released","60 panels passed — gloss 92 GU confirmed"],["Flash-off time deviation","Zone 2: 6.2 min — below 8 min spec"]] },
  "wire-harness":{ imgSeeds:[181,182,183,184,185,186,187,188], locations:["Cut & Strip Line","Crimp Station A","Sub-Assembly B","Routing Board","Continuity Test","Pull Test Zone","Visual Check","Packaging Gate"], cameras:["Cut Cam 01","Crimp Cam 02","Sub-B Cam 03","Route Cam 04","Cont Cam 05","Pull Cam 06","Visual Cam 07","Pack Cam 08"], eventTitles:[["Crimp defect spike — Station A","8 bad crimps in 5 min — rate 5.1%"],["Harness #H043 failed continuity","Open circuit at connector C12 — 6 circuits"],["3 harnesses with wrong wire gauge","Same routing board — BOM discrepancy"],["Pull-out force failure elevated","Rate 4.8% — up 1.3% vs last hour"],["Inspection camera offline","No frames for 3 min — Station 3 gap"],["Repeat insulation nick — Cut Line","5th occurrence — blade wear issue"],["Harness #H040 released","120 units passed — full continuity verified"],["Crimp force sensor drift — Station B","Force 280N — below 320N minimum"]] },
  packaging:     { imgSeeds:[191,192,193,194,195,196,197,198], locations:["Filling Line A","Sealing Station","Label Zone B","Date Code Print","Inspection Gate","Box Erect","Case Packing","Palletising"], cameras:["Fill Cam 01","Seal Cam 02","Label Cam 03","Print Cam 04","Gate Cam 05","Box Cam 06","Case Cam 07","Pal Cam 08"], eventTitles:[["Seal failure spike — Line A","8 open seals in 5 min — rate 5.1%"],["Batch #PK043 held — label mismatch","Wrong SKU on 6.2% of units — limit 2%"],["3 cases with incorrect date code","Same print head — ink pressure issue"],["Missing label rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Inspection camera offline","No frames for 3 min — Gate 2 gap"],["Repeat underfill — Filling Station","5th occurrence — nozzle wear"],["Batch #PK040 released","800 units passed — fully compliant"],["Conveyor speed variance — Case Pack","Speed 52 ppm — above 50 ppm spec"]] },
  wood:          { imgSeeds:[211,212,213,214,215,216,217,218], locations:["Sawmill Line A","Planer Station","Kiln Zone B","Grading Table","Finishing Line","Joint Assembly","Inspection Bay","Packaging Gate"], cameras:["Saw Cam 01","Plane Cam 02","Kiln Cam 03","Grade Cam 04","Finish Cam 05","Joint Cam 06","Insp Cam 07","Pack Cam 08"], eventTitles:[["Knot density spike — Sawmill A","8 boards flagged in 5 min — grade F"],["Batch #W043 downgraded — warp","Bow 6.2mm/m — limit 3mm/m"],["3 boards with blue stain","Same kiln charge — moisture issue"],["Surface defect rate elevated","Rate 4.8% — up 1.3% vs last hour"],["Grading camera offline","No frames for 3 min — coverage gap"],["Repeat split end — Drying Line","5th occurrence — rapid drying schedule"],["Batch #W040 released","200 boards graded — Grade A confirmed"],["Kiln temperature deviation","Zone 3: 68°C — below 72°C spec"]] },
};

// ── Build events from app config ───────────────────────────────────────────────

const BASE_EVENTS: Array<{
  id: string; severity: Severity; ageSeconds: number;
  actions: ActionDef[];
}> = [
  { id:"e1", severity:"CRITICAL", ageSeconds:18,  actions:[{ label:"Alert Engineer",  icon:PhoneCall,    variant:"primary" }, { label:"Log Incident", icon:ClipboardList, variant:"default" }] },
  { id:"e2", severity:"CRITICAL", ageSeconds:47,  actions:[{ label:"Reject Batch",    icon:XCircle,       variant:"danger"  }, { label:"Inspect Now",     icon:Eye,          variant:"primary" }, { label:"File Report",  icon:ClipboardList, variant:"default" }] },
  { id:"e3", severity:"HIGH",     ageSeconds:112, actions:[{ label:"Review Process",  icon:RefreshCw,     variant:"warning" }, { label:"Alert QE",        icon:PhoneCall,    variant:"default" }] },
  { id:"e4", severity:"HIGH",     ageSeconds:205, actions:[{ label:"Escalate",        icon:ShieldAlert,   variant:"warning" }, { label:"Inspect Station", icon:Wrench,       variant:"primary" }] },
  { id:"e5", severity:"MEDIUM",   ageSeconds:310, actions:[{ label:"Notify Tech",     icon:PhoneCall,    variant:"default"  }, { label:"Switch Feed",     icon:Radio,        variant:"default" }] },
  { id:"e6", severity:"MEDIUM",   ageSeconds:480, actions:[{ label:"Flag for Review", icon:ClipboardList, variant:"warning" }] },
  { id:"e7", severity:"INFO",     ageSeconds:620, actions:[{ label:"Release Batch",   icon:CheckCircle2, variant:"default"  }] },
  { id:"e8", severity:"MEDIUM",   ageSeconds:790, actions:[{ label:"Adjust Process",  icon:Hammer,       variant:"warning"  }] },
];

function buildEvents(appId: string): InstantEvent[] {
  const cfg = APP_CONFIG[appId] ?? APP_CONFIG["bottle"];
  return BASE_EVENTS.map((base, i) => ({
    ...base,
    title:      cfg.eventTitles[i][0],
    detail:     cfg.eventTitles[i][1],
    location:   cfg.locations[i],
    camera:     cfg.cameras[i],
    imgSeed:    cfg.imgSeeds[i],
  }));
}

// ── Helpers ────────────────────────────────────────────────────────────────────

function fmtAge(sec: number) {
  if (sec < 60)   return `${sec}s ago`;
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  return `${Math.floor(sec / 3600)}h ago`;
}

const RESOLVE_LABELS = new Set(["Release Batch", "Mark Resolved", "Reject Batch"]);

// ── Default groups (shared with Settings) ─────────────────────────────────────

export const DEFAULT_QUALITY_GROUPS: GroupConfig[] = [
  { name: "Quality Engineer",   emails: [] },
  { name: "Line Supervisor",    emails: [] },
  { name: "Shift Manager",      emails: [] },
  { name: "Maintenance Team",   emails: [] },
  { name: "Operations Director", emails: [] },
  { name: "Dispatch Center",    emails: [] },
];

// ── Event Detail Slide Panel ───────────────────────────────────────────────────

function EventDetailPanel({
  event,
  isOpen,
  onClose,
  onResolve,
  groups,
}: {
  event: InstantEvent | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: () => void;
  groups: GroupConfig[];
}) {
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [notified, setNotified] = useState(false);
  const [actionDone, setActionDone] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) { setSelectedGroups(new Set()); setNotified(false); setActionDone(null); }
  }, [isOpen]);

  if (!event) return null;

  const toggleGroup = (g: string) =>
    setSelectedGroups(prev => { const s = new Set(prev); s.has(g) ? s.delete(g) : s.add(g); return s; });

  const handleNotify = () => {
    if (selectedGroups.size === 0) return;
    setNotified(true);
  };

  const handleAction = (label: string) => {
    setActionDone(label);
    if (RESOLVE_LABELS.has(label)) onResolve();
  };

  const sevColor = {
    CRITICAL: "text-red-600 bg-red-50 border-red-200",
    HIGH:     "text-orange-600 bg-orange-50 border-orange-200",
    MEDIUM:   "text-amber-600 bg-amber-50 border-amber-200",
    INFO:     "text-sky-600 bg-sky-50 border-sky-200",
  }[event.severity];

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Live Feed Event"
      subtitle={event.title}
      width="w-[560px]"
    >
      <div className="p-5 space-y-5">

        {/* Snapshot */}
        <div className="relative w-full h-44 rounded-md overflow-hidden bg-neutral-100 border border-neutral-200">
          <img
            src={`https://picsum.photos/seed/${event.imgSeed}/800/352`}
            alt="Event snapshot"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-2.5 left-3 right-3 flex items-end justify-between">
            <div>
              <p className="text-white text-[13px] font-bold leading-snug">{event.title}</p>
              <p className="text-white/70 text-[10px] mt-0.5">{event.detail}</p>
            </div>
            <span className={cn(
              "inline-flex items-center gap-1 text-[9px] font-black px-2 py-0.5 rounded-[2px] uppercase tracking-wide border shrink-0",
              sevColor
            )}>
              {event.severity === "CRITICAL" && <span className="w-1 h-1 rounded-full bg-red-600 animate-pulse" />}
              {event.severity}
            </span>
          </div>
        </div>

        {/* Meta */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
            <MapPin className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-bold">{event.location}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
            <Camera className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-bold">{event.camera}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-neutral-600">
            <Clock className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
            <span className="font-mono">{fmtAge(event.ageSeconds)}</span>
          </div>
        </div>

        {/* Primary CTA */}
        <button
          onClick={() => handleAction("Alert Operator")}
          disabled={actionDone === "Alert Operator"}
          className={cn(
            "w-full flex items-center justify-center gap-2 h-10 rounded-md text-[12px] font-bold transition-colors",
            actionDone === "Alert Operator"
              ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              : "bg-[#00775B] text-white hover:bg-[#006349]"
          )}
        >
          <Bell className="w-4 h-4" />
          {actionDone === "Alert Operator" ? "Operator Alerted" : "Alert Operator"}
        </button>

        {/* Secondary actions */}
        {event.actions.length > 0 && (
          <div className="space-y-2">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Actions</p>
            <div className="flex flex-wrap gap-2">
              {event.actions.map((a) => (
                <button
                  key={a.label}
                  onClick={() => handleAction(a.label)}
                  disabled={actionDone === a.label}
                  className={cn(
                    "inline-flex items-center gap-1.5 h-7 px-3 rounded-[4px] text-[10px] font-bold transition-colors whitespace-nowrap",
                    actionDone === a.label
                      ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                      : BTN_STYLES[a.variant]
                  )}
                >
                  <a.icon className="w-3 h-3 shrink-0" />
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Notify section */}
        <div className="space-y-2">
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Notify</p>
          <div className="rounded-md border border-neutral-200 overflow-hidden">
            <div className="grid grid-cols-2 divide-x divide-neutral-100">
              {groups.map((g) => (
                <label
                  key={g.name}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors text-[11px] font-medium text-neutral-700 hover:bg-neutral-50",
                    selectedGroups.has(g.name) && "bg-[#E5FFF9] text-[#00775B]"
                  )}
                >
                  <div className={cn(
                    "w-3.5 h-3.5 rounded-[3px] border-2 flex items-center justify-center shrink-0 transition-colors",
                    selectedGroups.has(g.name) ? "border-[#00775B] bg-[#00775B]" : "border-neutral-300"
                  )}
                    onClick={() => toggleGroup(g.name)}
                  >
                    {selectedGroups.has(g.name) && <Check className="w-2 h-2 text-white" strokeWidth={3} />}
                  </div>
                  <span onClick={() => toggleGroup(g.name)}>{g.name}</span>
                </label>
              ))}
            </div>
            <div className="border-t border-neutral-100">
              {notified ? (
                <div className="flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold text-[#00775B]">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Notification sent to {selectedGroups.size} group{selectedGroups.size !== 1 ? "s" : ""}
                </div>
              ) : (
                <button
                  onClick={handleNotify}
                  disabled={selectedGroups.size === 0}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 text-[11px] font-bold transition-colors",
                    selectedGroups.size > 0
                      ? "text-[#00775B] hover:bg-[#E5FFF9]"
                      : "text-neutral-300 cursor-not-allowed"
                  )}
                >
                  <Mail className="w-3.5 h-3.5" />
                  {selectedGroups.size > 0 ? `Send Notification to ${selectedGroups.size} group${selectedGroups.size !== 1 ? "s" : ""}` : "Select recipients"}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Resolve */}
        <button
          onClick={() => { onResolve(); onClose(); }}
          className="w-full flex items-center justify-center gap-2 h-8 rounded-[4px] border border-neutral-200 text-[11px] font-bold text-neutral-500 hover:bg-neutral-50 transition-colors"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          Mark as Resolved
        </button>
      </div>
    </SlidePanel>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────────

interface Props {
  terminology: QualityTerminology;
  appId: string;
  groups?: GroupConfig[];
}

export const InstantAnalyticsPanel = ({ terminology: _terminology, appId, groups = DEFAULT_QUALITY_GROUPS }: Props) => {
  const events = buildEvents(appId);

  const [states, setStates]               = useState<Record<string, EvtState>>({});
  const [ticked, setTicked]               = useState(0);
  const [selectedEvent, setSelectedEvent] = useState<InstantEvent | null>(null);
  const [sevFilter, setSevFilter]         = useState<Severity | "ALL">("ALL");

  // Reset state when app changes
  useEffect(() => {
    setStates({});
    setSelectedEvent(null);
    setSevFilter("ALL");
  }, [appId]);

  useEffect(() => {
    const id = setInterval(() => setTicked(t => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const resolve = useCallback((evId: string) =>
    setStates(s => ({ ...s, [evId]: "RESOLVED" })), []);

  const liveRows  = events.filter(e => (states[e.id] ?? "LIVE") === "LIVE");
  const ackedRows = events.filter(e => states[e.id] === "ACKNOWLEDGED");
  const resolvedN = events.filter(e => states[e.id] === "RESOLVED").length;
  const critN     = liveRows.filter(e => e.severity === "CRITICAL").length;

  // Severity counts (live only)
  const sevCounts: Record<Severity, number> = {
    CRITICAL: liveRows.filter(e => e.severity === "CRITICAL").length,
    HIGH:     liveRows.filter(e => e.severity === "HIGH").length,
    MEDIUM:   liveRows.filter(e => e.severity === "MEDIUM").length,
    INFO:     liveRows.filter(e => e.severity === "INFO").length,
  };

  const filteredLive = sevFilter === "ALL"
    ? liveRows
    : liveRows.filter(e => e.severity === sevFilter);

  const TAB_CFG: { key: Severity | "ALL"; label: string }[] = [
    { key: "ALL",      label: `All (${liveRows.length})`         },
    { key: "CRITICAL", label: `Critical (${sevCounts.CRITICAL})` },
    { key: "HIGH",     label: `High (${sevCounts.HIGH})`         },
    { key: "MEDIUM",   label: `Medium (${sevCounts.MEDIUM})`     },
    { key: "INFO",     label: `Info (${sevCounts.INFO})`         },
  ];

  return (
    <>
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">

        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-2.5 border-b border-neutral-100">
          <Bell className="w-3.5 h-3.5 text-[#00775B]" />
          <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Live Feed</span>
          <span className="text-[10px] text-neutral-400">{liveRows.length} events</span>
          {critN > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              {critN} CRITICAL
            </span>
          )}

          {/* Severity filter tabs */}
          <div className="ml-auto flex items-center gap-1">
            {TAB_CFG.map(tab => (
              <button
                key={tab.key}
                onClick={() => setSevFilter(tab.key)}
                className={cn(
                  "text-[10px] font-bold px-2.5 py-1 rounded-[3px] transition-colors",
                  sevFilter === tab.key
                    ? "bg-[#00775B] text-white"
                    : "text-neutral-500 hover:bg-neutral-100"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-[#001E18]">
              <tr className="border-b border-[#00775B]/20 text-[10px] uppercase tracking-wider font-bold text-white/90 h-10">
                <th className="w-[3px] p-0" />
                <th className="px-4 py-2 w-20">ID</th>
                <th className="px-4 py-2 w-28">Snapshot</th>
                <th className="px-4 py-2">Event Details</th>
                <th className="px-4 py-2 w-24 text-center">Severity</th>
                <th className="px-4 py-2 w-36">Location</th>
                <th className="px-4 py-2 w-36">Camera / Zone</th>
                <th className="px-4 py-2 w-24 text-right">Age</th>
                <th className="px-4 py-2 w-8" />
              </tr>
            </thead>

            {/* Live rows */}
            <tbody className="divide-y divide-neutral-100">
              {filteredLive.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-1.5 text-neutral-400">
                      <CheckCircle2 className="w-7 h-7 text-emerald-400" />
                      <span className="text-[11px] font-semibold">
                        {liveRows.length === 0 ? "All clear — no active events" : "No events match this filter"}
                      </span>
                    </div>
                  </td>
                </tr>
              ) : filteredLive.map((ev, idx) => (
                <tr
                  key={ev.id}
                  onClick={() => setSelectedEvent(ev)}
                  className={cn(
                    "group transition-colors cursor-pointer h-20",
                    SEV_ROW[ev.severity],
                    "hover:bg-[#E5FFF9]",
                    idx === 0 && ev.severity !== "INFO" && "bg-[#00775B]/5"
                  )}
                >
                  {/* Severity left bar */}
                  <td className={cn("w-[3px] p-0", SEV_BAR[ev.severity])} />

                  {/* ID */}
                  <td className="px-4 py-3">
                    <span className="font-mono text-[11px] font-bold text-neutral-500">
                      #{ev.id.toUpperCase()}
                    </span>
                  </td>

                  {/* Snapshot */}
                  <td className="px-4 py-3">
                    <div className="h-14 w-20 rounded-[2px] overflow-hidden border border-neutral-200 group-hover:border-[#00775B]/30 transition-colors bg-neutral-100">
                      <img
                        src={`https://picsum.photos/seed/${ev.imgSeed}/160/112`}
                        alt="Snapshot"
                        className="h-full w-full object-cover"
                      />
                    </div>
                  </td>

                  {/* Event details */}
                  <td className="px-4 py-3 min-w-0">
                    <p className="text-[12px] font-bold text-neutral-900 leading-snug">{ev.title}</p>
                  </td>

                  {/* Severity badge */}
                  <td className="px-4 py-3 text-center">
                    <div className={cn(
                      "inline-flex items-center gap-1 text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide",
                      SEV_BADGE_COLOR[ev.severity]
                    )}>
                      {ev.severity === "CRITICAL" && (
                        <span className="w-1 h-1 rounded-full bg-white animate-pulse" />
                      )}
                      {ev.severity}
                    </div>
                  </td>

                  {/* Location */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="text-[11px] font-bold text-neutral-700">{ev.location}</span>
                    </div>
                  </td>

                  {/* Camera */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <Camera className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span className="text-[11px] font-bold text-neutral-700">{ev.camera}</span>
                    </div>
                  </td>

                  {/* Age */}
                  <td className="px-4 py-3 text-right">
                    <span className="text-[10px] font-mono tabular-nums text-neutral-400">
                      {fmtAge(ev.ageSeconds + ticked)}
                    </span>
                  </td>

                  {/* Open chevron */}
                  <td className="px-2 py-3">
                    <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors" />
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Acknowledged rows */}
            {ackedRows.length > 0 && (
              <tbody className="divide-y divide-neutral-50 opacity-50">
                <tr>
                  <td colSpan={9} className="px-4 py-1.5 bg-neutral-50">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Acknowledged</span>
                  </td>
                </tr>
                {ackedRows.map((ev) => (
                  <tr key={ev.id} className="hover:bg-neutral-50/50 transition-colors h-14">
                    <td className="w-[3px] p-0 bg-neutral-300" />
                    <td className="px-4 py-2">
                      <span className="font-mono text-[11px] font-bold text-neutral-400">#{ev.id.toUpperCase()}</span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="h-10 w-16 rounded-[2px] overflow-hidden border border-neutral-200 bg-neutral-100">
                        <img src={`https://picsum.photos/seed/${ev.imgSeed}/160/112`} alt="" className="h-full w-full object-cover opacity-50" />
                      </div>
                    </td>
                    <td className="px-4 py-2">
                      <p className="text-[11px] font-bold text-neutral-500">{ev.title}</p>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <span className="inline-flex items-center gap-1 text-[8px] font-bold px-1.5 py-0.5 rounded-[2px] bg-neutral-100 text-neutral-500 uppercase">
                        <RotateCcw className="w-2 h-2" /> ACKED
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] text-neutral-400">{ev.location}</span>
                    </td>
                    <td className="px-4 py-2">
                      <span className="text-[10px] text-neutral-400">{ev.camera}</span>
                    </td>
                    <td className="px-4 py-2 text-right">
                      <span className="text-[10px] font-mono text-neutral-400">{fmtAge(ev.ageSeconds + ticked)}</span>
                    </td>
                    <td className="px-2 py-2 text-right">
                      <button
                        onClick={() => resolve(ev.id)}
                        className="text-[9px] font-bold text-emerald-600 hover:text-emerald-700 transition-colors"
                      >
                        Resolve
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            )}
          </table>
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 px-4 py-2.5 bg-neutral-50/60 flex items-center gap-3">
          <AlertTriangle className="w-3 h-3 text-neutral-300" />
          <span className="text-[10px] text-neutral-400">
            Monitoring <span className="font-bold text-neutral-600">{APP_CONFIG[appId]?.eventTitles[0][0].split("—")[0].trim() ?? appId}</span>
            <span className="mx-1.5 text-neutral-200">·</span>
            Click a row to view details and take action
          </span>
          <span className="ml-auto text-[9px] font-mono text-neutral-300">
            {ticked % 60 < 3 ? "just now" : `${ticked % 60}s ago`}
          </span>
        </div>
      </div>

      {/* Event detail panel */}
      <EventDetailPanel
        event={selectedEvent}
        isOpen={selectedEvent !== null}
        onClose={() => setSelectedEvent(null)}
        onResolve={() => {
          if (selectedEvent) { resolve(selectedEvent.id); setSelectedEvent(null); }
        }}
        groups={groups}
      />
    </>
  );
};
