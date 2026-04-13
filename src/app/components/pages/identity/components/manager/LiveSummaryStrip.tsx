import { IDENTITY_LIVE_STATUS, IDENTITY_KPI_CARDS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { ArrowRight } from "lucide-react";

interface Props { terminology: IdentityTerminology }

export const LiveSummaryStrip = ({ terminology }: Props) => {
  const status = IDENTITY_LIVE_STATUS;
  const stats = [
    { label: `${terminology.identLabel}s Today`, value: IDENTITY_KPI_CARDS[0].value.toLocaleString(), color: "text-[#00775B]" },
    { label: `${terminology.blacklistLabel} Alerts`, value: String(status.blacklist_matches), color: status.blacklist_matches > 0 ? "text-red-600" : "text-neutral-700" },
    { label: `${terminology.unknownShortLabel}s Active`, value: String(status.unknown_count), color: status.unknown_count > 2 ? "text-amber-600" : "text-neutral-700" },
    { label: "Cameras Online", value: `${status.cameras_online}/${status.cameras_total}`, color: "text-neutral-700" },
  ];

  return (
    <div className="bg-[#E5FFF9] border border-[#00775B]/20 rounded-[4px] px-4 py-3 flex flex-wrap items-center gap-6">
      {stats.map((s, i) => (
        <div key={i} className="flex flex-col gap-0.5">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">{s.label}</span>
          <span className={`text-xl font-black font-data ${s.color}`}>{s.value}</span>
        </div>
      ))}
      <div className="ml-auto">
        <button className="flex items-center gap-1.5 text-xs font-semibold text-[#00775B] hover:underline">
          View all alerts <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
};
