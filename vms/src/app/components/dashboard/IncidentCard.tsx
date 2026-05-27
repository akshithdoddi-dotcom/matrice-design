import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/lib/utils";
import { Video, Check, User, Info, CheckCircle2 } from "lucide-react";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { SeverityIcon } from "@/app/components/ui/SeverityIcon";

// Custom Filled MapPin with Centered Dot
const FilledMapPin = ({ className, dotColor = "white" }: { className?: string; dotColor?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" fill="currentColor" stroke="none" />
    <circle cx="12" cy="10" r="3" fill={dotColor} stroke="none" />
  </svg>
);

// Custom Filled Camera Icon
const FilledCamera = ({ className }: { className?: string }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    stroke="none" 
    className={className}
  >
    <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14v-4z" />
    <rect x="2" y="6" width="13" height="12" rx="2" ry="2" />
  </svg>
);

export type IncidentSeverity = "critical" | "high" | "medium" | "low" | "info" | "resolved";

interface IncidentCardProps {
  id: number;
  severity: IncidentSeverity;
  title: string;
  timestamp: string;
  location: string;
  camera: string;
  image: string;
  className?: string;
  forceHover?: boolean;
  onCardClick?: () => void;
  onAcknowledge?: (e: React.MouseEvent) => void;
  onAssign?: (e: React.MouseEvent) => void;
  alternateOverlay?: boolean; // New prop to control overlay style
  hoverVariant?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10; // Different hover effects for second row
}

const getSeverityConfig = (severity: IncidentSeverity) => {
  switch (severity) {
    case "critical":
      return { color: "bg-red-600" };
    case "high":
      return { color: "bg-[#EA580C]" };
    case "medium":
      return { color: "bg-[#CA8A04]" };
    case "low":
      return { color: "bg-blue-500" };
    case "info":
      return { color: "bg-neutral-500" };
    case "resolved":
      return { color: "bg-green-600" };
    default:
      return { color: "bg-neutral-500" };
  }
};

export const IncidentCard = ({
  id,
  severity,
  title,
  timestamp,
  location,
  camera,
  image,
  className,
  forceHover,
  onCardClick,
  onAcknowledge,
  onAssign,
  alternateOverlay,
  hoverVariant
}: IncidentCardProps) => {
  const config = getSeverityConfig(severity);

  const isCriticalNew = severity === "critical" && (timestamp.includes("Just now") || timestamp.includes("sec") || timestamp.includes("now"));
  
  // All cards now have the same height with hover buttons
  const imageHeight = "h-[160px]";

  return (
    <div 
      onClick={onCardClick}
      className={cn(
        "group relative flex flex-col overflow-hidden rounded-sm border transition-all duration-300 shrink-0 cursor-pointer",
        "w-[280px]",
        className,
        "bg-[#FAFAFA] border-neutral-200 shadow-sm hover:border-[#00775B]/30",
        "hover:-translate-y-1 hover:shadow-lg hover:ring-1 hover:ring-[#00775B]/50",
        forceHover && "-translate-y-1 shadow-lg ring-1 ring-[#00775B]/50 border-[#00775B]/30",
        isCriticalNew && "shadow-[0_0_20px_var(--primary-glow)] border-[#00775B]/40 ring-1 ring-[#00775B]/40"
      )}
    >
      {/* Header */}
      <div className={cn(
        "flex items-center justify-between px-3 py-2 border-b border-[#00775B]/20 transition-colors h-12 shrink-0",
        config.color
      )}>
        <div className="flex items-center gap-3 min-w-0">
          <div className={cn(
            "flex h-6 w-6 items-center justify-center rounded-[4px] transition-transform group-hover:scale-110 shrink-0",
            config.color,
            "text-white",
            forceHover && "scale-110"
          )}>
            <SeverityIcon severity={severity} mode="inverse" className="h-3.5 w-3.5" />
          </div>
          <div className="flex flex-col min-w-0 overflow-hidden">
            <span className="text-[11px] font-bold uppercase tracking-wider truncate text-white leading-tight">
              {title}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] font-medium truncate text-white">
              <span className="font-mono">{timestamp}</span>
            </div>
          </div>
        </div>
        
        {/* Incident ID */}
        <div className="text-[10px] font-medium text-white font-mono shrink-0 pl-2">
           #{id}
        </div>
      </div>

      {/* Image Area - Full Width with Overlays */}
      <div className={cn("relative w-full shrink-0 overflow-hidden border-b border-neutral-200 bg-neutral-100", imageHeight)}>
         <ImageWithFallback 
           src={image} 
           alt="Incident" 
           className={cn(
             "h-full w-full object-cover transition-transform duration-500 group-hover:scale-105",
             forceHover && "scale-105"
           )} 
         />
         
         {/* Conditional Overlay based on alternateOverlay prop */}
         {alternateOverlay ? (
           /* Alternate Style: Camera top-left, Location top-right, Different hover variants */
           <>
             {/* Camera Name - Top Left */}
             <div className="absolute top-2 left-2 bg-black/80 px-2 py-1 rounded-[2px] text-white text-[10px] font-bold backdrop-blur-md z-10">
               {camera}
             </div>
             
             {/* Location Name - Top Right */}
             <div className="absolute top-2 right-2 bg-black/80 px-2 py-1 rounded-[2px] text-white text-[10px] font-bold backdrop-blur-md z-10">
               {location}
             </div>
             
             {/* Subtle Dark Gradient Overlay on Hover - Behind the buttons */}
             <div className={cn(
               "absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-15",
               forceHover && "opacity-100"
             )} />
             
             {/* Default: Bottom Center Circular Buttons (no variant specified) */}
             {!hoverVariant && (
               <div className={cn(
                 "absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-3 transition-all duration-300 z-20",
                 forceHover ? "opacity-100" : "opacity-0 group-hover:opacity-100"
               )}>
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAssign?.(e);
                   }}
                   className={cn(
                     "h-12 w-12 rounded-full bg-white hover:bg-neutral-50 border-2 border-white/70 text-neutral-900 hover:text-[#00775B] shadow-2xl backdrop-blur-md transition-all p-0 transform",
                     forceHover ? "translate-y-0" : "translate-y-4 group-hover:translate-y-0"
                   )}
                   title="Assign"
                   style={{ transitionDelay: '0ms' }}
                 >
                   <User className="w-5 h-5" />
                 </Button>
                 <Button 
                   size="sm" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAcknowledge?.(e);
                   }}
                   className={cn(
                     "h-12 w-12 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 transform",
                     forceHover ? "translate-y-0" : "translate-y-4 group-hover:translate-y-0"
                   )}
                   title="Acknowledge"
                   style={{ transitionDelay: '50ms' }}
                 >
                   <Check className="w-5 h-5" strokeWidth={3} />
                 </Button>
               </div>
             )}
             
             {/* Hover Effect Variants 1-10 */}
             {hoverVariant === 1 && (
               /* Variant 1: Top-right icon buttons that appear on hover */
               <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAssign?.(e);
                   }}
                   className="h-9 w-9 rounded-sm bg-white/95 hover:bg-white border-white/50 text-neutral-900 hover:text-[#00775B] shadow-lg backdrop-blur-md transition-all p-0 transform -translate-y-2 group-hover:translate-y-0" 
                   title="Assign"
                   style={{ transitionDelay: '0ms' }}
                 >
                   <User className="w-4 h-4" />
                 </Button>
                 <Button 
                   size="sm" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAcknowledge?.(e);
                   }}
                   className="h-9 w-9 rounded-sm bg-[#00775B] hover:bg-[#009e78] text-white shadow-lg transition-all p-0 transform -translate-y-2 group-hover:translate-y-0" 
                   title="Acknowledge"
                   style={{ transitionDelay: '50ms' }}
                 >
                   <Check className="w-4 h-4" strokeWidth={3} />
                 </Button>
               </div>
             )}
             
             {hoverVariant === 2 && (
               /* Variant 2: Side buttons that slide in from left and right */
               <>
                 <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-full group-hover:translate-x-2 transition-transform duration-300 ease-out z-20">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-10 w-10 rounded-full bg-white/95 hover:bg-white border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0" 
                     title="Assign"
                   >
                     <User className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-full group-hover:-translate-x-2 transition-transform duration-300 ease-out z-20">
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-10 w-10 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0" 
                     title="Acknowledge"
                   >
                     <Check className="w-4 h-4" strokeWidth={3} />
                   </Button>
                 </div>
               </>
             )}
             
             {hoverVariant === 3 && (
               /* Variant 3: Center overlay with circular buttons */
               <div className="absolute inset-0 bg-black/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
                 <div className="flex flex-col items-center gap-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-12 w-12 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all p-0 ring-2 ring-white/30" 
                     title="Acknowledge"
                   >
                     <Check className="w-5 h-5" strokeWidth={3} />
                   </Button>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-12 w-12 rounded-full bg-white hover:bg-neutral-50 border-white text-neutral-900 hover:text-[#00775B] shadow-2xl transition-all p-0" 
                     title="Assign"
                   >
                     <User className="w-5 h-5" />
                   </Button>
                 </div>
               </div>
             )}
             
             {hoverVariant === 4 && (
               /* Variant 4: Bottom-right corner action buttons */
               <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 flex gap-2 z-20">
                 <Button 
                   variant="outline" 
                   size="sm" 
                   onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                   className="h-9 w-9 rounded-sm bg-white/95 hover:bg-white border-white/50 text-neutral-900 hover:text-[#00775B] shadow-lg backdrop-blur-md transition-all p-0 transform translate-x-12 group-hover:translate-x-0" 
                   title="Assign"
                   style={{ transitionDelay: '0ms' }}
                 >
                   <User className="w-4 h-4" />
                 </Button>
                 <Button 
                   size="sm" 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAcknowledge?.(e);
                   }}
                   className="h-9 w-9 rounded-sm bg-[#00775B] hover:bg-[#009e78] text-white shadow-lg transition-all p-0 transform translate-x-12 group-hover:translate-x-0" 
                   title="Acknowledge"
                   style={{ transitionDelay: '50ms' }}
                 >
                   <Check className="w-4 h-4" strokeWidth={3} />
                 </Button>
               </div>
             )}
             
             {hoverVariant === 5 && (
               /* Variant 5: Horizontal bottom row buttons that slide up */
               <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/95 via-black/85 to-transparent py-2 px-3 z-20">
                 <div className="flex items-center justify-center gap-3">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-9 w-9 rounded-full bg-white/95 hover:bg-white border-white/50 text-neutral-900 hover:text-[#00775B] shadow-lg backdrop-blur-md transition-all p-0" 
                     title="Assign"
                   >
                     <User className="w-4 h-4" />
                   </Button>
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-9 w-9 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-lg transition-all p-0" 
                     title="Acknowledge"
                   >
                     <Check className="w-4 h-4" strokeWidth={3} />
                   </Button>
                 </div>
               </div>
             )}
             
             {hoverVariant === 6 && (
               /* Variant 6: Professional corner badges with labels */
               <>
                 <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform -translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '0ms' }}>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-9 px-3 rounded-sm bg-white/95 hover:bg-white border border-neutral-300 hover:border-[#00775B] text-neutral-900 hover:text-[#00775B] shadow-lg backdrop-blur-md transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" 
                     title="Assign"
                   >
                     <User className="w-3.5 h-3.5" />
                     <span>Assign</span>
                   </Button>
                 </div>
                 <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform -translate-y-4 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }}>
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-9 px-3 rounded-sm bg-[#00775B] hover:bg-[#009e78] text-white shadow-lg transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" 
                     title="Acknowledge"
                   >
                     <Check className="w-3.5 h-3.5" strokeWidth={3} />
                     <span>Acknowledge</span>
                   </Button>
                 </div>
               </>
             )}
             
             {hoverVariant === 7 && (
               /* Variant 7: Bottom bar that slides up with inline buttons */
               <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out bg-gradient-to-t from-black/95 via-black/90 to-transparent pt-3 pb-2 px-3 z-20">
                 <div className="flex items-center justify-center gap-3">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-8 px-4 rounded-sm bg-white/95 hover:bg-white border-white/50 text-neutral-900 hover:text-[#00775B] shadow-lg backdrop-blur-md transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" 
                     title="Assign"
                   >
                     <User className="w-3.5 h-3.5" />
                     Assign
                   </Button>
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-8 px-4 rounded-sm bg-[#00775B] hover:bg-[#009e78] text-white shadow-lg transition-all text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5" 
                     title="Acknowledge"
                   >
                     <Check className="w-3.5 h-3.5" strokeWidth={3} />
                     Acknowledge
                   </Button>
                 </div>
               </div>
             )}
             
             {hoverVariant === 8 && (
               /* Variant 8: Split screen - left half becomes Assign, right half Acknowledge */
               <>
                 <div 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAssign?.(e);
                   }}
                   className="absolute inset-y-0 left-0 w-1/2 bg-white/0 hover:bg-white/10 backdrop-blur-0 hover:backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-20 flex items-center justify-center border-r border-white/0 hover:border-white/30"
                 >
                   <div className="h-11 w-11 rounded-full bg-white/90 shadow-xl flex items-center justify-center text-neutral-900 transform scale-75 hover:scale-100 transition-transform">
                     <User className="w-5 h-5" />
                   </div>
                 </div>
                 <div 
                   onClick={(e) => {
                     e.stopPropagation();
                     onAcknowledge?.(e);
                   }}
                   className="absolute inset-y-0 right-0 w-1/2 bg-[#00775B]/0 hover:bg-[#00775B]/20 backdrop-blur-0 hover:backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer z-20 flex items-center justify-center border-l border-white/0 hover:border-white/30"
                 >
                   <div className="h-11 w-11 rounded-full bg-[#00775B] shadow-xl flex items-center justify-center text-white transform scale-75 hover:scale-100 transition-transform">
                     <Check className="w-5 h-5" strokeWidth={3} />
                   </div>
                 </div>
               </>
             )}
             
             {hoverVariant === 9 && (
               /* Variant 9: Center floating pill buttons with labels */
               <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center z-20">
                 <div className="flex items-center gap-2 transform scale-90 group-hover:scale-100 transition-transform duration-300">
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-10 px-4 rounded-full bg-white hover:bg-neutral-50 border-2 border-white text-neutral-900 hover:text-[#00775B] shadow-2xl transition-all text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" 
                     title="Assign"
                   >
                     <User className="w-4 h-4" />
                     <span>Assign</span>
                   </Button>
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-10 px-4 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-2xl transition-all text-[11px] font-bold uppercase tracking-wider flex items-center gap-2" 
                     title="Acknowledge"
                   >
                     <Check className="w-4 h-4" strokeWidth={3} />
                     <span>Acknowledge</span>
                   </Button>
                 </div>
               </div>
             )}
             
             {hoverVariant === 10 && (
               /* Variant 10: Top-left and bottom-right diagonal corners */
               <>
                 <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform -translate-x-4 -translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0" style={{ transitionDelay: '0ms' }}>
                   <Button 
                     variant="outline" 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAssign?.(e);
                     }}
                     className="h-10 w-10 rounded-full bg-white/95 hover:bg-white border-2 border-white/50 text-neutral-900 hover:text-[#00775B] shadow-xl backdrop-blur-md transition-all p-0" 
                     title="Assign"
                   >
                     <User className="w-4 h-4" />
                   </Button>
                 </div>
                 <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-300 z-20 transform translate-x-4 translate-y-4 group-hover:translate-x-0 group-hover:translate-y-0" style={{ transitionDelay: '50ms' }}>
                   <Button 
                     size="sm" 
                     onClick={(e) => {
                       e.stopPropagation();
                       onAcknowledge?.(e);
                     }}
                     className="h-10 w-10 rounded-full bg-[#00775B] hover:bg-[#009e78] text-white shadow-xl transition-all p-0" 
                     title="Acknowledge"
                   >
                     <Check className="w-4 h-4" strokeWidth={3} />
                   </Button>
                 </div>
               </>
             )}
           </>
         ) : (
           /* Default Style: Live badge and bottom gradient with camera/location */
           <>
             {/* Live Badge */}
             {severity !== "resolved" && (
               <div className="absolute top-2 right-2 flex items-center gap-1 bg-black/80 px-1.5 py-0.5 rounded-[2px] text-[8px] font-bold text-white uppercase tracking-wider backdrop-blur-md z-10">
                 <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.6)]" /> Live
               </div>
             )}

             {/* Info Gradient Overlay - Horizontal Split Layout */}
             <div className="absolute bottom-0 left-0 right-0 py-2 px-3 bg-gradient-to-t from-black/95 via-black/70 to-transparent z-10">
                 <div className="flex items-center w-full gap-2">
                    {/* Camera - 50% width */}
                    <div className="flex items-center gap-1.5 w-1/2 min-w-0 text-white/90">
                       <FilledCamera className="w-4 h-4 shrink-0 text-white/90" />
                       <span className="text-xs font-bold truncate tracking-wide block w-full" title={camera}>{camera}</span>
                    </div>
                    
                    {/* Location - 50% width */}
                    <div className="flex items-center gap-1.5 w-1/2 min-w-0 text-white/90">
                       {/* Icon body is white (currentColor), Dot is Dark Green (#001E18) */}
                       <FilledMapPin className="w-4 h-4 shrink-0 text-white" dotColor="#001E18" />
                       <span className="text-xs font-bold truncate tracking-wide block w-full" title={location}>{location}</span>
                    </div>
                 </div>
             </div>
           </>
         )}
      </div>

      {/* Decorative Glow */}
      <div className={cn(
        "absolute inset-0 pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100",
        "bg-gradient-to-tr from-[#00775B]/5 to-transparent",
        forceHover && "opacity-100"
      )} />
    </div>
  );
};
