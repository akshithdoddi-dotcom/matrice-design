import { useState } from "react";
import { Page } from "@/app/components/layout/AppSidebar";
import { AppLayout } from "@/app/components/layout/AppLayout";
import { SupportDesk } from "@/app/components/pages/SupportDesk";
import { AllClusters } from "@/app/components/pages/AllClusters";
import { Projects } from "@/app/components/pages/Projects";
import { PipelineDetail } from "@/app/components/pages/PipelineDetail";
import { ProjectView } from "@/app/components/pages/ProjectView";
import { Compute } from "@/app/components/pages/Compute";
import { Cameras } from "@/app/components/pages/Cameras";
import { ComingSoon } from "@/app/components/pages/ComingSoon";
import { SettingsPage } from "@/app/components/pages/Settings";
import { Account, Cluster, Project, Pipeline } from "@/data/mockData";

const FULL_BLEED_PAGES: Page[] = ["support-desk", "all-clusters", "projects", "pipeline-detail", "project-view", "compute", "cameras"];

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

  const handleEnterProject = (project: Project) => {
    setSelectedProject(project);
    setSelectedPipeline(null);
    setActivePage("project-view");
  };

  const handleBackFromProjects = () => {
    setActivePage("support-desk");
  };

  const handleBackFromPipeline = () => {
    setActivePage("projects");
  };

  const handleBackFromProjectView = () => {
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
      selectedCluster={selectedCluster}
      selectedProject={selectedProject}
      selectedPipeline={selectedPipeline}
      onGoToDesk={handleBackFromProjects}
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
      {activePage === "all-clusters" && <AllClusters />}
      {activePage === "projects" && (
        <Projects
          account={selectedAccount}
          cluster={selectedCluster}
          initialOpenId={selectedProject?.id ?? null}
          onBack={handleBackFromProjects}
          onBackToDesk={handleBackFromProjects}
          onSelectPipeline={handleSelectPipeline}
          onEnterProject={handleEnterProject}
        />
      )}
      {activePage === "project-view" && (
        <ProjectView
          project={selectedProject}
          cluster={selectedCluster}
          account={selectedAccount}
          initialPipelineId={selectedPipeline?.id ?? null}
          onBack={handleBackFromProjectView}
          onBackToDesk={handleBackFromProjects}
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
      {activePage === "compute" && (
        <Compute account={selectedAccount} cluster={selectedCluster} />
      )}
      {activePage === "cameras" && (
        <Cameras account={selectedAccount} cluster={selectedCluster} />
      )}
      {activePage === "settings" && (
        <SettingsPage isDark={isDark} onToggleDark={() => setIsDark((v) => !v)} />
      )}
      {activePage !== "support-desk" &&
        activePage !== "all-clusters" &&
        activePage !== "projects" &&
        activePage !== "project-view" &&
        activePage !== "pipeline-detail" &&
        activePage !== "compute" &&
        activePage !== "cameras" &&
        activePage !== "settings" && (
          <ComingSoon page={activePage} />
        )}
    </AppLayout>
  );
}
