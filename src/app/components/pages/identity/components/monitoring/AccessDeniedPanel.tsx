import { Panel } from "../shared/Panel";
import { Ban } from "lucide-react";
import { IDENTITY_ZONES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Cell,
  ResponsiveContainer,
} from "recharts";

interface Props { terminology: IdentityTerminology }

export const AccessDeniedPanel = ({ terminology: _terminology }: Props) => {
  const data = IDENTITY_ZONES
    .filter((z) => z.denied > 0)
    .sort((a, b) => b.denied - a.denied)
    .slice(0, 8)
    .map((z) => ({ name: z.zone_name, denied: z.denied, unknown: z.unknown }));

  return (
    <Panel
      title="Access Denied by Zone"
      icon={Ban}
      info="Number of access denial events per zone today. Red bars indicate zones with elevated denials."
    >
      <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={0}>
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 8, bottom: 0, left: 72 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
          <XAxis type="number" tick={{ fontSize: 9 }} />
          <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={72} />
          <Tooltip contentStyle={{ fontSize: 11 }} />
          <Bar dataKey="denied" radius={[0, 3, 3, 0]} isAnimationActive={false} name="Denied">
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.denied >= 10 ? "#DC2626" : entry.denied >= 5 ? "#D97706" : "#6B7280"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Panel>
  );
};
