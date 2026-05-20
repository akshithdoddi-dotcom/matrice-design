import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, CheckCircle2, AlertTriangle, XCircle, Activity, ChevronLeft, ChevronRight, Zap, Server, Link2, Clock } from "lucide-react";
import { CommandGrid, type CGColumn, type CGSortOption } from "./CommandGrid";
import { cn } from "@/app/lib/utils";
import { StatusCapsule } from "@fe-common/components/ui/DataGrid";
import {
  SUMMARY, SERVICES, INCIDENTS, CATEGORIES,
  ENDPOINT_METRICS, ENDPOINT_ERRORS, SERVICE_RESOURCES, SERVICE_DEPENDENCIES,
  type MicroserviceRecord, type IncidentRecord, type SparkDay, type ServiceHealth,
  type EndpointMetric, type EndpointError, type ServiceResource, type ServiceDependency,
  type CircuitBreakerState,
} from "./statusData";

// ── Matrice logo (copied from AppLayout.tsx) ──────────────────────────────────
const MatriceLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 113.7 109.945" fill="none" className={className}>
    <path d="M9.58511 9.56419H24.6545V0H0V109.932H24.6545V100.367H9.58511V9.56419Z" fill="#00956D" />
    <path d="M113.7 0.087L113.426 0.025H89.0458V9.577H104.115V100.38H89.0458V109.944H113.7V0.373V0.075V0.087Z" fill="#00956D" />
    <circle cx="21.775" cy="43.356" r="3.428" fill="#00956D" />
    <circle cx="45.109" cy="43.331" r="6.422" fill="#00956D" />
    <circle cx="56.788" cy="31.628" r="5.000" fill="#00956D" />
    <circle cx="68.429" cy="43.306" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="31.628" r="5.000" fill="#00956D" />
    <circle cx="68.417" cy="20.011" r="3.428" fill="#00956D" />
    <circle cx="45.084" cy="66.613" r="6.422" fill="#00956D" />
    <circle cx="56.751" cy="54.935" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="78.304" r="5.000" fill="#00956D" />
    <circle cx="45.109" cy="89.920" r="3.428" fill="#00956D" />
    <circle cx="68.554" cy="90.020" r="3.428" fill="#00956D" />
    <circle cx="91.912" cy="66.738" r="3.428" fill="#00956D" />
    <path d="M33.3297 59.9718H33.3048C30.6873 59.8101 28.7179 60.5065 27.2471 61.9866C26.0381 63.193 25.365 64.7103 25.2029 66.2898C25.2528 66.6007 25.2279 66.9365 25.178 67.2599C25.0284 68.1181 24.5423 68.9265 23.7571 69.4737C22.6228 70.2697 21.0523 70.2945 19.9056 69.511C18.0608 68.2673 17.8988 65.7426 19.3821 64.2501C19.918 63.7153 20.5911 63.392 21.2891 63.2925C22.4109 63.2303 23.9066 63.0313 25.34 62.3597C26.4868 61.2155 27.9576 59.7479 28.5683 55.8551C28.5683 55.6312 28.5434 55.3949 28.506 55.171C28.4686 53.8278 28.9547 52.4971 29.9643 51.4897C32.1581 49.3007 35.8724 49.5868 37.6798 52.3105C38.7766 53.9771 38.7393 56.2157 37.5925 57.845C36.558 59.3126 34.9625 60.0215 33.3546 59.9842L33.3297 59.9718Z" fill="#00956D" />
    <path d="M69.564 74.461H69.5266C65.9992 74.5107 63.07 76.8862 62.4094 79.7716C62.2848 80.3313 61.3624 84.0002 56.439 85.2564C53.8464 82.4456 52.6623 74.9087 56.2894 74.1749C57.58 73.4785 61.9981 70.5184 62.048 67.5584C61.8236 61.6632 68.866 58.0689 73.5775 61.7876C78.7752 65.8545 75.9831 74.1998 69.5515 74.4734L69.564 74.461Z" fill="#00956D" />
    <path d="M86.079 55.7556C86.079 55.4944 86.054 55.2705 86.0166 55.0467C85.705 51.4896 88.8211 47.858 92.4109 47.6341C95.2154 48.0197 97.272 44.699 95.6392 42.3484C93.9191 39.7241 89.8058 40.744 89.407 43.7289C89.5815 47.7336 85.9419 51.2658 81.9533 50.9673C81.7289 50.9673 81.4921 50.9424 81.2677 50.9051H81.2428C76.3318 50.7434 74.1506 57.248 78.4009 60.0588C81.7164 62.285 86.2909 59.5986 86.079 55.7431V55.7556Z" fill="#00956D" />
    <path d="M38.4526 31.5157C38.4526 31.2545 38.4277 31.0306 38.3903 30.8068C38.0787 27.2497 41.1948 23.6181 44.7845 23.3942C47.589 23.7798 49.6456 20.4591 48.0128 18.1085C46.2927 15.4842 42.1795 16.5041 41.7806 19.489C41.9551 23.4937 38.3155 27.0259 34.3269 26.7274C34.1025 26.7274 33.8657 26.7025 33.6414 26.6652H33.6164C28.7055 26.5035 26.5242 33.0081 30.7746 35.8189C34.0901 38.0452 38.6645 35.3587 38.4526 31.5032V31.5157Z" fill="#00956D" />
    <circle cx="33.454" cy="78.279" r="5.000" fill="#00956D" />
  </svg>
);

// ── Auto-refresh countdown ────────────────────────────────────────────────────
function useRefreshCountdown(intervalSeconds = 30) {
  const [countdown, setCountdown] = useState(intervalSeconds);
  const [lastRefreshed] = useState(new Date());
  useEffect(() => {
    const tick = setInterval(() => {
      setCountdown(c => (c <= 1 ? intervalSeconds : c - 1));
    }, 1000);
    return () => clearInterval(tick);
  }, [intervalSeconds]);
  return { countdown, lastRefreshed };
}

// ── Animated SVG health ring ──────────────────────────────────────────────────
const HealthRing = ({ score, status }: { score: number; status: string }) => {
  const r = 44;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - score / 100);
  const color =
    status === "operational" ? "#34D399" :
    status === "partial-outage" ? "#FBBF24" : "#F87171";

  return (
    <div className="relative w-32 h-32 flex-shrink-0">
      <svg viewBox="0 0 120 120" className="w-full h-full" style={{ transform: "rotate(-90deg)" }}>
        <circle cx="60" cy="60" r={r} fill="none" stroke="rgba(0,119,91,0.18)" strokeWidth="9" />
        <motion.circle
          cx="60" cy="60" r={r}
          fill="none"
          stroke={color}
          strokeWidth="9"
          strokeLinecap="round"
          strokeDasharray={`${circ} ${circ}`}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.4, ease: "easeOut", delay: 0.6 }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-2xl font-black font-mono text-white leading-none">{score}</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-white/40">Health</span>
      </div>
    </div>
  );
};

// ── Constellation illustration ────────────────────────────────────────────────
type NodeDef = {
  cx: number; cy: number; r: number;
  stroke: string; fill: string;
  statusColor: string; label: string;
};

const NODES: NodeDef[] = [
  // Core tier
  { cx: 175, cy: 160, r: 14, stroke: "#00956D", fill: "#021d18", statusColor: "#00A63E", label: "be-accounting" },
  { cx: 112, cy: 96,  r: 11, stroke: "#00956D", fill: "#021d18", statusColor: "#00A63E", label: "be-application" },
  { cx: 112, cy: 224, r: 11, stroke: "#00956D", fill: "#021d18", statusColor: "#00A63E", label: "be-compute" },
  // Data tier
  { cx: 50,  cy: 56,  r: 8,  stroke: "#00775B", fill: "#021d18", statusColor: "#E19A04", label: "be-action" },
  { cx: 50,  cy: 256, r: 8,  stroke: "#00775B", fill: "#021d18", statusColor: "#00A63E", label: "be-dataset" },
  { cx: 240, cy: 78,  r: 8,  stroke: "#00775B", fill: "#021d18", statusColor: "#E7000B", label: "be-dataset-item" },
  { cx: 240, cy: 242, r: 8,  stroke: "#00775B", fill: "#021d18", statusColor: "#E19A04", label: "be-model" },
  // Inference tier
  { cx: 328, cy: 118, r: 6,  stroke: "#34D399", fill: "#021d18", statusColor: "#00A63E", label: "be-inference" },
  { cx: 328, cy: 202, r: 6,  stroke: "#34D399", fill: "#021d18", statusColor: "#E7000B", label: "be-inference-ws" },
  { cx: 398, cy: 68,  r: 6,  stroke: "#34D399", fill: "#021d18", statusColor: "#E7000B", label: "be-model-logging" },
  { cx: 398, cy: 242, r: 6,  stroke: "#34D399", fill: "#021d18", statusColor: "#E19A04", label: "be-model-prediction" },
];

