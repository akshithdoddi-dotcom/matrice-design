import { Panel } from "../shared/Panel";
import { Users } from "lucide-react";
import { REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";

interface Props {
  terminology: QualityTerminology;
}

export const RepeatViolatorsSection = ({ terminology }: Props) => {
  const recurringCount = REPEAT_VIOLATORS.filter((v) => v.badge === "RECURRING").length;

  return (
    <Panel
      title={`${terminology.repeatOffenderLabel}s`}
      icon={Users}
      info={`${terminology.entityLabel}s with 3+ ${terminology.negativeEventLabel.toLowerCase()}s in 7 days. Recurring badge = seen on 4+ days.`}
    >
      {/* Headline stat */}
      <div className="flex items-center gap-4 mb-4 pb-4 border-b border-neutral-50">
        <div>
          <p className="text-4xl font-black font-data text-neutral-900">{REPEAT_VIOLATORS.length}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">
            Total {terminology.repeatOffenderLabel}s
          </p>
        </div>
        <div className="ml-6">
          <p className="text-2xl font-black font-data text-amber-600">{recurringCount}</p>
          <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">
            Recurring (4+ days)
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {[
                `${terminology.entityLabel} ID`,
                `${terminology.negativeEventLabel}s`,
                "Days Seen",
                "Zones",
                "Last Seen",
                "Top Types",
                "Badge",
                "Action",
              ].map((h) => (
                <th
                  key={h}
                  className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3 whitespace-nowrap"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {REPEAT_VIOLATORS.map((v) => (
              <tr
                key={v.tracker_id}
                className="border-b border-neutral-50 hover:bg-neutral-50 transition-colors"
              >
                <td className="py-2.5 pr-3 font-semibold text-neutral-700">{v.anonymized_label}</td>
                <td className="py-2.5 pr-3 font-black font-data tabular-nums text-red-500">{v.violation_count}</td>
                <td className="py-2.5 pr-3 text-neutral-600">{v.days_seen}</td>
                <td className="py-2.5 pr-3 text-neutral-500">{v.zones.join(", ")}</td>
                <td className="py-2.5 pr-3 text-neutral-400 font-data text-[10px] whitespace-nowrap">
                  {new Date(v.last_violation_ts).toLocaleString("en-GB", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </td>
                <td className="py-2.5 pr-3 text-neutral-500">
                  {Object.entries(v.violation_types)
                    .map(([type, count]) => `${type}(${count})`)
                    .join(", ")}
                </td>
                <td className="py-2.5 pr-3">
                  {v.badge === "RECURRING" ? (
                    <span className="text-[9px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                      RECURRING
                    </span>
                  ) : (
                    <span className="text-[10px] text-neutral-300">—</span>
                  )}
                </td>
                <td className="py-2.5">
                  <button className="text-[10px] font-bold text-red-600 hover:text-red-800 bg-red-50 hover:bg-red-100 px-2 py-1 rounded-md transition-colors whitespace-nowrap">
                    Flag for Review
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
