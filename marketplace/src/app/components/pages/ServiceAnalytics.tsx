import { useState, useMemo, useCallback } from "react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip,
  CartesianGrid, ReferenceLine, ResponsiveContainer,
} from "recharts";
import {
  Clock, Timer, Eye, Activity, Gauge, Zap,
  Fuel, Coffee, ShoppingBag, Search, ChevronLeft,
  ChevronRight, ChevronDown, AlertTriangle, X,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type UseCase = "Petrol Bunk" | "Café" | "Drive-Thru";
type ServiceStatus =
  | "waiting"
  | "in-service"
  | "paying"
  | "seated"
  | "awaiting-prep"
  | "idle"
  | "complete";
type TrendDir = "up" | "down" | "neutral";

interface MetricDef {
  id: string;
  label: string;
  value: string;
  sublabel: string;
  num: string;
  ref_: string;
  dir: TrendDir;
  goodDir: "up" | "down";
  chip: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  definition: string;
}

interface AreaPoint {
  hour: number;
  wait: number;
  service: number;
}

type HeatmapData = number[][];

interface SankeyNode {
  id: string;
  label: string;
  value: number;
  color: string;
}

interface SankeyFlow {
  nodes: SankeyNode[];
  scale: number;
}

interface LedgerRow {
  id: string;
  entityId: string;
  zone: string;
  status: ServiceStatus;
  waitMin: number;
  serviceMin: number;
  dwellMin: number;
  cameraId: string;
  entryTime: string;
}

// ─── Utility ─────────────────────────────────────────────────────────────────

function hexToRgba(hex: string, alpha: number): string {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.substring(0, 2), 16);
  const g = parseInt(clean.substring(2, 4), 16);
  const b = parseInt(clean.substring(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

// ─── Theme ───────────────────────────────────────────────────────────────────

const THEME: Record<UseCase, { color: string; label: string; context: string }> = {
  "Petrol Bunk": {
    color: "#00775B",
    label: "Petrol Bunk",
    context: "8 pumps monitored · Live data",
  },
  "Café": {
    color: "#EA580C",
    label: "Café",
    context: "12 tables · 2 counters · Live data",
  },
  "Drive-Thru": {
    color: "#2B7FFF",
    label: "Drive-Thru",
    context: "3 lanes · 2 windows · Live data",
  },
};

// ─── KPI Metrics ─────────────────────────────────────────────────────────────

const METRICS: Record<UseCase, MetricDef[]> = {
  "Petrol Bunk": [
    {
      id: "awt", label: "Avg Wait Time", value: "4.2m",
      sublabel: "All Pumps · Current Queue",
      num: "+0.8m", ref_: "vs last hour", dir: "up", goodDir: "down",
      chip: "LIVE", color: "#E7000B", bgColor: "#FFE8E8",
      icon: Clock,
      definition: "Time spent in queue before service begins",
    },
    {
      id: "svc", label: "Service Time", value: "6.5m",
      sublabel: "Avg Pump Service Time",
      num: "-0.3m", ref_: "vs target 7m", dir: "down", goodDir: "down",
      chip: "TARGET", color: "#00A63E", bgColor: "#E5FFEF",
      icon: Timer,
      definition: "Active fuelling duration per vehicle",
    },
    {
      id: "dwell", label: "Dwell Time", value: "12.1m",
      sublabel: "Entry to Exit · All Vehicles",
      num: "0", ref_: "No change", dir: "neutral", goodDir: "down",
      chip: "24H", color: "#64748B", bgColor: "#F0F2F4",
      icon: Eye,
      definition: "Total facility time from entry to exit",
    },
    {
      id: "thru", label: "Zone Throughput", value: "34",
      sublabel: "Vehicles / Hour · Site",
      num: "+2", ref_: "vs last hour", dir: "up", goodDir: "up",
      chip: "LIVE", color: "#2B7FFF", bgColor: "#EBF3FF",
      icon: Activity,
      definition: "Vehicles successfully serviced per hour",
    },
    {
      id: "idle", label: "Idle Rate", value: "18%",
      sublabel: "Pump Idle · All Bays",
      num: "-4%", ref_: "vs yesterday", dir: "down", goodDir: "down",
      chip: "DAILY", color: "#64748B", bgColor: "#F0F2F4",
      icon: Gauge,
      definition: "Percentage of pump time with no active service",
    },
    {
      id: "bottleneck", label: "Bottleneck Index", value: "2.3",
      sublabel: "Waiting Phase · Score",
      num: "+0.4", ref_: "vs last hour", dir: "up", goodDir: "down",
      chip: "ALERT", color: "#EA580C", bgColor: "#FFF4EE",
      icon: Zap,
      definition: "Predictive score identifying the highest-delay stage",
    },
  ],
  "Café": [
    {
      id: "awt", label: "Avg Wait Time", value: "6.8m",
      sublabel: "All Counters · Current Queue",
      num: "+1.2m", ref_: "vs last hour", dir: "up", goodDir: "down",
      chip: "LIVE", color: "#E7000B", bgColor: "#FFE8E8",
      icon: Clock,
      definition: "Time spent waiting before order is taken",
    },
    {
      id: "svc", label: "Service Time", value: "4.2m",
      sublabel: "Avg Order Prep Time",
      num: "-0.6m", ref_: "vs target 5m", dir: "down", goodDir: "down",
      chip: "TARGET", color: "#00A63E", bgColor: "#E5FFEF",
      icon: Timer,
      definition: "Time from order placed to order ready",
    },
    {
      id: "dwell", label: "Dwell Time", value: "22.5m",
      sublabel: "Seated Duration · All Tables",
      num: "+2.1m", ref_: "vs yesterday", dir: "up", goodDir: "neutral",
      chip: "24H", color: "#64748B", bgColor: "#F0F2F4",
      icon: Eye,
      definition: "Total time from entry to exit for seated guests",
    },
    {
      id: "thru", label: "Zone Throughput", value: "24",
      sublabel: "Orders / Hour · Site",
      num: "+3", ref_: "vs last hour", dir: "up", goodDir: "up",
      chip: "LIVE", color: "#EA580C", bgColor: "#FFF4EE",
      icon: Activity,
      definition: "Orders successfully fulfilled per hour",
    },
    {
      id: "idle", label: "Idle Rate", value: "12%",
      sublabel: "Counter Idle · All Stations",
      num: "-2%", ref_: "vs yesterday", dir: "down", goodDir: "down",
      chip: "DAILY", color: "#64748B", bgColor: "#F0F2F4",
      icon: Gauge,
      definition: "Percentage of counter time with no active order",
    },
    {
      id: "bottleneck", label: "Bottleneck Index", value: "3.1",
      sublabel: "Prep Phase · Score",
      num: "+0.7", ref_: "vs last hour", dir: "up", goodDir: "down",
      chip: "ALERT", color: "#EA580C", bgColor: "#FFF4EE",
      icon: Zap,
      definition: "Predictive score identifying the highest-delay stage",
    },
  ],
  "Drive-Thru": [
    {
      id: "awt", label: "Avg Wait Time", value: "3.1m",
      sublabel: "All Lanes · Current Queue",
      num: "-0.4m", ref_: "vs last hour", dir: "down", goodDir: "down",
      chip: "LIVE", color: "#00A63E", bgColor: "#E5FFEF",
      icon: Clock,
      definition: "Time spent in queue before reaching the window",
    },
    {
      id: "svc", label: "Service Time", value: "2.8m",
      sublabel: "Avg Window Service Time",
      num: "+0.2m", ref_: "vs target 2.5m", dir: "up", goodDir: "down",
      chip: "TARGET", color: "#E7000B", bgColor: "#FFE8E8",
      icon: Timer,
      definition: "Time at the service window per vehicle",
    },
    {
      id: "dwell", label: "Dwell Time", value: "8.4m",
      sublabel: "Lane Entry to Exit",
      num: "-0.3m", ref_: "vs last hour", dir: "down", goodDir: "down",
      chip: "24H", color: "#64748B", bgColor: "#F0F2F4",
      icon: Eye,
      definition: "Total lane time from entry to exit",
    },
    {
      id: "thru", label: "Zone Throughput", value: "52",
      sublabel: "Vehicles / Hour · All Lanes",
      num: "+4", ref_: "vs last hour", dir: "up", goodDir: "up",
      chip: "LIVE", color: "#2B7FFF", bgColor: "#EBF3FF",
      icon: Activity,
      definition: "Vehicles successfully serviced per hour",
    },
    {
      id: "idle", label: "Idle Rate", value: "7%",
      sublabel: "Window Idle · All Lanes",
      num: "-1%", ref_: "vs yesterday", dir: "down", goodDir: "down",
      chip: "DAILY", color: "#64748B", bgColor: "#F0F2F4",
      icon: Gauge,
      definition: "Percentage of window time with no active vehicle",
    },
    {
      id: "bottleneck", label: "Bottleneck Index", value: "1.8",
      sublabel: "Window Phase · Score",
      num: "+0.2", ref_: "vs last hour", dir: "up", goodDir: "down",
      chip: "ALERT", color: "#2B7FFF", bgColor: "#EBF3FF",
      icon: Zap,
      definition: "Predictive score identifying the highest-delay stage",
    },
  ],
};

// ─── Area Chart Data ──────────────────────────────────────────────────────────

const AREA_DATA: Record<UseCase, AreaPoint[]> = {
  "Petrol Bunk": [
    { hour: 0, wait: 0.6, service: 5.1 },
    { hour: 1, wait: 0.5, service: 4.8 },
    { hour: 2, wait: 0.4, service: 4.6 },
    { hour: 3, wait: 0.5, service: 4.9 },
    { hour: 4, wait: 0.8, service: 5.2 },
    { hour: 5, wait: 1.4, service: 5.6 },
    { hour: 6, wait: 3.2, service: 6.4 },
    { hour: 7, wait: 7.4, service: 7.4 },
    { hour: 8, wait: 6.8, service: 7.2 },
    { hour: 9, wait: 4.6, service: 6.8 },
    { hour: 10, wait: 3.1, service: 6.5 },
    { hour: 11, wait: 3.8, service: 6.7 },
    { hour: 12, wait: 5.4, service: 7.1 },
    { hour: 13, wait: 6.6, service: 7.3 },
    { hour: 14, wait: 4.2, service: 6.8 },
    { hour: 15, wait: 3.4, service: 6.4 },
    { hour: 16, wait: 4.1, service: 6.6 },
    { hour: 17, wait: 6.8, service: 7.4 },
    { hour: 18, wait: 8.2, service: 7.6 },
    { hour: 19, wait: 5.8, service: 7.1 },
    { hour: 20, wait: 3.6, service: 6.5 },
    { hour: 21, wait: 2.2, service: 6.1 },
    { hour: 22, wait: 1.4, service: 5.8 },
    { hour: 23, wait: 0.9, service: 5.4 },
  ],
  "Café": [
    { hour: 0, wait: 0.2, service: 2.1 },
    { hour: 1, wait: 0.1, service: 1.8 },
    { hour: 2, wait: 0.1, service: 1.6 },
    { hour: 3, wait: 0.1, service: 1.5 },
    { hour: 4, wait: 0.2, service: 2.0 },
    { hour: 5, wait: 0.5, service: 2.4 },
    { hour: 6, wait: 1.8, service: 3.2 },
    { hour: 7, wait: 4.6, service: 4.1 },
    { hour: 8, wait: 7.8, service: 4.8 },
    { hour: 9, wait: 8.4, service: 5.1 },
    { hour: 10, wait: 5.2, service: 4.4 },
    { hour: 11, wait: 4.1, service: 4.2 },
    { hour: 12, wait: 7.6, service: 4.9 },
    { hour: 13, wait: 9.2, service: 5.3 },
    { hour: 14, wait: 5.8, service: 4.6 },
    { hour: 15, wait: 3.4, service: 4.0 },
    { hour: 16, wait: 4.2, service: 4.2 },
    { hour: 17, wait: 6.8, service: 4.7 },
    { hour: 18, wait: 8.6, service: 5.0 },
    { hour: 19, wait: 9.4, service: 5.2 },
    { hour: 20, wait: 6.2, service: 4.5 },
    { hour: 21, wait: 3.8, service: 3.8 },
    { hour: 22, wait: 1.6, service: 3.1 },
    { hour: 23, wait: 0.6, service: 2.4 },
  ],
  "Drive-Thru": [
    { hour: 0, wait: 0.3, service: 1.8 },
    { hour: 1, wait: 0.2, service: 1.6 },
    { hour: 2, wait: 0.2, service: 1.5 },
    { hour: 3, wait: 0.2, service: 1.6 },
    { hour: 4, wait: 0.4, service: 1.9 },
    { hour: 5, wait: 0.8, service: 2.1 },
    { hour: 6, wait: 1.6, service: 2.4 },
    { hour: 7, wait: 3.8, service: 2.9 },
    { hour: 8, wait: 6.4, service: 3.2 },
    { hour: 9, wait: 4.2, service: 3.0 },
    { hour: 10, wait: 2.8, service: 2.7 },
    { hour: 11, wait: 2.4, service: 2.6 },
    { hour: 12, wait: 5.6, service: 3.1 },
    { hour: 13, wait: 7.2, service: 3.3 },
    { hour: 14, wait: 3.8, service: 2.8 },
    { hour: 15, wait: 2.6, service: 2.6 },
    { hour: 16, wait: 3.2, service: 2.7 },
    { hour: 17, wait: 5.8, service: 3.0 },
    { hour: 18, wait: 7.4, service: 3.2 },
    { hour: 19, wait: 6.2, service: 3.1 },
    { hour: 20, wait: 3.6, service: 2.8 },
    { hour: 21, wait: 2.0, service: 2.5 },
    { hour: 22, wait: 1.2, service: 2.2 },
    { hour: 23, wait: 0.6, service: 1.9 },
  ],
};

// ─── Heatmap Data ─────────────────────────────────────────────────────────────

const HEATMAP_DATA: Record<UseCase, HeatmapData> = {
  "Petrol Bunk": [
    // Mon
    [4,3,2,2,3,5,18,72,65,48,34,38,56,68,44,32,40,72,84,62,42,28,16,8],
    // Tue
    [3,2,2,2,4,6,20,74,66,46,32,40,58,66,42,30,38,70,82,60,40,26,14,7],
    // Wed
    [4,3,2,2,3,5,22,76,68,50,36,42,60,70,46,34,42,74,86,64,44,30,18,9],
    // Thu
    [3,2,2,2,4,7,24,78,70,52,38,44,62,72,48,36,44,76,88,66,46,32,20,10],
    // Fri
    [5,3,2,2,4,8,26,80,72,54,40,46,64,74,50,38,46,78,90,68,48,34,22,12],
    // Sat
    [6,4,3,2,3,6,14,44,52,58,52,54,62,66,58,52,50,60,64,56,44,32,20,10],
    // Sun
    [4,3,2,2,2,4,8,28,36,42,46,44,48,52,46,40,38,44,48,42,32,22,14,7],
  ],
  "Café": [
    // Mon
    [2,1,1,1,2,4,14,52,78,82,64,58,74,86,58,36,42,68,80,86,62,40,20,8],
    // Tue
    [2,1,1,1,2,4,12,50,76,80,62,56,72,84,56,34,40,66,78,84,60,38,18,7],
    // Wed
    [3,2,1,1,2,4,16,54,80,84,66,60,76,88,60,38,44,70,82,88,64,42,22,9],
    // Thu
    [2,1,1,1,2,5,14,54,78,82,64,58,74,86,58,36,44,70,84,88,66,44,22,10],
    // Fri
    [3,2,1,1,2,5,16,56,80,84,68,62,78,90,62,40,46,72,86,90,68,46,24,12],
    // Sat
    [4,2,1,1,2,3,8,36,62,74,76,72,70,68,66,62,58,66,76,80,66,46,26,12],
    // Sun
    [3,2,1,1,2,3,6,24,46,58,62,58,56,54,52,48,44,52,60,64,50,34,18,8],
  ],
  "Drive-Thru": [
    // Mon
    [3,2,1,1,2,4,12,44,82,58,38,34,62,86,46,28,36,62,88,76,48,28,14,6],
    // Tue
    [2,1,1,1,2,4,10,42,80,56,36,32,60,84,44,26,34,60,86,74,46,26,12,5],
    // Wed
    [3,2,1,1,2,4,14,46,84,60,40,36,64,88,48,30,38,64,90,78,50,30,16,7],
    // Thu
    [3,2,1,1,2,4,12,46,82,60,38,34,62,86,46,28,36,62,88,76,48,28,14,6],
    // Fri
    [4,2,1,1,2,5,14,48,84,62,42,38,66,90,50,32,40,66,92,80,52,32,18,8],
    // Sat
    [4,3,2,1,2,4,8,30,54,60,58,54,62,72,58,46,44,56,68,60,44,28,16,7],
    // Sun
    [3,2,1,1,1,3,6,20,36,44,46,42,48,58,44,34,30,40,50,44,30,18,10,4],
  ],
};

// ─── Sankey Data ──────────────────────────────────────────────────────────────

const SANKEY_DATA: Record<UseCase, SankeyFlow> = {
  "Petrol Bunk": {
    nodes: [
      { id: "entry",   label: "Entry",   value: 847, color: "#64748B" },
      { id: "waiting", label: "Waiting", value: 789, color: "#E19A04" },
      { id: "service", label: "Service", value: 751, color: "#00775B" },
      { id: "exit",    label: "Exit",    value: 712, color: "#2B7FFF" },
    ],
    scale: 1,
  },
  "Café": {
    nodes: [
      { id: "entry",   label: "Entry",   value: 312, color: "#64748B" },
      { id: "waiting", label: "Waiting", value: 298, color: "#E19A04" },
      { id: "service", label: "Service", value: 284, color: "#EA580C" },
      { id: "exit",    label: "Exit",    value: 271, color: "#2B7FFF" },
    ],
    scale: 1,
  },
  "Drive-Thru": {
    nodes: [
      { id: "entry",   label: "Entry",   value: 1024, color: "#64748B" },
      { id: "waiting", label: "Waiting", value: 978,  color: "#E19A04" },
      { id: "service", label: "Service", value: 942,  color: "#2B7FFF" },
      { id: "exit",    label: "Exit",    value: 901,  color: "#00A63E" },
    ],
    scale: 1,
  },
};

// ─── Service Ledger Data ──────────────────────────────────────────────────────

const LEDGER_DATA: Record<UseCase, LedgerRow[]> = {
  "Petrol Bunk": [
    { id: "SS-001", entityId: "VH-4821", zone: "Pump 3", status: "in-service", waitMin: 3, serviceMin: 4, dwellMin: 7, cameraId: "CAM-P3-01", entryTime: "14:22:14" },
    { id: "SS-002", entityId: "VH-4820", zone: "Pump 7", status: "waiting",    waitMin: 11, serviceMin: 0, dwellMin: 11, cameraId: "CAM-P7-01", entryTime: "14:28:06" },
    { id: "SS-003", entityId: "VH-4819", zone: "Pump 1", status: "paying",     waitMin: 4, serviceMin: 6, dwellMin: 10, cameraId: "CAM-P1-01", entryTime: "14:19:52" },
    { id: "SS-004", entityId: "VH-4818", zone: "Pump 5", status: "in-service", waitMin: 2, serviceMin: 3, dwellMin: 5,  cameraId: "CAM-P5-01", entryTime: "14:26:40" },
    { id: "SS-005", entityId: "VH-4817", zone: "Pump 2", status: "waiting",    waitMin: 13, serviceMin: 0, dwellMin: 13, cameraId: "CAM-P2-01", entryTime: "14:16:08" },
    { id: "SS-006", entityId: "VH-4816", zone: "Pump 8", status: "in-service", waitMin: 5, serviceMin: 2, dwellMin: 7,  cameraId: "CAM-P8-01", entryTime: "14:24:32" },
    { id: "SS-007", entityId: "VH-4815", zone: "Pump 4", status: "idle",       waitMin: 0, serviceMin: 0, dwellMin: 8,  cameraId: "CAM-P4-01", entryTime: "14:21:18" },
    { id: "SS-008", entityId: "VH-4814", zone: "Pump 6", status: "complete",   waitMin: 3, serviceMin: 7, dwellMin: 10, cameraId: "CAM-P6-01", entryTime: "14:18:44" },
    { id: "SS-009", entityId: "VH-4813", zone: "Pump 3", status: "complete",   waitMin: 2, serviceMin: 6, dwellMin: 8,  cameraId: "CAM-P3-01", entryTime: "14:10:22" },
    { id: "SS-010", entityId: "VH-4812", zone: "Pump 1", status: "complete",   waitMin: 4, serviceMin: 5, dwellMin: 9,  cameraId: "CAM-P1-01", entryTime: "14:07:58" },
    { id: "SS-011", entityId: "VH-4811", zone: "Pump 7", status: "complete",   waitMin: 6, serviceMin: 7, dwellMin: 13, cameraId: "CAM-P7-01", entryTime: "14:03:36" },
    { id: "SS-012", entityId: "VH-4810", zone: "Pump 5", status: "complete",   waitMin: 3, serviceMin: 8, dwellMin: 11, cameraId: "CAM-P5-01", entryTime: "13:58:14" },
  ],
  "Café": [
    { id: "SS-001", entityId: "TBL-05", zone: "Table 5",   status: "seated",       waitMin: 8, serviceMin: 12, dwellMin: 20, cameraId: "CAM-A1-01", entryTime: "14:18:30" },
    { id: "SS-002", entityId: "TBL-02", zone: "Counter 1", status: "awaiting-prep",waitMin: 12, serviceMin: 0,  dwellMin: 12, cameraId: "CAM-C1-01", entryTime: "14:24:14" },
    { id: "SS-003", entityId: "TBL-09", zone: "Table 9",   status: "waiting",      waitMin: 11, serviceMin: 0,  dwellMin: 11, cameraId: "CAM-A2-01", entryTime: "14:26:48" },
    { id: "SS-004", entityId: "TBL-07", zone: "Table 7",   status: "paying",       waitMin: 6, serviceMin: 22, dwellMin: 28, cameraId: "CAM-A1-02", entryTime: "14:08:52" },
    { id: "SS-005", entityId: "TBL-01", zone: "Counter 2", status: "awaiting-prep",waitMin: 4, serviceMin: 2,  dwellMin: 6,  cameraId: "CAM-C2-01", entryTime: "14:27:22" },
    { id: "SS-006", entityId: "TBL-10", zone: "Table 10",  status: "seated",       waitMin: 7, serviceMin: 8,  dwellMin: 15, cameraId: "CAM-A2-02", entryTime: "14:20:40" },
    { id: "SS-007", entityId: "TBL-03", zone: "Table 3",   status: "complete",     waitMin: 5, serviceMin: 18, dwellMin: 23, cameraId: "CAM-A1-01", entryTime: "14:04:16" },
    { id: "SS-008", entityId: "TBL-06", zone: "Counter 1", status: "complete",     waitMin: 3, serviceMin: 4,  dwellMin: 7,  cameraId: "CAM-C1-01", entryTime: "14:02:38" },
    { id: "SS-009", entityId: "TBL-08", zone: "Table 8",   status: "complete",     waitMin: 8, serviceMin: 24, dwellMin: 32, cameraId: "CAM-A2-01", entryTime: "13:56:04" },
    { id: "SS-010", entityId: "TBL-04", zone: "Table 4",   status: "complete",     waitMin: 4, serviceMin: 16, dwellMin: 20, cameraId: "CAM-A1-02", entryTime: "13:48:50" },
  ],
  "Drive-Thru": [
    { id: "SS-001", entityId: "LN-08", zone: "Lane 2",    status: "in-service", waitMin: 3, serviceMin: 2, dwellMin: 5,  cameraId: "CAM-L2-01", entryTime: "14:30:12" },
    { id: "SS-002", entityId: "LN-07", zone: "Window 1",  status: "paying",     waitMin: 4, serviceMin: 3, dwellMin: 7,  cameraId: "CAM-W1-01", entryTime: "14:27:44" },
    { id: "SS-003", entityId: "LN-06", zone: "Lane 1",    status: "waiting",    waitMin: 12, serviceMin: 0, dwellMin: 12, cameraId: "CAM-L1-01", entryTime: "14:25:18" },
    { id: "SS-004", entityId: "LN-05", zone: "Lane 3",    status: "in-service", waitMin: 2, serviceMin: 1, dwellMin: 3,  cameraId: "CAM-L3-01", entryTime: "14:31:06" },
    { id: "SS-005", entityId: "LN-04", zone: "Window 2",  status: "waiting",    waitMin: 11, serviceMin: 0, dwellMin: 11, cameraId: "CAM-W2-01", entryTime: "14:22:58" },
    { id: "SS-006", entityId: "LN-03", zone: "Lane 2",    status: "complete",   waitMin: 3, serviceMin: 3, dwellMin: 6,  cameraId: "CAM-L2-01", entryTime: "14:18:36" },
    { id: "SS-007", entityId: "LN-02", zone: "Window 1",  status: "complete",   waitMin: 2, serviceMin: 2, dwellMin: 4,  cameraId: "CAM-W1-01", entryTime: "14:14:22" },
    { id: "SS-008", entityId: "LN-01", zone: "Lane 1",    status: "complete",   waitMin: 5, serviceMin: 3, dwellMin: 8,  cameraId: "CAM-L1-01", entryTime: "14:10:08" },
  ],
};

// ─── Sub-components ───────────────────────────────────────────────────────────

// Custom Tooltip for Recharts
const AreaTooltipContent = ({
  active, payload, label,
}: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: number;
}) => {
  if (!active || !payload || payload.length === 0) return null;
  const wait    = payload.find((p) => p.name === "wait");
  const service = payload.find((p) => p.name === "service");
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #E2E8F0",
        borderRadius: 4,
        padding: "8px 12px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        fontSize: 11,
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontWeight: 700, color: "#0F172A", marginBottom: 4 }}>
        {label}:00
      </div>
      {service && (
        <div style={{ color: "#475569", display: "flex", gap: 6, alignItems: "center" }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: service.color, display: "inline-block" }} />
          Service: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{service.value.toFixed(1)}m</strong>
        </div>
      )}
      {wait && (
        <div style={{ color: "#475569", display: "flex", gap: 6, alignItems: "center", marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: "#E19A04", display: "inline-block" }} />
          Wait: <strong style={{ fontFamily: "'JetBrains Mono', monospace" }}>{wait.value.toFixed(1)}m</strong>
        </div>
      )}
    </div>
  );
};

