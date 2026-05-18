import { useState, useEffect } from "react";
import { AppLayout, Page, ProjectPage } from "@/app/components/layout/AppLayout";
import { TrainingDashboard } from "@/app/components/pages/TrainingDashboard";
import { AllProjects } from "@/app/components/pages/AllProjects";
import { ComputePage } from "@/app/components/pages/ComputePage";
import { ProjectHome } from "@/app/components/project/ProjectHome";
import { Datasets } from "@/app/components/project/Datasets";
import { TrainingJobs } from "@/app/components/project/TrainingJobs";
import { Deployments } from "@/app/components/project/Deployments";
import { TrainingProject, MOCK_PROJECTS } from "@/app/data/mockData";

interface TrainingAppProps {
  onPlatformSwitch?: (app: string) => void;
}

export default function App({ onPlatformSwitch }: TrainingAppProps = {}) {
  const [activePage, setActivePage] = useState<Page>("dashboard");
  const [selectedProject, setSelectedProject] = useState<TrainingProject | null>(null);
  const [activeProjectPage, setActiveProjectPage] = useState<ProjectPage>("home");
  const [projects, setProjects] = useState<TrainingProject[]>(MOCK_PROJECTS);

  const [isDark, setIsDark] = useState<boolean>(() => {
    try { return localStorage.getItem("matrice-theme") === "dark"; } catch { return false; }
  });

  useEffect(() => {
    document.documentElement.classList.toggle("dark", isDark);
    try { localStorage.setItem("matrice-theme", isDark ? "dark" : "light"); } catch {}
  }, [isDark]);

  function openProject(project: TrainingProject) {
    setSelectedProject(project);
    setActiveProjectPage("home");
  }

  function exitProject() {
    setSelectedProject(null);
    setActivePage("dashboard");
  }

  function renderContent() {
    if (selectedProject) {
      switch (activeProjectPage) {
        case "home":        return <ProjectHome  project={selectedProject} onNavigate={setActiveProjectPage} />;
        case "datasets":    return <Datasets     project={selectedProject} />;
        case "training":    return <TrainingJobs project={selectedProject} />;
        case "deployments": return <Deployments  project={selectedProject} />;
      }
    }

    switch (activePage) {
      case "dashboard": return <TrainingDashboard onOpenProject={openProject} />;
      case "projects":  return (
        <AllProjects
          projects={projects}
          onProjectsChange={setProjects}
          onOpenProject={openProject}
        />
      );
      case "compute":   return <ComputePage />;
      default:          return (
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
      onPageChange={(page) => { setActivePage(page); setSelectedProject(null); }}
      projectName={selectedProject?.name}
      activeProjectPage={activeProjectPage}
      onProjectPageChange={setActiveProjectPage}
      onExitProject={exitProject}
      isDark={isDark}
      onToggleDark={() => setIsDark((d) => !d)}
      onPlatformSwitch={onPlatformSwitch}
      contentClassName="flex flex-1 flex-col overflow-hidden p-0"
    >
      {renderContent()}
    </AppLayout>
  );
}
