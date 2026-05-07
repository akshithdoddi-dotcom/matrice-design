import { ExecutiveSummaryBar }  from "./components/director/ExecutiveSummaryBar";
import { SixMonthTrendChart }   from "./components/director/SixMonthTrendChart";
import { CostOfQualitySection } from "./components/director/CostOfQualitySection";
import { RiskZoneSummary }      from "./components/director/RiskZoneSummary";
import { QualityScorecard }     from "./components/director/QualityScorecard";
import type { QualityTerminology } from "./data/types";

interface Props {
  terminology: QualityTerminology;
  timeRange: string;
}

export const DirectorView = ({ terminology, timeRange: _timeRange }: Props) => (
  <div className="flex flex-col gap-4 bg-neutral-50 min-h-full">
    <ExecutiveSummaryBar terminology={terminology} />
    <SixMonthTrendChart terminology={terminology} />
    <CostOfQualitySection terminology={terminology} />
    <RiskZoneSummary terminology={terminology} />
    <QualityScorecard terminology={terminology} />
  </div>
);
