import { ShieldCheck, Hexagon, Zap, Shield } from "lucide-react";

export type IncidentSeverity = "critical" | "high" | "medium" | "low" | "info" | "resolved";

export interface Incident {
  id: number;
  incidentId: string;
  title: string;
  severity: IncidentSeverity;
  timestamp: string;
  location: string;
  camera: string;
  image: string;
  application: string;
  description?: string;
  assignee?: string;
  detectedObjects?: string[];
}

export const IMG_SERVER_ROOM = "https://images.unsplash.com/photo-1691435828932-911a7801adfb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzZXJ2ZXIlMjByb29tJTIwZGF0YSUyMGNlbnRlciUyMHNlY3VyaXR5JTIwY2FtZXJhJTIwZm9vdGFnZXxlbnwxfHx8fDE3Njk3NzUwNTR8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
export const IMG_INDUSTRIAL = "https://images.unsplash.com/photo-1683470156390-79fc319b7e7a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxpbmR1c3RyaWFsJTIwZmFjdG9yeSUyMHdvcmtlciUyMHNhZmV0eSUyMGhlbG1ldCUyMGNjdHZ8ZW58MXx8fHwxNzcwMjk3MTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
export const IMG_PARKING = "https://images.unsplash.com/photo-1747573235085-aa6b21b92e07?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJraW5nJTIwbG90JTIwc2VjdXJpdHklMjBjYW1lcmElMjBmb290YWdlfGVufDF8fHx8MTc3MDI5NzE2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
export const IMG_CROWD = "https://images.unsplash.com/photo-1604688336644-e3cc785062ef?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjcm93ZCUyMHN1cnZlaWxsYW5jZSUyMGNjdHZ8ZW58MXx8fHwxNzcwMjk3MTY1fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
export const IMG_FIRE = "https://images.unsplash.com/photo-1566931333278-f604cfaab7ec?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmaXJlJTIwc21va2UlMjBkZXRlY3Rpb24lMjBjY3R2fGVufDF8fHx8MTc3MDI5NzE2NXww&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";

export const ALL_INCIDENTS: Incident[] = [
  // 12 Incidents covering all severities
  // Critical
  { 
    id: 1, 
    incidentId: "INC-3051", 
    title: "Fire / Flame Detection", 
    severity: "critical", 
    timestamp: "17:38 PM", 
    location: "Warehouse Zone A", 
    camera: "Cam-W01", 
    image: IMG_FIRE, 
    application: "Fire & Safety", 
    description: "Active flame detected in storage aisle 4.", 
    detectedObjects: ["Fire", "Smoke", "High Temp"] 
  },
  { 
    id: 2, 
    incidentId: "INC-3050", 
    title: "Fighting Detection", 
    severity: "critical", 
    timestamp: "17:35 PM", 
    location: "Main Entrance", 
    camera: "Cam-E04", 
    image: IMG_CROWD, 
    application: "Behavioral Analytics", 
    description: "Aggressive behavior and fighting detected at main gate.", 
    detectedObjects: ["Person", "Aggression"] 
  },

  // High
  { 
    id: 3, 
    incidentId: "INC-3049", 
    title: "Weapon Detected", 
    severity: "high", 
    timestamp: "17:30 PM", 
    location: "Lobby Reception", 
    camera: "Cam-L02", 
    image: IMG_CROWD, 
    application: "Security & Threat", 
    description: "Potential weapon (knife) detected in hand of visitor.", 
    detectedObjects: ["Person", "Weapon", "Knife"] 
  },
  { 
    id: 4, 
    incidentId: "INC-3048", 
    title: "Perimeter Breach", 
    severity: "high", 
    timestamp: "17:28 PM", 
    location: "North Fence", 
    camera: "Cam-P01", 
    image: IMG_PARKING, 
    application: "Intrusion Analytics", 
    description: "Person climbing over perimeter fence.", 
    detectedObjects: ["Person", "Climbing"] 
  },

  // Medium
  { 
    id: 5, 
    incidentId: "INC-2047", 
    title: "Loitering Alert", 
    severity: "medium", 
    timestamp: "17:20 PM", 
    location: "Parking Level B", 
    camera: "Cam-PL02", 
    image: IMG_PARKING, 
    application: "Behavioral Analytics", 
    description: "Person loitering near executive vehicles for >10 mins.", 
    detectedObjects: ["Person", "Loitering"] 
  },
  { 
    id: 6, 
    incidentId: "INC-2046", 
    title: "Tailgating", 
    severity: "medium", 
    timestamp: "17:15 PM", 
    location: "Employee Turnstile", 
    camera: "Cam-T01", 
    image: IMG_CROWD, 
    application: "Access Control", 
    description: "Two people entered on single badge scan.", 
    detectedObjects: ["Person", "Tailgating"] 
  },

  // Low
  { 
    id: 7, 
    incidentId: "INC-2045", 
    title: "PPE Violation", 
    severity: "low", 
    timestamp: "17:10 PM", 
    location: "Factory Floor", 
    camera: "Cam-F03", 
    image: IMG_INDUSTRIAL, 
    application: "Safety Compliance", 
    description: "Worker detected without high-viz vest.", 
    detectedObjects: ["Person", "No Vest"] 
  },
  { 
    id: 8, 
    incidentId: "INC-2044", 
    title: "Illegal Parking", 
    severity: "low", 
    timestamp: "17:05 PM", 
    location: "Loading Dock", 
    camera: "Cam-LD01", 
    image: IMG_PARKING, 
    application: "Traffic Analytics", 
    description: "Vehicle parked in non-parking zone.", 
    detectedObjects: ["Vehicle", "Illegal Parking"] 
  },

  // Info
  { 
    id: 9, 
    incidentId: "INC-1043", 
    title: "Crowd Counting", 
    severity: "info", 
    timestamp: "17:00 PM", 
    location: "Main Hall", 
    camera: "Cam-H01", 
    image: IMG_CROWD, 
    application: "Business Intelligence", 
    description: "Current occupancy: 45/100.", 
    detectedObjects: ["Person", "Count"] 
  },
  { 
    id: 10, 
    incidentId: "INC-1042", 
    title: "Shift Change", 
    severity: "info", 
    timestamp: "16:55 PM", 
    location: "Entry Gate", 
    camera: "Cam-G02", 
    image: IMG_CROWD, 
    application: "Operations", 
    description: "Shift change detected, high traffic volume.", 
    detectedObjects: ["Crowd", "Flow"] 
  },

  // Resolved
  { 
    id: 11, 
    incidentId: "INC-1041", 
    title: "Smoke Detector Test", 
    severity: "resolved", 
    timestamp: "16:50 PM", 
    location: "Server Room A", 
    camera: "Cam-S01", 
    image: IMG_SERVER_ROOM, 
    application: "Maintenance", 
    description: "Scheduled maintenance test completed.", 
    detectedObjects: ["Test", "Smoke"] 
  },
  { 
    id: 12, 
    incidentId: "INC-1040", 
    title: "Door Forced Open", 
    severity: "resolved", 
    timestamp: "16:45 PM", 
    location: "Back Exit", 
    camera: "Cam-BE01", 
    image: IMG_INDUSTRIAL, 
    application: "Access Control", 
    description: "Door alarm triggered, verified as authorized delivery.", 
    detectedObjects: ["Door", "Person"] 
  },
  
  // Additional incidents for demo
  { 
    id: 13, 
    incidentId: "INC-3047", 
    title: "Unauthorized Vehicle", 
    severity: "high", 
    timestamp: "17:26 PM", 
    location: "Restricted Zone C", 
    camera: "Cam-RC03", 
    image: IMG_PARKING, 
    application: "Access Control", 
    description: "Unregistered vehicle entered restricted area.", 
    detectedObjects: ["Vehicle", "Unauthorized"] 
  },
  { 
    id: 14, 
    incidentId: "INC-2043", 
    title: "Slip and Fall Risk", 
    severity: "medium", 
    timestamp: "17:08 PM", 
    location: "Corridor 3B", 
    camera: "Cam-C3B", 
    image: IMG_INDUSTRIAL, 
    application: "Safety Compliance", 
    description: "Wet floor detected without warning signs.", 
    detectedObjects: ["Hazard", "Wet Floor"] 
  },
  { 
    id: 15, 
    incidentId: "INC-2042", 
    title: "Suspicious Behavior", 
    severity: "medium", 
    timestamp: "17:02 PM", 
    location: "Storage Area B", 
    camera: "Cam-SAB02", 
    image: IMG_CROWD, 
    application: "Behavioral Analytics", 
    description: "Person lingering near sensitive equipment.", 
    detectedObjects: ["Person", "Suspicious"] 
  },
];

export const PROJECTS_DATA: Record<string, string[]> = {
  "Main Building": ["Entry Pipeline", "Secure Zone", "Lobby Ops"],
  "West Wing": ["Research Flow", "Guest Access"],
  "Parking Lot A": ["Vehicle Check", "Perimeter Scan"],
  "Warehouse 1": ["Inventory Track", "Loading Bay"],
  "Data Center": ["Server Rack Mon", "Cooling Sys"],
  "Perimeter Fence": ["North Wall", "South Gate"]
};

export const CAMERA_GROUPS = ["Entrance Cameras", "Exit Cameras", "Hallway Monitoring", "Loading Dock", "Server Room", "Outer Perimeter"];

export const CLIENTS = [
  { id: 'matrice', name: 'Matrice AI', icon: ShieldCheck },
  { id: 'nexus', name: 'Nexus Corp', icon: Hexagon },
  { id: 'cyber', name: 'CyberFlow', icon: Zap },
  { id: 'urban', name: 'UrbanGuard', icon: Shield },
];

export const EMPLOYEES = ["John Doe", "Jane Smith", "Mike Johnson", "Sarah Williams", "Robert Brown"];

export const LOCATIONS = Array.from(new Set(ALL_INCIDENTS.map(i => i.location)));
export const APPLICATIONS = Array.from(new Set(ALL_INCIDENTS.map(i => i.application)));
export const SEVERITIES = ["critical", "high", "medium", "low", "info", "resolved"];

// --- NEW DATA FOR ANALYTICS PAGES ---

// Volume Analytics
export const VOLUME_STAFFING_DATA = [
  { hour: "08:00", peakCount: 450, staffingLevel: 12 },
  { hour: "10:00", peakCount: 1200, staffingLevel: 25 },
  { hour: "12:00", peakCount: 1800, staffingLevel: 30 },
  { hour: "14:00", peakCount: 1500, staffingLevel: 28 },
  { hour: "16:00", peakCount: 1650, staffingLevel: 30 },
  { hour: "18:00", peakCount: 900, staffingLevel: 20 },
  { hour: "20:00", peakCount: 300, staffingLevel: 10 },
];

export const VOLUME_KPIS = [
  { label: "Total Unique Visitors", value: "24,592", change: "+12%", trend: "up", sparkline: [120, 132, 145, 155, 142, 160, 175] },
  { label: "Turnover Rate", value: "8.4%", change: "-2.1%", trend: "down", sparkline: [10, 9, 8.8, 8.5, 8.4, 8.2, 8.4] },
  { label: "Monthly Peak Count", value: "1,892", change: "+5.3%", trend: "up", sparkline: [1400, 1500, 1450, 1600, 1750, 1800, 1892] },
  { label: "YoY Traffic Trend", value: "+18%", change: "+4.2%", trend: "up", sparkline: [10, 12, 11, 14, 15, 16, 18] },
];

// Director-specific Strategic KPIs
export const DIRECTOR_KPIS = [
  { label: "Total Annual Traffic", value: "1.42M", change: "+12%", trend: "up", sparkline: [100, 110, 105, 115, 120, 125, 142], subtitle: "YoY Growth" },
  { label: "Revenue Protection", value: "$2.8M", change: "+8.5%", trend: "up", sparkline: [220, 235, 245, 250, 265, 270, 280], subtitle: "Incident Prevention Value" },
  { label: "Operational Efficiency", value: "94.2%", change: "+3.1%", trend: "up", sparkline: [88, 89, 90, 91, 92, 93, 94.2], subtitle: "Resource Utilization" },
  { label: "Global Compliance Score", value: "98.5%", change: "+1.2%", trend: "up", sparkline: [96, 96.5, 97, 97.2, 97.8, 98, 98.5], subtitle: "Multi-Region Average" },
];

// Y-o-Y Comparison Data for Director View
export const YOY_COMPARISON_DATA = [
  { month: "Jan", thisYear: 18500, lastYear: 16200 },
  { month: "Feb", thisYear: 19200, lastYear: 17100 },
  { month: "Mar", thisYear: 21500, lastYear: 18400 },
  { month: "Apr", thisYear: 24800, lastYear: 21200 },
  { month: "May", thisYear: 26100, lastYear: 22500 },
  { month: "Jun", thisYear: 28400, lastYear: 24100 },
  { month: "Jul", thisYear: 30200, lastYear: 25800 },
  { month: "Aug", thisYear: 29800, lastYear: 26200 },
  { month: "Sep", thisYear: 31500, lastYear: 27400 },
  { month: "Oct", thisYear: 33200, lastYear: 28900 },
  { month: "Nov", thisYear: 35100, lastYear: 30200 },
  { month: "Dec", thisYear: 36800, lastYear: 31500 },
];

