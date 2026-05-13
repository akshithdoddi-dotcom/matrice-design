import { useState } from "react";
import { ChevronDown, Plus, RefreshCw, Trash2, Pencil } from "lucide-react";
import { StatCard, StatCardData } from "@/app/components/ui/StatCard";
import {
  DataGrid, MonoCell, InterCell, StatusCapsule,
  GridActions, GridActionButton,
} from "@/app/components/ui/DataGrid";
import {
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from "@/app/components/ui/accordion";
import { cn } from "@/app/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const TEAL = "#00775B";

// ─── Primitives ───────────────────────────────────────────────────────────────

const SectionCard = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("bg-white rounded-[4px] border border-neutral-200 shadow-sm overflow-hidden", className)}>
    {children}
  </div>
);

const FieldLabel = ({ children }: { children: React.ReactNode }) => (
  <label className="text-[10px] font-semibold uppercase tracking-wider text-neutral-400">{children}</label>
);

const FieldGroup = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="flex flex-col gap-1">
    <FieldLabel>{label}</FieldLabel>
    {children}
  </div>
);

const FormInput = ({
  placeholder, value, onChange, type = "text",
}: { placeholder: string; value: string; onChange: (v: string) => void; type?: string }) => (
  <input
    type={type}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-9 px-3 text-[12px] text-neutral-700 bg-white border border-neutral-200 rounded-[4px] outline-none placeholder:text-neutral-400 focus:border-[#00775B] transition-colors"
  />
);

const FormSelect = ({
  placeholder, options, value, onChange,
}: { placeholder: string; options: string[]; value: string; onChange: (v: string) => void }) => (
  <select
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full h-9 px-3 text-[12px] text-neutral-700 bg-white border border-neutral-200 rounded-[4px] outline-none appearance-none focus:border-[#00775B] transition-colors"
  >
    <option value="" disabled>{placeholder}</option>
    {options.map((o) => <option key={o}>{o}</option>)}
  </select>
);

const Btn = ({
  children, variant = "primary", disabled, onClick,
}: {
  children: React.ReactNode;
  variant?: "primary" | "ghost";
  disabled?: boolean;
  onClick?: () => void;
}) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={cn(
      "inline-flex items-center gap-1.5 h-9 px-4 text-[11px] font-semibold rounded-[4px] transition-colors",
      variant === "primary" && "bg-[#00775B] hover:bg-[#006649] text-white disabled:opacity-40",
      variant === "ghost" && "border border-neutral-200 hover:bg-neutral-50 text-neutral-600",
    )}
  >
    {children}
  </button>
);

// ─── Stat cards ───────────────────────────────────────────────────────────────

const STATS: StatCardData[] = [
  {
    label: "Total Partners",
    value: "37",
    sublabel: "Registered Organisations",
    num: "+3",
    ref_: "vs Last Quarter",
    dir: "up",
    chip: "ALL TIME",
    color: "#0284C7",
    bgColor: "#E0F2FE",
  },
  {
    label: "Active Partners",
    value: "29",
    sublabel: "Verified & Enabled",
    num: "+2",
    ref_: "vs Last Month",
    dir: "up",
    chip: "ACTIVE",
    color: "#00775B",
    bgColor: "#E5FFF9",
  },
  {
    label: "Pending Review",
    value: "5",
    sublabel: "Awaiting Approval",
    num: "+2",
    ref_: "vs Last Week",
    dir: "up",
    chip: "PENDING",
    color: "#D97706",
    bgColor: "#FFFBEB",
  },
  {
    label: "Suspended",
    value: "3",
    sublabel: "Access Restricted",
    num: "-1",
    ref_: "vs Last Month",
    dir: "down",
    chip: "SUSPENDED",
    color: "#DC2626",
    bgColor: "#FEF2F2",
  },
];

// ─── Mock data ────────────────────────────────────────────────────────────────

type PartnerStatus = "active" | "pending" | "suspended";

type PartnerRow = {
  id: string;
  company: string;
  accountNumber: string;
  contactEmail: string;
  contactName: string;
  country: string;
  customers: number;
  maxCustomers: number;
  status: PartnerStatus;
  onboarded: string;
};

const PARTNERS: PartnerRow[] = [
  { id: "p-001", company: "VisionEdge",     accountNumber: "3806305672335492239971…", contactEmail: "partner@visionedge.io",    contactName: "John Doe",       country: "United States", customers: 0,  maxCustomers: 55,  status: "active",    onboarded: "Jan 8, 2026 7:51 PM" },
  { id: "p-002", company: "RetailTech",     accountNumber: "7a21f904c8b3d56091ef02…", contactEmail: "admin@retailtech.de",       contactName: "Klaus Müller",   country: "Germany",       customers: 4,  maxCustomers: 20,  status: "active",    onboarded: "Dec 3, 2025 2:14 PM" },
  { id: "p-003", company: "SafeZone Inc",   accountNumber: "c49d87a01e2f3b5607dd14…", contactEmail: "ops@safezone.in",           contactName: "Priya Sharma",   country: "India",         customers: 0,  maxCustomers: 10,  status: "pending",   onboarded: "Mar 21, 2026 9:30 AM" },
  { id: "p-004", company: "SecureVision",   accountNumber: "8f36b0e2d14c7a59021f83…", contactEmail: "info@securevision.uk",      contactName: "James Whitfield",country: "United Kingdom",customers: 3,  maxCustomers: 30,  status: "active",    onboarded: "Oct 5, 2025 11:00 AM" },
  { id: "p-005", company: "EdgeAnalytics",  accountNumber: "20a57d3c6e89f104b21c47…", contactEmail: "hello@edgeanalytics.sg",    contactName: "Li Wei",         country: "Singapore",     customers: 1,  maxCustomers: 15,  status: "suspended", onboarded: "Jan 14, 2026 4:22 PM" },
];

const COUNTRIES = ["United States", "Germany", "India", "United Kingdom", "Singapore", "Australia", "Canada", "France", "Japan", "Brazil"];

const STATUS_KEY: Record<PartnerStatus, string> = {
  active: "active", pending: "queued", suspended: "failed",
};

// ─── Invite form ──────────────────────────────────────────────────────────────

function InvitePartnerForm() {
  const [form, setForm] = useState({
    company: "", contactName: "", contactEmail: "", country: "", maxCustomers: "",
  });

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }));

  const valid = form.company && form.contactName && form.contactEmail && form.country;

  const clear = () => setForm({ company: "", contactName: "", contactEmail: "", country: "", maxCustomers: "" });

  return (
    <div className="p-5 flex flex-col gap-4 border-t border-neutral-100">
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Company Name *">
          <FormInput placeholder="e.g. Acme Corp" value={form.company} onChange={set("company")} />
        </FieldGroup>
        <FieldGroup label="Contact Name *">
          <FormInput placeholder="Full name" value={form.contactName} onChange={set("contactName")} />
        </FieldGroup>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <FieldGroup label="Contact Email *">
          <FormInput placeholder="partner@example.com" type="email" value={form.contactEmail} onChange={set("contactEmail")} />
        </FieldGroup>
        <FieldGroup label="Country *">
          <FormSelect placeholder="Select country" options={COUNTRIES} value={form.country} onChange={set("country")} />
        </FieldGroup>
      </div>
      <FieldGroup label="Max Customers">
        <FormInput placeholder="Leave blank for unlimited" type="number" value={form.maxCustomers} onChange={set("maxCustomers")} />
      </FieldGroup>
      <div className="flex justify-end gap-2 pt-1">
        <Btn variant="ghost" onClick={clear}>Clear</Btn>
        <Btn disabled={!valid}><Plus className="w-3.5 h-3.5" /> Invite Partner</Btn>
      </div>
    </div>
  );
}

