import { useState } from "react";
import { Panel } from "../shared/Panel";
import { DoorOpen, ChevronUp, ChevronDown } from "lucide-react";
import { ENTRY_POINTS } from "../../data/mockData";
import type { EntryPoint, IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";

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

  const columns: DataGridColumn<EntryPoint>[] = [
    {
      key: "name",
      header: `Entry Point`,
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("name")}
        >
          Entry Point <SortIcon k="name" />
        </span>
      ),
      width: "1fr",
      render: (entry, hovered) => (
        <div>
          <InterCell hovered={hovered} isPrimary>
            {entry.name}
            {entry.flag && (
              <span className="ml-1.5 text-[9px] text-orange-600 font-bold">⚠ {entry.flag}</span>
            )}
          </InterCell>
        </div>
      ),
    },
    {
      key: "identifications",
      header: `${terminology.identLabel}s`,
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("identifications")}
        >
          {terminology.identLabel}s <SortIcon k="identifications" />
        </span>
      ),
      width: "100px",
      render: (entry, hovered) => (
        <MonoCell hovered={hovered}>{entry.identifications.toLocaleString()}</MonoCell>
      ),
    },
    {
      key: "match_rate_pct",
      header: "Match %",
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("match_rate_pct")}
        >
          Match % <SortIcon k="match_rate_pct" />
        </span>
      ),
      width: "90px",
      render: (entry, hovered) => (
        <MonoCell
          hovered={hovered}
          isPrimary
          color={entry.match_rate_pct >= 97 ? "#059669" : entry.match_rate_pct >= 94 ? "#D97706" : "#DC2626"}
          hoveredColor={entry.match_rate_pct >= 97 ? "#047857" : entry.match_rate_pct >= 94 ? "#B45309" : "#B91C1C"}
        >
          {entry.match_rate_pct.toFixed(1)}%
        </MonoCell>
      ),
    },
    {
      key: "unknown_rate_pct",
      header: "Unknown %",
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("unknown_rate_pct")}
        >
          Unknown % <SortIcon k="unknown_rate_pct" />
        </span>
      ),
      width: "100px",
      render: (entry, hovered) => (
        <MonoCell
          hovered={hovered}
          color={entry.unknown_rate_pct > 7 ? "#DC2626" : entry.unknown_rate_pct > 4 ? "#D97706" : "#374151"}
        >
          {entry.unknown_rate_pct.toFixed(1)}%
        </MonoCell>
      ),
    },
    {
      key: "denied_count",
      header: "Denied",
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("denied_count")}
        >
          Denied <SortIcon k="denied_count" />
        </span>
      ),
      width: "80px",
      render: (entry, hovered) => (
        <MonoCell hovered={hovered}>{entry.denied_count}</MonoCell>
      ),
    },
    {
      key: "blacklist_hits",
      header: "BL Hits",
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("blacklist_hits")}
        >
          BL Hits <SortIcon k="blacklist_hits" />
        </span>
      ),
      width: "80px",
      render: (entry, hovered) => (
        <MonoCell
          hovered={hovered}
          isPrimary={entry.blacklist_hits > 0}
          color={entry.blacklist_hits > 0 ? "#DC2626" : "#94A3B8"}
          hoveredColor={entry.blacklist_hits > 0 ? "#B91C1C" : "#64748B"}
        >
          {entry.blacklist_hits}
        </MonoCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerContent: (
        <span
          className="text-[11px] font-bold uppercase tracking-[0.05em] text-neutral-400 cursor-pointer hover:text-neutral-600"
          onClick={() => handleSort("status")}
        >
          Status <SortIcon k="status" />
        </span>
      ),
      width: "100px",
      render: (entry) => {
        const statusMap: Record<string, string> = { NORMAL: "stable", WATCH: "warning", CRITICAL: "critical" };
        return <StatusCapsule status={statusMap[entry.status] ?? entry.status.toLowerCase()} label={entry.status} />;
      },
    },
  ];

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
      <div className="-mx-4 -mb-4">
        <DataGrid<EntryPoint>
          columns={columns}
          data={sorted}
          getRowId={(row) => row.entry_id}
          onRowClick={(row) => setSelectedEntry(row.name === selectedEntry ? null : row.name)}
        />
      </div>
    </Panel>
  );
};
