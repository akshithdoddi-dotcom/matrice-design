import { useState, useRef, useEffect } from "react";
import { Filter, ChevronDown, Calendar, Layers, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";

export const AnalyticsHeader = ({ title, icon: Icon, defaultGranularity = "1d" }: { title: string, icon: any, defaultGranularity?: string }) => {
  const [granularity, setGranularity] = useState(defaultGranularity);
  const [selectedApps, setSelectedApps] = useState<string[]>(["All Apps"]);
  const [isAppsOpen, setIsAppsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const GRANULARITY_OPTIONS = ["1m", "1h", "1d", "1w", "1mo"];
  const APP_OPTIONS = ["All Apps", "PPE", "Intrusion", "Crowd", "LPR", "Face Recog"];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsAppsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggleApp = (app: string) => {
    if (app === "All Apps") {
      setSelectedApps(["All Apps"]);
      return;
    }

    let newApps = [...selectedApps];
    if (newApps.includes("All Apps")) {
      newApps = [];
    }

    if (newApps.includes(app)) {
      newApps = newApps.filter(a => a !== app);
    } else {
      newApps.push(app);
    }

    if (newApps.length === 0) {
      newApps = ["All Apps"];
    }

    setSelectedApps(newApps);
  };

  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between mb-4 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
         <div className="p-2 bg-[#E5FFF9] rounded-sm text-[#00775B]">
            <Icon className="w-5 h-5" />
         </div>
         <h2 className="text-lg font-bold text-neutral-800 uppercase tracking-wide">{title}</h2>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        {/* Granularity Toggle */}
        <div className="flex items-center bg-white rounded-sm border border-neutral-200 p-0.5 shadow-sm">
           {GRANULARITY_OPTIONS.map((opt) => (
              <button
                 key={opt}
                 onClick={() => setGranularity(opt)}
                 className={cn(
                    "px-3 py-1 text-[10px] font-bold uppercase tracking-wide rounded-sm transition-all",
                    granularity === opt 
                       ? "bg-[#00775B] text-white shadow-sm" 
                       : "text-neutral-500 hover:bg-neutral-50"
                 )}
              >
                 {opt}
              </button>
           ))}
        </div>

        {/* App Filter (Multi-Select) */}
        <div className="relative group" ref={dropdownRef}>
           <button 
             onClick={() => setIsAppsOpen(!isAppsOpen)}
             className={cn(
               "flex items-center gap-2 bg-white px-3 py-1.5 rounded-sm border shadow-sm text-xs font-bold transition-all",
               isAppsOpen ? "border-[#00775B] text-[#00775B]" : "border-neutral-200 text-neutral-600 hover:border-neutral-300"
             )}
           >
              <Layers className="w-3.5 h-3.5" />
              <span>
                {selectedApps.includes("All Apps") 
                  ? "All Apps" 
                  : `${selectedApps.length} App${selectedApps.length > 1 ? 's' : ''} Selected`}
              </span>
              <ChevronDown className={cn("w-3 h-3 text-neutral-400 transition-transform", isAppsOpen && "rotate-180")} />
           </button>
           
           {/* Dropdown Menu */}
           {isAppsOpen && (
              <div className="absolute top-full right-0 mt-1 w-48 bg-white border border-neutral-200 rounded-sm shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100 overflow-hidden">
                 <div className="py-1">
                   {APP_OPTIONS.map((app) => {
                      const isSelected = selectedApps.includes(app);
                      return (
                         <div 
                           key={app} 
                           onClick={() => toggleApp(app)}
                           className="px-3 py-2 text-xs font-medium text-neutral-600 hover:bg-neutral-50 cursor-pointer flex items-center justify-between group/item"
                         >
                            <span className={cn("transition-colors", isSelected && "text-[#00775B]")}>{app}</span>
                            <div className={cn(
                               "w-3.5 h-3.5 rounded-[2px] border flex items-center justify-center transition-colors",
                               isSelected 
                                 ? "bg-[#00775B] border-[#00775B]" 
                                 : "border-neutral-300 group-hover/item:border-neutral-400"
                            )}>
                               {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                         </div>
                      );
                   })}
                 </div>
                 <div className="border-t border-neutral-100 bg-neutral-50 px-3 py-2 text-[10px] text-neutral-400 font-data text-center">
                    {selectedApps.includes("All Apps") ? "Showing All Applications" : "Filtered View Active"}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};
