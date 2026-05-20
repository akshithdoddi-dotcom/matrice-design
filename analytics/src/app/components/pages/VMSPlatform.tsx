import { useState, useRef, useEffect, useCallback } from "react";
import {
  Search, X, Star, Bell, Filter, ChevronDown, LayoutGrid, List,
  Grid2X2, Grid3X3, Monitor, Maximize2, Play, Pause, Volume2,
  AlertTriangle, AlertCircle, CheckCircle2, Clock, Camera,
  MapPin, Cpu, Zap, Eye, RefreshCw, Settings, LogOut, User,
  Sun, Moon, PanelLeft, PanelLeftClose, ChevronLeft, ChevronRight,
  Layers, Activity, Shield, Video, ChevronsUpDown, Check, Store,
  Wrench, BarChart3, SlidersHorizontal, Plus,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Types ───────────────────────────────────────────────────────────────────

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
  isSelected?: boolean;
}

interface Alert {
  id: string;
  cameraId: string;
  cameraName: string;
  type: string;
  severity: "critical" | "high" | "medium";
  time: string;
  location: string;
  isNew?: boolean;
}

// ─── Mock data ────────────────────────────────────────────────────────────────

const CAMERA_DATA: CameraFeed[] = [
  { id: "c4",   name: "Main Entrance",      location: "Building A",  building: "Building A", fps: 30, status: "live",        alertLevel: "critical", alertLabel: "ALERT",               applications: ["Fire Detection","Intrusion Detection"], starred: true  },
  { id: "c13",  name: "Lobby Entrance",     location: "Building A",  building: "Building A", fps: 30, status: "live",        alertLevel: "high",     alertLabel: "HIGH",                applications: ["Intrusion Detection"],                  starred: false },
  { id: "c8",   name: "Fitness Center",     location: "Building A",  building: "Building A", fps: 30, status: "live",        alertLevel: "high",     alertLabel: "HIGH",                applications: ["PPE Detection"],                        starred: false },
  { id: "c30",  name: "Safety Station 2",   location: "Building C",  building: "Building C", fps: 30, status: "live",        alertLevel: null,                                          applications: ["PPE Detection"],                        starred: true  },
  { id: "c21",  name: "Loading Bay 2",      location: "Building B",  building: "Building B", fps: 30, status: "live",        alertLevel: null,                                          applications: ["Fire Detection"],                       starred: false },
  { id: "c52",  name: "Distribution Center 3", location: "Building A", building: "Building A", fps: 0, status: "offline",   alertLevel: null,                                          applications: [],                                       starred: false },
  { id: "c34",  name: "Emergency Exit 2",   location: "Building C",  building: "Building C", fps: 30, status: "live",        alertLevel: null,                                          applications: ["Fire Detection"],                       starred: false },
  { id: "c40",  name: "Security Gate 3",    location: "Building A",  building: "Building A", fps: 30, status: "live",        alertLevel: null,                                          applications: [],                                       starred: true  },
  { id: "c22",  name: "Assembly Line 2",    location: "Building C",  building: "Building C", fps: 30, status: "live",        alertLevel: null,                                          applications: ["PPE Detection"],                        starred: false },
  { id: "c76",  name: "Elevator Lobby 4",   location: "Building A",  building: "Building A", fps: 30, status: "live",        alertLevel: null,                                          applications: [],                                       starred: true  },
  { id: "c87",  name: "Employee Lounge 5",  location: "Building D",  building: "Building D", fps: 0, status: "live",         alertLevel: null,                                          applications: [],                                       starred: false },
  { id: "c117", name: "Access Corridor 6",  location: "Building B",  building: "Building B", fps: 30, status: "live",        alertLevel: null,                                          applications: [],                                       starred: false },
  { id: "c78",  name: "Monitor Station 4",  location: "Building B",  building: "Building B", fps: 30, status: "live",        alertLevel: null,                                          applications: [],                                       starred: false },
  { id: "c33",  name: "Receiving Area 2",   location: "Building B",  building: "Building B", fps: 30, status: "live",        alertLevel: null,                                          applications: [],                                       starred: false },
];