// Stacked Area Chart
const StackedAreaChart: React.FC<{ data: AreaPoint[]; themeColor: string }> = ({
  data, themeColor,
}) => {
  const gradId = `svc-grad-${themeColor.replace("#", "")}`;
  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data} margin={{ top: 12, right: 80, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor={themeColor} stopOpacity={0.35} />
            <stop offset="95%" stopColor={themeColor} stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id="wait-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%"  stopColor="#E19A04" stopOpacity={0.50} />
            <stop offset="95%" stopColor="#E19A04" stopOpacity={0.10} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke="rgba(0,0,0,0.05)" />
        <XAxis
          dataKey="hour"
          tickFormatter={(v) => `${v}h`}
          interval={3}
          tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "Inter, sans-serif" }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tickFormatter={(v) => `${v}m`}
          tick={{ fontSize: 10, fill: "#94A3B8", fontFamily: "Inter, sans-serif" }}
          axisLine={false}
          tickLine={false}
          width={36}
        />
        <RechartsTooltip content={<AreaTooltipContent />} />
        <ReferenceLine
          y={10}
          stroke="#E7000B"
          strokeDasharray="4 2"
          strokeOpacity={0.4}
          label={{ value: "10m threshold", position: "right", fontSize: 9, fill: "#E7000B" }}
        />
        <Area
          type="monotone"
          dataKey="service"
          stackId="1"
          stroke={themeColor}
          strokeWidth={1.5}
          fill={`url(#${gradId})`}
        />
        <Area
          type="monotone"
          dataKey="wait"
          stackId="1"
          stroke="#E19A04"
          strokeWidth={1.5}
          fill="url(#wait-grad)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

// Heatmap Grid
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const HOUR_TICKS = ["0h", "4h", "8h", "12h", "16h", "20h"];

const HeatmapGrid: React.FC<{ data: HeatmapData; themeColor: string }> = ({
  data, themeColor,
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
    <div
      style={{
        fontSize: 9,
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#94A3B8",
        marginBottom: 2,
      }}
    >
      Service Density · Hour of Day
    </div>
    <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {data.map((row, di) => (
        <div key={DAY_LABELS[di]} style={{ display: "flex", alignItems: "center", gap: 3 }}>
          <div
            style={{
              width: 24,
              fontSize: 9,
              fontFamily: "Inter, sans-serif",
              color: "#94A3B8",
              flexShrink: 0,
            }}
          >
            {DAY_LABELS[di]}
          </div>
          {row.map((val, hi) => (
            <div
              key={hi}
              style={{
                flex: 1,
                height: 16,
                borderRadius: 2,
                backgroundColor:
                  val > 8
                    ? hexToRgba(themeColor, (val / 100) * 0.75 + 0.04)
                    : "#F1F5F9",
                cursor: "default",
              }}
              title={`${DAY_LABELS[di]} ${String(hi).padStart(2, "0")}:00 — ${val}%`}
            />
          ))}
        </div>
      ))}
    </div>
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        paddingLeft: 27,
        marginTop: 2,
      }}
    >
      {HOUR_TICKS.map((t) => (
        <span
          key={t}
          style={{
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
            color: "#94A3B8",
          }}
        >
          {t}
        </span>
      ))}
    </div>
  </div>
);

