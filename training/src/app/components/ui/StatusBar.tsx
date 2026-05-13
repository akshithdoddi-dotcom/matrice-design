import { ReactNode } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { FilterDropdown } from "./FilterDropdown";

// ─── StatusBar ────────────────────────────────────────────────────────────────
// A consistent top-of-page controls bar used across analytics pages.
//
// Right autolayout (left → right):
//   [App Filter Dropdown]  [Time Range Pills]  [Since … (fixed-width label)]
//
// Left section accepts arbitrary children (page-specific live status chips).

interface StatusBarProps {
  /** Live status chips rendered on the left side of the bar */
  leftContent?: ReactNode;

  // ── Time range ──────────────────────────────────────────────────────────────
  timeRanges: string[];
  timeRange: string;
  onTimeRangeChange: (range: string) => void;

  // ── App filter (optional multi-select) ─────────────────────────────────────
  appOptions?: string[];
  selectedApps?: string[];
  onToggleApp?: (app: string) => void;

  /** Exact time-window label shown in the fixed-width info chip */
  timeRangeInfo?: string;

  className?: string;
}

export const StatusBar = ({
  leftContent,
  timeRanges,
  timeRange,
  onTimeRangeChange,
  appOptions,
  selectedApps,
  onToggleApp,
  timeRangeInfo,
  className,
}: StatusBarProps) => {
  return (
    <div
      className={cn(
        "flex flex-col md:flex-row md:items-center justify-between gap-3 bg-white border border-neutral-200 rounded-md px-4 py-3 shadow-sm",
        className
      )}
    >
      {/* ── Left: status chips (page-specific) ── */}
      {leftContent && (
        <div className="flex items-center gap-2.5 flex-wrap min-w-0">
          {leftContent}
        </div>
      )}

      {/* ── Right: standardised controls ── */}
      <div className="flex items-center gap-2 flex-shrink-0 flex-wrap">
        {/* App filter dropdown */}
        {appOptions && (
          <FilterDropdown
            label="Apps"
            options={["all", ...appOptions]}
            selectedItems={selectedApps}
            onToggleItem={onToggleApp}
            className="w-[160px]"
          />
        )}

        {/* Time range pill selector */}
        <div className="flex items-center rounded-[4px] border border-neutral-200 bg-white p-0.5 shadow-sm">
          {timeRanges.map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => onTimeRangeChange(r)}
              className={cn(
                "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-[3px] transition-all",
                timeRange === r
                  ? "bg-[#00775B] text-white shadow-sm"
                  : "text-neutral-500 hover:bg-neutral-50"
              )}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Fixed-width time-range info chip (rightmost) */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-neutral-50 border border-neutral-200 rounded text-[11px] text-neutral-500 font-mono w-44 overflow-hidden">
          <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
          <span className="truncate">{timeRangeInfo ?? `All time`}</span>
        </div>
      </div>
    </div>
  );
};