export const VOLUME_SPARKLINES = [
  { zone: "Main Entrance", data: [45, 52, 49, 85, 102, 98, 76, 55, 42, 48, 55, 62], occupancy: 62 },
  { zone: "Food Court", data: [12, 15, 25, 45, 88, 120, 110, 85, 45, 25, 18, 15], occupancy: 92 }, // > 90%
  { zone: "Retail Zone A", data: [8, 12, 15, 22, 35, 42, 38, 30, 22, 15, 12, 10], occupancy: 20 },
  { zone: "Lobby Ops", data: [55, 62, 58, 45, 42, 38, 45, 52, 58, 62, 55, 48], occupancy: 40 },
  { zone: "Parking A", data: [22, 35, 48, 55, 62, 58, 45, 32, 25, 18, 15, 12], occupancy: 25 },
  { zone: "North Gate", data: [15, 18, 20, 25, 22, 18, 15, 12, 10, 8, 12, 15], occupancy: 30 },
  { zone: "South Hall", data: [5, 8, 12, 15, 18, 15, 12, 8, 5, 8, 12, 15], occupancy: 15 },
  { zone: "Elevator Bank", data: [35, 42, 45, 48, 45, 42, 35, 28, 22, 18, 22, 28], occupancy: 55 },
];

export const VOLUME_HEATMAP_DATA = Array.from({ length: 7 * 24 }).map((_, i) => {
  const day = Math.floor(i / 24);
  const hour = i % 24;
  // Create a pattern: busier mid-day, busier on weekends
  const baseVolume = (hour >= 9 && hour <= 18) ? 50 : 10;
  const randomVar = Math.floor(Math.random() * 40);
  return {
    day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][day],
    hour,
    value: baseVolume + randomVar + (day >= 4 ? 20 : 0) // Weekends busier
  };
});

export const CAMERA_PERFORMANCE_DATA = [
  { id: 1, camera: "Cam-E04 (Main)", app: "People Counting", volume: 15420, change: 12.5 },
  { id: 2, camera: "Cam-W01 (Food)", app: "Crowd Density", volume: 8950, change: -5.2 },
  { id: 3, camera: "Cam-L02 (Lobby)", app: "Footfall", volume: 6720, change: 3.8 },
  { id: 4, camera: "Cam-P01 (North)", app: "Perimeter", volume: 420, change: 1.2 },
  { id: 5, camera: "Cam-R05 (Retail)", app: "Shopper Count", volume: 3850, change: 8.9 },
  { id: 6, camera: "Cam-T01 (Turnstile)", app: "Access Control", volume: 2100, change: -1.5 },
];

export const REGIONAL_PERFORMANCE_DATA = [
  { id: 1, region: "North America", visitors: 45200, lat: 40, lng: -100, size: 80 },
  { id: 2, region: "Europe", visitors: 32150, lat: 48, lng: 15, size: 60 },
  { id: 3, region: "Asia Pacific", visitors: 58900, lat: 35, lng: 105, size: 100 },
  { id: 4, region: "South America", visitors: 12500, lat: -15, lng: -60, size: 30 },
];

export const VOLUME_GROWTH_DATA = [
  { month: "Sep", visitors: 18500 },
  { month: "Oct", visitors: 19200 },
  { month: "Nov", visitors: 21500 },
  { month: "Dec", visitors: 24800 },
  { month: "Jan", visitors: 22100 },
  { month: "Feb", visitors: 24592 },
];

// Incident Analytics
export const SEVERITY_DISTRIBUTION = [
  { name: 'Critical', value: 5, color: '#EF4444' },
  { name: 'High', value: 12, color: '#EA580C' },
  { name: 'Medium', value: 25, color: '#CA8A04' },
  { name: 'Low', value: 45, color: '#3B82F6' },
  { name: 'Info', value: 30, color: '#64748B' },
];

export const INCIDENT_TIMELINE = [
  { time: "09:15", event: "Door Forced", response: "45s", severity: "medium" },
  { time: "10:42", event: "Loitering", response: "1m 20s", severity: "low" },
  { time: "11:30", event: "Fire Alarm", response: "30s", severity: "critical" },
  { time: "14:15", event: "Tailgating", response: "12s", severity: "low" },
  { time: "16:45", event: "Perimeter Breach", response: "2m 10s", severity: "high" },
];

export const RESOLVED_INCIDENTS_LIST = Array.from({ length: 50 }).map((_, i) => ({
  id: `RES-${1000 + i}`,
  time: `${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`,
  title: ["False Alarm", "Door Forced", "System Test", "Badge Issue", "Loitering"][Math.floor(Math.random() * 5)],
  severity: "resolved"
}));

export const SLA_DISTRIBUTION_DATA = [
  { range: "< 1m", count: 45 },
  { range: "1-5m", count: 12 },
  { range: "> 5m", count: 3 },
];

// Zone Analytics
export const ZONE_DWELL_DATA = [
  { zone: "Lobby", dwellTime: 5, target: 3 },
  { zone: "Cafeteria", dwellTime: 25, target: 30 },
  { zone: "Retail A", dwellTime: 18, target: 15 },
  { zone: "Retail B", dwellTime: 22, target: 15 },
  { zone: "Waiting Area", dwellTime: 12, target: 10 },
];

export const ZONE_SLA_DATA = [
  { zone: "Main Entrance", compliance: 99.2, status: "safe" },
  { zone: "Loading Dock", compliance: 88.5, status: "warning" },
  { zone: "Server Room", compliance: 100, status: "safe" },
  { zone: "Retail Floor", compliance: 94.2, status: "safe" },
  { zone: "Perimeter", compliance: 78.4, status: "risk" },
];

export const ZONE_EFFICIENCY_DATA = [
  { zone: "Zone A (Lobby)", occupancy: 42, dwell: "4m 12s", friction: 2.4 },
  { zone: "Zone B (Food)", occupancy: 88, dwell: "22m 15s", friction: 6.8 },
  { zone: "Zone C (Retail)", occupancy: 15, dwell: "8m 45s", friction: 1.2 },
  { zone: "Zone D (Gate)", occupancy: 5, dwell: "0m 45s", friction: 0.5 },
  { zone: "Zone E (Parking)", occupancy: 120, dwell: "15m 30s", friction: 8.2 },
];

export const REGION_ROI_DATA = [
  { region: "North", roi: 92, revenueProtection: 85, intensity: 90 },
  { region: "East", roi: 78, revenueProtection: 45, intensity: 40 },
  { region: "South", roi: 88, revenueProtection: 72, intensity: 75 },
  { region: "West", roi: 95, revenueProtection: 90, intensity: 95 },
  { region: "Central", roi: 65, revenueProtection: 30, intensity: 20 },
];

// Zone Analytics - Monitoring Staff View
export type ZoneStatus = "safe" | "stagnant" | "violation" | "critical";

export interface ZoneCard {
  id: string;
  zoneName: string;
  app: string;
  occupancy: number; // current occupancy %
  maxCapacity: number;
  currentCount: number;
  dwellTime: string; // avg dwell time
  queueLength: number;
  status: ZoneStatus;
  camera: string;
  turnoverRate: number; // unique IDs per hour
  directionalFlow?: { inbound: number; outbound: number }; // percentage
  isPinned: boolean;
  lastIncident?: string;
  image: string;
  sparklineData: number[]; // 1-min occupancy snapshots for last 20 mins
  detectedObject?: "Person" | "Vehicle" | "Animal" | "Unknown"; // For intrusion cards
  slaLimit?: string; // For queue cards (e.g., "5m")
  waitTime?: string; // Current wait time for queues
}

export const ZONE_CARDS: ZoneCard[] = [
  {
    id: "Z001",
    zoneName: "Main Entrance Queue",
    app: "Queue Management",
    occupancy: 92,
    maxCapacity: 50,
    currentCount: 46,
    dwellTime: "8m 15s",
    queueLength: 12,
    status: "critical",
    camera: "Cam-E01",
    turnoverRate: 15.2,
    directionalFlow: { inbound: 68, outbound: 32 },
    isPinned: true,
    lastIncident: "2m ago",
    image: IMG_CROWD,
    sparklineData: [55, 58, 62, 65, 68, 70, 72, 75, 78, 82, 84, 86, 88, 90, 91, 92, 92, 92, 92, 92],
    slaLimit: "5m",
    waitTime: "8m 15s",
  },
  {
    id: "Z002",
    zoneName: "Server Room Entrance",
    app: "Intrusion Detection",
    occupancy: 0,
    maxCapacity: 5,
    currentCount: 0,
    dwellTime: "0m 0s",
    queueLength: 0,
    status: "safe",
    camera: "Cam-SR01",
    turnoverRate: 2.5,
    isPinned: true,
    lastIncident: "2h ago",
    image: IMG_SERVER_ROOM,
    sparklineData: [0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0],
    detectedObject: "Unknown",
  },
  {
    id: "Z003",
    zoneName: "Loading Dock",
    app: "Area Utilisation",
    occupancy: 75,
    maxCapacity: 20,
    currentCount: 15,
    dwellTime: "22m 18s",
    queueLength: 4,
    status: "safe",
    camera: "Cam-LD01",
    turnoverRate: 8.4,
    directionalFlow: { inbound: 45, outbound: 55 },
    isPinned: false,
    image: IMG_INDUSTRIAL,
    sparklineData: [10, 12, 14, 16, 15, 14, 16, 18, 17, 15, 14, 15, 16, 17, 18, 17, 16, 15, 14, 15],
  },
  {
    id: "Z004",
    zoneName: "Parking Lot A (North)",
    app: "Parking Analytics",
    occupancy: 88,
    maxCapacity: 100,
    currentCount: 88,
    dwellTime: "45m 12s",
    queueLength: 0,
    status: "stagnant",
    camera: "Cam-PA01",
    turnoverRate: 12.8,
    isPinned: false,
    image: IMG_PARKING,
    sparklineData: [70, 72, 75, 78, 80, 82, 85, 86, 87, 88, 88, 87, 86, 85, 86, 87, 88, 88, 88, 88],
  },
  {
    id: "Z005",
    zoneName: "Restricted Zone C",
    app: "Intrusion Detection",
    occupancy: 100,
    maxCapacity: 2,
    currentCount: 2,
    dwellTime: "1m 42s",
    queueLength: 0,
    status: "violation",
    camera: "Cam-RC03",
    turnoverRate: 0.5,
    isPinned: true,
    lastIncident: "2m ago",
    image: IMG_INDUSTRIAL,
    sparklineData: [0, 0, 0, 0, 0, 0, 0, 0, 20, 40, 60, 80, 90, 95, 98, 100, 100, 100, 100, 100],
    detectedObject: "Person",
  },
  {
    id: "Z006",
    zoneName: "Cafeteria Line",
    app: "Queue Length & Wait Time",
    occupancy: 60,
    maxCapacity: 30,
    currentCount: 18,
    dwellTime: "3m 25s",
    queueLength: 8,
    status: "safe",
    camera: "Cam-CF01",
    turnoverRate: 22.5,
    directionalFlow: { inbound: 52, outbound: 48 },
    isPinned: false,
    image: IMG_CROWD,
    sparklineData: [12, 14, 16, 18, 20, 22, 20, 18, 16, 14, 15, 16, 18, 20, 19, 18, 17, 18, 18, 18],
    slaLimit: "4m",
    waitTime: "3m 25s",
  },
  {
    id: "Z007",
    zoneName: "Lobby Waiting Area",
    app: "Dwell Time Analytics",
    occupancy: 45,
    maxCapacity: 40,
    currentCount: 18,
    dwellTime: "12m 08s",
    queueLength: 0,
    status: "safe",
    camera: "Cam-LW01",
    turnoverRate: 6.2,
    isPinned: false,
    image: IMG_CROWD,
    sparklineData: [15, 16, 18, 20, 22, 20, 18, 17, 16, 15, 16, 17, 18, 19, 18, 17, 18, 18, 18, 18],
  },
  {
    id: "Z008",
    zoneName: "Perimeter North",
    app: "Wrong-way Detection",
    occupancy: 150,
    maxCapacity: 10,
    currentCount: 15,
    dwellTime: "12m 35s",
    queueLength: 0,
    status: "violation",
    camera: "Cam-PN01",
    turnoverRate: 3.2,
    directionalFlow: { inbound: 85, outbound: 15 },
    isPinned: false,
    lastIncident: "1m ago",
    image: IMG_PARKING,
    sparklineData: [10, 20, 35, 45, 60, 75, 85, 98, 105, 118, 125, 132, 138, 142, 145, 148, 150, 150, 150, 150],
  },
  {
    id: "Z009",
    zoneName: "Warehouse Zone A",
    app: "Overcrowding Alerts",
    occupancy: 95,
    maxCapacity: 30,
    currentCount: 29,
    dwellTime: "18m 45s",
    queueLength: 5,
    status: "critical",
    camera: "Cam-W01",
    turnoverRate: 4.8,
    isPinned: true,
    lastIncident: "5m ago",
    image: IMG_INDUSTRIAL,
    sparklineData: [60, 62, 65, 68, 72, 75, 78, 82, 85, 88, 89, 90, 91, 92, 93, 94, 95, 95, 95, 95],
  },
  {
    id: "Z010",
    zoneName: "Emergency Exit B",
    app: "Entry into Hazardous Zones",
    occupancy: 0,
    maxCapacity: 5,
    currentCount: 0,
    dwellTime: "0m 0s",
    queueLength: 0,
    status: "safe",
    camera: "Cam-EX02",
    turnoverRate: 0.2,
    isPinned: false,
    image: IMG_INDUSTRIAL,
    sparklineData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    detectedObject: "Unknown",
  },
  {
    id: "Z011",
    zoneName: "Retail Floor Zone 1",
    app: "People Heatmaps",
    occupancy: 65,
    maxCapacity: 50,
    currentCount: 33,
    dwellTime: "8m 32s",
    queueLength: 0,
    status: "safe",
    camera: "Cam-RF01",
    turnoverRate: 18.5,
    isPinned: false,
    image: IMG_CROWD,
    sparklineData: [25, 27, 30, 32, 35, 33, 31, 30, 32, 33, 34, 35, 34, 33, 32, 33, 33, 33, 33, 33],
  },
  {
    id: "Z012",
    zoneName: "Back Alley",
    app: "Loitering Detection",
    occupancy: 40,
    maxCapacity: 5,
    currentCount: 2,
    dwellTime: "28m 45s",
    queueLength: 0,
    status: "violation",
    camera: "Cam-BA01",
    turnoverRate: 1.2,
    isPinned: false,
    lastIncident: "3m ago",
    image: IMG_PARKING,
    sparklineData: [10, 12, 15, 18, 22, 25, 28, 30, 32, 35, 36, 37, 38, 39, 39, 40, 40, 40, 40, 40],
    detectedObject: "Person",
  },
  {
    id: "Z013",
    zoneName: "Pedestrian Zone B",
    app: "Intrusion Detection",
    occupancy: 100,
    maxCapacity: 1,
    currentCount: 1,
    dwellTime: "0m 45s",
    queueLength: 0,
    status: "critical",
    camera: "Cam-PZ02",
    turnoverRate: 0.1,
    isPinned: false,
    lastIncident: "45s ago",
    image: IMG_PARKING,
    sparklineData: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 20, 50, 80, 100, 100, 100, 100, 100],
    detectedObject: "Vehicle",
  },
];

