import { Panel } from "../shared/Panel";
import { Hexagon } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { D3Gauge } from "../../D3Charts";

interface Props {
  terminology: QualityTerminology;
}

export const DefectRatePanel = ({ terminology }: Props) => {
  // Average defect rate across zones
  const avgDefectRate =
    ZONE_DATA.reduce((s, z) => s + z.defect_rate_pct, 0) / ZONE_DATA.length;
  const defectRate = Math.round(avgDefectRate * 10) / 10;

  const status =
    defectRate < 1 ? "GREEN" : defectRate < 2 ? "AMBER" : "RED";
  const statusColor =
    status === "GREEN"
      ? "text-emerald-600"
      : status === "AMBER"
      ? "text-amber-600"
      : "text-red-600";
  const statusLabel =
    status === "GREEN" ? "Good" : status === "AMBER" ? "Watch" : "Alert";

  return (
    <Panel
      title={`${terminology.negativeEventLabel} Rate`}
      icon={Hexagon}
      info={`Average ${terminology.negativeEventLabel.toLowerCase()} rate across all inspection zones. Target: <1%.`}
    >
      <div className="flex flex-col items-center gap-4">
        <D3Gauge
          value={defectRate}
          min={0}
          max={5}
          label={`${terminology.negativeEventLabel} Rate`}
          unit="%"
          warnAt={1}
          critAt={2}
          width={220}
          height={130}
        />

        <div className="flex flex-col items-center gap-1">
          <p className={`text-3xl font-black font-data ${statusColor}`}>{defectRate}%</p>
          <p className="text-[10px] text-neutral-400 uppercase tracking-widest">
            Avg {terminology.negativeEventLabel} Rate
          </p>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full mt-1 ${
              status === "GREEN"
                ? "bg-emerald-100 text-emerald-700"
                : status === "AMBER"
                ? "bg-amber-100 text-amber-700"
                : "bg-red-100 text-red-700"
            }`}
          >
            {statusLabel}
          </span>
        </div>

        <p className="text-[10px] text-neutral-400 text-center">
          Target: &lt;1% · Industry Avg: 2.1%
        </p>
      </div>
    </Panel>
  );
};
