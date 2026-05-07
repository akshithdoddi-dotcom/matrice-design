import { cn } from "@/app/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Info } from "lucide-react";

export type Severity =
  | "CRITICAL"
  | "HIGH"
  | "MEDIUM"
  | "LOW"
  | "GREEN"
  | "AMBER"
  | "RED"
  | "ON_TRACK"
  | "WATCH"
  | "OFF_TARGET"
  | "HIGH_RISK";

const SEVERITY_MAP: Record<
  Severity,
  { bg: string; text: string; icon: React.ElementType; label: string }
> = {
  CRITICAL:   { bg: "bg-red-100",     text: "text-red-700",     icon: XCircle,       label: "Critical"   },
  HIGH:        { bg: "bg-orange-100",  text: "text-orange-700",  icon: AlertTriangle, label: "High"       },
  MEDIUM:      { bg: "bg-amber-100",   text: "text-amber-700",   icon: AlertTriangle, label: "Medium"     },
  LOW:         { bg: "bg-blue-100",    text: "text-blue-700",    icon: Info,          label: "Low"        },
  GREEN:       { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2,  label: "Normal"     },
  AMBER:       { bg: "bg-amber-100",   text: "text-amber-700",   icon: AlertTriangle, label: "Watch"      },
  RED:         { bg: "bg-red-100",     text: "text-red-700",     icon: XCircle,       label: "Alert"      },
  ON_TRACK:    { bg: "bg-emerald-100", text: "text-emerald-700", icon: CheckCircle2,  label: "On Track"   },
  WATCH:       { bg: "bg-amber-100",   text: "text-amber-700",   icon: AlertTriangle, label: "Watch"      },
  OFF_TARGET:  { bg: "bg-red-100",     text: "text-red-700",     icon: XCircle,       label: "Off Target" },
  HIGH_RISK:   { bg: "bg-red-100",     text: "text-red-700",     icon: XCircle,       label: "High Risk"  },
};

export const StatusBadge = ({
  severity,
  label,
}: {
  severity: Severity;
  label?: string;
}) => {
  const cfg = SEVERITY_MAP[severity];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold",
        cfg.bg,
        cfg.text
      )}
    >
      <Icon className="w-3 h-3" />
      {label ?? cfg.label}
    </span>
  );
};
