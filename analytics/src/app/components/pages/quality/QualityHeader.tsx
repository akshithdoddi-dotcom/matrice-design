import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import type { QualityAppId, QualityTerminology } from "./data/mockData";
import { AnalyticsPageHeader, type AppOption } from "@/app/components/layout/AnalyticsPageHeader";

// ── App list ──────────────────────────────────────────────────────────────────

const APP_OPTIONS: AppOption[] = [
  { id: "bottle",        label: "Bottle Defect"            },
  { id: "pcb",           label: "PCB Defect"               },
  { id: "welding",       label: "Welding Defect"           },
  { id: "car-damage",    label: "Car Damage"               },
  { id: "corrosion",     label: "Corrosion Detection"      },
  { id: "road-damage",   label: "Road Damage"              },
  { id: "pothole",       label: "Pothole Detection"        },
  { id: "phone-screen",  label: "Screen Defect"            },
  { id: "assembly",      label: "Assembly Line QC"         },
  { id: "food-quality",  label: "Food Quality"             },
  { id: "textile",       label: "Textile Defect"           },
  { id: "solar-panel",   label: "Solar Panel QC"           },
  { id: "semiconductor", label: "Semiconductor Inspection" },
  { id: "metal-surface", label: "Metal Surface"            },
  { id: "glass",         label: "Glass Defect"             },
  { id: "paint",         label: "Paint Defect"             },
  { id: "wire-harness",  label: "Wire Harness QC"          },
  { id: "packaging",     label: "Packaging Inspection"     },
  { id: "wood",          label: "Wood Defect"              },
];

const TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["5m", "1h", "1d", "1w"],
  manager:    ["Today", "This Week"],
  director:   ["This Month", "This Quarter"],
};

// ── Header ────────────────────────────────────────────────────────────────────

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
  activeApp,
  onAppChange,
  timeRange,
  onTimeRangeChange,
}: QualityHeaderProps) => {
  return (
    <AnalyticsPageHeader
      persona={persona}
      timeRanges={TIME_RANGES[persona]}
      timeRange={timeRange}
      onTimeRangeChange={onTimeRangeChange}
      apps={APP_OPTIONS}
      activeAppId={activeApp}
      onAppChange={(id) => onAppChange(id as QualityAppId)}
      wrapperClassName="mb-4"
    />
  );
};
