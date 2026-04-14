import { useState, useRef, useEffect } from "react";
import { ShieldCheck, ChevronDown, Download, Clock, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import type { QualityAppId, QualityTerminology } from "./data/mockData";

const APP_OPTIONS: { id: QualityAppId; label: string; group: "defect" | "safety" }[] = [
  // Defect apps
  { id: "bottle",        label: "Bottle Defect",          group: "defect" },
  { id: "pcb",           label: "PCB Defect",             group: "defect" },
  { id: "welding",       label: "Welding Defect",         group: "defect" },
  { id: "car-damage",    label: "Car Damage",             group: "defect" },
  { id: "corrosion",     label: "Corrosion Detection",    group: "defect" },
  { id: "road-damage",   label: "Road Damage",            group: "defect" },
  { id: "pothole",       label: "Pothole Detection",      group: "defect" },
  { id: "phone-screen",  label: "Screen Defect",          group: "defect" },
  { id: "assembly",      label: "Assembly Line QC",       group: "defect" },
  { id: "food-quality",  label: "Food Quality",           group: "defect" },
  { id: "textile",       label: "Textile Defect",         group: "defect" },
  { id: "solar-panel",   label: "Solar Panel QC",         group: "defect" },
  { id: "semiconductor", label: "Semiconductor Inspection",group: "defect" },
  { id: "metal-surface", label: "Metal Surface",          group: "defect" },
  { id: "glass",         label: "Glass Defect",           group: "defect" },
  { id: "paint",         label: "Paint Defect",           group: "defect" },
  { id: "wire-harness",  label: "Wire Harness QC",        group: "defect" },
  { id: "packaging",     label: "Packaging Inspection",   group: "defect" },
  { id: "wood",          label: "Wood Defect",            group: "defect" },
  // Safety / compliance apps
  { id: "ppe",           label: "PPE Detection",          group: "safety" },
  { id: "mask",          label: "Mask Detection",         group: "safety" },
  { id: "construction",  label: "Construction Safety",    group: "safety" },
];

const TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["15m", "1h", "6h", "24h"],
  manager:    ["Today", "This Week"],
  director:   ["This Month", "This Quarter"],
};

interface QualityHeaderProps {
  persona: Persona;
  terminology: QualityTerminology;
  activeApp: QualityAppId;
  onAppChange: (app: QualityAppId) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
}

export const QualityHeader = ({
  persona,
  terminology,
  activeApp,
  onAppChange,
  timeRange,
  onTimeRangeChange,
}: QualityHeaderProps) => {
  const [isAppOpen, setIsAppOpen]       = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [secondsAgo, setSecondsAgo]     = useState(2);
  const appRef    = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (persona !== "monitoring") return;
    const id = setInterval(() => setSecondsAgo((s) => (s >= 30 ? 2 : s + 1)), 1000);
    return () => clearInterval(id);
  }, [persona]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (appRef.current && !appRef.current.contains(e.target as Node)) setIsAppOpen(false);
      if (exportRef.current && !exportRef.current.contains(e.target as Node)) setIsExportOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const ranges = TIME_RANGES[persona];

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 bg-white border border-neutral-200 rounded-md px-4 py-3 shadow-sm">
      {/* Left: Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-[#E5FFF9] text-[#00775B] rounded-sm">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-800">
            Quality Analytics
          </h2>
          <p className="text-[10px] uppercase tracking-wider mt-0.5 text-[#00775B]">
            {terminology.appLabel}
          </p>
        </div>
      </div>

      {/* Right: Controls */}
      <div className="flex flex-wrap items-center gap-2">
        {/* App Selector */}
        <div className="relative" ref={appRef}>
          <button
            onClick={() => setIsAppOpen(!isAppOpen)}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all bg-white text-neutral-600 hover:border-neutral-300",
              isAppOpen ? "border-[#00775B]" : "border-neutral-200"
            )}
          >
            <span>{terminology.appLabel}</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", isAppOpen && "rotate-180")} />
          </button>
          {isAppOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden max-h-[360px] overflow-y-auto">
              {/* Defect apps group */}
              <div className="px-3 pt-2 pb-1">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Defect Detection</p>
              </div>
              {APP_OPTIONS.filter(o => o.group === "defect").map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => { onAppChange(opt.id); setIsAppOpen(false); }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium cursor-pointer flex items-center justify-between text-neutral-600 hover:bg-neutral-50",
                    activeApp === opt.id && "text-[#00775B] bg-[#E5FFF9]"
                  )}
                >
                  <span>{opt.label}</span>
                  {activeApp === opt.id && <Check className="w-3 h-3" />}
                </div>
              ))}
              {/* Safety apps group */}
              <div className="px-3 pt-2 pb-1 border-t border-neutral-100 mt-1">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-neutral-400">Safety & Compliance</p>
              </div>
              {APP_OPTIONS.filter(o => o.group === "safety").map((opt) => (
                <div
                  key={opt.id}
                  onClick={() => { onAppChange(opt.id); setIsAppOpen(false); }}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium cursor-pointer flex items-center justify-between text-neutral-600 hover:bg-neutral-50",
                    activeApp === opt.id && "text-[#00775B] bg-[#E5FFF9]"
                  )}
                >
                  <span>{opt.label}</span>
                  {activeApp === opt.id && <Check className="w-3 h-3" />}
                </div>
              ))}
              <div className="pb-1" />
            </div>
          )}
        </div>

        {/* Time Range Pills */}
        <div className="flex items-center rounded-sm border border-neutral-200 bg-white p-0.5 shadow-sm">
          {ranges.map((r) => (
            <button
              key={r}
              onClick={() => onTimeRangeChange(r)}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all",
                timeRange === r
                  ? "bg-[#00775B] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Export */}
        <div className="relative" ref={exportRef}>
          <button
            onClick={() => setIsExportOpen(!isExportOpen)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-sm border border-neutral-200 bg-white text-xs font-bold text-neutral-600 hover:border-neutral-300 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
            <ChevronDown className={cn("w-3 h-3 transition-transform", isExportOpen && "rotate-180")} />
          </button>
          {isExportOpen && (
            <div className="absolute top-full right-0 mt-1 w-40 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden">
              {["PDF Report", "CSV Data", "PNG Image"].map((opt) => (
                <div
                  key={opt}
                  onClick={() => setIsExportOpen(false)}
                  className="px-3 py-2 text-xs font-medium cursor-pointer text-neutral-600 hover:bg-neutral-50"
                >
                  {opt}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Last Updated */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-neutral-200 bg-neutral-50 text-[10px] font-mono text-neutral-500">
          {persona === "monitoring" ? (
            <>
              <span className="w-2 h-2 rounded-full bg-[#00775B] animate-pulse" />
              <span>Updated {secondsAgo}s ago</span>
            </>
          ) : (
            <>
              <Clock className="w-3 h-3" />
              <span>{persona === "manager" ? "As of today" : "Mar 2026"}</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
