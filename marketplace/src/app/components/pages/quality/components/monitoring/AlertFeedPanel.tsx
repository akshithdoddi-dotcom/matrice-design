import { useState } from "react";
import { Panel } from "../shared/Panel";
import { Bell } from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { QualityTerminology, AlertEvent } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";

interface Props {
  terminology: QualityTerminology;
}

type FilterTab = "All" | "CRITICAL" | "HIGH" | "MEDIUM";

const severityRowBg: Record<string, string> = {
  CRITICAL: "bg-red-50 hover:bg-red-100",
  HIGH:     "bg-orange-50 hover:bg-orange-100",
  MEDIUM:   "bg-amber-50 hover:bg-amber-100",
  LOW:      "bg-blue-50 hover:bg-blue-100",
};

function formatTs(ts: string) {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
}

export const AlertFeedPanel = ({ terminology: _terminology }: Props) => {
  const [filter, setFilter] = useState<FilterTab>("All");

  const sorted = [...ALERTS].sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
  );

  const filtered: AlertEvent[] =
    filter === "All" ? sorted : sorted.filter((a) => a.severity === filter);

  const tabs: FilterTab[] = ["All", "CRITICAL", "HIGH", "MEDIUM"];

  const counts: Record<FilterTab, number> = {
    All:      sorted.length,
    CRITICAL: sorted.filter((a) => a.severity === "CRITICAL").length,
    HIGH:     sorted.filter((a) => a.severity === "HIGH").length,
    MEDIUM:   sorted.filter((a) => a.severity === "MEDIUM").length,
  };

  return (
    <Panel
      title="Alert Feed"
      icon={Bell}
      info="Live feed of alerts and incidents sorted by most recent. Filter by severity."
    >
      {/* Filter tabs */}
      <div className="flex items-center gap-1 mb-3">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={cn(
              "px-2.5 py-1 text-[10px] font-bold rounded-md transition-all",
              filter === tab
                ? tab === "CRITICAL"
                  ? "bg-red-500 text-white"
                  : tab === "HIGH"
                  ? "bg-orange-500 text-white"
                  : tab === "MEDIUM"
                  ? "bg-amber-400 text-neutral-900"
                  : "bg-neutral-800 text-white"
                : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
            )}
          >
            {tab} ({counts[tab]})
          </button>
        ))}
      </div>

      {/* Table */}
      <DataGrid<AlertEvent>
        data={filtered}
        columns={[
          {
            key: "time",
            header: "Time",
            width: "72px",
            render: (alert, hovered) => (
              <MonoCell hovered={hovered} fontSize={10}>{formatTs(alert.timestamp)}</MonoCell>
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
            key: "name",
            header: "Alert",
            width: "140px",
            render: (alert, hovered) => (
              <InterCell hovered={hovered} isPrimary>{alert.name}</InterCell>
            ),
          },
          {
            key: "zone",
            header: "Zone",
            width: "100px",
            render: (alert, hovered) => (
              <InterCell hovered={hovered}>{alert.zone}</InterCell>
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
            width: "100px",
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
