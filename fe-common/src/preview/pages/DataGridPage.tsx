import { useState } from "react";
import {
  DataGrid, StatusCapsule, MonoCell, InterCell, GridActions, GridActionButton,
  type DataGridColumn,
} from "../../components/ui/DataGrid";
import { Eye, Pencil, Trash2 } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ModelRow {
  id: string;
  name: string;
  type: string;
  accuracy: string;
  latency: string;
  status: string;
  updated: string;
}

interface IncidentRow {
  id: string;
  ref: string;
  zone: string;
  severity: string;
  camera: string;
  detected: string;
  status: string;
}

// ─── Sample data ──────────────────────────────────────────────────────────────

const MODEL_DATA: ModelRow[] = [
  { id: "1", name: "person-detect-v3",    type: "Object Detection",   accuracy: "98.4%", latency: "12ms",  status: "active",    updated: "2025-05-12" },
  { id: "2", name: "vehicle-class-v2",    type: "Classification",     accuracy: "96.1%", latency: "18ms",  status: "training",  updated: "2025-05-11" },
  { id: "3", name: "thermal-anomaly-v1",  type: "Anomaly Detection",  accuracy: "94.7%", latency: "24ms",  status: "pending",   updated: "2025-05-10" },
  { id: "4", name: "face-recog-v4",       type: "Recognition",        accuracy: "99.1%", latency: "9ms",   status: "active",    updated: "2025-05-09" },
  { id: "5", name: "crowd-density-v1",    type: "Segmentation",       accuracy: "91.3%", latency: "31ms",  status: "failed",    updated: "2025-05-08" },
  { id: "6", name: "license-plate-v2",    type: "OCR",                accuracy: "97.8%", latency: "14ms",  status: "active",    updated: "2025-05-07" },
  { id: "7", name: "smoke-fire-v2",       type: "Detection",          accuracy: "96.5%", latency: "16ms",  status: "deployed",  updated: "2025-05-06" },
  { id: "8", name: "ppf-compliance-v1",   type: "Classification",     accuracy: "88.9%", latency: "22ms",  status: "training",  updated: "2025-05-05" },
];

const INCIDENT_DATA: IncidentRow[] = [
  { id: "i1",  ref: "INC-00481", zone: "Entrance A",      severity: "critical", camera: "CAM-001", detected: "14:32:07",  status: "active"   },
  { id: "i2",  ref: "INC-00480", zone: "Parking Lot B",   severity: "high",     camera: "CAM-014", detected: "14:28:53",  status: "pending"  },
  { id: "i3",  ref: "INC-00479", zone: "Server Room",     severity: "medium",   camera: "CAM-007", detected: "14:21:18",  status: "active"   },
  { id: "i4",  ref: "INC-00478", zone: "Loading Bay",     severity: "low",      camera: "CAM-022", detected: "14:15:44",  status: "resolved" },
  { id: "i5",  ref: "INC-00477", zone: "Roof Access",     severity: "critical", camera: "CAM-003", detected: "14:09:02",  status: "active"   },
  { id: "i6",  ref: "INC-00476", zone: "Warehouse C",     severity: "medium",   camera: "CAM-019", detected: "13:58:31",  status: "pending"  },
];

// ─── Column definitions ───────────────────────────────────────────────────────

const MODEL_COLS: DataGridColumn<ModelRow>[] = [
  {
    key: "name", header: "Model Name", width: "2fr", sortable: true,
    render: (row, h) => <MonoCell hovered={h} isPrimary color="#334155" hoveredColor="#0F172A">{row.name}</MonoCell>,
    searchValue: (r) => r.name,
  },
  {
    key: "type", header: "Type", width: "1.5fr", sortable: true,
    render: (row, h) => <InterCell hovered={h} color="#475569">{row.type}</InterCell>,
  },
  {
    key: "accuracy", header: "Accuracy", width: "90px", align: "center", sortable: true,
    render: (row, h) => <MonoCell hovered={h} color="#00775B" hoveredColor="#00624b">{row.accuracy}</MonoCell>,
  },
  {
    key: "latency", header: "Latency", width: "80px", align: "center", sortable: true,
    render: (row, h) => <MonoCell hovered={h} color="#475569">{row.latency}</MonoCell>,
  },
  {
    key: "status", header: "Status", width: "110px", align: "center",
    render: (row) => <StatusCapsule status={row.status} />,
  },
  {
    key: "updated", header: "Updated", width: "100px",
    render: (row, h) => <MonoCell hovered={h} color="#94A3B8" fontSize={11}>{row.updated}</MonoCell>,
  },
];

