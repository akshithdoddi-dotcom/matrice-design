/**
 * IncidentCardV12Sheet — Design system sheet v1.2
 *
 * Dimension spec:
 *   Card:            260 × 200 px
 *   Header plate:    52 px tall
 *   Image plate:     148 px tall  (200 − 52)
 *   Overlay tags:    h-6 (24 px), rounded-[2px], Inter Bold 10px
 *
 * Visual changes from v1.1:
 *   • Time / ID opacity raised (0.95 / 0.88)
 *   • Overlays match production dashboard: bg-black/80 backdrop-blur rounded-[2px] px-2, h-6
 *   • Status tag: text-only, no icon
 *   • Unassigned badge: filled AlertTriangle, severity color, animate-pulse, rounded-[2px] h-6
 *   • Assignee chip:    User icon, same plate style, h-6
 *   • Hover Escalate:   filled AlertTriangle, severity color, neutral dark bg
 *   • Hover Resolve:    Matrice teal #00775B
 */

import { User, Users, AlertTriangle, Check } from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Typography ───────────────────────────────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace" };
const SANS: React.CSSProperties = { fontFamily: "'Inter',sans-serif" };

// ─── Shared card data ─────────────────────────────────────────────────────────
const CARD_TITLE     = "FIRE / FLAME DETECTION";
const CARD_TIMESTAMP = "17:38 PM";
const CARD_ID        = "INC-3051";
const CARD_CAMERA    = "Cam-W01";
const CARD_LOCATION  = "Warehouse Zone A";
const CARD_IMAGE     = "https://images.unsplash.com/photo-1566931333278-f604cfaab7ec?w=480&q=70";
const STAFF_NAMES = ["Priya M.", "Jordan K.", "Liam T.", "Aisha R.", "Carlos V.", "Mei L."];

// ─── Overlay plate — shared style for camera / location / assignee / unassigned
// h-6 (24px), rounded-[2px], bg-black/80, backdrop-blur, Inter Bold 10px
// ─────────────────────────────────────────────────────────────────────────────
const PLATE_STYLE: React.CSSProperties = {
  height:          "24px",
  padding:         "0 8px",
  borderRadius:    "2px",
  backgroundColor: "rgba(0,0,0,0.80)",
  backdropFilter:  "blur(6px)",
  display:         "inline-flex",
  alignItems:      "center",
};
const PLATE_TEXT: React.CSSProperties = {
  ...SANS,
  fontSize:   "10px",
  fontWeight: 700,
  color:      "#FFFFFF",
  lineHeight: 1,
  whiteSpace: "nowrap" as const,
};

// ─── Status tag — text only, no icon ─────────────────────────────────────────
function StatusTag({ label }: { label: string }) {
  return (
    <span
      style={{
        ...SANS,
        fontSize:        "11px",
        fontWeight:      600,
        color:           "#1E293B",
        backgroundColor: "#FFFFFF",
        borderRadius:    "4px",
        padding:         "2px 8px",
        whiteSpace:      "nowrap" as const,
        lineHeight:      1.4,
        flexShrink:      0,
      }}
    >
      {label}
    </span>
  );
}

// ─── Header plate (52 px tall) ────────────────────────────────────────────────
function HeaderPlate({ bgClass, statusLabel }: { bgClass: string; statusLabel: string }) {
  return (
    <div className={cn("flex flex-col justify-center px-3 gap-1", bgClass)} style={{ height: "52px" }}>
      {/* Top row: title + status tag */}
      <div className="flex items-center justify-between gap-2">
        <span className="truncate" style={{ ...SANS, fontSize: "12px", fontWeight: 700, color: "#FFFFFF", letterSpacing: "0.01em" }}>
          {CARD_TITLE}
        </span>
        <StatusTag label={statusLabel} />
      </div>
      {/* Bottom row: timestamp + ID — high opacity for legibility */}
      <div className="flex items-center justify-between">
        <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.95)" }}>{CARD_TIMESTAMP}</span>
        <span style={{ ...MONO, fontSize: "11px", color: "rgba(255,255,255,0.88)" }}>{CARD_ID}</span>
      </div>
    </div>
  );
}

