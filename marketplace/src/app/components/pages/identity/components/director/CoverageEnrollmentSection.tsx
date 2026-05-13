import { Panel } from "../shared/Panel";
import { Camera, Users } from "lucide-react";
import { IDENTITY_CAMERAS } from "../../data/mockData";
import type { IdentityTerminology } from "../../data/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface Props { terminology: IdentityTerminology }

export const CoverageEnrollmentSection = ({ terminology }: Props) => {
  const online = IDENTITY_CAMERAS.filter((c) => c.status === "online").length;
  const degraded = IDENTITY_CAMERAS.filter((c) => c.status === "degraded").length;
  const offline = IDENTITY_CAMERAS.filter((c) => c.status === "offline").length;
  const total = IDENTITY_CAMERAS.length;
  const coveragePct = ((online / total) * 100).toFixed(1);

  const enrollmentData = [
    { category: "Enrolled", value: 1840, color: "#00775B" },
    { category: "VIP", value: 142, color: "#7C3AED" },
    { category: "Temp Pass", value: 87, color: "#D97706" },
    { category: "Blacklisted", value: 23, color: "#DC2626" },
  ];

  const cameraStatusData = [
    { name: "Online", value: online, color: "#00775B" },
    { name: "Degraded", value: degraded, color: "#D97706" },
    { name: "Offline", value: offline, color: "#DC2626" },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Camera Coverage */}
      <Panel
        title="Camera Coverage"
        icon={Camera}
        info="Coverage rate and status of all cameras in the identity network."
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="flex flex-col">
            <span className="text-3xl font-black font-data text-neutral-900">{coveragePct}%</span>
            <span className="text-[10px] text-neutral-400 uppercase tracking-widest">Coverage</span>
          </div>
          <div className="flex flex-col gap-1">
            {cameraStatusData.map((s) => (
              <div key={s.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: s.color }} />
                <span className="text-xs text-neutral-700">{s.name}: <strong>{s.value}</strong></span>
              </div>
            ))}
          </div>
        </div>
        {/* Bar by zone */}
        <ResponsiveContainer width="100%" height={160} minWidth={0} minHeight={0}>
          <BarChart
            data={IDENTITY_CAMERAS.filter((c) => c.confidence_avg > 0).slice(0, 8).map((c) => ({
              name: c.name.replace("Cam ", "").substring(0, 10),
              conf: c.confidence_avg,
            }))}
            margin={{ top: 4, right: 4, bottom: 0, left: -20 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="name" tick={{ fontSize: 8 }} />
            <YAxis domain={[60, 100]} tick={{ fontSize: 9 }} tickFormatter={(v) => `${v}%`} />
            <Tooltip contentStyle={{ fontSize: 11 }} formatter={(v: number) => [`${v}%`, "Avg Confidence"]} />
            <Bar dataKey="conf" radius={[3, 3, 0, 0]} isAnimationActive={false}>
              {IDENTITY_CAMERAS.filter((c) => c.confidence_avg > 0).slice(0, 8).map((entry, i) => (
                <Cell key={i} fill={entry.confidence_avg >= 90 ? "#00775B" : entry.confidence_avg >= 75 ? "#D97706" : "#DC2626"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      {/* Enrollment */}
      <Panel
        title={`${terminology.enrollmentLabel} Coverage`}
        icon={Users}
        info="Total enrolled individuals by category. Enrollment coverage impacts match accuracy."
      >
        <div className="flex items-baseline gap-2 mb-4">
          <span className="text-3xl font-black font-data text-neutral-900">2,092</span>
          <span className="text-sm text-neutral-500">total enrolled</span>
        </div>
        <ResponsiveContainer width="100%" height={180} minWidth={0} minHeight={0}>
          <BarChart data={enrollmentData} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
            <XAxis dataKey="category" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 9 }} />
            <Tooltip contentStyle={{ fontSize: 11 }} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]} isAnimationActive={false}>
              {enrollmentData.map((entry, i) => (
                <Cell key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <p className="text-[10px] text-amber-600 mt-2 font-semibold">
          ⚠ Enrollment coverage 73.4% — target 80%
        </p>
      </Panel>
    </div>
  );
};
