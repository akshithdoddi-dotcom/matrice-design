import { MatriceLogo } from "../../shared/svgs";
import { Button } from "./Button";

export interface ErrorPageProps {
  code?: 404 | 500;
  onHome?: () => void;
  onBack?: () => void;
  homeLabel?: string;
  backLabel?: string;
  className?: string;
}

/* ─── Pixel-art digit maps ──────────────────────────────────────────────── */

const CELL = 52;
const BLK  = 46;

const DIGIT: Record<string, number[][]> = {
  "4": [
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,0,0,0,1],
  ],
  "5": [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  "0": [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
};

function PixelChar({ char, ox, oy, color }: { char: string; ox: number; oy: number; color: string }) {
  const map = DIGIT[char] ?? [];
  return (
    <>
      {map.flatMap((row, ri) =>
        row.map((on, ci) =>
          on ? <rect key={`${ri}-${ci}`} x={ox + ci * CELL} y={oy + ri * CELL} width={BLK} height={BLK} fill={color} rx={3} /> : null
        )
      )}
    </>
  );
}

/* "404" total width: 5*CELL + GAP + 5*CELL + GAP + 5*CELL = 5*52+50+5*52+50+5*52 = 260+50+260+50+260 = 880 */
const ART_W = 5 * CELL * 3 + 50 * 2;  // 880
const ART_H = 7 * CELL;               // 364
const PAD   = 60;
const SVG_W = ART_W + PAD * 2;        // 1000
const SVG_H = ART_H + PAD * 2;        // 484

function PixelArt404({ color }: { color: string }) {
  const y0 = PAD;
  const x0 = PAD;
  const x1 = PAD + 5 * CELL + 50;
  const x2 = PAD + 5 * CELL * 2 + 100;
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-auto">
      <PixelChar char="4" ox={x0} oy={y0} color={color} />
      <PixelChar char="0" ox={x1} oy={y0} color={color} />
      <PixelChar char="4" ox={x2} oy={y0} color={color} />
    </svg>
  );
}

function PixelArt500({ color }: { color: string }) {
  const y0 = PAD;
  const x0 = PAD;
  const x1 = PAD + 5 * CELL + 50;
  const x2 = PAD + 5 * CELL * 2 + 100;
  return (
    <svg viewBox={`0 0 ${SVG_W} ${SVG_H}`} fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden className="w-full h-auto">
      <PixelChar char="5" ox={x0} oy={y0} color={color} />
      <PixelChar char="0" ox={x1} oy={y0} color={color} />
      <PixelChar char="0" ox={x2} oy={y0} color={color} />
    </svg>
  );
}