// Sankey Flow Chart
const NODE_X: Record<string, number> = {
  entry: 40, waiting: 210, service: 410, exit: 610,
};
const NODE_W = 12;

const SankeyFlowChart: React.FC<{ flow: SankeyFlow }> = ({ flow }) => {
  const { nodes } = flow;
  const maxVal = Math.max(...nodes.map((n) => n.value));
  const scale  = 180 / maxVal;

  type NodeMeta = { x: number; yTop: number; yBot: number; h: number };
  const meta: Record<string, NodeMeta> = {};
  nodes.forEach((n) => {
    const h    = n.value * scale;
    const yTop = 130 - h / 2;
    const yBot = 130 + h / 2;
    meta[n.id] = { x: NODE_X[n.id] ?? 40, yTop, yBot, h };
  });

  const links: Array<{ src: SankeyNode; tgt: SankeyNode }> = [];
  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({ src: nodes[i], tgt: nodes[i + 1] });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <svg viewBox="0 0 760 290" style={{ width: "100%", height: "auto", overflow: "visible" }}>
        <defs>
          {links.map(({ src, tgt }) => (
            <linearGradient
              key={`lg-${src.id}-${tgt.id}`}
              id={`lg-${src.id}-${tgt.id}`}
              x1="0" y1="0" x2="1" y2="0"
            >
              <stop offset="0%"   stopColor={src.color} stopOpacity={0.4} />
              <stop offset="100%" stopColor={tgt.color} stopOpacity={0.4} />
            </linearGradient>
          ))}
        </defs>

        {/* Ribbon links */}
        {links.map(({ src, tgt }) => {
          const sm = meta[src.id];
          const tm = meta[tgt.id];
          const sx  = sm.x + NODE_W;
          const tx  = tm.x;
          const mx  = (sx + tx) / 2;
          const sy1 = tm.yTop;
          const sy2 = tm.yBot;
          const ty1 = tm.yTop;
          const ty2 = tm.yBot;
          const path = `M ${sx} ${sy1} C ${mx} ${sy1} ${mx} ${ty1} ${tx} ${ty1} L ${tx} ${ty2} C ${mx} ${ty2} ${mx} ${sy2} ${sx} ${sy2} Z`;
          return (
            <path
              key={`link-${src.id}-${tgt.id}`}
              d={path}
              fill={`url(#lg-${src.id}-${tgt.id})`}
            />
          );
        })}

        {/* Nodes + labels */}
        {nodes.map((n) => {
          const m = meta[n.id];
          return (
            <g key={n.id}>
              {/* Label above */}
              <text
                x={m.x + NODE_W / 2}
                y={m.yTop - 18}
                textAnchor="middle"
                fontSize={9}
                fontWeight={700}
                fontFamily="Inter, sans-serif"
                fill="#475569"
                style={{ textTransform: "uppercase", letterSpacing: "0.06em" }}
              >
                {n.label.toUpperCase()}
              </text>
              {/* Node rect */}
              <rect
                x={m.x}
                y={m.yTop}
                width={NODE_W}
                height={m.h}
                fill={n.color}
                rx={2}
              />
              {/* Value below */}
              <text
                x={m.x + NODE_W / 2}
                y={m.yBot + 16}
                textAnchor="middle"
                fontSize={13}
                fontWeight={700}
                fontFamily="'JetBrains Mono', monospace"
                fill="#0F172A"
              >
                {n.value.toLocaleString()}
              </text>
              <text
                x={m.x + NODE_W / 2}
                y={m.yBot + 28}
                textAnchor="middle"
                fontSize={10}
                fontFamily="Inter, sans-serif"
                fill="#94A3B8"
              >
                vehicles
              </text>
            </g>
          );
        })}

        {/* Leakage annotations */}
        {links.map(({ src, tgt }) => {
          const sm   = meta[src.id];
          const tm   = meta[tgt.id];
          const midX = (sm.x + NODE_W + tm.x) / 2;
          const leak = src.value - tgt.value;
          if (leak <= 0) return null;
          return (
            <text
              key={`leak-${src.id}-${tgt.id}`}
              x={midX}
              y={Math.max(sm.yBot, tm.yBot) + 44}
              textAnchor="middle"
              fontSize={9}
              fontFamily="Inter, sans-serif"
              fontStyle="italic"
              fill="#E7000B"
            >
              ↓ {leak} abandoned
            </text>
          );
        })}
      </svg>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {nodes.map((n) => (
          <div key={n.id} style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <div
              style={{
                width: 10,
                height: 10,
                borderRadius: 2,
                backgroundColor: n.color,
                flexShrink: 0,
              }}
            />
            <span
              style={{
                fontSize: 10,
                fontFamily: "Inter, sans-serif",
                color: "#475569",
                textTransform: "capitalize",
              }}
            >
              {n.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// Service Stat Card
const ServiceStatCard: React.FC<{ d: MetricDef }> = ({ d }) => {
  const [hovered, setHovered] = useState(false);

  const trendColor =
    d.dir === "neutral"
      ? "#64748B"
      : d.dir === d.goodDir
      ? d.color
      : "#E7000B";

  const trendPrefix =
    d.dir === "up" ? "▲" : d.dir === "down" ? "▼" : "●";

  const IconEl = d.icon;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: d.bgColor,
        border: `1px solid ${d.color}`,
        borderRadius: 4,
        minWidth: 280,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        transition: "box-shadow 0.18s ease",
        boxShadow: hovered
          ? `0 0 18px 4px ${hexToRgba(d.color, 0.22)}, 0 4px 14px rgba(0,0,0,0.07)`
          : "none",
        cursor: "default",
      }}
    >
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <IconEl size={12} color={d.color} />
          <span
            style={{
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#475569",
            }}
          >
            {d.label}
          </span>
        </div>
        <span
          style={{
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: d.color,
            background: hexToRgba(d.color, 0.12),
            border: `1px solid ${hexToRgba(d.color, 0.3)}`,
            borderRadius: 3,
            padding: "1px 5px",
          }}
        >
          {d.chip}
        </span>
      </div>

      {/* Body */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 8 }}>
        <div>
          <div
            style={{
              fontSize: 28,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: "#0F172A",
              lineHeight: 1.15,
            }}
          >
            {d.value}
          </div>
          <div
            style={{
              fontSize: 12,
              fontFamily: "Inter, sans-serif",
              color: "#64748B",
              marginTop: 2,
            }}
          >
            {d.sublabel}
          </div>
        </div>
        {/* Trend badge */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", flexShrink: 0 }}>
          <span
            style={{
              fontSize: 13,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: trendColor,
            }}
          >
            {trendPrefix} {d.num}
          </span>
          <span
            style={{
              fontSize: 10,
              fontFamily: "Inter, sans-serif",
              color: "#94A3B8",
              textAlign: "right",
            }}
          >
            {d.ref_}
          </span>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: hexToRgba(d.color, 0.22),
          margin: "0 -16px",
          width: "calc(100% + 32px)",
        }}
      />

      {/* Footer */}
      <div>
        <div
          style={{
            fontSize: 10,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: "#94A3B8",
            marginBottom: 2,
          }}
        >
          Definition
        </div>
        <div style={{ fontSize: 11, fontFamily: "Inter, sans-serif", color: "#475569" }}>
          {d.definition}
        </div>
      </div>
    </div>
  );
};

