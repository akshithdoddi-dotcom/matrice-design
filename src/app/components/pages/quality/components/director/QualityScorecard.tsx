import { Panel } from "../shared/Panel";
import { ClipboardList } from "lucide-react";
import { SCORECARD_DATA } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

const STATUS_STYLES = {
  ON_TRACK:   { cell: "text-emerald-700 bg-emerald-50", pill: "bg-emerald-100 text-emerald-700" },
  WATCH:      { cell: "text-amber-700 bg-amber-50",     pill: "bg-amber-100 text-amber-700"     },
  OFF_TARGET: { cell: "text-red-700 bg-red-50",         pill: "bg-red-100 text-red-700"         },
};

export const QualityScorecard = ({ terminology: _terminology }: Props) => {
  const onTrack   = SCORECARD_DATA.filter((r) => r.status === "ON_TRACK").length;
  const watch     = SCORECARD_DATA.filter((r) => r.status === "WATCH").length;
  const offTarget = SCORECARD_DATA.filter((r) => r.status === "OFF_TARGET").length;

  const formatValue = (value: number, unit: string) => {
    if (unit === "%") return `${value.toFixed(1)}%`;
    if (unit === "USD") return `$${value.toLocaleString()}`;
    return `${value.toLocaleString()} ${unit !== "violations" && unit !== "zones" && unit !== "workers" && unit !== "alerts" && unit !== "sec" ? unit : unit}`;
  };

  return (
    <Panel
      title="Quality Scorecard"
      icon={ClipboardList}
      info="Month-over-month scorecard for key quality metrics. Status is determined by comparison to target."
    >
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {["Metric", "This Month", "Last Month", "Target", "Status"].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-4 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SCORECARD_DATA.map((row) => {
              const styles = STATUS_STYLES[row.status];
              return (
                <tr
                  key={row.metric}
                  className={cn("border-b border-neutral-50 hover:bg-neutral-50 transition-colors")}
                >
                  <td className="py-3 pr-4 font-semibold text-neutral-700 whitespace-nowrap">
                    {row.metric}
                  </td>
                  <td className={cn("py-3 pr-4 font-black tabular-nums font-data rounded px-2", styles.cell)}>
                    {formatValue(row.this_period, row.unit)}
                  </td>
                  <td className="py-3 pr-4 text-neutral-500 tabular-nums font-data">
                    {formatValue(row.last_period, row.unit)}
                  </td>
                  <td className="py-3 pr-4 text-neutral-400 tabular-nums font-data">
                    {formatValue(row.target, row.unit)}
                  </td>
                  <td className="py-3">
                    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold", styles.pill)}>
                      <span>{row.symbol}</span>
                      {row.status === "ON_TRACK" ? "On Track" : row.status === "WATCH" ? "Watch" : "Off Target"}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Summary footer */}
      <div className="mt-4 pt-3 border-t border-neutral-50 flex items-center gap-3 text-[11px] font-semibold">
        <span className="text-emerald-600">{onTrack} On Track</span>
        <span className="text-neutral-300">·</span>
        <span className="text-amber-600">{watch} Watch</span>
        <span className="text-neutral-300">·</span>
        <span className="text-red-500">{offTarget} Off Target</span>
      </div>
    </Panel>
  );
};
