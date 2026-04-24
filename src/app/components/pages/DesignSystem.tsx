import { useState, useRef, useCallback } from "react";
import {
  Info,
  TrendingUp,
  TrendingDown,
  Minus,
  Layers,
  CheckCircle2,
  Cpu,
  Eye,
  BookOpen,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────
type SeverityDir = "up" | "down" | "neutral";

interface CardVariant {
  id: string;
  label: string;
  sublabel: string;
  value: string;
  deltaPct: string;
  dir: SeverityDir;
  subtext: string;
  color: string;
  bgColor?: string;  // solid hex bg — used by HUD cards
  deltaNum?: string; // badge line 1, e.g. "-8%"
  deltaRef?: string; // badge line 2, e.g. "vs Yesterday"
  name: string;
  sparkData: number[];
}

interface KPICardProps {
  variant: CardVariant;
  isSkeleton?: boolean;
  frozenCursorFrac?: number;
}

// ─── V1.0 variant data ────────────────────────────────────────────────────────
const SEVERITY_CARDS: CardVariant[] = [
  { id: "critical", label: "Critical Events",  sublabel: "Loading Dock · Active",      value: "23",    deltaPct: "+12%",  dir: "up",      subtext: "Updated 2 mins ago",  color: "#E7000B", name: "Critical", sparkData: [4, 6, 5, 8, 11, 9, 14, 18, 15, 20, 23] },
  { id: "high",     label: "High Severity",    sublabel: "Assembly Lines · Shift A",   value: "47",    deltaPct: "-8%",   dir: "down",    subtext: "Updated 5 mins ago",  color: "#EA580C", name: "High",     sparkData: [60, 58, 54, 52, 49, 51, 48, 47] },
  { id: "medium",   label: "Compliance Rate",  sublabel: "All Zones · 24h Window",     value: "94.3%", deltaPct: "+2.1%", dir: "up",      subtext: "Updated 1 min ago",   color: "#E19A04", name: "Medium",   sparkData: [88, 89, 90, 91, 89, 92, 93, 94, 94.3] },
  { id: "low",      label: "Active Cameras",   sublabel: "All Sites · Live Feed",      value: "142",   deltaPct: "0%",    dir: "neutral", subtext: "Updated just now",    color: "#2B7FFF", name: "Low",      sparkData: [140, 142, 141, 142, 142, 141, 142, 142] },
  { id: "info",     label: "Mean Time to Ack", sublabel: "MTTA · 24h Rolling",         value: "15.2m", deltaPct: "-3.4%", dir: "down",    subtext: "Updated 3 mins ago",  color: "#64748B", name: "Info",     sparkData: [18.5, 17.8, 17.2, 16.9, 16.1, 15.8, 15.2] },
  { id: "success",  label: "Resolved Today",   sublabel: "vs. Yesterday · All Types",  value: "89",    deltaPct: "+24%",  dir: "up",      subtext: "Updated 1 min ago",   color: "#00A63E", name: "Success",  sparkData: [55, 60, 63, 68, 72, 78, 83, 89] },
];

// ─── V1.1 HUD cards (4 severity levels, specific display matrix) ──────────────
const HUD_CARDS: CardVariant[] = [
  {
    id: "critical",
    label: "Safety Compliance",
    sublabel: "Scope: All Cameras",
    value: "14",
    deltaPct: "-8% vs Yesterday",
    deltaNum: "-8%", deltaRef: "vs Yesterday",
    dir: "down",
    subtext: "",
    color: "#E7000B",
    bgColor: "#FFE5E7",
    name: "Critical",
    sparkData: [22, 20, 19, 17, 16, 16, 15, 14],
  },
  {
    id: "warning",
    label: "Active Warnings",
    sublabel: "Scope: Warehouse A",
    value: "08",
    deltaPct: "+2% vs Yesterday",
    deltaNum: "+2%", deltaRef: "vs Yesterday",
    dir: "up",
    subtext: "",
    color: "#EA580C",
    bgColor: "#FEEFE7",
    name: "Warning",
    sparkData: [6, 6, 7, 7, 7, 8, 8, 8],
  },
  {
    id: "stable",
    label: "Compliance Rate",
    sublabel: "Scope: All Sites",
    value: "99.1%",
    deltaPct: "+0.4% vs Yesterday",
    deltaNum: "+0.4%", deltaRef: "vs Yesterday",
    dir: "up",
    subtext: "",
    color: "#00A63E",
    bgColor: "#E5FFEF",
    name: "Stable",
    sparkData: [97.8, 98.1, 98.4, 98.7, 98.9, 99.0, 99.1, 99.1],
  },
  {
    id: "info",
    label: "Active Pipelines",
    sublabel: "Scope: Pipeline A",
    value: "450",
    deltaPct: "No Change",
    deltaNum: "—", deltaRef: "No Change",
    dir: "neutral",
    subtext: "",
    color: "#2B7FFF",
    bgColor: "#E5F0FF",
    name: "Info",
    sparkData: [448, 450, 449, 451, 450, 450, 449, 450],
  },
];

// ─── Sparkline geometry helpers ───────────────────────────────────────────────
// V1.0 sparkline dimensions
const SW = 108, SH = 34, SP = 3;
// V1.1 HUD sparkline dimensions (slightly narrower for compact bottom row)
const HSW = 96, HSH = 32, HSP = 3;

function buildSparkPath(data: number[], w = SW, h = SH, p = SP): [number, number][] {
  const min = Math.min(...data), max = Math.max(...data), range = max - min || 1;
  return data.map((v, i) => [
    p + (i / (data.length - 1)) * (w - p * 2),
    h - p - ((v - min) / range) * (h - p * 2),
  ]);
}

function interp(data: number[], frac: number): number {
  const idx = Math.max(0, Math.min(frac * (data.length - 1), data.length - 1));
  const lo = Math.floor(idx), hi = Math.min(lo + 1, data.length - 1);
  return data[lo] + (data[hi] - data[lo]) * (idx - lo);
}

function hex2rgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Skeleton shimmer ─────────────────────────────────────────────────────────
const Sk = ({ className }: { className?: string }) => (
  <div className={cn("animate-pulse rounded-[3px] bg-neutral-200/80", className)} />
);

// ─── Shared UI atoms ──────────────────────────────────────────────────────────
const SectionHeader = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) => (
  <div className="flex items-start gap-3 mb-5">
    <div className="w-8 h-8 rounded-[4px] bg-[#E5FFF9] flex items-center justify-center flex-shrink-0 mt-0.5">
      <Icon className="w-4 h-4 text-[#00775B]" />
    </div>
    <div>
      <h2 className="text-[13px] font-bold uppercase tracking-[0.6px] text-[#0f172a]">{title}</h2>
      <p className="text-[12px] text-[#64748b] mt-0.5">{description}</p>
    </div>
  </div>
);

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.5px] text-white"
    style={{ backgroundColor: color }}
  >
    {label}
  </span>
);

const SpecChip = ({ label, value }: { label: string; value: string }) => (
  <div className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] bg-white border border-[#E2E8F0] text-[11px]">
    <span className="text-[#94a3b8] font-medium">{label}:</span>
    <span className="font-semibold text-[#334155] font-mono">{value}</span>
  </div>
);

const Annotation = ({ children }: { children: React.ReactNode }) => (
  <div className="flex items-center gap-1.5 text-[11px] text-[#64748b]">
    <CheckCircle2 className="w-3.5 h-3.5 text-[#00775B] flex-shrink-0" />
    {children}
  </div>
);

// ─── V1.0 Showcase canvas (dark gradient + dot grid) ─────────────────────────
const ShowcaseCanvas = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-[8px] p-7 relative overflow-hidden"
    style={{ background: "linear-gradient(135deg, #0d1f35 0%, #0a1628 45%, #021D18 100%)" }}
  >
    <div
      className="absolute inset-0 opacity-[0.04]"
      style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "28px 28px" }}
    />
    <div className="relative flex flex-wrap gap-5 justify-center">{children}</div>
  </div>
);

// ─── V1.1 HUD canvas (neutral light bg + subtle dot grid, 4-col grid) ─────────
const HUDCanvas = ({ children }: { children: React.ReactNode }) => (
  <div
    className="rounded-[8px] p-6 relative overflow-hidden border border-[#E2E8F0]"
    style={{ background: "#F0F2F4" }}
  >
    <div
      className="absolute inset-0 opacity-30"
      style={{ backgroundImage: "radial-gradient(circle, #CBD5E1 1px, transparent 1px)", backgroundSize: "20px 20px" }}
    />
    <div className="relative grid grid-cols-2 xl:grid-cols-4 gap-4">{children}</div>
  </div>
);

// ─── Dark table header ────────────────────────────────────────────────────────
const DarkTableHeader = ({ cols, labels }: { cols: string; labels: string[] }) => (
  <div
    className={cn(
      "grid bg-[#021D18] px-5 py-3 text-[10px] font-bold uppercase tracking-[0.55px] text-white/60",
      cols
    )}
  >
    {labels.map((l) => (
      <div key={l}>{l}</div>
    ))}
  </div>
);