// ─── Status Pill ─────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ServiceStatus, string> = {
  waiting:       "#E19A04",
  "in-service":  "#00A63E",
  paying:        "#2B7FFF",
  seated:        "#2B7FFF",
  "awaiting-prep": "#EA580C",
  idle:          "#94A3B8",
  complete:      "#64748B",
};

const StatusPill: React.FC<{ status: ServiceStatus }> = ({ status }) => {
  const c = STATUS_COLORS[status];
  return (
    <span
      style={{
        fontSize: 9,
        fontFamily: "Inter, sans-serif",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.06em",
        color: "#fff",
        background: c,
        borderRadius: 4,
        padding: "2px 6px",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
};

// ─── Service Ledger ───────────────────────────────────────────────────────────

const ROWS_PER_PAGE = 8;

// Ledger row item — needs its own component so hooks are not called inside map()
const LedgerRowItem: React.FC<{
  row: LedgerRow;
  idx: number;
  page: number;
  themeColor: string;
  gridCols: string;
}> = ({ row, idx, page, themeColor, gridCols }) => {
  const [rowHover, setRowHover] = useState(false);
  const isAlert = row.waitMin > 10;
  return (
    <div
      onMouseEnter={() => setRowHover(true)}
      onMouseLeave={() => setRowHover(false)}
      style={{
        display: "grid",
        gridTemplateColumns: gridCols,
        gap: 0,
        alignItems: "center",
        minHeight: 42,
        padding: "0 16px",
        backgroundColor: isAlert
          ? "rgba(231,0,11,0.04)"
          : rowHover
          ? hexToRgba(themeColor, 0.04)
          : "transparent",
        borderLeft: isAlert
          ? "3px solid #E7000B"
          : rowHover
          ? `3px solid ${themeColor}`
          : "3px solid transparent",
        borderBottom: "1px solid #F1F5F9",
        transition: "background-color 0.12s, border-left 0.12s",
        cursor: "default",
      }}
    >
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: "#94A3B8" }}>
        {(page - 1) * ROWS_PER_PAGE + idx + 1}
      </span>
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 11,
          fontWeight: rowHover ? 700 : 400,
          color: "#0F172A",
        }}
      >
        {row.id}
      </span>
      <span style={{ fontSize: 12, color: "#334155" }}>{row.entityId}</span>
      <span style={{ fontSize: 12, color: "#475569" }}>{row.zone}</span>
      <StatusPill status={row.status} />
      <span
        style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 12,
          color: row.waitMin > 10 ? "#E7000B" : "#475569",
          display: "flex",
          alignItems: "center",
          gap: 3,
        }}
      >
        {row.waitMin === 0 ? "—" : `${row.waitMin}m`}
        {row.waitMin > 10 && <AlertTriangle size={10} color="#E7000B" />}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#475569" }}>
        {row.serviceMin === 0 ? "—" : `${row.serviceMin}m`}
      </span>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: "#475569" }}>
        {row.dwellMin}m
      </span>
      <span style={{ fontSize: 11, color: "#94A3B8" }}>{row.cameraId}</span>
    </div>
  );
};

