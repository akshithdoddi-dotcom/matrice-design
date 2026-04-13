import { LiveStatusBar } from "./components/monitoring/LiveStatusBar";
import { ComplianceGaugePanel } from "./components/monitoring/ComplianceGaugePanel";
import { CountVsTimePanel } from "./components/monitoring/CountVsTimePanel";
import { SafeVsUnsafePanel } from "./components/monitoring/SafeVsUnsafePanel";
import { DailyQualityHourPanel } from "./components/monitoring/DailyQualityHourPanel";
import { ViolationTypePanel } from "./components/monitoring/ViolationTypePanel";
import { ZoneHeatmapPanel } from "./components/monitoring/ZoneHeatmapPanel";
import { AlertFeedPanel } from "./components/monitoring/AlertFeedPanel";
import { RepeatViolatorPanel } from "./components/monitoring/RepeatViolatorPanel";
import { TimeToCompliancePanel } from "./components/monitoring/TimeToCompliancePanel";
import { DefectRatePanel } from "./components/monitoring/DefectRatePanel";
import { BatchTickerPanel } from "./components/monitoring/BatchTickerPanel";
import { LIVE_STATUS } from "./data/mockData";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const MonitoringView = ({ terminology, timeRange: _timeRange }: Props) => {
  return (
    <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">
      {/* Pinned status bar */}
      <LiveStatusBar status={LIVE_STATUS} terminology={terminology} />

      {/* Panel grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ComplianceGaugePanel terminology={terminology} />
        <CountVsTimePanel terminology={terminology} />
        <SafeVsUnsafePanel terminology={terminology} />
        {terminology.isDefectApp
          ? <DefectRatePanel terminology={terminology} />
          : <RepeatViolatorPanel terminology={terminology} />}
      </div>

      <DailyQualityHourPanel terminology={terminology} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <ViolationTypePanel terminology={terminology} />
        {terminology.isDefectApp
          ? <BatchTickerPanel terminology={terminology} />
          : <TimeToCompliancePanel terminology={terminology} />}
      </div>

      <ZoneHeatmapPanel terminology={terminology} />
      <AlertFeedPanel terminology={terminology} />
    </div>
  );
};
