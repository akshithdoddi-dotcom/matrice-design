import { useState } from "react";
import { SlidePanel } from "./SlidePanel";
import { cn } from "@/app/lib/utils";
import {
  Shield, ShieldAlert, Star, User, Camera, Clock, MapPin,
  AlertTriangle, CheckCircle2, XCircle, ChevronRight, Download,
  UserPlus, Waypoints, Siren, Eye
} from "lucide-react";

// ─── Mock entity data ─────────────────────────────────────────────────────────
const MOCK_MATCHED_ENTITY = {
  tracker_id: 47,
  match_status: "MATCHED" as const,
  display_name: "John Smith",
  initials: "JS",
  metadata: { employee_id: "EMP-4821", department: "Engineering", access_level: "L3 — Restricted Zones" },
  list_membership: "WHITELIST" as const,
  last_detection: {
    timestamp: "2026-04-06 · 09:13:22 IST",
    camera_id: "CAM-LB-01",
    camera_label: "Main Lobby",
    match_confidence: 94.7,
    detection_confidence: 96.0,
    duration_in_frame_sec: 8.3,
    bounding_box: [412, 88, 192, 248],
    frame_number: "14,402",
  },
  enrollment: {
    enrolled_date: "2025-08-14",
    enrolled_by: "hr@hq.com",
    last_seen_before: "2026-04-05 · 17:41 · North Entrance",
    total_appearances: 312,
    monthly_appearances: 312,
  },
  sighting_history: {
    today: [
      { timestamp: "09:13", camera_label: "Main Lobby", camera_id: "CAM-LB-01", confidence: 94.7, duration_sec: 8.3, alerts: ["BLACKLIST_MATCH"], is_current: true },
      { timestamp: "09:11", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 96.1, duration_sec: 2.1, alerts: [] },
      { timestamp: "08:58", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 93.2, duration_sec: 42.0, alerts: ["UNKNOWN_AT_ENTRY"] },
      { timestamp: "08:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 91.8, duration_sec: 4.2, alerts: [], linked_lpr: "KA05MJ4421" },
    ],
    yesterday: [
      { timestamp: "17:41", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.3, duration_sec: 3.4, alerts: [] },
      { timestamp: "08:44", camera_label: "Main Lobby", camera_id: "CAM-LB-01", confidence: 94.1, duration_sec: 5.1, alerts: [] },
    ],
  },
  cross_camera_path: {
    cameras: ["Parking Garage", "South Entrance", "North Entrance", "Main Lobby"],
    times: ["08:52", "08:58", "09:11", "09:13"],
    total_min: 20.8,
  },
  linked_alerts: [
    { id: "evt_001", name: "BLACKLIST MATCH", severity: "CRITICAL" as const, timestamp: "09:13:22", status: "ACTIVE" as const },
    { id: "evt_002", name: "UNKNOWN AT ENTRY", severity: "MEDIUM" as const, timestamp: "08:58:10", status: "RESOLVED" as const },
  ],
};

const MOCK_UNKNOWN_ENTITY = {
  tracker_id: 88,
  match_status: "UNMATCHED" as const,
  display_name: "Unknown #88",
  initials: "?",
  list_membership: "UNKNOWN" as const,
  recognition_attempt: {
    best_match_score: 61.2,
    threshold: 75.0,
    possible_reasons: ["Person not enrolled in system", "Sub-optimal angle at South Entrance", "Possible partial face occlusion"],
  },
  first_seen: "2026-04-02 · 08:41 · South Entrance",
  appearance_summary: {
    total_appearances: 11,
    days_seen: 4,
    cameras_seen: ["South Entrance (×9)", "Main Lobby (×2)"],
    avg_detection_confidence: 63.1,
    avg_dwell_sec: 38.2,
    typical_time_window: "08:30–09:20",
    recurring_badge: true,
  },
  last_detection: {
    timestamp: "2026-04-06 · 09:13:55 IST",
    camera_id: "CAM-SE-01",
    camera_label: "South Entrance",
    match_confidence: 0,
    detection_confidence: 64.0,
    duration_in_frame_sec: 42.0,
    bounding_box: [380, 92, 180, 240],
    frame_number: "22,810",
  },
  linked_alerts: [
    { id: "evt_unk_002", name: "UNKNOWN AT ENTRY", severity: "MEDIUM" as const, timestamp: "09:13:55", status: "ACTIVE" as const },
  ],
};

// ─── Helper Components ────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-2 bg-neutral-50 border-b border-neutral-100">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">{children}</p>
  </div>
);

