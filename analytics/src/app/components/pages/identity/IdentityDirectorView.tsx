import { ExecutiveSummaryBar } from "./components/director/ExecutiveSummaryBar";
import { SixMonthTrendChart } from "./components/director/SixMonthTrendChart";
import { AccessRiskSection } from "./components/director/AccessRiskSection";
import { CoverageEnrollmentSection } from "./components/director/CoverageEnrollmentSection";
import { ScorecardSection } from "./components/director/ScorecardSection";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
}

export const IdentityDirectorView = ({ terminology, timeRange: _timeRange, activeApp: _activeApp }: Props) => (
  <div className="flex flex-col gap-8 bg-neutral-50 min-h-full">
    <ExecutiveSummaryBar terminology={terminology} />
    <SixMonthTrendChart terminology={terminology} />
    <AccessRiskSection terminology={terminology} />
    <CoverageEnrollmentSection terminology={terminology} />
    <ScorecardSection terminology={terminology} />
  </div>
);
