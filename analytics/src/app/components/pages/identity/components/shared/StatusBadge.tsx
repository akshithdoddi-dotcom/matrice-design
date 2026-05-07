import { cn } from "@/app/lib/utils";
import { CheckCircle2, AlertTriangle, XCircle, Info, Star } from "lucide-react";

export type IdentityBadgeSeverity =
  | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW"
  | "GREEN" | "AMBER" | "RED"
  | "ON_TRACK" | "WATCH" | "OFF_TARGET"
  | "BLACKLIST" | "VIP" | "WHITELIST" | "UNKNOWN" | "RECURRING" | "NEW"
  | "AUTHORIZED" | "UNREGISTERED" | "STOLEN" | "BOLO";

const SEVERITY_MAP: Record<IdentityBadgeSeverity, { bg: string; text: string; icon: React.ElementType; label: string }> = {
  CRITICAL:     { bg: "bg-red-100",      text: "text-red-700",     icon: XCircle,       label: "Critical"     },
  HIGH:         { bg: "bg-orange-100",   text: "text-orange-700",  icon: AlertTriangle, label: "High"         },
  MEDIUM:       { bg: "bg-amber-100",    text: "text-amber-700",   icon: AlertTriangle, label: "Medium"       },
  LOW:          { bg: "bg-blue-100",     text: "text-blue-700",    icon: Info,          label: "Low"          },
  GREEN:        { bg: "bg-emerald-100",  text: "text-emerald-700", icon: CheckCircle2,  label: "Normal"       },
  AMBER:        { bg: "bg-amber-100",    text: "text-amber-700",   icon: AlertTriangle, label: "Watch"        },
  RED:          { bg: "bg-red-100",      text: "text-red-700",     icon: XCircle,       label: "Alert"        },
  ON_TRACK:     { bg: "bg-emerald-100",  text: "text-emerald-700", icon: CheckCircle2,  label: "On Track"     },
  WATCH:        { bg: "bg-amber-100",    text: "text-amber-700",   icon: AlertTriangle, label: "Watch"        },
  OFF_TARGET:   { bg: "bg-red-100",      text: "text-red-700",     icon: XCircle,       label: "Off Target"   },
  BLACKLIST:    { bg: "bg-red-100",      text: "text-red-700",     icon: XCircle,       label: "Blacklist"    },
  VIP:          { bg: "bg-purple-100",   text: "text-purple-700",  icon: Star,          label: "VIP"          },
  WHITELIST:    { bg: "bg-emerald-100",  text: "text-emerald-700", icon: CheckCircle2,  label: "Whitelist"    },
  UNKNOWN:      { bg: "bg-slate-100",    text: "text-slate-600",   icon: AlertTriangle, label: "Unknown"      },
  RECURRING:    { bg: "bg-orange-100",   text: "text-orange-700",  icon: AlertTriangle, label: "Recurring"    },
  NEW:          { bg: "bg-blue-100",     text: "text-blue-700",    icon: Info,          label: "New"          },
  AUTHORIZED:   { bg: "bg-emerald-100",  text: "text-emerald-700", icon: CheckCircle2,  label: "Authorized"   },
  UNREGISTERED: { bg: "bg-amber-100",    text: "text-amber-700",   icon: AlertTriangle, label: "Unregistered" },
  STOLEN:       { bg: "bg-red-100",      text: "text-red-700",     icon: XCircle,       label: "Stolen"       },
  BOLO:         { bg: "bg-red-100",      text: "text-red-700",     icon: XCircle,       label: "BOLO"         },
};

export const StatusBadge = ({ severity, label }: { severity: IdentityBadgeSeverity; label?: string }) => {
  const cfg = SEVERITY_MAP[severity];
  const Icon = cfg.icon;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold", cfg.bg, cfg.text)}>
      <Icon className="w-3 h-3" />
      {label ?? cfg.label}
    </span>
  );
};
