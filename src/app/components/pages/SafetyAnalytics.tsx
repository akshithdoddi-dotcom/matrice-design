import { useState } from "react";
import { Persona } from "../dashboard/PersonaSwitcher";
import { ShieldCheck, HardHat, AlertTriangle, Clock, TrendingDown, TrendingUp, Users, Video, ChevronDown, X, Camera, MapPin, UserCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid, Dot } from "recharts";
import { AnalyticsHeader } from "./AnalyticsHeader";

// Mock data for safety analytics
const SAFETY_METRICS = {
  complianceRate: 94.3, // percentage
  complianceChange: 2.1, // percentage change
  violationCount: 47,
  violationChange: -12, // percentage change
  topRiskZone: "Loading Dock",
  activeTrackers: 128,
};

const COMPLIANCE_TREND_DATA = [
  { time: "00:00", compliance: 98, violations: 1 },
  { time: "02:00", compliance: 97, violations: 2 },
  { time: "04:00", compliance: 96, violations: 3 },
  { time: "06:00", compliance: 92, violations: 8 },
  { time: "08:00", compliance: 89, violations: 14 },
  { time: "10:00", compliance: 91, violations: 11 },
  { time: "12:00", compliance: 93, violations: 9 },
  { time: "14:00", compliance: 90, violations: 13 },
  { time: "16:00", compliance: 94, violations: 7 },
  { time: "18:00", compliance: 96, violations: 4 },
  { time: "20:00", compliance: 97, violations: 3 },
  { time: "22:00", compliance: 98, violations: 2 },
];

const ZONE_COMPLIANCE_DATA = [
  { time: "00:00", loadingDock: 95, assembly: 98, warehouse: 96 },
  { time: "04:00", loadingDock: 92, assembly: 97, warehouse: 95 },
  { time: "08:00", loadingDock: 85, assembly: 94, warehouse: 91 },
  { time: "12:00", loadingDock: 88, assembly: 95, warehouse: 93 },
  { time: "16:00", loadingDock: 90, assembly: 96, warehouse: 94 },
  { time: "20:00", loadingDock: 94, assembly: 97, warehouse: 96 },
];

const VIOLATION_BY_TYPE_DATA = [
  { time: "00:00", ppe: 1, unsafeBehavior: 0 },
  { time: "04:00", ppe: 2, unsafeBehavior: 1 },
  { time: "08:00", ppe: 10, unsafeBehavior: 4 },
  { time: "12:00", ppe: 7, unsafeBehavior: 2 },
  { time: "16:00", ppe: 5, unsafeBehavior: 2 },
  { time: "20:00", ppe: 2, unsafeBehavior: 1 },
];

const HEATMAP_ZONES = [
  { zone: "Loading Dock", violations: 23, risk: "high" },
  { zone: "Assembly Line 1", violations: 8, risk: "medium" },
  { zone: "Warehouse A", violations: 6, risk: "medium" },
  { zone: "Main Entrance", violations: 5, risk: "low" },
  { zone: "Packaging Area", violations: 3, risk: "low" },
  { zone: "North Parking", violations: 2, risk: "low" },
];

interface SafetyViolation {
  id: number;
  time: string;
  cameraId: string;
  zone: string;
  type: "PPE" | "Unsafe Behavior" | "Restricted Access";
  severity: "Critical" | "High" | "Medium";
  trackerId: string;
  imageUrl: string;
  compliance: {
    helmet: boolean;
    vest: boolean;
    gloves: boolean;
    boots: boolean;
  };
  auditStatus: "Pending" | "Completed" | "In Review";
  staffNote: string | null;
}

