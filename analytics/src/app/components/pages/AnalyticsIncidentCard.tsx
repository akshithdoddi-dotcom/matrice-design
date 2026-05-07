import { useState } from "react";
import { cn } from "@/app/lib/utils";
import { 
  TrendingUp, Clock, CheckCircle2, XCircle, AlertTriangle, Check
} from "lucide-react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import { Incident } from "@/app/data/mockData";
import { SeverityIcon } from "@/app/components/ui/SeverityIcon";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";

// Extended incident type with analytics
export interface AnalyticsIncident extends Incident {
  confidence: number;
  bboxAreaGrowth?: number[];
  spreadRate?: number;
  responseLatency?: number;
  targetType: "person" | "vehicle" | "environmental" | "object";
  validationStatus?: "confirmed" | "false_positive" | "testing" | null;
  acknowledged?: boolean;
  acknowledgedAt?: string;
}

// Get severity config
const getSeverityConfig = (severity: string) => {
  switch (severity) {
    case "critical":
      return {
        headerBg: "bg-[#E7000B]",
        lightBg: "bg-[#FFE5E7]",
        brightColor: "#E7000B",
        borderColor: "border-[#E7000B]",
        textColor: "text-[#E7000B]",
      };
    case "high":
      return {
        headerBg: "bg-[#EA580C]",
        lightBg: "bg-[#FEEFE7]",
        brightColor: "#EA580C",
        borderColor: "border-[#EA580C]",
        textColor: "text-[#EA580C]",
      };
    case "medium":
      return {
        headerBg: "bg-[#E19A04]",
        lightBg: "bg-[#FFF7E6]",
        brightColor: "#E19A04",
        borderColor: "border-[#E19A04]",
        textColor: "text-[#E19A04]",
      };
    case "low":
      return {
        headerBg: "bg-[#2B7FFF]",
        lightBg: "bg-[#E5F0FF]",
        brightColor: "#2B7FFF",
        borderColor: "border-[#2B7FFF]",
        textColor: "text-[#2B7FFF]",
      };
    case "info":
      return {
        headerBg: "bg-[#64748B]",
        lightBg: "bg-[#F0F2F4]",
        brightColor: "#64748B",
        borderColor: "border-[#64748B]",
        textColor: "text-[#64748B]",
      };
    case "resolved":
      return {
        headerBg: "bg-[#00A63E]",
        lightBg: "bg-[#E5FFEF]",
        brightColor: "#00A63E",
        borderColor: "border-[#00A63E]",
        textColor: "text-[#00A63E]",
      };
    default:
      return {
        headerBg: "bg-[#64748B]",
        lightBg: "bg-[#F0F2F4]",
        brightColor: "#64748B",
        borderColor: "border-[#64748B]",
        textColor: "text-[#64748B]",
      };
  }
};

