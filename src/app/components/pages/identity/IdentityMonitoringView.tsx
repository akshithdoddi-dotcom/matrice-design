import { LiveStatusBar } from "./components/monitoring/LiveStatusBar";
import { IdentRatePanel } from "./components/monitoring/IdentRatePanel";
import { BlacklistUnknownPanel } from "./components/monitoring/BlacklistUnknownPanel";
import { ListMembershipPanel } from "./components/monitoring/ListMembershipPanel";
import { ConfidenceHistPanel } from "./components/monitoring/ConfidenceHistPanel";
import { LiveEventFeedPanel } from "./components/monitoring/LiveEventFeedPanel";
import { ZoneActivityPanel } from "./components/monitoring/ZoneActivityPanel";
import { AccessDeniedPanel } from "./components/monitoring/AccessDeniedPanel";
import { VIPTickerPanel } from "./components/monitoring/VIPTickerPanel";
import { UnknownTrackerPanel } from "./components/monitoring/UnknownTrackerPanel";
import { CrossCameraPanel } from "./components/monitoring/CrossCameraPanel";
import { PlateAccuracyPanel } from "./components/monitoring/PlateAccuracyPanel";
import { VehicleAuthPanel } from "./components/monitoring/VehicleAuthPanel";
import type { IdentityTerminology } from "./data/types";
import type { IdentityAppOption } from "../IdentityAnalytics";

interface Props {
  terminology: IdentityTerminology;
  timeRange: string;
  activeApp: IdentityAppOption;
  onEntityClick?: (type: "matched" | "unknown" | "blacklist") => void;
  onCameraClick?: (cameraId?: string) => void;
  onJourneyClick?: () => void;
}

export const IdentityMonitoringView = ({
  terminology,
  timeRange: _timeRange,
  activeApp: _activeApp,
  onEntityClick,
  onCameraClick,
  onJourneyClick,
}: Props) => (
  <div className="flex flex-col gap-3 bg-neutral-50 min-h-full">
    {/* Pinned live status bar */}
    <LiveStatusBar terminology={terminology} />

    {/* Row 1: Rate + Threat counters */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <IdentRatePanel terminology={terminology} />
      <BlacklistUnknownPanel terminology={terminology} />
    </div>

    {/* Row 2: List membership + Confidence histogram */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <ListMembershipPanel terminology={terminology} />
      <ConfidenceHistPanel terminology={terminology} />
    </div>

    {/* Zone activity — full width (click camera cell → camera feed panel) */}
    <ZoneActivityPanel terminology={terminology} onCameraClick={onCameraClick} />

    {/* Row 3: Access denied + Live event feed */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      <AccessDeniedPanel terminology={terminology} />
      <LiveEventFeedPanel terminology={terminology} onEntityClick={onEntityClick} />
    </div>

    {/* Row 4: VIP ticker + Unknown tracker */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {!terminology.isLPR && <VIPTickerPanel terminology={terminology} />}
      <UnknownTrackerPanel terminology={terminology} onTrackerClick={() => onEntityClick?.("unknown")} />
    </div>

    {/* Cross-camera tracking — full width */}
    <CrossCameraPanel terminology={terminology} onJourneyClick={onJourneyClick} />

    {/* LPR-only panels */}
    {terminology.isLPR && (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <PlateAccuracyPanel terminology={terminology} />
        <VehicleAuthPanel terminology={terminology} />
      </div>
    )}
  </div>
);
