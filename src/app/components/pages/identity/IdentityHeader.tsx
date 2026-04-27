import { Settings, Plus } from "lucide-react";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { AnalyticsPageHeader, type AppOption } from "@/app/components/layout/AnalyticsPageHeader";
import type { IdentityAppOption, IdentityTerminology, IdentityType } from "../IdentityAnalytics";

// ── App list — selects the identity pipeline type ─────────────────────────────

const IDENTITY_APPS: AppOption[] = [
  { id: "FACE",  label: "Face Recognition", sub: "Facial recognition pipeline" },
  { id: "PLATE", label: "License Plate",     sub: "LPR / ANPR pipeline"         },
];

const TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["5m", "1h", "1d", "1w"],
  manager:    ["Today", "This Week", "Last 7 Days"],
  director:   ["This Month", "Last 3 Months", "YTD"],
};

// ── Props ─────────────────────────────────────────────────────────────────────

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
  onIdentityTypeChange,
  timeRange,
  onTimeRangeChange,
  onManage,
  onSettings,
}: IdentityHeaderProps) => {
  return (
    <AnalyticsPageHeader
      persona={persona}
      timeRanges={TIME_RANGES[persona]}
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
      apps={IDENTITY_APPS}
      activeAppId={identityType}
      onAppChange={(id) => onIdentityTypeChange(id as IdentityType)}
      actions={
        <>
          {/* Settings */}
          <button
            onClick={onSettings}
            title="Settings"
            className="flex h-7 w-7 items-center justify-center rounded-sm border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-neutral-300 hover:text-neutral-700"
          >
            <Settings className="h-3.5 w-3.5" />
          </button>

          {/* Manage People / Vehicles */}
          <button
            onClick={onManage}
            className="flex items-center gap-1.5 rounded-sm border border-[#00775B]/30 bg-[#E5FFF9] px-3 py-1.5 text-[10px] font-bold text-[#00775B] transition-colors hover:bg-[#00775B]/10"
          >
            <Plus className="h-3 w-3" />
            {identityType === "FACE" ? "Manage People" : "Manage Vehicles"}
          </button>
        </>
      }
    />
  );
};