const SORT_OPTIONS = [
  { key: "entryTime-desc", label: "Entry Time (Newest)" },
  { key: "entryTime-asc",  label: "Entry Time (Oldest)" },
  { key: "waitMin-desc",   label: "Wait (Highest)" },
  { key: "waitMin-asc",    label: "Wait (Lowest)" },
  { key: "dwellMin-desc",  label: "Dwell (Highest)" },
];

const ALL_STATUSES: ServiceStatus[] = [
  "waiting", "in-service", "paying", "seated", "awaiting-prep", "idle", "complete",
];

const ServiceLedger: React.FC<{
  rows: LedgerRow[];
  themeColor: string;
  useCaseLabel: string;
}> = ({ rows, themeColor, useCaseLabel }) => {
  const [searchQ,     setSearchQ]     = useState("");
  const [statusFilter, setStatusFilter] = useState<Set<ServiceStatus>>(new Set());
  const [sortKey,     setSortKey]     = useState("entryTime-desc");
  const [page,        setPage]        = useState(1);
  const [sortOpen,    setSortOpen]    = useState(false);
  const [filterOpen,  setFilterOpen]  = useState(false);

  const toggleStatus = useCallback((s: ServiceStatus) => {
    setStatusFilter((prev) => {
      const next = new Set(prev);
      if (next.has(s)) next.delete(s);
      else next.add(s);
      return next;
    });
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setStatusFilter(new Set());
    setSearchQ("");
    setPage(1);
  }, []);

  const filtered = useMemo(() => {
    let r = rows.slice();
    if (searchQ) {
      const q = searchQ.toLowerCase();
      r = r.filter(
        (row) =>
          row.id.toLowerCase().includes(q) ||
          row.entityId.toLowerCase().includes(q) ||
          row.zone.toLowerCase().includes(q) ||
          row.cameraId.toLowerCase().includes(q),
      );
    }
    if (statusFilter.size > 0) {
      r = r.filter((row) => statusFilter.has(row.status));
    }
    r.sort((a, b) => {
      if (sortKey === "entryTime-desc") return b.entryTime.localeCompare(a.entryTime);
      if (sortKey === "entryTime-asc")  return a.entryTime.localeCompare(b.entryTime);
      if (sortKey === "waitMin-desc")   return b.waitMin - a.waitMin;
      if (sortKey === "waitMin-asc")    return a.waitMin - b.waitMin;
      if (sortKey === "dwellMin-desc")  return b.dwellMin - a.dwellMin;
      return 0;
    });
    return r;
  }, [rows, searchQ, statusFilter, sortKey]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / ROWS_PER_PAGE));
  const pageRows   = filtered.slice((page - 1) * ROWS_PER_PAGE, page * ROWS_PER_PAGE);

  const gridCols = "32px 100px 100px 120px 80px 64px 64px 72px 108px";

  const hasFilters = statusFilter.size > 0 || searchQ.length > 0;

  return (
    <div style={{ fontFamily: "Inter, sans-serif" }}>
      {/* Toolbar */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          padding: "10px 16px",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        {/* Search */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: 4,
            padding: "5px 10px",
            width: 240,
          }}
        >
          <Search size={12} color="#94A3B8" />
          <input
            value={searchQ}
            onChange={(e) => { setSearchQ(e.target.value); setPage(1); }}
            placeholder="Search session, entity, zone…"
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              fontSize: 11,
              color: "#0F172A",
              width: "100%",
            }}
          />
          {searchQ && (
            <button onClick={() => { setSearchQ(""); setPage(1); }} style={{ lineHeight: 0 }}>
              <X size={10} color="#94A3B8" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setSortOpen(!sortOpen); setFilterOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: "1px solid #E2E8F0",
              borderRadius: 4,
              padding: "5px 10px",
              background: sortOpen ? "#F8FAFC" : "#fff",
              fontSize: 11,
              color: "#475569",
              cursor: "pointer",
            }}
          >
            <ChevronDown size={11} />
            Sort
          </button>
          {sortOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                left: 0,
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                zIndex: 50,
                minWidth: 200,
                overflow: "hidden",
              }}
            >
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  onClick={() => { setSortKey(opt.key); setSortOpen(false); }}
                  style={{
                    display: "block",
                    width: "100%",
                    textAlign: "left",
                    padding: "7px 12px",
                    fontSize: 11,
                    color: sortKey === opt.key ? themeColor : "#475569",
                    fontWeight: sortKey === opt.key ? 700 : 400,
                    background: sortKey === opt.key ? hexToRgba(themeColor, 0.06) : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {/* Status filter */}
        <div style={{ position: "relative" }}>
          <button
            onClick={() => { setFilterOpen(!filterOpen); setSortOpen(false); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 5,
              border: `1px solid ${statusFilter.size > 0 ? themeColor : "#E2E8F0"}`,
              borderRadius: 4,
              padding: "5px 10px",
              background: statusFilter.size > 0 ? hexToRgba(themeColor, 0.06) : "#fff",
              fontSize: 11,
              color: statusFilter.size > 0 ? themeColor : "#475569",
              fontWeight: statusFilter.size > 0 ? 700 : 400,
              cursor: "pointer",
            }}
          >
            Status {statusFilter.size > 0 ? `· ${statusFilter.size}` : ""}
            <ChevronDown size={11} />
          </button>
          {filterOpen && (
            <div
              style={{
                position: "absolute",
                top: "calc(100% + 4px)",
                right: 0,
                background: "#fff",
                border: "1px solid #E2E8F0",
                borderRadius: 4,
                boxShadow: "0 4px 16px rgba(0,0,0,0.10)",
                zIndex: 50,
                minWidth: 180,
                padding: "8px 0",
                overflow: "hidden",
              }}
            >
              {ALL_STATUSES.map((s) => (
                <button
                  key={s}
                  onClick={() => toggleStatus(s)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    width: "100%",
                    textAlign: "left",
                    padding: "6px 12px",
                    fontSize: 11,
                    color: "#475569",
                    background: statusFilter.has(s) ? hexToRgba(STATUS_COLORS[s], 0.08) : "transparent",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <span
                    style={{
                      width: 8,
                      height: 8,
                      borderRadius: 2,
                      background: STATUS_COLORS[s],
                      flexShrink: 0,
                    }}
                  />
                  <span style={{ textTransform: "capitalize" }}>{s}</span>
                  {statusFilter.has(s) && (
                    <span style={{ marginLeft: "auto", color: themeColor, fontSize: 10 }}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            style={{
              fontSize: 11,
              color: "#94A3B8",
              border: "none",
              background: "transparent",
              cursor: "pointer",
              textDecoration: "underline",
            }}
          >
            Clear
          </button>
        )}

        <span
          style={{
            fontSize: 11,
            color: "#94A3B8",
            marginLeft: 4,
          }}
        >
          {filtered.length} sessions · {useCaseLabel}
        </span>
      </div>

      {/* Table header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: gridCols,
          gap: 0,
          alignItems: "center",
          height: 44,
          padding: "0 16px",
          backgroundColor: "rgba(241,245,249,0.5)",
          backdropFilter: "blur(4px)",
          borderBottom: "1px solid #E2E8F0",
        }}
      >
        {["#", "Session", "Entity", "Zone", "Status", "Wait", "Service", "Dwell", "Camera"].map((h) => (
          <span
            key={h}
            style={{
              fontSize: 10,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#94A3B8",
            }}
          >
            {h}
          </span>
        ))}
      </div>

      {/* Rows */}
      {pageRows.map((row, idx) => (
        <LedgerRowItem
          key={row.id}
          row={row}
          idx={idx}
          page={page}
          themeColor={themeColor}
          gridCols={gridCols}
        />
      ))}

      {/* Pagination */}
      {totalPages > 1 && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 4,
            padding: "12px 16px",
            borderTop: "1px solid #F1F5F9",
          }}
        >
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "4px 10px",
              fontSize: 11,
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              background: page === 1 ? "#F8FAFC" : "#fff",
              color: page === 1 ? "#CBD5E1" : themeColor,
              cursor: page === 1 ? "not-allowed" : "pointer",
            }}
          >
            <ChevronLeft size={12} /> Prev
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              style={{
                width: 28,
                height: 28,
                borderRadius: 4,
                border: `1px solid ${p === page ? themeColor : "#E2E8F0"}`,
                background: p === page ? themeColor : "#fff",
                color: p === page ? "#fff" : "#475569",
                fontSize: 11,
                fontWeight: p === page ? 700 : 400,
                cursor: "pointer",
              }}
            >
              {p}
            </button>
          ))}
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 3,
              padding: "4px 10px",
              fontSize: 11,
              borderRadius: 4,
              border: "1px solid #E2E8F0",
              background: page === totalPages ? "#F8FAFC" : "#fff",
              color: page === totalPages ? "#CBD5E1" : themeColor,
              cursor: page === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next <ChevronRight size={12} />
          </button>
        </div>
      )}
    </div>
  );
};

