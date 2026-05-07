import { Panel } from "../shared/Panel";
import { Activity } from "lucide-react";
import { LIVE_STATUS, HOURLY_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { D3Gauge, D3Sparkline } from "../../D3Charts";

interface Props {
  terminology: QualityTerminology;
}

export const ComplianceGaugePanel = ({ terminology }: Props) => {
  const rate = LIVE_STATUS.compliance_rate_pct;
  // For gauge: show compliance rate. warnAt=80, critAt=70 inverted (green is high)
  // We invert: show 100-rate as the "defect" for gauge coloring, or use rate directly
  // D3Gauge expects value where low=green. We'll use (100 - rate) for the gauge position
  // so green zone = low deviation = high compliance
  const gaugeValue = Math.round(100 - rate);
  const sparkData = HOURLY_DATA.map((d) => d.compliance_pct);

  return (
    <Panel
      title={terminology.primaryMetricLabel}
      icon={Activity}
      info="Current compliance rate based on the last full observation window."
    >
      <div className="flex flex-col items-center gap-4">
        <div className="flex flex-col items-center">
          <D3Gauge
            value={gaugeValue}
            min={0}
            max={30}
            label={terminology.primaryMetricLabel}
            unit=""
            warnAt={10}
            critAt={20}
            width={220}
            height={130}
          />
          <p className="text-3xl font-black font-data text-neutral-900 -mt-2">{rate.toFixed(1)}%</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest mt-1">
            {terminology.primaryMetricLabel}
          </p>
        </div>

        <div className="w-full">
          <p className="text-[10px] text-neutral-400 mb-1 uppercase tracking-widest">
            Hourly Trend (Today)
          </p>
          <D3Sparkline
            data={sparkData}
            width={260}
            height={36}
            color={rate >= 90 ? "#00775B" : rate >= 80 ? "#F59E0B" : "#EF4444"}
            fill
          />
        </div>

        <div className="w-full flex justify-between text-[10px] text-neutral-400">
          <span>Target: 90%</span>
          <span
            className={
              rate >= 90
                ? "text-emerald-600 font-bold"
                : rate >= 80
                ? "text-amber-600 font-bold"
                : "text-red-600 font-bold"
            }
          >
            {rate >= 90 ? "On Target" : rate >= 80 ? "Near Target" : "Below Target"}
          </span>
        </div>
      </div>
    </Panel>
  );
};