const ConfidenceDot = ({ value }: { value: number }) => (
  <span className={cn(
    "inline-block w-2 h-2 rounded-full mr-1.5",
    value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-amber-500" : "bg-red-500"
  )} />
);

const AlertBadge = ({ severity, label }: { severity: string; label: string }) => {
  const styles: Record<string, string> = {
    CRITICAL: "bg-[#FFE5E7] text-[#E7000B] border border-[#E7000B]/20",
    HIGH:     "bg-[#FEEFE7] text-[#EA580C] border border-[#EA580C]/20",
    MEDIUM:   "bg-[#FFF7E6] text-[#E19A04] border border-[#E19A04]/20",
    LOW:      "bg-[#E5F0FF] text-[#2B7FFF] border border-[#2B7FFF]/20",
  };
  return (
    <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded-full", styles[severity] ?? styles.LOW)}>
      {label}
    </span>
  );
};

// ─── ListMembership Badge ─────────────────────────────────────────────────────
const MembershipBadge = ({ membership }: { membership: string }) => {
  const map: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    WHITELIST: { bg: "bg-[#E5FFEF] border border-[#00A63E]/20", text: "text-[#00A63E]", icon: CheckCircle2, label: "Whitelist" },
    BLACKLIST: { bg: "bg-[#FFE5E7] border border-[#E7000B]/20", text: "text-[#E7000B]", icon: ShieldAlert, label: "Blacklist" },
    VIP:       { bg: "bg-purple-100 border border-purple-200", text: "text-purple-700", icon: Star, label: "VIP" },
    UNKNOWN:   { bg: "bg-neutral-100 border border-neutral-200", text: "text-neutral-600", icon: User, label: "Unknown" },
  };
  const cfg = map[membership] ?? map.UNKNOWN;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold", cfg.bg, cfg.text)}>
      <Icon className="w-3.5 h-3.5" />
      {cfg.label}
    </span>
  );
};

// ─── Main Panel ───────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityType?: "matched" | "unknown" | "blacklist";
  onViewJourney?: () => void;
}

