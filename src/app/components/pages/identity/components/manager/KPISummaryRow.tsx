import { IDENTITY_KPI_CARDS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { KPICard } from "../shared/KPICard";

interface Props { terminology: IdentityTerminology }

export const KPISummaryRow = ({ terminology: _terminology }: Props) => (
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
    {IDENTITY_KPI_CARDS.map((card) => (
      <KPICard key={card.id} card={card} />
    ))}
  </div>
);