const EDGES: [number, number][] = [
  [0, 1], [0, 2],           // hub → core
  [0, 5], [0, 6],           // hub → data
  [1, 3], [1, 5],           // core top → data
  [2, 4], [2, 6],           // core bottom → data
  [5, 7], [5, 9],           // data → inference
  [6, 8], [6, 10],          // data → inference
  [7, 9], [8, 10],          // inference laterals
];

const PACKETS = [
  { path: [0, 5, 7], duration: 2.8, delay: 0 },
  { path: [2, 6, 10], duration: 3.2, delay: 0.9 },
  { path: [1, 3], duration: 2.1, delay: 1.6 },
];

const ConstellationSVG = () => (
  <motion.div
    className="w-full h-full"
    initial={{ opacity: 0, scale: 0.92 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.8, ease: "easeOut" }}
  >
    <svg
      viewBox="0 0 450 320"
      className="w-full h-full"
      style={{ overflow: "visible" }}
    >
      {/* Edges */}
      {EDGES.map(([a, b], i) => (
        <motion.path
          key={i}
          d={`M ${NODES[a].cx},${NODES[a].cy} L ${NODES[b].cx},${NODES[b].cy}`}
          stroke="rgba(0,149,109,0.28)"
          strokeWidth="1"
          fill="none"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.3 + i * 0.07, ease: "easeOut" }}
        />
      ))}

      {/* Pulse rings */}
      {NODES.map((n, i) => (
        <motion.circle
          key={`ring-${i}`}
          cx={n.cx} cy={n.cy}
          r={n.r}
          fill="none"
          stroke={n.stroke}
          strokeWidth="0.8"
          animate={{
            r: [n.r, n.r * 2.4, n.r],
            opacity: [0.35, 0, 0.35],
          }}
          transition={{ repeat: Infinity, duration: 2.8, delay: i * 0.26, ease: "easeInOut" }}
        />
      ))}

      {/* Nodes */}
      {NODES.map((n, i) => (
        <motion.circle
          key={`node-${i}`}
          cx={n.cx} cy={n.cy} r={n.r}
          fill={n.fill}
          stroke={n.stroke}
          strokeWidth="1.8"
          initial={{ opacity: 0, r: 0 }}
          animate={{ opacity: 1, r: n.r }}
          transition={{ duration: 0.5, delay: 0.2 + i * 0.06, ease: "backOut" }}
        />
      ))}

      {/* Status dots on nodes */}
      {NODES.map((n, i) => (
        <motion.circle
          key={`dot-${i}`}
          cx={n.cx + n.r * 0.68}
          cy={n.cy - n.r * 0.68}
          r={Math.max(2.2, n.r * 0.34)}
          fill={n.statusColor}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.5 + i * 0.06 }}
        />
      ))}

      {/* Data packets */}
      {PACKETS.map((pkt, pi) => {
        const waypoints = pkt.path.map(idx => NODES[idx]);
        if (waypoints.length < 2) return null;
        const cxKeys = waypoints.map(n => n.cx);
        const cyKeys = waypoints.map(n => n.cy);
        return (
          <motion.circle
            key={`pkt-${pi}`}
            r={2.5}
            fill="#34D399"
            initial={{ cx: cxKeys[0], cy: cyKeys[0], opacity: 0 }}
            animate={{ cx: cxKeys, cy: cyKeys, opacity: [0, 1, 1, 0] }}
            transition={{
              duration: pkt.duration,
              delay: pkt.delay,
              repeat: Infinity,
              ease: "linear",
              times: [0, 0.1, 0.9, 1],
            }}
          />
        );
      })}
    </svg>
  </motion.div>
);

// ── Top bar ───────────────────────────────────────────────────────────────────
const TopBar = () => (
  <header className="w-full border-b border-white/10 bg-[#021d18]/80 backdrop-blur-sm sticky top-0 z-50">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-7 h-7">
          <MatriceLogo className="w-full h-full" />
        </div>
        <span className="text-sm font-bold text-white/80 tracking-tight">Matrice AI</span>
        <span className="text-white/20 text-sm">·</span>
        <span className="text-xs font-semibold text-white/50 uppercase tracking-widest">System Status</span>
      </div>
      <a
        href="https://matrice.ai"
        className="text-xs text-white/40 hover:text-white/70 transition-colors font-mono"
      >
        matrice.ai ↗
      </a>
    </div>
  </header>
);

// ── Hero section ──────────────────────────────────────────────────────────────
const statusColors: Record<string, string> = {
  operational: "#34D399",
  "partial-outage": "#FBBF24",
  "major-incident": "#F87171",
};

const StatusIcon = ({ status }: { status: string }) => {
  if (status === "operational") return <CheckCircle2 className="w-8 h-8" style={{ color: statusColors[status] }} />;
  if (status === "partial-outage") return <AlertTriangle className="w-8 h-8" style={{ color: statusColors[status] }} />;
  return <XCircle className="w-8 h-8" style={{ color: statusColors[status] }} />;
};

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.05)",
  backdropFilter: "blur(18px)",
  WebkitBackdropFilter: "blur(18px)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "4px",
  boxShadow: "0 8px 40px rgba(0,0,0,0.28), inset 0 1px 0 rgba(255,255,255,0.10)",
};

const glassChip: React.CSSProperties = {
  background: "rgba(255,255,255,0.07)",
  backdropFilter: "blur(10px)",
  WebkitBackdropFilter: "blur(10px)",
  border: "1px solid rgba(255,255,255,0.10)",
  borderRadius: "4px",
};

