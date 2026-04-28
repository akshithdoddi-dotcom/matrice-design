import { useState } from "react";
import { Users, ChevronRight } from "lucide-react";
import { REPEAT_VIOLATORS } from "../../data/mockData";
import type { QualityTerminology, RepeatViolator } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { ViolatorDetailPanel } from "../panels/ViolatorDetailPanel";
import { DataGrid, MonoCell, InterCell, StatusCapsule, GridActions, GridActionButton } from "@/app/components/ui/DataGrid";

interface Props {
  terminology: QualityTerminology;
}

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) + " · " +
    d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
}

export const RepeatViolatorsTable = ({ terminology }: Props) => {
  const [selectedViolator, setSelectedViolator] = useState<RepeatViolator | null>(null);

  const sorted = [...REPEAT_VIOLATORS].sort((a, b) => b.violation_count - a.violation_count);

  return (
    <>
      <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-neutral-50">
          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">
              {terminology.repeatOffenderLabel}s
            </span>
          </div>
          <span className="inline-flex h-5 items-center rounded-[2px] bg-amber-50 border border-amber-200 px-1.5 text-[9px] font-black uppercase tracking-wide text-amber-700">
            {sorted.filter(v => v.badge === "RECURRING").length} Recurring
          </span>
        </div>

        <DataGrid<RepeatViolator>
          data={sorted}
          getRowId={(v) => v.tracker_id}
          onRowClick={(v) => setSelectedViolator(v)}
          columns={[
            {
              key: "rank",
              header: "#",
              width: "36px",
              render: (_v, hovered) => {
                const idx = sorted.findIndex(x => x.tracker_id === _v.tracker_id);
                return (
                  <MonoCell hovered={hovered} fontSize={10} color="#CBD5E1">{idx + 1}</MonoCell>
                );
              },
            },
            {
              key: "entity",
              header: terminology.entityLabel,
              width: "1fr",
              render: (v, hovered) => {
                const isRecurring = v.badge === "RECURRING";
                return (
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-[2px] flex items-center justify-center text-[9px] font-black shrink-0",
                      isRecurring ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-500"
                    )}>
                      {v.tracker_id}
                    </div>
                    <InterCell hovered={hovered} isPrimary fontSize={12}>{v.anonymized_label}</InterCell>
                  </div>
                );
              },
            },
            {
              key: "zones",
              header: "Zones",
              width: "140px",
              render: (v) => (
                <div className="flex flex-wrap gap-1">
                  {v.zones.map(zone => (
                    <span key={zone} className="inline-flex h-5 items-center rounded-[2px] border border-neutral-200 bg-neutral-50 px-1.5 text-[9px] font-semibold text-neutral-600">
                      {zone}
                    </span>
                  ))}
                </div>
              ),
            },
            {
              key: "top_violation",
              header: `Top ${terminology.negativeEventLabel}`,
              width: "1fr",
              render: (v, hovered) => {
                const topType = Object.entries(v.violation_types).sort((a, b) => b[1] - a[1])[0];
                return topType ? (
                  <InterCell hovered={hovered} color="#475569">
                    {topType[0]}
                    <span style={{ marginLeft: 4, fontFamily: "monospace", fontSize: 10, color: "#94A3B8" }}>({topType[1]}×)</span>
                  </InterCell>
                ) : <span>—</span>;
              },
            },
            {
              key: "violation_count",
              header: terminology.negativeCountLabel,
              width: "72px",
              align: "right",
              render: (v, hovered) => (
                <MonoCell hovered={hovered} isPrimary fontSize={15} color="#EF4444" hoveredColor="#DC2626">
                  {v.violation_count}
                </MonoCell>
              ),
            },
            {
              key: "days_seen",
              header: "Days",
              width: "52px",
              align: "right",
              render: (v, hovered) => (
                <MonoCell hovered={hovered} color="#475569">{v.days_seen}d</MonoCell>
              ),
            },
            {
              key: "last_seen",
              header: "Last Seen",
              width: "120px",
              align: "right",
              render: (v, hovered) => (
                <MonoCell hovered={hovered} fontSize={11} color="#94A3B8">{formatTs(v.last_violation_ts)}</MonoCell>
              ),
            },
            {
              key: "badge_chevron",
              header: "",
              width: "88px",
              align: "right",
              render: (v, hovered) => (
                <div className="flex items-center justify-end gap-2">
                  {v.badge === "RECURRING" && (
                    <StatusCapsule status="warning" label="RECURRING" />
                  )}
                  <ChevronRight
                    className="w-3.5 h-3.5 transition-colors"
                    style={{ color: hovered ? "#00775B" : "#CBD5E1" }}
                  />
                </div>
              ),
            },
          ]}
        />
      </div>

      <ViolatorDetailPanel
        violator={selectedViolator}
        onClose={() => setSelectedViolator(null)}
        terminology={terminology}
      />
    </>
  );
};
