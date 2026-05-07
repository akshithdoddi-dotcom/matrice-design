import { ChevronDown, Home } from "lucide-react";
import { useFilters } from "../contexts/FilterContext";
import { useLocation, useNavigate } from "react-router";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
} from "./ui/breadcrumb";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

// Mock data - replace with actual data from your API
const mockAccounts = [
  { id: "97828867687198873076191I5", name: "Matrice Primary Account" },
  { id: "12345678901234567890", name: "Matrice Secondary Account" },
  { id: "98765432109876543210", name: "Demo Account" },
];

const mockProjects = [
  { id: "qatar_demo", name: "Qatar_Demo", account: "97828867687198873076191I5" },
  { id: "optix_demo", name: "Optix_Demo", account: "97828867687198873076191I5" },
  { id: "ml_ip_test", name: "ML-IP-Test-Feb-2026", account: "97828867687198873076191I5" },
  { id: "test_invite", name: "test_invite_project", account: "97828867687198873076191I5" },
];

const mockPipelines = [
  { id: "people_counting", name: "People counting and vehicle type monitoring", project: "qatar_demo" },
  { id: "fire_detection", name: "Fire Detection", project: "qatar_demo" },
  { id: "lpr_test", name: "LPR-Test", project: "qatar_demo" },
  { id: "lpr_test_2", name: "LPR-Test-2", project: "qatar_demo" },
];

// Breadcrumb mapping for page titles
const breadcrumbMap: Record<string, string> = {
  "/": "Support Desk",
  "/projects": "Projects",
  "/system-flow": "System Flow",
  "/cameras": "Cameras",
  "/gateways": "Gateways",
  "/compute": "Compute",
  "/issues": "Issues",
  "/downloads": "Downloads",
  "/settings": "Settings",
  "/help": "Help and Support",
  "/activity": "Activity",
};

export default function NavBreadcrumb() {
  const { filters, setAccount, setProject, setPipeline, clearFilters } = useFilters();
  const location = useLocation();
  const navigate = useNavigate();

  const selectedAccount = mockAccounts.find((a) => a.id === filters.account);
  const selectedProject = mockProjects.find((p) => p.id === filters.project);
  const selectedPipeline = mockPipelines.find((p) => p.id === filters.pipeline);

  const availableProjects = filters.account
    ? mockProjects.filter((p) => p.account === filters.account)
    : mockProjects;

  const availablePipelines = filters.project
    ? mockPipelines.filter((p) => p.project === filters.project)
    : mockPipelines;

  // Get current page title
  const getPageTitle = () => {
    // Check for dynamic routes
    if (
      location.pathname.startsWith("/cameras/") &&
      location.pathname !== "/cameras"
    ) {
      return "Camera Details";
    }
    return breadcrumbMap[location.pathname] || "Dashboard";
  };

  const pageTitle = getPageTitle();

  // Build breadcrumb items
  const breadcrumbItems = [];

  // Always show page title first
  breadcrumbItems.push({
    type: "page" as const,
    label: pageTitle,
  });

  // Add filter breadcrumbs if active
  if (filters.account) {
    breadcrumbItems.push({
      type: "account" as const,
      label: "Account",
      value: selectedAccount?.name || filters.account,
    });
  }

  if (filters.project) {
    breadcrumbItems.push({
      type: "project" as const,
      label: "Project",
      value: selectedProject?.name || filters.project,
    });
  }

  if (filters.pipeline) {
    breadcrumbItems.push({
      type: "pipeline" as const,
      label: "Pipeline",
      value: selectedPipeline?.name || filters.pipeline,
    });
  }

  // Helper to truncate long names
  const truncate = (str: string, maxLength: number = 30) => {
    if (str.length <= maxLength) return str;
    return str.substring(0, maxLength) + "...";
  };

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {/* Home icon - resets all filters */}
        <BreadcrumbItem>
          <button
            onClick={() => {
              clearFilters();
              navigate("/");
            }}
            className="flex items-center justify-center w-7 h-7 rounded-md hover:bg-accent transition-colors text-sidebar-foreground/70 hover:text-sidebar-foreground"
            title="Home"
          >
            <Home className="w-4 h-4" />
          </button>
        </BreadcrumbItem>

        <BreadcrumbSeparator />

        {/* Show page title */}
        <BreadcrumbItem>
          <BreadcrumbPage className="text-sidebar-foreground font-semibold">
            {pageTitle}
          </BreadcrumbPage>
        </BreadcrumbItem>

        {/* Account dropdown if account is selected */}
        {filters.account && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 hover:bg-accent px-2.5 py-1.5 rounded-md transition-colors text-sidebar-foreground border border-sidebar-border hover:border-primary/30 bg-sidebar-accent/50">
                  <span className="text-sm">
                    Account: <span className="font-semibold">{truncate(selectedAccount?.name || filters.account, 20)}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <DropdownMenuItem
                    onClick={() => setAccount(null)}
                    className="cursor-pointer"
                  >
                    <span className="text-muted-foreground">All Accounts</span>
                  </DropdownMenuItem>
                  {mockAccounts.map((account) => (
                    <DropdownMenuItem
                      key={account.id}
                      onClick={() => setAccount(account.id)}
                      className={`cursor-pointer ${
                        filters.account === account.id ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      <div className="flex flex-col gap-0.5 w-full">
                        <span className="font-medium">{account.name}</span>
                        <span className="text-xs text-muted-foreground font-mono truncate">
                          {account.id}
                        </span>
                      </div>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {/* Project dropdown if project is selected */}
        {filters.project && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 hover:bg-accent px-2.5 py-1.5 rounded-md transition-colors text-sidebar-foreground border border-sidebar-border hover:border-primary/30 bg-sidebar-accent/50">
                  <span className="text-sm">
                    Project: <span className="font-semibold">{truncate(selectedProject?.name || filters.project, 20)}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-64">
                  <DropdownMenuItem
                    onClick={() => setProject(null)}
                    className="cursor-pointer"
                  >
                    <span className="text-muted-foreground">All Projects</span>
                  </DropdownMenuItem>
                  {availableProjects.map((project) => (
                    <DropdownMenuItem
                      key={project.id}
                      onClick={() => setProject(project.id)}
                      className={`cursor-pointer ${
                        filters.project === project.id ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      {project.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}

        {/* Pipeline dropdown if pipeline is selected */}
        {filters.pipeline && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <DropdownMenu>
                <DropdownMenuTrigger className="flex items-center gap-1.5 hover:bg-accent px-2.5 py-1.5 rounded-md transition-colors text-sidebar-foreground border border-sidebar-border hover:border-primary/30 bg-sidebar-accent/50">
                  <span className="text-sm">
                    Pipeline: <span className="font-semibold">{truncate(selectedPipeline?.name || filters.pipeline, 20)}</span>
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-80">
                  <DropdownMenuItem
                    onClick={() => setPipeline(null)}
                    className="cursor-pointer"
                  >
                    <span className="text-muted-foreground">All Pipelines</span>
                  </DropdownMenuItem>
                  {availablePipelines.map((pipeline) => (
                    <DropdownMenuItem
                      key={pipeline.id}
                      onClick={() => setPipeline(pipeline.id)}
                      className={`cursor-pointer ${
                        filters.pipeline === pipeline.id ? "bg-primary/10 text-primary" : ""
                      }`}
                    >
                      {pipeline.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </BreadcrumbItem>
          </>
        )}
      </BreadcrumbList>
    </Breadcrumb>
  );
}