// ══════════════════════════════════════════════════════════════════════════════
//  V1.0  ·  KPI CARD
//  White glassmorphic bg · 3px top border · Inter · standard sparkline
// ══════════════════════════════════════════════════════════════════════════════
const KPICard = ({ variant, isSkeleton = false, frozenCursorFrac }: KPICardProps) => {
  const [isHovered, setIsHovered] = useState(false);
  const [cursorFrac, setCursorFrac] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isFrozen = frozenCursorFrac !== undefined;
  const activeFrac = isFrozen ? frozenCursorFrac! : cursorFrac;
  const showCursor = isFrozen || cursorFrac !== null;
  const hover = isFrozen || isHovered;

  const handleMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setCursorFrac(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, []);

  if (isSkeleton) {
    return (
      <div
        className="w-[280px] rounded-[4px] bg-white p-4 flex flex-col gap-3"
        style={{ border: "1px solid #E2E8F0" }}
      >
        <div className="flex items-center justify-between">
          <Sk className="h-3 w-28" />
          <Sk className="h-3.5 w-3.5 rounded-full" />
        </div>
        <Sk className="h-7 w-20 mt-1" />
        <div className="flex items-center justify-between gap-3">
          <Sk className="h-4 w-14" />
          <Sk className="h-[34px] w-[108px] rounded-[3px]" />
        </div>
        <Sk className="h-3 w-36" />
      </div>
    );
  }

  const pts = buildSparkPath(variant.sparkData);
  const dPath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fillPath = `${dPath} L ${pts[pts.length - 1][0].toFixed(1)} ${SH} L ${pts[0][0].toFixed(1)} ${SH} Z`;
  const [lx, ly] = pts[pts.length - 1];
  const cxPx = activeFrac != null ? SP + activeFrac * (SW - SP * 2) : null;
  const cyPx =
    activeFrac != null
      ? (() => {
          const mn = Math.min(...variant.sparkData),
            mx = Math.max(...variant.sparkData),
            rng = mx - mn || 1;
          return SH - SP - ((interp(variant.sparkData, activeFrac) - mn) / rng) * (SH - SP * 2);
        })()
      : null;
  const tipVal =
    activeFrac != null
      ? interp(variant.sparkData, activeFrac).toFixed(1) + (variant.value.includes("%") ? "%" : "")
      : null;

  return (
    <div
      className="w-[280px] rounded-[4px] bg-white/90 backdrop-blur-sm flex flex-col gap-3 p-4 cursor-default select-none transition-all duration-200"
      style={{
        border: "1px solid #E2E8F0",
        borderTop: `3px solid ${variant.color}`,
        boxShadow: hover
          ? `0 0 18px 4px ${variant.color}28, 0 4px 20px rgba(0,0,0,0.09)`
          : `0 0 8px 1px ${variant.color}14, 0 1px 4px rgba(0,0,0,0.05)`,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setCursorFrac(null);
      }}
    >
      <div className="flex items-center justify-between">
        <span className="text-[12px] font-medium text-[#64748b] uppercase tracking-[0.4px] leading-none">
          {variant.label}
        </span>
        <Info className="w-3.5 h-3.5 text-neutral-300 hover:text-neutral-500 transition-colors flex-shrink-0" />
      </div>
      <div className="text-[24px] font-bold text-[#0f172a] tabular-nums leading-none">{variant.value}</div>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 flex-shrink-0">
          {variant.dir === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 flex-shrink-0" style={{ color: variant.color }} />
          ) : variant.dir === "down" ? (
            <TrendingDown className="w-3.5 h-3.5 flex-shrink-0" style={{ color: variant.color }} />
          ) : (
            <Minus className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          )}
          <span className="text-[12px] font-semibold" style={{ color: variant.color }}>
            {variant.deltaPct}
          </span>
        </div>
        <div className="relative flex-shrink-0">
          {showCursor && tipVal && cxPx != null && (
            <div
              className="absolute -top-6 z-10 pointer-events-none -translate-x-1/2"
              style={{ left: cxPx }}
            >
              <div className="bg-[#0f172a] text-white text-[10px] font-semibold px-2 py-[3px] rounded-[3px] whitespace-nowrap shadow-lg">
                Value: {tipVal}
              </div>
              <div className="w-0 h-0 mx-auto border-x-4 border-x-transparent border-t-4 border-t-[#0f172a]" />
            </div>
          )}
          <svg
            ref={svgRef}
            width={SW}
            height={SH}
            viewBox={`0 0 ${SW} ${SH}`}
            fill="none"
            className={isFrozen ? "" : "cursor-crosshair"}
            onMouseMove={isFrozen ? undefined : handleMove}
            onMouseLeave={isFrozen ? undefined : () => setCursorFrac(null)}
          >
            <path d={fillPath} fill="#00775B" opacity="0.08" />
            <path d={dPath} stroke="#00775B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lx} cy={ly} r="2.5" fill="#00775B" opacity="0.25">
              <animate attributeName="r" values="2.5;5.5;2.5" dur="2.2s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.25;0;0.25" dur="2.2s" repeatCount="indefinite" />
            </circle>
            <circle cx={lx} cy={ly} r="2" fill="#00775B" />
            {showCursor && cxPx != null && cyPx != null && (
              <>
                <line
                  x1={cxPx} y1={SP - 1} x2={cxPx} y2={SH - SP + 1}
                  stroke="rgba(100,116,139,0.55)" strokeWidth="1" strokeDasharray="2 2"
                />
                <circle cx={cxPx} cy={cyPx} r="3" fill="#00775B" stroke="white" strokeWidth="1.5" />
              </>
            )}
          </svg>
        </div>
      </div>
      <div className="text-[10px] font-normal text-[#94a3b8] leading-none">{variant.subtext}</div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════════════════════
//  V1.1  ·  HUD KPI CARD
//
//  Surface   — solid hex bg, 1px bright border, 4px radius
//  Top       — Inter Bold 11px LABEL (caps) · gap · [Mono 24px value + 10px sublabel]
//  Divider   — 1px rgba(color, 0.25)
//  Bottom    — Badge-Stack (left, 2-line tinted box) | Sparkline (right, severity color)
//              Badge line 1: Mono Bold 13px delta number + arrow
//              Badge line 2: Inter Regular 9px reference text (e.g. "vs Yesterday")
// ══════════════════════════════════════════════════════════════════════════════
const HUDKPICard = ({ variant, isSkeleton = false, frozenCursorFrac }: KPICardProps) => {
  const [isCardHovered, setIsCardHovered] = useState(false);
  const [cursorFrac, setCursorFrac] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const isFrozen = frozenCursorFrac !== undefined;
  const activeFrac = isFrozen ? frozenCursorFrac! : cursorFrac;
  const showGlow   = isFrozen || cursorFrac !== null;
  const showCursor = isFrozen || cursorFrac !== null;
  const hover      = isFrozen || isCardHovered;

  const bg          = variant.bgColor ?? hex2rgba(variant.color, 0.08);
  const dividerColor = hex2rgba(variant.color, 0.22);
  const badgeBg      = hex2rgba(variant.color, 0.12);
  // Badge text: use deltaNum/deltaRef if set, else split deltaPct
  const deltaNum = variant.deltaNum ?? variant.deltaPct;
  const deltaRef = variant.deltaRef ?? "vs Yesterday";

  const handleSvgMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    setCursorFrac(Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width)));
  }, []);

  // ── Skeleton ──────────────────────────────────────────────────────────────
  if (isSkeleton) {
    return (
      <div className="w-full rounded-[4px] flex flex-col" style={{ border: `1px solid ${variant.color}`, background: bg }}>
        <div className="px-4 pt-4 pb-3 flex flex-col">
          <Sk className="h-3 w-24" />
          <div className="flex flex-col gap-1 mt-3">
            <Sk className="h-7 w-20" />
            <Sk className="h-3 w-32" />
          </div>
        </div>
        <div style={{ height: 1, margin: "0 16px", backgroundColor: dividerColor }} />
        <div className="px-4 py-3 flex items-center justify-between gap-3">
          <Sk className="h-[46px] w-[78px] rounded-[6px]" />
          <Sk className="h-[32px] w-[96px] rounded-[3px]" />
        </div>
      </div>
    );
  }

  // ── Sparkline geometry ────────────────────────────────────────────────────
  const pts   = buildSparkPath(variant.sparkData, HSW, HSH, HSP);
  const dPath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fillPath = `${dPath} L ${pts[pts.length - 1][0].toFixed(1)} ${HSH} L ${pts[0][0].toFixed(1)} ${HSH} Z`;
  const [lx, ly] = pts[pts.length - 1];

  const cxPx =
    activeFrac != null ? HSP + activeFrac * (HSW - HSP * 2) : null;
  const cyPx =
    activeFrac != null
      ? (() => {
          const mn = Math.min(...variant.sparkData),
            mx = Math.max(...variant.sparkData),
            rng = mx - mn || 1;
          return HSH - HSP - ((interp(variant.sparkData, activeFrac) - mn) / rng) * (HSH - HSP * 2);
        })()
      : null;
  const tipVal =
    activeFrac != null
      ? interp(variant.sparkData, activeFrac).toFixed(1) + (variant.value.includes("%") ? "%" : "")
      : null;

  return (
    <div
      className="w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200"
      style={{
        border: `1px solid ${variant.color}`,
        background: bg,
        boxShadow: hover
          ? `0 0 20px 4px ${hex2rgba(variant.color, 0.25)}, 0 4px 16px rgba(0,0,0,0.08)`
          : `0 0 8px 1px ${hex2rgba(variant.color, 0.12)}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onMouseEnter={() => setIsCardHovered(true)}
      onMouseLeave={() => {
        setIsCardHovered(false);
        setCursorFrac(null);
      }}
    >
      {/* ── Top Section ── */}
      <div className="px-4 pt-4 pb-3 flex flex-col">
        {/* Label — Inter Bold 11px, UPPERCASE */}
        <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>
          {variant.label}
        </span>
        {/* Value + sublabel — grouped, mt-3 gap from label */}
        <div className="flex flex-col gap-[5px] mt-3">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 24 }}>
            {variant.value}
          </div>
          <div className="text-[10px] font-normal text-[#64748b]">{variant.sublabel}</div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ height: 1, margin: "0 16px", backgroundColor: dividerColor }} />

      {/* ── Bottom Row: Badge-Stack (left) | Sparkline (right) ── */}
      <div className="px-4 py-3 flex items-center justify-between gap-3">

        {/* Badge Stack — 2-line tinted box */}
        <div className="flex flex-col px-[10px] py-[7px] rounded-[6px] flex-shrink-0" style={{ backgroundColor: badgeBg }}>
          {/* Line 1: delta number, Mono Bold 13px, severity color */}
          <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color: variant.color }}>
            {variant.dir === "up" ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
              : variant.dir === "down" ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />
              : <Minus className="w-3 h-3 flex-shrink-0" />}
            {deltaNum}
          </div>
          {/* Line 2: reference text, Inter Regular 9px, muted */}
          <div className="text-[9px] font-normal mt-[4px] leading-none text-[#94a3b8]">{deltaRef}</div>
        </div>

        {/* Sparkline — severity color, glow on hover */}
        <div className="relative flex-shrink-0">
          {showCursor && tipVal && cxPx != null && (
            <div className="absolute z-10 pointer-events-none -translate-x-1/2" style={{ left: cxPx, top: -26 }}>
              <div className="text-white font-mono text-[9px] font-semibold px-2 py-[3px] rounded-[3px] whitespace-nowrap shadow-lg" style={{ backgroundColor: variant.color }}>
                {tipVal}
              </div>
              <div className="w-0 h-0 mx-auto border-x-[3px] border-x-transparent border-t-[3px]" style={{ borderTopColor: variant.color }} />
            </div>
          )}

            {/* SVG — glow activates on sparkline hover (or frozen) */}
            <svg
              ref={svgRef}
              width={HSW}
              height={HSH}
              viewBox={`0 0 ${HSW} ${HSH}`}
              fill="none"
              className="cursor-crosshair transition-all duration-150"
              style={
                showGlow
                  ? {
                      filter: `drop-shadow(0 0 4px ${variant.color}) drop-shadow(0 0 8px ${hex2rgba(variant.color, 0.5)})`,
                    }
                  : {}
              }
              onMouseMove={isFrozen ? undefined : handleSvgMove}
              onMouseLeave={isFrozen ? undefined : () => setCursorFrac(null)}
            >
              {/* Area fill — 12% severity color */}
              <path d={fillPath} fill={variant.color} opacity="0.12" />
              {/* Line — 1.5px, severity color */}
              <path
                d={dPath}
                stroke={variant.color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              {/* Last-point live pulse */}
              <circle cx={lx} cy={ly} r="2" fill={variant.color} opacity="0.3">
                <animate attributeName="r" values="2;5;2" dur="2.5s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
              </circle>
              <circle cx={lx} cy={ly} r="1.8" fill={variant.color} />
              {/* Scanning cursor */}
              {showCursor && cxPx != null && cyPx != null && (
                <>
                  <line
                    x1={cxPx} y1={HSP - 1} x2={cxPx} y2={HSH - HSP + 1}
                    stroke={hex2rgba(variant.color, 0.65)}
                    strokeWidth="1"
                    strokeDasharray="2 2"
                  />
                  <circle
                    cx={cxPx}
                    cy={cyPx}
                    r="3"
                    fill={variant.color}
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="1.5"
                  />
                </>
              )}
            </svg>
          </div>
        </div>
    </div>
  );
};


// ══════════════════════════════════════════════════════════════════════════════
//  V1.0 TAB CONTENT
// ══════════════════════════════════════════════════════════════════════════════
const V1Content = () => {
  const TYPO_ROWS = [
    { field: "Category/Label",  style: "12px Inter",  weight: "Medium (500)",   token: "--neutral-500",  tokenBg: "bg-neutral-700", extra: "",                        preview: "COMPLIANCE RATE",   cls: "text-[12px] font-medium text-[#64748b] uppercase tracking-[0.4px]" },
    { field: "Main Value",      style: "24px Inter",  weight: "Bold (700)",     token: "--neutral-900",  tokenBg: "bg-neutral-700", extra: "(Tabular Numerals)",       preview: "94.3%",             cls: "text-[24px] font-bold text-[#0f172a] tabular-nums leading-none" },
    { field: "Trend Delta",     style: "12px Inter",  weight: "Semibold (600)", token: "Severity Color", tokenBg: "bg-emerald-800",  extra: "(Red / Green / Orange)",  preview: "+2.1%",             cls: "text-[12px] font-semibold text-[#00A63E]" },
    { field: "Context/Sub-text",style: "10px Inter",  weight: "Regular (400)",  token: "--neutral-400",  tokenBg: "bg-neutral-700", extra: "",                        preview: "Updated 1 min ago", cls: "text-[10px] font-normal text-[#94a3b8]" },
  ];

  return (
    <div className="space-y-12">

      {/* §1 KPI Card Variants */}
      <section>
        <SectionHeader icon={Layers} title="KPI Card Variants — Severity States" description="3px top-border + soft outer glow. Hover any card to interact with the sparkline." />
        <ShowcaseCanvas>
          {SEVERITY_CARDS.map((v) => (
            <div key={v.id} className="flex flex-col items-center gap-2">
              <KPICard variant={v} />
              <Badge label={v.name} color={v.color} />
            </div>
          ))}
        </ShowcaseCanvas>
        <div className="mt-4 flex flex-wrap gap-3">
          {[["Width","280px fixed"],["Border-Radius","4px"],["Top Border","3px solid severity"],["Background","bg-white/90 + blur"],["Resting Glow","8px @ 14% opacity"],["Hover Glow","18px @ 28% opacity"]].map(([l, v]) => (
            <SpecChip key={l} label={l} value={v} />
          ))}
        </div>
      </section>

      {/* §2 Interactive States */}
      <section>
        <SectionHeader icon={Eye} title="Interactive States" description="Hover triggers cursor line + tooltip. Skeleton uses pulse loaders. Resting is the default." />
        <div className="flex flex-wrap gap-8 items-start">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Hover State</span>
              <span className="text-[10px] text-[#94a3b8]">— cursor at 68%</span>
            </div>
            <KPICard variant={SEVERITY_CARDS[2]} frozenCursorFrac={0.68} />
            <div className="flex flex-col gap-1">
              <Annotation>Glow: <span className="font-mono text-[#334155] ml-1">18px @ 28% opacity</span></Annotation>
              <Annotation>Cursor: <span className="font-mono text-[#334155] ml-1">1px dashed neutral-400/55</span></Annotation>
              <Annotation>Tooltip: <span className="font-mono text-[#334155] ml-1">bg-neutral-900, 10px semibold</span></Annotation>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Skeleton State</span>
              <span className="text-[10px] text-[#94a3b8]">— data loading</span>
            </div>
            <KPICard variant={SEVERITY_CARDS[0]} isSkeleton />
            <div className="flex flex-col gap-1">
              <Annotation><span className="font-mono text-[#334155]">animate-pulse</span> on all elements</Annotation>
              <Annotation>Fill: <span className="font-mono text-[#334155] ml-1">bg-neutral-200/80</span></Annotation>
              <Annotation>No layout shifts — dimensions preserved</Annotation>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Resting State</span>
              <span className="text-[10px] text-[#94a3b8]">— no interaction</span>
            </div>
            <KPICard variant={SEVERITY_CARDS[5]} />
            <div className="flex flex-col gap-1">
              <Annotation>Glow: <span className="font-mono text-[#334155] ml-1">8px @ 14% opacity</span></Annotation>
              <Annotation>Border-top: <span className="font-mono text-[#334155] ml-1">3px solid {SEVERITY_CARDS[5].color}</span></Annotation>
              <Annotation>Transition: <span className="font-mono text-[#334155] ml-1">all 200ms ease</span></Annotation>
            </div>
          </div>
        </div>
      </section>

      {/* §3 Card Architecture & Typography */}
      <section>
        <SectionHeader icon={BookOpen} title="Card Architecture & Typography" description="Following the Precision and Clarity pillars — field-level type specification." />
        <div className="rounded-[6px] border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          <DarkTableHeader cols="grid-cols-[200px_160px_160px_1fr_140px]" labels={["Field","Text Style","Weight","Color Token","Live Preview"]} />
          {TYPO_ROWS.map((row, idx) => (
            <div key={row.field} className={cn("grid grid-cols-[200px_160px_160px_1fr_140px] px-5 py-4 items-center border-b border-[#F1F5F9]", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50")}>
              <div className="text-[12px] font-bold text-[#0f172a]">{row.field}</div>
              <div className="text-[12px] text-[#475569]">{row.style}</div>
              <div className="text-[12px] text-[#475569]">{row.weight}</div>
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-mono text-white", row.tokenBg)}>{row.token}</span>
                {row.extra && <span className="text-[10px] text-[#94a3b8]">{row.extra}</span>}
              </div>
              <div className={row.cls}>{row.preview}</div>
            </div>
          ))}
        </div>
      </section>

      {/* §4 Severity Color Tokens */}
      <section>
        <SectionHeader icon={Cpu} title="Severity Color Tokens" description="Top-border and glow source colors. Each token governs border, glow, delta text, and trend icon." />
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
          {SEVERITY_CARDS.map((v) => (
            <div key={v.id} className="rounded-[6px] border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
              <div className="h-[56px] relative" style={{ backgroundColor: v.color }}>
                <div className="absolute inset-0" style={{ background: `radial-gradient(circle at 30% 40%, ${v.color}00, rgba(0,0,0,0.18))` }} />
                <div className="absolute bottom-2 left-3 text-[10px] font-bold text-white/90 uppercase tracking-[0.5px]">{v.name}</div>
              </div>
              <div className="px-3 py-2.5 space-y-1.5">
                <div className="font-mono text-[11px] font-semibold text-[#334155]">{v.color}</div>
                <div className="flex gap-1.5">
                  <div className="flex-1 h-4 rounded-[2px] bg-neutral-100" style={{ borderTop: `3px solid ${v.color}` }} />
                  <div className="flex-1 h-4 rounded-[2px] bg-white border border-[#E2E8F0]" style={{ boxShadow: `0 0 8px 2px ${v.color}30` }} />
                </div>
                <div className="text-[9px] text-[#94a3b8] uppercase tracking-[0.4px]">Top Border · Glow</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* §5 Border & Shadow System */}
      <section>
        <SectionHeader icon={Layers} title="Border & Shadow System" description="Standard, resting-glow, and hover-glow shadow definitions for the v1.0 card." />
        <div className="rounded-[6px] border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          <DarkTableHeader cols="grid-cols-[180px_1fr_180px]" labels={["State","CSS Value","Preview"]} />
          {[
            { state: "Standard",     css: "border-top: 3px solid {color} · border: 1px solid #E2E8F0",    preview: <div className="w-20 h-7 rounded-[4px] bg-white" style={{ border: "1px solid #E2E8F0", borderTop: "3px solid #00A63E" }} /> },
            { state: "Resting Glow", css: "0 0 8px 1px {color}14, 0 1px 4px rgba(0,0,0,.05)",            preview: <div className="w-20 h-7 rounded-[4px] bg-white" style={{ border: "1px solid #E2E8F0", borderTop: "3px solid #00A63E", boxShadow: "0 0 8px 1px #00A63E22, 0 1px 4px rgba(0,0,0,.05)" }} /> },
            { state: "Hover Glow",   css: "0 0 18px 4px {color}28, 0 4px 20px rgba(0,0,0,.09)",          preview: <div className="w-20 h-7 rounded-[4px] bg-white" style={{ border: "1px solid #E2E8F0", borderTop: "3px solid #00A63E", boxShadow: "0 0 18px 4px #00A63E40, 0 4px 20px rgba(0,0,0,.09)" }} /> },
          ].map((row, idx) => (
            <div key={row.state} className={cn("grid grid-cols-[180px_1fr_180px] px-5 py-4 items-center border-b border-[#F1F5F9]", idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50")}>
              <div className="text-[12px] font-bold text-[#0f172a]">{row.state}</div>
              <div className="font-mono text-[11px] text-[#64748b] pr-4">{row.css}</div>
              <div>{row.preview}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};


// ══════════════════════════════════════════════════════════════════════════════
//  V1.1 TAB CONTENT  ·  HIGH-TECH HUD
// ══════════════════════════════════════════════════════════════════════════════
const V1_1Content = () => {
  const TYPO_ROWS_11 = [
    { field: "Label",        changed: false, style: "12px Inter",          weight: "Medium (500)",  token: "--neutral-600",  tokenBg: "bg-neutral-700", extra: "",                          preview: "Safety Compliance",    cls: "text-[12px] font-medium text-[#475569]" },
    { field: "Main Value",   changed: true,  style: "24px JetBrains Mono", weight: "Bold (700)",    token: "--neutral-900",  tokenBg: "bg-neutral-700", extra: "(Tabular Numerals)",         preview: "99.1%",                cls: "font-mono font-bold text-[20px] text-[#0f172a] tabular-nums leading-none" },
    { field: "Subtitle",     changed: true,  style: "10px Inter",          weight: "Regular (400)", token: "--neutral-500",  tokenBg: "bg-neutral-700", extra: "(Scope / Formula — no time)", preview: "Scope: All Sites",    cls: "text-[10px] font-normal text-[#64748b]" },
    { field: "Trend Badge",  changed: true,  style: "10px JetBrains Mono", weight: "Semibold (600)",token: "Bright Severity",tokenBg: "bg-emerald-800",  extra: "(Solid capsule, white text)",preview: "+0.4%",               cls: "font-mono text-[10px] font-semibold text-white bg-[#00A63E] px-2 py-0.5 rounded-full inline-block" },
  ];

  return (
    <div className="space-y-12">

      {/* Change summary banner */}
      <div
        className="rounded-[6px] px-5 py-4 relative overflow-hidden"
        style={{ background: "linear-gradient(135deg, #021D18 0%, #032E24 60%, #043D2E 100%)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative flex items-start justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Zap className="w-3.5 h-3.5 text-[#00775B]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#00775B]">
                v1.1 · High-Tech HUD Upgrades
              </span>
            </div>
            <p className="text-[12px] text-white/70 max-w-2xl">
              Solid hex tinted surfaces eliminate opacity artifacts · JetBrains Mono 24px for all data values · solid capsule badge with bright severity color · sparkline uses per-card severity color with glow filter.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {["Solid Tints", "Mono Values", "Solid Badge", "Severity Sparkline"].map((p) => (
              <span
                key={p}
                className="px-2.5 py-1 rounded-[4px] text-[10px] font-medium text-white/60 border border-white/10"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                {p}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* §1 Display Matrix — 4 Severity Cards */}
      <section>
        <SectionHeader
          icon={Layers}
          title="Display Matrix — 4 Severity Levels"
          description="Solid hex surfaces · 1px bright border · Mono 24px value · severity-colored sparkline. Critical card shown in Interactive State."
        />
        <HUDCanvas>
          {HUD_CARDS.map((v, i) => (
            <div key={v.id} className="flex flex-col gap-2">
              <HUDKPICard
                variant={v}
                /* Critical card (index 0) is frozen in interactive state to demonstrate hover behaviour */
                frozenCursorFrac={i === 0 ? 0.62 : undefined}
              />
              <div className="flex items-center gap-1.5">
                <Badge label={v.name} color={v.color} />
                {i === 0 && (
                  <span className="text-[9px] font-medium text-[#64748b] font-mono">
                    ↑ interactive state
                  </span>
                )}
              </div>
            </div>
          ))}
        </HUDCanvas>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            ["Background", "Solid hex (no opacity)"],
            ["Border",     "1px solid bright color"],
            ["Radius",     "4px"],
            ["Value font", "JetBrains Mono Bold 24px"],
            ["Badge",      "Solid capsule · bright color"],
            ["Sparkline",  "96×32 · severity color"],
          ].map(([l, v]) => (
            <SpecChip key={l} label={l} value={v} />
          ))}
        </div>
      </section>

      {/* §2 Interactive States */}
      <section>
        <SectionHeader
          icon={Eye}
          title="Interactive States"
          description="Hover the sparkline SVG to activate glow filter + scanning cursor. Tooltip uses the severity color. Skeleton preserves solid tinted layout."
        />
        <div className="flex flex-wrap gap-8 items-start">

          {/* Hover */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#E7000B] inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Hover State</span>
              <span className="text-[10px] text-[#94a3b8]">— cursor at 62%, glow active</span>
            </div>
            <div className="w-[260px]">
              <HUDKPICard variant={HUD_CARDS[0]} frozenCursorFrac={0.62} />
            </div>
            <div className="flex flex-col gap-1">
              <Annotation>Sparkline glow: <span className="font-mono text-[#334155] ml-1">drop-shadow severity color</span></Annotation>
              <Annotation>Cursor: <span className="font-mono text-[#334155] ml-1">1px dashed severity/65, dot at intersection</span></Annotation>
              <Annotation>Tooltip: <span className="font-mono text-[#334155] ml-1">solid severity bg, Mono 9px white</span></Annotation>
            </div>
          </div>

          {/* Skeleton */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Skeleton State</span>
              <span className="text-[10px] text-[#94a3b8]">— data loading</span>
            </div>
            <div className="w-[260px]">
              <HUDKPICard variant={HUD_CARDS[2]} isSkeleton />
            </div>
            <div className="flex flex-col gap-1">
              <Annotation>Solid tinted bg preserved during load</Annotation>
              <Annotation>Divider line maintained for layout continuity</Annotation>
              <Annotation>Badge + sparkline replaced by shimmer slots</Annotation>
            </div>
          </div>

          {/* Resting */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-neutral-300 inline-block" />
              <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Resting State</span>
              <span className="text-[10px] text-[#94a3b8]">— no interaction</span>
            </div>
            <div className="w-[260px]">
              <HUDKPICard variant={HUD_CARDS[3]} />
            </div>
            <div className="flex flex-col gap-1">
              <Annotation>Glow: <span className="font-mono text-[#334155] ml-1">8px @ 12% severity</span></Annotation>
              <Annotation>Border: <span className="font-mono text-[#334155] ml-1">1px solid {HUD_CARDS[3].color}</span></Annotation>
              <Annotation>Sparkline: <span className="font-mono text-[#334155] ml-1">1.5px, no glow until hover</span></Annotation>
            </div>
          </div>
        </div>
      </section>

      {/* §3 Card Architecture & Typography */}
      <section>
        <SectionHeader
          icon={BookOpen}
          title="Card Architecture & Typography"
          description="JetBrains Mono for numerical values and trend badge. Inter for labels and subtitles."
        />
        <div className="rounded-[6px] border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          <DarkTableHeader
            cols="grid-cols-[180px_180px_160px_1fr_180px]"
            labels={["Field", "Text Style", "Weight", "Color Token", "Live Preview"]}
          />
          {TYPO_ROWS_11.map((row, idx) => (
            <div
              key={row.field}
              className={cn(
                "grid grid-cols-[180px_180px_160px_1fr_180px] px-5 py-4 items-center border-b border-[#F1F5F9]",
                idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-[12px] font-bold text-[#0f172a]">{row.field}</span>
                {row.changed && (
                  <span className="text-[8px] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-[3px] bg-[#00775B] text-white">
                    v1.1
                  </span>
                )}
              </div>
              <div className="text-[12px] text-[#475569]">{row.style}</div>
              <div className="text-[12px] text-[#475569]">{row.weight}</div>
              <div className="flex items-center gap-2">
                <span className={cn("inline-flex items-center px-2 py-0.5 rounded-[3px] text-[10px] font-mono text-white", row.tokenBg)}>
                  {row.token}
                </span>
                {row.extra && <span className="text-[10px] text-[#94a3b8]">{row.extra}</span>}
              </div>
              <div className={row.cls}>{row.preview}</div>
            </div>
          ))}
        </div>
      </section>

      {/* §4 Severity Color Tokens */}
      <section>
        <SectionHeader
          icon={Cpu}
          title="Severity Color Tokens"
          description="Solid tint system: solid light hex for card bg · bright color for border, badge, and sparkline."
        />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {HUD_CARDS.map((v) => (
            <div key={v.id} className="rounded-[6px] border overflow-hidden shadow-sm" style={{ borderColor: v.color }}>
              {/* Swatch: light bg → bright color */}
              <div className="flex h-[52px]">
                <div
                  className="flex-1 flex items-end pb-1.5 pl-2"
                  style={{ backgroundColor: v.bgColor }}
                >
                  <span className="text-[8px] font-bold uppercase tracking-[0.4px]" style={{ color: v.color }}>
                    Bg
                  </span>
                </div>
                <div className="flex-1 flex items-end pb-1.5 pl-1" style={{ backgroundColor: v.color }}>
                  <span className="text-[8px] font-bold uppercase tracking-[0.4px] text-white/85">
                    Bright
                  </span>
                </div>
              </div>
              <div className="px-3 py-2.5 space-y-1.5 bg-white">
                <div className="font-mono text-[10px] font-semibold text-[#334155]">{v.bgColor}</div>
                <div className="font-mono text-[10px] font-semibold" style={{ color: v.color }}>{v.color}</div>
                <div className="text-[9px] text-[#94a3b8] uppercase tracking-[0.35px]">{v.name} · Background · Bright</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* §5 Border & Shadow System */}
      <section>
        <SectionHeader
          icon={Layers}
          title="Border & Shadow System"
          description="Full-perimeter 1px bright border on solid tinted surface. Glow and sparkline filter definitions."
        />
        <div className="rounded-[6px] border border-[#E2E8F0] bg-white overflow-hidden shadow-sm">
          <DarkTableHeader cols="grid-cols-[200px_1fr_180px]" labels={["State", "CSS Value", "Preview"]} />
          {[
            {
              state: "Surface (Tinted)",
              css: "background: #E5FFEF · border: 1px solid #00A63E · border-radius: 4px",
              preview: (
                <div className="w-20 h-7 rounded-[4px]" style={{ background: "#E5FFEF", border: "1px solid #00A63E" }} />
              ),
            },
            {
              state: "Resting Glow",
              css: "0 0 8px 1px rgba(0,166,62,.12), 0 1px 3px rgba(0,0,0,.04)",
              preview: (
                <div className="w-20 h-7 rounded-[4px]" style={{ background: "#E5FFEF", border: "1px solid #00A63E", boxShadow: "0 0 8px 1px rgba(0,166,62,.12), 0 1px 3px rgba(0,0,0,.04)" }} />
              ),
            },
            {
              state: "Hover Glow",
              css: "0 0 20px 4px rgba(0,166,62,.25), 0 4px 16px rgba(0,0,0,.08)",
              preview: (
                <div className="w-20 h-7 rounded-[4px]" style={{ background: "#E5FFEF", border: "1px solid #00A63E", boxShadow: "0 0 20px 4px rgba(0,166,62,.25), 0 4px 16px rgba(0,0,0,.08)" }} />
              ),
            },
            {
              state: "Sparkline Glow",
              css: "filter: drop-shadow(0 0 4px {color}) drop-shadow(0 0 8px {color}/50)",
              preview: (
                <svg width={80} height={28} viewBox="0 0 80 28" fill="none" style={{ filter: "drop-shadow(0 0 4px #00A63E) drop-shadow(0 0 8px rgba(0,166,62,0.5))" }}>
                  <path d="M3 22 L18 14 L33 17 L48 8 L63 11 L77 5" stroke="#00A63E" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ),
            },
          ].map((row, idx) => (
            <div
              key={row.state}
              className={cn(
                "grid grid-cols-[200px_1fr_180px] px-5 py-4 items-center border-b border-[#F1F5F9]",
                idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
              )}
            >
              <div className="text-[12px] font-bold text-[#0f172a]">{row.state}</div>
              <div className="font-mono text-[11px] text-[#64748b] pr-4">{row.css}</div>
              <div>{row.preview}</div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};


// ══════════════════════════════════════════════════════════════════════════════
//  V1.2  ·  PLATFORM CARD CATALOGUE
//  All platform card types restyled in the v1.1 HUD aesthetic.
//  Layout: horizontal rectangle, solid hex bg, 1px bright border, 4px radius.
// ══════════════════════════════════════════════════════════════════════════════

// ─── Shared V12 shell + atoms ─────────────────────────────────────────────────

/** Shared card wrapper — handles hover glow */
const V12Card = ({
  color, bgColor, children, className,
}: { color: string; bgColor: string; children: React.ReactNode; className?: string }) => {
  const [h, setH] = useState(false);
  return (
    <div
      className={cn("w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200", className)}
      style={{
        border: `1px solid ${color}`, background: bgColor,
        boxShadow: h
          ? `0 0 18px 4px ${hex2rgba(color, 0.22)}, 0 4px 14px rgba(0,0,0,0.07)`
          : `0 0 6px 1px ${hex2rgba(color, 0.10)}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onMouseEnter={() => setH(true)} onMouseLeave={() => setH(false)}
    >{children}</div>
  );
};

const V12Divider = ({ color }: { color: string }) => (
  <div style={{ height: 1, backgroundColor: hex2rgba(color, 0.22), margin: "0 16px" }} />
);

const V12Label = ({ label, chip, color }: { label: string; chip?: string; color: string }) => (
  <div className="px-4 pt-4 flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>{label}</span>
    {chip && (
      <span className="text-[8px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0"
        style={{ backgroundColor: hex2rgba(color, 0.14), color }}>
        {chip}
      </span>
    )}
  </div>
);

/** 2-line badge-stack — reusable across all V12 cards */
interface BSProps { dir: SeverityDir; num: string; ref_: string; color: string }
const BS = ({ dir, num, ref_, color }: BSProps) => (
  <div className="flex flex-col px-[10px] py-[7px] rounded-[6px] flex-shrink-0" style={{ backgroundColor: hex2rgba(color, 0.12) }}>
    <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color }}>
      {dir === "up" ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
        : dir === "down" ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />
        : <Minus className="w-3 h-3 flex-shrink-0" />}
      {num}
    </div>
    <div className="text-[9px] font-normal mt-[4px] leading-none text-[#94a3b8]">{ref_}</div>
  </div>
);

