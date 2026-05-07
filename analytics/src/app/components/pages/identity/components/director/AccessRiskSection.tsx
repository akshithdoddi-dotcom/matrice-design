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

const CARD_BORDER: Record<string, string> = {
  GREEN: "border-neutral-100",
  AMBER: "border-amber-200",
  RED:   "border-red-200",
};

const BADGE_STYLE: Record<string, string> = {
  GREEN: "bg-emerald-50 border border-emerald-200 text-emerald-700",
  AMBER: "bg-amber-50 border border-amber-200 text-amber-700",
  RED:   "bg-red-50 border border-red-200 text-red-700",
};

const BADGE_LABEL: Record<string, string> = {
  GREEN: "Normal",
  AMBER: "Elevated",
  RED:   "Critical",
};

export const AccessRiskSection = ({ terminology: _terminology }: Props) => {
  const sorted = [...ACCESS_RISK_ZONES].sort((a, b) => b.risk_score - a.risk_score);
  const topRisk = sorted.filter((z) => z.status !== "GREEN").slice(0, 3);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 items-stretch">
      {/* Risk score bar chart — spans 2 cols, fills card height */}
      <div className="lg:col-span-2 flex">
        <Panel
          title="Zone Risk Scores"
          icon={ShieldAlert}
          info="Composite risk score per zone: Critical (>75) = RED, Elevated (40–75) = AMBER, Normal (<40) = GREEN."
          grow
          className="flex-1"
        >
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={sorted}
                layout="vertical"
                margin={{ top: 4, right: 16, bottom: 0, left: 96 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 9, fill: "#94A3B8" }} axisLine={false} tickLine={false} />
                <YAxis type="category" dataKey="zone" tick={{ fontSize: 9, fill: "#64748B" }} width={92} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: 10, borderRadius: 4, border: "1px solid #e5e7eb", padding: "4px 8px" }}
                  formatter={(v: number) => [v, "Risk Score"]}
                />
                <Bar dataKey="risk_score" radius={[0, 3, 3, 0]} isAnimationActive={false} maxBarSize={14}>
                  {sorted.map((entry, i) => (
                    <Cell key={i} fill={RISK_COLOR[entry.status] ?? "#6B7280"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* RAG legend */}
          <div className="flex items-center gap-4 pt-3 mt-1 border-t border-neutral-50 shrink-0">
            {[
              { color: "#DC2626", label: "Critical  >75" },
              { color: "#D97706", label: "Elevated  40–75" },
              { color: "#00775B", label: "Normal  <40" },
            ].map(({ color, label }) => (
              <span key={label} className="flex items-center gap-1.5 text-[9px] text-neutral-400">
                <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: color }} />
                {label}
              </span>
            ))}
          </div>
        </Panel>
      </div>

      {/* Top risk zone cards */}
      <div className="flex flex-col gap-3">
        {topRisk.map((zone) => (
          <div
            key={zone.zone}
            className={cn(
              "bg-white rounded-[4px] border shadow-sm p-3 flex-1",
              CARD_BORDER[zone.status]
            )}
          >
            <div className="flex items-start justify-between gap-2 mb-2.5">
              <p className="text-[12px] font-bold text-neutral-800 leading-tight">{zone.zone}</p>
              <span className={cn(
                "inline-flex h-5 items-center rounded-[2px] px-1.5 text-[9px] font-black uppercase tracking-wide shrink-0",
                BADGE_STYLE[zone.status]
              )}>
                {BADGE_LABEL[zone.status]}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              {[
                { label: "Risk Score", value: zone.risk_score },
                { label: "Unknown Rate", value: `${zone.unknown_rate}%` },
                { label: "Denial Rate", value: `${zone.denial_rate}%` },
                { label: "BL Rate", value: `${zone.blacklist_rate}%` },
              ].map((s) => (
                <div key={s.label}>
                  <p className="text-[9px] font-bold uppercase tracking-[0.06em] text-neutral-400 leading-none mb-0.5">{s.label}</p>
                  <p className="text-[13px] font-black font-data tabular-nums text-neutral-800 leading-none">{s.value}</p>
                </div>
              ))}
            </div>
          </div>
        ))}
        {/* RAG status legend */}
        <div className="flex flex-col gap-1 px-1">
          {[
            { color: "bg-red-500",    label: "Critical", desc: "Risk score > 75, immediate action" },
            { color: "bg-amber-400",  label: "Elevated", desc: "Risk score 40–75, monitor closely" },
          ].map(({ color, label, desc }) => (
            <div key={label} className="flex items-center gap-2 text-[9px] text-neutral-400">
              <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", color)} />
              <span className="font-bold text-neutral-500">{label}</span>
              <span>— {desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
