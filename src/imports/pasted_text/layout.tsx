import { Outlet, useLocation, Link } from "react-router";
import { forwardRef, useState } from "react";
import {
  Headset,
  FolderOpen,
  GitBranch,
  Camera,
  Router,
  Server,
  Brain,
  LayoutDashboard,
  HelpCircle,
  Bell,
  Moon,
  Sun,
  User,
  Bug,
  Download,
  Settings2,
  Settings,
  LogOut,
  ChevronsUpDown,
  AlertCircle,
  CheckCircle,
  Info,
  Check,
  Monitor,
  BarChart3,
  Wrench,
  Shield,
} from "lucide-react";
import matriceIcon from "figma:asset/6d0a805fc53cc5a493556cba839e437881f25372.png";
import { useTheme } from "../contexts/ThemeContext";
import { FilterProvider } from "../contexts/FilterContext";
import NavBreadcrumb from "./NavBreadcrumb";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarRail,
  SidebarTrigger,
} from "./ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";

// Create a forwardRef wrapper for Link to work with Slot
const ForwardedLink = forwardRef<
  HTMLAnchorElement,
  React.ComponentProps<typeof Link>
>((props, ref) => <Link ref={ref} {...props} />);
ForwardedLink.displayName = "ForwardedLink";

const mainNavItems = [
  { to: "/", icon: Headset, label: "Support Desk" },
  { to: "/projects", icon: FolderOpen, label: "Projects" },
  { to: "/system-flow", icon: GitBranch, label: "System Flow" },
  { to: "/cameras", icon: Camera, label: "Cameras" },
  { to: "/gateways", icon: Router, label: "Gateways" },
  { to: "/compute", icon: Server, label: "Compute" },
  { to: "/", icon: Brain, label: "ML Apps", disabled: true },
  {
    to: "/",
    icon: LayoutDashboard,
    label: "Command Centre",
    disabled: true,
  },
];

const supportNavItems = [
  { to: "/issues", icon: Bug, label: "Issues" },
  { to: "/downloads", icon: Download, label: "Downloads" },
  { to: "/settings", icon: Settings, label: "Settings" },
  { to: "/help", icon: HelpCircle, label: "Help and Support" },
];

interface Notification {
  id: string;
  type: "issue" | "deployment" | "alert" | "info";
  title: string;
  description: string;
  time: string;
  read: boolean;
  link?: string;
}

const initialNotifications: Notification[] = [
  {
    id: "n1",
    type: "alert",
    title: "Critical: Fire Detection false positive spike",
    description:
      "ISS-1023 — False positive rate increased by 23% on Qatar_Demo.",
    time: "30 min ago",
    read: false,
    link: "/issues",
  },
  {
    id: "n2",
    type: "issue",
    title: "New issue assigned to you",
    description:
      "ISS-1024 — Camera feed dropping on Car_Park_30.",
    time: "2 hours ago",
    read: false,
    link: "/issues",
  },
  {
    id: "n3",
    type: "deployment",
    title: "Firmware v3.2.1 available",
    description: "New gateway firmware ready for download.",
    time: "5 hours ago",
    read: false,
    link: "/downloads",
  },
  {
    id: "n4",
    type: "info",
    title: "Compute node H100 memory usage high",
    description:
      "RAM at 92% on H100-Lan-default. Consider restarting.",
    time: "1 day ago",
    read: true,
    link: "/compute",
  },
  {
    id: "n5",
    type: "deployment",
    title: "Batch deployment completed",
    description:
      "Fire Detection pipeline deployed to 5 cameras.",
    time: "2 days ago",
    read: true,
  },
];

const notificationTypeConfig: Record<
  Notification["type"],
  { icon: any; colorClass: string; dotClass: string }
> = {
  alert: {
    icon: AlertCircle,
    colorClass: "text-destructive bg-destructive/10",
    dotClass: "bg-destructive",
  },
  issue: {
    icon: Bug,
    colorClass: "text-orange-500 bg-orange-500/10",
    dotClass: "bg-orange-500",
  },
  deployment: {
    icon: CheckCircle,
    colorClass: "text-primary bg-primary/10",
    dotClass: "bg-primary",
  },
  info: {
    icon: Info,
    colorClass: "text-blue-500 bg-blue-500/10",
    dotClass: "bg-blue-500",
  },
};

const platforms = [
  { icon: Monitor, label: "Matrice VMS", shortcut: "1" },
  {
    icon: BarChart3,
    label: "Matrice Analytics",
    shortcut: "2",
  },
  {
    icon: Wrench,
    label: "Matrice Support",
    shortcut: "3",
    active: true,
  },
  { icon: Shield, label: "Matrice Internal", shortcut: "4" },
];