// ─── Type A: Stat Card (no sparkline) ─────────────────────────────────────────
interface StatData {
  label: string; value: string; sublabel: string;
  num: string; ref_: string; dir: SeverityDir;
  definition: string; chip: string;
  color: string; bgColor: string;
}
const STAT_CARDS: StatData[] = [
  { label: "Violations",       value: "02",    sublabel: "Assembly Line · Active", num: "-1%",   ref_: "vs Last Week",  dir: "down",    definition: "Security breaches detected", chip: "REAL-TIME", color: "#E7000B", bgColor: "#FFE5E7" },
  { label: "Active Cameras",   value: "142",   sublabel: "All Sites · Live Feed",  num: "0",     ref_: "No Change",     dir: "neutral", definition: "Cameras currently streaming",  chip: "LIVE",      color: "#2B7FFF", bgColor: "#E5F0FF" },
  { label: "Mean Time to Ack", value: "15.2m", sublabel: "Rolling 24h Average",   num: "-3.4%", ref_: "vs Yesterday",  dir: "down",    definition: "Alert to acknowledgement time", chip: "DAILY",    color: "#64748B", bgColor: "#F0F2F4" },
];

const V12StatCard = ({ d, isSkeleton = false }: { d: StatData; isSkeleton?: boolean }) => {
  if (isSkeleton) return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      <div className="px-4 pt-4 pb-3 flex items-center justify-between"><Sk className="h-3 w-24" /><Sk className="h-4 w-16 rounded-full" /></div>
      <div className="px-4 pb-3 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1"><Sk className="h-8 w-16 mt-1" /><Sk className="h-3 w-28" /></div>
        <Sk className="h-[46px] w-[78px] rounded-[6px]" />
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-2.5 flex gap-2"><Sk className="h-3 w-20" /><Sk className="h-3 w-40" /></div>
    </V12Card>
  );
  return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      <V12Label label={d.label} chip={d.chip} color={d.color} />
      <div className="px-4 pt-3 pb-3 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-[5px]">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{d.value}</div>
          <div className="text-[10px] text-[#64748b]">{d.sublabel}</div>
        </div>
        <BS dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-2.5 flex items-center gap-2">
        <span className="text-[9px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] flex-shrink-0">Definition</span>
        <span className="text-[10px] text-[#475569]">{d.definition}</span>
      </div>
    </V12Card>
  );
};

