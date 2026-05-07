import { CarFront } from "lucide-react";
import { cn } from "@/app/lib/utils";

interface IdentityEvidenceMediaProps {
  kind: "FACE" | "PLATE";
  seed: string;
  imageSrc?: string;
  confidence?: number;
  label?: string;
  sublabel?: string;
  plateText?: string;
  size?: "sm" | "lg";
  live?: boolean;
  className?: string;
}

const sizeClass = {
  sm: "h-24 w-24",
  lg: "h-40 w-40",
};

const carBodyClass = {
  sm: "h-9 w-16",
  lg: "h-14 w-24",
};

export const IdentityEvidenceMedia = ({
  kind,
  seed,
  imageSrc,
  confidence,
  label,
  sublabel,
  plateText,
  size = "sm",
  live = false,
  className,
}: IdentityEvidenceMediaProps) => {
  const isFace = kind === "FACE";

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md border border-neutral-200 bg-neutral-950 shadow-sm",
        sizeClass[size],
        className
      )}
    >
      {isFace ? (
        <>
          <img
            src={imageSrc ?? `https://i.pravatar.cc/${size === "lg" ? 320 : 192}?u=${seed}`}
            alt={label ?? "Face capture"}
            className="h-full w-full object-cover opacity-90"
            style={{ filter: "contrast(1.05) saturate(0.9) brightness(0.92)" }}
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(0,119,91,0.18),_transparent_45%)]" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-black/55" />
          <div className="pointer-events-none absolute left-[22%] top-[18%] h-[56%] w-[56%] rounded-md border-2 border-[#00FF84] shadow-[0_0_0_1px_rgba(0,255,132,0.2),0_0_14px_rgba(0,255,132,0.35)]" />
        </>
      ) : (
        <>
          {imageSrc ? (
            <>
              <img
                src={imageSrc}
                alt={label ?? "Vehicle capture"}
                className="h-full w-full object-cover opacity-95"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/5 via-transparent to-black/55" />
            </>
          ) : (
            <>
              <div className="absolute inset-0 bg-[linear-gradient(180deg,#dff7ff_0%,#a2d4f5_48%,#1f2937_48%,#111827_100%)]" />
              <div className="absolute inset-x-0 bottom-0 h-8 bg-[linear-gradient(180deg,rgba(255,255,255,0.08),rgba(0,0,0,0.35))]" />
              <div className={cn("absolute left-1/2 top-[38%] -translate-x-1/2 -translate-y-1/2", carBodyClass[size])}>
                <div className="absolute inset-x-[10%] bottom-0 h-[55%] rounded-[10px] border border-slate-200/70 bg-slate-50 shadow-[inset_0_-10px_20px_rgba(15,23,42,0.16)]" />
                <div className="absolute left-[22%] top-[8%] h-[34%] w-[56%] rounded-t-[10px] rounded-b-[4px] border border-slate-200/70 bg-slate-100" />
                <div className="absolute left-[25%] top-[13%] h-[20%] w-[20%] rounded-sm bg-sky-200/80" />
                <div className="absolute right-[25%] top-[13%] h-[20%] w-[20%] rounded-sm bg-sky-200/80" />
                <div className="absolute inset-x-[34%] bottom-[12%] rounded-[4px] border border-amber-200 bg-amber-100 px-1 py-[2px] text-center text-[8px] font-black tracking-[0.18em] text-amber-800">
                  {plateText ?? "KA05MJ4421"}
                </div>
                <div className="absolute bottom-[10%] left-[10%] h-3 w-3 rounded-full border border-slate-600 bg-slate-900" />
                <div className="absolute bottom-[10%] right-[10%] h-3 w-3 rounded-full border border-slate-600 bg-slate-900" />
                <div className="absolute left-[16%] top-[42%] h-1.5 w-2 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,224,71,0.45)]" />
                <div className="absolute right-[16%] top-[42%] h-1.5 w-2 rounded-full bg-amber-200 shadow-[0_0_10px_rgba(253,224,71,0.45)]" />
                <div className="absolute inset-0 flex items-center justify-center opacity-10">
                  <CarFront className={size === "lg" ? "h-20 w-20" : "h-12 w-12"} />
                </div>
              </div>
            </>
          )}
          <div className="pointer-events-none absolute left-[18%] top-[22%] h-[50%] w-[64%] rounded-md border-2 border-[#00FF84] shadow-[0_0_0_1px_rgba(0,255,132,0.2),0_0_14px_rgba(0,255,132,0.3)]" />
        </>
      )}

      {(label || sublabel) && (
        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 to-transparent px-2.5 pb-2 pt-6">
          {label && <p className="truncate text-[10px] font-bold text-white">{label}</p>}
          {sublabel && <p className="truncate text-[9px] text-white/70">{sublabel}</p>}
        </div>
      )}

      {typeof confidence === "number" && (
        <div className="absolute left-2 top-2 rounded-md bg-black/75 px-1.5 py-1 text-[9px] font-black tabular-nums text-[#00FF84]">
          {isFace ? "FACE" : "PLATE"} {confidence}%
        </div>
      )}

      {live && (
        <div className="absolute right-2 top-2 flex items-center gap-1 rounded-md bg-black/70 px-1.5 py-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white">
          <span className="h-1.5 w-1.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.7)]" />
          Live
        </div>
      )}
    </div>
  );
};
