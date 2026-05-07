import { Panel } from "../shared/Panel";
import { Activity } from "lucide-react";
import { CONFIDENCE_HISTOGRAM } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const ConfidenceHistPanel = ({ terminology }: Props) => (
  <Panel
    title={`${terminology.matchScoreLabel} Distribution`}
    icon={Activity}
    info="Distribution of identification confidence scores. Low confidence events may indicate camera or lighting issues."
  >
    <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={0}>
      <BarChart data={CONFIDENCE_HISTOGRAM} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 9 }} />
        <YAxis tick={{ fontSize: 9 }} />
        <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [v, "events"]} />
        <ReferenceLine y={10} stroke="#94A3B8" strokeDasharray="3 3" />
        <Bar dataKey="value" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {CONFIDENCE_HISTOGRAM.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
    <div className="mt-2 flex items-center justify-between text-[10px] text-neutral-400">
      <span>Low confidence (&lt;80%): <span className="font-data">{CONFIDENCE_HISTOGRAM.slice(0, 2).reduce((s, d) => s + d.value, 0)}</span> events</span>
      <span className="text-emerald-600 font-semibold">High (&gt;90%): <span className="font-data">{CONFIDENCE_HISTOGRAM.slice(3).reduce((s, d) => s + d.value, 0)}</span> events</span>
    </div>
  </Panel>
);
