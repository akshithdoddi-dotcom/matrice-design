export type ServiceHealth = "healthy" | "degraded" | "down" | "maintenance";
export type SparkDay = "healthy" | "degraded" | "down" | "no-data";

export interface MicroserviceRecord {
  id: string;
  name: string;
  category: "Core" | "Data" | "Inference";
  status: ServiceHealth;
  uptimePct: number;
  mttr: string;
  mtbf: string;
  availability: number;
  score: number;
  sparkDays: SparkDay[];
  responseTimeMs: number;
  errorRatePct: number;
}

export interface IncidentRecord {
  id: string;
  title: string;
  severity: "critical" | "major" | "minor";
  status: "resolved" | "ongoing" | "monitoring";
  startedAt: Date;
  resolvedAt: Date | null;
  durationLabel: string;
  affectedServices: string[];
}

export interface StatusSummary {
  overallStatus: "operational" | "partial-outage" | "major-incident";
  headline: string;
  healthScorePct: number;
  totalServices: number;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  uptimePct30d: number;
  activeIncidents: number;
}

function genSparkDays(serviceId: string, status: ServiceHealth, uptimePct: number): SparkDay[] {
  const seed = serviceId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return Array.from({ length: 90 }, (_, i): SparkDay => {
    const val = Math.abs(Math.sin(seed * 0.17 + i * 0.41)) * 100;
    if (uptimePct === 0) {
      return i < 60 ? (Math.abs(Math.sin(seed + i * 0.2)) > 0.4 ? "healthy" : "degraded") : "down";
    }
    if (status === "healthy") {
      return val > 10 ? "healthy" : val > 4 ? "degraded" : "no-data";
    }
    if (status === "degraded") {
      if (i > 70) return val > 45 ? "healthy" : val > 20 ? "degraded" : "down";
      return val > 60 ? "healthy" : val > 30 ? "degraded" : "no-data";
    }
    if (status === "down") {
      return i < 65 ? (val > 20 ? "healthy" : "degraded") : "down";
    }
    return "healthy";
  });
}

