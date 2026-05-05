import { useState, useRef, useCallback, createContext, useContext } from "react";
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
  User,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  SlidersHorizontal,
  X,
  ChevronDown,
  AlertTriangle,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Sandbox Theme Context ────────────────────────────────────────────────────
// Default "light" means ALL components outside the Provider stay unaffected.
const SandboxThemeCtx = createContext<"light" | "dark">("light");
const useSandboxTheme = () => useContext(SandboxThemeCtx);

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
}) => {
  const isDark = useSandboxTheme() === "dark";
  return (
    <div className="flex items-start gap-3 mb-5">
      <div
        className="w-8 h-8 rounded-[4px] flex items-center justify-center flex-shrink-0 mt-0.5"
        style={{ backgroundColor: isDark ? "rgba(0,149,109,0.15)" : "#E5FFF9" }}
      >
        <Icon className="w-4 h-4" style={{ color: isDark ? "#00956D" : "#00775B" }} />
      </div>
      <div>
        <h2
          className="text-[13px] font-bold uppercase tracking-[0.6px]"
          style={{ color: isDark ? "#E2E8F0" : "#0f172a" }}
        >
          {title}
        </h2>
        <p className="text-[12px] mt-0.5" style={{ color: isDark ? "#64748B" : "#64748b" }}>
          {description}
        </p>
      </div>
    </div>
  );
};

const Badge = ({ label, color }: { label: string; color: string }) => (
  <span
    className="inline-flex items-center px-2 py-0.5 rounded-[3px] text-[9px] font-bold uppercase tracking-[0.5px] text-white"
    style={{ backgroundColor: color }}
  >
    {label}
  </span>
);

const SpecChip = ({ label, value }: { label: string; value: string }) => {
  const isDark = useSandboxTheme() === "dark";
  return (
    <div
      className="flex items-center gap-2 px-3 py-1.5 rounded-[4px] text-[11px]"
      style={{
        backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "#ffffff",
        border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
      }}
    >
      <span style={{ color: isDark ? "#475569" : "#94a3b8", fontWeight: 500 }}>{label}:</span>
      <span className="font-mono" style={{ color: isDark ? "#9CA3AF" : "#334155", fontWeight: 600 }}>{value}</span>
    </div>
  );
};

const Annotation = ({ children }: { children: React.ReactNode }) => {
  const isDark = useSandboxTheme() === "dark";
  return (
    <div className="flex items-center gap-1.5 text-[11px]" style={{ color: isDark ? "#475569" : "#64748b" }}>
      <CheckCircle2 className="w-3.5 h-3.5 flex-shrink-0" style={{ color: isDark ? "#00956D" : "#00775B" }} />
      {children}
    </div>
  );
};

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
//
// Type scale (applied consistently across all V12 card types):
//   Card label header : 11px Inter Bold Uppercase #475569
//   Chip badge        : 9px  Inter Bold Uppercase (accent color)
//   Primary value     : 28px JB Mono Bold #0F172A  (numbers/counts)
//   Entity title      : 14px Inter SemiBold #0F172A (zone names, non-numeric)
//   Sublabel / scope  : 12px Inter Regular #64748B
//   Footer text       : 11px Inter Regular #94A3B8 / #64748B
//   Footer label key  : 10px Inter Bold Uppercase #94A3B8
//   BS badge num      : 13px JB Mono Bold (accent color)
//   BS badge ref      : 10px Inter Regular #94A3B8
//   Min card width    : 280px

/** Shared card wrapper — handles hover glow, enforces min-width */
const V12Card = ({
  color, bgColor, children, className,
}: { color: string; bgColor: string; children: React.ReactNode; className?: string }) => {
  const [h, setH] = useState(false);
  return (
    <div
      className={cn("w-full rounded-[4px] flex flex-col cursor-default select-none transition-all duration-200", className)}
      style={{
        minWidth: 280,
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

/** Top label row — 11px bold uppercase neutral + 9px accent chip. Used by all V12 card types. */
const V12Label = ({ label, chip, color }: { label: string; chip?: string; color: string }) => (
  <div className="px-4 pt-4 flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: "#475569" }}>{label}</span>
    {chip && (
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0"
        style={{ backgroundColor: hex2rgba(color, 0.14), color }}>
        {chip}
      </span>
    )}
  </div>
);

/** 2-line badge-stack — shared across all V12 card types */
interface BSProps { dir: SeverityDir; num: string; ref_: string; color: string }
const BS = ({ dir, num, ref_, color }: BSProps) => (
  <div className="flex flex-col px-[10px] py-[8px] rounded-[6px] flex-shrink-0" style={{ backgroundColor: hex2rgba(color, 0.12) }}>
    <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color }}>
      {dir === "up" ? <ArrowUpRight className="w-3.5 h-3.5 flex-shrink-0" />
        : dir === "down" ? <ArrowDownRight className="w-3.5 h-3.5 flex-shrink-0" />
        : <Minus className="w-3 h-3 flex-shrink-0" />}
      {num}
    </div>
    <div className="text-[10px] font-normal mt-[5px] leading-none text-[#94a3b8]">{ref_}</div>
  </div>
);

// ─── Type A: Stat Card ────────────────────────────────────────────────────────
interface StatData {
  label: string; value: string; sublabel: string;
  num: string; ref_: string; dir: SeverityDir;
  definition: string; chip: string;
  color: string; bgColor: string;
}
const STAT_CARDS: StatData[] = [
  { label: "Violations",       value: "02",    sublabel: "Assembly Line · Active", num: "-1%",   ref_: "vs Last Week",  dir: "down",    definition: "Security breaches detected",   chip: "REAL-TIME", color: "#E7000B", bgColor: "#FFE5E7" },
  { label: "Active Cameras",   value: "142",   sublabel: "All Sites · Live Feed",  num: "0",     ref_: "No Change",     dir: "neutral", definition: "Cameras currently streaming",  chip: "LIVE",      color: "#2B7FFF", bgColor: "#E5F0FF" },
  { label: "Mean Time to Ack", value: "15.2m", sublabel: "Rolling 24h Average",   num: "-3.4%", ref_: "vs Yesterday",  dir: "down",    definition: "Alert to acknowledgement time", chip: "DAILY",    color: "#64748B", bgColor: "#F0F2F4" },
];

const V12StatCard = ({ d, isSkeleton = false }: { d: StatData; isSkeleton?: boolean }) => {
  if (isSkeleton) return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      <div className="px-4 pt-4 pb-3 flex items-center justify-between"><Sk className="h-3 w-24" /><Sk className="h-[18px] w-16 rounded-full" /></div>
      <div className="px-4 pb-3 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-1.5"><Sk className="h-8 w-16 mt-1" /><Sk className="h-3 w-36" /></div>
        <Sk className="h-[52px] w-[82px] rounded-[6px]" />
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-3 flex gap-2.5"><Sk className="h-3 w-20" /><Sk className="h-3 w-44" /></div>
    </V12Card>
  );
  return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      <V12Label label={d.label} chip={d.chip} color={d.color} />
      <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
        <div className="flex flex-col gap-[7px]">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{d.value}</div>
          <div className="text-[12px] text-[#64748b]">{d.sublabel}</div>
        </div>
        <BS dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-3 flex items-center gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] flex-shrink-0">Definition</span>
        <span className="text-[11px] text-[#475569]">{d.definition}</span>
      </div>
    </V12Card>
  );
};

// ─── Type C: Alert Card ───────────────────────────────────────────────────────
interface AlertData {
  label: string; color: string; bgColor: string;
  zoneName?: string; description?: string; compliance?: string;
  alertInfo?: string; cameraId?: string;
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
    {/* Header — accent color label matching V12Label sizing/weight */}
    <div className="px-4 pt-4 pb-0">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none" style={{ color: d.color }}>{d.label}</span>
    </div>
    {d.zoneName ? (
      /* Critical variant */
      <>
        <div className="px-4 pt-3 pb-4 flex items-start justify-between gap-4">
          <div className="flex flex-col gap-[7px] min-w-0">
            <div className="text-[16px] font-semibold text-[#0f172a] leading-tight">{d.zoneName}</div>
            <div className="text-[12px] text-[#64748b]">{d.description}</div>
          </div>
          <div className="flex flex-col items-center px-4 py-3 rounded-[6px] flex-shrink-0 bg-white/70">
            <span className="font-mono font-bold leading-none" style={{ fontSize: 22, color: d.color }}>{d.compliance}</span>
            <span className="text-[10px] font-bold uppercase tracking-[0.5px] text-[#94a3b8] mt-1.5">Compliance</span>
          </div>
        </div>
        <V12Divider color={d.color} />
        <div className="px-4 py-3 flex items-center gap-1.5">
          <span style={{ color: d.color }} className="text-[11px]">⚠</span>
          <span className="text-[11px] font-bold uppercase tracking-[0.4px]" style={{ color: d.color }}>{d.alertInfo}</span>
          <span className="text-[11px] text-[#94a3b8] mx-1">·</span>
          <span className="text-[11px] font-mono text-[#64748b]">{d.cameraId}</span>
        </div>
      </>
    ) : (
      /* Cautionary variant */
      <>
        <div className="px-4 pt-3 pb-1 flex flex-col gap-2">
          {d.zones?.map((z) => (
            <div key={z.name} className="flex items-center justify-between py-2.5 px-3 rounded-[4px]" style={{ backgroundColor: hex2rgba(d.color, 0.08) }}>
              <div>
                <div className="text-[13px] font-semibold text-[#0f172a]">{z.name}</div>
                <div className="text-[11px] text-[#64748b] mt-[5px]">{z.compliance}</div>
              </div>
              <BS dir={z.dir} num={z.num} ref_={z.ref_} color={d.color} />
            </div>
          ))}
        </div>
        <V12Divider color={d.color} />
        <div className="px-4 py-3 flex items-center gap-1.5">
          <span style={{ color: d.color }} className="text-[11px]">⚡</span>
          <span className="text-[10px] font-bold uppercase tracking-[0.4px]" style={{ color: d.color }}>{d.footerNote}</span>
        </div>
      </>
    )}
  </V12Card>
);

// ─── Type D: Zone Performance Card ───────────────────────────────────────────
interface ZoneData {
  zoneName: string; subLabel: string;
  compliance: number;
  num: string; ref_: string; dir: SeverityDir;
  cameras: number;
  color: string; bgColor: string;
}
const ZONE_CARDS: ZoneData[] = [
  { zoneName: "Loading Dock",    subLabel: "Warehouse A",      compliance: 68, num: "-8%",   ref_: "vs yesterday", dir: "down", cameras: 4, color: "#E7000B", bgColor: "#FFE5E7" },
  { zoneName: "Assembly B",      subLabel: "Production Floor", compliance: 84, num: "-5%",   ref_: "vs yesterday", dir: "down", cameras: 6, color: "#EA580C", bgColor: "#FEEFE7" },
  { zoneName: "Warehouse C",     subLabel: "Storage Zone",     compliance: 91, num: "+1%",   ref_: "vs yesterday", dir: "up",   cameras: 3, color: "#00A63E", bgColor: "#E5FFEF" },
  { zoneName: "Office Lobby",    subLabel: "Entrance Zone",    compliance: 97, num: "+0.4%", ref_: "vs yesterday", dir: "up",   cameras: 2, color: "#2B7FFF", bgColor: "#E5F0FF" },
];

const V12ZoneCard = ({ d, isSkeleton = false }: { d: ZoneData; isSkeleton?: boolean }) => {
  if (isSkeleton) return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      {/* Header skeleton row */}
      <div className="px-4 pt-4 pb-2 flex items-center justify-between"><Sk className="h-3 w-28" /></div>
      <div className="px-4 pb-3 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1.5"><Sk className="h-4 w-32" /><Sk className="h-3 w-24 mt-0.5" /></div>
        <Sk className="h-[52px] w-[82px] rounded-[6px]" />
      </div>
      <div className="px-4 pb-3"><Sk className="h-2 w-full rounded-full" /></div>
      <V12Divider color={d.color} />
      <div className="px-4 py-3 flex gap-3"><Sk className="h-3 w-20" /><Sk className="h-3 w-24" /></div>
    </V12Card>
  );
  return (
    <V12Card color={d.color} bgColor={d.bgColor}>
      {/* V12Label header — matches all other card types */}
      <V12Label label="Zone Performance" color={d.color} />
      <div className="px-4 pt-3 pb-3 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-[7px] min-w-0">
          <div className="text-[14px] font-semibold text-[#0f172a] leading-none">{d.zoneName}</div>
          <div className="text-[12px] text-[#64748b]">{d.subLabel}</div>
        </div>
        <BS dir={d.dir} num={d.num} ref_={d.ref_} color={d.color} />
      </div>
      {/* Compliance bar — value prominently sized */}
      <div className="px-4 pb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-[0.4px] text-[#94a3b8]">Compliance</span>
          <span className="font-mono font-bold leading-none" style={{ fontSize: 16, color: d.color }}>{d.compliance}%</span>
        </div>
        <div className="h-[5px] rounded-full bg-white/60 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${d.compliance}%`, backgroundColor: d.color }} />
        </div>
      </div>
      <V12Divider color={d.color} />
      <div className="px-4 py-3 flex items-center gap-3 text-[11px] text-[#94a3b8] font-medium">
        <span>🎥 {d.cameras} cameras</span>
        <span className="w-px h-3 bg-neutral-200" />
        <span className="font-mono" style={{ color: d.compliance < 80 ? d.color : "#64748b" }}>{d.compliance}% compliant</span>
      </div>
    </V12Card>
  );
};

// ─── Type E: Capacity Card ────────────────────────────────────────────────────
interface CapData {
  zoneName: string; current: number; max: number; occupancy: number;
  statusLabel: string; color: string; bgColor: string;
}
const CAP_CARDS: CapData[] = [
  { zoneName: "Loading Dock",    current: 56, max: 60, occupancy: 93, statusLabel: "CRITICAL", color: "#E7000B", bgColor: "#FFE5E7" },
  { zoneName: "Assembly Line A", current: 47, max: 60, occupancy: 78, statusLabel: "WARNING",  color: "#EA580C", bgColor: "#FEEFE7" },
  { zoneName: "Cafeteria",       current: 36, max: 80, occupancy: 45, statusLabel: "NORMAL",   color: "#00A63E", bgColor: "#E5FFEF" },
];