const HeroSection = ({ countdown }: { countdown: number }) => {
  const accentColor = statusColors[SUMMARY.overallStatus];
  const uptimeColor = SUMMARY.uptimePct30d > 95 ? "#34D399" : SUMMARY.uptimePct30d > 80 ? "#FBBF24" : "#F87171";

  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ background: "linear-gradient(145deg, #010f0c 0%, #021d18 40%, #032e24 75%, #053a2c 100%)" }}
    >
      {/* Dot grid */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
        }}
      />

      {/* Radial glow orbs */}
      <div className="absolute pointer-events-none" style={{
        top: "-100px", left: "-80px",
        width: "560px", height: "560px",
        background: "radial-gradient(circle, rgba(0,149,109,0.20) 0%, transparent 70%)",
      }} />
      <div className="absolute pointer-events-none" style={{
        bottom: "-80px", right: "20%",
        width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(0,212,170,0.10) 0%, transparent 70%)",
      }} />

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-12 py-10 lg:py-12">
        <motion.div
          className="w-full p-7 lg:p-10"
          style={glassCard}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          {/* Top meta row */}
          <div className="flex items-center justify-between mb-7">
            <span className="text-[10px] font-bold uppercase tracking-widest text-white/25">
              Matrice AI · System Status
            </span>
            <div
              className="flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-white/50"
              style={glassChip}
            >
              <span className="w-1.5 h-1.5 rounded animate-pulse" style={{ backgroundColor: accentColor }} />
              Refreshing in{" "}
              <span className="font-bold" style={{ color: accentColor }}>{countdown}s</span>
            </div>
          </div>

          {/* Main content row */}
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-8 lg:gap-12">

            {/* Left: status headline + service count chips */}
            <div className="flex-1 flex flex-col gap-5">
              <div className="flex items-center gap-4">
                <StatusIcon status={SUMMARY.overallStatus} />
                <h1
                  className="text-3xl lg:text-4xl xl:text-[2.75rem] font-black tracking-tight leading-tight"
                  style={{ color: accentColor }}
                >
                  {SUMMARY.headline}
                </h1>
              </div>

              <p className="text-[13px] text-white/35 font-mono -mt-1 leading-relaxed">
                {SUMMARY.totalServices} microservices monitored across 3 groups
                {SUMMARY.activeIncidents > 0
                  ? ` · ${SUMMARY.activeIncidents} active incident${SUMMARY.activeIncidents > 1 ? "s" : ""}`
                  : " · no active incidents"}
              </p>

              <div className="flex flex-wrap gap-2.5">
                {[
                  { count: SUMMARY.healthyCount,  label: "healthy",  dotColor: "#00A63E" },
                  { count: SUMMARY.degradedCount, label: "degraded", dotColor: "#E19A04" },
                  { count: SUMMARY.downCount,     label: "down",     dotColor: "#F87171" },
                ].map(({ count, label, dotColor }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 px-3.5 py-2"
                    style={glassChip}
                  >
                    <span className="w-2 h-2 rounded flex-shrink-0" style={{ backgroundColor: dotColor }} />
                    <span className="text-sm font-mono text-white/55">
                      <span className="font-black text-white text-[15px]">{count}</span>
                      {" "}{label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Divider */}
            <div
              className="hidden lg:block self-stretch w-px flex-shrink-0"
              style={{ background: "rgba(255,255,255,0.08)" }}
            />

            {/* Right: health ring + uptime stat */}
            <div className="flex items-center gap-7 flex-shrink-0">
              <HealthRing score={SUMMARY.healthScorePct} status={SUMMARY.overallStatus} />

              <div className="flex flex-col gap-1.5">
                <p className="text-[10px] font-bold uppercase tracking-widest text-white/30">30-day uptime</p>
                <p className="text-4xl font-black font-mono leading-none" style={{ color: uptimeColor }}>
                  {SUMMARY.uptimePct30d.toFixed(1)}%
                </p>
                <p className="text-[11px] font-mono text-white/25 mt-0.5">
                  avg across {SUMMARY.totalServices} services
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

// ── v1.2 Card atoms (ported from Component Library v1.2 — Platform Card Catalogue) ──
const v12hex2rgba = (hex: string, a: number) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r},${g},${b},${a})`;
};

const V12Card = ({ color, bgColor, children }: { color: string; bgColor: string; children: React.ReactNode }) => {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      className="w-full rounded flex flex-col cursor-default select-none transition-all duration-200"
      style={{
        border: `1px solid ${color}`,
        background: bgColor,
        boxShadow: hovered
          ? `0 0 18px 4px ${v12hex2rgba(color, 0.22)}, 0 4px 14px rgba(0,0,0,0.07)`
          : `0 0 6px 1px ${v12hex2rgba(color, 0.10)}, 0 1px 3px rgba(0,0,0,0.04)`,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >{children}</div>
  );
};

const V12Divider = ({ color }: { color: string }) => (
  <div style={{ height: 1, backgroundColor: v12hex2rgba(color, 0.22), margin: "0 16px" }} />
);

const V12Label = ({ label, chip, color }: { label: string; chip?: string; color: string }) => (
  <div className="px-4 pt-4 flex items-center justify-between">
    <span className="text-[11px] font-bold uppercase tracking-[0.5px] leading-none text-[#475569]">{label}</span>
    {chip && (
      <span className="text-[9px] font-bold uppercase tracking-[0.5px] px-2 py-[3px] rounded-full flex-shrink-0"
        style={{ backgroundColor: v12hex2rgba(color, 0.14), color }}>
        {chip}
      </span>
    )}
  </div>
);

type BSDir = "up" | "down" | "neutral";
const V12BS = ({ dir, num, ref_, color }: { dir: BSDir; num: string; ref_: string; color: string }) => (
  <div className="flex flex-col px-[10px] py-[8px] rounded flex-shrink-0" style={{ backgroundColor: v12hex2rgba(color, 0.12) }}>
    <div className="flex items-center gap-[4px] font-mono font-bold leading-none" style={{ fontSize: 13, color }}>
      {dir === "up"      ? <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M7 17L17 7M17 7H7M17 7v10" /></svg>
       : dir === "down"  ? <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 7L7 17M7 17h10M7 17V7" /></svg>
       : <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14" /></svg>}
      {num}
    </div>
    <div className="text-[10px] font-normal mt-[5px] leading-none text-[#94a3b8]">{ref_}</div>
  </div>
);

// ── Live metrics strip — v1.2 card style ──────────────────────────────────────
const LiveMetricsStrip = () => {
  const uptimeColor = SUMMARY.uptimePct30d >= 99 ? "#00A63E" : SUMMARY.uptimePct30d >= 95 ? "#00775B" : SUMMARY.uptimePct30d >= 80 ? "#E19A04" : "#E7000B";
  const uptimeBg    = SUMMARY.uptimePct30d >= 95 ? "#E6F7F2" : SUMMARY.uptimePct30d >= 80 ? "#FFFBEB" : "#FEF2F2";
  const incColor    = SUMMARY.activeIncidents === 0 ? "#00A63E" : "#E7000B";
  const incBg       = SUMMARY.activeIncidents === 0 ? "#E5FFEF" : "#FEF2F2";
  const healthColor = SUMMARY.downCount > 0 ? "#E7000B" : SUMMARY.degradedCount > 0 ? "#EA580C" : "#00A63E";
  const healthBg    = SUMMARY.downCount > 0 ? "#FEF2F2" : SUMMARY.degradedCount > 0 ? "#FEEFE7" : "#E5FFEF";

  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-12 -mt-8 relative z-20">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        {/* Card 1 — Total Services */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
          <V12Card color="#00775B" bgColor="#E6F7F2">
            <V12Label label="Total Services" chip="MONITORED" color="#00775B" />
            <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-[7px]">
                <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{SUMMARY.totalServices}</div>
                <div className="text-[12px] text-[#64748b]">backend microservices</div>
              </div>
              <V12BS dir="neutral" num="0" ref_="No change" color="#00775B" />
            </div>
          </V12Card>
        </motion.div>

        {/* Card 2 — 30-day Uptime */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.18 }}>
          <V12Card color={uptimeColor} bgColor={uptimeBg}>
            <V12Label label="30-Day Uptime" chip="SLA" color={uptimeColor} />
            <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-[7px]">
                <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>{SUMMARY.uptimePct30d.toFixed(1)}%</div>
                <div className="text-[12px] text-[#64748b]">avg across all services</div>
              </div>
              <V12BS
                dir={SUMMARY.uptimePct30d >= 99 ? "up" : SUMMARY.uptimePct30d >= 95 ? "neutral" : "down"}
                num={SUMMARY.uptimePct30d >= 99 ? "+0.2%" : SUMMARY.uptimePct30d >= 95 ? "0%" : "-1.4%"}
                ref_="vs last month"
                color={uptimeColor}
              />
            </div>
          </V12Card>
        </motion.div>

        {/* Card 3 — Active Incidents */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.26 }}>
          <V12Card color={incColor} bgColor={incBg}>
            <V12Label label="Active Incidents" chip={SUMMARY.activeIncidents > 0 ? "REAL-TIME" : "ALL CLEAR"} color={incColor} />
            <div className="px-4 pt-3 pb-4 flex items-end justify-between gap-4">
              <div className="flex flex-col gap-[7px]">
                <div className="font-mono font-bold tabular-nums leading-none text-[#0f172a]" style={{ fontSize: 28 }}>
                  {SUMMARY.activeIncidents === 0 ? "0" : SUMMARY.activeIncidents}
                </div>
                <div className="text-[12px] text-[#64748b]">{SUMMARY.activeIncidents > 0 ? "requiring attention" : "no open incidents"}</div>
              </div>
              <V12BS
                dir={SUMMARY.activeIncidents === 0 ? "down" : "up"}
                num={SUMMARY.activeIncidents === 0 ? "−2" : `+${SUMMARY.activeIncidents}`}
                ref_="vs yesterday"
                color={incColor}
              />
            </div>
          </V12Card>
        </motion.div>

      </div>
    </div>
  );
};

// ── Uptime sparkbar ───────────────────────────────────────────────────────────
const dayColor: Record<SparkDay, string> = {
  healthy: "#00A63E",
  degraded: "#E19A04",
  down: "#E7000B",
  "no-data": "#E2E8F0",
};

const UptimeSparkbar = ({ days }: { days: SparkDay[] }) => (
  <div className="flex gap-[2px] flex-1 items-center overflow-hidden min-w-0">
    {days.map((d, i) => (
      <div
        key={i}
        className="flex-shrink-0 rounded"
        style={{
          width: "3px",
          height: "22px",
          backgroundColor: dayColor[d],
          opacity: d === "no-data" ? 0.6 : 1,
        }}
        title={`Day ${i + 1}: ${d}`}
      />
    ))}
  </div>
);

// ── Service detail (expanded) ─────────────────────────────────────────────────
const ServiceDetail = ({ svc }: { svc: MicroserviceRecord }) => (
  <motion.div
    initial={{ height: 0, opacity: 0 }}
    animate={{ height: "auto", opacity: 1 }}
    exit={{ height: 0, opacity: 0 }}
    transition={{ duration: 0.25, ease: "easeInOut" }}
    style={{ overflow: "hidden" }}
  >
    <div className="bg-neutral-50 border-t border-neutral-100 px-6 py-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { label: "Uptime", value: `${svc.uptimePct.toFixed(2)}%` },
          { label: "MTTR", value: svc.mttr },
          { label: "MTBF", value: svc.mtbf },
          { label: "Availability", value: `${svc.availability.toFixed(2)}%` },
          { label: "Reliability", value: `${svc.score}/100` },
        ].map(({ label, value }) => (
          <div key={label} className="bg-white rounded border border-neutral-100 px-3 py-2.5 flex flex-col gap-1">
            <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{label}</p>
            <p className="text-base font-black font-mono text-neutral-900 leading-none">{value}</p>
          </div>
        ))}
      </div>
      {(svc.responseTimeMs > 0) && (
        <div className="mt-3 flex gap-4 text-xs font-mono text-neutral-500">
          <span>Response: <strong className="text-neutral-700">{svc.responseTimeMs}ms</strong></span>
          <span>Error rate: <strong className="text-neutral-700">{svc.errorRatePct.toFixed(2)}%</strong></span>
        </div>
      )}
    </div>
  </motion.div>
);

// ── Status dot ────────────────────────────────────────────────────────────────
const statusDotColor: Record<ServiceHealth, string> = {
  healthy: "#00A63E",
  degraded: "#E19A04",
  down: "#E7000B",
  maintenance: "#64748B",
};

const statusCapsuleKey: Record<ServiceHealth, { status: string; label: string }> = {
  healthy: { status: "stable", label: "Healthy" },
  degraded: { status: "warning", label: "Degraded" },
  down: { status: "critical", label: "Down" },
  maintenance: { status: "pending", label: "Maintenance" },
};

// ── Service row ───────────────────────────────────────────────────────────────
const ServiceRow = ({ svc, isLast }: { svc: MicroserviceRecord; isLast: boolean }) => {
  const [expanded, setExpanded] = useState(false);
  const capsule = statusCapsuleKey[svc.status];

  return (
    <div>
      <button
        onClick={() => setExpanded(e => !e)}
        className={cn(
          "w-full flex items-center gap-4 px-5 py-3.5 text-left transition-colors",
          !isLast && "border-b border-neutral-50",
          "hover:bg-[#00775B]/[0.025] focus-visible:outline-none"
        )}
      >
        {/* Status dot */}
        <span
          className={cn(
            "w-2.5 h-2.5 rounded flex-shrink-0",
            svc.status !== "healthy" && "animate-pulse"
          )}
          style={{ backgroundColor: statusDotColor[svc.status] }}
        />

        {/* Service name */}
        <span className="text-sm font-semibold text-neutral-800 font-mono w-44 flex-shrink-0 text-left truncate">
          {svc.name}
        </span>

        {/* Sparkbar */}
        <UptimeSparkbar days={svc.sparkDays} />

        {/* Status chip */}
        <span className="flex-shrink-0 ml-2">
          <StatusCapsule status={capsule.status} label={capsule.label} />
        </span>

        {/* MTTR */}
        <span className="text-xs font-mono text-neutral-400 flex-shrink-0 w-14 text-right hidden sm:block">
          {svc.mttr}
        </span>

        {/* Chevron */}
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 text-neutral-300 flex-shrink-0 transition-transform duration-200",
            expanded && "rotate-180"
          )}
        />
      </button>

      <AnimatePresence>
        {expanded && <ServiceDetail svc={svc} />}
      </AnimatePresence>
    </div>
  );
};

// ── Uptime calendar helpers ───────────────────────────────────────────────────
const TODAY = new Date(2026, 4, 19); // May 19, 2026
const SPARK_START = new Date(TODAY.getTime() - 89 * 86400000); // Feb 19, 2026

function sparkIndexForDate(d: Date): number {
  return Math.round((d.getTime() - SPARK_START.getTime()) / 86400000);
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function getFirstDayOfWeek(year: number, month: number): number {
  return new Date(year, month - 1, 1).getDay();
}

function monthUptimePct(year: number, month: number, sparkDays: SparkDay[]): number | null {
  let up = 0, total = 0;
  for (let d = 1; d <= getDaysInMonth(year, month); d++) {
    const idx = sparkIndexForDate(new Date(year, month - 1, d));
    if (idx >= 0 && idx <= 89) {
      total++;
      if (sparkDays[idx] === "healthy") up++;
      // degraded counts as partial – show as partial uptime
      if (sparkDays[idx] === "degraded") up += 0.5;
    }
  }
  return total > 0 ? (up / total) * 100 : null;
}

const calDayColor: Record<string, string> = {
  healthy: "#00A63E",
  degraded: "#E19A04",
  down: "#E7000B",
  "no-data": "#CBD5E1",
  future: "#F1F5F9",
  empty: "transparent",
};

const MONTH_NAMES = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const DOW = ["S","M","T","W","T","F","S"];

const MonthCalendar = ({
  year, month, sparkDays,
}: { year: number; month: number; sparkDays: SparkDay[] }) => {
  const dim = getDaysInMonth(year, month);
  const fdow = getFirstDayOfWeek(year, month);
  const pct = monthUptimePct(year, month, sparkDays);

  const cells: string[] = Array(fdow).fill("empty");
  for (let d = 1; d <= dim; d++) {
    const idx = sparkIndexForDate(new Date(year, month - 1, d));
    if (idx < 0) cells.push("no-data");
    else if (idx > 89) cells.push("future");
    else cells.push(sparkDays[idx]);
  }

  const pctColor = pct === null ? "#94A3B8"
    : pct >= 99 ? "#00A63E"
    : pct >= 90 ? "#E19A04"
    : "#E7000B";

  return (
    <div className="flex flex-col gap-2.5 min-w-0">
      <div className="flex items-center justify-between gap-4">
        <span className="text-sm font-bold text-neutral-800">{MONTH_NAMES[month - 1]} {year}</span>
        {pct !== null && (
          <span className="text-sm font-mono font-bold flex-shrink-0" style={{ color: pctColor }}>
            {pct.toFixed(2)}%
          </span>
        )}
      </div>
      <div className="grid grid-cols-7 gap-[3px]">
        {DOW.map((d, i) => (
          <span key={i} className="text-[9px] text-neutral-400 font-bold text-center pb-0.5">{d}</span>
        ))}
        {cells.map((cell, i) => (
          <div
            key={i}
            className="rounded transition-opacity hover:opacity-80"
            style={{
              backgroundColor: calDayColor[cell] ?? "#E2E8F0",
              aspectRatio: "1",
              opacity: cell === "no-data" ? 0.45 : 1,
            }}
            title={cell !== "empty" ? cell : undefined}
          />
        ))}
      </div>
    </div>
  );
};

const UptimeCalendarView = ({ sparkDays }: { sparkDays: SparkDay[] }) => {
  // window = [year, month] of the MIDDLE month shown (3 shown total)
  const [windowCenter, setWindowCenter] = useState<[number, number]>([2026, 4]); // April 2026

  function shiftMonth(base: [number, number], delta: number): [number, number] {
    let [y, m] = base;
    m += delta;
    while (m > 12) { m -= 12; y++; }
    while (m < 1)  { m += 12; y--; }
    return [y, m];
  }

  const months: [number, number][] = [
    shiftMonth(windowCenter, -1),
    windowCenter,
    shiftMonth(windowCenter, 1),
  ];

  const canGoForward = windowCenter[0] < 2026 || windowCenter[1] < 5;
  const canGoBack    = !(windowCenter[0] === 2025 && windowCenter[1] <= 1);

  return (
    <div className="flex flex-col gap-6">
      {/* Date nav */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={() => canGoBack && setWindowCenter(w => shiftMonth(w, -1))}
          disabled={!canGoBack}
          className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft className="w-3.5 h-3.5 text-neutral-600" />
        </button>
        <span className="text-xs font-mono text-neutral-600 w-52 text-center">
          {MONTH_NAMES[months[0][1] - 1]} {months[0][0]} — {MONTH_NAMES[months[2][1] - 1]} {months[2][0]}
        </span>
        <button
          onClick={() => canGoForward && setWindowCenter(w => shiftMonth(w, 1))}
          disabled={!canGoForward}
          className="p-1.5 rounded border border-neutral-200 hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight className="w-3.5 h-3.5 text-neutral-600" />
        </button>
      </div>

      {/* 3 month grids */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
        {months.map(([y, m]) => (
          <MonthCalendar key={`${y}-${m}`} year={y} month={m} sparkDays={sparkDays} />
        ))}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 text-[10px] font-mono text-neutral-500 pt-1 border-t border-neutral-100">
        {[
          { label: "Healthy", color: "#00A63E" },
          { label: "Degraded", color: "#E19A04" },
          { label: "Outage", color: "#E7000B" },
          { label: "No data", color: "#CBD5E1" },
        ].map(({ label, color }) => (
          <span key={label} className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded flex-shrink-0" style={{ backgroundColor: color }} />
            {label}
          </span>
        ))}
        <span className="ml-auto text-neutral-400">Each square = 1 day</span>
      </div>
    </div>
  );
};

// ── Service status grid ───────────────────────────────────────────────────────
const categoryLabel: Record<string, string> = {
  Core: "Core Services",
  Data: "Data Services",
  Inference: "Inference Services",
};

const ServiceStatusGrid = ({ onShowUptime }: { onShowUptime: () => void }) => (
  <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 space-y-6">
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4 text-[10px] font-mono text-neutral-400">
        {(["healthy", "degraded", "down", "no-data"] as SparkDay[]).map(d => (
          <span key={d} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded flex-shrink-0" style={{ backgroundColor: dayColor[d] }} />
            {d}
          </span>
        ))}
      </div>
      <button
        onClick={onShowUptime}
        className="text-xs text-[#00775B] font-mono hover:text-[#00956D] hover:underline transition-colors"
      >
        Past 90 days →
      </button>
    </div>

    {CATEGORIES.map(cat => {
      const services = SERVICES.filter(s => s.category === cat);
      const allHealthy = services.every(s => s.status === "healthy");
      const anyDown = services.some(s => s.status === "down");
      const groupStatus = anyDown ? "down" : allHealthy ? "healthy" : "degraded";
      return (
        <motion.div
          key={cat}
          className="bg-white rounded border border-neutral-200 shadow-sm overflow-hidden"
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Category header */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-neutral-100 bg-neutral-50">
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "w-2 h-2 rounded",
                  groupStatus !== "healthy" && "animate-pulse"
                )}
                style={{ backgroundColor: statusDotColor[groupStatus as ServiceHealth] }}
              />
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                {categoryLabel[cat]}
              </span>
            </div>
            <span className="text-[10px] font-mono text-neutral-400">
              {services.filter(s => s.status === "healthy").length}/{services.length} healthy
            </span>
          </div>

          {/* Service rows */}
          {services.map((svc, i) => (
            <ServiceRow key={svc.id} svc={svc} isLast={i === services.length - 1} />
          ))}
        </motion.div>
      );
    })}
  </section>
);

// ── Incident timeline ─────────────────────────────────────────────────────────
function formatIncidentDate(d: Date): string {
  const now = new Date("2026-05-18");
  const diff = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diff === 0) return "Today";
  if (diff === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const incidentSeverityColors: Record<string, string> = {
  critical: "#E7000B",
  major: "#EA580C",
  minor: "#E19A04",
};

const incidentStatusMap: Record<string, { status: string; label: string }> = {
  resolved: { status: "resolved", label: "Resolved" },
  ongoing: { status: "critical", label: "Ongoing" },
  monitoring: { status: "warning", label: "Monitoring" },
};

const IncidentEntry = ({ incident }: { incident: IncidentRecord }) => {
  const capsule = incidentStatusMap[incident.status];
  return (
    <div className="flex items-start gap-4 px-5 py-4 border-b last:border-b-0 border-neutral-50">
      <div className="flex flex-col items-center gap-1 flex-shrink-0 mt-0.5">
        <span
          className="w-2.5 h-2.5 rounded flex-shrink-0"
          style={{ backgroundColor: incidentSeverityColors[incident.severity] }}
        />
        <span className="w-px flex-1 bg-neutral-100 min-h-[12px]" />
      </div>
      <div className="flex-1 min-w-0 pb-1">
        <p className="text-sm font-semibold text-neutral-800 leading-snug">{incident.title}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1.5">
          <StatusCapsule status={capsule.status} label={capsule.label} />
          <span className="text-xs text-neutral-400 font-mono capitalize">{incident.severity}</span>
          <span className="text-neutral-200 text-xs">·</span>
          <span className="text-xs font-mono text-neutral-400">{incident.durationLabel}</span>
        </div>
        {incident.affectedServices.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2">
            {incident.affectedServices.map(svc => (
              <span
                key={svc}
                className="text-[10px] font-mono bg-neutral-100 text-neutral-500 px-2 py-0.5 rounded"
              >
                {svc}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HistorySection = ({
  activeTab, setActiveTab,
}: {
  activeTab: "incidents" | "uptime";
  setActiveTab: (t: "incidents" | "uptime") => void;
}) => {
  const buckets: Record<string, IncidentRecord[]> = {};
  INCIDENTS.forEach(inc => {
    const key = formatIncidentDate(inc.startedAt);
    if (!buckets[key]) buckets[key] = [];
    buckets[key].push(inc);
  });

  const [selectedServiceId, setSelectedServiceId] = useState(SERVICES[0].id);
  const selectedService = SERVICES.find(s => s.id === selectedServiceId) ?? SERVICES[0];

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 pb-8">
      {/* Header + tabs */}
      <div className="flex items-center justify-start mb-6">
        <div className="flex items-center bg-neutral-100 rounded p-0.5 gap-0.5">
          {(["incidents", "uptime"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={cn(
                "px-3 py-1 rounded text-xs font-semibold capitalize transition-colors",
                activeTab === tab
                  ? "bg-white text-neutral-900 shadow-sm"
                  : "text-neutral-500 hover:text-neutral-700"
              )}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {activeTab === "incidents" ? (
          <motion.div
            key="incidents"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-6"
          >
            {Object.entries(buckets).map(([date, incidents]) => (
              <div key={date}>
                <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">{date}</p>
                <div className="bg-white rounded border border-neutral-200 shadow-sm overflow-hidden">
                  {incidents.map(inc => (
                    <IncidentEntry key={inc.id} incident={inc} />
                  ))}
                </div>
              </div>
            ))}
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-neutral-400 mb-3">Past 90 Days</p>
              <div className="bg-white rounded border border-neutral-200 shadow-sm px-5 py-8 flex flex-col items-center gap-2 text-center">
                <CheckCircle2 className="w-7 h-7 text-[#00A63E]" />
                <p className="text-sm font-semibold text-neutral-600">No major incidents before May 14</p>
                <p className="text-xs text-neutral-400">All services operated within SLA thresholds.</p>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="uptime"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <div className="bg-white rounded border border-neutral-200 shadow-sm p-6 flex flex-col gap-6">
              {/* Service selector */}
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold uppercase tracking-widest text-neutral-400 flex-shrink-0">
                  Service
                </label>
                <select
                  value={selectedServiceId}
                  onChange={e => setSelectedServiceId(e.target.value)}
                  className="text-sm font-mono font-semibold text-neutral-800 bg-neutral-50 border border-neutral-200 rounded px-3 py-1.5 pr-8 focus:outline-none focus:ring-1 focus:ring-[#00775B] appearance-none cursor-pointer"
                  style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%2394A3B8' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")", backgroundRepeat: "no-repeat", backgroundPosition: "right 8px center" }}
                >
                  {SERVICES.map(svc => (
                    <option key={svc.id} value={svc.id}>{svc.name}</option>
                  ))}
                </select>
                <span className="ml-auto">
                  <StatusCapsule
                    status={statusCapsuleKey[selectedService.status].status}
                    label={statusCapsuleKey[selectedService.status].label}
                  />
                </span>
              </div>

              <UptimeCalendarView sparkDays={selectedService.sparkDays} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};

// ── Shared section wrapper ────────────────────────────────────────────────────
const SectionHeader = ({ icon, title, right }: { icon: React.ReactNode; title: string; right?: React.ReactNode }) => (
  <div className="flex items-center justify-between mb-5">
    <h2 className="text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-2">
      {icon}{title}
    </h2>
    {right}
  </div>
);

// ── Latency & Request Rate section ────────────────────────────────────────────
function latencyColor(ms: number): string {
  if (ms < 200)  return "#00A63E";
  if (ms < 500)  return "#E19A04";
  if (ms < 1000) return "#EA580C";
  return "#E7000B";
}

const METHOD_COLORS: Record<string, { bg: string; text: string }> = {
  GET:    { bg: "#EFF6FF", text: "#1D4ED8" },
  POST:   { bg: "#F0FDF4", text: "#15803D" },
  PUT:    { bg: "#FFFBEB", text: "#B45309" },
  DELETE: { bg: "#FEF2F2", text: "#B91C1C" },
  PATCH:  { bg: "#F5F3FF", text: "#7C3AED" },
  WS:     { bg: "#F0FDFA", text: "#0F766E" },
};

const MethodBadge = ({ method }: { method: string }) => {
  const c = METHOD_COLORS[method] ?? { bg: "#F1F5F9", text: "#475569" };
  return (
    <span
      className="text-[10px] font-black font-mono px-1.5 py-0.5 rounded flex-shrink-0"
      style={{ backgroundColor: c.bg, color: c.text }}
    >
      {method}
    </span>
  );
};

const LATENCY_SORT_OPTIONS: CGSortOption[] = [
  { key: "p95-desc",  label: "P95 — Highest first",    short: "P95 ↓" },
  { key: "p95-asc",   label: "P95 — Lowest first",     short: "P95 ↑" },
  { key: "p50-desc",  label: "P50 — Highest first",    short: "P50 ↓" },
  { key: "req-desc",  label: "Req/min — Highest first", short: "Req ↓" },
  { key: "req-asc",   label: "Req/min — Lowest first",  short: "Req ↑" },
];

const LATENCY_COLS: CGColumn<EndpointMetric>[] = [
  { key: "method",   label: "Method",   minWidth: 72,  render: (r) => <MethodBadge method={r.method} /> },
  { key: "path",     label: "Endpoint", minWidth: 240, render: (r, h) => <span style={{ fontFamily: "monospace", fontSize: 12, color: h ? "#0F172A" : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.path}>{r.path}</span> },
  { key: "service",  label: "Service",  minWidth: 160, render: (r, h) => <span style={{ fontFamily: "monospace", fontSize: 12, color: h ? "#0F172A" : "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.service}</span> },
  { key: "p50",      label: "P50",      minWidth: 72,  render: (r) => <span style={{ fontFamily: "monospace", fontSize: 12, color: latencyColor(r.p50Ms) }}>{r.p50Ms}ms</span> },
  { key: "p90",      label: "P90",      minWidth: 72,  render: (r) => <span style={{ fontFamily: "monospace", fontSize: 12, color: latencyColor(r.p90Ms) }}>{r.p90Ms}ms</span> },
  { key: "p95",      label: "P95",      minWidth: 88,  render: (r) => <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, color: latencyColor(r.p95Ms) }}>{r.p95Ms >= 1000 ? `${(r.p95Ms/1000).toFixed(1)}s` : `${r.p95Ms}ms`}</span> },
  { key: "reqPerMin",label: "Req/min",  minWidth: 80,  render: (r, h) => <span style={{ fontFamily: "monospace", fontSize: 12, color: h ? "#0F172A" : "#94A3B8" }}>{r.reqPerMin.toLocaleString()}/m</span> },
];

const LatencySection = () => {
  const [showOutliers, setShowOutliers] = useState(false);

  const baseData = showOutliers
    ? [...ENDPOINT_METRICS].sort((a, b) => b.p95Ms - a.p95Ms).slice(0, 10)
    : ENDPOINT_METRICS;

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-10 space-y-0">
      <CommandGrid<EndpointMetric>
        columns={LATENCY_COLS}
        data={baseData}
        rowsPerPage={10}
        searchPlaceholder="Search endpoints, services…"
        searchFilter={(r, q) => [r.path, r.service, r.method].some(f => f.toLowerCase().includes(q.toLowerCase()))}
        sortOptions={LATENCY_SORT_OPTIONS}
        defaultSort="p95-desc"
        applySort={(rows, key) => {
          const s = [...rows];
          if (key === "p95-desc") s.sort((a, b) => b.p95Ms - a.p95Ms);
          else if (key === "p95-asc")  s.sort((a, b) => a.p95Ms - b.p95Ms);
          else if (key === "p50-desc") s.sort((a, b) => b.p50Ms - a.p50Ms);
          else if (key === "req-desc") s.sort((a, b) => b.reqPerMin - a.reqPerMin);
          else if (key === "req-asc")  s.sort((a, b) => a.reqPerMin - b.reqPerMin);
          return s;
        }}
        emptyMessage="No endpoints match your search."
        toolbarExtras={
          <button
            onClick={() => setShowOutliers(v => !v)}
            style={{
              fontSize: 11, fontWeight: 600, fontFamily: "Inter, sans-serif",
              padding: "3px 10px", borderRadius: 4, cursor: "pointer",
              border: showOutliers ? "1px solid #00775B" : "1px solid #E2E8F0",
              backgroundColor: showOutliers ? "#00775B" : "transparent",
              color: showOutliers ? "#fff" : "#64748B",
              transition: "all 150ms ease", whiteSpace: "nowrap",
            }}
          >
            {showOutliers ? "✓ Top 10 P95" : "Top 10 P95"}
          </button>
        }
      />
    </section>
  );
};

// ── Errors section ────────────────────────────────────────────────────────────
const ERROR_SORT_OPTIONS: CGSortOption[] = [
  { key: "5xx-desc", label: "5xx errors — Most first",  short: "5xx ↓" },
  { key: "4xx-desc", label: "4xx errors — Most first",  short: "4xx ↓" },
  { key: "total-desc",label: "Total errors — Most first", short: "Total ↓" },
];

const ERROR_COLS: CGColumn<EndpointError>[] = [
  { key: "method",    label: "Method",   minWidth: 72,  render: (r) => <MethodBadge method={r.method} /> },
  { key: "path",      label: "Endpoint", minWidth: 240, render: (r, h) => <span style={{ fontFamily: "monospace", fontSize: 12, color: h ? "#0F172A" : "#475569", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }} title={r.path}>{r.path}</span> },
  { key: "service",   label: "Service",  minWidth: 160, render: (r, h) => <span style={{ fontFamily: "monospace", fontSize: 12, color: h ? "#0F172A" : "#94A3B8", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", display: "block" }}>{r.service}</span> },
  { key: "count4xx",  label: "4xx",      minWidth: 80,  render: (r) => <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, color: r.count4xx > 0 ? "#E19A04" : "#CBD5E1" }}>{r.count4xx > 0 ? `${r.count4xx}` : "—"}</span> },
  { key: "count5xx",  label: "5xx",      minWidth: 80,  render: (r) => <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, color: r.count5xx > 0 ? "#E7000B" : "#CBD5E1" }}>{r.count5xx > 0 ? `${r.count5xx}` : "—"}</span> },
];

const ErrorsSection = () => {
  const total4xx = ENDPOINT_ERRORS.reduce((a, e) => a + e.count4xx, 0);
  const total5xx = ENDPOINT_ERRORS.reduce((a, e) => a + e.count5xx, 0);

  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
      <div className="flex justify-start mb-4">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2 h-2 rounded bg-[#E19A04]" />
            <span className="text-neutral-500">4xx Client</span>
            <span className="font-black text-neutral-800 ml-1">{total4xx.toLocaleString()}</span>
          </span>
          <span className="text-neutral-200">|</span>
          <span className="flex items-center gap-1.5 text-xs font-mono">
            <span className="w-2 h-2 rounded bg-[#E7000B]" />
            <span className="text-neutral-500">5xx Server</span>
            <span className="font-black text-neutral-800 ml-1">{total5xx.toLocaleString()}</span>
          </span>
        </div>
      </div>
      <CommandGrid<EndpointError>
        columns={ERROR_COLS}
        data={ENDPOINT_ERRORS}
        rowsPerPage={10}
        searchPlaceholder="Search endpoints, services…"
        searchFilter={(r, q) => [r.path, r.service, r.method].some(f => f.toLowerCase().includes(q.toLowerCase()))}
        sortOptions={ERROR_SORT_OPTIONS}
        defaultSort="5xx-desc"
        applySort={(rows, key) => {
          const s = [...rows];
          if (key === "5xx-desc")   s.sort((a, b) => b.count5xx - a.count5xx);
          else if (key === "4xx-desc")   s.sort((a, b) => b.count4xx - a.count4xx);
          else if (key === "total-desc") s.sort((a, b) => (b.count4xx + b.count5xx) - (a.count4xx + a.count5xx));
          return s;
        }}
        renderExpand={(ee) => (
          <div style={{ padding: "12px 20px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "72px 1fr 80px 120px", gap: 12, marginBottom: 8 }}>
              {["Code", "Message", "Count", "Last seen"].map(h => (
                <span key={h} style={{ fontSize: 10, fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.07em", color: "#94A3B8", fontFamily: "Inter, sans-serif" }}>{h}</span>
              ))}
            </div>
            {ee.errors.map((err, i) => {
              const is4xx = err.code < 500;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "72px 1fr 80px 120px", gap: 12, alignItems: "center", padding: "6px 0", borderTop: "1px solid #E2E8F0" }}>
                  <span style={{ fontFamily: "monospace", fontSize: 11, fontWeight: 900, padding: "2px 6px", borderRadius: 4, textAlign: "center" as const, backgroundColor: is4xx ? "#FFFBEB" : "#FEF2F2", color: is4xx ? "#B45309" : "#B91C1C" }}>{err.code}</span>
                  <span style={{ fontSize: 12, color: "#475569", fontFamily: "Inter, sans-serif" }}>{err.message}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: "#1E293B" }}>{err.count.toLocaleString()}</span>
                  <span style={{ fontFamily: "monospace", fontSize: 11, color: "#94A3B8" }}>{err.lastSeen}</span>
                </div>
              );
            })}
          </div>
        )}
        emptyMessage="No error endpoints match your search."
      />
    </section>
  );
};

// ── Resources section ─────────────────────────────────────────────────────────
const ProgressBar = ({ value, limit, warnAt = 0.75, critAt = 0.9 }: { value: number; limit: number; warnAt?: number; critAt?: number }) => {
  const pct = Math.min(value / limit, 1);
  const color = pct >= critAt ? "#E7000B" : pct >= warnAt ? "#E19A04" : "#00A63E";
  return (
    <div className="w-full h-1.5 bg-neutral-100 rounded overflow-hidden">
      <div className="h-full rounded transition-all" style={{ width: `${pct * 100}%`, backgroundColor: color }} />
    </div>
  );
};

function fmtMb(mb: number): string {
  return mb >= 1024 ? `${(mb / 1024).toFixed(1)}GB` : `${mb}MB`;
}

const ResourceCard = ({ res }: { res: ServiceResource }) => {
  const svc = SERVICES.find(s => s.id === res.serviceId);
  const dotColor = svc ? statusDotColor[svc.status] : "#94A3B8";

  return (
    <div className="bg-white rounded border border-neutral-200 shadow-sm p-4 flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded flex-shrink-0" style={{ backgroundColor: dotColor }} />
        <span className="text-xs font-bold font-mono text-neutral-800 truncate">{res.serviceId}</span>
      </div>

      {/* Memory */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Memory</span>
          <span className="text-[10px] font-mono text-neutral-500">{fmtMb(res.memoryMb)} / {fmtMb(res.memoryLimitMb)}</span>
        </div>
        <ProgressBar value={res.memoryMb} limit={res.memoryLimitMb} />
      </div>

      {/* Storage */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-400">Storage</span>
          <span className="text-[10px] font-mono text-neutral-500">{fmtMb(res.storageMb)} / {fmtMb(res.storageLimitMb)}</span>
        </div>
        <ProgressBar value={res.storageMb} limit={res.storageLimitMb} warnAt={0.7} critAt={0.85} />
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-2 pt-1 border-t border-neutral-50">
        {[
          { label: "Goroutines", value: res.goroutines.toLocaleString() },
          { label: "Threads",    value: res.threads.toString() },
          { label: "IOPS Read",  value: res.iopsRead > 0 ? `${res.iopsRead}/s` : "—" },
          { label: "IOPS Write", value: res.iopsWrite > 0 ? `${res.iopsWrite}/s` : "—" },
        ].map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-0.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">{label}</span>
            <span className="text-xs font-black font-mono text-neutral-800">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

const ResourcesSection = () => (
  <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {SERVICE_RESOURCES.map(res => <ResourceCard key={res.serviceId} res={res} />)}
    </div>
  </section>
);

// ── Dependencies section ──────────────────────────────────────────────────────
const CB_CONFIG: Record<CircuitBreakerState, { label: string; color: string; bg: string }> = {
  closed:    { label: "Closed",    color: "#15803D", bg: "#F0FDF4" },
  "half-open": { label: "Half-open", color: "#B45309", bg: "#FFFBEB" },
  open:      { label: "Open",      color: "#B91C1C", bg: "#FEF2F2" },
};

const DEP_SORT_OPTIONS: CGSortOption[] = [
  { key: "dbLat-desc",  label: "DB Latency — Highest first",  short: "DB Lat ↓" },
  { key: "dbLat-asc",   label: "DB Latency — Lowest first",   short: "DB Lat ↑" },
  { key: "cache-asc",   label: "Cache Hit — Lowest first",     short: "Cache ↑" },
  { key: "retry-desc",  label: "Retries — Most first",         short: "Retries ↓" },
];

const DEP_COLS: CGColumn<ServiceDependency>[] = [
  {
    key: "service", label: "Service", minWidth: 180,
    render: (r) => {
      const svc = SERVICES.find(s => s.id === r.serviceId);
      const dotColor = svc ? statusDotColor[svc.status] : "#94A3B8";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, flexShrink: 0, backgroundColor: dotColor }} />
          <span style={{ fontFamily: "monospace", fontSize: 12, color: "#334155", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.serviceId}</span>
        </div>
      );
    },
  },
  {
    key: "dbLat", label: "DB Query Latency", minWidth: 160,
    render: (r) => {
      const c = r.dbQueryLatencyMs === null ? "#94A3B8"
        : r.dbQueryLatencyMs < 50 ? "#00A63E"
        : r.dbQueryLatencyMs < 200 ? "#B45309"
        : "#B91C1C";
      return <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, color: c }}>{r.dbQueryLatencyMs === null ? "—" : r.dbQueryLatencyMs >= 1000 ? `${(r.dbQueryLatencyMs/1000).toFixed(1)}s` : `${r.dbQueryLatencyMs}ms`}</span>;
    },
  },
  {
    key: "cache", label: "Cache Hit Ratio", minWidth: 160,
    render: (r) => {
      const c = r.cacheHitRatioPct >= 90 ? "#00A63E" : r.cacheHitRatioPct >= 70 ? "#B45309" : "#B91C1C";
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, color: r.cacheHitRatioPct > 0 ? c : "#CBD5E1" }}>{r.cacheHitRatioPct > 0 ? `${r.cacheHitRatioPct.toFixed(1)}%` : "—"}</span>
          {r.cacheHitRatioPct > 0 && <div style={{ height: 4, width: "100%", backgroundColor: "#F1F5F9", borderRadius: 2, overflow: "hidden" }}><div style={{ height: "100%", width: `${r.cacheHitRatioPct}%`, backgroundColor: c, borderRadius: 2 }} /></div>}
        </div>
      );
    },
  },
  {
    key: "cb", label: "Circuit Breaker", minWidth: 140,
    render: (r) => {
      const cb = CB_CONFIG[r.circuitBreakerState];
      return (
        <span style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, fontFamily: "Inter, sans-serif", padding: "3px 8px", borderRadius: 4, backgroundColor: cb.bg, color: cb.color }}>
          <span style={{ width: 6, height: 6, borderRadius: 2, backgroundColor: cb.color }} />
          {cb.label}
        </span>
      );
    },
  },
  {
    key: "conn", label: "DB Connections", minWidth: 160,
    render: (r) => {
      const pct = r.dbConnections / r.dbConnectionLimit;
      const c = pct >= 0.9 ? "#B91C1C" : pct >= 0.7 ? "#B45309" : "#00A63E";
      return (
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontFamily: "monospace", fontSize: 12, fontWeight: 700, color: c, whiteSpace: "nowrap" }}>{r.dbConnections} / {r.dbConnectionLimit}</span>
          <div style={{ flex: 1, height: 4, backgroundColor: "#F1F5F9", borderRadius: 2, overflow: "hidden", maxWidth: 56 }}><div style={{ height: "100%", width: `${pct * 100}%`, backgroundColor: c, borderRadius: 2 }} /></div>
        </div>
      );
    },
  },
  {
    key: "retry", label: "Retries", minWidth: 100,
    render: (r) => {
      const c = r.retryCount === 0 ? "#CBD5E1" : r.retryCount < 10 ? "#00A63E" : r.retryCount < 100 ? "#B45309" : "#B91C1C";
      return <span style={{ fontFamily: "monospace", fontSize: 13, fontWeight: 900, color: c }}>{r.retryCount === 0 ? "—" : r.retryCount.toLocaleString()}</span>;
    },
  },
];

const DependencySection = () => {
  return (
    <section className="max-w-7xl mx-auto px-6 lg:px-12 mt-10">
      <CommandGrid<ServiceDependency>
        columns={DEP_COLS}
        data={SERVICE_DEPENDENCIES}
        rowsPerPage={12}
        searchPlaceholder="Search services…"
        searchFilter={(r, q) => r.serviceId.toLowerCase().includes(q.toLowerCase())}
        sortOptions={DEP_SORT_OPTIONS}
        defaultSort="dbLat-desc"
        applySort={(rows, key) => {
          const s = [...rows];
          if (key === "dbLat-desc")  s.sort((a, b) => (b.dbQueryLatencyMs ?? -1) - (a.dbQueryLatencyMs ?? -1));
          else if (key === "dbLat-asc")   s.sort((a, b) => (a.dbQueryLatencyMs ?? Infinity) - (b.dbQueryLatencyMs ?? Infinity));
          else if (key === "cache-asc")   s.sort((a, b) => a.cacheHitRatioPct - b.cacheHitRatioPct);
          else if (key === "retry-desc")  s.sort((a, b) => b.retryCount - a.retryCount);
          return s;
        }}
        emptyMessage="No dependency records match your search."
      />
    </section>
  );
};

// ── Monitoring tabs ───────────────────────────────────────────────────────────
type MainTab = "status" | "latency" | "errors" | "resources" | "dependencies" | "history";

const MonitoringTabs = () => {
  const [activeTab, setActiveTab] = useState<MainTab>("status");
  const [historySubTab, setHistorySubTab] = useState<"incidents" | "uptime">("incidents");

  const totalErrors = ENDPOINT_ERRORS.reduce((a, e) => a + e.count4xx + e.count5xx, 0);

  function showUptime() {
    setActiveTab("history");
    setHistorySubTab("uptime");
  }

  const tabs: { id: MainTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: "status",       label: "Status",       icon: <Activity className="w-3.5 h-3.5" /> },
    { id: "latency",      label: "Latency",       icon: <Zap className="w-3.5 h-3.5" /> },
    { id: "errors",       label: "Errors",        icon: <XCircle className="w-3.5 h-3.5" />, badge: totalErrors.toLocaleString() },
    { id: "resources",    label: "Resources",     icon: <Server className="w-3.5 h-3.5" /> },
    { id: "dependencies", label: "Dependencies",  icon: <Link2 className="w-3.5 h-3.5" /> },
    { id: "history",      label: "History",       icon: <Clock className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="mt-6 pb-16">
      {/* Sticky tab bar */}
      <div className="sticky top-14 z-40 bg-[#F8FAFC] border-b border-neutral-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex items-center gap-0 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-3 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 -mb-px focus-visible:outline-none",
                activeTab === tab.id
                  ? "border-[#00775B] text-[#00775B]"
                  : "border-transparent text-neutral-400 hover:text-neutral-700"
              )}
            >
              {tab.icon}
              {tab.label}
              {tab.badge && (
                <span
                  className="ml-0.5 text-[9px] font-black px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "#FEF2F2", color: "#B91C1C" }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.16 }}
        >
          {activeTab === "status"       && <ServiceStatusGrid onShowUptime={showUptime} />}
          {activeTab === "latency"      && <LatencySection />}
          {activeTab === "errors"       && <ErrorsSection />}
          {activeTab === "resources"    && <ResourcesSection />}
          {activeTab === "dependencies" && <DependencySection />}
          {activeTab === "history"      && (
            <HistorySection activeTab={historySubTab} setActiveTab={setHistorySubTab} />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

// ── Footer ────────────────────────────────────────────────────────────────────
const Footer = () => (
  <footer className="border-t border-neutral-100 bg-neutral-50">
    <div className="max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-5 h-5 opacity-60">
          <MatriceLogo className="w-full h-full" />
        </div>
        <span className="text-xs text-neutral-400">© 2026 Matrice AI · Internal Status Page</span>
      </div>
      <span className="text-xs font-mono text-neutral-300">v1.0.0</span>
    </div>
  </footer>
);

// ── Embedded content (used inside AppLayout) ──────────────────────────────────
export function MicroservicesContent() {
  const { countdown } = useRefreshCountdown(30);
  return (
    <div className="font-sans text-neutral-900 -mx-4 lg:-mx-6">
      <HeroSection countdown={countdown} />
      <LiveMetricsStrip />
      <MonitoringTabs />
    </div>
  );
}

// ── Root page (standalone status.html) ───────────────────────────────────────
export function StatusPage() {
  const { countdown } = useRefreshCountdown(30);

  return (
    <div className="min-h-screen bg-[#F8FAFC] font-sans text-neutral-900">
      <TopBar />
      <HeroSection countdown={countdown} />
      <LiveMetricsStrip />
      <MonitoringTabs />
      <Footer />
    </div>
  );
}
