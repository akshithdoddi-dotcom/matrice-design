// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectSeverity = "default" | "critical" | "high" | "medium" | "stable" | "resolved";
export type ComponentStatus  = "critical" | "warning" | "stable" | "info";
export type CameraStatus     = "online" | "offline" | "degraded";
export type MLAppStatus      = "running" | "error" | "stopped" | "starting";

export interface MLApp {
  id: string;
  name: string;
  model: string;
  status: MLAppStatus;
  latencyMs: number;
  accuracy: number;
}

export interface Camera {
  id: string;
  name: string;
  ip: string;
  location: string;
  status: CameraStatus;
  fps: number;
  resolution: string;
  mlApps: MLApp[];
}

export interface PipelineComponent {
  name: string;
  status: ComponentStatus;
}

export interface Pipeline {
  id: string;
  name: string;
  headerColor: string;
  comps: PipelineComponent[];
  note: string;
  cameras: Camera[];
}

export interface Project {
  id: string;
  clusterId: string;
  name: string;
  severity: ProjectSeverity;
  pipelineCount: number;
  lastActive: string;
  pipelines: Pipeline[];
}

export interface Account {
  id: string;
  name: string;
  accountId: string;
  projectCount: number;
  tags: string[];
}

// ─── Clusters ────────────────────────────────────────────────────────────────

export type ClusterStatus = "active" | "warning" | "inactive";
export type ServiceStatus  = "running" | "starting" | "stopped" | "error";

export interface ClusterService {
  id: string;
  name: string;
  type: "SG" | "worker";
  status: ServiceStatus;
}

export interface Cluster {
  id: string;
  accountId: string;
  name: string;
  status: ClusterStatus;
  ip: string;
  location: string;
  instanceCount: number;
  totalInstances: number;
  sgCount: number;
  cpuCores: string;
  memory: string;
  services: ClusterService[];
}

// ─── Accounts ────────────────────────────────────────────────────────────────

export const MOCK_ACCOUNTS: Account[] = [
  {
    id: "acc-1",
    name: "Matrice Primary Account",
    accountId: "97828867687198873076191115",
    projectCount: 599,
    tags: ["Matrice"],
  },
  {
    id: "acc-2",
    name: "Enterprise Security Corp",
    accountId: "48291736501928374659102038",
    projectCount: 142,
    tags: ["Enterprise", "Security"],
  },
  {
    id: "acc-3",
    name: "Urban Logistics Ltd",
    accountId: "73910284756103928475610293",
    projectCount: 87,
    tags: ["Logistics", "Retail"],
  },
];

