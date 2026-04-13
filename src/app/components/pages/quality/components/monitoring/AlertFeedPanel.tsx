import { useState } from "react";
import { Panel } from "../shared/Panel";
import { StatusBadge } from "../shared/StatusBadge";
import { Bell } from "lucide-react";
import { ALERTS } from "../../data/mockData";
import type { QualityTerminology, AlertEvent } from "../../data/types";
import { cn } from "@/app/lib/utils";

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
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3 whitespace-nowrap">
                Time
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3">
                Severity
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3">
                Alert
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pr-3">
                Zone
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2">
                Message
              </th>
              <th className="text-left text-[10px] font-bold uppercase tracking-widest text-neutral-400 pb-2 pl-3">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((alert) => (
              <tr
                key={alert.id}
                className={cn(
                  "border-b border-neutral-50 transition-colors",
                  severityRowBg[alert.severity]
                )}
              >
                <td className="py-2 pr-3 text-neutral-500 whitespace-nowrap font-data text-[10px]">
                  {formatTs(alert.timestamp)}
                </td>
                <td className="py-2 pr-3">
                  <StatusBadge severity={alert.severity} />
                </td>
                <td className="py-2 pr-3 font-semibold text-neutral-700 whitespace-nowrap">
                  {alert.name}
                </td>
                <td className="py-2 pr-3 text-neutral-500 whitespace-nowrap">{alert.zone}</td>
                <td className="py-2 text-neutral-500 max-w-xs truncate">{alert.message}</td>
                <td className="py-2 pl-3">
                  <span
                    className={cn(
                      "text-[10px] font-bold px-2 py-0.5 rounded-full",
                      alert.status === "ACTIVE"
                        ? "bg-red-100 text-red-700"
                        : alert.status === "ACKNOWLEDGED"
                        ? "bg-amber-100 text-amber-700"
                        : "bg-emerald-100 text-emerald-700"
                    )}
                  >
                    {alert.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
