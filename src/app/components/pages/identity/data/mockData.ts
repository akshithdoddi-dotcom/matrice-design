import type {
  IdentityLiveStatus,
  IdentityKPICard,
  HourlyIdentPoint,
  IdentityZone,
  IdentityAlert,
  ConfidenceBucket,
  UnknownTracker,
  EntryPoint,
  SixMonthIdentPoint,
  IdentityScorecardRow,
  CrossCameraTrack,
  ListMembershipPoint,
  WeeklyVisitPoint,
  VIPEntry,
  PlateAccuracyPoint,
  AccessRiskZone,
} from "./types";

// ─── Live Status ─────────────────────────────────────────────────────────────
export const IDENTITY_LIVE_STATUS: IdentityLiveStatus = {
  identifications_last_min: 23,
  matched_count: 19,
  unknown_count: 4,
  blacklist_matches: 1,
  vip_matches: 1,
  cameras_online: 14,
  cameras_total: 16,
  open_alerts: { critical: 1, high: 1, medium: 2 },
  status: "AMBER",
};

// ─── KPI Cards ───────────────────────────────────────────────────────────────
export const IDENTITY_KPI_CARDS: IdentityKPICard[] = [
  {
    id: "total-identifications",
    label: "Identifications Today",
    value: 2840,
    unit: "",
    format: "integer",
    definition: "Total face/plate identification events today",
    comparison: { period: "Yesterday", value: 2610, delta: 230, direction: "up", sentiment: "positive" },
    sparkline_7d: [2200, 2450, 2380, 2610, 2510, 2720, 2840],
    status: "GREEN",
  },
  {
    id: "blacklist-alerts",
    label: "Blacklist Alerts",
    value: 1,
    unit: "",
    format: "integer",
    definition: "Confirmed blacklist / BOLO matches today",
    comparison: { period: "Yesterday", value: 0, delta: 1, direction: "up", sentiment: "negative" },
    sparkline_7d: [0, 1, 0, 0, 2, 0, 1],
    status: "RED",
  },
  {
    id: "match-accuracy",
    label: "Match Accuracy",
    value: 97.2,
    unit: "%",
    format: "percent",
    definition: "Confidence-weighted accuracy of all identifications",
    comparison: { period: "Last Week", value: 96.8, delta: 0.4, direction: "up", sentiment: "positive" },
    sparkline_7d: [96.1, 96.4, 96.8, 97.0, 96.9, 97.1, 97.2],
    status: "GREEN",
  },
  {
    id: "unique-visitors",
    label: "Unique Visitors",
    value: 412,
    unit: "",
    format: "integer",
    definition: "Unique individuals identified today (de-duplicated)",
    comparison: { period: "Yesterday", value: 388, delta: 24, direction: "up", sentiment: "positive" },
    sparkline_7d: [350, 370, 365, 388, 395, 405, 412],
    status: "GREEN",
  },
];

// ─── Hourly Identification Volume ─────────────────────────────────────────────
export const HOURLY_IDENT_DATA: HourlyIdentPoint[] = [
  { hour: 6, label: "6am", total: 45, matched: 40, unknown: 3, denied: 2 },
  { hour: 7, label: "7am", total: 120, matched: 108, unknown: 8, denied: 4 },
  { hour: 8, label: "8am", total: 340, matched: 308, unknown: 22, denied: 10 },
  { hour: 9, label: "9am", total: 290, matched: 264, unknown: 18, denied: 8 },
  { hour: 10, label: "10am", total: 210, matched: 192, unknown: 12, denied: 6 },
  { hour: 11, label: "11am", total: 175, matched: 161, unknown: 9, denied: 5 },
  { hour: 12, label: "12pm", total: 195, matched: 178, unknown: 11, denied: 6 },
  { hour: 13, label: "1pm", total: 220, matched: 202, unknown: 12, denied: 6 },
  { hour: 14, label: "2pm", total: 180, matched: 164, unknown: 11, denied: 5 },
  { hour: 15, label: "3pm", total: 160, matched: 146, unknown: 9, denied: 5 },
  { hour: 16, label: "4pm", total: 265, matched: 242, unknown: 16, denied: 7 },
  { hour: 17, label: "5pm", total: 320, matched: 292, unknown: 20, denied: 8 },
  { hour: 18, label: "6pm", total: 180, matched: 164, unknown: 11, denied: 5 },
  { hour: 19, label: "7pm", total: 60, matched: 55, unknown: 4, denied: 1 },
  { hour: 20, label: "8pm", total: 30, matched: 27, unknown: 2, denied: 1 },
];

