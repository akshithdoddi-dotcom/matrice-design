import { TrendingUp, CheckCircle, Clock, AlertCircle, Package, Cpu, Users, Layers, Upload, Box } from "lucide-react";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { DataGrid, MonoCell, InterCell, StatusCapsule } from "@fe-common/components/ui/DataGrid";
import { cn } from "@/app/lib/utils";

// ─── KPI rows ─────────────────────────────────────────────────────────────────

const STATS_ROW1: StatCardData[] = [
  { label: "Listed Services",   value: "124", sublabel: "Across All Categories",   num: "+8",   ref_: "vs Last Month",   dir: "up",     chip: "SERVICES",  color: "#00775B", bgColor: "#E5FFF9" },
  { label: "Active Partners",   value: "37",  sublabel: "Verified Publishers",      num: "+3",   ref_: "vs Last Quarter", dir: "up",     chip: "PARTNERS",  color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Monthly Installs",  value: "2.4k",sublabel: "App Store · This Month",  num: "+340", ref_: "vs Last Month",   dir: "up",     chip: "INSTALLS",  color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Compute Nodes",     value: "18",  sublabel: "BYOM & Managed",          num: "-2",   ref_: "vs Last Week",    dir: "down",   chip: "NODES",     color: "#059669", bgColor: "#ECFDF5" },
];

