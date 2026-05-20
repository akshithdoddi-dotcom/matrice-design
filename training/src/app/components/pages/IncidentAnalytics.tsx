import { useState } from "react";
import { Persona } from "../dashboard/PersonaSwitcher";
import { AlertTriangle, Clock, Timer, TrendingDown, CheckCircle2, Video, ChevronDown, ChevronRight, Flame, Hand, Shield, AlertCircle, Play, Search, X, ChevronLeft } from "lucide-react";
import { cn } from "@/app/lib/utils";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip, PieChart, Pie, Cell } from "recharts";
import { StatusBar } from "@fe-common/components/ui/StatusBar";
import { FilterDropdown } from "@fe-common/components/ui/FilterDropdown";

const INCIDENT_TIME_RANGES: Record<Persona, string[]> = {
  monitoring: ["1H", "6H", "12H", "24H"],
  manager:    ["Today", "This Week"],
  director:   ["This Month", "This Quarter"],
};

// Mock data for incident analytics
const PERFORMANCE_METRICS = {
  totalIncidents: 142,
  totalIncidentsChange: -8, // percentage
  mtta: 15.2, // seconds
  mttaTarget: 20, // seconds (target)
  mttaChange: -3, // seconds (negative = faster)
  mttr: 6.75, // minutes
  mttrSLA: 8.0, // minutes (target)
  falsePositiveRate: 4.2, // percentage
  falsePositiveTarget: 5.0 // percentage
};

const PEAK_HOUR_DATA = [
  { hour: "00:00", count: 2 },
  { hour: "02:00", count: 1 },
  { hour: "04:00", count: 3 },
  { hour: "06:00", count: 8 },
  { hour: "08:00", count: 24 },
  { hour: "10:00", count: 18 },
  { hour: "12:00", count: 15 },
  { hour: "14:00", count: 12 },
  { hour: "16:00", count: 20 },
  { hour: "18:00", count: 22 },
  { hour: "20:00", count: 11 },
  { hour: "22:00", count: 6 },
];

const SEVERITY_DONUT_DATA = [
  { name: "Critical", value: 12, color: "#E7000B", severity: "critical" },
  { name: "High", value: 28, color: "#EA580C", severity: "high" },
  { name: "Medium", value: 45, color: "#E19A04", severity: "medium" },
  { name: "Low", value: 57, color: "#2B7FFF", severity: "low" },
];

const TOP_ZONES_DATA = [
  { zone: "Warehouse A", count: 34 },
  { zone: "Main Entrance", count: 28 },
  { zone: "Parking Lot B", count: 22 },
  { zone: "Assembly Line 3", count: 19 },
  { zone: "North Fence", count: 15 },
  { zone: "Loading Bay 1", count: 13 },
  { zone: "Server Room", count: 11 },
  { zone: "Cafeteria", count: 9 },
  { zone: "South Gate", count: 8 },
  { zone: "Lobby Area", count: 7 },
  { zone: "R&D Lab 2", count: 6 },
  { zone: "Storage Unit 4", count: 5 },
];

const SEVERITY_DISTRIBUTION = [
  { name: "Critical", value: 12, color: "#E7000B" },
  { name: "High", value: 28, color: "#EA580C" },
  { name: "Medium", value: 45, color: "#E19A04" },
  { name: "Low", value: 57, color: "#2B7FFF" },
];

const STAFF_LEADERBOARD = [
  { name: "Sarah Chen", avgResponseTime: 12.3, incidents: 45, onTimeRate: 98 },
  { name: "Mike Rodriguez", avgResponseTime: 14.8, incidents: 38, onTimeRate: 95 },
  { name: "Admin User", avgResponseTime: 15.2, incidents: 32, onTimeRate: 94 },
  { name: "Emma Thompson", avgResponseTime: 18.5, incidents: 27, onTimeRate: 89 },
];

const SYSTEM_THROUGHPUT = {
  totalEvents: 2847,
  flaggedIncidents: 142,
  throughputRate: 5.0, // percentage
  aiAccuracy: 95.8, // percentage
  processingTime: 0.3, // seconds average
};

const COMPLIANCE_METRICS = {
  auditScore: 92.5, // percentage
  protocolCompliance: 89, // percentage
  documentationComplete: 94, // percentage
  slaCompliance: 87, // percentage
};

interface IncidentTimeline {
  incidentId: string;
  title: string;
  zone: string;
  application: string;
  severity: "critical" | "high" | "medium" | "low";
  startTime: string;
  startHour: string;
  acknowledgeTime: string | null;
  actionTime: string | null;
  endTime: string | null;
  resolveTime: string | null;
  acknowledgeGapSeconds: number | null;
  resolveGapSeconds: number | null;
  totalDurationSeconds: number;
  acknowledgedBy: string | null;
  validationStatus: "confirmed" | "false-positive" | "under-review" | null;
  staffNote: string | null;
  hasVideoClip: boolean;
  protocolStepsCompleted: number;
  protocolStepsTotal: number;
  assignedTo: string | null;
  deviceName: string;
  duration: string;
}