// ─── Identity Zones ──────────────────────────────────────────────────────────
export const IDENTITY_ZONES: IdentityZone[] = [
  { zone_id: "z1", zone_name: "Main Lobby",      identifications: 840, denied: 12, unknown: 28, blacklist_hits: 1, status: "CRITICAL", peak_hour: 8 },
  { zone_id: "z2", zone_name: "North Entrance",  identifications: 420, denied: 5,  unknown: 14, blacklist_hits: 0, status: "CLEAR",    peak_hour: 8 },
  { zone_id: "z3", zone_name: "South Entrance",  identifications: 310, denied: 8,  unknown: 22, blacklist_hits: 0, status: "WATCH",    peak_hour: 17 },
  { zone_id: "z4", zone_name: "Executive Lift",  identifications: 85,  denied: 2,  unknown: 4,  blacklist_hits: 0, status: "CLEAR",    peak_hour: 9 },
  { zone_id: "z5", zone_name: "Garage Entry A",  identifications: 290, denied: 4,  unknown: 8,  blacklist_hits: 0, status: "CLEAR",    peak_hour: 8 },
  { zone_id: "z6", zone_name: "Garage Entry B",  identifications: 180, denied: 3,  unknown: 15, blacklist_hits: 0, status: "ELEVATED", peak_hour: 8 },
  { zone_id: "z7", zone_name: "Side Gate",       identifications: 210, denied: 6,  unknown: 11, blacklist_hits: 0, status: "ELEVATED", peak_hour: 7 },
  { zone_id: "z8", zone_name: "Service Ramp",    identifications: 95,  denied: 2,  unknown: 5,  blacklist_hits: 0, status: "CLEAR",    peak_hour: 10 },
  { zone_id: "z9", zone_name: "Rooftop Access",  identifications: 40,  denied: 1,  unknown: 3,  blacklist_hits: 0, status: "CLEAR",    peak_hour: 12 },
  { zone_id: "z10", zone_name: "Basement Store", identifications: 60,  denied: 2,  unknown: 6,  blacklist_hits: 0, status: "ELEVATED", peak_hour: 14 },
  { zone_id: "z11", zone_name: "Server Room",    identifications: 28,  denied: 1,  unknown: 2,  blacklist_hits: 0, status: "CLEAR",    peak_hour: 10 },
  { zone_id: "z12", zone_name: "Reception",      identifications: 380, denied: 7,  unknown: 16, blacklist_hits: 0, status: "CLEAR",    peak_hour: 9 },
];

// ─── Alerts ───────────────────────────────────────────────────────────────────
export const IDENTITY_ALERTS: IdentityAlert[] = [
  {
    id: "a1",
    type: "BLACKLIST_MATCH",
    severity: "CRITICAL",
    timestamp: "14:31:22",
    camera_id: "CAM-LB-01",
    zone: "Main Lobby",
    subject: "Subject BL-003",
    message: "Confirmed blacklist match — Subject BL-003 detected at Main Lobby. Confidence: 94%. Immediate action required.",
    confidence: 94,
    status: "ACTIVE",
  },
  {
    id: "a2",
    type: "UNKNOWN_AT_ENTRY",
    severity: "MEDIUM",
    timestamp: "14:30:55",
    camera_id: "CAM-SE-01",
    zone: "South Entrance",
    subject: "Unknown #88",
    message: "Unidentified individual detected at South Entrance. Cross-camera tracking active. Duration: 5m 12s.",
    confidence: 61,
    status: "ACTIVE",
  },
  {
    id: "a3",
    type: "UNREGISTERED_PLATE",
    severity: "MEDIUM",
    timestamp: "14:31:06",
    camera_id: "CAM-GA-01",
    zone: "Garage Entry A",
    subject: "UP80MN1123",
    message: "Unregistered plate UP80MN1123 attempted entry at Garage Entry A. Vehicle blocked.",
    confidence: 91,
    status: "ACTIVE",
  },
  {
    id: "a4",
    type: "VIP_DETECTED",
    severity: "LOW",
    timestamp: "14:31:10",
    camera_id: "CAM-NE-01",
    zone: "North Entrance",
    subject: "Executive VIP-007",
    message: "VIP individual detected. Escort protocol suggested.",
    confidence: 97,
    status: "ACKNOWLEDGED",
  },
];