// ─── Type B: Alert Card (critical zone + cautionary list) ─────────────────────
interface AlertData {
  label: string; color: string; bgColor: string;
  // critical
  zoneName?: string; description?: string; compliance?: string;
  alertInfo?: string; cameraId?: string;
  // cautionary
  zones?: Array<{ name: string; compliance: string; num: string; ref_: string; dir: SeverityDir }>;
  footerNote?: string;
}
const ALERT_CARDS: AlertData[] = [
  {
    label: "Critical Zone Alert", color: "#E7000B", bgColor: "#FFE5E7",
    zoneName: "Loading Dock", description: "Mainly PPE violations during morning shift change",
    compliance: "68%", alertInfo: "23 VIOLATIONS TODAY", cameraId: "CAM-LD-012",
  },
  {
    label: "Cautionary Alerts", color: "#EA580C", bgColor: "#FEEFE7",
    zones: [
      { name: "Assembly Line 2", compliance: "84% compliance", num: "-5%", ref_: "this week", dir: "down" },
      { name: "Warehouse B",     compliance: "86% compliance", num: "-3%", ref_: "this week", dir: "down" },
    ],
    footerNote: "2 zones approaching threshold",
  },
];

const V12AlertCard = ({ d }: { d: AlertData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <div className="px-4 pt-3 pb-0">
      <span className="text-[10px] font-bold uppercase tracking-[0.6px]" style={{ color: d.color }}>{d.label}</span>
    </div>
    {d.zoneName ? (
      /* Critical variant */
      <>
        <div className="px-4 pt-3 pb-3 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1.5 min-w-0">
            <div className="font-mono font-bold text-[#0f172a] leading-tight" style={{ fontSize: 20 }}>{d.zoneName}</div>
            <div className="text-[10px] text-[#64748b]">{d.description}</div>
          </div>
          <div className="flex flex-col items-center px-4 py-2.5 rounded-[6px] flex-shrink-0 bg-white/70">
            <span className="font-mono font-bold text-[20px] leading-none" style={{ color: d.color }}>{d.compliance}</span>
            <span className="text-[8px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] mt-1">Compliance</span>
          </div>
        </div>
        <V12Divider color={d.color} />
        <div className="px-4 py-2.5 flex items-center gap-1.5">
          <span style={{ color: d.color }} className="text-[10px]">⚠</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.4px]" style={{ color: d.color }}>{d.alertInfo}</span>
          <span className="text-[10px] text-[#94a3b8] mx-1">·</span>
          <span className="text-[10px] font-mono text-[#64748b]">{d.cameraId}</span>
        </div>
      </>
    ) : (
      /* Cautionary variant */
      <>
        <div className="px-4 pt-2 pb-1 flex flex-col gap-2">
          {d.zones?.map((z) => (
            <div key={z.name} className="flex items-center justify-between py-2 px-3 rounded-[4px]" style={{ backgroundColor: hex2rgba(d.color, 0.08) }}>
              <div>
                <div className="text-[11px] font-bold text-[#0f172a]">{z.name}</div>
                <div className="text-[9px] text-[#64748b] mt-0.5">{z.compliance}</div>
              </div>
              <BS dir={z.dir} num={z.num} ref_={z.ref_} color={d.color} />
            </div>
          ))}
        </div>
        <V12Divider color={d.color} />
        <div className="px-4 py-2.5 flex items-center gap-1.5">
          <span style={{ color: d.color }} className="text-[10px]">⚡</span>
          <span className="text-[9px] font-bold uppercase tracking-[0.4px]" style={{ color: d.color }}>{d.footerNote}</span>
        </div>
      </>
    )}
  </V12Card>
);