export const ZONE_VIOLATIONS_TICKER = [
  { id: 1, severity: "critical", zone: "Warehouse Zone A", camera: "Cam-W01", message: "Critical Overcrowding - 95% Capacity Exceeded", time: "1m ago" },
  { id: 2, severity: "critical", zone: "Main Entrance Queue", camera: "Cam-E01", message: "Critical Queue Wait Time Breach - 8m 15s", time: "2m ago" },
  { id: 3, severity: "high", zone: "Restricted Zone C", camera: "Cam-RC03", message: "Unauthorized Access Detected", time: "3m ago" },
  { id: 4, severity: "high", zone: "Perimeter North", camera: "Cam-PN01", message: "Wrong-way Movement Detected - 85% Violation Rate", time: "1m ago" },
  { id: 5, severity: "high", zone: "Back Alley", camera: "Cam-BA01", message: "Loitering Violation - 18m 45s Dwell Time", time: "3m ago" },
];

// Quality Analytics
export const SYSTEM_NODES = [
  { id: "NODE-01", name: "Entry Cam Cluster", latency: 12, uptime: 99.99, status: "healthy" },
  { id: "NODE-02", name: "Perimeter AI Unit", latency: 45, uptime: 98.50, status: "warning" },
  { id: "NODE-03", name: "Server Rack Cam", latency: 8, uptime: 100.00, status: "healthy" },
  { id: "NODE-04", name: "LPR Engine", latency: 150, uptime: 92.10, status: "critical" },
  { id: "NODE-05", name: "Face Recog Unit", latency: 22, uptime: 99.50, status: "healthy" },
];

export const DEFECT_DISTRIBUTION = [
  { name: 'Occlusion', value: 35, color: '#CA8A04' },
  { name: 'Blur', value: 25, color: '#3B82F6' },
  { name: 'Signal Loss', value: 15, color: '#EF4444' },
  { name: 'Lighting', value: 25, color: '#64748B' },
];

export const SYSTEM_HEALTH_GRID_DATA = Array.from({ length: 100 }).map((_, i) => ({
  id: `CAM-${i + 1}`,
  status: Math.random() > 0.95 ? "offline" : "healthy",
  latency: Math.floor(Math.random() * 50) + 5,
}));

export const MODEL_ACCURACY_DATA = [
  { date: "Jan", score: 98.5 },
  { date: "Feb", score: 98.2 },
  { date: "Mar", score: 97.8 },
  { date: "Apr", score: 96.5 }, // Needs cleaning
  { date: "May", score: 98.8 }, // Recalibrated
  { date: "Jun", score: 98.9 },
];

export const APPLICATION_VOLUME_DATA = [
  {
    appName: "Access Control",
    graphs: [
      { 
        title: "Main Turnstile A", 
        total: 1245, 
        trend: 12, 
        type: "bar",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 200) + 50 })) 
      },
      { 
        title: "Main Turnstile B", 
        total: 1105, 
        trend: -5, 
        type: "area",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 180) + 40 })) 
      },
      { 
        title: "Rear Exit Gate", 
        total: 450, 
        trend: 2, 
        type: "line",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 80) + 10 })) 
      },
      { 
        title: "VIP Elevator", 
        total: 120, 
        trend: 0, 
        type: "bar",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 30) + 5 })) 
      },
       { 
        title: "Service Entrance", 
        total: 85, 
        trend: 8, 
        type: "area",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 20) + 2 })) 
      },
    ]
  },
  {
    appName: "Crowd Analytics",
    graphs: [
      { 
        title: "Lobby Waiting Area", 
        total: 340, 
        trend: 15, 
        type: "area",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 50) + 10 })) 
      },
      { 
        title: "Cafeteria Line", 
        total: 850, 
        trend: 45, 
        type: "line",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 150) + 20 })) 
      },
      { 
        title: "Conference Hall B", 
        total: 120, 
        trend: -10, 
        type: "bar",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 100) + 5 })) 
      },
       { 
        title: "Atrium North", 
        total: 560, 
        trend: 5, 
        type: "line",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 80) + 30 })) 
      },
    ]
  },
  {
    appName: "Vehicle Traffic",
    graphs: [
      { 
        title: "Parking Entry North", 
        total: 450, 
        trend: 8, 
        type: "bar",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 60) + 10 })) 
      },
      { 
        title: "Parking Entry South", 
        total: 320, 
        trend: -2, 
        type: "area",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 50) + 5 })) 
      },
      { 
        title: "Loading Dock", 
        total: 45, 
        trend: 12, 
        type: "line",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 10) + 0 })) 
      },
    ]
  }
];

export const MANAGER_OPERATIONAL_DATA = [
  {
    appName: "Staff Efficiency",
    graphs: [
      { 
        title: "Security Response Time", 
        total: "1.2m", 
        trend: -15, 
        type: "line",
        data: Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, value: 5 - (Math.random() * 2) })) 
      },
      { 
        title: "Shift Coverage", 
        total: "98%", 
        trend: 2, 
        type: "bar",
        data: Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, value: 90 + Math.floor(Math.random() * 10) })) 
      },
      { 
        title: "Patrol Completion", 
        total: "145", 
        trend: 5, 
        type: "area",
        data: Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, value: 20 + Math.floor(Math.random() * 5) })) 
      },
    ]
  },
  {
    appName: "Incident Management",
    graphs: [
      { 
        title: "Open Tickets", 
        total: 24, 
        trend: -8, 
        type: "bar",
        data: Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, value: Math.floor(Math.random() * 30) + 5 })) 
      },
      { 
        title: "Resolution Rate", 
        total: "4.5/hr", 
        trend: 12, 
        type: "line",
        data: Array.from({ length: 7 }, (_, i) => ({ time: `Day ${i+1}`, value: Math.floor(Math.random() * 6) + 2 })) 
      },
    ]
  }
];

export const DIRECTOR_STRATEGIC_DATA = [
  {
    appName: "Quarterly Performance",
    graphs: [
      { 
        title: "Q3 Traffic Growth", 
        total: "+22%", 
        trend: 5, 
        type: "area",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `W${i+1}`, value: 1000 + (i * 100) + Math.floor(Math.random() * 200) })) 
      },
      { 
        title: "Cost Efficiency", 
        total: "$12k", 
        trend: -4, 
        type: "line",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `W${i+1}`, value: 5000 - (i * 50) + Math.floor(Math.random() * 200) })) 
      },
      { 
        title: "Resource Allocation", 
        total: "94%", 
        trend: 3, 
        type: "bar",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `W${i+1}`, value: 80 + Math.floor(Math.random() * 20) })) 
      },
      { 
        title: "Capacity Utilization", 
        total: "87%", 
        trend: 8, 
        type: "area",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `W${i+1}`, value: 70 + (i * 2) + Math.floor(Math.random() * 15) })) 
      },
      { 
        title: "Peak Hour Efficiency", 
        total: "91%", 
        trend: 2, 
        type: "line",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `W${i+1}`, value: 85 + Math.floor(Math.random() * 10) })) 
      },
      { 
        title: "Operational Score", 
        total: "8.9/10", 
        trend: 12, 
        type: "bar",
        data: Array.from({ length: 12 }, (_, i) => ({ time: `W${i+1}`, value: 7 + (i * 0.15) + Math.random() * 0.5 })) 
      },
    ]
  },
  {
    appName: "Regional Compliance",
    graphs: [
      { 
        title: "North America", 
        total: "99.8%", 
        trend: 0.2, 
        type: "bar",
        data: Array.from({ length: 4 }, (_, i) => ({ time: `Q${i+1}`, value: 98 + Math.random() * 2 })) 
      },
      { 
        title: "EMEA", 
        total: "94.2%", 
        trend: 1.5, 
        type: "bar",
        data: Array.from({ length: 4 }, (_, i) => ({ time: `Q${i+1}`, value: 92 + Math.random() * 4 })) 
      },
      { 
        title: "APAC", 
        total: "96.5%", 
        trend: -0.5, 
        type: "line",
        data: Array.from({ length: 4 }, (_, i) => ({ time: `Q${i+1}`, value: 95 + Math.random() * 3 })) 
      },
      { 
        title: "Latin America", 
        total: "92.1%", 
        trend: 4.2, 
        type: "area",
        data: Array.from({ length: 4 }, (_, i) => ({ time: `Q${i+1}`, value: 88 + (i * 1.5) + Math.random() * 2 })) 
      },
      { 
        title: "Middle East", 
        total: "97.3%", 
        trend: 1.8, 
        type: "line",
        data: Array.from({ length: 4 }, (_, i) => ({ time: `Q${i+1}`, value: 95 + Math.random() * 3 })) 
      },
      { 
        title: "Africa", 
        total: "89.7%", 
        trend: 6.5, 
        type: "bar",
        data: Array.from({ length: 4 }, (_, i) => ({ time: `Q${i+1}`, value: 83 + (i * 2) + Math.random() * 2 })) 
      },
    ]
  }
];

// People Counting Comparison Data - Separate column for comparison
export const PEOPLE_COUNTING_COMPARISON_DATA = {
  appName: "People Counting Analytics",
  icon: "👥",
  graphs: [
    { 
      title: "Main Entrance Flow", 
      total: "3,429", 
      trend: 15, 
      type: "line",
      data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 200 + (i * 30) + Math.floor(Math.random() * 100) })) 
    },
    { 
      title: "Food Court Occupancy", 
      total: "847", 
      trend: 22, 
      type: "area",
      data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 500 + Math.floor(Math.random() * 400) })) 
    },
    { 
      title: "South Wing Traffic", 
      total: "1,256", 
      trend: -8, 
      type: "bar",
      data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 800 + Math.floor(Math.random() * 600) })) 
    },
    { 
      title: "North Plaza Density", 
      total: "92%", 
      trend: 18, 
      type: "area",
      data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 60 + (i * 3) + Math.floor(Math.random() * 20) })) 
    },
    { 
      title: "Retail Zone Activity", 
      total: "2,134", 
      trend: 9, 
      type: "line",
      data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1500 + Math.floor(Math.random() * 800) })) 
    },
    { 
      title: "Peak Hour Volume", 
      total: "4,872", 
      trend: 25, 
      type: "bar",
      data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3000 + (i * 200) + Math.floor(Math.random() * 500) })) 
    },
  ]
};

