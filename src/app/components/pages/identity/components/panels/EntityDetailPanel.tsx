import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidePanel } from "./SlidePanel";
import { cn } from "@/app/lib/utils";
import {
  ShieldAlert, Star, User, Camera, Car,
  CheckCircle2, AlertTriangle,
  UserPlus, Eye, Mail, X,
  Navigation, ChevronDown,
} from "lucide-react";

// ─── Face entity types ────────────────────────────────────────────────────────
interface SightingEntry {
  timestamp: string; camera_label: string; camera_id: string;
  confidence: number; duration_sec: number; alerts: string[];
  is_current?: boolean; seed: string; linked_lpr?: string;
}
interface JourneyStop {
  seq: number; camera: string; camera_id: string; time: string;
  confidence: number; duration: number; direction: string;
  alerts: string[]; lpr?: string;
}
interface PanelEntity {
  id: string; tracker_id: number;
  match_status: "MATCHED" | "UNMATCHED";
  display_name: string; initials: string; photo_url?: string;
  list_membership: "WHITELIST" | "BLACKLIST" | "VIP" | "UNKNOWN";
  metadata?: { employee_id: string; department: string; access_level: string };
  vip_info?: { title: string; protocol: string; escort: boolean };
  last_detection: {
    timestamp: string; camera_id: string; camera_label: string;
    match_confidence: number; detection_confidence: number;
    duration_in_frame_sec: number; frame_number: string;
  };
  enrollment?: { enrolled_date: string; enrolled_by: string; last_seen_before: string; total_appearances: number; monthly_appearances: number };
  recognition_attempt?: { best_match_score: number; threshold: number; possible_reasons: string[] };
  appearance_summary?: { total_appearances: number; days_seen: number; cameras_seen: string[]; avg_dwell_sec: number; typical_time_window: string; recurring_badge: boolean };
  sighting_history: { today: SightingEntry[]; yesterday: SightingEntry[] };
  journey: JourneyStop[];
  journey_transit: string[];
  journey_summary: { start_time: string; end_time: string; total_duration_min: number };
}

// ─── Vehicle entity types ─────────────────────────────────────────────────────
interface VehicleSighting {
  timestamp: string; camera_label: string; camera_id: string;
  confidence: number; entry_status?: string; alerts: string[]; is_current?: boolean;
}
interface VehicleJourneyStop {
  seq: number; camera: string; camera_id: string; time: string;
  confidence: number; direction: string; entry_status?: string; alerts: string[];
}
interface VehiclePanelEntity {
  id: string;
  plate: string; vehicleDesc: string;
  list_membership: "WHITELIST" | "BLACKLIST" | "VIP" | "UNKNOWN";
  owner?: { name: string; employee_id: string; department: string; access_level: string };
  bolo_notes?: string[];
  vip_info?: { protocol: string; valet: boolean };
  permit?: { permit_id: string; valid_until: string; zone: string; enrolled_date: string };
  last_detection: {
    timestamp: string; camera_id: string; camera_label: string;
    confidence: number; entry_status?: string;
  };
  sighting_history: { today: VehicleSighting[]; yesterday: VehicleSighting[] };
  journey: VehicleJourneyStop[];
  journey_transit: string[];
  journey_summary: { start_time: string; end_time: string; total_duration_min: number };
}

