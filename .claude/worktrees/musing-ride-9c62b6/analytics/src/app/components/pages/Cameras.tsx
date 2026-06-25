import { useState, useMemo } from "react";
import {
  Video,
  Search,
  Columns3,
  ArrowUpDown,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { cn } from "@/app/lib/utils";
import { DataGrid, DataGridColumn, MonoCell, InterCell, StatusCapsule } from "@/app/components/ui/DataGrid";
import { Checkbox } from "@/app/components/ui/Checkbox";

// ─── Types ────────────────────────────────────────────────────────────────────

type CameraStatus = "Online" | "Offline" | "Unknown";
type SortDir = "asc" | "desc" | null;

interface Camera {
  id: number;
  name: string;
  status: CameraStatus;
  protocolType: string;
  feedPath: string;
  aspectRatio: string;
  dimensions: string;
  streamingFps: number;
  memoryUsage: string;
}

// ─── Mock Data ────────────────────────────────────────────────────────────────

const CAMERAS_DATA: Camera[] = [
  { id: 1,  name: "Pedestrian Cam",  status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/pedestrian.mp4",  aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 2,  name: "Fire",            status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/fire_detect.mp4",   aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 3,  name: "Weapon",          status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/weapon_cam.mp4",    aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 4,  name: "Fence Climbing",  status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/fence_climb.mp4",   aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 5,  name: "m1",              status: "Online",  protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/main_entry_1.mp4",  aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 6,  name: "m2",              status: "Online",  protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/main_entry_2.mp4",  aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 7,  name: "Crowd Monitor",   status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.101:554/stream/crowd_main",                                  aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 25, memoryUsage: "312 MB" },
  { id: 8,  name: "Parking Lot A",   status: "Offline", protocolType: "RTSP", feedPath: "rtsp://192.168.1.102:554/stream/parking_a",                                   aspectRatio: "4:3",  dimensions: "1280x960",  streamingFps: 15, memoryUsage: "-" },
  { id: 9,  name: "Loading Dock",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.103:554/stream/loading_dock",                                 aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "287 MB" },
  { id: 10, name: "Server Room",     status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/server_room.mp4",   aspectRatio: "16:9", dimensions: "1280x720",  streamingFps: 30, memoryUsage: "-" },
  { id: 11, name: "Lobby Cam",       status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.104:554/stream/lobby",                                       aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "256 MB" },
  { id: 12, name: "Roof North",      status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.105:554/stream/roof_north",                                  aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "298 MB" },
  { id: 13, name: "East Gate",       status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/east_gate.mp4",    aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 14, name: "West Gate",       status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.106:554/stream/west_gate",                                   aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "301 MB" },
  { id: 15, name: "Stairwell B2",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.107:554/stream/stairwell_b2",                                aspectRatio: "4:3",  dimensions: "1280x960",  streamingFps: 15, memoryUsage: "195 MB" },
  { id: 16, name: "Canteen",         status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.108:554/stream/canteen",                                     aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 25, memoryUsage: "278 MB" },
  { id: 17, name: "Emergency Exit",  status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/emergency_exit.mp4", aspectRatio: "16:9", dimensions: "1280x720",  streamingFps: 30, memoryUsage: "-" },
  { id: 18, name: "PTZ Main Plaza",  status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.109:554/stream/ptz_plaza",                                   aspectRatio: "16:9", dimensions: "3840x2160", streamingFps: 30, memoryUsage: "446 MB" },
  { id: 19, name: "Warehouse Left",  status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.110:554/stream/warehouse_l",                                 aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "312 MB" },
  { id: 20, name: "Warehouse Right", status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.111:554/stream/warehouse_r",                                 aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "309 MB" },
  { id: 21, name: "Reception Desk",  status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.112:554/stream/reception",                                   aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "264 MB" },
  { id: 22, name: "Elevator Bank",   status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/elevators.mp4",    aspectRatio: "4:3",  dimensions: "1280x960",  streamingFps: 15, memoryUsage: "-" },
  { id: 23, name: "South Entrance",  status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.113:554/stream/south_entrance",                              aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "288 MB" },
  { id: 24, name: "Guard Post",      status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.114:554/stream/guard_post",                                  aspectRatio: "4:3",  dimensions: "1280x960",  streamingFps: 15, memoryUsage: "192 MB" },
  { id: 25, name: "Roof South",      status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.115:554/stream/roof_south",                                  aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "295 MB" },
  { id: 26, name: "Lab Entry",       status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/lab_entry.mp4",    aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "-" },
  { id: 27, name: "Shipping Bay",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.116:554/stream/shipping_bay",                                aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "317 MB" },
  { id: 28, name: "Control Room",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.117:554/stream/control_room",                                aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "334 MB" },
  { id: 29, name: "Perimeter NW",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.118:554/stream/perimeter_nw",                                aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "291 MB" },
  { id: 30, name: "Perimeter SE",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.119:554/stream/perimeter_se",                                aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "297 MB" },
  { id: 31, name: "HR Office",       status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/hr_office.mp4",    aspectRatio: "16:9", dimensions: "1280x720",  streamingFps: 30, memoryUsage: "-" },
  { id: 32, name: "IT Server Bay",   status: "Unknown", protocolType: "FILE", feedPath: "https://s3.us-west-2.amazonaws.com/prod.application/feeds/it_server.mp4",    aspectRatio: "16:9", dimensions: "1280x720",  streamingFps: 30, memoryUsage: "-" },
  { id: 33, name: "Break Room",      status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.120:554/stream/break_room",                                  aspectRatio: "4:3",  dimensions: "1280x960",  streamingFps: 15, memoryUsage: "187 MB" },
  { id: 34, name: "Archive Room",    status: "Online",  protocolType: "RTSP", feedPath: "rtsp://192.168.1.121:554/stream/archive_room",                                aspectRatio: "16:9", dimensions: "1920x1080", streamingFps: 30, memoryUsage: "268 MB" },
];

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  value,
  label,
  subLabel,
  valueColor,
  onClick,
}: {
  value: number;
  label: string;
  subLabel: string;
  valueColor: string;
  onClick?: () => void;
}) {
  return (
    <div className="bg-white rounded-[6px] border border-neutral-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] p-6 flex flex-col gap-1 min-w-0">
      <span
        className="text-[2.5rem] font-bold leading-none"
        style={{ color: valueColor, fontFamily: "Inter, sans-serif" }}
      >
        {value}
      </span>
      <span className="text-sm font-semibold text-neutral-800 mt-1">{label}</span>
      <button
        onClick={onClick}
        className="text-xs text-neutral-500 hover:text-[#00775B] transition-colors text-left w-fit mt-0.5"
      >
        {subLabel}
      </button>
    </div>
  );
}

// ─── Sort Icon ────────────────────────────────────────────────────────────────

function SortIcon({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active || dir === null) return <ArrowUpDown className="w-3 h-3 text-neutral-400" />;
  return dir === "asc"
    ? <ChevronUp className="w-3 h-3 text-[#00775B]" />
    : <ChevronDown className="w-3 h-3 text-[#00775B]" />;
}

// ─── Sortable Header Cell ─────────────────────────────────────────────────────

function SortableHeader({
  label,
  colKey,
  sortKey,
  sortDir,
  onSort,
}: {
  label: string;
  colKey: string;
  sortKey: string | null;
  sortDir: SortDir;
  onSort: (k: string) => void;
}) {
  const isActive = sortKey === colKey;
  return (
    <button
      onClick={() => onSort(colKey)}
      className={cn(
        "flex items-center gap-1 uppercase tracking-[0.05em] text-[11px] font-bold transition-colors",
        isActive ? "text-[#00775B]" : "text-neutral-400 hover:text-neutral-600"
      )}
    >
      {label}
      <SortIcon active={isActive} dir={isActive ? sortDir : null} />
    </button>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const Cameras = () => {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [statusFilter, setStatusFilter] = useState<CameraStatus | null>(null);

  const onlineCount    = CAMERAS_DATA.filter(c => c.status === "Online").length;
  const offlineCount   = CAMERAS_DATA.filter(c => c.status === "Offline").length;
  const noHeartbeat    = CAMERAS_DATA.filter(c => c.status === "Unknown").length;

  const handleSort = (key: string) => {
    if (sortKey === key) {
      if (sortDir === "asc") setSortDir("desc");
      else if (sortDir === "desc") { setSortKey(null); setSortDir(null); }
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    let data = CAMERAS_DATA.filter(c => {
      if (statusFilter && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return (
          c.name.toLowerCase().includes(q) ||
          c.protocolType.toLowerCase().includes(q) ||
          c.feedPath.toLowerCase().includes(q) ||
          c.status.toLowerCase().includes(q)
        );
      }
      return true;
    });

    if (sortKey && sortDir) {
      data = [...data].sort((a, b) => {
        let aVal: string | number = "";
        let bVal: string | number = "";
        if (sortKey === "name")          { aVal = a.name; bVal = b.name; }
        else if (sortKey === "status")   { aVal = a.status; bVal = b.status; }
        else if (sortKey === "protocol") { aVal = a.protocolType; bVal = b.protocolType; }
        else if (sortKey === "fps")      { aVal = a.streamingFps; bVal = b.streamingFps; }
        else if (sortKey === "aspect")   { aVal = a.aspectRatio; bVal = b.aspectRatio; }
        else if (sortKey === "dims")     { aVal = a.dimensions; bVal = b.dimensions; }
        const cmp = typeof aVal === "number"
          ? aVal - (bVal as number)
          : String(aVal).localeCompare(String(bVal));
        return sortDir === "asc" ? cmp : -cmp;
      });
    }
    return data;
  }, [search, sortKey, sortDir, statusFilter]);

  const allSelected = selected.size === filtered.length && filtered.length > 0;
  const someSelected = selected.size > 0 && selected.size < filtered.length;

  const toggleAll = () => {
    if (allSelected) setSelected(new Set());
    else setSelected(new Set(filtered.map(c => c.id)));
  };

  const toggleRow = (id: number) => {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  };

  // ── Sort Header helper for DataGrid headerContent ──────────────────────────
  const sh = (label: string, colKey: string) => (
    <SortableHeader label={label} colKey={colKey} sortKey={sortKey} sortDir={sortDir} onSort={handleSort} />
  );

  const columns: DataGridColumn<Camera>[] = [
    {
      key: "select",
      header: "",
      headerContent: (
        <div onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={allSelected}
            onCheckedChange={toggleAll}
            className="border-neutral-300 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B]"
          />
        </div>
      ),
      width: "44px",
      align: "center",
      render: (row, _h) => (
        <div onClick={e => e.stopPropagation()}>
          <Checkbox
            checked={selected.has(row.id)}
            onCheckedChange={() => toggleRow(row.id)}
            className="border-neutral-300 data-[state=checked]:bg-[#00775B] data-[state=checked]:border-[#00775B]"
          />
        </div>
      ),
    },
    {
      key: "name",
      header: "Camera Name",
      headerContent: sh("Camera Name", "name"),
      width: "160px",
      render: (row, hovered) => (
        <InterCell hovered={hovered} isPrimary fontSize={12} color="#1E293B" hoveredColor="#00775B">
          <span className="font-semibold">{row.name}</span>
        </InterCell>
      ),
    },
    {
      key: "status",
      header: "Status",
      headerContent: sh("Status", "status"),
      width: "110px",
      render: (row) => {
        const key = row.status.toLowerCase() as "online" | "offline" | "unknown";
        return <StatusCapsule status={key} label={row.status} />;
      },
    },
    {
      key: "protocol",
      header: "Protocol Type",
      headerContent: sh("Protocol Type", "protocol"),
      width: "130px",
      render: (row, hovered) => (
        <MonoCell hovered={hovered} fontSize={11} color="#475569">
          {row.protocolType}
        </MonoCell>
      ),
    },
    {
      key: "feedPath",
      header: "Feed Path",
      headerContent: sh("Feed Path", "feedPath"),
      render: (row, hovered) => (
        <span
          className="block truncate"
          title={row.feedPath}
          style={{
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            color: hovered ? "#0F172A" : "#64748B",
            transition: "color 120ms ease",
          }}
        >
          {row.feedPath}
        </span>
      ),
    },
    {
      key: "aspect",
      header: "Aspect Ratio",
      headerContent: sh("Aspect Ratio", "aspect"),
      width: "120px",
      align: "center",
      render: (row, hovered) => (
        <MonoCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#1E293B">
          {row.aspectRatio}
        </MonoCell>
      ),
    },
    {
      key: "dims",
      header: "Dimensions",
      headerContent: sh("Dimensions", "dims"),
      width: "120px",
      align: "center",
      render: (row, hovered) => (
        <MonoCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#1E293B">
          {row.dimensions}
        </MonoCell>
      ),
    },
    {
      key: "fps",
      header: "Streaming FPS",
      headerContent: sh("Streaming FPS", "fps"),
      width: "130px",
      align: "center",
      render: (row, hovered) => (
        <MonoCell hovered={hovered} fontSize={11} color="#475569" hoveredColor="#1E293B">
          {row.streamingFps}
        </MonoCell>
      ),
    },
    {
      key: "mem",
      header: "Memory Usage",
      headerContent: sh("Memory Usage", "mem"),
      width: "130px",
      align: "center",
      render: (row, hovered) => (
        <MonoCell hovered={hovered} fontSize={11} color={row.memoryUsage === "-" ? "#CBD5E1" : "#475569"} hoveredColor="#1E293B">
          {row.memoryUsage}
        </MonoCell>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* ── Stat Cards ──────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          value={onlineCount}
          label="Cameras Online"
          subLabel="Click to filter"
          valueColor="#00775B"
          onClick={() => setStatusFilter(statusFilter === "Online" ? null : "Online")}
        />
        <StatCard
          value={offlineCount}
          label="Cameras Offline"
          subLabel="Click to filter"
          valueColor="#E7000B"
          onClick={() => setStatusFilter(statusFilter === "Offline" ? null : "Offline")}
        />
        <StatCard
          value={noHeartbeat}
          label="No Recent Heartbeat"
          subLabel="Status unknown"
          valueColor="#1E293B"
          onClick={() => setStatusFilter(statusFilter === "Unknown" ? null : "Unknown")}
        />
      </div>

      {/* ── Table Section ───────────────────────────────────────────────────── */}
      <div className="bg-white rounded-[6px] border border-neutral-200 shadow-[0_1px_3px_rgba(0,0,0,0.1)] overflow-hidden">

        {/* Section heading + toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-neutral-100">
          <h2
            className="text-sm font-bold text-neutral-900"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            All Cameras
            <span className="ml-2 inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-[2px] bg-[#00775B] text-white text-[10px] font-bold">
              {filtered.length}
            </span>
          </h2>

          <div className="flex items-center gap-2 flex-wrap justify-end">
            {/* Columns button */}
            <button className="flex items-center gap-1.5 h-8 px-3 rounded-[4px] border border-neutral-200 bg-white text-xs font-semibold text-neutral-700 hover:bg-neutral-50 hover:border-neutral-300 transition-all shadow-sm">
              <Columns3 className="w-3.5 h-3.5 text-neutral-500" />
              Columns
            </button>

            {/* Search */}
            <div className="relative flex items-center">
              <Search className="absolute left-2.5 w-3.5 h-3.5 text-neutral-400 pointer-events-none" />
              <input
                type="text"
                placeholder="Search cameras"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-8 pl-8 pr-3 rounded-[4px] border border-neutral-200 bg-white text-xs font-normal text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#00775B] focus:ring-1 focus:ring-[#00775B]/20 transition-all w-44 shadow-sm"
              />
            </div>

            {/* Cameras by File */}
            <button className="flex items-center gap-1.5 h-8 px-4 rounded-[4px] bg-[#00775B] hover:bg-[#004E3D] active:bg-[#003D32] text-white text-xs font-semibold transition-all duration-200 shadow-sm">
              <Video className="w-3.5 h-3.5" />
              Cameras by File
            </button>

            {/* Add Camera(s) */}
            <button className="flex items-center gap-1.5 h-8 px-4 rounded-[4px] bg-[#00775B] hover:bg-[#004E3D] active:bg-[#003D32] text-white text-xs font-semibold transition-all duration-200 shadow-sm">
              <Video className="w-3.5 h-3.5" />
              Add Camera(s)
            </button>
          </div>
        </div>

        {/* Status filter chip if active */}
        {statusFilter && (
          <div className="flex items-center gap-2 px-5 py-2 border-b border-neutral-100 bg-[#E5FFF9]">
            <span className="text-xs text-neutral-600">Filtering by:</span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#00775B] text-white">
              {statusFilter}
              <button
                onClick={() => setStatusFilter(null)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                aria-label="Clear filter"
              >
                ×
              </button>
            </span>
          </div>
        )}

        {/* Data table */}
        <div className="overflow-x-auto">
          <div className="min-w-[900px]">
            <DataGrid<Camera>
              columns={columns}
              data={filtered}
              emptyState={
                <div className="flex flex-col items-center gap-2 py-16 text-neutral-400">
                  <Video className="w-8 h-8 opacity-40" />
                  <span className="text-sm font-medium">No cameras match your search</span>
                </div>
              }
            />
          </div>
        </div>

        {/* Footer row count */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-neutral-100 bg-neutral-50/60">
          <span
            className="text-[11px] text-neutral-500"
            style={{ fontFamily: "Inter, sans-serif" }}
          >
            {selected.size > 0
              ? `${selected.size} of ${filtered.length} selected`
              : `${filtered.length} camera${filtered.length !== 1 ? "s" : ""}`}
          </span>
          <span className="text-[11px] text-neutral-400" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            VMS · {new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })}
          </span>
        </div>
      </div>
    </div>
  );
};
