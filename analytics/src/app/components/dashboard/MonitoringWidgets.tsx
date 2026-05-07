import { useState } from "react";
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { GripVertical, Pin, Activity, AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";

const MOCK_DATA = Array.from({ length: 20 }, (_, i) => ({
  time: i,
  value: Math.floor(Math.random() * 50) + 20,
}));

const WidgetWrapper = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => {
  const [isPinned, setIsPinned] = useState(false);

  return (
    <div className={cn("bg-white rounded-md border border-neutral-200 shadow-sm p-4 relative group hover:border-[#00775B]/30 transition-colors", className)}>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="cursor-grab active:cursor-grabbing text-neutral-300 hover:text-neutral-500">
            <GripVertical className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-600">{title}</h3>
        </div>
        <button 
          onClick={() => setIsPinned(!isPinned)}
          className={cn("text-neutral-300 hover:text-[#00775B] transition-colors", isPinned && "text-[#00775B]")}
        >
          <Pin className={cn("w-3.5 h-3.5", isPinned && "fill-current")} />
        </button>
      </div>
      {children}
    </div>
  );
};

export const MonitoringWidgets = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Live Occupancy - Sparkline */}
      <WidgetWrapper title="Live Occupancy (Zone A)">
        <div className="h-24 w-full min-h-[96px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <LineChart data={MOCK_DATA} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00775B" 
                strokeWidth={2} 
                dot={false}
                animationDuration={1000}
              />
              <Tooltip 
                contentStyle={{ background: '#021d18', border: 'none', borderRadius: '4px', fontSize: '10px', color: '#fff' }}
                itemStyle={{ color: '#fff' }}
                cursor={{ stroke: '#00775B', strokeWidth: 1, strokeDasharray: '3 3' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] font-mono text-neutral-500">Peak: <span className="font-mono font-bold text-neutral-900">142</span> pax</span>
            <div className="flex items-center gap-1 text-[#00775B]">
                <Activity className="w-3 h-3" />
                <span className="text-[10px] font-mono font-bold">+12% vs 1h ago</span>
            </div>
        </div>
      </WidgetWrapper>

      {/* Active Alerts */}
      <WidgetWrapper title="Active Alerts Breakdown">
        <div className="grid grid-cols-3 gap-2 h-24">
            <div className="bg-red-50 border border-red-100 rounded-[2px] flex flex-col items-center justify-center p-2">
                <span className="text-2xl font-mono font-bold text-red-600">3</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-red-800/60 mt-1">Critical</span>
            </div>
            <div className="bg-orange-50 border border-orange-100 rounded-[2px] flex flex-col items-center justify-center p-2">
                <span className="text-2xl font-mono font-bold text-orange-600">5</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-orange-800/60 mt-1">High</span>
            </div>
            <div className="bg-yellow-50 border border-yellow-100 rounded-[2px] flex flex-col items-center justify-center p-2">
                <span className="text-2xl font-mono font-bold text-yellow-600">12</span>
                <span className="text-[9px] font-bold uppercase tracking-wider text-yellow-800/60 mt-1">Medium</span>
            </div>
        </div>
        <div className="mt-2 text-center">
            <span className="text-[10px] text-neutral-400">Total: 20 Active Incidents</span>
        </div>
      </WidgetWrapper>

      {/* System Health */}
      <WidgetWrapper title="System Health Status">
        <div className="space-y-3 pt-1">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00775B] shadow-[0_0_4px_#00775B]" />
                    <span className="text-xs font-medium text-neutral-700">Camera Feed Uptime</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#00775B]">99.9%</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-[#00775B] shadow-[0_0_4px_#00775B]" />
                    <span className="text-xs font-medium text-neutral-700">AI Inference Latency</span>
                </div>
                <span className="text-xs font-mono font-bold text-[#00775B]">12ms</span>
            </div>
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-yellow-500" />
                    <span className="text-xs font-medium text-neutral-700">Storage Capacity</span>
                </div>
                <span className="text-xs font-mono font-bold text-yellow-600">82%</span>
            </div>
        </div>
      </WidgetWrapper>
    </div>
  );
};