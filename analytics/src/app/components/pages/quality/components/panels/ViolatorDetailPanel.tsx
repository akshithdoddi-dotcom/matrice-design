import { MapPin, Clock, AlertTriangle } from "lucide-react";
import type { QualityTerminology, RepeatViolator } from "../../data/types";
import { QualitySlidePanel } from "./QualitySlidePanel";
import { cn } from "@/app/lib/utils";

interface Props {
  violator: RepeatViolator | null;
  onClose: () => void;
  terminology: QualityTerminology;
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="border-b border-t border-neutral-100 bg-neutral-50 px-5 py-2">
    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-neutral-400">{children}</p>
  </div>
);

const VIOLATION_COLORS: Record<string, string> = {
  "No Helmet":  "#EF4444",
  "No Vest":    "#F97316",
  "No Gloves":  "#F59E0B",
  "Zone Breach":"#8B5CF6",
  "Loitering":  "#94A3B8",
};

export const ViolatorDetailPanel = ({ violator, onClose, terminology }: Props) => {
  if (!violator) return null;

  const isRecurring = violator.badge === "RECURRING";
  const violationEntries = Object.entries(violator.violation_types).sort((a, b) => b[1] - a[1]);
  const totalViolations = violationEntries.reduce((s, [, c]) => s + c, 0);

  const lastTs = new Date(violator.last_violation_ts);
  const lastFormatted = lastTs.toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit"
  });

  return (
    <QualitySlidePanel
      isOpen={!!violator}
      onClose={onClose}
      title={`${terminology.repeatOffenderLabel} Detail`}
      subtitle={violator.anonymized_label}
    >
      {/* Hero */}
      <div className="bg-white border-b border-neutral-100 px-5 py-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className={cn(
                "w-8 h-8 rounded-[4px] flex items-center justify-center text-[13px] font-black",
                isRecurring ? "bg-amber-100 text-amber-700" : "bg-neutral-100 text-neutral-600"
              )}>
                {violator.tracker_id}
              </div>
              <span className="text-[16px] font-black text-neutral-900">{violator.anonymized_label}</span>
              {isRecurring && (
                <span className="inline-flex h-5 items-center rounded-[2px] border border-amber-200 bg-amber-50 px-1.5 text-[9px] font-black uppercase text-amber-700">
                  RECURRING
                </span>
              )}
            </div>
            <div className="text-[12px] text-neutral-400">
              {terminology.entityLabel} · {terminology.repeatOffenderLabel}
            </div>
          </div>
          <div className="text-right">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-1">
              {terminology.negativeCountLabel}
            </div>
            <div className="text-5xl font-black font-data tabular-nums leading-none text-red-600">
              {violator.violation_count}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mt-5">
          <div className="rounded-[4px] border border-neutral-200 bg-white p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">Days Seen</div>
            <div className="mt-1 text-[20px] font-black font-data tabular-nums text-neutral-800">{violator.days_seen}d</div>
          </div>
          <div className="rounded-[4px] border border-neutral-200 bg-white p-3 col-span-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 mb-1.5">Active Zones</div>
            <div className="flex flex-wrap gap-1">
              {violator.zones.map(z => (
                <span key={z} className="inline-flex h-5 items-center rounded-[2px] border border-neutral-200 bg-neutral-50 px-1.5 text-[10px] font-semibold text-neutral-600">
                  <MapPin className="w-2.5 h-2.5 mr-1" />{z}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[11px] text-neutral-400 rounded-[4px] border border-neutral-200 bg-neutral-50 px-3 py-2">
          <Clock className="w-3.5 h-3.5 shrink-0" />
          <span>Last {terminology.negativeEventLabel.toLowerCase()}: <span className="font-bold text-neutral-700 font-data tabular-nums">{lastFormatted}</span></span>
        </div>
      </div>

      {/* Violation type breakdown */}
      <SectionLabel>{terminology.negativeEventLabel} Type Breakdown</SectionLabel>
      <div className="bg-white px-5 py-4">
        <div className="space-y-3">
          {violationEntries.map(([type, count]) => {
            const pct = Math.round((count / totalViolations) * 100);
            const color = VIOLATION_COLORS[type] ?? "#94A3B8";
            return (
              <div key={type}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                    <span className="text-[12px] font-semibold text-neutral-700">{type}</span>
                  </div>
                  <span className="font-data tabular-nums text-[13px] font-black text-neutral-800">
                    {count}× <span className="text-[10px] text-neutral-400 font-normal">({pct}%)</span>
                  </span>
                </div>
                <div className="h-1.5 bg-neutral-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: color }}
                  />
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-start gap-2 rounded-[4px] border border-amber-200 bg-amber-50/50 p-3">
          <AlertTriangle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
          <div className="text-[11px] text-amber-700">
            <span className="font-bold">Action required:</span> {terminology.entityLabel} has {violator.violation_count} {terminology.negativeEventLabel.toLowerCase()}s over {violator.days_seen} days.
            {isRecurring ? " Flagged as recurring — escalation recommended." : " Monitor closely."}
          </div>
        </div>
      </div>

      {/* 7-day activity hint */}
      <SectionLabel>7-Day Activity Summary</SectionLabel>
      <div className="bg-white px-5 py-4 pb-10">
        <div className="flex items-end gap-1 h-16">
          {[3, 1, 2, 0, 1, 2, violator.violation_count > 3 ? 3 : violator.violation_count].map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
              <div
                className="w-full rounded-[2px]"
                style={{
                  height: `${(v / 4) * 100}%`,
                  backgroundColor: v >= 3 ? "#EF4444" : v >= 2 ? "#F97316" : v >= 1 ? "#F59E0B" : "#E5E7EB",
                  minHeight: v > 0 ? 4 : 0,
                }}
              />
              <span className="text-[8px] text-neutral-400">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
            </div>
          ))}
        </div>
        <div className="mt-2 text-[10px] text-neutral-400 text-center">
          {terminology.negativeEventLabel}s per day — last 7 days
        </div>
      </div>
    </QualitySlidePanel>
  );
};
