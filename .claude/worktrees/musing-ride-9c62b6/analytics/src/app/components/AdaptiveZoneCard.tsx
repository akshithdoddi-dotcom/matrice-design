import { useState } from "react";
import { ZoneCard as ZoneCardType } from "@/app/data/mockData";
import { Shield, Clock, Users, AlertTriangle, Camera, TrendingUp, Gauge, ArrowRight, Activity, Flag, Eye } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";

const getZoneCategory = (app: string): "intrusion" | "queue" | "directional" | "parking" | "mustering" => {
  if (app.includes("Intrusion") || app.includes("Loitering") || app.includes("Entry")) return "intrusion";
  if (app.includes("Queue") || app.includes("Wait")) return "queue";
  if (app.includes("Wrong-way") || app.includes("Directional")) return "directional";
  if (app.includes("Parking")) return "parking";
  return "mustering";
};

const getSecondsAgo = (zoneId: string): number => {
  const hash = zoneId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return Math.floor((hash % 30) + 1);
};

interface AdaptiveZoneCardProps {
  zone: ZoneCardType;
  onClick: () => void;
  scrollRef?: (el: HTMLDivElement | null) => void;
  isHighlighted?: boolean;
}

export const AdaptiveZoneCard = ({ zone, onClick, scrollRef, isHighlighted }: AdaptiveZoneCardProps) => {
  const category = getZoneCategory(zone.app);
  const isViolation = zone.status === "critical" || zone.status === "violation";
  const secondsAgo = getSecondsAgo(zone.id);

  // Intrusion Card
  if (category === "intrusion") {
    const timeInArea = zone.lastIncident || "2m ago";
    
    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          isViolation && !isHighlighted && "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.5)]",
          !isViolation && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-bold uppercase text-neutral-800 truncate leading-[15px]">{zone.zoneName}</h3>
            <p className="text-[8px] text-neutral-500 truncate leading-[12px]">{zone.app}</p>
          </div>
          <Shield className={cn("w-4 h-4 shrink-0 ml-1", isViolation ? "text-[#E7000B]" : "text-neutral-400")} />
        </div>

        {/* Main Count */}
        <div className="mb-2 text-center">
          <div className={cn(
            "text-[20px] font-mono font-bold leading-[28px]",
            isViolation ? "text-[#E7000B]" : "text-neutral-800"
          )}>
            {zone.currentCount}
          </div>
          <div className="text-[8px] text-neutral-500 uppercase tracking-[0.2px] leading-[12px]">
            Detected Objects
          </div>
        </div>

        {/* Dark Info Box */}
        <div className="bg-[#0f172a] rounded px-2 py-2 mb-2 space-y-1">
          <div className="flex justify-between text-[9px] font-mono leading-[13.5px]">
            <span className="text-[#94a3b8]">Time in Area:</span>
            <span className={cn("font-bold", isViolation ? "text-[#ff6467]" : "text-[#00956d]")}>{timeInArea}</span>
          </div>
          <div className="flex justify-between text-[9px] font-mono leading-[13.5px]">
            <span className="text-[#94a3b8]">Last Detection:</span>
            <span className="font-bold text-white">{timeInArea}</span>
          </div>
        </div>

        {/* CTAs - Side circular buttons slide in from left and right */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-white/95 hover:bg-white border border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0"
            title="Flag"
          >
            <Flag className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:-translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0"
            title="Verify"
          >
            <Eye className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Camera Badge */}
        <div className="absolute top-2 right-2 bg-[rgba(15,23,42,0.7)] text-white text-[7px] font-mono px-1 py-0.5 rounded leading-[10.5px]">
          {zone.camera}
        </div>
        
        {/* Pulse Indicator */}
        {isViolation && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E7000B] rounded-full animate-ping opacity-75" />}
      </motion.div>
    );
  }

  // Queue Card
  if (category === "queue") {
    const waitTimeSeconds = parseInt(zone.dwellTime.split('m')[0]) * 60;
    const slaLimit = 300;
    const slaPercentage = Math.min((waitTimeSeconds / slaLimit) * 100, 100);
    const breached = waitTimeSeconds > slaLimit;

    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          breached && !isHighlighted && "border-[#EA580C] bg-[#FEEFE7]",
          !breached && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-bold uppercase text-neutral-800 truncate leading-[15px]">{zone.zoneName}</h3>
            <p className="text-[8px] text-neutral-500 truncate leading-[12px]">{zone.app}</p>
          </div>
          <Clock className={cn("w-4 h-4 shrink-0 ml-1", breached ? "text-[#EA580C]" : "text-[#00775B]")} />
        </div>

        {/* Metrics Row */}
        <div className="flex justify-between items-start mb-2 pb-2 border-b border-neutral-100">
          <div>
            <div className="text-[9px] text-neutral-500 uppercase tracking-[0.225px] leading-[13.5px] mb-0.5">Queue Length</div>
            <div className="text-[18px] font-mono font-bold text-neutral-800 leading-[28px]">{zone.queueLength || 8}</div>
          </div>
          <div className="text-right">
            <div className="text-[9px] text-neutral-500 uppercase tracking-[0.225px] leading-[13.5px] mb-0.5">Avg Wait Time</div>
            <div className={cn("text-[18px] font-mono font-bold leading-[28px]", breached ? "text-[#EA580C]" : "text-[#00775B]")}>
              {zone.dwellTime}
            </div>
          </div>
        </div>

        {/* SLA Status */}
        <div className="mb-2">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[9px] text-neutral-500">Last Hour Trend</span>
            {breached && (
              <span className="px-2 py-0.5 bg-[#EA580C] text-white text-[8px] font-bold uppercase rounded leading-[12px]">
                SLA Breach
              </span>
            )}
          </div>
          {/* Simple trend visualization */}
          <div className="h-[8px] bg-neutral-100 rounded-full overflow-hidden">
            <div className={cn("h-full", breached ? "bg-[#EA580C]" : "text-[#00775B]")} style={{ width: `${slaPercentage}%` }} />
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-[8px] text-neutral-500">SLA: 5 min</span>
            <span className="text-[8px] text-neutral-500">{Math.round(slaPercentage)}%</span>
          </div>
        </div>

        {/* CTAs - Side circular buttons slide in from left and right */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-white/95 hover:bg-white border border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0"
            title="Flag"
          >
            <Flag className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:-translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0"
            title="Verify"
          >
            <Eye className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Camera Badge */}
        <div className="absolute top-2 right-2 bg-[rgba(15,23,42,0.7)] text-white text-[7px] font-mono px-1 py-0.5 rounded leading-[10.5px]">
          {zone.camera}
        </div>
      </motion.div>
    );
  }

  // Directional Card
  if (category === "directional") {
    const wrongWayEvents = zone.status === "violation" ? Math.floor(Math.random() * 8) + 5 : Math.floor(Math.random() * 5);
    const isViolationFlow = wrongWayEvents > 5;

    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          isViolationFlow && !isHighlighted && "border-[#EA580C] bg-[#FEEFE7]",
          !isViolationFlow && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-bold uppercase text-neutral-800 truncate leading-[15px]">{zone.zoneName}</h3>
            <p className="text-[8px] text-neutral-500 truncate leading-[12px]">{zone.app}</p>
          </div>
          <ArrowRight className="w-4 h-4 shrink-0 ml-1 text-[#00775B]" />
        </div>

        {/* Violation Count */}
        <div className="mb-2 text-center pb-2 border-b border-neutral-100">
          <div className={cn("text-[24px] font-mono font-bold leading-[32px]", isViolationFlow ? "text-[#EA580C]" : "text-neutral-800")}>
            {wrongWayEvents}
          </div>
          <div className="text-[8px] text-neutral-500 uppercase tracking-[0.2px] leading-[12px]">
            Wrong-Way Violations (Last Hour)
          </div>
        </div>

        {/* Violation Intensity */}
        <div className="mb-2">
          <div className="text-[9px] text-neutral-500 mb-1">Violation Intensity</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-[24px] bg-neutral-100 rounded overflow-hidden relative">
              <div 
                className="h-full bg-[#EA580C] flex items-center justify-center"
                style={{ width: `${(wrongWayEvents / 15) * 100}%` }}
              >
                <span className="text-[10px] font-mono font-bold text-white">{wrongWayEvents}</span>
              </div>
            </div>
            <span className="text-[9px] font-mono text-neutral-500">/ 15</span>
          </div>
        </div>

        {/* Flow Direction */}
        {zone.directionalFlow && (
          <div className="flex items-center gap-2 mb-2 text-[9px]">
            <div className="flex-1 flex items-center gap-1">
              <div className="w-2 h-2 bg-[#00775B] rounded-full" />
              <span className="text-neutral-500">In:</span>
              <span className="font-mono font-bold text-neutral-800">{zone.directionalFlow.inbound}%</span>
            </div>
            <ArrowRight className="w-3 h-3 text-neutral-400" />
            <div className="flex-1 flex items-center gap-1 justify-end">
              <span className="font-mono font-bold text-neutral-800">{zone.directionalFlow.outbound}%</span>
              <span className="text-neutral-500">:Out</span>
              <div className="w-2 h-2 bg-neutral-400 rounded-full" />
            </div>
          </div>
        )}

        {/* CTAs - Side circular buttons slide in from left and right */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-white/95 hover:bg-white border border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0"
            title="Flag"
          >
            <Flag className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:-translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0"
            title="Verify"
          >
            <Eye className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Camera Badge */}
        <div className="absolute top-2 right-2 bg-[rgba(15,23,42,0.7)] text-white text-[7px] font-mono px-1 py-0.5 rounded leading-[10.5px]">
          {zone.camera}
        </div>
      </motion.div>
    );
  }

  // Parking Card
  if (category === "parking") {
    const spotOccupancy = zone.occupancy;
    const totalSpots = zone.maxCapacity || 100;
    const occupiedSpots = zone.currentCount || Math.round((spotOccupancy / 100) * totalSpots);
    const availableSpots = totalSpots - occupiedSpots;
    
    return (
      <motion.div
        ref={scrollRef}
        layout
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden group",
          isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
          spotOccupancy > 90 && !isHighlighted && "border-[#E19A04] bg-[#FFF7E6]",
          spotOccupancy <= 90 && !isHighlighted && "border-neutral-200 bg-white"
        )}
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-[10px] font-bold uppercase text-neutral-800 truncate leading-[15px]">{zone.zoneName}</h3>
            <p className="text-[8px] text-neutral-500 truncate leading-[12px]">{zone.app}</p>
          </div>
          <Activity className="w-4 h-4 shrink-0 ml-1 text-[#00775B]"/>
        </div>

        {/* Compact Stats Grid - Single Row */}
        <div className="grid grid-cols-3 gap-1.5 mb-2">
          <div className="bg-neutral-50 rounded px-1.5 py-1 border border-neutral-100">
            <div className="text-[7px] text-neutral-500 mb-0.5">Occupied</div>
            <div className="text-[14px] font-mono font-bold text-neutral-800 leading-none">{occupiedSpots}</div>
          </div>
          <div className="bg-[#00775B]/5 rounded px-1.5 py-1 border border-[#00775B]/10">
            <div className="text-[7px] text-neutral-500 mb-0.5">Available</div>
            <div className="text-[14px] font-mono font-bold text-[#00775B] leading-none">{availableSpots}</div>
          </div>
          <div className={cn(
            "rounded px-1.5 py-1 border",
            spotOccupancy > 90 ? "bg-[#E19A04]/5 border-[#E19A04]/10" : "bg-neutral-50 border-neutral-100"
          )}>
            <div className="text-[7px] text-neutral-500 mb-0.5">Usage</div>
            <div className={cn(
              "text-[14px] font-mono font-bold leading-none",
              spotOccupancy > 90 ? "text-[#E19A04]" : "text-neutral-800"
            )}>{spotOccupancy}%</div>
          </div>
        </div>

        {/* Compact Progress Bar */}
        <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
          <div 
            className={cn(
              "h-full transition-all duration-300",
              spotOccupancy > 90 ? "bg-[#E19A04]" : "bg-[#00775B]"
            )} 
            style={{ width: `${spotOccupancy}%` }}
          />
        </div>

        {/* CTAs - Side circular buttons slide in from left and right */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-white/95 hover:bg-white border border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0"
            title="Flag"
          >
            <Flag className="w-4 h-4 mx-auto" />
          </button>
        </div>
        <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:-translate-x-2 transition-transform duration-300 ease-out z-20">
          <button 
            onClick={(e) => { e.stopPropagation(); }}
            className="h-9 w-9 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0"
            title="Verify"
          >
            <Eye className="w-4 h-4 mx-auto" />
          </button>
        </div>

        {/* Camera Badge */}
        <div className="absolute top-2 right-2 bg-[rgba(15,23,42,0.7)] text-white text-[7px] font-mono px-1 py-0.5 rounded leading-[10.5px]">
          {zone.camera}
        </div>
      </motion.div>
    );
  }

  // Mustering/Crowd Card
  const isCriticalOccupancy = zone.occupancy > 90;
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (zone.occupancy / 100) * circumference;
  
  return (
    <motion.div
      ref={scrollRef}
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "rounded border p-3 hover:border-[#00775B]/50 transition-all cursor-pointer relative overflow-hidden",
        isHighlighted && "border-[#00775B] border-2 shadow-[0_0_12px_rgba(0,119,91,0.4)] ring-2 ring-[#00775B]/20",
        isCriticalOccupancy && !isHighlighted && "border-[#E7000B] bg-[#FFE5E7] shadow-[0_0_15px_rgba(231,0,11,0.4)]",
        !isCriticalOccupancy && zone.occupancy > 75 && !isHighlighted && "border-[#EA580C] bg-[#FEEFE7]",
        zone.occupancy <= 75 && !isHighlighted && "border-neutral-200 bg-white"
      )}
      onClick={onClick}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-[10px] font-bold uppercase text-neutral-800 truncate leading-[15px]">{zone.zoneName}</h3>
          <p className="text-[8px] text-neutral-500 truncate leading-[12px]">{zone.app}</p>
        </div>
        <Users className={cn("w-4 h-4 shrink-0 ml-1", isCriticalOccupancy ? "text-[#E7000B]" : "text-[#00775B]")} />
      </div>

      {/* People Count */}
      <div className="mb-2 text-center pb-2 border-b border-neutral-100">
        <div className="font-mono text-center leading-[32px]">
          <span className={cn("text-[24px] font-bold", isCriticalOccupancy ? "text-[#E7000B]" : "text-neutral-800")}>
            {zone.currentCount}
          </span>
          <span className="text-[14px] text-neutral-400"> / </span>
          <span className="text-[14px] text-neutral-500">{zone.maxCapacity}</span>
        </div>
        <div className="text-[8px] text-neutral-500 uppercase tracking-[0.2px] leading-[12px]">
          People in Zone ({zone.occupancy}% Capacity)
        </div>
      </div>

      {/* Circular Gauge */}
      <div className="flex justify-center mb-2">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke="#E5E7EB"
              strokeWidth="6"
              fill="none"
            />
            <circle
              cx="40"
              cy="40"
              r={radius}
              stroke={isCriticalOccupancy ? "#E7000B" : zone.occupancy > 75 ? "#EA580C" : "#00775B"}
              strokeWidth="6"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "text-[18px] font-mono font-bold leading-[28px]",
              isCriticalOccupancy ? "text-[#E7000B]" : zone.occupancy > 75 ? "text-[#EA580C]" : "text-[#00775B]"
            )}>
              {zone.occupancy}%
            </div>
          </div>
        </div>
      </div>

      {/* CTAs - Side circular buttons slide in from left and right */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-2 transition-transform duration-300 ease-out z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="h-9 w-9 rounded-full bg-white/95 hover:bg-white border border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0"
          title="Flag"
        >
          <Flag className="w-4 h-4 mx-auto" />
        </button>
      </div>
      <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:-translate-x-2 transition-transform duration-300 ease-out z-20">
        <button 
          onClick={(e) => { e.stopPropagation(); }}
          className="h-9 w-9 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0"
          title="Verify"
        >
          <Eye className="w-4 h-4 mx-auto" />
        </button>
      </div>

      {/* Camera Badge */}
      <div className="absolute top-2 right-2 bg-[rgba(15,23,42,0.7)] text-white text-[7px] font-mono px-1 py-0.5 rounded leading-[10.5px]">
        {zone.camera}
      </div>
      
      {/* Pulse Indicator */}
      {isCriticalOccupancy && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#E7000B] rounded-full animate-ping opacity-75" />}
    </motion.div>
  );
};