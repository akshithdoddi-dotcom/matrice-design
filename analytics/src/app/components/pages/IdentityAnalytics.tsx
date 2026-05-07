import { useEffect, useMemo, useState } from "react";
import { cn } from "@/app/lib/utils";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { IdentityHeader } from "./identity/IdentityHeader";
import { IdentityMonitoringView, ManageModal, WatchlistForm, type WatchlistEntry } from "./identity/IdentityMonitoringView";
import { IdentityManagerView } from "./identity/IdentityManagerView";
import { IdentityDirectorView } from "./identity/IdentityDirectorView";
import { EntityDetailPanel } from "./identity/components/panels/EntityDetailPanel";
import { CameraFeedPanel } from "./identity/components/panels/CameraFeedPanel";

export type IdentityType = "FACE" | "PLATE";

const SAMPLE_WATCHLIST: WatchlistEntry[] = [
  { id: "wl-1",  type: "FR",  name: "Marcus Webb",    reason: "Theft & assault — repeat offender",         severity: "Critical",      cameras: ["CAM-LB-01", "CAM-SE-01"], notes: "Known repeat offender", addedAt: "2026-04-06T08:30:00Z", photo_url: "/people/man3.jpg" },
  { id: "wl-2",  type: "FR",  name: "Unknown #88",    reason: "High-dwell recurring unidentified person",  severity: "High",          cameras: ["CAM-SE-01", "CAM-LB-01"], notes: "11 appearances over 4 days", addedAt: "2026-04-05T14:20:00Z", photo_url: "/people/face_landmark.png" },
  { id: "wl-3",  type: "FR",  name: "James Carter",   reason: "Unauthorized access attempt",               severity: "High",          cameras: ["CAM-NE-01"],              notes: "Attempted restricted zone access", addedAt: "2026-04-04T10:15:00Z", photo_url: "/people/man2.webp" },
  { id: "wl-4",  type: "FR",  name: "Anjali Patel",   reason: "Suspicious loitering near restricted area", severity: "Informational", cameras: ["CAM-RC-01"],              notes: "Observed 3 days in a row", addedAt: "2026-04-03T09:00:00Z", photo_url: "/people/AI-autism_900x600.jpg" },
  { id: "wl-5",  type: "FR",  name: "David Kim",      reason: "BOLO — active law enforcement request",     severity: "Critical",      cameras: ["CAM-PG-01", "CAM-GA-01"], notes: "Coordination with law enforcement", addedAt: "2026-04-02T16:45:00Z", photo_url: "/people/man2.webp" },
  { id: "wl-6",  type: "LPR", name: "KA05MJ4421",     reason: "Stolen vehicle — active alert",             severity: "Critical",      cameras: ["CAM-GA-01", "CAM-GA-02"], notes: "Reported stolen 2026-04-01", plates: "KA05MJ4421", addedAt: "2026-04-06T07:00:00Z" },
  { id: "wl-7",  type: "LPR", name: "MH12AB1234",     reason: "BOLO — armed robbery suspect",              severity: "Critical",      cameras: ["CAM-PG-01", "CAM-GB-01"], notes: "Multiple sightings near facility", plates: "MH12AB1234", addedAt: "2026-04-05T11:30:00Z" },
  { id: "wl-8",  type: "LPR", name: "DL8CAF1234",     reason: "Unregistered — repeated unauthorised entry",severity: "High",          cameras: ["CAM-SE-01"],              notes: "7 entries in past week", plates: "DL8CAF1234", addedAt: "2026-04-04T15:20:00Z" },
  { id: "wl-9",  type: "LPR", name: "TN07CD9876",     reason: "Tailgate detection at south gate",          severity: "High",          cameras: ["CAM-SE-01", "CAM-SE-02"], notes: "Associated with access violation", plates: "TN07CD9876", addedAt: "2026-04-03T08:45:00Z" },
  { id: "wl-10", type: "LPR", name: "AP28EF5678",     reason: "Suspicious parking — 8+ hour dwell",        severity: "Informational", cameras: ["CAM-PG-01"],              notes: "Recurring anomalous dwell pattern", plates: "AP28EF5678", addedAt: "2026-04-02T12:00:00Z" },
];

