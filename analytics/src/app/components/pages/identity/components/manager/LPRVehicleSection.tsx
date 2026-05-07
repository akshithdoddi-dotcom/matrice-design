import { Panel } from "../shared/Panel";
import { CarFront } from "lucide-react";
import { PLATE_ACCURACY_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  ComposedChart, Line, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, ReferenceLine,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const LPRVehicleSection = ({ terminology }: Props) => {
  const latest = PLATE_ACCURACY_TREND[PLATE_ACCURACY_TREND.length - 1];
  return (
    <Panel
      title="LPR Vehicle Authorization"
      icon={CarFront}
      info="License plate read accuracy and vehicle authorization rate over the session."
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          { label: "Read Accuracy", value: `${latest.accuracy_pct}%`, color: "text-[#00775B]" },
          { label: `${terminology.authorizedLabel} Rate`, value: `${latest.authorization_rate_pct}%`, color: "text-purple-600" },
          { label: "Unauthorized", value: `${(100 - latest.authorization_rate_pct).toFixed(1)}%`, color: "text-red-600" },
        ].map((stat) => (
          <div key={stat.label} className="text-center p-3 bg-neutral-50 rounded-lg border border-neutral-100">
            <p className={`text-xl font-black font-data ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] text-neutral-400 mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={200} minWidth={0} minHeight={0}>
        <ComposedChart data={PLATE_ACCURACY_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 9 }} />
          <YAxis yAxisId="left" domain={[85, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
          <YAxis yAxisId="right" orientation="right" domain={[75, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
          <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`${v}%`, ""]} />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          <ReferenceLine yAxisId="left" y={97} stroke="#00775B" strokeDasharray="3 3" />
          <Line yAxisId="left" type="monotone" dataKey="accuracy_pct" stroke="#00775B" strokeWidth={2} dot={false} isAnimationActive={false} name="Read Accuracy" />
          <Line yAxisId="right" type="monotone" dataKey="authorization_rate_pct" stroke="#7C3AED" strokeWidth={1.5} strokeDasharray="4 3" dot={false} isAnimationActive={false} name="Auth Rate" />
        </ComposedChart>
      </ResponsiveContainer>
    </Panel>
  );
};
