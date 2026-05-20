import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useIsDark } from "@/app/hooks/useIsDark";
import { cn } from "@/app/lib/utils";
import {
  ShieldAlert, UserX, Eye, Clock, Radio, Lock, UserPlus,
  Shield, Ban, Navigation2, Fingerprint, ChevronDown,
  CheckCircle2, X, AlertTriangle, Star, Camera,
  Zap, BookmarkPlus, MapPin, Activity, Upload, Mail,
  Users, Plus, Trash2, ChevronRight, ChevronLeft,
} from "lucide-react";
import { IdentityEvidenceMedia } from "./components/shared/IdentityEvidenceMedia";
import { SlidePanel } from "./components/panels/SlidePanel";
import { DataGrid, DataGridColumn, MonoCell, InterCell, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";
import { IDENTITY_LIVE_STATUS, IDENTITY_ZONES, LPR_ZONES, UNKNOWN_TRACKERS } from "./data/mockData";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

// ─── Types ────────────────────────────────────────────────────────────────────
type MatchStatus = "BLACKLIST" | "UNKNOWN" | "WHITELIST" | "AUTHORIZED" | "VIP" | "UNREGISTERED" | "BOLO";
type FeedFilter  = "all" | "threats" | "unknowns" | "vip" | "authorized";

interface FeedPerson {
  id: string;
  identType: "FACE" | "PLATE";
  status: MatchStatus;
  displayName: string;
  subLabel?: string;
  camera: string; cameraId: string; zone: string;
  time: string;
  confidence?: number;
  dwell?: number;
  recurringDays?: number;
  imageSrc?: string;
  plateText?: string;
  severity?: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  department?: string; employeeId?: string;
  enrollDate?: string; totalAppearances?: number;
  vehicleDesc?: string;
}

interface JourneyStop {
  camera: string; zone: string; time: string;
  dwellText: string; isCurrent?: boolean; alertNote?: string;
  linkedPlate?: string;
}

// ─── Camera node data ─────────────────────────────────────────────────────────
interface CameraNode {
  id: string;
  name: string;
  zone: string;
  status: "online" | "degraded" | "offline";
  fps: number;
  resolution: string;
  detections: number;
  lastSeen: string;
}

const CAMERA_NODES: CameraNode[] = [
  { id: "CAM-LB-01", name: "Lobby North Entry",      zone: "Main Lobby",        status: "online",   fps: 30, resolution: "4K",    detections: 312, lastSeen: "14:31:18" },
  { id: "CAM-LB-02", name: "Lobby South Entry",      zone: "Main Lobby",        status: "online",   fps: 30, resolution: "1080p", detections: 287, lastSeen: "14:31:22" },
  { id: "CAM-LB-03", name: "Lobby Reception Desk",   zone: "Main Lobby",        status: "online",   fps: 25, resolution: "1080p", detections: 198, lastSeen: "14:31:09" },
  { id: "CAM-NE-01", name: "North Gate Left",        zone: "North Entrance",    status: "online",   fps: 30, resolution: "4K",    detections: 182, lastSeen: "14:31:15" },
  { id: "CAM-NE-02", name: "North Gate Right",       zone: "North Entrance",    status: "online",   fps: 30, resolution: "1080p", detections: 164, lastSeen: "14:31:11" },
  { id: "CAM-SE-01", name: "South Gate A",           zone: "South Entrance",    status: "online",   fps: 30, resolution: "1080p", detections: 143, lastSeen: "14:30:55" },
  { id: "CAM-SE-02", name: "South Gate B",           zone: "South Entrance",    status: "online",   fps: 25, resolution: "720p",  detections: 121, lastSeen: "14:31:01" },
  { id: "CAM-SE-03", name: "South Corridor",         zone: "South Entrance",    status: "degraded", fps: 12, resolution: "720p",  detections: 88,  lastSeen: "14:28:44" },
  { id: "CAM-EL-01", name: "Executive Lift Bay",     zone: "Executive Lift",    status: "online",   fps: 30, resolution: "1080p", detections: 41,  lastSeen: "14:31:03" },
  { id: "CAM-GA-01", name: "Garage A Inbound",       zone: "Garage Entry A",    status: "online",   fps: 30, resolution: "4K",    detections: 134, lastSeen: "14:31:17" },
  { id: "CAM-GA-02", name: "Garage A Outbound",      zone: "Garage Entry A",    status: "online",   fps: 30, resolution: "1080p", detections: 128, lastSeen: "14:31:20" },
  { id: "CAM-GA-03", name: "Garage A Ramp",          zone: "Garage Entry A",    status: "online",   fps: 25, resolution: "1080p", detections: 99,  lastSeen: "14:31:06" },
  { id: "CAM-GB-01", name: "Garage B Inbound",       zone: "Garage Entry B",    status: "online",   fps: 30, resolution: "1080p", detections: 87,  lastSeen: "14:31:14" },
  { id: "CAM-GB-02", name: "Garage B Outbound",      zone: "Garage Entry B",    status: "online",   fps: 25, resolution: "1080p", detections: 74,  lastSeen: "14:31:08" },
  { id: "CAM-SG-01", name: "Side Gate Main",         zone: "Side Gate",         status: "online",   fps: 30, resolution: "4K",    detections: 97,  lastSeen: "14:31:19" },
  { id: "CAM-SG-02", name: "Side Gate Rear",         zone: "Side Gate",         status: "online",   fps: 25, resolution: "1080p", detections: 82,  lastSeen: "14:31:12" },
  { id: "CAM-SR-01", name: "Service Ramp Upper",     zone: "Service Ramp",      status: "online",   fps: 30, resolution: "1080p", detections: 44,  lastSeen: "14:31:05" },
  { id: "CAM-SR-02", name: "Service Ramp Lower",     zone: "Service Ramp",      status: "offline",  fps: 0,  resolution: "1080p", detections: 0,   lastSeen: "13:45:22" },
  { id: "CAM-RA-01", name: "Rooftop Door",           zone: "Rooftop Access",    status: "online",   fps: 25, resolution: "1080p", detections: 18,  lastSeen: "14:30:58" },
  { id: "CAM-BS-01", name: "Basement North",         zone: "Basement Store",    status: "online",   fps: 30, resolution: "1080p", detections: 28,  lastSeen: "14:31:00" },
  { id: "CAM-BS-02", name: "Basement South",         zone: "Basement Store",    status: "degraded", fps: 8,  resolution: "720p",  detections: 12,  lastSeen: "14:22:31" },
  { id: "CAM-SV-01", name: "Server Room Entry",      zone: "Server Room",       status: "online",   fps: 30, resolution: "4K",    detections: 14,  lastSeen: "14:31:16" },
  { id: "CAM-SV-02", name: "Server Room Interior",   zone: "Server Room",       status: "online",   fps: 30, resolution: "1080p", detections: 9,   lastSeen: "14:30:47" },
  { id: "CAM-RC-01", name: "Reception Front Desk",   zone: "Reception",         status: "online",   fps: 30, resolution: "4K",    detections: 176, lastSeen: "14:31:21" },
  { id: "CAM-RC-02", name: "Reception Waiting Area", zone: "Reception",         status: "online",   fps: 25, resolution: "1080p", detections: 142, lastSeen: "14:31:13" },
  { id: "CAM-RC-03", name: "Reception Side Hall",    zone: "Reception",         status: "online",   fps: 25, resolution: "1080p", detections: 98,  lastSeen: "14:31:07" },
  { id: "CAM-CO-01", name: "Main Corridor East",     zone: "Main Corridor",     status: "online",   fps: 30, resolution: "1080p", detections: 88,  lastSeen: "14:31:04" },
  { id: "CAM-CO-02", name: "Main Corridor West",     zone: "Main Corridor",     status: "online",   fps: 25, resolution: "1080p", detections: 71,  lastSeen: "14:30:52" },
  { id: "CAM-ST-01", name: "Stairwell B Level 1",    zone: "Stairwell B",       status: "online",   fps: 25, resolution: "720p",  detections: 34,  lastSeen: "14:30:43" },
  { id: "CAM-EX-01", name: "Emergency Exit North",   zone: "Emergency Exits",   status: "online",   fps: 25, resolution: "720p",  detections: 22,  lastSeen: "14:31:02" },
  { id: "CAM-EX-02", name: "Emergency Exit South",   zone: "Emergency Exits",   status: "offline",  fps: 0,  resolution: "720p",  detections: 0,   lastSeen: "09:14:08" },
  { id: "CAM-EP-01", name: "Perimeter Fence East",   zone: "External Perimeter",status: "online",   fps: 30, resolution: "4K",    detections: 47,  lastSeen: "14:31:10" },
];

// ─── FR Feed data ─────────────────────────────────────────────────────────────
const FR_PEOPLE: FeedPerson[] = [
  {
    id: "f1", identType: "FACE", status: "BLACKLIST",
    displayName: "Marcus Webb", subLabel: "Theft & Assault · Repeat Offender",
    camera: "CAM-LB-01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "14:31:22", confidence: 94.7, severity: "CRITICAL",
    imageSrc: "/people/man3.jpg",
  },
  {
    id: "f2", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #88", subLabel: "Action required · High dwell",
    camera: "CAM-SE-01", cameraId: "cam_south_entrance", zone: "South Entrance",
    time: "14:30:55", dwell: 252, recurringDays: 4, severity: "HIGH",
    imageSrc: "/people/face_landmark.png",
  },
  {
    id: "f3", identType: "FACE", status: "VIP",
    displayName: "Rajesh Mehta", subLabel: "CEO · Escort protocol active",
    camera: "CAM-NE-01", cameraId: "cam_north_entrance", zone: "North Entrance",
    time: "14:31:10", confidence: 97.3, severity: "LOW",
    imageSrc: "/people/man3.jpg",
  },
  {
    id: "f4", identType: "FACE", status: "WHITELIST",
    displayName: "John Smith", subLabel: "Engineering · L3 Access",
    camera: "CAM-LB-01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "14:29:45", confidence: 96.1, severity: "LOW",
    imageSrc: "/people/man2.webp",
    department: "Engineering", employeeId: "EMP-4821",
    enrollDate: "2025-08-14", totalAppearances: 312,
  },
  {
    id: "f5", identType: "FACE", status: "WHITELIST",
    displayName: "Sarah Johnson", subLabel: "Human Resources · L2 Access",
    camera: "CAM-RC-01", cameraId: "cam_reception", zone: "Reception",
    time: "14:27:14", confidence: 95.4, severity: "LOW",
    imageSrc: "/people/AI-autism_900x600.jpg",
    department: "Human Resources", employeeId: "EMP-2198",
    enrollDate: "2024-03-20", totalAppearances: 187,
  },
  {
    id: "f6", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #42", subLabel: "High dwell · Loitering suspected",
    camera: "CAM-LB-02", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "14:22:08", dwell: 410, recurringDays: 2, severity: "HIGH",
    imageSrc: "/people/man3.jpg",
  },
  {
    id: "f7", identType: "FACE", status: "WHITELIST",
    displayName: "Anjali Patel", subLabel: "Legal · L3 Access",
    camera: "CAM-NE-02", cameraId: "cam_north_entrance", zone: "North Entrance",
    time: "14:20:33", confidence: 93.8, severity: "LOW",
    imageSrc: "/people/face_landmark.png",
    department: "Legal", employeeId: "EMP-1145",
    enrollDate: "2024-07-01", totalAppearances: 223,
  },
  {
    id: "f8", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #15", subLabel: "Repeated access attempt · Server Room",
    camera: "CAM-SR-01", cameraId: "cam_server_room", zone: "Server Room",
    time: "14:18:45", dwell: 180, recurringDays: 6, severity: "HIGH",
    imageSrc: "/people/man2.webp",
  },
  {
    id: "f9", identType: "FACE", status: "WHITELIST",
    displayName: "David Kim", subLabel: "IT · L2 Access",
    camera: "CAM-SE-02", cameraId: "cam_south_entrance", zone: "South Entrance",
    time: "14:15:19", confidence: 97.0, severity: "LOW",
    imageSrc: "/people/man3.jpg",
    department: "IT", employeeId: "EMP-3310",
    enrollDate: "2025-01-15", totalAppearances: 95,
  },
  {
    id: "f10", identType: "FACE", status: "BLACKLIST",
    displayName: "James Carter", subLabel: "Armed Robbery · 2nd Sighting Today",
    camera: "CAM-SE-01", cameraId: "cam_south_entrance", zone: "South Entrance",
    time: "14:12:04", confidence: 88.6, severity: "CRITICAL",
    imageSrc: "/people/man3.jpg",
  },
  {
    id: "f11", identType: "FACE", status: "VIP",
    displayName: "Sunita Rao", subLabel: "CFO · Priority escort",
    camera: "CAM-RC-01", cameraId: "cam_reception", zone: "Reception",
    time: "14:09:50", confidence: 98.1, severity: "LOW",
    imageSrc: "/people/AI-autism_900x600.jpg",
  },
  {
    id: "f12", identType: "FACE", status: "WHITELIST",
    displayName: "Tom Edwards", subLabel: "Facilities · L1 Access",
    camera: "CAM-LB-01", cameraId: "cam_main_lobby", zone: "Main Lobby",
    time: "14:07:22", confidence: 92.3, severity: "LOW",
    imageSrc: "/people/man2.webp",
    department: "Facilities", employeeId: "EMP-0812",
    enrollDate: "2023-11-05", totalAppearances: 441,
  },
  {
    id: "f13", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #61", subLabel: "Observed near loading bay",
    camera: "CAM-LB-03", cameraId: "cam_loading_bay", zone: "Loading Bay",
    time: "14:04:11", dwell: 95, severity: "MEDIUM",
    imageSrc: "/people/face_landmark.png",
  },
  {
    id: "f14", identType: "FACE", status: "WHITELIST",
    displayName: "Maria Santos", subLabel: "Marketing · L2 Access",
    camera: "CAM-RC-02", cameraId: "cam_reception", zone: "Reception",
    time: "14:01:58", confidence: 94.9, severity: "LOW",
    imageSrc: "/people/AI-autism_900x600.jpg",
    department: "Marketing", employeeId: "EMP-2675",
    enrollDate: "2025-02-10", totalAppearances: 68,
  },
  {
    id: "f15", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #99", subLabel: "7-day recurring pattern",
    camera: "CAM-SE-01", cameraId: "cam_south_entrance", zone: "South Entrance",
    time: "13:58:30", dwell: 320, recurringDays: 7, severity: "HIGH",
    imageSrc: "/people/man3.jpg",
  },
  {
    id: "f16", identType: "FACE", status: "BLACKLIST",
    displayName: "EthanRoss", subLabel: "Drug Trafficking · Outstanding Warrant",
    camera: "CAM-NE-02", cameraId: "cam_north_entrance", zone: "North Entrance",
    time: "13:54:17", confidence: 91.8, severity: "CRITICAL",
    imageSrc: "/people/face_landmark.png",
  },
  {
    id: "f17", identType: "FACE", status: "UNKNOWN",
    displayName: "Unknown #37", subLabel: "Repeated entry attempts · No credential",
    camera: "CAM-BS-01", cameraId: "cam_basement_store", zone: "Basement Store",
    time: "13:49:03", dwell: 195, recurringDays: 3, severity: "HIGH",
    imageSrc: "/people/AI-autism_900x600.jpg",
  },
];

// ─── LPR Feed data ────────────────────────────────────────────────────────────
const LPR_PEOPLE: FeedPerson[] = [
  {
    id: "p1", identType: "PLATE", status: "BOLO",
    displayName: "RJ-5588-BR", subLabel: "Stolen Vehicle · Police Notified",
    camera: "CAM-GA-02", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:28:30", confidence: 91.0, severity: "CRITICAL",
    plateText: "RJ-5588-BR", vehicleDesc: "Black Toyota Innova",
    imageSrc: "/vehicle/1_qre-gAVNTuazaUPvNw2w-Q.jpg",
  },
  {
    id: "p2", identType: "PLATE", status: "UNREGISTERED",
    displayName: "UP80MN1123", subLabel: "Action required · Entry blocked",
    camera: "CAM-GA-01", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:31:06", confidence: 91.0, recurringDays: 3, severity: "HIGH",
    plateText: "UP80MN1123", vehicleDesc: "Silver Maruti Swift",
    imageSrc: "/vehicle/images (1).jpeg",
  },
  {
    id: "p3", identType: "PLATE", status: "UNREGISTERED",
    displayName: "KL-3312-MH", subLabel: "Action required · No permit",
    camera: "CAM-PL-01", cameraId: "cam_parking_lot", zone: "Parking Lot A",
    time: "14:25:01", confidence: 89.0, severity: "MEDIUM",
    plateText: "KL-3312-MH", vehicleDesc: "Red Honda City",
    imageSrc: "/vehicle/images (2).jpeg",
  },
  {
    id: "p4", identType: "PLATE", status: "VIP",
    displayName: "MH-0001-GJ", subLabel: "Executive · Valet protocol suggested",
    camera: "CAM-ME-01", cameraId: "cam_main_entrance", zone: "Main Entrance",
    time: "14:31:10", confidence: 98.5, severity: "LOW",
    plateText: "MH-0001-GJ", vehicleDesc: "Black Mercedes GLE",
    imageSrc: "/vehicle/green-car-license-number-plate-2167603229-wj5z7ib5.avif",
  },
  {
    id: "p5", identType: "PLATE", status: "AUTHORIZED",
    displayName: "KA05MJ4421", subLabel: "White Honda City · Rahul Sharma · Finance",
    camera: "CAM-GA-01", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:26:05", confidence: 98.2,
    plateText: "KA05MJ4421", vehicleDesc: "White Honda City",
    department: "Finance", employeeId: "EMP-2231",
    enrollDate: "2024-11-02", totalAppearances: 88,
    imageSrc: "/vehicle/images (3).jpeg",
  },
  {
    id: "p6", identType: "PLATE", status: "AUTHORIZED",
    displayName: "DL-7723-UP", subLabel: "Blue Toyota Camry · Priya Nair · HR",
    camera: "CAM-PL-02", cameraId: "cam_parking_lot_b", zone: "Parking Lot B",
    time: "14:22:45", confidence: 96.1,
    plateText: "DL-7723-UP", vehicleDesc: "Blue Toyota Camry",
    department: "Human Resources", employeeId: "EMP-3341",
    enrollDate: "2024-05-10", totalAppearances: 134,
    imageSrc: "/vehicle/images.jpeg",
  },
  {
    id: "p7", identType: "PLATE", status: "BOLO",
    displayName: "TN-09-AB-1234", subLabel: "Outstanding Warrant · Traffic Authority",
    camera: "CAM-ME-01", cameraId: "cam_main_entrance", zone: "Main Entrance",
    time: "14:20:17", confidence: 93.4, severity: "CRITICAL",
    plateText: "TN09AB1234", vehicleDesc: "White Hyundai i20",
    imageSrc: "/vehicle/images (1).jpeg",
  },
  {
    id: "p8", identType: "PLATE", status: "UNREGISTERED",
    displayName: "MH12DE4321", subLabel: "Action required · No visitor pass",
    camera: "CAM-PL-01", cameraId: "cam_parking_lot", zone: "Parking Lot A",
    time: "14:17:52", confidence: 87.5, recurringDays: 2, severity: "MEDIUM",
    plateText: "MH12DE4321", vehicleDesc: "Grey Volkswagen Polo",
    imageSrc: "/vehicle/images (2).jpeg",
  },
  {
    id: "p9", identType: "PLATE", status: "AUTHORIZED",
    displayName: "GJ01RR5566", subLabel: "Silver Tata Nexon · Arun Verma · Ops",
    camera: "CAM-GA-02", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:14:40", confidence: 97.8,
    plateText: "GJ01RR5566", vehicleDesc: "Silver Tata Nexon",
    department: "Operations", employeeId: "EMP-5512",
    enrollDate: "2024-09-18", totalAppearances: 201,
    imageSrc: "/vehicle/images (3).jpeg",
  },
  {
    id: "p10", identType: "PLATE", status: "UNREGISTERED",
    displayName: "RJ14UA9988", subLabel: "Action required · 2nd attempt today",
    camera: "CAM-GA-01", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "14:11:05", confidence: 85.2, recurringDays: 1, severity: "HIGH",
    plateText: "RJ14UA9988", vehicleDesc: "Orange Maruti Brezza",
    imageSrc: "/vehicle/images.jpeg",
  },
  {
    id: "p11", identType: "PLATE", status: "AUTHORIZED",
    displayName: "AP28CX7712", subLabel: "Red Kia Seltos · Deepa Krishnan · Legal",
    camera: "CAM-SC-01", cameraId: "cam_staff_car_park", zone: "Staff Car Park",
    time: "14:08:30", confidence: 95.6,
    plateText: "AP28CX7712", vehicleDesc: "Red Kia Seltos",
    department: "Legal", employeeId: "EMP-1872",
    enrollDate: "2025-03-01", totalAppearances: 47,
    imageSrc: "/vehicle/1_qre-gAVNTuazaUPvNw2w-Q.jpg",
  },
  {
    id: "p12", identType: "PLATE", status: "UNREGISTERED",
    displayName: "UP32KA0055", subLabel: "No permit · Parked in restricted zone",
    camera: "CAM-LB-01", cameraId: "cam_loading_bay", zone: "Loading Bay",
    time: "14:05:14", confidence: 90.1, severity: "MEDIUM",
    plateText: "UP32KA0055", vehicleDesc: "Black Mahindra Thar",
    imageSrc: "/vehicle/green-car-license-number-plate-2167603229-wj5z7ib5.avif",
  },
  {
    id: "p13", identType: "PLATE", status: "AUTHORIZED",
    displayName: "KA01MN3344", subLabel: "White Suzuki Baleno · Vikram Iyer · IT",
    camera: "CAM-VP-01", cameraId: "cam_visitor_parking", zone: "Visitor Parking",
    time: "14:02:59", confidence: 94.3,
    plateText: "KA01MN3344", vehicleDesc: "White Suzuki Baleno",
    department: "IT", employeeId: "EMP-4490",
    enrollDate: "2024-12-12", totalAppearances: 156,
    imageSrc: "/vehicle/images (1).jpeg",
  },
  {
    id: "p14", identType: "PLATE", status: "VIP",
    displayName: "DL01AA0007", subLabel: "Director · Reserved bay allocated",
    camera: "CAM-ME-01", cameraId: "cam_main_entrance", zone: "Main Entrance",
    time: "13:59:22", confidence: 99.0, severity: "LOW",
    plateText: "DL01AA0007", vehicleDesc: "Black BMW 7 Series",
    imageSrc: "/vehicle/images (2).jpeg",
  },
  {
    id: "p15", identType: "PLATE", status: "UNREGISTERED",
    displayName: "HR26BG6601", subLabel: "Action required · Unknown visitor",
    camera: "CAM-GA-02", cameraId: "cam_garage_entry_a", zone: "Garage Entry A",
    time: "13:56:40", confidence: 88.0, severity: "MEDIUM",
    plateText: "HR26BG6601", vehicleDesc: "Green Hyundai Creta",
    imageSrc: "/vehicle/images (3).jpeg",
  },
];

// ─── Journey data ─────────────────────────────────────────────────────────────
const FR_JOURNEY: Record<string, JourneyStop[]> = {
  f1: [
    { camera: "CAM-PG-01", zone: "Parking Garage",  time: "08:52", dwellText: "4s",   linkedPlate: "KA05MJ4421" },
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "08:58", dwellText: "42s",  alertNote: "Entered via side door" },
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:11", dwellText: "2s" },
    { camera: "CAM-LB-01", zone: "Main Lobby",      time: "14:31", dwellText: "active", isCurrent: true, alertNote: "BLACKLIST ACTIVE" },
  ],
  f2: [
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "08:41", dwellText: "31s" },
    { camera: "CAM-LB-01", zone: "Main Lobby",      time: "09:05", dwellText: "18s" },
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "14:30", dwellText: "4m 12s+", isCurrent: true, alertNote: "Dwell time growing" },
  ],
  f3: [
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:31", dwellText: "active", isCurrent: true, alertNote: "VIP — escort recommended" },
  ],
  f4: [
    { camera: "CAM-PG-01", zone: "Parking Garage",  time: "08:52", dwellText: "3s",   linkedPlate: "KA05MJ4421" },
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:11", dwellText: "2s" },
    { camera: "CAM-LB-01", zone: "Main Lobby",      time: "14:29", dwellText: "active", isCurrent: true },
  ],
  f5: [
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "14:06", dwellText: "2s" },
    { camera: "CAM-RC-01", zone: "Reception",       time: "14:27", dwellText: "active", isCurrent: true },
  ],
  f6:  [{ camera: "CAM-LB-02", zone: "Main Lobby",      time: "14:22", dwellText: "6m 50s+", isCurrent: true, alertNote: "Loitering — dwell growing" }],
  f7:  [{ camera: "CAM-NE-02", zone: "North Entrance",  time: "14:20", dwellText: "active",  isCurrent: true }],
  f8:  [{ camera: "CAM-SR-01", zone: "Server Room",     time: "14:18", dwellText: "3m+",     isCurrent: true, alertNote: "Repeated access attempt" }],
  f9:  [{ camera: "CAM-SE-02", zone: "South Entrance",  time: "14:15", dwellText: "active",  isCurrent: true }],
  f10: [
    { camera: "CAM-NE-01", zone: "North Entrance",  time: "09:14", dwellText: "8s" },
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "14:12", dwellText: "active", isCurrent: true, alertNote: "BLACKLIST — 2nd sighting" },
  ],
  f11: [{ camera: "CAM-RC-01", zone: "Reception",       time: "14:09", dwellText: "active",  isCurrent: true, alertNote: "CFO — priority escort" }],
  f12: [{ camera: "CAM-LB-01", zone: "Main Lobby",      time: "14:07", dwellText: "active",  isCurrent: true }],
  f13: [{ camera: "CAM-LB-03", zone: "Loading Bay",     time: "14:04", dwellText: "1m 35s+", isCurrent: true, alertNote: "Observed near loading bay" }],
  f14: [{ camera: "CAM-RC-02", zone: "Reception",       time: "14:01", dwellText: "active",  isCurrent: true }],
  f15: [
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "08:30", dwellText: "4m 10s" },
    { camera: "CAM-SE-01", zone: "South Entrance",  time: "13:58", dwellText: "5m 20s+", isCurrent: true, alertNote: "7-day recurring pattern" },
  ],
  f16: [
    { camera: "CAM-EX-01", zone: "Emergency Exits",  time: "12:20", dwellText: "7s",    alertNote: "Unusual entry point" },
    { camera: "CAM-CO-01", zone: "Main Corridor",    time: "13:41", dwellText: "22s" },
    { camera: "CAM-NE-02", zone: "North Entrance",   time: "13:54", dwellText: "active", isCurrent: true, alertNote: "BLACKLIST ACTIVE" },
  ],
  f17: [
    { camera: "CAM-BS-01", zone: "Basement Store",   time: "10:15", dwellText: "1m 48s", alertNote: "1st attempt — access denied" },
    { camera: "CAM-SR-01", zone: "Service Ramp",     time: "12:03", dwellText: "55s",    alertNote: "2nd attempt via ramp" },
    { camera: "CAM-BS-01", zone: "Basement Store",   time: "13:49", dwellText: "3m 15s+", isCurrent: true, alertNote: "3rd attempt — dwell growing" },
  ],
};

