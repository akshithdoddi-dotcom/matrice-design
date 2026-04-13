import { Panel } from "../shared/Panel";
import { Star, ShieldCheck, Eye } from "lucide-react";
import { VIP_ENTRIES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { IdentityEvidenceMedia } from "../shared/IdentityEvidenceMedia";

interface Props { terminology: IdentityTerminology }

const VIP_FACE_IMAGES = [
  "https://images.pexels.com/photos/33738484/pexels-photo-33738484.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-33738484.jpg&fm=jpg",
  "https://images.pexels.com/photos/14801453/pexels-photo-14801453.jpeg?cs=srgb&dl=pexels-kwizera-gadson-14801453.jpg&fm=jpg",
];

export const VIPTickerPanel = ({ terminology: _terminology }: Props) => (
  <Panel
    title="VIP Detections"
    icon={Star}
    info="VIP and executive individuals detected today. Escort protocols may apply."
    collapsible
    defaultOpen={false}
  >
    <div className="overflow-x-auto -mx-4 -mb-4">
      <table className="w-full min-w-[640px] text-xs">
        <thead>
          <tr className="border-b border-neutral-100 bg-neutral-50/80">
            <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Capture</th>
            <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Identity</th>
            <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Zone</th>
            <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Status</th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Conf</th>
            <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Time</th>
            <th className="pl-2 pr-4 py-2 w-16" />
          </tr>
        </thead>
        <tbody className="divide-y divide-neutral-50">
          {VIP_ENTRIES.map((entry, index) => (
            <tr key={entry.id} className="transition-colors hover:bg-neutral-50/60 group">
              {/* Capture thumbnail */}
              <td className="pl-4 pr-2 py-2.5">
                <IdentityEvidenceMedia
                  kind="FACE"
                  seed={entry.id}
                  imageSrc={VIP_FACE_IMAGES[index % VIP_FACE_IMAGES.length]}
                  confidence={entry.confidence}
                  className="h-12 w-12"
                />
              </td>

              {/* Identity */}
              <td className="px-2 py-2.5">
                <div className="text-[12px] font-bold text-neutral-800 leading-tight">{entry.label}</div>
                <div className="text-[10px] text-neutral-400 font-data tabular-nums mt-0.5">ID {entry.id}</div>
              </td>

              {/* Zone */}
              <td className="px-2 py-2.5">
                <span className="text-[12px] text-neutral-600">{entry.zone}</span>
              </td>

              {/* Status badges */}
              <td className="px-2 py-2.5">
                <div className="flex items-center gap-1.5">
                  <span className="inline-flex h-5 items-center gap-1 rounded-[2px] border border-purple-200 bg-purple-50 px-1.5 text-[9px] font-black text-purple-700">
                    <Star className="h-2.5 w-2.5" />
                    VIP
                  </span>
                  <span className="inline-flex h-5 items-center gap-1 rounded-[2px] border border-emerald-200 bg-emerald-50 px-1.5 text-[9px] font-black text-emerald-700">
                    <ShieldCheck className="h-2.5 w-2.5" />
                    Verified
                  </span>
                </div>
              </td>

              {/* Confidence */}
              <td className="px-2 py-2.5 text-right font-data tabular-nums text-[13px] font-black text-neutral-800">
                {entry.confidence}%
              </td>

              {/* Time */}
              <td className="px-2 py-2.5 text-right font-data tabular-nums text-[11px] text-neutral-400">
                {entry.timestamp}
              </td>

              {/* View action */}
              <td className="pl-2 pr-4 py-2.5">
                <button className="opacity-0 group-hover:opacity-100 flex h-7 items-center gap-1 rounded-[4px] border border-neutral-200 bg-white px-2.5 text-[10px] font-bold text-neutral-600 transition-all hover:border-[#00775B] hover:text-[#00775B] active:scale-[0.97]">
                  <Eye className="h-3 w-3" />
                  View
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Panel>
);