// ─── Confidence Histogram ────────────────────────────────────────────────────
export const CONFIDENCE_HISTOGRAM: ConfidenceBucket[] = [
  { bucket: "<70%",   value: 5,  color: "#DC2626", range: [0, 70] },
  { bucket: "70–80%", value: 9,  color: "#EA580C", range: [70, 80] },
  { bucket: "80–90%", value: 14, color: "#D97706", range: [80, 90] },
  { bucket: "90–95%", value: 21, color: "#65A30D", range: [90, 95] },
  { bucket: ">95%",   value: 29, color: "#00775B", range: [95, 100] },
];

// ─── Unknown Trackers ────────────────────────────────────────────────────────
export const UNKNOWN_TRACKERS: UnknownTracker[] = [
  {
    tracker_id: 88,
    anonymized_label: "Unknown #88",
    appearances: 11,
    cameras: ["South Entrance", "Main Lobby", "Service Ramp"],
    first_seen: "09:12",
    last_seen: "14:31",
    confidence: 61,
    badge: "RECURRING",
    cross_camera: true,
  },
  {
    tracker_id: 134,
    anonymized_label: "Unknown #134",
    appearances: 7,
    cameras: ["Garage Entry B", "Basement Store"],
    first_seen: "11:45",
    last_seen: "14:28",
    confidence: 72,
    badge: "RECURRING",
    cross_camera: true,
  },
  {
    tracker_id: 201,
    anonymized_label: "Unknown #201",
    appearances: 2,
    cameras: ["Main Lobby"],
    first_seen: "14:29",
    last_seen: "14:31",
    confidence: 68,
    badge: null,
    cross_camera: false,
  },
  {
    tracker_id: 215,
    anonymized_label: "Unknown #215",
    appearances: 1,
    cameras: ["North Entrance"],
    first_seen: "14:30",
    last_seen: "14:30",
    confidence: 74,
    badge: "NEW",
    cross_camera: false,
  },
];

// ─── Entry Points ─────────────────────────────────────────────────────────────
export const ENTRY_POINTS: EntryPoint[] = [
  { entry_id: "e1", name: "Main Lobby",      identifications: 840, match_rate_pct: 96.8, unknown_rate_pct: 3.3,  denied_count: 12, blacklist_hits: 1, status: "CRITICAL", flag: "Blacklist hit confirmed" },
  { entry_id: "e2", name: "North Entrance",  identifications: 420, match_rate_pct: 97.6, unknown_rate_pct: 3.3,  denied_count: 5,  blacklist_hits: 0, status: "NORMAL" },
  { entry_id: "e3", name: "South Entrance",  identifications: 310, match_rate_pct: 92.9, unknown_rate_pct: 7.1,  denied_count: 8,  blacklist_hits: 0, status: "WATCH",    flag: "High unknown rate" },
  { entry_id: "e4", name: "Executive Lift",  identifications: 85,  match_rate_pct: 95.3, unknown_rate_pct: 4.7,  denied_count: 2,  blacklist_hits: 0, status: "NORMAL" },
  { entry_id: "e5", name: "Garage Entry A",  identifications: 290, match_rate_pct: 97.2, unknown_rate_pct: 2.8,  denied_count: 4,  blacklist_hits: 0, status: "NORMAL" },
  { entry_id: "e6", name: "Garage Entry B",  identifications: 180, match_rate_pct: 91.7, unknown_rate_pct: 8.3,  denied_count: 3,  blacklist_hits: 0, status: "WATCH",    flag: "Above-average unknowns" },
  { entry_id: "e7", name: "Side Gate",       identifications: 210, match_rate_pct: 94.8, unknown_rate_pct: 5.2,  denied_count: 6,  blacklist_hits: 0, status: "NORMAL" },
  { entry_id: "e8", name: "Service Ramp",    identifications: 95,  match_rate_pct: 94.7, unknown_rate_pct: 5.3,  denied_count: 2,  blacklist_hits: 0, status: "NORMAL" },
];

