import { Panel } from "../shared/Panel";
import { CarFront } from "lucide-react";
import { PLATE_ACCURACY_TREND } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

interface Props { terminology: IdentityTerminology }

export const VehicleAuthPanel = ({ terminology }: Props) => {
  const latest = PLATE_ACCURACY_TREND[PLATE_ACCURACY_TREND.length - 1];
  const authorized = latest.authorization_rate_pct;
  const unauthorized = 100 - authorized;

  const gaugeData = [
    { name: terminology.authorizedLabel, value: authorized, color: "#00775B" },
    { name: "Unauthorized", value: unauthorized, color: "#E5E7EB" },
  ];

  return (
    <Panel
      title="Vehicle Auth Rate"
      icon={CarFront}
      info="Percentage of detected vehicles that are registered/authorized."
    >
      <div className="relative">
        <ResponsiveContainer width="100%" height={150} minWidth={0} minHeight={0}>
          <PieChart>
            <Pie
              data={gaugeData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius={55}
              outerRadius={75}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {gaugeData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`${v.toFixed(1)}%`, ""]} />
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex items-end justify-center pb-4 pointer-events-none">
          <div className="text-center">
            <p className="text-2xl font-black font-data tabular-nums text-neutral-900">{authorized}%</p>
            <p className="text-[10px] text-neutral-500">Auth Rate</p>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2 mt-1">
        <div className="text-center p-2 bg-emerald-50 rounded-lg border border-emerald-100">
          <p className="text-lg font-black font-data tabular-nums text-emerald-700">{authorized}%</p>
          <p className="text-[10px] text-emerald-600">Authorized</p>
        </div>
        <div className="text-center p-2 bg-red-50 rounded-lg border border-red-100">
          <p className="text-lg font-black font-data tabular-nums text-red-700">{unauthorized.toFixed(1)}%</p>
          <p className="text-[10px] text-red-600">Unauthorized</p>
        </div>
      </div>
    </Panel>
  );
};