// Mini Sparkline Chart
const SpreadRateSparkline = ({ data, color }: { data: number[], color: string }) => {
  const chartData = data.map((value, index) => ({ index, value }));
  
  return (
    <div className="h-10 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={color} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={color} 
            strokeWidth={2} 
            fill={`url(#gradient-${color})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

interface AnalyticsIncidentCardProps {
  incident: AnalyticsIncident;
  onValidate?: (id: string, status: "confirmed" | "false_positive" | "testing") => void;
  selected?: boolean;
  onClick?: () => void;
  compact?: boolean;
  onSelect?: (id: string) => void;
}

export const AnalyticsIncidentCard = ({ 
  incident, 
  onValidate,
  selected = false,
  onClick,
  compact = false,
  onSelect
}: AnalyticsIncidentCardProps) => {
  const [validationStatus, setValidationStatus] = useState(incident.validationStatus);
  const config = getSeverityConfig(incident.severity);

  const handleValidation = (status: "confirmed" | "false_positive" | "testing") => {
    setValidationStatus(status);
    onValidate?.(incident.incidentId, status);
  };

  const handleClick = () => {
    if (onSelect) {
      onSelect(incident.incidentId);
    } else if (onClick) {
      onClick();
    }
  };

  // Compact mode - simple row
  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={cn(
          "flex items-center gap-3 px-3 py-2 rounded border transition-all cursor-pointer",
          "bg-white",
          selected 
            ? "border-[#00775B] ring-2 ring-[#00775B] shadow-md" 
            : "border-neutral-200 hover:border-neutral-300 hover:shadow-sm"
        )}
      >
        {/* Selection Indicator */}
        {selected && (
          <div className="bg-[#00775B] rounded-full p-0.5 shrink-0">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
        )}

        {/* Severity Icon */}
        <div 
          className="flex items-center justify-center rounded size-6 shrink-0"
          style={{ backgroundColor: config.brightColor }}
        >
          <SeverityIcon severity={incident.severity} mode="inverse" className="w-3.5 h-3.5" />
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0">
          <p className={cn("text-xs font-bold truncate", config.textColor)}>
            {incident.title}
          </p>
        </div>

        {/* Timestamp */}
        <div className="text-[10px] font-mono text-neutral-500 shrink-0">
          {incident.timestamp}
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={cn(
        "group relative overflow-hidden rounded-sm border transition-all duration-300 cursor-pointer",
        "bg-[#FAFAFA] shadow-sm",
        selected 
          ? "border-[#00775B] ring-2 ring-[#00775B] shadow-lg" 
          : "border-[#E2E8F0] hover:border-[#00775B]/30 hover:shadow-md"
      )}
      style={{ width: "250px" }}
    >
      {/* Selection Indicator - Top Right Badge */}
      {selected && (
        <div className="absolute top-2 right-2 z-30 bg-[#00775B] rounded-full p-1 shadow-lg">
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        </div>
      )}

      {/* Header Bar */}
      <div 
        className={cn(
          "flex items-center justify-between px-3 h-12 border-b border-[#00775B]/20",
          config.headerBg
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {/* Severity Icon */}
          <div 
            className={cn(
              "flex items-center justify-center rounded size-6 shrink-0",
              config.headerBg
            )}
          >
            <SeverityIcon severity={incident.severity} mode="inverse" className="w-3.5 h-3.5" />
          </div>

          {/* Title & Timestamp */}
          <div className="flex flex-col min-w-0 overflow-hidden flex-1">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate text-white leading-tight">
              {incident.title}
            </span>
            <span className="text-[9px] font-medium font-mono text-white">
              {incident.timestamp}
            </span>
          </div>
        </div>

        {/* Incident ID */}
        <div className="text-[10px] font-medium font-mono text-white shrink-0 pl-2">
          #{incident.id}
        </div>
      </div>

      {/* Image Area */}
      <div className="relative w-full h-[160px] bg-[#F1F5F9] border-b border-[#E2E8F0] overflow-hidden">
        <ImageWithFallback 
          src={incident.image}
          alt={incident.title}
          className="w-full h-full object-cover"
        />

        {/* Camera Badge - Top Left */}
        <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded-[2px] backdrop-blur-md">
          <span className="text-[10px] font-bold text-white">{incident.camera}</span>
        </div>

        {/* Location Badge - Top Right */}
        <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-[2px] backdrop-blur-md">
          <span className="text-[10px] font-bold text-white">{incident.location}</span>
        </div>
      </div>

      {/* Analytics Footer - Expandable Section */}
      <div className={cn(
        "transition-all duration-300 overflow-hidden",
        config.lightBg
      )}>
        {/* Confidence & Response Time */}
        <div className="px-3 py-2 flex items-center justify-between border-b border-neutral-200">
          <div className="flex items-center gap-2">
            <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">Confidence</span>
            <span className={cn("text-xs font-bold font-mono", config.textColor)}>
              {incident.confidence}%
            </span>
          </div>
          {incident.responseLatency && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-neutral-400" />
              <span className={cn(
                "text-xs font-bold font-mono",
                incident.responseLatency > 120 ? "text-red-600" : "text-neutral-600"
              )}>
                {incident.responseLatency}s
              </span>
            </div>
          )}
        </div>

        {/* Spread Rate Sparkline (for environmental incidents) */}
        {incident.bboxAreaGrowth && incident.bboxAreaGrowth.length > 0 && (
          <div className="px-3 py-2 border-b border-neutral-200">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider">
                Spread Rate
              </span>
              {incident.spreadRate && (
                <span className={cn(
                  "text-xs font-bold font-mono flex items-center gap-1",
                  incident.spreadRate > 100 ? "text-red-600" : "text-amber-600"
                )}>
                  <TrendingUp className="w-3 h-3" />
                  +{incident.spreadRate}%
                </span>
              )}
            </div>
            <SpreadRateSparkline data={incident.bboxAreaGrowth} color={config.brightColor} />
          </div>
        )}

        {/* AI Validation Section */}
        <div className="px-3 py-2">
          <div className="text-[9px] uppercase font-bold text-neutral-500 tracking-wider mb-2">
            Validation
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleValidation("confirmed");
              }}
              className={cn(
                "px-2 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all border",
                validationStatus === "confirmed"
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-green-600 hover:text-green-600"
              )}
            >
              <CheckCircle2 className="w-3 h-3 mx-auto mb-0.5" />
              <span className="block text-[8px]">Confirm</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleValidation("false_positive");
              }}
              className={cn(
                "px-2 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all border",
                validationStatus === "false_positive"
                  ? "bg-red-600 text-white border-red-600"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-red-600 hover:text-red-600"
              )}
            >
              <XCircle className="w-3 h-3 mx-auto mb-0.5" />
              <span className="block text-[8px]">False</span>
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleValidation("testing");
              }}
              className={cn(
                "px-2 py-1.5 rounded text-[9px] font-bold uppercase tracking-wider transition-all border",
                validationStatus === "testing"
                  ? "bg-amber-600 text-white border-amber-600"
                  : "bg-white text-neutral-600 border-neutral-200 hover:border-amber-600 hover:text-amber-600"
              )}
            >
              <AlertTriangle className="w-3 h-3 mx-auto mb-0.5" />
              <span className="block text-[8px]">Test</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};