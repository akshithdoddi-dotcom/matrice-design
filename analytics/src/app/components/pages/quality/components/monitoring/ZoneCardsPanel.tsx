import { useState } from "react";
import { MapPin, TrendingUp, TrendingDown, Minus, ChevronRight, UserPlus, Zap } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { QualityTerminology, ZoneMetric } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ZoneDetailPanel } from "../panels/ZoneDetailPanel";
import { DataGrid, DataGridColumn, StatusCapsule, MonoCell, InterCell } from "@fe-common/components/ui/DataGrid";

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
          {(() => {
            const gridData = ZONE_DATA.map(z => ({ ...z, id: z.zone_id }));
            const columns: DataGridColumn<typeof gridData[0]>[] = [
              {
                key: "zone_name",
                header: "Zone",
                width: "2fr",
                render: (zone, h) => {
                  const isHighRisk = zone.status === "HIGH_RISK";
                  return (
                    <div>
                      <div className="flex items-center gap-2">
                        {isHighRisk && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shrink-0" />
                        )}
                        <MonoCell hovered={h} isPrimary color={isHighRisk ? "#991B1B" : "#1E293B"}>
                          {zone.zone_name}
                        </MonoCell>
                      </div>
                      {zone.flag && (
                        <div className="text-[10px] text-amber-600 mt-0.5">{zone.flag}</div>
                      )}
                    </div>
                  );
                },
              },
              {
                key: "compliance_pct",
                header: terminology.primaryMetricLabel,
                width: "90px",
                align: "right",
                sortable: true,
                render: (zone, h) => {
                  const isHighRisk = zone.status === "HIGH_RISK";
                  const isGood = zone.compliance_pct >= 90;
                  const color = isHighRisk ? "#DC2626" : isGood ? "#059669" : "#D97706";
                  return (
                    <MonoCell hovered={h} color={color} hoveredColor={color} fontSize={13}>
                      {zone.compliance_pct.toFixed(1)}%
                    </MonoCell>
                  );
                },
              },
              {
                key: "violation_count",
                header: terminology.negativeCountLabel,
                width: "80px",
                align: "right",
                sortable: true,
                render: (zone, h) => (
                  <MonoCell hovered={h} color="#374151">{String(zone.violation_count)}</MonoCell>
                ),
              },
              {
                key: "top_violation_type",
                header: `Top ${terminology.negativeEventLabel}`,
                width: "2fr",
                render: (zone, h) => (
                  <InterCell hovered={h} color="#6B7280">{zone.top_violation_type}</InterCell>
                ),
              },
              {
                key: "trend",
                header: "Trend",
                width: "100px",
                align: "center",
                render: (zone) => {
                  if (zone.trend === "up") {
                    return (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                        <TrendingUp className="w-3 h-3" /> +{zone.trend_delta_pct}%
                      </span>
                    );
                  }
                  if (zone.trend === "down") {
                    return (
                      <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-red-500">
                        <TrendingDown className="w-3 h-3" /> {zone.trend_delta_pct}%
                      </span>
                    );
                  }
                  return (
                    <span className="inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                      <Minus className="w-3 h-3" /> Stable
                    </span>
                  );
                },
              },
              {
                key: "status",
                header: "Status",
                width: "90px",
                align: "center",
                render: (zone) => {
                  const isHighRisk = zone.status === "HIGH_RISK";
                  const isGood = zone.compliance_pct >= 90;
                  const capsuleStatus = isHighRisk ? "critical" : isGood ? "stable" : "warning";
                  const capsuleLabel = isHighRisk ? "HIGH RISK" : isGood ? "NORMAL" : "WATCH";
                  return <StatusCapsule status={capsuleStatus} label={capsuleLabel} />;
                },
              },
              {
                key: "actions",
                header: "",
                width: "80px",
                align: "center",
                render: (zone, h) => {
                  const isHighRisk = zone.status === "HIGH_RISK";
                  if (isHighRisk) {
                    return (
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
                    );
                  }
                  return (
                    <ChevronRight
                      className="w-3.5 h-3.5 transition-colors"
                      style={{ color: h ? "#00775B" : "#D1D5DB" }}
                    />
                  );
                },
              },
            ];
            return (
              <DataGrid
                columns={columns}
                data={gridData}
                onRowClick={(zone) => setSelectedZone(zone)}
                compact
              />
            );
          })()}
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