export const SERVICES: MicroserviceRecord[] = [
  // ── Core ──────────────────────────────────────────────────────────────────
  {
    id: "be-accounting", name: "be-accounting", category: "Core",
    status: "healthy", uptimePct: 98.85, mttr: "0.54h", mtbf: "34.08h",
    availability: 98.85, score: 98,
    sparkDays: genSparkDays("be-accounting", "healthy", 98.85),
    responseTimeMs: 42, errorRatePct: 0.12,
  },
  {
    id: "be-action", name: "be-action", category: "Core",
    status: "degraded", uptimePct: 94.62, mttr: "0.03h", mtbf: "33.59h",
    availability: 94.62, score: 95,
    sparkDays: genSparkDays("be-action", "degraded", 94.62),
    responseTimeMs: 128, errorRatePct: 5.38,
  },
  {
    id: "be-application", name: "be-application", category: "Core",
    status: "healthy", uptimePct: 99.13, mttr: "0.29h", mtbf: "25.17h",
    availability: 99.13, score: 99,
    sparkDays: genSparkDays("be-application", "healthy", 99.13),
    responseTimeMs: 38, errorRatePct: 0.08,
  },
  {
    id: "be-compute", name: "be-compute", category: "Core",
    status: "healthy", uptimePct: 95.12, mttr: "3.88h", mtbf: "61.93h",
    availability: 95.12, score: 95,
    sparkDays: genSparkDays("be-compute", "healthy", 95.12),
    responseTimeMs: 67, errorRatePct: 0.91,
  },

  // ── Data ──────────────────────────────────────────────────────────────────
  {
    id: "be-dataset", name: "be-dataset", category: "Data",
    status: "healthy", uptimePct: 97.94, mttr: "10.71h", mtbf: "43.98h",
    availability: 97.94, score: 98,
    sparkDays: genSparkDays("be-dataset", "healthy", 97.94),
    responseTimeMs: 54, errorRatePct: 0.22,
  },
  {
    id: "be-dataset-item", name: "be-dataset-item", category: "Data",
    status: "down", uptimePct: 0, mttr: "0.00h", mtbf: "0.00h",
    availability: 0, score: 0,
    sparkDays: genSparkDays("be-dataset-item", "down", 0),
    responseTimeMs: 0, errorRatePct: 100,
  },
  {
    id: "be-model", name: "be-model", category: "Data",
    status: "degraded", uptimePct: 84.25, mttr: "6.69h", mtbf: "47.74h",
    availability: 84.25, score: 83,
    sparkDays: genSparkDays("be-model", "degraded", 84.25),
    responseTimeMs: 245, errorRatePct: 15.75,
  },
  {
    id: "be-model-store", name: "be-model-store", category: "Data",
    status: "degraded", uptimePct: 82.80, mttr: "6.55h", mtbf: "55.26h",
    availability: 82.80, score: 83,
    sparkDays: genSparkDays("be-model-store", "degraded", 82.80),
    responseTimeMs: 312, errorRatePct: 17.20,
  },

  // ── Inference ─────────────────────────────────────────────────────────────
  {
    id: "be-inference", name: "be-inference", category: "Inference",
    status: "healthy", uptimePct: 98.59, mttr: "0.66h", mtbf: "38.99h",
    availability: 98.59, score: 99,
    sparkDays: genSparkDays("be-inference", "healthy", 98.59),
    responseTimeMs: 31, errorRatePct: 0.15,
  },
  {
    id: "be-inference-ws", name: "be-inference-ws", category: "Inference",
    status: "down", uptimePct: 0, mttr: "0.00h", mtbf: "0.00h",
    availability: 0, score: 0,
    sparkDays: genSparkDays("be-inference-ws", "down", 0),
    responseTimeMs: 0, errorRatePct: 100,
  },
  {
    id: "be-model-logging", name: "be-model-logging", category: "Inference",
    status: "down", uptimePct: 0, mttr: "0.00h", mtbf: "0.00h",
    availability: 0, score: 0,
    sparkDays: genSparkDays("be-model-logging", "down", 0),
    responseTimeMs: 0, errorRatePct: 100,
  },
  {
    id: "be-model-prediction", name: "be-model-prediction", category: "Inference",
    status: "degraded", uptimePct: 7.81, mttr: "34.85h", mtbf: "7.00h",
    availability: 7.81, score: 8,
    sparkDays: genSparkDays("be-model-prediction", "degraded", 7.81),
    responseTimeMs: 1840, errorRatePct: 92.19,
  },
];

const now = new Date("2026-05-18T10:00:00");

export const INCIDENTS: IncidentRecord[] = [
  {
    id: "inc-001",
    title: "be-inference-ws WebSocket gateway unreachable",
    severity: "critical",
    status: "ongoing",
    startedAt: new Date("2026-05-18T03:24:00"),
    resolvedAt: null,
    durationLabel: "6h 36m (ongoing)",
    affectedServices: ["be-inference-ws", "be-model-logging"],
  },
  {
    id: "inc-002",
    title: "Inference prediction pipeline latency spike",
    severity: "major",
    status: "monitoring",
    startedAt: new Date("2026-05-17T18:45:00"),
    resolvedAt: null,
    durationLabel: "15h 15m (monitoring)",
    affectedServices: ["be-model-prediction", "be-model", "be-model-store"],
  },
  {
    id: "inc-003",
    title: "Dataset item service failed health check",
    severity: "critical",
    status: "resolved",
    startedAt: new Date("2026-05-16T09:10:00"),
    resolvedAt: new Date("2026-05-16T14:52:00"),
    durationLabel: "5h 42m",
    affectedServices: ["be-dataset-item"],
  },
  {
    id: "inc-004",
    title: "Action service elevated error rate",
    severity: "minor",
    status: "resolved",
    startedAt: new Date("2026-05-14T22:30:00"),
    resolvedAt: new Date("2026-05-14T23:15:00"),
    durationLabel: "45m",
    affectedServices: ["be-action"],
  },
];

