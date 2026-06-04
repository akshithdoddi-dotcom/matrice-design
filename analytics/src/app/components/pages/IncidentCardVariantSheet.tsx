/**
 * IncidentCardVariantSheet — Purely presentational design system sheet
 * showcasing all IncidentCard structural variants across three sections:
 *   A. Threat Severity Matrix
 *   B. Operational States (Resolved variants)
 *   C. Accountability Footer variants
 *
 * Zero state, no external dependencies beyond existing codebase imports.
 */

import {
  User,
  AlertTriangle,
  CheckCircle2,
  Bot,
  Plus,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

// ─── Typography tokens ────────────────────────────────────────────────────────
const MONO: React.CSSProperties = { fontFamily: "'JetBrains Mono','Fira Code',monospace" };
const SANS: React.CSSProperties = { fontFamily: "'Inter',sans-serif" };

// ─── Shared card data ─────────────────────────────────────────────────────────
const CARD_TITLE = "FIRE / FLAME DETECTION";
const CARD_TIMESTAMP = "17:38 PM";
const CARD_ID = "INC-3051";
const CARD_CAMERA = "CAM-W01";
const CARD_LOCATION = "Warehouse Zone A";
const CARD_IMAGE = "https://images.unsplash.com/photo-1566931333278-f604cfaab7ec?w=480&q=70";

// ─── Status Pill ──────────────────────────────────────────────────────────────
interface StatusPillProps {
  icon?: React.ReactNode;
  label: string;
}

function StatusPill({ icon, label }: StatusPillProps) {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 shrink-0"
      style={{
        border: "1px solid rgba(255,255,255,0.22)",
        color: "rgba(255,255,255,0.88)",
        ...SANS,
        fontSize: "11px",
        fontWeight: 600,
        letterSpacing: "0.04em",
      }}
    >
      {icon}
      {label}
    </span>
  );
}

// ─── Image Plate ──────────────────────────────────────────────────────────────
interface ImagePlateProps {
  isResolved?: boolean;
}

function ImagePlate({ isResolved = false }: ImagePlateProps) {
  return (
    <div className="relative h-[140px] overflow-hidden bg-neutral-200">
      <img
        src={CARD_IMAGE}
        alt="Incident scene"
        className="w-full h-full object-cover"
      />

      {/* Top-left: camera name */}
      <div
        className="absolute top-2 left-2 px-1.5 py-0.5 rounded-[3px] z-10"
        style={{
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(4px)",
          color: "rgba(255,255,255,0.92)",
          ...MONO,
          fontSize: "10px",
          fontWeight: 600,
        }}
      >
        {CARD_CAMERA}
      </div>

      {/* Bottom-left: location */}
      <div
        className="absolute bottom-2 left-2 px-1.5 py-0.5 rounded-[3px] z-10"
        style={{
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(4px)",
          color: "rgba(255,255,255,0.88)",
          ...SANS,
          fontSize: "10px",
          fontWeight: 500,
        }}
      >
        {CARD_LOCATION}
      </div>

      {/* Bottom-right: LIVE or ARCHIVE status */}
      <div
        className="absolute bottom-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded-[3px] z-10"
        style={{
          background: "rgba(0,0,0,0.78)",
          backdropFilter: "blur(4px)",
          ...MONO,
          fontSize: "10px",
          fontWeight: 700,
          letterSpacing: "0.06em",
          color: isResolved ? "rgba(255,255,255,0.50)" : "#4ade80",
        }}
      >
        {isResolved ? (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full inline-block"
              style={{ background: "rgba(255,255,255,0.35)" }}
            />
            ARCHIVE
          </>
        ) : (
          <>
            <span
              className="w-1.5 h-1.5 rounded-full inline-block animate-pulse"
              style={{
                background: "#ef4444",
                boxShadow: "0 0 6px rgba(239,68,68,0.7)",
              }}
            />
            LIVE
          </>
        )}
      </div>
    </div>
  );
}

// ─── Header Plate ─────────────────────────────────────────────────────────────
interface HeaderPlateProps {
  bgClass: string;
  stagePill: React.ReactNode;
}

