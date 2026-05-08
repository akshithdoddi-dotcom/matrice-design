// ─── Types ────────────────────────────────────────────────────────────────────

export type ProjectSeverity = "default" | "critical" | "high" | "medium" | "stable" | "resolved";
export type ComponentStatus  = "critical" | "warning" | "stable" | "info";

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
}

export interface Project {
  id: string;
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

// ─── Projects ─────────────────────────────────────────────────────────────────

export const MOCK_PROJECTS: Project[] = [
  // ── CRITICAL ──────────────────────────────────────────────────────────────
  {
    id: "proj-001",
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
      },
    ],
  },
  {
    id: "proj-002",
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
      },
    ],
  },
  {
    id: "proj-003",
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
      },
      {
        id: "pl-003c",
        name: "Warehouse",
        headerColor: "#00A63E",
        comps: [
          { name: "Cameras",  status: "stable" },
          { name: "Gateway",  status: "stable" },
          { name: "Compute",  status: "stable" },
          { name: "ML",       status: "stable" },
        ],
        note: "All systems nominal",
      },
    ],
  },
  // ── HIGH ──────────────────────────────────────────────────────────────────
  {
    id: "proj-004",
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
      },
    ],
  },
  {
    id: "proj-005",
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
      },
    ],
  },
  // ── MEDIUM ────────────────────────────────────────────────────────────────
  {
    id: "proj-006",
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
      },
    ],
  },
  {
    id: "proj-007",
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
      },
    ],
  },
  // ── STABLE ────────────────────────────────────────────────────────────────
  {
    id: "proj-008",
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
      },
    ],
  },
  {
    id: "proj-009",
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
      },
    ],
  },
  {
    id: "proj-010",
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
      },
    ],
  },
  {
    id: "proj-011",
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
      },
    ],
  },
  {
    id: "proj-012",
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
      },
    ],
  },
  {
    id: "proj-013",
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
      },
    ],
  },
  {
    id: "proj-014",
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
      },
    ],
  },
  {
    id: "proj-015",
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
      },
    ],
  },
  // ── RESOLVED ──────────────────────────────────────────────────────────────
  {
    id: "proj-016",
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
      },
    ],
  },
  {
    id: "proj-017",
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
      },
    ],
  },
];
