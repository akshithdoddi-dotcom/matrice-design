// App terminology (swaps based on app sub-type)
export interface QualityTerminology {
  appLabel: string;
  primaryMetricLabel: string;    // "Compliance Rate" | "Pass Rate"
  negativeEventLabel: string;    // "Violation" | "Defect"
  negativeCountLabel: string;    // "Violation Count" | "Defect Count"
  entityLabel: string;           // "Worker" | "Unit" | "Batch"
  zoneRiskLabel: string;         // "High-Risk Zone" | "High-Defect Zone"
  repeatOffenderLabel: string;   // "Repeat Violator" | "Repeat Defect Source"
  safeLabel: string;             // "Compliant" | "Pass"
  unsafeLabel: string;           // "Non-Compliant" | "Fail"
  stageLabel: string;            // "Production Stage" | "Inspection Zone" | "Road Segment"
  isDefectApp: boolean;
}

export type QualityAppId =
  | "pcb" | "welding" | "car-damage" | "bottle"
  | "corrosion" | "road-damage" | "pothole" | "phone-screen" | "assembly"
  | "food-quality" | "textile" | "solar-panel" | "semiconductor"
  | "metal-surface" | "glass" | "paint" | "wire-harness" | "packaging" | "wood";

export interface LiveStatus {
  compliance_rate_pct: number;
  compliance_status: "GREEN" | "AMBER" | "RED";
  active_violations_last_5min: number;
  high_risk_zones_count: number;
  high_risk_zones: string[];
  open_alerts: { critical: number; high: number; medium: number };
  cameras_online: number;
  cameras_total: number;
}

export interface ZoneMetric {
  zone_id: string;
  zone_name: string;
  compliance_pct: number;
  violation_count: number;
  defect_rate_pct: number;
  defect_count: number;
  top_violation_type: string;
  peak_violation_hour: number;
  trend: "up" | "down" | "stable";
  trend_delta_pct: number;
  status: "GREEN" | "AMBER" | "WATCH" | "HIGH_RISK";
  flag?: string;
}

export interface KPICardData {
  id: string;
  label: string;
  value: number;
  unit: string;
  format: string;
  definition: string;
  comparison: { period: string; value: number; delta: number; delta_pct?: number; direction: "up" | "down"; sentiment: "positive" | "negative" };
  sparkline_7d: number[];
  status: "GREEN" | "AMBER" | "RED";
  threshold?: number;
  benchmark?: { label: string; value: number };
  zones?: string[];
}

export interface AlertEvent {
  id: string;
  event_type: "ALERT" | "INCIDENT";
  name: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  timestamp: string;
  camera_id: string;
  zone: string;
  message: string;
  details: Record<string, unknown>;
  status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
}

export interface ScorecardRow {
  metric: string;
  this_period: number;
  last_period: number;
  target: number;
  unit: string;
  status: "ON_TRACK" | "WATCH" | "OFF_TARGET";
  symbol: string;
}

export interface HourlyQualityPoint {
  hour: number;
  label: string;
  compliance_pct: number;
  violation_count: number;
  status: "GREEN" | "AMBER" | "RED";
}

export interface RepeatViolator {
  tracker_id: number;
  anonymized_label: string;
  violation_count: number;
  days_seen: number;
  zones: string[];
  last_violation_ts: string;
  violation_types: Record<string, number>;
  badge: "RECURRING" | null;
}

export interface ShiftBar {
  label: string;
  safe_count: number;
  unsafe_count: number;
  compliance_pct: number;
  top_violation: string;
}

export interface SixMonthPoint {
  month: string;
  label: string;
  compliance_pct: number;
  defect_rate_pct: number;
}

// ── Defect-app specific ───────────────────────────────────────────────────────

export interface StageDefect {
  id: string;
  stage: string;           // e.g. "Bottle Forming", "Reflow Soldering"
  units_inspected: number;
  defect_count: number;
  defect_rate: number;     // percentage
  defect_density: number;  // % surface area covered
  status: "GREEN" | "AMBER" | "RED";
  top_defect_types: string[];
  trend: "up" | "down" | "stable";
}

export interface DensityItem {
  id: string;
  label: string;           // "Batch #47", "Unit A-12"
  density_pct: number;
  defect_count: number;
  status: "PASS" | "WARN" | "FAIL";
  defect_types: string[];
}
