import { useState } from "react";
import { LayoutGrid, List, Plus, RefreshCw, Pencil, Power, Trash2, Key, ArrowUpRight } from "lucide-react";
import { DataGrid, MonoCell, InterCell, StatusCapsule, GridActions, GridActionButton } from "@fe-common/components/ui/DataGrid";
import { StatCard, StatCardData } from "@fe-common/components/ui/StatCard";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@fe-common/components/ui/accordion";
import { cn } from "@/app/lib/utils";

// ─── Shared primitives ────────────────────────────────────────────────────────

const TEAL = "#00775B";

const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const SectionHeader = ({
  title, subtitle, action,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
}) => (
  <div className="flex items-start justify-between px-5 py-4 border-b border-neutral-100">
    <div>
      <h3 className="text-[13px] font-semibold text-neutral-800">{title}</h3>
      {subtitle && <p className="text-[11px] text-neutral-400 mt-0.5">{subtitle}</p>}
    </div>
    {action}
  </div>
);

const FieldGroup = ({ label, children }: { label?: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    {label && <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{label}</label>}
    {children}
  </div>
);

const Input = ({ placeholder, type = "text", value, onChange }: { placeholder: string; type?: string; value?: string; onChange?: (v: string) => void }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    className="w-full h-9 px-3 text-[12px] font-inter text-neutral-700 bg-white border border-neutral-200 rounded-[4px] outline-none placeholder:text-neutral-400 focus:border-[#00775B] transition-colors"
  />
);

const Select = ({ placeholder, options, value, onChange }: { placeholder: string; options: string[]; value?: string; onChange?: (v: string) => void }) => (
  <select
    value={value ?? ""}
    onChange={onChange ? (e) => onChange(e.target.value) : undefined}
    className="w-full h-9 px-3 text-[12px] text-neutral-700 bg-white border border-neutral-200 rounded-[4px] outline-none appearance-none focus:border-[#00775B] transition-colors"
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

const Btn = ({
  children, variant = "primary", onClick, disabled, size = "md",
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md";
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={cn(
      "inline-flex items-center gap-1.5 font-semibold uppercase tracking-wide rounded-[4px] transition-colors",
      size === "sm" ? "h-7 px-3 text-[10px]" : "h-9 px-4 text-[11px]",
      variant === "primary" && "bg-[#00775B] hover:bg-[#006649] text-white disabled:opacity-40",
      variant === "ghost" && "border border-neutral-200 hover:bg-neutral-50 text-neutral-600 disabled:opacity-40",
    )}
  >
    {children}
  </button>
);

// ─── Mock data ────────────────────────────────────────────────────────────────

type Service = { id: string; name: string; status: "active" | "inactive"; deployType: string; members: number; partner: string; edited: string };
const SERVICES: Service[] = [
  { id: "svc-1", name: "Matrice Primary Account",  status: "active",   deployType: "Platform",  members: 12, partner: "Matrice AI",  edited: "2026-05-04" },
  { id: "svc-2", name: "VisionEdge Production",    status: "active",   deployType: "System DB", members: 7,  partner: "VisionEdge",  edited: "2026-04-28" },
  { id: "svc-3", name: "RetailTech Staging",       status: "inactive", deployType: "Matrice DB",members: 3,  partner: "RetailTech",  edited: "2026-04-10" },
  { id: "svc-4", name: "SecureVision Account",     status: "active",   deployType: "Platform",  members: 9,  partner: "SecureVision",edited: "2026-05-01" },
];

type Member = { id: string; name: string; email: string; role: string; source: string; joined: string };
const MEMBERS: Member[] = [
  { id: "m-1", name: "Arun Kumar",    email: "arun@matrice.ai",       role: "Primary Admin", source: "External", joined: "2025-10-01" },
  { id: "m-2", name: "Meera Singh",   email: "meera@visionedge.io",   role: "Admin",         source: "External", joined: "2025-11-14" },
  { id: "m-3", name: "Raj Patel",     email: "raj@retailtech.de",     role: "Member",        source: "Internal", joined: "2026-01-08" },
  { id: "m-4", name: "Sofia Müller",  email: "sofia@safezone.in",     role: "Member",        source: "External", joined: "2026-02-19" },
  { id: "m-5", name: "James Wong",    email: "james@securevision.uk", role: "Admin",         source: "Internal", joined: "2026-03-05" },
];

type Partner = { id: string; name: string; contact: string; customers: string; status: "active" | "pending" | "suspended" };
const PARTNERS: Partner[] = [
  { id: "p-1", name: "VisionEdge",    contact: "partner@visionedge.io",    customers: "4 / 55",  status: "active" },
  { id: "p-2", name: "RetailTech",    contact: "admin@retailtech.de",       customers: "2 / 20",  status: "active" },
  { id: "p-3", name: "SafeZone Inc",  contact: "ops@safezone.in",           customers: "0 / 10",  status: "pending" },
];

type Licence = { id: string; alias: string; key: string; status: "active" | "expired"; cameras: number; basic: number; advanced: number; expires: string };
const LICENCES: Licence[] = [
  { id: "l-1", alias: "MatriceDB Fault tolerant",   key: "5a71-3555-14…", status: "expired", cameras: 1000,   basic: 1000, advanced: 1000, expires: "Apr 30, 2026" },
  { id: "l-2", alias: "ML Apps",                    key: "bc15-e690-99…", status: "active",  cameras: 100,    basic: 100,  advanced: 100,  expires: "—" },
  { id: "l-3", alias: "license2",                   key: "4bbf-3304-87…", status: "expired", cameras: 999,    basic: 999,  advanced: 999,  expires: "Mar 31, 2026" },
  { id: "l-4", alias: "ML_App_Test_Licence001",     key: "2907-50a6-73…", status: "expired", cameras: 99999,  basic: 9999, advanced: 9999, expires: "Mar 31, 2026" },
  { id: "l-5", alias: "footfall_license",           key: "f341-e5aa-f3…", status: "active",  cameras: 99,     basic: 99,   advanced: 0,    expires: "Dec 1, 2026" },
  { id: "l-6", alias: "People_detect License",      key: "0a95-5727-e5…", status: "active",  cameras: 99,     basic: 0,    advanced: 0,    expires: "—" },
  { id: "l-7", alias: "Matrice AI Primary License", key: "4965-0da2-65…", status: "active",  cameras: 100000, basic: 10000,advanced: 0,    expires: "Dec 31, 2026" },
];

const OVERVIEW_STATS: StatCardData[] = [
  { label: "Total Services",   value: String(SERVICES.length),                                     sublabel: "All Deployments",       num: "+1", ref_: "vs Last Month",  dir: "up",      chip: "ALL",      color: "#00775B", bgColor: "#E5FFF9" },
  { label: "Active Services",  value: String(SERVICES.filter(s => s.status === "active").length),  sublabel: "Currently Live",        num: "+1", ref_: "vs Last Month",  dir: "up",      chip: "LIVE",     color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Total Members",    value: String(SERVICES.reduce((a, s) => a + s.members, 0)),         sublabel: "Across All Services",   num: "+3", ref_: "vs Last Week",   dir: "up",      chip: "MEMBERS",  color: "#7C3AED", bgColor: "#F3EEFF" },
  { label: "Linked Partners",  value: String(PARTNERS.length),                                     sublabel: "Partner Organisations", num: "0",  ref_: "No Change",      dir: "neutral", chip: "PARTNERS", color: "#D97706", bgColor: "#FFFBEB" },
];

const LICENCE_STATS = (total: number, active: number, expired: number): StatCardData[] => [
  { label: "Total Licences",   value: String(total),   sublabel: "All Issued",       num: "+2", ref_: "vs Last Month", dir: "up", chip: "ALL",     color: "#0284C7", bgColor: "#E0F2FE" },
  { label: "Active Licences",  value: String(active),  sublabel: "Currently Valid",  num: "+1", ref_: "vs Last Month", dir: "up", chip: "ACTIVE",  color: "#00775B", bgColor: "#E5FFF9" },
  { label: "Expired Licences", value: String(expired), sublabel: "Past Expiry Date", num: "+1", ref_: "vs Last Month", dir: "up", chip: "EXPIRED", color: "#DC2626", bgColor: "#FEF2F2" },
];

// ─── Tab button ───────────────────────────────────────────────────────────────

type Tab = "overview" | "access" | "licenses";

const TabBar = ({ active, onChange }: { active: Tab; onChange: (t: Tab) => void }) => {
  const tabs: { id: Tab; label: string }[] = [
    { id: "overview",  label: "Overview" },
    { id: "access",    label: "Access Control" },
    { id: "licenses",  label: "Licenses" },
  ];
  return (
    <div className="flex items-center gap-0 border-b border-neutral-200 bg-white px-6">
      {tabs.map((t) => (
        <button
          key={t.id}
          onClick={() => onChange(t.id)}
          className={cn(
            "relative px-4 py-3 text-[12px] font-semibold transition-colors",
            active === t.id
              ? "text-[#00775B]"
              : "text-neutral-500 hover:text-neutral-700"
          )}
        >
          {t.label}
          {active === t.id && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00775B] rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
};

// ─── Overview tab ─────────────────────────────────────────────────────────────

function OverviewTab() {
  const [view, setView] = useState<"grid" | "list">("list");

  return (
    <div className="flex flex-col gap-5">
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {OVERVIEW_STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Services table */}
      <SectionCard>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100 gap-3">
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-800">Customer Service Accounts</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">Click on a service to switch to that account</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center border border-neutral-200 rounded-[4px] overflow-hidden">
              <button onClick={() => setView("grid")} className={cn("p-1.5 transition-colors", view === "grid" ? "bg-neutral-100 text-neutral-700" : "text-neutral-400 hover:text-neutral-600")}>
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button onClick={() => setView("list")} className={cn("p-1.5 transition-colors", view === "list" ? "bg-neutral-100 text-neutral-700" : "text-neutral-400 hover:text-neutral-600")}>
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
            <button className="p-1.5 rounded-[4px] border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            <Btn><Plus className="w-3.5 h-3.5" /> Create Service</Btn>
          </div>
        </div>

        {view === "list" ? (
          <DataGrid<Service>
            searchable
            searchPlaceholder="Search services…"
            columns={[
              {
                key: "name",
                header: "Service Name",
                render: (row, hov) => <InterCell hovered={hov} isPrimary fontSize={12}>{row.name}</InterCell>,
              },
              {
                key: "deployType",
                header: "Deployment Type",
                width: "140px",
                render: (row, hov) => <InterCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.deployType}</InterCell>,
              },
              {
                key: "partner",
                header: "Partner",
                width: "140px",
                render: (row, hov) => <InterCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.partner}</InterCell>,
              },
              {
                key: "members",
                header: "Members",
                width: "80px",
                align: "right",
                render: (row, hov) => <MonoCell hovered={hov} fontSize={11}>{row.members}</MonoCell>,
              },
              {
                key: "status",
                header: "Status",
                width: "90px",
                render: (row) => <StatusCapsule status={row.status} />,
              },
              {
                key: "edited",
                header: "Last Edited",
                width: "100px",
                align: "right",
                render: (row, hov) => <MonoCell hovered={hov} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.edited}</MonoCell>,
              },
              {
                key: "actions",
                header: "",
                width: "70px",
                align: "right",
                render: (row, hov) => (
                  <div className="flex justify-end pr-1">
                    <GridActions visible={hov}>
                      <GridActionButton title="Open" hoverColor={TEAL}><ArrowUpRight className="w-3.5 h-3.5" /></GridActionButton>
                    </GridActions>
                  </div>
                ),
              },
            ]}
            data={SERVICES}
          />
        ) : (
          <div className="p-5 grid grid-cols-2 xl:grid-cols-4 gap-3">
            {SERVICES.map((s) => (
              <div key={s.id} className="border border-neutral-200 rounded-[4px] p-4 hover:border-[#00775B]/40 hover:bg-[#00775B]/[0.02] transition-colors cursor-pointer group">
                <div className="flex items-start justify-between mb-2">
                  <p className="text-[12px] font-semibold text-neutral-800 group-hover:text-[#00775B] transition-colors leading-tight">{s.name}</p>
                </div>
                <StatusCapsule status={s.status} />
                <p className="text-[10px] text-neutral-400 mt-2 font-mono">Edited {s.edited}</p>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </div>
  );
}

// ─── Access Control tab ───────────────────────────────────────────────────────

function AccessControlTab() {
  const [invite, setInvite] = useState({ firstName: "", lastName: "", email: "", service: "", role: "" });
  const [assign, setAssign] = useState({ member: "", account: "", role: "" });
  const [partner, setPartner] = useState({ service: "", partner: "" });

  const inviteValid = invite.firstName && invite.lastName && invite.email && invite.service;
  const assignValid = assign.member && assign.account && assign.role;
  const partnerValid = partner.service && partner.partner;

  return (
    <div className="flex flex-col gap-5">

      {/* Row 1: Invite + Assign Team Member */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <SectionCard>
          <SectionHeader title="Invite Customer Manager" subtitle="Send invitation to client-side users who will manage a customer service account" />
          <div className="p-5 flex flex-col gap-4">
            <div className="grid grid-cols-2 gap-3">
              <Input placeholder="First Name *" value={invite.firstName} onChange={(v) => setInvite(f => ({ ...f, firstName: v }))} />
              <Input placeholder="Last Name *" value={invite.lastName} onChange={(v) => setInvite(f => ({ ...f, lastName: v }))} />
            </div>
            <Input placeholder="Email Address *" value={invite.email} onChange={(v) => setInvite(f => ({ ...f, email: v }))} />
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-2">Deployment Type</p>
              <DeployTypeToggle />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Select placeholder="Select Service *" options={SERVICES.map(s => s.name)} value={invite.service} onChange={(v) => setInvite(f => ({ ...f, service: v }))} />
              <Select placeholder="Role" options={["Primary Admin", "Admin", "Member"]} value={invite.role} onChange={(v) => setInvite(f => ({ ...f, role: v }))} />
            </div>
            <div className="flex justify-end gap-2">
              <Btn variant="ghost" onClick={() => setInvite({ firstName: "", lastName: "", email: "", service: "", role: "" })}>Clear</Btn>
              <Btn disabled={!inviteValid}>Send Invitation</Btn>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader title="Assign Matrice Team Member" subtitle="Grant your internal Matrice team access to manage customer service accounts" />
          <div className="p-5 flex flex-col gap-4">
            <Select placeholder="Select Matrice Team Member" options={["Arun Kumar", "Meera Singh", "James Wong"]} value={assign.member} onChange={(v) => setAssign(f => ({ ...f, member: v }))} />
            <div className="grid grid-cols-2 gap-3">
              <Select placeholder="Customer Service Account" options={SERVICES.map(s => s.name)} value={assign.account} onChange={(v) => setAssign(f => ({ ...f, account: v }))} />
              <Select placeholder="Role" options={["Admin", "Member", "Viewer"]} value={assign.role} onChange={(v) => setAssign(f => ({ ...f, role: v }))} />
            </div>
            <div className="flex justify-end">
              <Btn disabled={!assignValid}>Assign to Customer</Btn>
            </div>
          </div>
        </SectionCard>
      </div>

      {/* Row 2: Assign to Partner + Partners Overview */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

        <SectionCard>
          <SectionHeader title="Assign Service to Partner" subtitle="Link a service account to a partner organisation" />
          <div className="p-5 flex flex-col gap-4">
            <Select placeholder="Select Service Account" options={SERVICES.map(s => s.name)} value={partner.service} onChange={(v) => setPartner(f => ({ ...f, service: v }))} />
            <Select placeholder="Select Partner" options={PARTNERS.map(p => p.name)} value={partner.partner} onChange={(v) => setPartner(f => ({ ...f, partner: v }))} />
            <p className="text-[11px] text-neutral-400 bg-neutral-50 border border-neutral-100 rounded-[4px] p-3 leading-relaxed">
              This will assign the service account under the partner's management and sync subscription settings from the partner.
            </p>
            <div className="flex justify-end">
              <Btn disabled={!partnerValid}>Assign to Partner</Btn>
            </div>
          </div>
        </SectionCard>

        <SectionCard>
          <SectionHeader title="Partners Overview" subtitle={`${PARTNERS.length} partner${PARTNERS.length !== 1 ? "s" : ""} registered`} />
          <DataGrid<Partner>
            columns={[
              {
                key: "name",
                header: "Partner",
                render: (row, hov) => <InterCell hovered={hov} isPrimary fontSize={11}>{row.name}</InterCell>,
              },
              {
                key: "contact",
                header: "Contact",
                render: (row, hov) => <MonoCell hovered={hov} fontSize={10} color="#64748B" hoveredColor="#334155">{row.contact}</MonoCell>,
              },
              {
                key: "customers",
                header: "Customers",
                width: "90px",
                align: "right",
                render: (row, hov) => <MonoCell hovered={hov} fontSize={11}>{row.customers}</MonoCell>,
              },
              {
                key: "status",
                header: "Status",
                width: "90px",
                render: (row) => (
                  <StatusCapsule
                    status={row.status === "active" ? "active" : row.status === "pending" ? "queued" : "failed"}
                    label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  />
                ),
              },
            ]}
            data={PARTNERS}
            compact
          />
        </SectionCard>
      </div>

      {/* Service Members */}
      <SectionCard>
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-neutral-100">
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-800">Service Members</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">View and manage users with access to a service</p>
          </div>
          <div className="flex items-center gap-2">
            <Select placeholder="Filter by service" options={SERVICES.map(s => s.name)} />
            <button className="p-1.5 rounded-[4px] border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <DataGrid<Member>
          searchable
          searchPlaceholder="Search members…"
          pageSize={8}
          columns={[
            {
              key: "name",
              header: "Name",
              render: (row, hov) => <InterCell hovered={hov} isPrimary fontSize={12}>{row.name}</InterCell>,
            },
            {
              key: "email",
              header: "Email",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.email}</MonoCell>,
            },
            {
              key: "role",
              header: "Role",
              width: "130px",
              render: (row) => {
                const isAdmin = row.role.includes("Admin");
                return (
                  <span style={{
                    display: "inline-flex", alignItems: "center", padding: "2px 8px",
                    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                    textTransform: "uppercase" as const,
                    color: isAdmin ? TEAL : "#64748B",
                    backgroundColor: isAdmin ? `${TEAL}12` : "#F1F5F9",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}>
                    {row.role}
                  </span>
                );
              },
            },
            {
              key: "source",
              header: "Source",
              width: "100px",
              render: (row) => (
                <span style={{
                  display: "inline-flex", alignItems: "center", padding: "2px 8px",
                  borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.04em",
                  textTransform: "uppercase" as const,
                  color: row.source === "Internal" ? "#7C3AED" : "#475569",
                  backgroundColor: row.source === "Internal" ? "#F3EEFF" : "#F1F5F9",
                  fontFamily: "'JetBrains Mono', monospace",
                }}>
                  {row.source}
                </span>
              ),
            },
            {
              key: "joined",
              header: "Joined",
              width: "100px",
              align: "right",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.joined}</MonoCell>,
            },
          ]}
          data={MEMBERS}
        />
      </SectionCard>
    </div>
  );
}

function DeployTypeToggle() {
  const [active, setActive] = useState("Platform");
  const opts = ["Platform", "System DB", "Matrice DB"];
  return (
    <div className="flex rounded-[4px] border border-neutral-200 overflow-hidden w-fit">
      {opts.map((o) => (
        <button
          key={o}
          onClick={() => setActive(o)}
          className={cn(
            "px-4 h-8 text-[11px] font-semibold transition-colors",
            active === o
              ? "bg-[#00775B] text-white"
              : "text-neutral-600 hover:bg-neutral-50"
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

// ─── Licenses tab ─────────────────────────────────────────────────────────────

function LicensesTab() {
  const total = LICENCES.length;
  const active = LICENCES.filter(l => l.status === "active").length;
  const expired = LICENCES.filter(l => l.status === "expired").length;

  return (
    <div className="flex flex-col gap-5">

      {/* Stat cards */}
      <div className="grid grid-cols-3 gap-4">
        {LICENCE_STATS(total, active, expired).map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Create New Licence — Accordion */}
      <SectionCard>
        <Accordion type="single" collapsible defaultValue="create-licence">
          <AccordionItem value="create-licence" className="border-b-0">
            <AccordionTrigger className="px-5 py-4 text-[13px] font-semibold text-neutral-800 hover:no-underline hover:bg-neutral-50/60 transition-colors [&[data-state=open]>svg]:rotate-180">
              <span className="flex flex-col items-start gap-0.5">
                <span className="text-[13px] font-semibold text-neutral-800">Create New Licence</span>
                <span className="text-[11px] font-normal text-neutral-400">Generate a new software licence for a customer service account</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <div className="px-5 pb-5 flex flex-col gap-4 border-t border-neutral-100">
                <div className="pt-4">
                  <Select placeholder="Customer Service Account" options={SERVICES.map(s => s.name)} />
                </div>
                <FieldGroup label="Licence Alias (Optional)">
                  <Input placeholder="A friendly name to identify this licence" />
                </FieldGroup>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400 mb-3">Deployment Limits</p>
                  <div className="grid grid-cols-3 gap-3">
                    <FieldGroup label="Max Cameras"><Input placeholder="0" /></FieldGroup>
                    <FieldGroup label="Basic App Deployment Instance"><Input placeholder="0" /></FieldGroup>
                    <FieldGroup label="Advanced App Deployment Instance"><Input placeholder="0" /></FieldGroup>
                  </div>
                </div>
                <FieldGroup label="Expiry Date (Optional)">
                  <Input placeholder="dd/mm/yyyy" type="date" />
                </FieldGroup>
                <div className="flex justify-end gap-2">
                  <Btn variant="ghost">Clear</Btn>
                  <Btn><Key className="w-3.5 h-3.5" /> Create Licence</Btn>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SectionCard>

      {/* Customer Licences table */}
      <SectionCard>
        <div className="flex items-start justify-between px-5 py-3.5 border-b border-neutral-100">
          <div>
            <h3 className="text-[13px] font-semibold text-neutral-800">Customer Licences</h3>
            <p className="text-[11px] text-neutral-400 mt-0.5">View and manage licences for a customer service account</p>
          </div>
          <div className="flex items-center gap-2">
            <Select placeholder="Filter by service" options={SERVICES.map(s => s.name)} />
            <button className="p-1.5 rounded-[4px] border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors">
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        <DataGrid<Licence>
          searchable
          searchPlaceholder="Search licences…"
          pageSize={8}
          columns={[
            {
              key: "alias",
              header: "Alias",
              render: (row, hov) => <InterCell hovered={hov} isPrimary fontSize={11}>{row.alias}</InterCell>,
            },
            {
              key: "key",
              header: "Licence Key",
              width: "140px",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.key}</MonoCell>,
            },
            {
              key: "status",
              header: "Status",
              width: "90px",
              render: (row) => (
                <StatusCapsule
                  status={row.status === "active" ? "active" : "failed"}
                  label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                />
              ),
            },
            {
              key: "cameras",
              header: "Cameras",
              width: "80px",
              align: "right",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11}>{row.cameras.toLocaleString()}</MonoCell>,
            },
            {
              key: "basic",
              header: "Basic",
              width: "72px",
              align: "right",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11}>{row.basic.toLocaleString()}</MonoCell>,
            },
            {
              key: "advanced",
              header: "Advanced",
              width: "80px",
              align: "right",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11}>{row.advanced.toLocaleString()}</MonoCell>,
            },
            {
              key: "expires",
              header: "Expires",
              width: "110px",
              align: "right",
              render: (row, hov) => (
                <MonoCell hovered={hov} fontSize={10}
                  color={row.status === "expired" ? "#EA580C" : "#94A3B8"}
                  hoveredColor={row.status === "expired" ? "#C2410C" : "#475569"}>
                  {row.expires}
                </MonoCell>
              ),
            },
            {
              key: "actions",
              header: "Actions",
              width: "90px",
              align: "right",
              render: (_, hov) => (
                <GridActions visible={hov}>
                  <GridActionButton title="Edit"    hoverColor={TEAL}>       <Pencil  className="w-3 h-3" /></GridActionButton>
                  <GridActionButton title="Toggle"  hoverColor="#E19A04">    <Power   className="w-3 h-3" /></GridActionButton>
                  <GridActionButton title="Delete"  hoverColor="#E7000B">    <Trash2  className="w-3 h-3" /></GridActionButton>
                </GridActions>
              ),
            },
          ]}
          data={LICENCES}
        />
      </SectionCard>
    </div>
  );
}

// ─── ServicesPage ─────────────────────────────────────────────────────────────

export function ServicesPage() {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <div className="flex flex-col gap-0 -mt-6 -mx-6">
      {/* Tabs */}
      <TabBar active={tab} onChange={setTab} />

      {/* Content */}
      <div className="p-6">
        {tab === "overview"  && <OverviewTab />}
        {tab === "access"    && <AccessControlTab />}
        {tab === "licenses"  && <LicensesTab />}
      </div>
    </div>
  );
}
