import { useState, useMemo } from "react";
import { ChevronDown, X } from "lucide-react";
import { DataTable } from "@fe-common/components/ui/data-table";
import type { ColumnDef } from "@fe-common/components/ui/data-table";

// ── Types ─────────────────────────────────────────────────────────────────────

interface CamLogEntry {
  id: string;
  ts: string;
  accountName: string;
  clusterName: string;
  projectName: string;
  pipelineName: string;
  camName: string;
  action: string;
  details: string;
  user: string;
  status: string;
}

// ── Mock data ─────────────────────────────────────────────────────────────────

const GREEN = "#00A63E";
const RED   = "#E7000B";
const AMBER = "#F59E0B";
const GREY  = "#64748B";

const ALL_CAM_LOGS: CamLogEntry[] = [
  { id: "cl001", ts: "27/05/2026, 09:14:22", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Main-Entrance-PTZ",  action: "Added",   details: "Application added to camera",                                          user: "Pratik Raje", status: "In Use"  },
  { id: "cl002", ts: "27/05/2026, 08:58:01", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Perimeter-Breach-Alert",       pipelineName: "North Gate Monitor",  camName: "Gate-PTZ-01",        action: "Removed", details: "Application removed from camera or may be assigned to other pipelines", user: "John Doe",    status: "—"       },
  { id: "cl003", ts: "27/05/2026, 08:44:50", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Perimeter-Breach-Alert",       pipelineName: "South Entry",         camName: "Gate-Fixed-03",      action: "Added",   details: "Application added to camera",                                          user: "John Doe",    status: "In Use"  },
  { id: "cl004", ts: "27/05/2026, 08:30:15", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Lobby-Fixed-01",     action: "Started", details: "Camera stream started successfully",                                   user: "Pratik Raje", status: "In Use"  },
  { id: "cl005", ts: "27/05/2026, 07:59:33", accountName: "Enterprise Security Corp", clusterName: "SEC-Cluster-Alpha",           projectName: "car_damage_detection",          pipelineName: "Lot A Inspection",    camName: "LotA-Entry-Cam",     action: "Added",   details: "Application added to camera",                                          user: "Admin",       status: "In Use"  },
  { id: "cl006", ts: "27/05/2026, 07:45:10", accountName: "Enterprise Security Corp", clusterName: "SEC-Cluster-Alpha",           projectName: "car_damage_detection",          pipelineName: "Lot A Inspection",    camName: "LotA-Exit-Cam",      action: "Stopped", details: "Camera stream stopped",                                                user: "Admin",       status: "—"       },
  { id: "cl007", ts: "27/05/2026, 07:22:44", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Perimeter-Breach-Alert",       pipelineName: "North Gate Monitor",  camName: "Gate-PTZ-02",        action: "Removed", details: "Application removed from camera or may be assigned to other pipelines", user: "John Doe",    status: "—"       },
  { id: "cl008", ts: "27/05/2026, 06:55:18", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Side-Door-02",       action: "Added",   details: "Application added to camera",                                          user: "Pratik Raje", status: "In Use"  },
  { id: "cl009", ts: "26/05/2026, 23:11:05", accountName: "Enterprise Security Corp", clusterName: "SEC-Cluster-Alpha",           projectName: "Test_MM",                       pipelineName: "MM-Pipeline-01",      camName: "MM-Cam-01",          action: "Started", details: "Camera stream started successfully",                                   user: "System",      status: "In Use"  },
  { id: "cl010", ts: "26/05/2026, 22:48:33", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-default",         projectName: "Multimodel_Moultimodal_OCR_Testing", pipelineName: "yolo_ocr_postproc", camName: "OCR-Cam-01",        action: "Removed", details: "Application removed from camera",                                      user: "Admin",       status: "—"       },
  { id: "cl011", ts: "26/05/2026, 21:30:22", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-default",         projectName: "Multimodel_Moultimodal_OCR_Testing", pipelineName: "yolo_ocr_postproc", camName: "OCR-Cam-02",        action: "Added",   details: "Application added to camera",                                          user: "Admin",       status: "In Use"  },
  { id: "cl012", ts: "26/05/2026, 19:05:44", accountName: "Enterprise Security Corp", clusterName: "SEC-Cluster-Alpha",           projectName: "car_damage_detection",          pipelineName: "Lot B Survey",        camName: "LotB-North-Cam",     action: "Started", details: "Camera stream started successfully",                                   user: "System",      status: "In Use"  },
  { id: "cl013", ts: "26/05/2026, 17:42:09", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Perimeter-Breach-Alert",       pipelineName: "South Entry",         camName: "Side-Door-02",       action: "Stopped", details: "Camera stream stopped due to connection timeout",                      user: "System",      status: "—"       },
  { id: "cl014", ts: "26/05/2026, 16:20:55", accountName: "Enterprise Security Corp", clusterName: "SEC-Cluster-Alpha",           projectName: "car_damage_detection",          pipelineName: "Lot A Inspection",    camName: "LotA-Entry-Cam",     action: "Removed", details: "Application removed from camera",                                      user: "Admin",       status: "—"       },
  { id: "cl015", ts: "26/05/2026, 15:08:31", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Main-Entrance-PTZ",  action: "Added",   details: "Application added to camera",                                          user: "Pratik Raje", status: "In Use"  },
  { id: "cl016", ts: "26/05/2026, 13:21:06", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Main-Entrance-PTZ",  action: "Added",   details: "Application added to camera",                                          user: "John Doe",    status: "In Use"  },
  { id: "cl017", ts: "26/05/2026, 13:13:58", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Main-Entrance-PTZ",  action: "Removed", details: "Application removed from camera",                                      user: "John Doe",    status: "—"       },
  { id: "cl018", ts: "26/05/2026, 12:58:02", accountName: "Matrice Primary Account", clusterName: "Thor4-dev-MM-test-v2-default", projectName: "Weapon-Detection",              pipelineName: "weapon Detection",   camName: "Main-Entrance-PTZ",  action: "Added",   details: "Application added to camera",                                          user: "John Doe",    status: "In Use"  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function actionBadge(action: string) {
  const cfg: Record<string, { bg: string; text: string }> = {
    Started: { bg: "rgba(0,166,62,0.12)",   text: GREEN },
    Added:   { bg: "rgba(0,166,62,0.12)",   text: GREEN },
    "In Use":{ bg: "rgba(0,166,62,0.12)",   text: GREEN },
    Stopped: { bg: "rgba(231,0,11,0.10)",   text: RED   },
    Removed: { bg: "rgba(100,116,139,0.1)", text: GREY  },
    "—":     { bg: "transparent",           text: GREY  },
  };
  const c = cfg[action] ?? { bg: "#F1F5F9", text: GREY };
  return (
    <span className="px-2.5 py-0.5 rounded text-[11px] font-semibold"
      style={{ backgroundColor: c.bg, color: c.text }}>
      {action}
    </span>
  );
}

// ── Filter dropdown ────────────────────────────────────────────────────────────

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none pl-3 pr-8 py-2 rounded text-[12px] font-medium text-gray-700 bg-white border border-gray-200 outline-none focus:ring-2 focus:ring-[#00775B]/20 focus:border-[#00775B] transition-all cursor-pointer"
      >
        <option value="">{label}: All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none" />
    </div>
  );
}

// ── Column defs ───────────────────────────────────────────────────────────────

const COLUMNS: ColumnDef<CamLogEntry>[] = [
  {
    id: "ts",
    header: "Timestamp",
    accessorKey: "ts",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[11px] font-mono text-gray-500 whitespace-nowrap">{row.ts}</span>
    ),
  },
  {
    id: "camName",
    header: "Camera",
    accessorKey: "camName",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] font-semibold text-gray-800">{row.camName}</span>
    ),
  },
  {
    id: "accountName",
    header: "Account",
    accessorKey: "accountName",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[11px] text-gray-600 truncate max-w-[140px] block">{row.accountName}</span>
    ),
  },
  {
    id: "clusterName",
    header: "Cluster",
    accessorKey: "clusterName",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[11px] text-gray-500 truncate max-w-[160px] block">{row.clusterName}</span>
    ),
  },
  {
    id: "pipelineName",
    header: "Pipeline",
    accessorKey: "pipelineName",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[11px] text-gray-600">{row.pipelineName}</span>
    ),
  },
  {
    id: "action",
    header: "Action",
    accessorKey: "action",
    sortable: true,
    cell: ({ row }) => actionBadge(row.action),
  },
  {
    id: "details",
    header: "Details",
    accessorKey: "details",
    cell: ({ row }) => (
      <span className="text-[11px] text-gray-500 max-w-[220px] block truncate">{row.details}</span>
    ),
  },
  {
    id: "user",
    header: "User",
    accessorKey: "user",
    sortable: true,
    cell: ({ row }) => (
      <span className="text-[12px] text-gray-700">{row.user}</span>
    ),
  },
  {
    id: "status",
    header: "Status",
    accessorKey: "status",
    cell: ({ row }) => (
      row.status !== "—"
        ? actionBadge(row.status)
        : <span className="text-gray-300 text-[12px]">—</span>
    ),
  },
];

// ── Page ──────────────────────────────────────────────────────────────────────

export function CameraLogsPage() {
  const [filterAccount,  setFilterAccount]  = useState("");
  const [filterCluster,  setFilterCluster]  = useState("");
  const [filterCamera,   setFilterCamera]   = useState("");
  const [filterAction,   setFilterAction]   = useState("");

  // Unique option lists
  const accountOptions = useMemo(() => {
    const seen = new Set<string>();
    return ALL_CAM_LOGS.flatMap((l) => {
      if (seen.has(l.accountName)) return [];
      seen.add(l.accountName);
      return [{ value: l.accountName, label: l.accountName }];
    });
  }, []);

  const clusterOptions = useMemo(() => {
    const seen = new Set<string>();
    return ALL_CAM_LOGS
      .filter((l) => !filterAccount || l.accountName === filterAccount)
      .flatMap((l) => {
        if (seen.has(l.clusterName)) return [];
        seen.add(l.clusterName);
        return [{ value: l.clusterName, label: l.clusterName }];
      });
  }, [filterAccount]);

  const cameraOptions = useMemo(() => {
    const seen = new Set<string>();
    return ALL_CAM_LOGS
      .filter((l) =>
        (!filterAccount || l.accountName === filterAccount) &&
        (!filterCluster || l.clusterName === filterCluster)
      )
      .flatMap((l) => {
        if (seen.has(l.camName)) return [];
        seen.add(l.camName);
        return [{ value: l.camName, label: l.camName }];
      });
  }, [filterAccount, filterCluster]);

  const actionOptions = [
    { value: "Added",   label: "Added"   },
    { value: "Removed", label: "Removed" },
    { value: "Started", label: "Started" },
    { value: "Stopped", label: "Stopped" },
  ];

  const filtered = useMemo(() => ALL_CAM_LOGS.filter((l) =>
    (!filterAccount || l.accountName === filterAccount) &&
    (!filterCluster || l.clusterName === filterCluster) &&
    (!filterCamera  || l.camName === filterCamera) &&
    (!filterAction  || l.action === filterAction)
  ), [filterAccount, filterCluster, filterCamera, filterAction]);

  const hasFilters = !!(filterAccount || filterCluster || filterCamera || filterAction);

  const clearFilters = () => {
    setFilterAccount(""); setFilterCluster("");
    setFilterCamera("");  setFilterAction("");
  };

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: "#F3F4F6" }}>

      {/* ── Filters ── */}
      <div className="bg-white border-b border-gray-100 px-6 py-3 flex items-center gap-2.5 flex-wrap flex-shrink-0">
        <FilterSelect
          label="Account" value={filterAccount}
          options={accountOptions}
          onChange={(v) => { setFilterAccount(v); setFilterCluster(""); setFilterCamera(""); }}
        />
        <FilterSelect
          label="Cluster" value={filterCluster}
          options={clusterOptions}
          onChange={(v) => { setFilterCluster(v); setFilterCamera(""); }}
        />
        <FilterSelect
          label="Camera" value={filterCamera}
          options={cameraOptions}
          onChange={setFilterCamera}
        />
        <FilterSelect
          label="Action" value={filterAction}
          options={actionOptions}
          onChange={setFilterAction}
        />
        {hasFilters && (
          <button
            onClick={clearFilters}
            className="flex items-center gap-1 px-2.5 py-2 rounded text-[12px] text-gray-400 border border-gray-200 hover:bg-gray-50 transition-colors"
          >
            <X className="w-3 h-3" /> Clear
          </button>
        )}
      </div>

      {/* ── Table ── */}
      <div className="flex-1 overflow-auto p-5">
        <DataTable<CamLogEntry>
          columns={COLUMNS}
          data={filtered}
          rowIdKey="id"
          sortable
          selectable
          selectionMode="multi"
          expandable
          expansionMode="single"
          renderExpandedRow={(row) => (
            <div className="grid grid-cols-4 gap-6 py-3 px-2 text-[12px]">
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Camera</div>
                <div className="font-semibold text-gray-800">{row.camName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Pipeline</div>
                <div className="font-medium text-gray-700">{row.pipelineName}</div>
                <div className="text-[10px] text-gray-400 mt-0.5">{row.projectName}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">User</div>
                <div className="font-medium text-gray-800">{row.user}</div>
              </div>
              <div>
                <div className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1">Timestamp</div>
                <div className="font-mono text-gray-700">{row.ts}</div>
              </div>
            </div>
          )}
          toolbar
          pagination="client"
          pageSize={15}
          emptyState={{
            title: "No logs found",
            description: "Try adjusting your filters.",
          }}
        />
      </div>
    </div>
  );
}
