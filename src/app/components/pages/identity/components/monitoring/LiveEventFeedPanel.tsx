import { useState, useMemo } from "react";
import { Panel } from "../shared/Panel";
import { ShieldAlert, Eye, Clock } from "lucide-react";
import { IDENTITY_ALERTS } from "../../data/mockData";
import type { IdentityAlert, IdentityTerminology } from "../../data/types";
import { cn } from "@/app/lib/utils";
import { IdentityEvidenceMedia } from "../shared/IdentityEvidenceMedia";

type FilterKey = "ALL" | "CRITICAL" | "HIGH" | "UNKNOWNS";

function timeAgo(ts: string): string {
  const [h, m] = ts.split(":").map(Number);
  const now = new Date();
  const then = new Date();
  then.setHours(h, m, 0, 0);
  const diff = Math.max(0, Math.floor((now.getTime() - then.getTime()) / 60_000));
  if (diff === 0) return "just now";
  if (diff < 60) return `${diff}m ago`;
  return `${Math.floor(diff / 60)}h ago`;
}

const SEVERITY_ROW: Record<string, { border: string; bg: string; badge: string; text: string }> = {
  CRITICAL: { border: "border-l-red-600",    bg: "bg-red-50/60",   badge: "bg-red-600 text-white",    text: "text-red-800" },
  HIGH:     { border: "border-l-orange-500", bg: "bg-white",        badge: "bg-orange-500 text-white", text: "text-orange-800" },
  MEDIUM:   { border: "border-l-amber-400",  bg: "bg-white",        badge: "bg-amber-400 text-white",  text: "text-amber-800" },
  LOW:      { border: "border-l-neutral-300",bg: "bg-white",        badge: "bg-neutral-400 text-white",text: "text-neutral-600" },
};

const FACE_SOURCES: Record<string, string> = {
  "Subject BL-003": "https://images.pexels.com/photos/14801453/pexels-photo-14801453.jpeg?cs=srgb&dl=pexels-kwizera-gadson-14801453.jpg&fm=jpg",
  "Unknown #88": "https://images.pexels.com/photos/33738484/pexels-photo-33738484.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-33738484.jpg&fm=jpg",
  "Executive VIP-007": "https://images.pexels.com/photos/33738484/pexels-photo-33738484.jpeg?cs=srgb&dl=pexels-vika-glitter-392079-33738484.jpg&fm=jpg",
};

function resolveEntityType(alert: IdentityAlert): "matched" | "unknown" | "blacklist" {
  if (["BLACKLIST_MATCH", "STOLEN_PLATE", "BOLO"].includes(alert.type)) return "blacklist";
  if (["UNKNOWN_AT_ENTRY", "UNREGISTERED_PLATE", "REPEATED_UNKNOWN"].includes(alert.type)) return "unknown";
  return "matched";
}

interface Props {
  terminology: IdentityTerminology;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
}