const LPR_JOURNEY: Record<string, JourneyStop[]> = {
  p1: [
    { camera: "CAM-ME-01", zone: "Main Entrance",   time: "14:10", dwellText: "3s",   alertNote: "First appearance" },
    { camera: "CAM-GA-02", zone: "Garage Entry A",  time: "14:28", dwellText: "blocked", isCurrent: true, alertNote: "BOLO MATCH — entry denied" },
  ],
  p2: [
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:05", dwellText: "blocked",  alertNote: "1st attempt blocked" },
    { camera: "CAM-PL-01", zone: "Parking Lot A",   time: "14:18", dwellText: "circling", alertNote: "Observed circling" },
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:31", dwellText: "blocked",  isCurrent: true, alertNote: "3rd attempt — escalate" },
  ],
  p3: [
    { camera: "CAM-PL-01", zone: "Parking Lot A",   time: "14:25", dwellText: "parked", isCurrent: true, alertNote: "No permit — notify owner" },
  ],
  p4: [
    { camera: "CAM-ME-01", zone: "Main Entrance",   time: "14:31", dwellText: "active", isCurrent: true, alertNote: "VIP — valet suggested" },
  ],
  p5: [
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:26", dwellText: "authorised", isCurrent: true, alertNote: "Entry authorised" },
  ],
  p6:  [{ camera: "CAM-PL-02", zone: "Parking Lot B",   time: "14:22", dwellText: "parked",  isCurrent: true, alertNote: "Registered permit" }],
  p7:  [
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:08", dwellText: "circling", alertNote: "1st sighting" },
    { camera: "CAM-ME-01", zone: "Main Entrance",   time: "14:20", dwellText: "blocked",  isCurrent: true, alertNote: "BOLO — entry denied" },
  ],
  p8:  [{ camera: "CAM-PL-01", zone: "Parking Lot A",   time: "14:17", dwellText: "parked",  isCurrent: true, alertNote: "No visitor pass" }],
  p9:  [{ camera: "CAM-GA-02", zone: "Garage Entry A",  time: "14:14", dwellText: "authorised", isCurrent: true }],
  p10: [
    { camera: "CAM-ME-01", zone: "Main Entrance",   time: "10:45", dwellText: "blocked", alertNote: "1st attempt" },
    { camera: "CAM-GA-01", zone: "Garage Entry A",  time: "14:11", dwellText: "blocked",  isCurrent: true, alertNote: "2nd attempt — escalate" },
  ],
  p11: [{ camera: "CAM-SC-01", zone: "Staff Car Park",  time: "14:08", dwellText: "parked",  isCurrent: true }],
  p12: [{ camera: "CAM-LB-01", zone: "Loading Bay",     time: "14:05", dwellText: "parked",  isCurrent: true, alertNote: "Restricted zone — no permit" }],
  p13: [{ camera: "CAM-VP-01", zone: "Visitor Parking", time: "14:02", dwellText: "parked",  isCurrent: true }],
  p14: [{ camera: "CAM-ME-01", zone: "Main Entrance",   time: "13:59", dwellText: "active",  isCurrent: true, alertNote: "Director — reserved bay" }],
  p15: [{ camera: "CAM-GA-02", zone: "Garage Entry A",  time: "13:56", dwellText: "blocked",  isCurrent: true, alertNote: "Unknown visitor — entry denied" }],
};

// ─── Config ───────────────────────────────────────────────────────────────────
const STATUS_CFG: Record<MatchStatus, {
  label: string; bg: string; text: string;
  borderL: string; rowBg: string; dotColor: string; priority: number;
  headerBg: string; headerBorder: string;
}> = {
  BLACKLIST:    { label: "Blacklist",    bg: "bg-red-600",     text: "text-white",      borderL: "border-l-red-500",    rowBg: "bg-red-50/50",    dotColor: "bg-red-500",    priority: 0, headerBg: "bg-red-600",     headerBorder: "border-red-700" },
  BOLO:         { label: "BOLO",        bg: "bg-red-600",     text: "text-white",      borderL: "border-l-red-500",    rowBg: "bg-red-50/50",    dotColor: "bg-red-500",    priority: 0, headerBg: "bg-red-600",     headerBorder: "border-red-700" },
  UNKNOWN:      { label: "Unknown",     bg: "bg-amber-500",   text: "text-white",      borderL: "border-l-amber-400",  rowBg: "bg-amber-50/40",  dotColor: "bg-amber-400",  priority: 1, headerBg: "bg-amber-500",   headerBorder: "border-amber-600" },
  UNREGISTERED: { label: "Unregistered",bg: "bg-orange-500",  text: "text-white",      borderL: "border-l-orange-400", rowBg: "bg-orange-50/30", dotColor: "bg-orange-400", priority: 1, headerBg: "bg-orange-500",  headerBorder: "border-orange-600" },
  VIP:          { label: "VIP",         bg: "bg-yellow-500",  text: "text-yellow-900", borderL: "border-l-yellow-400", rowBg: "bg-yellow-50/20", dotColor: "bg-yellow-400", priority: 2, headerBg: "bg-yellow-500",  headerBorder: "border-yellow-600" },
  WHITELIST:    { label: "Authorised",  bg: "bg-emerald-600", text: "text-white",      borderL: "border-l-emerald-400",rowBg: "bg-white",        dotColor: "bg-emerald-500",priority: 3, headerBg: "bg-emerald-700", headerBorder: "border-emerald-800" },
  AUTHORIZED:   { label: "Authorised",  bg: "bg-emerald-600", text: "text-white",      borderL: "border-l-emerald-400",rowBg: "bg-white",        dotColor: "bg-emerald-500",priority: 3, headerBg: "bg-emerald-700", headerBorder: "border-emerald-800" },
};

/** Returns an array of page indices (0-based) and "…" separators for rendering. */
function getPaginationItems(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i);
  const items: (number | "…")[] = [0];
  if (current > 2)           items.push("…");
  for (let i = Math.max(1, current - 1); i <= Math.min(total - 2, current + 1); i++) items.push(i);
  if (current < total - 3)   items.push("…");
  items.push(total - 1);
  return items;
}

function fmtDwell(sec: number) {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60), s = sec % 60;
  return s ? `${m}m ${s}s` : `${m}m`;
}

// ─── Sub-components ────────────────────────────────────────────────────────────

type ActionDef = {
  key: string; label: string; confirmMsg: string; successMsg: string;
  icon?: React.ElementType; variant: "danger" | "primary" | "default";
};

type DrawerMode = { kind: "action"; action: ActionDef } | { kind: "watchlist" };

// ─── Watchlist Form ────────────────────────────────────────────────────────────
const FR_REASONS = [
  "Terminated Employee", "High Security VIP", "Shoplifting Suspect",
  "Security Threat", "Banned Visitor", "Previous Incident", "Custom Reason",
];
const LPR_REASONS = [
  "Banned Visitor", "Executive VIP", "Security Threat",
  "Previous Incident", "Unauthorised Vehicle", "Custom Reason",
];
const WL_CAMERAS = [
  "All Cameras",
  "Camera 01", "Camera 02", "Camera 03", "Camera 04", "Camera 05",
  "Camera 07", "Camera 09", "Camera 11", "Camera 12", "Camera 14",
  "Camera 15", "Camera 20",
];
const WL_GROUPS = [
  "Security Team", "Operations Manager", "Site Supervisor",
  "Executive Team", "Dispatch Center",
];

export interface WatchlistEntry {
  id: string;
  type: "FR" | "LPR";
  name: string;         // person name or first plate
  plates?: string;      // LPR only – raw textarea value
  reason: string;
  severity: "Critical" | "High" | "Informational";
  cameras: string[];
  endDate?: string;
  notes: string;
  addedAt: string;      // ISO timestamp
  photo_url?: string;
}

