import { PrimaryKPIRow }       from "./components/monitoring/PrimaryKPIRow";
import { ActiveIncidentPanel }  from "./components/monitoring/ActiveIncidentPanel";
import { ViolationInsightsPanel } from "./components/monitoring/ViolationInsightsPanel";
import { ZoneCardsPanel }        from "./components/monitoring/ZoneCardsPanel";
import { RepeatViolatorsTable }  from "./components/monitoring/RepeatViolatorsTable";
import { HourlyCompliancePanel } from "./components/monitoring/HourlyCompliancePanel";
import { TimeToCompliancePanel } from "./components/monitoring/TimeToCompliancePanel";
import { BatchTickerPanel }      from "./components/monitoring/BatchTickerPanel";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const MonitoringView = ({ terminology, timeRange: _timeRange }: Props) => {
  return (
    <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">

      {/* ── Row 1: 4 KPI tiles with sparklines ──────────────────────────────── */}
      <PrimaryKPIRow terminology={terminology} />

      {/* ── Row 2: Action-first main area ───────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-3">

        {/* Left: Active incidents with action buttons */}
        <ActiveIncidentPanel />

        {/* Right: Violations breakdown + zone table stacked */}
        <div className="flex flex-col gap-3">
          <ViolationInsightsPanel terminology={terminology} />
          <ZoneCardsPanel terminology={terminology} />
        </div>
      </div>

      {/* ── Row 3: Trend chart + Repeat offenders ───────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <HourlyCompliancePanel terminology={terminology} />
        <RepeatViolatorsTable terminology={terminology} />
      </div>

      {/* ── Row 4: Batch ticker (defect apps) or Time-to-Compliance ─────────── */}
      {terminology.isDefectApp
        ? <BatchTickerPanel terminology={terminology} />
        : <TimeToCompliancePanel terminology={terminology} />}

    </div>
  );
};
