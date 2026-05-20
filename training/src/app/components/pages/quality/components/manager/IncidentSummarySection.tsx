import { useState } from "react";
import { Panel } from "../shared/Panel";
import { FileText } from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { QualityTerminology, AlertEvent } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@fe-common/components/ui/DataGrid";

interface Props {
  terminology: QualityTerminology;
}

type FilterTab = "All" | "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";

export const IncidentSummarySection = ({ terminology: _terminology }: Props) => {
  const [filter, setFilter] = useState<FilterTab>("All");

  const incidents = ALERTS.filter((a) => a.event_type === "INCIDENT");
  const all = ALERTS; // show all events for richer feed

  const filtered: AlertEvent[] =
    filter === "All" ? all : all.filter((a) => a.status === filter);

  const resolved = all.filter((a) => a.status === "RESOLVED").length;
  const open = all.filter((a) => a.status === "ACTIVE").length;
  const acknowledged = all.filter((a) => a.status === "ACKNOWLEDGED").length;
  // Avg resolution time (simulated)
  const avgResolutionMin = 23;

  const tabs: FilterTab[] = ["All", "ACTIVE", "ACKNOWLEDGED", "RESOLVED"];

  return (
    <Panel
      title="Incident Summary"
      icon={FileText}
      info="Summary of incidents and alerts with resolution tracking."
    >
      {/* Summary bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        {[
          { label: "Total", value: all.length,     color: "text-neutral-700", bg: "bg-neutral-50" },
          { label: "Open",  value: open,            color: "text-red-600",     bg: "bg-red-50" },
          { label: "Acknowledged", value: acknowledged, color: "text-amber-600", bg: "bg-amber-50" },
          { label: "Avg Resolution", value: `${avgResolutionMin}m`, color: "text-emerald-600", bg: "bg-emerald-50" },
        ].map((stat) => (
          <div key={stat.label} className={cn("rounded-[4px] p-3 text-center border border-neutral-100", stat.bg)}>
            <p className={cn("text-2xl font-black font-data", stat.color)}>{stat.value}</p>
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
              filter === tab
                ? "bg-neutral-800 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <DataGrid<AlertEvent>
        data={filtered}
        columns={[
          {
            key: "id",
            header: "ID",
            width: "72px",
            render: (alert, hovered) => (
              <MonoCell hovered={hovered} fontSize={10} color="#94A3B8">{alert.id}</MonoCell>
            ),
          },
          {
            key: "time",
            header: "Time",
            width: "60px",
            render: (alert, hovered) => (
              <MonoCell hovered={hovered} fontSize={10}>
                {new Date(alert.timestamp).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
              </MonoCell>
            ),
          },
          {
            key: "type",
            header: "Type",
            width: "80px",
            render: (alert, hovered) => (
              <InterCell hovered={hovered} color="#64748B">{alert.event_type}</InterCell>
            ),
          },
          {
            key: "severity",
            header: "Severity",
            width: "88px",
            render: (alert) => (
              <StatusCapsule status={alert.severity.toLowerCase()} />
            ),
          },
          {
            key: "zone",
            header: "Zone",
            width: "100px",
            render: (alert, hovered) => (
              <InterCell hovered={hovered} color="#64748B">{alert.zone}</InterCell>
            ),
          },
          {
            key: "message",
            header: "Message",
            width: "1fr",
            render: (alert, hovered) => (
              <InterCell hovered={hovered} color="#64748B" className="truncate block">{alert.message}</InterCell>
            ),
          },
          {
            key: "status",
            header: "Status",
            width: "108px",
            render: (alert) => (
              <StatusCapsule
                status={alert.status === "ACTIVE" ? "active" : alert.status === "ACKNOWLEDGED" ? "warning" : "resolved"}
                label={alert.status}
              />
            ),
          },
        ]}
      />
    </Panel>
  );
};