export const MOCK_CLUSTERS: Cluster[] = [
  // ── Matrice Primary Account (acc-1) ───────────────────────────────────────
  {
    id: "cl-1", accountId: "acc-1",
    name: "Thor4-dev-MM-test-v2-default",
    status: "active", ip: "10.1.5.23", location: "unknown",
    instanceCount: 17, totalInstances: 17, sgCount: 17, cpuCores: "N/A", memory: "N/A",
    services: [
      { id: "s-1-1", name: "Thor4-dev-MM-test-v2-default-default-calm-comet-ddd1",    type: "SG", status: "starting" },
      { id: "s-1-2", name: "Thor4-dev-MM-test-v2-default-default-stellar-tiger-9981", type: "SG", status: "starting" },
      { id: "s-1-3", name: "Thor4-dev-MM-test-v2-default-default-prime-stone-1f45",   type: "SG", status: "starting" },
      { id: "s-1-4", name: "Thor4-dev-MM-test-v2-default-default-fair-comet-2eae",    type: "SG", status: "starting" },
      { id: "s-1-5", name: "Thor4-dev-MM-test-v2-default-default-polar-tiger-6db4",   type: "SG", status: "starting" },
      { id: "s-1-6", name: "Thor4-dev-MM-test-v2-default-default-cosmic-falcon-bfa2", type: "SG", status: "starting" },
      { id: "s-1-7", name: "Thor4-dev-MM-test-v2-default-default-golden-flare-d217",  type: "SG", status: "starting" },
      { id: "s-1-8", name: "Thor4-dev-MM-test-v2-default-default-bright-ember-e409",  type: "SG", status: "starting" },
    ],
  },
  {
    id: "cl-2", accountId: "acc-1",
    name: "Thor4-dev-MM-default",
    status: "active", ip: "73.47.89.220", location: "unknown",
    instanceCount: 4, totalInstances: 4, sgCount: 4, cpuCores: "32", memory: "128 GB",
    services: [
      { id: "s-2-1", name: "Thor4-dev-MM-default-default-swift-nova-a12c",  type: "SG", status: "running" },
      { id: "s-2-2", name: "Thor4-dev-MM-default-default-bright-star-b45d", type: "SG", status: "running" },
      { id: "s-2-3", name: "Thor4-dev-MM-default-default-iron-hawk-c78e",   type: "SG", status: "running" },
      { id: "s-2-4", name: "Thor4-dev-MM-default-default-silver-moon-d90f", type: "SG", status: "running" },
    ],
  },
  {
    id: "cl-3", accountId: "acc-1",
    name: "RTX-dev-ML-v1-default",
    status: "warning", ip: "10.9.201.154", location: "unknown",
    instanceCount: 3, totalInstances: 4, sgCount: 3, cpuCores: "24", memory: "64 GB",
    services: [
      { id: "s-3-1", name: "RTX-dev-ML-v1-default-inference-alpha",  type: "SG",     status: "running" },
      { id: "s-3-2", name: "RTX-dev-ML-v1-default-inference-beta",   type: "SG",     status: "running" },
      { id: "s-3-3", name: "RTX-dev-ML-v1-default-inference-gamma",  type: "SG",     status: "stopped" },
      { id: "s-3-4", name: "RTX-dev-ML-v1-default-monitor-service",  type: "worker", status: "running" },
    ],
  },
  {
    id: "cl-4", accountId: "acc-1",
    name: "H100-default",
    status: "active", ip: "192.168.1.55", location: "Sacramento",
    instanceCount: 2, totalInstances: 2, sgCount: 2, cpuCores: "64", memory: "512 GB",
    services: [
      { id: "s-4-1", name: "H100-default-primary-sg",   type: "SG", status: "running" },
      { id: "s-4-2", name: "H100-default-secondary-sg", type: "SG", status: "running" },
    ],
  },
  {
    id: "cl-5", accountId: "acc-1",
    name: "Fault-Tolerant-default",
    status: "warning", ip: "192.68.1.2", location: "Jersey",
    instanceCount: 2, totalInstances: 3, sgCount: 2, cpuCores: "16", memory: "32 GB",
    services: [
      { id: "s-5-1", name: "FT-default-node-alpha",  type: "SG",     status: "running" },
      { id: "s-5-2", name: "FT-default-node-beta",   type: "SG",     status: "running" },
      { id: "s-5-3", name: "FT-default-node-gamma",  type: "worker", status: "stopped" },
    ],
  },
  {
    id: "cl-6", accountId: "acc-1",
    name: "Edge-Compute-v2",
    status: "active", ip: "10.0.0.45", location: "Dallas",
    instanceCount: 6, totalInstances: 6, sgCount: 5, cpuCores: "48", memory: "256 GB",
    services: [
      { id: "s-6-1", name: "Edge-Compute-v2-sg-primary",   type: "SG",     status: "running" },
      { id: "s-6-2", name: "Edge-Compute-v2-sg-secondary", type: "SG",     status: "running" },
      { id: "s-6-3", name: "Edge-Compute-v2-sg-tertiary",  type: "SG",     status: "running" },
      { id: "s-6-4", name: "Edge-Compute-v2-worker-1",     type: "worker", status: "running" },
      { id: "s-6-5", name: "Edge-Compute-v2-worker-2",     type: "worker", status: "running" },
      { id: "s-6-6", name: "Edge-Compute-v2-monitor",      type: "worker", status: "running" },
    ],
  },
  // ── Enterprise Security Corp (acc-2) ─────────────────────────────────────
  {
    id: "cl-7", accountId: "acc-2",
    name: "SEC-Cluster-Alpha",
    status: "active", ip: "10.2.1.100", location: "New York",
    instanceCount: 5, totalInstances: 5, sgCount: 5, cpuCores: "32", memory: "128 GB",
    services: [
      { id: "s-7-1", name: "SEC-Alpha-sg-1", type: "SG", status: "running" },
      { id: "s-7-2", name: "SEC-Alpha-sg-2", type: "SG", status: "running" },
      { id: "s-7-3", name: "SEC-Alpha-sg-3", type: "SG", status: "running" },
      { id: "s-7-4", name: "SEC-Alpha-sg-4", type: "SG", status: "running" },
      { id: "s-7-5", name: "SEC-Alpha-sg-5", type: "SG", status: "running" },
    ],
  },
  {
    id: "cl-8", accountId: "acc-2",
    name: "SEC-Cluster-Beta",
    status: "warning", ip: "10.2.1.101", location: "Chicago",
    instanceCount: 3, totalInstances: 4, sgCount: 3, cpuCores: "24", memory: "64 GB",
    services: [
      { id: "s-8-1", name: "SEC-Beta-sg-1",    type: "SG",     status: "running" },
      { id: "s-8-2", name: "SEC-Beta-sg-2",    type: "SG",     status: "running" },
      { id: "s-8-3", name: "SEC-Beta-sg-3",    type: "SG",     status: "stopped" },
      { id: "s-8-4", name: "SEC-Beta-monitor", type: "worker", status: "running" },
    ],
  },
  // ── Urban Logistics Ltd (acc-3) ──────────────────────────────────────────
  {
    id: "cl-9", accountId: "acc-3",
    name: "LOG-Primary",
    status: "active", ip: "172.16.0.1", location: "Los Angeles",
    instanceCount: 6, totalInstances: 6, sgCount: 6, cpuCores: "48", memory: "192 GB",
    services: [
      { id: "s-9-1", name: "LOG-Primary-sg-1", type: "SG", status: "running" },
      { id: "s-9-2", name: "LOG-Primary-sg-2", type: "SG", status: "running" },
      { id: "s-9-3", name: "LOG-Primary-sg-3", type: "SG", status: "running" },
      { id: "s-9-4", name: "LOG-Primary-sg-4", type: "SG", status: "running" },
      { id: "s-9-5", name: "LOG-Primary-sg-5", type: "SG", status: "running" },
      { id: "s-9-6", name: "LOG-Primary-sg-6", type: "SG", status: "running" },
    ],
  },
  {
    id: "cl-10", accountId: "acc-3",
    name: "LOG-Edge-Cluster",
    status: "active", ip: "172.16.0.2", location: "Seattle",
    instanceCount: 3, totalInstances: 3, sgCount: 3, cpuCores: "16", memory: "48 GB",
    services: [
      { id: "s-10-1", name: "LOG-Edge-sg-1", type: "SG", status: "running" },
      { id: "s-10-2", name: "LOG-Edge-sg-2", type: "SG", status: "running" },
      { id: "s-10-3", name: "LOG-Edge-sg-3", type: "SG", status: "running" },
    ],
  },
];

