import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, X, Star, Bell, Filter, ChevronDown, LayoutGrid, List,
  Grid2X2, Grid3X3, Monitor, Maximize2, Play, Pause, Volume2,
  AlertTriangle, AlertCircle, CheckCircle2, Clock, Camera,
  MapPin, Cpu, Zap, Eye, RefreshCw, Settings, LogOut, User,
  Sun, Moon, PanelLeft, PanelLeftClose, ChevronLeft, ChevronRight,
  Layers, Activity, Shield, Video, ChevronsUpDown, Check, Store,
  Wrench, BarChart3, SlidersHorizontal, Plus,
  Download, Share2, Film, SkipBack, SkipForward,
  Sparkles, Tag, Truck, Package, UserRound,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { CommandPalette } from "@/app/components/CommandPalette";

// ─── Mono font shorthand ──────────────────────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace" };
const INTER: React.CSSProperties = { fontFamily: "'Inter',sans-serif" };

// ─── Types ────────────────────────────────────────────────────────────────────

type AppKey = "analytics" | "training" | "marketplace" | "vms";

interface VMSProps {
  onPlatformSwitch?: (app: AppKey) => void;
  isDark?: boolean;
  onToggleDark?: () => void;
}

interface CameraFeed {
  id: string;
  name: string;
  location: string;
  building: string;
  fps: number;
  status: "live" | "offline" | "signal-lost";
  alertLevel?: "critical" | "high" | null;
  alertLabel?: string;
  image?: string;
  applications: string[];
  starred?: boolean;
}

interface SearchResult {
  id: string;
  cameraId: string;
  cameraName: string;
  timestamp: string;   // ISO-ish: "2026-05-12T14:23:07"
  confidence: number;
  matchType: string;
  image: string;
  source: "live" | "archive";
  duration: string;
  location: string;
}

interface SearchSuggestion {
  id: string;
  type: "example" | "tag" | "location" | "camera";
  category?: "Personnel" | "Vehicles" | "Objects";
  text: string;
}

// ─── Mock camera data ─────────────────────────────────────────────────────────

const CAMERA_DATA: CameraFeed[] = [
  { id: "c4",   name: "Main Entrance",         location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: "critical", alertLabel: "ALERT",              applications: ["Fire Detection","Intrusion Detection"], starred: true  },
  { id: "c13",  name: "Lobby Entrance",         location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: "high",     alertLabel: "HIGH",               applications: ["Intrusion Detection"],                  starred: false },
  { id: "c8",   name: "Fitness Center",         location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: "high",     alertLabel: "HIGH",               applications: ["PPE Detection"],                        starred: false },
  { id: "c30",  name: "Safety Station 2",       location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: ["PPE Detection"],                        starred: true  },
  { id: "c21",  name: "Loading Bay 2",          location: "Building B", building: "Building B", fps: 30, status: "live",         alertLevel: null,                                         applications: ["Fire Detection"],                       starred: false },
  { id: "c52",  name: "Distribution Center 3",  location: "Building A", building: "Building A", fps: 0,  status: "offline",      alertLevel: null,                                         applications: [],                                       starred: false },
  { id: "c34",  name: "Emergency Exit 2",       location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: ["Fire Detection"],                       starred: false },
  { id: "c40",  name: "Security Gate 3",        location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: [],                                       starred: true  },
  { id: "c22",  name: "Assembly Line 2",        location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: ["PPE Detection"],                        starred: false },
  { id: "c76",  name: "Elevator Lobby 4",       location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: [],                                       starred: true  },
  { id: "c87",  name: "Employee Lounge 5",      location: "Building D", building: "Building D", fps: 0,  status: "live",         alertLevel: null,                                         applications: [],                                       starred: false },
  { id: "c117", name: "Access Corridor 6",      location: "Building B", building: "Building B", fps: 30, status: "live",         alertLevel: null,                                         applications: [],                                       starred: false },
  { id: "c78",  name: "Monitor Station 4",      location: "Building B", building: "Building B", fps: 30, status: "live",         alertLevel: null,                                         applications: [],                                       starred: false },
  { id: "c33",  name: "Receiving Area 2",       location: "Building B", building: "Building B", fps: 30, status: "live",         alertLevel: null,                                         applications: [],                                       starred: false },
];

