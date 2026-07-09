import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { AnalyticsPageHeader } from "@/app/components/layout/AnalyticsPageHeader";

export const STATUS_FILTERS = ["All", "Active", "Inactive"];

interface MetricsRulesHeaderProps {
  persona: Persona;
  statusFilter: string;
  onStatusFilterChange: (status: string) => void;
}

export const MetricsRulesHeader = ({ persona, statusFilter, onStatusFilterChange }: MetricsRulesHeaderProps) => {
  return (
    <AnalyticsPageHeader
      persona={persona}
      timeRanges={STATUS_FILTERS}
      timeRange={statusFilter}
      onTimeRangeChange={onStatusFilterChange}
    />
  );
};
