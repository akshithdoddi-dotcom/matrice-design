import { Panel } from "../shared/Panel";
import { Users } from "lucide-react";
import { LIST_MEMBERSHIP } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

interface Props { terminology: IdentityTerminology }

export const ListMembershipPanel = ({ terminology: _terminology }: Props) => {
  const total = LIST_MEMBERSHIP.reduce((s, d) => s + d.value, 0);
  return (
    <Panel
      title="List Membership"
      icon={Users}
      info="Breakdown of today's identifications by list category."
    >
      <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
        <PieChart>
          <Pie
            data={LIST_MEMBERSHIP}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={72}
            paddingAngle={2}
            isAnimationActive={false}
          >
            {LIST_MEMBERSHIP.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ fontSize: 11 }}
            formatter={(v: number) => [`${v} (${((v / total) * 100).toFixed(1)}%)`, ""]}
          />
          <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center -mt-2">
        <span className="text-[10px] text-neutral-400">Total identifications: </span>
        <span className="text-[10px] font-bold text-neutral-700">{total.toLocaleString()}</span>
      </div>
    </Panel>
  );
};
