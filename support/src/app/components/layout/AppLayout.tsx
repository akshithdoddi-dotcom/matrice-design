import { useState, useEffect, useLayoutEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { AppShell, NavItem, BreadcrumbSegment } from "@fe-common/components/layout/AppShell";
import {
  Server,
  Cpu,
  Camera,
  Settings,
  HelpCircle,
  Briefcase,
  Check,
  ChevronDown,
  Database,
} from "lucide-react";
import { Page } from "@/app/components/layout/AppSidebar";
import { Account, Cluster, Project, Pipeline, MOCK_ACCOUNTS, MOCK_CLUSTERS, MOCK_PROJECTS } from "@/data/mockData";

const BASE_NAV: NavItem[] = [
  { id: "support-desk", label: "All Clusters", icon: Server },
];

const CLUSTER_NAV: NavItem[] = [
  { id: "compute", label: "Compute", icon: Cpu    },
  { id: "cameras", label: "Cameras", icon: Camera },
];

const FOOTER_NAV: NavItem[] = [
  { id: "settings", label: "Settings",      icon: Settings  },
  { id: "help",     label: "Help & Support", icon: HelpCircle },
];

const TEAL = "#00775B";

// ── Account switcher rendered inside the navbar breadcrumb ────────────────────
// Only shown on the support-desk page

function AccountSwitcherBreadcrumb({
  selected,
  onSelect,
}: {
  selected: Account | null;
  onSelect?: (a: Account) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);
  const panelRef        = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 hover:text-white transition-colors font-semibold"
        style={{ color: open ? "#fff" : "rgba(255,255,255,0.75)" }}
      >
        <span className="max-w-[200px] truncate">
          {selected?.name ?? "Select account"}
        </span>
        <ChevronDown
          className="w-3 h-3 shrink-0 transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="rounded-[10px] bg-white overflow-hidden shadow-2xl"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 300,
            zIndex: 9999,
            border: "1px solid #E2E8F0",
          }}
        >
          <div className="px-3 py-2 border-b border-[#F1F5F9]">
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
              Switch Account
            </span>
          </div>
          {MOCK_ACCOUNTS.map((acc) => {
            const clCount = MOCK_CLUSTERS.filter((c) => c.accountId === acc.id).length;
            const isActive = selected?.id === acc.id;
            return (
              <button
                key={acc.id}
                onClick={() => { onSelect?.(acc); setOpen(false); }}
                className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
              >
                <div
                  className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                  style={{
                    backgroundColor: isActive ? TEAL : "#F1F5F9",
                    border: `1px solid ${isActive ? TEAL : "#E2E8F0"}`,
                  }}
                >
                  <Briefcase className="w-3.5 h-3.5" style={{ color: isActive ? "#fff" : "#94A3B8" }} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-semibold text-[#0F172A] truncate">{acc.name}</div>
                  <div className="text-[10px] font-mono text-[#94A3B8] truncate mt-0.5">{acc.accountId}</div>
                </div>
                {isActive
                  ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: TEAL }} />
                  : <span className="text-[10px] text-[#94A3B8] shrink-0">{clCount} clusters</span>
                }
              </button>
            );
          })}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Severity dot colours (mirrors Projects.tsx SEV tokens) ───────────────────

const SEV_DOT: Record<string, string> = {
  critical: "#E7000B",
  high:     "#EA580C",
  medium:   "#E19A04",
  stable:   "#00A63E",
  resolved: "#94A3B8",
  default:  "#CBD5E1",
};

// ── Project switcher rendered inside the navbar breadcrumb ───────────────────