// ── Summary derived from SERVICES ────────────────────────────────────────────

const healthyCount = SERVICES.filter(s => s.status === "healthy").length;
const degradedCount = SERVICES.filter(s => s.status === "degraded").length;
const downCount = SERVICES.filter(s => s.status === "down").length;
const avgUptime = SERVICES.reduce((a, s) => a + s.uptimePct, 0) / SERVICES.length;
const healthScore = Math.round(
  (healthyCount * 100 + degradedCount * 60 + downCount * 0) / SERVICES.length
);

export const SUMMARY: StatusSummary = {
  overallStatus: downCount > 3 ? "major-incident" : degradedCount + downCount > 0 ? "partial-outage" : "operational",
  headline: downCount > 3 ? "Major Service Incident" : degradedCount + downCount > 0 ? "Partial Service Outage" : "All Systems Operational",
  healthScorePct: healthScore,
  totalServices: SERVICES.length,
  healthyCount,
  degradedCount,
  downCount,
  uptimePct30d: parseFloat(avgUptime.toFixed(2)),
  activeIncidents: INCIDENTS.filter(i => i.status !== "resolved").length,
};

export const CATEGORIES: Array<"Core" | "Data" | "Inference"> = ["Core", "Data", "Inference"];

void now;

// ── Latency + Request Rate ────────────────────────────────────────────────────

export interface EndpointMetric {
  id: string;
  service: string;
  method: "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "WS";
  path: string;
  p50Ms: number;
  p90Ms: number;
  p95Ms: number;
  reqPerMin: number;
}

export const ENDPOINT_METRICS: EndpointMetric[] = [
  { id: "em-01",  service: "be-accounting",       method: "GET",    path: "/api/v1/accounting/ledger",           p50Ms: 28,   p90Ms: 45,   p95Ms: 62,   reqPerMin: 1240 },
  { id: "em-02",  service: "be-accounting",       method: "POST",   path: "/api/v1/accounting/transactions",     p50Ms: 42,   p90Ms: 88,   p95Ms: 120,  reqPerMin: 580  },
  { id: "em-03",  service: "be-action",           method: "POST",   path: "/api/v1/actions/execute",             p50Ms: 128,  p90Ms: 380,  p95Ms: 720,  reqPerMin: 340  },
  { id: "em-04",  service: "be-action",           method: "GET",    path: "/api/v1/actions/{id}/status",         p50Ms: 45,   p90Ms: 120,  p95Ms: 195,  reqPerMin: 820  },
  { id: "em-05",  service: "be-application",      method: "GET",    path: "/api/v1/applications",                p50Ms: 22,   p90Ms: 38,   p95Ms: 55,   reqPerMin: 1820 },
  { id: "em-06",  service: "be-application",      method: "GET",    path: "/api/v1/applications/{id}",           p50Ms: 18,   p90Ms: 32,   p95Ms: 48,   reqPerMin: 2100 },
  { id: "em-07",  service: "be-application",      method: "POST",   path: "/api/v1/applications",                p50Ms: 65,   p90Ms: 120,  p95Ms: 180,  reqPerMin: 240  },
  { id: "em-08",  service: "be-compute",          method: "POST",   path: "/api/v1/compute/jobs",                p50Ms: 58,   p90Ms: 145,  p95Ms: 225,  reqPerMin: 180  },
  { id: "em-09",  service: "be-compute",          method: "GET",    path: "/api/v1/compute/jobs/{id}",           p50Ms: 32,   p90Ms: 68,   p95Ms: 102,  reqPerMin: 920  },
  { id: "em-10",  service: "be-dataset",          method: "GET",    path: "/api/v1/datasets",                    p50Ms: 48,   p90Ms: 95,   p95Ms: 138,  reqPerMin: 650  },
  { id: "em-11",  service: "be-dataset",          method: "GET",    path: "/api/v1/datasets/{id}",               p50Ms: 38,   p90Ms: 72,   p95Ms: 108,  reqPerMin: 1200 },
  { id: "em-12",  service: "be-model",            method: "GET",    path: "/api/v1/models",                      p50Ms: 245,  p90Ms: 580,  p95Ms: 890,  reqPerMin: 420  },
  { id: "em-13",  service: "be-model",            method: "GET",    path: "/api/v1/models/{id}",                 p50Ms: 185,  p90Ms: 420,  p95Ms: 680,  reqPerMin: 380  },
  { id: "em-14",  service: "be-model-store",      method: "POST",   path: "/api/v1/store/upload",                p50Ms: 312,  p90Ms: 780,  p95Ms: 1240, reqPerMin: 85   },
  { id: "em-15",  service: "be-model-store",      method: "GET",    path: "/api/v1/store/artifacts/{id}",        p50Ms: 280,  p90Ms: 620,  p95Ms: 980,  reqPerMin: 140  },
  { id: "em-16",  service: "be-inference",        method: "POST",   path: "/api/v1/inference/predict",           p50Ms: 31,   p90Ms: 62,   p95Ms: 88,   reqPerMin: 2840 },
  { id: "em-17",  service: "be-inference",        method: "POST",   path: "/api/v1/inference/batch",             p50Ms: 145,  p90Ms: 280,  p95Ms: 380,  reqPerMin: 120  },
  { id: "em-18",  service: "be-model-prediction", method: "POST",   path: "/api/v1/predictions",                 p50Ms: 1840, p90Ms: 3200, p95Ms: 4800, reqPerMin: 48   },
  { id: "em-19",  service: "be-model-prediction", method: "GET",    path: "/api/v1/predictions/{id}",            p50Ms: 920,  p90Ms: 1840, p95Ms: 2640, reqPerMin: 32   },
];

