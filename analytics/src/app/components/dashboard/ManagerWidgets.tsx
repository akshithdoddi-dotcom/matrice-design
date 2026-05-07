import { useState } from "react";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LabelList } from "recharts";
import { GripVertical, Pin, TrendingUp, Users, Clock, Smile, AlertTriangle } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";

const STAFFING_DATA = [
  { day: "Mon", traffic: 400, staff: 240 },
  { day: "Tue", traffic: 300, staff: 139 },
  { day: "Wed", traffic: 200, staff: 980 },
  { day: "Thu", traffic: 278, staff: 390 },
  { day: "Fri", traffic: 189, staff: 480 },
  { day: "Sat", traffic: 239, staff: 380 },
  { day: "Sun", traffic: 349, staff: 430 },
];

const CustomAlertLabel = (props: any) => {
  const { x, y, width, payload } = props;
  
  if (!payload || typeof payload.traffic === 'undefined' || typeof payload.staff === 'undefined') {
    return null;
  }
  
  if (payload.traffic > payload.staff) {
    return (
      <g transform={`translate(${x + width / 2 - 8},${y - 20})`}>
        <circle cx="8" cy="8" r="8" fill="#EF4444" />
        <text x="8" y="13" textAnchor="middle" fill="#fff" fontSize="10" fontWeight="bold">!</text>
      </g>
    );
  }
  return null;
};

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

export const ManagerWidgets = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 animate-in fade-in slide-in-from-top-4 duration-500">
      {/* Staffing Gap - Bar Chart */}
      <WidgetWrapper title="Staffing Gap Indicator" className="lg:col-span-2">
        <div className="h-48 w-full min-h-[192px] min-w-0">
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
            <BarChart data={STAFFING_DATA} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
              <XAxis dataKey="day" stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={10} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: 'transparent' }}
                contentStyle={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '4px', fontSize: '10px' }}
              />
              <Legend wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }} />
              <Bar dataKey="traffic" fill="#00775B" radius={[4, 4, 0, 0]} name="Inbound Traffic" isAnimationActive={false}>
                  <LabelList dataKey="traffic" content={<CustomAlertLabel />} />
              </Bar>
              <Bar dataKey="staff" fill="#CBD5E1" radius={[4, 4, 0, 0]} name="Staffing Level" isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </WidgetWrapper>

      {/* KPIs & Heatmap Summary */}
      <div className="space-y-4">
         <WidgetWrapper title="Avg Wait Time">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-3xl font-mono font-bold text-neutral-900">4m 12s</span>
                    <span className="text-[10px] text-[#00956D] font-bold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> -12% vs Target (5m)
                    </span>
                </div>
                <div className="h-10 w-10 bg-green-50 rounded-full flex items-center justify-center text-green-600">
                    <Clock className="w-5 h-5" />
                </div>
            </div>
         </WidgetWrapper>

         <WidgetWrapper title="Customer Experience">
            <div className="flex items-center justify-between">
                <div className="flex flex-col">
                    <span className="text-3xl font-mono font-bold text-[#00956D]">8.9/10</span>
                    <span className="text-[10px] text-[#00956D] font-bold flex items-center gap-1 mt-1">
                        <TrendingUp className="w-3 h-3" /> +0.4 vs Last Week
                    </span>
                </div>
                <div className="h-10 w-10 bg-[#00775B]/10 rounded-full flex items-center justify-center text-[#00775B]">
                    <Smile className="w-5 h-5" />
                </div>
            </div>
         </WidgetWrapper>
         
         <div className="bg-red-50 border border-red-100 rounded-md p-3 flex items-center gap-3">
             <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center text-red-600 shrink-0">
                 <AlertTriangle className="w-4 h-4" />
             </div>
             <div>
                 <h4 className="text-[10px] font-bold text-red-800 uppercase tracking-wide">Weekly Hotspot</h4>
                 <p className="text-[11px] text-red-700 leading-tight">Highest incident frequency detected on <span className="font-bold">Friday 16:00-18:00</span>.</p>
             </div>
         </div>
      </div>
    </div>
  );
};
