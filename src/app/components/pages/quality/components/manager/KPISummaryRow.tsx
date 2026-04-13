import { KPICard } from "../shared/KPICard";
import { KPI_CARDS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

export const KPISummaryRow = ({ terminology: _terminology }: Props) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {KPI_CARDS.map((card) => (
        <KPICard key={card.id} card={card} />
      ))}
    </div>
  );
};
