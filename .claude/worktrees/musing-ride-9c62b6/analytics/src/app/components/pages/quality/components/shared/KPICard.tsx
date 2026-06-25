import type { KPICardData } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface KPICardProps { card: KPICardData }

export const KPICard = ({ card }: KPICardProps) => {
  const isPositive = card.comparison.sentiment === "positive";
  const isUp = card.comparison.direction === "up";
  const deltaColor = isPositive ? "text-emerald-600" : "text-red-500";
  const sparkData = card.sparkline_7d.map((v, i) => ({ i, v }));

  const displayValue =
    card.unit === "%"
      ? `${card.value.toFixed(1)}%`
      : card.value.toLocaleString();

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 p-4 shadow-sm flex flex-col gap-3">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">{card.label}</p>
          <p className="text-2xl font-black font-data text-neutral-900 mt-1">{displayValue}</p>
        </div>
        <div className={cn("flex items-center gap-0.5 text-xs font-semibold font-data mt-1", deltaColor)}>
          {isUp
            ? <TrendingUp className="w-3.5 h-3.5" />
            : <TrendingDown className="w-3.5 h-3.5" />}
          {card.comparison.delta > 0 ? "+" : ""}
          {card.unit === "%" ? `${card.comparison.delta.toFixed(1)}pp` : card.comparison.delta}
        </div>
      </div>
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={sparkData}>
          <Line
            type="monotone"
            dataKey="v"
            stroke={isPositive ? "#00775B" : "#EF4444"}
            strokeWidth={1.5}
            dot={false}
          />
        </LineChart>
      </ResponsiveContainer>
      <p className="text-[10px] text-neutral-400">
        vs. {card.comparison.period} ·{" "}
        <span className="font-data text-neutral-500">{card.definition}</span>
      </p>
    </div>
  );
};
