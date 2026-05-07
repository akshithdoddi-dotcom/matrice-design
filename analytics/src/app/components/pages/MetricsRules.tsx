import { Ruler, AlertTriangle } from "lucide-react";
import { AnalyticsHeader } from "./AnalyticsHeader";

export const MetricsRules = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader title="Metrics & Rules" icon={Ruler} />
      
      <div className="bg-white p-12 rounded-md border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="bg-neutral-50 p-6 rounded-full mb-6">
           <Ruler className="w-12 h-12 text-neutral-400" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Metrics & Custom Rules</h3>
        <p className="text-neutral-500 max-w-md mb-8">
           Define custom alerts, set operational thresholds, and manage notification rules for incident response.
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-[#00775B] bg-[#E5FFF9] px-4 py-2 rounded-full uppercase tracking-wide">
           <AlertTriangle className="w-4 h-4" />
           Configuration Locked
        </div>
      </div>
    </div>
  );
};