// ── Errors (4xx / 5xx per endpoint) ──────────────────────────────────────────

export interface ErrorEntry {
  code: number;
  message: string;
  count: number;
  lastSeen: string;
}

export interface EndpointError {
  id: string;
  service: string;
  method: string;
  path: string;
  count4xx: number;
  count5xx: number;
  errors: ErrorEntry[];
}

export const ENDPOINT_ERRORS: EndpointError[] = [
  {
    id: "ee-01", service: "be-action", method: "POST", path: "/api/v1/actions/execute",
    count4xx: 42, count5xx: 180,
    errors: [
      { code: 429, message: "Too Many Requests",      count: 28,  lastSeen: "1m ago"  },
      { code: 422, message: "Unprocessable Entity",   count: 14,  lastSeen: "3m ago"  },
      { code: 503, message: "Service Unavailable",    count: 128, lastSeen: "30s ago" },
      { code: 504, message: "Gateway Timeout",        count: 52,  lastSeen: "2m ago"  },
    ],
  },
  {
    id: "ee-02", service: "be-model", method: "GET", path: "/api/v1/models",
    count4xx: 18, count5xx: 312,
    errors: [
      { code: 404, message: "Not Found",              count: 18,  lastSeen: "4m ago"  },
      { code: 500, message: "Internal Server Error",  count: 245, lastSeen: "1m ago"  },
      { code: 502, message: "Bad Gateway",            count: 67,  lastSeen: "2m ago"  },
    ],
  },
  {
    id: "ee-03", service: "be-model-store", method: "POST", path: "/api/v1/store/upload",
    count4xx: 28, count5xx: 420,
    errors: [
      { code: 413, message: "Payload Too Large",      count: 28,  lastSeen: "6m ago"  },
      { code: 500, message: "Internal Server Error",  count: 388, lastSeen: "45s ago" },
      { code: 503, message: "Service Unavailable",    count: 32,  lastSeen: "3m ago"  },
    ],
  },
  {
    id: "ee-04", service: "be-model-prediction", method: "POST", path: "/api/v1/predictions",
    count4xx: 8, count5xx: 1840,
    errors: [
      { code: 400, message: "Bad Request",            count: 8,   lastSeen: "10m ago" },
      { code: 500, message: "Internal Server Error",  count: 1420,lastSeen: "20s ago" },
      { code: 504, message: "Gateway Timeout",        count: 420, lastSeen: "1m ago"  },
    ],
  },
  {
    id: "ee-05", service: "be-dataset-item", method: "GET", path: "/api/v1/datasets/{id}/items",
    count4xx: 0, count5xx: 2880,
    errors: [
      { code: 503, message: "Service Unavailable",    count: 2880,lastSeen: "10s ago" },
    ],
  },
  {
    id: "ee-06", service: "be-inference-ws", method: "WS", path: "/ws/inference/stream",
    count4xx: 0, count5xx: 1240,
    errors: [
      { code: 503, message: "Service Unavailable",    count: 1240,lastSeen: "15s ago" },
    ],
  },
  {
    id: "ee-07", service: "be-model-logging", method: "POST", path: "/api/v1/models/{id}/logs",
    count4xx: 0, count5xx: 980,
    errors: [
      { code: 503, message: "Service Unavailable",    count: 980, lastSeen: "20s ago" },
    ],
  },
];

