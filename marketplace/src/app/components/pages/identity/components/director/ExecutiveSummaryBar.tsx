import { SIX_MONTH_TREND, IDENTITY_SCORECARD } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const ExecutiveSummaryBar = ({ terminology }: Props) => {
  const latestMonth = SIX_MONTH_TREND[SIX_MONTH_TREND.length - 1];
  const prevMonth = SIX_MONTH_TREND[SIX_MONTH_TREND.length - 2];

  // suppress unused variable warning
  void IDENTITY_SCORECARD;

  const stats = [
    {
      label: "Match Accuracy",
      value: `${latestMonth.accuracy_pct}%`,
      delta: latestMonth.accuracy_pct - prevMonth.accuracy_pct,
      deltaSuffix: "pp",
      positiveWhenUp: true,
      context: "Target: 97%",
      accent: latestMonth.accuracy_pct >= 97 ? "emerald" : latestMonth.accuracy_pct >= 93 ? "amber" : "red",
    },
    {
      label: `${terminology.unknownShortLabel} Rate`,
      value: `${latestMonth.unknown_rate_pct}%`,
      delta: latestMonth.unknown_rate_pct - prevMonth.unknown_rate_pct,
      deltaSuffix: "pp",
      positiveWhenUp: false,
      context: "Target: <5%",
      accent: latestMonth.unknown_rate_pct < 5 ? "emerald" : latestMonth.unknown_rate_pct < 8 ? "amber" : "red",
    },
    {
      label: "Monthly Identifications",
      value: latestMonth.total_identifications.toLocaleString(),
      delta: ((latestMonth.total_identifications - prevMonth.total_identifications) / prevMonth.total_identifications * 100),
      deltaSuffix: "%",
      positiveWhenUp: true,
      context: "vs. last month",
      accent: "neutral",
    },
    {
      label: `${terminology.blacklistLabel} Hits MTD`,
      value: String(latestMonth.blacklist_hits),
      delta: latestMonth.blacklist_hits - prevMonth.blacklist_hits,
      deltaSuffix: "",
      positiveWhenUp: false,
      context: "All confirmed",
      accent: latestMonth.blacklist_hits === 0 ? "emerald" : latestMonth.blacklist_hits <= 3 ? "amber" : "red",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const isUp = stat.delta > 0;
        const isGood = stat.positiveWhenUp ? isUp : !isUp;
        const deltaColor = isGood ? "text-emerald-600" : stat.delta === 0 ? "text-neutral-400" : "text-red-500";
        const borderColor =
          stat.accent === "red" ? "border-red-200" :
          stat.accent === "amber" ? "border-amber-200" :
          stat.accent === "emerald" ? "border-emerald-200" : "border-neutral-200";
        const numColor =
          stat.accent === "red" ? "text-red-700" :
          stat.accent === "amber" ? "text-amber-600" :
          stat.accent === "emerald" ? "text-emerald-700" : "text-neutral-900";

        return (
          <div
            key={stat.label}
            className={cn("bg-white rounded-[4px] border shadow-sm p-4 flex flex-col gap-1.5", borderColor)}
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">
              {stat.label}
            </span>
            <span className={cn("text-[36px] font-black font-data tabular-nums leading-none", numColor)}>
              {stat.value}
            </span>
            <div className={cn("flex items-center gap-1 text-[10px] font-semibold", deltaColor)}>
              {stat.delta !== 0 && (isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
              <span>
                {stat.delta > 0 ? "+" : ""}
                {typeof stat.delta === "number"
                  ? `${Math.abs(stat.delta) < 1 ? stat.delta.toFixed(1) : Math.abs(stat.delta) < 10 ? stat.delta.toFixed(1) : Math.round(stat.delta)}${stat.deltaSuffix}`
                  : stat.delta}
              </span>
              <span className="text-neutral-400 font-normal">{stat.context}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
