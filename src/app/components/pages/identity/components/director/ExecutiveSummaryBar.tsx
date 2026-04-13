import { IDENTITY_KPI_CARDS, SIX_MONTH_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const ExecutiveSummaryBar = ({ terminology: _terminology }: Props) => {
  const latestMonth = SIX_MONTH_TREND[SIX_MONTH_TREND.length - 1];
  const prevMonth = SIX_MONTH_TREND[SIX_MONTH_TREND.length - 2];

  const stats = [
    {
      label: "Match Accuracy",
      value: `${latestMonth.accuracy_pct}%`,
      delta: `+${(latestMonth.accuracy_pct - prevMonth.accuracy_pct).toFixed(1)}pp`,
      up: true,
      positive: true,
      benchmark: "Target: 97%",
    },
    {
      label: "Unknown Rate",
      value: `${latestMonth.unknown_rate_pct}%`,
      delta: `-${(prevMonth.unknown_rate_pct - latestMonth.unknown_rate_pct).toFixed(1)}pp`,
      up: false,
      positive: true,
      benchmark: "Target: <5%",
    },
    {
      label: "Monthly Identifications",
      value: latestMonth.total_identifications.toLocaleString(),
      delta: `+${((latestMonth.total_identifications - prevMonth.total_identifications) / prevMonth.total_identifications * 100).toFixed(1)}%`,
      up: true,
      positive: true,
      benchmark: "vs. last month",
    },
    {
      label: "Blacklist Hits (MTD)",
      value: String(latestMonth.blacklist_hits),
      delta: latestMonth.blacklist_hits <= prevMonth.blacklist_hits ? `↓ from ${prevMonth.blacklist_hits}` : `↑ from ${prevMonth.blacklist_hits}`,
      up: latestMonth.blacklist_hits > prevMonth.blacklist_hits,
      positive: latestMonth.blacklist_hits <= prevMonth.blacklist_hits,
      benchmark: "All confirmed",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-6">
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{stat.label}</p>
          <p className="text-3xl font-black font-data text-neutral-900 mt-2">{stat.value}</p>
          <div className={cn("flex items-center gap-1 mt-2 text-sm font-semibold",
            stat.positive ? "text-emerald-600" : "text-red-500"
          )}>
            {stat.up
              ? <TrendingUp className="w-4 h-4" />
              : <TrendingDown className="w-4 h-4" />}
            <span>{stat.delta}</span>
          </div>
          <p className="text-[10px] text-neutral-400 mt-1">{stat.benchmark}</p>
        </div>
      ))}
    </div>
  );
};