const GRID_FEEDS: CameraFeed[] = [
  { id: "c4",   name: "Main Entrance",          location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: "critical", alertLabel: "ALERT",              applications: ["Fire Detection","Intrusion Detection"] },
  { id: "rg1",  name: "Rooftop Garden",         location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "op1",  name: "Outdoor Patio",          location: "Building B", building: "Building B", fps: 0,  status: "signal-lost",  alertLevel: null,                                         applications: [] },
  { id: "me2",  name: "Main Entrance",          location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: ["Fire Detection"] },
  { id: "cr2",  name: "Conference Room 2",      location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "cr3",  name: "Conference Room 3",      location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "eo1",  name: "Executive Office",       location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: "high",     alertLabel: "INTRUSION DETECTED", applications: ["Intrusion Detection"] },
  { id: "fc1",  name: "Fitness Center",         location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: ["PPE Detection"] },
  { id: "tr1",  name: "Training Room",          location: "Building B", building: "Building B", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "pb2",  name: "Parking B2",             location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "br1",  name: "Break Room",             location: "Building D", building: "Building D", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "rf1",  name: "Restrooms · 1st Floor",  location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "le1",  name: "Lobby Entrance",         location: "Building A", building: "Building A", fps: 30, status: "live",         alertLevel: null,                                         applications: ["Intrusion Detection"] },
  { id: "sr1",  name: "Server Room",            location: "Building B", building: "Building B", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "r2f1", name: "Restrooms · 2nd Floor",  location: "Building C", building: "Building C", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
  { id: "oca1", name: "Office Corridor A",      location: "Building D", building: "Building D", fps: 30, status: "live",         alertLevel: null,                                         applications: [] },
];

const FEED_IMAGES: Record<string, string> = {
  c4:   "https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&q=70",
  rg1:  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=480&q=70",
  op1:  "",
  me2:  "https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=480&q=70",
  cr2:  "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=480&q=70",
  cr3:  "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=480&q=70",
  eo1:  "https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&q=70",
  fc1:  "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&q=70",
  tr1:  "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=480&q=70",
  pb2:  "https://images.unsplash.com/photo-1470224114660-3f6686c562eb?w=480&q=70",
  br1:  "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=480&q=70",
  rf1:  "https://images.unsplash.com/photo-1604328698692-f76ea9498e76?w=480&q=70",
  le1:  "https://images.unsplash.com/photo-1562664377-709f2c337eb2?w=480&q=70",
  sr1:  "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=480&q=70",
  r2f1: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=480&q=70",
  oca1: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?w=480&q=70",
};

// ─── Search results (footage clips) ──────────────────────────────────────────

const SEARCH_RESULTS: SearchResult[] = [
  { id: "sr1", cameraId: "c4",  cameraName: "Main Entrance",     timestamp: "2026-05-12T14:23:07", confidence: 97, matchType: "Blue shirt detected",  source: "archive", duration: "00:00:34", location: "Building A", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=640&q=75" },
  { id: "sr2", cameraId: "le1", cameraName: "Lobby Entrance",    timestamp: "2026-05-12T14:18:44", confidence: 91, matchType: "Blue shirt detected",  source: "live",    duration: "00:00:21", location: "Building A", image: "https://images.unsplash.com/photo-1521575107034-e0fa0b594529?w=640&q=75" },
  { id: "sr3", cameraId: "fc1", cameraName: "Fitness Center",    timestamp: "2026-05-12T13:55:20", confidence: 88, matchType: "Cleaning activity",    source: "archive", duration: "00:01:12", location: "Building A", image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=640&q=75" },
  { id: "sr4", cameraId: "tr1", cameraName: "Training Room",     timestamp: "2026-05-12T13:41:02", confidence: 85, matchType: "Blue shirt detected",  source: "archive", duration: "00:00:47", location: "Building B", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=640&q=75" },
  { id: "sr5", cameraId: "cr2", cameraName: "Conference Room 2", timestamp: "2026-05-12T13:29:15", confidence: 79, matchType: "Cleaning activity",    source: "archive", duration: "00:02:05", location: "Building C", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=640&q=75" },
  { id: "sr6", cameraId: "sr1", cameraName: "Server Room",       timestamp: "2026-05-12T13:11:47", confidence: 74, matchType: "Blue shirt detected",  source: "live",    duration: "00:00:19", location: "Building B", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=640&q=75" },
  { id: "sr7", cameraId: "rg1", cameraName: "Rooftop Garden",    timestamp: "2026-05-12T12:58:33", confidence: 71, matchType: "Cleaning activity",    source: "archive", duration: "00:00:58", location: "Building A", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=640&q=75" },
  { id: "sr8", cameraId: "br1", cameraName: "Break Room",        timestamp: "2026-05-12T12:44:09", confidence: 68, matchType: "Blue shirt detected",  source: "archive", duration: "00:00:32", location: "Building D", image: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=640&q=75" },
];

// ─── Predictive search corpus ─────────────────────────────────────────────────

const SEARCH_CORPUS: SearchSuggestion[] = [
  // Semantic examples
  { id: "ex1", type: "example", text: "Blue shirt guy cleaning the room" },
  { id: "ex2", type: "example", text: "Red delivery truck at loading dock B" },
  { id: "ex3", type: "example", text: "Forklift moving without lights" },
  { id: "ex4", type: "example", text: "Person in yellow vest near exit" },
  { id: "ex5", type: "example", text: "Unattended bag in lobby" },

  // Personnel tags
  { id: "t1",  type: "tag", category: "Personnel", text: "Blue shirt" },
  { id: "t2",  type: "tag", category: "Personnel", text: "Yellow safety vest" },
  { id: "t3",  type: "tag", category: "Personnel", text: "Hard hat" },
  { id: "t4",  type: "tag", category: "Personnel", text: "Cleaning activity" },
  { id: "t5",  type: "tag", category: "Personnel", text: "Running person" },
  { id: "t6",  type: "tag", category: "Personnel", text: "Person with bag" },
  { id: "t7",  type: "tag", category: "Personnel", text: "PPE violation" },

  // Vehicle tags
  { id: "t8",  type: "tag", category: "Vehicles", text: "Red delivery truck" },
  { id: "t9",  type: "tag", category: "Vehicles", text: "Forklift" },
  { id: "t10", type: "tag", category: "Vehicles", text: "Unauthorized vehicle" },
  { id: "t11", type: "tag", category: "Vehicles", text: "Black sedan" },
  { id: "t12", type: "tag", category: "Vehicles", text: "White van" },
  { id: "t13", type: "tag", category: "Vehicles", text: "Forklift without operator" },

  // Object tags
  { id: "t14", type: "tag", category: "Objects", text: "Fire extinguisher" },
  { id: "t15", type: "tag", category: "Objects", text: "Unattended bag" },
  { id: "t16", type: "tag", category: "Objects", text: "Cardboard box" },
  { id: "t17", type: "tag", category: "Objects", text: "PPE equipment" },

  // Locations
  { id: "l1",  type: "location", text: "Loading Dock B" },
  { id: "l2",  type: "location", text: "Main Entrance" },
  { id: "l3",  type: "location", text: "Parking Lot" },
  { id: "l4",  type: "location", text: "Server Room" },
  { id: "l5",  type: "location", text: "Rooftop Garden" },
  { id: "l6",  type: "location", text: "Lobby Entrance" },
  { id: "l7",  type: "location", text: "Emergency Exit B" },

  // Cameras
  { id: "cam1", type: "camera", text: "Main Entrance · CAM-04" },
  { id: "cam2", type: "camera", text: "Lobby Entrance · CAM-13" },
  { id: "cam3", type: "camera", text: "Fitness Center · CAM-08" },
  { id: "cam4", type: "camera", text: "Server Room · SR-01" },
  { id: "cam5", type: "camera", text: "Rooftop Garden · RG-01" },
  { id: "cam6", type: "camera", text: "Loading Bay 2 · LB-21" },
];

const LIVE_ALERTS_COUNT = { critical: 2, high: 5 };

// ─── Matrice brand icon ───────────────────────────────────────────────────────

const MatriceIcon = () => (
  <svg viewBox="0 0 32 32" fill="none" className="w-full h-full">
    <rect width="32" height="32" rx="6" fill="#00775B" />
    <path d="M8 24V10l8 7 8-7v14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
    <circle cx="16" cy="17" r="2" fill="white" />
  </svg>
);

const platforms = [
  { icon: Monitor,   label: "Matrice VMS",         shortcut: "1", app: "vms"         as AppKey, active: true },
  { icon: BarChart3, label: "Matrice Analytics",   shortcut: "2", app: "analytics"   as AppKey },
  { icon: Cpu,       label: "Matrice Training",    shortcut: "3", app: "training"    as AppKey },
  { icon: Store,     label: "Matrice Marketplace", shortcut: "4", app: "marketplace" as AppKey },
  { icon: Wrench,    label: "Matrice Support",     shortcut: "5", app: undefined },
  { icon: Shield,    label: "Matrice Internal",    shortcut: "6", app: undefined },
];

// ─── Search Dropdown (Level 3 Glassmorphism) ──────────────────────────────────

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  Personnel: UserRound,
  Vehicles:  Truck,
  Objects:   Package,
};

function SearchDropdown({
  query,
  onSelect,
}: {
  query: string;
  onSelect: (text: string) => void;
}) {
  const isEmpty = query.trim() === "";

  // Filter corpus by query
  const filtered = isEmpty
    ? SEARCH_CORPUS.filter(s => s.type === "example").slice(0, 3)
    : SEARCH_CORPUS.filter(s => s.text.toLowerCase().includes(query.toLowerCase()) && s.type !== "example");

  // Group non-example results
  const groups: Record<string, SearchSuggestion[]> = {};
  if (!isEmpty) {
    filtered.forEach(s => {
      const key = s.type === "tag" ? `tag_${s.category}` : s.type;
      (groups[key] ??= []).push(s);
    });
  }

  const hasResults = isEmpty || filtered.length > 0;

  return (
    <div
      className="absolute left-0 right-0 top-full mt-2 z-[300] rounded-xl overflow-hidden border border-white/8 shadow-2xl"
      style={{
        background: "rgba(15,23,42,0.95)",
        backdropFilter: "blur(16px) saturate(180%)",
        boxShadow: "0 24px 48px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
      }}
    >
      {isEmpty ? (
        <div className="p-3">
          {/* AI prompt header */}
          <div className="flex items-center gap-2 px-2 py-1.5 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-[#00956D]" />
            <span className="text-[11px] font-semibold text-white/60 uppercase tracking-wider" style={INTER}>
              Semantic Video Search
            </span>
            <span className="ml-auto text-[9px] px-1.5 py-0.5 rounded bg-[#00775B]/20 text-[#34D399] font-mono tracking-wider">AI</span>
          </div>

          {/* Example prompts */}
          {SEARCH_CORPUS.filter(s => s.type === "example").slice(0, 3).map(item => (
            <button
              key={item.id}
              onClick={() => onSelect(item.text)}
              className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg hover:bg-white/6 transition-colors text-left group"
            >
              <Search className="w-3.5 h-3.5 text-white/20 group-hover:text-[#00775B] transition-colors shrink-0" />
              <span className="text-[12px] text-white/50 group-hover:text-white/80 transition-colors italic" style={INTER}>
                {item.text}
              </span>
            </button>
          ))}

          {/* Divider + quick tags */}
          <div className="border-t border-white/8 mt-2 pt-2 px-2">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2" style={INTER}>
              Quick Tags
            </div>
            <div className="flex flex-wrap gap-1.5">
              {SEARCH_CORPUS.filter(s => s.type === "tag").slice(0, 6).map(t => {
                const Icon = CATEGORY_ICONS[t.category ?? ""] ?? Tag;
                return (
                  <button
                    key={t.id}
                    onClick={() => onSelect(t.text)}
                    className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/6 border border-white/8 hover:border-[#00775B]/40 hover:bg-[#00775B]/10 transition-colors"
                  >
                    <Icon className="w-2.5 h-2.5 text-white/30" />
                    <span className="text-[11px] text-white/55 hover:text-white/80 transition-colors" style={MONO}>
                      {t.text}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ) : hasResults ? (
        <div className="p-2">
          {/* Searching indicator */}
          <div className="flex items-center gap-2 px-3 py-2 mb-1">
            <Sparkles className="w-3 h-3 text-[#00956D] animate-pulse" />
            <span className="text-[11px] text-white/40 italic" style={INTER}>
              Scanning for <span className="text-white/70 not-italic font-medium">"{query}"</span>
            </span>
          </div>

          {/* Grouped results */}
          {Object.entries(groups).map(([groupKey, items]) => {
            const isPersonnel = groupKey === "tag_Personnel";
            const isVehicles  = groupKey === "tag_Vehicles";
            const isObjects   = groupKey === "tag_Objects";
            const isLocation  = groupKey === "location";
            const isCamera    = groupKey === "camera";

            const label = isPersonnel ? "Personnel" : isVehicles ? "Vehicles" : isObjects ? "Objects" : isLocation ? "Locations" : "Cameras";
            const Icon  = isPersonnel ? UserRound : isVehicles ? Truck : isObjects ? Package : isLocation ? MapPin : Camera;

            return (
              <div key={groupKey} className="mb-1">
                <div className="flex items-center gap-1.5 px-3 py-1">
                  <Icon className="w-3 h-3 text-white/20" />
                  <span className="text-[9px] font-bold uppercase tracking-widest text-white/25" style={INTER}>{label}</span>
                </div>
                {items.slice(0, 4).map(item => (
                  <button
                    key={item.id}
                    onClick={() => onSelect(item.text)}
                    className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-white/6 transition-colors text-left group"
                  >
                    <span className="text-[12px] text-white/65 group-hover:text-white/90 transition-colors" style={INTER}>
                      {/* Highlight matching chars */}
                      {item.text}
                    </span>
                    <span className="ml-auto text-[9px] text-white/20 group-hover:text-white/40 font-mono">↩</span>
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-4 py-6 text-center">
          <Search className="w-6 h-6 text-white/15 mx-auto mb-2" />
          <p className="text-[12px] text-white/35 italic" style={INTER}>No suggestions for "{query}"</p>
          <p className="text-[11px] text-white/20 mt-1" style={INTER}>Press Enter to search anyway</p>
        </div>
      )}
    </div>
  );
}

// ─── Camera / Search-result grid cell ────────────────────────────────────────

function CameraGridCell({
  feed,
  searchActive,
  searchResult,
  isHovered,
  onHover,
  onLeave,
  onResultClick,
}: {
  feed: CameraFeed;
  searchActive: boolean;
  searchResult?: SearchResult;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  onResultClick?: (r: SearchResult) => void;
}) {
  // Animated bounding-box tracking position (search hover physics)
  const [boxPos, setBoxPos] = useState({ x: 0, y: 0 });
  const animRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const frameRef = useRef(0);

  useEffect(() => {
    if (isHovered && searchActive) {
      animRef.current = setInterval(() => {
        frameRef.current += 0.18;
        setBoxPos({
          x: Math.sin(frameRef.current) * 7,
          y: Math.cos(frameRef.current * 0.65) * 4,
        });
      }, 80);
    } else {
      if (animRef.current) clearInterval(animRef.current);
      setBoxPos({ x: 0, y: 0 });
    }
    return () => { if (animRef.current) clearInterval(animRef.current); };
  }, [isHovered, searchActive]);

  const img = searchActive && searchResult ? searchResult.image : FEED_IMAGES[feed.id] ?? "";

  const handleClick = () => {
    if (searchActive && searchResult && onResultClick) onResultClick(searchResult);
  };

  return (
    <div
      className={cn(
        "relative bg-[#0a1628] overflow-hidden rounded-sm group cursor-pointer border transition-all duration-150",
        feed.alertLevel === "critical" && !searchActive ? "border-red-500/60" :
        feed.alertLevel === "high"     && !searchActive ? "border-orange-500/40" :
        isHovered && searchActive ? "border-[#00e676]/50 ring-1 ring-[#00e676]/20 shadow-lg shadow-[#00e676]/10" :
        isHovered ? "border-[#00775B]/60 ring-1 ring-[#00775B]/30" :
        "border-white/5",
      )}
      style={{ aspectRatio: "16/9" }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      onClick={handleClick}
    >
      {/* Feed image */}
      {feed.status === "signal-lost" && !searchActive ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050d1a]">
          <Video className="w-8 h-8 text-red-400/60" />
          <span className="text-red-400 text-xs font-bold" style={MONO}>SIGNAL LOST</span>
        </div>
      ) : img ? (
        <img
          src={img}
          alt={searchActive && searchResult ? searchResult.cameraName : feed.name}
          className={cn("absolute inset-0 w-full h-full object-cover transition-all duration-300",
            isHovered && searchActive && "brightness-75 scale-[1.02]"
          )}
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] to-[#020b18]" />
      )}

      {/* ── LIVE FEED overlays (non-search mode) ─────────────────────────── */}
      {!searchActive && (
        <>
          {/* Intrusion detection overlay */}
          {feed.alertLevel === "high" && feed.alertLabel === "INTRUSION DETECTED" && (
            <div className="absolute inset-0 bg-orange-900/30 flex flex-col items-center justify-center gap-2">
              <div className="flex items-center gap-2 bg-orange-600/90 px-3 py-1.5 rounded">
                <AlertTriangle className="w-4 h-4 text-white" />
                <span className="text-white text-xs font-bold" style={MONO}>INTRUSION DETECTED</span>
              </div>
            </div>
          )}

          {/* Top: alert badges */}
          <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-1.5">
            {feed.alertLevel === "critical" && (
              <span className="text-[10px] font-bold text-red-300 bg-red-900/80 px-1.5 py-0.5 rounded animate-pulse" style={MONO}>CRITICAL</span>
            )}
            {feed.alertLevel === "high" && feed.alertLabel !== "INTRUSION DETECTED" && (
              <span className="text-[10px] font-bold text-orange-300 bg-orange-900/70 px-1.5 py-0.5 rounded" style={MONO}>HIGH</span>
            )}
          </div>

          {/* Hover tooltip for live feed */}
          {isHovered && (
            <div
              className="absolute left-2 bottom-10 z-30 w-52 rounded-lg border border-white/10 p-3 text-xs"
              style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(16px) saturate(180%)" }}
            >
              <div className="font-semibold text-white text-[11px] mb-2" style={INTER}>{feed.name}</div>
              <div className="flex items-center gap-1.5 text-white/50 mb-1">
                <MapPin className="w-3 h-3" />
                <span style={MONO} className="text-[10px]">{feed.location}</span>
              </div>
              <div className="flex items-center gap-1.5 text-white/50 mb-2">
                <Activity className="w-3 h-3" />
                <span style={MONO} className="text-[10px]">{feed.fps > 0 ? `${feed.fps} fps · Active` : "0 fps · Idle"}</span>
              </div>
              {feed.applications.length > 0 && (
                <div>
                  <div className="text-white/30 text-[9px] uppercase tracking-wider mb-1">Applications</div>
                  <div className="flex flex-wrap gap-1">
                    {feed.applications.map(app => (
                      <span key={app} className="text-[9px] px-1.5 py-0.5 rounded bg-[#00775B]/20 text-[#34D399] font-medium">{app}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* ── SEARCH RESULT overlays ────────────────────────────────────────── */}
      {searchActive && searchResult && (
        <>
          {/* Scan-line overlay — always visible */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.013) 3px,rgba(255,255,255,0.013) 4px)" }}
          />

          {/* AI tracking bounding box — always visible on every search result */}
          <div
            className="absolute pointer-events-none"
            style={{
              top:    `calc(22% + ${boxPos.y}px)`,
              left:   `calc(28% + ${boxPos.x}px)`,
              width:  "44%",
              height: "56%",
              border: isHovered
                ? "1.5px solid #00e676"
                : "1.5px solid rgba(0,230,118,0.5)",
              boxShadow: isHovered
                ? "0 0 10px rgba(0,230,118,0.35), inset 0 0 8px rgba(0,230,118,0.08)"
                : "0 0 5px rgba(0,230,118,0.12)",
              transition: "top 80ms linear, left 80ms linear, border 150ms, box-shadow 150ms",
            }}
          >
            {/* Corner markers */}
            {[
              { top: -2, left: -2,   right: "auto", bottom: "auto" },
              { top: -2, right: -2,  left: "auto",  bottom: "auto" },
              { bottom: -2, left: -2, top: "auto",  right: "auto"  },
              { bottom: -2, right: -2, top: "auto", left: "auto"   },
            ].map((pos, i) => (
              <div
                key={i}
                className="absolute w-2.5 h-2.5 border-[#00e676]"
                style={{
                  ...pos,
                  opacity: isHovered ? 1 : 0.5,
                  borderTop:    i < 2  ? "2.5px solid" : "none",
                  borderBottom: i >= 2 ? "2.5px solid" : "none",
                  borderLeft:   i % 2 === 0 ? "2.5px solid" : "none",
                  borderRight:  i % 2 === 1 ? "2.5px solid" : "none",
                }}
              />
            ))}

            {/* Confidence + match label — always visible */}
            <div
              className="absolute -top-6 left-0 flex items-center gap-1 px-1.5 py-0.5 rounded-sm"
              style={{ background: isHovered ? "rgba(0,230,118,0.92)" : "rgba(0,230,118,0.72)" }}
            >
              <span className="text-[9px] font-bold text-black" style={MONO}>{searchResult.confidence}%</span>
              <span className="text-[9px] text-black/70" style={INTER}>match</span>
            </div>
          </div>

          {/* Hover-only overlays */}
          {isHovered && (
            <>
              {/* Dark vignette */}
              <div className="absolute inset-0 bg-black/20 pointer-events-none" />

              {/* PLAYING badge top-right */}
              <div className="absolute top-2 right-2 flex items-center gap-1.5 px-2 py-1 rounded bg-black/70 border border-white/10">
                <span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" />
                <span className="text-[9px] font-bold text-white/80" style={MONO}>PLAYING</span>
              </div>

              {/* Click hint */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(4px)" }}
                >
                  <Play className="w-3 h-3 text-white" />
                  <span className="text-[11px] text-white font-medium" style={INTER}>Open Inspector</span>
                </div>
              </div>
            </>
          )}

          {/* Source badge (always visible) */}
          <div className="absolute top-2 left-2">
            <span className={cn(
              "text-[9px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider",
              searchResult.source === "live" ? "bg-red-600/90 text-white" : "bg-[#0a1628]/90 text-white/60 border border-white/10"
            )} style={MONO}>
              {searchResult.source === "live" ? "● LIVE" : "▶ ARCHIVE"}
            </span>
          </div>
        </>
      )}

      {/* Bottom bar — camera name + status / timestamps */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-1.5 bg-gradient-to-t from-black/75 to-transparent">
        <span className="text-[11px] font-medium text-white/85 truncate max-w-[60%]" style={MONO}>
          {searchActive && searchResult ? searchResult.cameraName : feed.name}
        </span>
        <div className="flex items-center gap-1.5">
          {searchActive && searchResult ? (
            <span className="text-[10px] text-white/50" style={MONO}>
              {searchResult.timestamp.split("T")[1].slice(0, 8)}
            </span>
          ) : (
            <>
              {feed.status === "live" && (
                <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400" style={MONO}>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />LIVE
                </span>
              )}
              {feed.status === "offline" && (
                <span className="text-[10px] text-white/30" style={MONO}>OFFLINE</span>
              )}
              <span className="text-[10px] text-white/35" style={MONO}>00:00:00</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Inspection Modal ─────────────────────────────────────────────────────────

function generateFrames(result: SearchResult) {
  const [datePart, timePart] = result.timestamp.split("T");
  const [hh, mm, ss] = timePart.split(":");
  const baseSec = parseInt(ss);
  return Array.from({ length: 8 }, (_, i) => {
    const ms = i * 130;
    const sec = baseSec + Math.floor(ms / 1000);
    const msVal = ms % 1000;
    return {
      id:     `f${i + 1}`,
      label:  `${hh}:${mm}:${String(sec).padStart(2, "0")}.${String(msVal).padStart(3, "0").slice(0, 2)}`,
      image:  result.image,
      frame:  i + 1,
    };
  });
}

function InspectionModal({ result, onClose }: { result: SearchResult; onClose: () => void }) {
  const [isPlaying, setIsPlaying]       = useState(true);
  const [progress, setProgress]         = useState(0);   // 0–100
  const [currentFrame, setCurrentFrame] = useState(0);
  const [boxPos, setBoxPos]             = useState({ x: 0, y: 0 });
  const frameRef                        = useRef(0);

  const frames = generateFrames(result);

  // Playback progress
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => setProgress(p => p >= 100 ? 0 : p + 0.4), 100);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Tracking box animation
  useEffect(() => {
    if (!isPlaying) return;
    const id = setInterval(() => {
      frameRef.current += 0.12;
      setBoxPos({ x: Math.sin(frameRef.current) * 9, y: Math.cos(frameRef.current * 0.6) * 5 });
    }, 80);
    return () => clearInterval(id);
  }, [isPlaying]);

  // Close on Escape
  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const [totalSec] = useState(() => {
    const [mm, ss] = result.duration.split(":").slice(1);
    return parseInt(mm) * 60 + parseInt(ss);
  });
  const elapsedSec = Math.floor((progress / 100) * totalSec);
  const fmtTime = (s: number) => `00:${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

  return (
    <div className="fixed inset-0 z-[500] flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

      <div
        className="relative w-full max-w-5xl rounded-xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        style={{ background: "rgba(8,16,30,0.98)", border: "1px solid rgba(255,255,255,0.08)", maxHeight: "90vh" }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-b border-white/8 shrink-0">
          <Sparkles className="w-4 h-4 text-[#00956D]" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-white" style={INTER}>{result.cameraName}</span>
              <span className="text-white/25 text-[12px]">·</span>
              <span className="text-[12px] text-white/50" style={INTER}>{result.location}</span>
              <span
                className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded uppercase ml-1",
                  result.source === "live" ? "bg-red-600/80 text-white" : "bg-white/8 text-white/50 border border-white/10"
                )}
                style={MONO}
              >
                {result.source === "live" ? "● LIVE" : "▶ ARCHIVE"}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[11px] text-white/30" style={MONO}>{result.cameraId.toUpperCase()}</span>
              <span className="text-white/15 text-[11px]">·</span>
              <span className="text-[11px] text-white/30" style={MONO}>{result.timestamp.replace("T", " ")}</span>
            </div>
          </div>
          <div className={cn(
            "flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold",
            result.confidence >= 90 ? "border-emerald-500/40 text-emerald-400 bg-emerald-900/20"
            : result.confidence >= 75 ? "border-amber-500/40 text-amber-400 bg-amber-900/20"
            : "border-red-500/40 text-red-400 bg-red-900/20"
          )} style={MONO}>
            {result.confidence}% match
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-white/8 text-white/40 hover:text-white transition-colors ml-2">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* ── Video player (60%) ───────────────────────────────────────── */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Video canvas */}
            <div className="relative flex-1 min-h-0 bg-[#020a14]" style={{ aspectRatio: "16/9" }}>
              {/* Background image */}
              <img src={result.image} alt={result.cameraName} className="absolute inset-0 w-full h-full object-cover brightness-75" />

              {/* Scan-line overlay */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ background: "repeating-linear-gradient(0deg,transparent,transparent 3px,rgba(255,255,255,0.01) 3px,rgba(255,255,255,0.01) 4px)" }}
              />

              {/* Tracking bounding box */}
              <div
                className="absolute pointer-events-none"
                style={{
                  top:    `calc(18% + ${boxPos.y}px)`,
                  left:   `calc(25% + ${boxPos.x}px)`,
                  width:  "50%",
                  height: "62%",
                  border: "2px solid #00e676",
                  boxShadow: "0 0 14px rgba(0,230,118,0.4), inset 0 0 10px rgba(0,230,118,0.07)",
                  transition: "top 80ms linear, left 80ms linear",
                }}
              >
                {/* Corner markers */}
                {[
                  { top: -3, left: -3,   borderTop: "3px solid", borderLeft: "3px solid",   borderRight: "none", borderBottom: "none" },
                  { top: -3, right: -3,  borderTop: "3px solid", borderRight: "3px solid",  borderLeft: "none",  borderBottom: "none" },
                  { bottom: -3, left: -3, borderBottom: "3px solid", borderLeft: "3px solid", borderTop: "none",  borderRight: "none" },
                  { bottom: -3, right: -3, borderBottom: "3px solid", borderRight: "3px solid", borderTop: "none", borderLeft: "none" },
                ].map((s, i) => (
                  <div key={i} className="absolute w-3 h-3 border-[#00e676]" style={s} />
                ))}

                {/* Confidence label */}
                <div
                  className="absolute -top-7 left-0 flex items-center gap-1.5 px-2 py-0.5 rounded-sm"
                  style={{ background: "rgba(0,230,118,0.92)" }}
                >
                  <span className="text-[10px] font-bold text-black" style={MONO}>{result.confidence}%</span>
                  <span className="text-[9px] text-black/70" style={INTER}>{result.matchType}</span>
                </div>
              </div>

              {/* Top-left: REC indicator */}
              <div className="absolute top-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-white/10">
                {isPlaying
                  ? <><span className="w-1.5 h-1.5 rounded-full bg-[#00e676] animate-pulse" /><span className="text-[9px] text-[#00e676] font-bold" style={MONO}>PLAYING</span></>
                  : <><span className="w-1.5 h-1.5 rounded-full bg-white/30" /><span className="text-[9px] text-white/40 font-bold" style={MONO}>PAUSED</span></>
                }
              </div>

              {/* Match type label */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm px-2 py-1 rounded border border-[#00e676]/30">
                <span className="text-[10px] text-[#00e676] font-medium" style={INTER}>{result.matchType}</span>
              </div>
            </div>

            {/* Video controls */}
            <div className="shrink-0 px-4 py-3 border-t border-white/8 bg-[#050d1a]">
              {/* Timeline */}
              <div className="relative h-1.5 bg-white/8 rounded-full mb-3 cursor-pointer group" onClick={e => {
                const rect = e.currentTarget.getBoundingClientRect();
                setProgress(((e.clientX - rect.left) / rect.width) * 100);
              }}>
                <div className="h-full bg-[#00775B] rounded-full transition-all" style={{ width: `${progress}%` }} />
                <div
                  className="absolute top-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-white shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ left: `calc(${progress}% - 6px)` }}
                />
              </div>

              {/* Controls row */}
              <div className="flex items-center gap-3">
                <button className="text-white/40 hover:text-white transition-colors" onClick={() => setProgress(p => Math.max(0, p - 8))}>
                  <SkipBack className="w-4 h-4" />
                </button>
                <button
                  className="w-8 h-8 rounded-full bg-[#00775B] hover:bg-[#006649] flex items-center justify-center text-white transition-colors"
                  onClick={() => setIsPlaying(p => !p)}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                </button>
                <button className="text-white/40 hover:text-white transition-colors" onClick={() => setProgress(p => Math.min(100, p + 8))}>
                  <SkipForward className="w-4 h-4" />
                </button>

                <span className="text-[11px] text-white/40 ml-1" style={MONO}>
                  {fmtTime(elapsedSec)} / {result.duration}
                </span>

                <div className="flex-1" />

                <button className="text-white/40 hover:text-white transition-colors"><Volume2 className="w-4 h-4" /></button>
                <button className="text-white/40 hover:text-white transition-colors"><Maximize2 className="w-4 h-4" /></button>
              </div>
            </div>
          </div>

          {/* ── Frame carousel (40%) ─────────────────────────────────────── */}
          <div className="w-72 shrink-0 flex flex-col border-l border-white/8 overflow-hidden">
            {/* Section header */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/8 shrink-0 bg-[#050d1a]">
              <Film className="w-3.5 h-3.5 text-white/40" />
              <span className="text-[12px] font-semibold text-white/70" style={INTER}>Isolated Frames</span>
              <span className="ml-auto text-[11px] text-white/30" style={MONO}>{frames.length} extracted</span>
            </div>

            {/* Frame grid */}
            <div className="flex-1 overflow-y-auto p-3 [&::-webkit-scrollbar]:w-0">
              <div className="grid grid-cols-2 gap-2 mb-3">
                {frames.map((f, i) => (
                  <button
                    key={f.id}
                    onClick={() => setCurrentFrame(i)}
                    className={cn(
                      "relative rounded overflow-hidden border-2 transition-all",
                      currentFrame === i ? "border-[#00e676] shadow-md shadow-[#00e676]/20" : "border-white/8 hover:border-white/25"
                    )}
                    style={{ aspectRatio: "16/9" }}
                  >
                    <img src={f.image} alt={`Frame ${f.frame}`} className="w-full h-full object-cover brightness-75" loading="lazy" />
                    {/* Frame number */}
                    <span
                      className="absolute top-1 left-1 text-[8px] bg-black/70 text-white/70 px-1 rounded"
                      style={MONO}
                    >
                      F{f.frame}
                    </span>
                    {/* Selected checkmark */}
                    {currentFrame === i && (
                      <div className="absolute inset-0 bg-[#00e676]/10 flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 text-[#00e676]" />
                      </div>
                    )}
                  </button>
                ))}
              </div>

              {/* Selected frame detail */}
              <div className="rounded-lg border border-white/10 bg-white/3 p-2.5">
                <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-2" style={INTER}>Selected Frame</div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] text-white/50" style={MONO}>Frame #{frames[currentFrame].frame}</span>
                  <span className="text-[11px] text-[#34D399]" style={MONO}>{result.confidence}%</span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-white/20" />
                  <span className="text-[11px] text-white/40" style={MONO}>{frames[currentFrame].label}</span>
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <Camera className="w-3 h-3 text-white/20" />
                  <span className="text-[11px] text-white/40 truncate" style={MONO}>{result.cameraId.toUpperCase()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action toolbelt */}
        <div className="flex items-center gap-3 px-5 py-3.5 border-t border-white/8 bg-[#050d1a] shrink-0">
          {/* Left metadata */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <span className="text-[11px] text-white/30" style={MONO}>
              {result.cameraId.toUpperCase()}
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[11px] text-white/30" style={MONO}>
              Duration: {result.duration}
            </span>
            <span className="text-white/10">·</span>
            <span className="text-[11px] text-white/30" style={MONO}>
              {frames.length} frames extracted
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[12px] font-medium text-white/70 hover:text-white transition-all" style={INTER}>
              <Download className="w-3.5 h-3.5" />
              Download Snippet
            </button>
            <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-white/12 bg-white/5 hover:bg-white/10 hover:border-white/20 text-[12px] font-medium text-white/70 hover:text-white transition-all" style={INTER}>
              <Film className="w-3.5 h-3.5" />
              Export Frames
            </button>
            <button className="flex items-center gap-2 h-8 px-3.5 rounded-lg border border-[#00775B]/40 bg-[#00775B]/10 hover:bg-[#00775B]/20 text-[12px] font-medium text-[#34D399] hover:text-white transition-all" style={INTER}>
              <Share2 className="w-3.5 h-3.5" />
              Share Media Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main VMS Platform ────────────────────────────────────────────────────────

export function VMSPlatform({ onPlatformSwitch }: VMSProps) {
  const [searchQuery,        setSearchQuery]        = useState("");
  const [searchActive,       setSearchActive]       = useState(false);
  const [paletteOpen,        setPaletteOpen]        = useState(false);
  /** Query string pre-filled into the palette when re-opened from results context */
  const [paletteInitialQuery, setPaletteInitialQuery] = useState("");
  const [hoveredFeed, setHoveredFeed]   = useState<string | null>(null);
  const [selectedCams, setSelectedCams]   = useState<Set<string>>(new Set());
  const [platformOpen, setPlatformOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [gridCols, setGridCols]           = useState<2 | 3 | 4>(4);
  // ── View-state snapshot: restored when user exits search ─────────────────
  const [viewSnapshot, setViewSnapshot] = useState<{
    gridCols: 2 | 3 | 4;
    sidebarOpen: boolean;
    selectedCams: Set<string>;
  } | null>(null);
  const [clockTime, setClockTime]         = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [flashAlert, setFlashAlert]       = useState(true);
  const [selectedResult, setSelectedResult] = useState<SearchResult | null>(null);

  const platformBtnRef   = useRef<HTMLButtonElement>(null);
  const platformPanelRef = useRef<HTMLDivElement>(null);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000);
    return () => clearInterval(id);
  }, []);

  // Flash pulse
  useEffect(() => {
    const id = setInterval(() => setFlashAlert(f => !f), 800);
    return () => clearInterval(id);
  }, []);

  // Close platform panel outside click
  useEffect(() => {
    if (!platformOpen) return;
    const h = (e: MouseEvent) => {
      if (!platformBtnRef.current?.contains(e.target as Node) && !platformPanelRef.current?.contains(e.target as Node))
        setPlatformOpen(false);
    };
    document.addEventListener("mousedown", h);
    return () => document.removeEventListener("mousedown", h);
  }, [platformOpen]);

  // Restore snapshot + wipe search state
  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchActive(false);
    if (viewSnapshot) {
      setGridCols(viewSnapshot.gridCols);
      setSidebarOpen(viewSnapshot.sidebarOpen);
      setSelectedCams(new Set(viewSnapshot.selectedCams));
      setViewSnapshot(null);
    }
  }, [viewSnapshot]);

  // Cache current view before entering search results
  const handlePaletteSearch = useCallback((query: string) => {
    setViewSnapshot({ gridCols, sidebarOpen, selectedCams: new Set(selectedCams) });
    setSearchQuery(query);
    setSearchActive(true);
  }, [gridCols, sidebarOpen, selectedCams]);

  // Global Cmd+K / Ctrl+K → open command palette.
  // While search results are visible, pre-fills the current query so the
  // operator can edit without re-typing.
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        if (paletteOpen) {
          setPaletteOpen(false);
        } else {
          setPaletteInitialQuery(searchActive ? searchQuery : "");
          setPaletteOpen(true);
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  // searchQuery / searchActive are intentionally in deps so the handler always
  // closes over their latest values.
  }, [paletteOpen, searchActive, searchQuery]);

  // Escape while search results are visible → restore snapshot
  useEffect(() => {
    if (!searchActive) return;
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !paletteOpen) clearSearch();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [searchActive, paletteOpen, clearSearch]);

  const toggleCamera = (id: string) => {
    setSelectedCams(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const displayFeeds = searchActive ? GRID_FEEDS.slice(0, SEARCH_RESULTS.length) : GRID_FEEDS;

  return (
    <div className="flex h-screen w-full bg-[#08101e] text-white overflow-hidden" style={INTER}>

      {/* ── Left: Camera Directory ─────────────────────────────────────────── */}
      {sidebarOpen && (
        <aside className="flex flex-col w-[230px] shrink-0 bg-[#021d18] border-r border-[#00775B]/15 h-full overflow-hidden">

          {/* Logo / platform switcher */}
          <div className="relative px-3 py-2.5 border-b border-[#00775B]/10">
            <button
              ref={platformBtnRef}
              className={cn("flex items-center gap-2.5 w-full rounded-lg px-2 py-1.5 transition-colors", platformOpen ? "bg-white/8" : "hover:bg-white/5")}
              onClick={() => setPlatformOpen(o => !o)}
            >
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#001410] border border-[#00775B]/30 p-1 shrink-0">
                <MatriceIcon />
              </div>
              <div className="flex-1 text-left min-w-0">
                <div className="text-sm font-semibold text-white truncate" style={INTER}>Matrice AI</div>
                <div className="text-[10px] text-white/40 truncate" style={MONO}>VMS Platform</div>
              </div>
              <ChevronsUpDown className="w-3.5 h-3.5 text-white/30 shrink-0" />
            </button>

            {platformOpen && (
              <div
                ref={platformPanelRef}
                className="absolute left-3 top-full mt-1 z-[200] w-52 rounded-lg border border-border bg-popover shadow-xl py-1 animate-in fade-in zoom-in-95 duration-100"
              >
                <p className="px-2 py-1.5 text-xs text-muted-foreground font-medium">Platforms</p>
                {platforms.map(p => (
                  <button
                    key={p.shortcut}
                    className="flex w-full items-center gap-2 px-2 py-2 text-sm hover:bg-accent hover:text-accent-foreground cursor-pointer rounded-sm transition-colors"
                    onClick={() => { setPlatformOpen(false); if (p.app) onPlatformSwitch?.(p.app); }}
                  >
                    <div className="flex w-6 h-6 items-center justify-center rounded-sm border bg-background">
                      <p.icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-left">{p.label}</span>
                    {p.active && <Check className="w-4 h-4 text-primary" />}
                    <kbd className="inline-flex h-5 items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                      <span className="text-xs">⌘</span>{p.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Directory header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#00775B]/10">
            <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase" style={INTER}>Camera Directory</span>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-red-400/80 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 transition-colors" style={MONO}>
                <X className="w-2.5 h-2.5" /> Clear
              </button>
              <button className="p-1 rounded hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-white/8 text-white/40 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter chips */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-[#00775B]/10">
            {["1 applicati...", "Locations", "Status"].map(f => (
              <button key={f} className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 transition-colors truncate max-w-[72px]">
                <span className="text-[10px] text-white/60 truncate" style={MONO}>{f}</span>
                <ChevronDown className="w-2.5 h-2.5 shrink-0 text-white/30" />
              </button>
            ))}
          </div>

          {/* Application filter checkboxes */}
          <div className="px-2 py-2 border-b border-[#00775B]/10">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1.5 px-1" style={INTER}>Applications</div>
            <div className="flex flex-col gap-0.5">
              {["Fire Detection", "Intrusion Detection", "PPE Detection"].map((app, i) => (
                <label key={app} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/5 cursor-pointer group">
                  <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0", i === 0 ? "bg-[#00775B] border-[#00775B]" : "border-white/20 group-hover:border-white/40")}>
                    {i === 0 && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-[11px] text-white/60 group-hover:text-white/80 transition-colors" style={INTER}>{app}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Camera list */}
          <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0 py-1">
            {CAMERA_DATA.map(cam => (
              <div
                key={cam.id}
                className={cn(
                  "flex items-center gap-2 px-2.5 py-1.5 cursor-pointer transition-colors group",
                  selectedCams.has(cam.id) ? "bg-[#00775B]/15" : "hover:bg-white/5"
                )}
              >
                <div
                  className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0", selectedCams.has(cam.id) ? "bg-[#00775B] border-[#00775B]" : "border-white/20")}
                  onClick={() => toggleCamera(cam.id)}
                >
                  {selectedCams.has(cam.id) && <Check className="w-2.5 h-2.5 text-white" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                      cam.status === "live" && cam.fps > 0 ? "bg-emerald-400" :
                      cam.status === "offline" ? "bg-neutral-500" : "bg-red-400"
                    )} />
                    <span className="text-[11px] text-white/75 font-medium truncate" style={INTER}>{cam.name}</span>
                    {cam.alertLevel && (
                      <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded uppercase",
                        cam.alertLevel === "critical" ? "bg-red-600/30 text-red-300" : "bg-orange-500/20 text-orange-300"
                      )} style={MONO}>{cam.alertLevel}</span>
                    )}
                  </div>
                  <div className="text-[9px] text-white/25 truncate mt-0.5" style={MONO}>{cam.id} · {cam.building} · {cam.fps} fps</div>
                </div>
                <Star className={cn("w-3 h-3 shrink-0 transition-colors",
                  cam.starred ? "text-amber-400 fill-amber-400" : "text-white/15 group-hover:text-white/30"
                )} />
              </div>
            ))}
          </div>

          <div className="px-3 py-2 border-t border-[#00775B]/10">
            <span className="text-[10px] text-white/25" style={MONO}>Viewing 1–73 of 119</span>
          </div>
        </aside>
      )}

      {/* ── Main workspace ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <header className="flex h-12 shrink-0 items-center gap-2 bg-[#021d18] border-b border-[#00775B]/15 px-3">
          {!sidebarOpen && (
            <button className="p-1.5 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="w-4 h-4" />
            </button>
          )}

          {/* ── Breadcrumbs ──────────────────────────────────────────────── */}
          <div className="flex items-center gap-0.5 shrink-0">
            <span className="text-[11px] text-white/35 hover:text-white/60 cursor-pointer transition-colors px-1" style={INTER}>
              Projects
            </span>
            <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
            <button className="flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-white/5 transition-colors text-[11px] text-white/55 hover:text-white/85" style={INTER}>
              Project: pratik_ws_pr...
              <ChevronDown className="w-3 h-3 text-white/25 ml-0.5 shrink-0" />
            </button>
            <ChevronRight className="w-3 h-3 text-white/20 shrink-0" />
            <button className="flex items-center gap-0.5 px-1 py-0.5 rounded hover:bg-white/5 transition-colors text-[11px] text-white/75 font-medium hover:text-white" style={INTER}>
              Pipeline: pipeline 1
              <ChevronDown className="w-3 h-3 text-white/30 ml-0.5 shrink-0" />
            </button>
            <button className="ml-1.5 w-5 h-5 rounded bg-[#00775B] flex items-center justify-center hover:bg-[#006649] transition-colors shrink-0">
              <Play className="w-2.5 h-2.5 text-white fill-white" />
            </button>
          </div>

          <div className="h-4 w-px bg-white/10 mx-1 shrink-0" />

          {/* ── Right utility: Vision Search anchor ──────────────────────── */}
          <div className="flex-1 flex items-center justify-end">
            <button
              onClick={() => { setPaletteInitialQuery(""); setPaletteOpen(true); }}
              className="flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/8 hover:border-white/18 text-white/50 hover:text-white transition-all shrink-0"
              style={INTER}
            >
              <Search className="w-3.5 h-3.5" />
              <span className="text-[12px] hidden sm:block">Vision Search</span>
              <div className="hidden sm:flex items-center gap-0.5 ml-1">
                <kbd className="text-[9px] px-1 py-0.5 rounded border border-white/15 bg-white/8" style={MONO}>⌘</kbd>
                <kbd className="text-[9px] px-1 py-0.5 rounded border border-white/15 bg-white/8" style={MONO}>K</kbd>
              </div>
            </button>
          </div>
        </header>

        {/* ══════════════════════════════════════════════════════════════════
            SEARCH RESULTS WORKSPACE — shown only when searchActive
        ══════════════════════════════════════════════════════════════════ */}
        {searchActive && (
          <>
            {/* ── Row 1: Context header ─────────────────────────────────── */}
            <div className="flex items-center gap-3 px-3 py-2 shrink-0 border-b border-white/6 animate-in fade-in duration-150"
              style={{ background: "#030c1a" }}>

              {/* Single exit action — no redundant "Clear Results" anywhere */}
              <button
                onClick={clearSearch}
                className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-white/14 bg-white/5 hover:bg-white/10 hover:border-white/22 text-white/80 hover:text-white transition-all shrink-0"
                style={INTER}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                <span className="text-[11px] font-medium">Exit Search</span>
              </button>

              <div className="h-3.5 w-px bg-white/10 shrink-0" />

              {/* Results summary with click-to-edit query chip */}
              <div className="flex items-center gap-1.5 min-w-0">
                <Sparkles className="w-3 h-3 text-[#00956D] shrink-0 animate-pulse" />
                <span className="text-[12px] text-white/55 shrink-0" style={MONO}>
                  {SEARCH_RESULTS.length} clips matching
                </span>

                {/* ── Interactive query chip: click or ⌘K to edit in-place ── */}
                <button
                  title="Click to edit query (⌘K)"
                  onClick={() => { setPaletteInitialQuery(searchQuery); setPaletteOpen(true); }}
                  className="group flex items-center gap-1 px-2 py-0.5 rounded border transition-all shrink-0"
                  style={{
                    borderColor: "rgba(0,119,91,0.35)",
                    background:  "rgba(0,119,91,0.10)",
                  }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,149,109,0.65)";
                    (e.currentTarget as HTMLElement).style.background  = "rgba(0,119,91,0.20)";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.borderColor = "rgba(0,119,91,0.35)";
                    (e.currentTarget as HTMLElement).style.background  = "rgba(0,119,91,0.10)";
                  }}
                >
                  <span
                    className="text-[12px] italic max-w-[260px] truncate"
                    style={{ ...MONO, color: "rgba(255,255,255,0.88)" }}
                  >
                    "{searchQuery}"
                  </span>
                  {/* pencil hint — only visible on hover */}
                  <svg
                    className="w-2.5 h-2.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ color: "#34D399" }}
                    viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6"
                  >
                    <path d="M11.5 2.5l2 2-8 8H3.5v-2l8-8z" strokeLinejoin="round" />
                    <path d="M9.5 4.5l2 2" />
                  </svg>
                </button>

                <span className="text-[12px] text-white/35 shrink-0" style={MONO}>
                  · Live + Archive
                </span>
              </div>

              <div className="flex-1" />
              <span className="text-[10px] text-white/22 shrink-0 hidden lg:block" style={MONO}>
                ⌘K to edit · ESC to exit
              </span>
            </div>

            {/* ── Row 2: Grid toolbelt ──────────────────────────────────── */}
            <div className="flex items-center gap-2 px-3 py-1.5 shrink-0 border-b border-white/5"
              style={{ background: "#060f1e" }}>
              {/* Layout toggles */}
              <div className="flex items-center rounded-md overflow-hidden border border-white/10">
                {[
                  { icon: Grid2X2,    cols: 2, title: "2×2" },
                  { icon: LayoutGrid, cols: 3, title: "3×3" },
                  { icon: Grid3X3,    cols: 4, title: "4×4" },
                ].map(({ icon: Icon, cols, title }) => (
                  <button
                    key={title}
                    title={title}
                    onClick={() => setGridCols(cols as 2 | 3 | 4)}
                    className={cn("flex items-center justify-center w-7 h-7 text-[11px] transition-colors",
                      gridCols === cols ? "bg-[#00775B] text-white" : "bg-white/3 text-white/45 hover:bg-white/8 hover:text-white"
                    )}
                    style={MONO}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </button>
                ))}
              </div>

              {/* Sort */}
              <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-white/10 bg-white/4 hover:bg-white/8 text-[11px] text-white/55 hover:text-white transition-colors" style={INTER}>
                <SlidersHorizontal className="w-3 h-3" /> Sort: Recent
              </button>

              <div className="flex-1" />

              {/* Bulk export */}
              <button className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-white/12 bg-white/5 hover:bg-white/10 text-[11px] font-medium text-white/65 hover:text-white transition-all" style={INTER}>
                <Download className="w-3 h-3" /> Bulk Export
              </button>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            LIVE VIEW TOOLBAR — shown only when !searchActive
        ══════════════════════════════════════════════════════════════════ */}
        {!searchActive && (
          <div className="flex items-center gap-2 px-3 py-2 bg-[#0a1628] border-b border-white/5 shrink-0">
            <div className="flex items-center rounded-md overflow-hidden border border-white/10">
              {[
                { icon: List,       cols: undefined, title: "List" },
                { icon: Grid2X2,    cols: 2,         title: "2×2"  },
                { icon: LayoutGrid, cols: 3,         title: "3×3"  },
                { icon: Grid3X3,    cols: 4,         title: "4×4"  },
              ].map(({ icon: Icon, cols, title }) => (
                <button
                  key={title}
                  title={title}
                  onClick={() => cols && setGridCols(cols as 2 | 3 | 4)}
                  className={cn("flex items-center justify-center w-7 h-7 transition-colors",
                    gridCols === cols ? "bg-[#00775B] text-white" : "bg-white/3 text-white/40 hover:bg-white/8 hover:text-white"
                  )}
                >
                  <Icon className="w-3.5 h-3.5" />
                </button>
              ))}
            </div>

            <button className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-[#00775B]/40 bg-[#00775B]/10 text-[11px] font-medium text-[#34D399] hover:bg-[#00775B]/20 transition-colors" style={INTER}>
              <Eye className="w-3.5 h-3.5" /> Smart View
            </button>

            <div className="flex-1" />

            <button className={cn(
              "flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-bold transition-all",
              flashAlert ? "bg-red-600 text-white shadow-lg shadow-red-900/50" : "bg-red-700/80 text-white"
            )} style={MONO}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {LIVE_ALERTS_COUNT.critical} CRITICAL
            </button>

            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md text-[11px] font-bold bg-orange-600/80 text-white" style={MONO}>
              <AlertCircle className="w-3.5 h-3.5" />
              {LIVE_ALERTS_COUNT.high} HIGH
            </button>

            <div className="h-4 w-px bg-white/10" />

            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md border border-white/15 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors" style={INTER}>
              <Cpu className="w-3.5 h-3.5" /> Assign Apps
            </button>

            <button className="flex items-center gap-1.5 h-7 px-2.5 rounded-md bg-[#00775B] hover:bg-[#006649] text-[11px] font-medium text-white transition-colors" style={INTER}>
              <Plus className="w-3.5 h-3.5" /> Create Group
            </button>

            <div className="h-4 w-px bg-white/10" />

            <div className="hidden lg:flex items-center gap-1.5 h-7 px-2 rounded-md border border-white/10" style={MONO}>
              <Clock className="w-3 h-3 text-white/25" />
              <span className="text-[11px] text-white/50">{clockTime}</span>
            </div>

            <button className="h-6 w-6 rounded-full bg-[#00775B] flex items-center justify-center text-white text-[9px] font-bold ring-2 ring-transparent hover:ring-[#00775B]/40 transition-all" style={MONO}>
              AU
            </button>

            <div className="h-4 w-px bg-white/10" />

            <div className="flex items-center gap-2 text-[11px] text-white/40" style={MONO}>
              <button className="p-1 rounded hover:bg-white/8 disabled:opacity-30 transition-colors" disabled>
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <span>Page 1 of 8</span>
              <button className="p-1 rounded hover:bg-white/8 transition-colors">
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* ── Full-width camera grid ────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-thumb]:bg-white/10 [&::-webkit-scrollbar-track]:bg-transparent"
          style={{ background: "#07101d" }}
        >
          <div
            className="grid gap-1.5"
            style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
          >
            {displayFeeds.map((feed, i) => (
              // i === 1 is pinned to hovered state for design-capture purposes
              <CameraGridCell
                key={feed.id + i}
                feed={feed}
                searchActive={searchActive}
                searchResult={searchActive ? SEARCH_RESULTS[i] : undefined}
                isHovered={i === 1 || hoveredFeed === feed.id + i}
                onHover={() => setHoveredFeed(feed.id + i)}
                onLeave={() => setHoveredFeed(null)}
                onResultClick={setSelectedResult}
              />
            ))}
          </div>
        </div>
      </div>

      {/* ── Inspection modal ──────────────────────────────────────────────── */}
      {selectedResult && (
        <InspectionModal result={selectedResult} onClose={() => setSelectedResult(null)} />
      )}

      {/* ── Command Palette (Cmd+K) ───────────────────────────────────────── */}
      {paletteOpen && (
        <CommandPalette
          platform="vms"
          onSearch={handlePaletteSearch}
          onClose={() => setPaletteOpen(false)}
          initialQuery={paletteInitialQuery}
        />
      )}
    </div>
  );
}
