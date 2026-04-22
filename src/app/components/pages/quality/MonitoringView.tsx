import { PrimaryKPIRow }          from "./components/monitoring/PrimaryKPIRow";
import { InstantAnalyticsPanel }   from "./components/monitoring/InstantAnalyticsPanel";
import { ActiveIncidentPanel }     from "./components/monitoring/ActiveIncidentPanel";
import { ZoneCardsPanel }          from "./components/monitoring/ZoneCardsPanel";
import { RepeatViolatorsTable }    from "./components/monitoring/RepeatViolatorsTable";
import { BatchTickerPanel }        from "./components/monitoring/BatchTickerPanel";
import { StageDefectPanel }        from "./components/monitoring/StageDefectPanel";
import { DefectDensityChart }      from "./components/monitoring/DefectDensityChart";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
  appId: string;
  groups?: string[];
}

export const MonitoringView = ({ terminology, timeRange: _timeRange, appId, groups }: Props) => {
  return (
    <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">

      {/* ── Row 1: 4 KPI tiles with sparklines ──────────────────────────────── */}
      <PrimaryKPIRow terminology={terminology} />

      {/* ── Row 2: Instant Analytics — live actionable feed (all apps) ──────── */}
      <InstantAnalyticsPanel terminology={terminology} appId={appId} groups={groups} />

      {terminology.isDefectApp ? (
        <>
          {/* ── Defect App: Stage breakdown + density ──────────────────────── */}
          <StageDefectPanel terminology={terminology} appId={appId} />
          <DefectDensityChart terminology={terminology} />
          <BatchTickerPanel terminology={terminology} />
        </>
      ) : (
        <>
          {/* ── Safety App: Active incidents + Repeat offenders ────────────── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ActiveIncidentPanel />
            <RepeatViolatorsTable terminology={terminology} />
          </div>

          {/* ── Zone Overview ─────────────────────────────────────────────── */}
          <ZoneCardsPanel terminology={terminology} />
        </>
      )}

    </div>
  );
};
