import { Panel } from "../shared/Panel";
import { ShieldCheck } from "lucide-react";
import { LIVE_STATUS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

export const SafeVsUnsafePanel = ({ terminology }: Props) => {
  const total = 100; // normalize to 100 observations in window
  const safeCount = Math.round((LIVE_STATUS.compliance_rate_pct / 100) * total);
  const unsafeCount = total - safeCount;
  const safePct = LIVE_STATUS.compliance_rate_pct;
  const unsafePct = 100 - safePct;

  return (
    <Panel
      title={`${terminology.safeLabel} vs. ${terminology.unsafeLabel}`}
      icon={ShieldCheck}
      info="Current-window breakdown of compliant vs. non-compliant observations."
    >
      <div className="flex flex-col gap-4">
        {/* Stacked bar */}
        <div className="w-full h-6 rounded-full overflow-hidden flex">
          <div
            className="h-full bg-emerald-500 transition-all"
            style={{ width: `${safePct}%` }}
          />
          <div
            className="h-full bg-red-400 transition-all"
            style={{ width: `${unsafePct}%` }}
          />
        </div>

        {/* Legend percentages */}
        <div className="flex justify-between text-xs">
          <span className="text-emerald-600 font-semibold">{safePct.toFixed(1)}% {terminology.safeLabel}</span>
          <span className="text-red-500 font-semibold">{unsafePct.toFixed(1)}% {terminology.unsafeLabel}</span>
        </div>

        {/* Large stat numbers */}
        <div className="grid grid-cols-2 gap-4 mt-2">
          <div className="flex flex-col items-center p-3 bg-emerald-50 rounded-[4px] border border-emerald-100">
            <p className="text-3xl font-black font-data text-emerald-600">{safeCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 mt-1">
              {terminology.safeLabel}
            </p>
          </div>
          <div className="flex flex-col items-center p-3 bg-red-50 rounded-[4px] border border-red-100">
            <p className="text-3xl font-black font-data text-red-500">{unsafeCount}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-400 mt-1">
              {terminology.unsafeLabel}
            </p>
          </div>
        </div>

        <p className="text-[10px] text-neutral-400 text-center">
          Based on current 5-minute observation window
        </p>
      </div>
    </Panel>
  );
};
