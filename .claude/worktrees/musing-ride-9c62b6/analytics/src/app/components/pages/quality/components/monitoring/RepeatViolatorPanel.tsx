import { Panel } from "../shared/Panel";
import { Users } from "lucide-react";
import { REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { D3Sparkline } from "../../D3Charts";

interface Props {
  terminology: QualityTerminology;
}

export const RepeatViolatorPanel = ({ terminology }: Props) => {
  const count = REPEAT_VIOLATORS.length;
  // Trend: simulated 7-day count trend (descending = improving)
  const trendData = [10, 9, 8, 7, 7, 6, count];

  return (
    <Panel
      title={terminology.repeatOffenderLabel + "s"}
      icon={Users}
      info={`${terminology.entityLabel}s with 3 or more ${terminology.negativeEventLabel.toLowerCase()}s in the past 7 days.`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-end gap-4">
          <div>
            <p className="text-5xl font-black font-data tabular-nums text-neutral-900">{count}</p>
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400 mt-1">
              {terminology.repeatOffenderLabel}s
            </p>
          </div>
          <D3Sparkline
            data={trendData}
            width={100}
            height={40}
            color="#EF4444"
            fill
          />
        </div>

        <div className="flex flex-col gap-1">
          {REPEAT_VIOLATORS.slice(0, 3).map((v) => (
            <div
              key={v.tracker_id}
              className="flex items-center justify-between py-1.5 border-b border-neutral-50"
            >
              <div>
                <span className="text-xs font-semibold text-neutral-700">
                  {v.anonymized_label}
                </span>
                <span className="ml-2 text-[10px] text-neutral-400">
                  {v.zones.join(", ")}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black font-data tabular-nums text-red-500">{v.violation_count}x</span>
                {v.badge === "RECURRING" && (
                  <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                    RECURRING
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-[10px] text-neutral-400">
          {REPEAT_VIOLATORS.filter((v) => v.badge === "RECURRING").length} flagged as recurring ·{" "}
          7-day window
        </p>
      </div>
    </Panel>
  );
};
