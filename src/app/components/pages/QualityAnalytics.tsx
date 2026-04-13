import { useState } from "react";
import type { Persona } from "../dashboard/PersonaSwitcher";
import {
  TERMINOLOGY_MAP,
  type QualityAppId,
} from "./quality/data/mockData";
import { QualityHeader } from "./quality/QualityHeader";
import { MonitoringView } from "./quality/MonitoringView";
import { ManagerView } from "./quality/ManagerView";
import { DirectorView } from "./quality/DirectorView";

const DEFAULT_TIME_RANGE: Record<Persona, string> = {
  monitoring: "1h",
  manager:    "Today",
  director:   "This Month",
};

export const QualityAnalytics = ({ persona }: { persona: Persona }) => {
  const [activeApp, setActiveApp]     = useState<QualityAppId>("ppe");
  const [timeRange, setTimeRange]     = useState(DEFAULT_TIME_RANGE[persona]);

  const terminology = TERMINOLOGY_MAP[activeApp];

  // Reset time range to persona-appropriate default when persona changes externally
  // (persona itself is managed by parent App.tsx, so we just use it as-is)

  return (
    <div>
      <QualityHeader
        persona={persona}
        terminology={terminology}
        activeApp={activeApp}
        onAppChange={setActiveApp}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
      />

      {persona === "monitoring" && (
        <MonitoringView terminology={terminology} timeRange={timeRange} />
      )}

      {persona === "manager" && (
        <ManagerView terminology={terminology} timeRange={timeRange} />
      )}

      {persona === "director" && (
        <DirectorView terminology={terminology} timeRange={timeRange} />
      )}
    </div>
  );
};