export const EntityDetailPanel = ({ isOpen, onClose, entityType = "matched", onViewJourney }: Props) => {
  const [showOlderToday, setShowOlderToday] = useState(false);
  const entity = entityType === "unknown" ? MOCK_UNKNOWN_ENTITY : MOCK_MATCHED_ENTITY;
  const isMatched = entity.match_status === "MATCHED";
  const isUnknown = entity.match_status === "UNMATCHED";

  const todaySightings = isMatched
    ? (MOCK_MATCHED_ENTITY.sighting_history.today.slice(0, showOlderToday ? undefined : 3))
    : [];

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title="Entity Detail"
      subtitle={entity.display_name}
    >
      {/* ── Hero / Header ────────────────────────────────────────────────── */}
      <div className="px-6 py-5 border-b border-neutral-100">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className={cn(
            "w-16 h-16 rounded-xl flex items-center justify-center text-xl font-black shrink-0 border-2",
            isUnknown
              ? "bg-neutral-100 border-dashed border-neutral-300 text-neutral-400"
              : entity.list_membership === "BLACKLIST"
              ? "bg-[#FFE5E7] border-[#E7000B]/40 text-[#E7000B]"
              : "bg-[#E5FFF9] border-[#00775B]/30 text-[#00775B]"
          )}>
            {entity.initials}
          </div>

          {/* Identity info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-base font-bold text-neutral-900 leading-tight">{entity.display_name}</h3>
                {isMatched && (
                  <p className="text-xs text-neutral-500 mt-0.5">
                    {MOCK_MATCHED_ENTITY.metadata.department} · {MOCK_MATCHED_ENTITY.metadata.access_level}
                  </p>
                )}
              </div>
              <MembershipBadge membership={entity.list_membership} />
            </div>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {entity.last_detection.timestamp}
              </span>
              <span className="flex items-center gap-1">
                <Camera className="w-3.5 h-3.5" />
                {entity.last_detection.camera_label}
              </span>
            </div>

            {isMatched && (
              <div className="mt-1.5 flex items-center gap-1.5">
                <ConfidenceDot value={MOCK_MATCHED_ENTITY.last_detection.match_confidence} />
                <span className="font-data tabular-nums text-xs font-semibold text-neutral-700">
                  {MOCK_MATCHED_ENTITY.last_detection.match_confidence}%
                </span>
                <span className="text-[10px] text-neutral-400">match confidence</span>
              </div>
            )}
            {isUnknown && (
              <div className="mt-1.5 flex items-center gap-2">
                <span className="bg-orange-100 text-orange-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-orange-200">
                  ▲ RECURRING
                </span>
                <span className="text-[10px] text-neutral-500">Seen 4 days this week</span>
              </div>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={onViewJourney}
            className="flex items-center gap-1.5 h-8 px-3 rounded bg-[#00775B] text-white text-xs font-semibold hover:bg-[#004E3D] transition-colors"
          >
            <Waypoints className="w-3.5 h-3.5" />
            View Full Journey
          </button>
          {isUnknown && (
            <button className="flex items-center gap-1.5 h-8 px-3 rounded border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-[#00775B] hover:text-[#00775B] transition-colors">
              <UserPlus className="w-3.5 h-3.5" />
              Enroll
            </button>
          )}
          <button className="flex items-center gap-1.5 h-8 px-3 rounded border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:border-neutral-300 transition-colors">
            <Shield className="w-3.5 h-3.5" />
            Add to Watchlist
          </button>
          <button className="flex items-center gap-1.5 h-8 px-3 rounded border border-red-200 bg-red-50 text-xs font-semibold text-red-600 hover:bg-red-100 transition-colors">
            <Siren className="w-3.5 h-3.5" />
            Escalate
          </button>
        </div>
      </div>

      {/* ── Detection Event ──────────────────────────────────────────────── */}
      <SectionLabel>Detection Event</SectionLabel>
      <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-neutral-50">
        {[
          { label: "Timestamp", value: entity.last_detection.timestamp },
          { label: "Camera", value: `${entity.last_detection.camera_label} · ${entity.last_detection.camera_id}` },
          { label: "Frame #", value: entity.last_detection.frame_number },
          { label: "Duration in Frame", value: `${entity.last_detection.duration_in_frame_sec}s`, mono: true },
          { label: "Detection Confidence", value: `${entity.last_detection.detection_confidence}%`, mono: true },
          isMatched
            ? { label: "Match Confidence", value: `${entity.last_detection.match_confidence}%`, mono: true }
            : { label: "Best Attempt", value: "61.2% (below 75% threshold)", mono: true },
        ].map((item) => (
          <div key={item.label}>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
            <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>
              {item.value}
            </p>
          </div>
        ))}
        <div className="col-span-2 flex gap-2 pt-1">
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded border border-neutral-200 text-[11px] text-neutral-600 hover:border-neutral-300 transition-colors">
            <Download className="w-3 h-3" />
            HD Crop
          </button>
          <button className="flex items-center gap-1.5 h-7 px-2.5 rounded border border-neutral-200 text-[11px] text-neutral-600 hover:border-neutral-300 transition-colors">
            <Eye className="w-3 h-3" />
            Full Frame
          </button>
        </div>
      </div>

      {/* ── Recognition Result ───────────────────────────────────────────── */}
      <SectionLabel>
        {isMatched ? "Recognition Result — Matched" : "Recognition Result — No Match"}
      </SectionLabel>
      <div className={cn("mx-6 my-4 rounded-lg border p-4",
        isUnknown ? "bg-neutral-50 border-neutral-200" : "bg-[#E5FFF9] border-[#00775B]/20"
      )}>
        {isMatched ? (
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Enrolled Name", value: MOCK_MATCHED_ENTITY.display_name },
              { label: "Employee ID", value: MOCK_MATCHED_ENTITY.metadata.employee_id, mono: true },
              { label: "Department", value: MOCK_MATCHED_ENTITY.metadata.department },
              { label: "Access Level", value: MOCK_MATCHED_ENTITY.metadata.access_level },
              { label: "Match Score", value: `${MOCK_MATCHED_ENTITY.last_detection.match_confidence}%`, mono: true },
              { label: "Enrolled", value: MOCK_MATCHED_ENTITY.enrollment.enrolled_date },
              { label: "Last Seen Before", value: MOCK_MATCHED_ENTITY.enrollment.last_seen_before },
              { label: "Appearances (MTD)", value: String(MOCK_MATCHED_ENTITY.enrollment.monthly_appearances), mono: true },
            ].map((item) => (
              <div key={item.label}>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
                <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>
                  {item.value}
                </p>
              </div>
            ))}
            <div className="col-span-2 pt-1">
              <button className="text-xs text-[#00775B] font-semibold hover:underline flex items-center gap-1">
                View enrollment record <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700">Status</span>
              <span className="text-xs font-bold text-neutral-500">Not enrolled — below threshold</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Best attempt score</span>
              <span className="font-data tabular-nums text-xs font-bold text-red-600">
                {MOCK_UNKNOWN_ENTITY.recognition_attempt.best_match_score}%
                <span className="text-neutral-400 font-normal"> / threshold {MOCK_UNKNOWN_ENTITY.recognition_attempt.threshold}%</span>
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">First seen</span>
              <span className="text-xs text-neutral-700">{MOCK_UNKNOWN_ENTITY.first_seen}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-neutral-500">Total appearances</span>
              <span className="font-data tabular-nums text-xs font-bold text-neutral-700">{MOCK_UNKNOWN_ENTITY.appearance_summary.total_appearances}</span>
            </div>
            <div className="pt-1 border-t border-neutral-200">
              <p className="text-[10px] text-neutral-500 font-semibold mb-1.5">Possible reasons for no match:</p>
              <ul className="space-y-0.5">
                {MOCK_UNKNOWN_ENTITY.recognition_attempt.possible_reasons.map((r, i) => (
                  <li key={i} className="text-[11px] text-neutral-500 flex items-start gap-1.5">
                    <span className="text-neutral-300 mt-0.5">•</span>{r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex gap-2 pt-1">
              <button className="flex-1 h-8 rounded bg-[#00775B] text-white text-xs font-semibold hover:bg-[#004E3D] transition-colors flex items-center justify-center gap-1.5">
                <UserPlus className="w-3.5 h-3.5" /> Enroll this person
              </button>
              <button className="flex-1 h-8 rounded border border-neutral-200 text-xs font-semibold text-neutral-700 hover:border-neutral-300 transition-colors">
                Mark as Known Visitor
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Cross-Camera Path ─────────────────────────────────────────────── */}
      {isMatched && (
        <>
          <SectionLabel>Cross-Camera Path Today</SectionLabel>
          <div className="px-6 py-4 border-b border-neutral-50">
            <div className="flex items-center gap-0 flex-wrap mb-2">
              {MOCK_MATCHED_ENTITY.cross_camera_path.cameras.map((cam, i) => (
                <span key={cam} className="flex items-center gap-0">
                  <span className="text-xs bg-neutral-100 text-neutral-700 rounded px-2 py-1 font-semibold border border-neutral-200">
                    {cam}
                    <span className="ml-1.5 font-data tabular-nums text-[10px] text-neutral-400">
                      {MOCK_MATCHED_ENTITY.cross_camera_path.times[i]}
                    </span>
                  </span>
                  {i < MOCK_MATCHED_ENTITY.cross_camera_path.cameras.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-neutral-400 mx-0.5" />
                  )}
                </span>
              ))}
            </div>
            <p className="text-[11px] text-neutral-400 mb-2">
              Total journey: <span className="font-data tabular-nums font-semibold text-neutral-600">{MOCK_MATCHED_ENTITY.cross_camera_path.total_min} min</span>
            </p>
            <button
              onClick={onViewJourney}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#00775B] hover:underline"
            >
              <Waypoints className="w-3.5 h-3.5" />
              View Full Journey Map
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </>
      )}

      {/* ── Sighting History ──────────────────────────────────────────────── */}
      {isMatched && (
        <>
          <SectionLabel>Sighting History — Today</SectionLabel>
          <div className="px-6 py-3 border-b border-neutral-50">
            <div className="space-y-2">
              {todaySightings.map((sighting, i) => (
                <div key={i} className={cn(
                  "flex items-start gap-3 px-3 py-2.5 rounded-lg border transition-colors hover:bg-neutral-50",
                  sighting.is_current ? "bg-[#E5FFF9] border-[#00775B]/20" : "bg-white border-neutral-100"
                )}>
                  {/* Avatar placeholder */}
                  <div className="w-8 h-8 rounded bg-neutral-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-800">{sighting.camera_label}</span>
                      <span className="font-data tabular-nums text-[10px] text-neutral-400">{sighting.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ConfidenceDot value={sighting.confidence} />
                      <span className="font-data tabular-nums text-[10px] text-neutral-500">{sighting.confidence}%</span>
                      <span className="text-[10px] text-neutral-400">{sighting.camera_id}</span>
                      <span className="font-data tabular-nums text-[10px] text-neutral-400">{sighting.duration_sec}s</span>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1">
                      {sighting.alerts.map((a) => (
                        <AlertBadge key={a} severity={a.includes("BLACKLIST") ? "CRITICAL" : "MEDIUM"} label={a.replace(/_/g, " ")} />
                      ))}
                      {sighting.linked_lpr && (
                        <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 font-semibold">
                          LPR: {sighting.linked_lpr} ↗
                        </span>
                      )}
                      {sighting.is_current && (
                        <span className="text-[10px] bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20 rounded px-1.5 py-0.5 font-bold">CURRENT</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {!showOlderToday && MOCK_MATCHED_ENTITY.sighting_history.today.length > 3 && (
              <button
                onClick={() => setShowOlderToday(true)}
                className="mt-2 text-xs text-[#00775B] font-semibold hover:underline flex items-center gap-1"
              >
                +{MOCK_MATCHED_ENTITY.sighting_history.today.length - 3} more today
              </button>
            )}
          </div>

          <SectionLabel>Sighting History — Yesterday</SectionLabel>
          <div className="px-6 py-3 border-b border-neutral-50">
            <div className="space-y-2">
              {MOCK_MATCHED_ENTITY.sighting_history.yesterday.map((sighting, i) => (
                <div key={i} className="flex items-start gap-3 px-3 py-2.5 rounded-lg border border-neutral-100 bg-white hover:bg-neutral-50 transition-colors">
                  <div className="w-8 h-8 rounded bg-neutral-200 flex items-center justify-center shrink-0">
                    <User className="w-4 h-4 text-neutral-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-neutral-800">{sighting.camera_label}</span>
                      <span className="font-data tabular-nums text-[10px] text-neutral-400">{sighting.timestamp}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <ConfidenceDot value={sighting.confidence} />
                      <span className="font-data tabular-nums text-[10px] text-neutral-500">{sighting.confidence}%</span>
                      <span className="text-[10px] text-neutral-400">{sighting.camera_id}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <button className="mt-2 text-xs text-[#00775B] font-semibold hover:underline">Load older sightings</button>
          </div>
        </>
      )}

      {/* ── Linked Alerts ─────────────────────────────────────────────────── */}
      <SectionLabel>Linked Alerts & Incidents</SectionLabel>
      <div className="px-6 py-4 space-y-2 pb-8">
        {entity.linked_alerts.map((alert) => (
          <div key={alert.id} className={cn(
            "flex items-start gap-3 p-3 rounded-lg border",
            alert.severity === "CRITICAL" ? "bg-[#FFE5E7] border-[#E7000B]/20" :
            alert.severity === "MEDIUM"   ? "bg-[#FFF7E6] border-[#E19A04]/20" :
                                            "bg-neutral-50 border-neutral-200"
          )}>
            <AlertTriangle className={cn("w-4 h-4 mt-0.5 shrink-0",
              alert.severity === "CRITICAL" ? "text-[#E7000B]" :
              alert.severity === "MEDIUM"   ? "text-[#E19A04]" : "text-neutral-500"
            )} />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <AlertBadge severity={alert.severity} label={alert.severity} />
                <span className="text-xs font-semibold text-neutral-800">{alert.name.replace(/_/g, " ")}</span>
              </div>
              <div className="flex items-center gap-3 mt-1 text-[10px] text-neutral-400">
                <span className="font-data tabular-nums">{alert.timestamp}</span>
                <span className={cn("font-bold", alert.status === "ACTIVE" ? "text-[#E7000B]" : "text-[#00A63E]")}>
                  {alert.status}
                </span>
              </div>
            </div>
            {alert.status === "ACTIVE" && (
              <button className="h-7 px-2.5 rounded border border-[#E7000B]/30 text-[10px] font-bold text-[#E7000B] hover:bg-[#E7000B]/10 transition-colors shrink-0">
                Acknowledge
              </button>
            )}
          </div>
        ))}
      </div>
    </SlidePanel>
  );
};