const GRID_FEEDS: CameraFeed[] = [
  { id: "c4",   name: "Main Entrance",     location: "Building A",  building: "Building A", fps: 30, status: "live",       alertLevel: "critical", alertLabel: "ALERT",               applications: ["Fire Detection","Intrusion Detection"] },
  { id: "rg1",  name: "Rooftop Garden",    location: "Building A",  building: "Building A", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "op1",  name: "Outdoor Patio",     location: "Building B",  building: "Building B", fps: 0,  status: "signal-lost",alertLevel: null,                                          applications: [] },
  { id: "me2",  name: "Main Entrance",     location: "Building A",  building: "Building A", fps: 30, status: "live",       alertLevel: null,                                          applications: ["Fire Detection"] },
  { id: "cr2",  name: "Conference Room 2", location: "Building C",  building: "Building C", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "cr3",  name: "Conference Room 2", location: "Building C",  building: "Building C", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "eo1",  name: "Executive Office",  location: "Building A",  building: "Building A", fps: 30, status: "live",       alertLevel: "high",     alertLabel: "INTRUSION DETECTED",  applications: ["Intrusion Detection"] },
  { id: "fc1",  name: "Fitness Center",    location: "Building A",  building: "Building A", fps: 30, status: "live",       alertLevel: null,                                          applications: ["PPE Detection"] },
  { id: "tr1",  name: "Training Room",     location: "Building B",  building: "Building B", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "pb2",  name: "Parking B2",        location: "Building C",  building: "Building C", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "br1",  name: "Break Room",        location: "Building D",  building: "Building D", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "rf1",  name: "Restrooms - 1st Floor", location: "Building A", building: "Building A", fps: 30, status: "live",   alertLevel: null,                                          applications: [] },
  { id: "le1",  name: "Lobby Entrance",    location: "Building A",  building: "Building A", fps: 30, status: "live",       alertLevel: null,                                          applications: ["Intrusion Detection"] },
  { id: "sr1",  name: "Server Room",       location: "Building B",  building: "Building B", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
  { id: "r2f1", name: "Restrooms - 2nd Floor", location: "Building C", building: "Building C", fps: 30, status: "live",   alertLevel: null,                                          applications: [] },
  { id: "oca1", name: "Office Corridor A", location: "Building D",  building: "Building D", fps: 30, status: "live",       alertLevel: null,                                          applications: [] },
];

const LIVE_ALERTS: Alert[] = [
  { id: "a1", cameraId: "c4",  cameraName: "Main Entrance",    type: "Fire Detection",     severity: "critical", time: "16:31:10", location: "Building A", isNew: true  },
  { id: "a2", cameraId: "eo1", cameraName: "Executive Office", type: "Intrusion Detected", severity: "critical", time: "16:31:05", location: "Building A", isNew: true  },
  { id: "a3", cameraId: "c13", cameraName: "Lobby Entrance",   type: "PPE Violation",      severity: "high",     time: "16:30:52", location: "Building A", isNew: false },
  { id: "a4", cameraId: "c8",  cameraName: "Fitness Center",   type: "Tailgating",         severity: "high",     time: "16:30:41", location: "Building A", isNew: false },
  { id: "a5", cameraId: "rf1", cameraName: "Restrooms 1F",     type: "Loitering Alert",    severity: "high",     time: "16:30:28", location: "Building A", isNew: false },
  { id: "a6", cameraId: "rb2", cameraName: "Parking B2",       type: "Unauthorized Vehicle",severity: "high",    time: "16:30:15", location: "Building C", isNew: false },
  { id: "a7", cameraId: "sr1", cameraName: "Server Room",      type: "Motion Detected",    severity: "high",     time: "16:29:58", location: "Building B", isNew: false },
];

// Unsplash camera feed images
const FEED_IMAGES: Record<string, string> = {
  c4:   "https://images.unsplash.com/photo-1497366216548-37526070297c?w=480&q=70",
  rg1:  "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=480&q=70",
  op1:  "",  // signal lost
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

// ─── Search result clips (simulated footage thumbnails) ───────────────────────
const SEARCH_RESULTS = [
  { id: "sr1", cameraId: "c4",  cameraName: "Main Entrance",    timestamp: "2026-05-12 14:23:07", confidence: 97, matchType: "Blue shirt detected", image: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=480&q=70" },
  { id: "sr2", cameraId: "le1", cameraName: "Lobby Entrance",   timestamp: "2026-05-12 14:18:44", confidence: 91, matchType: "Blue shirt detected", image: "https://images.unsplash.com/photo-1521575107034-e0fa0b594529?w=480&q=70" },
  { id: "sr3", cameraId: "fc1", cameraName: "Fitness Center",   timestamp: "2026-05-12 13:55:20", confidence: 88, matchType: "Cleaning activity",   image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=480&q=70" },
  { id: "sr4", cameraId: "tr1", cameraName: "Training Room",    timestamp: "2026-05-12 13:41:02", confidence: 85, matchType: "Blue shirt detected", image: "https://images.unsplash.com/photo-1497366754035-f200968a6e72?w=480&q=70" },
  { id: "sr5", cameraId: "cr2", cameraName: "Conference Room 2",timestamp: "2026-05-12 13:29:15", confidence: 79, matchType: "Cleaning activity",   image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=480&q=70" },
  { id: "sr6", cameraId: "sr1", cameraName: "Server Room",      timestamp: "2026-05-12 13:11:47", confidence: 74, matchType: "Blue shirt detected", image: "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=480&q=70" },
  { id: "sr7", cameraId: "rg1", cameraName: "Rooftop Garden",   timestamp: "2026-05-12 12:58:33", confidence: 71, matchType: "Cleaning activity",   image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=480&q=70" },
  { id: "sr8", cameraId: "br1", cameraName: "Break Room",       timestamp: "2026-05-12 12:44:09", confidence: 68, matchType: "Blue shirt detected", image: "https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=480&q=70" },
];

// ─── Matrice icon ─────────────────────────────────────────────────────────────

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

// ─── Sub-components ───────────────────────────────────────────────────────────

function AlertBadge({ level, label }: { level: "critical" | "high"; label?: string }) {
  if (level === "critical") return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white animate-pulse">
      {label ?? "CRITICAL"}
    </span>
  );
  return (
    <span className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500 text-white">
      {label ?? "HIGH"}
    </span>
  );
}

function CameraGridCell({
  feed,
  searchActive,
  searchResult,
  hoveredId,
  onHover,
  onLeave,
}: {
  feed: CameraFeed;
  searchActive: boolean;
  searchResult?: typeof SEARCH_RESULTS[0];
  hoveredId: string | null;
  onHover: (id: string) => void;
  onLeave: () => void;
}) {
  const isHovered = hoveredId === feed.id;
  const img = searchActive && searchResult ? searchResult.image : FEED_IMAGES[feed.id] ?? "";

  return (
    <div
      className={cn(
        "relative bg-[#0a1628] overflow-hidden rounded-sm group cursor-pointer border transition-colors",
        feed.alertLevel === "critical" ? "border-red-500/60" : feed.alertLevel === "high" ? "border-orange-500/40" : "border-white/5",
        isHovered && "border-[#00775B]/60 ring-1 ring-[#00775B]/30",
      )}
      style={{ aspectRatio: "16/9" }}
      onMouseEnter={() => onHover(feed.id)}
      onMouseLeave={onLeave}
    >
      {/* Feed image or overlay */}
      {feed.status === "signal-lost" ? (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[#050d1a]">
          <Video className="w-8 h-8 text-red-400/60" />
          <span className="text-red-400 text-xs font-bold font-mono">SIGNAL LOST</span>
          <span className="text-white/30 text-[10px] font-mono">Camera Offline</span>
        </div>
      ) : img ? (
        <img
          src={img}
          alt={feed.name}
          className="absolute inset-0 w-full h-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a1628] to-[#020b18]" />
      )}

      {/* Intrusion detection overlay */}
      {feed.alertLevel === "high" && feed.alertLabel === "INTRUSION DETECTED" && (
        <div className="absolute inset-0 bg-orange-900/30 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center gap-2 bg-orange-600/90 px-3 py-1.5 rounded">
            <AlertTriangle className="w-4 h-4 text-white" />
            <span className="text-white text-xs font-bold font-mono">INTRUSION DETECTED</span>
          </div>
          {/* Fake bounding box circles */}
          <div className="flex gap-4 mt-2">
            <div className="w-8 h-8 rounded-full border-2 border-white/60 bg-white/5" />
            <div className="w-8 h-8 rounded-full border-2 border-white/60 bg-white/5" />
          </div>
        </div>
      )}

      {/* Search result bounding box overlay */}
      {searchActive && searchResult && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-16 h-24 border-2 border-[#00e676] rounded" style={{ boxShadow: "0 0 8px rgba(0,230,118,0.4)" }}>
            <span className="absolute -top-5 left-0 text-[10px] font-mono text-[#00e676] bg-black/70 px-1 rounded">{searchResult.confidence}%</span>
          </div>
        </div>
      )}

      {/* Top overlay: camera name + critical badge */}
      <div className="absolute top-0 left-0 right-0 flex items-start justify-between p-1.5">
        {feed.alertLevel === "critical" && (
          <div className="flex items-center gap-1">
            <span className="text-[10px] font-bold font-mono text-red-300 bg-red-900/80 px-1.5 py-0.5 rounded animate-pulse">CRITICAL</span>
          </div>
        )}
        {feed.alertLevel === "critical" && feed.alertLabel === "ALERT" && (
          <span className="text-[10px] font-bold font-mono text-white bg-red-600/90 px-1.5 py-0.5 rounded ml-1">ALERT</span>
        )}
        <div className="ml-auto flex items-center gap-1">
          {feed.alertLevel && feed.alertLabel !== "INTRUSION DETECTED" && (
            <AlertBadge level={feed.alertLevel} label={feed.alertLevel === "high" ? undefined : undefined} />
          )}
        </div>
      </div>

      {/* Bottom: camera name + LIVE + timestamp */}
      <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-1.5 bg-gradient-to-t from-black/70 to-transparent">
        <span className="text-[11px] font-medium text-white/90 font-mono truncate max-w-[55%]">{feed.name}</span>
        <div className="flex items-center gap-2">
          {searchActive && searchResult ? (
            <span className="text-[10px] font-mono text-[#00e676]/90">
              {new Date(searchResult.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          ) : (
            <>
              {feed.status === "live" && (
                <span className="flex items-center gap-1 text-[10px] font-bold font-mono text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  LIVE
                </span>
              )}
              {feed.status === "offline" && (
                <span className="text-[10px] font-mono text-white/30">OFFLINE</span>
              )}
              <span className="text-[10px] font-mono text-white/40">00:00:00</span>
            </>
          )}
        </div>
      </div>

      {/* Hover tooltip */}
      {isHovered && !searchActive && (
        <div
          className="absolute left-2 bottom-10 z-30 w-52 rounded-lg border border-white/10 p-3 text-xs"
          style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(16px) saturate(180%)" }}
        >
          <div className="font-semibold text-white text-[11px] mb-2">{feed.name}</div>
          <div className="flex items-center gap-1.5 text-white/50 mb-1">
            <MapPin className="w-3 h-3" />
            <span className="font-mono text-[10px]">{feed.location}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white/50 mb-2">
            <Activity className="w-3 h-3" />
            <span className="font-mono text-[10px]">Active • {feed.fps > 0 ? `${feed.fps} fps` : "0 fps"}</span>
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

      {/* Search result info overlay */}
      {searchActive && searchResult && isHovered && (
        <div
          className="absolute left-2 bottom-10 z-30 w-56 rounded-lg border border-[#00775B]/30 p-3 text-xs"
          style={{ background: "rgba(15,23,42,0.92)", backdropFilter: "blur(16px) saturate(180%)" }}
        >
          <div className="font-semibold text-[#34D399] text-[11px] mb-1">{searchResult.matchType}</div>
          <div className="text-white/50 font-mono text-[10px] mb-1">{searchResult.timestamp}</div>
          <div className="flex items-center gap-1">
            <span className="text-white/30 text-[10px]">Confidence:</span>
            <span className="font-mono text-[10px] text-[#34D399]">{searchResult.confidence}%</span>
          </div>
          <button className="mt-2 w-full flex items-center justify-center gap-1 py-1 rounded bg-[#00775B]/20 hover:bg-[#00775B]/40 text-[#34D399] text-[10px] transition-colors">
            <Play className="w-3 h-3" />
            Load Timeline
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Main VMS Platform Component ─────────────────────────────────────────────

export function VMSPlatform({ onPlatformSwitch, isDark = false, onToggleDark }: VMSProps) {
  const [searchQuery, setSearchQuery]     = useState("");
  const [searchActive, setSearchActive]   = useState(false);
  const [hoveredFeed, setHoveredFeed]     = useState<string | null>(null);
  const [selectedCams, setSelectedCams]   = useState<Set<string>>(new Set());
  const [platformOpen, setPlatformOpen]   = useState(false);
  const [sidebarOpen, setSidebarOpen]     = useState(true);
  const [alertSidebarOpen, setAlertSidebarOpen] = useState(true);
  const [gridCols, setGridCols]           = useState<2 | 3 | 4>(4);
  const [activeFilters, setActiveFilters] = useState({ app: "1 applicati...", loc: "Locations", status: "Status" });
  const [clockTime, setClockTime]         = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  const [flashAlert, setFlashAlert]       = useState(true);

  const platformBtnRef  = useRef<HTMLButtonElement>(null);
  const platformPanelRef = useRef<HTMLDivElement>(null);
  const searchInputRef  = useRef<HTMLInputElement>(null);

  // Clock
  useEffect(() => {
    const id = setInterval(() => setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })), 1000);
    return () => clearInterval(id);
  }, []);

  // Flash alert pulse
  useEffect(() => {
    const id = setInterval(() => setFlashAlert(f => !f), 800);
    return () => clearInterval(id);
  }, []);

  // Close platform panel outside click
  useEffect(() => {
    if (!platformOpen) return;
    const handler = (e: MouseEvent) => {
      if (!platformBtnRef.current?.contains(e.target as Node) && !platformPanelRef.current?.contains(e.target as Node)) {
        setPlatformOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [platformOpen]);

  const handleSearch = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      setSearchActive(true);
    }
  }, [searchQuery]);

  const clearSearch = useCallback(() => {
    setSearchQuery("");
    setSearchActive(false);
    searchInputRef.current?.focus();
  }, []);

  const toggleCamera = (id: string) => {
    setSelectedCams(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const criticalCount = LIVE_ALERTS.filter(a => a.severity === "critical").length;
  const highCount     = LIVE_ALERTS.filter(a => a.severity === "high").length;

  // Which feeds to show in the grid
  const displayFeeds = searchActive
    ? GRID_FEEDS.slice(0, SEARCH_RESULTS.length)
    : GRID_FEEDS;

  return (
    <div className="flex h-screen w-full bg-[#08101e] text-white overflow-hidden font-sans">

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
                <div className="text-sm font-semibold text-white truncate">Matrice AI</div>
                <div className="text-[10px] text-white/40 truncate">VMS Platform</div>
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
                    onClick={() => {
                      setPlatformOpen(false);
                      if (p.app) onPlatformSwitch?.(p.app);
                    }}
                  >
                    <div className="flex w-6 h-6 items-center justify-center rounded-sm border bg-background">
                      <p.icon className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-left">{p.label}</span>
                    {p.active && <Check className="w-4 h-4 text-primary" />}
                    <kbd className="inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                      <span className="text-xs">⌘</span>{p.shortcut}
                    </kbd>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Directory header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#00775B]/10">
            <span className="text-[11px] font-semibold text-white/80 tracking-wide uppercase">Camera Directory</span>
            <div className="flex items-center gap-1">
              <button className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-mono text-red-400/80 bg-red-900/20 hover:bg-red-900/40 border border-red-800/30 transition-colors">
                <X className="w-2.5 h-2.5" /> Clear
              </button>
              <button className="p-1 rounded hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                <Search className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-white/8 text-white/40 hover:text-white transition-colors">
                <Filter className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 rounded hover:bg-white/8 text-white/40 hover:text-white transition-colors" onClick={() => setSidebarOpen(false)}>
                <PanelLeftClose className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Filter row */}
          <div className="flex items-center gap-1 px-2 py-2 border-b border-[#00775B]/10">
            {["1 applicati...", "Locations", "Status"].map(f => (
              <button key={f} className="flex items-center gap-1 px-2 py-1 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-mono text-white/60 transition-colors truncate max-w-[72px]">
                {f} <ChevronDown className="w-2.5 h-2.5 shrink-0 text-white/30" />
              </button>
            ))}
          </div>

          {/* Applications filter chips */}
          <div className="px-2 py-2 border-b border-[#00775B]/10">
            <div className="text-[9px] font-bold uppercase tracking-widest text-white/25 mb-1.5 px-1">Applications</div>
            <div className="flex flex-col gap-0.5">
              {["Fire Detection", "Intrusion Detection", "PPE Detection"].map((app, i) => (
                <label key={app} className="flex items-center gap-2 px-1.5 py-1 rounded hover:bg-white/5 cursor-pointer group">
                  <div className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0", i === 0 ? "bg-[#00775B] border-[#00775B]" : "border-white/20 group-hover:border-white/40")}>
                    {i === 0 && <Check className="w-2.5 h-2.5 text-white" />}
                  </div>
                  <span className="text-[11px] text-white/60 group-hover:text-white/80 transition-colors">{app}</span>
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
                {/* Checkbox */}
                <div
                  className={cn("w-3.5 h-3.5 rounded border flex items-center justify-center shrink-0 cursor-pointer", selectedCams.has(cam.id) ? "bg-[#00775B] border-[#00775B]" : "border-white/20")}
                  onClick={() => toggleCamera(cam.id)}
                >
                  {selectedCams.has(cam.id) && <Check className="w-2.5 h-2.5 text-white" />}
                </div>

                {/* Name + meta */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    {/* Status dot */}
                    <span className={cn("w-1.5 h-1.5 rounded-full shrink-0",
                      cam.status === "live" && cam.fps > 0 ? "bg-emerald-400" :
                      cam.status === "offline" ? "bg-neutral-500" : "bg-red-400"
                    )} />
                    <span className="text-[11px] text-white/75 font-medium truncate">{cam.name}</span>
                    {cam.alertLevel && (
                      <span className={cn("text-[9px] font-bold px-1 py-0.5 rounded uppercase",
                        cam.alertLevel === "critical" ? "bg-red-600/30 text-red-300" : "bg-orange-500/20 text-orange-300"
                      )}>{cam.alertLevel}</span>
                    )}
                  </div>
                  <div className="text-[9px] font-mono text-white/25 truncate mt-0.5">{cam.id} • {cam.building} • {cam.fps} fps</div>
                </div>

                {/* Star */}
                <Star className={cn("w-3 h-3 shrink-0 transition-colors",
                  cam.starred ? "text-amber-400 fill-amber-400" : "text-white/15 group-hover:text-white/30"
                )} />
              </div>
            ))}
          </div>

          {/* Footer count */}
          <div className="px-3 py-2 border-t border-[#00775B]/10">
            <span className="text-[10px] font-mono text-white/25">Viewing 1-73 of 119</span>
          </div>
        </aside>
      )}

      {/* ── Main content area ─────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">

        {/* ── Top header bar ───────────────────────────────────────────────── */}
        <header className="flex h-12 shrink-0 items-center gap-2 bg-[#021d18] border-b border-[#00775B]/15 px-3">
          {/* Sidebar toggle */}
          {!sidebarOpen && (
            <button className="p-1.5 rounded hover:bg-white/5 text-white/50 hover:text-white transition-colors" onClick={() => setSidebarOpen(true)}>
              <PanelLeft className="w-4 h-4" />
            </button>
          )}
          <div className="h-4 w-px bg-white/10" />

          {/* Vision search — center */}
          <div className="flex-1 flex justify-center px-4 max-w-2xl mx-auto">
            <div className={cn(
              "flex items-center gap-2 h-8 rounded-lg border transition-all w-full",
              searchActive
                ? "border-[#00775B]/60 bg-[#00775B]/10 shadow-[0_0_12px_rgba(0,119,91,0.2)]"
                : "border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/8"
            )}>
              <Search className="w-3.5 h-3.5 text-white/40 shrink-0 ml-3" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={handleSearch}
                placeholder="Search live or recorded video objects, colors, or actions..."
                className="flex-1 bg-transparent text-[12px] text-white placeholder:text-white/30 outline-none font-sans"
                style={{ fontFamily: "'Inter', sans-serif" }}
              />
              {searchActive && (
                <button
                  onClick={clearSearch}
                  className="flex items-center gap-1 mr-2 px-2 py-0.5 rounded text-[10px] font-mono text-white/50 hover:text-white/80 hover:bg-white/10 border border-white/10 transition-colors shrink-0"
                >
                  <X className="w-2.5 h-2.5" /> Clear Search
                </button>
              )}
            </div>
          </div>

          {/* Right: alert counts + actions */}
          <div className="flex items-center gap-2">
            {/* Live clock */}
            <div className="hidden lg:flex items-center gap-1.5 h-8 px-2.5 rounded-lg border border-white/10 text-[11px] font-mono text-white/50">
              <Clock className="w-3 h-3 text-white/25" />
              {clockTime}
            </div>

            {/* Critical / High alerts */}
            <button className={cn("flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold font-mono transition-all", flashAlert ? "bg-red-600 text-white shadow-lg shadow-red-900/50" : "bg-red-700/80 text-white")}>
              <AlertTriangle className="w-3.5 h-3.5" />
              {criticalCount} CRITICAL
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg text-[11px] font-bold font-mono bg-orange-600/80 text-white">
              <AlertCircle className="w-3.5 h-3.5" />
              {highCount} HIGH
            </button>

            {/* Actions */}
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/15 text-[11px] font-medium text-white/70 hover:text-white hover:bg-white/8 transition-colors">
              <Cpu className="w-3.5 h-3.5" />
              Assign Apps
            </button>
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-lg bg-[#00775B] hover:bg-[#006649] text-[11px] font-medium text-white transition-colors">
              <Plus className="w-3.5 h-3.5" />
              Create Group
            </button>

            {/* Alert sidebar toggle */}
            <button
              className={cn("p-1.5 rounded-lg border transition-colors", alertSidebarOpen ? "border-[#00775B]/40 bg-[#00775B]/10 text-[#34D399]" : "border-white/10 text-white/40 hover:text-white")}
              onClick={() => setAlertSidebarOpen(o => !o)}
            >
              <Bell className="w-4 h-4" />
            </button>

            {/* User */}
            <button className="h-7 w-7 rounded-full bg-[#00775B] flex items-center justify-center text-white text-[10px] font-bold ring-2 ring-transparent hover:ring-[#00775B]/40 transition-all">
              AU
            </button>
          </div>
        </header>

        {/* ── Grid toolbar ────────────────────────────────────────────────── */}
        <div className="flex items-center gap-2 px-3 py-2 bg-[#0a1628] border-b border-white/5 shrink-0">
          {/* Grid layout toggles */}
          <div className="flex items-center rounded-md overflow-hidden border border-white/10">
            {[
              { icon: List,      cols: undefined, title: "List" },
              { icon: Grid2X2,   cols: 2,         title: "2×2"  },
              { icon: LayoutGrid,cols: 3,          title: "3×3"  },
              { icon: Grid3X3,   cols: 4,          title: "4×4"  },
            ].map(({ icon: Icon, cols, title }) => (
              <button
                key={title}
                title={title}
                onClick={() => cols && setGridCols(cols as 2|3|4)}
                className={cn("flex items-center justify-center w-7 h-7 transition-colors",
                  gridCols === cols ? "bg-[#00775B] text-white" : "bg-white/3 text-white/40 hover:bg-white/8 hover:text-white"
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>

          {/* Smart View */}
          <button className="flex items-center gap-1.5 h-7 px-3 rounded-md border border-[#00775B]/40 bg-[#00775B]/10 text-[11px] font-medium text-[#34D399] hover:bg-[#00775B]/20 transition-colors">
            <Eye className="w-3.5 h-3.5" />
            Smart View
          </button>

          {/* Search results indicator */}
          {searchActive && (
            <div className="flex items-center gap-2 px-3 py-1 rounded-md bg-[#00775B]/10 border border-[#00775B]/30">
              <Search className="w-3 h-3 text-[#34D399]" />
              <span className="text-[11px] font-mono text-[#34D399]">{SEARCH_RESULTS.length} clips matching</span>
              <span className="text-[11px] font-mono text-white/50">"{searchQuery}"</span>
            </div>
          )}

          <div className="flex-1" />

          {/* Page nav */}
          <div className="flex items-center gap-2 text-[11px] font-mono text-white/40">
            <button className="p-1 rounded hover:bg-white/8 disabled:opacity-30 transition-colors" disabled>
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <span>Page 1 of 8</span>
            <button className="p-1 rounded hover:bg-white/8 transition-colors">
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ── Camera grid + alert sidebar ──────────────────────────────────── */}
        <div className="flex flex-1 min-h-0 overflow-hidden">

          {/* Camera grid */}
          <div
            className="flex-1 overflow-y-auto p-2 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-white/10"
            style={{ background: "#07101d" }}
          >
            <div
              className="grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))` }}
            >
              {displayFeeds.map((feed, i) => (
                <CameraGridCell
                  key={feed.id + i}
                  feed={feed}
                  searchActive={searchActive}
                  searchResult={searchActive ? SEARCH_RESULTS[i] : undefined}
                  hoveredId={hoveredFeed}
                  onHover={setHoveredFeed}
                  onLeave={() => setHoveredFeed(null)}
                />
              ))}
            </div>
          </div>

          {/* ── Right: Live Alert Feed ──────────────────────────────────── */}
          {alertSidebarOpen && (
            <aside
              className="w-64 shrink-0 border-l border-white/5 flex flex-col overflow-hidden"
              style={{ background: "rgba(8,16,30,0.95)", backdropFilter: "blur(4px)" }}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-3 py-2.5 border-b border-white/8">
                <div className="flex items-center gap-2">
                  <Bell className="w-3.5 h-3.5 text-[#34D399]" />
                  <span className="text-[11px] font-semibold text-white/80 uppercase tracking-wide">Live Alerts</span>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-red-600/20 text-red-300 border border-red-800/30">{LIVE_ALERTS.length}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button className="text-[10px] font-mono text-white/30 hover:text-white/60 transition-colors">All</button>
                </div>
              </div>

              {/* Alert list */}
              <div className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:w-0">
                {LIVE_ALERTS.map((alert, i) => (
                  <div
                    key={alert.id}
                    className={cn(
                      "flex gap-2.5 px-3 py-2.5 border-b border-white/5 cursor-pointer hover:bg-white/5 transition-colors",
                      alert.isNew && "bg-red-950/20"
                    )}
                  >
                    {/* Severity dot */}
                    <div className={cn(
                      "w-1.5 h-full rounded-full shrink-0 mt-0.5",
                      alert.severity === "critical" ? "bg-red-500" : alert.severity === "high" ? "bg-orange-500" : "bg-amber-400"
                    )} />

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={cn("text-[10px] font-bold font-mono uppercase",
                          alert.severity === "critical" ? "text-red-400" : "text-orange-400"
                        )}>{alert.severity}</span>
                        {alert.isNew && (
                          <span className={cn("text-[9px] font-mono px-1 rounded bg-red-600/20 text-red-300", flashAlert && "opacity-60")}>NEW</span>
                        )}
                      </div>
                      <div className="text-[11px] text-white/80 font-medium truncate">{alert.type}</div>
                      <div className="text-[10px] font-mono text-white/35 mt-0.5 truncate">{alert.cameraName}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <MapPin className="w-2.5 h-2.5 text-white/20 shrink-0" />
                        <span className="text-[10px] font-mono text-white/25 truncate">{alert.location}</span>
                        <span className="ml-auto text-[10px] font-mono text-white/25">{alert.time}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Footer */}
              <div className="px-3 py-2 border-t border-white/8">
                <button className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-md border border-white/10 text-[10px] font-mono text-white/40 hover:text-white/60 hover:bg-white/5 transition-colors">
                  <Activity className="w-3 h-3" />
                  View All Incidents
                </button>
              </div>
            </aside>
          )}
        </div>
      </div>
    </div>
  );
}
