import { X, MapPin, Video, Clock } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { cn } from "@/app/lib/utils";
import { ImageWithFallback } from "@/app/components/figma/ImageWithFallback";
import { Incident } from "@/app/data/mockData";
import exampleImage from "figma:asset/e3a0bc4f9dedf49830193abd110d14f27d6b8c19.png";

interface IncidentDetailModalProps {
  incident: Incident | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge?: () => void;
  onAssign?: () => void;
}

export const IncidentDetailModal = ({
  incident,
  open,
  onOpenChange,
  onAcknowledge,
  onAssign
}: IncidentDetailModalProps) => {
  if (!open || !incident) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={() => onOpenChange(false)}
      />
      
      {/* Modal */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-[900px] max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-white rounded-sm shadow-2xl overflow-hidden flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-[#001E18]">
            <h2 className="text-sm font-bold text-white uppercase tracking-wider">
              Incident Details: INC-{incident.id}
            </h2>
            <button 
              onClick={() => onOpenChange(false)}
              className="h-8 w-8 rounded-sm flex items-center justify-center hover:bg-white/10 transition-colors text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Content */}
          <div className="flex overflow-hidden" style={{ height: '500px' }}>
            {/* Left: Image */}
            <div className="w-[60%] relative bg-black flex items-center justify-center">
              <ImageWithFallback 
                src={incident.image} 
                alt="Incident Evidence" 
                className="w-full h-full object-contain"
              />
              
              {/* Live Badge */}
              <div className="absolute top-4 right-4 flex items-center gap-2 bg-red-600 px-3 py-1.5 rounded-[2px] text-xs font-bold text-white uppercase tracking-wider">
                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                LIVE FEED
              </div>
              
              {/* Timestamp and Camera overlay */}
              <div className="absolute bottom-4 left-4 flex items-center gap-3">
                <div className="flex items-center gap-1.5 bg-black/80 px-2 py-1 rounded-[2px] backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-mono text-white">17:30 PM</span>
                </div>
                <div className="flex items-center gap-1.5 bg-black/80 px-2 py-1 rounded-[2px] backdrop-blur-md">
                  <Video className="w-3.5 h-3.5 text-white" />
                  <span className="text-xs font-bold text-white">Cam-L-02</span>
                </div>
              </div>

              {/* Live Feed Button */}
              <button className="absolute bottom-4 right-4 flex items-center gap-1.5 bg-black/80 hover:bg-black px-3 py-1.5 rounded-[2px] transition-colors backdrop-blur-md border border-white/20">
                <Video className="w-3.5 h-3.5 text-white" />
                <span className="text-xs font-bold text-white uppercase tracking-wider">LIVE FEED</span>
              </button>
            </div>

            {/* Right: Details */}
            <div className="w-[40%] flex flex-col bg-[#FAFAFA]">
              <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
                {/* Incident Information */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-bold text-[#00775B] uppercase tracking-wider">Incident Information</h3>
                    <button className="text-xs text-neutral-400 hover:text-neutral-600">
                      INC-3049 
                      <span className="inline-block ml-1 opacity-50">⧉</span>
                    </button>
                  </div>
                  
                  <div className="bg-white rounded-sm border border-neutral-200 p-4">
                    <h4 className="text-base font-bold text-neutral-900 mb-1">
                      {incident.title}
                    </h4>
                    <div className={cn(
                      "inline-flex items-center gap-1 px-2 py-0.5 rounded-[2px] text-[10px] font-bold uppercase tracking-wider",
                      incident.severity === "critical" && "bg-red-600 text-white",
                      incident.severity === "high" && "bg-[#EA580C] text-white"
                    )}>
                      {incident.severity}
                    </div>
                    
                    <p className="text-xs text-neutral-600 mt-3 italic">
                      "Potential weapon (knife) detected in hand of visitor"
                    </p>
                  </div>
                </div>

                {/* Location & Camera */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Location
                    </div>
                    <div className="bg-white rounded-sm border border-neutral-200 p-3 flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-[#00775B]" />
                      <span className="text-xs font-bold text-neutral-900">
                        {incident.location}
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                      Camera Source
                    </div>
                    <div className="bg-white rounded-sm border border-neutral-200 p-3 flex items-center gap-2">
                      <Video className="w-4 h-4 text-[#00775B]" />
                      <span className="text-xs font-bold text-neutral-900">
                        {incident.camera}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detected Objects */}
                <div>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Detected Objects
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <span className="px-2 py-1 bg-[#00775B] text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
                      PERSON
                    </span>
                    <span className="px-2 py-1 bg-[#00775B] text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
                      WEAPON
                    </span>
                    <span className="px-2 py-1 bg-[#00775B] text-white text-[10px] font-bold uppercase tracking-wider rounded-[2px]">
                      KNIFE
                    </span>
                  </div>
                </div>

                {/* Incident Timeline */}
                <div>
                  <div className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2">
                    Incident Timeline
                  </div>
                  <div className="bg-white rounded-sm border border-neutral-200 p-4 space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-[#00775B] mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-neutral-900">Incident Viewed</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          <span>Now</span>
                          <span className="mx-1">·</span>
                          <span className="text-[#00775B]">Admin User</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start gap-3">
                      <div className="w-2 h-2 rounded-full bg-neutral-300 mt-1.5 shrink-0" />
                      <div className="flex-1">
                        <div className="text-xs font-bold text-neutral-900">Alert Triggered</div>
                        <div className="text-[10px] text-neutral-500 font-mono">
                          <span>-2m</span>
                          <span className="mx-1">·</span>
                          <span>ConfigBase Res</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="px-6 py-4 bg-white border-t border-neutral-200 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    onAssign?.();
                  }}
                  className="flex-1 h-10 font-bold text-sm border-neutral-200 hover:border-[#00775B] hover:text-[#00775B]"
                >
                  <span className="mr-2">👤</span>
                  ASSIGN
                </Button>
                <Button
                  onClick={() => {
                    onAcknowledge?.();
                  }}
                  className="flex-1 h-10 font-bold text-sm bg-[#00775B] hover:bg-[#009e78] text-white"
                >
                  <span className="mr-2">✓</span>
                  ACKNOWLEDGE
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
