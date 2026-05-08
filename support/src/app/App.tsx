import { useState } from "react";
import { AppSidebar, AppHeader, Page } from "@/app/components/layout/AppSidebar";
import { SupportDesk } from "@/app/components/pages/SupportDesk";
import { Projects } from "@/app/components/pages/Projects";
import { ComingSoon } from "@/app/components/pages/ComingSoon";
import { Account } from "@/data/mockData";
import { cn } from "@/app/lib/utils";

const PAGE_TITLES: Record<Page, string> = {
  "support-desk":   "Support Desk",
  "projects":       "Projects",
  "system-flow":    "System Flow",
  "cameras":        "Cameras",
  "gateways":       "Gateways",
  "compute":        "Compute",
  "ml-apps":        "ML Apps",
  "command-centre": "Command Centre",
  "settings":       "Settings",
};

export default function App() {
  const [activePage, setActivePage]         = useState<Page>("support-desk");
  const [collapsed, setCollapsed]           = useState(false);
  const [isDark, setIsDark]                 = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setActivePage("projects");
  };

  const handleBack = () => {
    setActivePage("support-desk");
  };

  const FULL_BLEED: Page[] = ["projects"]; // pages that handle their own top padding
  const isFullBleed = FULL_BLEED.includes(activePage);

  return (
    <div className={cn("flex h-screen overflow-hidden", isDark && "dark")} style={{ backgroundColor: "#F8FAFC" }}>
      {/* Sidebar */}
      <AppSidebar
        activePage={activePage}
        onPageChange={setActivePage}
        collapsed={collapsed}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        isDark={isDark}
        onToggleDark={() => setIsDark((v) => !v)}
      />

      {/* Main area */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <AppHeader activePage={activePage} title={PAGE_TITLES[activePage]} />

        <main className={cn("flex-1 overflow-auto", isFullBleed ? "" : "p-6")}>
          {activePage === "support-desk" && (
            <SupportDesk onSelectAccount={handleSelectAccount} />
          )}
          {activePage === "projects" && (
            <Projects account={selectedAccount} onBack={handleBack} />
          )}
          {activePage !== "support-desk" && activePage !== "projects" && (
            <ComingSoon page={activePage} />
          )}
        </main>
      </div>
    </div>
  );
}