const INCIDENT_TIMELINES: IncidentTimeline[] = [
  {
    incidentId: "INC-3051",
    title: "Fire Detection",
    zone: "Warehouse A",
    application: "Fire Safety",
    severity: "critical",
    startTime: "14:23:00",
    startHour: "14:00",
    acknowledgeTime: "14:23:15",
    actionTime: "14:23:45",
    endTime: "14:28:00",
    resolveTime: "14:29:00",
    acknowledgeGapSeconds: 15,
    resolveGapSeconds: 345,
    totalDurationSeconds: 360,
    acknowledgedBy: "Admin User",
    validationStatus: "confirmed",
    staffNote: "Fire suppression system activated. Area evacuated successfully.",
    hasVideoClip: true,
    protocolStepsCompleted: 5,
    protocolStepsTotal: 5,
    assignedTo: "Sarah Chen",
    deviceName: "CAM-WH-A-01",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3052",
    title: "Tailgating Detection",
    zone: "Main Entrance",
    application: "Access Control",
    severity: "high",
    startTime: "09:15:22",
    startHour: "08:00",
    acknowledgeTime: "09:15:28",
    actionTime: "09:15:50",
    endTime: "09:16:10",
    resolveTime: "09:16:45",
    acknowledgeGapSeconds: 6,
    resolveGapSeconds: 83,
    totalDurationSeconds: 83,
    acknowledgedBy: "Security Team A",
    validationStatus: "confirmed",
    staffNote: "Second individual denied by security guard. Badge verification completed.",
    hasVideoClip: true,
    protocolStepsCompleted: 4,
    protocolStepsTotal: 4,
    assignedTo: "Michael Torres",
    deviceName: "CAM-ENT-MAIN-01",
    duration: "1m 23s",
  },
  {
    incidentId: "INC-3053",
    title: "PPE Violation",
    zone: "Assembly Line 3",
    application: "Safety Compliance",
    severity: "medium",
    startTime: "11:42:15",
    startHour: "10:00",
    acknowledgeTime: "11:43:30",
    actionTime: "11:44:00",
    endTime: "11:45:00",
    resolveTime: "11:45:15",
    acknowledgeGapSeconds: 75,
    resolveGapSeconds: 180,
    totalDurationSeconds: 180,
    acknowledgedBy: "Safety Officer",
    validationStatus: "confirmed",
    staffNote: "Worker reminded of helmet requirement. Complied immediately.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "David Kim",
    deviceName: "CAM-ASM-L3-02",
    duration: "3m 0s",
  },
  {
    incidentId: "INC-3054",
    title: "Smoke Detection",
    zone: "Parking Lot B",
    application: "Fire Safety",
    severity: "high",
    startTime: "16:08:00",
    startHour: "16:00",
    acknowledgeTime: "16:08:22",
    actionTime: "16:09:00",
    endTime: "16:09:30",
    resolveTime: "16:10:00",
    acknowledgeGapSeconds: 22,
    resolveGapSeconds: 120,
    totalDurationSeconds: 120,
    acknowledgedBy: "Monitoring Staff",
    validationStatus: "false-positive",
    staffNote: "False alarm. Steam from nearby HVAC vent misidentified as smoke.",
    hasVideoClip: true,
    protocolStepsCompleted: 2,
    protocolStepsTotal: 4,
    assignedTo: "Emma Rodriguez",
    deviceName: "CAM-PK-B-03",
    duration: "2m 0s",
  },
  {
    incidentId: "INC-3055",
    title: "Unauthorized Access",
    zone: "Server Room",
    application: "Intrusion Detection",
    severity: "critical",
    startTime: "03:12:45",
    startHour: "02:00",
    acknowledgeTime: null,
    actionTime: null,
    endTime: "03:15:00",
    resolveTime: null,
    acknowledgeGapSeconds: null,
    resolveGapSeconds: null,
    totalDurationSeconds: 135,
    acknowledgedBy: null,
    validationStatus: "under-review",
    staffNote: null,
    hasVideoClip: true,
    protocolStepsCompleted: 0,
    protocolStepsTotal: 6,
    assignedTo: null,
    deviceName: "CAM-SRV-RM-01",
    duration: "2m 15s",
  },
  {
    incidentId: "INC-3056",
    title: "Slip & Fall Risk",
    zone: "Cafeteria",
    application: "Safety Compliance",
    severity: "medium",
    startTime: "12:30:00",
    startHour: "12:00",
    acknowledgeTime: "12:31:15",
    actionTime: "12:32:00",
    endTime: "12:35:00",
    resolveTime: "12:36:00",
    acknowledgeGapSeconds: 75,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Facilities Team",
    validationStatus: "confirmed",
    staffNote: "Spill cleaned up. Wet floor sign placed.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "James Wilson",
    deviceName: "CAM-CAF-01",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3057",
    title: "Equipment Malfunction",
    zone: "Warehouse A",
    application: "Equipment Safety",
    severity: "high",
    startTime: "08:45:30",
    startHour: "08:00",
    acknowledgeTime: "08:45:38",
    actionTime: "08:46:15",
    endTime: "08:50:00",
    resolveTime: "08:51:00",
    acknowledgeGapSeconds: 8,
    resolveGapSeconds: 330,
    totalDurationSeconds: 330,
    acknowledgedBy: "Maintenance Lead",
    validationStatus: "confirmed",
    staffNote: "Forklift sensor triggered. Machine shut down for inspection.",
    hasVideoClip: true,
    protocolStepsCompleted: 5,
    protocolStepsTotal: 5,
    assignedTo: "Maria Garcia",
    deviceName: "CAM-WH-A-03",
    duration: "5m 30s",
  },
  {
    incidentId: "INC-3058",
    title: "Perimeter Breach",
    zone: "North Fence",
    application: "Intrusion Detection",
    severity: "critical",
    startTime: "22:15:00",
    startHour: "22:00",
    acknowledgeTime: "22:15:12",
    actionTime: "22:15:45",
    endTime: "22:18:30",
    resolveTime: "22:19:00",
    acknowledgeGapSeconds: 12,
    resolveGapSeconds: 240,
    totalDurationSeconds: 240,
    acknowledgedBy: "Night Security",
    validationStatus: "confirmed",
    staffNote: "Wildlife (deer) triggered motion sensor. Perimeter secured.",
    hasVideoClip: true,
    protocolStepsCompleted: 6,
    protocolStepsTotal: 6,
    assignedTo: "Robert Johnson",
    deviceName: "CAM-FEN-N-04",
    duration: "4m 0s",
  },
  {
    incidentId: "INC-3059",
    title: "Crowd Formation",
    zone: "Main Entrance",
    application: "Crowd Detection",
    severity: "medium",
    startTime: "17:30:22",
    startHour: "16:00",
    acknowledgeTime: "17:31:45",
    actionTime: "17:32:15",
    endTime: "17:35:00",
    resolveTime: "17:35:30",
    acknowledgeGapSeconds: 83,
    resolveGapSeconds: 308,
    totalDurationSeconds: 308,
    acknowledgedBy: "Security Manager",
    validationStatus: "confirmed",
    staffNote: "Shift change caused temporary crowding. Dispersed naturally.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "Lisa Park",
    deviceName: "CAM-ENT-MAIN-02",
    duration: "5m 8s",
  },
  {
    incidentId: "INC-3060",
    title: "Vehicle Speeding",
    zone: "Parking Lot B",
    application: "Traffic Safety",
    severity: "low",
    startTime: "10:22:15",
    startHour: "10:00",
    acknowledgeTime: "10:23:00",
    actionTime: "10:25:00",
    endTime: "10:26:00",
    resolveTime: "10:27:00",
    acknowledgeGapSeconds: 45,
    resolveGapSeconds: 285,
    totalDurationSeconds: 285,
    acknowledgedBy: "Parking Monitor",
    validationStatus: "confirmed",
    staffNote: "Driver identified and warned about speed limit.",
    hasVideoClip: true,
    protocolStepsCompleted: 4,
    protocolStepsTotal: 4,
    assignedTo: "Tom Harris",
    deviceName: "CAM-PK-B-05",
    duration: "4m 45s",
  },
  {
    incidentId: "INC-3061",
    title: "Restricted Area Entry",
    zone: "Server Room",
    application: "Access Control",
    severity: "high",
    startTime: "15:10:30",
    startHour: "14:00",
    acknowledgeTime: "15:10:42",
    actionTime: "15:11:15",
    endTime: "15:13:00",
    resolveTime: "15:14:00",
    acknowledgeGapSeconds: 12,
    resolveGapSeconds: 210,
    totalDurationSeconds: 210,
    acknowledgedBy: "IT Security",
    validationStatus: "confirmed",
    staffNote: "Unauthorized badge swipe. Employee escorted out.",
    hasVideoClip: true,
    protocolStepsCompleted: 5,
    protocolStepsTotal: 5,
    assignedTo: "Alex Chen",
    deviceName: "CAM-SRV-RM-02",
    duration: "3m 30s",
  },
  {
    incidentId: "INC-3062",
    title: "Fire Alarm Test",
    zone: "Assembly Line 3",
    application: "Fire Safety",
    severity: "low",
    startTime: "09:00:00",
    startHour: "08:00",
    acknowledgeTime: "09:00:05",
    actionTime: "09:00:30",
    endTime: "09:05:00",
    resolveTime: "09:05:30",
    acknowledgeGapSeconds: 5,
    resolveGapSeconds: 330,
    totalDurationSeconds: 330,
    acknowledgedBy: "Fire Safety Team",
    validationStatus: "confirmed",
    staffNote: "Scheduled weekly alarm test. All systems functional.",
    hasVideoClip: false,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "Fire Warden",
    deviceName: "CAM-ASM-L3-01",
    duration: "5m 30s",
  },
  {
    incidentId: "INC-3063",
    title: "Loitering Detected",
    zone: "North Fence",
    application: "Intrusion Detection",
    severity: "medium",
    startTime: "20:45:15",
    startHour: "20:00",
    acknowledgeTime: "20:46:30",
    actionTime: "20:47:00",
    endTime: "20:50:00",
    resolveTime: "20:51:00",
    acknowledgeGapSeconds: 75,
    resolveGapSeconds: 345,
    totalDurationSeconds: 345,
    acknowledgedBy: "Night Patrol",
    validationStatus: "confirmed",
    staffNote: "Individuals moved along. No breach attempted.",
    hasVideoClip: true,
    protocolStepsCompleted: 4,
    protocolStepsTotal: 4,
    assignedTo: "Security B",
    deviceName: "CAM-FEN-N-02",
    duration: "5m 45s",
  },
  {
    incidentId: "INC-3064",
    title: "Equipment Left Unattended",
    zone: "Warehouse A",
    application: "Safety Compliance",
    severity: "medium",
    startTime: "13:20:00",
    startHour: "12:00",
    acknowledgeTime: "13:21:10",
    actionTime: "13:22:00",
    endTime: "13:25:00",
    resolveTime: "13:26:00",
    acknowledgeGapSeconds: 70,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Floor Supervisor",
    validationStatus: "confirmed",
    staffNote: "Forklift left running. Operator located and reminded of protocols.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "Warehouse Manager",
    deviceName: "CAM-WH-A-05",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3065",
    title: "Emergency Exit Blocked",
    zone: "Assembly Line 3",
    application: "Fire Safety",
    severity: "high",
    startTime: "14:15:30",
    startHour: "14:00",
    acknowledgeTime: "14:15:45",
    actionTime: "14:16:30",
    endTime: "14:20:00",
    resolveTime: "14:21:00",
    acknowledgeGapSeconds: 15,
    resolveGapSeconds: 330,
    totalDurationSeconds: 330,
    acknowledgedBy: "Safety Officer",
    validationStatus: "confirmed",
    staffNote: "Pallets blocking emergency door. Immediate clearance ordered.",
    hasVideoClip: true,
    protocolStepsCompleted: 5,
    protocolStepsTotal: 5,
    assignedTo: "Safety Lead",
    deviceName: "CAM-ASM-L3-04",
    duration: "5m 30s",
  },
  {
    incidentId: "INC-3066",
    title: "Smoke in Break Room",
    zone: "Cafeteria",
    application: "Fire Safety",
    severity: "critical",
    startTime: "11:05:00",
    startHour: "10:00",
    acknowledgeTime: "11:05:08",
    actionTime: "11:05:30",
    endTime: "11:10:00",
    resolveTime: "11:11:00",
    acknowledgeGapSeconds: 8,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Building Manager",
    validationStatus: "confirmed",
    staffNote: "Microwave fire. Extinguished immediately. Area ventilated.",
    hasVideoClip: true,
    protocolStepsCompleted: 6,
    protocolStepsTotal: 6,
    assignedTo: "Emergency Team",
    deviceName: "CAM-CAF-02",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3067",
    title: "Unauthorized Vehicle",
    zone: "Parking Lot B",
    application: "Access Control",
    severity: "medium",
    startTime: "07:30:15",
    startHour: "06:00",
    acknowledgeTime: "07:31:45",
    actionTime: "07:33:00",
    endTime: "07:40:00",
    resolveTime: "07:42:00",
    acknowledgeGapSeconds: 90,
    resolveGapSeconds: 705,
    totalDurationSeconds: 705,
    acknowledgedBy: "Parking Security",
    validationStatus: "confirmed",
    staffNote: "Vehicle without valid permit. Owner contacted and vehicle removed.",
    hasVideoClip: true,
    protocolStepsCompleted: 4,
    protocolStepsTotal: 4,
    assignedTo: "Parking Manager",
    deviceName: "CAM-PK-B-01",
    duration: "11m 45s",
  },
  {
    incidentId: "INC-3068",
    title: "Chemical Spill Alert",
    zone: "Assembly Line 3",
    application: "Safety Compliance",
    severity: "critical",
    startTime: "16:42:00",
    startHour: "16:00",
    acknowledgeTime: "16:42:10",
    actionTime: "16:42:45",
    endTime: "16:50:00",
    resolveTime: "16:52:00",
    acknowledgeGapSeconds: 10,
    resolveGapSeconds: 600,
    totalDurationSeconds: 600,
    acknowledgedBy: "Hazmat Team",
    validationStatus: "confirmed",
    staffNote: "Small coolant leak. Contained and cleaned per safety protocols.",
    hasVideoClip: true,
    protocolStepsCompleted: 6,
    protocolStepsTotal: 6,
    assignedTo: "Safety Officer",
    deviceName: "CAM-ASM-L3-03",
    duration: "10m 0s",
  },
  {
    incidentId: "INC-3069",
    title: "Fence Damage Detected",
    zone: "North Fence",
    application: "Intrusion Detection",
    severity: "high",
    startTime: "06:15:30",
    startHour: "06:00",
    acknowledgeTime: "06:16:00",
    actionTime: "06:18:00",
    endTime: "06:25:00",
    resolveTime: "06:27:00",
    acknowledgeGapSeconds: 30,
    resolveGapSeconds: 690,
    totalDurationSeconds: 690,
    acknowledgedBy: "Maintenance",
    validationStatus: "confirmed",
    staffNote: "Wind damage to section 7. Temporary repair completed, work order issued.",
    hasVideoClip: true,
    protocolStepsCompleted: 4,
    protocolStepsTotal: 5,
    assignedTo: "Facilities Team",
    deviceName: "CAM-FEN-N-01",
    duration: "11m 30s",
  },
  {
    incidentId: "INC-3070",
    title: "Worker Without Badge",
    zone: "Main Entrance",
    application: "Access Control",
    severity: "medium",
    startTime: "08:10:00",
    startHour: "08:00",
    acknowledgeTime: "08:10:22",
    actionTime: "08:11:00",
    endTime: "08:15:00",
    resolveTime: "08:16:00",
    acknowledgeGapSeconds: 22,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Reception",
    validationStatus: "confirmed",
    staffNote: "Employee forgot badge at home. Temporary pass issued.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "Security A",
    deviceName: "CAM-ENT-MAIN-03",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3071",
    title: "Electrical Panel Alert",
    zone: "Server Room",
    application: "Equipment Safety",
    severity: "critical",
    startTime: "19:30:00",
    startHour: "18:00",
    acknowledgeTime: "19:30:18",
    actionTime: "19:31:00",
    endTime: "19:40:00",
    resolveTime: "19:42:00",
    acknowledgeGapSeconds: 18,
    resolveGapSeconds: 720,
    totalDurationSeconds: 720,
    acknowledgedBy: "Facilities Manager",
    validationStatus: "confirmed",
    staffNote: "Overheating detected. Circuit breaker tripped. Cooling restored.",
    hasVideoClip: true,
    protocolStepsCompleted: 5,
    protocolStepsTotal: 5,
    assignedTo: "Electrical Team",
    deviceName: "CAM-SRV-RM-03",
    duration: "12m 0s",
  },
  {
    incidentId: "INC-3072",
    title: "Wet Floor Hazard",
    zone: "Cafeteria",
    application: "Safety Compliance",
    severity: "low",
    startTime: "12:45:00",
    startHour: "12:00",
    acknowledgeTime: "12:45:30",
    actionTime: "12:46:00",
    endTime: "12:50:00",
    resolveTime: "12:51:00",
    acknowledgeGapSeconds: 30,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Janitorial Staff",
    validationStatus: "confirmed",
    staffNote: "Water leak from dispenser. Area cordoned and cleaned.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "Facilities",
    deviceName: "CAM-CAF-03",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3073",
    title: "Suspicious Package",
    zone: "Main Entrance",
    application: "Intrusion Detection",
    severity: "high",
    startTime: "10:05:00",
    startHour: "10:00",
    acknowledgeTime: "10:05:15",
    actionTime: "10:06:00",
    endTime: "10:15:00",
    resolveTime: "10:18:00",
    acknowledgeGapSeconds: 15,
    resolveGapSeconds: 780,
    totalDurationSeconds: 780,
    acknowledgedBy: "Security Chief",
    validationStatus: "false-positive",
    staffNote: "Unattended bag belonged to visitor. Owner located and identified.",
    hasVideoClip: true,
    protocolStepsCompleted: 4,
    protocolStepsTotal: 5,
    assignedTo: "Security Team",
    deviceName: "CAM-ENT-MAIN-04",
    duration: "13m 0s",
  },
  {
    incidentId: "INC-3074",
    title: "Loading Dock Violation",
    zone: "Warehouse A",
    application: "Safety Compliance",
    severity: "medium",
    startTime: "14:50:00",
    startHour: "14:00",
    acknowledgeTime: "14:51:05",
    actionTime: "14:52:00",
    endTime: "14:55:00",
    resolveTime: "14:56:00",
    acknowledgeGapSeconds: 65,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Dock Supervisor",
    validationStatus: "confirmed",
    staffNote: "Truck parked in restricted zone. Driver instructed to relocate.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 3,
    assignedTo: "Loading Manager",
    deviceName: "CAM-WH-A-06",
    duration: "6m 0s",
  },
  {
    incidentId: "INC-3075",
    title: "Motion After Hours",
    zone: "Assembly Line 3",
    application: "Intrusion Detection",
    severity: "low",
    startTime: "23:30:00",
    startHour: "22:00",
    acknowledgeTime: "23:30:45",
    actionTime: "23:32:00",
    endTime: "23:35:00",
    resolveTime: "23:36:00",
    acknowledgeGapSeconds: 45,
    resolveGapSeconds: 360,
    totalDurationSeconds: 360,
    acknowledgedBy: "Night Security",
    validationStatus: "false-positive",
    staffNote: "Cleaning crew working late. Verified with supervisor.",
    hasVideoClip: true,
    protocolStepsCompleted: 3,
    protocolStepsTotal: 4,
    assignedTo: "Night Watch",
    deviceName: "CAM-ASM-L3-05",
    duration: "6m 0s",
  },
];

