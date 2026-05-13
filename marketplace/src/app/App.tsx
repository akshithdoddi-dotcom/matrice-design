import { useState, useEffect } from "react";
import { AppLayout, Page } from "@/app/components/layout/AppLayout";
import { MarketplaceDashboard } from "@/app/components/pages/MarketplaceDashboard";
import { ServicesPage } from "@/app/components/pages/ServicesPage";
import { PartnersPage } from "@/app/components/pages/PartnersPage";
import { ComputePage } from "@/app/components/pages/ComputePage";
import { BYOMPage } from "@/app/components/pages/BYOMPage";
import { PublishPage } from "@/app/components/pages/PublishPage";

interface MarketplaceAppProps {
  onPlatformSwitch?: (app: string) => void;
}

export default function App({ onPlatformSwitch }: MarketplaceAppProps = {}) {
  const [activePage, setActivePage] = useState<Page>("dashboard");

  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("matrice-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  function renderContent() {
    switch (activePage) {
      case "dashboard": return <MarketplaceDashboard />;
      case "services":  return <ServicesPage />;
      case "partners":  return <PartnersPage />;
      case "publish":   return <PublishPage />;
      case "compute":   return <ComputePage />;
      case "byom":      return <BYOMPage />;
      default: return (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <p className="text-sm font-semibold text-neutral-600 capitalize">{activePage}</p>
          <p className="text-xs text-neutral-400">Coming soon</p>
        </div>
      );
    }
  }

  return (
    <AppLayout
      activePage={activePage}
      onPageChange={setActivePage}
      isDark={isDark}
      onToggleDark={() => setIsDark((d) => !d)}
      onPlatformSwitch={onPlatformSwitch}
    >
      {renderContent()}
    </AppLayout>
  );
}