export const LiveEventFeedPanel = ({ terminology, onEntityClick }: Props) => {
  const [filter, setFilter] = useState<FilterKey>("ALL");

  const critCount = IDENTITY_ALERTS.filter(a => a.severity === "CRITICAL" && a.status === "ACTIVE").length;

  const filtered = useMemo(() => {
    const priority: Record<string, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };
    const sorted = [...IDENTITY_ALERTS].sort(
      (a, b) => (priority[a.severity] ?? 3) - (priority[b.severity] ?? 3)
    );
    if (filter === "CRITICAL") return sorted.filter(a => a.severity === "CRITICAL");
    if (filter === "HIGH") return sorted.filter(a => a.severity === "CRITICAL" || a.severity === "HIGH");
    if (filter === "UNKNOWNS") return sorted.filter(a =>
      ["UNKNOWN_AT_ENTRY", "UNREGISTERED_PLATE", "REPEATED_UNKNOWN"].includes(a.type)
    );
    return sorted;
  }, [filter]);

  const FILTERS: { key: FilterKey; label: string }[] = [
    { key: "ALL", label: "All" },
    { key: "CRITICAL", label: critCount > 0 ? `Critical (${critCount})` : "Critical" },
    { key: "HIGH", label: "High" },
    { key: "UNKNOWNS", label: terminology.isLPR ? "Unregistered" : "Unknowns" },
  ];

  const isLPR = terminology.isLPR;

  return (
    <Panel
      title="Security Triage Feed"
      icon={ShieldAlert}
      info="Real-time security events sorted by severity. Click View to see entity details."
      headerRight={
        <div className="flex items-center gap-1">
          {FILTERS.map(f => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={cn(
                "h-5 px-1.5 rounded-[2px] text-[9px] font-bold transition-colors whitespace-nowrap",
                filter === f.key
                  ? f.key === "CRITICAL" && critCount > 0
                    ? "bg-red-600 text-white"
                    : "bg-[#00775B] text-white"
                  : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      }
    >
      <div className="overflow-x-auto -mx-4 -mb-4">
        <table className="w-full text-xs min-w-[600px]">
          <thead>
            <tr className="border-b border-neutral-100 bg-neutral-50/80">
              <th className="pl-4 pr-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-12">
                {isLPR ? "Plate" : "Capture"}
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-20">
                Severity
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Subject
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Event
              </th>
              <th className="px-2 py-2 text-left text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400">
                Location
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-14">
                Conf
              </th>
              <th className="px-2 py-2 text-right text-[10px] font-bold uppercase tracking-[0.08em] text-neutral-400 w-16">
                Time
              </th>
              <th className="pl-2 pr-4 py-2 w-16" />
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-50">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-8 text-center text-[11px] text-neutral-400">
                  No {filter === "ALL" ? "" : filter.toLowerCase()} events
                </td>
              </tr>
            ) : (
              filtered.map(alert => {
                const cfg = SEVERITY_ROW[alert.severity] ?? SEVERITY_ROW.LOW;
                const entityType = resolveEntityType(alert);
                const isLPREvent = alert.type === "UNREGISTERED_PLATE" || alert.type === "STOLEN_PLATE";

                return (
                  <tr
                    key={alert.id}
                    className={cn(
                      "border-l-[3px] transition-colors hover:bg-neutral-50/80",
                      cfg.border, cfg.bg
                    )}
                  >
                    {/* Capture */}
                    <td className="pl-4 pr-2 py-2.5">
                      {isLPR || isLPREvent ? (
                        <IdentityEvidenceMedia
                          kind="PLATE"
                          seed={alert.subject}
                          imageSrc="https://images.pexels.com/photos/9331863/pexels-photo-9331863.jpeg?cs=srgb&dl=pexels-hasan-albari-1229861-9331863.jpg&fm=jpg"
                          plateText={alert.subject.length <= 10 ? alert.subject : alert.subject.slice(0, 10)}
                          confidence={alert.confidence}
                          className="h-10 w-[68px]"
                        />
                      ) : (
                        <IdentityEvidenceMedia
                          kind="FACE"
                          seed={alert.subject}
                          imageSrc={FACE_SOURCES[alert.subject]}
                          confidence={alert.confidence}
                          className="h-10 w-10"
                        />
                      )}
                    </td>

                    {/* Severity */}
                    <td className="px-2 py-2.5">
                      <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide", cfg.badge)}>
                        {alert.severity}
                      </span>
                      {alert.status === "ACTIVE" && (
                        <div className="flex items-center gap-1 mt-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span className="text-[8px] text-emerald-600 font-bold">LIVE</span>
                        </div>
                      )}
                    </td>

                    {/* Subject */}
                    <td className="px-2 py-2.5">
                      <span className={cn("font-semibold", cfg.text)}>{alert.subject}</span>
                    </td>

                    {/* Event type */}
                    <td className="px-2 py-2.5">
                      <span className="text-[10px] text-neutral-500">
                        {alert.type.replace(/_/g, " ")}
                      </span>
                    </td>

                    {/* Location */}
                    <td className="px-2 py-2.5">
                      <div className="text-neutral-700 font-medium">{alert.zone}</div>
                      <div className="text-[10px] text-neutral-400">{alert.camera_id}</div>
                    </td>

                    {/* Confidence */}
                    <td className="px-2 py-2.5 text-right">
                      {alert.confidence != null ? (
                        <span className={cn(
                          "font-data tabular-nums font-bold text-[11px]",
                          alert.confidence >= 90 ? "text-emerald-600" :
                          alert.confidence >= 75 ? "text-amber-600" : "text-red-500"
                        )}>
                          {alert.confidence}%
                        </span>
                      ) : <span className="text-neutral-300">—</span>}
                    </td>

                    {/* Time */}
                    <td className="px-2 py-2.5 text-right">
                      <span className="text-[10px] text-neutral-400 font-data flex items-center justify-end gap-0.5">
                        <Clock className="w-3 h-3" />
                        {timeAgo(alert.timestamp)}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="pl-2 pr-4 py-2.5 text-right">
                      {alert.status === "ACTIVE" && onEntityClick && (
                        <button
                          onClick={() => onEntityClick(entityType)}
                          className="flex items-center gap-1 h-6 px-2 rounded-[4px] border border-neutral-200 bg-white text-[10px] font-semibold text-neutral-600 hover:border-[#00775B] hover:text-[#00775B] transition-colors whitespace-nowrap"
                        >
                          <Eye className="w-3 h-3" />
                          View
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </Panel>
  );
};