// ─── 6-Month Trend ────────────────────────────────────────────────────────────
export const SIX_MONTH_TREND: SixMonthIdentPoint[] = [
  { month: "Nov-25", label: "Nov",  accuracy_pct: 94.1, unknown_rate_pct: 7.2, blacklist_hits: 3, total_identifications: 42800 },
  { month: "Dec-25", label: "Dec",  accuracy_pct: 94.8, unknown_rate_pct: 6.8, blacklist_hits: 4, total_identifications: 38200 },
  { month: "Jan-26", label: "Jan",  accuracy_pct: 95.4, unknown_rate_pct: 6.1, blacklist_hits: 2, total_identifications: 45100 },
  { month: "Feb-26", label: "Feb",  accuracy_pct: 96.1, unknown_rate_pct: 5.4, blacklist_hits: 5, total_identifications: 41600 },
  { month: "Mar-26", label: "Mar",  accuracy_pct: 96.8, unknown_rate_pct: 4.9, blacklist_hits: 1, total_identifications: 48300 },
  { month: "Apr-26", label: "Apr",  accuracy_pct: 97.2, unknown_rate_pct: 4.2, blacklist_hits: 2, total_identifications: 52100 },
];

// ─── Scorecard ────────────────────────────────────────────────────────────────
export const IDENTITY_SCORECARD: IdentityScorecardRow[] = [
  { metric: "Match Accuracy",       this_period: 97.2, last_period: 96.8, target: 97.0, unit: "%", status: "ON_TRACK" },
  { metric: "False Positive Rate",  this_period: 0.8,  last_period: 1.1,  target: 1.0,  unit: "%", status: "ON_TRACK" },
  { metric: "Unknown Rate",         this_period: 4.2,  last_period: 4.9,  target: 5.0,  unit: "%", status: "ON_TRACK" },
  { metric: "Blacklist Response",   this_period: 38,   last_period: 45,   target: 60,   unit: "s", status: "ON_TRACK" },
  { metric: "Camera Coverage",      this_period: 87.5, last_period: 87.5, target: 90.0, unit: "%", status: "WATCH" },
  { metric: "Enrollment Coverage",  this_period: 73.4, last_period: 68.2, target: 80.0, unit: "%", status: "WATCH" },
  { metric: "Incident Resolution",  this_period: 92.0, last_period: 88.0, target: 90.0, unit: "%", status: "ON_TRACK" },
];

// ─── Cross-Camera Tracks ─────────────────────────────────────────────────────
export const CROSS_CAMERA_TRACKS: CrossCameraTrack[] = [
  {
    tracker_id: "TRK-088",
    path: ["South Entrance", "Main Lobby", "Executive Lift"],
    duration_sec: 378,
    zones: ["South Entrance", "Main Lobby", "Executive Lift"],
    severity: "high",
    badge: "UNKNOWN",
  },
  {
    tracker_id: "TRK-134",
    path: ["Garage Entry B", "Basement Store"],
    duration_sec: 164,
    zones: ["Garage Entry B", "Basement Store"],
    severity: "medium",
    badge: "UNKNOWN",
  },
  {
    tracker_id: "TRK-BL003",
    path: ["Side Gate", "Main Lobby"],
    duration_sec: 112,
    zones: ["Side Gate", "Main Lobby"],
    severity: "high",
    badge: "BLACKLIST",
  },
];

