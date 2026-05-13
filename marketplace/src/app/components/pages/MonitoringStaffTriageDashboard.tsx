import { useState, useEffect, useMemo } from "react";
import { ALL_INCIDENTS, Incident } from "@/app/data/mockData";
import { 
  AlertTriangle, Activity, Clock, TrendingUp, Bell, 
  CheckCircle2, XCircle, Flag, Eye, EyeOff, Zap, 
  Flame, Shield, Users, Car, AlertOctagon, Lock,
  PlayCircle, Star, Bookmark, Settings, Target,
  BarChart3, Radio, Timer, Video, VideoOff, Check, ChevronDown
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis, AreaChart, Area } from "recharts";

// Enhanced Incident Type with analytics data
interface EnhancedIncident extends Incident {
  confidence: number; // 0-100
  acknowledged: boolean;
  acknowledgedAt?: string;
  targetType: "person" | "vehicle" | "object" | "environmental";
  motionIntensity?: number; // 0-100 for movement-based incidents
  dwellTime?: number; // minutes for stationary objects
  bboxAreaGrowth?: number[]; // array of bbox area percentages over time
  spreadRate?: number; // percentage growth rate
  responseLatency?: number; // seconds since detection
  falsePositiveRisk?: "low" | "medium" | "high";
}

// Mock enhanced incidents with analytics
const generateEnhancedIncidents = (): EnhancedIncident[] => {
  return ALL_INCIDENTS.map((incident, index) => ({
    ...incident,
    confidence: Math.floor(Math.random() * 40) + 60, // 60-100%
    acknowledged: Math.random() > 0.3,
    acknowledgedAt: Math.random() > 0.5 ? "2m ago" : undefined,
    targetType: 
      incident.application.includes("Safety") || incident.application.includes("Behavioral") ? "person" :
      incident.application.includes("Traffic") ? "vehicle" :
      incident.application.includes("Fire") ? "environmental" : "object",
    motionIntensity: incident.title.includes("Fighting") || incident.title.includes("Running") ? 85 : 
                     incident.title.includes("Loitering") ? 15 : undefined,
    dwellTime: incident.title.includes("Abandoned") || incident.title.includes("Loitering") ? 12 : undefined,
    bboxAreaGrowth: incident.title.includes("Fire") || incident.title.includes("Flood") ? 
                    [10, 15, 25, 40, 60, 85] : 
                    incident.title.includes("Crowd") ? [20, 22, 28, 35, 42, 48] : undefined,
    spreadRate: incident.title.includes("Fire") ? 145 : 
                incident.title.includes("Flood") ? 78 : 
                incident.title.includes("Gas") ? 92 : undefined,
    responseLatency: incident.acknowledged ? undefined : Math.floor(Math.random() * 180) + 30, // 30-210s
    falsePositiveRisk: incident.confidence < 70 ? "high" : incident.confidence < 85 ? "medium" : "low",
  }));
};

// Protocol Checklists per incident type
const PROTOCOL_CHECKLISTS: Record<string, string[]> = {
  "Fire / Flame Detection": [
    "1. Trigger fire alarm system",
    "2. Notify Fire Department (911)",
    "3. Alert on-site security team",
    "4. Initiate evacuation protocol",
    "5. Activate suppression systems",
  ],
  "Weapon Detected": [
    "1. Lock down affected zone",
    "2. Notify law enforcement",
    "3. Alert security response team",
    "4. Monitor subject movement",
    "5. Prepare incident report",
  ],
  "Perimeter Breach": [
    "1. Dispatch security patrol",
    "2. Lock perimeter access points",
    "3. Track intruder movement",
    "4. Review adjacent camera feeds",
    "5. Prepare incident documentation",
  ],
  "Fighting Detection": [
    "1. Alert security personnel",
    "2. Monitor escalation status",
    "3. Request backup if needed",
    "4. Document all parties involved",
    "5. Prepare incident report",
  ],
  "PPE Violation": [
    "1. Notify floor supervisor",
    "2. Log safety violation",
    "3. Issue warning to worker",
    "4. Update compliance metrics",
  ],
  "Pipe Gas Leakage": [
    "1. Notify Site Manager",
    "2. Trigger fire alarm",
    "3. Seal Valve B-04",
    "4. Evacuate affected zones",
    "5. Contact gas safety team",
  ],
};