// ─── Partners page ────────────────────────────────────────────────────────────

export function PartnersPage() {
  return (
    <div className="flex flex-col gap-6">

      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {STATS.map((d) => <StatCard key={d.label} d={d} />)}
      </div>

      {/* Invite Partner accordion */}
      <SectionCard>
        <Accordion type="single" collapsible defaultValue="invite">
          <AccordionItem value="invite" className="border-b-0">
            <AccordionTrigger
              className={cn(
                "px-5 py-4 text-[13px] font-semibold text-neutral-800 hover:no-underline hover:bg-neutral-50/60 transition-colors",
                "[&[data-state=open]>svg]:rotate-180",
              )}
            >
              <span className="flex flex-col items-start gap-0.5">
                <span className="text-[13px] font-semibold text-neutral-800">Invite New Partner</span>
                <span className="text-[11px] font-normal text-neutral-400">Onboard a new partner organisation to the marketplace</span>
              </span>
            </AccordionTrigger>
            <AccordionContent className="pb-0">
              <InvitePartnerForm />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </SectionCard>

      {/* Partners table */}
      <SectionCard>
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-neutral-100">
          <div>
            <h2 className="text-[13px] font-semibold text-neutral-800">Partners</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">{PARTNERS.length} registered organisations</p>
          </div>
          <button className="p-1.5 rounded-[4px] border border-neutral-200 text-neutral-400 hover:text-neutral-600 transition-colors">
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <DataGrid<PartnerRow>
          searchable
          searchPlaceholder="Search partners…"
          columns={[
            {
              key: "company",
              header: "Company Name",
              render: (row, hov) => <InterCell hovered={hov} isPrimary fontSize={12}>{row.company}</InterCell>,
            },
            {
              key: "accountNumber",
              header: "Account Number",
              width: "160px",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.accountNumber}</MonoCell>,
            },
            {
              key: "contactEmail",
              header: "Contact Email",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.contactEmail}</MonoCell>,
            },
            {
              key: "contactName",
              header: "Contact Name",
              width: "140px",
              render: (row, hov) => <InterCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.contactName}</InterCell>,
            },
            {
              key: "country",
              header: "Country",
              width: "130px",
              render: (row, hov) => <InterCell hovered={hov} fontSize={11} color="#64748B" hoveredColor="#334155">{row.country}</InterCell>,
            },
            {
              key: "customers",
              header: "Customers",
              width: "90px",
              align: "right",
              render: (row, hov) => (
                <MonoCell hovered={hov} fontSize={11}
                  color={row.customers === 0 ? "#0284C7" : "#0F172A"}
                  hoveredColor="#0F172A">
                  {row.customers}
                </MonoCell>
              ),
            },
            {
              key: "maxCustomers",
              header: "Max Customers",
              width: "110px",
              align: "right",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={11}>{row.maxCustomers}</MonoCell>,
            },
            {
              key: "status",
              header: "Status",
              width: "100px",
              render: (row) => (
                <StatusCapsule
                  status={STATUS_KEY[row.status]}
                  label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                />
              ),
            },
            {
              key: "onboarded",
              header: "Onboarded",
              width: "160px",
              align: "right",
              render: (row, hov) => <MonoCell hovered={hov} fontSize={10} color="#94A3B8" hoveredColor="#475569">{row.onboarded}</MonoCell>,
            },
            {
              key: "actions",
              header: "",
              width: "80px",
              align: "right",
              render: (_, hov) => (
                <GridActions visible={hov}>
                  <GridActionButton title="Edit" hoverColor={TEAL}><Pencil className="w-3 h-3" /></GridActionButton>
                  <GridActionButton title="Delete" hoverColor="#E7000B"><Trash2 className="w-3 h-3" /></GridActionButton>
                </GridActions>
              ),
            },
          ]}
          data={PARTNERS}
        />
      </SectionCard>

    </div>
  );
}
