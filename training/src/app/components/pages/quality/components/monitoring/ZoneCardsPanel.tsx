import { useState } from "react";
import { MapPin, TrendingUp, TrendingDown, Minus, ChevronRight, UserPlus, Zap } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { QualityTerminology, ZoneMetric } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ZoneDetailPanel } from "../panels/ZoneDetailPanel";

interface Props {
  terminology: QualityTerminology;
}

export const ZoneCardsPanel = ({ terminology }: Props) => {
  const [selectedZone, setSelectedZone] = useState<ZoneMetric | null>(null);
  const [dispatched, setDispatched] = useState<Set<string>>(new Set());

  const handleDispatch = (zoneId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDispatched(prev => new Set([...prev, zoneId]));
    setTimeout(() => setDispatched(prev => {
      const next = new Set(prev); next.delete(zoneId); return next;
    }), 3000);
  };

  return (
    <>
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              Zone Overview
            </span>
          </div>
          <span className="text-[10px] text-neutral-400">Click zone to drill down</span>
        </div>

        <div className="p-4">
          <div className="overflow-x-auto -mx-4 -mb-4">
            <table className="w-full min-w-[600px] text-xs">
              <thead>
                <tr className="border-b border-neutral-100 bg-neutral-50/80">
                  <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Zone</th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.primaryMetricLabel}</th>
                  <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">{terminology.negativeCountLabel}</th>
                  <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Top {terminology.negativeEventLabel}</th>
                  <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Trend</th>
                  <th className="px-2 py-2 text-center text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
                  <th className="pl-2 pr-4 py-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-50">
                {ZONE_DATA.map((zone) => {
                  const isHighRisk = zone.status === "HIGH_RISK";
                  const isGood = zone.compliance_pct >= 90;
                  const rateColor = isHighRisk ? "text-red-600" : isGood ? "text-emerald-600" : "text-amber-600";
                  const statusBg = isHighRisk ? "bg-red-50 border-red-200 text-red-700" : isGood ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700";
                  const statusLabel = isHighRisk ? "HIGH RISK" : isGood ? "NORMAL" : "WATCH";

                  return (
                    <tr
                      key={zone.zone_id}
                      onClick={() => setSelectedZone(zone)}
                      className={cn(
                        "transition-colors group cursor-pointer",
                        isHighRisk ? "bg-red-50/20 hover:bg-red-50/40 border-l-2 border-l-red-400" : "hover:bg-neutral-50/60 border-l-2 border-l-transparent"
                      )}
                    >
                      <td className="pl-4 pr-2 py-3">
                        <div className="flex items-center gap-2">
                          {isHighRisk && (
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                          )}
                          <span className={cn("text-[12px] font-semibold", isHighRisk ? "text-red-800" : "text-neutral-800")}>
                            {zone.zone_name}
                          </span>
                        </div>
                        {zone.flag && (
                          <div className="text-[10px] text-amber-600 mt-0.5 pl-0">{zone.flag}</div>
                        )}
                      </td>
                      <td className="px-2 py-3 text-right">
                        <span className={cn("font-data tabular-nums text-[15px] font-black", rateColor)}>
                          {zone.compliance_pct.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-2 py-3 text-right font-data tabular-nums text-[13px] font-bold text-neutral-700">
                        {zone.violation_count}
                      </td>
                      <td className="px-2 py-3 text-[11px] text-neutral-500">
                        {zone.top_violation_type}
                      </td>
                      <td className="px-2 py-3 text-center">
                        {zone.trend === "up" ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                            <TrendingUp className="w-3 h-3" /> +{zone.trend_delta_pct}%
                          </span>
                        ) : zone.trend === "down" ? (
                          <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
                            <TrendingDown className="w-3 h-3" /> {zone.trend_delta_pct}%
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                            <Minus className="w-3 h-3" /> Stable
                          </span>
                        )}
                      </td>
                      <td className="px-2 py-3 text-center">
                        <span className={cn("inline-flex h-5 items-center rounded-[2px] border px-1.5 text-[9px] font-black uppercase tracking-wide", statusBg)}>
                          {statusLabel}
                        </span>
                      </td>
                      <td className="pl-2 pr-4 py-3">
                        {isHighRisk ? (
                          <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                            {dispatched.has(zone.zone_id) ? (
                              <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                                <Zap className="w-3 h-3" />Sent
                              </span>
                            ) : (
                              <button
                                onClick={(e) => handleDispatch(zone.zone_id, e)}
                                className="inline-flex items-center gap-1 h-6 px-2 rounded-[3px] bg-red-600 text-white text-[9px] font-bold hover:bg-red-700 transition-colors whitespace-nowrap"
                              >
                                <UserPlus className="w-2.5 h-2.5" />
                                Deploy
                              </button>
                            )}
                          </div>
                        ) : (
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-300 group-hover:text-[#00775B] transition-colors" />
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <ZoneDetailPanel
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        terminology={terminology}
      />
    </>
  );
};