const MOCK_VIOLATIONS: SafetyViolation[] = [
  {
    id: 1,
    time: "08:47 AM",
    cameraId: "CAM-LD-012",
    zone: "Loading Dock",
    type: "PPE",
    severity: "Critical",
    trackerId: "TRK-8847A",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    compliance: { helmet: false, vest: true, gloves: true, boots: true },
    auditStatus: "Completed",
    staffNote: "Worker was reminded about helmet requirement. PPE issued.",
  },
  {
    id: 2,
    time: "09:12 AM",
    cameraId: "CAM-AS-004",
    zone: "Assembly Line 1",
    type: "Unsafe Behavior",
    severity: "High",
    trackerId: "TRK-9012B",
    imageUrl: "https://images.unsplash.com/photo-1504917595217-d4dc5ebe6122?w=400",
    compliance: { helmet: true, vest: true, gloves: false, boots: true },
    auditStatus: "In Review",
    staffNote: null,
  },
  {
    id: 3,
    time: "10:28 AM",
    cameraId: "CAM-LD-015",
    zone: "Loading Dock",
    type: "PPE",
    severity: "High",
    trackerId: "TRK-1028C",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    compliance: { helmet: true, vest: false, gloves: true, boots: true },
    auditStatus: "Completed",
    staffNote: "Vest requirement enforced. Employee issued safety vest.",
  },
  {
    id: 4,
    time: "11:35 AM",
    cameraId: "CAM-WH-008",
    zone: "Warehouse A",
    type: "Restricted Access",
    severity: "Medium",
    trackerId: "TRK-1135D",
    imageUrl: "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=400",
    compliance: { helmet: true, vest: true, gloves: true, boots: true },
    auditStatus: "Pending",
    staffNote: null,
  },
  {
    id: 5,
    time: "02:15 PM",
    cameraId: "CAM-LD-012",
    zone: "Loading Dock",
    type: "PPE",
    severity: "Critical",
    trackerId: "TRK-1415E",
    imageUrl: "https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400",
    compliance: { helmet: false, vest: false, gloves: true, boots: true },
    auditStatus: "In Review",
    staffNote: null,
  },
];

