import { Panel } from "../shared/Panel";
import { Grid3x3 } from "lucide-react";
import { VIOLATION_HEATMAP } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

const HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6–22
const ZONES = ["Zone A", "Zone B", "Zone C", "Zone D", "Zone E", "Zone F"];

function getColor(value: number, max: number): string {
  const ratio = Math.min(value / max, 1);
  if (ratio < 0.25) return "#F0FDF4";
  if (ratio < 0.5)  return "#FEF9C3";
  if (ratio < 0.75) return "#FED7AA";
  return "#FECACA";
}

function getTextColor(value: number, max: number): string {
  const ratio = value / max;
  return ratio >= 0.75 ? "#7F1D1D" : ratio >= 0.5 ? "#92400E" : "#064E3B";
}

export const ViolationHeatmapSection = ({ terminology }: Props) => {
  const maxValue = Math.max(...VIOLATION_HEATMAP.map((d) => d.value));

  const getValue = (zone: string, hour: number) =>
    VIOLATION_HEATMAP.find((d) => d.zone === zone && d.hour === hour)?.value ?? 0;

  return (
    <Panel
      title={`${terminology.negativeEventLabel} Heatmap — Hour × Zone`}
      icon={Grid3x3}
      info={`${terminology.negativeEventLabel} intensity by hour and zone. Darker red = more ${terminology.negativeEventLabel.toLowerCase()}s.`}
    >
      <div className="overflow-x-auto">
        {/* Header: hours */}
        <div className="flex min-w-max">
          <div className="w-24 flex-shrink-0" />
          {HOURS.map((h) => (
            <div
              key={h}
              className="w-10 flex-shrink-0 text-center text-[9px] text-neutral-400 font-bold pb-1"
            >
              {h}:00
            </div>
          ))}
        </div>

        {/* Grid rows */}
        {ZONES.map((zone) => (
          <div key={zone} className="flex min-w-max items-center mb-1">
            <div className="w-24 flex-shrink-0 text-[10px] font-semibold text-neutral-500 pr-2 text-right">
              {zone}
            </div>
            {HOURS.map((h) => {
              const val = getValue(zone, h);
              return (
                <div
                  key={h}
                  className="w-10 h-8 flex-shrink-0 flex items-center justify-center text-[9px] font-bold rounded-sm mx-px"
                  style={{
                    backgroundColor: getColor(val, maxValue),
                    color: getTextColor(val, maxValue),
                  }}
                  title={`${zone} @ ${h}:00 — ${val} ${terminology.negativeEventLabel.toLowerCase()}s`}
                >
                  {val > 0 ? val : ""}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* Color legend */}
      <div className="flex items-center gap-3 mt-3 text-[10px] text-neutral-500">
        <span>Low</span>
        {[
          { bg: "#F0FDF4", label: "0–25%" },
          { bg: "#FEF9C3", label: "25–50%" },
          { bg: "#FED7AA", label: "50–75%" },
          { bg: "#FECACA", label: "75–100%" },
        ].map((l) => (
          <div key={l.label} className="flex items-center gap-1">
            <span
              className="w-4 h-4 rounded-sm inline-block border border-neutral-200"
              style={{ backgroundColor: l.bg }}
            />
            <span>{l.label}</span>
          </div>
        ))}
        <span>High</span>
      </div>
    </Panel>
  );
};
