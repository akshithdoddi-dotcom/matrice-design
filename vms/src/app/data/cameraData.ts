export type HeartbeatStatus = "online" | "offline" | "unknown";

export interface HeartbeatSegment {
  start: number; // minutes from 00:00 (0–1440)
  end: number;
  status: HeartbeatStatus;
}

export type CameraStatus = "online" | "offline" | "no-heartbeat";
export type Protocol = "RTSP" | "ONVIF" | "HTTP" | "WebRTC";
export type AspectRatio = "16:9" | "4:3" | "1:1";
export type Application = "Security" | "Perimeter" | "IT" | "Retail" | "Logistics";
export type Zone = "Exterior" | "Lobby" | "Server Room" | "Zone A" | "Zone B" | "Rooftop" | "Warehouse";

export interface Camera {
  id: string;
  name: string;
  status: CameraStatus;
  protocol: Protocol;
  feedPath: string;
  aspectRatio: AspectRatio;
  dimensions: string;
  streamingFps: number;
  memoryUsageMb: number;
  heartbeat24h: HeartbeatSegment[];
  application: Application;
  zone: Zone;
}

function heartbeat(pattern: { s: number; e: number; st: HeartbeatStatus }[]): HeartbeatSegment[] {
  return pattern.map(({ s, e, st }) => ({ start: s, end: e, status: st }));
}

