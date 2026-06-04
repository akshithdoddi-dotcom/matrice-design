/**
 * IncidentCardV11Sheet — Design system sheet v1.1
 *
 * Purely presentational. Zero state. No external data dependencies.
 *
 * Sections:
 *   A. Threat Severity Matrix — resting vs hovered side-by-side pairs
 *   B. Operational Lifecycle States — 4 resting cards
 *
 * Card structure changes from v1.0:
 *   - 12px Bold title (down from 14px)
 *   - Solid-white status tag in header (not a pill with border)
 *   - Image overlays: camera top-left, location top-right, NO LIVE badge
 *   - Bottom-right quadrant: assignment chip (assigned) or animated ping badge (unassigned)
 *   - Hover overlay: gradient mask + contextual action buttons (isHovered prop)
 *   - No separate footer strip — card ends at bottom of image
 */

import { cn } from "@/app/lib/utils";

// ─── Typography tokens ────────────────────────────────────────────────────────
const MONO: React.CSSProperties = {
  fontFamily: "'JetBrains Mono','Fira Code','Cascadia Code',monospace",
};
const SANS: React.CSSProperties = {
  fontFamily: "'Inter',sans-serif",
};

// ─── Shared card data ─────────────────────────────────────────────────────────
const CARD_TITLE = "FIRE / FLAME DETECTION";
const CARD_TIMESTAMP = "17:38 PM";
const CARD_ID = "INC-3051";
const CARD_CAMERA = "CAM-W01";
const CARD_LOCATION = "Warehouse Zone A";
const CARD_IMAGE =
  "https://images.unsplash.com/photo-1566931333278-f604cfaab7ec?w=480&q=70";
const CARD_ASSIGNEE = "Staff_04";

// ─── Sub-components ───────────────────────────────────────────────────────────

/** Solid-white status tag rendered inside the colored header */
function StatusTag({ label }: { label: string }) {
  return (
    <span
      style={{
        ...SANS,
        fontSize: "11px",
        fontWeight: 500,
        color: "#1E293B",
        backgroundColor: "#FFFFFF",
        borderRadius: "4px",
        padding: "2px 8px",
        whiteSpace: "nowrap" as const,
        lineHeight: 1.4,
      }}
    >
      {label}
    </span>
  );
}

/** Header plate — severity-colored, h-[52px], two rows */
function HeaderPlate({
  bgClass,
  statusLabel,
}: {
  bgClass: string;
  statusLabel: string;
}) {
  return (
    <div
      className={cn("flex flex-col justify-center px-3 py-2 gap-0.5", bgClass)}
      style={{ height: "52px" }}
    >
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <span
          style={{
            ...SANS,
            fontSize: "12px",
            fontWeight: 700,
            color: "#FFFFFF",
            letterSpacing: "0.01em",
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap" as const,
            flex: 1,
          }}
        >
          {CARD_TITLE}
        </span>
        <StatusTag label={statusLabel} />
      </div>
      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span
          style={{
            ...MONO,
            fontSize: "11px",
            color: "rgba(255,255,255,0.75)",
          }}
        >
          {CARD_TIMESTAMP}
        </span>
        <span
          style={{
            ...MONO,
            fontSize: "11px",
            color: "rgba(255,255,255,0.60)",
          }}
        >
          {CARD_ID}
        </span>
      </div>
    </div>
  );
}

/**
 * Unassigned ping badge — orange circle with animate-ping ring.
 * Scale varies by severity (passed as a Tailwind scale class).
 */
function UnassignedBadge({ scaleClass = "scale-100" }: { scaleClass?: string }) {
  return (
    <div className={cn("relative w-7 h-7 flex items-center justify-center", scaleClass)}>
      {/* Ping ring */}
      <span className="animate-ping absolute inset-0 rounded-full bg-orange-400/50" />
      {/* Solid circle */}
      <span className="relative z-10 w-7 h-7 bg-orange-500/90 rounded-full flex items-center justify-center">
        <span
          style={{
            ...SANS,
            fontSize: "10px",
            fontWeight: 700,
            color: "#FFFFFF",
            lineHeight: 1,
          }}
        >
          !
        </span>
      </span>
    </div>
  );
}

