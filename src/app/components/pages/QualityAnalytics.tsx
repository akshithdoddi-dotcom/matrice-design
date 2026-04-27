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
import { DEFAULT_QUALITY_GROUPS } from "./quality/components/monitoring/InstantAnalyticsPanel";
import type { GroupConfig } from "./IdentityAnalytics";

const DEFAULT_TIME_RANGE: Record<Persona, string> = {
  monitoring: "1h",
  manager:    "Today",
  director:   "This Month",
};

export const QualityAnalytics = ({ persona }: { persona: Persona }) => {
  const [activeApp, setActiveApp] = useState<QualityAppId>("bottle");
  const [timeRange, setTimeRange] = useState(DEFAULT_TIME_RANGE[persona]);
  const [groups, setGroups]       = useState<GroupConfig[]>(DEFAULT_QUALITY_GROUPS);

  const terminology = TERMINOLOGY_MAP[activeApp];

  return (
    <div>
      <QualityHeader
        persona={persona}
        terminology={terminology}
        activeApp={activeApp}
        onAppChange={setActiveApp}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        groups={groups}
        onUpdateGroups={setGroups}
      />

      {persona === "monitoring" && (
        <MonitoringView terminology={terminology} timeRange={timeRange} appId={activeApp} groups={groups} />
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