// ─── Alert Card ───────────────────────────────────────────────────────────────

interface AlertCardDef {
  title: string;
  subtitle: string;
  body: string;
  suggestion: string;
  color: string;
  bgColor: string;
  icon: React.ElementType;
  chip: string;
}

const AlertCard: React.FC<{ def: AlertCardDef }> = ({ def }) => {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;
  const IconEl = def.icon;
  return (
    <div
      style={{
        flex: 1,
        border: `1px solid ${def.color}`,
        background: def.bgColor,
        borderRadius: 4,
        padding: "14px 16px",
        display: "flex",
        flexDirection: "column",
        gap: 8,
        position: "relative",
        minWidth: 0,
      }}
    >
      {/* Dismiss */}
      <button
        onClick={() => setDismissed(true)}
        style={{
          position: "absolute",
          top: 10,
          right: 10,
          background: "transparent",
          border: "none",
          cursor: "pointer",
          color: "#94A3B8",
          lineHeight: 0,
        }}
      >
        <X size={12} />
      </button>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
        <IconEl size={13} color={def.color} />
        <span
          style={{
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#475569",
          }}
        >
          {def.title}
        </span>
        <span
          style={{
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            color: def.color,
            background: hexToRgba(def.color, 0.12),
            border: `1px solid ${hexToRgba(def.color, 0.3)}`,
            borderRadius: 3,
            padding: "1px 5px",
            marginLeft: 2,
          }}
        >
          {def.chip}
        </span>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize: 13,
          fontFamily: "'JetBrains Mono', monospace",
          fontWeight: 700,
          color: "#0F172A",
        }}
      >
        {def.subtitle}
      </div>

      {/* Body */}
      <div style={{ fontSize: 12, fontFamily: "Inter, sans-serif", color: "#475569" }}>
        {def.body}
      </div>

      {/* Divider */}
      <div
        style={{
          height: 1,
          background: hexToRgba(def.color, 0.2),
          margin: "0 -16px",
          width: "calc(100% + 32px)",
        }}
      />

      {/* Suggestion */}
      <div style={{ display: "flex", gap: 6, alignItems: "flex-start" }}>
        <span
          style={{
            fontSize: 9,
            fontFamily: "Inter, sans-serif",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "0.06em",
            color: "#94A3B8",
            marginTop: 1,
            flexShrink: 0,
          }}
        >
          Suggest
        </span>
        <span style={{ fontSize: 11, fontFamily: "Inter, sans-serif", color: "#475569" }}>
          {def.suggestion}
        </span>
      </div>
    </div>
  );
};