/** Image plate — 140px, camera top-left, location top-right, assignment bottom-right */
function ImagePlate({
  isUnassigned,
  unassignedScale = "scale-100",
}: {
  isUnassigned: boolean;
  unassignedScale?: string;
}) {
  return (
    <div className="relative overflow-hidden" style={{ height: "140px" }}>
      <img
        src={CARD_IMAGE}
        alt="Incident scene"
        className="w-full h-full object-cover"
      />

      {/* TOP-LEFT: Camera ID pill */}
      <div
        className="absolute top-2 left-2 rounded px-1.5 py-0.5"
        style={{ backgroundColor: "rgba(0,0,0,0.70)" }}
      >
        <span
          style={{
            ...MONO,
            fontSize: "10px",
            color: "#FFFFFF",
            lineHeight: 1.4,
          }}
        >
          {CARD_CAMERA}
        </span>
      </div>

      {/* TOP-RIGHT: Location pill */}
      <div
        className="absolute top-2 right-2 rounded px-1.5 py-0.5"
        style={{ backgroundColor: "rgba(0,0,0,0.70)" }}
      >
        <span
          style={{
            ...SANS,
            fontSize: "10px",
            color: "#FFFFFF",
            lineHeight: 1.4,
          }}
        >
          {CARD_LOCATION}
        </span>
      </div>

      {/* BOTTOM-RIGHT: Assignment state */}
      <div className="absolute bottom-2 right-2">
        {isUnassigned ? (
          <UnassignedBadge scaleClass={unassignedScale} />
        ) : (
          <div
            className="rounded-full px-2 py-1 flex items-center gap-1"
            style={{ backgroundColor: "rgba(0,0,0,0.60)" }}
          >
            <span style={{ ...SANS, fontSize: "10px", color: "#FFFFFF" }}>
              👤 {CARD_ASSIGNEE}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

/** Hover overlay — gradient mask + contextual action buttons */
function HoverOverlay({ actionCondition }: { actionCondition: "A" | "B" }) {
  return (
    <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/85 via-black/50 to-transparent">
      <div className="flex gap-2 p-2">
        {actionCondition === "A" ? (
          <>
            <button
              className="flex-1 h-8 rounded border border-white/30 bg-white/15 hover:bg-white/25 transition-colors"
              style={{ ...SANS, fontSize: "11px", color: "#FFFFFF" }}
            >
              👤 Self Assign
            </button>
            <button
              className="flex-1 h-8 rounded border border-white/30 bg-white/15 hover:bg-white/25 transition-colors"
              style={{ ...SANS, fontSize: "11px", color: "#FFFFFF" }}
            >
              👥 Assign to Others
            </button>
          </>
        ) : (
          <>
            <button
              className="flex-1 h-8 rounded border border-transparent bg-orange-500/80 hover:bg-orange-500 transition-colors"
              style={{ ...SANS, fontSize: "11px", color: "#FFFFFF" }}
            >
              ⚠️ Escalate
            </button>
            <button
              className="flex-1 h-8 rounded border border-transparent bg-emerald-600/80 hover:bg-emerald-600 transition-colors"
              style={{ ...SANS, fontSize: "11px", color: "#FFFFFF" }}
            >
              ✓ Resolve
            </button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main card component ──────────────────────────────────────────────────────

interface IncidentCardV11Props {
  /** Tailwind bg class for the header plate */
  headerBg: string;
  /** Status label rendered in the solid-white tag */
  statusLabel: string;
  /** Show unassigned badge instead of assignee chip */
  isUnassigned: boolean;
  /** Wrap in opacity-60 for resolved visual state */
  isResolved: boolean;
  /** Force hover overlay to be visible (for static sheet display) */
  isHovered: boolean;
  /** Which set of action buttons to render in the hover overlay */
  actionCondition: "A" | "B";
  /** Scale modifier for unassigned ping badge */
  unassignedScale?: string;
}

function IncidentCardV11({
  headerBg,
  statusLabel,
  isUnassigned,
  isResolved,
  isHovered,
  actionCondition,
  unassignedScale = "scale-100",
}: IncidentCardV11Props) {
  return (
    <div
      className={cn(
        "rounded-sm border border-neutral-200 shadow-sm overflow-hidden flex flex-col shrink-0",
        isResolved && "opacity-60"
      )}
      style={{ width: "280px" }}
    >
      <HeaderPlate bgClass={headerBg} statusLabel={statusLabel} />

      {/* Image zone with hover overlay */}
      <div className="relative">
        <ImagePlate
          isUnassigned={isUnassigned}
          unassignedScale={unassignedScale}
        />
        {isHovered && <HoverOverlay actionCondition={actionCondition} />}
      </div>
    </div>
  );
}

// ─── Sheet sub-components ─────────────────────────────────────────────────────

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-5">
      <p
        style={{
          ...SANS,
          fontSize: "11px",
          fontWeight: 700,
          textTransform: "uppercase" as const,
          letterSpacing: "0.08em",
          color: "#94A3B8",
          marginBottom: "8px",
        }}
      >
        {children}
      </p>
      <hr className="border-neutral-200" />
    </div>
  );
}

function VariantChip({ label }: { label: string }) {
  return (
    <p
      style={{
        ...SANS,
        fontSize: "10px",
        color: "#94A3B8",
        marginTop: "6px",
        textAlign: "center" as const,
      }}
    >
      {label}
    </p>
  );
}

/** Column label above a card (e.g. "Resting" / "Hovered") */
function ColLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        ...SANS,
        fontSize: "10px",
        fontWeight: 600,
        color: "#64748B",
        textTransform: "uppercase" as const,
        letterSpacing: "0.06em",
        marginBottom: "6px",
        textAlign: "center" as const,
      }}
    >
      {children}
    </p>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function IncidentCardV11Sheet() {
  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: "#F8FAFC", padding: "32px" }}
    >
      {/* Version header */}
      <div className="mb-10">
        <p
          style={{
            ...MONO,
            fontSize: "11px",
            color: "#64748B",
            letterSpacing: "0.04em",
          }}
        >
          v1.1 — Compact Header · Integrated Overlays · Hover Action Matrix
        </p>
      </div>

      {/* ── SECTION A: Threat Severity Matrix ───────────────────────────────── */}
      <div className="mb-14">
        <SectionHeading>A — Threat Severity Matrix (Resting vs Hovered)</SectionHeading>

        {/* Column headers */}
        <div className="flex flex-wrap gap-8 items-start">

          {/* ── Critical pair ── */}
          <div className="flex flex-col items-center gap-1">
            <p
              style={{
                ...SANS,
                fontSize: "11px",
                fontWeight: 700,
                color: "#DC2626",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                marginBottom: "2px",
              }}
            >
              • Critical
            </p>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <ColLabel>Resting</ColLabel>
                <IncidentCardV11
                  headerBg="bg-red-600"
                  statusLabel="⚠️ Escalated"
                  isUnassigned={false}
                  isResolved={false}
                  isHovered={false}
                  actionCondition="B"
                  unassignedScale="scale-110"
                />
                <VariantChip label="V1 · Critical · Assigned · Rest" />
              </div>
              <div className="flex flex-col items-center">
                <ColLabel>Hovered</ColLabel>
                <IncidentCardV11
                  headerBg="bg-red-600"
                  statusLabel="⚠️ Escalated"
                  isUnassigned={false}
                  isResolved={false}
                  isHovered={true}
                  actionCondition="B"
                  unassignedScale="scale-110"
                />
                <VariantChip label="V1 · Critical · Assigned · Hover" />
              </div>
            </div>
          </div>

          {/* ── High pair ── */}
          <div className="flex flex-col items-center gap-1">
            <p
              style={{
                ...SANS,
                fontSize: "11px",
                fontWeight: 700,
                color: "#EA580C",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                marginBottom: "2px",
              }}
            >
              • High
            </p>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <ColLabel>Resting</ColLabel>
                <IncidentCardV11
                  headerBg="bg-[#EA580C]"
                  statusLabel="⚙ In Progress"
                  isUnassigned={false}
                  isResolved={false}
                  isHovered={false}
                  actionCondition="B"
                  unassignedScale="scale-100"
                />
                <VariantChip label="V2 · High · Assigned · Rest" />
              </div>
              <div className="flex flex-col items-center">
                <ColLabel>Hovered</ColLabel>
                <IncidentCardV11
                  headerBg="bg-[#EA580C]"
                  statusLabel="⚙ In Progress"
                  isUnassigned={false}
                  isResolved={false}
                  isHovered={true}
                  actionCondition="B"
                  unassignedScale="scale-100"
                />
                <VariantChip label="V2 · High · Assigned · Hover" />
              </div>
            </div>
          </div>

          {/* ── Medium pair ── */}
          <div className="flex flex-col items-center gap-1">
            <p
              style={{
                ...SANS,
                fontSize: "11px",
                fontWeight: 700,
                color: "#475569",
                textTransform: "uppercase" as const,
                letterSpacing: "0.06em",
                marginBottom: "2px",
              }}
            >
              • Medium
            </p>
            <div className="flex gap-4 items-start">
              <div className="flex flex-col items-center">
                <ColLabel>Resting</ColLabel>
                <IncidentCardV11
                  headerBg="bg-slate-600"
                  statusLabel="⊙ Detected"
                  isUnassigned={true}
                  isResolved={false}
                  isHovered={false}
                  actionCondition="A"
                  unassignedScale="scale-90"
                />
                <VariantChip label="V3 · Medium · Unassigned · Rest" />
              </div>
              <div className="flex flex-col items-center">
                <ColLabel>Hovered</ColLabel>
                <IncidentCardV11
                  headerBg="bg-slate-600"
                  statusLabel="⊙ Detected"
                  isUnassigned={true}
                  isResolved={false}
                  isHovered={true}
                  actionCondition="A"
                  unassignedScale="scale-90"
                />
                <VariantChip label="V3 · Medium · Unassigned · Hover" />
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* ── SECTION B: Operational Lifecycle States ─────────────────────────── */}
      <div className="mb-14">
        <SectionHeading>B — Operational Lifecycle States</SectionHeading>

        <div className="flex flex-wrap gap-6 items-start">

          {/* 1. Assigned + In Progress */}
          <div className="flex flex-col items-center">
            <IncidentCardV11
              headerBg="bg-red-600"
              statusLabel="⚙ In Progress"
              isUnassigned={false}
              isResolved={false}
              isHovered={false}
              actionCondition="B"
              unassignedScale="scale-110"
            />
            <VariantChip label="V4 · Assigned · In Progress" />
          </div>

          {/* 2. Unassigned + Detected */}
          <div className="flex flex-col items-center">
            <IncidentCardV11
              headerBg="bg-red-600"
              statusLabel="⊙ Detected"
              isUnassigned={true}
              isResolved={false}
              isHovered={false}
              actionCondition="A"
              unassignedScale="scale-110"
            />
            <VariantChip label="V5 · Unassigned · Detected" />
          </div>

          {/* 3. Soft Resolved (AI) */}
          <div className="flex flex-col items-center">
            <IncidentCardV11
              headerBg="bg-slate-700"
              statusLabel="🤖 Soft Resolved"
              isUnassigned={false}
              isResolved={true}
              isHovered={false}
              actionCondition="B"
            />
            <VariantChip label="V6 · Soft Resolved (AI)" />
          </div>

          {/* 4. Hard Resolved (Operator) */}
          <div className="flex flex-col items-center">
            <IncidentCardV11
              headerBg="bg-slate-800"
              statusLabel="✓ Hard Resolved"
              isUnassigned={false}
              isResolved={true}
              isHovered={false}
              actionCondition="B"
            />
            <VariantChip label="V7 · Hard Resolved (Operator)" />
          </div>

        </div>
      </div>
    </div>
  );
}