// Application-Based Volume Monitoring (for nested panel layout)
export interface ApplicationMetric {
  metricName: string;
  currentValue: number;
  unit: string;
  trend: number;
  chartType: 'line' | 'bar' | 'area';
  data: Array<{ time: string, value: number }>;
  threshold?: number;
  status?: 'normal' | 'warning' | 'critical';
}

export interface CameraLocation {
  locationId: string;
  locationName: string;
  cameraId: string;
  status: 'active' | 'offline' | 'warning';
  metrics: ApplicationMetric[];
}

export interface ApplicationPanel {
  applicationId: string;
  applicationName: string;
  description: string;
  icon: string;
  totalCameras: number;
  activeAlerts: number;
  locations: CameraLocation[];
}

export const APPLICATION_MONITORING_DATA: ApplicationPanel[] = [
  {
    applicationId: 'people-counting',
    applicationName: 'People Counting',
    description: 'Real-time occupancy and foot traffic monitoring',
    icon: '👥',
    totalCameras: 12,
    activeAlerts: 1,
    locations: [
      {
        locationId: 'pc-loc-1',
        locationName: 'Main Entrance',
        cameraId: 'CAM-PC-001',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 342,
            unit: 'people',
            trend: 12,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 250 + Math.floor(Math.random() * 150) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 48,
            unit: 'ppl/hr',
            trend: -5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 40) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 156,
            unit: 'people',
            trend: 8,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 100 + Math.floor(Math.random() * 100) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 98,
            unit: '%',
            trend: 15,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 60 + Math.floor(Math.random() * 40) })),
            status: 'critical'
          }
        ]
      },
      {
        locationId: 'pc-loc-1b',
        locationName: 'Main Entrance',
        cameraId: 'CAM-PC-001B',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 298,
            unit: 'people',
            trend: 8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 220 + Math.floor(Math.random() * 130) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 42,
            unit: 'ppl/hr',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 28 + Math.floor(Math.random() * 35) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 134,
            unit: 'people',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 90 + Math.floor(Math.random() * 90) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 82,
            unit: '%',
            trend: 10,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 55 + Math.floor(Math.random() * 35) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-1c',
        locationName: 'Main Entrance',
        cameraId: 'CAM-PC-001C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 267,
            unit: 'people',
            trend: -3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 200 + Math.floor(Math.random() * 120) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 38,
            unit: 'ppl/hr',
            trend: -7,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 25 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 112,
            unit: 'people',
            trend: -2,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 75 + Math.floor(Math.random() * 80) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 71,
            unit: '%',
            trend: 6,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 48 + Math.floor(Math.random() * 30) })),
            status: 'warning'
          }
        ]
      },
      {
        locationId: 'pc-loc-2',
        locationName: 'Food Court',
        cameraId: 'CAM-PC-002',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 589,
            unit: 'people',
            trend: 22,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 400 + Math.floor(Math.random() * 250) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 72,
            unit: 'ppl/hr',
            trend: 18,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 50 + Math.floor(Math.random() * 50) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 234,
            unit: 'people',
            trend: 12,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 150 + Math.floor(Math.random() * 150) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 78,
            unit: '%',
            trend: 5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 50 + Math.floor(Math.random() * 50) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-2b',
        locationName: 'Food Court',
        cameraId: 'CAM-PC-002B',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 612,
            unit: 'people',
            trend: 19,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 420 + Math.floor(Math.random() * 240) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 68,
            unit: 'ppl/hr',
            trend: 15,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 48 + Math.floor(Math.random() * 48) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 245,
            unit: 'people',
            trend: 10,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 155 + Math.floor(Math.random() * 145) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 81,
            unit: '%',
            trend: 7,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 52 + Math.floor(Math.random() * 48) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-2c',
        locationName: 'Food Court',
        cameraId: 'CAM-PC-002C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 557,
            unit: 'people',
            trend: 25,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 380 + Math.floor(Math.random() * 260) })),
            status: 'warning'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 76,
            unit: 'ppl/hr',
            trend: 21,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 52 + Math.floor(Math.random() * 52) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 221,
            unit: 'people',
            trend: 14,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 145 + Math.floor(Math.random() * 155) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 74,
            unit: '%',
            trend: 3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 48 + Math.floor(Math.random() * 52) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-3',
        locationName: 'South Wing',
        cameraId: 'CAM-PC-003',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 198,
            unit: 'people',
            trend: -8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 150 + Math.floor(Math.random() * 100) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 24,
            unit: 'ppl/hr',
            trend: -12,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 15 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 89,
            unit: 'people',
            trend: -5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 60 + Math.floor(Math.random() * 60) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 45,
            unit: '%',
            trend: -2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-3b',
        locationName: 'South Wing',
        cameraId: 'CAM-PC-003B',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 214,
            unit: 'people',
            trend: -5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 160 + Math.floor(Math.random() * 105) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 26,
            unit: 'ppl/hr',
            trend: -9,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 17 + Math.floor(Math.random() * 23) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 95,
            unit: 'people',
            trend: -3,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 65 + Math.floor(Math.random() * 55) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 48,
            unit: '%',
            trend: 0,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 32 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-3c',
        locationName: 'South Wing',
        cameraId: 'CAM-PC-003C',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 185,
            unit: 'people',
            trend: -11,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 140 + Math.floor(Math.random() * 95) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 22,
            unit: 'ppl/hr',
            trend: -15,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 13 + Math.floor(Math.random() * 27) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 82,
            unit: 'people',
            trend: -7,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 55 + Math.floor(Math.random() * 65) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 42,
            unit: '%',
            trend: -4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 28 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-4',
        locationName: 'North Plaza',
        cameraId: 'CAM-PC-004',
        status: 'warning',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 412,
            unit: 'people',
            trend: 15,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 300 + Math.floor(Math.random() * 180) })),
            status: 'warning'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 56,
            unit: 'ppl/hr',
            trend: 10,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 35 + Math.floor(Math.random() * 45) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 178,
            unit: 'people',
            trend: 7,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 120 + Math.floor(Math.random() * 100) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 88,
            unit: '%',
            trend: 12,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 65 + Math.floor(Math.random() * 35) })),
            status: 'warning'
          }
        ]
      },
      {
        locationId: 'pc-loc-4b',
        locationName: 'North Plaza',
        cameraId: 'CAM-PC-004B',
        status: 'active',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 395,
            unit: 'people',
            trend: 12,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 290 + Math.floor(Math.random() * 175) })),
            status: 'normal'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 52,
            unit: 'ppl/hr',
            trend: 8,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 32 + Math.floor(Math.random() * 42) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 165,
            unit: 'people',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 112 + Math.floor(Math.random() * 95) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 84,
            unit: '%',
            trend: 10,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 62 + Math.floor(Math.random() * 33) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pc-loc-4c',
        locationName: 'North Plaza',
        cameraId: 'CAM-PC-004C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Total Count',
            currentValue: 428,
            unit: 'people',
            trend: 18,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 310 + Math.floor(Math.random() * 185) })),
            status: 'warning'
          },
          {
            metricName: 'Hourly Trend',
            currentValue: 60,
            unit: 'ppl/hr',
            trend: 13,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 38 + Math.floor(Math.random() * 48) })),
            status: 'normal'
          },
          {
            metricName: 'Zone Distribution',
            currentValue: 189,
            unit: 'people',
            trend: 9,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 128 + Math.floor(Math.random() * 105) })),
            status: 'normal'
          },
          {
            metricName: 'Peak Times',
            currentValue: 91,
            unit: '%',
            trend: 14,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 68 + Math.floor(Math.random() * 37) })),
            status: 'critical'
          }
        ]
      }
    ]
  },
  {
    applicationId: 'vehicle-monitoring',
    applicationName: 'Vehicle Monitoring',
    description: 'Comprehensive vehicle tracking and analytics',
    icon: '🚗',
    totalCameras: 12,
    activeAlerts: 0,
    locations: [
      {
        locationId: 'vm-loc-1',
        locationName: 'Entry Gate A',
        cameraId: 'CAM-VM-001',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 156,
            unit: 'vehicles',
            trend: 8,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 100 + Math.floor(Math.random() * 80) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 45,
            unit: 'cars',
            trend: 5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 18,
            unit: 'veh/min',
            trend: 3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 15) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 4.2,
            unit: 'minutes',
            trend: -2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3 + Math.random() * 3 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-1b',
        locationName: 'Entry Gate A',
        cameraId: 'CAM-VM-001B',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 168,
            unit: 'vehicles',
            trend: 10,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 108 + Math.floor(Math.random() * 85) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 48,
            unit: 'cars',
            trend: 6,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 32 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 20,
            unit: 'veh/min',
            trend: 4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 16) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 3.9,
            unit: 'minutes',
            trend: -3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.8 + Math.random() * 2.8 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-1c',
        locationName: 'Entry Gate A',
        cameraId: 'CAM-VM-001C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 143,
            unit: 'vehicles',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 92 + Math.floor(Math.random() * 75) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 42,
            unit: 'cars',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 28 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 16,
            unit: 'veh/min',
            trend: 2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 8 + Math.floor(Math.random() * 13) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 4.5,
            unit: 'minutes',
            trend: -1,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3.2 + Math.random() * 3.2 })),
            status: 'warning'
          }
        ]
      },
      {
        locationId: 'vm-loc-2',
        locationName: 'Entry Gate B',
        cameraId: 'CAM-VM-002',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 189,
            unit: 'vehicles',
            trend: 12,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 120 + Math.floor(Math.random() * 100) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 58,
            unit: 'cars',
            trend: 8,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 40 + Math.floor(Math.random() * 40) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 22,
            unit: 'veh/min',
            trend: 6,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 15 + Math.floor(Math.random() * 18) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 3.8,
            unit: 'minutes',
            trend: -5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.5 + Math.random() * 2.5 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-2b',
        locationName: 'Entry Gate B',
        cameraId: 'CAM-VM-002B',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 201,
            unit: 'vehicles',
            trend: 14,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 130 + Math.floor(Math.random() * 105) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 62,
            unit: 'cars',
            trend: 10,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 44 + Math.floor(Math.random() * 42) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 24,
            unit: 'veh/min',
            trend: 8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 17 + Math.floor(Math.random() * 20) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 3.5,
            unit: 'minutes',
            trend: -6,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.3 + Math.random() * 2.3 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-2c',
        locationName: 'Entry Gate B',
        cameraId: 'CAM-VM-002C',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 176,
            unit: 'vehicles',
            trend: 10,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 112 + Math.floor(Math.random() * 95) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 54,
            unit: 'cars',
            trend: 6,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 36 + Math.floor(Math.random() * 38) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 20,
            unit: 'veh/min',
            trend: 4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 13 + Math.floor(Math.random() * 16) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 4.1,
            unit: 'minutes',
            trend: -4,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.7 + Math.random() * 2.7 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-3',
        locationName: 'Exit Gate A',
        cameraId: 'CAM-VM-003',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 142,
            unit: 'vehicles',
            trend: 4,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 90 + Math.floor(Math.random() * 70) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 38,
            unit: 'cars',
            trend: 2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 25 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 16,
            unit: 'veh/min',
            trend: 1,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 8 + Math.floor(Math.random() * 12) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 2.1,
            unit: 'minutes',
            trend: -8,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.5 + Math.random() * 1.5 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-3b',
        locationName: 'Exit Gate A',
        cameraId: 'CAM-VM-003B',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 153,
            unit: 'vehicles',
            trend: 6,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 97 + Math.floor(Math.random() * 75) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 41,
            unit: 'cars',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 27 + Math.floor(Math.random() * 27) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 18,
            unit: 'veh/min',
            trend: 2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 13) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 2.3,
            unit: 'minutes',
            trend: -9,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.7 + Math.random() * 1.7 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-3c',
        locationName: 'Exit Gate A',
        cameraId: 'CAM-VM-003C',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 135,
            unit: 'vehicles',
            trend: 2,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 85 + Math.floor(Math.random() * 65) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 35,
            unit: 'cars',
            trend: 1,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 23 + Math.floor(Math.random() * 23) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 14,
            unit: 'veh/min',
            trend: 0,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 6 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 1.9,
            unit: 'minutes',
            trend: -7,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.3 + Math.random() * 1.3 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-4',
        locationName: 'Exit Gate B',
        cameraId: 'CAM-VM-004',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 167,
            unit: 'vehicles',
            trend: 7,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 105 + Math.floor(Math.random() * 85) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 52,
            unit: 'cars',
            trend: 4,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 35 + Math.floor(Math.random() * 35) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 19,
            unit: 'veh/min',
            trend: 3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 14) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 2.5,
            unit: 'minutes',
            trend: -6,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.8 + Math.random() * 1.8 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-4b',
        locationName: 'Exit Gate B',
        cameraId: 'CAM-VM-004B',
        status: 'active',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 178,
            unit: 'vehicles',
            trend: 9,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 112 + Math.floor(Math.random() * 90) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 55,
            unit: 'cars',
            trend: 5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 37 + Math.floor(Math.random() * 37) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 21,
            unit: 'veh/min',
            trend: 4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 14 + Math.floor(Math.random() * 15) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 2.7,
            unit: 'minutes',
            trend: -7,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.0 + Math.random() * 2.0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'vm-loc-4c',
        locationName: 'Exit Gate B',
        cameraId: 'CAM-VM-004C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Vehicle Count',
            currentValue: 155,
            unit: 'vehicles',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 98 + Math.floor(Math.random() * 80) })),
            status: 'normal'
          },
          {
            metricName: 'Type Distribution',
            currentValue: 48,
            unit: 'cars',
            trend: 2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 32 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          },
          {
            metricName: 'Flow Rate',
            currentValue: 17,
            unit: 'veh/min',
            trend: 1,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 12) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 2.8,
            unit: 'minutes',
            trend: -5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.1 + Math.random() * 2.1 })),
            status: 'warning'
          }
        ]
      }
    ]
  },
  {
    applicationId: 'crowd-density',
    applicationName: 'Crowd Density Estimation',
    description: 'Monitor crowd levels and capacity management',
    icon: '🧑‍🤝‍🧑',
    totalCameras: 12,
    activeAlerts: 2,
    locations: [
      {
        locationId: 'cd-loc-1',
        locationName: 'Stadium Section A',
        cameraId: 'CAM-CD-001',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 1248,
            unit: 'people',
            trend: 25,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 800 + Math.floor(Math.random() * 600) })),
            status: 'warning'
          },
          {
            metricName: 'Capacity %',
            currentValue: 94,
            unit: '%',
            trend: 18,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 70 + Math.floor(Math.random() * 30) })),
            status: 'critical'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 78,
            unit: 'zones',
            trend: 12,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 50 + Math.floor(Math.random() * 40) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 3,
            unit: 'zones',
            trend: 50,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 5) })),
            status: 'warning'
          }
        ]
      },
      {
        locationId: 'cd-loc-1b',
        locationName: 'Stadium Section A',
        cameraId: 'CAM-CD-001B',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 1189,
            unit: 'people',
            trend: 22,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 760 + Math.floor(Math.random() * 570) })),
            status: 'warning'
          },
          {
            metricName: 'Capacity %',
            currentValue: 90,
            unit: '%',
            trend: 15,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 67 + Math.floor(Math.random() * 28) })),
            status: 'warning'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 74,
            unit: 'zones',
            trend: 10,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 48 + Math.floor(Math.random() * 38) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 2,
            unit: 'zones',
            trend: 33,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 4) })),
            status: 'warning'
          }
        ]
      },
      {
        locationId: 'cd-loc-1c',
        locationName: 'Stadium Section A',
        cameraId: 'CAM-CD-001C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 1312,
            unit: 'people',
            trend: 28,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 840 + Math.floor(Math.random() * 630) })),
            status: 'critical'
          },
          {
            metricName: 'Capacity %',
            currentValue: 99,
            unit: '%',
            trend: 21,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 75 + Math.floor(Math.random() * 30) })),
            status: 'critical'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 82,
            unit: 'zones',
            trend: 14,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 54 + Math.floor(Math.random() * 42) })),
            status: 'warning'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 4,
            unit: 'zones',
            trend: 75,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 6) })),
            status: 'critical'
          }
        ]
      },
      {
        locationId: 'cd-loc-2',
        locationName: 'Stadium Section B',
        cameraId: 'CAM-CD-002',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 892,
            unit: 'people',
            trend: 15,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 600 + Math.floor(Math.random() * 450) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 68,
            unit: '%',
            trend: 8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 50 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 65,
            unit: 'zones',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 45 + Math.floor(Math.random() * 35) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-2b',
        locationName: 'Stadium Section B',
        cameraId: 'CAM-CD-002B',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 923,
            unit: 'people',
            trend: 17,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 620 + Math.floor(Math.random() * 465) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 71,
            unit: '%',
            trend: 10,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 52 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 68,
            unit: 'zones',
            trend: 7,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 47 + Math.floor(Math.random() * 37) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-2c',
        locationName: 'Stadium Section B',
        cameraId: 'CAM-CD-002C',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 856,
            unit: 'people',
            trend: 13,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 580 + Math.floor(Math.random() * 435) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 65,
            unit: '%',
            trend: 6,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 48 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 62,
            unit: 'zones',
            trend: 3,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 43 + Math.floor(Math.random() * 33) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-3',
        locationName: 'Concourse East',
        cameraId: 'CAM-CD-003',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 456,
            unit: 'people',
            trend: 8,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 300 + Math.floor(Math.random() * 250) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 52,
            unit: '%',
            trend: 4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 35 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 42,
            unit: 'zones',
            trend: 2,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 1,
            unit: 'zones',
            trend: 0,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 2) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-3b',
        locationName: 'Concourse East',
        cameraId: 'CAM-CD-003B',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 478,
            unit: 'people',
            trend: 10,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 315 + Math.floor(Math.random() * 260) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 54,
            unit: '%',
            trend: 5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 37 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 44,
            unit: 'zones',
            trend: 3,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 32 + Math.floor(Math.random() * 26) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 1,
            unit: 'zones',
            trend: 0,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: Math.floor(Math.random() * 2) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-3c',
        locationName: 'Concourse East',
        cameraId: 'CAM-CD-003C',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 432,
            unit: 'people',
            trend: 6,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 285 + Math.floor(Math.random() * 235) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 49,
            unit: '%',
            trend: 2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 33 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 40,
            unit: 'zones',
            trend: 1,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 28 + Math.floor(Math.random() * 24) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-4',
        locationName: 'Concourse West',
        cameraId: 'CAM-CD-004',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 523,
            unit: 'people',
            trend: 11,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 350 + Math.floor(Math.random() * 300) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 58,
            unit: '%',
            trend: 6,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 40 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 48,
            unit: 'zones',
            trend: 3,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 35 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-4b',
        locationName: 'Concourse West',
        cameraId: 'CAM-CD-004B',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 545,
            unit: 'people',
            trend: 13,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 365 + Math.floor(Math.random() * 310) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 61,
            unit: '%',
            trend: 8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 42 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 51,
            unit: 'zones',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 37 + Math.floor(Math.random() * 27) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'cd-loc-4c',
        locationName: 'Concourse West',
        cameraId: 'CAM-CD-004C',
        status: 'active',
        metrics: [
          {
            metricName: 'Current Density',
            currentValue: 498,
            unit: 'people',
            trend: 9,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 335 + Math.floor(Math.random() * 285) })),
            status: 'normal'
          },
          {
            metricName: 'Capacity %',
            currentValue: 55,
            unit: '%',
            trend: 4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 38 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          },
          {
            metricName: 'Heat Map Data',
            currentValue: 45,
            unit: 'zones',
            trend: 2,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 33 + Math.floor(Math.random() * 23) })),
            status: 'normal'
          },
          {
            metricName: 'Alert Zones',
            currentValue: 0,
            unit: 'zones',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'normal'
          }
        ]
      }
    ]
  },
  {
    applicationId: 'parking-monitoring',
    applicationName: 'Parking Lot Vehicle Monitoring',
    description: 'Real-time parking occupancy and analytics',
    icon: '🅿️',
    totalCameras: 12,
    activeAlerts: 0,
    locations: [
      {
        locationId: 'pm-loc-1',
        locationName: 'Lot A - Level 1',
        cameraId: 'CAM-PM-001',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 78,
            unit: '%',
            trend: 5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 60 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 42,
            unit: 'spots',
            trend: -12,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 3.5,
            unit: 'hours',
            trend: 8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2 + Math.random() * 3 })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 12,
            unit: 'veh/hr',
            trend: 15,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 8 + Math.floor(Math.random() * 8) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-1b',
        locationName: 'Lot A - Level 1',
        cameraId: 'CAM-PM-001B',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 84,
            unit: '%',
            trend: 7,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 60 + Math.floor(Math.random() * 35) })),
            status: 'warning'
          },
          {
            metricName: 'Available Spots',
            currentValue: 18,
            unit: 'spots',
            trend: -9,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 14,
            unit: 'veh/hr',
            trend: 5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 9 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 3.2,
            unit: 'hours',
            trend: -4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2 + Math.random() * 3 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-1c',
        locationName: 'Lot A - Level 1',
        cameraId: 'CAM-PM-001C',
        status: 'warning',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 89,
            unit: '%',
            trend: 10,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 64 + Math.floor(Math.random() * 38) })),
            status: 'critical'
          },
          {
            metricName: 'Available Spots',
            currentValue: 12,
            unit: 'spots',
            trend: -13,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 6 + Math.floor(Math.random() * 22) })),
            status: 'warning'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 16,
            unit: 'veh/hr',
            trend: 7,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 11 + Math.floor(Math.random() * 11) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 2.9,
            unit: 'hours',
            trend: -6,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.8 + Math.random() * 2.7 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-2',
        locationName: 'Lot A - Level 2',
        cameraId: 'CAM-PM-002',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 65,
            unit: '%',
            trend: 2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 50 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 68,
            unit: 'spots',
            trend: -8,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 55 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 2.8,
            unit: 'hours',
            trend: 5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.5 + Math.random() * 2.5 })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 15,
            unit: 'veh/hr',
            trend: 18,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-2b',
        locationName: 'Lot A - Level 2',
        cameraId: 'CAM-PM-002B',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 68,
            unit: '%',
            trend: 4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 50 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 38,
            unit: 'spots',
            trend: -6,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 25 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 11,
            unit: 'veh/hr',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 7 + Math.floor(Math.random() * 9) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 3.7,
            unit: 'hours',
            trend: -3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.5 + Math.random() * 3.5 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-2c',
        locationName: 'Lot A - Level 2',
        cameraId: 'CAM-PM-002C',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 61,
            unit: '%',
            trend: 2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 46 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 45,
            unit: 'spots',
            trend: -3,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 35) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 9,
            unit: 'veh/hr',
            trend: 1,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 5 + Math.floor(Math.random() * 8) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 4.1,
            unit: 'hours',
            trend: -2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3.0 + Math.random() * 4.0 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-3',
        locationName: 'Lot B - Level 1',
        cameraId: 'CAM-PM-003',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 92,
            unit: '%',
            trend: 12,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 75 + Math.floor(Math.random() * 20) })),
            status: 'warning'
          },
          {
            metricName: 'Available Spots',
            currentValue: 15,
            unit: 'spots',
            trend: -25,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 15) })),
            status: 'warning'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 4.2,
            unit: 'hours',
            trend: 15,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3 + Math.random() * 2.5 })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 8,
            unit: 'veh/hr',
            trend: -18,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 5 + Math.floor(Math.random() * 6) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-3b',
        locationName: 'Lot B - Level 1',
        cameraId: 'CAM-PM-003B',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 76,
            unit: '%',
            trend: 6,
            chartType: 'line',
            threshold: 90,
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 56 + Math.floor(Math.random() * 33) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 28,
            unit: 'spots',
            trend: -8,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 18 + Math.floor(Math.random() * 28) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 13,
            unit: 'veh/hr',
            trend: 4,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 8 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 3.4,
            unit: 'hours',
            trend: -5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.2 + Math.random() * 3.2 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-3c',
        locationName: 'Lot B - Level 1',
        cameraId: 'CAM-PM-003C',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 69,
            unit: '%',
            trend: 3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 52 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 35,
            unit: 'spots',
            trend: -5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 22 + Math.floor(Math.random() * 32) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 11,
            unit: 'veh/hr',
            trend: 2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 6 + Math.floor(Math.random() * 9) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 3.8,
            unit: 'hours',
            trend: -4,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 2.6 + Math.random() * 3.6 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-4',
        locationName: 'Lot B - Level 2',
        cameraId: 'CAM-PM-004',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 58,
            unit: '%',
            trend: -2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 45 + Math.floor(Math.random() * 25) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 82,
            unit: 'spots',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 70 + Math.floor(Math.random() * 20) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 2.2,
            unit: 'hours',
            trend: -5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1.5 + Math.random() * 2 })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 18,
            unit: 'veh/hr',
            trend: 22,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-4b',
        locationName: 'Lot B - Level 2',
        cameraId: 'CAM-PM-004B',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 56,
            unit: '%',
            trend: 3,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 42 + Math.floor(Math.random() * 26) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 52,
            unit: 'spots',
            trend: -4,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 38 + Math.floor(Math.random() * 38) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 8,
            unit: 'veh/hr',
            trend: 2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 5 + Math.floor(Math.random() * 7) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 4.3,
            unit: 'hours',
            trend: -2,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3.2 + Math.random() * 4.2 })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'pm-loc-4c',
        locationName: 'Lot B - Level 2',
        cameraId: 'CAM-PM-004C',
        status: 'active',
        metrics: [
          {
            metricName: 'Occupancy Rate',
            currentValue: 49,
            unit: '%',
            trend: 1,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 38 + Math.floor(Math.random() * 24) })),
            status: 'normal'
          },
          {
            metricName: 'Available Spots',
            currentValue: 59,
            unit: 'spots',
            trend: -2,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 44 + Math.floor(Math.random() * 42) })),
            status: 'normal'
          },
          {
            metricName: 'Turnover Rate',
            currentValue: 6,
            unit: 'veh/hr',
            trend: 0,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3 + Math.floor(Math.random() * 6) })),
            status: 'normal'
          },
          {
            metricName: 'Avg Duration',
            currentValue: 4.8,
            unit: 'hours',
            trend: -1,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 3.7 + Math.random() * 4.7 })),
            status: 'normal'
          }
        ]
      }
    ]
  },
  {
    applicationId: 'footfall',
    applicationName: 'Footfall Analytics',
    description: 'Entry/exit tracking and conversion analytics',
    icon: '👣',
    totalCameras: 12,
    activeAlerts: 0,
    locations: [
      {
        locationId: 'ff-loc-1',
        locationName: 'Store Front A',
        cameraId: 'CAM-FF-001',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 1248,
            unit: 'visitors',
            trend: 18,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 800 + Math.floor(Math.random() * 600) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 1189,
            unit: 'visitors',
            trend: 16,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 750 + Math.floor(Math.random() * 600) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 24,
            unit: '%',
            trend: 5,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 18 + Math.floor(Math.random() * 12) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 18.5,
            unit: 'minutes',
            trend: 8,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 15) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-1b',
        locationName: 'Store Front A',
        cameraId: 'CAM-FF-001B',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 1312,
            unit: 'visitors',
            trend: 21,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 840 + Math.floor(Math.random() * 630) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 1245,
            unit: 'visitors',
            trend: 19,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 785 + Math.floor(Math.random() * 630) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 26,
            unit: '%',
            trend: 7,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 20 + Math.floor(Math.random() * 13) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 20.2,
            unit: 'minutes',
            trend: 10,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 16) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-1c',
        locationName: 'Store Front A',
        cameraId: 'CAM-FF-001C',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 1178,
            unit: 'visitors',
            trend: 15,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 760 + Math.floor(Math.random() * 570) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 1124,
            unit: 'visitors',
            trend: 13,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 715 + Math.floor(Math.random() * 570) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 22,
            unit: '%',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 16 + Math.floor(Math.random() * 11) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 16.8,
            unit: 'minutes',
            trend: 6,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 14) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-2',
        locationName: 'Store Front B',
        cameraId: 'CAM-FF-002',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 892,
            unit: 'visitors',
            trend: 12,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 600 + Math.floor(Math.random() * 450) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 845,
            unit: 'visitors',
            trend: 11,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 550 + Math.floor(Math.random() * 450) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 31,
            unit: '%',
            trend: 8,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 25 + Math.floor(Math.random() * 12) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 22.8,
            unit: 'minutes',
            trend: 12,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 16 + Math.floor(Math.random() * 15) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-2b',
        locationName: 'Store Front B',
        cameraId: 'CAM-FF-002B',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 935,
            unit: 'visitors',
            trend: 14,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 620 + Math.floor(Math.random() * 480) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 891,
            unit: 'visitors',
            trend: 13,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 590 + Math.floor(Math.random() * 480) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 21,
            unit: '%',
            trend: 4,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 16 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 15.7,
            unit: 'minutes',
            trend: 6,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 13) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-2c',
        locationName: 'Store Front B',
        cameraId: 'CAM-FF-002C',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 845,
            unit: 'visitors',
            trend: 10,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 560 + Math.floor(Math.random() * 430) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 807,
            unit: 'visitors',
            trend: 9,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 535 + Math.floor(Math.random() * 430) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 18,
            unit: '%',
            trend: 2,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 14 + Math.floor(Math.random() * 9) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 13.4,
            unit: 'minutes',
            trend: 4,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 8 + Math.floor(Math.random() * 11) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-3',
        locationName: 'Mall Entrance C',
        cameraId: 'CAM-FF-003',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 2156,
            unit: 'visitors',
            trend: 25,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1400 + Math.floor(Math.random() * 1000) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 2089,
            unit: 'visitors',
            trend: 24,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 1350 + Math.floor(Math.random() * 1000) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 18,
            unit: '%',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 12) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 45.2,
            unit: 'minutes',
            trend: 15,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 30 + Math.floor(Math.random() * 30) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-3b',
        locationName: 'Mall Entrance C',
        cameraId: 'CAM-FF-003B',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 678,
            unit: 'visitors',
            trend: 9,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 450 + Math.floor(Math.random() * 350) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 645,
            unit: 'visitors',
            trend: 8,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 425 + Math.floor(Math.random() * 350) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 16,
            unit: '%',
            trend: 3,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 12 + Math.floor(Math.random() * 8) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 12.3,
            unit: 'minutes',
            trend: 5,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 7 + Math.floor(Math.random() * 10) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-3c',
        locationName: 'Mall Entrance C',
        cameraId: 'CAM-FF-003C',
        status: 'active',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 612,
            unit: 'visitors',
            trend: 6,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 405 + Math.floor(Math.random() * 315) })),
            status: 'normal'
          },
          {
            metricName: 'Exit Count',
            currentValue: 583,
            unit: 'visitors',
            trend: 5,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 385 + Math.floor(Math.random() * 315) })),
            status: 'normal'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 14,
            unit: '%',
            trend: 1,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 10 + Math.floor(Math.random() * 7) })),
            status: 'normal'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 10.9,
            unit: 'minutes',
            trend: 3,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 6 + Math.floor(Math.random() * 9) })),
            status: 'normal'
          }
        ]
      },
      {
        locationId: 'ff-loc-4',
        locationName: 'Mall Entrance D',
        cameraId: 'CAM-FF-004',
        status: 'offline',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 0,
            unit: 'visitors',
            trend: -100,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Exit Count',
            currentValue: 0,
            unit: 'visitors',
            trend: -100,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 0,
            unit: '%',
            trend: -100,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 0,
            unit: 'minutes',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          }
        ]
      },
      {
        locationId: 'ff-loc-4b',
        locationName: 'Mall Entrance D',
        cameraId: 'CAM-FF-004B',
        status: 'critical',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 0,
            unit: 'visitors',
            trend: -100,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Exit Count',
            currentValue: 0,
            unit: 'visitors',
            trend: -100,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 0,
            unit: '%',
            trend: -100,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 0,
            unit: 'minutes',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          }
        ]
      },
      {
        locationId: 'ff-loc-4c',
        locationName: 'Mall Entrance D',
        cameraId: 'CAM-FF-004C',
        status: 'critical',
        metrics: [
          {
            metricName: 'Entry Count',
            currentValue: 0,
            unit: 'visitors',
            trend: -100,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Exit Count',
            currentValue: 0,
            unit: 'visitors',
            trend: -100,
            chartType: 'line',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Conversion Rate',
            currentValue: 0,
            unit: '%',
            trend: -100,
            chartType: 'area',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          },
          {
            metricName: 'Dwell Time',
            currentValue: 0,
            unit: 'minutes',
            trend: -100,
            chartType: 'bar',
            data: Array.from({ length: 12 }, (_, i) => ({ time: `${8+i}:00`, value: 0 })),
            status: 'critical'
          }
        ]
      }
    ]
  }
];