const getSeverityConfig = (severity: string) => {
  const config: Record<string, { bright: string; light: string; dark: string }> = {
    critical: { bright: "#E7000B", light: "#FFE5E7", dark: "#B91C1C" },
    high: { bright: "#EA580C", light: "#FEEFE7", dark: "#C2410C" },
    medium: { bright: "#E19A04", light: "#FFF7E6", dark: "#CA8A04" },
    low: { bright: "#2B7FFF", light: "#E5F0FF", dark: "#1D4ED8" },
  };
  return config[severity] || config.low;
};

const getValidationBadge = (status: string | null) => {
  if (!status) return { label: "Under Review", color: "#64748B", bg: "#F0F2F4" };
  if (status === "confirmed") return { label: "Confirmed Incident", color: "#00A63E", bg: "#E5FFEF" };
  if (status === "false-positive") return { label: "False Positive", color: "#E19A04", bg: "#FFF7E6" };
  return { label: "Under Review", color: "#64748B", bg: "#F0F2F4" };
};

const getAcknowledgeGapStatus = (gapSeconds: number | null) => {
  if (gapSeconds === null) {
    return { label: "NOT ACK'D", color: "#64748B", bg: "#F0F2F4" };
  }
  if (gapSeconds <= 15) {
    return { label: `${gapSeconds}s`, color: "#00A63E", bg: "#E5FFEF" };
  }
  if (gapSeconds <= 60) {
    return { label: `${gapSeconds}s`, color: "#E19A04", bg: "#FFF7E6" };
  }
  return { label: `${gapSeconds}s`, color: "#E7000B", bg: "#FFE5E7" };
};