export interface IdentityAppOption {
  id: string;
  identityType: IdentityType;
  label: string;
  shortLabel: string;
  siteLabel: string;
}

export interface IdentityTerminology {
  identityType: IdentityType;
  appLabel: string;
  entityLabel: string;
  identLabel: string;
  authorizedLabel: string;
  blacklistLabel: string;
  unknownLabel: string;
  unknownShortLabel: string;
  matchScoreLabel: string;
  eventLabel: string;
  watchlistPositiveLabel: string;
  enrollmentLabel: string;
  vipEnabled: boolean;
  isLPR: boolean;
}

export const IDENTITY_APP_OPTIONS: IdentityAppOption[] = [
  {
    id: "facial-hq",
    identityType: "FACE",
    label: "Facial Recognition – HQ Main Entrance",
    shortLabel: "HQ Main Entrance",
    siteLabel: "HQ Main Campus",
  },
  {
    id: "facial-gate-b",
    identityType: "FACE",
    label: "Facial Recognition – Gate B",
    shortLabel: "Gate B",
    siteLabel: "HQ Main Campus",
  },
  {
    id: "lpr-gate-a",
    identityType: "PLATE",
    label: "License Plate Recognition – Gate A",
    shortLabel: "Gate A",
    siteLabel: "HQ Parking Garage",
  },
  {
    id: "lpr-parking",
    identityType: "PLATE",
    label: "License Plate Recognition – Parking Lot",
    shortLabel: "Parking Lot",
    siteLabel: "HQ Parking Garage",
  },
];

function getTerminology(identityType: IdentityType): IdentityTerminology {
  if (identityType === "PLATE") {
    return {
      identityType,
      appLabel: "License Plate Recognition",
      entityLabel: "Vehicle",
      identLabel: "Plate Read",
      authorizedLabel: "Authorized",
      blacklistLabel: "Stolen / Unauthorized",
      unknownLabel: "Unregistered Plate",
      unknownShortLabel: "Unregistered",
      matchScoreLabel: "OCR Confidence",
      eventLabel: "Plate Event",
      watchlistPositiveLabel: "BOLO Match",
      enrollmentLabel: "Registered Vehicles",
      vipEnabled: false,
      isLPR: true,
    };
  }

  return {
    identityType,
    appLabel: "Facial Recognition",
    entityLabel: "Individual",
    identLabel: "Identification",
    authorizedLabel: "Whitelist",
    blacklistLabel: "Blacklist",
    unknownLabel: "Unrecognized Face",
    unknownShortLabel: "Unknown",
    matchScoreLabel: "Face Similarity",
    eventLabel: "Identity Event",
    watchlistPositiveLabel: "VIP Match",
    enrollmentLabel: "Enrolled Individuals",
    vipEnabled: true,
    isLPR: false,
  };
}

const DEFAULT_TIME_RANGE: Record<Persona, string> = {
  monitoring: "1h",
  manager: "Today",
  director: "This Month",
};

interface IdentityAnalyticsProps {
  persona: Persona;
}

// ─── Types ────────────────────────────────────────────────────────────────────
export interface GroupConfig {
  name: string;
  emails: string[];
}

const DEFAULT_GROUPS: GroupConfig[] = [
  { name: "Security Team", emails: [] },
  { name: "Operations Manager", emails: [] },
  { name: "Site Supervisor", emails: [] },
  { name: "Executive Team", emails: [] },
  { name: "Dispatch Center", emails: [] },
];