const INCIDENT_COLS: DataGridColumn<IncidentRow>[] = [
  {
    key: "ref", header: "Ref", width: "100px", sortable: true,
    render: (row, h) => <MonoCell hovered={h} isPrimary color="#334155">{row.ref}</MonoCell>,
  },
  {
    key: "zone", header: "Zone", width: "1.5fr", sortable: true,
    render: (row, h) => <InterCell hovered={h} color="#334155">{row.zone}</InterCell>,
    searchValue: (r) => r.zone,
  },
  {
    key: "severity", header: "Severity", width: "100px", align: "center",
    render: (row) => <StatusCapsule status={row.severity} />,
  },
  {
    key: "camera", header: "Camera", width: "90px",
    render: (row, h) => <MonoCell hovered={h} color="#64748B" fontSize={11}>{row.camera}</MonoCell>,
  },
  {
    key: "detected", header: "Detected", width: "90px", align: "center",
    render: (row, h) => <MonoCell hovered={h} color="#94A3B8" fontSize={11}>{row.detected}</MonoCell>,
  },
  {
    key: "status", header: "Status", width: "100px", align: "center",
    render: (row) => <StatusCapsule status={row.status} />,
  },
  {
    key: "__actions__", header: "", width: "80px", align: "center",
    render: (_, h) => (
      <GridActions visible={h}>
        <GridActionButton title="View"><Eye size={13} /></GridActionButton>
        <GridActionButton title="Edit"><Pencil size={13} /></GridActionButton>
        <GridActionButton title="Delete" hoverColor="#E7000B"><Trash2 size={13} /></GridActionButton>
      </GridActions>
    ),
  },
];

// ─── Section wrapper ──────────────────────────────────────────────────────────