function ProjectSwitcherBreadcrumb({
  selected,
  clusterId,
  onSelect,
}: {
  selected: Project | null;
  clusterId?: string | null;
  onSelect?: (p: Project) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);
  const panelRef        = useRef<HTMLDivElement>(null);

  const projects = clusterId
    ? MOCK_PROJECTS.filter((p) => p.clusterId === clusterId)
    : [];

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 hover:text-white transition-colors font-semibold"
        style={{ color: open ? "#fff" : "rgba(255,255,255,0.75)" }}
      >
        <span className="max-w-[200px] truncate">
          {selected?.name ?? "All Projects"}
        </span>
        <ChevronDown
          className="w-3 h-3 shrink-0 transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="rounded-[10px] bg-white overflow-hidden shadow-2xl"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 300,
            zIndex: 9999,
            border: "1px solid #E2E8F0",
          }}
        >
          <div className="px-3 py-2 border-b border-[#F1F5F9]">
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
              Switch Project
            </span>
          </div>
          {projects.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-[#94A3B8]">No projects in this cluster</div>
          ) : (
            projects.map((proj) => {
              const dot   = SEV_DOT[proj.severity] ?? SEV_DOT.default;
              const isAct = selected?.id === proj.id;
              return (
                <button
                  key={proj.id}
                  onClick={() => { onSelect?.(proj); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
                >
                  {/* severity dot */}
                  <span style={{
                    width: 8, height: 8, borderRadius: "50%",
                    backgroundColor: dot, flexShrink: 0,
                  }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#0F172A] truncate">{proj.name}</div>
                    <div className="text-[10px] text-[#94A3B8] mt-0.5">{proj.pipelineCount} pipeline{proj.pipelineCount !== 1 ? "s" : ""}</div>
                  </div>
                  {isAct
                    ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: TEAL }} />
                    : null
                  }
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// ── Cluster switcher rendered inside the navbar breadcrumb ──────────────────

const CLUSTER_STATUS_DOT: Record<string, string> = {
  active:   "#22C55E",
  warning:  "#F59E0B",
  inactive: "#94A3B8",
};

function ClusterSwitcherBreadcrumb({
  selected,
  accountId,
  onSelect,
}: {
  selected: Cluster | null;
  accountId?: string | null;
  onSelect?: (c: Cluster) => void;
}) {
  const [open, setOpen] = useState(false);
  const [pos, setPos]   = useState({ top: 0, left: 0 });
  const btnRef          = useRef<HTMLButtonElement>(null);
  const panelRef        = useRef<HTMLDivElement>(null);

  const clusters = accountId
    ? MOCK_CLUSTERS.filter((c) => c.accountId === accountId)
    : [];

  useLayoutEffect(() => {
    if (!open || !btnRef.current) return;
    const r = btnRef.current.getBoundingClientRect();
    setPos({ top: r.bottom + 6, left: r.left });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (
        !btnRef.current?.contains(e.target as Node) &&
        !panelRef.current?.contains(e.target as Node)
      ) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1 hover:text-white transition-colors font-semibold"
        style={{ color: open ? "#fff" : "rgba(255,255,255,0.75)" }}
      >
        <span className="max-w-[220px] truncate">
          {selected?.name ?? "Select cluster"}
        </span>
        <ChevronDown
          className="w-3 h-3 shrink-0 transition-transform duration-150"
          style={{ transform: open ? "rotate(180deg)" : "rotate(0)" }}
        />
      </button>

      {open && createPortal(
        <div
          ref={panelRef}
          className="rounded-[10px] bg-white overflow-hidden shadow-2xl"
          style={{
            position: "fixed",
            top: pos.top,
            left: pos.left,
            width: 320,
            zIndex: 9999,
            border: "1px solid #E2E8F0",
          }}
        >
          <div className="px-3 py-2 border-b border-[#F1F5F9]">
            <span className="text-[9px] font-bold uppercase tracking-[0.08em] text-[#94A3B8]">
              Switch Cluster
            </span>
          </div>
          {clusters.length === 0 ? (
            <div className="px-3 py-3 text-[11px] text-[#94A3B8]">No clusters in this account</div>
          ) : (
            clusters.map((cl) => {
              const dot    = CLUSTER_STATUS_DOT[cl.status] ?? "#94A3B8";
              const isAct  = selected?.id === cl.id;
              return (
                <button
                  key={cl.id}
                  onClick={() => { onSelect?.(cl); setOpen(false); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left transition-colors hover:bg-[#F8FAFC]"
                >
                  <div
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                    style={{
                      backgroundColor: isAct ? TEAL : "#F1F5F9",
                      border: `1px solid ${isAct ? TEAL : "#E2E8F0"}`,
                    }}
                  >
                    <Database className="w-3.5 h-3.5" style={{ color: isAct ? "#fff" : "#94A3B8" }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-semibold text-[#0F172A] truncate">{cl.name}</div>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <span style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: dot, display: "inline-block" }} />
                      <span className="text-[10px] text-[#94A3B8]">{cl.status} · {cl.instanceCount}/{cl.totalInstances} instances</span>
                    </div>
                  </div>
                  {isAct
                    ? <Check className="w-3.5 h-3.5 shrink-0" style={{ color: TEAL }} />
                    : null
                  }
                </button>
              );
            })
          )}
        </div>,
        document.body
      )}
    </>
  );
}

// ── AppLayout ─────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
  onPlatformSwitch?: (app: string) => void;
  fullBleed?: boolean;
  // Account context
  selectedAccount?: Account | null;
  onSelectAccount?: (a: Account) => void;
  // Nav context for breadcrumbs
  selectedCluster?: Cluster | null;
  selectedProject?: Project | null;
  selectedPipeline?: Pipeline | null;
  // Back-nav callbacks for breadcrumb clicks
  onGoToDesk?: () => void;
  onGoToProjects?: () => void;
  // Project & cluster switchers
  onSelectProject?: (p: Project) => void;
  onSelectCluster?: (c: Cluster) => void;
}

export function AppLayout({
  activePage,
  onPageChange,
  children,
  isDark = false,
  onToggleDark,
  onPlatformSwitch,
  fullBleed = false,
  selectedAccount,
  onSelectAccount,
  selectedCluster,
  selectedProject,
  selectedPipeline,
  onGoToDesk,
  onGoToProjects,
  onSelectProject,
  onSelectCluster,
}: AppLayoutProps) {

  // ── Build nav items (cluster-scoped items only when a cluster is selected) ─
  const mainNav = useMemo(
    () => selectedCluster ? [...BASE_NAV, ...CLUSTER_NAV] : BASE_NAV,
    [selectedCluster]
  );

  // ── Build breadcrumb per page ──────────────────────────────────────────────

  let breadcrumb: BreadcrumbSegment[] | undefined;

  if (activePage === "support-desk") {
    breadcrumb = [
      {
        label: (
          <AccountSwitcherBreadcrumb
            selected={selectedAccount ?? null}
            onSelect={onSelectAccount}
          />
        ),
      },
      { label: "All Clusters" },
    ];
  } else if (activePage === "all-clusters") {
    breadcrumb = [{ label: "All Clusters" }];
  } else if (activePage === "projects") {
    breadcrumb = [
      {
        label: (
          <AccountSwitcherBreadcrumb
            selected={selectedAccount ?? null}
            onSelect={onSelectAccount}
          />
        ),
      },
      { label: "All Clusters", onClick: onGoToDesk },
      {
        label: (
          <ClusterSwitcherBreadcrumb
            selected={selectedCluster ?? null}
            accountId={selectedAccount?.id}
            onSelect={onSelectCluster}
          />
        ),
      },
    ];
  } else if (activePage === "project-view") {
    breadcrumb = [
      {
        label: (
          <AccountSwitcherBreadcrumb
            selected={selectedAccount ?? null}
            onSelect={onSelectAccount}
          />
        ),
      },
      { label: "All Clusters", onClick: onGoToDesk },
      {
        label: (
          <ClusterSwitcherBreadcrumb
            selected={selectedCluster ?? null}
            accountId={selectedAccount?.id}
            onSelect={onSelectCluster}
          />
        ),
      },
      {
        label: (
          <ProjectSwitcherBreadcrumb
            selected={selectedProject ?? null}
            clusterId={selectedCluster?.id}
            onSelect={onSelectProject}
          />
        ),
      },
    ];
  } else if (activePage === "pipeline-detail") {
    const crumbs: BreadcrumbSegment[] = [
      {
        label: (
          <AccountSwitcherBreadcrumb
            selected={selectedAccount ?? null}
            onSelect={onSelectAccount}
          />
        ),
      },
      { label: "All Clusters", onClick: onGoToDesk },
      {
        label: (
          <ClusterSwitcherBreadcrumb
            selected={selectedCluster ?? null}
            accountId={selectedAccount?.id}
            onSelect={onSelectCluster}
          />
        ),
      },
      {
        label: (
          <ProjectSwitcherBreadcrumb
            selected={selectedProject ?? null}
            clusterId={selectedCluster?.id}
            onSelect={onSelectProject}
          />
        ),
      },
    ];
    if (selectedPipeline) crumbs.push({ label: selectedPipeline.name });
    breadcrumb = crumbs;
  } else if (activePage === "compute" || activePage === "cameras") {
    breadcrumb = [
      {
        label: (
          <AccountSwitcherBreadcrumb
            selected={selectedAccount ?? null}
            onSelect={onSelectAccount}
          />
        ),
      },
      { label: "All Clusters", onClick: onGoToDesk },
      {
        label: (
          <ClusterSwitcherBreadcrumb
            selected={selectedCluster ?? null}
            accountId={selectedAccount?.id}
            onSelect={onSelectCluster}
          />
        ),
      },
      { label: activePage === "compute" ? "Compute" : "Cameras" },
    ];
  }

  return (
    <AppShell
      navItems={mainNav}
      footerNavItems={FOOTER_NAV}
      activePage={activePage}
      onPageChange={(p) => onPageChange(p as Page)}
      platformLabel="Support Platform"
      activePlatformId="support"
      onPlatformSwitch={onPlatformSwitch}
      isDark={isDark}
      onToggleDark={onToggleDark}
      breadcrumb={breadcrumb}
      contentClassName={fullBleed || activePage === "settings" ? "p-0 min-h-0 overflow-hidden" : "p-6"}
    >
      {children}
    </AppShell>
  );
}
