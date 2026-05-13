import { Panel } from "../shared/Panel";
import { Activity } from "lucide-react";
import { CONFIDENCE_HISTOGRAM, IDENTITY_CAMERAS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

export const ConfidenceHealthSection = ({ terminology }: Props) => {
  const degradedCams = IDENTITY_CAMERAS.filter((c) => c.status !== "online");
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel
        title={`${terminology.matchScoreLabel} Distribution`}
        icon={Activity}
        info="Breakdown of identification events by confidence score range."
      >
        <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
          <BarChart data={CONFIDENCE_HISTOGRAM} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="bucket" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Events">
              {CONFIDENCE_HISTOGRAM.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel
        title="Camera Health"
        icon={Activity}
        info="Status of all cameras in the identity analytics system."
        collapsible
      >
        <div className="flex flex-col gap-1.5 max-h-48 overflow-y-auto pr-1">
          {IDENTITY_CAMERAS.map((cam) => (
            <div key={cam.id} className={cn(
              "flex items-center gap-3 px-2.5 py-2 rounded-lg border text-xs",
              cam.status === "online"   ? "bg-white border-neutral-100" :
              cam.status === "degraded" ? "bg-amber-50 border-amber-200" :
                                          "bg-red-50 border-red-200"
            )}>
              <span className={cn("w-2 h-2 rounded-full shrink-0",
                cam.status === "online" ? "bg-emerald-500" :
                cam.status === "degraded" ? "bg-amber-500" : "bg-red-500"
              )} />
              <span className="font-medium text-neutral-700 flex-1 truncate">{cam.name}</span>
              <span className="text-[10px] text-neutral-400">{cam.zone}</span>
              {cam.fps > 0 && <span className="text-[10px] font-data text-neutral-500">{cam.fps}fps</span>}
              {cam.confidence_avg > 0 && (
                <span className={cn("text-[10px] font-semibold font-data",
                  cam.confidence_avg >= 90 ? "text-emerald-600" :
                  cam.confidence_avg >= 75 ? "text-amber-600" : "text-red-600"
                )}>
                  {cam.confidence_avg.toFixed(0)}%
                </span>
              )}
            </div>
          ))}
        </div>
        {degradedCams.length > 0 && (
          <p className="mt-2 text-[10px] text-amber-600 font-semibold">
            ⚠ {degradedCams.length} camera{degradedCams.length > 1 ? "s" : ""} degraded or offline
          </p>
        )}
      </Panel>
    </div>
  );
};