export function WatchlistForm({
  isLPR, person, initialEntry, onCancel, onSubmit,
}: {
  isLPR: boolean; person?: Partial<FeedPerson>;
  initialEntry?: WatchlistEntry;
  onCancel: () => void; onSubmit: (entry: WatchlistEntry) => void;
}) {
  const reasons = isLPR ? LPR_REASONS : FR_REASONS;

  // FR state
  const [frName,    setFrName]    = useState(initialEntry?.name ?? person?.displayName ?? "");
  const [personId,  setPersonId]  = useState(person?.employeeId ?? "");
  // LPR state
  const [plates,    setPlates]    = useState(initialEntry?.plates ?? person?.plateText ?? "");
  const [customReason, setCustomReason] = useState("");
  // Shared
  const [reason,      setReason]      = useState(initialEntry?.reason ?? "");
  const [reasonOpen,  setReasonOpen]  = useState(false);
  const [severity,    setSeverity]    = useState<"Critical" | "High" | "Informational">(initialEntry?.severity ?? "High");
  const [cameras,     setCameras]     = useState<string[]>(initialEntry?.cameras ?? ["All Cameras"]);
  const [hasEndDate,  setHasEndDate]  = useState(!!initialEntry?.endDate);
  const [endDate,     setEndDate]     = useState(initialEntry?.endDate ?? "");
  const [notes,       setNotes]       = useState(initialEntry?.notes ?? "");
  const [email,       setEmail]       = useState("");
  const [groups,      setGroups]      = useState<string[]>([]);

  const toggleCamera = (cam: string) => {
    if (cam === "All Cameras") { setCameras(["All Cameras"]); return; }
    setCameras(prev => {
      const filtered = prev.filter(c => c !== "All Cameras");
      return filtered.includes(cam) ? filtered.filter(c => c !== cam) : [...filtered, cam];
    });
  };
  const toggleGroup = (g: string) =>
    setGroups(prev => prev.includes(g) ? prev.filter(x => x !== g) : [...prev, g]);

  const inputCls = "w-full h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 focus:outline-none focus:border-[#00775B] placeholder:text-neutral-300";
  const labelCls = "block text-[10px] font-bold uppercase tracking-wide text-neutral-500 mb-1";

  const selectedCount = cameras.includes("All Cameras") ? "All" : cameras.length;

  return (
    <>
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        <p className="text-[11px] text-neutral-500 leading-relaxed">
          {isLPR
            ? "Add license plates to the BOLO (Be On the Lookout) watchlist. Multiple plates can be added at once."
            : "Add individuals to the watchlist for immediate alerting when detected by facial recognition."}
        </p>

        {isLPR ? (
          /* ── LPR: multi-plate textarea ── */
          <div>
            <label className={labelCls}>License Plate Number(s) <span className="text-red-500">*</span></label>
            <textarea
              value={plates} onChange={e => setPlates(e.target.value)}
              rows={3}
              placeholder={"Enter plate numbers separated by commas or new lines.\ne.g., ABC-1234, XYZ-5678\nor one per line"}
              className="w-full px-3 py-2 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 focus:outline-none focus:border-[#00775B] placeholder:text-neutral-300 resize-none"
            />
            <p className="text-[9px] text-neutral-400 mt-0.5">Supports bulk entry. Separate multiple plates with commas or new lines.</p>
          </div>
        ) : (
          /* ── FR: name + ID + image ── */
          <>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className={labelCls}>Person Name <span className="text-red-500">*</span></label>
                <input value={frName} onChange={e => setFrName(e.target.value)}
                  placeholder="e.g. John Doe" className={inputCls} />
                <p className="text-[9px] text-neutral-400 mt-0.5">Primary identifier for this flagged individual.</p>
              </div>
              <div>
                <label className={labelCls}>Person ID <span className="text-neutral-300">(Optional)</span></label>
                <input value={personId} onChange={e => setPersonId(e.target.value)}
                  placeholder="e.g. EMP-2451 or PER-1234" className={inputCls} />
                <p className="text-[9px] text-neutral-400 mt-0.5">Internal employee or person ID if applicable.</p>
              </div>
            </div>
            <div>
              <label className={labelCls}>Reference Image Upload</label>
              <div className="border-2 border-dashed border-neutral-200 rounded-[8px] p-5 text-center hover:border-[#00775B]/40 transition-colors cursor-pointer bg-neutral-50">
                <Upload className="w-5 h-5 text-neutral-400 mx-auto mb-1.5" />
                <p className="text-[11px] text-neutral-500">
                  <span className="font-semibold text-[#00775B]">Click to upload</span> or drag and drop
                </p>
                <p className="text-[9px] text-neutral-400 mt-0.5">PNG, JPG, GIF up to 10MB</p>
              </div>
              <p className="text-[9px] text-neutral-400 mt-1">Upload a clear photo for facial recognition matching. Highly recommended for accurate detection.</p>
            </div>
          </>
        )}

        {/* ── Watchlist Reason ── */}
        <div className="relative">
          <label className={labelCls}>Watchlist Name / Reason <span className="text-red-500">*</span></label>
          <button
            onClick={() => setReasonOpen(v => !v)}
            className="w-full h-8 px-3 flex items-center justify-between rounded-[6px] border border-neutral-200 text-[12px] text-left focus:outline-none hover:border-neutral-300 transition-colors"
          >
            <span className={reason ? "text-neutral-800" : "text-neutral-300"}>{reason || "Select a reason"}</span>
            <ChevronDown className={cn("w-3.5 h-3.5 text-neutral-400 transition-transform", reasonOpen && "rotate-180")} />
          </button>
          {reasonOpen && (
            <div className="absolute left-0 top-full z-10 mt-1 w-full rounded-[6px] border border-neutral-200 bg-white shadow-lg overflow-hidden">
              {reasons.map(r => (
                <button key={r} onClick={() => { setReason(r); setReasonOpen(false); }}
                  className={cn("w-full px-3 py-2 text-left text-[12px] hover:bg-[#E5FFF9] transition-colors",
                    reason === r ? "text-[#00775B] font-semibold bg-[#E5FFF9]" : "text-neutral-700"
                  )}>{r}</button>
              ))}
            </div>
          )}
          {/* LPR: custom reason text input */}
          {isLPR && reason === "Custom Reason" && (
            <input
              value={customReason} onChange={e => setCustomReason(e.target.value)}
              placeholder="Enter custom reason for this watchlist entry"
              className={cn(inputCls, "mt-2")}
            />
          )}
        </div>

        {/* ── Severity ── */}
        <div>
          <label className={labelCls}>Severity Level <span className="text-red-500">*</span></label>
          <div className="flex gap-2">
            {(["Critical", "High", "Informational"] as const).map(s => (
              <button key={s} onClick={() => setSeverity(s)}
                className={cn(
                  "flex-1 h-8 rounded-[6px] text-[11px] font-bold border transition-all",
                  severity === s
                    ? s === "Critical"      ? "bg-red-50 border-red-500 text-red-600"
                      : s === "High"        ? "bg-amber-50 border-amber-500 text-amber-600"
                      : "bg-blue-50 border-blue-400 text-blue-600"
                    : "border-neutral-200 bg-white text-neutral-500 hover:border-neutral-300"
                )}
              >{s}</button>
            ))}
          </div>
          <p className="text-[9px] text-neutral-400 mt-1">This priority level will determine alert prominence on the main dashboard.</p>
        </div>

        {/* ── FR: Associated Cameras/Zones ── */}
        {!isLPR && (
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className={cn(labelCls, "mb-0")}>Associated Cameras / Zones</label>
              <div className="flex items-center gap-2 text-[9px] text-neutral-500">
                <span className="font-semibold text-[#00775B]">{selectedCount} cameras selected</span>
                <button onClick={() => setCameras([])}
                  className="text-neutral-400 hover:text-neutral-600 underline"
                >Clear all</button>
              </div>
            </div>
            <div className="border border-neutral-200 rounded-[6px] overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-neutral-100">
                <div className="max-h-40 overflow-y-auto p-2 space-y-0.5">
                  {WL_CAMERAS.map(cam => (
                    <label key={cam} className="flex items-center gap-2 cursor-pointer px-1 py-1 hover:bg-neutral-50 rounded-[4px]">
                      <input type="checkbox" checked={cameras.includes(cam)} onChange={() => toggleCamera(cam)}
                        className="w-3 h-3 accent-[#00775B] rounded" />
                      <span className="text-[11px] text-neutral-700">{cam}</span>
                    </label>
                  ))}
                </div>
                <div className="p-2.5 text-[10px] text-neutral-400 flex flex-col gap-1">
                  <p className="font-semibold text-neutral-500">Selected:</p>
                  {cameras.length === 0
                    ? <p className="italic">None selected</p>
                    : cameras.includes("All Cameras")
                    ? <p className="text-[#00775B] font-medium">All Cameras · Defaults to all cameras if none selected</p>
                    : cameras.map(c => <span key={c} className="text-neutral-600">{c}</span>)
                  }
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── End Date ── */}
        <div>
          {isLPR ? (
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input type="checkbox" checked={hasEndDate} onChange={e => setHasEndDate(e.target.checked)}
                className="w-3.5 h-3.5 accent-[#00775B] rounded" />
              <span className={cn(labelCls, "mb-0")}>End Date <span className="text-neutral-300 normal-case font-normal">(Optional)</span></span>
            </label>
          ) : (
            <label className={labelCls}>End Date <span className="text-neutral-300 normal-case font-normal">(Optional)</span></label>
          )}
          {(!isLPR || hasEndDate) && (
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)}
              className="w-full h-8 px-3 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 focus:outline-none focus:border-[#00775B]" />
          )}
          {(!isLPR || hasEndDate) && (
            <p className="text-[9px] text-neutral-400 mt-0.5">Set an automatic expiry date for temporary watch entries.</p>
          )}
        </div>

        {/* ── Notes ── */}
        <div>
          <label className={labelCls}>Notes / Context</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2}
            placeholder={isLPR
              ? "Enter any additional notes or context for this watchlist entry"
              : "Enter security instructions (e.g. Contact supervisor immediately. Do not engage)"}
            className="w-full px-3 py-2 rounded-[6px] border border-neutral-200 text-[12px] text-neutral-800 focus:outline-none focus:border-[#00775B] placeholder:text-neutral-300 resize-none"
          />
          <p className="text-[9px] text-neutral-400 mt-0.5">
            {isLPR ? "Internal administrative notes regarding this watch entry." : "Security instructions and administrative notes regarding this watch entry."}
          </p>
        </div>

        {/* ── Notifications ── */}
        <div>
          <label className={labelCls}><Mail className="w-3 h-3 inline mr-1" />Notification Recipients</label>
          <div className="space-y-1">
            <label className="block text-[9px] font-semibold uppercase tracking-wide text-neutral-400 mb-0.5">Email Recipients</label>
            <input value={email} onChange={e => setEmail(e.target.value)}
              placeholder="e.g. admin@matrice.ai, security@matrice.ai"
              className={inputCls} />
            <p className="text-[9px] text-neutral-400">Separate multiple email addresses with commas</p>
          </div>
        </div>

        <div>
          <label className={labelCls}><Users className="w-3 h-3 inline mr-1" />Notification Groups</label>
          <div className="space-y-1">
            {WL_GROUPS.map(g => (
              <label key={g} className="flex items-center gap-2 cursor-pointer py-0.5">
                <input type="checkbox" checked={groups.includes(g)} onChange={() => toggleGroup(g)}
                  className="w-3 h-3 accent-[#00775B] rounded" />
                <span className="text-[11px] text-neutral-700">{g}</span>
              </label>
            ))}
          </div>
          <p className="text-[9px] text-neutral-400 mt-1.5">
            Selected groups will receive immediate notifications (Email/SMS/Platform) upon {isLPR ? "LPR match." : "facial recognition match."}
          </p>
        </div>

      </div>

      {/* Footer */}
      <div className="border-t border-neutral-100 px-5 py-3.5 flex items-center justify-end gap-2.5 shrink-0">
        <button onClick={onCancel}
          className="h-9 px-5 rounded-[6px] border border-neutral-200 text-[12px] font-bold text-neutral-600 hover:border-neutral-300 transition-colors"
        >Cancel</button>
        <button onClick={() => {
            const entry: WatchlistEntry = {
              id: initialEntry?.id ?? `wl-${Date.now()}`,
              type: isLPR ? "LPR" : "FR",
              name: isLPR ? (plates.split(/[,\n]/)[0]?.trim() || "—") : (frName.trim() || "Unknown"),
              plates: isLPR ? plates : undefined,
              reason: reason === "Custom Reason" ? customReason : reason,
              severity,
              cameras,
              endDate: hasEndDate ? endDate : undefined,
              notes,
              addedAt: initialEntry?.addedAt ?? new Date().toISOString(),
            };
            onSubmit(entry);
          }}
          className="h-9 px-6 rounded-[6px] bg-[#00775B] text-[12px] font-bold text-white hover:bg-[#006349] transition-colors inline-flex items-center gap-1.5"
        >
          {initialEntry ? "Save Changes" : isLPR ? "Process Plates" : "Add to Watchlist"}
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </>
  );
}

