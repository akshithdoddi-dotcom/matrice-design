import { useState } from "react";
import { Panel } from "../shared/Panel";
import { DoorOpen, ChevronUp, ChevronDown } from "lucide-react";
import { ENTRY_POINTS } from "../../data/mockData";
import type { EntryPoint, IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

type SortKey = keyof EntryPoint;

const STATUS_STYLE: Record<string, string> = {
  NORMAL:   "bg-emerald-100 text-emerald-700",
  WATCH:    "bg-amber-100 text-amber-700",
  CRITICAL: "bg-red-100 text-red-700",
};

export const EntryPointTable = ({ terminology }: Props) => {
  const [sortKey, setSortKey] = useState<SortKey>("identifications");
  const [sortAsc, setSortAsc] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const sorted = [...ENTRY_POINTS].sort((a, b) => {
    const av = a[sortKey], bv = b[sortKey];
    if (typeof av === "number" && typeof bv === "number")
      return sortAsc ? av - bv : bv - av;
    return sortAsc
      ? String(av).localeCompare(String(bv))
      : String(bv).localeCompare(String(av));
  });

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortAsc((a) => !a);
    else { setSortKey(key); setSortAsc(false); }
  };

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k
      ? (sortAsc ? <ChevronUp className="w-3 h-3 inline" /> : <ChevronDown className="w-3 h-3 inline" />)
      : null;

  return (
    <Panel
      title="Entry Point Performance"
      icon={DoorOpen}
      info={`${terminology.identLabel} match rates and denial counts by entry point. Click a row to highlight.`}
    >
      {selectedEntry && (
        <div className="mb-3 flex items-center gap-2 text-xs text-[#00775B] font-semibold">
          <span>Viewing: {selectedEntry}</span>
          <button onClick={() => setSelectedEntry(null)} className="text-neutral-400 hover:text-neutral-600 underline">Clear</button>
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-neutral-100">
              {[
                { key: "name" as SortKey, label: "Entry Point" },
                { key: "identifications" as SortKey, label: `${terminology.identLabel}s` },
                { key: "match_rate_pct" as SortKey, label: "Match %" },
                { key: "unknown_rate_pct" as SortKey, label: "Unknown %" },
                { key: "denied_count" as SortKey, label: "Denied" },
                { key: "blacklist_hits" as SortKey, label: "BL Hits" },
                { key: "status" as SortKey, label: "Status" },
              ].map((col) => (
                <th
                  key={col.key}
                  className="text-left py-2 px-2 text-[10px] font-bold uppercase tracking-wider text-neutral-400 cursor-pointer hover:text-neutral-600 whitespace-nowrap"
                  onClick={() => handleSort(col.key)}
                >
                  {col.label} <SortIcon k={col.key} />
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((entry) => (
              <tr
                key={entry.entry_id}
                onClick={() => setSelectedEntry(entry.name === selectedEntry ? null : entry.name)}
                className={cn(
                  "border-b border-neutral-50 cursor-pointer hover:bg-neutral-50 transition-colors",
                  entry.name === selectedEntry && "bg-emerald-50"
                )}
              >
                <td className="py-2.5 px-2 font-semibold text-neutral-800">
                  {entry.name}
                  {entry.flag && (
                    <span className="ml-1.5 text-[9px] text-orange-600 font-bold">⚠ {entry.flag}</span>
                  )}
                </td>
                <td className="py-2.5 px-2 tabular-nums font-data">{entry.identifications.toLocaleString()}</td>
                <td className={cn("py-2.5 px-2 font-semibold tabular-nums font-data",
                  entry.match_rate_pct >= 97 ? "text-emerald-600" :
                  entry.match_rate_pct >= 94 ? "text-amber-600" : "text-red-600"
                )}>
                  {entry.match_rate_pct.toFixed(1)}%
                </td>
                <td className={cn("py-2.5 px-2 tabular-nums font-data",
                  entry.unknown_rate_pct > 7 ? "text-red-600 font-semibold" :
                  entry.unknown_rate_pct > 4 ? "text-amber-600" : "text-neutral-700"
                )}>
                  {entry.unknown_rate_pct.toFixed(1)}%
                </td>
                <td className="py-2.5 px-2 tabular-nums font-data text-neutral-700">{entry.denied_count}</td>
                <td className={cn("py-2.5 px-2 tabular-nums font-data font-bold",
                  entry.blacklist_hits > 0 ? "text-red-600" : "text-neutral-400"
                )}>
                  {entry.blacklist_hits}
                </td>
                <td className="py-2.5 px-2">
                  <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", STATUS_STYLE[entry.status])}>
                    {entry.status}
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