// ─── Face entity registry ─────────────────────────────────────────────────────
export const PANEL_ENTITIES: Record<string, PanelEntity> = {
  f1: {
    id: "f1", tracker_id: 3, match_status: "MATCHED",
    display_name: "Marcus Webb", initials: "MW",
    photo_url: "https://i.pravatar.cc/128?u=bl003-marcus-webb-fx",
    list_membership: "BLACKLIST",
    last_detection: {
      timestamp: "2026-04-06 · 14:31:22 IST", camera_id: "CAM-LB-01", camera_label: "Main Lobby",
      match_confidence: 94.7, detection_confidence: 96.0, duration_in_frame_sec: 6.1, frame_number: "22,134",
    },
    sighting_history: {
      today: [
        { timestamp: "14:31", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 94.7, duration_sec: 6.1,  alerts: ["BLACKLIST_ACTIVE"],  is_current: true,  seed: "bl003-lobby" },
        { timestamp: "14:11", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 92.3, duration_sec: 2.2,  alerts: [],                    seed: "bl003-north" },
        { timestamp: "08:58", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 91.8, duration_sec: 38.0, alerts: ["UNAUTHORISED_ENTRY"], seed: "bl003-south" },
        { timestamp: "08:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 89.2, duration_sec: 3.8,  alerts: [],                    seed: "bl003-parking" },
      ],
      yesterday: [],
    },
    journey: [
      { seq: 1, camera: "Parking Garage", camera_id: "CAM-PG-01", time: "08:52", confidence: 89.2, duration: 3.8,  direction: "Entered via vehicle",          alerts: [] },
      { seq: 2, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:58", confidence: 91.8, duration: 38.0, direction: "Entered building (side door)",  alerts: ["UNAUTHORISED ENTRY"] },
      { seq: 3, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:11", confidence: 92.3, duration: 2.2,  direction: "Re-entered via north corridor", alerts: [] },
      { seq: 4, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "14:31", confidence: 94.7, duration: 6.1,  direction: "Currently active — apprehend", alerts: ["BLACKLIST ACTIVE"] },
    ],
    journey_transit: ["6 min", "5h 13 min", "20 min"],
    journey_summary: { start_time: "08:52", end_time: "14:31", total_duration_min: 339 },
  },

  f2: {
    id: "f2", tracker_id: 88, match_status: "UNMATCHED",
    display_name: "Unknown #88", initials: "?",
    list_membership: "UNKNOWN",
    recognition_attempt: {
      best_match_score: 61.2, threshold: 75.0,
      possible_reasons: ["Person not enrolled in system", "Sub-optimal angle at South Entrance", "Possible partial face occlusion"],
    },
    appearance_summary: {
      total_appearances: 11, days_seen: 4,
      cameras_seen: ["South Entrance (×9)", "Main Lobby (×2)"],
      avg_dwell_sec: 38, typical_time_window: "08:30–09:20", recurring_badge: true,
    },
    last_detection: {
      timestamp: "2026-04-06 · 14:30:55 IST", camera_id: "CAM-SE-01", camera_label: "South Entrance",
      match_confidence: 0, detection_confidence: 63.1, duration_in_frame_sec: 38.0, frame_number: "18,441",
    },
    sighting_history: {
      today: [
        { timestamp: "14:30", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 63.1, duration_sec: 38.0, alerts: ["HIGH_DWELL"], is_current: true,  seed: "unk088-se-curr" },
        { timestamp: "09:05", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 61.4, duration_sec: 18.0, alerts: [],             seed: "unk088-lb-am" },
        { timestamp: "08:41", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 62.0, duration_sec: 31.0, alerts: [],             seed: "unk088-se-am" },
      ],
      yesterday: [],
    },
    journey: [
      { seq: 1, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:41", confidence: 62.0, duration: 31.0, direction: "Arrived at south entrance", alerts: [] },
      { seq: 2, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "09:05", confidence: 61.4, duration: 18.0, direction: "Entered main lobby",        alerts: [] },
      { seq: 3, camera: "South Entrance", camera_id: "CAM-SE-01", time: "14:30", confidence: 63.1, duration: 38.0, direction: "Returned — high dwell",      alerts: ["HIGH DWELL"] },
    ],
    journey_transit: ["24 min", "5h 25 min"],
    journey_summary: { start_time: "08:41", end_time: "14:30", total_duration_min: 349 },
  },

  f3: {
    id: "f3", tracker_id: 134, match_status: "UNMATCHED",
    display_name: "Unknown #134", initials: "?",
    list_membership: "UNKNOWN",
    recognition_attempt: {
      best_match_score: 54.3, threshold: 75.0,
      possible_reasons: ["Poor lighting conditions at Garage Entry B", "Person not enrolled in system", "Camera angle partially obstructed"],
    },
    appearance_summary: {
      total_appearances: 3, days_seen: 2,
      cameras_seen: ["Garage Entry B (×3)"],
      avg_dwell_sec: 22, typical_time_window: "09:00–09:30", recurring_badge: false,
    },
    last_detection: {
      timestamp: "2026-04-06 · 14:28:45 IST", camera_id: "CAM-GB-01", camera_label: "Garage Entry B",
      match_confidence: 0, detection_confidence: 54.3, duration_in_frame_sec: 22.0, frame_number: "21,902",
    },
    sighting_history: {
      today: [
        { timestamp: "14:28", camera_label: "Garage Entry B", camera_id: "CAM-GB-01", confidence: 54.3, duration_sec: 22.0, alerts: ["LOITERING"], is_current: true,  seed: "unk134-gb-curr" },
        { timestamp: "09:08", camera_label: "Garage Entry B", camera_id: "CAM-GB-01", confidence: 52.1, duration_sec: 18.0, alerts: [],             seed: "unk134-gb-am" },
      ],
      yesterday: [
        { timestamp: "09:12", camera_label: "Garage Entry B", camera_id: "CAM-GB-01", confidence: 55.0, duration_sec: 25.0, alerts: [], seed: "unk134-ye-gb" },
      ],
    },
    journey: [
      { seq: 1, camera: "Garage Entry B", camera_id: "CAM-GB-01", time: "09:08", confidence: 52.1, duration: 18.0, direction: "Loitering at garage entry",  alerts: [] },
      { seq: 2, camera: "Garage Entry B", camera_id: "CAM-GB-01", time: "14:28", confidence: 54.3, duration: 22.0, direction: "Returned to same location", alerts: ["LOITERING"] },
    ],
    journey_transit: ["5h 20 min"],
    journey_summary: { start_time: "09:08", end_time: "14:28", total_duration_min: 320 },
  },

  f4: {
    id: "f4", tracker_id: 7, match_status: "MATCHED",
    display_name: "Rajesh Mehta", initials: "RM",
    photo_url: "https://i.pravatar.cc/128?u=vip007-rajesh-mehta-exec",
    list_membership: "VIP",
    vip_info: { title: "Chief Executive Officer", protocol: "Notify Chief of Security on arrival. Escort to boardroom required.", escort: true },
    metadata: { employee_id: "EXC-007", department: "Executive", access_level: "L5 — Unrestricted" },
    last_detection: {
      timestamp: "2026-04-06 · 14:31:10 IST", camera_id: "CAM-NE-01", camera_label: "North Entrance",
      match_confidence: 97.3, detection_confidence: 98.1, duration_in_frame_sec: 3.2, frame_number: "31,042",
    },
    enrollment: { enrolled_date: "2024-01-05", enrolled_by: "security@hq.com", last_seen_before: "2026-04-04 · 09:22 · North Entrance", total_appearances: 201, monthly_appearances: 18 },
    sighting_history: {
      today: [
        { timestamp: "14:31", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 97.3, duration_sec: 3.2, alerts: ["VIP_ARRIVAL"], is_current: true, seed: "vip007-ne-curr" },
      ],
      yesterday: [
        { timestamp: "19:42", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 96.8, duration_sec: 2.8, alerts: [], seed: "vip007-ye-ne01" },
        { timestamp: "08:30", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 97.1, duration_sec: 3.1, alerts: [], seed: "vip007-ye-ne02" },
      ],
    },
    journey: [
      { seq: 1, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:31", confidence: 97.3, duration: 3.2, direction: "Arrived via main entrance", alerts: ["VIP ARRIVAL"] },
    ],
    journey_transit: [],
    journey_summary: { start_time: "14:31", end_time: "14:31", total_duration_min: 0 },
  },

  f5: {
    id: "f5", tracker_id: 47, match_status: "MATCHED",
    display_name: "John Smith", initials: "JS",
    photo_url: "https://images.unsplash.com/photo-1615109398623-88346a601842?w=128&h=128&fit=crop&q=80",
    list_membership: "WHITELIST",
    metadata: { employee_id: "EMP-4821", department: "Engineering", access_level: "L3 — Restricted Zones" },
    last_detection: {
      timestamp: "2026-04-06 · 14:29:45 IST", camera_id: "CAM-LB-01", camera_label: "Main Lobby",
      match_confidence: 96.1, detection_confidence: 97.2, duration_in_frame_sec: 8.3, frame_number: "14,402",
    },
    enrollment: { enrolled_date: "2025-08-14", enrolled_by: "hr@hq.com", last_seen_before: "2026-04-05 · 17:41 · North Entrance", total_appearances: 312, monthly_appearances: 22 },
    sighting_history: {
      today: [
        { timestamp: "14:29", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 96.1, duration_sec: 8.3,  alerts: [], is_current: true,  seed: "js-lb-curr" },
        { timestamp: "14:11", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.8, duration_sec: 2.1,  alerts: [],                         seed: "js-ne-am" },
        { timestamp: "08:58", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 93.2, duration_sec: 42.0, alerts: ["TAILGATE_DETECTED"],       seed: "js-se-am" },
        { timestamp: "08:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 91.8, duration_sec: 4.2,  alerts: [], linked_lpr: "KA05MJ4421", seed: "js-pg-am" },
      ],
      yesterday: [
        { timestamp: "17:41", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.3, duration_sec: 3.4, alerts: [], seed: "js-ye-ne01" },
        { timestamp: "08:44", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 94.1, duration_sec: 5.1, alerts: [], seed: "js-ye-lb01" },
        { timestamp: "07:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 92.6, duration_sec: 3.8, alerts: [], seed: "js-ye-pg01" },
      ],
    },
    journey: [
      { seq: 1, camera: "Parking Garage", camera_id: "CAM-PG-01", time: "08:52", confidence: 91.8, duration: 4.2,  direction: "Entering from street level", alerts: [],                        lpr: "KA05MJ4421" },
      { seq: 2, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:58", confidence: 93.2, duration: 42.0, direction: "Entering building",          alerts: ["TAILGATE DETECTED"] },
      { seq: 3, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:11", confidence: 95.8, duration: 2.1,  direction: "Moving toward lobby",         alerts: [] },
      { seq: 4, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "14:29", confidence: 96.1, duration: 8.3,  direction: "Entering main lobby",         alerts: [] },
    ],
    journey_transit: ["6 min", "5h 13 min", "18 min"],
    journey_summary: { start_time: "08:52", end_time: "14:29", total_duration_min: 337 },
  },

  f6: {
    id: "f6", tracker_id: 21, match_status: "MATCHED",
    display_name: "Sarah Johnson", initials: "SJ",
    photo_url: "https://i.pravatar.cc/128?u=sarah-johnson-2198-hd",
    list_membership: "WHITELIST",
    metadata: { employee_id: "EMP-2198", department: "Human Resources", access_level: "L2 — Standard Access" },
    last_detection: {
      timestamp: "2026-04-06 · 14:27:14 IST", camera_id: "CAM-RC-01", camera_label: "Reception",
      match_confidence: 95.4, detection_confidence: 97.2, duration_in_frame_sec: 12.1, frame_number: "28,809",
    },
    enrollment: { enrolled_date: "2024-03-20", enrolled_by: "hr@hq.com", last_seen_before: "2026-04-05 · 08:51 · North Entrance", total_appearances: 187, monthly_appearances: 22 },
    sighting_history: {
      today: [
        { timestamp: "14:27", camera_label: "Reception",      camera_id: "CAM-RC-01", confidence: 95.4, duration_sec: 12.1, alerts: [], is_current: true,  seed: "sj-rc-curr" },
        { timestamp: "14:06", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 94.8, duration_sec: 2.4,  alerts: [], seed: "sj-ne-am" },
      ],
      yesterday: [
        { timestamp: "17:33", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 93.9, duration_sec: 2.1, alerts: [], seed: "sj-ye-ne01" },
        { timestamp: "08:51", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.1, duration_sec: 1.9, alerts: [], seed: "sj-ye-ne02" },
      ],
    },
    journey: [
      { seq: 1, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:06", confidence: 94.8, duration: 2.4,  direction: "Entering building", alerts: [] },
      { seq: 2, camera: "Reception",      camera_id: "CAM-RC-01", time: "14:27", confidence: 95.4, duration: 12.1, direction: "At reception desk", alerts: [] },
    ],
    journey_transit: ["21 min"],
    journey_summary: { start_time: "14:06", end_time: "14:27", total_duration_min: 21 },
  },
};

// ─── Vehicle entity registry ──────────────────────────────────────────────────
export const VEHICLE_PANEL_ENTITIES: Record<string, VehiclePanelEntity> = {
  // p1 — RJ-5588-BR · BOLO (BLACKLIST)
  p1: {
    id: "p1", plate: "RJ-5588-BR", vehicleDesc: "Black Toyota Innova · 2019",
    list_membership: "BLACKLIST",
    bolo_notes: [
      "Reported stolen — FIR No. KA/2026/03/1182",
      "Police notified — do not approach",
      "Block entry and hold at perimeter",
    ],
    last_detection: {
      timestamp: "2026-04-06 · 14:28:30 IST", camera_id: "CAM-GA-02",
      camera_label: "Garage Entry A", confidence: 91.0, entry_status: "BLOCKED",
    },
    sighting_history: {
      today: [
        { timestamp: "14:28", camera_label: "Garage Entry A", camera_id: "CAM-GA-02", confidence: 91.0, entry_status: "BLOCKED", alerts: ["BOLO_MATCH"], is_current: true },
        { timestamp: "14:10", camera_label: "Main Entrance",  camera_id: "CAM-ME-01", confidence: 88.4, entry_status: "DETECTED", alerts: [] },
      ],
      yesterday: [],
    },
    journey: [
      { seq: 1, camera: "Main Entrance",  camera_id: "CAM-ME-01", time: "14:10", confidence: 88.4, direction: "Approaching main entrance", alerts: [] },
      { seq: 2, camera: "Garage Entry A", camera_id: "CAM-GA-02", time: "14:28", confidence: 91.0, direction: "Attempted entry — BLOCKED",  alerts: ["BOLO MATCH"], entry_status: "BLOCKED" },
    ],
    journey_transit: ["18 min"],
    journey_summary: { start_time: "14:10", end_time: "14:28", total_duration_min: 18 },
  },

  // p2 — UP80MN1123 · UNREGISTERED (UNKNOWN, repeat attempts)
  p2: {
    id: "p2", plate: "UP80MN1123", vehicleDesc: "Silver Maruti Swift · 2022",
    list_membership: "UNKNOWN",
    last_detection: {
      timestamp: "2026-04-06 · 14:31:06 IST", camera_id: "CAM-GA-01",
      camera_label: "Garage Entry A", confidence: 91.0, entry_status: "BLOCKED",
    },
    sighting_history: {
      today: [
        { timestamp: "14:31", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 91.0, entry_status: "BLOCKED", alerts: ["REPEAT_ATTEMPT"], is_current: true },
        { timestamp: "14:18", camera_label: "Parking Lot A",  camera_id: "CAM-PL-01", confidence: 89.2, entry_status: "CIRCLING", alerts: [] },
        { timestamp: "14:05", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 90.1, entry_status: "BLOCKED", alerts: [] },
      ],
      yesterday: [
        { timestamp: "09:22", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 87.3, entry_status: "BLOCKED", alerts: [] },
        { timestamp: "08:55", camera_label: "Main Entrance",  camera_id: "CAM-ME-01", confidence: 85.0, entry_status: "DETECTED", alerts: [] },
      ],
    },
    journey: [
      { seq: 1, camera: "Garage Entry A", camera_id: "CAM-GA-01", time: "14:05", confidence: 90.1, direction: "1st entry attempt — blocked", alerts: [], entry_status: "BLOCKED" },
      { seq: 2, camera: "Parking Lot A",  camera_id: "CAM-PL-01", time: "14:18", confidence: 89.2, direction: "Observed circling lot", alerts: [], entry_status: "CIRCLING" },
      { seq: 3, camera: "Garage Entry A", camera_id: "CAM-GA-01", time: "14:31", confidence: 91.0, direction: "3rd attempt — escalate", alerts: ["REPEAT ATTEMPT"], entry_status: "BLOCKED" },
    ],
    journey_transit: ["13 min", "13 min"],
    journey_summary: { start_time: "14:05", end_time: "14:31", total_duration_min: 26 },
  },

  // p3 — KL-3312-MH · UNREGISTERED (UNKNOWN, no permit)
  p3: {
    id: "p3", plate: "KL-3312-MH", vehicleDesc: "Red Honda City · 2022",
    list_membership: "UNKNOWN",
    last_detection: {
      timestamp: "2026-04-06 · 14:25:01 IST", camera_id: "CAM-PL-01",
      camera_label: "Parking Lot A", confidence: 89.0, entry_status: "PARKED — NO PERMIT",
    },
    sighting_history: {
      today: [
        { timestamp: "14:25", camera_label: "Parking Lot A", camera_id: "CAM-PL-01", confidence: 89.0, entry_status: "PARKED", alerts: ["NO_PERMIT"], is_current: true },
      ],
      yesterday: [],
    },
    journey: [
      { seq: 1, camera: "Parking Lot A", camera_id: "CAM-PL-01", time: "14:25", confidence: 89.0, direction: "Parked without permit", alerts: ["NO PERMIT"], entry_status: "PARKED" },
    ],
    journey_transit: [],
    journey_summary: { start_time: "14:25", end_time: "14:25", total_duration_min: 0 },
  },

  // p4 — MH-0001-GJ · VIP
  p4: {
    id: "p4", plate: "MH-0001-GJ", vehicleDesc: "Black Mercedes GLE 450 · 2024",
    list_membership: "VIP",
    vip_info: { protocol: "Activate valet protocol. Notify Chief of Security. Reserve bay V-01.", valet: true },
    owner: { name: "Rajesh Mehta", employee_id: "EXC-007", department: "Executive", access_level: "L5 — Unrestricted" },
    permit: { permit_id: "VIP-ME-001", valid_until: "2027-01-01", zone: "VIP Bay V-01", enrolled_date: "2024-01-05" },
    last_detection: {
      timestamp: "2026-04-06 · 14:31:10 IST", camera_id: "CAM-ME-01",
      camera_label: "Main Entrance", confidence: 98.5, entry_status: "AUTHORISED",
    },
    sighting_history: {
      today: [
        { timestamp: "14:31", camera_label: "Main Entrance", camera_id: "CAM-ME-01", confidence: 98.5, entry_status: "AUTHORISED", alerts: ["VIP_ARRIVAL"], is_current: true },
      ],
      yesterday: [
        { timestamp: "19:55", camera_label: "Main Entrance", camera_id: "CAM-ME-01", confidence: 98.2, entry_status: "AUTHORISED", alerts: [] },
        { timestamp: "08:22", camera_label: "Main Entrance", camera_id: "CAM-ME-01", confidence: 97.9, entry_status: "AUTHORISED", alerts: [] },
      ],
    },
    journey: [
      { seq: 1, camera: "Main Entrance", camera_id: "CAM-ME-01", time: "14:31", confidence: 98.5, direction: "Arriving — valet protocol active", alerts: ["VIP ARRIVAL"], entry_status: "AUTHORISED" },
    ],
    journey_transit: [],
    journey_summary: { start_time: "14:31", end_time: "14:31", total_duration_min: 0 },
  },

  // p5 — KA05MJ4421 · AUTHORIZED
  p5: {
    id: "p5", plate: "KA05MJ4421", vehicleDesc: "White Honda City · 2021",
    list_membership: "WHITELIST",
    owner: { name: "Rahul Sharma", employee_id: "EMP-2231", department: "Finance", access_level: "L2 — Standard Access" },
    permit: { permit_id: "EMP-2231-GA", valid_until: "2026-12-31", zone: "Garage A · Bays 12–20", enrolled_date: "2024-11-02" },
    last_detection: {
      timestamp: "2026-04-06 · 14:26:05 IST", camera_id: "CAM-GA-01",
      camera_label: "Garage Entry A", confidence: 98.2, entry_status: "AUTHORISED",
    },
    sighting_history: {
      today: [
        { timestamp: "14:26", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 98.2, entry_status: "AUTHORISED", alerts: [], is_current: true },
        { timestamp: "09:01", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 97.8, entry_status: "EXIT",       alerts: [] },
        { timestamp: "08:48", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 98.0, entry_status: "AUTHORISED", alerts: [] },
      ],
      yesterday: [
        { timestamp: "18:12", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 97.5, entry_status: "EXIT",       alerts: [] },
        { timestamp: "08:51", camera_label: "Garage Entry A", camera_id: "CAM-GA-01", confidence: 97.9, entry_status: "AUTHORISED", alerts: [] },
      ],
    },
    journey: [
      { seq: 1, camera: "Garage Entry A", camera_id: "CAM-GA-01", time: "08:48", confidence: 98.0, direction: "Morning entry — authorised", alerts: [], entry_status: "AUTHORISED" },
      { seq: 2, camera: "Garage Entry A", camera_id: "CAM-GA-01", time: "09:01", confidence: 97.8, direction: "Exit — lunchtime",           alerts: [], entry_status: "EXIT" },
      { seq: 3, camera: "Garage Entry A", camera_id: "CAM-GA-01", time: "14:26", confidence: 98.2, direction: "Return — parked in bay",     alerts: [], entry_status: "AUTHORISED" },
    ],
    journey_transit: ["13 min", "5h 25 min"],
    journey_summary: { start_time: "08:48", end_time: "14:26", total_duration_min: 338 },
  },

  // p6 — DL-7723-UP · AUTHORIZED
  p6: {
    id: "p6", plate: "DL-7723-UP", vehicleDesc: "Blue Toyota Camry · 2023",
    list_membership: "WHITELIST",
    owner: { name: "Priya Nair", employee_id: "EMP-3341", department: "Human Resources", access_level: "L2 — Standard Access" },
    permit: { permit_id: "EMP-3341-PL", valid_until: "2026-12-31", zone: "Parking Lot B · Bays 1–8", enrolled_date: "2024-05-10" },
    last_detection: {
      timestamp: "2026-04-06 · 14:22:45 IST", camera_id: "CAM-PL-02",
      camera_label: "Parking Lot B", confidence: 96.1, entry_status: "PARKED",
    },
    sighting_history: {
      today: [
        { timestamp: "14:22", camera_label: "Parking Lot B", camera_id: "CAM-PL-02", confidence: 96.1, entry_status: "PARKED",      alerts: [], is_current: true },
        { timestamp: "08:42", camera_label: "Parking Lot B", camera_id: "CAM-PL-02", confidence: 95.8, entry_status: "AUTHORISED",  alerts: [] },
      ],
      yesterday: [
        { timestamp: "18:04", camera_label: "Parking Lot B", camera_id: "CAM-PL-02", confidence: 95.3, entry_status: "EXIT",        alerts: [] },
        { timestamp: "08:39", camera_label: "Parking Lot B", camera_id: "CAM-PL-02", confidence: 96.0, entry_status: "AUTHORISED",  alerts: [] },
      ],
    },
    journey: [
      { seq: 1, camera: "Parking Lot B", camera_id: "CAM-PL-02", time: "08:42", confidence: 95.8, direction: "Arrived — permit verified", alerts: [], entry_status: "AUTHORISED" },
      { seq: 2, camera: "Parking Lot B", camera_id: "CAM-PL-02", time: "14:22", confidence: 96.1, direction: "Return after midday",       alerts: [], entry_status: "PARKED" },
    ],
    journey_transit: ["5h 40 min"],
    journey_summary: { start_time: "08:42", end_time: "14:22", total_duration_min: 340 },
  },
};

const DEFAULT_NOTIFY_GROUPS = ["Admin", "Security Team", "Control Room", "Operations Manager", "Site Supervisor", "Dispatch Center"];

// ─── Style helpers ─────────────────────────────────────────────────────────────
const AVATAR_BORDER: Record<string, string> = {
  WHITELIST: "border-[#00775B]/30 bg-[#E5FFF9]",
  BLACKLIST: "border-[#E7000B]/50 bg-[#FFE5E7]",
  VIP:       "border-purple-300 bg-purple-50",
  UNKNOWN:   "border-dashed border-neutral-300 bg-neutral-100",
};
const AVATAR_TEXT: Record<string, string> = {
  WHITELIST: "text-[#00775B]",
  BLACKLIST: "text-[#E7000B]",
  VIP:       "text-purple-700",
  UNKNOWN:   "text-neutral-400",
};

function alertBadgeStyle(alert: string): string {
  const a = alert.toUpperCase();
  if (a.includes("BLACKLIST") || a.includes("UNAUTHORISED") || a.includes("BOLO")) return "bg-red-100 text-red-700 border-red-200";
  if (a.includes("VIP")) return "bg-purple-100 text-purple-700 border-purple-200";
  if (a.includes("RESTRICTED")) return "bg-blue-100 text-blue-700 border-blue-200";
  return "bg-amber-100 text-amber-700 border-amber-200";
}
function journeyCardStyle(alerts: string[]): string {
  const j = alerts.join(" ").toUpperCase();
  if (j.includes("BLACKLIST") || j.includes("UNAUTHORISED") || j.includes("BOLO")) return "border-red-200 bg-red-50/40";
  if (j.includes("VIP")) return "border-purple-100 bg-purple-50/30";
  if (j.includes("RESTRICTED")) return "border-blue-100 bg-blue-50/30";
  if (alerts.length > 0) return "border-amber-200 bg-amber-50/30";
  return "border-neutral-200 bg-white";
}
function dotColor(seq: number, totalSeq: number, alerts: string[]): string {
  const j = alerts.join(" ").toUpperCase();
  if (j.includes("BLACKLIST") || j.includes("UNAUTHORISED") || j.includes("BOLO")) return "bg-red-600";
  if (j.includes("VIP")) return "bg-purple-600";
  if (seq === totalSeq) return "bg-[#00775B]";
  return "bg-[#00775B]/70";
}
function entryStatusPill(status?: string) {
  if (!status) return null;
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    AUTHORISED: "bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20",
    BLOCKED: "bg-red-50 text-red-700 border-red-200",
    PARKED: "bg-neutral-100 text-neutral-600 border-neutral-200",
    EXIT: "bg-blue-50 text-blue-600 border-blue-200",
    CIRCLING: "bg-amber-50 text-amber-700 border-amber-200",
  };
  const key = Object.keys(map).find(k => s.includes(k)) ?? "";
  return map[key] ?? "bg-neutral-100 text-neutral-500 border-neutral-200";
}

// ─── Helper components ─────────────────────────────────────────────────────────
const SectionLabel = ({ children }: { children: React.ReactNode }) => (
  <div className="px-6 py-2 bg-neutral-50 border-b border-neutral-100">
    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">{children}</p>
  </div>
);

const ConfidenceDot = ({ value }: { value: number }) => (
  <span className={cn(
    "inline-block w-2 h-2 rounded-full mr-1.5 shrink-0",
    value >= 90 ? "bg-emerald-500" : value >= 75 ? "bg-amber-500" : "bg-red-500"
  )} />
);

const MembershipBadge = ({ membership, isVehicle }: { membership: string; isVehicle?: boolean }) => {
  const map: Record<string, { bg: string; text: string; icon: React.ElementType; label: string }> = {
    WHITELIST: { bg: "bg-[#E5FFEF] border border-[#00A63E]/20", text: "text-[#00A63E]", icon: CheckCircle2, label: isVehicle ? "Authorised" : "Whitelist" },
    BLACKLIST: { bg: "bg-[#FFE5E7] border border-[#E7000B]/20", text: "text-[#E7000B]", icon: ShieldAlert,  label: isVehicle ? "BOLO" : "Blacklist" },
    VIP:       { bg: "bg-purple-100 border border-purple-200",  text: "text-purple-700", icon: Star,         label: "VIP" },
    UNKNOWN:   { bg: "bg-neutral-100 border border-neutral-200",text: "text-neutral-600", icon: isVehicle ? Car : User, label: isVehicle ? "Unregistered" : "Unknown" },
  };
  const cfg = map[membership] ?? map.UNKNOWN;
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold", cfg.bg, cfg.text)}>
      <Icon className="w-3.5 h-3.5" />{cfg.label}
    </span>
  );
};

// ─── Notify section ────────────────────────────────────────────────────────────
function NotifySection({ groups = DEFAULT_NOTIFY_GROUPS, accentColor = "#00775B" }: { groups?: string[]; accentColor?: string }) {
  const [selected, setSelected] = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notified, setNotified]       = useState(false);
  const [lastSent, setLastSent]       = useState<string[]>([]);

  const toggle = (r: string) => setSelected(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  const handleConfirm = () => {
    setLastSent([...selected]); setShowConfirm(false); setNotified(true); setSelected([]);
    setTimeout(() => setNotified(false), 3500);
  };

  return (
    <div className="px-6 py-4 border-b border-neutral-100">
      <div className="rounded border border-neutral-200 bg-white overflow-hidden">
        <div className="grid grid-cols-2 divide-x divide-neutral-50">
          {groups.map(r => (
            <label key={r} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors border-b border-neutral-50">
              <input type="checkbox" checked={selected.includes(r)} onChange={() => toggle(r)}
                className="w-3.5 h-3.5 cursor-pointer shrink-0" style={{ accentColor }} />
              <span className="text-[11px] text-neutral-700 font-medium flex-1 leading-tight">{r}</span>
            </label>
          ))}
        </div>
        <div className="px-3 py-2.5 border-t border-neutral-100 bg-neutral-50/60">
          <button onClick={() => selected.length && setShowConfirm(true)} disabled={!selected.length}
            className={cn("w-full h-8 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all",
              selected.length ? "text-white hover:opacity-90" : "bg-neutral-100 text-neutral-400 cursor-not-allowed")}
            style={selected.length ? { backgroundColor: accentColor } : {}}>
            <Mail className="w-3 h-3" />
            {selected.length ? `Send to ${selected.length} recipient${selected.length > 1 ? "s" : ""}` : "Select recipients"}
          </button>
        </div>
      </div>
      {notified && (
        <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded bg-emerald-50 border border-emerald-200">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
          <p className="text-[11px] font-semibold text-emerald-700">Notification sent to {lastSent.join(", ")}</p>
        </div>
      )}
      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded shadow-2xl border border-neutral-200 w-80 p-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Confirm Notification</h3>
            <p className="text-[12px] text-neutral-500 mb-1">Send alert to:</p>
            <p className="text-[12px] font-semibold text-neutral-800 mb-4">{selected.join(", ")}</p>
            <div className="flex gap-2">
              <button onClick={() => setShowConfirm(false)} className="flex-1 h-8 rounded border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
              <button onClick={handleConfirm} className="flex-1 h-8 rounded text-white text-[11px] font-bold hover:opacity-90 transition-colors" style={{ backgroundColor: accentColor }}>Send</button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Enroll Person form ────────────────────────────────────────────────────────
function EnrollForm({ onClose, onSuccess }: { onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ name: "", department: "", employeeId: "", access: "L1 — Basic Access", notes: "" });
  const [submitted, setSubmitted] = useState(false);

  const DEPARTMENTS = ["Engineering", "Finance", "Human Resources", "Operations", "Security", "Executive", "Visitor"];
  const ACCESS_LEVELS = ["L1 — Basic Access", "L2 — Standard Access", "L3 — Restricted Zones", "L4 — Secure Areas", "L5 — Unrestricted"];

  const handleSubmit = () => {
    if (!form.name.trim()) return;
    setSubmitted(true);
    setTimeout(() => { onSuccess(); onClose(); }, 1800);
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className="w-10 h-10 rounded-full bg-[#E5FFF9] flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5 text-[#00775B]" />
      </div>
      <p className="text-sm font-bold text-neutral-900">Person Enrolled</p>
      <p className="text-xs text-neutral-500">{form.name} added to whitelist</p>
    </div>
  );

  return (
    <div className="border-t border-neutral-100 bg-neutral-50/40">
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Enroll Person</p>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-200 transition-colors">
            <X className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Full Name <span className="text-red-500">*</span></label>
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Enter full name"
            className="w-full h-8 px-3 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Department</label>
            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              className="w-full h-8 px-2 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors">
              <option value="">Select…</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Employee ID</label>
            <input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
              placeholder="EMP-XXXX"
              className="w-full h-8 px-3 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors font-mono" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Access Level</label>
          <select value={form.access} onChange={e => setForm(p => ({ ...p, access: e.target.value }))}
            className="w-full h-8 px-2 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors">
            {ACCESS_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Notes</label>
          <textarea value={form.notes} onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
            placeholder="Visitor, contractor, reason for access…"
            rows={2}
            className="w-full px-3 py-2 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors resize-none" />
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 h-8 rounded border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!form.name.trim()}
            className={cn("flex-1 h-8 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors",
              form.name.trim() ? "bg-[#00775B] text-white hover:bg-[#004E3D]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed")}>
            <UserPlus className="w-3.5 h-3.5" />Enroll & Add to Whitelist
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Vehicle form ─────────────────────────────────────────────────────
function RegisterVehicleForm({ plate, onClose, onSuccess }: { plate: string; onClose: () => void; onSuccess: () => void }) {
  const [form, setForm] = useState({ ownerName: "", employeeId: "", department: "", zone: "Garage Entry A", validUntil: "" });
  const [submitted, setSubmitted] = useState(false);

  const ZONES = ["Garage Entry A", "Garage Entry B", "Parking Lot A", "Parking Lot B", "VIP Bay"];
  const DEPARTMENTS = ["Engineering", "Finance", "Human Resources", "Operations", "Security", "Executive"];

  const handleSubmit = () => {
    if (!form.ownerName.trim()) return;
    setSubmitted(true);
    setTimeout(() => { onSuccess(); onClose(); }, 1800);
  };

  if (submitted) return (
    <div className="flex flex-col items-center justify-center py-8 gap-2">
      <div className="w-10 h-10 rounded-full bg-[#E5FFF9] flex items-center justify-center">
        <CheckCircle2 className="w-5 h-5 text-[#00775B]" />
      </div>
      <p className="text-sm font-bold text-neutral-900">Vehicle Registered</p>
      <p className="text-xs text-neutral-500">{plate} added to authorised list</p>
    </div>
  );

  return (
    <div className="border-t border-neutral-100 bg-neutral-50/40">
      <div className="px-6 py-4 space-y-3">
        <div className="flex items-center justify-between mb-1">
          <p className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Register Vehicle</p>
          <button onClick={onClose} className="w-6 h-6 flex items-center justify-center rounded hover:bg-neutral-200 transition-colors">
            <X className="w-3.5 h-3.5 text-neutral-500" />
          </button>
        </div>

        <div className="px-3 py-2 rounded bg-neutral-100 border border-neutral-200">
          <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Plate</p>
          <p className="text-sm font-black text-neutral-900 font-mono tracking-widest">{plate}</p>
        </div>

        <div>
          <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Owner Name <span className="text-red-500">*</span></label>
          <input value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))}
            placeholder="Enter owner name"
            className="w-full h-8 px-3 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors" />
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Employee ID</label>
            <input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))}
              placeholder="EMP-XXXX"
              className="w-full h-8 px-3 rounded border border-neutral-200 text-[12px] bg-white font-mono focus:outline-none focus:border-[#00775B] transition-colors" />
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Department</label>
            <select value={form.department} onChange={e => setForm(p => ({ ...p, department: e.target.value }))}
              className="w-full h-8 px-2 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors">
              <option value="">Select…</option>
              {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Permit Zone</label>
            <select value={form.zone} onChange={e => setForm(p => ({ ...p, zone: e.target.value }))}
              className="w-full h-8 px-2 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors">
              {ZONES.map(z => <option key={z} value={z}>{z}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Valid Until</label>
            <input type="date" value={form.validUntil} onChange={e => setForm(p => ({ ...p, validUntil: e.target.value }))}
              className="w-full h-8 px-3 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors" />
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 h-8 rounded border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={!form.ownerName.trim()}
            className={cn("flex-1 h-8 rounded text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors",
              form.ownerName.trim() ? "bg-[#00775B] text-white hover:bg-[#004E3D]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed")}>
            <Car className="w-3.5 h-3.5" />Register & Authorise
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Journey timeline ──────────────────────────────────────────────────────────
function JourneyTimeline({ entity }: { entity: PanelEntity }) {
  const { journey, journey_transit, journey_summary } = entity;
  if (!journey.length) return null;
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3 mb-4 text-[10px] font-mono text-neutral-500">
        <span className="font-bold text-neutral-700">{journey_summary.start_time} → {journey_summary.end_time}</span>
        <span className="text-neutral-300">·</span>
        <span>{journey_summary.total_duration_min} min total</span>
        <span className="text-neutral-300">·</span>
        <span>{journey.length} cameras</span>
      </div>
      {journey.map((stop, i) => (
        <div key={stop.seq}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0 w-7">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 z-10",
                dotColor(stop.seq, journey.length, stop.alerts))}>
                {stop.seq}
              </div>
              {i < journey.length - 1 && <div className="w-px flex-1 bg-neutral-200 my-1" style={{ minHeight: 32 }} />}
            </div>
            <div className={cn("flex-1 rounded border p-3 mb-3", journeyCardStyle(stop.alerts))}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] font-bold text-neutral-900 leading-tight">{stop.camera}</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5 font-mono">{stop.camera_id}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">{stop.time}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
                <span className={cn("font-mono font-bold", stop.confidence >= 94 ? "text-[#00775B]" : "text-neutral-700")}>{stop.confidence}%</span>
                <span className="text-neutral-300">·</span>
                <span className="font-mono">{stop.duration}s in frame</span>
                <span className="text-neutral-300">·</span>
                <span>{stop.direction}</span>
              </div>
              {stop.alerts.map(alert => (
                <span key={alert} className={cn("inline-flex items-center mt-1.5 mr-1 text-[9px] font-bold px-2 py-0.5 rounded-full border", alertBadgeStyle(alert))}>
                  {alert}
                </span>
              ))}
              {stop.lpr && (
                <div className="mt-1.5 inline-flex items-center gap-1 text-[9px] font-mono font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">
                  <Car className="w-2.5 h-2.5" />{stop.lpr}
                </div>
              )}
            </div>
          </div>
          {i < journey.length - 1 && (
            <div className="flex items-center gap-2 ml-3.5 -mt-2 mb-1">
              <span className="text-[9px] text-neutral-400 font-mono ml-3">↓ {journey_transit[i] ?? ""} transit</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Vehicle journey timeline ──────────────────────────────────────────────────
function VehicleJourneyTimeline({ vehicle }: { vehicle: VehiclePanelEntity }) {
  const { journey, journey_transit, journey_summary } = vehicle;
  if (!journey.length) return null;
  return (
    <div className="px-5 py-4">
      <div className="flex items-center gap-3 mb-4 text-[10px] font-mono text-neutral-500">
        <span className="font-bold text-neutral-700">{journey_summary.start_time} → {journey_summary.end_time}</span>
        <span className="text-neutral-300">·</span>
        <span>{journey_summary.total_duration_min} min total</span>
        <span className="text-neutral-300">·</span>
        <span>{journey.length} checkpoint{journey.length > 1 ? "s" : ""}</span>
      </div>
      {journey.map((stop, i) => (
        <div key={stop.seq}>
          <div className="flex gap-3">
            <div className="flex flex-col items-center shrink-0 w-7">
              <div className={cn("w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-black text-white shrink-0 z-10",
                dotColor(stop.seq, journey.length, stop.alerts))}>
                {stop.seq}
              </div>
              {i < journey.length - 1 && <div className="w-px flex-1 bg-neutral-200 my-1" style={{ minHeight: 32 }} />}
            </div>
            <div className={cn("flex-1 rounded border p-3 mb-3", journeyCardStyle(stop.alerts))}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-[12px] font-bold text-neutral-900 leading-tight">{stop.camera}</p>
                  <p className="text-[9px] text-neutral-400 mt-0.5 font-mono">{stop.camera_id}</p>
                </div>
                <span className="text-[10px] font-mono font-bold text-neutral-500 shrink-0">{stop.time}</span>
              </div>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-neutral-500">
                <span className={cn("font-mono font-bold", stop.confidence >= 94 ? "text-[#00775B]" : "text-neutral-700")}>{stop.confidence}%</span>
                <span className="text-neutral-300">·</span>
                <span>{stop.direction}</span>
              </div>
              {stop.entry_status && (
                <span className={cn("inline-flex items-center mt-1.5 mr-1 text-[9px] font-bold px-2 py-0.5 rounded border", entryStatusPill(stop.entry_status))}>
                  {stop.entry_status}
                </span>
              )}
              {stop.alerts.map(alert => (
                <span key={alert} className={cn("inline-flex items-center mt-1.5 mr-1 text-[9px] font-bold px-2 py-0.5 rounded-full border", alertBadgeStyle(alert))}>
                  {alert}
                </span>
              ))}
            </div>
          </div>
          {i < journey.length - 1 && (
            <div className="flex items-center gap-2 ml-3.5 -mt-2 mb-1">
              <span className="text-[9px] text-neutral-400 font-mono ml-3">↓ {journey_transit[i] ?? ""}</span>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Sighting history (face) ───────────────────────────────────────────────────
function SightingRows({ sightings, membership, showAll, onShowAll, label }: {
  sightings: SightingEntry[]; membership: string;
  showAll: boolean; onShowAll: () => void; label: string;
}) {
  const visible = showAll ? sightings : sightings.slice(0, 2);
  const badgeColor = (a: string) => {
    if (a.includes("BLACKLIST") || a.includes("UNAUTHORISED")) return "bg-[#FFE5E7] text-[#E7000B] border-[#E7000B]/20";
    if (a.includes("VIP")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (a.includes("RESTRICTED")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-[#FFF7E6] text-[#E19A04] border-[#E19A04]/20";
  };
  const currentBg = membership === "BLACKLIST" ? "bg-[#FFE5E7] border-[#E7000B]/20" : membership === "VIP" ? "bg-purple-50 border-purple-200" : "bg-[#E5FFF9] border-[#00775B]/20";

  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <div className="px-6 py-3 border-b border-neutral-50">
        <div className="space-y-2">
          {visible.map((s, i) => (
            <div key={i} className={cn("flex items-center gap-3 rounded border transition-colors",
              s.is_current ? currentBg : "bg-white border-neutral-100")}>
              <div className="relative w-14 h-14 rounded-l overflow-hidden shrink-0 bg-neutral-100">
                <img src={`https://i.pravatar.cc/112?u=${s.seed}`} alt="" className="w-full h-full object-cover"
                  onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                {s.is_current && (
                  <div className={cn("absolute inset-[5px] border-2 rounded-[2px] pointer-events-none",
                    membership === "BLACKLIST" ? "border-[#E7000B]" : membership === "VIP" ? "border-purple-500" : "border-[#00775B]")} />
                )}
              </div>
              <div className="flex-1 min-w-0 py-2 pr-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold text-neutral-800">{s.camera_label}</span>
                  <span className="font-data tabular-nums text-[10px] text-neutral-400">{s.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-500">
                  <ConfidenceDot value={s.confidence} />
                  <span className="font-data tabular-nums font-semibold">{s.confidence}%</span>
                  <span className="text-neutral-400">{s.camera_id}</span>
                  <span className="font-data tabular-nums text-neutral-400">{s.duration_sec}s</span>
                </div>
                {(s.alerts.length > 0 || s.linked_lpr || s.is_current) && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.alerts.map(a => (
                      <span key={a} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", badgeColor(a))}>
                        {a.replace(/_/g, " ")}
                      </span>
                    ))}
                    {s.linked_lpr && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 font-semibold">LPR: {s.linked_lpr} ↗</span>
                    )}
                    {s.is_current && (
                      <span className={cn("text-[9px] rounded px-1.5 py-0.5 font-bold border",
                        membership === "BLACKLIST" ? "bg-red-50 text-red-700 border-red-200" :
                        membership === "VIP" ? "bg-purple-50 text-purple-700 border-purple-200" :
                        "bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20"
                      )}>CURRENT</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!showAll && sightings.length > 2 && (
          <button onClick={onShowAll} className="mt-2 text-xs text-[#00775B] font-semibold hover:underline">
            +{sightings.length - 2} more
          </button>
        )}
      </div>
    </>
  );
}

// ─── Vehicle sighting history ──────────────────────────────────────────────────
function VehicleSightingRows({ sightings, membership, showAll, onShowAll, label }: {
  sightings: VehicleSighting[]; membership: string;
  showAll: boolean; onShowAll: () => void; label: string;
}) {
  const visible = showAll ? sightings : sightings.slice(0, 3);
  const currentBg = membership === "BLACKLIST" ? "bg-[#FFE5E7] border-[#E7000B]/20" : membership === "VIP" ? "bg-purple-50 border-purple-200" : "bg-[#E5FFF9] border-[#00775B]/20";

  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <div className="px-6 py-3 border-b border-neutral-50">
        <div className="space-y-2">
          {visible.map((s, i) => (
            <div key={i} className={cn("flex items-center gap-3 rounded border p-3 transition-colors",
              s.is_current ? currentBg : "bg-white border-neutral-100")}>
              <div className={cn("w-8 h-8 rounded flex items-center justify-center shrink-0",
                membership === "BLACKLIST" ? "bg-red-100" : membership === "VIP" ? "bg-purple-100" : "bg-[#E5FFF9]")}>
                <Car className={cn("w-4 h-4",
                  membership === "BLACKLIST" ? "text-[#E7000B]" : membership === "VIP" ? "text-purple-600" : "text-[#00775B]")} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold text-neutral-800">{s.camera_label}</span>
                  <span className="font-data tabular-nums text-[10px] text-neutral-400">{s.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] flex-wrap">
                  <ConfidenceDot value={s.confidence} />
                  <span className="font-data tabular-nums font-semibold text-neutral-700">{s.confidence}%</span>
                  <span className="text-neutral-400">{s.camera_id}</span>
                  {s.entry_status && (
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", entryStatusPill(s.entry_status))}>
                      {s.entry_status}
                    </span>
                  )}
                  {s.alerts.map(a => (
                    <span key={a} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", alertBadgeStyle(a))}>
                      {a.replace(/_/g, " ")}
                    </span>
                  ))}
                  {s.is_current && (
                    <span className={cn("text-[9px] rounded px-1.5 py-0.5 font-bold border",
                      membership === "BLACKLIST" ? "bg-red-50 text-red-700 border-red-200" :
                      membership === "VIP" ? "bg-purple-50 text-purple-700 border-purple-200" :
                      "bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20"
                    )}>CURRENT</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        {!showAll && sightings.length > 3 && (
          <button onClick={onShowAll} className="mt-2 text-xs text-[#00775B] font-semibold hover:underline">
            +{sightings.length - 3} more
          </button>
        )}
      </div>
    </>
  );
}

// ─── Frames Carousel Modal ────────────────────────────────────────────────────
function FramesCarouselModal({ images, title, onClose }: { images: string[]; title: string; onClose: () => void }) {
  const [maximized, setMaximized] = useState<string | null>(null);
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#0F172A] rounded-xl shadow-2xl border border-slate-700 w-[580px] max-w-[95vw]">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-700">
          <p className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">Detection Frames — {title}</p>
          <button onClick={onClose} className="w-7 h-7 flex items-center justify-center rounded hover:bg-slate-700 transition-colors">
            <X className="w-4 h-4 text-slate-400" />
          </button>
        </div>
        {maximized ? (
          <div className="relative">
            <img src={maximized} alt="" className="w-full max-h-[70vh] object-contain rounded-b-xl" />
            <button onClick={() => setMaximized(null)}
              className="absolute top-2 right-2 w-8 h-8 bg-black/60 rounded flex items-center justify-center hover:bg-black/80 transition-colors">
              <X className="w-4 h-4 text-white" />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2 p-4">
            {images.map((url, i) => (
              <button key={i} onClick={() => setMaximized(url)} className="relative aspect-square overflow-hidden rounded group">
                <img src={url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-colors flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="absolute bottom-1 left-1 text-[9px] font-mono text-white bg-black/60 px-1.5 py-0.5 rounded">
                  Frame {i + 1}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
}

// ─── Main Panel ───────────────────────────────────────────────────────────────
interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityType?: "matched" | "unknown" | "blacklist";
  personId?: string;
  groups?: string[];
  mode?: "face" | "lpr";
}

const DEFAULT_BY_TYPE: Record<string, string> = {
  matched: "f5", unknown: "f2", blacklist: "f1",
};
const DEFAULT_VEHICLE_BY_TYPE: Record<string, string> = {
  matched: "p5", unknown: "p2", blacklist: "p1",
};

export const EntityDetailPanel = ({ isOpen, onClose, entityType = "matched", personId, groups, mode = "face" }: Props) => {
  const [showOlderToday, setShowOlderToday]         = useState(false);
  const [showOlderYesterday, setShowOlderYesterday] = useState(false);
  const [avatarFailed, setAvatarFailed]             = useState(false);
  const [enrollOpen, setEnrollOpen]                 = useState(false);
  const [enrolled, setEnrolled]                     = useState(false);
  const [registerOpen, setRegisterOpen]             = useState(false);
  const [registered, setRegistered]                 = useState(false);
  const [actionsOpen, setActionsOpen]               = useState(false);
  const [framesOpen, setFramesOpen]                 = useState(false);
  const [vehicleFramesOpen, setVehicleFramesOpen]   = useState(false);

  useEffect(() => {
    setShowOlderToday(false);
    setShowOlderYesterday(false);
    setAvatarFailed(false);
    setEnrollOpen(false);
    setEnrolled(false);
    setRegisterOpen(false);
    setRegistered(false);
    setActionsOpen(false);
    setFramesOpen(false);
    setVehicleFramesOpen(false);
  }, [personId, mode]);

  // ── Vehicle mode ────────────────────────────────────────────────────────────
  if (mode === "lpr") {
    const vehicleId = personId ?? DEFAULT_VEHICLE_BY_TYPE[entityType] ?? "p5";
    const vehicle = VEHICLE_PANEL_ENTITIES[vehicleId] ?? VEHICLE_PANEL_ENTITIES.p5;
    const isVehicleBolo      = vehicle.list_membership === "BLACKLIST";
    const isVehicleVip       = vehicle.list_membership === "VIP";
    const isVehicleUnknown   = vehicle.list_membership === "UNKNOWN";
    const isVehicleAuth      = vehicle.list_membership === "WHITELIST";
    const notifyAccent = isVehicleBolo ? "#E7000B" : isVehicleVip ? "#7c3aed" : "#00775B";
    const notifyGroups = groups ?? DEFAULT_NOTIFY_GROUPS;

    // ── Vehicle sticky footer ──────────────────────────────────────────────────
    const StickyVehicleActions = () => {
      const [selected, setSelected] = useState<string[]>([]);
      const [dropOpen, setDropOpen] = useState(false);
      const [sent, setSent]         = useState(false);
      const toggle = (g: string) => setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
      const send   = () => { if (!selected.length) return; setSent(true); setTimeout(() => { setSent(false); setSelected([]); }, 3000); };
      const accentBg = isVehicleBolo ? "bg-red-600 hover:bg-red-700" : isVehicleVip ? "bg-purple-600 hover:bg-purple-700" : "bg-[#00775B] hover:bg-[#006349]";
      return (
        <div className="px-4 py-3 bg-white flex items-center gap-2">
          <button className={cn("shrink-0 h-9 px-3 rounded text-[12px] font-bold text-white flex items-center gap-1.5 transition-colors", accentBg)}>
            <Mail className="w-3.5 h-3.5" />Notify
          </button>
          <div className="relative flex-1">
            <button onClick={() => setDropOpen(v => !v)} className="w-full h-9 flex items-center justify-between px-3 rounded border border-neutral-200 text-[12px] text-neutral-600 hover:border-neutral-300 bg-white transition-colors">
              <span className="truncate">{selected.length === 0 ? "Notify recipients…" : selected.length === 1 ? selected[0] : `${selected.length} recipients selected`}</span>
              <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform", dropOpen && "rotate-180")} />
            </button>
            {dropOpen && (
              <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-neutral-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
                {notifyGroups.map(g => (
                  <label key={g} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-neutral-50 border-b border-neutral-50 last:border-0">
                    <input type="checkbox" checked={selected.includes(g)} onChange={() => toggle(g)} className="w-3.5 h-3.5 cursor-pointer shrink-0" style={{ accentColor: notifyAccent }} />
                    <span className="text-[12px] text-neutral-700 font-medium">{g}</span>
                  </label>
                ))}
              </div>
            )}
          </div>
          <button onClick={send} disabled={!selected.length || sent}
            className={cn("shrink-0 h-9 px-3 rounded text-[12px] font-bold flex items-center gap-1.5 transition-colors",
              selected.length && !sent ? "bg-[#00775B] text-white hover:bg-[#006349]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed")}>
            {sent ? <><CheckCircle2 className="w-3.5 h-3.5" />Sent</> : <><Mail className="w-3.5 h-3.5" />Send</>}
          </button>
        </div>
      );
    };

    return (
      <SlidePanel isOpen={isOpen} onClose={onClose} title={vehicle.plate} subtitle={vehicle.vehicleDesc}
        footer={!isVehicleAuth ? <StickyVehicleActions /> : undefined}>
        {/* Banner */}
        {isVehicleBolo && (
          <div className="bg-red-600 px-6 py-2.5 flex items-center gap-2 shrink-0">
            <AlertTriangle className="w-4 h-4 text-white animate-pulse shrink-0" />
            <p className="text-xs font-bold text-white uppercase tracking-wider">BOLO Alert — Entry Blocked</p>
          </div>
        )}

        {/* Hero */}
        <div className="px-5 py-4 border-b border-neutral-100">
          {/* Current Location pill */}
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Current Location</span>
            <span className={cn(
              "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
              isVehicleBolo ? "bg-red-50 text-red-700 border border-red-200" :
              isVehicleVip  ? "bg-purple-50 text-purple-700 border border-purple-200" :
              "bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20"
            )}>
              <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
              {vehicle.last_detection.camera_label}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {/* Plate icon */}
            <div className={cn("w-12 h-12 rounded shrink-0 border-2 flex flex-col items-center justify-center gap-0.5",
              AVATAR_BORDER[vehicle.list_membership] ?? AVATAR_BORDER.UNKNOWN)}>
              <Car className={cn("w-5 h-5", AVATAR_TEXT[vehicle.list_membership] ?? AVATAR_TEXT.UNKNOWN)} />
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Row 1: plate · [spacer] · badge */}
              <div className="flex items-center gap-2">
                <h3 className="text-[13px] font-black text-neutral-900 font-mono tracking-wider leading-tight shrink-0">{vehicle.plate}</h3>
                <div className="flex-1" />
                <MembershipBadge membership={vehicle.list_membership} isVehicle />
                {isVehicleUnknown && registered && (
                  <span className="shrink-0 flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                    <CheckCircle2 className="w-3 h-3" />Registered
                  </span>
                )}
              </div>

              {/* Row 2: vehicle description + owner */}
              <p className="text-[11px] text-neutral-500 mt-0.5 truncate">
                {vehicle.vehicleDesc}{vehicle.owner ? ` · ${vehicle.owner.name}` : ""}
              </p>
              {isVehicleUnknown && !registerOpen && !registered && (
                <button onClick={() => setRegisterOpen(true)}
                  className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#00775B] hover:underline">
                  <Car className="w-3 h-3" />Register Vehicle
                </button>
              )}

              {/* Row 3: meta (confidence · camera · entry status) */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <ConfidenceDot value={vehicle.last_detection.confidence} />
                  <span className="font-semibold text-neutral-700">{vehicle.last_detection.confidence}%</span>
                </span>
                <span className="text-neutral-300 text-[10px]">·</span>
                <span className="flex items-center gap-1 text-[11px] text-neutral-500">
                  <Camera className="w-3 h-3" />{vehicle.last_detection.camera_label}
                </span>
              </div>

            </div>
          </div>
        </div>

        {/* Enroll / Register form */}
        {registerOpen && (
          <RegisterVehicleForm
            plate={vehicle.plate}
            onClose={() => setRegisterOpen(false)}
            onSuccess={() => setRegistered(true)}
          />
        )}

        {/* VIP Protocol */}
        {isVehicleVip && vehicle.vip_info && (
          <>
            <SectionLabel>VIP Protocol</SectionLabel>
            <div className="mx-6 my-4 rounded border border-purple-200 bg-purple-50/40 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Star className="w-4 h-4 text-purple-600" />
                <p className="text-xs font-bold text-purple-800 uppercase tracking-wide">Protocol Active</p>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Valet Required</p>
                  <p className="text-xs font-bold mt-0.5 text-purple-700">Yes — Assign bay V-01</p>
                </div>
                <div>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Permit</p>
                  <p className="text-xs font-semibold mt-0.5 text-neutral-800">{vehicle.permit?.permit_id ?? "—"}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Protocol</p>
                  <p className="text-xs font-semibold text-neutral-800 mt-0.5">{vehicle.vip_info.protocol}</p>
                </div>
              </div>
            </div>
          </>
        )}

        {/* Permit details (WHITELIST/VIP) */}
        {(isVehicleAuth || isVehicleVip) && vehicle.permit && (
          <>
            <SectionLabel>Permit Details</SectionLabel>
            <div className="px-6 py-4 border-b border-neutral-50 grid grid-cols-2 gap-3">
              {[
                { label: "Permit ID",   value: vehicle.permit.permit_id, mono: true },
                { label: "Valid Until", value: vehicle.permit.valid_until },
                { label: "Zone",        value: vehicle.permit.zone },
                { label: "Enrolled",    value: vehicle.permit.enrolled_date },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
                  <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-mono")}>{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Owner info (WHITELIST/VIP) */}
        {vehicle.owner && (isVehicleAuth || isVehicleVip) && (
          <>
            <SectionLabel>Registered Owner</SectionLabel>
            <div className="px-6 py-4 border-b border-neutral-50 grid grid-cols-2 gap-3">
              {[
                { label: "Name",         value: vehicle.owner.name },
                { label: "Employee ID",  value: vehicle.owner.employee_id, mono: true },
                { label: "Department",   value: vehicle.owner.department },
                { label: "Access Level", value: vehicle.owner.access_level },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
                  <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-mono")}>{item.value}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {/* Detection Event */}
        <SectionLabel>Detection Event</SectionLabel>
        <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-neutral-50">
          {[
            { label: "Timestamp",  value: vehicle.last_detection.timestamp },
            { label: "Camera",     value: `${vehicle.last_detection.camera_label} · ${vehicle.last_detection.camera_id}` },
            { label: "Confidence", value: `${vehicle.last_detection.confidence}%`, mono: true },
            { label: "Entry Status", value: vehicle.last_detection.entry_status ?? "—" },
          ].map(item => (
            <div key={item.label}>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
              <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
            </div>
          ))}
          <div className="col-span-2 flex gap-2 pt-1">
            <button
              onClick={() => setVehicleFramesOpen(true)}
              className="flex items-center gap-1.5 h-7 px-2.5 rounded border border-[#00775B]/50 text-[#00775B] text-[11px] font-semibold hover:bg-[#E5FFF9] transition-colors"
            >
              <Eye className="w-3 h-3" />View Frames
            </button>
          </div>
        </div>

        {/* Vehicle frames carousel */}
        {vehicleFramesOpen && (
          <FramesCarouselModal
            images={Array.from({ length: 6 }, (_, i) => `https://i.pravatar.cc/400?u=${vehicle.id}-veh-frame-${i}`)}
            title={vehicle.plate}
            onClose={() => setVehicleFramesOpen(false)}
          />
        )}

        {/* Vehicle journey */}
        {vehicle.journey.length > 0 && (
          <>
            <SectionLabel>Movement Path</SectionLabel>
            <VehicleJourneyTimeline vehicle={vehicle} />
          </>
        )}

        {vehicle.sighting_history.yesterday.length > 0 && (
          <div className="pb-6">
            <VehicleSightingRows
              sightings={vehicle.sighting_history.yesterday}
              membership={vehicle.list_membership}
              showAll={showOlderYesterday}
              onShowAll={() => setShowOlderYesterday(true)}
              label="Detection Log — Yesterday"
            />
          </div>
        )}
      </SlidePanel>
    );
  }

  // ── Face mode ───────────────────────────────────────────────────────────────
  const resolvedId = personId ?? DEFAULT_BY_TYPE[entityType] ?? "f5";
  const entity = PANEL_ENTITIES[resolvedId] ?? PANEL_ENTITIES.f5;

  const isMatched   = entity.match_status === "MATCHED";
  const isWhitelist = entity.list_membership === "WHITELIST";
  const isUnknown   = entity.list_membership === "UNKNOWN";
  const isBlacklist = entity.list_membership === "BLACKLIST";
  const isVIP       = entity.list_membership === "VIP";

  const notifyAccent = isBlacklist ? "#E7000B" : isVIP ? "#7c3aed" : "#00775B";
  const notifyGroups = groups ?? DEFAULT_NOTIFY_GROUPS;
  const displayConfidence = isMatched ? entity.last_detection.match_confidence : entity.last_detection.detection_confidence;

  // ── Sticky footer: notify dropdown + send ──────────────────────────────────
  const StickyActions = () => {
    const [selected, setSelected] = useState<string[]>([]);
    const [dropOpen, setDropOpen] = useState(false);
    const [sent, setSent]         = useState(false);

    const toggle = (g: string) => setSelected(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);
    const send   = () => { if (!selected.length) return; setSent(true); setTimeout(() => { setSent(false); setSelected([]); }, 3000); };

    const accentBg  = isBlacklist ? "bg-red-600 hover:bg-red-700" : isVIP ? "bg-purple-600 hover:bg-purple-700" : "bg-[#00775B] hover:bg-[#006349]";

    return (
      <div className="px-4 py-3 bg-white flex items-center gap-2">
        {/* Primary: Notify */}
        <button
          className={cn("shrink-0 h-9 px-3 rounded text-[12px] font-bold text-white flex items-center gap-1.5 transition-colors", accentBg)}
        >
          <Mail className="w-3.5 h-3.5" />
          Notify
        </button>

        {/* Notify dropdown — flex-1 */}
        <div className="relative flex-1">
          <button
            onClick={() => setDropOpen(v => !v)}
            className="w-full h-9 flex items-center justify-between px-3 rounded border border-neutral-200 text-[12px] text-neutral-600 hover:border-neutral-300 bg-white transition-colors"
          >
            <span className="truncate">
              {selected.length === 0 ? "Notify recipients…" : selected.length === 1 ? selected[0] : `${selected.length} recipients selected`}
            </span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 shrink-0 transition-transform", dropOpen && "rotate-180")} />
          </button>
          {dropOpen && (
            <div className="absolute bottom-full mb-1 left-0 right-0 bg-white border border-neutral-200 rounded shadow-lg z-50 max-h-48 overflow-y-auto">
              {notifyGroups.map(g => (
                <label key={g} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer hover:bg-neutral-50 border-b border-neutral-50 last:border-0">
                  <input type="checkbox" checked={selected.includes(g)} onChange={() => toggle(g)}
                    className="w-3.5 h-3.5 cursor-pointer shrink-0" style={{ accentColor: notifyAccent }} />
                  <span className="text-[12px] text-neutral-700 font-medium">{g}</span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Send button */}
        <button
          onClick={send}
          disabled={!selected.length || sent}
          className={cn(
            "shrink-0 h-9 px-3 rounded text-[12px] font-bold flex items-center gap-1.5 transition-colors",
            selected.length && !sent ? "bg-[#00775B] text-white hover:bg-[#006349]" : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
          )}
        >
          {sent ? <><CheckCircle2 className="w-3.5 h-3.5" />Sent</> : <><Mail className="w-3.5 h-3.5" />Send</>}
        </button>
      </div>
    );
  };

  return (
    <SlidePanel
      isOpen={isOpen}
      onClose={onClose}
      title={entity.display_name}
      subtitle={`${entity.last_detection.camera_label} · ${entity.last_detection.camera_id}`}
      footer={!isWhitelist ? <StickyActions /> : undefined}
    >

      {/* ── Hero section ─────────────────────────────────────────────────────── */}
      <div className="px-5 py-5 border-b border-neutral-100">
        {/* Current Location pill */}
        <div className="flex items-center gap-1.5 mb-3">
          <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400">Current Location</span>
          <span className={cn(
            "inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full",
            isBlacklist ? "bg-red-50 text-red-700 border border-red-200" :
            isVIP ? "bg-purple-50 text-purple-700 border border-purple-200" :
            "bg-[#E5FFF9] text-[#00775B] border border-[#00775B]/20"
          )}>
            <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
            {entity.last_detection.camera_label}
          </span>
        </div>

        <div className="flex gap-4">
          {/* Face image */}
          <div className="relative w-40 h-40 rounded shrink-0 overflow-hidden bg-neutral-100">
            {(entity.photo_url && !avatarFailed) ? (
              <img
                src={entity.photo_url}
                alt={entity.display_name}
                className="w-full h-full object-cover"
                onError={() => setAvatarFailed(true)}
              />
            ) : (
              <div className={cn("w-full h-full flex items-center justify-center text-4xl font-black",
                AVATAR_TEXT[entity.list_membership] ?? AVATAR_TEXT.UNKNOWN)}>
                {entity.initials}
              </div>
            )}
            {/* Bottom: FACE confidence overlay */}
            <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60">
              <span className="text-[10px] font-bold text-emerald-400 font-mono">
                FACE {displayConfidence}%
              </span>
            </div>
            {/* Top-right: LIVE badge */}
            {entity.sighting_history.today.some(s => s.is_current) && (
              <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-red-600/90 rounded px-1.5 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span className="text-[9px] font-black text-white tracking-wide">LIVE</span>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              {/* Row 1: Name + badge */}
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-xl font-black text-neutral-900 leading-tight">
                  {entity.display_name}
                </h2>
                <MembershipBadge membership={entity.list_membership} />
              </div>

              {/* Row 2: status + timestamp */}
              <div className="flex items-center gap-2 mt-1">
                {isBlacklist && (
                  <span className="flex items-center gap-1 text-[12px] font-bold text-red-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 animate-pulse" />
                    ACTIVE THREAT
                  </span>
                )}
                {isVIP && (
                  <span className="flex items-center gap-1 text-[12px] font-bold text-purple-600">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                    VIP PROTOCOL
                  </span>
                )}
                {!isBlacklist && !isVIP && entity.metadata && (
                  <span className="text-[12px] text-neutral-500 font-medium">
                    {entity.metadata.department} · {entity.metadata.access_level}
                  </span>
                )}
                {isUnknown && !isBlacklist && !isVIP && (
                  <span className="text-[12px] text-neutral-400 italic">Identity not established</span>
                )}
                <span className="font-mono text-[11px] text-neutral-400">
                  {entity.last_detection.timestamp.split(" · ")[1]?.split(" ")[0] ?? ""}
                </span>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-neutral-100 my-3" />

            {/* 3-col meta grid */}
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Zone</p>
                <p className="font-bold text-sm text-neutral-900 truncate">
                  {entity.last_detection.camera_label}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">Camera</p>
                <p className="font-bold text-sm text-neutral-900 font-mono truncate">
                  {entity.last_detection.camera_id}
                </p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-neutral-400 mb-1">
                  {isUnknown ? "Detection Score" : "Face Similarity"}
                </p>
                <p className={cn("font-bold text-sm",
                  displayConfidence >= 90 ? "text-emerald-600" :
                  displayConfidence >= 75 ? "text-amber-500" :
                  "text-red-600"
                )}>
                  {displayConfidence}%
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enroll form */}
      {enrollOpen && (
        <EnrollForm onClose={() => setEnrollOpen(false)} onSuccess={() => setEnrolled(true)} />
      )}

      {/* VIP Protocol */}
      {isVIP && entity.vip_info && (
        <>
          <SectionLabel>VIP Protocol</SectionLabel>
          <div className="mx-6 my-4 rounded border border-purple-200 bg-purple-50/40 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Star className="w-4 h-4 text-purple-600" />
              <p className="text-xs font-bold text-purple-800 uppercase tracking-wide">VIP Protocol Active</p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Title</p>
                <p className="text-xs font-semibold text-neutral-800 mt-0.5">{entity.vip_info.title}</p>
              </div>
              <div>
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Escort Required</p>
                <p className={cn("text-xs font-bold mt-0.5", entity.vip_info.escort ? "text-purple-700" : "text-neutral-600")}>
                  {entity.vip_info.escort ? "Yes — Notify security" : "No"}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide">Protocol</p>
                <p className="text-xs font-semibold text-neutral-800 mt-0.5">{entity.vip_info.protocol}</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ── Movement Path Tracking ───────────────────────────────────────────── */}
      {entity.journey.length > 0 && (() => {
        const { journey, journey_transit, journey_summary } = entity;
        return (
          <div className="border-b border-neutral-100">
            {/* Section header */}
            <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Navigation className="w-3 h-3 text-neutral-400" />
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Movement Path Tracking</p>
              </div>
              <span className="text-[10px] text-neutral-400 font-mono">
                {journey_summary.start_time} → {journey_summary.end_time} · {journey.length} checkpoints
              </span>
            </div>

            {/* Vertical journey entries */}
            <div className="divide-y divide-neutral-100">
              {journey.map((stop, i) => {
                const isLastStop = i === journey.length - 1;
                const hasAlertStr = stop.alerts.join(" ").toUpperCase();
                const isAlerted = hasAlertStr.includes("BLACKLIST") || hasAlertStr.includes("UNAUTHORISED") || hasAlertStr.includes("BOLO");
                const rowBg = isLastStop
                  ? (isBlacklist ? "bg-red-50/60" : isVIP ? "bg-purple-50/40" : "bg-[#E5FFF9]/50")
                  : "bg-white";
                const dotColor = isAlerted ? "bg-red-500" : isLastStop ? (isBlacklist ? "bg-red-500" : "bg-[#00775B]") : "bg-neutral-300";

                return (
                  <div key={stop.seq}>
                    <div className={cn("flex gap-3 px-5 py-3.5", rowBg)}>
                      {/* Left: dot + connector */}
                      <div className="flex flex-col items-center shrink-0 pt-1">
                        <div className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor,
                          isLastStop && isBlacklist && "ring-2 ring-red-300")} />
                        {!isLastStop && <div className="w-px flex-1 bg-neutral-200 mt-1" style={{ minHeight: 28 }} />}
                      </div>

                      {/* Thumbnail */}
                      <div className="w-12 h-12 rounded-[3px] overflow-hidden bg-neutral-100 shrink-0">
                        <img
                          src={entity.photo_url ?? `https://i.pravatar.cc/96?u=${entity.id}-stop-${i}`}
                          alt=""
                          className="w-full h-full object-cover"
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        {/* Top row: location + time */}
                        <div className="flex items-center justify-between gap-2">
                          <p className="font-bold text-[13px] text-neutral-900 truncate">{stop.camera}</p>
                          <span className="font-mono text-[11px] text-neutral-500 shrink-0">{stop.time}</span>
                        </div>
                        {/* Sub-row: camera ID + dwell */}
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">{stop.camera_id}</p>
                        {/* Direction / context line */}
                        <p className="text-[11px] text-neutral-500 mt-1 leading-snug">{stop.direction}</p>
                        {/* Transit to next */}
                        {i < journey.length - 1 && journey_transit[i] && (
                          <p className="text-[10px] text-neutral-300 font-mono mt-0.5">↓ {journey_transit[i]} to next</p>
                        )}
                        {/* Tags row */}
                        <div className="flex flex-wrap gap-1 mt-1.5">
                          <span className="text-[9px] text-neutral-400 font-mono bg-neutral-100 px-1.5 py-0.5 rounded">
                            {stop.duration}s in frame
                          </span>
                          {stop.alerts.map(alert => (
                            <span key={alert} className={cn(
                              "text-[9px] font-bold px-1.5 py-0.5 rounded-full border",
                              alertBadgeStyle(alert)
                            )}>
                              {alert}
                            </span>
                          ))}
                          {stop.lpr && (
                            <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 font-semibold font-mono">
                              Linked: {stop.lpr}
                            </span>
                          )}
                          {isLastStop && (
                            <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border",
                              isBlacklist ? "bg-red-50 text-red-700 border-red-200" : "bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20"
                            )}>
                              {isBlacklist ? "ACTIVE NOW" : "CURRENT"}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Detection Event */}
      <SectionLabel>Detection Event</SectionLabel>
      <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-neutral-50">
        {[
          { label: "Timestamp",            value: entity.last_detection.timestamp },
          { label: "Camera",               value: `${entity.last_detection.camera_label} · ${entity.last_detection.camera_id}` },
          { label: "Frame #",              value: entity.last_detection.frame_number, mono: true },
          { label: "Duration in Frame",    value: `${entity.last_detection.duration_in_frame_sec}s`, mono: true },
          { label: "Detection Confidence", value: `${entity.last_detection.detection_confidence}%`, mono: true },
          isMatched
            ? { label: "Match Confidence", value: `${entity.last_detection.match_confidence}%`, mono: true }
            : { label: "Best Attempt",     value: `${entity.last_detection.detection_confidence}% (below ${entity.recognition_attempt?.threshold ?? 75}% threshold)`, mono: true },
        ].map(item => (
          <div key={item.label}>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
            <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
          </div>
        ))}
        <div className="col-span-2 flex gap-2 pt-1">
          <button
            onClick={() => setFramesOpen(true)}
            className="flex items-center gap-1.5 h-7 px-2.5 rounded border border-[#00775B]/50 text-[#00775B] text-[11px] font-semibold hover:bg-[#E5FFF9] transition-colors"
          >
            <Eye className="w-3 h-3" />View Frames
          </button>
        </div>
      </div>

      {/* Frames Carousel */}
      {framesOpen && (() => {
        const frameImages = entity.photo_url
          ? [entity.photo_url, entity.photo_url, entity.photo_url, entity.photo_url, entity.photo_url, entity.photo_url]
              .map((url, i) => i === 0 ? url : `https://i.pravatar.cc/400?u=${entity.id}-frame-${i}`)
          : Array.from({ length: 6 }, (_, i) => `https://i.pravatar.cc/400?u=${entity.id}-frame-${i}`);
        return <FramesCarouselModal images={frameImages} title={entity.display_name} onClose={() => setFramesOpen(false)} />;
      })()}

      {/* Recognition Result — matched entities only */}
      {isMatched && (
        <>
          <SectionLabel>
            {`Recognition Result — ${isBlacklist ? "Blacklist Match" : isVIP ? "VIP Identified" : "Matched"}`}
          </SectionLabel>
          <div className={cn("mx-6 my-4 rounded border p-4",
            isBlacklist ? "bg-[#FFE5E7] border-[#E7000B]/20" :
            isVIP ? "bg-purple-50 border-purple-200" :
            "bg-[#E5FFF9] border-[#00775B]/20"
          )}>
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Name",              value: entity.display_name },
                { label: "Employee ID",       value: entity.metadata?.employee_id ?? "—", mono: true },
                { label: "Department",        value: entity.metadata?.department ?? entity.vip_info?.title ?? "—" },
                { label: "Access Level",      value: entity.metadata?.access_level ?? "—" },
                { label: "Match Score",       value: `${entity.last_detection.match_confidence}%`, mono: true },
                { label: "Enrolled",          value: entity.enrollment?.enrolled_date ?? "—" },
                { label: "Last Seen Before",  value: entity.enrollment?.last_seen_before ?? "—" },
                { label: "Appearances (MTD)", value: String(entity.enrollment?.monthly_appearances ?? "—"), mono: true },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
                  <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {/* Appearance Pattern (UNKNOWN) */}
      {isUnknown && entity.appearance_summary && (
        <>
          <SectionLabel>Appearance Pattern</SectionLabel>
          <div className="px-6 py-4 border-b border-neutral-100">
            <div className="grid grid-cols-2 gap-3">
              {[
                { label: "Total Appearances", value: String(entity.appearance_summary.total_appearances), mono: true },
                { label: "Days Seen",         value: String(entity.appearance_summary.days_seen), mono: true },
                { label: "Typical Time",      value: entity.appearance_summary.typical_time_window },
                { label: "Avg Dwell",         value: `${entity.appearance_summary.avg_dwell_sec}s`, mono: true },
              ].map(item => (
                <div key={item.label}>
                  <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
                  <p className={cn("text-xs font-semibold text-neutral-800 mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
                </div>
              ))}
              <div className="col-span-2">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wide mb-1">Cameras Seen</p>
                <div className="flex flex-wrap gap-1">
                  {entity.appearance_summary.cameras_seen.map(c => (
                    <span key={c} className="text-[10px] bg-neutral-100 text-neutral-600 border border-neutral-200 px-2 py-0.5 rounded font-mono">{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {entity.sighting_history.yesterday.length > 0 && (
        <div className="pb-6">
          <SightingRows
            sightings={entity.sighting_history.yesterday}
            membership={entity.list_membership}
            showAll={showOlderYesterday}
            onShowAll={() => setShowOlderYesterday(true)}
            label="Sighting History — Yesterday"
          />
        </div>
      )}

    </SlidePanel>
  );
};
