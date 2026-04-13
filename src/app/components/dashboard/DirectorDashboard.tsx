import { useState } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { TrendingUp, ShieldCheck, DollarSign, Activity, CheckCircle2 } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { motion } from "motion/react";

const REVENUE_DATA = [
  { name: 'Protected', value: 85 },
  { name: 'Risk', value: 15 },
];

const EFFICIENCY_DATA = [
  { name: 'Efficient', value: 92 },
  { name: 'Gap', value: 8 },
];

const COLORS = ['#00956D', '#e2e8f0'];

const WidgetWrapper = ({ title, children, className }: { title: string, children: React.ReactNode, className?: string }) => {
  return (
    <div className={cn("bg-white rounded-md border border-neutral-200 shadow-sm p-6 relative group hover:border-[#00775B]/30 transition-colors flex flex-col justify-between overflow-hidden", className)}>
      <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-4 shrink-0">{title}</h3>
      {children}
    </div>
  );
};

export const DirectorDashboard = () => {
  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in fade-in zoom-in-95 duration-500">
      {/* Monthly Revenue Protection */}
      <WidgetWrapper title="Monthly Revenue Protection" className="lg:col-span-1 h-72">
        <div className="relative w-full h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                    <Pie
                        data={REVENUE_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {REVENUE_DATA.map((entry) => (
                        <Cell key={`revenue-${entry.name}`} fill={COLORS[REVENUE_DATA.indexOf(entry) % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center pointer-events-none">
                <span className="text-5xl font-mono font-bold text-[#00775B]">$1.2M</span>
                <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wide">Saved</span>
            </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3 shrink-0">
            <span>Target: $1.0M</span>
            <span className="text-[#00956D] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +20%
            </span>
        </div>
      </WidgetWrapper>

      {/* Operational Efficiency */}
      <WidgetWrapper title="Operational Efficiency" className="lg:col-span-1 h-72">
        <div className="relative w-full h-56">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={0}>
                <PieChart>
                    <Pie
                        data={EFFICIENCY_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        startAngle={180}
                        endAngle={0}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                    >
                        {EFFICIENCY_DATA.map((entry) => (
                        <Cell key={`efficiency-${entry.name}`} fill={COLORS[EFFICIENCY_DATA.indexOf(entry) % COLORS.length]} />
                        ))}
                    </Pie>
                </PieChart>
            </ResponsiveContainer>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-2 text-center pointer-events-none">
                <span className="text-2xl font-mono font-bold text-[#00775B]">92%</span>
                <span className="block text-[10px] text-neutral-400 font-medium uppercase tracking-wide">Score</span>
            </div>
        </div>
        <div className="mt-4 flex items-center justify-between text-xs text-neutral-400 border-t border-neutral-100 pt-3 shrink-0">
            <span>Target: 85%</span>
            <span className="text-[#00956D] font-bold flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +7%
            </span>
        </div>
      </WidgetWrapper>

      {/* Labor Cost Reduction */}
      <WidgetWrapper title="Labor Cost Reduction" className="lg:col-span-1 h-72">
        <div className="flex flex-col items-start justify-center flex-1">
             <div className="bg-[#00775B]/10 p-3 rounded-full mb-4">
                <DollarSign className="w-6 h-6 text-[#00775B]" />
             </div>
             <span className="text-4xl font-mono font-bold text-neutral-900 mb-2">18.5%</span>
             <p className="text-xs text-neutral-500 leading-relaxed">
                Reduction in overtime costs due to optimized shift scheduling based on traffic data.
             </p>
        </div>
        <div className="mt-auto flex items-center gap-2 text-xs font-bold text-[#00775B] border-t border-neutral-100 pt-3 w-full shrink-0">
            <TrendingUp className="w-3 h-3" /> On Track for Q1 Target
        </div>
      </WidgetWrapper>

      {/* Global Compliance Score */}
      <WidgetWrapper title="Global Compliance Score" className="lg:col-span-1 h-72 border-2 !border-[#E5FFF9] shadow-sm">
        <div className="flex flex-col items-start justify-center flex-1">
             <div className="bg-[#00775B] p-3 rounded-full mb-4 shadow-lg shadow-[#00775B]/20">
                <ShieldCheck className="w-6 h-6 text-white" />
             </div>
             <span className="text-5xl font-mono font-bold text-neutral-900 mb-2">98.2%</span>
             <p className="text-xs text-neutral-500 leading-relaxed">
                42/43 Sites fully compliant with safety protocols.
             </p>
        </div>
        <div className="mt-auto flex items-center gap-1.5 text-xs font-bold text-[#00956D] border-t border-neutral-100 pt-3 w-full shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 fill-current text-white bg-[#00956D] rounded-full" /> Verified Audit Passed
        </div>
      </WidgetWrapper>

      {/* Additional BI Section */}
      <div className="lg:col-span-4 mt-2">
         {/* Executive Insight Strip */}
         <div className="bg-[#E5FFF9] border border-[#00956D]/20 rounded-t-md px-4 py-2 flex items-center gap-2 mb-0.5">
            <div className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
            <span className="text-[10px] uppercase font-bold text-[#00775B]/80 tracking-wider">Insight:</span>
            <span className="text-xs font-medium text-neutral-700">Labor optimization in Southwest hubs has exceeded Q1 targets by <span className="font-bold text-[#00775B]">4.2%</span></span>
         </div>

         <div className="bg-white rounded-b-md border border-neutral-200 shadow-sm p-6">
            <div className="flex items-center justify-between mb-6">
               <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-800">Regional Performance Map</h3>
               <button className="text-xs font-bold text-[#00775B] hover:underline">View Full Report</button>
            </div>
            <div className="h-64 bg-neutral-50 rounded border border-neutral-100 flex items-center justify-center text-neutral-400 italic">
               [Interactive Geo-Map Placeholder]
            </div>
         </div>
      </div>
    </div>
  );
};