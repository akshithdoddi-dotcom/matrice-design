import { useState, useEffect, useRef, lazy, Suspense } from "react";
const TrainingApp = lazy(() => import("@training/app/App"));
const MarketplaceApp = lazy(() => import("@marketplace/app/App"));
const SupportApp = lazy(() => import("@support/app/App"));
const Support2App = lazy(() => import("@support2/app/App"));
const FEComponentsApp = lazy(() => import("@fe-common/preview/App"));
const InternalApp = lazy(() => import("@internal/app/App"));
import { SeverityIcon } from "@fe-common/components/ui/SeverityIcon";
import { Page } from "@/app/components/layout/Sidebar";
import { AppLayout } from "@/app/components/layout/AppLayout";
import { IncidentCard } from "@/app/components/dashboard/IncidentCard";
import { IncidentDetailModal } from "@/app/components/dashboard/IncidentDetailModal";
import { Button } from "@fe-common/components/ui/Button";
import { GridBackground } from "@/app/components/layout/GridBackground";
import { Bell, ChevronLeft, ChevronRight, AlertTriangle, CheckCircle2, Clock, Filter, LayoutGrid, List, Check, User, Video, MapPin, X, ChevronDown, Info, Trash2, Copy, ImageIcon, Activity, ExternalLink, Search, ShieldCheck, Hexagon, Zap, Shield, PanelLeft, Command, Sun, Moon, LogOut, Settings } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { Checkbox } from "@fe-common/components/ui/Checkbox";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { PersonaSwitcher, Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { MonitoringWidgets } from "@/app/components/dashboard/MonitoringWidgets";
import { ManagerWidgets } from "@/app/components/dashboard/ManagerWidgets";
import { DirectorDashboard } from "@/app/components/dashboard/DirectorDashboard";
import { VMSPlatform } from "@/app/components/pages/VMSPlatform";
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
import { ServiceAnalytics } from "@/app/components/pages/ServiceAnalytics";
import { SettingsPage } from "@/app/components/pages/Settings";
import { StaffMonitoring } from "@/app/components/pages/StaffMonitoring";
import { MicroservicesPage } from "@/app/components/pages/MicroservicesPage";
import { IncidentLifecyclePage } from "@/app/components/pages/IncidentLifecyclePage";
import { Dashboard2Page } from "@/app/components/pages/Dashboard2Page";
import { ALL_INCIDENTS, PROJECTS_DATA, CAMERA_GROUPS, CLIENTS, EMPLOYEES, Incident, IncidentSeverity, LOCATIONS, APPLICATIONS, SEVERITIES } from "@/app/data/mockData";
import { DataGrid, DataGridColumn, MonoCell, InterCell, GridActions, GridActionButton, StatusCapsule } from "@fe-common/components/ui/DataGrid";

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

type ActiveApp = "analytics" | "training" | "marketplace" | "support" | "support2" | "fe-common" | "vms" | "internal";

/** Root switcher — picks which app to render based on platform selection */
export default function App() {
  const [activeApp, setActiveApp] = useState<ActiveApp>("analytics");
  const handleSwitch = (app: string) => setActiveApp(app as ActiveApp);

  if (activeApp === "vms")         return <VMSPlatform onPlatformSwitch={handleSwitch} />;
  if (activeApp === "training")    return <Suspense fallback={null}><TrainingApp      onPlatformSwitch={handleSwitch} /></Suspense>;
  if (activeApp === "marketplace") return <Suspense fallback={null}><MarketplaceApp   onPlatformSwitch={handleSwitch} /></Suspense>;
  if (activeApp === "support")     return <Suspense fallback={null}><SupportApp       onPlatformSwitch={handleSwitch} /></Suspense>;
  if (activeApp === "support2")    return <Suspense fallback={null}><Support2App      onPlatformSwitch={handleSwitch} /></Suspense>;
  if (activeApp === "fe-common")   return <Suspense fallback={null}><FEComponentsApp  onPlatformSwitch={handleSwitch} /></Suspense>;
  if (activeApp === "internal")    return <Suspense fallback={null}><InternalApp      onPlatformSwitch={handleSwitch} /></Suspense>;
  return <AnalyticsApp onPlatformSwitch={handleSwitch} />;
}

/** Analytics app — all existing UI lives here */
function AnalyticsApp({ onPlatformSwitch }: { onPlatformSwitch: (app: string) => void }) {
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
    dashboard:              "Dashboard",
    "dashboard-2":          "Dashboard 2",
    "incident-lifecycle":   "Incident Lifecycle",
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
    "microservices":      "Microservices",
  };

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage} isDark={isDark} onToggleDark={() => setIsDark(d => !d)} onPlatformSwitch={onPlatformSwitch}>
      {activePage === "settings" ? (
        <SettingsPage isDark={isDark} onToggleDark={() => setIsDark(d => !d)} />
      ) : null}
      {activePage === "incident-lifecycle" ? <IncidentLifecyclePage /> : null}
      {activePage === "dashboard-2" ? <Dashboard2Page /> : null}
      <div className={cn("bg-[#F8FAFC] dark:bg-[#020617] font-sans text-neutral-900 dark:text-slate-100 min-h-full", (activePage === "settings" || activePage === "incident-lifecycle" || activePage === "dashboard-2") && "hidden")}>
        <div className="max-w-full overflow-x-hidden">

          <section className="w-full">
            {activePage === "volume" && <VolumeAnalytics persona={activePersona} />}
            {activePage === "incident" && <IncidentAnalytics persona={activePersona} />}
            {activePage === "zone" && <ZoneAnalytics persona={activePersona} />}
            {activePage === "quality" && <QualityAnalytics persona={activePersona} />}
            {activePage === "safety" && <SafetyAnalytics persona={activePersona} sidebarCollapsed={false} />}
            {activePage === "identity" && <IdentityAnalytics persona={activePersona} />}
            {activePage === "facial-recognition" && <FacialRecognition />}
            {activePage === "license-plates" && <LicensePlates />}
            {activePage === "cameras" && <Cameras />}
            {activePage === "metrics" && <MetricsRules />}
            {activePage === "compliance" && <Compliance />}
            {activePage === "design-system" && <DesignSystem />}
            {activePage === "service" && <ServiceAnalytics />}
            {activePage === "sample-analytics" && <StaffMonitoring />}
            {activePage === "microservices" && <MicroservicesPage />}

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
                    <DataGrid<Incident>
                      columns={[
                        {
                          key: "select",
                          header: "",
                          headerContent: (
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={isAllSelected}
                                onCheckedChange={toggleSelectAll}
                                className={cn(
                                  "border-neutral-300 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B]",
                                  isIndeterminate && "data-[state=checked]:bg-[#00775B]"
                                )}
                              />
                            </div>
                          ),
                          width: "44px",
                          align: "center",
                          render: (row, _h) => (
                            <div onClick={(e) => e.stopPropagation()}>
                              <Checkbox
                                checked={selectedIncidents.has(row.id)}
                                onCheckedChange={() => toggleSelection(row.id)}
                              />
                            </div>
                          ),
                        },
                        {
                          key: "severity",
                          header: "Severity",
                          width: "60px",
                          align: "center",
                          render: (row, _h) => (
                            <div
                              className={cn(
                                "h-6 w-6 inline-flex items-center justify-center rounded-[2px] shadow-sm",
                                getSeverityBadgeColor(row.severity)
                              )}
                            >
                              <SeverityIcon severity={row.severity} mode="inverse" className="w-[12.6px] h-[12.6px]" />
                            </div>
                          ),
                        },
                        {
                          key: "incidentId",
                          header: "ID",
                          width: "100px",
                          render: (row, hovered) => (
                            <MonoCell hovered={hovered} isPrimary color="#64748B" hoveredColor="#0F172A" fontSize={11}>
                              {row.incidentId}
                            </MonoCell>
                          ),
                        },
                        {
                          key: "snapshot",
                          header: "Snapshot",
                          width: "88px",
                          render: (row, hovered) => (
                            <div
                              className={cn(
                                "h-12 w-[72px] rounded-[2px] overflow-hidden border transition-colors bg-neutral-100",
                                hovered ? "border-[#00775B]/30" : "border-neutral-200"
                              )}
                            >
                              <ImageWithFallback src={row.image} alt="Evidence" className="h-full w-full object-cover" />
                            </div>
                          ),
                        },
                        {
                          key: "title",
                          header: "Incident Details",
                          render: (row, hovered) => (
                            <span
                              style={{
                                fontSize: 11,
                                fontWeight: 700,
                                textTransform: "uppercase",
                                letterSpacing: "0.04em",
                                color: hovered ? "#0F172A" : "#374151",
                                transition: "color 120ms ease",
                              }}
                            >
                              {row.title}
                            </span>
                          ),
                        },
                        {
                          key: "location",
                          header: "Location",
                          width: "140px",
                          render: (row, hovered) => (
                            <InterCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#0F172A">
                              {row.location}
                            </InterCell>
                          ),
                        },
                        {
                          key: "camera",
                          header: "Camera",
                          width: "120px",
                          render: (row, hovered) => (
                            <InterCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#0F172A">
                              {row.camera}
                            </InterCell>
                          ),
                        },
                        {
                          key: "timestamp",
                          header: "Date & Time",
                          width: "108px",
                          align: "right",
                          render: (row, hovered) => (
                            <MonoCell hovered={hovered} fontSize={10} color="#94A3B8" hoveredColor="#475569">
                              {row.timestamp}
                            </MonoCell>
                          ),
                        },
                        {
                          key: "actions",
                          header: "",
                          width: "80px",
                          align: "right",
                          render: (row, hovered) => (
                            <div className="flex justify-end pr-1">
                              <GridActions visible={hovered}>
                                <GridActionButton
                                  title="Assign"
                                  hoverColor="#2B7FFF"
                                  onClick={(e) => { e.stopPropagation(); openAssignModal(row); }}
                                >
                                  <User className="w-3.5 h-3.5" />
                                </GridActionButton>
                                <GridActionButton
                                  title="Acknowledge"
                                  hoverColor="#00A63E"
                                  onClick={(e) => { e.stopPropagation(); openAckModal(row); }}
                                >
                                  <Check className="w-3.5 h-3.5" />
                                </GridActionButton>
                              </GridActions>
                            </div>
                          ),
                        },
                      ]}
                      data={paginatedTableIncidents}
                      onRowClick={(row) => openDetailModal(row)}
                    />
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
    </AppLayout>
  );
}