// ─── Type C: Zone Performance Card (compliance + progress bar) ─────────────────
interface ZoneData {
  zoneName: string; subLabel: string;
  compliance: number;
  num: string; ref_: string; dir: SeverityDir;
  cameras: number;
  color: string; bgColor: string;
}
const ZONE_CARDS: ZoneData[] = [
  { zoneName: "Loading Dock",   subLabel: "Warehouse A",    compliance: 68, num: "-8%",  ref_: "vs yesterday", dir: "down",    cameras: 4, color: "#E7000B", bgColor: "#FFE5E7" },
  { zoneName: "Assembly B",     subLabel: "Production Floor",compliance: 84, num: "-5%",  ref_: "vs yesterday", dir: "down",    cameras: 6, color: "#EA580C", bgColor: "#FEEFE7" },
  { zoneName: "Warehouse C",    subLabel: "Storage Zone",   compliance: 91, num: "+1%",  ref_: "vs yesterday", dir: "up",      cameras: 3, color: "#00A63E", bgColor: "#E5FFEF" },
  { zoneName: "Office Lobby",   subLabel: "Entrance Zone",  compliance: 97, num: "+0.4%",ref_: "vs yesterday", dir: "up",      cameras: 2, color: "#2B7FFF", bgColor: "#E5F0FF" },
];