// ─────────────────────────────────────────────────────────────────────────────
// QUALITY ANALYTICS — Mock Data
// ─────────────────────────────────────────────────────────────────────────────

export type QualityZoneStatus = "safe" | "warning" | "critical";
export type QualityAlertStatus = "open" | "acknowledged" | "resolved";
export type PersonComplianceStatus = "compliant" | "at-risk" | "non-compliant";

export interface QualityKPI {
  label: string;
  value: string;
  change: string;
  trend: "up" | "down";
  sparkline: number[];
  higherIsBetter: boolean;
  unit?: string;
}

export interface ComplianceTrendPoint {
  date: string;
  complianceRate: number;
  target: number;
}

export interface ViolationDefectTrendPoint {
  date: string;
  violations: number;
  defects: number;
}

export interface ViolationTypeEntry {
  name: string;
  value: number;
  color: string;
}

export interface QualityZone {
  id: string;
  name: string;
  violations: number;
  defects: number;
  complianceRate: number;
  status: QualityZoneStatus;
  camera: string;
  lastIncident: string;
}

export interface SeverityBreakdownEntry {
  category: string;
  minor: number;
  major: number;
  critical: number;
}

export interface BatchQualityEntry {
  batchId: string;
  shift: string;
  totalItems: number;
  passed: number;
  failed: number;
  passRate: number;
  timestamp: string;
}

