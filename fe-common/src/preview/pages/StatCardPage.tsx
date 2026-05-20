import { StatCard, StatCardSkeleton, STAT_PRESETS, type StatCardData } from "../../components/ui/StatCard";

// ─── Sample data ──────────────────────────────────────────────────────────────

const CARDS: StatCardData[] = [
  {
    label: "Total Detections",  value: "24,891", sublabel: "Events this month",
    num: "+12.4%", ref_: "vs last month",  dir: "up",
    chip: "LIVE",   ...STAT_PRESETS.teal,
  },
  {
    label: "Critical Alerts",   value: "142",    sublabel: "Unresolved incidents",
    num: "+8",     ref_: "since yesterday", dir: "up",
    chip: "ALERT",  ...STAT_PRESETS.red,
  },
  {
    label: "Model Accuracy",    value: "98.3%",  sublabel: "Avg across all models",
    num: "+0.4%",  ref_: "vs last week",   dir: "up",
    chip: "MODELS", ...STAT_PRESETS.blue,
  },
  {
    label: "Avg Response Time", value: "47ms",   sublabel: "P95 inference latency",
    num: "-3ms",   ref_: "vs last week",   dir: "down",
    chip: "PERF",   ...STAT_PRESETS.purple,
  },
];

const SPARKLINE_DATA: StatCardData[] = [
  {
    label: "Daily Throughput", value: "3,214", sublabel: "Frames processed/day",
    num: "+5.2%",  ref_: "vs yesterday", dir: "up",
    chip: "LIVE", ...STAT_PRESETS.teal,
    sparkline: [120, 145, 132, 178, 165, 190, 185, 214, 198, 232],
  },
  {
    label: "Error Rate",       value: "0.12%", sublabel: "Pipeline failures",
    num: "-0.04%", ref_: "vs last week",  dir: "down",
    chip: "SLA",  ...STAT_PRESETS.red,
    sparkline: [18, 22, 20, 15, 13, 10, 9, 12, 8, 7],
  },
  {
    label: "GPU Utilisation",  value: "76%",   sublabel: "Avg across cluster",
    num: "+4%",    ref_: "vs last hour",  dir: "up",
    chip: "INFRA", ...STAT_PRESETS.amber,
    sparkline: [60, 63, 70, 68, 72, 75, 74, 77, 73, 76],
  },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="flex flex-wrap gap-4 p-6 bg-white rounded-xl border border-gray-100">
        {children}
      </div>
      <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function StatCardPage() {
  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">StatCard <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">v1.2</span></h1>
        <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
          Metric cards with colored borders, glow-on-hover, accent chips, and trend badges.
          Supports compact size, sparkline variant, and loading skeleton.
        </p>
      </div>

      {/* Default */}
      <Section
        title="Default"
        code={`import { StatCard, STAT_PRESETS } from "@fe-common/components/ui/StatCard";

<StatCard d={{
  label: "Total Detections", value: "24,891",
  sublabel: "Events this month", num: "+12.4%",
  ref_: "vs last month", dir: "up",
  chip: "LIVE", ...STAT_PRESETS.teal,
}} />`}
      >
        {CARDS.map((card) => (
          <StatCard key={card.label} d={card} />
        ))}
      </Section>

      {/* Direction variants */}
      <Section
        title="Direction Variants  —  up · down · neutral"
        code={`// dir: "up" | "down" | "neutral"
<StatCard d={{ ..., dir: "up",      num: "+23%"  }} />
<StatCard d={{ ..., dir: "down",    num: "-18%"  }} />
<StatCard d={{ ..., dir: "neutral", num: "±0%"   }} />`}
      >
        <StatCard d={{ label: "Upward Trend",   value: "8,420", sublabel: "Weekly active users",
          num: "+23%", ref_: "vs prev week", dir: "up",      chip: "GROWTH", ...STAT_PRESETS.teal }} />
        <StatCard d={{ label: "Downward Trend", value: "1,204", sublabel: "Error count",
          num: "-18%", ref_: "vs prev week", dir: "down",    chip: "ERRORS", ...STAT_PRESETS.red  }} />
        <StatCard d={{ label: "Neutral Trend",  value: "99.9%", sublabel: "System uptime",
          num: "±0%",  ref_: "steady",       dir: "neutral", chip: "SLA",    ...STAT_PRESETS.slate }} />
      </Section>

      {/* Sparkline */}
      <Section
        title="Sparkline Variant"
        code={`// Provide a sparkline array to replace the trend badge with a mini chart
<StatCard d={{
  label: "Daily Throughput", value: "3,214",
  sublabel: "Frames/day", num: "+5.2%",
  ref_: "vs yesterday", dir: "up",
  chip: "LIVE", ...STAT_PRESETS.teal,
  sparkline: [120, 145, 132, 178, 165, 190, 185, 214, 198, 232],
}} />`}
      >
        {SPARKLINE_DATA.map((card) => (
          <StatCard key={card.label} d={card} />
        ))}
      </Section>

      {/* Compact */}
      <Section
        title="Compact Size"
        code={`<StatCard d={card} compact />`}
      >
        {CARDS.map((card) => (
          <StatCard key={card.label} d={card} compact />
        ))}
      </Section>

      {/* Without chip */}
      <Section
        title="No Chip"
        code={`// chip is optional — omit for a cleaner look
<StatCard d={{ ...card, chip: undefined }} />`}
      >
        {CARDS.map((card) => (
          <StatCard key={card.label} d={{ ...card, chip: undefined }} />
        ))}
      </Section>

      {/* Clickable */}
      <Section
        title="Clickable"
        code={`<StatCard d={card} onClick={() => navigate("/detections")} />`}
      >
        {CARDS.map((card) => (
          <StatCard
            key={card.label}
            d={card}
            onClick={() => {}}
          />
        ))}
      </Section>

      {/* Loading skeleton */}
      <Section
        title="Loading Skeleton"
        code={`// Renders a shimmer placeholder — same dimensions as the real card
<StatCard d={card} loading />

// Or use the bare skeleton primitive
<StatCardSkeleton />
<StatCardSkeleton compact />`}
      >
        <StatCard d={CARDS[0]} loading />
        <StatCard d={CARDS[0]} loading compact />
        <StatCardSkeleton />
        <StatCardSkeleton compact />
      </Section>

      {/* Colour presets */}
      <Section
        title="Colour Presets"
        code={`import { STAT_PRESETS } from "@fe-common/components/ui/StatCard";
// teal | red | blue | purple | amber | slate
<StatCard d={{ ..., ...STAT_PRESETS.amber }} />`}
      >
        {(Object.entries(STAT_PRESETS) as [string, { color: string; bgColor: string }][]).map(([name, preset]) => (
          <StatCard key={name} d={{
            label: name.toUpperCase(), value: "—",
            sublabel: `STAT_PRESETS.${name}`,
            num: "—", ref_: "", dir: "neutral",
            chip: name.toUpperCase(), ...preset,
          }} />
        ))}
      </Section>
    </div>
  );
}

export default StatCardPage;