function Section({ title, code, children }: { title: string; code: string; children: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">{title}</h2>
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        {children}
      </div>
      <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">{code}</pre>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function DataGridPage() {
  const [selected, setSelected] = useState<Set<string | number>>(new Set());

  return (
    <div className="space-y-10 max-w-5xl">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">DataGrid <span className="ml-2 text-sm font-normal text-slate-400 bg-slate-100 px-2 py-0.5 rounded">v2.3</span></h1>
        <p className="mt-1.5 text-sm text-gray-500 max-w-xl">
          Feature-rich data table with search, pagination, column sorting, row selection,
          hover actions, and loading skeleton. All cell types included.
        </p>
      </div>

      {/* Basic */}
      <Section
        title="Basic Grid"
        code={`<DataGrid columns={columns} data={rows} />`}
      >
        <DataGrid columns={MODEL_COLS} data={MODEL_DATA} />
      </Section>

      {/* Sorting */}
      <Section
        title="Sortable Columns"
        code={`// Mark any column sortable: true
const columns = [
  { key: "name", header: "Model Name", sortable: true, render: … },
  { key: "accuracy", header: "Accuracy", sortable: true, render: … },
];

// Client-side sort is automatic.
// For server-side, supply onSortChange:
<DataGrid columns={columns} data={rows}
  defaultSortKey="name" defaultSortDir="asc"
  onSortChange={(key, dir) => fetchSorted(key, dir)} />`}
      >
        <DataGrid
          columns={MODEL_COLS}
          data={MODEL_DATA}
          defaultSortKey="name"
        />
      </Section>

      {/* Search + Pagination */}
      <Section
        title="Searchable & Paginated"
        code={`<DataGrid
  columns={columns}
  data={rows}
  searchable
  searchPlaceholder="Search models…"
  pageSize={4}
/>`}
      >
        <DataGrid
          columns={MODEL_COLS}
          data={MODEL_DATA}
          searchable
          searchPlaceholder="Search models…"
          pageSize={4}
        />
      </Section>

      {/* Row actions */}
      <Section
        title="Row Actions (hover to reveal)"
        code={`// Add an actions column using GridActions + GridActionButton
{
  key: "__actions__", header: "", width: "80px",
  render: (_, hovered) => (
    <GridActions visible={hovered}>
      <GridActionButton title="View"><Eye size={13} /></GridActionButton>
      <GridActionButton title="Delete" hoverColor="#E7000B"><Trash2 size={13} /></GridActionButton>
    </GridActions>
  ),
}`}
      >
        <DataGrid
          columns={INCIDENT_COLS}
          data={INCIDENT_DATA}
          searchable
          searchPlaceholder="Search incidents…"
        />
      </Section>

      {/* Selectable */}
      <Section
        title="Row Selection"
        code={`const [selected, setSelected] = useState<Set<string | number>>(new Set());

<DataGrid
  columns={columns}
  data={rows}
  selectable
  selectedIds={selected}
  onSelectionChange={setSelected}
/>`}
      >
        <div className="space-y-2">
          {selected.size > 0 && (
            <div className="px-4 py-2 bg-teal-50 border-b border-teal-100 text-xs text-teal-700 font-medium">
              {selected.size} row{selected.size > 1 ? "s" : ""} selected
            </div>
          )}
          <DataGrid
            columns={MODEL_COLS}
            data={MODEL_DATA}
            selectable
            selectedIds={selected}
            onSelectionChange={setSelected}
          />
        </div>
      </Section>

      {/* Compact + Clickable */}
      <Section
        title="Compact + Clickable Rows"
        code={`<DataGrid columns={columns} data={rows} compact onRowClick={(row) => …} />`}
      >
        <DataGrid
          columns={MODEL_COLS}
          data={MODEL_DATA}
          compact
          onRowClick={() => {}}
        />
      </Section>

      {/* Loading skeleton */}
      <Section
        title="Loading Skeleton"
        code={`<DataGrid columns={columns} data={[]} loading loadingRows={6} />`}
      >
        <DataGrid
          columns={MODEL_COLS}
          data={[]}
          loading
          loadingRows={6}
        />
      </Section>

      {/* Empty state */}
      <Section
        title="Empty State"
        code={`<DataGrid
  columns={columns}
  data={[]}
  emptyState={
    <div className="text-center py-8">
      <p className="text-sm font-medium text-slate-600">No models yet</p>
      <p className="text-xs text-slate-400 mt-1">Upload a model to get started</p>
    </div>
  }
/>`}
      >
        <DataGrid
          columns={MODEL_COLS}
          data={[]}
          emptyState={
            <div className="text-center py-8">
              <p className="text-sm font-medium text-slate-600">No models yet</p>
              <p className="text-xs text-slate-400 mt-1">Upload a model to get started</p>
            </div>
          }
        />
      </Section>

      {/* All status capsule values */}
      <div className="space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-400">StatusCapsule — All Values</h2>
        <div className="p-6 bg-white rounded-xl border border-gray-100 flex flex-wrap gap-2">
          {[
            "critical","high","warning","medium","low","info",
            "active","stable","success","running","complete","deployed","available","enabled",
            "training","in-use","syncing",
            "pending","queued","paused",
            "failed","flagged","error",
            "draft","unknown","offline","disabled","archived","deprecated","resolved",
          ].map((s) => (
            <StatusCapsule key={s} status={s} />
          ))}
        </div>
        <pre className="bg-gray-950 text-green-400 p-4 rounded-lg text-xs overflow-x-auto leading-relaxed">{`<StatusCapsule status="active" />
<StatusCapsule status="failed" />
<StatusCapsule status="pending" />
// …28 values total — falls back to grey for unrecognised strings`}</pre>
      </div>
    </div>
  );
}

export default DataGridPage;