function HeaderPlate({ bgClass, stagePill }: HeaderPlateProps) {
  return (
    <div className={cn("flex flex-col justify-between py-2 px-3 h-[52px] shrink-0", bgClass)}>
      {/* Top row */}
      <div className="flex items-center justify-between gap-2">
        <span
          className="text-white truncate"
          style={{ ...SANS, fontSize: "14px", fontWeight: 700, letterSpacing: "0.01em" }}
        >
          {CARD_TITLE}
        </span>
        {stagePill}
      </div>

      {/* Bottom row */}
      <div className="flex items-center justify-between">
        <span
          className="text-white/75"
          style={{ ...MONO, fontSize: "12px", fontWeight: 500 }}
        >
          {CARD_TIMESTAMP}
        </span>
        <span
          className="text-white/60"
          style={{ ...MONO, fontSize: "12px", fontWeight: 500 }}
        >
          {CARD_ID}
        </span>
      </div>
    </div>
  );
}

// ─── Default Footer ───────────────────────────────────────────────────────────
function DefaultFooter({ assignee = "Staff_04" }: { assignee?: string }) {
  return (
    <div
      className="bg-white border-t border-neutral-200 px-3 py-1.5 flex items-center gap-1.5"
      style={{ minHeight: "32px" }}
    >
      <User className="w-3 h-3 text-neutral-400 shrink-0" />
      <span style={{ ...SANS, fontSize: "12px", color: "#525252" }}>
        Assigned: {assignee}
      </span>
    </div>
  );
}

// ─── Unassigned Footer (V7) ───────────────────────────────────────────────────
function UnassignedFooter() {
  return (
    <div
      className="border-t border-neutral-200 px-3 py-1.5 flex items-center justify-between gap-2"
      style={{
        background: "rgba(220,38,38,0.05)",
        minHeight: "32px",
      }}
    >
      <div className="flex items-center gap-1.5">
        <AlertTriangle className="w-3 h-3 text-red-600 shrink-0" />
        <span
          style={{ ...SANS, fontSize: "12px", fontWeight: 700, color: "#dc2626" }}
        >
          Unassigned
        </span>
      </div>
      <button
        className="flex items-center gap-0.5 rounded px-2 py-0.5 border border-neutral-300 bg-white hover:bg-neutral-50 transition-colors"
        style={{ ...SANS, fontSize: "11px", fontWeight: 600, color: "#525252" }}
        type="button"
      >
        <Plus className="w-3 h-3" />
        Grab
      </button>
    </div>
  );
}

// ─── Card Wrapper ─────────────────────────────────────────────────────────────
interface CardWrapperProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

function CardWrapper({ children, className, style }: CardWrapperProps) {
  return (
    <div
      className={cn(
        "w-[280px] rounded-sm border border-neutral-200 shadow-sm overflow-hidden flex flex-col shrink-0",
        className
      )}
      style={style}
    >
      {children}
    </div>
  );
}

// ─── Variant Label Chip ───────────────────────────────────────────────────────
function VariantChip({ label }: { label: string }) {
  return (
    <span
      className="text-neutral-400 mt-2"
      style={{ ...SANS, fontSize: "10px", fontWeight: 500 }}
    >
      {label}
    </span>
  );
}