// ─── Overlay tags ─────────────────────────────────────────────────────────────
function CameraTag() {
  return (
    <div className="absolute top-2 left-2 z-10" style={PLATE_STYLE}>
      <span style={PLATE_TEXT}>{CARD_CAMERA}</span>
    </div>
  );
}
function LocationTag() {
  return (
    <div className="absolute top-2 right-2 z-10" style={PLATE_STYLE}>
      <span style={PLATE_TEXT}>{CARD_LOCATION}</span>
    </div>
  );
}

// ─── Assignee chip — teal plate, User icon, staff name, no animation ─────────
function AssigneeChip({ name }: { name: string }) {
  return (
    <div
      className="absolute bottom-2 right-2 z-10 inline-flex items-center gap-1.5"
      style={{ height: "24px", padding: "0 8px", borderRadius: "2px", backgroundColor: "#00775B" }}
    >
      <User style={{ width: "11px", height: "11px", color: "#FFFFFF", flexShrink: 0 }} />
      <span style={{ ...SANS, fontSize: "10px", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" as const }}>
        {name}
      </span>
    </div>
  );
}

// ─── Unassigned badge — severity-colored tag + radiation ping ring ────────────
// Tag: severity bg, white-filled AlertTriangle (exclamation in severity color), "Un-Assigned" text
// Ping: same severity color expands outward as a radiation halo
function UnassignedBadge({ severityColor }: { severityColor: string }) {
  return (
    <div className="absolute bottom-2 right-2 z-10">
      <div
        className="inline-flex items-center gap-1.5"
        style={{ height: "24px", padding: "0 8px", borderRadius: "2px", backgroundColor: severityColor }}
      >
        {/* White fill, severity-colored outline + exclamation */}
        <AlertTriangle
          style={{ width: "11px", height: "11px", fill: "#FFFFFF", color: severityColor, flexShrink: 0 }}
        />
        <span style={{ ...SANS, fontSize: "10px", fontWeight: 700, color: "#FFFFFF", whiteSpace: "nowrap" as const }}>
          Un-Assigned
        </span>
      </div>
    </div>
  );
}

// ─── Image plate (148 px tall) ────────────────────────────────────────────────
function ImagePlate({ isUnassigned, severityColor, assigneeName }: { isUnassigned: boolean; severityColor: string; assigneeName: string }) {
  return (
    <div className="relative overflow-hidden" style={{ height: "148px" }}>
      <img src={CARD_IMAGE} alt="Incident scene" className="w-full h-full object-cover" />
      <CameraTag />
      <LocationTag />
      {isUnassigned
        ? <UnassignedBadge severityColor={severityColor} />
        : <AssigneeChip name={assigneeName} />}
    </div>
  );
}

// ─── Hover overlay — circular icon-only buttons ───────────────────────────────
// Condition A: [ User ] [ Users ]   (Detected / Unassigned)
// Condition B: [ AlertTriangle★ ] [ Check ]  (In Progress / Escalated)
//   ★ AlertTriangle is filled and severity-colored
function HoverOverlay({ actionCondition, severityColor }: { actionCondition: "A" | "B"; severityColor: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col justify-end bg-gradient-to-t from-black/80 via-black/40 to-transparent">
      <div className="flex items-center justify-center gap-4 pb-4">
        {actionCondition === "A" ? (
          <>
            {/* Self-assign */}
            <button
              className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)" }}
              title="Self Assign"
            >
              <User style={{ width: "18px", height: "18px", color: "#1E293B" }} />
            </button>
            {/* Assign to others */}
            <button
              className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "rgba(255,255,255,0.92)", backdropFilter: "blur(4px)" }}
              title="Assign to Others"
            >
              <Users style={{ width: "18px", height: "18px", color: "#1E293B" }} />
            </button>
          </>
        ) : (
          <>
            {/* Escalate — bg = severityColor, triangle body = white, outline/! = severityColor */}
            <button
              className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: severityColor }}
              title="Escalate"
            >
              <AlertTriangle
                style={{ width: "20px", height: "20px", fill: "#FFFFFF", color: severityColor }}
              />
            </button>
            {/* Resolve — Matrice primary teal */}
            <button
              className="h-11 w-11 rounded-full flex items-center justify-center shadow-lg"
              style={{ backgroundColor: "#00775B" }}
              title="Resolve"
            >
              <Check style={{ width: "18px", height: "18px", color: "#FFFFFF" }} strokeWidth={3} />
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────
interface IncidentCardV12Props {
  headerBg:        string;
  statusLabel:     string;
  isUnassigned:    boolean;
  isResolved:      boolean;
  isHovered:       boolean;
  actionCondition: "A" | "B";
  severityColor:   string;
  assigneeName?:   string;
}

function IncidentCardV12({ headerBg, statusLabel, isUnassigned, isResolved, isHovered, actionCondition, severityColor, assigneeName = "Staff_04" }: IncidentCardV12Props) {
  return (
    <div
      className={cn(
        "rounded-sm border border-neutral-200 shadow-sm overflow-hidden flex flex-col shrink-0",
        isResolved && "opacity-60",
      )}
      style={{ width: "260px" }}
    >
      <HeaderPlate bgClass={headerBg} statusLabel={statusLabel} />
      <div className="relative">
        <ImagePlate isUnassigned={isUnassigned} severityColor={severityColor} assigneeName={assigneeName} />
        {isHovered && <HoverOverlay actionCondition={actionCondition} severityColor={severityColor} />}
      </div>
    </div>
  );
}

// ─── Sheet helpers ────────────────────────────────────────────────────────────
function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p style={{ ...SANS, fontSize: "11px", fontWeight: 700, textTransform: "uppercase" as const, letterSpacing: "0.08em", color: "#94A3B8", marginBottom: "8px" }}>{children}</p>
      <hr className="border-neutral-200" />
    </div>
  );
}
function VariantChip({ label }: { label: string }) {
  return <p style={{ ...SANS, fontSize: "10px", color: "#94A3B8", marginTop: "6px", textAlign: "center" as const }}>{label}</p>;
}
function ColLabel({ children }: { children: React.ReactNode }) {
  return <p style={{ ...SANS, fontSize: "10px", fontWeight: 600, color: "#64748B", textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "6px", textAlign: "center" as const }}>{children}</p>;
}
function SeverityRow({ color, label }: { color: string; label: string }) {
  return <p style={{ ...SANS, fontSize: "11px", fontWeight: 700, color, textTransform: "uppercase" as const, letterSpacing: "0.06em", marginBottom: "4px", textAlign: "center" as const }}>• {label}</p>;
}