// ─── Standalone Manage Modal (triggered from page header) ─────────────────────
export function ManageModal({ isOpen, isLPR, onClose, onWatchlistAdd, watchlistEntries = [], onUpdateEntries }: {
  isOpen: boolean; isLPR: boolean; onClose: () => void;
  onWatchlistAdd?: (entry: WatchlistEntry) => void;
  watchlistEntries?: WatchlistEntry[];
  onUpdateEntries?: (entries: WatchlistEntry[]) => void;
}) {
  const [activeTab, setActiveTab] = useState<"add" | "all">("add");
  const [editingEntry, setEditingEntry] = useState<WatchlistEntry | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!isOpen) { setDone(false); setActiveTab("add"); setEditingEntry(null); }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && isOpen) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const entityLabel = isLPR ? "Vehicle" : "Person";
  const entityLabelPlural = isLPR ? "Vehicles" : "People";

  const handleSubmit = (entry: WatchlistEntry) => {
    onWatchlistAdd?.(entry);
    setDone(true);
    setTimeout(() => { setDone(false); setActiveTab("all"); }, 1500);
  };

  return createPortal(
    <>
      <div className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px]" onClick={onClose} />
      <div
        className="fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden w-[70vw] max-w-[900px] max-h-[90vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100 shrink-0">
          <h3 className="text-[14px] font-bold text-neutral-900">
            {isLPR ? "Manage Watchlist Vehicles" : "Manage Watchlist People"}
          </h3>
          <button onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-neutral-100 px-5 shrink-0">
          {([
            { key: "add", label: `Add ${entityLabel}` },
            { key: "all", label: `All ${entityLabelPlural}`, count: watchlistEntries.length },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setEditingEntry(null); }}
              className={cn(
                "flex items-center gap-1.5 py-2.5 px-1 mr-5 text-[11px] font-bold border-b-2 transition-colors -mb-px",
                activeTab === tab.key
                  ? "border-[#00775B] text-[#00775B]"
                  : "border-transparent text-neutral-400 hover:text-neutral-600"
              )}
            >
              {tab.label}
              {"count" in tab && tab.count > 0 && (
                <span className="inline-flex items-center justify-center h-4 min-w-[16px] px-1 rounded-full bg-[#00775B] text-white text-[9px] font-bold">
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">

          {/* ── Add tab ── */}
          {activeTab === "add" && (
            done ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 p-8">
                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                <p className="text-[14px] font-bold text-neutral-800">
                  {isLPR ? "Plates processed — watchlist updated" : "Person added — alerts active"}
                </p>
              </div>
            ) : (
              <WatchlistForm isLPR={isLPR} onCancel={onClose} onSubmit={handleSubmit} />
            )
          )}

          {/* ── All tab ── */}
          {activeTab === "all" && (
            editingEntry ? (
              <div className="flex flex-col h-full">
                <div className="flex items-center gap-2 px-5 py-3 border-b border-neutral-100 shrink-0">
                  <button
                    onClick={() => setEditingEntry(null)}
                    className="flex items-center gap-1.5 text-[11px] font-bold text-[#00775B] hover:text-[#006349] transition-colors"
                  >
                    ← Back to list
                  </button>
                  <span className="text-neutral-300 text-xs">·</span>
                  <span className="text-[11px] text-neutral-500">
                    Editing: <span className="font-bold text-neutral-700">{editingEntry.name}</span>
                  </span>
                </div>
                <div className="flex-1 overflow-y-auto">
                  <WatchlistForm
                    isLPR={editingEntry.type === "LPR"}
                    initialEntry={editingEntry}
                    onCancel={() => setEditingEntry(null)}
                    onSubmit={(updated) => {
                      onUpdateEntries?.(watchlistEntries.map(e => e.id === updated.id ? updated : e));
                      setEditingEntry(null);
                    }}
                  />
                </div>
              </div>
            ) : watchlistEntries.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 py-20 text-center px-8">
                <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center">
                  <Plus className="w-5 h-5 text-neutral-400" />
                </div>
                <p className="text-[12px] font-bold text-neutral-600">No entries yet</p>
                <p className="text-[11px] text-neutral-400">
                  Use the <span className="font-semibold">Add {entityLabel}</span> tab to add people to the watchlist.
                </p>
                <button
                  onClick={() => setActiveTab("add")}
                  className="mt-1 h-8 px-4 rounded-[6px] bg-[#00775B] text-white text-[11px] font-bold hover:bg-[#006349] transition-colors"
                >
                  Add {entityLabel}
                </button>
              </div>
            ) : (() => {
              const SEV_CFG: Record<string, { badge: string }> = {
                Critical:      { badge: "bg-red-600 text-white" },
                High:          { badge: "bg-orange-500 text-white" },
                Informational: { badge: "bg-neutral-400 text-white" },
              };
              const cols: DataGridColumn<WatchlistEntry>[] = [
                {
                  key: "capture",
                  header: "Capture",
                  width: "72px",
                  render: (entry) => entry.type === "LPR" ? (
                    <IdentityEvidenceMedia
                      kind="PLATE"
                      seed={entry.name}
                      imageSrc="/vehicle/images.jpeg"
                      plateText={entry.name.slice(0, 10)}
                      className="h-10 w-[68px]"
                    />
                  ) : (
                    <IdentityEvidenceMedia
                      kind="FACE"
                      seed={entry.name}
                      imageSrc={entry.photo_url}
                      className="h-10 w-10"
                    />
                  ),
                },
                {
                  key: "type",
                  header: "Type",
                  width: "56px",
                  align: "center",
                  render: (entry) => (
                    <span className={cn(
                      "inline-flex items-center justify-center h-5 px-1.5 rounded-[3px] text-[9px] font-black uppercase tracking-wide",
                      entry.type === "FR" ? "bg-[#001E18] text-[#00D68F]" : "bg-blue-900 text-blue-200"
                    )}>
                      {entry.type}
                    </span>
                  ),
                },
                {
                  key: "name",
                  header: "Name / Plate",
                  width: "1fr",
                  render: (entry, hovered) => (
                    <div>
                      <InterCell hovered={hovered} isPrimary>{entry.name}</InterCell>
                      {entry.plates && entry.plates.includes(",") && (
                        <div className="text-[9px] text-neutral-400 mt-0.5">+multiple plates</div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "reason",
                  header: "Reason",
                  width: "1fr",
                  render: (entry, hovered) => (
                    <InterCell hovered={hovered} color="#6B7280" hoveredColor="#374151">
                      {entry.reason || "—"}
                    </InterCell>
                  ),
                },
                {
                  key: "severity",
                  header: "Severity",
                  width: "100px",
                  render: (entry) => {
                    const cfg = SEV_CFG[entry.severity] ?? SEV_CFG.Informational;
                    return (
                      <div>
                        <span className={cn("text-[9px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide", cfg.badge)}>
                          {entry.severity}
                        </span>
                        {entry.severity === "Critical" && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                            <span className="text-[8px] text-red-600 font-bold">ACTIVE</span>
                          </div>
                        )}
                      </div>
                    );
                  },
                },
                {
                  key: "cameras",
                  header: "Cameras",
                  width: "1fr",
                  render: (entry, hovered) => (
                    <div>
                      <InterCell hovered={hovered} isPrimary>{entry.cameras[0]}</InterCell>
                      {entry.cameras.length > 1 && (
                        <div className="text-[10px] text-neutral-400">+{entry.cameras.length - 1} more</div>
                      )}
                    </div>
                  ),
                },
                {
                  key: "added",
                  header: "Added",
                  width: "80px",
                  align: "right",
                  render: (entry, hovered) => (
                    <MonoCell hovered={hovered}>
                      {new Date(entry.addedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </MonoCell>
                  ),
                },
                {
                  key: "actions",
                  header: "",
                  width: "64px",
                  align: "right",
                  render: (entry, hovered) => (
                    <GridActions visible={hovered}>
                      <GridActionButton title="Edit" onClick={(e) => { e.stopPropagation(); setEditingEntry(entry); }}>
                        <Eye className="w-3 h-3" />
                      </GridActionButton>
                      <GridActionButton
                        title="Remove"
                        hoverColor="#EF4444"
                        onClick={(e) => { e.stopPropagation(); onUpdateEntries?.(watchlistEntries.filter(x => x.id !== entry.id)); }}
                      >
                        <Trash2 className="w-3 h-3" />
                      </GridActionButton>
                    </GridActions>
                  ),
                },
              ];
              return (
                <DataGrid<WatchlistEntry>
                  columns={cols}
                  data={watchlistEntries}
                  getRowId={(r) => r.id}
                  onRowClick={(entry) => setEditingEntry(entry)}
                />
              );
            })()
          )}
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Action Modal — centered popup over the entity panel ──────────────────────
function ActionDrawer({
  mode, isThreat, isLPR, person, onClose,
}: {
  mode: DrawerMode | null; isThreat: boolean; isLPR: boolean;
  person: FeedPerson; onClose: () => void;
}) {
  const [miniConfirm, setMiniConfirm] = useState(false);
  const [done, setDone] = useState(false);
  const [doneMsg, setDoneMsg] = useState("");

  // Reset state when mode changes
  useEffect(() => { setDone(false); setDoneMsg(""); setMiniConfirm(false); }, [mode]);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape" && mode) onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [mode, onClose]);

  const action   = mode?.kind === "action" ? mode.action : null;
  const isWL     = mode?.kind === "watchlist";
  const isDanger = isThreat || action?.variant === "danger";

  const handleExecute = () => {
    if (action) { setDoneMsg(action.successMsg); setDone(true); setMiniConfirm(false); setTimeout(onClose, 2200); }
  };
  const handleWLSubmit = (_entry: WatchlistEntry) => {
    setDoneMsg(isLPR ? "Vehicle added to watchlist — alerts enabled" : "Person added to watchlist — alerts enabled");
    setDone(true);
    setTimeout(onClose, 2200);
  };

  const modalTitle = isWL
    ? (isLPR ? "Add / Manage Vehicle" : "Add / Manage Flagged Person")
    : (action?.label ?? "");

  if (!mode) return null;

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] bg-black/50 backdrop-blur-[2px]"
        onClick={onClose}
      />

      {/* Centered modal */}
      <div
        className={cn(
          "fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2",
          "bg-white rounded-xl shadow-2xl flex flex-col overflow-hidden",
          "max-w-[95vw] max-h-[90vh]",
          isWL ? "w-[560px]" : "w-[460px]"
        )}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-neutral-100 shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
              isWL ? "bg-[#00775B]/10" : isDanger ? "bg-red-100" : "bg-[#00775B]/10"
            )}>
              {isWL
                ? <Plus className="w-3.5 h-3.5 text-[#00775B]" />
                : action?.icon
                ? <action.icon className={cn("w-3.5 h-3.5", isDanger ? "text-red-600" : "text-[#00775B]")} />
                : null}
            </div>
            <div className="min-w-0">
              <h3 className="text-[13px] font-bold text-neutral-900 leading-tight">{modalTitle}</h3>
              <p className="text-[11px] text-neutral-400 mt-0.5 truncate">{person.displayName} · {person.zone}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-neutral-100 text-neutral-400 hover:text-neutral-600 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal body — scrollable */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {done ? (
            <div className="flex flex-col items-center justify-center gap-4 p-12 text-center min-h-[200px]">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-7 h-7 text-emerald-600" />
              </div>
              <p className="text-[14px] font-bold text-neutral-800">{doneMsg}</p>
              <p className="text-[11px] text-neutral-400">Closing automatically…</p>
            </div>

          ) : isWL ? (
            <WatchlistForm isLPR={isLPR} person={person} onCancel={onClose} onSubmit={handleWLSubmit} />

          ) : (
            <div className="px-6 py-6 space-y-4">
              {/* Confirm message */}
              <p className="text-[14px] text-neutral-700 leading-relaxed">{action?.confirmMsg}</p>

              {/* Subject summary */}
              <div className="flex items-center gap-3 px-3.5 py-3 bg-neutral-50 border border-neutral-200 rounded-[8px]">
                <div className="w-8 h-8 rounded-full bg-neutral-200 overflow-hidden shrink-0">
                  <img
                    src={person.imageSrc ?? `https://i.pravatar.cc/64?u=${person.id}`}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
                <div className="min-w-0">
                  <p className="text-[12px] font-bold text-neutral-800 truncate">{person.displayName}</p>
                  <p className="text-[10px] text-neutral-400 font-mono truncate">{person.zone} · {person.camera}</p>
                </div>
              </div>

              {/* Danger warning */}
              {isDanger && (
                <div className="flex items-start gap-2.5 px-3.5 py-3 bg-red-50 border border-red-200 rounded-[8px]">
                  <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-red-700 font-medium leading-relaxed">
                    Critical security action — this will be logged and is irreversible once executed.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal footer — action buttons (non-watchlist, non-done) */}
        {!done && !isWL && action && (
          <div className="border-t border-neutral-100 px-5 py-3.5 flex items-center justify-end gap-2.5 shrink-0 bg-white">
            <button
              onClick={onClose}
              className="h-9 px-5 rounded-[6px] border border-neutral-200 text-[12px] font-bold text-neutral-600 hover:border-neutral-300 transition-colors"
            >Cancel</button>
            <button
              onClick={() => isDanger ? setMiniConfirm(true) : handleExecute()}
              className={cn(
                "h-9 px-6 rounded-[6px] text-[12px] font-bold text-white transition-colors inline-flex items-center gap-1.5",
                isDanger ? "bg-red-600 hover:bg-red-700" : "bg-[#00775B] hover:bg-[#006349]"
              )}
            >
              Confirm
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>

      {/* ── Mini-confirm modal (sits above the action modal) ── */}
      {miniConfirm && action && (
        <>
          <div className="fixed inset-0 z-[1100] bg-black/40" onClick={() => setMiniConfirm(false)} />
          <div
            className="fixed z-[1101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] bg-white rounded-[12px] shadow-2xl p-5"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-start gap-3 mb-4">
              <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-4 h-4 text-red-600" />
              </div>
              <div>
                <p className="text-[13px] font-black text-neutral-900">Are you sure?</p>
                <p className="text-[11px] text-neutral-500 mt-1 leading-relaxed">{action.confirmMsg}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setMiniConfirm(false)}
                className="flex-1 h-9 rounded-[6px] border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:border-neutral-300 transition-colors"
              >Cancel</button>
              <button
                onClick={handleExecute}
                className="flex-1 h-9 rounded-[6px] bg-red-600 text-[11px] font-bold text-white hover:bg-red-700 transition-colors"
              >Yes, proceed</button>
            </div>
          </div>
        </>
      )}
    </>,
    document.body
  );
}

// ─── Notify section ───────────────────────────────────────────────────────────
function ActionsSection({ groups }: { groups: string[] }) {
  const allRecipients = ["Admin", ...groups];
  const [selected, setSelected]     = useState<string[]>([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [notified, setNotified]     = useState(false);
  const [lastSentTo, setLastSentTo] = useState<string[]>([]);

  const toggle = (r: string) =>
    setSelected(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);

  const handleConfirm = () => {
    setLastSentTo([...selected]);
    setShowConfirm(false);
    setNotified(true);
    setSelected([]);
    setTimeout(() => setNotified(false), 3500);
  };

  return (
    <div className="border-t border-neutral-100 bg-neutral-50/40">
      <div className="px-5 py-4">
        <p className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mb-2.5">Notify</p>

        {/* Always-visible recipient list */}
        <div className="rounded-[6px] border border-neutral-200 bg-white overflow-hidden">
          <div className="divide-y divide-neutral-50">
            {allRecipients.map(r => (
              <label key={r} className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-neutral-50 transition-colors">
                <input
                  type="checkbox"
                  checked={selected.includes(r)}
                  onChange={() => toggle(r)}
                  className="w-3.5 h-3.5 accent-[#00775B] cursor-pointer"
                />
                <span className="text-[12px] text-neutral-700 font-medium flex-1">{r}</span>
                {r === "Admin" && (
                  <span className="text-[9px] font-bold uppercase tracking-wide text-neutral-400 bg-neutral-100 rounded px-1.5 py-0.5">Admin</span>
                )}
              </label>
            ))}
          </div>

          <div className="px-3 py-2.5 border-t border-neutral-100 bg-neutral-50/60">
            <button
              onClick={() => selected.length && setShowConfirm(true)}
              disabled={!selected.length}
              className={cn(
                "w-full h-8 rounded-[6px] text-[11px] font-bold flex items-center justify-center gap-1.5 transition-all",
                selected.length
                  ? "bg-[#00775B] text-white hover:bg-[#006349]"
                  : "bg-neutral-100 text-neutral-400 cursor-not-allowed"
              )}
            >
              <Mail className="w-3 h-3" />
              {selected.length
                ? `Send to ${selected.length} recipient${selected.length > 1 ? "s" : ""}`
                : "Select recipients"}
            </button>
          </div>
        </div>

        {/* Success banner */}
        {notified && (
          <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-[6px] bg-emerald-50 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <p className="text-[11px] font-semibold text-emerald-700">
              Notification sent to {lastSentTo.join(", ")}
            </p>
          </div>
        )}
      </div>

      {/* Confirmation popup portal */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-[1px]" onClick={() => setShowConfirm(false)} />
          <div className="relative bg-white rounded-xl shadow-2xl border border-neutral-200 w-80 p-5">
            <h3 className="text-sm font-bold text-neutral-900 mb-1">Confirm Notification</h3>
            <p className="text-[12px] text-neutral-500 mb-1">
              Send alert notification to:
            </p>
            <p className="text-[12px] font-semibold text-neutral-800 mb-4">
              {selected.join(", ")}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 h-8 rounded-[6px] border border-neutral-200 text-[11px] font-bold text-neutral-600 hover:bg-neutral-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirm}
                className="flex-1 h-8 rounded-[6px] bg-[#00775B] text-white text-[11px] font-bold hover:bg-[#006349] transition-colors"
              >
                Send Notification
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </div>
  );
}

// ─── Alert stamp helper ────────────────────────────────────────────────────────
// Returns a "wanted poster" style stamp for high-priority threats.
// Shown on the snapshot thumbnail (small strip) and in the modal image frame.
interface AlertStamp { headline: string; reason: string; color: string; }

function getAlertStamp(person: FeedPerson): AlertStamp | null {
  if (person.status === "BLACKLIST") {
    return {
      headline: "BLACKLIST HIT",
      reason:   person.subLabel ?? "Blacklisted Individual",
      color:    "#DC2626",  // red-600
    };
  }
  if (person.status === "BOLO") {
    return {
      headline: "BOLO ALERT",
      reason:   person.subLabel ?? "Flagged Vehicle",
      color:    "#D97706",  // amber-600
    };
  }
  return null;
}

// Feed table row
function FeedTableRow({
  person, rowIndex, onClick, isLPR,
}: {
  person: FeedPerson; rowIndex: number; onClick: () => void; isLPR: boolean;
}) {
  const cfg = STATUS_CFG[person.status];
  const isThreat = person.status === "BLACKLIST" || person.status === "BOLO" ||
    person.status === "UNKNOWN" || person.status === "UNREGISTERED";
  const isActive = isThreat && (person.severity === "CRITICAL" || person.severity === "HIGH");
  const isBlacklist = person.status === "BLACKLIST" || person.status === "BOLO";
  const isPlate = isLPR || person.identType === "PLATE";
  const id = `${isLPR ? "LP" : "FR"}-${String(rowIndex + 1).padStart(3, "0")}`;
  const stamp = getAlertStamp(person);

  return (
    <tr
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-colors",
        "border-b border-neutral-100 dark:border-[#1E293B] last:border-b-0",
        "hover:bg-[#E5FFF9] dark:hover:bg-[#1E293B]",
        isBlacklist && rowIndex === 0
          ? "bg-red-50/40 dark:bg-red-900/20"
          : "dark:bg-[#0F172A]",
      )}
    >
      {/* ID */}
      <td className="px-3 py-2">
        <span className="text-[10px] font-mono font-bold text-neutral-500 dark:text-slate-500">{id}</span>
      </td>

      {/* Snapshot */}
      <td className="px-3 py-2">
        <div className={cn(
          "h-10 w-[60px] rounded-[2px] overflow-hidden transition-colors relative shrink-0",
          "border border-neutral-200 dark:border-[#334155]",
          "bg-neutral-100 dark:bg-[#1E293B]",
          "group-hover:border-[#00775B]/40 dark:group-hover:border-[#00775B]/50",
        )}>
          {isPlate ? (
            <IdentityEvidenceMedia kind="PLATE" seed={person.id} plateText={person.plateText} imageSrc={person.imageSrc} className="h-full w-full" />
          ) : (
            <IdentityEvidenceMedia kind="FACE" seed={person.id} imageSrc={person.imageSrc} live={isActive} className="h-full w-full" />
          )}
          {/* Alert stamp strip — "wanted poster" label on the snapshot */}
          {stamp && (
            <div
              className="absolute bottom-0 left-0 right-0 flex items-center justify-center"
              style={{ background: stamp.color, paddingTop: 2, paddingBottom: 2 }}
            >
              <span className="text-[5.5px] font-black uppercase tracking-[0.12em] text-white leading-none">
                {stamp.headline}
              </span>
            </div>
          )}
        </div>
      </td>

      {/* Identity details */}
      <td className="px-3 py-2 max-w-[180px]">
        <p className="text-[11px] font-bold text-neutral-900 dark:text-slate-100 truncate leading-tight">{person.displayName}</p>
        {stamp ? (
          /* Crime reason as the primary action-context — more useful than a % */
          <p className="text-[9px] font-bold truncate mt-0.5 leading-snug" style={{ color: stamp.color }}>
            {stamp.reason}
          </p>
        ) : person.subLabel ? (
          <p className={cn("text-[9px] truncate mt-0.5 leading-snug",
            isThreat ? "text-red-500 font-semibold" : "text-neutral-400 dark:text-slate-500"
          )}>{person.subLabel}</p>
        ) : null}
      </td>

      {/* Status badge — colours are already vivid, no dark override needed */}
      <td className="px-3 py-2">
        <span className={cn(
          "text-[8px] font-black px-1.5 py-0.5 rounded-[2px] uppercase tracking-wide whitespace-nowrap",
          cfg.bg, cfg.text,
          isActive && "animate-pulse"
        )}>
          {cfg.label}
        </span>
      </td>

      {/* Zone */}
      <td className="px-3 py-2">
        <p className="text-[11px] font-semibold text-neutral-700 dark:text-slate-300 truncate">{person.zone}</p>
      </td>

      {/* Camera */}
      <td className="px-3 py-2">
        <p className="text-[11px] font-mono text-neutral-500 dark:text-slate-400">{person.camera}</p>
      </td>

      {/* Match % */}
      <td className="px-3 py-2 text-right">
        {person.confidence != null ? (
          <span className={cn(
            "text-[11px] font-mono font-bold tabular-nums",
            person.confidence >= 90 ? "text-emerald-500 dark:text-emerald-400" : "text-amber-500 dark:text-amber-400"
          )}>
            {person.confidence.toFixed(1)}%
          </span>
        ) : (
          <span className="text-[11px] text-neutral-300 dark:text-slate-600 font-mono">—</span>
        )}
      </td>

      {/* Dwell */}
      <td className="px-3 py-2 text-right">
        {person.dwell != null ? (
          <span className={cn(
            "text-[11px] font-mono font-bold tabular-nums",
            person.dwell > 180 ? "text-amber-500 dark:text-amber-400" : "text-neutral-500 dark:text-slate-400"
          )}>
            {fmtDwell(person.dwell)}
          </span>
        ) : (
          <span className="text-[11px] text-neutral-300 dark:text-slate-600 font-mono">—</span>
        )}
      </td>

      {/* Time */}
      <td className="px-3 py-2 text-right">
        <span className="text-[10px] font-mono text-neutral-500 dark:text-slate-400">{person.time}</span>
      </td>

    </tr>
  );
}

// ─── Entity Detail Modal ───────────────────────────────────────────────────────
function EntityModal({
  isOpen, person, journey, isLPR, terminology, groups, onClose,
}: {
  isOpen: boolean; person: FeedPerson | null; journey: JourneyStop[];
  isLPR: boolean; terminology: IdentityTerminology;
  groups: string[];
  onClose: () => void;
}) {
  const [drawerMode, setDrawerMode] = useState<DrawerMode | null>(null);

  // Reset drawer when panel closes
  useEffect(() => { if (!isOpen) setDrawerMode(null); }, [isOpen]);

  if (!person) return null;

  const cfg = STATUS_CFG[person.status];
  const isThreat = person.status === "BLACKLIST" || person.status === "BOLO";
  const isUnknown = person.status === "UNKNOWN" || person.status === "UNREGISTERED";
  const isVIP = person.status === "VIP";

  const frActions = isThreat ? [
    { key: "dispatch", label: "Dispatch Officer",             confirmMsg: `Send an officer to ${person.zone} to intercept and verify this individual.`,              successMsg: `Officer dispatched — en route to ${person.zone}`, icon: Radio,         variant: "danger"   as const },
    { key: "lockdown", label: "Lock Zone",                    confirmMsg: `Restrict all access to ${person.zone} and secure all entry points immediately.`,          successMsg: `${person.zone} secured — all entries restricted`, icon: Lock,          variant: "danger"   as const },
    { key: "control",  label: "Alert Control Room",           confirmMsg: "Broadcast a critical alert to all control room operators on duty.",                        successMsg: "Control room notified — standby for response",   icon: Zap,           variant: "primary"  as const },
    { key: "fp",       label: "Mark as False Match",          confirmMsg: "Dismiss this match as a false positive and remove the active alert.",                     successMsg: "Alert cleared — feed restored",                  icon: X,             variant: "default"  as const },
  ] : isUnknown ? [
    { key: "officer",   label: "Deploy Officer",              confirmMsg: `Send an officer to ${person.zone} to physically verify the identity of this individual.`, successMsg: "Officer dispatched — ETA 2 min",                 icon: UserPlus,      variant: "primary"  as const },
    { key: "track",     label: "Enable Movement Tracking",    confirmMsg: "Begin real-time movement tracking for this individual across all connected zones.",        successMsg: "Tracking enabled — monitoring all zones",         icon: Navigation2,   variant: "primary"  as const },
    { key: "watchlist", label: "Add to Watchlist",            confirmMsg: "Add this person to the watchlist. Future appearances will trigger immediate alerts.",     successMsg: "Added — alerts active for future appearances",    icon: BookmarkPlus,  variant: "default"  as const },
    { key: "dismiss",   label: "Clear Alert",                 confirmMsg: "Clear this alert. The individual will not be flagged again unless re-detected.",          successMsg: "Alert cleared",                                  icon: X,             variant: "default"  as const },
  ] : isVIP ? [
    { key: "escort",    label: "Activate Escort Protocol",   confirmMsg: `Assign a dedicated security escort for ${person.displayName} at ${person.zone}.`,          successMsg: "Escort team notified — meeting at zone entry",    icon: Shield,        variant: "primary"  as const },
    { key: "desk",      label: "Alert Front Desk",           confirmMsg: "Notify the front desk of this VIP arrival so they can prepare a reception.",               successMsg: "Front desk alerted — guest log updated",          icon: Zap,           variant: "default"  as const },
    { key: "route",     label: "Open VIP Access Route",      confirmMsg: "Unlock VIP-designated gates and elevators for immediate access.",                          successMsg: "VIP route unlocked — access granted",             icon: Navigation2,   variant: "default"  as const },
  ] : [
    { key: "log",     label: "Log as Cleared Entry",         confirmMsg: "Confirm and record this as a verified, cleared entry in the access register.",             successMsg: "Entry logged in access register",                 icon: CheckCircle2,  variant: "default"  as const },
    { key: "flag",    label: "Flag for Supervisor Review",   confirmMsg: "Flag this event and send a notification to the on-duty supervisor for review.",            successMsg: "Flagged — supervisor notified",                   icon: AlertTriangle, variant: "default"  as const },
  ];

  const lprActions = isThreat ? [
    { key: "seal",   label: "Seal Entry Point",              confirmMsg: `Close and lock the gate at ${person.zone}. All approaching vehicles will be stopped.`,     successMsg: `Gate sealed at ${person.zone} — security alerted`, icon: Ban,         variant: "danger"   as const },
    { key: "police", label: "Alert Authorities",              confirmMsg: "Transmit vehicle details to the relevant authorities. A reference number will be generated.",    successMsg: "Authorities alerted — reference number generated", icon: Radio,     variant: "danger"   as const },
    { key: "alert",  label: "Alert All Operators",           confirmMsg: "Broadcast this vehicle ID to all entry and exit operators across the site.",                successMsg: "All operators on alert — vehicle flagged",          icon: Zap,         variant: "primary"  as const },
    { key: "fp",     label: "Mark as False Match",           confirmMsg: "Dismiss as a false positive. The gate block will be lifted and the alert removed.",         successMsg: "Alert cleared — gate access restored",             icon: X,           variant: "default"  as const },
  ] : isUnknown ? [
    { key: "block",   label: "Deny Entry",                   confirmMsg: `Block this vehicle at ${person.zone}. The barrier will remain closed until manually released.`, successMsg: "Entry denied — barrier locked",               icon: Ban,         variant: "danger"   as const },
    { key: "visitor", label: "Register as Day Visitor",      confirmMsg: "Issue a temporary visitor permit for this vehicle, valid for today only.",                  successMsg: "Day pass issued — plate added to visitor list",     icon: UserPlus,   variant: "primary"  as const },
    { key: "bolo",    label: "Escalate to BOLO List",        confirmMsg: "Escalate this plate to the BOLO watchlist. All operators and gate cameras will be notified.", successMsg: "Plate added to BOLO — all gates on alert",        icon: AlertTriangle, variant: "default" as const },
  ] : isVIP ? [
    { key: "valet",    label: "Activate Valet Service",      confirmMsg: "Dispatch the valet team to receive this executive vehicle at the gate.",                    successMsg: "Valet dispatched — arrival confirmed",             icon: Star,        variant: "primary"  as const },
    { key: "desk",     label: "Alert Front Desk",            confirmMsg: "Notify the front desk of this executive vehicle's arrival.",                                successMsg: "Front desk alerted — guest record updated",        icon: Zap,         variant: "default"  as const },
  ] : [
    { key: "log",  label: "Log Authorised Entry",            confirmMsg: "Confirm and record this as an authorised vehicle entry in the access log.",                 successMsg: "Entry logged in vehicle access register",          icon: CheckCircle2, variant: "default" as const },
    { key: "flag", label: "Flag for Review",                 confirmMsg: "Flag this vehicle event and notify the on-duty supervisor for follow-up.",                  successMsg: "Flagged — supervisor notified",                    icon: AlertTriangle, variant: "default" as const },
  ];

  const actions = isLPR ? lprActions : frActions;
  const isPlate = isLPR || person.identType === "PLATE";

  // Status badge for SlidePanel headerRight
  const statusBadge = (
    <div className="flex items-center gap-2">
      <span className={cn(
        "text-[9px] font-black tracking-widest uppercase px-2 py-1 rounded-[3px] text-white",
        cfg.headerBg
      )}>
        {cfg.label}
      </span>
      {isThreat && (
        <span className="flex items-center gap-1 text-[9px] font-bold text-red-600 uppercase">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
          Active Threat
        </span>
      )}
      <span className="text-[10px] font-mono text-neutral-400">{person.time}</span>
    </div>
  );

  return (
    <>
      <SlidePanel
        isOpen={isOpen}
        onClose={onClose}
        title={person.displayName}
        subtitle={`${person.zone} · ${person.camera}`}
        width="w-[680px]"
        headerRight={statusBadge}
        footer={<ActionsSection groups={groups} />}
      >

        {/* ── Identity Hero ─────────────────────────────────────── */}
        <div className={cn(
          "flex gap-4 p-5 border-b border-neutral-100",
          isThreat ? "bg-red-50/40" : isUnknown ? "bg-amber-50/20" : isVIP ? "bg-yellow-50/20" : ""
        )}>
          {/* Image */}
          <div className="shrink-0">
            {isPlate ? (
              <IdentityEvidenceMedia
                kind="PLATE" seed={person.id}
                plateText={person.plateText}
                imageSrc={person.imageSrc}
                confidence={person.confidence}
                size="lg" live={isThreat}
                className="w-48 h-32"
              />
            ) : (
              <IdentityEvidenceMedia
                kind="FACE" seed={person.id}
                imageSrc={person.imageSrc}
                confidence={person.confidence}
                size="lg" live={isThreat}
                className="w-36 h-36"
              />
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-2 mb-1.5">
                <div>
                  <h2 className="text-xl font-black text-neutral-900 leading-tight">{person.displayName}</h2>
                  {person.subLabel && (
                    <p className={cn("text-[12px] mt-0.5", isThreat ? "text-red-600 font-medium" : "text-neutral-500")}>
                      {person.subLabel}
                    </p>
                  )}
                  {person.vehicleDesc && (
                    <p className="text-[11px] text-neutral-500 mt-0.5">{person.vehicleDesc}</p>
                  )}
                </div>
                <button
                  onClick={() => setDrawerMode({ kind: "watchlist" })}
                  className="shrink-0 inline-flex items-center gap-1.5 h-7 px-3 rounded-[5px] bg-[#E5FFF9] border border-[#00775B]/25 text-[10px] font-bold text-[#00775B] hover:bg-[#00775B]/10 transition-colors"
                >
                  <Plus className="w-3 h-3" />
                  {isLPR ? "Manage Vehicle" : "Manage Person"}
                </button>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-x-5 gap-y-2.5 mt-2">
              <div>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Zone</p>
                <p className="text-[12px] font-semibold text-neutral-800">{person.zone}</p>
              </div>
              <div>
                <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Camera</p>
                <p className="text-[12px] font-mono text-neutral-800">{person.camera}</p>
              </div>
              {person.confidence != null && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">{terminology.matchScoreLabel}</p>
                  <p className={cn("text-[12px] font-mono font-bold", person.confidence >= 90 ? "text-emerald-600" : "text-amber-600")}>
                    {person.confidence}%
                  </p>
                </div>
              )}
              {person.dwell != null && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Dwell</p>
                  <p className={cn("text-[12px] font-mono font-bold", person.dwell > 180 ? "text-amber-600" : "text-neutral-700")}>
                    {fmtDwell(person.dwell)}
                  </p>
                </div>
              )}
              {person.department && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Dept.</p>
                  <p className="text-[12px] font-semibold text-neutral-800">{person.department}</p>
                </div>
              )}
              {person.employeeId && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">ID</p>
                  <p className="text-[12px] font-mono text-neutral-700">{person.employeeId}</p>
                </div>
              )}
              {person.totalAppearances != null && (
                <div>
                  <p className="text-[9px] uppercase tracking-widest text-neutral-400 font-bold mb-0.5">Visits</p>
                  <p className="text-[12px] font-mono text-neutral-700">{person.totalAppearances}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Movement Path / Gate History ─────────────────────── */}
        <div className="px-5 py-4 border-b border-neutral-100">
          <div className="flex items-center gap-2 mb-4">
            <Navigation2 className="w-3.5 h-3.5 text-[#00775B]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
              {isLPR ? "Gate History" : "Movement Path Tracking"}
            </span>
            <span className="ml-auto text-[9px] text-neutral-400 font-mono">
              {journey.length} checkpoint{journey.length !== 1 ? "s" : ""}
            </span>
          </div>

          {/* Timeline with vertical connector */}
          <div className="relative pl-1">
            {journey.length > 1 && (
              <div className="absolute left-[7px] top-5 bottom-5 w-[2px] bg-neutral-200 rounded-full" />
            )}
            <div className="space-y-2">
              {journey.map((stop, i) => (
                <div key={i} className={cn(
                  "flex items-center gap-3 pr-3 py-2.5 rounded-[6px] text-[11px] relative pl-3",
                  stop.isCurrent
                    ? isThreat ? "bg-red-50 border border-red-200" : "bg-[#E5FFF9] border border-[#00775B]/20"
                    : "bg-neutral-50 border border-transparent"
                )}>
                  {/* Status dot */}
                  <span className={cn(
                    "w-3 h-3 rounded-full shrink-0 z-10",
                    stop.isCurrent
                      ? isThreat
                        ? "bg-red-500 animate-pulse ring-2 ring-red-200"
                        : "bg-[#00775B] animate-pulse ring-2 ring-emerald-200"
                      : i === 0 ? "bg-neutral-400" : "bg-[#00775B]"
                  )} />

                  {/* Camera thumbnail */}
                  <div className="shrink-0 w-14 h-10 rounded-[4px] overflow-hidden border border-neutral-200 bg-neutral-900 relative">
                    {isLPR ? (
                      <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a2535_0%,#111827_100%)] flex items-center justify-center">
                        <Camera className="w-4 h-4 text-neutral-600" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/60 text-center">
                          <span className="text-[7px] font-mono text-amber-300 font-bold tracking-wide leading-none block py-[2px]">
                            {person.plateText ?? "──"}
                          </span>
                        </div>
                      </div>
                    ) : (
                      <>
                        <img
                          src={person.imageSrc ?? `https://i.pravatar.cc/112?u=${person.id}-stop${i}-cam`}
                          alt=""
                          className="w-full h-full object-cover opacity-80"
                          style={{ filter: "contrast(1.1) saturate(0.7) brightness(0.85)" }}
                          onError={e => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/40" />
                      </>
                    )}
                    <div className="absolute top-0 left-0 right-0 bg-black/70 px-1 py-[1px]">
                      <span className="text-[6px] font-mono text-[#00FF84] tracking-wider">{stop.camera}</span>
                    </div>
                    {stop.isCurrent && (
                      <div className="absolute bottom-0.5 right-0.5 flex items-center gap-0.5 bg-black/70 rounded-[2px] px-1 py-[1px]">
                        <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />
                        <span className="text-[6px] font-bold text-white">LIVE</span>
                      </div>
                    )}
                  </div>

                  <span className="font-mono text-neutral-400 shrink-0 w-10">{stop.time}</span>
                  <span className="font-semibold text-neutral-800 flex-1">{stop.zone}</span>
                  <span className={cn("text-[10px] font-mono shrink-0",
                    stop.isCurrent && isThreat ? "text-red-500 font-bold" : "text-neutral-400"
                  )}>{stop.dwellText}</span>

                  {stop.alertNote && (
                    <span className={cn(
                      "text-[9px] font-bold px-1.5 py-0.5 rounded-[3px] shrink-0",
                      stop.isCurrent && isThreat
                        ? "bg-red-600 text-white"
                        : stop.alertNote.toLowerCase().includes("resolved") || stop.alertNote.toLowerCase().includes("authoris")
                        ? "bg-emerald-100 text-emerald-700"
                        : "bg-amber-100 text-amber-700"
                    )}>{stop.alertNote}</span>
                  )}
                  {stop.linkedPlate && (
                    <span className="text-[9px] font-mono text-[#00775B] font-bold shrink-0 bg-[#E5FFF9] px-1.5 py-0.5 rounded-[3px]">
                      Linked: {stop.linkedPlate}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

      </SlidePanel>

      {/* Action drawer — second SlidePanel layer */}
      <ActionDrawer
        mode={drawerMode}
        isThreat={isThreat}
        isLPR={isLPR}
        person={person}
        onClose={() => setDrawerMode(null)}
      />
    </>
  );
}

// ─── Hi-Tech Entity Modal ──────────────────────────────────────────────────────
// Cyberpunk / HUD-style 2-column popup — alternate view to EntityModal (SlidePanel).
// Both implementations are kept; HiTechEntityModal is used by default.

// Face landmark mesh nodes: [x%, y%] in a 0–100 × 0–100 viewBox coordinate space.
// Approximate facial regions for a decorative overlay.
const HT_FACE_NODES: [number, number][] = [
  [50, 11],  // 0  forehead top
  [28, 22],  // 1  temple-L
  [72, 22],  // 2  temple-R
  [21, 38],  // 3  outer-L
  [79, 38],  // 4  outer-R
  [32, 44],  // 5  eye-L outer
  [38, 40],  // 6  eye-L top
  [44, 44],  // 7  eye-L inner
  [38, 48],  // 8  eye-L bottom
  [56, 44],  // 9  eye-R inner
  [62, 40],  // 10 eye-R top
  [68, 44],  // 11 eye-R outer
  [62, 48],  // 12 eye-R bottom
  [50, 43],  // 13 nose bridge
  [50, 62],  // 14 nose tip
  [44, 62],  // 15 nose-L
  [56, 62],  // 16 nose-R
  [38, 74],  // 17 mouth-L
  [44, 70],  // 18 mouth top-L
  [50, 68],  // 19 mouth top-C
  [56, 70],  // 20 mouth top-R
  [62, 74],  // 21 mouth-R
  [50, 78],  // 22 mouth bottom-C
  [25, 58],  // 23 cheek-L
  [75, 58],  // 24 cheek-R
  [28, 80],  // 25 jaw-L
  [72, 80],  // 26 jaw-R
  [50, 92],  // 27 chin
];

const HT_FACE_EDGES: [number, number][] = [
  [0, 1], [0, 2], [1, 3], [2, 4],
  [5, 6], [6, 7], [7, 8], [8, 5],
  [9, 10], [10, 11], [11, 12], [12, 9],
  [13, 14], [14, 15], [14, 16],
  [7, 13], [9, 13],
  [17, 18], [18, 19], [19, 20], [20, 21], [17, 22], [21, 22],
  [3, 23], [4, 24], [23, 17], [24, 21],
  [23, 25], [24, 26], [25, 27], [27, 26],
  [1, 5], [2, 11],
];

function deriveDetectionEvents(person: FeedPerson): {
  time: string; event: string; detail: string; kind: "critical" | "warn" | "ok" | "info";
}[] {
  const t = person.time;
  const result: { time: string; event: string; detail: string; kind: "critical" | "warn" | "ok" | "info" }[] = [];
  result.push({ time: t, event: "Entity Detected", detail: `Camera: ${person.camera}`, kind: "info" });
  if (person.confidence != null) {
    result.push({
      time: t, event: "Identity Matched",
      detail: `Confidence: ${person.confidence.toFixed(1)}%`,
      kind: person.confidence >= 90 ? "ok" : "warn",
    });
  }
  const isThreat  = person.status === "BLACKLIST" || person.status === "BOLO";
  const isUnknown = person.status === "UNKNOWN"   || person.status === "UNREGISTERED";
  if (isThreat) {
    result.push({ time: t, event: "THREAT CONFIRMED", detail: `Status: ${person.status} — immediate action required`, kind: "critical" });
    result.push({ time: t, event: "Security Alert Triggered", detail: "All operators notified", kind: "warn" });
  } else if (isUnknown) {
    result.push({ time: t, event: "Identity Unknown", detail: "No match found in database", kind: "warn" });
    if (person.dwell != null && person.dwell > 180)
      result.push({ time: t, event: "Dwell Alert", detail: `Dwell: ${fmtDwell(person.dwell)} — above threshold`, kind: "warn" });
  } else if (person.status === "VIP") {
    result.push({ time: t, event: "VIP Recognised", detail: "Priority escort protocol advised", kind: "ok" });
  } else {
    result.push({ time: t, event: "Access Authorised", detail: "Cleared entry — logged to register", kind: "ok" });
  }
  return result;
}

function deriveAppearancePattern(person: FeedPerson): number[] {
  const hour = parseInt(person.time?.split(":")[0] ?? "14", 10);
  const days = person.recurringDays ?? 1;
  return Array.from({ length: 12 }, (_, i) => {
    const t = i * 2;
    const dist = Math.min(Math.abs(t - hour), Math.abs(t + 24 - hour), Math.abs(t - 24 - hour));
    const seed = (person.id.charCodeAt(i % person.id.length) * 7 + i * 13) % 31;
    return Math.round(Math.max(0, (9 - dist * 1.3) * days * 0.3 + (seed / 31) * 1.5));
  });
}

function HiTechEntityModal({
  isOpen, person, journey, isLPR, terminology, groups, onClose,
}: {
  isOpen: boolean; person: FeedPerson | null; journey: JourneyStop[];
  isLPR: boolean; terminology: IdentityTerminology;
  groups: string[]; onClose: () => void;
}) {
  const isDark = useIsDark();
  const [notifySelected, setNotifySelected] = useState<string[]>([]);
  const [notified, setNotified]             = useState(false);
  const [notifyOpen, setNotifyOpen]         = useState(false);
  const notifyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) { setNotifySelected([]); setNotified(false); setNotifyOpen(false); }
  }, [isOpen]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", h);
    return () => document.removeEventListener("keydown", h);
  }, [onClose]);

  // Close notify dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifyRef.current && !notifyRef.current.contains(e.target as Node)) {
        setNotifyOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  if (!isOpen || !person) return null;

  const cfg        = STATUS_CFG[person.status];
  const isThreat   = person.status === "BLACKLIST" || person.status === "BOLO";
  const isUnknown  = person.status === "UNKNOWN"   || person.status === "UNREGISTERED";
  const modalStamp = getAlertStamp(person);

  // Dynamic accent driven by threat level (same in both modes)
  const rawRgb = isThreat ? "239,68,68" : isUnknown ? "245,158,11" : person.status === "VIP" ? "234,179,8" : "0,212,170";
  const accent = isThreat ? "#ef4444"  : isUnknown  ? "#f59e0b"    : person.status === "VIP" ? "#eab308"   : "#00D4AA";
  const a = (op: number) => `rgba(${rawRgb},${op})`;

  // ── Theme token object ──────────────────────────────────────────────────────
  // All surface / text / border colors resolve to either dark-mode darks or
  // light-mode neutrals. Accent colours (red/amber/gold/teal) stay unchanged.
  const T = isDark
    ? {
        // ── Slate-blue dark palette — matches the rest of the app ──────────
        backdrop:     "rgba(2,6,23,0.75)",
        shell:        "#0F172A",           // slate-900 — app surface colour
        shellBorder:  "#334155",           // slate-700
        shellShadow:  "0 24px 80px rgba(0,0,0,0.55), 0 4px 32px rgba(0,0,0,0.35)",
        gridLine:     "rgba(255,255,255,0.022)",
        headerBg:     "#1E293B",           // slate-800 — card header
        headerBorder: "#334155",           // slate-700
        labelColor:   "#0F172A",           // text on coloured badge chip (dark for contrast)
        textPrimary:  "#F1F5F9",           // slate-100
        textSub:      "#E2E8F0",           // slate-200
        textMono:     "#64748B",           // slate-500
        textMuted:    "#475569",           // slate-600
        closeBtn:     "#64748B",           // slate-500
        colDivider:   "#1E293B",           // slate-800
        frameBg:      "#020617",           // near-black for camera frame depth
        frameInset:   "inset 0 0 20px rgba(0,0,0,0.5)",
        vignetteTop:  "linear-gradient(to bottom, rgba(0,0,0,0.25) 0%, transparent 35%, transparent 58%, rgba(0,0,0,0.6) 100%)",
        camOverlay:   "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
        confOverlay:  "linear-gradient(to top, rgba(0,0,0,0.85), transparent)",
        thumbBg:      "#0F172A",           // slate-900
        thumbOverlay: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.72))",
        thumbHeader:  "rgba(0,0,0,0.75)",
        thumbTime:    "rgba(255,255,255,0.5)",
        emptyThumb:   "#1E293B",           // slate-800
        sectionBorder:"1px solid #1E293B", // slate-800
        secHeadColor: "#64748B",           // slate-500
        divider:      "#1E293B",           // slate-800
        checkpointCnt:"1px solid #475569", // slate-600
        journeyLine:  "#334155",           // slate-700
        stopBgActive: a(0.08),
        stopBgIdle:   "transparent",
        stopInset:    `inset 0 0 0 1px ${a(0.18)}`,
        stopInnerDot: "#0F172A",           // slate-900
        stopZoneText: "#E2E8F0",           // slate-200
        evRowBg:      "#1E293B",           // slate-800
        evRowBorder:  "1px solid #334155", // slate-700
        evTitleColor: "#E2E8F0",           // slate-200
        evInfoColor:  "#64748B",           // slate-500
        barZero:      "#1E293B",
        barNormal:    a(0.35),
        dayInactive:  "#1E293B",
        dayLabel:     "#475569",
        hrLabel:      "#475569",
        dropBg:       "#1E293B",           // slate-800
        dropBorder:   "1px solid #334155", // slate-700
        dropRowBorder:"1px solid #0F172A", // slate-900
        dropItemColor:"#CBD5E1",           // slate-300
        inputBg:      "#1E293B",           // slate-800
        inputBorder:  "1px solid #334155", // slate-700
        inputPlaceholder: "#475569",       // slate-600
        inputSelected:"#E2E8F0",           // slate-200
        btnDisabledBg:"#1E293B",           // slate-800
        btnDisabledTx:"#475569",           // slate-600
        btnDisabledBd:"1px solid #334155", // slate-700
        successBg:    a(0.08),
        successBorder:`1px solid ${a(0.25)}`,
        scrollbar:    "#334155 transparent",
        otherCamsLabel: "#64748B",         // slate-500
        confLabel:    "rgba(255,255,255,0.75)",
        plateLabel:   "rgba(255,255,255,0.65)",
        journeyCount: "#64748B",           // slate-500
        noJourney:    "#475569",           // slate-600
        liveTagColor: "#0F172A",           // slate-900 (on vivid accent bg)
        sectionCountColor: "#64748B",      // slate-500
      }
    : {
        backdrop:     "rgba(15,23,42,0.55)",
        shell:        "#FFFFFF",
        shellBorder:  "#E2E8F0",
        shellShadow:  "0 20px 60px rgba(0,0,0,0.18), 0 4px 24px rgba(0,0,0,0.10)",
        gridLine:     "rgba(0,0,0,0.025)",
        headerBg:     "#FFFFFF",
        headerBorder: "#E2E8F0",
        labelColor:   "#FFFFFF",       // text on coloured badge chip
        textPrimary:  "#0F172A",
        textSub:      "#1E293B",
        textMono:     "#64748B",
        textMuted:    "#94A3B8",
        closeBtn:     "#94A3B8",
        colDivider:   "#E2E8F0",
        frameBg:      "#F1F5F9",
        frameInset:   "inset 0 0 0 1px rgba(0,0,0,0.06)",
        vignetteTop:  "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, transparent 30%, transparent 60%, rgba(0,0,0,0.35) 100%)",
        camOverlay:   "linear-gradient(to bottom, rgba(0,0,0,0.60), transparent)",
        confOverlay:  "linear-gradient(to top, rgba(0,0,0,0.65), transparent)",
        thumbBg:      "#E2E8F0",
        thumbOverlay: "linear-gradient(to bottom, transparent 40%, rgba(0,0,0,0.52))",
        thumbHeader:  "rgba(0,0,0,0.55)",
        thumbTime:    "rgba(255,255,255,0.75)",
        emptyThumb:   "#F1F5F9",
        sectionBorder:"1px solid #E2E8F0",
        secHeadColor: "#475569",
        divider:      "#E2E8F0",
        checkpointCnt:"1px solid #CBD5E1",
        journeyLine:  "#CBD5E1",
        stopBgActive: a(0.07),
        stopBgIdle:   "#F8FAFC",
        stopInset:    `inset 0 0 0 1px ${a(0.22)}`,
        stopInnerDot: "#FFFFFF",
        stopZoneText: "#1E293B",
        evRowBg:      "#F8FAFC",
        evRowBorder:  "1px solid #E2E8F0",
        evTitleColor: "#1E293B",
        evInfoColor:  "#64748B",
        barZero:      "#E2E8F0",
        barNormal:    a(0.3),
        dayInactive:  "#E2E8F0",
        dayLabel:     "#94A3B8",
        hrLabel:      "#94A3B8",
        dropBg:       "#FFFFFF",
        dropBorder:   "1px solid #E2E8F0",
        dropRowBorder:"1px solid #F1F5F9",
        dropItemColor:"#334155",
        inputBg:      "#F8FAFC",
        inputBorder:  "1px solid #CBD5E1",
        inputPlaceholder: "#94A3B8",
        inputSelected:"#1E293B",
        btnDisabledBg:"#F1F5F9",
        btnDisabledTx:"#94A3B8",
        btnDisabledBd:"1px solid #E2E8F0",
        successBg:    a(0.06),
        successBorder:`1px solid ${a(0.22)}`,
        scrollbar:    "#CBD5E1 transparent",
        otherCamsLabel: "#64748B",
        confLabel:    "rgba(255,255,255,0.75)",
        plateLabel:   "rgba(255,255,255,0.65)",
        journeyCount: "#64748B",
        noJourney:    "#94A3B8",
        liveTagColor: "#FFFFFF",
        sectionCountColor: "#64748B",
      };

  const allRecipients = ["Admin", ...groups];

  // ── Right-column derived data ──────────────────────────────────────────────
  const calcTimeDiff = (t1: string, t2: string): string => {
    const [h1, m1] = t1.split(":").map(Number);
    const [h2, m2] = t2.split(":").map(Number);
    const diffMin = Math.abs((h2 * 60 + m2) - (h1 * 60 + m1));
    if (!diffMin) return "";
    const h = Math.floor(diffMin / 60);
    const m = diffMin % 60;
    return h > 0 ? (m > 0 ? `${h}h ${m}min` : `${h}h`) : `${m}min`;
  };

  // Detection Event grid values
  const frameNum   = (person.id.charCodeAt(0) * 1337 + (person.id.charCodeAt(1) || 1) * 43 + (person.id.charCodeAt(2) || 7) * 7) % 90000 + 10000;
  const durInFrame = journey[0]?.dwellText ?? (person.dwell != null ? `${person.dwell}s` : "6.1s");
  const detConf    = person.confidence != null ? `${Math.min(100, Math.floor(person.confidence + 1.5))}%` : "96%";
  const matchConf  = person.confidence != null ? `${person.confidence.toFixed(1)}%` : "N/A";

  // Appearance Pattern grid values
  const totalAppearances = person.totalAppearances ?? ((person.recurringDays ?? 3) * 2 + 1);
  const thisMonth        = Math.max(1, Math.round(totalAppearances * 0.38));
  const prevStop         = journey.find(j => !j.isCurrent);
  const lastSeenBefore   = prevStop
    ? `2026-03-12 · ${prevStop.time} · ${prevStop.zone}`
    : null;

  const handleNotify = () => {
    if (!notifySelected.length) return;
    setNotified(true);
    setNotifySelected([]);
    setTimeout(() => setNotified(false), 3000);
  };

  return createPortal(
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[1000] backdrop-blur-[3px]"
        style={{ background: T.backdrop }}
        onClick={onClose}
      />

      {/* ─────────────────────────────────────────────────────────────────── */}
      {/* Modal shell — wider at 1140 px                                     */}
      {/* ─────────────────────────────────────────────────────────────────── */}
      <div
        className="fixed z-[1001] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                   w-[1140px] max-w-[96vw] max-h-[90vh] flex flex-col rounded-[8px] overflow-hidden"
        style={{
          background: T.shell,
          border: `1px solid ${T.shellBorder}`,
          boxShadow: T.shellShadow,
          backgroundImage: `linear-gradient(${T.gridLine} 1px, transparent 1px),
                            linear-gradient(90deg, ${T.gridLine} 1px, transparent 1px)`,
          backgroundSize: "48px 48px",
        }}
        onClick={e => e.stopPropagation()}
      >

        {/* ── Header ───────────────────────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-5 py-3 shrink-0"
             style={{ borderBottom: `1px solid ${T.headerBorder}`, background: T.headerBg }}>
          <span className="text-[9px] font-black px-2 py-[5px] rounded-[3px] uppercase tracking-[0.12em]"
                style={{ background: accent, color: T.labelColor }}>
            {cfg.label}
          </span>
          <div className="flex items-baseline gap-2 min-w-0">
            <h2 className="text-[15px] font-black leading-none truncate"
                style={{ color: T.textPrimary }}>{person.displayName}</h2>
            <span className="text-[11px] font-mono shrink-0" style={{ color: T.textMono }}>
              {person.zone} · {person.camera}
            </span>
          </div>
          <div className="ml-auto flex items-center gap-4 shrink-0">
            {isThreat && (
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span className="text-[9px] font-black text-red-500 uppercase tracking-widest">Active Threat</span>
              </div>
            )}
            <span className="text-[10px] font-mono" style={{ color: T.textMuted }}>{person.time}</span>
            <button onClick={onClose}
              className="w-7 h-7 flex items-center justify-center rounded transition-colors"
              style={{ color: T.closeBtn }}
              onMouseEnter={e => (e.currentTarget.style.background = isDark ? "#1E293B" : "#F1F5F9")}
              onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ── Main body: left image col + right data col ───────────────────── */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* ── LEFT COLUMN: 44% — landscape frame + thumbnails ──────────────── */}
          <div className="w-[44%] shrink-0 flex flex-col p-4 gap-3"
               style={{ borderRight: `1px solid ${T.colDivider}` }}>

            {/* ── Split image row: system record (left) + live capture (right) ── */}
            <div className="grid grid-cols-2 gap-2 shrink-0">

              {/* LEFT — System / enrolled photo */}
              <div className="flex flex-col gap-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: T.textMuted }}>
                  System Record
                </p>
                <div className="relative rounded-[5px] overflow-hidden"
                     style={{
                       aspectRatio: "3 / 4",
                       background: T.frameBg,
                       border: `1px solid ${isDark ? a(0.2) : "#CBD5E1"}`,
                     }}>
                  {person.imageSrc ? (
                    <img src={person.imageSrc} alt="Enrolled photo"
                         className="absolute inset-0 w-full h-full object-cover object-top"
                         style={{ filter: "contrast(1.06) saturate(0.75) brightness(1.04)" }}
                         onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Fingerprint className="w-10 h-10" style={{ color: isDark ? a(0.15) : "#CBD5E1" }} />
                    </div>
                  )}
                  {/* Subtle corner bracket HUD — no text overlay */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none"
                       viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                    <path d="M 8 8 L 8 18 M 8 8 L 18 8"   stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.7" />
                    <path d="M 92 8 L 92 18 M 92 8 L 82 8" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.7" />
                    <path d="M 8 92 L 8 82 M 8 92 L 18 92" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.7" />
                    <path d="M 92 92 L 92 82 M 92 92 L 82 92" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.7" />
                  </svg>
                </div>
              </div>

              {/* RIGHT — Live camera capture */}
              <div className="flex flex-col gap-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.14em]" style={{ color: T.textMuted }}>
                  Live Capture
                </p>
                <div className="relative rounded-[5px] overflow-hidden"
                     style={{
                       aspectRatio: "3 / 4",
                       background: T.frameBg,
                       border: `1px solid ${isDark ? a(0.2) : "#CBD5E1"}`,
                     }}>
                  {person.imageSrc ? (
                    <img src={person.imageSrc} alt="Live capture"
                         className="absolute inset-0 w-full h-full object-cover"
                         style={{ filter: isDark ? "contrast(1.05) saturate(0.85)" : "contrast(1.02) saturate(0.90)" }}
                         onError={e => { (e.target as HTMLImageElement).style.opacity = "0"; }} />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Fingerprint className="w-10 h-10" style={{ color: isDark ? a(0.15) : "#CBD5E1" }} />
                    </div>
                  )}
                  {/* LPR plate overlay */}
                  {isLPR && person.plateText && (
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center pointer-events-none">
                      <span className="text-[13px] font-black font-mono tracking-widest text-white/90 px-2 py-0.5 rounded"
                            style={{ background: "rgba(0,0,0,0.55)" }}>
                        {person.plateText}
                      </span>
                    </div>
                  )}
                  {/* Corner bracket HUD */}
                  <svg className="absolute inset-0 w-full h-full pointer-events-none"
                       viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
                    {!isLPR ? (
                      <>
                        <path d="M 15 12 L 15 22 M 15 12 L 25 12" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.85" />
                        <path d="M 85 12 L 85 22 M 85 12 L 75 12" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.85" />
                        <path d="M 15 88 L 15 78 M 15 88 L 25 88" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.85" />
                        <path d="M 85 88 L 85 78 M 85 88 L 75 88" stroke={accent} strokeWidth="1.8" fill="none" strokeOpacity="0.85" />
                      </>
                    ) : (
                      <>
                        <rect x="18" y="58" width="64" height="18" fill="none" stroke={accent} strokeWidth="0.9" strokeOpacity="0.7" />
                        <path d="M 8 8 L 8 18 M 8 8 L 18 8"     stroke={accent} strokeWidth="1.5" fill="none" strokeOpacity="0.85" />
                        <path d="M 92 8 L 92 18 M 92 8 L 82 8"   stroke={accent} strokeWidth="1.5" fill="none" strokeOpacity="0.85" />
                        <path d="M 8 92 L 8 82 M 8 92 L 18 92"   stroke={accent} strokeWidth="1.5" fill="none" strokeOpacity="0.85" />
                        <path d="M 92 92 L 92 82 M 92 92 L 82 92" stroke={accent} strokeWidth="1.5" fill="none" strokeOpacity="0.85" />
                      </>
                    )}
                  </svg>
                </div>
              </div>
            </div>

            {/* ── Alert / match info strip — clean text, no image overlay ── */}
            <div className="shrink-0 rounded-[5px] px-3 py-2.5 flex items-center gap-3"
                 style={{
                   background: modalStamp
                     ? (isDark ? "rgba(239,68,68,0.07)" : "#FFF5F5")
                     : (isDark ? "rgba(255,255,255,0.03)" : "#F8FAFC"),
                   border: `1px solid ${modalStamp
                     ? (isDark ? "rgba(239,68,68,0.2)" : "#FECACA")
                     : (isDark ? a(0.08) : "#E2E8F0")}`,
                 }}>
              {modalStamp ? (
                <>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-black uppercase leading-none mb-0.5"
                       style={{ color: modalStamp.color, letterSpacing: "0.1em" }}>
                      {modalStamp.headline}
                    </p>
                    <p className="text-[11px] font-semibold leading-snug" style={{ color: T.textSub }}>
                      {modalStamp.reason}
                    </p>
                  </div>
                  {person.confidence != null && (
                    <div className="text-right shrink-0">
                      <p className="text-[8px] font-mono uppercase tracking-widest mb-0.5" style={{ color: T.textMuted }}>
                        {terminology.matchScoreLabel ?? "Similarity"}
                      </p>
                      <p className="text-[18px] font-black font-mono tabular-nums leading-none"
                         style={{ color: modalStamp.color }}>
                        {person.confidence.toFixed(1)}<span className="text-[10px]">%</span>
                      </p>
                    </div>
                  )}
                </>
              ) : (
                <>
                  {person.subLabel && (
                    <p className="flex-1 text-[11px] leading-snug" style={{ color: isUnknown ? "#f59e0b" : T.textMono }}>
                      {person.subLabel}
                    </p>
                  )}
                  {person.confidence != null && (
                    <div className="text-right shrink-0 ml-auto">
                      <p className="text-[8px] font-mono uppercase tracking-widest mb-0.5" style={{ color: T.textMuted }}>
                        {terminology.matchScoreLabel ?? "Match Conf."}
                      </p>
                      <p className="text-[18px] font-black font-mono tabular-nums leading-none" style={{ color: accent }}>
                        {person.confidence.toFixed(1)}<span className="text-[10px]">%</span>
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* ── Detection Event (compact) ── */}
            <div className="shrink-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-1.5" style={{ color: T.otherCamsLabel }}>
                Detection Event
              </p>
              <div className="rounded-[5px] overflow-hidden"
                   style={{ border: `1px solid ${isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0"}` }}>
                <div className="grid grid-cols-2">
                  {([
                    { label: "Timestamp",  value: `${person.time} IST` },
                    { label: "Camera",     value: person.camera },
                    { label: "Frame #",    value: frameNum.toLocaleString() },
                    { label: "Duration",   value: durInFrame },
                    { label: "Det. Conf",  value: detConf },
                    person.confidence != null ? { label: "Match",  value: matchConf } : null,
                  ] as ({ label: string; value: string } | null)[])
                    .filter((x): x is { label: string; value: string } => x !== null)
                    .map((item, i) => (
                      <div key={item.label}
                           className="px-2.5 py-2"
                           style={{
                             borderRight:  i % 2 === 0 ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0"}` : "none",
                             borderBottom: i < 4        ? `1px solid ${isDark ? "rgba(255,255,255,0.06)" : "#E2E8F0"}` : "none",
                             background:   isDark ? "rgba(255,255,255,0.01)" : "#FAFAFA",
                           }}>
                        <p className="text-[7px] font-bold uppercase tracking-widest mb-0.5" style={{ color: T.textMuted }}>
                          {item.label}
                        </p>
                        <p className="text-[10px] font-semibold truncate" style={{ color: T.textPrimary }}>
                          {item.value}
                        </p>
                      </div>
                    ))
                  }
                </div>
              </div>
            </div>

            {/* ── Additional camera thumbnails ── */}
            <div className="shrink-0">
              <p className="text-[8px] font-bold uppercase tracking-[0.14em] mb-2" style={{ color: T.otherCamsLabel }}>
                Other Sightings
              </p>
              <div className="grid grid-cols-3 gap-2">
                {Array.from({ length: 3 }, (_, i) => {
                  const stop = journey[i];
                  return stop ? (
                    <div key={i} className="relative aspect-video rounded-[4px] overflow-hidden"
                         style={{
                           background: T.thumbBg,
                           border: `1px solid ${isDark ? a(0.12) : "#CBD5E1"}`,
                         }}>
                      {person.imageSrc && (
                        <img src={person.imageSrc} alt="" className="w-full h-full object-cover"
                             style={{ opacity: 0.55, filter: "saturate(0.4) contrast(1.1)" }} />
                      )}
                      <div className="absolute inset-0" style={{ background: T.thumbOverlay }} />
                      <div className="absolute top-0 left-0 right-0 px-1.5 py-1"
                           style={{ background: T.thumbHeader }}>
                        <span className="text-[7px] font-mono" style={{ color: accent }}>{stop.camera}</span>
                      </div>
                      <div className="absolute bottom-1 left-1.5">
                        <span className="text-[7px] font-mono" style={{ color: T.thumbTime }}>{stop.time}</span>
                      </div>
                      {stop.isCurrent && (
                        <div className="absolute top-1 right-1 flex items-center gap-0.5">
                          <span className="w-1.5 h-1.5 rounded-full animate-pulse bg-red-500" />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div key={i} className="aspect-video rounded-[4px] flex items-center justify-center"
                         style={{
                           background: T.emptyThumb,
                           border: `1px solid ${isDark ? a(0.07) : "#E2E8F0"}`,
                         }}>
                      <Camera className="w-5 h-5" style={{ color: isDark ? a(0.15) : "#CBD5E1" }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── Person detail strip (below thumbnails) ── */}
            {(person.department || person.employeeId || person.dwell != null || person.totalAppearances != null) && (
              <div className="shrink-0 grid grid-cols-2 gap-x-4 gap-y-1.5 px-0.5">
                {person.department && (
                  <div>
                    <p className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: T.textMuted }}>Dept.</p>
                    <p className="text-[11px] font-semibold" style={{ color: T.textSub }}>{person.department}</p>
                  </div>
                )}
                {person.employeeId && (
                  <div>
                    <p className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: T.textMuted }}>ID</p>
                    <p className="text-[11px] font-mono" style={{ color: T.textSub }}>{person.employeeId}</p>
                  </div>
                )}
                {person.dwell != null && !isUnknown && (
                  <div>
                    <p className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: T.textMuted }}>Dwell</p>
                    <p className="text-[11px] font-mono font-bold"
                       style={{ color: person.dwell > 180 ? "#f59e0b" : T.textSub }}>{fmtDwell(person.dwell)}</p>
                  </div>
                )}
                {person.totalAppearances != null && (
                  <div>
                    <p className="text-[8px] uppercase tracking-widest font-bold mb-0.5" style={{ color: T.textMuted }}>Visits</p>
                    <p className="text-[11px] font-mono" style={{ color: T.textSub }}>{person.totalAppearances}</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN: scrollable data panels ─────────────────────────── */}
          <div className="flex-1 flex flex-col overflow-hidden min-w-0">

            {/* Scrollable section */}
            <div className="flex-1 overflow-y-auto min-h-0"
                 style={{ scrollbarWidth: "thin", scrollbarColor: T.scrollbar }}>

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* MOVEMENT PATH                                               */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <div className="pt-5 pb-2">
                {/* Section header */}
                <div className="flex items-center gap-3 px-5 mb-5">
                  <span className="text-[9px] font-bold uppercase tracking-[0.18em]" style={{ color: T.secHeadColor }}>
                    {isLPR ? "Gate History" : "Movement Path"}
                  </span>
                  <div className="flex-1 h-px" style={{ background: T.divider }} />
                  <span className="text-[9px] font-mono" style={{ color: T.journeyCount }}>
                    {journey.length} checkpoint{journey.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {journey.length === 0 ? (
                  <p className="px-5 text-[11px]" style={{ color: T.noJourney }}>No movement recorded</p>
                ) : (
                  <div className="px-4 space-y-0">
                    {journey.map((stop, idx) => {
                      const nextStop      = journey[idx + 1];
                      const timeDiff      = nextStop ? calcTimeDiff(stop.time, nextStop.time) : "";
                      const isCurrentStop = stop.isCurrent;
                      const isLast        = idx === journey.length - 1;
                      const lineColor     = isDark ? "#334155" : "#D1D5DB";

                      const stepDotBg = isCurrentStop && isThreat ? "#EF4444"
                        : isCurrentStop                            ? "#00775B"
                        : idx === 0                                ? (isDark ? "#475569" : "#94A3B8")
                                                                   : "#00775B";

                      const cardBg = isCurrentStop
                        ? (isThreat
                            ? (isDark ? "rgba(239,68,68,0.06)" : "#FFF5F5")
                            : (isDark ? "rgba(0,119,91,0.06)" : "#F0FDFB"))
                        : (isDark ? "rgba(255,255,255,0.02)" : "#FFFFFF");

                      const cardBorder = isCurrentStop
                        ? (isThreat
                            ? (isDark ? "rgba(239,68,68,0.3)" : "#FECACA")
                            : (isDark ? "rgba(0,119,91,0.3)" : "#99E9D2"))
                        : (isDark ? "rgba(255,255,255,0.07)" : "#E2E8F0");

                      const headerBg = isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.025)";

                      const stopDesc = stop.alertNote
                        ? stop.alertNote
                        : isCurrentStop
                          ? `Currently active in ${stop.zone.toLowerCase()}`
                          : idx === 0
                            ? `First detected at ${stop.zone.toLowerCase()}`
                            : `Transited through ${stop.zone.toLowerCase()}`;

                      return (
                        <div key={idx} className="flex gap-3">

                          {/* ── Left: numbered square + connecting line ── */}
                          <div className="flex flex-col items-center" style={{ width: 34 }}>
                            {/* Square step number */}
                            <div className="w-[34px] h-[34px] rounded-[6px] flex items-center justify-center shrink-0"
                                 style={{
                                   background: stepDotBg,
                                   boxShadow: isCurrentStop
                                     ? `0 0 0 3px ${isThreat ? "rgba(239,68,68,0.2)" : "rgba(0,119,91,0.2)"}`
                                     : "0 1px 3px rgba(0,0,0,0.2)",
                                 }}>
                              <span className="text-[10px] font-black text-white leading-none tabular-nums">
                                {String(idx + 1).padStart(2, "0")}
                              </span>
                            </div>
                            {/* Line segment — grows to match card height on the right */}
                            {!isLast && (
                              <div className="w-[2px] flex-1 mt-1" style={{ background: lineColor }} />
                            )}
                          </div>

                          {/* ── Right: card + time gap ── */}
                          <div className="flex-1 min-w-0 pb-3">
                            {/* Stop card */}
                            <div className="rounded-[8px] overflow-hidden"
                                 style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>

                              {/* Header — zone + status badge + time */}
                              <div className="flex items-center justify-between px-3 py-2 gap-2"
                                   style={{ background: headerBg, borderBottom: `1px solid ${cardBorder}` }}>
                                <div className="flex items-center gap-2 min-w-0">
                                  <span className="text-[13px] font-bold leading-none truncate" style={{ color: T.textPrimary }}>
                                    {stop.zone}
                                  </span>
                                  {isCurrentStop && (
                                    <span className="shrink-0 text-[7px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded-[3px]"
                                          style={{ background: isThreat ? "#EF4444" : "#00775B", color: "#fff" }}>
                                      {isThreat ? "ACTIVE THREAT" : "CURRENT"}
                                    </span>
                                  )}
                                </div>
                                <span className="text-[12px] font-bold font-mono tabular-nums shrink-0" style={{ color: T.textPrimary }}>
                                  {stop.time}
                                </span>
                              </div>

                              {/* Body — thumbnail + meta + badges */}
                              <div className="flex items-center gap-2.5 px-3 py-2.5">
                                {/* Thumbnail */}
                                <div className="shrink-0 w-[48px] h-[48px] rounded-[4px] overflow-hidden relative"
                                     style={{
                                       background: isDark ? "#0F172A" : "#1E293B",
                                       border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "#CBD5E1"}`,
                                     }}>
                                  {isLPR ? (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                                      <Camera className="w-4 h-4 text-neutral-500" />
                                      <span className="text-[6px] font-mono text-amber-300 font-bold">{person.plateText ?? "──"}</span>
                                    </div>
                                  ) : (
                                    <img src={person.imageSrc ?? `https://i.pravatar.cc/96?u=${person.id}-${idx}`}
                                         alt="" className="absolute inset-0 w-full h-full object-cover"
                                         style={{ opacity: 0.85, filter: "contrast(1.04) saturate(0.8)" }}
                                         onError={e => { (e.target as HTMLImageElement).style.display = "none"; }} />
                                  )}
                                  <div className="absolute bottom-0 left-0 right-0 px-1 py-[2px]"
                                       style={{ background: "rgba(0,0,0,0.72)" }}>
                                    <span className="text-[6px] font-mono leading-none" style={{ color: accent }}>{stop.camera}</span>
                                  </div>
                                </div>

                                {/* Meta */}
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-1 mb-1 flex-wrap">
                                    <span className="text-[9px] font-mono" style={{ color: T.textMono }}>{stop.camera}</span>
                                    {person.confidence != null && (
                                      <>
                                        <span style={{ color: T.textMuted }} className="text-[8px]">·</span>
                                        <span className="text-[9px] font-mono font-bold" style={{ color: accent }}>
                                          {person.confidence.toFixed(1)}%
                                        </span>
                                      </>
                                    )}
                                    {stop.dwellText && (
                                      <>
                                        <span style={{ color: T.textMuted }} className="text-[8px]">·</span>
                                        <span className="text-[9px] font-mono" style={{ color: T.textMono }}>{stop.dwellText}</span>
                                      </>
                                    )}
                                  </div>
                                  <p className="text-[10px] leading-snug" style={{ color: T.textMono }}>{stopDesc}</p>
                                </div>

                                {/* Badges */}
                                <div className="flex flex-col items-end gap-1 shrink-0">
                                  {stop.alertNote && (
                                    <span className="text-[7px] font-black uppercase tracking-wider px-2 py-[3px] rounded-[3px] leading-none"
                                          style={{
                                            color: isThreat ? "#EF4444" : "#D97706",
                                            background: isThreat ? (isDark ? "rgba(239,68,68,0.12)" : "#FEF2F2") : (isDark ? "rgba(217,119,6,0.12)" : "#FFFBEB"),
                                            border: `1px solid ${isThreat ? "rgba(239,68,68,0.3)" : "rgba(217,119,6,0.3)"}`,
                                          }}>
                                      {stop.alertNote.toUpperCase()}
                                    </span>
                                  )}
                                  {stop.linkedPlate && (
                                    <span className="text-[7px] font-mono font-bold uppercase px-2 py-[3px] rounded-[3px] leading-none"
                                          style={{ color: "#00775B", background: isDark ? "rgba(0,119,91,0.12)" : "#E5FFF9", border: "1px solid rgba(0,119,91,0.25)" }}>
                                      {stop.linkedPlate}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Time gap label between stops */}
                            {timeDiff && !isLast && (
                              <div className="flex items-center gap-2 mt-2">
                                <div className="h-px flex-1" style={{ background: lineColor }} />
                                <span className="text-[9px] font-mono shrink-0" style={{ color: T.textMuted }}>{timeDiff}</span>
                                <div className="h-px flex-1" style={{ background: lineColor }} />
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* ═══════════════════════════════════════════════════════════ */}
              {/* APPEARANCE PATTERN — label / value data grid               */}
              {/* ═══════════════════════════════════════════════════════════ */}
              <div className="px-5 pt-5 pb-8" style={{ borderTop: T.sectionBorder }}>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] mb-5" style={{ color: T.secHeadColor }}>
                  Appearance Pattern
                </p>
                <div className="grid grid-cols-2 gap-x-8 gap-y-5">
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: T.textMuted }}>
                      Total Appearances
                    </p>
                    <p className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>{totalAppearances}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: T.textMuted }}>
                      This Month
                    </p>
                    <p className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>{thisMonth}</p>
                  </div>
                  {lastSeenBefore && (
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: T.textMuted }}>
                        Last Seen Before
                      </p>
                      <p className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>{lastSeenBefore}</p>
                    </div>
                  )}
                  {person.enrollDate && (
                    <div className="col-span-2">
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: T.textMuted }}>
                        Enrolled
                      </p>
                      <p className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>{person.enrollDate}</p>
                    </div>
                  )}
                  {person.recurringDays != null && (
                    <div>
                      <p className="text-[8px] font-bold uppercase tracking-[0.15em] mb-1.5" style={{ color: T.textMuted }}>
                        Active Days
                      </p>
                      <p className="text-[13px] font-semibold" style={{ color: T.textPrimary }}>{person.recurringDays} days</p>
                    </div>
                  )}
                </div>
              </div>

            </div>{/* end scrollable */}

            {/* ── NOTIFY — sticky footer pinned at bottom of right col ── */}
            <div className="shrink-0 px-5 py-4"
                 ref={notifyRef}
                 style={{ borderTop: T.sectionBorder, background: T.headerBg }}>
              <div className="flex items-center gap-2 mb-3">
                <Mail className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: T.secHeadColor }}>Notify</span>
                <div className="flex-1 h-px mx-1" style={{ background: T.divider }} />
              </div>

              <div className="flex gap-2">
                {/* Recipient dropdown */}
                <div className="relative flex-1">
                  <button
                    onClick={() => setNotifyOpen(v => !v)}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-[5px] text-[11px] transition-colors"
                    style={{ background: T.inputBg, border: T.inputBorder }}>
                    <span style={{ color: notifySelected.length ? T.inputSelected : T.inputPlaceholder }}>
                      {notifySelected.length === 0
                        ? "Select recipients…"
                        : `${notifySelected.length} selected: ${notifySelected.slice(0, 2).join(", ")}${notifySelected.length > 2 ? "…" : ""}`}
                    </span>
                    <ChevronDown className="w-3.5 h-3.5 shrink-0 ml-2 transition-transform"
                      style={{ color: T.textMuted, transform: notifyOpen ? "rotate(180deg)" : "rotate(0deg)" }} />
                  </button>
                  {notifyOpen && (
                    <div className="absolute left-0 bottom-full z-50 mb-1 w-full rounded-[5px] overflow-hidden shadow-2xl"
                         style={{ background: T.dropBg, border: T.dropBorder }}>
                      {allRecipients.map(r => (
                        <label key={r} className="flex items-center gap-2.5 px-3 py-2 cursor-pointer transition-colors"
                               style={{ borderBottom: T.dropRowBorder }}
                               onMouseEnter={e => (e.currentTarget.style.background = isDark ? a(0.07) : "#F1F5F9")}
                               onMouseLeave={e => (e.currentTarget.style.background = "transparent")}>
                          <input type="checkbox" checked={notifySelected.includes(r)}
                            onChange={() => setNotifySelected(prev =>
                              prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]
                            )}
                            className="w-3.5 h-3.5 rounded accent-[#00775B] cursor-pointer" />
                          <span className="text-[11px]" style={{ color: T.dropItemColor }}>{r}</span>
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Send button */}
                <button
                  onClick={handleNotify}
                  disabled={!notifySelected.length}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-[5px] text-[11px] font-bold transition-all shrink-0"
                  style={{
                    background: notifySelected.length ? (isDark ? "#00D4AA" : "#00775B") : T.btnDisabledBg,
                    color: notifySelected.length ? (isDark ? "#030d0a" : "#FFFFFF") : T.btnDisabledTx,
                    border: notifySelected.length ? `1px solid ${isDark ? "#00D4AA" : "#00775B"}` : T.btnDisabledBd,
                    cursor: notifySelected.length ? "pointer" : "not-allowed",
                  }}>
                  <Mail className="w-3.5 h-3.5" />
                  {notifySelected.length
                    ? `Send to ${notifySelected.length}`
                    : "Send Alert"}
                </button>
              </div>

              {notified && (
                <div className="mt-2 flex items-center gap-2 px-3 py-2 rounded-[4px]"
                     style={{ background: T.successBg, border: T.successBorder }}>
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" style={{ color: accent }} />
                  <p className="text-[11px] font-semibold" style={{ color: accent }}>
                    Notification sent successfully
                  </p>
                </div>
              )}
            </div>

          </div>{/* end right column */}
        </div>
      </div>
    </>,
    document.body
  );
}

// ─── Priority Watchlist (always-visible center panel — horizontal grid) ────────
const WL_PAGE_SIZE = 3;

function WatchlistPanel({
  people, onOpenModal, isLPR,
}: {
  people: FeedPerson[]; onOpenModal: (id: string) => void; isLPR: boolean;
}) {
  const [wlPage, setWlPage] = useState(0);

  const threats = people
    .filter(p => p.status === "BLACKLIST" || p.status === "BOLO" || p.status === "UNKNOWN" || p.status === "UNREGISTERED")
    .sort((a, b) => STATUS_CFG[a.status].priority - STATUS_CFG[b.status].priority);

  const criticalCount  = threats.filter(p => p.status === "BLACKLIST" || p.status === "BOLO").length;
  const wlTotalPages   = Math.max(1, Math.ceil(threats.length / WL_PAGE_SIZE));
  const wlSafePage     = Math.min(wlPage, wlTotalPages - 1);
  const wlPaged        = threats.slice(wlSafePage * WL_PAGE_SIZE, (wlSafePage + 1) * WL_PAGE_SIZE);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-neutral-50 border-b border-neutral-100 shrink-0">
        <Activity className="w-3.5 h-3.5 text-[#00775B]" />
        <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Priority Watchlist</span>
        <div className="ml-auto flex items-center gap-1.5">
          {criticalCount > 0 && (
            <span className="flex items-center gap-1 text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-red-600 text-white animate-pulse">
              <span className="w-1 h-1 rounded-full bg-white" />
              {criticalCount} CRITICAL
            </span>
          )}
          {criticalCount === 0 && threats.length > 0 && (
            <span className="text-[9px] font-black px-1.5 py-0.5 rounded-[2px] bg-amber-100 text-amber-700">
              {threats.length} ALERTS
            </span>
          )}
        </div>
      </div>

      <div className="p-3">
        {threats.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-neutral-400">
            <CheckCircle2 className="w-10 h-10 mb-2 text-emerald-400" />
            <p className="text-[12px] font-semibold">No active threats</p>
            <p className="text-[10px]">All clear</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-2.5">
            {wlPaged.map(p => {
              const cfg = STATUS_CFG[p.status];
              const isCritical = p.status === "BLACKLIST" || p.status === "BOLO";
              const isPlate = isLPR || p.identType === "PLATE";

              return (
                <div
                  key={p.id}
                  onClick={() => onOpenModal(p.id)}
                  className={cn(
                    "group rounded-[4px] overflow-hidden cursor-pointer select-none flex flex-col",
                    "transition-all hover:-translate-y-[1px] active:scale-[0.99]",
                    isCritical
                      ? "border border-red-900/30 shadow-[0_0_0_1px_rgba(220,38,38,0.08),0_2px_8px_rgba(220,38,38,0.12)]"
                      : "border border-amber-900/20 shadow-[0_0_0_1px_rgba(217,119,6,0.06),0_2px_8px_rgba(217,119,6,0.10)]",
                  )}
                >
                  {/* ── Alert-tinted header ─────────────────────────────────── */}
                  <div className={cn(
                    "flex items-center gap-2 px-2.5 py-[7px] border-b",
                    isCritical ? "bg-red-50 border-red-100" : "bg-amber-50 border-amber-100"
                  )}>
                    <span className={cn(
                      "text-[8px] font-black uppercase tracking-[0.12em] px-1.5 py-[2px] rounded-[2px]",
                      isCritical ? "bg-red-600 text-white" : "bg-amber-500 text-black"
                    )}>
                      {cfg.label}
                    </span>
                    {p.severity && (
                      <div className="flex items-center gap-[3px]">
                        <span className={cn(
                          "w-[5px] h-[5px] rounded-full",
                          isCritical ? "bg-red-500 animate-pulse" : "bg-amber-500"
                        )} />
                        <span className={cn(
                          "text-[8px] font-bold uppercase tracking-wide",
                          isCritical ? "text-red-700" : "text-amber-700"
                        )}>
                          {p.severity}
                        </span>
                      </div>
                    )}
                    <span className={cn(
                      "ml-auto text-[8px] font-mono tabular-nums",
                      isCritical ? "text-red-400" : "text-amber-500"
                    )}>{p.time.slice(0, 5)}</span>
                  </div>

                  {/* ── Body ──────────────────────────────────────────────── */}
                  <div className="bg-white flex gap-2.5 px-2.5 pt-2.5 pb-2">
                    {/* Image */}
                    <div className="shrink-0 rounded-[2px] overflow-hidden">
                      {isPlate ? (
                        <IdentityEvidenceMedia
                          kind="PLATE" seed={p.id} plateText={p.plateText} imageSrc={p.imageSrc}
                          className="h-[68px] w-[86px]"
                        />
                      ) : (
                        <IdentityEvidenceMedia
                          kind="FACE" seed={p.id} imageSrc={p.imageSrc}
                          live={isCritical}
                          className="h-[68px] w-[52px]"
                        />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-black text-neutral-900 truncate leading-tight">{p.displayName}</p>
                      <div className="flex items-center gap-1 mt-[3px] mb-2">
                        <MapPin className="w-2.5 h-2.5 text-neutral-400 shrink-0" />
                        <p className="text-[9px] font-mono text-neutral-400 truncate">{p.zone}</p>
                      </div>
                      <p className={cn(
                        "text-[9px] font-semibold mb-1",
                        isCritical ? "text-red-600" : "text-amber-700"
                      )}>
                        {p.status === "BLACKLIST" ? "Confirmed Blacklist"
                          : p.status === "BOLO"         ? "BOLO Match"
                          : p.status === "UNKNOWN"      ? "Unknown Individual"
                          : "Unregistered Plate"}
                      </p>
                    </div>
                  </div>

                  {/* ── Footer ────────────────────────────────────────────── */}
                  <div className="mt-auto bg-neutral-50 border-t border-neutral-100 flex items-center justify-between px-2.5 py-1.5">
                    <span className="text-[8px] font-mono text-neutral-400 tracking-wide">{p.camera}</span>
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

      {/* ── Watchlist Pagination footer ── */}
      {wlTotalPages > 1 && (
        <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neutral-100 bg-neutral-50 relative">
          {/* PREV */}
          <button
            onClick={() => setWlPage(p => Math.max(0, p - 1))}
            disabled={wlSafePage === 0}
            className="flex items-center gap-1 h-6 px-2.5 rounded border border-neutral-200 bg-white text-[10px] font-bold text-neutral-500 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="w-3 h-3" /> PREV
          </button>

          {/* Smart page numbers */}
          <div className="flex items-center gap-0.5">
            {getPaginationItems(wlSafePage, wlTotalPages).map((item, idx) =>
              item === "…" ? (
                <span key={`ellipsis-${idx}`} className="h-6 w-6 flex items-center justify-center text-[10px] text-neutral-400 select-none">…</span>
              ) : (
                <button
                  key={item}
                  onClick={() => setWlPage(item)}
                  className={cn(
                    "h-6 w-6 rounded text-[10px] font-bold transition-colors",
                    item === wlSafePage ? "bg-[#00775B] text-white shadow-sm" : "text-neutral-500 hover:bg-neutral-100"
                  )}
                >
                  {item + 1}
                </button>
              )
            )}
          </div>

          {/* NEXT */}
          <button
            onClick={() => setWlPage(p => Math.min(wlTotalPages - 1, p + 1))}
            disabled={wlSafePage === wlTotalPages - 1}
            className="flex items-center gap-1 h-6 px-2.5 rounded bg-[#00775B] text-[10px] font-bold text-white hover:bg-[#006349] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            NEXT <ChevronRight className="w-3 h-3" />
          </button>

          {/* Count — absolute right */}
          <span className="absolute right-4 text-[10px] text-neutral-400">
            Showing <strong className="text-neutral-700">{wlSafePage * WL_PAGE_SIZE + 1}–{Math.min((wlSafePage + 1) * WL_PAGE_SIZE, threats.length)}</strong> of <strong className="text-neutral-700">{threats.length}</strong> alerts
          </span>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
  groups?: string[];
  onEntityClick?: (type: "matched" | "unknown" | "blacklist", personId?: string) => void;
  onCameraClick?: (id?: string) => void;
}

export const IdentityMonitoringView = ({
  terminology,
  groups = WL_GROUPS,
  onEntityClick,
}: Props) => {
  const isLPR = terminology.isLPR;
  const people = isLPR ? LPR_PEOPLE : FR_PEOPLE;
  const journeyMap = isLPR ? LPR_JOURNEY : FR_JOURNEY;

  const [modalPersonId, setModalPersonId] = useState<string | null>(null);
  const [feedFilter, setFeedFilter] = useState<FeedFilter>("all");

  // Always open the HiTechEntityModal on row click.
  // onEntityClick is kept for external callers (camera panels etc.) but
  // table / watchlist clicks go directly to the modal.
  const openEntity = (person: FeedPerson) => {
    setModalPersonId(person.id);
  };

  const status = IDENTITY_LIVE_STATUS;

  const PAGE_SIZE = 8;
  const [page, setPage] = useState(0);

  const ZONE_PAGE_SIZE = 8;
  const [zonePage, setZonePage] = useState(0);
  const [selectedCamera, setSelectedCamera] = useState<string | null>(null);

  const filtered = people
    .filter(p => {
      if (feedFilter === "threats")    return p.status === "BLACKLIST" || p.status === "BOLO";
      if (feedFilter === "unknowns")   return p.status === "UNKNOWN" || p.status === "UNREGISTERED";
      if (feedFilter === "vip")        return p.status === "VIP";
      if (feedFilter === "authorized") return p.status === "WHITELIST" || p.status === "AUTHORIZED";
      return true;
    })
    .sort((a, b) => STATUS_CFG[a.status].priority - STATUS_CFG[b.status].priority);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage   = Math.min(page, totalPages - 1);
  const paged      = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE);

  const modalPerson = modalPersonId ? people.find(p => p.id === modalPersonId) ?? null : null;
  const modalJourney = modalPersonId ? (journeyMap[modalPersonId] ?? []) : [];
  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(null);
  const activeZones  = isLPR ? LPR_ZONES : IDENTITY_ZONES;

  // Reset camera selection whenever the zone panel opens/changes
  useEffect(() => { setSelectedCamera(null); }, [selectedZoneId]);
  const selectedZone = selectedZoneId ? activeZones.find(z => z.zone_id === selectedZoneId) ?? null : null;

  const threatCount = people.filter(p => p.status === "BLACKLIST" || p.status === "BOLO").length;
  const unknownCount = people.filter(p => p.status === "UNKNOWN" || p.status === "UNREGISTERED").length;

  const systemColor = threatCount > 0 ? "text-red-600" : unknownCount > 0 ? "text-amber-600" : "text-emerald-700";
  const systemLabel = threatCount > 0 ? "CRITICAL" : unknownCount > 0 ? "AMBER" : "GREEN";

  const FEED_FILTERS: { key: FeedFilter; label: string; count?: number }[] = [
    { key: "all",        label: "All",                                            count: people.length },
    { key: "threats",    label: isLPR ? "BOLO" : "Blacklist",                    count: people.filter(p => p.status === "BLACKLIST" || p.status === "BOLO").length },
    { key: "unknowns",   label: isLPR ? "Unregistered" : "Unknowns",             count: people.filter(p => p.status === "UNKNOWN" || p.status === "UNREGISTERED").length },
    { key: "vip",        label: "VIP",                                            count: people.filter(p => p.status === "VIP").length },
    { key: "authorized", label: "Authorised",                                     count: people.filter(p => p.status === "WHITELIST" || p.status === "AUTHORIZED").length },
  ];

  return (
    <div className="flex flex-col gap-3">

      {/* ── System Status Bar ─────────────────────────────────────────────── */}
      <div className="bg-[#e5f5ef] rounded-[4px] px-4 py-2.5 flex items-center gap-4 flex-wrap border border-[#00775B]/15">
        {[
          { label: isLPR ? "Plates/min" : "IDs/min", value: `${status.identifications_last_min}`, color: "text-neutral-800" },
          { label: "Active Threats", value: `${threatCount}`, color: threatCount > 0 ? "text-red-600 font-black" : "text-neutral-800" },
          { label: isLPR ? "Unregistered" : "Unknowns", value: `${unknownCount}`, color: unknownCount > 0 ? "text-amber-600" : "text-neutral-800" },
          { label: "Cameras", value: `${status.cameras_online}/${status.cameras_total}`, color: "text-neutral-800" },
        ].map(s => (
          <div key={s.label} className="flex items-center gap-1.5">
            <span className="text-[9px] text-neutral-500 uppercase tracking-wider">{s.label}</span>
            <span className={cn("text-[11px] font-mono font-bold", s.color)}>{s.value}</span>
          </div>
        ))}
        <div className="ml-auto flex items-center gap-2">
          <div className="w-px h-4 bg-[#00775B]/20" />
          <span className={cn("w-2 h-2 rounded-full animate-pulse", threatCount > 0 ? "bg-red-500" : unknownCount > 0 ? "bg-amber-500" : "bg-emerald-500")} />
          <span className={cn("text-[10px] font-black uppercase tracking-widest", systemColor)}>{systemLabel}</span>
        </div>
      </div>

      {/* ── Row 1: Watchlist (70%) + Sidebar (30%) ──────────────────────── */}
      <div className="grid gap-3" style={{ gridTemplateColumns: "70% 1fr", minWidth: 640 }}>

        {/* Priority Watchlist */}
        <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden">
          <WatchlistPanel people={people} onOpenModal={(id) => { const p = people.find(x => x.id === id); if (p) openEntity(p); }} isLPR={isLPR} />
        </div>

        {/* ── RIGHT: Zone Status — full height ─────────────────────────── */}
        <div className="flex flex-col h-full">

          {/* Zone status grid — paginated with chevrons */}
          {(() => {
            const ZONE_STATUS_ORDER: Record<string, number> = { CRITICAL: 0, WATCH: 1, ELEVATED: 1, CLEAR: 2 };
            const sortedZones  = [...activeZones].sort((a, b) =>
              (ZONE_STATUS_ORDER[a.status] ?? 9) - (ZONE_STATUS_ORDER[b.status] ?? 9)
            );
            const totalZones   = sortedZones.length;
            const zonePages    = Math.max(1, Math.ceil(totalZones / ZONE_PAGE_SIZE));
            const safeZonePage = Math.min(zonePage, zonePages - 1);
            const pagedZones   = sortedZones.slice(safeZonePage * ZONE_PAGE_SIZE, (safeZonePage + 1) * ZONE_PAGE_SIZE);
            return (
          <div className="bg-white rounded-[4px] border border-neutral-100 shadow-sm overflow-hidden flex flex-col flex-1">
            <div className="flex items-center gap-1.5 px-3 py-2.5 border-b border-neutral-50 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-[#00775B]" />
              <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-500">Zone Status</span>
              <span className="ml-auto text-[9px] font-mono text-neutral-400">{totalZones} zones</span>
            </div>
            <div className="flex-1 overflow-y-auto p-2 grid grid-cols-2 gap-1.5 content-start">
              {pagedZones.map(zone => {
                const isCrit = zone.status === "CRITICAL";
                const isWarn = zone.status === "WATCH" || zone.status === "ELEVATED";
                const color = isCrit ? "bg-red-50 border-red-300 text-red-700"
                  : isWarn           ? "bg-orange-50 border-orange-200 text-orange-700"
                  : "bg-emerald-50 border-emerald-200 text-emerald-700";
                const dot = isCrit   ? "bg-red-600 animate-pulse"
                  : isWarn           ? "bg-orange-500"
                  : "bg-emerald-600";
                const statusText  = isCrit ? "Critical" : isWarn ? "Warning" : "Good";
                const statusBadge = isCrit
                  ? "bg-red-100 text-red-700"
                  : isWarn
                  ? "bg-orange-100 text-orange-700"
                  : "bg-emerald-100 text-emerald-700";
                return (
                  <button key={zone.zone_id} onClick={() => setSelectedZoneId(zone.zone_id)}
                    className={cn("rounded-[3px] border px-2 py-1.5 text-left transition-all hover:ring-1 hover:ring-[#00775B]/30 hover:shadow-sm", color)}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dot)} />
                      <span className="text-[9px] font-bold truncate flex-1 min-w-0">{zone.zone_name}</span>
                      <span className={cn("text-[7px] font-black uppercase tracking-wide px-1 py-0.5 rounded-[2px] shrink-0", statusBadge)}>
                        {statusText}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[8px] font-mono opacity-70">
                      <span>{zone.identifications} IDs</span>
                      {zone.blacklist_hits > 0 && <span className="font-black text-red-600">🚨 {zone.blacklist_hits}</span>}
                      {zone.unknown > 0 && <span>{zone.unknown} unk</span>}
                    </div>
                  </button>
                );
              })}
            </div>
            {/* Dot pagination with chevrons */}
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
            );
          })()}

        </div>
      </div>

      {/* ── Row 2: Live Feed — full width ────────────────────────────────── */}
      <div className="bg-white dark:bg-[#0F172A] rounded-[4px] border border-neutral-100 dark:border-[#1E293B] shadow-sm overflow-hidden flex flex-col">
        {/* Header + filters */}
        <div className="px-4 py-2.5 border-b border-neutral-100 dark:border-[#1E293B] bg-neutral-50 dark:bg-[#0F172A] shrink-0 flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <ShieldAlert className="w-3.5 h-3.5 text-[#00775B] dark:text-[#00D4AA]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-neutral-600 dark:text-slate-400">Live Feed</span>
          </div>
          <div className="flex items-center gap-1 ml-auto flex-wrap">
            {FEED_FILTERS.map(f => (
              <button
                key={f.key}
                onClick={() => { setFeedFilter(f.key); setPage(0); }}
                className={cn(
                  "h-6 px-2 rounded-[3px] text-[9px] font-bold transition-colors whitespace-nowrap",
                  feedFilter === f.key
                    ? f.key === "threats" && threatCount > 0
                      ? "bg-red-600 text-white"
                      : "bg-[#00775B] text-white"
                    : "bg-neutral-100 dark:bg-[#1E293B] text-neutral-500 dark:text-slate-400 hover:bg-neutral-200 dark:hover:bg-[#334155]"
                )}
              >
                {f.label}{f.count != null && f.count > 0 ? ` (${f.count})` : ""}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-[11px] text-neutral-400 dark:text-slate-500">No events</div>
          ) : (
            <table className="w-full text-left border-collapse">
              <thead className="bg-neutral-100 sticky top-0 z-10 border-b border-neutral-200">
                <tr className="text-[9px] uppercase tracking-widest font-bold text-neutral-500 h-8">
                  <th className="px-3 py-2 w-16">ID</th>
                  <th className="px-3 py-2 w-16">Snapshot</th>
                  <th className="px-3 py-2">Identity</th>
                  <th className="px-3 py-2 w-28">Status</th>
                  <th className="px-3 py-2">Zone</th>
                  <th className="px-3 py-2 w-28">Camera</th>
                  <th className="px-3 py-2 w-20 text-right">Match %</th>
                  <th className="px-3 py-2 w-20 text-right">Dwell</th>
                  <th className="px-3 py-2 w-24 text-right">Time</th>
                </tr>
              </thead>
              <tbody>
                {paged.map((p, i) => (
                  <FeedTableRow
                    key={p.id}
                    person={p}
                    rowIndex={safePage * PAGE_SIZE + i}
                    onClick={() => openEntity(p)}
                    isLPR={isLPR}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ── Pagination footer ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 px-4 py-3 border-t border-neutral-100 dark:border-[#1E293B] bg-neutral-50 dark:bg-[#0F172A] shrink-0 relative">
            {/* PREV */}
            <button
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="flex items-center gap-1 h-6 px-2.5 rounded border border-neutral-200 dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[10px] font-bold text-neutral-500 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-[#334155] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-3 h-3" /> PREV
            </button>

            {/* Smart page numbers */}
            <div className="flex items-center gap-0.5">
              {getPaginationItems(safePage, totalPages).map((item, idx) =>
                item === "…" ? (
                  <span key={`ellipsis-${idx}`} className="h-6 w-6 flex items-center justify-center text-[10px] text-neutral-400 dark:text-slate-500 select-none">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    onClick={() => setPage(item)}
                    className={cn(
                      "h-6 w-6 rounded text-[10px] font-bold transition-colors",
                      item === safePage
                        ? "bg-[#00775B] text-white shadow-sm"
                        : "text-neutral-500 dark:text-slate-400 hover:bg-neutral-100 dark:hover:bg-[#1E293B]"
                    )}
                  >
                    {item + 1}
                  </button>
                )
              )}
            </div>

            {/* NEXT */}
            <button
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={safePage === totalPages - 1}
              className="flex items-center gap-1 h-6 px-2.5 rounded bg-[#00775B] text-[10px] font-bold text-white hover:bg-[#006349] disabled:opacity-30 disabled:cursor-not-allowed transition-colors shadow-sm"
            >
              NEXT <ChevronRight className="w-3 h-3" />
            </button>

            {/* Count — absolute right */}
            <span className="absolute right-4 text-[10px] text-neutral-400 dark:text-slate-500">
              Showing <strong className="text-neutral-700 dark:text-slate-300">{safePage * PAGE_SIZE + 1}–{Math.min((safePage + 1) * PAGE_SIZE, filtered.length)}</strong> of <strong className="text-neutral-700 dark:text-slate-300">{filtered.length}</strong> events
            </span>
          </div>
        )}
      </div>

      {/* ── Entity Detail — Hi-Tech Modal (cyberpunk/HUD style) ───────────── */}
      {/* EntityModal (SlidePanel version) is preserved above for reference.   */}
      <HiTechEntityModal
        isOpen={!!modalPerson}
        person={modalPerson}
        journey={modalJourney}
        isLPR={isLPR}
        terminology={terminology}
        groups={groups}
        onClose={() => setModalPersonId(null)}
      />

      {/* ── Zone Detail Slide Panel ───────────────────────────────────────── */}
      <SlidePanel
        isOpen={!!selectedZone}
        onClose={() => setSelectedZoneId(null)}
        title={selectedZone?.zone_name ?? ""}
        subtitle={`${selectedZone ? (selectedZone.status === "CRITICAL" ? "Critical" : selectedZone.status === "WATCH" || selectedZone.status === "ELEVATED" ? "Warning" : "Good") : ""} · ${selectedZone?.identifications ?? 0} ${isLPR ? "plates" : "IDs"}`}
        width="w-[480px]"
      >
        {selectedZone && (() => {
          const isCritical = selectedZone.status === "CRITICAL";
          const isWarning  = selectedZone.status === "WATCH" || selectedZone.status === "ELEVATED";
          const statusLabel = isCritical ? "Critical" : isWarning ? "Warning" : "Good";
          const statusColor = isCritical ? "text-red-700 bg-red-50 border-red-200"
            : isWarning ? "text-orange-700 bg-orange-50 border-orange-200"
            : "text-emerald-700 bg-emerald-50 border-emerald-200";
          const dotColor = isCritical ? "bg-red-600 animate-pulse"
            : isWarning ? "bg-orange-500"
            : "bg-emerald-600";

          const zoneCameras = CAMERA_NODES.filter(c => c.zone === selectedZone.zone_name);
          const zonePeopleAll = people.filter(p => p.zone === selectedZone.zone_name);
          const zonePeople = zonePeopleAll.filter(p =>
            selectedCamera === null || p.camera === selectedCamera
          );

          return (
            <div className="flex flex-col gap-0">

              {/* Status banner */}
              <div className={cn("flex items-center gap-2.5 px-5 py-3 border-b", statusColor)}>
                <span className={cn("w-2.5 h-2.5 rounded-full shrink-0", dotColor)} />
                <span className="text-[11px] font-black uppercase tracking-widest">{statusLabel}</span>
                <span className="ml-auto text-[10px] font-mono opacity-70">{selectedZone.zone_id}</span>
              </div>

              {/* Stat cards */}
              <div className="grid grid-cols-4 divide-x divide-neutral-100 border-b border-neutral-100">
                {[
                  { label: isLPR ? "Plates" : "IDs", value: selectedZone.identifications, color: "text-neutral-900" },
                  { label: "Threats", value: selectedZone.blacklist_hits, color: selectedZone.blacklist_hits > 0 ? "text-red-600" : "text-neutral-400" },
                  { label: "Unknown", value: selectedZone.unknown, color: selectedZone.unknown > 0 ? "text-amber-600" : "text-neutral-400" },
                  { label: "Denied", value: selectedZone.denied, color: selectedZone.denied > 0 ? "text-orange-600" : "text-neutral-400" },
                ].map(stat => (
                  <div key={stat.label} className="flex flex-col items-center py-4 px-2">
                    <span className={cn("text-2xl font-black tabular-nums font-mono", stat.color)}>{stat.value}</span>
                    <span className="text-[9px] font-bold uppercase tracking-widest text-neutral-400 mt-1">{stat.label}</span>
                  </div>
                ))}
              </div>

              {/* Camera list — selectable, from real CAMERA_NODES */}
              {zoneCameras.length > 0 && (
                <div className="px-5 py-4 border-b border-neutral-100">
                  <div className="flex items-center gap-1.5 mb-3">
                    <Camera className="w-3.5 h-3.5 text-[#00775B]" />
                    <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">Cameras</span>
                    <span className="ml-auto text-[9px] text-neutral-400 font-mono">
                      {zoneCameras.filter(c => c.status === "online").length}/{zoneCameras.length} online
                    </span>
                  </div>
                  <div className="space-y-1.5">
                    {/* All Cameras option */}
                    <button
                      onClick={() => setSelectedCamera(null)}
                      className={cn(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-[4px] border transition-colors text-left",
                        selectedCamera === null
                          ? "border-[#00775B]/40 bg-[#E5FFF9]"
                          : "border-neutral-100 bg-neutral-50 hover:bg-neutral-100"
                      )}
                    >
                      <span className="w-2 h-2 rounded-full shrink-0 bg-[#00775B]" />
                      <span className={cn(
                        "text-[10px] font-bold flex-1",
                        selectedCamera === null ? "text-[#00775B]" : "text-neutral-700"
                      )}>All Cameras</span>
                      <span className="text-[9px] text-neutral-400 font-mono">{zonePeopleAll.length} events</span>
                    </button>
                    {/* Individual cameras */}
                    {zoneCameras.map(cam => {
                      const camEvents = people.filter(p => p.camera === cam.id);
                      const isSelected = selectedCamera === cam.id;
                      return (
                        <button
                          key={cam.id}
                          onClick={() => setSelectedCamera(isSelected ? null : cam.id)}
                          className={cn(
                            "w-full flex items-center gap-2 px-2.5 py-2 rounded-[4px] border transition-colors text-left",
                            isSelected
                              ? "border-[#00775B]/40 bg-[#E5FFF9]"
                              : "border-neutral-100 bg-neutral-50 hover:bg-neutral-100"
                          )}
                        >
                          <span className={cn(
                            "w-2 h-2 rounded-full shrink-0",
                            cam.status === "online"   ? "bg-emerald-400"
                            : cam.status === "degraded" ? "bg-amber-400"
                            : "bg-red-400"
                          )} />
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-[10px] font-mono truncate",
                              isSelected ? "text-[#00775B] font-bold" : "text-neutral-700"
                            )}>{cam.id}</p>
                            <p className="text-[8px] text-neutral-400 truncate">{cam.name}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className={cn(
                              "text-[8px] font-bold uppercase",
                              cam.status === "online"   ? "text-emerald-600"
                              : cam.status === "degraded" ? "text-amber-600"
                              : "text-red-500"
                            )}>
                              {cam.status === "online" ? `${cam.fps} fps` : cam.status}
                            </p>
                            {camEvents.length > 0 && (
                              <p className="text-[8px] text-neutral-400 font-mono">{camEvents.length} events</p>
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Live detections in this zone (filtered by selected camera) */}
              <div className="px-5 py-4">
                <div className="flex items-center gap-1.5 mb-3">
                  <Activity className="w-3.5 h-3.5 text-[#00775B]" />
                  <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-500">
                    {selectedCamera ? `${selectedCamera} Events` : "Recent Detections"}
                  </span>
                  {zonePeople.length > 0 && (
                    <span className="ml-auto text-[9px] font-bold text-neutral-400">{zonePeople.length} found</span>
                  )}
                </div>

                {zonePeople.length === 0 ? (
                  <p className="text-[11px] text-neutral-400 text-center py-6">No recent detections in this zone</p>
                ) : (
                  <div className="space-y-2">
                    {zonePeople.map(p => {
                      const cfg = STATUS_CFG[p.status];
                      const isPlate = isLPR || p.identType === "PLATE";
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            setSelectedZoneId(null);
                            openEntity(p);
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-[6px] border border-neutral-100 bg-neutral-50 hover:bg-[#E5FFF9] hover:border-[#00775B]/20 transition-colors text-left"
                        >
                          <div className="w-10 h-10 rounded-[3px] overflow-hidden border border-neutral-200 shrink-0 bg-neutral-100">
                            {isPlate ? (
                              <IdentityEvidenceMedia kind="PLATE" seed={p.id} plateText={p.plateText} imageSrc={p.imageSrc} className="w-full h-full" />
                            ) : (
                              <IdentityEvidenceMedia kind="FACE" seed={p.id} imageSrc={p.imageSrc} className="w-full h-full" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold text-neutral-800 truncate">{p.displayName}</p>
                            <p className="text-[9px] text-neutral-400 font-mono">{p.camera} · {p.time}</p>
                          </div>
                          <span className={cn(
                            "shrink-0 text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-[2px]",
                            cfg.bg, cfg.text
                          )}>
                            {cfg.label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          );
        })()}
      </SlidePanel>

    </div>
  );
};