/* ─── Perspective floor grid background ─────────────────────────────────── */
function PerspectiveGrid() {
  const VPX = 500, VPY = -30;
  const BOTTOM = 780;
  const LEFT_EDGE = -800;
  const RIGHT_EDGE = 1800;
  const COL_STEP = 48;

  const bottomXs: number[] = [];
  for (let x = LEFT_EDGE; x <= RIGHT_EDGE; x += COL_STEP) bottomXs.push(x);

  const NUM_H = 14;
  const horizYs = Array.from({ length: NUM_H }, (_, i) => {
    const t = (i + 1) / (NUM_H + 1);
    return VPY + (BOTTOM - VPY) * Math.pow(t, 1.6);
  }).filter(y => y >= 0);

  // Receding lines used for dot paths (every 5th line, within visible range)
  const dotRLines = bottomXs.filter((_, i) => i % 5 === 0);
  // Horizontal lines used for dot paths (every 3rd)
  const dotHLines = horizYs.filter((_, i) => i % 3 === 1);

  return (
    <svg
      viewBox="0 0 1000 700"
      preserveAspectRatio="xMidYMid slice"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }}
      aria-hidden
    >
      {/* Receding lines */}
      {bottomXs.map((bx, i) => (
        <line key={`r${i}`} x1={VPX} y1={VPY} x2={bx} y2={BOTTOM}
          stroke="#00775B" strokeOpacity={0.06} strokeWidth="0.65" />
      ))}

      {/* Horizontal perspective lines */}
      {horizYs.map((y, i) => {
        const t = (y - VPY) / (BOTTOM - VPY);
        const xl = VPX - t * (VPX - LEFT_EDGE);
        const xr = VPX + t * (RIGHT_EDGE - VPX);
        return (
          <line key={`h${i}`} x1={xl} y1={y} x2={xr} y2={y}
            stroke="#00775B" strokeOpacity={0.03 + i * 0.006} strokeWidth="0.65" />
        );
      })}

      {/* Single slow teal scan line moving from VP toward viewer */}
      <path stroke="#00D4AA" fill="none" strokeWidth="1.3">
        <animate attributeName="d"
          values={`M ${VPX} ${VPY} L ${VPX} ${VPY};M ${LEFT_EDGE} ${BOTTOM} L ${RIGHT_EDGE} ${BOTTOM}`}
          dur="8s" begin="0s" repeatCount="indefinite" calcMode="linear" />
        <animate attributeName="stroke-opacity"
          values="0;0.55;0.45;0.1;0" keyTimes="0;0.04;0.6;0.92;1"
          dur="8s" begin="0s" repeatCount="indefinite" />
      </path>

      {/* Dots traveling along receding lines (VP → bottom) */}
      {dotRLines.map((bx, i) => (
        <circle key={`rd${i}`} r="2">
          <animateMotion
            path={`M ${VPX},${VPY} L ${bx},${BOTTOM}`}
            dur={`${3.5 + (i % 4) * 0.7}s`}
            begin={`${-(i * 1.1).toFixed(1)}s`}
            repeatCount="indefinite"
            calcMode="linear"
          />
          <animate attributeName="fill" values="#00D4AA;#00D4AA" dur="1s" repeatCount="indefinite" />
          <animate attributeName="fill-opacity"
            values="0;0.7;0.55;0" keyTimes="0;0.08;0.8;1"
            dur={`${3.5 + (i % 4) * 0.7}s`}
            begin={`${-(i * 1.1).toFixed(1)}s`}
            repeatCount="indefinite" />
          <animate attributeName="r"
            values="1.2;2.2;1.8;1"
            keyTimes="0;0.1;0.75;1"
            dur={`${3.5 + (i % 4) * 0.7}s`}
            begin={`${-(i * 1.1).toFixed(1)}s`}
            repeatCount="indefinite" />
        </circle>
      ))}

      {/* Dots traveling along horizontal lines (left ↔ right, alternating) */}
      {dotHLines.map((y, i) => {
        const t = (y - VPY) / (BOTTOM - VPY);
        const xl = VPX - t * (VPX - LEFT_EDGE);
        const xr = VPX + t * (RIGHT_EDGE - VPX);
        const goRight = i % 2 === 0;
        const p = goRight ? `M ${xl},${y} L ${xr},${y}` : `M ${xr},${y} L ${xl},${y}`;
        const dur = `${5 + i * 1.2}s`;
        const begin = `${-(i * 1.8).toFixed(1)}s`;
        return (
          <circle key={`hd${i}`} r="2">
            <animateMotion path={p} dur={dur} begin={begin} repeatCount="indefinite" calcMode="linear" />
            <animate attributeName="fill" values="#00D4AA;#00D4AA" dur="1s" repeatCount="indefinite" />
            <animate attributeName="fill-opacity"
              values="0;0.6;0.5;0" keyTimes="0;0.05;0.88;1"
              dur={dur} begin={begin} repeatCount="indefinite" />
            <animate attributeName="r"
              values="1;2;1.6;0.8"
              keyTimes="0;0.08;0.82;1"
              dur={dur} begin={begin} repeatCount="indefinite" />
          </circle>
        );
      })}

      {/* Static intersection dots */}
      {horizYs.slice(3).flatMap((y, hi) =>
        bottomXs.filter((_, ri) => ri % 3 === 0).map((bx, ri) => {
          const t = (y - VPY) / (BOTTOM - VPY);
          const ix = VPX + t * (bx - VPX);
          if (ix < 0 || ix > 1000) return null;
          return <circle key={`sd${hi}-${ri}`} cx={ix} cy={y} r={1.0} fill="#00775B" fillOpacity={0.09} />;
        })
      )}
    </svg>
  );
}


