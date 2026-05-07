import { KPI_CARDS } from "../../data/mockData";
import type { QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { AreaChart, Area, YAxis, ResponsiveContainer } from "recharts";

interface Props {
  terminology: QualityTerminology;
}

export const KPISummaryRow = ({ terminology: _terminology }: Props) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {KPI_CARDS.map((card) => {
        const isPos = card.comparison.sentiment === "positive";
        const isUp = card.comparison.direction === "up";
        const deltaPositive = isPos;
        const displayValue = card.unit === "%" ? `${card.value.toFixed(1)}%` : card.value.toLocaleString();
        const sparkData = card.sparkline_7d.map((v, i) => ({ i, v }));
        const lineColor = isPos ? "#00775B" : "#EF4444";
        const numColor = card.status === "GREEN" ? "text-emerald-700" : card.status === "AMBER" ? "text-amber-600" : "text-red-700";
        const borderColor = card.status === "GREEN" ? "border-neutral-200" : card.status === "AMBER" ? "border-amber-200" : "border-red-200";

        return (
          <div
            key={card.id}
            className={cn("bg-white rounded-[4px] border shadow-sm flex flex-col overflow-hidden", borderColor)}
          >
            <div className="px-4 pt-4 pb-2">
              <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400 mb-2">
                {card.label}
              </div>
              <div className={cn("text-[36px] font-black font-data tabular-nums leading-none", numColor)}>
                {displayValue}
              </div>
              <div className={cn("mt-1.5 flex items-center gap-1 text-[10px] font-semibold",
                deltaPositive ? "text-emerald-600" : "text-red-500"
              )}>
                {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {card.comparison.delta > 0 ? "+" : ""}
                {card.unit === "%" ? `${card.comparison.delta.toFixed(1)}pp` : card.comparison.delta} vs {card.comparison.period.toLowerCase()}
              </div>
            </div>
            {/* 7-day sparkline */}
            <div className="px-0">
              <ResponsiveContainer width="100%" height={48}>
                <AreaChart data={sparkData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id={`kpi-${card.id}`} x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={lineColor} stopOpacity={0.2} />
                      <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} hide />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke={lineColor}
                    strokeWidth={1.5}
                    fill={`url(#kpi-${card.id})`}
                    dot={false}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="px-4 pb-3">
              <span className="text-[9px] text-neutral-300 font-bold uppercase tracking-wide">
                7-day trend
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
};