export const CAMERAS: Camera[] = [
  {
    id: "cam-001",
    name: "Entrance Gate — North",
    status: "online",
    protocol: "RTSP",
    feedPath: "rtsp://192.168.1.101:554/live/stream1",
    aspectRatio: "16:9",
    dimensions: "1920×1080",
    streamingFps: 30,
    memoryUsageMb: 312,
    application: "Security", zone: "Exterior",
    heartbeat24h: heartbeat([
      { s: 0,    e: 240,  st: "unknown" },
      { s: 240,  e: 245,  st: "offline" },
      { s: 245,  e: 1440, st: "online"  },
    ]),
  },
  {
    id: "cam-002",
    name: "Parking Lot — West Wing",
    status: "online",
    protocol: "ONVIF",
    feedPath: "onvif://192.168.1.102/profile1",
    aspectRatio: "16:9",
    dimensions: "2560×1440",
    streamingFps: 25,
    memoryUsageMb: 487,
    application: "Security", zone: "Exterior",
    heartbeat24h: heartbeat([
      { s: 0,    e: 180,  st: "online"  },
      { s: 180,  e: 210,  st: "offline" },
      { s: 210,  e: 420,  st: "online"  },
      { s: 420,  e: 435,  st: "offline" },
      { s: 435,  e: 1440, st: "online"  },
    ]),
  },
  {
    id: "cam-003",
    name: "Server Room — Rack A",
    status: "online",
    protocol: "RTSP",
    feedPath: "rtsp://10.0.0.55:554/stream/high",
    aspectRatio: "4:3",
    dimensions: "1280×960",
    streamingFps: 15,
    memoryUsageMb: 198,
    application: "IT", zone: "Server Room",
    heartbeat24h: heartbeat([
      { s: 0, e: 1440, st: "online" },
    ]),
  },
  {
    id: "cam-004",
    name: "Lobby — Reception Desk",
    status: "online",
    protocol: "HTTP",
    feedPath: "http://192.168.2.10:8080/video.mjpeg",
    aspectRatio: "16:9",
    dimensions: "1920×1080",
    streamingFps: 30,
    memoryUsageMb: 274,
    application: "Retail", zone: "Lobby",
    heartbeat24h: heartbeat([
      { s: 0,    e: 60,   st: "unknown" },
      { s: 60,   e: 1380, st: "online"  },
      { s: 1380, e: 1440, st: "online"  },
    ]),
  },
  {
    id: "cam-005",
    name: "Rooftop — HVAC Array",
    status: "offline",
    protocol: "RTSP",
    feedPath: "rtsp://192.168.1.200:554/roof/cam1",
    aspectRatio: "16:9",
    dimensions: "1920×1080",
    streamingFps: 0,
    memoryUsageMb: 0,
    application: "Perimeter", zone: "Rooftop",
    heartbeat24h: heartbeat([
      { s: 0,    e: 780,  st: "online"  },
      { s: 780,  e: 840,  st: "offline" },
      { s: 840,  e: 900,  st: "online"  },
      { s: 900,  e: 1440, st: "offline" },
    ]),
  },
  {
    id: "cam-006",
    name: "Corridor B — Floor 2",
    status: "online",
    protocol: "ONVIF",
    feedPath: "onvif://192.168.1.106/profile2",
    aspectRatio: "16:9",
    dimensions: "1280×720",
    streamingFps: 20,
    memoryUsageMb: 155,
    application: "Security", zone: "Zone B",
    heartbeat24h: heartbeat([
      { s: 0,    e: 300,  st: "online"  },
      { s: 300,  e: 315,  st: "offline" },
      { s: 315,  e: 900,  st: "online"  },
      { s: 900,  e: 930,  st: "offline" },
      { s: 930,  e: 1440, st: "online"  },
    ]),
  },
  {
    id: "cam-007",
    name: "Loading Dock — Bay 3",
    status: "offline",
    protocol: "RTSP",
    feedPath: "rtsp://10.0.1.33:554/dock/bay3",
    aspectRatio: "4:3",
    dimensions: "1280×960",
    streamingFps: 0,
    memoryUsageMb: 0,
    application: "Logistics", zone: "Exterior",
    heartbeat24h: heartbeat([
      { s: 0,    e: 480,  st: "online"  },
      { s: 480,  e: 540,  st: "offline" },
      { s: 540,  e: 660,  st: "online"  },
      { s: 660,  e: 1440, st: "offline" },
    ]),
  },
  {
    id: "cam-008",
    name: "Stairwell C — Ground",
    status: "no-heartbeat",
    protocol: "RTSP",
    feedPath: "rtsp://192.168.3.88:554/stair/c",
    aspectRatio: "1:1",
    dimensions: "1080×1080",
    streamingFps: 0,
    memoryUsageMb: 0,
    application: "Security", zone: "Zone A",
    heartbeat24h: heartbeat([
      { s: 0,    e: 600,  st: "online"  },
      { s: 600,  e: 660,  st: "offline" },
      { s: 660,  e: 960,  st: "unknown" },
      { s: 960,  e: 1440, st: "unknown" },
    ]),
  },
  {
    id: "cam-009",
    name: "Cafeteria — Main Hall",
    status: "online",
    protocol: "WebRTC",
    feedPath: "webrtc://stream.internal/cafeteria-main",
    aspectRatio: "16:9",
    dimensions: "3840×2160",
    streamingFps: 60,
    memoryUsageMb: 891,
    application: "Retail", zone: "Lobby",
    heartbeat24h: heartbeat([
      { s: 0,    e: 120,  st: "unknown" },
      { s: 120,  e: 1440, st: "online"  },
    ]),
  },
  {
    id: "cam-010",
    name: "Perimeter — East Fence",
    status: "online",
    protocol: "ONVIF",
    feedPath: "onvif://10.0.2.14/perimeter/east",
    aspectRatio: "16:9",
    dimensions: "1920×1080",
    streamingFps: 15,
    memoryUsageMb: 203,
    application: "Perimeter", zone: "Exterior",
    heartbeat24h: heartbeat([
      { s: 0, e: 1440, st: "online" },
    ]),
  },
  {
    id: "cam-011",
    name: "Elevator Bank — Level 4",
    status: "no-heartbeat",
    protocol: "HTTP",
    feedPath: "http://192.168.4.50:9000/elev/l4",
    aspectRatio: "4:3",
    dimensions: "640×480",
    streamingFps: 0,
    memoryUsageMb: 0,
    application: "Security", zone: "Zone A",
    heartbeat24h: heartbeat([
      { s: 0,    e: 720,  st: "online"  },
      { s: 720,  e: 780,  st: "offline" },
      { s: 780,  e: 1440, st: "unknown" },
    ]),
  },
  {
    id: "cam-012",
    name: "Warehouse — Aisle 7",
    status: "online",
    protocol: "RTSP",
    feedPath: "rtsp://10.0.3.77:554/warehouse/aisle7",
    aspectRatio: "16:9",
    dimensions: "1920×1080",
    streamingFps: 25,
    memoryUsageMb: 338,
    application: "Logistics", zone: "Warehouse",
    heartbeat24h: heartbeat([
      { s: 0,    e: 360,  st: "online"  },
      { s: 360,  e: 390,  st: "offline" },
      { s: 390,  e: 720,  st: "online"  },
      { s: 720,  e: 750,  st: "offline" },
      { s: 750,  e: 1440, st: "online"  },
    ]),
  },
];

export const CAMERA_SUMMARY = {
  online:      CAMERAS.filter(c => c.status === "online").length,
  offline:     CAMERAS.filter(c => c.status === "offline").length,
  noHeartbeat: CAMERAS.filter(c => c.status === "no-heartbeat").length,
  avgFps: Math.round(
    CAMERAS.filter(c => c.status === "online").reduce((s, c) => s + c.streamingFps, 0) /
    CAMERAS.filter(c => c.status === "online").length
  ),
};

export const SPARKLINE_DATA = {
  online:      [7, 8, 8, 9, 9, 8, CAMERA_SUMMARY.online],
  offline:     [3, 2, 3, 2, 1, 2, CAMERA_SUMMARY.offline],
  noHeartbeat: [1, 2, 1, 1, 2, 2, CAMERA_SUMMARY.noHeartbeat],
  avgFps:      [22, 24, 23, 25, 26, 25, CAMERA_SUMMARY.avgFps],
};