/* ─── 404: Minimal centered ─────────────────────────────────────────────── */
function Page404({ onHome, onBack, homeLabel, backLabel }: ErrorPageProps) {
  return (
    <div className="pg404-wrap flex flex-col items-center justify-center min-h-screen w-full px-8 py-16">

      {/* Logo */}
      <div className="flex items-center gap-2 mb-14">
        <MatriceLogo size={18} />
        <span className="pg404-label" style={{ fontFamily: "'JetBrains Mono',monospace", fontSize: 10, fontWeight: 700, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
          Matrice
        </span>
      </div>

      {/* 404 */}
      <div className="pg404-code" aria-hidden>404</div>

      {/* Divider */}
      <div className="pg404-rule" />

      {/* Copy */}
      <p className="pg404-heading">Page not found</p>
      <p className="pg404-sub">The page you're looking for doesn't exist or has been moved.</p>

      {/* CTA */}
      <div className="flex items-center gap-3 mt-8">
        <button onClick={onBack} className="pg404-back-btn">
          {backLabel ?? "← Go back"}
        </button>
        <Button onClick={onHome}>
          {homeLabel ?? "Return home"}
        </Button>
      </div>

      <style>{`
        .pg404-wrap    { background: #ffffff; }
        .pg404-label   { color: #94a3b8; }
        .pg404-code    { font-family: 'JetBrains Mono', monospace; font-size: clamp(72px, 12vw, 120px); font-weight: 700; letter-spacing: -0.02em; line-height: 1; color: #00775B; user-select: none; }
        .pg404-rule    { width: 36px; height: 1px; background: #e2e8f0; margin: 28px 0; }
        .pg404-heading { font-size: 15px; font-weight: 600; color: #1e293b; margin: 0 0 8px; }
        .pg404-sub     { font-size: 13px; color: #94a3b8; margin: 0; text-align: center; max-width: 38ch; line-height: 1.6; }
        .pg404-back-btn { display: inline-flex; align-items: center; justify-content: center; height: 40px; padding: 0 16px; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap; color: #475569; background: none; border: 1px solid #e2e8f0; border-radius: 6px; cursor: pointer; transition: border-color 0.15s, color 0.15s; box-sizing: border-box; }
        .pg404-back-btn:hover { border-color: #cbd5e1; color: #1e293b; }

        @media (prefers-color-scheme: dark) {
          .pg404-wrap    { background: #0a0f0d; }
          .pg404-code    { color: #00C896; }
          .pg404-rule    { background: #1e2d28; }
          .pg404-heading { color: #e2e8f0; }
          .pg404-sub     { color: #475569; }
          .pg404-label   { color: #334155; }
          .pg404-back-btn { color: #475569; border-color: #1e2d28; }
          .pg404-back-btn:hover { border-color: #334155; color: #94a3b8; }
        }
      `}</style>
    </div>
  );
}

/* ─── 500: clean error page matching 404 style ──────────────────────────── */
function Page500({ onHome, onBack, homeLabel, backLabel }: ErrorPageProps) {
  return (
    <div className="pg500-wrap relative flex flex-col items-center justify-center min-h-screen w-full px-8 py-12">
      <PerspectiveGrid />

      {/* Centered top brand mark */}
      <div className="absolute top-8 left-0 right-0 flex justify-center items-center gap-2 z-10">
        <MatriceLogo size={22} />
        <span className="pg500-label text-[11px] font-bold tracking-[0.12em] uppercase" style={{ fontFamily: "'JetBrains Mono',monospace" }}>
          Matrice
        </span>
      </div>

      {/* Pixel art 500 */}
      <div className="w-full max-w-2xl relative z-10">
        <PixelArt500 color="#E7000B" />
      </div>

      {/* Badge + copy + CTA */}
      <div className="flex flex-col items-center gap-5 mt-2 text-center relative z-10">
        <span className="pg500-badge inline-block text-[11px] font-medium rounded-full px-3 py-1 tracking-wide">
          System Error
        </span>

        <h1 className="pg500-title text-[1.35rem] font-medium leading-snug" style={{ maxWidth: "36ch" }}>
          Something went wrong on our end.
        </h1>

        <Button onClick={onHome}>
          {homeLabel ?? "Try again"} ›
        </Button>

        <button onClick={onBack} className="pg500-back text-[12px] transition-colors"
          style={{ background: "none", border: "none", cursor: "pointer" }}>
          {backLabel ?? "← Go back"}
        </button>
      </div>

      <style>{`
        .pg500-wrap {
          background: radial-gradient(ellipse 110% 75% at 50% 15%,
            #ffeeed 0%, #fff4f3 18%, #fdf9f8 40%, #faf8f8 65%, #f4f0f2 100%);
        }
        .pg500-label { color: #94a3b8; }
        .pg500-badge { color: #e7000b; border: 1px solid #fecdd3; background: #fff5f5; }
        .pg500-title { color: #1e293b; }
        .pg500-back  { color: #94a3b8; }
        .pg500-back:hover { color: #475569; }

        @media (prefers-color-scheme: dark) {
          .pg500-wrap {
            background: radial-gradient(ellipse 110% 75% at 50% 15%,
              #220808 0%, #160404 18%, #0e0303 40%, #080111 65%, #010312 100%);
          }
          .pg500-label { color: #475569; }
          .pg500-badge { color: #ff4444; border: 1px solid #3d1515; background: #1a0505; }
          .pg500-title { color: #e2e8f0; }
          .pg500-back  { color: #334155; }
          .pg500-back:hover { color: #64748b; }
        }
      `}</style>
    </div>
  );
}

/* ─── Public export ─────────────────────────────────────────────────────── */
export function ErrorPage({ code = 404, ...rest }: ErrorPageProps) {
  return code === 500
    ? <Page500 code={code} {...rest} />
    : <Page404 code={code} {...rest} />;
}
