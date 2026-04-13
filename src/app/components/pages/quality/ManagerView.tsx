import { LiveSummaryStrip } from "./components/manager/LiveSummaryStrip";
import { KPISummaryRow } from "./components/manager/KPISummaryRow";
import { ComplianceTrendSection } from "./components/manager/ComplianceTrendSection";
import { SafeVsUnsafeSection } from "./components/manager/SafeVsUnsafeSection";
import { DailyQualityHourSection } from "./components/manager/DailyQualityHourSection";
import { ZonePerformanceTable } from "./components/manager/ZonePerformanceTable";
import { ViolationHeatmapSection } from "./components/manager/ViolationHeatmapSection";
import { RepeatViolatorsSection } from "./components/manager/RepeatViolatorsSection";
import { IncidentSummarySection } from "./components/manager/IncidentSummarySection";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const ManagerView = ({ terminology, timeRange }: Props) => (
  <div className="flex flex-col gap-6 bg-neutral-50 min-h-full">
    <LiveSummaryStrip terminology={terminology} />
    <KPISummaryRow terminology={terminology} />
    <ComplianceTrendSection terminology={terminology} timeRange={timeRange} />
    <SafeVsUnsafeSection terminology={terminology} />
    <DailyQualityHourSection terminology={terminology} />
    <ZonePerformanceTable terminology={terminology} />
    <ViolationHeatmapSection terminology={terminology} />
    <RepeatViolatorsSection terminology={terminology} />
    <IncidentSummarySection terminology={terminology} />
  </div>
);
