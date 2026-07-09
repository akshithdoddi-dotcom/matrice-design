import { useState, useRef, useEffect, type ReactNode } from "react";
import { ChevronDown, ChevronRight, Clock, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";

export interface AppOption {
  id: string;
  label: string;
  sub?: string;
}

interface AnalyticsPageHeaderProps {
  persona: Persona;
  /** Time-range pills to show for this page (persona-specific) */
  timeRanges: string[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;
  /** App list for the dropdown — omit (or pass an empty array) to hide the selector */
  apps?: AppOption[];
  activeAppId?: string;
  onAppChange?: (id: string) => void;
  /** Page-specific icon buttons / dropdowns rendered after the clock badge */
  actions?: ReactNode;
  /** Extra class on the outer wrapper (e.g. mb-4 for quality pages) */
  wrapperClassName?: string;
}

export function AnalyticsPageHeader({
  persona,
  timeRanges,
  timeRange,
  onTimeRangeChange,
  apps = [],
  activeAppId,
  onAppChange,
  actions,
  wrapperClassName,
}: AnalyticsPageHeaderProps) {
  const [isAppOpen,  setIsAppOpen]  = useState(false);
  const [secondsAgo, setSecondsAgo] = useState(2);
  const appRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (persona !== "monitoring") return;
    const id = setInterval(() => setSecondsAgo((s) => (s >= 59 ? 2 : s + 1)), 1000);
    return () => clearInterval(id);
  }, [persona]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (appRef.current && !appRef.current.contains(e.target as Node)) setIsAppOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const activeApp = apps.find((a) => a.id === activeAppId);

  const timeContextLabel =
    persona === "monitoring" ? "Since 00:00 today" :
    persona === "manager"    ? "As of today"        :
                               "Mar 2026";

  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-neutral-200 rounded-md px-4 py-3 shadow-sm",
        wrapperClassName
      )}
    >
      {/* ── LEFT: breadcrumb + live indicator ── */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Project pill */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-neutral-50 border border-neutral-200 shrink-0">
          <span className="text-[10px] text-neutral-400 font-medium">Project:</span>
          <span className="text-[11px] font-bold text-neutral-700">Matrice AI</span>
        </div>

        <ChevronRight className="w-3.5 h-3.5 text-neutral-300 shrink-0" />

        {/* Pipeline pill — hardcoded */}
        <div className="flex items-center gap-1 px-2.5 py-1 rounded-[6px] bg-[#E5FFF9] border border-[#00775B]/20 shrink-0">
          <span className="text-[10px] text-[#00775B]/70 font-medium">Pipeline:</span>
          <span className="text-[11px] font-bold text-[#00775B]">Matrice Inference v2</span>
        </div>

        {/* Live indicator — monitoring only */}
        {persona === "monitoring" && (
          <div className="flex items-center gap-1.5 text-[10px] font-mono text-neutral-500 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
            <span>Updated {secondsAgo}s ago</span>
          </div>
        )}
      </div>

      {/* ── RIGHT: controls ── */}
      <div className="flex flex-wrap items-center gap-2">
        {/* App selector — shows current selection */}
        {apps.length > 0 && (
          <div className="relative" ref={appRef}>
            <button
              onClick={() => setIsAppOpen((v) => !v)}
              className={cn(
                "flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-all bg-white text-neutral-700 hover:border-neutral-300 max-w-[200px]",
                isAppOpen ? "border-[#00775B]" : "border-neutral-200"
              )}
            >
              <span className="truncate">{activeApp?.label ?? "Select App"}</span>
              <ChevronDown className={cn("w-3 h-3 text-neutral-400 transition-transform shrink-0", isAppOpen && "rotate-180")} />
            </button>

            {isAppOpen && (
              <div className="absolute top-full right-0 mt-1 w-64 rounded-sm border border-neutral-200 bg-white shadow-lg z-50 overflow-hidden max-h-[360px] overflow-y-auto">
                <div className="py-1">
                  {apps.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { onAppChange?.(opt.id); setIsAppOpen(false); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 text-left text-xs cursor-pointer hover:bg-neutral-50",
                        activeAppId === opt.id ? "text-[#00775B] bg-[#E5FFF9]" : "text-neutral-600"
                      )}
                    >
                      <div>
                        <div className="font-bold">{opt.label}</div>
                        {opt.sub && (
                          <div className="text-[10px] uppercase tracking-wide text-neutral-400">{opt.sub}</div>
                        )}
                      </div>
                      {activeAppId === opt.id && <Check className="w-3.5 h-3.5 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Time range pills */}
        <div className="flex items-center rounded-sm border border-neutral-200 bg-white p-0.5">
          {timeRanges.map((r) => (
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

        {/* Time context badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-sm border border-neutral-200 bg-neutral-50 text-[10px] font-mono text-neutral-500">
          <Clock className="w-3 h-3 shrink-0" />
          <span>{timeContextLabel}</span>
        </div>

        {/* Page-specific action buttons */}
        {actions}
      </div>
    </div>
  );
}