// Get icon for target type
const getTargetIcon = (type: string) => {
  switch (type) {
    case "person": return Users;
    case "vehicle": return Car;
    case "environmental": return Flame;
    case "object": return AlertOctagon;
    default: return Target;
  }
};

// Pulse Header Component
const PulseHeader = ({ incidents }: { incidents: EnhancedIncident[] }) => {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const criticalCount = incidents.filter(i => !i.acknowledged && i.severity === "critical").length;
  const highCount = incidents.filter(i => !i.acknowledged && i.severity === "high").length;
  
  // Calculate Mean Time to Acknowledge (MTTA)
  const acknowledgedIncidents = incidents.filter(i => i.acknowledged);
  const avgResponseTime = acknowledgedIncidents.length > 0
    ? Math.floor(acknowledgedIncidents.reduce((sum, i) => sum + (i.responseLatency || 45), 0) / acknowledgedIncidents.length)
    : 45;

  // System Throughput (Camera Status)
  const totalCameras = 42;
  const camerasOnline = 38;
  const camerasOffline = totalCameras - camerasOnline;
  const systemHealth = Math.floor((camerasOnline / totalCameras) * 100);

  return (
    <div className="bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 rounded-lg border-2 border-neutral-700 p-6 shadow-2xl relative overflow-hidden">
      {/* Animated background grid */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `
            linear-gradient(to right, #00775B 1px, transparent 1px),
            linear-gradient(to bottom, #00775B 1px, transparent 1px)
          `,
          backgroundSize: '40px 40px'
        }} />
      </div>

      <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* System Status */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
            <div className="text-xs font-mono text-green-400">SYSTEM ACTIVE</div>
          </div>
          <div className="text-[10px] font-mono text-neutral-500">
            {currentTime.toLocaleTimeString()}
          </div>
        </div>

        {/* Active Critical Incidents */}
        <div className="bg-red-950/50 backdrop-blur-sm rounded-lg px-4 py-3 border border-red-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <AlertOctagon className="w-4 h-4 text-red-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-red-300">Critical Alerts</span>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl font-data font-bold tabular-nums",
              criticalCount > 0 ? "text-red-500 animate-pulse" : "text-red-700"
            )}>
              {criticalCount}
            </span>
            {highCount > 0 && (
              <span className="text-lg font-data tabular-nums text-orange-500">+{highCount} high</span>
            )}
          </div>
        </div>

        {/* Mean Time to Acknowledge (MTTA) */}
        <div className="bg-amber-950/50 backdrop-blur-sm rounded-lg px-4 py-3 border border-amber-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Timer className="w-4 h-4 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300">MTTA</span>
            </div>
            <span className="text-[9px] font-data text-amber-600">Mean Time to Ack</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl font-data font-bold tabular-nums",
              avgResponseTime > 60 ? "text-amber-500" : "text-amber-400"
            )}>
              {avgResponseTime}
            </span>
            <span className="text-sm font-data text-amber-600">sec</span>
          </div>
          {avgResponseTime > 90 && (
            <div className="text-[9px] text-amber-300 mt-1 flex items-center gap-1">
              <TrendingUp className="w-3 h-3" />
              <span>Falling behind target</span>
            </div>
          )}
        </div>

        {/* System Throughput (Camera Status) */}
        <div className="bg-blue-950/50 backdrop-blur-sm rounded-lg px-4 py-3 border border-blue-800/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-blue-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300">System Throughput</span>
            </div>
            <span className="text-[9px] font-data text-blue-600">Camera Online</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className={cn(
              "text-4xl font-data font-bold tabular-nums",
              camerasOffline > 5 ? "text-red-500" : "text-blue-400"
            )}>
              {camerasOnline}
            </span>
            <span className="text-sm font-data tabular-nums text-blue-600">/{totalCameras}</span>
          </div>
          {camerasOffline > 0 && (
            <div className="text-[9px] text-neutral-400 mt-1 flex items-center gap-1">
              <VideoOff className="w-3 h-3" />
              <span>{camerasOffline} offline</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Mini Sparkline Chart
const EvolutionSparkline = ({ data, color = "#00775B" }: { data: number[], color?: string }) => {
  const chartData = data.map((value, index) => ({ index, value }));
  
  return (
    <div className="h-12 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.6} />
              <stop offset="100%" stopColor={color} stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <Area type="monotone" dataKey="value" stroke={color} strokeWidth={2} fill={`url(#gradient-${color})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

// Enhanced Incident Card with Dynamic Sizing
const DynamicIncidentCard = ({ 
  incident, 
  onAcknowledge, 
  onResolve,
  onTag,
  onViewDetails,
  isExpanded,
}: { 
  incident: EnhancedIncident;
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onTag: (id: string, tag: string) => void;
  onViewDetails: (incident: EnhancedIncident) => void;
  isExpanded: boolean;
}) => {
  const TargetIcon = getTargetIcon(incident.targetType);

  const severityColors = {
    critical: { 
      bg: "from-red-950 to-red-900", 
      border: "border-red-500", 
      text: "text-red-400", 
      badge: "bg-red-500",
      brightBorder: "#E7000B",
      lightBg: "#FFE5E7"
    },
    high: { 
      bg: "from-orange-950 to-orange-900", 
      border: "border-orange-500", 
      text: "text-orange-400", 
      badge: "bg-orange-500",
      brightBorder: "#EA580C",
      lightBg: "#FEEFE7"
    },
    medium: { 
      bg: "from-amber-950 to-amber-900", 
      border: "border-amber-500", 
      text: "text-amber-400", 
      badge: "bg-amber-500",
      brightBorder: "#E19A04",
      lightBg: "#FFF7E6"
    },
    low: { 
      bg: "from-blue-950 to-blue-900", 
      border: "border-blue-500", 
      text: "text-blue-400", 
      badge: "bg-blue-500",
      brightBorder: "#2B7FFF",
      lightBg: "#E5F0FF"
    },
    info: { 
      bg: "from-neutral-900 to-neutral-800", 
      border: "border-neutral-600", 
      text: "text-neutral-400", 
      badge: "bg-neutral-600",
      brightBorder: "#64748B",
      lightBg: "#F0F2F4"
    },
    resolved: { 
      bg: "from-green-950 to-green-900", 
      border: "border-green-600", 
      text: "text-green-400", 
      badge: "bg-green-600",
      brightBorder: "#00A63E",
      lightBg: "#E5FFEF"
    },
  };

  const colors = severityColors[incident.severity];

  return (
    <div
      className={cn(
        "relative rounded-lg overflow-hidden transition-all duration-300 cursor-pointer group",
        `bg-gradient-to-br ${colors.bg}`,
        // Selection state - NO size change, just border and glow
        isExpanded 
          ? "ring-4 ring-[#2B7FFF] shadow-2xl shadow-blue-500/30 scale-[1.02]" 
          : `border-2 ${colors.border}`,
        !incident.acknowledged && incident.severity === "critical" && "animate-pulse shadow-2xl shadow-red-500/30",
        incident.acknowledged && "opacity-60"
      )}
      onClick={() => onViewDetails(incident)}
    >
      {/* Visual Bridge Arrow - Points to Sidebar when selected */}
      {isExpanded && (
        <div className="absolute -right-3 top-1/2 -translate-y-1/2 z-50">
          <div className="w-0 h-0 border-t-[12px] border-t-transparent border-b-[12px] border-b-transparent border-l-[12px] border-l-[#2B7FFF] drop-shadow-lg animate-pulse" />
        </div>
      )}

      {/* Selection Badge - Top Right */}
      {isExpanded && (
        <div className="absolute top-2 right-2 z-30 bg-[#2B7FFF] rounded-full p-1.5 shadow-lg ring-2 ring-[#2B7FFF]/30">
          <Check className="w-4 h-4 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Header */}
      <div className={cn("px-3 py-2 flex items-center justify-between", colors.badge)}>
        <div className="flex items-center gap-2">
          <TargetIcon className="w-4 h-4 text-white" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-white">
            {incident.incidentId}
          </span>
        </div>
        <div className="flex items-center gap-2">
          {!incident.acknowledged && (
            <div className="flex items-center gap-1">
              <Bell className="w-3 h-3 text-white animate-bounce" />
              <span className="text-[9px] font-mono text-white">
                {incident.responseLatency}s
              </span>
            </div>
          )}
          <span className="text-[10px] font-mono text-white">{incident.timestamp}</span>
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Title & Confidence */}
        <div className="space-y-1">
          <h3 className={cn("text-sm font-bold", colors.text)}>{incident.title}</h3>
          <div className="flex items-center gap-2">
            <div className="text-[10px] font-mono text-neutral-500">{incident.location}</div>
            <div className={cn(
              "text-[9px] font-mono px-1.5 py-0.5 rounded",
              incident.confidence > 90 ? "bg-green-900/50 text-green-400" :
              incident.confidence > 75 ? "bg-amber-900/50 text-amber-400" :
              "bg-red-900/50 text-red-400"
            )}>
              {incident.confidence}% conf
            </div>
          </div>
        </div>

        {/* Application-Specific Visualizations */}
        {incident.bboxAreaGrowth && (
          <div className="space-y-1">
            <div className="text-[9px] font-mono text-neutral-500 uppercase">BBox Area Growth</div>
            <EvolutionSparkline data={incident.bboxAreaGrowth} color="#ef4444" />
            {incident.spreadRate && incident.spreadRate > 100 && (
              <div className="text-[9px] text-red-400 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                Sharp upward curve - incident spreading
              </div>
            )}
          </div>
        )}

        {incident.motionIntensity !== undefined && (
          <div className="space-y-1">
            <div className="text-[9px] font-mono text-neutral-500 uppercase flex items-center justify-between">
              <span>Motion Intensity</span>
              <span className={cn(
                "font-bold",
                incident.motionIntensity > 70 ? "text-red-400" : "text-amber-400"
              )}>
                {incident.motionIntensity}%
              </span>
            </div>
            <div className="h-2 bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  incident.motionIntensity > 70 ? "bg-red-500" : "bg-amber-500"
                )}
                style={{ width: `${incident.motionIntensity}%` }}
              />
            </div>
          </div>
        )}

        {incident.dwellTime !== undefined && (
          <div className="flex items-center gap-2 text-amber-400">
            <Clock className="w-3.5 h-3.5" />
            <span className="text-xs font-mono">Dwell: {incident.dwellTime}m</span>
          </div>
        )}

        {/* Detected Objects */}
        {incident.detectedObjects && incident.detectedObjects.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {incident.detectedObjects.map((obj, idx) => (
              <span key={idx} className="text-[9px] font-mono bg-neutral-800 text-neutral-400 px-1.5 py-0.5 rounded">
                {obj}
              </span>
            ))}
          </div>
        )}

        {/* Quick Actions */}
        <div className="flex gap-2 pt-2 border-t border-neutral-800">
          {!incident.acknowledged ? (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAcknowledge(incident.incidentId);
              }}
              className="flex-1 px-3 py-1.5 bg-[#00775B] hover:bg-[#009e78] text-white text-xs font-bold rounded transition-colors"
            >
              Acknowledge
            </button>
          ) : (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onResolve(incident.incidentId);
              }}
              className="flex-1 px-3 py-1.5 bg-green-700 hover:bg-green-600 text-white text-xs font-bold rounded transition-colors"
            >
              Resolve
            </button>
          )}
          <button className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 text-xs font-bold rounded transition-colors">
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

// Action Sidebar
const ActionSidebar = ({ 
  selectedIncident,
  onTag,
}: { 
  selectedIncident: EnhancedIncident | null;
  onTag: (id: string, tag: string) => void;
}) => {
  const [checkedSteps, setCheckedSteps] = useState<number[]>([]);

  if (!selectedIncident) {
    return (
      <div className="w-80 bg-neutral-900 border-l border-neutral-800 p-4 flex items-center justify-center">
        <div className="text-center text-neutral-600">
          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
          <p className="text-sm">Select an incident to view actions</p>
        </div>
      </div>
    );
  }

  const protocols = PROTOCOL_CHECKLISTS[selectedIncident.title] || [
    "1. Assess incident severity",
    "2. Notify appropriate personnel",
    "3. Document incident details",
    "4. Monitor situation",
  ];

  // Get severity colors for header
  const severityHeaderColors: Record<string, { bg: string; text: string; border: string }> = {
    critical: { bg: "#FFE5E7", text: "#E7000B", border: "#E7000B" },
    high: { bg: "#FEEFE7", text: "#EA580C", border: "#EA580C" },
    medium: { bg: "#FFF7E6", text: "#E19A04", border: "#E19A04" },
    low: { bg: "#E5F0FF", text: "#2B7FFF", border: "#2B7FFF" },
    info: { bg: "#F0F2F4", text: "#64748B", border: "#64748B" },
    resolved: { bg: "#E5FFEF", text: "#00A63E", border: "#00A63E" },
  };

  const headerColors = severityHeaderColors[selectedIncident.severity];

  // Check if at least one protocol step is checked
  const hasCheckedSteps = checkedSteps.length > 0;

  const toggleStep = (idx: number) => {
    setCheckedSteps(prev => 
      prev.includes(idx) ? prev.filter(i => i !== idx) : [...prev, idx]
    );
  };

  return (
    <div className="w-80 bg-neutral-900 border-l-4 flex flex-col" style={{ borderLeftColor: headerColors.border }}>
      {/* Header with Severity Color Sync */}
      <div className="p-4 border-b border-neutral-800" style={{ backgroundColor: headerColors.bg }}>
        <div className="flex items-center gap-2 mb-3">
          <Flag className="w-4 h-4" style={{ color: headerColors.text }} />
          <h3 className="text-sm font-bold" style={{ color: headerColors.text }}>Action Required</h3>
        </div>
        
        {/* Selection Badge - NOW HANDLING */}
        <div className="rounded-lg p-3 border-2" style={{ 
          backgroundColor: "rgba(0, 0, 0, 0.2)", 
          borderColor: headerColors.border 
        }}>
          <div className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: headerColors.text }}>
            NOW HANDLING
          </div>
          <div className="text-xs font-bold font-mono" style={{ color: headerColors.text }}>
            {selectedIncident.incidentId} | {selectedIncident.title}
          </div>
          <div className="text-[10px] font-mono mt-1" style={{ color: headerColors.text, opacity: 0.7 }}>
            {selectedIncident.location} • {selectedIncident.timestamp}
          </div>
        </div>
      </div>

      {/* Protocol Checklist */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Protocol Checklist</h4>
          <div className="space-y-2">
            {protocols.map((step, idx) => (
              <label key={idx} className="flex items-start gap-2 cursor-pointer group">
                <input 
                  type="checkbox"
                  checked={checkedSteps.includes(idx)}
                  onChange={() => toggleStep(idx)}
                  className="mt-0.5 w-4 h-4 rounded border-neutral-700 bg-neutral-800 checked:bg-[#00775B] checked:border-[#00775B] transition-colors"
                />
                <span className="text-xs text-neutral-300 group-hover:text-white transition-colors flex-1">
                  {step}
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Quick Tagging - Only enabled after checking at least one protocol step */}
        <div className="space-y-2 pt-4 border-t border-neutral-800">
          <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">AI Learning Tags</h4>
          {!hasCheckedSteps && (
            <div className="text-[10px] text-amber-400 bg-amber-900/20 border border-amber-700/50 rounded px-2 py-1.5 mb-2">
              ⚠️ Complete at least one protocol step before tagging
            </div>
          )}
          <div className="space-y-2">
            <button
              onClick={() => hasCheckedSteps && onTag(selectedIncident.incidentId, "confirmed")}
              disabled={!hasCheckedSteps}
              className={cn(
                "w-full px-3 py-2 border text-xs font-bold rounded transition-colors text-left flex items-center gap-2",
                hasCheckedSteps 
                  ? "bg-green-900/50 hover:bg-green-900 border-green-700 text-green-400 cursor-pointer"
                  : "bg-neutral-800/50 border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              Confirmed Incident
            </button>
            <button
              onClick={() => hasCheckedSteps && onTag(selectedIncident.incidentId, "false-positive")}
              disabled={!hasCheckedSteps}
              className={cn(
                "w-full px-3 py-2 border text-xs font-bold rounded transition-colors text-left flex items-center gap-2",
                hasCheckedSteps 
                  ? "bg-red-900/50 hover:bg-red-900 border-red-700 text-red-400 cursor-pointer"
                  : "bg-neutral-800/50 border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50"
              )}
            >
              <XCircle className="w-3.5 h-3.5" />
              False Positive
            </button>
            <button
              onClick={() => hasCheckedSteps && onTag(selectedIncident.incidentId, "testing")}
              disabled={!hasCheckedSteps}
              className={cn(
                "w-full px-3.5 h-3.5 py-2 border text-xs font-bold rounded transition-colors text-left flex items-center gap-2",
                hasCheckedSteps 
                  ? "bg-amber-900/50 hover:bg-amber-900 border-amber-700 text-amber-400 cursor-pointer"
                  : "bg-neutral-800/50 border-neutral-700 text-neutral-600 cursor-not-allowed opacity-50"
              )}
            >
              <Activity className="w-3.5 h-3.5" />
              Testing/Drill
            </button>
          </div>
        </div>

        {/* Incident Details */}
        <div className="space-y-2 pt-4 border-t border-neutral-800">
          <h4 className="text-xs font-bold uppercase text-neutral-500 tracking-wider">Details</h4>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between">
              <span className="text-neutral-500">Location:</span>
              <span className="text-neutral-300 font-mono">{selectedIncident.location}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Camera:</span>
              <span className="text-neutral-300 font-mono">{selectedIncident.camera}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Confidence:</span>
              <span className={cn(
                "font-mono font-bold",
                selectedIncident.confidence > 90 ? "text-green-400" :
                selectedIncident.confidence > 75 ? "text-amber-400" : "text-red-400"
              )}>
                {selectedIncident.confidence}%
              </span>
            </div>
            {selectedIncident.falsePositiveRisk && (
              <div className="flex justify-between">
                <span className="text-neutral-500">FP Risk:</span>
                <span className={cn(
                  "text-xs font-bold uppercase",
                  selectedIncident.falsePositiveRisk === "high" ? "text-red-400" :
                  selectedIncident.falsePositiveRisk === "medium" ? "text-amber-400" : "text-green-400"
                )}>
                  {selectedIncident.falsePositiveRisk}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main Dashboard
export const MonitoringStaffTriageDashboard = () => {
  const [incidents, setIncidents] = useState<EnhancedIncident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<EnhancedIncident | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [filterMode, setFilterMode] = useState<"all" | "unacknowledged" | "watchlist">("unacknowledged");
  const [filterZone, setFilterZone] = useState<string>("all");
  const [filterApplication, setFilterApplication] = useState<string>("all");
  const [groupByType, setGroupByType] = useState(false);
  const [showWatchlistManager, setShowWatchlistManager] = useState(false);

  useEffect(() => {
    setIncidents(generateEnhancedIncidents());
    // Load watchlist from localStorage
    const saved = localStorage.getItem('incident-watchlist');
    if (saved) {
      setWatchlist(JSON.parse(saved));
    }
  }, []);

  // Save watchlist to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('incident-watchlist', JSON.stringify(watchlist));
  }, [watchlist]);

  // Extract unique zones and applications
  const uniqueZones = ["all", ...Array.from(new Set(ALL_INCIDENTS.map(i => i.location)))];
  const uniqueApplications = ["all", ...Array.from(new Set(ALL_INCIDENTS.map(i => i.application)))];

  const handleAcknowledge = (id: string) => {
    setIncidents(incidents.map(i => 
      i.incidentId === id ? { ...i, acknowledged: true, acknowledgedAt: "Just now" } : i
    ));
  };

  const handleResolve = (id: string) => {
    setIncidents(incidents.filter(i => i.incidentId !== id));
    if (selectedIncident?.incidentId === id) {
      setSelectedIncident(null);
    }
  };

  const handleTag = (id: string, tag: string) => {
    console.log(`Tagged ${id} as ${tag}`);
    // In real implementation, this would send to AI training pipeline
  };

  const handleToggleWatchlist = (id: string) => {
    setWatchlist(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const filteredIncidents = useMemo(() => {
    let filtered = incidents;
    
    if (filterMode === "unacknowledged") {
      filtered = filtered.filter(i => !i.acknowledged);
    } else if (filterMode === "watchlist") {
      filtered = filtered.filter(i => watchlist.includes(i.incidentId));
    }

    // Apply zone filter
    if (filterZone !== "all") {
      filtered = filtered.filter(i => i.location === filterZone);
    }

    // Apply application filter
    if (filterApplication !== "all") {
      filtered = filtered.filter(i => i.application === filterApplication);
    }

    // Sort by severity and confidence
    return filtered.sort((a, b) => {
      const severityOrder = { critical: 0, high: 1, medium: 2, low: 3, info: 4, resolved: 5 };
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;
      return b.confidence - a.confidence;
    });
  }, [incidents, filterMode, watchlist, filterZone, filterApplication]);

  return (
    <div className="space-y-4 h-[calc(100vh-100px)] flex flex-col">
      {/* Pulse Header */}
      <PulseHeader incidents={incidents} />

      {/* Filter Controls */}
      <div className="flex items-center gap-3 px-1 flex-wrap">
        <div className="flex items-center gap-2 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
          <button
            onClick={() => setFilterMode("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded transition-colors",
              filterMode === "all" ? "bg-[#00775B] text-white" : "text-neutral-400 hover:text-white"
            )}
          >
            All ({incidents.length})
          </button>
          <button
            onClick={() => setFilterMode("unacknowledged")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded transition-colors",
              filterMode === "unacknowledged" ? "bg-[#00775B] text-white" : "text-neutral-400 hover:text-white"
            )}
          >
            Unacked ({incidents.filter(i => !i.acknowledged).length})
          </button>
          <button
            onClick={() => setFilterMode("watchlist")}
            className={cn(
              "px-3 py-1.5 text-xs font-bold rounded transition-colors flex items-center gap-1.5",
              filterMode === "watchlist" ? "bg-[#00775B] text-white" : "text-neutral-400 hover:text-white"
            )}
          >
            <Star className="w-3.5 h-3.5" />
            Watchlist ({watchlist.length})
          </button>
        </div>

        {/* Zone Filter */}
        <select
          value={filterZone}
          onChange={(e) => setFilterZone(e.target.value)}
          className="px-3 py-1.5 text-xs font-medium border border-neutral-700 rounded bg-neutral-900 text-neutral-300 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#00775B]/50"
        >
          <option value="all">All Zones</option>
          {uniqueZones.slice(1).map(zone => (
            <option key={zone} value={zone}>{zone}</option>
          ))}
        </select>

        {/* Application Filter */}
        <select
          value={filterApplication}
          onChange={(e) => setFilterApplication(e.target.value)}
          className="px-3 py-1.5 text-xs font-medium border border-neutral-700 rounded bg-neutral-900 text-neutral-300 hover:border-neutral-600 focus:outline-none focus:ring-2 focus:ring-[#00775B]/50"
        >
          <option value="all">All Applications</option>
          {uniqueApplications.slice(1).map(app => (
            <option key={app} value={app}>{app}</option>
          ))}
        </select>

        {/* Group by Type Toggle */}
        <button
          onClick={() => setGroupByType(!groupByType)}
          className={cn(
            "px-3 py-1.5 text-xs font-bold rounded transition-colors border",
            groupByType
              ? "bg-[#00775B] text-white border-[#00775B]"
              : "bg-neutral-900 text-neutral-400 border-neutral-700 hover:text-white hover:border-neutral-600"
          )}
        >
          {groupByType ? "✓ Grouped" : "Group by Type"}
        </button>

        <div className="flex-1" />

        <div className="text-xs text-neutral-500 font-mono">
          Showing {filteredIncidents.length} incidents
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex gap-4 overflow-hidden">
        {/* Abnormality-First Grid */}
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 auto-rows-max">
            {filteredIncidents.map((incident) => (
              <DynamicIncidentCard
                key={incident.incidentId}
                incident={incident}
                onAcknowledge={handleAcknowledge}
                onResolve={handleResolve}
                onTag={handleTag}
                onViewDetails={setSelectedIncident}
                isExpanded={selectedIncident?.incidentId === incident.incidentId}
              />
            ))}
          </div>

          {filteredIncidents.length === 0 && (
            <div className="flex items-center justify-center h-64 text-neutral-600">
              <div className="text-center">
                <CheckCircle2 className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-bold">No incidents to display</p>
                <p className="text-sm mt-2">All incidents have been acknowledged</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Sidebar */}
        <ActionSidebar selectedIncident={selectedIncident} onTag={handleTag} />
      </div>
    </div>
  );
};