import { useState, useEffect, useLayoutEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { AppShell, NavItem } from "@fe-common/components/layout/AppShell";
import {
  Server,
  Cpu,
  Settings,
  HelpCircle,
  Briefcase,
  Check,
  ChevronDown,
} from "lucide-react";
import { Page } from "@/app/components/layout/AppSidebar";
import { Account, MOCK_ACCOUNTS, MOCK_CLUSTERS } from "@/data/mockData";

const MAIN_NAV: NavItem[] = [
  { id: "support-desk", label: "All Clusters", icon: Server },
  { id: "compute",      label: "Compute",      icon: Cpu    },
];

const FOOTER_NAV: NavItem[] = [
  { id: "settings", label: "Settings",      icon: Settings  },
  { id: "help",     label: "Help & Support", icon: HelpCircle },
];

const TEAL = "#00775B";

// ── Account switcher rendered inside the navbar breadcrumb ────────────────────

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

// ── AppLayout ─────────────────────────────────────────────────────────────────

interface AppLayoutProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
  children: React.ReactNode;
  isDark?: boolean;
  onToggleDark?: () => void;
  onPlatformSwitch?: (app: string) => void;
  fullBleed?: boolean;
  selectedAccount?: Account | null;
  onSelectAccount?: (a: Account) => void;
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
}: AppLayoutProps) {
  const breadcrumb =
    activePage === "support-desk"
      ? [
          { label: "All Clusters" },
          {
            label: (
              <AccountSwitcherBreadcrumb
                selected={selectedAccount ?? null}
                onSelect={onSelectAccount}
              />
            ),
          },
        ]
      : undefined;

  return (
    <AppShell
      navItems={MAIN_NAV}
      footerNavItems={FOOTER_NAV}
      activePage={activePage}
      onPageChange={(p) => onPageChange(p as Page)}
      platformLabel="Support Platform"
      activePlatformId="support"
      onPlatformSwitch={onPlatformSwitch}
      isDark={isDark}
      onToggleDark={onToggleDark}
      breadcrumb={breadcrumb}
      contentClassName={fullBleed || activePage === "settings" ? "p-0 min-h-0" : "p-6"}
    >
      {children}
    </AppShell>
  );
}