const V12ZoneCard = ({ d, isSkeleton = false }: { d: ZoneData; isSkeleton?: boolean }) => {
  if (isSkeleton) return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      <div className="px-4 pt-4 pb-3 flex items-center justify-between">
        <div className="flex flex-col gap-1"><Sk className="h-3.5 w-28" /><Sk className="h-3 w-20 mt-1" /></div>
        <Sk className="h-[46px] w-[78px] rounded-[6px]" />
      </div>
      <div className="px-4 pb-3"><Sk className="h-2 w-full rounded-full" /></div>
      <V12Divider color={d.color} />
      <div className="px-4 py-2.5 flex gap-3"><Sk className="h-3 w-20" /><Sk className="h-3 w-24" /></div>
    </V12Card>
  );
  return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      <div className="px-4 pt-4 pb-3 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-[5px] min-w-0">
          <div className="text-[13px] font-bold text-[#0f172a] leading-none">{d.zoneName}</div>
          <div className="text-[10px] text-[#64748b]">{d.subLabel}</div>
        </div>
        <BS dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
      </div>
      {/* Progress bar */}
      <div className="px-4 pb-3">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#94a3b8]">Compliance</span>
          <span className="font-mono font-bold text-[11px]" style={{ color: d.color }}>{d.compliance}%</span>
        </div>
        <div className="h-[5px] rounded-full bg-white/60 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.compliance}%`, backgroundColor: d.color }} />
        </div>
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-2.5 flex items-center gap-3 text-[9px] text-[#94a3b8] font-medium">
        <span>🎥 {d.cameras} cameras</span>
        <span className="w-px h-3 bg-neutral-200" />
        <span className="font-mono" style={{ color: d.compliance < 80 ? d.color : "#64748b" }}>{d.compliance}% compliant</span>
      </div>
    </V12Card>
  );
};

