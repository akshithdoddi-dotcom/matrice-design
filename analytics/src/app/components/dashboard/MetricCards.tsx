import { cn } from "@/app/lib/utils";
import { ArrowUpRight, ArrowDownRight, Clock, AlertTriangle, CheckCircle2 } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subtitle: string;
  icon?: React.ElementType;
}

export const KPICard = ({ title, value, subtitle, icon: Icon }: KPICardProps) => {
  return (
    <div className="group relative overflow-hidden rounded-[4px] bg-gradient-to-br from-[#00775B] to-[#00503d] text-white shadow-md p-5 flex flex-col justify-between h-[120px] transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#00775B]/20 cursor-default border border-[#00775B]/20">
      {/* Background Gradient Effect on Hover */}
      <div className="absolute inset-0 bg-gradient-to-tr from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      
      <div className="flex items-start justify-between z-10">
        <div className="flex items-center gap-2">
           {Icon && (
             <div className="p-1.5 rounded bg-white/10 backdrop-blur-sm shadow-sm group-hover:bg-white/20 transition-colors border border-white/10">
               <Icon className="w-3.5 h-3.5 text-white" />
             </div>
           )}
           <span className="text-[10px] font-bold uppercase tracking-wider text-white/80 group-hover:text-white transition-colors">{title}</span>
        </div>
        {/* Sparkline SVG Placeholder - Animated on Hover */}
        <svg className="w-20 h-8 opacity-40 group-hover:opacity-60 transition-opacity" viewBox="0 0 100 40" fill="none">
           <path 
             d="M0 35 L10 30 L20 38 L30 20 L40 25 L50 15 L60 20 L70 10 L80 15 L90 5 L100 10" 
             stroke="white" 
             strokeWidth="2" 
             fill="none" 
             className="drop-shadow-sm"
           />
        </svg>
      </div>

      <div className="relative z-10 mt-auto w-full">
         <span className="text-3xl font-bold font-mono tracking-tight leading-none block text-white drop-shadow-sm">{value}</span>
      </div>
      
      <div className="flex items-center gap-2 mt-1">
         <div className="h-[1px] flex-1 bg-white/20" />
         <span className="text-[9px] font-bold uppercase tracking-wide text-white/70 group-hover:text-white/90 transition-colors">{subtitle}</span>
      </div>
    </div>
  );
};

interface MetricCardProps {
  title: string;
  value: string;
  trend: string;
  trendDir: "up" | "down";
  formula: string;
  updated: string;
  unit?: string;
  cameras?: string;
}

export const MetricCard = ({ title, value, unit, trend, trendDir, formula, updated, cameras }: MetricCardProps) => {
  return (
    <div className="group bg-white rounded-[4px] p-5 shadow-sm border border-neutral-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-[#00775B]/30 relative cursor-pointer">
      {/* Decorative top border line that appears on hover */}
      <div className="absolute top-0 left-0 w-full h-[2px] bg-[#00775B] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />

      <div className="flex items-center gap-2 mb-4">
        <div className="p-1.5 rounded bg-[#ebfffb] text-[#00775B] group-hover:bg-[#00775B] group-hover:text-white transition-colors duration-300">
           {trendDir === "up" ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-800">{title}</span>
        <span className="ml-auto text-[9px] font-medium text-neutral-400 uppercase tracking-wide group-hover:text-[#00775B] transition-colors">Real-time</span>
      </div>

      <div className="mb-4 bg-neutral-50 rounded-[4px] p-4 border border-neutral-100 group-hover:bg-white group-hover:shadow-inner group-hover:border-neutral-200 transition-all duration-300">
         <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-neutral-900 font-mono tracking-tight">{value}</span>
            {unit && <span className="text-sm font-medium text-neutral-500">{unit}</span>}
         </div>
         <p className="text-[10px] font-bold mt-1 flex items-center gap-1">
           <span className={cn(
             "px-1.5 rounded-[2px]", 
             trendDir === "down" ? "text-red-700 bg-red-50" : "text-[#00775B] bg-[#ebfffb]"
           )}>
             {trend}
           </span>
           <span className="text-neutral-400 uppercase">vs prev</span>
         </p>
      </div>

      <div className="space-y-3">
        <div>
           <p className="text-[9px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Formula</p>
           <div className="bg-neutral-100 rounded-[2px] px-2 py-1.5 font-mono text-[9px] text-neutral-600 truncate border border-transparent group-hover:border-neutral-200 transition-colors">
             {formula}
           </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-neutral-100 group-hover:border-neutral-200 transition-colors">
           <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
              <span className="text-[9px] font-bold text-neutral-600 uppercase group-hover:text-neutral-900 transition-colors">{cameras || "3 Cameras"}</span>
           </div>
           <span className="font-mono text-[9px] text-neutral-400 group-hover:text-neutral-500 transition-colors">
             UPDATED <span className="text-neutral-900 font-bold ml-1">{updated}</span>
           </span>
        </div>
      </div>
    </div>
  );
};
