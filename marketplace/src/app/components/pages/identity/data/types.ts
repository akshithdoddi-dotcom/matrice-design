// ─── Identity App Terminology ────────────────────────────────────────────────
export type IdentityType = "FACE" | "PLATE";

export interface IdentityTerminology {
  identityType: IdentityType;
  appLabel: string;
  entityLabel: string;          // "Person" | "Vehicle"
  identLabel: string;           // "Identification" | "Plate Read"
  authorizedLabel: string;      // "Whitelist" | "Authorized"
  blacklistLabel: string;       // "Blacklist" | "BOLO / Stolen"
  unknownLabel: string;         // "Unknown Individual" | "Unregistered Plate"
  unknownShortLabel: string;    // "Unknown" | "Unregistered"
  matchScoreLabel: string;      // "Match Confidence" | "OCR Confidence"
  eventLabel: string;           // "Face Event" | "Plate Event"
  watchlistPositiveLabel: string; // "Blacklist Hit" | "BOLO Match"
  enrollmentLabel: string;      // "Enrolled Faces" | "Registered Vehicles"
  vipEnabled: boolean;
  isLPR: boolean;
}

// ─── Live Status ─────────────────────────────────────────────────────────────
export interface IdentityLiveStatus {
  identifications_last_min: number;
  matched_count: number;
  unknown_count: number;
  blacklist_matches: number;
  vip_matches: number;
  cameras_online: number;
  cameras_total: number;
  open_alerts: { critical: number; high: number; medium: number };
  status: "GREEN" | "AMBER" | "RED";
}

// ─── KPI Card ─────────────────────────────────────────────────────────────────
export interface IdentityKPICard {
  id: string;
  label: string;
  value: number;
  unit: string;
  format: "number" | "percent" | "integer";
  definition: string;
  comparison: {
    period: string;
    value: number;
    delta: number;
    direction: "up" | "down";
    sentiment: "positive" | "negative";
  };
  sparkline_7d: number[];
  status: "GREEN" | "AMBER" | "RED";
}

// ─── Hourly Volume ────────────────────────────────────────────────────────────
export interface HourlyIdentPoint {
  hour: number;
  label: string;
  total: number;
  matched: number;
  unknown: number;
  denied: number;
}

// ─── Zone Activity ────────────────────────────────────────────────────────────
export interface IdentityZone {
  zone_id: string;
  zone_name: string;
  identifications: number;
  denied: number;
  unknown: number;
  blacklist_hits: number;
  status: "CLEAR" | "ELEVATED" | "WATCH" | "CRITICAL";
  peak_hour: number;
}

// ─── Alert / Event ────────────────────────────────────────────────────────────
export interface IdentityAlert {
  id: string;
  type: "BLACKLIST_MATCH" | "UNKNOWN_AT_ENTRY" | "VIP_DETECTED" | "UNREGISTERED_PLATE" | "STOLEN_PLATE" | "ACCESS_DENIED" | "REPEATED_UNKNOWN";
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
  camera_id: string;
  zone: string;
  subject: string;
  message: string;
  confidence?: number;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
}

// ─── Confidence Histogram ────────────────────────────────────────────────────
export interface ConfidenceBucket {
  bucket: string;
  value: number;
  color: string;
  range: [number, number];
}

// ─── Unknown Tracker ─────────────────────────────────────────────────────────
export interface UnknownTracker {
  tracker_id: number;
  anonymized_label: string;
  appearances: number;
  cameras: string[];
  first_seen: string;
  last_seen: string;
  confidence: number;
  badge: "RECURRING" | "NEW" | null;
  cross_camera: boolean;
}

// ─── Entry Point Performance ──────────────────────────────────────────────────
export interface EntryPoint {
  entry_id: string;
  name: string;
  identifications: number;
  match_rate_pct: number;
  unknown_rate_pct: number;
  denied_count: number;
  blacklist_hits: number;
  status: "NORMAL" | "WATCH" | "CRITICAL";
  flag?: string;
}

// ─── 6-Month Trend ────────────────────────────────────────────────────────────
export interface SixMonthIdentPoint {
  month: string;
  label: string;
  accuracy_pct: number;
  unknown_rate_pct: number;
  blacklist_hits: number;
  total_identifications: number;
}

// ─── Scorecard ───────────────────────────────────────────────────────────────
export interface IdentityScorecardRow {
  metric: string;
  this_period: number;
  last_period: number;
  target: number;
  unit: string;
  status: "ON_TRACK" | "WATCH" | "OFF_TARGET";
}

// ─── Cross-Camera Track ───────────────────────────────────────────────────────
export interface CrossCameraTrack {
  tracker_id: string;
  path: string[];
  duration_sec: number;
  zones: string[];
  severity: "high" | "medium" | "low";
  badge: "BLACKLIST" | "UNKNOWN" | "WATCH";
}

// ─── List Membership ─────────────────────────────────────────────────────────
export interface ListMembershipPoint {
  name: string;
  value: number;
  color: string;
}

// ─── Visitor Pattern (7-day) ─────────────────────────────────────────────────
export interface WeeklyVisitPoint {
  day: string;
  identifications: number;
  unique_visitors: number;
  denied: number;
  unknown: number;
}

// ─── VIP Ticker ──────────────────────────────────────────────────────────────
export interface VIPEntry {
  id: string;
  label: string;
  zone: string;
  timestamp: string;
  confidence: number;
}

// ─── Plate Read Accuracy (LPR) ───────────────────────────────────────────────
export interface PlateAccuracyPoint {
  label: string;
  accuracy_pct: number;
  authorization_rate_pct: number;
}

// ─── COQ / Access Risk ────────────────────────────────────────────────────────
export interface AccessRiskZone {
  zone: string;
  risk_score: number;
  blacklist_rate: number;
  unknown_rate: number;
  denial_rate: number;
  status: "GREEN" | "AMBER" | "RED";
}
