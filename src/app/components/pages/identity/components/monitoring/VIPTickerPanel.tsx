import { Panel } from "../shared/Panel";
import { Star } from "lucide-react";
import { VIP_ENTRIES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";

interface Props { terminology: IdentityTerminology }

export const VIPTickerPanel = ({ terminology: _terminology }: Props) => (
  <Panel
    title="VIP Detections"
    icon={Star}
    info="VIP and executive individuals detected today. Escort protocols apply."
  >
    <div className="flex flex-col gap-2">
      {VIP_ENTRIES.map((entry) => (
        <div key={entry.id} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-purple-50 border border-purple-100">
          <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center shrink-0">
            <Star className="w-4 h-4 text-purple-700" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-purple-900 truncate">{entry.label}</p>
            <p className="text-[10px] text-purple-600">{entry.zone}</p>
          </div>
          <div className="text-right shrink-0">
            <p className="text-[10px] font-data text-neutral-500">{entry.timestamp}</p>
            <p className="text-[10px] text-purple-600 font-semibold font-data">{entry.confidence}%</p>
          </div>
        </div>
      ))}
    </div>
  </Panel>
);
