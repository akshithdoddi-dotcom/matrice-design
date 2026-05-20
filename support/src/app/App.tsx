import { useState } from "react";
import { Page } from "@/app/components/layout/AppSidebar";
import { AppLayout } from "@/app/components/layout/AppLayout";
import { SupportDesk } from "@/app/components/pages/SupportDesk";
import { Projects } from "@/app/components/pages/Projects";
import { ComingSoon } from "@/app/components/pages/ComingSoon";
import { SettingsPage } from "@/app/components/pages/Settings";
import { Account } from "@/data/mockData";

const FULL_BLEED_PAGES: Page[] = ["projects"];

interface AppProps {
  onPlatformSwitch?: (app: string) => void;
}

export default function App({ onPlatformSwitch }: AppProps = {}) {
  const [activePage, setActivePage]             = useState<Page>("support-desk");
  const [isDark, setIsDark]                     = useState(false);
  const [selectedAccount, setSelectedAccount]   = useState<Account | null>(null);

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setActivePage("projects");
  };

  const handleBack = () => {
    setActivePage("support-desk");
  };

  return (
    <AppLayout
      activePage={activePage}
      onPageChange={setActivePage}
      isDark={isDark}
      onToggleDark={() => setIsDark((v) => !v)}
      onPlatformSwitch={onPlatformSwitch}
      fullBleed={FULL_BLEED_PAGES.includes(activePage)}
    >
      {activePage === "support-desk" && (
        <SupportDesk onSelectAccount={handleSelectAccount} />
      )}
      {activePage === "projects" && (
        <Projects account={selectedAccount} onBack={handleBack} />
      )}
      {activePage === "settings" && (
        <SettingsPage isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />
      )}
      {activePage !== "support-desk" && activePage !== "projects" && activePage !== "settings" && (
        <ComingSoon page={activePage} />
      )}
    </AppLayout>
  );
}
