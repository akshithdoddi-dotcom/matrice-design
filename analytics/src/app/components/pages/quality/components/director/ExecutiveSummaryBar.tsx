import { SCORECARD_DATA, SIX_MONTH_DATA, KPI_CARDS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props {
  terminology: QualityTerminology;
}

export const ExecutiveSummaryBar = ({ terminology }: Props) => {
  const latestMonth = SIX_MONTH_DATA[SIX_MONTH_DATA.length - 1];
  const prevMonth = SIX_MONTH_DATA[SIX_MONTH_DATA.length - 2];

  const stats = [
    {
      label: terminology.primaryMetricLabel,
      value: `${latestMonth.compliance_pct.toFixed(1)}%`,
      delta: latestMonth.compliance_pct - prevMonth.compliance_pct,
      deltaSuffix: "pp",
      positive: true,
      context: `Target: 90%`,
    },
    {
      label: "Monthly Violations",
      value: SCORECARD_DATA.find((s) => s.metric === "Total Violations (Month)")?.this_period.toLocaleString() ?? "312",
      delta: -77,
      deltaSuffix: "",
      positive: true,
      context: "vs. last month",
    },
    {
      label: `${terminology.negativeEventLabel} Rate`,
      value: `${latestMonth.defect_rate_pct.toFixed(1)}%`,
      delta: latestMonth.defect_rate_pct - prevMonth.defect_rate_pct,
      deltaSuffix: "pp",
      positive: true,
      context: "Target: <1%",
    },
    {
      label: "Cost of Quality",
      value: "$8,200",
      delta: -1400,
      deltaSuffix: "",
      positive: true,
      context: "vs. last month",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isUp = stat.delta > 0;
        const deltaColor =
          stat.positive
            ? isUp
              ? "text-emerald-600 bg-emerald-50 border-emerald-200"
              : "text-red-500 bg-red-50 border-red-200"
            : isUp
            ? "text-red-500 bg-red-50 border-red-200"
            : "text-emerald-600 bg-emerald-50 border-emerald-200";

        return (
          <div
            key={stat.label}
            className="bg-white rounded-[4px] border border-neutral-100 p-5 shadow-sm flex flex-col gap-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">
              {stat.label}
            </p>
            <p className="text-3xl font-black font-data text-neutral-900">{stat.value}</p>
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 text-[11px] font-bold border px-2 py-0.5 rounded-full",
                  deltaColor
                )}
              >
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {stat.delta > 0 ? "+" : ""}
                {stat.delta.toFixed ? stat.delta.toFixed(1) : stat.delta}
                {stat.deltaSuffix}
              </span>
              <span className="text-[10px] text-neutral-400">{stat.context}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