// ─── Severity color map ───────────────────────────────────────────────────────
const SEV = {
  critical: "#DC2626",
  high:     "#EA580C",
  medium:   "#475569",
  resolved: "#475569",
};

// ─── Page export ──────────────────────────────────────────────────────────────
export function IncidentCardV12Sheet() {
  return (
    <div className="min-h-screen" style={{ backgroundColor: "#F8FAFC", padding: "32px" }}>

      {/* Version header */}
      <div className="mb-10">
        <p style={{ ...MONO, fontSize: "11px", color: "#64748B", letterSpacing: "0.04em" }}>
          v1.2 — 260×200 · Production-matched overlays · Severity-colored indicators · Circular hover actions
        </p>
      </div>

      {/* ── SECTION A: Threat Severity Matrix ─────────────────────────────────── */}
      <div className="mb-14">
        <SectionHeading>A — Threat Severity Matrix (Resting vs Hovered)</SectionHeading>
        <div className="flex flex-wrap gap-10 items-start">

          {/* Critical */}
          <div className="flex flex-col items-center">
            <SeverityRow color={SEV.critical} label="Critical" />
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <ColLabel>Resting</ColLabel>
                <IncidentCardV12
                  headerBg="bg-red-600" statusLabel="Escalated"
                  isUnassigned={false} isResolved={false} isHovered={false}
                  actionCondition="B" severityColor={SEV.critical} assigneeName={STAFF_NAMES[0]}
                />
                <VariantChip label="Critical · Assigned · Rest" />
              </div>
              <div className="flex flex-col items-center">
                <ColLabel>Hovered</ColLabel>
                <IncidentCardV12
                  headerBg="bg-red-600" statusLabel="Escalated"
                  isUnassigned={false} isResolved={false} isHovered={true}
                  actionCondition="B" severityColor={SEV.critical} assigneeName={STAFF_NAMES[0]}
                />
                <VariantChip label="Critical · Assigned · Hover" />
              </div>
            </div>
          </div>

          {/* High */}
          <div className="flex flex-col items-center">
            <SeverityRow color={SEV.high} label="High" />
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <ColLabel>Resting</ColLabel>
                <IncidentCardV12
                  headerBg="bg-[#EA580C]" statusLabel="In Progress"
                  isUnassigned={false} isResolved={false} isHovered={false}
                  actionCondition="B" severityColor={SEV.high} assigneeName={STAFF_NAMES[1]}
                />
                <VariantChip label="High · Assigned · Rest" />
              </div>
              <div className="flex flex-col items-center">
                <ColLabel>Hovered</ColLabel>
                <IncidentCardV12
                  headerBg="bg-[#EA580C]" statusLabel="In Progress"
                  isUnassigned={false} isResolved={false} isHovered={true}
                  actionCondition="B" severityColor={SEV.high} assigneeName={STAFF_NAMES[1]}
                />
                <VariantChip label="High · Assigned · Hover" />
              </div>
            </div>
          </div>

          {/* Medium — Unassigned to show badge */}
          <div className="flex flex-col items-center">
            <SeverityRow color={SEV.medium} label="Medium" />
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <ColLabel>Resting</ColLabel>
                <IncidentCardV12
                  headerBg="bg-slate-600" statusLabel="Detected"
                  isUnassigned={true} isResolved={false} isHovered={false}
                  actionCondition="A" severityColor={SEV.medium}
                />
                <VariantChip label="Medium · Unassigned · Rest" />
              </div>
              <div className="flex flex-col items-center">
                <ColLabel>Hovered</ColLabel>
                <IncidentCardV12
                  headerBg="bg-slate-600" statusLabel="Detected"
                  isUnassigned={true} isResolved={false} isHovered={true}
                  actionCondition="A" severityColor={SEV.medium}
                />
                <VariantChip label="Medium · Unassigned · Hover" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION B: Operational Lifecycle States ───────────────────────────── */}
      <div className="mb-14">
        <SectionHeading>B — Operational Lifecycle States</SectionHeading>
        <div className="flex flex-wrap gap-6 items-start">

          {/* Assigned + In Progress */}
          <div className="flex flex-col items-center">
            <IncidentCardV12
              headerBg="bg-red-600" statusLabel="In Progress"
              isUnassigned={false} isResolved={false} isHovered={false}
              actionCondition="B" severityColor={SEV.critical} assigneeName={STAFF_NAMES[2]}
            />
            <VariantChip label="Assigned · In Progress" />
          </div>

          {/* Unassigned + Detected — Critical severity badge */}
          <div className="flex flex-col items-center">
            <IncidentCardV12
              headerBg="bg-red-600" statusLabel="Detected"
              isUnassigned={true} isResolved={false} isHovered={false}
              actionCondition="A" severityColor={SEV.critical}
            />
            <VariantChip label="Unassigned · Detected · Critical" />
          </div>

          {/* Unassigned + Detected — High severity badge */}
          <div className="flex flex-col items-center">
            <IncidentCardV12
              headerBg="bg-[#EA580C]" statusLabel="Detected"
              isUnassigned={true} isResolved={false} isHovered={false}
              actionCondition="A" severityColor={SEV.high}
            />
            <VariantChip label="Unassigned · Detected · High" />
          </div>

          {/* Soft Resolved (AI) */}
          <div className="flex flex-col items-center">
            <IncidentCardV12
              headerBg="bg-slate-700" statusLabel="Soft Resolved"
              isUnassigned={false} isResolved={true} isHovered={false}
              actionCondition="B" severityColor={SEV.resolved} assigneeName={STAFF_NAMES[4]}
            />
            <VariantChip label="Soft Resolved (AI)" />
          </div>

          {/* Hard Resolved (Operator) */}
          <div className="flex flex-col items-center">
            <IncidentCardV12
              headerBg="bg-slate-800" statusLabel="Hard Resolved"
              isUnassigned={false} isResolved={true} isHovered={false}
              actionCondition="B" severityColor={SEV.resolved} assigneeName={STAFF_NAMES[5]}
            />
            <VariantChip label="Hard Resolved (Operator)" />
          </div>

        </div>
      </div>

    </div>
  );
}
