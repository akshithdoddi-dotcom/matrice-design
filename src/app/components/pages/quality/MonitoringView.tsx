import { PrimaryKPIRow }          from "./components/monitoring/PrimaryKPIRow";
import { InstantAnalyticsPanel }   from "./components/monitoring/InstantAnalyticsPanel";
import { ActiveIncidentPanel }     from "./components/monitoring/ActiveIncidentPanel";
import { ZoneCardsPanel }          from "./components/monitoring/ZoneCardsPanel";
import { RepeatViolatorsTable }    from "./components/monitoring/RepeatViolatorsTable";
import { BatchTickerPanel }        from "./components/monitoring/BatchTickerPanel";
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

      {terminology.isDefectApp ? (
        /* ── Defect App: 70/30 layout — feed table + batch sidebar ─────────── */
        <div className="grid grid-cols-[7fr_3fr] gap-3 items-start">
          <InstantAnalyticsPanel terminology={terminology} appId={appId} groups={groups} />
          <div className="flex flex-col gap-3">
            <BatchTickerPanel terminology={terminology} />
            <DefectDensityChart terminology={terminology} />
          </div>
        </div>
      ) : (
        <>
          {/* ── Safety App: live feed + active incidents + repeat offenders ──── */}
          <InstantAnalyticsPanel terminology={terminology} appId={appId} groups={groups} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <ActiveIncidentPanel />
            <RepeatViolatorsTable terminology={terminology} />
          </div>
          <ZoneCardsPanel terminology={terminology} />
        </>
      )}

    </div>
  );
};