// ── Resource utilisation per microservice ─────────────────────────────────────

export interface ServiceResource {
  serviceId: string;
  memoryMb: number;
  memoryLimitMb: number;
  storageMb: number;
  storageLimitMb: number;
  goroutines: number;
  threads: number;
  iopsRead: number;
  iopsWrite: number;
}

export const SERVICE_RESOURCES: ServiceResource[] = [
  { serviceId: "be-accounting",       memoryMb: 128,  memoryLimitMb: 512,  storageMb: 2458,   storageLimitMb: 102400,  goroutines: 124,  threads: 8,  iopsRead: 840,  iopsWrite: 120  },
  { serviceId: "be-action",           memoryMb: 384,  memoryLimitMb: 512,  storageMb: 8397,   storageLimitMb: 102400,  goroutines: 2840, threads: 16, iopsRead: 2200, iopsWrite: 840  },
  { serviceId: "be-application",      memoryMb: 92,   memoryLimitMb: 512,  storageMb: 1843,   storageLimitMb: 102400,  goroutines: 88,   threads: 6,  iopsRead: 640,  iopsWrite: 80   },
  { serviceId: "be-compute",          memoryMb: 248,  memoryLimitMb: 512,  storageMb: 25190,  storageLimitMb: 102400,  goroutines: 340,  threads: 12, iopsRead: 1840, iopsWrite: 480  },
  { serviceId: "be-dataset",          memoryMb: 186,  memoryLimitMb: 512,  storageMb: 49357,  storageLimitMb: 204800,  goroutines: 220,  threads: 10, iopsRead: 1240, iopsWrite: 380  },
  { serviceId: "be-dataset-item",     memoryMb: 480,  memoryLimitMb: 512,  storageMb: 98714,  storageLimitMb: 204800,  goroutines: 4820, threads: 24, iopsRead: 0,    iopsWrite: 0    },
  { serviceId: "be-model",            memoryMb: 398,  memoryLimitMb: 512,  storageMb: 74138,  storageLimitMb: 204800,  goroutines: 1840, threads: 18, iopsRead: 1020, iopsWrite: 480  },
  { serviceId: "be-model-store",      memoryMb: 412,  memoryLimitMb: 512,  storageMb: 146227, storageLimitMb: 256000,  goroutines: 2180, threads: 20, iopsRead: 840,  iopsWrite: 1240 },
  { serviceId: "be-inference",        memoryMb: 164,  memoryLimitMb: 512,  storageMb: 8602,   storageLimitMb: 102400,  goroutines: 180,  threads: 10, iopsRead: 2840, iopsWrite: 480  },
  { serviceId: "be-inference-ws",     memoryMb: 490,  memoryLimitMb: 512,  storageMb: 4301,   storageLimitMb: 102400,  goroutines: 8240, threads: 32, iopsRead: 0,    iopsWrite: 0    },
  { serviceId: "be-model-logging",    memoryMb: 468,  memoryLimitMb: 512,  storageMb: 18842,  storageLimitMb: 102400,  goroutines: 5640, threads: 28, iopsRead: 0,    iopsWrite: 0    },
  { serviceId: "be-model-prediction", memoryMb: 486,  memoryLimitMb: 512,  storageMb: 43827,  storageLimitMb: 204800,  goroutines: 6820, threads: 26, iopsRead: 240,  iopsWrite: 840  },
];