// ─── Use-case icon map ────────────────────────────────────────────────────────

const UC_ICONS: Record<UseCase, React.ElementType> = {
  "Petrol Bunk": Fuel,
  "Café":        Coffee,
  "Drive-Thru":  ShoppingBag,
};

// ─── Main Export ──────────────────────────────────────────────────────────────

const ALERT_CARDS: AlertCardDef[] = [
  {
    title:      "Bottleneck Detection",
    subtitle:   "Waiting Zone",
    body:       "Queue capacity at 87% · 3 vehicles exceed 10m threshold",
    suggestion: "Consider opening auxiliary pump bays to redistribute incoming traffic.",
    color:      "#EA580C",
    bgColor:    "#FFF4EE",
    icon:       AlertTriangle,
    chip:       "ALERT",
  },
  {
    title:      "Idle Resource Alert",
    subtitle:   "Pump Bay 4 & 6",
    body:       "Idle for 8 minutes while active queue has 5+ vehicles waiting",
    suggestion: "Redirect incoming vehicles to available bays to reduce queue pressure.",
    color:      "#E19A04",
    bgColor:    "#FFFBEB",
    icon:       Zap,
    chip:       "WARNING",
  },
];

export const ServiceAnalytics: React.FC = () => {
  const [useCase, setUseCase] = useState<UseCase>("Petrol Bunk");

  const themeColor = THEME[useCase].color;
  const metrics    = METRICS[useCase];
  const areaData   = AREA_DATA[useCase];
  const heatmap    = HEATMAP_DATA[useCase];
  const sankey     = SANKEY_DATA[useCase];
  const ledger     = LEDGER_DATA[useCase];

  return (
    <div
      className={cn("p-6 max-w-[1400px] mx-auto space-y-8")}
      style={{ fontFamily: "Inter, sans-serif" }}
    >
      {/* 1. Header Banner ───────────────────────────────────────────────────── */}
      <div
        style={{
          background:
            "linear-gradient(135deg, #021D18 0%, #032E24 50%, #043D2E 100%)",
          borderRadius: 8,
          padding: "28px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Dot pattern overlay */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            pointerEvents: "none",
          }}
        />

        {/* Left content */}
        <div style={{ position: "relative", zIndex: 1 }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              background: "rgba(0,119,91,0.20)",
              border: "1px solid rgba(0,119,91,0.40)",
              borderRadius: 4,
              padding: "3px 10px",
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontSize: 9,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.10em",
                color: "#34D399",
              }}
            >
              v1.0 · Service Analytics
            </span>
          </div>
          <h1
            style={{
              fontSize: 22,
              fontFamily: "'JetBrains Mono', monospace",
              fontWeight: 700,
              color: "#fff",
              margin: 0,
              letterSpacing: "-0.02em",
            }}
          >
            Service Analytics
          </h1>
          <p
            style={{
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              color: "rgba(255,255,255,0.55)",
              margin: "6px 0 0",
              maxWidth: 480,
              lineHeight: 1.5,
            }}
          >
            Measure the velocity of service and optimize zone throughput across
            all operations.
          </p>
        </div>

        {/* Right: use-case chips */}
        <div
          style={{
            display: "flex",
            gap: 8,
            flexShrink: 0,
            position: "relative",
            zIndex: 1,
          }}
        >
          {(["Petrol Bunk", "Café", "Drive-Thru"] as UseCase[]).map((uc) => {
            const active = uc === useCase;
            const color  = THEME[uc].color;
            const Icon   = UC_ICONS[uc];
            return (
              <button
                key={uc}
                onClick={() => setUseCase(uc)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "8px 14px",
                  borderRadius: 6,
                  border: `1px solid ${active ? color : "rgba(255,255,255,0.12)"}`,
                  background: active
                    ? hexToRgba(color, 0.18)
                    : "rgba(255,255,255,0.05)",
                  color: active ? "#fff" : "rgba(255,255,255,0.50)",
                  fontSize: 12,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: active ? 700 : 400,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
              >
                <Icon size={13} />
                {uc}
              </button>
            );
          })}
        </div>
      </div>

      {/* 2. Use-case tab row ────────────────────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            gap: 0,
            borderBottom: "1px solid #E2E8F0",
          }}
        >
          {(["Petrol Bunk", "Café", "Drive-Thru"] as UseCase[]).map((uc) => {
            const active = uc === useCase;
            const color  = THEME[uc].color;
            const Icon   = UC_ICONS[uc];
            return (
              <button
                key={uc}
                onClick={() => setUseCase(uc)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "10px 20px",
                  borderBottom: `2px solid ${active ? color : "transparent"}`,
                  marginBottom: -1,
                  background: "transparent",
                  color: active ? color : "#64748B",
                  fontSize: 13,
                  fontFamily: "Inter, sans-serif",
                  fontWeight: active ? 700 : 400,
                  cursor: "pointer",
                  transition: "color 0.15s",
                  border: "none",
                  borderBottomWidth: 2,
                  borderBottomStyle: "solid",
                  borderBottomColor: active ? color : "transparent",
                }}
              >
                <Icon size={13} />
                {uc}
              </button>
            );
          })}
        </div>
        <div
          style={{
            fontSize: 11,
            fontFamily: "Inter, sans-serif",
            color: "#94A3B8",
            marginTop: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: themeColor,
              display: "inline-block",
            }}
          />
          {THEME[useCase].context}
        </div>
      </div>

      {/* 3. KPI Cards ───────────────────────────────────────────────────────── */}
      <div
        style={{
          display: "grid",
          gap: 16,
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
        }}
      >
        {metrics.map((m) => (
          <ServiceStatCard key={m.id} d={m} />
        ))}
      </div>

      {/* 4. Charts row ──────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {/* Left: stacked area */}
        <div
          style={{
            flex: "3 1 0",
            minWidth: 0,
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
              flexWrap: "wrap",
              gap: 8,
            }}
          >
            <span
              style={{
                fontSize: 11,
                fontFamily: "Inter, sans-serif",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#475569",
              }}
            >
              Wait vs Service Time · 24h
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                fontSize: 10,
                fontFamily: "Inter, sans-serif",
                color: "#94A3B8",
              }}
            >
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 20,
                    height: 3,
                    background: themeColor,
                    display: "inline-block",
                    borderRadius: 2,
                  }}
                />
                Service
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 20,
                    height: 3,
                    background: "#E19A04",
                    display: "inline-block",
                    borderRadius: 2,
                  }}
                />
                Wait
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <span
                  style={{
                    width: 14,
                    height: 2,
                    background: "#E7000B",
                    display: "inline-block",
                    opacity: 0.6,
                  }}
                />
                10m Threshold
              </span>
            </div>
          </div>
          <StackedAreaChart data={areaData} themeColor={themeColor} />
        </div>

        {/* Right: heatmap */}
        <div
          style={{
            flex: "2 1 0",
            minWidth: 0,
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            padding: 20,
          }}
        >
          <div
            style={{
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#475569",
              marginBottom: 16,
            }}
          >
            Service Density · Hourly
          </div>
          <HeatmapGrid data={heatmap} themeColor={themeColor} />
        </div>
      </div>

      {/* 5. Sankey ──────────────────────────────────────────────────────────── */}
      <div
        style={{
          background: "#fff",
          border: "1px solid #E2E8F0",
          borderRadius: 8,
          padding: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 20,
            flexWrap: "wrap",
            gap: 8,
          }}
        >
          <span
            style={{
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#475569",
            }}
          >
            Customer Journey Flow
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: "Inter, sans-serif",
              color: "#94A3B8",
            }}
          >
            {sankey.nodes[0].value.toLocaleString()} entries →{" "}
            {sankey.nodes[sankey.nodes.length - 1].value.toLocaleString()} exits today
          </span>
        </div>
        <SankeyFlowChart flow={sankey} />
      </div>

      {/* 6. Service Ledger ──────────────────────────────────────────────────── */}
      <div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: 10,
          }}
        >
          <span
            style={{
              fontSize: 13,
              fontFamily: "Inter, sans-serif",
              fontWeight: 700,
              color: "#0F172A",
              letterSpacing: "-0.01em",
            }}
          >
            Service Ledger · Active Sessions
          </span>
          <span
            style={{
              fontSize: 11,
              fontFamily: "'JetBrains Mono', monospace",
              color: themeColor,
              fontWeight: 700,
            }}
          >
            {ledger.filter((r) => r.status !== "complete").length} active
          </span>
        </div>
        <div
          style={{
            background: "#fff",
            border: "1px solid #E2E8F0",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <ServiceLedger
            rows={ledger}
            themeColor={themeColor}
            useCaseLabel={THEME[useCase].label}
          />
        </div>
      </div>

      {/* 7. Alert Cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
        {ALERT_CARDS.map((def) => (
          <AlertCard key={def.title} def={def} />
        ))}
      </div>
    </div>
  );
};

export default ServiceAnalytics;