export interface PersonComplianceEntry {
  id: string;
  name: string;
  role: string;
  department: string;
  complianceRate: number;
  violations: number;
  lastViolation: string;
  shift: string;
  status: PersonComplianceStatus;
}

export interface QualityAlertEntry {
  id: string;
  alertId: string;
  title: string;
  description: string;
  severity: "critical" | "high" | "medium" | "low";
  zone: string;
  camera: string;
  timestamp: string;
  status: QualityAlertStatus;
  acknowledgedBy?: string;
}

export interface TimeToCompliancePoint {
  bucket: string;
  count: number;
}

// KPI Cards
export const QUALITY_KPIS: QualityKPI[] = [
  { label: "Compliance Rate",  value: "94.2%", change: "+1.8%", trend: "up",   sparkline: [88, 89, 91, 90, 92, 93, 94.2], higherIsBetter: true  },
  { label: "Total Violations", value: "342",   change: "-12%",  trend: "down", sparkline: [420, 405, 390, 370, 355, 348, 342], higherIsBetter: false },
  { label: "Defect Rate",      value: "3.8%",  change: "-0.4%", trend: "down", sparkline: [5.2, 4.8, 4.5, 4.2, 4.0, 3.9, 3.8], higherIsBetter: false },
  { label: "High-Risk Zones",  value: "4",     change: "-2",    trend: "down", sparkline: [8, 7, 7, 6, 6, 5, 4], higherIsBetter: false },
];

// Compliance trend (weekly, last 7 weeks)
export const COMPLIANCE_TREND_DATA: ComplianceTrendPoint[] = [
  { date: "Feb 11", complianceRate: 87.4, target: 95 },
  { date: "Feb 18", complianceRate: 88.9, target: 95 },
  { date: "Feb 25", complianceRate: 89.8, target: 95 },
  { date: "Mar 04", complianceRate: 91.2, target: 95 },
  { date: "Mar 11", complianceRate: 92.5, target: 95 },
  { date: "Mar 18", complianceRate: 93.4, target: 95 },
  { date: "Mar 25", complianceRate: 94.2, target: 95 },
];

// Violation & defect trend (weekly)
export const VIOLATION_DEFECT_TREND_DATA: ViolationDefectTrendPoint[] = [
  { date: "Feb 11", violations: 82, defects: 28 },
  { date: "Feb 18", violations: 74, defects: 24 },
  { date: "Feb 25", violations: 68, defects: 22 },
  { date: "Mar 04", violations: 59, defects: 19 },
  { date: "Mar 11", violations: 51, defects: 17 },
  { date: "Mar 18", violations: 44, defects: 14 },
  { date: "Mar 25", violations: 34, defects: 11 },
];

// Violation type breakdown
export const VIOLATION_TYPE_DISTRIBUTION: ViolationTypeEntry[] = [
  { name: "PPE Missing", value: 38, color: "#EF4444" },
  { name: "Zone Breach", value: 28, color: "#EA580C" },
  { name: "Loitering",   value: 18, color: "#CA8A04" },
  { name: "Speed Limit", value: 10, color: "#3B82F6" },
  { name: "No Helmet",   value: 6,  color: "#64748B" },
];

