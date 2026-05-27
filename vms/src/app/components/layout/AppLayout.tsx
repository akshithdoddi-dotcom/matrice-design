import { useState, useEffect } from "react";
import {
  Bell, Sun, Moon, Search, Clock, Filter, ChevronDown,
  PanelLeft, PanelLeftClose,
} from "lucide-react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/app/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/app/components/ui/dropdown-menu";
import { cn } from "@/app/lib/utils";
import { AppSidebar } from "@/app/components/layout/AppSidebar";
import { Page } from "@/app/components/layout/AppSidebar";

const PAGE_TITLES: Record<Page, string> = {
  platforms:    "Platforms",
  projects:     "Projects",
  networking:   "Networking",
  compute:      "Compute",
  storage:      "Storage",
  database:     "Database",
  cameras:      "Cameras",
  recordings:   "Recordings",
  "access-keys": "Access Keys",
  "my-invites": "My Invites",
};

function CustomSidebarTrigger() {
  const { open } = useSidebar();
  return (
    <SidebarTrigger className="text-white/70 hover:text-white hover:bg-white/5 h-7 w-7">
      {open ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeft className="h-4 w-4" />}
    </SidebarTrigger>
  );
}

interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
}

export function AppLayout({ activePage, onPageChange, children, isDark = false, onToggleDark }: AppLayoutProps) {
  const [clockTime, setClockTime] = useState(() =>
    new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })
  );

  useEffect(() => {
    const id = setInterval(() => {
      setClockTime(new Date().toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <SidebarProvider defaultOpen={true} style={{ "--sidebar-width": "14rem" } as React.CSSProperties}>
      <AppSidebar activePage={activePage} onPageChange={onPageChange} />

      <SidebarInset className="bg-[#F8FAFC]">
        {/* Header */}
        <header className="flex h-12 shrink-0 items-center gap-2 bg-[#021d18] text-white px-4 border-b border-[#00775B]/15">
          <CustomSidebarTrigger />
          <div className="h-4 w-px bg-white/10" />

          {/* Page title */}
          <div className="flex-1 flex items-center gap-2 text-sm">
            <span className="text-white/60 font-medium">
              {PAGE_TITLES[activePage] ?? "Cameras"}
            </span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">
            {/* LIVE */}
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#00775B] rounded-full text-white text-xs font-semibold shadow-md shadow-[#00775B]/30">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              LIVE
            </div>

            {/* Global Filter */}
            <button className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-medium text-white/70 hover:text-white hover:bg-white/8 border border-white/10 transition-all">
              <Filter className="w-3.5 h-3.5" />
              Global Filter
              <ChevronDown className="w-3 h-3 opacity-60" />
            </button>

            {/* Clock */}
            <div className="hidden md:flex items-center gap-1.5 h-8 px-3 rounded-lg border border-white/10 text-xs font-mono text-white/60">
              <Clock className="w-3.5 h-3.5 text-white/30" />
              {clockTime}
            </div>

            {/* Search */}
            <div className="hidden lg:flex items-center gap-2 h-8 px-3 rounded-lg border border-white/10 text-xs text-white/40 bg-white/5 hover:bg-white/8 cursor-pointer transition-colors min-w-[140px]">
              <Search className="w-3.5 h-3.5 shrink-0" />
              <span className="flex-1">Search</span>
              <div className="flex items-center gap-0.5 opacity-60">
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">⌘</kbd>
                <kbd className="text-[10px] font-mono px-1 py-0.5 rounded border border-white/20 bg-white/10">K</kbd>
              </div>
            </div>

            {/* Bell */}
            <button className="relative h-8 w-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white hover:bg-white/8 border border-white/10 transition-colors">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-[#021d18]" />
            </button>

            {/* Avatar */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="h-8 w-8 rounded-full bg-[#00775B] flex items-center justify-center text-white text-xs font-bold shadow-md hover:bg-[#006649] transition-colors ring-2 ring-transparent hover:ring-[#00775B]/40">
                  AU
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-sm">
                  <div className="font-medium">Admin User</div>
                  <div className="text-xs text-muted-foreground">admin@matrice.ai</div>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onToggleDark}>
                  {isDark ? <><Sun className="size-4" /><span>Light Mode</span></> : <><Moon className="size-4" /><span>Dark Mode</span></>}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem className="text-red-600 focus:text-red-600">
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Main content */}
        <div className={cn("flex flex-1 flex-col overflow-auto gap-4 p-6")}>
          {children}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