// ─── Section Heading ──────────────────────────────────────────────────────────
function SectionHeading({ title }: { title: string }) {
  return (
    <div className="mb-6">
      <span
        className="text-neutral-500 uppercase tracking-widest"
        style={{ ...SANS, fontSize: "11px", fontWeight: 700 }}
      >
        {title}
      </span>
      <hr className="mt-2 border-neutral-200" />
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function IncidentCardVariantSheet() {
  return (
    <div
      className="bg-[#F8FAFC] p-8 min-h-full"
      style={{ ...SANS }}
    >

      {/* ── SECTION A — Threat Severity Matrix ───────────────────────────────── */}
      <section>
        <SectionHeading title="Section A — Threat Severity Matrix" />

        <div className="flex flex-wrap gap-6 mt-6">

          {/* V1 — Critical */}
          <div className="flex flex-col items-start">
            <CardWrapper>
              <HeaderPlate
                bgClass="bg-red-600"
                stagePill={
                  <StatusPill
                    icon={<AlertTriangle className="w-2.5 h-2.5" />}
                    label="CRITICAL"
                  />
                }
              />
              <ImagePlate />
              <DefaultFooter />
            </CardWrapper>
            <VariantChip label="Variant 1 — Critical" />
          </div>

          {/* V2 — High */}
          <div className="flex flex-col items-start">
            <CardWrapper>
              <HeaderPlate
                bgClass="bg-[#EA580C]"
                stagePill={
                  <StatusPill
                    icon={<AlertTriangle className="w-2.5 h-2.5" />}
                    label="HIGH"
                  />
                }
              />
              <ImagePlate />
              <DefaultFooter />
            </CardWrapper>
            <VariantChip label="Variant 2 — High" />
          </div>

          {/* V3 — Medium */}
          <div className="flex flex-col items-start">
            <CardWrapper>
              <HeaderPlate
                bgClass="bg-slate-600"
                stagePill={
                  <StatusPill
                    icon={<AlertTriangle className="w-2.5 h-2.5" />}
                    label="MEDIUM"
                  />
                }
              />
              <ImagePlate />
              <DefaultFooter />
            </CardWrapper>
            <VariantChip label="Variant 3 — Medium" />
          </div>

        </div>
      </section>

      {/* ── SECTION B — Operational States ───────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading title="Section B — Operational States" />

        <div className="flex flex-wrap gap-6 mt-6">

          {/* V4 — Soft Resolved (AI) */}
          <div className="flex flex-col items-start">
            <CardWrapper style={{ opacity: 0.6 }}>
              <HeaderPlate
                bgClass="bg-slate-700"
                stagePill={
                  <StatusPill
                    icon={<Bot className="w-2.5 h-2.5" />}
                    label="SOFT RESOLVED"
                  />
                }
              />
              <ImagePlate isResolved />
              <DefaultFooter />
            </CardWrapper>
            <VariantChip label="Variant 4 — Soft Resolved (AI)" />
          </div>

          {/* V5 — Hard Resolved (Operator) */}
          <div className="flex flex-col items-start">
            <CardWrapper style={{ opacity: 0.6 }}>
              <HeaderPlate
                bgClass="bg-slate-800"
                stagePill={
                  <StatusPill
                    icon={<CheckCircle2 className="w-2.5 h-2.5" />}
                    label="HARD RESOLVED"
                  />
                }
              />
              <ImagePlate isResolved />
              <DefaultFooter assignee="Manager_01" />
            </CardWrapper>
            <VariantChip label="Variant 5 — Hard Resolved (Operator)" />
          </div>

        </div>
      </section>

      {/* ── SECTION C — Accountability Footer ────────────────────────────────── */}
      <section className="mt-12">
        <SectionHeading title="Section C — Accountability Footer" />

        <div className="flex flex-wrap gap-6 mt-6">

          {/* V6 — Assigned */}
          <div className="flex flex-col items-start">
            <CardWrapper>
              <HeaderPlate
                bgClass="bg-red-600"
                stagePill={
                  <StatusPill
                    icon={<AlertTriangle className="w-2.5 h-2.5" />}
                    label="CRITICAL"
                  />
                }
              />
              <ImagePlate />
              {/* Assigned footer — bg-white, person icon */}
              <div
                className="bg-white border-t border-neutral-200 px-3 py-1.5 flex items-center gap-1.5"
                style={{ minHeight: "32px" }}
              >
                <User className="w-3 h-3 text-neutral-400 shrink-0" />
                <span style={{ ...SANS, fontSize: "12px", color: "#525252" }}>
                  Assigned: Manager_01
                </span>
              </div>
            </CardWrapper>
            <VariantChip label="Variant 6 — Assigned" />
          </div>

          {/* V7 — Unassigned */}
          <div className="flex flex-col items-start">
            <CardWrapper>
              <HeaderPlate
                bgClass="bg-red-600"
                stagePill={
                  <StatusPill
                    icon={<AlertTriangle className="w-2.5 h-2.5" />}
                    label="CRITICAL"
                  />
                }
              />
              <ImagePlate />
              <UnassignedFooter />
            </CardWrapper>
            <VariantChip label="Variant 7 — Unassigned" />
          </div>

        </div>
      </section>

    </div>
  );
}
