import { useEffect, useMemo, useState } from "react";
import type { Persona } from "@/app/components/dashboard/PersonaSwitcher";
import { IdentityHeader } from "./identity/IdentityHeader";
import { IdentityMonitoringView } from "./identity/IdentityMonitoringView";
import { IdentityManagerView } from "./identity/IdentityManagerView";
import { IdentityDirectorView } from "./identity/IdentityDirectorView";
import { EntityDetailPanel } from "./identity/components/panels/EntityDetailPanel";
import { CameraFeedPanel } from "./identity/components/panels/CameraFeedPanel";
import { CrossCameraModal } from "./identity/components/panels/CrossCameraModal";

export type IdentityType = "FACE" | "PLATE";

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

export const IdentityAnalytics = ({ persona }: IdentityAnalyticsProps) => {
  const [identityType, setIdentityType] = useState<IdentityType>("FACE");
  const [activeAppId, setActiveAppId] = useState("facial-hq");
  const [timeRange, setTimeRange] = useState(DEFAULT_TIME_RANGE[persona]);

  // Panel / modal state
  const [entityPanelOpen, setEntityPanelOpen] = useState(false);
  const [entityType, setEntityType] = useState<"matched" | "unknown" | "blacklist">("matched");
  const [cameraFeedOpen, setCameraFeedOpen] = useState(false);
  const [cameraId, setCameraId] = useState<string | undefined>(undefined);
  const [journeyOpen, setJourneyOpen] = useState(false);

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
  const openEntityPanel = (type: "matched" | "unknown" | "blacklist" = "matched") => {
    setEntityType(type);
    setEntityPanelOpen(true);
  };
  const openCameraFeed = (id?: string) => {
    setCameraId(id);
    setCameraFeedOpen(true);
  };
  const openJourney = () => {
    setEntityPanelOpen(false);
    setJourneyOpen(true);
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
      />

      {/* ── Persona views ─────────────────────────────────────────────── */}
      {persona === "monitoring" && (
        <IdentityMonitoringView
          terminology={terminology}
          timeRange={timeRange}
          activeApp={activeApp}
          onEntityClick={openEntityPanel}
          onCameraClick={openCameraFeed}
          onJourneyClick={openJourney}
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
        onViewJourney={openJourney}
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

      <CrossCameraModal
        isOpen={journeyOpen}
        onClose={() => setJourneyOpen(false)}
      />
    </div>
  );
};