const V12CapacityCard = ({ d }: { d: CapData }) => (
  <V12Card color={d.color} bgColor={d.bgColor}>
    {/* Header — V12Label style inline (includes status chip) */}
    <div className="px-4 pt-4 pb-0 flex items-center justify-between">
      <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none text-[#475569]">Zone Capacity</span>
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full"
        style={{ backgroundColor: hex2rgba(d.color, 0.14), color: d.color }}>{d.statusLabel}</span>
    </div>
    <div className="px-4 pt-3 pb-3 flex flex-col gap-[7px]">
      <div className="text-[14px] font-semibold text-[#0f172a]">{d.zoneName}</div>
      <div className="flex items-baseline gap-2">
        <span className="font-mono font-bold leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{d.occupancy}%</span>
        <span className="text-[12px] text-[#64748b]">{d.current}/{d.max} people</span>
      </div>
    </div>
    <div className="px-4 pb-4">
      <div className="h-[6px] rounded-full bg-white/60 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${d.occupancy}%`, backgroundColor: d.color }} />
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-[10px] text-[#94a3b8] font-mono">0</span>
        <span className="text-[10px] font-mono font-bold" style={{ color: d.color }}>{d.occupancy}% capacity</span>
        <span className="text-[10px] text-[#94a3b8] font-mono">{d.max}</span>
      </div>
    </div>
  </V12Card>
);

// ─── Type F: Live Zone Card ───────────────────────────────────────────────────
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
      {/* Header — V12Label style with status chip */}
      <div className="px-4 pt-4 pb-0 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: d.isActive ? d.color : "#94a3b8" }} />
          <span className="text-[11px] font-bold uppercase tracking-[0.5px] text-[#475569]">{d.appType}</span>
          <span className="text-[11px] text-[#94a3b8]">·</span>
          <span className="text-[12px] font-semibold text-[#334155]">{d.zoneName}</span>
        </div>
        <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full"
          style={{ backgroundColor: hex2rgba(d.color, 0.14), color: d.color }}>
          {d.isActive ? "Active" : "Clear"}
        </span>
      </div>
      {/* Main */}
      <div className="px-4 pt-3 pb-4 flex items-center justify-between gap-4"
        onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="flex flex-col gap-[7px]">
          <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: d.count === "CLEAR" ? 20 : 28 }}>
            {d.count}
          </div>
          <div className="text-[12px] text-[#64748b]">{d.subtitle}</div>
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
      <div className="px-4 py-3 flex items-center gap-2 text-[11px] text-[#94a3b8]">
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
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
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
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
        {ALERT_CARDS.map((d) => <V12AlertCard key={d.label} d={d} />)}
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        {[["Critical","Zone name · compliance badge · alert count"],["Cautionary","Zone list · per-row badge-stack · footer note"],].map(([l,v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>
    </section>

    {/* §4 Type D — Zone Performance Card */}
    <section>
      <SectionHeader icon={BookOpen} title="Type D · Zone Performance Card" description="Compliance % with a full-width progress bar. Auto-colors based on threshold. Shows camera count in footer." />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {ZONE_CARDS.map((d) => <V12ZoneCard key={d.zoneName} d={d} />)}
      </div>
    </section>

    {/* §5 Type E — Capacity Card */}
    <section>
      <SectionHeader icon={Cpu} title="Type E · Capacity Card" description="Occupancy percentage with current/max count and a capacity bar. Three severity states: Critical → Warning → Normal." />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
        {CAP_CARDS.map((d) => <V12CapacityCard key={d.zoneName} d={d} />)}
      </div>
    </section>

    {/* §6 Type F — Live Zone Card */}
    <section>
      <SectionHeader icon={Layers} title="Type F · Live Zone Card" description="Real-time intrusion / queue monitoring. Active state shows count + sparkline. Clear state shows confirmation. Hover sparkline for glow + scanning cursor." />
      <div className="grid gap-4" style={{ gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
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
//  DATA GRID — v2.0 / v2.1
// ══════════════════════════════════════════════════════════════════════════════

interface GridRow {
  id: string;
  status: "critical" | "warning" | "stable" | "info" | "resolved";
  event: string;
  zone: string;
  camera: string;
  confidence: number;
  timestamp: string;
}

const GRID_DATA: GridRow[] = [
  { id: "INC-004821", status: "critical",  event: "Hardhat Missing",           zone: "Loading Dock A",  camera: "CAM-14", confidence: 97.3, timestamp: "2026-04-28  16:05" },
  { id: "INC-004820", status: "warning",   event: "Safety Zone Breach",         zone: "Assembly Line 2", camera: "CAM-07", confidence: 84.1, timestamp: "2026-04-28  15:58" },
  { id: "INC-004819", status: "stable",    event: "PPE Compliant Check",        zone: "Warehouse B",     camera: "CAM-22", confidence: 99.7, timestamp: "2026-04-28  15:47" },
  { id: "INC-004818", status: "info",      event: "Crowd Density Alert",        zone: "Exit Gate 3",     camera: "CAM-31", confidence: 76.2, timestamp: "2026-04-28  15:33" },
  { id: "INC-004817", status: "warning",   event: "Restricted Area Intrusion",  zone: "Server Room",     camera: "CAM-05", confidence: 92.8, timestamp: "2026-04-28  15:21" },
  { id: "INC-004816", status: "resolved",  event: "Spill Detected",             zone: "Kitchen Area",    camera: "CAM-18", confidence: 88.5, timestamp: "2026-04-28  14:56" },
  { id: "INC-004815", status: "critical",  event: "Vest Missing",               zone: "Loading Dock B",  camera: "CAM-15", confidence: 95.1, timestamp: "2026-04-28  14:42" },
  { id: "INC-004814", status: "info",      event: "Queue Length Exceeded",      zone: "Main Entrance",   camera: "CAM-01", confidence: 71.4, timestamp: "2026-04-28  14:19" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  critical: { label: "Critical",  color: "#E7000B", bg: "rgba(231,0,11,0.08)",    border: "rgba(231,0,11,0.2)" },
  warning:  { label: "Warning",   color: "#EA580C", bg: "rgba(234,88,12,0.08)",   border: "rgba(234,88,12,0.2)" },
  stable:   { label: "Stable",    color: "#00A63E", bg: "rgba(0,166,62,0.08)",    border: "rgba(0,166,62,0.2)" },
  info:     { label: "Info",      color: "#2B7FFF", bg: "rgba(43,127,255,0.08)",  border: "rgba(43,127,255,0.2)" },
  resolved: { label: "Resolved",  color: "#64748B", bg: "rgba(100,116,139,0.08)", border: "rgba(100,116,139,0.2)" },
};

const StatusCapsule = ({ status }: { status: string }) => {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.info;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center",
      padding: "2px 8px",
      borderRadius: 100,
      fontSize: 10, fontWeight: 700, letterSpacing: "0.04em", textTransform: "uppercase",
      color: cfg.color,
      backgroundColor: cfg.bg,
      border: `1px solid ${cfg.border}`,
      whiteSpace: "nowrap",
    }}>
      {cfg.label}
    </span>
  );
};

const GRID_COLS = "40px 128px 110px 1fr 148px 72px 88px 148px 80px";

const DataGrid = ({ compact = false }: { compact?: boolean }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDark = useSandboxTheme() === "dark";
  const rowH = compact ? 36 : 44;

  return (
    <div style={{ maxWidth: 1200, margin: "0 auto", fontFamily: "inherit" }}>
      {/* Ghost Header */}
      <div style={{
        display: "grid",
        gridTemplateColumns: GRID_COLS,
        alignItems: "center",
        height: 36,
        paddingLeft: 8,
        paddingRight: 8,
        backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "rgba(241,245,249,0.5)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        borderBottom: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
        gap: 0,
      }}>
        {["#", "Incident ID", "Status", "Event Type", "Zone", "Camera", "Conf.", "Timestamp", ""].map((h, i) => (
          <div key={i} style={{
            fontSize: 11, fontWeight: 700, color: "#94A3B8",
            textTransform: "uppercase", letterSpacing: "0.05em",
            paddingLeft: i === 0 ? 0 : 8,
            paddingRight: 8,
          }}>
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {GRID_DATA.map((row, idx) => {
        const isHovered = hoveredId === row.id;
        return (
          <div
            key={row.id}
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "grid",
              gridTemplateColumns: GRID_COLS,
              alignItems: "center",
              height: rowH,
              position: "relative",
              backgroundColor: isHovered ? (isDark ? "rgba(0,119,91,0.10)" : "rgba(0,119,91,0.04)") : (isDark ? "transparent" : "#ffffff"),
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.05)" : "1px solid #F1F5F9",
              cursor: "default",
              transition: "background-color 120ms ease",
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            {/* 3px teal selection bar on left */}
            <div style={{
              position: "absolute", left: 0, top: 0, bottom: 0,
              width: 3,
              backgroundColor: "#00775B",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 120ms ease",
            }} />

            {/* # */}
            <div style={{ fontSize: 11, color: isDark ? "#374151" : "#CBD5E1", fontFamily: "'JetBrains Mono', monospace", paddingLeft: 8 }}>
              {String(idx + 1).padStart(2, "0")}
            </div>

            {/* Incident ID — weight bumps on hover */}
            <div style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: isHovered ? 600 : 500,
              color: isHovered ? (isDark ? "#F1F5F9" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"),
              paddingLeft: 8,
              transition: "font-weight 120ms ease, color 120ms ease",
              letterSpacing: "0.01em",
            }}>
              {row.id}
            </div>

            {/* Status */}
            <div style={{ paddingLeft: 8 }}>
              <StatusCapsule status={row.status} />
            </div>

            {/* Event Type — Inter */}
            <div style={{
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              fontWeight: isHovered ? 500 : 400,
              color: isHovered ? (isDark ? "#F1F5F9" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"),
              paddingLeft: 8,
              paddingRight: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {row.event}
            </div>

            {/* Zone — Inter */}
            <div style={{
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              color: isDark ? "#94A3B8" : "#475569",
              paddingLeft: 8,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}>
              {row.zone}
            </div>

            {/* Camera — Mono */}
            <div style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: isDark ? "#4B5563" : "#64748B",
              paddingLeft: 8,
            }}>
              {row.camera}
            </div>

            {/* Confidence — Mono */}
            <div style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: isDark ? "#9CA3AF" : "#475569",
              paddingLeft: 8,
              fontVariantNumeric: "tabular-nums",
            } as React.CSSProperties}>
              {row.confidence.toFixed(1)}%
            </div>

            {/* Timestamp — Mono */}
            <div style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: isDark ? "#4B5563" : "#64748B",
              paddingLeft: 8,
              letterSpacing: "0.01em",
            }}>
              {row.timestamp}
            </div>

            {/* Actions — glassmorphic, hidden until hover */}
            <div style={{
              paddingLeft: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-end",
              opacity: isHovered ? 1 : 0,
              transition: "opacity 150ms ease",
            }}>
              <div style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                padding: "4px 8px",
                backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.9)",
                backdropFilter: "blur(12px)",
                WebkitBackdropFilter: "blur(12px)",
                border: isDark ? "1px solid rgba(255,255,255,0.12)" : "1px solid rgba(0,0,0,0.07)",
                borderRadius: 4,
                boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.08)",
              }}>
                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#64748B" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#00775B"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,119,91,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <Eye style={{ width: 13, height: 13 }} />
                </button>
                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#64748B" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#00A63E"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(0,166,62,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <CheckCircle2 style={{ width: 13, height: 13 }} />
                </button>
                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#64748B" }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.color = "#2B7FFF"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(43,127,255,0.08)"; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.color = "#64748B"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}>
                  <User style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const PrecisionGridContent = () => {
  const isDark = useSandboxTheme() === "dark";
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Eye}
        title="Precision Grid v2.0 — Master Data Table"
        description="Unified high-precision table with ghost header, JetBrains Mono data columns, capsule status badges, and glassmorphic hover actions."
      />

      {/* Spec chips */}
      <div className="flex flex-wrap gap-2">
        {[
          ["Row Height", "44px"],
          ["Header BG", "rgba(241,245,249,0.5)"],
          ["Header Blur", "4px"],
          ["Divider", "1px neutral-100"],
          ["Hover BG", "rgba(0,119,91,0.04)"],
          ["Selection Bar", "3px #00775B"],
          ["ID Font", "JetBrains Mono"],
          ["Cell Padding", "8px grid"],
          ["Max Width", "1200px"],
        ].map(([l, v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>

      {/* Grid showcase */}
      <div
        className="rounded-[6px] overflow-hidden"
        style={{
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
          backgroundColor: isDark ? "#131C2E" : "white",
          boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <DataGrid compact={false} />
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation>Ghost header: <code className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">rgba(241,245,249,0.5) blur(4px)</code> — stays legible over any bg</Annotation>
        <Annotation>3px teal selection bar on left edge of hovered row</Annotation>
        <Annotation>Incident ID weight shifts from Medium → Semibold on hover</Annotation>
        <Annotation>Action container: glassmorphic, opacity 0→1 on row hover</Annotation>
        <Annotation>JetBrains Mono for all IDs, confidence scores, and timestamps</Annotation>
        <Annotation>Status capsules use 10% opacity fill matching KPI card severity tokens</Annotation>
      </div>
    </div>
  );
};

const DenseGridContent = () => {
  const isDark = useSandboxTheme() === "dark";
  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Eye}
        title="Dense Log v2.1 — Compact Data Table"
        description="High-density variant with 36px rows for log-style data. Ideal for operational dashboards requiring maximum data density."
      />

      <div className="flex flex-wrap gap-2">
        {[
          ["Row Height", "36px"],
          ["Density", "High"],
          ["Header BG", "rgba(241,245,249,0.5)"],
          ["Same Hover", "Yes"],
        ].map(([l, v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>

      <div
        className="rounded-[6px] overflow-hidden"
        style={{
          border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
          backgroundColor: isDark ? "#131C2E" : "white",
          boxShadow: isDark ? "none" : "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <DataGrid compact={true} />
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Annotation>36px rows — 22% denser than the standard 44px grid</Annotation>
        <Annotation>All interaction patterns (hover bar, actions) carry through at compact size</Annotation>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  DATA GRID v2.0 Base — wrapper for Precision + Dense sub-tabs
// ══════════════════════════════════════════════════════════════════════════════
const V2BaseContent = () => {
  const [subTab, setSubTab] = useState<"precision" | "dense">("precision");
  const isDark = useSandboxTheme() === "dark";
  return (
    <div className="space-y-8">
      {/* Sub-tab selector */}
      <div className="flex items-center gap-0 pt-1">
        <div
          style={{
            display: "flex", alignItems: "center",
            gap: 2, padding: "3px",
            backgroundColor: isDark ? "rgba(255,255,255,0.05)" : "#F1F5F9",
            border: `1px solid ${isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0"}`,
            borderRadius: 6,
          }}
        >
          {(["precision", "dense"] as const).map((v) => (
            <button
              key={v}
              onClick={() => setSubTab(v)}
              style={{
                padding: "5px 16px",
                borderRadius: 4,
                fontSize: 11, fontWeight: 700,
                textTransform: "uppercase", letterSpacing: "0.05em",
                backgroundColor: subTab === v ? "#00775B" : "transparent",
                color: subTab === v ? "white" : (isDark ? "#4B5563" : "#64748B"),
                border: "none", cursor: "pointer",
                transition: "background-color 150ms ease, color 150ms ease",
              }}
            >
              {v === "precision" ? "Precision Grid" : "Dense Log"}
            </button>
          ))}
        </div>
      </div>
      {subTab === "precision" && <PrecisionGridContent />}
      {subTab === "dense" && <DenseGridContent />}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  DATA GRID v2.1 — High-Tech Dense
//  Solid neutral-50 header · bright-fill severity pills · ghost toolbar
//  2px teal selection bar · JetBrains Mono data · bottom pagination
// ══════════════════════════════════════════════════════════════════════════════

// 25-row dataset — 10 rows/page = 3 pages (10 + 10 + 5)
const V21_GRID_DATA: GridRow[] = [
  { id: "INC-004821", status: "critical",  event: "Hardhat Missing",           zone: "Loading Dock A",  camera: "CAM-14", confidence: 97.3,  timestamp: "2026-04-28 16:05" },
  { id: "INC-004820", status: "warning",   event: "Safety Zone Breach",         zone: "Assembly Line 2", camera: "CAM-07", confidence: 84.1,  timestamp: "2026-04-28 15:58" },
  { id: "INC-004819", status: "stable",    event: "PPE Compliant Check",        zone: "Warehouse B",     camera: "CAM-22", confidence: 99.7,  timestamp: "2026-04-28 15:47" },
  { id: "INC-004818", status: "info",      event: "Crowd Density Alert",        zone: "Exit Gate 3",     camera: "CAM-31", confidence: 76.2,  timestamp: "2026-04-28 15:33" },
  { id: "INC-004817", status: "warning",   event: "Restricted Area Intrusion",  zone: "Server Room",     camera: "CAM-05", confidence: 92.8,  timestamp: "2026-04-28 15:21" },
  { id: "INC-004816", status: "resolved",  event: "Spill Detected",             zone: "Kitchen Area",    camera: "CAM-18", confidence: 88.5,  timestamp: "2026-04-28 14:56" },
  { id: "INC-004815", status: "critical",  event: "Vest Missing",               zone: "Loading Dock B",  camera: "CAM-15", confidence: 95.1,  timestamp: "2026-04-28 14:42" },
  { id: "INC-004814", status: "info",      event: "Queue Length Exceeded",      zone: "Main Entrance",   camera: "CAM-01", confidence: 71.4,  timestamp: "2026-04-28 14:19" },
  { id: "INC-004813", status: "critical",  event: "Fire Hazard Detected",       zone: "Boiler Room",     camera: "CAM-09", confidence: 98.2,  timestamp: "2026-04-28 13:55" },
  { id: "INC-004812", status: "warning",   event: "Forklift Proximity Alert",   zone: "Warehouse A",     camera: "CAM-11", confidence: 89.4,  timestamp: "2026-04-28 13:31" },
  { id: "INC-004811", status: "stable",    event: "PPE Compliant Shift",        zone: "Assembly Line 1", camera: "CAM-03", confidence: 100.0, timestamp: "2026-04-28 13:00" },
  { id: "INC-004810", status: "info",      event: "Visitor Badge Missing",      zone: "Reception",       camera: "CAM-02", confidence: 68.9,  timestamp: "2026-04-28 12:44" },
  { id: "INC-004809", status: "resolved",  event: "Equipment Obstruction",      zone: "Loading Bay",     camera: "CAM-17", confidence: 91.3,  timestamp: "2026-04-28 12:18" },
  { id: "INC-004808", status: "critical",  event: "No Safety Harness",          zone: "Roof Access",     camera: "CAM-28", confidence: 96.7,  timestamp: "2026-04-28 11:52" },
  { id: "INC-004807", status: "warning",   event: "Unauthorised Vehicle Entry", zone: "Parking Zone B",  camera: "CAM-04", confidence: 77.6,  timestamp: "2026-04-28 11:30" },
  { id: "INC-004806", status: "info",      event: "Loitering Detected",         zone: "Main Entrance",   camera: "CAM-01", confidence: 65.3,  timestamp: "2026-04-28 11:08" },
  { id: "INC-004805", status: "stable",    event: "PPE Compliant Handover",     zone: "Shift Handover",  camera: "CAM-06", confidence: 99.1,  timestamp: "2026-04-28 10:44" },
  { id: "INC-004804", status: "critical",  event: "Chemical Leak Proximity",    zone: "Hazmat Zone",     camera: "CAM-33", confidence: 94.5,  timestamp: "2026-04-28 10:22" },
  { id: "INC-004803", status: "resolved",  event: "Blocked Emergency Exit",     zone: "Exit Corridor A", camera: "CAM-19", confidence: 86.7,  timestamp: "2026-04-28 10:01" },
  { id: "INC-004802", status: "warning",   event: "Excessive Speed Detected",   zone: "Loading Bay",     camera: "CAM-12", confidence: 81.2,  timestamp: "2026-04-28 09:38" },
  { id: "INC-004801", status: "info",      event: "Tailgating Incident",        zone: "Access Gate 1",   camera: "CAM-08", confidence: 72.4,  timestamp: "2026-04-28 09:15" },
  { id: "INC-004800", status: "stable",    event: "Daily Safety Check Pass",    zone: "Control Room",    camera: "CAM-10", confidence: 100.0, timestamp: "2026-04-28 08:52" },
  { id: "INC-004799", status: "critical",  event: "Unattended Equipment",       zone: "Production Floor", camera: "CAM-16", confidence: 93.8, timestamp: "2026-04-28 08:29" },
  { id: "INC-004798", status: "warning",   event: "Manual Handling Risk",       zone: "Warehouse C",     camera: "CAM-23", confidence: 83.5,  timestamp: "2026-04-28 08:07" },
  { id: "INC-004797", status: "resolved",  event: "Near-Miss Logged",           zone: "Assembly Line 3", camera: "CAM-25", confidence: 90.0,  timestamp: "2026-04-28 07:44" },
];

// Bright-fill severity pill — solid bg, white text, JetBrains Mono 10px Bold, 4px radius
const V21_STATUS_CFG: Record<string, { label: string; bg: string }> = {
  critical: { label: "Critical", bg: "#E7000B" },
  warning:  { label: "Warning",  bg: "#EA580C" },
  stable:   { label: "Stable",   bg: "#00A63E" },
  success:  { label: "Success",  bg: "#00A63E" },
  info:     { label: "Info",     bg: "#2B7FFF" },
  resolved: { label: "Resolved", bg: "#475569" },
  medium:   { label: "Medium",   bg: "#E19A04" },
  high:     { label: "High",     bg: "#EA580C" },
  low:      { label: "Low",      bg: "#2B7FFF" },
};

const V21StatusPill = ({ status }: { status: string }) => {
  const cfg = V21_STATUS_CFG[status.toLowerCase()] ?? { label: status, bg: "#64748B" };
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.04em", textTransform: "uppercase",
        color: "#ffffff",
        backgroundColor: cfg.bg,
        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
        whiteSpace: "nowrap",
      }}
    >
      {cfg.label}
    </span>
  );
};

const V21_COLS = "40px 128px 108px 1fr 148px 72px 80px 148px 68px";

const V21DataGrid = ({ data }: { data: GridRow[] }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDark = useSandboxTheme() === "dark";

  return (
    <div style={{ fontFamily: "inherit", width: "100%" }}>
      {/* Solid neutral-50 header — 1px border top AND bottom */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: V21_COLS,
          alignItems: "center",
          height: 38,
          backgroundColor: isDark ? "#1E293B" : "#E2E8F0",
          borderTop: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0"}`,
          borderBottom: `1px solid ${isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0"}`,
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {["#", "Incident ID", "Status", "Event Type", "Zone", "Camera", "Conf.", "Timestamp", ""].map((h, i) => (
          <div
            key={i}
            style={{
              fontSize: 11, fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              color: "#94A3B8",
              textTransform: "uppercase", letterSpacing: "0.05em",
              paddingLeft: i === 0 ? 4 : 8,
              paddingRight: 8,
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows */}
      {data.map((row, idx) => {
        const isHovered = hoveredId === row.id;
        return (
          <div
            key={row.id}
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "grid",
              gridTemplateColumns: V21_COLS,
              alignItems: "center",
              height: 44,
              position: "relative",
              backgroundColor: isHovered ? (isDark ? "rgba(0,119,91,0.10)" : "rgba(0, 119, 91, 0.05)") : (isDark ? "transparent" : "#ffffff"),
              borderBottom: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #F1F5F9",
              cursor: "default",
              transition: "background-color 120ms ease",
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            {/* 2px teal selection bar */}
            <div
              style={{
                position: "absolute", left: 0, top: 0, bottom: 0,
                width: 2,
                backgroundColor: "#00775B",
                opacity: isHovered ? 1 : 0,
                transition: "opacity 120ms ease",
              }}
            />

            {/* # */}
            <div style={{ fontSize: 11, color: "#CBD5E1", fontFamily: "'JetBrains Mono', monospace", paddingLeft: 4 }}>
              {String(idx + 1).padStart(2, "0")}
            </div>

            {/* ID — weight bump on hover */}
            <div style={{ paddingLeft: 8 }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 11,
                  fontWeight: isHovered ? 600 : 500,
                  color: isHovered ? (isDark ? "#F1F5F9" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"),
                  letterSpacing: "0.01em",
                  transition: "font-weight 120ms ease, color 120ms ease",
                }}
              >
                {row.id}
              </span>
            </div>

            {/* Status — bright fill pill */}
            <div style={{ paddingLeft: 8 }}>
              <V21StatusPill status={row.status} />
            </div>

            {/* Event Type — Inter */}
            <div
              style={{
                paddingLeft: 8, paddingRight: 8,
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                fontWeight: isHovered ? 500 : 400,
                color: isHovered ? (isDark ? "#F1F5F9" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"),
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                transition: "color 120ms ease",
              }}
            >
              {row.event}
            </div>

            {/* Zone — Inter */}
            <div
              style={{
                paddingLeft: 8,
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
                color: isDark ? "#6B7280" : "#475569",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
              }}
            >
              {row.zone}
            </div>

            {/* Camera — Mono */}
            <div style={{ paddingLeft: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#4B5563" : "#64748B" }}>
              {row.camera}
            </div>

            {/* Confidence — Mono */}
            <div style={{ paddingLeft: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#9CA3AF" : "#475569", fontVariantNumeric: "tabular-nums" } as React.CSSProperties}>
              {row.confidence.toFixed(1)}%
            </div>

            {/* Timestamp — Mono */}
            <div style={{ paddingLeft: 8, fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: isDark ? "#4B5563" : "#64748B", letterSpacing: "0.01em" }}>
              {row.timestamp}
            </div>

            {/* Actions — glassmorphic, hover-revealed */}
            <div
              style={{
                paddingLeft: 8, display: "flex", alignItems: "center", justifyContent: "flex-end",
                opacity: isHovered ? 1 : 0, transition: "opacity 150ms ease",
              }}
            >
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 2,
                  padding: "3px 6px",
                  backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.92)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)"}`,
                  borderRadius: 4,
                  boxShadow: isDark ? "0 2px 8px rgba(0,0,0,0.5)" : "0 2px 8px rgba(0,0,0,0.07)",
                }}
              >
                <button
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = "#00775B"; (e.currentTarget).style.background = "rgba(0,119,91,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = "#94A3B8"; (e.currentTarget).style.background = "transparent"; }}
                >
                  <Eye style={{ width: 13, height: 13 }} />
                </button>
                <button
                  style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8" }}
                  onMouseEnter={(e) => { (e.currentTarget).style.color = "#00A63E"; (e.currentTarget).style.background = "rgba(0,166,62,0.08)"; }}
                  onMouseLeave={(e) => { (e.currentTarget).style.color = "#94A3B8"; (e.currentTarget).style.background = "transparent"; }}
                >
                  <CheckCircle2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ROWS_PER_PAGE_V21 = 10;

const V2_1Content = () => {
  const [searchQ, setSearchQ] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState<"timestamp" | "confidence" | "id">("timestamp");
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortOpen, setSortOpen] = useState(false);
  const isDark = useSandboxTheme() === "dark";

  const filteredData = V21_GRID_DATA
    .filter((row) => {
      if (
        searchQ &&
        !row.event.toLowerCase().includes(searchQ.toLowerCase()) &&
        !row.id.toLowerCase().includes(searchQ.toLowerCase()) &&
        !row.zone.toLowerCase().includes(searchQ.toLowerCase())
      ) return false;
      if (statusFilter !== "all" && row.status !== statusFilter) return false;
      return true;
    })
    .sort((a, b) => {
      if (sortField === "confidence") return b.confidence - a.confidence;
      if (sortField === "id") return a.id.localeCompare(b.id);
      return b.timestamp.localeCompare(a.timestamp);
    });

  const totalPages = Math.ceil(filteredData.length / ROWS_PER_PAGE_V21);
  const paginatedData = filteredData.slice(
    (page - 1) * ROWS_PER_PAGE_V21,
    page * ROWS_PER_PAGE_V21
  );

  const handleSearch = (q: string) => { setSearchQ(q); setPage(1); };
  const handleStatus = (s: string) => { setStatusFilter(s); setPage(1); setFilterOpen(false); };
  const handleSort = (f: "timestamp" | "confidence" | "id") => { setSortField(f); setSortOpen(false); };

  const SORT_OPTIONS: { id: "timestamp" | "confidence" | "id"; label: string }[] = [
    { id: "timestamp",  label: "Newest First" },
    { id: "confidence", label: "Confidence ↓" },
    { id: "id",         label: "ID Ascending" },
  ];

  const STATUS_OPTIONS = ["all", "critical", "warning", "stable", "info", "resolved"];

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Eye}
        title="High-Tech Dense v2.1"
        description="Solid header, bright-fill severity pills, ghost toolbar with search + filter + sort, bottom pagination matching the Safety Analytics violation log."
      />

      {/* Spec chips */}
      <div className="flex flex-wrap gap-2">
        {[
          ["Header BG",     "#E2E8F0 (neutral-200)"],
          ["Header Border", "top + bottom 1px"],
          ["Hover BG",      "rgba(0,119,91,0.05)"],
          ["Selection Bar", "2px #00775B"],
          ["Pills",         "Bright fill, 4px radius"],
          ["Pill Font",     "JetBrains Mono 10px Bold"],
          ["Toolbar",       "Ghost style search + filter"],
          ["Pagination",    "Bottom-center PREV / 1 2 3 / NEXT"],
        ].map(([l, v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>

      {/* ── Toolbar + Table ──────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200 }}>

        {/* Toolbar row */}
        <div
          style={{
            display: "flex", alignItems: "center", gap: 8,
            marginBottom: 16,   // exactly 16px = 2×8px grid tokens
          }}
        >
          {/* Ghost search bar */}
          <div style={{ position: "relative", flex: 1, maxWidth: 280 }}>
            <Search
              style={{
                position: "absolute", left: 10,
                top: "50%", transform: "translateY(-50%)",
                width: 13, height: 13, color: "#94A3B8",
                pointerEvents: "none",
              }}
            />
            <input
              type="text"
              placeholder="Search incidents, zones…"
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%", height: 32,
                paddingLeft: 30, paddingRight: searchQ ? 28 : 10,
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                color: isDark ? "#E2E8F0" : "#334155",
                backgroundColor: "transparent",
                border: isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #E2E8F0",
                borderRadius: 4,
                outline: "none",
                transition: "border-color 150ms ease, box-shadow 150ms ease",
              }}
              onFocus={(e) => {
                e.target.style.borderColor = "#00775B";
                e.target.style.boxShadow = "0 0 0 3px rgba(0,119,91,0.12)";
              }}
              onBlur={(e) => {
                e.target.style.borderColor = isDark ? "rgba(255,255,255,0.10)" : "#E2E8F0";
                e.target.style.boxShadow = "none";
              }}
            />
            {searchQ && (
              <button
                onClick={() => handleSearch("")}
                style={{
                  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  width: 16, height: 16,
                  border: "none", background: "transparent", cursor: "pointer",
                  color: "#94A3B8",
                  padding: 0,
                }}
              >
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {/* Filter pill */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setFilterOpen((o) => !o); setSortOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                height: 32, padding: "0 12px",
                fontSize: 11, fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: statusFilter !== "all" ? "#00775B" : (isDark ? "#94A3B8" : "#475569"),
                backgroundColor: statusFilter !== "all" ? "rgba(0,119,91,0.06)" : "transparent",
                border: statusFilter !== "all" ? "1px solid rgba(0,119,91,0.25)" : (isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #E2E8F0"),
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              <Filter style={{ width: 13, height: 13 }} />
              {statusFilter !== "all"
                ? (V21_STATUS_CFG[statusFilter]?.label ?? statusFilter)
                : "Filter"}
              {statusFilter !== "all" && (
                <span
                  style={{
                    display: "inline-flex", alignItems: "center", justifyContent: "center",
                    width: 14, height: 14, borderRadius: "50%",
                    backgroundColor: "#00775B", color: "#fff",
                    fontSize: 9, fontWeight: 700,
                  }}
                >1</span>
              )}
            </button>
            {filterOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={() => setFilterOpen(false)}
                />
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0,
                    zIndex: 50, minWidth: 140,
                    backgroundColor: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                  }}
                >
                  {STATUS_OPTIONS.map((s) => (
                    <div
                      key={s}
                      onClick={() => handleStatus(s)}
                      style={{
                        display: "flex", alignItems: "center", justifyContent: "space-between",
                        gap: 8, padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: statusFilter === s ? "rgba(0,119,91,0.05)" : "transparent",
                        fontSize: 11, fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        color: statusFilter === s ? "#00775B" : "#334155",
                      }}
                      onMouseEnter={(e) => { if (statusFilter !== s) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F8FAFC"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = statusFilter === s ? "rgba(0,119,91,0.05)" : "transparent"; }}
                    >
                      <span style={{ textTransform: s === "all" ? "none" : "capitalize" }}>
                        {s === "all" ? "All Statuses" : s}
                      </span>
                      {s !== "all" && <V21StatusPill status={s} />}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Sort pill */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setSortOpen((o) => !o); setFilterOpen(false); }}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                height: 32, padding: "0 12px",
                fontSize: 11, fontWeight: 600,
                fontFamily: "Inter, sans-serif",
                color: sortField !== "timestamp" ? "#00775B" : (isDark ? "#94A3B8" : "#475569"),
                backgroundColor: sortField !== "timestamp" ? "rgba(0,119,91,0.06)" : "transparent",
                border: sortField !== "timestamp" ? "1px solid rgba(0,119,91,0.25)" : (isDark ? "1px solid rgba(255,255,255,0.10)" : "1px solid #E2E8F0"),
                borderRadius: 4,
                cursor: "pointer",
                transition: "all 120ms ease",
              }}
            >
              <SlidersHorizontal style={{ width: 13, height: 13 }} />
              {SORT_OPTIONS.find((o) => o.id === sortField)?.label ?? "Sort"}
            </button>
            {sortOpen && (
              <>
                <div
                  style={{ position: "fixed", inset: 0, zIndex: 40 }}
                  onClick={() => setSortOpen(false)}
                />
                <div
                  style={{
                    position: "absolute", top: "calc(100% + 4px)", left: 0,
                    zIndex: 50, minWidth: 160,
                    backgroundColor: "#fff",
                    border: "1px solid #E2E8F0",
                    borderRadius: 4,
                    boxShadow: "0 8px 24px rgba(0,0,0,0.10)",
                    overflow: "hidden",
                  }}
                >
                  {SORT_OPTIONS.map((opt) => (
                    <div
                      key={opt.id}
                      onClick={() => handleSort(opt.id)}
                      style={{
                        padding: "8px 12px",
                        cursor: "pointer",
                        backgroundColor: sortField === opt.id ? "rgba(0,119,91,0.05)" : "transparent",
                        fontSize: 11, fontWeight: 600,
                        fontFamily: "Inter, sans-serif",
                        color: sortField === opt.id ? "#00775B" : "#334155",
                      }}
                      onMouseEnter={(e) => { if (sortField !== opt.id) (e.currentTarget as HTMLDivElement).style.backgroundColor = "#F8FAFC"; }}
                      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.backgroundColor = sortField === opt.id ? "rgba(0,119,91,0.05)" : "transparent"; }}
                    >
                      {opt.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Row count — right-aligned */}
          <div style={{ marginLeft: "auto", fontSize: 11, color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: "#475569" }}>
              {filteredData.length}
            </span>{" "}
            {filteredData.length === 1 ? "row" : "rows"}
            {searchQ || statusFilter !== "all" ? " matched" : " total"}
          </div>
        </div>

        {/* ── Table card (header + rows + pagination) ── */}
        <div
          style={{
            border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
            borderRadius: 6,
            overflow: "hidden",
            backgroundColor: isDark ? "#0D1B2A" : "#ffffff",
          }}
        >
          {paginatedData.length === 0 ? (
            <div
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 120,
                fontSize: 12, color: "#94A3B8",
                fontFamily: "Inter, sans-serif",
              }}
            >
              No incidents match the current filters.
            </div>
          ) : (
            <V21DataGrid data={paginatedData} />
          )}

          {/* Pagination — Safety Analytics violation log format */}
          {totalPages > 1 && (
            <div
              style={{
                padding: "10px 16px",
                borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #E2E8F0",
                backgroundColor: isDark ? "transparent" : "#FAFAFA",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                position: "relative",
              }}
            >
              {/* PREV */}
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  height: 28, minWidth: 76, padding: "0 10px",
                  borderRadius: 4,
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  fontFamily: "Inter, sans-serif",
                  border: "none", cursor: page === 1 ? "not-allowed" : "pointer",
                  backgroundColor: page === 1 ? (isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0") : "#00775B",
                  color: page === 1 ? (isDark ? "#374151" : "#94A3B8") : "#ffffff",
                  transition: "background-color 120ms ease",
                }}
              >
                <ChevronLeft style={{ width: 13, height: 13 }} />
                PREV
              </button>

              {/* Page numbers */}
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    style={{
                      width: 28, height: 28,
                      borderRadius: 4,
                      fontSize: 12, fontWeight: 700,
                      fontFamily: "'JetBrains Mono', monospace",
                      border: "none", cursor: "pointer",
                      backgroundColor: page === p ? "#00775B" : "#F1F5F9",
                      color: page === p ? "#ffffff" : "#475569",
                      transition: "background-color 120ms ease",
                    }}
                  >
                    {p}
                  </button>
                ))}
              </div>

              {/* NEXT */}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                style={{
                  display: "flex", alignItems: "center", justifyContent: "center", gap: 4,
                  height: 28, minWidth: 76, padding: "0 10px",
                  borderRadius: 4,
                  fontSize: 11, fontWeight: 700,
                  textTransform: "uppercase", letterSpacing: "0.06em",
                  fontFamily: "Inter, sans-serif",
                  border: "none", cursor: page === totalPages ? "not-allowed" : "pointer",
                  backgroundColor: page === totalPages ? (isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0") : "#00775B",
                  color: page === totalPages ? (isDark ? "#374151" : "#94A3B8") : "#ffffff",
                  transition: "background-color 120ms ease",
                }}
              >
                NEXT
                <ChevronRight style={{ width: 13, height: 13 }} />
              </button>

              {/* Showing X–Y of Z — absolute right */}
              <div
                style={{
                  position: "absolute", right: 16,
                  fontSize: 11, color: "#64748B",
                  fontFamily: "Inter, sans-serif",
                }}
              >
                Showing{" "}
                <span style={{ fontWeight: 600, color: "#334155" }}>
                  {(page - 1) * ROWS_PER_PAGE_V21 + 1}–{Math.min(page * ROWS_PER_PAGE_V21, filteredData.length)}
                </span>{" "}
                of{" "}
                <span style={{ fontWeight: 600, color: "#334155" }}>{filteredData.length}</span>{" "}
                incidents
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation>Header: solid <code className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">#E2E8F0</code> · 1px border top+bottom · Inter Bold 11px #64748B</Annotation>
        <Annotation>Severity pills: bright fill, white text, 4px radius, JetBrains Mono 10px Bold</Annotation>
        <Annotation>Ghost search: transparent bg, teal focus glow 3px at rgba(0,119,91,0.12)</Annotation>
        <Annotation>Filter + Sort: 4px sharp corners · active state teal tint + indicator dot</Annotation>
        <Annotation>Hover: 2px teal selection bar · rgba(0,119,91,0.05) row tint</Annotation>
        <Annotation>Pagination: PREV / 1 2 3 / NEXT · Showing X–Y of Z absolute right</Annotation>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  DATA GRID v2.2 — Seamless HUD
//  Frameless transparent header · zebra-glass rows · ghost pills
//  ID severity indicator strip · integrated bottom-border-only toolbar
// ══════════════════════════════════════════════════════════════════════════════

// Severity color palette used for ID strip and ghost pills
const SEVERITY_COLORS: Record<string, string> = {
  critical: "#E7000B",
  warning:  "#EA580C",
  stable:   "#00A63E",
  success:  "#00A63E",
  info:     "#2B7FFF",
  resolved: "#64748B",
  medium:   "#E19A04",
  high:     "#EA580C",
  low:      "#2B7FFF",
};

// Electric palette for dark-mode pill fills (more saturated / neon)
const ELECTRIC_COLORS: Record<string, string> = {
  critical: "#FF3131",
  warning:  "#FF6B35",
  stable:   "#4ADE80",
  success:  "#4ADE80",
  info:     "#60A5FA",
  resolved: "#6B7280",
  medium:   "#FBBF24",
  high:     "#FF6B35",
  low:      "#60A5FA",
};

// v2.2 Status Pill — solid bright fill, Inter font, 4px radius (same grammar as v2.1)
// Dark mode uses electric/neon variants for visibility against dark surfaces
const V22GhostPill = ({ status }: { status: string }) => {
  const isDark = useSandboxTheme() === "dark";
  const key = status.toLowerCase();
  const bg = isDark ? (ELECTRIC_COLORS[key] ?? "#6B7280") : (SEVERITY_COLORS[key] ?? "#64748B");
  const label = V21_STATUS_CFG[key]?.label ?? status;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center",
        padding: "2px 8px",
        borderRadius: 4,
        fontSize: 10, fontWeight: 700,
        letterSpacing: "0.04em", textTransform: "uppercase",
        color: "#ffffff",
        backgroundColor: bg,
        fontFamily: "Inter, sans-serif",
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
};

const V22_COLS = "40px 136px 108px 1fr 148px 72px 80px 148px 68px";

const V22DataGrid = ({ data }: { data: GridRow[] }) => {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const isDark = useSandboxTheme() === "dark";
  // Consistent secondary color — zone / camera / conf / timestamp all share one token
  const sec = isDark ? "#94A3B8" : "#64748B";

  return (
    <div style={{ fontFamily: "inherit", width: "100%" }}>
      {/* Frameless header — 44px (matches row height), transparent, 2px teal bottom anchor */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: V22_COLS,
          alignItems: "center",
          height: 44,
          backgroundColor: "transparent",
          borderBottom: isDark ? "2px solid #00956D" : "2px solid #00775B",
          paddingLeft: 8,
          paddingRight: 8,
        }}
      >
        {["#", "Incident ID", "Status", "Event Type", "Zone", "Camera", "Conf.", "Timestamp", ""].map((h, i) => (
          <div
            key={i}
            style={{
              fontSize: 12,
              fontWeight: 700,
              fontFamily: "Inter, sans-serif",
              color: isDark ? "#94A3B8" : "#1E293B",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
              paddingLeft: i === 0 ? 4 : 8,
              paddingRight: 8,
            }}
          >
            {h}
          </div>
        ))}
      </div>

      {/* Rows — zebra-glass, no dividers, no severity strip */}
      {data.map((row, idx) => {
        const isHovered = hoveredId === row.id;
        const isEven = idx % 2 === 1;

        return (
          <div
            key={row.id}
            onMouseEnter={() => setHoveredId(row.id)}
            onMouseLeave={() => setHoveredId(null)}
            style={{
              display: "grid",
              gridTemplateColumns: V22_COLS,
              alignItems: "center",
              height: 44,
              position: "relative",
              backgroundColor: isHovered
                ? (isDark ? "rgba(0,149,109,0.15)" : "rgba(0,119,91,0.08)")
                : isEven
                ? (isDark ? "rgba(255,255,255,0.04)" : "rgba(0,119,91,0.03)")
                : (isDark ? "transparent" : "#ffffff"),
              boxShadow: isDark && isHovered ? "inset 0 0 24px rgba(0,149,109,0.10)" : "none",
              cursor: "default",
              transition: "background-color 120ms ease, box-shadow 120ms ease",
              paddingLeft: 8,
              paddingRight: 8,
            }}
          >
            {/* Row index */}
            <div
              style={{
                fontSize: 12,
                color: isDark ? "#374151" : "#CBD5E1",
                fontFamily: "Inter, sans-serif",
                paddingLeft: 4,
                textShadow: isHovered ? "0 0 8px rgba(0,119,91,0.35)" : "none",
                transition: "text-shadow 200ms ease",
              }}
            >
              {String(idx + 1).padStart(2, "0")}
            </div>

            {/* Incident ID */}
            <div style={{ paddingLeft: 8, overflow: "hidden" }}>
              <span
                style={{
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                  fontSize: 12,
                  fontWeight: isHovered ? 600 : 500,
                  color: isHovered ? (isDark ? "#F1F5F9" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"),
                  letterSpacing: "0.01em",
                  textShadow: isHovered ? (isDark ? "0 0 12px rgba(0,149,109,0.4)" : "0 0 10px rgba(0,119,91,0.3)") : "none",
                  transition: "font-weight 120ms ease, color 120ms ease, text-shadow 200ms ease",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  display: "block",
                }}
              >
                {row.id}
              </span>
            </div>

            {/* Status — solid-fill pill (same as v2.1 grammar) */}
            <div style={{ paddingLeft: 8 }}>
              <V22GhostPill status={row.status} />
            </div>

            {/* Event Type */}
            <div
              style={{
                paddingLeft: 8, paddingRight: 8,
                fontSize: 12,
                fontFamily: "Inter, sans-serif",
                fontWeight: isHovered ? 500 : 400,
                color: isHovered ? (isDark ? "#F1F5F9" : "#0F172A") : (isDark ? "#CBD5E1" : "#334155"),
                textShadow: isHovered ? (isDark ? "0 0 12px rgba(0,149,109,0.4)" : "0 0 10px rgba(0,119,91,0.25)") : "none",
                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                transition: "color 120ms ease, text-shadow 200ms ease",
              }}
            >
              {row.event}
            </div>

            {/* Zone */}
            <div style={{ paddingLeft: 8, fontSize: 12, fontFamily: "Inter, sans-serif", color: sec, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {row.zone}
            </div>

            {/* Camera */}
            <div style={{ paddingLeft: 8, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: sec }}>
              {row.camera}
            </div>

            {/* Confidence */}
            <div style={{ paddingLeft: 8, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: sec, fontVariantNumeric: "tabular-nums" } as React.CSSProperties}>
              {row.confidence.toFixed(1)}%
            </div>

            {/* Timestamp */}
            <div style={{ paddingLeft: 8, fontSize: 12, fontFamily: "'JetBrains Mono', monospace", color: sec, letterSpacing: "0.01em" }}>
              {row.timestamp}
            </div>

            {/* Actions — glassmorphic, hover-revealed */}
            <div style={{ paddingLeft: 8, display: "flex", alignItems: "center", justifyContent: "flex-end", opacity: isHovered ? 1 : 0, transition: "opacity 150ms ease" }}>
              <div
                style={{
                  display: "flex", alignItems: "center", gap: 2,
                  padding: "3px 6px",
                  backgroundColor: isDark ? "rgba(15,23,42,0.9)" : "rgba(255,255,255,0.85)",
                  backdropFilter: "blur(12px)",
                  border: `1px solid ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.07)"}`,
                  borderRadius: 4,
                  boxShadow: "0 2px 8px rgba(0,0,0,0.07)",
                }}
              >
                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", transition: "color 120ms, background 120ms" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#00775B"; e.currentTarget.style.background = "rgba(0,119,91,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "transparent"; }}>
                  <Eye style={{ width: 13, height: 13 }} />
                </button>
                <button style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 24, height: 24, borderRadius: 3, border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", transition: "color 120ms, background 120ms" }}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "#00A63E"; e.currentTarget.style.background = "rgba(0,166,62,0.08)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "#94A3B8"; e.currentTarget.style.background = "transparent"; }}>
                  <CheckCircle2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const ROWS_PER_PAGE_V22 = 10;

// Unique event types, zones, and statuses derived from the dataset
const ALL_APPS  = [...new Set(V21_GRID_DATA.map((r) => r.event))].sort();
const ALL_ZONES = [...new Set(V21_GRID_DATA.map((r) => r.zone))].sort();

// Severity ordering for sort (lower = more severe)
const SEVERITY_ORDER_V22: Record<string, number> = {
  critical: 0, high: 1, warning: 2, medium: 3, info: 4, low: 4, stable: 5, resolved: 6, success: 6,
};
const ALL_STATUSES_V22 = [...new Set(V21_GRID_DATA.map((r) => r.status))].sort(
  (a, b) => (SEVERITY_ORDER_V22[a] ?? 7) - (SEVERITY_ORDER_V22[b] ?? 7)
);

// 8-way sort options (4 fields × 2 directions)
const SORT_OPTIONS_V22: { key: string; label: string; shortLabel: string }[] = [
  { key: "timestamp-desc",  label: "Time: Newest First",         shortLabel: "Time ↓"  },
  { key: "timestamp-asc",   label: "Time: Oldest First",         shortLabel: "Time ↑"  },
  { key: "confidence-desc", label: "Confidence: High → Low",     shortLabel: "Conf ↓"  },
  { key: "confidence-asc",  label: "Confidence: Low → High",     shortLabel: "Conf ↑"  },
  { key: "id-asc",          label: "ID: A → Z",                  shortLabel: "ID ↑"    },
  { key: "id-desc",         label: "ID: Z → A",                  shortLabel: "ID ↓"    },
  { key: "severity-asc",    label: "Severity: Critical First",   shortLabel: "Sev ↓"   },
  { key: "severity-desc",   label: "Severity: Low First",        shortLabel: "Sev ↑"   },
];

const V2_2Content = () => {
  const [searchQ,       setSearchQ]       = useState("");
  const [statusFilters, setStatusFilters] = useState<Set<string>>(new Set());
  const [zoneFilters,   setZoneFilters]   = useState<Set<string>>(new Set());
  const [appFilters,    setAppFilters]    = useState<Set<string>>(new Set());
  const [page,          setPage]          = useState(1);
  const [sortKey,       setSortKey]       = useState("timestamp-desc");
  const [sortOpen,      setSortOpen]      = useState(false);
  const [severityOpen,  setSeverityOpen]  = useState(false);
  const [appOpen,       setAppOpen]       = useState(false);
  const [zoneOpen,      setZoneOpen]      = useState(false);
  const isDark = useSandboxTheme() === "dark";

  const hasActiveFilters = searchQ !== "" || statusFilters.size > 0 || zoneFilters.size > 0 || appFilters.size > 0;
  const clearFilters = () => { setSearchQ(""); setStatusFilters(new Set()); setZoneFilters(new Set()); setAppFilters(new Set()); setPage(1); };

  // Toggle helpers for multi-select sets
  const toggleStatus = (s: string) => { setStatusFilters(prev => { const n = new Set(prev); n.has(s) ? n.delete(s) : n.add(s); return n; }); setPage(1); };
  const toggleZone   = (z: string) => { setZoneFilters(prev   => { const n = new Set(prev); n.has(z) ? n.delete(z) : n.add(z); return n; }); setPage(1); };
  const toggleApp    = (a: string) => { setAppFilters(prev    => { const n = new Set(prev); n.has(a) ? n.delete(a) : n.add(a); return n; }); setPage(1); };

  // Filter button label: empty → name, 1 → that value, 2+ → "N Type"
  const severityLabel = statusFilters.size === 0 ? "Severity"
    : statusFilters.size === 1 ? (V21_STATUS_CFG[[...statusFilters][0]]?.label ?? [...statusFilters][0])
    : `${statusFilters.size} Severities`;
  const appLabel  = appFilters.size   === 0 ? "Applications"
    : appFilters.size   === 1 ? ([...appFilters][0].length > 16 ? [...appFilters][0].slice(0, 16) + "…" : [...appFilters][0])
    : `${appFilters.size} Apps`;
  const zoneLabel = zoneFilters.size  === 0 ? "Zones"
    : zoneFilters.size  === 1 ? [...zoneFilters][0]
    : `${zoneFilters.size} Zones`;

  const currentSortOpt = SORT_OPTIONS_V22.find(o => o.key === sortKey) ?? SORT_OPTIONS_V22[0];
  const sortIsDefault  = sortKey === "timestamp-desc";

  const filteredData = V21_GRID_DATA
    .filter((row) => {
      if (searchQ && !row.event.toLowerCase().includes(searchQ.toLowerCase()) && !row.id.toLowerCase().includes(searchQ.toLowerCase()) && !row.zone.toLowerCase().includes(searchQ.toLowerCase())) return false;
      if (statusFilters.size > 0 && !statusFilters.has(row.status)) return false;
      if (zoneFilters.size   > 0 && !zoneFilters.has(row.zone))     return false;
      if (appFilters.size    > 0 && !appFilters.has(row.event))     return false;
      return true;
    })
    .sort((a, b) => {
      if (sortKey === "confidence-desc") return b.confidence - a.confidence;
      if (sortKey === "confidence-asc")  return a.confidence - b.confidence;
      if (sortKey === "id-asc")          return a.id.localeCompare(b.id);
      if (sortKey === "id-desc")         return b.id.localeCompare(a.id);
      if (sortKey === "severity-asc")    return (SEVERITY_ORDER_V22[a.status] ?? 7) - (SEVERITY_ORDER_V22[b.status] ?? 7);
      if (sortKey === "severity-desc")   return (SEVERITY_ORDER_V22[b.status] ?? 7) - (SEVERITY_ORDER_V22[a.status] ?? 7);
      if (sortKey === "timestamp-asc")   return a.timestamp.localeCompare(b.timestamp);
      return b.timestamp.localeCompare(a.timestamp); // timestamp-desc (default)
    });

  const totalPages    = Math.ceil(filteredData.length / ROWS_PER_PAGE_V22);
  const paginatedData = filteredData.slice((page - 1) * ROWS_PER_PAGE_V22, page * ROWS_PER_PAGE_V22);

  const handleSearch = (q: string) => { setSearchQ(q); setPage(1); };
  const handleSort   = (key: string) => { setSortKey(key); setSortOpen(false); };

  // Base style for all integrated bottom-border-only toolbar buttons
  const integratedBtnBase: React.CSSProperties = {
    background: "transparent", border: "none",
    borderBottom: "2px solid transparent", borderRadius: 0,
    cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    color: isDark ? "#4B5563" : "#64748B", padding: "4px 2px",
    transition: "color 150ms ease, border-bottom-color 150ms ease",
    whiteSpace: "nowrap",
  };

  // Shared dropdown panel surface
  const dropdownPanel: React.CSSProperties = {
    position: "absolute", top: "calc(100% + 8px)", left: "auto", right: 0, zIndex: 50,
    backgroundColor: isDark ? "#1E293B" : "#fff",
    border: isDark ? "1px solid rgba(255,255,255,0.08)" : "1px solid #E2E8F0",
    borderRadius: 4, boxShadow: "0 8px 24px rgba(0,0,0,0.12)", overflow: "hidden",
  };

  // Radio-style item — sort dropdown (single-select, no checkbox)
  const mkItem = (isActive: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
    backgroundColor: isActive ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent",
    fontSize: 12, fontWeight: 600, fontFamily: "Inter, sans-serif",
    color: isActive ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#CBD5E1" : "#334155"),
    transition: "background-color 100ms ease",
  });
  // Checkbox-style item — multi-select filter dropdowns
  const mkCheckItem = (isActive: boolean): React.CSSProperties => ({
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px", cursor: "pointer",
    backgroundColor: isActive ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent",
    fontSize: 12, fontWeight: 500, fontFamily: "Inter, sans-serif",
    color: isActive ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#CBD5E1" : "#334155"),
    transition: "background-color 100ms ease",
  });
  const hoverIn  = (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => { if (!isActive) (e.currentTarget).style.backgroundColor = isDark ? "rgba(255,255,255,0.04)" : "#F8FAFC"; };
  const hoverOut = (e: React.MouseEvent<HTMLDivElement>, isActive: boolean) => { (e.currentTarget).style.backgroundColor = isActive ? (isDark ? "rgba(0,149,109,0.12)" : "rgba(0,119,91,0.05)") : "transparent"; };

  // Inline checkbox indicator (no hooks, safe to define inline)
  const Checkbox = ({ checked }: { checked: boolean }) => (
    <span style={{ width: 13, height: 13, flexShrink: 0, borderRadius: 2, display: "inline-flex", alignItems: "center", justifyContent: "center", transition: "all 100ms ease", border: `1.5px solid ${checked ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#475569" : "#CBD5E1")}`, backgroundColor: checked ? (isDark ? "#00956D" : "#00775B") : "transparent" }}>
      {checked && <svg width="8" height="6" viewBox="0 0 8 6" fill="none"><path d="M1 3L3 5L7 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>}
    </span>
  );

  return (
    <div className="space-y-8">
      <SectionHeader
        icon={Eye}
        title="Seamless HUD v2.2"
        description="Frameless 44px header, zebra-glass rows, solid-fill severity pills, multi-select filters (Severity · Applications · Zones), bi-directional sort — the table blends into the page."
      />

      {/* Spec chips */}
      <div className="flex flex-wrap gap-2">
        {[
          ["Header",       "44px transparent · 2px teal bottom"],
          ["Typography",   "12px Inter global · Mono IDs & data"],
          ["Zebra",        "rgba(0,119,91,0.03) even rows"],
          ["Hover",        "rgba(0,119,91,0.08) + text glow"],
          ["Pills",        "Bright fill · Inter · 4px radius"],
          ["Filters",      "Multi-select: Severity · Applications · Zones"],
          ["Sort",         "Bi-directional: Time · Conf · ID · Severity"],
          ["Clear",        "Fixed slot · left of filters · hidden when inactive"],
        ].map(([l, v]) => <SpecChip key={l} label={l} value={v} />)}
      </div>

      {/* ── Toolbar + Table ────────────────────────────────────────────── */}
      <div style={{ maxWidth: 1200 }}>

        {/* Toolbar — Search + Sort on left · Severity/Applications/Zones/Clear on right */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 16, paddingBottom: 10 }}>

          {/* Search — width spans 3 table columns: 40 + 136 + 108 = 284px */}
          <div style={{ position: "relative", width: 284, flexShrink: 0 }}>
            <Search style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", width: 13, height: 13, color: isDark ? "#374151" : "#94A3B8", pointerEvents: "none" }} />
            <input
              type="text"
              placeholder="Search incidents, zones…"
              value={searchQ}
              onChange={(e) => handleSearch(e.target.value)}
              style={{
                width: "100%", height: 32, paddingLeft: 22, paddingRight: searchQ ? 24 : 4,
                fontSize: 12, fontFamily: "Inter, sans-serif",
                color: isDark ? "#E2E8F0" : "#1E293B",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isDark ? "2px solid rgba(255,255,255,0.12)" : "2px solid #E2E8F0",
                borderRadius: 0, outline: "none",
                transition: "border-bottom-color 200ms ease, box-shadow 200ms ease",
              }}
              onFocus={(e) => { e.target.style.borderBottomColor = isDark ? "#00956D" : "#00775B"; e.target.style.boxShadow = isDark ? "0 2px 8px rgba(0,149,109,0.25)" : "0 2px 8px rgba(0,119,91,0.18)"; }}
              onBlur={(e)  => { e.target.style.borderBottomColor = isDark ? "rgba(255,255,255,0.12)" : "#E2E8F0"; e.target.style.boxShadow = "none"; }}
            />
            {searchQ && (
              <button onClick={() => handleSearch("")} style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", display: "flex", alignItems: "center", border: "none", background: "transparent", cursor: "pointer", color: "#94A3B8", padding: 0 }}>
                <X style={{ width: 12, height: 12 }} />
              </button>
            )}
          </div>

          {/* Sort — bi-directional, next to search */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => { setSortOpen((o) => !o); setSeverityOpen(false); setAppOpen(false); setZoneOpen(false); }}
              style={{ ...integratedBtnBase, color: !sortIsDefault ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#4B5563" : "#64748B"), borderBottomColor: !sortIsDefault ? (isDark ? "#00956D" : "#00775B") : "transparent" }}
            >
              <SlidersHorizontal style={{ width: 12, height: 12 }} />
              {sortIsDefault ? "Sort" : currentSortOpt.shortLabel}
            </button>
            {sortOpen && (
              <>
                <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSortOpen(false)} />
                <div style={{ ...dropdownPanel, left: 0, right: "auto", minWidth: 220 }}>
                  {SORT_OPTIONS_V22.map((opt) => (
                    <div key={opt.key} onClick={() => handleSort(opt.key)} style={mkItem(sortKey === opt.key)}
                      onMouseEnter={(e) => hoverIn(e, sortKey === opt.key)} onMouseLeave={(e) => hoverOut(e, sortKey === opt.key)}>
                      {opt.label}
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right cluster: Clear (fixed slot, always rendered) + Severity + Applications + Zones */}
          <div style={{ marginLeft: "auto", display: "flex", alignItems: "flex-end", gap: 12 }}>

            {/* Clear Filters — visibility:hidden preserves layout when inactive */}
            <button
              onClick={clearFilters}
              style={{ ...integratedBtnBase, visibility: hasActiveFilters ? "visible" : "hidden", color: isDark ? "#EF4444" : "#E7000B", borderBottomColor: isDark ? "#EF4444" : "#E7000B", gap: 4 }}
            >
              <X style={{ width: 12, height: 12 }} /> Clear
            </button>

            {/* Severity — multi-select, stays open on selection */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setSeverityOpen((o) => !o); setSortOpen(false); setAppOpen(false); setZoneOpen(false); }}
                style={{ ...integratedBtnBase, color: statusFilters.size > 0 ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#4B5563" : "#64748B"), borderBottomColor: statusFilters.size > 0 ? (isDark ? "#00956D" : "#00775B") : "transparent" }}
              >
                <Filter style={{ width: 12, height: 12 }} />
                {severityLabel}
              </button>
              {severityOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setSeverityOpen(false)} />
                  <div style={{ ...dropdownPanel, minWidth: 210 }}>
                    {ALL_STATUSES_V22.map((s) => (
                      <div key={s} onClick={() => toggleStatus(s)} style={mkCheckItem(statusFilters.has(s))}
                        onMouseEnter={(e) => hoverIn(e, statusFilters.has(s))} onMouseLeave={(e) => hoverOut(e, statusFilters.has(s))}>
                        <Checkbox checked={statusFilters.has(s)} />
                        <span style={{ flex: 1 }}>{V21_STATUS_CFG[s]?.label ?? s}</span>
                        <V22GhostPill status={s} />
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Applications — multi-select, stays open on selection */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setAppOpen((o) => !o); setSortOpen(false); setSeverityOpen(false); setZoneOpen(false); }}
                style={{ ...integratedBtnBase, color: appFilters.size > 0 ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#4B5563" : "#64748B"), borderBottomColor: appFilters.size > 0 ? (isDark ? "#00956D" : "#00775B") : "transparent" }}
              >
                <Filter style={{ width: 12, height: 12 }} />
                {appLabel}
              </button>
              {appOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setAppOpen(false)} />
                  <div style={{ ...dropdownPanel, minWidth: 210, maxHeight: 280, overflowY: "auto" }}>
                    {ALL_APPS.map((a) => (
                      <div key={a} onClick={() => toggleApp(a)} style={mkCheckItem(appFilters.has(a))}
                        onMouseEnter={(e) => hoverIn(e, appFilters.has(a))} onMouseLeave={(e) => hoverOut(e, appFilters.has(a))}>
                        <Checkbox checked={appFilters.has(a)} />
                        <span style={{ flex: 1 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Zones — multi-select, stays open on selection */}
            <div style={{ position: "relative" }}>
              <button
                onClick={() => { setZoneOpen((o) => !o); setSortOpen(false); setSeverityOpen(false); setAppOpen(false); }}
                style={{ ...integratedBtnBase, color: zoneFilters.size > 0 ? (isDark ? "#00956D" : "#00775B") : (isDark ? "#4B5563" : "#64748B"), borderBottomColor: zoneFilters.size > 0 ? (isDark ? "#00956D" : "#00775B") : "transparent" }}
              >
                <Filter style={{ width: 12, height: 12 }} />
                {zoneLabel}
              </button>
              {zoneOpen && (
                <>
                  <div style={{ position: "fixed", inset: 0, zIndex: 40 }} onClick={() => setZoneOpen(false)} />
                  <div style={{ ...dropdownPanel, minWidth: 200, maxHeight: 280, overflowY: "auto" }}>
                    {ALL_ZONES.map((z) => (
                      <div key={z} onClick={() => toggleZone(z)} style={mkCheckItem(zoneFilters.has(z))}
                        onMouseEnter={(e) => hoverIn(e, zoneFilters.has(z))} onMouseLeave={(e) => hoverOut(e, zoneFilters.has(z))}>
                        <Checkbox checked={zoneFilters.has(z)} />
                        <span style={{ flex: 1 }}>{z}</span>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>

          </div>
        </div>

        {/* 1px neutral-200 separator — anchors toolbar base to table header */}
        <div style={{ height: 1, backgroundColor: isDark ? "rgba(255,255,255,0.08)" : "#E2E8F0" }} />

        {/* Table */}
        <div style={{ overflow: "hidden", backgroundColor: isDark ? "transparent" : "#ffffff" }}>
          {paginatedData.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 120, fontSize: 12, color: isDark ? "#374151" : "#94A3B8", fontFamily: "Inter, sans-serif" }}>
              No incidents match the current filters.{" "}
              {hasActiveFilters && (
                <button onClick={clearFilters} style={{ marginLeft: 8, color: isDark ? "#00956D" : "#00775B", background: "none", border: "none", cursor: "pointer", fontSize: 12, fontFamily: "Inter, sans-serif", fontWeight: 600 }}>
                  Clear filters
                </button>
              )}
            </div>
          ) : (
            <V22DataGrid data={paginatedData} />
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div style={{ padding: "10px 16px", borderTop: isDark ? "1px solid rgba(255,255,255,0.06)" : "1px solid #F1F5F9", backgroundColor: "transparent", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, position: "relative" }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 28, minWidth: 76, padding: "0 10px", borderRadius: 4, border: "none", cursor: page === 1 ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", backgroundColor: page === 1 ? (isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0") : "#00775B", color: page === 1 ? (isDark ? "#374151" : "#94A3B8") : "#ffffff", transition: "background-color 120ms ease" }}
              >
                <ChevronLeft style={{ width: 13, height: 13 }} /> PREV
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button key={p} onClick={() => setPage(p)}
                    style={{ width: 28, height: 28, borderRadius: 4, border: "none", cursor: "pointer", fontSize: 12, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", backgroundColor: page === p ? "#00775B" : (isDark ? "rgba(255,255,255,0.06)" : "#F1F5F9"), color: page === p ? "#ffffff" : (isDark ? "#475569" : "#475569"), transition: "background-color 120ms ease" }}
                  >{p}</button>
                ))}
              </div>
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 28, minWidth: 76, padding: "0 10px", borderRadius: 4, border: "none", cursor: page === totalPages ? "not-allowed" : "pointer", fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", fontFamily: "Inter, sans-serif", backgroundColor: page === totalPages ? (isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0") : "#00775B", color: page === totalPages ? (isDark ? "#374151" : "#94A3B8") : "#ffffff", transition: "background-color 120ms ease" }}
              >
                NEXT <ChevronRight style={{ width: 13, height: 13 }} />
              </button>
              <div style={{ position: "absolute", right: 16, fontSize: 12, color: isDark ? "#374151" : "#64748B", fontFamily: "Inter, sans-serif" }}>
                Showing <span style={{ fontWeight: 600, color: isDark ? "#6B7280" : "#334155" }}>{(page - 1) * ROWS_PER_PAGE_V22 + 1}–{Math.min(page * ROWS_PER_PAGE_V22, filteredData.length)}</span> of <span style={{ fontWeight: 600, color: isDark ? "#6B7280" : "#334155" }}>{filteredData.length}</span> incidents
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation>Header: 44px transparent · 2px teal bottom border · Inter Bold 12px all-caps · dark: #00956D neon</Annotation>
        <Annotation>Zebra-glass: <code className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">rgba(0,119,91,0.03)</code> even rows · zero horizontal dividers</Annotation>
        <Annotation>Hover: <code className="font-mono text-[10px] bg-neutral-100 px-1.5 py-0.5 rounded">rgba(0,119,91,0.08)</code> bg · text-shadow glow on ID and Event cells</Annotation>
        <Annotation>Pills: bright fill · Inter 10px Bold · 4px radius · electric variants in dark mode (FF3131 / FF6B35 / 4ADE80 / 60A5FA)</Annotation>
        <Annotation>Secondary columns (Zone/Camera/Conf/Timestamp): single unified color token per theme</Annotation>
        <Annotation>Multi-select filters: 0→label, 1→value name, 2+→"N Type" · Clear fixed-slot left of filters (visibility:hidden when inactive)</Annotation>
        <Annotation>Bi-directional sort: Time ↑↓ · Confidence ↑↓ · ID ↑↓ · Severity ↑↓ (8 options) · default "timestamp-desc" shows "Sort"</Annotation>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ACCORDION  ·  Severity tokens & shared controls
// ══════════════════════════════════════════════════════════════════════════════
const ACCORDION_SEVERITIES = {
  default:  { color: "#00775B", bg: "rgba(0,119,91,0.05)",    border: "#E2E8F0",                  label: "Default"  },
  critical: { color: "#E7000B", bg: "rgba(231,0,11,0.05)",    border: "rgba(231,0,11,0.22)",      label: "Critical" },
  high:     { color: "#EA580C", bg: "rgba(234,88,12,0.05)",   border: "rgba(234,88,12,0.22)",     label: "High"     },
  medium:   { color: "#E19A04", bg: "rgba(225,154,4,0.05)",   border: "rgba(225,154,4,0.22)",     label: "Medium"   },
  stable:   { color: "#00A63E", bg: "rgba(0,166,62,0.05)",    border: "rgba(0,166,62,0.22)",      label: "Stable"   },
  info:     { color: "#2B7FFF", bg: "rgba(43,127,255,0.05)",  border: "rgba(43,127,255,0.22)",    label: "Info"     },
  resolved: { color: "#64748B", bg: "rgba(100,116,139,0.05)", border: "rgba(100,116,139,0.22)",   label: "Resolved" },
} as const;
type AccSeverity = keyof typeof ACCORDION_SEVERITIES;

const MiniToggle = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
  <button
    onClick={() => onChange(!checked)}
    className="relative flex-shrink-0 rounded-full transition-colors duration-200"
    style={{ width: 32, height: 18, backgroundColor: checked ? "#00775B" : "#CBD5E1" }}
  >
    <span
      className="absolute top-[2px] w-[14px] h-[14px] bg-white rounded-full shadow-sm transition-all duration-200"
      style={{ left: checked ? "calc(100% - 16px)" : "2px" }}
    />
  </button>
);

const CtrlRow = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex items-center justify-between gap-3">
    <span className="text-[11px] font-medium text-[#475569] leading-tight">{label}</span>
    {children}
  </div>
);

const SegControl = <T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
}) => (
  <div className="flex rounded-[4px] overflow-hidden border border-[#E2E8F0]">
    {options.map((opt) => (
      <button
        key={opt.value}
        onClick={() => onChange(opt.value)}
        className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.04em] transition-all duration-150"
        style={{
          backgroundColor: value === opt.value ? "#00775B" : "transparent",
          color: value === opt.value ? "#fff" : "#94A3B8",
        }}
      >
        {opt.label}
      </button>
    ))}
  </div>
);

const ACC_ITEMS_DATA = [
  { id: "item-1", icon: Zap,  title: "Active Incident Report",  description: "Zone A · Loading Dock · Active",       badgeText: "23 events", badgeNum: "23" },
  { id: "item-2", icon: Eye,  title: "Camera Feed Anomaly",     description: "Zone B · Assembly Line · Live",        badgeText: "3 feeds",   badgeNum: "3"  },
  { id: "item-3", icon: Cpu,  title: "System Health Overview",  description: "All Zones · Pipeline Status · Stable", badgeText: "99.1%",     badgeNum: "✓"  },
];

const ACC_METRIC_CARDS = [
  { label: "Events",   value: "23",    color: "#E7000B", delta: "+12%" },
  { label: "Cameras",  value: "142",   color: "#2B7FFF", delta: "0%"   },
  { label: "Resolved", value: "89",    color: "#00A63E", delta: "+24%" },
  { label: "Warnings", value: "8",     color: "#EA580C", delta: "+2%"  },
  { label: "MTTA",     value: "15m",   color: "#64748B", delta: "-3%"  },
  { label: "Uptime",   value: "99.1%", color: "#00A63E", delta: "+0.4%" },
];

interface AccItemProps {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badgeText: string;
  badgeNum: string;
  isOpen: boolean;
  onToggle: () => void;
  showIcon: boolean;
  showDescription: boolean;
  rightSide: "none" | "text" | "icon";
  contentType: "text" | "cards";
  severity: AccSeverity;
}

const AccItem = ({
  icon: Icon,
  title,
  description,
  badgeText,
  badgeNum,
  isOpen,
  onToggle,
  showIcon,
  showDescription,
  rightSide,
  contentType,
  severity,
}: AccItemProps) => {
  const s = ACCORDION_SEVERITIES[severity];
  return (
    <div
      className="rounded-[6px] overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isOpen ? s.border : "#E2E8F0"}`,
        backgroundColor: isOpen ? s.bg : "#ffffff",
        boxShadow: isOpen ? `0 2px 12px ${s.color}20` : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-3 px-4 py-3.5 text-left transition-all duration-200"
        style={{ borderLeft: `3px solid ${isOpen ? s.color : "transparent"}` }}
      >
        {showIcon && (
          <div
            className="w-7 h-7 rounded-[4px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: isOpen ? `${s.color}18` : "#F1F5F9" }}
          >
            <Icon className="w-3.5 h-3.5 transition-colors duration-200" style={{ color: isOpen ? s.color : "#64748B" }} />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] font-semibold leading-tight truncate transition-colors duration-200"
            style={{ color: isOpen ? s.color : "#0f172a" }}
          >
            {title}
          </div>
          {showDescription && (
            <div className="text-[11px] text-[#94A3B8] mt-0.5 leading-tight truncate">{description}</div>
          )}
        </div>
        {rightSide === "text" && (
          <span
            className="text-[11px] font-mono font-semibold flex-shrink-0 transition-colors duration-200"
            style={{ color: s.color }}
          >
            {badgeText}
          </span>
        )}
        {rightSide === "icon" && (
          <div
            className="min-w-[22px] h-[18px] px-1.5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold transition-all duration-200"
            style={{ backgroundColor: `${s.color}18`, color: s.color }}
          >
            {badgeNum}
          </div>
        )}
        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-all duration-200"
          style={{
            color: isOpen ? s.color : "#94A3B8",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? 240 : 0 }}
      >
        <div className="px-4 pb-4" style={{ borderTop: `1px solid ${s.border}` }}>
          {contentType === "text" ? (
            <p className="text-[12px] text-[#475569] leading-relaxed pt-3">
              Last updated 2 minutes ago. Automated detection flagged anomalous activity across 3 camera
              feeds in Zone A. Response team has been notified and an investigation is underway. All
              affected feeds have been flagged for manual review.
            </p>
          ) : (
            <div className="pt-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.6px] text-[#94A3B8] mb-2.5">
                Related Metrics
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {ACC_METRIC_CARDS.map((card) => (
                  <div
                    key={card.label}
                    className="flex-shrink-0 w-[88px] rounded-[5px] p-2.5"
                    style={{
                      border: `1px solid ${card.color}2A`,
                      backgroundColor: `${card.color}06`,
                    }}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-[0.4px] text-[#94A3B8]">
                      {card.label}
                    </div>
                    <div className="text-[18px] font-bold font-mono mt-1 leading-none" style={{ color: "#0f172a" }}>
                      {card.value}
                    </div>
                    <div className="text-[10px] font-semibold mt-1" style={{ color: card.color }}>
                      {card.delta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AccordionContent = () => {
  const [showIcon, setShowIcon] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [rightSide, setRightSide] = useState<"none" | "text" | "icon">("text");
  const [contentType, setContentType] = useState<"text" | "cards">("text");
  const [severity, setSeverity] = useState<AccSeverity>("default");
  const [openItems, setOpenItems] = useState<string[]>(["item-1"]);

  const toggleItem = (id: string) =>
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );

  const sharedProps = { showIcon, showDescription, rightSide, contentType, severity };

  return (
    <div className="space-y-10">
      <SectionHeader
        icon={Layers}
        title="Accordion Component"
        description="Collapsible content sections with icon, description, secondary metadata, and full severity color states. One component — configure every element via the controls panel."
      />

      {/* Live preview + controls */}
      <div className="rounded-[8px] border border-[#E2E8F0] overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#CBD5E1]">
              Component Sandbox
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00775B]" />
            <span className="text-[9px] font-mono text-[#CBD5E1] tracking-[0.04em]">Accordion v1.0</span>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-[3px]"
            style={{
              backgroundColor: `${ACCORDION_SEVERITIES[severity].color}18`,
              color: ACCORDION_SEVERITIES[severity].color,
            }}
          >
            {ACCORDION_SEVERITIES[severity].label}
          </span>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Accordion preview */}
          <div className="flex-1 min-w-0 p-6 space-y-2 bg-[#F8FAFC]">
            {ACC_ITEMS_DATA.map((item) => (
              <AccItem
                key={item.id}
                {...item}
                {...sharedProps}
                isOpen={openItems.includes(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>

          {/* Controls panel */}
          <div className="w-[272px] flex-shrink-0 border-l border-[#E2E8F0] bg-white p-4 space-y-5 overflow-y-auto">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">
                Elements
              </div>
              <div className="space-y-3">
                <CtrlRow label="Left Icon">
                  <MiniToggle checked={showIcon} onChange={setShowIcon} />
                </CtrlRow>
                <CtrlRow label="Description">
                  <MiniToggle checked={showDescription} onChange={setShowDescription} />
                </CtrlRow>
                <CtrlRow label="Right Side">
                  <SegControl
                    options={[
                      { value: "none" as const, label: "—" },
                      { value: "text" as const, label: "Txt" },
                      { value: "icon" as const, label: "Ico" },
                    ]}
                    value={rightSide}
                    onChange={setRightSide}
                  />
                </CtrlRow>
              </div>
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">
                Content
              </div>
              <SegControl
                options={[
                  { value: "text" as const, label: "Text" },
                  { value: "cards" as const, label: "Cards" },
                ]}
                value={contentType}
                onChange={setContentType}
              />
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">
                Severity
              </div>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.entries(ACCORDION_SEVERITIES) as [AccSeverity, typeof ACCORDION_SEVERITIES[AccSeverity]][]).map(
                  ([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSeverity(key)}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-[4px] transition-all duration-150"
                      style={{
                        backgroundColor: severity === key ? `${val.color}14` : "transparent",
                        border: severity === key ? `1px solid ${val.color}40` : "1px solid transparent",
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: val.color }} />
                      <span
                        className="text-[7.5px] font-bold uppercase leading-none"
                        style={{ color: severity === key ? val.color : "#94A3B8" }}
                      >
                        {val.label.slice(0, 4)}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Severity color state matrix */}
      <div>
        <SectionHeader
          icon={Eye}
          title="Severity Color States"
          description="All 7 severity variants shown in collapsed and expanded states. Trigger stripe, background tint, icon fill, and title color all respond to severity."
        />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {(Object.entries(ACCORDION_SEVERITIES) as [AccSeverity, typeof ACCORDION_SEVERITIES[AccSeverity]][]).map(
            ([key, val]) => (
              <div key={key}>
                <div
                  className="text-[9px] font-bold uppercase tracking-[0.5px] mb-2"
                  style={{ color: val.color }}
                >
                  {val.label}
                </div>
                {/* Collapsed state */}
                <div
                  className="rounded-[6px] mb-1.5"
                  style={{
                    border: "1px solid #E2E8F0",
                    backgroundColor: "#ffffff",
                    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                  }}
                >
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5"
                    style={{ borderLeft: "3px solid transparent" }}
                  >
                    <div className="w-6 h-6 rounded-[3px] flex items-center justify-center bg-[#F1F5F9]">
                      <Zap className="w-3 h-3 text-[#64748B]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold text-[#0f172a] truncate">Incident Report</div>
                      <div className="text-[10px] text-[#94A3B8]">Collapsed</div>
                    </div>
                    <ChevronDown className="w-3.5 h-3.5 text-[#94A3B8]" />
                  </div>
                </div>
                {/* Expanded state */}
                <div
                  className="rounded-[6px]"
                  style={{
                    border: `1px solid ${val.border}`,
                    backgroundColor: val.bg,
                    boxShadow: `0 2px 10px ${val.color}18`,
                  }}
                >
                  <div
                    className="flex items-center gap-2.5 px-3 py-2.5"
                    style={{ borderLeft: `3px solid ${val.color}` }}
                  >
                    <div
                      className="w-6 h-6 rounded-[3px] flex items-center justify-center"
                      style={{ backgroundColor: `${val.color}18` }}
                    >
                      <Zap className="w-3 h-3" style={{ color: val.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-semibold truncate" style={{ color: val.color }}>
                        Incident Report
                      </div>
                      <div className="text-[10px] text-[#94A3B8]">Expanded</div>
                    </div>
                    <ChevronDown
                      className="w-3.5 h-3.5"
                      style={{ color: val.color, transform: "rotate(180deg)" }}
                    />
                  </div>
                  <div className="px-3 pb-3" style={{ borderTop: `1px solid ${val.border}` }}>
                    <p className="text-[10px] text-[#475569] leading-relaxed pt-2">
                      Detection active · 3 feeds flagged · Response team notified.
                    </p>
                  </div>
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Anatomy & specs */}
      <div>
        <SectionHeader
          icon={BookOpen}
          title="Anatomy & Specifications"
          description="Component dimensions, typography rules, and design token references."
        />
        <div className="flex flex-wrap gap-2">
          <SpecChip label="Trigger height"  value="48px" />
          <SpecChip label="Border radius"   value="6px" />
          <SpecChip label="Left stripe"     value="3px solid · color on open" />
          <SpecChip label="Icon box"        value="28×28px · 4px radius" />
          <SpecChip label="Title"           value="13px Inter 600" />
          <SpecChip label="Description"     value="11px Inter 400 · #94A3B8" />
          <SpecChip label="Secondary text"  value="11px JetBrains Mono 600" />
          <SpecChip label="Secondary icon"  value="18px pill · color/10 bg" />
          <SpecChip label="Chevron"         value="16px · rotate 180° on open" />
          <SpecChip label="Content pad"     value="16px H · 12–16px V" />
          <SpecChip label="Open shadow"     value="0 2px 12px color/12" />
          <SpecChip label="Card strip"      value="88px min · 12px gap · scroll" />
          <SpecChip label="Transition"      value="300ms ease-in-out" />
        </div>
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation>Trigger: 3px left color stripe on open · transparent collapsed · 200ms transition</Annotation>
        <Annotation>Background: severity tint 5% opacity open · white collapsed · box-shadow 12% color</Annotation>
        <Annotation>Icon: colored bg 10% opacity open · neutral #F1F5F9 bg with #64748B icon collapsed</Annotation>
        <Annotation>Title: severity accent color open · #0F172A collapsed · 200ms transition</Annotation>
        <Annotation>Content: free text 12px Inter or horizontal card strip (88px cards, overflow-x scroll)</Annotation>
        <Annotation>Chevron: rotates 180° on open · severity color open · #94A3B8 collapsed</Annotation>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ACCORDION v1.1  ·  Refined White
//  Key changes from v1.0:
//  — Default is pure white, no primary tint
//  — Hover state on collapsed trigger
//  — Content indented to align with title column
//  — Pill badges (tinted open, neutral closed)
//  — Dashed separator for default state
//  — Font-weight 500→700 on open
//  — Larger trigger (52px) and border-radius (8px)
// ══════════════════════════════════════════════════════════════════════════════
const ACC_SEV_V11 = {
  default:  { color: "#475569", titleOpen: "#0F172A", bg: "#ffffff",               border: "#E2E8F0",                  stripe: "#CBD5E1",  shadow: "0 4px 20px rgba(0,0,0,0.08)",       iconBg: "#F1F5F9",             iconColor: "#475569", badgeBg: "#F1F5F9",             badgeColor: "#64748B", label: "Default"  },
  critical: { color: "#E7000B", titleOpen: "#E7000B", bg: "rgba(231,0,11,0.04)",   border: "rgba(231,0,11,0.20)",      stripe: "#E7000B",  shadow: "0 4px 20px rgba(231,0,11,0.12)",    iconBg: "rgba(231,0,11,0.10)", iconColor: "#E7000B", badgeBg: "rgba(231,0,11,0.08)", badgeColor: "#E7000B", label: "Critical" },
  high:     { color: "#EA580C", titleOpen: "#EA580C", bg: "rgba(234,88,12,0.04)",  border: "rgba(234,88,12,0.20)",     stripe: "#EA580C",  shadow: "0 4px 20px rgba(234,88,12,0.12)",   iconBg: "rgba(234,88,12,0.10)",iconColor: "#EA580C", badgeBg: "rgba(234,88,12,0.08)",badgeColor: "#EA580C", label: "High"     },
  medium:   { color: "#E19A04", titleOpen: "#B37A00", bg: "rgba(225,154,4,0.04)",  border: "rgba(225,154,4,0.20)",     stripe: "#E19A04",  shadow: "0 4px 20px rgba(225,154,4,0.12)",   iconBg: "rgba(225,154,4,0.10)",iconColor: "#E19A04", badgeBg: "rgba(225,154,4,0.08)",badgeColor: "#B37A00", label: "Medium"   },
  stable:   { color: "#00A63E", titleOpen: "#00A63E", bg: "rgba(0,166,62,0.04)",   border: "rgba(0,166,62,0.20)",      stripe: "#00A63E",  shadow: "0 4px 20px rgba(0,166,62,0.12)",    iconBg: "rgba(0,166,62,0.10)", iconColor: "#00A63E", badgeBg: "rgba(0,166,62,0.08)", badgeColor: "#00A63E", label: "Stable"   },
  info:     { color: "#2B7FFF", titleOpen: "#2B7FFF", bg: "rgba(43,127,255,0.04)", border: "rgba(43,127,255,0.20)",    stripe: "#2B7FFF",  shadow: "0 4px 20px rgba(43,127,255,0.12)",  iconBg: "rgba(43,127,255,0.10)",iconColor: "#2B7FFF",badgeBg: "rgba(43,127,255,0.08)",badgeColor: "#2B7FFF", label: "Info"     },
  resolved: { color: "#64748B", titleOpen: "#475569", bg: "rgba(100,116,139,0.04)",border: "rgba(100,116,139,0.20)",   stripe: "#94A3B8",  shadow: "0 4px 20px rgba(100,116,139,0.10)", iconBg: "rgba(100,116,139,0.10)",iconColor: "#64748B",badgeBg: "rgba(100,116,139,0.08)",badgeColor: "#64748B",label: "Resolved" },
} as const;
type AccSeverityV11 = keyof typeof ACC_SEV_V11;

interface AccItemV11Props {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badgeText: string;
  badgeNum: string;
  isOpen: boolean;
  onToggle: () => void;
  showIcon: boolean;
  showDescription: boolean;
  rightSide: "none" | "text" | "icon";
  contentType: "text" | "cards";
  severity: AccSeverityV11;
}

const AccItemV11 = ({
  icon: Icon,
  title,
  description,
  badgeText,
  badgeNum,
  isOpen,
  onToggle,
  showIcon,
  showDescription,
  rightSide,
  contentType,
  severity,
}: AccItemV11Props) => {
  const [hovered, setHovered] = useState(false);
  const s = ACC_SEV_V11[severity];
  const isDefault = severity === "default";

  return (
    <div
      className="rounded-[8px] overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isOpen ? s.border : "#E2E8F0"}`,
        backgroundColor: isOpen ? s.bg : "#ffffff",
        boxShadow: isOpen ? s.shadow : hovered ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Trigger */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-3 px-4 text-left outline-none transition-all duration-200"
        style={{
          height: 52,
          borderLeft: `3px solid ${isOpen ? s.stripe : "transparent"}`,
          backgroundColor: !isOpen && hovered ? "#F8FAFC" : "transparent",
        }}
      >
        {showIcon && (
          <div
            className="w-8 h-8 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: isOpen ? s.iconBg : "#F8FAFC" }}
          >
            <Icon
              className="w-3.5 h-3.5 transition-colors duration-200"
              style={{ color: isOpen ? s.iconColor : "#94A3B8" }}
            />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div
            className="text-[13px] leading-tight truncate transition-all duration-200"
            style={{ color: isOpen ? s.titleOpen : "#0F172A", fontWeight: isOpen ? 700 : 500 }}
          >
            {title}
          </div>
          {showDescription && (
            <div className="text-[11px] mt-0.5 leading-tight truncate" style={{ color: "#94A3B8" }}>
              {description}
            </div>
          )}
        </div>

        {rightSide === "text" && (
          <div
            className="flex-shrink-0 px-2 py-0.5 rounded-full text-[11px] font-mono font-semibold transition-all duration-200"
            style={{
              backgroundColor: isOpen ? s.badgeBg : "#F1F5F9",
              color: isOpen ? s.badgeColor : "#94A3B8",
            }}
          >
            {badgeText}
          </div>
        )}
        {rightSide === "icon" && (
          <div
            className="min-w-[22px] h-[18px] px-1.5 rounded-full flex items-center justify-center flex-shrink-0 text-[9px] font-bold transition-all duration-200"
            style={{
              backgroundColor: isOpen ? s.badgeBg : "#F1F5F9",
              color: isOpen ? s.badgeColor : "#94A3B8",
            }}
          >
            {badgeNum}
          </div>
        )}

        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-all duration-200"
          style={{
            color: isOpen ? (isDefault ? "#475569" : s.stripe) : "#CBD5E1",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? 280 : 0 }}
      >
        <div
          className="pb-4 pr-5"
          style={{
            borderTop: `1px ${isDefault ? "dashed" : "solid"} ${s.border}`,
            paddingLeft: showIcon ? 60 : 20,
          }}
        >
          {contentType === "text" ? (
            <p className="text-[12px] leading-relaxed pt-3" style={{ color: "#475569" }}>
              Last updated 2 minutes ago. Automated detection flagged anomalous activity across 3 camera
              feeds in Zone A. Response team has been notified and an investigation is underway. All
              affected feeds have been flagged for manual review.
            </p>
          ) : (
            <div className="pt-3">
              <div className="text-[9px] font-bold uppercase tracking-[0.6px] mb-2.5" style={{ color: "#94A3B8" }}>
                Related Metrics
              </div>
              <div className="flex gap-3 overflow-x-auto pb-1">
                {ACC_METRIC_CARDS.map((card) => (
                  <div
                    key={card.label}
                    className="flex-shrink-0 w-[96px] rounded-[6px] p-3 bg-white"
                    style={{
                      border: `1px solid ${card.color}22`,
                      boxShadow: `0 1px 4px ${card.color}10`,
                    }}
                  >
                    <div className="text-[9px] font-bold uppercase tracking-[0.4px]" style={{ color: "#94A3B8" }}>
                      {card.label}
                    </div>
                    <div className="text-[20px] font-bold font-mono mt-1 leading-none" style={{ color: "#0f172a" }}>
                      {card.value}
                    </div>
                    <div
                      className="inline-flex mt-1.5 px-1.5 py-0.5 rounded-full text-[9px] font-bold"
                      style={{ backgroundColor: `${card.color}12`, color: card.color }}
                    >
                      {card.delta}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const AccordionContentV11 = () => {
  const [showIcon, setShowIcon] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [rightSide, setRightSide] = useState<"none" | "text" | "icon">("text");
  const [contentType, setContentType] = useState<"text" | "cards">("text");
  const [severity, setSeverity] = useState<AccSeverityV11>("default");
  const [openItems, setOpenItems] = useState<string[]>(["item-1"]);

  const toggleItem = (id: string) =>
    setOpenItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const sharedProps = { showIcon, showDescription, rightSide, contentType, severity };
  const s = ACC_SEV_V11[severity];

  return (
    <div className="space-y-10">
      <SectionHeader
        icon={Layers}
        title="Accordion v1.1 · Refined White"
        description="Pure white default with no primary color tinting. Hover states, indented content, and pill badges distinguish open vs. closed states cleanly."
      />

      {/* Change banner */}
      <div
        className="rounded-[6px] px-4 py-3 flex items-center gap-2 flex-wrap"
        style={{ backgroundColor: "#F0F9FF", border: "1px solid #BAE6FD" }}
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.6px] text-[#0369A1] mr-1">v1.1 · Changes</span>
        {[
          "White default — no tint",
          "Hover on trigger",
          "Content indent to title",
          "Pill badge (open/closed)",
          "Dashed separator default",
          "500 → 700 weight on open",
          "52px trigger · 8px radius",
        ].map((tag) => (
          <span key={tag} className="text-[10px] font-medium px-2 py-0.5 rounded-[3px] bg-white border border-[#BAE6FD] text-[#0369A1]">
            {tag}
          </span>
        ))}
      </div>

      {/* Live preview + controls */}
      <div className="rounded-[8px] border border-[#E2E8F0] overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#CBD5E1]">Component Sandbox</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00775B]" />
            <span className="text-[9px] font-mono text-[#CBD5E1] tracking-[0.04em]">Accordion v1.1</span>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-[3px]"
            style={{
              backgroundColor: severity === "default" ? "#F1F5F9" : `${s.color}18`,
              color: severity === "default" ? "#475569" : s.color,
            }}
          >
            {s.label}
          </span>
        </div>

        <div className="flex">
          <div className="flex-1 min-w-0 p-6 space-y-2.5 bg-[#F8FAFC]">
            {ACC_ITEMS_DATA.map((item) => (
              <AccItemV11
                key={item.id}
                {...item}
                {...sharedProps}
                isOpen={openItems.includes(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>

          <div className="w-[272px] flex-shrink-0 border-l border-[#E2E8F0] bg-white p-4 space-y-5 overflow-y-auto">
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">Elements</div>
              <div className="space-y-3">
                <CtrlRow label="Left Icon">
                  <MiniToggle checked={showIcon} onChange={setShowIcon} />
                </CtrlRow>
                <CtrlRow label="Description">
                  <MiniToggle checked={showDescription} onChange={setShowDescription} />
                </CtrlRow>
                <CtrlRow label="Right Side">
                  <SegControl
                    options={[
                      { value: "none" as const, label: "—" },
                      { value: "text" as const, label: "Txt" },
                      { value: "icon" as const, label: "Ico" },
                    ]}
                    value={rightSide}
                    onChange={setRightSide}
                  />
                </CtrlRow>
              </div>
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">Content</div>
              <SegControl
                options={[
                  { value: "text" as const, label: "Text" },
                  { value: "cards" as const, label: "Cards" },
                ]}
                value={contentType}
                onChange={setContentType}
              />
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">Severity</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.entries(ACC_SEV_V11) as [AccSeverityV11, typeof ACC_SEV_V11[AccSeverityV11]][]).map(
                  ([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSeverity(key)}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-[4px] transition-all duration-150"
                      style={{
                        backgroundColor: severity === key ? (key === "default" ? "#F1F5F9" : `${val.color}14`) : "transparent",
                        border: severity === key ? (key === "default" ? "1px solid #E2E8F0" : `1px solid ${val.color}40`) : "1px solid transparent",
                      }}
                    >
                      <div
                        className="w-3.5 h-3.5 rounded-full"
                        style={{ backgroundColor: key === "default" ? "#CBD5E1" : val.color }}
                      />
                      <span
                        className="text-[7.5px] font-bold uppercase leading-none"
                        style={{ color: severity === key ? (key === "default" ? "#475569" : val.color) : "#94A3B8" }}
                      >
                        {val.label.slice(0, 4)}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Severity state matrix */}
      <div>
        <SectionHeader
          icon={Eye}
          title="Severity Color States"
          description="Default stays white and neutral — no primary color. Severity states are fully colored. Note the dashed separator exclusive to the default state."
        />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {(Object.entries(ACC_SEV_V11) as [AccSeverityV11, typeof ACC_SEV_V11[AccSeverityV11]][]).map(
            ([key, val]) => {
              const isDef = key === "default";
              return (
                <div key={key}>
                  <div
                    className="text-[9px] font-bold uppercase tracking-[0.5px] mb-2"
                    style={{ color: isDef ? "#64748B" : val.color }}
                  >
                    {val.label}
                  </div>
                  {/* Collapsed */}
                  <div
                    className="rounded-[8px] mb-1.5"
                    style={{ border: "1px solid #E2E8F0", backgroundColor: "#ffffff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center gap-2.5 px-3 py-3" style={{ borderLeft: "3px solid transparent" }}>
                      <div className="w-7 h-7 rounded-[4px] flex items-center justify-center bg-[#F8FAFC]">
                        <Zap className="w-3 h-3 text-[#94A3B8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-medium text-[#0f172a] truncate">Incident Report</div>
                        <div className="text-[10px] text-[#94A3B8]">Collapsed</div>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#CBD5E1]" />
                    </div>
                  </div>
                  {/* Expanded */}
                  <div
                    className="rounded-[8px]"
                    style={{ border: `1px solid ${val.border}`, backgroundColor: val.bg, boxShadow: val.shadow }}
                  >
                    <div
                      className="flex items-center gap-2.5 px-3 py-3"
                      style={{ borderLeft: `3px solid ${val.stripe}` }}
                    >
                      <div
                        className="w-7 h-7 rounded-[4px] flex items-center justify-center"
                        style={{ backgroundColor: val.iconBg }}
                      >
                        <Zap className="w-3 h-3" style={{ color: val.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[11px] font-bold truncate" style={{ color: val.titleOpen }}>
                          Incident Report
                        </div>
                        <div className="text-[10px] text-[#94A3B8]">Expanded</div>
                      </div>
                      <ChevronDown
                        className="w-3.5 h-3.5"
                        style={{ color: isDef ? "#475569" : val.stripe, transform: "rotate(180deg)" }}
                      />
                    </div>
                    <div
                      className="px-3 pb-3"
                      style={{ borderTop: `1px ${isDef ? "dashed" : "solid"} ${val.border}` }}
                    >
                      <p className="text-[10px] leading-relaxed pt-2" style={{ color: "#475569" }}>
                        Detection active · 3 feeds flagged · Response team notified.
                      </p>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Anatomy & specs */}
      <div>
        <SectionHeader
          icon={BookOpen}
          title="v1.1 Anatomy & Specifications"
          description="Updated dimensions and behaviour changes from v1.0."
        />
        <div className="flex flex-wrap gap-2">
          <SpecChip label="Trigger height"   value="52px (+4px from v1.0)" />
          <SpecChip label="Border radius"    value="8px (+2px from v1.0)" />
          <SpecChip label="Default bg"       value="#ffffff · no tint" />
          <SpecChip label="Default stripe"   value="#CBD5E1 · 3px solid" />
          <SpecChip label="Default shadow"   value="0 4px 20px rgba(0,0,0,0.08)" />
          <SpecChip label="Hover bg"         value="#F8FAFC · collapsed trigger only" />
          <SpecChip label="Title open"       value="13px Inter 700 · severity or #0F172A" />
          <SpecChip label="Title closed"     value="13px Inter 500 · #0F172A" />
          <SpecChip label="Separator"        value="dashed for default · solid for severity" />
          <SpecChip label="Content indent"   value="60px icon visible · 20px without" />
          <SpecChip label="Badge"            value="pill · tinted bg open · #F1F5F9 closed" />
          <SpecChip label="Card width"       value="96px (+8px from v1.0)" />
        </div>
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation>Default: white bg open · no tint · neutral gray stripe #CBD5E1 · #0F172A title</Annotation>
        <Annotation>Hover: #F8FAFC on collapsed trigger only · no hover effect when item is open</Annotation>
        <Annotation>Title weight: 500 collapsed → 700 open · default title stays #0F172A (not recolored)</Annotation>
        <Annotation>Right badge: pill · severity-tinted bg open · neutral #F1F5F9 bg collapsed</Annotation>
        <Annotation>Separator: dashed border for default state · solid border for all severity states</Annotation>
        <Annotation>Content: indented 60px when icon visible · 20px without · aligns to title text column</Annotation>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  ACCORDION v1.2  ·  Enhanced White
//  New in v1.2 vs v1.1:
//  — Caps-title toggle (ALL CAPS variant with tighter tracking)
//  — Zone Summary Cards in content area (scrollable 2×2 status grid per zone)
//  — Summary header row (label + count pill) above card strip
//  — Inherits v1.1 white surface, dashed separator, pill badge, 52px trigger
// ══════════════════════════════════════════════════════════════════════════════

// ─── Zone status icon config ──────────────────────────────────────────────────
const ZONE_STATUS_CFG = {
  critical: { Icon: AlertCircle,   color: "#E7000B", bg: "rgba(231,0,11,0.10)"   },
  warning:  { Icon: AlertTriangle, color: "#EA580C", bg: "rgba(234,88,12,0.10)"  },
  stable:   { Icon: CheckCircle2,  color: "#00A63E", bg: "rgba(0,166,62,0.10)"   },
  info:     { Icon: Info,          color: "#2B7FFF", bg: "rgba(43,127,255,0.10)" },
} as const;
type ZoneStatus = keyof typeof ZONE_STATUS_CFG;

// ─── Zone data ────────────────────────────────────────────────────────────────
const ZONES_V12 = [
  {
    id: "z-a", label: "Zone A", sub: "Loading Dock", headerColor: "#E7000B",
    comps: [
      { name: "Cameras", status: "critical" as ZoneStatus },
      { name: "Gateway", status: "warning"  as ZoneStatus },
      { name: "Compute", status: "stable"   as ZoneStatus },
      { name: "ML",      status: "critical" as ZoneStatus },
    ],
    note: "Cameras, ML down",
  },
  {
    id: "z-b", label: "Zone B", sub: "Assembly Line", headerColor: "#EA580C",
    comps: [
      { name: "Cameras", status: "critical" as ZoneStatus },
      { name: "Gateway", status: "warning"  as ZoneStatus },
      { name: "Compute", status: "stable"   as ZoneStatus },
      { name: "ML",      status: "stable"   as ZoneStatus },
    ],
    note: "1 active alert",
  },
  {
    id: "z-c", label: "Zone C", sub: "Warehouse", headerColor: "#00A63E",
    comps: [
      { name: "Cameras", status: "stable" as ZoneStatus },
      { name: "Gateway", status: "stable" as ZoneStatus },
      { name: "Compute", status: "stable" as ZoneStatus },
      { name: "ML",      status: "stable" as ZoneStatus },
    ],
    note: "All systems nominal",
  },
  {
    id: "z-d", label: "Zone D", sub: "North Perimeter", headerColor: "#E19A04",
    comps: [
      { name: "Cameras", status: "warning" as ZoneStatus },
      { name: "Gateway", status: "stable"  as ZoneStatus },
      { name: "Compute", status: "stable"  as ZoneStatus },
      { name: "ML",      status: "warning" as ZoneStatus },
    ],
    note: "Degraded performance",
  },
  {
    id: "z-e", label: "Zone E", sub: "Main Entrance", headerColor: "#2B7FFF",
    comps: [
      { name: "Cameras", status: "stable" as ZoneStatus },
      { name: "Gateway", status: "stable" as ZoneStatus },
      { name: "Compute", status: "info"   as ZoneStatus },
      { name: "ML",      status: "stable" as ZoneStatus },
    ],
    note: "Update pending",
  },
];

// ─── Zone summary card ────────────────────────────────────────────────────────
const ZoneSummaryCard = ({ zone }: { zone: typeof ZONES_V12[0] }) => (
  <div
    className="flex-shrink-0 w-[168px] rounded-[6px] overflow-hidden"
    style={{ border: "1px solid #E2E8F0", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
  >
    {/* Coloured header */}
    <div className="px-3 py-2" style={{ backgroundColor: zone.headerColor }}>
      <div className="text-[11px] font-bold text-white leading-tight">{zone.label}</div>
      <div className="text-[9px] text-white/75 leading-tight mt-[1px]">{zone.sub}</div>
    </div>
    {/* 2 × 2 status grid */}
    <div className="grid grid-cols-2 gap-[3px] p-[5px] bg-[#F8FAFC]">
      {zone.comps.map((comp) => {
        const st = ZONE_STATUS_CFG[comp.status];
        return (
          <div
            key={comp.name}
            className="flex flex-col items-center justify-center gap-[3px] py-[7px] rounded-[4px]"
            style={{ backgroundColor: st.bg }}
          >
            <st.Icon className="w-[13px] h-[13px]" style={{ color: st.color }} />
            <span className="text-[8px] font-semibold leading-none" style={{ color: "#64748B" }}>
              {comp.name}
            </span>
          </div>
        );
      })}
    </div>
    {/* Footer note */}
    <div className="px-3 py-2" style={{ borderTop: "1px solid #F1F5F9" }}>
      <p className="text-[9px] leading-snug" style={{ color: "#94A3B8" }}>{zone.note}</p>
    </div>
  </div>
);

// ─── V1.2 accordion item ──────────────────────────────────────────────────────
interface AccItemV12Props {
  id: string;
  icon: React.ElementType;
  title: string;
  description: string;
  badgeText: string;
  badgeNum: string;
  isOpen: boolean;
  onToggle: () => void;
  showIcon: boolean;
  showDescription: boolean;
  rightSide: "none" | "text" | "icon";
  contentType: "text" | "cards";
  severity: AccSeverityV11;
  capsTitle: boolean;
}

const AccItemV12 = ({
  icon: Icon,
  title,
  description,
  badgeText,
  badgeNum,
  isOpen,
  onToggle,
  showIcon,
  showDescription,
  rightSide,
  contentType,
  severity,
  capsTitle,
}: AccItemV12Props) => {
  const [hovered, setHovered] = useState(false);
  const s = ACC_SEV_V11[severity];
  const isDefault = severity === "default";

  return (
    <div
      className="rounded-[8px] overflow-hidden transition-all duration-200"
      style={{
        border: `1px solid ${isOpen ? s.border : "#E2E8F0"}`,
        borderLeft: `3px solid ${s.stripe}`,
        backgroundColor: isOpen ? s.bg : "#ffffff",
        boxShadow: isOpen ? s.shadow : hovered ? "0 2px 8px rgba(0,0,0,0.06)" : "0 1px 3px rgba(0,0,0,0.04)",
      }}
    >
      {/* Trigger */}
      <button
        onClick={onToggle}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className="w-full flex items-center gap-3 px-4 text-left outline-none transition-all duration-200"
        style={{
          height: 52,
          backgroundColor: !isOpen && hovered ? "#F8FAFC" : "transparent",
        }}
      >
        {showIcon && (
          <div
            className="w-8 h-8 rounded-[5px] flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{ backgroundColor: isOpen ? s.iconBg : "#F8FAFC" }}
          >
            <Icon className="w-3.5 h-3.5 transition-colors duration-200" style={{ color: isOpen ? s.iconColor : "#94A3B8" }} />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div
            className="leading-tight truncate transition-all duration-200"
            style={{
              color: isOpen ? s.titleOpen : "#0F172A",
              fontWeight: isOpen ? 700 : capsTitle ? 600 : 500,
              fontSize: capsTitle ? 11 : 13,
              textTransform: capsTitle ? "uppercase" : "none",
              letterSpacing: capsTitle ? "0.07em" : "normal",
            }}
          >
            {title}
          </div>
          {showDescription && (
            <div className="text-[11px] mt-0.5 leading-tight truncate" style={{ color: "#94A3B8" }}>
              {description}
            </div>
          )}
        </div>

        {rightSide === "text" && (
          <div
            className="flex-shrink-0 px-2.5 py-1 rounded-[3px] text-[10px] font-mono font-semibold transition-all duration-200"
            style={{
              backgroundColor: isOpen ? s.badgeBg : "#F1F5F9",
              color: isOpen ? s.badgeColor : "#94A3B8",
              border: `1px solid ${isOpen && !isDefault ? s.border : "#E2E8F0"}`,
            }}
          >
            {badgeText}
          </div>
        )}
        {rightSide === "icon" && (
          <div
            className="min-w-[22px] h-[18px] px-1.5 rounded-[3px] flex items-center justify-center flex-shrink-0 text-[9px] font-bold transition-all duration-200"
            style={{
              backgroundColor: isOpen ? s.badgeBg : "#F1F5F9",
              color: isOpen ? s.badgeColor : "#94A3B8",
            }}
          >
            {badgeNum}
          </div>
        )}

        <ChevronDown
          className="w-4 h-4 flex-shrink-0 transition-all duration-200"
          style={{
            color: isOpen ? (isDefault ? "#475569" : s.color) : "#CBD5E1",
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </button>

      {/* Content */}
      <div
        className="overflow-hidden transition-all duration-300"
        style={{ maxHeight: isOpen ? (contentType === "cards" ? 300 : 200) : 0 }}
      >
        <div
          className="pb-4"
          style={{ borderTop: `1px dashed ${isDefault ? "#E2E8F0" : s.border}` }}
        >
          {contentType === "text" ? (
            <p className="text-[12px] text-[#475569] leading-relaxed px-4 pt-3">
              Last updated 2 minutes ago. Automated detection flagged anomalous activity across 3
              camera feeds. Response team notified. All affected feeds are flagged for manual review.
            </p>
          ) : (
            <div className="px-4 pt-3">
              {/* Summary header row */}
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[9px] font-bold uppercase tracking-[0.65px] text-[#94A3B8]">
                  Zone Summary
                </span>
                <span
                  className="text-[9px] font-bold px-1.5 py-0.5 rounded-[3px]"
                  style={{
                    backgroundColor: isDefault ? "#F1F5F9" : s.badgeBg,
                    color: isDefault ? "#64748B" : s.badgeColor,
                  }}
                >
                  {ZONES_V12.length}
                </span>
              </div>
              {/* Scrollable card strip */}
              <div className="flex gap-2.5 overflow-x-auto pb-1.5">
                {ZONES_V12.map((zone) => (
                  <ZoneSummaryCard key={zone.id} zone={zone} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── V1.2 showcase ────────────────────────────────────────────────────────────
const AccordionContentV12 = () => {
  const [showIcon, setShowIcon] = useState(true);
  const [showDescription, setShowDescription] = useState(true);
  const [rightSide, setRightSide] = useState<"none" | "text" | "icon">("text");
  const [contentType, setContentType] = useState<"text" | "cards">("cards");
  const [severity, setSeverity] = useState<AccSeverityV11>("default");
  const [capsTitle, setCapsTitle] = useState(false);
  const [openItems, setOpenItems] = useState<string[]>(["item-1"]);

  const toggleItem = (id: string) =>
    setOpenItems((prev) => prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]);

  const sharedProps = { showIcon, showDescription, rightSide, contentType, severity, capsTitle };
  const s = ACC_SEV_V11[severity];

  return (
    <div className="space-y-10">
      <SectionHeader
        icon={Layers}
        title="Accordion v1.2 · Enhanced White"
        description="Adds caps-title toggle and zone summary card strips to the v1.1 refined white base. Summary cards visualise component health per zone inside the open accordion."
      />

      {/* Change banner */}
      <div
        className="rounded-[6px] px-4 py-3 flex items-center gap-2 flex-wrap"
        style={{ backgroundColor: "#F0FDF9", border: "1px solid rgba(0,119,91,0.18)" }}
      >
        <span className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#00775B] mr-1">v1.2 · New</span>
        {[
          "Caps-title toggle",
          "Zone Summary Cards",
          "2×2 component status grid",
          "Scrollable card strip",
          "Summary label + count pill",
          "Inherits v1.1 white surface",
        ].map((tag) => (
          <span key={tag} className="text-[9px] font-medium px-2 py-0.5 rounded-[3px] bg-white border border-[#00775B]/20 text-[#00775B]">
            {tag}
          </span>
        ))}
      </div>

      {/* Live preview + controls */}
      <div className="rounded-[8px] border border-[#E2E8F0] overflow-hidden">
        {/* Topbar */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#E2E8F0] bg-white">
          <div className="flex items-center gap-2">
            <span className="text-[9px] font-bold uppercase tracking-[0.12em] text-[#CBD5E1]">Component Sandbox</span>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00775B]" />
            <span className="text-[9px] font-mono text-[#CBD5E1] tracking-[0.04em]">Accordion v1.2</span>
          </div>
          <span
            className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-0.5 rounded-[3px]"
            style={{
              backgroundColor: severity === "default" ? "#F1F5F9" : `${s.color}18`,
              color: severity === "default" ? "#475569" : s.color,
            }}
          >
            {s.label}
          </span>
        </div>

        {/* Body */}
        <div className="flex">
          {/* Accordion preview */}
          <div className="flex-1 min-w-0 p-6 space-y-2 bg-[#F8FAFC]">
            {ACC_ITEMS_DATA.map((item) => (
              <AccItemV12
                key={item.id}
                {...item}
                {...sharedProps}
                isOpen={openItems.includes(item.id)}
                onToggle={() => toggleItem(item.id)}
              />
            ))}
          </div>

          {/* Controls */}
          <div className="w-[272px] flex-shrink-0 border-l border-[#E2E8F0] bg-white p-4 space-y-5 overflow-y-auto">
            {/* Elements */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">Elements</div>
              <div className="space-y-3">
                <CtrlRow label="Left Icon">
                  <MiniToggle checked={showIcon} onChange={setShowIcon} />
                </CtrlRow>
                <CtrlRow label="Description">
                  <MiniToggle checked={showDescription} onChange={setShowDescription} />
                </CtrlRow>
                <CtrlRow label="Caps Title">
                  <MiniToggle checked={capsTitle} onChange={setCapsTitle} />
                </CtrlRow>
                <CtrlRow label="Right Side">
                  <SegControl
                    options={[
                      { value: "none" as const, label: "—"   },
                      { value: "text" as const, label: "Txt" },
                      { value: "icon" as const, label: "Ico" },
                    ]}
                    value={rightSide}
                    onChange={setRightSide}
                  />
                </CtrlRow>
              </div>
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            {/* Content */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">Content</div>
              <SegControl
                options={[
                  { value: "text"  as const, label: "Text"  },
                  { value: "cards" as const, label: "Cards" },
                ]}
                value={contentType}
                onChange={setContentType}
              />
            </div>

            <div className="h-px bg-[#F1F5F9]" />

            {/* Severity */}
            <div>
              <div className="text-[9px] font-bold uppercase tracking-[0.7px] text-[#94A3B8] mb-3">Severity</div>
              <div className="grid grid-cols-4 gap-1.5">
                {(Object.entries(ACC_SEV_V11) as [AccSeverityV11, typeof ACC_SEV_V11[AccSeverityV11]][]).map(
                  ([key, val]) => (
                    <button
                      key={key}
                      onClick={() => setSeverity(key)}
                      className="flex flex-col items-center gap-1 p-1.5 rounded-[4px] transition-all duration-150"
                      style={{
                        backgroundColor: severity === key ? `${val.color}14` : "transparent",
                        border: severity === key ? `1px solid ${val.color}40` : "1px solid transparent",
                      }}
                    >
                      <div className="w-3.5 h-3.5 rounded-full" style={{ backgroundColor: val.color }} />
                      <span
                        className="text-[7.5px] font-bold uppercase leading-none"
                        style={{ color: severity === key ? val.color : "#94A3B8" }}
                      >
                        {val.label.slice(0, 4)}
                      </span>
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Severity matrix */}
      <div>
        <SectionHeader
          icon={Eye}
          title="Severity Color States"
          description="Same 7 states as v1.1 — default stays truly neutral. Caps-title mode shown across all states."
        />
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          {(Object.entries(ACC_SEV_V11) as [AccSeverityV11, typeof ACC_SEV_V11[AccSeverityV11]][]).map(
            ([key, val]) => {
              const isDefaultState = key === "default";
              return (
                <div key={key}>
                  <div className="text-[9px] font-bold uppercase tracking-[0.5px] mb-2" style={{ color: val.color }}>
                    {val.label}
                  </div>
                  {/* Collapsed */}
                  <div
                    className="rounded-[8px] mb-1.5"
                    style={{ border: "1px solid #E2E8F0", backgroundColor: "#fff", boxShadow: "0 1px 3px rgba(0,0,0,0.04)" }}
                  >
                    <div className="flex items-center gap-2.5 px-3 py-0 h-[44px]" style={{ borderLeft: "3px solid transparent" }}>
                      <div className="w-6 h-6 rounded-[4px] flex items-center justify-center bg-[#F8FAFC]">
                        <Zap className="w-3 h-3 text-[#94A3B8]" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-semibold uppercase tracking-[0.07em] text-[#0F172A] truncate">Incident Report</div>
                        <div className="text-[9px] text-[#94A3B8]">Collapsed</div>
                      </div>
                      <div className="px-2 py-0.5 rounded-full bg-[#F1F5F9] text-[#94A3B8] text-[9px] font-mono font-bold">23</div>
                      <ChevronDown className="w-3.5 h-3.5 text-[#CBD5E1]" />
                    </div>
                  </div>
                  {/* Expanded */}
                  <div
                    className="rounded-[8px]"
                    style={{ border: `1px solid ${val.border}`, backgroundColor: val.bg, boxShadow: val.shadow }}
                  >
                    <div className="flex items-center gap-2.5 px-3 py-0 h-[44px]" style={{ borderLeft: `3px solid ${val.stripe}` }}>
                      <div className="w-6 h-6 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: val.iconBg }}>
                        <Zap className="w-3 h-3" style={{ color: val.iconColor }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[10px] font-bold uppercase tracking-[0.07em] truncate" style={{ color: val.titleOpen }}>
                          Incident Report
                        </div>
                        <div className="text-[9px] text-[#94A3B8]">Expanded</div>
                      </div>
                      <div
                        className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold"
                        style={{ backgroundColor: val.badgeBg, color: val.badgeColor }}
                      >
                        23
                      </div>
                      <ChevronDown className="w-3.5 h-3.5" style={{ color: isDefaultState ? "#475569" : val.color, transform: "rotate(180deg)" }} />
                    </div>
                    <div className="px-3 pb-2.5" style={{ borderTop: `1px dashed ${isDefaultState ? "#E2E8F0" : val.border}` }}>
                      <div className="flex items-center gap-2 pt-2 mb-2">
                        <span className="text-[8px] font-bold uppercase tracking-[0.6px] text-[#94A3B8]">Zone Summary</span>
                        <span className="text-[8px] font-bold px-1 py-0.5 rounded-full" style={{ backgroundColor: val.badgeBg, color: val.badgeColor }}>5</span>
                      </div>
                      <div className="flex gap-1.5 overflow-x-auto pb-0.5">
                        {ZONES_V12.slice(0, 3).map((zone) => (
                          <div key={zone.id} className="flex-shrink-0 rounded-[4px] overflow-hidden" style={{ width: 60, border: "1px solid #E2E8F0" }}>
                            <div className="px-1.5 py-1" style={{ backgroundColor: zone.headerColor }}>
                              <div className="text-[7px] font-bold text-white truncate">{zone.label}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-[2px] p-[3px] bg-[#F8FAFC]">
                              {zone.comps.slice(0, 4).map((c) => {
                                const st = ZONE_STATUS_CFG[c.status];
                                return (
                                  <div key={c.name} className="flex items-center justify-center py-[3px] rounded-[2px]" style={{ backgroundColor: st.bg }}>
                                    <st.Icon className="w-[8px] h-[8px]" style={{ color: st.color }} />
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                        <div className="flex-shrink-0 w-[28px] flex items-center justify-center rounded-[4px] text-[8px] font-bold text-[#94A3B8] border border-dashed border-[#E2E8F0]">
                          +2
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }
          )}
        </div>
      </div>

      {/* Specs */}
      <div>
        <SectionHeader
          icon={BookOpen}
          title="Anatomy & Specifications"
          description="v1.2 additions on top of the v1.1 refined white base."
        />
        <div className="flex flex-wrap gap-2">
          <SpecChip label="Trigger height"   value="52px (inherited v1.1)" />
          <SpecChip label="Border radius"    value="8px (inherited v1.1)" />
          <SpecChip label="Separator"        value="1px dashed (default) / severity" />
          <SpecChip label="Caps mode on"     value="11px · 0.07em tracking · wt 600/700" />
          <SpecChip label="Caps mode off"    value="13px · normal · wt 500/700" />
          <SpecChip label="Zone card width"  value="168px flex-shrink-0" />
          <SpecChip label="Card header"      value="severity color full-width bar" />
          <SpecChip label="Status grid"      value="2×2 · 13px icon · 8px label" />
          <SpecChip label="Card strip gap"   value="10px · overflow-x auto" />
          <SpecChip label="Summary label"    value="9px Bold Caps · #94A3B8" />
          <SpecChip label="Count pill"       value="severity tint when open / #F1F5F9 default" />
        </div>
      </div>

      {/* Annotations */}
      <div className="grid grid-cols-2 gap-2">
        <Annotation>Caps Title ON: 11px Inter 600/700 · tracking 0.07em · uppercase transform</Annotation>
        <Annotation>Caps Title OFF: 13px Inter 500→700 on open (inherited v1.1)</Annotation>
        <Annotation>Zone Summary: scrollable horizontal strip · one card per zone · always visible when Content = Cards</Annotation>
        <Annotation>Zone card header: solid severity color · white bold text (zone label + sub-location)</Annotation>
        <Annotation>2×2 status grid: colored icon + label per component · tinted bg per status</Annotation>
        <Annotation>Summary header row: "Zone Summary" label (9px caps) + count pill (severity tint on open)</Annotation>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════════
//  PAGE SHELL
// ══════════════════════════════════════════════════════════════════════════════
type TableTabId = "v2base" | "v2-1" | "v2-2";
const TABLE_TABS: { id: TableTabId; version: string; label: string; badge: string; badgeColor: string }[] = [
  { id: "v2base", version: "v2.0", label: "Base Grid",        badge: "Standard", badgeColor: "#2B7FFF" },
  { id: "v2-1",   version: "v2.1", label: "High-Tech Dense",  badge: "Dense",    badgeColor: "#00775B" },
  { id: "v2-2",   version: "v2.2", label: "Seamless HUD",     badge: "Fluid",    badgeColor: "#8B5CF6" },
];

type TabId = "v1" | "v1-1" | "v1-2";
const CARD_TABS: { id: TabId; version: string; label: string; badge: string; badgeColor: string }[] = [
  { id: "v1",   version: "v1.0", label: "Standard",      badge: "Stable",  badgeColor: "#2B7FFF" },
  { id: "v1-1", version: "v1.1", label: "High-Tech HUD", badge: "Latest",  badgeColor: "#00A63E" },
  { id: "v1-2", version: "v1.2", label: "Card Catalogue", badge: "New",    badgeColor: "#EA580C" },
];

type AccordionTabId = "v1-acc" | "v1-1-acc" | "v1-2-acc";
const ACCORDION_TABS: { id: AccordionTabId; version: string; label: string; badge: string; badgeColor: string }[] = [
  { id: "v1-acc",   version: "v1.0", label: "Standard",       badge: "Stable",   badgeColor: "#2B7FFF" },
  { id: "v1-1-acc", version: "v1.1", label: "Refined White",  badge: "Updated",  badgeColor: "#00775B" },
  { id: "v1-2-acc", version: "v1.2", label: "Enhanced White", badge: "New",      badgeColor: "#8B5CF6" },
];

export const DesignSystem = () => {
  const [activeTab, setActiveTab] = useState<TabId>("v1-1");
  const [componentType, setComponentType] = useState<"card" | "table" | "accordion">("card");
  const [tableTab, setTableTab] = useState<TableTabId>("v2base");
  const [accordionTab, setAccordionTab] = useState<AccordionTabId>("v1-acc");
  const [sandboxTheme, setSandboxTheme] = useState<"light" | "dark">("light");

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
              ["Versions", "3"],
              ["Severity Levels", "4"],
              ["Interactive States", "3"],
              ["Token Families", "4"],
              ["Table Variants", "4"],
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

        {/* Component type selector */}
        <div className="flex items-center gap-0 py-5">
          <div className="rounded-[6px] p-0.5 bg-[#F1F5F9] border border-[#E2E8F0] flex items-center">
            {(["card", "table", "accordion"] as const).map((type) => {
              const isActive = componentType === type;
              return (
                <button
                  key={type}
                  onClick={() => setComponentType(type)}
                  className="px-5 py-2 text-[11px] font-bold uppercase tracking-[0.05em] rounded-[4px] transition-all"
                  style={{
                    backgroundColor: isActive ? "#00775B" : "white",
                    color: isActive ? "white" : "#64748B",
                    border: isActive ? "none" : "1px solid #E2E8F0",
                  }}
                >
                  {type === "card" ? "Cards" : type === "table" ? "Tables" : "Accordion"}
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab strip */}
        <div className="flex items-end gap-0 border-b border-[#E2E8F0] mt-0">
          {(componentType === "card" ? CARD_TABS : componentType === "table" ? TABLE_TABS : ACCORDION_TABS).map((tab) => {
            const active = componentType === "card" ? activeTab === tab.id : componentType === "table" ? tableTab === tab.id : accordionTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  if (componentType === "card") setActiveTab(tab.id as TabId);
                  else if (componentType === "table") setTableTab(tab.id as TableTabId);
                  else setAccordionTab(tab.id as AccordionTabId);
                }}
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

        {/* Card tab content — outside sandbox, always light */}
        {componentType === "card" && (
          <div className="py-8 animate-in fade-in duration-300">
            {activeTab === "v1"   && <V1Content />}
            {activeTab === "v1-1" && <V1_1Content />}
            {activeTab === "v1-2" && <V1_2Content />}
          </div>
        )}

        {/* Component Sandbox — wraps all table content with SandboxThemeCtx */}
        {componentType === "table" && (
          <SandboxThemeCtx.Provider value={sandboxTheme}>
            <div
              style={{
                borderRadius: 8,
                marginTop: 24,
                transition: "background-color 350ms ease",
                backgroundColor: sandboxTheme === "dark" ? "#0F172A" : "#F1F5F9",
                overflow: "visible",
              }}
            >
              {/* Sandbox topbar */}
              <div
                style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "10px 24px",
                  borderBottom: sandboxTheme === "dark"
                    ? "1px solid rgba(255,255,255,0.06)"
                    : "1px solid rgba(0,0,0,0.06)",
                  borderRadius: "8px 8px 0 0",
                }}
              >
                {/* Label */}
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span
                    style={{
                      fontSize: 9, fontWeight: 800, letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      color: sandboxTheme === "dark" ? "#334155" : "#CBD5E1",
                      fontFamily: "Inter, sans-serif",
                    }}
                  >
                    Component Sandbox
                  </span>
                  <span
                    style={{
                      width: 3, height: 3, borderRadius: 2,
                      backgroundColor: "#00775B",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 9, fontFamily: "'JetBrains Mono', monospace",
                      color: sandboxTheme === "dark" ? "#334155" : "#CBD5E1",
                      letterSpacing: "0.04em",
                    }}
                  >
                    Tables v2.x
                  </span>
                </div>

                {/* Theme toggle */}
                <div
                  style={{
                    display: "flex", alignItems: "center", padding: "2px",
                    backgroundColor: sandboxTheme === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)",
                    borderRadius: 6,
                    border: sandboxTheme === "dark"
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(0,0,0,0.06)",
                    gap: 1,
                  }}
                >
                  {(["light", "dark"] as const).map((t) => {
                    const isActive = sandboxTheme === t;
                    return (
                      <button
                        key={t}
                        onClick={() => setSandboxTheme(t)}
                        style={{
                          display: "flex", alignItems: "center", gap: 5,
                          height: 26, padding: "0 12px",
                          borderRadius: 4, border: "none", cursor: "pointer",
                          fontSize: 11, fontWeight: 700,
                          fontFamily: "Inter, sans-serif",
                          letterSpacing: "0.02em",
                          transition: "all 200ms ease",
                          backgroundColor: isActive
                            ? (t === "dark" ? "#1E293B" : "#ffffff")
                            : "transparent",
                          color: isActive
                            ? (t === "dark" ? "#E2E8F0" : "#334155")
                            : (sandboxTheme === "dark" ? "#334155" : "#94A3B8"),
                          boxShadow: isActive
                            ? (t === "dark" ? "0 1px 4px rgba(0,0,0,0.5)" : "0 1px 3px rgba(0,0,0,0.10)")
                            : "none",
                        }}
                      >
                        {t === "light" ? "☀ Light" : "🌙 Dark"}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Table content — padded inside sandbox */}
              <div
                className="animate-in fade-in duration-300"
                style={{ padding: "32px 32px" }}
              >
                {tableTab === "v2base" && <V2BaseContent />}
                {tableTab === "v2-1"   && <V2_1Content />}
                {tableTab === "v2-2"   && <V2_2Content />}
              </div>
            </div>
          </SandboxThemeCtx.Provider>
        )}

        {/* Accordion content */}
        {componentType === "accordion" && (
          <div className="py-8 animate-in fade-in duration-300">
            {accordionTab === "v1-acc"   && <AccordionContent />}
            {accordionTab === "v1-1-acc" && <AccordionContentV11 />}
            {accordionTab === "v1-2-acc" && <AccordionContentV12 />}
          </div>
        )}

        {/* Footer */}
        <div className="border-t border-[#E2E8F0] py-6 flex items-center justify-between text-[11px] text-[#94a3b8]">
          <span>Matrice AI Analytics · Component Library</span>
          <span>Precision &amp; Clarity design pillars</span>
        </div>
      </div>
    </div>
  );
};