// ─── Projects ─────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  // ── CRITICAL ──────────────────────────────────────────────────────────────
  {
    id: "proj-001",
    clusterId: "cl-1",
    name: "Weapon-Detection",
    severity: "critical",
    pipelineCount: 1,
    lastActive: "2m ago",
    pipelines: [
      {
        id: "pl-001",
        name: "weapon Detection",
        headerColor: "#E7000B",
        comps: [
          { name: "Cameras",  status: "critical" },
          { name: "Gateway",  status: "warning"  },
          { name: "Compute",  status: "stable"   },
          { name: "ML",       status: "critical" },
        ],
        note: "Cameras, ML down",
        cameras: [
          {
            id: "cam-001-1", name: "Main-Entrance-PTZ",
            ip: "192.168.1.101", location: "Main Entrance",
            status: "offline", fps: 0, resolution: "4K UHD",
            mlApps: [
              { id: "ml-001-1", name: "Weapon Detector v2", model: "YOLOv8-Weapon", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-001-2", name: "Lobby-Fixed-01",
            ip: "192.168.1.102", location: "Lobby",
            status: "degraded", fps: 12, resolution: "1080p",
            mlApps: [
              { id: "ml-001-2", name: "Weapon Detector v2", model: "YOLOv8-Weapon", status: "running", latencyMs: 87, accuracy: 94.2 },
            ],
          },
          {
            id: "cam-001-3", name: "Side-Door-02",
            ip: "192.168.1.103", location: "Side Door",
            status: "offline", fps: 0, resolution: "1080p",
            mlApps: [
              { id: "ml-001-3", name: "Weapon Detector v2", model: "YOLOv8-Weapon", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-002",
    clusterId: "cl-1",
    name: "Perimeter-Breach-Alert",
    severity: "critical",
    pipelineCount: 2,
    lastActive: "5m ago",
    pipelines: [
      {
        id: "pl-002a",
        name: "North Gate Monitor",
        headerColor: "#E7000B",
        comps: [
          { name: "Cameras",  status: "critical" },
          { name: "Gateway",  status: "critical" },
          { name: "Compute",  status: "warning"  },
          { name: "ML",       status: "stable"   },
        ],
        note: "Feed loss on 4 cams",
        cameras: [
          {
            id: "cam-002a-1", name: "Gate-PTZ-01",
            ip: "10.1.5.10", location: "North Gate Entry",
            status: "offline", fps: 0, resolution: "4K UHD",
            mlApps: [
              { id: "ml-002a-1", name: "Perimeter Breach", model: "ResNet-Perimeter", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-002a-2", name: "Gate-PTZ-02",
            ip: "10.1.5.11", location: "North Gate Exit",
            status: "offline", fps: 0, resolution: "4K UHD",
            mlApps: [
              { id: "ml-002a-2", name: "Perimeter Breach", model: "ResNet-Perimeter", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-002a-3", name: "Gate-Fixed-03",
            ip: "10.1.5.12", location: "Gate Overhang",
            status: "offline", fps: 0, resolution: "2MP",
            mlApps: [
              { id: "ml-002a-3", name: "Perimeter Breach", model: "ResNet-Perimeter", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-002a-4", name: "Gate-Wide-04",
            ip: "10.1.5.13", location: "Gate Perimeter",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-002a-4", name: "Perimeter Breach", model: "ResNet-Perimeter", status: "running", latencyMs: 52, accuracy: 96.8 },
            ],
          },
        ],
      },
      {
        id: "pl-002b",
        name: "South Entry",
        headerColor: "#EA580C",
        comps: [
          { name: "Cameras",  status: "warning" },
          { name: "Gateway",  status: "stable"  },
          { name: "Compute",  status: "stable"  },
          { name: "ML",       status: "warning" },
        ],
        note: "Degraded inference",
        cameras: [
          {
            id: "cam-002b-1", name: "South-Entrance-01",
            ip: "10.1.5.20", location: "South Entry",
            status: "degraded", fps: 18, resolution: "1080p",
            mlApps: [
              { id: "ml-002b-1", name: "Breach Detector", model: "ResNet-Perimeter", status: "running", latencyMs: 134, accuracy: 88.1 },
              { id: "ml-002b-2", name: "Person Tracker",  model: "ByteTrack-v2",     status: "running", latencyMs: 67,  accuracy: 92.4 },
            ],
          },
          {
            id: "cam-002b-2", name: "South-Hall-02",
            ip: "10.1.5.21", location: "South Hall",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-002b-3", name: "Breach Detector", model: "ResNet-Perimeter", status: "running", latencyMs: 45, accuracy: 96.2 },
              { id: "ml-002b-4", name: "Person Tracker",  model: "ByteTrack-v2",     status: "running", latencyMs: 38, accuracy: 97.1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-003",
    clusterId: "cl-2",
    name: "Fire-Smoke-Detection",
    severity: "critical",
    pipelineCount: 3,
    lastActive: "12m ago",
    pipelines: [
      {
        id: "pl-003a",
        name: "Zone A Smoke",
        headerColor: "#E7000B",
        comps: [
          { name: "Cameras",  status: "critical" },
          { name: "Gateway",  status: "stable"   },
          { name: "Compute",  status: "stable"   },
          { name: "ML",       status: "critical" },
        ],
        note: "ML model crashed",
        cameras: [
          {
            id: "cam-003a-1", name: "Zone-A-Ceiling-01",
            ip: "10.2.0.11", location: "Zone A – Ceiling",
            status: "offline", fps: 0, resolution: "4K UHD",
            mlApps: [
              { id: "ml-003a-1", name: "Smoke Detector Pro", model: "FireNet-v3", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-003a-2", name: "Zone-A-Corner-02",
            ip: "10.2.0.12", location: "Zone A – NE Corner",
            status: "offline", fps: 0, resolution: "2MP",
            mlApps: [
              { id: "ml-003a-2", name: "Smoke Detector Pro", model: "FireNet-v3", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-003a-3", name: "Zone-A-Exit-03",
            ip: "10.2.0.13", location: "Zone A – Exit",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-003a-3", name: "Smoke Detector Pro", model: "FireNet-v3", status: "error", latencyMs: 0, accuracy: 0 },
            ],
          },
        ],
      },
      {
        id: "pl-003b",
        name: "Zone B Fire",
        headerColor: "#EA580C",
        comps: [
          { name: "Cameras",  status: "stable"  },
          { name: "Gateway",  status: "warning" },
          { name: "Compute",  status: "stable"  },
          { name: "ML",       status: "stable"  },
        ],
        note: "Gateway packet loss",
        cameras: [
          {
            id: "cam-003b-1", name: "Zone-B-Ceiling-01",
            ip: "10.2.0.21", location: "Zone B – Ceiling",
            status: "online", fps: 30, resolution: "4K UHD",
            mlApps: [
              { id: "ml-003b-1", name: "Fire Detector",   model: "FireNet-v3",    status: "running", latencyMs: 41, accuracy: 97.6 },
              { id: "ml-003b-2", name: "Smoke Classifier", model: "SmokeNet-v2", status: "running", latencyMs: 38, accuracy: 96.1 },
            ],
          },
          {
            id: "cam-003b-2", name: "Zone-B-Wall-01",
            ip: "10.2.0.22", location: "Zone B – South Wall",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-003b-3", name: "Fire Detector",   model: "FireNet-v3",    status: "running", latencyMs: 44, accuracy: 97.2 },
              { id: "ml-003b-4", name: "Smoke Classifier", model: "SmokeNet-v2", status: "running", latencyMs: 40, accuracy: 95.8 },
            ],
          },
        ],
      },
      {
        id: "pl-003c",
        name: "Warehouse",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All systems nominal",
        cameras: [
          {
            id: "cam-003c-1", name: "WH-Main-01",
            ip: "10.2.0.31", location: "Warehouse – Main",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-003c-1", name: "Fire Detector", model: "FireNet-v3", status: "running", latencyMs: 36, accuracy: 98.1 },
            ],
          },
          {
            id: "cam-003c-2", name: "WH-Back-02",
            ip: "10.2.0.32", location: "Warehouse – Back",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-003c-2", name: "Fire Detector", model: "FireNet-v3", status: "running", latencyMs: 38, accuracy: 97.8 },
            ],
          },
        ],
      },
    ],
  },
  // ── HIGH ──────────────────────────────────────────────────────────────────
  {
    id: "proj-004",
    clusterId: "cl-3",
    name: "Crowd-Density-Analysis",
    severity: "high",
    pipelineCount: 2,
    lastActive: "8m ago",
    pipelines: [
      {
        id: "pl-004a",
        name: "Main Entrance",
        headerColor: "#EA580C",
        comps: [
          { name: "Cameras",  status: "warning" },
          { name: "Gateway",  status: "stable"  },
          { name: "Compute",  status: "warning" },
          { name: "ML",       status: "stable"  },
        ],
        note: "High queue depth",
        cameras: [
          {
            id: "cam-004a-1", name: "Entrance-Wide-01",
            ip: "10.3.1.10", location: "Main Entrance – Wide",
            status: "degraded", fps: 15, resolution: "4K UHD",
            mlApps: [
              { id: "ml-004a-1", name: "Crowd Counter",   model: "CSRNet-v2",   status: "running", latencyMs: 112, accuracy: 91.3 },
              { id: "ml-004a-2", name: "Density Heatmap", model: "DenseNet-CD", status: "running", latencyMs: 145, accuracy: 89.7 },
            ],
          },
          {
            id: "cam-004a-2", name: "Entrance-PTZ-02",
            ip: "10.3.1.11", location: "Main Entrance – PTZ",
            status: "degraded", fps: 20, resolution: "2MP",
            mlApps: [
              { id: "ml-004a-3", name: "Crowd Counter",   model: "CSRNet-v2",   status: "running", latencyMs: 98,  accuracy: 93.0 },
              { id: "ml-004a-4", name: "Density Heatmap", model: "DenseNet-CD", status: "running", latencyMs: 120, accuracy: 90.5 },
            ],
          },
        ],
      },
      {
        id: "pl-004b",
        name: "Food Court",
        headerColor: "#EA580C",
        comps: [
          { name: "Cameras",  status: "stable"  },
          { name: "Gateway",  status: "warning" },
          { name: "Compute",  status: "stable"  },
          { name: "ML",       status: "warning" },
        ],
        note: "Intermittent latency",
        cameras: [
          {
            id: "cam-004b-1", name: "FoodCourt-Ceiling-01",
            ip: "10.3.1.20", location: "Food Court – Center",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-004b-1", name: "Crowd Counter", model: "CSRNet-v2", status: "running", latencyMs: 178, accuracy: 85.2 },
            ],
          },
          {
            id: "cam-004b-2", name: "FoodCourt-Corner-02",
            ip: "10.3.1.21", location: "Food Court – SE Corner",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-004b-2", name: "Crowd Counter", model: "CSRNet-v2", status: "running", latencyMs: 162, accuracy: 86.9 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-005",
    clusterId: "cl-3",
    name: "Vehicle-Count-Tracker",
    severity: "high",
    pipelineCount: 1,
    lastActive: "25m ago",
    pipelines: [
      {
        id: "pl-005",
        name: "Parking Lot A",
        headerColor: "#EA580C",
        comps: [
          { name: "Cameras",  status: "warning" },
          { name: "Gateway",  status: "stable"  },
          { name: "Compute",  status: "stable"  },
          { name: "ML",       status: "warning" },
        ],
        note: "Frame drop detected",
        cameras: [
          {
            id: "cam-005-1", name: "ParkingA-Entry",
            ip: "10.3.2.10", location: "Lot A – Entry Gate",
            status: "degraded", fps: 14, resolution: "4K UHD",
            mlApps: [
              { id: "ml-005-1", name: "Vehicle Counter",  model: "YOLOv8-Vehicle", status: "running", latencyMs: 143, accuracy: 90.4 },
              { id: "ml-005-2", name: "License Plate OCR", model: "LPRNET-v3",     status: "running", latencyMs: 210, accuracy: 87.6 },
            ],
          },
          {
            id: "cam-005-2", name: "ParkingA-Overhead",
            ip: "10.3.2.11", location: "Lot A – Overhead",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-005-3", name: "Vehicle Counter", model: "YOLOv8-Vehicle", status: "running", latencyMs: 55, accuracy: 96.3 },
            ],
          },
        ],
      },
    ],
  },
  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    id: "proj-006",
    clusterId: "cl-4",
    name: "PPE-Compliance-Monitor",
    severity: "medium",
    pipelineCount: 4,
    lastActive: "1h ago",
    pipelines: [
      {
        id: "pl-006a",
        name: "Assembly Zone 1",
        headerColor: "#E19A04",
        comps: [
          { name: "Cameras",  status: "stable"  },
          { name: "Gateway",  status: "stable"  },
          { name: "Compute",  status: "warning" },
          { name: "ML",       status: "stable"  },
        ],
        note: "CPU usage elevated",
        cameras: [
          {
            id: "cam-006a-1", name: "AZ1-Ceiling-01",
            ip: "192.168.2.11", location: "Assembly Zone 1 – Ceiling",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-006a-1", name: "PPE Detector",   model: "PPENet-v4",    status: "running", latencyMs: 62, accuracy: 95.8 },
              { id: "ml-006a-2", name: "Hardhat Detect", model: "HardhatNet-v2", status: "running", latencyMs: 58, accuracy: 96.4 },
            ],
          },
          {
            id: "cam-006a-2", name: "AZ1-Wall-02",
            ip: "192.168.2.12", location: "Assembly Zone 1 – Wall",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-006a-3", name: "PPE Detector", model: "PPENet-v4", status: "running", latencyMs: 65, accuracy: 95.2 },
            ],
          },
        ],
      },
      {
        id: "pl-006b",
        name: "Assembly Zone 2",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All systems nominal",
        cameras: [
          {
            id: "cam-006b-1", name: "AZ2-Ceiling-01",
            ip: "192.168.2.21", location: "Assembly Zone 2 – Ceiling",
            status: "online", fps: 30, resolution: "4K UHD",
            mlApps: [
              { id: "ml-006b-1", name: "PPE Detector",   model: "PPENet-v4",    status: "running", latencyMs: 44, accuracy: 97.3 },
              { id: "ml-006b-2", name: "Vest Detector",  model: "VestNet-v2",   status: "running", latencyMs: 41, accuracy: 97.8 },
            ],
          },
          {
            id: "cam-006b-2", name: "AZ2-PTZ-02",
            ip: "192.168.2.22", location: "Assembly Zone 2 – PTZ",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-006b-3", name: "PPE Detector", model: "PPENet-v4", status: "running", latencyMs: 47, accuracy: 96.9 },
            ],
          },
        ],
      },
      {
        id: "pl-006c",
        name: "Warehouse Floor",
        headerColor: "#E19A04",
        comps: [
          { name: "Cameras",  status: "warning" },
          { name: "Gateway",  status: "stable"  },
          { name: "Compute",  status: "stable"  },
          { name: "ML",       status: "stable"  },
        ],
        note: "1 camera offline",
        cameras: [
          {
            id: "cam-006c-1", name: "WH-Floor-01",
            ip: "192.168.2.31", location: "Warehouse Floor – Section A",
            status: "offline", fps: 0, resolution: "4K UHD",
            mlApps: [
              { id: "ml-006c-1", name: "PPE Detector", model: "PPENet-v4", status: "stopped", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-006c-2", name: "WH-Floor-02",
            ip: "192.168.2.32", location: "Warehouse Floor – Section B",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-006c-2", name: "PPE Detector", model: "PPENet-v4", status: "running", latencyMs: 51, accuracy: 96.1 },
            ],
          },
          {
            id: "cam-006c-3", name: "WH-Floor-03",
            ip: "192.168.2.33", location: "Warehouse Floor – Section C",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-006c-3", name: "PPE Detector", model: "PPENet-v4", status: "running", latencyMs: 49, accuracy: 96.5 },
            ],
          },
        ],
      },
      {
        id: "pl-006d",
        name: "Loading Bay",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All systems nominal",
        cameras: [
          {
            id: "cam-006d-1", name: "LoadBay-Entrance",
            ip: "192.168.2.41", location: "Loading Bay – Entrance",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-006d-1", name: "PPE Detector",  model: "PPENet-v4",  status: "running", latencyMs: 43, accuracy: 97.5 },
              { id: "ml-006d-2", name: "Forklift Detect", model: "FLNet-v3", status: "running", latencyMs: 56, accuracy: 96.0 },
            ],
          },
          {
            id: "cam-006d-2", name: "LoadBay-Dock-01",
            ip: "192.168.2.42", location: "Loading Bay – Dock",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-006d-3", name: "PPE Detector", model: "PPENet-v4", status: "running", latencyMs: 45, accuracy: 97.1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-007",
    clusterId: "cl-4",
    name: "Forklift-Safety-Zone",
    severity: "medium",
    pipelineCount: 2,
    lastActive: "2h ago",
    pipelines: [
      {
        id: "pl-007a",
        name: "Aisle 3 Monitor",
        headerColor: "#E19A04",
        comps: [
          { name: "Cameras",  status: "warning" },
          { name: "Gateway",  status: "stable"  },
          { name: "Compute",  status: "info"    },
          { name: "ML",       status: "stable"  },
        ],
        note: "Update pending",
        cameras: [
          {
            id: "cam-007a-1", name: "Aisle3-Left",
            ip: "192.168.3.11", location: "Aisle 3 – Left",
            status: "degraded", fps: 16, resolution: "1080p",
            mlApps: [
              { id: "ml-007a-1", name: "Forklift Safety", model: "FLNet-v3",   status: "starting", latencyMs: 0, accuracy: 0 },
              { id: "ml-007a-2", name: "Zone Alert",      model: "ZoneNet-v2", status: "starting", latencyMs: 0, accuracy: 0 },
            ],
          },
          {
            id: "cam-007a-2", name: "Aisle3-Right",
            ip: "192.168.3.12", location: "Aisle 3 – Right",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-007a-3", name: "Forklift Safety", model: "FLNet-v3",   status: "starting", latencyMs: 0, accuracy: 0 },
              { id: "ml-007a-4", name: "Zone Alert",      model: "ZoneNet-v2", status: "starting", latencyMs: 0, accuracy: 0 },
            ],
          },
        ],
      },
      {
        id: "pl-007b",
        name: "Receiving Dock",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All systems nominal",
        cameras: [
          {
            id: "cam-007b-1", name: "RecvDock-01",
            ip: "192.168.3.21", location: "Receiving Dock – Left",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-007b-1", name: "Forklift Safety", model: "FLNet-v3",   status: "running", latencyMs: 47, accuracy: 97.4 },
              { id: "ml-007b-2", name: "Zone Alert",      model: "ZoneNet-v2", status: "running", latencyMs: 52, accuracy: 96.8 },
            ],
          },
          {
            id: "cam-007b-2", name: "RecvDock-02",
            ip: "192.168.3.22", location: "Receiving Dock – Right",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-007b-3", name: "Forklift Safety", model: "FLNet-v3", status: "running", latencyMs: 49, accuracy: 97.0 },
            ],
          },
        ],
      },
    ],
  },
  // ── STABLE ────────────────────────────────────────────────────────────────
  {
    id: "proj-008",
    clusterId: "cl-5",
    name: "08-05-2026 Apps Test",
    severity: "stable",
    pipelineCount: 3,
    lastActive: "3h ago",
    pipelines: [
      {
        id: "pl-008a",
        name: "Test Pipeline 1",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Test passed",
        cameras: [
          {
            id: "cam-008a-1", name: "Test-Cam-01",
            ip: "192.68.1.11", location: "Test Lab – Bay 1",
            status: "online", fps: 30, resolution: "1080p",
            mlApps: [
              { id: "ml-008a-1", name: "Test Model A", model: "TestNet-v1", status: "running", latencyMs: 32, accuracy: 98.5 },
            ],
          },
          {
            id: "cam-008a-2", name: "Test-Cam-02",
            ip: "192.68.1.12", location: "Test Lab – Bay 2",
            status: "online", fps: 30, resolution: "1080p",
            mlApps: [
              { id: "ml-008a-2", name: "Test Model A", model: "TestNet-v1", status: "running", latencyMs: 34, accuracy: 98.2 },
            ],
          },
        ],
      },
      {
        id: "pl-008b",
        name: "Test Pipeline 2",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All checks green",
        cameras: [
          {
            id: "cam-008b-1", name: "Test-Cam-03",
            ip: "192.68.1.13", location: "Test Lab – Bay 3",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-008b-1", name: "Test Model B", model: "TestNet-v2", status: "running", latencyMs: 29, accuracy: 99.1 },
            ],
          },
          {
            id: "cam-008b-2", name: "Test-Cam-04",
            ip: "192.68.1.14", location: "Test Lab – Bay 4",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-008b-2", name: "Test Model B", model: "TestNet-v2", status: "running", latencyMs: 31, accuracy: 98.8 },
            ],
          },
        ],
      },
      {
        id: "pl-008c",
        name: "Test Pipeline 3",
        headerColor: "#2B7FFF",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "info"   },
          { name: "ML",      status: "stable" },
        ],
        note: "Monitoring update",
        cameras: [
          {
            id: "cam-008c-1", name: "Monitor-Cam-01",
            ip: "192.68.1.15", location: "Monitor Station",
            status: "online", fps: 15, resolution: "720p",
            mlApps: [
              { id: "ml-008c-1", name: "Monitor Agent", model: "MonitorNet-v1", status: "running", latencyMs: 28, accuracy: 99.3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-009",
    clusterId: "cl-5",
    name: "App Test 05-05-2026",
    severity: "stable",
    pipelineCount: 2,
    lastActive: "4h ago",
    pipelines: [
      {
        id: "pl-009a",
        name: "Regression Suite",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All tests passed",
        cameras: [
          {
            id: "cam-009a-1", name: "Regression-Cam-01",
            ip: "192.68.1.21", location: "Test Area A",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-009a-1", name: "Regression Model", model: "RegNet-v1", status: "running", latencyMs: 33, accuracy: 98.6 },
            ],
          },
          {
            id: "cam-009a-2", name: "Regression-Cam-02",
            ip: "192.68.1.22", location: "Test Area B",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-009a-2", name: "Regression Model", model: "RegNet-v1", status: "running", latencyMs: 35, accuracy: 98.3 },
            ],
          },
        ],
      },
      {
        id: "pl-009b",
        name: "Integration Tests",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Clean run",
        cameras: [
          {
            id: "cam-009b-1", name: "Integ-Cam-01",
            ip: "192.68.1.23", location: "Integration Lab",
            status: "online", fps: 30, resolution: "1080p",
            mlApps: [
              { id: "ml-009b-1", name: "Integration Model", model: "IntegNet-v1", status: "running", latencyMs: 30, accuracy: 99.0 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-010",
    clusterId: "cl-6",
    name: "Demo2026",
    severity: "stable",
    pipelineCount: 1,
    lastActive: "6h ago",
    pipelines: [
      {
        id: "pl-010",
        name: "Demo Environment",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Demo ready",
        cameras: [
          {
            id: "cam-010-1", name: "Demo-Cam-01",
            ip: "10.0.0.51", location: "Demo Room – Main",
            status: "online", fps: 30, resolution: "4K UHD",
            mlApps: [
              { id: "ml-010-1", name: "Demo Detector",  model: "DemoNet-v2",  status: "running", latencyMs: 38, accuracy: 98.0 },
              { id: "ml-010-2", name: "Demo Classifier", model: "DemoNet-v3", status: "running", latencyMs: 42, accuracy: 97.5 },
            ],
          },
          {
            id: "cam-010-2", name: "Demo-Cam-02",
            ip: "10.0.0.52", location: "Demo Room – Side",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-010-3", name: "Demo Detector", model: "DemoNet-v2", status: "running", latencyMs: 40, accuracy: 97.8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-011",
    clusterId: "cl-6",
    name: "over_crowding_detection",
    severity: "stable",
    pipelineCount: 2,
    lastActive: "7h ago",
    pipelines: [
      {
        id: "pl-011a",
        name: "Lobby Monitor",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-011a-1", name: "Lobby-Ceiling-01",
            ip: "10.0.0.61", location: "Lobby – Center",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-011a-1", name: "Overcrowding Detect", model: "CSRNet-v3",    status: "running", latencyMs: 46, accuracy: 96.7 },
              { id: "ml-011a-2", name: "Crowd Heatmap",       model: "HeatNet-v2",   status: "running", latencyMs: 53, accuracy: 95.9 },
            ],
          },
          {
            id: "cam-011a-2", name: "Lobby-Entrance",
            ip: "10.0.0.62", location: "Lobby – Entrance",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-011a-3", name: "Overcrowding Detect", model: "CSRNet-v3", status: "running", latencyMs: 48, accuracy: 96.2 },
            ],
          },
        ],
      },
      {
        id: "pl-011b",
        name: "Concourse B",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-011b-1", name: "ConcB-Left",
            ip: "10.0.0.63", location: "Concourse B – Left",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-011b-1", name: "Overcrowding Detect", model: "CSRNet-v3", status: "running", latencyMs: 44, accuracy: 97.1 },
            ],
          },
          {
            id: "cam-011b-2", name: "ConcB-Right",
            ip: "10.0.0.64", location: "Concourse B – Right",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-011b-2", name: "Overcrowding Detect", model: "CSRNet-v3", status: "running", latencyMs: 46, accuracy: 96.8 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-012",
    clusterId: "cl-6",
    name: "Matrice Apps Test",
    severity: "stable",
    pipelineCount: 1,
    lastActive: "8h ago",
    pipelines: [
      {
        id: "pl-012",
        name: "Smoke Test Suite",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All green",
        cameras: [
          {
            id: "cam-012-1", name: "Smoke-Cam-01",
            ip: "10.0.0.71", location: "Smoke Test Bay",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-012-1", name: "Smoke Test Model", model: "SmokeTest-v1", status: "running", latencyMs: 29, accuracy: 99.2 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-013",
    clusterId: "cl-7",
    name: "car_damage_detection",
    severity: "stable",
    pipelineCount: 3,
    lastActive: "10h ago",
    pipelines: [
      {
        id: "pl-013a",
        name: "Lot A Inspection",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-013a-1", name: "LotA-Entry-Cam",
            ip: "10.2.1.111", location: "Lot A – Entry",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-013a-1", name: "Damage Detector",  model: "DamageNet-v4", status: "running", latencyMs: 58, accuracy: 96.4 },
              { id: "ml-013a-2", name: "Dent Classifier",  model: "DentNet-v2",   status: "running", latencyMs: 63, accuracy: 95.1 },
            ],
          },
          {
            id: "cam-013a-2", name: "LotA-Exit-Cam",
            ip: "10.2.1.112", location: "Lot A – Exit",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-013a-3", name: "Damage Detector", model: "DamageNet-v4", status: "running", latencyMs: 55, accuracy: 96.8 },
            ],
          },
        ],
      },
      {
        id: "pl-013b",
        name: "Lot B Inspection",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-013b-1", name: "LotB-Cam-01",
            ip: "10.2.1.121", location: "Lot B – North",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-013b-1", name: "Damage Detector", model: "DamageNet-v4", status: "running", latencyMs: 57, accuracy: 96.1 },
            ],
          },
          {
            id: "cam-013b-2", name: "LotB-Cam-02",
            ip: "10.2.1.122", location: "Lot B – South",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-013b-2", name: "Damage Detector", model: "DamageNet-v4", status: "running", latencyMs: 59, accuracy: 95.9 },
            ],
          },
        ],
      },
      {
        id: "pl-013c",
        name: "Drive-through",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-013c-1", name: "DriveThru-Entry",
            ip: "10.2.1.131", location: "Drive-Through – Entry",
            status: "online", fps: 30, resolution: "4K UHD",
            mlApps: [
              { id: "ml-013c-1", name: "Damage Detector",  model: "DamageNet-v4", status: "running", latencyMs: 52, accuracy: 97.2 },
              { id: "ml-013c-2", name: "License Plate OCR", model: "LPRNET-v3",   status: "running", latencyMs: 78, accuracy: 94.5 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-014",
    clusterId: "cl-7",
    name: "Test_MM",
    severity: "stable",
    pipelineCount: 1,
    lastActive: "12h ago",
    pipelines: [
      {
        id: "pl-014",
        name: "MM Pipeline",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "All systems nominal",
        cameras: [
          {
            id: "cam-014-1", name: "MM-Cam-01",
            ip: "10.2.1.141", location: "Test Station – A",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-014-1", name: "MM Model", model: "MMNet-v1", status: "running", latencyMs: 35, accuracy: 98.4 },
            ],
          },
          {
            id: "cam-014-2", name: "MM-Cam-02",
            ip: "10.2.1.142", location: "Test Station – B",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-014-2", name: "MM Model", model: "MMNet-v1", status: "running", latencyMs: 37, accuracy: 98.1 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-015",
    clusterId: "cl-8",
    name: "Retail-Analytics-Suite",
    severity: "stable",
    pipelineCount: 4,
    lastActive: "1d ago",
    pipelines: [
      {
        id: "pl-015a",
        name: "Store 01 Checkout",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-015a-1", name: "Checkout-Overhead-01",
            ip: "10.2.1.211", location: "Store 01 – Checkout",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-015a-1", name: "Queue Counter",    model: "QueueNet-v3",  status: "running", latencyMs: 42, accuracy: 97.6 },
              { id: "ml-015a-2", name: "Dwell Time Detect", model: "DwellNet-v2", status: "running", latencyMs: 48, accuracy: 96.3 },
            ],
          },
          {
            id: "cam-015a-2", name: "Checkout-Wide-02",
            ip: "10.2.1.212", location: "Store 01 – Checkout Wide",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-015a-3", name: "Queue Counter", model: "QueueNet-v3", status: "running", latencyMs: 44, accuracy: 97.2 },
            ],
          },
        ],
      },
      {
        id: "pl-015b",
        name: "Store 01 Aisles",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-015b-1", name: "Aisle-Cam-01",
            ip: "10.2.1.221", location: "Store 01 – Aisle 1",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-015b-1", name: "Shopper Tracker",  model: "ShopNet-v2",  status: "running", latencyMs: 39, accuracy: 97.9 },
              { id: "ml-015b-2", name: "Product Interest", model: "ProductNet-v1", status: "running", latencyMs: 55, accuracy: 91.4 },
            ],
          },
          {
            id: "cam-015b-2", name: "Aisle-Cam-02",
            ip: "10.2.1.222", location: "Store 01 – Aisle 2",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-015b-3", name: "Shopper Tracker", model: "ShopNet-v2", status: "running", latencyMs: 41, accuracy: 97.5 },
            ],
          },
        ],
      },
      {
        id: "pl-015c",
        name: "Store 02 Checkout",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-015c-1", name: "S02-Checkout-01",
            ip: "10.2.1.231", location: "Store 02 – Checkout",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-015c-1", name: "Queue Counter",    model: "QueueNet-v3",  status: "running", latencyMs: 43, accuracy: 97.4 },
              { id: "ml-015c-2", name: "Dwell Time Detect", model: "DwellNet-v2", status: "running", latencyMs: 50, accuracy: 96.1 },
            ],
          },
          {
            id: "cam-015c-2", name: "S02-Checkout-02",
            ip: "10.2.1.232", location: "Store 02 – Checkout Wide",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-015c-3", name: "Queue Counter", model: "QueueNet-v3", status: "running", latencyMs: 46, accuracy: 97.0 },
            ],
          },
        ],
      },
      {
        id: "pl-015d",
        name: "Store 02 Aisles",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Operating normally",
        cameras: [
          {
            id: "cam-015d-1", name: "S02-Aisle-Cam-01",
            ip: "10.2.1.241", location: "Store 02 – Aisle 1",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-015d-1", name: "Shopper Tracker", model: "ShopNet-v2", status: "running", latencyMs: 40, accuracy: 97.7 },
            ],
          },
          {
            id: "cam-015d-2", name: "S02-Aisle-Cam-02",
            ip: "10.2.1.242", location: "Store 02 – Aisle 2",
            status: "online", fps: 25, resolution: "1080p",
            mlApps: [
              { id: "ml-015d-2", name: "Shopper Tracker", model: "ShopNet-v2", status: "running", latencyMs: 42, accuracy: 97.3 },
            ],
          },
        ],
      },
    ],
  },
  // ── RESOLVED ──────────────────────────────────────────────────────────────
  {
    id: "proj-016",
    clusterId: "cl-8",
    name: "Slip-Trip-Fall-Detector",
    severity: "resolved",
    pipelineCount: 2,
    lastActive: "2d ago",
    pipelines: [
      {
        id: "pl-016a",
        name: "Cafeteria Floor",
        headerColor: "#64748B",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Incident resolved",
        cameras: [
          {
            id: "cam-016a-1", name: "Cafe-Floor-01",
            ip: "10.2.1.311", location: "Cafeteria – Main Floor",
            status: "online", fps: 25, resolution: "4K UHD",
            mlApps: [
              { id: "ml-016a-1", name: "Fall Detector", model: "FallNet-v3", status: "running", latencyMs: 38, accuracy: 98.2 },
            ],
          },
          {
            id: "cam-016a-2", name: "Cafe-Floor-02",
            ip: "10.2.1.312", location: "Cafeteria – Service Area",
            status: "online", fps: 25, resolution: "2MP",
            mlApps: [
              { id: "ml-016a-2", name: "Fall Detector", model: "FallNet-v3", status: "running", latencyMs: 40, accuracy: 97.9 },
            ],
          },
        ],
      },
      {
        id: "pl-016b",
        name: "Stairwell A",
        headerColor: "#64748B",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Back online",
        cameras: [
          {
            id: "cam-016b-1", name: "Stair-A-Top",
            ip: "10.2.1.321", location: "Stairwell A – Top",
            status: "online", fps: 15, resolution: "1080p",
            mlApps: [
              { id: "ml-016b-1", name: "Fall Detector", model: "FallNet-v3", status: "running", latencyMs: 36, accuracy: 98.5 },
            ],
          },
          {
            id: "cam-016b-2", name: "Stair-A-Bottom",
            ip: "10.2.1.322", location: "Stairwell A – Bottom",
            status: "online", fps: 15, resolution: "1080p",
            mlApps: [
              { id: "ml-016b-2", name: "Fall Detector", model: "FallNet-v3", status: "running", latencyMs: 37, accuracy: 98.3 },
            ],
          },
        ],
      },
    ],
  },
  {
    id: "proj-017",
    clusterId: "cl-9",
    name: "Intrusion-Detection-v2",
    severity: "resolved",
    pipelineCount: 1,
    lastActive: "3d ago",
    pipelines: [
      {
        id: "pl-017",
        name: "Server Room",
        headerColor: "#64748B",
        comps: [
          { name: "Cameras", status: "stable" },
          { name: "Gateway", status: "stable" },
          { name: "Compute", status: "stable" },
          { name: "ML",      status: "stable" },
        ],
        note: "Alert resolved",
        cameras: [
          {
            id: "cam-017-1", name: "ServerRoom-Entrance",
            ip: "172.16.0.111", location: "Server Room – Entrance",
            status: "online", fps: 15, resolution: "4K UHD",
            mlApps: [
              { id: "ml-017-1", name: "Intrusion Detector", model: "IntruNet-v5", status: "running", latencyMs: 33, accuracy: 99.1 },
              { id: "ml-017-2", name: "Face Recognition",   model: "FaceNet-v4",  status: "running", latencyMs: 65, accuracy: 97.3 },
            ],
          },
          {
            id: "cam-017-2", name: "ServerRoom-Rack-01",
            ip: "172.16.0.112", location: "Server Room – Rack Row",
            status: "online", fps: 10, resolution: "1080p",
            mlApps: [
              { id: "ml-017-3", name: "Intrusion Detector", model: "IntruNet-v5", status: "running", latencyMs: 35, accuracy: 98.8 },
            ],
          },
        ],
      },
    ],
  },
];
