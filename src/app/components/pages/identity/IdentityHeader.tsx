import { useEffect, useMemo, useRef, useState } from "react";
import {
  Check,
  ChevronDown,
  Clock3,
  Download,
  Fingerprint,
  RefreshCw,
  Rows3,
  ScanLine,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import {
  IDENTITY_APP_OPTIONS,
  type IdentityAppOption,
  type IdentityTerminology,
  type IdentityType,
} from "../IdentityAnalytics";

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
}: IdentityHeaderProps) => {
  const [isAppOpen, setIsAppOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isRefreshOpen, setIsRefreshOpen] = useState(false);
  const [refreshInterval, setRefreshInterval] = useState("15s");
  const [secondsAgo, setSecondsAgo] = useState(12);

  const appRef = useRef<HTMLDivElement>(null);
  const exportRef = useRef<HTMLDivElement>(null);
  const refreshRef = useRef<HTMLDivElement>(null);

  const activeApps = useMemo(
    () =>
      IDENTITY_APP_OPTIONS.filter((option) => option.identityType === identityType),
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
      if (appRef.current && !appRef.current.contains(target)) setIsAppOpen(false);
      if (exportRef.current && !exportRef.current.contains(target)) setIsExportOpen(false);
      if (refreshRef.current && !refreshRef.current.contains(target)) setIsRefreshOpen(false);
    };

    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="rounded-md border border-neutral-200 bg-white px-4 py-3 shadow-sm">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-sm bg-[#E5FFF9] p-2 text-[#00775B]">
            {identityType === "FACE" ? (
              <Fingerprint className="h-5 w-5" />
            ) : (
              <ScanLine className="h-5 w-5" />
            )}
          </div>

          <div className="space-y-1">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-widest text-neutral-900">
                Identity Analytics
              </h2>
              <p className="text-[10px] uppercase tracking-[0.18em] text-[#00775B]">
                {terminology.appLabel}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
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

              <div className="rounded-full border border-neutral-200 bg-white px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-500">
                {activeApp.siteLabel}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="relative" ref={appRef}>
            <button
              onClick={() => setIsAppOpen((current) => !current)}
              className={cn(
                "flex max-w-[260px] items-center gap-2 rounded-sm border px-3 py-1.5 text-xs font-bold text-neutral-600 transition-all hover:border-neutral-300",
                isAppOpen ? "border-[#00775B]" : "border-neutral-200"
              )}
            >
              <Rows3 className="h-3.5 w-3.5 shrink-0 text-[#00775B]" />
              <span className="truncate">{activeApp.label}</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 shrink-0 transition-transform",
                  isAppOpen && "rotate-180"
                )}
              />
            </button>

            {isAppOpen && (
              <div className="absolute left-0 top-full z-50 mt-1 w-72 overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-lg">
                {activeApps.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      onAppChange(option.id);
                      setIsAppOpen(false);
                    }}
                    className={cn(
                      "flex w-full items-center justify-between px-3 py-2 text-left text-xs font-medium text-neutral-600 hover:bg-neutral-50",
                      activeApp.id === option.id && "text-[#00775B]"
                    )}
                  >
                    <div>
                      <div>{option.label}</div>
                      <div className="text-[10px] uppercase tracking-wide text-neutral-400">
                        {option.siteLabel}
                      </div>
                    </div>
                    {activeApp.id === option.id && <Check className="h-3.5 w-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

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
                  className={cn(
                    "h-3 w-3 transition-transform",
                    isRefreshOpen && "rotate-180"
                  )}
                />
              </button>

              {isRefreshOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-28 overflow-hidden rounded-sm border border-neutral-200 bg-white shadow-lg">
                  {REFRESH_INTERVALS.map((option) => (
                    <button
                      key={option}
                      onClick={() => {
                        setRefreshInterval(option);
                        setIsRefreshOpen(false);
                      }}
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

          <div className="relative" ref={exportRef}>
            <button
              onClick={() => setIsExportOpen((current) => !current)}
              className="flex items-center gap-1.5 rounded-sm border border-neutral-200 bg-white px-3 py-1.5 text-xs font-bold text-neutral-600 transition-all hover:border-neutral-300"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export</span>
              <ChevronDown
                className={cn(
                  "h-3 w-3 transition-transform",
                  isExportOpen && "rotate-180"
                )}
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
        </div>
      </div>
    </div>
  );
};
