import { CircleStop, Play } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ─────────────────────────────────────────────────────────────────────────────
// Action status enum
// ─────────────────────────────────────────────────────────────────────────────

export enum NavbarActionStatus {
  Running = "running",
  Stopped = "stopped",
  Resume = "resume",
}

// ─────────────────────────────────────────────────────────────────────────────
// Config shape
// ─────────────────────────────────────────────────────────────────────────────

export interface NavbarActionVariant {
  /** Lucide icon component */
  icon: LucideIcon;
  /** Accessible button label */
  ariaLabel: string;
  /** Tailwind background class */
  bg: string;
  /** Tailwind border class */
  border: string;
  /** Tailwind focus-ring color class */
  ring: string;
  /** Additional classes applied to the button (e.g. opacity) */
  extra?: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Config map
// ─────────────────────────────────────────────────────────────────────────────

export const navbarActionConfig: Record<
  NavbarActionStatus,
  NavbarActionVariant
> = {
  [NavbarActionStatus.Running]: {
    icon: CircleStop,
    ariaLabel: "Stop",
    bg: "bg-(--color-error)",
    border: "border-(--color-error-light)",
    ring: "focus-visible:ring-(--color-error-light)",
  },
  [NavbarActionStatus.Stopped]: {
    icon: CircleStop,
    ariaLabel: "Stop",
    bg: "bg-(--color-error)",
    border: "border-(--color-error-light)",
    ring: "focus-visible:ring-(--color-error-light)",
    extra: "opacity-50",
  },
  [NavbarActionStatus.Resume]: {
    icon: Play,
    ariaLabel: "Start",
    bg: "bg-(--color-success)",
    border: "border-(--color-success-light)",
    ring: "focus-visible:ring-(--color-success-light)",
  },
};