// ─── List Membership Donut ────────────────────────────────────────────────────
export const LIST_MEMBERSHIP: ListMembershipPoint[] = [
  { name: "Whitelist",  value: 1840, color: "#00775B" },
  { name: "VIP",        value: 142,  color: "#7C3AED" },
  { name: "Blacklist",  value: 23,   color: "#DC2626" },
  { name: "Unknown",    value: 388,  color: "#94A3B8" },
  { name: "Temp Pass",  value: 87,   color: "#D97706" },
];

// ─── Weekly Visitor Pattern ───────────────────────────────────────────────────
export const WEEKLY_VISIT_DATA: WeeklyVisitPoint[] = [
  { day: "Mon", identifications: 2610, unique_visitors: 388, denied: 34, unknown: 112 },
  { day: "Tue", identifications: 2720, unique_visitors: 395, denied: 28, unknown: 98 },
  { day: "Wed", identifications: 2890, unique_visitors: 420, denied: 42, unknown: 134 },
  { day: "Thu", identifications: 2750, unique_visitors: 402, denied: 31, unknown: 108 },
  { day: "Fri", identifications: 2840, unique_visitors: 412, denied: 38, unknown: 121 },
  { day: "Sat", identifications: 1420, unique_visitors: 210, denied: 18, unknown: 64 },
  { day: "Sun", identifications: 980,  unique_visitors: 148, denied: 11, unknown: 42 },
];

// ─── VIP Ticker ──────────────────────────────────────────────────────────────
export const VIP_ENTRIES: VIPEntry[] = [
  { id: "VIP-007", label: "Executive VIP-007", zone: "North Entrance", timestamp: "14:31:10", confidence: 97 },
  { id: "VIP-003", label: "Board Member VIP-003", zone: "Main Lobby", timestamp: "13:44:22", confidence: 98 },
  { id: "VIP-011", label: "Executive VIP-011", zone: "Executive Lift", timestamp: "11:28:05", confidence: 96 },
  { id: "VIP-002", label: "Director VIP-002", zone: "Main Lobby", timestamp: "09:15:38", confidence: 99 },
];

// ─── Plate Read Accuracy (LPR) ────────────────────────────────────────────────
export const PLATE_ACCURACY_TREND: PlateAccuracyPoint[] = [
  { label: "9am",  accuracy_pct: 98.1, authorization_rate_pct: 90 },
  { label: "10am", accuracy_pct: 97.8, authorization_rate_pct: 88 },
  { label: "11am", accuracy_pct: 97.2, authorization_rate_pct: 86 },
  { label: "12pm", accuracy_pct: 98.5, authorization_rate_pct: 91 },
  { label: "1pm",  accuracy_pct: 97.7, authorization_rate_pct: 89 },
  { label: "2pm",  accuracy_pct: 97.4, authorization_rate_pct: 87 },
  { label: "3pm",  accuracy_pct: 98.0, authorization_rate_pct: 90 },
  { label: "4pm",  accuracy_pct: 97.6, authorization_rate_pct: 88 },
];

// ─── Access Risk by Zone ──────────────────────────────────────────────────────
export const ACCESS_RISK_ZONES: AccessRiskZone[] = [
  { zone: "Main Lobby",      risk_score: 82, blacklist_rate: 0.12, unknown_rate: 3.3,  denial_rate: 1.4, status: "RED" },
  { zone: "South Entrance",  risk_score: 61, blacklist_rate: 0,    unknown_rate: 7.1,  denial_rate: 2.6, status: "AMBER" },
  { zone: "Garage Entry B",  risk_score: 58, blacklist_rate: 0,    unknown_rate: 8.3,  denial_rate: 1.7, status: "AMBER" },
  { zone: "Side Gate",       risk_score: 44, blacklist_rate: 0,    unknown_rate: 5.2,  denial_rate: 2.9, status: "AMBER" },
  { zone: "North Entrance",  risk_score: 22, blacklist_rate: 0,    unknown_rate: 3.3,  denial_rate: 1.2, status: "GREEN" },
  { zone: "Garage Entry A",  risk_score: 18, blacklist_rate: 0,    unknown_rate: 2.8,  denial_rate: 1.4, status: "GREEN" },
  { zone: "Executive Lift",  risk_score: 15, blacklist_rate: 0,    unknown_rate: 4.7,  denial_rate: 2.4, status: "GREEN" },
  { zone: "Service Ramp",    risk_score: 12, blacklist_rate: 0,    unknown_rate: 5.3,  denial_rate: 2.1, status: "GREEN" },
];

