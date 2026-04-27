import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { SlidePanel } from "./SlidePanel";
import { cn } from "@/app/lib/utils";
import {
  ShieldAlert, Star, User, Camera, Car,
  CheckCircle2,
  UserPlus, Eye, Mail, X,
  Navigation, ChevronDown, ChevronUp,
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
  plate_image_url?: string;
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
    photo_url: "/people/man1.avif",
    list_membership: "BLACKLIST",
    last_detection: {
      timestamp: "2026-04-06 · 14:31:22 IST", camera_id: "CAM-LB-01", camera_label: "Main Lobby",
      match_confidence: 94.7, detection_confidence: 96.0, duration_in_frame_sec: 6.1, frame_number: "22,134",
    },
    enrollment: { enrolled_date: "2025-02-10", enrolled_by: "security@hq.com", last_seen_before: "2026-03-12 · 11:14 · South Entrance", total_appearances: 7, monthly_appearances: 3 },
    sighting_history: {
      today: [
        { timestamp: "14:31", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 94.7, duration_sec: 6.1,  alerts: ["BLACKLIST_ACTIVE"],  is_current: true,  seed: "mw-lb-curr"  },
        { timestamp: "14:11", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 92.3, duration_sec: 2.2,  alerts: [],                    seed: "mw-ne-mid"  },
        { timestamp: "08:58", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 91.8, duration_sec: 38.0, alerts: ["UNAUTHORISED_ENTRY"], seed: "mw-se-am"   },
        { timestamp: "08:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 89.2, duration_sec: 3.8,  alerts: [],                    seed: "mw-pg-am"   },
      ],
      yesterday: [],
    },
    journey: [
      { seq: 1, camera: "Parking Garage", camera_id: "CAM-PG-01", time: "08:52", confidence: 89.2, duration: 3.8,  direction: "Entered via vehicle drop-off",       alerts: [] },
      { seq: 2, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:58", confidence: 91.8, duration: 38.0, direction: "Entered building through side door",  alerts: ["UNAUTHORISED ENTRY"] },
      { seq: 3, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:11", confidence: 92.3, duration: 2.2,  direction: "Re-entered via north corridor",       alerts: [] },
      { seq: 4, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "14:31", confidence: 94.7, duration: 6.1,  direction: "Currently active in main lobby",     alerts: ["BLACKLIST ACTIVE"] },
    ],
    journey_transit: ["6 min", "5h 13min", "20 min"],
    journey_summary: { start_time: "08:52", end_time: "14:31", total_duration_min: 339 },
  },

  f2: {
    id: "f2", tracker_id: 88, match_status: "UNMATCHED",
    display_name: "Unknown #88", initials: "?",
    photo_url: "/people/women2.avif",
    list_membership: "UNKNOWN",
    recognition_attempt: {
      best_match_score: 61.2, threshold: 75.0,
      possible_reasons: ["Person not enrolled in the system", "Sub-optimal face angle at South Entrance", "Possible partial occlusion detected"],
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
        { timestamp: "14:30", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 63.1, duration_sec: 38.0, alerts: ["HIGH_DWELL"], is_current: true, seed: "ep-se-curr" },
        { timestamp: "09:05", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 61.4, duration_sec: 18.0, alerts: [],             seed: "ep-lb-am"   },
        { timestamp: "08:41", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 62.0, duration_sec: 31.0, alerts: [],             seed: "ep-se-am"   },
      ],
      yesterday: [
        { timestamp: "09:08", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 60.5, duration_sec: 29.0, alerts: [], seed: "ep-ye-se01" },
      ],
    },
    journey: [
      { seq: 1, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:41", confidence: 62.0, duration: 31.0, direction: "Arrived at south entrance",  alerts: [] },
      { seq: 2, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "09:05", confidence: 61.4, duration: 18.0, direction: "Entered main lobby area",     alerts: [] },
      { seq: 3, camera: "South Entrance", camera_id: "CAM-SE-01", time: "14:30", confidence: 63.1, duration: 38.0, direction: "Returned — prolonged dwell",  alerts: ["HIGH DWELL"] },
    ],
    journey_transit: ["24 min", "5h 25min"],
    journey_summary: { start_time: "08:41", end_time: "14:30", total_duration_min: 349 },
  },

  f3: {
    id: "f3", tracker_id: 7, match_status: "MATCHED",
    display_name: "Rajesh Mehta", initials: "RM",
    photo_url: "/people/man3.jpg",
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
        { timestamp: "14:31", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 97.3, duration_sec: 3.2, alerts: ["VIP_ARRIVAL"], is_current: true, seed: "rm-ne-curr" },
      ],
      yesterday: [
        { timestamp: "19:42", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 96.8, duration_sec: 2.8, alerts: [], seed: "rm-ye-ne01" },
        { timestamp: "08:30", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 97.1, duration_sec: 3.1, alerts: [], seed: "rm-ye-ne02" },
      ],
    },
    journey: [
      { seq: 1, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:31", confidence: 97.3, duration: 3.2, direction: "Arrived — escort protocol active", alerts: ["VIP ARRIVAL"] },
    ],
    journey_transit: [],
    journey_summary: { start_time: "14:31", end_time: "14:31", total_duration_min: 0 },
  },

  f4: {
    id: "f4", tracker_id: 47, match_status: "MATCHED",
    display_name: "John Smith", initials: "JS",
    photo_url: "/people/man2.webp",
    list_membership: "WHITELIST",
    metadata: { employee_id: "EMP-4821", department: "Engineering", access_level: "L3 — Restricted Zones" },
    last_detection: {
      timestamp: "2026-04-06 · 14:29:45 IST", camera_id: "CAM-LB-01", camera_label: "Main Lobby",
      match_confidence: 96.1, detection_confidence: 97.2, duration_in_frame_sec: 8.3, frame_number: "14,402",
    },
    enrollment: { enrolled_date: "2025-08-14", enrolled_by: "hr@hq.com", last_seen_before: "2026-04-05 · 17:41 · North Entrance", total_appearances: 312, monthly_appearances: 22 },
    sighting_history: {
      today: [
        { timestamp: "14:29", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 96.1, duration_sec: 8.3,  alerts: [],                  is_current: true, seed: "js-lb-curr" },
        { timestamp: "14:11", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.8, duration_sec: 2.1,  alerts: [],                               seed: "js-ne-am"   },
        { timestamp: "08:58", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 93.2, duration_sec: 42.0, alerts: ["TAILGATE_DETECTED"],             seed: "js-se-am"   },
        { timestamp: "08:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 91.8, duration_sec: 4.2,  alerts: [], linked_lpr: "KA05MJ4421",     seed: "js-pg-am"   },
      ],
      yesterday: [
        { timestamp: "17:41", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.3, duration_sec: 3.4, alerts: [], seed: "js-ye-ne01" },
        { timestamp: "08:44", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 94.1, duration_sec: 5.1, alerts: [], seed: "js-ye-lb01" },
      ],
    },
    journey: [
      { seq: 1, camera: "Parking Garage", camera_id: "CAM-PG-01", time: "08:52", confidence: 91.8, duration: 4.2,  direction: "Entering from street level",   alerts: [],                     lpr: "KA05MJ4421" },
      { seq: 2, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:58", confidence: 93.2, duration: 42.0, direction: "Entering building — tailgate",  alerts: ["TAILGATE DETECTED"] },
      { seq: 3, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:11", confidence: 95.8, duration: 2.1,  direction: "Moving toward main lobby",      alerts: [] },
      { seq: 4, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "14:29", confidence: 96.1, duration: 8.3,  direction: "In main lobby area",           alerts: [] },
    ],
    journey_transit: ["6 min", "5h 13min", "18 min"],
    journey_summary: { start_time: "08:52", end_time: "14:29", total_duration_min: 337 },
  },

  f5: {
    id: "f5", tracker_id: 21, match_status: "MATCHED",
    display_name: "Sarah Johnson", initials: "SJ",
    photo_url: "/people/women1.avif",
    list_membership: "WHITELIST",
    metadata: { employee_id: "EMP-2198", department: "Human Resources", access_level: "L2 — Standard Access" },
    last_detection: {
      timestamp: "2026-04-06 · 14:27:14 IST", camera_id: "CAM-RC-01", camera_label: "Reception",
      match_confidence: 95.4, detection_confidence: 97.2, duration_in_frame_sec: 12.1, frame_number: "28,809",
    },
    enrollment: { enrolled_date: "2024-03-20", enrolled_by: "hr@hq.com", last_seen_before: "2026-04-05 · 08:51 · North Entrance", total_appearances: 187, monthly_appearances: 22 },
    sighting_history: {
      today: [
        { timestamp: "14:27", camera_label: "Reception",      camera_id: "CAM-RC-01", confidence: 95.4, duration_sec: 12.1, alerts: [], is_current: true, seed: "sj-rc-curr" },
        { timestamp: "14:06", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 94.8, duration_sec: 2.4,  alerts: [],                   seed: "sj-ne-am"   },
      ],
      yesterday: [
        { timestamp: "17:33", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 93.9, duration_sec: 2.1, alerts: [], seed: "sj-ye-ne01" },
        { timestamp: "08:51", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 95.1, duration_sec: 1.9, alerts: [], seed: "sj-ye-ne02" },
      ],
    },
    journey: [
      { seq: 1, camera: "North Entrance", camera_id: "CAM-NE-01", time: "14:06", confidence: 94.8, duration: 2.4,  direction: "Entering building", alerts: [] },
      { seq: 2, camera: "Reception",      camera_id: "CAM-RC-01", time: "14:27", confidence: 95.4, duration: 12.1, direction: "At reception desk",  alerts: [] },
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
    plate_image_url: "/vehicle/1_qre-gAVNTuazaUPvNw2w-Q.jpg",
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
    plate_image_url: "/vehicle/images (1).jpeg",
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
    plate_image_url: "/vehicle/images (2).jpeg",
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
    plate_image_url: "/vehicle/green-car-license-number-plate-2167603229-wj5z7ib5.avif",
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
    plate_image_url: "/vehicle/images (3).jpeg",
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
    plate_image_url: "/vehicle/images.jpeg",
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

// ─── Style helpers ────────────────────────────────────────────────────────────
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
function entryStatusPill(status?: string): string {
  if (!status) return "bg-neutral-100 text-neutral-500 border-neutral-200";
  const s = status.toUpperCase();
  const map: Record<string, string> = {
    AUTHORISED: "bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20",
    BLOCKED:    "bg-red-50 text-red-700 border-red-200",
    PARKED:     "bg-neutral-100 text-neutral-600 border-neutral-200",
    EXIT:       "bg-blue-50 text-blue-600 border-blue-200",
    CIRCLING:   "bg-amber-50 text-amber-700 border-amber-200",
    DETECTED:   "bg-neutral-100 text-neutral-500 border-neutral-200",
  };
  const key = Object.keys(map).find(k => s.includes(k)) ?? "";
  return map[key] ?? "bg-neutral-100 text-neutral-500 border-neutral-200";
}

// ─── Atom components ──────────────────────────────────────────────────────────
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

// ─── InfoGrid — reusable 2-col field section ──────────────────────────────────
function InfoGrid({ label, fields }: {
  label: string;
  fields: Array<{ label: string; value: string; mono?: boolean; span?: boolean }>;
}) {
  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <div className="px-6 py-4 border-b border-neutral-50 grid grid-cols-2 gap-3">
        {fields.map(item => (
          <div key={item.label} className={item.span ? "col-span-2" : ""}>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
            <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-mono tabular-nums")}>{item.value}</p>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Forms ────────────────────────────────────────────────────────────────────
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
          <input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} placeholder="Enter full name"
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
            <input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} placeholder="EMP-XXXX"
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
        <div className="flex gap-2 pt-1">
          <button onClick={onClose} className="flex-1 h-8 rounded border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
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
          <input value={form.ownerName} onChange={e => setForm(p => ({ ...p, ownerName: e.target.value }))} placeholder="Enter owner name"
            className="w-full h-8 px-3 rounded border border-neutral-200 text-[12px] bg-white focus:outline-none focus:border-[#00775B] transition-colors" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wide text-neutral-400 mb-1">Employee ID</label>
            <input value={form.employeeId} onChange={e => setForm(p => ({ ...p, employeeId: e.target.value }))} placeholder="EMP-XXXX"
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
          <button onClick={onClose} className="flex-1 h-8 rounded border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors">Cancel</button>
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

// ─── StickyNotifyFooter (must stay at top-level — never define inside render) ─
function StickyNotifyFooter({ groups }: { groups: string[] }) {
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
    <div className="px-4 py-3 bg-white border-t border-neutral-100 flex items-center gap-2">
      {/* Recipient dropdown — prominent */}
      <div className="relative flex-1">
        <button
          onClick={() => setDropOpen(v => !v)}
          className={cn(
            "w-full h-9 flex items-center justify-between px-3 rounded-[6px] border-2 text-[12px] font-medium transition-colors",
            dropOpen
              ? "border-[#00775B] bg-[#E5FFF9] text-[#00775B]"
              : selected.length
                ? "border-[#00775B]/60 bg-[#F0FDF8] text-neutral-700 hover:border-[#00775B]"
                : "border-[#00775B]/30 bg-[#F7FDFB] text-neutral-500 hover:border-[#00775B]/60"
          )}
        >
          <div className="flex items-center gap-2 min-w-0">
            <Mail className="w-3.5 h-3.5 text-[#00775B] shrink-0" />
            <span className="truncate">
              {selected.length === 0
                ? "Select recipients to notify…"
                : selected.length === 1
                  ? selected[0]
                  : `${selected.length} recipients selected`}
            </span>
          </div>
          <ChevronDown className={cn("w-3.5 h-3.5 text-[#00775B] shrink-0 transition-transform", dropOpen && "rotate-180")} />
        </button>
        {dropOpen && (
          <div
            className="absolute bottom-full mb-1.5 left-0 right-0 bg-white border border-neutral-200 rounded-[6px] shadow-xl z-[1000] max-h-48 overflow-y-auto"
            onMouseDown={e => e.preventDefault()}
          >
            {groups.map(g => (
              <label key={g} className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer hover:bg-neutral-50 border-b border-neutral-50 last:border-0">
                <input type="checkbox" checked={selected.includes(g)} onChange={() => toggle(g)}
                  className="w-3.5 h-3.5 cursor-pointer shrink-0" style={{ accentColor: "#00775B" }} />
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
          "shrink-0 h-9 px-4 rounded-[6px] text-[12px] font-bold flex items-center gap-1.5 transition-colors",
          selected.length && !sent
            ? "bg-[#00775B] text-white hover:bg-[#006349]"
            : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
        )}
      >
        {sent
          ? <><CheckCircle2 className="w-3.5 h-3.5" />Sent</>
          : <><Mail className="w-3.5 h-3.5" />Send</>}
      </button>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// UNIFIED SECTION COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════════

// ─── PanelHero — shared hero for both FR and LPR ─────────────────────────────
interface PanelHeroProps {
  photoUrl?: string;
  initials: string;
  displayName: string;
  tagline: string;
  membership: string;
  isVehicle?: boolean;
  confidence: number;
  confidenceLabel: string;        // "FACE" | "PLATE"
  isLive?: boolean;
  currentLocation: string;
  cameraId: string;
  metaC: { label: string; value: string; colored?: boolean };
  metaD: { label: string; value: string };
  avatarFailed?: boolean;
  onAvatarError?: () => void;
  canEnroll?: boolean;    onEnroll?: () => void;   enrolled?: boolean;
  canRegister?: boolean;  onRegister?: () => void; registered?: boolean;
}

function PanelHero({
  photoUrl, initials, displayName, tagline, membership, isVehicle,
  confidence, confidenceLabel, isLive,
  currentLocation, cameraId, metaC, metaD,
  avatarFailed, onAvatarError,
  canEnroll, onEnroll, enrolled,
  canRegister, onRegister, registered,
}: PanelHeroProps) {
  const avatarBorder = AVATAR_BORDER[membership] ?? AVATAR_BORDER.UNKNOWN;
  const avatarText   = AVATAR_TEXT[membership]   ?? AVATAR_TEXT.UNKNOWN;
  const showPhoto    = photoUrl && !avatarFailed;
  const conf = confidence;

  return (
    <div className="px-5 py-5 border-b border-neutral-100">
      <div className="flex gap-4">
        {/* Subject image */}
        <div className={cn(
          "relative shrink-0 overflow-hidden rounded border-2",
          isVehicle ? "w-44 h-28" : "w-40 h-40",
          avatarBorder
        )}>
          {showPhoto ? (
            <img src={photoUrl} alt={displayName}
              className="w-full h-full object-cover"
              onError={onAvatarError} />
          ) : (
            <div className={cn(
              "w-full h-full flex items-center justify-center font-black",
              isVehicle ? "text-base font-mono tracking-widest" : "text-4xl",
              avatarText
            )}>
              {isVehicle ? initials.slice(0, 10) : initials}
            </div>
          )}
          {/* Confidence strip at bottom */}
          <div className="absolute bottom-0 left-0 right-0 px-2 py-1 bg-black/60">
            <span className="text-[10px] font-bold text-emerald-400 font-mono">
              {confidenceLabel} {conf}%
            </span>
          </div>
          {/* Live badge */}
          {isLive && (
            <div className="absolute top-1.5 right-1.5 flex items-center gap-1 bg-red-600/90 rounded px-1.5 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              <span className="text-[9px] font-black text-white tracking-wide">LIVE</span>
            </div>
          )}
        </div>

        {/* Right column */}
        <div className="flex-1 min-w-0 flex flex-col justify-between">
          <div>
            {/* Row 1: name/plate + badge */}
            <div className="flex items-start justify-between gap-2">
              <h2 className={cn("font-black text-neutral-900 leading-tight",
                isVehicle ? "text-[17px] font-mono tracking-wider" : "text-xl")}>
                {displayName}
              </h2>
              <MembershipBadge membership={membership} isVehicle={isVehicle} />
            </div>
            {/* Row 2: tagline */}
            <p className="text-[12px] text-neutral-500 font-medium mt-1 truncate">{tagline}</p>
            {/* Quick-action links */}
            {canRegister && !registered && (
              <button onClick={onRegister}
                className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#00775B] hover:underline">
                <Car className="w-3 h-3" />Register Vehicle
              </button>
            )}
            {canEnroll && !enrolled && (
              <button onClick={onEnroll}
                className="mt-1 flex items-center gap-1 text-[10px] font-semibold text-[#00775B] hover:underline">
                <UserPlus className="w-3 h-3" />Enroll Person
              </button>
            )}
          </div>

          <div className="border-t border-neutral-100 my-2.5" />

          {/* 2×2 meta grid */}
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5">
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Current Location</p>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full shrink-0 animate-pulse bg-[#00775B]" />
                <p className="font-bold text-[12px] text-neutral-900 truncate leading-tight">{currentLocation}</p>
              </div>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">Camera</p>
              <p className="font-bold text-[12px] text-neutral-900 font-mono truncate leading-tight">{cameraId}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{metaC.label}</p>
              <p className={cn("font-bold text-[12px] leading-tight",
                metaC.colored
                  ? (conf >= 90 ? "text-emerald-600" : conf >= 75 ? "text-amber-500" : "text-red-600")
                  : "text-neutral-900"
              )}>{metaC.value}</p>
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{metaD.label}</p>
              <p className="font-bold text-[12px] text-neutral-900 truncate leading-tight">{metaD.value}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MovementPathSection — shared movement path for both FR and LPR ───────────
interface MovementStop {
  seq: number; camera: string; cameraId: string; time: string;
  confidence: number; durationText?: string;
  direction: string; alerts: string[];
  entryStatus?: string; linkedPlate?: string;
  isCurrent?: boolean; thumbUrl?: string;
}

function MovementPathSection({ stops, transit, start, end }: {
  stops: MovementStop[]; transit: string[];
  start: string; end: string;
}) {
  if (!stops.length) return null;
  return (
    <div className="border-b border-neutral-100">
      {/* Header */}
      <div className="px-6 py-3 bg-neutral-50 border-b border-neutral-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Navigation className="w-3 h-3 text-neutral-400" />
          <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-neutral-400">Movement Path</p>
        </div>
        <span className="text-[10px] text-neutral-400 font-mono">
          {start} → {end} · {stops.length} checkpoint{stops.length !== 1 ? "s" : ""}
        </span>
      </div>

      <div className="divide-y divide-neutral-100">
        {stops.map((stop, i) => {
          const isLast    = i === stops.length - 1;
          const alertStr  = stop.alerts.join(" ").toUpperCase();
          const isAlerted = alertStr.includes("BLACKLIST") || alertStr.includes("UNAUTHORISED") || alertStr.includes("BOLO");
          const dotCol    = isAlerted ? "bg-red-500" : isLast ? "bg-[#00775B]" : "bg-neutral-300";
          const rowBg     = isLast ? "bg-neutral-50" : "bg-white";

          return (
            <div key={stop.seq} className={cn("flex gap-2.5 px-4 py-2.5", rowBg)}>
              {/* Dot + connector */}
              <div className="flex flex-col items-center shrink-0 pt-1.5">
                <div className={cn("w-2 h-2 rounded-full shrink-0", dotCol,
                  isLast && isAlerted && "ring-2 ring-red-200")} />
                {!isLast && <div className="w-px bg-neutral-200 mt-1" style={{ minHeight: 24 }} />}
              </div>

              {/* Thumbnail */}
              <div className="w-10 h-10 rounded-[3px] overflow-hidden bg-neutral-100 shrink-0 mt-0.5">
                {stop.thumbUrl ? (
                  <img src={stop.thumbUrl} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full bg-neutral-200 flex items-center justify-center">
                    <Car className="w-4 h-4 text-neutral-400" />
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-[12px] text-neutral-900 leading-tight truncate">{stop.camera}</p>
                    <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                      <span className="text-[9px] font-mono text-neutral-400">{stop.cameraId}</span>
                      <span className="text-neutral-300 text-[9px]">·</span>
                      <span className={cn("text-[9px] font-bold tabular-nums",
                        stop.confidence >= 90 ? "text-emerald-600" : "text-neutral-500")}>{stop.confidence}%</span>
                      {stop.durationText && (
                        <><span className="text-neutral-300 text-[9px]">·</span>
                        <span className="text-[9px] text-neutral-400 font-mono">{stop.durationText}</span></>
                      )}
                    </div>
                    <p className="text-[10px] text-neutral-500 mt-0.5 leading-snug">{stop.direction}</p>
                  </div>

                  {/* Right: time + badges */}
                  <div className="flex flex-col items-end shrink-0 gap-1">
                    <span className="font-mono text-[13px] font-black text-neutral-800 tabular-nums leading-tight">{stop.time}</span>
                    {stop.entryStatus && (
                      <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap", entryStatusPill(stop.entryStatus))}>
                        {stop.entryStatus}
                      </span>
                    )}
                    {stop.alerts.map(alert => (
                      <span key={alert} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border whitespace-nowrap", alertBadgeStyle(alert))}>
                        {alert}
                      </span>
                    ))}
                    {stop.linkedPlate && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 font-semibold font-mono whitespace-nowrap">
                        LPR: {stop.linkedPlate}
                      </span>
                    )}
                    {isLast && (
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded border whitespace-nowrap bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20">
                        CURRENT
                      </span>
                    )}
                  </div>
                </div>

                {/* Transit time */}
                {i < stops.length - 1 && transit[i] && (
                  <div className="mt-1">
                    <span className="text-[9px] text-neutral-300 font-mono">↓ {transit[i]}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── Frame data helpers ────────────────────────────────────────────────────────
interface FrameData { url: string; frameNum: number; confidence: number; offsetSec: number; }

function buildFrameData(entity: PanelEntity, i: number): FrameData {
  const baseConf  = entity.last_detection.detection_confidence;
  const baseFrame = parseInt(entity.last_detection.frame_number.replace(/,/g, ""), 10) || 0;
  const dwell     = entity.last_detection.duration_in_frame_sec;
  const step      = dwell / 5;
  return {
    url:        entity.photo_url ?? `https://i.pravatar.cc/400?u=${entity.id}-f${i}`,
    frameNum:   baseFrame - (5 - i) * 12,
    confidence: Math.max(60, baseConf - (5 - i) * 1.3),
    offsetSec:  parseFloat(((5 - i) * step).toFixed(1)),
  };
}

function buildVehicleFrameData(vehicle: VehiclePanelEntity, i: number): FrameData {
  return {
    url:        vehicle.plate_image_url ?? `https://i.pravatar.cc/400?u=${vehicle.id}-vf${i}`,
    frameNum:   1000 + i * 24,
    confidence: Math.max(82, vehicle.last_detection.confidence - i * 0.8),
    offsetSec:  parseFloat((i * 1.2).toFixed(1)),
  };
}

// ─── UnifiedFramesAccordion ────────────────────────────────────────────────────
function UnifiedFramesAccordion({ frames, isVehicle, onFrameClick }: {
  frames: FrameData[]; isVehicle?: boolean; onFrameClick: (i: number) => void;
}) {
  return (
    <div className="border-b border-neutral-100 bg-neutral-50/50">
      <div className={cn("px-4 pt-3 pb-4 grid gap-2", isVehicle ? "grid-cols-2" : "grid-cols-3")}>
        {frames.map((f, i) => (
          <button key={i} onClick={() => onFrameClick(i)}
            className={cn(
              "relative overflow-hidden rounded-[4px] border border-neutral-200 group",
              "hover:border-neutral-400 transition-colors bg-neutral-100 cursor-pointer",
              isVehicle ? "aspect-[4/3]" : "aspect-[3/4]"
            )}>
            <img src={f.url} alt="" className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-200" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/70 to-transparent pt-5 pb-1.5 px-1.5 flex items-end justify-between">
              <span className="text-[8px] font-mono text-white/80">Frame {i + 1}</span>
              <span className="text-[8px] font-bold font-mono text-emerald-400">{f.confidence.toFixed(1)}%</span>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <Eye className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── UnifiedFrameDetailPopup ──────────────────────────────────────────────────
interface PopupSubject {
  displayName: string; tagline: string;
  membership: string; isVehicle?: boolean;
  metaItems: Array<{ label: string; value: string; mono?: boolean }>;
}

function UnifiedFrameDetailPopup({ frame, frameIndex, subject, accentColor, onClose }: {
  frame: FrameData; frameIndex: number;
  subject: PopupSubject; accentColor: string; onClose: () => void;
}) {
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl border border-neutral-200 w-[380px] max-w-full overflow-hidden">

        {/* Image with detection overlay */}
        <div className="relative bg-neutral-900 overflow-hidden" style={{ aspectRatio: "4/3" }}>
          <img src={frame.url} alt="" className="w-full h-full object-cover" />

          {subject.isVehicle ? (
            /* Plate detection box — horizontal strip in lower center */
            <div className="absolute bottom-[26%] left-[18%] right-[18%] h-[13%] border-2 border-amber-400 rounded-sm pointer-events-none"
              style={{ boxShadow: "0 0 0 1px rgba(251,191,36,0.3), 0 0 12px rgba(251,191,36,0.25)" }} />
          ) : (
            /* Face detection box — centered square */
            <>
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="w-[38%] aspect-square border-2 rounded-sm"
                  style={{ borderColor: accentColor, boxShadow: `0 0 0 1px ${accentColor}22` }} />
              </div>
              {["top-[31%] left-[31%] border-t-2 border-l-2", "top-[31%] right-[31%] border-t-2 border-r-2",
                "bottom-[31%] left-[31%] border-b-2 border-l-2", "bottom-[31%] right-[31%] border-b-2 border-r-2"
              ].map((cls, ci) => (
                <div key={ci} className={cn("absolute w-3 h-3 pointer-events-none", cls)}
                  style={{ borderColor: accentColor }} />
              ))}
            </>
          )}

          {/* Frame badge */}
          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm rounded px-2 py-0.5 flex items-center gap-1.5">
            <span className="text-[9px] font-mono text-white/80">Frame {frameIndex + 1}</span>
            <span className="text-neutral-500 text-[8px]">·</span>
            <span className="text-[9px] font-mono text-neutral-300">#{frame.frameNum.toLocaleString()}</span>
          </div>

          {/* Confidence badge */}
          <div className={cn("absolute top-2 right-10 rounded px-2 py-0.5",
            subject.membership === "BLACKLIST" ? "bg-red-600/90"
              : subject.membership === "VIP"   ? "bg-purple-600/90"
              : "bg-emerald-600/90")}>
            <span className="text-[9px] font-mono font-black text-white">{frame.confidence.toFixed(1)}%</span>
          </div>

          <button onClick={onClose}
            className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/60 hover:bg-black/80 rounded-full flex items-center justify-center transition-colors">
            <X className="w-3.5 h-3.5 text-white" />
          </button>
        </div>

        {/* Subject details */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-3">
            <div>
              <p className={cn("font-black text-neutral-900 leading-tight",
                subject.isVehicle ? "text-[14px] font-mono tracking-wider" : "text-[14px]")}>
                {subject.displayName}
              </p>
              <p className="text-[11px] text-neutral-400 mt-0.5">{subject.tagline}</p>
            </div>
            <MembershipBadge membership={subject.membership} isVehicle={subject.isVehicle} />
          </div>
          <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 pt-3 border-t border-neutral-100">
            {subject.metaItems.map(item => (
              <div key={item.label}>
                <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-0.5">{item.label}</p>
                <p className={cn("text-[11px] font-semibold text-neutral-800 leading-tight", item.mono && "font-mono tabular-nums")}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

// ─── SightingHistory — shared for both FR and LPR ────────────────────────────
interface SightingItem {
  key: string;
  timestamp: string; cameraLabel: string; cameraId: string;
  confidence: number; dwellSec?: number;
  alerts: string[]; isCurrent?: boolean;
  entryStatus?: string; linkedLpr?: string;
  thumbUrl?: string;
}

function SightingHistory({ items, membership, label, showAll, onShowAll, isVehicle = false }: {
  items: SightingItem[]; membership: string; label: string;
  showAll: boolean; onShowAll: () => void; isVehicle?: boolean;
}) {
  const limit   = isVehicle ? 3 : 2;
  const visible = showAll ? items : items.slice(0, limit);

  const currentBg = membership === "BLACKLIST" ? "bg-[#FFE5E7] border-[#E7000B]/20"
    : membership === "VIP"     ? "bg-purple-50 border-purple-200"
    : "bg-[#E5FFF9] border-[#00775B]/20";

  const badgeColor = (a: string) => {
    if (a.includes("BLACKLIST") || a.includes("UNAUTHORISED") || a.includes("BOLO")) return "bg-[#FFE5E7] text-[#E7000B] border-[#E7000B]/20";
    if (a.includes("VIP")) return "bg-purple-100 text-purple-700 border-purple-200";
    if (a.includes("RESTRICTED")) return "bg-blue-50 text-blue-700 border-blue-200";
    return "bg-[#FFF7E6] text-[#E19A04] border-[#E19A04]/20";
  };

  return (
    <>
      <SectionLabel>{label}</SectionLabel>
      <div className="px-6 py-3 border-b border-neutral-50">
        <div className="space-y-2">
          {visible.map(s => (
            <div key={s.key} className={cn(
              "flex items-center gap-3 rounded border transition-colors",
              s.isCurrent ? currentBg : "bg-white border-neutral-100"
            )}>
              {/* Thumbnail — landscape for vehicle, square for face */}
              <div className={cn(
                "relative shrink-0 overflow-hidden rounded-l bg-neutral-100",
                isVehicle ? "w-[72px] h-14" : "w-14 h-14"
              )}>
                {s.thumbUrl ? (
                  <img src={s.thumbUrl} alt="" className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Car className="w-5 h-5 text-neutral-300" />
                  </div>
                )}
                {s.isCurrent && !isVehicle && (
                  <div className={cn("absolute inset-[5px] border-2 rounded-[2px] pointer-events-none",
                    membership === "BLACKLIST" ? "border-[#E7000B]"
                      : membership === "VIP"   ? "border-purple-500"
                      : "border-[#00775B]")} />
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0 py-2 pr-3">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-[12px] font-semibold text-neutral-800">{s.cameraLabel}</span>
                  <span className="font-data tabular-nums text-[10px] text-neutral-400">{s.timestamp}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-neutral-500 flex-wrap">
                  <ConfidenceDot value={s.confidence} />
                  <span className="font-data tabular-nums font-semibold text-neutral-700">{s.confidence}%</span>
                  <span className="text-neutral-400 font-mono">{s.cameraId}</span>
                  {s.dwellSec !== undefined && (
                    <span className="font-data tabular-nums text-neutral-400">{s.dwellSec}s</span>
                  )}
                  {s.entryStatus && (
                    <span className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded border", entryStatusPill(s.entryStatus))}>
                      {s.entryStatus}
                    </span>
                  )}
                </div>
                {(s.alerts.length > 0 || s.linkedLpr || s.isCurrent) && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {s.alerts.map(a => (
                      <span key={a} className={cn("text-[9px] font-bold px-1.5 py-0.5 rounded-full border", badgeColor(a))}>
                        {a.replace(/_/g, " ")}
                      </span>
                    ))}
                    {s.linkedLpr && (
                      <span className="text-[9px] bg-blue-50 text-blue-600 border border-blue-200 rounded px-1.5 py-0.5 font-semibold">
                        LPR: {s.linkedLpr} ↗
                      </span>
                    )}
                    {s.isCurrent && (
                      <span className="text-[9px] rounded px-1.5 py-0.5 font-bold border bg-[#E5FFF9] text-[#00775B] border-[#00775B]/20">
                        CURRENT
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
        {!showAll && items.length > limit && (
          <button onClick={onShowAll} className="mt-2 text-xs text-[#00775B] font-semibold hover:underline">
            +{items.length - limit} more
          </button>
        )}
      </div>
    </>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN PANEL
// ═══════════════════════════════════════════════════════════════════════════════

interface Props {
  isOpen: boolean;
  onClose: () => void;
  entityType?: "matched" | "unknown" | "blacklist";
  personId?: string;
  groups?: string[];
  mode?: "face" | "lpr";
}

const DEFAULT_BY_TYPE: Record<string, string>         = { matched: "f4", unknown: "f2", blacklist: "f1" };
const DEFAULT_VEHICLE_BY_TYPE: Record<string, string> = { matched: "p5", unknown: "p2", blacklist: "p1" };

export const EntityDetailPanel = ({
  isOpen, onClose, entityType = "matched", personId, groups, mode = "face",
}: Props) => {
  const [showOlderToday,     setShowOlderToday]     = useState(false);
  const [showOlderYesterday, setShowOlderYesterday] = useState(false);
  const [avatarFailed,       setAvatarFailed]       = useState(false);
  const [enrollOpen,         setEnrollOpen]          = useState(false);
  const [enrolled,           setEnrolled]            = useState(false);
  const [registerOpen,       setRegisterOpen]        = useState(false);
  const [registered,         setRegistered]          = useState(false);
  const [framesOpen,         setFramesOpen]          = useState(false);
  const [selectedFrame,      setSelectedFrame]       = useState<number | null>(null);

  useEffect(() => {
    setShowOlderToday(false);
    setShowOlderYesterday(false);
    setAvatarFailed(false);
    setEnrollOpen(false);
    setEnrolled(false);
    setRegisterOpen(false);
    setRegistered(false);
    setFramesOpen(false);
    setSelectedFrame(null);
  }, [personId, mode]);

  const notifyGroups = groups ?? DEFAULT_NOTIFY_GROUPS;
  const accentColor  = "#00775B";

  // ── LPR mode ─────────────────────────────────────────────────────────────────
  if (mode === "lpr") {
    const vehicleId   = personId ?? DEFAULT_VEHICLE_BY_TYPE[entityType] ?? "p5";
    const vehicle     = VEHICLE_PANEL_ENTITIES[vehicleId] ?? VEHICLE_PANEL_ENTITIES.p5;
    const membership  = vehicle.list_membership;
    const isBolo      = membership === "BLACKLIST";
    const isVip       = membership === "VIP";
    const isUnknown   = membership === "UNKNOWN";
    const isAuth      = membership === "WHITELIST";
    const isLive      = vehicle.sighting_history.today.some(s => s.is_current);

    // Adapt stops
    const vehicleStops: MovementStop[] = vehicle.journey.map(s => ({
      seq:          s.seq,
      camera:       s.camera,
      cameraId:     s.camera_id,
      time:         s.time,
      confidence:   s.confidence,
      durationText: s.entry_status,
      direction:    s.direction,
      alerts:       s.alerts,
      entryStatus:  s.entry_status,
      thumbUrl:     vehicle.plate_image_url,
    }));

    // Adapt sightings
    const toSightingItem = (s: VehicleSighting, idx: number): SightingItem => ({
      key:         `${s.timestamp}-${s.camera_id}-${idx}`,
      timestamp:   s.timestamp,
      cameraLabel: s.camera_label,
      cameraId:    s.camera_id,
      confidence:  s.confidence,
      alerts:      s.alerts,
      isCurrent:   s.is_current,
      entryStatus: s.entry_status,
      thumbUrl:    vehicle.plate_image_url,
    });
    const sightingsToday     = vehicle.sighting_history.today.map(toSightingItem);
    const sightingsYesterday = vehicle.sighting_history.yesterday.map(toSightingItem);

    // Frame data
    const frames = Array.from({ length: 6 }, (_, i) => buildVehicleFrameData(vehicle, i));
    const popupSubject: PopupSubject = {
      displayName: vehicle.plate,
      tagline:     vehicle.vehicleDesc,
      membership,
      isVehicle:   true,
      metaItems: [
        { label: "Timestamp",    value: vehicle.last_detection.timestamp },
        { label: "Camera",       value: vehicle.last_detection.camera_id, mono: true },
        { label: "Confidence",   value: `${Math.max(82, vehicle.last_detection.confidence - (selectedFrame ?? 0) * 0.8).toFixed(1)}%`, mono: true },
        { label: "Zone",         value: vehicle.last_detection.camera_label },
        { label: "Entry Status", value: vehicle.last_detection.entry_status ?? "—" },
        vehicle.owner
          ? { label: "Owner",  value: vehicle.owner.name }
          : { label: "Status", value: isBolo ? "BOLO Active" : "Unregistered" },
      ],
    };

    // Hero props
    const metaD = vehicle.owner
      ? { label: "Owner", value: vehicle.owner.name }
      : isBolo
        ? { label: "Status", value: "BOLO Active" }
        : { label: "Status", value: "Unregistered" };

    return (
      <SlidePanel
        isOpen={isOpen} onClose={onClose}
        title={vehicle.plate} subtitle={vehicle.vehicleDesc}
        footer={!isAuth ? <StickyNotifyFooter groups={notifyGroups} /> : undefined}
      >
        {/* Hero */}
        <PanelHero
          photoUrl={vehicle.plate_image_url}
          initials={vehicle.plate}
          displayName={vehicle.plate}
          tagline={`${vehicle.vehicleDesc}${vehicle.owner ? ` · ${vehicle.owner.name}` : ""}`}
          membership={membership}
          isVehicle
          confidence={vehicle.last_detection.confidence}
          confidenceLabel="PLATE"
          isLive={isLive}
          currentLocation={vehicle.last_detection.camera_label}
          cameraId={vehicle.last_detection.camera_id}
          metaC={{ label: "Confidence", value: `${vehicle.last_detection.confidence}%`, colored: true }}
          metaD={metaD}
          canRegister={isUnknown}
          onRegister={() => setRegisterOpen(true)}
          registered={registered}
        />

        {/* Register form */}
        {registerOpen && (
          <RegisterVehicleForm
            plate={vehicle.plate}
            onClose={() => setRegisterOpen(false)}
            onSuccess={() => setRegistered(true)}
          />
        )}

        {/* BOLO notes */}
        {isBolo && vehicle.bolo_notes && (
          <>
            <SectionLabel>BOLO Notes</SectionLabel>
            <div className="px-6 py-4 border-b border-neutral-50">
              <ul className="space-y-1.5">
                {vehicle.bolo_notes.map((n, i) => (
                  <li key={i} className="flex items-start gap-2 text-[12px] text-neutral-700">
                    <span className="shrink-0 mt-0.5 w-1.5 h-1.5 rounded-full bg-red-500" />
                    {n}
                  </li>
                ))}
              </ul>
            </div>
          </>
        )}

        {/* Permit details (WHITELIST / VIP) */}
        {(isAuth || isVip) && vehicle.permit && (
          <InfoGrid label="Permit Details" fields={[
            { label: "Permit ID",   value: vehicle.permit.permit_id, mono: true },
            { label: "Valid Until", value: vehicle.permit.valid_until },
            { label: "Zone",        value: vehicle.permit.zone },
            { label: "Enrolled",    value: vehicle.permit.enrolled_date },
          ]} />
        )}

        {/* Registered owner (WHITELIST / VIP) */}
        {vehicle.owner && (isAuth || isVip) && (
          <InfoGrid label="Registered Owner" fields={[
            { label: "Name",         value: vehicle.owner.name },
            { label: "Employee ID",  value: vehicle.owner.employee_id, mono: true },
            { label: "Department",   value: vehicle.owner.department },
            { label: "Access Level", value: vehicle.owner.access_level },
          ]} />
        )}

        {/* Movement path */}
        <MovementPathSection
          stops={vehicleStops}
          transit={vehicle.journey_transit}
          start={vehicle.journey_summary.start_time}
          end={vehicle.journey_summary.end_time}
        />

        {/* Detection event */}
        <SectionLabel>Detection Event</SectionLabel>
        <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-neutral-50">
          {([
            { label: "Timestamp",    value: vehicle.last_detection.timestamp },
            { label: "Camera",       value: `${vehicle.last_detection.camera_label} · ${vehicle.last_detection.camera_id}` },
            { label: "Confidence",   value: `${vehicle.last_detection.confidence}%`, mono: true },
            { label: "Entry Status", value: vehicle.last_detection.entry_status ?? "—" },
          ] as Array<{ label: string; value: string; mono?: boolean }>).map(item => (
            <div key={item.label}>
              <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
              <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
            </div>
          ))}
          <div className="col-span-2 flex gap-2 pt-1">
            <button onClick={() => setFramesOpen(v => !v)}
              className={cn("flex items-center gap-1.5 h-7 px-2.5 rounded border text-[11px] font-semibold transition-colors",
                framesOpen
                  ? "border-neutral-300 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                  : "border-[#00775B]/50 text-[#00775B] hover:bg-[#E5FFF9]")}>
              {framesOpen ? <ChevronUp className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
              {framesOpen ? "Hide Frames" : "View Frames"}
            </button>
          </div>
        </div>

        {/* Frames accordion */}
        {framesOpen && (
          <UnifiedFramesAccordion frames={frames} isVehicle onFrameClick={setSelectedFrame} />
        )}

        {/* Frame popup */}
        {selectedFrame !== null && (
          <UnifiedFrameDetailPopup
            frame={frames[selectedFrame]}
            frameIndex={selectedFrame}
            subject={popupSubject}
            accentColor={accentColor}
            onClose={() => setSelectedFrame(null)}
          />
        )}

        {/* Sighting history — yesterday */}
        {sightingsYesterday.length > 0 && (
          <div className="pb-6">
            <SightingHistory
              items={sightingsYesterday}
              membership={membership}
              label="Detection Log — Yesterday"
              showAll={showOlderYesterday}
              onShowAll={() => setShowOlderYesterday(true)}
              isVehicle
            />
          </div>
        )}
      </SlidePanel>
    );
  }

  // ── FR (face) mode ────────────────────────────────────────────────────────────
  const resolvedId = personId ?? DEFAULT_BY_TYPE[entityType] ?? "f5";
  const entity     = PANEL_ENTITIES[resolvedId] ?? PANEL_ENTITIES.f5;

  const isMatched   = entity.match_status === "MATCHED";
  const isWhitelist = entity.list_membership === "WHITELIST";
  const isUnknown   = entity.list_membership === "UNKNOWN";
  const isBlacklist = entity.list_membership === "BLACKLIST";
  const isLive      = entity.sighting_history.today.some(s => s.is_current);
  const displayConf = isMatched
    ? entity.last_detection.match_confidence
    : entity.last_detection.detection_confidence;

  // Adapt stops
  const faceStops: MovementStop[] = entity.journey.map(s => ({
    seq:          s.seq,
    camera:       s.camera,
    cameraId:     s.camera_id,
    time:         s.time,
    confidence:   s.confidence,
    durationText: `${s.duration}s`,
    direction:    s.direction,
    alerts:       s.alerts,
    linkedPlate:  s.lpr,
    thumbUrl:     entity.photo_url,
  }));

  // Adapt sightings
  const toFaceSighting = (s: SightingEntry, idx: number): SightingItem => ({
    key:        `${s.seed}-${idx}`,
    timestamp:  s.timestamp,
    cameraLabel: s.camera_label,
    cameraId:   s.camera_id,
    confidence: s.confidence,
    dwellSec:   s.duration_sec,
    alerts:     s.alerts,
    isCurrent:  s.is_current,
    linkedLpr:  s.linked_lpr,
    thumbUrl:   `https://i.pravatar.cc/112?u=${s.seed}`,
  });
  const sightingsToday     = entity.sighting_history.today.map(toFaceSighting);
  const sightingsYesterday = entity.sighting_history.yesterday.map(toFaceSighting);

  // Frame data
  const frames = Array.from({ length: 6 }, (_, i) => buildFrameData(entity, i));
  const popupSubject: PopupSubject = {
    displayName: entity.display_name,
    tagline:     `${entity.last_detection.camera_label} · ${entity.last_detection.camera_id}`,
    membership:  entity.list_membership,
    isVehicle:   false,
    metaItems: [
      { label: "Timestamp",      value: entity.last_detection.timestamp },
      { label: "Duration",       value: `${entity.last_detection.duration_in_frame_sec}s in frame`, mono: true },
      { label: "Detection Conf", value: `${frames[selectedFrame ?? 0]?.confidence.toFixed(1) ?? "—"}%`, mono: true },
      { label: "Frame Offset",   value: `-${frames[selectedFrame ?? 0]?.offsetSec ?? 0}s`, mono: true },
      isMatched
        ? { label: "Match Score", value: `${entity.last_detection.match_confidence}%`, mono: true }
        : { label: "Match Score", value: `${entity.last_detection.detection_confidence}% (unmatched)`, mono: true },
      entity.metadata
        ? { label: "Department", value: entity.metadata.department }
        : entity.vip_info
          ? { label: "Title",  value: entity.vip_info.title }
          : { label: "Status", value: "Not enrolled" },
    ],
  };

  // Hero props
  const frTagline = entity.metadata
    ? `${entity.metadata.department} · ${entity.metadata.access_level}`
    : entity.vip_info
      ? entity.vip_info.title
      : isUnknown ? "Identity not established" : "—";
  const frMetaC = {
    label:   isUnknown ? "Detection Score" : "Match Score",
    value:   `${displayConf}%`,
    colored: true,
  };
  const frMetaD = isUnknown
    ? { label: "Appearances", value: `${entity.appearance_summary?.total_appearances ?? "—"}× in ${entity.appearance_summary?.days_seen ?? "—"}d` }
    : { label: "Department",  value: entity.metadata?.department ?? entity.vip_info?.title ?? "—" };

  return (
    <SlidePanel
      isOpen={isOpen} onClose={onClose}
      title={entity.display_name}
      subtitle={`${entity.last_detection.camera_label} · ${entity.last_detection.camera_id}`}
      footer={!isWhitelist ? <StickyNotifyFooter groups={notifyGroups} /> : undefined}
    >
      {/* Hero */}
      <PanelHero
        photoUrl={entity.photo_url}
        initials={entity.initials}
        displayName={entity.display_name}
        tagline={frTagline}
        membership={entity.list_membership}
        confidence={displayConf}
        confidenceLabel="FACE"
        isLive={isLive}
        currentLocation={entity.last_detection.camera_label}
        cameraId={entity.last_detection.camera_id}
        metaC={frMetaC}
        metaD={frMetaD}
        avatarFailed={avatarFailed}
        onAvatarError={() => setAvatarFailed(true)}
        canEnroll={isUnknown}
        onEnroll={() => setEnrollOpen(true)}
        enrolled={enrolled}
      />

      {/* Enroll form */}
      {enrollOpen && (
        <EnrollForm onClose={() => setEnrollOpen(false)} onSuccess={() => setEnrolled(true)} />
      )}

      {/* Movement path */}
      <MovementPathSection
        stops={faceStops}
        transit={entity.journey_transit}
        start={entity.journey_summary.start_time}
        end={entity.journey_summary.end_time}
      />

      {/* Detection event */}
      <SectionLabel>Detection Event</SectionLabel>
      <div className="px-6 py-4 grid grid-cols-2 gap-3 border-b border-neutral-50">
        {([
          { label: "Timestamp",            value: entity.last_detection.timestamp },
          { label: "Camera",               value: `${entity.last_detection.camera_label} · ${entity.last_detection.camera_id}` },
          { label: "Frame #",              value: entity.last_detection.frame_number, mono: true },
          { label: "Duration in Frame",    value: `${entity.last_detection.duration_in_frame_sec}s`, mono: true },
          { label: "Detection Confidence", value: `${entity.last_detection.detection_confidence}%`, mono: true },
          isMatched
            ? { label: "Match Confidence", value: `${entity.last_detection.match_confidence}%`, mono: true }
            : { label: "Best Attempt",     value: `${entity.last_detection.detection_confidence}% (below ${entity.recognition_attempt?.threshold ?? 75}% threshold)`, mono: true },
        ] as Array<{ label: string; value: string; mono?: boolean }>).map(item => (
          <div key={item.label}>
            <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
            <p className={cn("text-xs text-neutral-800 font-semibold mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
          </div>
        ))}
        <div className="col-span-2 flex gap-2 pt-1">
          <button onClick={() => setFramesOpen(v => !v)}
            className={cn("flex items-center gap-1.5 h-7 px-2.5 rounded border text-[11px] font-semibold transition-colors",
              framesOpen
                ? "border-neutral-300 bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                : "border-[#00775B]/50 text-[#00775B] hover:bg-[#E5FFF9]")}>
            {framesOpen ? <ChevronUp className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
            {framesOpen ? "Hide Frames" : "View Frames"}
          </button>
        </div>
      </div>

      {/* Frames accordion */}
      {framesOpen && (
        <UnifiedFramesAccordion frames={frames} onFrameClick={setSelectedFrame} />
      )}

      {/* Frame popup */}
      {selectedFrame !== null && (
        <UnifiedFrameDetailPopup
          frame={frames[selectedFrame]}
          frameIndex={selectedFrame}
          subject={popupSubject}
          accentColor={accentColor}
          onClose={() => setSelectedFrame(null)}
        />
      )}

      {/* Appearance Pattern */}
      {(entity.appearance_summary ?? entity.enrollment) && (
        <>
          <SectionLabel>Appearance Pattern</SectionLabel>
          <div className="px-6 py-4 border-b border-neutral-100">
            <div className="grid grid-cols-2 gap-3">
              {isUnknown && entity.appearance_summary ? (
                <>
                  {([
                    { label: "Total Appearances", value: String(entity.appearance_summary.total_appearances), mono: true },
                    { label: "Days Seen",          value: String(entity.appearance_summary.days_seen), mono: true },
                    { label: "Typical Time",       value: entity.appearance_summary.typical_time_window },
                    { label: "Avg Dwell",          value: `${entity.appearance_summary.avg_dwell_sec}s`, mono: true },
                  ] as Array<{ label: string; value: string; mono?: boolean }>).map(item => (
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
                </>
              ) : entity.enrollment ? (
                <>
                  {([
                    { label: "Total Appearances", value: String(entity.enrollment.total_appearances), mono: true },
                    { label: "This Month",        value: String(entity.enrollment.monthly_appearances), mono: true },
                    { label: "Last Seen Before",  value: entity.enrollment.last_seen_before, span: true },
                    { label: "Enrolled",          value: entity.enrollment.enrolled_date, mono: true },
                  ] as Array<{ label: string; value: string; mono?: boolean; span?: boolean }>).map(item => (
                    <div key={item.label} className={item.span ? "col-span-2" : ""}>
                      <p className="text-[10px] text-neutral-400 uppercase tracking-wide">{item.label}</p>
                      <p className={cn("text-xs font-semibold text-neutral-800 mt-0.5", item.mono && "font-data tabular-nums")}>{item.value}</p>
                    </div>
                  ))}
                </>
              ) : null}
            </div>
          </div>
        </>
      )}

      {/* Sighting history — yesterday */}
      {sightingsYesterday.length > 0 && (
        <div className="pb-6">
          <SightingHistory
            items={sightingsYesterday}
            membership={entity.list_membership}
            label="Sighting History — Yesterday"
            showAll={showOlderYesterday}
            onShowAll={() => setShowOlderYesterday(true)}
          />
        </div>
      )}
    </SlidePanel>
  );
};
