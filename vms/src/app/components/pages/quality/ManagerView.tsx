import { KPISummaryRow }          from "./components/manager/KPISummaryRow";
import { ComplianceTrendSection }  from "./components/manager/ComplianceTrendSection";
import { TimeToCompliancePanel }  from "./components/monitoring/TimeToCompliancePanel";
import { ZonePerformanceTable }    from "./components/manager/ZonePerformanceTable";
import { RepeatViolatorsSection }  from "./components/manager/RepeatViolatorsSection";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const ManagerView = ({ terminology, timeRange }: Props) => (
  <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">
    {/* KPI summary cards */}
    <KPISummaryRow terminology={terminology} />

    {/* Compliance trend over selected time range */}
    <ComplianceTrendSection terminology={terminology} timeRange={timeRange} />

    {/* Time-to-compliance (safety apps only) */}
    {!terminology.isDefectApp && (
      <TimeToCompliancePanel terminology={terminology} />
    )}

    {/* Zone-level performance table */}
    <ZonePerformanceTable terminology={terminology} />

    {/* Repeat offenders */}
    <RepeatViolatorsSection terminology={terminology} />
  </div>
);