// Zone heatmap (12 zones)
export const QUALITY_ZONES: QualityZone[] = [
  { id: "QZ01", name: "Warehouse Zone A", violations: 48, defects: 12, complianceRate: 72, status: "critical", camera: "Cam-W01",  lastIncident: "1m ago"  },
  { id: "QZ02", name: "Factory Floor B",  violations: 35, defects: 8,  complianceRate: 78, status: "critical", camera: "Cam-F02",  lastIncident: "3m ago"  },
  { id: "QZ03", name: "Loading Dock",     violations: 22, defects: 6,  complianceRate: 84, status: "warning",  camera: "Cam-LD01", lastIncident: "8m ago"  },
  { id: "QZ04", name: "Corridor 3B",      violations: 18, defects: 4,  complianceRate: 87, status: "warning",  camera: "Cam-C3B",  lastIncident: "12m ago" },
  { id: "QZ05", name: "Server Room A",    violations: 2,  defects: 1,  complianceRate: 98, status: "safe",     camera: "Cam-SR01", lastIncident: "2h ago"  },
  { id: "QZ06", name: "Main Entrance",    violations: 5,  defects: 2,  complianceRate: 96, status: "safe",     camera: "Cam-E01",  lastIncident: "45m ago" },
  { id: "QZ07", name: "Perimeter North",  violations: 31, defects: 9,  complianceRate: 80, status: "warning",  camera: "Cam-PN01", lastIncident: "5m ago"  },
  { id: "QZ08", name: "Retail Floor",     violations: 8,  defects: 3,  complianceRate: 94, status: "safe",     camera: "Cam-RF01", lastIncident: "1h ago"  },
  { id: "QZ09", name: "Parking Lot A",    violations: 14, defects: 4,  complianceRate: 91, status: "safe",     camera: "Cam-PA01", lastIncident: "22m ago" },
  { id: "QZ10", name: "Back Alley",       violations: 42, defects: 11, complianceRate: 74, status: "critical", camera: "Cam-BA01", lastIncident: "2m ago"  },
  { id: "QZ11", name: "Lobby Reception",  violations: 4,  defects: 1,  complianceRate: 97, status: "safe",     camera: "Cam-L02",  lastIncident: "3h ago"  },
  { id: "QZ12", name: "Emergency Exit B", violations: 45, defects: 10, complianceRate: 75, status: "critical", camera: "Cam-EX02", lastIncident: "4m ago"  },
];

// Severity breakdown per shift (stacked bar)
export const SEVERITY_BREAKDOWN_DATA: SeverityBreakdownEntry[] = [
  { category: "Shift A", minor: 12, major: 8,  critical: 3 },
  { category: "Shift B", minor: 18, major: 12, critical: 5 },
  { category: "Shift C", minor: 8,  major: 4,  critical: 1 },
  { category: "Weekend", minor: 22, major: 15, critical: 7 },
];

// Batch quality summary
export const BATCH_QUALITY_DATA: BatchQualityEntry[] = [
  { batchId: "BTC-2041", shift: "Shift A", totalItems: 240, passed: 228, failed: 12, passRate: 95.0, timestamp: "08:00–16:00" },
  { batchId: "BTC-2042", shift: "Shift B", totalItems: 310, passed: 280, failed: 30, passRate: 90.3, timestamp: "16:00–00:00" },
  { batchId: "BTC-2043", shift: "Shift C", totalItems: 185, passed: 180, failed: 5,  passRate: 97.3, timestamp: "00:00–08:00" },
  { batchId: "BTC-2044", shift: "Shift A", totalItems: 268, passed: 255, failed: 13, passRate: 95.1, timestamp: "Yesterday"   },
];

// Per-person compliance table (25 rows)
const _qaNames  = ["John Doe","Jane Smith","Mike Johnson","Sarah Williams","Robert Brown","Emily Davis","James Wilson","Linda Martinez","David Anderson","Patricia Thomas","Chris Jackson","Barbara White","Matthew Harris","Susan Lewis","Andrew Clark","Karen Robinson","Daniel Walker","Nancy Hall","Kevin Young","Betty Allen","Steven King","Dorothy Wright","Edward Scott","Sandra Green","Frank Baker"];
const _qaRates  = [98.5,72.3,95.1,88.4,99.2,68.1,91.5,85.2,97.8,79.4,93.2,82.7,96.4,74.1,88.9,91.3,69.5,94.8,83.6,97.1,76.2,90.5,86.3,93.7,71.8];
const _qaViols  = [2,18,5,12,1,24,8,14,3,20,7,15,4,22,11,8,21,5,16,3,19,9,13,6,23];
const _qaTimes  = ["2h ago","5m ago","1d ago","30m ago","3d ago","2m ago","4h ago","15m ago","2d ago","8m ago","6h ago","20m ago","1d ago","3m ago","45m ago","1h ago","7m ago","3h ago","25m ago","2d ago","4m ago","8h ago","35m ago","5h ago","1m ago"];
const _qaRoles  = ["Security Officer","Supervisor","Operator","Engineer","Manager"];
const _qaDepts  = ["Warehouse","Factory","Logistics","IT","Operations"];
const _qaShifts = ["Shift A","Shift B","Shift A","Shift C","Shift B"];

export const PERSON_COMPLIANCE_DATA: PersonComplianceEntry[] = _qaNames.map((name, i) => {
  const rate = _qaRates[i];
  const status: PersonComplianceStatus = rate >= 90 ? "compliant" : rate >= 80 ? "at-risk" : "non-compliant";
  return { id: `EMP-${1000 + i}`, name, role: _qaRoles[i % 5], department: _qaDepts[i % 5], complianceRate: rate, violations: _qaViols[i], lastViolation: _qaTimes[i], shift: _qaShifts[i % 5], status };
});

// Quality alerts & incidents feed
export const QUALITY_ALERTS: QualityAlertEntry[] = [
  { id: "1", alertId: "ALT-5091", title: "PPE Violation — No Helmet",       description: "Worker detected without safety helmet in high-risk zone.",   severity: "critical", zone: "Warehouse Zone A", camera: "Cam-W01",  timestamp: "17:42 PM", status: "open"                              },
  { id: "2", alertId: "ALT-5090", title: "Zone Breach — Restricted Area",   description: "Unauthorized person entered restricted server area.",         severity: "high",     zone: "Server Room A",   camera: "Cam-SR01", timestamp: "17:38 PM", status: "open"                              },
  { id: "3", alertId: "ALT-5089", title: "Loitering Near Emergency Exit",   description: "Person loitering near emergency exit for >15 minutes.",      severity: "high",     zone: "Emergency Exit B", camera: "Cam-EX02", timestamp: "17:35 PM", status: "acknowledged", acknowledgedBy: "J. Smith" },
  { id: "4", alertId: "ALT-5088", title: "Defect — Camera Signal Loss",     description: "Camera signal intermittent. Data quality degraded.",          severity: "medium",   zone: "Perimeter North", camera: "Cam-PN01", timestamp: "17:28 PM", status: "open"                              },
  { id: "5", alertId: "ALT-5087", title: "Compliance Dip Below Threshold",  description: "Back Alley zone dipped below 75% compliance target.",        severity: "medium",   zone: "Back Alley",      camera: "Cam-BA01", timestamp: "17:20 PM", status: "acknowledged", acknowledgedBy: "R. Brown" },
  { id: "6", alertId: "ALT-5086", title: "Speed Limit Exceeded",            description: "Vehicle exceeded 10 km/h limit in pedestrian zone.",          severity: "low",      zone: "Parking Lot A",   camera: "Cam-PA01", timestamp: "17:10 PM", status: "resolved"                          },
  { id: "7", alertId: "ALT-5085", title: "Minor Defect — Camera Occlusion", description: "Camera partially obscured. Cleaning required.",              severity: "low",      zone: "Loading Dock",    camera: "Cam-LD01", timestamp: "17:05 PM", status: "resolved"                          },
];

// Time-to-compliance histogram
export const TIME_TO_COMPLIANCE_DATA: TimeToCompliancePoint[] = [
  { bucket: "0-5m",   count: 45 },
  { bucket: "5-15m",  count: 82 },
  { bucket: "15-30m", count: 56 },
  { bucket: "30-60m", count: 28 },
  { bucket: ">60m",   count: 12 },
];

// ─────────────────────────────────────────────────────────────────────────────
// V2 QUALITY ANALYTICS — TERMINOLOGY SYSTEM
// ─────────────────────────────────────────────────────────────────────────────

export type QualityAppId = "ppe" | "pcb" | "welding" | "car-damage" | "construction";

export interface QualityTerminology {
  appLabel: string;
  complianceLabel: string;
  violationLabel: string;
  defectRateLabel: string;
  zoneLabel: string;
  batchLabel: string;
  /** 5 violation/defect category names, generic keys v1–v5 */
  violationTypes: [string, string, string, string, string];
  /** Short label for the primary metric rate on gauge */
  gaugeLabel: string;
  /** Unit shown next to cost metric */
  costUnit: string;
}

