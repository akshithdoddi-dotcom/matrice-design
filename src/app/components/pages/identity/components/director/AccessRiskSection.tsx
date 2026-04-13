import { Panel } from "../shared/Panel";
import { ShieldAlert } from "lucide-react";
import { ACCESS_RISK_ZONES } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import { cn } from "@/app/lib/utils";

interface Props { terminology: IdentityTerminology }

const RISK_COLOR: Record<string, string> = {
  GREEN: "#00775B",
  AMBER: "#D97706",
  RED:   "#DC2626",
};

export const AccessRiskSection = ({ terminology: _terminology }: Props) => {
  const topRisk = ACCESS_RISK_ZONES.filter((z) => z.status !== "GREEN").slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Risk score bar chart */}
      <div className="lg:col-span-2">
        <Panel
          title="Zone Risk Scores"
          icon={ShieldAlert}
          info="Composite risk score per zone based on blacklist rate, unknown rate, and denial rate."
        >
          <ResponsiveContainer width="100%" height={240} minWidth={0} minHeight={0}>
            <BarChart
              data={[...ACCESS_RISK_ZONES].sort((a, b) => b.risk_score - a.risk_score)}
              layout="vertical"
              margin={{ top: 4, right: 8, bottom: 0, left: 96 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
              <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}`} />
              <YAxis type="category" dataKey="zone" tick={{ fontSize: 9 }} width={96} />
              <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [v, "Risk Score"]} />
              <Bar dataKey="risk_score" radius={[0, 4, 4, 0]} isAnimationActive={false}>
                {ACCESS_RISK_ZONES.sort((a, b) => b.risk_score - a.risk_score).map((entry, i) => (
                  <Cell key={i} fill={RISK_COLOR[entry.status] ?? "#6B7280"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      {/* Top risk zones */}
      <div className="flex flex-col gap-4">
        {topRisk.map((zone) => (
          <div
            key={zone.zone}
            className={cn(
              "bg-white rounded-[4px] border shadow-sm p-5",
              zone.status === "RED"   ? "border-red-200" :
              zone.status === "AMBER" ? "border-amber-200" :
                                        "border-neutral-100"
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <p className="text-sm font-bold text-neutral-800">{zone.zone}</p>
              <span className={cn(
                "text-[10px] font-bold px-2 py-0.5 rounded-full",
                zone.status === "RED"   ? "bg-red-100 text-red-700" :
                zone.status === "AMBER" ? "bg-amber-100 text-amber-700" :
                                          "bg-emerald-100 text-emerald-700"
              )}>
                {zone.status}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              {[
                { label: "Risk Score", value: zone.risk_score },
                { label: "Unknown Rate", value: `${zone.unknown_rate}%` },
                { label: "Denial Rate", value: `${zone.denial_rate}%` },
                { label: "BL Rate", value: `${zone.blacklist_rate}%` },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[9px] text-neutral-400 uppercase tracking-wider">{s.label}</p>
                  <p className="text-sm font-bold font-data text-neutral-800">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