export const IdentityAnalytics = ({ persona }: IdentityAnalyticsProps) => {
  const [identityType, setIdentityType] = useState<IdentityType>("FACE");
  const [activeAppId, setActiveAppId] = useState("facial-hq");
  const [timeRange, setTimeRange] = useState(DEFAULT_TIME_RANGE[persona]);

  // Manage modal state
  const [manageOpen, setManageOpen] = useState(false);

  // Groups + watchlist state
  const [configuredGroups, setConfiguredGroups] = useState<GroupConfig[]>(DEFAULT_GROUPS);
  const [watchlistEntries, setWatchlistEntries] = useState<WatchlistEntry[]>(SAMPLE_WATCHLIST);

  const handleWatchlistAdd = (entry: WatchlistEntry) =>
    setWatchlistEntries(prev => [entry, ...prev]);

  // Panel / modal state
  const [entityPanelOpen, setEntityPanelOpen] = useState(false);
  const [entityType, setEntityType] = useState<"matched" | "unknown" | "blacklist">("matched");
  const [selectedPersonId, setSelectedPersonId] = useState<string | undefined>(undefined);
  const [cameraFeedOpen, setCameraFeedOpen] = useState(false);
  const [cameraId, setCameraId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTimeRange(DEFAULT_TIME_RANGE[persona]);
  }, [persona]);

  useEffect(() => {
    const app = IDENTITY_APP_OPTIONS.find((option) => option.id === activeAppId);
    if (app && app.identityType !== identityType) {
      const fallback = IDENTITY_APP_OPTIONS.find(
        (option) => option.identityType === identityType
      );
      if (fallback) setActiveAppId(fallback.id);
    }
  }, [activeAppId, identityType]);

  const activeApp = useMemo(
    () =>
      IDENTITY_APP_OPTIONS.find((option) => option.id === activeAppId) ??
      IDENTITY_APP_OPTIONS[0],
    [activeAppId]
  );

  const terminology = useMemo(
    () => getTerminology(identityType),
    [identityType]
  );

  // Panel open helpers
  const openEntityPanel = (type: "matched" | "unknown" | "blacklist" = "matched", personId?: string) => {
    setEntityType(type);
    setSelectedPersonId(personId);
    setEntityPanelOpen(true);
  };
  const openCameraFeed = (id?: string) => {
    setCameraId(id);
    setCameraFeedOpen(true);
  };

  return (
    <div className="space-y-3">
      {/* ── Header card ───────────────────────────────────────────────── */}
      <IdentityHeader
        persona={persona}
        identityType={identityType}
        terminology={terminology}
        activeApp={activeApp}
        onIdentityTypeChange={setIdentityType}
        onAppChange={setActiveAppId}
        timeRange={timeRange}
        onTimeRangeChange={setTimeRange}
        onManage={() => setManageOpen(true)}
      />

      {/* Manage People / Vehicles modal */}
      <ManageModal
        isOpen={manageOpen}
        isLPR={terminology.isLPR}
        onClose={() => setManageOpen(false)}
        onWatchlistAdd={handleWatchlistAdd}
        watchlistEntries={watchlistEntries}
        onUpdateEntries={setWatchlistEntries}
      />

      {/* ── Persona views ─────────────────────────────────────────────── */}
      {persona === "monitoring" && (
        <IdentityMonitoringView
          terminology={terminology}
          groups={configuredGroups.map(g => g.name)}
          timeRange={timeRange}
          activeApp={activeApp}
          onEntityClick={openEntityPanel}
          onCameraClick={openCameraFeed}
        />
      )}

      {persona === "manager" && (
        <IdentityManagerView
          terminology={terminology}
          timeRange={timeRange}
          activeApp={activeApp}
        />
      )}

      {persona === "director" && (
        <IdentityDirectorView
          terminology={terminology}
          timeRange={timeRange}
          activeApp={activeApp}
        />
      )}

      {/* ── Slide panels & modal ──────────────────────────────────────── */}
      <EntityDetailPanel
        isOpen={entityPanelOpen}
        onClose={() => setEntityPanelOpen(false)}
        entityType={entityType}
        personId={selectedPersonId}
        groups={configuredGroups.map(g => g.name)}
        mode={terminology.isLPR ? "lpr" : "face"}
      />

      <CameraFeedPanel
        isOpen={cameraFeedOpen}
        onClose={() => setCameraFeedOpen(false)}
        cameraId={cameraId}
        onDetectionClick={() => {
          setCameraFeedOpen(false);
          openEntityPanel("matched");
        }}
      />

    </div>
  );
};
