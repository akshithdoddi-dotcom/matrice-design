import { useState, useEffect, useRef } from "react";
import { Page } from "@/app/components/layout/AppSidebar";
import { AppLayout } from "@/app/components/layout/AppLayout";
import { Cameras } from "@/app/components/pages/Cameras";
import { cn } from "@/app/lib/utils";
import {
  LayoutGrid, FolderOpen, Network, Cpu, HardDrive,
  Database, Film, KeyRound, Mail,
} from "lucide-react";

// ── Coming Soon placeholder ──────────────────────────────────────────────────
const PLACEHOLDER_META: Record<string, { icon: React.ElementType; label: string; desc: string }> = {
  platforms:      { icon: LayoutGrid, label: "Platforms",   desc: "Manage your deployment platforms and environments." },
  projects:       { icon: FolderOpen, label: "Projects",    desc: "Organise cameras and streams by project." },
  networking:     { icon: Network,    label: "Networking",  desc: "Configure VLANs, subnets, and network topology." },
  compute:        { icon: Cpu,        label: "Compute",     desc: "Monitor and scale compute resources." },
  storage:        { icon: HardDrive,  label: "Storage",     desc: "Manage recording storage volumes and retention policies." },
  database:       { icon: Database,   label: "Database",    desc: "Inspect and maintain metadata databases." },
  recordings:     { icon: Film,       label: "Recordings",  desc: "Browse, search, and export recorded footage." },
  "access-keys":  { icon: KeyRound,   label: "Access Keys", desc: "Issue and revoke API and device access keys." },
  "my-invites":   { icon: Mail,       label: "My Invites",  desc: "Accept or manage team invitations." },
};

const ComingSoon = ({ page }: { page: Page }) => {
  const meta = PLACEHOLDER_META[page];
  if (!meta) return null;
  const Icon = meta.icon;
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-neutral-100 p-5 rounded-full">
        <Icon className="w-10 h-10 text-neutral-400" />
      </div>
      <h2 className="text-lg font-bold text-neutral-800">{meta.label}</h2>
      <p className="text-sm text-neutral-500 max-w-sm text-center">{meta.desc}</p>
      <span className="text-[10px] font-bold uppercase tracking-widest text-[#00775B] bg-[#E5FFF9] px-3 py-1.5 rounded-full">
        Coming Soon
      </span>
    </div>
  );
};

// ── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activePage, setActivePage] = useState<Page>("cameras");

  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-theme") === "dark"; } catch { return false; }
  });
  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isDark) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
    try { localStorage.setItem("matrice-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {}
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (new URLSearchParams(window.location.search).get("no-animate") === "1") {
      document.documentElement.classList.add("no-animate");
    }
  }, []);

  return (
    <AppLayout activePage={activePage} onPageChange={setActivePage} isDark={isDark} onToggleDark={() => setIsDark(d => !d)}>
      <div className={cn("bg-[#F8FAFC] dark:bg-[#020617] font-sans text-neutral-900 dark:text-slate-100 min-h-full")}>
        <div className="max-w-full overflow-x-hidden">
          <section className="w-full">
            {activePage === "cameras"
              ? <Cameras />
              : <ComingSoon page={activePage} />
            }
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
