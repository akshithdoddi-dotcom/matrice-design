import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Download,
  Plus,
  RefreshCw,
  ScanLine,
  Settings,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import {
  IDENTITY_APP_OPTIONS,
  type IdentityAppOption,
  type IdentityTerminology,
  type IdentityType,
} from "../IdentityAnalytics";
import { FilterDropdown } from "../../ui/FilterDropdown";

const TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["15m", "1h", "6h", "24h"],
  manager: ["Today", "This Week", "Last 7 Days"],
  director: ["This Month", "Last 3 Months", "YTD"],
};

const REFRESH_INTERVALS = ["5s", "15s", "30s", "1 min"];

interface IdentityHeaderProps {
  persona: Persona;
  identityType: IdentityType;
  terminology: IdentityTerminology;
  activeApp: IdentityAppOption;
  onIdentityTypeChange: (identityType: IdentityType) => void;
  onAppChange: (appId: string) => void;
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  onManage: () => void;
  onSettings: () => void;
}

export const IdentityHeader = ({
  persona,
  identityType,
  terminology,
  activeApp,
  onIdentityTypeChange,
  onAppChange,
  timeRange,
  onTimeRangeChange,
  onManage,
  onSettings,
}: IdentityHeaderProps) => {
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshOpen, setIsRefreshOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("15s");
  const [secondsAgo, setSecondsAgo] = useState(12);

  const exportRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<HTMLDivElement>(null);

  const activeApps = useMemo(
    () => IDENTITY_APP_OPTIONS.filter((option) => option.identityType === identityType),
    [identityType]
  );

  useEffect(() => {
    if (persona !== "monitoring") return;
    const id = setInterval(() => {
      setSecondsAgo((current) => (current >= 59 ? 5 : current + 1));
    }, 1000);
    return () => clearInterval(id);
  }, [persona]);

  useEffect(() => {
    const handler = (event: MouseEvent) => {
      const target = event.target as Node;
      if (exportRef.current && !exportRef.current.contains(target)) setIsExportOpen(false);
      if (refreshRef.current && !refreshRef.current.contains(target)) setIsRefreshOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">

        {/* FR / LP type tabs — leading element */}
        <div className="rounded-sm border border-neutral-200 bg-neutral-50 p-0.5">
          <button
            onClick={() => onIdentityTypeChange("FACE")}
            className={cn(
              "rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all",
              identityType === "FACE"
                ? "bg-[#00775B] text-white shadow-sm"
                : "text-neutral-500 hover:bg-white"
            )}
          >
            Face Recognition
          </button>
          <button
            onClick={() => onIdentityTypeChange("PLATE")}
            className={cn(
              "rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all",
              identityType === "PLATE"
                ? "bg-[#00775B] text-white shadow-sm"
                : "text-neutral-500 hover:bg-white"
            )}
          >
            License Plate
          </button>
        </div>

        {/* Right-side controls */}
        <div className="flex flex-1 flex-wrap items-center justify-end gap-2">

          {/* App selector — shared FilterDropdown */}
          <FilterDropdown
            label="App"
            options={activeApps.map((opt) => ({
              value: opt.id,
              label: opt.label,
              sublabel: opt.siteLabel,
            }))}
            value={activeApp.id}
            onValueChange={onAppChange}
            className="w-[260px]"
          />

          {/* Refresh interval (monitoring only) */}
          {persona === "monitoring" && (
            <div className="relative" ref={refreshRef}>
              <button
                onClick={() => setIsRefreshOpen((current) => !current)}
                className={cn(
                  "flex items-center gap-1.5 rounded-sm border px-3 py-1.5 text-xs font-bold text-neutral-600 transition-all hover:border-neutral-300",
                  isRefreshOpen ? "border-[#00775B]" : "border-neutral-200"
                )}
              >
                <RefreshCw className="h-3.5 w-3.5 text-[#00775B]" />
                <span>{refreshInterval}</span>
                <ChevronDown
                  className={cn("h-3 w-3 transition-transform", isRefreshOpen && "rotate-180")}
                />
              </button>

              {isRefreshOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-lg">
                  {REFRESH_INTERVALS.map((option) => (
                    <button
                      key={option}
                      onClick={() => { setRefreshInterval(option); setIsRefreshOpen(false); }}
                      className={cn(
                        "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-neutral-600 hover:bg-neutral-50",
                        refreshInterval === option && "text-[#00775B]"
                      )}
                    >
                      <span>{option}</span>
                      {refreshInterval === option && <Check className="h-3.5 w-3.5" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Time range pills */}
          <div className="flex items-center rounded-sm border border-neutral-200 bg-white p-0.5 shadow-sm">
            {TIME_RANGES[persona].map((range) => (
              <button
                key={range}
                onClick={() => onTimeRangeChange(range)}
                className={cn(
                  "rounded-sm px-3 py-1 text-[10px] font-bold uppercase tracking-wide transition-all",
                  timeRange === range
                    ? "bg-[#00775B] text-white shadow-sm"
                    : "text-neutral-500 hover:bg-neutral-50"
                )}
              >
                {range}
              </button>
            ))}
          </div>

          {/* Export dropdown */}
          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen((current) => !current)}
              className="flex items-center gap-1.5 rounded-sm border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 transition-all hover:border-neutral-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown
                className={cn("h-3 w-3 transition-transform", isExportOpen && "rotate-180")}
              />
            </button>

            {isExportOpen && (
              <div className="absolute right-0 top-full z-50 mt-1 w-36 overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-lg">
                {["CSV", "PDF", "Image"].map((format) => (
                  <button
                    key={format}
                    onClick={() => setIsExportOpen(false)}
                    className="w-full px-3 py-2 text-left text-xs font-medium text-neutral-600 hover:bg-neutral-50"
                  >
                    Export {format}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Data freshness / aggregate chip */}
          <div className="flex items-center gap-1.5 rounded-sm border border-neutral-200 bg-neutral-50 px-2.5 py-1.5 text-[10px] font-mono text-neutral-500">
            {persona === "monitoring" ? (
              <>
                <span className="h-2 w-2 rounded-full bg-[#00775B] animate-pulse" />
                <span>Updated {secondsAgo}s ago</span>
              </>
            ) : (
              <>
                <Clock3 className="h-3 w-3" />
                <span>
                  {persona === "manager" ? "Daily aggregate ready" : "Monthly aggregate ready"}
                </span>
              </>
            )}
          </div>

          {/* Settings */}
          <button
            onClick={onSettings}
            title="Settings"
            className="flex items-center justify-center w-7 h-7 rounded-sm border border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300 hover:text-neutral-700 transition-colors"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {/* Manage People / Vehicles */}
          <button
            onClick={onManage}
            className="flex items-center gap-1.5 rounded-sm border border-[#00775B]/30 bg-[#E5FFF9] px-3 py-1.5 text-[10px] font-bold text-[#00775B] hover:bg-[#00775B]/10 transition-colors"
          >
            <Plus className="h-3 w-3" />
            {identityType === "FACE" ? "Manage People" : "Manage Vehicles"}
          </button>
        </div>
      </div>
    </div>
  );
};
