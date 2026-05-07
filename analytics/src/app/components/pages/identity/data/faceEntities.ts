/**
 * Face Recognition Entity Data
 *
 * Photos go in /public/people/
 *   marcus-webb.jpg   — man with glasses (BLACKLIST)
 *   elena-petrov.jpg  — auburn-haired woman (UNKNOWN / recurring)
 *   rajesh-mehta.jpg  — senior man in suit (VIP)
 *   john-smith.jpg    — man in blue t-shirt (WHITELIST)
 *   sarah-johnson.jpg — blonde woman (WHITELIST)
 *
 * Edge cases covered:
 *   f1 Marcus Webb    → BLACKLIST / MATCHED       — multi-camera, active threat
 *   f2 Elena Petrov   → UNKNOWN  / UNMATCHED      — recurring, high-dwell pattern
 *   f3 Rajesh Mehta   → VIP      / MATCHED        — single entry, escort protocol
 *   f4 John Smith     → WHITELIST/ MATCHED        — multi-camera, tailgate alert
 *   f5 Sarah Johnson  → WHITELIST/ MATCHED        — simple two-stop journey
 */

export const FACE_ENTITIES = {
  f1: {
    id: "f1", tracker_id: 3, match_status: "MATCHED" as const,
    display_name: "Marcus Webb", initials: "MW",
    photo_url: "/people/man3.jpg",
    list_membership: "BLACKLIST" as const,
    last_detection: {
      timestamp: "2026-04-06 · 14:31:22 IST",
      camera_id: "CAM-LB-01", camera_label: "Main Lobby",
      match_confidence: 94.7, detection_confidence: 96.0,
      duration_in_frame_sec: 6.1, frame_number: "22,134",
    },
    sighting_history: {
      today: [
        { timestamp: "14:31", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 94.7, duration_sec: 6.1,  alerts: ["BLACKLIST_ACTIVE"],  is_current: true,  seed: "mw-lb-curr" },
        { timestamp: "14:11", camera_label: "North Entrance", camera_id: "CAM-NE-01", confidence: 92.3, duration_sec: 2.2,  alerts: [],                    seed: "mw-ne-mid"  },
        { timestamp: "08:58", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 91.8, duration_sec: 38.0, alerts: ["UNAUTHORISED_ENTRY"], seed: "mw-se-am"  },
        { timestamp: "08:52", camera_label: "Parking Garage", camera_id: "CAM-PG-01", confidence: 89.2, duration_sec: 3.8,  alerts: [],                    seed: "mw-pg-am"  },
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
    enrollment: { enrolled_date: "2025-02-10", enrolled_by: "security@hq.com", last_seen_before: "2026-03-12 · 11:14 · South Entrance", total_appearances: 7, monthly_appearances: 3 },
    recognition_attempt: undefined,
    appearance_summary: undefined,
    metadata: undefined,
    vip_info: undefined,
  },

  f2: {
    id: "f2", tracker_id: 88, match_status: "UNMATCHED" as const,
    display_name: "Unknown #88", initials: "?",
    photo_url: "/people/face_landmark.png",
    list_membership: "UNKNOWN" as const,
    recognition_attempt: {
      best_match_score: 61.2, threshold: 75.0,
      possible_reasons: [
        "Person not enrolled in the system",
        "Sub-optimal face angle at South Entrance",
        "Possible partial occlusion detected",
      ],
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
        { timestamp: "09:05", camera_label: "Main Lobby",     camera_id: "CAM-LB-01", confidence: 61.4, duration_sec: 18.0, alerts: [],            seed: "ep-lb-am"   },
        { timestamp: "08:41", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 62.0, duration_sec: 31.0, alerts: [],            seed: "ep-se-am"   },
      ],
      yesterday: [
        { timestamp: "09:08", camera_label: "South Entrance", camera_id: "CAM-SE-01", confidence: 60.5, duration_sec: 29.0, alerts: [], seed: "ep-ye-se01" },
      ],
    },
    journey: [
      { seq: 1, camera: "South Entrance", camera_id: "CAM-SE-01", time: "08:41", confidence: 62.0, duration: 31.0, direction: "Arrived at south entrance",     alerts: [] },
      { seq: 2, camera: "Main Lobby",     camera_id: "CAM-LB-01", time: "09:05", confidence: 61.4, duration: 18.0, direction: "Entered main lobby area",        alerts: [] },
      { seq: 3, camera: "South Entrance", camera_id: "CAM-SE-01", time: "14:30", confidence: 63.1, duration: 38.0, direction: "Returned — prolonged dwell",     alerts: ["HIGH DWELL"] },
    ],
    journey_transit: ["24 min", "5h 25min"],
    journey_summary: { start_time: "08:41", end_time: "14:30", total_duration_min: 349 },
    enrollment: undefined,
    metadata: undefined,
    vip_info: undefined,
  },

  f3: {
    id: "f3", tracker_id: 7, match_status: "MATCHED" as const,
    display_name: "Rajesh Mehta", initials: "RM",
    photo_url: "/people/man2.webp",
    list_membership: "VIP" as const,
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
    recognition_attempt: undefined,
    appearance_summary: undefined,
  },

  f4: {
    id: "f4", tracker_id: 47, match_status: "MATCHED" as const,
    display_name: "John Smith", initials: "JS",
    photo_url: "/people/man2.webp",
    list_membership: "WHITELIST" as const,
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
    recognition_attempt: undefined,
    appearance_summary: undefined,
    vip_info: undefined,
  },

  f5: {
    id: "f5", tracker_id: 21, match_status: "MATCHED" as const,
    display_name: "Sarah Johnson", initials: "SJ",
    photo_url: "/people/AI-autism_900x600.jpg",
    list_membership: "WHITELIST" as const,
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
    recognition_attempt: undefined,
    appearance_summary: undefined,
    vip_info: undefined,
  },
} as const;

export type FaceEntityId = keyof typeof FACE_ENTITIES;