export default function Layout() {
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [notifications, setNotifications] = useState<
    Notification[]
  >(initialNotifications);

  const unreadCount = notifications.filter(
    (n) => !n.read,
  ).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((n) => ({ ...n, read: true })),
    );
  };

  return (
    <FilterProvider>
      <SidebarProvider
        defaultOpen={false}
        style={
          { "--sidebar-width": "14rem" } as React.CSSProperties
        }
        className="h-svh !min-h-0"
      >
        <Sidebar collapsible="icon" variant="sidebar">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton
                      size="lg"
                      className="cursor-pointer data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                    >
                      <div className="flex aspect-square size-8 items-center justify-center rounded-none">
                        <img
                          src={matriceIcon}
                          alt="Matrice"
                          className="size-6 rounded-none"
                        />
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          Matrice.ai
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          Support Platform
                        </span>
                      </div>
                      <ChevronsUpDown className="ml-auto size-4" />
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                    align="start"
                    side="right"
                    sideOffset={4}
                  >
                    <DropdownMenuLabel className="text-xs text-muted-foreground">
                      Platforms
                    </DropdownMenuLabel>
                    {platforms.map((platform) => (
                      <DropdownMenuItem
                        key={platform.shortcut}
                        className="gap-2 p-2 cursor-pointer"
                      >
                        <div className="flex size-6 items-center justify-center rounded-sm border">
                          <platform.icon className="size-4 shrink-0" />
                        </div>
                        <span className="flex-1">
                          {platform.label}
                        </span>
                        {platform.active && (
                          <Check className="size-4 text-primary" />
                        )}
                        <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] text-muted-foreground">
                          <span className="text-xs">&#8984;</span>
                          {platform.shortcut}
                        </kbd>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {mainNavItems.map((item) => {
                    const isActive =
                      item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to);
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive && !item.disabled}
                          tooltip={item.label}
                          disabled={item.disabled}
                        >
                          <ForwardedLink
                            to={item.disabled ? "#" : item.to}
                            onClick={
                              item.disabled
                                ? (e) => e.preventDefault()
                                : undefined
                            }
                            className={
                              item.disabled
                                ? "opacity-30 cursor-not-allowed"
                                : ""
                            }
                          >
                            <item.icon />
                            <span>{item.label}</span>
                          </ForwardedLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarContent>

          <SidebarFooter>
            <SidebarGroup className="p-0">
              <SidebarGroupContent>
                <SidebarMenu>
                  {supportNavItems.map((item) => {
                    const isActive = location.pathname.startsWith(
                      item.to,
                    );
                    return (
                      <SidebarMenuItem key={item.label}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <ForwardedLink to={item.to}>
                            <item.icon />
                            <span>{item.label}</span>
                          </ForwardedLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </SidebarFooter>

          <SidebarRail />
        </Sidebar>

        <SidebarInset className="overflow-hidden bg-sidebar">
          {/* Header with Breadcrumbs and Sidebar Trigger */}
          <header className="flex h-12 shrink-0 items-center gap-2 bg-sidebar text-sidebar-foreground px-4">
            <SidebarTrigger className="-ml-1 text-sidebar-foreground" />
            <div className="h-4 w-px bg-sidebar-border" />
            <div className="flex-1">
              <NavBreadcrumb />
            </div>

            {/* Right side: Notifications and Profile */}
            <div className="flex items-center gap-2">
              {/* Notifications */}
              <Popover>
                <PopoverTrigger asChild>
                  <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-accent transition-colors">
                    <Bell className="w-5 h-5 text-sidebar-foreground/70" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-destructive rounded-full ring-2 ring-background" />
                    )}
                  </button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-96 p-0">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        Notifications
                      </span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-destructive text-destructive-foreground px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                          {unreadCount}
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Check className="w-3 h-3" />
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-[400px] overflow-y-auto divide-y divide-border">
                    {notifications.map((n) => {
                      const config =
                        notificationTypeConfig[n.type];
                      const Icon = config.icon;
                      return (
                        <div
                          key={n.id}
                          onClick={() => markAsRead(n.id)}
                          className={`flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-muted/50 ${
                            !n.read ? "bg-primary/[0.03]" : ""
                          }`}
                        >
                          <div
                            className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${config.dotClass}`}
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-2">
                              <span
                                className={`text-sm truncate ${!n.read ? "font-medium" : "text-muted-foreground"}`}
                              >
                                {n.title}
                              </span>
                              {!n.read && (
                                <span className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                              {n.description}
                            </p>
                            <span className="text-[11px] text-muted-foreground/70 mt-1 block">
                              {n.time}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t border-border px-4 py-2.5">
                    <ForwardedLink
                      to="/activity"
                      className="text-xs text-primary hover:underline w-full text-center block"
                    >
                      View all activity
                    </ForwardedLink>
                  </div>
                </PopoverContent>
              </Popover>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium">
                      MU
                    </div>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5 text-sm">
                    <div className="font-medium">
                      Mohammed Usman F
                    </div>
                    <div className="text-xs text-muted-foreground">
                      mohammed.usman@matrice.ai
                    </div>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="size-4" />
                    <span>Profile</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={toggleTheme}>
                    {theme === "light" ? (
                      <>
                        <Moon className="size-4" />
                        <span>Dark Mode</span>
                      </>
                    ) : (
                      <>
                        <Sun className="size-4" />
                        <span>Light Mode</span>
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="size-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <div className="flex flex-1 flex-col gap-4 p-[24px] overflow-hidden min-h-0 rounded-tl-2xl bg-background">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
    </FilterProvider>
  );
}