// ─── Denial Trend (7-day) ─────────────────────────────────────────────────────
export const DENIAL_TREND_7D = [
  { day: "Mon", denied: 34, blacklist: 0, unknown: 112 },
  { day: "Tue", denied: 28, blacklist: 1, unknown: 98  },
  { day: "Wed", denied: 42, blacklist: 0, unknown: 134 },
  { day: "Thu", denied: 31, blacklist: 0, unknown: 108 },
  { day: "Fri", denied: 38, blacklist: 1, unknown: 121 },
  { day: "Sat", denied: 18, blacklist: 0, unknown: 64  },
  { day: "Sun", denied: 11, blacklist: 0, unknown: 42  },
];

// ─── Camera Health ────────────────────────────────────────────────────────────
export const IDENTITY_CAMERAS = [
  { id: "CAM-LB-01", name: "Main Lobby A",    zone: "Main Lobby",     status: "online",   fps: 25, confidence_avg: 94.2 },
  { id: "CAM-LB-02", name: "Main Lobby B",    zone: "Main Lobby",     status: "online",   fps: 25, confidence_avg: 93.8 },
  { id: "CAM-NE-01", name: "North Entrance",  zone: "North Entrance", status: "online",   fps: 24, confidence_avg: 96.1 },
  { id: "CAM-SE-01", name: "South Entrance",  zone: "South Entrance", status: "degraded", fps: 16, confidence_avg: 78.4 },
  { id: "CAM-EL-01", name: "Exec Lift",       zone: "Executive Lift", status: "online",   fps: 25, confidence_avg: 95.3 },
  { id: "CAM-GA-01", name: "Garage Entry A",  zone: "Garage Entry A", status: "online",   fps: 25, confidence_avg: 97.2 },
  { id: "CAM-GB-01", name: "Garage Entry B",  zone: "Garage Entry B", status: "degraded", fps: 14, confidence_avg: 72.1 },
  { id: "CAM-SG-01", name: "Side Gate",       zone: "Side Gate",      status: "online",   fps: 23, confidence_avg: 91.4 },
  { id: "CAM-SR-01", name: "Service Ramp",    zone: "Service Ramp",   status: "online",   fps: 24, confidence_avg: 90.8 },
  { id: "CAM-RA-01", name: "Rooftop Access",  zone: "Rooftop",        status: "online",   fps: 22, confidence_avg: 89.6 },
  { id: "CAM-BS-01", name: "Basement Store",  zone: "Basement",       status: "online",   fps: 25, confidence_avg: 92.3 },
  { id: "CAM-RC-01", name: "Reception",       zone: "Reception",      status: "online",   fps: 25, confidence_avg: 95.8 },
  { id: "CAM-SR-02", name: "Server Room",     zone: "Server Room",    status: "online",   fps: 20, confidence_avg: 88.4 },
  { id: "CAM-BK-01", name: "Back Office",     zone: "Back Office",    status: "offline",  fps: 0,  confidence_avg: 0 },
];

// ─── Live Identification Sparkline (1-min intervals, 60 pts) ─────────────────
export const LIVE_IDENT_SPARKLINE = Array.from({ length: 60 }, (_, i) => ({
  t: i,
  total: Math.round(18 + 8 * Math.sin(i / 5) + Math.random() * 4),
  matched: Math.round(15 + 7 * Math.sin(i / 5) + Math.random() * 3),
  unknown: Math.round(2 + Math.random() * 2),
}));
