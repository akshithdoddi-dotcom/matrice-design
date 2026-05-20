import { useState, useEffect } from "react";
import { AppLayout, Page } from "@/app/components/layout/AppLayout";
import { MicroservicesContent } from "@analytics/status/StatusPage";

interface InternalAppProps {
  onPlatformSwitch?: (app: string) => void;
}

function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-3">
      <p className="text-sm font-semibold text-neutral-600">{title}</p>
      <p className="text-xs text-neutral-400">Coming soon</p>
    </div>
  );
}

function renderPage(page: Page) {
  switch (page) {
    case "dashboard":          return <PlaceholderPage title="Internal Dashboard" />;
    case "microservices":      return <MicroservicesContent />;
    case "kafka":              return <PlaceholderPage title="Kafka" />;
    case "redis":              return <PlaceholderPage title="Redis" />;
    case "clusters":           return <PlaceholderPage title="Clusters" />;
    case "system":             return <PlaceholderPage title="System" />;
    case "inference":          return <PlaceholderPage title="Inference" />;
    case "streaming-gateway":  return <PlaceholderPage title="Streaming Gateway" />;
    case "websocket":          return <PlaceholderPage title="Web Socket" />;
    case "cameras":            return <PlaceholderPage title="Cameras" />;
    case "ip-camera-logs":     return <PlaceholderPage title="IP Camera Logs" />;
    case "team":               return <PlaceholderPage title="Team" />;
    case "feature":            return <PlaceholderPage title="Feature" />;
  }
}

export default function App({ onPlatformSwitch }: InternalAppProps = {}) {
  const [activePage, setActivePage] = useState<Page>("microservices");

  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("matrice-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  return (
    <AppLayout
      activePage={activePage}
      onPageChange={setActivePage}
      isDark={isDark}
      onToggleDark={() => setIsDark(d => !d)}
      onPlatformSwitch={onPlatformSwitch}
    >
      {renderPage(activePage)}
    </AppLayout>
  );
}
