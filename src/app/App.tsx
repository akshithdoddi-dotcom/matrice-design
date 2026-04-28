import { useState, useEffect, useRef } from "react";
import { SeverityIcon } from "@/app/components/ui/SeverityIcon";
import { Sidebar, Page } from "@/app/components/layout/Sidebar";
import { IncidentCard } from "@/app/components/dashboard/IncidentCard";
import { IncidentDetailModal } from "@/app/components/dashboard/IncidentDetailModal";
import { Button } from "@/app/components/ui/Button";
import { GridBackground } from "@/app/components/layout/GridBackground";
import { Bell, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock, Filter, LayoutGrid, List, Check, User, Video, MapPin, X, ChevronDown, Info, Trash2, Copy, ImageIcon, Activity, ExternalLink, Search, ShieldCheck, Hexagon, Zap, Shield, PanelLeft, Command, Sun, Moon, LogOut, Settings } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Checkbox } from "@/app/components/ui/Checkbox";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PersonaSwitcher, Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { MonitoringWidgets } from "@/app/components/dashboard/MonitoringWidgets";
import { ManagerWidgets } from "@/app/components/dashboard/ManagerWidgets";
import { DirectorDashboard } from "@/app/components/dashboard/DirectorDashboard";
import { VolumeAnalytics } from "@/app/components/pages/VolumeAnalytics";
import { IncidentAnalytics } from "@/app/components/pages/IncidentAnalytics";
import { ZoneAnalytics } from "@/app/components/pages/ZoneAnalytics";
import { QualityAnalytics } from "@/app/components/pages/QualityAnalytics";
import { SafetyAnalytics } from "@/app/components/pages/SafetyAnalytics";
import { IdentityAnalytics } from "@/app/components/pages/IdentityAnalytics";
import { FacialRecognition } from "@/app/components/pages/FacialRecognition";
import { LicensePlates } from "@/app/components/pages/LicensePlates";
import { Cameras } from "@/app/components/pages/Cameras";
import { MetricsRules } from "@/app/components/pages/MetricsRules";
import { Compliance } from "@/app/components/pages/Compliance";
import { DesignSystem } from "@/app/components/pages/DesignSystem";
import { ALL_INCIDENTS, PROJECTS_DATA, CAMERA_GROUPS, CLIENTS, EMPLOYEES, Incident, IncidentSeverity, LOCATIONS, APPLICATIONS, SEVERITIES } from "@/app/data/mockData";

// Main App Component
function useGridColumns() {
  const [columns, setColumns] = useState(4); 

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      if (width >= 1536) setColumns(5); 
      else if (width >= 1280) setColumns(4); 
      else if (width >= 1024) setColumns(3); 
      else if (width >= 640) setColumns(2); 
      else setColumns(1);
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return columns;
}

const getSeverityBadgeColor = (severity?: string) => {
  switch(severity) {
    case 'critical': return 'bg-red-600 text-white';
    case 'high': return 'bg-[#EA580C] text-white'; 
    case 'medium': return 'bg-[#CA8A04] text-white';
    case 'low': return 'bg-blue-500 text-white';
    case 'info': return 'bg-neutral-500 text-white';
    case 'resolved': return 'bg-green-600 text-white';
    default: return 'bg-neutral-500 text-white';
  }
};

const SeverityBadge = ({ severity, className }: { severity: string, className?: string }) => {
  return (
    <div className={cn("inline-flex items-center gap-[4px] px-[6px] py-0.5 rounded-[2px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]", getSeverityBadgeColor(severity), className)}>
       <SeverityIcon severity={severity} mode="inverse" className="w-[12.6px] h-[12.6px]" />
       <span className="text-[10px] font-bold uppercase tracking-[0.5px] leading-[12px] text-white">{severity}</span>
    </div>
  );
};

const Legend = ({ variant = "dark" }: { variant?: "light" | "dark" }) => (
  <div className={cn(
    "flex items-center gap-2 px-2 py-1.5 rounded-full border shadow-sm text-[10px] font-medium uppercase tracking-wider",
    variant === "dark" 
      ? "bg-white/10 border-white/10 text-white backdrop-blur-sm" 
      : "bg-white/80 border-neutral-200 text-neutral-900 backdrop-blur-sm"
  )}>
    <div className="flex items-center gap-1.5">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px] bg-red-600 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <SeverityIcon severity="critical" className="w-[12.6px] h-[12.6px]" mode="inverse" />
      </div>
      <span>Critical</span>
    </div>
    <div className={cn("w-[1px] h-3", variant === "dark" ? "bg-white/20" : "bg-neutral-300")} />
    <div className="flex items-center gap-1.5">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px] bg-[#EA580C] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <SeverityIcon severity="high" className="w-[12.6px] h-[12.6px]" mode="inverse" />
      </div>
      <span>High</span>
    </div>
    <div className={cn("w-[1px] h-3", variant === "dark" ? "bg-white/20" : "bg-neutral-300")} />
    <div className="flex items-center gap-1.5">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px] bg-[#CA8A04] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <SeverityIcon severity="medium" className="w-[12.6px] h-[12.6px]" mode="inverse" />
      </div>
      <span>Medium</span>
    </div>
    <div className={cn("w-[1px] h-3", variant === "dark" ? "bg-white/20" : "bg-neutral-300")} />
    <div className="flex items-center gap-1.5">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px] bg-blue-500 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <SeverityIcon severity="low" className="w-[12.6px] h-[12.6px]" mode="inverse" />
      </div>
      <span>Low</span>
    </div>
    <div className={cn("w-[1px] h-3", variant === "dark" ? "bg-white/20" : "bg-neutral-300")} />
    <div className="flex items-center gap-1.5">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px] bg-neutral-500 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <SeverityIcon severity="info" className="w-[12.6px] h-[12.6px]" mode="inverse" />
      </div>
      <span>Info</span>
    </div>
    <div className={cn("w-[1px] h-3", variant === "dark" ? "bg-white/20" : "bg-neutral-300")} />
    <div className="flex items-center gap-2">
      <div className="flex items-center justify-center w-5 h-5 rounded-[2px] bg-green-600 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]">
        <SeverityIcon severity="resolved" className="w-[12.6px] h-[12.6px]" mode="inverse" />
      </div>
      <span>Resolved</span>
    </div>
  </div>
);

