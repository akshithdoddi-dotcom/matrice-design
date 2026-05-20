import {
  Monitor,
  BarChart3,
  Cpu,
  Store,
  Wrench,
  Shield,
} from "lucide-react";

export interface Platform {
  id: string;
  label: string;
  icon: React.ElementType;
  shortcut: string;
  route: string;
}

export const PLATFORMS: Platform[] = [
  { id: "vms",         label: "Matrice VMS",         icon: Monitor,  shortcut: "1", route: "/vms" },
  { id: "analytics",   label: "Matrice Analytics",   icon: BarChart3, shortcut: "2", route: "/analytics" },
  { id: "training",    label: "Matrice Training",    icon: Cpu,      shortcut: "3", route: "/training" },
  { id: "marketplace", label: "Matrice Marketplace", icon: Store,    shortcut: "4", route: "/marketplace" },
  { id: "support",     label: "Matrice Support",     icon: Wrench,   shortcut: "5", route: "/support" },
  { id: "internal",    label: "Matrice Internal",    icon: Shield,   shortcut: "6", route: "/internal" },
];
