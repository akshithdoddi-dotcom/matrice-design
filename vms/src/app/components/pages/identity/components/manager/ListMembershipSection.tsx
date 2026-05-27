import { Panel } from "../shared/Panel";
import { Users } from "lucide-react";
import { LIST_MEMBERSHIP, DENIAL_TREND_7D } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const ListMembershipSection = ({ terminology }: Props) => {
  const total = LIST_MEMBERSHIP.reduce((s, d) => s + d.value, 0);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Panel
        title="List Membership Breakdown"
        icon={Users}
        info="Today's identifications by watchlist category."
      >
        <div className="flex items-center gap-2 mb-2">
          <span className="text-2xl font-black font-data text-neutral-900">{total.toLocaleString()}</span>
          <span className="text-sm text-neutral-500">total {terminology.identLabel.toLowerCase()}s</span>
        </div>
        <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
          <PieChart>
            <Pie data={LIST_MEMBERSHIP} dataKey="value" nameKey="name" cx="50%" cy="50%"
              innerRadius={50} outerRadius={72} paddingAngle={2} isAnimationActive={false}>
              {LIST_MEMBERSHIP.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`${v} (${((v / total) * 100).toFixed(1)}%)`, ""]} />
            <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
          </PieChart>
        </ResponsiveContainer>
      </Panel>

      <Panel
        title="Denial Trend (7 Days)"
        icon={Users}
        info="Access denial and unknown individual counts over the past 7 days."
      >
        <ResponsiveContainer width="100%" height={220} minWidth={0} minHeight={0}>
          <BarChart data={DENIAL_TREND_7D} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="day" tick={{ fontSize: 9 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="denied" fill="#EF4444" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Denied" />
            <Bar dataKey="unknown" fill="#94A3B8" radius={[3, 3, 0, 0]} isAnimationActive={false} name="Unknown" />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
};
