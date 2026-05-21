import { useState } from "react";
import { Page } from "@/app/components/layout/AppSidebar";
import { AppLayout } from "@/app/components/layout/AppLayout";
import { SupportDesk } from "@/app/components/pages/SupportDesk";
import { AllClusters } from "@/app/components/pages/AllClusters";
import { Projects } from "@/app/components/pages/Projects";
import { PipelineDetail } from "@/app/components/pages/PipelineDetail";
import { ComingSoon } from "@/app/components/pages/ComingSoon";
import { SettingsPage } from "@/app/components/pages/Settings";
import { Account, Cluster, Project, Pipeline } from "@/data/mockData";

const FULL_BLEED_PAGES: Page[] = ["support-desk", "all-clusters", "projects", "pipeline-detail"];

interface AppProps {
  onPlatformSwitch?: (app: string) => void;
}

export default function App({ onPlatformSwitch }: AppProps = {}) {
  const [activePage, setActivePage]           = useState<Page>("support-desk");
  const [isDark, setIsDark]                   = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [selectedCluster, setSelectedCluster] = useState<Cluster | null>(null);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [selectedPipeline, setSelectedPipeline] = useState<Pipeline | null>(null);

  const handleSelectAccount = (account: Account) => {
    setSelectedAccount(account);
    setSelectedCluster(null);
    setSelectedProject(null);
  };

  const handleSelectCluster = (cluster: Cluster) => {
    setSelectedCluster(cluster);
    setSelectedProject(null);
    setActivePage("projects");
  };

  const handleSelectProject = (cluster: Cluster, project: Project) => {
    setSelectedCluster(cluster);
    setSelectedProject(project);
    setActivePage("projects");
  };

  const handleSelectPipeline = (project: Project, pipeline: Pipeline) => {
    setSelectedProject(project);
    setSelectedPipeline(pipeline);
    setActivePage("pipeline-detail");
  };

  const handleBackFromProjects = () => {
    setActivePage("support-desk");
  };

  const handleBackFromPipeline = () => {
    setActivePage("projects");
  };

  return (
    <AppLayout
      activePage={activePage}
      onPageChange={setActivePage}
      isDark={isDark}
      onToggleDark={() => setIsDark((v) => !v)}
      onPlatformSwitch={onPlatformSwitch}
      fullBleed={FULL_BLEED_PAGES.includes(activePage)}
      selectedAccount={selectedAccount}
      onSelectAccount={handleSelectAccount}
    >
      {activePage === "support-desk" && (
        <SupportDesk
          selectedAccount={selectedAccount}
          onSelectAccount={handleSelectAccount}
          onSelectCluster={handleSelectCluster}
          onSelectProject={handleSelectProject}
        />
      )}
      {activePage === "all-clusters" && <AllClusters />}
      {activePage === "projects" && (
        <Projects
          account={selectedAccount}
          cluster={selectedCluster}
          initialOpenId={selectedProject?.id ?? null}
          onBack={handleBackFromProjects}
          onBackToDesk={handleBackFromProjects}
          onSelectPipeline={handleSelectPipeline}
        />
      )}
      {activePage === "pipeline-detail" && (
        <PipelineDetail
          project={selectedProject}
          pipeline={selectedPipeline}
          cluster={selectedCluster}
          account={selectedAccount}
          onBack={handleBackFromPipeline}
          onBackToDesk={handleBackFromProjects}
        />
      )}
      {activePage === "settings" && (
        <SettingsPage isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />
      )}
      {activePage !== "support-desk" &&
        activePage !== "all-clusters" &&
        activePage !== "projects" &&
        activePage !== "pipeline-detail" &&
        activePage !== "settings" && (
          <ComingSoon page={activePage} />
        )}
    </AppLayout>
  );
}
