import { useState } from "react";
import { Panel } from "../shared/Panel";
import { Map } from "lucide-react";
import { ZONE_DATA } from "../../data/mockData";
import type { ZoneMetric, QualityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@fe-common/components/ui/DataGrid";

interface Props {
  terminology: QualityTerminology;
}

type SortKey = keyof ZoneMetric;

export const ZonePerformanceTable = ({ terminology }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("compliance_pct");
  const [sortAsc, setSortAsc] = useState(true);

  const sorted = [...ZONE_DATA].sort((a, b) => {
    const av = a[sortKey] as number | string;
    const bv = b[sortKey] as number | string;
    if (typeof av === "number" && typeof bv === "number") {
      return sortAsc ? av - bv : bv - av;
    }
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const handleSort = (key: SortKey) => {
    if (sortKey === key) setSortAsc((v) => !v);
    else { setSortKey(key); setSortAsc(true); }
  };

  const SortBtn = ({ col }: { col: SortKey }) => (
    <button onClick={() => handleSort(col)} className="ml-1 hover:text-neutral-600 transition-colors">
      {sortKey === col ? (
        sortAsc ? <ArrowUp className="w-3 h-3 inline" /> : <ArrowDown className="w-3 h-3 inline" />
      ) : (
        <Minus className="w-3 h-3 inline opacity-30" />
      )}
    </button>
  );

  const rowBg = (status: ZoneMetric["status"]) => {
    if (status === "HIGH_RISK") return "bg-red-50";
    if (status === "WATCH" || status === "AMBER") return "bg-amber-50";
    return "";
  };

  const compColor = (pct: number) =>
    pct >= 90 ? "text-emerald-600" : pct >= 80 ? "text-amber-600" : "text-red-600";

  return (
    <Panel
      title="Zone Performance"
      icon={Map}
      info="Sortable table of zone compliance, violations, and risk status."
    >
      <DataGrid<ZoneMetric>
        data={sorted}
        getRowId={(z) => z.zone_id}
        columns={[
          {
            key: "zone_name",
            header: "Zone",
            width: "1fr",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("zone_name")}
              >
                Zone <SortBtn col="zone_name" />
              </span>
            ),
            render: (zone, hovered) => (
              <InterCell hovered={hovered} isPrimary>{zone.zone_name}</InterCell>
            ),
          },
          {
            key: "compliance_pct",
            header: terminology.primaryMetricLabel,
            width: "100px",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("compliance_pct")}
              >
                {terminology.primaryMetricLabel} <SortBtn col="compliance_pct" />
              </span>
            ),
            render: (zone, hovered) => {
              const c = zone.compliance_pct >= 90 ? "#059669" : zone.compliance_pct >= 80 ? "#D97706" : "#DC2626";
              return (
                <MonoCell hovered={hovered} isPrimary color={c} hoveredColor={c}>
                  {zone.compliance_pct.toFixed(1)}%
                </MonoCell>
              );
            },
          },
          {
            key: "violation_count",
            header: terminology.negativeCountLabel,
            width: "80px",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("violation_count")}
              >
                {terminology.negativeCountLabel} <SortBtn col="violation_count" />
              </span>
            ),
            render: (zone, hovered) => (
              <MonoCell hovered={hovered} isPrimary>{zone.violation_count}</MonoCell>
            ),
          },
          {
            key: "top_violation_type",
            header: `Top ${terminology.negativeEventLabel}`,
            width: "1fr",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("top_violation_type")}
              >
                Top {terminology.negativeEventLabel} <SortBtn col="top_violation_type" />
              </span>
            ),
            render: (zone, hovered) => (
              <InterCell hovered={hovered} color="#64748B">{zone.top_violation_type}</InterCell>
            ),
          },
          {
            key: "peak_violation_hour",
            header: "Peak Hour",
            width: "80px",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("peak_violation_hour")}
              >
                Peak Hour <SortBtn col="peak_violation_hour" />
              </span>
            ),
            render: (zone, hovered) => (
              <MonoCell hovered={hovered} color="#64748B">{zone.peak_violation_hour}:00</MonoCell>
            ),
          },
          {
            key: "trend",
            header: "Trend",
            width: "80px",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("trend")}
              >
                Trend <SortBtn col="trend" />
              </span>
            ),
            render: (zone) => (
              <>
                {zone.trend === "up" && (
                  <span className="flex items-center gap-0.5 text-emerald-600 font-bold text-[10px]">
                    <ArrowUp className="w-3 h-3" /> +{zone.trend_delta_pct}%
                  </span>
                )}
                {zone.trend === "down" && (
                  <span className="flex items-center gap-0.5 text-red-500 font-bold text-[10px]">
                    <ArrowDown className="w-3 h-3" /> {zone.trend_delta_pct}%
                  </span>
                )}
                {zone.trend === "stable" && (
                  <span className="flex items-center gap-0.5 text-neutral-400 font-bold text-[10px]">
                    <Minus className="w-3 h-3" /> {zone.trend_delta_pct}%
                  </span>
                )}
              </>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: "100px",
            headerContent: (
              <span
                className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 cursor-pointer hover:text-neutral-600"
                onClick={() => handleSort("status")}
              >
                Status <SortBtn col="status" />
              </span>
            ),
            render: (zone) => {
              const s = zone.status === "HIGH_RISK" ? "critical"
                : zone.status === "WATCH" || zone.status === "AMBER" ? "warning"
                : "stable";
              return <StatusCapsule status={s} label={zone.status.replace("_", " ")} />;
            },
          },
        ]}
      />
    </Panel>
  );
};