export const SafetyAnalytics = ({ persona }: { persona: Persona }) => {
  const [chartView, setChartView] = useState<"trend" | "zone" | "type">("trend");
  const [selectedViolation, setSelectedViolation] = useState<SafetyViolation | null>(null);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "Critical": return { bg: "#E7000B", text: "text-white" };
      case "High": return { bg: "#EA580C", text: "text-white" };
      case "Medium": return { bg: "#E19A04", text: "text-white" };
      default: return { bg: "#64748B", text: "text-white" };
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "PPE": return { bg: "#2B7FFF", text: "text-white" };
      case "Unsafe Behavior": return { bg: "#EA580C", text: "text-white" };
      case "Restricted Access": return { bg: "#64748B", text: "text-white" };
      default: return { bg: "#64748B", text: "text-white" };
    }
  };

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case "high": return "#E7000B";
      case "medium": return "#E19A04";
      case "low": return "#00775B";
      default: return "#64748B";
    }
  };

  const getComplianceData = () => {
    switch (chartView) {
      case "zone":
        return ZONE_COMPLIANCE_DATA;
      case "type":
        return VIOLATION_BY_TYPE_DATA;
      default:
        return COMPLIANCE_TREND_DATA;
    }
  };

  const renderChart = () => {
    const data = getComplianceData();

    if (chartView === "trend") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              domain={[85, 100]}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
            />
            <Line
              type="monotone"
              dataKey="compliance"
              stroke="#00775B"
              strokeWidth={2}
              dot={<Dot r={3} fill="#00775B" />}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartView === "zone") {
      return (
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748B' }}
              axisLine={{ stroke: '#E2E8F0' }}
              tickLine={false}
              domain={[80, 100]}
            />
            <Tooltip
              contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
            />
            <Line type="monotone" dataKey="loadingDock" stroke="#E7000B" strokeWidth={2} name="Loading Dock" />
            <Line type="monotone" dataKey="assembly" stroke="#2B7FFF" strokeWidth={2} name="Assembly" />
            <Line type="monotone" dataKey="warehouse" stroke="#00775B" strokeWidth={2} name="Warehouse" />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    return (
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
          <XAxis
            dataKey="time"
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 10, fill: '#64748B' }}
            axisLine={{ stroke: '#E2E8F0' }}
            tickLine={false}
          />
          <Tooltip
            contentStyle={{ fontSize: '11px', borderRadius: '6px', border: '1px solid #E2E8F0' }}
          />
          <Bar dataKey="ppe" fill="#2B7FFF" name="PPE Violations" radius={[4, 4, 0, 0]} />
          <Bar dataKey="unsafeBehavior" fill="#EA580C" name="Unsafe Behavior" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <AnalyticsHeader title="Safety Analytics" icon={ShieldCheck} />

      {/* Monitoring Staff Persona - Live Intervention View */}
      {persona === "monitoring" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Open Violations
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {SAFETY_METRICS.violationCount}
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ↓ {Math.abs(SAFETY_METRICS.violationChange)}% vs yesterday
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Compliance Rate
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {SAFETY_METRICS.complianceRate}%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ↑ {SAFETY_METRICS.complianceChange}% vs yesterday
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Top Risk Zone
              </p>
              <p className="font-data font-bold text-[20px] text-white tracking-[-0.5px] leading-tight">
                {SAFETY_METRICS.topRiskZone}
              </p>
              <p className="font-bold text-[#E7000B] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                23 violations today
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Active Trackers
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {SAFETY_METRICS.activeTrackers}
              </p>
              <p className="font-bold text-[#00775B] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                All zones monitored
              </p>
            </div>
          </div>

          {/* Live Violation Stream */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
              Live Violation Stream
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {MOCK_VIOLATIONS.slice(0, 8).map((violation) => {
                const severityColor = getSeverityColor(violation.severity);
                const typeColor = getTypeColor(violation.type);
                return (
                  <div
                    key={violation.id}
                    onClick={() => setSelectedViolation(violation)}
                    className="bg-neutral-50 border border-neutral-200 rounded-lg overflow-hidden hover:border-[#00775B] cursor-pointer transition-all group"
                  >
                    <div className="relative aspect-video bg-neutral-100">
                      <img src={violation.imageUrl} alt="Violation" className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2">
                        <span
                          className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: severityColor.bg, color: '#fff' }}
                        >
                          {violation.severity}
                        </span>
                      </div>
                      <div className="absolute top-2 right-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-black/60 text-white text-[9px] font-bold uppercase tracking-wider">
                          <Video className="w-3 h-3" />
                          {violation.time}
                        </span>
                      </div>
                    </div>
                    <div className="p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span
                          className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                          style={{ backgroundColor: typeColor.bg, color: '#fff' }}
                        >
                          {violation.type}
                        </span>
                        <span className="text-[9px] font-mono font-bold text-neutral-500">
                          {violation.trackerId}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                        <MapPin className="w-3 h-3" />
                        <span className="font-medium">{violation.zone}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[10px] text-neutral-600">
                        <Camera className="w-3 h-3" />
                        <span className="font-mono">{violation.cameraId}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Violation Log Table */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] overflow-hidden">
            <div className="p-4 border-b border-neutral-200">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">
                Violation Log
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#021D18]">
                  <tr className="text-[10px] uppercase tracking-wider font-bold text-white/90">
                    <th className="px-4 py-3 text-left">Time</th>
                    <th className="px-4 py-3 text-left">Camera</th>
                    <th className="px-4 py-3 text-left">Zone</th>
                    <th className="px-4 py-3 text-left">Type</th>
                    <th className="px-4 py-3 text-left">Severity</th>
                    <th className="px-4 py-3 text-left">Tracker ID</th>
                    <th className="px-4 py-3 text-left">Image</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {MOCK_VIOLATIONS.map((violation, idx) => {
                    const severityColor = getSeverityColor(violation.severity);
                    const typeColor = getTypeColor(violation.type);
                    return (
                      <tr
                        key={violation.id}
                        onClick={() => setSelectedViolation(violation)}
                        className={cn(
                          "border-t border-neutral-100 hover:bg-[#E5FFF9] cursor-pointer transition-colors",
                          idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
                        )}
                      >
                        <td className="px-4 py-3 text-[11px] font-medium text-neutral-700">{violation.time}</td>
                        <td className="px-4 py-3 text-[11px] font-mono text-neutral-600">{violation.cameraId}</td>
                        <td className="px-4 py-3 text-[11px] font-medium text-neutral-700">{violation.zone}</td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: typeColor.bg, color: '#fff' }}
                          >
                            {violation.type}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                            style={{ backgroundColor: severityColor.bg, color: '#fff' }}
                          >
                            {violation.severity}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-[11px] font-mono font-bold text-neutral-600">{violation.trackerId}</td>
                        <td className="px-4 py-3">
                          <div className="w-10 h-6 rounded overflow-hidden border border-neutral-200">
                            <img src={violation.imageUrl} alt="" className="w-full h-full object-cover" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <button className="text-[10px] font-bold uppercase tracking-wider text-[#00775B] hover:text-[#009e78] transition-colors">
                            Details
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Manager Persona - Operational Safety View */}
      {persona === "manager" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Violation Count
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {SAFETY_METRICS.violationCount}
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                Under SLA target (60)
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Compliance Rate
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {SAFETY_METRICS.complianceRate}%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ↑ {SAFETY_METRICS.complianceChange}% this week
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Peak Hour
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                08:00
              </p>
              <p className="font-bold text-[#EA580C] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                14 violations
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Top Risk Zone
              </p>
              <p className="font-data font-bold text-[20px] text-white tracking-[-0.5px] leading-tight">
                {SAFETY_METRICS.topRiskZone}
              </p>
              <p className="font-bold text-[#E7000B] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                49% of violations
              </p>
            </div>
          </div>

          {/* Compliance Chart with Toggle */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">
                Safety Compliance Trends
              </h3>
              <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-1">
                <button
                  onClick={() => setChartView("trend")}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    chartView === "trend" ? "bg-[#00775B] text-white" : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  Trend
                </button>
                <button
                  onClick={() => setChartView("zone")}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    chartView === "zone" ? "bg-[#00775B] text-white" : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  By Zone
                </button>
                <button
                  onClick={() => setChartView("type")}
                  className={cn(
                    "px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all",
                    chartView === "type" ? "bg-[#00775B] text-white" : "text-neutral-600 hover:text-neutral-900"
                  )}
                >
                  By Type
                </button>
              </div>
            </div>
            <div className="h-80">
              {renderChart()}
            </div>
          </div>

          {/* Shift Analysis */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
                Violations by Type
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-neutral-700">PPE Violations</span>
                    <span className="text-[11px] font-bold text-neutral-900">32 (68%)</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#2B7FFF]" style={{ width: '68%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-neutral-700">Unsafe Behavior</span>
                    <span className="text-[11px] font-bold text-neutral-900">12 (26%)</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#EA580C]" style={{ width: '26%' }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-medium text-neutral-700">Restricted Access</span>
                    <span className="text-[11px] font-bold text-neutral-900">3 (6%)</span>
                  </div>
                  <div className="h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#64748B]" style={{ width: '6%' }} />
                  </div>
                </div>
              </div>
              <div className="mt-6 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1">
                  Insight
                </p>
                <p className="text-[11px] text-blue-800">
                  PPE violations account for 68% of all safety issues. Consider equipment availability review.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
                Peak Hour Analysis
              </h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={COMPLIANCE_TREND_DATA} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                  <XAxis
                    dataKey="time"
                    tick={{ fontSize: 10, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                    interval={2}
                  />
                  <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                    cursor={{ fill: 'rgba(0, 119, 91, 0.1)' }}
                  />
                  <Bar dataKey="violations" fill="#E7000B" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-[10px] font-bold uppercase tracking-wider text-red-900 mb-1">
                  Recommendation
                </p>
                <p className="text-[11px] text-red-800">
                  Morning shift (8AM-10AM) shows highest violations. Consider additional safety briefing.
                </p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Director Persona - Liability & Risk View */}
      {persona === "director" && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Monthly Compliance
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                94.8%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ↑ 1.2% vs last month
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                YoY Reduction
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                32%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                Severe violations down
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Audit Complete
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                98.2%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                All critical audited
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Zero Incident Days
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                18
              </p>
              <p className="font-bold text-[#00775B] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                This quarter
              </p>
            </div>
          </div>

          {/* Safety Heatmap */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
            <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
              Safety Heatmap - 30 Day Analysis
            </h3>
            <div className="space-y-3">
              {HEATMAP_ZONES.map((zone) => (
                <div key={zone.zone} className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-[11px] font-bold text-neutral-900">{zone.zone}</span>
                      <span className="text-[11px] font-bold" style={{ color: getRiskColor(zone.risk) }}>
                        {zone.violations} violations
                      </span>
                    </div>
                    <div className="h-8 bg-neutral-100 rounded-lg overflow-hidden relative">
                      <div
                        className="h-full transition-all duration-500"
                        style={{
                          width: `${(zone.violations / 23) * 100}%`,
                          backgroundColor: getRiskColor(zone.risk),
                        }}
                      />
                      <span className="absolute inset-0 flex items-center justify-center text-[10px] font-bold text-neutral-700 uppercase tracking-wider">
                        {zone.risk} risk
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Audit Status & Compliance */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
                Protocol Audit Status
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-1">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Completed</span>
                    <span className="font-data font-bold text-2xl text-[#00775B]">46</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">In Review</span>
                    <span className="font-data font-bold text-lg text-[#E19A04]">1</span>
                  </div>
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">Critical</div>
                      <div className="font-data font-bold text-lg text-neutral-900">100%</div>
                      <div className="text-[9px] text-[#00A63E] font-bold">All audited</div>
                    </div>
                    <div>
                      <div className="text-[10px] text-neutral-500 uppercase tracking-wide mb-1">High</div>
                      <div className="font-data font-bold text-lg text-neutral-900">96%</div>
                      <div className="text-[9px] text-[#00A63E] font-bold">1 pending</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
                Legal Compliance
              </h3>
              <div className="space-y-4">
                <div>
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Documentation Rate</span>
                    <span className="font-data font-bold text-2xl text-[#00775B]">98.2%</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">All incidents properly documented</p>
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Staff Notes</span>
                    <span className="font-data font-bold text-2xl text-neutral-900">46/47</span>
                  </div>
                  <p className="text-[10px] text-neutral-500">1 note pending completion</p>
                </div>
                <div className="pt-4 border-t border-neutral-200">
                  <div className="flex items-baseline justify-between mb-2">
                    <span className="text-[10px] text-neutral-500 uppercase tracking-wide">Regulatory Score</span>
                    <span className="font-data font-bold text-2xl text-[#00775B]">96/100</span>
                  </div>
                  <p className="text-[10px] text-[#00A63E] font-bold">✓ OSHA Compliant</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Side Modal for Violation Details */}
      {selectedViolation && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/50"
          onClick={() => setSelectedViolation(null)}
        >
          <div
            className="bg-white h-screen w-full max-w-[550px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="bg-white border-b border-neutral-200 px-5 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <p className="font-bold text-neutral-900 text-base">Violation Details</p>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                    style={{ backgroundColor: getSeverityColor(selectedViolation.severity).bg }}
                  >
                    {selectedViolation.severity}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedViolation(null)}
                  className="p-1 hover:bg-neutral-100 rounded transition-colors"
                >
                  <X className="w-4 h-4 text-neutral-400" />
                </button>
              </div>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {/* Visual Evidence */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="aspect-video bg-neutral-900 rounded overflow-hidden mb-3">
                  <img src={selectedViolation.imageUrl} alt="Evidence" className="w-full h-full object-cover" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Time</span>
                    <span className="font-bold text-neutral-900">{selectedViolation.time}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Camera</span>
                    <span className="font-mono font-bold text-neutral-900 truncate">{selectedViolation.cameraId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Zone</span>
                    <span className="font-bold text-neutral-900">{selectedViolation.zone}</span>
                  </div>
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">
                  Safety Compliance Checklist
                </div>
                <div className="space-y-2">
                  {[
                    { label: "Hard Hat", key: "helmet" },
                    { label: "Safety Vest", key: "vest" },
                    { label: "Gloves", key: "gloves" },
                    { label: "Steel-Toe Boots", key: "boots" },
                  ].map(({ label, key }) => {
                    const isCompliant = selectedViolation.compliance[key as keyof typeof selectedViolation.compliance];
                    return (
                      <div key={key} className="flex items-center gap-2 py-2 border-b border-neutral-200 last:border-0">
                        <div className={cn(
                          "w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0",
                          isCompliant ? "bg-[#00775B]" : "bg-[#E7000B]"
                        )}>
                          {isCompliant ? (
                            <CheckCircle2 className="w-3 h-3 text-white" />
                          ) : (
                            <X className="w-3 h-3 text-white" />
                          )}
                        </div>
                        <span className="flex-1 text-[11px] font-medium text-neutral-700">{label}</span>
                        <span className={cn(
                          "text-[10px] font-bold uppercase tracking-wider",
                          isCompliant ? "text-[#00775B]" : "text-[#E7000B]"
                        )}>
                          {isCompliant ? "✓" : "✗"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Audit Status */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider">Audit Status</span>
                  <span className={cn(
                    "px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider",
                    selectedViolation.auditStatus === "Completed" && "bg-[#00775B] text-white",
                    selectedViolation.auditStatus === "In Review" && "bg-[#E19A04] text-white",
                    selectedViolation.auditStatus === "Pending" && "bg-neutral-400 text-white"
                  )}>
                    {selectedViolation.auditStatus}
                  </span>
                </div>
                {selectedViolation.staffNote && (
                  <div className="p-3 bg-white border border-neutral-200 rounded">
                    <p className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 mb-1">Staff Note</p>
                    <p className="text-[11px] text-neutral-700">{selectedViolation.staffNote}</p>
                  </div>
                )}
              </div>

              {/* Metadata */}
              <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                <div className="grid grid-cols-2 gap-3 text-[10px]">
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-1">Tracker ID</span>
                    <span className="font-mono font-bold text-neutral-900">{selectedViolation.trackerId}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-neutral-400 uppercase tracking-wide mb-1">Type</span>
                    <span className="font-bold text-neutral-900">{selectedViolation.type}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Sticky Footer */}
            <div className="bg-white border-t border-neutral-200 px-5 py-4">
              <div className="flex gap-2">
                <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                  <AlertCircle className="w-3.5 h-3.5" />
                  Flag Issue
                </button>
                <button className="flex-[2] h-10 flex items-center justify-center gap-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#009e78] transition-colors">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Mark Resolved
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