// ─── Type D: Capacity Card (occupancy gauge + bar) ─────────────────────────────
interface CapData {
  zoneName: string; current: number; max: number; occupancy: number;
  statusLabel: string; color: string; bgColor: string;
}
const CAP_CARDS: CapData[] = [
  { zoneName: "Loading Dock",   current: 56, max: 60, occupancy: 93, statusLabel: "CRITICAL", color: "#E7000B", bgColor: "#FFE5E7" },
  { zoneName: "Assembly Line A",current: 47, max: 60, occupancy: 78, statusLabel: "WARNING",  color: "#EA580C", bgColor: "#FEEFE7" },
  { zoneName: "Cafeteria",      current: 36, max: 80, occupancy: 45, statusLabel: "NORMAL",   color: "#00A63E", bgColor: "#E5FFEF" },
];

const V12CapacityCard = ({ d }: { d: CapData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    <div className="px-4 pt-4 pb-0 flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#475569]">Zone Capacity</span>
      <span className="text-[8px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full"
        style={{ backgroundColor: hex2rgba(d.color, 0.14), color: d.color }}>{d.statusLabel}</span>
    </div>
    <div className="px-4 pt-3 pb-2 flex items-end justify-between gap-4">
      <div className="flex flex-col gap-[5px]">
        <div className="text-[13px] font-bold text-[#0f172a]">{d.zoneName}</div>
        <div className="flex items-baseline gap-1">
          <span className="font-mono font-bold leading-none text-[#0f172a]" style={{ fontSize: 24 }}>{d.occupancy}%</span>
          <span className="text-[10px] text-[#64748b] font-mono">{d.current}/{d.max} people</span>
        </div>
      </div>
    </div>
    <div className="px-4 pb-3">
      <div className="h-[6px] rounded-full bg-white/60 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${d.occupancy}%`, backgroundColor: d.color }} />
      </div>
      <div className="flex justify-between mt-1">
        <span className="text-[8px] text-[#94a3b8] font-mono">0</span>
        <span className="text-[8px] font-mono" style={{ color: d.color }}>{d.occupancy}% capacity</span>
        <span className="text-[8px] text-[#94a3b8] font-mono">{d.max}</span>
      </div>
    </div>
  </V12Card>
);

// ─── Type E: Live Zone Card (intrusion / queue with sparkline) ─────────────────
interface LiveData {
  appType: string; zoneName: string; isActive: boolean;
  count: string; subtitle: string;
  lastEvent: string; cameraId: string;
  color: string; bgColor: string;
  sparkData: number[];
}
const LIVE_CARDS: LiveData[] = [
  { appType: "Intrusion", zoneName: "Assembly Line 2", isActive: true,  count: "3",      subtitle: "Unauthorized Targets", lastEvent: "2 mins ago",  cameraId: "CAM-AL-003", color: "#E7000B", bgColor: "#FFE5E7", sparkData: [0,0,1,0,0,2,1,1,3,2,3] },
  { appType: "Intrusion", zoneName: "Warehouse B",     isActive: false, count: "CLEAR",  subtitle: "Zone Secured",         lastEvent: "18 mins ago", cameraId: "CAM-WB-001", color: "#00A63E", bgColor: "#E5FFEF", sparkData: [2,1,1,0,0,0,0,0,0,0,0] },
  { appType: "Queue",     zoneName: "Main Entrance",   isActive: true,  count: "8m 20s", subtitle: "Avg Wait · 23 queued", lastEvent: "Just now",    cameraId: "CAM-ME-004", color: "#EA580C", bgColor: "#FEEFE7", sparkData: [3.2,4.1,5.5,6.2,7.0,7.8,8.3] },
];

const V12LiveCard = ({ d, frozenCursorFrac }: { d: LiveData; frozenCursorFrac?: number }) => {
  const [cursorFrac, setCursorFrac] = useState<number | null>(null);
  const [hovered, setHovered] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const isFrozen = frozenCursorFrac !== undefined;
  const activeFrac = isFrozen ? frozenCursorFrac! : cursorFrac;
  const showGlow = isFrozen || cursorFrac !== null;
  const showCursor = isFrozen || cursorFrac !== null;

  const handleSvgMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const r = svgRef.current.getBoundingClientRect();
    setCursorFrac(Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)));
  }, []);

  const W = 120, H = 32, P = 3;
  const pts = buildSparkPath(d.sparkData, W, H, P);
  const dPath = pts.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fill = `${dPath} L ${pts[pts.length-1][0].toFixed(1)} ${H} L ${pts[0][0].toFixed(1)} ${H} Z`;
  const [lx, ly] = pts[pts.length - 1];
  const cxPx = activeFrac != null ? P + activeFrac * (W - P * 2) : null;
  const cyPx = activeFrac != null ? (() => {
    const mn = Math.min(...d.sparkData), mx = Math.max(...d.sparkData), rng = mx - mn || 1;
    return H - P - ((interp(d.sparkData, activeFrac) - mn) / rng) * (H - P * 2);
  })() : null;
  const tipVal = activeFrac != null ? interp(d.sparkData, activeFrac).toFixed(1) : null;

  return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      {/* Header */}
      <div className="px-4 pt-3 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.isActive ? d.color : "#94a3b8" }} />
          <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#475569]">{d.appType}</span>
          <span className="text-[10px] text-[#94a3b8]">·</span>
          <span className="text-[11px] font-semibold text-[#334155]">{d.zoneName}</span>
        </div>
        <span className="text-[8px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full"
          style={{ backgroundColor: hex2rgba(d.color, 0.14), color: d.color }}>
          {d.isActive ? "Active" : "Clear"}
        </span>
      </div>
      {/* Main */}
      <div className="px-4 pt-3 pb-3 flex items-center justify-between gap-4"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="flex flex-col gap-[5px]">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: d.count === "CLEAR" ? 16 : 24 }}>
            {d.count}
          </div>
          <div className="text-[10px] text-[#64748b]">{d.subtitle}</div>
        </div>
        {/* Sparkline */}
        <div className="relative flex-shrink-0">
          {showCursor && tipVal && cxPx != null && (
            <div className="absolute z-10 pointer-events-none -translate-x-1/2" style={{ left: cxPx, top: -24 }}>
              <div className="text-white font-mono text-[9px] font-semibold px-2 py-[3px] rounded-[3px] whitespace-nowrap"
                style={{ backgroundColor: d.color }}>{tipVal}</div>
              <div className="w-0 h-0 mx-auto border-x-[3px] border-x-transparent border-t-[3px]" style={{ borderTopColor: d.color }} />
            </div>
          )}
          <svg ref={svgRef} width={W} height={H} viewBox={`0 0 ${W} ${H}`} fill="none"
            className="cursor-crosshair transition-all duration-150"
            style={showGlow ? { filter: `drop-shadow(0 0 4px ${d.color}) drop-shadow(0 0 7px ${hex2rgba(d.color, 0.45)})` } : {}}
            onMouseMove={isFrozen ? undefined : handleSvgMove}
            onMouseLeave={isFrozen ? undefined : () => setCursorFrac(null)}>
            <path d={fill} fill={d.color} opacity="0.10" />
            <path d={dPath} stroke={d.color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <circle cx={lx} cy={ly} r="2" fill={d.color} opacity="0.3">
              <animate attributeName="r" values="2;5;2" dur="2.5s" repeatCount="indefinite" />
              <animate attributeName="opacity" values="0.3;0;0.3" dur="2.5s" repeatCount="indefinite" />
            </circle>
            <circle cx={lx} cy={ly} r="1.8" fill={d.color} />
            {showCursor && cxPx != null && cyPx != null && (
              <>
                <line x1={cxPx} y1={P-1} x2={cxPx} y2={H-P+1} stroke={hex2rgba(d.color, 0.6)} strokeWidth="1" strokeDasharray="2 2" />
                <circle cx={cxPx} cy={cyPx} r="3" fill={d.color} stroke="rgba(255,255,255,0.9)" strokeWidth="1.5" />
              </>
            )}
          </svg>
        </div>
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-2.5 flex items-center gap-2 text-[9px] text-[#94a3b8]">
        <span>Last: {d.lastEvent}</span>
        <span>·</span>
        <span className="font-mono">{d.cameraId}</span>
      </div>
    </V12Card>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  V1.2 TAB CONTENT
// ══════════════════════════════════════════════════════════════════════════════
const V1_2Content = () => (
  <div className="space-y-12">

    {/* Change banner */}
    <div className="rounded-[6px] px-5 py-4 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #021D18 0%, #032E24 60%, #043D2E 100%)" }}>
      <div className="absolute inset-0 opacity-[0.035]"
        style={{ backgroundImage: "radial-gradient(circle, #fff 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
      <div className="relative flex items-start justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <Zap className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.7px] text-[#00775B]">v1.2 · Platform Card Catalogue</span>
          </div>
          <p className="text-[12px] text-white/70 max-w-2xl">
            All card types from Safety, Volume, Zone and Identity analytics restyled in the v1.1 HUD aesthetic.
            Consistent horizontal rectangle format · solid severity surfaces · unified badge-stack.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {["Stat Card","Alert Card","Zone Card","Capacity Card","Live Card"].map((p) => (
            <span key={p} className="px-2.5 py-1 rounded-[4px] text-[10px] font-medium text-white/60 border border-white/10"
              style={{ background: "rgba(255,255,255,0.06)" }}>{p}</span>
          ))}
        </div>
      </div>
    </div>

    {/* §1 Type A — Stat Card */}
    <section>
      <SectionHeader icon={Cpu} title="Type A · Stat Card" description="Simple KPI with no sparkline. Used for counts, durations, and status metrics. Includes a definition footer." />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {STAT_CARDS.map((d) => <V12StatCard key={d.label} d={d} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {[["Layout","Label + Value | Badge-Stack"],["Footer","Definition row"],["Chip","Status label (Real-Time, Live, Daily)"],["Skeleton","Yes — all states"],].map(([l,v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>
    </section>

    {/* §2 Type B — Spark Card */}
    <section>
      <SectionHeader icon={Layers} title="Type B · Spark Card" description="Standard KPI with severity-colored sparkline. Badge-Stack left, sparkline right. Hover sparkline for glow + scanning cursor." />
      <HUDCanvas>
        {HUD_CARDS.map((v, i) => (
          <div key={v.id} className="flex flex-col gap-2">
            <HUDKPICard variant={v} frozenCursorFrac={i === 0 ? 0.62 : undefined} />
            <div className="flex items-center gap-1.5">
              <Badge label={v.name} color={v.color} />
              {i === 0 && <span className="text-[9px] font-mono text-[#64748b]">↑ interactive</span>}
            </div>
          </div>
        ))}
      </HUDCanvas>
    </section>

    {/* §3 Type C — Alert Card */}
    <section>
      <SectionHeader icon={Eye} title="Type C · Alert Card" description="Zone-level severity alerts. Critical variant shows zone name + compliance badge. Cautionary variant shows ranked zone list." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ALERT_CARDS.map((d) => <V12AlertCard key={d.label} d={d} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {[["Critical","Zone name · compliance badge · alert count"],["Cautionary","Zone list · per-row badge-stack · footer note"],].map(([l,v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>
    </section>

    {/* §4 Type D — Zone Performance Card */}
    <section>
      <SectionHeader icon={BookOpen} title="Type D · Zone Performance Card" description="Compliance % with a full-width progress bar. Auto-colors based on threshold. Shows camera count in footer." />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {ZONE_CARDS.map((d) => <V12ZoneCard key={d.zoneName} d={d} />)}
      </div>
    </section>

    {/* §5 Type E — Capacity Card */}
    <section>
      <SectionHeader icon={Cpu} title="Type E · Capacity Card" description="Occupancy percentage with current/max count and a capacity bar. Three severity states: Critical → Warning → Normal." />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {CAP_CARDS.map((d) => <V12CapacityCard key={d.zoneName} d={d} />)}
      </div>
    </section>

    {/* §6 Type F — Live Zone Card */}
    <section>
      <SectionHeader icon={Layers} title="Type F · Live Zone Card" description="Real-time intrusion / queue monitoring. Active state shows count + sparkline. Clear state shows confirmation. Hover sparkline for glow + scanning cursor." />
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
        {LIVE_CARDS.map((d, i) => <V12LiveCard key={d.zoneName} d={d} frozenCursorFrac={i === 0 ? 0.72 : undefined} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {[["Intrusion Active","Count · sparkline · glow"],["Intrusion Clear","CLEAR state · no count pulse"],["Queue Active","Wait time + queue count · sparkline"],].map(([l,v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>
    </section>

    {/* §7 Interactive States */}
    <section>
      <SectionHeader icon={Eye} title="Interactive States — All Card Types" description="Hover state, skeleton (loading), and resting state for each card type." />
      <div className="space-y-8">

        {/* Spark card states */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#475569] mb-3">Type B — Spark Card</div>
          <div className="flex flex-wrap gap-6 items-start">
            {[
              { label: "Hover State", dot: "#E7000B", note: "cursor at 62%", node: <div className="w-[260px]"><HUDKPICard variant={HUD_CARDS[0]} frozenCursorFrac={0.62} /></div> },
              { label: "Skeleton State", dot: "#94a3b8", note: "data loading", node: <div className="w-[260px]"><HUDKPICard variant={HUD_CARDS[2]} isSkeleton /></div> },
              { label: "Resting State", dot: "#CBD5E1", note: "no interaction", node: <div className="w-[260px]"><HUDKPICard variant={HUD_CARDS[3]} /></div> },
            ].map(({ label, dot, note, node }) => (
              <div key={label} className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: dot }} />
                  <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">{label}</span>
                  <span className="text-[10px] text-[#94a3b8]">— {note}</span>
                </div>
                {node}
              </div>
            ))}
          </div>
        </div>

        {/* Stat card states */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#475569] mb-3">Type A — Stat Card</div>
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E7000B]" /><span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Resting State</span></div>
              <div className="w-[320px]"><V12StatCard d={STAT_CARDS[0]} /></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" /><span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Skeleton State</span></div>
              <div className="w-[320px]"><V12StatCard d={STAT_CARDS[0]} isSkeleton /></div>
            </div>
          </div>
        </div>

        {/* Zone card states */}
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#475569] mb-3">Type D — Zone Performance Card</div>
          <div className="flex flex-wrap gap-6 items-start">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-[#E7000B]" /><span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Resting State</span></div>
              <div className="w-[320px]"><V12ZoneCard d={ZONE_CARDS[0]} /></div>
            </div>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-neutral-400 animate-pulse" /><span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#334155]">Skeleton State</span></div>
              <div className="w-[320px]"><V12ZoneCard d={ZONE_CARDS[0]} isSkeleton /></div>
            </div>
          </div>
        </div>

      </div>
    </section>

  </div>
);


// ══════════════════════════════════════════════════════════════════════════════
//  PAGE SHELL
// ══════════════════════════════════════════════════════════════════════════════
type TabId = "v1" | "v1-1" | "v1-2";
const TABS: { id: TabId; version: string; label: string; badge: string; badgeColor: string }[] = [
  { id: "v1",   version: "v1.0", label: "Standard",      badge: "Stable",  badgeColor: "#2B7FFF" },
  { id: "v1-1", version: "v1.1", label: "High-Tech HUD", badge: "Latest",  badgeColor: "#00A63E" },
  { id: "v1-2", version: "v1.2", label: "Card Catalogue", badge: "New",    badgeColor: "#EA580C" },
];

export const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState<TabId>("v1-1");

  return (
    <div className="min-h-screen bg-[#F8FAFC]">

      {/* Hero */}
      <div className="bg-gradient-to-r from-[#021D18] via-[#032E24] to-[#043D2E] px-8 py-7 border-b border-white/5">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Layers className="w-4 h-4 text-[#00775B]" />
                <span className="text-[10px] font-bold uppercase tracking-[0.8px] text-[#00775B]">
                  Matrice AI Analytics
                </span>
              </div>
              <h1 className="text-[22px] font-bold text-white tracking-tight">Component Library</h1>
              <p className="text-[13px] text-white/50 mt-1 max-w-xl">
                KPI card variants, typography tokens, severity states, and interaction patterns across design versions.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="px-3 py-1.5 rounded-[4px] bg-white/5 border border-white/10 text-[10px] font-medium text-white/60 tabular-nums">
                v1.1
              </div>
              <div className="px-3 py-1.5 rounded-[4px] bg-[#00775B]/20 border border-[#00775B]/30 text-[10px] font-bold text-[#00A63E] uppercase tracking-[0.5px]">
                Live
              </div>
            </div>
          </div>
          <div className="flex items-center gap-6 mt-5 flex-wrap">
            {[
              ["Versions", "2"],
              ["Severity Levels", "4"],
              ["Interactive States", "3"],
              ["Token Families", "4"],
            ].map(([l, v]) => (
              <div key={l} className="flex items-center gap-2">
                <span className="text-[11px] text-white/40 font-medium">{l}</span>
                <span className="w-px h-3 bg-white/10 inline-block" />
                <span className="text-[11px] font-bold text-white/80 tabular-nums">{v}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8">

        {/* Tab strip */}
        <div className="flex items-end gap-0 border-b border-[#E2E8F0] mt-0">
          {TABS.map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "relative flex items-center gap-2.5 px-6 py-4 text-[12px] font-bold transition-all duration-200 border-b-2 -mb-px",
                  active
                    ? "border-[#00775B] text-[#00775B]"
                    : "border-transparent text-[#64748b] hover:text-[#334155] hover:border-[#CBD5E1]"
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] px-1.5 py-0.5 rounded-[3px] font-bold transition-all",
                    active ? "bg-[#00775B] text-white" : "bg-neutral-100 text-[#64748b]"
                  )}
                >
                  {tab.version}
                </span>
                {tab.label}
                <span
                  className="text-[9px] font-bold uppercase tracking-[0.5px] px-1.5 py-0.5 rounded-[3px]"
                  style={{ backgroundColor: `${tab.badgeColor}18`, color: tab.badgeColor }}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>

        {/* Tab content */}
        <div className="py-8 animate-in fade-in duration-300">
          {activeTab === "v1"   && <V1Content />}
          {activeTab === "v1-1" && <V1_1Content />}
          {activeTab === "v1-2" && <V1_2Content />}
        </div>

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] py-6 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>Matrice AI Analytics · Component Library</span>
          <span>Precision &amp; Clarity design pillars</span>
        </div>
      </div>
    </div>
  );
};
