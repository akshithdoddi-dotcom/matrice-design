import { PrimaryKPIRow }       from "./components/monitoring/PrimaryKPIRow";
import { ActiveIncidentPanel }  from "./components/monitoring/ActiveIncidentPanel";
import { ZoneCardsPanel }        from "./components/monitoring/ZoneCardsPanel";
import { RepeatViolatorsTable }  from "./components/monitoring/RepeatViolatorsTable";
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

      {/* ── Row 2: Active Incidents + Repeat Offenders side by side ─────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        <ActiveIncidentPanel />
        <RepeatViolatorsTable terminology={terminology} />
      </div>

      {/* ── Row 3: Zone Overview ─────────────────────────────────────────────── */}
      <ZoneCardsPanel terminology={terminology} />

      {/* ── Row 4: Batch ticker (defect apps only) ───────────────────────────── */}
      {terminology.isDefectApp && (
        <BatchTickerPanel terminology={terminology} />
      )}

    </div>
  );
};