const STATS_ROW2: StatCardData[] = [
  { label: "Published Apps",    value: "3",   sublabel: "Live on Marketplace",     num: "+1",   ref_: "vs Last Month",   dir: "up",     chip: "PUBLISH",   color: "#D97706", bgColor: "#FFFBEB" },
  { label: "Pending Review",    value: "2",   sublabel: "Awaiting Approval",       num: "0",    ref_: "No Change",       dir: "neutral",chip: "REVIEW",    color: "#94A3B8", bgColor: "#F1F5F9" },
  { label: "BYOM Models",       value: "67",  sublabel: "Approved & Live",         num: "+3",   ref_: "vs Last Month",   dir: "up",     chip: "BYOM",      color: "#059669", bgColor: "#ECFDF5" },
  { label: "Reported Issues",   value: "2",   sublabel: "Open Across All Apps",    num: "+2",   ref_: "vs Last Week",    dir: "up",     chip: "ISSUES",    color: "#DC2626", bgColor: "#FEF2F2" },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

type ServiceStatus = "live" | "pending" | "draft" | "rejected";
type ServiceRow = { id: string; name: string; category: string; partner: string; installs: number; status: ServiceStatus; published: string };

const RECENT_SERVICES: ServiceRow[] = [
  { id: "svc-001", name: "Crowd Density Analytics",    category: "Safety",     partner: "Matrice AI",    installs: 312, status: "live",    published: "2026-05-01" },
  { id: "svc-002", name: "PPE Compliance Checker",     category: "Safety",     partner: "VisionEdge",    installs: 209, status: "live",    published: "2026-04-28" },
  { id: "svc-003", name: "Retail Queue Monitor",       category: "Retail",     partner: "RetailTech",    installs: 88,  status: "live",    published: "2026-04-20" },
  { id: "svc-004", name: "Forklift Proximity Alert",   category: "Industrial", partner: "SafeZone Inc",  installs: 0,   status: "pending", published: "2026-05-08" },
  { id: "svc-005", name: "Visitor Badge Verification", category: "Access",     partner: "SecureVision",  installs: 54,  status: "live",    published: "2026-04-15" },
];

type PartnerRow = { id: string; name: string; country: string; services: number; status: "verified" | "pending" | "suspended"; joined: string };

const TOP_PARTNERS: PartnerRow[] = [
  { id: "p-001", name: "VisionEdge",    country: "United States", services: 14, status: "verified",  joined: "2025-11-10" },
  { id: "p-002", name: "RetailTech",    country: "Germany",       services: 9,  status: "verified",  joined: "2025-12-03" },
  { id: "p-003", name: "SafeZone Inc",  country: "India",         services: 6,  status: "pending",   joined: "2026-03-21" },
  { id: "p-004", name: "SecureVision",  country: "UK",            services: 11, status: "verified",  joined: "2025-10-05" },
  { id: "p-005", name: "EdgeAnalytics", country: "Singapore",     services: 4,  status: "suspended", joined: "2026-01-14" },
];

type PublishStatus = "published" | "in-review" | "created";
type RecentPublish = { id: string; name: string; status: PublishStatus; versions: number; updatedAt: string; industries: string[] };

const RECENT_PUBLISHES: RecentPublish[] = [
  { id: "a-001", name: "IOROIEHOI",      status: "published", versions: 2, updatedAt: "2026-05-11", industries: ["Oil & Gas"] },
  { id: "a-002", name: "TEST NEW ZIP",   status: "in-review", versions: 1, updatedAt: "2026-01-12", industries: ["Airport"] },
  { id: "a-003", name: "PEOPLE COUNTING",status: "published", versions: 3, updatedAt: "2025-11-13", industries: ["Oil & Gas", "Agriculture"] },
  { id: "a-004", name: "COCO",           status: "published", versions: 2, updatedAt: "2026-05-08", industries: ["Cafe", "Manufacturing"] },
  { id: "a-005", name: "TESTING",        status: "in-review", versions: 1, updatedAt: "2025-07-28", industries: [] },
];

const PUB_STATUS_DOT: Record<PublishStatus, string>   = { published: "#16A34A", "in-review": "#D97706", created: "#94A3B8" };
const PUB_STATUS_LABEL: Record<PublishStatus, string> = { published: "Published", "in-review": "In Review", created: "Created" };

// ─── Status helpers ───────────────────────────────────────────────────────────

const SVC_STATUS_KEY:   Record<ServiceStatus, string> = { live: "active", pending: "queued", draft: "unknown", rejected: "critical" };
const SVC_STATUS_LABEL: Record<ServiceStatus, string> = { live: "Live",   pending: "Pending", draft: "Draft",   rejected: "Rejected" };

// ─── Platform section summary cards ──────────────────────────────────────────

const PLATFORM_SECTIONS = [
  { icon: Layers,  label: "Services",  value: "124 listed · 4 categories",   color: "#00775B", bgColor: "#E5FFF9",  note: "8 added this month" },
  { icon: Users,   label: "Partners",  value: "37 active · 2 pending review", color: "#0284C7", bgColor: "#E0F2FE",  note: "1 suspended account" },
  { icon: Upload,  label: "Publish",   value: "3 live · 2 in review",         color: "#D97706", bgColor: "#FFFBEB",  note: "2 open issues" },
  { icon: Cpu,     label: "Compute",   value: "18 nodes · 9 clusters",        color: "#059669", bgColor: "#ECFDF5",  note: "2 running jobs" },
  { icon: Box,     label: "BYOM",      value: "67 approved · 12 in review",   color: "#059669", bgColor: "#ECFDF5",  note: "5 added this week" },
  { icon: Package, label: "App Store", value: "2.4k installs · 5 categories", color: "#0284C7", bgColor: "#E0F2FE",  note: "+340 this month" },
];

// ─── Activity feed ────────────────────────────────────────────────────────────

const ACTIVITY = [
  { icon: CheckCircle, color: "#16A34A", text: "IOROIEHOI published to marketplace",       time: "2m ago" },
  { icon: Clock,       color: "#D97706", text: "TEST NEW ZIP submitted for review",         time: "1h ago" },
  { icon: TrendingUp,  color: "#0284C7", text: "VisionEdge added 2 new services",           time: "3h ago" },
  { icon: AlertCircle, color: "#DC2626", text: "Issue reported on TEST NEW ZIP v1.0",        time: "5h ago" },
  { icon: CheckCircle, color: "#16A34A", text: "SafeZone Inc partner application approved",  time: "1d ago" },
  { icon: TrendingUp,  color: "#7C3AED", text: "Crowd Density Analytics reached 300 installs","time": "1d ago" },
];

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function MarketplaceDashboard() {
  return (
    <div className="flex flex-col gap-6">

      {/* KPI row 1 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS_ROW1.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* KPI row 2 */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS_ROW2.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Platform section summary */}
      <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Platform Overview</h2>
          <span className="text-[10px] text-neutral-400">All sections</span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 divide-x divide-y divide-neutral-100">
          {PLATFORM_SECTIONS.map((s) => (
            <div key={s.label} className="flex flex-col gap-2 p-4 hover:bg-neutral-50/70 transition-colors">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-[4px] flex items-center justify-center" style={{ backgroundColor: s.bgColor }}>
                  <s.icon className="w-3.5 h-3.5" style={{ color: s.color }} />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-800">{s.label}</span>
              </div>
              <p className="text-[12px] font-semibold text-neutral-800 leading-snug">{s.value}</p>
              <p className="text-[10px] text-neutral-400">{s.note}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Services */}
        <div className="xl:col-span-2 bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Recent Services</h2>
            <span className="text-[10px] text-neutral-400">{RECENT_SERVICES.length} shown</span>
          </div>
          <DataGrid<ServiceRow>
            columns={[
              { key: "name",     header: "Service Name", render: (r, h) => <InterCell hovered={h} isPrimary fontSize={11}>{r.name}</InterCell> },
              { key: "category", header: "Category", width: "110px", render: (r, h) => <InterCell hovered={h} fontSize={10} color="#64748B" hoveredColor="#334155">{r.category}</InterCell> },
              { key: "partner",  header: "Partner",  width: "120px", render: (r, h) => <InterCell hovered={h} fontSize={10} color="#64748B" hoveredColor="#334155">{r.partner}</InterCell> },
              { key: "installs", header: "Installs", width: "72px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#0F172A">{r.installs.toLocaleString()}</MonoCell> },
              { key: "status",   header: "Status",   width: "90px",  render: (r) => <StatusCapsule status={SVC_STATUS_KEY[r.status]} label={SVC_STATUS_LABEL[r.status]} /> },
              { key: "published",header: "Published",width: "96px",  align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.published}</MonoCell> },
            ]}
            data={RECENT_SERVICES}
            compact
          />
        </div>

        {/* Activity Feed */}
        <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Recent Activity</h2>
            <span className="w-1.5 h-1.5 rounded-full bg-[#00775B] animate-pulse" />
          </div>
          <div className="flex flex-col divide-y divide-neutral-100 flex-1 overflow-y-auto">
            {ACTIVITY.map((a, i) => (
              <div key={i} className="px-5 py-3 hover:bg-neutral-50/70 transition-colors flex items-start gap-3">
                <div className="w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{ backgroundColor: a.color + "18" }}>
                  <a.icon className="w-3.5 h-3.5" style={{ color: a.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-neutral-700 leading-snug">{a.text}</p>
                  <p className="text-[10px] text-neutral-400 mt-0.5">{a.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

        {/* Recent Publishes */}
        <div className="xl:col-span-2 bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden flex flex-col">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Recent Publishes</h2>
            <span className="text-[10px] text-neutral-400">{RECENT_PUBLISHES.length} shown</span>
          </div>
          <DataGrid<RecentPublish>
            columns={[
              { key: "name",      header: "Application", render: (r, h) => <InterCell hovered={h} isPrimary fontSize={11}>{r.name}</InterCell> },
              { key: "status",    header: "Status", width: "110px", render: (r) => (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: PUB_STATUS_DOT[r.status] }} />
                  <span className="text-[10px] font-semibold" style={{ color: PUB_STATUS_DOT[r.status] }}>{PUB_STATUS_LABEL[r.status]}</span>
                </div>
              )},
              { key: "versions",  header: "Versions",   width: "72px", align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={11} color="#64748B" hoveredColor="#0F172A">{r.versions}</MonoCell> },
              { key: "industries",header: "Industries",  width: "180px", render: (r) => (
                <div className="flex gap-1 flex-wrap">
                  {r.industries.map((ind) => (
                    <span key={ind} className="text-[9px] font-semibold uppercase px-1.5 py-0.5 bg-neutral-100 text-neutral-500 rounded-sm">{ind}</span>
                  ))}
                </div>
              )},
              { key: "updatedAt", header: "Updated",    width: "96px", align: "right", render: (r, h) => <MonoCell hovered={h} fontSize={10} color="#94A3B8" hoveredColor="#475569">{r.updatedAt}</MonoCell> },
            ]}
            data={RECENT_PUBLISHES}
            compact
          />
        </div>

        {/* Top Partners */}
        <div className="bg-white rounded-[4px] border border-neutral-200 shadow-sm flex flex-col overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-neutral-700">Top Partners</h2>
            <span className="text-[10px] text-neutral-400">{TOP_PARTNERS.length} partners</span>
          </div>
          <div className="flex flex-col divide-y divide-neutral-100 flex-1 overflow-y-auto">
            {TOP_PARTNERS.map((p) => (
              <div key={p.id} className="px-5 py-3 hover:bg-neutral-50/70 transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-neutral-800 truncate flex-1 mr-2">{p.name}</span>
                  <StatusCapsule
                    status={p.status === "verified" ? "active" : p.status === "pending" ? "queued" : "failed"}
                    label={p.status.charAt(0).toUpperCase() + p.status.slice(1)}
                  />
                </div>
                <div className="flex items-center gap-3 text-[10px] text-neutral-400">
                  <span>{p.country}</span>
                  <span>·</span>
                  <span className="flex items-center gap-1">
                    <TrendingUp className="w-2.5 h-2.5" />
                    {p.services} services
                  </span>
                  <span>·</span>
                  <span className="font-mono">{p.joined}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
