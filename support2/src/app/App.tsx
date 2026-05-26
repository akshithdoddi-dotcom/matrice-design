import { useState } from "react";
import { Page } from "@/app/components/layout/AppSidebar";
import { AppLayout } from "@/app/components/layout/AppLayout";
import { SupportDesk } from "@/app/components/pages/SupportDesk";
import { Projects } from "@/app/components/pages/Projects";
import { PipelineDetail } from "@/app/components/pages/PipelineDetail";
import { ProjectView } from "@/app/components/pages/ProjectView";
import { Compute } from "@/app/components/pages/Compute";
import { Cameras } from "@/app/components/pages/Cameras";
import { PipelineView } from "@/app/components/pages/PipelineView";
import { ComingSoon } from "@/app/components/pages/ComingSoon";
import { SettingsPage } from "@/app/components/pages/Settings";
import { Account, Cluster, Project, Pipeline } from "@/data/mockData";

// All pages are full-bleed in this design — no padding wrapper
const FULL_BLEED_PAGES: Page[] = [
  "support-desk", "projects", "pipeline-detail", "project-view",
  "compute", "cameras", "system-flow", "gateways", "ml-apps",
  "command-centre", "resource-visualizer", "pipeline-view",
];

interface AppProps {
  onPlatformSwitch?: (app: string) => void;
}

export default function App({ onPlatformSwitch }: AppProps = {}) {
  const [activePage, setActivePage]             = useState<Page>("support-desk");
  const [isDark, setIsDark]                     = useState(false);
  const [selectedAccount, setSelectedAccount]   = useState<Account | null>(null);
  const [selectedCluster, setSelectedCluster]   = useState<Cluster | null>(null);
  const [selectedProject, setSelectedProject]   = useState<Project | null>(null);
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

  const handleEnterProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedPipeline(null);
    setActivePage("project-view");
  };

  const handleGoToDesk = () => {
    setActivePage("support-desk");
  };

  const handleBackFromPipeline  = () => setActivePage("projects");
  const handleBackFromProjectView = () => setActivePage("projects");

  const handlePipelineClick = (project: Project, pipeline: Pipeline) => {
    setSelectedProject(project);
    setSelectedPipeline(pipeline);
    setActivePage("pipeline-view");
  };

  const knownPages: Page[] = [
    "support-desk", "projects", "pipeline-detail", "project-view",
    "compute", "cameras", "settings", "pipeline-view",
  ];

  return (
    <AppLayout
      activePage={activePage}
      onPageChange={(page) => setActivePage(page)}
      isDark={isDark}
      onToggleDark={() => setIsDark((v) => !v)}
      onPlatformSwitch={onPlatformSwitch}
      fullBleed={FULL_BLEED_PAGES.includes(activePage)}
      selectedAccount={selectedAccount}
      onSelectAccount={handleSelectAccount}
      selectedCluster={selectedCluster}
      selectedProject={selectedProject}
      selectedPipeline={selectedPipeline}
      onGoToDesk={handleGoToDesk}
      onGoToProjects={handleBackFromPipeline}
      onSelectCluster={(cluster) => {
        setSelectedCluster(cluster);
        setSelectedProject(null);
        setSelectedPipeline(null);
        setActivePage("projects");
      }}
      onSelectProject={(project) => {
        setSelectedProject(project);
        setSelectedPipeline(null);
        setActivePage("projects");
      }}
    >
      {activePage === "support-desk" && (
        <SupportDesk
          selectedAccount={selectedAccount}
          onSelectAccount={handleSelectAccount}
          onSelectCluster={handleSelectCluster}
          onSelectProject={handleSelectProject}
        />
      )}
      {activePage === "projects" && (
        <Projects
          account={selectedAccount}
          cluster={selectedCluster}
          initialOpenId={selectedProject?.id ?? null}
          onBack={handleGoToDesk}
          onBackToDesk={handleGoToDesk}
          onSelectPipeline={handleSelectPipeline}
          onEnterProject={handleEnterProject}
          onPipelineClick={handlePipelineClick}
        />
      )}
      {activePage === "project-view" && (
        <ProjectView
          project={selectedProject}
          cluster={selectedCluster}
          account={selectedAccount}
          initialPipelineId={selectedPipeline?.id ?? null}
          onBack={handleBackFromProjectView}
          onBackToDesk={handleGoToDesk}
        />
      )}
      {activePage === "pipeline-detail" && (
        <PipelineDetail
          project={selectedProject}
          pipeline={selectedPipeline}
          cluster={selectedCluster}
          account={selectedAccount}
          onBack={handleBackFromPipeline}
          onBackToDesk={handleGoToDesk}
        />
      )}
      {activePage === "compute" && (
        <Compute account={selectedAccount} cluster={selectedCluster} />
      )}
      {activePage === "cameras" && (
        <Cameras account={selectedAccount} cluster={selectedCluster} />
      )}
      {activePage === "pipeline-view" && (
        <PipelineView
          pipeline={selectedPipeline}
          project={selectedProject}
          cluster={selectedCluster}
          account={selectedAccount}
          onBack={handleBackFromPipeline}
        />
      )}
      {activePage === "settings" && (
        <SettingsPage isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />
      )}
      {!knownPages.includes(activePage) && activePage !== "settings" && (
        <ComingSoon page={activePage} />
      )}
    </AppLayout>
  );
}
