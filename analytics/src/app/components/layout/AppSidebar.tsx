import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/app/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import {
  LayoutDashboard, ShieldAlert, MapPin, TrendingUp, ShoppingBag,
  Settings, HelpCircle, Check, ChevronsUpDown,
  ScanFace, CarFront, Video, ClipboardCheck, Map, Fingerprint,
  Headphones, BarChart3, Shield, MonitorPlay,
} from "lucide-react";
import { cn } from "@/app/lib/utils";

export type Page =
  | "dashboard" | "volume" | "incident" | "zone" | "quality" | "identity"
  | "facial-recognition" | "license-plates" | "cameras" | "metrics" | "compliance";

interface Props {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

const PLATFORMS = [
  { id: "vms",       name: "Matrice VMS",       shortcut: "1", icon: MonitorPlay },
  { id: "analytics", name: "Matrice Analytics", shortcut: "2", icon: BarChart3, active: true },
  { id: "support",   name: "Matrice Support",   shortcut: "3", icon: Headphones },
  { id: "internal",  name: "Matrice Internal",  shortcut: "4", icon: Shield },
];

const NAV_ITEMS: { id: Page; label: string; icon: React.ElementType; badge?: number }[] = [
  { id: "dashboard",          label: "Dashboard",           icon: LayoutDashboard },
  { id: "volume",             label: "Volume Analytics",    icon: TrendingUp },
  { id: "incident",           label: "Incident Analytics",  icon: ShieldAlert,   badge: 3 },
  { id: "zone",               label: "Zone Analytics",      icon: MapPin },
  { id: "quality",            label: "Quality Analytics",   icon: ShoppingBag },
  { id: "identity",           label: "Identity Analytics",  icon: Fingerprint },
  { id: "facial-recognition", label: "Facial Recognition",  icon: ScanFace },
  { id: "license-plates",     label: "License Plates",      icon: CarFront },
  { id: "cameras",            label: "Cameras",             icon: Video },
  { id: "metrics",            label: "Metrics & Rules",     icon: Map },
  { id: "compliance",         label: "Compliance",          icon: ClipboardCheck },
];

const FOOTER_ITEMS = [
  { icon: HelpCircle, label: "Help & Support" },
  { icon: Settings,   label: "Settings" },
];

const MatriceIcon = () => (
  <svg viewBox="0 0 113.7 109.945" fill="none" className="w-full h-full">
    <path d="M9.58511 9.56419H24.6545V0H0V109.932H24.6545V100.367H9.58511V9.56419Z" fill="#00956D" />
    <path d="M113.7 0.087L113.426 0.025H89.0458V9.577H104.115V100.38H89.0458V109.944H113.7V0.373V0.075V0.087Z" fill="#00956D" />
    <circle cx="21.775" cy="43.356" r="3.428" fill="#00956D" />
    <circle cx="45.109" cy="43.331" r="6.422" fill="#00956D" />
    <circle cx="56.788" cy="31.628" r="5.000" fill="#00956D" />
    <circle cx="68.429" cy="43.306" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="31.628" r="5.000" fill="#00956D" />
    <circle cx="68.417" cy="20.011" r="3.428" fill="#00956D" />
    <circle cx="45.084" cy="66.613" r="6.422" fill="#00956D" />
    <circle cx="56.751" cy="54.935" r="6.419" fill="#00956D" />
    <circle cx="80.233" cy="78.304" r="5.000" fill="#00956D" />
    <circle cx="45.109" cy="89.920" r="3.428" fill="#00956D" />
    <circle cx="68.554" cy="90.020" r="3.428" fill="#00956D" />
    <circle cx="91.912" cy="66.738" r="3.428" fill="#00956D" />
    <path d="M33.3297 59.9718H33.3048C30.6873 59.8101 28.7179 60.5065 27.2471 61.9866C26.0381 63.193 25.365 64.7103 25.2029 66.2898C25.2528 66.6007 25.2279 66.9365 25.178 67.2599C25.0284 68.1181 24.5423 68.9265 23.7571 69.4737C22.6228 70.2697 21.0523 70.2945 19.9056 69.511C18.0608 68.2673 17.8988 65.7426 19.3821 64.2501C19.918 63.7153 20.5911 63.392 21.2891 63.2925C22.4109 63.2303 23.9066 63.0313 25.34 62.3597C26.4868 61.2155 27.9576 59.7479 28.5683 55.8551C28.5683 55.6312 28.5434 55.3949 28.506 55.171C28.4686 53.8278 28.9547 52.4971 29.9643 51.4897C32.1581 49.3007 35.8724 49.5868 37.6798 52.3105C38.7766 53.9771 38.7393 56.2157 37.5925 57.845C36.558 59.3126 34.9625 60.0215 33.3546 59.9842L33.3297 59.9718Z" fill="#00956D" />
    <path d="M69.564 74.461H69.5266C65.9992 74.5107 63.07 76.8862 62.4094 79.7716C62.2848 80.3313 61.3624 84.0002 56.439 85.2564C53.8464 82.4456 52.6623 74.9087 56.2894 74.1749C57.58 73.4785 61.9981 70.5184 62.048 67.5584C61.8236 61.6632 68.866 58.0689 73.5775 61.7876C78.7752 65.8545 75.9831 74.1998 69.5515 74.4734L69.564 74.461Z" fill="#00956D" />
    <path d="M86.079 55.7556C86.079 55.4944 86.054 55.2705 86.0166 55.0467C85.705 51.4896 88.8211 47.858 92.4109 47.6341C95.2154 48.0197 97.272 44.699 95.6392 42.3484C93.9191 39.7241 89.8058 40.744 89.407 43.7289C89.5815 47.7336 85.9419 51.2658 81.9533 50.9673C81.7289 50.9673 81.4921 50.9424 81.2677 50.9051H81.2428C76.3318 50.7434 74.1506 57.248 78.4009 60.0588C81.7164 62.285 86.2909 59.5986 86.079 55.7431V55.7556Z" fill="#00956D" />
    <path d="M38.4526 31.5157C38.4526 31.2545 38.4277 31.0306 38.3903 30.8068C38.0787 27.2497 41.1948 23.6181 44.7845 23.3942C47.589 23.7798 49.6456 20.4591 48.0128 18.1085C46.2927 15.4842 42.1795 16.5041 41.7806 19.489C41.9551 23.4937 38.3155 27.0259 34.3269 26.7274C34.1025 26.7274 33.8657 26.7025 33.6414 26.6652H33.6164C28.7055 26.5035 26.5242 33.0081 30.7746 35.8189C34.0901 38.0452 38.6645 35.3587 38.4526 31.5032V31.5157Z" fill="#00956D" />
    <circle cx="33.454" cy="78.279" r="5.000" fill="#00956D" />
  </svg>
);

export const AppSidebar = ({ activePage, onPageChange }: Props) => {
  return (
    <Sidebar collapsible="icon" variant="sidebar">
      {/* ── Brand / Platform Switcher ── */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Switch Platform"
                  className="hover:bg-white/5 data-[state=open]:bg-white/5"
                >
                  <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-[#012a1f] border border-[#00775B]/30 p-1.5 shrink-0">
                    <MatriceIcon />
                  </div>
                  <div className="grid flex-1 text-left leading-tight">
                    <span className="truncate text-sm font-bold text-sidebar-foreground">Matrice AI</span>
                    <span className="truncate text-[10px] text-sidebar-foreground/50">Analytics Platform</span>
                  </div>
                  <ChevronsUpDown className="ml-auto size-4 text-sidebar-foreground/40" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side="right"
                align="start"
                sideOffset={4}
                className="w-52 rounded-lg"
              >
                <DropdownMenuLabel className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Platforms
                </DropdownMenuLabel>
                {PLATFORMS.map((p) => (
                  <DropdownMenuItem key={p.id} className="gap-2 p-2 cursor-pointer">
                    <div className="flex size-6 items-center justify-center rounded-sm border bg-muted">
                      <p.icon className="size-3.5 shrink-0" />
                    </div>
                    <span className="flex-1 text-sm">{p.name}</span>
                    {p.active && <Check className="size-3.5 text-primary" />}
                    <kbd className="pointer-events-none inline-flex h-5 select-none items-center rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                      ⌘{p.shortcut}
                    </kbd>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* ── Main Navigation ── */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    isActive={activePage === item.id}
                    onClick={() => onPageChange(item.id)}
                    tooltip={item.label}
                    className={cn(
                      "hover:bg-white/5 hover:text-sidebar-foreground/90",
                      "data-[active=true]:bg-[#00775B] data-[active=true]:text-white data-[active=true]:shadow-md data-[active=true]:shadow-[#00775B]/20",
                      "text-sidebar-foreground/50",
                    )}
                  >
                    <item.icon className="shrink-0" />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge && (
                    <SidebarMenuBadge className={cn(
                      "rounded-full text-[10px] font-bold min-w-[18px] px-1",
                      activePage === item.id
                        ? "bg-white/20 text-white"
                        : "bg-red-600 text-white"
                    )}>
                      {item.badge}
                    </SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* ── Footer: Help + Settings ── */}
      <SidebarFooter>
        <SidebarMenu>
          {FOOTER_ITEMS.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                tooltip={item.label}
                className="hover:bg-white/5 hover:text-sidebar-foreground/90 text-sidebar-foreground/50"
              >
                <item.icon className="shrink-0" />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
};
