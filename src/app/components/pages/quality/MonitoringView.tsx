import { useState } from "react";
import type { GroupConfig } from "../IdentityAnalytics";
import { cn } from "@/app/lib/utils";
import {
  Package, CheckCircle2, XCircle, MapPin, Activity,
  ChevronLeft, ChevronRight, ShieldAlert, Clock,
  AlertTriangle, Mail, ChevronDown, TrendingUp, TrendingDown, Minus,
} from "lucide-react";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";
import {
  AreaChart, Area, LineChart, Line, YAxis, ResponsiveContainer,
} from "recharts";
import { ZONE_DATA } from "./data/mockData";
import type { QualityTerminology, ZoneMetric } from "./data/types";
import { QualitySlidePanel } from "./components/panels/QualitySlidePanel";

// ─── Helpers ─────────────────────────────────────────────────────────────────
function getPaginationItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const items: (number | "…")[] = [0];
  if (current > 2)         items.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) items.push(i);
  if (current < total - 3) items.push("…");
  items.push(total - 1);
  return items;
}

// ─── Types ────────────────────────────────────────────────────────────────────
type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "INFO";
type FeedFilter    = "all" | "critical" | "high" | "medium" | "info";

interface QualityAlertCard {
  id: string;
  severity: "CRITICAL" | "HIGH";
  label: string;
  defectType: string;
  description: string;
  camera: string;
  zone: string;
  stage: string;
  time: string;
}

interface QualityFeedEvent {
  id: string;
  severity: AlertSeverity;
  eventName: string;
  defectType: string;
  camera: string;
  zone: string;
  stage: string;
  time: string;
  confidence?: number;
}

interface BatchEntry {
  id: string;
  pass: boolean;
  defectCount: number;
  defectType?: string;
  zone: string;
}

interface AppMonitoringData {
  alertCards: QualityAlertCard[];
  feedEvents: QualityFeedEvent[];
  batches: BatchEntry[];
}

// Unified defect detail item — normalises alert cards and feed events
interface DefectDetailItem {
  id: string;
  severity: AlertSeverity;
  label?: string;
  defectType: string;
  eventName?: string;
  description?: string;
  camera: string;
  zone: string;
  stage: string;
  time: string;
  confidence?: number;
  source: "alert" | "feed";
}

function alertToDetail(a: QualityAlertCard): DefectDetailItem {
  return {
    id: a.id, severity: a.severity, label: a.label,
    defectType: a.defectType, description: a.description,
    camera: a.camera, zone: a.zone, stage: a.stage, time: a.time,
    source: "alert",
  };
}
function feedToDetail(e: QualityFeedEvent, rowId: string): DefectDetailItem {
  return {
    id: rowId, severity: e.severity,
    defectType: e.defectType, eventName: e.eventName,
    camera: e.camera, zone: e.zone, stage: e.stage, time: e.time,
    confidence: e.confidence,
    source: "feed",
  };
}

// ─── Per-app data ─────────────────────────────────────────────────────────────