export const IncidentAnalytics = ({ persona }: { persona: Persona }) => {
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all");
  const [selectedZone, setSelectedZone] = useState<string>("all");
  const [selectedApps, setSelectedApps] = useState<string[]>([]);
  const [selectedHour, setSelectedHour] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [timeRange, setTimeRange] = useState<string>(INCIDENT_TIME_RANGES[persona][INCIDENT_TIME_RANGES[persona].length - 1]);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortBy, setSortBy] = useState<string>("severity-latency");
  const [sideModalIncident, setSideModalIncident] = useState<IncidentTimeline | null>(null);
  const [barChartStartIndex, setBarChartStartIndex] = useState<number>(0);
  const itemsPerPage = 10;
  const barsPerPage = 5;

  const openSideModal = (incident: IncidentTimeline) => {
    setSideModalIncident(incident);
  };

  const closeSideModal = () => {
    setSideModalIncident(null);
  };

  // Extract unique zones and applications
  const uniqueZones = ["all", ...Array.from(new Set(INCIDENT_TIMELINES.map(i => i.zone)))];
  const uniqueApplications = ["all", ...Array.from(new Set(INCIDENT_TIMELINES.map(i => i.application)))];

  // Filter incidents
  const filteredIncidents = INCIDENT_TIMELINES.filter(incident => {
    const matchesSeverity = selectedSeverity === "all" || incident.severity === selectedSeverity;
    const matchesZone = selectedZone === "all" || incident.zone === selectedZone;
    const matchesApplication = selectedApps.length === 0 || selectedApps.includes(incident.application);
    const matchesHour = selectedHour === null || incident.startHour === selectedHour;
    const matchesSearch = searchQuery === "" ||
      incident.incidentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.zone.toLowerCase().includes(searchQuery.toLowerCase()) ||
      incident.staffNote?.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSeverity && matchesZone && matchesApplication && matchesHour && matchesSearch;
  });

  // Sort incidents
  const sortedIncidents = [...filteredIncidents].sort((a, b) => {
    const severityOrder = { critical: 0, high: 1, medium: 2, low: 3 };

    if (sortBy === "severity-latency") {
      // Sort by severity first
      const severityDiff = severityOrder[a.severity] - severityOrder[b.severity];
      if (severityDiff !== 0) return severityDiff;

      // Then by acknowledge gap (descending - highest latency first)
      const aGap = a.acknowledgeGapSeconds ?? 0;
      const bGap = b.acknowledgeGapSeconds ?? 0;
      return bGap - aGap;
    }

    return 0;
  });

  // Pagination
  const totalPages = Math.ceil(sortedIncidents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedIncidents = sortedIncidents.slice(startIndex, endIndex);

  // Handle severity donut click
  const handleSeverityClick = (severity: string) => {
    setSelectedSeverity(selectedSeverity === severity ? "all" : severity);
  };

  // Handle peak hour click
  const handleHourClick = (hour: string) => {
    setSelectedHour(selectedHour === hour ? null : hour);
  };

  // Time-range label for StatusBar info chip
  const getTimeRangeInfo = () => {
    const now = new Date();
    const fmt = (d: Date) => d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
    if (timeRange === "1H") return `Since ${fmt(new Date(now.getTime() - 60 * 60 * 1000))} today`;
    if (timeRange === "6H") return `Since ${fmt(new Date(now.getTime() - 6 * 60 * 60 * 1000))} today`;
    if (timeRange === "12H") return `Since ${fmt(new Date(now.getTime() - 12 * 60 * 60 * 1000))} today`;
    if (timeRange === "24H") return "Since 00:00 today";
    if (timeRange === "Today") return "Since 00:00 today";
    if (timeRange === "This Week") return "Past 7 days";
    if (timeRange === "This Month") return "Past 30 days";
    if (timeRange === "This Quarter") return "Past 90 days";
    return timeRange;
  };

  // Clear all filters
  const clearFilters = () => {
    setSelectedSeverity("all");
    setSelectedZone("all");
    setSelectedHour(null);
    setSearchQuery("");
    setCurrentPage(1);
  };

  const hasActiveFilters = selectedSeverity !== "all" || selectedZone !== "all" || selectedHour !== null || searchQuery !== "";

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* ── StatusBar ─────────────────────────────────────────────────────────── */}
      <StatusBar
        timeRanges={INCIDENT_TIME_RANGES[persona]}
        timeRange={timeRange}
        onTimeRangeChange={(r) => { setTimeRange(r); setCurrentPage(1); }}
        appOptions={uniqueApplications.filter((a) => a !== "all")}
        selectedApps={selectedApps}
        onToggleApp={(app) =>
          setSelectedApps((prev) =>
            app === "all"
              ? []
              : prev.includes(app) ? prev.filter((a) => a !== app) : [...prev, app]
          )
        }
        timeRangeInfo={getTimeRangeInfo()}
        leftContent={
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live indicator */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-600">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
              <span className="uppercase tracking-wide">Live</span>
            </div>
            {/* Total incidents */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-600">
              <AlertTriangle className="w-3 h-3 text-neutral-400" />
              <span className="tabular-nums font-bold text-neutral-800">{PERFORMANCE_METRICS.totalIncidents}</span>
              <span className="uppercase tracking-wide">Incidents</span>
            </div>
            {/* Critical count */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-[#FFB3B3] bg-[#FFE5E7] text-[11px] font-medium text-[#E7000B]">
              <span className="tabular-nums font-bold">
                {SEVERITY_DONUT_DATA.find((d) => d.name === "Critical")?.value ?? 0}
              </span>
              <span className="uppercase tracking-wide">Critical</span>
            </div>
            {/* MTTA */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded border border-neutral-200 bg-neutral-50 text-[11px] font-medium text-neutral-600">
              <Timer className="w-3 h-3 text-neutral-400" />
              <span className="tabular-nums font-bold text-neutral-800">{PERFORMANCE_METRICS.mtta}s</span>
              <span className="uppercase tracking-wide">MTTA</span>
            </div>
          </div>
        }
      />

      {/* Monitoring Staff Persona - Tactical Response */}
      {persona === "monitoring" && (
        <>
          {/* Performance KPI Cards with Secondary Analytics */}
          <div className="grid grid-cols-1 xl:grid-cols-[689px_1fr] gap-4">
        {/* KPI Cards - 2x2 Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-[9px]">
          {/* Total Incidents */}
          <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] pt-3 px-3 pb-[11px] flex flex-col">
            <div className="mb-2">
              <p className="font-bold leading-[16px] not-italic text-[12px] text-white tracking-[0.5px] uppercase">
                Total Incidents
              </p>
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center">
                <p className="font-data font-bold leading-[32px] text-[30px] text-white tracking-[-0.75px]">
                  {PERFORMANCE_METRICS.totalIncidents}
                </p>
              </div>
              <div className="bg-[#E5FFEF] rounded border border-[rgba(185,248,207,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[5px] px-[9px] pb-[1px]">
                <div className="flex items-center gap-1 mb-[2px]">
                  <span className="font-data font-bold text-[#00A63E] text-[18px] leading-[18px]">
                    -{Math.abs(PERFORMANCE_METRICS.totalIncidentsChange)}%
                  </span>
                  <TrendingDown className="w-4 h-4 text-[#00A63E]" />
                </div>
                <p className="font-bold text-[#00A63E] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80">
                  vs last week
                </p>
              </div>
            </div>
          </div>

          {/* Mean Time to Acknowledge */}
          <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] pt-3 px-3 pb-[11px] flex flex-col">
            <div className="mb-2">
              <p className="font-bold leading-[16px] not-italic text-[12px] text-white tracking-[0.5px] uppercase">
                Mean Time to Acknowledge
              </p>
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center">
                <p className="font-data font-bold leading-[32px] text-[30px] text-white tracking-[-0.75px]">
                  {PERFORMANCE_METRICS.mtta}s
                </p>
              </div>
              <div className="bg-[#E5FFEF] rounded border border-[rgba(185,248,207,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[5px] px-[9px] pb-[1px]">
                <div className="flex items-center gap-1 mb-[2px]">
                  <span className="font-data font-bold text-[#00A63E] text-[18px] leading-[18px]">
                    -{Math.abs(PERFORMANCE_METRICS.mttaChange)}s
                  </span>
                  <TrendingDown className="w-4 h-4 text-[#00A63E]" />
                </div>
                <p className="font-bold text-[#00A63E] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80">
                  vs last week
                </p>
              </div>
            </div>
            <p className="font-medium text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
              ✓ Target: &lt;{PERFORMANCE_METRICS.mttaTarget}s
            </p>
          </div>

          {/* Mean Time to Resolve */}
          <div className="bg-gradient-to-br from-[#8B0000] to-[#E7000B] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(231,0,11,0.3),0px_4px_6px_0px_rgba(139,0,0,0.2)] pt-3 px-3 pb-[11px] flex flex-col border-2 border-[#E7000B]/30">
            <div className="mb-2">
              <p className="font-bold leading-[16px] not-italic text-[12px] text-white tracking-[0.5px] uppercase">
                Mean Time to Resolve
              </p>
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center">
                <p className="font-data font-bold leading-[32px] text-[30px] text-white tracking-[-0.75px]">
                  {PERFORMANCE_METRICS.mttr}m
                </p>
              </div>
              <div className="bg-white/95 rounded border border-white/40 shadow-[0px_1px_3px_0px_rgba(0,0,0,0.2),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[5px] px-[9px] pb-[1px]">
                <span className="font-data font-bold text-[#8B0000] text-[14px] leading-[18px] block text-center">
                  {PERFORMANCE_METRICS.mttrSLA}m
                </span>
                <p className="font-bold text-[#8B0000] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80 text-center">
                  SLA limit
                </p>
              </div>
            </div>
            <p className="font-medium text-white text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
              ⚠ EXCEEDING SLA
            </p>
          </div>

          {/* False Positive Rate */}
          <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] pt-3 px-3 pb-[11px] flex flex-col">
            <div className="mb-2">
              <p className="font-bold leading-[16px] not-italic text-[12px] text-white tracking-[0.5px] uppercase">
                False Positive Rate
              </p>
            </div>
            <div className="flex items-center justify-between flex-1">
              <div className="flex items-center">
                <p className="font-data font-bold leading-[32px] text-[30px] text-white tracking-[-0.75px]">
                  {PERFORMANCE_METRICS.falsePositiveRate}%
                </p>
              </div>
              <div className="bg-[#E5FFEF] rounded border border-[rgba(185,248,207,0.5)] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] pt-[5px] px-[9px] pb-[1px]">
                <span className="font-data font-bold text-[#00A63E] text-[14px] leading-[18px] block text-center">
                  &lt;{PERFORMANCE_METRICS.falsePositiveTarget}%
                </span>
                <p className="font-bold text-[#00A63E] text-[9px] leading-[14.4px] uppercase tracking-[0.225px] opacity-80 text-center">
                  target
                </p>
              </div>
            </div>
            <p className="font-medium text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
              ✓ Within Range
            </p>
          </div>
        </div>

        {/* Secondary Analytics - Side by Side Charts */}
        <div className="grid grid-cols-[280px_1fr] gap-[9px]">
          {/* Severity Distribution Pie Chart */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
            <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-2 w-full">
              Severity Distribution
            </h3>
            <div className="relative w-full h-[200px] flex items-center justify-center">
              <div style={{ width: '200px', height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={SEVERITY_DISTRIBUTION}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={92}
                      paddingAngle={0}
                      dataKey="value"
                      onClick={(data) => handleSeverityClick(data.name.toLowerCase())}
                      style={{ cursor: 'pointer' }}
                    >
                      {SEVERITY_DISTRIBUTION.map((entry, index) => (
                        <Cell key={`monitoring-severity-${entry.name}-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              {/* Center Text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="font-data font-bold text-[36px] leading-[40px] text-[#0f172a]">
                  {PERFORMANCE_METRICS.totalIncidents}
                </p>
                <p className="font-bold text-[10px] leading-[15px] text-[#94a3b8] uppercase tracking-[0.5px]">
                  Total Incidents
                </p>
              </div>
            </div>
          </div>

          {/* Top 5 Problem Zones */}
          <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">
                Top Problem Zones
              </h3>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setBarChartStartIndex(Math.max(0, barChartStartIndex - 1))}
                  disabled={barChartStartIndex === 0}
                  className={cn(
                    "p-1 rounded border transition-colors",
                    barChartStartIndex === 0
                      ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400"
                  )}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setBarChartStartIndex(Math.min(TOP_ZONES_DATA.length - barsPerPage, barChartStartIndex + 1))}
                  disabled={barChartStartIndex >= TOP_ZONES_DATA.length - barsPerPage}
                  className={cn(
                    "p-1 rounded border transition-colors",
                    barChartStartIndex >= TOP_ZONES_DATA.length - barsPerPage
                      ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                      : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400"
                  )}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
            <div className="flex-1 min-h-[200px]">
              <div style={{ height: '200px' }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart 
                    data={TOP_ZONES_DATA.slice(barChartStartIndex, barChartStartIndex + barsPerPage)} 
                    layout="horizontal" 
                    margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
                  >
                    <XAxis
                      dataKey="zone"
                      type="category"
                      tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      interval={0}
                      height={50}
                    />
                    <YAxis type="number" hide />
                    <Tooltip
                      contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                      cursor={{ fill: 'rgba(0, 119, 91, 0.1)' }}
                    />
                    <Bar dataKey="count" fill="#00775B" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
        </>
      )}

      {/* Manager Persona: Operational Efficiency */}
      {persona === "manager" && (
        <>
          {/* Manager KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Total Incidents
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {PERFORMANCE_METRICS.totalIncidents}
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ↓ {Math.abs(PERFORMANCE_METRICS.totalIncidentsChange)}% vs last week
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Avg Response
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {PERFORMANCE_METRICS.mtta}s
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ✓ Target: &lt;{PERFORMANCE_METRICS.mttaTarget}s
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Avg Resolution
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {PERFORMANCE_METRICS.mttr}m
              </p>
              <p className="font-bold text-[#E7000B] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                SLA: {PERFORMANCE_METRICS.mttrSLA}m
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                False Positive
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {PERFORMANCE_METRICS.falsePositiveRate}%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ✓ Target: &lt;{PERFORMANCE_METRICS.falsePositiveTarget}%
              </p>
            </div>
          </div>

      {/* Manager Persona: Staff Performance & Capacity Planning */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Staff Leaderboard */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
            Staff Performance Leaderboard
          </h3>
          <div className="space-y-3">
            {STAFF_LEADERBOARD.map((staff, index) => (
              <div key={staff.name} className="flex items-center gap-3 p-3 bg-neutral-50 rounded-lg border border-neutral-200">
                <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#00775B] text-white font-bold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <p className="text-xs font-bold text-neutral-900">{staff.name}</p>
                  <p className="text-[10px] text-neutral-500">{staff.incidents} incidents handled</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-data font-bold text-[#00775B]">{staff.avgResponseTime}s</p>
                  <p className="text-[10px] text-neutral-500">avg response</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-data font-bold text-neutral-900">{staff.onTimeRate}%</p>
                  <p className="text-[10px] text-neutral-500">on-time</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hour Analysis */}
        <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-6">
          <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-4">
            Peak Hour Analysis
          </h3>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={PEAK_HOUR_DATA} margin={{ top: 10, right: 10, bottom: 0, left: 0 }}>
                <XAxis
                  dataKey="hour"
                  tick={{ fontSize: 10, fill: '#64748B' }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                  cursor={{ fill: 'rgba(43, 127, 255, 0.1)' }}
                />
                <Bar dataKey="count" fill="#2B7FFF" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-neutral-500 mt-3 text-center">
            Schedule more staff during <span className="font-bold text-[#2B7FFF]">8:00-10:00</span> and <span className="font-bold text-[#2B7FFF]">18:00-20:00</span> peak periods
          </p>
        </div>
      </div>
        </>
      )}

      {/* Director Persona: Strategic ROI & Risk */}
      {persona === "director" && (
        <>
          {/* Director KPI Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Total Incidents
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {PERFORMANCE_METRICS.totalIncidents}
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ↓ {Math.abs(PERFORMANCE_METRICS.totalIncidentsChange)}% vs last week
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                Audit Score
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {COMPLIANCE_METRICS.auditScore}%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                ✓ Above Target
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                System ROI
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                342%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                Based on prevented losses
              </p>
            </div>
            <div className="bg-[#021D18] rounded-[10px] shadow-[0px_10px_15px_0px_rgba(0,0,0,0.1),0px_4px_6px_0px_rgba(0,0,0,0.1)] p-4">
              <p className="font-bold text-[12px] text-white tracking-[0.5px] uppercase mb-2">
                AI Accuracy
              </p>
              <p className="font-data font-bold text-[30px] text-white tracking-[-0.75px]">
                {SYSTEM_THROUGHPUT.aiAccuracy}%
              </p>
              <p className="font-bold text-[#00A63E] text-[10px] leading-[16px] uppercase tracking-[0.225px] mt-2">
                {SYSTEM_THROUGHPUT.throughputRate}% throughput
              </p>
            </div>
          </div>

          {/* Severity Distribution */}
          <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-4">
            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
              <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155] mb-2 w-full">
                Severity Distribution
              </h3>
              <div className="relative w-full h-[200px] flex items-center justify-center">
                <div style={{ width: '200px', height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={SEVERITY_DISTRIBUTION}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={92}
                        paddingAngle={0}
                        dataKey="value"
                        onClick={(data) => handleSeverityClick(data.name.toLowerCase())}
                        style={{ cursor: 'pointer' }}
                      >
                        {SEVERITY_DISTRIBUTION.map((entry, index) => (
                          <Cell key={`director-severity-${entry.name}-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="font-data font-bold text-[36px] leading-[40px] text-[#0f172a]">
                    {PERFORMANCE_METRICS.totalIncidents}
                  </p>
                  <p className="font-bold text-[10px] leading-[15px] text-[#94a3b8] uppercase tracking-[0.5px]">
                    Total Incidents
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#E2E8F0] rounded-[10px] shadow-[0px_1px_3px_0px_rgba(0,0,0,0.1),0px_1px_2px_0px_rgba(0,0,0,0.1)] p-4 flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <h3 className="font-bold text-xs leading-[16px] uppercase tracking-[0.5px] text-[#334155]">
                  Top Problem Zones
                </h3>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setBarChartStartIndex(Math.max(0, barChartStartIndex - 1))}
                    disabled={barChartStartIndex === 0}
                    className={cn(
                      "p-1 rounded border transition-colors",
                      barChartStartIndex === 0
                        ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400"
                    )}
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setBarChartStartIndex(Math.min(TOP_ZONES_DATA.length - barsPerPage, barChartStartIndex + 1))}
                    disabled={barChartStartIndex >= TOP_ZONES_DATA.length - barsPerPage}
                    className={cn(
                      "p-1 rounded border transition-colors",
                      barChartStartIndex >= TOP_ZONES_DATA.length - barsPerPage
                        ? "border-neutral-200 text-neutral-300 cursor-not-allowed"
                        : "border-neutral-300 text-neutral-600 hover:bg-neutral-50 hover:border-neutral-400"
                    )}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="flex-1 min-h-[200px]">
                <div style={{ height: '200px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart 
                      data={TOP_ZONES_DATA.slice(barChartStartIndex, barChartStartIndex + barsPerPage)} 
                      layout="horizontal" 
                      margin={{ top: 10, right: 20, bottom: 10, left: 10 }}
                    >
                      <XAxis
                        dataKey="zone"
                        type="category"
                        tick={{ fontSize: 11, fill: '#64748B', fontWeight: 500 }}
                        axisLine={false}
                        tickLine={false}
                        interval={0}
                        height={50}
                      />
                      <YAxis type="number" hide />
                      <Tooltip
                        contentStyle={{ fontSize: '10px', borderRadius: '4px' }}
                        cursor={{ fill: 'rgba(0, 119, 91, 0.1)' }}
                      />
                      <Bar dataKey="count" fill="#00775B" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>
          </div>

        </>
      )}

      {/* ── TableComponent ───────────────────────────────────────────────────── */}
      {/* Incident Table with Timeline - Shown for Monitoring Staff Only */}
      {persona === "monitoring" && (
      <div className="bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden">
        {/* Filter Bar */}
        <div className="p-4 border-b border-neutral-200 space-y-3">

          {/* Title row: title left, sort + clear right */}
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-700">
              Incident Deep Dive
            </h3>
            <div className="flex items-center gap-2">
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-bold uppercase tracking-wider text-[#E7000B] hover:bg-[#FFE5E7] rounded transition-colors"
                >
                  <X className="w-3 h-3" />
                  Clear
                </button>
              )}
              <FilterDropdown
                label="Sort"
                placeholder="Sort By"
                options={[{ value: "severity-latency", label: "Severity → Latency" }]}
                value={sortBy}
                onValueChange={setSortBy}
                className="w-[180px]"
              />
            </div>
          </div>

          {/* Search + Zone + Severity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-3.5 h-3.5 text-neutral-400" />
              <input
                type="text"
                placeholder="Search ID, title, zone, notes..."
                value={searchQuery}
                onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                className="w-full h-8 pl-9 pr-3 text-[11px] font-medium border border-neutral-200 rounded-[4px] bg-white text-neutral-700 placeholder:text-neutral-400 hover:border-neutral-300 focus:outline-none focus:ring-2 focus:ring-[#00775B]/20"
              />
            </div>

            {/* Zone Filter */}
            <FilterDropdown
              label="Zone"
              options={uniqueZones}
              value={selectedZone}
              onValueChange={(v) => { setSelectedZone(v); setCurrentPage(1); }}
            />

            {/* Severity Filter */}
            <FilterDropdown
              label="Severity"
              options={["all", "critical", "high", "medium", "low"]}
              value={selectedSeverity}
              onValueChange={(v) => { setSelectedSeverity(v); setCurrentPage(1); }}
            />
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-neutral-500 font-medium">Active:</span>
              {selectedSeverity !== "all" && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium capitalize">
                  {selectedSeverity}
                </span>
              )}
              {selectedZone !== "all" && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium">
                  {selectedZone}
                </span>
              )}
              {selectedHour && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium">
                  {selectedHour}
                </span>
              )}
              {searchQuery && (
                <span className="px-2 py-0.5 bg-neutral-100 text-neutral-700 rounded font-medium">
                  "{searchQuery}"
                </span>
              )}
            </div>
          )}
        </div>

        {/* Incident List */}
        <div className="divide-y divide-neutral-200">

          {sortedIncidents.length === 0 ? (
            <div className="px-4 py-12 text-center">
              <AlertCircle className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-neutral-500">No incidents match your filters</p>
              <button
                onClick={clearFilters}
                className="mt-3 px-4 py-2 text-xs font-bold uppercase tracking-wider text-[#00775B] hover:bg-[#E5FFF9] rounded transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          ) : (
            <div>
              {/* Table Header Row */}
              <div className="px-3 py-3 bg-[#021D18] grid grid-cols-[24px_1fr_80px_1fr_1fr_1fr_1fr_90px_80px] gap-4 items-center text-[10px] uppercase font-bold text-white/90 tracking-wider">
                <div></div>
                <div>Incident ID</div>
                <div>Severity</div>
                <div>Zone</div>
                <div>Application</div>
                <div>Assigned</div>
                <div>Device</div>
                <div className="text-right">Duration</div>
                <div className="text-right">Response</div>
              </div>

              {/* Table Rows */}
              {paginatedIncidents.map((incident, idx) => {
              const severityConfig = getSeverityConfig(incident.severity);
              const ackGapStatus = getAcknowledgeGapStatus(incident.acknowledgeGapSeconds);

              return (
                <div key={incident.incidentId} className="border-b border-neutral-100 last:border-b-0">
                  <div
                    onClick={() => openSideModal(incident)}
                    className={cn(
                      "px-3 py-2 grid grid-cols-[24px_1fr_80px_1fr_1fr_1fr_1fr_90px_80px] gap-4 items-center cursor-pointer hover:bg-[#E5FFF9] transition-colors text-xs",
                      idx % 2 === 0 ? "bg-white" : "bg-neutral-50/50"
                    )}
                  >
                    {/* Video Thumbnail */}
                    <div className="w-6 h-6 bg-neutral-900 rounded flex items-center justify-center">
                      {incident.hasVideoClip ? (
                        <Video className="w-3 h-3 text-white/70" />
                      ) : (
                        <div className="w-3 h-3" />
                      )}
                    </div>

                    {/* Incident ID */}
                    <div className="truncate">
                      <div className="text-xs font-bold text-neutral-900">{incident.incidentId}</div>
                      <div className="text-[10px] text-neutral-500 truncate">{incident.title}</div>
                    </div>

                    {/* Severity Chip */}
                    <div>
                      <span
                        className="inline-flex px-2 py-1 rounded text-[9px] font-bold uppercase tracking-wide text-white"
                        style={{ backgroundColor: severityConfig.bright }}
                      >
                        {incident.severity}
                      </span>
                    </div>

                    {/* Zone */}
                    <div className="text-[11px] font-medium text-neutral-700 truncate">
                      {incident.zone}
                    </div>

                    {/* Application */}
                    <div className="text-[11px] font-medium text-neutral-700 truncate">
                      {incident.application}
                    </div>

                    {/* Assigned To */}
                    <div className="text-[11px] font-medium text-neutral-700 truncate">
                      {incident.assignedTo || <span className="text-neutral-400 italic">Unassigned</span>}
                    </div>

                    {/* Device */}
                    <div className="text-[11px] font-data font-medium text-neutral-700 tracking-tight truncate">
                      {incident.deviceName}
                    </div>

                    {/* Duration */}
                    <div className="text-right">
                      <div className="text-[11px] font-data font-bold text-neutral-700 tabular-nums">{incident.duration}</div>
                    </div>

                    {/* Response Time with Color Coding */}
                    <div className="text-right">
                      <div
                        className="text-[11px] font-data font-bold tabular-nums"
                        style={{ color: ackGapStatus.color }}
                      >
                        {ackGapStatus.label}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            </div>
          )}

            {/* Pagination Footer */}
            {totalPages > 1 && (
              <div className="px-4 py-2.5 bg-neutral-50 border-t border-neutral-200 flex items-center justify-between">
                {/* Compact Previous / pages / Next */}
                <div className="flex items-center rounded-[4px] border border-neutral-200 bg-white overflow-hidden shadow-sm divide-x divide-neutral-200">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-medium transition-colors",
                      currentPage === 1
                        ? "text-neutral-300 cursor-not-allowed"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    Previous
                  </button>
                  {Array.from({ length: totalPages }).map((_, idx) => {
                    const page = idx + 1;
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={cn(
                            "px-3 py-1.5 text-[11px] font-medium transition-colors min-w-[32px]",
                            currentPage === page
                              ? "bg-[#00775B] text-white font-bold"
                              : "text-neutral-600 hover:bg-neutral-50"
                          )}
                        >
                          {page}
                        </button>
                      );
                    } else if (page === currentPage - 2 || page === currentPage + 2) {
                      return (
                        <span key={`ellipsis-${page}`} className="px-2 py-1.5 text-[11px] text-neutral-400 select-none">
                          …
                        </span>
                      );
                    }
                    return null;
                  }).filter(Boolean)}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className={cn(
                      "px-3 py-1.5 text-[11px] font-medium transition-colors",
                      currentPage === totalPages
                        ? "text-neutral-300 cursor-not-allowed"
                        : "text-neutral-600 hover:bg-neutral-50"
                    )}
                  >
                    Next
                  </button>
                </div>

                {/* Showing X-Y of Z */}
                <span className="text-[11px] text-neutral-500 tabular-nums">
                  Showing{" "}
                  <span className="font-semibold text-neutral-700">{startIndex + 1}–{Math.min(endIndex, sortedIncidents.length)}</span>
                  {" "}of{" "}
                  <span className="font-semibold text-neutral-700">{sortedIncidents.length}</span>
                  {" "}incidents
                </span>
              </div>
            )}
        </div>
      </div>
      )}

      {/* Side Modal for Incident Details */}
      {sideModalIncident && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-end bg-black/50"
          onClick={closeSideModal}
        >
          <div
            className="bg-white h-screen w-full max-w-[550px] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {(() => {
              const incident = sideModalIncident;
              const severityConfig = getSeverityConfig(incident.severity);
              const validationBadge = getValidationBadge(incident.validationStatus);
              const ackGapStatus = getAcknowledgeGapStatus(incident.acknowledgeGapSeconds);
              const protocolComplete = incident.protocolStepsCompleted === incident.protocolStepsTotal;

              return (
                <div className="flex flex-col h-full">
                  {/* Compact Identity Header */}
                  <div className="bg-white border-b border-neutral-200 px-5 py-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <p className="font-bold text-neutral-900 text-base">{incident.incidentId}</p>
                        <span
                          className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider text-white"
                          style={{ backgroundColor: severityConfig.bright }}
                        >
                          {incident.severity}
                        </span>
                        <span className="text-xs text-neutral-400">|</span>
                        <span className="text-xs text-neutral-600">{incident.application}</span>
                        <span className="text-xs text-neutral-400">|</span>
                        <span className="text-xs text-neutral-500">{incident.zone}</span>
                      </div>
                      <button
                        onClick={closeSideModal}
                        className="p-1 hover:bg-neutral-100 rounded transition-colors"
                      >
                        <X className="w-4 h-4 text-neutral-400" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Content */}
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-5 space-y-4">
                      {/* Visual Evidence Container */}
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        {incident.hasVideoClip ? (
                          <div>
                            <div className="group relative cursor-pointer aspect-[16/9] bg-neutral-900 rounded overflow-hidden">
                              <div className="absolute inset-0 flex items-center justify-center">
                                <div className="text-center">
                                  <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center mx-auto mb-2">
                                    <Play className="w-6 h-6 text-white" fill="white" />
                                  </div>
                                  <p className="text-[10px] text-white/70 font-bold uppercase tracking-wide">Video Evidence</p>
                                </div>
                              </div>
                            </div>
                            {/* Tight 3-Column Metadata Strip */}
                            <div className="mt-3 grid grid-cols-3 gap-3 text-[10px]">
                              <div className="flex flex-col">
                                <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Duration</span>
                                <span className="font-data font-bold text-neutral-900">
                                  {Math.floor(incident.totalDurationSeconds / 60)}:{String(incident.totalDurationSeconds % 60).padStart(2, '0')}
                                </span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Camera</span>
                                <span className="font-data font-bold text-neutral-900 truncate">{incident.deviceName}</span>
                              </div>
                              <div className="flex flex-col">
                                <span className="text-neutral-400 uppercase tracking-wide mb-0.5">Timestamp</span>
                                <span className="font-data font-bold text-neutral-900">{incident.startTime}</span>
                              </div>
                            </div>
                          </div>
                        ) : (
                          <div className="aspect-[16/9] bg-neutral-100 rounded flex items-center justify-center">
                            <div className="text-center">
                              <Video className="w-10 h-10 text-neutral-300 mx-auto mb-2" />
                              <p className="text-xs text-neutral-400">No video available</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Latency Audit Container */}
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Latency Audit</div>
                        <div className="relative space-y-0">
                          {/* Step 1: Detected */}
                          <div className="flex items-start gap-3 pb-2">
                            <div className="flex flex-col items-center">
                              <div className="w-5 h-5 rounded-full bg-[#E7000B] flex items-center justify-center flex-shrink-0">
                                <Flame className="w-3 h-3 text-white" />
                              </div>
                              {incident.acknowledgeGapSeconds !== null && (
                                <div
                                  className="w-0.5 bg-[#E7000B] my-1"
                                  style={{
                                    height: `${Math.min(incident.acknowledgeGapSeconds * 2, 60)}px`
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex-1 pt-0.5">
                              <div className="flex items-center justify-between">
                                <div className="text-[11px] font-bold text-[#E7000B] uppercase tracking-wide">Detected</div>
                                <div className="font-data text-[11px] text-neutral-600">{incident.startTime}</div>
                              </div>
                            </div>
                          </div>

                          {/* Latency Indicator */}
                          {incident.acknowledgeGapSeconds !== null && (
                            <>
                              <div className="flex items-center gap-3 pb-2">
                                <div className="w-5 flex justify-center"></div>
                                <div className="flex-1">
                                  <div
                                    className="inline-flex px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider"
                                    style={{
                                      backgroundColor: ackGapStatus.bg,
                                      color: ackGapStatus.color,
                                    }}
                                  >
                                    +{incident.acknowledgeGapSeconds}s LATENCY
                                  </div>
                                </div>
                              </div>

                              {/* Step 2: Acknowledged */}
                              <div className="flex items-start gap-3 pb-2">
                                <div className="flex flex-col items-center">
                                  <div className="w-5 h-5 rounded-full bg-[#EA580C] flex items-center justify-center flex-shrink-0">
                                    <Hand className="w-3 h-3 text-white" />
                                  </div>
                                  {incident.resolveGapSeconds !== null && (
                                    <div
                                      className="w-0.5 bg-[#00A63E] my-1"
                                      style={{
                                        height: `${Math.min((incident.resolveGapSeconds - (incident.acknowledgeGapSeconds || 0)) / 5, 80)}px`
                                      }}
                                    />
                                  )}
                                </div>
                                <div className="flex-1 pt-0.5">
                                  <div className="flex items-center justify-between mb-0.5">
                                    <div className="text-[11px] font-bold text-[#EA580C] uppercase tracking-wide">Acknowledged</div>
                                    <div className="font-data text-[11px] text-neutral-600">{incident.acknowledgeTime}</div>
                                  </div>
                                  {incident.acknowledgedBy && (
                                    <div className="text-[10px] text-neutral-500">by {incident.acknowledgedBy}</div>
                                  )}
                                </div>
                              </div>
                            </>
                          )}

                          {/* Processing Time */}
                          {incident.resolveGapSeconds !== null && (
                            <>
                              <div className="flex items-center gap-3 pb-2">
                                <div className="w-5 flex justify-center"></div>
                                <div className="flex-1">
                                  <div className="inline-flex px-2 py-0.5 rounded bg-[#00A63E]/10 text-[9px] font-bold uppercase tracking-wider text-[#00A63E]">
                                    {Math.floor((incident.resolveGapSeconds - (incident.acknowledgeGapSeconds || 0)) / 60)}m {((incident.resolveGapSeconds - (incident.acknowledgeGapSeconds || 0)) % 60)}s PROCESSING
                                  </div>
                                </div>
                              </div>

                              {/* Step 3: Resolved */}
                              <div className="flex items-start gap-3">
                                <div className="flex flex-col items-center">
                                  <div className="w-5 h-5 rounded-full bg-[#00A63E] flex items-center justify-center flex-shrink-0">
                                    <Shield className="w-3 h-3 text-white" />
                                  </div>
                                </div>
                                <div className="flex-1 pt-0.5">
                                  <div className="flex items-center justify-between">
                                    <div className="text-[11px] font-bold text-[#00A63E] uppercase tracking-wide">Resolved</div>
                                    <div className="font-data text-[11px] text-neutral-600">{incident.resolveTime}</div>
                                  </div>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Protocol Audit Container */}
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <div className="text-[10px] uppercase font-bold text-neutral-400 tracking-wider mb-3">Protocol Audit</div>
                        <div className="space-y-0">
                          {Array.from({ length: incident.protocolStepsTotal }).map((_, idx) => {
                            const stepNum = idx + 1;
                            const isCompleted = stepNum <= incident.protocolStepsCompleted;
                            const stepLabels = [
                              "Incident Detected",
                              "Alert Dispatched",
                              "Staff Acknowledged",
                              "Action Taken",
                              "Resolution Confirmed",
                              "Documentation Complete"
                            ];
                            return (
                              <div
                                key={idx}
                                className={cn(
                                  "flex items-center gap-2 text-[11px] py-2 px-3 border-b border-neutral-200 last:border-b-0",
                                  isCompleted ? "bg-white" : "bg-neutral-50"
                                )}
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-4 h-4 text-[#00A63E] flex-shrink-0" />
                                ) : (
                                  <div className="w-4 h-4 rounded-full border-2 border-neutral-300 flex-shrink-0" />
                                )}
                                <span className={cn(
                                  "font-medium flex-1",
                                  isCompleted ? "text-[#00A63E]" : "text-neutral-400"
                                )}>
                                  {stepLabels[idx] || `Protocol Step ${stepNum}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>

                        {/* Staff Note */}
                        {incident.staffNote && (
                          <div className="mt-3 pt-3 border-t border-neutral-200">
                            <div className="text-[9px] uppercase font-bold text-neutral-400 tracking-wider mb-2">Staff Note</div>
                            <p className="text-[11px] text-neutral-700 leading-relaxed bg-white rounded px-3 py-2 border border-neutral-200">
                              {incident.staffNote}
                            </p>
                          </div>
                        )}

                        {!protocolComplete && (
                          <div className="mt-3 pt-3 border-t border-neutral-200">
                            <p className="text-[10px] text-[#E19A04] font-bold uppercase tracking-wide flex items-center gap-1.5">
                              <AlertCircle className="w-4 h-4" />
                              Incomplete Protocol - Operational Risk
                            </p>
                          </div>
                        )}
                      </div>

                      {/* Metadata Grid */}
                      <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4">
                        <div className="grid grid-cols-2 gap-3 text-[10px]">
                          <div className="flex flex-col">
                            <span className="text-neutral-400 uppercase tracking-wide mb-1">Assigned</span>
                            <span className="font-bold text-neutral-900">{incident.assignedTo || "Unassigned"}</span>
                          </div>
                          <div className="flex flex-col">
                            <span className="text-neutral-400 uppercase tracking-wide mb-1">Status</span>
                            <span
                              className="font-bold uppercase"
                              style={{ color: validationBadge.color }}
                            >
                              {validationBadge.label}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Sticky Footer with Action Buttons */}
                  <div className="bg-white border-t border-neutral-200 px-5 py-4">
                    {incident.validationStatus === "under-review" ? (
                      <div className="flex gap-2">
                        <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                          <X className="w-3.5 h-3.5" />
                          False Positive
                        </button>
                        <button className="flex-1 h-10 flex items-center justify-center gap-2 bg-white border border-neutral-300 text-neutral-700 rounded text-xs font-bold uppercase tracking-wider hover:bg-neutral-50 transition-colors">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Escalate
                        </button>
                        <button className="flex-[2] h-10 flex items-center justify-center gap-2 bg-[#00775B] text-white rounded text-xs font-bold uppercase tracking-wider hover:bg-[#009e78] transition-colors">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Confirm Incident
                        </button>
                      </div>
                    ) : (
                      <div
                        className="px-4 py-2.5 rounded text-center text-xs font-bold uppercase tracking-wider"
                        style={{
                          backgroundColor: validationBadge.bg,
                          color: validationBadge.color,
                        }}
                      >
                        {validationBadge.label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};