export const TERMINOLOGY_MAP: Record<QualityAppId, QualityTerminology> = {
  ppe: {
    appLabel:         "PPE Detection",
    complianceLabel:  "Compliance Rate",
    violationLabel:   "Violation",
    defectRateLabel:  "Defect Rate",
    zoneLabel:        "Zone",
    batchLabel:       "Shift",
    gaugeLabel:       "Defect Rate",
    costUnit:         "$/shift",
    violationTypes:   ["PPE Missing", "Zone Breach", "Loitering", "Speed Limit", "No Helmet"],
  },
  pcb: {
    appLabel:         "PCB Defect",
    complianceLabel:  "Pass Rate",
    violationLabel:   "Defect",
    defectRateLabel:  "Defect Rate",
    zoneLabel:        "Line",
    batchLabel:       "Batch",
    gaugeLabel:       "Defect Rate",
    costUnit:         "$/batch",
    violationTypes:   ["Solder Void", "Short Circuit", "Open Circuit", "Misalignment", "Contamination"],
  },
  welding: {
    appLabel:         "Welding QC",
    complianceLabel:  "Pass Rate",
    violationLabel:   "Rejection",
    defectRateLabel:  "Rejection Rate",
    zoneLabel:        "Station",
    batchLabel:       "Run",
    gaugeLabel:       "Rejection Rate",
    costUnit:         "$/run",
    violationTypes:   ["Porosity", "Undercut", "Crack", "Overlap", "Spatter"],
  },
  "car-damage": {
    appLabel:         "Car Damage",
    complianceLabel:  "Inspection Rate",
    violationLabel:   "Damage Flag",
    defectRateLabel:  "Damage Rate",
    zoneLabel:        "Bay",
    batchLabel:       "Vehicle",
    gaugeLabel:       "Damage Rate",
    costUnit:         "$/vehicle",
    violationTypes:   ["Dent", "Scratch", "Paint Chip", "Glass Crack", "Panel Gap"],
  },
  construction: {
    appLabel:         "Construction Safety",
    complianceLabel:  "Safety Rate",
    violationLabel:   "Hazard",
    defectRateLabel:  "Hazard Rate",
    zoneLabel:        "Site",
    batchLabel:       "Crew",
    gaugeLabel:       "Hazard Rate",
    costUnit:         "$/day",
    violationTypes:   ["No Hard Hat", "Unsafe Scaffold", "Exposed Wiring", "Missing Harness", "Blocked Exit"],
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// V2 MONITORING VIEW DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface LiveCompliancePoint { time: string; value: number }
export interface LiveViolationBar    { time: string; count: number; isSpike: boolean }
export interface CameraHealthEntry   { id: string; name: string; zone: string; status: "online" | "degraded" | "offline"; lastFrame: string; fps: number; confidence: number }
export interface BatchTickerEntry    { id: string; status: "pass" | "fail"; passRate: number; timestamp: string }

export const LIVE_COMPLIANCE_SPARKLINE: LiveCompliancePoint[] = Array.from({ length: 60 }, (_, i) => ({
  time: `${String(Math.floor(i / 2)).padStart(2, "0")}:${i % 2 === 0 ? "00" : "30"}`,
  value: Math.round((87 + (i / 59) * 7 + Math.sin(i / 4) * 1.5) * 10) / 10,
}));

export const LIVE_VIOLATION_BARS: LiveViolationBar[] = Array.from({ length: 60 }, (_, i) => {
  const isSpike = i === 15 || i === 32 || i === 51;
  return {
    time: `${String(Math.floor((i * 5) / 60)).padStart(2, "0")}:${String((i * 5) % 60).padStart(2, "0")}`,
    count: isSpike ? 8 + Math.floor(Math.random() * 5) : Math.floor(Math.random() * 4),
    isSpike,
  };
});

export const CAMERA_HEALTH_DATA: CameraHealthEntry[] = [
  { id: "CAM-01", name: "Cam-WH01", zone: "Warehouse A", status: "online",   lastFrame: "0.3s ago", fps: 30, confidence: 96.2 },
  { id: "CAM-02", name: "Cam-WH02", zone: "Warehouse B", status: "online",   lastFrame: "0.2s ago", fps: 30, confidence: 94.8 },
  { id: "CAM-03", name: "Cam-PR01", zone: "Production",  status: "online",   lastFrame: "0.4s ago", fps: 28, confidence: 97.1 },
  { id: "CAM-04", name: "Cam-PR02", zone: "Production",  status: "online",   lastFrame: "0.3s ago", fps: 30, confidence: 95.5 },
  { id: "CAM-05", name: "Cam-LB01", zone: "Loading Bay", status: "online",   lastFrame: "0.5s ago", fps: 25, confidence: 93.4 },
  { id: "CAM-06", name: "Cam-LB02", zone: "Loading Bay", status: "online",   lastFrame: "0.3s ago", fps: 29, confidence: 94.0 },
  { id: "CAM-07", name: "Cam-OF01", zone: "Office",      status: "online",   lastFrame: "0.2s ago", fps: 30, confidence: 98.2 },
  { id: "CAM-08", name: "Cam-EX01", zone: "Exit Gate",   status: "online",   lastFrame: "0.4s ago", fps: 27, confidence: 95.9 },
  { id: "CAM-09", name: "Cam-LD01", zone: "Loading Dock",status: "degraded", lastFrame: "2.1s ago", fps: 18, confidence: 71.3 },
  { id: "CAM-10", name: "Cam-PN01", zone: "Parking N",   status: "degraded", lastFrame: "3.4s ago", fps: 12, confidence: 58.6 },
  { id: "CAM-11", name: "Cam-BA01", zone: "Back Alley",  status: "offline",  lastFrame: "12m ago",  fps: 0,  confidence: 0    },
  { id: "CAM-12", name: "Cam-RT01", zone: "Rooftop",     status: "online",   lastFrame: "0.3s ago", fps: 30, confidence: 96.8 },
];

export const BATCH_TICKER_DATA: BatchTickerEntry[] = [
  { id: "BATCH-001", status: "pass", passRate: 97.2, timestamp: "14:30" },
  { id: "BATCH-002", status: "pass", passRate: 94.8, timestamp: "14:15" },
  { id: "BATCH-003", status: "fail", passRate: 71.3, timestamp: "14:00" },
  { id: "BATCH-004", status: "pass", passRate: 98.1, timestamp: "13:45" },
  { id: "BATCH-005", status: "pass", passRate: 95.6, timestamp: "13:30" },
  { id: "BATCH-006", status: "fail", passRate: 68.4, timestamp: "13:15" },
  { id: "BATCH-007", status: "pass", passRate: 92.7, timestamp: "13:00" },
  { id: "BATCH-008", status: "pass", passRate: 96.3, timestamp: "12:45" },
  { id: "BATCH-009", status: "fail", passRate: 74.1, timestamp: "12:30" },
  { id: "BATCH-010", status: "pass", passRate: 93.5, timestamp: "12:15" },
];

// ─────────────────────────────────────────────────────────────────────────────
// V2 MANAGER VIEW DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface ShiftComplianceEntry      { shift: "Morning" | "Afternoon" | "Night"; today: number; thisWeek: number }
export interface ViolationDefectByDayEntry { date: string; violations: number; defects: number }
export interface ViolationTypeByDayEntry   { date: string; v1: number; v2: number; v3: number; v4: number; v5: number }
export interface SeverityTrendEntry        { date: string; minor: number; major: number; critical: number }
export interface ZonePerformanceRow        { zone: string; camera: string; complianceRate: number; violations: number; peakHour: string; trend: "up" | "down" | "flat"; status: "safe" | "warning" | "critical" }
export interface IncidentLogEntry          { id: string; date: string; type: string; severity: "critical" | "high" | "medium" | "low"; zone: string; status: "open" | "in-progress" | "resolved"; resolutionTime: string }
export interface CoqByDayEntry             { date: string; cost: number }

export const COMPLIANCE_BY_SHIFT_DATA: ShiftComplianceEntry[] = [
  { shift: "Morning",   today: 95.2, thisWeek: 93.8 },
  { shift: "Afternoon", today: 91.4, thisWeek: 90.1 },
  { shift: "Night",     today: 88.7, thisWeek: 87.5 },
];

export const VIOLATION_DEFECT_BY_DAY_DATA: ViolationDefectByDayEntry[] = [
  { date: "Mon", violations: 38, defects: 12 },
  { date: "Tue", violations: 42, defects: 14 },
  { date: "Wed", violations: 51, defects: 17 },
  { date: "Thu", violations: 35, defects: 11 },
  { date: "Fri", violations: 44, defects: 15 },
  { date: "Sat", violations: 28, defects: 9  },
  { date: "Sun", violations: 22, defects: 7  },
];

export const VIOLATION_TYPE_BY_DAY_DATA: ViolationTypeByDayEntry[] = [
  { date: "Mon", v1: 14, v2: 10, v3: 6, v4: 5, v5: 3 },
  { date: "Tue", v1: 16, v2: 11, v3: 7, v4: 5, v5: 3 },
  { date: "Wed", v1: 20, v2: 13, v3: 8, v4: 6, v5: 4 },
  { date: "Thu", v1: 13, v2:  9, v3: 5, v4: 5, v5: 3 },
  { date: "Fri", v1: 17, v2: 11, v3: 7, v4: 6, v5: 3 },
  { date: "Sat", v1: 10, v2:  7, v3: 5, v4: 4, v5: 2 },
  { date: "Sun", v1:  8, v2:  6, v3: 4, v4: 3, v5: 1 },
];

export const SEVERITY_TREND_DATA: SeverityTrendEntry[] = [
  { date: "Mon", minor: 24, major: 11, critical: 3 },
  { date: "Tue", minor: 27, major: 12, critical: 3 },
  { date: "Wed", minor: 33, major: 14, critical: 4 },
  { date: "Thu", minor: 21, major: 10, critical: 4 },
  { date: "Fri", minor: 28, major: 12, critical: 4 },
  { date: "Sat", minor: 17, major: 8,  critical: 3 },
  { date: "Sun", minor: 13, major: 6,  critical: 3 },
];

export const ZONE_PERFORMANCE_TABLE_DATA: ZonePerformanceRow[] = [
  { zone: "Warehouse A",   camera: "CAM-01",  complianceRate: 96.2, violations: 8,  peakHour: "10:00",  trend: "up",   status: "safe"     },
  { zone: "Warehouse B",   camera: "CAM-02",  complianceRate: 91.4, violations: 22, peakHour: "14:00",  trend: "down", status: "warning"  },
  { zone: "Production",    camera: "CAM-03",  complianceRate: 97.1, violations: 5,  peakHour: "09:00",  trend: "up",   status: "safe"     },
  { zone: "Loading Bay",   camera: "CAM-05",  complianceRate: 82.3, violations: 41, peakHour: "11:00",  trend: "down", status: "critical" },
  { zone: "Office",        camera: "CAM-07",  complianceRate: 98.5, violations: 2,  peakHour: "13:00",  trend: "flat", status: "safe"     },
  { zone: "Exit Gate",     camera: "CAM-08",  complianceRate: 94.8, violations: 12, peakHour: "17:00",  trend: "up",   status: "safe"     },
  { zone: "Loading Dock",  camera: "CAM-09",  complianceRate: 76.1, violations: 57, peakHour: "08:00",  trend: "down", status: "critical" },
  { zone: "Parking N",     camera: "CAM-10",  complianceRate: 88.9, violations: 27, peakHour: "08:30",  trend: "flat", status: "warning"  },
  { zone: "Back Alley",    camera: "CAM-11",  complianceRate: 71.4, violations: 63, peakHour: "22:00",  trend: "down", status: "critical" },
  { zone: "Rooftop",       camera: "CAM-12",  complianceRate: 99.1, violations: 1,  peakHour: "12:00",  trend: "up",   status: "safe"     },
  { zone: "Reception",     camera: "CAM-04",  complianceRate: 93.7, violations: 15, peakHour: "09:30",  trend: "up",   status: "safe"     },
  { zone: "Break Room",    camera: "CAM-06",  complianceRate: 89.2, violations: 24, peakHour: "12:30",  trend: "flat", status: "warning"  },
];

// 7 days × 24 hours = 168 cells; value = relative staff/activity intensity 0–100
export const STAFFING_HEATMAP_QA: number[][] = Array.from({ length: 7 }, (_, day) =>
  Array.from({ length: 24 }, (_, hour) => {
    const isWeekend = day >= 5;
    const isPeak = (hour >= 9 && hour <= 12) || (hour >= 13 && hour <= 16);
    const isMid  = (hour >= 7 && hour < 9)  || (hour >= 16 && hour < 19);
    const base   = isWeekend ? 30 : 60;
    if (isPeak) return Math.min(100, base + 35 + Math.floor(Math.random() * 10));
    if (isMid)  return Math.min(100, base + 15 + Math.floor(Math.random() * 10));
    if (hour < 6 || hour >= 22) return Math.max(0, 10 + Math.floor(Math.random() * 10));
    return Math.max(0, base - 10 + Math.floor(Math.random() * 15));
  })
);

export const INCIDENT_LOG_DATA: IncidentLogEntry[] = [
  { id: "INC-001", date: "2026-04-02 14:22", type: "PPE Missing",    severity: "critical", zone: "Loading Dock",  status: "open",        resolutionTime: "—"       },
  { id: "INC-002", date: "2026-04-02 13:45", type: "Zone Breach",    severity: "high",     zone: "Warehouse B",   status: "in-progress",  resolutionTime: "—"       },
  { id: "INC-003", date: "2026-04-02 12:30", type: "Speed Violation", severity: "medium",  zone: "Loading Bay",   status: "resolved",    resolutionTime: "18 min"  },
  { id: "INC-004", date: "2026-04-02 11:10", type: "Loitering",      severity: "low",      zone: "Back Alley",    status: "resolved",    resolutionTime: "45 min"  },
  { id: "INC-005", date: "2026-04-02 10:55", type: "PPE Missing",    severity: "high",     zone: "Production",    status: "resolved",    resolutionTime: "12 min"  },
  { id: "INC-006", date: "2026-04-02 09:40", type: "Crowd Density",  severity: "critical", zone: "Loading Bay",   status: "open",        resolutionTime: "—"       },
  { id: "INC-007", date: "2026-04-02 08:22", type: "Zone Breach",    severity: "medium",   zone: "Exit Gate",     status: "resolved",    resolutionTime: "31 min"  },
  { id: "INC-008", date: "2026-04-01 17:15", type: "PPE Missing",    severity: "high",     zone: "Warehouse A",   status: "resolved",    resolutionTime: "22 min"  },
  { id: "INC-009", date: "2026-04-01 16:00", type: "Speed Violation", severity: "low",     zone: "Parking N",     status: "resolved",    resolutionTime: "1h 10m"  },
  { id: "INC-010", date: "2026-04-01 14:30", type: "Loitering",      severity: "medium",   zone: "Back Alley",    status: "in-progress", resolutionTime: "—"       },
];

export const COQ_BY_DAY_DATA: CoqByDayEntry[] = [
  { date: "Mon", cost: 1420 },
  { date: "Tue", cost: 1510 },
  { date: "Wed", cost: 1560 },
  { date: "Thu", cost: 1380 },
  { date: "Fri", cost: 1490 },
  { date: "Sat", cost: 1050 },
  { date: "Sun", cost: 780  },
];

// ─────────────────────────────────────────────────────────────────────────────
// V2 DIRECTOR VIEW DATA
// ─────────────────────────────────────────────────────────────────────────────

export interface SixMonthTrendEntry   { month: string; complianceRate: number; defectRate: number }
export interface CoqStackedMonthEntry { month: string; rework: number; rejection: number; inspection: number }
export interface IncidentByMonthEntry { month: string; critical: number; high: number; medium: number }

export const SIX_MONTH_TREND_DATA: SixMonthTrendEntry[] = [
  { month: "Oct", complianceRate: 84.2, defectRate: 6.1 },
  { month: "Nov", complianceRate: 86.8, defectRate: 5.7 },
  { month: "Dec", complianceRate: 88.3, defectRate: 5.1 },
  { month: "Jan", complianceRate: 90.5, defectRate: 4.6 },
  { month: "Feb", complianceRate: 92.1, defectRate: 4.1 },
  { month: "Mar", complianceRate: 94.2, defectRate: 3.8 },
];

export const COQ_STACKED_MONTHLY: CoqStackedMonthEntry[] = [
  { month: "Oct", rework: 18200, rejection: 11400, inspection: 7800 },
  { month: "Nov", rework: 16900, rejection: 10200, inspection: 7400 },
  { month: "Dec", rework: 15100, rejection:  9100, inspection: 7100 },
  { month: "Jan", rework: 13800, rejection:  8200, inspection: 6900 },
  { month: "Feb", rework: 12400, rejection:  7100, inspection: 6600 },
  { month: "Mar", rework: 10900, rejection:  6200, inspection: 6400 },
];

export const INCIDENT_BY_MONTH_DATA: IncidentByMonthEntry[] = [
  { month: "Oct", critical: 14, high: 38, medium: 61 },
  { month: "Nov", critical: 12, high: 33, medium: 55 },
  { month: "Dec", critical: 10, high: 29, medium: 48 },
  { month: "Jan", critical:  8, high: 24, medium: 41 },
  { month: "Feb", critical:  6, high: 19, medium: 35 },
  { month: "Mar", critical:  4, high: 15, medium: 28 },
];
