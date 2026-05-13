import { Panel } from "../shared/Panel";
import { ScanLine } from "lucide-react";
import { PLATE_ACCURACY_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine, Legend,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const PlateAccuracyPanel = ({ terminology }: Props) => {
  const latest = PLATE_ACCURACY_TREND[PLATE_ACCURACY_TREND.length - 1];
  return (
    <Panel
      title={`${terminology.matchScoreLabel} Trend`}
      icon={ScanLine}
      info="OCR plate read accuracy and vehicle authorization rate over the past 8 hours."
    >
      <div className="flex items-baseline gap-4 mb-3">
        <div>
          <span className="text-2xl font-black font-data text-neutral-900">{latest.accuracy_pct}%</span>
          <span className="text-xs text-neutral-500 ml-1.5">Read Accuracy</span>
        </div>
        <div>
          <span className="text-lg font-bold text-[#00775B]">{latest.authorization_rate_pct}%</span>
          <span className="text-xs text-neutral-500 ml-1.5">Auth Rate</span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={140} minWidth={0} minHeight={0}>
        <ComposedChart data={PLATE_ACCURACY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} />
          <YAxis yAxisId="left" domain={[80, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" domain={[70, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`${v}%`, ""]} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <ReferenceLine yAxisId="left" y={97} stroke="#00775B" strokeDasharray="3 3" label={{ value: "Target 97%", fontSize: 9, fill: "#00775B" }} />
          <Line yAxisId="left" type="monotone" dataKey="accuracy_pct" stroke="#00775B" strokeWidth={2} dot={false} isAnimationActive={false} name="Read Accuracy" />
          <Line yAxisId="right" type="monotone" dataKey="authorization_rate_pct" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} name="Auth Rate" />
        </ComposedChart>
      </ResponsiveContainer>
    </Panel>
  );
};