const BOTTLE_DATA: AppMonitoringData = {
  alertCards: [
    { id: "a1", severity: "CRITICAL", label: "FAIL",   defectType: "Surface Crack",          description: "Critical Defect — Halt Line",          camera: "CAM-LA-02", zone: "Zone B", stage: "Bottle Forming", time: "09:14:31" },
    { id: "a2", severity: "CRITICAL", label: "REJECT",  defectType: "Shape Deformation",      description: "Dimensional Fail — Batch Quarantine",  camera: "CAM-LA-02", zone: "Zone B", stage: "Bottle Forming", time: "09:12:44" },
    { id: "a3", severity: "HIGH",     label: "REJECT",  defectType: "Underfill — Below Spec", description: "Fill Defect — Rework Required",         camera: "CAM-LA-03", zone: "Zone C", stage: "Filling",        time: "09:11:22" },
    { id: "a4", severity: "HIGH",     label: "DEFECT",  defectType: "Label Misalignment",     description: "Cosmetic Defect — Batch Flag",          camera: "CAM-PK-01", zone: "Zone A", stage: "Labeling",       time: "09:10:05" },
    { id: "a5", severity: "HIGH",     label: "FAIL",    defectType: "Loose Cap",              description: "Seal Failure — Batch Hold",             camera: "CAM-FQ-01", zone: "Zone D", stage: "Capping",        time: "09:08:37" },
    { id: "a6", severity: "HIGH",     label: "DEFECT",  defectType: "Colour Deviation",       description: "Appearance Issue — Inspector Review",   camera: "CAM-FQ-02", zone: "Zone D", stage: "Final QC",       time: "09:06:14" },
    { id: "a7", severity: "HIGH",     label: "DEFECT",  defectType: "Foreign Body in Fill",   description: "Contamination — Isolate Batch",         camera: "CAM-LA-01", zone: "Zone A", stage: "Raw Material Intake", time: "09:04:20" },
    { id: "a8", severity: "HIGH",     label: "FAIL",    defectType: "Overfill Detected",      description: "Fill Defect — Batch Review",            camera: "CAM-LA-03", zone: "Zone C", stage: "Filling",        time: "09:02:41" },
    { id: "a9", severity: "HIGH",     label: "DEFECT",  defectType: "Ink Jet Failure",        description: "Label Issue — QC Log Entry",            camera: "CAM-PK-02", zone: "Zone A", stage: "Labeling",       time: "09:01:05" },
  ],
  feedEvents: [
    { id: "e01", severity: "CRITICAL", eventName: "Surface Crack Detected",      defectType: "Structural Defect",  camera: "CAM-LA-02", zone: "Zone B", stage: "Bottle Forming",    time: "09:14:31", confidence: 97.2 },
    { id: "e02", severity: "CRITICAL", eventName: "Shape Deformation",           defectType: "Dimensional Defect", camera: "CAM-LA-02", zone: "Zone B", stage: "Bottle Forming",    time: "09:12:44", confidence: 94.1 },
    { id: "e03", severity: "HIGH",     eventName: "Underfill — 15ml Below Spec", defectType: "Fill Defect",        camera: "CAM-LA-03", zone: "Zone C", stage: "Filling",           time: "09:11:22", confidence: 91.3 },
    { id: "e04", severity: "HIGH",     eventName: "Overfill Detected",           defectType: "Fill Defect",        camera: "CAM-LA-03", zone: "Zone C", stage: "Filling",           time: "09:10:44", confidence: 88.7 },
    { id: "e05", severity: "HIGH",     eventName: "Loose Cap — Seal Failure",    defectType: "Seal Defect",        camera: "CAM-FQ-01", zone: "Zone D", stage: "Capping",           time: "09:09:15", confidence: 93.5 },
    { id: "e06", severity: "HIGH",     eventName: "Label Smear",                 defectType: "Label Defect",       camera: "CAM-PK-01", zone: "Zone A", stage: "Labeling",          time: "09:08:37", confidence: 89.4 },
    { id: "e07", severity: "MEDIUM",   eventName: "Surface Scratch",             defectType: "Surface Defect",     camera: "CAM-LA-02", zone: "Zone B", stage: "Bottle Forming",    time: "09:07:19", confidence: 84.6 },
    { id: "e08", severity: "MEDIUM",   eventName: "Label Misalignment",          defectType: "Label Defect",       camera: "CAM-PK-02", zone: "Zone A", stage: "Labeling",          time: "09:05:54", confidence: 82.1 },
    { id: "e09", severity: "MEDIUM",   eventName: "Contamination Trace",         defectType: "Contamination",      camera: "CAM-LA-01", zone: "Zone A", stage: "Raw Material Intake",time: "09:04:11", confidence: 79.8 },
    { id: "e10", severity: "MEDIUM",   eventName: "Colour Deviation",            defectType: "Colour Defect",      camera: "CAM-FQ-02", zone: "Zone D", stage: "Final QC",          time: "09:03:38", confidence: 78.3 },
    { id: "e11", severity: "MEDIUM",   eventName: "Neck Deformation",            defectType: "Dimensional Defect", camera: "CAM-LA-03", zone: "Zone B", stage: "Bottle Forming",    time: "09:01:42", confidence: 76.4 },
    { id: "e12", severity: "INFO",     eventName: "Batch B-0041 — Pass",         defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Final QC",          time: "09:00:18", confidence: 99.1 },
    { id: "e13", severity: "INFO",     eventName: "Batch B-0039 — Pass",         defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Final QC",          time: "08:58:44", confidence: 98.7 },
    { id: "e14", severity: "INFO",     eventName: "Rework Complete — B-0040",    defectType: "Rework",             camera: "CAM-RW-01", zone: "Zone F", stage: "Rework Station",     time: "08:55:31", confidence: 97.4 },
    { id: "e15", severity: "INFO",     eventName: "Batch B-0036 — Pass",         defectType: "Batch Status",       camera: "CAM-FQ-02", zone: "Zone D", stage: "Final QC",          time: "08:49:50", confidence: 98.1 },
  ],
  batches: [
    { id: "B-0041", pass: true,  defectCount: 0,                              zone: "Zone D" },
    { id: "B-0040", pass: false, defectCount: 3, defectType: "Surface Crack", zone: "Zone B" },
    { id: "B-0039", pass: true,  defectCount: 0,                              zone: "Zone F" },
    { id: "B-0038", pass: true,  defectCount: 1, defectType: "Minor Scratch", zone: "Zone A" },
    { id: "B-0037", pass: false, defectCount: 5, defectType: "Shape Deform",  zone: "Zone B" },
    { id: "B-0036", pass: true,  defectCount: 0,                              zone: "Zone D" },
    { id: "B-0035", pass: true,  defectCount: 0,                              zone: "Zone E" },
    { id: "B-0034", pass: false, defectCount: 2, defectType: "Loose Cap",     zone: "Zone C" },
    { id: "B-0033", pass: true,  defectCount: 0,                              zone: "Zone A" },
    { id: "B-0032", pass: true,  defectCount: 1, defectType: "Label Smear",   zone: "Zone C" },
    { id: "B-0031", pass: false, defectCount: 4, defectType: "Label Misalign",zone: "Zone G" },
    { id: "B-0030", pass: true,  defectCount: 0,                              zone: "Zone H" },
    { id: "B-0029", pass: false, defectCount: 2, defectType: "Surface Crack", zone: "Zone I" },
    { id: "B-0028", pass: true,  defectCount: 0,                              zone: "Zone J" },
    { id: "B-0027", pass: true,  defectCount: 1, defectType: "Tool Wear",     zone: "Zone K" },
    { id: "B-0026", pass: false, defectCount: 3, defectType: "Contamination", zone: "Zone L" },
  ],
};

const PCB_DATA: AppMonitoringData = {
  alertCards: [
    { id: "a1", severity: "CRITICAL", label: "FAIL",   defectType: "Component Misplacement", description: "Critical — Production Stop",            camera: "CAM-AS-02", zone: "Zone C", stage: "Component Placement", time: "09:14:02" },
    { id: "a2", severity: "CRITICAL", label: "REJECT",  defectType: "Cold Solder Joint",      description: "Solder Defect — Batch Quarantine",      camera: "CAM-WS-01", zone: "Zone C", stage: "Reflow Soldering",    time: "09:12:31" },
    { id: "a3", severity: "HIGH",     label: "REJECT",  defectType: "Solder Bridge",          description: "Short Circuit Risk — Batch Flag",       camera: "CAM-IB-01", zone: "Zone B", stage: "AOI Inspection",      time: "09:11:18" },
    { id: "a4", severity: "HIGH",     label: "DEFECT",  defectType: "Missing Component R45",  description: "Missing Part — Halt Placement",         camera: "CAM-AS-01", zone: "Zone C", stage: "Component Placement", time: "09:09:55" },
    { id: "a5", severity: "HIGH",     label: "REJECT",  defectType: "Tombstoning — C12",      description: "Reflow Defect — Rework Required",       camera: "CAM-WS-02", zone: "Zone C", stage: "Reflow Soldering",    time: "09:08:22" },
    { id: "a6", severity: "HIGH",     label: "DEFECT",  defectType: "Board Warpage",          description: "Dimensional Issue — Inspector Alert",   camera: "CAM-WS-01", zone: "Zone C", stage: "Reflow Soldering",    time: "09:06:44" },
    { id: "a7", severity: "HIGH",     label: "DEFECT",  defectType: "Vias Not Filled",        description: "Via Defect — Rework Flag",              camera: "CAM-IB-01", zone: "Zone B", stage: "AOI Inspection",      time: "09:05:11" },
    { id: "a8", severity: "HIGH",     label: "FAIL",    defectType: "Delamination",           description: "Board Integrity — Quarantine",          camera: "CAM-WS-01", zone: "Zone C", stage: "Reflow Soldering",    time: "09:03:22" },
    { id: "a9", severity: "HIGH",     label: "DEFECT",  defectType: "Exposed Copper",         description: "Short Risk — Inspector Alert",          camera: "CAM-IB-02", zone: "Zone B", stage: "AOI Inspection",      time: "09:01:44" },
  ],
  feedEvents: [
    { id: "e01", severity: "CRITICAL", eventName: "Component Misplacement",     defectType: "Placement Defect",   camera: "CAM-AS-02", zone: "Zone C", stage: "Component Placement", time: "09:14:02", confidence: 96.8 },
    { id: "e02", severity: "CRITICAL", eventName: "Cold Solder Joint",          defectType: "Solder Defect",      camera: "CAM-WS-01", zone: "Zone C", stage: "Reflow Soldering",    time: "09:12:31", confidence: 94.4 },
    { id: "e03", severity: "HIGH",     eventName: "Solder Bridge",              defectType: "Solder Defect",      camera: "CAM-IB-01", zone: "Zone B", stage: "AOI Inspection",      time: "09:11:18", confidence: 91.7 },
    { id: "e04", severity: "HIGH",     eventName: "Missing Component R45",      defectType: "Missing Part",       camera: "CAM-AS-01", zone: "Zone C", stage: "Component Placement", time: "09:09:55", confidence: 98.2 },
    { id: "e05", severity: "HIGH",     eventName: "Tombstoning — C12",          defectType: "Reflow Defect",      camera: "CAM-WS-02", zone: "Zone C", stage: "Reflow Soldering",    time: "09:08:22", confidence: 93.1 },
    { id: "e06", severity: "HIGH",     eventName: "Insufficient Solder Paste",  defectType: "Paste Defect",       camera: "CAM-AS-01", zone: "Zone A", stage: "Solder Paste",        time: "09:07:05", confidence: 88.5 },
    { id: "e07", severity: "MEDIUM",   eventName: "Flux Residue Detected",      defectType: "Contamination",      camera: "CAM-IB-02", zone: "Zone B", stage: "AOI Inspection",      time: "09:05:41", confidence: 84.2 },
    { id: "e08", severity: "MEDIUM",   eventName: "Board Warpage",              defectType: "Dimensional Defect", camera: "CAM-WS-01", zone: "Zone C", stage: "Reflow Soldering",    time: "09:04:18", confidence: 81.9 },
    { id: "e09", severity: "MEDIUM",   eventName: "Open Circuit — J3",          defectType: "Electrical Defect",  camera: "CAM-IB-01", zone: "Zone D", stage: "Functional Test",     time: "09:02:55", confidence: 79.3 },
    { id: "e10", severity: "MEDIUM",   eventName: "Coating Coverage Gap",       defectType: "Coating Defect",     camera: "CAM-FQ-01", zone: "Zone D", stage: "Conformal Coating",   time: "09:01:32", confidence: 77.8 },
    { id: "e11", severity: "MEDIUM",   eventName: "Alignment Offset",           defectType: "Placement Defect",   camera: "CAM-AS-02", zone: "Zone C", stage: "Component Placement", time: "09:00:09", confidence: 82.6 },
    { id: "e12", severity: "INFO",     eventName: "Batch PCB-221 — Pass",       defectType: "Batch Status",       camera: "CAM-IB-02", zone: "Zone B", stage: "AOI Inspection",      time: "08:58:44", confidence: 99.0 },
    { id: "e13", severity: "INFO",     eventName: "Batch PCB-219 — Pass",       defectType: "Batch Status",       camera: "CAM-IB-01", zone: "Zone B", stage: "AOI Inspection",      time: "08:56:20", confidence: 98.5 },
    { id: "e14", severity: "INFO",     eventName: "Rework Complete — PCB-218",  defectType: "Rework",             camera: "CAM-RW-01", zone: "Zone F", stage: "Rework Station",      time: "08:52:07", confidence: 97.2 },
    { id: "e15", severity: "INFO",     eventName: "Batch PCB-217 — Pass",       defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Functional Test",     time: "08:48:33", confidence: 98.9 },
  ],
  batches: [
    { id: "PCB-221", pass: true,  defectCount: 0,                               zone: "Zone B" },
    { id: "PCB-220", pass: false, defectCount: 2, defectType: "Cold Joint",     zone: "Zone C" },
    { id: "PCB-219", pass: true,  defectCount: 0,                               zone: "Zone B" },
    { id: "PCB-218", pass: false, defectCount: 4, defectType: "Misplacement",   zone: "Zone C" },
    { id: "PCB-217", pass: true,  defectCount: 0,                               zone: "Zone D" },
    { id: "PCB-216", pass: true,  defectCount: 0,                               zone: "Zone A" },
    { id: "PCB-215", pass: false, defectCount: 1, defectType: "Solder Bridge",  zone: "Zone C" },
    { id: "PCB-214", pass: true,  defectCount: 0,                               zone: "Zone D" },
    { id: "PCB-213", pass: true,  defectCount: 0,                               zone: "Zone E" },
    { id: "PCB-212", pass: true,  defectCount: 0,                               zone: "Zone F" },
    { id: "PCB-211", pass: false, defectCount: 3, defectType: "Delamination",   zone: "Zone G" },
    { id: "PCB-210", pass: true,  defectCount: 0,                               zone: "Zone H" },
    { id: "PCB-209", pass: false, defectCount: 2, defectType: "Via Defect",     zone: "Zone I" },
    { id: "PCB-208", pass: true,  defectCount: 0,                               zone: "Zone J" },
    { id: "PCB-207", pass: true,  defectCount: 1, defectType: "Flux Residue",   zone: "Zone K" },
    { id: "PCB-206", pass: false, defectCount: 4, defectType: "Contamination",  zone: "Zone L" },
  ],
};

const WELDING_DATA: AppMonitoringData = {
  alertCards: [
    { id: "a1", severity: "CRITICAL", label: "FAIL",   defectType: "Weld Crack",         description: "Critical — Stop Weld Process",         camera: "CAM-WS-01", zone: "Zone C", stage: "Full Weld Pass",       time: "09:14:19" },
    { id: "a2", severity: "CRITICAL", label: "REJECT",  defectType: "Porosity Cluster",   description: "Structural Risk — Batch Quarantine",   camera: "CAM-WS-02", zone: "Zone C", stage: "Full Weld Pass",       time: "09:12:55" },
    { id: "a3", severity: "HIGH",     label: "REJECT",  defectType: "Undercut on Bead",   description: "Bead Defect — Inspector Review",        camera: "CAM-WS-01", zone: "Zone B", stage: "Tack Welding",         time: "09:11:33" },
    { id: "a4", severity: "HIGH",     label: "DEFECT",  defectType: "Lack of Fusion",     description: "Fusion Defect — Rework Required",      camera: "CAM-WS-03", zone: "Zone B", stage: "Tack Welding",         time: "09:09:47" },
    { id: "a5", severity: "HIGH",     label: "DEFECT",  defectType: "Weld Spatter",       description: "Surface Defect — Finishing Required",  camera: "CAM-WS-02", zone: "Zone D", stage: "Post-Weld Inspection", time: "09:08:11" },
    { id: "a6", severity: "HIGH",     label: "DEFECT",  defectType: "Burn-Through",             description: "Heat Defect — Halt & Re-calibrate",       camera: "CAM-WS-02", zone: "Zone C", stage: "Full Weld Pass",        time: "09:06:33" },
    { id: "a7", severity: "HIGH",     label: "DEFECT",  defectType: "Oxidation on Bead",        description: "Surface Defect — Grinding Required",      camera: "CAM-WS-03", zone: "Zone B", stage: "Tack Welding",          time: "09:05:02" },
    { id: "a8", severity: "HIGH",     label: "FAIL",    defectType: "Incomplete Fill",          description: "Joint Defect — Rework Required",          camera: "CAM-WS-01", zone: "Zone C", stage: "Full Weld Pass",        time: "09:03:15" },
    { id: "a9", severity: "HIGH",     label: "DEFECT",  defectType: "Excessive Reinforcement",  description: "Bead Profile Defect — QC Review",         camera: "CAM-WS-02", zone: "Zone D", stage: "Post-Weld Inspection",  time: "09:01:30" },
  ],
  feedEvents: [
    { id: "e01", severity: "CRITICAL", eventName: "Weld Crack Detected",        defectType: "Structural Defect",  camera: "CAM-WS-01", zone: "Zone C", stage: "Full Weld Pass",        time: "09:14:19", confidence: 97.8 },
    { id: "e02", severity: "CRITICAL", eventName: "Porosity Cluster",           defectType: "Structural Defect",  camera: "CAM-WS-02", zone: "Zone C", stage: "Full Weld Pass",        time: "09:12:55", confidence: 95.2 },
    { id: "e03", severity: "HIGH",     eventName: "Undercut on Bead",           defectType: "Bead Defect",        camera: "CAM-WS-01", zone: "Zone B", stage: "Tack Welding",          time: "09:11:33", confidence: 92.4 },
    { id: "e04", severity: "HIGH",     eventName: "Lack of Fusion",             defectType: "Fusion Defect",      camera: "CAM-WS-03", zone: "Zone B", stage: "Tack Welding",          time: "09:09:47", confidence: 89.6 },
    { id: "e05", severity: "HIGH",     eventName: "Burn-Through",               defectType: "Heat Defect",        camera: "CAM-WS-02", zone: "Zone C", stage: "Full Weld Pass",        time: "09:08:55", confidence: 93.7 },
    { id: "e06", severity: "HIGH",     eventName: "Weld Spatter",               defectType: "Surface Defect",     camera: "CAM-WS-02", zone: "Zone D", stage: "Post-Weld Inspection",  time: "09:08:11", confidence: 88.1 },
    { id: "e07", severity: "MEDIUM",   eventName: "Discolouration",             defectType: "Heat Defect",        camera: "CAM-WS-01", zone: "Zone D", stage: "Post-Weld Inspection",  time: "09:06:44", confidence: 84.3 },
    { id: "e08", severity: "MEDIUM",   eventName: "Surface Contamination",      defectType: "Contamination",      camera: "CAM-WS-03", zone: "Zone A", stage: "Material Preparation",  time: "09:05:18", confidence: 81.7 },
    { id: "e09", severity: "MEDIUM",   eventName: "Angular Distortion",         defectType: "Dimensional Defect", camera: "CAM-WS-01", zone: "Zone C", stage: "Full Weld Pass",        time: "09:03:51", confidence: 79.2 },
    { id: "e10", severity: "MEDIUM",   eventName: "Root Defect",                defectType: "Structural Defect",  camera: "CAM-WS-02", zone: "Zone C", stage: "Full Weld Pass",        time: "09:02:24", confidence: 78.5 },
    { id: "e11", severity: "MEDIUM",   eventName: "Overlap on Bead",            defectType: "Bead Defect",        camera: "CAM-WS-03", zone: "Zone B", stage: "Tack Welding",          time: "09:00:57", confidence: 76.9 },
    { id: "e12", severity: "INFO",     eventName: "Weld W-081 — Pass",          defectType: "Batch Status",       camera: "CAM-IB-01", zone: "Zone D", stage: "Post-Weld Inspection",  time: "08:59:30", confidence: 99.3 },
    { id: "e13", severity: "INFO",     eventName: "Weld W-079 — Pass",          defectType: "Batch Status",       camera: "CAM-IB-01", zone: "Zone D", stage: "Post-Weld Inspection",  time: "08:57:03", confidence: 98.8 },
    { id: "e14", severity: "INFO",     eventName: "Rework Complete — W-080",    defectType: "Rework",             camera: "CAM-RW-01", zone: "Zone F", stage: "Rework Station",        time: "08:53:36", confidence: 97.1 },
    { id: "e15", severity: "INFO",     eventName: "Weld W-077 — Pass",          defectType: "Batch Status",       camera: "CAM-IB-02", zone: "Zone D", stage: "Post-Weld Inspection",  time: "08:50:09", confidence: 98.6 },
  ],
  batches: [
    { id: "W-081", pass: true,  defectCount: 0,                            zone: "Zone D" },
    { id: "W-080", pass: false, defectCount: 1, defectType: "Porosity",    zone: "Zone C" },
    { id: "W-079", pass: true,  defectCount: 0,                            zone: "Zone D" },
    { id: "W-078", pass: false, defectCount: 3, defectType: "Weld Crack",  zone: "Zone B" },
    { id: "W-077", pass: true,  defectCount: 0,                            zone: "Zone D" },
    { id: "W-076", pass: true,  defectCount: 0,                            zone: "Zone A" },
    { id: "W-075", pass: false, defectCount: 2, defectType: "Undercut",    zone: "Zone C" },
    { id: "W-074", pass: true,  defectCount: 0,                            zone: "Zone B" },
    { id: "W-073", pass: true,  defectCount: 0,                            zone: "Zone E" },
    { id: "W-072", pass: true,  defectCount: 0,                            zone: "Zone F" },
    { id: "W-071", pass: false, defectCount: 4, defectType: "Burn-Through",zone: "Zone G" },
    { id: "W-070", pass: true,  defectCount: 0,                            zone: "Zone H" },
    { id: "W-069", pass: false, defectCount: 2, defectType: "Spatter",     zone: "Zone I" },
    { id: "W-068", pass: true,  defectCount: 0,                            zone: "Zone J" },
    { id: "W-067", pass: true,  defectCount: 1, defectType: "Oxidation",   zone: "Zone K" },
    { id: "W-066", pass: false, defectCount: 3, defectType: "Porosity",    zone: "Zone L" },
  ],
};

const CAR_DAMAGE_DATA: AppMonitoringData = {
  alertCards: [
    { id: "a1", severity: "CRITICAL", label: "FAIL",   defectType: "Deep Dent — Front Panel", description: "Structural Damage — Reject Vehicle",   camera: "CAM-IB-01", zone: "Zone C", stage: "Front Exterior",    time: "09:14:44" },
    { id: "a2", severity: "CRITICAL", label: "FAIL",   defectType: "Windshield Crack",        description: "Critical Damage — Fail Inspection",    camera: "CAM-IB-02", zone: "Zone C", stage: "Front Exterior",    time: "09:13:10" },
    { id: "a3", severity: "HIGH",     label: "REJECT",  defectType: "Hood Paint Chip",         description: "Cosmetic Defect — Rework Required",    camera: "CAM-IB-01", zone: "Zone B", stage: "Front Exterior",    time: "09:11:58" },
    { id: "a4", severity: "HIGH",     label: "DEFECT",  defectType: "Rear Panel Scratch",      description: "Surface Defect — Rework Required",     camera: "CAM-IB-02", zone: "Zone B", stage: "Rear Exterior",     time: "09:10:33" },
    { id: "a5", severity: "HIGH",     label: "DEFECT",  defectType: "Side Door Dent",          description: "Impact Damage — Flag for Review",      camera: "CAM-IB-01", zone: "Zone B", stage: "Driver Side",       time: "09:08:50" },
    { id: "a6", severity: "HIGH",     label: "DEFECT",  defectType: "Roof Dent — Panel 3",   description: "Impact Damage — Inspector Verification", camera: "CAM-IB-02", zone: "Zone B", stage: "Roof",            time: "09:07:25" },
    { id: "a7", severity: "HIGH",     label: "DEFECT",  defectType: "Wheel Arch Rust",        description: "Corrosion — Inspector Review",           camera: "CAM-FQ-01", zone: "Zone D", stage: "Underbody",       time: "09:05:55" },
    { id: "a8", severity: "HIGH",     label: "FAIL",    defectType: "Headlight Crack",        description: "Safety Defect — Reject Vehicle",         camera: "CAM-IB-01", zone: "Zone B", stage: "Front Exterior",  time: "09:03:40" },
    { id: "a9", severity: "HIGH",     label: "DEFECT",  defectType: "Trim Gap",               description: "Fit Defect — Rework Required",           camera: "CAM-IB-02", zone: "Zone A", stage: "Passenger Side", time: "09:01:18" },
  ],
  feedEvents: [
    { id: "e01", severity: "CRITICAL", eventName: "Deep Dent — Front Panel",    defectType: "Structural Damage",  camera: "CAM-IB-01", zone: "Zone C", stage: "Front Exterior",     time: "09:14:44", confidence: 97.5 },
    { id: "e02", severity: "CRITICAL", eventName: "Windshield Crack",           defectType: "Glass Damage",       camera: "CAM-IB-02", zone: "Zone C", stage: "Front Exterior",     time: "09:13:10", confidence: 95.8 },
    { id: "e03", severity: "HIGH",     eventName: "Hood Paint Chip",            defectType: "Paint Defect",       camera: "CAM-IB-01", zone: "Zone B", stage: "Front Exterior",     time: "09:11:58", confidence: 91.2 },
    { id: "e04", severity: "HIGH",     eventName: "Rear Panel Scratch",         defectType: "Surface Defect",     camera: "CAM-IB-02", zone: "Zone B", stage: "Rear Exterior",      time: "09:10:33", confidence: 88.4 },
    { id: "e05", severity: "HIGH",     eventName: "Side Door Dent",             defectType: "Impact Damage",      camera: "CAM-IB-01", zone: "Zone B", stage: "Driver Side",        time: "09:08:50", confidence: 92.6 },
    { id: "e06", severity: "HIGH",     eventName: "Roof Dent — Panel 3",        defectType: "Impact Damage",      camera: "CAM-IB-02", zone: "Zone B", stage: "Roof",               time: "09:07:25", confidence: 87.9 },
    { id: "e07", severity: "MEDIUM",   eventName: "Minor Door Scratch",         defectType: "Surface Defect",     camera: "CAM-IB-01", zone: "Zone A", stage: "Passenger Side",     time: "09:06:01", confidence: 84.1 },
    { id: "e08", severity: "MEDIUM",   eventName: "Bumper Scuff",               defectType: "Surface Defect",     camera: "CAM-IB-02", zone: "Zone B", stage: "Rear Exterior",      time: "09:04:38", confidence: 81.7 },
    { id: "e09", severity: "MEDIUM",   eventName: "Underbody Rust Spot",        defectType: "Corrosion",          camera: "CAM-FQ-01", zone: "Zone D", stage: "Underbody",          time: "09:03:15", confidence: 79.4 },
    { id: "e10", severity: "MEDIUM",   eventName: "Mirror Housing Crack",       defectType: "Plastic Defect",     camera: "CAM-IB-01", zone: "Zone A", stage: "Passenger Side",     time: "09:01:52", confidence: 77.2 },
    { id: "e11", severity: "MEDIUM",   eventName: "Paint Blister — Rear",       defectType: "Paint Defect",       camera: "CAM-IB-02", zone: "Zone B", stage: "Rear Exterior",      time: "09:00:29", confidence: 75.8 },
    { id: "e12", severity: "INFO",     eventName: "VEH-112 — Pass",             defectType: "Inspection Status",  camera: "CAM-FQ-01", zone: "Zone D", stage: "Final Inspection",    time: "08:59:06", confidence: 99.2 },
    { id: "e13", severity: "INFO",     eventName: "VEH-110 — Pass",             defectType: "Inspection Status",  camera: "CAM-FQ-02", zone: "Zone D", stage: "Final Inspection",    time: "08:56:43", confidence: 98.7 },
    { id: "e14", severity: "INFO",     eventName: "Rework Complete — VEH-111",  defectType: "Rework",             camera: "CAM-RW-01", zone: "Zone F", stage: "Rework Station",     time: "08:53:20", confidence: 97.0 },
    { id: "e15", severity: "INFO",     eventName: "VEH-108 — Pass",             defectType: "Inspection Status",  camera: "CAM-FQ-01", zone: "Zone D", stage: "Final Inspection",    time: "08:49:57", confidence: 98.4 },
  ],
  batches: [
    { id: "VEH-112", pass: true,  defectCount: 0,                             zone: "Zone D" },
    { id: "VEH-111", pass: false, defectCount: 2, defectType: "Dent",         zone: "Zone C" },
    { id: "VEH-110", pass: true,  defectCount: 0,                             zone: "Zone D" },
    { id: "VEH-109", pass: false, defectCount: 4, defectType: "Scratch",      zone: "Zone C" },
    { id: "VEH-108", pass: true,  defectCount: 0,                             zone: "Zone D" },
    { id: "VEH-107", pass: true,  defectCount: 0,                             zone: "Zone B" },
    { id: "VEH-106", pass: false, defectCount: 1, defectType: "Paint Chip",   zone: "Zone B" },
    { id: "VEH-105", pass: true,  defectCount: 0,                             zone: "Zone A" },
    { id: "VEH-104", pass: true,  defectCount: 0,                             zone: "Zone E" },
    { id: "VEH-103", pass: true,  defectCount: 0,                             zone: "Zone F" },
    { id: "VEH-102", pass: false, defectCount: 3, defectType: "Deep Scratch", zone: "Zone G" },
    { id: "VEH-101", pass: true,  defectCount: 0,                             zone: "Zone H" },
    { id: "VEH-100", pass: false, defectCount: 2, defectType: "Dent",         zone: "Zone I" },
    { id: "VEH-099", pass: true,  defectCount: 0,                             zone: "Zone J" },
    { id: "VEH-098", pass: true,  defectCount: 1, defectType: "Paint Chip",   zone: "Zone K" },
    { id: "VEH-097", pass: false, defectCount: 4, defectType: "Corrosion",    zone: "Zone L" },
  ],
};

const ASSEMBLY_DATA: AppMonitoringData = {
  alertCards: [
    { id: "a1", severity: "CRITICAL", label: "FAIL",   defectType: "Missing Fastener",       description: "Critical — Stop Assembly Line",        camera: "CAM-AS-02", zone: "Zone C", stage: "Station 2 — Drive",   time: "09:14:08" },
    { id: "a2", severity: "CRITICAL", label: "REJECT",  defectType: "Wrong Torque Applied",   description: "Torque Failure — Recall Check",         camera: "CAM-AS-02", zone: "Zone C", stage: "Station 2 — Drive",   time: "09:12:22" },
    { id: "a3", severity: "HIGH",     label: "DEFECT",  defectType: "Loose Connector",        description: "Electrical Risk — Inspector Alert",     camera: "CAM-AS-03", zone: "Zone B", stage: "Station 3 — Wiring",  time: "09:11:05" },
    { id: "a4", severity: "HIGH",     label: "DEFECT",  defectType: "Drive Belt Misalignment",description: "Mechanical Defect — Line Hold",         camera: "CAM-AS-01", zone: "Zone C", stage: "Station 2 — Drive",   time: "09:09:44" },
    { id: "a5", severity: "HIGH",     label: "FAIL",    defectType: "Clip Failure",           description: "Assembly Defect — Rework Required",    camera: "CAM-AS-02", zone: "Zone B", stage: "Station 4 — Cover",   time: "09:08:19" },
    { id: "a6", severity: "HIGH",     label: "DEFECT",  defectType: "Pinched Wiring",         description: "Electrical Hazard — Immediate Action",  camera: "CAM-AS-03", zone: "Zone B", stage: "Station 3 — Wiring",  time: "09:06:55" },
    { id: "a7", severity: "HIGH",     label: "DEFECT",  defectType: "Wrong Colour Harness",   description: "Assembly Error — Line Hold",            camera: "CAM-AS-03", zone: "Zone B", stage: "Station 3 — Wiring",  time: "09:05:25" },
    { id: "a8", severity: "HIGH",     label: "FAIL",    defectType: "Screw Stripped",         description: "Fastener Defect — Rework Required",    camera: "CAM-AS-01", zone: "Zone C", stage: "Station 2 — Drive",   time: "09:03:44" },
    { id: "a9", severity: "HIGH",     label: "DEFECT",  defectType: "Panel Misaligned",       description: "Fit Defect — Adjust Station",          camera: "CAM-AS-02", zone: "Zone A", stage: "Station 4 — Cover",   time: "09:01:58" },
  ],
  feedEvents: [
    { id: "e01", severity: "CRITICAL", eventName: "Missing Fastener",           defectType: "Assembly Defect",    camera: "CAM-AS-02", zone: "Zone C", stage: "Station 2 — Drive",    time: "09:14:08", confidence: 98.1 },
    { id: "e02", severity: "CRITICAL", eventName: "Wrong Torque Applied",       defectType: "Torque Defect",      camera: "CAM-AS-02", zone: "Zone C", stage: "Station 2 — Drive",    time: "09:12:22", confidence: 95.4 },
    { id: "e03", severity: "HIGH",     eventName: "Loose Connector",            defectType: "Electrical Defect",  camera: "CAM-AS-03", zone: "Zone B", stage: "Station 3 — Wiring",   time: "09:11:05", confidence: 92.7 },
    { id: "e04", severity: "HIGH",     eventName: "Drive Belt Misalignment",    defectType: "Mechanical Defect",  camera: "CAM-AS-01", zone: "Zone C", stage: "Station 2 — Drive",    time: "09:09:44", confidence: 89.3 },
    { id: "e05", severity: "HIGH",     eventName: "Clip Failure",               defectType: "Assembly Defect",    camera: "CAM-AS-02", zone: "Zone B", stage: "Station 4 — Cover",    time: "09:08:19", confidence: 91.8 },
    { id: "e06", severity: "HIGH",     eventName: "Pinched Wiring",             defectType: "Electrical Defect",  camera: "CAM-AS-03", zone: "Zone B", stage: "Station 3 — Wiring",   time: "09:07:04", confidence: 87.6 },
    { id: "e07", severity: "MEDIUM",   eventName: "Cover Misfit",               defectType: "Fit Defect",         camera: "CAM-AS-02", zone: "Zone A", stage: "Station 4 — Cover",    time: "09:05:49", confidence: 83.9 },
    { id: "e08", severity: "MEDIUM",   eventName: "Torque Below Spec",          defectType: "Torque Defect",      camera: "CAM-AS-01", zone: "Zone C", stage: "Station 2 — Drive",    time: "09:04:34", confidence: 81.2 },
    { id: "e09", severity: "MEDIUM",   eventName: "Function Test Fail",         defectType: "Function Defect",    camera: "CAM-FQ-01", zone: "Zone D", stage: "Station 5 — Test",     time: "09:03:19", confidence: 79.7 },
    { id: "e10", severity: "MEDIUM",   eventName: "Label Missing",              defectType: "Label Defect",       camera: "CAM-PK-01", zone: "Zone A", stage: "Station 6 — Final QC", time: "09:02:04", confidence: 77.4 },
    { id: "e11", severity: "MEDIUM",   eventName: "Seal Gap Detected",          defectType: "Seal Defect",        camera: "CAM-FQ-02", zone: "Zone D", stage: "Station 6 — Final QC", time: "09:00:49", confidence: 75.1 },
    { id: "e12", severity: "INFO",     eventName: "ASM-334 — Pass",             defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Station 6 — Final QC", time: "08:59:34", confidence: 99.0 },
    { id: "e13", severity: "INFO",     eventName: "ASM-333 — Pass",             defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Station 6 — Final QC", time: "08:57:19", confidence: 98.6 },
    { id: "e14", severity: "INFO",     eventName: "Rework Complete — ASM-332",  defectType: "Rework",             camera: "CAM-RW-01", zone: "Zone F", stage: "Rework Station",        time: "08:54:04", confidence: 97.3 },
    { id: "e15", severity: "INFO",     eventName: "ASM-330 — Pass",             defectType: "Batch Status",       camera: "CAM-FQ-02", zone: "Zone D", stage: "Station 6 — Final QC", time: "08:50:49", confidence: 98.3 },
  ],
  batches: [
    { id: "ASM-334", pass: true,  defectCount: 0,                                 zone: "Zone D" },
    { id: "ASM-333", pass: true,  defectCount: 0,                                 zone: "Zone D" },
    { id: "ASM-332", pass: false, defectCount: 2, defectType: "Loose Connector",  zone: "Zone C" },
    { id: "ASM-331", pass: true,  defectCount: 0,                                 zone: "Zone B" },
    { id: "ASM-330", pass: false, defectCount: 3, defectType: "Missing Fastener", zone: "Zone C" },
    { id: "ASM-329", pass: true,  defectCount: 0,                                 zone: "Zone B" },
    { id: "ASM-328", pass: true,  defectCount: 0,                                 zone: "Zone A" },
    { id: "ASM-327", pass: false, defectCount: 1, defectType: "Clip Failure",     zone: "Zone B" },
    { id: "ASM-326", pass: true,  defectCount: 0,                                 zone: "Zone E" },
    { id: "ASM-325", pass: true,  defectCount: 0,                                 zone: "Zone F" },
    { id: "ASM-324", pass: false, defectCount: 3, defectType: "Label Misalign",   zone: "Zone G" },
    { id: "ASM-323", pass: true,  defectCount: 0,                                 zone: "Zone H" },
    { id: "ASM-322", pass: false, defectCount: 2, defectType: "Loose Screw",      zone: "Zone I" },
    { id: "ASM-321", pass: true,  defectCount: 0,                                 zone: "Zone J" },
    { id: "ASM-320", pass: true,  defectCount: 1, defectType: "Thread Damage",    zone: "Zone K" },
    { id: "ASM-319", pass: false, defectCount: 4, defectType: "Contamination",    zone: "Zone L" },
  ],
};

const DEFAULT_DATA: AppMonitoringData = {
  alertCards: [
    { id: "a1", severity: "CRITICAL", label: "FAIL",   defectType: "Critical Defect Detected", description: "Critical — Halt Production",        camera: "CAM-IB-01", zone: "Zone C", stage: "Inspection Bay 1",    time: "09:14:22" },
    { id: "a2", severity: "CRITICAL", label: "REJECT",  defectType: "Structural Failure",       description: "Fail — Batch Quarantine",           camera: "CAM-IB-02", zone: "Zone C", stage: "Inspection Bay 2",    time: "09:12:48" },
    { id: "a3", severity: "HIGH",     label: "DEFECT",  defectType: "Surface Irregularity",     description: "High-Severity — Rework Required",   camera: "CAM-FQ-01", zone: "Zone B", stage: "Final QC Station A",  time: "09:11:15" },
    { id: "a4", severity: "HIGH",     label: "DEFECT",  defectType: "Dimensional Variance",     description: "Out of Spec — Inspector Alert",     camera: "CAM-FQ-02", zone: "Zone B", stage: "Final QC Station B",  time: "09:09:51" },
    { id: "a5", severity: "HIGH",     label: "REJECT",  defectType: "Material Contamination",   description: "Contamination — Batch Hold",        camera: "CAM-LA-01", zone: "Zone A", stage: "Intake",              time: "09:08:27" },
    { id: "a6", severity: "HIGH",     label: "DEFECT",  defectType: "Edge Defect",              description: "Surface Defect — Inspector Review",  camera: "CAM-LA-02", zone: "Zone B", stage: "Processing Stage",    time: "09:06:58" },
    { id: "a7", severity: "HIGH",     label: "DEFECT",  defectType: "Coating Gap",              description: "Surface Defect — Rework Required",   camera: "CAM-FQ-01", zone: "Zone A", stage: "Processing Stage",    time: "09:04:55" },
    { id: "a8", severity: "HIGH",     label: "FAIL",    defectType: "Thickness Deviation",      description: "Dimensional Defect — Batch Hold",    camera: "CAM-LA-02", zone: "Zone B", stage: "Inspection Bay 1",    time: "09:03:20" },
    { id: "a9", severity: "HIGH",     label: "DEFECT",  defectType: "Finish Blemish",           description: "Cosmetic Defect — QC Log",           camera: "CAM-IB-01", zone: "Zone C", stage: "Final QC Station A",  time: "09:01:45" },
  ],
  feedEvents: [
    { id: "e01", severity: "CRITICAL", eventName: "Critical Defect Detected",   defectType: "Structural Defect",  camera: "CAM-IB-01", zone: "Zone C", stage: "Inspection Bay 1",    time: "09:14:22", confidence: 96.9 },
    { id: "e02", severity: "CRITICAL", eventName: "Structural Failure",         defectType: "Structural Defect",  camera: "CAM-IB-02", zone: "Zone C", stage: "Inspection Bay 2",    time: "09:12:48", confidence: 94.7 },
    { id: "e03", severity: "HIGH",     eventName: "Surface Irregularity",       defectType: "Surface Defect",     camera: "CAM-FQ-01", zone: "Zone B", stage: "Final QC Station A",  time: "09:11:15", confidence: 91.5 },
    { id: "e04", severity: "HIGH",     eventName: "Dimensional Variance",       defectType: "Dimensional Defect", camera: "CAM-FQ-02", zone: "Zone B", stage: "Final QC Station B",  time: "09:09:51", confidence: 88.3 },
    { id: "e05", severity: "HIGH",     eventName: "Material Contamination",     defectType: "Contamination",      camera: "CAM-LA-01", zone: "Zone A", stage: "Intake",              time: "09:08:27", confidence: 90.1 },
    { id: "e06", severity: "HIGH",     eventName: "Edge Defect",                defectType: "Surface Defect",     camera: "CAM-LA-02", zone: "Zone B", stage: "Processing Stage",    time: "09:07:03", confidence: 86.7 },
    { id: "e07", severity: "MEDIUM",   eventName: "Minor Surface Mark",         defectType: "Surface Defect",     camera: "CAM-FQ-01", zone: "Zone A", stage: "Final QC Station A",  time: "09:05:39", confidence: 83.4 },
    { id: "e08", severity: "MEDIUM",   eventName: "Coating Thickness Variance", defectType: "Dimensional Defect", camera: "CAM-LA-03", zone: "Zone B", stage: "Processing Stage",    time: "09:04:15", confidence: 80.8 },
    { id: "e09", severity: "MEDIUM",   eventName: "Colour Deviation",           defectType: "Colour Defect",      camera: "CAM-IB-01", zone: "Zone D", stage: "Inspection Bay 1",    time: "09:02:51", confidence: 78.6 },
    { id: "e10", severity: "MEDIUM",   eventName: "Alignment Offset",           defectType: "Dimensional Defect", camera: "CAM-LA-02", zone: "Zone B", stage: "Processing Stage",    time: "09:01:27", confidence: 76.2 },
    { id: "e11", severity: "MEDIUM",   eventName: "Residue Detected",           defectType: "Contamination",      camera: "CAM-IB-02", zone: "Zone C", stage: "Inspection Bay 2",    time: "09:00:03", confidence: 74.9 },
    { id: "e12", severity: "INFO",     eventName: "Batch UNIT-041 — Pass",      defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Final QC Station A",  time: "08:58:39", confidence: 99.1 },
    { id: "e13", severity: "INFO",     eventName: "Batch UNIT-039 — Pass",      defectType: "Batch Status",       camera: "CAM-FQ-02", zone: "Zone D", stage: "Final QC Station B",  time: "08:56:15", confidence: 98.6 },
    { id: "e14", severity: "INFO",     eventName: "Rework Complete — UNIT-040", defectType: "Rework",             camera: "CAM-RW-01", zone: "Zone F", stage: "Rework Station",       time: "08:52:51", confidence: 97.2 },
    { id: "e15", severity: "INFO",     eventName: "Batch UNIT-037 — Pass",      defectType: "Batch Status",       camera: "CAM-FQ-01", zone: "Zone D", stage: "Final QC Station A",  time: "08:49:27", confidence: 98.8 },
  ],
  batches: [
    { id: "UNIT-041", pass: true,  defectCount: 0,                                zone: "Zone D" },
    { id: "UNIT-040", pass: false, defectCount: 2, defectType: "Surface Defect",  zone: "Zone C" },
    { id: "UNIT-039", pass: true,  defectCount: 0,                                zone: "Zone D" },
    { id: "UNIT-038", pass: true,  defectCount: 0,                                zone: "Zone B" },
    { id: "UNIT-037", pass: false, defectCount: 4, defectType: "Structural",      zone: "Zone C" },
    { id: "UNIT-036", pass: true,  defectCount: 0,                                zone: "Zone B" },
    { id: "UNIT-035", pass: true,  defectCount: 0,                                zone: "Zone A" },
    { id: "UNIT-034", pass: false, defectCount: 1, defectType: "Contamination",   zone: "Zone E" },
    { id: "UNIT-033", pass: true,  defectCount: 0,                                zone: "Zone D" },
    { id: "UNIT-032", pass: true,  defectCount: 0,                                zone: "Zone F" },
    { id: "UNIT-031", pass: false, defectCount: 3, defectType: "Surface Defect",  zone: "Zone G" },
    { id: "UNIT-030", pass: true,  defectCount: 0,                                zone: "Zone H" },
    { id: "UNIT-029", pass: false, defectCount: 2, defectType: "Structural",      zone: "Zone I" },
    { id: "UNIT-028", pass: true,  defectCount: 0,                                zone: "Zone J" },
    { id: "UNIT-027", pass: true,  defectCount: 1, defectType: "Tool Wear",       zone: "Zone K" },
    { id: "UNIT-026", pass: false, defectCount: 4, defectType: "Contamination",   zone: "Zone L" },
  ],
};

const APP_DATA: Record<string, AppMonitoringData> = {
  bottle:       BOTTLE_DATA,
  pcb:          PCB_DATA,
  welding:      WELDING_DATA,
  "car-damage": CAR_DAMAGE_DATA,
  assembly:     ASSEMBLY_DATA,
};

const SEV_CFG: Record<AlertSeverity, { bg: string; text: string }> = {
  CRITICAL: { bg: "bg-red-600",    text: "text-white" },
  HIGH:     { bg: "bg-amber-500",  text: "text-black" },
  MEDIUM:   { bg: "bg-blue-500",   text: "text-white" },
  INFO:     { bg: "bg-neutral-400",text: "text-white" },
};

// Defect thumbnail — dark swatch with abbreviated defect type
function DefectSwatch({ severity, defectType, className }: {
  severity: AlertSeverity; defectType: string; className?: string;
}) {
  const bg: Record<AlertSeverity, string> = {
    CRITICAL: "bg-red-950", HIGH: "bg-amber-950", MEDIUM: "bg-blue-950", INFO: "bg-neutral-800",
  };
  const tc: Record<AlertSeverity, string> = {
    CRITICAL: "text-red-400", HIGH: "text-amber-400", MEDIUM: "text-blue-400", INFO: "text-neutral-400",
  };
  const abbr = defectType.split(/[\s—-]+/).map(w => w[0]).join("").slice(0, 3).toUpperCase();
  return (
    <div className={cn("flex items-center justify-center rounded-[2px]", bg[severity], className)}>
      <span className={cn("text-[10px] font-black font-mono tracking-widest", tc[severity])}>{abbr}</span>
    </div>
  );
}

const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-2 bg-neutral-50 border-b border-neutral-100">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">{children}</p>
  </div>
);

// ─── Sticky Notify Footer ─────────────────────────────────────────────────────
function StickyNotifyFooter({ groups }: { groups: GroupConfig[] }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [dropOpen, setDropOpen] = useState(false);
  const [sent, setSent]         = useState(false);

  const toggle = (g: string) =>
    setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const send = () => {
    if (!selected.length) return;
    setSent(true);
    setTimeout(() => { setSent(false); setSelected([]); }, 3000);
  };

  return (
    <div className="px-4 py-3 bg-white flex items-center gap-2">
      {/* Recipient dropdown */}
      <div className="relative flex-1">
        <button
          onClick={() => setDropOpen(d => !d)}
          className="w-full h-9 px-3 flex items-center gap-2 rounded border border-neutral-200 bg-white text-[11px] text-neutral-600 hover:border-neutral-300 transition-colors"
        >
          <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="flex-1 text-left truncate">
            {selected.length === 0 ? "Select recipients" : selected.join(", ")}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        </button>
        {dropOpen && (
          <div className="absolute bottom-full left-0 right-0 mb-1 bg-white border border-neutral-200 rounded shadow-lg z-10 max-h-48 overflow-y-auto">
            {groups.map(g => (
              <label key={g.name} className="flex items-center gap-2.5 px-3 py-2 hover:bg-neutral-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selected.includes(g.name)}
                  onChange={() => toggle(g.name)}
                  className="accent-[#00775B]"
                />
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold text-neutral-800 truncate">{g.name}</p>
                  {g.emails.length > 0 && (
                    <p className="text-[9px] text-neutral-400 truncate">
                      {g.emails.length} email{g.emails.length !== 1 ? "s" : ""}
                    </p>
                  )}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Send button */}
      <button
        onClick={send}
        disabled={selected.length === 0 && !sent}
        className={cn(
          "shrink-0 h-9 px-4 rounded text-[11px] font-bold transition-colors",
          sent
            ? "bg-emerald-500 text-white"
            : selected.length > 0
            ? "bg-[#00775B] text-white hover:bg-[#006349]"
            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
        )}
      >
        {sent ? "Sent ✓" : "Notify"}
      </button>
    </div>
  );
}

// ─── Defect Detail Slide Panel ────────────────────────────────────────────────
function DefectDetailPanel({
  item,
  onClose,
  groups = [],
}: {
  item: DefectDetailItem | null;
  onClose: () => void;
  groups?: GroupConfig[];
}) {
  const isCritical = item?.severity === "CRITICAL";
  const isHigh     = item?.severity === "HIGH";
  const isMedium   = item?.severity === "MEDIUM";
  const isInfo     = item?.severity === "INFO";
  const showNotify = item ? !isInfo : false;

  // Generate evidence frame numbers from item id
  const baseNum = item
    ? (parseInt(item.id.replace(/\D/g, "") || "1") * 3201 + 19800)
    : 22001;
  const frames = [
    { num: `F#${baseNum - 8}`, isKey: false },
    { num: `F#${baseNum - 4}`, isKey: false },
    { num: `F#${baseNum}`,     isKey: true  },
    { num: `F#${baseNum + 4}`, isKey: false },
  ];

  const sevBg = isCritical ? "bg-red-600 text-white"
    : isHigh   ? "bg-amber-500 text-black"
    : isMedium ? "bg-blue-500 text-white"
    : "bg-neutral-400 text-white";

  return (
    <QualitySlidePanel
      isOpen={!!item}
      onClose={onClose}
      title={item?.source === "alert" ? "Alert Detail" : "Event Detail"}
      subtitle={item?.defectType}
      width="w-[560px]"
      footer={showNotify ? <StickyNotifyFooter groups={groups} /> : undefined}
    >
      {item && (
        <>
          {/* Hero */}
          <div className="px-6 py-5 bg-white border-b border-neutral-100 flex items-start gap-4">
            <DefectSwatch
              severity={item.severity}
              defectType={item.defectType}
              className="h-20 w-[64px] rounded-[4px] shrink-0"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-2">
                {item.label && (
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-[0.12em] px-2 py-[3px] rounded-[3px]",
                    isCritical ? "bg-red-600 text-white"
                      : isHigh ? "bg-amber-500 text-black"
                      : "bg-blue-500 text-white"
                  )}>
                    {item.label}
                  </span>
                )}
                <span className={cn(
                  "text-[9px] font-black uppercase tracking-[0.12em] px-2 py-[3px] rounded-[3px]",
                  sevBg
                )}>
                  {item.severity}
                </span>
                {isCritical && (
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                )}
              </div>
              <p className="text-[17px] font-black text-neutral-900 leading-tight">{item.defectType}</p>
              {item.eventName && (
                <p className="text-[12px] text-neutral-500 mt-1 leading-snug">{item.eventName}</p>
              )}
              <p className="text-[10px] font-mono text-neutral-400 mt-2 tabular-nums">
                {item.id} · {item.time}
              </p>
            </div>
          </div>

          {/* Evidence Frames */}
          <SectionLabel>Evidence Frames</SectionLabel>
          <div className="px-6 py-4 bg-white border-b border-neutral-50">
            <div className="flex gap-2">
              {frames.map(f => (
                <div key={f.num} className="flex-1 flex flex-col items-center gap-1">
                  <div className={cn(
                    "relative w-full rounded-[3px] overflow-hidden border",
                    f.isKey ? "border-[#00775B]" : "border-neutral-200"
                  )}>
                    <DefectSwatch
                      severity={item.severity}
                      defectType={item.defectType}
                      className="w-full h-16"
                    />
                    {f.isKey && (
                      <div className="absolute bottom-0 left-0 right-0 bg-[#00775B] text-white text-[7px] font-black uppercase tracking-widest text-center py-[2px]">
                        DETECTED
                      </div>
                    )}
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400">{f.num}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Key Details */}
          <SectionLabel>Key Details</SectionLabel>
          <div className="px-6 py-4 bg-white border-b border-neutral-50">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Zone",   value: item.zone,   icon: <MapPin     className="w-3 h-3" /> },
                { label: "Camera", value: item.camera, icon: <Activity   className="w-3 h-3" /> },
                { label: "Stage",  value: item.stage,  icon: <ShieldAlert className="w-3 h-3" /> },
                { label: "Time",   value: item.time,   icon: <Clock      className="w-3 h-3" /> },
              ].map(stat => (
                <div key={stat.label} className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-3">
                  <div className="flex items-center gap-1.5 text-neutral-400 mb-1">
                    {stat.icon}
                    <p className="text-[9px] font-bold uppercase tracking-widest">{stat.label}</p>
                  </div>
                  <p className="text-[13px] font-bold text-neutral-800 truncate">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Detection Confidence */}
          {item.confidence != null && (
            <>
              <SectionLabel>Detection Confidence</SectionLabel>
              <div className="px-6 py-4 bg-white border-b border-neutral-50">
                <div className="flex items-center justify-between rounded-[4px] border border-neutral-100 bg-neutral-50 px-4 py-3">
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">
                      AI Certainty
                    </p>
                    <p className="text-[10px] text-neutral-500">Model confidence for this detection</p>
                  </div>
                  <div className="flex items-end gap-1">
                    <span className={cn(
                      "text-[28px] font-black font-mono tabular-nums leading-none",
                      item.confidence >= 90 ? "text-emerald-600"
                        : item.confidence >= 80 ? "text-amber-500"
                        : "text-red-500"
                    )}>
                      {item.confidence.toFixed(1)}
                    </span>
                    <span className="text-[14px] font-bold text-neutral-400 mb-0.5">%</span>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Event Summary */}
          {item.description && (
            <>
              <SectionLabel>Event Summary</SectionLabel>
              <div className="px-6 py-4 bg-white">
                <div className={cn(
                  "flex items-start gap-3 rounded-[4px] border p-3.5",
                  isCritical ? "bg-red-50 border-red-200"
                    : isHigh  ? "bg-amber-50 border-amber-200"
                    : "bg-blue-50 border-blue-200"
                )}>
                  <AlertTriangle className={cn(
                    "w-4 h-4 shrink-0 mt-0.5",
                    isCritical ? "text-red-600" : isHigh ? "text-amber-600" : "text-blue-600"
                  )} />
                  <div>
                    <p className={cn(
                      "text-[12px] font-bold leading-snug",
                      isCritical ? "text-red-700" : isHigh ? "text-amber-700" : "text-blue-700"
                    )}>
                      {item.description}
                    </p>
                    <p className="text-[10px] text-neutral-500 mt-1">
                      Defect Category:{" "}
                      <span className="font-bold text-neutral-700">{item.defectType}</span>
                    </p>
                  </div>
                </div>
              </div>
            </>
          )}
        </>
      )}
    </QualitySlidePanel>
  );
}

// ─── Summary KPI Row ──────────────────────────────────────────────────────────
type KpiSeverity = "CRITICAL" | "WARNING" | "STABLE" | "INFO";

interface KpiCard {
  label: string;
  value: string;
  scope: string;
  delta: string;          // e.g. "↘ −8%"
  deltaLabel: string;     // e.g. "vs Yesterday"
  deltaPositive: boolean; // drives arrow colour
  sparkline: Array<{ v: number }>;
  severity: KpiSeverity;
}

const KPI_SEV: Record<KpiSeverity, {
  bg: string; border: string; badgeBg: string; badgeText: string;
  labelClr: string; numClr: string; scopeClr: string; divider: string; line: string;
}> = {
  CRITICAL: {
    bg: "bg-red-50",    border: "border-red-400",
    badgeBg: "bg-red-500/[0.12]",    badgeText: "text-red-600",
    labelClr: "text-neutral-800", numClr: "text-neutral-900", scopeClr: "text-neutral-400",
    divider: "bg-red-200",   line: "#EF4444",
  },
  WARNING: {
    bg: "bg-orange-50", border: "border-orange-400",
    badgeBg: "bg-orange-500/[0.12]",  badgeText: "text-orange-600",
    labelClr: "text-neutral-800", numClr: "text-neutral-900", scopeClr: "text-neutral-400",
    divider: "bg-orange-200", line: "#F97316",
  },
  STABLE: {
    bg: "bg-green-50",  border: "border-green-400",
    badgeBg: "bg-green-500/[0.12]",   badgeText: "text-green-700",
    labelClr: "text-neutral-800", numClr: "text-neutral-900", scopeClr: "text-neutral-400",
    divider: "bg-green-200",  line: "#22C55E",
  },
  INFO: {
    bg: "bg-blue-50",   border: "border-blue-400",
    badgeBg: "bg-blue-500/[0.12]",    badgeText: "text-blue-600",
    labelClr: "text-neutral-800", numClr: "text-neutral-900", scopeClr: "text-neutral-400",
    divider: "bg-blue-200",   line: "#3B82F6",
  },
};

function SummaryKPIRow({
  appData,
  activeZones,
}: {
  appData: AppMonitoringData;
  activeZones: ZoneMetric[];
  terminology: QualityTerminology;
}) {
  // ── Derived metrics ──────────────────────────────────────────────────────────
  const totalInspected  = appData.batches.length * 42 + appData.feedEvents.length * 3 + 180;
  const totalDefects    = activeZones.reduce((s, z) => s + z.defect_count, 0);
  const defectRate      = totalInspected > 0
    ? (totalDefects / totalInspected * 100)
    : 0;
  const defectDensity   = activeZones.length > 0
    ? activeZones.reduce((s, z) => s + z.defect_rate_pct, 0) / activeZones.length * 0.38
    : 0;

  // ── Severity classification ──────────────────────────────────────────────────
  const defectCountSev: KpiSeverity =
    totalDefects > 20 ? "CRITICAL" : totalDefects > 8 ? "WARNING" : "STABLE";
  const defectRateSev: KpiSeverity =
    defectRate > 3 ? "CRITICAL" : defectRate > 1 ? "WARNING" : "STABLE";
  const densitySev: KpiSeverity =
    defectDensity > 1.5 ? "CRITICAL" : defectDensity > 0.6 ? "WARNING" : "STABLE";

  // ── Sparkline data (derived from feed events rolling window) ─────────────────
  const makeSparkline = (vals: number[]) => vals.map(v => ({ v }));
  const inspSparkline = makeSparkline(
    Array.from({ length: 10 }, (_, i) => Math.round(totalInspected * (0.82 + i * 0.018 + Math.random() * 0.01)))
  );
  const defectSparkline = makeSparkline(
    Array.from({ length: 10 }, (_, i) => Math.max(0, totalDefects - (9 - i) + Math.round(Math.random() * 2)))
  );
  const rateSparkline = makeSparkline(
    Array.from({ length: 10 }, (_, i) =>
      parseFloat((defectRate - (9 - i) * 0.04 + Math.random() * 0.08).toFixed(2))
    )
  );
  const densitySparkline = makeSparkline(
    Array.from({ length: 10 }, (_, i) =>
      parseFloat((defectDensity - (9 - i) * 0.015 + Math.random() * 0.02).toFixed(3))
    )
  );

  const cards: KpiCard[] = [
    {
      label:         "Total Inspected",
      value:         totalInspected.toLocaleString(),
      scope:         "Scope: All Zones",
      delta:         "↗ +6.2%",
      deltaLabel:    "vs Yesterday",
      deltaPositive: true,
      sparkline:     inspSparkline,
      severity:      "INFO",
    },
    {
      label:         "Defect Count",
      value:         String(totalDefects),
      scope:         "Scope: All Zones",
      delta:         totalDefects > 8 ? `↗ +${Math.round(totalDefects * 0.12)}` : `↘ −${Math.round(totalDefects * 0.08)}`,
      deltaLabel:    "vs Yesterday",
      deltaPositive: totalDefects <= 8,
      sparkline:     defectSparkline,
      severity:      defectCountSev,
    },
    {
      label:         "Defect Rate",
      value:         `${defectRate.toFixed(2)}%`,
      scope:         "Scope: Current Session",
      delta:         defectRate > 1 ? `↗ +${(defectRate * 0.08).toFixed(2)}%` : `↘ −${(defectRate * 0.05).toFixed(2)}%`,
      deltaLabel:    "vs Yesterday",
      deltaPositive: defectRate <= 1,
      sparkline:     rateSparkline,
      severity:      defectRateSev,
    },
    {
      label:         "Defect Density",
      value:         `${defectDensity.toFixed(2)}%`,
      scope:         "Scope: Avg Across Zones",
      delta:         defectDensity > 0.6 ? `↗ +${(defectDensity * 0.1).toFixed(2)}%` : `↘ −${(defectDensity * 0.07).toFixed(2)}%`,
      deltaLabel:    "vs Yesterday",
      deltaPositive: defectDensity <= 0.6,
      sparkline:     densitySparkline,
      severity:      densitySev,
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {cards.map(card => {
        const s = KPI_SEV[card.severity];
        return (
          <div
            key={card.label}
            className={cn(
              "rounded-[4px] border flex flex-col overflow-hidden",
              s.bg, s.border
            )}
          >
            {/* ── Upper section ── */}
            <div className="px-4 pt-4 pb-3 flex flex-col gap-1">
              <p className={cn("text-[10px] font-black uppercase tracking-[0.1em]", s.labelClr)}>
                {card.label}
              </p>
              <p className={cn("text-[30px] font-black tabular-nums leading-none tracking-tight font-mono", s.numClr)}>
                {card.value}
              </p>
              <p className={cn("text-[10px]", s.scopeClr)}>{card.scope}</p>
            </div>

            {/* ── Divider ── */}
            <div className={cn("h-px mx-4", s.divider)} />

            {/* ── Lower section: badge + sparkline ── */}
            <div className="px-4 py-3 flex items-center gap-3">
              {/* Delta badge */}
              <div className={cn(
                "rounded-[4px] px-2.5 py-1 flex flex-col items-center shrink-0",
                s.badgeBg
              )}>
                <span className={cn("text-[10px] font-black leading-tight whitespace-nowrap", s.badgeText)}>
                  {card.delta}
                </span>
                <span className={cn("text-[8px] font-semibold leading-tight whitespace-nowrap opacity-80", s.badgeText)}>
                  {card.deltaLabel}
                </span>
              </div>

              {/* Sparkline */}
              <div className="flex-1 min-w-0">
                <ResponsiveContainer width="100%" height={32}>
                  <LineChart data={card.sparkline} margin={{ top: 2, right: 2, left: 2, bottom: 2 }}>
                    <YAxis domain={["dataMin", "dataMax"]} hide />
                    <Line
                      type="monotone"
                      dataKey="v"
                      stroke={s.line}
                      strokeWidth={1.5}
                      dot={false}
                      isAnimationActive={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ─── Priority Alert Panel — 1 row × 3 cols, paginated ───────────────────────
function AlertCardsPanel({
  alerts,
  onCardClick,
}: {
  alerts: QualityAlertCard[];
  onCardClick: (card: QualityAlertCard) => void;
}) {
  const ALERT_PAGE_SIZE = 3;
  const [alertPage, setAlertPage] = useState(0);

  const criticalCount   = alerts.filter(a => a.severity === "CRITICAL").length;
  const totalAlertPages = Math.max(1, Math.ceil(alerts.length / ALERT_PAGE_SIZE));
  const safeAlertPage   = Math.min(alertPage, totalAlertPages - 1);
  const visible         = alerts.slice(safeAlertPage * ALERT_PAGE_SIZE, (safeAlertPage + 1) * ALERT_PAGE_SIZE);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100 shrink-0">
        <Activity className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Priority Alerts</span>
        <div className="ml-auto flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white" />
              {criticalCount} CRITICAL
            </span>
          )}
          {criticalCount === 0 && alerts.length > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-amber-100 text-amber-700">
              {alerts.length} ALERTS
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        {alerts.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
            <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
            <p className="text-[12px] font-semibold">No active alerts</p>
            <p className="text-[10px]">All systems nominal</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {visible.map(a => {
              const isCritical = a.severity === "CRITICAL";
              return (
                <div
                  key={a.id}
                  onClick={() => onCardClick(a)}
                  className={cn(
                    "group rounded-[4px] overflow-hidden cursor-pointer select-none flex flex-col",
                    "transition-all hover:-translate-y-[1px] active:scale-[0.99]",
                    isCritical
                      ? "border border-red-900/30 shadow-[0_0_0_1px_rgba(220,38,38,0.08),0_2px_8px_rgba(220,38,38,0.12)]"
                      : "border border-amber-900/20 shadow-[0_0_0_1px_rgba(217,119,6,0.06),0_2px_8px_rgba(217,119,6,0.10)]",
                  )}
                >
                  {/* Alert-tinted header */}
                  <div className={cn(
                    "flex items-center gap-2 px-2.5 py-[7px] border-b",
                    isCritical ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
                  )}>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-[0.12em] px-1.5 py-[2px] rounded-[2px]",
                      isCritical ? "bg-red-600 text-white" : "bg-amber-500 text-black"
                    )}>
                      {a.label}
                    </span>
                    <div className="flex items-center gap-[3px]">
                      <span className={cn(
                        "w-[5px] h-[5px] rounded-full",
                        isCritical ? "bg-red-500 animate-pulse" : "bg-amber-500"
                      )} />
                      <span className={cn(
                        "text-[8px] font-bold uppercase tracking-wide",
                        isCritical ? "text-red-700" : "text-amber-700"
                      )}>
                        {a.severity}
                      </span>
                    </div>
                    <span className={cn(
                      "ml-auto text-[8px] font-mono tabular-nums",
                      isCritical ? "text-red-400" : "text-amber-500"
                    )}>{a.time.slice(0, 5)}</span>
                  </div>

                  {/* Body */}
                  <div className="bg-white flex gap-2.5 px-2.5 pt-2.5 pb-2">
                    <div className="shrink-0 rounded-[2px] overflow-hidden">
                      <DefectSwatch severity={a.severity} defectType={a.defectType} className="h-[68px] w-[52px]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black text-neutral-900 truncate leading-tight">{a.defectType}</p>
                      <div className="flex items-center gap-1 mt-[3px] mb-2">
                        <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                        <p className="text-[9px] font-mono text-neutral-400 truncate">{a.stage}</p>
                      </div>
                      <p className={cn(
                        "text-[9px] font-semibold",
                        isCritical ? "text-red-600" : "text-amber-700"
                      )}>
                        {a.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-auto bg-neutral-50 border-t border-neutral-100 flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-[8px] font-mono text-neutral-400 tracking-wide">{a.camera}</span>
                    <button className={cn(
                      "h-5 px-2 rounded-[2px] text-[8px] font-black uppercase tracking-wide flex items-center gap-0.5 transition-colors",
                      isCritical
                        ? "bg-red-600 text-white hover:bg-red-700"
                        : "bg-amber-500 text-white hover:bg-amber-600"
                    )}>
                      Act <ChevronRight className="w-2 h-2" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Pagination footer — matches WatchlistPanel style */}
      {totalAlertPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neutral-100 bg-neutral-50 relative">
          {/* PREV */}
          <button
            onClick={() => setAlertPage(p => Math.max(0, p - 1))}
            disabled={safeAlertPage === 0}
            className="flex items-center gap-1 h-6 px-2.5 rounded border border-neutral-200 bg-white text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> PREV
          </button>

          {/* Smart page numbers */}
          <div className="flex items-center gap-0.5">
            {getPaginationItems(safeAlertPage, totalAlertPages).map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} className="h-6 w-6 flex items-center justify-center text-[10px] text-neutral-400 select-none">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setAlertPage(item)}
                  className={cn(
                    "h-6 w-6 rounded text-[10px] font-bold transition-colors",
                    item === safeAlertPage ? "bg-[#00775B] text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-100"
                  )}
                >
                  {item + 1}
                </button>
              )
            )}
          </div>

          {/* NEXT */}
          <button
            onClick={() => setAlertPage(p => Math.min(totalAlertPages - 1, p + 1))}
            disabled={safeAlertPage === totalAlertPages - 1}
            className="flex items-center gap-1 h-6 px-2.5 rounded bg-[#00775B] text-[10px] font-bold text-white hover:bg-[#006349] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            NEXT <ChevronRight className="w-3 h-3" />
          </button>

          {/* Count — absolute right */}
          <span className="absolute right-4 text-[10px] text-neutral-400">
            Showing <strong className="text-neutral-700">{safeAlertPage * ALERT_PAGE_SIZE + 1}–{Math.min((safeAlertPage + 1) * ALERT_PAGE_SIZE, alerts.length)}</strong> of <strong className="text-neutral-700">{alerts.length}</strong> alerts
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Batch Status Panel (sidebar) ────────────────────────────────────────────
function BatchStatusPanel({ batches, entityLabel }: { batches: BatchEntry[]; entityLabel: string }) {
  const passCount     = batches.filter(b => b.pass).length;
  const failCount     = batches.length - passCount;
  const passRate      = Math.round((passCount / batches.length) * 100);
  const failedBatches = batches.filter(b => !b.pass);

  return (
    <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm p-3 shrink-0">
      <div className="flex items-center gap-1.5 mb-3">
        <Package className="w-3 h-3 text-[#00775B]" />
        <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
          {entityLabel} Pass / Fail
        </span>
      </div>
      <div className="flex items-center gap-3 mb-3">
        <div>
          <p className="text-2xl font-black font-mono text-neutral-900 leading-none">{passRate}%</p>
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-0.5">
            Pass rate · Last {batches.length}
          </p>
        </div>
        <div className="ml-auto flex flex-col gap-1 items-end">
          <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-700">
            <CheckCircle2 className="w-3 h-3" />{passCount} Pass
          </span>
          <span className="flex items-center gap-1 text-[10px] font-bold text-red-600">
            <XCircle className="w-3 h-3" />{failCount} Fail
          </span>
        </div>
      </div>
      <div className="flex gap-0.5 mb-2">
        {batches.map(b => (
          <div
            key={b.id}
            title={b.pass ? `${b.id} — Pass` : `${b.id} — Fail (${b.defectCount} defects)`}
            className={cn("flex-1 h-6 rounded-[2px] flex items-center justify-center", b.pass ? "bg-emerald-100" : "bg-red-100")}
          >
            <span className={cn("text-[9px] font-black", b.pass ? "text-emerald-600" : "text-red-600")}>
              {b.pass ? "✓" : "✗"}
            </span>
          </div>
        ))}
      </div>
      <div className="h-1.5 rounded-full overflow-hidden bg-neutral-100 mb-3">
        <div className="h-full bg-emerald-500 rounded-full transition-all" style={{ width: `${passRate}%` }} />
      </div>
      {failedBatches.length > 0 && (
        <div>
          <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-1.5">Failed Units</p>
          <div className="space-y-1">
            {failedBatches.map(b => (
              <div key={b.id} className="flex items-center justify-between px-2 py-1.5 rounded-[3px] bg-red-50 border border-red-100">
                <span className="text-[10px] font-bold font-mono text-neutral-800 truncate">{b.id}</span>
                <span className="text-[9px] font-bold text-red-600 shrink-0 ml-2">{b.defectCount} defect{b.defectCount !== 1 ? "s" : ""}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Feed Table Row ────────────────────────────────────────────────────────────
function FeedTableRow({
  event,
  rowIndex,
  onRowClick,
}: {
  event: QualityFeedEvent;
  rowIndex: number;
  onRowClick: (event: QualityFeedEvent, rowId: string) => void;
}) {
  const cfg        = SEV_CFG[event.severity];
  const isCritical = event.severity === "CRITICAL";
  const isHigh     = event.severity === "HIGH";
  const rowId      = `EVT-${String(rowIndex + 1).padStart(3, "0")}`;

  return (
    <tr
      onClick={() => onRowClick(event, rowId)}
      className={cn(
        "group cursor-pointer transition-colors border-b border-neutral-100 last:border-b-0",
        "hover:bg-[#E5FFF9]",
        isCritical && rowIndex === 0 && "bg-red-50/40",
      )}
    >
      <td className="px-3 py-2">
        <span className="text-[10px] font-mono font-bold text-neutral-500">{rowId}</span>
      </td>
      <td className="px-3 py-2">
        <DefectSwatch severity={event.severity} defectType={event.defectType} className="h-10 w-[60px]" />
      </td>
      <td className="px-3 py-2 max-w-[180px]">
        <p className="text-[11px] font-bold text-neutral-900 truncate leading-tight">{event.eventName}</p>
        <p className={cn(
          "text-[9px] truncate mt-0.5 leading-snug",
          (isCritical || isHigh) ? "text-red-600 font-semibold" : "text-neutral-400"
        )}>
          {event.defectType}
        </p>
      </td>
      <td className="px-3 py-2">
        <span className={cn(
          "text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide whitespace-nowrap",
          cfg.bg, cfg.text,
          isCritical && "animate-pulse"
        )}>
          {event.severity}
        </span>
      </td>
      <td className="px-3 py-2">
        <p className="text-[11px] font-semibold text-neutral-700 truncate">{event.zone}</p>
      </td>
      <td className="px-3 py-2">
        <p className="text-[11px] font-mono text-neutral-600">{event.camera}</p>
      </td>
      <td className="px-3 py-2">
        <p className="text-[10px] text-neutral-500 truncate">{event.stage}</p>
      </td>
      <td className="px-3 py-2 text-right">
        {event.confidence != null ? (
          <span className={cn(
            "text-[11px] font-mono font-bold tabular-nums",
            event.confidence >= 90 ? "text-emerald-600" : "text-amber-500"
          )}>
            {event.confidence.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[11px] text-neutral-300 font-mono">—</span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        <span className="text-[10px] font-mono text-neutral-500">{event.time}</span>
      </td>
    </tr>
  );
}

// ─── Batch severity helper ────────────────────────────────────────────────────
type BatchSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "CLEAR";
function getBatchSeverity(b: BatchEntry): BatchSeverity {
  if (!b.pass && b.defectCount >= 3) return "CRITICAL";
  if (!b.pass)                        return "HIGH";
  if (b.defectCount >= 2)             return "MEDIUM";
  if (b.defectCount >= 1)             return "LOW";
  return "CLEAR";
}
const BATCH_SEV_ORDER: Record<BatchSeverity, number> = { CRITICAL: 0, HIGH: 1, MEDIUM: 2, LOW: 3, CLEAR: 4 };

// ─── Zone Detail Slide Panel ──────────────────────────────────────────────────
function QualityZoneDetailPanel({
  zone,
  onClose,
  feedEvents,
  batches,
  terminology,
  groups = [],
}: {
  zone: ZoneMetric | null;
  onClose: () => void;
  feedEvents: QualityFeedEvent[];
  batches: BatchEntry[];
  terminology: QualityTerminology;
  groups?: GroupConfig[];
}) {
  // Match feed events to this zone by prefix
  const zonePrefix = zone?.zone_name.split(" —")[0].toLowerCase() ?? "";
  const zoneEvents = feedEvents.filter(e =>
    e.zone.toLowerCase().includes(zonePrefix) ||
    zonePrefix.includes(e.zone.toLowerCase())
  );

  // Filter batches to this zone using the zone field
  const shortZoneName = zone?.zone_name.split(" —")[0] ?? "";
  const zoneBatches = batches
    .filter(b => b.zone === shortZoneName)
    .sort((a, b) => BATCH_SEV_ORDER[getBatchSeverity(a)] - BATCH_SEV_ORDER[getBatchSeverity(b)]);

  // Tally defect types (exclude pass/rework events)
  const typeCounts: Record<string, number> = {};
  zoneEvents.forEach(e => {
    if (e.defectType !== "Batch Status" && e.defectType !== "Rework") {
      typeCounts[e.defectType] = (typeCounts[e.defectType] || 0) + 1;
    }
  });
  const topEntry      = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];
  const topDefectType = topEntry?.[0] ?? "—";
  const topDefectCount = topEntry?.[1] ?? 0;

  const criticalEvents = zoneEvents.filter(e => e.severity === "CRITICAL" || e.severity === "HIGH");
  const recentEvents   = zoneEvents.slice(0, 5);
  const showNotify     = zone?.status !== "GREEN";

  const STATUS_DISPLAY: Record<string, string> = {
    HIGH_RISK: "CRITICAL",
    WATCH:     "WARNING",
    AMBER:     "MONITOR",
    GREEN:     "GOOD",
  };
  const statusLabel = STATUS_DISPLAY[zone?.status ?? ""] ?? (zone?.status ?? "").replace("_", " ");
  const statusBg = zone?.status === "HIGH_RISK" ? "bg-red-600 text-white"
    : zone?.status === "WATCH"    ? "bg-orange-500 text-white"
    : zone?.status === "AMBER"    ? "bg-amber-500 text-black"
    : "bg-emerald-600 text-white";
  const dotCls = zone?.status === "HIGH_RISK" ? "bg-red-500 animate-pulse"
    : zone?.status === "WATCH"    ? "bg-orange-400"
    : zone?.status === "AMBER"    ? "bg-amber-400"
    : "bg-emerald-500";

  return (
    <QualitySlidePanel
      isOpen={!!zone}
      onClose={onClose}
      title="Zone Detail"
      subtitle={zone?.zone_name}
      width="w-[480px]"
      footer={showNotify && zone ? <StickyNotifyFooter groups={groups} /> : undefined}
    >
      {zone && (
        <>
          {/* Hero */}
          <div className="px-6 py-5 bg-white border-b border-neutral-100">
            <div className="flex items-center gap-3 mb-4">
              <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotCls)} />
              <h4 className="text-[16px] font-black text-neutral-900 flex-1 min-w-0 truncate">
                {zone.zone_name.split(" —")[0]}
              </h4>
              <span className={cn(
                "text-[9px] font-black uppercase tracking-[0.12em] px-2 py-1 rounded-[3px] shrink-0",
                statusBg
              )}>
                {statusLabel}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                {
                  label: "Quality Rate",
                  value: `${zone.compliance_pct.toFixed(0)}%`,
                  color: zone.compliance_pct >= 90 ? "text-emerald-600"
                    : zone.compliance_pct >= 80 ? "text-amber-500" : "text-red-600",
                },
                {
                  label: terminology.negativeCountLabel,
                  value: `${zone.violation_count}`,
                  color: zone.violation_count > 0 ? "text-red-600" : "text-emerald-600",
                },
                {
                  label: "High+ Events",
                  value: `${criticalEvents.length}`,
                  color: criticalEvents.length > 0 ? "text-amber-600" : "text-emerald-600",
                },
              ].map(s => (
                <div key={s.label} className="rounded-[4px] border border-neutral-100 bg-neutral-50 p-3 text-center">
                  <p className={cn("text-[22px] font-black tabular-nums leading-none", s.color)}>{s.value}</p>
                  <p className="text-[8px] font-bold uppercase tracking-widest text-neutral-400 mt-1 leading-tight">{s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Top Defect Type */}
          <SectionLabel>Top Defect Type</SectionLabel>
          <div className="px-6 py-4 bg-white border-b border-neutral-50">
            {topDefectType !== "—" ? (
              <div className="flex items-center gap-3 rounded-[4px] border border-neutral-100 bg-neutral-50 px-4 py-3">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <p className="text-[13px] font-bold text-neutral-800 flex-1 min-w-0 truncate">
                  {topDefectType}
                </p>
                <span className="text-[10px] font-mono text-neutral-400 shrink-0">
                  {topDefectCount} event{topDefectCount !== 1 ? "s" : ""}
                </span>
              </div>
            ) : (
              <p className="text-[12px] text-neutral-400 text-center py-2">
                No defect data for this zone
              </p>
            )}
          </div>

          {/* Batch Status */}
          <SectionLabel>Batch Status</SectionLabel>
          <div className="px-6 py-4 bg-white border-b border-neutral-50">
            {zoneBatches.length === 0 ? (
              <p className="text-[12px] text-neutral-400 text-center py-2">No batch data for this zone</p>
            ) : (
              <>
                {/* Summary row */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[22px] font-black tabular-nums text-neutral-900 leading-none">
                    {zoneBatches.filter(b => b.pass).length}/{zoneBatches.length}
                  </span>
                  <div>
                    <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">batches passed</p>
                    <p className="text-[9px] text-neutral-400">
                      {zoneBatches.filter(b => !b.pass).length} failed · {zoneBatches.reduce((s, b) => s + b.defectCount, 0)} total defects
                    </p>
                  </div>
                  <div className="ml-auto flex flex-col items-end gap-1">
                    <div className="flex gap-[2px]">
                      {zoneBatches.map(b => (
                        <div
                          key={b.id}
                          title={b.pass ? `${b.id} — Pass` : `${b.id} — Fail (${b.defectCount} defects)`}
                          className={cn(
                            "w-3 h-4 rounded-[2px]",
                            b.pass ? "bg-emerald-400" : "bg-red-400"
                          )}
                        />
                      ))}
                    </div>
                    <p className="text-[8px] font-mono text-neutral-400">
                      {Math.round((zoneBatches.filter(b => b.pass).length / zoneBatches.length) * 100)}% pass rate
                    </p>
                  </div>
                </div>
                {/* Batch rows sorted by severity */}
                <div className="space-y-1.5">
                  {zoneBatches.map(b => {
                    const sev = getBatchSeverity(b);
                    const sevColors: Record<BatchSeverity, { border: string; badge: string }> = {
                      CRITICAL: { border: "border-l-red-500",    badge: "bg-red-100 text-red-700"     },
                      HIGH:     { border: "border-l-orange-400", badge: "bg-orange-100 text-orange-700"},
                      MEDIUM:   { border: "border-l-amber-400",  badge: "bg-amber-100 text-amber-700" },
                      LOW:      { border: "border-l-blue-400",   badge: "bg-blue-50 text-blue-700"    },
                      CLEAR:    { border: "border-l-emerald-500",badge: "bg-emerald-100 text-emerald-700"},
                    };
                    const c = sevColors[sev];
                    return (
                      <div
                        key={b.id}
                        className={cn(
                          "flex items-center gap-2.5 rounded-[4px] border border-neutral-100 border-l-[3px] px-3 py-2",
                          c.border,
                          !b.pass ? "bg-red-50/40" : "bg-neutral-50"
                        )}
                      >
                        {b.pass
                          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                          : <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        }
                        <span className="text-[11px] font-bold font-mono text-neutral-800 flex-1 truncate">{b.id}</span>
                        {b.defectType && (
                          <span className="text-[9px] text-neutral-400 truncate max-w-[90px]">{b.defectType}</span>
                        )}
                        <span className={cn(
                          "shrink-0 text-[7px] font-black uppercase tracking-widest px-1.5 py-[2px] rounded-[2px]",
                          c.badge
                        )}>
                          {sev === "CLEAR" ? "PASS" : sev}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

          {/* Recent Events */}
          <SectionLabel>Recent Events in Zone</SectionLabel>
          <div className="px-6 py-4 bg-white">
            {recentEvents.length > 0 ? (
              <div className="space-y-2">
                {recentEvents.map(e => {
                  const cfg = SEV_CFG[e.severity];
                  return (
                    <div
                      key={e.id}
                      className="flex items-center gap-3 rounded-[4px] border border-neutral-100 bg-neutral-50 px-3 py-2.5"
                    >
                      <span className={cn(
                        "text-[8px] font-black uppercase px-1.5 py-[2px] rounded-[2px] shrink-0 whitespace-nowrap",
                        cfg.bg, cfg.text
                      )}>
                        {e.severity}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-[11px] font-bold text-neutral-800 truncate">{e.eventName}</p>
                        <p className="text-[9px] text-neutral-400 truncate">{e.defectType}</p>
                      </div>
                      <span className="text-[9px] font-mono text-neutral-400 shrink-0">{e.time}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-6">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
                <p className="text-[12px] font-semibold text-neutral-600">No recent events in this zone</p>
              </div>
            )}
          </div>
        </>
      )}
    </QualitySlidePanel>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────
interface Props {
  terminology: QualityTerminology;
  timeRange: string;
  appId: string;
  groups?: GroupConfig[];
}

export const MonitoringView = ({ terminology, appId, groups = [] }: Props) => {
  const appData    = APP_DATA[appId] ?? DEFAULT_DATA;
  const activeZones = ZONE_DATA;

  const PAGE_SIZE      = 8;
  const ZONE_PAGE_SIZE = 8;

  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");
  const [page,       setPage]       = useState(0);
  const [zonePage,   setZonePage]   = useState(0);

  // Slide panel state
  const [selectedDefect, setSelectedDefect] = useState<DefectDetailItem | null>(null);
  const [selectedZone,   setSelectedZone]   = useState<ZoneMetric | null>(null);

  // Reset feed page when app changes
  const [prevAppId, setPrevAppId] = useState(appId);
  if (prevAppId !== appId) { setPrevAppId(appId); setPage(0); setFeedFilter("all"); }

  // Zone pagination — sorted HIGH_RISK → WATCH → AMBER → GREEN
  const ZONE_SEVERITY_ORDER: Record<string, number> = { HIGH_RISK: 0, WATCH: 1, AMBER: 2, GREEN: 3 };
  const sortedZones  = [...activeZones].sort((a, b) =>
    (ZONE_SEVERITY_ORDER[a.status] ?? 9) - (ZONE_SEVERITY_ORDER[b.status] ?? 9)
  );
  const totalZones   = sortedZones.length;
  const zonePages    = Math.max(1, Math.ceil(totalZones / ZONE_PAGE_SIZE));
  const safeZonePage = Math.min(zonePage, zonePages - 1);
  const pagedZones   = sortedZones.slice(safeZonePage * ZONE_PAGE_SIZE, (safeZonePage + 1) * ZONE_PAGE_SIZE);

  // Feed filtering + pagination
  const filtered = appData.feedEvents.filter(e => {
    if (feedFilter === "critical") return e.severity === "CRITICAL";
    if (feedFilter === "high")     return e.severity === "HIGH";
    if (feedFilter === "medium")   return e.severity === "MEDIUM";
    if (feedFilter === "info")     return e.severity === "INFO";
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const paged      = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  // Status bar
  const criticalCount = appData.alertCards.filter(a => a.severity === "CRITICAL").length;
  const highCount     = appData.alertCards.filter(a => a.severity === "HIGH").length;
  const passCount     = appData.batches.filter(b => b.pass).length;
  const passRate      = Math.round((passCount / appData.batches.length) * 100);
  const highRiskZones = ZONE_DATA.filter(z => z.status === "HIGH_RISK").length;

  const systemColor = criticalCount > 0 ? "text-red-600" : highCount > 0 ? "text-amber-600" : "text-emerald-700";
  const systemLabel = criticalCount > 0 ? "CRITICAL" : highCount > 0 ? "WARNING" : "GOOD";

  const FEED_FILTERS: { key: FeedFilter; label: string; count: number }[] = [
    { key: "all",      label: "All",      count: appData.feedEvents.length },
    { key: "critical", label: "Critical", count: appData.feedEvents.filter(e => e.severity === "CRITICAL").length },
    { key: "high",     label: "High",     count: appData.feedEvents.filter(e => e.severity === "HIGH").length },
    { key: "medium",   label: "Medium",   count: appData.feedEvents.filter(e => e.severity === "MEDIUM").length },
    { key: "info",     label: "Info",     count: appData.feedEvents.filter(e => e.severity === "INFO").length },
  ];

  return (
    <>
      <div className="flex flex-col gap-3">

        {/* ── Status Bar ────────────────────────────────────────────────────── */}
        <div className="bg-[#e5f5ef] rounded-[4px] px-4 py-2.5 flex items-center gap-4 flex-wrap border border-[#00775B]/15">
          {[
            { label: "Pass Rate",         value: `${passRate}%`,               color: passRate < 80 ? "text-red-600 font-black" : "text-neutral-800" },
            { label: "Active Defects",    value: `${criticalCount + highCount}`,color: (criticalCount + highCount) > 0 ? "text-red-600 font-black" : "text-neutral-800" },
            { label: "High-Risk Zones",   value: `${highRiskZones}`,           color: highRiskZones > 0 ? "text-amber-600" : "text-neutral-800" },
            { label: "Batches Monitored", value: `${appData.batches.length}`,  color: "text-neutral-800" },
          ].map(s => (
            <div key={s.label} className="flex items-center gap-1.5">
              <span className="text-[9px] text-neutral-500 uppercase tracking-wider">{s.label}</span>
              <span className={cn("text-[11px] font-mono font-bold", s.color)}>{s.value}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2">
            <div className="w-px h-4 bg-[#00775B]/20" />
            <span className={cn("w-2 h-2 rounded-full animate-pulse",
              criticalCount > 0 ? "bg-red-500" : highCount > 0 ? "bg-amber-500" : "bg-emerald-500"
            )} />
            <span className={cn("text-[10px] font-black uppercase tracking-widest", systemColor)}>{systemLabel}</span>
          </div>
        </div>

        {/* ── KPI Summary Cards ─────────────────────────────────────────────── */}
        <SummaryKPIRow
          appData={appData}
          activeZones={activeZones}
          terminology={terminology}
        />

        {/* ── Row 1: 70/30 grid ────────────────────────────────────────────── */}
        <div className="grid gap-3" style={{ gridTemplateColumns: "70% 1fr", minWidth: 640 }}>

          {/* Priority Alerts (70%) */}
          <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden h-full flex flex-col">
            <AlertCardsPanel
              alerts={appData.alertCards}
              onCardClick={(card) => setSelectedDefect(alertToDetail(card))}
            />
          </div>

          {/* RIGHT: Zone Status */}
          <div className="flex flex-col h-full">

            {/* Batch pass/fail — hidden; shown in zone slider instead */}
            {/* <BatchStatusPanel batches={appData.batches} entityLabel={terminology.entityLabel} /> */}

            {/* Zone status — clickable cards */}
            <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex-1 flex flex-col">
              {/* Header — no pagination clutter */}
              <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-neutral-50 shrink-0">
                <MapPin className="w-3.5 h-3.5 text-[#00775B]" />
                <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Zone Status</span>
                <span className="ml-auto text-[9px] font-mono text-neutral-400">{totalZones} zones</span>
              </div>

              {/* Zone cards grid */}
              <div className="p-2 grid grid-cols-2 gap-1.5 flex-1 content-start overflow-y-auto">
                {pagedZones.map(zone => {
                  const color = zone.status === "HIGH_RISK" ? "bg-red-50 border-red-300 text-red-700"
                    : zone.status === "WATCH" ? "bg-orange-50 border-orange-200 text-orange-700"
                    : zone.status === "AMBER" ? "bg-amber-50 border-amber-300 text-amber-700"
                    : "bg-emerald-50 border-emerald-200 text-emerald-700";
                  const dot = zone.status === "HIGH_RISK" ? "bg-red-600 animate-pulse"
                    : zone.status === "WATCH" ? "bg-orange-500"
                    : zone.status === "AMBER" ? "bg-amber-500"
                    : "bg-emerald-600";
                  const shortName = zone.zone_name.replace(/ —.*/, "");
                  return (
                    <button
                      key={zone.zone_id}
                      onClick={() => setSelectedZone(zone)}
                      className={cn(
                        "rounded-[3px] border px-2 py-1.5 text-left transition-all",
                        "hover:shadow-sm hover:scale-[1.01] active:scale-[0.99]",
                        color
                      )}
                    >
                      <div className="flex items-center gap-1 mb-0.5">
                        <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                        <span className="text-[9px] font-bold truncate">{shortName}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[8px] font-mono opacity-70">
                        <span>{zone.compliance_pct.toFixed(0)}%</span>
                        {zone.violation_count > 0 && <span>{zone.violation_count} defects</span>}
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Dot pagination with chevrons — only when multiple pages */}
              {zonePages > 1 && (
                <div className="flex items-center justify-center gap-2 py-2.5 border-t border-neutral-50 shrink-0">
                  <button
                    onClick={() => setZonePage(p => Math.max(0, p - 1))}
                    disabled={safeZonePage === 0}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-3 h-3 text-neutral-500" />
                  </button>
                  <div className="flex items-center gap-1.5">
                    {Array.from({ length: zonePages }, (_, i) => (
                      <button
                        key={i}
                        onClick={() => setZonePage(i)}
                        className={cn(
                          "rounded-full transition-all duration-200",
                          i === safeZonePage
                            ? "w-4 h-[6px] bg-[#00775B]"
                            : "w-[6px] h-[6px] bg-neutral-200 hover:bg-neutral-400"
                        )}
                      />
                    ))}
                  </div>
                  <button
                    onClick={() => setZonePage(p => Math.min(zonePages - 1, p + 1))}
                    disabled={safeZonePage === zonePages - 1}
                    className="w-5 h-5 flex items-center justify-center rounded hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-3 h-3 text-neutral-500" />
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* ── Row 2: Live Feed — full width ─────────────────────────────────── */}
        <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col">

          {/* Header + filters */}
          <div className="px-4 py-2.5 border-b border-neutral-100 shrink-0 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-[#00775B]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-600">Live Feed</span>
            </div>
            <div className="flex items-center gap-1 ml-auto flex-wrap">
              {FEED_FILTERS.map(f => (
                <button
                  key={f.key}
                  onClick={() => { setFeedFilter(f.key); setPage(0); }}
                  className={cn(
                    "h-6 px-2 rounded-[3px] text-[9px] font-bold transition-colors whitespace-nowrap",
                    feedFilter === f.key
                      ? f.key === "critical" ? "bg-red-600 text-white" : "bg-[#00775B] text-white"
                      : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200"
                  )}
                >
                  {f.label}{f.count > 0 ? ` (${f.count})` : ""}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="flex-1 overflow-auto">
            {filtered.length === 0 ? (
              <div className="py-12 text-center text-[11px] text-neutral-400">No events</div>
            ) : (
              <DataGrid<QualityFeedEvent>
                data={paged}
                onRowClick={(event) => {
                  const i = paged.findIndex(e => e.id === event.id);
                  setSelectedDefect(feedToDetail(event, `EVT-${String(safePage * PAGE_SIZE + i + 1).padStart(3, "0")}`));
                }}
                columns={[
                  {
                    key: "id",
                    header: "ID",
                    width: "64px",
                    render: (_e, hovered) => {
                      const i = paged.findIndex(x => x.id === _e.id);
                      const rowId = `EVT-${String(safePage * PAGE_SIZE + i + 1).padStart(3, "0")}`;
                      return <MonoCell hovered={hovered} isPrimary fontSize={10}>{rowId}</MonoCell>;
                    },
                  },
                  {
                    key: "snapshot",
                    header: "Snapshot",
                    width: "72px",
                    render: (e) => (
                      <DefectSwatch severity={e.severity} defectType={e.defectType} className="h-10 w-[60px]" />
                    ),
                  },
                  {
                    key: "event",
                    header: "Event",
                    width: "1fr",
                    render: (e, hovered) => {
                      const isCritical = e.severity === "CRITICAL";
                      const isHigh = e.severity === "HIGH";
                      return (
                        <div>
                          <InterCell hovered={hovered} isPrimary fontSize={11}>{e.eventName}</InterCell>
                          <div className={cn(
                            "text-[9px] truncate mt-0.5 leading-snug",
                            (isCritical || isHigh) ? "text-red-600 font-semibold" : "text-neutral-400"
                          )}>
                            {e.defectType}
                          </div>
                        </div>
                      );
                    },
                  },
                  {
                    key: "severity",
                    header: "Severity",
                    width: "88px",
                    render: (e) => <StatusCapsule status={e.severity.toLowerCase()} />,
                  },
                  {
                    key: "zone",
                    header: "Zone",
                    width: "100px",
                    render: (e, hovered) => (
                      <InterCell hovered={hovered} fontSize={11}>{e.zone}</InterCell>
                    ),
                  },
                  {
                    key: "camera",
                    header: "Camera",
                    width: "100px",
                    render: (e, hovered) => (
                      <MonoCell hovered={hovered} fontSize={11}>{e.camera}</MonoCell>
                    ),
                  },
                  {
                    key: "stage",
                    header: "Stage",
                    width: "100px",
                    render: (e, hovered) => (
                      <InterCell hovered={hovered} fontSize={10} color="#64748B">{e.stage}</InterCell>
                    ),
                  },
                  {
                    key: "confidence",
                    header: "Conf %",
                    width: "72px",
                    align: "right",
                    render: (e, hovered) => e.confidence != null ? (
                      <MonoCell
                        hovered={hovered}
                        isPrimary
                        color={e.confidence >= 90 ? "#059669" : "#F59E0B"}
                        hoveredColor={e.confidence >= 90 ? "#059669" : "#F59E0B"}
                        fontSize={11}
                      >
                        {e.confidence.toFixed(1)}%
                      </MonoCell>
                    ) : (
                      <MonoCell hovered={hovered} fontSize={11} color="#CBD5E1">—</MonoCell>
                    ),
                  },
                  {
                    key: "time",
                    header: "Time",
                    width: "80px",
                    align: "right",
                    render: (e, hovered) => (
                      <MonoCell hovered={hovered} fontSize={10} color="#64748B">{e.time}</MonoCell>
                    ),
                  },
                ]}
                emptyState="No events"
              />
            )}
          </div>

          {/* Pagination footer */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neutral-100 bg-neutral-50 shrink-0 relative">
              <button
                onClick={() => setPage(p => Math.max(0, p - 1))}
                disabled={safePage === 0}
                className="flex items-center gap-1 h-6 px-2.5 rounded border border-neutral-200 bg-white text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-3 h-3" /> PREV
              </button>
              <div className="flex items-center gap-0.5">
                {getPaginationItems(safePage, totalPages).map((item, idx) =>
                  item === "…" ? (
                    <span key={`el-${idx}`} className="h-6 w-6 flex items-center justify-center text-[10px] text-neutral-400 select-none">…</span>
                  ) : (
                    <button
                      key={item}
                      onClick={() => setPage(item)}
                      className={cn(
                        "h-6 w-6 rounded text-[10px] font-bold transition-colors",
                        item === safePage ? "bg-[#00775B] text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-100"
                      )}
                    >
                      {item + 1}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                disabled={safePage === totalPages - 1}
                className="flex items-center gap-1 h-6 px-2.5 rounded bg-[#00775B] text-[10px] font-bold text-white hover:bg-[#006349] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
              >
                NEXT <ChevronRight className="w-3 h-3" />
              </button>
              <span className="absolute right-4 text-[10px] text-neutral-400">
                Showing{" "}
                <strong className="text-neutral-700">
                  {safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}
                </strong>{" "}
                of <strong className="text-neutral-700">{filtered.length}</strong> events
              </span>
            </div>
          )}
        </div>

      </div>

      {/* ── Slide Panels ─────────────────────────────────────────────────────── */}
      <DefectDetailPanel
        item={selectedDefect}
        onClose={() => setSelectedDefect(null)}
        groups={groups}
      />
      <QualityZoneDetailPanel
        zone={selectedZone}
        onClose={() => setSelectedZone(null)}
        feedEvents={appData.feedEvents}
        batches={appData.batches}
        terminology={terminology}
        groups={groups}
      />
    </>
  );
};
