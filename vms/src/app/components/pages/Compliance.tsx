import { ClipboardCheck, AlertTriangle } from "lucide-react";
import { AnalyticsHeader } from "./AnalyticsHeader";

export const Compliance = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader title="Compliance & Audit" icon={ClipboardCheck} />
      
      <div className="bg-white p-12 rounded-md border border-neutral-200 shadow-sm flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="bg-neutral-50 p-6 rounded-full mb-6">
           <ClipboardCheck className="w-12 h-12 text-neutral-400" />
        </div>
        <h3 className="text-lg font-bold text-neutral-900 mb-2">Compliance Dashboard</h3>
        <p className="text-neutral-500 max-w-md mb-8">
           Monitor adherence to safety regulations, generate audit reports, and track certification status for your facilities.
        </p>
        <div className="flex items-center gap-2 text-xs font-bold text-[#00775B] bg-[#E5FFF9] px-4 py-2 rounded-full uppercase tracking-wide">
           <AlertTriangle className="w-4 h-4" />
           Audit Scheduled
        </div>
      </div>
    </div>
  );
};