// ── Dependencies (DB, cache, circuit breaker) ─────────────────────────────────

export type CircuitBreakerState = "closed" | "half-open" | "open";

export interface ServiceDependency {
  id: string;
  serviceId: string;
  dbQueryLatencyMs: number | null;
  cacheHitRatioPct: number;
  circuitBreakerState: CircuitBreakerState;
  dbConnections: number;
  dbConnectionLimit: number;
  retryCount: number;
}

export const SERVICE_DEPENDENCIES: ServiceDependency[] = [
  { id: "dep-01", serviceId: "be-accounting",       dbQueryLatencyMs: 12,   cacheHitRatioPct: 94.2, circuitBreakerState: "closed",    dbConnections: 8,  dbConnectionLimit: 50, retryCount: 2    },
  { id: "dep-02", serviceId: "be-action",           dbQueryLatencyMs: 148,  cacheHitRatioPct: 62.4, circuitBreakerState: "half-open", dbConnections: 42, dbConnectionLimit: 50, retryCount: 48   },
  { id: "dep-03", serviceId: "be-application",      dbQueryLatencyMs: 8,    cacheHitRatioPct: 97.1, circuitBreakerState: "closed",    dbConnections: 12, dbConnectionLimit: 50, retryCount: 0    },
  { id: "dep-04", serviceId: "be-compute",          dbQueryLatencyMs: 24,   cacheHitRatioPct: 88.4, circuitBreakerState: "closed",    dbConnections: 18, dbConnectionLimit: 50, retryCount: 5    },
  { id: "dep-05", serviceId: "be-dataset",          dbQueryLatencyMs: 38,   cacheHitRatioPct: 85.2, circuitBreakerState: "closed",    dbConnections: 24, dbConnectionLimit: 50, retryCount: 3    },
  { id: "dep-06", serviceId: "be-dataset-item",     dbQueryLatencyMs: null, cacheHitRatioPct: 0,    circuitBreakerState: "open",      dbConnections: 0,  dbConnectionLimit: 50, retryCount: 2840 },
  { id: "dep-07", serviceId: "be-model",            dbQueryLatencyMs: 284,  cacheHitRatioPct: 42.8, circuitBreakerState: "half-open", dbConnections: 48, dbConnectionLimit: 50, retryCount: 184  },
  { id: "dep-08", serviceId: "be-model-store",      dbQueryLatencyMs: 312,  cacheHitRatioPct: 38.4, circuitBreakerState: "half-open", dbConnections: 50, dbConnectionLimit: 50, retryCount: 312  },
  { id: "dep-09", serviceId: "be-inference",        dbQueryLatencyMs: 18,   cacheHitRatioPct: 92.6, circuitBreakerState: "closed",    dbConnections: 14, dbConnectionLimit: 50, retryCount: 1    },
  { id: "dep-10", serviceId: "be-inference-ws",     dbQueryLatencyMs: null, cacheHitRatioPct: 0,    circuitBreakerState: "open",      dbConnections: 0,  dbConnectionLimit: 50, retryCount: 1240 },
  { id: "dep-11", serviceId: "be-model-logging",    dbQueryLatencyMs: null, cacheHitRatioPct: 0,    circuitBreakerState: "open",      dbConnections: 0,  dbConnectionLimit: 50, retryCount: 980  },
  { id: "dep-12", serviceId: "be-model-prediction", dbQueryLatencyMs: 1840, cacheHitRatioPct: 8.2,  circuitBreakerState: "open",      dbConnections: 2,  dbConnectionLimit: 50, retryCount: 3280 },
];