const FilterDropdown = ({ 
  label, 
  options, 
  selected, 
  onChange,
  className
}: { 
  label: string; 
  options: string[]; 
  selected: Set<string>; 
  onChange: (val: string) => void;
  className?: string;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn("relative min-w-[140px]", className)}>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "h-8 text-[11px] font-medium bg-white border-neutral-200 text-neutral-800 hover:text-black gap-2 justify-between shadow-sm w-full",
          selected.size > 0 && "border-[#00775B] text-[#00775B] bg-[#00775B]/5"
        )}
      >
        <span className="truncate">{selected.size > 0 ? `${selected.size} ${label}` : `All ${label}`}</span>
        <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" strokeWidth={2.5} />
      </Button>
      
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute top-full mt-1 left-0 z-50 w-full min-w-[180px] bg-white rounded-[4px] shadow-xl border border-neutral-200 py-1 animate-in fade-in zoom-in-95 duration-100">
            {options.map(option => (
              <div 
                key={option} 
                className="flex items-center gap-2 px-3 py-2 hover:bg-neutral-50 cursor-pointer text-xs"
                onClick={() => onChange(option)}
              >
                <Checkbox checked={selected.has(option)} className="h-3.5 w-3.5" />
                {label === "Severity" ? (
                   <SeverityBadge severity={option} className="scale-90 origin-left" />
                ) : (
                   <span className="truncate uppercase">{option}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const Modal = ({ isOpen, onClose, title, children, footer, className, headerClassName }: { isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode; footer?: React.ReactNode; className?: string; headerClassName?: string }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={onClose} />
      <div className={cn("relative w-full max-w-2xl bg-white rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]", className)}>
        <div className={cn("flex items-center justify-between px-6 py-4 border-b border-neutral-100 bg-[#FAFAFA]", headerClassName)}>
          <h3 className={cn("text-lg font-bold", headerClassName?.includes("bg-[#021d18]") ? "text-white" : "text-neutral-900")}>{title}</h3>
          <button onClick={onClose} className={cn("transition-colors", headerClassName?.includes("bg-[#021d18]") ? "text-white/70 hover:text-white" : "text-neutral-500 hover:text-neutral-900")}>
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto custom-scrollbar bg-[#F1F5F9]">
          {children}
        </div>
        {footer && (
           <div className="px-6 py-4 bg-[#FAFAFA] border-t border-neutral-100 flex justify-end gap-3">
             {footer}
           </div>
        )}
      </div>
    </div>
  );
};

export default function App() {
  const [activePersona, setActivePersona] = useState<Persona>("monitoring");
  const [activePage, setActivePage] = useState<Page>("dashboard");

  // ── Theme ────────────────────────────────────────────────────────────────────
  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-theme") === "dark"; } catch { return false; }
  });
  const [isAvatarMenuOpen, setIsAvatarMenuOpen] = useState(false);
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    try { localStorage.setItem("matrice-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setIsAvatarMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);
  
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("no-animate") === "1") {
      document.documentElement.classList.add("no-animate");
    }
  }, []);

  useEffect(() => {
    if (activePersona === "monitoring") {
      setViewMode("grid");
    } else if (activePersona === "manager") {
      setViewMode("table");
    }
  }, [activePersona]);

  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [selectedIncidents, setSelectedIncidents] = useState<Set<number>>(new Set());
  
  // Filters
  const [selectedApps, setSelectedApps] = useState<Set<string>>(new Set());
  const [selectedLocs, setSelectedLocs] = useState<Set<string>>(new Set());
  const [selectedSeverities, setSelectedSeverities] = useState<Set<string>>(new Set());

  // Pagination State
  const [tablePage, setTablePage] = useState(1);
  const [gridExpanded, setGridExpanded] = useState(false);
  const ITEMS_PER_PAGE_TABLE = 8;
  const gridColumns = useGridColumns();

  // Modals
  const [ackModalOpen, setAckModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [currentIncident, setCurrentIncident] = useState<Incident | null>(null);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [bulkAckModalOpen, setBulkAckModalOpen] = useState(false);
  const [bulkAssignModalOpen, setBulkAssignModalOpen] = useState(false);

  // Global Filter State
  const [isClientSwitcherOpen, setIsClientSwitcherOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState(CLIENTS[0]);
  const [isGlobalFilterOpen, setIsGlobalFilterOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try { return localStorage.getItem('sidebarCollapsed') === 'true'; } catch { return false; }
  });
  const [globalFilterType, setGlobalFilterType] = useState<"project" | "camera">("project");
  const [globalFilterQuery, setGlobalFilterQuery] = useState("");
  const [appliedProject, setAppliedProject] = useState<string | null>(null);
  const [appliedPipeline, setAppliedPipeline] = useState<string | null>(null);
  const [appliedCameraGroups, setAppliedCameraGroups] = useState<Set<string>>(new Set());
  const [draftProject, setDraftProject] = useState<string | null>(null);
  const [draftPipeline, setDraftPipeline] = useState<string | null>(null);
  const [draftCameraGroups, setDraftCameraGroups] = useState<Set<string>>(new Set());

  // Suppress layout transition on first paint to avoid flash
  const sidebarMounted = useRef(false);
  useEffect(() => { sidebarMounted.current = true; }, []);

  useEffect(() => {
    try { localStorage.setItem('sidebarCollapsed', String(sidebarCollapsed)); } catch {}
  }, [sidebarCollapsed]);

  useEffect(() => {
    if (isGlobalFilterOpen) {
      setDraftProject(appliedProject);
      setDraftPipeline(appliedPipeline);
      setDraftCameraGroups(new Set(appliedCameraGroups));
      setGlobalFilterQuery("");
    }
  }, [isGlobalFilterOpen]);

  const applyGlobalFilters = () => {
    setAppliedProject(draftProject);
    setAppliedPipeline(draftPipeline);
    setAppliedCameraGroups(new Set(draftCameraGroups));
    setIsGlobalFilterOpen(false);
  };

  const clearDraftFilters = () => {
    setDraftProject(null);
    setDraftPipeline(null);
    setDraftCameraGroups(new Set());
    setGlobalFilterQuery("");
  };

  const getFilteredGlobalOptions = () => {
    const q = globalFilterQuery.toLowerCase();
    if (globalFilterType === "camera") {
      return CAMERA_GROUPS.filter(opt => opt.toLowerCase().includes(q));
    }
    if (draftProject) {
       const pipelines = PROJECTS_DATA[draftProject] || [];
       return pipelines.filter(p => p.toLowerCase().includes(q));
    }
    return Object.keys(PROJECTS_DATA).filter(p => p.toLowerCase().includes(q));
  };

  const filteredGlobalOptions = getFilteredGlobalOptions();
  const activeFilterCount = (appliedPipeline ? 1 : 0) + appliedCameraGroups.size;

  const filteredIncidents = ALL_INCIDENTS.filter(inc => {
    if (selectedApps.size > 0 && !selectedApps.has(inc.application)) return false;
    if (selectedLocs.size > 0 && !selectedLocs.has(inc.location)) return false;
    if (selectedSeverities.size > 0 && !selectedSeverities.has(inc.severity)) return false;
    return true;
  }).sort((a, b) => {
    const priority: Record<string, number> = { critical: 0, high: 1, medium: 2, low: 3, info: 4, resolved: 5 };
    const pA = priority[a.severity] ?? 99;
    const pB = priority[b.severity] ?? 99;
    return pA - pB;
  });

  const tableTotalPages = Math.ceil(filteredIncidents.length / ITEMS_PER_PAGE_TABLE);
  const paginatedTableIncidents = filteredIncidents.slice(
    (tablePage - 1) * ITEMS_PER_PAGE_TABLE,
    tablePage * ITEMS_PER_PAGE_TABLE
  );

  const gridRows = gridExpanded ? 4 : (activePersona === "monitoring" ? 4 : 2);
  const gridItemsToShow = gridColumns * gridRows;
  const visibleGridIncidents = filteredIncidents.slice(0, gridItemsToShow);
  const hasMoreGridItems = filteredIncidents.length > gridItemsToShow;

  const handleFilterChange = (set: Set<string>, val: string) => {
    const newSet = new Set(set);
    if (newSet.has(val)) newSet.delete(val);
    else newSet.add(val);
    setTablePage(1);
    setGridExpanded(false);
    return newSet;
  };

  const clearAllFilters = () => {
    setSelectedApps(new Set());
    setSelectedLocs(new Set());
    setSelectedSeverities(new Set());
    setTablePage(1);
    setGridExpanded(false);
  };

  const openAckModal = (incident: Incident) => {
    setCurrentIncident(incident);
    setAckModalOpen(true);
  };

  const openDetailModal = (incident: Incident) => {
    setCurrentIncident(incident);
    setDetailModalOpen(true);
  };

  const openAssignModal = (incident: Incident) => {
    setCurrentIncident(incident);
    setAssignModalOpen(true);
  };

  const toggleSelection = (id: number) => {
    const newSelection = new Set(selectedIncidents);
    if (newSelection.has(id)) newSelection.delete(id);
    else newSelection.add(id);
    setSelectedIncidents(newSelection);
  };

  const toggleSelectAll = () => {
    if (selectedIncidents.size === filteredIncidents.length) setSelectedIncidents(new Set());
    else setSelectedIncidents(new Set(filteredIncidents.map(i => i.id)));
  };

  const isAllSelected = selectedIncidents.size === filteredIncidents.length && filteredIncidents.length > 0;
  const isIndeterminate = selectedIncidents.size > 0 && selectedIncidents.size < filteredIncidents.length;
  const criticalCount = ALL_INCIDENTS.filter(i => i.severity === "critical").length;

  // ── Live clock ──────────────────────────────────────────────────────────────
  const [clockTime, setClockTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );
  useEffect(() => {
    const id = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  // ── Page title map ───────────────────────────────────────────────────────────
  const PAGE_TITLES: Record<string, string> = {
    dashboard:            "Dashboard",
    volume:               "Volume Analytics",
    incident:             "Incident Analytics",
    zone:                 "Zone Analytics",
    quality:              "Quality Analytics",
    safety:               "Safety Analytics",
    identity:             "Identity Analytics",
    "facial-recognition": "Facial Recognition",
    "license-plates":     "License Plates",
    cameras:              "Cameras",
    metrics:              "Metrics & Rules",
    compliance:           "Compliance",
    "design-system":      "Component Library",
  };

  return (
    <div className="flex h-screen bg-[#F8FAFC] dark:bg-[#020617] font-sans text-neutral-900 dark:text-slate-100 relative overflow-hidden">
      <Sidebar activePage={activePage} onPageChange={setActivePage} collapsed={sidebarCollapsed} noTransition={!sidebarMounted.current} />

      <div className={cn("flex-1 relative z-10 w-full min-w-0 h-full overflow-y-visible overflow-x-hidden", sidebarMounted.current && "transition-all duration-300", sidebarCollapsed ? "lg:pl-14" : "lg:pl-56", (isGlobalFilterOpen || isClientSwitcherOpen) && "z-50")}>
        <header
          className={cn(
            "fixed top-0 right-0 z-[41] flex h-12 items-center justify-between bg-[#0d1f1b] px-4 border-b border-white/8 text-white",
            (isGlobalFilterOpen || isClientSwitcherOpen) && "z-[51]"
          )}
          style={{
            left: sidebarCollapsed ? 56 : 224,
            transition: sidebarMounted.current ? "left 300ms cubic-bezier(0.4, 0, 0.2, 1)" : "none",
          }}
        >
          {/* ── Left: toggle + page title ── */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarCollapsed((c) => !c)}
              className="p-1.5 rounded-md text-white/50 hover:text-white hover:bg-white/8 transition-colors"
              title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              <PanelLeft className={cn("w-4 h-4 transition-transform duration-300", sidebarCollapsed && "rotate-180")} />
            </button>
            <div className="w-px h-4 bg-white/10" />
            <span className="text-sm font-semibold text-white/90 tracking-tight">
              {PAGE_TITLES[activePage] ?? "Dashboard"}
            </span>
          </div>

          {/* ── Right: actions ── */}
          <div className="flex items-center gap-2">

            {/* LIVE pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00775B] rounded-full text-white text-xs font-semibold shadow-md shadow-[#00775B]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>

            {/* Global Filter */}
            <div className="relative">
              <button
                onClick={() => setIsGlobalFilterOpen(!isGlobalFilterOpen)}
                className={cn(
                  "hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 border border-white/10 transition-all",
                  isGlobalFilterOpen && "bg-white/10 text-white z-50"
                )}
              >
                <Filter className="w-3.5 h-3.5" />
                Global Filter
                <ChevronDown className="w-3 h-3 opacity-60" />
                {activeFilterCount > 0 && (
                  <div className="absolute -top-1.5 -right-1.5 flex items-center justify-center min-w-[16px] h-4 px-1 rounded-full bg-[#00775B] text-white text-[9px] font-bold border border-[#021d18]">
                    {activeFilterCount}
                  </div>
                )}
              </button>

              {isGlobalFilterOpen && (
                <>
                  <div className="fixed inset-0 z-40 bg-black/40" onClick={() => setIsGlobalFilterOpen(false)} />
                  <div className="absolute top-full right-0 mt-2 w-72 bg-white rounded-xl shadow-2xl border border-neutral-100 z-50 overflow-hidden">
                    <div className="flex border-b border-neutral-100">
                      <button className={cn("flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors", globalFilterType === "project" ? "text-[#00775B] bg-[#00775B]/5" : "text-neutral-500 hover:bg-neutral-50")} onClick={() => { setGlobalFilterType("project"); setGlobalFilterQuery(""); }}>Project › Pipeline</button>
                      <div className="w-px bg-neutral-100" />
                      <button className={cn("flex-1 py-2.5 text-[10px] font-bold uppercase tracking-wider transition-colors", globalFilterType === "camera" ? "text-[#00775B] bg-[#00775B]/5" : "text-neutral-500 hover:bg-neutral-50")} onClick={() => { setGlobalFilterType("camera"); setGlobalFilterQuery(""); }}>Camera Group</button>
                    </div>
                    <div className="p-3 space-y-3">
                      <h3 className="text-[10px] font-bold uppercase text-neutral-500 tracking-wider">{globalFilterType === "camera" ? "Select Camera Groups" : (draftProject ? "Select a Pipeline" : "Select a Project")}</h3>
                      <div className="relative">
                        <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
                        <input type="text" placeholder={globalFilterType === "camera" ? "Search camera groups..." : (draftProject ? "Search pipelines..." : "Search projects...")} className="w-full h-8 pl-8 pr-3 text-xs bg-neutral-50 border border-neutral-200 rounded-lg focus:border-[#00775B] focus:ring-1 focus:ring-[#00775B] outline-none transition-all placeholder:text-neutral-400 text-neutral-900" value={globalFilterQuery} onChange={(e) => setGlobalFilterQuery(e.target.value)} />
                      </div>
                      {globalFilterType === "project" && draftProject && (
                        <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                          <button onClick={() => { setDraftProject(null); setDraftPipeline(null); setGlobalFilterQuery(""); }} className="p-1 rounded hover:bg-neutral-100 text-neutral-500 hover:text-neutral-900"><ChevronLeft className="w-3.5 h-3.5" /></button>
                          <span className="text-xs font-bold text-neutral-900 truncate"><span className="text-neutral-500 font-normal">Project –</span> {draftProject}</span>
                        </div>
                      )}
                      <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1">
                        {filteredGlobalOptions.length > 0 ? filteredGlobalOptions.map(opt => {
                          const isSelected = globalFilterType === "camera" ? draftCameraGroups.has(opt) : (draftProject ? draftPipeline === opt : false);
                          return (
                            <div key={opt} className="flex items-center gap-2 px-2 py-1.5 hover:bg-neutral-50 rounded-lg cursor-pointer group" onClick={() => {
                              if (globalFilterType === "camera") {
                                const newSet = new Set(draftCameraGroups);
                                if (newSet.has(opt)) newSet.delete(opt); else newSet.add(opt);
                                setDraftCameraGroups(newSet);
                              } else {
                                if (draftProject) { setDraftPipeline(isSelected ? null : opt); } else { setDraftProject(opt); setGlobalFilterQuery(""); }
                              }
                            }}>
                              {globalFilterType === "camera" && <Checkbox checked={isSelected} className="data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B] w-3.5 h-3.5" />}
                              {globalFilterType === "project" && draftProject && (
                                <div className={cn("w-3.5 h-3.5 rounded-full border flex items-center justify-center", isSelected ? "border-[#00775B]" : "border-neutral-300")}>{isSelected && <div className="w-2 h-2 rounded-full bg-[#00775B]" />}</div>
                              )}
                              <span className={cn("text-xs font-medium text-neutral-700 group-hover:text-neutral-900 flex-1", isSelected && "text-[#00775B] font-bold")}>{opt}</span>
                              {globalFilterType === "project" && !draftProject && <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />}
                            </div>
                          );
                        }) : <p className="text-center py-4 text-xs text-neutral-400 italic">No matches found</p>}
                      </div>
                    </div>
                    <div className="p-3 border-t border-neutral-100 bg-neutral-50/50 flex justify-between items-center">
                      <button className="text-[10px] font-bold text-neutral-500 hover:text-neutral-800 uppercase tracking-wide hover:underline" onClick={clearDraftFilters}>Clear All</button>
                      <Button size="sm" className="h-7 text-[10px] bg-[#00775B] text-white hover:bg-[#00624b] rounded-lg" onClick={applyGlobalFilters}>Apply</Button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Live clock */}
            <div className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 text-xs font-mono text-white/60">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              {clockTime}
            </div>

            {/* Persona switcher */}
            <div className="hidden lg:block">
              <PersonaSwitcher activePersona={activePersona} onPersonaChange={setActivePersona} />
            </div>

            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 text-xs text-white/40 bg-white/5 hover:bg-white/8 cursor-pointer transition-colors min-w-[140px]">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">Search</span>
              <div className="flex items-center gap-0.5 opacity-60">
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">⌘</kbd>
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">K</kbd>
              </div>
            </div>

            {/* Bell */}
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#021d18]" />
            </button>

            {/* User avatar + dropdown */}
            <div className="relative" ref={avatarRef}>
              <button
                onClick={() => setIsAvatarMenuOpen(v => !v)}
                className="h-8 w-8 rounded-full bg-[#00775B] flex items-center justify-center text-white text-xs font-bold shadow-md hover:bg-[#006649] transition-colors ring-2 ring-transparent hover:ring-[#00775B]/40"
              >
                AU
              </button>

              {isAvatarMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 rounded-xl shadow-2xl z-[200] overflow-hidden border"
                     style={{ background: isDark ? "#0F172A" : "#ffffff", borderColor: isDark ? "#1E293B" : "#e5e7eb" }}>
                  {/* User info */}
                  <div className="flex items-center gap-3 px-4 py-3.5"
                       style={{ borderBottom: isDark ? "1px solid #1E293B" : "1px solid #f1f5f9" }}>
                    <div className="w-9 h-9 rounded-full bg-[#00775B] flex items-center justify-center text-white text-sm font-black shrink-0">
                      AU
                    </div>
                    <div className="min-w-0">
                      <p className="text-[12px] font-bold truncate" style={{ color: isDark ? "#f1f5f9" : "#0f172a" }}>Admin User</p>
                      <p className="text-[10px] truncate" style={{ color: isDark ? "#64748b" : "#94a3b8" }}>admin@matrice.ai</p>
                    </div>
                  </div>

                  {/* Theme toggle row */}
                  <div className="px-2 py-2"
                       style={{ borderBottom: isDark ? "1px solid #1E293B" : "1px solid #f1f5f9" }}>
                    <button
                      onClick={() => { setIsDark(d => !d); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors group"
                      style={{
                        background: "transparent",
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = isDark ? "#1E293B" : "#f8fafc")}
                      onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                    >
                      <div className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                           style={{ background: isDark ? "#00D4AA22" : "#00775B15" }}>
                        {isDark
                          ? <Sun  className="w-3.5 h-3.5" style={{ color: "#00D4AA" }} />
                          : <Moon className="w-3.5 h-3.5" style={{ color: "#00775B" }} />}
                      </div>
                      <div className="flex-1 text-left">
                        <p className="text-[11px] font-semibold" style={{ color: isDark ? "#e2e8f0" : "#374151" }}>
                          {isDark ? "Switch to Light" : "Switch to Dark"}
                        </p>
                        <p className="text-[9px]" style={{ color: isDark ? "#64748b" : "#9ca3af" }}>
                          {isDark ? "Light mode" : "Dark mode"}
                        </p>
                      </div>
                      {/* Toggle pill */}
                      <div className="relative w-9 h-5 rounded-full transition-colors shrink-0"
                           style={{ background: isDark ? "#00D4AA" : "#d1d5db" }}>
                        <div className="absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-all duration-200"
                             style={{ left: isDark ? "calc(100% - 18px)" : "2px" }} />
                      </div>
                    </button>
                  </div>

                  {/* Other menu items */}
                  <div className="px-2 py-2">
                    {[
                      { icon: Settings, label: "Profile Settings" },
                      { icon: LogOut,   label: "Sign Out",         danger: true },
                    ].map(item => (
                      <button key={item.label}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-[11px] font-medium transition-colors"
                        style={{ color: item.danger ? "#ef4444" : isDark ? "#cbd5e1" : "#374151" }}
                        onMouseEnter={e => (e.currentTarget.style.background = item.danger
                          ? isDark ? "#450a0a" : "#fef2f2"
                          : isDark ? "#1E293B" : "#f8fafc")}
                        onMouseLeave={e => (e.currentTarget.style.background = "transparent")}
                      >
                        <item.icon className="w-3.5 h-3.5 shrink-0" />
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Spacer: compensates for the fixed header (h-12 = 48px) so content starts below it */}
        <div className="h-12 flex-shrink-0" />

        <div className="p-6 space-y-6 relative w-full overflow-x-hidden rounded-tl-lg">
          
          <section className="w-full">
            {activePage === "volume" && <VolumeAnalytics persona={activePersona} />}
            {activePage === "incident" && <IncidentAnalytics persona={activePersona} />}
            {activePage === "zone" && <ZoneAnalytics persona={activePersona} />}
            {activePage === "quality" && <QualityAnalytics persona={activePersona} />}
            {activePage === "safety" && <SafetyAnalytics persona={activePersona} sidebarCollapsed={sidebarCollapsed} />}
            {activePage === "identity" && <IdentityAnalytics persona={activePersona} />}
            {activePage === "facial-recognition" && <FacialRecognition />}
            {activePage === "license-plates" && <LicensePlates />}
            {activePage === "cameras" && <Cameras />}
            {activePage === "metrics" && <MetricsRules />}
            {activePage === "compliance" && <Compliance />}
            {activePage === "design-system" && <DesignSystem />}
            
            {activePage === "dashboard" && (
              <>
               {activePersona === "director" ? (
                  <DirectorDashboard />
               ) : (
                 <>
                  {activePersona === "monitoring" && <MonitoringWidgets />}
                  {activePersona === "manager" && <ManagerWidgets />}

                  <div className="flex flex-wrap items-center justify-between gap-4 mb-3">
                    <div className="flex items-center gap-3">
                       <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-900">
                          {activePersona === "manager" ? "Operational Incidents" : "Active Incidents"}
                       </h2>
                    <div className="h-5 px-[6px] rounded-[2px] bg-[#00775B] flex items-center justify-center text-[10px] font-bold text-white shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] leading-[12px]">{ALL_INCIDENTS.length}</div>
                 </div>
                 
                 <div className="flex items-center gap-2 flex-wrap">
                    {selectedIncidents.size > 0 && (
                      <div className="flex items-center gap-2 animate-in fade-in slide-in-from-right-2 duration-200 mr-2">
                         <span className="text-xs font-bold text-neutral-600 mr-2">{selectedIncidents.size} Selected</span>
                         <Button size="sm" onClick={() => setBulkAssignModalOpen(true)} className="h-8 bg-white text-neutral-700 hover:bg-neutral-50 border border-neutral-200 font-bold text-[10px] uppercase tracking-wider gap-2 shadow-sm">
                            <User className="w-3.5 h-3.5" /> Assign
                         </Button>
                         <Button size="sm" onClick={() => setBulkAckModalOpen(true)} className="h-8 bg-[#00775B] text-white hover:bg-[#009e78] border-transparent font-bold text-[10px] uppercase tracking-wider gap-2">
                            <Check className="w-3.5 h-3.5" /> Acknowledge
                         </Button>
                         <div className="w-[1px] h-6 bg-neutral-200 mx-1" />
                      </div>
                    )}

                    <div className="flex items-center gap-2 mr-2">
                       {(selectedApps.size > 0 || selectedLocs.size > 0 || selectedSeverities.size > 0) && (
                         <Button variant="ghost" size="sm" onClick={clearAllFilters} className="h-8 px-2 text-[10px] font-bold text-red-600 hover:bg-red-50 hover:text-red-700 uppercase tracking-wide flex items-center gap-1.5 animate-in fade-in slide-in-from-right-2">
                            <Trash2 className="w-3 h-3" /> Clear
                         </Button>
                       )}
                       <div className="flex items-center gap-2">
                         <FilterDropdown label="Severity" options={SEVERITIES} selected={selectedSeverities} onChange={(val) => setSelectedSeverities(handleFilterChange(selectedSeverities, val))} className="w-[160px]" />
                         <FilterDropdown label="Applications" options={APPLICATIONS} selected={selectedApps} onChange={(val) => setSelectedApps(handleFilterChange(selectedApps, val))} className="w-[160px]" />
                         <FilterDropdown label="Locations" options={LOCATIONS} selected={selectedLocs} onChange={(val) => setSelectedLocs(handleFilterChange(selectedLocs, val))} className="w-[160px]" />
                       </div>
                    </div>
                    
                    <div className="w-[1px] h-6 bg-neutral-200 mx-1" />

                    <div className="flex items-center bg-white border border-neutral-200 rounded-[2px] p-0.5 shadow-sm">
                       <Button variant="ghost" size="sm" onClick={() => setViewMode("grid")} className={cn("h-7 w-7 p-0 rounded-[1px] hover:bg-neutral-100 transition-colors", viewMode === "grid" ? "bg-neutral-100 text-[#00775B]" : "text-neutral-400")} title="Grid View">
                         <LayoutGrid className={cn("w-3.5 h-3.5", viewMode === "grid" && "fill-current")} />
                       </Button>
                       <div className="w-[1px] h-4 bg-neutral-200 mx-0.5" />
                       <Button variant="ghost" size="sm" onClick={() => setViewMode("table")} className={cn("h-7 w-7 p-0 rounded-[1px] hover:bg-neutral-100 transition-colors", viewMode === "table" ? "bg-neutral-100 text-[#00775B]" : "text-neutral-400")} title="List View">
                         <List className={cn("w-3.5 h-3.5", viewMode === "table" && "fill-current")} />
                       </Button>
                    </div>
                 </div>
               </div>
               
               {viewMode === "grid" ? (
                 <div className="space-y-3">
                   <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-3">
                     {visibleGridIncidents.map((incident, index) => {
                       return (
                         <IncidentCard 
                           key={incident.id}
                           {...incident}
                           className="w-full"
                           forceHover={index === 0}
                           alternateOverlay={true}
                           onCardClick={() => openDetailModal(incident)}
                           onAcknowledge={() => openAckModal(incident)}
                           onAssign={() => openAssignModal(incident)}
                         />
                       );
                     })}
                   </div>
                   {!gridExpanded && hasMoreGridItems && (
                     <button onClick={() => setGridExpanded(true)} className="w-full flex items-center justify-center gap-2 py-3 mt-4 bg-white border border-neutral-200 shadow-sm rounded-sm hover:bg-neutral-50 hover:border-[#00775B]/30 transition-all group">
                        <span className="text-xs font-bold text-neutral-600 group-hover:text-[#00775B] uppercase tracking-widest transition-colors">Show More Incidents</span>
                        <div className="h-5 w-5 rounded-full bg-neutral-100 flex items-center justify-center group-hover:bg-[#00775B] transition-colors"><ChevronDown className="w-3 h-3 text-neutral-500 group-hover:text-white" /></div>
                     </button>
                   )}
                 </div>
               ) : (
                 <div className="w-full bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                         <thead className="bg-[#001E18]">
                            <tr className="border-b border-[#00775B]/20 text-[10px] uppercase tracking-wider font-bold text-white/90 h-10">
                               <th className="w-10 px-4 text-center first:rounded-tl-[4px]"><Checkbox checked={isAllSelected} onCheckedChange={toggleSelectAll} className={cn("border-white/20 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B] data-[state=checked]:text-white", isIndeterminate && "data-[state=checked]:bg-[#00775B] data-[state=checked]:text-white")} /></th>
                               <th className="px-4 py-2 w-16 text-center">Severity</th>
                               <th className="px-4 py-2 w-24">ID</th>
                               <th className="px-4 py-2 w-32">Snapshot</th>
                               <th className="px-4 py-2">Incident Details</th>
                               <th className="px-4 py-2">Location</th>
                               <th className="px-4 py-2">Camera</th>
                               <th className="px-4 py-2 w-32 text-right">Date & Time</th>
                               <th className="px-4 py-2 text-right last:rounded-tr-[4px]">Actions</th>
                            </tr>
                         </thead>
                         <tbody className="divide-y divide-neutral-100">
                            {paginatedTableIncidents.map((incident, index) => {
                              const isSelected = selectedIncidents.has(incident.id);
                              const isFirstRow = index === 0;
                              return (
                                <tr key={incident.id} className={cn("group transition-colors hover:bg-[#E5FFF9] h-20 cursor-pointer", isSelected && "bg-[#E5FFF9]", incident.severity === "resolved" && "bg-[#E5FFF9]", isFirstRow && incident.severity !== "resolved" && "bg-[#00775B]/5")} onClick={() => openDetailModal(incident)}>
                                   <td className="px-4 text-center" onClick={(e) => e.stopPropagation()}><Checkbox checked={isSelected} onCheckedChange={() => toggleSelection(incident.id)} /></td>
                                   <td className="px-4 text-center"><div className={cn("h-6 w-6 inline-flex items-center justify-center rounded-[2px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)]", getSeverityBadgeColor(incident.severity))}><SeverityIcon severity={incident.severity} mode="inverse" className="w-[12.6px] h-[12.6px]" /></div></td>
                                   <td className="px-4 font-mono text-xs font-bold text-neutral-500">{incident.incidentId}</td>
                                   <td className="px-4 py-1.5"><div className={cn("h-16 w-24 rounded-[2px] overflow-hidden border border-neutral-200 shrink-0 relative group-hover:border-[#00775B]/30 transition-colors bg-neutral-100", isFirstRow && "border-[#00775B]/30")}><ImageWithFallback src={incident.image} alt="Evidence" className="h-full w-full object-cover" /></div></td>
                                   <td className="px-4"><span className="text-[11px] font-bold text-neutral-900 uppercase tracking-wide leading-tight">{incident.title}</span></td>
                                   <td className="px-4"><div className="flex items-center gap-2"><span className="text-[11px] font-bold text-neutral-700">{incident.location}</span></div></td>
                                   <td className="px-4"><div className="flex items-center gap-2"><span className="text-[11px] font-bold text-neutral-700">{incident.camera}</span></div></td>
                                   <td className="px-4 text-right"><span className="text-[10px] font-medium text-neutral-500 font-mono">{incident.timestamp}</span></td>
                                   <td className="px-4 text-right"><div className="flex items-center justify-end gap-2"><Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); openAssignModal(incident); }} className="h-7 w-7 p-0 rounded-full border-neutral-200 hover:border-[#00775B] hover:text-[#00775B]" title="Assign"><User className="w-3.5 h-3.5" /></Button><Button size="sm" onClick={(e) => { e.stopPropagation(); openAckModal(incident); }} className="h-7 w-7 p-0 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-sm" title="Acknowledge"><Check className="w-3.5 h-3.5" /></Button></div></td>
                                </tr>
                              );
                            })}
                         </tbody>
                      </table>
                    </div>
                    {/* Pagination - Simplistic */}
                    {tableTotalPages > 1 && (
                      <div className="p-2 border-t border-neutral-100 flex justify-center bg-neutral-50">
                        <div className="flex gap-1">
                          {Array.from({ length: tableTotalPages }).map((_, i) => (
                             <button key={i} onClick={() => setTablePage(i + 1)} className={cn("h-6 w-6 text-xs rounded-sm flex items-center justify-center transition-colors", tablePage === i + 1 ? "bg-[#00775B] text-white font-bold" : "text-neutral-500 hover:bg-neutral-200")}>{i + 1}</button>
                          ))}
                        </div>
                      </div>
                    )}
                 </div>
               )}
               </>
             )}
            </>
          )}
          </section>
        </div>
      </div>

      {/* Incident Detail Modal */}
      <IncidentDetailModal 
        incident={currentIncident}
        open={detailModalOpen}
        onOpenChange={(open) => {
          setDetailModalOpen(open);
          if (!open) setCurrentIncident(null);
        }}
        onAcknowledge={() => {
          setDetailModalOpen(false);
          setAckModalOpen(true);
        }}
        onAssign={() => {
          setDetailModalOpen(false);
          setAssignModalOpen(true);
        }}
      />
    </div>
  );
}
