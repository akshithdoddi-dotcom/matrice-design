import { Panel } from "../shared/Panel";
import { Users } from "lucide-react";
import { LIVE_IDENT_SPARKLINE } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, ReferenceLine,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const IdentRatePanel = ({ terminology }: Props) => {
  const latest = LIVE_IDENT_SPARKLINE[LIVE_IDENT_SPARKLINE.length - 1];
  return (
    <Panel
      title={`${terminology.identLabel} Rate`}
      icon={Users}
      info={`Live ${terminology.identLabel.toLowerCase()} events per minute, updated in real time.`}
    >
      <div className="flex items-baseline gap-2 mb-3">
        <span className="text-3xl font-black font-data text-neutral-900">{latest.total}</span>
        <span className="text-sm text-neutral-500">/ min</span>
        <span className="ml-auto text-xs bg-emerald-100 text-emerald-700 font-bold px-2 py-0.5 rounded-full">
          {latest.matched} matched
        </span>
        <span className="text-xs bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded-full">
          {latest.unknown} unknown
        </span>
      </div>
      <ResponsiveContainer width="100%" height={120} minWidth={0} minHeight={0}>
        <AreaChart data={LIVE_IDENT_SPARKLINE} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <defs>
            <linearGradient id="identGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#00775B" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#00775B" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="t" tick={{ fontSize: 9 }} tickFormatter={(v) => v % 10 === 0 ? `${v}m` : ""} />
          <YAxis tick={{ fontSize: 9 }} domain={[0, "auto"]} />
          <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [v, ""]} />
          <Area type="monotone" dataKey="total" stroke="#00775B" strokeWidth={2} fill="url(#identGrad)" dot={false} isAnimationActive={false} name="Total" />
          <Area type="monotone" dataKey="matched" stroke="#10B981" strokeWidth={1.5} fill="none" dot={false} isAnimationActive={false} name="Matched" />
          <ReferenceLine y={20} stroke="#EF4444" strokeDasharray="4 4" strokeOpacity={0.5} />
        </AreaChart>
      </ResponsiveContainer>
    </Panel>
  );
};
